// analyzers/version-comparator.js
// VERSION COMPARATOR - PHASE 3 FIXES
// Analysis of different versions of the same module
// FIXED: Enhanced version detection, diverse naming patterns, accurate breaking change detection
// ============================================================================

import chalk from 'chalk';
import path from 'path';
import { analyzeIndividualModule } from './individual-module-analyzer.js';
import { extractVersion, parseVersion, compareVersions } from '../config/patterns.js';

/**
 * Compare multiple versions of the same module - ENHANCED VERSION
 * @param {Object} folderInfo - Folder containing module versions
 * @param {Object} versionGroups - Grouped versions from folder analysis
 * @param {Object} options - Comparison options
 * @returns {Object} Complete version comparison analysis
 */
export const compareModuleVersions = (folderInfo, versionGroups, options = {}) => {
    const startTime = Date.now();
    console.log(chalk.blue(`🔄 Comparing module versions: ${folderInfo.name}`));

    try {
        const comparisons = [];

        // Process each version group (files with same decimal prefix)
        for (const [prefix, files] of Object.entries(versionGroups)) {
            if (files.length < 2) continue;

            console.log(chalk.cyan(`📊 Comparing versions for ${prefix}: ${files.length} files`));

            const comparison = compareVersionGroupEnhanced(folderInfo, prefix, files, options);
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

            // ENHANCED: Cross-comparison insights
            evolution_patterns: analyzeEvolutionPatternsEnhanced(comparisons),

            // ENHANCED: Breaking change analysis across all versions
            breaking_change_summary: analyzeBreakingChangeSummary(comparisons),

            // Overall insights
            overall_insights: generateOverallInsightsEnhanced(comparisons),

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
 * ENHANCED: Compare a group of versions for the same module with better version detection
 * @param {Object} folderInfo - Folder information
 * @param {string} prefix - Version prefix (e.g., "1.2")
 * @param {Array} files - Array of filenames
 * @param {Object} options - Comparison options
 * @returns {Object} Version group comparison
 */
const compareVersionGroupEnhanced = (folderInfo, prefix, files, options) => {
    try {
        // ENHANCED: Sort files by sophisticated version order
        const sortedFiles = sortVersionFilesEnhanced(files);

        // Analyze each version individually
        const versionAnalyses = [];

        for (const filename of sortedFiles) {
            const filePath = path.join(folderInfo.path, filename);
            const analysis = analyzeIndividualModule(filePath, options);

            if (analysis.success) {
                versionAnalyses.push({
                    filename,
                    ...analysis,
                    versionInfo: extractVersionInfoEnhanced(filename)
                });
            }
        }

        if (versionAnalyses.length < 2) {
            throw new Error(`Insufficient valid versions for comparison: ${versionAnalyses.length}`);
        }

        // Perform enhanced version-to-version comparison
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
                es3_compliant: va.analysis.es3_compliance.compliant,
                confidence_weighted_score: calculateConfidenceWeightedScore(va.analysis)
            })),

            // ENHANCED: Evolution analysis with confidence weighting
            evolution_analysis: analyzeEvolutionEnhanced(versionAnalyses),

            // ENHANCED: Sophisticated change detection
            change_analysis: analyzeChangesEnhanced(versionAnalyses),

            // ENHANCED: Quality progression with confidence factors
            quality_progression: analyzeQualityProgressionEnhanced(versionAnalyses),

            // ENHANCED: Precise breaking change detection
            breaking_changes: analyzeBreakingChangesEnhanced(versionAnalyses),

            // ENHANCED: Migration guidance
            migration_guidance: generateMigrationGuidance(versionAnalyses),

            // Recommendations
            recommendations: generateVersionRecommendationsEnhanced(versionAnalyses)
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
 * ENHANCED: Sort version files by sophisticated version detection algorithm
 * @param {Array} files - Array of filenames
 * @returns {Array} Sorted filenames in chronological order
 */
const sortVersionFilesEnhanced = (files) => {
    console.log(chalk.gray(`   Sorting ${files.length} version files with enhanced detection...`));

    return files.sort((a, b) => {
        // ENHANCED: Extract version information using multiple strategies
        const aInfo = extractVersionInfoEnhanced(a);
        const bInfo = extractVersionInfoEnhanced(b);

        // Strategy 1: Semantic version comparison (highest priority)
        if (aInfo.semanticVersion && bInfo.semanticVersion) {
            const aOrder = getSemanticOrderEnhanced(aInfo.semanticVersion);
            const bOrder = getSemanticOrderEnhanced(bInfo.semanticVersion);
            if (aOrder !== bOrder) {
                return aOrder - bOrder;
            }
        }

        // Strategy 2: Numeric version comparison (V3.1, v2.0, etc.)
        if (aInfo.numericVersion !== null && bInfo.numericVersion !== null) {
            if (aInfo.numericVersion !== bInfo.numericVersion) {
                return aInfo.numericVersion - bInfo.numericVersion;
            }
        }

        // Strategy 3: Decimal version comparison (3.1, 2.0, etc.)
        if (aInfo.decimalVersion !== null && bInfo.decimalVersion !== null) {
            if (aInfo.decimalVersion !== bInfo.decimalVersion) {
                return aInfo.decimalVersion - bInfo.decimalVersion;
            }
        }

        // Strategy 4: Timestamp/year comparison (2024, 2023, etc.)
        if (aInfo.timestamp !== null && bInfo.timestamp !== null) {
            return aInfo.timestamp - bInfo.timestamp;
        }

        // Strategy 5: Date-based naming patterns
        if (aInfo.datePattern && bInfo.datePattern) {
            return aInfo.datePattern.localeCompare(bInfo.datePattern);
        }

        // Fallback: Alphabetical
        return a.localeCompare(b);
    });
};

/**
 * ENHANCED: Extract comprehensive version information from filename
 * @param {string} filename - Filename to analyze
 * @returns {Object} Enhanced version information
 */
const extractVersionInfoEnhanced = (filename) => {
    const info = {
        filename,
        numericVersion: null,
        decimalVersion: null,
        timestamp: null,
        semanticVersion: null,
        datePattern: null,
        versionType: 'unknown',
        confidence: 0
    };

    console.log(chalk.gray(`     Analyzing version info for: ${filename}`));

    // ENHANCED Pattern 1: Versioned patterns (_V3.1, _v2.0, _version1.5)
    const versionPatterns = [
        { pattern: /_[Vv](\d+\.?\d*)/, type: 'numeric_v', confidence: 95 },
        { pattern: /_version(\d+\.?\d*)/i, type: 'numeric_version', confidence: 90 },
        { pattern: /_(\d+\.\d+)/, type: 'decimal', confidence: 85 }
    ];

    for (const { pattern, type, confidence } of versionPatterns) {
        const match = filename.match(pattern);
        if (match) {
            const versionNum = parseFloat(match[1]);
            info.numericVersion = versionNum;
            info.decimalVersion = versionNum;
            info.versionType = type;
            info.confidence = confidence;
            console.log(chalk.gray(`       Found ${type}: ${versionNum} (confidence: ${confidence}%)`));
            break;
        }
    }

    // ENHANCED Pattern 2: Timestamp patterns (_2024, _2023, _20240615)
    const timestampPatterns = [
        { pattern: /_(\d{4})(?:\d{4})?/, type: 'year', confidence: 80 },
        { pattern: /_(\d{8})/, type: 'date', confidence: 90 },
        { pattern: /_(\d{4}-\d{2}-\d{2})/, type: 'iso_date', confidence: 95 }
    ];

    for (const { pattern, type, confidence } of timestampPatterns) {
        const match = filename.match(pattern);
        if (match) {
            if (type === 'year') {
                info.timestamp = parseInt(match[1]);
            } else if (type === 'date') {
                info.timestamp = parseInt(match[1]);
                info.datePattern = match[1];
            } else if (type === 'iso_date') {
                info.datePattern = match[1];
                info.timestamp = new Date(match[1]).getTime();
            }
            
            if (info.confidence < confidence) {
                info.versionType = type;
                info.confidence = confidence;
            }
            console.log(chalk.gray(`       Found ${type}: ${match[1]} (confidence: ${confidence}%)`));
            break;
        }
    }

    // ENHANCED Pattern 3: Semantic version indicators with enhanced detection
    const semanticPatterns = [
        { pattern: /_original/i, semantic: 'original', order: 1, confidence: 85 },
        { pattern: /_old/i, semantic: 'old', order: 2, confidence: 90 },
        { pattern: /_backup/i, semantic: 'backup', order: 3, confidence: 80 },
        { pattern: /_previous/i, semantic: 'previous', order: 4, confidence: 85 },
        { pattern: /_current/i, semantic: 'current', order: 5, confidence: 90 },
        { pattern: /_updated/i, semantic: 'updated', order: 6, confidence: 85 },
        { pattern: /_modified/i, semantic: 'modified', order: 7, confidence: 80 },
        { pattern: /_revised/i, semantic: 'revised', order: 8, confidence: 85 },
        { pattern: /_fixed/i, semantic: 'fixed', order: 9, confidence: 85 },
        { pattern: /_new/i, semantic: 'new', order: 10, confidence: 90 },
        { pattern: /_latest/i, semantic: 'latest', order: 11, confidence: 95 },
        { pattern: /_final/i, semantic: 'final', order: 12, confidence: 90 }
    ];

    for (const { pattern, semantic, order, confidence } of semanticPatterns) {
        if (pattern.test(filename)) {
            info.semanticVersion = semantic;
            info.semanticOrder = order;
            
            if (info.confidence < confidence) {
                info.versionType = 'semantic';
                info.confidence = confidence;
            }
            console.log(chalk.gray(`       Found semantic: ${semantic} (order: ${order}, confidence: ${confidence}%)`));
            break;
        }
    }

    // ENHANCED Pattern 4: Complex version patterns (_v2.1_updated, _V3.1_new)
    const complexPattern = /_[Vv]?(\d+\.?\d*)_(\w+)/;
    const complexMatch = filename.match(complexPattern);
    if (complexMatch) {
        const numericPart = parseFloat(complexMatch[1]);
        const semanticPart = complexMatch[2].toLowerCase();
        
        info.numericVersion = numericPart;
        info.decimalVersion = numericPart;
        
        // Find semantic meaning
        const semanticInfo = semanticPatterns.find(p => p.pattern.test(semanticPart));
        if (semanticInfo) {
            info.semanticVersion = semanticInfo.semantic;
            info.semanticOrder = semanticInfo.order;
            info.versionType = 'complex';
            info.confidence = 95;
            console.log(chalk.gray(`       Found complex: v${numericPart}_${semanticPart} (confidence: 95%)`));
        }
    }

    console.log(chalk.gray(`       Final: type=${info.versionType}, confidence=${info.confidence}%`));
    return info;
};

/**
 * ENHANCED: Get semantic order with more sophisticated ordering
 * @param {string} semantic - Semantic version string
 * @returns {number} Sort order
 */
const getSemanticOrderEnhanced = (semantic) => {
    const semanticOrders = {
        'original': 1,
        'old': 2,
        'backup': 3,
        'previous': 4,
        'current': 5,
        'updated': 6,
        'modified': 7,
        'revised': 8,
        'fixed': 9,
        'new': 10,
        'latest': 11,
        'final': 12
    };

    return semanticOrders[semantic.toLowerCase()] || 50;
};

/**
 * Calculate confidence-weighted score for version comparison
 * @param {Object} analysis - Module analysis
 * @returns {Number} Confidence-weighted score
 */
const calculateConfidenceWeightedScore = (analysis) => {
    let baseScore = analysis.health_score.total_score;
    let confidenceAdjustment = 0;

    // Reduce score based on low-confidence violations
    if (analysis.es3_compliance?.violations) {
        analysis.es3_compliance.violations.forEach(violation => {
            const confidence = violation.confidence_score || 50;
            if (confidence < 85) {
                confidenceAdjustment -= 10; // Penalty for uncertain violations
            }
        });
    }

    if (analysis.reserved_word_safety?.violations) {
        analysis.reserved_word_safety.violations.forEach(violation => {
            const confidence = violation.confidence_score || 50;
            if (confidence < 85) {
                confidenceAdjustment -= 8;
            }
        });
    }

    return Math.max(0, baseScore + confidenceAdjustment);
};

/**
 * ENHANCED: Analyze evolution between versions with confidence weighting
 * @param {Array} versionAnalyses - Array of version analyses
 * @returns {Object} Enhanced evolution analysis
 */
const analyzeEvolutionEnhanced = (versionAnalyses) => {
    const evolution = {
        functions_added: [],
        functions_removed: [],
        functions_modified: [],
        signature_changes: [],
        line_count_progression: [],
        health_score_progression: [],
        confidence_weighted_progression: [],
        es3_compliance_progression: []
    };

    // Track metrics progression
    versionAnalyses.forEach(va => {
        evolution.line_count_progression.push({
            version: va.filename,
            line_count: va.analysis.module_info.line_count,
            version_info: va.versionInfo
        });

        evolution.health_score_progression.push({
            version: va.filename,
            health_score: va.analysis.health_score.total_score,
            grade: va.analysis.health_score.grade,
            version_info: va.versionInfo
        });

        // ENHANCED: Confidence-weighted progression
        const confidenceWeightedScore = calculateConfidenceWeightedScore(va.analysis);
        evolution.confidence_weighted_progression.push({
            version: va.filename,
            original_score: va.analysis.health_score.total_score,
            confidence_weighted_score: confidenceWeightedScore,
            confidence_adjustment: confidenceWeightedScore - va.analysis.health_score.total_score,
            version_info: va.versionInfo
        });

        evolution.es3_compliance_progression.push({
            version: va.filename,
            compliant: va.analysis.es3_compliance.compliant,
            violations: va.analysis.es3_compliance.violations.length,
            high_confidence_violations: va.analysis.es3_compliance.violations.filter(v => (v.confidence_score || 0) >= 85).length,
            version_info: va.versionInfo
        });
    });

    // ENHANCED: Compare function sets between consecutive versions with signature analysis
    for (let i = 1; i < versionAnalyses.length; i++) {
        const prevVersion = versionAnalyses[i - 1];
        const currVersion = versionAnalyses[i];

        const prevFunctions = extractFunctionSignatures(prevVersion.analysis.function_inventory);
        const currFunctions = extractFunctionSignatures(currVersion.analysis.function_inventory);

        // Find added functions
        const added = currFunctions.filter(f => !prevFunctions.some(pf => pf.name === f.name));
        const removed = prevFunctions.filter(f => !currFunctions.some(cf => cf.name === f.name));

        if (added.length > 0) {
            evolution.functions_added.push({
                from_version: prevVersion.filename,
                to_version: currVersion.filename,
                added_functions: added.map(f => ({ name: f.name, signature: f.signature }))
            });
        }

        if (removed.length > 0) {
            evolution.functions_removed.push({
                from_version: prevVersion.filename,
                to_version: currVersion.filename,
                removed_functions: removed.map(f => ({ name: f.name, signature: f.signature }))
            });
        }

        // ENHANCED: Detect function signature changes
        const commonFunctions = currFunctions.filter(cf => prevFunctions.some(pf => pf.name === cf.name));
        const signatureChanges = [];

        commonFunctions.forEach(currFunc => {
            const prevFunc = prevFunctions.find(pf => pf.name === currFunc.name);
            if (prevFunc && prevFunc.signature !== currFunc.signature) {
                signatureChanges.push({
                    function_name: currFunc.name,
                    old_signature: prevFunc.signature,
                    new_signature: currFunc.signature,
                    change_type: analyzeSignatureChange(prevFunc.signature, currFunc.signature)
                });
            }
        });

        if (signatureChanges.length > 0) {
            evolution.signature_changes.push({
                from_version: prevVersion.filename,
                to_version: currVersion.filename,
                signature_changes: signatureChanges
            });
        }
    }

    return evolution;
};

/**
 * Extract function signatures from function inventory
 * @param {Object} inventory - Function inventory
 * @returns {Array} Array of function signatures
 */
const extractFunctionSignatures = (inventory) => {
    const signatures = [];

    // Get function signatures
    if (inventory.function_signatures) {
        inventory.function_signatures.forEach(sig => {
            const nameMatch = sig.match(/function\s+(\w+)\s*\(/);
            if (nameMatch) {
                signatures.push({
                    name: nameMatch[1],
                    signature: sig
                });
            }
        });
    }

    // Fallback: construct from function lists
    if (signatures.length === 0) {
        if (inventory.withParameters) {
            inventory.withParameters.forEach(func => {
                const name = typeof func === 'string' ? func : func.name;
                const params = typeof func === 'object' ? func.parameters : [];
                signatures.push({
                    name: name,
                    signature: `function ${name}(${params.join(', ')})`
                });
            });
        }

        if (inventory.withoutParameters) {
            inventory.withoutParameters.forEach(name => {
                signatures.push({
                    name: name,
                    signature: `function ${name}()`
                });
            });
        }
    }

    return signatures;
};

/**
 * Analyze type of signature change
 * @param {String} oldSig - Old signature
 * @param {String} newSig - New signature
 * @returns {String} Change type
 */
const analyzeSignatureChange = (oldSig, newSig) => {
    const oldParams = (oldSig.match(/\(([^)]*)\)/) || ['', ''])[1].split(',').filter(p => p.trim());
    const newParams = (newSig.match(/\(([^)]*)\)/) || ['', ''])[1].split(',').filter(p => p.trim());

    if (newParams.length > oldParams.length) {
        return 'parameters_added';
    } else if (newParams.length < oldParams.length) {
        return 'parameters_removed';
    } else if (oldParams.join(',') !== newParams.join(',')) {
        return 'parameters_changed';
    } else {
        return 'signature_formatting_changed';
    }
};

/**
 * ENHANCED: Analyze changes between versions with confidence weighting
 * @param {Array} versionAnalyses - Array of version analyses
 * @returns {Object} Enhanced change analysis
 */
const analyzeChangesEnhanced = (versionAnalyses) => {
    const changes = {
        version_to_version_changes: [],
        overall_trends: {},
        confidence_impact_analysis: {}
    };

    // Compare consecutive versions
    for (let i = 1; i < versionAnalyses.length; i++) {
        const prevVersion = versionAnalyses[i - 1];
        const currVersion = versionAnalyses[i];

        const change = {
            from_version: prevVersion.filename,
            to_version: currVersion.filename,
            from_version_info: prevVersion.versionInfo,
            to_version_info: currVersion.versionInfo,
            changes: {},
            confidence_changes: {}
        };

        // Basic metric changes
        change.changes.line_count_change = currVersion.analysis.module_info.line_count -
            prevVersion.analysis.module_info.line_count;
        change.changes.function_count_change = currVersion.analysis.function_inventory.total_count -
            prevVersion.analysis.function_inventory.total_count;
        change.changes.health_score_change = currVersion.analysis.health_score.total_score -
            prevVersion.analysis.health_score.total_score;

        // ENHANCED: Confidence-weighted changes
        const prevConfidenceScore = calculateConfidenceWeightedScore(prevVersion.analysis);
        const currConfidenceScore = calculateConfidenceWeightedScore(currVersion.analysis);
        change.confidence_changes.confidence_weighted_change = currConfidenceScore - prevConfidenceScore;
        change.confidence_changes.confidence_impact = change.confidence_changes.confidence_weighted_change - change.changes.health_score_change;

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

        changes.version_to_version_changes.push(change);
    }

    // Calculate overall trends
    if (versionAnalyses.length >= 2) {
        const first = versionAnalyses[0];
        const last = versionAnalyses[versionAnalyses.length - 1];

        changes.overall_trends = {
            total_line_change: last.analysis.module_info.line_count - first.analysis.module_info.line_count,
            total_function_change: last.analysis.function_inventory.total_count - first.analysis.function_inventory.total_count,
            total_health_change: last.analysis.health_score.total_score - first.analysis.health_score.total_score,
            confidence_weighted_trend: calculateConfidenceWeightedScore(last.analysis) - calculateConfidenceWeightedScore(first.analysis)
        };
    }

    return changes;
};

/**
 * ENHANCED: Analyze quality progression with confidence factors
 * @param {Array} versionAnalyses - Array of version analyses
 * @returns {Object} Enhanced quality progression analysis
 */
const analyzeQualityProgressionEnhanced = (versionAnalyses) => {
    const progression = {
        overall_trend: 'stable',
        confidence_weighted_trend: 'stable',
        health_score_trend: calculateTrendEnhanced(versionAnalyses.map(va => va.analysis.health_score.total_score)),
        confidence_weighted_score_trend: calculateTrendEnhanced(versionAnalyses.map(va => calculateConfidenceWeightedScore(va.analysis))),
        line_count_trend: calculateTrendEnhanced(versionAnalyses.map(va => va.analysis.module_info.line_count)),
        function_count_trend: calculateTrendEnhanced(versionAnalyses.map(va => va.analysis.function_inventory.total_count)),

        quality_improvements: [],
        quality_regressions: [],
        confidence_improvements: [],
        confidence_regressions: [],

        best_version: null,
        worst_version: null,
        most_confident_version: null
    };

    // Find best, worst, and most confident versions
    let bestScore = -1;
    let worstScore = Infinity;
    let highestConfidenceScore = -1;

    versionAnalyses.forEach(va => {
        const score = va.analysis.health_score.total_score;
        const confidenceScore = calculateConfidenceWeightedScore(va.analysis);

        if (score > bestScore) {
            bestScore = score;
            progression.best_version = {
                filename: va.filename,
                health_score: score,
                grade: va.analysis.health_score.grade,
                version_info: va.versionInfo
            };
        }

        if (score < worstScore) {
            worstScore = score;
            progression.worst_version = {
                filename: va.filename,
                health_score: score,
                grade: va.analysis.health_score.grade,
                version_info: va.versionInfo
            };
        }

        if (confidenceScore > highestConfidenceScore) {
            highestConfidenceScore = confidenceScore;
            progression.most_confident_version = {
                filename: va.filename,
                confidence_weighted_score: confidenceScore,
                original_score: score,
                confidence_boost: confidenceScore - score,
                version_info: va.versionInfo
            };
        }
    });

    // ENHANCED: Identify improvements and regressions with confidence weighting
    for (let i = 1; i < versionAnalyses.length; i++) {
        const prev = versionAnalyses[i - 1];
        const curr = versionAnalyses[i];

        const prevScore = prev.analysis.health_score.total_score;
        const currScore = curr.analysis.health_score.total_score;
        const prevConfidenceScore = calculateConfidenceWeightedScore(prev.analysis);
        const currConfidenceScore = calculateConfidenceWeightedScore(curr.analysis);

        // Health score improvements/regressions
        if (currScore > prevScore + 50) {
            progression.quality_improvements.push({
                from_version: prev.filename,
                to_version: curr.filename,
                improvement: currScore - prevScore,
                description: `Health score improved by ${currScore - prevScore} points`,
                version_transition: `${prev.versionInfo.versionType} → ${curr.versionInfo.versionType}`
            });
        }

        if (currScore < prevScore - 50) {
            progression.quality_regressions.push({
                from_version: prev.filename,
                to_version: curr.filename,
                regression: prevScore - currScore,
                description: `Health score decreased by ${prevScore - currScore} points`,
                version_transition: `${prev.versionInfo.versionType} → ${curr.versionInfo.versionType}`
            });
        }

        // ENHANCED: Confidence-weighted improvements/regressions
        if (currConfidenceScore > prevConfidenceScore + 50) {
            progression.confidence_improvements.push({
                from_version: prev.filename,
                to_version: curr.filename,
                confidence_improvement: currConfidenceScore - prevConfidenceScore,
                original_change: currScore - prevScore,
                confidence_benefit: (currConfidenceScore - prevConfidenceScore) - (currScore - prevScore),
                description: `Confidence-weighted score improved by ${currConfidenceScore - prevConfidenceScore} points`
            });
        }

        if (currConfidenceScore < prevConfidenceScore - 50) {
            progression.confidence_regressions.push({
                from_version: prev.filename,
                to_version: curr.filename,
                confidence_regression: prevConfidenceScore - currConfidenceScore,
                original_change: currScore - prevScore,
                confidence_penalty: (prevConfidenceScore - currConfidenceScore) - (prevScore - currScore),
                description: `Confidence-weighted score decreased by ${prevConfidenceScore - currConfidenceScore} points`
            });
        }
    }

    // Determine overall trends
    if (progression.quality_improvements.length > progression.quality_regressions.length) {
        progression.overall_trend = 'improving';
    } else if (progression.quality_regressions.length > progression.quality_improvements.length) {
        progression.overall_trend = 'declining';
    }

    if (progression.confidence_improvements.length > progression.confidence_regressions.length) {
        progression.confidence_weighted_trend = 'improving';
    } else if (progression.confidence_regressions.length > progression.confidence_improvements.length) {
        progression.confidence_weighted_trend = 'declining';
    }

    return progression;
};

/**
 * ENHANCED: Calculate trend for a series of numbers with better classification
 * @param {Array} values - Array of numeric values
 * @returns {string} Enhanced trend description
 */
const calculateTrendEnhanced = (values) => {
    if (values.length < 2) return 'insufficient_data';

    const first = values[0];
    const last = values[values.length - 1];
    const change = last - first;
    const percentChange = first === 0 ? 0 : Math.abs((change / first) * 100);

    // Calculate intermediate volatility
    let volatility = 0;
    for (let i = 1; i < values.length; i++) {
        const stepChange = Math.abs(values[i] - values[i - 1]);
        volatility += stepChange;
    }
    volatility = volatility / (values.length - 1);

    if (percentChange < 5) {
        return volatility > first * 0.1 ? 'stable_volatile' : 'stable';
    } else if (change > 0) {
        if (percentChange > 50) return 'strongly_increasing';
        if (percentChange > 20) return 'moderately_increasing';
        return 'slightly_increasing';
    } else {
        if (percentChange > 50) return 'strongly_decreasing';
        if (percentChange > 20) return 'moderately_decreasing';
        return 'slightly_decreasing';
    }
};

/**
 * ENHANCED: Analyze breaking changes with precise detection
 * @param {Array} versionAnalyses - Array of version analyses
 * @returns {Object} Enhanced breaking changes analysis
 */
const analyzeBreakingChangesEnhanced = (versionAnalyses) => {
    const breakingChanges = {
        total_breaking_changes: 0,
        critical_breaking_changes: [],
        high_impact_changes: [],
        medium_impact_changes: [],
        function_removals: [],
        signature_changes: [],
        es3_compliance_breaks: [],
        migration_complexity: 'low'
    };

    // Compare consecutive versions for breaking changes
    for (let i = 1; i < versionAnalyses.length; i++) {
        const prevVersion = versionAnalyses[i - 1];
        const currVersion = versionAnalyses[i];

        const prevFunctions = extractFunctionSignatures(prevVersion.analysis.function_inventory);
        const currFunctions = extractFunctionSignatures(currVersion.analysis.function_inventory);

        // CRITICAL: Function removals are breaking changes
        const removedFunctions = prevFunctions.filter(pf => !currFunctions.some(cf => cf.name === pf.name));
        if (removedFunctions.length > 0) {
            const breaking = {
                from_version: prevVersion.filename,
                to_version: currVersion.filename,
                type: 'function_removal',
                severity: 'critical',
                removed_functions: removedFunctions.map(f => ({
                    name: f.name,
                    signature: f.signature
                })),
                impact: `${removedFunctions.length} functions removed - will break dependent code`,
                migration_strategy: 'Replace removed function calls or implement alternatives'
            };
            
            breakingChanges.critical_breaking_changes.push(breaking);
            breakingChanges.function_removals.push(breaking);
            breakingChanges.total_breaking_changes += removedFunctions.length;
        }

        // HIGH IMPACT: Function signature changes  
        const signatureChanges = [];
        currFunctions.forEach(currFunc => {
            const prevFunc = prevFunctions.find(pf => pf.name === currFunc.name);
            if (prevFunc && prevFunc.signature !== currFunc.signature) {
                const changeType = analyzeSignatureChange(prevFunc.signature, currFunc.signature);
                
                // Determine impact level
                let impact = 'medium';
                if (changeType === 'parameters_removed' || changeType === 'parameters_changed') {
                    impact = 'high';
                }
                
                signatureChanges.push({
                    function_name: currFunc.name,
                    old_signature: prevFunc.signature,
                    new_signature: currFunc.signature,
                    change_type: changeType,
                    impact: impact,
                    migration_hint: generateSignatureMigrationHint(changeType, currFunc.name)
                });
            }
        });

        if (signatureChanges.length > 0) {
            const breaking = {
                from_version: prevVersion.filename,
                to_version: currVersion.filename,
                type: 'signature_changes',
                severity: 'high',
                signature_changes: signatureChanges,
                impact: `${signatureChanges.length} function signatures changed`,
                migration_strategy: 'Update function calls to match new signatures'
            };

            const highImpactChanges = signatureChanges.filter(sc => sc.impact === 'high');
            if (highImpactChanges.length > 0) {
                breakingChanges.high_impact_changes.push(breaking);
            } else {
                breakingChanges.medium_impact_changes.push(breaking);
            }
            
            breakingChanges.signature_changes.push(breaking);
            breakingChanges.total_breaking_changes += signatureChanges.length;
        }

        // CRITICAL: ES3 compliance loss
        const prevES3 = prevVersion.analysis.es3_compliance.compliant;
        const currES3 = currVersion.analysis.es3_compliance.compliant;

        if (prevES3 && !currES3) {
            const breaking = {
                from_version: prevVersion.filename,
                to_version: currVersion.filename,
                type: 'es3_compliance_loss',
                severity: 'critical',
                impact: 'Module will not run in ExtendScript environment',
                es3_violations: currVersion.analysis.es3_compliance.violations.filter(v => (v.confidence_score || 0) >= 85),
                migration_strategy: 'Fix ES3 violations before deployment to ExtendScript'
            };
            
            breakingChanges.critical_breaking_changes.push(breaking);
            breakingChanges.es3_compliance_breaks.push(breaking);
            breakingChanges.total_breaking_changes++;
        }
    }

    // Determine migration complexity
    const criticalCount = breakingChanges.critical_breaking_changes.length;
    const highCount = breakingChanges.high_impact_changes.length;

    if (criticalCount > 0 || highCount > 3) {
        breakingChanges.migration_complexity = 'high';
    } else if (highCount > 0 || breakingChanges.medium_impact_changes.length > 5) {
        breakingChanges.migration_complexity = 'medium';
    }

    return breakingChanges;
};

/**
 * Generate signature migration hint
 * @param {String} changeType - Type of signature change
 * @param {String} functionName - Function name
 * @returns {String} Migration hint
 */
const generateSignatureMigrationHint = (changeType, functionName) => {
    switch (changeType) {
        case 'parameters_added':
            return `Update calls to ${functionName}() to include new parameters`;
        case 'parameters_removed':
            return `Remove unused parameters from ${functionName}() calls`;
        case 'parameters_changed':
            return `Update parameter order/types for ${functionName}() calls`;
        default:
            return `Review ${functionName}() function calls for compatibility`;
    }
};

/**
 * Generate migration guidance
 * @param {Array} versionAnalyses - Array of version analyses
 * @returns {Object} Migration guidance
 */
const generateMigrationGuidance = (versionAnalyses) => {
    if (versionAnalyses.length < 2) return null;

    const oldest = versionAnalyses[0];
    const newest = versionAnalyses[versionAnalyses.length - 1];

    return {
        migration_path: `${oldest.filename} → ${newest.filename}`,
        complexity_assessment: 'medium', // Will be updated by breaking changes analysis
        recommended_approach: 'incremental', // vs 'direct'
        
        pre_migration_checklist: [
            'Backup current implementation',
            'Review breaking changes list',
            'Update function calls as needed',
            'Test ES3 compatibility if targeting ExtendScript'
        ],
        
        post_migration_validation: [
            'Verify all function calls work',
            'Check ES3 compliance',
            'Test registration accuracy',
            'Validate health score improvements'
        ],
        
        rollback_plan: {
            strategy: 'Keep previous version as backup',
            requirements: ['Save current working version', 'Document changes made'],
            estimated_rollback_time: '30 minutes'
        }
    };
};

/**
 * Generate enhanced version recommendations
 * @param {Array} versionAnalyses - Array of version analyses
 * @returns {Array} Array of enhanced recommendations
 */
const generateVersionRecommendationsEnhanced = (versionAnalyses) => {
    const recommendations = [];

    if (versionAnalyses.length < 2) {
        return recommendations;
    }

    const latest = versionAnalyses[versionAnalyses.length - 1];
    const first = versionAnalyses[0];

    // Compare latest to first with confidence weighting
    const healthChange = latest.analysis.health_score.total_score - first.analysis.health_score.total_score;
    const confidenceWeightedChange = calculateConfidenceWeightedScore(latest.analysis) - calculateConfidenceWeightedScore(first.analysis);

    // Quality regression analysis
    if (confidenceWeightedChange < -100) {
        recommendations.push({
            priority: 'critical',
            category: 'quality_regression',
            description: 'Significant confidence-weighted quality regression detected',
            action: 'Review changes and consider reverting problematic modifications',
            confidence_impact: `Confidence-weighted score declined by ${Math.abs(confidenceWeightedChange)} points`
        });
    }

    // ES3 compliance recommendations
    if (!latest.analysis.es3_compliance.compliant && first.analysis.es3_compliance.compliant) {
        const highConfidenceViolations = latest.analysis.es3_compliance.violations.filter(v => (v.confidence_score || 0) >= 85);
        
        recommendations.push({
            priority: 'critical',
            category: 'es3_compliance',
            description: 'ES3 compliance was lost in evolution',
            action: 'Fix high-confidence ES3 compatibility issues to maintain ExtendScript compatibility',
            high_confidence_violations: highConfidenceViolations.length,
            estimated_fix_time: `${highConfidenceViolations.length * 15} minutes`
        });
    }

    // Version selection recommendation
    let bestVersion = versionAnalyses[0];
    let mostConfidentVersion = versionAnalyses[0];
    
    versionAnalyses.forEach(va => {
        if (va.analysis.health_score.total_score > bestVersion.analysis.health_score.total_score) {
            bestVersion = va;
        }
        
        if (calculateConfidenceWeightedScore(va.analysis) > calculateConfidenceWeightedScore(mostConfidentVersion.analysis)) {
            mostConfidentVersion = va;
        }
    });

    if (bestVersion !== latest) {
        recommendations.push({
            priority: 'medium',
            category: 'version_selection',
            description: `Version ${bestVersion.filename} has better quality than latest`,
            action: 'Consider using or merging improvements from higher-quality version',
            quality_difference: bestVersion.analysis.health_score.total_score - latest.analysis.health_score.total_score
        });
    }

    if (mostConfidentVersion !== latest && mostConfidentVersion !== bestVersion) {
        recommendations.push({
            priority: 'medium',
            category: 'confidence_optimization',
            description: `Version ${mostConfidentVersion.filename} has highest confidence-weighted score`,
            action: 'Consider this version for most reliable analysis results',
            confidence_advantage: calculateConfidenceWeightedScore(mostConfidentVersion.analysis) - calculateConfidenceWeightedScore(latest.analysis)
        });
    }

    return recommendations;
};

/**
 * ENHANCED: Analyze evolution patterns across all version groups
 * @param {Array} comparisons - Array of version group comparisons
 * @returns {Object} Enhanced evolution patterns analysis
 */
const analyzeEvolutionPatternsEnhanced = (comparisons) => {
    const patterns = {
        common_evolution_patterns: [],
        quality_trends: [],
        confidence_trends: [],
        size_trends: [],
        breaking_change_patterns: []
    };

    // Analyze trends across all comparisons
    comparisons.forEach(comp => {
        const analysis = comp.analysis;

        // Quality trend analysis
        if (analysis.quality_progression.overall_trend === 'improving') {
            patterns.quality_trends.push(`${analysis.prefix}: Quality improving (${analysis.quality_progression.health_score_trend})`);
        } else if (analysis.quality_progression.overall_trend === 'declining') {
            patterns.quality_trends.push(`${analysis.prefix}: Quality declining (${analysis.quality_progression.health_score_trend})`);
        }

        // ENHANCED: Confidence trend analysis
        if (analysis.quality_progression.confidence_weighted_trend === 'improving') {
            patterns.confidence_trends.push(`${analysis.prefix}: Confidence-weighted score improving`);
        } else if (analysis.quality_progression.confidence_weighted_trend === 'declining') {
            patterns.confidence_trends.push(`${analysis.prefix}: Confidence-weighted score declining`);
        }

        // Size trend analysis
        if (analysis.quality_progression.line_count_trend.includes('increasing')) {
            patterns.size_trends.push(`${analysis.prefix}: Size increasing (${analysis.quality_progression.line_count_trend})`);
        } else if (analysis.quality_progression.line_count_trend.includes('decreasing')) {
            patterns.size_trends.push(`${analysis.prefix}: Size decreasing (${analysis.quality_progression.line_count_trend})`);
        }

        // Breaking change patterns
        if (analysis.breaking_changes.total_breaking_changes > 0) {
            patterns.breaking_change_patterns.push({
                prefix: analysis.prefix,
                total_breaking_changes: analysis.breaking_changes.total_breaking_changes,
                migration_complexity: analysis.breaking_changes.migration_complexity,
                critical_changes: analysis.breaking_changes.critical_breaking_changes.length
            });
        }
    });

    return patterns;
};

/**
 * Analyze breaking change summary across all comparisons
 * @param {Array} comparisons - Array of version group comparisons
 * @returns {Object} Breaking change summary
 */
const analyzeBreakingChangeSummary = (comparisons) => {
    const summary = {
        total_modules_with_breaking_changes: 0,
        total_breaking_changes: 0,
        most_problematic_modules: [],
        common_breaking_change_types: {},
        migration_complexity_distribution: { low: 0, medium: 0, high: 0 }
    };

    comparisons.forEach(comp => {
        const breakingChanges = comp.analysis.breaking_changes;
        
        if (breakingChanges.total_breaking_changes > 0) {
            summary.total_modules_with_breaking_changes++;
            summary.total_breaking_changes += breakingChanges.total_breaking_changes;
            
            // Track problematic modules
            summary.most_problematic_modules.push({
                module: comp.analysis.prefix,
                breaking_changes: breakingChanges.total_breaking_changes,
                complexity: breakingChanges.migration_complexity
            });
            
            // Count breaking change types
            breakingChanges.critical_breaking_changes.forEach(change => {
                summary.common_breaking_change_types[change.type] = (summary.common_breaking_change_types[change.type] || 0) + 1;
            });
            
            // Migration complexity distribution
            summary.migration_complexity_distribution[breakingChanges.migration_complexity]++;
        }
    });

    // Sort most problematic modules
    summary.most_problematic_modules.sort((a, b) => b.breaking_changes - a.breaking_changes);

    return summary;
};

/**
 * ENHANCED: Generate overall insights across all comparisons
 * @param {Array} comparisons - Array of version group comparisons
 * @returns {Object} Enhanced overall insights
 */
const generateOverallInsightsEnhanced = (comparisons) => {
    const insights = {
        summary: [],
        recommendations: [],
        best_practices_observed: [],
        anti_patterns_observed: [],
        confidence_insights: []
    };

    let totalVersions = 0;
    let improvingModules = 0;
    let decliningModules = 0;
    let confidenceImprovingModules = 0;
    let confidenceDecliningModules = 0;

    comparisons.forEach(comp => {
        const analysis = comp.analysis;
        totalVersions += analysis.versions_count;

        if (analysis.quality_progression.overall_trend === 'improving') {
            improvingModules++;
        } else if (analysis.quality_progression.overall_trend === 'declining') {
            decliningModules++;
        }

        if (analysis.quality_progression.confidence_weighted_trend === 'improving') {
            confidenceImprovingModules++;
        } else if (analysis.quality_progression.confidence_weighted_trend === 'declining') {
            confidenceDecliningModules++;
        }
    });

    insights.summary.push(`Analyzed ${totalVersions} total versions across ${comparisons.length} modules`);
    insights.summary.push(`${improvingModules} modules showing quality improvement`);
    insights.summary.push(`${decliningModules} modules showing quality decline`);

    // ENHANCED: Confidence insights
    insights.confidence_insights.push(`${confidenceImprovingModules} modules showing confidence-weighted improvement`);
    insights.confidence_insights.push(`${confidenceDecliningModules} modules showing confidence-weighted decline`);

    // Recommendations based on trends
    if (improvingModules > decliningModules) {
        insights.recommendations.push('Overall positive evolution trend - continue current practices');
    } else if (decliningModules > improvingModules) {
        insights.recommendations.push('Quality decline detected - review development processes');
    }

    if (confidenceImprovingModules > confidenceDecliningModules) {
        insights.recommendations.push('Detection confidence is improving - analysis becoming more reliable');
    } else if (confidenceDecliningModules > confidenceImprovingModules) {
        insights.recommendations.push('Detection confidence declining - review analysis accuracy');
    }

    // Identify best practices
    if (improvingModules > 0) {
        insights.best_practices_observed.push('Consistent quality improvement across versions');
    }

    // Identify anti-patterns
    if (decliningModules > comparisons.length / 2) {
        insights.anti_patterns_observed.push('Majority of modules showing quality decline over time');
    }

    return insights;
};

export default {
    compareModuleVersions
};