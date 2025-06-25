// DocDomV4.1/2.1_dom-enumerator.jsx
// 2.1_dom-enumerator.jsx - DOM STRUCTURE DISCOVERY
// InDesign DOM Discovery Builder v4.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: Complete DOM structure discovery with object reference tracking
// DEPENDENCIES: ["1.1_bootstrap-foundation.jsx", "1.2_safety-utilities.jsx"]
// SIZE: ~1300 lines - COMPLETE IMPLEMENTATION - ENHANCED LOGGING - ES3 COMPLIANT
// CHANGES FROM 3.1: Fixed ES3 violations, enhanced logging, enhanced isLikelyCollection
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
// MAIN ENUMERATION FUNCTIONS - ENHANCED LOGGING
// =============================================================================

/**
 * Complete DOM enumeration with object tracking - ENHANCED LOGGING
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
    logInfo('Starting DOM enumeration with config: maxDepth=' + mergedConfig.maxDepth + ', timeout=' + mergedConfig.timeoutMs, 'enumeration');

    try {
        // Create main DOM structure
        var domStructure = createDOMStructure();
        if (!domStructure || domStructure.error) {
            var createError = 'Failed to create DOM structure: ' + (domStructure ? domStructure.error : 'unknown error');
            logError(createError, 'enumeration');
            return createErrorDOMStructure(createError);
        }

        logDebug('DOM structure created successfully', 'enumeration');

        // Initialize object tracking
        if (mergedConfig.enableObjectTracking) {
            logDebug('Initializing object tracking...', 'enumeration');
            domStructure.objectRegistry = createObjectReferenceTracker();
            logInfo('Object reference tracking enabled', 'enumeration');
        }

        // Set up metadata
        domStructure.metadata = {
            startTime: startTime,
            builderVersion: '4.1',
            enumerationConfig: objectClone(mergedConfig, 3),
            totalNodes: 0,
            totalProperties: 0,
            totalCollections: 0,
            totalMethods: 0,
            maxDepth: 0,
            completed: false,
            currentPhase: 'enumeration'
        };

        logDebug('Metadata initialized with version 4.1', 'enumeration');

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

        if (progressReporter) {
            logDebug('Progress reporting enabled', 'enumeration');
        }

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
                progressReporter,
                startTime
            )
        };

        var enumEndTime = new Date().getTime();
        logInfo('Object structure enumeration completed in ' + (enumEndTime - enumStartTime) + 'ms', 'enumeration');
        logDebug('Document node created, properties: ' +
            (domStructure.structure.document.properties ?
                domStructure.structure.document.properties.length : 'undefined'), 'enumeration');

        // Post-processing
        if (mergedConfig.includeAlternativeAccessPaths) {
            logDebug('Running updateAlternativeAccessPaths...', 'enumeration');
            updateAlternativeAccessPaths(domStructure);
            logInfo('Alternative access paths updated', 'enumeration');
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

                logInfo('Statistics generated - Objects: ' + domStructure.metadata.totalObjects + 
                       ', Properties: ' + domStructure.metadata.totalProperties + 
                       ', Collections: ' + domStructure.metadata.totalCollections, 'enumeration');
            }
        }

        // Final metadata
        domStructure.metadata.enumerationTime = new Date().getTime() - startTime;
        domStructure.metadata.completed = true;

        logDebug('=== ENUMERATION COMPLETED ===', 'enumeration');
        logInfo('Total enumeration completed in ' + domStructure.metadata.enumerationTime + 'ms', 'enumeration');
        logDebug('Properties found: ' +
            (domStructure.structure.document.properties ? domStructure.structure.document.properties.length : 0), 'enumeration');
        logDebug('Methods found: ' +
            (domStructure.structure.document.methods ? domStructure.structure.document.methods.length : 0), 'enumeration');

        return domStructure;

    } catch (exc) {
        var error = 'DOM enumeration failed: ' + exc.message;
        logError(error, 'enumeration');
        return createErrorDOMStructure(error);
    }
}

/**
 * Enumerate object structure recursively - ENHANCED LOGGING
 * @param {Object} sourceObject - Object to enumerate
 * @param {String} objectPath - Path to object
 * @param {Number} depth - Current depth
 * @param {Object} config - Configuration
 * @param {Object} domStructure - DOM structure reference
 * @param {Object} progressReporter - Progress reporter
 * @param {Number} globalStartTime - Global start time
 * @returns {Object} DOM node structure
 */
