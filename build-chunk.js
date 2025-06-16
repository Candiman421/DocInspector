#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// ============================================================================
// BUILD MODE SELECTION - Set exactly ONE to true
// ============================================================================

const BUILD_MODES = {
    OLD_CHUNKS: false,      // Original chunk-based system
    NEW_MODULES: false,     // New modular system  
    DOM_DISCOVERY: true     // New DOM Discovery system (v2.1 - TARGET ARCHITECTURE)
};

// ============================================================================
// ENHANCED CONFIGURATION 
// ============================================================================

const BUILD_CONFIG = {
    // OLD CHUNK SYSTEM CONFIG
    oldChunks: {
        TARGET_FOLDER: './scripts',
        OUTPUT_FILE: 'InDesignDocInspectorAndComparer_ChunkBuilt.jsx',
        INCLUDE_FILE: 'InDesignInspector_INCLUDES.jsx',
        PATTERN: /^InDesignDocInspectorAndComparer_Chunk_([0-9]+(?:\.[0-9]+)*)_.*\.jsx$/,
        SYSTEM_NAME: 'InDesign Inspector v2.1-ESTK',
        FILES_TO_EXCLUDE: [
            'InDesignDocInspectorAndComparer_ChunkBuilt.jsx'
        ]
    },
    
    // NEW MODULE SYSTEM CONFIG  
    newModules: {
        TARGET_FOLDER: './Modules',
        OUTPUT_FILE: 'InDesignQueryTool_v3.0_Complete.jsx',
        INCLUDE_FILE: 'InDesignQuery_INCLUDES.jsx',
        PATTERN: /^Module_([0-9]+\.[0-9]+)_.*\.jsx$/,
        SYSTEM_NAME: 'InDesign Query Tool v3.0',
        FILES_TO_EXCLUDE: [
            'InDesignQueryTool_v3.0_Complete.jsx'
        ]
    },
    
    // DOM DISCOVERY SYSTEM CONFIG (v2.1 TARGET ARCHITECTURE)
    domDiscovery: {
        TARGET_FOLDER: './DocDomV2.1',
        OUTPUT_FILE: 'InDesign_DOM_Discovery_Builder_v2.1_COMPLETE.jsx',
        INCLUDE_FILE: 'DOM_Discovery_Builder_v2.1_INCLUDES.jsx',
        PATTERN: /^([0-9]+\.[0-9]+)_.*\.jsx$/,
        SYSTEM_NAME: 'InDesign DOM Discovery Builder v2.1',
        EXPECTED_MODULES: [
            '1.0_safe-foundation.jsx',
            '2.0_dom-enumerator.jsx', 
            '3.0_collection-sampler.jsx',
            '4.0_property-sampler.jsx',
            '5.0_dom-exporter.jsx',
            '6.0_json-analyzer.jsx',
            '7.0_dom-comparator.jsx',
            '8.0_deep-mapper.jsx',
            '9.0_dom-visualizer.jsx',
            '10.0_advanced-ui.jsx'
        ],
        FILES_TO_EXCLUDE: [
            'InDesign_DOM_Discovery_Builder_v2.1_COMPLETE.jsx',
            'DOM_Discovery_Builder_v2.1_INCLUDES.jsx',
            'doc-dom-loader.jsx',
            '9_DEMO_Test_DOM_Discovery.jsx'
        ]
    },
    
    // Enhanced build options
    options: {
        ADD_DEBUG_COMMENTS: true,
        ADD_TIMESTAMPS: true,
        VALIDATE_FILES: true,
        SHOW_PROGRESS: true,
        AUTO_START_DOM: true,  // Auto-start DOM interface after build
        GENERATE_BOTH_FORMATS: true  // Generate both concatenated and include versions
    }
};

// ============================================================================
// BUILD MODE VALIDATION AND SELECTION
// ============================================================================

