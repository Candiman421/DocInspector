// reporters/version-report.js
// Version comparison analysis report generator

import yaml from 'js-yaml';
import path from 'path';
import { writeFileSync } from 'fs';
import { generateTimestamp } from '../core/yaml-generator.js';
import { extractCodeSnippet } from './code-snippet-extractor.js';

/**
 * Generate version comparison analysis report
 * @param {Array} moduleVersions - Array of different versions of the same module
 * @param {Object} comparisonAnalysis - Version comparison analysis results
 * @param {string} folderPath - Target folder path
 * @returns {string} Generated report filename
 */
export function generateVersionReport(moduleVersions, comparisonAnalysis, folderPath) {
    const timestamp = generateTimestamp();
    const moduleName = extractModuleBaseName(moduleVersions[0].filename);
    const filename = `~version-comparison-${moduleName}-${timestamp}.yaml`;
    const filepath = path.join(folderPath, filename);

    const reportData = buildVersionReportData(moduleVersions, comparisonAnalysis);
    const yamlContent = generateVersionReportYAML(reportData, moduleName);

    writeFileSync(filepath, yamlContent, 'utf8');
    return filename;
}

/**
 * Build comprehensive version comparison report data
 * @param {Array} moduleVersions - Module version analyses
 * @param {Object} comparisonAnalysis - Comparison results
 * @returns {Object} Report data structure
 */
function buildVersionReportData(moduleVersions, comparisonAnalysis) {
    const sortedVersions = sortVersionsByAge(moduleVersions);

    return {
        comparison_overview: buildComparisonOverview(sortedVersions),
        evolution_analysis: buildEvolutionAnalysis(sortedVersions, comparisonAnalysis),
        function_changes: buildFunctionChanges(comparisonAnalysis),
        quality_evolution: buildQualityEvolution(sortedVersions),
        breaking_changes: buildBreakingChanges(comparisonAnalysis),
        code_diff_samples: buildCodeDiffSamples(comparisonAnalysis),
        recommendations: buildVersionRecommendations(sortedVersions, comparisonAnalysis),
        detailed_comparison: buildDetailedComparison(sortedVersions)
    };
}

/**
 * Build comparison overview section
 */
function buildComparisonOverview(versions) {
    return {
        module_base_name: extractModuleBaseName(versions[0].filename),
        versions_analyzed: versions.length,
        version_files: versions.map(v => v.filename),
        analysis_scope: 'version_comparison',
        oldest_version: versions[0].filename,
        newest_version: versions[versions.length - 1].filename,
        total_evolution_period: `${versions.length} versions analyzed`,
        analysis_focus: 'Function changes, quality evolution, breaking changes'
    };
}

/**
 * Build evolution analysis section
 */
function buildEvolutionAnalysis(versions, comparisonAnalysis) {
    const evolution = {
        line_count_evolution: versions.map(v => ({
            version: v.filename,
            lines: v.line_count
        })),
        function_count_evolution: versions.map(v => ({
            version: v.filename,
            functions: v.function_count
        })),
        health_score_evolution: versions.map(v => ({
            version: v.filename,
            score: v.health_score,
            grade: v.grade
        }))
    };

    // Calculate trends
    evolution.trends = {
        line_count_trend: calculateTrend(versions.map(v => v.line_count)),
        function_count_trend: calculateTrend(versions.map(v => v.function_count)),
        health_score_trend: calculateTrend(versions.map(v => v.health_score))
    };

    // Overall evolution summary
    const oldest = versions[0];
    const newest = versions[versions.length - 1];

    evolution.overall_changes = {
        line_count_change: newest.line_count - oldest.line_count,
        function_count_change: newest.function_count - oldest.function_count,
        health_score_change: newest.health_score - oldest.health_score,
        grade_change: `${oldest.grade} → ${newest.grade}`
    };

    return evolution;
}

/**
 * Build function changes section
 */
function buildFunctionChanges(comparisonAnalysis) {
    const changes = {
        functions_added: [],
        functions_removed: [],
        functions_modified: [],
        signature_changes: []
    };

    if (comparisonAnalysis.function_diff) {
        const diff = comparisonAnalysis.function_diff;

        changes.functions_added = diff.added || [];
        changes.functions_removed = diff.removed || [];
        changes.functions_modified = diff.modified || [];
        changes.signature_changes = diff.signature_changes || [];
    }

    // Add summary statistics
    changes.summary = {
        total_additions: changes.functions_added.length,
        total_removals: changes.functions_removed.length,
        total_modifications: changes.functions_modified.length,
        total_signature_changes: changes.signature_changes.length,
        net_function_change: changes.functions_added.length - changes.functions_removed.length
    };

    return changes;
}

/**
 * Build quality evolution section
 */
function buildQualityEvolution(versions) {
    return {
        es3_compliance_evolution: versions.map(v => ({
            version: v.filename,
            compliant: v.es3_compliant,
            violations: (v.es3_violations || []).length
        })),
        registration_accuracy_evolution: versions.map(v => ({
            version: v.filename,
            accuracy: v.registration_accuracy || 0
        })),
        logging_coverage_evolution: versions.map(v => ({
            version: v.filename,
            coverage: v.logging_coverage || 0
        })),
        quality_improvements: identifyQualityImprovements(versions),
        quality_regressions: identifyQualityRegressions(versions)
    };
}

