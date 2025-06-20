#!/usr/bin/env node

// main-system-analyzer.js
// Entry point for system-wide module analysis
console.log("=== SCRIPT STARTING ===");

import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { fileURLToPath } from 'url';
import { discoverProjectFolders, findTargetFolder } from './core/file-discovery.js';
import { analyzeIndividualModule } from './analyzers/individual-module-analyzer.js';
import { analyzeModuleSystem } from './analyzers/system-analyzer.js';
import { generateIndividualModuleReport } from './reporters/individual-report.js';
import { generateSystemReport } from './reporters/system-report.js';
import { pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

// CLI Configuration
program
    .name('docdom-system-analyzer')
    .description('DocDom Module System Analyzer - Sequential dependency analysis')
    .version('1.0.0')
    .option('-f, --folder <path>', 'Analyze modules in specific folder')
    .option('-v, --verbose', 'Show detailed analysis process')
    .option('-q, --quiet', 'Suppress non-essential output')
    .option('--individual-only', 'Generate only individual module reports')
    .option('--system-only', 'Generate only system aggregate report')
    .option('--skip-similarity', 'Skip function similarity analysis')
    .option('--similarity-threshold <number>', 'Set similarity threshold (default: 75)', '75')
    .parse();

const options = program.opts();

/**
 * Main execution function
 */
function main() {
    console.log("=== INSIDE MAIN FUNCTION ===");
    try {
        showHeader();

        // Determine folders to process
        const foldersToProcess = determineFoldersToProcess();

        if (foldersToProcess.length === 0) {
            console.log(chalk.yellow('⚠️  No folders with module files found.'));
            console.log(chalk.blue('💡 Create folders with files matching pattern: 1.2_*.jsx, 1.2.1_*.jsx, etc.'));
            return;
        }

        // Process each folder
        const allResults = [];
        for (const folderInfo of foldersToProcess) {
            const result = processSystemAnalysis(folderInfo);
            allResults.push(result);
        }

        // Show summary
        showAnalysisSummary(allResults);

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
        console.log(chalk.cyan('🔬 DocDom System Analyzer - Sequential Dependency Analysis'));
        console.log(chalk.cyan('==========================================================='));
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
        console.log(chalk.blue(`📁 Analyzing specific folder: ${folderPath}`));
    }

    try {
        const folderInfo = findTargetFolder(targetPath);
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
 * Process system analysis for a folder
 */
function processSystemAnalysis(folderInfo) {
    if (!options.quiet) {
        console.log(chalk.yellow(`\n🔬 Analyzing system in: ${folderInfo.name}`));
        console.log(chalk.gray('='.repeat(40)));
    }

    try {
        const analysisOptions = {
            skipSimilarity: options.skipSimilarity,
            similarityThreshold: parseInt(options.similarityThreshold),
            verbose: options.verbose || !options.quiet,
            generateIndividual: !options.systemOnly,
            generateSystem: !options.individualOnly
        };

        // Step 1: Analyze individual modules
        const moduleAnalyses = [];
        if (analysisOptions.generateIndividual) {
            for (const moduleFile of folderInfo.moduleFiles) {
                if (options.verbose) {
                    console.log(chalk.blue(`   📋 Analyzing: ${moduleFile}`));
                }

                try {
                    const moduleAnalysis = analyzeIndividualModule(
                        path.join(folderInfo.path, moduleFile),
                        analysisOptions
                    );
                    moduleAnalyses.push(moduleAnalysis);

                    // Generate individual report
                    const reportFile = generateIndividualModuleReport(
                        moduleAnalysis,
                        folderInfo.path
                    );

                    if (options.verbose) {
                        console.log(chalk.green(`      📄 Report: ${reportFile.reportPath || reportFile}`));
                    }

                } catch (error) {
                    console.error(chalk.red(`      ❌ Analysis failed: ${error.message}`));
                    moduleAnalyses.push({
                        success: false,
                        filename: moduleFile,
                        error: error.message
                    });
                }
            }
        }

        // Step 2: System-wide analysis
        let systemAnalysis = null;
        let systemReportFile = null;

        if (analysisOptions.generateSystem && moduleAnalyses.length > 0) {
            if (!options.quiet) {
                console.log(chalk.blue(`   🔍 Performing system-wide analysis...`));
            }

            try {
                systemAnalysis = analyzeModuleSystem(folderInfo, analysisOptions);

                // Generate system report
                systemReportFile = generateSystemReport(
                    systemAnalysis,
                    systemAnalysis,
                    folderInfo.path
                );

                if (!options.quiet) {
                    console.log(chalk.green(`   📊 System report: ${systemReportFile}`));
                }

            } catch (error) {
                console.error(chalk.red(`   ❌ System analysis failed: ${error.message}`));
            }
        }

        // Compile results
        const result = {
            success: true,
            folderName: folderInfo.name,
            moduleCount: folderInfo.moduleFiles.length,
            successfulModules: moduleAnalyses.filter(m => m.success).length,
            failedModules: moduleAnalyses.filter(m => !m.success).length,
            individualReports: moduleAnalyses.filter(m => m.success).length,
            systemReport: systemReportFile ? 1 : 0,
            healthSummary: calculateFolderHealthSummary(moduleAnalyses),
            systemIssues: extractSystemIssues(systemAnalysis)
        };

        if (!options.quiet) {
            showFolderSummary(result);
        }

        return result;

    } catch (error) {
        const errorResult = {
            success: false,
            error: error.message,
            folderName: folderInfo.name,
            moduleCount: folderInfo.moduleFiles.length
        };

        console.error(chalk.red(`❌ Error analyzing ${folderInfo.name}: ${error.message}`));
        return errorResult;
    }
}

/**
 * Calculate folder health summary
 */
function calculateFolderHealthSummary(moduleAnalyses) {
    const successful = moduleAnalyses.filter(m => m.success);
    if (successful.length === 0) return null;

    const totalScore = successful.reduce((sum, m) => sum + (m.health_score || 0), 0);
    const avgScore = Math.round(totalScore / successful.length);
    const criticalIssues = successful.reduce((sum, m) => sum + (m.critical_violations?.length || 0), 0);
    const es3Compliant = successful.filter(m => m.es3_compliant).length;

    return {
        average_health_score: avgScore,
        overall_grade: calculateGrade(avgScore),
        modules_es3_compliant: es3Compliant,
        total_critical_issues: criticalIssues,
        perfect_registration: successful.filter(m => m.registration_accuracy === 100).length
    };
}

/**
 * Extract system-level issues
 */
function extractSystemIssues(systemAnalysis) {
    if (!systemAnalysis) return null;

    return {
        dependency_violations: (systemAnalysis.dependencies?.violations || []).length,
        cross_module_collisions: (systemAnalysis.cross_module_analysis?.name_collisions || []).length,
        circular_dependencies: (systemAnalysis.dependencies?.circular_deps || []).length,
        missing_dependencies: (systemAnalysis.dependencies?.missing_deps || []).length
    };
}

/**
 * Show summary for individual folder
 */
function showFolderSummary(result) {
    console.log(chalk.green(`✅ Analysis completed successfully`));
    console.log(chalk.blue(`📊 Modules: ${result.successfulModules}/${result.moduleCount} successful`));

    if (result.healthSummary) {
        console.log(chalk.blue(`🎯 Health: ${result.healthSummary.average_health_score} (${result.healthSummary.overall_grade})`));
        console.log(chalk.blue(`📋 Reports: ${result.individualReports} individual + ${result.systemReport} system`));

        if (result.healthSummary.total_critical_issues > 0) {
            console.log(chalk.yellow(`⚠️  Critical issues: ${result.healthSummary.total_critical_issues}`));
        }
    }

    if (result.systemIssues) {
        const issues = result.systemIssues;
        if (issues.dependency_violations > 0) {
            console.log(chalk.red(`🔗 Dependency violations: ${issues.dependency_violations}`));
        }
        if (issues.cross_module_collisions > 0) {
            console.log(chalk.yellow(`⚠️  Function name collisions: ${issues.cross_module_collisions}`));
        }
    }
}

/**
 * Show analysis summary for all processed folders
 */
function showAnalysisSummary(results) {
    if (options.quiet) return;

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(chalk.green('\n🎉 System Analysis Complete!'));
    console.log(chalk.gray('='.repeat(50)));

    // Statistics
    console.log(chalk.blue('\n📊 Analysis Statistics:'));
    console.log(chalk.white(`• Folders analyzed: ${results.length}`));
    console.log(chalk.green(`• Successful analyses: ${successful.length}`));
    if (failed.length > 0) {
        console.log(chalk.red(`• Failed analyses: ${failed.length}`));
    }
    console.log(chalk.blue(`• Total modules analyzed: ${successful.reduce((sum, r) => sum + r.moduleCount, 0)}`));
    console.log(chalk.blue(`• Individual reports: ${successful.reduce((sum, r) => sum + r.individualReports, 0)}`));
    console.log(chalk.blue(`• System reports: ${successful.reduce((sum, r) => sum + r.systemReport, 0)}`));

    // Health overview
    if (successful.length > 0) {
        console.log(chalk.cyan('\n🏥 Health Overview:'));
        successful.forEach(result => {
            if (result.healthSummary) {
                const health = result.healthSummary;
                const statusColor = health.overall_grade.startsWith('A') ? 'green' :
                    health.overall_grade.startsWith('B') ? 'yellow' : 'red';

                console.log(chalk.white(`   📁 ${result.folderName}: `) +
                    chalk[statusColor](`${health.average_health_score} (${health.overall_grade})`));

                if (health.total_critical_issues > 0) {
                    console.log(chalk.red(`      ⚠️  ${health.total_critical_issues} critical issues`));
                }
            }
        });
    }

    // Failed analyses
    if (failed.length > 0) {
        console.log(chalk.red('\n❌ Failed Analyses:'));
        failed.forEach(result => {
            console.log(chalk.red(`   📁 ${result.folderName}: ${result.error}`));
        });
    }

    // Generated reports info
    console.log(chalk.cyan('\n📝 Generated Reports:'));
    console.log(chalk.white('Each analyzed folder now contains:'));
    console.log(chalk.blue('• ~module-{filename}-analysis-{timestamp}.yaml    (individual module analysis)'));
    console.log(chalk.blue('• ~system-aggregate-analysis-{timestamp}.yaml     (system-wide analysis)'));

    // Analysis categories
    console.log(chalk.cyan('\n🔍 Analysis Categories:'));
    console.log(chalk.green('• ✅ ES3 Compatibility & Reserved Word Safety'));
    console.log(chalk.green('• ✅ Function Registration Accuracy'));
    console.log(chalk.green('• ✅ Sequential Dependency Validation'));
    console.log(chalk.green('• ✅ Cross-Module Name Collision Detection'));
    console.log(chalk.green('• ✅ Internal Function Dependency Analysis'));
    console.log(chalk.green('• ✅ Logging Coverage & Modernization'));
    console.log(chalk.green('• ✅ Code Quality & Architecture Compliance'));
    if (!options.skipSimilarity) {
        console.log(chalk.green('• ✅ Function Similarity & Consolidation Opportunities'));
    }

    // Health scoring guide
    console.log(chalk.cyan('\n🎯 Health Score Guide:'));
    console.log(chalk.green('• A+ (950-1000): Exemplary architecture compliance'));
    console.log(chalk.green('• A  (900-949):  Excellent with minor issues'));
    console.log(chalk.yellow('• B+ (850-899):  Good compliance, some improvements needed'));
    console.log(chalk.yellow('• B  (800-849):  Acceptable with notable issues'));
    console.log(chalk.yellow('• C+ (750-799):  Below standard, requires attention'));
    console.log(chalk.red('• C  (700-749):  Poor compliance, needs refactoring'));
    console.log(chalk.red('• D  (600-699):  Critical issues present'));
    console.log(chalk.red('• F  (<600):     Unacceptable, major problems'));
}

/**
 * Calculate grade from score
 */
function calculateGrade(score) {
    if (score >= 950) return 'A+';
    if (score >= 900) return 'A';
    if (score >= 850) return 'B+';
    if (score >= 800) return 'B';
    if (score >= 750) return 'C+';
    if (score >= 700) return 'C';
    if (score >= 600) return 'D';
    return 'F';
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
  ${chalk.green('node main-system-analyzer.js')}                     # Analyze all project folders
  ${chalk.green('node main-system-analyzer.js -f ../DocDomV3.1')}    # Analyze specific folder
  ${chalk.green('node main-system-analyzer.js --individual-only')}   # Only individual reports
  ${chalk.green('node main-system-analyzer.js --system-only')}       # Only system report
  ${chalk.green('node main-system-analyzer.js --skip-similarity')}   # Skip similarity analysis

Analysis Focus:
  • Sequential dependency system analysis (1.1 → 1.2 → 2.1)
  • Individual module health and compliance
  • Cross-module dependency validation
  • Function registration accuracy
  • ES3/ExtendScript compatibility
  • Architecture pattern compliance

Report Types:
  • Individual: Detailed per-module analysis with specific issues
  • System: Aggregate analysis of module interactions and dependencies
  • Both include actionable recommendations and code samples
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