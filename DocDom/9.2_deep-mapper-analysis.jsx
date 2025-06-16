//
// 9.2_deep-mapper-analysis.jsx
// InDesign DOM Discovery Builder - Deep Mapping Analysis and Reporting
// CORE PURPOSE: Post-process deep mapping results with analysis and reporting
// DEPENDENCIES: 1.0_safe-foundation.jsx, 9.1_deep-mapper-core.jsx
// SAFETY: Analysis and reporting only, no DOM access
// ES3 COMPATIBLE: No reserved words, no modern JS features
//

// ============================================================================
// ANALYSIS CONFIGURATION
// ============================================================================

var DEFAULT_ANALYSIS_CONFIG = {
    generateObjectReport: true,         // Generate comprehensive object report
    generateAccessReport: true,         // Generate access pattern analysis
    generateCircularReport: true,       // Analyze circular references
    analyzePerformance: true,           // Performance analysis
    includeDeveloperGuide: true,        // Generate developer access guide
    maxReportItems: 1000,              // Limit items in reports for readability
    groupSimilarObjects: true,          // Group objects with similar patterns
    prioritizeByUsability: true,        // Prioritize most useful access patterns
    includeCodeExamples: true           // Include ready-to-use code examples
};

// ============================================================================
// ANALYSIS RESULT STRUCTURES
// ============================================================================

/**
 * Create analysis result container
 * @param {Object} deepMappingSession - Deep mapping session to analyze
 * @returns {Object} - Analysis result structure
 */
function createAnalysisResult(deepMappingSession) {
    return {
        metadata: {
            timestamp: getCurrentTimestamp(),
            version: '9.2_deep-mapper-analysis',
            sourceSessionID: deepMappingSession ? deepMappingSession.metadata.sessionID : 'unknown',
            analysisTime: 0,
            documentName: deepMappingSession ? deepMappingSession.metadata.documentName : 'Unknown'
        },
        objectAnalysis: null,           // Comprehensive object analysis
        accessAnalysis: null,           // Access pattern analysis
        circularAnalysis: null,         // Circular reference analysis
        performanceAnalysis: null,      // Performance analysis
        developerGuide: null,           // Generated developer guide
        reports: {
            objectReport: '',
            accessReport: '',
            circularReport: '',
            performanceReport: '',
            executiveSummary: ''
        }
    };
}

// ============================================================================
// MAIN ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Perform comprehensive analysis of deep mapping session
 * @param {Object} deepMappingSession - Deep mapping session from 9.1 module
 * @param {Object} config - Analysis configuration
 * @returns {Object} - Complete analysis results
 */
function analyzeDeepMappingSession(deepMappingSession, config) {
    var startTime = new Date().getTime();
    
    // Merge configuration
    var analysisConfig = mergeAnalysisConfig(DEFAULT_ANALYSIS_CONFIG, config);
    
    // Create analysis result container
    var analysisResult = createAnalysisResult(deepMappingSession);
    
    $.writeln('');
    $.writeln('==========================================');
    $.writeln('DEEP MAPPING ANALYSIS STARTED');
    $.writeln('==========================================');
    $.writeln('Source Session: ' + (deepMappingSession ? deepMappingSession.metadata.sessionID : 'null'));
    $.writeln('');
    
    try {
        if (!deepMappingSession) {
            throw new Error('No deep mapping session provided for analysis');
        }
        
        // Object Analysis
        if (analysisConfig.generateObjectReport) {
            $.writeln('Analyzing objects and references...');
            analysisResult.objectAnalysis = analyzeObjects(deepMappingSession, analysisConfig);
            analysisResult.reports.objectReport = generateObjectReport(analysisResult.objectAnalysis, analysisConfig);
        }
        
        // Access Pattern Analysis
        if (analysisConfig.generateAccessReport) {
            $.writeln('Analyzing access patterns...');
            analysisResult.accessAnalysis = analyzeAccessPatterns(deepMappingSession, analysisConfig);
            analysisResult.reports.accessReport = generateAccessReport(analysisResult.accessAnalysis, analysisConfig);
        }
        
        // Circular Reference Analysis
        if (analysisConfig.generateCircularReport && deepMappingSession.circularMap) {
            $.writeln('Analyzing circular references...');
            analysisResult.circularAnalysis = analyzeCircularReferences(deepMappingSession, analysisConfig);
            analysisResult.reports.circularReport = generateCircularReport(analysisResult.circularAnalysis, analysisConfig);
        }
        
        // Performance Analysis
        if (analysisConfig.analyzePerformance) {
            $.writeln('Analyzing performance metrics...');
            analysisResult.performanceAnalysis = analyzePerformance(deepMappingSession, analysisConfig);
            analysisResult.reports.performanceReport = generatePerformanceReport(analysisResult.performanceAnalysis, analysisConfig);
        }
        
        // Developer Guide Generation
        if (analysisConfig.includeDeveloperGuide) {
            $.writeln('Generating developer guide...');
            analysisResult.developerGuide = generateDeveloperGuide(deepMappingSession, analysisResult, analysisConfig);
        }
        
        // Executive Summary
        $.writeln('Generating executive summary...');
        analysisResult.reports.executiveSummary = generateExecutiveSummary(deepMappingSession, analysisResult, analysisConfig);
        
        // Finalize analysis
        analysisResult.metadata.analysisTime = new Date().getTime() - startTime;
        
        $.writeln('DEEP MAPPING ANALYSIS COMPLETE:');
        $.writeln('  Analysis time: ' + analysisResult.metadata.analysisTime + 'ms');
        $.writeln('  Reports generated: ' + Object.keys(analysisResult.reports).length);
        $.writeln('==========================================');
        
    } catch (exc) {
        $.writeln('ERROR: Deep mapping analysis failed: ' + exc.message);
        analysisResult.metadata.error = exc.message;
    }
    
    return analysisResult;
}

