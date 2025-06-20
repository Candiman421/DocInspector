// ============================================================================
// INDIVIDUAL MODULE REPORT GENERATOR
// Generate detailed YAML reports for individual module analysis
// ============================================================================

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import {
    writeYAMLFile,
    createYAMLHeader,
    createStructuredReport,
    generateFilePath
} from '../core/yaml-generator.js';
import { formatCodeSnippet } from './code-snippet-extractor.js';

/**
 * Generate individual module analysis report
 * @param {Object} moduleAnalysis - Complete module analysis result
 * @param {string} outputPath - Directory to write report
 * @param {Object} options - Report generation options
 * @returns {Object} Report generation result
 */
export const generateIndividualModuleReport =  (moduleAnalysis, outputPath, options = {}) => {
    const startTime = Date.now();

    try {
        console.log(chalk.cyan(`📝 Generating individual module report...`));

        if (!moduleAnalysis.success) {
            throw new Error(`Cannot generate report for failed analysis: ${moduleAnalysis.error}`);
        }

        const analysis = moduleAnalysis.analysis;
        const filename = analysis.module_info.filename;

        // Create structured report data
        const reportData = createModuleReportData(analysis, options);

        // Generate output filename
        const reportFilename = generateFilePath(
            outputPath,
            '~module-analysis-{filename}-{timestamp}.yaml',
            {
                filename: filename.replace(/\.jsx?$/, ''),
                timestamp: '' // Will be filled by generateFilePath
            }
        );

        // Write YAML report
        const success = writeYAMLFile(reportFilename, reportData, {
            sortKeys: false,
            lineWidth: 100
        });

        if (!success) {
            throw new Error('Failed to write YAML report file');
        }

        const reportSize = fs.statSync(reportFilename).size;

        console.log(chalk.green(`✅ Individual module report generated: ${path.basename(reportFilename)}`));
        console.log(chalk.gray(`   Report size: ${Math.round(reportSize / 1024)}KB`));

        return {
            success: true,
            reportPath: reportFilename,
            reportSize,
            generationTime: Date.now() - startTime,
            moduleFilename: filename
        };

    } catch (error) {
        console.error(chalk.red(`❌ Individual report generation failed: ${error.message}`));

        return {
            success: false,
            error: error.message,
            generationTime: Date.now() - startTime
        };
    }
};

/**
 * Create structured report data for individual module
 * @param {Object} analysis - Module analysis data
 * @param {Object} options - Report options
 * @returns {Object} Structured report data
 */
const createModuleReportData = (analysis, options) => {
    const reportData = createStructuredReport('individual_module', {}, {
        module_name: analysis.module_info.filename,
        analysis_version: '3.1'
    });

    // Module Summary
    reportData.module_summary = createModuleSummary(analysis);

    // Function Analysis
    reportData.function_analysis = createFunctionAnalysis(analysis);

    // Code Quality Assessment
    reportData.code_quality = createCodeQualityAssessment(analysis);

    // Issues and Violations
    reportData.issues_and_violations = createIssuesSection(analysis, options);

    // Health Score Breakdown
    reportData.health_score_breakdown = createHealthScoreBreakdown(analysis);

    // Recommendations
    reportData.recommendations = createRecommendations(analysis);

    // Detailed Analysis (optional)
    if (options.includeDetailedAnalysis) {
        reportData.detailed_analysis = createDetailedAnalysis(analysis);
    }

    return reportData;
};

/**
 * Create module summary section
 * @param {Object} analysis - Module analysis
 * @returns {Object} Module summary
 */
const createModuleSummary = (analysis) => {
    const info = analysis.module_info;
    const health = analysis.health_score;

    return {
        basic_info: {
            filename: info.filename,
            version: info.version || 'unknown',
            file_size_kb: info.file_size_kb,
            line_count: info.line_count,
            code_lines: info.code_lines,
            comment_lines: info.comment_lines,
            blank_lines: info.blank_lines,
            last_modified: info.last_modified
        },

        overview_metrics: {
            total_functions: analysis.function_inventory.total_count,
            global_functions: analysis.function_inventory.globalCount,
            nested_functions: analysis.function_inventory.nestedCount,
            health_score: health.total_score,
            health_grade: health.grade,
            health_percentage: health.percentage
        },

        compliance_status: {
            es3_compliant: analysis.es3_compliance.compliant,
            reserved_word_safe: analysis.reserved_word_safety.safe,
            registration_accurate: analysis.registration_compliance.isCompliant,
            registration_accuracy_percentage: analysis.registration_compliance.accuracyPercentage
        },

        architecture_metrics: {
            has_error_handling: analysis.function_architecture.functionsWithErrorHandling > 0,
            error_handling_coverage: analysis.function_architecture.errorHandlingCoverage,
            has_logging: analysis.function_architecture.functionsWithLogging > 0,
            logging_coverage: analysis.function_architecture.loggingCoverage,
            average_function_length: analysis.function_architecture.averageLineCount
        }
    };
};

