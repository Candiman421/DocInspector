// core/function-analyzer.js
// FUNCTION ANALYZER CORE MODULE - COMPLETE FIXED VERSION
// ZERO FALSE POSITIVE TOLERANCE - CONTEXT-AWARE DETECTION
// ============================================================================

import chalk from 'chalk';
import {
    ES3_RULES,
    RESERVED_WORD_SAFETY,
    LOGGING_RULES,
    MEMORY_RULES,
    FUNCTION_ARCHITECTURE,
    INTERNAL_DEPENDENCY_RULES,
    CONFIDENCE_LEVELS,
    SEVERITY_CLASSIFICATION,
    calculateHealthScore
} from '../config/analysis-rules.js';

/**
 * Analyze registration compliance between declared and actual functions
 * @param {Object} functions - Functions extracted from module
 * @param {Object} registration - Registration information
 * @returns {Object} Compliance analysis
 */
export const analyzeRegistrationCompliance = (functions, registration) => {
    const analysis = {
        registrationFound: registration.found,
        moduleName: registration.moduleName,
        version: registration.version,
        registeredFunctions: registration.registeredFunctions || [],

        // Compliance analysis
        functionsNotRegistered: [],
        registeredButNotFound: [],
        accuracyPercentage: 0,
        isCompliant: false
    };

    if (!registration.found) {
        analysis.error = 'No registerModule call found';
        return analysis;
    }

    // Get all actual function names (global functions only for registration)
    const actualFunctions = functions.globalFunctions.map(f => f.name);

    // Functions in code but not registered
    analysis.functionsNotRegistered = actualFunctions.filter(name =>
        !analysis.registeredFunctions.includes(name)
    );

    // Functions registered but not in code
    analysis.registeredButNotFound = analysis.registeredFunctions.filter(name =>
        !actualFunctions.includes(name)
    );

    // Calculate accuracy percentage
    if (actualFunctions.length > 0) {
        const correctlyRegistered = actualFunctions.length - analysis.functionsNotRegistered.length;
        const falseRegistrations = analysis.registeredButNotFound.length;

        analysis.accuracyPercentage = Math.round(
            ((correctlyRegistered - falseRegistrations) / actualFunctions.length) * 100
        );
    }

    analysis.isCompliant = analysis.accuracyPercentage === 100;

    return analysis;
};

/**
 * FIXED - Analyze ES3 compliance with context-aware detection
 * NO MORE FALSE POSITIVES on valid ES3 syntax
 * @param {string} content - Module content
 * @returns {Object} ES3 compliance analysis with confidence scores
 */
