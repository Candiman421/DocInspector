#!/usr/bin/env node

// ============================================================================
// ADHOC BATCH PROCESSOR
// Process multiple Claude response configurations in sequence
// Location: root/Utils/AdHoc/batch-processor.js
// ============================================================================

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import ClaudeResponseMerger from './claude-merger.js';
import ConfigValidator from './config-validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class BatchProcessor {
    constructor(options = {}) {
        this.options = options;
        this.dryRun = options.dryRun || false;
        this.verbose = options.verbose || false;
        this.stopOnError = options.stopOnError !== false; // Default true
        this.validateFirst = options.validateFirst !== false; // Default true
    }

    /**
     * Process multiple configuration files
     */
    async processBatch(configFiles) {
        console.log(chalk.cyan('🚀 Starting Batch Processing...'));
        
        if (!Array.isArray(configFiles) || configFiles.length === 0) {
            throw new Error('No configuration files provided');
        }

        const results = {
            totalConfigs: configFiles.length,
            successful: 0,
            failed: 0,
            skipped: 0,
            configurations: [],
            startTime: Date.now(),
            endTime: null
        };

        // Pre-flight validation if enabled
        if (this.validateFirst) {
            console.log(chalk.yellow('\n🔍 Pre-flight validation phase...'));
            const validationResults = await this.validateAllConfigs(configFiles);
            
            if (validationResults.hasErrors && this.stopOnError) {
                console.log(chalk.red('\n❌ Validation errors found. Fix errors before proceeding.'));
                return validationResults;
            }
        }

        // Process each configuration
        console.log(chalk.yellow('\n⚙️  Processing configurations...'));
        
        for (let i = 0; i < configFiles.length; i++) {
            const configFile = configFiles[i];
            const configName = path.basename(configFile);
            
            console.log(chalk.blue(`\n📋 [${i + 1}/${configFiles.length}] Processing: ${configName}`));
            
            try {
                const result = await this.processConfiguration(configFile, i + 1);
                results.configurations.push(result);
                
                if (result.success) {
                    results.successful++;
                    console.log(chalk.green(`   ✅ ${configName} completed successfully`));
                } else {
                    results.failed++;
                    console.log(chalk.red(`   ❌ ${configName} failed: ${result.error}`));
                    
                    if (this.stopOnError) {
                        console.log(chalk.yellow('   🛑 Stopping batch processing due to error'));
                        break;
                    }
                }
                
            } catch (error) {
                results.failed++;
                results.configurations.push({
                    config: configFile,
                    success: false,
                    error: error.message,
                    skipped: false
                });
                
                console.log(chalk.red(`   ❌ ${configName} failed: ${error.message}`));
                
                if (this.stopOnError) {
                    console.log(chalk.yellow('   🛑 Stopping batch processing due to error'));
                    break;
                }
            }
        }

        results.endTime = Date.now();
        this.showBatchSummary(results);
        
        return results;
    }

    /**
     * Validate all configurations before processing
     */
    async validateAllConfigs(configFiles) {
        const validator = new ConfigValidator({ verbose: this.verbose });
        const validationResults = {
            configs: [],
            hasErrors: false,
            hasWarnings: false
        };

        for (const configFile of configFiles) {
            try {
                const configPath = this.resolveConfigPath(configFile);
                const config = await import(configPath);
                const validation = await validator.validateConfig(config.default || config);
                
                validationResults.configs.push({
                    file: configFile,
                    validation,
                    valid: validation.valid
                });

                if (!validation.valid) {
                    validationResults.hasErrors = true;
                }
                
                if (validation.warnings.length > 0) {
                    validationResults.hasWarnings = true;
                }

            } catch (error) {
                validationResults.configs.push({
                    file: configFile,
                    validation: null,
                    valid: false,
                    error: error.message
                });
                validationResults.hasErrors = true;
            }
        }

        // Report validation summary
        const validCount = validationResults.configs.filter(c => c.valid).length;
        const invalidCount = validationResults.configs.length - validCount;

        console.log(chalk.cyan(`   📊 Validation complete: ${validCount} valid, ${invalidCount} invalid`));

        if (validationResults.hasErrors) {
            console.log(chalk.red('\n❌ Configuration errors found:'));
            validationResults.configs.forEach(config => {
                if (!config.valid) {
                    console.log(chalk.red(`   • ${config.file}: ${config.error || 'Invalid configuration'}`));
                }
            });
        }

        if (validationResults.hasWarnings) {
            console.log(chalk.yellow('\n⚠️  Configuration warnings:'));
            validationResults.configs.forEach(config => {
                if (config.validation && config.validation.warnings.length > 0) {
                    console.log(chalk.yellow(`   • ${config.file}: ${config.validation.warnings.length} warnings`));
                }
            });
        }

        return validationResults;
    }

    /**
     * Process a single configuration
     */
    async processConfiguration(configFile, index) {
        const result = {
            config: configFile,
            index,
            success: false,
            error: null,
            skipped: false,
            operationResults: [],
            startTime: Date.now(),
            endTime: null
        };

        try {
            const configPath = this.resolveConfigPath(configFile);
            
            if (!fs.existsSync(configPath)) {
                throw new Error(`Configuration file not found: ${configPath}`);
            }

            // Load configuration
            const config = await import(configPath);
            const configData = config.default || config;

            // Process with merger
            const merger = new ClaudeResponseMerger({
                dryRun: this.dryRun,
                verbose: this.verbose
            });

            const mergerResults = await merger.processClaudeResponse(configData);
            
            result.operationResults = mergerResults.operations;
            result.success = mergerResults.failed === 0;
            
            if (!result.success) {
                result.error = `${mergerResults.failed} operations failed`;
            }

        } catch (error) {
            result.error = error.message;
        }

        result.endTime = Date.now();
        return result;
    }

    /**
     * Process configurations from a directory
     */
    async processDirectory(dirPath) {
        const configDir = path.resolve(__dirname, dirPath);
        
        if (!fs.existsSync(configDir)) {
            throw new Error(`Directory not found: ${configDir}`);
        }

        const files = fs.readdirSync(configDir);
        const configFiles = files
            .filter(file => file.endsWith('.js') && file !== 'index.js')
            .map(file => path.join(dirPath, file))
            .sort(); // Process in alphabetical order

        if (configFiles.length === 0) {
            throw new Error(`No configuration files found in ${dirPath}`);
        }

        console.log(chalk.blue(`📁 Found ${configFiles.length} configuration files in ${dirPath}`));
        
        return await this.processBatch(configFiles);
    }

    /**
     * Process configurations with dependencies
     */
    async processWithDependencies(configMap) {
        console.log(chalk.cyan('🔗 Processing configurations with dependencies...'));

        // Build dependency graph
        const graph = this.buildDependencyGraph(configMap);
        
        // Get processing order
        const processingOrder = this.getProcessingOrder(graph);
        
        console.log(chalk.blue(`📋 Processing order: ${processingOrder.join(' → ')}`));

        // Process in dependency order
        const results = await this.processBatch(processingOrder.map(name => configMap[name]));
        
        return results;
    }

    /**
     * Build dependency graph from config map
     */
    buildDependencyGraph(configMap) {
        const graph = {};
        
        Object.entries(configMap).forEach(([name, configFile]) => {
            graph[name] = {
                file: configFile,
                dependencies: [],
                dependents: []
            };
        });

        // For now, this is a simple implementation
        // In a more complex version, you could parse dependencies from config files
        
        return graph;
    }

    /**
     * Get processing order using topological sort
     */
    getProcessingOrder(graph) {
        const order = [];
        const visited = new Set();
        const visiting = new Set();

        const visit = (node) => {
            if (visiting.has(node)) {
                throw new Error(`Circular dependency detected involving ${node}`);
            }
            
            if (visited.has(node)) {
                return;
            }

            visiting.add(node);
            
            graph[node].dependencies.forEach(dep => {
                visit(dep);
            });
            
            visiting.delete(node);
            visited.add(node);
            order.push(node);
        };

        Object.keys(graph).forEach(node => {
            if (!visited.has(node)) {
                visit(node);
            }
        });

        return order;
    }

    /**
     * Create a batch configuration from individual configs
     */
    createBatchConfig(configFiles, outputFile) {
        console.log(chalk.cyan('📦 Creating batch configuration...'));

        const batchConfig = {
            description: `Batch configuration created from ${configFiles.length} individual configs`,
            batch: true,
            createdAt: new Date().toISOString(),
            operations: []
        };

        let priority = 1;

        configFiles.forEach((configFile, index) => {
            try {
                const configPath = this.resolveConfigPath(configFile);
                const config = require(configPath);
                const configData = config.default || config;

                if (configData.operations) {
                    configData.operations.forEach(op => {
                        batchConfig.operations.push({
                            ...op,
                            priority: priority++,
                            sourceConfig: path.basename(configFile),
                            batchIndex: index
                        });
                    });
                }

            } catch (error) {
                console.log(chalk.yellow(`   ⚠️  Could not load ${configFile}: ${error.message}`));
            }
        });

        // Write batch config
        const outputPath = path.resolve(__dirname, outputFile);
        const content = `// Batch configuration generated at ${new Date().toISOString()}
export default ${JSON.stringify(batchConfig, null, 4)};`;

        fs.writeFileSync(outputPath, content, 'utf8');
        
        console.log(chalk.green(`✅ Batch configuration created: ${outputFile}`));
        console.log(chalk.blue(`   📊 ${batchConfig.operations.length} operations from ${configFiles.length} configs`));

        return outputPath;
    }

    /**
     * Helper methods
     */

    resolveConfigPath(configFile) {
        if (path.isAbsolute(configFile)) {
            return configFile;
        }
        return path.resolve(__dirname, configFile);
    }

    showBatchSummary(results) {
        const duration = results.endTime - results.startTime;
        
        console.log(chalk.cyan('\n╔════════════════════════════════════════════════════════════════╗'));
        console.log(chalk.cyan('║                    BATCH PROCESSING SUMMARY                   ║'));
        console.log(chalk.cyan('╚════════════════════════════════════════════════════════════════╝'));
        
        console.log(chalk.green(`✅ Successful: ${results.successful}`));
        console.log(chalk.red(`❌ Failed: ${results.failed}`));
        console.log(chalk.yellow(`⏭️  Skipped: ${results.skipped}`));
        console.log(chalk.blue(`⏱️  Duration: ${duration}ms`));
        
        const successRate = results.totalConfigs > 0 ? 
            Math.round((results.successful / results.totalConfigs) * 100) : 0;
        console.log(chalk.blue(`📊 Success rate: ${successRate}%`));

        if (this.verbose && results.configurations.length > 0) {
            console.log(chalk.cyan('\n📋 Configuration Details:'));
            results.configurations.forEach((config, index) => {
                const status = config.success ? chalk.green('✅') : chalk.red('❌');
                const duration = config.endTime - config.startTime;
                console.log(`   ${status} ${path.basename(config.config)} (${duration}ms)`);
                
                if (!config.success && config.error) {
                    console.log(chalk.gray(`      Error: ${config.error}`));
                }
            });
        }

        if (results.failed === 0) {
            console.log(chalk.green('\n🎉 All configurations processed successfully!'));
        } else if (results.successful > 0) {
            console.log(chalk.yellow('\n⚠️  Some configurations failed. Check individual results above.'));
        } else {
            console.log(chalk.red('\n💥 All configurations failed. Check errors above.'));
        }
    }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const command = process.argv[2];
    const dryRun = process.argv.includes('--dry-run');
    const verbose = process.argv.includes('--verbose');
    const continueOnError = process.argv.includes('--continue-on-error');
    const skipValidation = process.argv.includes('--skip-validation');

    const processor = new BatchProcessor({
        dryRun,
        verbose,
        stopOnError: !continueOnError,
        validateFirst: !skipValidation
    });

    try {
        switch (command) {
            case 'process':
                {
                    const configs = process.argv.slice(3).filter(arg => !arg.startsWith('--'));
                    if (configs.length === 0) {
                        console.log(chalk.red('❌ No configuration files specified'));
                        console.log(chalk.blue('Usage: node batch-processor.js process config1.js config2.js ...'));
                        process.exit(1);
                    }
                    await processor.processBatch(configs);
                }
                break;

            case 'directory':
                {
                    const dirPath = process.argv[3] || './configs';
                    await processor.processDirectory(dirPath);
                }
                break;

            case 'create-batch':
                {
                    const configs = process.argv.slice(4).filter(arg => !arg.startsWith('--'));
                    const outputFile = process.argv[3] || 'batch-config.js';
                    
                    if (configs.length === 0) {
                        console.log(chalk.red('❌ No configuration files specified'));
                        console.log(chalk.blue('Usage: node batch-processor.js create-batch output.js config1.js config2.js ...'));
                        process.exit(1);
                    }
                    
                    processor.createBatchConfig(configs, outputFile);
                }
                break;

            case 'help':
            default:
                console.log(chalk.cyan('AdHoc Batch Processor\n'));
                console.log(chalk.white('Commands:'));
                console.log(chalk.blue('  process <config1> <config2> ...    ') + chalk.gray('Process multiple configurations'));
                console.log(chalk.blue('  directory [dir]                    ') + chalk.gray('Process all configs in directory'));
                console.log(chalk.blue('  create-batch <output> <configs...> ') + chalk.gray('Create batch configuration'));
                console.log(chalk.blue('  help                               ') + chalk.gray('Show this help'));
                console.log('');
                console.log(chalk.white('Options:'));
                console.log(chalk.yellow('  --dry-run              ') + chalk.gray('Show what would be processed'));
                console.log(chalk.yellow('  --verbose              ') + chalk.gray('Show detailed progress'));
                console.log(chalk.yellow('  --continue-on-error    ') + chalk.gray('Continue if a config fails'));
                console.log(chalk.yellow('  --skip-validation      ') + chalk.gray('Skip pre-flight validation'));
                console.log('');
                console.log(chalk.white('Examples:'));
                console.log(chalk.gray('  node batch-processor.js process fix1.js fix2.js fix3.js'));
                console.log(chalk.gray('  node batch-processor.js directory ./my-configs'));
                console.log(chalk.gray('  node batch-processor.js create-batch all-fixes.js fix*.js'));
                break;
        }
    } catch (error) {
        console.error(chalk.red(`💥 Error: ${error.message}`));
        if (verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

export default BatchProcessor;