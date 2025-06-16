// =============================================================================
// 8.0_deep-mapper.jsx - DEEP DOM MAPPING AND ANALYSIS
// InDesign DOM Discovery Builder v2.1 - TARGET ARCHITECTURE
// =============================================================================
// PURPOSE: Exhaustive DOM traversal with object deduplication, reference tracking, and comprehensive analysis
// DEPENDENCIES: ["1.0_safe-foundation.jsx", "2.0_dom-enumerator.jsx", "3.0_collection-sampler.jsx"]
// SIZE: ~1800 lines (combines 9.1 + 9.2)
// =============================================================================

// =============================================================================
// DEEP MAPPING CONFIGURATION
// =============================================================================

var DEFAULT_DEEP_MAPPING_CONFIG = {
    maxDepth: 6,
    timeoutMs: 30000,
    maxTotalObjects: 10000,
    trackAllPaths: true,
    enableObjectAtlas: true,
    deduplicateReferences: true,
    mapCircularReferences: true,
    includeSystemObjects: false,
    enableProgressReporting: true,
    memoryCheckInterval: 1000
};

var DEFAULT_ANALYSIS_CONFIG = {
    generateObjectReport: true,
    generateAccessReport: true,
    generateCircularReport: true,
    analyzePerformance: true,
    includeDeveloperGuide: true,
    maxReportItems: 1000,
    groupSimilarObjects: true,
    prioritizeByUsability: true,
    includeCodeExamples: true
};

// =============================================================================
// MAIN DEEP MAPPING FUNCTIONS
// =============================================================================

/**
 * Perform exhaustive deep DOM mapping with comprehensive tracking
 * @param {Object} documentObj - Document to map
 * @param {Object} config - Deep mapping configuration
 * @returns {Object} Complete deep mapping session
 */
function performDeepDOMMapping(documentObj, config) {
    var startTime = new Date().getTime();
    var mappingConfig = config || DEFAULT_DEEP_MAPPING_CONFIG;
    
    try {
        // Validate environment
        var envValidation = validateInDesignEnvironment();
        if (!envValidation.valid) {
            return createErrorDeepMappingSession(envValidation.error);
        }
        
        var targetDocument = documentObj || envValidation.document;
        
        // Create deep mapping session
        var session = createDeepMappingSession();
        session.metadata = {
            timestamp: getCurrentTimestamp(),
            documentName: targetDocument.name || 'Unknown Document',
            config: mappingConfig,
            features: {
                objectAtlas: mappingConfig.enableObjectAtlas,
                circularMapping: mappingConfig.mapCircularReferences,
                exhaustiveTraversal: true
            }
        };
        
        // Set up tracking components
        var objectAtlas = mappingConfig.enableObjectAtlas ? createObjectAtlas() : null;
        var circularMapper = mappingConfig.mapCircularReferences ? createCircularReferenceMapper() : null;
        var timeoutChecker = createTimeoutChecker(mappingConfig.timeoutMs);
        var operationCounter = createOperationCounter(mappingConfig.maxTotalObjects);
        var memoryMonitor = createMemoryMonitor();
        
        memoryMonitor.checkpoint('deep_mapping_start');
        
        // Perform deep object mapping
        var documentNode = performDeepObjectMapping(
            targetDocument,
            'document',
            'document',
            0,
            mappingConfig,
            session,
            timeoutChecker,
            operationCounter,
            memoryMonitor,
            []
        );
        
        session.structure.document = documentNode;
        
        // Register with object atlas if enabled
        if (objectAtlas && documentNode) {
            objectAtlas.registerObject(documentNode.objectId, documentNode, 'document', {
                isRoot: true,
                mappingTime: getCurrentTimestamp()
            });
            session.objectAtlas = objectAtlas;
        }
        
        // Finalize session
        session.statistics.mappingTime = new Date().getTime() - startTime;
        session.statistics.memoryReport = memoryMonitor.getReport();
        
        if (circularMapper) {
            session.statistics.circularReferences = circularMapper.getStatistics();
            session.circularReferenceMapper = circularMapper;
        }
        
        memoryMonitor.checkpoint('deep_mapping_complete');
        
        return session;
        
    } catch (exc) {
        return createErrorDeepMappingSession('Deep mapping failed: ' + exc.message);
    }
}

/**
 * Perform deep object mapping with comprehensive tracking
 * @param {Object} targetObj - Object to map
 * @param {String} objName - Object name
 * @param {String} objPath - Object path
 * @param {Number} depth - Current depth
 * @param {Object} config - Configuration
 * @param {Object} session - Deep mapping session
 * @param {Function} timeoutChecker - Timeout checker
 * @param {Object} operationCounter - Operation counter
 * @param {Object} memoryMonitor - Memory monitor
 * @param {Array} parentPaths - Parent paths for circular detection
 * @returns {Object} Deep DOM node structure
 */
