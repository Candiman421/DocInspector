//
// 9.0_deep-mapper.jsx
// InDesign DOM Discovery Builder - Complete DOM Mapping with Object Deduplication
// CORE PURPOSE: Exhaustive DOM traversal with comprehensive object reference tracking
// DEPENDENCIES: 1.0_safe-foundation.jsx, 2.0_dom-enumerator.jsx
// SAFETY: Ultra-safe deep traversal with extensive circular reference protection
// ES3 COMPATIBLE: No reserved words, no modern JS features
// USAGE: Generate comprehensive object atlas showing every way to reach each object
//

// ============================================================================
// DEEP MAPPER CONFIGURATION
// ============================================================================

var DEEP_MAPPER_CONFIG = {
    maxDepth: 6,                        // Maximum traversal depth (deeper than standard enumeration)
    timeoutMs: 30000,                   // Extended timeout for deep analysis (30 seconds)
    maxProperties: 10000,               // Higher property limit for comprehensive mapping
    maxObjectsToTrack: 5000,           // Maximum objects to track in atlas
    enableExhaustiveTraversal: true,    // Enable deep property value access
    enableObjectAtlas: true,            // Build comprehensive object atlas
    enablePathDeduplication: true,      // Deduplicate access paths
    enableCircularReferenceMapping: true, // Map circular references comprehensively
    enableValueBasedIdentity: false,    // Use property values for object identity (risky)
    maxCircularDepth: 3,               // Maximum depth to follow circular references
    enableProgressReporting: true,     // Report progress during deep mapping
    pathCompressionThreshold: 100,     // Compress paths longer than this
    enableSmartFiltering: true,         // Filter obviously redundant paths
    maxAlternativePathsPerObject: 50,  // Limit alternative paths tracked per object
    enablePropertyValueHashing: false, // Hash property values for identity (dangerous)
    prioritizeUniqueObjects: true,     // Focus on tracking unique object instances
    enableDeepPropertyAnalysis: true   // Analyze properties deeply during traversal
};

// ============================================================================
// OBJECT ATLAS DATA STRUCTURES
// ============================================================================

/**
 * Create comprehensive object atlas
 * @returns {Object} - Object atlas structure
 */
function createObjectAtlas() {
    return {
        metadata: {
            creationTime: getCurrentTimestamp(),
            version: '9.0_deep-mapper',
            config: null,
            documentName: 'Unknown'
        },
        statistics: {
            totalObjectsTracked: 0,
            uniqueObjectsFound: 0,
            totalAccessPaths: 0,
            maxAlternativePathsFound: 0,
            circularReferencesDetected: 0,
            deepestPathDepth: 0,
            processingTime: 0,
            memoryUsageEstimate: 0
        },
        objectMap: {
            // objectId -> ObjectAtlasEntry
        },
        pathIndex: {
            // path -> objectId
        },
        circularReferenceMap: {
            // circularId -> CircularReferenceEntry
        },
        accessPatternAnalysis: {
            mostAccessedObjects: [],
            mostComplexObjects: [],
            redundantPaths: [],
            recommendedPaths: []
        }
    };
}

/**
 * Create object atlas entry for a discovered object
 * @param {String} objectId - Unique object identifier
 * @param {String} primaryPath - Primary access path
 * @param {String} objectType - Object type
 * @param {Number} discoveryDepth - Depth at which object was discovered
 * @returns {Object} - ObjectAtlasEntry
 */
function createObjectAtlasEntry(objectId, primaryPath, objectType, discoveryDepth) {
    return {
        objectId: objectId,
        primaryPath: primaryPath,
        objectType: objectType,
        discoveryDepth: discoveryDepth,
        alternativePaths: [],
        accessMetrics: {
            totalAccessPaths: 1,
            shortestPathLength: primaryPath.split('.').length,
            averagePathLength: 0,
            pathComplexity: calculatePathComplexity(primaryPath)
        },
        objectCharacteristics: {
            hasCircularRefs: false,
            isCollection: false,
            isMethod: false,
            estimatedSize: 0,
            propertyCount: 0
        },
        relationships: {
            parentObjects: [],
            childObjects: [],
            circularReferences: []
        },
        analysisData: {
            firstSeen: getCurrentTimestamp(),
            lastAnalyzed: getCurrentTimestamp(),
            analysisDepth: discoveryDepth,
            safetyLevel: 'unknown'
        }
    };
}

/**
 * Create circular reference entry
 * @param {String} circularId - Unique circular reference identifier
 * @param {String} objectId - Object involved in circular reference
 * @param {Array} pathChain - Array of paths forming the circular reference
 * @returns {Object} - CircularReferenceEntry
 */
function createCircularReferenceEntry(circularId, objectId, pathChain) {
    return {
        circularId: circularId,
        objectId: objectId,
        pathChain: pathChain.slice(), // Copy array
        circularType: determineCircularType(pathChain),
        depth: pathChain.length,
        detectionTime: getCurrentTimestamp(),
        isResolvable: false,
        recommendedBreakPoint: findRecommendedBreakPoint(pathChain)
    };
}

// ============================================================================
// MAIN DEEP MAPPING FUNCTIONS
// ============================================================================

/**
 * Perform comprehensive deep mapping of InDesign document DOM
 * @param {Object} document - InDesign document object
 * @param {Object} mappingConfig - Deep mapping configuration
 * @returns {Object} - {success: boolean, objectAtlas: object, error: string}
 */