// ============================================================================
// OBJECT ANALYSIS
// ============================================================================

/**
 * Analyze objects and their relationships
 * @param {Object} session - Deep mapping session
 * @param {Object} config - Analysis configuration
 * @returns {Object} - Object analysis results
 */
function analyzeObjects(session, config) {
    var analysis = {
        totalObjects: 0,
        uniqueObjects: 0,
        duplicateObjects: 0,
        objectsByType: {},
        objectsByDepth: {},
        accessPatterns: [],
        mostReferencedObjects: [],
        leastAccessibleObjects: [],
        recommendedObjects: []
    };
    
    try {
        if (!session.objectAtlas) {
            return analysis;
        }
        
        var atlasStats = session.objectAtlas.getStatistics();
        analysis.totalObjects = session.statistics.totalObjectsDiscovered;
        analysis.uniqueObjects = atlasStats.totalObjects;
        analysis.duplicateObjects = atlasStats.duplicateObjects;
        
        // Analyze objects by type
        var allTypes = ['object', 'string', 'number', 'boolean', 'function'];
        for (var i = 0; i < allTypes.length; i++) {
            var type = allTypes[i];
            var objectsOfType = session.objectAtlas.getObjectsByType(type);
            if (objectsOfType.length > 0) {
                analysis.objectsByType[type] = {
                    count: objectsOfType.length,
                    objects: objectsOfType.slice(0, config.maxReportItems)
                };
            }
        }
        
        // Generate access patterns
        analysis.accessPatterns = session.objectAtlas.generateAccessPatterns();
        
        // Find most referenced objects
        analysis.mostReferencedObjects = findMostReferencedObjects(session, config.maxReportItems);
        
        // Find least accessible objects
        analysis.leastAccessibleObjects = findLeastAccessibleObjects(session, config.maxReportItems);
        
        // Generate recommendations
        analysis.recommendedObjects = generateObjectRecommendations(session, config);
        
    } catch (exc) {
        analysis.error = 'Object analysis failed: ' + exc.message;
    }
    
    return analysis;
}

/**
 * Find most referenced objects for priority analysis
 * @param {Object} session - Deep mapping session
 * @param {Number} maxItems - Maximum items to return
 * @returns {Array} - Array of most referenced objects
 */
function findMostReferencedObjects(session, maxItems) {
    var referenced = [];
    
    try {
        if (!session.objectAtlas) return referenced;
        
        var atlasStats = session.objectAtlas.getStatistics();
        
        // Collect objects with multiple paths
        for (var i = 0; i < atlasStats.totalObjects; i++) {
            var paths = session.objectAtlas.getObjectPaths(i);
            var metadata = session.objectAtlas.getObjectMetadata(i);
            
            if (paths.length > 1) {
                referenced.push({
                    objectIndex: i,
                    pathCount: paths.length,
                    paths: paths,
                    metadata: metadata,
                    priority: calculateObjectPriority(paths, metadata)
                });
            }
        }
        
        // Sort by path count and priority
        referenced.sort(function(a, b) {
            if (b.pathCount !== a.pathCount) {
                return b.pathCount - a.pathCount;
            }
            return b.priority - a.priority;
        });
        
        return referenced.slice(0, maxItems);
        
    } catch (exc) {
        return referenced;
    }
}

/**
 * Find least accessible objects that might be important
 * @param {Object} session - Deep mapping session
 * @param {Number} maxItems - Maximum items to return
 * @returns {Array} - Array of least accessible objects
 */
