//
// 6.0_collection-sampler.jsx
// InDesign DOM Discovery Builder - Collection Content Sampling (FIXED)
// CORE PURPOSE: Safely drill into discovered collections to map their contents
// DEPENDENCIES: 1.0_safe-foundation.jsx, 2.0_dom-enumerator.jsx
// SAFETY: Ultra-safe collection access with discovery-first approach
// ES3 COMPATIBLE: No reserved words, no modern JS features
//

// ============================================================================
// COLLECTION SAMPLING CONFIGURATION
// ============================================================================

var DEFAULT_COLLECTION_SAMPLING_CONFIG = {
    maxSamplesPerCollection: 3,     // Sample first 3 items from each collection
    timeoutPerCollection: 3000,     // 3 seconds max per collection
    timeoutPerItem: 1000,          // 1 second max per collection item
    maxCollectionSize: 1000,       // Skip collections larger than 1000 items
    samplingDepth: 2,              // How deep to drill into sampled items
    skipEmptyCollections: true,     // Skip collections with 0 length
    enableProgressLogging: true    // Log sampling progress
};

// ============================================================================
// MAIN COLLECTION SAMPLING FUNCTIONS
// ============================================================================

/**
 * Sample contents of discovered collections and enhance DOM structure (FIXED)
 * @param {Object} domStructure - DOM structure from enumeration
 * @param {Object} sourceDocument - InDesign document object for sampling
 * @param {Object} samplingConfig - Sampling configuration
 * @returns {Object} - Enhanced DOM structure with collection contents
 */
function sampleCollectionContents(domStructure, sourceDocument, samplingConfig) {
    if (!domStructure || !sourceDocument) {
        $.writeln('ERROR: Invalid parameters for collection sampling');
        return domStructure;
    }
    
    // Merge configuration (removed problematic safetyFilter)
    var config = mergeCollectionSamplingConfig(DEFAULT_COLLECTION_SAMPLING_CONFIG, samplingConfig);
    
    $.writeln('');
    $.writeln('==========================================');
    $.writeln('COLLECTION CONTENT SAMPLING STARTED');
    $.writeln('==========================================');
    $.writeln('🎯 DISCOVERY-FIRST APPROACH: Sampling all discovered collections');
    $.writeln('Max samples per collection: ' + config.maxSamplesPerCollection);
    $.writeln('Timeout per collection: ' + config.timeoutPerCollection + 'ms');
    $.writeln('');
    
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
        // Find all collections in DOM structure
        var discoveredCollections = findAllCollections(domStructure);
        samplingStats.collectionsFound = discoveredCollections.length;
        
        if (config.enableProgressLogging) {
            $.writeln('Found ' + discoveredCollections.length + ' collections to sample');
        }
        
        // Sample each discovered collection
        for (var i = 0; i < discoveredCollections.length; i++) {
            var collection = discoveredCollections[i];
            
            if (config.enableProgressLogging) {
                $.writeln('Processing collection ' + (i + 1) + '/' + discoveredCollections.length + ': ' + collection.name);
                $.writeln('  Path: ' + collection.path);
                $.writeln('  Safety level: ' + collection.safetyLevel);
            }
            
            // FIXED: Use discovery-first criteria instead of restrictive safety filter
            if (!meetsDiscoveryFirstCriteria(collection, config)) {
                samplingStats.collectionsSkipped++;
                if (config.enableProgressLogging) {
                    $.writeln('  ❌ Skipped - truly dangerous or problematic');
                }
                continue;
            }
            
            // Sample this collection with safety-adjusted approach
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
                
                // Enhance the original collection with sampling data
                enhanceCollectionWithSamplingData(collection, collectionSamplingResult.samplingData);
                
                if (config.enableProgressLogging) {
                    $.writeln('  ✅ Sampled successfully - ' + collectionSamplingResult.itemsSampled + ' items, ' + 
                             collectionSamplingResult.propertiesDiscovered + ' properties');
                }
            } else {
                samplingStats.errors++;
                if (config.enableProgressLogging) {
                    $.writeln('  ❌ Sampling failed: ' + collectionSamplingResult.error);
                }
            }
        }
        
        // Add sampling metadata to DOM structure
        samplingStats.samplingTime = new Date().getTime() - startTime;
        
        if (!domStructure.metadata.collectionSampling) {
            domStructure.metadata.collectionSampling = {};
        }
        
        domStructure.metadata.collectionSampling = {
            timestamp: getCurrentTimestamp(),
            config: config,
            stats: samplingStats,
            approach: 'discovery-first'
        };
        
        $.writeln('');
        $.writeln('COLLECTION SAMPLING COMPLETE:');
        $.writeln('  Collections found: ' + samplingStats.collectionsFound);
        $.writeln('  Collections sampled: ' + samplingStats.collectionsSampled);
        $.writeln('  Collections skipped: ' + samplingStats.collectionsSkipped);
        $.writeln('  Total items sampled: ' + samplingStats.totalItemsSampled);
        $.writeln('  Properties discovered: ' + samplingStats.totalPropertiesDiscovered);
        $.writeln('  Errors: ' + samplingStats.errors);
        $.writeln('  Timeouts: ' + samplingStats.timeouts);
        $.writeln('  Time: ' + samplingStats.samplingTime + 'ms');
        $.writeln('==========================================');
        
    } catch (exc) {
        $.writeln('ERROR: Collection sampling failed: ' + exc.message);
        samplingStats.errors++;
        
        // Add error info to metadata even on failure
        if (!domStructure.metadata.collectionSampling) {
            domStructure.metadata.collectionSampling = {};
        }
        domStructure.metadata.collectionSampling.error = exc.message;
    }
    
    return domStructure;
}

