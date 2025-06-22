// core/function-analyzer.js
// FUNCTION ANALYZER CORE MODULE - FIXED VERSION
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

            const lineNumber = getAccurateLineNumber(content, position);
            
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
 * FIXED - Analyze reserved word safety with context verification
 * @param {string} content - Module content  
 * @returns {Object} Reserved word safety analysis with confidence scores
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

    RESERVED_WORD_SAFETY.extendscript_crashers.forEach(word => {
        RESERVED_WORD_SAFETY.property_usage_patterns.forEach(patternConfig => {
            // Replace {word} placeholder with actual word
            const patternSource = patternConfig.pattern.source.replace(/\{word\}/g, word);
            const pattern = new RegExp(patternSource, 'g');
            
            const matches = [...content.matchAll(pattern)];

            matches.forEach(match => {
                const position = match.index;
                const matchText = match[0];

                // CRITICAL: Verify this is actually property usage, not variable name
                let confidence = patternConfig.confidence;
                let isActualPropertyUsage = true;

                if (patternConfig.context_check) {
                    try {
                        isActualPropertyUsage = patternConfig.context_check(
                            matchText, 
                            content, 
                            position, 
                            word
                        );
                        
                        if (!isActualPropertyUsage) {
                            return; // Skip - not actually property usage
                        }
                    } catch (exc) {
                        confidence = CONFIDENCE_LEVELS.UNCERTAIN;
                    }
                }

                // Additional context verification for property access
                confidence = verifyPropertyAccessContext(content, position, word, confidence);

                // Skip if confidence too low
                if (confidence < CONFIDENCE_LEVELS.LOW) {
                    return;
                }

                const lineNumber = getAccurateLineNumber(content, position);
                const isCritical = RESERVED_WORD_SAFETY.extendscript_crashers.includes(word);
                
                const basePenalty = RESERVED_WORD_SAFETY.base_penalty;
                const adjustedPenalty = RESERVED_WORD_SAFETY.confidence_adjustment(basePenalty, confidence);

                const violation = {
                    type: 'dangerous_property_usage',
                    word: word,
                    pattern: patternConfig.name,
                    description: `Property '${word}' ${isCritical ? 'crashes' : 'conflicts'} in ExtendScript`,
                    confidence: confidence,
                    confidence_level: getConfidenceLevel(confidence),
                    line: lineNumber,
                    column: getColumnNumber(content, position),
                    code_sample: extractCodeSample(content, position),
                    penalty: adjustedPenalty,
                    severity: isCritical ? 'CRITICAL' : 'HIGH',
                    critical: isCritical,
                    fix_suggestion: generateReservedWordFix(word, matchText),
                    match_text: matchText
                };

                analysis.violations.push(violation);
                analysis.totalPenalty += adjustedPenalty;
                analysis.safe = false;

                // Categorize by confidence
                if (confidence >= CONFIDENCE_LEVELS.HIGH) {
                    analysis.confidence_summary.high_confidence_violations++;
                    if (isCritical) {
                        analysis.criticalViolations.push(violation);
                    }
                } else if (confidence >= CONFIDENCE_LEVELS.MEDIUM) {
                    analysis.confidence_summary.medium_confidence_violations++;
                } else {
                    analysis.confidence_summary.low_confidence_violations++;
                }
            });
        });
    });

    return analysis;
};

/**
 * ENHANCED - Analyze dependency order violations with sequential validation
 * DETECTS: 1.15 → 1.1 violations (like the example you showed)
 * @param {Object} functions - Functions from module
 * @param {string} content - Module content
 * @returns {Object} Internal dependency analysis
 */
export const analyzeInternalDependencies = (functions, content) => {
    const analysis = {
        hasOrderViolations: false,
        violations: [],
        score: 0,
        callGraph: {},
        forwardReferences: [],
        sequentialOrderViolations: []
    };

    // Build position map of function definitions
    const functionPositions = {};
    [...functions.globalFunctions, ...functions.nestedFunctions].forEach(func => {
        functionPositions[func.name] = func.startPosition;
    });

    // Analyze call dependencies with sequential order checking
    Object.keys(functions.functionContent).forEach(functionName => {
        const calls = functions.functionContent[functionName].calls;
        const functionPos = functionPositions[functionName];

        analysis.callGraph[functionName] = calls;

        calls.forEach(calledFunction => {
            // Check if called function is defined in this module
            if (functionPositions[calledFunction]) {
                const calledPos = functionPositions[calledFunction];

                // CRITICAL: Check for dependency order violations
                if (calledPos > functionPos) {
                    // This is a forward reference - check if allowed
                    if (!INTERNAL_DEPENDENCY_RULES.allowed_forward_references.includes(calledFunction)) {
                        analysis.hasOrderViolations = true;
                        
                        const violation = {
                            type: 'forward_reference',
                            caller: functionName,
                            callerLine: getAccurateLineNumber(content, functionPos),
                            called: calledFunction,
                            calledLine: getAccurateLineNumber(content, calledPos),
                            severity: 'MEDIUM',
                            confidence: CONFIDENCE_LEVELS.CERTAIN,
                            issue: 'Function calls another function defined later in file',
                            fix_suggestion: `Move function '${calledFunction}' before '${functionName}' or use function hoisting`
                        };

                        analysis.forwardReferences.push(violation);
                        analysis.violations.push(violation);
                    }
                }
            }
        });
    });

    // Calculate penalties with confidence weighting
    const forwardRefPenalty = analysis.forwardReferences.length * 
        INTERNAL_DEPENDENCY_RULES.forward_reference_penalty;

    analysis.score = -forwardRefPenalty;

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
            const lineNum = getAccurateLineNumber(content, position);
            
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

// =============================================================================
// HELPER FUNCTIONS FOR ACCURATE DETECTION
// =============================================================================

/**
 * Get accurate line number from character position
 * @param {string} content - File content
 * @param {number} position - Character position
 * @returns {number} Line number (1-based)
 */
const getAccurateLineNumber = (content, position) => {
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
 * Check if position is inside comment or string
 * @param {string} content - File content
 * @param {number} position - Character position
 * @returns {boolean} True if inside comment or string
 */
const isInCommentOrString = (content, position) => {
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