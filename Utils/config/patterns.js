// Location: Utils/config/patterns.js
// COMPLETE PATTERNS AND UTILITIES LIBRARY - ALL MISSING EXPORTS FIXED
// FIXES: parseRegistrationArray, DEPENDENCY_TRACKING_PATTERNS, PATTERN_UTILS, CONFIDENCE_LEVELS
// ============================================================================

import fs from 'fs';
import path from 'path';

// ============================================================================
// FILE PATTERNS AND EXCLUSIONS - ENHANCED VERSION
// ============================================================================

// Main pattern for DocDom module files
// SUPPORTS: 1.1_file.jsx, 1.2.1_file.jsx, 1.4.2.1_file.jsx, 1.15.1.2025.20.4_file.jsx
export const MODULE_FILE_PATTERN = /^(\d+(?:\.\d+){0,10})_.*\.jsx?$/;

// Extract version from filename - supports more formats
export const VERSION_EXTRACTION_PATTERN = /^(\d+(?:\.\d+){0,10})_/;

// Common file extensions for modules
export const VALID_EXTENSIONS = ['.js', '.jsx'];

// Folders to exclude from scanning
export const EXCLUDED_FOLDERS = [
    'node_modules', '.git', '.vscode', '.idea',
    'Utils', 'UtilsOutput', 'build', 'dist', 'target',
    'out', 'temp', '.tmp', 'cache', '.cache',
    'coverage', '.nyc_output'
];

// Files to exclude from analysis
export const EXCLUDED_FILES = [
    // Generated assembly files
    /.*_ASSEMBLED_.*\.jsx?$/,
    /.*_INCLUDES_.*\.jsx?$/,

    // Analysis reports
    /^~analysis-.*\.yaml$/,
    /^~module-.*\.yaml$/,
    /^~version-.*\.yaml$/,
    /^~system-.*\.yaml$/,

    // Backup and temporary files
    /\.bak$/, /\.old$/, /\.backup$/, /\.tmp$/,
    /~$/, /#.*#$/, /\.swp$/, /\.swo$/,

    // Test and demo files
    /^test.*\.jsx?$/i, /^demo.*\.jsx?$/i,
    /^example.*\.jsx?$/i, /^sample.*\.jsx?$/i,

    // Hidden files
    /^\./,

    // Package files
    /^package.*\.json$/, /^yarn\.lock$/, /^package-lock\.json$/,

    // Documentation
    /\.md$/, /\.txt$/, /README/i, /CHANGELOG/i, /LICENSE/i
];

// ============================================================================
// VERSION COMPARISON PATTERNS
// ============================================================================

export const VERSION_COMPARISON_PATTERNS = {
    // Files with same decimal prefix but different suffixes
    same_prefix: /^(\d+(?:\.\d+){0,10})_.*$/,

    // Version indicators - supports real-world naming
    version_indicators: [
        // Version numbers
        /_[Vv](\d+(?:\.\d+)*)\.jsx?$/,        // _V3.1.jsx, _v2.0.jsx
        /_version(\d+(?:\.\d+)*)\.jsx?$/,     // _version2.1.jsx
        /_(\d+\.\d+(?:\.\d+)*)\.jsx?$/,       // _2.1.3.jsx

        // Date patterns
        /_(\d{4}-\d{2}-\d{2})\.jsx?$/,        // _2024-03-15.jsx
        /_(\d{8})\.jsx?$/,                    // _20240315.jsx

        // Revision patterns
        /_rev(\d+)\.jsx?$/,                   // _rev12.jsx
        /_r(\d+)\.jsx?$/,                     // _r5.jsx
        /_build(\d+)\.jsx?$/,                 // _build123.jsx

        // Named variants
        /_old\.jsx?$/i, /_new\.jsx?$/i,
        /_latest\.jsx?$/i, /_current\.jsx?$/i,
        /_backup\.jsx?$/i, /_original\.jsx?$/i
    ],

    // Dependency indicators in module names
    dependency_indicators: [
        // Foundation/core modules (should load first)
        /bootstrap/i, /foundation/i, /core/i, /base/i,

        // App adapters (load after foundation)
        /adapter/i, /indesign/i, /photoshop/i, /illustrator/i,

        // Utility modules (load after foundation)
        /safety/i, /utils/i, /utilities/i, /helpers/i,

        // Functionality modules (load after utilities)
        /dom/i, /analyzer/i, /parser/i, /enumerator/i,
        /exporter/i, /visualizer/i, /sampler/i,

        // UI modules (load last)
        /ui/i, /interface/i, /advanced/i, /display/i
    ]
};

