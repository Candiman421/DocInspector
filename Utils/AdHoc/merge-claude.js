#!/usr/bin/env node

// ============================================================================
// SIMPLE CLAUDE CODE MERGER
// Dead simple way to merge Claude's code into your files
// Location: Utils/AdHoc/merge-claude.js
// ============================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root is 2 levels up from Utils/AdHoc/
const PROJECT_ROOT = path.resolve(__dirname, '../../');

export class SimpleClaudeMerger {
    constructor() {
        this.projectRoot = PROJECT_ROOT;
    }

    /**
     * Process a Claude response file
     */
    async processResponse(configFile = 'claude-response.js') {
        console.log('🤖 Processing Claude Response...');
        
        // Load the config
        const configPath = path.join(__dirname, configFile);
        if (!fs.existsSync(configPath)) {
            throw new Error(`Config file not found: ${configPath}`);
        }

        const config = await import(`file://${configPath}`);
        const operations = config.default?.operations || config.operations;

        if (!operations) {
            throw new Error('No operations found in config file');
        }

        console.log(`📋 Found ${operations.length} operations\n`);

        let successful = 0;
        let failed = 0;

        // Process each operation
        for (const [index, op] of operations.entries()) {
            console.log(`${index + 1}. ${op.action} in ${op.file}`);
            
            try {
                await this.executeOperation(op);
                successful++;
                console.log('   ✅ Success\n');
            } catch (error) {
                failed++;
                console.log(`   ❌ Failed: ${error.message}\n`);
            }
        }

        console.log(`\n📊 Results: ${successful} successful, ${failed} failed`);
        
        if (successful > 0) {
            console.log('\n💡 Next steps:');
            console.log('   git diff              # Review changes');
            console.log('   git add -A && git commit -m "Applied Claude updates"');
        }
    }

    /**
     * Execute a single operation
     */
    async executeOperation(op) {
        const filePath = this.getFilePath(op.file);
        
        switch (op.action) {
            case 'REPLACE_FUNCTION':
                return this.replaceFunction(filePath, op.functionName, op.newCode);
                
            case 'INSERT_AFTER':
                return this.insertAfterFunction(filePath, op.afterFunction, op.newCode);
                
            case 'INSERT_BEFORE': 
                return this.insertBeforeFunction(filePath, op.beforeFunction, op.newCode);
                
            case 'REPLACE_FILE_TOP':
                return this.replaceFileTop(filePath, op.stopBefore, op.newCode);
                
            case 'REPLACE_EXPORTS':
                return this.replaceExports(filePath, op.newCode);
                
            case 'FIND_REPLACE':
                return this.findReplace(filePath, op.find, op.replace);
                
            default:
                throw new Error(`Unknown action: ${op.action}`);
        }
    }

    /**
     * Replace an entire function
     */
    replaceFunction(filePath, functionName, newCode) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Find function with JSDoc comments
        const functionRegex = new RegExp(
            `(\\/\\*\\*[\\s\\S]*?\\*\\/\\s*)?` +           // Optional JSDoc
            `(export\\s+)?` +                             // Optional export
            `(const\\s+${functionName}\\s*=|function\\s+${functionName}\\s*\\()` +
            `[\\s\\S]*?` +                                // Function content
            `(?=\\n\\s*(?:\\/\\*\\*|\\/\\/|export|const|function|$))`, // Stop at next function/end
            'gm'
        );

        const match = content.match(functionRegex);
        if (!match) {
            throw new Error(`Function '${functionName}' not found`);
        }

        const newContent = content.replace(functionRegex, newCode.trim());
        fs.writeFileSync(filePath, newContent, 'utf8');
    }

    /**
     * Insert code after a function
     */
    insertAfterFunction(filePath, afterFunction, newCode) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        const functionRegex = new RegExp(
            `(\\/\\*\\*[\\s\\S]*?\\*\\/\\s*)?` +
            `(export\\s+)?` +
            `(const\\s+${afterFunction}\\s*=|function\\s+${afterFunction}\\s*\\()` +
            `[\\s\\S]*?` +
            `(?=\\n\\s*(?:\\/\\*\\*|\\/\\/|export|const|function|$))`,
            'gm'
        );

        const match = content.match(functionRegex);
        if (!match) {
            throw new Error(`Function '${afterFunction}' not found`);
        }

        const newContent = content.replace(functionRegex, match[0] + '\n\n' + newCode.trim());
        fs.writeFileSync(filePath, newContent, 'utf8');
    }

    /**
     * Insert code before a function
     */
    insertBeforeFunction(filePath, beforeFunction, newCode) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        const functionRegex = new RegExp(
            `(\\/\\*\\*[\\s\\S]*?\\*\\/\\s*)?` +
            `(export\\s+)?` +
            `(const\\s+${beforeFunction}\\s*=|function\\s+${beforeFunction}\\s*\\()`,
            'gm'
        );

        const match = content.match(functionRegex);
        if (!match) {
            throw new Error(`Function '${beforeFunction}' not found`);
        }

        const newContent = content.replace(functionRegex, newCode.trim() + '\n\n' + match[0]);
        fs.writeFileSync(filePath, newContent, 'utf8');
    }

    /**
     * Replace from top of file down to specified function
     */
    replaceFileTop(filePath, stopBefore, newCode) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        if (stopBefore) {
            const functionRegex = new RegExp(
                `(\\/\\*\\*[\\s\\S]*?\\*\\/\\s*)?` +
                `(export\\s+)?` +
                `(const\\s+${stopBefore}\\s*=|function\\s+${stopBefore}\\s*\\()`,
                'gm'
            );

            const match = functionRegex.exec(content);
            if (!match) {
                throw new Error(`Stop function '${stopBefore}' not found`);
            }

            const newContent = newCode.trim() + '\n\n' + content.slice(match.index);
            fs.writeFileSync(filePath, newContent, 'utf8');
        } else {
            // Replace everything until first function
            const firstFunctionRegex = /(\n\s*(?:\/\*\*|export|const|function))/;
            const match = content.match(firstFunctionRegex);
            
            if (match) {
                const newContent = newCode.trim() + match[1] + content.slice(match.index + match[0].length);
                fs.writeFileSync(filePath, newContent, 'utf8');
            } else {
                fs.writeFileSync(filePath, newCode.trim(), 'utf8');
            }
        }
    }

    /**
     * Replace exports at end of file
     */
    replaceExports(filePath, newCode) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        const exportRegex = /export\s+default\s+{[\s\S]*?};?\s*$/;
        const match = content.match(exportRegex);
        
        if (match) {
            const newContent = content.replace(exportRegex, newCode.trim());
            fs.writeFileSync(filePath, newContent, 'utf8');
        } else {
            // Add export at end
            const newContent = content.trim() + '\n\n' + newCode.trim();
            fs.writeFileSync(filePath, newContent, 'utf8');
        }
    }

    /**
     * Simple find and replace
     */
    findReplace(filePath, find, replace) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        if (!content.includes(find)) {
            throw new Error(`Text not found: "${find}"`);
        }

        const newContent = content.replace(new RegExp(this.escapeRegex(find), 'g'), replace);
        fs.writeFileSync(filePath, newContent, 'utf8');
    }

    /**
     * Get absolute file path
     */
    getFilePath(relativePath) {
        return path.resolve(this.projectRoot, relativePath);
    }

    /**
     * Escape regex special characters
     */
    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

// CLI execution
if (process.argv[1] === __filename) {
    const configFile = process.argv[2] || 'claude-response.js';
    const merger = new SimpleClaudeMerger();
    
    merger.processResponse(configFile).catch(error => {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    });
}

export default SimpleClaudeMerger;