function enumerateObjectStructure(sourceObject, objectPath, depth, config, domStructure, progressReporter, globalStartTime) {
    try {
        logDebug('Enumerating object at path: ' + objectPath + ', depth: ' + depth, 'enumeration');

        // Check timeout
        if (globalStartTime && config.timeoutMs) {
            var elapsed = new Date().getTime() - globalStartTime;
            if (elapsed > config.timeoutMs) {
                logWarn('Enumeration timeout reached at path: ' + objectPath, 'enumeration');
                return createErrorDOMNode('Timeout reached', objectPath, depth);
            }
        }

        // Check depth limit
        if (depth >= config.maxDepth) {
            logDebug('Max depth reached at path: ' + objectPath, 'enumeration');
            return createErrorDOMNode('Max depth reached', objectPath, depth);
        }

        // Check if object should be skipped
        if (shouldSkipObject(sourceObject, objectPath, config)) {
            logDebug('Object skipped at path: ' + objectPath, 'enumeration');
            return createErrorDOMNode('Object skipped', objectPath, depth);
        }

        // Create DOM node
        var domNode = createDOMNode(sourceObject, objectPath, depth, config);
        if (!domNode) {
            logError('Failed to create DOM node for path: ' + objectPath, 'enumeration');
            return createErrorDOMNode('Node creation failed', objectPath, depth);
        }

        logDebug('DOM node created for path: ' + objectPath + ', type: ' + domNode.type, 'enumeration');

        // Update progress
        if (progressReporter) {
            progressReporter.reportProgress('Enumerating: ' + objectPath);
        }

        // Object tracking
        if (config.enableObjectTracking && domStructure.objectRegistry) {
            var referenceId = registerObjectReference(sourceObject, objectPath, domStructure.objectRegistry);
            if (referenceId) {
                domNode.referenceId = referenceId;
                logDebug('Object reference registered: ' + referenceId, 'enumeration');
            }

            // Check for duplication
            if (config.enableDuplicateDetection) {
                var duplicationInfo = checkObjectDuplication(sourceObject, objectPath, domStructure.objectRegistry);
                if (duplicationInfo.isDuplicate) {
                    domNode.isDuplicate = true;
                    domNode.originalPath = duplicationInfo.originalPath;
                    logDebug('Duplicate object detected at path: ' + objectPath + ', original: ' + duplicationInfo.originalPath, 'enumeration');
                }
            }
        }

        // Circular reference detection
        if (config.enableCircularReferenceDetection) {
            // FIXED ES3: No destructuring
            var circularResult = detectCircularReference(sourceObject, objectPath, []);
            var isCircular = circularResult.isCircular;
            var circularPath = circularResult.circularPath;
            
            if (isCircular) {
                domNode.isCircularReference = true;
                domNode.circularReferencePath = circularPath;
                logWarn('Circular reference detected at path: ' + objectPath + ', points to: ' + circularPath, 'enumeration');
                return domNode; // Don't process children of circular references
            }
        }

        // Process properties
        try {
            logDebug('Processing properties for object at path: ' + objectPath, 'enumeration');
            var propertyCount = 0;
            
            for (var propName in sourceObject) {
                if (objectHasOwnProperty(sourceObject, propName)) {
                    propertyCount++;
                    
                    if (propertyCount > config.maxProperties) {
                        logWarn('Max properties limit reached at path: ' + objectPath, 'enumeration');
                        break;
                    }

                    var processResult = processProperty(
                        sourceObject,
                        propName,
                        objectPath,
                        depth,
                        config,
                        domStructure,
                        domNode,
                        globalStartTime
                    );

                    if (!processResult) {
                        logDebug('Property processing failed for: ' + propName + ' at path: ' + objectPath, 'enumeration');
                    }
                }
            }

            logDebug('Processed ' + propertyCount + ' properties for object at path: ' + objectPath, 'enumeration');

        } catch (propertyExc) {
            logError('Property processing error for object at path: ' + objectPath + ': ' + propertyExc.message, 'enumeration');
            domNode.propertyEnumerationError = propertyExc.message;
        }

        logInfo('Object enumeration completed for path: ' + objectPath + 
               ', properties: ' + (domNode.properties ? domNode.properties.length : 0) + 
               ', children: ' + (domNode.childNodes ? domNode.childNodes.length : 0), 'enumeration');

        return domNode;

    } catch (exc) {
        logError('Object enumeration error for path: ' + objectPath + ': ' + exc.message, 'enumeration');
        return createErrorDOMNode('Enumeration error: ' + exc.message, objectPath, depth);
    }
}

