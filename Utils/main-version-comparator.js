#!/usr/bin/env node

// main-version-comparator.js
// Entry point for version comparison analysis

import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { fileURLToPath } from 'url';
import { discoverFolders } from './core/file-discovery.js';
import { analyzeIndividualModule } from './analyzers/individual-module-analyzer.js';
import { analyzeVersionComparison } from './analyzers/version-comparator.js';
import { generateVersionReport } from './reporters/version-report.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

// CLI Configuration
program
    .name('docdom-version-comparator')
    .description('DocDom Module Version Comparator - Evolution analysis')
    .version('1.0.0')
    .option('-f, --folder <path>', 'Compare versions in specific folder')
    .option('-v, --verbose', 'Show detailed comparison process')
    .option('-q, --quiet', 'Suppress non-essential output')
    .option('--include-code', 'Include code samples in comparison reports')
    .option('--similarity-threshold <number>', 'Set similarity threshold for internal analysis (default: 85)', '85')
    .option('--min-versions <number>', 'Minimum versions required for comparison (default: 2)', '2')
    .parse();

const options = program.opts();

/**
 * Main execution function
 */
async function main() {
    try {
        showHeader();

        // Determine folders to process
        const foldersToProcess = await determineFoldersToProcess();

        if (foldersToProcess.length === 0) {
            console.log(chalk.yellow('⚠️  No folders with version files found.'));
            console.log(chalk.blue('💡 Create folders with multiple versions: 1.2_module_v1.jsx, 1.2_module_v2.jsx, etc.'));
            return;
        }

        // Process each folder for version comparison
        const allResults = [];
        for (const folderInfo of foldersToProcess) {
            const result = await processVersionComparison(folderInfo);
            allResults.push(result);
        }

        // Show summary
        showComparisonSummary(allResults);

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
        console.log(chalk.cyan('🔍 DocDom Version Comparator - Evolution Analysis'));
        console.log(chalk.cyan('================================================='));
        console.log();
    }
}

/**
 * Determine which folders to process based on options
 */
async function determineFoldersToProcess() {
    if (options.folder) {
        return await processSingleFolder(options.folder);
    } else {
        return await discoverAllProjectFolders();
    }
}

/**
 * Process single folder specified by user
 */
async function processSingleFolder(folderPath) {
    const targetPath = path.resolve(folderPath);

    if (!options.quiet) {
        console.log(chalk.blue(`📁 Comparing versions in folder: ${folderPath}`));
    }

    try {
        const folderInfo = await discoverFolders([targetPath]);
        return folderInfo.filter(folder => hasVersionFiles(folder));
    } catch (error) {
        throw new Error(`Folder processing failed: ${error.message}`);
    }
}

/**
 * Discover all project folders with version files
 */
async function discoverAllProjectFolders() {
    if (!options.quiet) {
        console.log(chalk.blue('🔍 Scanning project for folders with version files...'));
        console.log(chalk.gray('='.repeat(50)));
    }

    try {
        const projectRoot = path.resolve(__dirname, '..');
        const allFolders = await discoverFolders([projectRoot]);
        const foldersWithVersions = allFolders.filter(folder => hasVersionFiles(folder));

        if (!options.quiet && foldersWithVersions.length > 0) {
            console.log(chalk.green(`\n🎯 Discovery complete: ${foldersWithVersions.length} folders with version files found`));
        }

        return foldersWithVersions;
    } catch (error) {
        throw new Error(`Project discovery failed: ${error.message}`);
    }
}

/**
 * Check if folder has multiple versions of same module
 */
function hasVersionFiles(folderInfo) {
    const versionGroups = groupFilesByModule(folderInfo.moduleFiles);
    const groupsWithMultipleVersions = Object.values(versionGroups).filter(group => group.length >= parseInt(options.minVersions));
    return groupsWithMultipleVersions.length > 0;
}

/**
 * Group files by base module name
 */
function groupFilesByModule(files) {
    const groups = {};

    files.forEach(filename => {
        const baseName = extractModuleBaseName(filename);
        if (!groups[baseName]) {
            groups[baseName] = [];
        }
        groups[baseName].push(filename);
    });

    return groups;
}

/**
 * Extract base module name from versioned filename
 */
function extractModuleBaseName(filename) {
    // Handle patterns like:
    // "1.2_safety-utilities_v2.jsx" -> "1.2_safety-utilities"
    // "1.2_safety-utilities_old.jsx" -> "1.2_safety-utilities"
    // "1.2_safety-utilities_2024.jsx" -> "1.2_safety-utilities"
    const match = filename.match(/^(\d+(?:\.\d+)*_[^_]+)/);
    return match ? match[1] : filename.replace(/\.jsx?$/, '');
}

/**
 * Process version comparison for a folder
 */
