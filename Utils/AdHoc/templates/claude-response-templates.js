// ============================================================================
// CLAUDE RESPONSE TEMPLATES
// Templates for structuring Claude responses for automatic merging
// Location: root/Utils/AdHoc/templates/
// ============================================================================

/**
 * TEMPLATE 1: REPLACE FUNCTION
 * Use when Claude provides a complete function replacement
 */
export const REPLACE_FUNCTION_TEMPLATE = {
    description: "Replace existing function with enhanced version",
    operations: [
        {
            action: "REPLACE_FUNCTION",
            targetFile: "core/module-parser.js",
            functionName: "extractRegistration",
            description: "Enhanced registration extraction with debugging",
            priority: 1,
            newFunction: `
/**
 * ENHANCED - Extract module registration information with multiline support + FULL DEBUGGING
 * @param {string} content - File content
 * @returns {Object} Registration analysis
 */
const extractRegistration = (content) => {
    const registration = {
        found: false,
        moduleName: null,
        version: null,
        registeredFunctions: [],
        registrationCall: null,
        versionMismatch: null,
        debugInfo: {
            hasRegisterModule: false,
            simpleMatchFound: false,
            complexMatchFound: false,
            capturingGroups: 0,
            manualExtractionAttempted: false,
            parsingMethod: null
        }
    };

    try {
        console.log('\\n=== ENHANCED DEBUGGING extractRegistration ===');
        
        // Test if registerModule exists at all
        const hasRegisterModule = content.includes('registerModule');
        registration.debugInfo.hasRegisterModule = hasRegisterModule;
        console.log('Debug - File contains registerModule:', hasRegisterModule);

        if (hasRegisterModule) {
            // Find the basic pattern first
            const simpleMatch = content.match(/registerModule\\s*\\(/);
            registration.debugInfo.simpleMatchFound = !!simpleMatch;
            console.log('Debug - Simple registerModule match:', simpleMatch ? 'FOUND' : 'NOT FOUND');
        }

        // Test the CORRECTED regex (without global flag)
        const registerMatch = content.match(CONTENT_PATTERNS.register_module);
        registration.debugInfo.complexMatchFound = !!registerMatch;
        console.log('Debug - Complex regex match:', registerMatch ? 'FOUND' : 'NOT FOUND');

        if (registerMatch) {
            console.log('\\n--- FULL MATCH OBJECT DEBUG ---');
            registration.debugInfo.capturingGroups = registerMatch.length;
            console.log('Total capturing groups:', registerMatch.length);

            for (let i = 0; i < registerMatch.length; i++) {
                const value = registerMatch[i];
                if (value !== undefined) {
                    const preview = value.length > 100 ? value.slice(0, 100) + '...' : value;
                    console.log(\`  [\${i}]: "\${preview}"\`);
                } else {
                    console.log(\`  [\${i}]: undefined\`);
                }
            }

            console.log('\\n--- EXPECTED CONTENT ---');
            console.log('Module name should be at index 2:', registerMatch[2]);
            console.log('Version should be at index 4:', registerMatch[4]);
            console.log('Array content should be at index 5:', registerMatch[5] ? 'EXISTS' : 'UNDEFINED');

            if (registerMatch[2] && registerMatch[4] && registerMatch[5]) {
                registration.found = true;
                registration.moduleName = registerMatch[2];
                registration.version = registerMatch[4];
                registration.registrationCall = registerMatch[0];
                registration.debugInfo.parsingMethod = 'regex_success';

                // Debug array parsing
                const arrayContent = registerMatch[5];
                console.log('\\n--- ARRAY PARSING DEBUG ---');
                console.log('Raw array content exists, length:', arrayContent.length);
                console.log('Calling parseRegistrationArray...');

                registration.registeredFunctions = parseRegistrationArray(arrayContent);
                console.log('parseRegistrationArray returned:', registration.registeredFunctions.length, 'functions');
                
                if (registration.registeredFunctions.length > 0) {
                    console.log('First 5 functions:', registration.registeredFunctions.slice(0, 5));
                }
            } else {
                console.log('ERROR: Some capturing groups undefined - falling back to manual extraction');
            }
        }

        // Enhanced manual extraction if regex failed
        if (!registration.found) {
            console.log('\\n--- ENHANCED MANUAL EXTRACTION ---');
            registration.debugInfo.manualExtractionAttempted = true;
            
            // More robust manual pattern
            const manualMatch = content.match(/registerModule\\s*\\(\\s*['\"]([^'\"]+)['\"]\\s*,\\s*['\"]([^'\"]+)['\"]\\s*,\\s*\\[([\\s\\S]*?)\\]\\s*\\)/);
            
            if (manualMatch) {
                console.log('Enhanced manual extraction SUCCESS');
                registration.found = true;
                registration.moduleName = manualMatch[1];
                registration.version = manualMatch[2];
                registration.registrationCall = manualMatch[0];
                registration.debugInfo.parsingMethod = 'manual_success';
                
                registration.registeredFunctions = parseRegistrationArray(manualMatch[3]);
                console.log('Manual functions found:', registration.registeredFunctions.length);
                
                if (registration.registeredFunctions.length > 0) {
                    console.log('First 5 functions:', registration.registeredFunctions.slice(0, 5));
                }
            } else {
                console.log('Enhanced manual extraction also FAILED');
                registration.debugInfo.parsingMethod = 'failed';
                
                // Show the actual registerModule call for debugging
                const callMatch = content.match(/registerModule[\\s\\S]{0,500}/);
                if (callMatch) {
                    console.log('Actual registerModule call found:');
                    console.log(callMatch[0]);
                }
            }
        }

        // Version mismatch detection
        if (registration.found && registration.moduleName) {
            const moduleNameParts = registration.moduleName.split('_');
            const registeredVersion = moduleNameParts[0];
            
            // Extract version from module name for comparison
            console.log('\\n--- VERSION MISMATCH DETECTION ---');
            console.log('Registered module name:', registration.moduleName);
            console.log('Extracted registered version:', registeredVersion);
            
            registration.versionMismatch = {
                hasNameVersionPrefix: !!registeredVersion,
                registeredNameVersion: registeredVersion,
                registeredCallVersion: registration.version
            };
        }

        console.log('\\n--- FINAL REGISTRATION OBJECT ---');
        console.log('Found:', registration.found);
        console.log('Module name:', registration.moduleName);
        console.log('Version:', registration.version);
        console.log('Functions count:', registration.registeredFunctions.length);
        console.log('Parsing method:', registration.debugInfo.parsingMethod);
        console.log('=== END ENHANCED DEBUGGING ===\\n');

    } catch (error) {
        console.log('ERROR in extractRegistration:', error.message);
        registration.error = error.message;
        registration.debugInfo.parsingMethod = 'error';
    }

    return registration;
};`
        }
    ]
};