export const analyzeES3Compliance = (content) => {
    const analysis = {
        compliant: true,
        violations: [],
        totalPenalty: 0,
        criticalViolations: [],
        confidence_summary: {
            high_confidence_violations: 0,
            medium_confidence_violations: 0,
            low_confidence_violations: 0,
            uncertain_violations: 0
        }
    };

    // Test all ES3 violation patterns with context checking
    const allPatterns = [
        ...ES3_RULES.destructuring_patterns,
        ...ES3_RULES.arrow_function_patterns,
        ...ES3_RULES.template_literal_patterns,
        ...ES3_RULES.modern_variable_patterns,
        ...ES3_RULES.spread_operator_patterns,
        ...ES3_RULES.class_patterns
    ];

    allPatterns.forEach(patternConfig => {
        const matches = [...content.matchAll(patternConfig.pattern)];

        matches.forEach(match => {
            const position = match.index;
            const matchText = match[0];

            // CRITICAL: Context verification to eliminate false positives
            let confidence = patternConfig.confidence;
            let isActualViolation = true;

            if (patternConfig.context_check) {
                try {
                    isActualViolation = patternConfig.context_check(
                        matchText, 
                        content, 
                        position,
                        match[1] // captured group if any
                    );
                    
                    // Reduce confidence if context check is uncertain
                    if (!isActualViolation) {
                        return; // Skip this match - false positive
                    }
                } catch (exc) {
                    // Context check failed - reduce confidence significantly
                    confidence = CONFIDENCE_LEVELS.UNCERTAIN;
                    console.warn(`Context check failed for ${patternConfig.name}: ${exc.message}`);
                }
            }

            // Additional confidence adjustments based on surrounding code
            confidence = adjustConfidenceBasedOnContext(content, position, confidence);

            // Only include if confidence is above minimum threshold
            if (confidence < CONFIDENCE_LEVELS.UNCERTAIN) {
                return; // Skip very uncertain detections
            }

            const lineNumber = getLineNumber(content, position);
            
            // Calculate penalty with confidence adjustment
            const basePenalty = ES3_RULES.base_penalty;
            const adjustedPenalty = ES3_RULES.confidence_adjustment(basePenalty, confidence);

            const violation = {
                type: patternConfig.name,
                description: patternConfig.description,
                confidence: confidence,
                confidence_level: getConfidenceLevel(confidence),
                line: lineNumber,
                column: getColumnNumber(content, position),
                code_sample: extractCodeSample(content, position),
                penalty: adjustedPenalty,
                severity: 'CRITICAL', // ES6 syntax is always critical in ExtendScript
                fix_suggestion: generateES3FixSuggestion(patternConfig.name, matchText),
                match_text: matchText
            };

            analysis.violations.push(violation);
            analysis.totalPenalty += adjustedPenalty;
            analysis.compliant = false;

            // Categorize by confidence
            if (confidence >= CONFIDENCE_LEVELS.HIGH) {
                analysis.confidence_summary.high_confidence_violations++;
                analysis.criticalViolations.push(violation);
            } else if (confidence >= CONFIDENCE_LEVELS.MEDIUM) {
                analysis.confidence_summary.medium_confidence_violations++;
            } else if (confidence >= CONFIDENCE_LEVELS.LOW) {
                analysis.confidence_summary.low_confidence_violations++;
            } else {
                analysis.confidence_summary.uncertain_violations++;
            }
        });
    });

    // Add validation against known good patterns
    if (analysis.violations.length > 0) {
        analysis.violations = validateAgainstKnownGoodPatterns(analysis.violations, content);
    }

    return analysis;
};

/**
 * FIXED - Analyze reserved word safety with proper error handling
 * @param {string} content - Module content
 * @returns {Object} Reserved word safety analysis
 */
export const analyzeReservedWordSafety = (content) => {
    const analysis = {
        safe: true,
        violations: [],
        totalPenalty: 0,
        criticalViolations: [],
        confidence_summary: {
            high_confidence_violations: 0,
            medium_confidence_violations: 0,
            low_confidence_violations: 0
        }
    };

    // DEFENSIVE: Check if content exists
    if (!content || typeof content !== 'string') {
        analysis.error = 'No content available for analysis';
        return analysis;
    }

    try {
        // DEFENSIVE: Check if RESERVED_WORD_SAFETY exists
        if (typeof RESERVED_WORD_SAFETY === 'undefined') {
            analysis.error = 'RESERVED_WORD_SAFETY configuration not available';
            return analysis;
        }

        const extendscriptCrashers = RESERVED_WORD_SAFETY.extendscript_crashers || ['export', 'import', 'class'];
        const propertyPatterns = RESERVED_WORD_SAFETY.property_usage_patterns || [];

        extendscriptCrashers.forEach(word => {
            // Simple property access check if patterns are not available
            const dotPattern = new RegExp(`\\w+\\.${word}\\b`, 'g');
            const bracketPattern = new RegExp(`\\w+\\[['"]${word}['"]\\]`, 'g');
            
            const dotMatches = [...content.matchAll(dotPattern)];
            const bracketMatches = [...content.matchAll(bracketPattern)];
            
            [...dotMatches, ...bracketMatches].forEach(match => {
                // Skip if in comments or strings
                if (isInCommentOrString(content, match.index)) {
                    return;
                }

                const violation = {
                    type: 'dangerous_property_usage',
                    word: word,
                    description: `Property '${word}' crashes in ExtendScript`,
                    confidence: 85,
                    line: getLineNumber(content, match.index),
                    penalty: 150,
                    severity: 'CRITICAL',
                    match_text: match[0]
                };

                analysis.violations.push(violation);
                analysis.totalPenalty += violation.penalty;
                analysis.safe = false;
                analysis.criticalViolations.push(violation);
                analysis.confidence_summary.high_confidence_violations++;
            });
        });

    } catch (error) {
        analysis.error = `Analysis failed: ${error.message}`;
    }

    return analysis;
};

