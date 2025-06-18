// =============================================================================
// 2.1_dom-enumerator.jsx - DOM STRUCTURE DISCOVERY
// InDesign DOM Discovery Builder v3.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: Complete DOM structure discovery with object reference tracking
// DEPENDENCIES: ["1.1_bootstrap-foundation.jsx", "1.2_safety-utilities.jsx"]
// SIZE: ~1400 lines - COMPLETE IMPLEMENTATION
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
// MAIN ENUMERATION FUNCTIONS
// =============================================================================

/**
 * Complete DOM enumeration with object tracking
 * @param {Object} documentObject - InDesign document to enumerate
 * @param {Object} config - Enumeration configuration
 * @returns {Object} Complete DOMStructure object
 */
/**
 * Complete DOM enumeration with object tracking - FIXED VERSION
 * @param {Object} documentObject - InDesign document to enumerate
 * @param {Object} enumerationConfig - Enumeration configuration
 * @returns {Object} Complete DOMStructure object
 */
function enumerateDocumentDOM(documentObject, enumerationConfig) {
    var startTime = new Date().getTime();

    debugLog('=== STARTING enumerateDocumentDOM ===', 'enumeration');
    debugLog('Start time: ' + startTime, 'enumeration');
    debugLog('Config received: ' + (enumerationConfig ? 'YES' : 'NO'), 'enumeration');

    var mergedConfig = enumerationConfig ?
        objectMerge(DEFAULT_ENUMERATION_CONFIG, enumerationConfig) :
        objectClone(DEFAULT_ENUMERATION_CONFIG, 2);

    debugLog('Final config maxDepth: ' + mergedConfig.maxDepth, 'enumeration');
    debugLog('Final config timeoutMs: ' + mergedConfig.timeoutMs, 'enumeration');
    debugLog('Final config maxProperties: ' + mergedConfig.maxProperties, 'enumeration');

    try {
        // Validate environment
        var envValidation = validateInDesignEnvironment();
        if (!envValidation.valid) {
            debugLog('Environment validation FAILED: ' + envValidation.error, 'enumeration');
            return createErrorDOMStructure(envValidation.error);
        }
        debugLog('Environment validation PASSED', 'enumeration');

        var targetDocument = documentObject || envValidation.document;
        var docValidation = validateDocumentState(targetDocument);
        debugLog('Document validation completed', 'enumeration');

        // Create DOM structure container
        var domStructure = createDOMStructure();
        debugLog('DOM structure container created', 'enumeration');

        // Set up metadata
        domStructure.metadata = {
            timestamp: getCurrentTimestamp(),
            documentName: docValidation.metadata.name || 'Unknown Document',
            version: '3.1',
            configuration: mergedConfig,
            enhancedFeatures: {
                objectTracking: mergedConfig.enableObjectTracking,
                duplicateDetection: mergedConfig.enableDuplicateDetection,
                es3Compliant: true,
                moduleSystem: true
            },
            environment: {
                indesignVersion: envValidation.metadata ?
                    envValidation.metadata.indesignVersion : 'unknown',
                hasNativeJSON: envValidation.metadata ?
                    envValidation.metadata.hasNativeJSON : false
            }
        };

        // Add document validation warnings
        if (docValidation.warnings && docValidation.warnings.length > 0) {
            domStructure.metadata.warnings = docValidation.warnings;
        }

        // Initialize object registry for tracking
        if (mergedConfig.enableObjectTracking) {
            domStructure.objectRegistry = {
                references: {},
                duplicateDetections: {},
                circularReferences: [],
                totalTracked: 0
            };
            debugLog('Object registry initialized', 'enumeration');
        }

        // Create progress reporter if enabled
        var progressReporter = mergedConfig.enableProgressReporting ?
            createProgressReporter() : null;

        debugLog('About to call enumerateObjectStructure...', 'enumeration');
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
        debugPerformance('enumerateObjectStructure', enumStartTime, enumEndTime);
        debugLog('Document node created, properties: ' +
            (domStructure.structure.document.properties ? domStructure.structure.document.properties.length : 'undefined'), 'enumeration');

        // Post-processing
        if (mergedConfig.includeAlternativeAccessPaths) {
            debugLog('Running updateAlternativeAccessPaths...', 'enumeration');
            updateAlternativeAccessPaths(domStructure);
        }

        // Generate statistics
        if (mergedConfig.generateStatistics) {
            debugLog('Generating statistics...', 'enumeration');
            domStructure.statistics = generateDOMStatistics(domStructure);

            // **FIX: Transfer statistics to metadata for UI display**
            if (domStructure.statistics) {
                debugLog('Transferring statistics to metadata...', 'enumeration');
                domStructure.metadata.totalObjects = domStructure.statistics.totalNodes || 0;
                domStructure.metadata.totalProperties = domStructure.statistics.totalProperties || 0;
                domStructure.metadata.totalCollections = domStructure.statistics.totalCollections || 0;
                domStructure.metadata.totalMethods = domStructure.statistics.totalMethods || 0;
                domStructure.metadata.maxDepth = domStructure.statistics.maxDepth || 0;

                debugLog('Statistics transferred - totalObjects: ' + domStructure.metadata.totalObjects, 'enumeration');
                debugLog('Statistics transferred - totalProperties: ' + domStructure.metadata.totalProperties, 'enumeration');
            }
        }

        // Final metadata
        domStructure.metadata.enumerationTime = new Date().getTime() - startTime;
        domStructure.metadata.completed = true;

        debugLog('=== ENUMERATION COMPLETED ===', 'enumeration');
        debugPerformance('Total enumeration', startTime, new Date().getTime());
        debugLog('Properties found: ' +
            (domStructure.structure.document.properties ? domStructure.structure.document.properties.length : 0), 'enumeration');
        debugLog('Methods found: ' +
            (domStructure.structure.document.methods ? domStructure.structure.document.methods.length : 0), 'enumeration');

        if (progressReporter) {
            progressReporter.complete();
        }

        return domStructure;

    } catch (exc) {
        debugLog('EXCEPTION: ' + exc.message, 'enumeration');
        return createErrorDOMStructure('DOM enumeration failed: ' + exc.message);
    }
}

