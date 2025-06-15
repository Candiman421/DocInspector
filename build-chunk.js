#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// ============================================================================
// BUILD MODE SELECTION - Comment/uncomment ONE of these lines
// ============================================================================

const BUILD_OLD_CHUNKS = true;   // Build original chunk-based system
//const BUILD_NEW_MODULES = true; // Build new modular system

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
            // Uncomment any chunks you want to exclude from the build:
            'InDesignDocInspectorAndComparer_ChunkBuilt.jsx'
        ]
    },
    
    // NEW MODULE SYSTEM CONFIG  
    modules: {
        TARGET_FOLDER: './Modules',
        OUTPUT_FILE: 'InDesignQueryTool_v3.0_Complete.jsx',
        PATTERN: /^Module_([0-9]+\.[0-9]+)_.*\.jsx$/,
        FILES_TO_EXCLUDE: [
            // Uncomment any modules you want to exclude from the build:
            'InDesignQueryTool_v3.0_Complete.jsx'
        ]
    },
    
    // Build options (apply to both systems)
    ADD_DEBUG_COMMENTS: true,
    ADD_TIMESTAMPS: true,
    VALIDATE_FILES: true
};

// Determine which system to build
const isChunkBuild = typeof BUILD_OLD_CHUNKS !== 'undefined' && BUILD_OLD_CHUNKS;
const isModuleBuild = typeof BUILD_NEW_MODULES !== 'undefined' && BUILD_NEW_MODULES;

if (isChunkBuild && isModuleBuild) {
    console.error('❌ Error: Both BUILD_OLD_CHUNKS and BUILD_NEW_MODULES are enabled!');
    console.error('   Comment out one of them at the top of this script');
    process.exit(1);
}

if (!isChunkBuild && !isModuleBuild) {
    console.error('❌ Error: Neither BUILD_OLD_CHUNKS nor BUILD_NEW_MODULES is enabled!');
    console.error('   Uncomment one of them at the top of this script');
    process.exit(1);
}

const CURRENT_CONFIG = isChunkBuild ? BUILD_CONFIG.chunks : BUILD_CONFIG.modules;
const BUILD_TYPE = isChunkBuild ? 'CHUNKS' : 'MODULES';

