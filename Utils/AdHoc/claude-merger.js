#!/usr/bin/env node

// ============================================================================
// ADHOC CLAUDE RESPONSE MERGER
// Automatically merge Claude-provided code updates into correct files
// Location: root/Utils/AdHoc/claude-merger.js
// ============================================================================

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base project root (up from Utils/AdHoc/)
const PROJECT_ROOT = path.resolve(__dirname, '../../');

export class ClaudeResponseMerger {
    constructor(options = {}) {
        this.projectRoot = options.projectRoot || PROJECT_ROOT;
        this.verbose = options.verbose || false;
        this.dryRun = options.dryRun || false;
    }

    /**
     * Process a Claude response configuration
     * @param {Object} config - Claude response configuration
     */
    async processClaudeResponse(config) {
        console.log(chalk.cyan('🤖 Processing Claude Response...'));
        
        if (!config.operations || !Array.isArray(config.operations)) {
            throw new Error('Invalid config: operations array required');
        }

        const results = {
            successful: 0,
            failed: 0,
            operations: []
        };

        // Sort operations by priority (if specified)
        const sortedOps = config.operations.sort((a, b) => (a.priority || 999) - (b.priority || 999));

        for (const operation of sortedOps) {
            console.log(chalk.blue(`\n📝 ${operation.action} in ${operation.targetFile}`));
            
            try {
                const result = await this.executeOperation(operation);
                results.operations.push(result);
                
                if (result.success) {
                    results.successful++;
                    console.log(chalk.green(`   ✅ ${result.message}`));
                } else {
                    results.failed++;
                    console.log(chalk.red(`   ❌ ${result.message}`));
                }
                
            } catch (error) {
                results.failed++;
                console.log(chalk.red(`   ❌ Error: ${error.message}`));
                results.operations.push({
                    action: operation.action,
                    success: false,
                    error: error.message
                });
            }
        }

        this.showSummary(results);
        return results;
    }

    /**
     * Execute a single operation
     */
    async executeOperation(operation) {
        const { action, targetFile } = operation;
        const filePath = this.resolveFilePath(targetFile);

        switch (action) {
            case 'REPLACE_FUNCTION':
                return await this.replaceFunction(filePath, operation);
                
            case 'INSERT_FUNCTION_AFTER':
                return await this.insertFunctionAfter(filePath, operation);
                
            case 'INSERT_FUNCTION_BEFORE':
                return await this.insertFunctionBefore(filePath, operation);
                
            case 'UPDATE_FILE_TOP':
                return await this.updateFileTop(filePath, operation);
                
            case 'UPDATE_FILE_BOTTOM':
                return await this.updateFileBottom(filePath, operation);
                
            case 'SIMPLE_REPLACE':
                return await this.simpleReplace(filePath, operation);
                
            case 'UPDATE_EXPORTS':
                return await this.updateExports(filePath, operation);
                
            default:
                throw new Error(`Unknown action: ${action}`);
        }
    }

    /**
     * Replace an entire function
     */
    async replaceFunction(filePath, operation) {
        const { functionName, newFunction, description } = operation;
        
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const content = fs.readFileSync(filePath, 'utf8');
        
        // Find the function with its JSDoc comments
        const functionPattern = this.buildFunctionPattern(functionName);
        const match = content.match(functionPattern);
        
        if (!match) {
            throw new Error(`Function '${functionName}' not found in ${path.basename(filePath)}`);
        }

        const newContent = content.replace(functionPattern, newFunction.trim());

        if (this.dryRun) {
            return {
                action: 'REPLACE_FUNCTION',
                success: true,
                message: `Would replace function '${functionName}'`,
                details: description
            };
        }

        fs.writeFileSync(filePath, newContent, 'utf8');
        
        return {
            action: 'REPLACE_FUNCTION',
            success: true,
            message: `Replaced function '${functionName}'`,
            details: description
        };
    }

    /**
     * Insert function after another function
     */
    async insertFunctionAfter(filePath, operation) {
        const { afterFunction, newFunction, description } = operation;
        
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const content = fs.readFileSync(filePath, 'utf8');
        
        // Find the anchor function
        const anchorPattern = this.buildFunctionPattern(afterFunction);
        const match = content.match(anchorPattern);
        
        if (!match) {
            throw new Error(`Anchor function '${afterFunction}' not found in ${path.basename(filePath)}`);
        }

        // Insert after the complete function
        const insertionPoint = match.index + match[0].length;
        const newContent = content.slice(0, insertionPoint) + 
                          '\n\n' + newFunction.trim() + 
                          content.slice(insertionPoint);

        if (this.dryRun) {
            return {
                action: 'INSERT_FUNCTION_AFTER',
                success: true,
                message: `Would insert function after '${afterFunction}'`,
                details: description
            };
        }

        fs.writeFileSync(filePath, newContent, 'utf8');
        
        return {
            action: 'INSERT_FUNCTION_AFTER',
            success: true,
            message: `Inserted function after '${afterFunction}'`,
            details: description
        };
    }