/**
 * FIXED: Discovery-first criteria - sample all discovered collections except truly dangerous ones
 * @param {Object} collection - Collection property classification
 * @param {Object} config - Sampling configuration
 * @returns {Boolean} - true if collection should be sampled
 */
function meetsDiscoveryFirstCriteria(collection, config) {
    try {
        // Skip only truly dangerous collections (functions, etc.)
        if (collection.safetyLevel === 'dangerous') {
            return false;
        }
        
        // Skip collections with obviously dangerous names
        if (isDangerousProperty(collection.name)) {
            return false;
        }
        
        // DISCOVERY-FIRST PRINCIPLE: If enumeration found it, we sample it safely
        // Safety level affects HOW we sample, not WHETHER we sample
        return true;
        
    } catch (exc) {
        return false;
    }
}

/**
 * Get safety-adjusted sampling configuration based on collection safety level
 * @param {Object} collection - Collection property classification
 * @param {Object} baseConfig - Base sampling configuration
 * @returns {Object} - Adjusted configuration
 */
function getSafetyAdjustedConfig(collection, baseConfig) {
    var adjustedConfig = {
        maxSamplesPerCollection: baseConfig.maxSamplesPerCollection,
        timeoutPerCollection: baseConfig.timeoutPerCollection,
        timeoutPerItem: baseConfig.timeoutPerItem
    };
    
    // Adjust safety measures based on collection safety level
    switch (collection.safetyLevel) {
        case 'safe':
            // Safe collections - can be more aggressive
            adjustedConfig.maxSamplesPerCollection = Math.min(baseConfig.maxSamplesPerCollection * 2, 5);
            break;
            
        case 'moderate':
            // Moderate collections - use base settings
            break;
            
        case 'risky':
            // Risky collections - be more cautious
            adjustedConfig.maxSamplesPerCollection = Math.max(Math.floor(baseConfig.maxSamplesPerCollection / 2), 1);
            adjustedConfig.timeoutPerCollection = Math.floor(baseConfig.timeoutPerCollection / 2);
            adjustedConfig.timeoutPerItem = Math.floor(baseConfig.timeoutPerItem / 2);
            break;
            
        case 'dangerous':
            // Should have been filtered out, but just in case
            adjustedConfig.maxSamplesPerCollection = 1;
            adjustedConfig.timeoutPerCollection = 500;
            adjustedConfig.timeoutPerItem = 100;
            break;
    }
    
    return adjustedConfig;
}

/**
 * Sample contents of a single collection with safety adjustments
 * @param {Object} collection - Collection property classification
 * @param {Object} sourceDocument - InDesign document object
 * @param {Object} config - Sampling configuration
 * @param {Object} samplingStats - Statistics tracking object
 * @returns {Object} - {success: boolean, itemsSampled: number, propertiesDiscovered: number, samplingData: object, error: string}
 */
