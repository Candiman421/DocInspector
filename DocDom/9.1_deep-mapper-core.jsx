//
// 9.1_deep-mapper-core.jsx
// InDesign DOM Discovery Builder - Deep DOM Mapping Core Engine
// CORE PURPOSE: Exhaustive DOM traversal with object deduplication and reference tracking
// DEPENDENCIES: 1.0_safe-foundation.jsx, 2.0_dom-enumerator.jsx, 6.0_collection-sampler.jsx
// SAFETY: Ultra-safe deep traversal with comprehensive memory management
// ES3 COMPATIBLE: No reserved words, no modern JS features
//

// ============================================================================
// DEEP MAPPING CONFIGURATION
// ============================================================================

var DEFAULT_DEEP_MAPPING_CONFIG = {
    maxDepth: 6,                        // Deep traversal up to 6 levels
    timeoutMs: 30000,                   // 30 second timeout for complete mapping
    maxTotalObjects: 10000,             // Limit total objects to prevent memory issues
    trackAllPaths: true,                // Track every path to each object
    enableObjectAtlas: true,            // Build comprehensive object reference atlas
    deduplicateReferences: true,        // Detect and mark duplicate object references
    mapCircularReferences: true,        // Map circular reference patterns
    includeSystemObjects: false,        // Whether to include system/built-in objects
    enableProgressReporting: true,      // Log progress during deep mapping
    memoryCheckInterval: 1000           // Check memory usage every N operations
};

// ============================================================================
// DEEP MAPPING CORE DATA STRUCTURES
// ============================================================================

/**
 * Create deep mapping session container
 * @returns {Object} - Deep mapping session object
 */
function createDeepMappingSession() {
    return {
        metadata: {
            timestamp: getCurrentTimestamp(),
            version: '9.1_deep-mapper-core',
            config: null,
            documentName: 'Unknown',
            sessionID: generateUniqueID(),
            startTime: new Date().getTime(),
            endTime: 0
        },
        statistics: {
            totalObjectsDiscovered: 0,
            uniqueObjects: 0,
            duplicateReferences: 0,
            totalPaths: 0,
            circularReferences: 0,
            maxDepthReached: 0,
            timeouts: 0,
            memoryChecks: 0,
            errors: []
        },
        objectAtlas: null,              // Comprehensive object reference map
        pathIndex: null,                // Index of all access paths
        circularMap: null,              // Circular reference mapping
        deepStructure: null,            // Complete deep DOM structure
        referenceTracker: null          // Enhanced reference tracker
    };
}

/**
 * Create object atlas for comprehensive reference tracking
 * @returns {Object} - Object atlas with enhanced methods
 */
