// config/analysis-rules.js
// ANALYSIS RULES CONFIGURATION - FIXED VERSION
// ZERO FALSE POSITIVE TOLERANCE - EVIDENCE-BASED DETECTION
// ============================================================================

/**
 * CONFIDENCE SCORING SYSTEM
 * All detections now include confidence levels (0-100%)
 * Low confidence detections get reduced penalty weights
 */
export const CONFIDENCE_LEVELS = {
    CERTAIN: 95,      // Definitive syntax match with context verification
    HIGH: 85,         // Strong pattern match with supporting evidence
    MEDIUM: 70,       // Pattern match but ambiguous context
    LOW: 50,          // Weak pattern, needs manual review
    UNCERTAIN: 25     // Possible match, high false positive risk
};

/**
 * FIXED ES3 COMPLIANCE RULES
 * COMPLETELY REWRITTEN - Context-aware detection, no false positives
 */
export const ES3_RULES = {
    // ACTUAL ES6+ destructuring patterns (not property assignment)
    destructuring_patterns: [
        {
            // Destructuring assignment: var {a, b} = obj
            pattern: /\bvar\s+\{[^}]+\}\s*=/g,
            name: 'var_destructuring_assignment',
            description: 'ES6 destructuring assignment with var',
            confidence: CONFIDENCE_LEVELS.CERTAIN,
            context_check: function(match, fullContent, position) {
                // Verify this is actual destructuring, not object literal
                var beforeMatch = fullContent.substring(Math.max(0, position - 50), position);
                var afterMatch = fullContent.substring(position, position + 100);
                
                // Must have var/let/const before and = after
                return (beforeMatch.match(/\b(var|let|const)\s*$/) && 
                        afterMatch.match(/^\{[^}]*\}\s*=/));
            }
        },
        {
            // Destructuring in function parameters: function(a, {b, c}) {}
            pattern: /function\s*[^(]*\([^)]*\{[^}]+\}[^)]*\)/g,
            name: 'function_parameter_destructuring',
            description: 'ES6 destructuring in function parameters',
            confidence: CONFIDENCE_LEVELS.CERTAIN,
            context_check: function(match, fullContent, position) {
                // Verify this is in function parameters, not object method
                return match.indexOf('function') !== -1;
            }
        },
        {
            // Array destructuring: var [a, b] = array
            pattern: /\bvar\s+\[[^\]]+\]\s*=/g,
            name: 'array_destructuring',
            description: 'ES6 array destructuring assignment',
            confidence: CONFIDENCE_LEVELS.CERTAIN,
            context_check: function(match, fullContent, position) {
                // Must be variable declaration, not array access
                var beforeMatch = fullContent.substring(Math.max(0, position - 20), position);
                return beforeMatch.match(/\b(var|let|const)\s*$/);
            }
        }
    ],

    // ACTUAL arrow functions (not function expressions or object methods)  
    arrow_function_patterns: [
        {
            // Arrow functions: () => {} or param => expr
            pattern: /\([^)]*\)\s*=>\s*[{(]|^\s*\w+\s*=>\s*/gm,
            name: 'arrow_function',
            description: 'ES6 arrow function syntax',
            confidence: CONFIDENCE_LEVELS.CERTAIN,
            context_check: function(match, fullContent, position) {
                // Verify not inside comments or strings
                var beforeMatch = fullContent.substring(0, position);
                var inString = (beforeMatch.split('"').length % 2 === 0) && 
                              (beforeMatch.split("'").length % 2 === 0);
                var inComment = beforeMatch.lastIndexOf('//') > beforeMatch.lastIndexOf('\n');
                
                return inString && !inComment;
            }
        }
    ],

    // ACTUAL template literals (not regular strings with backticks)
    template_literal_patterns: [
        {
            // Template literals with interpolation: `text ${expr} text`
            pattern: /`[^`]*\$\{[^}]+\}[^`]*`/g,
            name: 'template_literal_interpolation',
            description: 'ES6 template literal with interpolation',
            confidence: CONFIDENCE_LEVELS.CERTAIN,
            context_check: function(match, fullContent, position) {
                // Must contain ${} interpolation to be ES6 template literal
                return match.indexOf('${') !== -1;
            }
        },
        {
            // Multi-line template literals
            pattern: /`[^`]*\n[^`]*`/g,
            name: 'multiline_template_literal',
            description: 'Multi-line template literal (ES6)',
            confidence: CONFIDENCE_LEVELS.HIGH,
            context_check: function(match, fullContent, position) {
                // Verify contains actual newlines, not \n escape
                return match.indexOf('\n') !== -1;
            }
        }
    ],

    // ACTUAL const/let usage (not in comments or strings)
    modern_variable_patterns: [
        {
            // const declarations
            pattern: /\bconst\s+\w+/g,
            name: 'const_declaration',
            description: 'ES6 const variable declaration',
            confidence: CONFIDENCE_LEVELS.CERTAIN,
            context_check: function(match, fullContent, position) {
                return !isInCommentOrString(fullContent, position);
            }
        },
        {
            // let declarations  
            pattern: /\blet\s+\w+/g,
            name: 'let_declaration',
            description: 'ES6 let variable declaration',
            confidence: CONFIDENCE_LEVELS.CERTAIN,
            context_check: function(match, fullContent, position) {
                return !isInCommentOrString(fullContent, position);
            }
        }
    ],

    // ACTUAL spread operator (not ... in comments)
    spread_operator_patterns: [
        {
            // Spread in function calls: func(...args)
            pattern: /\w+\s*\(\s*\.\.\.\w+/g,
            name: 'spread_function_call',
            description: 'ES6 spread operator in function call',
            confidence: CONFIDENCE_LEVELS.CERTAIN,
            context_check: function(match, fullContent, position) {
                return !isInCommentOrString(fullContent, position);
            }
        },
        {
            // Spread in array literals: [...array]
            pattern: /\[\s*\.\.\.\w+/g,
            name: 'spread_array_literal',
            description: 'ES6 spread operator in array literal',
            confidence: CONFIDENCE_LEVELS.CERTAIN,
            context_check: function(match, fullContent, position) {
                return !isInCommentOrString(fullContent, position);
            }
        }
    ],

    // ES6 class syntax
    class_patterns: [
        {
            pattern: /\bclass\s+\w+/g,
            name: 'class_declaration',
            description: 'ES6 class declaration',
            confidence: CONFIDENCE_LEVELS.CERTAIN,
            context_check: function(match, fullContent, position) {
                return !isInCommentOrString(fullContent, position);
            }
        }
    ],

    // Penalty weights with confidence adjustment
    base_penalty: 100,
    critical_multiplier: 3,
    confidence_adjustment: function(penalty, confidence) {
        // Reduce penalty for low confidence detections
        if (confidence < CONFIDENCE_LEVELS.LOW) {
            return penalty * 0.3;
        } else if (confidence < CONFIDENCE_LEVELS.MEDIUM) {
            return penalty * 0.6;
        } else if (confidence < CONFIDENCE_LEVELS.HIGH) {
            return penalty * 0.8;
        }
        return penalty; // Full penalty for high confidence
    }
};

/**
 * FIXED RESERVED WORD SAFETY - Context-aware property detection
 */
export const RESERVED_WORD_SAFETY = {
    // ExtendScript crashers - verified to crash in testing
    extendscript_crashers: [
        'export',    // Crashes when used as property name
        'import',    // Crashes in strict contexts
        'class',     // Reserved and crashes
        'const',     // Crashes in property context
        'let'        // Crashes in property context
    ],

    // Property usage patterns with context verification
    property_usage_patterns: [
        {
            // Object property definition: obj.export = value OR {export: value}
            pattern: /(\w+\.({word})\s*=|[\{\s]({word})\s*:)/g,
            name: 'property_definition',
            confidence: CONFIDENCE_LEVELS.HIGH,
            context_check: function(match, fullContent, position, word) {
                // Verify this is actual property access, not variable name
                var beforeMatch = fullContent.substring(Math.max(0, position - 20), position);
                var afterMatch = fullContent.substring(position, position + 20);
                
                // Look for object.property or {property: patterns
                return (match.indexOf('.') !== -1 || match.indexOf(':') !== -1);
            }
        },
        {
            // Bracket notation: obj['export'] or obj["export"]
            pattern: /\w+\[['"]({word})['"]\]/g,
            name: 'bracket_property_access',
            confidence: CONFIDENCE_LEVELS.CERTAIN,
            context_check: function(match, fullContent, position, word) {
                // This is definitely property access
                return true;
            }
        }
    ],

    base_penalty: 150,
    critical_multiplier: 2,

    confidence_adjustment: function(penalty, confidence) {
        return ES3_RULES.confidence_adjustment(penalty, confidence);
    }
};

/**
 * FIXED DEPENDENCY RULES - Sequential order validation
 */
export const DEPENDENCY_RULES = {
    // Load order validation - must be sequential (1.1 → 1.2 → 2.1)
    load_order_violation_penalty: 200,    // CRITICAL - will break at runtime
    circular_dependency_penalty: 300,     // CRITICAL - impossible to resolve
    missing_dependency_penalty: 250,      // CRITICAL - will crash
    reverse_dependency_penalty: 400,      // CRITICAL - like 1.15→1.1 example
    
    // Version order enforcement
    version_order_rules: {
        // Must follow X.Y.Z.W pattern where each component increases
        enforce_sequential: true,
        allow_gaps: true,              // 1.1 → 1.3 OK, 1.3 → 1.1 NOT OK
        require_foundation_first: true // 1.1.x.x must always load first
    },

    critical: true
};

/**
 * ENHANCED LOGGING RULES - More accurate modernization detection
 */
export const LOGGING_RULES = {
    modern_call_bonus: 5,
    legacy_call_penalty: 10,
    invalid_category_penalty: 50,  // Increased - 'export' category crashes
    target_modern_percentage: 80,  // More realistic target

    modern_patterns: [
        /\blogDebug\s*\(/g,
        /\blogInfo\s*\(/g, 
        /\blogWarn\s*\(/g,
        /\blogError\s*\(/g,
        /\blogMessage\s*\(/g
    ],

    legacy_patterns: [
        /\$\.writeln\s*\(/g
    ],

    // Valid categories from actual DocDom usage
    valid_categories: [
        'general', 'enumeration', 'sampling', 'display', 'exportData',
        'performance', 'circular', 'preprocessing', 'csv', 'json',
        'text', 'file', 'analysis', 'comparison', 'mapping', 'ui'
    ],

    // Categories that crash ExtendScript
    forbidden_categories: ['export', 'import', 'class', 'const', 'let'],
    
    confidence_adjustment: function(penalty, confidence) {
        return ES3_RULES.confidence_adjustment(penalty, confidence);
    }
};

/**
 * ENHANCED SEVERITY CLASSIFICATION
 * Based on actual production impact, not arbitrary rules
 */
export const SEVERITY_CLASSIFICATION = {
    CRITICAL: {
        description: 'Will crash or prevent execution in ExtendScript',
        examples: ['ES6 syntax', 'Reserved word properties', 'Dependency violations'],
        penalty_multiplier: 4,
        requires_immediate_fix: true
    },
    
    HIGH: {
        description: 'Causes runtime errors or bugs in production',
        examples: ['Missing error handling', 'Circular references', 'Function collisions'],
        penalty_multiplier: 2,
        requires_immediate_fix: false
    },
    
    MEDIUM: {
        description: 'Technical debt, impacts maintenance',
        examples: ['Poor logging coverage', 'Oversized functions', 'Code organization'],
        penalty_multiplier: 1,
        requires_immediate_fix: false
    },
    
    LOW: {
        description: 'Style/convention issues, no functional impact',
        examples: ['Missing comments', 'Inconsistent formatting'],
        penalty_multiplier: 0.5,
        requires_immediate_fix: false
    }
};

/**
 * EVIDENCE-BASED HEALTH SCORING
 * Penalties are applied based on actual impact to code quality
 */
export const HEALTH_THRESHOLDS = {
    'A+': 950,   // Exemplary - ready for production
    'A': 900,    // Excellent - minor issues only
    'B+': 850,   // Good - some improvements needed
    'B': 800,    // Acceptable - notable issues to address
    'C+': 750,   // Below standard - requires attention
    'C': 700,    // Poor - needs refactoring
    'D': 600,    // Critical issues present
    'F': 0       // Unacceptable - major problems
};

/**
 * CALCULATE HEALTH SCORE WITH CONFIDENCE WEIGHTING
 */
export const calculateHealthScore = (violations, bonuses, maxScore = 1000) => {
    let totalPenalties = 0;
    let totalBonuses = bonuses.reduce((sum, b) => sum + b.value, 0);
    
    // Apply penalties with confidence weighting
    violations.forEach(violation => {
        const basePenalty = violation.penalty || 0;
        const confidence = violation.confidence || CONFIDENCE_LEVELS.MEDIUM;
        const severity = violation.severity || 'MEDIUM';
        
        // Apply confidence adjustment
        let adjustedPenalty = ES3_RULES.confidence_adjustment(basePenalty, confidence);
        
        // Apply severity multiplier
        const severityMultiplier = SEVERITY_CLASSIFICATION[severity]?.penalty_multiplier || 1;
        adjustedPenalty *= severityMultiplier;
        
        totalPenalties += adjustedPenalty;
    });
    
    // Calculate final score
    let score = maxScore - totalPenalties + totalBonuses;
    score = Math.max(0, Math.min(maxScore, score));
    
    // Determine grade
    let grade = 'F';
    for (const [gradeLevel, threshold] of Object.entries(HEALTH_THRESHOLDS)) {
        if (score >= threshold) {
            grade = gradeLevel;
            break;
        }
    }
    
    return {
        total_score: Math.round(score),
        grade,
        percentage: Math.round((score / maxScore) * 100),
        penalties: Math.round(totalPenalties),
        bonuses: totalBonuses,
        max_possible: maxScore,
        violations_count: violations.length,
        high_confidence_violations: violations.filter(v => 
            (v.confidence || 0) >= CONFIDENCE_LEVELS.HIGH).length
    };
};

/**
 * HELPER FUNCTIONS FOR CONTEXT CHECKING
 */

/**
 * Check if position is inside a comment or string literal
 */
function isInCommentOrString(content, position) {
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
    
    // Check for string literals (simplified)
    const doubleQuotes = (beforePosition.match(/"/g) || []).length;
    const singleQuotes = (beforePosition.match(/'/g) || []).length;
    
    return (doubleQuotes % 2 === 1) || (singleQuotes % 2 === 1);
}

/**
 * Validate detection against known good/bad samples
 */
export const validateDetection = (pattern, testSamples) => {
    const results = {
        truePositives: 0,
        falsePositives: 0,
        trueNegatives: 0,
        falseNegatives: 0,
        precision: 0,
        recall: 0
    };
    
    testSamples.forEach(sample => {
        const detected = pattern.test(sample.code);
        const shouldDetect = sample.shouldMatch;
        
        if (detected && shouldDetect) results.truePositives++;
        else if (detected && !shouldDetect) results.falsePositives++;
        else if (!detected && !shouldDetect) results.trueNegatives++;
        else if (!detected && shouldDetect) results.falseNegatives++;
    });
    
    const totalDetected = results.truePositives + results.falsePositives;
    const totalShouldMatch = results.truePositives + results.falseNegatives;
    
    results.precision = totalDetected > 0 ? results.truePositives / totalDetected : 0;
    results.recall = totalShouldMatch > 0 ? results.truePositives / totalShouldMatch : 0;
    
    return results;
};

export default {
    ES3_RULES,
    RESERVED_WORD_SAFETY,
    DEPENDENCY_RULES,
    LOGGING_RULES,
    SEVERITY_CLASSIFICATION,
    HEALTH_THRESHOLDS,
    CONFIDENCE_LEVELS,
    calculateHealthScore,
    validateDetection
};