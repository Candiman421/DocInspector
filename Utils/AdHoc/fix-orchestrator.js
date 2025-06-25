#!/usr/bin/env node

// ============================================================================
// DOCDOM MODULE FIX ORCHESTRATOR
// Automated system for fixing registration issues and updating functions
// ============================================================================

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { Command } from 'commander';
import { fileURLToPath } from 'url';

// Import our fix system components
import { loadFixConfiguration } from './fix-config.js';
import { FileProcessor } from './file-processor.js';
import { FunctionAnalyzer } from './function-analyzer.js';
import { ValidationRunner } from './validation-runner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

// CLI Configuration
program
    .name('docdom-fix-orchestrator')
    .description('Automated DocDom module fixing system')
    .version('1.0.0')
    .option('-c, --config <path>', 'Custom configuration file path', './fix-config.js')
    .option('-d, --dry-run', 'Show what would be changed without making changes')
    .option('-v, --verbose', 'Show detailed progress')
    .option('-b, --backup', 'Create backup files before making changes')
    .option('--skip-validation', 'Skip post-fix validation')
    .option('--skip-duplicates', 'Skip duplicate function analysis')
    .option('--target-folder <path>', 'Target folder containing modules')
    .parse();

const options = program.opts();

/**
 * Main orchestration function
 */
async function main() {
    try {
        showHeader();
        
        // Load configuration
        const config = await loadFixConfiguration(options.config);
        console.log(chalk.green(`✅ Configuration loaded: ${config.operations.length} operations planned`));
        
        // Initialize processors
        const fileProcessor = new FileProcessor(options);
        const functionAnalyzer = new FunctionAnalyzer(options);
        const validationRunner = new ValidationRunner(options);
        
        // Discover target files
        const targetFolder = options.targetFolder || config.defaultTargetFolder || '../DocDomV4.1';
        const moduleFiles = discoverModuleFiles(targetFolder);
        
        console.log(chalk.cyan(`📁 Found ${moduleFiles.length} module files in ${targetFolder}`));
        
        // Phase 1: Analyze existing functions for duplicates
        if (!options.skipDuplicates) {
            console.log(chalk.yellow('\n🔍 Phase 1: Analyzing functions for duplicates...'));
            const duplicateAnalysis = await functionAnalyzer.analyzeDuplicates(moduleFiles);
            
            if (duplicateAnalysis.duplicatesFound > 0) {
                console.log(chalk.yellow(`⚠️  Found ${duplicateAnalysis.duplicatesFound} duplicate function sets`));
                
                if (!options.dryRun) {
                    const consolidationPlan = await functionAnalyzer.createConsolidationPlan(duplicateAnalysis);
                    await fileProcessor.executeFunctionConsolidation(consolidationPlan);
                }
            } else {
                console.log(chalk.green('✅ No duplicate functions found'));
            }
        }
        
        // Phase 2: Execute planned fixes
        console.log(chalk.yellow('\n🔧 Phase 2: Executing planned fixes...'));
        
        const results = {
            successful: 0,
            failed: 0,
            skipped: 0,
            operations: []
        };
        
        for (const operation of config.operations) {
            console.log(chalk.blue(`\n📋 Processing: ${operation.type} on ${operation.targetFile || 'multiple files'}`));
            
            try {
                const result = await executeOperation(operation, fileProcessor, moduleFiles);
                results.operations.push(result);
                
                if (result.success) {
                    results.successful++;
                    console.log(chalk.green(`   ✅ ${result.message}`));
                } else {
                    results.failed++;
                    console.log(chalk.red(`   ❌ ${result.message}`));
                }
                
                if (options.verbose && result.details) {
                    console.log(chalk.gray(`   📝 ${result.details}`));
                }
                
            } catch (error) {
                results.failed++;
                console.log(chalk.red(`   ❌ Error: ${error.message}`));
                results.operations.push({
                    operation: operation.type,
                    success: false,
                    error: error.message
                });
            }
        }
        
        // Phase 3: Validation
        if (!options.skipValidation && !options.dryRun) {
            console.log(chalk.yellow('\n✅ Phase 3: Validating fixes...'));
            const validationResults = await validationRunner.validateAllModules(moduleFiles);
            
            console.log(chalk.cyan(`\n📊 Validation Results:`));
            console.log(chalk.green(`   ✅ Modules passing: ${validationResults.passing.length}`));
            console.log(chalk.red(`   ❌ Modules failing: ${validationResults.failing.length}`));
            
            if (validationResults.failing.length > 0) {
                console.log(chalk.yellow('\n⚠️  Modules needing attention:'));
                validationResults.failing.forEach(failure => {
                    console.log(chalk.red(`   • ${failure.module}: ${failure.reason}`));
                });
            }
        }
        
        // Final summary
        showSummary(results);
        
    } catch (error) {
        console.error(chalk.red(`\n💥 Fatal error: ${error.message}`));
        process.exit(1);
    }
}

