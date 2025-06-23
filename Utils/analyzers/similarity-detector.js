// analyzers/similarity-detector.js
// SIMILARITY DETECTOR - PHASE 3 FIXES
// Function similarity and duplication analysis with confidence integration
// FIXED: Integration with corrected core analysis, confidence weighting, accurate function parsing
// ============================================================================

import chalk from 'chalk';
import { isWhitelisted, getWhitelistReason } from '../config/whitelists.js';
import { SIMILARITY_RULES } from '../config/analysis-rules.js';

/**
 * ENHANCED: Analyze function similarity across modules with confidence integration
 * @param {Array} moduleAnalyses - Array of module analyses with confidence scores
 * @param {Object} options - Analysis options
 * @returns {Object} Confidence-weighted similarity analysis results
 */
export const analyzeFunctionSimilarity = (moduleAnalyses, options = {}) => {
    const startTime = Date.now();
    const context = options.context || 'system'; // 'system' or 'version'
    const threshold = options.threshold || 75;
    const confidenceThreshold = options.confidenceThreshold || 85; // NEW: Confidence threshold

    console.log(chalk.cyan(`🔍 Analyzing function similarity with confidence weighting (${context} context, ${threshold}% threshold, ${confidenceThreshold}% confidence)...`));

    try {
        const analysis = {
            context,
            threshold,
            confidence_threshold: confidenceThreshold,
            total_functions_analyzed: 0,
            comparisons_performed: 0,

            // ENHANCED: Results with confidence categorization
            similarities: [],
            exact_duplicates: [],
            high_confidence_similarities: [],
            low_confidence_similarities: [],
            whitelisted_skips: [],

            // ENHANCED: Statistics with confidence breakdown
            similarity_stats: {
                exact_matches: 0,
                very_similar: 0,    // >90%
                similar: 0,         // >75%
                somewhat_similar: 0, // >60%
                high_confidence_matches: 0,
                low_confidence_matches: 0
            },

            // ENHANCED: Confidence metrics
            confidence_metrics: {
                average_similarity_confidence: 0,
                high_confidence_percentage: 0,
                uncertain_similarities: 0
            },

            // Performance metrics
            analysis_time_ms: 0
        };

        // ENHANCED: Collect all functions with confidence data
        const allFunctions = collectAllFunctionsWithConfidence(moduleAnalyses);
        analysis.total_functions_analyzed = allFunctions.length;

        console.log(chalk.gray(`   Functions to analyze: ${allFunctions.length} (with confidence data)`));

        // Perform similarity analysis with confidence integration
        if (context === 'version') {
            // Version comparison - different approach
            analysis.similarities = analyzeVersionSimilarityWithConfidence(allFunctions, moduleAnalyses, threshold, confidenceThreshold, analysis);
        } else {
            // System analysis - cross-module comparison with confidence
            analysis.similarities = analyzeSystemSimilarityWithConfidence(allFunctions, threshold, confidenceThreshold, analysis);
        }

        // ENHANCED: Categorize results by confidence
        analysis.similarities.forEach(sim => {
            const confidence = sim.confidence_score || 50;
            
            if (sim.similarity_percentage >= 98) {
                analysis.similarity_stats.exact_matches++;
                analysis.exact_duplicates.push(sim);
            } else if (sim.similarity_percentage >= 90) {
                analysis.similarity_stats.very_similar++;
            } else if (sim.similarity_percentage >= 75) {
                analysis.similarity_stats.similar++;
            } else if (sim.similarity_percentage >= 60) {
                analysis.similarity_stats.somewhat_similar++;
            }

            // Confidence categorization
            if (confidence >= confidenceThreshold) {
                analysis.similarity_stats.high_confidence_matches++;
                analysis.high_confidence_similarities.push(sim);
            } else {
                analysis.similarity_stats.low_confidence_matches++;
                analysis.low_confidence_similarities.push(sim);
            }
        });

        // Calculate confidence metrics
        if (analysis.similarities.length > 0) {
            const totalConfidence = analysis.similarities.reduce((sum, sim) => sum + (sim.confidence_score || 50), 0);
            analysis.confidence_metrics.average_similarity_confidence = Math.round(totalConfidence / analysis.similarities.length);
            analysis.confidence_metrics.high_confidence_percentage = Math.round((analysis.similarity_stats.high_confidence_matches / analysis.similarities.length) * 100);
            analysis.confidence_metrics.uncertain_similarities = analysis.low_confidence_similarities.length;
        }

        analysis.analysis_time_ms = Date.now() - startTime;

        console.log(chalk.green(`✅ Confidence-weighted similarity analysis complete (${analysis.analysis_time_ms}ms)`));
        console.log(chalk.cyan(`   Total similarities: ${analysis.similarities.length}`));
        console.log(chalk.cyan(`   High confidence: ${analysis.high_confidence_similarities.length}`));
        console.log(chalk.cyan(`   Low confidence: ${analysis.low_confidence_similarities.length}`));
        console.log(chalk.cyan(`   Average confidence: ${analysis.confidence_metrics.average_similarity_confidence}%`));
        console.log(chalk.gray(`   Whitelisted skips: ${analysis.whitelisted_skips.length}`));

        return analysis;

    } catch (error) {
        console.error(chalk.red(`❌ Similarity analysis failed: ${error.message}`));

        return {
            context,
            threshold,
            confidence_threshold: confidenceThreshold,
            error: error.message,
            analysis_time_ms: Date.now() - startTime
        };
    }
};