function performDeepObjectMapping(targetObj, objName, objPath, depth, config, session, timeoutChecker, operationCounter, memoryMonitor, parentPaths) {
    try {
        // Safety checks
        if (timeoutChecker && timeoutChecker()) {
            return createErrorDeepDOMNode(objName, objPath, 'timeout', depth);
        }
        
        if (operationCounter && operationCounter.check()) {
            return createErrorDeepDOMNode(objName, objPath, 'max_operations', depth);
        }
        
        if (depth >= config.maxDepth) {
            return createErrorDeepDOMNode(objName, objPath, 'max_depth', depth);
        }
        
        // Memory checkpoint at regular intervals
        if (depth % 3 === 0 && memoryMonitor) {
            memoryMonitor.checkpoint('depth_' + depth + '_' + objName);
        }
        
        // Check for circular references
        var isCircular = false;
        for (var i = 0; i < parentPaths.length; i++) {
            if (parentPaths[i] === objPath) {
                isCircular = true;
                break;
            }
        }
        
        // Create deep DOM node
        var deepNode = createDeepDOMNode(objName, objPath, typeof targetObj, depth);
        
        if (isCircular) {
            deepNode.objectMetadata.isCircular = true;
            deepNode.objectMetadata.circularType = 'path';
            
            // Record with circular mapper if available
            if (session.circularReferenceMapper) {
                session.circularReferenceMapper.recordCircularReference(objPath, parentPaths, 'path');
            }
            
            session.statistics.circularReferences++;
            return deepNode;
        }
        
        // Update session statistics
        session.statistics.totalNodes++;
        session.statistics.maxDepthReached = Math.max(session.statistics.maxDepthReached, depth);
        
        // Deep property enumeration
        var newParentPaths = parentPaths.slice();
        newParentPaths.push(objPath);
        
        var propertyCount = 0;
        
        for (var propName in targetObj) {
            if (operationCounter) {
                operationCounter.increment();
            }
            
            if (timeoutChecker && timeoutChecker()) {
                break;
            }
            
            // Skip dangerous properties
            if (isDangerousProperty(propName) && !config.includeSystemObjects) {
                continue;
            }
            
            var propType = safeTypeCheck(targetObj, propName);
            if (propType === 'error') {
                continue;
            }
            
            var propertyClassification = createPropertyClassification(propName, propType, objPath, null);
            
            // Add to appropriate collection
            if (propertyClassification.isMethod) {
                deepNode.methods.push(propertyClassification);
            } else if (propertyClassification.isCollection) {
                deepNode.collections.push(propertyClassification);
            } else {
                deepNode.properties.push(propertyClassification);
            }
            
            propertyCount++;
            session.statistics.totalProperties++;
            
            // Recursively map object properties
            if (propType === 'object' && depth < config.maxDepth - 1) {
                try {
                    var childObject = targetObj[propName];
                    if (childObject) {
                        var childPath = objPath + '.' + propName;
                        var childNode = performDeepObjectMapping(
                            childObject,
                            propName,
                            childPath,
                            depth + 1,
                            config,
                            session,
                            timeoutChecker,
                            operationCounter,
                            memoryMonitor,
                            newParentPaths
                        );
                        
                        if (childNode) {
                            deepNode.childNodes.push(childNode);
                            propertyClassification.objectId = childNode.objectId;
                            
                            // Register with object atlas if enabled
                            if (session.objectAtlas) {
                                session.objectAtlas.registerObject(
                                    childNode.objectId,
                                    childNode,
                                    childPath,
                                    {
                                        parentPath: objPath,
                                        depth: depth + 1,
                                        mappingTime: getCurrentTimestamp()
                                    }
                                );
                            }
                        }
                    }
                } catch (exc) {
                    // Continue mapping even if individual child fails
                    session.statistics.mappingErrors++;
                }
            }
        }
        
        deepNode.objectMetadata.propertyCount = propertyCount;
        deepNode.objectMetadata.mappingTimestamp = getCurrentTimestamp();
        
        return deepNode;
        
    } catch (exc) {
        session.statistics.mappingErrors++;
        return createErrorDeepDOMNode(objName, objPath, 'mapping_error: ' + exc.message, depth);
    }
}

// =============================================================================
// OBJECT ATLAS FUNCTIONS
// =============================================================================

/**
 * Create object atlas for comprehensive reference tracking
 * @returns {Object} Object atlas with enhanced methods
 */
