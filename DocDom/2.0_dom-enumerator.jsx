//
// 2.0_dom-enumerator.jsx
// InDesign DOM Discovery Builder - Core DOM Structure Discovery
// CORE PURPOSE: Enumerate document DOM structure without accessing property values
// DEPENDENCIES: 1.0_safe-foundation.jsx
// SAFETY: Discovery only - never accesses property values, only types and existence
// ES3 COMPATIBLE: No reserved words, no modern JS features
//

// ============================================================================
// DOM STRUCTURE DATA TYPES
// ============================================================================

/**
 * Create empty DOM structure container
 * @returns {Object} - Empty DOMStructure object
 */
function createDOMStructure() {
    return {
        metadata: {
            timestamp: getCurrentTimestamp(),
            documentName: 'Unknown',
            enumerationTime: 0,
            version: '2.0_dom-enumerator',
            config: null
        },
        statistics: {
            totalNodes: 0,
            totalProperties: 0,
            maxDepthReached: 0,
            timeouts: 0,
            circularRefsDetected: 0,
            errors: []
        },
        structure: {
            document: null
        }
    };
}

/**
 * Create DOM node for enumerated object
 * @param {String} name - Object name
 * @param {String} path - Full dot path to object
 * @param {String} objType - Object type from typeof
 * @param {Number} depth - Nesting level
 * @returns {Object} - DOMNode object
 */
function createDOMNode(name, path, objType, depth) {
    return {
        name: name,
        path: path,
        type: objType,
        depth: depth,
        properties: [],
        collections: [],
        methods: [],
        childNodes: [],
        parentPath: '',
        hasCircularRefs: false,
        enumerationErrors: []
    };
}

/**
 * Create property classification
 * @param {String} propName - Property name
 * @param {String} propType - Property type from typeof
 * @param {String} objPath - Full path to containing object
 * @returns {Object} - PropertyClassification object
 */