/**
 * Enumerate object structure with improved filtering and global timeout
 */
function enumerateObjectStructure(targetObject, objectPath, depth, config, domStructure, progressReporter, globalStartTime) {
    var realGlobalStartTime = globalStartTime || new Date().getTime();
    var localStartTime = new Date().getTime();

    // GLOBAL TIMEOUT CHECK FIRST
    var globalElapsed = localStartTime - realGlobalStartTime;
    if (config.timeoutMs && globalElapsed > config.timeoutMs) {
        debugLog('GLOBAL TIMEOUT REACHED! Stopping at: ' + objectPath + ' (elapsed: ' + globalElapsed + 'ms)', 'enumeration');
        var timeoutNode = createDOMNode(objectPath, 'GlobalTimeoutReached', 'timeout', depth);
        timeoutNode.globalTimeoutReached = true;
        timeoutNode.globalElapsedTime = globalElapsed;
        return timeoutNode;
    }

    debugLog('Starting: ' + objectPath + ' (depth: ' + depth + ', global elapsed: ' + globalElapsed + 'ms)', 'enumeration');

    try {
        // Check depth limits
        if (depth >= config.maxDepth) {
            debugLog('Max depth reached at: ' + objectPath, 'enumeration');
            return createDOMNode(objectPath, 'MaxDepthReached', 'limit', depth);
        }

        if (!targetObject) {
            debugLog('Null object at: ' + objectPath, 'enumeration');
            return createDOMNode(objectPath, 'NullObject', 'null', depth);
        }

        // IMPROVED: Skip InDesign internal objects that aren't useful
        if (shouldSkipObject(objectPath, targetObject)) {
            debugLog('Skipping internal object: ' + objectPath, 'enumeration');
            var skippedNode = createDOMNode(objectPath, 'SkippedInternal', 'skipped', depth);
            skippedNode.skipReason = 'InDesign internal object filtered';
            return skippedNode;
        }

        // Check for circular references with improved logic
        if (config.enableCircularReferenceDetection) {
            var circularRef = detectCircularReference(targetObject, objectPath, domStructure);
            if (circularRef.isCircular) {
                debugLog('Circular reference detected at: ' + objectPath + ' (' + circularRef.reason + ')', 'enumeration');
                return createDOMNode(objectPath, 'CircularReference', 'circular', depth, circularRef.originalPath);
            }
        }

        // Create DOM node for this object
        var domNode = createDOMNode(objectPath, objectPath, typeof targetObject, depth);

        // Generate object identity hash for tracking
        if (config.enableObjectTracking) {
            domNode.objectId = generateObjectIdentityHash(targetObject, objectPath);
            registerObjectReference(domNode.objectId, targetObject, objectPath, domStructure);
        }

        // Report progress
        if (progressReporter) {
            progressReporter.reportProgress('Enumerating: ' + objectPath);
        }

        debugLog('Starting property enumeration for: ' + objectPath, 'enumeration');

        // Enumerate properties with GLOBAL timeout and filtering
        var propertyCount = 0;
        var operationCount = 0;
        var globalTimeoutReached = false;
        var skippedCount = 0;

        try {
            for (var propName in targetObject) {
                // CRITICAL: Check GLOBAL timeout every 5 properties
                if (operationCount % 5 === 0) {
                    var currentGlobalElapsed = new Date().getTime() - realGlobalStartTime;

                    if (operationCount % 25 === 0 && operationCount > 0) {
                        debugLog('Progress: ' + operationCount + ' properties at ' + objectPath + ' (global elapsed: ' + currentGlobalElapsed + 'ms)', 'enumeration');
                    }

                    // GLOBAL TIMEOUT CHECK
                    if (config.timeoutMs && currentGlobalElapsed > config.timeoutMs) {
                        debugLog('GLOBAL TIMEOUT during property enum! Stopping at: ' + objectPath, 'enumeration');
                        domNode.truncated = true;
                        domNode.truncationReason = 'Global timeout reached (' + currentGlobalElapsed + 'ms > ' + config.timeoutMs + 'ms)';
                        globalTimeoutReached = true;
                        break;
                    }
                }

                // Check operation limits
                operationCount++;
                if (operationCount > config.maxProperties) {
                    debugLog('Property limit reached at: ' + objectPath + ' (' + operationCount + ' properties)', 'enumeration');
                    domNode.truncated = true;
                    domNode.truncationReason = 'Property limit exceeded (' + operationCount + ' > ' + config.maxProperties + ')';
                    break;
                }

                // IMPROVED: Skip properties that are likely InDesign internals
                if (shouldSkipProperty(propName, objectPath)) {
                    skippedCount++;
                    continue;
                }

                if (objectHasOwnProperty(targetObject, propName)) {
                    var processed = processProperty(
                        targetObject,
                        propName,
                        objectPath,
                        depth,
                        config,
                        domStructure,
                        domNode,
                        [],
                        realGlobalStartTime
                    );

                    if (processed) {
                        propertyCount++;
                    }
                }

                // Double-check global timeout after each property
                var postPropertyElapsed = new Date().getTime() - realGlobalStartTime;
                if (config.timeoutMs && postPropertyElapsed > config.timeoutMs) {
                    debugLog('Global timeout after property: ' + propName, 'enumeration');
                    globalTimeoutReached = true;
                    break;
                }
            }
        } catch (enumExc) {
            debugLog('Property enumeration exception at: ' + objectPath + ' - ' + enumExc.message, 'enumeration');
            domNode.enumerationError = 'Property enumeration failed: ' + enumExc.message;
        }

        var endTime = new Date().getTime();
        var localTime = endTime - localStartTime;
        var finalGlobalElapsed = endTime - realGlobalStartTime;

        domNode.propertyCount = propertyCount;
        domNode.operationCount = operationCount;
        domNode.skippedCount = skippedCount;
        domNode.localEnumerationTime = localTime;
        domNode.globalElapsedTime = finalGlobalElapsed;
        domNode.globalTimeoutReached = globalTimeoutReached;

        debugLog('Completed: ' + objectPath + ' - Props: ' + propertyCount + ', Skipped: ' + skippedCount + ', Local: ' + localTime + 'ms, Global: ' + finalGlobalElapsed + 'ms', 'enumeration');

        return domNode;

    } catch (exc) {
        var exceptionTime = new Date().getTime() - localStartTime;
        var exceptionGlobalElapsed = new Date().getTime() - realGlobalStartTime;
        debugLog('EXCEPTION in: ' + objectPath + ' after ' + exceptionTime + 'ms (global: ' + exceptionGlobalElapsed + 'ms) - ' + exc.message, 'enumeration');
        return createErrorDOMNode(objectPath, 'Enumeration error: ' + exc.message, depth);
    }
}

