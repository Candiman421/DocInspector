//
// 2.0_dom-enumerator.jsx (Enhanced)
// InDesign DOM Discovery Builder - Enhanced DOM Structure Discovery
// CORE PURPOSE: Deep enumerate document DOM structure with object reference tracking
// DEPENDENCIES: 1.0_safe-foundation.jsx
// SAFETY: Discovery only - never accesses property values, enhanced circular reference handling
// ES3 COMPATIBLE: No reserved words, no modern JS features
// ENHANCED: Deeper traversal, object identity tracking, comprehensive path mapping
//

// ============================================================================
// ENHANCED DOM STRUCTURE DATA TYPES
// ============================================================================

/**
 * Create enhanced DOM structure container with object tracking
 * @returns {Object} - Enhanced DOMStructure object
 */
function createEnhancedDOMStructure() {
    return {
        metadata: {
            timestamp: getCurrentTimestamp(),
            documentName: 'Unknown',
            enumerationTime: 0,
            version: '2.0_dom-enumerator-enhanced',
            config: null,
            enhancedFeatures: {
                objectReferenceTracking: true,
                deeperTraversal: true,
                comprehensivePathMapping: true,
                enhancedCircularDetection: true
            }
        },
        statistics: {
            totalNodes: 0,
            totalProperties: 0,
            maxDepthReached: 0,
            timeouts: 0,
            circularRefsDetected: 0,
            objectReferencesTracked: 0,
            duplicateObjectsFound: 0,
            totalAccessPaths: 0,
            errors: []
        },
        structure: {
            document: null
        },
        objectRegistry: {
            // Maps object identity hashes to reference info
            references: {},
            accessPaths: {},
            duplicateDetections: []
        }
    };
}

/**
 * Create enhanced DOM node with object reference tracking
 * @param {String} name - Object name
 * @param {String} path - Full dot path to object
 * @param {String} objType - Object type from typeof
 * @param {Number} depth - Nesting level
 * @param {String} objectId - Unique object identifier
 * @returns {Object} - Enhanced DOMNode object
 */
function createEnhancedDOMNode(name, path, objType, depth, objectId) {
    return {
        name: name,
        path: path,
        type: objType,
        depth: depth,
        objectId: objectId || null,
        properties: [],
        collections: [],
        methods: [],
        childNodes: [],
        parentPath: '',
        hasCircularRefs: false,
        alternativeAccessPaths: [],
        objectMetadata: {
            isFirstOccurrence: true,
            totalAccessPaths: 1,
            referenceCount: 0
        },
        enumerationErrors: []
    };
}

/**
 * Create enhanced property classification with access path tracking
 * @param {String} propName - Property name
 * @param {String} propType - Property type from typeof
 * @param {String} objPath - Full path to containing object
 * @param {String} objectId - Object identifier if this property references an object
 * @returns {Object} - Enhanced PropertyClassification object
 */
function createEnhancedPropertyClassification(propName, propType, objPath, objectId) {
    var classification = {
        name: propName,
        type: propType,
        safetyLevel: 'unknown',
        isCollection: false,
        isMethod: false,
        isReserved: false,
        path: objPath + '.' + propName,
        objectId: objectId || null,
        isObjectReference: !!objectId,
        alternativeAccessPaths: [],
        alternatives: []
    };
    
    // Classify safety level
    classification.safetyLevel = classifyPropertySafety(propName, propType);
    
    // Detect collections
    classification.isCollection = isLikelyCollection(propName, propType);
    
    // Detect methods
    classification.isMethod = (propType === 'function');
    
    // Check reserved words
    classification.isReserved = isReservedWord(propName);
    
    return classification;
}

// ============================================================================
// ENHANCED OBJECT REFERENCE TRACKING
// ============================================================================

/**
 * Generate object identity hash for reference tracking
 * @param {Object} obj - Object to generate hash for
 * @param {String} objPath - Object path for fallback identification
 * @returns {String} - Object identity hash
 */
