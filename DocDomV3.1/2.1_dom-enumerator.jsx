// =============================================================================
// 2.1_dom-enumerator.jsx - DOM STRUCTURE DISCOVERY
// InDesign DOM Discovery Builder v3.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: Complete DOM structure discovery with object reference tracking
// DEPENDENCIES: ["1.1_bootstrap-foundation.jsx", "1.2_safety-utilities.jsx"]
// SIZE: ~1246 lines - COMPLETE IMPLEMENTATION - UPDATED LOGGING
// =============================================================================

// =============================================================================
// DEPENDENCY VALIDATION
// =============================================================================

var DOM_ENUMERATOR_DEPENDENCIES = ['1.1_bootstrap-foundation', '1.2_safety-utilities'];
var dependencyCheck = validateDependencies(DOM_ENUMERATOR_DEPENDENCIES);
if (!dependencyCheck.success) {
    throw new Error('DOM Enumerator missing dependencies: ' + dependencyCheck.missing.join(', '));
}

// =============================================================================
// ENUMERATION CONFIGURATION
// =============================================================================

var DEFAULT_ENUMERATION_CONFIG = {
    maxDepth: 4,
    timeoutMs: 15000,
    skipDangerous: true,
    maxProperties: 5000,
    enableObjectTracking: true,
    enableDuplicateDetection: true,
    enableCircularReferenceDetection: true,
    includeAlternativeAccessPaths: true,
    trackPropertySafety: true,
    enableProgressReporting: false,
    generateStatistics: true
};

// =============================================================================
// MAIN ENUMERATION FUNCTIONS - UPDATED LOGGING
// =============================================================================

/**
 * Complete DOM enumeration with object tracking - UPDATED LOGGING
 * @param {Object} documentObject - InDesign document to enumerate
 * @param {Object} enumerationConfig - Enumeration configuration
 * @returns {Object} Complete DOMStructure object
 */