    /**
     * Insert function before another function
     */
    async insertFunctionBefore(filePath, operation) {
        const { beforeFunction, newFunction, description } = operation;
        
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const content = fs.readFileSync(filePath, 'utf8');
        
        // Find the anchor function
        const anchorPattern = this.buildFunctionPattern(beforeFunction);
        const match = content.match(anchorPattern);
        
        if (!match) {
            throw new Error(`Anchor function '${beforeFunction}' not found in ${path.basename(filePath)}`);
        }

        // Insert before the function (including its JSDoc)
        const insertionPoint = match.index;
        const newContent = content.slice(0, insertionPoint) + 
                          newFunction.trim() + '\n\n' +
                          content.slice(insertionPoint);

        if (this.dryRun) {
            return {
                action: 'INSERT_FUNCTION_BEFORE',
                success: true,
                message: `Would insert function before '${beforeFunction}'`,
                details: description
            };
        }

        fs.writeFileSync(filePath, newContent, 'utf8');
        
        return {
            action: 'INSERT_FUNCTION_BEFORE',
            success: true,
            message: `Inserted function before '${beforeFunction}'`,
            details: description
        };
    }

    /**
     * Update top of file (imports, headers, etc.)
     */
    async updateFileTop(filePath, operation) {
        const { newContent, stopBeforeFunction, description } = operation;
        
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const content = fs.readFileSync(filePath, 'utf8');
        
        let splitPoint;
        if (stopBeforeFunction) {
            // Find the specified function and stop before it
            const functionPattern = this.buildFunctionPattern(stopBeforeFunction);
            const match = content.match(functionPattern);
            
            if (!match) {
                throw new Error(`Stop function '${stopBeforeFunction}' not found`);
            }
            
            splitPoint = match.index;
        } else {
            // Default: stop at first function
            const firstFunctionMatch = content.match(/(?:\/\*\*[\s\S]*?\*\/\s*)?(?:export\s+)?(?:const\s+|function\s+|var\s+)/);
            splitPoint = firstFunctionMatch ? firstFunctionMatch.index : content.length;
        }

        const updatedContent = newContent.trim() + '\n\n' + content.slice(splitPoint);

        if (this.dryRun) {
            return {
                action: 'UPDATE_FILE_TOP',
                success: true,
                message: `Would update file top (${newContent.split('\n').length} lines)`,
                details: description
            };
        }

        fs.writeFileSync(filePath, updatedContent, 'utf8');
        
        return {
            action: 'UPDATE_FILE_TOP',
            success: true,
            message: `Updated file top (${newContent.split('\n').length} lines)`,
            details: description
        };
    }

    /**
     * Update bottom of file (exports, etc.)
     */
    async updateFileBottom(filePath, operation) {
        const { newContent, startAfterFunction, description } = operation;
        
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const content = fs.readFileSync(filePath, 'utf8');
        
        let splitPoint;
        if (startAfterFunction) {
            // Find the specified function and start after it
            const functionPattern = this.buildFunctionPattern(startAfterFunction);
            const match = content.match(functionPattern);
            
            if (!match) {
                throw new Error(`Start function '${startAfterFunction}' not found`);
            }
            
            splitPoint = match.index + match[0].length;
        } else {
            // Default: replace everything after last function
            const allFunctions = [...content.matchAll(/(?:\/\*\*[\s\S]*?\*\/\s*)?(?:export\s+)?(?:const\s+|function\s+)([a-zA-Z_$][a-zA-Z0-9_$]*)/g)];
            if (allFunctions.length > 0) {
                const lastFunction = allFunctions[allFunctions.length - 1];
                const lastFunctionPattern = this.buildFunctionPattern(lastFunction[1]);
                const lastMatch = content.match(lastFunctionPattern);
                splitPoint = lastMatch ? lastMatch.index + lastMatch[0].length : content.length;
            } else {
                splitPoint = content.length;
            }
        }

        const updatedContent = content.slice(0, splitPoint) + '\n\n' + newContent.trim();

        if (this.dryRun) {
            return {
                action: 'UPDATE_FILE_BOTTOM',
                success: true,
                message: `Would update file bottom (${newContent.split('\n').length} lines)`,
                details: description
            };
        }

        fs.writeFileSync(filePath, updatedContent, 'utf8');
        
        return {
            action: 'UPDATE_FILE_BOTTOM',
            success: true,
            message: `Updated file bottom (${newContent.split('\n').length} lines)`,
            details: description
        };
    }

