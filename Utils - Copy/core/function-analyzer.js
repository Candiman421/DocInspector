// ============================================================================
// FUNCTION ANALYZER CORE MODULE
// Detailed analysis of function signatures, dependencies, and compliance
// ============================================================================

import chalk from 'chalk';
import {
    ES3_RULES,
    RESERVED_WORD_SAFETY,
    LOGGING_RULES,
    MEMORY_RULES,
    FUNCTION_ARCHITECTURE,
    INTERNAL_DEPENDENCY_RULES
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
 * Analyze ES3 compliance violations
 * @param {string} content - Module content
 * @returns {Object} ES3 compliance analysis
 */
export const analyzeES3Compliance = (content) => {
    const analysis = {
        compliant: true,
        violations: [],
        totalPenalty: 0,
        criticalViolations: []
    };

    // Check forbidden keywords
    ES3_RULES.forbidden_keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
        const matches = [...content.matchAll(regex)];

        if (matches.length > 0) {
            analysis.compliant = false;

            const violation = {
                type: 'forbidden_keyword',
                keyword,
                count: matches.length,
                locations: matches.map(match => getLineNumber(content, match.index)),
                penalty: matches.length * ES3_RULES.penalty_per_violation,
                fix: `Replace '${keyword}' with ES3 alternative`
            };

            analysis.violations.push(violation);
            analysis.totalPenalty += violation.penalty;

            if (ES3_RULES.critical) {
                analysis.criticalViolations.push(violation);
            }
        }
    });

    // Check forbidden patterns
    ES3_RULES.forbidden_patterns.forEach(patternConfig => {
        const matches = [...content.matchAll(patternConfig.pattern)];

        if (matches.length > 0) {
            analysis.compliant = false;

            const violation = {
                type: patternConfig.name,
                description: patternConfig.description,
                count: matches.length,
                locations: matches.map(match => getLineNumber(content, match.index)),
                penalty: matches.length * ES3_RULES.penalty_per_violation,
                examples: matches.slice(0, 3).map(match => ({
                    code: match[0],
                    line: getLineNumber(content, match.index)
                }))
            };

            analysis.violations.push(violation);
            analysis.totalPenalty += violation.penalty;

            if (ES3_RULES.critical) {
                analysis.criticalViolations.push(violation);
            }
        }
    });

    return analysis;
};

/**
 * Analyze reserved word safety violations
 * @param {string} content - Module content
 * @returns {Object} Reserved word safety analysis
 */
export const analyzeReservedWordSafety = (content) => {
    const analysis = {
        safe: true,
        violations: [],
        totalPenalty: 0,
        criticalViolations: []
    };

    RESERVED_WORD_SAFETY.dangerous_property_names.forEach(word => {
        // Check various usage patterns
        RESERVED_WORD_SAFETY.property_usage_patterns.forEach(patternTemplate => {
            const pattern = new RegExp(patternTemplate.source.replace('{word}', word), 'g');
            const matches = [...content.matchAll(pattern)];

            if (matches.length > 0) {
                analysis.safe = false;

                const isCritical = RESERVED_WORD_SAFETY.extendscript_crashers.includes(word);

                const violation = {
                    type: 'dangerous_property_usage',
                    word,
                    pattern: pattern.source,
                    count: matches.length,
                    locations: matches.map(match => getLineNumber(content, match.index)),
                    penalty: matches.length * RESERVED_WORD_SAFETY.penalty_per_violation,
                    critical: isCritical,
                    examples: matches.slice(0, 3).map(match => ({
                        code: match[0],
                        line: getLineNumber(content, match.index)
                    })),
                    fix: isCritical ?
                        `CRITICAL: '${word}' crashes ExtendScript - rename immediately` :
                        `Rename property '${word}' to avoid reserved word conflict`
                };

                analysis.violations.push(violation);
                analysis.totalPenalty += violation.penalty;

                if (violation.critical) {
                    analysis.criticalViolations.push(violation);
                }
            }
        });
    });

    return analysis;
};