/**
 * ENHANCED: Collect all functions with confidence data from corrected module analyses
 * @param {Array} moduleAnalyses - Array of module analyses with confidence scores
 * @returns {Array} Array of function objects with confidence data
 */
const collectAllFunctionsWithConfidence = (moduleAnalyses) => {
    const allFunctions = [];

    moduleAnalyses.forEach(ma => {
        const moduleName = ma.analysis ? ma.analysis.module_info.filename : ma.filename;
        const functions = ma.analysis ? ma.analysis.function_inventory : null;

        if (!functions) return;

        // ENHANCED: Extract confidence scores from analysis
        const moduleConfidenceScore = calculateModuleConfidenceScore(ma.analysis);

        // Process functions with parameters
        if (functions.withParameters) {
            functions.withParameters.forEach(func => {
                const funcName = typeof func === 'string' ? func : func.name;
                const parameters = typeof func === 'object' ? func.parameters : [];

                allFunctions.push({
                    name: funcName,
                    module: moduleName,
                    parameters: parameters,
                    parameterCount: parameters.length,
                    signature: findFunctionSignature(functions, funcName),
                    hasErrorHandling: isInArray(functions.withErrorHandling, funcName),
                    hasLogging: isInArray(functions.withLogging, funcName),
                    
                    // ENHANCED: Include confidence data
                    module_confidence_score: moduleConfidenceScore,
                    function_confidence_score: calculateFunctionConfidenceScore(funcName, ma.analysis),
                    
                    // Enhanced function content with confidence
                    content: getFunctionContentWithConfidence(ma.analysis, funcName),
                    
                    // Module health indicators
                    module_health_score: ma.analysis.health_score?.total_score || 0,
                    module_es3_compliant: ma.analysis.es3_compliance?.compliant || false
                });
            });
        }

        // Process functions without parameters
        if (functions.withoutParameters) {
            functions.withoutParameters.forEach(funcName => {
                if (typeof funcName === 'string') {
                    allFunctions.push({
                        name: funcName,
                        module: moduleName,
                        parameters: [],
                        parameterCount: 0,
                        signature: findFunctionSignature(functions, funcName),
                        hasErrorHandling: isInArray(functions.withErrorHandling, funcName),
                        hasLogging: isInArray(functions.withLogging, funcName),
                        
                        // ENHANCED: Include confidence data
                        module_confidence_score: moduleConfidenceScore,
                        function_confidence_score: calculateFunctionConfidenceScore(funcName, ma.analysis),
                        content: getFunctionContentWithConfidence(ma.analysis, funcName),
                        module_health_score: ma.analysis.health_score?.total_score || 0,
                        module_es3_compliant: ma.analysis.es3_compliance?.compliant || false
                    });
                }
            });
        }
    });

    return allFunctions;
};

/**
 * Calculate module-level confidence score based on corrected analysis
 * @param {Object} moduleAnalysis - Individual module analysis
 * @returns {Number} Module confidence score (0-100)
 */
const calculateModuleConfidenceScore = (moduleAnalysis) => {
    if (!moduleAnalysis) return 50;

    let confidence = 80; // Base confidence for analyzed modules

    // Boost confidence for ES3 compliant modules
    if (moduleAnalysis.es3_compliance?.compliant) {
        confidence += 10;
    } else {
        // Reduce confidence based on low-confidence violations
        const violations = moduleAnalysis.es3_compliance?.violations || [];
        const lowConfidenceViolations = violations.filter(v => (v.confidence_score || 0) < 85);
        confidence -= lowConfidenceViolations.length * 5;
    }

    // Boost confidence for good registration accuracy
    const regAccuracy = moduleAnalysis.registration_compliance?.accuracyPercentage || 0;
    if (regAccuracy >= 95) {
        confidence += 10;
    } else if (regAccuracy < 80) {
        confidence -= 15;
    }

    // Boost confidence for high health scores
    const healthScore = moduleAnalysis.health_score?.total_score || 0;
    if (healthScore >= 900) {
        confidence += 5;
    } else if (healthScore < 600) {
        confidence -= 10;
    }

    return Math.max(0, Math.min(100, Math.round(confidence)));
};

