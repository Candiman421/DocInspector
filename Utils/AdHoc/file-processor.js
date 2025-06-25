// ============================================================================
// DOCDOM FILE PROCESSOR
// Handles all file operations for the fix orchestrator
// ============================================================================

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

export class FileProcessor {
    constructor(options = {}) {
        this.options = options;
        this.dryRun = options.dryRun || false;
        this.verbose = options.verbose || false;
        this.backup = options.backup || false;
        this.backupSuffix = options.backupSuffix || '.backup';
    }

    /**
     * Execute simple find/replace operation
     */
    async executeSimpleReplace(operation) {
        const result = {
            operation: 'simple_replace',
            targetFile: operation.targetFile,
            success: false,
            message: '',
            details: ''
        };

        try {
            const filePath = this.resolveFilePath(operation.targetFile);
            
            if (!fs.existsSync(filePath)) {
                throw new Error(`File not found: ${filePath}`);
            }

            // Read file content
            const originalContent = fs.readFileSync(filePath, 'utf8');
            
            // Check if find pattern exists
            if (!originalContent.includes(operation.find)) {
                result.success = true;
                result.message = `Pattern not found (already fixed or pattern changed)`;
                result.details = `Searched for: "${operation.find}"`;
                return result;
            }

            // Perform replacement
            const newContent = originalContent.replace(operation.find, operation.replace);
            
            // Count replacements made
            const originalOccurrences = (originalContent.match(new RegExp(this.escapeRegex(operation.find), 'g')) || []).length;
            const newOccurrences = (newContent.match(new RegExp(this.escapeRegex(operation.find), 'g')) || []).length;
            const replacements = originalOccurrences - newOccurrences;

            if (this.dryRun) {
                result.success = true;
                result.message = `Would replace ${replacements} occurrence(s)`;
                result.details = `${operation.find} → ${operation.replace}`;
            } else {
                // Create backup if requested
                if (this.backup) {
                    await this.createBackup(filePath);
                }

                // Write new content
                fs.writeFileSync(filePath, newContent, 'utf8');
                
                result.success = true;
                result.message = `Replaced ${replacements} occurrence(s)`;
                result.details = `${operation.find} → ${operation.replace}`;
            }

        } catch (error) {
            result.message = `Failed: ${error.message}`;
        }

        return result;
    }

    /**
     * Execute function replacement operation
     */
    async executeFunctionReplace(operation) {
        const result = {
            operation: 'function_replace',
            targetFile: operation.targetFile,
            success: false,
            message: '',
            details: ''
        };

        try {
            const filePath = this.resolveFilePath(operation.targetFile);
            
            if (!fs.existsSync(filePath)) {
                throw new Error(`File not found: ${filePath}`);
            }

            const originalContent = fs.readFileSync(filePath, 'utf8');
            
            // Find the existing function
            const functionPattern = new RegExp(
                `(\/\\*\\*[\\s\\S]*?\\*\\/\\s*)?(?:export\\s+)?(?:const\\s+)?${operation.functionName}\\s*[=:]?\\s*(?:function\\s*)?\\([^)]*\\)\\s*[=>]?\\s*{[\\s\\S]*?^}`,
                'gm'
            );
            
            const functionMatch = originalContent.match(functionPattern);
            
            if (!functionMatch) {
                throw new Error(`Function '${operation.functionName}' not found`);
            }

            // Replace the function
            const newContent = originalContent.replace(functionPattern, operation.newFunction);

            if (this.dryRun) {
                result.success = true;
                result.message = `Would replace function '${operation.functionName}'`;
                result.details = `Function length: ${operation.newFunction.length} characters`;
            } else {
                if (this.backup) {
                    await this.createBackup(filePath);
                }

                fs.writeFileSync(filePath, newContent, 'utf8');
                
                result.success = true;
                result.message = `Replaced function '${operation.functionName}'`;
                result.details = `New function: ${operation.newFunction.length} characters`;
            }

        } catch (error) {
            result.message = `Failed: ${error.message}`;
        }

        return result;
    }

