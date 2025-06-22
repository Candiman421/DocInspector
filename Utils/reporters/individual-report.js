// reporters/individual-report.js
// INDIVIDUAL MODULE REPORT GENERATOR - FIXED VERSION
// ZERO FALSE POSITIVE TOLERANCE - ONLY REPORT REAL, ACTIONABLE ISSUES
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
import { extractFunctionCode, extractViolationExamples } from './code-snippet-extractor.js';
import { CONFIDENCE_LEVELS, SEVERITY_CLASSIFICATION } from '../config/analysis-rules.js';

/**
 * FIXED - Generate individual module analysis report with zero false positives
 * ONLY REPORTS REAL, ACTIONABLE ISSUES
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

        // CRITICAL - Filter out false positives before reporting
        const filteredAnalysis = filterFalsePositives(analysis);

        // Create structured report data with confidence-based filtering
        const reportData = createModuleReportData(filteredAnalysis, options);

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
 * CRITICAL - Filter out false positives before reporting
 * ZERO TOLERANCE for false positive reports
 * @param {Object} analysis - Module analysis results
 * @returns {Object} Filtered analysis with only real issues
 */
const filterFalsePositives = (analysis) => {
    const filtered = JSON.parse(JSON.stringify(analysis)); // Deep clone

    // CRITICAL - Filter ES3 compliance violations by confidence
    if (filtered.es3_compliance.violations) {
        const originalCount = filtered.es3_compliance.violations.length;
        
        filtered.es3_compliance.violations = filtered.es3_compliance.violations.filter(violation => {
            // Only include high confidence violations
            if ((violation.confidence || 0) < CONFIDENCE_LEVELS.MEDIUM) {
                console.warn(chalk.yellow(`Filtering low confidence ES3 violation: ${violation.type} (confidence: ${violation.confidence})`));
                return false;
            }

            // Additional validation for common false positive patterns
            if (violation.type === 'destructuring' && violation.match_text) {
                // Check if this is actually object property assignment
                if (violation.match_text.includes('=') && !violation.match_text.includes('{')) {
                    console.warn(chalk.yellow(`Filtering likely false positive destructuring: ${violation.match_text}`));
                    return false;
                }
            }

            return true;
        });

        if (filtered.es3_compliance.violations.length < originalCount) {
            console.log(chalk.yellow(`⚠️  Filtered ${originalCount - filtered.es3_compliance.violations.length} potential false positive ES3 violations`));
            
            // Update compliance status if all violations were filtered
            if (filtered.es3_compliance.violations.length === 0) {
                filtered.es3_compliance.compliant = true;
                filtered.es3_compliance.totalPenalty = 0;
                filtered.es3_compliance.criticalViolations = [];
            }
        }
    }

    // CRITICAL - Filter reserved word safety violations by confidence
    if (filtered.reserved_word_safety.violations) {
        const originalCount = filtered.reserved_word_safety.violations.length;
        
        filtered.reserved_word_safety.violations = filtered.reserved_word_safety.violations.filter(violation => {
            // Only include high confidence violations
            if ((violation.confidence || 0) < CONFIDENCE_LEVELS.MEDIUM) {
                console.warn(chalk.yellow(`Filtering low confidence reserved word violation: ${violation.word} (confidence: ${violation.confidence})`));
                return false;
            }

            // Additional validation - must be actual property usage
            if (!violation.match_text || (!violation.match_text.includes('.') && !violation.match_text.includes('[') && !violation.match_text.includes(':'))) {
                console.warn(chalk.yellow(`Filtering non-property reserved word usage: ${violation.word}`));
                return false;
            }

            return true;
        });

        if (filtered.reserved_word_safety.violations.length < originalCount) {
            console.log(chalk.yellow(`⚠️  Filtered ${originalCount - filtered.reserved_word_safety.violations.length} potential false positive reserved word violations`));
            
            // Update safety status if all violations were filtered
            if (filtered.reserved_word_safety.violations.length === 0) {
                filtered.reserved_word_safety.safe = true;
                filtered.reserved_word_safety.totalPenalty = 0;
                filtered.reserved_word_safety.criticalViolations = [];
            }
        }
    }

    // Filter logging compliance violations by confidence
    if (filtered.logging_compliance.violations) {
        filtered.logging_compliance.violations = filtered.logging_compliance.violations.filter(violation => {
            return (violation.confidence || 0) >= CONFIDENCE_LEVELS.MEDIUM;
        });
    }

    return filtered;
};

