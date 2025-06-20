// ============================================================================
// SIMILARITY DETECTOR
// Function similarity and duplication analysis with configurable whitelisting
// ============================================================================

import chalk from 'chalk';
import { isWhitelisted, getWhitelistReason } from '../config/whitelists.js';
import { SIMILARITY_RULES } from '../config/analysis-rules.js';

/**
 * Analyze function similarity across modules
 * @param {Array} moduleAnalyses - Array of module analyses
 * @param {Object} options - Analysis options
 * @returns {Object} Similarity analysis results
 */
export const analyzeFunctionSimilarity = async (moduleAnalyses, options = {}) => {
    const startTime = Date.now();
    const context = options.context || 'system'; // 'system' or 'version'
    const threshold = options.threshold || 75;

    console.log(chalk.cyan(`🔍 Analyzing function similarity (${context} context, ${threshold}% threshold)...`));

    try {
        const analysis = {
            context,
            threshold,
            total_functions_analyzed: 0,
            comparisons_performed: 0,

            // Results
            similarities: [],
            exact_duplicates: [],
            whitelisted_skips: [],

            // Statistics
            similarity_stats: {
                exact_matches: 0,
                very_similar: 0,    // >90%
                similar: 0,         // >75%
                somewhat_similar: 0 // >60%
            },

            // Performance metrics
            analysis_time_ms: 0
        };

        // Collect all functions from all modules
        const allFunctions = collectAllFunctions(moduleAnalyses);
        analysis.total_functions_analyzed = allFunctions.length;

        console.log(chalk.gray(`   Functions to analyze: ${allFunctions.length}`));

        // Perform similarity analysis
        if (context === 'version') {
            // Version comparison - different approach
            analysis.similarities = await analyzeVersionSimilarity(allFunctions, moduleAnalyses, threshold, analysis);
        } else {
            // System analysis - cross-module comparison
            analysis.similarities = await analyzeSystemSimilarity(allFunctions, threshold, analysis);
        }

        // Categorize results
        analysis.similarities.forEach(sim => {
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
        });

        analysis.analysis_time_ms = Date.now() - startTime;

        console.log(chalk.green(`✅ Similarity analysis complete (${analysis.analysis_time_ms}ms)`));
        console.log(chalk.cyan(`   Similarities found: ${analysis.similarities.length}`));
        console.log(chalk.cyan(`   Exact duplicates: ${analysis.exact_duplicates.length}`));
        console.log(chalk.gray(`   Whitelisted skips: ${analysis.whitelisted_skips.length}`));

        return analysis;

    } catch (error) {
        console.error(chalk.red(`❌ Similarity analysis failed: ${error.message}`));

        return {
            context,
            threshold,
            error: error.message,
            analysis_time_ms: Date.now() - startTime
        };
    }
};

/**
 * Collect all functions from module analyses
 * @param {Array} moduleAnalyses - Array of module analyses
 * @returns {Array} Array of function objects
 */
const collectAllFunctions = (moduleAnalyses) => {
    const allFunctions = [];

    moduleAnalyses.forEach(ma => {
        const moduleName = ma.analysis ? ma.analysis.module_info.filename : ma.filename;
        const functions = ma.analysis ? ma.analysis.function_inventory : null;

        if (!functions) return;

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
                    // Add function content if available from parser
                    content: ma.analysis.functions ? ma.analysis.functions.functionContent[funcName] : null
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
                        content: ma.analysis.functions ? ma.analysis.functions.functionContent[funcName] : null
                    });
                }
            });
        }
    });

    return allFunctions;
};

/**
 * Analyze similarity in system context (cross-module)
 * @param {Array} allFunctions - All functions to compare
 * @param {number} threshold - Similarity threshold
 * @param {Object} analysis - Analysis object to update
 * @returns {Array} Array of similarities
 */
