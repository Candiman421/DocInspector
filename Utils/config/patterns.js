// ============================================================================
// FILE PATTERNS AND EXCLUSIONS
// Configuration for file discovery and processing
// ============================================================================

// Main pattern for DocDom module files
// Supports: 1.1_file.jsx, 1.2.1_file.jsx, 1.4.2.1_file.jsx (up to 4 decimal levels)
export const MODULE_FILE_PATTERN = /^(\d+(\.\d+){0,3})_.*\.jsx?$/;

// Extract version from filename
export const VERSION_EXTRACTION_PATTERN = /^(\d+(?:\.\d+){0,3})_/;

// Common file extensions for modules
export const VALID_EXTENSIONS = ['.js', '.jsx'];

// Folders to exclude from scanning
export const EXCLUDED_FOLDERS = [
    'node_modules',
    '.git',
    '.vscode',
    '.idea',
    'Utils',
    'UtilsOutput',
    'build',
    'dist',
    'target',
    'out',
    'temp',
    '.tmp',
    'cache',
    '.cache',
    'coverage',
    '.nyc_output'
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
    /\.bak$/,
    /\.old$/,
    /\.backup$/,
    /\.tmp$/,
    /~$/,
    /#.*#$/,
    /\.swp$/,
    /\.swo$/,

    // Test and demo files
    /^test.*\.jsx?$/i,
    /^demo.*\.jsx?$/i,
    /^example.*\.jsx?$/i,
    /^sample.*\.jsx?$/i,

    // Hidden files
    /^\./,

    // Package files
    /^package.*\.json$/,
    /^yarn\.lock$/,
    /^package-lock\.json$/,

    // Documentation
    /\.md$/,
    /\.txt$/,
    /README/i,
    /CHANGELOG/i,
    /LICENSE/i
];

// Patterns for version comparison detection
export const VERSION_COMPARISON_PATTERNS = {
    // Files with same decimal prefix but different suffixes
    same_prefix: /^(\d+(?:\.\d+){0,3})_.*$/,

    // Common version indicators in filenames
    version_indicators: [
        /_v(\d+)\.jsx?$/,           // _v1.jsx, _v2.jsx
        /_version(\d+)\.jsx?$/,     // _version1.jsx
        /_(\d{4})\.jsx?$/,          // _2012.jsx (year/timestamp)
        /_old\.jsx?$/,              // _old.jsx
        /_new\.jsx?$/,              // _new.jsx
        /_latest\.jsx?$/,           // _latest.jsx
        /_current\.jsx?$/,          // _current.jsx
        /_backup\.jsx?$/,           // _backup.jsx
        /_original\.jsx?$/,         // _original.jsx
        /_updated\.jsx?$/,          // _updated.jsx
        /_fixed\.jsx?$/,            // _fixed.jsx
        /_revised\.jsx?$/,          // _revised.jsx
        /_modified\.jsx?$/          // _modified.jsx
    ]
};

// Patterns for system analysis (different modules working together)
export const SYSTEM_ANALYSIS_PATTERNS = {
    // Different decimal prefixes indicate different modules
    different_modules: /^(\d+(?:\.\d+){0,3})_.*$/,

    // Dependency indicators in module names
    dependency_indicators: [
        /bootstrap/i,     // Foundation modules
        /foundation/i,
        /core/i,
        /base/i,
        /safety/i,        // Utility modules  
        /utils/i,
        /utilities/i,
        /helpers/i,
        /dom/i,           // Functionality modules
        /analyzer/i,
        /parser/i,
        /exporter/i,
        /visualizer/i,
        /ui/i,           // Interface modules
        /interface/i,
        /advanced/i
    ]
};

