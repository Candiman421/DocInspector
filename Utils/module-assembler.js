#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// ============================================================================
// DOCDOM MODULE ASSEMBLER CONFIGURATION
// ============================================================================

const ASSEMBLER_CONFIG = {
    // File pattern matching - supports multi-level decimal notation
    FILE_PATTERN: /^(\d+(\.\d+){0,3})_.*\.jsx?$/,
    
    // Folders to exclude from scanning
    EXCLUDED_FOLDERS: [
        'node_modules', '.git', '.vscode', 'Utils', 'UtilsOutput',
        'build', 'dist', 'temp', '.tmp'
    ],
    
    // Files to exclude from assembly
    EXCLUDED_FILES: [
        /.*_ASSEMBLED_.*\.jsx$/,
        /.*_INCLUDES_.*\.jsx$/,
        /^~analysis-.*\.yaml$/,
        /\.bak$/, /\.old$/, /\.backup$/,
        /^test.*\.jsx?$/, /^demo.*\.jsx?$/
    ],
    
    // Assembly options
    options: {
        ADD_DEBUG_COMMENTS: true,
        ADD_TIMESTAMPS: true,
        VALIDATE_FILES: true,
        SHOW_PROGRESS: true,
        AUTO_START_INTERFACE: true,
        GENERATE_BOTH_FORMATS: true
    }
};

// ============================================================================
// PROJECT DISCOVERY AND FOLDER SCANNING
// ============================================================================

/**
 * Discover all folders in project containing decimal-notation modules
 * @returns {Array} Array of folder info objects
 */
function discoverProjectFolders() {
    console.log('🔍 Scanning project for module folders...');
    console.log('='.repeat(50));
    
    const projectRoot = path.resolve(__dirname, '..');  // Go up from Utils/ to project root
    const foldersWithModules = [];
    
    function scanDirectory(dirPath, relativePath = '') {
        try {
            const entries = fs.readdirSync(dirPath, { withFileTypes: true });
            
            // Check current directory for module files
            const moduleFiles = entries
                .filter(entry => entry.isFile() && ASSEMBLER_CONFIG.FILE_PATTERN.test(entry.name))
                .filter(entry => !isFileExcluded(entry.name));
            
            if (moduleFiles.length > 0) {
                const folderName = relativePath || 'Root';
                foldersWithModules.push({
                    name: folderName,
                    path: dirPath,
                    relativePath: relativePath,
                    moduleFiles: moduleFiles.map(entry => entry.name),
                    moduleCount: moduleFiles.length
                });
                
                console.log(`📁 Found ${moduleFiles.length} modules in: ${folderName}`);
                moduleFiles.forEach(file => {
                    console.log(`   📄 ${file.name}`);
                });
            }
            
            // Recursively scan subdirectories
            entries
                .filter(entry => entry.isDirectory())
                .filter(entry => !ASSEMBLER_CONFIG.EXCLUDED_FOLDERS.includes(entry.name))
                .filter(entry => !entry.name.startsWith('.'))
                .forEach(entry => {
                    const subPath = path.join(dirPath, entry.name);
                    const subRelative = relativePath ? `${relativePath}/${entry.name}` : entry.name;
                    scanDirectory(subPath, subRelative);
                });
                
        } catch (error) {
            console.error(`❌ Error scanning ${dirPath}: ${error.message}`);
        }
    }
    
    scanDirectory(projectRoot);
    
    console.log(`\n🎯 Discovery complete: ${foldersWithModules.length} folders with modules found`);
    return foldersWithModules;
}

/**
 * Check if file should be excluded from assembly
 * @param {string} filename - File name to check
 * @returns {boolean} True if file should be excluded
 */
function isFileExcluded(filename) {
    return ASSEMBLER_CONFIG.EXCLUDED_FILES.some(pattern => {
        if (pattern instanceof RegExp) {
            return pattern.test(filename);
        }
        return filename === pattern;
    });
}

// ============================================================================
// MODULE FILE PROCESSING
// ============================================================================

/**
 * Process modules in a specific folder
 * @param {Object} folderInfo - Folder information object
 * @returns {Object} Processing result
 */