/**
 * Determine if an object should be skipped during enumeration
 * @param {String} objectPath - Object path
 * @param {Object} targetObject - Object to check
 * @returns {Boolean} True if should skip
 */
function shouldSkipObject(objectPath, targetObject) {
    try {
        // Skip deep InDesign preference objects that aren't useful for most users
        var skipPatterns = [
            'metadataPreferences.properties.',
            'indexGenerationOptions.properties.',
            'dataGroupPreferences.',
            'adjustLayoutPreferences.properties.',
            'epubFixedLayoutExportPreferences.properties.'
        ];

        for (var i = 0; i < skipPatterns.length; i++) {
            if (stringIndexOf(objectPath, skipPatterns[i]) !== -1) {
                return true;
            }
        }

        // Skip if object path is too deep in preferences
        var pathParts = objectPath.split('.');
        if (pathParts.length > 6 && stringIndexOf(objectPath, 'preferences') !== -1) {
            return true;
        }

        return false;

    } catch (exc) {
        return false;
    }
}

/**
 * Determine if a property should be skipped during enumeration
 * @param {String} propName - Property name
 * @param {String} objectPath - Object path
 * @returns {Boolean} True if should skip
 */
function shouldSkipProperty(propName, objectPath) {
    try {
        // Skip certain property patterns that are rarely useful
        var skipPropertyPatterns = [
            'eventListeners',
            'scriptPreferences',
            'insertionPoints'
        ];

        for (var i = 0; i < skipPropertyPatterns.length; i++) {
            if (stringIndexOf(propName, skipPropertyPatterns[i]) !== -1) {
                return true;
            }
        }

        return false;

    } catch (exc) {
        return false;
    }
}