    /**
     * Execute function insertion operation
     */
    async executeFunctionInsert(operation) {
        const result = {
            operation: 'function_insert',
            targetFile: operation.targetFile,
            success: false,
            message: '',
            details: ''
        };

        try {
            const filePath = this.resolveFilePath(operation.targetFile);
            
            if (!fs.existsSync(filePath)) {
                throw new Error(`File not found: ${filePath}`);
            }

            const originalContent = fs.readFileSync(filePath, 'utf8');
            
            // Find the reference function
            const referenceFunctionPattern = new RegExp(
                `((?:\/\\*\\*[\\s\\S]*?\\*\\/\\s*)?(?:export\\s+)?(?:const\\s+)?${operation.referenceFunction}\\s*[=:]?\\s*(?:function\\s*)?\\([^)]*\\)\\s*[=>]?\\s*{[\\s\\S]*?^})`,
                'gm'
            );
            
            const refMatch = originalContent.match(referenceFunctionPattern);
            
            if (!refMatch) {
                throw new Error(`Reference function '${operation.referenceFunction}' not found`);
            }

            // Insert the new function
            let newContent;
            if (operation.insertAfter) {
                newContent = originalContent.replace(
                    referenceFunctionPattern, 
                    `$1\n\n${operation.newFunction}`
                );
            } else {
                newContent = originalContent.replace(
                    referenceFunctionPattern, 
                    `${operation.newFunction}\n\n$1`
                );
            }

            if (this.dryRun) {
                result.success = true;
                result.message = `Would insert function ${operation.insertAfter ? 'after' : 'before'} '${operation.referenceFunction}'`;
                result.details = `New function: ${operation.newFunction.split('\n')[1]?.trim() || 'unnamed'}`;
            } else {
                if (this.backup) {
                    await this.createBackup(filePath);
                }

                fs.writeFileSync(filePath, newContent, 'utf8');
                
                result.success = true;
                result.message = `Inserted function ${operation.insertAfter ? 'after' : 'before'} '${operation.referenceFunction}'`;
                result.details = `New function added to ${path.basename(filePath)}`;
            }

        } catch (error) {
            result.message = `Failed: ${error.message}`;
        }

        return result;
    }

    /**
     * Execute regex fix operation
     */
    async executeRegexFix(operation) {
        const result = {
            operation: 'regex_fix',
            targetFile: operation.targetFile,
            success: false,
            message: '',
            details: ''
        };

        try {
            const filePath = this.resolveFilePath(operation.targetFile);
            
            if (!fs.existsSync(filePath)) {
                throw new Error(`File not found: ${filePath}`);
            }

            const originalContent = fs.readFileSync(filePath, 'utf8');
            
            // Apply regex fix
            const newContent = originalContent.replace(operation.findPattern, operation.replaceWith);
            
            if (originalContent === newContent) {
                result.success = true;
                result.message = `Pattern not found (already fixed or pattern changed)`;
                result.details = `Pattern: ${operation.findPattern}`;
                return result;
            }

            if (this.dryRun) {
                result.success = true;
                result.message = `Would apply regex fix`;
                result.details = operation.description;
            } else {
                if (this.backup) {
                    await this.createBackup(filePath);
                }

                fs.writeFileSync(filePath, newContent, 'utf8');
                
                result.success = true;
                result.message = `Applied regex fix`;
                result.details = operation.description;
            }

        } catch (error) {
            result.message = `Failed: ${error.message}`;
        }

        return result;
    }

    /**
     * Execute bulk replace operation across multiple files
     */
    async executeBulkReplace(operation, moduleFiles) {
        const result = {
            operation: 'bulk_replace',
            targetFile: 'multiple',
            success: false,
            message: '',
            details: ''
        };

        try {
            const results = [];
            let totalReplacements = 0;

            for (const moduleFile of moduleFiles) {
                if (operation.filePattern && !operation.filePattern.test(moduleFile.filename)) {
                    continue;
                }

                const singleResult = await this.executeSimpleReplace({
                    ...operation,
                    targetFile: moduleFile.fullPath
                });

                if (singleResult.success) {
                    const replacements = this.extractReplacementCount(singleResult.message);
                    totalReplacements += replacements;
                    results.push(singleResult);
                }
            }

            result.success = true;
            result.message = `Bulk operation completed: ${totalReplacements} total replacements across ${results.length} files`;
            result.details = `Pattern: ${operation.find} → ${operation.replace}`;

        } catch (error) {
            result.message = `Failed: ${error.message}`;
        }

        return result;
    }

