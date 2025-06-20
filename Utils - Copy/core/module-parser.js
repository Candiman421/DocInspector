// ============================================================================
// MODULE PARSER CORE MODULE
// Extract functions, metadata, and structure from DocDom module files
// ============================================================================

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { CONTENT_PATTERNS } from '../config/patterns.js';

/**
 * Parse a single module file completely
 * @param {string} filePath - Path to module file
 * @returns {Object} Complete module analysis
 */
export const parseModuleFile = (filePath) => {
    const filename = path.basename(filePath);
    const startTime = Date.now();

    try {
        console.log(chalk.cyan(`📋 Parsing: ${filename}`));

        const content = fs.readFileSync(filePath, 'utf8');
        const stats = fs.statSync(filePath);

        const moduleData = {
            filename,
            filePath,
            fileSize: stats.size,
            lastModified: stats.mtime.toISOString(),
            parseTime: 0,

            // Core module information
            metadata: extractModuleMetadata(content, filename, stats),
            functions: extractFunctions(content),
            registration: extractRegistration(content),
            dependencies: extractDependencies(content),

            // Content analysis
            content: {
                lineCount: content.split('\n').length,
                characterCount: content.length,
                commentLines: countCommentLines(content),
                blankLines: countBlankLines(content),
                codeLines: 0  // Will calculate
            },

            // Quality indicators
            quality: {
                hasErrorHandling: content.includes('try {'),
                hasLogging: hasLoggingCalls(content),
                hasValidation: content.includes('validate'),
                hasCleanup: content.includes('cleanup') || content.includes('= null')
            }
        };

        // Calculate code lines (total - comments - blanks)
        moduleData.content.codeLines = moduleData.content.lineCount -
            moduleData.content.commentLines -
            moduleData.content.blankLines;

        moduleData.parseTime = Date.now() - startTime;

        console.log(chalk.green(`   ✅ ${filename} parsed (${moduleData.parseTime}ms)`));
        console.log(chalk.gray(`      Functions: ${moduleData.functions.total}, Lines: ${moduleData.content.lineCount}`));

        return moduleData;

    } catch (error) {
        console.error(chalk.red(`   ❌ Parse error for ${filename}: ${error.message}`));

        return {
            filename,
            filePath,
            error: error.message,
            parseTime: Date.now() - startTime,
            success: false
        };
    }
};

/**
 * Extract module metadata from header comments and content
 * @param {string} content - File content
 * @param {string} filename - Filename
 * @param {Object} stats - File stats
 * @returns {Object} Module metadata
 */
const extractModuleMetadata = (content, filename, stats) => {
    const lines = content.split('\n');
    const versionMatch = filename.match(/^(\d+(?:\.\d+){0,3})_/);

    return {
        filename,
        versionFromFilename: versionMatch ? versionMatch[1] : null,
        fileSizeBytes: stats.size,
        fileSizeKB: Math.round(stats.size / 1024),

        // Extract from header comments
        moduleName: extractFromHeader(content, CONTENT_PATTERNS.module_name),
        purpose: extractFromHeader(content, CONTENT_PATTERNS.purpose),
        dependencies: extractFromHeader(content, CONTENT_PATTERNS.dependencies),
        sizeComment: extractFromHeader(content, CONTENT_PATTERNS.size_comment),

        // Timestamps
        lastModified: stats.mtime.toISOString(),
        parseTimestamp: new Date().toISOString(),

        // Basic feature detection
        hasConfigurationObjects: content.includes('_CONFIG'),
        hasValidationFunctions: content.includes('validate'),
        hasJSDocComments: content.includes('/**'),
        estimatedComplexity: estimateComplexity(content),

        // API usage detection
        apiCallsDetected: detectAPIUsage(content)
    };
};

/**
 * Extract all functions from module content
 * @param {string} content - File content
 * @returns {Object} Function analysis
 */