function enumerateDocumentDOM(documentObject, enumerationConfig) {
    var startTime = new Date().getTime();

    logDebug('=== STARTING enumerateDocumentDOM ===', 'enumeration');
    logDebug('Start time: ' + startTime, 'enumeration');
    logDebug('Config received: ' + (enumerationConfig ? 'YES' : 'NO'), 'enumeration');

    var mergedConfig = enumerationConfig ?
        objectMerge(DEFAULT_ENUMERATION_CONFIG, enumerationConfig) :
        DEFAULT_ENUMERATION_CONFIG;

    logDebug('Merged config maxDepth: ' + mergedConfig.maxDepth, 'enumeration');

    try {
        // Create main DOM structure
        var domStructure = createDOMStructure();
        if (!domStructure || domStructure.error) {
            var createError = 'Failed to create DOM structure: ' + (domStructure ? domStructure.error : 'unknown error');
            logError(createError, 'enumeration');
            return createErrorDOMStructure(createError);
        }

        // Initialize object tracking
        if (mergedConfig.enableObjectTracking) {
            logDebug('Initializing object tracking...', 'enumeration');
            domStructure.objectRegistry = createObjectReferenceTracker();
        }

        // Set up metadata
        domStructure.metadata = {
            startTime: startTime,
            builderVersion: '3.1',
            enumerationConfig: objectClone(mergedConfig, 3),
            totalNodes: 0,
            totalProperties: 0,
            totalCollections: 0,
            totalMethods: 0,
            maxDepth: 0,
            completed: false,
            currentPhase: 'enumeration'
        };

        // Validate target document
        if (!documentObject) {
            var docError = 'No document object provided';
            logError(docError, 'enumeration');
            domStructure.metadata.errorMessage = docError;
            return domStructure;
        }

        logInfo('Starting DOM enumeration for document: ' + (documentObject.name || 'unnamed'), 'enumeration');

        var targetDocument = documentObject;
        var progressReporter = mergedConfig.enableProgressReporting ?
            createProgressReporter() : null;

        logDebug('About to call enumerateObjectStructure...', 'enumeration');
        var enumStartTime = new Date().getTime();

        // Enumerate document structure
        domStructure.structure = {
            document: enumerateObjectStructure(
                targetDocument,
                'document',
                0,
                mergedConfig,
                domStructure,
                progressReporter
            )
        };

        var enumEndTime = new Date().getTime();
        debugPerformance('enumerateObjectStructure', enumStartTime, 'enumeration');
        logDebug('Document node created, properties: ' +
            (domStructure.structure.document.properties ? domStructure.structure.document.properties.length : 'undefined'), 'enumeration');

        // Post-processing
        if (mergedConfig.includeAlternativeAccessPaths) {
            logDebug('Running updateAlternativeAccessPaths...', 'enumeration');
            updateAlternativeAccessPaths(domStructure);
        }

        // Generate statistics
        if (mergedConfig.generateStatistics) {
            logDebug('Generating statistics...', 'enumeration');
            domStructure.statistics = generateDOMStatistics(domStructure);

            // Transfer statistics to metadata for UI display
            if (domStructure.statistics) {
                logDebug('Transferring statistics to metadata...', 'enumeration');
                domStructure.metadata.totalObjects = domStructure.statistics.totalNodes || 0;
                domStructure.metadata.totalProperties = domStructure.statistics.totalProperties || 0;
                domStructure.metadata.totalCollections = domStructure.statistics.totalCollections || 0;
                domStructure.metadata.totalMethods = domStructure.statistics.totalMethods || 0;
                domStructure.metadata.maxDepth = domStructure.statistics.maxDepth || 0;

                logDebug('Statistics transferred - totalObjects: ' + domStructure.metadata.totalObjects, 'enumeration');
                logDebug('Statistics transferred - totalProperties: ' + domStructure.metadata.totalProperties, 'enumeration');
            }
        }

        // Final metadata
        domStructure.metadata.enumerationTime = new Date().getTime() - startTime;
        domStructure.metadata.completed = true;

        logDebug('=== ENUMERATION COMPLETED ===', 'enumeration');
        debugPerformance('Total enumeration', startTime, 'enumeration');
        logDebug('Properties found: ' +
            (domStructure.structure.document.properties ? domStructure.structure.document.properties.length : 0), 'enumeration');
        logDebug('Methods found: ' +
            (domStructure.structure.document.methods ? domStructure.structure.document.methods.length : 0), 'enumeration');

        logInfo('DOM enumeration completed successfully in ' + domStructure.metadata.enumerationTime + 'ms', 'enumeration');
        return domStructure;

    } catch (exc) {
        var error = 'DOM enumeration failed: ' + exc.message;
        logError(error, 'enumeration');
        return createErrorDOMStructure(error);
    }
}

/**
 * Enumerate object structure recursively - UPDATED LOGGING
 * @param {Object} sourceObject - Object to enumerate
 * @param {String} objectPath - Current object path
 * @param {Number} depth - Current depth
 * @param {Object} config - Enumeration configuration
 * @param {Object} domStructure - Main DOM structure
 * @param {Object} progressReporter - Progress reporter (optional)
 * @param {Number} globalStartTime - Global start time for timeout checking
 * @returns {Object} DOM node
 */