/**
 * Create function analysis section
 * @param {Object} analysis - Module analysis
 * @returns {Object} Function analysis
 */
const createFunctionAnalysis = (analysis) => {
    const inventory = analysis.function_inventory;

    const functionAnalysis = {
        function_inventory: {
            total_count: inventory.total_count,
            global_count: inventory.globalCount,
            nested_count: inventory.nestedCount,

            categorization: {
                with_parameters: inventory.withParameters?.length || 0,
                without_parameters: inventory.withoutParameters?.length || 0,
                with_error_handling: inventory.withErrorHandling?.length || 0,
                without_error_handling: inventory.withoutErrorHandling?.length || 0,
                with_logging: inventory.withLogging?.length || 0,
                without_logging: inventory.withoutLogging?.length || 0,
                oversized: inventory.oversized?.length || 0
            }
        },

        function_signatures: inventory.signatures || []
    };

    // Registration compliance details
    const registration = analysis.registration_compliance;
    functionAnalysis.registration_compliance = {
        registration_found: registration.registrationFound,
        module_name: registration.moduleName,
        version: registration.version,
        registered_functions: registration.registeredFunctions,

        compliance_issues: {
            functions_not_registered: registration.functionsNotRegistered,
            registered_but_not_found: registration.registeredButNotFound,
            accuracy_percentage: registration.accuracyPercentage
        }
    };

    // Function categorization by purpose
    if (inventory.by_purpose) {
        functionAnalysis.functions_by_purpose = inventory.by_purpose;
    }

    // Function categorization by complexity
    if (inventory.by_complexity) {
        functionAnalysis.functions_by_complexity = inventory.by_complexity;
    }

    return functionAnalysis;
};

/**
 * Create code quality assessment section
 * @param {Object} analysis - Module analysis
 * @returns {Object} Code quality assessment
 */
const createCodeQualityAssessment = (analysis) => {
    return {
        es3_compliance: {
            compliant: analysis.es3_compliance.compliant,
            violations_count: analysis.es3_compliance.violations.length,
            total_penalty: analysis.es3_compliance.totalPenalty,
            critical_violations_count: analysis.es3_compliance.criticalViolations.length
        },

        reserved_word_safety: {
            safe: analysis.reserved_word_safety.safe,
            violations_count: analysis.reserved_word_safety.violations.length,
            total_penalty: analysis.reserved_word_safety.totalPenalty,
            critical_violations_count: analysis.reserved_word_safety.criticalViolations.length
        },

        logging_compliance: {
            modern_calls: analysis.logging_compliance.modernCalls,
            legacy_calls: analysis.logging_compliance.legacyCalls,
            modern_percentage: analysis.logging_compliance.modernPercentage,
            compliance_level: analysis.logging_compliance.compliance,
            score: analysis.logging_compliance.score
        },

        code_organization: {
            organization_score: analysis.code_organization?.organization_score || 0,
            has_section_headers: analysis.code_organization?.has_section_headers || false,
            section_count: analysis.code_organization?.section_count || 0,
            has_consistent_indentation: analysis.code_organization?.has_consistent_indentation || false
        },

        security_patterns: {
            risk_level: analysis.security_patterns?.risk_level || 'unknown',
            security_issues_count: analysis.security_patterns?.security_issues?.length || 0,
            security_measures_count: analysis.security_patterns?.security_measures?.length || 0,
            score: analysis.security_patterns?.score || 0
        },

        performance_indicators: {
            score: analysis.performance_indicators?.score || 0,
            potential_issues_count: analysis.performance_indicators?.potential_issues?.length || 0,
            optimizations_count: analysis.performance_indicators?.optimizations?.length || 0
        }
    };
};

/**
 * Create issues and violations section
 * @param {Object} analysis - Module analysis
 * @param {Object} options - Report options
 * @returns {Object} Issues and violations
 */
