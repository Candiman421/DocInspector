// =============================================================================
// 2.0_dom-enumerator.jsx - DOM STRUCTURE DISCOVERY
// InDesign DOM Discovery Builder v2.1.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: Complete DOM structure discovery with object reference tracking
// DEPENDENCIES: ["1.0_safe-foundation.jsx"]
// SIZE: ~1000 lines
// =============================================================================

// =============================================================================
// DEPENDENCY VALIDATION
// =============================================================================

var DOM_ENUMERATOR_DEPENDENCIES = ['1.0_safe-foundation'];
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
    var enumerationConfig = config ? objectClone(config, 2) : objectClone(DEFAULT_ENUMERATION_CONFIG, 2);
    
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
                indesignVersion: envValidation.metadata ? envValidation.metadata.indesignVersion : 'unknown',
                hasNativeJSON: envValidation.metadata ? envValidation.metadata.hasNativeJSON : false
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
 * @param {Array} parentPaths - Array of parent paths for circular detection
 * @param {Array} parentObjectIds - Array of parent object IDs
 * @param {Object} progressReporter - Progress reporter (optional)
 * @returns {Object} DOMNode for this object
 */
function enumerateObjectStructure(targetObj, objName, objPath, depth, config, domStructure, timeoutChecker, operationCounter, parentPaths, parentObjectIds, progressReporter) {
    try {
        // Safety checks
        if (timeoutChecker && timeoutChecker()) {
            return createErrorDOMNode(objName, objPath, 'timeout', depth);
        }
        
        if (operationCounter && operationCounter.check()) {
            return createErrorDOMNode(objName, objPath, 'max_operations', depth);
        }
        
        if (depth >= config.maxDepth) {
            return createErrorDOMNode(objName, objPath, 'max_depth', depth);
        }
        
        if (isDangerousPath(objPath) && config.skipDangerous) {
            return createErrorDOMNode(objName, objPath, 'dangerous_path', depth);
        }
        
        // Progress reporting
        if (progressReporter && depth === 0) {
            progressReporter.updateProgress('Enumerating ' + objName + '...');
        }
        
        // Generate object ID and check for circular references
        var objectId = generateObjectReferenceID(targetObj);
        var circularCheck = detectCircularReference(objPath, parentPaths, objectId, parentObjectIds);
        
        // Create DOM node
        var domNode = createDOMNode(objName, objPath, typeof targetObj, depth, objectId);
        
        if (circularCheck.isCircular) {
            domNode.objectMetadata.isCircular = true;
            domNode.objectMetadata.circularType = circularCheck.circularType;
            domNode.objectMetadata.circularPath = circularCheck.circularPath;
            return domNode;
        }
        
        // Register object reference
        if (config.enableObjectTracking) {
            registerObjectReference(domStructure, objectId, objPath, typeof targetObj, {
                depth: depth,
                timestamp: getCurrentTimestamp()
            });
        }
        
        // Enumerate properties - Enhanced ES3 iteration
        var newParentPaths = arraySlice(parentPaths, 0);
        newParentPaths.push(objPath);
        var newParentObjectIds = arraySlice(parentObjectIds, 0);
        newParentObjectIds.push(objectId);
        
        for (var propName in targetObj) {
            // Enhanced ES3 property check
            if (!objectHasOwnProperty(targetObj, propName)) {
                continue;
            }
            
            if (operationCounter) {
                operationCounter.increment();
            }
            
            if (timeoutChecker && timeoutChecker()) {
                break;
            }
            
            if (!processProperty(
                targetObj,
                propName,
                objPath,
                depth,
                config,
                domStructure,
                domNode,
                timeoutChecker,
                operationCounter,
                newParentPaths,
                newParentObjectIds
            )) {
                // Continue even if individual property fails
                continue;
            }
        }
        
        return domNode;
        
    } catch (exc) {
        return createErrorDOMNode(objName, objPath, 'enumeration_error: ' + exc.message, depth);
    }
}

// =============================================================================
// DATA STRUCTURE CREATION
// =============================================================================

/**
 * Create DOM structure container with object tracking
 * @returns {Object} DOMStructure object
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
 * Create property classification with access path tracking
 * @param {String} propName - Property name
 * @param {String} propType - Property type
 * @param {String} objPath - Object path
 * @param {String} objectId - Object ID if property references an object
 * @returns {Object} PropertyClassification object
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
        alternativeAccessPaths: []
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
        return 'hash_error_' + generateUniqueID();
    }
}

/**
 * Register object reference in object registry
 * @param {Object} domStructure - DOM structure
 * @param {String} objectId - Object ID
 * @param {String} objectPath - Object path
 * @param {String} objectType - Object type
 * @param {Object} metadata - Additional metadata
 */
