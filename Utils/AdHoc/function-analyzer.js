// ============================================================================
// DOCDOM FUNCTION ANALYZER
// Analyzes functions for duplicates and similarities across modules
// ============================================================================

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

export class FunctionAnalyzer {
    constructor(options = {}) {
        this.options = options;
        this.verbose = options.verbose || false;
        this.similarityThreshold = options.similarityThreshold || 0.85;
        this.excludePatterns = [
            'registerModule',
            'logDebug',
            'logInfo', 
            'logWarn',
            'logError',
            'debugLog',
            'updateStatus'
        ];
    }

    /**
     * Analyze all modules for duplicate functions
     */
    async analyzeDuplicates(moduleFiles) {
        console.log(chalk.blue('🔍 Analyzing functions for duplicates across modules...'));

        const analysis = {
            totalModules: moduleFiles.length,
            totalFunctions: 0,
            duplicateGroups: [],
            duplicatesFound: 0,
            consolidationOpportunities: [],
            analysisTime: Date.now()
        };

        // Extract all functions from all modules
        const allFunctions = await this.extractAllFunctions(moduleFiles);
        analysis.totalFunctions = allFunctions.length;

        if (this.verbose) {
            console.log(chalk.gray(`   📊 Extracted ${analysis.totalFunctions} functions from ${analysis.totalModules} modules`));
        }

        // Group functions by similarity
        const similarityGroups = this.groupBySimilarity(allFunctions);

        // Process similarity groups to find actual duplicates
        for (const group of similarityGroups) {
            if (group.functions.length > 1) {
                const duplicateGroup = this.analyzeSimilarityGroup(group);
                if (duplicateGroup.isDuplicate) {
                    analysis.duplicateGroups.push(duplicateGroup);
                    analysis.duplicatesFound++;
                }
            }
        }

        // Identify consolidation opportunities
        analysis.consolidationOpportunities = this.identifyConsolidationOpportunities(analysis.duplicateGroups);

        analysis.analysisTime = Date.now() - analysis.analysisTime;

        if (this.verbose) {
            this.reportDuplicateAnalysis(analysis);
        }

        return analysis;
    }

    /**
     * Extract all functions from module files
     */
    async extractAllFunctions(moduleFiles) {
        const allFunctions = [];

        for (const moduleFile of moduleFiles) {
            try {
                const content = fs.readFileSync(moduleFile.fullPath, 'utf8');
                const functions = this.extractFunctionsFromContent(content, moduleFile);
                allFunctions.push(...functions);
            } catch (error) {
                if (this.verbose) {
                    console.log(chalk.yellow(`   ⚠️  Error reading ${moduleFile.filename}: ${error.message}`));
                }
            }
        }

        return allFunctions;
    }

    /**
     * Extract functions from file content
     */
    extractFunctionsFromContent(content, moduleFile) {
        const functions = [];
        const functionPattern = /(?:\/\*\*[\s\S]*?\*\/\s*)?(?:export\s+)?(?:const\s+|function\s+)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[=:]?\s*(?:function\s*)?\([^)]*\)\s*[=>]?\s*{[\s\S]*?^}/gm;

        let match;
        while ((match = functionPattern.exec(content)) !== null) {
            const functionName = match[1];
            
            // Skip excluded functions
            if (this.shouldExcludeFunction(functionName)) {
                continue;
            }

            const functionInfo = {
                name: functionName,
                content: match[0],
                normalizedContent: this.normalizeFunctionContent(match[0]),
                sourceFile: moduleFile.filename,
                sourceModule: moduleFile,
                startPosition: match.index,
                signature: this.extractFunctionSignature(match[0]),
                parameters: this.extractParameters(match[0]),
                estimatedLines: match[0].split('\n').length,
                hasJSDoc: match[0].includes('/**'),
                hasErrorHandling: match[0].includes('try {') && match[0].includes('catch ('),
                hasLogging: this.hasLoggingCalls(match[0])
            };

            functions.push(functionInfo);
        }