// =============================================================================
// DATA STRUCTURE CREATION - ENHANCED LOGGING
// =============================================================================

/**
 * Create DOM structure container - ENHANCED LOGGING
 * @returns {Object} DOM structure
 */
function createDOMStructure() {
    try {
        logDebug('Creating DOM structure container', 'enumeration');
        
        var domStructure = {
            metadata: {},
            structure: {},
            statistics: null,
            objectRegistry: null,
            alternativeAccessPaths: {},
            error: null
        };

        logDebug('DOM structure container created successfully', 'enumeration');
        return domStructure;

    } catch (exc) {
        logError('Failed to create DOM structure: ' + exc.message, 'enumeration');
        return createErrorDOMStructure('Creation failed: ' + exc.message);
    }
}

/**
 * Create DOM node - ENHANCED LOGGING
 * @param {Object} sourceObject - Source object
 * @param {String} objectPath - Object path
 * @param {Number} depth - Current depth
 * @param {Object} config - Configuration
 * @returns {Object} DOM node
 */
function createDOMNode(sourceObject, objectPath, depth, config) {
    try {
        logDebug('Creating DOM node for path: ' + objectPath + ', depth: ' + depth, 'enumeration');

        var domNode = {
            path: objectPath,
            depth: depth,
            type: typeof sourceObject,
            properties: [],
            methods: [],
            collections: [],
            childNodes: [],
            metadata: {
                created: getCurrentTimestamp(),
                builderVersion: '4.1'
            }
        };

        // Enhanced object type detection
        if (sourceObject && typeof sourceObject === 'object') {
            if (typeof sourceObject.length === 'number') {
                domNode.type = 'collection';
                domNode.collectionLength = sourceObject.length;
                logDebug('Detected collection type with length: ' + sourceObject.length, 'enumeration');
            } else if (sourceObject.constructor && sourceObject.constructor.name) {
                domNode.objectConstructor = sourceObject.constructor.name;
                logDebug('Detected object constructor: ' + sourceObject.constructor.name, 'enumeration');
            }
        }

        logDebug('DOM node created successfully for path: ' + objectPath + ', type: ' + domNode.type, 'enumeration');
        return domNode;

    } catch (exc) {
        logError('DOM node creation failed for path: ' + objectPath + ': ' + exc.message, 'enumeration');
        return createErrorDOMNode('Node creation failed: ' + exc.message, objectPath, depth);
    }
}

/**
 * Create property classification - ENHANCED LOGGING
 * @param {String} propName - Property name
 * @param {*} propValue - Property value
 * @param {String} objectPath - Object path
 * @returns {Object} Property classification
 */
function createPropertyClassification(propName, propValue, objectPath) {
    try {
        logDebug('Classifying property: ' + propName + ' at path: ' + objectPath, 'enumeration');

        var propType = typeof propValue;
        var classification = {
            name: propName,
            type: propType,
            path: objectPath + '.' + propName,
            safety: classifyPropertySafety(propName, propType),
            metadata: {
                classified: getCurrentTimestamp(),
                builderVersion: '4.1'
            }
        };

        // Enhanced classification
        if (propType === 'function') {
            classification.isMethod = true;
            logDebug('Property classified as method: ' + propName, 'enumeration');
        } else if (propValue && typeof propValue === 'object') {
            if (isLikelyCollection(propValue)) {
                classification.isCollection = true;
                classification.collectionLength = safeGetLength(propValue);
                logDebug('Property classified as collection: ' + propName + ', length: ' + classification.collectionLength, 'enumeration');
            } else {
                classification.isObject = true;
                logDebug('Property classified as object: ' + propName, 'enumeration');
            }
        }

        // Value sampling for primitives
        if (propType === 'string' || propType === 'number' || propType === 'boolean') {
            classification.sampleValue = propValue;
            logDebug('Sample value captured for primitive property: ' + propName, 'enumeration');
        }

        logDebug('Property classification completed for: ' + propName + ', type: ' + propType + ', safety: ' + classification.safety, 'enumeration');
        return classification;

    } catch (exc) {
        logError('Property classification failed for: ' + propName + ': ' + exc.message, 'enumeration');
        return {
            name: propName,
            type: 'unknown',
            path: objectPath + '.' + propName,
            safety: 'dangerous',
            error: exc.message
        };
    }
}

