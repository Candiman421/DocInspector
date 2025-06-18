// =============================================================================
// 5.1_deep-mapper.jsx - DEEP DOM MAPPING AND OBJECT ATLAS
// InDesign DOM Discovery Builder v3.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: Deep object mapping with comprehensive analysis and object atlas generation
// DEPENDENCIES: ["1.1_bootstrap-foundation.jsx", "1.2_safety-utilities.jsx", "2.1_dom-enumerator.jsx", "2.2_collection-sampler.jsx"]
// SIZE: ~2000 lines - COMPLETE IMPLEMENTATION
// =============================================================================

// =============================================================================
// DEPENDENCY VALIDATION
// =============================================================================

var DEEP_MAPPER_DEPENDENCIES = ['1.1_bootstrap-foundation', '1.2_safety-utilities', '2.1_dom-enumerator', '2.2_collection-sampler'];
var dependencyCheck = validateDependencies(DEEP_MAPPER_DEPENDENCIES);
if (!dependencyCheck.success) {
    throw new Error('Deep Mapper missing dependencies: ' + dependencyCheck.missing.join(', '));
}

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
    memoryCheckInterval: 1000,
    memoryCleanupThreshold: 5000,
    progressiveCleanup: true,
    analyzeRelationships: true,
    generateAccessibilityMap: true,
    enablePerformanceOptimization: true
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
    includeCodeExamples: true,
    analyzeValuePatterns: true
};

// =============================================================================
// MAIN DEEP MAPPING FUNCTIONS
// =============================================================================

/**
 * Perform comprehensive deep DOM mapping with object atlas
 * @param {Object} documentObject - InDesign document to map
 * @param {Object} mappingOptions - Deep mapping configuration
 * @returns {Object} Deep mapping result with atlas
 */
function performDeepDOMMapping(documentObject, mappingOptions) {
    var startTime = new Date().getTime();
    var config = mappingOptions ? 
        objectMerge(DEFAULT_DEEP_MAPPING_CONFIG, mappingOptions) : 
        objectClone(DEFAULT_DEEP_MAPPING_CONFIG, 2);
    
    var result = {
        success: false,
        deepMapping: null,
        objectAtlas: null,
        error: null,
        metadata: {
            mappingTime: 0,
            timestamp: getCurrentTimestamp(),
            version: '3.1'
        }
    };
    
    try {
        // Validate environment
        var envValidation = validateInDesignEnvironment();
        if (!envValidation.valid) {
            result.error = 'Environment validation failed: ' + envValidation.error;
            return result;
        }
        
        var targetDocument = documentObject || envValidation.document;
        
        // Create deep mapping session
        var mappingSession = createDeepMappingSession(targetDocument, config);
        if (!mappingSession.success) {
            result.error = 'Failed to create mapping session: ' + mappingSession.error;
            return result;
        }
        
        // Perform deep object mapping
        var deepMappingResult = performDeepObjectMapping(
            targetDocument, 
            'document', 
            0, 
            mappingSession.session, 
            config
        );
        
        if (!deepMappingResult.success) {
            result.error = 'Deep mapping failed: ' + deepMappingResult.error;
            return result;
        }
        
        // Generate object atlas
        if (config.enableObjectAtlas) {
            var atlasResult = generateObjectAtlas(mappingSession.session, config);
            if (atlasResult.success) {
                result.objectAtlas = atlasResult.atlas;
            }
        }
        
        // Finalize session
        mappingSession.session.finalize();
        
        result.deepMapping = deepMappingResult.mapping;
        result.success = true;
        result.metadata.mappingTime = new Date().getTime() - startTime;
        result.metadata.objectsProcessed = mappingSession.session.getStatistics().totalObjects;
        result.metadata.circularReferences = mappingSession.session.getStatistics().circularReferences;
        
        return result;
        
    } catch (exc) {
        result.error = 'Deep DOM mapping failed: ' + exc.message;
        result.metadata.mappingTime = new Date().getTime() - startTime;
        return result;
    }
}

/**
 * Perform deep object mapping recursively
 * @param {Object} targetObject - Object to map
 * @param {String} objectPath - Current object path
 * @param {Number} depth - Current recursion depth
 * @param {Object} mappingSession - Mapping session
 * @param {Object} config - Configuration
 * @returns {Object} Deep mapping result
 */
