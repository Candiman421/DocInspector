// Claude Response Configuration - DocDom Fixes
// Generated: 2025-01-21T10:30:00.000Z
// This file contains all the fixes for DocDom registration issues

export default {
  "description": "Complete fix for DocDom registration issues - All phases",
  "operations": [
    {
      "action": "FIND_REPLACE",
      "file": "config/patterns.js",
      "find": "register_module: /registerModule\\s*\\(\\s*(['\"])([^'\"]+)\\1\\s*,\\s*(['\"])([^'\"]+)\\3\\s*,\\s*\\[([\\s\\S]*?)\\]\\s*\\)\\s*;?/gs,",
      "replace": "register_module: /registerModule\\s*\\(\\s*(['\"])([^'\"]+)\\1\\s*,\\s*(['\"])([^'\"]+)\\3\\s*,\\s*\\[([\\s\\S]*?)\\]\\s*\\)\\s*;?/s,"
    },
    {
      "action": "REPLACE_FUNCTION",
      "file": "core/module-parser.js",
      "functionName": "extractRegistration",
      "newCode": "/**\n * ENHANCED - Extract module registration information with multiline support + FULL DEBUGGING\n * @param {string} content - File content\n * @returns {Object} Registration analysis\n */\nconst extractRegistration = (content) => {\n    const registration = {\n        found: false,\n        moduleName: null,\n        version: null,\n        registeredFunctions: [],\n        registrationCall: null,\n        versionMismatch: null,\n        debugInfo: {\n            hasRegisterModule: false,\n            simpleMatchFound: false,\n            complexMatchFound: false,\n            capturingGroups: 0,\n            manualExtractionAttempted: false,\n            parsingMethod: null\n        }\n    };\n\n    try {\n        console.log('\\n=== ENHANCED DEBUGGING extractRegistration ===');\n\n        // Test if registerModule exists at all\n        const hasRegisterModule = content.includes('registerModule');\n        registration.debugInfo.hasRegisterModule = hasRegisterModule;\n        console.log('Debug - File contains registerModule:', hasRegisterModule);\n\n        if (hasRegisterModule) {\n            // Find the basic pattern first\n            const simpleMatch = content.match(/registerModule\\s*\\(/);\n            registration.debugInfo.simpleMatchFound = !!simpleMatch;\n            console.log('Debug - Simple registerModule match:', simpleMatch ? 'FOUND' : 'NOT FOUND');\n        }\n\n        // Test the CORRECTED regex (without global flag)\n        const registerMatch = content.match(CONTENT_PATTERNS.register_module);\n        registration.debugInfo.complexMatchFound = !!registerMatch;\n        console.log('Debug - Complex regex match:', registerMatch ? 'FOUND' : 'NOT FOUND');\n\n        if (registerMatch) {\n            console.log('\\n--- FULL MATCH OBJECT DEBUG ---');\n            registration.debugInfo.capturingGroups = registerMatch.length;\n            console.log('Total capturing groups:', registerMatch.length);\n\n            for (let i = 0; i < registerMatch.length; i++) {\n                const value = registerMatch[i];\n                if (value !== undefined) {\n                    const preview = value.length > 100 ? value.slice(0, 100) + '...' : value;\n                    console.log(`  [${i}]: \"${preview}\"`);\n                } else {\n                    console.log(`  [${i}]: undefined`);\n                }\n            }\n\n            console.log('\\n--- EXPECTED CONTENT ---');\n            console.log('Module name should be at index 2:', registerMatch[2]);\n            console.log('Version should be at index 4:', registerMatch[4]);\n            console.log('Array content should be at index 5:', registerMatch[5] ? 'EXISTS' : 'UNDEFINED');\n\n            if (registerMatch[2] && registerMatch[4] && registerMatch[5]) {\n                registration.found = true;\n                registration.moduleName = registerMatch[2];\n                registration.version = registerMatch[4];\n                registration.registrationCall = registerMatch[0];\n                registration.debugInfo.parsingMethod = 'regex_success';\n\n                // Debug array parsing\n                const arrayContent = registerMatch[5];\n                console.log('\\n--- ARRAY PARSING DEBUG ---');\n                console.log('Raw array content exists, length:', arrayContent.length);\n                console.log('Calling parseRegistrationArray...');\n\n                registration.registeredFunctions = parseRegistrationArray(arrayContent);\n                console.log('parseRegistrationArray returned:', registration.registeredFunctions.length, 'functions');\n                \n                if (registration.registeredFunctions.length > 0) {\n                    console.log('First 5 functions:', registration.registeredFunctions.slice(0, 5));\n                }\n            } else {\n                console.log('ERROR: Some capturing groups undefined - falling back to manual extraction');\n            }\n        }\n\n        // Enhanced manual extraction if regex failed\n        if (!registration.found) {\n            console.log('\\n--- ENHANCED MANUAL EXTRACTION ---');\n            registration.debugInfo.manualExtractionAttempted = true;\n            \n            // More robust manual pattern\n            const manualMatch = content.match(/registerModule\\s*\\(\\s*['\"]([^'\"]+)['\"]\\s*,\\s*['\"]([^'\"]+)['\"]\\s*,\\s*\\[([\\s\\S]*?)\\]\\s*\\)/);\n            \n            if (manualMatch) {\n                console.log('Enhanced manual extraction SUCCESS');\n                registration.found = true;\n                registration.moduleName = manualMatch[1];\n                registration.version = manualMatch[2];\n                registration.registrationCall = manualMatch[0];\n                registration.debugInfo.parsingMethod = 'manual_success';\n                \n                registration.registeredFunctions = parseRegistrationArray(manualMatch[3]);\n                console.log('Manual functions found:', registration.registeredFunctions.length);\n                \n                if (registration.registeredFunctions.length > 0) {\n                    console.log('First 5 functions:', registration.registeredFunctions.slice(0, 5));\n                }\n            } else {\n                console.log('Enhanced manual extraction also FAILED');\n                registration.debugInfo.parsingMethod = 'failed';\n                \n                // Show the actual registerModule call for debugging\n                const callMatch = content.match(/registerModule[\\s\\S]{0,500}/);\n                if (callMatch) {\n                    console.log('Actual registerModule call found:');\n                    console.log(callMatch[0]);\n                }\n            }\n        }\n\n        // Version mismatch detection\n        if (registration.found && registration.moduleName) {\n            const moduleNameParts = registration.moduleName.split('_');\n            const registeredVersion = moduleNameParts[0];\n            \n            // Extract version from module name for comparison\n            console.log('\\n--- VERSION MISMATCH DETECTION ---');\n            console.log('Registered module name:', registration.moduleName);\n            console.log('Extracted registered version:', registeredVersion);\n            \n            registration.versionMismatch = {\n                hasNameVersionPrefix: !!registeredVersion,\n                registeredNameVersion: registeredVersion,\n                registeredCallVersion: registration.version\n            };\n        }\n\n        console.log('\\n--- FINAL REGISTRATION OBJECT ---');\n        console.log('Found:', registration.found);\n        console.log('Module name:', registration.moduleName);\n        console.log('Version:', registration.version);\n        console.log('Functions count:', registration.registeredFunctions.length);\n        console.log('Parsing method:', registration.debugInfo.parsingMethod);\n        console.log('=== END ENHANCED DEBUGGING ===\\n');\n\n    } catch (error) {\n        console.log('ERROR in extractRegistration:', error.message);\n        registration.error = error.message;\n        registration.debugInfo.parsingMethod = 'error';\n    }\n\n    return registration;\n};"
    },
    {
      "action": "INSERT_AFTER",
      "file": "core/module-parser.js",
      "afterFunction": "extractRegistration",
      "newCode": "/**\n * Validate filename vs registration consistency\n * @param {string} filename - Module filename\n * @param {Object} registration - Registration object\n * @returns {Object} Validation result\n */\nconst validateFilenameRegistration = (filename, registration) => {\n    const validation = {\n        consistent: true,\n        issues: [],\n        filenameVersion: null,\n        registeredVersion: null,\n        recommendations: []\n    };\n\n    try {\n        // Extract version from filename\n        const filenameMatch = filename.match(/^(\\d+(?:\\.\\d+)*)_(.+)\\.jsx?$/);\n        if (filenameMatch) {\n            validation.filenameVersion = filenameMatch[1];\n        }\n\n        // Extract version from registration\n        if (registration.found && registration.moduleName) {\n            const moduleNameParts = registration.moduleName.split('_');\n            validation.registeredVersion = moduleNameParts[0];\n        }\n\n        // Compare versions\n        if (validation.filenameVersion && validation.registeredVersion) {\n            if (validation.filenameVersion !== validation.registeredVersion) {\n                validation.consistent = false;\n                validation.issues.push({\n                    type: 'version_mismatch',\n                    severity: 'high',\n                    description: `Filename version (${validation.filenameVersion}) doesn't match registration version (${validation.registeredVersion})`,\n                    filename: filename,\n                    registrationCall: registration.registrationCall\n                });\n                \n                validation.recommendations.push({\n                    action: 'update_registration',\n                    description: `Update registerModule() call to use version '${validation.filenameVersion}'`,\n                    suggestedFix: `registerModule('${validation.filenameVersion}_${registration.moduleName.split('_')[1]}', '${registration.version}', [...`\n                });\n            }\n        }\n\n    } catch (error) {\n        validation.error = error.message;\n    }\n\n    return validation;\n};"
    },
    {
      "action": "REPLACE_EXPORTS",
      "file": "core/module-parser.js",
      "newCode": "export default {\n    parseModuleFile,\n    extractFunctions,\n    extractRegistration,\n    extractDependencies,\n    extractFunctionContent,\n    normalizeFunctionContent,\n    extractFunctionCalls,\n    validateFilenameRegistration\n};"
    },
    {
      "action": "FIND_REPLACE",
      "file": "1.20.0.0_safety-utilities.jsx",
      "find": "registerModule('1.2.0.0_safety-utilities'",
      "replace": "registerModule('1.20.0.0_safety-utilities'"
    },
    {
      "action": "FIND_REPLACE",
      "file": "2.1.0.0_dom-enumerator.jsx",
      "find": "registerModule('2.1_dom-enumerator'",
      "replace": "registerModule('2.1.0.0_dom-enumerator'"
    },
    {
      "action": "FIND_REPLACE",
      "file": "2.2.0.0_collection-sampler.jsx",
      "find": "registerModule('2.2_collection-sampler'",
      "replace": "registerModule('2.2.0.0_collection-sampler'"
    },
    {
      "action": "FIND_REPLACE",
      "file": "3.1.0.0_property-sampler.jsx",
      "find": "registerModule('3.1_property-sampler'",
      "replace": "registerModule('3.1.0.0_property-sampler'"
    },
    {
      "action": "FIND_REPLACE",
      "file": "3.2.0.0_dom-exporter.jsx",
      "find": "registerModule('3.2_dom-exporter'",
      "replace": "registerModule('3.2.0.0_dom-exporter'"
    },
    {
      "action": "FIND_REPLACE",
      "file": "4.1.0.0_json-analyzer.jsx",
      "find": "registerModule('4.1_json-analyzer'",
      "replace": "registerModule('4.1.0.0_json-analyzer'"
    },
    {
      "action": "FIND_REPLACE",
      "file": "4.2.0.0_dom-comparator.jsx",
      "find": "registerModule('4.2_dom-comparator'",
      "replace": "registerModule('4.2.0.0_dom-comparator'"
    },
    {
      "action": "FIND_REPLACE",
      "file": "5.1.0.0_deep-mapper.jsx",
      "find": "registerModule('5.1_deep-mapper'",
      "replace": "registerModule('5.1.0.0_deep-mapper'"
    },
    {
      "action": "FIND_REPLACE",
      "file": "5.2.0.0_dom-visualizer.jsx",
      "find": "registerModule('5.2_dom-visualizer'",
      "replace": "registerModule('5.2.0.0_dom-visualizer'"
    },
    {
      "action": "FIND_REPLACE",
      "file": "6.1.0.0_advanced-ui.jsx",
      "find": "registerModule('6.1_advanced-ui'",
      "replace": "registerModule('6.1.0.0_advanced-ui'"
    }
  ]
};