console.log(`🔧 InDesign ${BUILD_TYPE} Builder v2.1 (Auto-Discovery)`);
console.log('===============================================');
console.log(`📂 Target folder: ${CURRENT_CONFIG.TARGET_FOLDER}`);
console.log(`📄 Output file: ${CURRENT_CONFIG.OUTPUT_FILE}`);
console.log(`🔨 Build type: ${BUILD_TYPE} System`);
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
            'Module_X.X_Name.jsx';
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
        if (BUILD_CONFIG.ADD_TIMESTAMPS) {
            combinedContent += '// Generated: ' + new Date().toISOString() + '\n';
        }
        combinedContent += '// \n';
        combinedContent += '// This file contains all ' + files.length + ' chunks assembled in proper order:\n';
    } else {
        combinedContent += '//\n';
        combinedContent += '// InDesign Document Query Tool v3.0 - Complete Combined Build\n';
        combinedContent += '// Modular Architecture - All Modules Assembled (Auto-Discovery Build)\n';
        if (BUILD_CONFIG.ADD_TIMESTAMPS) {
            combinedContent += '// Generated: ' + new Date().toISOString() + '\n';
        }
        combinedContent += '// \n';
        combinedContent += '// This file contains ' + files.length + ' modules assembled in order:\n';
    }
    
    files.forEach((item, index) => {
        const itemType = isChunkBuild ? 'Chunk' : 'Module';
        combinedContent += '// ' + itemType + ' ' + (index + 1) + ' (v' + item.versionString + '): ' + item.filename + '\n';
    });
    
    combinedContent += '//\n';
    if (isChunkBuild) {
        combinedContent += '// USAGE: Run this script in InDesign or ESTK for complete analysis functionality\n';
        combinedContent += '// Includes progressive safety modes and comprehensive document comparison\n';
    } else {
        combinedContent += '// USAGE: Run this script in InDesign or ESTK for configurable document querying\n';
        combinedContent += '// All modules are self-contained and execute in proper order\n';
    }
    combinedContent += '//\n';
    combinedContent += '// AUTO-DISCOVERY BUILD: All matching files included automatically\n';
    combinedContent += '// To exclude files, add them to FILES_TO_EXCLUDE in build script\n';
    combinedContent += '//\n';
    combinedContent += '// DO NOT EDIT THIS FILE DIRECTLY - Edit individual ' + (isChunkBuild ? 'chunk' : 'module') + ' files instead\n';
    combinedContent += '//\n\n';
    
    // Add verification code if debug enabled
    if (BUILD_CONFIG.ADD_DEBUG_COMMENTS) {
        const itemType = isChunkBuild ? 'Chunk' : 'Module';
        combinedContent += '// ' + itemType + ' Loading Verification (Auto-Discovery Build)\n';
        combinedContent += 'var ' + (isChunkBuild ? 'CHUNKS' : 'MODULES') + '_LOADED = [];\n';
        combinedContent += 'function verify' + itemType + 'Load(itemName) {\n';
        combinedContent += '    ' + (isChunkBuild ? 'CHUNKS' : 'MODULES') + '_LOADED.push(itemName);\n';
        combinedContent += '    $.writeln("✓ ' + itemType + ' loaded: " + itemName);\n';
        combinedContent += '}\n\n';
    }
    
    // Process each file
    files.forEach((item, index) => {
        const itemType = isChunkBuild ? 'CHUNK' : 'MODULE';
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
                combinedContent += `verify${isChunkBuild ? 'Chunk' : 'Module'}Load("${itemName}");\n\n`;
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
    
    // Add footer with verification
    if (BUILD_CONFIG.ADD_DEBUG_COMMENTS) {
        const itemType = isChunkBuild ? 'Chunk' : 'Module';
        const systemName = isChunkBuild ? 'InDesign Inspector v2.1-ESTK' : 'InDesign Query Tool v3.0';
        combinedContent += '\n\n// ' + '='.repeat(78) + '\n';
        combinedContent += '// BUILD VERIFICATION (AUTO-DISCOVERY)\n';
        combinedContent += '// ' + '='.repeat(78) + '\n\n';
        combinedContent += '$.writeln("🎉 ' + systemName + ' - All " + ' + (isChunkBuild ? 'CHUNKS' : 'MODULES') + '_LOADED.length + " ' + itemType.toLowerCase() + 's loaded successfully!");\n';
        combinedContent += 'if (' + (isChunkBuild ? 'CHUNKS' : 'MODULES') + '_LOADED.length === ' + files.length + ') {\n';
        combinedContent += '    $.writeln("✅ Auto-discovery build verification passed - ready for use");\n';
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
        console.log(`📊 ${isChunkBuild ? 'Chunk' : 'Module'} versions: ${uniqueVersions.join(', ')}`);
        
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
    
    // Check if output file would overwrite an existing important file
    const outputPath = path.join(CURRENT_CONFIG.TARGET_FOLDER, CURRENT_CONFIG.OUTPUT_FILE);
    if (fs.existsSync(outputPath)) {
        console.log(`⚠️  Output file already exists: ${CURRENT_CONFIG.OUTPUT_FILE}`);
        console.log('   It will be overwritten');
    }
    
    console.log('✅ Build configuration validated');
    return true;
}

function showConfigInstructions() {
    console.log('\n📖 Configuration Instructions:');
    console.log('==============================');
    console.log('BUILD MODE SELECTION (at top of script):');
    console.log('- To build OLD CHUNKS: Uncomment "const BUILD_OLD_CHUNKS = true;"');
    console.log('- To build NEW MODULES: Uncomment "const BUILD_NEW_MODULES = true;"');
    console.log('- Only ONE can be enabled at a time');
    console.log('');
    console.log('AUTO-DISCOVERY SYSTEM:');
    console.log('- All matching files in target folder are included by default');
    console.log('- Files are automatically sorted by version number');
    console.log('- To exclude files: Add filename to FILES_TO_EXCLUDE array');
    console.log('- To re-include files: Remove filename from FILES_TO_EXCLUDE or comment out');
    console.log('');
    if (isChunkBuild) {
        console.log('CHUNK SYSTEM:');
        console.log('- Pattern: InDesignDocInspectorAndComparer_Chunk_X.X_Name.jsx');
        console.log('- Output: InDesignDocInspectorAndComparer_ChunkBuilt.jsx');
        console.log('- Location: ./scripts/ folder');
        console.log('- Exclusions: Add to BUILD_CONFIG.chunks.FILES_TO_EXCLUDE');
    } else {
        console.log('MODULE SYSTEM:');
        console.log('- Pattern: Module_X.X_Name.jsx');
        console.log('- Output: InDesignQueryTool_v3.0_Complete.jsx');
        console.log('- Location: ./Modules/ folder');
        console.log('- Exclusions: Add to BUILD_CONFIG.modules.FILES_TO_EXCLUDE');
    }
    console.log('');
    console.log('EXAMPLE EXCLUSION:');
    console.log('FILES_TO_EXCLUDE: [');
    console.log('    "Module_6.0_ExperimentalFeatures.jsx",  // Exclude this file');
    console.log('    // "Module_7.0_DebugMode.jsx",          // Commented = included');
    console.log(']');
}

function showSystemInfo() {
    console.log('\n📋 Auto-Discovery Build System Information:');
    console.log('===========================================');
    console.log('DUAL SYSTEM SUPPORT WITH AUTO-DISCOVERY:');
    console.log('This script automatically discovers and builds either:');
    console.log('');
    console.log('1. OLD CHUNK SYSTEM (v2.1-ESTK)');
    console.log('   - Original comprehensive inspector with progressive modes');
    console.log('   - Auto-discovers: InDesignDocInspectorAndComparer_Chunk_*.jsx');
    console.log('   - Output: InDesignDocInspectorAndComparer_ChunkBuilt.jsx');
    console.log('');
    console.log('2. NEW MODULE SYSTEM (v3.0)');
    console.log('   - Lightweight configurable query tool');
    console.log('   - Auto-discovers: Module_*.jsx');
    console.log('   - Output: InDesignQueryTool_v3.0_Complete.jsx');
    console.log('');
    console.log('AUTO-DISCOVERY FEATURES:');
    console.log('✅ Automatically finds all matching files in target folder');
    console.log('✅ Sorts files by version number (1.0, 1.1, 2.0, etc.)');
    console.log('✅ Includes all files by default - no manual list maintenance');
    console.log('✅ Simple exclusion system for files you don\'t want');
    console.log('✅ Validates file accessibility before build');
    console.log('');
    console.log('SCRIPT LOCATION:');
    console.log('Save this script (build-scripts.js) in your project root:');
    console.log('');
    console.log('PROJECT_ROOT/');
    console.log('├── build-scripts.js  (this file)');
    console.log('├── scripts/          (old chunk files - auto-discovered)');
    console.log('│   ├── InDesignDocInspectorAndComparer_Chunk_1_ConfigAndUtils.jsx');
    console.log('│   ├── InDesignDocInspectorAndComparer_Chunk_2.0_EmergencyAnalysis.jsx');
    console.log('│   └── ... (all matching files included automatically)');
    console.log('└── Modules/          (new module files - auto-discovered)');
    console.log('    ├── Module_1.0_ConfigAndSafety.jsx');
    console.log('    ├── Module_2.0_DocumentAnalysisAndTreeBuilder.jsx');
    console.log('    └── ... (all matching files included automatically)');
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
    
    // Allow command line override of output file
    if (process.argv[3]) {
        CURRENT_CONFIG.OUTPUT_FILE = process.argv[3];
        console.log(`📄 Output file overridden: ${CURRENT_CONFIG.OUTPUT_FILE}`);
    }
    
    // Validate configuration
    validateBuildConfig();
    
    // Discover and filter files
    const files = discoverAndFilterFiles();
    
    // Build combined file
    const outputPath = buildCombinedFile(files, CURRENT_CONFIG.OUTPUT_FILE);
    
    console.log('\n🎉 Auto-Discovery Build Complete!');
    console.log('\nGenerated file:');
    console.log(`📄 ${outputPath}`);
    console.log('\nNext steps:');
    console.log('1. Test the generated file in InDesign');
    console.log('2. Copy to InDesign Scripts folder if needed');
    console.log('3. Run from ESTK or InDesign Scripts panel');
    
    if (BUILD_CONFIG.ADD_DEBUG_COMMENTS) {
        console.log('\n💡 Debug mode enabled - check console for loading verification');
    }
    
    console.log('\n🔍 Auto-Discovery Benefits:');
    console.log('- No need to manually maintain file lists');
    console.log('- New files are automatically included');
    console.log('- Version-based sorting ensures proper load order');
    console.log('- Simple exclusion system for unwanted files');
    
    showConfigInstructions();
}

// Run the script
if (require.main === module) {
    main();
}