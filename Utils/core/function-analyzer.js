// core/function-analyzer.js
// FIXED: Complete Function Analyzer with ES3 False Positive Elimination
// ============================================================================

import { ES3_COMPLIANCE_PATTERNS, FUNCTION_ANALYSIS_PATTERNS, PATTERN_UTILS } from '../config/patterns.js';

// FIXED: Confidence levels for violation scoring
export const CONFIDENCE_LEVELS = {
    HIGH: 90,      // Definite violation
    MEDIUM: 70,    // Likely violation
    LOW: 50,       // Possible violation
    UNCERTAIN: 30  // Probably false positive
};

// FIXED: Context types for violation assessment
const CONTEXT_TYPES = {
    COMMENT: 'comment',
    STRING: 'string',
    LOGGING_WRAPPER: 'logging_wrapper',
    UTILITY_WRAPPER: 'utility_wrapper',
    VALID_PATTERN: 'valid_pattern',
    POLYFILL: 'polyfill',
    NORMAL_CODE: 'normal_code'
};

/**
 * FIXED: Main ES3 compliance analysis with false positive elimination
 * @param {string} content - Source code content
 * @param {Object} moduleData - Module information
 * @returns {Object} ES3 compliance analysis
 */
export function analyzeES3Compliance(content, moduleData) {
    const analysis = {
        compliant: true,
        violations: [],
        warnings: [],
        summary: {
            total_issues: 0,
            high_confidence: 0,
            medium_confidence: 0,
            low_confidence: 0,
            false_positives_filtered: 0
        },
        confidence_level: 'high'
    };

    try {
        // FIXED: Analyze reserved word property access
        const propertyViolations = analyzeReservedPropertyAccess(content);
        
        // FIXED: Analyze reserved word object keys
        const objectKeyViolations = analyzeReservedObjectKeys(content);
        
        // FIXED: Analyze trailing commas
        const trailingCommaViolations = analyzeTrailingCommas(content);
        
        // FIXED: Analyze modern JavaScript features
        const modernFeatureViolations = analyzeModernFeatures(content);

        // Combine all violations
        const allViolations = [
            ...propertyViolations,
            ...objectKeyViolations,
            ...trailingCommaViolations,
            ...modernFeatureViolations
        ];

        // CRITICAL FIX: Filter false positives using context analysis
        const filteredViolations = filterFalsePositives(allViolations, content);

        // Categorize by confidence
        filteredViolations.forEach(violation => {
            if (violation.confidence >= CONFIDENCE_LEVELS.HIGH) {
                analysis.violations.push(violation);
                analysis.summary.high_confidence++;
            } else if (violation.confidence >= CONFIDENCE_LEVELS.MEDIUM) {
                analysis.violations.push(violation);
                analysis.summary.medium_confidence++;
            } else if (violation.confidence >= CONFIDENCE_LEVELS.LOW) {
                analysis.warnings.push(violation);
                analysis.summary.low_confidence++;
            } else {
                // Count as filtered false positive
                analysis.summary.false_positives_filtered++;
            }
        });

        // Determine overall compliance
        analysis.summary.total_issues = analysis.violations.length + analysis.warnings.length;
        analysis.compliant = analysis.violations.length === 0;

        // Set confidence level for overall analysis
        if (analysis.summary.false_positives_filtered > analysis.summary.total_issues) {
            analysis.confidence_level = 'high'; // High confidence in results due to good filtering
        } else if (analysis.summary.high_confidence > analysis.summary.low_confidence) {
            analysis.confidence_level = 'medium';
        } else {
            analysis.confidence_level = 'low';
        }

    } catch (error) {
        analysis.error = error.message;
        analysis.confidence_level = 'uncertain';
    }

    return analysis;
}

/**
 * FIXED: Analyze reserved word property access with context awareness
 */
