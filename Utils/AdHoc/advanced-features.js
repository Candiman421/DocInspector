// Location: Utils/AdHoc/advanced-features.js
// AdHoc Code Updater - Advanced Features Module
// Provides enhanced functionality for complex operations

import fs from 'fs/promises';
import path from 'path';

/**
 * Advanced file analysis and operations
 */
export class AdvancedFeatures {
    
    /**
     * Analyze code structure and provide insights
     */
    static async analyzeCode(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            const analysis = {
                lines: content.split('\n').length,
                functions: this.extractFunctions(content),
                imports: this.extractImports(content),
                exports: this.extractExports(content),
                complexity: this.calculateComplexity(content),
                dependencies: this.extractDependencies(content)
            };
            
            return { success: true, analysis };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Extract all functions from code
     */
    static extractFunctions(content) {
        const functions = [];
        
        // Regular function declarations
        const funcRegex = /function\s+(\w+)\s*\([^)]*\)/g;
        let match;
        while ((match = funcRegex.exec(content)) !== null) {
            functions.push({
                name: match[1],
                type: 'function',
                line: content.substring(0, match.index).split('\n').length
            });
        }

        // Arrow functions and const declarations
        const arrowRegex = /(?:const|let|var)\s+(\w+)\s*=\s*(?:\([^)]*\)\s*=>|[^=]+=>)/g;
        while ((match = arrowRegex.exec(content)) !== null) {
            functions.push({
                name: match[1],
                type: 'arrow',
                line: content.substring(0, match.index).split('\n').length
            });
        }