function findLeastAccessibleObjects(session, maxItems) {
    var leastAccessible = [];
    
    try {
        if (!session.objectAtlas) return leastAccessible;
        
        var atlasStats = session.objectAtlas.getStatistics();
        
        // Find objects with only one complex path
        for (var i = 0; i < atlasStats.totalObjects; i++) {
            var paths = session.objectAtlas.getObjectPaths(i);
            var metadata = session.objectAtlas.getObjectMetadata(i);
            
            if (paths.length === 1) {
                var path = paths[0];
                var pathComplexity = calculatePathComplexity(path);
                
                if (pathComplexity > 3) { // Deep or complex path
                    leastAccessible.push({
                        objectIndex: i,
                        path: path,
                        complexity: pathComplexity,
                        metadata: metadata,
                        accessibility: calculateAccessibility(path, metadata)
                    });
                }
            }
        }
        
        // Sort by complexity and accessibility
        leastAccessible.sort(function(a, b) {
            return b.complexity - a.complexity;
        });
        
        return leastAccessible.slice(0, maxItems);
        
    } catch (exc) {
        return leastAccessible;
    }
}

/**
 * Generate object recommendations for developers
 * @param {Object} session - Deep mapping session
 * @param {Object} config - Analysis configuration
 * @returns {Array} - Array of recommended objects
 */
function generateObjectRecommendations(session, config) {
    var recommendations = [];
    
    try {
        if (!session.objectAtlas) return recommendations;
        
        var atlasStats = session.objectAtlas.getStatistics();
        
        // Find objects with good access patterns
        for (var i = 0; i < atlasStats.totalObjects; i++) {
            var paths = session.objectAtlas.getObjectPaths(i);
            var metadata = session.objectAtlas.getObjectMetadata(i);
            
            // Skip non-useful objects
            if (metadata.type === 'function' || metadata.depth > 5) {
                continue;
            }
            
            var recommendation = evaluateObjectUsability(i, paths, metadata);
            if (recommendation.score > 0.5) {
                recommendations.push(recommendation);
            }
        }
        
        // Sort by usability score
        recommendations.sort(function(a, b) {
            return b.score - a.score;
        });
        
        return recommendations.slice(0, config.maxReportItems);
        
    } catch (exc) {
        return recommendations;
    }
}

// ============================================================================
// ACCESS PATTERN ANALYSIS
// ============================================================================

/**
 * Analyze access patterns for developer guidance
 * @param {Object} session - Deep mapping session
 * @param {Object} config - Analysis configuration
 * @returns {Object} - Access pattern analysis results
 */
function analyzeAccessPatterns(session, config) {
    var analysis = {
        totalPatterns: 0,
        simplePatterns: [],
        complexPatterns: [],
        recommendedPatterns: [],
        antiPatterns: [],
        pathStatistics: {
            averageDepth: 0,
            maxDepth: 0,
            minDepth: 0,
            depthDistribution: {}
        }
    };
    
    try {
        if (!session.objectAtlas) {
            return analysis;
        }
        
        var accessPatterns = session.objectAtlas.generateAccessPatterns();
        analysis.totalPatterns = accessPatterns.length;
        
        var depths = [];
        
        // Categorize patterns
        for (var i = 0; i < accessPatterns.length; i++) {
            var pattern = accessPatterns[i];
            var primaryPath = pattern.primaryPath;
            var pathDepth = splitPath(primaryPath).length;
            
            depths.push(pathDepth);
            
            // Update depth distribution
            if (!analysis.pathStatistics.depthDistribution[pathDepth]) {
                analysis.pathStatistics.depthDistribution[pathDepth] = 0;
            }
            analysis.pathStatistics.depthDistribution[pathDepth]++;
            
            // Categorize by complexity
            if (pathDepth <= 3 && pattern.pathCount <= 2) {
                analysis.simplePatterns.push(pattern);
            } else if (pathDepth > 5 || pattern.pathCount > 5) {
                analysis.complexPatterns.push(pattern);
            }
            
            // Evaluate for recommendations
            var evaluation = evaluateAccessPattern(pattern);
            if (evaluation.isRecommended) {
                analysis.recommendedPatterns.push({
                    pattern: pattern,
                    evaluation: evaluation
                });
            } else if (evaluation.isAntiPattern) {
                analysis.antiPatterns.push({
                    pattern: pattern,
                    evaluation: evaluation
                });
            }
        }
        
        // Calculate path statistics
        if (depths.length > 0) {
            analysis.pathStatistics.averageDepth = depths.reduce(function(sum, d) { return sum + d; }, 0) / depths.length;
            analysis.pathStatistics.maxDepth = Math.max.apply(Math, depths);
            analysis.pathStatistics.minDepth = Math.min.apply(Math, depths);
        }
        
        // Sort recommendations by score
        analysis.recommendedPatterns.sort(function(a, b) {
            return b.evaluation.score - a.evaluation.score;
        });
        
        // Limit results
        analysis.simplePatterns = analysis.simplePatterns.slice(0, config.maxReportItems);
        analysis.complexPatterns = analysis.complexPatterns.slice(0, config.maxReportItems);
        analysis.recommendedPatterns = analysis.recommendedPatterns.slice(0, config.maxReportItems);
        analysis.antiPatterns = analysis.antiPatterns.slice(0, config.maxReportItems);
        
    } catch (exc) {
        analysis.error = 'Access pattern analysis failed: ' + exc.message;
    }
    
    return analysis;
}

