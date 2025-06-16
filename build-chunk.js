#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// ============================================================================
// BUILD MODE SELECTION - Comment/uncomment ONE of these lines
// ============================================================================

//const BUILD_OLD_CHUNKS = true;   // Build original chunk-based system
//const BUILD_NEW_MODULES = true; // Build new modular system  
const BUILD_DOM_DISCOVERY = true; // Build new DOM Discovery system

// ============================================================================
// CONFIGURATION 
// ============================================================================

const BUILD_CONFIG = {
    // OLD CHUNK SYSTEM CONFIG
    chunks: {
        TARGET_FOLDER: './scripts',
        OUTPUT_FILE: 'InDesignDocInspectorAndComparer_ChunkBuilt.jsx',
        PATTERN: /^InDesignDocInspectorAndComparer_Chunk_([0-9]+(?:\.[0-9]+)*)_.*\.jsx$/,
        FILES_TO_EXCLUDE: [
            'InDesignDocInspectorAndComparer_ChunkBuilt.jsx'
        ]
    },
    
    // NEW MODULE SYSTEM CONFIG  
    modules: {
        TARGET_FOLDER: './Modules',
        OUTPUT_FILE: 'InDesignQueryTool_v3.0_Complete.jsx',
        PATTERN: /^Module_([0-9]+\.[0-9]+)_.*\.jsx$/,
        FILES_TO_EXCLUDE: [
            'InDesignQueryTool_v3.0_Complete.jsx'
        ]
    },
    
    // DOM DISCOVERY SYSTEM CONFIG
    domDiscovery: {
        TARGET_FOLDER: './DocDom',
        OUTPUT_FILE: 'InDesign_DOM_Discovery_Builder_COMPLETE.jsx',
        PATTERN: /^([0-9]+\.[0-9]+)_.*\.jsx$/,
        FILES_TO_EXCLUDE: [
            'InDesign_DOM_Discovery_Builder_COMPLETE.jsx',
            'doc-dom-loader.jsx',  // Exclude the main loader (it's for includes approach)
            '9_DEMO_Test_DOM_Discovery.jsx'  // Exclude demo script
        ]
    },
    
    // Build options (apply to all systems)
    ADD_DEBUG_COMMENTS: true,
    ADD_TIMESTAMPS: true,
    VALIDATE_FILES: true
};

// Determine which system to build
const isChunkBuild = typeof BUILD_OLD_CHUNKS !== 'undefined' && BUILD_OLD_CHUNKS;
const isModuleBuild = typeof BUILD_NEW_MODULES !== 'undefined' && BUILD_NEW_MODULES;
const isDOMBuild = typeof BUILD_DOM_DISCOVERY !== 'undefined' && BUILD_DOM_DISCOVERY;

const buildCount = [isChunkBuild, isModuleBuild, isDOMBuild].filter(Boolean).length;

if (buildCount > 1) {
    console.error('❌ Error: Multiple build types enabled!');
    console.error('   Comment out all but one: BUILD_OLD_CHUNKS, BUILD_NEW_MODULES, or BUILD_DOM_DISCOVERY');
    process.exit(1);
}

if (buildCount === 0) {
    console.error('❌ Error: No build type enabled!');
    console.error('   Uncomment one: BUILD_OLD_CHUNKS, BUILD_NEW_MODULES, or BUILD_DOM_DISCOVERY');
    process.exit(1);
}

const CURRENT_CONFIG = isChunkBuild ? BUILD_CONFIG.chunks : 
                      isModuleBuild ? BUILD_CONFIG.modules : 
                      BUILD_CONFIG.domDiscovery;

const BUILD_TYPE = isChunkBuild ? 'CHUNKS' : 
                  isModuleBuild ? 'MODULES' : 
                  'DOM_DISCOVERY';

console.log(`🔧 InDesign ${BUILD_TYPE} Builder v2.2 (Auto-Discovery)`);
console.log('===============================================');
console.log(`📂 Target folder: ${CURRENT_CONFIG.TARGET_FOLDER}`);
console.log(`📄 Output file: ${CURRENT_CONFIG.OUTPUT_FILE}`);
console.log(`🔨 Build type: ${BUILD_TYPE.replace('_', ' ')} System`);
console.log(`🔍 Auto-discovery: All matching files included by default`);