function analyzeReservedPropertyAccess(content) {
    const violations = [];
    const pattern = ES3_COMPLIANCE_PATTERNS.reserved_as_property;
    let match;

    // Reset pattern state
    pattern.lastIndex = 0;

    while ((match = pattern.exec(content)) !== null) {
        const position = match.index;
        const reservedWord = match[0].substring(1); // Remove the dot
        
        // CRITICAL FIX: Check context to eliminate false positives
        const context = analyzeViolationContext(content, position, reservedWord);
        const confidence = calculateContextConfidence(context, 'reserved_property');

        // Only include if confidence is above uncertain threshold
        if (confidence > CONFIDENCE_LEVELS.UNCERTAIN) {
            violations.push({
                type: 'reserved_property_access',
                word: reservedWord,
                position: position,
                context: context.type,
                confidence: confidence,
                sample: extractSample(content, position),
                fix: `Use bracket notation: ['${reservedWord}'] instead of .${reservedWord}`,
                severity: confidence >= CONFIDENCE_LEVELS.HIGH ? 'high' : 'medium'
            });
        }
    }

    pattern.lastIndex = 0;
    return violations;
}

/**
 * FIXED: Analyze reserved word object keys
 */
function analyzeReservedObjectKeys(content) {
    const violations = [];
    const pattern = ES3_COMPLIANCE_PATTERNS.reserved_object_keys;
    let match;

    pattern.lastIndex = 0;

    while ((match = pattern.exec(content)) !== null) {
        const position = match.index;
        const reservedWord = match[0].replace(':', '').trim();
        
        const context = analyzeViolationContext(content, position, reservedWord);
        const confidence = calculateContextConfidence(context, 'reserved_object_key');

        if (confidence > CONFIDENCE_LEVELS.UNCERTAIN) {
            violations.push({
                type: 'reserved_object_key',
                word: reservedWord,
                position: position,
                context: context.type,
                confidence: confidence,
                sample: extractSample(content, position),
                fix: `Use quoted key: '${reservedWord}': instead of ${reservedWord}:`,
                severity: confidence >= CONFIDENCE_LEVELS.HIGH ? 'high' : 'medium'
            });
        }
    }

    pattern.lastIndex = 0;
    return violations;
}

/**
 * FIXED: Analyze trailing commas with context
 */
function analyzeTrailingCommas(content) {
    const violations = [];
    const pattern = ES3_COMPLIANCE_PATTERNS.trailing_commas;
    let match;

    pattern.lastIndex = 0;

    while ((match = pattern.exec(content)) !== null) {
        const position = match.index;
        
        const context = analyzeViolationContext(content, position, ',');
        const confidence = calculateContextConfidence(context, 'trailing_comma');

        if (confidence > CONFIDENCE_LEVELS.UNCERTAIN) {
            violations.push({
                type: 'trailing_comma',
                position: position,
                context: context.type,
                confidence: confidence,
                sample: extractSample(content, position),
                fix: 'Remove trailing comma before closing bracket/brace',
                severity: 'medium'
            });
        }
    }

    pattern.lastIndex = 0;
    return violations;
}

/**
 * FIXED: Analyze modern JavaScript features
 */
function analyzeModernFeatures(content) {
    const violations = [];
    const patterns = [
        { pattern: ES3_COMPLIANCE_PATTERNS.modern_array_methods, type: 'modern_array_method' },
        { pattern: ES3_COMPLIANCE_PATTERNS.modern_string_methods, type: 'modern_string_method' },
        { pattern: ES3_COMPLIANCE_PATTERNS.modern_object_methods, type: 'modern_object_method' },
        { pattern: ES3_COMPLIANCE_PATTERNS.json_usage, type: 'json_usage' }
    ];

    patterns.forEach(({ pattern, type }) => {
        let match;
        pattern.lastIndex = 0;

        while ((match = pattern.exec(content)) !== null) {
            const position = match.index;
            const method = match[0];
            
            const context = analyzeViolationContext(content, position, method);
            const confidence = calculateContextConfidence(context, type);

            if (confidence > CONFIDENCE_LEVELS.UNCERTAIN) {
                violations.push({
                    type: type,
                    method: method,
                    position: position,
                    context: context.type,
                    confidence: confidence,
                    sample: extractSample(content, position),
                    fix: getModernFeatureFix(type, method),
                    severity: confidence >= CONFIDENCE_LEVELS.HIGH ? 'high' : 'medium'
                });
            }
        }

        pattern.lastIndex = 0;
    });

    return violations;
}