/**
 * ENHANCED - Create comprehensive module report data structure
 * ONLY INCLUDES REAL, ACTIONABLE ISSUES
 * @param {Object} analysis - Module analysis results (filtered)
 * @param {Object} options - Report generation options
 * @returns {Object} Report data structure
 */
const createModuleReportData = (analysis, options = {}) => {
    return {
        // NEW - Executive summary for immediate action
        executive_summary: createExecutiveSummary(analysis),

        // Enhanced sections with confidence-based reporting
        module_summary: createModuleSummary(analysis),
        function_analysis: createFunctionAnalysis(analysis),
        code_quality: createCodeQualityAssessment(analysis),
        
        // CRITICAL - Only real issues with confidence scores
        issues_and_violations: createConfidenceBasedIssuesSection(analysis, options),
        
        health_score_breakdown: createHealthScoreBreakdown(analysis),
        recommendations: createActionableRecommendations(analysis)
    };
};

/**
 * ENHANCED - Create executive summary with only critical, actionable items
 * @param {Object} analysis - Module analysis
 * @returns {Object} Executive summary focused on production blockers
 */
const createExecutiveSummary = (analysis) => {
    const summary = {
        production_readiness: 'unknown',
        blocking_issues: [],
        immediate_actions: [],
        quality_metrics: {
            health_grade: analysis.health_score.grade,
            es3_compliant: analysis.es3_compliance.compliant,
            registration_accurate: analysis.registration_compliance.isCompliant,
            high_confidence_violations: 0
        },
        deployment_recommendation: 'unknown'
    };

    let blockingIssueCount = 0;
    let highConfidenceViolations = 0;

    // Count only high-confidence, real violations
    const allViolations = [
        ...(analysis.es3_compliance.violations || []),
        ...(analysis.reserved_word_safety.violations || []),
        ...(analysis.logging_compliance.violations || [])
    ];

    allViolations.forEach(violation => {
        if ((violation.confidence || 0) >= CONFIDENCE_LEVELS.HIGH) {
            highConfidenceViolations++;
            
            if (violation.severity === 'CRITICAL') {
                blockingIssueCount++;
                summary.blocking_issues.push({
                    type: violation.type,
                    description: violation.description,
                    confidence: violation.confidence_level || 'HIGH',
                    fix: violation.fix_suggestion || `Fix ${violation.type}`
                });
            }
        }
    });

    summary.quality_metrics.high_confidence_violations = highConfidenceViolations;

    // Registration issues that are certain
    if (!analysis.registration_compliance.isCompliant) {
        const missingFunctions = analysis.registration_compliance.functionsNotRegistered || [];
        const extraFunctions = analysis.registration_compliance.registeredButNotFound || [];
        
        if (missingFunctions.length > 0) {
            blockingIssueCount++;
            summary.blocking_issues.push({
                type: 'missing_function_registration',
                description: `${missingFunctions.length} functions not registered`,
                confidence: 'CERTAIN',
                fix: `Add to registerModule(): ${missingFunctions.slice(0, 3).join(', ')}`
            });
        }
        
        if (extraFunctions.length > 0) {
            summary.blocking_issues.push({
                type: 'invalid_function_registration',
                description: `${extraFunctions.length} non-existent functions registered`,
                confidence: 'CERTAIN',
                fix: `Remove from registerModule(): ${extraFunctions.slice(0, 3).join(', ')}`
            });
        }
    }

    // Immediate actions (top 3 most critical)
    if (blockingIssueCount > 0) {
        summary.immediate_actions = summary.blocking_issues
            .slice(0, 3)
            .map(issue => ({
                priority: 'CRITICAL',
                action: issue.fix,
                reason: issue.description
            }));
    }

    // Production readiness assessment
    if (blockingIssueCount === 0 && analysis.health_score.total_score >= 800) {
        summary.production_readiness = 'READY';
        summary.deployment_recommendation = 'Safe to deploy - no blocking issues detected';
    } else if (blockingIssueCount > 0) {
        summary.production_readiness = 'BLOCKED';
        summary.deployment_recommendation = `BLOCKED: ${blockingIssueCount} critical issues must be fixed before deployment`;
    } else {
        summary.production_readiness = 'CAUTION';
        summary.deployment_recommendation = 'Deployment possible but quality improvements recommended';
    }

    return summary;
};