/**
 * ENHANCED - Analyze logging compliance with confidence scoring
 * @param {string} content - Module content
 * @returns {Object} Logging compliance analysis
 */
export const analyzeLoggingCompliance = (content) => {
    const analysis = {
        modernCalls: 0,
        legacyCalls: 0,
        invalidCategories: 0,
        violations: [],
        score: 0,
        compliance: 'unknown',
        confidence_summary: {
            high_confidence_violations: 0,
            low_confidence_violations: 0
        }
    };

    // Count modern logging calls with confidence
    LOGGING_RULES.modern_patterns.forEach(pattern => {
        const matches = [...content.matchAll(pattern)];
        analysis.modernCalls += matches.length;
    });

    // Count legacy logging calls
    LOGGING_RULES.legacy_patterns.forEach(pattern => {
        const matches = [...content.matchAll(pattern)];
        analysis.legacyCalls += matches.length;
    });

    // Check for invalid categories (like 'export') with context verification
    LOGGING_RULES.forbidden_categories.forEach(category => {
        const pattern = new RegExp(`log\\w+\\([^,]*,\\s*['"]${category}['"]`, 'g');
        const matches = [...content.matchAll(pattern)];
        
        matches.forEach(match => {
            const position = match.index;
            const lineNum = getLineNumber(content, position);
            
            // Verify this is actually a logging call, not in a comment
            const confidence = isInCommentOrString(content, position) ? 
                CONFIDENCE_LEVELS.UNCERTAIN : CONFIDENCE_LEVELS.HIGH;
            
            if (confidence >= CONFIDENCE_LEVELS.MEDIUM) {
                analysis.invalidCategories++;
                
                const violation = {
                    type: 'forbidden_category',
                    category: category,
                    code: match[0],
                    line: lineNum,
                    confidence: confidence,
                    confidence_level: getConfidenceLevel(confidence),
                    severity: 'CRITICAL',
                    fix: `Replace category '${category}' with valid category (crashes ExtendScript)`,
                    penalty: LOGGING_RULES.invalid_category_penalty
                };
                
                analysis.violations.push(violation);
                
                if (confidence >= CONFIDENCE_LEVELS.HIGH) {
                    analysis.confidence_summary.high_confidence_violations++;
                } else {
                    analysis.confidence_summary.low_confidence_violations++;
                }
            }
        });
    });

    // Calculate metrics and scoring
    const totalCalls = analysis.modernCalls + analysis.legacyCalls;
    const modernPercentage = totalCalls > 0 ? Math.round((analysis.modernCalls / totalCalls) * 100) : 0;

    analysis.modernPercentage = modernPercentage;
    analysis.meetsTarget = modernPercentage >= LOGGING_RULES.target_modern_percentage;

    analysis.score = (analysis.modernCalls * LOGGING_RULES.modern_call_bonus) -
        (analysis.legacyCalls * LOGGING_RULES.legacy_call_penalty) -
        (analysis.invalidCategories * LOGGING_RULES.invalid_category_penalty);

    // Determine compliance level
    if (analysis.meetsTarget && analysis.invalidCategories === 0) {
        analysis.compliance = 'excellent';
    } else if (modernPercentage >= 60 && analysis.invalidCategories === 0) {
        analysis.compliance = 'good';
    } else if (modernPercentage >= 40) {
        analysis.compliance = 'fair';
    } else {
        analysis.compliance = 'poor';
    }

    return analysis;
};

/**
 * FIXED - Analyze function architecture with proper null checks
 * @param {string} content - Module content
 * @param {Object} moduleData - Module data from parser
 * @returns {Object} Function architecture analysis
 */
