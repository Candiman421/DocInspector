// reporters/individual-report.js
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
export const generateIndividualModuleReport = (moduleAnalysis, outputPath, options = {}) => {
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
        const reportTime = Date.now() - startTime;

        console.log(chalk.green(`✅ Report generated: ${path.basename(reportFilename)} (${Math.round(reportSize / 1024)}KB, ${reportTime}ms)`));

        return {
            success: true,
            reportPath: reportFilename,
            reportSize,
            generationTime: reportTime,
            filename: path.basename(reportFilename)
        };

    } catch (error) {
        console.error(chalk.red(`❌ Report generation failed: ${error.message}`));

        return {
            success: false,
            error: error.message,
            generationTime: Date.now() - startTime
        };
    }
};

/**
 * Create comprehensive module report data structure
 * @param {Object} analysis - Module analysis results
 * @param {Object} options - Report generation options
 * @returns {Object} Report data structure
 */
const createModuleReportData = (analysis, options = {}) => {
    return {
        // NEW: Executive summary for quick decision making
        executive_summary: createExecutiveSummary(analysis),

        // Existing sections with enhancements
        module_summary: createModuleSummary(analysis),
        function_analysis: createFunctionAnalysis(analysis),
        code_quality: createCodeQualityAssessment(analysis),
        issues_and_violations: createIssuesSection(analysis, { includeCodeExamples: true, ...options }),
        health_score_breakdown: createHealthScoreBreakdown(analysis),
        recommendations: createRecommendations(analysis)
    };
};

/**
 * Create executive summary section - TOP PRIORITY ISSUES
 * @param {Object} analysis - Module analysis
 * @returns {Object} Executive summary
 */
const createExecutiveSummary = (analysis) => {
    const summary = {
        critical_blockers: [],
        quick_stats: {
            health_grade: analysis.health_score.grade,
            compliance_percentage: Math.round((
                (analysis.es3_compliance.compliant ? 1 : 0) +
                (analysis.reserved_word_safety.safe ? 1 : 0) +
                (analysis.registration_compliance.isCompliant ? 1 : 0)
            ) / 3 * 100),
            functions_needing_attention: 0,
            estimated_fix_time: 'unknown'
        },
        top_3_actions: []
    };

    let functionsNeedingAttention = 0;
    let estimatedHours = 0;

    // Critical blockers (will crash or break runtime)
    if (!analysis.es3_compliance.compliant) {
        const violationCount = analysis.es3_compliance.violations?.length || 0;
        summary.critical_blockers.push(`${violationCount} ES3 violations that crash ExtendScript`);
        functionsNeedingAttention += violationCount;
        estimatedHours += Math.ceil(violationCount * 0.1); // 6 minutes per violation
    }

    if (!analysis.registration_compliance.isCompliant) {
        const missingCount = analysis.registration_compliance.functionsNotRegistered?.length || 0;
        const extraCount = analysis.registration_compliance.registeredButNotFound?.length || 0;
        if (missingCount + extraCount > 0) {
            summary.critical_blockers.push(`Function registration mismatches (${missingCount + extraCount} issues)`);
            functionsNeedingAttention += missingCount + extraCount;
            estimatedHours += 0.5; // 30 minutes to fix registration
        }
    }

    if (!analysis.reserved_word_safety.safe) {
        const violationCount = analysis.reserved_word_safety.violations?.length || 0;
        summary.critical_blockers.push(`${violationCount} reserved word violations`);
        functionsNeedingAttention += violationCount;
        estimatedHours += Math.ceil(violationCount * 0.1); // 6 minutes per violation
    }

    // Update quick stats
    summary.quick_stats.functions_needing_attention = functionsNeedingAttention;
    summary.quick_stats.estimated_fix_time = estimatedHours >= 1 ? 
        `${Math.ceil(estimatedHours)} hours` : 
        `${Math.ceil(estimatedHours * 60)} minutes`;

    // Top 3 immediate actions
    const actions = [];

    // ES3 violations with specific fixes
    if (analysis.es3_compliance.violations && analysis.es3_compliance.violations.length > 0) {
        const destructuringViolations = analysis.es3_compliance.violations.filter(v => v.type === 'destructuring');
        const spreadViolations = analysis.es3_compliance.violations.filter(v => v.type === 'spread_operator');
        const keywordViolations = analysis.es3_compliance.violations.filter(v => v.type === 'forbidden_keyword');

        if (destructuringViolations.length > 0) {
            const locations = destructuringViolations.flatMap(v => v.locations || []).slice(0, 3);
            actions.push(`Fix destructuring in lines ${locations.join(', ')} (use explicit assignment)`);
        }

        if (keywordViolations.length > 0) {
            const locations = keywordViolations.flatMap(v => v.locations || []).slice(0, 3);
            actions.push(`Replace forbidden keywords in lines ${locations.join(', ')} (rename 'export' to 'exportSettings')`);
        }

        if (spreadViolations.length > 0) {
            const locations = spreadViolations.flatMap(v => v.locations || []).slice(0, 3);
            actions.push(`Fix spread operators in lines ${locations.join(', ')} (use arrayConcat())`);
        }
    }

    // Registration issues
    if (analysis.registration_compliance.functionsNotRegistered?.length > 0) {
        const missing = analysis.registration_compliance.functionsNotRegistered.slice(0, 3);
        actions.push(`Register missing functions: ${missing.join(', ')}`);
    }

    if (analysis.registration_compliance.registeredButNotFound?.length > 0) {
        const extra = analysis.registration_compliance.registeredButNotFound.slice(0, 3);
        actions.push(`Remove non-existent functions from registration: ${extra.join(', ')}`);
    }

    // Performance issues
    if (analysis.function_architecture.oversizedFunctions?.length > 0) {
        const oversized = analysis.function_architecture.oversizedFunctions
            .filter(f => f.severity === 'critical')
            .slice(0, 2);
        if (oversized.length > 0) {
            actions.push(`Refactor oversized functions: ${oversized.map(f => f.name).join(', ')}`);
        }
    }

    summary.top_3_actions = actions.slice(0, 3);

    return summary;
};