/**
 * ENHANCED - Create module summary section
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

        // ENHANCED - Compliance status with confidence indicators
        compliance_status: {
            es3_compliant: analysis.es3_compliance.compliant,
            es3_violations_high_confidence: (analysis.es3_compliance.violations || [])
                .filter(v => (v.confidence || 0) >= CONFIDENCE_LEVELS.HIGH).length,
            reserved_word_safe: analysis.reserved_word_safety.safe,
            reserved_word_violations_high_confidence: (analysis.reserved_word_safety.violations || [])
                .filter(v => (v.confidence || 0) >= CONFIDENCE_LEVELS.HIGH).length,
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
            high_confidence_violations: (analysis.es3_compliance.violations || [])
                .filter(v => (v.confidence || 0) >= CONFIDENCE_LEVELS.HIGH).length,
            total_penalty: analysis.es3_compliance.totalPenalty,
            critical_violations_count: analysis.es3_compliance.criticalViolations?.length || 0
        },

        reserved_word_safety: {
            safe: analysis.reserved_word_safety.safe,
            violations_count: analysis.reserved_word_safety.violations?.length || 0,
            high_confidence_violations: (analysis.reserved_word_safety.violations || [])
                .filter(v => (v.confidence || 0) >= CONFIDENCE_LEVELS.HIGH).length,
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
 * CRITICAL - Create issues section with confidence-based filtering
 * ONLY REPORTS HIGH-CONFIDENCE, REAL ISSUES
 * @param {Object} analysis - Module analysis (already filtered)
 * @param {Object} options - Report options
 * @returns {Object} Issues and violations with confidence scores
 */
const createConfidenceBasedIssuesSection = (analysis, options = {}) => {
    const issues = {
        critical_issues: [],
        high_priority_issues: [],
        medium_priority_issues: [],
        warnings: [],
        
        // NEW - Confidence summary
        confidence_summary: {
            total_high_confidence_issues: 0,
            total_medium_confidence_issues: 0,
            issues_requiring_manual_review: 0
        }
    };

    let highConfidenceCount = 0;
    let mediumConfidenceCount = 0;

    // CRITICAL - ES3 compliance violations (only high confidence)
    if (analysis.es3_compliance.violations) {
        analysis.es3_compliance.violations.forEach(violation => {
            const confidence = violation.confidence || 0;
            const confidenceLevel = violation.confidence_level || getConfidenceLevel(confidence);
            
            if (confidence >= CONFIDENCE_LEVELS.HIGH) {
                highConfidenceCount++;
                
                const issue = {
                    category: 'es3_compliance',
                    type: violation.type,
                    description: violation.description,
                    line: violation.line,
                    column: violation.column,
                    confidence: confidence,
                    confidence_level: confidenceLevel,
                    severity: 'CRITICAL',
                    code_sample: violation.code_sample || violation.match_text,
                    fix_suggestion: violation.fix_suggestion,
                    impact: 'Will crash in ExtendScript environment',
                    estimated_fix_time: estimateFixTime(violation.type, 'CRITICAL')
                };

                issues.critical_issues.push(issue);
            } else if (confidence >= CONFIDENCE_LEVELS.MEDIUM) {
                mediumConfidenceCount++;
                issues.warnings.push({
                    category: 'es3_compliance',
                    type: violation.type,
                    description: `Possible ${violation.type} (requires manual review)`,
                    confidence_level: confidenceLevel,
                    severity: 'REVIEW_REQUIRED',
                    manual_review_needed: true
                });
            }
        });
    }

    // CRITICAL - Reserved word safety violations (only high confidence)
    if (analysis.reserved_word_safety.violations) {
        analysis.reserved_word_safety.violations.forEach(violation => {
            const confidence = violation.confidence || 0;
            const confidenceLevel = violation.confidence_level || getConfidenceLevel(confidence);
            
            if (confidence >= CONFIDENCE_LEVELS.HIGH) {
                highConfidenceCount++;
                
                const issue = {
                    category: 'reserved_word_safety',
                    type: violation.type,
                    word: violation.word,
                    description: violation.description,
                    line: violation.line,
                    confidence: confidence,
                    confidence_level: confidenceLevel,
                    severity: violation.critical ? 'CRITICAL' : 'HIGH',
                    code_sample: violation.code_sample || violation.match_text,
                    fix_suggestion: violation.fix_suggestion,
                    impact: violation.critical ? 'Will crash in ExtendScript' : 'May cause conflicts',
                    estimated_fix_time: estimateFixTime(violation.type, violation.critical ? 'CRITICAL' : 'HIGH')
                };

                if (violation.critical) {
                    issues.critical_issues.push(issue);
                } else {
                    issues.high_priority_issues.push(issue);
                }
            }
        });
    }

    // Registration compliance issues (always high confidence)
    const registration = analysis.registration_compliance;
    if (!registration.isCompliant) {
        if (registration.functionsNotRegistered && registration.functionsNotRegistered.length > 0) {
            highConfidenceCount++;
            issues.critical_issues.push({
                category: 'registration_compliance',
                type: 'functions_not_registered',
                description: `${registration.functionsNotRegistered.length} functions not registered`,
                affected_functions: registration.functionsNotRegistered,
                confidence: CONFIDENCE_LEVELS.CERTAIN,
                confidence_level: 'CERTAIN',
                severity: 'CRITICAL',
                impact: 'Functions will not be available at runtime',
                fix_suggestion: `Add to registerModule(): ['${registration.functionsNotRegistered.join("', '")}']`,
                estimated_fix_time: '5 minutes'
            });
        }

        if (registration.registeredButNotFound && registration.registeredButNotFound.length > 0) {
            highConfidenceCount++;
            issues.high_priority_issues.push({
                category: 'registration_compliance',
                type: 'registered_but_not_found',
                description: `${registration.registeredButNotFound.length} non-existent functions registered`,
                affected_functions: registration.registeredButNotFound,
                confidence: CONFIDENCE_LEVELS.CERTAIN,
                confidence_level: 'CERTAIN',
                severity: 'HIGH',
                impact: 'Runtime errors when trying to call non-existent functions',
                fix_suggestion: `Remove from registerModule(): ['${registration.registeredButNotFound.join("', '")}']`,
                estimated_fix_time: '3 minutes'
            });
        }
    }

    // Performance and security issues (filtered by confidence)
    if (analysis.security_patterns?.security_issues) {
        analysis.security_patterns.security_issues.forEach(secIssue => {
            const confidence = secIssue.confidence || CONFIDENCE_LEVELS.HIGH;
            
            if (confidence >= CONFIDENCE_LEVELS.HIGH) {
                highConfidenceCount++;
                issues.critical_issues.push({
                    category: 'security',
                    type: secIssue.type,
                    description: secIssue.description,
                    confidence: confidence,
                    confidence_level: getConfidenceLevel(confidence),
                    severity: secIssue.severity,
                    impact: 'Security vulnerability',
                    fix_suggestion: `Remove or replace ${secIssue.type}`,
                    estimated_fix_time: estimateFixTime(secIssue.type, secIssue.severity)
                });
            }
        });
    }

    // Update confidence summary
    issues.confidence_summary.total_high_confidence_issues = highConfidenceCount;
    issues.confidence_summary.total_medium_confidence_issues = mediumConfidenceCount;
    issues.confidence_summary.issues_requiring_manual_review = mediumConfidenceCount;

    return issues;
};

