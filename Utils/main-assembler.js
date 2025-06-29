#!/usr/bin/env node

// main-assembler.js
// Entry point for enhanced module assembly utility with smart adapter integration
// =============================================================================
// ENHANCED ADAPTER ASSEMBLY COMMANDS - COPY & PASTE READY:
//
// # InDesign Assembly:
// node main-assembler.js -f DocDomV4.1 -a 1.15.1.2025.01.15_indesign-adapter.jsx
//
// # Photoshop Assembly:
// node main-assembler.js -f DocDomV4.1 -a 1.15.2.2025.01.20_photoshop-adapter.jsx
//
// # Illustrator Assembly (when created):
// node main-assembler.js -f DocDomV4.1 -a 1.15.3.2025.xx.x_illustrator-adapter.jsx
//
// # Standard Assembly (no adapter):
// node main-assembler.js -f DocDomV4.1
//
// # Process all folders with specific adapter:
// node main-assembler.js -a 1.15.1.2025.01.15_indesign-adapter.jsx
// =============================================================================

import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { assembleModules } from './core/module-assembler.js';
import { pathToFileURL } from 'url';
import { 
    isModuleFile, 
    isExcludedFile,
    isExcludedFolder,
    parseVersion,
    compareVersions
} from './config/patterns.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

// Enhanced module file pattern and adapter detection
const ADAPTER_KEYWORD = 'adapter';

// Known adapter files for quick reference
const KNOWN_ADAPTERS = {
    indesign: '1.15.1.2025.01.15_indesign-adapter.jsx',
    photoshop: '1.15.2.2025.01.20_photoshop-adapter.jsx',
    illustrator: '1.15.3.2025.xx.x_illustrator-adapter.jsx' // Template for future
};

// ============================================================================
// ENHANCED CLI CONFIGURATION
// ============================================================================

program
    .name('docdom-assembler')
    .description('DocDom Module Auto-Assembler v4.1 - Smart adapter integration with enhanced assembly naming')
    .version('4.1.0')
    .option('-f, --folder <path>', 'Assemble modules in specific folder')
    .option('-a, --adapter <filename>', 'Specific adapter file to include (e.g., 1.15.1.2025.01.15_indesign-adapter.jsx)')
    .option('-v, --verbose', 'Show detailed assembly process')
    .option('-q, --quiet', 'Suppress non-essential output')
    .option('--skip-validation', 'Skip file validation during assembly')
    .option('--no-includes', 'Skip generation of includes-based file')
    .option('--no-auto-start', 'Disable auto-start interface in assembled files')
    .option('--list-adapters', 'List all available adapter files in target folder')
    .parse();

const options = program.opts();

// ============================================================================
// ENHANCED ADAPTER DETECTION AND MANAGEMENT
// ============================================================================

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
        console.log(chalk.gray(`   Files found: ${allFiles.length}`));
    }

    // Separate adapters from regular modules
    const adapterFiles = [];
    const moduleFiles = [];

    allFiles.forEach(file => {
        if (!isModuleFile(file) || isExcludedFile(file)) {
            return; // Skip non-module files
        }

        if (file.toLowerCase().includes(ADAPTER_KEYWORD)) {
            adapterFiles.push(file);
        } else {
            moduleFiles.push(file);
        }
    });

    // Handle adapter inclusion logic
    let finalModuleList = [...moduleFiles]; // Start with regular modules

    if (options.adapter) {
        // Specific adapter requested
        if (adapterFiles.includes(options.adapter)) {
            finalModuleList.push(options.adapter);
            if (!options.quiet) {
                console.log(chalk.blue(`🔌 Including specific adapter: ${options.adapter}`));
            }
        } else {
            throw new Error(`Requested adapter not found: ${options.adapter}`);
        }
    } else if (adapterFiles.length > 0) {
        // Adapters found but none specified - exclude all
        if (!options.quiet) {
            console.log(chalk.yellow(`⚠️  ${adapterFiles.length} adapter(s) found but none specified. Use --adapter to include one.`));
            adapterFiles.forEach(adapter => {
                const adapterType = detectAdapterType(adapter);
                console.log(chalk.gray(`   🔌 Available: ${adapter} (${adapterType || 'unknown'})`));
            });
        }
    }

    if (finalModuleList.length === 0) {
        throw new Error('No modules found for assembly');
    }

    return {
        name: path.basename(folderPath),
        path: folderPath,
        moduleFiles: finalModuleList,
        moduleCount: finalModuleList.length,
        adapterFiles,
        regularModules: moduleFiles,
        hasAdapter: finalModuleList.length > moduleFiles.length
    };
}