function processModulesInFolder(folderInfo) {
    console.log(`\n🔨 Processing modules in: ${folderInfo.name}`);
    console.log('='.repeat(40));
    
    try {
        // Discover and validate module files
        const moduleData = discoverModuleFiles(folderInfo);
        
        // Sort modules by version for proper dependency order
        const sortedModules = sortModulesByVersion(moduleData);
        
        // Generate timestamp for output files
        const timestamp = generateTimestamp();
        
        // Build both output formats
        const assembledFile = buildAssembledFile(sortedModules, folderInfo, timestamp);
        const includesFile = buildIncludesFile(sortedModules, folderInfo, timestamp);
        
        return {
            success: true,
            folderName: folderInfo.name,
            moduleCount: sortedModules.length,
            assembledFile: assembledFile,
            includesFile: includesFile,
            modules: sortedModules.map(m => m.filename)
        };
        
    } catch (error) {
        console.error(`❌ Error processing ${folderInfo.name}: ${error.message}`);
        return {
            success: false,
            error: error.message,
            folderName: folderInfo.name
        };
    }
}

/**
 * Discover and validate module files in folder
 * @param {Object} folderInfo - Folder information
 * @returns {Array} Array of module data objects
 */
function discoverModuleFiles(folderInfo) {
    console.log(`📋 Validating ${folderInfo.moduleCount} module files...`);
    
    const moduleData = [];
    
    folderInfo.moduleFiles.forEach(filename => {
        const fullPath = path.join(folderInfo.path, filename);
        
        try {
            // Extract version information
            const match = filename.match(ASSEMBLER_CONFIG.FILE_PATTERN);
            if (!match) {
                throw new Error(`File pattern mismatch: ${filename}`);
            }
            
            const versionString = match[1];
            const versionArray = parseVersionNumber(versionString);
            
            // Validate file accessibility
            if (ASSEMBLER_CONFIG.options.VALIDATE_FILES) {
                fs.accessSync(fullPath, fs.constants.R_OK);
                const stats = fs.statSync(fullPath);
                const sizeKB = Math.round(stats.size / 1024);
                
                console.log(`   ✅ ${filename} (v${versionString}, ${sizeKB}KB)`);
            }
            
            moduleData.push({
                filename: filename,
                path: fullPath,
                versionString: versionString,
                versionArray: versionArray,
                size: fs.statSync(fullPath).size
            });
            
        } catch (error) {
            console.error(`   ❌ ${filename} - ${error.message}`);
            throw new Error(`Module validation failed: ${filename}`);
        }
    });
    
    return moduleData;
}

/**
 * Sort modules by version number for proper dependency order
 * @param {Array} modules - Array of module data objects
 * @returns {Array} Sorted modules
 */
function sortModulesByVersion(modules) {
    console.log(`📊 Sorting ${modules.length} modules by version...`);
    
    modules.sort((a, b) => compareVersions(a.versionArray, b.versionArray));
    
    console.log('   📋 Final assembly order:');
    modules.forEach((module, index) => {
        console.log(`      ${index + 1}. ${module.filename} (v${module.versionString})`);
    });
    
    return modules;
}

/**
 * Parse version number string into array of numbers
 * @param {string} versionString - Version string like "1.2.1"
 * @returns {Array} Array of version numbers
 */
function parseVersionNumber(versionString) {
    return versionString.split('.').map(num => parseInt(num, 10));
}

/**
 * Compare two version arrays for sorting
 * @param {Array} a - First version array
 * @param {Array} b - Second version array
 * @returns {number} Comparison result
 */
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
// ASSEMBLED FILE GENERATION
// ============================================================================

/**
 * Build concatenated assembled file
 * @param {Array} modules - Sorted module data
 * @param {Object} folderInfo - Folder information
 * @param {string} timestamp - Generation timestamp
 * @returns {string} Output file path
 */
function buildAssembledFile(modules, folderInfo, timestamp) {
    console.log(`🔨 Building assembled file...`);
    
    const outputFilename = `${folderInfo.name}_ASSEMBLED_${timestamp}.jsx`;
    const outputPath = path.join(folderInfo.path, outputFilename);
    
    let content = generateAssembledHeader(modules, folderInfo, timestamp);
    
    // Add debug verification if enabled
    if (ASSEMBLER_CONFIG.options.ADD_DEBUG_COMMENTS) {
        content += generateDebugVerification();
    }
    
    // Process each module
    modules.forEach((module, index) => {
        if (ASSEMBLER_CONFIG.options.SHOW_PROGRESS) {
            console.log(`   📝 Processing ${index + 1}/${modules.length}: ${module.filename}`);
        }
        
        try {
            const moduleContent = fs.readFileSync(module.path, 'utf8');
            content += generateModuleSection(module, index, moduleContent);
            
            if (index < modules.length - 1) {
                content += '\n\n';
            }
            
        } catch (error) {
            throw new Error(`Failed to read ${module.filename}: ${error.message}`);
        }
    });
    
    // Add footer with verification and auto-start
    content += generateAssembledFooter(modules, folderInfo);
    
    // Write the assembled file
    try {
        fs.writeFileSync(outputPath, content, 'utf8');
        
        const stats = fs.statSync(outputPath);
        const sizeKB = Math.round(stats.size / 1024);
        
        console.log(`✅ Assembled file created: ${outputFilename}`);
        console.log(`📊 File size: ${sizeKB} KB (${stats.size} bytes)`);
        
        return outputFilename;
        
    } catch (error) {
        throw new Error(`Failed to write assembled file: ${error.message}`);
    }
}