/**
 * CRITICAL FIX: Analyze violation context to determine if it's a false positive
 */
function analyzeViolationContext(content, position, element) {
    // Check if in comment or string (immediate false positive)
    if (PATTERN_UTILS.isInCommentOrString(content, position)) {
        return { type: CONTEXT_TYPES.COMMENT, confidence_modifier: -60 };
    }

    // Check for valid logging wrappers (major source of false positives)
    if (isInLoggingWrapper(content, position)) {
        return { type: CONTEXT_TYPES.LOGGING_WRAPPER, confidence_modifier: -50 };
    }

    // Check for utility wrappers
    if (isInUtilityWrapper(content, position)) {
        return { type: CONTEXT_TYPES.UTILITY_WRAPPER, confidence_modifier: -40 };
    }

    // Check for polyfill context
    if (isInPolyfillContext(content, position)) {
        return { type: CONTEXT_TYPES.POLYFILL, confidence_modifier: -30 };
    }

    // Check for other valid patterns
    if (isInValidPattern(content, position, element)) {
        return { type: CONTEXT_TYPES.VALID_PATTERN, confidence_modifier: -20 };
    }

    return { type: CONTEXT_TYPES.NORMAL_CODE, confidence_modifier: 0 };
}

/**
 * CRITICAL FIX: Check if position is within a logging wrapper function
 */
function isInLoggingWrapper(content, position) {
    const beforeContext = content.substring(Math.max(0, position - 200), position);
    const afterContext = content.substring(position, Math.min(content.length, position + 100));
    
    // Check for safe logging wrapper patterns
    const loggingPatterns = ES3_COMPLIANCE_PATTERNS.safe_logging_wrappers;
    loggingPatterns.lastIndex = 0;
    
    const fullContext = beforeContext + afterContext;
    const isInLogging = loggingPatterns.test(fullContext);
    
    loggingPatterns.lastIndex = 0;
    return isInLogging;
}

/**
 * FIXED: Check if position is within a utility wrapper function
 */
function isInUtilityWrapper(content, position) {
    const beforeContext = content.substring(Math.max(0, position - 200), position);
    const afterContext = content.substring(position, Math.min(content.length, position + 100));
    
    const utilityPatterns = ES3_COMPLIANCE_PATTERNS.safe_utility_calls;
    utilityPatterns.lastIndex = 0;
    
    const fullContext = beforeContext + afterContext;
    const isInUtility = utilityPatterns.test(fullContext);
    
    utilityPatterns.lastIndex = 0;
    return isInUtility;
}

/**
 * FIXED: Check if position is within polyfill context
 */
function isInPolyfillContext(content, position) {
    const beforeContext = content.substring(Math.max(0, position - 300), position);
    
    const polyfillIndicators = [
        /polyfill/i, /shim/i, /compatibility/i, /fallback/i,
        /es3/i, /extendscript/i, /legacy/i, /safe/i
    ];
    
    return polyfillIndicators.some(pattern => pattern.test(beforeContext));
}

/**
 * FIXED: Check if element is in a valid pattern that shouldn't be flagged
 */
function isInValidPattern(content, position, element) {
    const beforeContext = content.substring(Math.max(0, position - 100), position);
    const afterContext = content.substring(position, Math.min(content.length, position + 100));
    
    // Check for documented exceptions
    const validPatterns = [
        /\/\/\s*ok/i, /\/\/\s*safe/i, /\/\/\s*valid/i,
        /\/\*\s*ok/i, /\/\*\s*safe/i, /\/\*\s*valid/i,
        /exception/i, /allowed/i
    ];
    
    const fullContext = beforeContext + afterContext;
    return validPatterns.some(pattern => pattern.test(fullContext));
}