        return functions;
    }

    /**
     * Group functions by similarity
     */
    groupBySimilarity(allFunctions) {
        const groups = [];
        const processed = new Set();

        for (let i = 0; i < allFunctions.length; i++) {
            if (processed.has(i)) continue;

            const baseFunction = allFunctions[i];
            const similarGroup = {
                baseName: baseFunction.name,
                functions: [baseFunction],
                similarityScores: []
            };

            // Find similar functions
            for (let j = i + 1; j < allFunctions.length; j++) {
                if (processed.has(j)) continue;

                const compareFunction = allFunctions[j];
                const similarity = this.calculateSimilarity(baseFunction, compareFunction);

                if (similarity >= this.similarityThreshold) {
                    similarGroup.functions.push(compareFunction);
                    similarGroup.similarityScores.push(similarity);
                    processed.add(j);
                }
            }

            groups.push(similarGroup);
            processed.add(i);
        }

        return groups.filter(group => group.functions.length > 1);
    }

    /**
     * Calculate similarity between two functions
     */
    calculateSimilarity(func1, func2) {
        // If same name in different modules, high similarity
        if (func1.name === func2.name && func1.sourceFile !== func2.sourceFile) {
            return 0.95;
        }

        // Content-based similarity
        const contentSimilarity = this.calculateContentSimilarity(
            func1.normalizedContent, 
            func2.normalizedContent
        );

        // Signature similarity
        const signatureSimilarity = this.calculateSignatureSimilarity(
            func1.signature, 
            func2.signature
        );

        // Weighted average
        return (contentSimilarity * 0.7) + (signatureSimilarity * 0.3);
    }

    /**
     * Calculate content similarity using Levenshtein distance
     */
    calculateContentSimilarity(content1, content2) {
        const len1 = content1.length;
        const len2 = content2.length;
        
        if (len1 === 0) return len2 === 0 ? 1 : 0;
        if (len2 === 0) return 0;

        const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(null));

        for (let i = 0; i <= len1; i++) matrix[0][i] = i;
        for (let j = 0; j <= len2; j++) matrix[j][0] = j;

        for (let j = 1; j <= len2; j++) {
            for (let i = 1; i <= len1; i++) {
                const substitutionCost = content1[i - 1] === content2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1,     // deletion
                    matrix[j - 1][i] + 1,     // insertion
                    matrix[j - 1][i - 1] + substitutionCost // substitution
                );
            }
        }

        const distance = matrix[len2][len1];
        const maxLen = Math.max(len1, len2);
        return 1 - (distance / maxLen);
    }

    /**
     * Calculate signature similarity
     */
    calculateSignatureSimilarity(sig1, sig2) {
        // Simple signature comparison
        if (sig1 === sig2) return 1;
        
        // Compare parameter counts
        const params1 = (sig1.match(/,/g) || []).length + (sig1.includes('(') ? 1 : 0);
        const params2 = (sig2.match(/,/g) || []).length + (sig2.includes('(') ? 1 : 0);
        
        if (params1 === 0 && params2 === 0) return 1;
        if (params1 === params2) return 0.8;
        
        return Math.max(0, 1 - Math.abs(params1 - params2) * 0.2);
    }

    /**
     * Analyze a similarity group to determine if it represents duplicates
     */
    analyzeSimilarityGroup(group) {
        const analysis = {
            groupName: group.baseName,
            functions: group.functions,
            isDuplicate: false,
            duplicateType: 'none',
            canonicalVersion: null,
            consolidationRecommendation: null,
            averageSimilarity: 0
        };

        // Calculate average similarity
        if (group.similarityScores.length > 0) {
            analysis.averageSimilarity = group.similarityScores.reduce((a, b) => a + b, 0) / group.similarityScores.length;
        }

        // Determine if this is a duplicate
        if (analysis.averageSimilarity >= this.similarityThreshold) {
            analysis.isDuplicate = true;

            // Determine duplicate type
            const sameNames = group.functions.every(f => f.name === group.functions[0].name);
            if (sameNames) {
                analysis.duplicateType = 'exact_name';
            } else {
                analysis.duplicateType = 'similar_content';
            }

            // Choose canonical version (longest/most complete)
            analysis.canonicalVersion = this.chooseCanonicalVersion(group.functions);
            
            // Generate consolidation recommendation
            analysis.consolidationRecommendation = this.generateConsolidationRecommendation(analysis);
        }

        return analysis;
    }

    /**
     * Choose the best version of a function to keep
     */
    chooseCanonicalVersion(functions) {
        // Scoring criteria:
        // - Longest content (more complete)
        // - Has JSDoc
        // - Has error handling
        // - Has logging
        // - More recent module (higher version number)

        let bestFunction = functions[0];
        let bestScore = this.scoreFunctionQuality(bestFunction);

        for (let i = 1; i < functions.length; i++) {
            const score = this.scoreFunctionQuality(functions[i]);
            if (score > bestScore) {
                bestScore = score;
                bestFunction = functions[i];
            }
        }

        return bestFunction;
    }

    /**
     * Score function quality
     */
    scoreFunctionQuality(func) {
        let score = 0;
        
        // Length (more complete functions are better)
        score += func.estimatedLines * 0.1;
        
        // Documentation
        if (func.hasJSDoc) score += 10;
        
        // Error handling
        if (func.hasErrorHandling) score += 5;
        
        // Logging
        if (func.hasLogging) score += 3;
        
        // Module version (prefer newer modules)
        const versionMatch = func.sourceFile.match(/^(\d+(?:\.\d+)*)/);
        if (versionMatch) {
            const versionParts = versionMatch[1].split('.').map(Number);
            score += versionParts[0] * 1; // Major version
            score += (versionParts[1] || 0) * 0.1; // Minor version
        }

        return score;
    }

    /**
     * Generate consolidation recommendation
     */
    generateConsolidationRecommendation(analysis) {
        const recommendation = {
            action: 'consolidate',
            targetLocation: 'shared-utilities.js',
            keepFunction: analysis.canonicalVersion.name,
            removeFromFiles: [],
            reasoning: []
        };

        // Identify which files to modify
        analysis.functions.forEach(func => {
            if (func !== analysis.canonicalVersion) {
                recommendation.removeFromFiles.push(func.sourceFile);
            }
        });

        // Generate reasoning
        recommendation.reasoning.push(`Found ${analysis.functions.length} similar functions`);
        recommendation.reasoning.push(`Average similarity: ${(analysis.averageSimilarity * 100).toFixed(1)}%`);
        recommendation.reasoning.push(`Chosen canonical version from: ${analysis.canonicalVersion.sourceFile}`);

        return recommendation;
    }

    /**
     * Create consolidation plan
     */
    async createConsolidationPlan(duplicateAnalysis) {
        const plan = {
            targetFile: path.join(this.options.targetFolder || '../DocDomV4.1', 'shared-utilities.js'),
            functions: [],
            affectedFiles: new Set(),
            estimatedSavings: {
                linesRemoved: 0,
                filesSimplified: 0
            }
        };

        // Process each duplicate group
        for (const group of duplicateAnalysis.duplicateGroups) {
            if (group.isDuplicate && group.consolidationRecommendation) {
                plan.functions.push({
                    name: group.canonicalVersion.name,
                    canonicalVersion: group.canonicalVersion.content,
                    sourceFile: group.canonicalVersion.sourceFile,
                    duplicateCount: group.functions.length
                });

                // Track affected files
                group.functions.forEach(func => {
                    plan.affectedFiles.add(func.sourceFile);
                });

                // Calculate savings
                const duplicateLines = group.functions
                    .filter(f => f !== group.canonicalVersion)
                    .reduce((total, f) => total + f.estimatedLines, 0);
                
                plan.estimatedSavings.linesRemoved += duplicateLines;
            }
        }

        plan.affectedFiles = Array.from(plan.affectedFiles);
        plan.estimatedSavings.filesSimplified = plan.affectedFiles.length;

        return plan;
    }

    /**
     * Identify consolidation opportunities
     */
    identifyConsolidationOpportunities(duplicateGroups) {
        return duplicateGroups
            .filter(group => group.isDuplicate)
            .map(group => ({
                functionName: group.canonicalVersion.name,
                duplicateCount: group.functions.length,
                averageSimilarity: group.averageSimilarity,
                affectedModules: group.functions.map(f => f.sourceFile),
                estimatedSavings: group.functions.reduce((total, f) => total + f.estimatedLines, 0)
            }))
            .sort((a, b) => b.estimatedSavings - a.estimatedSavings);
    }

    /**
     * Report duplicate analysis results
     */
    reportDuplicateAnalysis(analysis) {
        console.log(chalk.cyan('\n📊 Duplicate Function Analysis Results:'));
        console.log(chalk.white(`   📁 Modules analyzed: ${analysis.totalModules}`));
        console.log(chalk.white(`   🔧 Functions extracted: ${analysis.totalFunctions}`));
        console.log(chalk.white(`   🔄 Duplicate groups found: ${analysis.duplicatesFound}`));
        console.log(chalk.white(`   ⏱️  Analysis time: ${analysis.analysisTime}ms`));

        if (analysis.consolidationOpportunities.length > 0) {
            console.log(chalk.yellow('\n💡 Top Consolidation Opportunities:'));
            analysis.consolidationOpportunities.slice(0, 5).forEach((opp, index) => {
                console.log(chalk.white(`   ${index + 1}. ${opp.functionName} (${opp.duplicateCount} copies, ${opp.estimatedSavings} lines saved)`));
            });
        }
    }

    /**
     * Helper methods
     */

    shouldExcludeFunction(functionName) {
        return this.excludePatterns.some(pattern => functionName.includes(pattern));
    }

    normalizeFunctionContent(content) {
        return content
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
            .replace(/\/\/.*$/gm, '')         // Remove line comments  
            .replace(/\s+/g, ' ')            // Normalize whitespace
            .replace(/var\s+\w+/g, 'var VAR') // Normalize variable names
            .replace(/'[^']*'/g, "'STRING'")  // Normalize string literals
            .replace(/"[^"]*"/g, '"STRING"')  // Normalize string literals
            .replace(/\b\d+\b/g, 'NUM')      // Normalize numbers
            .trim();
    }

    extractFunctionSignature(content) {
        const match = content.match(/(?:function\s+|const\s+\w+\s*=\s*(?:function\s*)?)([^{]*)/);
        return match ? match[1].trim() : '';
    }

    extractParameters(content) {
        const match = content.match(/\(([^)]*)\)/);
        if (!match || !match[1].trim()) return [];
        
        return match[1]
            .split(',')
            .map(param => param.trim())
            .filter(param => param);
    }

    hasLoggingCalls(content) {
        return /log(Debug|Info|Warn|Error)|debugLog|\$\.writeln/.test(content);
    }
}