function createObjectAtlas() {
    var atlas = {
        objects: {},
        pathIndex: {},
        statistics: {
            totalObjects: 0,
            duplicateReferences: 0,
            pathMappings: 0,
            lastUpdate: getCurrentTimestamp()
        }
    };
    
    atlas.registerObject = function(objectId, objectNode, objectPath, metadata) {
        try {
            if (!this.objects[objectId]) {
                this.objects[objectId] = {
                    node: objectNode,
                    paths: [objectPath],
                    metadata: metadata || {},
                    firstSeen: getCurrentTimestamp()
                };
                this.statistics.totalObjects++;
            } else {
                this.objects[objectId].paths.push(objectPath);
                this.statistics.duplicateReferences++;
            }
            
            // Update path index
            this.pathIndex[objectPath] = objectId;
            this.statistics.pathMappings++;
            this.statistics.lastUpdate = getCurrentTimestamp();
            
            return true;
            
        } catch (exc) {
            return false;
        }
    };
    
    atlas.getObjectPaths = function(objectId) {
        try {
            if (this.objects[objectId]) {
                return this.objects[objectId].paths.slice();
            }
            return [];
        } catch (exc) {
            return [];
        }
    };
    
    atlas.getObject = function(objectId) {
        try {
            if (this.objects[objectId]) {
                return this.objects[objectId].node;
            }
            return null;
        } catch (exc) {
            return null;
        }
    };
    
    atlas.findObjectByPath = function(objectPath) {
        try {
            var objectId = this.pathIndex[objectPath];
            if (objectId && this.objects[objectId]) {
                return this.objects[objectId].node;
            }
            return null;
        } catch (exc) {
            return null;
        }
    };
    
    atlas.getStatistics = function() {
        return {
            totalObjects: this.statistics.totalObjects,
            duplicateReferences: this.statistics.duplicateReferences,
            pathMappings: this.statistics.pathMappings,
            lastUpdate: this.statistics.lastUpdate
        };
    };
    
    atlas.generateAccessPatterns = function() {
        try {
            var patterns = [];
            
            for (var objectId in this.objects) {
                var objectInfo = this.objects[objectId];
                if (objectInfo.paths.length > 1) {
                    patterns.push({
                        objectId: objectId,
                        primaryPath: objectInfo.paths[0],
                        alternativePaths: objectInfo.paths.slice(1),
                        accessRecommendation: 'Multiple access paths available'
                    });
                }
            }
            
            return patterns;
            
        } catch (exc) {
            return [];
        }
    };
    
    return atlas;
}

/**
 * Create circular reference mapper
 * @returns {Object} Circular reference mapper with analysis methods
 */
function createCircularReferenceMapper() {
    var mapper = {
        circularReferences: [],
        patterns: {},
        statistics: {
            totalCircular: 0,
            pathCircular: 0,
            objectCircular: 0,
            lastUpdate: getCurrentTimestamp()
        }
    };
    
    mapper.recordCircularReference = function(currentPath, parentPaths, circularType) {
        try {
            var circularRef = {
                path: currentPath,
                parentPaths: parentPaths.slice(),
                type: circularType,
                timestamp: getCurrentTimestamp()
            };
            
            this.circularReferences.push(circularRef);
            this.statistics.totalCircular++;
            
            if (circularType === 'path') {
                this.statistics.pathCircular++;
            } else if (circularType === 'object') {
                this.statistics.objectCircular++;
            }
            
            // Track patterns
            var pathPattern = this.extractPathPattern(currentPath);
            if (!this.patterns[pathPattern]) {
                this.patterns[pathPattern] = 0;
            }
            this.patterns[pathPattern]++;
            
            this.statistics.lastUpdate = getCurrentTimestamp();
            
            return true;
            
        } catch (exc) {
            return false;
        }
    };
    
    mapper.extractPathPattern = function(path) {
        try {
            var components = splitPath(path);
            if (components.length <= 2) {
                return path;
            }
            
            // Extract meaningful pattern
            return components[0] + '.*.' + components[components.length - 1];
            
        } catch (exc) {
            return 'unknown';
        }
    };
    
    mapper.analyzePatterns = function() {
        try {
            var analysis = {
                mostCommonPattern: null,
                patternCount: 0,
                allPatterns: []
            };
            
            var maxCount = 0;
            var mostCommon = null;
            
            for (var pattern in this.patterns) {
                var count = this.patterns[pattern];
                
                analysis.allPatterns.push({
                    pattern: pattern,
                    count: count
                });
                
                if (count > maxCount) {
                    maxCount = count;
                    mostCommon = pattern;
                }
            }
            
            analysis.mostCommonPattern = mostCommon;
            analysis.patternCount = maxCount;
            
            return analysis;
            
        } catch (exc) {
            return {
                mostCommonPattern: null,
                patternCount: 0,
                allPatterns: []
            };
        }
    };
    
    mapper.getStatistics = function() {
        return {
            totalCircular: this.statistics.totalCircular,
            pathCircular: this.statistics.pathCircular,
            objectCircular: this.statistics.objectCircular,
            patterns: Object.keys(this.patterns).length,
            lastUpdate: this.statistics.lastUpdate
        };
    };
    
    return mapper;
}

/**
 * Create deep mapping session container
 * @returns {Object} Deep mapping session object
 */