/**
 * FIXED: Calculate confidence based on context analysis
 */
function calculateContextConfidence(context, violationType) {
    let baseConfidence = CONFIDENCE_LEVELS.HIGH; // Start with high confidence
    
    // Apply context-based modifications
    baseConfidence += context.confidence_modifier;
    
    // Adjust based on violation type
    switch (violationType) {
        case 'reserved_property':
            // Property access is more likely to be problematic
            break;
        case 'reserved_object_key':
            // Object keys are very likely to be problematic
            baseConfidence += 10;
            break;
        case 'trailing_comma':
            // Trailing commas are definite violations
            baseConfidence += 20;
            break;
        case 'json_usage':
            // JSON might be polyfilled, reduce confidence
            baseConfidence -= 10;
            break;
        default:
            break;
    }
    
    // Ensure confidence stays within bounds
    return Math.max(0, Math.min(100, baseConfidence));
}

/**
 * FIXED: Filter false positives from violation list
 */
function filterFalsePositives(violations, content) {
    return violations.filter(violation => {
        // Filter out very low confidence violations
        if (violation.confidence <= CONFIDENCE_LEVELS.UNCERTAIN) {
            return false;
        }
        
        // Additional false positive checks
        if (violation.context === CONTEXT_TYPES.COMMENT || 
            violation.context === CONTEXT_TYPES.STRING) {
            return false;
        }
        
        // Keep valid violations
        return true;
    });
}

/**
 * FIXED: Extract code sample around violation position
 */
function extractSample(content, position) {
    const start = Math.max(0, position - 30);
    const end = Math.min(content.length, position + 30);
    const sample = content.substring(start, end);
    
    const relativePos = position - start;
    return sample.substring(0, relativePos) + 
           '<<<' + 
           sample.substring(relativePos, relativePos + 10) +
           '>>>' +
           sample.substring(relativePos + 10);
}

/**
 * FIXED: Get appropriate fix recommendation for modern features
 */
function getModernFeatureFix(type, method) {
    const fixes = {
        'modern_array_method': 'Use ES3-compatible loop or safety utility function',
        'modern_string_method': 'Use ES3-compatible string manipulation or safety utility',
        'modern_object_method': 'Use ES3-compatible object handling or safety utility',
        'json_usage': 'Ensure JSON object is available or use polyfill'
    };
    
    return fixes[type] || 'Use ES3-compatible alternative';
}

/**
 * FIXED: Analyze reserved word usage patterns
 * @param {string} content - Source code content
 * @returns {Object} Reserved word analysis
 */
export function analyzeReservedWords(content) {
    const analysis = {
        violations: [],
        safe_usage: [],
        total_reserved_words: 0,
        compliance_score: 100
    };

    try {
        // Use the ES3 compliance analysis for reserved words
        const es3Analysis = analyzeES3Compliance(content);
        
        analysis.violations = es3Analysis.violations.filter(v => 
            v.type === 'reserved_property_access' || v.type === 'reserved_object_key'
        );
        
        analysis.total_reserved_words = analysis.violations.length;
        
        // Calculate compliance score
        if (analysis.total_reserved_words > 0) {
            const highConfidenceViolations = analysis.violations.filter(v => 
                v.confidence >= CONFIDENCE_LEVELS.HIGH
            ).length;
            
            analysis.compliance_score = Math.max(0, 100 - (highConfidenceViolations * 10));
        }

    } catch (error) {
        analysis.error = error.message;
        analysis.compliance_score = 0;
    }

    return analysis;
}

/**
 * FIXED: Analyze registration compliance
 * @param {string} content - Source code content
 * @param {Object} moduleData - Module information
 * @returns {Object} Registration compliance analysis
 */