function createPropertyClassification(propName, propType, objPath) {
    var classification = {
        name: propName,
        type: propType,
        safetyLevel: 'unknown',
        isCollection: false,
        isMethod: false,
        isReserved: false,
        path: objPath + '.' + propName,
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
// PROPERTY CLASSIFICATION LOGIC
// ============================================================================

/**
 * Classify property safety level based on name and type
 * @param {String} propName - Property name
 * @param {String} propType - Property type
 * @returns {String} - 'safe'|'moderate'|'risky'|'dangerous'
 */
function classifyPropertySafety(propName, propType) {
    // Dangerous: Functions and known dangerous properties
    if (propType === 'function') {
        return 'dangerous';
    }
    
    if (isDangerousProperty(propName)) {
        return 'dangerous';
    }
    
    // Safe: Basic value types
    if (propType === 'string' || propType === 'number' || propType === 'boolean') {
        return 'safe';
    }
    
    // Risky: Collections and complex objects
    if (isLikelyCollection(propName, propType)) {
        return 'risky';
    }
    
    // Moderate: Objects that aren't collections or dangerous
    if (propType === 'object') {
        return 'moderate';
    }
    
    // Unknown/undefined
    return 'risky';
}

/**
 * Detect if property is likely a collection
 * @param {String} propName - Property name
 * @param {String} propType - Property type
 * @returns {Boolean} - true if likely collection
 */
function isLikelyCollection(propName, propType) {
    if (propType !== 'object') {
        return false;
    }
    
    var collectionNames = [
        'pages', 'layers', 'stories', 'textFrames', 'rectangles',
        'ovals', 'polygons', 'graphicLines', 'groups', 'pageItems',
        'characters', 'words', 'lines', 'paragraphs', 'insertionPoints',
        'images', 'graphics', 'links', 'styles', 'fonts', 'colors',
        'swatches', 'spreads', 'masterSpreads', 'sections'
    ];
    
    var lowerName = propName.toLowerCase();
    
    for (var i = 0; i < collectionNames.length; i++) {
        if (lowerName === collectionNames[i].toLowerCase()) {
            return true;
        }
    }
    
    return false;
}

// ============================================================================
// CIRCULAR REFERENCE DETECTION
// ============================================================================

/**
 * Detect circular reference in object path
 * @param {String} objPath - Current object path
 * @param {Array} parentPaths - Array of parent paths
 * @returns {Boolean} - true if circular reference detected
 */
function detectCircularReference(objPath, parentPaths) {
    for (var i = 0; i < parentPaths.length; i++) {
        if (parentPaths[i] === objPath) {
            return true;
        }
    }
    return false;
}

// ============================================================================
// MAIN ENUMERATION FUNCTIONS
// ============================================================================

/**
 * Main entry point for DOM enumeration
 * @param {Object} doc - InDesign document object
 * @param {Object} config - Configuration object
 * @returns {Object} - Complete DOMStructure
 */
function enumerateDocumentDOM(doc, config) {
    var startTime = new Date().getTime();
    
    // Default configuration
    var enumerationConfig = {
        maxDepth: 2,
        timeoutMs: 5000,
        skipDangerous: true,
        maxProperties: 1000
    };
    
    // Merge user config
    if (config) {
        if (typeof config.maxDepth === 'number') enumerationConfig.maxDepth = config.maxDepth;
        if (typeof config.timeoutMs === 'number') enumerationConfig.timeoutMs = config.timeoutMs;
        if (typeof config.skipDangerous === 'boolean') enumerationConfig.skipDangerous = config.skipDangerous;
        if (typeof config.maxProperties === 'number') enumerationConfig.maxProperties = config.maxProperties;
    }
    
    // Create DOM structure container
    var domStructure = createDOMStructure();
    domStructure.metadata.config = enumerationConfig;
    
    // Get document name safely
    if (safeTypeCheck(doc, 'name') === 'string') {
        domStructure.metadata.documentName = doc.name;
    }
    
    // Create timeout checker
    var timeoutChecker = createTimeoutChecker(enumerationConfig.timeoutMs);
    var operationCounter = createOperationCounter(enumerationConfig.maxProperties);
    
    try {
        // Start enumeration from document object
        var documentNode = enumerateObjectStructure(
            doc, 
            'document', 
            'document', 
            0, 
            enumerationConfig, 
            domStructure,
            timeoutChecker,
            operationCounter,
            []
        );
        
        domStructure.structure.document = documentNode;
        
    } catch (exc) {
        domStructure.statistics.errors.push('Enumeration failed: ' + exc.message);
        $.writeln('ERROR: DOM enumeration failed: ' + exc.message);
    }
    
    // Calculate timing
    domStructure.metadata.enumerationTime = new Date().getTime() - startTime;
    
    $.writeln('DOM Enumeration Complete:');
    $.writeln('  Total Nodes: ' + domStructure.statistics.totalNodes);
    $.writeln('  Total Properties: ' + domStructure.statistics.totalProperties);
    $.writeln('  Max Depth: ' + domStructure.statistics.maxDepthReached);
    $.writeln('  Time: ' + domStructure.metadata.enumerationTime + 'ms');
    
    return domStructure;
}

/**
 * Recursively enumerate object properties and structure
 * @param {Object} obj - Object to enumerate
 * @param {String} objName - Name of object
 * @param {String} objPath - Full dot path to object
 * @param {Number} depth - Current depth level
 * @param {Object} config - Enumeration configuration
 * @param {Object} domStructure - DOM structure to populate
 * @param {Function} timeoutChecker - Timeout checking function
 * @param {Object} operationCounter - Operation counter
 * @param {Array} parentPaths - Array of parent paths for circular detection
 * @returns {Object} - DOMNode for this object
 */
function enumerateObjectStructure(obj, objName, objPath, depth, config, domStructure, timeoutChecker, operationCounter, parentPaths) {
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
    
    // Check for circular references
    if (detectCircularReference(objPath, parentPaths)) {
        domStructure.statistics.circularRefsDetected++;
        var circularNode = createDOMNode(objName, objPath, 'object', depth);
        circularNode.hasCircularRefs = true;
        return circularNode;
    }
    
    // Create node for this object
    var objType = safeTypeCheck(null, obj); // Get type of the object itself
    if (typeof obj === 'object' && obj !== null) {
        objType = 'object';
    }
    
    var domNode = createDOMNode(objName, objPath, objType, depth);
    domStructure.statistics.totalNodes++;
    
    // Track max depth
    if (depth > domStructure.statistics.maxDepthReached) {
        domStructure.statistics.maxDepthReached = depth;
    }
    
    // Only enumerate properties if this is an object
    if (typeof obj !== 'object' || obj === null) {
        return domNode;
    }
    
    // Create new parent path array to avoid mutation
    var newParentPaths = [];
    for (var i = 0; i < parentPaths.length; i++) {
        newParentPaths.push(parentPaths[i]);
    }
    newParentPaths.push(objPath);
    
    try {
        // Enumerate properties using for...in
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
            
            try {
                // Skip dangerous properties if configured
                if (config.skipDangerous && isDangerousProperty(propName)) {
                    continue;
                }
                
                // Skip reserved words
                if (isReservedWord(propName)) {
                    continue;
                }
                
                // Get property type safely (NEVER access value)
                var propType = safeTypeCheck(obj, propName);
                if (propType === 'error') {
                    continue;
                }
                
                // Create property classification
                var propClassification = createPropertyClassification(propName, propType, objPath);
                domStructure.statistics.totalProperties++;
                
                // Add to appropriate category
                if (propClassification.isMethod) {
                    domNode.methods.push(propClassification);
                } else if (propClassification.isCollection) {
                    domNode.collections.push(propClassification);
                } else {
                    domNode.properties.push(propClassification);
                }
                
                // Recurse into objects if depth allows and property is safe enough
                if (propType === 'object' && 
                    depth < config.maxDepth && 
                    propClassification.safetyLevel !== 'dangerous' &&
                    !isDangerousProperty(propName)) {
                    
                    try {
                        // NEVER access the property value - this would be obj[propName]
                        // We can only recurse if we can safely access the child object
                        // For now, we'll mark that child objects exist but not enumerate them
                        // This is the safest approach for initial discovery
                        
                        var childPath = objPath + '.' + propName;
                        var childInfo = createDOMNode(propName, childPath, propType, depth + 1);
                        childInfo.enumerationErrors.push('Child enumeration skipped for safety');
                        domNode.childNodes.push(childInfo);
                        
                    } catch (exc) {
                        domNode.enumerationErrors.push('Error accessing child object ' + propName + ': ' + exc.message);
                    }
                }
                
            } catch (exc) {
                domNode.enumerationErrors.push('Error enumerating property ' + propName + ': ' + exc.message);
                domStructure.statistics.errors.push('Property enumeration error at ' + objPath + '.' + propName + ': ' + exc.message);
            }
        }
        
    } catch (exc) {
        domNode.enumerationErrors.push('For-in enumeration failed: ' + exc.message);
        domStructure.statistics.errors.push('Object enumeration error at ' + objPath + ': ' + exc.message);
    }
    
    return domNode;
}

// ============================================================================
// ENUMERATION UTILITIES
// ============================================================================

/**
 * Get enumeration statistics from DOM structure
 * @param {Object} domStructure - DOM structure to analyze
 * @returns {Object} - Statistics summary
 */
function getDOMStatistics(domStructure) {
    if (!domStructure || !domStructure.statistics) {
        return {
            totalNodes: 0,
            totalProperties: 0,
            safeProperties: 0,
            collections: 0,
            methods: 0,
            errors: 0
        };
    }
    
    return {
        totalNodes: domStructure.statistics.totalNodes,
        totalProperties: domStructure.statistics.totalProperties,
        maxDepth: domStructure.statistics.maxDepthReached,
        timeouts: domStructure.statistics.timeouts,
        circularRefs: domStructure.statistics.circularRefsDetected,
        errors: domStructure.statistics.errors.length,
        enumerationTime: domStructure.metadata.enumerationTime
    };
}

/**
 * Count properties by safety level in DOM structure
 * @param {Object} domNode - DOM node to analyze
 * @returns {Object} - Count by safety level
 */
function countPropertiesBySafety(domNode) {
    var counts = {
        safe: 0,
        moderate: 0,
        risky: 0,
        dangerous: 0
    };
    
    if (!domNode) return counts;
    
    // Count properties in this node
    var allProps = [];
    if (domNode.properties) allProps = allProps.concat(domNode.properties);
    if (domNode.collections) allProps = allProps.concat(domNode.collections);
    if (domNode.methods) allProps = allProps.concat(domNode.methods);
    
    for (var i = 0; i < allProps.length; i++) {
        var prop = allProps[i];
        if (prop.safetyLevel && counts.hasOwnProperty(prop.safetyLevel)) {
            counts[prop.safetyLevel]++;
        }
    }
    
    // Recursively count child nodes
    if (domNode.childNodes) {
        for (var i = 0; i < domNode.childNodes.length; i++) {
            var childCounts = countPropertiesBySafety(domNode.childNodes[i]);
            counts.safe += childCounts.safe;
            counts.moderate += childCounts.moderate;
            counts.risky += childCounts.risky;
            counts.dangerous += childCounts.dangerous;
        }
    }
    
    return counts;
}

// ============================================================================
// MODULE INITIALIZATION
// ============================================================================

/**
 * Initialize DOM enumerator module
 * @returns {Boolean} - true if initialization successful
 */
function initializeDOMEnumerator() {
    try {
        // Check if safe foundation is available
        if (typeof safeTypeCheck !== 'function') {
            $.writeln('ERROR: Safe foundation module not loaded');
            return false;
        }
        
        // Test core functions exist
        var requiredFunctions = [
            'createDOMStructure', 'createDOMNode', 'enumerateDocumentDOM',
            'classifyPropertySafety', 'detectCircularReference'
        ];
        
        for (var i = 0; i < requiredFunctions.length; i++) {
            if (typeof eval(requiredFunctions[i]) !== 'function') {
                $.writeln('ERROR: Required function missing: ' + requiredFunctions[i]);
                return false;
            }
        }
        
        $.writeln('2.0_dom-enumerator.jsx: All functions initialized successfully');
        return true;
        
    } catch (exc) {
        $.writeln('ERROR: DOM enumerator initialization failed: ' + exc.message);
        return false;
    }
}

// Auto-initialize when module loads
initializeDOMEnumerator();