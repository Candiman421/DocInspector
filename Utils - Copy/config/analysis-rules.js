// ============================================================================
// ANALYSIS RULES CONFIGURATION
// Quality rules, thresholds, and scoring for DocDom modules
// ============================================================================

export const ES3_RULES = {
    // Critical ES3 compliance - these crash ExtendScript
    forbidden_keywords: [
        'const', 'let', 'class', 'import', 'export', 'async', 'await',
        'yield', 'static', 'extends', 'super'
    ],

    forbidden_patterns: [
        {
            pattern: /=>\s*[{(]/g,
            name: 'arrow_function',
            description: 'Arrow functions not supported in ES3'
        },
        {
            pattern: /`[^`]*`/g,
            name: 'template_literal',
            description: 'Template literals not supported in ES3'
        },
        {
            pattern: /\.\.\./g,
            name: 'spread_operator',
            description: 'Spread operator not supported in ES3'
        },
        {
            pattern: /\[[^\]]*\]\s*=/g,
            name: 'destructuring',
            description: 'Destructuring assignment not supported in ES3'
        }
    ],

    penalty_per_violation: 50,
    critical: true
};

export const RESERVED_WORD_SAFETY = {
    // These specifically crash ExtendScript
    extendscript_crashers: ['export'],

    // Other dangerous reserved words
    dangerous_property_names: [
        'export', 'import', 'class', 'const', 'let', 'static',
        'extends', 'super', 'yield', 'async', 'await'
    ],

    // Patterns to check
    property_usage_patterns: [
        /\b\w+\.({word})\b/,           // obj.export
        /\[['"]({word})['"]\]/,        // obj['export']
        /\{['"]?({word})['"]?\s*:/,    // {export: value}
        /({word})\s*:/                 // export: value
    ],

    penalty_per_violation: 100,
    critical: true
};

export const DEPENDENCY_RULES = {
    load_order_violations: 20,
    circular_dependencies: 200,
    missing_validations: 30,
    undeclared_dependencies: 25,
    critical: true
};

export const LOGGING_RULES = {
    modern_call_bonus: 10,
    legacy_call_penalty: 5,
    invalid_category_penalty: 25,
    target_modern_percentage: 90,

    modern_patterns: [
        'logDebug(', 'logInfo(', 'logWarn(', 'logError(', 'logMessage('
    ],

    legacy_patterns: [
        '$.writeln('
    ],

    valid_categories: [
        'general', 'enumeration', 'sampling', 'display', 'exportData',
        'performance', 'circular', 'preprocessing', 'csv', 'json',
        'text', 'file', 'analysis', 'comparison', 'mapping'
    ],

    // Reserved word 'export' as category crashes ExtendScript
    forbidden_categories: ['export']
};

export const MEMORY_RULES = {
    function_length_warning: 100,
    function_length_critical: 200,
    penalty_per_line_over_warning: 1,
    penalty_per_line_over_critical: 5,
    cleanup_bonus: 20,

    cleanup_patterns: [
        'memoryCleanup', '= null', 'delete ', 'cleanup'
    ]
};

export const FUNCTION_ARCHITECTURE = {
    registration_mismatch_penalty: 15,
    nesting_depth_warning: 3,
    nesting_depth_penalty: 2,
    try_catch_bonus: 5,
    error_logging_bonus: 10,

    error_handling_patterns: [
        'try {', 'catch (', 'finally {'
    ],

    logging_in_catch_patterns: [
        'logError(', 'logWarn(', '$.writeln('
    ]
};

export const API_SAFETY = {
    dangerous_access_penalty: 50,
    validation_bonus: 15,
    environment_check_bonus: 30,

    dangerous_patterns: [
        'prototype', 'constructor', '__proto__', 'caller', 'arguments',
        '__defineGetter__', '__defineSetter__', '__lookupGetter__', '__lookupSetter__'
    ],

    validation_patterns: [
        'isDangerousProperty', 'validateEnvironment', 'validateDocumentState',
        'checkEnvironmentCompatibility'
    ]
};

export const CODE_ORGANIZATION = {
    naming_convention_bonus: 5,
    consistent_formatting_bonus: 10,
    header_structure_bonus: 15,
    section_organization_bonus: 10,

    required_header_elements: [
        '// PURPOSE:', '// DEPENDENCIES:', '// SIZE:'
    ],

    section_header_pattern: /\/\/ =+/g,
    minimum_sections: 3
};

export const PERFORMANCE_PATTERNS = {
    loop_complexity_warning: 3,
    recursion_depth_warning: 5,
    eval_usage_penalty: 100,
    dynamic_code_penalty: 50,

    dangerous_patterns: [
        {
            pattern: /\beval\s*\(/g,
            name: 'eval_usage',
            penalty: 100,
            severity: 'critical'
        },
        {
            pattern: /new Function\s*\(/g,
            name: 'function_constructor',
            penalty: 50,
            severity: 'high'
        },
        {
            pattern: /document\.write\s*\(/g,
            name: 'document_write',
            penalty: 25,
            severity: 'medium'
        }
    ]
};

export const SECURITY_PATTERNS = {
    eval_penalty: 100,
    function_constructor_penalty: 50,
    dynamic_content_penalty: 25,
    input_validation_bonus: 15,
    error_handling_bonus: 10,

    security_violations: [
        {
            pattern: /\beval\s*\(/g,
            name: 'eval_usage',
            severity: 'critical',
            description: 'eval() can execute arbitrary code'
        },
        {
            pattern: /new Function\s*\(/g,
            name: 'function_constructor',
            severity: 'high',
            description: 'Function constructor can execute arbitrary code'
        },
        {
            pattern: /innerHTML\s*=/g,
            name: 'innerHTML_usage',
            severity: 'medium',
            description: 'innerHTML can be vulnerable if not sanitized'
        }
    ],

    positive_patterns: [
        'validate', 'sanitize', 'escape', 'encode'
    ]
};

export const HEALTH_THRESHOLDS = {
    'A+': 950,
    'A': 900,
    'B+': 850,
    'B': 800,
    'C+': 750,
    'C': 700,
    'D': 600
    // F is anything below 600
};

export const SIMILARITY_RULES = {
    exact_duplicate_penalty: 100,
    high_similarity_penalty: 75,       // >90% similar
    moderate_similarity_penalty: 50,   // >75% similar
    cross_module_duplicate_penalty: 150,
    similar_purpose_warning: 25,
    consolidation_opportunity_bonus: 20,

    thresholds: {
        exact_match: 98,
        very_similar: 90,
        similar: 75,
        somewhat_similar: 60
    },

    scoring_weights: {
        signature_similarity: 25,
        content_similarity: 40,
        calls_similarity: 20,
        purpose_similarity: 15
    }
};

export const INTERNAL_DEPENDENCY_RULES = {
    // For analyzing function order within a single module
    forward_reference_penalty: 10,
    undefined_function_penalty: 50,
    circular_reference_penalty: 25,

    // Skip these common patterns that are OK to call before definition
    allowed_forward_references: [
        'registerModule',   // Called at end but defined anywhere
        'toString',         // Built-in methods
        'valueOf',
        'hasOwnProperty'
    ]
};

export const calculateHealthScore = (penalties, bonuses, maxScore = 1000) => {
    const totalPenalties = penalties.reduce((sum, p) => sum + p.value, 0);
    const totalBonuses = bonuses.reduce((sum, b) => sum + b.value, 0);

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
        penalties: totalPenalties,
        bonuses: totalBonuses,
        max_possible: maxScore
    };
};

export default {
    ES3_RULES,
    RESERVED_WORD_SAFETY,
    DEPENDENCY_RULES,
    LOGGING_RULES,
    MEMORY_RULES,
    FUNCTION_ARCHITECTURE,
    API_SAFETY,
    CODE_ORGANIZATION,
    PERFORMANCE_PATTERNS,
    SECURITY_PATTERNS,
    HEALTH_THRESHOLDS,
    SIMILARITY_RULES,
    INTERNAL_DEPENDENCY_RULES,
    calculateHealthScore
};