export function analyzeRegistrationCompliance(content, moduleData) {
    const analysis = {
        registeredFunctions: [],
        actualFunctions: [],
        accuracyPercentage: 0,
        missingFunctions: [],
        extraFunctions: [],
        compliant: false
    };

    try {
        // Use the robust registration parser from patterns.js
        const registrationInfo = PATTERN_UTILS.extractRegistrationInfo(content);
        
        if (registrationInfo) {
            analysis.registeredFunctions = registrationInfo.functions;
        }

        // Extract actual function definitions
        analysis.actualFunctions = PATTERN_UTILS.extractFunctionDefinitions(content).map(f => f.name);

        // Calculate accuracy
        const registered = new Set(analysis.registeredFunctions);
        const actual = new Set(analysis.actualFunctions);

        analysis.missingFunctions = [...actual].filter(fn => !registered.has(fn));
        analysis.extraFunctions = [...registered].filter(fn => !actual.has(fn));

        const totalActual = analysis.actualFunctions.length;
        const correctlyRegistered = [...registered].filter(fn => actual.has(fn)).length;
        
        analysis.accuracyPercentage = totalActual > 0 ? 
            Math.round((correctlyRegistered / totalActual) * 100) : 0;
        
        analysis.compliant = analysis.accuracyPercentage >= 95;

    } catch (error) {
        analysis.error = error.message;
        analysis.accuracyPercentage = 0;
    }

    return analysis;
}

/**
 * FIXED: Analyze reserved word safety (wrapper for ES3 compliance)
 * @param {string} content - Source code content
 * @param {Object} moduleData - Module information
 * @returns {Object} Reserved word safety analysis
 */
export function analyzeReservedWordSafety(content, moduleData) {
    const es3Analysis = analyzeES3Compliance(content, moduleData);
    
    return {
        safe: es3Analysis.compliant,
        violations: es3Analysis.violations.filter(v => 
            v.type === 'reserved_property_access' || v.type === 'reserved_object_key'
        ),
        warnings: es3Analysis.warnings,
        confidence_level: es3Analysis.confidence_level,
        total_issues: es3Analysis.summary.total_issues
    };
}

/**
 * FIXED: Analyze logging compliance
 * @param {string} content - Source code content
 * @param {Object} moduleData - Module information
 * @returns {Object} Logging compliance analysis
 */
export function analyzeLoggingCompliance(content, moduleData) {
    const analysis = {
        compliant: true,
        loggingCoverage: 0,
        safeLoggingUsage: 0,
        unsafeLoggingUsage: 0,
        recommendations: []
    };

    try {
        // Count safe logging wrapper usage
        const safeLoggingPattern = ES3_COMPLIANCE_PATTERNS.safe_logging_wrappers;
        safeLoggingPattern.lastIndex = 0;
        const safeMatches = content.match(safeLoggingPattern) || [];
        analysis.safeLoggingUsage = safeMatches.length;

        // Check for unsafe direct console usage
        const unsafeLoggingPattern = /console\.(log|warn|error|info)/g;
        const unsafeMatches = content.match(unsafeLoggingPattern) || [];
        analysis.unsafeLoggingUsage = unsafeMatches.length;

        // Calculate coverage
        const totalLogging = analysis.safeLoggingUsage + analysis.unsafeLoggingUsage;
        analysis.loggingCoverage = totalLogging > 0 ? 
            Math.round((analysis.safeLoggingUsage / totalLogging) * 100) : 100;

        analysis.compliant = analysis.loggingCoverage >= 80;

        if (analysis.unsafeLoggingUsage > 0) {
            analysis.recommendations.push({
                type: 'replace_unsafe_logging',
                description: `Replace ${analysis.unsafeLoggingUsage} direct console calls with safe logging wrappers`,
                action: 'Use logInfo(), logWarn(), logError() instead of console methods'
            });
        }

    } catch (error) {
        analysis.error = error.message;
        analysis.compliant = false;
    }

    return analysis;
}

