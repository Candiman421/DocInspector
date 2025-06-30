// Location: Utils/core/module-parser.js
// ============================================================================
// MODULE PARSER CORE MODULE
// Extract functions, metadata, and structure from DocDom module files
// ============================================================================

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { CONTENT_PATTERNS } from '../config/patterns.js';
import { parseRegistrationArray } from '../config/patterns.js';

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
 * ENHANCED - Extract module registration information with multiline support + FULL DEBUGGING
 * @param {string} content - File content
 * @returns {Object} Registration analysis
 */
const extractRegistration = (content) => {
    const registration = {
        found: false,
        moduleName: null,
        version: null,
        registeredFunctions: [],
        registrationCall: null,
        versionMismatch: null,
        debugInfo: {
            hasRegisterModule: false,
            simpleMatchFound: false,
            complexMatchFound: false,
            capturingGroups: 0,
            manualExtractionAttempted: false,
            parsingMethod: null
        }
    };

    try {
        console.log('\n=== ENHANCED DEBUGGING extractRegistration ===');

        // Test if registerModule exists at all
        const hasRegisterModule = content.includes('registerModule');
        registration.debugInfo.hasRegisterModule = hasRegisterModule;
        console.log('Debug - File contains registerModule:', hasRegisterModule);

        if (hasRegisterModule) {
            // Find the basic pattern first
            const simpleMatch = content.match(/registerModule\s*\(/);
            registration.debugInfo.simpleMatchFound = !!simpleMatch;
            console.log('Debug - Simple registerModule match:', simpleMatch ? 'FOUND' : 'NOT FOUND');
        }

        // Test the CORRECTED regex (without global flag)
        const registerMatch = content.match(CONTENT_PATTERNS.register_module);
        registration.debugInfo.complexMatchFound = !!registerMatch;
        console.log('Debug - Complex regex match:', registerMatch ? 'FOUND' : 'NOT FOUND');

        if (registerMatch) {
            console.log('\n--- FULL MATCH OBJECT DEBUG ---');
            registration.debugInfo.capturingGroups = registerMatch.length;
            console.log('Total capturing groups:', registerMatch.length);

            for (let i = 0; i < registerMatch.length; i++) {
                const value = registerMatch[i];
                if (value !== undefined) {
                    const preview = value.length > 100 ? value.slice(0, 100) + '...' : value;
                    console.log(`  [${i}]: "${preview}"`);
                } else {
                    console.log(`  [${i}]: undefined`);
                }
            }

            console.log('\n--- EXPECTED CONTENT ---');
            console.log('Module name should be at index 2:', registerMatch[2]);
            console.log('Version should be at index 4:', registerMatch[4]);
            console.log('Array content should be at index 5:', registerMatch[5] ? 'EXISTS' : 'UNDEFINED');

            if (registerMatch[2] && registerMatch[4] && registerMatch[5]) {
                registration.found = true;
                registration.moduleName = registerMatch[2];
                registration.version = registerMatch[4];
                registration.registrationCall = registerMatch[0];
                registration.debugInfo.parsingMethod = 'regex_success';

                // Debug array parsing
                const arrayContent = registerMatch[5];
                console.log('\n--- ARRAY PARSING DEBUG ---');
                console.log('Raw array content exists, length:', arrayContent.length);
                console.log('Calling parseRegistrationArray...');

                registration.registeredFunctions = parseRegistrationArray(arrayContent);
                console.log('parseRegistrationArray returned:', registration.registeredFunctions.length, 'functions');
                
                if (registration.registeredFunctions.length > 0) {
                    console.log('First 5 functions:', registration.registeredFunctions.slice(0, 5));
                }
            } else {
                console.log('ERROR: Some capturing groups undefined - falling back to manual extraction');
            }
        }

        // Enhanced manual extraction if regex failed
        if (!registration.found) {
            console.log('\n--- ENHANCED MANUAL EXTRACTION ---');
            registration.debugInfo.manualExtractionAttempted = true;
            
            // More robust manual pattern
            const manualMatch = content.match(/registerModule\s*\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*\[([\s\S]*?)\]\s*\)/);
            
            if (manualMatch) {
                console.log('Enhanced manual extraction SUCCESS');
                registration.found = true;
                registration.moduleName = manualMatch[1];
                registration.version = manualMatch[2];
                registration.registrationCall = manualMatch[0];
                registration.debugInfo.parsingMethod = 'manual_success';
                
                registration.registeredFunctions = parseRegistrationArray(manualMatch[3]);
                console.log('Manual functions found:', registration.registeredFunctions.length);
                
                if (registration.registeredFunctions.length > 0) {
                    console.log('First 5 functions:', registration.registeredFunctions.slice(0, 5));
                }
            } else {
                console.log('Enhanced manual extraction also FAILED');
                registration.debugInfo.parsingMethod = 'failed';
                
                // Show the actual registerModule call for debugging
                const callMatch = content.match(/registerModule[\s\S]{0,500}/);
                if (callMatch) {
                    console.log('Actual registerModule call found:');
                    console.log(callMatch[0]);
                }
            }
        }

        // Version mismatch detection
        if (registration.found && registration.moduleName) {
            const moduleNameParts = registration.moduleName.split('_');
            const registeredVersion = moduleNameParts[0];
            
            // Extract version from module name for comparison
            console.log('\n--- VERSION MISMATCH DETECTION ---');
            console.log('Registered module name:', registration.moduleName);
            console.log('Extracted registered version:', registeredVersion);
            
            registration.versionMismatch = {
                hasNameVersionPrefix: !!registeredVersion,
                registeredNameVersion: registeredVersion,
                registeredCallVersion: registration.version
            };
        }

        console.log('\n--- FINAL REGISTRATION OBJECT ---');
        console.log('Found:', registration.found);
        console.log('Module name:', registration.moduleName);
        console.log('Version:', registration.version);
        console.log('Functions count:', registration.registeredFunctions.length);
        console.log('Parsing method:', registration.debugInfo.parsingMethod);
        console.log('=== END ENHANCED DEBUGGING ===\n');

    } catch (error) {
        console.log('ERROR in extractRegistration:', error.message);
        registration.error = error.message;
        registration.debugInfo.parsingMethod = 'error';
    }

    return registration;
};