async function processVersionComparison(folderInfo) {
    if (!options.quiet) {
        console.log(chalk.yellow(`\n🔍 Comparing versions in: ${folderInfo.name}`));
        console.log(chalk.gray('='.repeat(40)));
    }

    try {
        const analysisOptions = {
            includeCode: options.includeCode,
            similarityThreshold: parseInt(options.similarityThreshold),
            verbose: options.verbose || !options.quiet,
            analysisType: 'version_comparison'
        };

        // Group files by module
        const versionGroups = groupFilesByModule(folderInfo.moduleFiles);
        const comparableGroups = Object.entries(versionGroups).filter(([, group]) => group.length >= parseInt(options.minVersions));

        if (comparableGroups.length === 0) {
            return {
                success: false,
                folderName: folderInfo.name,
                error: `No module groups with ${options.minVersions}+ versions found`,
                moduleGroups: 0
            };
        }

        if (!options.quiet) {
            console.log(chalk.blue(`   📊 Found ${comparableGroups.length} module group(s) with multiple versions`));
        }

        const comparisonResults = [];

        // Process each module group
        for (const [moduleName, versionFiles] of comparableGroups) {
            if (!options.quiet) {
                console.log(chalk.blue(`   📋 Analyzing module: ${moduleName} (${versionFiles.length} versions)`));
            }

            try {
                // Analyze each version individually
                const moduleVersions = [];
                for (const versionFile of versionFiles) {
                    if (options.verbose) {
                        console.log(chalk.gray(`      📄 Analyzing: ${versionFile}`));
                    }

                    const versionAnalysis = await analyzeIndividualModule(
                        path.join(folderInfo.path, versionFile),
                        analysisOptions
                    );
                    moduleVersions.push(versionAnalysis);
                }

                // Perform version comparison analysis
                if (options.verbose) {
                    console.log(chalk.gray(`      🔍 Comparing ${moduleVersions.length} versions...`));
                }

                const comparisonAnalysis = await analyzeVersionComparison(moduleVersions, analysisOptions);

                // Generate comparison report
                const reportFile = await generateVersionReport(
                    moduleVersions,
                    comparisonAnalysis,
                    folderInfo.path
                );

                comparisonResults.push({
                    moduleName,
                    versionCount: versionFiles.length,
                    reportFile,
                    success: true,
                    summary: extractComparisonSummary(comparisonAnalysis, moduleVersions)
                });

                if (!options.quiet) {
                    console.log(chalk.green(`      📄 Report: ${reportFile}`));
                    if (comparisonAnalysis.breaking_changes?.total > 0) {
                        console.log(chalk.yellow(`      ⚠️  ${comparisonAnalysis.breaking_changes.total} breaking changes detected`));
                    }
                }

            } catch (error) {
                console.error(chalk.red(`      ❌ Comparison failed: ${error.message}`));
                comparisonResults.push({
                    moduleName,
                    versionCount: versionFiles.length,
                    success: false,
                    error: error.message
                });
            }
        }

        // Compile folder results
        const successfulComparisons = comparisonResults.filter(r => r.success);
        const result = {
            success: true,
            folderName: folderInfo.name,
            moduleGroups: comparableGroups.length,
            successfulComparisons: successfulComparisons.length,
            failedComparisons: comparisonResults.length - successfulComparisons.length,
            totalVersionsAnalyzed: comparisonResults.reduce((sum, r) => sum + r.versionCount, 0),
            reportsGenerated: successfulComparisons.length,
            comparisonResults: comparisonResults
        };

        if (!options.quiet) {
            showFolderComparisonSummary(result);
        }

        return result;

    } catch (error) {
        const errorResult = {
            success: false,
            error: error.message,
            folderName: folderInfo.name,
            moduleGroups: 0
        };

        console.error(chalk.red(`❌ Error comparing versions in ${folderInfo.name}: ${error.message}`));
        return errorResult;
    }
}

/**
 * Extract comparison summary from analysis
 */
function extractComparisonSummary(comparisonAnalysis, moduleVersions) {
    const oldest = moduleVersions[0];
    const newest = moduleVersions[moduleVersions.length - 1];

    return {
        versions_compared: moduleVersions.length,
        line_count_change: newest.line_count - oldest.line_count,
        function_count_change: newest.function_count - oldest.function_count,
        health_score_change: newest.health_score - oldest.health_score,
        breaking_changes: comparisonAnalysis.breaking_changes?.total || 0,
        quality_trend: newest.health_score > oldest.health_score ? 'improving' :
            newest.health_score < oldest.health_score ? 'declining' : 'stable'
    };
}

/**
 * Show summary for individual folder comparison
 */
function showFolderComparisonSummary(result) {
    console.log(chalk.green(`✅ Version comparison completed`));
    console.log(chalk.blue(`📊 Module groups: ${result.successfulComparisons}/${result.moduleGroups} successful`));
    console.log(chalk.blue(`📄 Reports generated: ${result.reportsGenerated}`));
    console.log(chalk.blue(`📋 Total versions analyzed: ${result.totalVersionsAnalyzed}`));

    // Show module-specific summaries
    const successful = result.comparisonResults.filter(r => r.success);
    if (successful.length > 0 && !options.quiet) {
        successful.forEach(comp => {
            const summary = comp.summary;
            const trendColor = summary.quality_trend === 'improving' ? 'green' :
                summary.quality_trend === 'declining' ? 'red' : 'yellow';

            console.log(chalk.white(`   📦 ${comp.moduleName}: ${comp.versionCount} versions, `) +
                chalk[trendColor](`quality ${summary.quality_trend}`));

            if (summary.breaking_changes > 0) {
                console.log(chalk.red(`      ⚠️  ${summary.breaking_changes} breaking changes`));
            }
        });
    }
}