function sampleSingleCollection(collection, sourceDocument, config, samplingStats) {
    var result = {
        success: false,
        itemsSampled: 0,
        propertiesDiscovered: 0,
        samplingData: null,
        error: ''
    };
    
    // Get safety-adjusted configuration
    var adjustedConfig = getSafetyAdjustedConfig(collection, config);
    var timeoutChecker = createTimeoutChecker(adjustedConfig.timeoutPerCollection);
    
    try {
        // Get reference to the actual collection object using discovered path
        var collectionObject = safeGetObjectFromPath(sourceDocument, collection.path, adjustedConfig.timeoutPerCollection);
        
        if (!collectionObject.success) {
            result.error = 'Could not access collection: ' + collectionObject.error;
            return result;
        }
        
        var actualCollection = collectionObject.value;
        
        // Get collection length safely
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
        
        // Initialize sampling data
        var samplingData = {
            collectionLength: collectionLength,
            sampledItems: [],
            commonProperties: [],
            accessPatterns: [],
            safetyAdjustments: {
                originalSafetyLevel: collection.safetyLevel,
                adjustedMaxSamples: adjustedConfig.maxSamplesPerCollection,
                adjustedTimeout: adjustedConfig.timeoutPerCollection
            }
        };
        
        // Sample items using safety-adjusted limits
        var itemsToSample = Math.min(collectionLength, adjustedConfig.maxSamplesPerCollection);
        
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
                    adjustedConfig
                );
                
                if (itemSamplingResult.success) {
                    samplingData.sampledItems.push(itemSamplingResult.itemData);
                    result.itemsSampled++;
                    result.propertiesDiscovered += itemSamplingResult.propertiesFound;
                } else {
                    // Don't fail entire collection for one bad item
                    $.writeln('    Warning: Could not sample item [' + itemIndex + ']: ' + itemSamplingResult.error);
                }
                
            } catch (itemExc) {
                $.writeln('    Warning: Exception sampling item [' + itemIndex + ']: ' + itemExc.message);
            }
        }
        
        // Analyze sampled items to find common patterns
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

/**
 * Sample individual item from collection
 * @param {Object} collection - Collection object
 * @param {Number} itemIndex - Index of item to sample
 * @param {String} itemPath - Full path to item
 * @param {Object} config - Sampling configuration
 * @returns {Object} - {success: boolean, itemData: object, propertiesFound: number, error: string}
 */
