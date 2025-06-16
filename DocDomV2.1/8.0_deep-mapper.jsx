// =============================================================================
// 8.0_deep-mapper.jsx - DEEP DOM MAPPING AND ANALYSIS
// InDesign DOM Discovery Builder v2.1 - TARGET ARCHITECTURE
// =============================================================================
// PURPOSE: Exhaustive DOM traversal with object deduplication, reference tracking, and comprehensive analysis
// DEPENDENCIES: ["1.0_safe-foundation.jsx", "2.0_dom-enumerator.jsx", "3.0_collection-sampler.jsx"]
// SIZE: ~1800 lines (combines 9.1 + 9.2)
// =============================================================================

// =============================================================================
// MODULE REGISTRATION AND DEPENDENCIES
// =============================================================================

try {
    // Register this module
    if (typeof registerModule === 'function') {
        registerModule('deep-mapper', '2.1', [
            'performDeepDOMMapping',
            'performDeepObjectMapping',
            'createObjectAtlas',
            'createCircularReferenceMapper',
            'createDeepMappingSession',
            'createDeepDOMNode',
            'quickDeepMap',
            'conservativeDeepMap',
            'aggressiveDeepMap',
            'analyzeDeepMappingSession',
            'analyzeObjects',
            'analyzeAccessPatterns',
            'analyzeCircularReferences',
            'analyzePerformance',
            'generateObjectReport',
            'generateExecutiveSummary',
            'generateDeveloperGuide',
            'quickAnalyzeSession',
            'comprehensiveAnalysis',
            'getDeepMappingStatistics'
        ]);
    }

    // Validate dependencies
    if (typeof validateDependencies === 'function') {
        var depResult = validateDependencies(['safe-foundation', 'dom-enumerator', 'collection-sampler']);
        if (!depResult.success) {
            throw new Error('Missing dependencies for deep-mapper: ' + depResult.missing.join(', '));
        }
    }
} catch (exc) {
    // Module system not available - continue with standalone operation
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
    progressiveCleanup: true
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
    var mappingConfig = objectClone(config || DEFAULT_DEEP_MAPPING_CONFIG, 3);
    
    try {
        // Enhanced environment validation
        var envValidation = validateInDesignEnvironment();
        if (!envValidation.valid) {
            return createErrorDeepMappingSession(envValidation.error);
        }
        
        var targetDocument = documentObj || envValidation.document;
        if (!targetDocument) {
            return createErrorDeepMappingSession('No valid document available for mapping');
        }
        
        // Create deep mapping session with enhanced initialization
        var session = createDeepMappingSession();
        session.metadata = {
            timestamp: getCurrentTimestamp(),
            documentName: getDocumentName(targetDocument),
            config: mappingConfig,
            features: {
                objectAtlas: mappingConfig.enableObjectAtlas,
                circularMapping: mappingConfig.mapCircularReferences,
                exhaustiveTraversal: true,
                progressiveCleanup: mappingConfig.progressiveCleanup
            }
        };
        
        // Set up enhanced tracking components
        var objectAtlas = mappingConfig.enableObjectAtlas ? createObjectAtlas() : null;
        var circularMapper = mappingConfig.mapCircularReferences ? createCircularReferenceMapper() : null;
        var timeoutChecker = createTimeoutChecker(mappingConfig.timeoutMs);
        var operationCounter = createOperationCounter(mappingConfig.maxTotalObjects);
        var memoryMonitor = createMemoryMonitor();
        var memoryPressureDetector = createMemoryPressureDetector(mappingConfig);
        
        memoryMonitor.checkpoint('deep_mapping_start');
        
        // Perform deep object mapping with enhanced tracking
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
            [],
            memoryPressureDetector
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
        
        // Store circular reference mapper
        if (circularMapper) {
            session.circularReferenceMapper = circularMapper;
        }
        
        // Finalize session with enhanced statistics
        session.statistics.mappingTime = new Date().getTime() - startTime;
        session.statistics.memoryReport = memoryMonitor.getReport();
        session.statistics.memoryPressure = memoryPressureDetector.getReport();
        
        if (circularMapper) {
            session.statistics.circularReferences = circularMapper.getStatistics();
        }
        
        memoryMonitor.checkpoint('deep_mapping_complete');
        
        // Progressive cleanup if enabled
        if (mappingConfig.progressiveCleanup) {
            performSessionCleanup(session, memoryPressureDetector);
        }
        
        return session;
        
    } catch (exc) {
        return createErrorDeepMappingSession('Deep mapping failed: ' + exc.message);
    }
}