const createIssuesSection = (analysis, options) => {
    const issues = {
        critical_issues: [],
        high_priority_issues: [],
        medium_priority_issues: [],
        warnings: []
    };

    // ES3 compliance violations
    if (analysis.es3_compliance.violations.length > 0) {
        analysis.es3_compliance.violations.forEach(violation => {
            const issue = {
                category: 'es3_compliance',
                type: violation.type,
                description: violation.description || `ES3 violation: ${violation.type}`,
                locations: violation.locations || [],
                penalty: violation.penalty,
                fix_suggestion: violation.fix || 'Review ES3 compatibility requirements'
            };

            if (violation.critical || analysis.es3_compliance.criticalViolations.includes(violation)) {
                issues.critical_issues.push(issue);
            } else {
                issues.high_priority_issues.push(issue);
            }

            // Add code examples if available and requested
            if (options.includeCodeExamples && violation.examples) {
                issue.code_examples = violation.examples.map(example => ({
                    line: example.line,
                    code: formatCodeSnippet(example.code, { maxLength: 80 })
                }));
            }
        });
    }

    // Reserved word safety violations
    if (analysis.reserved_word_safety.violations.length > 0) {
        analysis.reserved_word_safety.violations.forEach(violation => {
            const issue = {
                category: 'reserved_word_safety',
                type: violation.type,
                word: violation.word,
                description: `Dangerous property usage: '${violation.word}'`,
                locations: violation.locations || [],
                penalty: violation.penalty,
                fix_suggestion: violation.fix || `Rename property '${violation.word}' to avoid conflicts`
            };

            if (violation.critical) {
                issues.critical_issues.push(issue);
            } else {
                issues.high_priority_issues.push(issue);
            }

            // Add code examples
            if (options.includeCodeExamples && violation.examples) {
                issue.code_examples = violation.examples.map(example => ({
                    line: example.line,
                    code: formatCodeSnippet(example.code, { maxLength: 80 })
                }));
            }
        });
    }

    // Registration compliance issues
    const registration = analysis.registration_compliance;
    if (registration.functionsNotRegistered.length > 0) {
        issues.medium_priority_issues.push({
            category: 'registration_compliance',
            type: 'functions_not_registered',
            description: 'Functions exist in code but not registered',
            affected_functions: registration.functionsNotRegistered,
            fix_suggestion: 'Add missing functions to registerModule() call'
        });
    }

    if (registration.registeredButNotFound.length > 0) {
        issues.medium_priority_issues.push({
            category: 'registration_compliance',
            type: 'registered_but_not_found',
            description: 'Functions registered but not found in code',
            affected_functions: registration.registeredButNotFound,
            fix_suggestion: 'Remove non-existent functions from registerModule() call'
        });
    }

    // Logging compliance issues
    if (analysis.logging_compliance.compliance === 'poor') {
        issues.medium_priority_issues.push({
            category: 'logging_compliance',
            type: 'poor_logging_modernization',
            description: `Low modern logging adoption: ${analysis.logging_compliance.modernPercentage}%`,
            fix_suggestion: 'Replace $.writeln() calls with modern logging functions (logDebug, logInfo, etc.)'
        });
    }

    // Function architecture issues
    if (analysis.function_architecture.oversizedFunctions.length > 0) {
        analysis.function_architecture.oversizedFunctions.forEach(func => {
            const issue = {
                category: 'function_architecture',
                type: 'oversized_function',
                function_name: func.name,
                line_count: func.lines,
                severity: func.severity,
                description: `Function '${func.name}' is ${func.severity} (${func.lines} lines)`,
                fix_suggestion: func.severity === 'critical' ?
                    'Consider breaking function into smaller functions' :
                    'Consider refactoring to reduce function length'
            };

            if (func.severity === 'critical') {
                issues.high_priority_issues.push(issue);
            } else {
                issues.medium_priority_issues.push(issue);
            }
        });
    }

    // Security issues
    if (analysis.security_patterns?.security_issues) {
        analysis.security_patterns.security_issues.forEach(securityIssue => {
            const issue = {
                category: 'security',
                type: securityIssue.type,
                severity: securityIssue.severity,
                description: securityIssue.description,
                fix_suggestion: 'Review security implications and implement safer alternatives'
            };

            if (securityIssue.severity === 'critical') {
                issues.critical_issues.push(issue);
            } else if (securityIssue.severity === 'high') {
                issues.high_priority_issues.push(issue);
            } else {
                issues.medium_priority_issues.push(issue);
            }
        });
    }

    // Performance issues
    if (analysis.performance_indicators?.potential_issues) {
        analysis.performance_indicators.potential_issues.forEach(perfIssue => {
            const issue = {
                category: 'performance',
                type: perfIssue.type,
                count: perfIssue.count,
                description: perfIssue.description,
                severity: perfIssue.severity,
                fix_suggestion: 'Review performance impact and consider optimization'
            };

            if (perfIssue.severity === 'high') {
                issues.high_priority_issues.push(issue);
            } else {
                issues.medium_priority_issues.push(issue);
            }
        });
    }

    // Internal dependency issues
    if (analysis.internal_dependencies?.hasOrderViolations) {
        analysis.internal_dependencies.forwardReferences.forEach(ref => {
            issues.warnings.push({
                category: 'internal_dependencies',
                type: 'forward_reference',
                caller: ref.caller,
                called: ref.called,
                description: ref.issue,
                fix_suggestion: 'Consider reordering functions to avoid forward references'
            });
        });
    }

    return issues;
};