    /**
     * Simple find/replace operation
     */
    async simpleReplace(filePath, operation) {
        const { find, replace, description } = operation;
        
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const content = fs.readFileSync(filePath, 'utf8');
        
        if (!content.includes(find)) {
            return {
                action: 'SIMPLE_REPLACE',
                success: true,
                message: `Pattern not found (already fixed or changed)`,
                details: `Searched for: "${find}"`
            };
        }

        const newContent = content.replace(new RegExp(this.escapeRegex(find), 'g'), replace);
        const replacements = (content.match(new RegExp(this.escapeRegex(find), 'g')) || []).length;

        if (this.dryRun) {
            return {
                action: 'SIMPLE_REPLACE',
                success: true,
                message: `Would replace ${replacements} occurrence(s)`,
                details: description
            };
        }

        fs.writeFileSync(filePath, newContent, 'utf8');
        
        return {
            action: 'SIMPLE_REPLACE',
            success: true,
            message: `Replaced ${replacements} occurrence(s)`,
            details: description
        };
    }

    /**
     * Update exports at end of file
     */
    async updateExports(filePath, operation) {
        const { newExports, description } = operation;
        
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const content = fs.readFileSync(filePath, 'utf8');
        
        // Find existing export statement
        const exportPattern = /export\s+default\s+{[\s\S]*?};?\s*$/;
        const match = content.match(exportPattern);
        
        let newContent;
        if (match) {
            // Replace existing exports
            newContent = content.replace(exportPattern, newExports.trim());
        } else {
            // Add exports at end
            newContent = content.trim() + '\n\n' + newExports.trim();
        }

        if (this.dryRun) {
            return {
                action: 'UPDATE_EXPORTS',
                success: true,
                message: `Would update exports`,
                details: description
            };
        }

        fs.writeFileSync(filePath, newContent, 'utf8');
        
        return {
            action: 'UPDATE_EXPORTS',
            success: true,
            message: `Updated exports`,
            details: description
        };
    }

    /**
     * Helper methods
     */

    buildFunctionPattern(functionName) {
        // Matches function with optional JSDoc comments and various declaration styles
        return new RegExp(
            `(?:\\/\\*\\*[\\s\\S]*?\\*\\/\\s*)?` +  // Optional JSDoc
            `(?:export\\s+)?` +                      // Optional export
            `(?:const\\s+${functionName}\\s*=\\s*(?:function\\s*)?\\([^)]*\\)\\s*[=>]?\\s*{[\\s\\S]*?^}|` + // const func = 
            `function\\s+${functionName}\\s*\\([^)]*\\)\\s*{[\\s\\S]*?^})`,  // function func()
            'gm'
        );
    }

    resolveFilePath(targetFile) {
        if (path.isAbsolute(targetFile)) {
            return targetFile;
        }
        
        // Resolve relative to project root
        return path.resolve(this.projectRoot, targetFile);
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    showSummary(results) {
        console.log(chalk.cyan('\n╔════════════════════════════════════════════════════════════════╗'));
        console.log(chalk.cyan('║                    CLAUDE MERGER SUMMARY                      ║'));
        console.log(chalk.cyan('╚════════════════════════════════════════════════════════════════╝'));
        
        console.log(chalk.green(`✅ Successful operations: ${results.successful}`));
        console.log(chalk.red(`❌ Failed operations: ${results.failed}`));
        
        const total = results.successful + results.failed;
        const successRate = total > 0 ? Math.round((results.successful / total) * 100) : 0;
        console.log(chalk.blue(`📊 Success rate: ${successRate}%`));
        
        if (results.failed === 0) {
            console.log(chalk.green('\n🎉 All operations completed successfully!'));
        }
    }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
    const configFile = process.argv[2] || 'claude-response.js';
    const dryRun = process.argv.includes('--dry-run');
    const verbose = process.argv.includes('--verbose');
    
    console.log(chalk.cyan('🤖 Claude Response Merger\n'));
    
    if (dryRun) {
        console.log(chalk.yellow('🔍 DRY RUN MODE - No files will be modified\n'));
    }
    
    try {
        const configPath = path.resolve(__dirname, configFile);
        
        if (!fs.existsSync(configPath)) {
            console.error(chalk.red(`❌ Configuration file not found: ${configPath}`));
            console.log(chalk.blue('💡 Create a configuration file first. See template examples.'));
            process.exit(1);
        }
        
        // Dynamic import of config file
        const config = await import(configPath);
        const merger = new ClaudeResponseMerger({ dryRun, verbose });
        
        await merger.processClaudeResponse(config.default || config);
        
    } catch (error) {
        console.error(chalk.red(`💥 Error: ${error.message}`));
        if (verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

export default ClaudeResponseMerger;