function discoverAndFilterFiles() {
    console.log(`\n🔍 Discovering ${BUILD_TYPE.toLowerCase()} files in target folder...`);
    
    // Check if target folder exists
    if (!fs.existsSync(CURRENT_CONFIG.TARGET_FOLDER)) {
        console.error(`❌ Target folder does not exist: ${CURRENT_CONFIG.TARGET_FOLDER}`);
        process.exit(1);
    }
    
    // Get all files in target folder that match the pattern
    const allFiles = fs.readdirSync(CURRENT_CONFIG.TARGET_FOLDER);
    const matchingFiles = allFiles.filter(filename => {
        return filename.match(CURRENT_CONFIG.PATTERN);
    });
    
    console.log(`📁 Found ${matchingFiles.length} ${BUILD_TYPE.toLowerCase()} files matching pattern:`);
    
    if (matchingFiles.length === 0) {
        console.error(`❌ No ${BUILD_TYPE.toLowerCase()} files found matching pattern in: ${CURRENT_CONFIG.TARGET_FOLDER}`);
        const expectedPattern = isChunkBuild ? 
            'InDesignDocInspectorAndComparer_Chunk_X.X_Name.jsx' : 
            isModuleBuild ? 'Module_X.X_Name.jsx' :
            'X.X_name.jsx (e.g., 1.0_safe-foundation.jsx)';
        console.error(`   Expected pattern: ${expectedPattern}`);
        process.exit(1);
    }
    
    // Process each matching file
    const discoveredFiles = [];
    matchingFiles.forEach(filename => {
        const match = filename.match(CURRENT_CONFIG.PATTERN);
        if (match) {
            const versionString = match[1]; // e.g., "1.0", "2.1"
            const fullPath = path.join(CURRENT_CONFIG.TARGET_FOLDER, filename);
            
            // Validate file exists and is readable
            if (BUILD_CONFIG.VALIDATE_FILES) {
                try {
                    fs.accessSync(fullPath, fs.constants.R_OK);
                } catch (error) {
                    console.error(`❌ Cannot read file: ${fullPath}`);
                    console.error(`   Error: ${error.message}`);
                    process.exit(1);
                }
            }
            
            discoveredFiles.push({
                filename: filename,
                path: fullPath,
                versionString: versionString,
                versionArray: parseVersionNumber(versionString)
            });
            
            console.log(`   📄 ${filename} (Version ${versionString})`);
        }
    });
    
    // Apply exclusion filter
    console.log(`\n🚫 Applying exclusion filter...`);
    const excludeList = CURRENT_CONFIG.FILES_TO_EXCLUDE || [];
    
    if (excludeList.length === 0) {
        console.log(`   ✅ No files excluded - all ${discoveredFiles.length} files will be included`);
    } else {
        console.log(`   📋 Exclusion list contains ${excludeList.length} entries:`);
        excludeList.forEach(excludeFile => {
            const trimmed = excludeFile.trim();
            if (trimmed && !trimmed.startsWith('//')) {
                console.log(`      🚫 ${trimmed}`);
            }
        });
    }
    
    const filteredFiles = discoveredFiles.filter(fileInfo => {
        // Check if this file is in the exclusion list
        const isExcluded = excludeList.some(excludeFile => {
            const trimmed = excludeFile.trim();
            // Skip empty lines and comments
            if (!trimmed || trimmed.startsWith('//')) {
                return false;
            }
            return trimmed === fileInfo.filename;
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
        console.error(`❌ No ${BUILD_TYPE.toLowerCase()} files remain after exclusion filter!`);
        console.error('   Check your FILES_TO_EXCLUDE configuration');
        process.exit(1);
    }
    
    // Sort by version number
    console.log(`\n📊 Sorting ${filteredFiles.length} files by version number...`);
    filteredFiles.sort((a, b) => {
        return compareVersions(a.versionArray, b.versionArray);
    });
    
    console.log(`   📋 Final build order:`);
    filteredFiles.forEach((fileInfo, index) => {
        console.log(`      ${index + 1}. ${fileInfo.filename} (v${fileInfo.versionString})`);
    });
    
    return filteredFiles;
}

// Parse version string into array for proper comparison
function parseVersionNumber(versionString) {
    return versionString.split('.').map(num => parseInt(num, 10));
}

// Compare version arrays (e.g., [1,0] vs [2,0] vs [1,1])
function compareVersions(a, b) {
    const maxLength = Math.max(a.length, b.length);
    
    for (let i = 0; i < maxLength; i++) {
        const aVal = a[i] || 0; // Treat missing parts as 0
        const bVal = b[i] || 0;
        
        if (aVal < bVal) return -1;
        if (aVal > bVal) return 1;
    }
    
    return 0; // Equal
}

function buildCombinedFile(files, outputPath) {
    console.log(`\n🔨 Building combined ${BUILD_TYPE.toLowerCase()} file...`);
    
    let combinedContent = '';
    
    // Add header comment based on build type
    if (isChunkBuild) {
        combinedContent += '//\n';
        combinedContent += '// Enhanced InDesign Document Inspector & Comparison Tool v2.1-ESTK\n';
        combinedContent += '// COMPLETE ASSEMBLED VERSION - All Chunks Combined (Auto-Discovery Build)\n';
    } else if (isModuleBuild) {
        combinedContent += '//\n';
        combinedContent += '// InDesign Document Query Tool v3.0 - Complete Combined Build\n';
        combinedContent += '// Modular Architecture - All Modules Assembled (Auto-Discovery Build)\n';
    } else {
        combinedContent += '//\n';
        combinedContent += '// InDesign DOM Discovery Builder v2.0 - COMPLETE ASSEMBLED VERSION\n';
        combinedContent += '// All DOM Discovery Modules Combined (Auto-Discovery Build)\n';
        combinedContent += '// CORE PURPOSE: Discover and visualize InDesign document DOM structure safely\n';
    }
    
    if (BUILD_CONFIG.ADD_TIMESTAMPS) {
        combinedContent += '// Generated: ' + new Date().toISOString() + '\n';
    }
    combinedContent += '// \n';
    combinedContent += '// This file contains all ' + files.length + ' modules assembled in proper order:\n';
    
    files.forEach((item, index) => {
        const itemType = isChunkBuild ? 'Chunk' : isDOMBuild ? 'Module' : 'Module';
        combinedContent += '// ' + itemType + ' ' + (index + 1) + ' (v' + item.versionString + '): ' + item.filename + '\n';
    });
    
    combinedContent += '//\n';
    if (isChunkBuild) {
        combinedContent += '// USAGE: Run this script in InDesign or ESTK for complete analysis functionality\n';
        combinedContent += '// Includes progressive safety modes and comprehensive document comparison\n';
    } else if (isModuleBuild) {
        combinedContent += '// USAGE: Run this script in InDesign or ESTK for configurable document querying\n';
        combinedContent += '// All modules are self-contained and execute in proper order\n';
    } else {
        combinedContent += '// USAGE: Run this script in InDesign or ESTK for DOM structure discovery\n';
        combinedContent += '// Automatically shows DOM Explorer interface after loading\n';
        combinedContent += '// \n';
        combinedContent += '// FEATURES:\n';
        combinedContent += '// • Discovery-first approach - maps structure before accessing values\n';
        combinedContent += '// • Safety-first design - never crashes InDesign\n';
        combinedContent += '// • Interactive DOM tree visualization\n';
        combinedContent += '// • Property access code generation\n';
        combinedContent += '// • Multiple export formats (Text, JSON, CSV)\n';
        combinedContent += '// • ES3 compatible across InDesign versions\n';
    }
    combinedContent += '//\n';
    combinedContent += '// AUTO-DISCOVERY BUILD: All matching files included automatically\n';
    combinedContent += '// To exclude files, add them to FILES_TO_EXCLUDE in build script\n';
    combinedContent += '//\n';
    combinedContent += '// DO NOT EDIT THIS FILE DIRECTLY - Edit individual module files instead\n';
    combinedContent += '//\n\n';
    
    // Add verification code if debug enabled
    if (BUILD_CONFIG.ADD_DEBUG_COMMENTS) {
        const itemType = isDOMBuild ? 'Module' : isChunkBuild ? 'Chunk' : 'Module';
        combinedContent += '// ' + itemType + ' Loading Verification (Auto-Discovery Build)\n';
        combinedContent += 'var MODULES_LOADED = [];\n';
        combinedContent += 'function verifyModuleLoad(itemName) {\n';
        combinedContent += '    MODULES_LOADED.push(itemName);\n';
        combinedContent += '    $.writeln("✓ ' + itemType + ' loaded: " + itemName);\n';
        combinedContent += '}\n\n';
    }
    
    // Process each file
    files.forEach((item, index) => {
        const itemType = isDOMBuild ? 'MODULE' : isChunkBuild ? 'CHUNK' : 'MODULE';
        console.log(`📝 Processing: ${item.filename} (Version ${item.versionString})`);
        
        try {
            const content = fs.readFileSync(item.path, 'utf8');
            
            // Add separator comment
            combinedContent += '// ' + '='.repeat(78) + '\n';
            combinedContent += '// ' + itemType + ' ' + (index + 1) + ' (v' + item.versionString + '): ' + item.filename.toUpperCase() + '\n';
            combinedContent += '// ' + '='.repeat(78) + '\n\n';
            
            // Add verification call if debug enabled
            if (BUILD_CONFIG.ADD_DEBUG_COMMENTS) {
                const itemName = item.filename.replace('.jsx', '');
                combinedContent += `verifyModuleLoad("${itemName}");\n\n`;
            }
            
            // Add the content
            combinedContent += content;
            
            // Add spacing between items (except after last)
            if (index < files.length - 1) {
                combinedContent += '\n\n';
            }
            
        } catch (error) {
            console.error(`❌ Error reading ${item.filename}:`, error.message);
            process.exit(1);
        }
    });
    
    // Add footer with verification and auto-start for DOM Discovery
    if (BUILD_CONFIG.ADD_DEBUG_COMMENTS) {
        const itemType = isDOMBuild ? 'Module' : isChunkBuild ? 'Chunk' : 'Module';
        const systemName = isDOMBuild ? 'DOM Discovery Builder v2.0' : 
                          isChunkBuild ? 'InDesign Inspector v2.1-ESTK' : 
                          'InDesign Query Tool v3.0';
        combinedContent += '\n\n// ' + '='.repeat(78) + '\n';
        combinedContent += '// BUILD VERIFICATION AND AUTO-START\n';
        combinedContent += '// ' + '='.repeat(78) + '\n\n';
        combinedContent += '$.writeln("🎉 ' + systemName + ' - All " + MODULES_LOADED.length + " ' + itemType.toLowerCase() + 's loaded successfully!");\n';
        combinedContent += 'if (MODULES_LOADED.length === ' + files.length + ') {\n';
        combinedContent += '    $.writeln("✅ Auto-discovery build verification passed - ready for use");\n';
        if (isDOMBuild) {
            combinedContent += '    \n';
            combinedContent += '    // Auto-start DOM Discovery interface\n';
            combinedContent += '    try {\n';
            combinedContent += '        $.writeln("🚀 Starting DOM Discovery interface...");\n';
            combinedContent += '        if (typeof showDOMExplorer === "function") {\n';
            combinedContent += '            showDOMExplorer();\n';
            combinedContent += '        } else {\n';
            combinedContent += '            $.writeln("⚠️  showDOMExplorer function not found - manual start required");\n';
            combinedContent += '        }\n';
            combinedContent += '    } catch (exc) {\n';
            combinedContent += '        $.writeln("❌ Auto-start failed: " + exc.message);\n';
            combinedContent += '        $.writeln("💡 Try running showDOMExplorer() manually");\n';
            combinedContent += '    }\n';
        }
        combinedContent += '} else {\n';
        combinedContent += '    $.writeln("⚠️  ' + itemType + ' count mismatch - check for loading errors");\n';
        combinedContent += '}\n';
        combinedContent += '$.writeln("📁 Source folder: ' + CURRENT_CONFIG.TARGET_FOLDER + '");\n';
        combinedContent += '$.writeln("🔍 Auto-discovery: ' + files.length + ' files included, ' + (CURRENT_CONFIG.FILES_TO_EXCLUDE?.length || 0) + ' excluded");\n';
    }
    
    // Write the combined file to the same directory as source files
    const outputInSourceDir = path.join(CURRENT_CONFIG.TARGET_FOLDER, CURRENT_CONFIG.OUTPUT_FILE);
    
    try {
        fs.writeFileSync(outputInSourceDir, combinedContent, 'utf8');
        console.log(`✅ Successfully created: ${outputInSourceDir}`);
        
        // Show file stats
        const stats = fs.statSync(outputInSourceDir);
        const sizeKB = Math.round(stats.size / 1024);
        console.log(`📊 File size: ${sizeKB} KB (${stats.size} bytes)`);
        console.log(`📊 Total ${BUILD_TYPE.toLowerCase()}: ${files.length}`);
        
        // Show version summary
        const versions = files.map(f => f.versionString);
        const uniqueVersions = [...new Set(versions)];
        console.log(`📊 Module versions: ${uniqueVersions.join(', ')}`);
        
        // Show exclusions if any
        const excludeCount = CURRENT_CONFIG.FILES_TO_EXCLUDE?.filter(f => f.trim() && !f.trim().startsWith('//')).length || 0;
        if (excludeCount > 0) {
            console.log(`📊 Files excluded: ${excludeCount}`);
        }
        
        return outputInSourceDir;
        
    } catch (error) {
        console.error(`❌ Error writing ${outputInSourceDir}:`, error.message);
        process.exit(1);
    }
}

function validateBuildConfig() {
    console.log('\n🔍 Validating build configuration...');
    
    // Check if target folder exists
    if (!fs.existsSync(CURRENT_CONFIG.TARGET_FOLDER)) {
        console.error(`❌ Target folder does not exist: ${CURRENT_CONFIG.TARGET_FOLDER}`);
        console.error(`   Update TARGET_FOLDER in BUILD_CONFIG.${BUILD_TYPE.toLowerCase()}`);
        process.exit(1);
    }
    
    // Show pattern being used
    console.log(`🔍 Using pattern: ${CURRENT_CONFIG.PATTERN}`);
    
    // Check for files in target folder
    const filesInFolder = fs.readdirSync(CURRENT_CONFIG.TARGET_FOLDER)
        .filter(f => f.match(CURRENT_CONFIG.PATTERN));
    
    console.log(`📁 Found ${filesInFolder.length} potential ${BUILD_TYPE.toLowerCase()} files in target folder`);
    
    // List discovered files for verification
    if (filesInFolder.length > 0) {
        console.log('   Discovered files:');
        filesInFolder.forEach(f => console.log(`     📄 ${f}`));
    }
    
    // Check if output file would overwrite an existing important file
    const outputPath = path.join(CURRENT_CONFIG.TARGET_FOLDER, CURRENT_CONFIG.OUTPUT_FILE);
    if (fs.existsSync(outputPath)) {
        console.log(`⚠️  Output file already exists: ${CURRENT_CONFIG.OUTPUT_FILE}`);
        console.log('   It will be overwritten');
    }
    
    console.log('✅ Build configuration validated');
    return true;
}

function generateIncludeScript(files) {
    console.log('\n📄 Generating include-based script...');
    
    const includeFileName = isDOMBuild ? 'DOM_Discovery_Builder_INCLUDES.jsx' :
                           isChunkBuild ? 'InDesignInspector_INCLUDES.jsx' :
                           'InDesignQuery_INCLUDES.jsx';
    
    let includeContent = '';
    
    // Header
    if (isDOMBuild) {
        includeContent += '//\n';
        includeContent += '// InDesign DOM Discovery Builder v2.0 - INCLUDE-BASED LOADER\n';
        includeContent += '// This script loads all DOM Discovery modules using #include directives\n';
        includeContent += '// USAGE: Open this file in ExtendScript Toolkit and run it\n';
    } else if (isChunkBuild) {
        includeContent += '//\n';
        includeContent += '// InDesign Inspector v2.1 - INCLUDE-BASED LOADER\n';
        includeContent += '// This script loads all chunks using #include directives\n';
    } else {
        includeContent += '//\n';
        includeContent += '// InDesign Query Tool v3.0 - INCLUDE-BASED LOADER\n';
        includeContent += '// This script loads all modules using #include directives\n';
    }
    
    includeContent += '//\n';
    if (BUILD_CONFIG.ADD_TIMESTAMPS) {
        includeContent += '// Generated: ' + new Date().toISOString() + '\n';
    }
    includeContent += '// APPROACH: Uses ExtendScript #include for modular loading\n';
    includeContent += '// SCOPE: All included files share the same global scope\n';
    includeContent += '// BENEFITS: Easier debugging, individual file editing\n';
    includeContent += '//\n\n';
    
    // Add include directives
    includeContent += '// ============================================================================\n';
    includeContent += '// MODULE INCLUDES (Auto-Generated)\n';
    includeContent += '// ============================================================================\n\n';
    
    files.forEach((item, index) => {
        includeContent += `// Module ${index + 1}: ${item.filename} (v${item.versionString})\n`;
        includeContent += `#include "${item.filename}"\n\n`;
    });
    
    // Add verification and auto-start
    includeContent += '// ============================================================================\n';
    includeContent += '// VERIFICATION AND AUTO-START\n';
    includeContent += '// ============================================================================\n\n';
    
    includeContent += '$.writeln("🎉 All ' + files.length + ' modules loaded via #include!");\n';
    includeContent += '$.writeln("📁 Include-based loading complete");\n';
    
    if (isDOMBuild) {
        includeContent += '\n// Auto-start DOM Discovery interface\n';
        includeContent += 'try {\n';
        includeContent += '    if (typeof showDOMExplorer === "function") {\n';
        includeContent += '        $.writeln("🚀 Starting DOM Discovery interface...");\n';
        includeContent += '        showDOMExplorer();\n';
        includeContent += '    } else {\n';
        includeContent += '        $.writeln("💡 Use showDOMExplorer() to open the interface");\n';
        includeContent += '    }\n';
        includeContent += '} catch (exc) {\n';
        includeContent += '    $.writeln("❌ Auto-start failed: " + exc.message);\n';
        includeContent += '}\n';
    }
    
    // Write include script
    const includeScriptPath = path.join(CURRENT_CONFIG.TARGET_FOLDER, includeFileName);
    try {
        fs.writeFileSync(includeScriptPath, includeContent, 'utf8');
        console.log(`✅ Include script created: ${includeScriptPath}`);
        return includeScriptPath;
    } catch (error) {
        console.error(`❌ Error writing include script: ${error.message}`);
        return null;
    }
}

function showConfigInstructions() {
    console.log('\n📖 Configuration Instructions:');
    console.log('==============================');
    console.log('BUILD MODE SELECTION (at top of script):');
    console.log('- To build OLD CHUNKS: Uncomment "const BUILD_OLD_CHUNKS = true;"');
    console.log('- To build NEW MODULES: Uncomment "const BUILD_NEW_MODULES = true;"');
    console.log('- To build DOM DISCOVERY: Uncomment "const BUILD_DOM_DISCOVERY = true;"');
    console.log('- Only ONE can be enabled at a time');
    console.log('');
    
    if (isDOMBuild) {
        console.log('DOM DISCOVERY SYSTEM:');
        console.log('- Pattern: X.X_name.jsx (e.g., 1.0_safe-foundation.jsx)');
        console.log('- Output: InDesign_DOM_Discovery_Builder_COMPLETE.jsx');
        console.log('- Location: ./DocDom/ folder');
        console.log('- Exclusions: Add to BUILD_CONFIG.domDiscovery.FILES_TO_EXCLUDE');
        console.log('');
        console.log('CURRENT EXCLUSIONS:');
        CURRENT_CONFIG.FILES_TO_EXCLUDE.forEach(file => {
            console.log(`  🚫 ${file}`);
        });
    }
    
    console.log('');
    console.log('TWO APPROACHES GENERATED:');
    console.log('1. CONCATENATED FILE: All modules in one file (easier to share)');
    console.log('2. INCLUDE-BASED: Separate files with #include loader (easier to debug)');
    console.log('');
    console.log('SCOPE BEHAVIOR:');
    console.log('✅ Both approaches share the SAME global scope');
    console.log('✅ All functions and variables are accessible across modules');
    console.log('✅ No scope differences between concatenation and #include');
}

function showSystemInfo() {
    console.log('\n📋 Enhanced Auto-Discovery Build System:');
    console.log('========================================');
    console.log('TRIPLE SYSTEM SUPPORT:');
    console.log('');
    console.log('1. OLD CHUNK SYSTEM (v2.1-ESTK)');
    console.log('   - Pattern: InDesignDocInspectorAndComparer_Chunk_*.jsx');
    console.log('   - Output: InDesignDocInspectorAndComparer_ChunkBuilt.jsx');
    console.log('');
    console.log('2. NEW MODULE SYSTEM (v3.0)');
    console.log('   - Pattern: Module_*.jsx');
    console.log('   - Output: InDesignQueryTool_v3.0_Complete.jsx');
    console.log('');
    console.log('3. DOM DISCOVERY SYSTEM (v2.0) ← NEW!');
    console.log('   - Pattern: X.X_name.jsx (e.g., 1.0_safe-foundation.jsx)');
    console.log('   - Output: InDesign_DOM_Discovery_Builder_COMPLETE.jsx');
    console.log('   - Include Version: DOM_Discovery_Builder_INCLUDES.jsx');
    console.log('');
    console.log('DUAL OUTPUT APPROACH:');
    console.log('✅ Concatenated file: Single file with all modules combined');
    console.log('✅ Include-based file: Loader script with #include directives');
    console.log('✅ Both approaches maintain identical global scope');
}

// Main execution
function main() {
    console.log('');
    
    // Show system info first
    showSystemInfo();
    
    // Allow command line override of target folder
    if (process.argv[2]) {
        CURRENT_CONFIG.TARGET_FOLDER = process.argv[2];
        console.log(`📁 Target folder overridden: ${CURRENT_CONFIG.TARGET_FOLDER}`);
    }
    
    // Validate configuration
    validateBuildConfig();
    
    // Discover and filter files
    const files = discoverAndFilterFiles();
    
    // Build combined file
    const outputPath = buildCombinedFile(files, CURRENT_CONFIG.OUTPUT_FILE);
    
    // Generate include-based script as well
    const includeScriptPath = generateIncludeScript(files);
    
    console.log('\n🎉 Auto-Discovery Build Complete!');
    console.log('\nGenerated files:');
    console.log(`📄 CONCATENATED: ${outputPath}`);
    if (includeScriptPath) {
        console.log(`📄 INCLUDE-BASED: ${includeScriptPath}`);
    }
    
    console.log('\nUsage Options:');
    console.log('OPTION 1 - Concatenated (Your preferred method):');
    console.log('  1. Open the COMPLETE.jsx file in ExtendScript Toolkit');
    console.log('  2. Run it directly (F5 or play button)');
    console.log('  3. Everything loads in one script');
    console.log('');
    console.log('OPTION 2 - Include-based (Alternative):');
    console.log('  1. Open the INCLUDES.jsx file in ExtendScript Toolkit');
    console.log('  2. Run it (automatically loads all individual files)');
    console.log('  3. Easier to debug individual modules');
    console.log('');
    console.log('🔍 SCOPE BEHAVIOR:');
    console.log('✅ Both approaches create IDENTICAL global scope');
    console.log('✅ All functions accessible regardless of method');
    console.log('✅ No scope isolation between modules');
    
    showConfigInstructions();
}

// Run the script
if (require.main === module) {
    main();
}