/**
 * Detect adapter type from filename for display
 * @param {string} filename - Adapter filename
 * @returns {string|null} App type or null
 */
function detectAdapterType(filename) {
    if (!filename) return null;
    
    const lower = filename.toLowerCase();
    if (lower.includes('indesign')) return 'InDesign';
    if (lower.includes('photoshop')) return 'Photoshop';
    if (lower.includes('illustrator')) return 'Illustrator';
    if (lower.includes('aftereffects')) return 'After Effects';
    if (lower.includes('premiere')) return 'Premiere Pro';
    return 'Unknown';
}

/**
 * List available adapters in folder with enhanced information
 * @param {string} folderPath - Path to scan
 */
function listAvailableAdapters(folderPath) {
    if (!fs.existsSync(folderPath)) {
        console.log(chalk.red(`❌ Folder does not exist: ${folderPath}`));
        return;
    }

    const allFiles = fs.readdirSync(folderPath);
    const adapterFiles = allFiles.filter(file =>
        isModuleFile(file) &&
        !isExcludedFile(file) &&
        file.toLowerCase().includes(ADAPTER_KEYWORD)
    );

    console.log(chalk.cyan(`🔌 Available Adapters in ${path.basename(folderPath)}:`));
    console.log(chalk.gray('='.repeat(60)));

    if (adapterFiles.length === 0) {
        console.log(chalk.yellow('   No adapter files found'));
        console.log(chalk.gray('   Adapter files should follow pattern: 1.15.x.yyyy.mm.dd_[app]-adapter.jsx'));
        return;
    }

    adapterFiles.forEach((adapter, index) => {
        const appType = detectAdapterType(adapter);
        const version = adapter.match(/^(\d+(?:\.\d+)*)/);
        const versionStr = version ? version[1] : 'unknown';
        
        console.log(chalk.white(`   ${index + 1}. ${adapter}`));
        console.log(chalk.blue(`      🎯 Target App: ${appType || 'Unknown'}`));
        console.log(chalk.gray(`      📦 Version: ${versionStr}`));
        console.log(chalk.green(`      💻 Command: node main-assembler.js -f ${path.basename(folderPath)} -a ${adapter}`));
        
        // Show expected output filename
        const adapterTypeUpper = appType ? appType.toUpperCase().replace(/\s+/g, '') : 'ADAPTER';
        const expectedFilename = `${path.basename(folderPath)}_${adapterTypeUpper}_ASSEMBLED_[timestamp].jsx`;
        console.log(chalk.cyan(`      📄 Output: ${expectedFilename}`));
        console.log();
    });
    
    console.log(chalk.cyan('💡 Assembly Tips:'));
    console.log(chalk.gray('   • Assembled files include adapter type in filename automatically'));
    console.log(chalk.gray('   • Adapters are inserted at correct dependency position (after 1.1, before 1.2)'));
    console.log(chalk.gray('   • All modules remain adapter-agnostic and work with any adapter'));
}

/**
 * Discover all folders with modules in project
 * @param {string} rootPath - Root path to scan
 * @returns {Array} Array of folder information
 */