/**
 * TEMPLATE 2: INSERT NEW FUNCTION
 * Use when Claude provides a new function to add
 */
export const INSERT_FUNCTION_TEMPLATE = {
    description: "Insert new function after existing function",
    operations: [
        {
            action: "INSERT_FUNCTION_AFTER",
            targetFile: "core/module-parser.js",
            afterFunction: "extractRegistration",
            description: "Add filename validation function",
            priority: 1,
            newFunction: `
/**
 * Validate filename vs registration consistency
 * @param {string} filename - Module filename
 * @param {Object} registration - Registration object
 * @returns {Object} Validation result
 */
const validateFilenameRegistration = (filename, registration) => {
    const validation = {
        consistent: true,
        issues: [],
        filenameVersion: null,
        registeredVersion: null,
        recommendations: []
    };

    try {
        // Extract version from filename
        const filenameMatch = filename.match(/^(\\d+(?:\\.\\d+)*)_(.+)\\.jsx?$/);
        if (filenameMatch) {
            validation.filenameVersion = filenameMatch[1];
        }

        // Extract version from registration
        if (registration.found && registration.moduleName) {
            const moduleNameParts = registration.moduleName.split('_');
            validation.registeredVersion = moduleNameParts[0];
        }

        // Compare versions
        if (validation.filenameVersion && validation.registeredVersion) {
            if (validation.filenameVersion !== validation.registeredVersion) {
                validation.consistent = false;
                validation.issues.push({
                    type: 'version_mismatch',
                    severity: 'high',
                    description: \`Filename version (\${validation.filenameVersion}) doesn't match registration version (\${validation.registeredVersion})\`,
                    filename: filename,
                    registrationCall: registration.registrationCall
                });
                
                validation.recommendations.push({
                    action: 'update_registration',
                    description: \`Update registerModule() call to use version '\${validation.filenameVersion}'\`,
                    suggestedFix: \`registerModule('\${validation.filenameVersion}_\${registration.moduleName.split('_')[1]}', '\${registration.version}', [...\`
                });
            }
        }

    } catch (error) {
        validation.error = error.message;
    }

    return validation;
};`
        }
    ]
};

