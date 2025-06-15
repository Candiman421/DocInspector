#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// ============================================================================
// BUILD MODE SELECTION - Comment/uncomment ONE of these lines
// ============================================================================

//const BUILD_OLD_CHUNKS = true;   // Build original chunk-based system
const BUILD_NEW_MODULES = true; // Build new modular system

// ============================================================================
// CONFIGURATION 
// ============================================================================

const BUILD_CONFIG = {
    // OLD CHUNK SYSTEM CONFIG
    chunks: {
        TARGET_FOLDER: './scripts',
        OUTPUT_FILE: 'InDesignDocInspectorAndComparer_ChunkBuilt.jsx',
        PATTERN: /^InDesignDocInspectorAndComparer_Chunk_([0-9]+(?:\.[0-9]+)*)_.*\.jsx$/,
        FILES_TO_INCLUDE: [
            'InDesignDocInspectorAndComparer_Chunk_1_ConfigAndUtils.jsx',
            'InDesignDocInspectorAndComparer_Chunk_2.0_EmergencyAnalysis.jsx',
            'InDesignDocInspectorAndComparer_Chunk_2.1_MinimalAnalysis.jsx',
            'InDesignDocInspectorAndComparer_Chunk_2.2_StandardAnalysis.jsx',
            'InDesignDocInspectorAndComparer_Chunk_2.3_AdvancedAnalysis.jsx',
            'InDesignDocInspectorAndComparer_Chunk_3_ComparisonFunctions.jsx',
            'InDesignDocInspectorAndComparer_Chunk_4_ReportGeneration.jsx',
            'InDesignDocInspectorAndComparer_Chunk_5_MainInterfaceEntry.jsx',
            
            // Comment out chunks you don't want:
            // 'InDesignDocInspectorAndComparer_Chunk_6_ExperimentalFeatures.jsx',
        ]
    },
    
    // NEW MODULE SYSTEM CONFIG  
    modules: {
        TARGET_FOLDER: './Modules',
        OUTPUT_FILE: 'InDesignQueryTool_v3.0_Complete.jsx',
        PATTERN: /^Module_([0-9]+\.[0-9]+)_.*\.jsx$/,
        FILES_TO_INCLUDE: [
            'Module_1.0_ConfigAndSafety.jsx',
            'Module_2.0_DocumentAnalysisAndTreeBuilder.jsx', 
            'Module_3.0_UIPanelAndControls.jsx',
            'Module_4.0_ExportAndResultsDisplay.jsx',
            'Module_5.0_MainEntryPoint.jsx',
            
            // Comment out modules you don't want:
            // 'Module_6.0_ExperimentalFeatures.jsx',
            // 'Module_7.0_DebugMode.jsx',
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

console.log(`🔧 InDesign ${BUILD_TYPE} Builder v2.0`);
console.log('================================');
console.log(`📂 Target folder: ${CURRENT_CONFIG.TARGET_FOLDER}`);
console.log(`📄 Output file: ${CURRENT_CONFIG.OUTPUT_FILE}`);
console.log(`🔨 Build type: ${BUILD_TYPE} System`);

function parseConfiguredFiles() {
    console.log(`\n📋 Processing configured ${BUILD_TYPE.toLowerCase()} list...`);
    
    const configuredFiles = [];
    
    CURRENT_CONFIG.FILES_TO_INCLUDE.forEach((filename, index) => {
        // Skip empty lines and comments
        const trimmed = filename.trim();
        if (!trimmed || trimmed.startsWith('//')) {
            console.log(`⏭️  Skipped: ${trimmed || '(empty line)'}`);
            return;
        }
        
        // Validate file matches pattern
        const match = trimmed.match(CURRENT_CONFIG.PATTERN);
        if (!match) {
            const expectedPattern = isChunkBuild ? 
                'InDesignDocInspectorAndComparer_Chunk_X.X_Name.jsx' : 
                'Module_X.X_Name.jsx';
            console.error(`❌ Invalid filename format: ${trimmed}`);
            console.error(`   Expected pattern: ${expectedPattern}`);
            process.exit(1);
        }
        
        const versionString = match[1]; // e.g., "1.0", "2.1"
        const fullPath = path.join(CURRENT_CONFIG.TARGET_FOLDER, trimmed);
        
        // Check if file exists
        if (BUILD_CONFIG.VALIDATE_FILES && !fs.existsSync(fullPath)) {
            console.error(`❌ File not found: ${fullPath}`);
            process.exit(1);
        }
        
        configuredFiles.push({
            filename: trimmed,
            path: fullPath,
            versionString: versionString,
            versionArray: parseVersionNumber(versionString),
            order: index // Preserve configuration order
        });
        
        console.log(`✅ Included: ${trimmed} (Version ${versionString})`);
    });
    
    if (configuredFiles.length === 0) {
        console.error(`❌ No ${BUILD_TYPE.toLowerCase()} configured for build!`);
        console.error('   Uncomment files in FILES_TO_INCLUDE array');
        process.exit(1);
    }
    
    // Sort by version number, but preserve explicit order if versions are same
    configuredFiles.sort((a, b) => {
        const versionCompare = compareVersions(a.versionArray, b.versionArray);
        if (versionCompare !== 0) return versionCompare;
        return a.order - b.order; // Preserve configuration order for same versions
    });
    
    return configuredFiles;
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
        combinedContent += '// COMPLETE ASSEMBLED VERSION - All Chunks Combined\n';
        if (BUILD_CONFIG.ADD_TIMESTAMPS) {
            combinedContent += '// Generated: ' + new Date().toISOString() + '\n';
        }
        combinedContent += '// \n';
        combinedContent += '// This file contains all ' + files.length + ' chunks assembled in proper order:\n';
    } else {
        combinedContent += '//\n';
        combinedContent += '// InDesign Document Query Tool v3.0 - Complete Combined Build\n';
        combinedContent += '// Modular Architecture - All Modules Assembled\n';
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
    combinedContent += '// DO NOT EDIT THIS FILE DIRECTLY - Edit individual ' + (isChunkBuild ? 'chunk' : 'module') + ' files instead\n';
    combinedContent += '//\n\n';
    
    // Add verification code if debug enabled
    if (BUILD_CONFIG.ADD_DEBUG_COMMENTS) {
        const itemType = isChunkBuild ? 'Chunk' : 'Module';
        combinedContent += '// ' + itemType + ' Loading Verification\n';
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
        combinedContent += '// BUILD VERIFICATION\n';
        combinedContent += '// ' + '='.repeat(78) + '\n\n';
        combinedContent += '$.writeln("🎉 ' + systemName + ' - All " + ' + (isChunkBuild ? 'CHUNKS' : 'MODULES') + '_LOADED.length + " ' + itemType.toLowerCase() + 's loaded successfully!");\n';
        combinedContent += 'if (' + (isChunkBuild ? 'CHUNKS' : 'MODULES') + '_LOADED.length === ' + files.length + ') {\n';
        combinedContent += '    $.writeln("✅ Build verification passed - ready for use");\n';
        combinedContent += '} else {\n';
        combinedContent += '    $.writeln("⚠️  ' + itemType + ' count mismatch - check for loading errors");\n';
        combinedContent += '}\n';
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
    
    // Check for files in target folder
    const filesInFolder = fs.readdirSync(CURRENT_CONFIG.TARGET_FOLDER)
        .filter(f => f.match(CURRENT_CONFIG.PATTERN));
    
    console.log(`📁 Found ${filesInFolder.length} ${BUILD_TYPE.toLowerCase()} files in target folder:`);
    filesInFolder.forEach(file => {
        console.log(`   ${file}`);
    });
    
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
    console.log('FILE INCLUSION/EXCLUSION:');
    console.log('- To exclude files: Add // before filename in FILES_TO_INCLUDE');
    console.log('- To include files: Remove // from beginning of line');
    console.log('');
    if (isChunkBuild) {
        console.log('CHUNK SYSTEM:');
        console.log('- Pattern: InDesignDocInspectorAndComparer_Chunk_X.X_Name.jsx');
        console.log('- Output: InDesignDocInspectorAndComparer_ChunkBuilt.jsx');
        console.log('- Location: ./scripts/ folder');
    } else {
        console.log('MODULE SYSTEM:');
        console.log('- Pattern: Module_X.X_Name.jsx');
        console.log('- Output: InDesignQueryTool_v3.0_Complete.jsx');
        console.log('- Location: ./Modules/ folder');
    }
    console.log('');
    console.log('File order: Files are sorted by version number, then config order');
}

function showSystemInfo() {
    console.log('\n📋 Build System Information:');
    console.log('============================');
    console.log('DUAL SYSTEM SUPPORT:');
    console.log('This script can build either:');
    console.log('1. OLD CHUNK SYSTEM (v2.1-ESTK)');
    console.log('   - Original comprehensive inspector with progressive modes');
    console.log('   - Files: InDesignDocInspectorAndComparer_Chunk_*.jsx');
    console.log('   - Output: InDesignDocInspectorAndComparer_ChunkBuilt.jsx');
    console.log('');
    console.log('2. NEW MODULE SYSTEM (v3.0)');
    console.log('   - Lightweight configurable query tool');
    console.log('   - Files: Module_*.jsx');
    console.log('   - Output: InDesignQueryTool_v3.0_Complete.jsx');
    console.log('');
    console.log('SCRIPT LOCATION:');
    console.log('Save this script (build-scripts.js) in your project root:');
    console.log('');
    console.log('PROJECT_ROOT/');
    console.log('├── build-scripts.js  (this file)');
    console.log('├── scripts/          (old chunk files)');
    console.log('│   ├── InDesignDocInspectorAndComparer_Chunk_1_ConfigAndUtils.jsx');
    console.log('│   ├── InDesignDocInspectorAndComparer_Chunk_2.0_EmergencyAnalysis.jsx');
    console.log('│   └── ...');
    console.log('└── Modules/          (new module files)');
    console.log('    ├── Module_1.0_ConfigAndSafety.jsx');
    console.log('    ├── Module_2.0_DocumentAnalysisAndTreeBuilder.jsx');
    console.log('    └── ...');
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
    
    // Parse configured files
    const files = parseConfiguredFiles();
    
    // Build combined file
    const outputPath = buildCombinedFile(files, CURRENT_CONFIG.OUTPUT_FILE);
    
    console.log('\n🎉 Build complete!');
    console.log('\nGenerated file:');
    console.log(`📄 ${outputPath}`);
    console.log('\nNext steps:');
    console.log('1. Test the generated file in InDesign');
    console.log('2. Copy to InDesign Scripts folder if needed');
    console.log('3. Run from ESTK or InDesign Scripts panel');
    
    if (BUILD_CONFIG.ADD_DEBUG_COMMENTS) {
        console.log('\n💡 Debug mode enabled - check console for loading verification');
    }
    
    showConfigInstructions();
}

// Run the script
if (require.main === module) {
    main();
}