function generateObjectIdentityHash(obj, objPath) {
    try {
        if (!obj || typeof obj !== 'object') {
            return null;
        }
        
        // Try to get object string representation for identity
        var objString = '';
        try {
            objString = String(obj);
        } catch (exc) {
            objString = 'UnstringableObject';
        }
        
        // Create hash from object characteristics
        var characteristics = [];
        characteristics.push(typeof obj);
        characteristics.push(objString.length);
        characteristics.push(objPath);
        
        // Add some property names for identity (safely)
        var propCount = 0;
        try {
            for (var prop in obj) {
                if (propCount < 3) {  // Only use first 3 properties
                    characteristics.push(prop);
                    propCount++;
                } else {
                    break;
                }
            }
        } catch (exc) {
            // Can't enumerate properties, use path-based ID
        }
        
        // Simple hash generation (ES3 compatible)
        var hash = 'obj_';
        var hashInput = characteristics.join('|');
        var hashValue = 0;
        
        for (var i = 0; i < hashInput.length; i++) {
            var charVal = hashInput.charCodeAt(i);
            hashValue = ((hashValue << 5) - hashValue) + charVal;
            hashValue = hashValue & hashValue; // Convert to 32-bit integer
        }
        
        hash += Math.abs(hashValue).toString(36);
        return hash;
        
    } catch (exc) {
        // Fallback to path-based ID
        return 'path_' + objPath.replace(/[^a-zA-Z0-9]/g, '_');
    }
}

/**
 * Register object reference in object registry
 * @param {Object} domStructure - DOM structure to update
 * @param {String} objectId - Object identifier
 * @param {String} objectPath - Current access path
 * @param {String} objectType - Object type
 * @param {Object} metadata - Additional metadata
 */
function registerObjectReference(domStructure, objectId, objectPath, objectType, metadata) {
    try {
        if (!objectId) return;
        
        var registry = domStructure.objectRegistry;
        
        if (!registry.references[objectId]) {
            // First occurrence of this object
            registry.references[objectId] = {
                objectId: objectId,
                type: objectType,
                firstPath: objectPath,
                occurrenceCount: 1,
                accessPaths: [objectPath],
                metadata: metadata || {}
            };
            domStructure.statistics.objectReferencesTracked++;
        } else {
            // Duplicate object found
            registry.references[objectId].occurrenceCount++;
            registry.references[objectId].accessPaths.push(objectPath);
            domStructure.statistics.duplicateObjectsFound++;
            
            // Track as duplicate detection
            registry.duplicateDetections.push({
                objectId: objectId,
                originalPath: registry.references[objectId].firstPath,
                duplicatePath: objectPath,
                type: objectType
            });
        }
        
        domStructure.statistics.totalAccessPaths++;
        
    } catch (exc) {
        domStructure.statistics.errors.push('Object registration failed for ' + objectId + ': ' + exc.message);
    }
}

/**
 * Check if object is already registered (duplicate detection)
 * @param {Object} domStructure - DOM structure to check
 * @param {String} objectId - Object identifier to check
 * @returns {Object} - {isDuplicate: boolean, originalPath: string, accessPaths: array}
 */
function checkObjectDuplication(domStructure, objectId) {
    var result = {
        isDuplicate: false,
        originalPath: '',
        accessPaths: []
    };
    
    try {
        if (objectId && domStructure.objectRegistry.references[objectId]) {
            var ref = domStructure.objectRegistry.references[objectId];
            result.isDuplicate = ref.occurrenceCount > 1;
            result.originalPath = ref.firstPath;
            result.accessPaths = ref.accessPaths.slice(); // Copy array
        }
    } catch (exc) {
        // Ignore errors in duplicate checking
    }
    
    return result;
}

// ============================================================================
// ENHANCED CIRCULAR REFERENCE DETECTION
// ============================================================================