/**
 * TEMPLATE 3: SIMPLE REPLACEMENTS
 * Use for find/replace operations
 */
export const SIMPLE_REPLACE_TEMPLATE = {
    description: "Fix registration calls across multiple modules",
    operations: [
        {
            action: "SIMPLE_REPLACE",
            targetFile: "1.20.0.0_safety-utilities.jsx",
            find: "registerModule('1.2.0.0_safety-utilities'",
            replace: "registerModule('1.20.0.0_safety-utilities'",
            description: "Fix version mismatch in safety utilities",
            priority: 1
        },
        {
            action: "SIMPLE_REPLACE",
            targetFile: "2.1.0.0_dom-enumerator.jsx",
            find: "registerModule('2.1_dom-enumerator'",
            replace: "registerModule('2.1.0.0_dom-enumerator'",
            description: "Fix registration name for dom enumerator",
            priority: 1
        },
        {
            action: "SIMPLE_REPLACE",
            targetFile: "2.2.0.0_collection-sampler.jsx",
            find: "registerModule('2.2_collection-sampler'",
            replace: "registerModule('2.2.0.0_collection-sampler'",
            description: "Fix registration name for collection sampler",
            priority: 1
        }
    ]
};

/**
 * TEMPLATE 4: UPDATE FILE TOP
 * Use for imports, headers, configuration
 */
export const UPDATE_FILE_TOP_TEMPLATE = {
    description: "Update imports and file header",
    operations: [
        {
            action: "UPDATE_FILE_TOP",
            targetFile: "core/module-parser.js",
            stopBeforeFunction: "parseModuleFile",
            description: "Add new imports and update header",
            priority: 1,
            newContent: `// ============================================================================
// MODULE PARSER CORE MODULE
// Extract functions, metadata, and structure from DocDom module files
// ============================================================================

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { CONTENT_PATTERNS } from '../config/patterns.js';
import { parseRegistrationArray } from '../config/patterns.js';

// New configuration constants
const PARSER_CONFIG = {
    maxFunctionSize: 10000,
    enableDebugMode: true,
    validationEnabled: true
};`
        }
    ]
};

/**
 * TEMPLATE 5: UPDATE EXPORTS
 * Use for updating export statements
 */
export const UPDATE_EXPORTS_TEMPLATE = {
    description: "Update module exports",
    operations: [
        {
            action: "UPDATE_EXPORTS",
            targetFile: "core/module-parser.js",
            description: "Add new functions to exports",
            priority: 1,
            newExports: `export default {
    parseModuleFile,
    extractFunctions,
    extractRegistration,
    extractDependencies,
    extractFunctionContent,
    normalizeFunctionContent,
    extractFunctionCalls,
    validateFilenameRegistration,
    debugRegistrationExtraction
};`
        }
    ]
};

/**
 * TEMPLATE 6: REGEX PATTERN FIX
 * Use for fixing regex patterns
 */
export const REGEX_FIX_TEMPLATE = {
    description: "Fix regex pattern in patterns.js",
    operations: [
        {
            action: "SIMPLE_REPLACE",
            targetFile: "config/patterns.js",
            find: "register_module: /registerModule\\s*\\(\\s*(['\"])([^'\"]+)\\1\\s*,\\s*(['\"])([^'\"]+)\\3\\s*,\\s*\\[([\\s\\S]*?)\\]\\s*\\)\\s*;?/gs,",
            replace: "register_module: /registerModule\\s*\\(\\s*(['\"])([^'\"]+)\\1\\s*,\\s*(['\"])([^'\"]+)\\3\\s*,\\s*\\[([\\s\\S]*?)\\]\\s*\\)\\s*;?/s,",
            description: "Remove global flag from register_module regex pattern",
            priority: 1
        }
    ]
};