/**
 * Build includes-based file
 * @param {Array} modules - Sorted module data
 * @param {Object} folderInfo - Folder information
 * @param {string} timestamp - Generation timestamp
 * @returns {string} Output file path
 */
function buildIncludesFile(modules, folderInfo, timestamp) {
    console.log(`📄 Building includes file...`);
    
    const outputFilename = `${folderInfo.name}_INCLUDES_${timestamp}.jsx`;
    const outputPath = path.join(folderInfo.path, outputFilename);
    
    let content = generateIncludesHeader(modules, folderInfo, timestamp);
    
    // Add include directives
    content += '// ============================================================================\n';
    content += '// MODULE INCLUDES (Sequential Dependency Order)\n';
    content += '// ============================================================================\n\n';
    
    modules.forEach((module, index) => {
        content += `// Module ${index + 1}: ${module.filename} (v${module.versionString})\n`;
        content += `#include "${module.filename}"\n\n`;
    });
    
    // Add verification and auto-start
    content += generateIncludesFooter(modules, folderInfo);
    
    // Write the includes file
    try {
        fs.writeFileSync(outputPath, content, 'utf8');
        console.log(`✅ Includes file created: ${outputFilename}`);
        return outputFilename;
        
    } catch (error) {
        console.error(`⚠️  Warning: Failed to write includes file: ${error.message}`);
        return null;
    }
}

// ============================================================================
// CONTENT GENERATION HELPERS
// ============================================================================

/**
 * Generate header for assembled file
 * @param {Array} modules - Module data
 * @param {Object} folderInfo - Folder information
 * @param {string} timestamp - Generation timestamp
 * @returns {string} Header content
 */
function generateAssembledHeader(modules, folderInfo, timestamp) {
    let header = '//\n';
    header += `// ${folderInfo.name.toUpperCase()} - COMPLETE ASSEMBLED VERSION\n`;
    header += '// DocDom - Document Analysis & Discovery System\n';
    header += '// TARGET ARCHITECTURE: Sequential dependencies, perfect module isolation\n';
    header += '// CORE PURPOSE: Discover and analyze document DOM structure safely\n';
    
    if (ASSEMBLER_CONFIG.options.ADD_TIMESTAMPS) {
        header += `// Generated: ${new Date().toISOString()}\n`;
        header += `// Build ID: ${timestamp}\n`;
    }
    
    header += '//\n';
    header += `// This file contains all ${modules.length} modules assembled in dependency order:\n`;
    
    modules.forEach((module, index) => {
        header += `// Module ${index + 1} (v${module.versionString}): ${module.filename}\n`;
    });
    
    header += '//\n';
    header += generateUsageInstructions();
    header += '//\n';
    header += '// AUTO-DISCOVERY BUILD: All matching files included automatically\n';
    header += '// DO NOT EDIT THIS FILE DIRECTLY - Edit individual module files instead\n';
    header += '//\n\n';
    
    return header;
}

/**
 * Generate usage instructions
 * @returns {string} Usage instructions
 */
function generateUsageInstructions() {
    let instructions = '';
    instructions += '// USAGE: Run this script in target application or ExtendScript environment\n';
    instructions += '// FEATURES:\n';
    instructions += '// • Discovery-first approach - maps structure before accessing values\n';
    instructions += '// • Safety-first design - never crashes host application\n';
    instructions += '// • Sequential dependency architecture - Module N only depends on modules < N\n';
    instructions += '// • Interactive DOM tree visualization\n';
    instructions += '// • Property access code generation\n';
    instructions += '// • Before/after document comparison\n';
    instructions += '// • Multiple export formats (Text, JSON, CSV)\n';
    instructions += '// • Advanced analysis with JSON processing\n';
    instructions += '// • Cross-platform compatibility for document analysis\n';
    
    return instructions;
}