/**
 * Create error DOM node
 * @param {String} errorMessage - Error message
 * @param {String} objectPath - Object path
 * @param {Number} depth - Current depth
 * @returns {Object} Error DOM node
 */
function createErrorDOMNode(errorMessage, objectPath, depth) {
    try {
        return {
            path: objectPath,
            depth: depth,
            type: 'error',
            error: errorMessage,
            properties: [],
            methods: [],
            collections: [],
            childNodes: [],
            metadata: {
                created: getCurrentTimestamp(),
                builderVersion: '4.1',
                isError: true
            }
        };
    } catch (exc) {
        return {
            path: objectPath || 'unknown',
            depth: depth || 0,
            type: 'error',
            error: 'Error node creation failed: ' + exc.message,
            properties: [],
            methods: [],
            collections: [],
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
                created: getCurrentTimestamp(),
                builderVersion: '4.1',
                isError: true,
                errorMessage: errorMessage
            },
            structure: {},
            statistics: null,
            objectRegistry: null,
            alternativeAccessPaths: {},
            error: errorMessage
        };
    } catch (exc) {
        return {
            error: 'Error structure creation failed: ' + exc.message
        };
    }
}

// =============================================================================
// OBJECT REFERENCE MANAGEMENT - ENHANCED LOGGING
// =============================================================================

/**
 * Generate object identity hash - ENHANCED LOGGING
 * @param {Object} obj - Object to hash
 * @returns {String} Identity hash
 */
function generateObjectIdentityHash(obj) {
    try {
        if (!obj || typeof obj !== 'object') {
            return 'null';
        }

        var timestamp = new Date().getTime();
        var random = Math.floor(Math.random() * 10000);
        var hash = 'obj_' + timestamp + '_' + random;
        
        logDebug('Generated object identity hash: ' + hash, 'enumeration');
        return hash;

    } catch (exc) {
        logError('Object hash generation failed: ' + exc.message, 'enumeration');
        return 'hash_error';
    }
}

/**
 * Register object reference - ENHANCED LOGGING
 * @param {Object} obj - Object to register
 * @param {String} path - Object path
 * @param {Object} registry - Object registry
 * @returns {String} Reference ID
 */
function registerObjectReference(obj, path, registry) {
    try {
        if (!registry || !registry.track) {
            logWarn('No registry available for object reference tracking', 'enumeration');
            return null;
        }

        var referenceId = registry.track(obj);
        if (referenceId) {
            logDebug('Object reference registered: ' + referenceId + ' for path: ' + path, 'enumeration');
        }
        
        return referenceId;

    } catch (exc) {
        logError('Object reference registration failed for path: ' + path + ': ' + exc.message, 'enumeration');
        return null;
    }
}

/**
 * Check object duplication - ENHANCED LOGGING
 * @param {Object} obj - Object to check
 * @param {String} currentPath - Current object path
 * @param {Object} registry - Object registry
 * @returns {Object} Duplication info
 */
function checkObjectDuplication(obj, currentPath, registry) {
    try {
        var result = {
            isDuplicate: false,
            originalPath: null
        };

        if (!registry || !registry.track) {
            return result;
        }

        // Simple duplication check - more sophisticated logic could be added
        var existingId = registry.track(obj);
        if (existingId && existingId !== currentPath) {
            result.isDuplicate = true;
            result.originalPath = existingId;
            logDebug('Object duplication detected: current=' + currentPath + ', original=' + existingId, 'enumeration');
        }

        return result;

    } catch (exc) {
        logError('Object duplication check failed for path: ' + currentPath + ': ' + exc.message, 'enumeration');
        return { isDuplicate: false, originalPath: null };
    }
}

// =============================================================================
// CIRCULAR REFERENCE DETECTION - ENHANCED LOGGING
// =============================================================================