function discoverProjectFolders(rootPath = process.cwd()) {
    console.log(chalk.blue('🔍 Scanning project for module folders...'));
    console.log(chalk.gray('='.repeat(50)));

    const foldersWithModules = [];

    const scanDirectory = (dirPath, relativePath = '') => {
        try {
            const entries = fs.readdirSync(dirPath, { withFileTypes: true });

            // Find module files in current directory
            const moduleFiles = entries
                .filter(entry => entry.isFile())
                .filter(entry => isModuleFile(entry.name))
                .filter(entry => !isExcludedFile(entry.name))
                .map(entry => entry.name);

            // If modules found, add folder to list
            if (moduleFiles.length > 0) {
                const folderName = relativePath || 'Root';
                
                // Separate adapters for display
                const adapters = moduleFiles.filter(f => f.toLowerCase().includes(ADAPTER_KEYWORD));
                const regular = moduleFiles.filter(f => !f.toLowerCase().includes(ADAPTER_KEYWORD));
                
                const folderInfo = {
                    name: folderName,
                    path: dirPath,
                    relativePath: relativePath,
                    moduleFiles: moduleFiles,
                    moduleCount: moduleFiles.length,
                    adapterCount: adapters.length,
                    regularCount: regular.length
                };

                foldersWithModules.push(folderInfo);

                console.log(chalk.green(`📁 Found ${folderInfo.regularCount} modules + ${folderInfo.adapterCount} adapters in: ${folderName}`));
                
                if (!options.quiet) {
                    regular.forEach(file => {
                        const version = file.match(/^(\d+(?:\.\d+)*)/);
                        console.log(chalk.gray(`   📦 ${file} ${version ? `(v${version[1]})` : ''}`));
                    });
                    adapters.forEach(file => {
                        const appType = detectAdapterType(file);
                        console.log(chalk.blue(`   🔌 ${file} (${appType})`));
                    });
                }
            }

            // Recursively scan subdirectories
            entries
                .filter(entry => entry.isDirectory())
                .filter(entry => !isExcludedFolder(entry.name))
                .forEach(entry => {
                    const subPath = path.join(dirPath, entry.name);
                    const subRelative = relativePath ? `${relativePath}/${entry.name}` : entry.name;
                    scanDirectory(subPath, subRelative);
                });

        } catch (error) {
            if (!options.quiet) {
                console.log(chalk.yellow(`⚠️  Cannot scan directory: ${dirPath} (${error.message})`));
            }
        }
    };

    scanDirectory(rootPath);

    console.log(chalk.cyan(`🏁 Discovery complete: ${foldersWithModules.length} folders with modules found`));
    return foldersWithModules;
}

// ============================================================================
// MAIN EXECUTION LOGIC
// ============================================================================

/**
 * Show enhanced header with adapter information
 */
function showHeader() {
    console.log(chalk.blue.bold('\n🔧 DocDom Module Auto-Assembler v4.1'));
    console.log(chalk.blue('   Smart Adapter Integration & Enhanced Assembly Naming'));
    console.log(chalk.gray('   Sequential dependency assembly with adapter-agnostic design\n'));
}

/**
 * Determine folders to process based on options
 * @returns {Array} Array of folder information objects
 */
function determineFoldersToProcess() {
    if (options.folder) {
        // Process specific folder
        const targetPath = path.resolve(options.folder);
        try {
            const folderInfo = {
                ...discoverModulesWithAdapterSupport(targetPath),
                path: targetPath
            };
            return [folderInfo];
        } catch (error) {
            console.error(chalk.red(`❌ Error processing folder ${options.folder}: ${error.message}`));
            return [];
        }
    } else {
        // Auto-discover project folders
        return discoverProjectFolders();
    }
}