/**
 * Calculate function-level confidence score
 * @param {String} functionName - Function name
 * @param {Object} moduleAnalysis - Module analysis
 * @returns {Number} Function confidence score (0-100)
 */
const calculateFunctionConfidenceScore = (functionName, moduleAnalysis) => {
    let confidence = 75; // Base confidence

    // Check if function is properly registered
    const registeredFunctions = moduleAnalysis.registration_compliance?.registeredFunctions || [];
    if (registeredFunctions.includes(functionName)) {
        confidence += 15;
    } else {
        confidence -= 20; // Penalty for unregistered functions
    }

    // Check if function has error handling
    const functionsWithErrorHandling = moduleAnalysis.function_inventory?.withErrorHandling || [];
    if (functionsWithErrorHandling.includes(functionName)) {
        confidence += 10;
    }

    // Check if function has logging
    const functionsWithLogging = moduleAnalysis.function_inventory?.withLogging || [];
    if (functionsWithLogging.includes(functionName)) {
        confidence += 5;
    }

    return Math.max(0, Math.min(100, Math.round(confidence)));
};

/**
 * Get function content with confidence assessment
 * @param {Object} moduleAnalysis - Module analysis
 * @param {String} functionName - Function name
 * @returns {Object} Function content with confidence
 */
const getFunctionContentWithConfidence = (moduleAnalysis, functionName) => {
    const functionContent = moduleAnalysis.functions?.functionContent?.[functionName];
    
    if (!functionContent) {
        return {
            available: false,
            confidence: 0,
            reason: 'No function content available'
        };
    }

    return {
        available: true,
        raw: functionContent.raw,
        normalized: functionContent.normalized,
        calls: functionContent.calls,
        confidence: 85, // High confidence when content is available
        extraction_method: 'parsed'
    };
};

/**
 * ENHANCED: Analyze similarity in system context with confidence weighting
 * @param {Array} allFunctions - All functions to compare
 * @param {Number} threshold - Similarity threshold
 * @param {Number} confidenceThreshold - Confidence threshold
 * @param {Object} analysis - Analysis object to update
 * @returns {Array} Array of confidence-weighted similarities
 */
const analyzeSystemSimilarityWithConfidence = (allFunctions, threshold, confidenceThreshold, analysis) => {
    const similarities = [];
    let comparisons = 0;

    console.log(chalk.gray(`   Performing confidence-weighted cross-module similarity analysis...`));

    // Compare all functions against each other
    for (let i = 0; i < allFunctions.length; i++) {
        const funcA = allFunctions[i];

        for (let j = i + 1; j < allFunctions.length; j++) {
            const funcB = allFunctions[j];
            comparisons++;

            // Skip if same function in same module
            if (funcA.module === funcB.module && funcA.name === funcB.name) {
                continue;
            }

            // Check whitelist with context
            if (isWhitelisted(funcA.name, 'system') || isWhitelisted(funcB.name, 'system')) {
                const reason = getWhitelistReason(funcA.name) || getWhitelistReason(funcB.name);
                analysis.whitelisted_skips.push({
                    function_a: funcA.name,
                    function_b: funcB.name,
                    reason: reason
                });
                continue;
            }

            // ENHANCED: Calculate similarity with confidence weighting
            const similarity = calculateFunctionSimilarityWithConfidence(funcA, funcB);

            if (similarity.percentage >= threshold) {
                // ENHANCED: Calculate overall confidence for this similarity detection
                const detectionConfidence = calculateSimilarityDetectionConfidence(funcA, funcB, similarity);
                
                const similarityRecord = {
                    function_a: {
                        name: funcA.name,
                        module: funcA.module,
                        signature: funcA.signature,
                        parameters: funcA.parameterCount,
                        module_health: funcA.module_health_score,
                        function_confidence: funcA.function_confidence_score
                    },
                    function_b: {
                        name: funcB.name,
                        module: funcB.module,
                        signature: funcB.signature,
                        parameters: funcB.parameterCount,
                        module_health: funcB.module_health_score,
                        function_confidence: funcB.function_confidence_score
                    },
                    similarity_percentage: similarity.percentage,
                    similarity_type: similarity.type,
                    same_module: funcA.module === funcB.module,
                    comparison_details: similarity.details,
                    
                    // ENHANCED: Confidence scoring
                    confidence_score: detectionConfidence,
                    confidence_category: detectionConfidence >= confidenceThreshold ? 'high' : 'low',
                    
                    // ENHANCED: Contextual recommendation
                    recommendation: generateConfidenceAwareSimilarityRecommendation(
                        similarity.percentage,
                        funcA.name,
                        funcB.name,
                        funcA.module === funcB.module,
                        detectionConfidence
                    ),
                    
                    // Module context for better decision making
                    module_context: {
                        both_es3_compliant: funcA.module_es3_compliant && funcB.module_es3_compliant,
                        health_score_difference: Math.abs(funcA.module_health_score - funcB.module_health_score),
                        combined_confidence: Math.round((funcA.function_confidence_score + funcB.function_confidence_score) / 2)
                    }
                };

                similarities.push(similarityRecord);
            }
        }

        // Progress reporting for large analyses
        if (i % 50 === 0 && i > 0) {
            const progress = Math.round((i / allFunctions.length) * 100);
            console.log(chalk.gray(`   Progress: ${progress}% (${comparisons} comparisons)`));
        }
    }

    analysis.comparisons_performed = comparisons;

    // ENHANCED: Sort by confidence-weighted similarity
    return similarities.sort((a, b) => {
        // Primary sort: confidence score
        if (a.confidence_score !== b.confidence_score) {
            return b.confidence_score - a.confidence_score;
        }
        // Secondary sort: similarity percentage
        return b.similarity_percentage - a.similarity_percentage;
    });
};