function validateAndSelectBuildMode() {
    const enabledModes = Object.keys(BUILD_MODES).filter(mode => BUILD_MODES[mode]);
    
    if (enabledModes.length === 0) {
        console.error('❌ ERROR: No build mode enabled!');
        console.error('   Set exactly ONE of these to true in BUILD_MODES:');
        console.error('   - OLD_CHUNKS: for legacy chunk system');
        console.error('   - NEW_MODULES: for v3.0 modular system');
        console.error('   - DOM_DISCOVERY: for v2.1 target architecture');
        process.exit(1);
    }
    
    if (enabledModes.length > 1) {
        console.error('❌ ERROR: Multiple build modes enabled!');
        console.error(`   Found enabled: ${enabledModes.join(', ')}`);
        console.error('   Set exactly ONE to true, others to false');
        process.exit(1);
    }
    
    const selectedMode = enabledModes[0];
    let configKey, buildType, systemName;
    
    switch (selectedMode) {
        case 'OLD_CHUNKS':
            configKey = 'oldChunks';
            buildType = 'CHUNKS';
            systemName = BUILD_CONFIG.oldChunks.SYSTEM_NAME;
            break;
        case 'NEW_MODULES':
            configKey = 'newModules';
            buildType = 'MODULES';
            systemName = BUILD_CONFIG.newModules.SYSTEM_NAME;
            break;
        case 'DOM_DISCOVERY':
            configKey = 'domDiscovery';
            buildType = 'DOM_DISCOVERY';
            systemName = BUILD_CONFIG.domDiscovery.SYSTEM_NAME;
            break;
        default:
            console.error(`❌ ERROR: Unknown build mode: ${selectedMode}`);
            process.exit(1);
    }
    
    return {
        mode: selectedMode,
        config: BUILD_CONFIG[configKey],
        buildType: buildType,
        systemName: systemName
    };
}

// ============================================================================
// ENHANCED FILE DISCOVERY AND VALIDATION
// ============================================================================

function discoverAndValidateFiles(buildInfo) {
    const { config, buildType, systemName } = buildInfo;
    
    console.log(`🔧 ${systemName} - Enhanced Auto-Discovery Builder`);
    console.log('='.repeat(60));
    console.log(`📂 Target folder: ${config.TARGET_FOLDER}`);
    console.log(`📄 Output file: ${config.OUTPUT_FILE}`);
    console.log(`📄 Include file: ${config.INCLUDE_FILE}`);
    console.log(`🔨 Build type: ${buildType.replace('_', ' ')} System`);
    
    // Check if target folder exists
    if (!fs.existsSync(config.TARGET_FOLDER)) {
        console.error(`❌ Target folder does not exist: ${config.TARGET_FOLDER}`);
        
        if (buildType === 'DOM_DISCOVERY') {
            console.error('');
            console.error('📁 SETUP INSTRUCTIONS for DOM Discovery v2.1:');
            console.error('   1. Create folder: DocDomV2.1/');
            console.error('   2. Place these 10 modules in the folder:');
            config.EXPECTED_MODULES.forEach((module, index) => {
                console.error(`      ${index + 1}. ${module}`);
            });
            console.error('');
            console.error('💡 TIP: The modules follow sequential dependency architecture');
            console.error('   Each module only depends on lower-numbered modules');
        }
        
        process.exit(1);
    }
    
    console.log(`\n🔍 Discovering files in target folder...`);
    
    // Get all files matching pattern
    const allFiles = fs.readdirSync(config.TARGET_FOLDER);
    const matchingFiles = allFiles.filter(filename => filename.match(config.PATTERN));
    
    console.log(`📁 Found ${matchingFiles.length} files matching pattern`);
    
    if (matchingFiles.length === 0) {
        console.error(`❌ No files found matching pattern in: ${config.TARGET_FOLDER}`);
        console.error(`   Expected pattern: ${config.PATTERN}`);
        
        if (buildType === 'DOM_DISCOVERY') {
            console.error('');
            console.error('📝 Expected files for DOM Discovery v2.1:');
            config.EXPECTED_MODULES.forEach((module, index) => {
                console.error(`   ${index + 1}. ${module}`);
            });
        }
        
        process.exit(1);
    }
    
    // Process and validate files
    const discoveredFiles = [];
    let hasErrors = false;
    
    console.log('\n📋 Processing discovered files:');
    
    matchingFiles.forEach(filename => {
        const match = filename.match(config.PATTERN);
        if (match) {
            const versionString = match[1];
            const fullPath = path.join(config.TARGET_FOLDER, filename);
            
            // Validate file access
            if (BUILD_CONFIG.options.VALIDATE_FILES) {
                try {
                    fs.accessSync(fullPath, fs.constants.R_OK);
                    const stats = fs.statSync(fullPath);
                    const sizeKB = Math.round(stats.size / 1024);
                    console.log(`   ✅ ${filename} (v${versionString}, ${sizeKB}KB)`);
                } catch (error) {
                    console.error(`   ❌ ${filename} - Cannot read: ${error.message}`);
                    hasErrors = true;
                    return;
                }
            }
            
            discoveredFiles.push({
                filename: filename,
                path: fullPath,
                versionString: versionString,
                versionArray: parseVersionNumber(versionString)
            });
        }
    });
    
    if (hasErrors) {
        console.error('\n❌ File validation errors found - aborting build');
        process.exit(1);
    }
    
    // Check for expected modules (DOM Discovery only)
    if (buildType === 'DOM_DISCOVERY' && config.EXPECTED_MODULES) {
        console.log('\n🔍 Validating expected modules for target architecture:');
        
        const foundModules = discoveredFiles.map(f => f.filename);
        const missingModules = config.EXPECTED_MODULES.filter(expected => 
            !foundModules.includes(expected)
        );
        
        if (missingModules.length > 0) {
            console.error('❌ Missing required modules for target architecture:');
            missingModules.forEach(module => {
                console.error(`   🚫 ${module}`);
            });
            console.error('\n💡 The target architecture requires all 10 modules for complete functionality');
            process.exit(1);
        } else {
            console.log('✅ All required modules found for target architecture');
        }
    }
    
    return discoveredFiles;
}