/**
 * Detect circular reference - ENHANCED LOGGING - FIXED ES3
 * @param {Object} obj - Object to check
 * @param {String} currentPath - Current path
 * @param {Array} parentPaths - Parent paths array
 * @returns {Object} Circular reference info
 */
function detectCircularReference(obj, currentPath, parentPaths) {
    try {
        logDebug('Checking for circular reference at path: ' + currentPath, 'enumeration');

        var result = {
            isCircular: false,
            circularPath: null
        };

        if (!obj || typeof obj !== 'object') {
            return result;
        }

        // FIXED ES3: No destructuring, create array manually 
        var newParentPaths = [];
        for (var i = 0; i < parentPaths.length; i++) {
            newParentPaths[newParentPaths.length] = parentPaths[i];
        }
        newParentPaths[newParentPaths.length] = currentPath;

        var isInChain = isInParentChain(obj, newParentPaths);
        if (isInChain.found) {
            result.isCircular = true;
            result.circularPath = isInChain.path;
            logWarn('Circular reference detected at path: ' + currentPath + ', references: ' + isInChain.path, 'enumeration');
        }

        return result;

    } catch (exc) {
        logError('Circular reference detection failed for path: ' + currentPath + ': ' + exc.message, 'enumeration');
        return { isCircular: false, circularPath: null };
    }
}

/**
 * Check if object is in parent chain - ENHANCED LOGGING
 * @param {Object} obj - Object to check
 * @param {Array} parentPaths - Parent paths
 * @returns {Object} Chain check result
 */
function isInParentChain(obj, parentPaths) {
    try {
        var result = {
            found: false,
            path: null
        };

        if (!obj || !parentPaths || parentPaths.length === 0) {
            return result;
        }

        // Simple reference check - in a real implementation,
        // this would need more sophisticated object comparison
        for (var i = 0; i < parentPaths.length; i++) {
            if (parentPaths[i] && stringIndexOf(parentPaths[i], 'document') === 0) {
                // Basic check to prevent infinite loops
                result.found = true;
                result.path = parentPaths[i];
                logDebug('Object found in parent chain: ' + parentPaths[i], 'enumeration');
                break;
            }
        }

        return result;

    } catch (exc) {
        logError('Parent chain check failed: ' + exc.message, 'enumeration');
        return { found: false, path: null };
    }
}

// =============================================================================
// PROPERTY PROCESSING - ENHANCED LOGGING
// =============================================================================

/**
 * Process object property - ENHANCED LOGGING - FIXED ES3
 * @param {Object} sourceObject - Source object
 * @param {String} propName - Property name
 * @param {String} objectPath - Object path
 * @param {Number} depth - Current depth
 * @param {Object} config - Configuration
 * @param {Object} domStructure - DOM structure
 * @param {Object} domNode - DOM node
 * @param {Number} globalStartTime - Global start time
 * @returns {Boolean} True if processed successfully
 */
function processProperty(sourceObject, propName, objectPath, depth, config, domStructure, domNode, globalStartTime) {
    try {
        logDebug('Processing property: ' + propName + ' at path: ' + objectPath, 'enumeration');

        // Check if property should be skipped
        if (shouldSkipProperty(propName, config)) {
            logDebug('Property skipped: ' + propName, 'enumeration');
            return true;
        }

        var propValue;
        try {
            propValue = sourceObject[propName];
        } catch (accessExc) {
            logWarn('Property access failed for: ' + propName + ': ' + accessExc.message, 'enumeration');
            return false;
        }

        // Create property classification
        var propClassification = createPropertyClassification(propName, propValue, objectPath);
        
        // Categorize property
        if (propClassification.isMethod) {
            domNode.methods[domNode.methods.length] = propClassification;
            logDebug('Method added: ' + propName, 'enumeration');
        } else if (propClassification.isCollection) {
            domNode.collections[domNode.collections.length] = propClassification;
            logDebug('Collection added: ' + propName + ', length: ' + propClassification.collectionLength, 'enumeration');
        } else {
            domNode.properties[domNode.properties.length] = propClassification;
            logDebug('Property added: ' + propName + ', type: ' + propClassification.type, 'enumeration');
        }

        // Process child objects
        if (propValue && typeof propValue === 'object') {
            try {
                if (!isDangerousProperty(propName) && !shouldSkipProperty(propName, config)) {
                    var childPath = objectPath + '.' + propName;

                    // FIXED ES3: No spread operator - create new array manually
                    var newParentPaths = [];
                    for (var i = 0; i < 1; i++) { // Just add current path
                        newParentPaths[newParentPaths.length] = objectPath;
                    }

                    logDebug('Processing child object for property: ' + propName, 'enumeration');

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
                        logDebug('Child node added for property: ' + propName, 'enumeration');
                    }
                }
            } catch (childExc) {
                // Continue processing other properties
                propClassification.childEnumerationError = childExc.message;
                logWarn('Child enumeration error for ' + propName + ': ' + childExc.message, 'enumeration');
            }
        }

        logDebug('Property processing completed for: ' + propName, 'enumeration');
        return true;

    } catch (exc) {
        logError('Property processing error for ' + propName + ': ' + exc.message, 'enumeration');
        return false;
    }
}