function createObjectAtlas() {
    var objects = [];           // Array of discovered objects
    var objectPaths = [];       // Array of path arrays for each object
    var objectMetadata = [];    // Array of metadata for each object
    var pathToObjectMap = {};   // Map from path strings to object indices
    var typeIndex = {};         // Index of objects by type
    var counter = 0;
    
    return {
        /**
         * Register object with comprehensive tracking
         * @param {Object} obj - Object to register
         * @param {String} path - Access path to object
         * @param {Object} metadata - Object metadata
         * @returns {Object} - Registration result with atlas information
         */
        registerObject: function(obj, path, metadata) {
            try {
                if (!obj || typeof obj !== 'object') {
                    return { success: false, reason: 'Invalid object' };
                }
                
                // Check if object already exists
                for (var i = 0; i < objects.length; i++) {
                    if (isSameObjectReference(objects[i], obj)) {
                        // Add new path to existing object
                        objectPaths[i].push(path);
                        pathToObjectMap[path] = i;
                        
                        return {
                            success: true,
                            objectIndex: i,
                            isNew: false,
                            totalPaths: objectPaths[i].length,
                            isDuplicate: true
                        };
                    }
                }
                
                // New object - register it
                var objectIndex = counter;
                objects.push(obj);
                objectPaths.push([path]);
                objectMetadata.push(metadata || {});
                pathToObjectMap[path] = objectIndex;
                
                // Update type index
                var objType = metadata ? metadata.type : typeof obj;
                if (!typeIndex[objType]) {
                    typeIndex[objType] = [];
                }
                typeIndex[objType].push(objectIndex);
                
                counter++;
                
                return {
                    success: true,
                    objectIndex: objectIndex,
                    isNew: true,
                    totalPaths: 1,
                    isDuplicate: false
                };
                
            } catch (exc) {
                return { success: false, reason: 'Registration error: ' + exc.message };
            }
        },
        
        /**
         * Get all paths to specific object
         * @param {Number} objectIndex - Object index in atlas
         * @returns {Array} - Array of paths to object
         */
        getObjectPaths: function(objectIndex) {
            if (objectIndex >= 0 && objectIndex < objectPaths.length) {
                return objectPaths[objectIndex].slice(); // Return copy
            }
            return [];
        },
        
        /**
         * Get object by index
         * @param {Number} objectIndex - Object index
         * @returns {Object} - Object reference or null
         */
        getObject: function(objectIndex) {
            if (objectIndex >= 0 && objectIndex < objects.length) {
                return objects[objectIndex];
            }
            return null;
        },
        
        /**
         * Get object metadata
         * @param {Number} objectIndex - Object index
         * @returns {Object} - Object metadata
         */
        getObjectMetadata: function(objectIndex) {
            if (objectIndex >= 0 && objectIndex < objectMetadata.length) {
                return objectMetadata[objectIndex];
            }
            return {};
        },
        
        /**
         * Find object index by path
         * @param {String} path - Access path
         * @returns {Number} - Object index or -1 if not found
         */
        findObjectByPath: function(path) {
            if (pathToObjectMap.hasOwnProperty(path)) {
                return pathToObjectMap[path];
            }
            return -1;
        },
        
        /**
         * Get objects by type
         * @param {String} objType - Object type
         * @returns {Array} - Array of object indices
         */
        getObjectsByType: function(objType) {
            if (typeIndex[objType]) {
                return typeIndex[objType].slice(); // Return copy
            }
            return [];
        },
        
        /**
         * Get atlas statistics
         * @returns {Object} - Atlas statistics
         */
        getStatistics: function() {
            var duplicateObjects = 0;
            var totalPaths = 0;
            
            for (var i = 0; i < objectPaths.length; i++) {
                totalPaths += objectPaths[i].length;
                if (objectPaths[i].length > 1) {
                    duplicateObjects++;
                }
            }
            
            return {
                totalObjects: objects.length,
                duplicateObjects: duplicateObjects,
                totalPaths: totalPaths,
                averagePathsPerObject: objects.length > 0 ? totalPaths / objects.length : 0,
                types: Object.keys(typeIndex).length
            };
        },
        
        /**
         * Generate access pattern report
         * @returns {Array} - Array of access pattern objects
         */
        generateAccessPatterns: function() {
            var patterns = [];
            
            for (var i = 0; i < objects.length; i++) {
                var paths = objectPaths[i];
                var metadata = objectMetadata[i];
                
                if (paths.length > 1) {
                    patterns.push({
                        objectIndex: i,
                        objectType: metadata.type || 'unknown',
                        accessPaths: paths.slice(),
                        pathCount: paths.length,
                        primaryPath: paths[0],
                        alternativePaths: paths.slice(1)
                    });
                }
            }
            
            return patterns;
        },
        
        /**
         * Clean up atlas memory
         */
        cleanup: function() {
            objects = [];
            objectPaths = [];
            objectMetadata = [];
            pathToObjectMap = {};
            typeIndex = {};
            counter = 0;
        }
    };
}

/**
 * Create circular reference mapper
 * @returns {Object} - Circular reference mapper with analysis methods
 */