function performDeepDOMMapping(document, mappingConfig) {
    var result = {
        success: false,
        objectAtlas: null,
        error: ''
    };
    
    try {
        $.writeln('');
        $.writeln('==========================================');
        $.writeln('DEEP DOM MAPPING STARTED');
        $.writeln('==========================================');
        $.writeln('🔍 COMPREHENSIVE ANALYSIS: Exhaustive object discovery and deduplication');
        
        // Validate environment
        var envResult = validateInDesignEnvironment();
        if (!envResult.valid) {
            result.error = 'Environment validation failed: ' + envResult.error;
            return result;
        }
        
        // Merge configuration
        var config = mergeDeepMappingConfig(DEEP_MAPPER_CONFIG, mappingConfig);
        var startTime = new Date().getTime();
        
        $.writeln('Configuration:');
        $.writeln('  Max Depth: ' + config.maxDepth);
        $.writeln('  Max Objects: ' + config.maxObjectsToTrack);
        $.writeln('  Exhaustive Traversal: ' + config.enableExhaustiveTraversal);
        $.writeln('  Object Atlas: ' + config.enableObjectAtlas);
        $.writeln('');
        
        // Create object atlas
        var objectAtlas = createObjectAtlas();
        objectAtlas.metadata.config = config;
        objectAtlas.metadata.documentName = safeTypeCheck(document, 'name') === 'string' ? document.name : 'Unknown';
        
        // Initialize deep mapping state
        var mappingState = initializeDeepMappingState(config, objectAtlas);
        
        // Perform exhaustive traversal
        var traversalResult = performExhaustiveTraversal(
            document,
            'document',
            'document', 
            0,
            config,
            mappingState
        );
        
        if (!traversalResult.success) {
            result.error = 'Exhaustive traversal failed: ' + traversalResult.error;
            return result;
        }
        
        // Post-processing analysis
        performObjectAtlasAnalysis(objectAtlas, config);
        
        // Calculate final statistics
        objectAtlas.statistics.processingTime = new Date().getTime() - startTime;
        objectAtlas.statistics.memoryUsageEstimate = estimateMemoryUsage(objectAtlas);
        
        $.writeln('DEEP DOM MAPPING COMPLETE:');
        $.writeln('  Objects tracked: ' + objectAtlas.statistics.totalObjectsTracked);
        $.writeln('  Unique objects: ' + objectAtlas.statistics.uniqueObjectsFound);
        $.writeln('  Total access paths: ' + objectAtlas.statistics.totalAccessPaths);
        $.writeln('  Circular references: ' + objectAtlas.statistics.circularReferencesDetected);
        $.writeln('  Deepest path: ' + objectAtlas.statistics.deepestPathDepth + ' levels');
        $.writeln('  Processing time: ' + objectAtlas.statistics.processingTime + 'ms');
        $.writeln('  Memory estimate: ' + Math.round(objectAtlas.statistics.memoryUsageEstimate / 1024) + 'KB');
        $.writeln('==========================================');
        
        result.success = true;
        result.objectAtlas = objectAtlas;
        
    } catch (exc) {
        result.error = 'Deep DOM mapping failed: ' + exc.message;
        $.writeln('ERROR: Deep DOM mapping failed: ' + exc.message);
    }
    
    return result;
}

/**
 * Initialize deep mapping state
 * @param {Object} config - Mapping configuration
 * @param {Object} objectAtlas - Object atlas to populate
 * @returns {Object} - Deep mapping state
 */
function initializeDeepMappingState(config, objectAtlas) {
    return {
        objectAtlas: objectAtlas,
        visitedObjects: {},              // objectId -> visit count
        currentPath: [],                 // Current traversal path
        pathHistory: [],                 // History of all paths traversed
        circularDetectionStack: [],      // Stack for circular reference detection
        objectIdCounter: 0,              // Counter for generating object IDs
        timeoutChecker: createTimeoutChecker(config.timeoutMs),
        operationCounter: createOperationCounter(config.maxProperties),
        progressReporter: createProgressReporter(config.enableProgressReporting),
        memoryManager: createMemoryManager(),
        safetyValidator: createSafetyValidator(config)
    };
}

/**
 * Perform exhaustive DOM traversal with comprehensive object tracking
 * @param {Object} currentObject - Current object being traversed
 * @param {String} objectName - Name of current object
 * @param {String} objectPath - Full path to current object
 * @param {Number} depth - Current traversal depth
 * @param {Object} config - Mapping configuration
 * @param {Object} mappingState - Current mapping state
 * @returns {Object} - {success: boolean, error: string}
 */
function performExhaustiveTraversal(currentObject, objectName, objectPath, depth, config, mappingState) {
    var result = {
        success: true,
        error: ''
    };
    
    try {
        // Check termination conditions
        if (mappingState.timeoutChecker()) {
            result.error = 'Timeout during exhaustive traversal at: ' + objectPath;
            return result;
        }
        
        if (mappingState.operationCounter.check()) {
            result.error = 'Operation limit exceeded at: ' + objectPath;
            return result;
        }
        
        if (depth > config.maxDepth) {
            return result; // Silent depth limit
        }
        
        if (mappingState.objectAtlas.statistics.totalObjectsTracked >= config.maxObjectsToTrack) {
            result.error = 'Object tracking limit reached';
            return result;
        }
        
        // Report progress
        mappingState.progressReporter.report(depth, objectPath, mappingState.objectAtlas.statistics.totalObjectsTracked);
        
        // Generate or retrieve object identity
        var objectIdentity = generateComprehensiveObjectIdentity(currentObject, objectPath, config);
        
        // Check for circular references
        var circularCheck = detectComprehensiveCircularReference(
            objectIdentity.objectId,
            objectPath,
            mappingState.circularDetectionStack,
            config
        );
        
        if (circularCheck.isCircular) {
            handleCircularReference(circularCheck, mappingState.objectAtlas, config);
            return result; // Don't traverse circular references further
        }
        
        // Track object in atlas
        var atlasEntry = trackObjectInAtlas(
            objectIdentity,
            objectPath,
            depth,
            mappingState.objectAtlas,
            config
        );
        
        // Update path tracking
        mappingState.currentPath.push(objectPath);
        mappingState.circularDetectionStack.push({
            objectId: objectIdentity.objectId,
            path: objectPath,
            depth: depth
        });
        
        // Only traverse objects if we haven't exceeded safety limits
        if (typeof currentObject === 'object' && currentObject !== null) {
            
            // Analyze current object comprehensively
            var objectAnalysis = analyzeObjectComprehensively(
                currentObject,
                objectPath,
                config,
                mappingState
            );
            
            // Update atlas entry with analysis data
            enhanceAtlasEntryWithAnalysis(atlasEntry, objectAnalysis);
            
            // Traverse object properties if enabled
            if (config.enableExhaustiveTraversal) {
                var traversalResult = traverseObjectPropertiesExhaustively(
                    currentObject,
                    objectPath,
                    depth,
                    config,
                    mappingState
                );
                
                if (!traversalResult.success) {
                    result.error = traversalResult.error;
                }
            }
        }
        
        // Clean up traversal state
        mappingState.currentPath.pop();
        mappingState.circularDetectionStack.pop();
        mappingState.memoryManager.cleanup();
        
    } catch (exc) {
        result.success = false;
        result.error = 'Exhaustive traversal exception at ' + objectPath + ': ' + exc.message;
    }
    
    return result;
}

/**
 * Traverse object properties exhaustively with safety measures
 * @param {Object} currentObject - Object to traverse
 * @param {String} objectPath - Current object path
 * @param {Number} depth - Current depth
 * @param {Object} config - Configuration
 * @param {Object} mappingState - Mapping state
 * @returns {Object} - {success: boolean, error: string}
 */