/**
 * Analyze logging compliance and modernization
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
        compliance: 'unknown'
    };

    // Count modern logging calls
    LOGGING_RULES.modern_patterns.forEach(pattern => {
        const regex = new RegExp(pattern.replace('(', '\\('), 'g');
        const matches = content.match(regex);
        if (matches) {
            analysis.modernCalls += matches.length;
        }
    });

    // Count legacy logging calls
    LOGGING_RULES.legacy_patterns.forEach(pattern => {
        const regex = new RegExp(pattern.replace('(', '\\(').replace('$', '\\$'), 'g');
        const matches = content.match(regex);
        if (matches) {
            analysis.legacyCalls += matches.length;
        }
    });

    // Check for invalid categories (like 'export')
    LOGGING_RULES.forbidden_categories.forEach(category => {
        const regex = new RegExp(`log\\w+\\([^,]+,\\s*['"]${category}['"]`, 'g');
        const matches = content.match(regex);
        if (matches) {
            analysis.invalidCategories += matches.length;

            matches.forEach(match => {
                const lineNum = getLineNumber(content, content.indexOf(match));
                analysis.violations.push({
                    type: 'forbidden_category',
                    category,
                    code: match,
                    line: lineNum,
                    fix: `Replace category '${category}' with valid category (crashes ExtendScript)`
                });
            });
        }
    });

    // Calculate score and compliance
    const totalCalls = analysis.modernCalls + analysis.legacyCalls;
    const modernPercentage = totalCalls > 0 ? Math.round((analysis.modernCalls / totalCalls) * 100) : 0;

    analysis.modernPercentage = modernPercentage;
    analysis.meetsTarget = modernPercentage >= LOGGING_RULES.target_modern_percentage;

    analysis.score = (analysis.modernCalls * LOGGING_RULES.modern_call_bonus) -
        (analysis.legacyCalls * LOGGING_RULES.legacy_call_penalty) -
        (analysis.invalidCategories * LOGGING_RULES.invalid_category_penalty);

    if (analysis.meetsTarget && analysis.invalidCategories === 0) {
        analysis.compliance = 'excellent';
    } else if (modernPercentage >= 70 && analysis.invalidCategories === 0) {
        analysis.compliance = 'good';
    } else if (modernPercentage >= 50) {
        analysis.compliance = 'fair';
    } else {
        analysis.compliance = 'poor';
    }

    return analysis;
};

/**
 * Analyze function architecture and quality
 * @param {Object} functions - Functions from module
 * @param {string} content - Module content
 * @returns {Object} Function architecture analysis
 */
export const analyzeFunctionArchitecture = (functions, content) => {
    const analysis = {
        functionCount: functions.total,
        globalFunctions: functions.globalFunctions.length,
        nestedFunctions: functions.nestedFunctions.length,

        // Error handling analysis
        functionsWithErrorHandling: 0,
        functionsWithoutErrorHandling: [],
        errorHandlingCoverage: 0,

        // Logging analysis
        functionsWithLogging: 0,
        functionsWithoutLogging: [],
        loggingCoverage: 0,

        // Function length analysis
        oversizedFunctions: [],
        averageLineCount: 0,

        // Architecture compliance
        score: 0,
        issues: []
    };

    let totalLines = 0;

    // Analyze each function
    [...functions.globalFunctions, ...functions.nestedFunctions].forEach(func => {
        totalLines += func.estimatedLineCount;

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

        // Function length analysis
        if (func.estimatedLineCount > MEMORY_RULES.function_length_critical) {
            analysis.oversizedFunctions.push({
                name: func.name,
                lines: func.estimatedLineCount,
                severity: 'critical',
                penalty: (func.estimatedLineCount - MEMORY_RULES.function_length_critical) *
                    MEMORY_RULES.penalty_per_line_over_critical
            });
        } else if (func.estimatedLineCount > MEMORY_RULES.function_length_warning) {
            analysis.oversizedFunctions.push({
                name: func.name,
                lines: func.estimatedLineCount,
                severity: 'warning',
                penalty: (func.estimatedLineCount - MEMORY_RULES.function_length_warning) *
                    MEMORY_RULES.penalty_per_line_over_warning
            });
        }
    });

    // Calculate metrics
    if (functions.total > 0) {
        analysis.averageLineCount = Math.round(totalLines / functions.total);
        analysis.errorHandlingCoverage = Math.round((analysis.functionsWithErrorHandling / functions.total) * 100);
        analysis.loggingCoverage = Math.round((analysis.functionsWithLogging / functions.total) * 100);
    }

    // Calculate score
    analysis.score = (analysis.functionsWithErrorHandling * FUNCTION_ARCHITECTURE.try_catch_bonus) +
        (analysis.functionsWithLogging * FUNCTION_ARCHITECTURE.error_logging_bonus);

    // Subtract penalties for oversized functions
    const totalPenalty = analysis.oversizedFunctions.reduce((sum, func) => sum + func.penalty, 0);
    analysis.score -= totalPenalty;

    // Add issues for poor coverage
    if (analysis.errorHandlingCoverage < 70) {
        analysis.issues.push(`Low error handling coverage: ${analysis.errorHandlingCoverage}%`);
    }

    if (analysis.loggingCoverage < 50) {
        analysis.issues.push(`Low logging coverage: ${analysis.loggingCoverage}%`);
    }

    return analysis;
};