const analyzeSystemSimilarity = async (allFunctions, threshold, analysis) => {
    const similarities = [];
    let comparisons = 0;

    console.log(chalk.gray(`   Performing cross-module similarity analysis...`));

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

            // Check whitelist
            if (isWhitelisted(funcA.name, 'system') || isWhitelisted(funcB.name, 'system')) {
                const reason = getWhitelistReason(funcA.name) || getWhitelistReason(funcB.name);
                analysis.whitelisted_skips.push({
                    function_a: funcA.name,
                    function_b: funcB.name,
                    reason: reason
                });
                continue;
            }

            // Calculate similarity
            const similarity = calculateFunctionSimilarity(funcA, funcB);

            if (similarity.percentage >= threshold) {
                similarities.push({
                    function_a: {
                        name: funcA.name,
                        module: funcA.module,
                        signature: funcA.signature,
                        parameters: funcA.parameterCount
                    },
                    function_b: {
                        name: funcB.name,
                        module: funcB.module,
                        signature: funcB.signature,
                        parameters: funcB.parameterCount
                    },
                    similarity_percentage: similarity.percentage,
                    similarity_type: similarity.type,
                    same_module: funcA.module === funcB.module,
                    comparison_details: similarity.details,
                    recommendation: generateSimilarityRecommendation(
                        similarity.percentage,
                        funcA.name,
                        funcB.name,
                        funcA.module === funcB.module
                    )
                });
            }
        }

        // Progress reporting for large analyses
        if (i % 50 === 0 && i > 0) {
            const progress = Math.round((i / allFunctions.length) * 100);
            console.log(chalk.gray(`   Progress: ${progress}% (${comparisons} comparisons)`));
        }
    }

    analysis.comparisons_performed = comparisons;

    // Sort by similarity percentage (highest first)
    return similarities.sort((a, b) => b.similarity_percentage - a.similarity_percentage);
};

/**
 * Analyze similarity in version context (evolution tracking)
 * @param {Array} allFunctions - All functions to compare
 * @param {Array} moduleAnalyses - Module analyses for context
 * @param {number} threshold - Similarity threshold
 * @param {Object} analysis - Analysis object to update
 * @returns {Array} Array of similarities (different format for version context)
 */
const analyzeVersionSimilarity = async (allFunctions, moduleAnalyses, threshold, analysis) => {
    const similarities = [];

    console.log(chalk.gray(`   Performing version evolution similarity analysis...`));

    // In version context, we're looking for evolution of same functions
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

                const similarity = calculateFunctionSimilarity(prevVersion, currVersion);

                similarities.push({
                    function_name: funcName,
                    evolution_analysis: {
                        from_version: prevVersion.module,
                        to_version: currVersion.module,
                        similarity_percentage: similarity.percentage,
                        change_type: determineChangeType(similarity.percentage),
                        signature_changed: prevVersion.signature !== currVersion.signature,
                        parameter_count_changed: prevVersion.parameterCount !== currVersion.parameterCount,
                        comparison_details: similarity.details
                    },
                    recommendation: generateEvolutionRecommendation(funcName, similarity.percentage, prevVersion, currVersion)
                });
            }
        }
    });

    analysis.comparisons_performed = similarities.length;

    // Sort by change significance (lowest similarity first - biggest changes)
    return similarities.sort((a, b) =>
        a.evolution_analysis.similarity_percentage - b.evolution_analysis.similarity_percentage
    );
};

/**
 * Calculate similarity between two functions
 * @param {Object} funcA - First function
 * @param {Object} funcB - Second function
 * @returns {Object} Similarity analysis
 */
