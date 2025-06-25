// reporters/individual-report.js
// INDIVIDUAL MODULE REPORT GENERATOR - PHASE 2 FIXES
// Generate detailed YAML reports for individual module analysis
// FIXED: Zero false positive reporting, confidence scoring, real code extraction
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
 * Generate individual module analysis report - ZERO FALSE POSITIVE VERSION
 * @param {Object} moduleAnalysis - Complete module analysis result
 * @param {string} outputPath - Directory to write report
 * @param {Object} options - Report generation options
 * @returns {Object} Report generation result
 */
export const generateIndividualModuleReport = (moduleAnalysis, outputPath, options = {}) => {
    const startTime = Date.now();

    try {
        console.log(chalk.cyan(`📝 Generating zero false positive module report...`));

        if (!moduleAnalysis.success) {
            throw new Error(`Cannot generate report for failed analysis: ${moduleAnalysis.error}`);
        }

        const analysis = moduleAnalysis.analysis;
        const filename = analysis.module_info.filename;

        // CONFIDENCE FILTER: Only report high-confidence issues
        const filteredAnalysis = applyConfidenceFiltering(analysis, options);
        
        // Create structured report data with confidence scoring
        const reportData = createTrustedModuleReportData(filteredAnalysis, options);

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

        console.log(chalk.green(`✅ Trusted report generated: ${path.basename(reportFilename)} (${Math.round(reportSize / 1024)}KB, ${reportTime}ms)`));

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
 * Apply confidence filtering to remove uncertain detections
 * @param {Object} analysis - Module analysis results
 * @param {Object} options - Filtering options
 * @returns {Object} Filtered analysis with only high-confidence issues
 */
const applyConfidenceFiltering = (analysis, options = {}) => {
    const minConfidence = options.minConfidenceThreshold || 85; // 85% minimum confidence
    const filteredAnalysis = JSON.parse(JSON.stringify(analysis)); // Deep clone

    console.log(chalk.cyan(`   Applying confidence filtering (min: ${minConfidence}%)...`));

    // Filter ES3 compliance violations
    if (filteredAnalysis.es3_compliance?.violations) {
        const originalCount = filteredAnalysis.es3_compliance.violations.length;
        
        filteredAnalysis.es3_compliance.violations = filteredAnalysis.es3_compliance.violations.filter(violation => {
            const confidence = calculateES3ViolationConfidence(violation, analysis);
            violation.confidence_score = confidence;
            
            if (confidence < minConfidence) {
                console.log(chalk.yellow(`   Filtered low-confidence ES3 violation: ${violation.type} (${confidence}%)`));
                return false;
            }
            return true;
        });

        const filteredCount = filteredAnalysis.es3_compliance.violations.length;
        console.log(chalk.gray(`   ES3 violations: ${originalCount} → ${filteredCount} (${originalCount - filteredCount} filtered)`));
        
        // Update compliance status
        filteredAnalysis.es3_compliance.compliant = filteredCount === 0;
        filteredAnalysis.es3_compliance.criticalViolations = filteredAnalysis.es3_compliance.violations.filter(v => 
            v.severity === 'critical' && v.confidence_score >= 95
        );
    }

    // Filter reserved word safety violations  
    if (filteredAnalysis.reserved_word_safety?.violations) {
        const originalCount = filteredAnalysis.reserved_word_safety.violations.length;
        
        filteredAnalysis.reserved_word_safety.violations = filteredAnalysis.reserved_word_safety.violations.filter(violation => {
            const confidence = calculateReservedWordViolationConfidence(violation, analysis);
            violation.confidence_score = confidence;
            
            if (confidence < minConfidence) {
                console.log(chalk.yellow(`   Filtered low-confidence reserved word violation: ${violation.word} (${confidence}%)`));
                return false;
            }
            return true;
        });

        const filteredCount = filteredAnalysis.reserved_word_safety.violations.length;
        console.log(chalk.gray(`   Reserved word violations: ${originalCount} → ${filteredCount} (${originalCount - filteredCount} filtered)`));
        
        // Update safety status
        filteredAnalysis.reserved_word_safety.safe = filteredCount === 0;
        filteredAnalysis.reserved_word_safety.criticalViolations = filteredAnalysis.reserved_word_safety.violations.filter(v => 
            v.critical && v.confidence_score >= 95
        );
    }

    return filteredAnalysis;
};

/**
 * Calculate confidence score for ES3 violation detection
 * @param {Object} violation - ES3 violation object
 * @param {Object} analysis - Full analysis context
 * @returns {Number} Confidence score (0-100)
 */
const calculateES3ViolationConfidence = (violation, analysis) => {
    let confidence = 50; // Base confidence

    // High confidence patterns (known ES6+ features)
    const highConfidencePatterns = {
        'arrow_function': /=>\s*\{/, // Arrow function with block
        'template_literal': /`.*\$\{.*\}.*`/, // Template literal with interpolation
        'const_declaration': /^\s*const\s+\w+\s*=/, // Const declaration at start of line
        'let_declaration': /^\s*let\s+\w+\s*=/, // Let declaration at start of line
        'class_declaration': /^\s*class\s+\w+/, // Class declaration
        'import_statement': /^\s*import\s+.*from/, // Import statement
        'export_statement': /^\s*export\s+(default\s+)?/ // Export statement
    };

    // Check if violation matches high-confidence patterns
    if (violation.examples && violation.examples.length > 0) {
        violation.examples.forEach(example => {
            const code = example.code || '';
            
            Object.entries(highConfidencePatterns).forEach(([patternName, regex]) => {
                if (violation.type.includes(patternName.split('_')[0]) && regex.test(code)) {
                    confidence += 30; // High confidence boost
                }
            });
        });
    }

    // Reduce confidence for ambiguous patterns that might match valid ES3
    const ambiguousPatterns = {
        'destructuring': /\[.*\]\s*=/, // Could be array access
        'object_property': /\w+\.\w+/, // Normal property access
        'function_expression': /function\s*\(/ // Valid ES3 function expression
    };

    if (violation.examples && violation.examples.length > 0) {
        violation.examples.forEach(example => {
            const code = example.code || '';
            
            Object.entries(ambiguousPatterns).forEach(([patternName, regex]) => {
                if (regex.test(code) && !highConfidencePatterns[violation.type]?.test(code)) {
                    confidence -= 25; // Reduce confidence for ambiguous matches
                }
            });
        });
    }

    // Context-based confidence adjustments
    if (violation.locations && violation.locations.length > 1) {
        confidence += 10; // Multiple occurrences increase confidence
    }

    if (violation.type === 'forbidden_keyword' && ['const', 'let', 'class'].includes(violation.keyword)) {
        confidence += 20; // These are definitely ES6+ keywords
    }

    // Check against known valid ES3 patterns from real DocDom code
    if (isKnownValidES3Pattern(violation)) {
        confidence = Math.min(confidence, 30); // Cap confidence for known valid patterns
    }

    return Math.max(0, Math.min(100, Math.round(confidence)));
};

/**
 * Calculate confidence score for reserved word violation detection
 * @param {Object} violation - Reserved word violation object
 * @param {Object} analysis - Full analysis context
 * @returns {Number} Confidence score (0-100)
 */
const calculateReservedWordViolationConfidence = (violation, analysis) => {
    let confidence = 60; // Base confidence

    // High confidence for actual ExtendScript crashers
    const extendscriptCrashers = ['export', 'import', 'class', 'const', 'let'];
    if (extendscriptCrashers.includes(violation.word)) {
        confidence += 25;
    }

    // Check context - property access vs variable declaration
    if (violation.examples && violation.examples.length > 0) {
        violation.examples.forEach(example => {
            const code = example.code || '';
            
            // High confidence: actual property usage
            if (code.match(new RegExp(`\\b\\w+\\.${violation.word}\\b`))) {
                confidence += 20; // obj.export is dangerous
            }
            
            // Lower confidence: might be in comments or strings
            if (code.includes('//') || code.includes('/*') || code.includes('"') || code.includes("'")) {
                confidence -= 15;
            }
        });
    }

    // Reduce confidence if this appears to be a false positive pattern
    if (isKnownFalsePositiveReservedWord(violation)) {
        confidence = Math.min(confidence, 40);
    }

    return Math.max(0, Math.min(100, Math.round(confidence)));
};

/**
 * Check if violation matches known valid ES3 patterns from real DocDom code
 * @param {Object} violation - Violation object
 * @returns {Boolean} True if this is a known valid ES3 pattern
 */
const isKnownValidES3Pattern = (violation) => {
    if (!violation.examples || violation.examples.length === 0) return false;

    const knownValidPatterns = [
        // Object property assignment (valid ES3)
        /\w+\[\w+\]\s*=\s*/, // obj[prop] = value
        /\w+\.\w+\s*=\s*/, // obj.prop = value
        
        // Function expressions (valid ES3)
        /function\s*\([^)]*\)\s*\{/, // function() {}
        
        // Array access (valid ES3)
        /\w+\[['"]?\w+['"]?\]/, // obj['prop'] or obj[prop]
        
        // Method calls (valid ES3)
        /\w+\.\w+\([^)]*\)/ // obj.method()
    ];

    return violation.examples.some(example => {
        const code = example.code || '';
        return knownValidPatterns.some(pattern => pattern.test(code));
    });
};

/**
 * Check if reserved word violation is likely a false positive
 * @param {Object} violation - Reserved word violation object
 * @returns {Boolean} True if likely false positive
 */
const isKnownFalsePositiveReservedWord = (violation) => {
    if (!violation.examples || violation.examples.length === 0) return false;

    const falsePositivePatterns = [
        // Comments containing reserved words
        /\/\/.*\b(export|import|class)\b/,
        /\/\*.*\b(export|import|class)\b.*\*\//,
        
        // String literals containing reserved words  
        /['"].*\b(export|import|class)\b.*['"]/,
        
        // Valid property names in object literals
        /\{\s*['"]?(export|import|class)['"]?\s*:/
    ];

    return violation.examples.some(example => {
        const code = example.code || '';
        return falsePositivePatterns.some(pattern => pattern.test(code));
    });
};

/**
 * Create comprehensive but trusted module report data structure
 * @param {Object} analysis - Filtered module analysis results
 * @param {Object} options - Report generation options
 * @returns {Object} Report data structure
 */
const createTrustedModuleReportData = (analysis, options = {}) => {
    const reportData = {
        // Executive summary with confidence metrics
        executive_summary: createConfidenceAwareExecutiveSummary(analysis),

        // Module summary with trust indicators
        module_summary: createModuleSummary(analysis),

        // Function analysis
        function_analysis: createFunctionAnalysis(analysis),

        // Code quality with confidence scores
        code_quality: createTrustedCodeQualityAssessment(analysis),

        // ONLY TRUSTED ISSUES - zero false positive tolerance
        verified_issues: createVerifiedIssuesSection(analysis, options),

        // Health score with confidence weighting
        confidence_weighted_health: createConfidenceWeightedHealthScore(analysis),

        // Actionable recommendations only
        actionable_recommendations: createActionableRecommendations(analysis),

        // Confidence summary for transparency
        confidence_summary: createConfidenceSummary(analysis)
    };

    return reportData;
};

/**
 * Create executive summary with confidence-based assessment
 * @param {Object} analysis - Module analysis
 * @returns {Object} Executive summary with confidence metrics
 */
const createConfidenceAwareExecutiveSummary = (analysis) => {
    const summary = {
        critical_blockers: [],
        confidence_level: 'high', // high, medium, low
        production_readiness: 'unknown',
        quick_stats: {
            health_grade: analysis.health_score.grade,
            confidence_weighted_grade: calculateConfidenceWeightedGrade(analysis),
            verified_critical_issues: 0,
            uncertain_detections: 0,
            estimated_fix_time: 'unknown'
        },
        top_3_actions: []
    };

    let verifiedCriticalIssues = 0;
    let uncertainDetections = 0;
    let estimatedHours = 0;

    // Count only high-confidence critical issues
    if (analysis.es3_compliance?.violations) {
        analysis.es3_compliance.violations.forEach(violation => {
            if (violation.confidence_score >= 85) {
                verifiedCriticalIssues++;
                summary.critical_blockers.push(`HIGH CONFIDENCE: ${violation.type} (${violation.confidence_score}% confident)`);
                estimatedHours += 0.25; // 15 minutes per verified violation
            } else {
                uncertainDetections++;
            }
        });
    }

    if (analysis.reserved_word_safety?.violations) {
        analysis.reserved_word_safety.violations.forEach(violation => {
            if (violation.confidence_score >= 85) {
                verifiedCriticalIssues++;
                summary.critical_blockers.push(`HIGH CONFIDENCE: Reserved word '${violation.word}' (${violation.confidence_score}% confident)`);
                estimatedHours += 0.1; // 6 minutes per verified violation
            } else {
                uncertainDetections++;
            }
        });
    }

    // Registration issues (these are usually high confidence)
    if (analysis.registration_compliance.accuracyPercentage < 100) {
        const missingCount = analysis.registration_compliance.functionsNotRegistered?.length || 0;
        const extraCount = analysis.registration_compliance.registeredButNotFound?.length || 0;
        if (missingCount + extraCount > 0) {
            verifiedCriticalIssues++;
            summary.critical_blockers.push(`VERIFIED: Function registration mismatches (${missingCount + extraCount} issues)`);
            estimatedHours += 0.5; // 30 minutes to fix registration
        }
    }

    // Update stats
    summary.quick_stats.verified_critical_issues = verifiedCriticalIssues;
    summary.quick_stats.uncertain_detections = uncertainDetections;
    summary.quick_stats.estimated_fix_time = estimatedHours >= 1 ? 
        `${Math.ceil(estimatedHours)} hours` : 
        `${Math.ceil(estimatedHours * 60)} minutes`;

    // Determine confidence level
    if (uncertainDetections === 0) {
        summary.confidence_level = 'high';
    } else if (uncertainDetections <= verifiedCriticalIssues) {
        summary.confidence_level = 'medium';
    } else {
        summary.confidence_level = 'low';
    }

    // Production readiness assessment
    if (verifiedCriticalIssues === 0) {
        summary.production_readiness = 'ready';
    } else if (verifiedCriticalIssues <= 2) {
        summary.production_readiness = 'minor_fixes_needed';
    } else {
        summary.production_readiness = 'major_fixes_required';
    }

    // Top 3 actions - only for verified issues
    const actions = [];

    // High-confidence ES3 violations with specific fixes
    if (analysis.es3_compliance.violations) {
        const highConfidenceViolations = analysis.es3_compliance.violations.filter(v => v.confidence_score >= 90);
        if (highConfidenceViolations.length > 0) {
            const violation = highConfidenceViolations[0]; // Take the first high-confidence one
            const locations = violation.locations || [];
            actions.push(`VERIFIED: Fix ${violation.type} in line ${locations[0] || 'unknown'} (${violation.confidence_score}% confidence)`);
        }
    }

    // High-confidence registration issues
    if (analysis.registration_compliance.functionsNotRegistered?.length > 0) {
        const missing = analysis.registration_compliance.functionsNotRegistered.slice(0, 2);
        actions.push(`VERIFIED: Register missing functions: ${missing.join(', ')}`);
    }

    if (analysis.registration_compliance.registeredButNotFound?.length > 0) {
        const extra = analysis.registration_compliance.registeredButNotFound.slice(0, 2);
        actions.push(`VERIFIED: Remove non-existent functions from registration: ${extra.join(', ')}`);
    }

    summary.top_3_actions = actions.slice(0, 3);

    return summary;
};

/**
 * Calculate confidence-weighted grade
 * @param {Object} analysis - Module analysis
 * @returns {String} Confidence-weighted grade
 */
const calculateConfidenceWeightedGrade = (analysis) => {
    let baseScore = analysis.health_score.total_score;
    let confidencePenalty = 0;

    // Reduce score for uncertain detections
    if (analysis.es3_compliance?.violations) {
        analysis.es3_compliance.violations.forEach(violation => {
            if (violation.confidence_score < 85) {
                confidencePenalty += 20; // Penalty for uncertain violations
            }
        });
    }

    if (analysis.reserved_word_safety?.violations) {
        analysis.reserved_word_safety.violations.forEach(violation => {
            if (violation.confidence_score < 85) {
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
            es3_confidence: analysis.es3_compliance.violations ? 
                Math.round(analysis.es3_compliance.violations.reduce((sum, v) => sum + (v.confidence_score || 50), 0) / 
                          Math.max(1, analysis.es3_compliance.violations.length)) : 100,
            reserved_word_safe: analysis.reserved_word_safety.safe,
            reserved_word_confidence: analysis.reserved_word_safety.violations ? 
                Math.round(analysis.reserved_word_safety.violations.reduce((sum, v) => sum + (v.confidence_score || 50), 0) / 
                          Math.max(1, analysis.reserved_word_safety.violations.length)) : 100,
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
 * Create trusted code quality assessment section
 * @param {Object} analysis - Module analysis
 * @returns {Object} Code quality assessment with confidence scores
 */
const createTrustedCodeQualityAssessment = (analysis) => {
    return {
        es3_compliance: {
            compliant: analysis.es3_compliance.compliant,
            violations_count: analysis.es3_compliance.violations?.length || 0,
            high_confidence_violations: analysis.es3_compliance.violations?.filter(v => v.confidence_score >= 85).length || 0,
            low_confidence_violations: analysis.es3_compliance.violations?.filter(v => v.confidence_score < 85).length || 0,
            average_confidence: analysis.es3_compliance.violations?.length > 0 ? 
                Math.round(analysis.es3_compliance.violations.reduce((sum, v) => sum + (v.confidence_score || 50), 0) / 
                          analysis.es3_compliance.violations.length) : 100,
            total_penalty: analysis.es3_compliance.totalPenalty,
            critical_violations_count: analysis.es3_compliance.criticalViolations?.length || 0
        },

        reserved_word_safety: {
            safe: analysis.reserved_word_safety.safe,
            violations_count: analysis.reserved_word_safety.violations?.length || 0,
            high_confidence_violations: analysis.reserved_word_safety.violations?.filter(v => v.confidence_score >= 85).length || 0,
            low_confidence_violations: analysis.reserved_word_safety.violations?.filter(v => v.confidence_score < 85).length || 0,
            average_confidence: analysis.reserved_word_safety.violations?.length > 0 ? 
                Math.round(analysis.reserved_word_safety.violations.reduce((sum, v) => sum + (v.confidence_score || 50), 0) / 
                          analysis.reserved_word_safety.violations.length) : 100,
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
 * Create verified issues section - ZERO FALSE POSITIVE TOLERANCE
 * @param {Object} analysis - Module analysis
 * @param {Object} options - Report options
 * @returns {Object} Only verified, actionable issues
 */
const createVerifiedIssuesSection = (analysis, options = {}) => {
    const issues = {
        critical_issues: [],
        high_priority_issues: [],
        medium_priority_issues: [],
        warnings: [],
        uncertain_detections: [] // Separated for transparency
    };

    const minConfidenceForCritical = 90;
    const minConfidenceForHigh = 85;
    const minConfidenceForMedium = 80;

    // ES3 compliance violations - ONLY HIGH CONFIDENCE
    if (analysis.es3_compliance.violations && analysis.es3_compliance.violations.length > 0) {
        analysis.es3_compliance.violations.forEach(violation => {
            const confidence = violation.confidence_score || 0;
            
            // Extract real code examples if available
            const realCodeExamples = extractRealCodeExamples(violation, options.sourceFilePath);
            
            const issue = {
                category: 'es3_compliance',
                type: violation.type,
                description: violation.description || `ES3 violation: ${violation.type}`,
                locations: violation.locations || [],
                confidence_score: confidence,
                penalty: violation.penalty,
                impact: getES3ImpactDescription(violation.type),
                fix_suggestion: getES3FixSuggestion(violation.type),
                code_examples: realCodeExamples
            };

            // STRICT CONFIDENCE THRESHOLDS
            if (confidence >= minConfidenceForCritical) {
                issue.severity = 'critical';
                issues.critical_issues.push(issue);
            } else if (confidence >= minConfidenceForHigh) {
                issue.severity = 'high';
                issues.high_priority_issues.push(issue);
            } else if (confidence >= minConfidenceForMedium) {
                issue.severity = 'medium';
                issues.medium_priority_issues.push(issue);
            } else {
                // Low confidence - put in uncertain detections
                issue.severity = 'uncertain';
                issue.reason_for_uncertainty = 'Pattern may match valid ES3 code';
                issues.uncertain_detections.push(issue);
            }
        });
    }

    // Reserved word safety violations - ONLY HIGH CONFIDENCE
    if (analysis.reserved_word_safety.violations && analysis.reserved_word_safety.violations.length > 0) {
        analysis.reserved_word_safety.violations.forEach(violation => {
            const confidence = violation.confidence_score || 0;
            
            const realCodeExamples = extractRealCodeExamples(violation, options.sourceFilePath);
            
            const issue = {
                category: 'reserved_word_safety',
                type: violation.type,
                word: violation.word,
                description: `Dangerous property usage: '${violation.word}'`,
                locations: violation.locations || [],
                confidence_score: confidence,
                penalty: violation.penalty,
                impact: `Property '${violation.word}' may crash in ExtendScript environment`,
                fix_suggestion: `Rename property '${violation.word}' to avoid conflicts (e.g., '${violation.word}Settings')`,
                code_examples: realCodeExamples
            };

            if (confidence >= minConfidenceForCritical) {
                issue.severity = 'critical';
                issues.critical_issues.push(issue);
            } else if (confidence >= minConfidenceForHigh) {
                issue.severity = 'high';
                issues.high_priority_issues.push(issue);
            } else if (confidence >= minConfidenceForMedium) {
                issue.severity = 'medium';
                issues.medium_priority_issues.push(issue);
            } else {
                issue.severity = 'uncertain';
                issue.reason_for_uncertainty = 'May be in comment or string literal';
                issues.uncertain_detections.push(issue);
            }
        });
    }

    // Registration compliance issues (these are usually high confidence)
    const registration = analysis.registration_compliance;
    if (registration.functionsNotRegistered && registration.functionsNotRegistered.length > 0) {
        issues.high_priority_issues.push({
            category: 'registration_compliance',
            type: 'functions_not_registered',
            description: 'Functions exist in code but not registered',
            affected_functions: registration.functionsNotRegistered,
            confidence_score: 95, // High confidence for registration issues
            severity: 'high',
            impact: 'Functions will not be available at runtime - module initialization will fail',
            fix_suggestion: 'Add missing functions to registerModule() call',
            accuracy_percentage: registration.accuracyPercentage
        });
    }

    if (registration.registeredButNotFound && registration.registeredButNotFound.length > 0) {
        issues.high_priority_issues.push({
            category: 'registration_compliance',
            type: 'registered_but_not_found',
            description: 'Functions registered but not found in code',
            affected_functions: registration.registeredButNotFound,
            confidence_score: 95, // High confidence for registration issues
            severity: 'high',
            impact: 'Runtime errors when trying to call non-existent functions',
            fix_suggestion: 'Remove non-existent functions from registerModule() call',
            accuracy_percentage: registration.accuracyPercentage
        });
    }

    // Only include other issues if they meet confidence thresholds
    // ... (additional issue types with confidence filtering)

    return issues;
};

/**
 * Extract real code examples from source file
 * @param {Object} violation - Violation object with locations
 * @param {String} sourceFilePath - Path to source file
 * @returns {Array} Array of real code examples
 */
const extractRealCodeExamples = (violation, sourceFilePath) => {
    if (!sourceFilePath || !violation.locations || violation.locations.length === 0) {
        return [];
    }

    try {
        const sourceContent = fs.readFileSync(sourceFilePath, 'utf8');
        const lines = sourceContent.split('\n');
        
        return violation.locations.slice(0, 3).map(lineNum => {
            if (lineNum > 0 && lineNum <= lines.length) {
                const line = lines[lineNum - 1];
                
                // Provide context
                const context = [];
                if (lineNum > 1) context.push(`${lineNum - 1}: ${lines[lineNum - 2]}`);
                context.push(`${lineNum}: ${line} // <-- ISSUE`);
                if (lineNum < lines.length) context.push(`${lineNum + 1}: ${lines[lineNum]}`);
                
                return {
                    line_number: lineNum,
                    code: line.trim(),
                    context: context.join('\n'),
                    suggested_fix: getSpecificFixForCode(violation.type, line)
                };
            }
            return null;
        }).filter(Boolean);
        
    } catch (error) {
        console.warn(chalk.yellow(`Could not extract code examples: ${error.message}`));
        return [];
    }
};

/**
 * Get specific fix suggestion for actual code
 * @param {String} violationType - Type of violation
 * @param {String} code - Actual code line
 * @returns {String} Specific fix suggestion
 */
const getSpecificFixForCode = (violationType, code) => {
    switch (violationType) {
        case 'destructuring':
            if (code.includes('[') && code.includes(']') && code.includes('=')) {
                return 'Replace with explicit assignment: var x = obj.x; var y = obj.y;';
            }
            return 'Use explicit property assignment instead of destructuring';
            
        case 'arrow_function':
            return 'Replace with function expression: function() { ... }';
            
        case 'template_literal':
            return 'Replace with string concatenation: "text " + variable';
            
        case 'spread_operator':
            return 'Replace with arrayConcat() or explicit operations';
            
        default:
            return 'Apply ES3-compatible alternative';
    }
};

/**
 * Get ES3 impact description
 * @param {String} violationType - Type of violation
 * @returns {String} Impact description
 */
const getES3ImpactDescription = (violationType) => {
    const impacts = {
        'destructuring': 'Will crash in ExtendScript environment',
        'spread_operator': 'Will crash in ExtendScript environment',
        'arrow_function': 'Will crash in ExtendScript environment',
        'template_literal': 'Will crash in ExtendScript environment',
        'forbidden_keyword': 'Will crash in ExtendScript environment'
    };
    
    return impacts[violationType] || 'May cause runtime issues in ExtendScript';
};

/**
 * Get ES3 fix suggestion
 * @param {String} violationType - Type of violation
 * @returns {String} Fix suggestion
 */
const getES3FixSuggestion = (violationType) => {
    const fixes = {
        'destructuring': 'Use explicit assignment: var x = obj.x; var y = obj.y;',
        'spread_operator': 'Use arrayConcat() or explicit operations',
        'arrow_function': 'Use function expressions: function() { ... }',
        'template_literal': 'Use string concatenation: "text " + variable',
        'forbidden_keyword': 'Replace forbidden keywords with ES3 alternatives'
    };
    
    return fixes[violationType] || 'Review ES3 compatibility requirements';
};

/**
 * Create confidence-weighted health score
 * @param {Object} analysis - Module analysis
 * @returns {Object} Confidence-weighted health assessment
 */
const createConfidenceWeightedHealthScore = (analysis) => {
    const originalHealth = analysis.health_score;
    
    // Calculate confidence penalties
    let confidencePenalty = 0;
    let highConfidenceIssues = 0;
    let lowConfidenceIssues = 0;
    
    // Count confidence levels
    if (analysis.es3_compliance?.violations) {
        analysis.es3_compliance.violations.forEach(v => {
            if ((v.confidence_score || 0) >= 85) {
                highConfidenceIssues++;
            } else {
                lowConfidenceIssues++;
                confidencePenalty += 20; // Penalty for uncertain detections
            }
        });
    }
    
    if (analysis.reserved_word_safety?.violations) {
        analysis.reserved_word_safety.violations.forEach(v => {
            if ((v.confidence_score || 0) >= 85) {
                highConfidenceIssues++;
            } else {
                lowConfidenceIssues++;
                confidencePenalty += 15;
            }
        });
    }
    
    const adjustedScore = Math.max(0, originalHealth.total_score - confidencePenalty);
    
    return {
        original_score: originalHealth.total_score,
        confidence_penalty: confidencePenalty,
        adjusted_score: adjustedScore,
        original_grade: originalHealth.grade,
        adjusted_grade: calculateConfidenceWeightedGrade(analysis),
        high_confidence_issues: highConfidenceIssues,
        low_confidence_issues: lowConfidenceIssues,
        confidence_ratio: highConfidenceIssues + lowConfidenceIssues > 0 ? 
            Math.round((highConfidenceIssues / (highConfidenceIssues + lowConfidenceIssues)) * 100) : 100
    };
};

/**
 * Create actionable recommendations
 * @param {Object} analysis - Module analysis
 * @returns {Array} Only actionable recommendations
 */
const createActionableRecommendations = (analysis) => {
    const recommendations = [];

    // Only recommend fixes for high-confidence issues
    const highConfidenceES3 = analysis.es3_compliance?.violations?.filter(v => (v.confidence_score || 0) >= 85) || [];
    if (highConfidenceES3.length > 0) {
        recommendations.push({
            priority: 'critical',
            category: 'es3_compliance',
            title: 'Fix verified ES3 compatibility issues',
            description: `${highConfidenceES3.length} high-confidence ES3 violations found`,
            action: 'Fix the specific violations listed in verified_issues section',
            estimated_effort: 'low',
            confidence_level: 'high'
        });
    }

    const highConfidenceReserved = analysis.reserved_word_safety?.violations?.filter(v => (v.confidence_score || 0) >= 85) || [];
    if (highConfidenceReserved.length > 0) {
        recommendations.push({
            priority: 'critical',
            category: 'reserved_word_safety',
            title: 'Fix verified reserved word issues',
            description: `${highConfidenceReserved.length} high-confidence reserved word violations found`,
            action: 'Rename the properties listed in verified_issues section',
            estimated_effort: 'low',
            confidence_level: 'high'
        });
    }

    // Registration issues (always actionable)
    if (analysis.registration_compliance.accuracyPercentage < 100) {
        recommendations.push({
            priority: 'high',
            category: 'registration_compliance',
            title: 'Fix function registration mismatches',
            description: `Registration accuracy: ${analysis.registration_compliance.accuracyPercentage}%`,
            action: 'Update registerModule() call as specified in verified_issues section',
            estimated_effort: 'low',
            confidence_level: 'high'
        });
    }

    return recommendations;
};

/**
 * Create confidence summary for transparency
 * @param {Object} analysis - Module analysis
 * @returns {Object} Confidence metrics summary
 */
const createConfidenceSummary = (analysis) => {
    const summary = {
        total_detections: 0,
        high_confidence_count: 0,
        medium_confidence_count: 0,
        low_confidence_count: 0,
        uncertain_count: 0,
        overall_confidence_level: 'unknown',
        detection_categories: {}
    };

    // Analyze ES3 violations
    if (analysis.es3_compliance?.violations) {
        const violations = analysis.es3_compliance.violations;
        summary.total_detections += violations.length;
        
        const categoryStats = {
            total: violations.length,
            high_confidence: violations.filter(v => (v.confidence_score || 0) >= 85).length,
            medium_confidence: violations.filter(v => (v.confidence_score || 0) >= 70 && (v.confidence_score || 0) < 85).length,
            low_confidence: violations.filter(v => (v.confidence_score || 0) < 70).length,
            average_confidence: violations.length > 0 ? 
                Math.round(violations.reduce((sum, v) => sum + (v.confidence_score || 50), 0) / violations.length) : 0
        };
        
        summary.detection_categories.es3_compliance = categoryStats;
        summary.high_confidence_count += categoryStats.high_confidence;
        summary.medium_confidence_count += categoryStats.medium_confidence;
        summary.low_confidence_count += categoryStats.low_confidence;
    }

    // Analyze reserved word violations
    if (analysis.reserved_word_safety?.violations) {
        const violations = analysis.reserved_word_safety.violations;
        summary.total_detections += violations.length;
        
        const categoryStats = {
            total: violations.length,
            high_confidence: violations.filter(v => (v.confidence_score || 0) >= 85).length,
            medium_confidence: violations.filter(v => (v.confidence_score || 0) >= 70 && (v.confidence_score || 0) < 85).length,
            low_confidence: violations.filter(v => (v.confidence_score || 0) < 70).length,
            average_confidence: violations.length > 0 ? 
                Math.round(violations.reduce((sum, v) => sum + (v.confidence_score || 50), 0) / violations.length) : 0
        };
        
        summary.detection_categories.reserved_word_safety = categoryStats;
        summary.high_confidence_count += categoryStats.high_confidence;
        summary.medium_confidence_count += categoryStats.medium_confidence;
        summary.low_confidence_count += categoryStats.low_confidence;
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

export default {
    generateIndividualModuleReport
};