function applyExclusionFilter(files, config, buildType) {
    console.log(`\n🚫 Applying exclusion filter...`);
    
    const excludeList = config.FILES_TO_EXCLUDE || [];
    
    if (excludeList.length === 0) {
        console.log(`   ✅ No exclusions - all ${files.length} files will be included`);
        return files;
    }
    
    console.log(`   📋 Exclusion list (${excludeList.length} entries):`);
    excludeList.forEach(excludeFile => {
        if (excludeFile.trim() && !excludeFile.trim().startsWith('//')) {
            console.log(`      🚫 ${excludeFile}`);
        }
    });
    
    const filteredFiles = files.filter(fileInfo => {
        const isExcluded = excludeList.some(excludeFile => {
            const trimmed = excludeFile.trim();
            return trimmed && !trimmed.startsWith('//') && trimmed === fileInfo.filename;
        });
        
        if (isExcluded) {
            console.log(`   🚫 Excluded: ${fileInfo.filename}`);
            return false;
        } else {
            console.log(`   ✅ Included: ${fileInfo.filename} (v${fileInfo.versionString})`);
            return true;
        }
    });
    
    if (filteredFiles.length === 0) {
        console.error(`❌ No files remain after exclusion filter!`);
        console.error('   Check FILES_TO_EXCLUDE configuration');
        process.exit(1);
    }
    
    return filteredFiles;
}

function sortFilesByVersion(files) {
    console.log(`\n📊 Sorting ${files.length} files by version number...`);
    
    files.sort((a, b) => compareVersions(a.versionArray, b.versionArray));
    
    console.log(`   📋 Final build order:`);
    files.forEach((fileInfo, index) => {
        console.log(`      ${index + 1}. ${fileInfo.filename} (v${fileInfo.versionString})`);
    });
    
    return files;
}

// ============================================================================
// VERSION PARSING AND COMPARISON
// ============================================================================

function parseVersionNumber(versionString) {
    return versionString.split('.').map(num => parseInt(num, 10));
}

function compareVersions(a, b) {
    const maxLength = Math.max(a.length, b.length);
    
    for (let i = 0; i < maxLength; i++) {
        const aVal = a[i] || 0;
        const bVal = b[i] || 0;
        
        if (aVal < bVal) return -1;
        if (aVal > bVal) return 1;
    }
    
    return 0;
}

// ============================================================================
// ENHANCED FILE BUILDING
// ============================================================================