/**
 * Process property with object tracking and safety checks
 * @param {Object} targetObject - Object containing property
 * @param {String} propName - Property name
 * @param {String} objectPath - Object path
 * @param {Number} depth - Current depth
 * @param {Object} config - Configuration
 * @param {Object} domStructure - DOM structure
 * @param {Object} domNode - Current DOM node
 * @param {Array} parentPaths - Parent paths for circular detection
 * @returns {Boolean} True if processed successfully
 */
function processProperty(targetObject, propName, objectPath, depth, config, domStructure, domNode, parentPaths, globalStartTime) {
    try {
        // Check global timeout first
        if (globalStartTime && config.timeoutMs) {
            var globalElapsed = new Date().getTime() - globalStartTime;
            if (globalElapsed > config.timeoutMs) {
                return true; // Skip this property due to global timeout
            }
        }

        // Skip dangerous properties if configured
        if (config.skipDangerous && isDangerousProperty(propName)) {
            return true;
        }

        // Skip ES3 reserved words
        if (isReservedWord(propName)) {
            return true;
        }

        // Get property type safely
        var propertyType = safeTypeCheck(targetObject, propName);
        if (propertyType === 'error') {
            return true;
        }

        // Create property classification
        var propClassification = createPropertyClassification(propName, propertyType, objectPath, null);

        // Add safety classification if enabled
        if (config.trackPropertySafety) {
            propClassification.safetyLevel = getPropertySafetyLevel(propName);
        }

        // Add to appropriate collection
        if (propClassification.isMethod) {
            domNode.methods[domNode.methods.length] = propClassification;
        } else if (propClassification.isCollection) {
            domNode.collections[domNode.collections.length] = propClassification;
        } else {
            domNode.properties[domNode.properties.length] = propClassification;
        }

        // If property is an object, recursively enumerate it
        if (propertyType === 'object' && depth < config.maxDepth - 1) {
            try {
                var childObject = targetObject[propName];
                if (childObject) {
                    var childPath = objectPath + '.' + propName;

                    // Check for circular references in parent chain
                    var newParentPaths = arraySlice(parentPaths, 0);
                    newParentPaths[newParentPaths.length] = objectPath;

                    var childNode = enumerateObjectStructure(
                        childObject,
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
            }
        }

        return true;

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
                error: errorMessage || 'Unknown error',
                timestamp: getCurrentTimestamp(),
                version: '3.1',
                completed: false
            },
            structure: {
                document: createErrorDOMNode('document', errorMessage, 0)
            },
            statistics: {
                totalNodes: 1,
                totalProperties: 0,
                enumerationSuccess: false
            }
        };
    } catch (exc) {
        return {
            error: 'Critical DOM structure creation failure',
            timestamp: getCurrentTimestamp()
        };
    }
}