export const analyzeFunctionArchitecture = (content, moduleData) => {
    const analysis = {
        functionCount: 0,
        globalFunctions: 0,
        nestedFunctions: 0,
        functionsWithErrorHandling: 0,
        functionsWithoutErrorHandling: [],
        errorHandlingCoverage: 0,
        functionsWithLogging: 0,
        functionsWithoutLogging: [],
        loggingCoverage: 0,
        oversizedFunctions: [],
        averageLineCount: 0,
        score: 0,
        issues: []
    };

    // DEFENSIVE: Check if moduleData and functions exist
    if (!moduleData || !moduleData.functions) {
        analysis.error = 'No function data available';
        return analysis;
    }

    const functions = moduleData.functions;
    
    // DEFENSIVE: Ensure arrays exist
    const globalFunctions = functions.globalFunctions || [];
    const nestedFunctions = functions.nestedFunctions || [];

    analysis.functionCount = functions.total || (globalFunctions.length + nestedFunctions.length);
    analysis.globalFunctions = globalFunctions.length;
    analysis.nestedFunctions = nestedFunctions.length;

    let totalLines = 0;

    // Analyze each function
    [...globalFunctions, ...nestedFunctions].forEach(func => {
        // DEFENSIVE: Check if func exists and has expected properties
        if (!func || !func.name) return;

        const lineCount = func.estimatedLineCount || 0;
        totalLines += lineCount;

        // Error handling analysis
        if (func.hasErrorHandling) {
            analysis.functionsWithErrorHandling++;
        } else {
            analysis.functionsWithoutErrorHandling.push(func.name);
        }

        // Logging analysis
        if (func.hasLogging) {
            analysis.functionsWithLogging++;
        } else {
            analysis.functionsWithoutLogging.push(func.name);
        }

        // Function size analysis
        const warningThreshold = 100;
        const criticalThreshold = 200;
        
        if (lineCount > warningThreshold) {
            analysis.oversizedFunctions.push({
                name: func.name,
                lines: lineCount,
                severity: lineCount > criticalThreshold ? 'critical' : 'warning',
                penalty: lineCount > criticalThreshold ? 75 : 25
            });
        }
    });

    // Calculate averages and coverage
    if (analysis.functionCount > 0) {
        analysis.averageLineCount = Math.round(totalLines / analysis.functionCount);
        analysis.errorHandlingCoverage = Math.round((analysis.functionsWithErrorHandling / analysis.functionCount) * 100);
        analysis.loggingCoverage = Math.round((analysis.functionsWithLogging / analysis.functionCount) * 100);
    }

    // Calculate architecture score
    analysis.score = 100;
    analysis.score -= analysis.oversizedFunctions.length * 10;
    analysis.score -= Math.max(0, 50 - analysis.errorHandlingCoverage);
    analysis.score -= Math.max(0, 30 - analysis.loggingCoverage);
    analysis.score = Math.max(0, analysis.score);

    return analysis;
};

/**
 * FIXED - Analyze internal dependencies with proper null checks
 * @param {string} content - Module content
 * @param {Object} moduleData - Module data from parser
 * @returns {Object} Internal dependency analysis
 */
export const analyzeInternalDependencies = (content, moduleData) => {
    const analysis = {
        internalCalls: [],
        externalCalls: [],
        dependencyGraph: {},
        circularDependencies: [],
        unusedFunctions: [],
        score: 100
    };

    // DEFENSIVE: Check if moduleData and functions exist
    if (!moduleData || !moduleData.functions) {
        analysis.error = 'No function data available';
        return analysis;
    }

    const functions = moduleData.functions;
    
    // DEFENSIVE: Ensure required properties exist
    const globalFunctions = functions.globalFunctions || [];
    const callGraph = functions.callGraph || {};

    // Get all function names
    const allFunctionNames = globalFunctions.map(f => f.name || '').filter(name => name);

    // Analyze dependencies for each function
    allFunctionNames.forEach(functionName => {
        const calls = callGraph[functionName] || [];
        
        calls.forEach(calledFunction => {
            if (allFunctionNames.includes(calledFunction)) {
                analysis.internalCalls.push({
                    caller: functionName,
                    callee: calledFunction
                });
                
                if (!analysis.dependencyGraph[functionName]) {
                    analysis.dependencyGraph[functionName] = [];
                }
                analysis.dependencyGraph[functionName].push(calledFunction);
            } else {
                analysis.externalCalls.push({
                    caller: functionName,
                    callee: calledFunction
                });
            }
        });
    });

    // Find unused functions (functions that are never called internally)
    const calledFunctions = new Set(analysis.internalCalls.map(call => call.callee));
    analysis.unusedFunctions = allFunctionNames.filter(name => !calledFunctions.has(name));

    return analysis;
};

