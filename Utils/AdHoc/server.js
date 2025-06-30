#!/usr/bin/env node
// Location: Utils/AdHoc/server.js
// ============================================================================
// ADHOC CODE UPDATER SERVER - FINAL INTEGRATION
// Real-time file processing with template-driven updates for DocDom project
// ============================================================================

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import chokidar from 'chokidar';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// Global state
let fileWatcher = null;
const clients = new Set();

/**
 * Enhanced Template Parser - Handles Claude response templates with Location metadata
 */
class TemplateParser {
    parse(text) {
        const sections = text.split(/(?=^Location:)/gm).filter(section => section.trim());
        const template = {
            target: '',
            operations: []
        };

        for (const section of sections) {
            const operation = this.parseSection(section);
            if (operation) {
                template.operations.push(operation);
                // Set target from first operation for backward compatibility
                if (!template.target) {
                    template.target = operation.targetFile;
                }
            }
        }

        return template;
    }

    parseSection(section) {
        const lines = section.split('\n');
        const operation = {
            targetFile: '',
            type: '',
            target: '',
            notes: '',
            code: ''
        };

        let inCodeBlock = false;
        let codeLines = [];
        let separatorFound = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Parse Location
            if (line.startsWith('Location:')) {
                operation.targetFile = line.substring(9).trim();
                continue;
            }

            // Parse Operation  
            if (line.startsWith('Operation:')) {
                operation.type = line.substring(10).trim();
                continue;
            }

            // Parse Target
            if (line.startsWith('Target:')) {
                operation.target = line.substring(7).trim();
                continue;
            }

            // Parse Notes (will be stripped before processing)
            if (line.startsWith('Notes:')) {
                operation.notes = line.substring(6).trim();
                continue;
            }

            // Look for separator
            if (line === '---') {
                separatorFound = true;
                inCodeBlock = true;
                continue;
            }

            // Collect code after separator
            if (inCodeBlock && separatorFound) {
                codeLines.push(lines[i]); // Use original line with whitespace
            }
        }

        // Set code content
        operation.code = codeLines.join('\n').trim();

        // Convert operation type to internal format
        switch (operation.type) {
            case 'REPLACE_FUNCTION':
                operation.functionName = operation.target;
                break;
            case 'INSERT_AFTER':
                operation.afterFunction = operation.target;
                break;
            case 'INSERT_BEFORE':
                operation.beforeFunction = operation.target;
                break;
            case 'REPLACE_TEXT':
                if (operation.target.includes(' -> ')) {
                    const parts = operation.target.split(' -> ');
                    operation.find = parts[0];
                    operation.replace = parts[1];
                } else {
                    operation.find = operation.target;
                    operation.replace = operation.code;
                }
                break;
            case 'UPDATE_IMPORTS':
            case 'UPDATE_EXPORTS':
            case 'QUERY_FUNCTION':
                // No additional processing needed
                break;
            default:
                console.warn(`Unknown operation type: ${operation.type}`);
                return null;
        }

        // Only return valid operations with required fields
        if (operation.targetFile && operation.type && (operation.code || operation.find || operation.type === 'QUERY_FUNCTION')) {
            return operation;
        }

        return null;
    }
}

/**
 * Enhanced File Processor - Handles different file types with DocDom integration
 */
class FileProcessor {
    constructor() {
        this.parser = new TemplateParser();
    }

    resolveFilePath(targetPath) {
        if (path.isAbsolute(targetPath)) {
            return targetPath;
        }
        return path.resolve(PROJECT_ROOT, targetPath);
    }

    async loadFile(filePath) {
        const resolvedPath = this.resolveFilePath(filePath);
        
        if (!fs.existsSync(resolvedPath)) {
            // Try common variations for DocDom project
            const alternatives = [
                path.join(PROJECT_ROOT, 'DocDomV4.1', path.basename(filePath)),
                path.join(PROJECT_ROOT, 'Utils', filePath),
                path.join(PROJECT_ROOT, filePath.replace('DocInspector', 'DocDom'))
            ];
            
            for (const alt of alternatives) {
                if (fs.existsSync(alt)) {
                    console.log(`File found at alternative location: ${alt}`);
                    return fs.readFileSync(alt, 'utf8');
                }
            }
            
            throw new Error(`File not found: ${resolvedPath}`);
        }
        
        return fs.readFileSync(resolvedPath, 'utf8');
    }

