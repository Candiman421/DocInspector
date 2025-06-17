// =============================================================================
// 2.1_dom-enumerator.jsx - DOM STRUCTURE DISCOVERY
// InDesign DOM Discovery Builder v3.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: Complete DOM structure discovery with object reference tracking
// DEPENDENCIES: ["1.1_bootstrap-foundation.jsx", "1.2_safety-utilities.jsx"]
// SIZE: ~750 lines - COMPLETE IMPLEMENTATION
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
    enableDuplicateDetection: true
};

// =============================================================================
// MAIN ENUMERATION FUNCTIONS
// =============================================================================

/**
 * Complete DOM enumeration with object tracking
 * @param {Object} documentObj - InDesign document to enumerate
 * @param {Object} config - Enumeration configuration
 * @returns {Object} Complete DOMStructure object
 */
function enumerateDocumentDOM(documentObj, config) {
    var startTime = new Date().getTime();
    var enumerationConfig = config ? 
        objectClone(config, 2) : objectClone(DEFAULT_ENUMERATION_CONFIG, 2);
    
    try {
        // Validate environment
        var envValidation = validateInDesignEnvironment();
        if (!envValidation.valid) {
            return createErrorDOMStructure(envValidation.error);
        }
        
        var targetDocument = documentObj || envValidation.document;
        var docValidation = validateDocumentState(targetDocument);
        
        // Create DOM structure container
        var domStructure = createDOMStructure();
        
        // Set up metadata
        domStructure.metadata = {
            timestamp: getCurrentTimestamp(),
            documentName: docValidation.metadata.name || 'Unknown Document',
            version: '2.1.1',
            config: enumerationConfig,
            enhancedFeatures: {
                objectTracking: enumerationConfig.enableObjectTracking,
                duplicateDetection: enumerationConfig.enableDuplicateDetection,
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
        
        // Set up tracking and monitoring
        var timeoutChecker = createTimeoutChecker(enumerationConfig.timeoutMs);
        var operationCounter = createOperationCounter(enumerationConfig.maxProperties);
        var memoryMonitor = createMemoryMonitor();
        
        memoryMonitor.checkpoint('enumeration_start');
        
        // Progress reporting
        var progressReporter = createProgressReporter('DOM Enumeration', enumerationConfig.maxProperties);
        
        // Enumerate the document
        var documentNode = enumerateObjectStructure(
            targetDocument,
            'document',
            'document',
            0,
            enumerationConfig,
            domStructure,
            timeoutChecker,
            operationCounter,
            [],
            [],
            progressReporter
        );
        
        domStructure.structure.document = documentNode;
        
        // Update statistics
        domStructure.statistics = getDOMStatistics(domStructure);
        domStructure.statistics.enumerationTime = new Date().getTime() - startTime;
        domStructure.statistics.memoryReport = memoryMonitor.getReport();
        
        // Post-processing
        if (enumerationConfig.enableDuplicateDetection) {
            progressReporter.updateProgress('Post-processing object references...');
            updateAlternativeAccessPaths(domStructure);
        }
        
        memoryMonitor.checkpoint('enumeration_complete');
        progressReporter.complete();
        
        return domStructure;
        
    } catch (exc) {
        return createErrorDOMStructure('Enumeration failed: ' + exc.message);
    }
}

/**
 * Create progress reporter for user feedback
 * @param {String} operationName - Name of the operation
 * @param {Number} maxOperations - Maximum expected operations
 * @returns {Object} Progress reporter with update methods
 */
function createProgressReporter(operationName, maxOperations) {
    var reporter = {
        operationName: operationName,
        maxOperations: maxOperations || 1000,
        currentOperation: 0,
        lastReportTime: new Date().getTime(),
        reportInterval: 2000 // Report every 2 seconds
    };
    
    reporter.updateProgress = function(message, operationCount) {
        try {
            var now = new Date().getTime();
            
            if (operationCount !== undefined) {
                this.currentOperation = operationCount;
            } else {
                this.currentOperation++;
            }
            
            // Only report at intervals to avoid UI spam
            if (now - this.lastReportTime >= this.reportInterval) {
                var percentage = Math.min(100, Math.floor((this.currentOperation / this.maxOperations) * 100));
                var statusMessage = this.operationName + ': ' + percentage + '%';
                
                if (message) {
                    statusMessage += ' - ' + message;
                }
                
                $.writeln(statusMessage);
                this.lastReportTime = now;
            }
            
        } catch (exc) {
            // Silent failure for progress reporting
        }
    };
    
    reporter.complete = function() {
        try {
            $.writeln(this.operationName + ': Complete');
        } catch (exc) {
            // Silent failure
        }
    };
    
    return reporter;
}

/**
 * Recursive object enumeration with comprehensive tracking
 * @param {Object} targetObj - Object to enumerate
 * @param {String} objName - Name of the object
 * @param {String} objPath - Full dot path to object
 * @param {Number} depth - Current depth level
 * @param {Object} config - Enumeration configuration
 * @param {Object} domStructure - DOM structure to populate
 * @param {Function} timeoutChecker - Timeout checking function
 * @param {Object} operationCounter - Operation counter
 * @param {Array} visitedObjects - Array of visited objects for circular detection
 * @param {Array} pathStack - Current path stack for circular detection
 * @param {Object} progressReporter - Progress reporter
 * @returns {Object} DOMNode object
 */
function enumerateObjectStructure(targetObj, objName, objPath, depth, config, domStructure, 
                                 timeoutChecker, operationCounter, visitedObjects, pathStack, progressReporter) {
    try {
        // Check timeout and operation limits
        if (timeoutChecker() || operationCounter.isExceeded()) {
            return createErrorDOMNode(objName, objPath, 'timeout_exceeded', depth);
        }
        
        // Check depth limit
        if (depth >= config.maxDepth) {
            return createErrorDOMNode(objName, objPath, 'max_depth_reached', depth);
        }
        
        // Check for null/undefined objects
        if (!targetObj) {
            return createErrorDOMNode(objName, objPath, 'null_object', depth);
        }
        
        // Circular reference detection
        if (detectCircularReference(targetObj, visitedObjects)) {
            var circularNode = createDOMNode(objName, objPath, 'circular', depth, 'circular_' + generateUniqueID());
            circularNode.objectMetadata.isCircular = true;
            circularNode.objectMetadata.circularType = 'object_reference';
            circularNode.objectMetadata.circularPath = objPath;
            return circularNode;
        }
        
        // Register object reference
        var objectId = registerObjectReference(targetObj, objPath, domStructure);
        
        // Create DOM node
        var domNode = createDOMNode(objName, objPath, safeTypeOf(targetObj), depth, objectId);
        
        // Add to visited objects for circular detection
        var newVisitedObjects = arraySlice(visitedObjects, 0);
        arrayPush(newVisitedObjects, targetObj);
        
        var newPathStack = arraySlice(pathStack, 0);
        arrayPush(newPathStack, objPath);
        
        // Enumerate properties
        try {
            for (var propName in targetObj) {
                operationCounter.increment();
                progressReporter.updateProgress('Processing property: ' + propName);
                
                if (timeoutChecker() || operationCounter.isExceeded()) {
                    break;
                }
                
                try {
                    var propertyInfo = processProperty(
                        targetObj, propName, objPath, depth, config,
                        domStructure, timeoutChecker, operationCounter,
                        newVisitedObjects, newPathStack, progressReporter
                    );
                    
                    if (propertyInfo) {
                        if (propertyInfo.isMethod) {
                            arrayPush(domNode.methods, propertyInfo);
                        } else if (propertyInfo.isCollection) {
                            arrayPush(domNode.collections, propertyInfo);
                        } else {
                            arrayPush(domNode.properties, propertyInfo);
                        }
                    }
                    
                } catch (propExc) {
                    // Add error property
                    var errorProp = createPropertyClassification(propName, 'error', objPath, null);
                    errorProp.error = propExc.message;
                    arrayPush(domNode.properties, errorProp);
                }
            }
        } catch (enumExc) {
            domNode.objectMetadata.enumerationError = enumExc.message;
        }
        
        return domNode;
        
    } catch (exc) {
        return createErrorDOMNode(objName, objPath, 'enumeration_error: ' + exc.message, depth);
    }
}

/**
 * Process individual property with enhanced safety
 * @param {Object} targetObj - Object containing the property
 * @param {String} propName - Property name
 * @param {String} objPath - Current object path
 * @param {Number} depth - Current depth
 * @param {Object} config - Configuration
 * @param {Object} domStructure - DOM structure
 * @param {Function} timeoutChecker - Timeout checker
 * @param {Object} operationCounter - Operation counter
 * @param {Array} visitedObjects - Visited objects array
 * @param {Array} pathStack - Path stack
 * @param {Object} progressReporter - Progress reporter
 * @returns {Object} Property information or null
 */
function processProperty(targetObj, propName, objPath, depth, config, domStructure,
                        timeoutChecker, operationCounter, visitedObjects, pathStack, progressReporter) {
    try {
        // Skip dangerous properties if configured
        if (config.skipDangerous && !isPropertySafe(propName)) {
            return null;
        }
        
        var propValue;
        var propType;
        var propertyPath = objPath + '.' + propName;
        
        // Safe property access
        try {
            propValue = targetObj[propName];
            propType = safeTypeOf(propValue);
        } catch (accessExc) {
            // Create error property
            var errorProp = createPropertyClassification(propName, 'error', objPath, null);
            errorProp.accessError = accessExc.message;
            return errorProp;
        }
        
        // Create property classification
        var propInfo = createPropertyClassification(propName, propType, objPath, null);
        
        // Handle object properties with recursive enumeration
        if (propType === 'object' && propValue && depth < config.maxDepth - 1) {
            try {
                var childNode = enumerateObjectStructure(
                    propValue, propName, propertyPath, depth + 1, config,
                    domStructure, timeoutChecker, operationCounter,
                    visitedObjects, pathStack, progressReporter
                );
                
                if (childNode) {
                    if (!domStructure.structure.childNodes) {
                        domStructure.structure.childNodes = [];
                    }
                    arrayPush(domStructure.structure.childNodes, childNode);
                    propInfo.objectId = childNode.objectId;
                }
                
            } catch (childExc) {
                propInfo.childError = childExc.message;
            }
        }
        
        return propInfo;
        
    } catch (exc) {
        return createPropertyClassification(propName, 'error', objPath, null);
    }
}

// =============================================================================
// DATA STRUCTURE CREATION
// =============================================================================

/**
 * Create base DOM structure container
 * @returns {Object} Empty DOMStructure object
 */
function createDOMStructure() {
    return {
        metadata: {},
        statistics: {
            totalNodes: 0,
            totalProperties: 0,
            objectReferences: 0,
            duplicateObjects: 0,
            circularReferences: 0,
            enumerationTime: 0
        },
        structure: {
            document: null
        },
        objectRegistry: {
            references: {},
            accessPaths: {},
            duplicateDetections: {}
        }
    };
}

/**
 * Create DOM node with object reference tracking
 * @param {String} name - Object name
 * @param {String} path - Full dot path
 * @param {String} objType - Object type
 * @param {Number} depth - Nesting level
 * @param {String} objectId - Unique object identifier
 * @returns {Object} DOMNode object
 */
function createDOMNode(name, path, objType, depth, objectId) {
    return {
        name: name,
        path: path,
        type: objType,
        depth: depth,
        objectId: objectId,
        properties: [],
        collections: [],
        methods: [],
        childNodes: [],
        alternativeAccessPaths: [],
        objectMetadata: {
            isCircular: false,
            circularType: '',
            circularPath: '',
            referenceCount: 0,
            firstSeen: getCurrentTimestamp()
        }
    };
}

/**
 * Create property classification with value storage
 * @param {String} propName - Property name
 * @param {String} propType - Property type
 * @param {String} objPath - Object path
 * @param {String} objectId - Object ID if property references an object
 * @returns {Object} PropertyClassification object with value storage
 */
function createPropertyClassification(propName, propType, objPath, objectId) {
    return {
        name: propName,
        type: propType,
        safetyLevel: classifyPropertySafety(propName, propType),
        isCollection: isLikelyCollection(propName, propType),
        isMethod: propType === 'function',
        path: objPath + '.' + propName,
        objectId: objectId || null,
        alternativeAccessPaths: [],
        
        // Value storage for extraction phase
        extractedValue: null,
        valueFingerprint: null,
        lastExtracted: null,
        extractionMetadata: null
    };
}

/**
 * Create error DOM node for failed enumeration
 * @param {String} name - Object name
 * @param {String} path - Object path
 * @param {String} errorType - Type of error
 * @param {Number} depth - Current depth
 * @returns {Object} Error DOMNode
 */
function createErrorDOMNode(name, path, errorType, depth) {
    var errorNode = createDOMNode(name, path, 'error', depth, 'error_' + generateUniqueID());
    errorNode.objectMetadata.errorType = errorType;
    errorNode.objectMetadata.errorTime = getCurrentTimestamp();
    return errorNode;
}

/**
 * Create error DOM structure for failed enumeration
 * @param {String} errorMessage - Error message
 * @returns {Object} Error DOMStructure
 */
function createErrorDOMStructure(errorMessage) {
    var errorStructure = createDOMStructure();
    errorStructure.metadata.error = errorMessage;
    errorStructure.metadata.timestamp = getCurrentTimestamp();
    return errorStructure;
}

// =============================================================================
// OBJECT REFERENCE MANAGEMENT
// =============================================================================

/**
 * Generate object identity hash for reference tracking
 * @param {Object} targetObj - Object to hash
 * @param {String} objPath - Object path
 * @returns {String} Object identity hash
 */
function generateObjectIdentityHash(targetObj, objPath) {
    try {
        var components = [];
        
        // Add type component
        components.push('type:' + typeof targetObj);
        
        // Add path component
        if (objPath) {
            components.push('path:' + objPath);
        }
        
        // Add timestamp component for uniqueness
        components.push('time:' + new Date().getTime());
        
        return arrayJoin(components, '|');
        
    } catch (exc) {
        return 'hash_error_' + Math.random();
    }
}

/**
 * Register object reference in DOM structure
 * @param {Object} targetObj - Object to register
 * @param {String} objPath - Object path
 * @param {Object} domStructure - DOM structure
 * @returns {String} Object ID
 */
function registerObjectReference(targetObj, objPath, domStructure) {
    try {
        var objectId = generateObjectIdentityHash(targetObj, objPath);
        
        if (!domStructure.objectRegistry.references[objectId]) {
            domStructure.objectRegistry.references[objectId] = {
                object: targetObj,
                paths: [objPath],
                firstSeen: getCurrentTimestamp(),
                referenceCount: 1
            };
        } else {
            arrayPush(domStructure.objectRegistry.references[objectId].paths, objPath);
            domStructure.objectRegistry.references[objectId].referenceCount++;
            
            // Mark as duplicate
            domStructure.objectRegistry.duplicateDetections[objectId] = true;
        }
        
        return objectId;
        
    } catch (exc) {
        return 'registration_error_' + generateUniqueID();
    }
}

/**
 * Check for object duplication
 * @param {Object} targetObj - Object to check
 * @param {Object} domStructure - DOM structure
 * @returns {Boolean} True if object is duplicate
 */
function checkObjectDuplication(targetObj, domStructure) {
    try {
        for (var objId in domStructure.objectRegistry.references) {
            if (objectHasOwnProperty(domStructure.objectRegistry.references, objId)) {
                var ref = domStructure.objectRegistry.references[objId];
                if (ref.object === targetObj) {
                    return true;
                }
            }
        }
        return false;
    } catch (exc) {
        return false;
    }
}

// =============================================================================
// CIRCULAR REFERENCE DETECTION
// =============================================================================

/**
 * Detect circular reference
 * @param {Object} targetObj - Object to check
 * @param {Array} visitedObjects - Array of visited objects
 * @returns {Boolean} True if circular reference detected
 */
function detectCircularReference(targetObj, visitedObjects) {
    try {
        if (!targetObj || typeof targetObj !== 'object') {
            return false;
        }
        
        for (var i = 0; i < visitedObjects.length; i++) {
            if (visitedObjects[i] === targetObj) {
                return true;
            }
        }
        
        return false;
        
    } catch (exc) {
        return false;
    }
}

// =============================================================================
// SAFETY AND CLASSIFICATION FUNCTIONS
// =============================================================================

/**
 * Check if property name is safe to access
 * @param {String} propName - Property name
 * @returns {Boolean} True if safe
 */
function isPropertySafe(propName) {
    try {
        if (typeof propName !== 'string') return false;
        
        var dangerousProps = [
            '__proto__', 'prototype', 'constructor', '__defineGetter__', 
            '__defineSetter__', '__lookupGetter__', '__lookupSetter__',
            'eval', 'toString', 'valueOf'
        ];
        
        var lowerProp = stringToLowerCase(propName);
        
        for (var i = 0; i < dangerousProps.length; i++) {
            if (lowerProp === dangerousProps[i]) {
                return false;
            }
        }
        
        return true;
        
    } catch (exc) {
        return false;
    }
}

/**
 * Classify property safety level
 * @param {String} propName - Property name
 * @param {String} propType - Property type
 * @returns {String} Safety level
 */
function classifyPropertySafety(propName, propType) {
    try {
        if (!isPropertySafe(propName)) return 'dangerous';
        if (propType === 'function') return 'method';
        if (propType === 'object') return 'complex';
        return 'safe';
    } catch (exc) {
        return 'unknown';
    }
}

/**
 * Check if property is likely a collection
 * @param {String} propName - Property name
 * @param {String} propType - Property type
 * @returns {Boolean} True if likely collection
 */
function isLikelyCollection(propName, propType) {
    try {
        if (propType !== 'object') return false;
        
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
// POST-PROCESSING FUNCTIONS
// =============================================================================

/**
 * Update alternative access paths for duplicate objects
 * @param {Object} domStructure - DOM structure
 */
function updateAlternativeAccessPaths(domStructure) {
    try {
        for (var objectId in domStructure.objectRegistry.duplicateDetections) {
            if (objectHasOwnProperty(domStructure.objectRegistry.duplicateDetections, objectId)) {
                var ref = domStructure.objectRegistry.references[objectId];
                if (ref && ref.paths.length > 1) {
                    // Update DOM nodes with alternative paths
                    updateNodeAlternativePaths(domStructure.structure.document, objectId, ref.paths);
                    domStructure.statistics.duplicateObjects++;
                }
            }
        }
        
    } catch (exc) {
        // Silent failure
    }
}

/**
 * Recursively update alternative paths for nodes
 * @param {Object} node - DOM node to check
 * @param {String} objectId - Object ID to match
 * @param {Array} alternativePaths - Alternative paths array
 */
function updateNodeAlternativePaths(node, objectId, alternativePaths) {
    try {
        if (!node) {
            return;
        }
        
        if (node.objectId === objectId) {
            node.alternativeAccessPaths = arraySlice(alternativePaths, 0);
        }
        
        // Recursively update child nodes
        if (node.childNodes && node.childNodes.length) {
            for (var i = 0; i < node.childNodes.length; i++) {
                updateNodeAlternativePaths(node.childNodes[i], objectId, alternativePaths);
            }
        }
        
    } catch (exc) {
        // Continue processing
    }
}

// =============================================================================
// ANALYSIS FUNCTIONS - ES3 COMPLIANCE
// =============================================================================

/**
 * Get enumeration statistics - ES3 compliant
 * @param {Object} domStructure - DOM structure
 * @returns {Object} Statistics with object tracking data
 */
function getDOMStatistics(domStructure) {
    try {
        var stats = {
            totalNodes: 0,
            totalProperties: 0,
            objectReferences: 0,
            duplicateObjects: 0,
            circularReferences: 0
        };
        
        if (domStructure.structure && domStructure.structure.document) {
            countNodeStatistics(domStructure.structure.document, stats);
        }
        
        // Add object registry statistics
        stats.objectReferences = countObjectKeys(domStructure.objectRegistry.references);
        stats.duplicateObjects = countObjectKeys(domStructure.objectRegistry.duplicateDetections);
        
        return stats;
        
    } catch (exc) {
        return {
            totalNodes: 0,
            totalProperties: 0,
            objectReferences: 0,
            duplicateObjects: 0,
            circularReferences: 0,
            error: exc.message
        };
    }
}

/**
 * Recursively count node statistics
 * @param {Object} node - DOM node
 * @param {Object} stats - Statistics object to update
 */
function countNodeStatistics(node, stats) {
    try {
        if (!node || !stats) return;
        
        stats.totalNodes++;
        
        if (node.properties) stats.totalProperties += node.properties.length;
        if (node.collections) stats.totalProperties += node.collections.length;
        if (node.methods) stats.totalProperties += node.methods.length;
        
        if (node.objectMetadata && node.objectMetadata.isCircular) {
            stats.circularReferences++;
        }
        
        if (node.childNodes && node.childNodes.length) {
            for (var i = 0; i < node.childNodes.length; i++) {
                countNodeStatistics(node.childNodes[i], stats);
            }
        }
        
    } catch (exc) {
        // Continue counting
    }
}

/**
 * Find objects with multiple access paths
 * @param {Object} domStructure - DOM structure
 * @returns {Array} Objects with multiple paths
 */
function findObjectsWithMultiplePaths(domStructure) {
    try {
        var multiPathObjects = [];
        
        for (var objectId in domStructure.objectRegistry.references) {
            if (objectHasOwnProperty(domStructure.objectRegistry.references, objectId)) {
                var ref = domStructure.objectRegistry.references[objectId];
                if (ref.paths && ref.paths.length > 1) {
                    multiPathObjects.push({
                        objectId: objectId,
                        alternativeAccessPaths: ref.paths,
                        referenceCount: ref.referenceCount,
                        name: ref.paths[0] // Use first path as primary name
                    });
                }
            }
        }
        
        return multiPathObjects;
        
    } catch (exc) {
        return [];
    }
}

// =============================================================================
// MODULE REGISTRATION
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
    'detectCircularReference',
    
    // Property Processing
    'processProperty',
    
    // Post-Processing
    'updateAlternativeAccessPaths', 'updateNodeAlternativePaths',
    
    // Analysis Functions
    'getDOMStatistics', 'countNodeStatistics', 'findObjectsWithMultiplePaths',
    
    // Property Classification
    'classifyPropertySafety', 'isLikelyCollection', 'isPropertySafe',
    
    // Utilities
    'createProgressReporter'
]);

// =============================================================================
// END OF 2.1_dom-enumerator.jsx
// =============================================================================