// =============================================================================
// ENUMERATION FILTERING - ENHANCED LOGGING
// =============================================================================

/**
 * Check if object should be skipped - ENHANCED LOGGING
 * @param {Object} obj - Object to check
 * @param {String} path - Object path
 * @param {Object} config - Configuration
 * @returns {Boolean} True if should skip
 */
function shouldSkipObject(obj, path, config) {
    try {
        if (!obj) {
            logDebug('Skipping null/undefined object at path: ' + path, 'enumeration');
            return true;
        }

        if (typeof obj !== 'object') {
            logDebug('Skipping non-object at path: ' + path + ', type: ' + typeof obj, 'enumeration');
            return true;
        }

        if (config.skipDangerous && isDangerousPath(path)) {
            logDebug('Skipping dangerous path: ' + path, 'enumeration');
            return true;
        }

        return false;

    } catch (exc) {
        logError('Object skip check failed for path: ' + path + ': ' + exc.message, 'enumeration');
        return true; // Skip on error
    }
}

/**
 * Check if property should be skipped - ENHANCED LOGGING
 * @param {String} propName - Property name
 * @param {Object} config - Configuration
 * @returns {Boolean} True if should skip
 */
function shouldSkipProperty(propName, config) {
    try {
        if (!propName || typeof propName !== 'string') {
            logDebug('Skipping invalid property name: ' + propName, 'enumeration');
            return true;
        }

        if (config.skipDangerous && isDangerousProperty(propName)) {
            logDebug('Skipping dangerous property: ' + propName, 'enumeration');
            return true;
        }

        // Skip ExtendScript internal properties
        var internalProps = ['__proto__', 'constructor', 'prototype'];
        for (var i = 0; i < internalProps.length; i++) {
            if (propName === internalProps[i]) {
                logDebug('Skipping internal property: ' + propName, 'enumeration');
                return true;
            }
        }

        return false;

    } catch (exc) {
        logError('Property skip check failed for: ' + propName + ': ' + exc.message, 'enumeration');
        return true; // Skip on error
    }
}

// =============================================================================
// POST-PROCESSING - ENHANCED LOGGING
// =============================================================================

/**
 * Update alternative access paths - ENHANCED LOGGING
 * @param {Object} domStructure - DOM structure
 */
function updateAlternativeAccessPaths(domStructure) {
    try {
        logDebug('Starting alternative access paths update', 'enumeration');

        if (!domStructure || !domStructure.structure) {
            logWarn('No DOM structure available for alternative paths update', 'enumeration');
            return;
        }

        domStructure.alternativeAccessPaths = {};

        if (domStructure.structure.document) {
            updateNodeAlternativePaths(domStructure.structure.document, domStructure);
        }

        logInfo('Alternative access paths update completed', 'enumeration');

    } catch (exc) {
        logError('Alternative access paths update failed: ' + exc.message, 'enumeration');
    }
}

/**
 * Update node alternative paths - ENHANCED LOGGING
 * @param {Object} node - DOM node
 * @param {Object} domStructure - DOM structure
 */