/**
 * Enhanced circular reference detection with path and object tracking
 * @param {String} objPath - Current object path
 * @param {Array} parentPaths - Array of parent paths
 * @param {String} objectId - Object identifier for enhanced detection
 * @param {Array} parentObjectIds - Array of parent object IDs
 * @returns {Object} - {isCircular: boolean, circularType: string, circularPath: string}
 */
function detectEnhancedCircularReference(objPath, parentPaths, objectId, parentObjectIds) {
    var result = {
        isCircular: false,
        circularType: 'none',
        circularPath: ''
    };
    
    try {
        // Path-based circular detection (original method)
        for (var i = 0; i < parentPaths.length; i++) {
            if (parentPaths[i] === objPath) {
                result.isCircular = true;
                result.circularType = 'path';
                result.circularPath = parentPaths[i];
                return result;
            }
        }
        
        // Object ID-based circular detection (enhanced method)
        if (objectId && parentObjectIds) {
            for (var i = 0; i < parentObjectIds.length; i++) {
                if (parentObjectIds[i] === objectId) {
                    result.isCircular = true;
                    result.circularType = 'object';
                    result.circularPath = objPath;
                    return result;
                }
            }
        }
        
    } catch (exc) {
        // Error in circular detection - assume not circular
    }
    
    return result;
}

// ============================================================================
// ENHANCED ENUMERATION CONFIGURATION
// ============================================================================

var ENHANCED_DEFAULT_CONFIG = {
    maxDepth: 4,                    // Increased from 2 to 4
    timeoutMs: 15000,              // Increased timeout for deeper analysis
    skipDangerous: true,
    maxProperties: 5000,           // Increased property limit
    enableObjectTracking: true,     // Enable object reference tracking
    enableDuplicateDetection: true, // Enable duplicate object detection
    maxDuplicatesPerObject: 10,    // Limit duplicate tracking per object
    enableDeepPropertyAnalysis: true, // Analyze properties more thoroughly
    pathCompressionThreshold: 50   // Compress paths longer than this
};

// ============================================================================
// MAIN ENHANCED ENUMERATION FUNCTIONS
// ============================================================================

/**
 * Enhanced main entry point for DOM enumeration with object tracking
 * @param {Object} doc - InDesign document object
 * @param {Object} config - Configuration object
 * @returns {Object} - Complete Enhanced DOMStructure
 */
function enumerateDocumentDOMEnhanced(doc, config) {
    var startTime = new Date().getTime();
    
    // Merge with enhanced defaults
    var enumerationConfig = mergeEnhancedConfig(ENHANCED_DEFAULT_CONFIG, config);
    
    // Create enhanced DOM structure container
    var domStructure = createEnhancedDOMStructure();
    domStructure.metadata.config = enumerationConfig;
    
    // Get document name safely
    if (safeTypeCheck(doc, 'name') === 'string') {
        domStructure.metadata.documentName = doc.name;
    }
    
    // Create timeout checker and operation counter
    var timeoutChecker = createTimeoutChecker(enumerationConfig.timeoutMs);
    var operationCounter = createOperationCounter(enumerationConfig.maxProperties);
    
    try {
        $.writeln('Starting Enhanced DOM Enumeration:');
        $.writeln('  Max Depth: ' + enumerationConfig.maxDepth);
        $.writeln('  Object Tracking: ' + enumerationConfig.enableObjectTracking);
        $.writeln('  Duplicate Detection: ' + enumerationConfig.enableDuplicateDetection);
        
        // Start enhanced enumeration from document object
        var documentNode = enumerateObjectStructureEnhanced(
            doc, 
            'document', 
            'document', 
            0, 
            enumerationConfig, 
            domStructure,
            timeoutChecker,
            operationCounter,
            [],  // parentPaths
            []   // parentObjectIds
        );
        
        domStructure.structure.document = documentNode;
        
        // Post-processing: Update alternative access paths
        if (enumerationConfig.enableDuplicateDetection) {
            updateAlternativeAccessPaths(domStructure);
        }
        
    } catch (exc) {
        domStructure.statistics.errors.push('Enhanced enumeration failed: ' + exc.message);
        $.writeln('ERROR: Enhanced DOM enumeration failed: ' + exc.message);
    }
    
    // Calculate timing and final statistics
    domStructure.metadata.enumerationTime = new Date().getTime() - startTime;
    
    $.writeln('Enhanced DOM Enumeration Complete:');
    $.writeln('  Total Nodes: ' + domStructure.statistics.totalNodes);
    $.writeln('  Total Properties: ' + domStructure.statistics.totalProperties);
    $.writeln('  Max Depth: ' + domStructure.statistics.maxDepthReached);
    $.writeln('  Object References: ' + domStructure.statistics.objectReferencesTracked);
    $.writeln('  Duplicate Objects: ' + domStructure.statistics.duplicateObjectsFound);
    $.writeln('  Total Access Paths: ' + domStructure.statistics.totalAccessPaths);
    $.writeln('  Time: ' + domStructure.metadata.enumerationTime + 'ms');
    
    return domStructure;
}