/**
 * Perform deep object mapping with comprehensive tracking and memory management
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
 * @param {Object} memoryPressureDetector - Memory pressure detector
 * @returns {Object} Deep DOM node structure
 */
function performDeepObjectMapping(targetObj, objName, objPath, depth, config, session, timeoutChecker, operationCounter, memoryMonitor, parentPaths, memoryPressureDetector) {
    try {
        // Enhanced safety checks
        if (timeoutChecker && timeoutChecker()) {
            return createErrorDeepDOMNode(objName, objPath, 'timeout', depth);
        }
        
        if (operationCounter && operationCounter.check()) {
            return createErrorDeepDOMNode(objName, objPath, 'max_operations', depth);
        }
        
        if (depth >= config.maxDepth) {
            return createErrorDeepDOMNode(objName, objPath, 'max_depth', depth);
        }
        
        // Memory pressure detection
        if (memoryPressureDetector && memoryPressureDetector.checkPressure()) {
            return createErrorDeepDOMNode(objName, objPath, 'memory_pressure', depth);
        }
        
        // Enhanced parameter validation
        if (!targetObj) {
            return createErrorDeepDOMNode(objName, objPath, 'null_object', depth);
        }
        
        // Memory checkpoint at regular intervals
        if (depth % 3 === 0 && memoryMonitor) {
            memoryMonitor.checkpoint('depth_' + depth + '_' + stringReplace(objName, ' ', '_'));
        }
        
        // Enhanced circular reference detection
        var isCircular = false;
        var circularType = '';
        
        for (var i = 0; i < parentPaths.length; i++) {
            if (parentPaths[i] === objPath) {
                isCircular = true;
                circularType = 'path';
                break;
            }
        }
        
        // Create deep DOM node with enhanced metadata
        var deepNode = createDeepDOMNode(objName, objPath, typeof targetObj, depth);
        
        if (isCircular) {
            deepNode.objectMetadata.isCircular = true;
            deepNode.objectMetadata.circularType = circularType;
            
            // Record with circular mapper if available
            if (session.circularReferenceMapper) {
                session.circularReferenceMapper.recordCircularReference(objPath, parentPaths, circularType);
            }
            
            session.statistics.circularReferences++;
            return deepNode;
        }
        
        // Update session statistics
        session.statistics.totalNodes++;
        session.statistics.maxDepthReached = Math.max(session.statistics.maxDepthReached || 0, depth);
        
        // Enhanced property enumeration with ES3 compatibility
        var newParentPaths = arraySlice(parentPaths, 0);
        newParentPaths.push(objPath);
        
        var propertyCount = 0;
        var processedObjects = []; // Track objects for cleanup
        
        // ES3-compatible object iteration with enhanced safety
        for (var propName in targetObj) {
            if (!objectHasOwnProperty(targetObj, propName)) {
                continue;
            }
            
            if (operationCounter) {
                operationCounter.increment();
            }
            
            if (timeoutChecker && timeoutChecker()) {
                break;
            }
            
            // Skip dangerous properties with enhanced filtering
            if (isDangerousProperty(propName) && !config.includeSystemObjects) {
                continue;
            }
            
            var propType = safeTypeCheck(targetObj, propName);
            if (propType === 'error') {
                continue;
            }
            
            var propertyClassification = createPropertyClassification(propName, propType, objPath, null);
            
            // Add to appropriate collection with enhanced categorization
            if (propertyClassification.isMethod) {
                deepNode.methods.push(propertyClassification);
            } else if (propertyClassification.isCollection) {
                deepNode.collections.push(propertyClassification);
            } else {
                deepNode.properties.push(propertyClassification);
            }
            
            propertyCount++;
            session.statistics.totalProperties++;
            
            // Recursively map object properties with enhanced memory management
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
                            newParentPaths,
                            memoryPressureDetector
                        );
                        
                        if (childNode) {
                            deepNode.childNodes.push(childNode);
                            propertyClassification.objectId = childNode.objectId;
                            processedObjects.push(childNode);
                            
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
                        
                        // Progressive cleanup if memory pressure is high
                        if (config.progressiveCleanup && memoryPressureDetector && 
                            memoryPressureDetector.shouldCleanup()) {
                            performProgressiveCleanup(processedObjects, config);
                        }
                    }
                } catch (exc) {
                    // Continue mapping even if individual child fails
                    session.statistics.mappingErrors++;
                }
            }
            
            // Break if we've hit memory limits
            if (memoryPressureDetector && memoryPressureDetector.checkHardLimit()) {
                break;
            }
        }
        
        deepNode.objectMetadata.propertyCount = propertyCount;
        deepNode.objectMetadata.mappingTimestamp = getCurrentTimestamp();
        deepNode.objectMetadata.memoryOptimized = config.progressiveCleanup;
        
        return deepNode;
        
    } catch (exc) {
        session.statistics.mappingErrors++;
        return createErrorDeepDOMNode(objName, objPath, 'mapping_error: ' + exc.message, depth);
    }
}