/**
 * ENHANCED: Calculate similarity with confidence integration
 * @param {Object} funcA - First function with confidence data
 * @param {Object} funcB - Second function with confidence data
 * @returns {Object} Enhanced similarity analysis with confidence
 */
const calculateFunctionSimilarityWithConfidence = (funcA, funcB) => {
    const weights = SIMILARITY_RULES.scoring_weights;
    let totalScore = 0;
    let maxScore = 0;
    let confidenceFactors = [];

    const details = {};

    // 1. Signature similarity (25%)
    maxScore += weights.signature_similarity;
    const sigSimilarity = calculateSignatureSimilarity(funcA, funcB);
    totalScore += sigSimilarity * weights.signature_similarity;
    details.signature_similarity = Math.round(sigSimilarity * 100);
    
    // High confidence for signature matches
    if (sigSimilarity > 0.8) {
        confidenceFactors.push({ factor: 'signature_match', confidence: 90 });
    }

    // 2. ENHANCED: Content similarity with confidence assessment (40%)
    maxScore += weights.content_similarity;
    let contentSimilarity = 0;
    let contentConfidence = 50;
    
    if (funcA.content?.available && funcB.content?.available) {
        contentSimilarity = calculateContentSimilarityEnhanced(funcA.content, funcB.content);
        contentConfidence = Math.min(funcA.content.confidence, funcB.content.confidence);
        confidenceFactors.push({ factor: 'content_available', confidence: contentConfidence });
    } else {
        // Fallback to signature-based estimation with lower confidence
        contentSimilarity = sigSimilarity * 0.8; // Penalty for missing content
        confidenceFactors.push({ factor: 'content_unavailable', confidence: 30 });
    }
    totalScore += contentSimilarity * weights.content_similarity;
    details.content_similarity = Math.round(contentSimilarity * 100);
    details.content_confidence = contentConfidence;

    // 3. Call pattern similarity (20%)
    maxScore += weights.calls_similarity;
    let callsSimilarity = 0;
    if (funcA.content?.calls && funcB.content?.calls) {
        callsSimilarity = calculateCallsSimilarity(funcA.content.calls, funcB.content.calls);
        confidenceFactors.push({ factor: 'calls_available', confidence: 80 });
    } else {
        confidenceFactors.push({ factor: 'calls_unavailable', confidence: 40 });
    }
    totalScore += callsSimilarity * weights.calls_similarity;
    details.calls_similarity = Math.round(callsSimilarity * 100);

    // 4. ENHANCED: Purpose similarity with confidence (15%)
    maxScore += weights.purpose_similarity;
    const purposeSimilarity = calculatePurposeSimilarityEnhanced(funcA, funcB);
    totalScore += purposeSimilarity * weights.purpose_similarity;
    details.purpose_similarity = Math.round(purposeSimilarity * 100);

    // Same name high confidence boost
    if (funcA.name === funcB.name) {
        confidenceFactors.push({ factor: 'same_name', confidence: 95 });
    }

    const percentage = Math.round((totalScore / maxScore) * 100);

    return {
        percentage,
        type: determineSimilarityType(percentage),
        details,
        confidence_factors: confidenceFactors
    };
};

/**
 * Calculate detection confidence for similarity finding
 * @param {Object} funcA - First function
 * @param {Object} funcB - Second function  
 * @param {Object} similarity - Similarity analysis
 * @returns {Number} Detection confidence (0-100)
 */
