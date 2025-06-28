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
import { pathToFileURL } from 'url';

// Import core functionality
import { assembleModules } from './core/module-assembler.js';
import { 
    findDocDomProjectRoot,
    resolveModuleFolderPath,
    discoverProjectFolders,
    findTargetFolder,
    analyzeFolderContext,
    getProjectRelativePath
} from './core/file-discovery.js';
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
// PROJECT ROOT DETECTION AND PATH UTILITIES
// ============================================================================

/**
 * Get project root with error handling
 * @returns {string} Project root path
 */
function getProjectRoot() {
    try {
        return findDocDomProjectRoot();
    } catch (error) {
        console.error(chalk.red('❌ Project root detection failed:'));
        console.error(chalk.gray(error.message));
        process.exit(1);
    }
}

/**
 * Resolve target folder path with project root awareness
 * @param {string} folderPath - Input folder path
 * @returns {string} Resolved absolute path
 */
function resolveTargetFolder(folderPath) {
    try {
        const projectRoot = getProjectRoot();
        return resolveModuleFolderPath(folderPath, projectRoot);
    } catch (error) {
        throw new Error(`Cannot resolve folder path "${folderPath}": ${error.message}`);
    }
}

// ============================================================================
// ENHANCED ADAPTER DETECTION AND MANAGEMENT
// ============================================================================

/**
 * Enhanced file discovery with adapter support using project root detection
 * @param {string} folderPath - Path to scan
 * @returns {Object} Folder information with filtered modules
 */
function discoverModulesWithAdapterSupport(folderPath) {
    try {
        const projectRoot = getProjectRoot();
        const resolvedPath = resolveModuleFolderPath(folderPath, projectRoot);
        
        // Use the enhanced findTargetFolder function
        const folderInfo = findTargetFolder(folderPath, projectRoot);
        
        if (!options.quiet) {
            console.log(chalk.gray(`📁 Scanning folder: ${folderInfo.name}`));
            console.log(chalk.gray(`   Project path: ${folderInfo.relativePath}`));
            console.log(chalk.gray(`   Files found: ${folderInfo.moduleCount}`));
        }

        // Handle adapter inclusion logic
        let finalModuleList = [...folderInfo.regularFiles]; // Start with regular modules
        const adapterFiles = folderInfo.adapterFiles;

        if (options.adapter) {
            // Specific adapter requested
            if (adapterFiles.includes(options.adapter)) {
                finalModuleList.push(options.adapter);
                if (!options.quiet) {
                    console.log(chalk.blue(`🔌 Including specific adapter: ${options.adapter}`));
                }
            } else {
                throw new Error(`Requested adapter not found: ${options.adapter}\nAvailable adapters: ${adapterFiles.join(', ') || 'none'}`);
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
            name: folderInfo.name,
            path: folderInfo.path,
            relativePath: folderInfo.relativePath,
            projectRoot: projectRoot,
            moduleFiles: finalModuleList,
            moduleCount: finalModuleList.length,
            adapterFiles: adapterFiles,
            regularModules: folderInfo.regularFiles,
            hasAdapter: finalModuleList.length > folderInfo.regularFiles.length,
            adapterCount: adapterFiles.length,
            regularCount: folderInfo.regularFiles.length
        };

    } catch (error) {
        throw new Error(`Module discovery failed for "${folderPath}": ${error.message}`);
    }
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
    try {
        const projectRoot = getProjectRoot();
        const resolvedPath = resolveModuleFolderPath(folderPath, projectRoot);
        
        if (!fs.existsSync(resolvedPath)) {
            console.log(chalk.red(`❌ Folder does not exist: ${folderPath}`));
            console.log(chalk.gray(`   Resolved path: ${resolvedPath}`));
            return;
        }

        const folderInfo = findTargetFolder(folderPath, projectRoot);
        const adapterFiles = folderInfo.adapterFiles;

        console.log(chalk.cyan(`🔌 Available Adapters in ${folderInfo.name}:`));
        console.log(chalk.gray(`   Path: ${folderInfo.relativePath}`));
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
            console.log(chalk.green(`      💻 Command: node main-assembler.js -f ${folderInfo.name} -a ${adapter}`));
            
            // Show expected output filename
            const adapterTypeUpper = appType ? appType.toUpperCase().replace(/\s+/g, '') : 'ADAPTER';
            const expectedFilename = `${folderInfo.name}_${adapterTypeUpper}_ASSEMBLED_[timestamp].jsx`;
            console.log(chalk.cyan(`      📄 Output: ${expectedFilename}`));
            console.log();
        });
        
        console.log(chalk.cyan('💡 Assembly Tips:'));
        console.log(chalk.gray('   • Assembled files include adapter type in filename automatically'));
        console.log(chalk.gray('   • Adapters are inserted at correct dependency position (after 1.1, before 1.20)'));
        console.log(chalk.gray('   • All modules remain adapter-agnostic and work with any adapter'));

    } catch (error) {
        console.error(chalk.red(`❌ Failed to list adapters: ${error.message}`));
    }
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
    console.log(chalk.gray('   Sequential dependency assembly with adapter-agnostic design'));
    
    try {
        const projectRoot = getProjectRoot();
        const projectRelative = getProjectRelativePath(process.cwd(), projectRoot);
        console.log(chalk.gray(`   Working from: ${projectRelative || 'project root'}\n`));
    } catch (e) {
        console.log(chalk.gray('   Project root detection: failed\n'));
    }
}