/**
 * TEMPLATE 7: BULK MODULE FIXES
 * Use for fixing multiple modules at once
 */
export const BULK_MODULE_FIXES_TEMPLATE = {
    description: "Fix registration issues across all modules",
    operations: [
        {
            action: "SIMPLE_REPLACE",
            targetFile: "1.20.0.0_safety-utilities.jsx",
            find: "registerModule('1.2.0.0_safety-utilities'",
            replace: "registerModule('1.20.0.0_safety-utilities'",
            description: "Fix version mismatch",
            priority: 1
        },
        {
            action: "SIMPLE_REPLACE", 
            targetFile: "2.1.0.0_dom-enumerator.jsx",
            find: "registerModule('2.1_dom-enumerator'",
            replace: "registerModule('2.1.0.0_dom-enumerator'",
            description: "Fix missing version",
            priority: 1
        },
        {
            action: "SIMPLE_REPLACE",
            targetFile: "2.2.0.0_collection-sampler.jsx", 
            find: "registerModule('2.2_collection-sampler'",
            replace: "registerModule('2.2.0.0_collection-sampler'",
            description: "Fix missing version",
            priority: 1
        },
        {
            action: "SIMPLE_REPLACE",
            targetFile: "3.1.0.0_property-sampler.jsx",
            find: "registerModule('3.1_property-sampler'",
            replace: "registerModule('3.1.0.0_property-sampler'",
            description: "Fix missing version", 
            priority: 1
        },
        {
            action: "SIMPLE_REPLACE",
            targetFile: "3.2.0.0_dom-exporter.jsx",
            find: "registerModule('3.2_dom-exporter'",
            replace: "registerModule('3.2.0.0_dom-exporter'",
            description: "Fix missing version",
            priority: 1
        },
        {
            action: "SIMPLE_REPLACE",
            targetFile: "4.1.0.0_json-analyzer.jsx",
            find: "registerModule('4.1_json-analyzer'",
            replace: "registerModule('4.1.0.0_json-analyzer'",
            description: "Fix missing version",
            priority: 1
        },
        {
            action: "SIMPLE_REPLACE", 
            targetFile: "4.2.0.0_dom-comparator.jsx",
            find: "registerModule('4.2_dom-comparator'",
            replace: "registerModule('4.2.0.0_dom-comparator'",
            description: "Fix missing version",
            priority: 1
        },
        {
            action: "SIMPLE_REPLACE",
            targetFile: "5.1.0.0_deep-mapper.jsx",
            find: "registerModule('5.1_deep-mapper'",
            replace: "registerModule('5.1.0.0_deep-mapper'",
            description: "Fix missing version",
            priority: 1
        },
        {
            action: "SIMPLE_REPLACE",
            targetFile: "5.2.0.0_dom-visualizer.jsx", 
            find: "registerModule('5.2_dom-visualizer'",
            replace: "registerModule('5.2.0.0_dom-visualizer'",
            description: "Fix missing version",
            priority: 1
        },
        {
            action: "SIMPLE_REPLACE",
            targetFile: "6.1.0.0_advanced-ui.jsx",
            find: "registerModule('6.1_advanced-ui'",
            replace: "registerModule('6.1.0.0_advanced-ui'",
            description: "Fix missing version",
            priority: 1
        }
    ]
};

// Export all templates
export default {
    REPLACE_FUNCTION_TEMPLATE,
    INSERT_FUNCTION_TEMPLATE,
    SIMPLE_REPLACE_TEMPLATE,
    UPDATE_FILE_TOP_TEMPLATE,
    UPDATE_EXPORTS_TEMPLATE,
    REGEX_FIX_TEMPLATE,
    BULK_MODULE_FIXES_TEMPLATE
};