#!/usr/bin/env node

// ============================================================================
// ADHOC CODE UPDATER SERVER
// Real-time file processing with template-driven updates
// Location: Utils/AdHoc/server.js
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
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// Global state
let fileWatcher = null;
const clients = new Set();

/**
 * Template Parser - Handles Claude response templates
 */
class TemplateParser {
    parse(text) {
        const lines = text.split('\n');
        const template = {
            target: '',
            operations: []
        };

        let currentOperation = null;
        let codeBlock = '';
        let inCodeBlock = false;
        let codeBlockLang = '';

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Parse TARGET
            if (line.startsWith('TARGET:')) {
                template.target = line.substring(7).trim();
                continue;
            }
            
            // Parse REPLACE_FUNCTION
            if (line.startsWith('REPLACE_FUNCTION:')) {
                if (currentOperation) template.operations.push(currentOperation);
                currentOperation = {
                    type: 'REPLACE_FUNCTION',
                    functionName: line.substring(17).trim(),
                    code: ''
                };
                continue;
            }
            
            // Parse INSERT_AFTER
            if (line.startsWith('INSERT_AFTER:')) {
                if (currentOperation) template.operations.push(currentOperation);
                currentOperation = {
                    type: 'INSERT_AFTER',
                    afterFunction: line.substring(13).trim(),
                    code: ''
                };
                continue;
            }
            
            // Parse INSERT_BEFORE
            if (line.startsWith('INSERT_BEFORE:')) {
                if (currentOperation) template.operations.push(currentOperation);
                currentOperation = {
                    type: 'INSERT_BEFORE',
                    beforeFunction: line.substring(14).trim(),
                    code: ''
                };
                continue;
            }
            
            // Parse REPLACE_TEXT
            if (line.startsWith('REPLACE_TEXT:')) {
                if (currentOperation) template.operations.push(currentOperation);
                const parts = line.substring(13).trim();
                const arrowIndex = parts.indexOf(' -> ');
                if (arrowIndex !== -1) {
                    currentOperation = {
                        type: 'REPLACE_TEXT',
                        find: parts.substring(0, arrowIndex).trim(),
                        replace: parts.substring(arrowIndex + 4).trim()
                    };
                    template.operations.push(currentOperation);
                    currentOperation = null;
                }
                continue;
            }
            
            // Parse UPDATE_IMPORTS
            if (line.startsWith('UPDATE_IMPORTS:')) {
                if (currentOperation) template.operations.push(currentOperation);
                currentOperation = {
                    type: 'UPDATE_IMPORTS',
                    code: ''
                };
                continue;
            }
            
            // Parse UPDATE_EXPORTS
            if (line.startsWith('UPDATE_EXPORTS:')) {
                if (currentOperation) template.operations.push(currentOperation);
                currentOperation = {
                    type: 'UPDATE_EXPORTS',
                    code: ''
                };
                continue;
            }
            
            // Handle code blocks
            if (line.startsWith('```')) {
                if (inCodeBlock) {
                    // End of code block
                    if (currentOperation) {
                        currentOperation.code = codeBlock.trim();
                    }
                    inCodeBlock = false;
                    codeBlock = '';
                    codeBlockLang = '';
                } else {
                    // Start of code block
                    inCodeBlock = true;
                    codeBlockLang = line.substring(3).trim();
                }
                continue;
            }
            
            // Collect code block content
            if (inCodeBlock) {
                codeBlock += line + '\n';
            }
        }
        
        // Add final operation
        if (currentOperation) {
            template.operations.push(currentOperation);
        }
        
        return template;
    }
}

/**
 * File Processor - Handles different file types
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
            }
        }
        
        return content;
    }

    replaceFunction(content, functionName, newCode) {
        // Enhanced function replacement with JSDoc support
        const patterns = [
            // const functionName = () => {}
            new RegExp(
                `(\\/\\*\\*[\\s\\S]*?\\*\\/\\s*)?` +           // Optional JSDoc
                `(export\\s+)?` +                             // Optional export
                `const\\s+${functionName}\\s*=\\s*` +         // const funcName =
                `[\\s\\S]*?` +                                // Function content
                `(?=\\n\\s*(?:\\/\\*\\*|\\/\\/|export|const|function|class|$))`, // Stop pattern
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

        throw new Error(`Function '${functionName}' not found`);
    }

    insertAfterFunction(content, afterFunction, newCode) {
        const patterns = [
            new RegExp(
                `(\\/\\*\\*[\\s\\S]*?\\*\\/\\s*)?` +
                `(export\\s+)?` +
                `const\\s+${afterFunction}\\s*=\\s*` +
                `[\\s\\S]*?` +
                `(?=\\n\\s*(?:\\/\\*\\*|\\/\\/|export|const|function|class|$))`,
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
        const findText = find.replace(/['"]/g, ''); // Remove quotes
        const replaceText = replace.replace(/['"]/g, '');
        return content.replace(new RegExp(this.escapeRegex(findText), 'g'), replaceText);
    }

    updateImports(content, newImports) {
        const lines = content.split('\n');
        const firstNonImportIndex = lines.findIndex(line => 
            line.trim() && 
            !line.trim().startsWith('import') && 
            !line.trim().startsWith('//') &&
            !line.trim().startsWith('/*')
        );

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

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Smart function placement
    findBestInsertionPoint(content, hint = '') {
        const lines = content.split('\n');
        
        // Find last function
        let lastFunctionIndex = -1;
        for (let i = lines.length - 1; i >= 0; i--) {
            if (lines[i].match(/^(export\s+)?(const\s+\w+\s*=|function\s+\w+)/)) {
                lastFunctionIndex = i;
                break;
            }
        }
        
        // Find export statement
        let exportIndex = -1;
        for (let i = lines.length - 1; i >= 0; i--) {
            if (lines[i].match(/^export\s+default/)) {
                exportIndex = i;
                break;
            }
        }
        
        if (exportIndex !== -1 && lastFunctionIndex !== -1) {
            return lastFunctionIndex + 1;
        } else if (lastFunctionIndex !== -1) {
            return lastFunctionIndex + 1;
        }
        
        return lines.length;
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
        
        if (!parsed.target) {
            return res.status(400).json({ error: 'No TARGET specified' });
        }
        
        if (parsed.operations.length === 0) {
            return res.status(400).json({ error: 'No operations found' });
        }
        
        res.json({ success: true, template: parsed });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/load', async (req, res) => {
    try {
        const { filePath } = req.body;
        const content = await processor.loadFile(filePath);
        res.json({ success: true, content });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

app.post('/api/preview', async (req, res) => {
    try {
        const { template, originalContent } = req.body;
        const processed = processor.processTemplate(template, originalContent);
        res.json({ success: true, content: processed });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/apply', async (req, res) => {
    try {
        const { filePath, content } = req.body;
        const savedPath = await processor.saveFile(filePath, content);
        res.json({ success: true, path: savedPath });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/files', (req, res) => {
    const { pattern } = req.query;
    
    try {
        const files = findFiles(PROJECT_ROOT, pattern || '**/*.{js,jsx,ts,tsx,md,yaml,yml}');
        res.json({ success: true, files });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Utility functions
function findFiles(dir, pattern) {
    const files = [];
    
    function scan(currentDir) {
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
    }
    
    scan(dir);
    return files;
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 AdHoc Code Updater running at http://localhost:${PORT}`);
    console.log(`📁 Project root: ${PROJECT_ROOT}`);
    console.log(`🔧 Ready to process templates`);
});

export default app;