/**
 * Enhanced recursive object enumeration with object tracking
 * @param {Object} obj - Object to enumerate
 * @param {String} objName - Name of object
 * @param {String} objPath - Full dot path to object
 * @param {Number} depth - Current depth level
 * @param {Object} config - Enumeration configuration
 * @param {Object} domStructure - DOM structure to populate
 * @param {Function} timeoutChecker - Timeout checking function
 * @param {Object} operationCounter - Operation counter
 * @param {Array} parentPaths - Array of parent paths for circular detection
 * @param {Array} parentObjectIds - Array of parent object IDs for enhanced circular detection
 * @returns {Object} - Enhanced DOMNode for this object
 */
function enumerateObjectStructureEnhanced(obj, objName, objPath, depth, config, domStructure, timeoutChecker, operationCounter, parentPaths, parentObjectIds) {
    // Check limits and timeouts
    if (timeoutChecker()) {
        domStructure.statistics.timeouts++;
        return null;
    }
    
    if (operationCounter.check()) {
        domStructure.statistics.errors.push('Property limit exceeded at: ' + objPath);
        return null;
    }
    
    if (depth > config.maxDepth) {
        return null;
    }
    
    // Generate object identity for tracking
    var objectId = null;
    if (config.enableObjectTracking && typeof obj === 'object' && obj !== null) {
        objectId = generateObjectIdentityHash(obj, objPath);
    }
    
    // Enhanced circular reference detection
    var circularCheck = detectEnhancedCircularReference(objPath, parentPaths, objectId, parentObjectIds);
    if (circularCheck.isCircular) {
        domStructure.statistics.circularRefsDetected++;
        var circularNode = createEnhancedDOMNode(objName, objPath, 'object', depth, objectId);
        circularNode.hasCircularRefs = true;
        circularNode.enumerationErrors.push('Circular reference detected (' + circularCheck.circularType + '): ' + circularCheck.circularPath);
        return circularNode;
    }
    
    // Register object reference if tracking enabled
    if (config.enableObjectTracking && objectId) {
        registerObjectReference(domStructure, objectId, objPath, typeof obj, {
            depth: depth,
            name: objName
        });
    }
    
    // Create enhanced node for this object
    var objType = typeof obj;
    var domNode = createEnhancedDOMNode(objName, objPath, objType, depth, objectId);
    domStructure.statistics.totalNodes++;
    
    // Check for duplicate objects and update metadata
    if (config.enableDuplicateDetection && objectId) {
        var duplicateCheck = checkObjectDuplication(domStructure, objectId);
        if (duplicateCheck.isDuplicate) {
            domNode.objectMetadata.isFirstOccurrence = false;
            domNode.objectMetadata.totalAccessPaths = duplicateCheck.accessPaths.length;
            domNode.alternativeAccessPaths = duplicateCheck.accessPaths.filter(function(path) {
                return path !== objPath;
            });
        }
    }
    
    // Track max depth
    if (depth > domStructure.statistics.maxDepthReached) {
        domStructure.statistics.maxDepthReached = depth;
    }
    
    // Only enumerate properties if this is an object
    if (typeof obj !== 'object' || obj === null) {
        return domNode;
    }
    
    // Create new parent arrays to avoid mutation
    var newParentPaths = parentPaths.slice();
    newParentPaths.push(objPath);
    
    var newParentObjectIds = parentObjectIds.slice();
    if (objectId) {
        newParentObjectIds.push(objectId);
    }
    
    try {
        // Enhanced property enumeration
        var propertyCount = 0;
        for (var propName in obj) {
            // Check timeouts and limits frequently
            if (timeoutChecker()) {
                domStructure.statistics.timeouts++;
                break;
            }
            
            if (operationCounter.check()) {
                break;
            }
            
            operationCounter.increment();
            propertyCount++;
            
            try {
                // Enhanced property processing
                if (!processEnhancedProperty(
                    obj, propName, objPath, depth, config, domStructure, 
                    domNode, timeoutChecker, operationCounter, 
                    newParentPaths, newParentObjectIds
                )) {
                    continue;
                }
                
            } catch (exc) {
                domNode.enumerationErrors.push('Error enumerating property ' + propName + ': ' + exc.message);
                domStructure.statistics.errors.push('Property enumeration error at ' + objPath + '.' + propName + ': ' + exc.message);
            }
        }
        
        // Log property count for debugging
        if (config.enableDeepPropertyAnalysis && propertyCount > 50) {
            domNode.enumerationErrors.push('Large object detected: ' + propertyCount + ' properties');
        }
        
    } catch (exc) {
        domNode.enumerationErrors.push('For-in enumeration failed: ' + exc.message);
        domStructure.statistics.errors.push('Object enumeration error at ' + objPath + ': ' + exc.message);
    }
    
    return domNode;
}

