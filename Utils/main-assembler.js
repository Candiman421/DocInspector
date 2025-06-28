#!/usr/bin/env node

// main-assembler.js
// Entry point for module assembly utility - ENHANCED FOR EASY ADAPTER SUPPORT
// =============================================================================
// EASY ADAPTER ASSEMBLY COMMANDS - COPY & PASTE READY:
//
// # InDesign Assembly:
// node main-assembler.js -f DocDomV4.1 -a 1.15.1.2025.20.4_indesign-adapter.jsx
//
// # Photoshop Assembly:
// node main-assembler.js -f DocDomV4.1 -a 1.15.2.2025.26.8_photoshop-adapter.jsx
//
// # Illustrator Assembly (when created):
// node main-assembler.js -f DocDomV4.1 -a 1.15.3.2025.xx.x_illustrator-adapter.jsx
//
// # Standard Assembly (no adapter):
// node main-assembler.js -f DocDomV4.1
//
// # Process all folders with InDesign adapter:
// node main-assembler.js -a 1.15.1.2025.20.4_indesign-adapter.jsx
// =============================================================================

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

// Known adapter files for easy reference
const KNOWN_ADAPTERS = {
    indesign: '1.15.1.2025.20.4_indesign-adapter.jsx',
    photoshop: '1.15.2.2025.26.8_photoshop-adapter.jsx',
    illustrator: '1.15.3.2025.xx.x_illustrator-adapter.jsx' // Template for future
};

// CLI Configuration
program
    .name('docdom-assembler')
    .description('DocDom Module Auto-Assembler - Sequential dependency assembly with enhanced adapter support')
    .version('1.0.0')
    .option('-f, --folder <path>', 'Assemble modules in specific folder')
    .option('-a, --adapter <filename>', 'Specific adapter file to include (e.g., 1.15.1.2025.20.4_indesign-adapter.jsx)')
    .option('-v, --verbose', 'Show detailed assembly process')
    .option('-q, --quiet', 'Suppress non-essential output')
    .option('--skip-validation', 'Skip file validation during assembly')
    .option('--no-includes', 'Skip generation of includes-based file')
    .option('--no-auto-start', 'Disable auto-start interface in assembled files')
    .option('--list-adapters', 'List all available adapter files in target folder')
    .parse();

const options = program.opts();

/**
 * Enhanced file discovery with improved adapter support
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
 * Enhanced filter module files with better adapter detection
 * @param {Array} allFiles - All files in directory
 * @param {string} folderPath - Folder path for validation
 * @returns {Array} Filtered module files
 */