function buildConcatenatedFile(files, buildInfo) {
    const { config, buildType, systemName } = buildInfo;
    
    console.log(`\n🔨 Building concatenated file...`);
    
    if (BUILD_CONFIG.options.SHOW_PROGRESS) {
        console.log(`📊 Processing ${files.length} modules...`);
    }
    
    let combinedContent = generateFileHeader(files, buildInfo);
    
    // Add debug verification if enabled
    if (BUILD_CONFIG.options.ADD_DEBUG_COMMENTS) {
        combinedContent += generateDebugVerification(buildType);
    }
    
    // Process each file
    files.forEach((item, index) => {
        if (BUILD_CONFIG.options.SHOW_PROGRESS) {
            console.log(`📝 Processing ${index + 1}/${files.length}: ${item.filename}`);
        }
        
        try {
            const content = fs.readFileSync(item.path, 'utf8');
            combinedContent += generateModuleSection(item, index, content, buildType);
            
            if (index < files.length - 1) {
                combinedContent += '\n\n';
            }
            
        } catch (error) {
            console.error(`❌ Error reading ${item.filename}:`, error.message);
            process.exit(1);
        }
    });
    
    // Add footer with verification and auto-start
    combinedContent += generateFileFooter(files, buildInfo);
    
    // Write the file
    const outputPath = path.join(config.TARGET_FOLDER, config.OUTPUT_FILE);
    
    try {
        fs.writeFileSync(outputPath, combinedContent, 'utf8');
        
        const stats = fs.statSync(outputPath);
        const sizeKB = Math.round(stats.size / 1024);
        
        console.log(`✅ Concatenated file created: ${config.OUTPUT_FILE}`);
        console.log(`📊 File size: ${sizeKB} KB (${stats.size} bytes)`);
        
        return outputPath;
        
    } catch (error) {
        console.error(`❌ Error writing concatenated file: ${error.message}`);
        process.exit(1);
    }
}

function buildIncludeFile(files, buildInfo) {
    const { config, buildType, systemName } = buildInfo;
    
    console.log(`\n📄 Building include-based file...`);
    
    let includeContent = generateIncludeHeader(files, buildInfo);
    
    // Add include directives
    includeContent += '// ============================================================================\n';
    includeContent += '// MODULE INCLUDES (Sequential Dependency Order)\n';
    includeContent += '// ============================================================================\n\n';
    
    files.forEach((item, index) => {
        includeContent += `// Module ${index + 1}: ${item.filename} (v${item.versionString})\n`;
        includeContent += `#include "${item.filename}"\n\n`;
    });
    
    // Add verification and auto-start
    includeContent += generateIncludeFooter(files, buildInfo);
    
    // Write the include file
    const includeFilePath = path.join(config.TARGET_FOLDER, config.INCLUDE_FILE);
    
    try {
        fs.writeFileSync(includeFilePath, includeContent, 'utf8');
        console.log(`✅ Include file created: ${config.INCLUDE_FILE}`);
        return includeFilePath;
        
    } catch (error) {
        console.error(`❌ Error writing include file: ${error.message}`);
        return null;
    }
}

// ============================================================================
// CONTENT GENERATION HELPERS
// ============================================================================

function generateFileHeader(files, buildInfo) {
    const { config, buildType, systemName } = buildInfo;
    
    let header = '//\n';
    header += `// ${systemName} - COMPLETE ASSEMBLED VERSION\n`;
    header += '// All Modules Combined (Enhanced Auto-Discovery Build)\n';
    
    if (buildType === 'DOM_DISCOVERY') {
        header += '// TARGET ARCHITECTURE: Sequential dependencies, perfect module isolation\n';
        header += '// CORE PURPOSE: Discover and visualize InDesign document DOM structure safely\n';
    }
    
    if (BUILD_CONFIG.options.ADD_TIMESTAMPS) {
        header += '// Generated: ' + new Date().toISOString() + '\n';
    }
    
    header += '//\n';
    header += `// This file contains all ${files.length} modules assembled in dependency order:\n`;
    
    files.forEach((item, index) => {
        header += `// Module ${index + 1} (v${item.versionString}): ${item.filename}\n`;
    });
    
    header += '//\n';
    header += generateUsageInstructions(buildType);
    header += '//\n';
    header += '// AUTO-DISCOVERY BUILD: All matching files included automatically\n';
    header += '// DO NOT EDIT THIS FILE DIRECTLY - Edit individual module files instead\n';
    header += '//\n\n';
    
    return header;
}