function traverseObjectPropertiesExhaustively(currentObject, objectPath, depth, config, mappingState) {
    var result = {
        success: true,
        error: ''
    };
    
    try {
        var propertyCount = 0;
        var maxPropertiesPerObject = Math.floor(config.maxProperties / (depth + 1)); // Reduce at deeper levels
        
        for (var propName in currentObject) {
            // Safety checks
            if (mappingState.timeoutChecker()) {
                result.error = 'Timeout during property traversal';
                break;
            }
            
            if (propertyCount >= maxPropertiesPerObject) {
                break; // Limit properties per object at each depth
            }
            
            // Skip dangerous properties
            if (isDangerousProperty(propName) || isReservedWord(propName)) {
                continue;
            }
            
            // Safety validation
            if (!mappingState.safetyValidator.isPropertySafe(currentObject, propName, depth)) {
                continue;
            }
            
            try {
                // Get property type first (safe operation)
                var propType = safeTypeCheck(currentObject, propName);
                if (propType === 'error') {
                    continue;
                }
                
                var propPath = objectPath + '.' + propName;
                propertyCount++;
                
                // For object properties, potentially traverse deeper
                if (propType === 'object' && depth < config.maxDepth - 1) {
                    
                    // Attempt to access property value (this is where it gets risky)
                    var propertyValue = null;
                    var accessSuccessful = false;
                    
                    if (config.enableExhaustiveTraversal) {
                        try {
                            // Create timeout for individual property access
                            var propTimeout = createTimeoutChecker(1000); // 1 second per property
                            
                            if (!propTimeout()) {
                                propertyValue = currentObject[propName];
                                accessSuccessful = true;
                            }
                        } catch (propExc) {
                            // Property access failed - this is common and expected
                            accessSuccessful = false;
                        }
                    }
                    
                    if (accessSuccessful && propertyValue) {
                        // Recursively traverse the property value
                        var subResult = performExhaustiveTraversal(
                            propertyValue,
                            propName,
                            propPath,
                            depth + 1,
                            config,
                            mappingState
                        );
                        
                        if (!subResult.success && subResult.error.indexOf('limit') !== -1) {
                            result.error = subResult.error;
                            break; // Stop on serious errors
                        }
                    } else {
                        // Still track the property path even if we can't access the value
                        trackInaccessiblePath(propPath, propType, mappingState.objectAtlas);
                    }
                } else {
                    // Track non-object properties or properties at max depth
                    trackPropertyPath(propPath, propType, mappingState.objectAtlas);
                }
                
            } catch (propExc) {
                // Individual property errors shouldn't stop the entire traversal
                continue;
            }
        }
        
    } catch (exc) {
        result.success = false;
        result.error = 'Property traversal exception: ' + exc.message;
    }
    
    return result;
}

// ============================================================================
// OBJECT IDENTITY AND TRACKING
// ============================================================================

/**
 * Generate comprehensive object identity for tracking
 * @param {Object} obj - Object to identify
 * @param {String} objPath - Object path
 * @param {Object} config - Configuration
 * @returns {Object} - {objectId: string, characteristics: object}
 */
function generateComprehensiveObjectIdentity(obj, objPath, config) {
    var identity = {
        objectId: null,
        characteristics: {
            type: typeof obj,
            path: objPath,
            stringRepresentation: '',
            propertySignature: '',
            estimatedSize: 0
        }
    };
    
    try {
        if (typeof obj !== 'object' || obj === null) {
            identity.objectId = 'primitive_' + objPath.replace(/[^a-zA-Z0-9]/g, '_');
            return identity;
        }
        
        // Generate string representation safely
        try {
            identity.characteristics.stringRepresentation = String(obj).substring(0, 100);
        } catch (strExc) {
            identity.characteristics.stringRepresentation = '[unstringable]';
        }
        
        // Generate property signature for identity
        var propertyNames = [];
        var propCount = 0;
        try {
            for (var prop in obj) {
                if (propCount < 5) { // Limit for identity generation
                    propertyNames.push(prop);
                    propCount++;
                } else {
                    break;
                }
            }
        } catch (propExc) {
            // Can't enumerate properties
        }
        
        identity.characteristics.propertySignature = propertyNames.sort().join('|');
        identity.characteristics.estimatedSize = estimateObjectSize(obj);
        
        // Generate object ID from characteristics
        var idComponents = [
            identity.characteristics.type,
            identity.characteristics.stringRepresentation.length,
            identity.characteristics.propertySignature,
            objPath.split('.').length // Path depth
        ];
        
        var hashInput = idComponents.join('|');
        identity.objectId = generateStableHash(hashInput);
        
    } catch (exc) {
        // Fallback to path-based ID
        identity.objectId = 'fallback_' + objPath.replace(/[^a-zA-Z0-9]/g, '_');
    }
    
    return identity;
}

/**
 * Track object in comprehensive atlas
 * @param {Object} objectIdentity - Object identity information
 * @param {String} objectPath - Current object path
 * @param {Number} depth - Discovery depth
 * @param {Object} objectAtlas - Object atlas to update
 * @param {Object} config - Configuration
 * @returns {Object} - Atlas entry for this object
 */
function trackObjectInAtlas(objectIdentity, objectPath, depth, objectAtlas, config) {
    var objectId = objectIdentity.objectId;
    var atlasEntry = null;
    
    try {
        // Check if object already exists in atlas
        if (objectAtlas.objectMap[objectId]) {
            // Object already tracked - add alternative path
            atlasEntry = objectAtlas.objectMap[objectId];
            
            // Add path if not already present and under limit
            if (atlasEntry.alternativePaths.indexOf(objectPath) === -1 &&
                atlasEntry.alternativePaths.length < config.maxAlternativePathsPerObject) {
                
                atlasEntry.alternativePaths.push(objectPath);
                atlasEntry.accessMetrics.totalAccessPaths++;
                
                // Update path metrics
                var pathLength = objectPath.split('.').length;
                if (pathLength < atlasEntry.accessMetrics.shortestPathLength) {
                    atlasEntry.accessMetrics.shortestPathLength = pathLength;
                }
                
                // Recalculate average path length
                var totalLength = atlasEntry.primaryPath.split('.').length;
                for (var i = 0; i < atlasEntry.alternativePaths.length; i++) {
                    totalLength += atlasEntry.alternativePaths[i].split('.').length;
                }
                atlasEntry.accessMetrics.averagePathLength = totalLength / atlasEntry.accessMetrics.totalAccessPaths;
            }
            
            objectAtlas.statistics.totalAccessPaths++;
            
        } else {
            // New object - create atlas entry
            atlasEntry = createObjectAtlasEntry(
                objectId,
                objectPath,
                objectIdentity.characteristics.type,
                depth
            );
            
            // Enhance with identity characteristics
            atlasEntry.objectCharacteristics.estimatedSize = objectIdentity.characteristics.estimatedSize;
            atlasEntry.objectCharacteristics.isCollection = isLikelyCollection(
                objectPath.split('.').pop(),
                objectIdentity.characteristics.type
            );
            
            // Add to atlas
            objectAtlas.objectMap[objectId] = atlasEntry;
            objectAtlas.statistics.totalObjectsTracked++;
            objectAtlas.statistics.uniqueObjectsFound++;
            objectAtlas.statistics.totalAccessPaths++;
        }
        
        // Update path index
        objectAtlas.pathIndex[objectPath] = objectId;
        
        // Update statistics
        var pathDepth = objectPath.split('.').length;
        if (pathDepth > objectAtlas.statistics.deepestPathDepth) {
            objectAtlas.statistics.deepestPathDepth = pathDepth;
        }
        
        var altPathCount = atlasEntry.alternativePaths.length;
        if (altPathCount > objectAtlas.statistics.maxAlternativePathsFound) {
            objectAtlas.statistics.maxAlternativePathsFound = altPathCount;
        }
        
    } catch (exc) {
        $.writeln('Error tracking object in atlas: ' + exc.message);
    }
    
    return atlasEntry;
}