/**
 * Evaluate access pattern for recommendations
 * @param {Object} pattern - Access pattern to evaluate
 * @returns {Object} - Evaluation result
 */
function evaluateAccessPattern(pattern) {
    var evaluation = {
        score: 0,
        isRecommended: false,
        isAntiPattern: false,
        reasons: [],
        recommendation: ''
    };
    
    try {
        var primaryPath = pattern.primaryPath;
        var pathDepth = splitPath(primaryPath).length;
        var pathCount = pattern.pathCount;
        
        // Scoring factors
        if (pathDepth <= 3) {
            evaluation.score += 0.3;
            evaluation.reasons.push('Simple access path');
        } else if (pathDepth > 6) {
            evaluation.score -= 0.2;
            evaluation.reasons.push('Complex access path');
        }
        
        if (pathCount === 2) {
            evaluation.score += 0.2;
            evaluation.reasons.push('Good path redundancy');
        } else if (pathCount > 5) {
            evaluation.score -= 0.1;
            evaluation.reasons.push('Too many access paths');
        }
        
        // Check for safe property names
        var pathComponents = splitPath(primaryPath);
        var hasDangerousComponents = false;
        for (var i = 0; i < pathComponents.length; i++) {
            if (isDangerousProperty(pathComponents[i])) {
                hasDangerousComponents = true;
                break;
            }
        }
        
        if (!hasDangerousComponents) {
            evaluation.score += 0.3;
            evaluation.reasons.push('Safe property access');
        } else {
            evaluation.score -= 0.3;
            evaluation.reasons.push('Contains dangerous properties');
            evaluation.isAntiPattern = true;
        }
        
        // Object type considerations
        if (pattern.objectType === 'object') {
            evaluation.score += 0.1;
        } else if (pattern.objectType === 'function') {
            evaluation.score -= 0.2;
            evaluation.isAntiPattern = true;
        }
        
        // Final determination
        if (evaluation.score >= 0.5 && !evaluation.isAntiPattern) {
            evaluation.isRecommended = true;
            evaluation.recommendation = 'Recommended for developer use';
        } else if (evaluation.score < 0.2 || evaluation.isAntiPattern) {
            evaluation.isAntiPattern = true;
            evaluation.recommendation = 'Avoid using this pattern';
        } else {
            evaluation.recommendation = 'Use with caution';
        }
        
    } catch (exc) {
        evaluation.error = 'Pattern evaluation failed: ' + exc.message;
    }
    
    return evaluation;
}

// ============================================================================
// CIRCULAR REFERENCE ANALYSIS
// ============================================================================

/**
 * Analyze circular references in detail
 * @param {Object} session - Deep mapping session
 * @param {Object} config - Analysis configuration
 * @returns {Object} - Circular reference analysis
 */
function analyzeCircularReferences(session, config) {
    var analysis = {
        totalCircularReferences: 0,
        uniqueCircularObjects: 0,
        circularPatterns: [],
        circularByType: {},
        circularByDepth: {},
        recommendations: []
    };
    
    try {
        if (!session.circularMap) {
            return analysis;
        }
        
        var circularPatterns = session.circularMap.analyzePatterns();
        analysis.totalCircularReferences = circularPatterns.totalCircularReferences;
        analysis.uniqueCircularObjects = circularPatterns.uniqueObjects;
        analysis.circularPatterns = circularPatterns.pathPatterns;
        
        // Analyze by type
        analysis.circularByType = circularPatterns.typePatterns;
        
        // Analyze by depth
        for (var i = 0; i < circularPatterns.pathPatterns.length; i++) {
            var pattern = circularPatterns.pathPatterns[i];
            var depth = pattern.depth;
            
            if (!analysis.circularByDepth[depth]) {
                analysis.circularByDepth[depth] = 0;
            }
            analysis.circularByDepth[depth]++;
        }
        
        // Generate recommendations for handling circular references
        analysis.recommendations = generateCircularRecommendations(circularPatterns);
        
    } catch (exc) {
        analysis.error = 'Circular reference analysis failed: ' + exc.message;
    }
    
    return analysis;
}

/**
 * Generate recommendations for handling circular references
 * @param {Object} circularPatterns - Circular pattern analysis
 * @returns {Array} - Array of recommendations
 */