/**
 * Create health score breakdown section
 * @param {Object} analysis - Module analysis
 * @returns {Object} Health score breakdown
 */
const createHealthScoreBreakdown = (analysis) => {
    const health = analysis.health_score;

    return {
        overall_score: {
            total_score: health.total_score,
            grade: health.grade,
            percentage: health.percentage,
            max_possible: health.max_possible
        },

        score_components: {
            penalties_total: health.penalties,
            bonuses_total: health.bonuses,
            net_adjustments: health.bonuses - health.penalties
        },

        penalty_breakdown: health.penalties > 0 ? createPenaltyBreakdown(analysis) : {},
        bonus_breakdown: health.bonuses > 0 ? createBonusBreakdown(analysis) : {},

        grade_explanation: generateGradeExplanation(health.grade, health.total_score)
    };
};

/**
 * Create penalty breakdown
 * @param {Object} analysis - Module analysis
 * @returns {Object} Penalty breakdown
 */
const createPenaltyBreakdown = (analysis) => {
    const penalties = {};

    if (analysis.es3_compliance.totalPenalty > 0) {
        penalties.es3_violations = {
            penalty: analysis.es3_compliance.totalPenalty,
            violations_count: analysis.es3_compliance.violations.length,
            description: 'ES3 compatibility violations'
        };
    }

    if (analysis.reserved_word_safety.totalPenalty > 0) {
        penalties.reserved_word_violations = {
            penalty: analysis.reserved_word_safety.totalPenalty,
            violations_count: analysis.reserved_word_safety.violations.length,
            description: 'Reserved word safety violations'
        };
    }

    if (analysis.registration_compliance.accuracyPercentage < 100) {
        const penalty = (100 - analysis.registration_compliance.accuracyPercentage) * 2;
        penalties.registration_inaccuracy = {
            penalty: penalty,
            accuracy_percentage: analysis.registration_compliance.accuracyPercentage,
            description: 'Function registration inaccuracies'
        };
    }

    return penalties;
};

/**
 * Create bonus breakdown
 * @param {Object} analysis - Module analysis
 * @returns {Object} Bonus breakdown
 */
const createBonusBreakdown = (analysis) => {
    const bonuses = {};

    if (analysis.logging_compliance.score > 0) {
        bonuses.logging_compliance = {
            bonus: analysis.logging_compliance.score,
            modern_percentage: analysis.logging_compliance.modernPercentage,
            description: 'Modern logging compliance'
        };
    }

    if (analysis.function_architecture.score > 0) {
        bonuses.function_architecture = {
            bonus: analysis.function_architecture.score,
            error_handling_coverage: analysis.function_architecture.errorHandlingCoverage,
            description: 'Good function architecture practices'
        };
    }

    if (analysis.code_organization?.organization_score > 80) {
        bonuses.code_organization = {
            bonus: 20,
            organization_score: analysis.code_organization.organization_score,
            description: 'Excellent code organization'
        };
    }

    return bonuses;
};

/**
 * Create recommendations section
 * @param {Object} analysis - Module analysis
 * @returns {Array} Array of recommendations
 */