function createDeepMappingSession() {
    return {
        metadata: {},
        statistics: {
            totalNodes: 0,
            totalProperties: 0,
            circularReferences: 0,
            mappingErrors: 0,
            maxDepthReached: 0,
            mappingTime: 0,
            memoryReport: null
        },
        structure: {
            document: null
        },
        objectAtlas: null,
        circularReferenceMapper: null,
        pathIndex: {}
    };
}

/**
 * Create enhanced DOM node for deep mapping
 * @param {String} name - Object name
 * @param {String} path - Object path
 * @param {String} objType - Object type
 * @param {Number} depth - Depth level
 * @returns {Object} Enhanced DOMNode object
 */
function createDeepDOMNode(name, path, objType, depth) {
    return {
        name: name,
        path: path,
        type: objType,
        depth: depth,
        objectId: generateObjectReferenceID({ path: path, type: objType }),
        properties: [],
        collections: [],
        methods: [],
        childNodes: [],
        objectMetadata: {
            isCircular: false,
            circularType: '',
            propertyCount: 0,
            mappingTimestamp: getCurrentTimestamp(),
            deepMappingFeatures: {
                exhaustiveTraversal: true,
                atlasTracked: true,
                circularDetected: false
            }
        }
    };
}

/**
 * Create error deep DOM node
 * @param {String} name - Object name
 * @param {String} path - Object path
 * @param {String} errorType - Error type
 * @param {Number} depth - Depth level
 * @returns {Object} Error deep DOM node
 */
function createErrorDeepDOMNode(name, path, errorType, depth) {
    var errorNode = createDeepDOMNode(name, path, 'error', depth);
    errorNode.objectMetadata.errorType = errorType;
    errorNode.objectMetadata.errorTime = getCurrentTimestamp();
    return errorNode;
}

/**
 * Create error deep mapping session
 * @param {String} errorMessage - Error message
 * @returns {Object} Error deep mapping session
 */
function createErrorDeepMappingSession(errorMessage) {
    var errorSession = createDeepMappingSession();
    errorSession.metadata.error = errorMessage;
    errorSession.metadata.timestamp = getCurrentTimestamp();
    return errorSession;
}

// =============================================================================
// QUICK ACCESS FUNCTIONS
// =============================================================================

/**
 * Quick deep mapping with default configuration
 * @param {Object} documentObj - Document to map
 * @returns {Object} Deep mapping session
 */
function quickDeepMap(documentObj) {
    var config = {
        maxDepth: 4,
        timeoutMs: 15000,
        maxTotalObjects: 5000,
        trackAllPaths: true,
        enableObjectAtlas: true,
        deduplicateReferences: true,
        mapCircularReferences: true
    };
    
    return performDeepDOMMapping(documentObj, config);
}

/**
 * Conservative deep mapping for large documents
 * @param {Object} documentObj - Document to map
 * @returns {Object} Deep mapping session
 */
function conservativeDeepMap(documentObj) {
    var config = {
        maxDepth: 3,
        timeoutMs: 20000,
        maxTotalObjects: 3000,
        trackAllPaths: false,
        enableObjectAtlas: true,
        deduplicateReferences: true,
        mapCircularReferences: false
    };
    
    return performDeepDOMMapping(documentObj, config);
}

/**
 * Aggressive deep mapping for comprehensive analysis
 * @param {Object} documentObj - Document to map
 * @returns {Object} Deep mapping session
 */
function aggressiveDeepMap(documentObj) {
    var config = {
        maxDepth: 8,
        timeoutMs: 60000,
        maxTotalObjects: 20000,
        trackAllPaths: true,
        enableObjectAtlas: true,
        deduplicateReferences: true,
        mapCircularReferences: true,
        includeSystemObjects: true,
        enableProgressReporting: true
    };
    
    return performDeepDOMMapping(documentObj, config);
}

// =============================================================================
// DEEP MAPPING ANALYSIS FUNCTIONS
// =============================================================================

/**
 * Perform comprehensive analysis of deep mapping session
 * @param {Object} deepMappingSession - Deep mapping session
 * @param {Object} config - Analysis configuration
 * @returns {Object} Complete analysis results
 */