function generateCircularRecommendations(circularPatterns) {
    var recommendations = [];
    
    try {
        if (circularPatterns.totalCircularReferences > 0) {
            recommendations.push({
                type: 'warning',
                message: 'Document contains ' + circularPatterns.totalCircularReferences + ' circular references',
                action: 'Use reference tracking when accessing these objects'
            });
            
            recommendations.push({
                type: 'code',
                message: 'Recommended circular reference handling pattern',
                code: 'var visitedObjects = [];\nfunction safeAccess(obj, path) {\n  if (visitedObjects.indexOf(obj) !== -1) {\n    return "[circular reference]";\n  }\n  visitedObjects.push(obj);\n  // Process object safely\n  visitedObjects.pop();\n}'
            });
        }
        
        if (circularPatterns.uniqueObjects > 10) {
            recommendations.push({
                type: 'performance',
                message: 'High number of circular objects may impact performance',
                action: 'Consider limiting recursion depth when traversing'
            });
        }
        
    } catch (exc) {
        recommendations.push({
            type: 'error',
            message: 'Failed to generate circular recommendations: ' + exc.message
        });
    }
    
    return recommendations;
}

// ============================================================================
// PERFORMANCE ANALYSIS
// ============================================================================

/**
 * Analyze performance metrics from deep mapping
 * @param {Object} session - Deep mapping session
 * @param {Object} config - Analysis configuration
 * @returns {Object} - Performance analysis
 */