/**
 * FIXED - Generate function inventory with proper null checks
 * @param {string} content - Module content
 * @param {Object} moduleData - Module data from parser
 * @param {Object} options - Generation options
 * @returns {Object} Function inventory
 */
export const generateFunctionInventory = (content, moduleData, options = {}) => {
    const inventory = {
        total_count: 0,
        globalCount: 0,
        nestedCount: 0,
        signatures: [],
        withParameters: [],
        withoutParameters: [],
        withErrorHandling: [],
        withoutErrorHandling: [],
        withLogging: [],
        withoutLogging: [],
        oversized: []
    };

    // DEFENSIVE: Check if moduleData and functions exist
    if (!moduleData || !moduleData.functions) {
        inventory.error = 'No function data available';
        inventory.fallback_used = true;
        return inventory;
    }

    const functions = moduleData.functions;
    
    // DEFENSIVE: Ensure arrays exist
    const globalFunctions = functions.globalFunctions || [];
    const nestedFunctions = functions.nestedFunctions || [];
    const signatures = functions.signatures || [];

    inventory.total_count = functions.total || (globalFunctions.length + nestedFunctions.length);
    inventory.globalCount = globalFunctions.length;
    inventory.nestedCount = nestedFunctions.length;
    inventory.signatures = signatures;

    // Analyze each function safely
    [...globalFunctions, ...nestedFunctions].forEach(func => {
        // DEFENSIVE: Check if func exists and has expected properties
        if (!func || !func.name) return;

        // Parameter analysis
        if (func.parameterCount > 0) {
            inventory.withParameters.push({
                name: func.name,
                parameterCount: func.parameterCount,
                parameters: func.parameters || []
            });
        } else {
            inventory.withoutParameters.push(func.name);
        }

        // Error handling
        if (func.hasErrorHandling) {
            inventory.withErrorHandling.push(func.name);
        } else {
            inventory.withoutErrorHandling.push(func.name);
        }

        // Logging
        if (func.hasLogging) {
            inventory.withLogging.push(func.name);
        } else {
            inventory.withoutLogging.push(func.name);
        }

        // Size analysis
        const lineCount = func.estimatedLineCount || 0;
        const warningThreshold = 100;
        
        if (lineCount > warningThreshold) {
            inventory.oversized.push({
                name: func.name,
                lines: lineCount,
                severity: lineCount > 200 ? 'critical' : 'warning'
            });
        }
    });

    // Skip similarity analysis if disabled or if we don't have the required data
    if (options.skipSimilarity || !functions.functionContent) {
        inventory.similarity_analysis = {
            skipped: true,
            reason: options.skipSimilarity ? 'Disabled by option' : 'No function content available'
        };
    }

    return inventory;
};

// =============================================================================
// HELPER FUNCTIONS FOR ACCURATE DETECTION
// =============================================================================

/**
 * Get accurate line number from character position
 * @param {string} content - File content
 * @param {number} position - Character position
 * @returns {number} Line number (1-based)
 */
const getLineNumber = (content, position) => {
    if (position < 0 || position >= content.length) return 1;

    const beforePosition = content.substring(0, position);
    return beforePosition.split('\n').length;
};

/**
 * Get column number from character position
 * @param {string} content - File content
 * @param {number} position - Character position
 * @returns {number} Column number (1-based)
 */