const calculateFunctionSimilarity = (funcA, funcB) => {
    const weights = SIMILARITY_RULES.scoring_weights;
    let totalScore = 0;
    let maxScore = 0;

    const details = {};

    // 1. Signature similarity (25%)
    maxScore += weights.signature_similarity;
    const sigSimilarity = calculateSignatureSimilarity(funcA, funcB);
    totalScore += sigSimilarity * weights.signature_similarity;
    details.signature_similarity = Math.round(sigSimilarity * 100);

    // 2. Content similarity (40%) - if available
    maxScore += weights.content_similarity;
    let contentSimilarity = 0;
    if (funcA.content && funcB.content) {
        contentSimilarity = calculateContentSimilarity(funcA.content, funcB.content);
    } else {
        // Fallback to signature-based estimation
        contentSimilarity = sigSimilarity * 0.8; // Penalty for missing content
    }
    totalScore += contentSimilarity * weights.content_similarity;
    details.content_similarity = Math.round(contentSimilarity * 100);

    // 3. Call pattern similarity (20%) - if available
    maxScore += weights.calls_similarity;
    let callsSimilarity = 0;
    if (funcA.content && funcB.content && funcA.content.calls && funcB.content.calls) {
        callsSimilarity = calculateCallsSimilarity(funcA.content.calls, funcB.content.calls);
    }
    totalScore += callsSimilarity * weights.calls_similarity;
    details.calls_similarity = Math.round(callsSimilarity * 100);

    // 4. Purpose similarity (15%) - based on name and characteristics
    maxScore += weights.purpose_similarity;
    const purposeSimilarity = calculatePurposeSimilarity(funcA, funcB);
    totalScore += purposeSimilarity * weights.purpose_similarity;
    details.purpose_similarity = Math.round(purposeSimilarity * 100);

    const percentage = Math.round((totalScore / maxScore) * 100);

    return {
        percentage,
        type: determineSimilarityType(percentage),
        details
    };
};

/**
 * Calculate signature similarity between two functions
 * @param {Object} funcA - First function
 * @param {Object} funcB - Second function
 * @returns {number} Similarity score (0-1)
 */
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

/**
 * Calculate content similarity between function contents
 * @param {Object} contentA - Function A content
 * @param {Object} contentB - Function B content
 * @returns {number} Similarity score (0-1)
 */
const calculateContentSimilarity = (contentA, contentB) => {
    if (!contentA || !contentB) return 0;

    const normalizedA = contentA.normalized || contentA.raw || '';
    const normalizedB = contentB.normalized || contentB.raw || '';

    if (normalizedA === normalizedB) return 1.0;
    if (!normalizedA || !normalizedB) return 0;

    // Use Jaccard similarity on tokens
    const tokensA = new Set(normalizedA.split(/\W+/).filter(t => t.length > 2));
    const tokensB = new Set(normalizedB.split(/\W+/).filter(t => t.length > 2));

    const intersection = new Set([...tokensA].filter(x => tokensB.has(x)));
    const union = new Set([...tokensA, ...tokensB]);

    return union.size === 0 ? 0 : intersection.size / union.size;
};

/**
 * Calculate calls similarity between function call arrays
 * @param {Array} callsA - Function A calls
 * @param {Array} callsB - Function B calls
 * @returns {number} Similarity score (0-1)
 */
const calculateCallsSimilarity = (callsA, callsB) => {
    if (!callsA || !callsB) return 0;
    if (callsA.length === 0 && callsB.length === 0) return 1.0;

    const setA = new Set(callsA);
    const setB = new Set(callsB);

    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);

    return union.size === 0 ? 0 : intersection.size / union.size;
};

/**
 * Calculate purpose similarity based on function characteristics
 * @param {Object} funcA - First function
 * @param {Object} funcB - Second function
 * @returns {number} Similarity score (0-1)
 */