function generateUsageInstructions(buildType) {
    let instructions = '';
    
    if (buildType === 'DOM_DISCOVERY') {
        instructions += '// USAGE: Run this script in InDesign or ESTK for DOM structure discovery\n';
        instructions += '// FEATURES:\n';
        instructions += '// • Discovery-first approach - maps structure before accessing values\n';
        instructions += '// • Safety-first design - never crashes InDesign\n';
        instructions += '// • Sequential dependency architecture - Module N only depends on modules < N\n';
        instructions += '// • Interactive DOM tree visualization\n';
        instructions += '// • Property access code generation\n';
        instructions += '// • Before/after document comparison\n';
        instructions += '// • Multiple export formats (Text, JSON, CSV)\n';
        instructions += '// • Advanced analysis with JSON processing\n';
        instructions += '// • ES3 compatible across InDesign versions\n';
    } else if (buildType === 'CHUNKS') {
        instructions += '// USAGE: Run this script in InDesign or ESTK for complete analysis functionality\n';
        instructions += '// Includes progressive safety modes and comprehensive document comparison\n';
    } else {
        instructions += '// USAGE: Run this script in InDesign or ESTK for configurable document querying\n';
        instructions += '// All modules are self-contained and execute in proper order\n';
    }
    
    return instructions;
}

function generateDebugVerification(buildType) {
    const itemType = buildType === 'DOM_DISCOVERY' ? 'Module' : buildType === 'CHUNKS' ? 'Chunk' : 'Module';
    
    let debug = `// ${itemType} Loading Verification (Enhanced Auto-Discovery Build)\n`;
    debug += 'var MODULES_LOADED = [];\n';
    debug += 'var MODULE_LOAD_START = new Date().getTime();\n';
    debug += 'function verifyModuleLoad(itemName) {\n';
    debug += '    MODULES_LOADED.push(itemName);\n';
    debug += '    $.writeln("✓ ' + itemType + ' loaded: " + itemName);\n';
    debug += '}\n\n';
    
    return debug;
}

function generateModuleSection(item, index, content, buildType) {
    const itemType = buildType === 'DOM_DISCOVERY' ? 'MODULE' : buildType === 'CHUNKS' ? 'CHUNK' : 'MODULE';
    
    let section = '// ' + '='.repeat(78) + '\n';
    section += `// ${itemType} ${index + 1} (v${item.versionString}): ${item.filename.toUpperCase()}\n`;
    section += '// ' + '='.repeat(78) + '\n\n';
    
    // Add verification call if debug enabled
    if (BUILD_CONFIG.options.ADD_DEBUG_COMMENTS) {
        const itemName = item.filename.replace('.jsx', '');
        section += `verifyModuleLoad("${itemName}");\n\n`;
    }
    
    section += content;
    
    return section;
}

function generateFileFooter(files, buildInfo) {
    const { buildType, systemName } = buildInfo;
    
    if (!BUILD_CONFIG.options.ADD_DEBUG_COMMENTS) {
        return '';
    }
    
    const itemType = buildType === 'DOM_DISCOVERY' ? 'Module' : buildType === 'CHUNKS' ? 'Chunk' : 'Module';
    
    let footer = '\n\n// ' + '='.repeat(78) + '\n';
    footer += '// BUILD VERIFICATION AND AUTO-START\n';
    footer += '// ' + '='.repeat(78) + '\n\n';
    
    footer += 'var MODULE_LOAD_TIME = new Date().getTime() - MODULE_LOAD_START;\n';
    footer += `$.writeln("🎉 ${systemName} - All " + MODULES_LOADED.length + " ${itemType.toLowerCase()}s loaded successfully!");\n`;
    footer += `$.writeln("⚡ Total load time: " + MODULE_LOAD_TIME + "ms");\n`;
    footer += `if (MODULES_LOADED.length === ${files.length}) {\n`;
    footer += '    $.writeln("✅ Auto-discovery build verification passed - ready for use");\n';
    
    if (buildType === 'DOM_DISCOVERY' && BUILD_CONFIG.options.AUTO_START_DOM) {
        footer += '    \n';
        footer += '    // Auto-start DOM Discovery interface\n';
        footer += '    try {\n';
        footer += '        $.writeln("🚀 Starting DOM Discovery interface...");\n';
        footer += '        if (typeof showDOMVisualizer === "function") {\n';
        footer += '            showDOMVisualizer();\n';
        footer += '        } else if (typeof showDOMExplorer === "function") {\n';
        footer += '            showDOMExplorer();\n';
        footer += '        } else {\n';
        footer += '            $.writeln("⚠️  DOM interface functions not found - manual start required");\n';
        footer += '            $.writeln("💡 Try running showDOMVisualizer() or showDOMExplorer() manually");\n';
        footer += '        }\n';
        footer += '    } catch (exc) {\n';
        footer += '        $.writeln("❌ Auto-start failed: " + exc.message);\n';
        footer += '        $.writeln("💡 Try running showDOMVisualizer() manually");\n';
        footer += '    }\n';
    }
    
    footer += '} else {\n';
    footer += `    $.writeln("⚠️  ${itemType} count mismatch - check for loading errors");\n`;
    footer += '}\n';
    
    return footer;
}