/**
 * Enhanced property processing with object tracking
 * @param {Object} obj - Source object
 * @param {String} propName - Property name
 * @param {String} objPath - Object path
 * @param {Number} depth - Current depth
 * @param {Object} config - Configuration
 * @param {Object} domStructure - DOM structure
 * @param {Object} domNode - Current DOM node
 * @param {Function} timeoutChecker - Timeout checker
 * @param {Object} operationCounter - Operation counter
 * @param {Array} parentPaths - Parent paths array
 * @param {Array} parentObjectIds - Parent object IDs array
 * @returns {Boolean} - true if property was processed successfully
 */
function processEnhancedProperty(obj, propName, objPath, depth, config, domStructure, domNode, timeoutChecker, operationCounter, parentPaths, parentObjectIds) {
    try {
        // Skip dangerous properties if configured
        if (config.skipDangerous && isDangerousProperty(propName)) {
            return false;
        }
        
        // Skip reserved words
        if (isReservedWord(propName)) {
            return false;
        }
        
        // Get property type safely (NEVER access value during discovery)
        var propType = safeTypeCheck(obj, propName);
        if (propType === 'error') {
            return false;
        }
        
        // Generate object ID for object properties if tracking enabled
        var propObjectId = null;
        if (config.enableObjectTracking && propType === 'object') {
            // We can't access the property value to generate an ID during discovery
            // This will be handled later during collection sampling or deep mapping
            propObjectId = null;
        }
        
        // Create enhanced property classification
        var propClassification = createEnhancedPropertyClassification(propName, propType, objPath, propObjectId);
        domStructure.statistics.totalProperties++;
        
        // Add to appropriate category
        if (propClassification.isMethod) {
            domNode.methods.push(propClassification);
        } else if (propClassification.isCollection) {
            domNode.collections.push(propClassification);
        } else {
            domNode.properties.push(propClassification);
        }
        
        // Enhanced child object handling for deeper traversal
        if (propType === 'object' && 
            depth < config.maxDepth && 
            propClassification.safetyLevel !== 'dangerous' &&
            !isDangerousProperty(propName)) {
            
            try {
                // For discovery phase, we mark child objects but don't access them
                // This maintains safety while providing structure information
                var childPath = objPath + '.' + propName;
                var childInfo = createEnhancedDOMNode(propName, childPath, propType, depth + 1, null);
                childInfo.enumerationErrors.push('Child object discovered - access deferred for safety');
                childInfo.objectMetadata.isFirstOccurrence = false; // Mark as deferred
                domNode.childNodes.push(childInfo);
                
            } catch (exc) {
                domNode.enumerationErrors.push('Error creating child node info for ' + propName + ': ' + exc.message);
            }
        }
        
        return true;
        
    } catch (exc) {
        return false;
    }
}