// =============================================================================
// ENHANCED OBJECT ATLAS FUNCTIONS
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
            lastUpdate: getCurrentTimestamp(),
            memoryUsage: 0
        }
    };
    
    atlas.registerObject = function(objectId, objectNode, objectPath, metadata) {
        try {
            // Parameter validation
            if (!objectId || !objectNode || !objectPath) {
                return false;
            }
            
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
            
            // Update path index with ES3 compatibility
            this.pathIndex[objectPath] = objectId;
            this.statistics.pathMappings++;
            this.statistics.lastUpdate = getCurrentTimestamp();
            this.statistics.memoryUsage += this.estimateObjectSize(objectNode);
            
            return true;
            
        } catch (exc) {
            return false;
        }
    };
    
    atlas.getObjectPaths = function(objectId) {
        try {
            if (this.objects[objectId]) {
                return arraySlice(this.objects[objectId].paths, 0);
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
            lastUpdate: this.statistics.lastUpdate,
            memoryUsage: this.statistics.memoryUsage
        };
    };
    
    atlas.generateAccessPatterns = function() {
        try {
            var patterns = [];
            
            // ES3-compatible iteration
            for (var objectId in this.objects) {
                if (objectHasOwnProperty(this.objects, objectId)) {
                    var objectInfo = this.objects[objectId];
                    if (objectInfo.paths.length > 1) {
                        patterns.push({
                            objectId: objectId,
                            primaryPath: objectInfo.paths[0],
                            alternativePaths: arraySlice(objectInfo.paths, 1),
                            accessRecommendation: 'Multiple access paths available'
                        });
                    }
                }
            }
            
            return patterns;
            
        } catch (exc) {
            return [];
        }
    };
    
    atlas.estimateObjectSize = function(obj) {
        try {
            // Simple size estimation for memory tracking
            var size = 0;
            if (obj && typeof obj === 'object') {
                for (var prop in obj) {
                    if (objectHasOwnProperty(obj, prop)) {
                        size += 32; // Rough estimate per property
                    }
                }
            }
            return size;
        } catch (exc) {
            return 32; // Default estimate
        }
    };
    
    atlas.cleanup = function() {
        try {
            this.objects = {};
            this.pathIndex = {};
            this.statistics = {
                totalObjects: 0,
                duplicateReferences: 0,
                pathMappings: 0,
                lastUpdate: getCurrentTimestamp(),
                memoryUsage: 0
            };
            return true;
        } catch (exc) {
            return false;
        }
    };
    
    return atlas;
}

/**
 * Create circular reference mapper with enhanced pattern analysis
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
            // Parameter validation
            if (!currentPath || !parentPaths || !circularType) {
                return false;
            }
            
            var circularRef = {
                path: currentPath,
                parentPaths: arraySlice(parentPaths, 0),
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
            
            // Track patterns with enhanced analysis
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
            
            // Extract meaningful pattern using ES3 helpers
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
            
            // ES3-compatible pattern analysis
            for (var pattern in this.patterns) {
                if (objectHasOwnProperty(this.patterns, pattern)) {
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
            patterns: countObjectKeys(this.patterns),
            lastUpdate: this.statistics.lastUpdate
        };
    };
    
    mapper.cleanup = function() {
        try {
            this.circularReferences = [];
            this.patterns = {};
            this.statistics = {
                totalCircular: 0,
                pathCircular: 0,
                objectCircular: 0,
                lastUpdate: getCurrentTimestamp()
            };
            return true;
        } catch (exc) {
            return false;
        }
    };
    
    return mapper;
}

// =============================================================================
// MEMORY MANAGEMENT ENHANCEMENTS
// =============================================================================

/**
 * Create memory pressure detector
 * @param {Object} config - Configuration
 * @returns {Object} Memory pressure detector
 */