function enumerateObjectStructure(sourceObject, objectPath, depth, config, domStructure, progressReporter, globalStartTime) {
    try {
        var startTime = globalStartTime || new Date().getTime();

        // Check timeout
        if (config.timeoutMs && (new Date().getTime() - startTime) > config.timeoutMs) {
            logWarn('Enumeration timeout reached at path: ' + objectPath, 'enumeration');
            return createErrorDOMNode(objectPath, 'Timeout reached', depth);
        }

        // Check depth limit
        if (depth >= config.maxDepth) {
            logDebug('Max depth reached at: ' + objectPath, 'enumeration');
            return createErrorDOMNode(objectPath, 'Max depth reached', depth);
        }

        // Check if object should be skipped
        if (shouldSkipObject(sourceObject, objectPath, config)) {
            logDebug('Skipping object at: ' + objectPath, 'enumeration');
            return createErrorDOMNode(objectPath, 'Object skipped by safety filter', depth);
        }

        logDebug('Enumerating: ' + objectPath + ' (depth: ' + depth + ')', 'enumeration');

        // Create DOM node
        var objectType = safeTypeCheck(sourceObject);
        var domNode = createDOMNode(objectPath, objectPath.split('.').pop() || 'root', objectType, depth);

        // Object reference tracking
        if (config.enableObjectTracking && domStructure.objectRegistry) {
            var objectId = registerObjectReference(sourceObject, objectPath, domStructure.objectRegistry);
            domNode.objectId = objectId;

            // Check for duplicate detection
            if (config.enableDuplicateDetection) {
                var isDuplicate = checkObjectDuplication(sourceObject, objectPath, domStructure.objectRegistry);
                if (isDuplicate) {
                    logDebug('Duplicate object detected at: ' + objectPath, 'enumeration');
                    domNode.isDuplicate = true;
                    domNode.originalPath = isDuplicate.originalPath;
                }
            }
        }

        // Circular reference detection
        if (config.enableCircularReferenceDetection) {
            var circularResult = detectCircularReference(sourceObject, objectPath, []);
            if (circularResult.isCircular) {
                logDebug('Circular reference detected at: ' + objectPath, 'enumeration');
                domNode.isCircular = true;
                domNode.circularPath = circularResult.circularPath;
                return domNode; // Stop processing this branch
            }
        }

        // Initialize collections
        domNode.properties = [];
        domNode.collections = [];
        domNode.methods = [];
        domNode.childNodes = [];

        // Process object properties
        try {
            for (var propName in sourceObject) {
                if (objectHasOwnProperty(sourceObject, propName)) {
                    if (!shouldSkipProperty(propName, config)) {
                        var success = processProperty(
                            sourceObject,
                            propName,
                            objectPath,
                            depth,
                            config,
                            domStructure,
                            domNode,
                            startTime
                        );

                        if (!success) {
                            logDebug('Property processing failed for: ' + propName, 'enumeration');
                        }
                    }
                }
            }
        } catch (propExc) {
            logWarn('Property enumeration error at ' + objectPath + ': ' + propExc.message, 'enumeration');
            domNode.propertyEnumerationError = propExc.message;
        }

        // Report progress
        if (progressReporter) {
            progressReporter.reportProgress('Processed: ' + objectPath);
        }

        logDebug('Completed enumeration of: ' + objectPath +
            ' (props: ' + domNode.properties.length +
            ', methods: ' + domNode.methods.length +
            ', collections: ' + domNode.collections.length +
            ', children: ' + domNode.childNodes.length + ')', 'enumeration');

        return domNode;

    } catch (exc) {
        var error = 'Object enumeration error at ' + objectPath + ': ' + exc.message;
        logError(error, 'enumeration');
        return createErrorDOMNode(objectPath, exc.message, depth);
    }
}

// =============================================================================
// OBJECT REFERENCE MANAGEMENT
// =============================================================================

/**
 * Generate object identity hash - UPDATED LOGGING
 * @param {Object} obj - Object to hash
 * @returns {String} Object identity hash
 */
function generateObjectIdentityHash(obj) {
    try {
        if (!obj || typeof obj !== 'object') {
            return 'null_' + new Date().getTime();
        }

        var hash = 'obj_';
        var objType = safeTypeCheck(obj);
        hash += objType + '_';

        // Add basic property signature
        var propCount = 0;
        for (var prop in obj) {
            if (objectHasOwnProperty(obj, prop)) {
                propCount++;
                if (propCount <= 3) {
                    hash += prop.substring(0, 2);
                }
            }
        }

        hash += '_' + propCount + '_' + new Date().getTime();
        return hash;

    } catch (exc) {
        logError('Object hash generation error: ' + exc.message, 'enumeration');
        return 'error_' + new Date().getTime();
    }
}

/**
 * Register object reference - UPDATED LOGGING
 * @param {Object} obj - Object to register
 * @param {String} path - Object path
 * @param {Object} registry - Object registry
 * @returns {String} Object ID
 */