// ============================================================================
// POST-PROCESSING UTILITIES
// ============================================================================

/**
 * Update alternative access paths for duplicate objects
 * @param {Object} domStructure - DOM structure to update
 */
function updateAlternativeAccessPaths(domStructure) {
    try {
        var registry = domStructure.objectRegistry;
        
        // Update nodes with alternative access paths
        updateNodeAlternativePaths(domStructure.structure.document, registry);
        
        $.writeln('Updated alternative access paths for ' + Object.keys(registry.references).length + ' tracked objects');
        
    } catch (exc) {
        domStructure.statistics.errors.push('Failed to update alternative access paths: ' + exc.message);
    }
}

/**
 * Recursively update nodes with alternative access paths
 * @param {Object} domNode - DOM node to update
 * @param {Object} registry - Object registry
 */
function updateNodeAlternativePaths(domNode, registry) {
    if (!domNode) return;
    
    try {
        // Update this node if it has an object ID
        if (domNode.objectId && registry.references[domNode.objectId]) {
            var ref = registry.references[domNode.objectId];
            domNode.alternativeAccessPaths = ref.accessPaths.filter(function(path) {
                return path !== domNode.path;
            });
            domNode.objectMetadata.totalAccessPaths = ref.accessPaths.length;
            domNode.objectMetadata.referenceCount = ref.occurrenceCount;
        }
        
        // Update properties
        updatePropertyListAlternativePaths(domNode.properties, registry);
        updatePropertyListAlternativePaths(domNode.collections, registry);
        updatePropertyListAlternativePaths(domNode.methods, registry);
        
        // Recursively update child nodes
        if (domNode.childNodes) {
            for (var i = 0; i < domNode.childNodes.length; i++) {
                updateNodeAlternativePaths(domNode.childNodes[i], registry);
            }
        }
        
    } catch (exc) {
        // Continue processing other nodes if one fails
    }
}

/**
 * Update alternative paths for property lists
 * @param {Array} propertyList - List of properties to update
 * @param {Object} registry - Object registry
 */
function updatePropertyListAlternativePaths(propertyList, registry) {
    if (!propertyList) return;
    
    try {
        for (var i = 0; i < propertyList.length; i++) {
            var prop = propertyList[i];
            if (prop.objectId && registry.references[prop.objectId]) {
                var ref = registry.references[prop.objectId];
                prop.alternativeAccessPaths = ref.accessPaths.filter(function(path) {
                    return path !== prop.path;
                });
            }
        }
    } catch (exc) {
        // Continue processing
    }
}

// ============================================================================
// ENHANCED UTILITY FUNCTIONS
// ============================================================================

/**
 * Merge enhanced configuration with defaults
 * @param {Object} defaults - Default configuration
 * @param {Object} userConfig - User configuration
 * @returns {Object} - Merged configuration
 */