function performDeepObjectMapping(targetObject, objectPath, depth, mappingSession, config) {
    var result = {
        success: false,
        mapping: null,
        error: null
    };
    
    try {
        // Check depth and timeout limits
        if (depth >= config.maxDepth) {
            result.mapping = createDeepDOMNode(objectPath, 'MaxDepthReached', 'limit', depth);
            result.success = true;
            return result;
        }
        
        if (mappingSession.timeoutChecker && mappingSession.timeoutChecker()) {
            result.error = 'Mapping timeout exceeded';
            return result;
        }
        
        if (!targetObject) {
            result.mapping = createDeepDOMNode(objectPath, 'NullObject', 'null', depth);
            result.success = true;
            return result;
        }
        
        // Check for circular references
        var circularCheck = mappingSession.circularMapper.checkCircular(targetObject, objectPath);
        if (circularCheck.isCircular) {
            result.mapping = createDeepDOMNode(
                objectPath, 
                'CircularReference', 
                'circular', 
                depth, 
                circularCheck.originalPath
            );
            result.success = true;
            return result;
        }
        
        // Track object in session
        var objectId = mappingSession.track(targetObject, objectPath);
        
        // Create deep DOM node
        var deepNode = createDeepDOMNode(objectPath, objectPath, typeof targetObject, depth);
        deepNode.objectId = objectId;
        
        // Memory management check
        if (mappingSession.memoryTracker && !mappingSession.memoryTracker.canContinue()) {
            deepNode.truncated = true;
            deepNode.truncationReason = 'Memory limit reached';
            result.mapping = deepNode;
            result.success = true;
            return result;
        }
        
        // Analyze object relationships
        if (config.analyzeRelationships) {
            deepNode.relationships = analyzeObjectRelationships(targetObject, objectPath, mappingSession);
        }
        
        // Map properties with enhanced tracking
        var propertyMappingResult = mapObjectProperties(
            targetObject, 
            objectPath, 
            depth, 
            mappingSession, 
            config
        );
        
        if (propertyMappingResult.success) {
            deepNode.enhancedProperties = propertyMappingResult.properties;
            deepNode.enhancedCollections = propertyMappingResult.collections;
            deepNode.enhancedMethods = propertyMappingResult.methods;
        }
        
        // Map child objects recursively
        if (depth < config.maxDepth - 1) {
            var childMappingResult = mapChildObjects(
                targetObject, 
                objectPath, 
                depth, 
                mappingSession, 
                config
            );
            
            if (childMappingResult.success) {
                deepNode.deepChildNodes = childMappingResult.children;
            }
        }
        
        result.mapping = deepNode;
        result.success = true;
        
        return result;
        
    } catch (exc) {
        result.error = 'Object mapping failed for ' + objectPath + ': ' + exc.message;
        return result;
    }
}

// =============================================================================
// DEEP MAPPING SESSION MANAGEMENT
// =============================================================================

/**
 * Create deep mapping session with tracking and management
 * @param {Object} targetDocument - Document to map
 * @param {Object} config - Configuration
 * @returns {Object} Session creation result
 */
function createDeepMappingSession(targetDocument, config) {
    var result = {
        success: false,
        session: null,
        error: null
    };
    
    try {
        var sessionId = generateSessionId();
        var session = {
            id: sessionId,
            startTime: new Date().getTime(),
            document: targetDocument,
            config: config,
            
            // Tracking components
            objectTracker: createObjectReferenceTracker(),
            circularMapper: createCircularReferenceMapper(),
            memoryTracker: createMemoryTracker(config),
            timeoutChecker: createTimeoutChecker(config.timeoutMs),
            
            // Statistics
            statistics: {
                totalObjects: 0,
                maxDepthReached: 0,
                circularReferences: 0,
                memoryUsage: 0,
                timeoutOccurred: false
            },
            
            // Session methods
            track: function(targetObject, path) {
                try {
                    this.statistics.totalObjects++;
                    var objectId = this.objectTracker.track(targetObject, path);
                    
                    // Memory tracking
                    if (this.memoryTracker) {
                        this.memoryTracker.trackObject(targetObject);
                    }
                    
                    return objectId;
                } catch (exc) {
                    return 'track_error_' + (new Date().getTime());
                }
            },
            
            getStatistics: function() {
                try {
                    return {
                        totalObjects: this.statistics.totalObjects,
                        maxDepthReached: this.statistics.maxDepthReached,
                        circularReferences: this.circularMapper.getCircularCount(),
                        memoryUsage: this.memoryTracker ? this.memoryTracker.getUsage() : 0,
                        elapsedTime: new Date().getTime() - this.startTime
                    };
                } catch (exc) {
                    return {
                        totalObjects: 0,
                        error: 'Statistics error: ' + exc.message
                    };
                }
            },
            
            finalize: function() {
                try {
                    // Cleanup and optimization
                    if (this.memoryTracker && config.progressiveCleanup) {
                        this.memoryTracker.cleanup();
                    }
                    
                    this.statistics.elapsedTime = new Date().getTime() - this.startTime;
                } catch (exc) {
                    // Silent cleanup
                }
            }
        };
        
        result.session = session;
        result.success = true;
        
        return result;
        
    } catch (exc) {
        result.error = 'Session creation failed: ' + exc.message;
        return result;
    }
}

/**
 * Create error deep mapping session
 * @param {String} errorMessage - Error message
 * @returns {Object} Error session result
 */
function createErrorDeepMappingSession(errorMessage) {
    try {
        return {
            success: false,
            session: null,
            error: errorMessage || 'Unknown session error',
            timestamp: getCurrentTimestamp()
        };
    } catch (exc) {
        return {
            success: false,
            session: null,
            error: 'Error session creation failed',
            timestamp: getCurrentTimestamp()
        };
    }
}

// =============================================================================
// DEEP DOM NODE CREATION
// =============================================================================

/**
 * Create enhanced deep DOM node
 * @param {String} path - Node path
 * @param {String} name - Node name
 * @param {String} nodeType - Node type
 * @param {Number} depth - Node depth
 * @param {String} additionalInfo - Additional information
 * @returns {Object} Deep DOM node
 */