/**
 * Build breaking changes section
 */
function buildBreakingChanges(comparisonAnalysis) {
    const breakingChanges = [];

    if (comparisonAnalysis.function_diff) {
        const diff = comparisonAnalysis.function_diff;

        // Function removals are breaking changes
        (diff.removed || []).forEach(func => {
            breakingChanges.push({
                type: 'FUNCTION_REMOVED',
                function_name: func,
                severity: 'HIGH',
                impact: 'Code calling this function will fail',
                migration: 'Remove calls or implement alternative'
            });
        });

        // Signature changes are breaking changes
        (diff.signature_changes || []).forEach(change => {
            breakingChanges.push({
                type: 'SIGNATURE_CHANGED',
                function_name: change.function_name,
                old_signature: change.old_signature,
                new_signature: change.new_signature,
                severity: 'MEDIUM',
                impact: 'Callers may need parameter updates',
                migration: 'Update function calls to match new signature'
            });
        });

        // ES3 compliance changes
        if (comparisonAnalysis.compliance_changes) {
            const compliance = comparisonAnalysis.compliance_changes;
            if (compliance.es3_regression) {
                breakingChanges.push({
                    type: 'ES3_COMPLIANCE_LOST',
                    severity: 'CRITICAL',
                    impact: 'Will not run in ExtendScript environment',
                    migration: 'Fix ES3 violations before deployment'
                });
            }
        }
    }

    return {
        total_breaking_changes: breakingChanges.length,
        critical_changes: breakingChanges.filter(c => c.severity === 'CRITICAL'),
        high_impact_changes: breakingChanges.filter(c => c.severity === 'HIGH'),
        medium_impact_changes: breakingChanges.filter(c => c.severity === 'MEDIUM'),
        all_breaking_changes: breakingChanges
    };
}

/**
 * Build code diff samples section
 */
function buildCodeDiffSamples(comparisonAnalysis) {
    const samples = {
        modified_functions: {},
        new_functions: {},
        removed_functions: {}
    };

    if (comparisonAnalysis.code_diffs) {
        const diffs = comparisonAnalysis.code_diffs;

        // Modified function samples (limit to 3 for readability)
        Object.entries(diffs.modified || {}).slice(0, 3).forEach(([funcName, diff]) => {
            samples.modified_functions[funcName] = {
                old_code: diff.old_code,
                new_code: diff.new_code,
                analysis: diff.analysis || 'Function implementation changed',
                lines_changed: diff.lines_changed || 'unknown'
            };
        });

        // New function samples (limit to 3)
        Object.entries(diffs.added || {}).slice(0, 3).forEach(([funcName, code]) => {
            samples.new_functions[funcName] = {
                code: code,
                analysis: 'New function added'
            };
        });

        // Removed function samples (limit to 3)
        Object.entries(diffs.removed || {}).slice(0, 3).forEach(([funcName, code]) => {
            samples.removed_functions[funcName] = {
                code: code,
                analysis: 'Function removed'
            };
        });
    }

    return samples;
}

/**
 * Build version recommendations section
 */
function buildVersionRecommendations(versions, comparisonAnalysis) {
    const recommendations = [];
    const newest = versions[versions.length - 1];
    const oldest = versions[0];

    // Quality trend recommendations
    if (newest.health_score < oldest.health_score) {
        recommendations.push({
            priority: 'HIGH',
            category: 'QUALITY_REGRESSION',
            title: 'Address quality regression',
            description: `Health score declined from ${oldest.health_score} to ${newest.health_score}`,
            action: 'Review recent changes and fix quality issues'
        });
    }

    // ES3 compliance recommendations
    if (!newest.es3_compliant && oldest.es3_compliant) {
        recommendations.push({
            priority: 'CRITICAL',
            category: 'ES3_REGRESSION',
            title: 'Fix ES3 compliance regression',
            description: 'Module lost ES3 compatibility',
            action: 'Remove ES5+ features to restore ExtendScript compatibility'
        });
    }

    // Breaking changes recommendations
    const breakingChanges = comparisonAnalysis.function_diff?.removed?.length || 0;
    if (breakingChanges > 0) {
        recommendations.push({
            priority: 'HIGH',
            category: 'BREAKING_CHANGES',
            title: 'Document breaking changes',
            description: `${breakingChanges} functions were removed`,
            action: 'Create migration guide for removed functions'
        });
    }

    // Registration accuracy recommendations
    if (newest.registration_accuracy < 95) {
        recommendations.push({
            priority: 'MEDIUM',
            category: 'REGISTRATION',
            title: 'Fix function registration mismatches',
            description: `Registration accuracy is ${newest.registration_accuracy}%`,
            action: 'Update registerModule() to match actual functions'
        });
    }

    return recommendations;
}

/**
 * Build detailed version-by-version comparison
 */