/**
 * Analyze internal function dependencies (order within module)
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
        forwardReferences: []
    };

    // Build position map of function definitions
    const functionPositions = {};
    [...functions.globalFunctions, ...functions.nestedFunctions].forEach(func => {
        functionPositions[func.name] = func.startPosition;
    });

    // Analyze call dependencies
    Object.keys(functions.functionContent).forEach(functionName => {
        const calls = functions.functionContent[functionName].calls;
        const functionPos = functionPositions[functionName];

        analysis.callGraph[functionName] = calls;

        calls.forEach(calledFunction => {
            // Check if called function is defined in this module
            if (functionPositions[calledFunction]) {
                const calledPos = functionPositions[calledFunction];

                // If calling a function defined later, it's a forward reference
                if (calledPos > functionPos) {
                    // Check if it's an allowed forward reference
                    if (!INTERNAL_DEPENDENCY_RULES.allowed_forward_references.includes(calledFunction)) {
                        analysis.hasOrderViolations = true;
                        analysis.forwardReferences.push({
                            caller: functionName,
                            callerLine: getLineNumber(content, functionPos),
                            called: calledFunction,
                            calledLine: getLineNumber(content, calledPos),
                            issue: 'Function calls another function defined later in file'
                        });
                    }
                }
            }
        });
    });

    // Calculate penalties
    const forwardRefPenalty = analysis.forwardReferences.length *
        INTERNAL_DEPENDENCY_RULES.forward_reference_penalty;

    analysis.score = -forwardRefPenalty;

    return analysis;
};

/**
 * Generate function inventory for reporting
 * @param {Object} functions - Functions from module
 * @returns {Object} Function inventory
 */
export const generateFunctionInventory = (functions) => {
    const inventory = {
        // FIXED: Use snake_case naming to match report expectations
        total_count: functions.total,
        globalCount: functions.globalFunctions.length,  // Keep camelCase for backwards compatibility
        nestedCount: functions.nestedFunctions.length,   // Keep camelCase for backwards compatibility
        signatures: functions.signatures,

        // Categorized functions
        withParameters: [],
        withoutParameters: [],
        withErrorHandling: [],
        withoutErrorHandling: [],
        withLogging: [],
        withoutLogging: [],
        oversized: []
    };

    [...functions.globalFunctions, ...functions.nestedFunctions].forEach(func => {
        // Parameter analysis
        if (func.parameterCount > 0) {
            inventory.withParameters.push({
                name: func.name,
                parameterCount: func.parameterCount,
                parameters: func.parameters
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
        if (func.estimatedLineCount > MEMORY_RULES.function_length_warning) {
            inventory.oversized.push({
                name: func.name,
                lines: func.estimatedLineCount,
                severity: func.estimatedLineCount > MEMORY_RULES.function_length_critical ? 'critical' : 'warning'
            });
        }
    });

    return inventory;
};

/**
 * Get line number for a character position in content
 * @param {string} content - File content
 * @param {number} position - Character position
 * @returns {number} Line number
 */
const getLineNumber = (content, position) => {
    if (position < 0 || position >= content.length) return 1;

    const beforePosition = content.substring(0, position);
    return beforePosition.split('\n').length;
};

export default {
    analyzeRegistrationCompliance,
    analyzeES3Compliance,
    analyzeReservedWordSafety,
    analyzeLoggingCompliance,
    analyzeFunctionArchitecture,
    analyzeInternalDependencies,
    generateFunctionInventory
};