function analyzePerformance(session, config) {
    var analysis = {
        totalTime: 0,
        objectsPerSecond: 0,
        memoryEfficiency: 'unknown',
        timeoutEvents: 0,
        performanceBottlenecks: [],
        optimizationRecommendations: []
    };
    
    try {
        analysis.totalTime = session.metadata.totalTime || 0;
        analysis.timeoutEvents = session.statistics.timeouts || 0;
        
        if (analysis.totalTime > 0) {
            analysis.objectsPerSecond = Math.round((session.statistics.totalObjectsDiscovered / analysis.totalTime) * 1000);
        }
        
        // Analyze performance characteristics
        if (analysis.totalTime > 30000) { // More than 30 seconds
            analysis.performanceBottlenecks.push('Long execution time');
            analysis.optimizationRecommendations.push('Consider reducing maxDepth or maxTotalObjects');
        }
        
        if (analysis.timeoutEvents > 0) {
            analysis.performanceBottlenecks.push('Timeout events occurred');
            analysis.optimizationRecommendations.push('Increase timeoutMs or reduce scope');
        }
        
        if (session.statistics.circularReferences > 100) {
            analysis.performanceBottlenecks.push('High number of circular references');
            analysis.optimizationRecommendations.push('Enable circular reference caching');
        }
        
        // Memory efficiency assessment
        var uniqueRatio = session.statistics.uniqueObjects / session.statistics.totalObjectsDiscovered;
        if (uniqueRatio > 0.8) {
            analysis.memoryEfficiency = 'excellent';
        } else if (uniqueRatio > 0.6) {
            analysis.memoryEfficiency = 'good';
        } else if (uniqueRatio > 0.4) {
            analysis.memoryEfficiency = 'fair';
        } else {
            analysis.memoryEfficiency = 'poor';
            analysis.optimizationRecommendations.push('High object duplication detected - consider deduplication strategies');
        }
        
    } catch (exc) {
        analysis.error = 'Performance analysis failed: ' + exc.message;
    }
    
    return analysis;
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

/**
 * Generate comprehensive object report
 * @param {Object} objectAnalysis - Object analysis results
 * @param {Object} config - Analysis configuration
 * @returns {String} - Formatted object report
 */
function generateObjectReport(objectAnalysis, config) {
    var builder = createStringBuilder();
    
    builder.appendLine('DEEP MAPPING OBJECT ANALYSIS REPORT');
    builder.appendLine('==================================');
    builder.appendLine('Generated: ' + getCurrentTimestamp());
    builder.appendLine('');
    
    // Object statistics
    builder.appendLine('OBJECT STATISTICS:');
    builder.appendLine('Total objects discovered: ' + objectAnalysis.totalObjects);
    builder.appendLine('Unique objects: ' + objectAnalysis.uniqueObjects);
    builder.appendLine('Duplicate references: ' + objectAnalysis.duplicateObjects);
    builder.appendLine('');
    
    // Objects by type
    builder.appendLine('OBJECTS BY TYPE:');
    for (var type in objectAnalysis.objectsByType) {
        var typeInfo = objectAnalysis.objectsByType[type];
        builder.appendLine('  ' + type + ': ' + typeInfo.count + ' objects');
    }
    builder.appendLine('');
    
    // Most referenced objects
    if (objectAnalysis.mostReferencedObjects.length > 0) {
        builder.appendLine('MOST REFERENCED OBJECTS:');
        for (var i = 0; i < Math.min(objectAnalysis.mostReferencedObjects.length, 10); i++) {
            var ref = objectAnalysis.mostReferencedObjects[i];
            builder.appendLine('  Object #' + ref.objectIndex + ': ' + ref.pathCount + ' access paths');
            builder.appendLine('    Primary path: ' + ref.paths[0]);
            if (ref.paths.length > 1) {
                builder.appendLine('    Alternative: ' + ref.paths[1]);
            }
        }
        builder.appendLine('');
    }
    
    // Recommendations
    if (objectAnalysis.recommendedObjects.length > 0) {
        builder.appendLine('RECOMMENDED OBJECTS FOR DEVELOPERS:');
        for (var i = 0; i < Math.min(objectAnalysis.recommendedObjects.length, 15); i++) {
            var rec = objectAnalysis.recommendedObjects[i];
            builder.appendLine('  ' + rec.primaryPath + ' (score: ' + rec.score.toFixed(2) + ')');
            builder.appendLine('    Reason: ' + rec.reasons.join(', '));
        }
        builder.appendLine('');
    }
    
    return builder.toString();
}

/**
 * Generate executive summary
 * @param {Object} session - Deep mapping session
 * @param {Object} analysisResult - Analysis results
 * @param {Object} config - Analysis configuration
 * @returns {String} - Executive summary
 */
function generateExecutiveSummary(session, analysisResult, config) {
    var builder = createStringBuilder();
    
    builder.appendLine('EXECUTIVE SUMMARY - DEEP DOM MAPPING');
    builder.appendLine('===================================');
    builder.appendLine('Document: ' + session.metadata.documentName);
    builder.appendLine('Analysis Date: ' + getCurrentTimestamp());
    builder.appendLine('');
    
    // Key findings
    builder.appendLine('KEY FINDINGS:');
    builder.appendLine('• Discovered ' + session.statistics.totalObjectsDiscovered + ' total objects in document DOM');
    builder.appendLine('• Identified ' + session.statistics.uniqueObjects + ' unique objects with ' + session.statistics.duplicateReferences + ' duplicate references');
    builder.appendLine('• Maximum depth reached: ' + session.statistics.maxDepthReached + ' levels');
    builder.appendLine('• Circular references detected: ' + session.statistics.circularReferences);
    builder.appendLine('');
    
    // Performance summary
    if (analysisResult.performanceAnalysis) {
        var perf = analysisResult.performanceAnalysis;
        builder.appendLine('PERFORMANCE SUMMARY:');
        builder.appendLine('• Total mapping time: ' + (session.metadata.totalTime / 1000).toFixed(2) + ' seconds');
        builder.appendLine('• Processing rate: ' + perf.objectsPerSecond + ' objects/second');
        builder.appendLine('• Memory efficiency: ' + perf.memoryEfficiency);
        if (perf.performanceBottlenecks.length > 0) {
            builder.appendLine('• Performance issues: ' + perf.performanceBottlenecks.join(', '));
        }
        builder.appendLine('');
    }
    
    // Access pattern summary
    if (analysisResult.accessAnalysis) {
        var access = analysisResult.accessAnalysis;
        builder.appendLine('ACCESS PATTERN SUMMARY:');
        builder.appendLine('• Total access patterns: ' + access.totalPatterns);
        builder.appendLine('• Simple patterns: ' + access.simplePatterns.length);
        builder.appendLine('• Complex patterns: ' + access.complexPatterns.length);
        builder.appendLine('• Recommended patterns: ' + access.recommendedPatterns.length);
        builder.appendLine('• Average path depth: ' + access.pathStatistics.averageDepth.toFixed(1));
        builder.appendLine('');
    }
    
    // Recommendations
    builder.appendLine('DEVELOPER RECOMMENDATIONS:');
    if (analysisResult.objectAnalysis && analysisResult.objectAnalysis.recommendedObjects.length > 0) {
        builder.appendLine('• Focus on ' + Math.min(analysisResult.objectAnalysis.recommendedObjects.length, 10) + ' high-value objects for script development');
    }
    if (analysisResult.accessAnalysis && analysisResult.accessAnalysis.simplePatterns.length > 0) {
        builder.appendLine('• Use ' + analysisResult.accessAnalysis.simplePatterns.length + ' simple access patterns for reliable property access');
    }
    if (session.statistics.circularReferences > 0) {
        builder.appendLine('• Implement circular reference protection when traversing object relationships');
    }
    if (analysisResult.performanceAnalysis && analysisResult.performanceAnalysis.optimizationRecommendations.length > 0) {
        builder.appendLine('• Consider performance optimizations: ' + analysisResult.performanceAnalysis.optimizationRecommendations[0]);
    }
    
    return builder.toString();
}

/**
 * Generate developer guide with code examples
 * @param {Object} session - Deep mapping session
 * @param {Object} analysisResult - Analysis results
 * @param {Object} config - Analysis configuration
 * @returns {String} - Developer guide
 */
function generateDeveloperGuide(session, analysisResult, config) {
    var builder = createStringBuilder();
    
    builder.appendLine('DEVELOPER ACCESS GUIDE');
    builder.appendLine('=====================');
    builder.appendLine('Generated from deep DOM mapping analysis');
    builder.appendLine('Document: ' + session.metadata.documentName);
    builder.appendLine('');
    
    // Safe access patterns
    if (analysisResult.objectAnalysis && analysisResult.objectAnalysis.recommendedObjects.length > 0) {
        builder.appendLine('RECOMMENDED OBJECT ACCESS PATTERNS:');
        builder.appendLine('');
        
        for (var i = 0; i < Math.min(analysisResult.objectAnalysis.recommendedObjects.length, 10); i++) {
            var rec = analysisResult.objectAnalysis.recommendedObjects[i];
            builder.appendLine('// ' + rec.reasons.join(', '));
            builder.appendLine('try {');
            builder.appendLine('  var obj = ' + rec.primaryPath + ';');
            builder.appendLine('  if (obj) {');
            builder.appendLine('    // Use object safely');
            builder.appendLine('  }');
            builder.appendLine('} catch (exc) {');
            builder.appendLine('  // Handle access error');
            builder.appendLine('}');
            builder.appendLine('');
        }
    }
    
    // Circular reference handling
    if (session.statistics.circularReferences > 0) {
        builder.appendLine('CIRCULAR REFERENCE PROTECTION:');
        builder.appendLine('// Use this pattern for safe object traversal');
        builder.appendLine('function safeTraverse(obj, maxDepth) {');
        builder.appendLine('  var visited = [];');
        builder.appendLine('  var depth = maxDepth || 5;');
        builder.appendLine('  ');
        builder.appendLine('  function traverse(current, currentDepth) {');
        builder.appendLine('    if (currentDepth >= depth) return;');
        builder.appendLine('    if (visited.indexOf(current) !== -1) return;');
        builder.appendLine('    ');
        builder.appendLine('    visited.push(current);');
        builder.appendLine('    // Process current object');
        builder.appendLine('    visited.pop();');
        builder.appendLine('  }');
        builder.appendLine('  ');
        builder.appendLine('  traverse(obj, 0);');
        builder.appendLine('}');
        builder.appendLine('');
    }
    
    // Performance tips
    if (analysisResult.performanceAnalysis) {
        builder.appendLine('PERFORMANCE OPTIMIZATION TIPS:');
        var perf = analysisResult.performanceAnalysis;
        if (perf.optimizationRecommendations.length > 0) {
            for (var i = 0; i < perf.optimizationRecommendations.length; i++) {
                builder.appendLine('• ' + perf.optimizationRecommendations[i]);
            }
        }
        builder.appendLine('');
    }
    
    return builder.toString();
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate object priority for recommendations
 * @param {Array} paths - Access paths to object
 * @param {Object} metadata - Object metadata
 * @returns {Number} - Priority score
 */
function calculateObjectPriority(paths, metadata) {
    var priority = 0;
    
    // More paths = higher priority
    priority += paths.length * 0.2;
    
    // Shorter paths = higher priority
    var avgDepth = 0;
    for (var i = 0; i < paths.length; i++) {
        avgDepth += splitPath(paths[i]).length;
    }
    avgDepth /= paths.length;
    priority += Math.max(0, 1 - (avgDepth / 10));
    
    // Object type considerations
    if (metadata.type === 'object') {
        priority += 0.3;
    } else if (metadata.type === 'function') {
        priority -= 0.2;
    }
    
    return priority;
}

/**
 * Calculate path complexity score
 * @param {String} path - Dot notation path
 * @returns {Number} - Complexity score
 */
function calculatePathComplexity(path) {
    var components = splitPath(path);
    var complexity = components.length;
    
    // Check for dangerous components
    for (var i = 0; i < components.length; i++) {
        if (isDangerousProperty(components[i])) {
            complexity += 2;
        }
    }
    
    return complexity;
}

/**
 * Calculate object accessibility score
 * @param {String} path - Access path
 * @param {Object} metadata - Object metadata
 * @returns {Number} - Accessibility score (0-1)
 */
function calculateAccessibility(path, metadata) {
    var score = 1.0;
    
    var pathDepth = splitPath(path).length;
    score -= (pathDepth - 1) * 0.1; // Penalty for depth
    
    if (isDangerousPath(path)) {
        score -= 0.3; // Penalty for dangerous path
    }
    
    if (metadata.type === 'function') {
        score -= 0.2; // Penalty for functions
    }
    
    return Math.max(0, score);
}

/**
 * Evaluate object usability for recommendations
 * @param {Number} objectIndex - Object index
 * @param {Array} paths - Access paths
 * @param {Object} metadata - Object metadata
 * @returns {Object} - Usability evaluation
 */
function evaluateObjectUsability(objectIndex, paths, metadata) {
    var evaluation = {
        objectIndex: objectIndex,
        score: 0,
        reasons: [],
        primaryPath: paths[0],
        alternativePaths: paths.slice(1),
        recommendation: ''
    };
    
    // Path simplicity
    var avgDepth = 0;
    for (var i = 0; i < paths.length; i++) {
        avgDepth += splitPath(paths[i]).length;
    }
    avgDepth /= paths.length;
    
    if (avgDepth <= 3) {
        evaluation.score += 0.4;
        evaluation.reasons.push('Simple access path');
    } else if (avgDepth > 5) {
        evaluation.score -= 0.2;
        evaluation.reasons.push('Complex access path');
    }
    
    // Multiple access paths
    if (paths.length > 1 && paths.length <= 3) {
        evaluation.score += 0.3;
        evaluation.reasons.push('Multiple reliable access paths');
    }
    
    // Object type
    if (metadata.type === 'object') {
        evaluation.score += 0.2;
        evaluation.reasons.push('Useful object type');
    }
    
    // Safety
    var hasSafePath = false;
    for (var i = 0; i < paths.length; i++) {
        if (!isDangerousPath(paths[i])) {
            hasSafePath = true;
            break;
        }
    }
    
    if (hasSafePath) {
        evaluation.score += 0.3;
        evaluation.reasons.push('Safe access available');
    } else {
        evaluation.score -= 0.3;
        evaluation.reasons.push('No safe access path');
    }
    
    // Generate recommendation
    if (evaluation.score >= 0.7) {
        evaluation.recommendation = 'Highly recommended for script development';
    } else if (evaluation.score >= 0.4) {
        evaluation.recommendation = 'Good candidate for careful use';
    } else {
        evaluation.recommendation = 'Consider alternatives';
    }
    
    return evaluation;
}

/**
 * Merge analysis configuration with defaults
 * @param {Object} defaults - Default configuration
 * @param {Object} userConfig - User configuration
 * @returns {Object} - Merged configuration
 */
function mergeAnalysisConfig(defaults, userConfig) {
    var merged = {};
    
    // Copy defaults
    for (var key in defaults) {
        merged[key] = defaults[key];
    }
    
    // Override with user config
    if (userConfig) {
        for (var key in userConfig) {
            merged[key] = userConfig[key];
        }
    }
    
    return merged;
}

// ============================================================================
// PUBLIC API FUNCTIONS
// ============================================================================

/**
 * Quick analysis with default configuration
 * @param {Object} deepMappingSession - Deep mapping session
 * @returns {Object} - Analysis results
 */
function quickAnalyzeSession(deepMappingSession) {
    var quickConfig = {
        maxReportItems: 20,
        generateObjectReport: true,
        generateAccessReport: false,
        includeDeveloperGuide: true
    };
    
    return analyzeDeepMappingSession(deepMappingSession, quickConfig);
}

/**
 * Comprehensive analysis with all features
 * @param {Object} deepMappingSession - Deep mapping session
 * @returns {Object} - Complete analysis results
 */
function comprehensiveAnalysis(deepMappingSession) {
    return analyzeDeepMappingSession(deepMappingSession, DEFAULT_ANALYSIS_CONFIG);
}

// ============================================================================
// MODULE INITIALIZATION
// ============================================================================

/**
 * Initialize deep mapper analysis module
 * @returns {Boolean} - true if initialization successful
 */
function initializeDeepMapperAnalysis() {
    try {
        // Check dependencies
        if (typeof createStringBuilder !== 'function') {
            $.writeln('ERROR: Safe foundation module (1.0) not loaded');
            return false;
        }
        
        if (typeof performDeepDOMMapping !== 'function') {
            $.writeln('ERROR: Deep mapper core module (9.1) not loaded');
            return false;
        }
        
        // Test core functions
        var requiredFunctions = [
            'analyzeDeepMappingSession', 'generateExecutiveSummary', 'generateDeveloperGuide'
        ];
        
        for (var i = 0; i < requiredFunctions.length; i++) {
            if (typeof eval(requiredFunctions[i]) !== 'function') {
                $.writeln('ERROR: Required function missing: ' + requiredFunctions[i]);
                return false;
            }
        }
        
        $.writeln('9.2_deep-mapper-analysis.jsx: Initialized successfully');
        $.writeln('Analysis features: Object analysis, access patterns, performance metrics, developer guides');
        $.writeln('Use analyzeDeepMappingSession(session, config) to analyze deep mapping results');
        return true;
        
    } catch (exc) {
        $.writeln('ERROR: Deep mapper analysis initialization failed: ' + exc.message);
        return false;
    }
}

// Auto-initialize when module loads
initializeDeepMapperAnalysis();