function generateIncludeHeader(files, buildInfo) {
    const { systemName } = buildInfo;
    
    let header = '//\n';
    header += `// ${systemName} - INCLUDE-BASED LOADER\n`;
    header += '// This script loads all modules using #include directives\n';
    header += '// USAGE: Open this file in ExtendScript Toolkit and run it\n';
    header += '//\n';
    
    if (BUILD_CONFIG.options.ADD_TIMESTAMPS) {
        header += '// Generated: ' + new Date().toISOString() + '\n';
    }
    
    header += '// APPROACH: Uses ExtendScript #include for modular loading\n';
    header += '// SCOPE: All included files share the same global scope\n';
    header += '// BENEFITS: Easier debugging, individual file editing\n';
    header += '// DEPENDENCIES: Sequential order maintained for proper loading\n';
    header += '//\n\n';
    
    return header;
}

function generateIncludeFooter(files, buildInfo) {
    const { buildType } = buildInfo;
    
    let footer = '// ============================================================================\n';
    footer += '// VERIFICATION AND AUTO-START\n';
    footer += '// ============================================================================\n\n';
    
    footer += `$.writeln("🎉 All ${files.length} modules loaded via #include!");\n`;
    footer += '$.writeln("📁 Include-based loading complete");\n';
    
    if (buildType === 'DOM_DISCOVERY' && BUILD_CONFIG.options.AUTO_START_DOM) {
        footer += '\n// Auto-start DOM Discovery interface\n';
        footer += 'try {\n';
        footer += '    if (typeof showDOMVisualizer === "function") {\n';
        footer += '        $.writeln("🚀 Starting DOM Discovery interface...");\n';
        footer += '        showDOMVisualizer();\n';
        footer += '    } else if (typeof showDOMExplorer === "function") {\n';
        footer += '        showDOMExplorer();\n';
        footer += '    } else {\n';
        footer += '        $.writeln("💡 Use showDOMVisualizer() to open the interface");\n';
        footer += '    }\n';
        footer += '} catch (exc) {\n';
        footer += '    $.writeln("❌ Auto-start failed: " + exc.message);\n';
        footer += '}\n';
    }
    
    return footer;
}

// ============================================================================
// ENHANCED REPORTING AND INSTRUCTIONS
// ============================================================================

function showBuildSummary(concatenatedPath, includePath, files, buildInfo) {
    const { config, systemName } = buildInfo;
    
    console.log('\n🎉 Enhanced Auto-Discovery Build Complete!');
    console.log('='.repeat(50));
    
    console.log('\n📁 Generated Files:');
    console.log(`✅ CONCATENATED: ${path.basename(concatenatedPath)}`);
    if (includePath) {
        console.log(`✅ INCLUDE-BASED: ${path.basename(includePath)}`);
    }
    
    console.log('\n📊 Build Statistics:');
    console.log(`• System: ${systemName}`);
    console.log(`• Modules processed: ${files.length}`);
    console.log(`• Source folder: ${config.TARGET_FOLDER}`);
    
    const versions = files.map(f => f.versionString);
    const uniqueVersions = [...new Set(versions)];
    console.log(`• Module versions: ${uniqueVersions.join(', ')}`);
    
    const excludeCount = config.FILES_TO_EXCLUDE?.filter(f => f.trim() && !f.trim().startsWith('//')).length || 0;
    if (excludeCount > 0) {
        console.log(`• Files excluded: ${excludeCount}`);
    }
    
    console.log('\n🚀 Usage Instructions:');
    console.log('='.repeat(20));
    
    console.log('\nOPTION 1 - Concatenated (Recommended):');
    console.log('  1. Open InDesign or ExtendScript Toolkit');
    console.log(`  2. Run: ${config.OUTPUT_FILE}`);
    console.log('  3. Everything loads in one script');
    if (BUILD_CONFIG.options.AUTO_START_DOM && buildInfo.buildType === 'DOM_DISCOVERY') {
        console.log('  4. DOM interface opens automatically');
    }
    
    console.log('\nOPTION 2 - Include-based (Development):');
    console.log(`  1. Open: ${config.INCLUDE_FILE} in ExtendScript Toolkit`);
    console.log('  2. Run it (automatically loads all individual files)');
    console.log('  3. Easier to debug individual modules');
    
    console.log('\n🔧 Key Features:');
    console.log('• ✅ Both approaches create IDENTICAL global scope');
    console.log('• ✅ Sequential dependency validation');
    console.log('• ✅ Enhanced error handling and progress reporting');
    console.log('• ✅ Auto-discovery of all matching files');
    console.log('• ✅ Comprehensive build verification');
    
    if (buildInfo.buildType === 'DOM_DISCOVERY') {
        console.log('\n🎯 DOM Discovery v2.1 Features:');
        console.log('• Perfect sequential dependency architecture');
        console.log('• Object reference tracking and deduplication');
        console.log('• Before/after document comparison');
        console.log('• Multiple export formats with analysis');
        console.log('• Advanced JSON post-processing');
        console.log('• Deep DOM mapping with performance optimization');
    }
}