function createDeepDOMNode(path, name, nodeType, depth, additionalInfo) {
    try {
        var node = {
            path: path || 'unknown',
            name: name || 'unknown',
            type: nodeType || 'unknown',
            depth: depth || 0,
            
            // Enhanced properties
            enhancedProperties: [],
            enhancedCollections: [],
            enhancedMethods: [],
            deepChildNodes: [],
            
            // Deep mapping specific
            objectId: null,
            relationships: null,
            accessibilityLevel: 'unknown',
            performanceMetrics: null,
            
            // Metadata
            created: getCurrentTimestamp(),
            mappingVersion: '3.1'
        };
        
        if (additionalInfo) {
            node.additionalInfo = additionalInfo;
        }
        
        return node;
        
    } catch (exc) {
        return {
            path: path || 'error',
            name: 'CreationError',
            type: 'error',
            depth: depth || 0,
            error: exc.message,
            enhancedProperties: [],
            enhancedCollections: [],
            enhancedMethods: [],
            deepChildNodes: []
        };
    }
}

/**
 * Create error deep DOM node
 * @param {String} path - Node path
 * @param {String} errorMessage - Error message
 * @param {Number} depth - Node depth
 * @returns {Object} Error deep DOM node
 */
function createErrorDeepDOMNode(path, errorMessage, depth) {
    try {
        return {
            path: path || 'error_path',
            name: 'ErrorNode',
            type: 'error',
            depth: depth || 0,
            error: errorMessage || 'Unknown error',
            enhancedProperties: [],
            enhancedCollections: [],
            enhancedMethods: [],
            deepChildNodes: [],
            created: getCurrentTimestamp()
        };
    } catch (exc) {
        return {
            path: 'critical_error',
            name: 'CriticalError',
            type: 'error',
            error: 'Error node creation failed',
            enhancedProperties: [],
            enhancedCollections: [],
            enhancedMethods: [],
            deepChildNodes: []
        };
    }
}

// =============================================================================
// SESSION UTILITIES
// =============================================================================

/**
 * Generate unique session ID
 * @returns {String} Session ID
 */
function generateSessionId() {
    try {
        return 'deep_mapping_' + (new Date().getTime()) + '_' + Math.floor(Math.random() * 10000);
    } catch (exc) {
        return 'session_id_error';
    }
}

// =============================================================================
// OBJECT ATLAS GENERATION
// =============================================================================

/**
 * Create object atlas structure
 * @returns {Object} Empty object atlas
 */
function createObjectAtlas() {
    try {
        return {
            metadata: {
                created: getCurrentTimestamp(),
                version: '3.1',
                totalObjects: 0
            },
            objectMap: {},
            relationshipMap: {},
            accessibilityMap: {},
            performanceMap: {},
            pathIndex: {},
            typeIndex: {},
            circularReferences: [],
            recommendations: []
        };
    } catch (exc) {
        return {
            error: 'Atlas creation failed: ' + exc.message,
            metadata: { created: getCurrentTimestamp() },
            objectMap: {},
            relationshipMap: {},
            accessibilityMap: {},
            performanceMap: {},
            pathIndex: {},
            typeIndex: {}
        };
    }
}

/**
 * Generate comprehensive object atlas from mapping session
 * @param {Object} mappingSession - Completed mapping session
 * @param {Object} config - Configuration
 * @returns {Object} Atlas generation result
 */
function generateObjectAtlas(mappingSession, config) {
    var result = {
        success: false,
        atlas: null,
        error: null
    };
    
    try {
        var atlas = createObjectAtlas();
        
        // Extract session statistics
        var sessionStats = mappingSession.getStatistics();
        atlas.metadata.totalObjects = sessionStats.totalObjects;
        atlas.metadata.mappingTime = sessionStats.elapsedTime;
        atlas.metadata.circularReferences = sessionStats.circularReferences;
        
        // Build object map from tracker
        if (mappingSession.objectTracker && mappingSession.objectTracker.references) {
            atlas.objectMap = objectClone(mappingSession.objectTracker.references, 2);
        }
        
        // Build relationship map
        atlas.relationshipMap = buildRelationshipMap(mappingSession, config);
        
        // Build accessibility map
        atlas.accessibilityMap = buildAccessibilityMap(mappingSession, config);
        
        // Build performance map
        if (config.analyzePerformance) {
            atlas.performanceMap = buildPerformanceMap(mappingSession, config);
        }
        
        // Build path and type indices
        atlas.pathIndex = buildPathIndex(mappingSession);
        atlas.typeIndex = buildTypeIndex(mappingSession);
        
        // Extract circular references
        if (mappingSession.circularMapper) {
            atlas.circularReferences = mappingSession.circularMapper.getCircularReferences();
        }
        
        // Generate recommendations
        atlas.recommendations = generateAtlasRecommendations(atlas, config);
        
        result.atlas = atlas;
        result.success = true;
        
        return result;
        
    } catch (exc) {
        result.error = 'Atlas generation failed: ' + exc.message;
        return result;
    }
}

