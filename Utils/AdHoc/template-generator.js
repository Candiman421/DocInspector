#!/usr/bin/env node

// ============================================================================
// CLAUDE TEMPLATE GENERATOR
// Generates structured templates for Claude responses
// Location: root/Utils/AdHoc/template-generator.js
// ============================================================================

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ClaudeTemplateGenerator {
    constructor() {
        this.templateDir = path.join(__dirname, 'templates');
        this.outputDir = __dirname;
    }

    /**
     * Generate a new Claude response template
     */
    generateTemplate(type, options = {}) {
        const templates = {
            'replace-function': this.generateReplaceFunctionTemplate,
            'insert-function': this.generateInsertFunctionTemplate,
            'simple-replace': this.generateSimpleReplaceTemplate,
            'bulk-fixes': this.generateBulkFixesTemplate,
            'file-top': this.generateFileTopTemplate,
            'exports': this.generateExportsTemplate,
            'regex-fix': this.generateRegexFixTemplate,
            'custom': this.generateCustomTemplate
        };

        const generator = templates[type];
        if (!generator) {
            throw new Error(`Unknown template type: ${type}. Available: ${Object.keys(templates).join(', ')}`);
        }

        return generator.call(this, options);
    }

    /**
     * Generate function replacement template
     */
    generateReplaceFunctionTemplate(options) {
        const { 
            targetFile = 'path/to/file.js',
            functionName = 'functionName',
            description = 'Enhanced function with improvements'
        } = options;

        return {
            description: description,
            operations: [
                {
                    action: "REPLACE_FUNCTION",
                    targetFile: targetFile,
                    functionName: functionName,
                    description: description,
                    priority: 1,
                    newFunction: `
/**
 * [Function description]
 * @param {type} param - Parameter description
 * @returns {type} Return description
 */
const ${functionName} = (/* parameters */) => {
    // Implementation here
    try {
        // Function body
        
        return result;
        
    } catch (error) {
        console.error('${functionName} error:', error.message);
        return null;
    }
};`
                }
            ]
        };
    }

    /**
     * Generate function insertion template
     */
    generateInsertFunctionTemplate(options) {
        const {
            targetFile = 'path/to/file.js',
            afterFunction = 'existingFunction',
            newFunctionName = 'newFunction',
            description = 'New helper function'
        } = options;

        return {
            description: description,
            operations: [
                {
                    action: "INSERT_FUNCTION_AFTER",
                    targetFile: targetFile,
                    afterFunction: afterFunction,
                    description: description,
                    priority: 1,
                    newFunction: `
/**
 * [Function description]
 * @param {type} param - Parameter description
 * @returns {type} Return description
 */
const ${newFunctionName} = (/* parameters */) => {
    try {
        // Implementation here
        
        return result;
        
    } catch (error) {
        console.error('${newFunctionName} error:', error.message);
        return null;
    }
};`
                }
            ]
        };
    }

    /**
     * Generate simple replace template
     */
    generateSimpleReplaceTemplate(options) {
        const {
            targetFile = 'path/to/file.js',
            find = 'text to find',
            replace = 'replacement text',
            description = 'Simple text replacement'
        } = options;

        return {
            description: description,
            operations: [
                {
                    action: "SIMPLE_REPLACE",
                    targetFile: targetFile,
                    find: find,
                    replace: replace,
                    description: description,
                    priority: 1
                }
            ]
        };
    }

    /**
     * Generate bulk fixes template
     */
    generateBulkFixesTemplate(options) {
        const { description = 'Bulk fixes across multiple files' } = options;

        return {
            description: description,
            operations: [
                {
                    action: "SIMPLE_REPLACE",
                    targetFile: "file1.js",
                    find: "old pattern",
                    replace: "new pattern",
                    description: "Fix issue in file1",
                    priority: 1
                },
                {
                    action: "SIMPLE_REPLACE",
                    targetFile: "file2.js", 
                    find: "old pattern",
                    replace: "new pattern",
                    description: "Fix issue in file2",
                    priority: 1
                }
                // Add more operations as needed
            ]
        };
    }

    /**
     * Generate file top update template
     */
    generateFileTopTemplate(options) {
        const {
            targetFile = 'path/to/file.js',
            stopBeforeFunction = 'firstFunction',
            description = 'Update file header and imports'
        } = options;

        return {
            description: description,
            operations: [
                {
                    action: "UPDATE_FILE_TOP",
                    targetFile: targetFile,
                    stopBeforeFunction: stopBeforeFunction,
                    description: description,
                    priority: 1,
                    newContent: `// ============================================================================
// FILE HEADER
// Description of the file
// ============================================================================

import fs from 'fs';
import path from 'path';
// Add other imports here

// Configuration or constants
const CONFIG = {
    setting1: 'value1',
    setting2: 'value2'
};`
                }
            ]
        };
    }

    /**
     * Generate exports template
     */
    generateExportsTemplate(options) {
        const {
            targetFile = 'path/to/file.js',
            functions = ['function1', 'function2'],
            description = 'Update module exports'
        } = options;

        const exportList = functions.map(f => `    ${f}`).join(',\n');

        return {
            description: description,
            operations: [
                {
                    action: "UPDATE_EXPORTS",
                    targetFile: targetFile,
                    description: description,
                    priority: 1,
                    newExports: `export default {
${exportList}
};`
                }
            ]
        };
    }

    /**
     * Generate regex fix template
     */
    generateRegexFixTemplate(options) {
        const {
            targetFile = 'path/to/file.js',
            findPattern = 'old regex pattern',
            replaceWith = 'new regex pattern',
            description = 'Fix regex pattern'
        } = options;

        return {
            description: description,
            operations: [
                {
                    action: "SIMPLE_REPLACE",
                    targetFile: targetFile,
                    find: findPattern,
                    replace: replaceWith,
                    description: description,
                    priority: 1
                }
            ]
        };
    }

    /**
     * Generate custom template
     */
    generateCustomTemplate(options) {
        return {
            description: "Custom operation template",
            operations: [
                {
                    action: "SIMPLE_REPLACE", // Change as needed
                    targetFile: "path/to/file.js",
                    find: "customize this",
                    replace: "with your content",
                    description: "Customize this operation",
                    priority: 1
                }
            ]
        };
    }

    /**
     * Save template to file
     */
    saveTemplate(template, filename) {
        const filePath = path.join(this.outputDir, filename);
        const content = `// Claude Response Configuration
// Generated: ${new Date().toISOString()}

export default ${JSON.stringify(template, null, 4)};`;

        fs.writeFileSync(filePath, content, 'utf8');
        return filePath;
    }

    /**
     * Create from Claude response text
     */
    createFromClaudeResponse(responseText) {
        // Parse Claude response and extract code blocks
        const codeBlocks = this.extractCodeBlocks(responseText);
        const operations = [];

        // Analyze the response to determine operation types
        codeBlocks.forEach((block, index) => {
            const operation = this.analyzeCodeBlock(block, index);
            if (operation) {
                operations.push(operation);
            }
        });

        return {
            description: "Generated from Claude response",
            operations: operations
        };
    }

    /**
     * Extract code blocks from Claude response
     */
    extractCodeBlocks(text) {
        const codeBlocks = [];
        const codeBlockRegex = /```(?:javascript|js)?\n([\s\S]*?)```/g;
        
        let match;
        while ((match = codeBlockRegex.exec(text)) !== null) {
            codeBlocks.push({
                content: match[1].trim(),
                index: match.index
            });
        }

        return codeBlocks;
    }

    /**
     * Analyze code block to determine operation type
     */
    analyzeCodeBlock(block, index) {
        const content = block.content;

        // Check if it's a function definition
        if (content.includes('function ') || content.includes('const ') && content.includes(') => {')) {
            const functionMatch = content.match(/(?:function\s+|const\s+)([a-zA-Z_$][a-zA-Z0-9_$]*)/);
            if (functionMatch) {
                return {
                    action: "REPLACE_FUNCTION", // or INSERT_FUNCTION_AFTER
                    targetFile: "path/to/file.js", // User needs to specify
                    functionName: functionMatch[1],
                    description: `Update ${functionMatch[1]} function`,
                    priority: index + 1,
                    newFunction: content
                };
            }
        }

        // Check if it's an import/header section
        if (content.includes('import ') || content.includes('// ===')) {
            return {
                action: "UPDATE_FILE_TOP",
                targetFile: "path/to/file.js", // User needs to specify
                description: "Update file header and imports",
                priority: index + 1,
                newContent: content
            };
        }

        // Check if it's export statement
        if (content.includes('export default {') || content.includes('export {')) {
            return {
                action: "UPDATE_EXPORTS",
                targetFile: "path/to/file.js", // User needs to specify
                description: "Update module exports",
                priority: index + 1,
                newExports: content
            };
        }

        // Default to simple replace
        return {
            action: "SIMPLE_REPLACE",
            targetFile: "path/to/file.js", // User needs to specify
            find: "TO_BE_REPLACED", // User needs to specify
            replace: content,
            description: `Replace code block ${index + 1}`,
            priority: index + 1
        };
    }

    /**
     * Interactive template creation
     */
    async createInteractive() {
        console.log(chalk.cyan('🎯 Interactive Claude Template Generator\n'));

        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const ask = (question) => new Promise(resolve => readline.question(question, resolve));

        try {
            const type = await ask('Template type (replace-function/insert-function/simple-replace/bulk-fixes/file-top/exports/regex-fix/custom): ');
            const targetFile = await ask('Target file path: ');
            const description = await ask('Description: ');

            let options = { targetFile, description };

            switch (type) {
                case 'replace-function':
                    options.functionName = await ask('Function name to replace: ');
                    break;
                case 'insert-function':
                    options.afterFunction = await ask('Insert after function: ');
                    options.newFunctionName = await ask('New function name: ');
                    break;
                case 'simple-replace':
                    options.find = await ask('Text to find: ');
                    options.replace = await ask('Replacement text: ');
                    break;
                case 'file-top':
                    options.stopBeforeFunction = await ask('Stop before function (optional): ');
                    break;
                case 'exports':
                    const functions = await ask('Function names (comma separated): ');
                    options.functions = functions.split(',').map(f => f.trim());
                    break;
            }

            const template = this.generateTemplate(type, options);
            const filename = await ask('Output filename (e.g., my-response.js): ');
            
            const filePath = this.saveTemplate(template, filename);
            console.log(chalk.green(`\n✅ Template saved to: ${filePath}`));

        } finally {
            readline.close();
        }
    }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const generator = new ClaudeTemplateGenerator();
    
    const command = process.argv[2];
    const type = process.argv[3];
    const filename = process.argv[4] || 'claude-response.js';

    try {
        switch (command) {
            case 'generate':
                if (!type) {
                    console.log(chalk.yellow('Usage: node template-generator.js generate <type> [filename]'));
                    console.log(chalk.blue('Types: replace-function, insert-function, simple-replace, bulk-fixes, file-top, exports, regex-fix, custom'));
                    process.exit(1);
                }
                
                const template = generator.generateTemplate(type);
                const filePath = generator.saveTemplate(template, filename);
                console.log(chalk.green(`✅ Template generated: ${filePath}`));
                break;

            case 'interactive':
                await generator.createInteractive();
                break;

            case 'help':
            default:
                console.log(chalk.cyan('Claude Template Generator\n'));
                console.log(chalk.white('Commands:'));
                console.log(chalk.blue('  generate <type> [filename]  ') + chalk.gray('Generate template of specified type'));
                console.log(chalk.blue('  interactive                 ') + chalk.gray('Interactive template creation'));
                console.log(chalk.blue('  help                        ') + chalk.gray('Show this help'));
                console.log('');
                console.log(chalk.white('Template Types:'));
                console.log(chalk.yellow('  replace-function   ') + chalk.gray('Replace entire function'));
                console.log(chalk.yellow('  insert-function    ') + chalk.gray('Insert new function'));
                console.log(chalk.yellow('  simple-replace     ') + chalk.gray('Find/replace text'));
                console.log(chalk.yellow('  bulk-fixes         ') + chalk.gray('Multiple replacements'));
                console.log(chalk.yellow('  file-top          ') + chalk.gray('Update imports/header'));
                console.log(chalk.yellow('  exports           ') + chalk.gray('Update export statement'));
                console.log(chalk.yellow('  regex-fix         ') + chalk.gray('Fix regex patterns'));
                console.log(chalk.yellow('  custom            ') + chalk.gray('Custom template'));
                break;
        }
    } catch (error) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
    }
}

export default ClaudeTemplateGenerator;