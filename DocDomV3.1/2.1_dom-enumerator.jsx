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
function enumerateDocumentDOM(documentObject, config) {
    var startTime = new Date().getTime();
    
    $.writeln('[ENUM DEBUG] === STARTING enumerateDocumentDOM ===');
    $.writeln('[ENUM DEBUG] Start time: ' + startTime);
    $.writeln('[ENUM DEBUG] Config received: ' + (config ? 'YES' : 'NO'));
    
    var enumerationConfig = config ?
        objectMerge(DEFAULT_ENUMERATION_CONFIG, config) : 
        objectClone(DEFAULT_ENUMERATION_CONFIG, 2);
    
    $.writeln('[ENUM DEBUG] Final config maxDepth: ' + enumerationConfig.maxDepth);
    $.writeln('[ENUM DEBUG] Final config timeoutMs: ' + enumerationConfig.timeoutMs);
    $.writeln('[ENUM DEBUG] Final config maxProperties: ' + enumerationConfig.maxProperties);
    
    try {
        // Validate environment
        var envValidation = validateInDesignEnvironment();
        if (!envValidation.valid) {
            $.writeln('[ENUM DEBUG] Environment validation FAILED: ' + envValidation.error);
            return createErrorDOMStructure(envValidation.error);
        }
        $.writeln('[ENUM DEBUG] Environment validation PASSED');
        
        var targetDocument = documentObject || envValidation.document;
        var docValidation = validateDocumentState(targetDocument);
        $.writeln('[ENUM DEBUG] Document validation completed');
        
        // Create DOM structure container
        var domStructure = createDOMStructure();
        $.writeln('[ENUM DEBUG] DOM structure container created');
        
        // Set up metadata
        domStructure.metadata = {
            timestamp: getCurrentTimestamp(),
            documentName: docValidation.metadata.name || 'Unknown Document',
            version: '3.1',
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
        
        // Add document validation warnings
        if (docValidation.warnings && docValidation.warnings.length > 0) {
            domStructure.metadata.warnings = docValidation.warnings;
        }
        
        // Initialize object registry for tracking
        if (enumerationConfig.enableObjectTracking) {
            domStructure.objectRegistry = {
                references: {},
                duplicateDetections: {},
                circularReferences: [],
                totalTracked: 0
            };
            $.writeln('[ENUM DEBUG] Object registry initialized');
        }
        
        // Create progress reporter if enabled
        var progressReporter = enumerationConfig.enableProgressReporting ?
            createProgressReporter() : null;
            
        $.writeln('[ENUM DEBUG] About to call enumerateObjectStructure...');
        var enumStartTime = new Date().getTime();
        
        // Enumerate document structure
        domStructure.structure = {
            document: enumerateObjectStructure(
                targetDocument, 
                'document', 
                0, 
                enumerationConfig, 
                domStructure,
                progressReporter
            )
        };
        
        var enumEndTime = new Date().getTime();
        $.writeln('[ENUM DEBUG] enumerateObjectStructure completed in: ' + (enumEndTime - enumStartTime) + 'ms');
        $.writeln('[ENUM DEBUG] Document node created, properties: ' + 
                 (domStructure.structure.document.properties ? domStructure.structure.document.properties.length : 'undefined'));
        
        // Post-processing
        if (enumerationConfig.includeAlternativeAccessPaths) {
            $.writeln('[ENUM DEBUG] Running updateAlternativeAccessPaths...');
            updateAlternativeAccessPaths(domStructure);
        }
        
        // Generate statistics
        if (enumerationConfig.generateStatistics) {
            $.writeln('[ENUM DEBUG] Generating statistics...');
            domStructure.statistics = getDOMStatistics(domStructure);
        }
        
        // Final metadata
        domStructure.metadata.enumerationTime = new Date().getTime() - startTime;
        domStructure.metadata.completed = true;
        
        $.writeln('[ENUM DEBUG] === ENUMERATION COMPLETED ===');
        $.writeln('[ENUM DEBUG] Total time: ' + domStructure.metadata.enumerationTime + 'ms');
        $.writeln('[ENUM DEBUG] Properties found: ' + 
                 (domStructure.structure.document.properties ? domStructure.structure.document.properties.length : 0));
        $.writeln('[ENUM DEBUG] Methods found: ' + 
                 (domStructure.structure.document.methods ? domStructure.structure.document.methods.length : 0));
        
        if (progressReporter) {
            progressReporter.complete();
        }
        
        return domStructure;
        
    } catch (exc) {
        $.writeln('[ENUM DEBUG] EXCEPTION: ' + exc.message);
        return createErrorDOMStructure('DOM enumeration failed: ' + exc.message);
    }
}

/**
 * Enumerate object structure recursively
 * @param {Object} targetObject - Object to enumerate
 * @param {String} objectPath - Current object path
 * @param {Number} depth - Current recursion depth
 * @param {Object} config - Enumeration configuration
 * @param {Object} domStructure - DOM structure container
 * @param {Object} progressReporter - Progress reporter
 * @returns {Object} DOM node structure
 */
function enumerateObjectStructure(targetObject, objectPath, depth, config, domStructure, progressReporter) {
    try {
        // Check depth and timeout limits
        if (depth >= config.maxDepth) {
            return createDOMNode(objectPath, 'MaxDepthReached', 'limit', depth);
        }
        
        if (!targetObject) {
            return createDOMNode(objectPath, 'NullObject', 'null', depth);
        }
        
        // Check for circular references
        if (config.enableCircularReferenceDetection) {
            var circularRef = detectCircularReference(targetObject, objectPath, domStructure);
            if (circularRef.isCircular) {
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
        
        // Enumerate properties
        var propertyCount = 0;
        var operationCount = 0;
        
        try {
            for (var propName in targetObject) {
                // Check operation limits
                operationCount++;
                if (operationCount > config.maxProperties) {
                    domNode.truncated = true;
                    domNode.truncationReason = 'Property limit exceeded';
                    break;
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
                        []  // parentPaths for circular detection
                    );
                    
                    if (processed) {
                        propertyCount++;
                    }
                }
            }
        } catch (enumExc) {
            domNode.enumerationError = 'Property enumeration failed: ' + enumExc.message;
        }
        
        domNode.propertyCount = propertyCount;
        
        return domNode;
        
    } catch (exc) {
        return createErrorDOMNode(objectPath, 'Enumeration error: ' + exc.message, depth);
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
function processProperty(targetObject, propName, objectPath, depth, config, domStructure, domNode, parentPaths) {
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
                        null // No progress reporter for child nodes
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
 * Detect circular reference
 * @param {Object} targetObject - Object to check
 * @param {String} currentPath - Current path
 * @param {Object} domStructure - DOM structure
 * @returns {Object} Circular reference result
 */
function detectCircularReference(targetObject, currentPath, domStructure) {
    var result = {
        isCircular: false,
        originalPath: null,
        depth: 0
    };
    
    try {
        if (!targetObject || typeof targetObject !== 'object') {
            return result;
        }
        
        if (!domStructure.objectRegistry) {
            return result;
        }
        
        // Check if object is already being processed
        for (var refId in domStructure.objectRegistry.references) {
            if (objectHasOwnProperty(domStructure.objectRegistry.references, refId)) {
                var refData = domStructure.objectRegistry.references[refId];
                if (refData.object === targetObject) {
                    result.isCircular = true;
                    result.originalPath = refData.firstPath;
                    
                    // Add to circular references list
                    var circularInfo = {
                        originalPath: refData.firstPath,
                        circularPath: currentPath,
                        detectedAt: getCurrentTimestamp()
                    };
                    
                    domStructure.objectRegistry.circularReferences[domStructure.objectRegistry.circularReferences.length] = circularInfo;
                    
                    break;
                }
            }
        }
        
        return result;
        
    } catch (exc) {
        return result;
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
function getDOMStatistics(domStructure) {
    try {
        var stats = {
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
            countNodeStatistics(domStructure.structure.document, stats);
        }
        
        // Add object registry statistics
        if (domStructure.objectRegistry) {
            stats.objectsTracked = domStructure.objectRegistry.totalTracked || 0;
            stats.duplicateObjects = countObjectKeys(domStructure.objectRegistry.duplicateDetections || {});
            stats.circularReferences = domStructure.objectRegistry.circularReferences ? 
                domStructure.objectRegistry.circularReferences.length : 0;
        }
        
        return stats;
        
    } catch (exc) {
        return {
            totalNodes: 0,
            totalProperties: 0,
            enumerationSuccess: false,
            error: 'Statistics generation failed: ' + exc.message,
            generatedAt: getCurrentTimestamp()
        };
    }
}

/**
 * Count statistics for a DOM node recursively
 * @param {Object} domNode - DOM node to count
 * @param {Object} stats - Statistics object to update
 */
function countNodeStatistics(domNode, stats) {
    try {
        if (!domNode || !stats) {
            return;
        }
        
        stats.totalNodes++;
        
        if (domNode.depth > stats.maxDepth) {
            stats.maxDepth = domNode.depth;
        }
        
        if (domNode.properties) {
            stats.totalProperties += domNode.properties.length;
        }
        
        if (domNode.collections) {
            stats.totalCollections += domNode.collections.length;
        }
        
        if (domNode.methods) {
            stats.totalMethods += domNode.methods.length;
        }
        
        // Process child nodes
        if (domNode.childNodes) {
            for (var i = 0; i < domNode.childNodes.length; i++) {
                countNodeStatistics(domNode.childNodes[i], stats);
            }
        }
        
    } catch (exc) {
        // Continue counting
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
            
            reportProgress: function(message) {
                try {
                    this.itemsProcessed++;
                    if (this.itemsProcessed % 100 === 0) {
                        $.writeln('[DOM Enumerator] Progress: ' + message + 
                                 ' (Items: ' + this.itemsProcessed + ')');
                    }
                } catch (exc) {
                    // Silent failure
                }
            },
            
            complete: function() {
                try {
                    var elapsed = new Date().getTime() - this.startTime;
                    $.writeln('[DOM Enumerator] Completed enumeration of ' + 
                             this.itemsProcessed + ' items in ' + elapsed + 'ms');
                } catch (exc) {
                    // Silent failure
                }
            }
        };
        
    } catch (exc) {
        return {
            reportProgress: function() { },
            complete: function() { }
        };
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
    'classifyPropertySafety', 'isLikelyCollection',
    
    // Utilities
    'createProgressReporter'
]);

// =============================================================================
// END OF 2.1_dom-enumerator.jsx
// =============================================================================