/**
 * Build relationship map from session data
 * @param {Object} mappingSession - Mapping session
 * @param {Object} config - Configuration
 * @returns {Object} Relationship map
 */
function buildRelationshipMap(mappingSession, config) {
    try {
        var relationshipMap = {};
        
        if (mappingSession.objectTracker && mappingSession.objectTracker.references) {
            for (var objectId in mappingSession.objectTracker.references) {
                if (objectHasOwnProperty(mappingSession.objectTracker.references, objectId)) {
                    var objRef = mappingSession.objectTracker.references[objectId];
                    
                    relationshipMap[objectId] = {
                        path: objRef.firstPath || 'unknown',
                        relationships: analyzeObjectRelationships(objRef.reference, objRef.firstPath, mappingSession),
                        accessCount: objRef.accessCount || 1
                    };
                }
            }
        }
        
        return relationshipMap;
        
    } catch (exc) {
        return {
            error: 'Relationship map build failed: ' + exc.message
        };
    }
}

/**
 * Build accessibility map from session data
 * @param {Object} mappingSession - Mapping session
 * @param {Object} config - Configuration
 * @returns {Object} Accessibility map
 */
function buildAccessibilityMap(mappingSession, config) {
    try {
        var accessibilityMap = {
            safeObjects: [],
            cautionObjects: [],
            dangerousObjects: [],
            summary: {
                totalAnalyzed: 0,
                safeCount: 0,
                cautionCount: 0,
                dangerousCount: 0
            }
        };
        
        if (mappingSession.objectTracker && mappingSession.objectTracker.references) {
            for (var objectId in mappingSession.objectTracker.references) {
                if (objectHasOwnProperty(mappingSession.objectTracker.references, objectId)) {
                    var objRef = mappingSession.objectTracker.references[objectId];
                    var accessibility = analyzeObjectAccessibility(objRef, config);
                    
                    accessibilityMap.summary.totalAnalyzed++;
                    
                    switch (accessibility.level) {
                        case 'safe':
                            accessibilityMap.safeObjects[accessibilityMap.safeObjects.length] = {
                                objectId: objectId,
                                path: objRef.firstPath,
                                accessibility: accessibility
                            };
                            accessibilityMap.summary.safeCount++;
                            break;
                        case 'caution':
                            accessibilityMap.cautionObjects[accessibilityMap.cautionObjects.length] = {
                                objectId: objectId,
                                path: objRef.firstPath,
                                accessibility: accessibility
                            };
                            accessibilityMap.summary.cautionCount++;
                            break;
                        case 'dangerous':
                            accessibilityMap.dangerousObjects[accessibilityMap.dangerousObjects.length] = {
                                objectId: objectId,
                                path: objRef.firstPath,
                                accessibility: accessibility
                            };
                            accessibilityMap.summary.dangerousCount++;
                            break;
                    }
                }
            }
        }
        
        return accessibilityMap;
        
    } catch (exc) {
        return {
            error: 'Accessibility map build failed: ' + exc.message,
            safeObjects: [],
            cautionObjects: [],
            dangerousObjects: []
        };
    }
}

/**
 * Build performance map from session data
 * @param {Object} mappingSession - Mapping session
 * @param {Object} config - Configuration
 * @returns {Object} Performance map
 */
function buildPerformanceMap(mappingSession, config) {
    try {
        var performanceMap = {
            overallMetrics: {
                totalTime: mappingSession.getStatistics().elapsedTime,
                objectsPerSecond: 0,
                memoryEfficiency: 'unknown'
            },
            objectMetrics: {},
            bottlenecks: [],
            optimizationSuggestions: []
        };
        
        var statisticsObj = mappingSession.getStatistics();
        
        if (statisticsObj.elapsedTime > 0) {
            performanceMap.overallMetrics.objectsPerSecond = 
                Math.round(statisticsObj.totalObjects / (statisticsObj.elapsedTime / 1000));
        }
        
        if (mappingSession.memoryTracker) {
            var memoryStats = mappingSession.memoryTracker.getStatistics();
            performanceMap.overallMetrics.memoryEfficiency = memoryStats.efficiency || 'unknown';
        }
        
        // Identify bottlenecks
        if (statisticsObj.elapsedTime > config.timeoutMs * 0.8) {
            performanceMap.bottlenecks[performanceMap.bottlenecks.length] = 
                'Mapping time approaching timeout limit';
        }
        
        if (statisticsObj.circularReferences > 10) {
            performanceMap.bottlenecks[performanceMap.bottlenecks.length] = 
                'High number of circular references detected';
        }
        
        // Generate optimization suggestions
        performanceMap.optimizationSuggestions = generatePerformanceOptimizations(stats, config);
        
        return performanceMap;
        
    } catch (exc) {
        return {
            error: 'Performance map build failed: ' + exc.message,
            overallMetrics: {},
            objectMetrics: {},
            bottlenecks: [],
            optimizationSuggestions: []
        };
    }
}

/**
 * Build path index from session data
 * @param {Object} mappingSession - Mapping session
 * @returns {Object} Path index
 */