const getColumnNumber = (content, position) => {
    if (position < 0 || position >= content.length) return 1;

    const beforePosition = content.substring(0, position);
    const lastNewline = beforePosition.lastIndexOf('\n');
    
    return position - lastNewline;
};

/**
 * Extract code sample around position for context
 * @param {string} content - File content
 * @param {number} position - Character position
 * @param {number} radius - Characters to include before/after
 * @returns {string} Code sample with context
 */
const extractCodeSample = (content, position, radius = 50) => {
    const start = Math.max(0, position - radius);
    const end = Math.min(content.length, position + radius);
    
    const sample = content.substring(start, end);
    const relativePos = position - start;
    
    // Mark the problematic section
    return sample.substring(0, relativePos) + 
           '>>>' + 
           sample.substring(relativePos, relativePos + 10) + 
           '<<<' + 
           sample.substring(relativePos + 10);
};

/**
 * Adjust confidence based on surrounding context
 * @param {string} content - File content
 * @param {number} position - Character position
 * @param {number} baseConfidence - Initial confidence level
 * @returns {number} Adjusted confidence
 */
const adjustConfidenceBasedOnContext = (content, position, baseConfidence) => {
    let confidence = baseConfidence;

    // Reduce confidence if in comment or string
    if (isInCommentOrString(content, position)) {
        confidence = Math.min(confidence, CONFIDENCE_LEVELS.UNCERTAIN);
    }

    // Reduce confidence if near template or example code
    const beforeContext = content.substring(Math.max(0, position - 200), position);
    const afterContext = content.substring(position, Math.min(content.length, position + 200));
    
    const contextIndicators = [
        'example', 'template', 'todo', 'fixme', 'placeholder',
        'comment out', 'disabled', 'unused'
    ];
    
    contextIndicators.forEach(indicator => {
        if (beforeContext.toLowerCase().includes(indicator) || 
            afterContext.toLowerCase().includes(indicator)) {
            confidence = Math.min(confidence, CONFIDENCE_LEVELS.LOW);
        }
    });

    return confidence;
};

/**
 * Verify property access context for reserved words
 * @param {string} content - File content
 * @param {number} position - Character position
 * @param {string} word - Reserved word
 * @param {number} baseConfidence - Initial confidence
 * @returns {number} Adjusted confidence
 */