    /**
     * Execute function consolidation plan
     */
    async executeFunctionConsolidation(consolidationPlan) {
        const result = {
            operation: 'function_consolidation',
            success: false,
            message: '',
            details: ''
        };

        try {
            if (this.dryRun) {
                result.success = true;
                result.message = `Would consolidate ${consolidationPlan.functions.length} duplicate functions`;
                result.details = `Target: ${consolidationPlan.targetFile}`;
                return result;
            }

            // Create shared utilities file
            const sharedContent = this.generateSharedUtilitiesFile(consolidationPlan);
            
            if (this.backup) {
                // Backup all affected files
                for (const file of consolidationPlan.affectedFiles) {
                    await this.createBackup(file);
                }
            }

            // Write shared utilities file
            fs.writeFileSync(consolidationPlan.targetFile, sharedContent, 'utf8');

            // Update all affected files to import from shared utilities
            for (const file of consolidationPlan.affectedFiles) {
                await this.updateFileWithImports(file, consolidationPlan.functions);
            }

            result.success = true;
            result.message = `Consolidated ${consolidationPlan.functions.length} functions`;
            result.details = `Created: ${consolidationPlan.targetFile}`;

        } catch (error) {
            result.message = `Failed: ${error.message}`;
        }

        return result;
    }

    /**
     * Helper methods
     */

    resolveFilePath(targetFile) {
        if (path.isAbsolute(targetFile)) {
            return targetFile;
        }
        
        // Try relative to current directory first
        if (fs.existsSync(targetFile)) {
            return targetFile;
        }
        
        // Try in the target folder
        const targetFolder = this.options.targetFolder || '../DocDomV4.1';
        const inTargetFolder = path.join(targetFolder, targetFile);
        if (fs.existsSync(inTargetFolder)) {
            return inTargetFolder;
        }
        
        // Try in parent directory (for config files)
        const inParent = path.join('..', targetFile);
        if (fs.existsSync(inParent)) {
            return inParent;
        }
        
        return targetFile; // Return as-is and let caller handle missing file
    }

    async createBackup(filePath) {
        const backupPath = filePath + this.backupSuffix;
        
        if (fs.existsSync(backupPath)) {
            // Create numbered backup
            let counter = 1;
            let numberedBackup;
            do {
                numberedBackup = `${backupPath}.${counter}`;
                counter++;
            } while (fs.existsSync(numberedBackup));
            backupPath = numberedBackup;
        }
        
        fs.copyFileSync(filePath, backupPath);
        
        if (this.verbose) {
            console.log(chalk.blue(`   💾 Backup created: ${path.basename(backupPath)}`));
        }
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    extractReplacementCount(message) {
        const match = message.match(/(\d+) occurrence/);
        return match ? parseInt(match[1], 10) : 0;
    }

    generateSharedUtilitiesFile(consolidationPlan) {
        const header = `
// ============================================================================
// SHARED UTILITIES
// Consolidated duplicate functions from multiple modules
// Generated automatically by DocDom Fix Orchestrator
// ============================================================================

`;

        const functionsContent = consolidationPlan.functions
            .map(func => func.canonicalVersion)
            .join('\n\n');

        const exports = `
// Export all shared functions
export {
${consolidationPlan.functions.map(func => `    ${func.name}`).join(',\n')}
};
`;

        return header + functionsContent + exports;
    }

    async updateFileWithImports(filePath, consolidatedFunctions) {
        const content = fs.readFileSync(filePath, 'utf8');
        const functionNames = consolidatedFunctions.map(f => f.name);
        
        // Add import statement at top
        const importStatement = `import { ${functionNames.join(', ')} } from './shared-utilities.js';\n`;
        
        // Remove duplicate function definitions
        let newContent = content;
        for (const func of consolidatedFunctions) {
            const functionPattern = new RegExp(
                `(\/\\*\\*[\\s\\S]*?\\*\\/\\s*)?(?:export\\s+)?(?:const\\s+)?${func.name}\\s*[=:]?\\s*(?:function\\s*)?\\([^)]*\\)\\s*[=>]?\\s*{[\\s\\S]*?^}`,
                'gm'
            );
            newContent = newContent.replace(functionPattern, '');
        }
        
        // Add import at the top after existing imports
        const importInsertPoint = newContent.search(/\n\n(?!import)/);
        if (importInsertPoint > -1) {
            newContent = newContent.slice(0, importInsertPoint) + '\n' + importStatement + newContent.slice(importInsertPoint);
        } else {
            newContent = importStatement + '\n' + newContent;
        }
        
        fs.writeFileSync(filePath, newContent, 'utf8');
    }
}