const extractFunctions = (content) => {
    const functions = {
        globalFunctions: [],
        nestedFunctions: [],
        total: 0,
        signatures: [],
        callGraph: {},
        functionContent: {}
    };

    // Find all function definitions
    const functionMatches = [...content.matchAll(CONTENT_PATTERNS.function_definition)];

    functionMatches.forEach(match => {
        const functionName = match[1];
        const startIndex = match.index;
        const fullMatch = match[0];

        // Extract detailed function information
        const functionInfo = analyzeFunctionDetails(content, functionName, startIndex, fullMatch);

        // Determine if function is nested (simplified heuristic)
        const beforeFunction = content.substring(0, startIndex);
        const openBraces = (beforeFunction.match(/{/g) || []).length;
        const closeBraces = (beforeFunction.match(/}/g) || []).length;
        const isNested = openBraces > closeBraces;

        if (isNested) {
            functions.nestedFunctions.push(functionInfo);
        } else {
            functions.globalFunctions.push(functionInfo);
        }

        // Store function signature
        functions.signatures.push(functionInfo.signature);

        // Extract function content for similarity analysis
        const functionContent = extractFunctionContent(content, startIndex);
        functions.functionContent[functionName] = {
            raw: functionContent,
            normalized: normalizeFunctionContent(functionContent),
            calls: extractFunctionCalls(functionContent)
        };

        // Build call graph
        functions.callGraph[functionName] = extractFunctionCalls(functionContent);
    });

    functions.total = functions.globalFunctions.length + functions.nestedFunctions.length;

    return functions;
};

/**
 * Analyze detailed function information
 * @param {string} content - File content
 * @param {string} functionName - Function name
 * @param {number} startIndex - Start position
 * @param {string} fullMatch - Full regex match
 * @returns {Object} Function details
 */
const analyzeFunctionDetails = (content, functionName, startIndex, fullMatch) => {
    // Extract parameters from signature
    const paramMatch = fullMatch.match(/\(([^)]*)\)/);
    const paramString = paramMatch ? paramMatch[1].trim() : '';
    const parameters = paramString ? paramString.split(',').map(p => p.trim()).filter(p => p) : [];

    // Estimate function length
    const functionLength = estimateFunctionLength(content, startIndex);

    // Check for JSDoc
    const hasJSDoc = checkForJSDoc(content, startIndex);

    // Extract function purpose from comments
    const purpose = extractFunctionPurpose(content, startIndex);

    // Check for error handling
    const functionContent = extractFunctionContent(content, startIndex);
    const hasErrorHandling = functionContent.includes('try {') && functionContent.includes('catch (');

    // Check for logging
    const hasLogging = hasLoggingCalls(functionContent);

    return {
        name: functionName,
        signature: fullMatch.trim(),
        parameterCount: parameters.length,
        parameters,
        estimatedLineCount: functionLength,
        hasJSDoc,
        purpose,
        hasErrorHandling,
        hasLogging,
        startPosition: startIndex
    };
};

/**
 * Extract function content from start position
 * @param {string} content - File content
 * @param {number} startIndex - Function start position
 * @returns {string} Function content
 */
const extractFunctionContent = (content, startIndex) => {
    try {
        const fromStart = content.substring(startIndex);
        let braceCount = 0;
        let endIndex = -1;
        let inFunction = false;

        for (let i = 0; i < fromStart.length; i++) {
            if (fromStart[i] === '{') {
                inFunction = true;
                braceCount++;
            } else if (fromStart[i] === '}') {
                braceCount--;
                if (inFunction && braceCount === 0) {
                    endIndex = i;
                    break;
                }
            }
        }

        if (endIndex > -1) {
            return fromStart.substring(0, endIndex + 1);
        }

        return '';
    } catch (error) {
        return '';
    }
};

/**
 * Normalize function content for comparison
 * @param {string} functionContent - Raw function content
 * @returns {string} Normalized content
 */