// ============================================================================
// CONTENT PATTERNS FOR STATIC ANALYSIS
// ============================================================================

export const CONTENT_PATTERNS = {
    // Function definitions
    function_definition: /^[\s]*function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)/gm,

    // Function calls
    function_call: /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g,

    // CRITICAL FIX: Robust multi-line registration parser
    register_module: /registerModule\s*\(\s*(['"`])([^'"`]+)\1\s*,\s*(['"`])([^'"`]+)\3\s*,\s*\[([\s\S]*?)\]\s*\)\s*;?/s,

    // Dependency validation
    dependency_validation: /validateDependencies\s*\(\s*\[(.*?)\]/s,

    // Header extraction patterns
    module_name: /\/\/\s*([^-\n]+)\s*-/,
    purpose: /\/\/\s*PURPOSE:\s*(.*)/,
    dependencies: /\/\/\s*DEPENDENCIES:\s*(.*)/,
    size_comment: /\/\/\s*SIZE:\s*(.*)/,
    version_comment: /\/\/\s*VERSION:\s*(.*)/,

    // Logging patterns for module-parser.js compatibility
    modern_logging: /log(?:Debug|Info|Warn|Error)\s*\(/g,
    legacy_logging: /console\.(?:log|info|warn|error|debug)\s*\(/g
};

// ============================================================================
// ES3 COMPLIANCE PATTERNS
// ============================================================================

export const ES3_COMPLIANCE_PATTERNS = {
    // Reserved words used as properties (problematic in ES3)
    reserved_as_property: /\.(?:export|import|class|extends|super|const|let|static|default|enum|implements|interface|package|private|protected|public|yield)\b/g,

    // Modern syntax patterns that break in ES3
    modern_syntax: {
        arrow_functions: /=>\s*{?/g,
        const_declarations: /\bconst\s+/g,
        let_declarations: /\blet\s+/g,
        template_literals: /`[^`]*`/g,
        destructuring: /(?:^|\s+)(?:const|let|var)\s*\{[^}]+\}\s*=/g,
        spread_operator: /\.\.\.[\w$]+/g,
        for_of_loops: /\bfor\s*\([^)]*\bof\b[^)]*\)/g,
        computed_properties: /\[[^\]]+\]:/g
    },

    // ES3 forbidden reserved words as object keys
    reserved_object_keys: /(?:['"`]?)(export|import|class|extends|super|const|let|static|default|enum|implements|interface|package|private|protected|public|yield)(?:['"`]?):\s*/g
};

// ============================================================================
// FUNCTION ANALYSIS PATTERNS
// ============================================================================

export const FUNCTION_ANALYSIS_PATTERNS = {
    // Function signature patterns
    signature: {
        simple_function: /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)/g,
        anonymous_function: /function\s*\(([^)]*)\)/g,
        method_definition: /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*function\s*\(([^)]*)\)/g
    },

    // Error handling patterns
    error_handling: {
        try_catch: /try\s*\{[\s\S]*?\}\s*catch\s*\([^)]*\)\s*\{[\s\S]*?\}/g,
        error_checking: /if\s*\([^)]*(?:error|err|exception)[^)]*\)/gi
    },

    // Logging patterns
    logging: {
        log_calls: /log(?:Debug|Info|Warn|Error)\s*\(/g,
        console_calls: /console\.(?:log|info|warn|error|debug)\s*\(/g
    },

    // Parameter patterns
    parameters: {
        extract_params: /function[^(]*\(([^)]*)\)/,
        param_validation: /if\s*\([^)]*(?:!|\s+)?([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?:\)|&&|\|\||===|!==)/g
    }
};

// ============================================================================
// DEPENDENCY TRACKING PATTERNS - MISSING EXPORT THAT CAUSED BUILD FAILURES
// ============================================================================

export const DEPENDENCY_TRACKING_PATTERNS = {
    // Function call patterns for dependency analysis
    function_calls: /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g,

    // Module registration patterns
    registration_calls: /registerModule\s*\(\s*['"`]([^'"`]+)['"`]/g,

    // Dependency declaration patterns
    dependency_arrays: /(?:validateDependencies|requires?)\s*\(\s*\[([^\]]*)\]/g,

    // Cross-module function usage
    external_calls: {
        // Functions likely from other modules
        dom_functions: /(?:enumerate|sample|export|analyze|compare|performDeep)/gi,
        utility_functions: /(?:createStringBuilder|logDebug|logInfo|logWarn|logError)/gi,
        safety_functions: /(?:validateDependencies|functionExists|safeGet|safeSet)/gi
    },

    // Load order violation detection
    version_dependency: {
        // Pattern to detect if higher version calls lower version
        version_pattern: /^(\d+)\.(\d+)\.(\d+)\.(\d+)_/,
        dependency_violation: /(\d+\.\d+).*calls.*(\d+\.\d+)/
    }
};

// ============================================================================
// DRY COMPLIANCE PATTERNS - MISSING EXPORT
// ============================================================================

export const DRY_COMPLIANCE_PATTERNS = {
    // Code duplication detection
    duplicate_detection: {
        // Similar function signatures
        similar_signatures: /function\s+\w+\s*\([^)]*\)\s*{[^}]{50,200}}/g,

        // Repeated code blocks
        repeated_blocks: /{[^{}]{30,100}}/g,

        // Similar variable declarations
        similar_declarations: /var\s+\w+\s*=\s*[^;]{10,50};/g
    },

    // Consolidation opportunities
    consolidation: {
        // Functions that could be merged
        mergeable_functions: /function\s+(\w+)\s*\([^)]*\)\s*{[\s\S]{1,500}}/g,

        // Repeated utility patterns
        utility_patterns: /(if\s*\([^)]*\)\s*{[^}]{10,50}})/g
    }
};

// ============================================================================
// PATTERN UTILITIES - MISSING EXPORT THAT CAUSED BUILD FAILURES  
// ============================================================================

export const PATTERN_UTILS = {
    /**
     * Clean function content for analysis
     */
    cleanFunctionContent: function (functionContent) {
        if (!functionContent) return '';

        try {
            // Remove comments and normalize
            let normalized = functionContent
                .replace(/\/\*[\s\S]*?\*\//g, '')   // Block comments
                .replace(/\/\/.*$/gm, '')             // Line comments
                .replace(/\s+/g, ' ')                 // Normalize whitespace
                .trim();

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
    },

    /**
     * Extract module metadata from header comments
     */
    extractModuleMetadata: function (content) {
        const metadata = {};

        // Extract module name
        const nameMatch = CONTENT_PATTERNS.module_name.exec(content);
        if (nameMatch) metadata.name = nameMatch[1].trim();

        // Extract purpose
        const purposeMatch = CONTENT_PATTERNS.purpose.exec(content);
        if (purposeMatch) metadata.purpose = purposeMatch[1].trim();

        // Extract dependencies
        const depMatch = CONTENT_PATTERNS.dependencies.exec(content);
        if (depMatch) metadata.dependencies = depMatch[1].trim();

        // Extract size comment
        const sizeMatch = CONTENT_PATTERNS.size_comment.exec(content);
        if (sizeMatch) metadata.size = sizeMatch[1].trim();

        // Extract version comment
        const versionMatch = CONTENT_PATTERNS.version_comment.exec(content);
        if (versionMatch) metadata.version = versionMatch[1].trim();

        return metadata;
    }
};

// ============================================================================
// CONFIDENCE LEVELS - MISSING EXPORT THAT CAUSED BUILD FAILURES
// ============================================================================

export const CONFIDENCE_LEVELS = {
    HIGH: 90,      // Definite violation/issue
    MEDIUM: 70,    // Likely violation/issue
    LOW: 50,       // Possible violation/issue
    UNCERTAIN: 30  // Probably false positive
};

// ============================================================================
// CRITICAL MISSING FUNCTION - parseRegistrationArray
// ============================================================================

/**
 * Parse registration array content into function list - MISSING IMPLEMENTATION
 * @param {string} arrayContent - Raw array content from registerModule call
 * @returns {Array} Array of function names
 */
export const parseRegistrationArray = (arrayContent) => {
    if (!arrayContent || typeof arrayContent !== 'string') {
        console.warn('parseRegistrationArray: Invalid array content');
        return [];
    }

    try {
        // Remove brackets, quotes, and normalize whitespace
        const cleaned = arrayContent
            .replace(/[\[\]]/g, '')           // Remove brackets
            .replace(/\s+/g, ' ')             // Normalize whitespace
            .trim();

        if (!cleaned) {
            return [];
        }

        // Split by comma and clean each function name
        const functions = cleaned
            .split(',')
            .map(func => {
                // Remove quotes, whitespace, and comments
                return func
                    .replace(/['"]/g, '')         // Remove quotes
                    .replace(/\/\/.*$/, '')       // Remove line comments
                    .replace(/\/\*[\s\S]*?\*\//, '') // Remove block comments
                    .trim();
            })
            .filter(func => {
                // Filter out empty strings and invalid identifiers
                return func &&
                    func.length > 0 &&
                    !func.startsWith('//') &&
                    !func.startsWith('/*') &&
                    /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(func); // Valid identifier
            });

        console.log(`parseRegistrationArray: Parsed ${functions.length} functions from array content`);
        return functions;

    } catch (error) {
        console.error('parseRegistrationArray failed:', error.message);
        return [];
    }
};

// ============================================================================
// UTILITY FUNCTIONS FOR VERSION AND FILE HANDLING
// ============================================================================

/**
 * Parse version string into comparable array
 * @param {string} versionString - Version like "1.2.1.5"
 * @returns {number[]} Array of version numbers
 */
export const parseVersion = (versionString) => {
    if (!versionString) return [0];
    return versionString.split('.').map(num => parseInt(num, 10) || 0);
};

/**
 * Compare two version arrays
 * @param {number[]} a - First version array
 * @param {number[]} b - Second version array  
 * @returns {number} -1, 0, or 1
 */
export const compareVersions = (a, b) => {
    const maxLength = Math.max(a.length, b.length);

    for (let i = 0; i < maxLength; i++) {
        const aVal = a[i] || 0;
        const bVal = b[i] || 0;

        if (aVal < bVal) return -1;
        if (aVal > bVal) return 1;
    }

    return 0;
};

/**
 * Extract version from module filename
 * @param {string} filename - Module filename
 * @returns {string|null} Version string or null
 */
export const extractVersion = (filename) => {
    if (!filename) return null;
    const match = filename.match(VERSION_EXTRACTION_PATTERN);
    return match ? match[1] : null;
};

/**
 * Check if file is a DocDom module file
 * @param {string} filename - File name to check
 * @returns {boolean} True if module file
 */
export const isModuleFile = (filename) => {
    if (!filename) return false;
    return MODULE_FILE_PATTERN.test(filename);
};

/**
 * Check if file should be excluded from analysis
 * @param {string} filename - File name to check
 * @returns {boolean} True if should be excluded
 */
export const isExcludedFile = (filename) => {
    if (!filename) return true;
    return EXCLUDED_FILES.some(pattern => {
        if (pattern instanceof RegExp) {
            return pattern.test(filename);
        }
        return filename === pattern;
    });
};

/**
 * Check if folder should be excluded from scanning
 * @param {string} folderName - Folder name to check
 * @returns {boolean} True if should be excluded
 */
export const isExcludedFolder = (folderName) => {
    if (!folderName) return true;
    return EXCLUDED_FOLDERS.includes(folderName);
};

/**
 * Group files by version prefix and extension type for comparison analysis
 * Groups files that share the same major.minor version and file extension
 * 
 * Examples:
 * - 1.1_file.jsx matches 1.1.0.0_otherFile.jsx (same 1.1 prefix, same .jsx)
 * - 1.1_file.jsx does NOT match 1.10.0.0_file.jsx (1.1 != 1.10)
 * - 1.1_file.jsx does NOT match 1.1.0.0_file.js (different extensions)
 * 
 * @param {Array} files - Array of filenames to group
 * @returns {Object} Groups of files suitable for version comparison
 */
export const groupByVersionPrefix = (files) => {
    if (!Array.isArray(files)) return {};

    const groups = {};

    files.forEach(file => {
        const version = extractVersion(file);
        const extension = path.extname(file);

        if (version) {
            const parts = version.split('.');

            // Create exact major.minor prefix match
            // 1.1.x.x -> "1.1"
            // 1.10.x.x -> "1.10" 
            // This ensures 1.1 != 1.10
            const majorMinor = parts.length >= 2 ? `${parts[0]}.${parts[1]}` : parts[0];

            // Group by version prefix + extension to ensure type matching
            const groupKey = `${majorMinor}${extension}`;

            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(file);
        }
    });

    // Only return groups with multiple files for comparison
    const comparisonGroups = {};
    Object.entries(groups).forEach(([key, files]) => {
        if (files.length > 1) {
            comparisonGroups[key] = files;
        }
    });

    return comparisonGroups;
};

/**
 * Sort modules by version for dependency order
 * @param {Array} moduleFiles - Array of module filenames
 * @returns {Array} Sorted module data objects
 */
export const sortModulesByVersion = (moduleFiles) => {
    if (!Array.isArray(moduleFiles)) return [];

    const ADAPTER_KEYWORD = 'adapter';

    const moduleData = moduleFiles.map(filename => {
        const versionMatch = filename.match(VERSION_EXTRACTION_PATTERN);
        const version = versionMatch ? versionMatch[1] : '0';
        const versionArray = parseVersion(version);

        return {
            filename,
            version,
            versionArray,
            sortKey: versionArray.map(n => String(n).padStart(4, '0')).join('.'),
            isAdapter: filename.toLowerCase().includes(ADAPTER_KEYWORD)
        };
    });

    // Sort by version array comparison
    moduleData.sort((a, b) => compareVersions(a.versionArray, b.versionArray));

    return moduleData;
};

/**
 * Validate module files for assembly
 * @param {string} folderPath - Path to folder containing modules
 * @param {Array} moduleFiles - Array of module filenames
 * @returns {Object} Validation result
 */
export const validateModuleFiles = (folderPath, moduleFiles) => {
    const validation = {
        valid: [],
        invalid: [],
        errors: []
    };

    if (!folderPath || !Array.isArray(moduleFiles)) {
        validation.errors.push('Invalid folderPath or moduleFiles parameter');
        return validation;
    }

    moduleFiles.forEach(filename => {
        try {
            const filePath = path.join(folderPath, filename);
            if (fs.existsSync(filePath)) {
                const stats = fs.statSync(filePath);
                if (stats.isFile() && stats.size > 0) {
                    validation.valid.push(filename);
                } else {
                    validation.invalid.push(filename);
                    validation.errors.push(`${filename}: Invalid file or zero size`);
                }
            } else {
                validation.invalid.push(filename);
                validation.errors.push(`${filename}: File does not exist`);
            }
        } catch (error) {
            validation.invalid.push(filename);
            validation.errors.push(`${filename}: ${error.message}`);
        }
    });

    return validation;
};

// ============================================================================
// DEFAULT EXPORT (MAINTAIN COMPATIBILITY)
// ============================================================================

export default {
    MODULE_FILE_PATTERN,
    VERSION_EXTRACTION_PATTERN,
    VALID_EXTENSIONS,
    EXCLUDED_FOLDERS,
    EXCLUDED_FILES,
    VERSION_COMPARISON_PATTERNS,
    CONTENT_PATTERNS,
    ES3_COMPLIANCE_PATTERNS,
    FUNCTION_ANALYSIS_PATTERNS,
    DEPENDENCY_TRACKING_PATTERNS,
    DRY_COMPLIANCE_PATTERNS,
    PATTERN_UTILS,
    CONFIDENCE_LEVELS,

    // Include utility functions in default export too
    parseRegistrationArray,
    parseVersion,
    compareVersions,
    extractVersion,
    isModuleFile,
    isExcludedFile,
    isExcludedFolder,
    groupByVersionPrefix,
    sortModulesByVersion,
    validateModuleFiles
};