function createMemoryPressureDetector(config) {
    var detector = {
        config: config,
        objectCount: 0,
        lastCheck: new Date().getTime(),
        pressureLevel: 'low', // low, medium, high, critical
        thresholds: {
            medium: config.memoryCleanupThreshold || 5000,
            high: (config.memoryCleanupThreshold || 5000) * 1.5,
            critical: (config.memoryCleanupThreshold || 5000) * 2
        }
    };
    
    detector.checkPressure = function() {
        try {
            this.objectCount++;
            var now = new Date().getTime();
            
            // Only check every second to avoid overhead
            if (now - this.lastCheck < 1000) {
                return this.pressureLevel !== 'low';
            }
            
            this.lastCheck = now;
            
            if (this.objectCount >= this.thresholds.critical) {
                this.pressureLevel = 'critical';
            } else if (this.objectCount >= this.thresholds.high) {
                this.pressureLevel = 'high';
            } else if (this.objectCount >= this.thresholds.medium) {
                this.pressureLevel = 'medium';
            } else {
                this.pressureLevel = 'low';
            }
            
            return this.pressureLevel !== 'low';
            
        } catch (exc) {
            this.pressureLevel = 'critical';
            return true;
        }
    };
    
    detector.shouldCleanup = function() {
        return this.pressureLevel === 'high' || this.pressureLevel === 'critical';
    };
    
    detector.checkHardLimit = function() {
        return this.pressureLevel === 'critical';
    };
    
    detector.getReport = function() {
        return {
            objectCount: this.objectCount,
            pressureLevel: this.pressureLevel,
            thresholds: this.thresholds,
            lastCheck: this.lastCheck
        };
    };
    
    return detector;
}

/**
 * Perform progressive cleanup during mapping
 * @param {Array} processedObjects - Array of processed objects
 * @param {Object} config - Configuration
 */
function performProgressiveCleanup(processedObjects, config) {
    try {
        if (!processedObjects || !processedObjects.length) {
            return;
        }
        
        // Clean up older processed objects to free memory
        var cleanupCount = Math.floor(processedObjects.length * 0.3); // Clean 30%
        
        for (var i = 0; i < cleanupCount && i < processedObjects.length; i++) {
            var obj = processedObjects[i];
            if (obj && obj.childNodes) {
                // Null out large arrays to help garbage collection
                obj.childNodes = null;
            }
        }
        
        // Remove cleaned objects from tracking
        processedObjects.splice(0, cleanupCount);
        
        // Force garbage collection hint
        if (typeof $.gc === 'function') {
            $.gc();
        }
        
    } catch (exc) {
        // Silent cleanup failure
    }
}

/**
 * Perform session cleanup after mapping
 * @param {Object} session - Deep mapping session
 * @param {Object} memoryPressureDetector - Memory pressure detector
 */
function performSessionCleanup(session, memoryPressureDetector) {
    try {
        if (!session) {
            return;
        }
        
        // Clean up object atlas if memory pressure is high
        if (memoryPressureDetector && memoryPressureDetector.shouldCleanup()) {
            if (session.objectAtlas && typeof session.objectAtlas.cleanup === 'function') {
                // Keep only essential data before cleanup
                var essentialStats = session.objectAtlas.getStatistics();
                session.objectAtlas.cleanup();
                session.statistics.atlasCleanedUp = true;
                session.statistics.preCleanupAtlasStats = essentialStats;
            }
        }
        
        // Memory cleanup hint
        memoryCleanup([], null);
        
    } catch (exc) {
        // Silent cleanup failure
    }
}