// =============================================================================
// OBJECT REFERENCE MANAGEMENT
// =============================================================================

/**
 * Generate object identity hash
 * @param {Object} targetObject - Object to hash
 * @param {String} path - Object path
 * @returns {String} Identity hash
 */
function generateObjectIdentityHash(targetObject, path) {
    try {
        var hashComponents = [];

        hashComponents[hashComponents.length] = 'path:' + (path || 'unknown');
        hashComponents[hashComponents.length] = 'type:' + typeof targetObject;

        if (targetObject && typeof targetObject === 'object') {
            if (targetObject.constructor && targetObject.constructor.name) {
                hashComponents[hashComponents.length] = 'constructor:' + targetObject.constructor.name;
            }

            if (typeof targetObject.length === 'number') {
                hashComponents[hashComponents.length] = 'length:' + targetObject.length;
            }

            hashComponents[hashComponents.length] = 'keys:' + countObjectKeys(targetObject);
        }

        hashComponents[hashComponents.length] = 'time:' + (new Date().getTime());

        return arrayJoin(hashComponents, '|');

    } catch (exc) {
        return 'hash_error:' + (path || 'unknown') + ':' + (new Date().getTime());
    }
}

/**
 * Register object reference in DOM structure
 * @param {String} objectId - Object ID
 * @param {Object} targetObject - Object to register
 * @param {String} path - Object path
 * @param {Object} domStructure - DOM structure
 */
function registerObjectReference(objectId, targetObject, path, domStructure) {
    try {
        if (!domStructure.objectRegistry) {
            return;
        }

        if (domStructure.objectRegistry.references[objectId]) {
            // Object already registered - potential duplicate
            if (!domStructure.objectRegistry.duplicateDetections[objectId]) {
                domStructure.objectRegistry.duplicateDetections[objectId] = [];
            }
            domStructure.objectRegistry.duplicateDetections[objectId][domStructure.objectRegistry.duplicateDetections[objectId].length] = path;
        } else {
            domStructure.objectRegistry.references[objectId] = {
                object: targetObject,
                firstPath: path,
                registeredAt: getCurrentTimestamp()
            };
            domStructure.objectRegistry.totalTracked++;
        }

    } catch (exc) {
        // Silent failure for object registration
    }
}