function buildDetailedComparison(versions) {
    return versions.map((version, index) => {
        const comparison = {
            filename: version.filename,
            line_count: version.line_count,
            function_count: version.function_count,
            health_score: version.health_score,
            grade: version.grade,
            es3_compliant: version.es3_compliant,
            registration_accuracy: version.registration_accuracy || 0,
            logging_coverage: version.logging_coverage || 0
        };

        // Add change indicators compared to previous version
        if (index > 0) {
            const prev = versions[index - 1];
            comparison.changes_from_previous = {
                line_count_delta: version.line_count - prev.line_count,
                function_count_delta: version.function_count - prev.function_count,
                health_score_delta: version.health_score - prev.health_score,
                es3_compliance_change: prev.es3_compliant !== version.es3_compliant,
                registration_accuracy_delta: (version.registration_accuracy || 0) - (prev.registration_accuracy || 0)
            };
        }

        return comparison;
    });
}

/**
 * Generate YAML content for version comparison report
 */
function generateVersionReportYAML(reportData, moduleName) {
    const header = [
        '# VERSION COMPARISON ANALYSIS REPORT',
        `# Module: ${moduleName}`,
        `# Versions Analyzed: ${reportData.comparison_overview.versions_analyzed}`,
        `# Generated: ${new Date().toISOString()}`,
        '# ========================================',
        '# FOCUS: Evolution analysis, breaking changes, quality trends',
        '# NOTE: This compares different versions of the SAME module',
        ''
    ].join('\n');

    const yamlData = {
        comparison_overview: reportData.comparison_overview,
        evolution_analysis: reportData.evolution_analysis,
        function_changes: reportData.function_changes,
        quality_evolution: reportData.quality_evolution,
        breaking_changes: reportData.breaking_changes,
        recommendations: reportData.recommendations,
        detailed_comparison: reportData.detailed_comparison
    };

    // Include code samples if they exist
    if (Object.keys(reportData.code_diff_samples.modified_functions).length > 0 ||
        Object.keys(reportData.code_diff_samples.new_functions).length > 0 ||
        Object.keys(reportData.code_diff_samples.removed_functions).length > 0) {
        yamlData.code_diff_samples = reportData.code_diff_samples;
    }

    return header + yaml.dump(yamlData, {
        indent: 2,
        lineWidth: 120,
        noRefs: true,
        sortKeys: false
    });
}

// Helper functions
function extractModuleBaseName(filename) {
    // Extract base name from versioned filename
    // e.g., "1.2_safety-utilities_v2.jsx" -> "1.2_safety-utilities"
    const match = filename.match(/^(\d+(?:\.\d+)*_[^_]+)/);
    return match ? match[1] : filename.replace(/\.jsx?$/, '');
}

function sortVersionsByAge(versions) {
    // Sort by filename, assuming consistent naming convention
    // This is a simple sort - could be enhanced with file modification times
    return [...versions].sort((a, b) => a.filename.localeCompare(b.filename));
}

function calculateTrend(values) {
    if (values.length < 2) return 'stable';

    const first = values[0];
    const last = values[values.length - 1];
    const change = last - first;
    const percentChange = first === 0 ? 0 : (change / first) * 100;

    if (Math.abs(percentChange) < 5) return 'stable';
    return change > 0 ? 'increasing' : 'decreasing';
}

function identifyQualityImprovements(versions) {
    const improvements = [];

    for (let i = 1; i < versions.length; i++) {
        const prev = versions[i - 1];
        const curr = versions[i];

        if (curr.health_score > prev.health_score) {
            improvements.push({
                version: curr.filename,
                improvement: 'Health score increased',
                from: prev.health_score,
                to: curr.health_score
            });
        }

        if (!prev.es3_compliant && curr.es3_compliant) {
            improvements.push({
                version: curr.filename,
                improvement: 'ES3 compliance achieved',
                from: 'non-compliant',
                to: 'compliant'
            });
        }

        if ((curr.registration_accuracy || 0) > (prev.registration_accuracy || 0)) {
            improvements.push({
                version: curr.filename,
                improvement: 'Registration accuracy improved',
                from: `${prev.registration_accuracy || 0}%`,
                to: `${curr.registration_accuracy || 0}%`
            });
        }
    }

    return improvements;
}

function identifyQualityRegressions(versions) {
    const regressions = [];

    for (let i = 1; i < versions.length; i++) {
        const prev = versions[i - 1];
        const curr = versions[i];

        if (curr.health_score < prev.health_score) {
            regressions.push({
                version: curr.filename,
                regression: 'Health score decreased',
                from: prev.health_score,
                to: curr.health_score
            });
        }

        if (prev.es3_compliant && !curr.es3_compliant) {
            regressions.push({
                version: curr.filename,
                regression: 'ES3 compliance lost',
                from: 'compliant',
                to: 'non-compliant'
            });
        }

        if ((curr.registration_accuracy || 0) < (prev.registration_accuracy || 0)) {
            regressions.push({
                version: curr.filename,
                regression: 'Registration accuracy decreased',
                from: `${prev.registration_accuracy || 0}%`,
                to: `${curr.registration_accuracy || 0}%`
            });
        }
    }

    return regressions;
}