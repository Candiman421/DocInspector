// reporters/system-report.js
// System-wide aggregate analysis report generator

import yaml from 'js-yaml';
import path from 'path';
import { writeFileSync } from 'fs';
import { generateTimestamp } from '../core/yaml-generator.js';

/**
 * Generate system-wide aggregate analysis report
 * @param {Object} systemAnalysis - System analysis results
 * @param {string} folderPath - Target folder path
 * @returns {string} Generated report filename
 */
export function generateSystemReport(systemAnalysis, folderPath) {
    const timestamp = generateTimestamp();
    const filename = `~system-aggregate-analysis-${timestamp}.yaml`;
    const filepath = path.join(folderPath, filename);

    const reportData = buildSystemReportData(systemAnalysis);
    const yamlContent = generateSystemReportYAML(reportData);

    writeFileSync(filepath, yamlContent, 'utf8');
    return filename;
}

/**
 * Build comprehensive system report data structure
 * @param {Object} systemAnalysis - System analysis results
 * @returns {Object} Report data structure
 */
function buildSystemReportData(systemAnalysis) {
    const individualModules = systemAnalysis.individual_modules || [];
    const failedModules = []; // Will be empty since we filter failures earlier

    return {
        system_overview: buildSystemOverview(individualModules, failedModules),
        dependency_analysis: buildDependencyAnalysis(systemAnalysis.dependency_analysis),
        health_summary: buildHealthSummary(individualModules),
        compliance_summary: buildComplianceSummary(individualModules),
        cross_module_issues: buildCrossModuleIssues(systemAnalysis),
        individual_modules: buildIndividualModuleSummaries(individualModules),
        failed_analyses: buildFailedAnalysesSummary(failedModules),
        recommendations: buildSystemRecommendations(individualModules, systemAnalysis)
    };
}

/**
 * Build system overview section
 */
function buildSystemOverview(successfulModules, failedModules) {
    const totalFunctions = successfulModules.reduce((sum, m) => sum + (m.function_count || 0), 0);
    const totalLines = successfulModules.reduce((sum, m) => sum + (m.line_count || 0), 0);
    const avgHealthScore = successfulModules.length > 0 ?
        Math.round(successfulModules.reduce((sum, m) => sum + (m.health_score || 0), 0) / successfulModules.length) : 0;

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
        dependency_chain_valid: dependencyAnalysis.dependency_order_valid || false,
        total_violations: dependencyAnalysis.dependency_violations?.length || 0,
        circular_dependencies: dependencyAnalysis.circular_dependencies?.length || 0,
        missing_dependencies: dependencyAnalysis.missing_dependencies?.length || 0,
        load_order_compliance: dependencyAnalysis.compliance_score || 0,
        critical_dependency_issues: dependencyAnalysis.dependency_violations?.filter(v => v.severity === 'critical') || [],
        dependency_chain: dependencyAnalysis.dependency_violations || []
    };
}

/**
 * Build health summary section
 */