function mergeEnhancedConfig(defaults, userConfig) {
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

/**
 * Get enhanced enumeration statistics from DOM structure
 * @param {Object} domStructure - Enhanced DOM structure to analyze
 * @returns {Object} - Enhanced statistics summary
 */
function getEnhancedDOMStatistics(domStructure) {
    if (!domStructure || !domStructure.statistics) {
        return {
            totalNodes: 0,
            totalProperties: 0,
            objectReferencesTracked: 0,
            duplicateObjectsFound: 0,
            totalAccessPaths: 0,
            errors: 0
        };
    }
    
    return {
        totalNodes: domStructure.statistics.totalNodes,
        totalProperties: domStructure.statistics.totalProperties,
        maxDepth: domStructure.statistics.maxDepthReached,
        timeouts: domStructure.statistics.timeouts,
        circularRefs: domStructure.statistics.circularRefsDetected,
        objectReferencesTracked: domStructure.statistics.objectReferencesTracked,
        duplicateObjectsFound: domStructure.statistics.duplicateObjectsFound,
        totalAccessPaths: domStructure.statistics.totalAccessPaths,
        errors: domStructure.statistics.errors.length,
        enumerationTime: domStructure.metadata.enumerationTime,
        enhancedFeatures: domStructure.metadata.enhancedFeatures
    };
}

/**
 * Find all objects with multiple access paths
 * @param {Object} domStructure - Enhanced DOM structure
 * @returns {Array} - Array of objects with multiple access paths
 */
function findObjectsWithMultiplePaths(domStructure) {
    var multiplePathObjects = [];
    
    try {
        if (domStructure.objectRegistry && domStructure.objectRegistry.references) {
            var refs = domStructure.objectRegistry.references;
            for (var objectId in refs) {
                var ref = refs[objectId];
                if (ref.accessPaths.length > 1) {
                    multiplePathObjects.push(ref);
                }
            }
        }
    } catch (exc) {
        $.writeln('Error finding objects with multiple paths: ' + exc.message);
    }
    
    return multiplePathObjects;
}

// ============================================================================
// BACKWARD COMPATIBILITY
// ============================================================================

/**
 * Maintain backward compatibility with original enumeration function
 * @param {Object} doc - InDesign document object
 * @param {Object} config - Configuration object
 * @returns {Object} - DOMStructure (calls enhanced version)
 */
function enumerateDocumentDOM(doc, config) {
    return enumerateDocumentDOMEnhanced(doc, config);
}

// ============================================================================
// MODULE INITIALIZATION
// ============================================================================

/**
 * Initialize enhanced DOM enumerator module
 * @returns {Boolean} - true if initialization successful
 */
function initializeEnhancedDOMEnumerator() {
    try {
        // Check if safe foundation is available
        if (typeof safeTypeCheck !== 'function') {
            $.writeln('ERROR: Safe foundation module not loaded');
            return false;
        }
        
        // Test core functions exist
        var requiredFunctions = [
            'createEnhancedDOMStructure', 'createEnhancedDOMNode', 'enumerateDocumentDOMEnhanced',
            'generateObjectIdentityHash', 'detectEnhancedCircularReference'
        ];
        
        for (var i = 0; i < requiredFunctions.length; i++) {
            if (typeof eval(requiredFunctions[i]) !== 'function') {
                $.writeln('ERROR: Required function missing: ' + requiredFunctions[i]);
                return false;
            }
        }
        
        $.writeln('2.0_dom-enumerator.jsx: Enhanced version initialized successfully');
        $.writeln('Enhanced features: deeper traversal, object tracking, duplicate detection');
        return true;
        
    } catch (exc) {
        $.writeln('ERROR: Enhanced DOM enumerator initialization failed: ' + exc.message);
        return false;
    }
}

// Auto-initialize when module loads
initializeEnhancedDOMEnumerator();