const calculateSimilarityDetectionConfidence = (funcA, funcB, similarity) => {
    let confidence = 60; // Base confidence

    // Boost confidence based on available data quality
    const avgModuleConfidence = (funcA.module_confidence_score + funcB.module_confidence_score) / 2;
    confidence += (avgModuleConfidence - 50) * 0.4; // Scale module confidence impact

    const avgFunctionConfidence = (funcA.function_confidence_score + funcB.function_confidence_score) / 2;
    confidence += (avgFunctionConfidence - 50) * 0.3; // Scale function confidence impact

    // Boost confidence for high similarity
    if (similarity.percentage >= 95) {
        confidence += 20;
    } else if (similarity.percentage >= 85) {
        confidence += 10;
    }

    // Confidence factors from similarity analysis
    if (similarity.confidence_factors) {
        similarity.confidence_factors.forEach(factor => {
            switch (factor.factor) {
                case 'same_name':
                    confidence += 15;
                    break;
                case 'signature_match':
                    confidence += 10;
                    break;
                case 'content_available':
                    confidence += factor.confidence * 0.1;
                    break;
                case 'content_unavailable':
                    confidence -= 15;
                    break;
                case 'calls_unavailable':
                    confidence -= 5;
                    break;
            }
        });
    }

    // Reduce confidence for cross-module comparisons of different health
    if (funcA.module !== funcB.module) {
        const healthDifference = Math.abs(funcA.module_health_score - funcB.module_health_score);
        if (healthDifference > 200) {
            confidence -= 10; // Different quality modules less likely to have real similarities
        }
    }

    // Reduce confidence if both modules have ES3 issues
    if (!funcA.module_es3_compliant && !funcB.module_es3_compliant) {
        confidence -= 5; // Lower confidence when both modules have issues
    }

    return Math.max(0, Math.min(100, Math.round(confidence)));
};

/**
 * ENHANCED: Content similarity with better normalization
 * @param {Object} contentA - Function A content
 * @param {Object} contentB - Function B content
 * @returns {Number} Enhanced content similarity score (0-1)
 */
const calculateContentSimilarityEnhanced = (contentA, contentB) => {
    if (!contentA?.normalized || !contentB?.normalized) {
        // Fallback to raw content if normalized not available
        const rawA = contentA?.raw || '';
        const rawB = contentB?.raw || '';
        return calculateBasicContentSimilarity(rawA, rawB);
    }

    const normalizedA = contentA.normalized;
    const normalizedB = contentB.normalized;

    if (normalizedA === normalizedB) return 1.0;
    if (!normalizedA || !normalizedB) return 0;

    // ENHANCED: Multi-strategy similarity calculation
    
    // Strategy 1: Token-based Jaccard similarity
    const tokensA = new Set(normalizedA.split(/\W+/).filter(t => t.length > 2));
    const tokensB = new Set(normalizedB.split(/\W+/).filter(t => t.length > 2));
    
    const intersection = new Set([...tokensA].filter(x => tokensB.has(x)));
    const union = new Set([...tokensA, ...tokensB]);
    
    const jaccardSimilarity = union.size === 0 ? 0 : intersection.size / union.size;

    // Strategy 2: Structure-based similarity (brackets, keywords)
    const structureA = extractStructuralFeatures(normalizedA);
    const structureB = extractStructuralFeatures(normalizedB);
    const structureSimilarity = calculateStructuralSimilarity(structureA, structureB);

    // Strategy 3: Length-based similarity
    const lengthSimilarity = calculateLengthSimilarity(normalizedA.length, normalizedB.length);

    // Weighted combination
    return (jaccardSimilarity * 0.6) + (structureSimilarity * 0.3) + (lengthSimilarity * 0.1);
};

/**
 * Calculate basic content similarity for raw content
 * @param {String} rawA - Raw content A
 * @param {String} rawB - Raw content B
 * @returns {Number} Basic similarity score (0-1)
 */
const calculateBasicContentSimilarity = (rawA, rawB) => {
    if (rawA === rawB) return 1.0;
    if (!rawA || !rawB) return 0;

    // Simple word-based comparison
    const wordsA = rawA.split(/\s+/).filter(w => w.length > 2);
    const wordsB = rawB.split(/\s+/).filter(w => w.length > 2);

    const setA = new Set(wordsA);
    const setB = new Set(wordsB);

    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);

    return union.size === 0 ? 0 : intersection.size / union.size;
};

/**
 * Extract structural features from normalized content
 * @param {String} content - Normalized content
 * @returns {Object} Structural features
 */