/**
 * Determine folders to process based on options with project root awareness
 * @returns {Array} Array of folder information objects
 */
function determineFoldersToProcess() {
    try {
        const projectRoot = getProjectRoot();
        
        if (options.folder) {
            // Process specific folder
            try {
                const folderInfo = discoverModulesWithAdapterSupport(options.folder);
                return [folderInfo];
            } catch (error) {
                console.error(chalk.red(`❌ Error processing folder ${options.folder}: ${error.message}`));
                return [];
            }
        } else {
            // Auto-discover project folders using enhanced discovery
            console.log(chalk.blue('🔍 Auto-discovering module folders in project...'));
            return discoverProjectFolders(projectRoot);
        }

    } catch (error) {
        console.error(chalk.red(`❌ Failed to determine folders to process: ${error.message}`));
        return [];
    }
}

/**
 * Main execution function with enhanced adapter support and project root detection
 */
function main() {
    try {
        showHeader();

        // Handle list adapters command
        if (options.listAdapters) {
            const folderPath = options.folder || 'DocDomV4.1'; // Default to DocDomV4.1 if no folder specified
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
            console.log(chalk.gray('💡 Expected structure:'));
            console.log(chalk.gray('   ProjectRoot/DocDomV4.1/*.jsx (module files)'));
            console.log(chalk.gray('   Files must match pattern: #.#.#_filename.jsx'));
            
            try {
                const projectRoot = getProjectRoot();
                console.log(chalk.gray(`   Project root: ${projectRoot}`));
                
                // Show what folders exist
                const entries = fs.readdirSync(projectRoot);
                const folders = entries.filter(entry => {
                    const fullPath = path.join(projectRoot, entry);
                    return fs.statSync(fullPath).isDirectory() && entry !== 'Utils' && !entry.startsWith('.');
                });
                
                if (folders.length > 0) {
                    console.log(chalk.gray(`   Available folders: ${folders.join(', ')}`));
                }
            } catch (e) {
                console.log(chalk.gray('   (Could not analyze project structure)'));
            }
            
            return;
        }

        // Process each folder
        let totalSuccesses = 0;
        let totalFailures = 0;
        const results = [];

        foldersToProcess.forEach((folderInfo, index) => {
            console.log(chalk.cyan(`\n📂 Processing folder ${index + 1}/${foldersToProcess.length}: ${folderInfo.name}`));
            console.log(chalk.gray(`   Path: ${folderInfo.relativePath || folderInfo.projectRelativePath || path.relative(process.cwd(), folderInfo.path)}`));
            console.log(chalk.gray(`   Modules: ${folderInfo.moduleCount || folderInfo.totalModules} (${folderInfo.regularCount || 0} regular${folderInfo.adapterCount ? ` + ${folderInfo.adapterCount} adapters` : ''})`));

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
                if (options.verbose) {
                    console.error(chalk.gray(error.stack));
                }
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

        // Show output file locations
        const successful = results.filter(r => r.success);
        if (successful.length > 0) {
            console.log(chalk.cyan('\n📄 Generated Files:'));
            successful.forEach(result => {
                if (result.assembledFile) {
                    const outputPath = path.join(result.folderName, result.assembledFile);
                    console.log(chalk.white(`   ${outputPath}`));
                }
            });
        }

        process.exit(totalFailures > 0 ? 1 : 0);

    } catch (error) {
        console.error(chalk.red('💥 Fatal error:'), error.message);
        if (options.verbose) {
            console.error(chalk.gray(error.stack));
        }
        console.error(chalk.gray('\n💡 Troubleshooting:'));
        console.error(chalk.gray('   1. Ensure you are running from within the DocDom project'));
        console.error(chalk.gray('   2. Verify the project structure has Utils/ and module folders'));
        console.error(chalk.gray('   3. Check that package.json exists in project root'));
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

// Enhanced help text with project root awareness
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
  ⚡ Sequential dependency loading (1.1 → adapter → 1.20 → 2.x → etc.)
  🎯 Dynamic project root detection - works from any project directory

${chalk.cyan('Project Structure:')}
  ${chalk.gray('DocDom/')}                   ${chalk.gray('← Project root (auto-detected)')}
  ${chalk.gray('├── package.json')}          ${chalk.gray('← Project metadata')}
  ${chalk.gray('├── DocDomV4.1/')}           ${chalk.gray('← Module folder')}
  ${chalk.gray('│   ├── 1.1.0.0_*.jsx')}    ${chalk.gray('← Foundation modules')}
  ${chalk.gray('│   ├── 1.15.*_*-adapter.jsx')} ${chalk.gray('← App adapters')}
  ${chalk.gray('│   └── *.*.0.0_*.jsx')}    ${chalk.gray('← Other modules')}
  ${chalk.gray('└── Utils/')}               ${chalk.gray('← Analysis tools (current location)')}

${chalk.cyan('Output Examples:')}
  ${chalk.gray('Without Adapter:')} DocDomV4.1_ASSEMBLED_20250627_143052.jsx
  ${chalk.gray('With InDesign:')}   DocDomV4.1_INDESIGN_ASSEMBLED_20250627_143052.jsx
  ${chalk.gray('With Photoshop:')}  DocDomV4.1_PHOTOSHOP_ASSEMBLED_20250627_143052.jsx

${chalk.cyan('Adapter Specification:')}
  • Version Pattern: 1.15.x.yyyy.mm.dd_[app]-adapter.jsx
  • Position: Inserted after foundation (1.1), before utilities (1.20)
  • Interface: All adapters implement identical 8-function contract
  • Dependencies: Adapters only depend on foundation module
  • Compatibility: Complete adapter swappability without code changes

${chalk.cyan('Supported Adobe Apps:')}
  • InDesign (1.15.1.2025.01.15_indesign-adapter.jsx)
  • Photoshop (1.15.2.2025.01.20_photoshop-adapter.jsx)
  • Illustrator (planned: 1.15.3.yyyy.mm.dd_illustrator-adapter.jsx)
  • After Effects (planned: 1.15.4.yyyy.mm.dd_aftereffects-adapter.jsx)

${chalk.cyan('Working Directory Support:')}
  • Runs from Utils/ directory (where this tool is located)
  • Runs from project root (DocDom/)
  • Automatically detects project structure
  • Resolves module folder paths dynamically
`);

// Show help if no arguments provided
if (process.argv.length === 2) {
    program.help();
}

// Execute main function
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    main();
}