function showConfigurationHelp() {
    console.log('\n📖 Configuration Help:');
    console.log('='.repeat(22));
    
    console.log('\nBUILD MODE SELECTION:');
    console.log('Edit BUILD_MODES at the top of this script:');
    console.log('• OLD_CHUNKS: true/false - Legacy chunk system');
    console.log('• NEW_MODULES: true/false - v3.0 modular system');
    console.log('• DOM_DISCOVERY: true/false - v2.1 target architecture');
    console.log('⚠️  Set exactly ONE to true, others to false');
    
    console.log('\nFOLDER SETUP:');
    console.log('For DOM Discovery v2.1:');
    console.log('1. Create folder: DocDomV2.1/');
    console.log('2. Place these 10 modules:');
    
    if (BUILD_MODES.DOM_DISCOVERY) {
        BUILD_CONFIG.domDiscovery.EXPECTED_MODULES.forEach((module, index) => {
            console.log(`   ${index + 1}. ${module}`);
        });
    }
    
    console.log('\nADVANCED OPTIONS:');
    console.log('Edit BUILD_CONFIG.options:');
    console.log('• ADD_DEBUG_COMMENTS: Include verification code');
    console.log('• AUTO_START_DOM: Auto-open DOM interface');
    console.log('• GENERATE_BOTH_FORMATS: Create both concatenated and include files');
    console.log('• SHOW_PROGRESS: Display detailed build progress');
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function main() {
    console.log('🔧 Enhanced InDesign Auto-Discovery Builder v3.0');
    console.log('================================================');
    
    // Allow command line override of target folder
    if (process.argv[2]) {
        console.log(`📁 Target folder override: ${process.argv[2]}`);
        // Apply to current config after mode selection
    }
    
    // Validate and select build mode
    const buildInfo = validateAndSelectBuildMode();
    
    // Apply command line override if provided
    if (process.argv[2]) {
        buildInfo.config.TARGET_FOLDER = process.argv[2];
    }
    
    console.log(`\n🎯 Selected: ${buildInfo.systemName}`);
    
    // Discover and validate files
    const discoveredFiles = discoverAndValidateFiles(buildInfo);
    
    // Apply exclusion filter
    const filteredFiles = applyExclusionFilter(discoveredFiles, buildInfo.config, buildInfo.buildType);
    
    // Sort by version
    const sortedFiles = sortFilesByVersion(filteredFiles);
    
    // Build concatenated file
    const concatenatedPath = buildConcatenatedFile(sortedFiles, buildInfo);
    
    // Build include file (if enabled)
    let includePath = null;
    if (BUILD_CONFIG.options.GENERATE_BOTH_FORMATS) {
        includePath = buildIncludeFile(sortedFiles, buildInfo);
    }
    
    // Show summary and help
    showBuildSummary(concatenatedPath, includePath, sortedFiles, buildInfo);
    showConfigurationHelp();
}

// ============================================================================
// SCRIPT EXECUTION
// ============================================================================

if (require.main === module) {
    try {
        main();
    } catch (error) {
        console.error('\n❌ FATAL ERROR:', error.message);
        console.error('\n🔧 Check your configuration and try again');
        process.exit(1);
    }
}