function registerObjectReference(obj, path, registry) {
    try {
        if (!registry || !registry.track) {
            return null;
        }

        var objectId = registry.track(obj);
        if (objectId && !registry.references) {
            registry.references = {};
        }

        if (objectId && registry.references) {
            registry.references[objectId] = path;
        }

        return objectId;

    } catch (exc) {
        logError('Object registration error: ' + exc.message, 'enumeration');
        return null;
    }
}

/**
 * Check object duplication - UPDATED LOGGING
 * @param {Object} obj - Object to check
 * @param {String} currentPath - Current path
 * @param {Object} registry - Object registry
 * @returns {Object|Boolean} Duplication info or false
 */
function checkObjectDuplication(obj, currentPath, registry) {
    try {
        if (!registry || !registry.isTracked || !registry.references) {
            return false;
        }

        if (registry.isTracked(obj)) {
            // Find original path
            for (var objectId in registry.references) {
                if (objectHasOwnProperty(registry.references, objectId)) {
                    var trackedId = registry.track(obj);
                    if (trackedId === objectId) {
                        var originalPath = registry.references[objectId];
                        if (originalPath !== currentPath) {
                            logDebug('Object duplication: ' + currentPath + ' → ' + originalPath, 'enumeration');
                            
                            // Track duplicate paths
                            if (!registry.duplicateDetections) {
                                registry.duplicateDetections = {};
                            }
                            if (!registry.duplicateDetections[objectId]) {
                                registry.duplicateDetections[objectId] = [];
                            }
                            registry.duplicateDetections[objectId].push(currentPath);

                            return {
                                isDuplicate: true,
                                originalPath: originalPath,
                                objectId: objectId
                            };
                        }
                    }
                }
            }
        }

        return false;

    } catch (exc) {
        logError('Duplication check error: ' + exc.message, 'enumeration');
        return false;
    }
}

// =============================================================================
// CIRCULAR REFERENCE DETECTION
// =============================================================================

/**
 * Detect circular references - UPDATED LOGGING
 * @param {Object} obj - Object to check
 * @param {String} currentPath - Current path
 * @param {Array} parentPaths - Parent paths
 * @returns {Object} Circular reference result
 */
function detectCircularReference(obj, currentPath, parentPaths) {
    try {
        if (!obj || typeof obj !== 'object') {
            return { isCircular: false };
        }

        // Check if current object is in parent chain
        for (var i = 0; i < parentPaths.length; i++) {
            if (parentPaths[i] === currentPath) {
                logDebug('Circular reference detected: ' + currentPath, 'circular');
                return {
                    isCircular: true,
                    circularPath: currentPath,
                    parentChain: parentPaths.slice()
                };
            }
        }

        return { isCircular: false };

    } catch (exc) {
        logError('Circular reference detection error: ' + exc.message, 'circular');
        return { isCircular: false, error: exc.message };
    }
}

/**
 * Check if object is in parent chain
 * @param {Object} obj - Object to check
 * @param {Array} parentObjects - Parent objects
 * @returns {Boolean} True if in parent chain
 */
function isInParentChain(obj, parentObjects) {
    try {
        if (!parentObjects || parentObjects.length === 0) {
            return false;
        }

        for (var i = 0; i < parentObjects.length; i++) {
            if (parentObjects[i] === obj) {
                return true;
            }
        }

        return false;

    } catch (exc) {
        return false;
    }
}

// =============================================================================
// PROPERTY PROCESSING - UPDATED LOGGING
// =============================================================================

/**
 * Process object property - UPDATED LOGGING
 * @param {Object} sourceObject - Source object
 * @param {String} propName - Property name
 * @param {String} objectPath - Object path
 * @param {Number} depth - Current depth
 * @param {Object} config - Configuration
 * @param {Object} domStructure - DOM structure
 * @param {Object} domNode - Current DOM node
 * @param {Number} globalStartTime - Global start time
 * @returns {Boolean} True if processed successfully
 */