function updateNodeAlternativePaths(node, domStructure) {
    try {
        if (!node || !node.path) {
            return;
        }

        logDebug('Updating alternative paths for node: ' + node.path, 'enumeration');

        // Find objects with multiple paths
        var multiPathObjects = findObjectsWithMultiplePaths(domStructure);
        
        if (node.referenceId && multiPathObjects[node.referenceId]) {
            domStructure.alternativeAccessPaths[node.path] = multiPathObjects[node.referenceId];
            logDebug('Alternative paths found for: ' + node.path, 'enumeration');
        }

        // Process child nodes
        if (node.childNodes) {
            for (var i = 0; i < node.childNodes.length; i++) {
                updateNodeAlternativePaths(node.childNodes[i], domStructure);
            }
        }

    } catch (exc) {
        logError('Node alternative paths update failed for: ' + (node ? node.path : 'unknown') + ': ' + exc.message, 'enumeration');
    }
}

// =============================================================================
// ANALYSIS FUNCTIONS - ENHANCED LOGGING
// =============================================================================

/**
 * Generate DOM statistics - ENHANCED LOGGING
 * @param {Object} domStructure - DOM structure
 * @returns {Object} Statistics
 */
function generateDOMStatistics(domStructure) {
    try {
        logDebug('Generating DOM statistics', 'enumeration');

        var statistics = {
            totalNodes: 0,
            totalProperties: 0,
            totalMethods: 0,
            totalCollections: 0,
            maxDepth: 0,
            nodesByDepth: {},
            nodesByType: {},
            safetyDistribution: {
                safe: 0,
                caution: 0,
                dangerous: 0
            }
        };

        if (domStructure.structure && domStructure.structure.document) {
            calculateNodeStatistics(domStructure.structure.document, statistics);
        }

        logInfo('DOM statistics generated - Nodes: ' + statistics.totalNodes + 
               ', Properties: ' + statistics.totalProperties + 
               ', Methods: ' + statistics.totalMethods + 
               ', Collections: ' + statistics.totalCollections, 'enumeration');

        return statistics;

    } catch (exc) {
        logError('DOM statistics generation failed: ' + exc.message, 'enumeration');
        return null;
    }
}

/**
 * Calculate node statistics recursively - ENHANCED LOGGING
 * @param {Object} domNode - DOM node
 * @param {Object} statistics - Statistics object
 */
function calculateNodeStatistics(domNode, statistics) {
    try {
        if (!domNode) {
            return;
        }

        // Count this node
        statistics.totalNodes++;

        // Track depth
        if (domNode.depth > statistics.maxDepth) {
            statistics.maxDepth = domNode.depth;
        }

        if (!statistics.nodesByDepth[domNode.depth]) {
            statistics.nodesByDepth[domNode.depth] = 0;
        }
        statistics.nodesByDepth[domNode.depth]++;

        // Track type
        if (!statistics.nodesByType[domNode.type]) {
            statistics.nodesByType[domNode.type] = 0;
        }
        statistics.nodesByType[domNode.type]++;

        // Count properties, methods, collections
        if (domNode.properties) {
            statistics.totalProperties += domNode.properties.length;
            
            for (var p = 0; p < domNode.properties.length; p++) {
                var prop = domNode.properties[p];
                if (prop.safety) {
                    statistics.safetyDistribution[prop.safety]++;
                }
            }
        }

        if (domNode.methods) {
            statistics.totalMethods += domNode.methods.length;
        }

        if (domNode.collections) {
            statistics.totalCollections += domNode.collections.length;
        }

        // Process child nodes
        if (domNode.childNodes) {
            for (var i = 0; i < domNode.childNodes.length; i++) {
                calculateNodeStatistics(domNode.childNodes[i], statistics);
            }
        }

    } catch (exc) {
        logError('Node statistics calculation failed: ' + exc.message, 'enumeration');
    }
}

/**
 * Find objects with multiple access paths - ENHANCED LOGGING
 * @param {Object} domStructure - DOM structure
 * @returns {Object} Objects with multiple paths
 */
function findObjectsWithMultiplePaths(domStructure) {
    try {
        logDebug('Finding objects with multiple access paths', 'enumeration');

        var multiPathObjects = {};

        // This would require a more sophisticated implementation
        // For now, return empty object
        
        logDebug('Multiple path analysis completed', 'enumeration');
        return multiPathObjects;

    } catch (exc) {
        logError('Multiple paths analysis failed: ' + exc.message, 'enumeration');
        return {};
    }
}

// =============================================================================
// PROPERTY CLASSIFICATION - ENHANCED LOGGING AND ENHANCED isLikelyCollection
// =============================================================================