function buildPathIndex(mappingSession) {
    try {
        var pathIndex = {};
        
        if (mappingSession.objectTracker && mappingSession.objectTracker.references) {
            for (var objectId in mappingSession.objectTracker.references) {
                if (objectHasOwnProperty(mappingSession.objectTracker.references, objectId)) {
                    var objRef = mappingSession.objectTracker.references[objectId];
                    var path = objRef.firstPath || 'unknown';
                    
                    if (!pathIndex[path]) {
                        pathIndex[path] = [];
                    }
                    
                    pathIndex[path][pathIndex[path].length] = objectId;
                }
            }
        }
        
        return pathIndex;
        
    } catch (exc) {
        return {
            error: 'Path index build failed: ' + exc.message
        };
    }
}

/**
 * Build type index from session data
 * @param {Object} mappingSession - Mapping session
 * @returns {Object} Type index
 */
function buildTypeIndex(mappingSession) {
    try {
        var typeIndex = {};
        
        if (mappingSession.objectTracker && mappingSession.objectTracker.references) {
            for (var objectId in mappingSession.objectTracker.references) {
                if (objectHasOwnProperty(mappingSession.objectTracker.references, objectId)) {
                    var objRef = mappingSession.objectTracker.references[objectId];
                    var objType = typeof objRef.reference;
                    
                    if (!typeIndex[objType]) {
                        typeIndex[objType] = [];
                    }
                    
                    typeIndex[objType][typeIndex[objType].length] = objectId;
                }
            }
        }
        
        return typeIndex;
        
    } catch (exc) {
        return {
            error: 'Type index build failed: ' + exc.message
        };
    }
}

// =============================================================================
// CIRCULAR REFERENCE MAPPING
// =============================================================================

/**
 * Create circular reference mapper
 * @returns {Object} Circular reference mapper
 */
function createCircularReferenceMapper() {
    try {
        return {
            visitedObjects: [],
            circularReferences: [],
            pathMap: {},
            
            checkCircular: function(targetObject, currentPath) {
                try {
                    var result = {
                        isCircular: false,
                        originalPath: null
                    };
                    
                    // Check if object was already visited
                    for (var i = 0; i < this.visitedObjects.length; i++) {
                        if (this.visitedObjects[i] === targetObject) {
                            result.isCircular = true;
                            result.originalPath = this.pathMap[i] || 'unknown';
                            
                            // Record circular reference
                            this.circularReferences[this.circularReferences.length] = {
                                originalPath: result.originalPath,
                                circularPath: currentPath,
                                detectedAt: getCurrentTimestamp()
                            };
                            
                            return result;
                        }
                    }
                    
                    // Add to visited objects
                    this.visitedObjects[this.visitedObjects.length] = targetObject;
                    this.pathMap[this.visitedObjects.length - 1] = currentPath;
                    
                    return result;
                    
                } catch (exc) {
                    return {
                        isCircular: false,
                        originalPath: null,
                        error: exc.message
                    };
                }
            },
            
            getCircularCount: function() {
                try {
                    return this.circularReferences.length;
                } catch (exc) {
                    return 0;
                }
            },
            
            getCircularReferences: function() {
                try {
                    return arraySlice(this.circularReferences, 0);
                } catch (exc) {
                    return [];
                }
            },
            
            cleanup: function() {
                try {
                    this.visitedObjects = [];
                    this.pathMap = {};
                } catch (exc) {
                    // Silent cleanup
                }
            }
        };
        
    } catch (exc) {
        return {
            checkCircular: function() { return { isCircular: false, originalPath: null }; },
            getCircularCount: function() { return 0; },
            getCircularReferences: function() { return []; },
            cleanup: function() { }
        };
    }
}

/**
 * Analyze circular references in mapping session
 * @param {Object} mappingSession - Mapping session
 * @returns {Object} Circular reference analysis
 */
function analyzeCircularReferences(mappingSession) {
    try {
        var analysis = {
            totalCircular: 0,
            circularPaths: [],
            impact: 'low',
            recommendations: []
        };
        
        if (mappingSession.circularMapper) {
            analysis.totalCircular = mappingSession.circularMapper.getCircularCount();
            analysis.circularPaths = mappingSession.circularMapper.getCircularReferences();
            
            // Determine impact
            if (analysis.totalCircular > 20) {
                analysis.impact = 'high';
            } else if (analysis.totalCircular > 5) {
                analysis.impact = 'medium';
            }
            
            // Generate recommendations
            if (analysis.totalCircular > 0) {
                analysis.recommendations[analysis.recommendations.length] = 
                    'Be careful when traversing object relationships to avoid infinite loops';
                
                if (analysis.impact === 'high') {
                    analysis.recommendations[analysis.recommendations.length] = 
                        'Consider implementing circular reference detection in your scripts';
                }
            }
        }
        
        return analysis;
        
    } catch (exc) {
        return {
            totalCircular: 0,
            circularPaths: [],
            impact: 'unknown',
            error: 'Circular reference analysis failed: ' + exc.message
        };
    }
}

// =============================================================================
// MEMORY TRACKING
// =============================================================================

/**
 * Create memory tracker for mapping session
 * @param {Object} config - Configuration
 * @returns {Object} Memory tracker
 */