function sampleCollectionItem(collection, itemIndex, itemPath, config) {
    var result = {
        success: false,
        itemData: null,
        propertiesFound: 0,
        error: ''
    };
    
    var timeoutChecker = createTimeoutChecker(config.timeoutPerItem);
    
    try {
        // Access collection item safely
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
        
        // Create item data structure
        var itemData = {
            index: itemIndex,
            path: itemPath,
            type: typeof item,
            properties: [],
            collections: [],
            methods: []
        };
        
        // Enumerate properties of this item (limited depth)
        try {
            for (var propName in item) {
                if (timeoutChecker()) {
                    break;
                }
                
                try {
                    // Skip dangerous properties during sampling
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
                    // Skip problematic properties
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

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Safely get object from dot notation path
 * @param {Object} rootObject - Root object to start from
 * @param {String} dotPath - Dot notation path (e.g., "document.stories")
 * @param {Number} timeoutMs - Timeout in milliseconds
 * @returns {Object} - {success: boolean, value: object, error: string}
 */
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
        
        // Start from index 1 to skip 'document' part
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

/**
 * Find all collections in DOM structure
 * @param {Object} domStructure - DOM structure to search
 * @returns {Array} - Array of collection property classifications
 */
function findAllCollections(domStructure) {
    var collections = [];
    
    try {
        if (domStructure.structure && domStructure.structure.document) {
            findCollectionsInNode(domStructure.structure.document, collections);
        }
    } catch (exc) {
        $.writeln('Error finding collections: ' + exc.message);
    }
    
    return collections;
}

/**
 * Recursively find collections in DOM node
 * @param {Object} domNode - DOM node to search
 * @param {Array} collections - Array to accumulate collections
 */
function findCollectionsInNode(domNode, collections) {
    if (!domNode) return;
    
    try {
        // Add collections from this node
        if (domNode.collections) {
            for (var i = 0; i < domNode.collections.length; i++) {
                collections.push(domNode.collections[i]);
            }
        }
        
        // Recursively search child nodes
        if (domNode.childNodes) {
            for (var i = 0; i < domNode.childNodes.length; i++) {
                findCollectionsInNode(domNode.childNodes[i], collections);
            }
        }
    } catch (exc) {
        $.writeln('Error searching node for collections: ' + exc.message);
    }
}

/**
 * Analyze sampled items to find common property patterns
 * @param {Object} samplingData - Sampling data to analyze
 */
function analyzeCommonPatterns(samplingData) {
    try {
        if (!samplingData.sampledItems || samplingData.sampledItems.length === 0) {
            return;
        }
        
        // Find properties that exist in all sampled items
        var firstItem = samplingData.sampledItems[0];
        var allProperties = [];
        
        if (firstItem.properties) allProperties = allProperties.concat(firstItem.properties);
        if (firstItem.collections) allProperties = allProperties.concat(firstItem.collections);
        
        for (var i = 0; i < allProperties.length; i++) {
            var prop = allProperties[i];
            var existsInAll = true;
            
            // Check if this property exists in all other sampled items
            for (var j = 1; j < samplingData.sampledItems.length; j++) {
                var otherItem = samplingData.sampledItems[j];
                var foundInOther = false;
                
                // Check properties
                if (otherItem.properties) {
                    for (var k = 0; k < otherItem.properties.length; k++) {
                        if (otherItem.properties[k].name === prop.name) {
                            foundInOther = true;
                            break;
                        }
                    }
                }
                
                // Check collections
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
        
        // Generate access patterns for common properties
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
        $.writeln('Error analyzing common patterns: ' + exc.message);
    }
}

/**
 * Enhance collection property with sampling data
 * @param {Object} collection - Original collection property classification
 * @param {Object} samplingData - Sampling data to add
 */
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
        $.writeln('Error enhancing collection with sampling data: ' + exc.message);
    }
}

/**
 * Merge collection sampling configuration with defaults
 * @param {Object} defaults - Default configuration
 * @param {Object} userConfig - User configuration
 * @returns {Object} - Merged configuration
 */
function mergeCollectionSamplingConfig(defaults, userConfig) {
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
// PUBLIC API FUNCTIONS
// ============================================================================

/**
 * Quick collection sampling using default configuration
 * @param {Object} domStructure - DOM structure from enumeration
 * @param {Object} sourceDocument - InDesign document object
 * @returns {Object} - Enhanced DOM structure
 */
function quickSampleCollections(domStructure, sourceDocument) {
    var quickConfig = {
        maxSamplesPerCollection: 2,
        timeoutPerCollection: 2000,
        enableProgressLogging: false
    };
    
    return sampleCollectionContents(domStructure, sourceDocument, quickConfig);
}

/**
 * Get collection sampling statistics
 * @param {Object} domStructure - DOM structure with sampling data
 * @returns {Object} - Sampling statistics
 */
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
        $.writeln('Error getting collection sampling statistics: ' + exc.message);
    }
    
    return defaultStats;
}

// ============================================================================
// MODULE INITIALIZATION
// ============================================================================

/**
 * Initialize collection sampler module
 * @returns {Boolean} - true if initialization successful
 */
function initializeCollectionSampler() {
    try {
        // Check dependencies
        if (typeof safeTypeCheck !== 'function') {
            $.writeln('ERROR: Safe foundation module not loaded');
            return false;
        }
        
        if (typeof createPropertyClassification !== 'function') {
            $.writeln('ERROR: DOM enumerator module not loaded');
            return false;
        }
        
        // Test core functions
        var requiredFunctions = [
            'sampleCollectionContents', 'findAllCollections', 'safeGetObjectFromPath'
        ];
        
        for (var i = 0; i < requiredFunctions.length; i++) {
            if (typeof eval(requiredFunctions[i]) !== 'function') {
                $.writeln('ERROR: Required function missing: ' + requiredFunctions[i]);
                return false;
            }
        }
        
        $.writeln('6.0_collection-sampler.jsx: All functions initialized successfully (FIXED VERSION)');
        $.writeln('Use sampleCollectionContents(domStructure, document, config) to sample collections');
        return true;
        
    } catch (exc) {
        $.writeln('ERROR: Collection sampler initialization failed: ' + exc.message);
        return false;
    }
}

// Auto-initialize when module loads
initializeCollectionSampler();