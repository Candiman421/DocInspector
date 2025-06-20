// ============================================================================
// SIMILARITY ANALYSIS WHITELISTS
// Functions to exclude from duplicate/similarity detection
// ============================================================================

export const SIMILARITY_WHITELIST = {
    // Logging functions - inherently similar by design
    logging_functions: [
        'logDebug', 'logInfo', 'logWarn', 'logError', 'logMessage',
        'debugLog', 'debugPerformance', 'isDebugEnabled'
    ],

    // Export/output functions - similar patterns by necessity
    export_functions: [
        'exportAsJSON', 'exportAsCSV', 'exportAsText', 'exportAsXML',
        'exportData', 'exportResults', 'exportReport', 'exportAnalysis',
        'saveAsJSON', 'saveAsCSV', 'saveAsText', 'saveAsXML'
    ],

    // ES3 compatibility polyfills - necessarily similar across modules
    es3_polyfills: [
        'arrayIndexOf', 'arraySlice', 'arrayJoin', 'arrayPush', 'arrayPop', 'arrayConcat',
        'stringIndexOf', 'stringSubstring', 'stringCharAt', 'stringSplit',
        'stringToLowerCase', 'stringToUpperCase', 'stringReplace', 'stringMatch',
        'objectHasOwnProperty', 'countObjectKeys', 'getObjectKeys'
    ],

    // Safety utility functions - similar safety patterns expected
    safety_functions: [
        'safeTypeCheck', 'safeHasProperty', 'safeGetLength', 'safeGetPropertyValue',
        'safeToString', 'safeParseInt', 'safeParseFloat', 'safeCall',
        'validateInput', 'validateObject', 'validateArray', 'validateString'
    ],

    // Error handling patterns - similar by design
    error_handling: [
        'createErrorResult', 'createSuccessResult', 'handleError', 'logError',
        'createErrorDOMNode', 'createErrorDOMStructure', 'createFallbackResult'
    ],

    // Utility/helper functions - common patterns
    utility_functions: [
        'getCurrentTimestamp', 'generateUniqueID', 'generateTimestamp',
        'trimString', 'createStringBuilder', 'updateStatus', 'retryOperation'
    ],

    // Memory management - similar cleanup patterns
    memory_functions: [
        'memoryCleanup', 'createMemoryMonitor', 'createObjectReferenceTracker',
        'cleanup', 'dispose', 'reset', 'clear'
    ],

    // Path manipulation - similar string operations
    path_functions: [
        'splitPath', 'joinPath', 'getParentPath', 'normalizePath',
        'isAbsolutePath', 'makeAbsolutePath'
    ],

    // Configuration functions - similar setup patterns
    config_functions: [
        'initializeConfig', 'mergeConfig', 'validateConfig', 'getDefaultConfig',
        'setConfig', 'resetConfig', 'updateConfig'
    ]
};

// Function name patterns to automatically whitelist
export const WHITELIST_PATTERNS = [
    // Functions starting with common prefixes
    /^log[A-Z]/,           // logDebug, logInfo, etc.
    /^debug[A-Z]/,         // debugLog, debugPerformance, etc.
    /^export[A-Z]/,        // exportAsJSON, exportAsCSV, etc.
    /^save[A-Z]/,          // saveAsJSON, saveAsCSV, etc.
    /^array[A-Z]/,         // arrayIndexOf, arraySlice, etc.
    /^string[A-Z]/,        // stringIndexOf, stringSubstring, etc.
    /^object[A-Z]/,        // objectHasOwnProperty, objectClone, etc.
    /^safe[A-Z]/,          // safeTypeCheck, safeGetLength, etc.
    /^create[A-Z]/,        // createErrorResult, createStringBuilder, etc.
    /^validate[A-Z]/,      // validateInput, validateConfig, etc.
    /^initialize[A-Z]/,    // initializeConfig, initializeLogging, etc.
    /^generate[A-Z]/,      // generateUniqueID, generateTimestamp, etc.

    // Functions ending with common suffixes
    /Cleanup$/,            // memoryCleanup, nodeCleanup, etc.
    /Config$/,             // getDefaultConfig, mergeConfig, etc.
    /Error$/,              // handleError, logError, etc.
    /Result$/,             // createSuccessResult, createErrorResult, etc.
    /Timestamp$/,          // getCurrentTimestamp, generateTimestamp, etc.
];