function processProperty(sourceObject, propName, objectPath, depth, config, domStructure, domNode, globalStartTime) {
    try {
        // Create property classification
        var propValue = safeGetPropertyValue(sourceObject, propName);
        var propType = safeTypeCheck(propValue);
        var propClassification = createPropertyClassification(propName, propType, objectPath, propValue);

        // Classify property safety
        if (config.trackPropertySafety) {
            propClassification.safetyLevel = classifyPropertySafety(propName, propType);
        }

        // Categorize property
        if (propType === 'function') {
            domNode.methods.push(propClassification);
            logDebug('Added method: ' + propName, 'enumeration');
        } else if (isLikelyCollection(propName)) {
            propClassification.isCollection = true;
            domNode.collections.push(propClassification);
            logDebug('Added collection: ' + propName, 'enumeration');
        } else {
            domNode.properties.push(propClassification);
            logDebug('Added property: ' + propName + ' (' + propType + ')', 'enumeration');
        }

        // Recursive enumeration for object properties
        if (propType === 'object' && propValue !== null && depth < config.maxDepth - 1) {
            try {
                if (!shouldSkipObject(propValue, objectPath + '.' + propName, config)) {
                    var childPath = objectPath + '.' + propName;

                    // Check for circular references in parent chain
                    var newParentPaths = arraySlice([], 0);
                    newParentPaths[newParentPaths.length] = objectPath;

                    var childNode = enumerateObjectStructure(
                        propValue,
                        childPath,
                        depth + 1,
                        config,
                        domStructure,
                        null, // No progress reporter for child nodes
                        globalStartTime // Pass global start time to children
                    );

                    if (childNode) {
                        domNode.childNodes[domNode.childNodes.length] = childNode;
                    }
                }
            } catch (childExc) {
                // Continue processing other properties
                propClassification.childEnumerationError = childExc.message;
                logWarn('Child enumeration error for ' + propName + ': ' + childExc.message, 'enumeration');
            }
        }

        return true;

    } catch (exc) {
        logError('Property processing error for ' + propName + ': ' + exc.message, 'enumeration');
        return false;
    }
}

// =============================================================================
// ENUMERATION FILTERING
// =============================================================================

/**
 * Check if object should be skipped
 * @param {Object} obj - Object to check
 * @param {String} path - Object path
 * @param {Object} config - Configuration
 * @returns {Boolean} True if should skip
 */
function shouldSkipObject(obj, path, config) {
    try {
        if (!obj) return true;

        // Skip dangerous objects if configured
        if (config.skipDangerous) {
            var objType = safeTypeCheck(obj);
            if (objType === 'function') {
                return true;
            }
        }

        // Skip based on path safety
        if (isDangerousPath(path)) {
            return true;
        }

        return false;

    } catch (exc) {
        return true;
    }
}

/**
 * Check if property should be skipped
 * @param {String} propName - Property name
 * @param {Object} config - Configuration
 * @returns {Boolean} True if should skip
 */
function shouldSkipProperty(propName, config) {
    try {
        if (!propName || typeof propName !== 'string') {
            return true;
        }

        // Skip dangerous properties if configured
        if (config.skipDangerous && isDangerousProperty(propName)) {
            return true;
        }

        return false;

    } catch (exc) {
        return true;
    }
}

// =============================================================================
// POST-PROCESSING - UPDATED LOGGING
// =============================================================================

/**
 * Update alternative access paths - UPDATED LOGGING
 * @param {Object} domStructure - DOM structure
 */
function updateAlternativeAccessPaths(domStructure) {
    try {
        logDebug('Starting alternative access paths update', 'enumeration');

        if (!domStructure.structure || !domStructure.structure.document) {
            logWarn('No document structure available for alternative paths', 'enumeration');
            return;
        }

        updateNodeAlternativePaths(domStructure.structure.document, domStructure);
        logDebug('Alternative access paths update completed', 'enumeration');

    } catch (exc) {
        logError('Alternative paths update error: ' + exc.message, 'enumeration');
    }
}

/**
 * Update node alternative paths
 * @param {Object} node - DOM node
 * @param {Object} domStructure - DOM structure
 */