const extractStructuralFeatures = (content) => {
    return {
        braceCount: (content.match(/{/g) || []).length,
        parenCount: (content.match(/\(/g) || []).length,
        ifCount: (content.match(/\bif\b/g) || []).length,
        forCount: (content.match(/\bfor\b/g) || []).length,
        returnCount: (content.match(/\breturn\b/g) || []).length,
        tryCount: (content.match(/\btry\b/g) || []).length
    };
};

/**
 * Calculate structural similarity
 * @param {Object} structA - Structure A
 * @param {Object} structB - Structure B
 * @returns {Number} Structural similarity (0-1)
 */
const calculateStructuralSimilarity = (structA, structB) => {
    const features = Object.keys(structA);
    let totalSimilarity = 0;

    features.forEach(feature => {
        const a = structA[feature];
        const b = structB[feature];
        const maxVal = Math.max(a, b);
        const similarity = maxVal === 0 ? 1 : 1 - (Math.abs(a - b) / maxVal);
        totalSimilarity += similarity;
    });

    return totalSimilarity / features.length;
};

/**
 * Calculate length-based similarity
 * @param {Number} lengthA - Length A
 * @param {Number} lengthB - Length B
 * @returns {Number} Length similarity (0-1)
 */
const calculateLengthSimilarity = (lengthA, lengthB) => {
    if (lengthA === 0 && lengthB === 0) return 1;
    const maxLength = Math.max(lengthA, lengthB);
    return 1 - (Math.abs(lengthA - lengthB) / maxLength);
};

/**
 * ENHANCED: Calculate purpose similarity with confidence factors
 * @param {Object} funcA - First function with confidence data
 * @param {Object} funcB - Second function with confidence data
 * @returns {Number} Enhanced purpose similarity score (0-1)
 */
const calculatePurposeSimilarityEnhanced = (funcA, funcB) => {
    let similarity = 0;
    let factors = 0;

    // Name similarity (enhanced)
    const nameA = funcA.name.toLowerCase();
    const nameB = funcB.name.toLowerCase();

    factors++;
    if (nameA === nameB) {
        similarity += 1.0;
    } else {
        // Enhanced name pattern analysis
        const nameSimilarity = calculateNameSimilarity(nameA, nameB);
        similarity += nameSimilarity;
    }

    // Error handling similarity
    factors++;
    if (funcA.hasErrorHandling === funcB.hasErrorHandling) {
        similarity += funcA.hasErrorHandling ? 1.0 : 0.8; // Bonus for both having error handling
    }

    // Logging similarity
    factors++;
    if (funcA.hasLogging === funcB.hasLogging) {
        similarity += funcA.hasLogging ? 1.0 : 0.8; // Bonus for both having logging
    }

    // ENHANCED: Parameter count similarity
    factors++;
    if (funcA.parameterCount === funcB.parameterCount) {
        similarity += 1.0;
    } else {
        const paramDiff = Math.abs(funcA.parameterCount - funcB.parameterCount);
        const maxParams = Math.max(funcA.parameterCount, funcB.parameterCount);
        similarity += maxParams === 0 ? 1.0 : Math.max(0, 1 - (paramDiff / maxParams));
    }

    // ENHANCED: Module context similarity
    factors++;
    if (funcA.module === funcB.module) {
        similarity += 0.5; // Same module reduces confidence but adds context
    } else {
        // Cross-module similarity based on module health
        const healthSimilarity = 1 - (Math.abs(funcA.module_health_score - funcB.module_health_score) / 1000);
        similarity += Math.max(0, healthSimilarity);
    }

    return factors > 0 ? similarity / factors : 0;
};

/**
 * Calculate name similarity with pattern matching
 * @param {String} nameA - First name
 * @param {String} nameB - Second name
 * @returns {Number} Name similarity (0-1)
 */
const calculateNameSimilarity = (nameA, nameB) => {
    // Common prefixes and suffixes
    const commonPrefixes = ['get', 'set', 'is', 'has', 'can', 'create', 'build', 'make', 'process', 'parse', 'format', 'validate', 'check'];
    const commonSuffixes = ['er', 'or', 'ing', 'ed', 'able', 'data', 'info', 'result'];

    let similarity = 0;

    // Check for shared prefixes
    for (const prefix of commonPrefixes) {
        if (nameA.startsWith(prefix) && nameB.startsWith(prefix)) {
            similarity += 0.4;
            // Check similarity of remaining parts
            const remainA = nameA.substring(prefix.length);
            const remainB = nameB.substring(prefix.length);
            if (remainA === remainB) {
                similarity += 0.5;
            } else if (remainA.includes(remainB) || remainB.includes(remainA)) {
                similarity += 0.3;
            }
            break;
        }
    }

    // Check for shared suffixes
    for (const suffix of commonSuffixes) {
        if (nameA.endsWith(suffix) && nameB.endsWith(suffix)) {
            similarity += 0.2;
            break;
        }
    }

    // Check for substring matches
    if (nameA.includes(nameB) || nameB.includes(nameA)) {
        similarity += 0.3;
    }

    // Edit distance for remaining similarity
    if (similarity < 0.8) {
        const editDistance = calculateEditDistance(nameA, nameB);
        const maxLength = Math.max(nameA.length, nameB.length);
        const editSimilarity = maxLength === 0 ? 1 : 1 - (editDistance / maxLength);
        similarity = Math.max(similarity, editSimilarity);
    }

    return Math.min(1, similarity);
};

/**
 * Calculate edit distance between two strings
 * @param {String} str1 - First string
 * @param {String} str2 - Second string
 * @returns {Number} Edit distance
 */
const calculateEditDistance = (str1, str2) => {
    const matrix = [];

    // Create matrix
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }

    return matrix[str2.length][str1.length];
};

/**
 * ENHANCED: Generate confidence-aware similarity recommendation
 * @param {Number} percentage - Similarity percentage
 * @param {String} nameA - Function A name
 * @param {String} nameB - Function B name
 * @param {Boolean} sameModule - Whether functions are in same module
 * @param {Number} confidence - Detection confidence
 * @returns {String} Confidence-aware recommendation
 */
const generateConfidenceAwareSimilarityRecommendation = (percentage, nameA, nameB, sameModule, confidence) => {
    const location = sameModule ? 'within same module' : 'across modules';
    const confidencePrefix = confidence >= 85 ? 'HIGH CONFIDENCE' : 'LOW CONFIDENCE';

    if (percentage >= 98) {
        return `${confidencePrefix}: CONSOLIDATE - Functions '${nameA}' and '${nameB}' appear to be exact duplicates ${location}`;
    }
    if (percentage >= 90) {
        return `${confidencePrefix}: REVIEW - Functions '${nameA}' and '${nameB}' are very similar ${location} - consider consolidation`;
    }
    if (percentage >= 75) {
        if (confidence >= 85) {
            return `HIGH CONFIDENCE: INVESTIGATE - Functions '${nameA}' and '${nameB}' have similar implementation ${location} - verify if intentional`;
        } else {
            return `LOW CONFIDENCE: MONITOR - Functions may have overlapping functionality ${location} - manual review recommended`;
        }
    }

    return `${confidencePrefix}: MONITOR - Functions may have overlapping functionality ${location}`;
};

/**
 * ENHANCED: Analyze version similarity with confidence (placeholder for version context)
 * @param {Array} allFunctions - All functions to compare
 * @param {Array} moduleAnalyses - Module analyses for context
 * @param {Number} threshold - Similarity threshold
 * @param {Number} confidenceThreshold - Confidence threshold
 * @param {Object} analysis - Analysis object to update
 * @returns {Array} Array of version similarities
 */
const analyzeVersionSimilarityWithConfidence = (allFunctions, moduleAnalyses, threshold, confidenceThreshold, analysis) => {
    console.log(chalk.gray(`   Performing confidence-weighted version evolution similarity analysis...`));

    const similarities = [];

    // Group functions by name across versions
    const functionsByName = {};

    allFunctions.forEach(func => {
        if (!functionsByName[func.name]) {
            functionsByName[func.name] = [];
        }
        functionsByName[func.name].push(func);
    });

    // Analyze evolution of each function across versions
    Object.keys(functionsByName).forEach(funcName => {
        const versions = functionsByName[funcName];

        if (versions.length > 1) {
            // Compare consecutive versions of the same function
            for (let i = 1; i < versions.length; i++) {
                const prevVersion = versions[i - 1];
                const currVersion = versions[i];

                const similarity = calculateFunctionSimilarityWithConfidence(prevVersion, currVersion);
                const detectionConfidence = calculateSimilarityDetectionConfidence(prevVersion, currVersion, similarity);

                similarities.push({
                    function_name: funcName,
                    evolution_analysis: {
                        from_version: prevVersion.module,
                        to_version: currVersion.module,
                        similarity_percentage: similarity.percentage,
                        change_type: determineChangeTypeWithConfidence(similarity.percentage, detectionConfidence),
                        signature_changed: prevVersion.signature !== currVersion.signature,
                        parameter_count_changed: prevVersion.parameterCount !== currVersion.parameterCount,
                        comparison_details: similarity.details
                    },
                    confidence_score: detectionConfidence,
                    confidence_category: detectionConfidence >= confidenceThreshold ? 'high' : 'low',
                    recommendation: generateEvolutionRecommendationWithConfidence(funcName, similarity.percentage, detectionConfidence, prevVersion, currVersion)
                });
            }
        }
    });

    analysis.comparisons_performed = similarities.length;

    // Sort by confidence and then by significance of change
    return similarities.sort((a, b) => {
        // Primary: confidence
        if (a.confidence_score !== b.confidence_score) {
            return b.confidence_score - a.confidence_score;
        }
        // Secondary: significance (lower similarity = more significant change)
        return a.evolution_analysis.similarity_percentage - b.evolution_analysis.similarity_percentage;
    });
};

/**
 * Determine change type with confidence consideration
 * @param {Number} similarity - Similarity percentage
 * @param {Number} confidence - Detection confidence
 * @returns {String} Change type with confidence modifier
 */
const determineChangeTypeWithConfidence = (similarity, confidence) => {
    let changeType;
    
    if (similarity >= 95) changeType = 'minor_change';
    else if (similarity >= 80) changeType = 'moderate_change';
    else if (similarity >= 60) changeType = 'major_change';
    else changeType = 'complete_rewrite';

    if (confidence < 85) {
        changeType += '_uncertain';
    }

    return changeType;
};

/**
 * Generate evolution recommendation with confidence
 * @param {String} funcName - Function name
 * @param {Number} similarity - Similarity percentage
 * @param {Number} confidence - Detection confidence
 * @param {Object} prevVersion - Previous version function
 * @param {Object} currVersion - Current version function
 * @returns {String} Evolution recommendation with confidence
 */
const generateEvolutionRecommendationWithConfidence = (funcName, similarity, confidence, prevVersion, currVersion) => {
    const confidencePrefix = confidence >= 85 ? 'HIGH CONFIDENCE' : 'LOW CONFIDENCE';

    if (similarity >= 95) {
        return `${confidencePrefix}: Function '${funcName}' had minor changes between versions - evolution is stable`;
    }
    if (similarity >= 80) {
        return `${confidencePrefix}: Function '${funcName}' had moderate changes - review for intended improvements`;
    }
    if (similarity >= 60) {
        return `${confidencePrefix}: Function '${funcName}' had major changes - verify functionality is maintained`;
    }

    if (confidence >= 85) {
        return `HIGH CONFIDENCE: Function '${funcName}' was significantly rewritten - thorough testing recommended`;
    } else {
        return `LOW CONFIDENCE: Function '${funcName}' appears significantly changed - manual review recommended for accuracy`;
    }
};

// Helper functions (unchanged but improved)
const calculateCallsSimilarity = (callsA, callsB) => {
    if (!callsA || !callsB) return 0;
    if (callsA.length === 0 && callsB.length === 0) return 1.0;

    const setA = new Set(callsA);
    const setB = new Set(callsB);

    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);

    return union.size === 0 ? 0 : intersection.size / union.size;
};