/**
 * Get confidence level description
 * @param {number} confidence - Confidence score
 * @returns {string} Confidence level name
 */
const getConfidenceLevel = (confidence) => {
    if (confidence >= CONFIDENCE_LEVELS.CERTAIN) return 'CERTAIN';
    if (confidence >= CONFIDENCE_LEVELS.HIGH) return 'HIGH';
    if (confidence >= CONFIDENCE_LEVELS.MEDIUM) return 'MEDIUM';
    if (confidence >= CONFIDENCE_LEVELS.LOW) return 'LOW';
    return 'UNCERTAIN';
};

/**
 * Estimate fix time based on violation type and severity
 * @param {string} violationType - Type of violation
 * @param {string} severity - Severity level
 * @returns {string} Estimated fix time
 */
const estimateFixTime = (violationType, severity) => {
    const fixTimes = {
        // ES3 compliance fixes
        'destructuring': '10 minutes',
        'arrow_function': '5 minutes',
        'template_literal': '8 minutes',
        'const_declaration': '2 minutes',
        'let_declaration': '2 minutes',
        
        // Reserved word fixes
        'dangerous_property_usage': '5 minutes',
        
        // Security fixes
        'eval_usage': '15 minutes',
        'function_constructor': '10 minutes',
        
        // Default estimates by severity
        'CRITICAL': '15 minutes',
        'HIGH': '10 minutes',
        'MEDIUM': '5 minutes'
    };
    
    return fixTimes[violationType] || fixTimes[severity] || '10 minutes';
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
            max_possible: 1000
        },

        score_components: {
            penalties_total: health.penalties || 0,
            bonuses_total: health.bonuses || 0,
            net_adjustments: (health.bonuses || 0) - (health.penalties || 0)
        },

        // ENHANCED - Confidence-based penalty breakdown
        violation_analysis: {
            total_violations: health.violations_count || 0,
            high_confidence_violations: health.high_confidence_violations || 0,
            critical_penalties_applied: Math.round((health.penalties || 0) * 0.6), // Estimate
            confidence_adjustments_made: health.violations_count > health.high_confidence_violations
        },

        grade_explanation: getGradeExplanation(health.grade, health.total_score)
    };
};