function analyzeDeepMappingSession(deepMappingSession, config) {
    var startTime = new Date().getTime();
    var analysisConfig = config || DEFAULT_ANALYSIS_CONFIG;
    
    try {
        if (!deepMappingSession || !deepMappingSession.structure) {
            return createErrorAnalysisResult('Invalid deep mapping session');
        }
        
        var analysis = {
            metadata: {
                analysisTimestamp: getCurrentTimestamp(),
                sessionTimestamp: deepMappingSession.metadata.timestamp,
                analysisTime: 0,
                config: analysisConfig
            },
            summary: generateExecutiveSummary(deepMappingSession, null, analysisConfig),
            objectAnalysis: null,
            accessPatterns: null,
            circularAnalysis: null,
            performanceAnalysis: null,
            developerGuide: null
        };
        
        // Perform different types of analysis based on configuration
        if (analysisConfig.generateObjectReport) {
            analysis.objectAnalysis = analyzeObjects(deepMappingSession, analysisConfig);
        }
        
        if (analysisConfig.generateAccessReport) {
            analysis.accessPatterns = analyzeAccessPatterns(deepMappingSession, analysisConfig);
        }
        
        if (analysisConfig.generateCircularReport && deepMappingSession.circularReferenceMapper) {
            analysis.circularAnalysis = analyzeCircularReferences(deepMappingSession, analysisConfig);
        }
        
        if (analysisConfig.analyzePerformance) {
            analysis.performanceAnalysis = analyzePerformance(deepMappingSession, analysisConfig);
        }
        
        if (analysisConfig.includeDeveloperGuide) {
            analysis.developerGuide = generateDeveloperGuide(deepMappingSession, analysis, analysisConfig);
        }
        
        analysis.metadata.analysisTime = new Date().getTime() - startTime;
        
        return analysis;
        
    } catch (exc) {
        return createErrorAnalysisResult('Analysis failed: ' + exc.message);
    }
}

/**
 * Analyze objects and their relationships
 * @param {Object} session - Deep mapping session
 * @param {Object} config - Configuration
 * @returns {Object} Object analysis results
 */
function analyzeObjects(session, config) {
    try {
        var analysis = {
            totalObjects: session.statistics.totalNodes || 0,
            objectTypes: {},
            depthDistribution: {},
            complexityAnalysis: {},
            duplicateObjects: 0,
            recommendations: []
        };
        
        if (session.objectAtlas) {
            var atlasStats = session.objectAtlas.getStatistics();
            analysis.duplicateObjects = atlasStats.duplicateReferences;
            
            // Generate access patterns
            var accessPatterns = session.objectAtlas.generateAccessPatterns();
            analysis.accessPatternCount = accessPatterns.length;
        }
        
        // Analyze object types and depths
        if (session.structure && session.structure.document) {
            analyzeNodeTypes(session.structure.document, analysis);
        }
        
        // Generate recommendations
        if (analysis.duplicateObjects > 0) {
            analysis.recommendations.push({
                type: 'optimization',
                message: 'Found ' + analysis.duplicateObjects + ' duplicate object references. Consider object reuse patterns.',
                priority: 'medium'
            });
        }
        
        if (analysis.totalObjects > 5000) {
            analysis.recommendations.push({
                type: 'performance',
                message: 'Large object count detected. Consider focused analysis on specific document sections.',
                priority: 'low'
            });
        }
        
        return analysis;
        
    } catch (exc) {
        return {
            totalObjects: 0,
            objectTypes: {},
            depthDistribution: {},
            error: exc.message
        };
    }
}

/**
 * Analyze access patterns for developer guidance
 * @param {Object} session - Deep mapping session
 * @param {Object} config - Configuration
 * @returns {Object} Access pattern analysis results
 */
function analyzeAccessPatterns(session, config) {
    try {
        var analysis = {
            safeAccessPaths: [],
            riskyAccessPaths: [],
            collectionAccessPatterns: [],
            recommendedPatterns: [],
            codeExamples: []
        };
        
        if (session.structure && session.structure.document) {
            extractAccessPatterns(session.structure.document, analysis, config);
        }
        
        // Generate code examples
        if (config.includeCodeExamples && analysis.safeAccessPaths.length > 0) {
            analysis.codeExamples = generateAccessCodeExamples(analysis.safeAccessPaths, config);
        }
        
        return analysis;
        
    } catch (exc) {
        return {
            safeAccessPaths: [],
            riskyAccessPaths: [],
            error: exc.message
        };
    }
}

/**
 * Analyze circular references in detail
 * @param {Object} session - Deep mapping session
 * @param {Object} config - Configuration
 * @returns {Object} Circular reference analysis
 */
function analyzeCircularReferences(session, config) {
    try {
        var analysis = {
            totalCircular: 0,
            patterns: [],
            recommendations: []
        };
        
        if (session.circularReferenceMapper) {
            var circularStats = session.circularReferenceMapper.getStatistics();
            analysis.totalCircular = circularStats.totalCircular;
            
            var patternAnalysis = session.circularReferenceMapper.analyzePatterns();
            analysis.patterns = patternAnalysis.allPatterns;
            
            if (analysis.totalCircular > 0) {
                analysis.recommendations.push({
                    type: 'warning',
                    message: 'Circular references detected. Use careful traversal to avoid infinite loops.',
                    priority: 'high'
                });
                
                if (patternAnalysis.mostCommonPattern) {
                    analysis.recommendations.push({
                        type: 'info',
                        message: 'Most common circular pattern: ' + patternAnalysis.mostCommonPattern,
                        priority: 'medium'
                    });
                }
            }
        }
        
        return analysis;
        
    } catch (exc) {
        return {
            totalCircular: 0,
            patterns: [],
            error: exc.message
        };
    }
}