/**
 * Execute a single operation
 */
async function executeOperation(operation, fileProcessor, moduleFiles) {
    const result = {
        operation: operation.type,
        targetFile: operation.targetFile,
        success: false,
        message: '',
        details: ''
    };
    
    try {
        switch (operation.type) {
            case 'simple_replace':
                return await fileProcessor.executeSimpleReplace(operation);
                
            case 'function_replace':
                return await fileProcessor.executeFunctionReplace(operation);
                
            case 'function_insert':
                return await fileProcessor.executeFunctionInsert(operation);
                
            case 'regex_fix':
                return await fileProcessor.executeRegexFix(operation);
                
            case 'bulk_replace':
                return await fileProcessor.executeBulkReplace(operation, moduleFiles);
                
            default:
                throw new Error(`Unknown operation type: ${operation.type}`);
        }
        
    } catch (error) {
        result.message = `Failed: ${error.message}`;
        return result;
    }
}

/**
 * Discover module files in target folder
 */
function discoverModuleFiles(targetFolder) {
    const MODULE_PATTERN = /^(\d+(?:\.\d+)*)_.*\.jsx?$/;
    
    if (!fs.existsSync(targetFolder)) {
        throw new Error(`Target folder not found: ${targetFolder}`);
    }
    
    const files = fs.readdirSync(targetFolder);
    const moduleFiles = files
        .filter(file => MODULE_PATTERN.test(file))
        .map(file => ({
            filename: file,
            fullPath: path.join(targetFolder, file),
            version: file.match(MODULE_PATTERN)[1]
        }))
        .sort((a, b) => {
            // Sort by version numbers
            const aVersion = a.version.split('.').map(Number);
            const bVersion = b.version.split('.').map(Number);
            
            for (let i = 0; i < Math.max(aVersion.length, bVersion.length); i++) {
                const aPart = aVersion[i] || 0;
                const bPart = bVersion[i] || 0;
                if (aPart !== bPart) return aPart - bPart;
            }
            return 0;
        });
    
    return moduleFiles;
}

/**
 * Show application header
 */
function showHeader() {
    console.log(chalk.cyan('╔════════════════════════════════════════════════════════════════╗'));
    console.log(chalk.cyan('║                DocDom Module Fix Orchestrator                 ║'));
    console.log(chalk.cyan('║              Automated Registration & Function Fixes          ║'));
    console.log(chalk.cyan('╚════════════════════════════════════════════════════════════════╝'));
    
    if (options.dryRun) {
        console.log(chalk.yellow('\n🔍 DRY RUN MODE - No files will be modified\n'));
    }
    
    if (options.backup) {
        console.log(chalk.blue('💾 Backup mode enabled - Original files will be preserved\n'));
    }
}

/**
 * Show final summary
 */
function showSummary(results) {
    console.log(chalk.cyan('\n╔════════════════════════════════════════════════════════════════╗'));
    console.log(chalk.cyan('║                        FINAL SUMMARY                          ║'));
    console.log(chalk.cyan('╚════════════════════════════════════════════════════════════════╝'));
    
    console.log(chalk.green(`✅ Successful operations: ${results.successful}`));
    console.log(chalk.red(`❌ Failed operations: ${results.failed}`));
    console.log(chalk.yellow(`⏭️  Skipped operations: ${results.skipped}`));
    
    const total = results.successful + results.failed + results.skipped;
    const successRate = total > 0 ? Math.round((results.successful / total) * 100) : 0;
    
    console.log(chalk.blue(`📊 Success rate: ${successRate}%`));
    
    if (results.failed > 0) {
        console.log(chalk.yellow('\n⚠️  Some operations failed. Check the log above for details.'));
        console.log(chalk.blue('💡 You may need to manually review and fix remaining issues.'));
    } else {
        console.log(chalk.green('\n🎉 All operations completed successfully!'));
        if (!options.skipValidation) {
            console.log(chalk.blue('🔍 Run the analysis system to verify improvements:'));
            console.log(chalk.white('   node main-system-analyzer.js --verbose'));
        }
    }
}

// Run the orchestrator
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    main().catch(error => {
        console.error(chalk.red(`💥 Unhandled error: ${error.message}`));
        if (options.verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    });
}

export { main, executeOperation, discoverModuleFiles };