/**
 * Generate debug verification code
 * @returns {string} Debug verification code
 */
function generateDebugVerification() {
    let debug = '// Module Loading Verification (Auto-Discovery Build)\n';
    debug += 'var MODULES_LOADED = [];\n';
    debug += 'var MODULE_LOAD_START = new Date().getTime();\n';
    debug += 'function verifyModuleLoad(moduleName) {\n';
    debug += '    MODULES_LOADED.push(moduleName);\n';
    debug += '    $.writeln("✓ Module loaded: " + moduleName);\n';
    debug += '}\n\n';
    
    return debug;
}

/**
 * Generate module section content
 * @param {Object} module - Module data
 * @param {number} index - Module index
 * @param {string} content - Module content
 * @returns {string} Module section
 */
function generateModuleSection(module, index, content) {
    let section = '// ' + '='.repeat(78) + '\n';
    section += `// MODULE ${index + 1} (v${module.versionString}): ${module.filename.toUpperCase()}\n`;
    section += '// ' + '='.repeat(78) + '\n\n';
    
    // Add verification call if debug enabled
    if (ASSEMBLER_CONFIG.options.ADD_DEBUG_COMMENTS) {
        const moduleName = module.filename.replace('.jsx', '');
        section += `verifyModuleLoad("${moduleName}");\n\n`;
    }
    
    section += content;
    
    return section;
}

/**
 * Generate footer for assembled file
 * @param {Array} modules - Module data
 * @param {Object} folderInfo - Folder information
 * @returns {string} Footer content
 */
function generateAssembledFooter(modules, folderInfo) {
    if (!ASSEMBLER_CONFIG.options.ADD_DEBUG_COMMENTS) {
        return '';
    }
    
    let footer = '\n\n// ' + '='.repeat(78) + '\n';
    footer += '// BUILD VERIFICATION AND AUTO-START\n';
    footer += '// ' + '='.repeat(78) + '\n\n';
    
    footer += 'var MODULE_LOAD_TIME = new Date().getTime() - MODULE_LOAD_START;\n';
    footer += `$.writeln("🎉 ${folderInfo.name} - All " + MODULES_LOADED.length + " modules loaded successfully!");\n`;
    footer += '$.writeln("⚡ Total load time: " + MODULE_LOAD_TIME + "ms");\n';
    footer += `if (MODULES_LOADED.length === ${modules.length}) {\n`;
    footer += '    $.writeln("✅ Auto-discovery build verification passed - ready for use");\n';
    
    if (ASSEMBLER_CONFIG.options.AUTO_START_INTERFACE) {
        footer += '    \n';
        footer += '    // Auto-start document analysis interface\n';
        footer += '    try {\n';
        footer += '        $.writeln("🚀 Starting document analysis interface...");\n';
        footer += '        if (typeof showAdvancedDOMInterface === "function") {\n';
        footer += '            showAdvancedDOMInterface();\n';
        footer += '        } else if (typeof showAdvancedUI === "function") {\n';
        footer += '            showAdvancedUI();\n';
        footer += '        } else if (typeof showDOMVisualizer === "function") {\n';
        footer += '            showDOMVisualizer();\n';
        footer += '        } else if (typeof showDocumentAnalyzer === "function") {\n';
        footer += '            showDocumentAnalyzer();\n';
        footer += '        } else if (typeof startAnalysis === "function") {\n';
        footer += '            startAnalysis();\n';
        footer += '        } else {\n';
        footer += '            $.writeln("⚠️  Document analysis interface functions not found - manual start required");\n';
        footer += '            $.writeln("💡 Try running showAdvancedUI() or showDocumentAnalyzer() manually");\n';
        footer += '        }\n';
        footer += '    } catch (exc) {\n';
        footer += '        $.writeln("❌ Auto-start failed: " + exc.message);\n';
        footer += '        $.writeln("💡 Try running available interface functions manually");\n';
        footer += '    }\n';
    }
    
    footer += '} else {\n';
    footer += '    $.writeln("⚠️  Module count mismatch - check for loading errors");\n';
    footer += '}\n';
    
    return footer;
}

/**
 * Generate header for includes file
 * @param {Array} modules - Module data
 * @param {Object} folderInfo - Folder information
 * @param {string} timestamp - Generation timestamp
 * @returns {string} Header content
 */
