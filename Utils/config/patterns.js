// config/patterns.js
// FILE PATTERNS AND EXCLUSIONS - FIXED VERSION
// ENHANCED VERSION DETECTION - NO MORE FALSE POSITIVES
// ============================================================================

// ENHANCED Main pattern for DocDom module files
// NOW SUPPORTS: 1.1_file.jsx, 1.2.1_file.jsx, 1.4.2.1_file.jsx, 1.15.1.2025.20.4_file.jsx
export const MODULE_FILE_PATTERN = /^(\d+(?:\.\d+){0,6})_.*\.jsx?$/;

// ENHANCED Extract version from filename - supports more formats
export const VERSION_EXTRACTION_PATTERN = /^(\d+(?:\.\d+){0,6})_/;

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

// ENHANCED Patterns for version comparison detection
export const VERSION_COMPARISON_PATTERNS = {
    // Files with same decimal prefix but different suffixes
    same_prefix: /^(\d+(?:\.\d+){0,6})_.*$/,

    // ENHANCED version indicators - supports real-world naming
    version_indicators: [
        // Version numbers
        /_[Vv](\d+(?:\.\d+)*)\.jsx?$/,        // _V3.1.jsx, _v2.0.jsx
        /_version(\d+(?:\.\d+)*)\.jsx?$/,     // _version1.2.jsx
        
        // Years and timestamps  
        /_(\d{4})\.jsx?$/,                    // _2024.jsx, _2023.jsx
        /_(\d{8})\.jsx?$/,                    // _20240615.jsx (YYYYMMDD)
        /_(\d{6})\.jsx?$/,                    // _202406.jsx (YYYYMM)
        
        // Semantic version indicators
        /_old\.jsx?$/,                        // _old.jsx
        /_new\.jsx?$/,                        // _new.jsx
        /_latest\.jsx?$/,                     // _latest.jsx
        /_current\.jsx?$/,                    // _current.jsx
        /_backup\.jsx?$/,                     // _backup.jsx
        /_original\.jsx?$/,                   // _original.jsx
        /_updated\.jsx?$/,                    // _updated.jsx
        /_fixed\.jsx?$/,                      // _fixed.jsx
        /_revised\.jsx?$/,                    // _revised.jsx
        /_modified\.jsx?$/,                   // _modified.jsx
        /_final\.jsx?$/,                      // _final.jsx
        /_beta\.jsx?$/,                       // _beta.jsx
        /_alpha\.jsx?$/,                      // _alpha.jsx
        /_test\.jsx?$/,                       // _test.jsx
        /_dev\.jsx?$/,                        // _dev.jsx
        /_prod\.jsx?$/,                       // _prod.jsx
        
        // Complex versioning (like real DocDom files)
        /_(\d+\.\d+\.\d{4}\.\d+\.\d+)\.jsx?$/ // _1.15.1.2025.20.4.jsx
    ]
};