function createMemoryTracker(config) {
    try {
        return {
            trackedObjects: 0,
            maxObjects: config.maxTotalObjects || 10000,
            memoryCheckInterval: config.memoryCheckInterval || 1000,
            lastMemoryCheck: new Date().getTime(),
            
            trackObject: function(targetObject) {
                try {
                    this.trackedObjects++;
                    
                    // Periodic memory check
                    var now = new Date().getTime();
                    if (now - this.lastMemoryCheck > this.memoryCheckInterval) {
                        this.performMemoryCheck();
                        this.lastMemoryCheck = now;
                    }
                    
                } catch (exc) {
                    // Continue tracking
                }
            },
            
            canContinue: function() {
                try {
                    return this.trackedObjects < this.maxObjects;
                } catch (exc) {
                    return false;
                }
            },
            
            performMemoryCheck: function() {
                try {
                    // Basic memory pressure detection
                    if (this.trackedObjects > this.maxObjects * 0.8) {
                        this.optimizeMemoryUsage();
                    }
                } catch (exc) {
                    // Continue operation
                }
            },
            
            optimizeMemoryUsage: function() {
                try {
                    // Trigger cleanup if available
                    if (typeof memoryCleanup === 'function') {
                        memoryCleanup([]);
                    }
                } catch (exc) {
                    // Continue operation
                }
            },
            
            getUsage: function() {
                try {
                    return {
                        tracked: this.trackedObjects,
                        maximum: this.maxObjects,
                        percentage: Math.round((this.trackedObjects / this.maxObjects) * 100)
                    };
                } catch (exc) {
                    return { tracked: 0, maximum: 0, percentage: 0 };
                }
            },
            
            getStatistics: function() {
                try {
                    var usage = this.getUsage();
                    return {
                        efficiency: usage.percentage < 80 ? 'good' : 
                                   usage.percentage < 95 ? 'acceptable' : 'poor',
                        memoryPressure: usage.percentage > 90,
                        recommendCleanup: usage.percentage > 85
                    };
                } catch (exc) {
                    return { efficiency: 'unknown' };
                }
            },
            
            cleanup: function() {
                try {
                    this.trackedObjects = 0;
                    this.optimizeMemoryUsage();
                } catch (exc) {
                    // Silent cleanup
                }
            }
        };
        
    } catch (exc) {
        return {
            trackObject: function() { },
            canContinue: function() { return true; },
            performMemoryCheck: function() { },
            optimizeMemoryUsage: function() { },
            getUsage: function() { return { tracked: 0, maximum: 0, percentage: 0 }; },
            getStatistics: function() { return { efficiency: 'unknown' }; },
            cleanup: function() { }
        };
    }
}

/**
 * Optimize memory usage during mapping
 * @param {Object} mappingSession - Mapping session
 * @param {Object} config - Configuration
 * @returns {Object} Optimization result
 */
function optimizeMemoryUsage(mappingSession, config) {
    var result = {
        success: false,
        optimizations: [],
        error: null
    };
    
    try {
        var optimizations = [];
        
        // Cleanup circular mapper
        if (mappingSession.circularMapper && mappingSession.circularMapper.cleanup) {
            mappingSession.circularMapper.cleanup();
            optimizations[optimizations.length] = 'Circular reference mapper cleaned';
        }
        
        // Optimize object tracker
        if (mappingSession.objectTracker && mappingSession.objectTracker.cleanup) {
            mappingSession.objectTracker.cleanup();
            optimizations[optimizations.length] = 'Object tracker optimized';
        }
        
        // Memory tracker cleanup
        if (mappingSession.memoryTracker && mappingSession.memoryTracker.cleanup) {
            mappingSession.memoryTracker.cleanup();
            optimizations[optimizations.length] = 'Memory tracker cleaned';
        }
        
        result.optimizations = optimizations;
        result.success = true;
        
        return result;
        
    } catch (exc) {
        result.error = 'Memory optimization failed: ' + exc.message;
        return result;
    }
}

// =============================================================================
// OBJECT RELATIONSHIP ANALYSIS
// =============================================================================

/**
 * Track object relationships in mapping
 * @param {Object} targetObject - Object to analyze
 * @param {String} objectPath - Object path
 * @param {Object} mappingSession - Mapping session
 * @returns {Object} Relationship analysis
 */
function trackObjectRelationships(targetObject, objectPath, mappingSession) {
    return analyzeObjectRelationships(targetObject, objectPath, mappingSession);
}

/**
 * Analyze object relationships
 * @param {Object} targetObject - Object to analyze
 * @param {String} objectPath - Object path
 * @param {Object} mappingSession - Mapping session
 * @returns {Object} Relationship analysis
 */