/**
 * Classify violation severity based on actual impact
 * @param {string} category - Violation category
 * @param {string} type - Violation type
 * @param {Object} violation - Violation details
 * @returns {string} Severity level: 'critical', 'high', 'medium', 'low'
 */
const classifyViolationSeverity = (category, type, violation = {}) => {
    // CRITICAL: Blocks production - will crash or prevent execution
    const criticalPatterns = {
        es3_compliance: ['destructuring', 'spread_operator', 'forbidden_keyword', 'arrow_function', 'template_literal'],
        reserved_word_safety: ['export', 'import', 'class', 'const', 'let'],
        registration_compliance: ['functions_not_registered', 'registered_but_not_found'],
        security: ['eval_usage', 'script_injection']
    };

    // HIGH: Causes bugs or runtime errors
    const highPatterns = {
        function_architecture: ['missing_error_handling_critical'],
        internal_dependencies: ['circular_reference', 'undefined_function_call'],
        cross_module: ['function_name_collision', 'duplicate_registration']
    };

    // MEDIUM: Technical debt, impacts maintenance
    const mediumPatterns = {
        function_architecture: ['oversized_function', 'poor_error_handling'],
        logging_compliance: ['poor_logging_modernization', 'no_logging'],
        code_organization: ['no_section_headers', 'inconsistent_style'],
        performance: ['nested_loops', 'string_concat_in_loop']
    };

    // LOW: Nice to have, doesn't affect functionality
    const lowPatterns = {
        code_organization: ['missing_comments', 'inconsistent_indentation'],
        module_metadata: ['missing_purpose', 'missing_size_comment'],
        internal_dependencies: ['forward_reference']
    };

    // Check critical patterns
    if (criticalPatterns[category] && criticalPatterns[category].includes(type)) {
        return 'critical';
    }

    // Special cases for severity escalation
    if (category === 'function_architecture' && type === 'oversized_function') {
        if (violation.severity === 'critical' || (violation.lines && violation.lines > 200)) {
            return 'high';
        }
        return 'medium';
    }

    if (category === 'registration_compliance' && violation.accuracy_percentage !== undefined) {
        if (violation.accuracy_percentage < 80) {
            return 'critical';
        } else if (violation.accuracy_percentage < 95) {
            return 'high';
        }
        return 'medium';
    }

    // Check high patterns
    if (highPatterns[category] && highPatterns[category].includes(type)) {
        return 'high';
    }

    // Check medium patterns
    if (mediumPatterns[category] && mediumPatterns[category].includes(type)) {
        return 'medium';
    }

    // Check low patterns or default
    if (lowPatterns[category] && lowPatterns[category].includes(type)) {
        return 'low';
    }

    // Default based on category importance
    const categoryImportance = {
        es3_compliance: 'critical',
        reserved_word_safety: 'critical', 
        registration_compliance: 'high',
        function_architecture: 'medium',
        logging_compliance: 'medium',
        security_patterns: 'high',
        performance_indicators: 'medium',
        code_organization: 'low',
        module_metadata: 'low'
    };

    return categoryImportance[category] || 'medium';
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
            violations_count: analysis.es3_compliance.violations?.length || 0,
            total_penalty: analysis.es3_compliance.totalPenalty,
            critical_violations_count: analysis.es3_compliance.criticalViolations?.length || 0
        },

        reserved_word_safety: {
            safe: analysis.reserved_word_safety.safe,
            violations_count: analysis.reserved_word_safety.violations?.length || 0,
            total_penalty: analysis.reserved_word_safety.totalPenalty,
            critical_violations_count: analysis.reserved_word_safety.criticalViolations?.length || 0
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
 * Create issues and violations section with always-on code samples and impact-based severity
 * @param {Object} analysis - Module analysis
 * @param {Object} options - Report options (ignored - code samples now always included)
 * @returns {Object} Issues and violations
 */
const createIssuesSection = (analysis, options = {}) => {
    const issues = {
        critical_issues: [],
        high_priority_issues: [],
        medium_priority_issues: [],
        warnings: []
    };

    // ES3 compliance violations - ALWAYS INCLUDE CODE SAMPLES
    if (analysis.es3_compliance.violations && analysis.es3_compliance.violations.length > 0) {
        analysis.es3_compliance.violations.forEach(violation => {
            const severity = classifyViolationSeverity('es3_compliance', violation.type, violation);
            
            const issue = {
                category: 'es3_compliance',
                type: violation.type,
                description: violation.description || `ES3 violation: ${violation.type}`,
                locations: violation.locations || [],
                penalty: violation.penalty,
                severity: severity,
                impact: getImpactDescription('es3_compliance', violation.type),
                fix_suggestion: getFixSuggestion('es3_compliance', violation.type),
                // ALWAYS include code samples now
                code_examples: generateCodeExamples(violation)
            };

            // Classify by severity
            switch (severity) {
                case 'critical':
                    issues.critical_issues.push(issue);
                    break;
                case 'high':
                    issues.high_priority_issues.push(issue);
                    break;
                case 'medium':
                    issues.medium_priority_issues.push(issue);
                    break;
                default:
                    issues.warnings.push(issue);
            }
        });
    }

    // Reserved word safety violations
    if (analysis.reserved_word_safety.violations && analysis.reserved_word_safety.violations.length > 0) {
        analysis.reserved_word_safety.violations.forEach(violation => {
            const severity = classifyViolationSeverity('reserved_word_safety', violation.type, violation);
            
            const issue = {
                category: 'reserved_word_safety',
                type: violation.type,
                word: violation.word,
                description: `Dangerous property usage: '${violation.word}'`,
                locations: violation.locations || [],
                penalty: violation.penalty,
                severity: severity,
                impact: `Property '${violation.word}' may crash in ExtendScript environment`,
                fix_suggestion: `Rename property '${violation.word}' to avoid conflicts (e.g., '${violation.word}Settings')`,
                code_examples: generateCodeExamples(violation)
            };

            switch (severity) {
                case 'critical':
                    issues.critical_issues.push(issue);
                    break;
                case 'high':
                    issues.high_priority_issues.push(issue);
                    break;
                default:
                    issues.medium_priority_issues.push(issue);
            }
        });
    }

    // Registration compliance issues
    const registration = analysis.registration_compliance;
    if (registration.functionsNotRegistered && registration.functionsNotRegistered.length > 0) {
        const severity = classifyViolationSeverity('registration_compliance', 'functions_not_registered', {
            accuracy_percentage: registration.accuracyPercentage
        });

        const targetArray = severity === 'critical' ? issues.critical_issues : 
                           severity === 'high' ? issues.high_priority_issues : 
                           issues.medium_priority_issues;

        targetArray.push({
            category: 'registration_compliance',
            type: 'functions_not_registered',
            description: 'Functions exist in code but not registered',
            affected_functions: registration.functionsNotRegistered,
            severity: severity,
            impact: 'Functions will not be available at runtime - module initialization will fail',
            fix_suggestion: 'Add missing functions to registerModule() call',
            accuracy_percentage: registration.accuracyPercentage
        });
    }

    if (registration.registeredButNotFound && registration.registeredButNotFound.length > 0) {
        const severity = classifyViolationSeverity('registration_compliance', 'registered_but_not_found', {
            accuracy_percentage: registration.accuracyPercentage
        });

        const targetArray = severity === 'critical' ? issues.critical_issues : 
                           severity === 'high' ? issues.high_priority_issues : 
                           issues.medium_priority_issues;

        targetArray.push({
            category: 'registration_compliance',
            type: 'registered_but_not_found',
            description: 'Functions registered but not found in code',
            affected_functions: registration.registeredButNotFound,
            severity: severity,
            impact: 'Runtime errors when trying to call non-existent functions',
            fix_suggestion: 'Remove non-existent functions from registerModule() call',
            accuracy_percentage: registration.accuracyPercentage
        });
    }

    // Logging compliance issues
    if (analysis.logging_compliance.compliance === 'poor') {
        const severity = classifyViolationSeverity('logging_compliance', 'poor_logging_modernization');
        
        const targetArray = severity === 'medium' ? issues.medium_priority_issues : issues.warnings;
        targetArray.push({
            category: 'logging_compliance',
            type: 'poor_logging_modernization',
            description: `Low modern logging adoption: ${analysis.logging_compliance.modernPercentage}%`,
            severity: severity,
            impact: 'Difficult debugging and maintenance',
            fix_suggestion: 'Replace $.writeln() calls with modern logging functions (logDebug, logInfo, etc.)',
            modern_percentage: analysis.logging_compliance.modernPercentage
        });
    }

    // Function architecture issues
    if (analysis.function_architecture.oversizedFunctions && analysis.function_architecture.oversizedFunctions.length > 0) {
        analysis.function_architecture.oversizedFunctions.forEach(func => {
            const severity = classifyViolationSeverity('function_architecture', 'oversized_function', func);
            
            const issue = {
                category: 'function_architecture',
                type: 'oversized_function',
                function_name: func.name,
                line_count: func.lines,
                severity: severity,
                description: `Function '${func.name}' is ${severity} (${func.lines} lines)`,
                impact: func.lines > 200 ? 'Very difficult to maintain and debug' : 'Harder to maintain and test',
                fix_suggestion: func.lines > 200 ? 
                    'Critical: Break into smaller functions immediately' : 
                    'Consider refactoring to reduce function length'
            };

            switch (severity) {
                case 'high':
                    issues.high_priority_issues.push(issue);
                    break;
                case 'medium':
                    issues.medium_priority_issues.push(issue);
                    break;
                default:
                    issues.warnings.push(issue);
            }
        });
    }

    // Performance issues
    if (analysis.performance_indicators && analysis.performance_indicators.potential_issues) {
        analysis.performance_indicators.potential_issues.forEach(perfIssue => {
            const severity = classifyViolationSeverity('performance', perfIssue.type);
            
            const issue = {
                category: 'performance',
                type: perfIssue.type,
                count: perfIssue.count || 1,
                description: perfIssue.description,
                severity: severity,
                impact: getPerformanceImpact(perfIssue.type),
                fix_suggestion: getPerformanceFix(perfIssue.type)
            };

            switch (severity) {
                case 'high':
                    issues.high_priority_issues.push(issue);
                    break;
                case 'medium':
                    issues.medium_priority_issues.push(issue);
                    break;
                default:
                    issues.warnings.push(issue);
            }
        });
    }

    // Internal dependency warnings
    if (analysis.internal_dependencies && analysis.internal_dependencies.forwardReferences) {
        analysis.internal_dependencies.forwardReferences.forEach(ref => {
            issues.warnings.push({
                category: 'internal_dependencies',
                type: 'forward_reference',
                caller: ref.caller,
                called: ref.called,
                description: `Function calls another function defined later in file`,
                severity: 'low',
                impact: 'Potential execution order issues',
                fix_suggestion: 'Consider reordering functions to avoid forward references'
            });
        });
    }

    return issues;
};

// Helper functions for the enhanced issues section
function generateCodeExamples(violation) {
    if (!violation.locations || violation.locations.length === 0) {
        return [];
    }

    return violation.locations.slice(0, 3).map(lineNum => ({
        line_number: lineNum,
        code_sample: `Line ${lineNum}: [Code sample would be extracted from source file]`,
        suggested_fix: getSpecificFix(violation.type, lineNum)
    }));
}

function getImpactDescription(category, type) {
    const impacts = {
        es3_compliance: {
            destructuring: 'Will crash in ExtendScript environment',
            spread_operator: 'Will crash in ExtendScript environment', 
            forbidden_keyword: 'Will crash in ExtendScript environment',
            arrow_function: 'Will crash in ExtendScript environment',
            template_literal: 'Will crash in ExtendScript environment'
        },
        reserved_word_safety: {
            default: 'May crash in ExtendScript environment'
        }
    };

    return impacts[category]?.[type] || impacts[category]?.default || 'Potential runtime issues';
}

function getFixSuggestion(category, type) {
    const fixes = {
        es3_compliance: {
            destructuring: 'Replace with explicit assignment: var x = obj.x; var y = obj.y;',
            spread_operator: 'Replace with arrayConcat() or explicit operations',
            forbidden_keyword: 'Replace forbidden keywords (export → exportSettings)',
            arrow_function: 'Replace with function expressions',
            template_literal: 'Replace with string concatenation'
        }
    };

    return fixes[category]?.[type] || 'Review ES3 compatibility requirements';
}

function getSpecificFix(violationType, lineNumber) {
    const fixes = {
        destructuring: `var x = obj.x; var y = obj.y; // Replace destructuring`,
        spread_operator: `arrayConcat(arr1, arr2) // Replace spread operator`,
        forbidden_keyword: `exportSettings // Replace 'export' keyword`
    };

    return fixes[violationType] || 'Apply ES3-compatible fix';
}

function getPerformanceImpact(type) {
    const impacts = {
        nested_loops: 'Exponential time complexity - slow with large data sets',
        string_concat_in_loop: 'Memory allocation on every iteration - 10x slower'
    };

    return impacts[type] || 'Potential performance degradation';
}

function getPerformanceFix(type) {
    const fixes = {
        nested_loops: 'Use Map/Object for O(1) lookups instead of nested iteration',
        string_concat_in_loop: 'Use arrayJoin() pattern or createStringBuilder()'
    };

    return fixes[type] || 'Review performance impact and consider optimization';
}

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
            max_possible: 1000
        },

        score_components: {
            penalties_total: health.penalties || 0,
            bonuses_total: health.bonuses || 0,
            net_adjustments: (health.bonuses || 0) - (health.penalties || 0)
        },

        penalty_breakdown: health.penalty_breakdown || {},
        bonus_breakdown: health.bonus_breakdown || {},

        grade_explanation: getGradeExplanation(health.grade)
    };
};

