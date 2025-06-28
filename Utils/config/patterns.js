// config/patterns.js
// ENHANCED VERSION PATTERNS AND UTILITIES - COMPLETE SHARED LIBRARY
// FIXED: Added ALL missing utility function exports that were causing build failures
// ============================================================================

import fs from 'fs';
import path from 'path';

// ============================================================================
// FILE PATTERNS AND EXCLUSIONS - ENHANCED VERSION
// ============================================================================

// ENHANCED Main pattern for DocDom module files
// NOW SUPPORTS: 1.1_file.jsx, 1.2.1_file.jsx, 1.4.2.1_file.jsx, 1.15.1.2025.20.4_file.jsx
export const MODULE_FILE_PATTERN = /^(\d+(?:\.\d+){0,10})_.*\.jsx?$/;

// ENHANCED Extract version from filename - supports more formats
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
// ENHANCED PATTERNS FOR VERSION COMPARISON DETECTION
// ============================================================================

export const VERSION_COMPARISON_PATTERNS = {
    // Files with same decimal prefix but different suffixes
    same_prefix: /^(\d+(?:\.\d+){0,10})_.*$/,

    // ENHANCED version indicators - supports real-world naming
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
        /_build(\d+)\.jsx?$/                  // _build123.jsx
    ],

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

// ============================================================================
// CONTENT PATTERNS FOR STATIC ANALYSIS
// ============================================================================

export const CONTENT_PATTERNS = {
    // Function definitions (unchanged - works correctly)
    function_definition: /^[\s]*function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)/gm,

    // Function calls (unchanged - works correctly)
    function_call: /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g,

    // CRITICAL FIX: Robust multi-line registration parser
    register_module: /registerModule\s*\(\s*(['"`])([^'"`]+)\1\s*,\s*(['"`])([^'"`]+)\3\s*,\s*\[([\s\S]*?)\]\s*\)\s*;?/s,

    // Dependency validation (unchanged - works correctly)
    dependency_validation: /validateDependencies\s*\(\s*\[(.*?)\]/s,

    // Header extraction patterns (unchanged - works correctly)
    module_name: /\/\/\s*([^-\n]+)\s*-/,
    purpose: /\/\/\s*PURPOSE:\s*(.*)/,
    dependencies: /\/\/\s*DEPENDENCIES:\s*(.*)/,
    size_comment: /\/\/\s*SIZE:\s*(.*)/,
    version_comment: /\/\/\s*VERSION:\s*(.*)/
};

// ============================================================================
// SHARED ES3 COMPLIANCE PATTERNS
// ============================================================================

export const ES3_COMPLIANCE_PATTERNS = {
    // Reserved words used as properties (problematic in ES3)
    reserved_as_property: /\.(?:class|const|enum|export|extends|import|super|implements|interface|let|package|private|protected|public|static|yield)\b/g,
    
    // Object literal with reserved word keys
    reserved_object_keys: /(?:class|const|enum|export|extends|import|super|implements|interface|let|package|private|protected|public|static|yield)\s*:/g,
    
    // JSON methods (not available in ES3)
    json_usage: /JSON\.(parse|stringify)/g,
    
    // Modern array methods
    modern_array_methods: /\.(forEach|map|filter|reduce|some|every|find|indexOf)\s*\(/g,
    
    // Arrow functions (ES6)
    arrow_functions: /=>\s*[{(]/g,
    
    // Template literals (ES6)
    template_literals: /`[^`]*`/g,
    
    // Let/const declarations (ES6)
    modern_declarations: /\b(?:let|const)\b/g
};

// ============================================================================
// FUNCTION ANALYSIS PATTERNS
// ============================================================================

export const FUNCTION_ANALYSIS_PATTERNS = {
    // Function signature extraction
    function_signature: /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)/g,
    
    // Return statement analysis
    return_statements: /return\s+([^;}\n]+)/g,
    
    // Variable declarations
    variable_declarations: /var\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
    
    // Function calls within functions
    internal_calls: /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g,
    
    // Control flow patterns
    control_flow: /\b(?:if|else|for|while|switch|try|catch|finally)\b/g,
    
    // DOM manipulation patterns
    dom_patterns: /\b(?:getElementById|getElementsBy|querySelector|appendChild|removeChild)\b/g
};

// ============================================================================
// DEPENDENCY TRACKING PATTERNS
// ============================================================================

export const DEPENDENCY_TRACKING_PATTERNS = {
    // Module dependency declarations
    dependency_declaration: /var\s+([A-Z_]+_DEPENDENCIES)\s*=\s*\[(.*?)\]/s,
    
    // validateDependencies calls
    dependency_validation: /validateDependencies\s*\(\s*([^)]+)\s*\)/g,
    
    // registerModule calls with dependencies
    module_registration: /registerModule\s*\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*\[(.*?)\]/s,
    
    // Include/import statements
    include_statements: /\/\/\s*@include\s+['"]([^'"]+)['"]/g,
    
    // Cross-module function calls
    cross_module_calls: /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g
};

// ============================================================================
// DRY COMPLIANCE PATTERNS
// ============================================================================

export const DRY_COMPLIANCE_PATTERNS = {
    // Code blocks for similarity analysis
    code_blocks: /\{[^{}]*\}/g,
    
    // Function body extraction
    function_body: /function[^{]*\{([\s\S]*)\}/g,
    
    // Configuration objects
    config_objects: /var\s+[A-Z_]+CONFIG\s*=\s*\{([\s\S]*?)\}/g,
    
    // Repeated patterns
    repeated_structures: /for\s*\([^)]*\)\s*\{[^{}]*\}/g,
    
    // Similar variable patterns
    similar_variables: /var\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/g
};

// ============================================================================
// CONFIDENCE LEVELS AND UTILITIES
// ============================================================================

export const CONFIDENCE_LEVELS = {
    VERY_HIGH: 95,
    HIGH: 85,
    MEDIUM: 70,
    LOW: 55,
    VERY_LOW: 30
};

export const PATTERN_UTILS = {
    /**
     * Clean function content for analysis
     */
    cleanFunctionContent: function(content) {
        return content
            .replace(/\/\*[\s\S]*?\*\//g, '')     // Remove block comments
            .replace(/\/\/.*$/gm, '')             // Remove line comments
            .replace(/\s+/g, ' ')                 // Normalize whitespace
            .trim();
    },

    /**
     * Extract module metadata from header comments
     */
    extractModuleMetadata: function(content) {
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
// CRITICAL UTILITY FUNCTIONS - MISSING EXPORTS THAT CAUSED BUILD FAILURES
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
 * Group files by version prefix (for version comparison)
 * @param {Array} files - Array of filenames
 * @returns {Object} Grouped files by version prefix
 */
export const groupByVersionPrefix = (files) => {
    if (!Array.isArray(files)) return {};
    
    const groups = {};
    
    files.forEach(file => {
        const version = extractVersion(file);
        if (version) {
            const parts = version.split('.');
            const prefix = parts[0] + (parts[1] ? '.' + parts[1] : '');
            
            if (!groups[prefix]) {
                groups[prefix] = [];
            }
            groups[prefix].push(file);
        }
    });
    
    return groups;
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