const verifyPropertyAccessContext = (content, position, word, baseConfidence) => {
    const beforeContext = content.substring(Math.max(0, position - 30), position);
    const afterContext = content.substring(position, Math.min(content.length, position + 30));
    
    // High confidence if clearly property access
    if (beforeContext.match(/\w+\.$/) || 
        beforeContext.match(/\[$/) && afterContext.match(/^['"]/) ||
        afterContext.match(/^\s*:/)) {
        return Math.max(baseConfidence, CONFIDENCE_LEVELS.HIGH);
    }
    
    // Low confidence if might be variable name
    if (beforeContext.match(/\b(var|let|const|function)\s*$/) ||
        afterContext.match(/^\s*[=(]/)) {
        return Math.min(baseConfidence, CONFIDENCE_LEVELS.LOW);
    }
    
    return baseConfidence;
};

/**
 * Helper function to check if position is in comment or string
 * @param {string} content - File content
 * @param {number} position - Character position
 * @returns {boolean} True if in comment or string
 */
const isInCommentOrString = (content, position) => {
    if (!content || position < 0 || position >= content.length) return false;
    
    const beforePosition = content.substring(0, position);
    
    // Check for single-line comment
    const lastNewline = beforePosition.lastIndexOf('\n');
    const afterNewline = beforePosition.substring(lastNewline);
    if (afterNewline.indexOf('//') !== -1) {
        return true;
    }
    
    // Check for multi-line comment
    const lastCommentStart = beforePosition.lastIndexOf('/*');
    const lastCommentEnd = beforePosition.lastIndexOf('*/');
    if (lastCommentStart > lastCommentEnd) {
        return true;
    }
    
    // Check for string literals
    const doubleQuotes = (beforePosition.match(/"/g) || []).length;
    const singleQuotes = (beforePosition.match(/'/g) || []).length;
    
    return (doubleQuotes % 2 === 1) || (singleQuotes % 2 === 1);
};

/**
 * Get confidence level description
 * @param {number} confidence - Confidence score
 * @returns {string} Confidence level name
 */
const getConfidenceLevel = (confidence) => {
    if (confidence >= CONFIDENCE_LEVELS.CERTAIN) return 'CERTAIN';
    if (confidence >= CONFIDENCE_LEVELS.HIGH) return 'HIGH';
    if (confidence >= CONFIDENCE_LEVELS.MEDIUM) return 'MEDIUM';
    if (confidence >= CONFIDENCE_LEVELS.LOW) return 'LOW';
    return 'UNCERTAIN';
};

/**
 * Generate ES3 fix suggestion based on violation type
 * @param {string} violationType - Type of ES3 violation
 * @param {string} code - Problematic code
 * @returns {string} Fix suggestion
 */
const generateES3FixSuggestion = (violationType, code) => {
    const fixes = {
        'var_destructuring_assignment': 'Replace with explicit assignment: var a = obj.a; var b = obj.b;',
        'function_parameter_destructuring': 'Use traditional parameters and extract properties inside function',
        'array_destructuring': 'Replace with explicit assignment: var a = arr[0]; var b = arr[1];',
        'arrow_function': 'Replace with function expression: function() { ... }',
        'template_literal_interpolation': 'Replace with string concatenation: "text " + expr + " text"',
        'multiline_template_literal': 'Replace with concatenated strings or array.join()',
        'const_declaration': 'Replace with var declaration',
        'let_declaration': 'Replace with var declaration',
        'spread_function_call': 'Replace with .apply() method',
        'spread_array_literal': 'Replace with arrayConcat() helper function',
        'class_declaration': 'Replace with constructor function pattern'
    };
    
    return fixes[violationType] || `Convert ${violationType} to ES3-compatible syntax`;
};

/**
 * Generate reserved word fix suggestion
 * @param {string} word - Reserved word
 * @param {string} code - Problematic code
 * @returns {string} Fix suggestion
 */
const generateReservedWordFix = (word, code) => {
    const suggestions = {
        'export': `Rename to '${word}Settings' or '${word}Config'`,
        'import': `Rename to '${word}Settings' or '${word}Data'`,
        'class': `Rename to '${word}Name' or '${word}Type'`,
        'const': `Rename to '${word}Value' or '${word}Setting'`,
        'let': `Rename to '${word}Value' or '${word}Data'`
    };
    
    return suggestions[word] || `Rename property '${word}' to avoid ExtendScript conflicts`;
};

/**
 * Validate violations against known good patterns to reduce false positives
 * @param {Array} violations - Array of violations
 * @param {string} content - Full content for additional context
 * @returns {Array} Filtered violations
 */
const validateAgainstKnownGoodPatterns = (violations, content) => {
    const knownGoodPatterns = [
        // Valid ES3 patterns that should never be flagged
        /var\s+\w+\s*=\s*\{[^}]*\}/,  // var obj = {prop: value}
        /\w+\[\w+\]\s*=/,              // obj[prop] = value
        /function\s*\w*\s*\([^)]*\)\s*\{/, // function declarations
        /\w+\s*:\s*function\s*\(/      // object methods
    ];

    return violations.filter(violation => {
        // If violation matches a known good pattern, it's likely a false positive
        const codeSnippet = violation.code_sample || violation.match_text || '';
        
        for (const goodPattern of knownGoodPatterns) {
            if (goodPattern.test(codeSnippet)) {
                console.warn(`Filtering potential false positive: ${violation.type} in "${codeSnippet}"`);
                return false;
            }
        }
        
        return true;
    });
};

// Export all analysis functions
export default {
    analyzeRegistrationCompliance,
    analyzeES3Compliance,
    analyzeReservedWordSafety,
    analyzeLoggingCompliance,
    analyzeFunctionArchitecture,
    analyzeInternalDependencies,
    generateFunctionInventory
};