    async saveFile(filePath, content) {
        const resolvedPath = this.resolveFilePath(filePath);
        const dir = path.dirname(resolvedPath);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(resolvedPath, content, 'utf8');
        return resolvedPath;
    }

    processTemplate(template, originalContent) {
        let content = originalContent;
        
        for (const operation of template.operations) {
            try {
                switch (operation.type) {
                    case 'REPLACE_FUNCTION':
                        content = this.replaceFunction(content, operation.functionName, operation.code);
                        break;
                    case 'INSERT_AFTER':
                        content = this.insertAfterFunction(content, operation.afterFunction, operation.code);
                        break;
                    case 'INSERT_BEFORE':
                        content = this.insertBeforeFunction(content, operation.beforeFunction, operation.code);
                        break;
                    case 'REPLACE_TEXT':
                        content = this.replaceText(content, operation.find, operation.replace);
                        break;
                    case 'UPDATE_IMPORTS':
                        content = this.updateImports(content, operation.code);
                        break;
                    case 'UPDATE_EXPORTS':
                        content = this.updateExports(content, operation.code);
                        break;
                    case 'QUERY_FUNCTION':
                        // For query operations, return analysis instead of modifying content
                        return this.queryFunction(content, operation.target);
                    default:
                        console.warn(`Unhandled operation type: ${operation.type}`);
                }
            } catch (error) {
                console.error(`Error processing operation ${operation.type}:`, error.message);
                throw error;
            }
        }
        
        return content;
    }

    replaceFunction(content, functionName, newCode) {
        // Enhanced function replacement with JSDoc support for DocDom modules
        const patterns = [
            // const functionName = () => {} or const functionName = function() {}
            new RegExp(
                `(\\/\\*\\*[\\s\\S]*?\\*\\/\\s*)?` +           // Optional JSDoc
                `(export\\s+)?` +                             // Optional export
                `const\\s+${functionName}\\s*=\\s*` +         // const funcName =
                `[\\s\\S]*?` +                                // Function content
                `(?=\\n\\s*(?:\\/\\*\\*|\\/\\/|export|const|function|var|class|$))`, // Stop pattern
                'gm'
            ),
            // function functionName() {}
            new RegExp(
                `(\\/\\*\\*[\\s\\S]*?\\*\\/\\s*)?` +           // Optional JSDoc
                `(export\\s+)?` +                             // Optional export
                `function\\s+${functionName}\\s*\\([^)]*\\)\\s*{` + // function definition
                `[\\s\\S]*?` +                                // Function body
                `^}`,                                         // Closing brace at start of line
                'gm'
            )
        ];

        for (const pattern of patterns) {
            const match = content.match(pattern);
            if (match) {
                return content.replace(pattern, newCode.trim());
            }
        }

        throw new Error(`Function '${functionName}' not found in file`);
    }

    insertAfterFunction(content, afterFunction, newCode) {
        const patterns = [
            new RegExp(
                `(\\/\\*\\*[\\s\\S]*?\\*\\/\\s*)?` +
                `(export\\s+)?` +
                `const\\s+${afterFunction}\\s*=\\s*` +
                `[\\s\\S]*?` +
                `(?=\\n\\s*(?:\\/\\*\\*|\\/\\/|export|const|function|var|class|$))`,
                'gm'
            ),
            new RegExp(
                `(\\/\\*\\*[\\s\\S]*?\\*\\/\\s*)?` +
                `(export\\s+)?` +
                `function\\s+${afterFunction}\\s*\\([^)]*\\)\\s*{` +
                `[\\s\\S]*?` +
                `^}`,
                'gm'
            )
        ];

        for (const pattern of patterns) {
            const match = content.match(pattern);
            if (match) {
                return content.replace(pattern, match[0] + '\n\n' + newCode.trim());
            }
        }

        throw new Error(`Function '${afterFunction}' not found for insertion`);
    }

    insertBeforeFunction(content, beforeFunction, newCode) {
        const patterns = [
            new RegExp(
                `(\\/\\*\\*[\\s\\S]*?\\*\\/\\s*)?` +
                `(export\\s+)?` +
                `(const\\s+${beforeFunction}\\s*=|function\\s+${beforeFunction}\\s*\\()`,
                'gm'
            )
        ];

        for (const pattern of patterns) {
            const match = content.match(pattern);
            if (match) {
                return content.replace(pattern, newCode.trim() + '\n\n' + match[0]);
            }
        }

        throw new Error(`Function '${beforeFunction}' not found for insertion`);
    }