function createCircularReferenceMapper() {
    var circularPaths = [];
    var circularObjects = [];
    var circularMetadata = [];
    
    return {
        /**
         * Record circular reference discovery
         * @param {String} path - Path where circular reference was detected
         * @param {Object} obj - Object involved in circular reference
         * @param {Object} metadata - Additional metadata
         */
        recordCircularReference: function(path, obj, metadata) {
            try {
                circularPaths.push(path);
                circularObjects.push(obj);
                circularMetadata.push(metadata || {});
            } catch (exc) {
                $.writeln('Error recording circular reference: ' + exc.message);
            }
        },
        
        /**
         * Analyze circular reference patterns
         * @returns {Object} - Analysis of circular patterns
         */
        analyzePatterns: function() {
            var patterns = {
                totalCircularReferences: circularPaths.length,
                uniqueObjects: 0,
                pathPatterns: [],
                typePatterns: {}
            };
            
            try {
                // Count unique objects involved in circular references
                var uniqueObjs = [];
                for (var i = 0; i < circularObjects.length; i++) {
                    var found = false;
                    for (var j = 0; j < uniqueObjs.length; j++) {
                        if (isSameObjectReference(uniqueObjs[j], circularObjects[i])) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        uniqueObjs.push(circularObjects[i]);
                    }
                }
                patterns.uniqueObjects = uniqueObjs.length;
                
                // Analyze path patterns
                for (var i = 0; i < circularPaths.length; i++) {
                    var path = circularPaths[i];
                    var pathComponents = splitPath(path);
                    
                    patterns.pathPatterns.push({
                        fullPath: path,
                        depth: pathComponents.length,
                        components: pathComponents,
                        metadata: circularMetadata[i]
                    });
                }
                
                // Analyze type patterns
                for (var i = 0; i < circularMetadata.length; i++) {
                    var metadata = circularMetadata[i];
                    var objType = metadata.type || 'unknown';
                    
                    if (!patterns.typePatterns[objType]) {
                        patterns.typePatterns[objType] = 0;
                    }
                    patterns.typePatterns[objType]++;
                }
                
            } catch (exc) {
                patterns.error = 'Pattern analysis failed: ' + exc.message;
            }
            
            return patterns;
        },
        
        /**
         * Get circular reference statistics
         * @returns {Object} - Circular reference statistics
         */
        getStatistics: function() {
            return {
                totalReferences: circularPaths.length,
                referencePaths: circularPaths.slice(),
                hasCircularReferences: circularPaths.length > 0
            };
        },
        
        /**
         * Clean up mapper memory
         */
        cleanup: function() {
            circularPaths = [];
            circularObjects = [];
            circularMetadata = [];
        }
    };
}

// ============================================================================
// DEEP MAPPING CORE ENGINE
// ============================================================================

/**
 * Perform exhaustive deep DOM mapping with comprehensive tracking
 * @param {Object} doc - InDesign document object
 * @param {Object} config - Deep mapping configuration
 * @returns {Object} - Complete deep mapping session
 */