const calculatePurposeSimilarity = (funcA, funcB) => {
    let similarity = 0;
    let factors = 0;

    // Name similarity (basic)
    const nameA = funcA.name.toLowerCase();
    const nameB = funcB.name.toLowerCase();

    // Check for common prefixes/suffixes
    const commonPrefixes = ['get', 'set', 'is', 'has', 'can', 'create', 'build', 'make', 'process', 'parse', 'format'];
    const commonSuffixes = ['er', 'or', 'ing', 'ed', 'able'];

    factors++;
    if (nameA === nameB) {
        similarity += 1.0;
    } else {
        // Check for similar patterns
        let nameScore = 0;

        for (const prefix of commonPrefixes) {
            if (nameA.startsWith(prefix) && nameB.startsWith(prefix)) {
                nameScore += 0.5;
                break;
            }
        }

        for (const suffix of commonSuffixes) {
            if (nameA.endsWith(suffix) && nameB.endsWith(suffix)) {
                nameScore += 0.3;
                break;
            }
        }

        similarity += Math.min(1.0, nameScore);
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

    return factors > 0 ? similarity / factors : 0;
};

/**
 * Normalize parameter name for comparison
 * @param {string} param - Parameter name
 * @returns {string} Normalized parameter name
 */
const normalizeParameterName = (param) => {
    if (typeof param !== 'string') return '';
    return param.toLowerCase().replace(/[^a-z]/g, '');
};

/**
 * Determine similarity type based on percentage
 * @param {number} percentage - Similarity percentage
 * @returns {string} Similarity type
 */
const determineSimilarityType = (percentage) => {
    const thresholds = SIMILARITY_RULES.thresholds;

    if (percentage >= thresholds.exact_match) return 'exact_duplicate';
    if (percentage >= thresholds.very_similar) return 'very_similar';
    if (percentage >= thresholds.similar) return 'similar';
    if (percentage >= thresholds.somewhat_similar) return 'somewhat_similar';

    return 'different';
};

/**
 * Generate similarity recommendation
 * @param {number} percentage - Similarity percentage
 * @param {string} nameA - Function A name
 * @param {string} nameB - Function B name
 * @param {boolean} sameModule - Whether functions are in same module
 * @returns {string} Recommendation
 */
const generateSimilarityRecommendation = (percentage, nameA, nameB, sameModule) => {
    const location = sameModule ? 'within same module' : 'across modules';

    if (percentage >= 98) {
        return `CONSOLIDATE: Functions '${nameA}' and '${nameB}' appear to be exact duplicates ${location}`;
    }
    if (percentage >= 90) {
        return `REVIEW: Functions '${nameA}' and '${nameB}' are very similar ${location} - consider consolidation`;
    }
    if (percentage >= 75) {
        return `INVESTIGATE: Functions '${nameA}' and '${nameB}' have similar implementation ${location} - verify if intentional`;
    }

    return `MONITOR: Functions may have overlapping functionality ${location}`;
};

/**
 * Determine change type for version evolution
 * @param {number} similarity - Similarity percentage
 * @returns {string} Change type
 */
const determineChangeType = (similarity) => {
    if (similarity >= 95) return 'minor_change';
    if (similarity >= 80) return 'moderate_change';
    if (similarity >= 60) return 'major_change';
    return 'complete_rewrite';
};

/**
 * Generate evolution recommendation
 * @param {string} funcName - Function name
 * @param {number} similarity - Similarity percentage
 * @param {Object} prevVersion - Previous version function
 * @param {Object} currVersion - Current version function
 * @returns {string} Evolution recommendation
 */
const generateEvolutionRecommendation = (funcName, similarity, prevVersion, currVersion) => {
    if (similarity >= 95) {
        return `Function '${funcName}' had minor changes between versions - evolution is stable`;
    }
    if (similarity >= 80) {
        return `Function '${funcName}' had moderate changes - review for intended improvements`;
    }
    if (similarity >= 60) {
        return `Function '${funcName}' had major changes - verify functionality is maintained`;
    }

    return `Function '${funcName}' was significantly rewritten - thorough testing recommended`;
};

/**
 * Helper function to check if item is in array
 * @param {Array} array - Array to check
 * @param {string} item - Item to find
 * @returns {boolean} True if item is in array
 */
const isInArray = (array, item) => {
    return Array.isArray(array) && array.includes(item);
};

/**
 * Find function signature in function inventory
 * @param {Object} functions - Function inventory
 * @param {string} funcName - Function name
 * @returns {string|null} Function signature
 */
const findFunctionSignature = (functions, funcName) => {
    if (functions.function_signatures) {
        return functions.function_signatures.find(sig => sig.includes(`function ${funcName}`)) || null;
    }
    return null;
};

export default {
    analyzeFunctionSimilarity
};