/**
 * Show comparison summary for all processed folders
 */
function showComparisonSummary(results) {
    if (options.quiet) return;

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(chalk.green('\n🎉 Version Comparison Complete!'));
    console.log(chalk.gray('='.repeat(50)));

    // Statistics
    console.log(chalk.blue('\n📊 Comparison Statistics:'));
    console.log(chalk.white(`• Folders processed: ${results.length}`));
    console.log(chalk.green(`• Successful comparisons: ${successful.length}`));
    if (failed.length > 0) {
        console.log(chalk.red(`• Failed comparisons: ${failed.length}`));
    }
    console.log(chalk.blue(`• Module groups compared: ${successful.reduce((sum, r) => sum + r.moduleGroups, 0)}`));
    console.log(chalk.blue(`• Total versions analyzed: ${successful.reduce((sum, r) => sum + r.totalVersionsAnalyzed, 0)}`));
    console.log(chalk.blue(`• Reports generated: ${successful.reduce((sum, r) => sum + r.reportsGenerated, 0)}`));

    // Evolution insights
    if (successful.length > 0) {
        console.log(chalk.cyan('\n📈 Evolution Insights:'));
        successful.forEach(result => {
            console.log(chalk.white(`   📁 ${result.folderName}: ${result.successfulComparisons} module group(s)`));

            const successfulComps = result.comparisonResults.filter(r => r.success);
            successfulComps.forEach(comp => {
                const summary = comp.summary;
                const trendIcon = summary.quality_trend === 'improving' ? '📈' :
                    summary.quality_trend === 'declining' ? '📉' : '➡️';

                console.log(chalk.gray(`      ${trendIcon} ${comp.moduleName}: `) +
                    chalk.blue(`${summary.versions_compared} versions, ${summary.line_count_change > 0 ? '+' : ''}${summary.line_count_change} lines`));

                if (summary.breaking_changes > 0) {
                    console.log(chalk.red(`         ⚠️  ${summary.breaking_changes} breaking changes`));
                }
            });
        });
    }

    // Failed comparisons
    if (failed.length > 0) {
        console.log(chalk.red('\n❌ Failed Comparisons:'));
        failed.forEach(result => {
            console.log(chalk.red(`   📁 ${result.folderName}: ${result.error}`));
        });
    }

    // Generated reports info
    console.log(chalk.cyan('\n📝 Generated Reports:'));
    console.log(chalk.white('Each comparison generates:'));
    console.log(chalk.blue('• ~version-comparison-{module}-{timestamp}.yaml'));

    // Analysis focus
    console.log(chalk.cyan('\n🔍 Version Comparison Analysis:'));
    console.log(chalk.green('• ✅ Function additions, removals, and modifications'));
    console.log(chalk.green('• ✅ Breaking change detection and impact analysis'));
    console.log(chalk.green('• ✅ Quality evolution tracking (health scores, compliance)'));
    console.log(chalk.green('• ✅ Code diff samples with change analysis'));
    console.log(chalk.green('• ✅ Migration recommendations for breaking changes'));
    console.log(chalk.green('• ✅ Line count and complexity evolution'));
    if (options.includeCode) {
        console.log(chalk.green('• ✅ Detailed code samples for modified functions'));
    }

    // Usage recommendations
    console.log(chalk.cyan('\n💡 Usage Recommendations:'));
    console.log(chalk.white('• Use version comparison to understand module evolution'));
    console.log(chalk.white('• Review breaking changes before deploying new versions'));
    console.log(chalk.white('• Track quality trends to identify regression patterns'));
    console.log(chalk.white('• Use migration guides for safe version upgrades'));
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
  ${chalk.green('node main-version-comparator.js')}                    # Compare all project folders
  ${chalk.green('node main-version-comparator.js -f ../Versions')}     # Compare specific folder
  ${chalk.green('node main-version-comparator.js --include-code')}     # Include code samples
  ${chalk.green('node main-version-comparator.js --min-versions 3')}   # Require 3+ versions

Version Detection:
  Automatically groups files by module base name:
  • 1.2_safety-utilities_v1.jsx
  • 1.2_safety-utilities_v2.jsx    } Same module group
  • 1.2_safety-utilities_old.jsx
  
  • 2.1_dom-enumerator_new.jsx
  • 2.1_dom-enumerator_old.jsx     } Different module group

Analysis Focus:
  • Evolution tracking (functions added/removed/modified)
  • Breaking change detection and impact assessment
  • Quality trend analysis (health scores, ES3 compliance)
  • Code diff generation with change explanations
  • Migration recommendations for version upgrades

Report Content:
  • Function change inventory with signatures
  • Breaking change analysis with mitigation strategies
  • Quality evolution charts and regression detection
  • Code diff samples for modified functions
  • Actionable recommendations for safe upgrades
`);

// Show help if no arguments provided
if (process.argv.length === 2) {
    program.help();
}

// Execute main function
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}