function registerObjectReference(domStructure, objectId, objectPath, objectType, metadata) {
    try {
        if (!domStructure.objectRegistry) {
            domStructure.objectRegistry = {
                references: {},
                accessPaths: {},
                duplicateDetections: {}
            };
        }
        
        // Register reference
        domStructure.objectRegistry.references[objectId] = {
            objectType: objectType,
            primaryPath: objectPath,
            metadata: metadata || {},
            registeredAt: getCurrentTimestamp()
        };
        
        // Track access path
        if (!domStructure.objectRegistry.accessPaths[objectId]) {
            domStructure.objectRegistry.accessPaths[objectId] = [];
        }
        domStructure.objectRegistry.accessPaths[objectId].push(objectPath);
        
        // Update statistics
        domStructure.statistics.objectReferences++;
        
    } catch (exc) {
        // Silent failure - don't break enumeration
    }
}

/**
 * Check if object is already registered
 * @param {Object} domStructure - DOM structure
 * @param {String} objectId - Object ID to check
 * @returns {Object} Duplicate check result
 */
function checkObjectDuplication(domStructure, objectId) {
    try {
        var isDuplicate = false;
        var originalPath = '';
        var accessPaths = [];
        
        if (domStructure.objectRegistry && 
            domStructure.objectRegistry.references && 
            domStructure.objectRegistry.references[objectId]) {
            
            isDuplicate = true;
            originalPath = domStructure.objectRegistry.references[objectId].primaryPath;
            accessPaths = domStructure.objectRegistry.accessPaths[objectId] || [];
        }
        
        return {
            isDuplicate: isDuplicate,
            originalPath: originalPath,
            accessPaths: accessPaths
        };
        
    } catch (exc) {
        return {
            isDuplicate: false,
            originalPath: '',
            accessPaths: []
        };
    }
}

// =============================================================================
// CIRCULAR REFERENCE DETECTION
// =============================================================================

/**
 * Enhanced circular reference detection
 * @param {String} objPath - Current object path
 * @param {Array} parentPaths - Array of parent paths
 * @param {String} objectId - Current object ID
 * @param {Array} parentObjectIds - Array of parent object IDs
 * @returns {Object} Circular reference detection result
 */
function detectCircularReference(objPath, parentPaths, objectId, parentObjectIds) {
    try {
        var result = {
            isCircular: false,
            circularType: '',
            circularPath: ''
        };
        
        // Check path-based circular reference using ES3-compatible search
        for (var i = 0; i < parentPaths.length; i++) {
            if (parentPaths[i] === objPath) {
                result.isCircular = true;
                result.circularType = 'path';
                result.circularPath = objPath;
                return result;
            }
        }
        
        // Check object ID-based circular reference using ES3-compatible search
        for (var j = 0; j < parentObjectIds.length; j++) {
            if (parentObjectIds[j] === objectId) {
                result.isCircular = true;
                result.circularType = 'object';
                result.circularPath = objPath;
                return result;
            }
        }
        
        return result;
        
    } catch (exc) {
        return {
            isCircular: true,
            circularType: 'error',
            circularPath: objPath
        };
    }
}

// =============================================================================
// PROPERTY PROCESSING
// =============================================================================

/**
 * Process property with object tracking
 * @param {Object} targetObj - Object containing property
 * @param {String} propName - Property name
 * @param {String} objPath - Object path
 * @param {Number} depth - Current depth
 * @param {Object} config - Configuration
 * @param {Object} domStructure - DOM structure
 * @param {Object} domNode - Current DOM node
 * @param {Function} timeoutChecker - Timeout checker
 * @param {Object} operationCounter - Operation counter
 * @param {Array} parentPaths - Parent paths
 * @param {Array} parentObjectIds - Parent object IDs
 * @returns {Boolean} True if processed successfully
 */
function processProperty(targetObj, propName, objPath, depth, config, domStructure, domNode, timeoutChecker, operationCounter, parentPaths, parentObjectIds) {
    try {
        // Skip dangerous properties if configured
        if (config.skipDangerous && isDangerousProperty(propName)) {
            return true;
        }
        
        // Skip ES3 reserved words
        if (isReservedWord(propName)) {
            return true;
        }
        
        // Get property type safely
        var propType = safeTypeCheck(targetObj, propName);
        if (propType === 'error') {
            return true;
        }
        
        // Create property classification
        var propClassification = createPropertyClassification(propName, propType, objPath, null);
        
        // Add to appropriate collection
        if (propClassification.isMethod) {
            domNode.methods.push(propClassification);
        } else if (propClassification.isCollection) {
            domNode.collections.push(propClassification);
        } else {
            domNode.properties.push(propClassification);
        }
        
        // If property is an object, recursively enumerate it
        if (propType === 'object' && depth < config.maxDepth - 1) {
            try {
                var childObject = targetObj[propName];
                if (childObject) {
                    var childPath = objPath + '.' + propName;
                    var childNode = enumerateObjectStructure(
                        childObject,
                        propName,
                        childPath,
                        depth + 1,
                        config,
                        domStructure,
                        timeoutChecker,
                        operationCounter,
                        parentPaths,
                        parentObjectIds
                    );
                    
                    if (childNode) {
                        domNode.childNodes.push(childNode);
                        propClassification.objectId = childNode.objectId;
                    }
                }
            } catch (exc) {
                // Continue processing even if child enumeration fails
            }
        }
        
        // Update statistics
        domStructure.statistics.totalProperties++;
        
        return true;
        
    } catch (exc) {
        return false;
    }
}