/**
 * Get explanation for health grade
 * @param {string} grade - Health grade
 * @returns {string} Grade explanation
 */
const getGradeExplanation = (grade) => {
    const explanations = {
        'A+': 'Exemplary - exceeds all standards',
        'A': 'Excellent - minor improvements possible',
        'B+': 'Good - some issues to address',
        'B': 'Acceptable - notable improvements needed',
        'C+': 'Below standard - requires attention',
        'C': 'Poor - needs refactoring',
        'D': 'Critical issues present',
        'F': 'Unacceptable - major problems that must be fixed'
    };

    return explanations[grade] || 'Unknown grade';
};

/**
 * Create recommendations section
 * @param {Object} analysis - Module analysis
 * @returns {Array} Recommendations
 */
const createRecommendations = (analysis) => {
    const recommendations = [];

    // Critical priority recommendations
    if (!analysis.es3_compliance.compliant) {
        recommendations.push({
            priority: 'critical',
            category: 'es3_compliance',
            title: 'Fix ES3 Compatibility Issues',
            description: `${analysis.es3_compliance.violations?.length || 0} critical ES3 violations found`,
            action: 'Review and fix all ES3 compatibility violations to ensure ExtendScript compatibility',
            estimated_effort: 'medium'
        });
    }

    // High priority recommendations
    if (analysis.registration_compliance.accuracyPercentage < 100) {
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
    if (analysis.function_architecture.oversizedFunctions && analysis.function_architecture.oversizedFunctions.length > 0) {
        const criticalCount = analysis.function_architecture.oversizedFunctions.filter(f => f.severity === 'critical').length;
        
        if (criticalCount > 0) {
            recommendations.push({
                priority: 'high',
                category: 'function_architecture',
                title: 'Refactor Oversized Functions',
                description: `${criticalCount} critically oversized functions found`,
                action: 'Break down large functions into smaller, more manageable pieces',
                estimated_effort: 'high'
            });
        }
    }

    return recommendations;
};

export default {
    generateIndividualModuleReport
};