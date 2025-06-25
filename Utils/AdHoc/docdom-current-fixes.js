// ============================================================================
// DOCDOM CURRENT FIXES
// Ready-to-execute configuration for fixing all identified issues
// Location: root/Utils/AdHoc/docdom-current-fixes.js
// ============================================================================

export default {
    description: "Complete fix for DocDom registration issues - Phase 1 & 2",
    operations: [
        // =====================================================================
        // PHASE 1: CORE SYSTEM FIXES
        // =====================================================================
        
        {
            action: "SIMPLE_REPLACE",
            targetFile: "Utils/config/patterns.js", // FIXED: Use relative path
            find: "register_module: /registerModule\\s*\\(\\s*(['\"])([^'\"]+)\\1\\s*,\\s*(['\"])([^'\"]+)\\3\\s*,\\s*\\[([\\s\\S]*?)\\]\\s*\\)\\s*;?/gs,",
            replace: "register_module: /registerModule\\s*\\(\\s*(['\"])([^'\"]+)\\1\\s*,\\s*(['\"])([^'\"]+)\\3\\s*,\\s*\\[([\\s\\S]*?)\\]\\s*\\)\\s*;?/s,",
            description: "Fix core regex pattern - remove global flag that breaks capturing groups",
            priority: 1
        },
        
        {
            action: "REPLACE_FUNCTION",
            targetFile: "Utils/core/module-parser.js", // FIXED: Use relative path
            functionName: "extractRegistration",
            description: "Enhanced registration extraction with full debugging",
            priority: 2,
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
        },
        
        {
            action: "INSERT_FUNCTION_AFTER",
            targetFile: "Utils/core/module-parser.js", // FIXED: Use relative path
            afterFunction: "extractRegistration",
            description: "Add filename vs registration validation function",
            priority: 3,
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
        },
        
        {
            action: "INSERT_FUNCTION_AFTER",
            targetFile: "Utils/core/module-parser.js", // FIXED: Use relative path
            afterFunction: "validateFilenameRegistration",
            description: "Add comprehensive debugging function",
            priority: 4,
            newFunction: `
/**
 * Comprehensive registration debugging
 * @param {string} filePath - Module file path
 * @returns {Object} Detailed analysis
 */
const debugRegistrationExtraction = (filePath) => {
    const filename = path.basename(filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(\`\\n🔍 DEBUGGING REGISTRATION EXTRACTION: \${filename}\`);
    console.log('='.repeat(60));
    
    const analysis = {
        filename,
        contentLength: content.length,
        hasRegisterModule: content.includes('registerModule'),
        registerModuleCalls: [],
        extractionAttempts: {
            regex: null,
            manual: null,
            enhanced: null
        },
        finalResult: null
    };
    
    // Find all registerModule calls
    const allCalls = content.match(/registerModule[^;]*/g);
    if (allCalls) {
        analysis.registerModuleCalls = allCalls.map(call => ({
            call: call.substring(0, 100) + (call.length > 100 ? '...' : ''),
            length: call.length
        }));
    }
    
    console.log('📊 Basic Analysis:');
    console.log(\`   Content length: \${analysis.contentLength} chars\`);
    console.log(\`   Contains registerModule: \${analysis.hasRegisterModule}\`);
    console.log(\`   RegisterModule calls found: \${analysis.registerModuleCalls.length}\`);
    
    if (analysis.registerModuleCalls.length > 0) {
        console.log('📋 Found calls:');
        analysis.registerModuleCalls.forEach((call, i) => {
            console.log(\`   \${i + 1}. \${call.call}\`);
        });
    }
    
    // Test extraction methods
    analysis.extractionAttempts.regex = extractRegistration(content);
    analysis.finalResult = analysis.extractionAttempts.regex;
    
    // Validation
    const validation = validateFilenameRegistration(filename, analysis.finalResult);
    analysis.validation = validation;
    
    console.log('🎯 Final Results:');
    console.log(\`   Extraction successful: \${analysis.finalResult.found}\`);
    console.log(\`   Module name: \${analysis.finalResult.moduleName}\`);
    console.log(\`   Version: \${analysis.finalResult.version}\`);
    console.log(\`   Functions count: \${analysis.finalResult.registeredFunctions.length}\`);
    console.log(\`   Version consistent: \${validation.consistent}\`);
    
    if (!validation.consistent) {
        console.log('⚠️  Issues found:');
        validation.issues.forEach(issue => {
            console.log(\`   - \${issue.description}\`);
        });
        console.log('💡 Recommendations:');
        validation.recommendations.forEach(rec => {
            console.log(\`   - \${rec.description}\`);
        });
    }
    
    console.log('='.repeat(60));
    
    return analysis;
};`
        },
        
        {
            action: "UPDATE_EXPORTS",
            targetFile: "Utils/core/module-parser.js", // FIXED: Use relative path
            description: "Add new functions to exports",
            priority: 5,
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
        },
        
        // =====================================================================
        // PHASE 2: MODULE REGISTRATION FIXES
        // =====================================================================
        
        {
            action: "SIMPLE_REPLACE",
            targetFile: "DocDomV4.1/1.20.0.0_safety-utilities.jsx", // FIXED: Use relative path
            find: "registerModule('1.2.0.0_safety-utilities'",
            replace: "registerModule('1.20.0.0_safety-utilities'",
            description: "Fix critical version mismatch in safety utilities",
            priority: 10
        },
        
        {
            action: "SIMPLE_REPLACE",
            targetFile: "DocDomV4.1/2.1.0.0_dom-enumerator.jsx", // FIXED: Use relative path
            find: "registerModule('2.1_dom-enumerator'",
            replace: "registerModule('2.1.0.0_dom-enumerator'",
            description: "Fix missing version in dom enumerator",
            priority: 11
        },
        
        {
            action: "SIMPLE_REPLACE",
            targetFile: "DocDomV4.1/2.2.0.0_collection-sampler.jsx", // FIXED: Use relative path
            find: "registerModule('2.2_collection-sampler'",
            replace: "registerModule('2.2.0.0_collection-sampler'",
            description: "Fix missing version in collection sampler",
            priority: 12
        },
        
        {
            action: "SIMPLE_REPLACE",
            targetFile: "DocDomV4.1/3.1.0.0_property-sampler.jsx", // FIXED: Use relative path
            find: "registerModule('3.1_property-sampler'",
            replace: "registerModule('3.1.0.0_property-sampler'",
            description: "Fix missing version in property sampler",
            priority: 13
        },
        
        {
            action: "SIMPLE_REPLACE",
            targetFile: "DocDomV4.1/3.2.0.0_dom-exporter.jsx", // FIXED: Use relative path
            find: "registerModule('3.2_dom-exporter'",
            replace: "registerModule('3.2.0.0_dom-exporter'",
            description: "Fix missing version in dom exporter",
            priority: 14
        },
        
        {
            action: "SIMPLE_REPLACE",
            targetFile: "DocDomV4.1/4.1.0.0_json-analyzer.jsx", // FIXED: Use relative path
            find: "registerModule('4.1_json-analyzer'",
            replace: "registerModule('4.1.0.0_json-analyzer'",
            description: "Fix missing version in json analyzer",
            priority: 15
        },
        
        {
            action: "SIMPLE_REPLACE",
            targetFile: "DocDomV4.1/4.2.0.0_dom-comparator.jsx", // FIXED: Use relative path
            find: "registerModule('4.2_dom-comparator'",
            replace: "registerModule('4.2.0.0_dom-comparator'",
            description: "Fix missing version in dom comparator",
            priority: 16
        },
        
        {
            action: "SIMPLE_REPLACE",
            targetFile: "DocDomV4.1/5.1.0.0_deep-mapper.jsx", // FIXED: Use relative path
            find: "registerModule('5.1_deep-mapper'",
            replace: "registerModule('5.1.0.0_deep-mapper'",
            description: "Fix missing version in deep mapper",
            priority: 17
        },
        
        {
            action: "SIMPLE_REPLACE",
            targetFile: "DocDomV4.1/5.2.0.0_dom-visualizer.jsx", // FIXED: Use relative path
            find: "registerModule('5.2_dom-visualizer'",
            replace: "registerModule('5.2.0.0_dom-visualizer'",
            description: "Fix missing version in dom visualizer",
            priority: 18
        },
        
        {
            action: "SIMPLE_REPLACE",
            targetFile: "DocDomV4.1/6.1.0.0_advanced-ui.jsx", // FIXED: Use relative path
            find: "registerModule('6.1_advanced-ui'",
            replace: "registerModule('6.1.0.0_advanced-ui'",
            description: "Fix missing version in advanced ui",
            priority: 19
        }
    ]
};