// =============================================================================
// POST-PROCESSING - ENHANCED ES3 COMPLIANCE
// =============================================================================

/**
 * Update alternative access paths for duplicate objects - ES3 Enhanced
 * @param {Object} domStructure - DOM structure to update
 */
function updateAlternativeAccessPaths(domStructure) {
    try {
        if (!domStructure.objectRegistry || !domStructure.objectRegistry.accessPaths) {
            return;
        }
        
        var accessPaths = domStructure.objectRegistry.accessPaths;
        
        // ES3-compatible iteration using enhanced helper
        for (var objectId in accessPaths) {
            if (objectHasOwnProperty(accessPaths, objectId)) {
                var paths = accessPaths[objectId];
                if (paths && paths.length > 1) {
                    // Find all nodes with this object ID and update their alternative paths
                    updateNodeAlternativePaths(domStructure.structure.document, objectId, paths);
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
// ANALYSIS FUNCTIONS - ENHANCED ES3 COMPLIANCE
// =============================================================================

/**
 * Get enumeration statistics - ES3 Enhanced
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
        
        // Add object registry statistics - ES3 compatible using enhanced helper
        if (domStructure.objectRegistry && domStructure.objectRegistry.references) {
            stats.objectReferences = countObjectKeys(domStructure.objectRegistry.references);
        }
        
        return stats;
        
    } catch (exc) {
        return {
            totalNodes: 0,
            totalProperties: 0,
            objectReferences: 0,
            duplicateObjects: 0,
            circularReferences: 0
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
        if (!node) {
            return;
        }
        
        stats.totalNodes++;
        
        if (node.properties) {
            stats.totalProperties += node.properties.length;
        }
        if (node.collections) {
            stats.totalProperties += node.collections.length;
        }
        if (node.methods) {
            stats.totalProperties += node.methods.length;
        }
        
        if (node.objectMetadata && node.objectMetadata.isCircular) {
            stats.circularReferences++;
        }
        
        // Recursively count child nodes
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
 * Find objects with multiple access paths - ES3 Enhanced
 * @param {Object} domStructure - DOM structure
 * @returns {Array} Array of objects with multiple paths
 */
function findObjectsWithMultiplePaths(domStructure) {
    try {
        var multiplePathObjects = [];
        
        if (!domStructure.objectRegistry || !domStructure.objectRegistry.accessPaths) {
            return multiplePathObjects;
        }
        
        var accessPaths = domStructure.objectRegistry.accessPaths;
        
        // ES3-compatible iteration using enhanced helper
        for (var objectId in accessPaths) {
            if (objectHasOwnProperty(accessPaths, objectId)) {
                var paths = accessPaths[objectId];
                if (paths && paths.length > 1) {
                    multiplePathObjects.push({
                        objectId: objectId,
                        pathCount: paths.length,
                        paths: arraySlice(paths, 0)
                    });
                }
            }
        }
        
        return multiplePathObjects;
        
    } catch (exc) {
        return [];
    }
}

// =============================================================================
// PROPERTY CLASSIFICATION UTILITIES
// =============================================================================

/**
 * Classify property safety level
 * @param {String} propName - Property name
 * @param {String} propType - Property type
 * @returns {String} Safety level: 'safe'|'moderate'|'risky'|'dangerous'
 */
function classifyPropertySafety(propName, propType) {
    try {
        if (isDangerousProperty(propName)) {
            return 'dangerous';
        }
        
        if (propType === 'function') {
            return 'risky';
        }
        
        if (propType === 'object') {
            return 'moderate';
        }
        
        return 'safe';
        
    } catch (exc) {
        return 'dangerous';
    }
}

/**
 * Detect if property is likely a collection
 * @param {String} propName - Property name
 * @param {String} propType - Property type
 * @returns {Boolean} True if likely a collection
 */
function isLikelyCollection(propName, propType) {
    try {
        if (propType !== 'object') {
            return false;
        }
        
        var collectionIndicators = [
            'items', 'pages', 'layers', 'stories', 'textFrames',
            'rectangles', 'ovals', 'groups', 'spreads',
            'masterspread', 'characters', 'words', 'lines',
            'paragraphs', 'tables', 'rows', 'cells', 'columns'
        ];
        
        var lowerPropName = propName.toLowerCase();
        
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
// MODULE REGISTRATION
// =============================================================================

// Register this module with all its functions
registerModule('2.0_dom-enumerator', '2.1.1', [
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
    'classifyPropertySafety', 'isLikelyCollection',
    
    // Utilities
    'createProgressReporter'
]);

// =============================================================================
// END OF 2.0_dom-enumerator.jsx
//
// ENHANCEMENTS IMPLEMENTED:
// - Added comprehensive dependency validation
// - Enhanced ES3 compliance with improved helper usage
// - Added module registration system integration
// - Improved error handling with proper error boundaries
// - Enhanced object iteration using objectHasOwnProperty() throughout
// - Added config object cloning to prevent mutations
// - Improved memory management and cleanup
// - All original functionality preserved and enhanced for production reliability
// =============================================================================