function filterModuleFiles(allFiles, folderPath) {
    const validModules = [];
    const excludedFiles = [];
    const adapterFiles = [];
    const otherAdapterFiles = [];

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

    // Enhanced adapter inclusion logic
    if (options.adapter) {
        const specifiedAdapter = options.adapter;

        // Validate specified adapter exists
        if (!allFiles.includes(specifiedAdapter)) {
            throw new Error(`Specified adapter file not found: ${specifiedAdapter}\n` +
                `Available adapters in folder: ${adapterFiles.join(', ') || 'none'}`);
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

        // Track other adapters that are being excluded
        otherAdapterFiles = adapterFiles.filter(adapter => adapter !== specifiedAdapter);

        if (!options.quiet) {
            console.log(chalk.green(`✅ Including specified adapter: ${specifiedAdapter}`));
            if (otherAdapterFiles.length > 0) {
                console.log(chalk.gray(`🔌 Excluding other adapters: ${otherAdapterFiles.join(', ')}`));
            }
        }
    } else if (adapterFiles.length > 0) {
        // Show available adapters when none specified
        if (!options.quiet) {
            console.log(chalk.yellow(`⚠️  Found ${adapterFiles.length} adapter file(s) but none specified:`));
            adapterFiles.forEach(adapter => {
                const appType = detectAdapterType(adapter);
                console.log(chalk.yellow(`   🔌 ${adapter} ${appType ? `(${appType})` : ''}`));
            });
            console.log(chalk.blue(`💡 Use --adapter <filename> to include a specific adapter`));
            console.log(chalk.blue(`💡 Example: --adapter ${adapterFiles[0]}`));
        }

        // Track all adapters as excluded
        otherAdapterFiles = adapterFiles.slice();
    }

    // Report filtering results
    if (!options.quiet) {
        console.log(chalk.cyan(`📊 File filtering results:`));
        console.log(chalk.green(`   ✅ Valid modules: ${validModules.length}`));
        if (options.adapter) {
            console.log(chalk.green(`   🔌 Included adapter: 1 (${options.adapter})`));
        }
        console.log(chalk.gray(`   🔌 Available adapters: ${adapterFiles.length}`));
        console.log(chalk.gray(`   ❌ Excluded files: ${excludedFiles.length + otherAdapterFiles.length}`));

        if (options.verbose && (excludedFiles.length > 0 || otherAdapterFiles.length > 0)) {
            console.log(chalk.gray(`\n📋 Excluded files:`));
            excludedFiles.forEach(({ file, reason }) => {
                console.log(chalk.gray(`   • ${file} - ${reason}`));
            });
            otherAdapterFiles.forEach(file => {
                console.log(chalk.gray(`   • ${file} - Adapter not selected`));
            });
        }

        console.log(chalk.cyan(`\n📋 Files to be assembled (in load order):`));
        const sortedModules = sortModulesByVersion(validModules);
        sortedModules.forEach((module, index) => {
            const isAdapter = module.filename.toLowerCase().includes(ADAPTER_KEYWORD);
            const appType = isAdapter ? detectAdapterType(module.filename) : null;
            const icon = isAdapter ? '🔌' : '📦';
            const type = isAdapter ? `(${appType || 'adapter'})` : '(module)';
            console.log(chalk.white(`   ${String(index + 1).padStart(2)}. ${icon} ${module.filename} v${module.version} ${type}`));
        });
    }

    return validModules;
}

/**
 * Detect adapter type from filename
 * @param {string} filename - Adapter filename
 * @returns {string|null} App type or null
 */
function detectAdapterType(filename) {
    const lower = filename.toLowerCase();
    if (lower.includes('indesign')) return 'InDesign';
    if (lower.includes('photoshop')) return 'Photoshop';
    if (lower.includes('illustrator')) return 'Illustrator';
    if (lower.includes('aftereffects')) return 'After Effects';
    if (lower.includes('premiere')) return 'Premiere Pro';
    return null;
}

/**
 * List available adapters in folder
 * @param {string} folderPath - Path to scan
 */
function listAvailableAdapters(folderPath) {
    if (!fs.existsSync(folderPath)) {
        console.log(chalk.red(`❌ Folder does not exist: ${folderPath}`));
        return;
    }

    const allFiles = fs.readdirSync(folderPath);
    const adapterFiles = allFiles.filter(file =>
        file.match(/\.jsx?$/) &&
        file.match(MODULE_FILE_PATTERN) &&
        file.toLowerCase().includes(ADAPTER_KEYWORD)
    );

    console.log(chalk.cyan(`🔌 Available Adapters in ${path.basename(folderPath)}:`));
    console.log(chalk.gray('='.repeat(50)));

    if (adapterFiles.length === 0) {
        console.log(chalk.yellow('   No adapter files found'));
        return;
    }

    adapterFiles.forEach((adapter, index) => {
        const appType = detectAdapterType(adapter);
        const version = adapter.match(MODULE_FILE_PATTERN);
        console.log(chalk.white(`   ${index + 1}. ${adapter}`));
        if (appType) {
            console.log(chalk.blue(`      🎯 Target: ${appType}`));
        }
        if (version) {
            console.log(chalk.gray(`      📦 Version: ${version[1]}`));
        }
        console.log(chalk.green(`      💻 Command: node main-assembler.js -f ${path.basename(folderPath)} -a ${adapter}`));
        console.log();
    });
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
            sortKey: versionArray.map(n => String(n).padStart(4, '0')).join('.'),
            isAdapter: filename.toLowerCase().includes(ADAPTER_KEYWORD)
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

        // Handle list adapters command
        if (options.listAdapters) {
            const folderPath = options.folder ? path.resolve(options.folder) : process.cwd();
            listAvailableAdapters(folderPath);
            return;
        }

        // Validate adapter argument if provided
        if (options.adapter && !options.folder) {
            console.log(chalk.red('❌ --adapter option requires --folder to be specified'));
            console.log(chalk.blue('💡 Example: node main-assembler.js -f DocDomV4.1 -a 1.15.1.2025.20.4_indesign-adapter.jsx'));
            process.exit(1);
        }

        // Determine folders to process
        const foldersToProcess = determineFoldersToProcess();

        if (foldersToProcess.length === 0) {
            console.log(chalk.yellow('⚠️  No folders with module files found.'));
            console.log(chalk.blue('💡 Create folders with files matching pattern: #.#.#_*.jsx (e.g., 1.2.3_module.jsx)'));
            if (options.adapter) {
                console.log(chalk.blue('💡 Use --folder to specify the folder containing your adapter file'));
                console.log(chalk.blue(`💡 Example: node main-assembler.js -f DocDomV4.1 -a ${options.adapter}`));
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
        if (error.message.includes('adapter')) {
            console.error(chalk.blue('💡 Use --list-adapters to see available adapters'));
        }
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
            const appType = detectAdapterType(options.adapter);
            console.log(chalk.blue(`🔌 Adapter Mode: Including ${options.adapter} ${appType ? `(${appType})` : ''}`));
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
 * Enhanced discover all project folders with better adapter detection
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
                    const adapterCount = allFiles.filter(file =>
                        file.match(/\.jsx?$/) &&
                        file.match(MODULE_FILE_PATTERN) &&
                        file.toLowerCase().includes(ADAPTER_KEYWORD)
                    ).length;

                    const folderInfo = {
                        name: folderName,
                        path: dirPath,
                        relativePath: relativePath,
                        moduleFiles: moduleFiles,
                        moduleCount: moduleFiles.length,
                        adapterCount: adapterCount
                    };

                    foldersWithModules.push(folderInfo);

                    if (!options.quiet) {
                        const adapterText = adapterCount > 0 ? `, ${adapterCount} adapter(s)` : '';
                        console.log(chalk.green(`📁 Found ${moduleFiles.length} modules${adapterText} in: ${folderName}`));
                    }
                }

                // Recursively scan subdirectories (skip node_modules, .git, etc.)
                entries
                    .filter(entry => entry.isDirectory())
                    .filter(entry => !['node_modules', '.git', '.vscode', 'build', 'dist', 'target'].includes(entry.name))
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

            // Show adapter summary
            const totalAdapters = foldersWithModules.reduce((sum, folder) => sum + (folder.adapterCount || 0), 0);
            if (totalAdapters > 0) {
                console.log(chalk.blue(`🔌 Total adapters available: ${totalAdapters}`));
                console.log(chalk.blue(`💡 Use --list-adapters to see detailed adapter information`));
            }
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
                    const appType = detectAdapterType(options.adapter);
                    console.log(chalk.blue(`🔌 Included adapter: ${options.adapter} ${appType ? `(${appType})` : ''}`));
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
 * Enhanced show assembly summary with adapter details
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
        const appType = detectAdapterType(options.adapter);
        console.log(chalk.blue(`🔌 Adapter included: ${options.adapter} ${appType ? `(${appType})` : ''}`));
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

    // Enhanced features overview
    console.log(chalk.cyan('\n🔧 Key Features:'));
    console.log(chalk.green('• ✅ Sequential dependency validation'));
    console.log(chalk.green('• ✅ Flexible version numbering (#.#.#.#.#...)'));
    console.log(chalk.green('• ✅ Enhanced adapter file support with selective inclusion'));
    console.log(chalk.green('• ✅ Auto-detection of adapter types (InDesign, Photoshop, etc.)'));
    console.log(chalk.green('• ✅ Auto-start document analysis interface'));
    console.log(chalk.green('• ✅ Both concatenated and include-based formats'));
    console.log(chalk.green('• ✅ Per-folder assembly with full isolation'));
    console.log(chalk.green('• ✅ Comprehensive build verification'));
    console.log(chalk.green('• ✅ Cross-platform document analysis support'));

    // Enhanced adapter instructions
    if (options.adapter || successful.some(r => r.adapterIncluded)) {
        console.log(chalk.cyan('\n🔌 Adapter Support:'));
        console.log(chalk.green('• ✅ Selective adapter inclusion (only one per assembly)'));
        console.log(chalk.green('• ✅ Multiple adapter versions supported'));
        console.log(chalk.green('• ✅ Automatic adapter detection and filtering'));
        console.log(chalk.green('• ✅ App-specific interface standardization'));
        console.log(chalk.blue(`• 💡 Use --list-adapters to see available adapters`));
    }

    // Quick reference commands
    console.log(chalk.cyan('\n⚡ Quick Reference Commands:'));
    console.log(chalk.white('# List available adapters:'));
    console.log(chalk.blue('node main-assembler.js --list-adapters -f DocDomV4.1'));
    console.log(chalk.white('# InDesign assembly:'));
    console.log(chalk.blue('node main-assembler.js -f DocDomV4.1 -a 1.15.1.2025.20.4_indesign-adapter.jsx'));
    console.log(chalk.white('# Photoshop assembly:'));
    console.log(chalk.blue('node main-assembler.js -f DocDomV4.1 -a 1.15.2.2025.26.8_photoshop-adapter.jsx'));

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

// Enhanced help text
program.addHelpText('after', `

${chalk.cyan('Quick Start Examples:')}
  ${chalk.green('node main-assembler.js --list-adapters -f DocDomV4.1')}             # List available adapters
  ${chalk.green('node main-assembler.js -f DocDomV4.1')}                            # Assemble without adapter
  ${chalk.green('node main-assembler.js -f DocDomV4.1 -a 1.15.1.2025.20.4_indesign-adapter.jsx')}    # InDesign
  ${chalk.green('node main-assembler.js -f DocDomV4.1 -a 1.15.2.2025.26.8_photoshop-adapter.jsx')}   # Photoshop
  ${chalk.green('node main-assembler.js --verbose')}                                # Show detailed process

${chalk.cyan('Enhanced Adapter Support:')}
  Adapters are special files containing 'adapter' in their filename that provide
  app-specific interfaces for different Adobe Creative Suite applications.
  
  • By default, ALL adapter files are excluded from assembly
  • Use --adapter <filename> to include a specific adapter
  • Only one adapter can be included per assembly
  • Adapter files must follow the version pattern (#.#.#_*.jsx)
  • Each adapter provides the same function interface for app compatibility

${chalk.cyan('Known Adapter Types:')}
  • InDesign:    1.15.1.2025.20.4_indesign-adapter.jsx
  • Photoshop:   1.15.2.2025.26.8_photoshop-adapter.jsx
  • Illustrator: 1.15.3.2025.xx.x_illustrator-adapter.jsx (future)

${chalk.cyan('Pattern Matching:')}
  Discovers files matching: #.#.#_*.jsx with unlimited decimal levels
  Examples: 1.2_*.jsx, 1.2.3_*.jsx, 1.15.1.2025.20.4_*.jsx
  
  Special Rules:
  • Files must start with version pattern: #.#.#_
  • Files containing 'adapter' are excluded unless specified with --adapter
  • All other files are ignored

${chalk.cyan('Output Files:')}
  Each folder containing modules will get:
  • {FolderName}_ASSEMBLED_{timestamp}.jsx   (concatenated version - recommended)
  • {FolderName}_INCLUDES_{timestamp}.jsx    (include-based version - for debugging)

${chalk.cyan('Architecture:')}
  • Sequential dependency system (1.1 → 1.2 → 2.1)
  • ES3/ExtendScript compatibility maintained
  • Auto-start interface integration
  • Build verification and error handling
  • Selective adapter inclusion for multi-app support
  • Standardized function interfaces across adapters
`);

// Show help if no arguments provided
if (process.argv.length === 2) {
    program.help();
}

// Execute main function
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    try {
        main();
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}