/**
 * FIXED: Analyze function architecture
 * @param {string} content - Source code content
 * @param {Object} moduleData - Module information
 * @returns {Object} Function architecture analysis
 */
export function analyzeFunctionArchitecture(content, moduleData) {
    const analysis = {
        valid: true,
        functionCount: 0,
        averageComplexity: 0,
        largestFunction: null,
        nestedFunctionCount: 0,
        loggingCoverage: 0,
        errorHandling: {
            functionsWithTryCatch: 0,
            totalFunctions: 0,
            coverage: 0
        }
    };

    try {
        // Get all functions
        const functions = PATTERN_UTILS.extractFunctionDefinitions(content);
        analysis.functionCount = functions.length;

        // Analyze nested functions
        const nestedPattern = FUNCTION_ANALYSIS_PATTERNS.nested_functions;
        nestedPattern.lastIndex = 0;
        const nestedMatches = content.match(nestedPattern) || [];
        analysis.nestedFunctionCount = nestedMatches.length;

        // Analyze error handling
        const tryCatchPattern = /try\s*\{[\s\S]*?\}\s*catch/g;
        const tryCatchMatches = content.match(tryCatchPattern) || [];
        analysis.errorHandling.functionsWithTryCatch = tryCatchMatches.length;
        analysis.errorHandling.totalFunctions = analysis.functionCount;
        analysis.errorHandling.coverage = analysis.functionCount > 0 ? 
            Math.round((analysis.errorHandling.functionsWithTryCatch / analysis.functionCount) * 100) : 0;

        // Calculate logging coverage (simplified)
        const loggingMatches = content.match(/(?:logInfo|logWarn|logError|console\.)/g) || [];
        analysis.loggingCoverage = analysis.functionCount > 0 ? 
            Math.min(100, Math.round((loggingMatches.length / analysis.functionCount) * 50)) : 0;

    } catch (error) {
        analysis.error = error.message;
        analysis.valid = false;
    }

    return analysis;
}

/**
 * FIXED: Analyze internal dependencies
 * @param {string} content - Source code content
 * @param {Object} moduleData - Module information
 * @returns {Object} Internal dependency analysis
 */
export function analyzeInternalDependencies(content, moduleData) {
    const analysis = {
        valid: true,
        declaredDependencies: [],
        implicitDependencies: [],
        unusedDependencies: [],
        missingDependencies: [],
        dependencyCompliance: 100
    };

    try {
        // Extract declared dependencies from module metadata
        const metadata = PATTERN_UTILS.extractModuleMetadata(content);
        if (metadata.dependencies) {
            analysis.declaredDependencies = metadata.dependencies
                .split(',')
                .map(dep => dep.trim())
                .filter(dep => dep.length > 0);
        }

        // Find implicit dependencies (function calls that might be external)
        const externalCallPattern = /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
        const calls = [...content.matchAll(externalCallPattern)];
        
        // Filter to likely external calls (not defined in this module)
        const definedFunctions = PATTERN_UTILS.extractFunctionDefinitions(content).map(f => f.name);
        const definedSet = new Set(definedFunctions);
        
        analysis.implicitDependencies = [...new Set(
            calls.map(match => match[1])
                .filter(funcName => !definedSet.has(funcName))
                .filter(funcName => !['if', 'for', 'while', 'switch', 'try', 'catch'].includes(funcName))
                .filter(funcName => funcName.length > 2) // Filter out short names
        )];

        // Calculate compliance
        const totalDeps = analysis.declaredDependencies.length + analysis.implicitDependencies.length;
        const properly_declared = analysis.declaredDependencies.length;
        
        analysis.dependencyCompliance = totalDeps > 0 ? 
            Math.round((properly_declared / totalDeps) * 100) : 100;

    } catch (error) {
        analysis.error = error.message;
        analysis.valid = false;
    }

    return analysis;
}