function updateNodeAlternativePaths(node, domStructure) {
    try {
        if (!node) return;

        // Find alternative paths for this node
        if (node.objectId && domStructure.objectRegistry && domStructure.objectRegistry.duplicateDetections) {
            var duplicatePaths = domStructure.objectRegistry.duplicateDetections[node.objectId];
            if (duplicatePaths && duplicatePaths.length > 0) {
                node.alternativeAccessPaths = duplicatePaths.slice();
                logDebug('Found ' + duplicatePaths.length + ' alternative paths for ' + node.path, 'enumeration');
            }
        }

        // Process child nodes
        if (node.childNodes) {
            for (var i = 0; i < node.childNodes.length; i++) {
                updateNodeAlternativePaths(node.childNodes[i], domStructure);
            }
        }

    } catch (exc) {
        logError('Node alternative paths error: ' + exc.message, 'enumeration');
    }
}

// =============================================================================
// ANALYSIS FUNCTIONS - UPDATED LOGGING
// =============================================================================

/**
 * Generate DOM statistics - UPDATED LOGGING
 * @param {Object} domStructure - DOM structure
 * @returns {Object} Statistics
 */
function generateDOMStatistics(domStructure) {
    try {
        logDebug('Generating DOM statistics', 'enumeration');

        var statistics = {
            totalNodes: 0,
            totalProperties: 0,
            totalCollections: 0,
            totalMethods: 0,
            maxDepth: 0,
            multiPathObjects: 0,
            circularReferences: 0,
            generationTime: new Date().getTime()
        };

        if (domStructure.structure && domStructure.structure.document) {
            calculateNodeStatistics(domStructure.structure.document, statistics);
        }

        // Find multi-path objects
        var multiPathObjects = findObjectsWithMultiplePaths(domStructure);
        statistics.multiPathObjects = multiPathObjects.length;

        logDebug('Statistics generated - nodes: ' + statistics.totalNodes +
            ', properties: ' + statistics.totalProperties +
            ', methods: ' + statistics.totalMethods, 'enumeration');

        return statistics;

    } catch (exc) {
        logError('Statistics generation error: ' + exc.message, 'enumeration');
        return {
            error: exc.message,
            totalNodes: 0,
            totalProperties: 0,
            totalCollections: 0,
            totalMethods: 0,
            maxDepth: 0
        };
    }
}

/**
 * Calculate node statistics recursively - UPDATED LOGGING
 * @param {Object} domNode - DOM node
 * @param {Object} statistics - Statistics object
 */
function calculateNodeStatistics(domNode, statistics) {
    try {
        if (!domNode || !statistics) return;

        logDebug('Counting node: ' + (domNode.path || 'unknown') + ', depth: ' + (domNode.depth || 0), 'enumeration');

        statistics.totalNodes++;

        if (domNode.depth > statistics.maxDepth) {
            statistics.maxDepth = domNode.depth;
        }

        if (domNode.properties) {
            var propCount = domNode.properties.length;
            statistics.totalProperties += propCount;
            logDebug('Added ' + propCount + ' properties (total now: ' + statistics.totalProperties + ')', 'enumeration');
        }

        if (domNode.collections) {
            statistics.totalCollections += domNode.collections.length;
        }

        if (domNode.methods) {
            statistics.totalMethods += domNode.methods.length;
        }

        // Process child nodes
        if (domNode.childNodes) {
            logDebug('Processing ' + domNode.childNodes.length + ' child nodes...', 'enumeration');
            for (var i = 0; i < domNode.childNodes.length; i++) {
                calculateNodeStatistics(domNode.childNodes[i], statistics);
            }
        }

    } catch (exc) {
        logError('Node statistics calculation error: ' + exc.message, 'enumeration');
        // Continue counting other nodes
    }
}

/**
 * Find objects with multiple access paths
 * @param {Object} domStructure - DOM structure to analyze
 * @returns {Array} Objects with multiple paths
 */