        // Method definitions in objects/classes
        const methodRegex = /(\w+)\s*\([^)]*\)\s*\{/g;
        while ((match = methodRegex.exec(content)) !== null) {
            functions.push({
                name: match[1],
                type: 'method',
                line: content.substring(0, match.index).split('\n').length
            });
        }

        return functions;
    }

    /**
     * Extract import statements
     */
    static extractImports(content) {
        const imports = [];
        const importRegex = /import\s+(?:(?:\{[^}]+\}|\w+|\*\s+as\s+\w+)(?:\s*,\s*(?:\{[^}]+\}|\w+))*\s+from\s+)?['"`]([^'"`]+)['"`]/g;
        
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            imports.push({
                module: match[1],
                line: content.substring(0, match.index).split('\n').length,
                statement: match[0]
            });
        }
        
        return imports;
    }

    /**
     * Extract export statements
     */
    static extractExports(content) {
        const exports = [];
        const exportRegex = /export\s+(?:default\s+)?(?:const|let|var|function|class)?\s*(\w+)?/g;
        
        let match;
        while ((match = exportRegex.exec(content)) !== null) {
            exports.push({
                name: match[1] || 'default',
                line: content.substring(0, match.index).split('\n').length,
                statement: match[0]
            });
        }
        
        return exports;
    }

    /**
     * Calculate cyclomatic complexity
     */
    static calculateComplexity(content) {
        const complexityKeywords = [
            'if', 'else if', 'while', 'for', 'switch', 'case', 
            'catch', 'throw', '&&', '||', '?', ':'
        ];
        
        let complexity = 1; // Base complexity
        
        for (const keyword of complexityKeywords) {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            const matches = content.match(regex);
            if (matches) {
                complexity += matches.length;
            }
        }
        
        return complexity;
    }

    /**
     * Extract dependencies and their usage
     */
    static extractDependencies(content) {
        const dependencies = new Set();
        
        // Import dependencies
        const importRegex = /from\s+['"`]([^'"`]+)['"`]/g;
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            if (!match[1].startsWith('.')) { // External dependencies only
                dependencies.add(match[1]);
            }
        }
        
        // Require dependencies
        const requireRegex = /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
        while ((match = requireRegex.exec(content)) !== null) {
            if (!match[1].startsWith('.')) {
                dependencies.add(match[1]);
            }
        }
        
        return Array.from(dependencies);
    }

    /**
     * Batch process multiple templates
     */
    static async processBatch(templates) {
        const results = [];
        
        for (const template of templates) {
            try {
                const result = await this.processTemplate(template);
                results.push({ template, result, success: true });
            } catch (error) {
                results.push({ template, error: error.message, success: false });
            }
        }
        
        return results;
    }

    /**
     * Generate code documentation
     */
    static generateDocumentation(analysis) {
        const docs = [];
        
        docs.push('# Code Analysis Report\n');
        docs.push(`**File Statistics:**`);
        docs.push(`- Lines of code: ${analysis.lines}`);
        docs.push(`- Functions: ${analysis.functions.length}`);
        docs.push(`- Imports: ${analysis.imports.length}`);
        docs.push(`- Exports: ${analysis.exports.length}`);
        docs.push(`- Complexity: ${analysis.complexity}`);
        docs.push('');

        if (analysis.functions.length > 0) {
            docs.push('## Functions');
            analysis.functions.forEach(func => {
                docs.push(`- **${func.name}** (${func.type}) - Line ${func.line}`);
            });
            docs.push('');
        }

        if (analysis.dependencies.length > 0) {
            docs.push('## Dependencies');
            analysis.dependencies.forEach(dep => {
                docs.push(`- ${dep}`);
            });
            docs.push('');
        }
        
        return docs.join('\n');
    }

    /**
     * Smart function placement for new functions
     */
    static findInsertionPoint(content, newFunction, preferences = {}) {
        const functions = this.extractFunctions(content);
        const lines = content.split('\n');
        
        // Default insertion preferences
        const defaults = {
            afterFunction: null,
            beforeFunction: null,
            atEnd: true,
            maintainGrouping: true
        };
        
        const options = { ...defaults, ...preferences };
        
        // If specific placement requested
        if (options.afterFunction) {
            const targetFunc = functions.find(f => f.name === options.afterFunction);
            if (targetFunc) {
                return this.findFunctionEnd(content, targetFunc.line);
            }
        }
        
        if (options.beforeFunction) {
            const targetFunc = functions.find(f => f.name === options.beforeFunction);
            if (targetFunc) {
                return this.findLineStart(content, targetFunc.line);
            }
        }
        
        // Smart grouping - place similar functions together
        if (options.maintainGrouping) {
            const funcType = this.detectFunctionType(newFunction);
            const similarFunctions = functions.filter(f => f.type === funcType);
            
            if (similarFunctions.length > 0) {
                const lastSimilar = similarFunctions[similarFunctions.length - 1];
                return this.findFunctionEnd(content, lastSimilar.line);
            }
        }
        
        // Default: insert at end
        return content.length;
    }

    /**
     * Detect function type from code
     */
    static detectFunctionType(functionCode) {
        if (functionCode.includes('=>')) return 'arrow';
        if (functionCode.startsWith('function')) return 'function';
        if (functionCode.includes('async')) return 'async';
        return 'method';
    }

    /**
     * Find the end of a function
     */
    static findFunctionEnd(content, startLine) {
        const lines = content.split('\n');
        let braceCount = 0;
        let inFunction = false;
        
        for (let i = startLine - 1; i < lines.length; i++) {
            const line = lines[i];
            
            if (!inFunction && line.includes('{')) {
                inFunction = true;
            }
            
            if (inFunction) {
                braceCount += (line.match(/\{/g) || []).length;
                braceCount -= (line.match(/\}/g) || []).length;
                
                if (braceCount === 0) {
                    return lines.slice(0, i + 1).join('\n').length;
                }
            }
        }
        
        return content.length;
    }

    /**
     * Find the start position of a specific line
     */
    static findLineStart(content, lineNumber) {
        const lines = content.split('\n');
        return lines.slice(0, lineNumber - 1).join('\n').length;
    }

    /**
     * Validate template syntax
     */
    static validateTemplate(template) {
        const required = ['Location:', 'Operation:', '---'];
        const issues = [];
        
        for (const field of required) {
            if (!template.includes(field)) {
                issues.push(`Missing required field: ${field}`);
            }
        }
        
        // Check for valid operations
        const validOps = ['REPLACE_FUNCTION', 'REPLACE_TEXT', 'ADD_FUNCTION', 'ADD_IMPORT', 'ADD_EXPORT', 'QUERY_FUNCTION'];
        const opMatch = template.match(/Operation:\s*(\w+)/);
        
        if (opMatch && !validOps.includes(opMatch[1])) {
            issues.push(`Invalid operation: ${opMatch[1]}. Valid operations: ${validOps.join(', ')}`);
        }
        
        return {
            valid: issues.length === 0,
            issues
        };
    }

    /**
     * Generate template from analysis
     */
    static generateTemplate(filePath, operation, target, notes = '') {
        return `Location: ${filePath}
Operation: ${operation}
Target: ${target}
Notes: ${notes}
---
// Implementation code here`;
    }

    /**
     * Backup file before modification
     */
    static async createBackup(filePath) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = `${filePath}.backup.${timestamp}`;
            
            await fs.copyFile(filePath, backupPath);
            return { success: true, backupPath };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Restore from backup
     */
    static async restoreBackup(originalPath, backupPath) {
        try {
            await fs.copyFile(backupPath, originalPath);
            await fs.unlink(backupPath); // Remove backup after restore
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Generate test cases for functions
     */
    static generateTests(functionAnalysis) {
        const tests = [];
        
        functionAnalysis.functions.forEach(func => {
            tests.push({
                name: func.name,
                testCase: `describe('${func.name}', () => {
    it('should work correctly', () => {
        // Test implementation for ${func.name}
        expect(${func.name}()).toBeDefined();
    });
});`
            });
        });
        
        return tests;
    }
}

export default AdvancedFeatures;