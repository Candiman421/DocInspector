// config/patterns.js
// ENHANCED VERSION PATTERNS AND UTILITIES - COMPLETE SHARED LIBRARY
// ============================================================================

import fs from 'fs';
import path from 'path';

// FILE PATTERNS AND EXCLUSIONS - ENHANCED VERSION
// ENHANCED VERSION DETECTION - NO MORE FALSE POSITIVES
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

// ENHANCED Patterns for version comparison detection
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

// FIXED Content patterns for static analysis - ROBUST MULTI-LINE PARSING
export const CONTENT_PATTERNS = {
    // Function definitions (unchanged - works correctly)
    function_definition: /^[\s]*function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)/gm,

    // Function calls (unchanged - works correctly)
    function_call: /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g,

    // CRITICAL FIX: Robust multi-line registration parser
    // This was the primary cause of 0% registration accuracy
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

// SHARED ES3 COMPLIANCE PATTERNS - Used by function-analyzer.js and others
export const ES3_COMPLIANCE_PATTERNS = {
    // Reserved words used as properties (problematic in ES3)
    reserved_as_property: /\.(?:class|const|enum|export|extends|import|super|implements|interface|let|package|private|protected|public|static|yield)\b/g,
    
    // Object literal with reserved word keys
    reserved_object_keys: /(?:class|const|enum|export|extends|import|super|implements|interface|let|package|private|protected|public|static|yield)\s*:/g,
    
    // Array/Object trailing commas (not allowed in ES3)
    trailing_commas: /,\s*(?=[\]}])/g,
    
    // Modern JavaScript features not in ES3
    modern_array_methods: /\.(?:forEach|map|filter|reduce|find|findIndex|includes|some|every)\s*\(/g,
    modern_string_methods: /\.(?:trim|startsWith|endsWith|includes|repeat)\s*\(/g,
    modern_object_methods: /Object\.(?:keys|values|entries|assign|create)\s*\(/g,
    json_usage: /JSON\.(?:parse|stringify)\s*\(/g,
    
    // ES3-safe alternatives detection
    safe_logging_wrappers: /(?:logInfo|logWarn|logError|safeLog)\s*\(/g,
    safe_utility_calls: /(?:arrayIndexOf|stringReplace|objectHasOwnProperty)\s*\(/g
};

// SHARED FUNCTION ANALYSIS PATTERNS - Used by individual-module-analyzer.js and others
export const FUNCTION_ANALYSIS_PATTERNS = {
    // Function with parameters
    function_with_params: /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)/g,
    
    // Anonymous functions
    anonymous_function: /function\s*\([^)]*\)\s*\{/g,
    
    // Arrow functions (ExtendScript doesn't support, but check anyway)
    arrow_function: /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\([^)]*\)\s*=>/g,
    
    // Method definitions
    method_definition: /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*function\s*\(/g,
    
    // Function calls with context
    function_call_context: /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*[;,}\n]/g,
    
    // Nested function detection
    nested_functions: /function\s+[^{]*\{[^}]*function\s+/g
};

// SHARED DEPENDENCY TRACKING PATTERNS - Used by system-analyzer.js and others
export const DEPENDENCY_TRACKING_PATTERNS = {
    // Function calls that might be dependencies
    external_calls: /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g,
    
    // Variable references that might be from other modules
    external_refs: /(?:^|[^a-zA-Z0-9_$])([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?:\.|[\(\[\.])/g,
    
    // Explicit dependency declarations
    dependency_declarations: /\/\/\s*(?:DEPENDS?(?:\s+ON)?|REQUIRES?)\s*:?\s*(.*?)(?:\n|$)/gm,
    
    // Module loading patterns
    module_loading: /(?:require|import|load)\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    
    // Sequential loading patterns (1.1 -> 1.2 -> 2.1)
    sequential_dependency: /(\d+)\.(\d+)\.(\d+)\.(\d+)_/g
};

// SHARED DRY COMPLIANCE PATTERNS - Used by multiple analyzers
export const DRY_COMPLIANCE_PATTERNS = {
    // Duplicate function detection
    similar_function_names: /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*(?:Helper|Util|Check|Validate|Process))\s*\(/g,
    
    // Repeated code blocks
    repeated_blocks: /(?:if|for|while)\s*\([^)]+\)\s*\{[^}]{20,}\}/g,
    
    // Utility function usage (good DRY)
    utility_usage: /(?:arrayIndexOf|stringReplace|objectHasOwnProperty|safeLog)\s*\(/g,
    
    // Reimplementation patterns (bad DRY)
    array_reimplementation: /for\s*\([^)]*\)\s*\{[^}]*(?:if|===)[^}]*\}/g,
    string_reimplementation: /\.replace\s*\([^)]*\)/g,
    
    // Justified duplications
    polyfill_justification: /(?:polyfill|shim|compatibility|fallback)/i,
    es3_justification: /(?:es3|extendscript|legacy)/i
};

// SHARED PATTERN UTILITIES - Used by all analysis scripts
export const PATTERN_UTILS = {
    /**
     * Extract registration info using robust multi-line parsing
     * CRITICAL: This function fixes the 0% registration accuracy issue
     */
    extractRegistrationInfo: function(content) {
        const pattern = CONTENT_PATTERNS.register_module;
        const match = pattern.exec(content);
        
        if (!match) {
            return null;
        }

        const [, , moduleName, , description, arrayContent] = match;
        
        // Clean up the function array content
        let cleanedArray = arrayContent
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
            .replace(/\/\/.*$/gm, '')         // Remove line comments
            .replace(/\s+/g, ' ')             // Normalize whitespace
            .trim();

        // Extract function names from the cleaned array
        const functionMatches = cleanedArray.match(/(['"`])[^'"`]*?\1/g) || [];
        const functions = functionMatches.map(match => {
            return match.replace(/^['"`]|['"`]$/g, '').trim();
        }).filter(name => name.length > 0);

        return {
            moduleName,
            description,
            functions,
            rawArray: arrayContent
        };
    },

    /**
     * Extract all function definitions from content
     * Used by individual-module-analyzer.js and others
     */
    extractFunctionDefinitions: function(content) {
        const functions = [];
        const pattern = FUNCTION_ANALYSIS_PATTERNS.function_with_params;
        let match;

        // Reset regex state
        pattern.lastIndex = 0;

        while ((match = pattern.exec(content)) !== null) {
            functions.push({
                name: match[1],
                params: match[2],
                fullMatch: match[0],
                index: match.index
            });
        }

        pattern.lastIndex = 0; // Reset regex state
        return functions;
    },

    /**
     * Check if position is inside a comment or string
     * Used by function-analyzer.js for context checking
     */
    isInCommentOrString: function(content, position) {
        const beforePos = content.substring(0, position);
        
        // Simple check for comment/string context
        let inString = false;
        let stringChar = null;
        let inLineComment = false;
        let inBlockComment = false;

        for (let i = 0; i < beforePos.length; i++) {
            const char = beforePos[i];
            const nextChar = i < beforePos.length - 1 ? beforePos[i + 1] : null;
            const prevChar = i > 0 ? beforePos[i - 1] : null;

            // Block comment start
            if (!inString && !inLineComment && char === '/' && nextChar === '*') {
                inBlockComment = true;
                i++; // Skip next char
                continue;
            }

            // Block comment end
            if (inBlockComment && char === '*' && nextChar === '/') {
                inBlockComment = false;
                i++; // Skip next char
                continue;
            }

            // Line comment start
            if (!inString && !inBlockComment && char === '/' && nextChar === '/') {
                inLineComment = true;
                continue;
            }

            // Line comment end
            if (inLineComment && char === '\n') {
                inLineComment = false;
                continue;
            }

            // Skip if in comments
            if (inBlockComment || inLineComment) continue;

            // String handling
            if (!inString && (char === '"' || char === "'" || char === '`')) {
                inString = true;
                stringChar = char;
            } else if (inString && char === stringChar && prevChar !== '\\') {
                inString = false;
                stringChar = null;
            }
        }

        return inString || inBlockComment || inLineComment;
    },

    /**
     * Clean registration array content
     * Used by multiple analyzers for parsing function arrays
     */
    cleanRegistrationArray: function(arrayContent) {
        if (!arrayContent) return '';

        return arrayContent
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
            .replace(/\/\/.*$/gm, '')         // Remove line comments
            .replace(/\s+/g, ' ')             // Normalize whitespace
            .trim();
    },

    /**
     * Extract module metadata from header comments
     * Used by individual-module-analyzer.js
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

// Export all patterns and utilities as shared library
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
    PATTERN_UTILS
};