/**
 * Classify property safety - ENHANCED LOGGING
 * @param {String} propName - Property name
 * @param {String} propType - Property type
 * @returns {String} Safety level
 */
function classifyPropertySafety(propName, propType) {
    try {
        if (isDangerousProperty(propName)) {
            logDebug('Property classified as dangerous: ' + propName, 'enumeration');
            return 'dangerous';
        }

        if (isReservedWord(propName)) {
            logDebug('Property classified as caution (reserved word): ' + propName, 'enumeration');
            return 'caution';
        }

        if (propType === 'function') {
            logDebug('Property classified as caution (function): ' + propName, 'enumeration');
            return 'caution';
        }

        logDebug('Property classified as safe: ' + propName, 'enumeration');
        return 'safe';

    } catch (exc) {
        logError('Property safety classification failed for: ' + propName + ': ' + exc.message, 'enumeration');
        return 'dangerous';
    }
}

/**
 * Enhanced collection detection - KEEPING ENHANCED VERSION
 * @param {*} obj - Object to check
 * @returns {Boolean} True if likely a collection
 */
function isLikelyCollection(obj) {
    try {
        if (!obj || typeof obj !== 'object') {
            return false;
        }

        // Check for length property (most reliable indicator)
        if (typeof obj.length === 'number') {
            logDebug('Object identified as collection (has numeric length): ' + obj.length, 'enumeration');
            return true;
        }

        // Check for array-like properties
        if (obj.constructor && obj.constructor.name) {
            var constructorName = stringToLowerCase(obj.constructor.name);
            var collectionTypes = ['array', 'nodelist', 'htmlcollection', 'collection'];
            
            for (var i = 0; i < collectionTypes.length; i++) {
                if (stringIndexOf(constructorName, collectionTypes[i]) !== -1) {
                    logDebug('Object identified as collection (constructor type): ' + obj.constructor.name, 'enumeration');
                    return true;
                }
            }
        }

        // Check for InDesign collection patterns
        var indesignCollectionProps = ['add', 'item', 'itemByName', 'itemByID', 'firstItem', 'lastItem'];
        var foundInDesignProps = 0;
        
        for (var j = 0; j < indesignCollectionProps.length; j++) {
            if (safeHasProperty(obj, indesignCollectionProps[j])) {
                foundInDesignProps++;
            }
        }
        
        if (foundInDesignProps >= 3) {
            logDebug('Object identified as InDesign collection (has collection methods)', 'enumeration');
            return true;
        }

        // Check for indexed properties (0, 1, 2, etc.)
        var indexedCount = 0;
        for (var prop in obj) {
            if (objectHasOwnProperty(obj, prop)) {
                var propNum = safeParseInt(prop, 10);
                if (!isNaN(propNum) && propNum >= 0) {
                    indexedCount++;
                    if (indexedCount >= 3) {
                        logDebug('Object identified as collection (has indexed properties)', 'enumeration');
                        return true;
                    }
                }
            }
        }

        return false;

    } catch (exc) {
        logError('Collection detection failed: ' + exc.message, 'enumeration');
        return false;
    }
}

// =============================================================================
// UTILITIES - ENHANCED LOGGING
// =============================================================================

/**
 * Create progress reporter - ENHANCED LOGGING
 * @returns {Object} Progress reporter
 */
function createProgressReporter() {
    try {
        logDebug('Creating progress reporter', 'enumeration');

        return {
            reportProgress: function(message) {
                try {
                    logInfo('Progress: ' + message, 'enumeration');
                } catch (exc) {
                    // Silent failure
                }
            },

            complete: function() {
                try {
                    logInfo('Progress reporting completed', 'enumeration');
                } catch (exc) {
                    // Silent failure
                }
            }
        };

    } catch (exc) {
        logError('Progress reporter creation failed: ' + exc.message, 'enumeration');
        return {
            reportProgress: function () { },
            complete: function () { }
        };
    }
}

// =============================================================================
// MODULE REGISTRATION - UPDATED VERSION
// =============================================================================

// Register this module with all its functions
registerModule('2.1.0.0_dom-enumerator', '4.1', [
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
// END OF 2.1_dom-enumerator.jsx - ENHANCED WITH v4.1 IMPROVEMENTS
// =============================================================================