// ============================================================================
// CIRCULAR REFERENCE HANDLING
// ============================================================================

/**
 * Detect comprehensive circular references
 * @param {String} objectId - Current object ID
 * @param {String} objectPath - Current object path
 * @param {Array} detectionStack - Circular detection stack
 * @param {Object} config - Configuration
 * @returns {Object} - {isCircular: boolean, circularChain: array, circularId: string}
 */
function detectComprehensiveCircularReference(objectId, objectPath, detectionStack, config) {
    var result = {
        isCircular: false,
        circularChain: [],
        circularId: null
    };
    
    try {
        // Check for object ID based circular reference
        for (var i = 0; i < detectionStack.length; i++) {
            var stackEntry = detectionStack[i];
            
            if (stackEntry.objectId === objectId) {
                // Found circular reference
                result.isCircular = true;
                result.circularChain = [];
                
                // Build circular chain
                for (var j = i; j < detectionStack.length; j++) {
                    result.circularChain.push(detectionStack[j].path);
                }
                result.circularChain.push(objectPath); // Complete the circle
                
                // Generate circular reference ID
                result.circularId = 'circular_' + objectId + '_depth_' + result.circularChain.length;
                break;
            }
        }
        
        // Additional path-based circular detection for safety
        if (!result.isCircular) {
            for (var i = 0; i < detectionStack.length; i++) {
                if (detectionStack[i].path === objectPath) {
                    result.isCircular = true;
                    result.circularId = 'path_circular_' + i;
                    break;
                }
            }
        }
        
    } catch (exc) {
        $.writeln('Error in circular reference detection: ' + exc.message);
    }
    
    return result;
}

/**
 * Handle discovered circular reference
 * @param {Object} circularCheck - Circular reference detection result
 * @param {Object} objectAtlas - Object atlas to update
 * @param {Object} config - Configuration
 */
function handleCircularReference(circularCheck, objectAtlas, config) {
    try {
        if (!circularCheck.isCircular) return;
        
        // Create circular reference entry
        var circularEntry = createCircularReferenceEntry(
            circularCheck.circularId,
            circularCheck.circularChain[0], // First object in chain
            circularCheck.circularChain
        );
        
        // Add to circular reference map
        objectAtlas.circularReferenceMap[circularCheck.circularId] = circularEntry;
        objectAtlas.statistics.circularReferencesDetected++;
        
        // Update affected objects in atlas
        for (var i = 0; i < circularCheck.circularChain.length; i++) {
            var path = circularCheck.circularChain[i];
            var objectId = objectAtlas.pathIndex[path];
            
            if (objectId && objectAtlas.objectMap[objectId]) {
                var atlasEntry = objectAtlas.objectMap[objectId];
                atlasEntry.objectCharacteristics.hasCircularRefs = true;
                atlasEntry.relationships.circularReferences.push(circularCheck.circularId);
            }
        }
        
        if (config.enableProgressReporting) {
            $.writeln('  Circular reference detected: ' + circularCheck.circularId + 
                     ' (chain length: ' + circularCheck.circularChain.length + ')');
        }
        
    } catch (exc) {
        $.writeln('Error handling circular reference: ' + exc.message);
    }
}

// ============================================================================
// OBJECT ANALYSIS
// ============================================================================

/**
 * Analyze object comprehensively
 * @param {Object} obj - Object to analyze
 * @param {String} objPath - Object path
 * @param {Object} config - Configuration
 * @param {Object} mappingState - Mapping state
 * @returns {Object} - Comprehensive analysis data
 */
function analyzeObjectComprehensively(obj, objPath, config, mappingState) {
    var analysis = {
        propertyCount: 0,
        methodCount: 0,
        collectionCount: 0,
        nestedObjectCount: 0,
        safetyLevel: 'unknown',
        complexity: 0,
        accessPatterns: [],
        recommendations: []
    };
    
    try {
        if (typeof obj !== 'object' || obj === null) {
            analysis.safetyLevel = 'safe';
            return analysis;
        }
        
        var propCount = 0;
        var safeProps = 0;
        var dangerousProps = 0;
        
        for (var prop in obj) {
            if (propCount >= 50) break; // Limit analysis
            
            try {
                var propType = safeTypeCheck(obj, prop);
                if (propType === 'error') continue;
                
                propCount++;
                analysis.propertyCount++;
                
                if (propType === 'function') {
                    analysis.methodCount++;
                } else if (propType === 'object') {
                    if (isLikelyCollection(prop, propType)) {
                        analysis.collectionCount++;
                    } else {
                        analysis.nestedObjectCount++;
                    }
                }
                
                var safety = classifyPropertySafety(prop, propType);
                if (safety === 'safe') {
                    safeProps++;
                } else if (safety === 'dangerous') {
                    dangerousProps++;
                }
                
            } catch (propExc) {
                // Continue analysis
            }
        }
        
        // Determine overall safety level
        if (dangerousProps > 0) {
            analysis.safetyLevel = 'dangerous';
        } else if (propCount > 50) {
            analysis.safetyLevel = 'risky';
        } else if (safeProps > propCount / 2) {
            analysis.safetyLevel = 'safe';
        } else {
            analysis.safetyLevel = 'moderate';
        }
        
        // Calculate complexity
        analysis.complexity = calculateObjectComplexity(analysis);
        
        // Generate access patterns
        if (analysis.collectionCount > 0) {
            analysis.accessPatterns.push({
                pattern: objPath + '[collections]',
                description: 'Object contains ' + analysis.collectionCount + ' collections'
            });
        }
        
        if (analysis.safetyLevel === 'safe' && analysis.propertyCount > 5) {
            analysis.accessPatterns.push({
                pattern: objPath + '[properties]',
                description: 'Object has ' + analysis.propertyCount + ' safe properties'
            });
        }
        
        // Generate recommendations
        if (analysis.complexity > 10) {
            analysis.recommendations.push('Complex object - consider caching access');
        }
        
        if (analysis.collectionCount > 3) {
            analysis.recommendations.push('Multiple collections - verify iteration performance');
        }
        
    } catch (exc) {
        analysis.recommendations.push('Analysis error: ' + exc.message);
    }
    
    return analysis;
}

/**
 * Enhance atlas entry with analysis data
 * @param {Object} atlasEntry - Atlas entry to enhance
 * @param {Object} analysis - Analysis data
 */