const normalizeFunctionContent = (functionContent) => {
    try {
        let normalized = functionContent;

        // Remove comments
        normalized = normalized.replace(/\/\*[\s\S]*?\*\//g, '');
        normalized = normalized.replace(/\/\/.*$/gm, '');

        // Normalize whitespace
        normalized = normalized.replace(/\s+/g, ' ');

        // Normalize variable names (keep structure)
        normalized = normalized.replace(/\bvar\s+\w+/g, 'var VAR');
        normalized = normalized.replace(/\bfunction\s+\w+/g, 'function FUNC');

        // Normalize literals
        normalized = normalized.replace(/'[^']*'/g, "'STRING'");
        normalized = normalized.replace(/"[^"]*"/g, '"STRING"');
        normalized = normalized.replace(/\b\d+\b/g, 'NUM');

        return normalized.trim();
    } catch (error) {
        return functionContent;
    }
};

/**
 * Extract function calls from content
 * @param {string} content - Content to analyze
 * @returns {Array} Array of function names called
 */
const extractFunctionCalls = (content) => {
    const calls = [];
    const keywords = ['if', 'for', 'while', 'switch', 'catch', 'typeof', 'return', 'new'];

    try {
        const callMatches = [...content.matchAll(CONTENT_PATTERNS.function_call)];

        callMatches.forEach(match => {
            const funcName = match[1];
            if (!keywords.includes(funcName) && !calls.includes(funcName)) {
                calls.push(funcName);
            }
        });
    } catch (error) {
        // Silent fail
    }

    return calls;
};

/**
 * Extract module registration information
 * @param {string} content - File content
 * @returns {Object} Registration analysis
 */
const extractRegistration = (content) => {
    const registration = {
        found: false,
        moduleName: null,
        version: null,
        registeredFunctions: [],
        registrationCall: null
    };

    try {
        const registerMatch = content.match(CONTENT_PATTERNS.register_module);

        if (registerMatch) {
            registration.found = true;
            registration.moduleName = registerMatch[1];
            registration.version = registerMatch[2];
            registration.registrationCall = registerMatch[0];

            // Extract function list
            const functionsString = registerMatch[3];
            const functionMatches = functionsString.match(/'([^']+)'/g);

            if (functionMatches) {
                registration.registeredFunctions = functionMatches.map(match => match.slice(1, -1));
            }
        }
    } catch (error) {
        registration.error = error.message;
    }

    return registration;
};

/**
 * Extract dependency information
 * @param {string} content - File content
 * @returns {Object} Dependency analysis
 */
const extractDependencies = (content) => {
    const dependencies = {
        declared: [],
        validated: false,
        validationCall: null
    };

    try {
        // Look for dependency arrays
        const depArrayMatch = content.match(/DEPENDENCIES.*?=.*?\[(.*?)\]/s);
        if (depArrayMatch) {
            const depString = depArrayMatch[1];
            const matches = depString.match(/'([^']+)'/g);
            if (matches) {
                dependencies.declared.push(...matches.map(m => m.slice(1, -1)));
            }
        }

        // Look for validateDependencies calls
        const validateMatch = content.match(CONTENT_PATTERNS.dependency_validation);
        if (validateMatch) {
            dependencies.validated = true;
            dependencies.validationCall = validateMatch[0];

            const depString = validateMatch[1];
            const matches = depString.match(/'([^']+)'/g);
            if (matches) {
                matches.forEach(dep => {
                    const cleaned = dep.slice(1, -1);
                    if (!dependencies.declared.includes(cleaned)) {
                        dependencies.declared.push(cleaned);
                    }
                });
            }
        }
    } catch (error) {
        dependencies.error = error.message;
    }

    return dependencies;
};

/**
 * Helper function to extract information from header comments
 * @param {string} content - File content
 * @param {RegExp} pattern - Regex pattern
 * @returns {string|null} Extracted value
 */
const extractFromHeader = (content, pattern) => {
    const match = content.match(pattern);
    return match ? match[1].trim() : null;
};

/**
 * Count comment lines in content
 * @param {string} content - File content
 * @returns {number} Number of comment lines
 */
const countCommentLines = (content) => {
    const lines = content.split('\n');
    return lines.filter(line => line.trim().startsWith('//')).length;
};

/**
 * Count blank lines in content
 * @param {string} content - File content
 * @returns {number} Number of blank lines
 */
const countBlankLines = (content) => {
    const lines = content.split('\n');
    return lines.filter(line => line.trim() === '').length;
};

/**
 * Check if content has logging calls
 * @param {string} content - Content to check
 * @returns {boolean} True if logging calls found
 */
const hasLoggingCalls = (content) => {
    return CONTENT_PATTERNS.modern_logging.test(content) ||
        CONTENT_PATTERNS.legacy_logging.test(content);
};