/**
 * Validate filename vs registration consistency
 * @param {string} filename - Module filename
 * @param {Object} registration - Registration object
 * @returns {Object} Validation result
 */
const validateFilenameRegistration = (filename, registration) => {
    const validation = {
        consistent: true,
        issues: [],
        filenameVersion: null,
        registeredVersion: null,
        recommendations: []
    };

    try {
        // Extract version from filename
        const filenameMatch = filename.match(/^(\d+(?:\.\d+)*)_(.+)\.jsx?$/);
        if (filenameMatch) {
            validation.filenameVersion = filenameMatch[1];
        }

        // Extract version from registration
        if (registration.found && registration.moduleName) {
            const moduleNameParts = registration.moduleName.split('_');
            validation.registeredVersion = moduleNameParts[0];
        }

        // Compare versions
        if (validation.filenameVersion && validation.registeredVersion) {
            if (validation.filenameVersion !== validation.registeredVersion) {
                validation.consistent = false;
                validation.issues.push({
                    type: 'version_mismatch',
                    severity: 'high',
                    description: `Filename version (${validation.filenameVersion}) doesn't match registration version (${validation.registeredVersion})`,
                    filename: filename,
                    registrationCall: registration.registrationCall
                });
                
                validation.recommendations.push({
                    action: 'update_registration',
                    description: `Update registerModule() call to use version '${validation.filenameVersion}'`,
                    suggestedFix: `registerModule('${validation.filenameVersion}_${registration.moduleName.split('_')[1]}', '${registration.version}', [...`
                });
            }
        }

    } catch (error) {
        validation.error = error.message;
    }

    return validation;
};

/**
 * Comprehensive registration debugging
 * @param {string} filePath - Module file path
 * @returns {Object} Detailed analysis
 */
const debugRegistrationExtraction = (filePath) => {
    const filename = path.basename(filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n🔍 DEBUGGING REGISTRATION EXTRACTION: ${filename}`);
    console.log('='.repeat(60));
    
    const analysis = {
        filename,
        contentLength: content.length,
        hasRegisterModule: content.includes('registerModule'),
        registerModuleCalls: [],
        extractionAttempts: {
            regex: null,
            manual: null,
            enhanced: null
        },
        finalResult: null
    };
    
    // Find all registerModule calls
    const allCalls = content.match(/registerModule[^;]*/g);
    if (allCalls) {
        analysis.registerModuleCalls = allCalls.map(call => ({
            call: call.substring(0, 100) + (call.length > 100 ? '...' : ''),
            length: call.length
        }));
    }
    
    console.log('📊 Basic Analysis:');
    console.log(`   Content length: ${analysis.contentLength} chars`);
    console.log(`   Contains registerModule: ${analysis.hasRegisterModule}`);
    console.log(`   RegisterModule calls found: ${analysis.registerModuleCalls.length}`);
    
    if (analysis.registerModuleCalls.length > 0) {
        console.log('📋 Found calls:');
        analysis.registerModuleCalls.forEach((call, i) => {
            console.log(`   ${i + 1}. ${call.call}`);
        });
    }
    
    // Test extraction methods
    analysis.extractionAttempts.regex = extractRegistration(content);
    analysis.finalResult = analysis.extractionAttempts.regex;
    
    // Validation
    const validation = validateFilenameRegistration(filename, analysis.finalResult);
    analysis.validation = validation;
    
    console.log('🎯 Final Results:');
    console.log(`   Extraction successful: ${analysis.finalResult.found}`);
    console.log(`   Module name: ${analysis.finalResult.moduleName}`);
    console.log(`   Version: ${analysis.finalResult.version}`);
    console.log(`   Functions count: ${analysis.finalResult.registeredFunctions.length}`);
    console.log(`   Version consistent: ${validation.consistent}`);
    
    if (!validation.consistent) {
        console.log('⚠️  Issues found:');
        validation.issues.forEach(issue => {
            console.log(`   - ${issue.description}`);
        });
        console.log('💡 Recommendations:');
        validation.recommendations.forEach(rec => {
            console.log(`   - ${rec.description}`);
        });
    }
    
    console.log('='.repeat(60));
    
    return analysis;
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
    extractFunctionCalls,
    validateFilenameRegistration,
    debugRegistrationExtraction
};