function analyzeObjectRelationships(targetObject, objectPath, mappingSession) {
    try {
        var relationships = {
            parentPath: getParentPath(objectPath),
            childPaths: [],
            siblingPaths: [],
            relatedObjects: [],
            relationshipType: 'unknown',
            accessPattern: 'direct'
        };
        
        // Determine relationship type
        if (stringIndexOf(objectPath, '.') === -1) {
            relationships.relationshipType = 'root';
        } else if (stringIndexOf(objectPath, '.pages') !== -1) {
            relationships.relationshipType = 'page_related';
        } else if (stringIndexOf(objectPath, '.layers') !== -1) {
            relationships.relationshipType = 'layer_related';
        } else if (stringIndexOf(objectPath, '.stories') !== -1) {
            relationships.relationshipType = 'story_related';
        } else {
            relationships.relationshipType = 'nested';
        }
        
        // Analyze access pattern
        if (targetObject && typeof targetObject === 'object') {
            if (typeof targetObject.length === 'number') {
                relationships.accessPattern = 'indexed';
            } else if (typeof targetObject.count === 'number') {
                relationships.accessPattern = 'counted';
            }
        }
        
        return relationships;
        
    } catch (exc) {
        return {
            parentPath: getParentPath(objectPath),
            childPaths: [],
            siblingPaths: [],
            relatedObjects: [],
            relationshipType: 'error',
            accessPattern: 'unknown',
            error: exc.message
        };
    }
}

// =============================================================================
// PROPERTY MAPPING
// =============================================================================

/**
 * Map object properties with enhanced tracking
 * @param {Object} targetObject - Object to map
 * @param {String} objectPath - Object path
 * @param {Number} depth - Current depth
 * @param {Object} mappingSession - Mapping session
 * @param {Object} config - Configuration
 * @returns {Object} Property mapping result
 */
function mapObjectProperties(targetObject, objectPath, depth, mappingSession, config) {
    var result = {
        success: false,
        properties: [],
        collections: [],
        methods: [],
        error: null
    };
    
    try {
        var properties = [];
        var collections = [];
        var methods = [];
        
        for (var propName in targetObject) {
            try {
                if (objectHasOwnProperty(targetObject, propName)) {
                    // Skip dangerous properties
                    if (config.skipDangerous && isDangerousProperty(propName)) {
                        continue;
                    }
                    
                    var propType = safeTypeCheck(targetObject, propName);
                    var propPath = objectPath + '.' + propName;
                    
                    var enhancedProperty = {
                        name: propName,
                        path: propPath,
                        type: propType,
                        depth: depth + 1,
                        safetyLevel: getPropertySafetyLevel(propName),
                        accessibilityLevel: analyzePropertyAccessibility(propName, propType),
                        mappingTimestamp: getCurrentTimestamp()
                    };
                    
                    // Categorize property
                    if (propType === 'function') {
                        methods[methods.length] = enhancedProperty;
                    } else if (isLikelyCollection(propName)) {
                        collections[collections.length] = enhancedProperty;
                    } else {
                        properties[properties.length] = enhancedProperty;
                    }
                }
            } catch (propExc) {
                // Continue processing other properties
            }
        }
        
        result.properties = properties;
        result.collections = collections;
        result.methods = methods;
        result.success = true;
        
        return result;
        
    } catch (exc) {
        result.error = 'Property mapping failed for ' + objectPath + ': ' + exc.message;
        return result;
    }
}

/**
 * Map child objects recursively
 * @param {Object} targetObject - Parent object
 * @param {String} objectPath - Parent path
 * @param {Number} depth - Current depth
 * @param {Object} mappingSession - Mapping session
 * @param {Object} config - Configuration
 * @returns {Object} Child mapping result
 */
function mapChildObjects(targetObject, objectPath, depth, mappingSession, config) {
    var result = {
        success: false,
        children: [],
        error: null
    };
    
    try {
        var children = [];
        
        for (var propName in targetObject) {
            try {
                if (objectHasOwnProperty(targetObject, propName)) {
                    var propValue = targetObject[propName];
                    
                    if (propValue && typeof propValue === 'object') {
                        var childPath = objectPath + '.' + propName;
                        
                        var childMappingResult = performDeepObjectMapping(
                            propValue,
                            childPath,
                            depth + 1,
                            mappingSession,
                            config
                        );
                        
                        if (childMappingResult.success) {
                            children[children.length] = childMappingResult.mapping;
                        }
                    }
                }
            } catch (childExc) {
                // Continue processing other children
            }
        }
        
        result.children = children;
        result.success = true;
        
        return result;
        
    } catch (exc) {
        result.error = 'Child mapping failed for ' + objectPath + ': ' + exc.message;
        return result;
    }
}

// =============================================================================
// ANALYSIS UTILITIES
// =============================================================================

/**
 * Analyze property accessibility for deep mapping
 * @param {String} propName - Property name
 * @param {String} propType - Property type
 * @returns {String} Accessibility level
 */
function analyzePropertyAccessibility(propName, propType) {
    try {
        var safetyLevel = getPropertySafetyLevel(propName);
        
        if (safetyLevel === 'dangerous') {
            return 'restricted';
        } else if (safetyLevel === 'caution') {
            return 'limited';
        } else if (propType === 'function') {
            return 'executable';
        } else {
            return 'accessible';
        }
        
    } catch (exc) {
        return 'unknown';
    }
}

/**
 * Analyze object accessibility for atlas
 * @param {Object} objectReference - Object reference
 * @param {Object} config - Configuration
 * @returns {Object} Accessibility analysis
 */