/**
 * FIXED: Generate function inventory
 * @param {string} content - Source code content
 * @param {Object} moduleData - Module information
 * @param {Object} options - Analysis options
 * @returns {Object} Function inventory
 */
export function generateFunctionInventory(content, moduleData, options = {}) {
    const inventory = {
        total_count: 0,
        globalCount: 0,
        nestedCount: 0,
        withParameters: [],
        withoutParameters: [],
        withErrorHandling: [],
        withoutErrorHandling: [],
        withLogging: [],
        withoutLogging: [],
        oversized: [],
        signatures: [],
        similarity_analysis: { skipped: true, reason: 'Disabled for stability' },
        fallback_used: false
    };

    try {
        // Use robust function extraction
        const functions = PATTERN_UTILS.extractFunctionDefinitions(content);
        inventory.total_count = functions.length;

        functions.forEach(func => {
            // Parameter analysis
            const paramCount = func.params ? func.params.split(',').filter(p => p.trim()).length : 0;
            
            if (paramCount > 0) {
                inventory.withParameters.push({
                    name: func.name,
                    parameterCount: paramCount,
                    parameters: func.params.split(',').map(p => p.trim())
                });
            } else {
                inventory.withoutParameters.push(func.name);
            }

            // Estimate function context for error handling and logging
            const funcStart = func.index;
            const funcEnd = content.indexOf('}', funcStart + func.fullMatch.length);
            const funcContent = funcEnd > funcStart ? content.substring(funcStart, funcEnd) : '';

            // Error handling analysis
            if (funcContent.includes('try') && funcContent.includes('catch')) {
                inventory.withErrorHandling.push(func.name);
            } else {
                inventory.withoutErrorHandling.push(func.name);
            }

            // Logging analysis
            if (/(?:logInfo|logWarn|logError|console\.)/.test(funcContent)) {
                inventory.withLogging.push(func.name);
            } else {
                inventory.withoutLogging.push(func.name);
            }

            // Size analysis (estimate lines)
            const lines = (funcContent.match(/\n/g) || []).length + 1;
            if (lines > 50) {
                inventory.oversized.push({
                    name: func.name,
                    lines: lines,
                    severity: lines > 100 ? 'critical' : 'warning'
                });
            }

            // Add to signatures
            inventory.signatures.push({
                name: func.name,
                parameters: func.params || '',
                complexity_estimate: lines
            });
        });

        // Count nested vs global (simplified)
        const nestedPattern = FUNCTION_ANALYSIS_PATTERNS.nested_functions;
        nestedPattern.lastIndex = 0;
        const nestedCount = (content.match(nestedPattern) || []).length;
        inventory.nestedCount = nestedCount;
        inventory.globalCount = inventory.total_count - nestedCount;

    } catch (error) {
        inventory.error = error.message;
        inventory.fallback_used = true;
    }

    return inventory;
}

/**
 * FIXED: Main function analysis entry point
 * @param {string} content - Source code content
 * @param {Object} moduleData - Module information
 * @returns {Object} Complete function analysis
 */
export function analyzeFunctions(content, moduleData) {
    return {
        es3_compliance: analyzeES3Compliance(content, moduleData),
        reserved_words: analyzeReservedWords(content),
        registration_compliance: analyzeRegistrationCompliance(content, moduleData),
        logging_compliance: analyzeLoggingCompliance(content, moduleData),
        function_architecture: analyzeFunctionArchitecture(content, moduleData),
        internal_dependencies: analyzeInternalDependencies(content, moduleData),
        analysis_quality: 'high_confidence_with_false_positive_filtering'
    };
}

// Export all functions for individual use and compatibility
export default {
    analyzeES3Compliance,
    analyzeReservedWords,
    analyzeRegistrationCompliance,
    analyzeReservedWordSafety,
    analyzeLoggingCompliance,
    analyzeFunctionArchitecture,
    analyzeInternalDependencies,
    generateFunctionInventory,
    analyzeFunctions,
    CONFIDENCE_LEVELS
};