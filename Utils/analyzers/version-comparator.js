// ============================================================================
// VERSION COMPARATOR
// Analysis of different versions of the same module
// ============================================================================

import chalk from 'chalk';
import path from 'path';
import { Diff } from 'diff';
import { analyzeIndividualModule } from './individual-module-analyzer.js';
import { extractVersion, parseVersion, compareVersions } from '../config/patterns.js';

/**
 * Compare multiple versions of the same module
 * @param {Object} folderInfo - Folder containing module versions
 * @param {Object} versionGroups - Grouped versions from folder analysis
 * @param {Object} options - Comparison options
 * @returns {Object} Complete version comparison analysis
 */
export const compareModuleVersions =  (folderInfo, versionGroups, options = {}) => {
    const startTime = Date.now();
    console.log(chalk.blue(`🔄 Comparing module versions: ${folderInfo.name}`));

    try {
        const comparisons = [];

        // Process each version group (files with same decimal prefix)
        for (const [prefix, files] of Object.entries(versionGroups)) {
            if (files.length < 2) continue;

            console.log(chalk.cyan(`📊 Comparing versions for ${prefix}: ${files.length} files`));

            const comparison =  compareVersionGroup(folderInfo, prefix, files, options);
            if (comparison.success) {
                comparisons.push(comparison);
            }
        }

        if (comparisons.length === 0) {
            throw new Error('No valid version comparisons could be performed');
        }

        // Create overall analysis
        const analysis = {
            // Comparison metadata
            comparison_info: {
                folder_name: folderInfo.name,
                total_version_groups: Object.keys(versionGroups).length,
                analyzed_groups: comparisons.length,
                analysis_timestamp: new Date().toISOString(),
                analysis_type: 'version_comparison'
            },

            // Individual version group comparisons
            version_comparisons: comparisons.map(comp => comp.analysis),

            // Cross-comparison insights
            evolution_patterns: analyzeEvolutionPatterns(comparisons),

            // Overall insights
            overall_insights: generateOverallInsights(comparisons),

            // Analysis timing
            analysis_time_ms: 0
        };

        analysis.analysis_time_ms = Date.now() - startTime;

        console.log(chalk.green(`✅ Version comparison complete (${analysis.analysis_time_ms}ms)`));
        console.log(chalk.cyan(`   Groups compared: ${comparisons.length}`));

        return {
            success: true,
            analysis,
            folderInfo,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error(chalk.red(`❌ Version comparison failed: ${error.message}`));

        return {
            success: false,
            error: error.message,
            folderInfo,
            timestamp: new Date().toISOString(),
            analysis_time_ms: Date.now() - startTime
        };
    }
};

/**
 * Compare a group of versions for the same module
 * @param {Object} folderInfo - Folder information
 * @param {string} prefix - Version prefix (e.g., "1.2")
 * @param {Array} files - Array of filenames
 * @param {Object} options - Comparison options
 * @returns {Object} Version group comparison
 */
const compareVersionGroup =  (folderInfo, prefix, files, options) => {
    try {
        // Sort files by likely version order
        const sortedFiles = sortVersionFiles(files);

        // Analyze each version individually
        const versionAnalyses = [];

        for (const filename of sortedFiles) {
            const filePath = path.join(folderInfo.path, filename);
            const analysis =  analyzeIndividualModule(filePath, options);

            if (analysis.success) {
                versionAnalyses.push({
                    filename,
                    ...analysis,
                    versionInfo: extractVersionInfo(filename)
                });
            }
        }

        if (versionAnalyses.length < 2) {
            throw new Error(`Insufficient valid versions for comparison: ${versionAnalyses.length}`);
        }

        // Perform version-to-version comparison
        const comparison = {
            prefix,
            versions_count: versionAnalyses.length,
            versions: versionAnalyses.map(va => ({
                filename: va.filename,
                version_info: va.versionInfo,
                health_score: va.analysis.health_score.total_score,
                grade: va.analysis.health_score.grade,
                function_count: va.analysis.function_inventory.total_count,
                line_count: va.analysis.module_info.line_count,
                es3_compliant: va.analysis.es3_compliance.compliant
            })),

            // Evolution analysis
            evolution_analysis: analyzeEvolution(versionAnalyses),

            // Change detection
            change_analysis: analyzeChanges(versionAnalyses),

            // Quality progression
            quality_progression: analyzeQualityProgression(versionAnalyses),

            // Breaking changes
            breaking_changes: analyzeBreakingChanges(versionAnalyses),

            // Recommendations
            recommendations: generateVersionRecommendations(versionAnalyses)
        };

        return {
            success: true,
            analysis: comparison
        };

    } catch (error) {
        console.error(chalk.red(`❌ Version group comparison failed for ${prefix}: ${error.message}`));

        return {
            success: false,
            error: error.message,
            prefix
        };
    }
};

/**
 * Sort version files by likely chronological order
 * @param {Array} files - Array of filenames
 * @returns {Array} Sorted filenames
 */
const sortVersionFiles = (files) => {
    return files.sort((a, b) => {
        // Try to extract version indicators
        const aInfo = extractVersionInfo(a);
        const bInfo = extractVersionInfo(b);

        // Sort by version number if available
        if (aInfo.numericVersion !== null && bInfo.numericVersion !== null) {
            return aInfo.numericVersion - bInfo.numericVersion;
        }

        // Sort by timestamp if available
        if (aInfo.timestamp !== null && bInfo.timestamp !== null) {
            return aInfo.timestamp - bInfo.timestamp;
        }

        // Sort by semantic indicators
        const aOrder = getSemanticOrder(a);
        const bOrder = getSemanticOrder(b);

        if (aOrder !== bOrder) {
            return aOrder - bOrder;
        }

        // Fallback to alphabetical
        return a.localeCompare(b);
    });
};

/**
 * Extract version information from filename
 * @param {string} filename - Filename to analyze
 * @returns {Object} Version information
 */
const extractVersionInfo = (filename) => {
    const info = {
        filename,
        numericVersion: null,
        timestamp: null,
        semanticVersion: null,
        versionType: 'unknown'
    };

    // Extract numeric version (v1, v2, etc.)
    const versionMatch = filename.match(/_v(\d+)\.jsx?$/);
    if (versionMatch) {
        info.numericVersion = parseInt(versionMatch[1], 10);
        info.versionType = 'numeric';
    }

    // Extract timestamp (4-digit numbers)
    const timestampMatch = filename.match(/_(\d{4})\.jsx?$/);
    if (timestampMatch) {
        info.timestamp = parseInt(timestampMatch[1], 10);
        info.versionType = 'timestamp';
    }

    // Extract semantic version indicators
    const semanticPatterns = [
        { pattern: /_old\.jsx?$/, semantic: 'old', order: 1 },
        { pattern: /_original\.jsx?$/, semantic: 'original', order: 1 },
        { pattern: /_backup\.jsx?$/, semantic: 'backup', order: 2 },
        { pattern: /_current\.jsx?$/, semantic: 'current', order: 3 },
        { pattern: /_updated\.jsx?$/, semantic: 'updated', order: 4 },
        { pattern: /_new\.jsx?$/, semantic: 'new', order: 5 },
        { pattern: /_latest\.jsx?$/, semantic: 'latest', order: 6 }
    ];

    semanticPatterns.forEach(({ pattern, semantic, order }) => {
        if (pattern.test(filename)) {
            info.semanticVersion = semantic;
            info.semanticOrder = order;
            info.versionType = 'semantic';
        }
    });

    return info;
};

/**
 * Get semantic order for filename sorting
 * @param {string} filename - Filename
 * @returns {number} Sort order
 */
const getSemanticOrder = (filename) => {
    const semanticOrders = {
        old: 1, original: 1, backup: 2, current: 3,
        updated: 4, modified: 4, revised: 4, fixed: 4,
        new: 5, latest: 6
    };

    for (const [keyword, order] of Object.entries(semanticOrders)) {
        if (filename.toLowerCase().includes(keyword)) {
            return order;
        }
    }

    return 10; // Default for unknown
};

/**
 * Analyze evolution between versions
 * @param {Array} versionAnalyses - Array of version analyses
 * @returns {Object} Evolution analysis
 */
const analyzeEvolution = (versionAnalyses) => {
    const evolution = {
        functions_added: [],
        functions_removed: [],
        functions_modified: [],
        line_count_progression: [],
        health_score_progression: [],
        es3_compliance_progression: []
    };

    // Track metrics progression
    versionAnalyses.forEach(va => {
        evolution.line_count_progression.push({
            version: va.filename,
            line_count: va.analysis.module_info.line_count
        });

        evolution.health_score_progression.push({
            version: va.filename,
            health_score: va.analysis.health_score.total_score,
            grade: va.analysis.health_score.grade
        });

        evolution.es3_compliance_progression.push({
            version: va.filename,
            compliant: va.analysis.es3_compliance.compliant,
            violations: va.analysis.es3_compliance.violations.length
        });
    });

    // Compare function sets between consecutive versions
    for (let i = 1; i < versionAnalyses.length; i++) {
        const prevVersion = versionAnalyses[i - 1];
        const currVersion = versionAnalyses[i];

        const prevFunctions = extractFunctionNames(prevVersion.analysis.function_inventory);
        const currFunctions = extractFunctionNames(currVersion.analysis.function_inventory);

        // Find added functions
        const added = currFunctions.filter(f => !prevFunctions.includes(f));
        const removed = prevFunctions.filter(f => !currFunctions.includes(f));

        if (added.length > 0) {
            evolution.functions_added.push({
                from_version: prevVersion.filename,
                to_version: currVersion.filename,
                added_functions: added
            });
        }

        if (removed.length > 0) {
            evolution.functions_removed.push({
                from_version: prevVersion.filename,
                to_version: currVersion.filename,
                removed_functions: removed
            });
        }

        // Detect modified functions (same name, different signature)
        const commonFunctions = currFunctions.filter(f => prevFunctions.includes(f));
        const modified = [];

        commonFunctions.forEach(funcName => {
            const prevSig = findFunctionSignature(prevVersion.analysis.function_inventory, funcName);
            const currSig = findFunctionSignature(currVersion.analysis.function_inventory, funcName);

            if (prevSig && currSig && prevSig !== currSig) {
                modified.push({
                    function_name: funcName,
                    old_signature: prevSig,
                    new_signature: currSig
                });
            }
        });

        if (modified.length > 0) {
            evolution.functions_modified.push({
                from_version: prevVersion.filename,
                to_version: currVersion.filename,
                modified_functions: modified
            });
        }
    }

    return evolution;
};

/**
 * Extract function names from function inventory
 * @param {Object} inventory - Function inventory
 * @returns {Array} Array of function names
 */
const extractFunctionNames = (inventory) => {
    const names = [];

    // Add functions with parameters
    if (inventory.withParameters) {
        inventory.withParameters.forEach(func => {
            const name = typeof func === 'string' ? func : func.name;
            if (name && !names.includes(name)) {
                names.push(name);
            }
        });
    }

    // Add functions without parameters
    if (inventory.withoutParameters) {
        inventory.withoutParameters.forEach(name => {
            if (name && !names.includes(name)) {
                names.push(name);
            }
        });
    }

    return names;
};

/**
 * Find function signature in inventory
 * @param {Object} inventory - Function inventory
 * @param {string} functionName - Function name to find
 * @returns {string|null} Function signature or null
 */
const findFunctionSignature = (inventory, functionName) => {
    if (inventory.function_signatures) {
        return inventory.function_signatures.find(sig => sig.includes(functionName)) || null;
    }

    return null;
};

/**
 * Analyze changes between versions
 * @param {Array} versionAnalyses - Array of version analyses
 * @returns {Object} Change analysis
 */
const analyzeChanges = (versionAnalyses) => {
    const changes = {
        code_changes: [],
        quality_changes: [],
        metric_changes: []
    };

    // Compare consecutive versions
    for (let i = 1; i < versionAnalyses.length; i++) {
        const prevVersion = versionAnalyses[i - 1];
        const currVersion = versionAnalyses[i];

        const change = {
            from_version: prevVersion.filename,
            to_version: currVersion.filename,
            changes: {}
        };

        // Line count change
        const lineChange = currVersion.analysis.module_info.line_count -
            prevVersion.analysis.module_info.line_count;
        change.changes.line_count_change = lineChange;

        // Function count change
        const funcChange = currVersion.analysis.function_inventory.total_count -
            prevVersion.analysis.function_inventory.total_count;
        change.changes.function_count_change = funcChange;

        // Health score change
        const healthChange = currVersion.analysis.health_score.total_score -
            prevVersion.analysis.health_score.total_score;
        change.changes.health_score_change = healthChange;

        // Grade change
        const prevGrade = prevVersion.analysis.health_score.grade;
        const currGrade = currVersion.analysis.health_score.grade;
        if (prevGrade !== currGrade) {
            change.changes.grade_change = `${prevGrade} → ${currGrade}`;
        }

        // ES3 compliance change
        const prevES3 = prevVersion.analysis.es3_compliance.compliant;
        const currES3 = currVersion.analysis.es3_compliance.compliant;
        if (prevES3 !== currES3) {
            change.changes.es3_compliance_change = `${prevES3} → ${currES3}`;
        }

        changes.metric_changes.push(change);
    }

    return changes;
};

/**
 * Analyze quality progression across versions
 * @param {Array} versionAnalyses - Array of version analyses
 * @returns {Object} Quality progression analysis
 */
const analyzeQualityProgression = (versionAnalyses) => {
    const progression = {
        overall_trend: 'stable',
        health_score_trend: calculateTrend(versionAnalyses.map(va => va.analysis.health_score.total_score)),
        line_count_trend: calculateTrend(versionAnalyses.map(va => va.analysis.module_info.line_count)),
        function_count_trend: calculateTrend(versionAnalyses.map(va => va.analysis.function_inventory.total_count)),

        quality_improvements: [],
        quality_regressions: [],

        best_version: null,
        worst_version: null
    };

    // Find best and worst versions by health score
    let bestScore = -1;
    let worstScore = Infinity;

    versionAnalyses.forEach(va => {
        const score = va.analysis.health_score.total_score;

        if (score > bestScore) {
            bestScore = score;
            progression.best_version = {
                filename: va.filename,
                health_score: score,
                grade: va.analysis.health_score.grade
            };
        }

        if (score < worstScore) {
            worstScore = score;
            progression.worst_version = {
                filename: va.filename,
                health_score: score,
                grade: va.analysis.health_score.grade
            };
        }
    });

    // Identify specific improvements and regressions
    for (let i = 1; i < versionAnalyses.length; i++) {
        const prev = versionAnalyses[i - 1];
        const curr = versionAnalyses[i];

        const prevScore = prev.analysis.health_score.total_score;
        const currScore = curr.analysis.health_score.total_score;

        if (currScore > prevScore + 50) {
            progression.quality_improvements.push({
                from_version: prev.filename,
                to_version: curr.filename,
                improvement: currScore - prevScore,
                description: `Health score improved by ${currScore - prevScore} points`
            });
        }

        if (currScore < prevScore - 50) {
            progression.quality_regressions.push({
                from_version: prev.filename,
                to_version: curr.filename,
                regression: prevScore - currScore,
                description: `Health score decreased by ${prevScore - currScore} points`
            });
        }
    }

    // Determine overall trend
    if (progression.quality_improvements.length > progression.quality_regressions.length) {
        progression.overall_trend = 'improving';
    } else if (progression.quality_regressions.length > progression.quality_improvements.length) {
        progression.overall_trend = 'declining';
    }

    return progression;
};

/**
 * Calculate trend for a series of numbers
 * @param {Array} values - Array of numeric values
 * @returns {string} Trend description
 */
const calculateTrend = (values) => {
    if (values.length < 2) return 'insufficient_data';

    const first = values[0];
    const last = values[values.length - 1];
    const change = last - first;
    const percentChange = Math.abs((change / first) * 100);

    if (percentChange < 5) {
        return 'stable';
    } else if (change > 0) {
        return percentChange > 20 ? 'strongly_increasing' : 'increasing';
    } else {
        return percentChange > 20 ? 'strongly_decreasing' : 'decreasing';
    }
};

/**
 * Analyze breaking changes between versions
 * @param {Array} versionAnalyses - Array of version analyses
 * @returns {Object} Breaking changes analysis
 */
const analyzeBreakingChanges = (versionAnalyses) => {
    const breakingChanges = {
        potential_breaking_changes: [],
        function_signature_changes: [],
        removed_functions: []
    };

    // Compare consecutive versions for breaking changes
    for (let i = 1; i < versionAnalyses.length; i++) {
        const prevVersion = versionAnalyses[i - 1];
        const currVersion = versionAnalyses[i];

        const prevFunctions = extractFunctionNames(prevVersion.analysis.function_inventory);
        const currFunctions = extractFunctionNames(currVersion.analysis.function_inventory);

        // Removed functions are breaking changes
        const removed = prevFunctions.filter(f => !currFunctions.includes(f));
        if (removed.length > 0) {
            breakingChanges.removed_functions.push({
                from_version: prevVersion.filename,
                to_version: currVersion.filename,
                removed_functions: removed,
                impact: 'breaking_change'
            });
        }

        // ES3 compliance loss is a breaking change
        const prevES3 = prevVersion.analysis.es3_compliance.compliant;
        const currES3 = currVersion.analysis.es3_compliance.compliant;

        if (prevES3 && !currES3) {
            breakingChanges.potential_breaking_changes.push({
                from_version: prevVersion.filename,
                to_version: currVersion.filename,
                change: 'ES3 compliance lost',
                impact: 'critical_breaking_change'
            });
        }
    }

    return breakingChanges;
};

/**
 * Generate recommendations for version evolution
 * @param {Array} versionAnalyses - Array of version analyses
 * @returns {Array} Array of recommendations
 */
const generateVersionRecommendations = (versionAnalyses) => {
    const recommendations = [];

    if (versionAnalyses.length < 2) {
        return recommendations;
    }

    const latest = versionAnalyses[versionAnalyses.length - 1];
    const first = versionAnalyses[0];

    // Compare latest to first
    const healthChange = latest.analysis.health_score.total_score - first.analysis.health_score.total_score;

    if (healthChange < -100) {
        recommendations.push({
            priority: 'high',
            category: 'quality_regression',
            description: 'Significant quality regression detected',
            action: 'Review changes and consider reverting problematic modifications'
        });
    }

    if (!latest.analysis.es3_compliance.compliant && first.analysis.es3_compliance.compliant) {
        recommendations.push({
            priority: 'critical',
            category: 'es3_compliance',
            description: 'ES3 compliance was lost in evolution',
            action: 'Fix ES3 compatibility issues to maintain ExtendScript compatibility'
        });
    }

    // Find best version for recommendations
    let bestVersion = versionAnalyses[0];
    versionAnalyses.forEach(va => {
        if (va.analysis.health_score.total_score > bestVersion.analysis.health_score.total_score) {
            bestVersion = va;
        }
    });

    if (bestVersion !== latest) {
        recommendations.push({
            priority: 'medium',
            category: 'version_selection',
            description: `Version ${bestVersion.filename} has better quality than latest`,
            action: 'Consider using or merging improvements from higher-quality version'
        });
    }

    return recommendations;
};

/**
 * Analyze evolution patterns across all version groups
 * @param {Array} comparisons - Array of version group comparisons
 * @returns {Object} Evolution patterns analysis
 */
const analyzeEvolutionPatterns = (comparisons) => {
    const patterns = {
        common_evolution_patterns: [],
        quality_trends: [],
        size_trends: []
    };

    // Analyze trends across all comparisons
    comparisons.forEach(comp => {
        const analysis = comp.analysis;

        // Quality trend
        if (analysis.quality_progression.overall_trend === 'improving') {
            patterns.quality_trends.push(`${analysis.prefix}: Quality improving`);
        } else if (analysis.quality_progression.overall_trend === 'declining') {
            patterns.quality_trends.push(`${analysis.prefix}: Quality declining`);
        }

        // Size trend
        if (analysis.quality_progression.line_count_trend === 'increasing') {
            patterns.size_trends.push(`${analysis.prefix}: Size increasing`);
        } else if (analysis.quality_progression.line_count_trend === 'decreasing') {
            patterns.size_trends.push(`${analysis.prefix}: Size decreasing`);
        }
    });

    return patterns;
};

/**
 * Generate overall insights across all comparisons
 * @param {Array} comparisons - Array of version group comparisons
 * @returns {Object} Overall insights
 */
const generateOverallInsights = (comparisons) => {
    const insights = {
        summary: [],
        recommendations: [],
        best_practices_observed: [],
        anti_patterns_observed: []
    };

    let totalVersions = 0;
    let improvingModules = 0;
    let decliningModules = 0;

    comparisons.forEach(comp => {
        const analysis = comp.analysis;
        totalVersions += analysis.versions_count;

        if (analysis.quality_progression.overall_trend === 'improving') {
            improvingModules++;
        } else if (analysis.quality_progression.overall_trend === 'declining') {
            decliningModules++;
        }
    });

    insights.summary.push(`Analyzed ${totalVersions} total versions across ${comparisons.length} modules`);
    insights.summary.push(`${improvingModules} modules showing quality improvement`);
    insights.summary.push(`${decliningModules} modules showing quality decline`);

    if (improvingModules > decliningModules) {
        insights.recommendations.push('Overall positive evolution trend - continue current practices');
    } else if (decliningModules > improvingModules) {
        insights.recommendations.push('Quality decline detected - review development processes');
    }

    return insights;
};

export default {
    compareModuleVersions
};