function buildHealthSummary(modules) {
    const gradeDistribution = calculateGradeDistribution(modules);
    const criticalIssueModules = modules.filter(m => 
        Array.isArray(m.critical_issues) ? m.critical_issues.length > 0 : (m.critical_issues || 0) > 0
    );

    return {
        grade_distribution: gradeDistribution,
        modules_with_critical_issues: criticalIssueModules.length,
        es3_compliant_modules: modules.filter(m => m.es3_compliant).length,
        perfect_registration_modules: modules.filter(m => m.registration_accuracy === 100).length,
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
            total_violations: modules.reduce((sum, m) => {
                if (Array.isArray(m.critical_issues)) {
                    return sum + m.critical_issues.filter(issue => issue.startsWith('ES3:')).length;
                }
                return sum + (m.critical_issues || 0);
            }, 0),
            common_violations: [] // Simplified for now
        },
        registration_compliance: {
            perfect_accuracy: modules.filter(m => m.registration_accuracy === 100).length,
            average_accuracy: calculateAverageRegistration(modules),
            common_issues: {
                unregistered_functions: modules.reduce((sum, m) => {
                    if (Array.isArray(m.critical_issues)) {
                        return sum + m.critical_issues.filter(issue => issue.startsWith('Unregistered:')).length;
                    }
                    return sum;
                }, 0),
                missing_functions: 0,
                registration_mismatches: modules.filter(m => m.registration_accuracy < 100).length
            }
        },
        logging_compliance: {
            modules_with_logging: modules.filter(m => (m.logging_coverage || 0) > 0).length,
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
        if (crossAnalysis.function_name_collisions) {
            issues.function_name_collisions = crossAnalysis.function_name_collisions.map(collision => ({
                function_name: collision.function_name,
                modules: collision.modules,
                severity: collision.severity || 'medium',
                recommendation: collision.recommendation || `Rename function in one module to avoid collision`
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
        filename: module.filename || 'unknown',
        version: module.version || 'unknown',
        line_count: module.line_count || 0,
        function_count: module.function_count || 0,
        health_score: module.health_score || 0,
        grade: module.grade || 'F',
        es3_compliant: module.es3_compliant || false,
        registration_accuracy: module.registration_accuracy || 0,
        logging_coverage: module.logging_coverage || 0,
        critical_issues: Array.isArray(module.critical_issues) ? module.critical_issues : [],
        dependencies: module.dependencies || []
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
    if (systemAnalysis.dependency_analysis?.dependency_violations?.length > 0) {
        recommendations.push({
            priority: 'CRITICAL',
            category: 'DEPENDENCIES',
            title: 'Fix dependency order violations',
            description: 'Module dependency chain has violations that break sequential loading',
            affected_modules: systemAnalysis.dependency_analysis.dependency_violations.map(v => v.module),
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

    const sizes = modules.map(m => m.line_count || 0);
    return {
        min: Math.min(...sizes),
        max: Math.max(...sizes),
        avg: Math.round(sizes.reduce((sum, size) => sum + size, 0) / sizes.length)
    };
}

function calculateGradeDistribution(modules) {
    const distribution = { 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C+': 0, 'C': 0, 'D': 0, 'F': 0 };
    modules.forEach(module => {
        const grade = module.grade || 'F';
        distribution[grade] = (distribution[grade] || 0) + 1;
    });
    return distribution;
}

function calculateAverageRegistration(modules) {
    if (modules.length === 0) return 0;
    const total = modules.reduce((sum, m) => sum + (m.registration_accuracy || 0), 0);
    return Math.round(total / modules.length);
}

function calculateAverageLoggingCoverage(modules) {
    if (modules.length === 0) return 0;
    const total = modules.reduce((sum, m) => sum + (m.logging_coverage || 0), 0);
    return Math.round(total / modules.length);
}

function calculateModernLoggingAdoption(modules) {
    const withModernLogging = modules.filter(m => (m.logging_coverage || 0) > 0).length;
    return modules.length > 0 ? Math.round((withModernLogging / modules.length) * 100) : 0;
}

function calculateHealthTrend(modules) {
    const avgScore = modules.length > 0 ?
        modules.reduce((sum, m) => sum + (m.health_score || 0), 0) / modules.length : 0;

    if (avgScore >= 800) return 'stable';
    if (avgScore >= 600) return 'needs_attention';
    return 'critical';
}

function findCommonES3Violations(modules) {
    const violations = {};
    modules.forEach(module => {
        if (Array.isArray(module.critical_issues)) {
            module.critical_issues.forEach(issue => {
                if (issue.startsWith('ES3:')) {
                    const violation = issue.substring(4);
                    violations[violation] = (violations[violation] || 0) + 1;
                }
            });
        }
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
        if (Array.isArray(module.critical_issues)) {
            issues.unregistered_functions += module.critical_issues.filter(issue => 
                issue.startsWith('Unregistered:')).length;
        }
        if (module.registration_accuracy < 100) {
            issues.registration_mismatches++;
        }
    });

    return issues;
}