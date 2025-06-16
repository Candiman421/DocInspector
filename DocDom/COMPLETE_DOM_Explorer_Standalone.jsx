//
// COMPLETE_DOM_Explorer_Standalone.jsx
// InDesign DOM Discovery Builder v2.0 - COMPLETE STANDALONE VERSION
// 
// 🎯 SIMPLE USAGE: Just run this ONE file in ExtendScript!
// 
// WHAT IT DOES:
// ✅ Discovers InDesign document DOM structure safely
// ✅ Samples collection contents to map what's inside
// ✅ Generates actionable property access code
// ✅ Provides both GUI and demo functions
// ✅ Exports results to files
//
// 🚀 NO SETUP REQUIRED - JUST RUN AND CLICK!
//

// ============================================================================
// QUICK START INSTRUCTIONS
// ============================================================================

/*

🎯 HOW TO USE THIS FILE:

1. 📄 Open an InDesign document (any document)
2. 🏃 Run this script in ExtendScript
3. 📱 Choose GUI or Demo when prompted

🚀 INSTANT OPTIONS:
• GUI: Click "Enumerate DOM" → "Sample Collections" → "Export"
• Demo: Run quickDemo() in console for instant results

*/

// ============================================================================
// 1.0 SAFE FOUNDATION - Ultra-safe property access
// ============================================================================

function safeTypeCheck(obj, propName) {
    try {
        if (!obj) return 'undefined';
        if (typeof obj !== 'object') return 'undefined';
        return typeof obj[propName];
    } catch (exc) {
        return 'error';
    }
}

function safeHasProperty(obj, propName) {
    try {
        if (!obj) return false;
        if (typeof obj !== 'object') return false;
        return propName in obj;
    } catch (exc) {
        return false;
    }
}

function safeGetLength(collection) {
    try {
        if (!collection) return -1;
        if (typeof collection !== 'object') return -1;
        
        if (safeTypeCheck(collection, 'length') === 'number') {
            return collection.length;
        }
        if (safeTypeCheck(collection, 'count') === 'number') {
            return collection.count;
        }
        if (safeTypeCheck(collection, 'size') === 'number') {
            return collection.size;
        }
        return -1;
    } catch (exc) {
        return -1;
    }
}

function isReservedWord(propName) {
    var reservedWords = [
        'break', 'case', 'catch', 'continue', 'default', 'delete', 'do', 
        'else', 'finally', 'for', 'function', 'if', 'in', 'instanceof', 
        'new', 'return', 'switch', 'this', 'throw', 'try', 'typeof', 
        'var', 'void', 'while', 'with', 'class', 'const', 'enum', 
        'export', 'extends', 'import', 'super'
    ];
    
    for (var i = 0; i < reservedWords.length; i++) {
        if (propName === reservedWords[i]) {
            return true;
        }
    }
    return false;
}

function isDangerousProperty(propName) {
    var dangerousPatterns = [
        'parent', 'item', 'selection', 'app', 'activeDocument', 
        'activeWindow', 'activeLayer', 'activeStory', 'activeSpread'
    ];
    
    for (var i = 0; i < dangerousPatterns.length; i++) {
        if (propName.toLowerCase() === dangerousPatterns[i].toLowerCase()) {
            return true;
        }
    }
    
    for (var i = 0; i < dangerousPatterns.length; i++) {
        var pattern = dangerousPatterns[i].toLowerCase();
        if (propName.toLowerCase().indexOf(pattern) !== -1) {
            return true;
        }
    }
    
    return false;
}

function createTimeoutChecker(maxMs) {
    var startTime = new Date().getTime();
    var timeoutMs = maxMs || 5000;
    
    return function() {
        return (new Date().getTime() - startTime) > timeoutMs;
    };
}

function createStringBuilder() {
    var parts = [];
    
    return {
        append: function(text) {
            parts.push(String(text));
        },
        appendLine: function(text) {
            parts.push(String(text) + '\n');
        },
        toString: function() {
            return parts.join('');
        },
        clear: function() {
            parts = [];
        },
        getLength: function() {
            return parts.length;
        }
    };
}

function getCurrentTimestamp() {
    var now = new Date();
    return now.getFullYear() + '-' + 
           ('0' + (now.getMonth() + 1)).slice(-2) + '-' +
           ('0' + now.getDate()).slice(-2) + ' ' +
           ('0' + now.getHours()).slice(-2) + ':' +
           ('0' + now.getMinutes()).slice(-2) + ':' +
           ('0' + now.getSeconds()).slice(-2);
}

function validateInDesignEnvironment() {
    var result = {
        valid: false,
        error: '',
        document: null
    };
    
    try {
        if (typeof app === 'undefined') {
            result.error = 'Not running in InDesign application';
            return result;
        }
        
        if (!safeHasProperty(app, 'documents')) {
            result.error = 'Cannot access documents collection';
            return result;
        }
        
        var docCount = safeGetLength(app.documents);
        if (docCount <= 0) {
            result.error = 'No document is currently open';
            return result;
        }
        
        if (!safeHasProperty(app, 'activeDocument')) {
            result.error = 'Cannot access active document';
            return result;
        }
        
        var doc = app.activeDocument;
        if (!doc) {
            result.error = 'Active document is null';
            return result;
        }
        
        result.valid = true;
        result.document = doc;
        return result;
        
    } catch (exc) {
        result.error = 'Environment validation failed: ' + exc.message;
        return result;
    }
}

// ============================================================================
// 2.0 DOM ENUMERATOR - Core structure discovery
// ============================================================================