/**
 * Estimate function length in lines
 * @param {string} content - File content
 * @param {number} startIndex - Function start position
 * @returns {number} Estimated line count
 */
const estimateFunctionLength = (content, startIndex) => {
    try {
        const functionContent = extractFunctionContent(content, startIndex);
        return functionContent.split('\n').length;
    } catch (error) {
        return 0;
    }
};

/**
 * Check for JSDoc comments before function
 * @param {string} content - File content
 * @param {number} functionStart - Function start position
 * @returns {boolean} True if JSDoc found
 */
const checkForJSDoc = (content, functionStart) => {
    const beforeFunction = content.substring(0, functionStart);
    const lines = beforeFunction.split('\n');

    // Look for /** */ pattern in recent lines
    for (let i = lines.length - 1; i >= Math.max(0, lines.length - 10); i--) {
        if (lines[i].includes('/**') || lines[i].includes('*/')) {
            return true;
        }
    }

    return false;
};

/**
 * Extract function purpose from comments
 * @param {string} content - File content
 * @param {number} functionStart - Function start position
 * @returns {string} Function purpose description
 */
const extractFunctionPurpose = (content, functionStart) => {
    const beforeFunction = content.substring(0, functionStart);
    const lines = beforeFunction.split('\n');

    // Look for JSDoc @param, @returns, or description
    for (let i = lines.length - 1; i >= Math.max(0, lines.length - 15); i--) {
        const line = lines[i].trim();
        if (line.includes('/**') || line.includes('*/')) {
            // Extract description from JSDoc block
            const jsdocStart = beforeFunction.lastIndexOf('/**');
            const jsdocEnd = beforeFunction.lastIndexOf('*/');
            if (jsdocStart > -1 && jsdocEnd > jsdocStart) {
                const jsdocContent = beforeFunction.substring(jsdocStart, jsdocEnd + 2);
                const descMatch = jsdocContent.match(/\/\*\*\s*(.*?)\s*\n/);
                if (descMatch) {
                    return descMatch[1].replace(/\*/g, '').trim();
                }
            }
        }
        // Look for single-line comments
        if (line.startsWith('//') && line.length > 10) {
            return line.replace('//', '').trim();
        }
    }

    return 'No description found';
};

/**
 * Estimate code complexity (simplified metric)
 * @param {string} content - File content
 * @returns {number} Complexity score
 */
const estimateComplexity = (content) => {
    let complexity = 0;

    // Count decision points
    const patterns = [
        /\bif\s*\(/g,
        /\belse\s+if\s*\(/g,
        /\bfor\s*\(/g,
        /\bwhile\s*\(/g,
        /\bswitch\s*\(/g,
        /\bcase\s+/g,
        /\bcatch\s*\(/g,
        /\?\s*.*\s*:/g  // ternary operators
    ];

    patterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
            complexity += matches.length;
        }
    });

    // Add weight for nested structures
    const nesting = (content.match(/{[^}]*{/g) || []).length;
    complexity += nesting * 2;

    return complexity;
};

/**
 * Detect API usage patterns
 * @param {string} content - File content
 * @returns {Array} Array of detected APIs
 */
const detectAPIUsage = (content) => {
    const apis = [];

    const patterns = [
        { name: 'Adobe_App', pattern: /\bapp\./g },
        { name: 'Document_API', pattern: /\.document\b/g },
        { name: 'File_System', pattern: /\bFile\(/g },
        { name: 'JSON_API', pattern: /JSON\./g },
        { name: 'Date_API', pattern: /new Date\(/g },
        { name: 'Array_Methods', pattern: /\.(push|pop|slice|splice|join)\(/g },
        { name: 'String_Methods', pattern: /\.(substring|indexOf|replace|match)\(/g },
        { name: 'Console_Output', pattern: /\$\.writeln\(/g }
    ];

    patterns.forEach(api => {
        const matches = content.match(api.pattern);
        if (matches) {
            apis.push({
                name: api.name,
                usageCount: matches.length
            });
        }
    });

    return apis;
};

export default {
    parseModuleFile,
    extractFunctions,
    extractRegistration,
    extractDependencies,
    extractFunctionContent,
    normalizeFunctionContent,
    extractFunctionCalls
};