/**
 * Check for object duplication
 * @param {String} objectId - Object ID to check
 * @param {Object} domStructure - DOM structure
 * @returns {Object} Duplication check result
 */
function checkObjectDuplication(objectId, domStructure) {
    var result = {
        isDuplicate: false,
        originalPath: null,
        duplicatePaths: []
    };

    try {
        if (!domStructure.objectRegistry || !objectId) {
            return result;
        }

        if (domStructure.objectRegistry.references[objectId]) {
            result.originalPath = domStructure.objectRegistry.references[objectId].firstPath;
        }

        if (domStructure.objectRegistry.duplicateDetections[objectId]) {
            result.isDuplicate = true;
            result.duplicatePaths = domStructure.objectRegistry.duplicateDetections[objectId];
        }

        return result;

    } catch (exc) {
        return result;
    }
}

// =============================================================================
// CIRCULAR REFERENCE DETECTION
// =============================================================================

/**
 * Detect circular references with improved logic - LESS AGGRESSIVE
 * @param {Object} targetObject - Object to check
 * @param {String} objectPath - Current path
 * @param {Object} domStructure - DOM structure
 * @returns {Object} Detection result
 */
function detectCircularReference(targetObject, objectPath, domStructure) {
    debugLog('Checking circular reference for: ' + objectPath, 'circular');

    var result = {
        isCircular: false,
        originalPath: null,
        reason: ''
    };

    try {
        if (!domStructure.objectRegistry || !targetObject) {
            debugLog('No object registry or null object: ' + objectPath, 'circular');
            return result;
        }

        // Generate object identity
        var objectId = generateObjectIdentityHash(targetObject, objectPath);

        // Check if we've seen this exact object before
        if (domStructure.objectRegistry.references[objectId]) {
            var originalPath = domStructure.objectRegistry.references[objectId].path;

            // IMPROVED: Only consider it circular if it's actually in the parent chain
            if (isInParentChain(originalPath, objectPath)) {
                result.isCircular = true;
                result.originalPath = originalPath;
                result.reason = 'Object found in parent chain';
                debugLog('TRUE CIRCULAR REFERENCE: ' + objectPath + ' -> ' + originalPath, 'circular');
            } else {
                // This is just a duplicate reference, not a circular one
                result.isCircular = false;
                result.reason = 'Duplicate reference, but not circular';
                debugLog('Duplicate reference (not circular): ' + objectPath + ' (original: ' + originalPath + ')', 'circular');
            }
        } else {
            debugLog('New object reference: ' + objectPath, 'circular');
        }

        return result;

    } catch (exc) {
        debugLog('Circular detection error for ' + objectPath + ': ' + exc.message, 'circular');
        result.reason = 'Detection error: ' + exc.message;
        return result;
    }
}

/**
 * Check if originalPath is in the parent chain of currentPath
 * @param {String} originalPath - Original object path
 * @param {String} currentPath - Current object path
 * @returns {Boolean} True if originalPath is parent of currentPath
 */
function isInParentChain(originalPath, currentPath) {
    try {
        if (!originalPath || !currentPath) {
            return false;
        }

        // Split paths into components
        var originalParts = originalPath.split('.');
        var currentParts = currentPath.split('.');

        // Original path must be shorter to be a parent
        if (originalParts.length >= currentParts.length) {
            return false;
        }

        // Check if original path is prefix of current path
        for (var i = 0; i < originalParts.length; i++) {
            if (originalParts[i] !== currentParts[i]) {
                return false;
            }
        }

        debugLog('Parent chain detected: ' + originalPath + ' is parent of ' + currentPath, 'circular');
        return true;

    } catch (exc) {
        debugLog('Parent chain check error: ' + exc.message, 'circular');
        return false;
    }
}