/**
 * Analyze performance metrics from deep mapping
 * @param {Object} session - Deep mapping session
 * @param {Object} config - Configuration
 * @returns {Object} Performance analysis
 */
function analyzePerformance(session, config) {
    try {
        var analysis = {
            mappingTime: session.statistics.mappingTime || 0,
            nodesPerSecond: 0,
            memoryEfficiency: 'unknown',
            scalabilityAssessment: 'unknown',
            recommendations: []
        };
        
        // Calculate performance metrics
        if (analysis.mappingTime > 0) {
            analysis.nodesPerSecond = Math.floor((session.statistics.totalNodes || 0) / (analysis.mappingTime / 1000));
        }
        
        // Memory analysis
        if (session.statistics.memoryReport) {
            var memoryReport = session.statistics.memoryReport;
            analysis.memoryCheckpoints = memoryReport.totalCheckpoints;
            analysis.memoryEfficiency = memoryReport.totalElapsed < 30000 ? 'good' : 'needs_improvement';
        }
        
        // Scalability assessment
        var nodeCount = session.statistics.totalNodes || 0;
        if (nodeCount < 1000) {
            analysis.scalabilityAssessment = 'excellent';
        } else if (nodeCount < 5000) {
            analysis.scalabilityAssessment = 'good';
        } else if (nodeCount < 10000) {
            analysis.scalabilityAssessment = 'moderate';
        } else {
            analysis.scalabilityAssessment = 'challenging';
        }
        
        // Generate recommendations
        if (analysis.mappingTime > 30000) {
            analysis.recommendations.push({
                type: 'performance',
                message: 'Long mapping time detected. Consider reducing maxDepth or maxTotalObjects.',
                priority: 'medium'
            });
        }
        
        if (nodeCount > 10000) {
            analysis.recommendations.push({
                type: 'optimization',
                message: 'Very large object count. Consider using conservativeDeepMap() for better performance.',
                priority: 'high'
            });
        }
        
        return analysis;
        
    } catch (exc) {
        return {
            mappingTime: 0,
            nodesPerSecond: 0,
            error: exc.message
        };
    }
}

// =============================================================================
// REPORT GENERATION FUNCTIONS
// =============================================================================

/**
 * Generate executive summary
 * @param {Object} session - Deep mapping session
 * @param {Object} analysisResult - Analysis result
 * @param {Object} config - Configuration
 * @returns {String} Executive summary
 */
function generateExecutiveSummary(session, analysisResult, config) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('DEEP DOM MAPPING - EXECUTIVE SUMMARY');
        builder.appendLine('===================================');
        builder.appendLine('');
        
        // Basic statistics
        builder.appendLine('MAPPING OVERVIEW');
        builder.appendLine('---------------');
        builder.appendLine('Document: ' + (session.metadata.documentName || 'Unknown'));
        builder.appendLine('Total Objects Mapped: ' + (session.statistics.totalNodes || 0));
        builder.appendLine('Total Properties: ' + (session.statistics.totalProperties || 0));
        builder.appendLine('Maximum Depth Reached: ' + (session.statistics.maxDepthReached || 0));
        builder.appendLine('Mapping Time: ' + (session.statistics.mappingTime || 0) + 'ms');
        builder.appendLine('');
        
        // Advanced features summary
        builder.appendLine('ADVANCED FEATURES');
        builder.appendLine('----------------');
        builder.appendLine('Object Atlas: ' + (session.objectAtlas ? 'Enabled' : 'Disabled'));
        builder.appendLine('Circular Detection: ' + (session.circularReferenceMapper ? 'Enabled' : 'Disabled'));
        
        if (session.objectAtlas) {
            var atlasStats = session.objectAtlas.getStatistics();
            builder.appendLine('Duplicate References: ' + atlasStats.duplicateReferences);
        }
        
        if (session.circularReferenceMapper) {
            var circularStats = session.circularReferenceMapper.getStatistics();
            builder.appendLine('Circular References: ' + circularStats.totalCircular);
        }
        
        builder.appendLine('');
        
        // Key findings
        builder.appendLine('KEY FINDINGS');
        builder.appendLine('------------');
        
        if (session.statistics.totalNodes > 5000) {
            builder.appendLine('• Large document structure detected');
        }
        
        if (session.statistics.circularReferences > 0) {
            builder.appendLine('• Circular references found - use caution in traversal');
        }
        
        if (session.statistics.mappingErrors > 0) {
            builder.appendLine('• ' + session.statistics.mappingErrors + ' mapping errors encountered');
        }
        
        builder.appendLine('• Deep mapping completed successfully');
        builder.appendLine('');
        
        return builder.toString();
        
    } catch (exc) {
        return 'Error generating executive summary: ' + exc.message;
    }
}

/**
 * Generate developer guide with code examples
 * @param {Object} session - Deep mapping session
 * @param {Object} analysisResult - Analysis result
 * @param {Object} config - Configuration
 * @returns {String} Developer guide
 */