    replaceText(content, find, replace) {
        const findText = find.replace(/['"]/g, ''); // Remove quotes if present
        const replaceText = replace.replace(/['"]/g, '');
        
        if (!content.includes(findText)) {
            throw new Error(`Text not found: "${findText}"`);
        }
        
        return content.replace(new RegExp(this.escapeRegex(findText), 'g'), replaceText);
    }

    updateImports(content, newImports) {
        const lines = content.split('\n');
        
        // Find first non-import, non-comment line
        const firstNonImportIndex = lines.findIndex(line => {
            const trimmed = line.trim();
            return trimmed && 
                   !trimmed.startsWith('import') && 
                   !trimmed.startsWith('//') &&
                   !trimmed.startsWith('/*') &&
                   !trimmed.startsWith('#!/usr/bin/env');
        });

        if (firstNonImportIndex !== -1) {
            const beforeImports = lines.slice(firstNonImportIndex);
            return newImports.trim() + '\n\n' + beforeImports.join('\n');
        }

        return newImports.trim() + '\n\n' + content;
    }

    updateExports(content, newExports) {
        // Replace existing export default or add at end
        const exportPattern = /export\s+default\s+{[\s\S]*?};?\s*$/;
        
        if (exportPattern.test(content)) {
            return content.replace(exportPattern, newExports.trim());
        } else {
            return content.trim() + '\n\n' + newExports.trim();
        }
    }

    queryFunction(content, functionName) {
        // Enhanced function analysis for DocDom modules
        const analysis = {
            found: false,
            functionName: functionName,
            analysis: {},
            suggestions: [],
            timestamp: new Date().toISOString()
        };

        try {
            // Find the function
            const functionPattern = new RegExp(
                `(\\/\\*\\*[\\s\\S]*?\\*\\/\\s*)?` +
                `(export\\s+)?` +
                `(const\\s+${functionName}\\s*=|function\\s+${functionName}\\s*\\()` +
                `[\\s\\S]*?` +
                `(?=\\n\\s*(?:\\/\\*\\*|\\/\\/|export|const|function|var|class|$))`,
                'gm'
            );

            const match = content.match(functionPattern);
            if (match) {
                analysis.found = true;
                const functionContent = match[0];
                
                // Analyze function characteristics
                analysis.analysis = {
                    hasJSDoc: functionContent.includes('/**'),
                    hasErrorHandling: functionContent.includes('try') && functionContent.includes('catch'),
                    hasLogging: /console\.(log|info|warn|error)|logDebug|logInfo|logWarn|logError/.test(functionContent),
                    estimatedLines: functionContent.split('\n').length,
                    complexity: this.estimateComplexity(functionContent),
                    parameters: this.extractParameters(functionContent),
                    returnType: this.detectReturnType(functionContent)
                };

                // Generate suggestions
                analysis.suggestions = this.generateSuggestions(analysis.analysis, functionContent);
            }

        } catch (error) {
            analysis.error = error.message;
        }

        return analysis;
    }

    estimateComplexity(functionContent) {
        let complexity = 1; // Base complexity
        
        const patterns = [
            /\bif\s*\(/g,           // If statements
            /\belse\s+if\s*\(/g,    // Else if statements
            /\bfor\s*\(/g,          // For loops
            /\bwhile\s*\(/g,        // While loops
            /\bswitch\s*\(/g,       // Switch statements
            /\bcase\s+/g,           // Case statements
            /\bcatch\s*\(/g,        // Catch blocks
            /\?\s*.*\s*:/g,         // Ternary operators
            /&&|\|\|/g              // Logical operators
        ];

        patterns.forEach(pattern => {
            const matches = functionContent.match(pattern);
            if (matches) {
                complexity += matches.length;
            }
        });

        return complexity;
    }

    extractParameters(functionContent) {
        const paramMatch = functionContent.match(/(?:function\s+\w+|const\s+\w+\s*=\s*(?:function)?)\s*\(([^)]*)\)/);
        if (paramMatch && paramMatch[1]) {
            return paramMatch[1].split(',').map(p => p.trim()).filter(p => p);
        }
        return [];
    }

    detectReturnType(functionContent) {
        if (functionContent.includes('return {')) return 'Object';
        if (functionContent.includes('return [')) return 'Array';
        if (functionContent.includes('return true') || functionContent.includes('return false')) return 'Boolean';
        if (functionContent.includes('return ') && /return\s+\d+/.test(functionContent)) return 'Number';
        if (functionContent.includes('return ') && /return\s+['"`]/.test(functionContent)) return 'String';
        if (functionContent.includes('return;') || !functionContent.includes('return ')) return 'void';
        return 'Mixed';
    }

    generateSuggestions(analysis, functionContent) {
        const suggestions = [];

        if (!analysis.hasJSDoc) {
            suggestions.push({
                type: 'documentation',
                message: 'Add JSDoc comments for better documentation',
                priority: 'medium'
            });
        }

        if (!analysis.hasErrorHandling && analysis.estimatedLines > 10) {
            suggestions.push({
                type: 'error_handling',
                message: 'Consider adding try-catch error handling',
                priority: 'high'
            });
        }

        if (!analysis.hasLogging) {
            suggestions.push({
                type: 'logging',
                message: 'Add logging for debugging and monitoring',
                priority: 'low'
            });
        }

        if (analysis.complexity > 10) {
            suggestions.push({
                type: 'refactoring',
                message: 'Function complexity is high, consider breaking into smaller functions',
                priority: 'high'
            });
        }

        if (analysis.estimatedLines > 50) {
            suggestions.push({
                type: 'refactoring',
                message: 'Function is long, consider splitting into smaller functions',
                priority: 'medium'
            });
        }

        return suggestions;
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

// Initialize processor
const processor = new FileProcessor();

// API Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/parse', async (req, res) => {
    try {
        const { template } = req.body;
        const parsed = processor.parser.parse(template);
        
        if (!parsed.target && parsed.operations.length === 0) {
            return res.status(400).json({ error: 'No valid operations found in template' });
        }
        
        res.json({ success: true, template: parsed });
    } catch (error) {
        console.error('Parse error:', error);
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/load', async (req, res) => {
    try {
        const { filePath } = req.body;
        const content = await processor.loadFile(filePath);
        res.json({ success: true, content });
    } catch (error) {
        console.error('Load error:', error);
        res.status(404).json({ error: error.message });
    }
});

app.post('/api/preview', async (req, res) => {
    try {
        const { template, originalContent } = req.body;
        const processed = processor.processTemplate(template, originalContent);
        res.json({ success: true, content: processed });
    } catch (error) {
        console.error('Preview error:', error);
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/apply', async (req, res) => {
    try {
        const { filePath, content } = req.body;
        const savedPath = await processor.saveFile(filePath, content);
        res.json({ success: true, path: savedPath });
    } catch (error) {
        console.error('Apply error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/files', (req, res) => {
    const { pattern } = req.query;
    
    try {
        const files = findFiles(PROJECT_ROOT, pattern || '**/*.{js,jsx,ts,tsx,md,yaml,yml}');
        res.json({ success: true, files });
    } catch (error) {
        console.error('Files error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        projectRoot: PROJECT_ROOT,
        version: '1.0.0'
    });
});

// Utility functions
function findFiles(dir, pattern) {
    const files = [];
    
    function scan(currentDir) {
        try {
            const items = fs.readdirSync(currentDir);
            
            for (const item of items) {
                const fullPath = path.join(currentDir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                    scan(fullPath);
                } else if (stat.isFile()) {
                    const ext = path.extname(item);
                    if (['.js', '.jsx', '.ts', '.tsx', '.md', '.yaml', '.yml'].includes(ext)) {
                        files.push(path.relative(PROJECT_ROOT, fullPath));
                    }
                }
            }
        } catch (error) {
            console.warn(`Failed to scan directory ${currentDir}:`, error.message);
        }
    }
    
    scan(dir);
    return files;
}

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 AdHoc Code Updater running at http://localhost:${PORT}`);
    console.log(`📁 Project root: ${PROJECT_ROOT}`);
    console.log(`🔧 Ready to process DocDom templates`);
    
    // Setup file watcher for auto-reload (optional)
    if (process.env.NODE_ENV !== 'production') {
        try {
            fileWatcher = chokidar.watch([
                path.join(__dirname, '*.js'),
                path.join(__dirname, '*.html')
            ], { ignoreInitial: true });
            
            fileWatcher.on('change', (filepath) => {
                console.log(`📝 File changed: ${path.basename(filepath)}`);
            });
        } catch (error) {
            console.warn('File watcher setup failed:', error.message);
        }
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Shutting down server...');
    if (fileWatcher) {
        fileWatcher.close();
    }
    process.exit(0);
});

export default app;