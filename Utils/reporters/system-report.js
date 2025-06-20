// reporters/system-report.js
// System-wide aggregate analysis report generator

import yaml from 'js-yaml';
import path from 'path';
import { writeFileSync } from 'fs';
import { generateTimestamp } from '../core/yaml-generator.js';

/**
 * Generate system-wide aggregate analysis report
 * @param {Array} moduleAnalyses - Array of individual module analyses
 * @param {Object} systemAnalysis - System-wide analysis results
 * @param {string} folderPath - Target folder path
 * @returns {string} Generated report filename
 */
export function generateSystemReport(moduleAnalyses, systemAnalysis, folderPath) {
    const timestamp = generateTimestamp();
    const filename = `~system-aggregate-analysis-${timestamp}.yaml`;
    const filepath = path.join(folderPath, filename);

    const reportData = buildSystemReportData(moduleAnalyses, systemAnalysis);
    const yamlContent = generateSystemReportYAML(reportData);

    writeFileSync(filepath, yamlContent, 'utf8');
    return filename;
}

/**
 * Build comprehensive system report data structure
 * @param {Array} moduleAnalyses - Individual module analyses
 * @param {Object} systemAnalysis - System analysis results
 * @returns {Object} Report data structure
 */
function buildSystemReportData(moduleAnalyses, systemAnalysis) {
    // Use systemAnalysis.individual_modules instead of processing moduleAnalyses again
    const individualModules = systemAnalysis.individual_modules || [];
    const failedModules = moduleAnalyses.filter(m => !m.success);

    return {
        system_overview: buildSystemOverview(individualModules, failedModules),
        dependency_analysis: buildDependencyAnalysis(systemAnalysis.dependency_analysis),
        health_summary: buildHealthSummary(individualModules),
        compliance_summary: buildComplianceSummary(individualModules),
        cross_module_issues: buildCrossModuleIssues(systemAnalysis),
        individual_modules: individualModules, // Use pre-processed data
        failed_analyses: buildFailedAnalysesSummary(failedModules),
        recommendations: buildSystemRecommendations(individualModules, systemAnalysis)
    };
}

/**
 * Build system overview section
 */
function buildSystemOverview(successfulModules, failedModules) {
    const totalFunctions = successfulModules.reduce((sum, m) =>
        sum + (m.analysis?.function_inventory?.total_count || 0), 0);
    const totalLines = successfulModules.reduce((sum, m) =>
        sum + (m.analysis?.module_info?.line_count || 0), 0);
    const avgHealthScore = successfulModules.length > 0 ?
        Math.round(successfulModules.reduce((sum, m) =>
            sum + (m.analysis?.health_score?.total_score || 0), 0) / successfulModules.length) : 0;

    return {
        total_modules: successfulModules.length + failedModules.length,
        successful_analyses: successfulModules.length,
        failed_analyses: failedModules.length,
        total_functions: totalFunctions,
        total_lines_of_code: totalLines,
        average_health_score: avgHealthScore,
        overall_system_grade: calculateSystemGrade(avgHealthScore),
        module_size_range: calculateModuleSizeRange(successfulModules),
        dependency_chain_length: successfulModules.length
    };
}

/**
 * Build dependency analysis section
 */
function buildDependencyAnalysis(dependencyAnalysis) {
    if (!dependencyAnalysis) {
        return {
            analysis_completed: false,
            error: "Dependency analysis not available"
        };
    }

    return {
        analysis_completed: true,
        dependency_chain_valid: dependencyAnalysis.chain_valid,
        total_violations: dependencyAnalysis.violations?.length || 0,
        circular_dependencies: dependencyAnalysis.circular_deps?.length || 0,
        missing_dependencies: dependencyAnalysis.missing_deps?.length || 0,
        load_order_compliance: dependencyAnalysis.load_order_compliance || 0,
        critical_dependency_issues: dependencyAnalysis.violations?.filter(v => v.severity === 'critical') || [],
        dependency_chain: dependencyAnalysis.chain || []
    };
}

/**
 * Build health summary section
 */
function buildHealthSummary(modules) {
    const gradeDistribution = calculateGradeDistribution(modules);
    const criticalIssueModules = modules.filter(m =>
        (m.analysis?.es3_compliance?.violations?.length || 0) > 0 ||
        (m.analysis?.registration_compliance?.accuracyPercentage || 100) < 90
    );

    return {
        grade_distribution: gradeDistribution,
        modules_with_critical_issues: criticalIssueModules.length,
        es3_compliant_modules: modules.filter(m => m.analysis?.es3_compliance?.compliant).length,
        perfect_registration_modules: modules.filter(m => 
            (m.analysis?.registration_compliance?.accuracyPercentage || 0) === 100).length,
        average_registration_accuracy: calculateAverageRegistration(modules),
        logging_coverage_average: calculateAverageLoggingCoverage(modules),
        health_trend: calculateHealthTrend(modules)
    };
}