/**
 * Main execution function with enhanced adapter support
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
            console.log(chalk.blue('💡 Example: node main-assembler.js -f DocDomV4.1 -a 1.15.1.2025.01.15_indesign-adapter.jsx'));
            process.exit(1);
        }

        // Determine folders to process
        const foldersToProcess = determineFoldersToProcess();

        if (foldersToProcess.length === 0) {
            console.log(chalk.yellow('⚠️  No folders with module files found.'));
            console.log(chalk.gray('💡 Create a folder with files matching pattern: #.#.#_filename.jsx'));
            return;
        }

        // Process each folder
        let totalSuccesses = 0;
        let totalFailures = 0;
        const results = [];

        foldersToProcess.forEach((folderInfo, index) => {
            console.log(chalk.cyan(`\n📂 Processing folder ${index + 1}/${foldersToProcess.length}: ${folderInfo.name}`));
            console.log(chalk.gray(`   Path: ${folderInfo.relativePath || folderInfo.path}`));
            console.log(chalk.gray(`   Modules: ${folderInfo.moduleCount} (${folderInfo.regularCount || folderInfo.moduleCount} regular${folderInfo.adapterCount ? ` + ${folderInfo.adapterCount} adapters` : ''})`));

            try {
                const assemblyOptions = {
                    validateFiles: !options.skipValidation,
                    noIncludes: options.noIncludes,
                    noAutoStart: options.noAutoStart,
                    verbose: options.verbose,
                    quiet: options.quiet
                };

                const result = assembleModules(folderInfo, assemblyOptions);

                if (result.success) {
                    totalSuccesses++;
                    console.log(chalk.green(`✅ Assembly successful:`));
                    console.log(chalk.white(`   📄 Assembled: ${result.assembledFile}`));
                    if (result.includesFile) {
                        console.log(chalk.white(`   📋 Includes: ${result.includesFile}`));
                    }
                    if (result.adapterIncluded) {
                        console.log(chalk.blue(`   🔌 Adapter: ${result.adapterType} integrated`));
                    }
                    console.log(chalk.gray(`   ⏱️  Duration: ${result.duration}ms`));
                } else {
                    totalFailures++;
                    console.log(chalk.red(`❌ Assembly failed: ${result.error}`));
                }

                results.push(result);

            } catch (error) {
                totalFailures++;
                console.error(chalk.red(`❌ Unexpected error: ${error.message}`));
                results.push({
                    success: false,
                    folderName: folderInfo.name,
                    error: error.message
                });
            }
        });

        // Summary
        console.log(chalk.cyan('\n📊 Assembly Summary:'));
        console.log(chalk.green(`   ✅ Successful: ${totalSuccesses}`));
        console.log(chalk.red(`   ❌ Failed: ${totalFailures}`));
        console.log(chalk.blue(`   📁 Total folders: ${foldersToProcess.length}`));

        // Show adapter integration summary
        const withAdapters = results.filter(r => r.success && r.adapterIncluded);
        if (withAdapters.length > 0) {
            console.log(chalk.blue(`   🔌 Adapter integrations: ${withAdapters.length}`));
            withAdapters.forEach(result => {
                console.log(chalk.gray(`      • ${result.folderName}: ${result.adapterType}`));
            });
        }

        process.exit(totalFailures > 0 ? 1 : 0);

    } catch (error) {
        console.error(chalk.red('💥 Fatal error:'), error.message);
        if (options.verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

// ============================================================================
// ERROR HANDLING AND HELP
// ============================================================================

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
  ${chalk.green('node main-assembler.js -f DocDomV4.1 -a 1.15.1.2025.01.15_indesign-adapter.jsx')}    # InDesign
  ${chalk.green('node main-assembler.js -f DocDomV4.1 -a 1.15.2.2025.01.20_photoshop-adapter.jsx')}   # Photoshop
  ${chalk.green('node main-assembler.js --verbose')}                                # Show detailed process

${chalk.cyan('Smart Assembly Features:')}
  🔌 Automatic adapter integration at correct dependency position
  📝 Smart filename generation with adapter type included
  🧠 Adapter-agnostic module design - any adapter works with any module
  📊 Enhanced assembly statistics and validation
  ⚡ Sequential dependency loading (1.1 → adapter → 1.2 → 2.x → etc.)

${chalk.cyan('Output Examples:')}
  ${chalk.gray('Without Adapter:')} DocDomV4.1_ASSEMBLED_20250627_143052.jsx
  ${chalk.gray('With InDesign:')}   DocDomV4.1_INDESIGN_ASSEMBLED_20250627_143052.jsx
  ${chalk.gray('With Photoshop:')}  DocDomV4.1_PHOTOSHOP_ASSEMBLED_20250627_143052.jsx

${chalk.cyan('Adapter Specification:')}
  • Version Pattern: 1.15.x.yyyy.mm.dd_[app]-adapter.jsx
  • Position: Inserted after foundation (1.1), before utilities (1.2)
  • Interface: All adapters implement identical 8-function contract
  • Dependencies: Adapters only depend on foundation module
  • Compatibility: Complete adapter swappability without code changes

${chalk.cyan('Supported Adobe Apps:')}
  • InDesign (1.15.1.2025.01.15_indesign-adapter.jsx)
  • Photoshop (1.15.2.2025.01.20_photoshop-adapter.jsx)
  • Illustrator (planned: 1.15.3.yyyy.mm.dd_illustrator-adapter.jsx)
  • After Effects (planned: 1.15.4.yyyy.mm.dd_aftereffects-adapter.jsx)
`);

// Show help if no arguments provided
if (process.argv.length === 2) {
    program.help();
}

// Execute main function
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    main();
}