function createDOMStructure() {
    return {
        metadata: {
            timestamp: getCurrentTimestamp(),
            documentName: 'Unknown',
            enumerationTime: 0,
            version: '2.0_complete_standalone',
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
    
    classification.safetyLevel = classifyPropertySafety(propName, propType);
    classification.isCollection = isLikelyCollection(propName, propType);
    classification.isMethod = (propType === 'function');
    classification.isReserved = isReservedWord(propName);
    
    return classification;
}

function classifyPropertySafety(propName, propType) {
    if (propType === 'function') {
        return 'dangerous';
    }
    
    if (isDangerousProperty(propName)) {
        return 'dangerous';
    }
    
    if (propType === 'string' || propType === 'number' || propType === 'boolean') {
        return 'safe';
    }
    
    if (isLikelyCollection(propName, propType)) {
        return 'risky';
    }
    
    if (propType === 'object') {
        return 'moderate';
    }
    
    return 'risky';
}

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

function detectCircularReference(objPath, parentPaths) {
    for (var i = 0; i < parentPaths.length; i++) {
        if (parentPaths[i] === objPath) {
            return true;
        }
    }
    return false;
}

function enumerateDocumentDOM(doc, config) {
    var startTime = new Date().getTime();
    
    var enumerationConfig = {
        maxDepth: 2,
        timeoutMs: 5000,
        skipDangerous: true,
        maxProperties: 1000
    };
    
    if (config) {
        if (typeof config.maxDepth === 'number') enumerationConfig.maxDepth = config.maxDepth;
        if (typeof config.timeoutMs === 'number') enumerationConfig.timeoutMs = config.timeoutMs;
        if (typeof config.skipDangerous === 'boolean') enumerationConfig.skipDangerous = config.skipDangerous;
        if (typeof config.maxProperties === 'number') enumerationConfig.maxProperties = config.maxProperties;
    }
    
    var domStructure = createDOMStructure();
    domStructure.metadata.config = enumerationConfig;
    
    if (safeTypeCheck(doc, 'name') === 'string') {
        domStructure.metadata.documentName = doc.name;
    }
    
    var timeoutChecker = createTimeoutChecker(enumerationConfig.timeoutMs);
    var operationCounter = createOperationCounter(enumerationConfig.maxProperties);
    
    try {
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
    }
    
    domStructure.metadata.enumerationTime = new Date().getTime() - startTime;
    
    return domStructure;
}

function createOperationCounter(maxOps) {
    var count = 0;
    var limit = maxOps || 1000;
    
    return {
        check: function() {
            return count >= limit;
        },
        increment: function() {
            count++;
        },
        getCount: function() {
            return count;
        }
    };
}

function enumerateObjectStructure(obj, objName, objPath, depth, config, domStructure, timeoutChecker, operationCounter, parentPaths) {
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
    
    if (detectCircularReference(objPath, parentPaths)) {
        domStructure.statistics.circularRefsDetected++;
        var circularNode = createDOMNode(objName, objPath, 'object', depth);
        circularNode.hasCircularRefs = true;
        return circularNode;
    }
    
    var objType = 'object';
    if (typeof obj !== 'object' || obj === null) {
        objType = typeof obj;
    }
    
    var domNode = createDOMNode(objName, objPath, objType, depth);
    domStructure.statistics.totalNodes++;
    
    if (depth > domStructure.statistics.maxDepthReached) {
        domStructure.statistics.maxDepthReached = depth;
    }
    
    if (typeof obj !== 'object' || obj === null) {
        return domNode;
    }
    
    var newParentPaths = [];
    for (var i = 0; i < parentPaths.length; i++) {
        newParentPaths.push(parentPaths[i]);
    }
    newParentPaths.push(objPath);
    
    try {
        for (var propName in obj) {
            if (timeoutChecker()) {
                domStructure.statistics.timeouts++;
                break;
            }
            
            if (operationCounter.check()) {
                break;
            }
            
            operationCounter.increment();
            
            try {
                if (config.skipDangerous && isDangerousProperty(propName)) {
                    continue;
                }
                
                if (isReservedWord(propName)) {
                    continue;
                }
                
                var propType = safeTypeCheck(obj, propName);
                if (propType === 'error') {
                    continue;
                }
                
                var propClassification = createPropertyClassification(propName, propType, objPath);
                domStructure.statistics.totalProperties++;
                
                if (propClassification.isMethod) {
                    domNode.methods.push(propClassification);
                } else if (propClassification.isCollection) {
                    domNode.collections.push(propClassification);
                } else {
                    domNode.properties.push(propClassification);
                }
                
                if (propType === 'object' && 
                    depth < config.maxDepth && 
                    propClassification.safetyLevel !== 'dangerous' &&
                    !isDangerousProperty(propName)) {
                    
                    try {
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

// ============================================================================
// 6.0 COLLECTION SAMPLER - Sample collection contents safely
// ============================================================================

function sampleCollectionContents(domStructure, sourceDocument, samplingConfig) {
    if (!domStructure || !sourceDocument) {
        return domStructure;
    }
    
    var config = {
        maxSamplesPerCollection: 3,
        timeoutPerCollection: 2000,
        timeoutPerItem: 500,
        maxCollectionSize: 1000,
        samplingDepth: 2,
        skipEmptyCollections: true,
        safetyFilter: 'moderate',
        enableProgressLogging: false
    };
    
    if (samplingConfig) {
        for (var key in samplingConfig) {
            config[key] = samplingConfig[key];
        }
    }
    
    var startTime = new Date().getTime();
    var samplingStats = {
        collectionsFound: 0,
        collectionsSkipped: 0,
        collectionsSampled: 0,
        totalItemsSampled: 0,
        totalPropertiesDiscovered: 0,
        timeouts: 0,
        errors: 0,
        samplingTime: 0
    };
    
    try {
        var discoveredCollections = findAllCollections(domStructure);
        samplingStats.collectionsFound = discoveredCollections.length;
        
        for (var i = 0; i < discoveredCollections.length; i++) {
            var collection = discoveredCollections[i];
            
            if (!meetsCollectionSafetyCriteria(collection, config)) {
                samplingStats.collectionsSkipped++;
                continue;
            }
            
            var collectionSamplingResult = sampleSingleCollection(
                collection, 
                sourceDocument, 
                config, 
                samplingStats
            );
            
            if (collectionSamplingResult.success) {
                samplingStats.collectionsSampled++;
                samplingStats.totalItemsSampled += collectionSamplingResult.itemsSampled;
                samplingStats.totalPropertiesDiscovered += collectionSamplingResult.propertiesDiscovered;
                
                enhanceCollectionWithSamplingData(collection, collectionSamplingResult.samplingData);
            } else {
                samplingStats.errors++;
            }
        }
        
        samplingStats.samplingTime = new Date().getTime() - startTime;
        
        if (!domStructure.metadata.collectionSampling) {
            domStructure.metadata.collectionSampling = {};
        }
        
        domStructure.metadata.collectionSampling = {
            timestamp: getCurrentTimestamp(),
            config: config,
            stats: samplingStats
        };
        
    } catch (exc) {
        samplingStats.errors++;
        if (!domStructure.metadata.collectionSampling) {
            domStructure.metadata.collectionSampling = {};
        }
        domStructure.metadata.collectionSampling.error = exc.message;
    }
    
    return domStructure;
}

function findAllCollections(domStructure) {
    var collections = [];
    
    try {
        if (domStructure.structure && domStructure.structure.document) {
            findCollectionsInNode(domStructure.structure.document, collections);
        }
    } catch (exc) {
        // Ignore collection finding errors
    }
    
    return collections;
}

function findCollectionsInNode(domNode, collections) {
    if (!domNode) return;
    
    try {
        if (domNode.collections) {
            for (var i = 0; i < domNode.collections.length; i++) {
                collections.push(domNode.collections[i]);
            }
        }
        
        if (domNode.childNodes) {
            for (var i = 0; i < domNode.childNodes.length; i++) {
                findCollectionsInNode(domNode.childNodes[i], collections);
            }
        }
    } catch (exc) {
        // Ignore node search errors
    }
}

function meetsCollectionSafetyCriteria(collection, config) {
    try {
        var safetyLevels = {
            'safe': 1,
            'moderate': 2,
            'risky': 3,
            'dangerous': 4
        };
        
        var collectionSafetyLevel = safetyLevels[collection.safetyLevel] || 4;
        var requiredSafetyLevel = safetyLevels[config.safetyFilter] || 2;
        
        if (collectionSafetyLevel > requiredSafetyLevel) {
            return false;
        }
        
        if (isDangerousProperty(collection.name)) {
            return false;
        }
        
        return true;
        
    } catch (exc) {
        return false;
    }
}

function sampleSingleCollection(collection, sourceDocument, config, samplingStats) {
    var result = {
        success: false,
        itemsSampled: 0,
        propertiesDiscovered: 0,
        samplingData: null,
        error: ''
    };
    
    var timeoutChecker = createTimeoutChecker(config.timeoutPerCollection);
    
    try {
        var collectionObject = safeGetObjectFromPath(sourceDocument, collection.path, config.timeoutPerCollection);
        
        if (!collectionObject.success) {
            result.error = 'Could not access collection: ' + collectionObject.error;
            return result;
        }
        
        var actualCollection = collectionObject.value;
        var collectionLength = safeGetLength(actualCollection);
        
        if (collectionLength < 0) {
            result.error = 'Could not determine collection length';
            return result;
        }
        
        if (collectionLength === 0 && config.skipEmptyCollections) {
            result.error = 'Empty collection skipped by configuration';
            return result;
        }
        
        if (collectionLength > config.maxCollectionSize) {
            result.error = 'Collection too large (' + collectionLength + ' items, max ' + config.maxCollectionSize + ')';
            return result;
        }
        
        var samplingData = {
            collectionLength: collectionLength,
            sampledItems: [],
            commonProperties: [],
            accessPatterns: []
        };
        
        var itemsToSample = Math.min(collectionLength, config.maxSamplesPerCollection);
        
        for (var itemIndex = 0; itemIndex < itemsToSample; itemIndex++) {
            if (timeoutChecker()) {
                samplingStats.timeouts++;
                result.error = 'Timeout during collection sampling';
                break;
            }
            
            try {
                var itemSamplingResult = sampleCollectionItem(
                    actualCollection, 
                    itemIndex, 
                    collection.path + '[' + itemIndex + ']',
                    config
                );
                
                if (itemSamplingResult.success) {
                    samplingData.sampledItems.push(itemSamplingResult.itemData);
                    result.itemsSampled++;
                    result.propertiesDiscovered += itemSamplingResult.propertiesFound;
                }
                
            } catch (itemExc) {
                // Continue with other items
            }
        }
        
        if (samplingData.sampledItems.length > 0) {
            analyzeCommonPatterns(samplingData);
        }
        
        result.success = true;
        result.samplingData = samplingData;
        
    } catch (exc) {
        result.error = 'Collection sampling exception: ' + exc.message;
        samplingStats.errors++;
    }
    
    return result;
}

function safeGetObjectFromPath(rootObject, dotPath, timeoutMs) {
    var result = {
        success: false,
        value: null,
        error: ''
    };
    
    var timeoutChecker = createTimeoutChecker(timeoutMs || 1000);
    
    try {
        var pathParts = dotPath.split('.');
        var currentObject = rootObject;
        
        for (var i = 1; i < pathParts.length; i++) {
            if (timeoutChecker()) {
                result.error = 'Timeout accessing path: ' + dotPath;
                return result;
            }
            
            var part = pathParts[i];
            
            if (!currentObject) {
                result.error = 'Null object at path segment: ' + part;
                return result;
            }
            
            if (!safeHasProperty(currentObject, part)) {
                result.error = 'Property does not exist: ' + part;
                return result;
            }
            
            try {
                currentObject = currentObject[part];
            } catch (accessExc) {
                result.error = 'Access failed at path segment ' + part + ': ' + accessExc.message;
                return result;
            }
        }
        
        result.success = true;
        result.value = currentObject;
        
    } catch (exc) {
        result.error = 'Path access exception: ' + exc.message;
    }
    
    return result;
}

function sampleCollectionItem(collection, itemIndex, itemPath, config) {
    var result = {
        success: false,
        itemData: null,
        propertiesFound: 0,
        error: ''
    };
    
    var timeoutChecker = createTimeoutChecker(config.timeoutPerItem);
    
    try {
        var item = null;
        try {
            item = collection[itemIndex];
        } catch (accessExc) {
            result.error = 'Could not access item at index ' + itemIndex + ': ' + accessExc.message;
            return result;
        }
        
        if (!item) {
            result.error = 'Item at index ' + itemIndex + ' is null or undefined';
            return result;
        }
        
        var itemData = {
            index: itemIndex,
            path: itemPath,
            type: typeof item,
            properties: [],
            collections: [],
            methods: []
        };
        
        try {
            for (var propName in item) {
                if (timeoutChecker()) {
                    break;
                }
                
                try {
                    if (isDangerousProperty(propName) || isReservedWord(propName)) {
                        continue;
                    }
                    
                    var propType = safeTypeCheck(item, propName);
                    if (propType === 'error') {
                        continue;
                    }
                    
                    var propClassification = createPropertyClassification(propName, propType, itemPath);
                    result.propertiesFound++;
                    
                    if (propClassification.isMethod) {
                        itemData.methods.push(propClassification);
                    } else if (propClassification.isCollection) {
                        itemData.collections.push(propClassification);
                    } else {
                        itemData.properties.push(propClassification);
                    }
                    
                } catch (propExc) {
                    continue;
                }
            }
            
        } catch (enumExc) {
            result.error = 'Property enumeration failed: ' + enumExc.message;
            return result;
        }
        
        result.success = true;
        result.itemData = itemData;
        
    } catch (exc) {
        result.error = 'Item sampling exception: ' + exc.message;
    }
    
    return result;
}

function analyzeCommonPatterns(samplingData) {
    try {
        if (!samplingData.sampledItems || samplingData.sampledItems.length === 0) {
            return;
        }
        
        var firstItem = samplingData.sampledItems[0];
        var allProperties = [];
        
        if (firstItem.properties) allProperties = allProperties.concat(firstItem.properties);
        if (firstItem.collections) allProperties = allProperties.concat(firstItem.collections);
        
        for (var i = 0; i < allProperties.length; i++) {
            var prop = allProperties[i];
            var existsInAll = true;
            
            for (var j = 1; j < samplingData.sampledItems.length; j++) {
                var otherItem = samplingData.sampledItems[j];
                var foundInOther = false;
                
                if (otherItem.properties) {
                    for (var k = 0; k < otherItem.properties.length; k++) {
                        if (otherItem.properties[k].name === prop.name) {
                            foundInOther = true;
                            break;
                        }
                    }
                }
                
                if (!foundInOther && otherItem.collections) {
                    for (var k = 0; k < otherItem.collections.length; k++) {
                        if (otherItem.collections[k].name === prop.name) {
                            foundInOther = true;
                            break;
                        }
                    }
                }
                
                if (!foundInOther) {
                    existsInAll = false;
                    break;
                }
            }
            
            if (existsInAll) {
                samplingData.commonProperties.push(prop);
            }
        }
        
        var basePath = samplingData.sampledItems[0].path.replace(/\[\d+\]$/, '');
        for (var i = 0; i < samplingData.commonProperties.length; i++) {
            var commonProp = samplingData.commonProperties[i];
            samplingData.accessPatterns.push({
                pattern: basePath + '[index].' + commonProp.name,
                type: commonProp.type,
                safetyLevel: commonProp.safetyLevel,
                description: 'Access ' + commonProp.name + ' property of collection items'
            });
        }
        
    } catch (exc) {
        // Ignore pattern analysis errors
    }
}

function enhanceCollectionWithSamplingData(collection, samplingData) {
    try {
        collection.samplingData = samplingData;
        collection.hasSamplingData = true;
        collection.collectionLength = samplingData.collectionLength;
        
        if (samplingData.commonProperties.length > 0) {
            collection.commonItemProperties = samplingData.commonProperties;
        }
        
        if (samplingData.accessPatterns.length > 0) {
            collection.accessPatterns = samplingData.accessPatterns;
        }
        
    } catch (exc) {
        // Ignore enhancement errors
    }
}

function getCollectionSamplingStatistics(domStructure) {
    var defaultStats = {
        collectionsFound: 0,
        collectionsSampled: 0,
        totalItemsSampled: 0,
        totalPropertiesDiscovered: 0,
        hasSamplingData: false
    };
    
    try {
        if (domStructure && domStructure.metadata && domStructure.metadata.collectionSampling) {
            var samplingData = domStructure.metadata.collectionSampling;
            if (samplingData.stats) {
                return {
                    collectionsFound: samplingData.stats.collectionsFound || 0,
                    collectionsSampled: samplingData.stats.collectionsSampled || 0,
                    totalItemsSampled: samplingData.stats.totalItemsSampled || 0,
                    totalPropertiesDiscovered: samplingData.stats.totalPropertiesDiscovered || 0,
                    errors: samplingData.stats.errors || 0,
                    timeouts: samplingData.stats.timeouts || 0,
                    samplingTime: samplingData.stats.samplingTime || 0,
                    hasSamplingData: true
                };
            }
        }
    } catch (exc) {
        // Return defaults on error
    }
    
    return defaultStats;
}

// ============================================================================
// 3.0 MINIMAL UI - Simple interface for DOM discovery
// ============================================================================

function showDOMVisualizer() {
    try {
        var dialog = new Window('dialog', 'InDesign DOM Explorer v2.0');
        dialog.orientation = 'column';
        dialog.alignChildren = 'fill';
        dialog.preferredSize.width = 800;
        dialog.preferredSize.height = 700;
        
        // Document info
        var headerPanel = dialog.add('panel', undefined, 'Document Information');
        var docInfo = headerPanel.add('statictext', undefined, 'Ready to analyze document structure');
        docInfo.alignment = 'fill';
        
        // DOM display
        var domPanel = dialog.add('panel', undefined, 'DOM Structure');
        domPanel.preferredSize.height = 450;
        var domDisplay = domPanel.add('edittext', undefined, 'Click "Enumerate DOM" to discover document structure...', {
            multiline: true,
            readonly: true,
            scrolling: true
        });
        domDisplay.alignment = 'fill';
        domDisplay.preferredSize.height = 420;
        
        // Controls
        var controlPanel = dialog.add('group');
        controlPanel.alignment = 'center';
        controlPanel.spacing = 15;
        
        var enumerateBtn = controlPanel.add('button', undefined, 'Enumerate DOM');
        var sampleBtn = controlPanel.add('button', undefined, 'Sample Collections');
        var exportBtn = controlPanel.add('button', undefined, 'Export DOM');
        var closeBtn = controlPanel.add('button', undefined, 'Close');
        
        sampleBtn.enabled = false;
        exportBtn.enabled = false;
        
        // Status
        var statusPanel = dialog.add('panel', undefined, 'Status');
        var statusText = statusPanel.add('statictext', undefined, 'Ready - Click "Enumerate DOM" to begin');
        statusText.alignment = 'fill';
        
        // State variables
        var currentDOMStructure = null;
        var sourceDocument = null;
        
        // Event handlers
        enumerateBtn.onClick = function() {
            try {
                statusText.text = 'Validating environment...';
                
                var envResult = validateInDesignEnvironment();
                if (!envResult.valid) {
                    statusText.text = 'ERROR: ' + envResult.error;
                    alert('Cannot enumerate DOM:\n\n' + envResult.error);
                    return;
                }
                
                sourceDocument = envResult.document;
                docInfo.text = 'Document: ' + (sourceDocument.name || 'Unnamed');
                statusText.text = 'Enumerating DOM structure...';
                
                enumerateBtn.enabled = false;
                
                var config = {
                    maxDepth: 2,
                    timeoutMs: 8000,
                    skipDangerous: true,
                    maxProperties: 2000
                };
                
                currentDOMStructure = enumerateDocumentDOM(sourceDocument, config);
                
                if (currentDOMStructure) {
                    var stats = getDOMStatistics(currentDOMStructure);
                    statusText.text = 'Enumeration complete - ' + stats.totalProperties + ' properties discovered';
                    
                    // Display results
                    var builder = createStringBuilder();
                    builder.appendLine('INDESIGN DOCUMENT DOM STRUCTURE');
                    builder.appendLine('================================');
                    builder.appendLine('');
                    builder.appendLine('Document: ' + currentDOMStructure.metadata.documentName);
                    builder.appendLine('Properties found: ' + stats.totalProperties);
                    builder.appendLine('Objects found: ' + stats.totalNodes);
                    builder.appendLine('Time: ' + stats.enumerationTime + 'ms');
                    builder.appendLine('');
                    builder.appendLine('DOM TREE:');
                    builder.appendLine('=========');
                    
                    var documentNode = currentDOMStructure.structure.document;
                    if (documentNode) {
                        builder.appendLine('document (object)');
                        
                        // Show properties
                        if (documentNode.properties && documentNode.properties.length > 0) {
                            for (var i = 0; i < Math.min(documentNode.properties.length, 8); i++) {
                                var prop = documentNode.properties[i];
                                builder.appendLine('├── ' + prop.name + ' (' + prop.type + ') [' + prop.safetyLevel + ']');
                            }
                            if (documentNode.properties.length > 8) {
                                builder.appendLine('├── ... and ' + (documentNode.properties.length - 8) + ' more properties');
                            }
                        }
                        
                        // Show collections
                        if (documentNode.collections && documentNode.collections.length > 0) {
                            for (var i = 0; i < documentNode.collections.length; i++) {
                                var collection = documentNode.collections[i];
                                builder.appendLine('├── ' + collection.name + ' (' + collection.type + ') [' + collection.safetyLevel + '] [COLLECTION]');
                            }
                        }
                    }
                    
                    domDisplay.text = builder.toString();
                    sampleBtn.enabled = true;
                    exportBtn.enabled = true;
                    
                } else {
                    statusText.text = 'ERROR: DOM enumeration failed';
                }
                
            } catch (exc) {
                statusText.text = 'ERROR: ' + exc.message;
            } finally {
                enumerateBtn.enabled = true;
            }
        };
        
        sampleBtn.onClick = function() {
            try {
                if (!currentDOMStructure || !sourceDocument) {
                    alert('Please run DOM enumeration first.');
                    return;
                }
                
                statusText.text = 'Sampling collection contents...';
                sampleBtn.enabled = false;
                
                var samplingConfig = {
                    maxSamplesPerCollection: 3,
                    timeoutPerCollection: 3000,
                    safetyFilter: 'moderate',
                    enableProgressLogging: false
                };
                
                var enhanced = sampleCollectionContents(currentDOMStructure, sourceDocument, samplingConfig);
                currentDOMStructure = enhanced;
                
                var samplingStats = getCollectionSamplingStatistics(enhanced);
                statusText.text = 'Collection sampling complete - ' + samplingStats.collectionsSampled + ' collections sampled';
                
                // Update display with sampling results
                var builder = createStringBuilder();
                builder.appendLine('INDESIGN DOCUMENT DOM STRUCTURE (Enhanced)');
                builder.appendLine('==========================================');
                builder.appendLine('');
                builder.appendLine('Document: ' + enhanced.metadata.documentName);
                builder.appendLine('Properties found: ' + getDOMStatistics(enhanced).totalProperties);
                builder.appendLine('Collections sampled: ' + samplingStats.collectionsSampled);
                builder.appendLine('Items analyzed: ' + samplingStats.totalItemsSampled);
                builder.appendLine('');
                builder.appendLine('ENHANCED DOM TREE:');
                builder.appendLine('==================');
                
                var documentNode = enhanced.structure.document;
                if (documentNode) {
                    builder.appendLine('document (object)');
                    
                    // Show enhanced collections
                    if (documentNode.collections && documentNode.collections.length > 0) {
                        for (var i = 0; i < documentNode.collections.length; i++) {
                            var collection = documentNode.collections[i];
                            var line = '├── ' + collection.name + ' [' + collection.safetyLevel + '] [COLLECTION';
                            
                            if (collection.hasSamplingData && collection.samplingData) {
                                line += ', length: ' + collection.samplingData.collectionLength;
                                if (collection.samplingData.commonProperties) {
                                    line += ', ' + collection.samplingData.commonProperties.length + ' common props';
                                }
                            }
                            line += ']';
                            builder.appendLine(line);
                            
                            // Show common properties
                            if (collection.samplingData && collection.samplingData.commonProperties) {
                                for (var j = 0; j < Math.min(collection.samplingData.commonProperties.length, 3); j++) {
                                    var commonProp = collection.samplingData.commonProperties[j];
                                    builder.appendLine('│   ├── [item].' + commonProp.name + ' (' + commonProp.type + ') [' + commonProp.safetyLevel + ']');
                                }
                            }
                        }
                    }
                    
                    // Show access patterns
                    builder.appendLine('');
                    builder.appendLine('ACTIONABLE ACCESS PATTERNS:');
                    builder.appendLine('===========================');
                    
                    var foundPatterns = false;
                    if (documentNode.collections) {
                        for (var i = 0; i < documentNode.collections.length; i++) {
                            var collection = documentNode.collections[i];
                            if (collection.samplingData && collection.samplingData.accessPatterns) {
                                foundPatterns = true;
                                builder.appendLine('');
                                builder.appendLine('// ' + collection.name + ' collection:');
                                builder.appendLine('var count = document.' + collection.name + '.length;  // ' + collection.samplingData.collectionLength);
                                
                                for (var j = 0; j < Math.min(collection.samplingData.accessPatterns.length, 2); j++) {
                                    var pattern = collection.samplingData.accessPatterns[j];
                                    var exampleCode = pattern.pattern.replace('[index]', '[0]');
                                    builder.appendLine('var value = ' + exampleCode + ';  // ' + pattern.type);
                                }
                            }
                        }
                    }
                    
                    if (!foundPatterns) {
                        builder.appendLine('No actionable access patterns generated.');
                        builder.appendLine('Collections may be empty or too risky to sample.');
                    }
                }
                
                domDisplay.text = builder.toString();
                
            } catch (exc) {
                statusText.text = 'Sampling error: ' + exc.message;
            } finally {
                sampleBtn.enabled = true;
            }
        };
        
        exportBtn.onClick = function() {
            if (!currentDOMStructure) {
                alert('No DOM structure to export. Please run enumeration first.');
                return;
            }
            
            try {
                statusText.text = 'Exporting DOM structure...';
                
                // Simple export to desktop
                var fileName = 'InDesignDOM_' + getCurrentTimestamp().replace(/[:\-\s]/g, '_') + '.txt';
                var file = new File(Folder.desktop.absoluteURI + '/' + fileName);
                
                if (file.open('w')) {
                    file.write(domDisplay.text);
                    file.close();
                    
                    statusText.text = 'Export successful: ' + file.name;
                    alert('DOM structure exported to desktop:\n\n' + file.name);
                } else {
                    statusText.text = 'Export failed - cannot create file';
                }
                
            } catch (exc) {
                statusText.text = 'Export error: ' + exc.message;
            }
        };
        
        closeBtn.onClick = function() {
            dialog.close();
        };
        
        dialog.show();
        
    } catch (exc) {
        alert('Failed to create DOM visualizer interface:\n\n' + exc.message);
    }
}

// ============================================================================
// DEMO FUNCTIONS - Test the system
// ============================================================================

function quickDemo() {
    $.writeln('');
    $.writeln('🚀 QUICK COLLECTION SAMPLING DEMO');
    $.writeln('=================================');
    
    try {
        var envResult = validateInDesignEnvironment();
        if (!envResult.valid) {
            $.writeln('❌ No document available: ' + envResult.error);
            alert('Please open an InDesign document first.');
            return;
        }
        
        var doc = envResult.document;
        $.writeln('✓ Document: ' + (doc.name || 'Unnamed'));
        
        // Step 1: Basic enumeration
        $.writeln('📋 Step 1: Discovering DOM structure...');
        var domStructure = enumerateDocumentDOM(doc, {
            maxDepth: 2,
            timeoutMs: 3000,
            skipDangerous: true
        });
        
        var stats = getDOMStatistics(domStructure);
        $.writeln('  ✓ Found ' + stats.totalProperties + ' properties in ' + stats.enumerationTime + 'ms');
        
        // Step 2: Collection sampling  
        $.writeln('🔍 Step 2: Sampling collection contents...');
        var enhanced = sampleCollectionContents(domStructure, doc, {
            maxSamplesPerCollection: 2,
            timeoutPerCollection: 2000,
            safetyFilter: 'moderate'
        });
        
        var samplingStats = getCollectionSamplingStatistics(enhanced);
        $.writeln('  ✓ Sampled ' + samplingStats.collectionsSampled + ' collections');
        $.writeln('  ✓ Analyzed ' + samplingStats.totalItemsSampled + ' items');
        $.writeln('  ✓ Discovered ' + samplingStats.totalPropertiesDiscovered + ' item properties');
        
        // Step 3: Show actionable results
        $.writeln('🎯 Step 3: Generated access patterns...');
        var document_node = enhanced.structure.document;
        if (document_node && document_node.collections) {
            var exampleCount = 0;
            for (var i = 0; i < document_node.collections.length && exampleCount < 3; i++) {
                var collection = document_node.collections[i];
                
                if (collection.hasSamplingData && collection.samplingData) {
                    $.writeln('  📁 ' + collection.name + ' collection:');
                    $.writeln('     Length: ' + collection.samplingData.collectionLength);
                    
                    if (collection.samplingData.accessPatterns && collection.samplingData.accessPatterns.length > 0) {
                        var pattern = collection.samplingData.accessPatterns[0];
                        var exampleCode = pattern.pattern.replace('[index]', '[0]');
                        $.writeln('     Example: var value = ' + exampleCode + ';');
                    }
                    
                    exampleCount++;
                }
            }
            
            if (exampleCount === 0) {
                $.writeln('  Collections found but no safe access patterns generated.');
                $.writeln('  This might be a very simple document or all collections are empty.');
            }
        }
        
        $.writeln('');
        $.writeln('✅ DEMO COMPLETE! Now you know what\'s in your document and how to access it safely.');
        $.writeln('💡 Use showDOMVisualizer() for the full UI experience.');
        
    } catch (exc) {
        $.writeln('❌ Demo failed: ' + exc.message);
    }
}

function fullDemo() {
    $.writeln('');
    $.writeln('🎯 COMPREHENSIVE COLLECTION SAMPLING DEMO');
    $.writeln('=========================================');
    
    try {
        var envResult = validateInDesignEnvironment();
        if (!envResult.valid) {
            $.writeln('❌ Cannot run demo: ' + envResult.error);
            return;
        }
        
        var doc = envResult.document;
        $.writeln('📄 Document: ' + (doc.name || 'Unnamed'));
        $.writeln('📄 Pages: ' + safeGetLength(doc.pages));
        $.writeln('');
        
        // Full enumeration
        $.writeln('🔍 Phase 1: Complete DOM Structure Discovery');
        $.writeln('--------------------------------------------');
        var domStructure = enumerateDocumentDOM(doc, {
            maxDepth: 2,
            timeoutMs: 5000,
            skipDangerous: true,
            maxProperties: 1000
        });
        
        var stats = getDOMStatistics(domStructure);
        $.writeln('✓ DOM enumeration complete:');
        $.writeln('  • Objects discovered: ' + stats.totalNodes);
        $.writeln('  • Properties found: ' + stats.totalProperties);
        $.writeln('  • Max depth reached: ' + stats.maxDepth);
        $.writeln('  • Enumeration time: ' + stats.enumerationTime + 'ms');
        
        // Find collections
        var collections = findAllCollections(domStructure);
        $.writeln('  • Collections found: ' + collections.length);
        for (var i = 0; i < Math.min(collections.length, 5); i++) {
            $.writeln('    - ' + collections[i].name + ' [' + collections[i].safetyLevel + ']');
        }
        $.writeln('');
        
        // Collection sampling
        $.writeln('🔬 Phase 2: Collection Content Sampling');
        $.writeln('---------------------------------------');
        var enhanced = sampleCollectionContents(domStructure, doc, {
            maxSamplesPerCollection: 3,
            timeoutPerCollection: 3000,
            safetyFilter: 'moderate',
            enableProgressLogging: false
        });
        
        var samplingStats = getCollectionSamplingStatistics(enhanced);
        $.writeln('✓ Collection sampling complete:');
        $.writeln('  • Collections analyzed: ' + samplingStats.collectionsSampled + '/' + samplingStats.collectionsFound);
        $.writeln('  • Items sampled: ' + samplingStats.totalItemsSampled);
        $.writeln('  • Item properties discovered: ' + samplingStats.totalPropertiesDiscovered);
        $.writeln('  • Sampling time: ' + samplingStats.samplingTime + 'ms');
        $.writeln('  • Errors: ' + samplingStats.errors);
        $.writeln('');
        
        // Actionable results
        $.writeln('🎯 Phase 3: Actionable Access Patterns');
        $.writeln('--------------------------------------');
        
        var document_node = enhanced.structure.document;
        if (document_node && document_node.collections) {
            var foundUseful = false;
            
            for (var i = 0; i < document_node.collections.length; i++) {
                var collection = document_node.collections[i];
                
                if (collection.hasSamplingData && collection.samplingData) {
                    foundUseful = true;
                    $.writeln('');
                    $.writeln('📁 Collection: ' + collection.name);
                    $.writeln('   Safety Level: [' + collection.safetyLevel + ']');
                    $.writeln('   Length: ' + collection.samplingData.collectionLength);
                    
                    if (collection.samplingData.accessPatterns && collection.samplingData.accessPatterns.length > 0) {
                        $.writeln('   Ready-to-use access patterns:');
                        
                        for (var j = 0; j < Math.min(collection.samplingData.accessPatterns.length, 2); j++) {
                            var pattern = collection.samplingData.accessPatterns[j];
                            var exampleCode = pattern.pattern.replace('[index]', '[0]');
                            $.writeln('   • var value = ' + exampleCode + ';  // ' + pattern.type + ' [' + pattern.safetyLevel + ']');
                        }
                        
                        // Safe iteration example
                        $.writeln('   Safe iteration pattern:');
                        $.writeln('   • try {');
                        $.writeln('   •   var items = document.' + collection.name + ';');
                        $.writeln('   •   for (var i = 0; i < items.length; i++) {');
                        $.writeln('   •     var item = items[i];');
                        $.writeln('   •     // Use item properties here');
                        $.writeln('   •   }');
                        $.writeln('   • } catch (exc) { /* handle safely */ }');
                        
                    } else {
                        $.writeln('   No safe access patterns identified.');
                    }
                }
            }
            
            if (!foundUseful) {
                $.writeln('No collections were successfully sampled.');
                $.writeln('This might indicate:');
                $.writeln('• Document has no collections');
                $.writeln('• All collections are empty');  
                $.writeln('• Collections are too risky to sample safely');
            }
        }
        
        $.writeln('');
        $.writeln('🎉 FULL DEMO COMPLETE!');
        $.writeln('');
        $.writeln('What you just saw:');
        $.writeln('1. Document structure mapped (what collections exist)');
        $.writeln('2. Collection contents analyzed (what\'s inside each collection)'); 
        $.writeln('3. Safe access patterns generated (how to use the data)');
        $.writeln('');
        $.writeln('This transforms guesswork into reliable, document-specific property access!');
        
    } catch (exc) {
        $.writeln('❌ Demo error: ' + exc.message);
    }
}

// ============================================================================
// STARTUP AND USER GUIDANCE
// ============================================================================

$.writeln('');
$.writeln('🎉 COMPLETE DOM DISCOVERY SYSTEM LOADED!');
$.writeln('=======================================');
$.writeln('');
$.writeln('🚀 THREE WAYS TO USE THIS SYSTEM:');
$.writeln('');
$.writeln('1. 📱 GUI WAY (Recommended):');
$.writeln('   showDOMVisualizer()');
$.writeln('   → Click "Enumerate DOM"');  
$.writeln('   → Click "Sample Collections"');
$.writeln('   → Click "Export DOM"');
$.writeln('');
$.writeln('2. ⚡ QUICK DEMO WAY:');
$.writeln('   quickDemo()');
$.writeln('   → See results in console in 10 seconds');
$.writeln('');
$.writeln('3. 🔬 FULL DEMO WAY:');
$.writeln('   fullDemo()');
$.writeln('   → Complete analysis with detailed explanations');
$.writeln('');
$.writeln('💡 RECOMMENDED: Try quickDemo() first, then use the GUI!');

// Auto-start prompt
try {
    if (confirm('DOM Discovery System loaded successfully!\n\nWould you like to:\n\n• OK = Open the GUI interface\n• Cancel = Use console commands')) {
        $.writeln('');
        $.writeln('🚀 Starting DOM Discovery GUI...');
        showDOMVisualizer();
    } else {
        $.writeln('');
        $.writeln('💡 GUI not started. Use these commands:');
        $.writeln('   • quickDemo() - Fast demo');
        $.writeln('   • fullDemo() - Detailed demo');  
        $.writeln('   • showDOMVisualizer() - Open GUI anytime');
    }
} catch (exc) {
    $.writeln('');
    $.writeln('💡 Use these commands:');
    $.writeln('   • quickDemo() - Fast demo');
    $.writeln('   • showDOMVisualizer() - Open GUI');
}