function generateIncludesHeader(modules, folderInfo, timestamp) {
    let header = '//\n';
    header += `// ${folderInfo.name.toUpperCase()} - INCLUDE-BASED LOADER\n`;
    header += '// DocDom - Document Analysis & Discovery System\n';
    header += '// This script loads all modules using #include directives\n';
    header += '// USAGE: Open this file in ExtendScript Toolkit and run it\n';
    header += '//\n';
    
    if (ASSEMBLER_CONFIG.options.ADD_TIMESTAMPS) {
        header += `// Generated: ${new Date().toISOString()}\n`;
        header += `// Build ID: ${timestamp}\n`;
    }
    
    header += '// APPROACH: Uses ExtendScript #include for modular loading\n';
    header += '// SCOPE: All included files share the same global scope\n';
    header += '// BENEFITS: Easier debugging, individual file editing\n';
    header += '// DEPENDENCIES: Sequential order maintained for proper loading\n';
    header += '//\n\n';
    
    return header;
}

/**
 * Generate footer for includes file
 * @param {Array} modules - Module data
 * @param {Object} folderInfo - Folder information
 * @returns {string} Footer content
 */
function generateIncludesFooter(modules, folderInfo) {
    let footer = '// ============================================================================\n';
    footer += '// VERIFICATION AND AUTO-START\n';
    footer += '// ============================================================================\n\n';
    
    footer += `$.writeln("🎉 All ${modules.length} modules loaded via #include!");\n`;
    footer += '$.writeln("📁 Include-based loading complete");\n';
    
    if (ASSEMBLER_CONFIG.options.AUTO_START_INTERFACE) {
        footer += '\n// Auto-start document analysis interface\n';
        footer += 'try {\n';
        footer += '    if (typeof showAdvancedDOMInterface === "function") {\n';
        footer += '        $.writeln("🚀 Starting Advanced DOM interface...");\n';
        footer += '        showAdvancedDOMInterface();\n';
        footer += '    } else if (typeof showAdvancedUI === "function") {\n';
        footer += '        showAdvancedUI();\n';
        footer += '    } else if (typeof showDOMVisualizer === "function") {\n';
        footer += '        showDOMVisualizer();\n';
        footer += '    } else if (typeof showDocumentAnalyzer === "function") {\n';
        footer += '        showDocumentAnalyzer();\n';
        footer += '    } else {\n';
        footer += '        $.writeln("💡 Use available interface functions to open the analyzer");\n';
        footer += '    }\n';
        footer += '} catch (exc) {\n';
        footer += '    $.writeln("❌ Auto-start failed: " + exc.message);\n';
        footer += '}\n';
    }
    
    return footer;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate timestamp for file naming
 * @returns {string} Timestamp string in format YYYYMMDD-HHMMSS
 */
function generateTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

// ============================================================================
// REPORTING AND SUMMARY
// ============================================================================

/**
 * Show build summary for all processed folders
 * @param {Array} results - Array of processing results
 */
function showBuildSummary(results) {
    console.log('\n🎉 Module Assembly Complete!');
    console.log('='.repeat(50));
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log('\n📊 Build Statistics:');
    console.log(`• Folders processed: ${results.length}`);
    console.log(`• Successful builds: ${successful.length}`);
    console.log(`• Failed builds: ${failed.length}`);
    console.log(`• Total modules assembled: ${successful.reduce((sum, r) => sum + r.moduleCount, 0)}`);
    
    if (successful.length > 0) {
        console.log('\n✅ Successful Builds:');
        successful.forEach(result => {
            console.log(`   📁 ${result.folderName}: ${result.moduleCount} modules`);
            console.log(`      🔗 ${result.assembledFile}`);
            if (result.includesFile) {
                console.log(`      📄 ${result.includesFile}`);
            }
        });
    }
    
    if (failed.length > 0) {
        console.log('\n❌ Failed Builds:');
        failed.forEach(result => {
            console.log(`   📁 ${result.folderName}: ${result.error}`);
        });
    }
    
    console.log('\n🚀 Usage Instructions:');
    console.log('='.repeat(20));
    console.log('For each assembled folder:');
    console.log('1. Navigate to the folder containing modules');
    console.log('2. Run the *_ASSEMBLED_*.jsx file in your target application (recommended)');
    console.log('3. OR run the *_INCLUDES_*.jsx file for development/debugging');
    console.log('4. Document analysis interface opens automatically (if available)');
    
    console.log('\n🔧 Key Features:');
    console.log('• ✅ Sequential dependency validation');
    console.log('• ✅ Auto-start document analysis interface');
    console.log('• ✅ Both concatenated and include-based formats');
    console.log('• ✅ Per-folder assembly with full isolation');
    console.log('• ✅ Comprehensive build verification');
    console.log('• ✅ Cross-platform document analysis support');
    
    console.log('\n📝 GitIgnore Recommendations:');
    console.log('Add these patterns to .gitignore:');
    console.log('*_ASSEMBLED_*.jsx');
    console.log('*_INCLUDES_*.jsx');
    console.log('~analysis-*.yaml');
}

// ============================================================================
// COMMAND LINE INTERFACE
// ============================================================================

/**
 * Parse command line arguments
 * @returns {Object} Parsed arguments
 */
function parseArguments() {
    const args = process.argv.slice(2);
    const options = {
        folder: null,
        help: false
    };
    
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        if (arg === '--help' || arg === '-h') {
            options.help = true;
        } else if (arg === '--folder' || arg === '-f') {
            options.folder = args[i + 1];
            i++; // Skip next argument
        }
    }
    
    return options;
}