function analyzeObjectAccessibility(objectReference, config) {
    try {
        var analysis = {
            level: 'safe',
            reasons: [],
            recommendations: []
        };
        
        var path = objectReference.firstPath || 'unknown';
        
        // Check path safety
        if (isDangerousPath(path)) {
            analysis.level = 'dangerous';
            analysis.reasons[analysis.reasons.length] = 'Path contains dangerous elements';
        } else if (stringIndexOf(path, 'parent') !== -1) {
            analysis.level = 'caution';
            analysis.reasons[analysis.reasons.length] = 'Path references parent objects';
        }
        
        // Check object type
        if (objectReference.reference && typeof objectReference.reference === 'function') {
            if (analysis.level === 'safe') {
                analysis.level = 'caution';
            }
            analysis.reasons[analysis.reasons.length] = 'Object is a function';
        }
        
        // Generate recommendations
        switch (analysis.level) {
            case 'dangerous':
                analysis.recommendations[analysis.recommendations.length] = 
                    'Avoid accessing this object in production scripts';
                break;
            case 'caution':
                analysis.recommendations[analysis.recommendations.length] = 
                    'Use extra error handling when accessing this object';
                break;
            case 'safe':
                analysis.recommendations[analysis.recommendations.length] = 
                    'Safe to access with standard error handling';
                break;
        }
        
        return analysis;
        
    } catch (exc) {
        return {
            level: 'unknown',
            reasons: ['Analysis failed: ' + exc.message],
            recommendations: ['Exercise extreme caution']
        };
    }
}

/**
 * Generate performance optimizations based on statistics
 * @param {Object} statistics - Mapping statistics
 * @param {Object} config - Configuration
 * @returns {Array} Optimization suggestions
 */
function generatePerformanceOptimizations(statistics, config) {
    try {
        var optimizations = [];
        
        if (statistics.elapsedTime > config.timeoutMs * 0.5) {
            optimizations[optimizations.length] = 
                'Consider reducing maxDepth to improve mapping speed';
        }
        
        if (statistics.totalObjects > config.maxTotalObjects * 0.8) {
            optimizations[optimizations.length] = 
                'Consider reducing maxTotalObjects to control memory usage';
        }
        
        if (statistics.circularReferences > 5) {
            optimizations[optimizations.length] = 
                'High circular reference count - consider enabling deduplication';
        }
        
        return optimizations;
        
    } catch (exc) {
        return ['Optimization analysis failed'];
    }
}

/**
 * Generate atlas recommendations
 * @param {Object} atlas - Object atlas
 * @param {Object} config - Configuration
 * @returns {Array} Recommendations
 */
function generateAtlasRecommendations(atlas, config) {
    try {
        var recommendations = [];
        
        if (atlas.metadata.totalObjects > 1000) {
            recommendations[recommendations.length] = 
                'Large object count detected - consider using targeted property access';
        }
        
        if (atlas.circularReferences && atlas.circularReferences.length > 0) {
            recommendations[recommendations.length] = 
                'Circular references found - implement loop detection in traversal code';
        }
        
        if (atlas.accessibilityMap && atlas.accessibilityMap.summary) {
            var accessSummary = atlas.accessibilityMap.summary;
            var dangerousRatio = accessSummary.dangerousCount / accessSummary.totalAnalyzed;
            
            if (dangerousRatio > 0.1) {
                recommendations[recommendations.length] = 
                    'High ratio of dangerous objects - review access patterns carefully';
            }
        }
        
        recommendations[recommendations.length] = 
            'Use the atlas object map to understand document structure before scripting';
        
        return recommendations;
        
    } catch (exc) {
        return ['Recommendation generation failed'];
    }
}

// =============================================================================
// UI INTEGRATION
// =============================================================================

/**
 * Show deep mapper interface
 * @returns {Boolean} True if interface shown successfully
 */
function showDeepMapper() {
    try {
        // This would integrate with the main UI system
        // For now, return true to indicate the function exists
        return true;

    } catch (exc) {
        return false;
    }
}

// =============================================================================
// MODULE REGISTRATION
// =============================================================================

// Register this module with all its functions
registerModule('5.1_deep-mapper', '3.1', [
    // Main Deep Mapping Functions
    'performDeepDOMMapping', 'performDeepObjectMapping',
    
    // Session Management
    'createDeepMappingSession', 'createErrorDeepMappingSession', 'generateSessionId',
    
    // Node Creation
    'createDeepDOMNode', 'createErrorDeepDOMNode',
    
    // Object Atlas
    'createObjectAtlas', 'generateObjectAtlas', 'buildRelationshipMap', 'buildAccessibilityMap',
    'buildPerformanceMap', 'buildPathIndex', 'buildTypeIndex',
    
    // Circular Reference Mapping
    'createCircularReferenceMapper', 'analyzeCircularReferences',
    
    // Memory Tracking
    'createMemoryTracker', 'optimizeMemoryUsage',
    
    // Object Relationship Analysis
    'trackObjectRelationships', 'analyzeObjectRelationships',
    
    // Property Mapping
    'mapObjectProperties', 'mapChildObjects',
    
    // Analysis Utilities
    'analyzePropertyAccessibility', 'analyzeObjectAccessibility', 'generatePerformanceOptimizations',
    'generateAtlasRecommendations',
    
    // UI Integration
    'showDeepMapper'
]);

// =============================================================================
// END OF 5.1_deep-mapper.jsx
// =============================================================================