/**
 * Build compliance summary section
 */
function buildComplianceSummary(modules) {
    return {
        es3_compliance: {
            compliant_modules: modules.filter(m => m.es3_compliant).length,
            total_violations: modules.reduce((sum, m) => sum + (m.es3_violations?.length || 0), 0),
            common_violations: findCommonES3Violations(modules)
        },
        registration_compliance: {
            perfect_accuracy: modules.filter(m => m.registration_accuracy === 100).length,
            average_accuracy: calculateAverageRegistration(modules),
            common_issues: findCommonRegistrationIssues(modules)
        },
        logging_compliance: {
            modules_with_logging: modules.filter(m => m.logging_coverage > 0).length,
            average_coverage: calculateAverageLoggingCoverage(modules),
            modern_logging_adoption: calculateModernLoggingAdoption(modules)
        }
    };
}

/**
 * Build cross-module issues section
 */
function buildCrossModuleIssues(systemAnalysis) {
    const issues = {
        function_name_collisions: [],
        dependency_violations: [],
        circular_references: [],
        missing_cross_references: []
    };

    if (systemAnalysis.cross_module_analysis) {
        const crossAnalysis = systemAnalysis.cross_module_analysis;

        // Function name collisions (same name, different modules)
        if (crossAnalysis.name_collisions) {
            issues.function_name_collisions = crossAnalysis.name_collisions.map(collision => ({
                function_name: collision.name,
                modules: collision.modules,
                severity: collision.severity || 'medium',
                recommendation: `Rename function in one module to avoid collision`
            }));
        }

        // Cross-module dependency violations
        if (crossAnalysis.dependency_violations) {
            issues.dependency_violations = crossAnalysis.dependency_violations.map(violation => ({
                type: violation.type,
                caller_module: violation.caller_module,
                target_module: violation.target_module,
                description: violation.description,
                severity: 'critical'
            }));
        }
    }

    return issues;
}

/**
 * Build individual module summaries
 */
function buildIndividualModuleSummaries(modules) {
    return modules.map(module => ({
        filename: module.analysis?.module_info?.filename || 'unknown',
        version: module.analysis?.module_info?.version || 'unknown',
        line_count: module.analysis?.module_info?.line_count || 0,
        function_count: module.analysis?.function_inventory?.total_count || 0,
        health_score: module.analysis?.health_score?.total_score || 0,
        grade: module.analysis?.health_score?.grade || 'F',
        es3_compliant: module.analysis?.es3_compliance?.compliant || false,
        registration_accuracy: module.analysis?.registration_compliance?.accuracyPercentage || 0,
        logging_coverage: module.analysis?.function_architecture?.loggingCoverage || 0,
        critical_issues: [
            ...(module.analysis?.es3_compliance?.violations || []).map(v => `ES3: ${v.type || v.keyword || 'violation'}`),
            ...(module.analysis?.registration_compliance?.functionsNotRegistered || []).map(f => `Unregistered: ${f}`),
            ...(module.analysis?.registration_compliance?.registeredButNotFound || []).map(f => `Missing: ${f}`)
        ].slice(0, 5), // Limit to top 5 issues
        dependencies: module.analysis?.dependencies?.declared || []
    }));
}

/**
 * Build failed analyses summary
 */
function buildFailedAnalysesSummary(failedModules) {
    return failedModules.map(module => ({
        filename: module.filename,
        error: module.error,
        partial_data: {
            file_accessible: !!module.file_size,
            file_size: module.file_size || 0
        }
    }));
}

/**
 * Build system recommendations
 */
function buildSystemRecommendations(modules, systemAnalysis) {
    const recommendations = [];

    // ES3 compliance recommendations
    const es3Issues = modules.filter(m => !m.es3_compliant);
    if (es3Issues.length > 0) {
        recommendations.push({
            priority: 'HIGH',
            category: 'ES3_COMPLIANCE',
            title: 'Fix ES3 compatibility violations',
            description: `${es3Issues.length} modules have ES3 violations that will break ExtendScript`,
            affected_modules: es3Issues.map(m => m.filename),
            action: 'Review ES3 violations in individual module reports and fix syntax'
        });
    }

    // Registration accuracy recommendations
    const regIssues = modules.filter(m => m.registration_accuracy < 95);
    if (regIssues.length > 0) {
        recommendations.push({
            priority: 'MEDIUM',
            category: 'REGISTRATION',
            title: 'Improve function registration accuracy',
            description: `${regIssues.length} modules have registration mismatches`,
            affected_modules: regIssues.map(m => m.filename),
            action: 'Update registerModule() calls to match actual functions'
        });
    }

    // Dependency order recommendations
    if (systemAnalysis.dependencies?.violations?.length > 0) {
        recommendations.push({
            priority: 'CRITICAL',
            category: 'DEPENDENCIES',
            title: 'Fix dependency order violations',
            description: 'Module dependency chain has violations that break sequential loading',
            affected_modules: systemAnalysis.dependencies.violations.map(v => v.module),
            action: 'Restructure module dependencies to maintain sequential order'
        });
    }

    // Logging modernization recommendations
    const lowLogging = modules.filter(m => (m.logging_coverage || 0) < 50);
    if (lowLogging.length > 0) {
        recommendations.push({
            priority: 'LOW',
            category: 'LOGGING',
            title: 'Improve logging coverage',
            description: `${lowLogging.length} modules have low logging coverage`,
            affected_modules: lowLogging.map(m => m.filename),
            action: 'Add logDebug/logInfo calls to improve debugging capabilities'
        });
    }

    return recommendations;
}