// Module-specific whitelists for known architectural patterns
export const MODULE_SPECIFIC_WHITELIST = {
    // Bootstrap foundation functions that appear in multiple modules
    'bootstrap_patterns': [
        'checkEnvironmentCompatibility',
        'initializeModuleSystem',
        'validateDependencies',
        'registerModule',
        'functionExists'
    ],

    // DOM enumeration patterns
    'dom_enumeration_patterns': [
        'enumerateObjectStructure',
        'createDOMNode',
        'createDOMStructure',
        'processProperty',
        'shouldSkipObject',
        'shouldSkipProperty'
    ],

    // Analysis patterns that legitimately appear in analyzers
    'analysis_patterns': [
        'analyzeStructure',
        'generateStatistics',
        'calculateStatistics',
        'processResults',
        'formatResults'
    ]
};

// Context-specific whitelist behavior
export const WHITELIST_CONTEXT = {
    // In version comparison, these patterns are expected to be similar
    version_comparison: {
        // Don't flag as duplicates when comparing versions
        ignore_similarity: true,

        // These are expected to evolve but maintain similarity
        evolution_functions: [
            'main', 'init', 'start', 'run', 'execute',
            'process', 'analyze', 'generate', 'export'
        ]
    },

    // In system analysis, flag these as potential issues
    system_analysis: {
        // Flag cross-module duplicates for these patterns
        flag_cross_module: [
            'initialize', 'setup', 'configure', 'process'
        ],

        // But allow these utility patterns
        allow_utility_patterns: true
    }
};

/**
 * Check if a function should be whitelisted from similarity detection
 * @param {string} functionName - Name of function to check
 * @param {string} context - 'system' or 'version' analysis context
 * @param {string} moduleName - Name of module containing function
 * @returns {boolean} True if function should be ignored in similarity analysis
 */
export const isWhitelisted = (functionName, context = 'system', moduleName = '') => {
    // Check direct whitelist inclusion
    for (const category of Object.values(SIMILARITY_WHITELIST)) {
        if (category.includes(functionName)) {
            return true;
        }
    }

    // Check pattern matching
    for (const pattern of WHITELIST_PATTERNS) {
        if (pattern.test(functionName)) {
            return true;
        }
    }

    // Context-specific behavior
    if (context === 'version') {
        // In version comparison, be more lenient
        if (WHITELIST_CONTEXT.version_comparison.ignore_similarity) {
            const evolutionPatterns = WHITELIST_CONTEXT.version_comparison.evolution_functions;
            if (evolutionPatterns.some(pattern => functionName.toLowerCase().includes(pattern))) {
                return true;
            }
        }
    }

    // Module-specific patterns
    for (const patternList of Object.values(MODULE_SPECIFIC_WHITELIST)) {
        if (patternList.includes(functionName)) {
            return true;
        }
    }

    return false;
};

/**
 * Get whitelist explanation for reporting
 * @param {string} functionName - Function name
 * @returns {string|null} Explanation of why function is whitelisted
 */
export const getWhitelistReason = (functionName) => {
    // Check each category
    for (const [categoryName, functions] of Object.entries(SIMILARITY_WHITELIST)) {
        if (functions.includes(functionName)) {
            return `Whitelisted as ${categoryName.replace('_', ' ')} - inherently similar by design`;
        }
    }

    // Check patterns
    for (const pattern of WHITELIST_PATTERNS) {
        if (pattern.test(functionName)) {
            return `Whitelisted by pattern ${pattern.source} - common utility pattern`;
        }
    }

    return null;
};

export default {
    SIMILARITY_WHITELIST,
    WHITELIST_PATTERNS,
    MODULE_SPECIFIC_WHITELIST,
    WHITELIST_CONTEXT,
    isWhitelisted,
    getWhitelistReason
};