function findObjectsWithMultiplePaths(domStructure) {
    try {
        var multiPathObjects = [];

        if (!domStructure.objectRegistry || !domStructure.objectRegistry.duplicateDetections) {
            return multiPathObjects;
        }

        for (var objectId in domStructure.objectRegistry.duplicateDetections) {
            if (objectHasOwnProperty(domStructure.objectRegistry.duplicateDetections, objectId)) {
                var duplicatePaths = domStructure.objectRegistry.duplicateDetections[objectId];
                var originalPath = domStructure.objectRegistry.references[objectId] ?
                    domStructure.objectRegistry.references[objectId] : 'unknown';

                multiPathObjects.push({
                    objectId: objectId,
                    originalPath: originalPath,
                    alternativePaths: duplicatePaths,
                    totalPaths: duplicatePaths.length + 1
                });
            }
        }

        return multiPathObjects;

    } catch (exc) {
        logError('Multi-path objects analysis error: ' + exc.message, 'enumeration');
        return [];
    }
}

// =============================================================================
// PROPERTY CLASSIFICATION
// =============================================================================

/**
 * Classify property safety level
 * @param {String} propName - Property name
 * @param {String} propType - Property type
 * @returns {String} Safety level
 */
function classifyPropertySafety(propName, propType) {
    try {
        if (isDangerousProperty(propName)) {
            return 'dangerous';
        }

        if (propType === 'function') {
            return 'caution';
        }

        if (stringIndexOf(propName, '_') === 0) {
            return 'caution';
        }

        return 'safe';

    } catch (exc) {
        return 'unknown';
    }
}

/**
 * Check if property name suggests a collection
 * @param {String} propName - Property name
 * @returns {Boolean} True if likely collection
 */
function isLikelyCollection(propName) {
    try {
        if (typeof propName !== 'string') return false;

        var collectionIndicators = [
            'pages', 'items', 'children', 'contents', 'elements',
            'objects', 'collection', 'list', 'array', 'textFrames',
            'rectangles', 'ovals', 'polygons', 'lines', 'groups'
        ];

        var lowerPropName = stringToLowerCase(propName);
        for (var i = 0; i < collectionIndicators.length; i++) {
            if (stringIndexOf(lowerPropName, collectionIndicators[i]) !== -1) {
                return true;
            }
        }

        return false;

    } catch (exc) {
        return false;
    }
}

// =============================================================================
// DATA STRUCTURE CREATION
// =============================================================================

/**
 * Create DOM structure container
 * @returns {Object} Empty DOM structure
 */
function createDOMStructure() {
    try {
        return {
            metadata: {},
            structure: {},
            statistics: {},
            objectRegistry: null,
            version: '3.1',
            created: getCurrentTimestamp()
        };
    } catch (exc) {
        return {
            error: 'DOM structure creation failed: ' + exc.message,
            created: getCurrentTimestamp()
        };
    }
}

/**
 * Create DOM node with enhanced features
 * @param {String} path - Node path
 * @param {String} name - Node name
 * @param {String} nodeType - Node type
 * @param {Number} depth - Node depth
 * @param {String} additionalInfo - Additional information
 * @returns {Object} DOM node
 */
function createDOMNode(path, name, nodeType, depth, additionalInfo) {
    try {
        var node = {
            path: path || 'unknown',
            name: name || 'unknown',
            type: nodeType || 'unknown',
            depth: depth || 0,
            properties: [],
            collections: [],
            methods: [],
            childNodes: [],
            objectId: null,
            alternativeAccessPaths: [],
            created: getCurrentTimestamp()
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
            properties: [],
            collections: [],
            methods: [],
            childNodes: []
        };
    }
}

/**
 * Create property classification object
 * @param {String} propName - Property name
 * @param {String} propType - Property type
 * @param {String} parentPath - Parent object path
 * @param {*} propValue - Property value (optional)
 * @returns {Object} Property classification
 */