/**
 * Get explanation for health grade with specific score context
 * @param {string} grade - Health grade
 * @param {number} score - Actual score
 * @returns {string} Grade explanation
 */
const getGradeExplanation = (grade, score) => {
    const explanations = {
        'A+': `Exemplary module (${score}/1000) - ready for production deployment`,
        'A': `Excellent module (${score}/1000) - minor improvements possible`,
        'B+': `Good module (${score}/1000) - some issues to address before deployment`,
        'B': `Acceptable module (${score}/1000) - notable improvements needed`,
        'C+': `Below standard (${score}/1000) - requires attention before production use`,
        'C': `Poor quality (${score}/1000) - needs refactoring`,
        'D': `Critical issues present (${score}/1000) - deployment not recommended`,
        'F': `Unacceptable quality (${score}/1000) - major problems must be fixed`
    };

    return explanations[grade] || `Grade ${grade} (${score}/1000)`;
};

/**
 * ENHANCED - Create actionable recommendations
 * @param {Object} analysis - Module analysis
 * @returns {Array} Recommendations prioritized by impact
 */
const createActionableRecommendations = (analysis) => {
    const recommendations = [];

    // CRITICAL - ES3 compliance (if any high-confidence violations remain)
    const highConfidenceES3 = (analysis.es3_compliance.violations || [])
        .filter(v => (v.confidence || 0) >= CONFIDENCE_LEVELS.HIGH);
    
    if (highConfidenceES3.length > 0) {
        recommendations.push({
            priority: 'CRITICAL',
            category: 'es3_compliance',
            title: 'Fix ES3 compatibility violations',
            description: `${highConfidenceES3.length} confirmed ES3 violations will crash ExtendScript`,
            action: 'Review and fix all ES3 compatibility violations immediately',
            estimated_effort: 'medium',
            estimated_time: `${highConfidenceES3.length * 10} minutes`,
            deployment_blocker: true,
            specific_fixes: highConfidenceES3.map(v => v.fix_suggestion).filter(f => f)
        });
    }

    // HIGH - Registration accuracy
    if (!analysis.registration_compliance.isCompliant) {
        recommendations.push({
            priority: 'HIGH',
            category: 'registration_compliance',
            title: 'Fix function registration mismatches',
            description: `Registration accuracy: ${analysis.registration_compliance.accuracyPercentage}%`,
            action: 'Update registerModule() call to match actual function exports',
            estimated_effort: 'low',
            estimated_time: '5 minutes',
            specific_fixes: [
                analysis.registration_compliance.functionsNotRegistered?.length > 0 
                    ? `Add: ${analysis.registration_compliance.functionsNotRegistered.slice(0, 3).join(', ')}`
                    : null,
                analysis.registration_compliance.registeredButNotFound?.length > 0
                    ? `Remove: ${analysis.registration_compliance.registeredButNotFound.slice(0, 3).join(', ')}`
                    : null
            ].filter(f => f)
        });
    }

    // MEDIUM - Performance improvements
    if (analysis.function_architecture.oversizedFunctions?.length > 0) {
        const criticalOversized = analysis.function_architecture.oversizedFunctions
            .filter(f => f.severity === 'critical');
        
        if (criticalOversized.length > 0) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'function_architecture',
                title: 'Refactor oversized functions',
                description: `${criticalOversized.length} functions exceed size guidelines`,
                action: 'Break down large functions into smaller, manageable pieces',
                estimated_effort: 'high',
                affected_functions: criticalOversized.map(f => f.name)
            });
        }
    }

    // LOW - Code organization
    if ((analysis.code_organization?.organization_score || 0) < 60) {
        recommendations.push({
            priority: 'LOW',
            category: 'code_organization',
            title: 'Improve code organization',
            description: 'Code organization could be improved with better structure',
            action: 'Add section headers and improve code grouping',
            estimated_effort: 'low'
        });
    }

    return recommendations;
};

export default {
    generateIndividualModuleReport
};