/**
 * Show help information
 */
function showHelp() {
    console.log('🔧 DocDom Module Assembler - Document Analysis System');
    console.log('='.repeat(55));
    console.log('');
    console.log('USAGE:');
    console.log('  node module-assembler.js [options]');
    console.log('');
    console.log('OPTIONS:');
    console.log('  --folder, -f <path>    Process only the specified folder');
    console.log('  --help, -h             Show this help message');
    console.log('');
    console.log('EXAMPLES:');
    console.log('  node module-assembler.js                    # Process all project folders');
    console.log('  node module-assembler.js -f ../DocDomV3.1   # Process specific folder');
    console.log('');
    console.log('OUTPUT:');
    console.log('  Each folder containing modules will get:');
    console.log('  • {FolderName}_ASSEMBLED_{timestamp}.jsx   (concatenated version)');
    console.log('  • {FolderName}_INCLUDES_{timestamp}.jsx    (include-based version)');
    console.log('');
    console.log('PATTERN MATCHING:');
    console.log('  Discovers files matching: 1.2_*.jsx, 1.2.1_*.jsx, 1.4.2.1_*.jsx');
    console.log('  Supports up to 4 decimal levels for version numbering');
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

/**
 * Main execution function
 */
function main() {
    console.log('🔧 DocDom Module Assembler - Document Analysis System');
    console.log('====================================================');
    
    // Parse command line arguments
    const options = parseArguments();
    
    if (options.help) {
        showHelp();
        return;
    }
    
    try {
        let foldersToProcess;
        
        if (options.folder) {
            // Process specific folder
            const targetPath = path.resolve(options.folder);
            if (!fs.existsSync(targetPath)) {
                throw new Error(`Folder does not exist: ${options.folder}`);
            }
            
            console.log(`📁 Processing specific folder: ${options.folder}`);
            
            // Create folder info for single folder
            const files = fs.readdirSync(targetPath)
                .filter(file => ASSEMBLER_CONFIG.FILE_PATTERN.test(file))
                .filter(file => !isFileExcluded(file));
            
            if (files.length === 0) {
                throw new Error(`No matching module files found in: ${options.folder}`);
            }
            
            foldersToProcess = [{
                name: path.basename(targetPath),
                path: targetPath,
                relativePath: path.relative(path.resolve(__dirname, '..'), targetPath),
                moduleFiles: files,
                moduleCount: files.length
            }];
            
        } else {
            // Discover all project folders
            foldersToProcess = discoverProjectFolders();
        }
        
        if (foldersToProcess.length === 0) {
            console.log('⚠️  No folders with module files found.');
            console.log('💡 Create folders with files matching pattern: 1.2_*.jsx, 1.2.1_*.jsx, etc.');
            return;
        }
        
        // Process each folder
        const results = [];
        
        foldersToProcess.forEach(folderInfo => {
            const result = processModulesInFolder(folderInfo);
            results.push(result);
        });
        
        // Show summary
        showBuildSummary(results);
        
    } catch (error) {
        console.error('\n❌ FATAL ERROR:', error.message);
        console.error('\n🔧 Check your configuration and try again');
        process.exit(1);
    }
}

// ============================================================================
// SCRIPT EXECUTION
// ============================================================================

if (require.main === module) {
    main();
}