function generateDeveloperGuide(session, analysisResult, config) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('DEEP DOM MAPPING - DEVELOPER GUIDE');
        builder.appendLine('==================================');
        builder.appendLine('');
        
        // Safe access patterns
        builder.appendLine('SAFE ACCESS PATTERNS');
        builder.appendLine('-------------------');
        builder.appendLine('Based on the deep mapping analysis, here are recommended safe access patterns:');
        builder.appendLine('');
        
        // Basic document access
        builder.appendLine('// Basic Document Access');
        builder.appendLine('var doc = app.activeDocument;');
        builder.appendLine('if (doc && typeof doc === "object") {');
        builder.appendLine('    $.writeln("Document loaded: " + doc.name);');
        builder.appendLine('}');
        builder.appendLine('');
        
        // Collection iteration based on discovered collections
        if (session.structure && session.structure.document) {
            var discoveredCollections = findCollectionsInDeepNode(session.structure.document);
            
            if (discoveredCollections.length > 0) {
                builder.appendLine('// Collection Iteration Patterns');
                for (var i = 0; i < Math.min(discoveredCollections.length, 3); i++) {
                    var collection = discoveredCollections[i];
                    builder.appendLine('// Accessing ' + collection.name + ':');
                    builder.appendLine('if (doc && "' + collection.name + '" in doc) {');
                    builder.appendLine('    var collection = doc.' + collection.name + ';');
                    builder.appendLine('    for (var i = 0; i < collection.length; i++) {');
                    builder.appendLine('        try {');
                    builder.appendLine('            var item = collection[i];');
                    builder.appendLine('            // Process item safely');
                    builder.appendLine('        } catch (e) {');
                    builder.appendLine('            // Handle individual item errors');
                    builder.appendLine('        }');
                    builder.appendLine('    }');
                    builder.appendLine('}');
                    builder.appendLine('');
                }
            }
        }
        
        // Circular reference handling
        if (session.circularReferenceMapper && session.statistics.circularReferences > 0) {
            builder.appendLine('// Circular Reference Prevention');
            builder.appendLine('function safeTraversal(obj, visitedPaths) {');
            builder.appendLine('    visitedPaths = visitedPaths || [];');
            builder.appendLine('    if (visitedPaths.indexOf(obj) !== -1) {');
            builder.appendLine('        return; // Circular reference detected');
            builder.appendLine('    }');
            builder.appendLine('    visitedPaths.push(obj);');
            builder.appendLine('    // Process object safely');
            builder.appendLine('    visitedPaths.pop();');
            builder.appendLine('}');
            builder.appendLine('');
        }
        
        // Performance recommendations
        builder.appendLine('PERFORMANCE RECOMMENDATIONS');
        builder.appendLine('--------------------------');
        builder.appendLine('• Use timeout protection for long operations');
        builder.appendLine('• Check object existence before property access');
        builder.appendLine('• Implement progress reporting for user feedback');
        builder.appendLine('• Consider memory cleanup for large operations');
        builder.appendLine('');
        
        return builder.toString();
        
    } catch (exc) {
        return 'Error generating developer guide: ' + exc.message;
    }
}

// =============================================================================
// QUICK ANALYSIS FUNCTIONS
// =============================================================================

/**
 * Quick analysis with default configuration
 * @param {Object} deepMappingSession - Deep mapping session
 * @returns {Object} Analysis results
 */
function quickAnalyzeSession(deepMappingSession) {
    var config = {
        generateObjectReport: true,
        generateAccessReport: true,
        generateCircularReport: true,
        analyzePerformance: false,
        includeDeveloperGuide: false,
        maxReportItems: 100
    };
    
    return analyzeDeepMappingSession(deepMappingSession, config);
}

/**
 * Comprehensive analysis with all features
 * @param {Object} deepMappingSession - Deep mapping session
 * @returns {Object} Complete analysis results
 */