/**
 * Generate YAML content for system report
 */
function generateSystemReportYAML(reportData) {
    const header = [
        '# SYSTEM AGGREGATE ANALYSIS REPORT',
        '# DocDom Module System - Sequential Dependency Analysis',
        `# Generated: ${new Date().toISOString()}`,
        '# ========================================',
        ''
    ].join('\n');

    const yamlData = {
        system_overview: reportData.system_overview,
        dependency_analysis: reportData.dependency_analysis,
        health_summary: reportData.health_summary,
        compliance_summary: reportData.compliance_summary,
        cross_module_issues: reportData.cross_module_issues,
        recommendations: reportData.recommendations,
        individual_modules: reportData.individual_modules
    };

    // Only include failed analyses if there are any
    if (reportData.failed_analyses.length > 0) {
        yamlData.failed_analyses = reportData.failed_analyses;
    }

    return header + yaml.dump(yamlData, {
        indent: 2,
        lineWidth: 120,
        noRefs: true,
        sortKeys: false
    });
}

// Helper calculation functions
function calculateSystemGrade(avgScore) {
    if (avgScore >= 950) return 'A+';
    if (avgScore >= 900) return 'A';
    if (avgScore >= 850) return 'B+';
    if (avgScore >= 800) return 'B';
    if (avgScore >= 750) return 'C+';
    if (avgScore >= 700) return 'C';
    if (avgScore >= 600) return 'D';
    return 'F';
}

function calculateModuleSizeRange(modules) {
    if (modules.length === 0) return { min: 0, max: 0, avg: 0 };

    const sizes = modules.map(m => m.analysis?.module_info?.line_count || 0);
    return {
        min: Math.min(...sizes),
        max: Math.max(...sizes),
        avg: Math.round(sizes.reduce((sum, size) => sum + size, 0) / sizes.length)
    };
}

function calculateGradeDistribution(modules) {
    const distribution = { 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C+': 0, 'C': 0, 'D': 0, 'F': 0 };
    modules.forEach(module => {
        const grade = module.analysis?.health_score?.grade || 'F';
        distribution[grade] = (distribution[grade] || 0) + 1;
    });
    return distribution;
}

function calculateAverageRegistration(modules) {
    if (modules.length === 0) return 0;
    const total = modules.reduce((sum, m) => 
        sum + (m.analysis?.registration_compliance?.accuracyPercentage || 0), 0);
    return Math.round(total / modules.length);
}

function calculateAverageLoggingCoverage(modules) {
    if (modules.length === 0) return 0;
    const total = modules.reduce((sum, m) => 
        sum + (m.analysis?.function_architecture?.loggingCoverage || 0), 0);
    return Math.round(total / modules.length);
}

function calculateModernLoggingAdoption(modules) {
    const withModernLogging = modules.filter(m =>
        m.logging_functions?.some(f => f.startsWith('log'))
    ).length;
    return modules.length > 0 ? Math.round((withModernLogging / modules.length) * 100) : 0;
}

function calculateHealthTrend(modules) {
    const avgScore = modules.length > 0 ?
        modules.reduce((sum, m) => sum + (m.analysis?.health_score?.total_score || 0), 0) / modules.length : 0;

    if (avgScore >= 800) return 'stable';
    if (avgScore >= 600) return 'needs_attention';
    return 'critical';
}

function findCommonES3Violations(modules) {
    const violations = {};
    modules.forEach(module => {
        (module.es3_violations || []).forEach(violation => {
            const key = violation.issue;
            violations[key] = (violations[key] || 0) + 1;
        });
    });

    return Object.entries(violations)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([violation, count]) => ({ violation, modules_affected: count }));
}

function findCommonRegistrationIssues(modules) {
    const issues = {
        unregistered_functions: 0,
        missing_functions: 0,
        registration_mismatches: 0
    };

    modules.forEach(module => {
        const mismatches = module.registration_mismatches || {};
        issues.unregistered_functions += (mismatches.functions_not_registered || []).length;
        issues.missing_functions += (mismatches.functions_registered_not_exist || []).length;
        if (module.registration_accuracy < 100) {
            issues.registration_mismatches++;
        }
    });

    return issues;
}