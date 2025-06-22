#!/usr/bin/env node

// main-assembler.js
// Entry point for module assembly utility - ENHANCED FOR ADAPTER SUPPORT

import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { assembleModules } from './core/module-assembler.js';
import { pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

// Enhanced module file pattern - supports any length of version numbers
const MODULE_FILE_PATTERN = /^(\d+(?:\.\d+)*)_.*\.jsx?$/;
const ADAPTER_KEYWORD = 'adapter';

// CLI Configuration
program
    .name('docdom-assembler')
    .description('DocDom Module Auto-Assembler - Sequential dependency assembly with adapter support')
    .version('1.0.0')
    .option('-f, --folder <path>', 'Assemble modules in specific folder')
    .option('-a, --adapter <filename>', 'Specific adapter file to include (e.g., 1.15.1.2025.20.4_indesign-adapter.jsx)')
    .option('-v, --verbose', 'Show detailed assembly process')
    .option('-q, --quiet', 'Suppress non-essential output')
    .option('--skip-validation', 'Skip file validation during assembly')
    .option('--no-includes', 'Skip generation of includes-based file')
    .option('--no-auto-start', 'Disable auto-start interface in assembled files')
    .parse();

const options = program.opts();

/**
 * Enhanced file discovery with adapter support
 * @param {string} folderPath - Path to scan
 * @returns {Object} Folder information with filtered modules
 */
function discoverModulesWithAdapterSupport(folderPath) {
    if (!fs.existsSync(folderPath)) {
        throw new Error(`Folder does not exist: ${folderPath}`);
    }

    const stats = fs.statSync(folderPath);
    if (!stats.isDirectory()) {
        throw new Error(`Path is not a directory: ${folderPath}`);
    }

    // Get all files in directory
    const allFiles = fs.readdirSync(folderPath);
    
    if (!options.quiet) {
        console.log(chalk.gray(`📁 Scanning folder: ${path.basename(folderPath)}`));
        console.log(chalk.gray(`   Found ${allFiles.length} total files`));
    }

    // Filter files based on enhanced rules
    const filteredFiles = filterModuleFiles(allFiles, folderPath);

    if (filteredFiles.length === 0) {
        throw new Error(`No valid module files found in: ${folderPath}`);
    }

    return {
        name: path.basename(folderPath),
        path: folderPath,
        relativePath: path.relative(process.cwd(), folderPath),
        moduleFiles: filteredFiles,
        moduleCount: filteredFiles.length
    };
}

/**
 * Filter module files based on enhanced rules
 * @param {Array} allFiles - All files in directory
 * @param {string} folderPath - Folder path for validation
 * @returns {Array} Filtered module files
 */
function filterModuleFiles(allFiles, folderPath) {
    const validModules = [];
    const excludedFiles = [];
    const adapterFiles = [];

    // First pass: categorize all files
    allFiles.forEach(filename => {
        // Skip non-JavaScript files
        if (!filename.match(/\.jsx?$/)) {
            excludedFiles.push({ file: filename, reason: 'Not a JavaScript file' });
            return;
        }

        // Check if file matches version pattern
        const versionMatch = filename.match(MODULE_FILE_PATTERN);
        if (!versionMatch) {
            excludedFiles.push({ file: filename, reason: 'Does not match version pattern (#.#.#_*.jsx)' });
            return;
        }

        // Check if file is an adapter
        if (filename.toLowerCase().includes(ADAPTER_KEYWORD)) {
            adapterFiles.push(filename);
            return;
        }

        // Valid non-adapter module
        validModules.push(filename);
    });

    // Handle adapter inclusion logic
    if (options.adapter) {
        const specifiedAdapter = options.adapter;
        
        // Validate specified adapter exists
        if (!allFiles.includes(specifiedAdapter)) {
            throw new Error(`Specified adapter file not found: ${specifiedAdapter}`);
        }

        // Validate specified adapter matches pattern and is actually an adapter
        if (!specifiedAdapter.match(MODULE_FILE_PATTERN)) {
            throw new Error(`Specified adapter does not match version pattern: ${specifiedAdapter}`);
        }

        if (!specifiedAdapter.toLowerCase().includes(ADAPTER_KEYWORD)) {
            console.log(chalk.yellow(`⚠️  Warning: Specified file does not contain 'adapter' keyword: ${specifiedAdapter}`));
        }

        // Add specified adapter to valid modules
        validModules.push(specifiedAdapter);
        
        if (!options.quiet) {
            console.log(chalk.green(`✅ Including specified adapter: ${specifiedAdapter}`));
        }
    } else if (adapterFiles.length > 0) {
        if (!options.quiet) {
            console.log(chalk.yellow(`⚠️  Found ${adapterFiles.length} adapter file(s) but none specified:`));
            adapterFiles.forEach(adapter => {
                console.log(chalk.yellow(`   📋 ${adapter}`));
            });
            console.log(chalk.blue(`💡 Use --adapter <filename> to include a specific adapter`));
        }
    }

    // Report filtering results
    if (!options.quiet) {
        console.log(chalk.cyan(`📊 File filtering results:`));
        console.log(chalk.green(`   ✅ Valid modules: ${validModules.length}`));
        console.log(chalk.yellow(`   📋 Adapter files found: ${adapterFiles.length}`));
        console.log(chalk.gray(`   ❌ Excluded files: ${excludedFiles.length}`));
        
        if (options.verbose && excludedFiles.length > 0) {
            console.log(chalk.gray(`\n📋 Excluded files:`));
            excludedFiles.forEach(({ file, reason }) => {
                console.log(chalk.gray(`   • ${file} - ${reason}`));
            });
        }
        
        console.log(chalk.cyan(`\n📋 Files to be assembled:`));
        const sortedModules = sortModulesByVersion(validModules);
        sortedModules.forEach((module, index) => {
            const isAdapter = module.filename.toLowerCase().includes(ADAPTER_KEYWORD);
            const icon = isAdapter ? '🔌' : '📦';
            const type = isAdapter ? '(adapter)' : '(module)';
            console.log(chalk.white(`   ${index + 1}. ${icon} ${module.filename} v${module.version} ${type}`));
        });
    }

    return validModules;
}

/**
 * Sort modules by version for dependency order
 * @param {Array} moduleFiles - Array of module filenames
 * @returns {Array} Sorted module information
 */
function sortModulesByVersion(moduleFiles) {
    const moduleData = moduleFiles.map(filename => {
        const versionMatch = filename.match(MODULE_FILE_PATTERN);
        const version = versionMatch ? versionMatch[1] : '0';
        const versionArray = parseVersion(version);

        return {
            filename,
            version,
            versionArray,
            sortKey: versionArray.map(n => String(n).padStart(4, '0')).join('.')
        };
    });

    // Sort by version array comparison
    moduleData.sort((a, b) => compareVersions(a.versionArray, b.versionArray));

    return moduleData;
}

/**
 * Parse version string into comparable array
 * @param {string} versionString - Version like "1.2.1.5"
 * @returns {number[]} Array of version numbers
 */
function parseVersion(versionString) {
    return versionString.split('.').map(num => parseInt(num, 10));
}

/**
 * Compare two version arrays
 * @param {number[]} a - First version array
 * @param {number[]} b - Second version array  
 * @returns {number} -1, 0, or 1
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

/**
 * Main execution function
 */
function main() {
    try {
        showHeader();

        // Validate adapter argument if provided
        if (options.adapter && !options.folder) {
            console.log(chalk.red('❌ --adapter option requires --folder to be specified'));
            process.exit(1);
        }

        // Determine folders to process
        const foldersToProcess = determineFoldersToProcess();

        if (foldersToProcess.length === 0) {
            console.log(chalk.yellow('⚠️  No folders with module files found.'));
            console.log(chalk.blue('💡 Create folders with files matching pattern: #.#.#_*.jsx (e.g., 1.2.3_module.jsx)'));
            if (options.adapter) {
                console.log(chalk.blue('💡 Use --folder to specify the folder containing your adapter file'));
            }
            return;
        }

        // Process each folder
        const results = [];
        for (const folderInfo of foldersToProcess) {
            const result = processFolder(folderInfo);
            results.push(result);
        }

        // Show summary
        showAssemblySummary(results);

    } catch (error) {
        console.error(chalk.red('\n❌ FATAL ERROR:'), error.message);
        console.error(chalk.yellow('🔧 Check your configuration and try again'));
        process.exit(1);
    }
}

/**
 * Show application header
 */
function showHeader() {
    if (!options.quiet) {
        console.log(chalk.cyan('🔧 DocDom Module Assembler - Document Analysis System'));
        console.log(chalk.cyan('===================================================='));
        if (options.adapter) {
            console.log(chalk.blue(`🔌 Adapter Mode: Including ${options.adapter}`));
        }
        console.log();
    }
}

/**
 * Determine which folders to process based on options
 */
function determineFoldersToProcess() {
    if (options.folder) {
        return processSingleFolder(options.folder);
    } else {
        return discoverAllProjectFolders();
    }
}

/**
 * Process single folder specified by user
 */
function processSingleFolder(folderPath) {
    const targetPath = path.resolve(folderPath);

    if (!options.quiet) {
        console.log(chalk.blue(`📁 Processing specific folder: ${folderPath}`));
    }

    try {
        const folderInfo = discoverModulesWithAdapterSupport(targetPath);
        return [folderInfo];
    } catch (error) {
        throw new Error(`Folder processing failed: ${error.message}`);
    }
}

/**
 * Discover all project folders with modules
 */
function discoverAllProjectFolders() {
    if (!options.quiet) {
        console.log(chalk.blue('🔍 Scanning project for module folders...'));
        console.log(chalk.gray('='.repeat(50)));
    }

    try {
        const projectRoot = path.resolve(__dirname, '..');
        const foldersWithModules = [];

        // Recursively scan directories for module files
        function scanDirectory(dirPath, relativePath = '') {
            try {
                const entries = fs.readdirSync(dirPath, { withFileTypes: true });

                // Check for module files in current directory
                const allFiles = entries
                    .filter(entry => entry.isFile())
                    .map(entry => entry.name);

                const moduleFiles = filterModuleFiles(allFiles, dirPath);

                // If modules found, add folder to list
                if (moduleFiles.length > 0) {
                    const folderName = relativePath || 'Root';
                    const folderInfo = {
                        name: folderName,
                        path: dirPath,
                        relativePath: relativePath,
                        moduleFiles: moduleFiles,
                        moduleCount: moduleFiles.length
                    };

                    foldersWithModules.push(folderInfo);

                    if (!options.quiet) {
                        console.log(chalk.green(`📁 Found ${moduleFiles.length} modules in: ${folderName}`));
                    }
                }

                // Recursively scan subdirectories (skip node_modules, .git, etc.)
                entries
                    .filter(entry => entry.isDirectory())
                    .filter(entry => !['node_modules', '.git', '.vscode', 'build', 'dist'].includes(entry.name))
                    .forEach(entry => {
                        const subPath = path.join(dirPath, entry.name);
                        const subRelative = relativePath ? `${relativePath}/${entry.name}` : entry.name;
                        scanDirectory(subPath, subRelative);
                    });

            } catch (error) {
                if (!options.quiet) {
                    console.error(chalk.red(`❌ Error scanning ${dirPath}: ${error.message}`));
                }
            }
        }

        scanDirectory(projectRoot);

        if (!options.quiet && foldersWithModules.length > 0) {
            console.log(chalk.green(`\n🎯 Discovery complete: ${foldersWithModules.length} folders with modules found`));
        }

        return foldersWithModules;
    } catch (error) {
        throw new Error(`Project discovery failed: ${error.message}`);
    }
}

/**
 * Process modules in a specific folder
 */
function processFolder(folderInfo) {
    if (!options.quiet) {
        console.log(chalk.yellow(`\n🔨 Processing modules in: ${folderInfo.name}`));
        console.log(chalk.gray('='.repeat(40)));
    }

    try {
        const assemblyOptions = {
            addDebugComments: !options.skipValidation,
            addTimestamps: true,
            validateFiles: !options.skipValidation,
            showProgress: options.verbose || !options.quiet,
            autoStartInterface: !options.noAutoStart,
            generateIncludes: !options.noIncludes,
            verbose: options.verbose,
            adapterFile: options.adapter
        };

        const result = assembleModules(folderInfo, assemblyOptions);

        if (!options.quiet) {
            if (result.success) {
                console.log(chalk.green(`✅ Assembly completed successfully`));
                console.log(chalk.blue(`📊 Processed ${result.moduleCount} modules`));
                if (options.adapter) {
                    console.log(chalk.blue(`🔌 Included adapter: ${options.adapter}`));
                }
                if (result.assembledFile) {
                    console.log(chalk.blue(`🔗 Assembled: ${result.assembledFile}`));
                }
                if (result.includesFile) {
                    console.log(chalk.blue(`📄 Includes: ${result.includesFile}`));
                }
            } else {
                console.log(chalk.red(`❌ Assembly failed: ${result.error}`));
            }
        }

        return result;

    } catch (error) {
        const errorResult = {
            success: false,
            error: error.message,
            folderName: folderInfo.name,
            moduleCount: 0
        };

        if (!options.quiet) {
            console.error(chalk.red(`❌ Error processing ${folderInfo.name}: ${error.message}`));
        }

        return errorResult;
    }
}

/**
 * Show assembly summary for all processed folders
 */
function showAssemblySummary(results) {
    if (options.quiet) return;

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(chalk.green('\n🎉 Module Assembly Complete!'));
    console.log(chalk.gray('='.repeat(50)));

    // Statistics
    console.log(chalk.blue('\n📊 Assembly Statistics:'));
    console.log(chalk.white(`• Folders processed: ${results.length}`));
    console.log(chalk.green(`• Successful assemblies: ${successful.length}`));
    if (failed.length > 0) {
        console.log(chalk.red(`• Failed assemblies: ${failed.length}`));
    }
    console.log(chalk.blue(`• Total modules assembled: ${successful.reduce((sum, r) => sum + r.moduleCount, 0)}`));

    if (options.adapter) {
        console.log(chalk.blue(`🔌 Adapter included: ${options.adapter}`));
    }

    // Successful assemblies
    if (successful.length > 0) {
        console.log(chalk.green('\n✅ Successful Assemblies:'));
        successful.forEach(result => {
            console.log(chalk.white(`   📁 ${result.folderName}: ${result.moduleCount} modules`));
            if (result.assembledFile) {
                console.log(chalk.blue(`      🔗 ${result.assembledFile}`));
            }
            if (result.includesFile) {
                console.log(chalk.gray(`      📄 ${result.includesFile}`));
            }
        });
    }

    // Failed assemblies
    if (failed.length > 0) {
        console.log(chalk.red('\n❌ Failed Assemblies:'));
        failed.forEach(result => {
            console.log(chalk.red(`   📁 ${result.folderName}: ${result.error}`));
        });
    }

    // Usage instructions
    console.log(chalk.cyan('\n🚀 Usage Instructions:'));
    console.log(chalk.gray('='.repeat(20)));
    console.log(chalk.white('For each assembled folder:'));
    console.log(chalk.blue('1. Navigate to the folder containing modules'));
    console.log(chalk.blue('2. Run the *_ASSEMBLED_*.jsx file in your target application (recommended)'));
    console.log(chalk.blue('3. OR run the *_INCLUDES_*.jsx file for development/debugging'));
    console.log(chalk.blue('4. Document analysis interface opens automatically (if available)'));

    // Features overview
    console.log(chalk.cyan('\n🔧 Key Features:'));
    console.log(chalk.green('• ✅ Sequential dependency validation'));
    console.log(chalk.green('• ✅ Flexible version numbering (#.#.#.#.#...)'));
    console.log(chalk.green('• ✅ Adapter file support with selective inclusion'));
    console.log(chalk.green('• ✅ Auto-start document analysis interface'));
    console.log(chalk.green('• ✅ Both concatenated and include-based formats'));
    console.log(chalk.green('• ✅ Per-folder assembly with full isolation'));
    console.log(chalk.green('• ✅ Comprehensive build verification'));
    console.log(chalk.green('• ✅ Cross-platform document analysis support'));

    // Adapter instructions
    if (options.adapter || successful.some(r => r.adapterIncluded)) {
        console.log(chalk.cyan('\n🔌 Adapter Support:'));
        console.log(chalk.green('• ✅ Selective adapter inclusion'));
        console.log(chalk.green('• ✅ Multiple adapter versions supported'));
        console.log(chalk.green('• ✅ Automatic adapter detection and filtering'));
    }

    // GitIgnore recommendations
    console.log(chalk.yellow('\n📝 GitIgnore Recommendations:'));
    console.log(chalk.gray('Add these patterns to .gitignore:'));
    console.log(chalk.white('*_ASSEMBLED_*.jsx'));
    console.log(chalk.white('*_INCLUDES_*.jsx'));
    console.log(chalk.white('~analysis-*.yaml'));
}

/**
 * Handle uncaught errors gracefully
 */
process.on('unhandledRejection', (reason, promise) => {
    console.error(chalk.red('Unhandled Rejection at:'), promise, chalk.red('reason:'), reason);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error(chalk.red('Uncaught Exception:'), error);
    process.exit(1);
});

// Help text customization
program.addHelpText('after', `

Examples:
  ${chalk.green('node main-assembler.js')}                                           # Assemble all project folders
  ${chalk.green('node main-assembler.js -f ../DocDomV4.1')}                         # Assemble specific folder
  ${chalk.green('node main-assembler.js -f ../DocDomV4.1 -a 1.15.1.2025.20.4_indesign-adapter.jsx')}  # Include specific adapter
  ${chalk.green('node main-assembler.js --verbose')}                                # Show detailed process
  ${chalk.green('node main-assembler.js --no-includes')}                            # Skip includes file generation

Adapter Support:
  Adapters are special files containing 'adapter' in their filename.
  • By default, ALL adapter files are excluded from assembly
  • Use --adapter <filename> to include a specific adapter
  • Only one adapter can be included per assembly
  • Adapter files must still follow the version pattern (#.#.#_*.jsx)

Pattern Matching:
  Discovers files matching: #.#.#_*.jsx with unlimited decimal levels
  Examples: 1.2_*.jsx, 1.2.3_*.jsx, 1.15.1.2025.20.4_*.jsx
  
  Special Rules:
  • Files must start with version pattern: #.#.#_
  • Files containing 'adapter' are excluded unless specified with --adapter
  • All other files are ignored

Output Files:
  Each folder containing modules will get:
  • {FolderName}_ASSEMBLED_{timestamp}.jsx   (concatenated version)
  • {FolderName}_INCLUDES_{timestamp}.jsx    (include-based version)

Architecture:
  • Sequential dependency system (1.1 → 1.2 → 2.1)
  • ES3/ExtendScript compatibility maintained
  • Auto-start interface integration
  • Build verification and error handling
  • Selective adapter inclusion for multi-app support
`);

// Show help if no arguments provided
if (process.argv.length === 2) {
    program.help();
}

// Execute main function
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    try {
        console.log("=== ABOUT TO CALL MAIN ===");
        main();
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}