// Content patterns for static analysis
export const CONTENT_PATTERNS = {
    // Function definitions
    function_definition: /^[\s]*function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)/gm,

    // Function calls  
    function_call: /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g,

    // Module registration
    register_module: /registerModule\s*\(\s*['"]([^'"]+)['"],\s*['"]([^'"]+)['"],\s*\[(.*?)\]/s,

    // Dependency validation
    dependency_validation: /validateDependencies\s*\(\s*\[(.*?)\]/s,

    // Header extraction patterns
    module_name: /\/\/\s*([^-\n]+)\s*-/,
    purpose: /\/\/\s*PURPOSE:\s*(.*)/,
    dependencies: /\/\/\s*DEPENDENCIES:\s*(.*)/,
    size_comment: /\/\/\s*SIZE:\s*(.*)/,

    // Logging patterns
    modern_logging: /(logDebug|logInfo|logWarn|logError|logMessage)\s*\(/g,
    legacy_logging: /\$\.writeln\s*\(/g,

    // Error handling
    try_catch: /try\s*\{[\s\S]*?\}\s*catch\s*\([^)]*\)\s*\{/g,

    // ES3 compliance violations
    const_let: /\b(const|let)\s+/g,
    arrow_functions: /=>\s*[{(]/g,
    template_literals: /`[^`]*`/g,

    // Reserved word usage
    export_property: /(\w+\.export\b|\['export'\]|\{"?export"?\s*:)/g,

    // Memory management
    memory_cleanup: /(memoryCleanup|= null|delete\s+)/g,

    // API safety
    dangerous_properties: /(prototype|constructor|__proto__|caller|arguments)/g,
    validation_functions: /(isDangerousProperty|validateEnvironment|validateDocumentState)/g
};

// Output file naming patterns
export const OUTPUT_PATTERNS = {
    // Individual module analysis
    module_analysis: '~module-analysis-{filename}-{timestamp}.yaml',

    // System aggregate analysis  
    system_analysis: '~system-analysis-{folder}-{timestamp}.yaml',

    // Version comparison
    version_comparison: '~version-comparison-{prefix}-{timestamp}.yaml',

    // Assembled files
    assembled: '{folder}_ASSEMBLED_{timestamp}.jsx',
    includes: '{folder}_INCLUDES_{timestamp}.jsx',

    // GitIgnore patterns
    gitignore_patterns: [
        '*_ASSEMBLED_*.jsx',
        '*_INCLUDES_*.jsx',
        '~analysis-*.yaml',
        '~module-*.yaml',
        '~version-*.yaml',
        '~system-*.yaml'
    ]
};

// Timestamp format for file naming
export const TIMESTAMP_FORMAT = {
    pattern: 'YYYYMMDD-HHMMSS',
    generate: () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        return `${year}${month}${day}-${hours}${minutes}${seconds}`;
    }
};

/**
 * Parse version string into comparable array
 * @param {string} versionString - Version like "1.2.1"
 * @returns {number[]} Array of version numbers
 */
export const parseVersion = (versionString) => {
    return versionString.split('.').map(num => parseInt(num, 10));
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
 * Extract version from filename
 * @param {string} filename - Module filename
 * @returns {string|null} Version string or null
 */
export const extractVersion = (filename) => {
    const match = filename.match(VERSION_EXTRACTION_PATTERN);
    return match ? match[1] : null;
};

/**
 * Check if filename matches module pattern
 * @param {string} filename - Filename to check
 * @returns {boolean} True if valid module file
 */
export const isModuleFile = (filename) => {
    return MODULE_FILE_PATTERN.test(filename);
};

/**
 * Check if file should be excluded
 * @param {string} filename - Filename to check
 * @returns {boolean} True if file should be excluded
 */
export const isExcludedFile = (filename) => {
    return EXCLUDED_FILES.some(pattern => {
        if (pattern instanceof RegExp) {
            return pattern.test(filename);
        }
        return filename === pattern;
    });
};

/**
 * Check if folder should be excluded
 * @param {string} folderName - Folder name to check
 * @returns {boolean} True if folder should be excluded
 */
export const isExcludedFolder = (folderName) => {
    return EXCLUDED_FOLDERS.includes(folderName) || folderName.startsWith('.');
};

/**
 * Group files by version prefix for comparison analysis
 * @param {string[]} filenames - Array of filenames
 * @returns {Object} Groups of files by version prefix
 */
export const groupByVersionPrefix = (filenames) => {
    const groups = {};

    filenames.forEach(filename => {
        const version = extractVersion(filename);
        if (version) {
            if (!groups[version]) {
                groups[version] = [];
            }
            groups[version].push(filename);
        }
    });

    return groups;
};

export default {
    MODULE_FILE_PATTERN,
    VERSION_EXTRACTION_PATTERN,
    VALID_EXTENSIONS,
    EXCLUDED_FOLDERS,
    EXCLUDED_FILES,
    VERSION_COMPARISON_PATTERNS,
    SYSTEM_ANALYSIS_PATTERNS,
    CONTENT_PATTERNS,
    OUTPUT_PATTERNS,
    TIMESTAMP_FORMAT,
    parseVersion,
    compareVersions,
    extractVersion,
    isModuleFile,
    isExcludedFile,
    isExcludedFolder,
    groupByVersionPrefix
};