const createRecommendations = (analysis) => {
    const recommendations = [];

    // Critical recommendations
    if (analysis.es3_compliance.criticalViolations.length > 0) {
        recommendations.push({
            priority: 'critical',
            category: 'es3_compliance',
            title: 'Fix ES3 Compatibility Issues',
            description: `${analysis.es3_compliance.criticalViolations.length} critical ES3 violations found`,
            action: 'Review and fix all ES3 compatibility violations to ensure ExtendScript compatibility',
            estimated_effort: 'medium'
        });
    }

    if (analysis.reserved_word_safety.criticalViolations.length > 0) {
        recommendations.push({
            priority: 'critical',
            category: 'reserved_word_safety',
            title: 'Fix Reserved Word Usage',
            description: `${analysis.reserved_word_safety.criticalViolations.length} critical reserved word violations found`,
            action: 'Rename properties using reserved words (especially "export" which crashes ExtendScript)',
            estimated_effort: 'low'
        });
    }

    // High priority recommendations
    if (analysis.registration_compliance.accuracyPercentage < 90) {
        recommendations.push({
            priority: 'high',
            category: 'registration_compliance',
            title: 'Improve Function Registration Accuracy',
            description: `Registration accuracy: ${analysis.registration_compliance.accuracyPercentage}%`,
            action: 'Update registerModule() call to match actual function exports',
            estimated_effort: 'low'
        });
    }

    if (analysis.function_architecture.errorHandlingCoverage < 70) {
        recommendations.push({
            priority: 'high',
            category: 'error_handling',
            title: 'Improve Error Handling Coverage',
            description: `Only ${analysis.function_architecture.errorHandlingCoverage}% of functions have error handling`,
            action: 'Add try-catch blocks to critical functions',
            estimated_effort: 'medium'
        });
    }

    // Medium priority recommendations
    if (analysis.logging_compliance.modernPercentage < 80) {
        recommendations.push({
            priority: 'medium',
            category: 'logging_modernization',
            title: 'Modernize Logging Calls',
            description: `${analysis.logging_compliance.modernPercentage}% modern logging adoption`,
            action: 'Replace $.writeln() calls with modern logging functions',
            estimated_effort: 'low'
        });
    }

    if (analysis.function_architecture.loggingCoverage < 50) {
        recommendations.push({
            priority: 'medium',
            category: 'logging_coverage',
            title: 'Improve Logging Coverage',
            description: `Only ${analysis.function_architecture.loggingCoverage}% of functions have logging`,
            action: 'Add logging to important functions for better debugging',
            estimated_effort: 'medium'
        });
    }

    // Performance recommendations
    if (analysis.function_architecture.oversizedFunctions.length > 0) {
        const criticalCount = analysis.function_architecture.oversizedFunctions.filter(f => f.severity === 'critical').length;
        if (criticalCount > 0) {
            recommendations.push({
                priority: 'medium',
                category: 'function_length',
                title: 'Refactor Oversized Functions',
                description: `${criticalCount} functions exceed critical length threshold`,
                action: 'Break large functions into smaller, focused functions',
                estimated_effort: 'high'
            });
        }
    }

    return recommendations;
};

/**
 * Create detailed analysis section (optional)
 * @param {Object} analysis - Module analysis
 * @returns {Object} Detailed analysis
 */
const createDetailedAnalysis = (analysis) => {
    return {
        module_metadata: analysis.module_metadata,
        internal_dependencies: analysis.internal_dependencies,
        security_patterns: analysis.security_patterns,
        performance_indicators: analysis.performance_indicators,
        code_organization: analysis.code_organization
    };
};

/**
 * Generate grade explanation
 * @param {string} grade - Health grade
 * @param {number} score - Numeric score
 * @returns {string} Grade explanation
 */
const generateGradeExplanation = (grade, score) => {
    const explanations = {
        'A+': 'Exemplary module - exceeds all architecture requirements',
        'A': 'Excellent module - meets all requirements with minor issues',
        'B+': 'Good module - solid compliance with some improvement areas',
        'B': 'Acceptable module - meets basic requirements',
        'C+': 'Below standard - requires attention to several issues',
        'C': 'Poor compliance - needs significant refactoring',
        'D': 'Critical issues present - requires immediate attention',
        'F': 'Unacceptable - major problems that must be fixed'
    };

    return explanations[grade] || `Score: ${score}/1000`;
};

export default {
    generateIndividualModuleReport
};