const calculateSignatureSimilarity = (funcA, funcB) => {
    // Parameter count similarity
    if (funcA.parameterCount === funcB.parameterCount) {
        if (funcA.parameterCount === 0) return 1.0;

        // Compare parameter names if available
        if (funcA.parameters && funcB.parameters) {
            let matchingParams = 0;
            const minParams = Math.min(funcA.parameters.length, funcB.parameters.length);

            for (let i = 0; i < minParams; i++) {
                const paramA = normalizeParameterName(funcA.parameters[i]);
                const paramB = normalizeParameterName(funcB.parameters[i]);

                if (paramA === paramB) {
                    matchingParams++;
                }
            }

            return matchingParams / Math.max(funcA.parameters.length, funcB.parameters.length);
        }

        return 1.0; // Same count, no parameter names to compare
    }

    // Different parameter counts - partial credit
    const diff = Math.abs(funcA.parameterCount - funcB.parameterCount);
    const maxParams = Math.max(funcA.parameterCount, funcB.parameterCount);

    return maxParams === 0 ? 0 : Math.max(0, (maxParams - diff) / maxParams);
};

const normalizeParameterName = (param) => {
    if (typeof param !== 'string') return '';
    return param.toLowerCase().replace(/[^a-z]/g, '');
};

const determineSimilarityType = (percentage) => {
    const thresholds = SIMILARITY_RULES.thresholds;

    if (percentage >= thresholds.exact_match) return 'exact_duplicate';
    if (percentage >= thresholds.very_similar) return 'very_similar';
    if (percentage >= thresholds.similar) return 'similar';
    if (percentage >= thresholds.somewhat_similar) return 'somewhat_similar';

    return 'different';
};

const isInArray = (array, item) => {
    return Array.isArray(array) && array.includes(item);
};

const findFunctionSignature = (functions, funcName) => {
    if (functions.function_signatures) {
        return functions.function_signatures.find(sig => sig.includes(`function ${funcName}`)) || null;
    }
    return null;
};

export default {
    analyzeFunctionSimilarity
};