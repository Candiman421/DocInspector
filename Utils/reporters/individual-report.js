// reporters/individual-report.js
// INDIVIDUAL MODULE REPORT GENERATOR - UPDATED FOR ENHANCED ANALYSIS INTEGRATION
// Generate detailed YAML reports for individual module analysis
// UPDATED: Seamless integration with enhanced analysis modules, confidence scoring, enhanced data structures
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
import { extractViolationExamples } from './code-snippet-extractor.js';

/**
 * Generate individual module analysis report - UPDATED FOR ENHANCED ANALYSIS
 * @param {Object} moduleAnalysis - Complete module analysis result with enhanced data structures
 * @param {string} outputPath - Directory to write report
 * @param {Object} options - Report generation options
 * @returns {Object} Report generation result
 */
export const generateIndividualModuleReport = (moduleAnalysis, outputPath, options = {}) => {
    const startTime = Date.now();

    try {
        console.log(chalk.cyan(`📝 Generating enhanced module report...`));

        if (!moduleAnalysis.success) {
            throw new Error(`Cannot generate report for failed analysis: ${moduleAnalysis.error}`);
        }

        const analysis = moduleAnalysis.analysis;
        const filename = analysis.module_info?.filename || 'unknown-module';

        // UPDATED: Apply confidence filtering to remove uncertain detections
        const filteredAnalysis = applyConfidenceFiltering(analysis, options);
        
        // UPDATED: Create structured report data with enhanced confidence scoring
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

        console.log(chalk.green(`✅ Enhanced report generated: ${path.basename(reportFilename)} (${Math.round(reportSize / 1024)}KB, ${reportTime}ms)`));

        return {
            success: true,
            reportPath: reportFilename,
            reportSize,
            generationTime: reportTime,
            filename: path.basename(reportFilename),
            confidence_stats: reportData.confidence_summary
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
 * UPDATED: Apply confidence filtering to remove uncertain detections
 * @param {Object} analysis - Module analysis results with enhanced data structures
 * @param {Object} options - Filtering options
 * @returns {Object} Filtered analysis with only high-confidence issues
 */
const applyConfidenceFiltering = (analysis, options = {}) => {
    const confidenceThreshold = options.confidenceThreshold || 70;
    const filteredAnalysis = { ...analysis };

    // UPDATED: Filter ES3 compliance violations by confidence level
    if (filteredAnalysis.es3_compliance?.violations) {
        filteredAnalysis.es3_compliance.violations = filteredAnalysis.es3_compliance.violations.filter(violation => {
            const confidence = violation.confidence_level || violation.confidence_score || 50;
            return confidence >= confidenceThreshold;
        });
    }

    // UPDATED: Filter reserved word safety violations by confidence level
    if (filteredAnalysis.reserved_word_safety?.violations) {
        filteredAnalysis.reserved_word_safety.violations = filteredAnalysis.reserved_word_safety.violations.filter(violation => {
            const confidence = violation.confidence_level || violation.confidence_score || 50;
            return confidence >= confidenceThreshold;
        });
    }

    // UPDATED: Filter registration compliance issues (usually high confidence)
    if (filteredAnalysis.registration_compliance?.issues) {
        filteredAnalysis.registration_compliance.issues = filteredAnalysis.registration_compliance.issues.filter(issue => {
            const confidence = issue.confidence_level || issue.confidence || 90; // Registration issues usually high confidence
            return confidence >= confidenceThreshold;
        });
    }

    return filteredAnalysis;
};

/**
 * UPDATED: Create comprehensive module report data structure with enhanced integration
 * @param {Object} analysis - Filtered module analysis results with enhanced data
 * @param {Object} options - Report generation options
 * @returns {Object} Report data structure
 */
const createModuleReportData = (analysis, options = {}) => {
    const reportData = {
        // UPDATED: Executive summary with enhanced confidence metrics
        executive_summary: createExecutiveSummary(analysis),

        // UPDATED: Module summary with enhanced trust indicators
        module_summary: createModuleSummary(analysis),

        // UPDATED: Function analysis with enhanced inventory data
        function_analysis: createFunctionAnalysis(analysis),

        // UPDATED: Code quality with enhanced confidence scores
        code_quality: createCodeQualityAssessment(analysis),

        // UPDATED: Only trusted issues - enhanced confidence filtering
        verified_issues: createVerifiedIssuesSection(analysis, options),

        // UPDATED: Health score with enhanced confidence weighting
        health_assessment: createHealthAssessment(analysis),

        // UPDATED: Actionable recommendations with enhanced prioritization
        actionable_recommendations: createActionableRecommendations(analysis),

        // UPDATED: Enhanced confidence summary
        confidence_summary: createConfidenceSummary(analysis),

        // UPDATED: Enhanced analysis metadata
        analysis_metadata: createAnalysisMetadata(analysis, options)
    };

    return reportData;
};

/**
 * UPDATED: Create executive summary with enhanced confidence-based assessment
 * @param {Object} analysis - Module analysis with enhanced data structures
 * @returns {Object} Executive summary with enhanced confidence metrics
 */
const createExecutiveSummary = (analysis) => {
    const summary = {
        critical_blockers: [],
        confidence_level: 'high', // high, medium, low
        production_readiness: 'unknown',
        quick_stats: {
            health_grade: analysis.health_score?.grade || 'F',
            confidence_weighted_grade: calculateConfidenceWeightedGrade(analysis),
            verified_critical_issues: 0,
            uncertain_detections: 0,
            estimated_fix_time: 'unknown'
        },
        top_3_actions: [],
        // UPDATED: Enhanced analysis indicators
        analysis_quality: {
            registration_detection_method: analysis.registration_compliance?.analysis_method || 'standard',
            function_inventory_method: analysis.function_inventory?.analysis_method || 'standard',
            fallback_recovery_used: analysis.function_inventory?.fallback_used || false,
            force_stable_mode: analysis.function_inventory?.forceStable || false
        }
    };

    let verifiedCriticalIssues = 0;
    let uncertainDetections = 0;
    let estimatedHours = 0;

    // UPDATED: Count only high-confidence critical issues with enhanced data structure support
    if (analysis.es3_compliance?.violations) {
        analysis.es3_compliance.violations.forEach(violation => {
            const confidence = violation.confidence_level || violation.confidence_score || 50;
            if (confidence >= 85) {
                verifiedCriticalIssues++;
                summary.critical_blockers.push(`HIGH CONFIDENCE: ${violation.type || violation.violation_type} (${confidence}% confident)`);
                estimatedHours += 0.25; // 15 minutes per verified violation
            } else {
                uncertainDetections++;
            }
        });
    }

    // UPDATED: Enhanced reserved word violation handling
    if (analysis.reserved_word_safety?.violations) {
        analysis.reserved_word_safety.violations.forEach(violation => {
            const confidence = violation.confidence_level || violation.confidence_score || 50;
            if (confidence >= 85) {
                verifiedCriticalIssues++;
                summary.critical_blockers.push(`HIGH CONFIDENCE: Reserved word '${violation.word}' (${confidence}% confident)`);
                estimatedHours += 0.1; // 6 minutes per verified violation
            } else {
                uncertainDetections++;
            }
        });
    }

    // UPDATED: Enhanced registration issues (these are usually high confidence from enhanced detection)
    const registrationAccuracy = analysis.registration_compliance?.accuracyPercentage || 
                                analysis.registration_compliance?.accuracy || 0;
    if (registrationAccuracy < 100) {
        const missingCount = analysis.registration_compliance?.functionsNotRegistered?.length || 
                           analysis.registration_compliance?.missingFunctions?.length || 0;
        const extraCount = analysis.registration_compliance?.registeredButNotFound?.length || 
                          analysis.registration_compliance?.extraFunctions?.length || 0;
        if (missingCount + extraCount > 0) {
            verifiedCriticalIssues++;
            summary.critical_blockers.push(`VERIFIED: Function registration mismatches (${missingCount + extraCount} issues)`);
            estimatedHours += 0.5; // 30 minutes to fix registration
        }
    }

    // UPDATED: Enhanced stats calculation
    summary.quick_stats.verified_critical_issues = verifiedCriticalIssues;
    summary.quick_stats.uncertain_detections = uncertainDetections;
    summary.quick_stats.estimated_fix_time = estimatedHours >= 1 ?
        `${Math.ceil(estimatedHours)} hours` : 
        `${Math.ceil(estimatedHours * 60)} minutes`;

    // UPDATED: Enhanced confidence level determination
    if (uncertainDetections === 0) {
        summary.confidence_level = 'high';
    } else if (uncertainDetections <= verifiedCriticalIssues) {
        summary.confidence_level = 'medium';
    } else {
        summary.confidence_level = 'low';
    }

    // UPDATED: Enhanced production readiness assessment
    if (verifiedCriticalIssues === 0) {
        summary.production_readiness = 'ready';
    } else if (verifiedCriticalIssues <= 2) {
        summary.production_readiness = 'minor_fixes_needed';
    } else {
        summary.production_readiness = 'major_fixes_required';
    }

    // UPDATED: Enhanced top 3 actions - only for verified issues
    const actions = [];

    // High-confidence ES3 violations with specific fixes
    if (analysis.es3_compliance?.violations) {
        const highConfidenceViolations = analysis.es3_compliance.violations.filter(v => 
            (v.confidence_level || v.confidence_score || 50) >= 90);
        if (highConfidenceViolations.length > 0) {
            const violation = highConfidenceViolations[0];
            const locations = violation.locations || violation.examples || [];
            const confidence = violation.confidence_level || violation.confidence_score || 90;
            actions.push(`VERIFIED: Fix ${violation.type || violation.violation_type} in line ${locations[0]?.line || 'unknown'} (${confidence}% confidence)`);
        }
    }

    // High-confidence registration issues with enhanced data access
    const missingFunctions = analysis.registration_compliance?.functionsNotRegistered || 
                            analysis.registration_compliance?.missingFunctions || [];
    if (missingFunctions.length > 0) {
        const missing = missingFunctions.slice(0, 2);
        actions.push(`VERIFIED: Register missing functions: ${missing.join(', ')}`);
    }

    const extraFunctions = analysis.registration_compliance?.registeredButNotFound || 
                          analysis.registration_compliance?.extraFunctions || [];
    if (extraFunctions.length > 0) {
        const extra = extraFunctions.slice(0, 2);
        actions.push(`VERIFIED: Remove non-existent functions from registration: ${extra.join(', ')}`);
    }

    summary.top_3_actions = actions.slice(0, 3);

    return summary;
};

/**
 * UPDATED: Calculate confidence-weighted grade with enhanced data support
 * @param {Object} analysis - Module analysis with enhanced data structures
 * @returns {String} Confidence-weighted grade
 */
const calculateConfidenceWeightedGrade = (analysis) => {
    let baseScore = analysis.health_score?.total_score || analysis.health_score?.score || 0;
    let confidencePenalty = 0;

    // UPDATED: Reduce score for uncertain detections with enhanced confidence access
    if (analysis.es3_compliance?.violations) {
        analysis.es3_compliance.violations.forEach(violation => {
            const confidence = violation.confidence_level || violation.confidence_score || 50;
            if (confidence < 85) {
                confidencePenalty += 20; // Penalty for uncertain violations
            }
        });
    }

    if (analysis.reserved_word_safety?.violations) {
        analysis.reserved_word_safety.violations.forEach(violation => {
            const confidence = violation.confidence_level || violation.confidence_score || 50;
            if (confidence < 85) {
                confidencePenalty += 15;
            }
        });
    }

    const adjustedScore = Math.max(0, baseScore - confidencePenalty);

    // Convert to grade
    if (adjustedScore >= 950) return 'A+';
    if (adjustedScore >= 900) return 'A';
    if (adjustedScore >= 850) return 'B+';
    if (adjustedScore >= 800) return 'B';
    if (adjustedScore >= 750) return 'C+';
    if (adjustedScore >= 700) return 'C';
    if (adjustedScore >= 600) return 'D';
    return 'F';
};

/**
 * UPDATED: Create module summary section with enhanced data structure support
 * @param {Object} analysis - Module analysis with enhanced data
 * @returns {Object} Module summary
 */
const createModuleSummary = (analysis) => {
    const info = analysis.module_info || {};
    const health = analysis.health_score || {};

    return {
        basic_info: {
            filename: info.filename || 'unknown',
            version: info.version || 'unknown',
            file_size_kb: info.file_size_kb || 0,
            line_count: info.line_count || 0,
            code_lines: info.code_lines || 0,
            comment_lines: info.comment_lines || 0,
            blank_lines: info.blank_lines || 0,
            last_modified: info.last_modified || 'unknown'
        },

        overview_metrics: {
            total_functions: analysis.function_inventory?.total_count || 0,
            global_functions: analysis.function_inventory?.globalCount || analysis.function_inventory?.global_count || 0,
            nested_functions: analysis.function_inventory?.nestedCount || analysis.function_inventory?.nested_count || 0,
            health_score: health.total_score || health.score || 0,
            health_grade: health.grade || 'F',
            health_percentage: health.percentage || 0
        },

        // UPDATED: Enhanced compliance status with confidence metrics
        compliance_status: {
            es3_compliant: analysis.es3_compliance?.compliant || false,
            es3_confidence: analysis.es3_compliance?.confidence_level || 
                          (analysis.es3_compliance?.violations ? 
                            Math.round(analysis.es3_compliance.violations.reduce((sum, v) => 
                              sum + (v.confidence_level || v.confidence_score || 50), 0) / 
                              Math.max(1, analysis.es3_compliance.violations.length)) : 100),
            reserved_word_safe: analysis.reserved_word_safety?.safe || true,
            reserved_word_confidence: analysis.reserved_word_safety?.confidence_level ||
                                    (analysis.reserved_word_safety?.violations ? 
                                      Math.round(analysis.reserved_word_safety.violations.reduce((sum, v) => 
                                        sum + (v.confidence_level || v.confidence_score || 50), 0) / 
                                        Math.max(1, analysis.reserved_word_safety.violations.length)) : 100),
            registration_accurate: analysis.registration_compliance?.isCompliant || 
                                 analysis.registration_compliance?.compliant || false,
            registration_accuracy_percentage: analysis.registration_compliance?.accuracyPercentage ||
                                             analysis.registration_compliance?.accuracy || 0
        },

        // UPDATED: Enhanced architecture metrics
        architecture_metrics: {
            has_error_handling: (analysis.function_architecture?.functionsWithErrorHandling || 0) > 0,
            error_handling_coverage: analysis.function_architecture?.errorHandlingCoverage || 0,
            has_logging: (analysis.function_architecture?.functionsWithLogging || 0) > 0,
            logging_coverage: analysis.function_architecture?.loggingCoverage || 0,
            average_function_length: analysis.function_architecture?.averageLineCount || 
                                   analysis.function_architecture?.averageComplexity || 0
        }
    };
};

/**
 * UPDATED: Create function analysis section with enhanced inventory data
 * @param {Object} analysis - Module analysis with enhanced data structures
 * @returns {Object} Function analysis
 */
const createFunctionAnalysis = (analysis) => {
    const inventory = analysis.function_inventory || {};

    const functionAnalysis = {
        // UPDATED: Enhanced function inventory with new data structure support
        function_inventory: {
            total_count: inventory.total_count || 0,
            global_count: inventory.globalCount || inventory.global_count || 0,
            nested_count: inventory.nestedCount || inventory.nested_count || 0,
            // UPDATED: Enhanced analysis method indicators
            analysis_method: inventory.analysis_method || 'standard',
            confidence_level: inventory.confidence_level || 90,
            force_stable_mode: inventory.forceStable || false,
            fallback_recovery_used: inventory.fallback_used || false,

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

    // UPDATED: Enhanced registration compliance details with multiple data structure support
    const registration = analysis.registration_compliance || {};
    functionAnalysis.registration_compliance = {
        registration_found: registration.registrationFound || registration.found || false,
        module_name: registration.moduleName || registration.module_name || 'unknown',
        version: registration.version || 'unknown',
        registered_functions: registration.registeredFunctions || registration.registered_functions || [],
        // UPDATED: Enhanced analysis method and confidence data
        analysis_method: registration.analysis_method || 'standard',
        confidence_level: registration.confidence_level || 90,
        fallback_used: registration.fallback_used || false,

        compliance_issues: {
            functions_not_registered: registration.functionsNotRegistered || 
                                    registration.missingFunctions || [],
            registered_but_not_found: registration.registeredButNotFound || 
                                     registration.extraFunctions || [],
            accuracy_percentage: registration.accuracyPercentage || 
                               registration.accuracy || 0,
            // UPDATED: Enhanced issue categorization
            high_confidence_issues: (registration.issues || []).filter(issue => 
              (issue.confidence_level || issue.confidence || 90) >= 85).length,
            low_confidence_issues: (registration.issues || []).filter(issue => 
              (issue.confidence_level || issue.confidence || 90) < 85).length
        }
    };

    // UPDATED: Enhanced function categorization support
    if (inventory.by_purpose) {
        functionAnalysis.functions_by_purpose = inventory.by_purpose;
    }

    if (inventory.by_complexity) {
        functionAnalysis.functions_by_complexity = inventory.by_complexity;
    }

    return functionAnalysis;
};

/**
 * UPDATED: Create code quality assessment section with enhanced confidence scores
 * @param {Object} analysis - Module analysis with enhanced data structures
 * @returns {Object} Code quality assessment with enhanced confidence scores
 */
const createCodeQualityAssessment = (analysis) => {
    const es3 = analysis.es3_compliance || {};
    const reserved = analysis.reserved_word_safety || {};
    
    return {
        // UPDATED: Enhanced ES3 compliance with confidence breakdown
        es3_compliance: {
            compliant: es3.compliant || false,
            violations_count: es3.violations?.length || 0,
            high_confidence_violations: es3.violations?.filter(v => 
              (v.confidence_level || v.confidence_score || 50) >= 85).length || 0,
            medium_confidence_violations: es3.violations?.filter(v => {
              const conf = v.confidence_level || v.confidence_score || 50;
              return conf >= 60 && conf < 85;
            }).length || 0,
            low_confidence_violations: es3.violations?.filter(v => 
              (v.confidence_level || v.confidence_score || 50) < 60).length || 0,
            average_confidence: es3.violations?.length > 0 ? 
                Math.round(es3.violations.reduce((sum, v) => 
                  sum + (v.confidence_level || v.confidence_score || 50), 0) / 
                  es3.violations.length) : 100,
            total_penalty: es3.totalPenalty || es3.total_penalty || 0,
            critical_violations_count: es3.criticalViolations?.length || 
                                     es3.critical_violations?.length || 0,
            // UPDATED: Enhanced analysis metadata
            confidence_summary: es3.confidence_summary || {
                high_confidence_violations: 0,
                medium_confidence_violations: 0,
                low_confidence_violations: 0,
                uncertain_violations: 0
            }
        },

        // UPDATED: Enhanced reserved word safety with confidence breakdown
        reserved_word_safety: {
            safe: reserved.safe !== false, // Default to true if not specified
            violations_count: reserved.violations?.length || 0,
            high_confidence_violations: reserved.violations?.filter(v => 
              (v.confidence_level || v.confidence_score || 50) >= 85).length || 0,
            medium_confidence_violations: reserved.violations?.filter(v => {
              const conf = v.confidence_level || v.confidence_score || 50;
              return conf >= 60 && conf < 85;
            }).length || 0,
            low_confidence_violations: reserved.violations?.filter(v => 
              (v.confidence_level || v.confidence_score || 50) < 60).length || 0,
            average_confidence: reserved.violations?.length > 0 ?
                Math.round(reserved.violations.reduce((sum, v) => 
                  sum + (v.confidence_level || v.confidence_score || 50), 0) / 
                  reserved.violations.length) : 100,
            total_issues: reserved.total_issues || reserved.violations?.length || 0,
            // UPDATED: Dangerous words found with confidence levels
            dangerous_words: reserved.violations?.filter(v => 
              (v.confidence_level || v.confidence_score || 50) >= 85).map(v => v.word) || []
        },

        // UPDATED: Enhanced logging compliance
        logging_compliance: {
            compliant: analysis.logging_compliance?.compliant || false,
            coverage: analysis.logging_compliance?.loggingCoverage || 
                     analysis.function_architecture?.loggingCoverage || 0,
            safe_usage: analysis.logging_compliance?.safeLoggingUsage || 0,
            unsafe_usage: analysis.logging_compliance?.unsafeLoggingUsage || 0,
            recommendations: analysis.logging_compliance?.recommendations || []
        },

        // UPDATED: Enhanced function architecture quality
        function_architecture: {
            valid: analysis.function_architecture?.valid !== false,
            function_count: analysis.function_architecture?.functionCount || 
                          analysis.function_inventory?.total_count || 0,
            average_complexity: analysis.function_architecture?.averageComplexity || 0,
            nested_function_count: analysis.function_architecture?.nestedFunctionCount || 
                                 analysis.function_inventory?.nested_count || 0,
            logging_coverage: analysis.function_architecture?.loggingCoverage || 0,
            error_handling_coverage: analysis.function_architecture?.errorHandling || 
                                   analysis.function_architecture?.errorHandlingCoverage || 0,
            oversized_functions: analysis.function_architecture?.oversizedFunctions || [],
            architecture_score: analysis.function_architecture?.score || 0
        }
    };
};

/**
 * UPDATED: Create verified issues section with enhanced confidence filtering
 * @param {Object} analysis - Module analysis with enhanced data structures
 * @param {Object} options - Report generation options
 * @returns {Object} Verified issues section
 */
const createVerifiedIssuesSection = (analysis, options = {}) => {
    const confidenceThreshold = options.confidenceThreshold || 85;
    
    const verifiedIssues = {
        critical_issues: [],
        major_issues: [],
        minor_issues: [],
        warnings: [],
        confidence_threshold_used: confidenceThreshold,
        total_verified_issues: 0,
        filtered_out_uncertain: 0
    };

    let filteredCount = 0;

    // UPDATED: Enhanced ES3 violations with confidence filtering
    if (analysis.es3_compliance?.violations) {
        analysis.es3_compliance.violations.forEach(violation => {
            const confidence = violation.confidence_level || violation.confidence_score || 50;
            
            if (confidence >= confidenceThreshold) {
                const issue = {
                    type: 'ES3_VIOLATION',
                    violation_type: violation.type || violation.violation_type,
                    severity: violation.severity || 'HIGH',
                    confidence: confidence,
                    description: violation.description || `ES3 violation: ${violation.type}`,
                    locations: violation.locations || violation.examples || [],
                    recommendation: violation.recommendation || violation.suggested_fix,
                    estimated_fix_time: '15 minutes'
                };

                if (issue.severity === 'CRITICAL') {
                    verifiedIssues.critical_issues.push(issue);
                } else if (issue.severity === 'HIGH') {
                    verifiedIssues.major_issues.push(issue);
                } else {
                    verifiedIssues.minor_issues.push(issue);
                }
            } else {
                filteredCount++;
            }
        });
    }

    // UPDATED: Enhanced reserved word violations with confidence filtering
    if (analysis.reserved_word_safety?.violations) {
        analysis.reserved_word_safety.violations.forEach(violation => {
            const confidence = violation.confidence_level || violation.confidence_score || 50;
            
            if (confidence >= confidenceThreshold) {
                const issue = {
                    type: 'RESERVED_WORD_VIOLATION',
                    word: violation.word,
                    severity: 'HIGH',
                    confidence: confidence,
                    description: `Reserved word '${violation.word}' used as property`,
                    locations: violation.locations || violation.examples || [],
                    recommendation: violation.recommendation || `Rename property '${violation.word}' to avoid ExtendScript conflicts`,
                    estimated_fix_time: '5 minutes'
                };

                verifiedIssues.major_issues.push(issue);
            } else {
                filteredCount++;
            }
        });
    }

    // UPDATED: Enhanced registration issues (usually high confidence)
    const registration = analysis.registration_compliance || {};
    const registrationAccuracy = registration.accuracyPercentage || registration.accuracy || 100;
    
    if (registrationAccuracy < 100) {
        const missingFunctions = registration.functionsNotRegistered || registration.missingFunctions || [];
        const extraFunctions = registration.registeredButNotFound || registration.extraFunctions || [];
        
        if (missingFunctions.length > 0) {
            verifiedIssues.major_issues.push({
                type: 'REGISTRATION_MISSING',
                severity: 'HIGH',
                confidence: 95, // Registration issues are usually high confidence
                description: `${missingFunctions.length} functions not registered`,
                missing_functions: missingFunctions,
                recommendation: `Add missing functions to registerModule() call: ${missingFunctions.slice(0, 3).join(', ')}`,
                estimated_fix_time: '10 minutes'
            });
        }
        
        if (extraFunctions.length > 0) {
            verifiedIssues.minor_issues.push({
                type: 'REGISTRATION_EXTRA',
                severity: 'MEDIUM',
                confidence: 95,
                description: `${extraFunctions.length} registered functions not found`,
                extra_functions: extraFunctions,
                recommendation: `Remove non-existent functions from registerModule() call: ${extraFunctions.slice(0, 3).join(', ')}`,
                estimated_fix_time: '5 minutes'
            });
        }
    }

    // UPDATED: Enhanced internal dependency issues
    if (analysis.internal_dependencies?.issues) {
        analysis.internal_dependencies.issues.forEach(issue => {
            const confidence = issue.confidence_level || issue.confidence || 80;
            
            if (confidence >= confidenceThreshold) {
                verifiedIssues.warnings.push({
                    type: 'DEPENDENCY_ISSUE',
                    severity: issue.severity || 'MEDIUM',
                    confidence: confidence,
                    description: issue.description,
                    recommendation: issue.recommendation || 'Review dependency usage',
                    estimated_fix_time: '15 minutes'
                });
            } else {
                filteredCount++;
            }
        });
    }

    // Calculate totals
    verifiedIssues.total_verified_issues = 
        verifiedIssues.critical_issues.length + 
        verifiedIssues.major_issues.length + 
        verifiedIssues.minor_issues.length + 
        verifiedIssues.warnings.length;
    
    verifiedIssues.filtered_out_uncertain = filteredCount;

    return verifiedIssues;
};

/**
 * UPDATED: Create health assessment with enhanced confidence weighting
 * @param {Object} analysis - Module analysis with enhanced data structures
 * @returns {Object} Health assessment
 */
const createHealthAssessment = (analysis) => {
    const health = analysis.health_score || {};
    
    return {
        overall_health: {
            score: health.total_score || health.score || 0,
            grade: health.grade || 'F',
            percentage: health.percentage || 0,
            confidence_weighted_score: calculateConfidenceWeightedScore(analysis),
            confidence_weighted_grade: calculateConfidenceWeightedGrade(analysis)
        },
        
        detailed_scores: health.details || health.breakdown || {},
        
        violations_summary: {
            total_violations: (health.violations_count || 0),
            high_confidence_violations: countHighConfidenceViolations(analysis),
            low_confidence_violations: countLowConfidenceViolations(analysis)
        },

        improvement_areas: identifyImprovementAreas(analysis),
        
        strengths: identifyStrengths(analysis)
    };
};

/**
 * UPDATED: Calculate confidence-weighted health score
 * @param {Object} analysis - Module analysis with enhanced data structures  
 * @returns {Number} Confidence-weighted score
 */
const calculateConfidenceWeightedScore = (analysis) => {
    let baseScore = analysis.health_score?.total_score || analysis.health_score?.score || 0;
    let confidenceBonus = 0;
    let confidencePenalty = 0;

    // Bonus for high-confidence clean results
    if (analysis.es3_compliance?.compliant && 
        (!analysis.es3_compliance.violations || analysis.es3_compliance.violations.length === 0)) {
        confidenceBonus += 20;
    }

    if (analysis.reserved_word_safety?.safe && 
        (!analysis.reserved_word_safety.violations || analysis.reserved_word_safety.violations.length === 0)) {
        confidenceBonus += 15;
    }

    // Penalty for uncertain violations
    if (analysis.es3_compliance?.violations) {
        analysis.es3_compliance.violations.forEach(violation => {
            const confidence = violation.confidence_level || violation.confidence_score || 50;
            if (confidence < 70) {
                confidencePenalty += 10;
            }
        });
    }

    return Math.max(0, Math.min(1000, baseScore + confidenceBonus - confidencePenalty));
};

/**
 * UPDATED: Count high confidence violations across all analysis types
 * @param {Object} analysis - Module analysis with enhanced data structures
 * @returns {Number} Count of high confidence violations
 */
const countHighConfidenceViolations = (analysis) => {
    let count = 0;
    
    if (analysis.es3_compliance?.violations) {
        count += analysis.es3_compliance.violations.filter(v => 
            (v.confidence_level || v.confidence_score || 50) >= 85).length;
    }
    
    if (analysis.reserved_word_safety?.violations) {
        count += analysis.reserved_word_safety.violations.filter(v => 
            (v.confidence_level || v.confidence_score || 50) >= 85).length;
    }
    
    return count;
};

/**
 * UPDATED: Count low confidence violations across all analysis types
 * @param {Object} analysis - Module analysis with enhanced data structures
 * @returns {Number} Count of low confidence violations
 */
const countLowConfidenceViolations = (analysis) => {
    let count = 0;
    
    if (analysis.es3_compliance?.violations) {
        count += analysis.es3_compliance.violations.filter(v => 
            (v.confidence_level || v.confidence_score || 50) < 70).length;
    }
    
    if (analysis.reserved_word_safety?.violations) {
        count += analysis.reserved_word_safety.violations.filter(v => 
            (v.confidence_level || v.confidence_score || 50) < 70).length;
    }
    
    return count;
};

/**
 * UPDATED: Identify improvement areas based on enhanced analysis
 * @param {Object} analysis - Module analysis with enhanced data structures
 * @returns {Array} Improvement areas
 */
const identifyImprovementAreas = (analysis) => {
    const areas = [];
    
    // Registration accuracy
    const regAccuracy = analysis.registration_compliance?.accuracyPercentage || 
                       analysis.registration_compliance?.accuracy || 100;
    if (regAccuracy < 95) {
        areas.push({
            area: 'Function Registration',
            current: `${regAccuracy}%`,
            target: '100%',
            priority: 'HIGH',
            effort: 'LOW'
        });
    }
    
    // ES3 compliance
    if (analysis.es3_compliance?.violations && analysis.es3_compliance.violations.length > 0) {
        const highConfViolations = analysis.es3_compliance.violations.filter(v => 
            (v.confidence_level || v.confidence_score || 50) >= 85).length;
        if (highConfViolations > 0) {
            areas.push({
                area: 'ES3 Compatibility',
                current: `${highConfViolations} high-confidence violations`,
                target: '0 violations',
                priority: 'HIGH',
                effort: 'MEDIUM'
            });
        }
    }
    
    // Logging coverage
    const loggingCoverage = analysis.function_architecture?.loggingCoverage || 0;
    if (loggingCoverage < 80) {
        areas.push({
            area: 'Logging Coverage',
            current: `${loggingCoverage}%`,
            target: '80%+',
            priority: 'MEDIUM',
            effort: 'MEDIUM'
        });
    }
    
    return areas;
};

/**
 * UPDATED: Identify strengths based on enhanced analysis
 * @param {Object} analysis - Module analysis with enhanced data structures
 * @returns {Array} Identified strengths
 */
const identifyStrengths = (analysis) => {
    const strengths = [];
    
    // High registration accuracy
    const regAccuracy = analysis.registration_compliance?.accuracyPercentage || 
                       analysis.registration_compliance?.accuracy || 0;
    if (regAccuracy >= 95) {
        strengths.push('Excellent function registration accuracy');
    }
    
    // ES3 compliance
    if (analysis.es3_compliance?.compliant) {
        strengths.push('Full ES3/ExtendScript compatibility');
    }
    
    // Reserved word safety
    if (analysis.reserved_word_safety?.safe) {
        strengths.push('Safe reserved word usage');
    }
    
    // Good logging coverage
    const loggingCoverage = analysis.function_architecture?.loggingCoverage || 0;
    if (loggingCoverage >= 80) {
        strengths.push('Comprehensive logging implementation');
    }
    
    // High health score
    const healthScore = analysis.health_score?.total_score || analysis.health_score?.score || 0;
    if (healthScore >= 900) {
        strengths.push('Excellent overall code quality');
    } else if (healthScore >= 800) {
        strengths.push('Good overall code quality');
    }
    
    return strengths;
};

/**
 * UPDATED: Create actionable recommendations with enhanced prioritization
 * @param {Object} analysis - Module analysis with enhanced data structures
 * @returns {Array} Actionable recommendations
 */
const createActionableRecommendations = (analysis) => {
    const recommendations = [];
    
    // High-priority recommendations based on verified issues
    const regAccuracy = analysis.registration_compliance?.accuracyPercentage || 
                       analysis.registration_compliance?.accuracy || 100;
    if (regAccuracy < 100) {
        recommendations.push({
            priority: 'HIGH',
            category: 'registration',
            title: 'Fix function registration accuracy',
            description: `Registration accuracy is ${regAccuracy}% - should be 100%`,
            action: 'Update registerModule() call to match actual function definitions',
            estimated_effort: '15 minutes',
            confidence: 'HIGH',
            impact: 'CRITICAL'
        });
    }
    
    // ES3 compliance recommendations
    if (analysis.es3_compliance?.violations) {
        const highConfViolations = analysis.es3_compliance.violations.filter(v => 
            (v.confidence_level || v.confidence_score || 50) >= 85);
        if (highConfViolations.length > 0) {
            recommendations.push({
                priority: 'HIGH',
                category: 'es3_compliance',
                title: 'Fix ES3 compatibility violations',
                description: `${highConfViolations.length} high-confidence ES3 violations detected`,
                action: 'Review and fix ES3 compatibility issues listed in verified issues',
                estimated_effort: `${highConfViolations.length * 15} minutes`,
                confidence: 'HIGH',
                impact: 'HIGH'
            });
        }
    }
    
    // Reserved word safety recommendations
    if (analysis.reserved_word_safety?.violations) {
        const highConfViolations = analysis.reserved_word_safety.violations.filter(v => 
            (v.confidence_level || v.confidence_score || 50) >= 85);
        if (highConfViolations.length > 0) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'reserved_words',
                title: 'Fix reserved word usage',
                description: `${highConfViolations.length} high-confidence reserved word violations`,
                action: 'Rename properties that use reserved words',
                estimated_effort: `${highConfViolations.length * 5} minutes`,
                confidence: 'HIGH',
                impact: 'MEDIUM'
            });
        }
    }
    
    // Logging coverage recommendations
    const loggingCoverage = analysis.function_architecture?.loggingCoverage || 0;
    if (loggingCoverage < 60) {
        recommendations.push({
            priority: 'MEDIUM',
            category: 'logging',
            title: 'Improve logging coverage',
            description: `Logging coverage is ${loggingCoverage}% - recommend 80%+`,
            action: 'Add logging statements to functions without proper error reporting',
            estimated_effort: '30 minutes',
            confidence: 'MEDIUM',
            impact: 'MEDIUM'
        });
    }
    
    return recommendations;
};

/**
 * UPDATED: Create enhanced confidence summary
 * @param {Object} analysis - Module analysis with enhanced data structures
 * @returns {Object} Enhanced confidence summary
 */
const createConfidenceSummary = (analysis) => {
    const summary = {
        overall_confidence_level: 'high',
        detection_categories: {},
        high_confidence_count: 0,
        medium_confidence_count: 0,
        low_confidence_count: 0,
        total_detections: 0,
        uncertain_count: 0,
        analysis_method_indicators: {
            registration_method: analysis.registration_compliance?.analysis_method || 'standard',
            function_inventory_method: analysis.function_inventory?.analysis_method || 'standard',
            es3_analysis_confidence: analysis.es3_compliance?.confidence_level || 'high',
            stability_mode_used: analysis.function_inventory?.forceStable || false,
            fallback_recovery_used: analysis.function_inventory?.fallback_used || false
        }
    };

    // ES3 compliance confidence breakdown
    if (analysis.es3_compliance?.violations) {
        const violations = analysis.es3_compliance.violations;
        const categoryStats = {
            total: violations.length,
            high_confidence: violations.filter(v => (v.confidence_level || v.confidence_score || 50) >= 85).length,
            medium_confidence: violations.filter(v => {
                const conf = v.confidence_level || v.confidence_score || 50;
                return conf >= 60 && conf < 85;
            }).length,
            low_confidence: violations.filter(v => (v.confidence_level || v.confidence_score || 50) < 60).length,
            average_confidence: violations.length > 0 ? 
                Math.round(violations.reduce((sum, v) => sum + (v.confidence_level || v.confidence_score || 50), 0) / violations.length) : 0
        };
        
        summary.detection_categories.es3_compliance = categoryStats;
        summary.high_confidence_count += categoryStats.high_confidence;
        summary.medium_confidence_count += categoryStats.medium_confidence;
        summary.low_confidence_count += categoryStats.low_confidence;
        summary.total_detections += categoryStats.total;
    }

    // Reserved word safety confidence breakdown
    if (analysis.reserved_word_safety?.violations) {
        const violations = analysis.reserved_word_safety.violations;
        const categoryStats = {
            total: violations.length,
            high_confidence: violations.filter(v => (v.confidence_level || v.confidence_score || 50) >= 85).length,
            medium_confidence: violations.filter(v => {
                const conf = v.confidence_level || v.confidence_score || 50;
                return conf >= 60 && conf < 85;
            }).length,
            low_confidence: violations.filter(v => (v.confidence_level || v.confidence_score || 50) < 60).length,
            average_confidence: violations.length > 0 ? 
                Math.round(violations.reduce((sum, v) => sum + (v.confidence_level || v.confidence_score || 50), 0) / violations.length) : 0
        };
        
        summary.detection_categories.reserved_word_safety = categoryStats;
        summary.high_confidence_count += categoryStats.high_confidence;
        summary.medium_confidence_count += categoryStats.medium_confidence;
        summary.low_confidence_count += categoryStats.low_confidence;
        summary.total_detections += categoryStats.total;
    }

    // Calculate overall confidence level
    if (summary.total_detections === 0) {
        summary.overall_confidence_level = 'no_issues_detected';
    } else {
        const highConfidenceRatio = summary.high_confidence_count / summary.total_detections;
        if (highConfidenceRatio >= 0.8) {
            summary.overall_confidence_level = 'high';
        } else if (highConfidenceRatio >= 0.6) {
            summary.overall_confidence_level = 'medium';
        } else {
            summary.overall_confidence_level = 'low';
        }
    }

    summary.uncertain_count = summary.low_confidence_count;

    return summary;
};

/**
 * UPDATED: Create enhanced analysis metadata
 * @param {Object} analysis - Module analysis with enhanced data structures
 * @param {Object} options - Report generation options
 * @returns {Object} Enhanced analysis metadata
 */
const createAnalysisMetadata = (analysis, options = {}) => {
    return {
        analysis_version: '2.0-enhanced',
        timestamp: new Date().toISOString(),
        analysis_time_ms: analysis.analysis_time_ms || 0,
        confidence_threshold_used: options.confidenceThreshold || 70,
        
        // Enhanced analysis method tracking
        methods_used: {
            registration_detection: analysis.registration_compliance?.analysis_method || 'standard',
            function_inventory: analysis.function_inventory?.analysis_method || 'standard',
            es3_analysis: 'enhanced-context-aware',
            reserved_word_analysis: 'enhanced-confidence-scored',
            similarity_analysis: analysis.function_inventory?.forceStable ? 'disabled-for-stability' : 'enabled'
        },
        
        // Enhanced stability and recovery indicators
        stability_indicators: {
            force_stable_mode: analysis.function_inventory?.forceStable || false,
            fallback_recovery_used: analysis.function_inventory?.fallback_used || false,
            error_recovery_successful: !analysis.function_inventory?.error,
            skip_similarity_analysis: options.skipSimilarity || false
        },
        
        // Enhanced integration status
        integration_status: {
            patterns_js_integration: 'active',
            function_analyzer_integration: 'active',
            confidence_scoring_system: 'active',
            enhanced_pattern_detection: 'active'
        }
    };
};

export default {
    generateIndividualModuleReport
};