function enhanceAtlasEntryWithAnalysis(atlasEntry, analysis) {
    try {
        if (!atlasEntry || !analysis) return;
        
        // Update object characteristics
        atlasEntry.objectCharacteristics.propertyCount = analysis.propertyCount;
        atlasEntry.objectCharacteristics.isCollection = analysis.collectionCount > 0;
        
        // Update analysis data
        atlasEntry.analysisData.safetyLevel = analysis.safetyLevel;
        atlasEntry.analysisData.complexity = analysis.complexity;
        atlasEntry.analysisData.lastAnalyzed = getCurrentTimestamp();
        
        // Add recommendations
        if (analysis.recommendations && analysis.recommendations.length > 0) {
            atlasEntry.analysisData.recommendations = analysis.recommendations;
        }
        
        // Update access metrics
        atlasEntry.accessMetrics.pathComplexity = calculatePathComplexity(atlasEntry.primaryPath);
        
    } catch (exc) {
        $.writeln('Error enhancing atlas entry with analysis: ' + exc.message);
    }
}

// ============================================================================
// POST-PROCESSING ANALYSIS
// ============================================================================

/**
 * Perform comprehensive object atlas analysis
 * @param {Object} objectAtlas - Object atlas to analyze
 * @param {Object} config - Configuration
 */
function performObjectAtlasAnalysis(objectAtlas, config) {
    try {
        $.writeln('Performing object atlas analysis...');
        
        // Analyze access patterns
        analyzeAccessPatterns(objectAtlas, config);
        
        // Find most accessed objects
        findMostAccessedObjects(objectAtlas, config);
        
        // Find most complex objects
        findMostComplexObjects(objectAtlas, config);
        
        // Identify redundant paths
        identifyRedundantPaths(objectAtlas, config);
        
        // Generate recommended paths
        generateRecommendedPaths(objectAtlas, config);
        
        $.writeln('Object atlas analysis complete.');
        
    } catch (exc) {
        $.writeln('Error in object atlas analysis: ' + exc.message);
    }
}

/**
 * Analyze access patterns in object atlas
 * @param {Object} objectAtlas - Object atlas
 * @param {Object} config - Configuration
 */
function analyzeAccessPatterns(objectAtlas, config) {
    try {
        var patternAnalysis = {
            totalPaths: objectAtlas.statistics.totalAccessPaths,
            uniqueObjects: objectAtlas.statistics.uniqueObjectsFound,
            averagePathsPerObject: 0,
            pathLengthDistribution: {},
            commonPathPrefixes: {}
        };
        
        if (patternAnalysis.uniqueObjects > 0) {
            patternAnalysis.averagePathsPerObject = patternAnalysis.totalPaths / patternAnalysis.uniqueObjects;
        }
        
        // Analyze path lengths and prefixes
        for (var objectId in objectAtlas.objectMap) {
            var entry = objectAtlas.objectMap[objectId];
            var allPaths = [entry.primaryPath].concat(entry.alternativePaths);
            
            for (var i = 0; i < allPaths.length; i++) {
                var path = allPaths[i];
                var pathLength = path.split('.').length;
                
                // Track path length distribution
                if (!patternAnalysis.pathLengthDistribution[pathLength]) {
                    patternAnalysis.pathLengthDistribution[pathLength] = 0;
                }
                patternAnalysis.pathLengthDistribution[pathLength]++;
                
                // Track common prefixes
                var pathParts = path.split('.');
                if (pathParts.length >= 2) {
                    var prefix = pathParts.slice(0, 2).join('.');
                    if (!patternAnalysis.commonPathPrefixes[prefix]) {
                        patternAnalysis.commonPathPrefixes[prefix] = 0;
                    }
                    patternAnalysis.commonPathPrefixes[prefix]++;
                }
            }
        }
        
        objectAtlas.accessPatternAnalysis.patternAnalysis = patternAnalysis;
        
    } catch (exc) {
        $.writeln('Error analyzing access patterns: ' + exc.message);
    }
}

/**
 * Find most accessed objects
 * @param {Object} objectAtlas - Object atlas
 * @param {Object} config - Configuration
 */
function findMostAccessedObjects(objectAtlas, config) {
    try {
        var accessRanking = [];
        
        for (var objectId in objectAtlas.objectMap) {
            var entry = objectAtlas.objectMap[objectId];
            accessRanking.push({
                objectId: objectId,
                primaryPath: entry.primaryPath,
                accessCount: entry.accessMetrics.totalAccessPaths,
                averagePathLength: entry.accessMetrics.averagePathLength,
                complexity: entry.accessMetrics.pathComplexity
            });
        }
        
        // Sort by access count (descending)
        accessRanking.sort(function(a, b) {
            return b.accessCount - a.accessCount;
        });
        
        // Keep top 20
        objectAtlas.accessPatternAnalysis.mostAccessedObjects = accessRanking.slice(0, 20);
        
    } catch (exc) {
        $.writeln('Error finding most accessed objects: ' + exc.message);
    }
}

/**
 * Find most complex objects
 * @param {Object} objectAtlas - Object atlas
 * @param {Object} config - Configuration
 */
function findMostComplexObjects(objectAtlas, config) {
    try {
        var complexityRanking = [];
        
        for (var objectId in objectAtlas.objectMap) {
            var entry = objectAtlas.objectMap[objectId];
            var totalComplexity = entry.accessMetrics.pathComplexity + 
                                (entry.objectCharacteristics.propertyCount || 0) * 0.1;
            
            complexityRanking.push({
                objectId: objectId,
                primaryPath: entry.primaryPath,
                complexity: totalComplexity,
                propertyCount: entry.objectCharacteristics.propertyCount || 0,
                pathCount: entry.accessMetrics.totalAccessPaths
            });
        }
        
        // Sort by complexity (descending)
        complexityRanking.sort(function(a, b) {
            return b.complexity - a.complexity;
        });
        
        // Keep top 15
        objectAtlas.accessPatternAnalysis.mostComplexObjects = complexityRanking.slice(0, 15);
        
    } catch (exc) {
        $.writeln('Error finding most complex objects: ' + exc.message);
    }
}

/**
 * Identify redundant access paths
 * @param {Object} objectAtlas - Object atlas
 * @param {Object} config - Configuration
 */
function identifyRedundantPaths(objectAtlas, config) {
    try {
        var redundantPaths = [];
        
        for (var objectId in objectAtlas.objectMap) {
            var entry = objectAtlas.objectMap[objectId];
            
            if (entry.alternativePaths.length > 1) {
                var allPaths = [entry.primaryPath].concat(entry.alternativePaths);
                var shortestPath = entry.primaryPath;
                var shortestLength = shortestPath.split('.').length;
                
                // Find actually shortest path
                for (var i = 0; i < allPaths.length; i++) {
                    var pathLength = allPaths[i].split('.').length;
                    if (pathLength < shortestLength) {
                        shortestLength = pathLength;
                        shortestPath = allPaths[i];
                    }
                }
                
                // Mark longer paths as potentially redundant
                for (var i = 0; i < allPaths.length; i++) {
                    var path = allPaths[i];
                    var pathLength = path.split('.').length;
                    
                    if (pathLength > shortestLength + 1) { // Allow 1 level difference
                        redundantPaths.push({
                            objectId: objectId,
                            redundantPath: path,
                            preferredPath: shortestPath,
                            lengthDifference: pathLength - shortestLength
                        });
                    }
                }
            }
        }
        
        // Sort by length difference (most redundant first)
        redundantPaths.sort(function(a, b) {
            return b.lengthDifference - a.lengthDifference;
        });
        
        objectAtlas.accessPatternAnalysis.redundantPaths = redundantPaths.slice(0, 30);
        
    } catch (exc) {
        $.writeln('Error identifying redundant paths: ' + exc.message);
    }
}