// =============================================================================
// POST-PROCESSING
// =============================================================================

/**
 * Update alternative access paths in DOM structure
 * @param {Object} domStructure - DOM structure to update
 */
function updateAlternativeAccessPaths(domStructure) {
    try {
        if (!domStructure.structure || !domStructure.structure.document) {
            return;
        }

        updateNodeAlternativePaths(domStructure.structure.document, domStructure);

    } catch (exc) {
        // Silent failure for post-processing
    }
}

/**
 * Update alternative paths for a specific node
 * @param {Object} domNode - DOM node to update
 * @param {Object} domStructure - DOM structure
 */
function updateNodeAlternativePaths(domNode, domStructure) {
    try {
        if (!domNode || !domStructure.objectRegistry) {
            return;
        }

        // Check for duplicate objects that provide alternative access paths
        if (domNode.objectId) {
            var duplicationCheck = checkObjectDuplication(domNode.objectId, domStructure);
            if (duplicationCheck.isDuplicate) {
                domNode.alternativeAccessPaths = arrayConcat(
                    domNode.alternativeAccessPaths,
                    duplicationCheck.duplicatePaths
                );
            }
        }

        // Process child nodes recursively
        if (domNode.childNodes) {
            for (var i = 0; i < domNode.childNodes.length; i++) {
                updateNodeAlternativePaths(domNode.childNodes[i], domStructure);
            }
        }

    } catch (exc) {
        // Continue processing
    }
}

// =============================================================================
// ANALYSIS FUNCTIONS
// =============================================================================

/**
 * Get DOM statistics
 * @param {Object} domStructure - DOM structure to analyze
 * @returns {Object} Statistics object
 */
/**
 * Generate DOM statistics - FIXED VERSION (renamed from getDOMStatistics)
 * @param {Object} domStructure - DOM structure to analyze
 * @returns {Object} Statistics object
 */
function generateDOMStatistics(domStructure) {
    try {
        debugLog('=== STARTING generateDOMStatistics ===', 'enumeration');

        var statistics = {
            totalNodes: 0,
            totalProperties: 0,
            totalCollections: 0,
            totalMethods: 0,
            maxDepth: 0,
            objectsTracked: 0,
            duplicateObjects: 0,
            circularReferences: 0,
            enumerationSuccess: true,
            generatedAt: getCurrentTimestamp()
        };

        if (domStructure.structure && domStructure.structure.document) {
            debugLog('Counting statistics from document node...', 'enumeration');
            calculateNodeStatistics(domStructure.structure.document, statistics);
            debugLog('After counting - totalNodes: ' + statistics.totalNodes + ', totalProperties: ' + statistics.totalProperties, 'enumeration');
        } else {
            debugLog('WARNING: No document structure found for statistics!', 'enumeration');
        }

        // Add object registry statistics
        if (domStructure.objectRegistry) {
            statistics.objectsTracked = domStructure.objectRegistry.totalTracked || 0;
            statistics.duplicateObjects = countObjectKeys(domStructure.objectRegistry.duplicateDetections || {});
            statistics.circularReferences = domStructure.objectRegistry.circularReferences ?
                domStructure.objectRegistry.circularReferences.length : 0;
        }

        debugLog('Final statistics: totalNodes=' + statistics.totalNodes + ', totalProperties=' + statistics.totalProperties, 'enumeration');
        return statistics;

    } catch (exc) {
        debugLog('Statistics generation error: ' + exc.message, 'enumeration');
        return {
            totalNodes: 0,
            totalProperties: 0,
            enumerationSuccess: false,
            errorMessage: 'Statistics generation failed: ' + exc.message,
            generatedAt: getCurrentTimestamp()
        };
    }
}

/**
 * Count statistics for a DOM node recursively - FIXED VERSION
 * @param {Object} domNode - DOM node to count
 * @param {Object} statistics - Statistics object to update
 */