// Patterns for system analysis (different modules working together)
export const SYSTEM_ANALYSIS_PATTERNS = {
    // Different decimal prefixes indicate different modules
    different_modules: /^(\d+(?:\.\d+){0,6})_.*$/,

    // ENHANCED dependency indicators in module names
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

// FIXED Content patterns for static analysis - NO MORE FALSE POSITIVES
export const CONTENT_PATTERNS = {
    // Function definitions (unchanged - works correctly)
    function_definition: /^[\s]*function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)/gm,

    // Function calls (unchanged - works correctly)
    function_call: /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g,

    // Module registration (unchanged - works correctly)
    register_module: /registerModule\s*\(\s*['"]([^'"]+)['"],\s*['"]([^'"]+)['"],\s*\[(.*?)\]/s,

    // Dependency validation (unchanged - works correctly)
    dependency_validation: /validateDependencies\s*\(\s*\[(.*?)\]/s,

    // Header extraction patterns (unchanged - works correctly)
    module_name: /\/\/\s*([^-\n]+)\s*-/,
    purpose: /\/\/\s*PURPOSE:\s*(.*)/,
    dependencies: /\/\/\s*DEPENDENCIES:\s*(.*)/,
    size_comment: /\/\/\s*SIZE:\s*(.*)/,

    // FIXED Logging patterns - proper regex escaping
    modern_logging: /\b(logDebug|logInfo|logWarn|logError|logMessage)\s*\(/g,
    legacy_logging: /\$\.writeln\s*\(/g,

    // Error handling (unchanged - works correctly)
    try_catch: /try\s*\{[\s\S]*?\}\s*catch\s*\([^)]*\)\s*\{/g,

    // FIXED Reserved word usage - context-aware patterns
    export_property_usage: /(\w+\.export\b|\w+\[['"]export['"]\]|\{['"]?export['"]?\s*:)/g,
    import_property_usage: /(\w+\.import\b|\w+\[['"]import['"]\]|\{['"]?import['"]?\s*:)/g,
    
    // Memory management (unchanged - works correctly)
    memory_cleanup: /(memoryCleanup|= null|delete\s+)/g,

    // API safety (unchanged - works correctly)
    dangerous_properties: /(prototype|constructor|__proto__|caller|arguments)/g,
    validation_functions: /(isDangerousProperty|validateEnvironment|validateDocumentState)/g
};

// Output file naming patterns (unchanged - works correctly)
export const OUTPUT_PATTERNS = {
    module_analysis: '~module-analysis-{filename}-{timestamp}.yaml',
    system_analysis: '~system-analysis-{folder}-{timestamp}.yaml',
    version_comparison: '~version-comparison-{prefix}-{timestamp}.yaml',
    assembled: '{folder}_ASSEMBLED_{timestamp}.jsx',
    includes: '{folder}_INCLUDES_{timestamp}.jsx',
    
    gitignore_patterns: [
        '*_ASSEMBLED_*.jsx', '*_INCLUDES_*.jsx',
        '~analysis-*.yaml', '~module-*.yaml',
        '~version-*.yaml', '~system-*.yaml'
    ]
};

// Enhanced timestamp format
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
 * ENHANCED Parse version string into comparable array
 * NOW SUPPORTS: Complex versions like 1.15.1.2025.20.4
 * @param {string} versionString - Version like "1.2.1" or "1.15.1.2025.20.4"
 * @returns {number[]} Array of version numbers
 */
export const parseVersion = (versionString) => {
    if (!versionString) return [0];
    
    return versionString.split('.').map(num => {
        const parsed = parseInt(num, 10);
        return isNaN(parsed) ? 0 : parsed;
    });
};

/**
 * ENHANCED Compare two version arrays
 * HANDLES: Complex version numbers with more than 4 components
 * @param {number[]} a - First version array
 * @param {number[]} b - Second version array  
 * @returns {number} -1 (a < b), 0 (a == b), or 1 (a > b)
 */
export const compareVersions = (a, b) => {
    if (!Array.isArray(a) || !Array.isArray(b)) {
        return 0;
    }
    
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
 * ENHANCED Extract version from filename
 * SUPPORTS: _V3.1.jsx, _1.15.1.2025.20.4.jsx, etc.
 * @param {string} filename - Module filename
 * @returns {string|null} Version string or null
 */
export const extractVersion = (filename) => {
    if (!filename) return null;
    
    // Try main version pattern first (most common)
    const mainMatch = filename.match(VERSION_EXTRACTION_PATTERN);
    if (mainMatch) {
        return mainMatch[1];
    }
    
    // Try version indicators for comparison files
    for (const pattern of VERSION_COMPARISON_PATTERNS.version_indicators) {
        const match = filename.match(pattern);
        if (match) {
            // Return the captured version number or the semantic version
            return match[1] || extractSemanticVersion(filename);
        }
    }
    
    return null;
};

/**
 * Extract semantic version for ordering
 * @param {string} filename - Filename with semantic version
 * @returns {string} Version number for comparison
 */
const extractSemanticVersion = (filename) => {
    const semanticOrder = {
        'old': '0.1', 'original': '0.2', 'backup': '0.3',
        'alpha': '0.4', 'beta': '0.5', 'test': '0.6', 'dev': '0.7',
        'current': '1.0', 'updated': '1.1', 'modified': '1.2', 
        'revised': '1.3', 'fixed': '1.4', 'new': '1.5', 
        'latest': '1.9', 'final': '2.0', 'prod': '2.1'
    };
    
    const lowerFilename = filename.toLowerCase();
    
    for (const [semantic, version] of Object.entries(semanticOrder)) {
        if (lowerFilename.includes(semantic)) {
            return version;
        }
    }
    
    // Default version for unknown semantics
    return '1.0';
};

/**
 * Check if filename matches module pattern
 * @param {string} filename - Filename to check
 * @returns {boolean} True if valid module file
 */
export const isModuleFile = (filename) => {
    if (!filename) return false;
    return MODULE_FILE_PATTERN.test(filename);
};

/**
 * Check if file should be excluded
 * @param {string} filename - Filename to check
 * @returns {boolean} True if file should be excluded
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
 * Check if folder should be excluded
 * @param {string} folderName - Folder name to check
 * @returns {boolean} True if folder should be excluded
 */
export const isExcludedFolder = (folderName) => {
    if (!folderName) return true;
    return EXCLUDED_FOLDERS.includes(folderName) || folderName.startsWith('.');
};

/**
 * ENHANCED Group files by version prefix for comparison analysis
 * SUPPORTS: Complex version prefixes like 1.15.1.2025.20.4
 * @param {string[]} filenames - Array of filenames
 * @returns {Object} Groups of files by version prefix
 */
export const groupByVersionPrefix = (filenames) => {
    const groups = {};

    filenames.forEach(filename => {
        const version = extractVersion(filename);
        if (version) {
            // Use the base version (first two components) for grouping
            // e.g., 1.15.1.2025.20.4 → 1.15
            const versionComponents = version.split('.');
            const baseVersion = versionComponents.slice(0, 2).join('.');
            
            if (!groups[baseVersion]) {
                groups[baseVersion] = [];
            }
            groups[baseVersion].push(filename);
        }
    });

    return groups;
};

/**
 * ENHANCED Determine module type from filename and content
 * @param {string} filename - Module filename
 * @param {string} content - Module content (optional)
 * @returns {Object} Module type information
 */
export const determineModuleType = (filename, content = '') => {
    const version = extractVersion(filename);
    const versionComponents = parseVersion(version || '0');
    
    // Determine module category based on version prefix
    let category = 'unknown';
    let loadOrder = 999;
    
    if (versionComponents[0] === 1) {
        if (versionComponents[1] === 1) {
            category = 'foundation';
            loadOrder = 1;
        } else if (versionComponents[1] >= 15 && versionComponents[1] < 20) {
            category = 'app_adapter';
            loadOrder = 2;
        } else if (versionComponents[1] >= 2 && versionComponents[1] < 15) {
            category = 'utility';
            loadOrder = 3;
        }
    } else if (versionComponents[0] === 2) {
        category = 'core_functionality';
        loadOrder = 4;
    } else if (versionComponents[0] === 3) {
        category = 'advanced_functionality';
        loadOrder = 5;
    } else if (versionComponents[0] === 4) {
        category = 'analysis';
        loadOrder = 6;
    } else if (versionComponents[0] === 5) {
        category = 'visualization';
        loadOrder = 7;
    } else if (versionComponents[0] === 6) {
        category = 'ui';
        loadOrder = 8;
    }
    
    return {
        category,
        loadOrder,
        version,
        versionComponents,
        isFoundation: category === 'foundation',
        isAppAdapter: category === 'app_adapter',
        isUtility: category === 'utility'
    };
};

/**
 * ENHANCED Validate sequential dependency order
 * DETECTS: Violations like 1.15 depending on 1.1 but loading first
 * @param {Array} moduleList - Array of module information objects
 * @returns {Object} Dependency order validation result
 */
export const validateDependencyOrder = (moduleList) => {
    const validation = {
        valid: true,
        violations: [],
        loadOrder: [],
        errors: []
    };
    
    if (!Array.isArray(moduleList) || moduleList.length === 0) {
        return validation;
    }
    
    // Sort modules by their version numbers
    const sortedModules = moduleList.map(module => ({
        ...module,
        moduleType: determineModuleType(module.filename)
    })).sort((a, b) => {
        return compareVersions(a.moduleType.versionComponents, b.moduleType.versionComponents);
    });
    
    // Check for dependency order violations
    for (let i = 0; i < sortedModules.length; i++) {
        const currentModule = sortedModules[i];
        const currentVersion = currentModule.moduleType.versionComponents;
        
        // Check dependencies if available
        if (currentModule.dependencies && Array.isArray(currentModule.dependencies)) {
            currentModule.dependencies.forEach(depName => {
                // Find the dependency in the module list
                const dependency = sortedModules.find(m => 
                    m.filename.includes(depName) || m.moduleName === depName
                );
                
                if (dependency) {
                    const depVersion = dependency.moduleType.versionComponents;
                    
                    // Check if dependency has higher version number (should load first)
                    if (compareVersions(depVersion, currentVersion) > 0) {
                        validation.valid = false;
                        validation.violations.push({
                            type: 'reverse_dependency',
                            module: currentModule.filename,
                            moduleVersion: currentModule.moduleType.version,
                            dependency: dependency.filename,
                            dependencyVersion: dependency.moduleType.version,
                            severity: 'CRITICAL',
                            description: `Module ${currentModule.moduleType.version} depends on ${dependency.moduleType.version} but loads before it`,
                            fix: `Ensure ${dependency.filename} loads before ${currentModule.filename}`
                        });
                    }
                }
            });
        }
    }
    
    validation.loadOrder = sortedModules.map(m => m.filename);
    
    return validation;
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
    groupByVersionPrefix,
    determineModuleType,
    validateDependencyOrder
};