/**
 * Generate recommended access paths
 * @param {Object} objectAtlas - Object atlas
 * @param {Object} config - Configuration
 */
function generateRecommendedPaths(objectAtlas, config) {
    try {
        var recommendedPaths = [];
        
        for (var objectId in objectAtlas.objectMap) {
            var entry = objectAtlas.objectMap[objectId];
            
            if (entry.accessMetrics.totalAccessPaths > 1) {
                var recommendation = {
                    objectId: objectId,
                    objectType: entry.objectType,
                    recommendedPath: entry.primaryPath,
                    reason: 'Primary path',
                    safetyLevel: entry.analysisData.safetyLevel || 'unknown',
                    alternatives: entry.alternativePaths.length
                };
                
                // Choose best path based on criteria
                if (entry.alternativePaths.length > 0) {
                    var bestPath = entry.primaryPath;
                    var bestScore = calculatePathScore(entry.primaryPath, entry);
                    
                    for (var i = 0; i < entry.alternativePaths.length; i++) {
                        var altPath = entry.alternativePaths[i];
                        var altScore = calculatePathScore(altPath, entry);
                        
                        if (altScore > bestScore) {
                            bestScore = altScore;
                            bestPath = altPath;
                            recommendation.reason = 'Optimized alternative path';
                        }
                    }
                    
                    recommendation.recommendedPath = bestPath;
                }
                
                recommendedPaths.push(recommendation);
            }
        }
        
        // Sort by safety level and alternatives count
        recommendedPaths.sort(function(a, b) {
            var safetyOrder = {safe: 0, moderate: 1, risky: 2, dangerous: 3, unknown: 4};
            var aSafety = safetyOrder[a.safetyLevel] || 4;
            var bSafety = safetyOrder[b.safetyLevel] || 4;
            
            if (aSafety !== bSafety) {
                return aSafety - bSafety;
            }
            
            return b.alternatives - a.alternatives;
        });
        
        objectAtlas.accessPatternAnalysis.recommendedPaths = recommendedPaths.slice(0, 25);
        
    } catch (exc) {
        $.writeln('Error generating recommended paths: ' + exc.message);
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate path complexity score
 * @param {String} path - Path to analyze
 * @returns {Number} - Complexity score
 */
function calculatePathComplexity(path) {
    try {
        var pathParts = path.split('.');
        var complexity = pathParts.length; // Base complexity from depth
        
        // Add complexity for array indices
        var arrayMatches = path.match(/\[\d+\]/g);
        if (arrayMatches) {
            complexity += arrayMatches.length * 0.5;
        }
        
        // Add complexity for long property names
        for (var i = 0; i < pathParts.length; i++) {
            if (pathParts[i].length > 15) {
                complexity += 0.2;
            }
        }
        
        return complexity;
        
    } catch (exc) {
        return 1;
    }
}

/**
 * Calculate object complexity
 * @param {Object} analysis - Object analysis data
 * @returns {Number} - Complexity score
 */
function calculateObjectComplexity(analysis) {
    try {
        var complexity = 0;
        
        complexity += analysis.propertyCount * 0.1;
        complexity += analysis.methodCount * 0.2;
        complexity += analysis.collectionCount * 0.5;
        complexity += analysis.nestedObjectCount * 0.3;
        
        return Math.round(complexity * 10) / 10;
        
    } catch (exc) {
        return 0;
    }
}

/**
 * Calculate path quality score
 * @param {String} path - Path to score
 * @param {Object} atlasEntry - Atlas entry for context
 * @returns {Number} - Quality score (higher is better)
 */
function calculatePathScore(path, atlasEntry) {
    try {
        var score = 0;
        
        // Shorter paths are better
        var pathLength = path.split('.').length;
        score += Math.max(0, 10 - pathLength);
        
        // Direct paths are better than indexed paths
        if (path.indexOf('[') === -1) {
            score += 2;
        }
        
        // Paths without dangerous keywords are better
        var dangerousKeywords = ['parent', 'selection', 'active'];
        var isDangerous = false;
        for (var i = 0; i < dangerousKeywords.length; i++) {
            if (path.toLowerCase().indexOf(dangerousKeywords[i]) !== -1) {
                isDangerous = true;
                break;
            }
        }
        
        if (!isDangerous) {
            score += 3;
        }
        
        // Safety level bonus
        var safetyLevel = atlasEntry.analysisData.safetyLevel;
        switch (safetyLevel) {
            case 'safe':
                score += 5;
                break;
            case 'moderate':
                score += 2;
                break;
            case 'risky':
                score -= 1;
                break;
            case 'dangerous':
                score -= 5;
                break;
        }
        
        return score;
        
    } catch (exc) {
        return 0;
    }
}

/**
 * Estimate object size in bytes
 * @param {Object} obj - Object to estimate
 * @returns {Number} - Estimated size in bytes
 */
function estimateObjectSize(obj) {
    try {
        if (typeof obj !== 'object' || obj === null) {
            return 4; // Primitive value
        }
        
        var estimate = 16; // Base object overhead
        var propCount = 0;
        
        for (var prop in obj) {
            if (propCount < 10) { // Limit estimation
                estimate += prop.length + 8; // Property name + reference
                propCount++;
            } else {
                break;
            }
        }
        
        return estimate;
        
    } catch (exc) {
        return 16;
    }
}

/**
 * Estimate memory usage of object atlas
 * @param {Object} objectAtlas - Object atlas
 * @returns {Number} - Estimated memory usage in bytes
 */
function estimateMemoryUsage(objectAtlas) {
    try {
        var totalSize = 0;
        
        // Estimate atlas overhead
        totalSize += 1024; // Base atlas structure
        
        // Estimate object map size
        for (var objectId in objectAtlas.objectMap) {
            var entry = objectAtlas.objectMap[objectId];
            totalSize += objectId.length + 100; // Object ID + entry overhead
            totalSize += entry.primaryPath.length;
            
            for (var i = 0; i < entry.alternativePaths.length; i++) {
                totalSize += entry.alternativePaths[i].length;
            }
        }
        
        // Estimate path index size
        for (var path in objectAtlas.pathIndex) {
            totalSize += path.length + objectAtlas.pathIndex[path].length;
        }
        
        // Estimate circular reference map size
        for (var circularId in objectAtlas.circularReferenceMap) {
            totalSize += circularId.length + 200; // Circular entry overhead
        }
        
        return totalSize;
        
    } catch (exc) {
        return 0;
    }
}

/**
 * Generate stable hash from string input
 * @param {String} input - Input string to hash
 * @returns {String} - Hash string
 */
function generateStableHash(input) {
    try {
        var hash = 0;
        if (input.length === 0) return 'empty';
        
        for (var i = 0; i < input.length; i++) {
            var char = input.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return 'obj_' + Math.abs(hash).toString(36);
        
    } catch (exc) {
        return 'hash_error_' + Math.random().toString(36).substr(2, 9);
    }
}

/**
 * Track inaccessible path in atlas
 * @param {String} path - Path that couldn't be accessed
 * @param {String} type - Property type
 * @param {Object} objectAtlas - Object atlas
 */
function trackInaccessiblePath(path, type, objectAtlas) {
    try {
        // Create placeholder entry for inaccessible paths
        var placeholderId = 'inaccessible_' + path.replace(/[^a-zA-Z0-9]/g, '_');
        
        if (!objectAtlas.objectMap[placeholderId]) {
            var placeholderEntry = createObjectAtlasEntry(
                placeholderId,
                path,
                type,
                path.split('.').length - 1
            );
            
            placeholderEntry.analysisData.safetyLevel = 'inaccessible';
            objectAtlas.objectMap[placeholderId] = placeholderEntry;
            objectAtlas.statistics.totalObjectsTracked++;
        }
        
        objectAtlas.pathIndex[path] = placeholderId;
        
    } catch (exc) {
        // Silent failure for tracking inaccessible paths
    }
}

/**
 * Track property path in atlas
 * @param {String} path - Property path
 * @param {String} type - Property type
 * @param {Object} objectAtlas - Object atlas
 */
function trackPropertyPath(path, type, objectAtlas) {
    try {
        // For non-object properties, we just track the path
        var propertyId = 'property_' + path.replace(/[^a-zA-Z0-9]/g, '_');
        
        if (!objectAtlas.pathIndex[path]) {
            objectAtlas.pathIndex[path] = propertyId;
        }
        
    } catch (exc) {
        // Silent failure for property path tracking
    }
}

/**
 * Determine circular reference type
 * @param {Array} pathChain - Path chain forming circular reference
 * @returns {String} - Circular reference type
 */
function determineCircularType(pathChain) {
    try {
        if (pathChain.length <= 2) {
            return 'direct';
        } else if (pathChain.length <= 4) {
            return 'indirect';
        } else {
            return 'complex';
        }
    } catch (exc) {
        return 'unknown';
    }
}

/**
 * Find recommended break point for circular reference
 * @param {Array} pathChain - Path chain
 * @returns {String} - Recommended break point path
 */
function findRecommendedBreakPoint(pathChain) {
    try {
        if (pathChain.length < 2) return pathChain[0] || '';
        
        // Recommend breaking at the longest path (usually most indirect)
        var longestPath = pathChain[0];
        var longestLength = longestPath.split('.').length;
        
        for (var i = 1; i < pathChain.length; i++) {
            var pathLength = pathChain[i].split('.').length;
            if (pathLength > longestLength) {
                longestLength = pathLength;
                longestPath = pathChain[i];
            }
        }
        
        return longestPath;
        
    } catch (exc) {
        return pathChain[0] || '';
    }
}

// ============================================================================
// HELPER UTILITIES
// ============================================================================

/**
 * Create progress reporter
 * @param {Boolean} enabled - Whether progress reporting is enabled
 * @returns {Object} - Progress reporter
 */
function createProgressReporter(enabled) {
    var lastReport = 0;
    var reportInterval = 100; // Report every 100 objects
    
    return {
        report: function(depth, path, objectCount) {
            if (!enabled) return;
            
            if (objectCount - lastReport >= reportInterval) {
                $.writeln('  Progress: ' + objectCount + ' objects tracked, depth: ' + depth);
                lastReport = objectCount;
            }
        }
    };
}

/**
 * Create memory manager
 * @returns {Object} - Memory manager
 */
function createMemoryManager() {
    var cleanupCounter = 0;
    
    return {
        cleanup: function() {
            cleanupCounter++;
            if (cleanupCounter >= 50) {
                // Trigger cleanup every 50 operations
                if (typeof $.gc === 'function') {
                    $.gc();
                }
                cleanupCounter = 0;
            }
        }
    };
}

/**
 * Create safety validator
 * @param {Object} config - Configuration
 * @returns {Object} - Safety validator
 */
function createSafetyValidator(config) {
    return {
        isPropertySafe: function(obj, propName, depth) {
            try {
                // More restrictive at deeper levels
                if (depth > 3 && isDangerousProperty(propName)) {
                    return false;
                }
                
                if (depth > 4 && propName.toLowerCase().indexOf('parent') !== -1) {
                    return false;
                }
                
                return !isReservedWord(propName);
                
            } catch (exc) {
                return false;
            }
        }
    };
}

/**
 * Merge deep mapping configuration
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
// EXPORT AND INTERFACE FUNCTIONS
// ============================================================================

/**
 * Generate object atlas report
 * @param {Object} objectAtlas - Object atlas to report
 * @returns {String} - Formatted atlas report
 */
function generateObjectAtlasReport(objectAtlas) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('INDESIGN DOM OBJECT ATLAS REPORT');
        builder.appendLine('=================================');
        builder.appendLine('Generated: ' + getCurrentTimestamp());
        builder.appendLine('Document: ' + objectAtlas.metadata.documentName);
        builder.appendLine('');
        
        // Statistics
        builder.appendLine('ATLAS STATISTICS:');
        builder.appendLine('================');
        var stats = objectAtlas.statistics;
        builder.appendLine('Total Objects Tracked: ' + stats.totalObjectsTracked);
        builder.appendLine('Unique Objects Found: ' + stats.uniqueObjectsFound);
        builder.appendLine('Total Access Paths: ' + stats.totalAccessPaths);
        builder.appendLine('Max Alternative Paths: ' + stats.maxAlternativePathsFound);
        builder.appendLine('Circular References: ' + stats.circularReferencesDetected);
        builder.appendLine('Deepest Path: ' + stats.deepestPathDepth + ' levels');
        builder.appendLine('Processing Time: ' + stats.processingTime + 'ms');
        builder.appendLine('Memory Estimate: ' + Math.round(stats.memoryUsageEstimate / 1024) + 'KB');
        builder.appendLine('');
        
        // Most accessed objects
        if (objectAtlas.accessPatternAnalysis.mostAccessedObjects) {
            builder.appendLine('MOST ACCESSED OBJECTS:');
            builder.appendLine('=====================');
            var mostAccessed = objectAtlas.accessPatternAnalysis.mostAccessedObjects;
            for (var i = 0; i < Math.min(mostAccessed.length, 10); i++) {
                var obj = mostAccessed[i];
                builder.appendLine((i + 1) + '. ' + obj.primaryPath + ' (' + obj.accessCount + ' paths)');
            }
            builder.appendLine('');
        }
        
        // Recommended paths
        if (objectAtlas.accessPatternAnalysis.recommendedPaths) {
            builder.appendLine('RECOMMENDED ACCESS PATHS:');
            builder.appendLine('========================');
            var recommended = objectAtlas.accessPatternAnalysis.recommendedPaths;
            for (var i = 0; i < Math.min(recommended.length, 15); i++) {
                var rec = recommended[i];
                builder.appendLine('• ' + rec.recommendedPath + ' [' + rec.safetyLevel + '] - ' + rec.reason);
                if (rec.alternatives > 0) {
                    builder.appendLine('  (' + rec.alternatives + ' alternative paths available)');
                }
            }
            builder.appendLine('');
        }
        
        // Redundant paths
        if (objectAtlas.accessPatternAnalysis.redundantPaths) {
            builder.appendLine('REDUNDANT PATHS (Consider optimization):');
            builder.appendLine('========================================');
            var redundant = objectAtlas.accessPatternAnalysis.redundantPaths;
            for (var i = 0; i < Math.min(redundant.length, 10); i++) {
                var red = redundant[i];
                builder.appendLine('• ' + red.redundantPath);
                builder.appendLine('  Better: ' + red.preferredPath + ' (saves ' + red.lengthDifference + ' levels)');
            }
            builder.appendLine('');
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Error generating object atlas report: ' + exc.message;
    }
}

/**
 * Show deep mapper interface
 * @returns {Boolean} - true if interface shown successfully  
 */
function showDeepMapper() {
    try {
        var dialog = new Window('dialog', 'Deep DOM Mapper');
        dialog.orientation = 'column';
        dialog.alignChildren = 'fill';
        dialog.preferredSize.width = 650;
        dialog.preferredSize.height = 450;
        
        // Configuration panel
        var configPanel = dialog.add('panel', undefined, 'Mapping Configuration');
        
        var depthGroup = configPanel.add('group');
        depthGroup.add('statictext', undefined, 'Max Depth:');
        var depthSlider = depthGroup.add('slider', undefined, 6, 3, 8);
        var depthValue = depthGroup.add('statictext', undefined, '6');
        
        depthSlider.onChanging = function() {
            depthValue.text = Math.round(depthSlider.value);
        };
        
        var exhaustiveCheck = configPanel.add('checkbox', undefined, 'Enable Exhaustive Traversal (slower, more complete)');
        var atlasCheck = configPanel.add('checkbox', undefined, 'Build Object Atlas');
        var progressCheck = configPanel.add('checkbox', undefined, 'Show Progress Updates');
        
        exhaustiveCheck.value = true;
        atlasCheck.value = true;
        progressCheck.value = true;
        
        // Results area
        var resultsPanel = dialog.add('panel', undefined, 'Mapping Results');
        var resultsText = resultsPanel.add('edittext', undefined, 'Deep mapping results will appear here...', {
            multiline: true,
            readonly: true,
            scrolling: true
        });
        resultsText.preferredSize.height = 250;
        
        // Buttons
        var buttonGroup = dialog.add('group');
        var mapBtn = buttonGroup.add('button', undefined, 'Start Deep Mapping');
        var saveBtn = buttonGroup.add('button', undefined, 'Save Atlas');
        var closeBtn = buttonGroup.add('button', undefined, 'Close');
        
        var mappingResults = null;
        
        mapBtn.onClick = function() {
            try {
                var envResult = validateInDesignEnvironment();
                if (!envResult.valid) {
                    alert('Cannot perform deep mapping:\n\n' + envResult.error);
                    return;
                }
                
                var config = {
                    maxDepth: Math.round(depthSlider.value),
                    enableExhaustiveTraversal: exhaustiveCheck.value,
                    enableObjectAtlas: atlasCheck.value,
                    enableProgressReporting: progressCheck.value
                };
                
                mapBtn.enabled = false;
                mapBtn.text = 'Mapping...';
                
                var result = performDeepDOMMapping(envResult.document, config);
                
                if (result.success) {
                    mappingResults = result.objectAtlas;
                    var report = generateObjectAtlasReport(result.objectAtlas);
                    resultsText.text = report;
                } else {
                    resultsText.text = 'Deep mapping failed: ' + result.error;
                }
                
            } catch (exc) {
                resultsText.text = 'Deep mapping error: ' + exc.message;
            } finally {
                mapBtn.enabled = true;
                mapBtn.text = 'Start Deep Mapping';
            }
        };
        
        saveBtn.onClick = function() {
            if (!mappingResults) {
                alert('No mapping results to save. Please run deep mapping first.');
                return;
            }
            
            var saveFile = File.saveDialog('Save Object Atlas Report', '*.txt');
            if (saveFile) {
                try {
                    var report = generateObjectAtlasReport(mappingResults);
                    var writeResult = writeToFile(saveFile.absoluteURI, report);
                    if (writeResult.success) {
                        alert('Object atlas saved successfully to:\n' + writeResult.filePath);
                    } else {
                        alert('Failed to save atlas:\n' + writeResult.error);
                    }
                } catch (exc) {
                    alert('Save error: ' + exc.message);
                }
            }
        };
        
        closeBtn.onClick = function() {
            dialog.close();
        };
        
        dialog.show();
        return true;
        
    } catch (exc) {
        $.writeln('ERROR: Failed to show deep mapper interface: ' + exc.message);
        return false;
    }
}

// ============================================================================
// MODULE INITIALIZATION
// ============================================================================

/**
 * Initialize deep mapper module
 * @returns {Boolean} - true if initialization successful
 */
function initializeDeepMapper() {
    try {
        // Check dependencies
        if (typeof createStringBuilder !== 'function') {
            $.writeln('ERROR: Safe foundation module not loaded');
            return false;
        }
        
        if (typeof validateInDesignEnvironment !== 'function') {
            $.writeln('ERROR: Safe foundation module not fully loaded');
            return false;
        }
        
        // Test core functions
        var requiredFunctions = [
            'performDeepDOMMapping', 'createObjectAtlas', 'showDeepMapper'
        ];
        
        for (var i = 0; i < requiredFunctions.length; i++) {
            if (typeof eval(requiredFunctions[i]) !== 'function') {
                $.writeln('ERROR: Required function missing: ' + requiredFunctions[i]);
                return false;
            }
        }
        
        $.writeln('9.0_deep-mapper.jsx: Initialized successfully');
        $.writeln('Use performDeepDOMMapping(document, config) for comprehensive DOM analysis');
        $.writeln('Use showDeepMapper() to open the deep mapping interface');
        return true;
        
    } catch (exc) {
        $.writeln('ERROR: Deep mapper initialization failed: ' + exc.message);
        return false;
    }
}

// Auto-initialize when module loads
initializeDeepMapper();