function comprehensiveAnalysis(deepMappingSession) {
    return analyzeDeepMappingSession(deepMappingSession, DEFAULT_ANALYSIS_CONFIG);
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get deep mapping statistics
 * @param {Object} session - Deep mapping session
 * @returns {Object} Comprehensive statistics with atlas data
 */
function getDeepMappingStatistics(session) {
    try {
        var stats = {
            mappingEnabled: !!session,
            totalNodes: session.statistics.totalNodes || 0,
            totalProperties: session.statistics.totalProperties || 0,
            maxDepthReached: session.statistics.maxDepthReached || 0,
            mappingTime: session.statistics.mappingTime || 0,
            circularReferences: session.statistics.circularReferences || 0,
            mappingErrors: session.statistics.mappingErrors || 0,
            atlasEnabled: !!session.objectAtlas,
            atlasStatistics: null
        };
        
        if (session.objectAtlas) {
            stats.atlasStatistics = session.objectAtlas.getStatistics();
        }
        
        return stats;
        
    } catch (exc) {
        return {
            mappingEnabled: false,
            totalNodes: 0,
            totalProperties: 0,
            maxDepthReached: 0,
            mappingTime: 0,
            error: exc.message
        };
    }
}

/**
 * Find collections in deep node recursively
 * @param {Object} node - Deep DOM node
 * @returns {Array} Array of discovered collections
 */
function findCollectionsInDeepNode(node) {
    var collections = [];
    
    try {
        if (!node) {
            return collections;
        }
        
        // Add collections from this node
        if (node.collections && node.collections.length) {
            for (var i = 0; i < node.collections.length; i++) {
                collections.push(node.collections[i]);
            }
        }
        
        // Recursively search child nodes
        if (node.childNodes && node.childNodes.length) {
            for (var j = 0; j < node.childNodes.length; j++) {
                var childCollections = findCollectionsInDeepNode(node.childNodes[j]);
                collections = collections.concat(childCollections);
            }
        }
        
        return collections;
        
    } catch (exc) {
        return collections;
    }
}

/**
 * Analyze node types recursively
 * @param {Object} node - Deep DOM node
 * @param {Object} analysis - Analysis object to update
 */
function analyzeNodeTypes(node, analysis) {
    try {
        if (!node) {
            return;
        }
        
        // Count node types
        var nodeType = node.type || 'unknown';
        if (!analysis.objectTypes[nodeType]) {
            analysis.objectTypes[nodeType] = 0;
        }
        analysis.objectTypes[nodeType]++;
        
        // Count depth distribution
        var depth = node.depth || 0;
        if (!analysis.depthDistribution[depth]) {
            analysis.depthDistribution[depth] = 0;
        }
        analysis.depthDistribution[depth]++;
        
        // Recursively analyze child nodes
        if (node.childNodes && node.childNodes.length) {
            for (var i = 0; i < node.childNodes.length; i++) {
                analyzeNodeTypes(node.childNodes[i], analysis);
            }
        }
        
    } catch (exc) {
        // Continue analysis
    }
}

/**
 * Extract access patterns from deep node
 * @param {Object} node - Deep DOM node
 * @param {Object} analysis - Analysis object to update
 * @param {Object} config - Configuration
 */
function extractAccessPatterns(node, analysis, config) {
    try {
        if (!node) {
            return;
        }
        
        // Extract safe access paths
        if (node.properties) {
            for (var i = 0; i < node.properties.length; i++) {
                var prop = node.properties[i];
                if (prop.safetyLevel === 'safe') {
                    analysis.safeAccessPaths.push({
                        path: prop.path,
                        type: prop.type,
                        name: prop.name
                    });
                } else if (prop.safetyLevel === 'risky' || prop.safetyLevel === 'dangerous') {
                    analysis.riskyAccessPaths.push({
                        path: prop.path,
                        type: prop.type,
                        name: prop.name,
                        safetyLevel: prop.safetyLevel
                    });
                }
            }
        }
        
        // Extract collection access patterns
        if (node.collections) {
            for (var j = 0; j < node.collections.length; j++) {
                var collection = node.collections[j];
                analysis.collectionAccessPatterns.push({
                    path: collection.path,
                    name: collection.name,
                    safetyLevel: collection.safetyLevel
                });
            }
        }
        
        // Recursively extract from child nodes
        if (node.childNodes && node.childNodes.length) {
            for (var k = 0; k < node.childNodes.length; k++) {
                extractAccessPatterns(node.childNodes[k], analysis, config);
            }
        }
        
    } catch (exc) {
        // Continue extraction
    }
}

/**
 * Generate access code examples
 * @param {Array} safeAccessPaths - Array of safe access paths
 * @param {Object} config - Configuration
 * @returns {Array} Array of code examples
 */
function generateAccessCodeExamples(safeAccessPaths, config) {
    var examples = [];
    
    try {
        var maxExamples = Math.min(safeAccessPaths.length, 5);
        
        for (var i = 0; i < maxExamples; i++) {
            var path = safeAccessPaths[i];
            var example = {
                description: 'Access ' + path.name + ' (' + path.type + ')',
                code: 'if (obj && "' + path.name + '" in obj) {\n' +
                      '    var value = obj.' + path.name + ';\n' +
                      '    // Use value safely\n' +
                      '}'
            };
            
            examples.push(example);
        }
        
        return examples;
        
    } catch (exc) {
        return [];
    }
}

/**
 * Create error analysis result
 * @param {String} errorMessage - Error message
 * @returns {Object} Error analysis result
 */
function createErrorAnalysisResult(errorMessage) {
    return {
        metadata: {
            analysisTimestamp: getCurrentTimestamp(),
            error: errorMessage
        },
        summary: 'Analysis failed: ' + errorMessage,
        objectAnalysis: null,
        accessPatterns: null,
        circularAnalysis: null,
        performanceAnalysis: null,
        developerGuide: null
    };
}

// =============================================================================
// END OF 8.0_deep-mapper.jsx
// =============================================================================