function calculateNodeStatistics(domNode, statistics) {
    try {
        if (!domNode || !statistics) {
            debugLog('calculateNodeStatistics: Invalid parameters', 'enumeration');
            return;
        }

        debugLog('Counting node: ' + (domNode.path || 'unknown') + ', depth: ' + (domNode.depth || 0), 'enumeration');

        statistics.totalNodes++;

        if (domNode.depth > statistics.maxDepth) {
            statistics.maxDepth = domNode.depth;
        }

        if (domNode.properties) {
            var propCount = domNode.properties.length;
            statistics.totalProperties += propCount;
            debugLog('Added ' + propCount + ' properties (total now: ' + statistics.totalProperties + ')', 'enumeration');
        }

        if (domNode.collections) {
            statistics.totalCollections += domNode.collections.length;
        }

        if (domNode.methods) {
            statistics.totalMethods += domNode.methods.length;
        }

        // Process child nodes
        if (domNode.childNodes) {
            debugLog('Processing ' + domNode.childNodes.length + ' child nodes...', 'enumeration');
            for (var i = 0; i < domNode.childNodes.length; i++) {
                calculateNodeStatistics(domNode.childNodes[i], statistics);
            }
        }

    } catch (exc) {
        debugLog('Error in calculateNodeStatistics: ' + exc.message, 'enumeration');
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
                    domStructure.objectRegistry.references[objectId].firstPath : 'unknown';

                var allPaths = [originalPath];
                allPaths = arrayConcat(allPaths, duplicatePaths);

                multiPathObjects[multiPathObjects.length] = {
                    objectId: objectId,
                    name: originalPath,
                    alternativeAccessPaths: allPaths,
                    pathCount: allPaths.length
                };
            }
        }

        return multiPathObjects;

    } catch (exc) {
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
 * @returns {String} Safety classification
 */
function classifyPropertySafety(propName, propType) {
    try {
        if (isDangerousProperty(propName)) {
            return 'dangerous';
        }

        if (isReservedWord(propName)) {
            return 'reserved';
        }

        if (propType === 'function') {
            return 'method';
        }

        var cautionProperties = [
            'parent', 'document', 'application', 'activeDocument',
            'selection', 'preferences', 'menuActions'
        ];

        if (arrayIndexOf(cautionProperties, propName) !== -1) {
            return 'caution';
        }

        return 'safe';

    } catch (exc) {
        return 'unknown';
    }
}

/**
 * Check if property name suggests it's a collection
 * @param {String} propName - Property name to check
 * @returns {Boolean} True if likely a collection
 */
function isLikelyCollection(propName) {
    try {
        if (typeof propName !== 'string') {
            return false;
        }

        var collectionIndicators = [
            'items', 'pages', 'layers', 'stories', 'textFrames',
            'rectangles', 'ovals', 'groups', 'spreads',
            'masterspread', 'characters', 'words', 'lines',
            'paragraphs', 'tables', 'rows', 'cells', 'columns'
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
// UTILITIES
// =============================================================================

/**
 * Create progress reporter
 * @returns {Object} Progress reporter object
 */
function createProgressReporter() {
    try {
        return {
            startTime: new Date().getTime(),
            itemsProcessed: 0,

            reportProgress: function (message) {
                try {
                    this.itemsProcessed++;
                    if (this.itemsProcessed % 100 === 0) {
                        debugLog('[DOM Enumerator] Progress: ' + message +
                            ' (Items: ' + this.itemsProcessed + ')');
                    }
                } catch (exc) {
                    // Silent failure
                }
            },

            complete: function () {
                try {
                    var elapsed = new Date().getTime() - this.startTime;
                    debugLog('[DOM Enumerator] Completed enumeration of ' +
                        this.itemsProcessed + ' items in ' + elapsed + 'ms');
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
// MODULE REGISTRATION
// =============================================================================

// Register this module with all its functions
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
// END OF 2.1_dom-enumerator.jsx
// =============================================================================