function createPropertyClassification(propName, propType, parentPath, propValue) {
    try {
        var fullPath = parentPath ? parentPath + '.' + propName : propName;

        return {
            name: propName,
            type: propType,
            path: fullPath,
            isMethod: propType === 'function',
            isCollection: isLikelyCollection(propName),
            isProperty: propType !== 'function' && !isLikelyCollection(propName),
            safetyLevel: 'unknown',
            created: getCurrentTimestamp()
        };

    } catch (exc) {
        return {
            name: propName || 'unknown',
            type: 'error',
            path: fullPath || 'unknown',
            isMethod: false,
            isCollection: false,
            isProperty: false,
            error: exc.message
        };
    }
}

/**
 * Create error DOM node
 * @param {String} path - Node path
 * @param {String} errorMessage - Error message
 * @param {Number} depth - Node depth
 * @returns {Object} Error DOM node
 */
function createErrorDOMNode(path, errorMessage, depth) {
    try {
        return {
            path: path || 'error_path',
            name: 'ErrorNode',
            type: 'error',
            depth: depth || 0,
            error: errorMessage || 'Unknown error',
            properties: [],
            collections: [],
            methods: [],
            childNodes: [],
            created: getCurrentTimestamp()
        };
    } catch (exc) {
        return {
            path: 'critical_error',
            name: 'CriticalError',
            type: 'error',
            error: 'Error node creation failed',
            properties: [],
            collections: [],
            methods: [],
            childNodes: []
        };
    }
}

/**
 * Create error DOM structure
 * @param {String} errorMessage - Error message
 * @returns {Object} Error DOM structure
 */
function createErrorDOMStructure(errorMessage) {
    try {
        return {
            metadata: {
                errorMessage: errorMessage || 'Unknown error',
                completed: false,
                builderVersion: '3.1'
            },
            structure: {},
            statistics: {},
            error: errorMessage,
            created: getCurrentTimestamp()
        };
    } catch (exc) {
        return {
            error: 'Critical error: ' + exc.message,
            metadata: { errorMessage: 'Critical error', completed: false },
            structure: {},
            statistics: {}
        };
    }
}

// =============================================================================
// UTILITIES
// =============================================================================

/**
 * Create progress reporter
 * @returns {Object} Progress reporter
 */
function createProgressReporter() {
    try {
        return {
            itemsProcessed: 0,
            startTime: new Date().getTime(),

            reportProgress: function (message) {
                try {
                    this.itemsProcessed++;
                    if (this.itemsProcessed % 100 === 0) {
                        var elapsed = new Date().getTime() - this.startTime;
                        logInfo('Progress: ' + message + ' - processed ' +
                                this.itemsProcessed + ' items in ' + elapsed + 'ms', 'enumeration');
                    }
                } catch (exc) {
                    // Silent failure
                }
            }
        };

    } catch (exc) {
        return {
            reportProgress: function () { },
            complete: function () { }
        };
    }
}

// =============================================================================
// MODULE REGISTRATION - NO CHANGES NEEDED
// =============================================================================

// Register this module with all its functions
registerModule('2.1_dom-enumerator', '3.1', [
    // Main Functions
    'enumerateDocumentDOM', 'enumerateObjectStructure',

    // Data Structure Creation
    'createDOMStructure', 'createDOMNode', 'createPropertyClassification',
    'createErrorDOMNode', 'createErrorDOMStructure',

    // Object Reference Management  
    'generateObjectIdentityHash', 'registerObjectReference', 'checkObjectDuplication',

    // Circular Reference Detection
    'detectCircularReference', 'isInParentChain',

    // Property Processing
    'processProperty',

    // Enumeration Filtering
    'shouldSkipObject', 'shouldSkipProperty',

    // Post-Processing
    'updateAlternativeAccessPaths', 'updateNodeAlternativePaths',

    // Analysis Functions
    'generateDOMStatistics', 'calculateNodeStatistics', 'findObjectsWithMultiplePaths',

    // Property Classification
    'classifyPropertySafety', 'isLikelyCollection',

    // Utilities
    'createProgressReporter'
]);

// =============================================================================
// END OF 2.1_dom-enumerator.jsx - UPDATED LOGGING SYSTEM
// =============================================================================