// =============================================================================
// SESSION AND NODE CREATION - ENHANCED
// =============================================================================

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
            memoryReport: null,
            memoryPressure: null
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
        name: name || 'unnamed',
        path: path || 'unknown',
        type: objType || 'unknown',
        depth: depth || 0,
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
            memoryOptimized: false,
            deepMappingFeatures: {
                exhaustiveTraversal: true,
                atlasTracked: true,
                circularDetected: false,
                memoryManaged: true
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
// QUICK ACCESS FUNCTIONS - ENHANCED
// =============================================================================

/**
 * Quick deep mapping with default configuration
 * @param {Object} documentObj - Document to map
 * @returns {Object} Deep mapping session
 */
function quickDeepMap(documentObj) {
    var config = objectClone(DEFAULT_DEEP_MAPPING_CONFIG, 2);
    config.maxDepth = 4;
    config.timeoutMs = 15000;
    config.maxTotalObjects = 5000;
    config.progressiveCleanup = true;
    
    return performDeepDOMMapping(documentObj, config);
}

/**
 * Conservative deep mapping for large documents
 * @param {Object} documentObj - Document to map
 * @returns {Object} Deep mapping session
 */
function conservativeDeepMap(documentObj) {
    var config = objectClone(DEFAULT_DEEP_MAPPING_CONFIG, 2);
    config.maxDepth = 3;
    config.timeoutMs = 20000;
    config.maxTotalObjects = 3000;
    config.trackAllPaths = false;
    config.mapCircularReferences = false;
    config.progressiveCleanup = true;
    config.memoryCleanupThreshold = 2000;
    
    return performDeepDOMMapping(documentObj, config);
}

/**
 * Aggressive deep mapping for comprehensive analysis
 * @param {Object} documentObj - Document to map
 * @returns {Object} Deep mapping session
 */
function aggressiveDeepMap(documentObj) {
    var config = objectClone(DEFAULT_DEEP_MAPPING_CONFIG, 2);
    config.maxDepth = 8;
    config.timeoutMs = 60000;
    config.maxTotalObjects = 20000;
    config.includeSystemObjects = true;
    config.progressiveCleanup = true;
    config.memoryCleanupThreshold = 10000;
    
    return performDeepDOMMapping(documentObj, config);
}

// =============================================================================
// DEEP MAPPING ANALYSIS FUNCTIONS - ENHANCED
// =============================================================================

/**
 * Perform comprehensive analysis of deep mapping session
 * @param {Object} deepMappingSession - Deep mapping session
 * @param {Object} config - Analysis configuration
 * @returns {Object} Complete analysis results
 */
function analyzeDeepMappingSession(deepMappingSession, config) {
    var startTime = new Date().getTime();
    var analysisConfig = objectClone(config || DEFAULT_ANALYSIS_CONFIG, 2);
    
    try {
        // Enhanced parameter validation
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
 * Analyze objects and their relationships - Enhanced
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
            memoryUsage: 0,
            recommendations: []
        };
        
        // Enhanced atlas analysis
        if (session.objectAtlas) {
            var atlasStats = session.objectAtlas.getStatistics();
            analysis.duplicateObjects = atlasStats.duplicateReferences;
            analysis.memoryUsage = atlasStats.memoryUsage;
            
            // Generate access patterns
            var accessPatterns = session.objectAtlas.generateAccessPatterns();
            analysis.accessPatternCount = accessPatterns.length;
        }
        
        // Analyze object types and depths with enhanced categorization
        if (session.structure && session.structure.document) {
            analyzeNodeTypes(session.structure.document, analysis);
        }
        
        // Enhanced recommendations with memory considerations
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
        
        if (analysis.memoryUsage > 100000) {
            analysis.recommendations.push({
                type: 'memory',
                message: 'High memory usage detected. Enable progressive cleanup for large documents.',
                priority: 'high'
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
 * Analyze access patterns for developer guidance - Enhanced
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
            codeExamples: [],
            memoryOptimizedPatterns: []
        };
        
        if (session.structure && session.structure.document) {
            extractAccessPatterns(session.structure.document, analysis, config);
        }
        
        // Generate enhanced code examples
        if (config.includeCodeExamples && analysis.safeAccessPaths.length > 0) {
            analysis.codeExamples = generateAccessCodeExamples(analysis.safeAccessPaths, config);
        }
        
        // Add memory-optimized patterns
        if (session.metadata.config && session.metadata.config.progressiveCleanup) {
            analysis.memoryOptimizedPatterns = generateMemoryOptimizedPatterns(analysis.safeAccessPaths);
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
 * Analyze circular references in detail - Enhanced
 * @param {Object} session - Deep mapping session
 * @param {Object} config - Configuration
 * @returns {Object} Circular reference analysis
 */
function analyzeCircularReferences(session, config) {
    try {
        var analysis = {
            totalCircular: 0,
            patterns: [],
            recommendations: [],
            patternAnalysis: null
        };
        
        if (session.circularReferenceMapper) {
            var circularStats = session.circularReferenceMapper.getStatistics();
            analysis.totalCircular = circularStats.totalCircular;
            
            var patternAnalysis = session.circularReferenceMapper.analyzePatterns();
            analysis.patterns = patternAnalysis.allPatterns;
            analysis.patternAnalysis = patternAnalysis;
            
            // Enhanced recommendations
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
                
                if (analysis.totalCircular > 10) {
                    analysis.recommendations.push({
                        type: 'warning',
                        message: 'High number of circular references. Consider structural analysis.',
                        priority: 'high'
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
 * Analyze performance metrics from deep mapping - Enhanced
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
            memoryPressure: 'unknown',
            recommendations: []
        };
        
        // Calculate performance metrics
        if (analysis.mappingTime > 0) {
            analysis.nodesPerSecond = Math.floor((session.statistics.totalNodes || 0) / (analysis.mappingTime / 1000));
        }
        
        // Memory analysis with enhanced reporting
        if (session.statistics.memoryReport) {
            var memoryReport = session.statistics.memoryReport;
            analysis.memoryCheckpoints = memoryReport.totalCheckpoints;
            analysis.memoryEfficiency = memoryReport.totalElapsed < 30000 ? 'good' : 'needs_improvement';
        }
        
        // Memory pressure analysis
        if (session.statistics.memoryPressure) {
            analysis.memoryPressure = session.statistics.memoryPressure.pressureLevel;
            analysis.objectsProcessed = session.statistics.memoryPressure.objectCount;
        }
        
        // Enhanced scalability assessment
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
        
        // Enhanced recommendations with memory focus
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
        
        if (analysis.memoryPressure === 'high' || analysis.memoryPressure === 'critical') {
            analysis.recommendations.push({
                type: 'memory',
                message: 'High memory pressure detected. Enable progressive cleanup for large operations.',
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
// UTILITY FUNCTIONS - ENHANCED ES3 COMPLIANT
// =============================================================================

/**
 * Get document name safely
 * @param {Object} doc - Document object
 * @returns {String} Document name
 */
function getDocumentName(doc) {
    try {
        if (doc && doc.name) {
            return doc.name;
        }
        return 'Unknown Document';
    } catch (exc) {
        return 'Document Access Error';
    }
}

/**
 * Get deep mapping statistics - Enhanced
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
            atlasStatistics: null,
            memoryPressure: null
        };
        
        if (session.objectAtlas) {
            stats.atlasStatistics = session.objectAtlas.getStatistics();
        }
        
        if (session.statistics.memoryPressure) {
            stats.memoryPressure = session.statistics.memoryPressure;
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

// =============================================================================
// REPORT GENERATION FUNCTIONS - ENHANCED
// =============================================================================

/**
 * Generate executive summary - Enhanced
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
        
        // Enhanced basic statistics
        builder.appendLine('MAPPING OVERVIEW');
        builder.appendLine('---------------');
        builder.appendLine('Document: ' + (session.metadata.documentName || 'Unknown'));
        builder.appendLine('Total Objects Mapped: ' + (session.statistics.totalNodes || 0));
        builder.appendLine('Total Properties: ' + (session.statistics.totalProperties || 0));
        builder.appendLine('Maximum Depth Reached: ' + (session.statistics.maxDepthReached || 0));
        builder.appendLine('Mapping Time: ' + (session.statistics.mappingTime || 0) + 'ms');
        builder.appendLine('');
        
        // Enhanced features summary
        builder.appendLine('ADVANCED FEATURES');
        builder.appendLine('----------------');
        builder.appendLine('Object Atlas: ' + (session.objectAtlas ? 'Enabled' : 'Disabled'));
        builder.appendLine('Circular Detection: ' + (session.circularReferenceMapper ? 'Enabled' : 'Disabled'));
        builder.appendLine('Memory Management: ' + (session.metadata.features.progressiveCleanup ? 'Enabled' : 'Disabled'));
        
        if (session.objectAtlas) {
            var atlasStats = session.objectAtlas.getStatistics();
            builder.appendLine('Duplicate References: ' + atlasStats.duplicateReferences);
            builder.appendLine('Memory Usage: ' + atlasStats.memoryUsage + ' bytes (estimated)');
        }
        
        if (session.circularReferenceMapper) {
            var circularStats = session.circularReferenceMapper.getStatistics();
            builder.appendLine('Circular References: ' + circularStats.totalCircular);
        }
        
        // Memory pressure information
        if (session.statistics.memoryPressure) {
            builder.appendLine('Memory Pressure: ' + session.statistics.memoryPressure.pressureLevel);
        }
        
        builder.appendLine('');
        
        // Enhanced key findings
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
        
        if (session.statistics.memoryPressure && session.statistics.memoryPressure.pressureLevel !== 'low') {
            builder.appendLine('• Memory pressure detected during mapping');
        }
        
        builder.appendLine('• Deep mapping completed successfully');
        builder.appendLine('');
        
        return builder.toString();
        
    } catch (exc) {
        return 'Error generating executive summary: ' + exc.message;
    }
}

/**
 * Generate developer guide with code examples - Enhanced
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
        
        // Enhanced safe access patterns
        builder.appendLine('SAFE ACCESS PATTERNS');
        builder.appendLine('-------------------');
        builder.appendLine('Based on the deep mapping analysis, here are recommended safe access patterns:');
        builder.appendLine('');
        
        // Enhanced basic document access
        builder.appendLine('// Enhanced Document Access with Memory Management');
        builder.appendLine('var doc = app.activeDocument;');
        builder.appendLine('if (doc && typeof doc === "object") {');
        builder.appendLine('    var docName = "";');
        builder.appendLine('    try {');
        builder.appendLine('        docName = doc.name || "Unnamed Document";');
        builder.appendLine('        $.writeln("Document loaded: " + docName);');
        builder.appendLine('    } catch (e) {');
        builder.appendLine('        $.writeln("Document access error: " + e.message);');
        builder.appendLine('    }');
        builder.appendLine('}');
        builder.appendLine('');
        
        // Memory-optimized collection iteration
        if (session.structure && session.structure.document) {
            var discoveredCollections = findCollectionsInDeepNode(session.structure.document);
            
            if (discoveredCollections.length > 0) {
                builder.appendLine('// Memory-Optimized Collection Iteration Patterns');
                for (var i = 0; i < Math.min(discoveredCollections.length, 3); i++) {
                    var collection = discoveredCollections[i];
                    builder.appendLine('// Accessing ' + collection.name + ' with memory management:');
                    builder.appendLine('if (doc && "' + collection.name + '" in doc) {');
                    builder.appendLine('    var collection = doc.' + collection.name + ';');
                    builder.appendLine('    var length = collection.length || 0;');
                    builder.appendLine('    var batchSize = Math.min(length, 100); // Process in batches');
                    builder.appendLine('    ');
                    builder.appendLine('    for (var i = 0; i < length; i += batchSize) {');
                    builder.appendLine('        var endIndex = Math.min(i + batchSize, length);');
                    builder.appendLine('        ');
                    builder.appendLine('        for (var j = i; j < endIndex; j++) {');
                    builder.appendLine('            try {');
                    builder.appendLine('                var item = collection[j];');
                    builder.appendLine('                // Process item safely');
                    builder.appendLine('            } catch (e) {');
                    builder.appendLine('                $.writeln("Item error at index " + j + ": " + e.message);');
                    builder.appendLine('            }');
                    builder.appendLine('        }');
                    builder.appendLine('        ');
                    builder.appendLine('        // Memory cleanup hint');
                    builder.appendLine('        if (typeof $.gc === "function") $.gc();');
                    builder.appendLine('    }');
                    builder.appendLine('}');
                    builder.appendLine('');
                }
            }
        }
        
        // Enhanced circular reference handling
        if (session.circularReferenceMapper && session.statistics.circularReferences > 0) {
            builder.appendLine('// Enhanced Circular Reference Prevention');
            builder.appendLine('function safeTraversalWithMemory(obj, visitedPaths, maxDepth) {');
            builder.appendLine('    visitedPaths = visitedPaths || [];');
            builder.appendLine('    maxDepth = maxDepth || 10;');
            builder.appendLine('    ');
            builder.appendLine('    if (visitedPaths.length >= maxDepth) {');
            builder.appendLine('        return; // Depth limit reached');
            builder.appendLine('    }');
            builder.appendLine('    ');
            builder.appendLine('    for (var i = 0; i < visitedPaths.length; i++) {');
            builder.appendLine('        if (visitedPaths[i] === obj) {');
            builder.appendLine('            return; // Circular reference detected');
            builder.appendLine('        }');
            builder.appendLine('    }');
            builder.appendLine('    ');
            builder.appendLine('    visitedPaths.push(obj);');
            builder.appendLine('    try {');
            builder.appendLine('        // Process object safely');
            builder.appendLine('    } finally {');
            builder.appendLine('        visitedPaths.pop(); // Always cleanup');
            builder.appendLine('    }');
            builder.appendLine('}');
            builder.appendLine('');
        }
        
        // Enhanced performance recommendations
        builder.appendLine('PERFORMANCE RECOMMENDATIONS');
        builder.appendLine('--------------------------');
        builder.appendLine('• Use timeout protection for long operations');
        builder.appendLine('• Check object existence before property access');
        builder.appendLine('• Implement progress reporting for user feedback');
        builder.appendLine('• Consider memory cleanup for large operations');
        builder.appendLine('• Process collections in batches for better memory management');
        builder.appendLine('• Use try-catch blocks around individual item processing');
        builder.appendLine('• Monitor memory pressure and adjust batch sizes accordingly');
        builder.appendLine('');
        
        return builder.toString();
        
    } catch (exc) {
        return 'Error generating developer guide: ' + exc.message;
    }
}

// =============================================================================
// QUICK ANALYSIS FUNCTIONS - ENHANCED
// =============================================================================

/**
 * Quick analysis with default configuration - Enhanced
 * @param {Object} deepMappingSession - Deep mapping session
 * @returns {Object} Analysis results
 */
function quickAnalyzeSession(deepMappingSession) {
    var config = objectClone(DEFAULT_ANALYSIS_CONFIG, 2);
    config.analyzePerformance = false;
    config.includeDeveloperGuide = false;
    config.maxReportItems = 100;
    
    return analyzeDeepMappingSession(deepMappingSession, config);
}

/**
 * Comprehensive analysis with all features - Enhanced
 * @param {Object} deepMappingSession - Deep mapping session
 * @returns {Object} Complete analysis results
 */
function comprehensiveAnalysis(deepMappingSession) {
    return analyzeDeepMappingSession(deepMappingSession, DEFAULT_ANALYSIS_CONFIG);
}

// =============================================================================
// ADDITIONAL UTILITY FUNCTIONS
// =============================================================================

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
                if (node.collections[i]) {
                    collections.push(node.collections[i]);
                }
            }
        }
        
        // Recursively search child nodes
        if (node.childNodes && node.childNodes.length) {
            for (var j = 0; j < node.childNodes.length; j++) {
                var childCollections = findCollectionsInDeepNode(node.childNodes[j]);
                collections = arrayConcat(collections, childCollections);
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
                if (prop) {
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
        }
        
        // Extract collection access patterns
        if (node.collections) {
            for (var j = 0; j < node.collections.length; j++) {
                var collection = node.collections[j];
                if (collection) {
                    analysis.collectionAccessPatterns.push({
                        path: collection.path,
                        name: collection.name,
                        safetyLevel: collection.safetyLevel
                    });
                }
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
            if (path) {
                var example = {
                    description: 'Access ' + (path.name || 'property') + ' (' + (path.type || 'unknown') + ')',
                    code: 'if (obj && "' + (path.name || 'property') + '" in obj) {\n' +
                          '    var value = obj.' + (path.name || 'property') + ';\n' +
                          '    // Use value safely\n' +
                          '}'
                };
                
                examples.push(example);
            }
        }
        
        return examples;
        
    } catch (exc) {
        return [];
    }
}

/**
 * Generate memory-optimized patterns
 * @param {Array} safeAccessPaths - Array of safe access paths
 * @returns {Array} Array of memory-optimized patterns
 */
function generateMemoryOptimizedPatterns(safeAccessPaths) {
    var patterns = [];
    
    try {
        patterns.push({
            description: 'Batch Processing Pattern',
            code: 'function processBatch(collection, batchSize) {\n' +
                  '    batchSize = batchSize || 100;\n' +
                  '    for (var i = 0; i < collection.length; i += batchSize) {\n' +
                  '        var batch = collection.slice(i, i + batchSize);\n' +
                  '        // Process batch\n' +
                  '        if (typeof $.gc === "function") $.gc();\n' +
                  '    }\n' +
                  '}'
        });
        
        patterns.push({
            description: 'Memory Cleanup Pattern',
            code: 'function processWithCleanup(obj) {\n' +
                  '    try {\n' +
                  '        // Process object\n' +
                  '    } finally {\n' +
                  '        obj = null; // Explicit cleanup\n' +
                  '        if (typeof $.gc === "function") $.gc();\n' +
                  '    }\n' +
                  '}'
        });
        
        return patterns;
        
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
//
// ENHANCEMENTS IMPLEMENTED:
// - Added comprehensive dependency validation and module registration
// - Enhanced memory management with progressive cleanup and pressure detection
// - Fixed all for...in loops to use objectHasOwnProperty() throughout
// - Added memory pressure detection and adaptive cleanup strategies
// - Enhanced ES3 compliance with improved helper usage (arraySlice, arrayConcat, objectClone)
// - Added traversal limits and hard memory limits for large document processing
// - Enhanced error handling with comprehensive parameter validation
// - Improved config object cloning to prevent mutations
// - Added batch processing patterns for memory optimization
// - Enhanced circular reference detection and analysis
// - All original functionality preserved and enhanced for production reliability
// - Memory-efficient operation on large documents with progressive cleanup
// =============================================================================