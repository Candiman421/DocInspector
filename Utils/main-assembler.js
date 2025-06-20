#!/usr/bin/env node

// main-assembler.js
// Entry point for module assembly utility

import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { fileURLToPath } from 'url';
import { discoverProjectFolders, findTargetFolder } from './core/file-discovery.js';
import { assembleModules } from './core/module-assembler.js';
import { pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

// CLI Configuration
program
    .name('docdom-assembler')
    .description('DocDom Module Auto-Assembler - Sequential dependency assembly')
    .version('1.0.0')
    .option('-f, --folder <path>', 'Assemble modules in specific folder')
    .option('-v, --verbose', 'Show detailed assembly process')
    .option('-q, --quiet', 'Suppress non-essential output')
    .option('--skip-validation', 'Skip file validation during assembly')
    .option('--no-includes', 'Skip generation of includes-based file')
    .option('--no-auto-start', 'Disable auto-start interface in assembled files')
    .parse();

const options = program.opts();

/**
 * Main execution function
 */
 function main() {
    try {
        showHeader();

        // Determine folders to process
        const foldersToProcess =  determineFoldersToProcess();

        if (foldersToProcess.length === 0) {
            console.log(chalk.yellow('⚠️  No folders with module files found.'));
            console.log(chalk.blue('💡 Create folders with files matching pattern: 1.2_*.jsx, 1.2.1_*.jsx, etc.'));
            return;
        }

        // Process each folder
        const results = [];
        for (const folderInfo of foldersToProcess) {
            const result =  processFolder(folderInfo);
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
        console.log();
    }
}

/**
 * Determine which folders to process based on options
 */
 function determineFoldersToProcess() {
    if (options.folder) {
        return  processSingleFolder(options.folder);
    } else {
        return  discoverAllProjectFolders();
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
        const folderInfo = [findTargetFolder(targetPath)];
        return folderInfo;
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
        const foldersWithModules = discoverProjectFolders(projectRoot);

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
            verbose: options.verbose
        };

        const result =  assembleModules(folderInfo, assemblyOptions);

        if (!options.quiet) {
            if (result.success) {
                console.log(chalk.green(`✅ Assembly completed successfully`));
                console.log(chalk.blue(`📊 Processed ${result.moduleCount} modules`));
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
    console.log(chalk.green('• ✅ Auto-start document analysis interface'));
    console.log(chalk.green('• ✅ Both concatenated and include-based formats'));
    console.log(chalk.green('• ✅ Per-folder assembly with full isolation'));
    console.log(chalk.green('• ✅ Comprehensive build verification'));
    console.log(chalk.green('• ✅ Cross-platform document analysis support'));

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
  ${chalk.green('node main-assembler.js')}                    # Assemble all project folders
  ${chalk.green('node main-assembler.js -f ../DocDomV3.1')}   # Assemble specific folder
  ${chalk.green('node main-assembler.js --verbose')}          # Show detailed process
  ${chalk.green('node main-assembler.js --no-includes')}      # Skip includes file generation

Output Files:
  Each folder containing modules will get:
  • {FolderName}_ASSEMBLED_{timestamp}.jsx   (concatenated version)
  • {FolderName}_INCLUDES_{timestamp}.jsx    (include-based version)

Pattern Matching:
  Discovers files matching: 1.2_*.jsx, 1.2.1_*.jsx, 1.4.2.1_*.jsx
  Supports up to 4 decimal levels for version numbering

Architecture:
  • Sequential dependency system (1.1 → 1.2 → 2.1)
  • ES3/ExtendScript compatibility maintained
  • Auto-start interface integration
  • Build verification and error handling
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