function performDeepDOMMapping(doc, config) {
    var startTime = new Date().getTime();
    
    // Merge configuration
    var mappingConfig = mergeDeepMappingConfig(DEFAULT_DEEP_MAPPING_CONFIG, config);
    
    // Create mapping session
    var session = createDeepMappingSession();
    session.metadata.config = mappingConfig;
    
    // Get document name safely
    if (safeTypeCheck(doc, 'name') === 'string') {
        session.metadata.documentName = doc.name;
    }
    
    $.writeln('');
    $.writeln('==========================================');
    $.writeln('DEEP DOM MAPPING STARTED');
    $.writeln('==========================================');
    $.writeln('Session ID: ' + session.metadata.sessionID);
    $.writeln('Max Depth: ' + mappingConfig.maxDepth);
    $.writeln('Timeout: ' + mappingConfig.timeoutMs + 'ms');
    $.writeln('Max Objects: ' + mappingConfig.maxTotalObjects);
    $.writeln('');
    
    try {
        // Initialize core components
        session.objectAtlas = createObjectAtlas();
        session.circularMap = createCircularReferenceMapper();
        session.referenceTracker = createObjectReferenceTracker();
        
        // Create main timeout checker
        var timeoutChecker = createTimeoutChecker(mappingConfig.timeoutMs);
        var operationCounter = createEnhancedOperationCounter(mappingConfig.maxTotalObjects);
        var memoryMonitor = createMemoryMonitor();
        
        // Start deep mapping from document root
        session.deepStructure = performDeepObjectMapping(
            doc,
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
        
        // Finalize session
        session.metadata.endTime = new Date().getTime();
        session.metadata.totalTime = session.metadata.endTime - session.metadata.startTime;
        
        // Generate final statistics
        var atlasStats = session.objectAtlas.getStatistics();
        session.statistics.totalObjectsDiscovered = operationCounter.getCount();
        session.statistics.uniqueObjects = atlasStats.totalObjects;
        session.statistics.duplicateReferences = atlasStats.duplicateObjects;
        session.statistics.totalPaths = atlasStats.totalPaths;
        
        var circularStats = session.circularMap.getStatistics();
        session.statistics.circularReferences = circularStats.totalReferences;
        
        var refStats = session.referenceTracker.getStatistics();
        session.statistics.maxDepthReached = session.statistics.maxDepthReached || 0;
        
        $.writeln('DEEP MAPPING COMPLETE:');
        $.writeln('  Total objects discovered: ' + session.statistics.totalObjectsDiscovered);
        $.writeln('  Unique objects: ' + session.statistics.uniqueObjects);
        $.writeln('  Duplicate references: ' + session.statistics.duplicateReferences);
        $.writeln('  Total access paths: ' + session.statistics.totalPaths);
        $.writeln('  Circular references: ' + session.statistics.circularReferences);
        $.writeln('  Max depth reached: ' + session.statistics.maxDepthReached);
        $.writeln('  Total time: ' + session.metadata.totalTime + 'ms');
        $.writeln('==========================================');
        
    } catch (exc) {
        session.statistics.errors.push('Deep mapping failed: ' + exc.message);
        $.writeln('ERROR: Deep DOM mapping failed: ' + exc.message);
    }
    
    return session;
}

/**
 * Perform deep object mapping with comprehensive tracking
 * @param {Object} obj - Object to map
 * @param {String} objName - Object name
 * @param {String} objPath - Full object path
 * @param {Number} depth - Current depth level
 * @param {Object} config - Mapping configuration
 * @param {Object} session - Mapping session
 * @param {Function} timeoutChecker - Timeout checking function
 * @param {Object} operationCounter - Operation counter
 * @param {Object} memoryMonitor - Memory monitor
 * @param {Array} parentPaths - Array of parent paths for circular detection
 * @returns {Object} - Deep DOM node structure
 */
function performDeepObjectMapping(obj, objName, objPath, depth, config, session, timeoutChecker, operationCounter, memoryMonitor, parentPaths) {
    // Check limits and timeouts
    if (timeoutChecker()) {
        session.statistics.timeouts++;
        return null;
    }
    
    if (operationCounter.check()) {
        session.statistics.errors.push('Object limit exceeded at: ' + objPath);
        return null;
    }
    
    if (depth > config.maxDepth) {
        return null;
    }
    
    // Memory monitoring
    if (operationCounter.getCount() % config.memoryCheckInterval === 0) {
        session.statistics.memoryChecks++;
        memoryMonitor.checkpoint('depth_' + depth + '_objects_' + operationCounter.getCount());
    }
    
    // Progress reporting
    if (config.enableProgressReporting && operationCounter.getCount() % 500 === 0) {
        $.writeln('  Deep mapping progress: ' + operationCounter.getCount() + ' objects, depth ' + depth);
    }
    
    // Check for circular references
    if (detectCircularReference(objPath, parentPaths)) {
        session.circularMap.recordCircularReference(objPath, obj, {
            type: typeof obj,
            depth: depth,
            detectedAt: getCurrentTimestamp()
        });
        
        var circularNode = createDeepDOMNode(objName, objPath, 'object', depth);
        circularNode.hasCircularRefs = true;
        circularNode.circularRefPath = objPath;
        return circularNode;
    }
    
    // Create object metadata
    var objMetadata = {
        name: objName,
        path: objPath,
        type: typeof obj,
        depth: depth,
        discoveredAt: getCurrentTimestamp()
    };
    
    // Register object in atlas
    var atlasResult = session.objectAtlas.registerObject(obj, objPath, objMetadata);
    
    // Track in reference tracker
    if (config.trackAllPaths) {
        session.referenceTracker.trackObject(obj, objPath);
    }
    
    // Create deep DOM node
    var objType = typeof obj;
    if (typeof obj === 'object' && obj !== null) {
        objType = 'object';
    }
    
    var deepNode = createDeepDOMNode(objName, objPath, objType, depth);
    deepNode.atlasInfo = atlasResult;
    
    session.statistics.totalObjectsDiscovered++;
    operationCounter.increment();
    
    // Track maximum depth
    if (depth > session.statistics.maxDepthReached) {
        session.statistics.maxDepthReached = depth;
    }
    
    // Only enumerate properties if this is an object
    if (typeof obj !== 'object' || obj === null) {
        return deepNode;
    }
    
    // Create new parent path array to avoid mutation
    var newParentPaths = [];
    for (var i = 0; i < parentPaths.length; i++) {
        newParentPaths.push(parentPaths[i]);
    }
    newParentPaths.push(objPath);
    
    try {
        // Deep property enumeration
        for (var propName in obj) {
            // Check timeouts and limits frequently
            if (timeoutChecker()) {
                session.statistics.timeouts++;
                break;
            }
            
            if (operationCounter.check()) {
                break;
            }
            
            operationCounter.increment();
            
            try {
                // Enhanced safety checks for deep mapping
                if (isDangerousProperty(propName) && !config.includeSystemObjects) {
                    continue;
                }
                
                if (isReservedWord(propName)) {
                    continue;
                }
                
                // Check if path would be dangerous
                var childPath = objPath + '.' + propName;
                if (isDangerousPath(childPath)) {
                    continue;
                }
                
                // Get property type safely
                var propType = safeTypeCheck(obj, propName);
                if (propType === 'error') {
                    continue;
                }
                
                // Create enhanced property classification
                var propClassification = createEnhancedPropertyClassification(
                    propName, 
                    propType, 
                    objPath, 
                    depth
                );
                
                // Add to appropriate category
                if (propClassification.isMethod) {
                    deepNode.methods.push(propClassification);
                } else if (propClassification.isCollection) {
                    deepNode.collections.push(propClassification);
                } else {
                    deepNode.properties.push(propClassification);
                }
                
                // Deep recursion for objects (enhanced criteria)
                if (propType === 'object' && 
                    depth < config.maxDepth && 
                    shouldRecurseIntoProperty(propClassification, config)) {
                    
                    try {
                        // SAFE RECURSIVE ACCESS - we've already verified the property exists
                        var childObj = obj[propName];
                        
                        if (childObj && typeof childObj === 'object') {
                            var childNode = performDeepObjectMapping(
                                childObj,
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
                            }
                        }
                        
                    } catch (accessExc) {
                        deepNode.enumerationErrors.push('Deep access error for ' + propName + ': ' + accessExc.message);
                    }
                }
                
            } catch (propExc) {
                deepNode.enumerationErrors.push('Deep property enumeration error ' + propName + ': ' + propExc.message);
                session.statistics.errors.push('Deep property error at ' + objPath + '.' + propName + ': ' + propExc.message);
            }
        }
        
    } catch (enumExc) {
        deepNode.enumerationErrors.push('Deep enumeration failed: ' + enumExc.message);
        session.statistics.errors.push('Deep object enumeration error at ' + objPath + ': ' + enumExc.message);
    }
    
    return deepNode;
}

// ============================================================================
// DEEP MAPPING UTILITIES
// ============================================================================

/**
 * Create enhanced DOM node for deep mapping
 * @param {String} name - Object name
 * @param {String} path - Full dot path to object
 * @param {String} objType - Object type from typeof
 * @param {Number} depth - Nesting level
 * @returns {Object} - Enhanced DOMNode object
 */
function createDeepDOMNode(name, path, objType, depth) {
    return {
        name: name,
        path: path,
        type: objType,
        depth: depth,
        properties: [],
        collections: [],
        methods: [],
        childNodes: [],
        parentPath: getParentPath(path),
        hasCircularRefs: false,
        circularRefPath: '',
        enumerationErrors: [],
        // Enhanced fields for deep mapping
        atlasInfo: null,            // Object atlas registration info
        accessPatterns: [],         // Multiple access patterns to this object
        referenceInfo: null,        // Reference tracking information
        deepMappingMetadata: {
            discoveredAt: getCurrentTimestamp(),
            mappingDepth: depth,
            isDeepMapped: true
        }
    };
}

/**
 * Create enhanced property classification for deep mapping
 * @param {String} propName - Property name
 * @param {String} propType - Property type from typeof
 * @param {String} objPath - Full path to containing object
 * @param {Number} depth - Current depth level
 * @returns {Object} - Enhanced PropertyClassification object
 */
function createEnhancedPropertyClassification(propName, propType, objPath, depth) {
    var classification = createPropertyClassification(propName, propType, objPath);
    
    // Enhanced fields for deep mapping
    classification.depth = depth;
    classification.parentPath = objPath;
    classification.fullPath = objPath + '.' + propName;
    classification.isDeepMapped = true;
    classification.pathComponents = splitPath(classification.fullPath);
    classification.normalizedPath = normalizePath(classification.fullPath);
    
    // Enhanced safety analysis for deep mapping
    classification.pathSafety = analyzePathSafety(classification.fullPath);
    classification.recursionSafety = analyzeRecursionSafety(propName, propType, depth);
    
    return classification;
}

/**
 * Determine if property should be recursed into during deep mapping
 * @param {Object} propClassification - Property classification
 * @param {Object} config - Deep mapping configuration
 * @returns {Boolean} - true if should recurse
 */
function shouldRecurseIntoProperty(propClassification, config) {
    try {
        // Never recurse into dangerous properties
        if (propClassification.safetyLevel === 'dangerous') {
            return false;
        }
        
        // Don't recurse into system objects unless explicitly enabled
        if (!config.includeSystemObjects && isDangerousProperty(propClassification.name)) {
            return false;
        }
        
        // Check path safety
        if (propClassification.pathSafety && propClassification.pathSafety.isDangerous) {
            return false;
        }
        
        // Check recursion safety
        if (propClassification.recursionSafety && !propClassification.recursionSafety.canRecurse) {
            return false;
        }
        
        // Safe to recurse
        return true;
        
    } catch (exc) {
        return false; // Err on side of caution
    }
}

/**
 * Analyze path safety for deep mapping
 * @param {String} fullPath - Full dot notation path
 * @returns {Object} - Path safety analysis
 */
function analyzePathSafety(fullPath) {
    return {
        isDangerous: isDangerousPath(fullPath),
        pathLength: splitPath(fullPath).length,
        hasSystemComponents: containsSystemComponents(fullPath),
        normalizedPath: normalizePath(fullPath)
    };
}

/**
 * Analyze recursion safety
 * @param {String} propName - Property name
 * @param {String} propType - Property type
 * @param {Number} currentDepth - Current recursion depth
 * @returns {Object} - Recursion safety analysis
 */
function analyzeRecursionSafety(propName, propType, currentDepth) {
    return {
        canRecurse: propType === 'object' && !isDangerousProperty(propName) && currentDepth < 10,
        reason: propType !== 'object' ? 'not_object' : 
                isDangerousProperty(propName) ? 'dangerous_property' :
                currentDepth >= 10 ? 'depth_limit' : 'safe',
        recommendedAction: 'recurse'
    };
}

/**
 * Check if path contains system components
 * @param {String} path - Path to check
 * @returns {Boolean} - true if contains system components
 */
function containsSystemComponents(path) {
    var systemComponents = ['constructor', 'prototype', '__proto__', 'app', 'system'];
    var lowerPath = path.toLowerCase();
    
    for (var i = 0; i < systemComponents.length; i++) {
        if (lowerPath.indexOf(systemComponents[i]) !== -1) {
            return true;
        }
    }
    
    return false;
}

/**
 * Merge deep mapping configuration with defaults
 * @param {Object} defaults - Default configuration
 * @param {Object} userConfig - User configuration
 * @returns {Object} - Merged configuration
 */
function mergeDeepMappingConfig(defaults, userConfig) {
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
 * Quick deep mapping with default configuration
 * @param {Object} doc - InDesign document object
 * @returns {Object} - Deep mapping session
 */
function quickDeepMap(doc) {
    var quickConfig = {
        maxDepth: 4,
        timeoutMs: 15000,
        maxTotalObjects: 5000,
        enableProgressReporting: false
    };
    
    return performDeepDOMMapping(doc, quickConfig);
}

/**
 * Conservative deep mapping for large documents
 * @param {Object} doc - InDesign document object
 * @returns {Object} - Deep mapping session
 */
function conservativeDeepMap(doc) {
    var conservativeConfig = {
        maxDepth: 3,
        timeoutMs: 20000,
        maxTotalObjects: 3000,
        includeSystemObjects: false,
        enableProgressReporting: true
    };
    
    return performDeepDOMMapping(doc, conservativeConfig);
}

/**
 * Aggressive deep mapping for comprehensive analysis
 * @param {Object} doc - InDesign document object
 * @returns {Object} - Deep mapping session
 */
function aggressiveDeepMap(doc) {
    var aggressiveConfig = {
        maxDepth: 8,
        timeoutMs: 60000,
        maxTotalObjects: 20000,
        includeSystemObjects: true,
        enableProgressReporting: true
    };
    
    return performDeepDOMMapping(doc, aggressiveConfig);
}

/**
 * Get deep mapping statistics
 * @param {Object} session - Deep mapping session
 * @returns {Object} - Comprehensive statistics
 */
function getDeepMappingStatistics(session) {
    var defaultStats = {
        totalObjectsDiscovered: 0,
        uniqueObjects: 0,
        duplicateReferences: 0,
        totalPaths: 0,
        hasDeepMapping: false
    };
    
    if (!session || !session.statistics) {
        return defaultStats;
    }
    
    var stats = {
        totalObjectsDiscovered: session.statistics.totalObjectsDiscovered,
        uniqueObjects: session.statistics.uniqueObjects,
        duplicateReferences: session.statistics.duplicateReferences,
        totalPaths: session.statistics.totalPaths,
        circularReferences: session.statistics.circularReferences,
        maxDepthReached: session.statistics.maxDepthReached,
        timeouts: session.statistics.timeouts,
        errors: session.statistics.errors.length,
        totalTime: session.metadata.totalTime || 0,
        hasDeepMapping: true,
        sessionID: session.metadata.sessionID
    };
    
    // Add atlas statistics if available
    if (session.objectAtlas) {
        var atlasStats = session.objectAtlas.getStatistics();
        stats.atlasStatistics = atlasStats;
    }
    
    return stats;
}

// ============================================================================
// MODULE INITIALIZATION
// ============================================================================

/**
 * Initialize deep mapper core module
 * @returns {Boolean} - true if initialization successful
 */
function initializeDeepMapperCore() {
    try {
        // Check dependencies
        if (typeof safeTypeCheck !== 'function') {
            $.writeln('ERROR: Safe foundation module (1.0) not loaded');
            return false;
        }
        
        if (typeof createPropertyClassification !== 'function') {
            $.writeln('ERROR: DOM enumerator module (2.0) not loaded');
            return false;
        }
        
        // Test core functions
        var requiredFunctions = [
            'performDeepDOMMapping', 'createObjectAtlas', 'createCircularReferenceMapper'
        ];
        
        for (var i = 0; i < requiredFunctions.length; i++) {
            if (typeof eval(requiredFunctions[i]) !== 'function') {
                $.writeln('ERROR: Required function missing: ' + requiredFunctions[i]);
                return false;
            }
        }
        
        $.writeln('9.1_deep-mapper-core.jsx: Initialized successfully');
        $.writeln('Core features: Exhaustive DOM mapping, object atlas, circular reference tracking');
        $.writeln('Use performDeepDOMMapping(doc, config) for comprehensive DOM analysis');
        return true;
        
    } catch (exc) {
        $.writeln('ERROR: Deep mapper core initialization failed: ' + exc.message);
        return false;
    }
}

// Auto-initialize when module loads
initializeDeepMapperCore();