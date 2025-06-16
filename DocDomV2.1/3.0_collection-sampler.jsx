// =============================================================================
// 3.0_collection-sampler.jsx - COLLECTION CONTENT SAMPLING
// InDesign DOM Discovery Builder v2.1 - TARGET ARCHITECTURE
// =============================================================================
// PURPOSE: Deep collection content sampling with object reference tracking
// DEPENDENCIES: ["1.0_safe-foundation.jsx", "2.0_dom-enumerator.jsx"]
// SIZE: ~1200 lines
// =============================================================================

// =============================================================================
// COLLECTION SAMPLING CONFIGURATION
// =============================================================================

var DEFAULT_COLLECTION_SAMPLING_CONFIG = {
    maxSamplesPerCollection: 5,
    timeoutPerCollection: 5000,
    timeoutPerItem: 2000,
    maxCollectionSize: 2000,
    samplingDepth: 3,
    enableObjectReferenceTracking: true,
    enableDeepPropertyAnalysis: true,
    enableCrossCollectionTracking: true,
    maxItemPropertiesPerSample: 100,
    propertyAnalysisDepth: 2
};

// =============================================================================
// MAIN COLLECTION SAMPLING FUNCTIONS
// =============================================================================

/**
 * Complete collection content sampling with deep analysis
 * @param {Object} domStructure - DOM structure with discovered collections
 * @param {Object} sourceDocument - Source document for collection access
 * @param {Object} samplingConfig - Sampling configuration
 * @returns {Object} DOM structure with deep collection analysis
 */
function sampleCollectionContents(domStructure, sourceDocument, samplingConfig) {
    var startTime = new Date().getTime();
    var config = samplingConfig || DEFAULT_COLLECTION_SAMPLING_CONFIG;
    
    try {
        if (!domStructure || !domStructure.structure) {
            return domStructure;
        }
        
        // Initialize sampling metadata
        domStructure.metadata.collectionSampling = {
            enabled: true,
            startTime: getCurrentTimestamp(),
            config: config,
            deepAnalysisEnabled: config.enableDeepPropertyAnalysis
        };
        
        // Set up cross-collection tracking
        var crossCollectionRegistry = {};
        if (config.enableCrossCollectionTracking) {
            initializeCrossCollectionTracking(domStructure, crossCollectionRegistry);
        }
        
        // Set up sampling statistics
        var samplingStats = {
            collectionsFound: 0,
            collectionsSampled: 0,
            totalItemsSampled: 0,
            samplingErrors: 0,
            deepAnalysisPerformed: 0,
            crossCollectionObjectsFound: 0
        };
        
        // Find all collections using discovery-first approach
        var discoveredCollections = findAllCollections(domStructure);
        samplingStats.collectionsFound = discoveredCollections.length;
        
        var timeoutChecker = createTimeoutChecker(config.timeoutPerCollection * discoveredCollections.length);
        
        // Sample each discovered collection
        for (var i = 0; i < discoveredCollections.length; i++) {
            if (timeoutChecker && timeoutChecker()) {
                break;
            }
            
            var collection = discoveredCollections[i];
            
            if (meetsDiscoveryFirstCriteria(collection, config)) {
                var samplingResult = sampleSingleCollection(
                    collection,
                    sourceDocument,
                    config,
                    samplingStats,
                    crossCollectionRegistry
                );
                
                if (samplingResult.success) {
                    enhanceCollectionWithSamplingData(collection, samplingResult);
                    samplingStats.collectionsSampled++;
                    samplingStats.totalItemsSampled += samplingResult.itemsSampled;
                    samplingStats.deepAnalysisPerformed += samplingResult.deepAnalysisCount;
                }
            }
        }
        
        // Perform cross-collection analysis
        if (config.enableCrossCollectionTracking) {
            performCrossCollectionAnalysis(domStructure, crossCollectionRegistry, samplingStats);
        }
        
        // Update DOM structure with sampling results
        domStructure.metadata.collectionSampling.completed = true;
        domStructure.metadata.collectionSampling.endTime = getCurrentTimestamp();
        domStructure.metadata.collectionSampling.samplingTime = new Date().getTime() - startTime;
        domStructure.metadata.collectionSampling.statistics = samplingStats;
        
        return domStructure;
        
    } catch (exc) {
        if (domStructure && domStructure.metadata) {
            domStructure.metadata.collectionSampling = {
                enabled: false,
                error: 'Collection sampling failed: ' + exc.message,
                timestamp: getCurrentTimestamp()
            };
        }
        return domStructure;
    }
}

/**
 * Sample single collection with deep analysis
 * @param {Object} collection - Collection property to sample
 * @param {Object} sourceDocument - Source document
 * @param {Object} config - Sampling configuration
 * @param {Object} samplingStats - Sampling statistics to update
 * @param {Object} crossCollectionRegistry - Cross-collection tracking registry
 * @returns {Object} Sampling result with comprehensive analysis
 */
function sampleSingleCollection(collection, sourceDocument, config, samplingStats, crossCollectionRegistry) {
    var result = {
        success: false,
        itemsSampled: 0,
        samplingData: [],
        deepAnalysisCount: 0,
        error: null
    };
    
    try {
        // Get actual collection object safely
        var collectionAccess = safeGetObjectFromPath(sourceDocument, collection.path, config.timeoutPerCollection);
        if (!collectionAccess.success) {
            result.error = 'Could not access collection: ' + collectionAccess.error;
            return result;
        }
        
        var collectionObj = collectionAccess.value;
        var collectionLength = safeGetLength(collectionObj);
        
        if (collectionLength <= 0 || collectionLength > config.maxCollectionSize) {
            result.error = 'Collection size invalid or too large: ' + collectionLength;
            return result;
        }
        
        // Get safety-adjusted configuration
        var adjustedConfig = getSafetyAdjustedConfig(collection, config);
        var timeoutChecker = createTimeoutChecker(adjustedConfig.timeoutPerCollection);
        
        // Determine sampling strategy
        var sampleIndices = [];
        var maxSamples = Math.min(adjustedConfig.maxSamplesPerCollection, collectionLength);
        
        if (collectionLength <= maxSamples) {
            // Sample all items
            for (var i = 0; i < collectionLength; i++) {
                sampleIndices.push(i);
            }
        } else {
            // Sample distributed items
            var step = Math.floor(collectionLength / maxSamples);
            for (var j = 0; j < maxSamples; j++) {
                sampleIndices.push(j * step);
            }
        }
        
        // Sample each selected item
        for (var k = 0; k < sampleIndices.length; k++) {
            if (timeoutChecker && timeoutChecker()) {
                break;
            }
            
            var itemIndex = sampleIndices[k];
            var itemPath = collection.path + '[' + itemIndex + ']';
            
            var itemSample = sampleCollectionItem(
                collectionObj,
                itemIndex,
                itemPath,
                adjustedConfig,
                crossCollectionRegistry
            );
            
            if (itemSample.success) {
                result.samplingData.push(itemSample);
                result.itemsSampled++;
                
                if (itemSample.deepAnalysisPerformed) {
                    result.deepAnalysisCount++;
                }
            }
        }
        
        result.success = true;
        return result;
        
    } catch (exc) {
        result.error = 'Collection sampling error: ' + exc.message;
        samplingStats.samplingErrors++;
        return result;
    }
}

/**
 * Sample collection item with deep property analysis
 * @param {Object} collection - Collection object
 * @param {Number} itemIndex - Index of item to sample
 * @param {String} itemPath - Path to the item
 * @param {Object} config - Sampling configuration
 * @param {Object} crossCollectionRegistry - Cross-collection tracking
 * @returns {Object} Item sampling result with deep analysis data
 */
function sampleCollectionItem(collection, itemIndex, itemPath, config, crossCollectionRegistry) {
    var result = {
        success: false,
        itemIndex: itemIndex,
        itemPath: itemPath,
        itemType: 'unknown',
        propertyCount: 0,
        deepAnalysisPerformed: false,
        deepAnalysisData: null,
        properties: [],
        error: null
    };
    
    try {
        // Safely access the item
        var collectionItem = null;
        try {
            collectionItem = collection[itemIndex];
        } catch (exc) {
            result.error = 'Could not access item at index ' + itemIndex;
            return result;
        }
        
        if (!collectionItem) {
            result.error = 'Item is null or undefined';
            return result;
        }
        
        result.itemType = typeof collectionItem;
        
        // Track cross-collection object if enabled
        if (config.enableCrossCollectionTracking) {
            var objectId = generateObjectReferenceID(collectionItem);
            trackCrossCollectionObject(crossCollectionRegistry, objectId, itemPath, collectionItem);
        }
        
        var timeoutChecker = createTimeoutChecker(config.timeoutPerItem);
        var propertyCounter = createOperationCounter(config.maxItemPropertiesPerSample);
        
        // Enumerate properties of the item
        for (var propName in collectionItem) {
            if (timeoutChecker && timeoutChecker()) {
                break;
            }
            
            if (propertyCounter && propertyCounter.check()) {
                break;
            }
            
            propertyCounter.increment();
            
            // Skip dangerous properties
            if (isDangerousProperty(propName)) {
                continue;
            }
            
            var propType = safeTypeCheck(collectionItem, propName);
            if (propType === 'error') {
                continue;
            }
            
            var propertyInfo = {
                name: propName,
                type: propType,
                safetyLevel: classifyPropertySafety(propName, propType),
                path: itemPath + '.' + propName
            };
            
            result.properties.push(propertyInfo);
            result.propertyCount++;
        }
        
        // Perform deep analysis if enabled
        if (config.enableDeepPropertyAnalysis) {
            result.deepAnalysisData = performDeepItemAnalysis(collectionItem, itemPath, config, timeoutChecker);
            result.deepAnalysisPerformed = result.deepAnalysisData !== null;
        }
        
        result.success = true;
        return result;
        
    } catch (exc) {
        result.error = 'Item sampling error: ' + exc.message;
        return result;
    }
}

/**
 * Perform deep analysis on collection item
 * @param {Object} collectionItem - Item to analyze
 * @param {String} itemPath - Path to the item
 * @param {Object} config - Configuration
 * @param {Function} timeoutChecker - Timeout checker
 * @returns {Object} Deep analysis result with comprehensive findings
 */
function performDeepItemAnalysis(collectionItem, itemPath, config, timeoutChecker) {
    try {
        var analysis = {
            objectType: typeof collectionItem,
            propertyCategories: {
                safe: [],
                moderate: [],
                risky: [],
                dangerous: []
            },
            methodCount: 0,
            objectCount: 0,
            potentialCollections: [],
            accessPatterns: [],
            analysisTime: new Date().getTime()
        };
        
        var operationCounter = createOperationCounter(config.maxItemPropertiesPerSample);
        
        // Analyze each property in depth
        for (var propName in collectionItem) {
            if (timeoutChecker && timeoutChecker()) {
                break;
            }
            
            if (operationCounter && operationCounter.check()) {
                break;
            }
            
            operationCounter.increment();
            
            var propType = safeTypeCheck(collectionItem, propName);
            if (propType === 'error') {
                continue;
            }
            
            var safetyLevel = classifyPropertySafety(propName, propType);
            var propertyAnalysis = {
                name: propName,
                type: propType,
                path: itemPath + '.' + propName,
                isLikelyCollection: isLikelyCollection(propName, propType)
            };
            
            // Categorize by safety
            if (analysis.propertyCategories[safetyLevel]) {
                analysis.propertyCategories[safetyLevel].push(propertyAnalysis);
            }
            
            // Count specific types
            if (propType === 'function') {
                analysis.methodCount++;
            } else if (propType === 'object') {
                analysis.objectCount++;
                
                // Check if it's a potential collection
                if (propertyAnalysis.isLikelyCollection) {
                    analysis.potentialCollections.push(propertyAnalysis);
                }
            }
            
            // Generate access pattern
            if (safetyLevel === 'safe' || safetyLevel === 'moderate') {
                analysis.accessPatterns.push({
                    pattern: 'item.' + propName,
                    description: 'Access ' + propName + ' (' + propType + ')',
                    safetyLevel: safetyLevel
                });
            }
        }
        
        analysis.analysisTime = new Date().getTime() - analysis.analysisTime;
        return analysis;
        
    } catch (exc) {
        return null;
    }
}

/**
 * Analyze common patterns with deep analysis
 * @param {Array} samplingData - Array of sampling results
 * @param {Object} config - Configuration
 * @returns {Object} Pattern analysis with enhanced findings
 */
function analyzeCommonPatterns(samplingData, config) {
    try {
        var patterns = {
            commonProperties: {},
            commonTypes: {},
            safetyDistribution: {
                safe: 0,
                moderate: 0,
                risky: 0,
                dangerous: 0
            },
            accessRecommendations: [],
            collectionPatterns: []
        };
        
        if (!samplingData || samplingData.length === 0) {
            return patterns;
        }
        
        // Analyze common properties across all samples
        for (var i = 0; i < samplingData.length; i++) {
            var sample = samplingData[i];
            
            if (sample.properties) {
                for (var j = 0; j < sample.properties.length; j++) {
                    var prop = sample.properties[j];
                    
                    // Count property occurrences
                    if (!patterns.commonProperties[prop.name]) {
                        patterns.commonProperties[prop.name] = {
                            count: 0,
                            types: {},
                            safetyLevels: {},
                            examples: []
                        };
                    }
                    
                    patterns.commonProperties[prop.name].count++;
                    patterns.commonProperties[prop.name].types[prop.type] = 
                        (patterns.commonProperties[prop.name].types[prop.type] || 0) + 1;
                    patterns.commonProperties[prop.name].safetyLevels[prop.safetyLevel] = 
                        (patterns.commonProperties[prop.name].safetyLevels[prop.safetyLevel] || 0) + 1;
                    
                    if (patterns.commonProperties[prop.name].examples.length < 3) {
                        patterns.commonProperties[prop.name].examples.push(prop.path);
                    }
                    
                    // Count safety distribution
                    if (patterns.safetyDistribution[prop.safetyLevel] !== undefined) {
                        patterns.safetyDistribution[prop.safetyLevel]++;
                    }
                }
            }
        }
        
        // Generate access recommendations based on common safe properties
        for (var propName in patterns.commonProperties) {
            var propData = patterns.commonProperties[propName];
            var totalSamples = samplingData.length;
            var occurrence = propData.count / totalSamples;
            
            // Recommend properties that appear in most samples and are safe
            if (occurrence > 0.5 && propData.safetyLevels.safe > 0) {
                patterns.accessRecommendations.push({
                    property: propName,
                    occurrence: Math.round(occurrence * 100) + '%',
                    primaryType: getMostCommonType(propData.types),
                    recommendation: 'Safe to access in iteration loops',
                    example: 'for (var i = 0; i < collection.length; i++) { var value = collection[i].' + propName + '; }'
                });
            }
        }
        
        return patterns;
        
    } catch (exc) {
        return {
            commonProperties: {},
            commonTypes: {},
            safetyDistribution: { safe: 0, moderate: 0, risky: 0, dangerous: 0 },
            accessRecommendations: [],
            collectionPatterns: []
        };
    }
}

// =============================================================================
// CROSS-COLLECTION TRACKING
// =============================================================================

/**
 * Initialize cross-collection object tracking
 * @param {Object} domStructure - DOM structure
 * @param {Object} registry - Cross-collection registry to initialize
 */
function initializeCrossCollectionTracking(domStructure, registry) {
    try {
        registry.objects = {};
        registry.statistics = {
            totalTracked: 0,
            crossCollectionObjects: 0,
            lastUpdate: getCurrentTimestamp()
        };
        
        if (!domStructure.metadata.crossCollectionTracking) {
            domStructure.metadata.crossCollectionTracking = {
                enabled: true,
                startTime: getCurrentTimestamp()
            };
        }
        
    } catch (exc) {
        // Silent initialization failure
    }
}

/**
 * Track object across collections
 * @param {Object} registry - Cross-collection registry
 * @param {String} objectId - Object ID
 * @param {String} accessPath - Access path
 * @param {Object} objectRef - Object reference
 */
function trackCrossCollectionObject(registry, objectId, accessPath, objectRef) {
    try {
        if (!registry.objects[objectId]) {
            registry.objects[objectId] = {
                object: objectRef,
                accessPaths: [accessPath],
                collections: [],
                firstSeen: getCurrentTimestamp()
            };
            registry.statistics.totalTracked++;
        } else {
            registry.objects[objectId].accessPaths.push(accessPath);
            registry.statistics.crossCollectionObjects++;
        }
        
        registry.statistics.lastUpdate = getCurrentTimestamp();
        
    } catch (exc) {
        // Silent tracking failure
    }
}

/**
 * Perform cross-collection analysis
 * @param {Object} domStructure - DOM structure
 * @param {Object} registry - Cross-collection registry
 * @param {Object} stats - Sampling statistics to update
 */
function performCrossCollectionAnalysis(domStructure, registry, stats) {
    try {
        stats.crossCollectionObjectsFound = registry.statistics.crossCollectionObjects;
        
        if (!domStructure.metadata.crossCollectionTracking) {
            return;
        }
        
        domStructure.metadata.crossCollectionTracking.completed = true;
        domStructure.metadata.crossCollectionTracking.endTime = getCurrentTimestamp();
        domStructure.metadata.crossCollectionTracking.objectsFound = registry.statistics.crossCollectionObjects;
        
    } catch (exc) {
        // Silent analysis failure
    }
}

// =============================================================================
// COLLECTION DISCOVERY
// =============================================================================

/**
 * Find all collections in DOM structure
 * @param {Object} domStructure - DOM structure to search
 * @returns {Array} Array of discovered collections
 */
function findAllCollections(domStructure) {
    var collections = [];
    
    try {
        if (domStructure && domStructure.structure && domStructure.structure.document) {
            findCollectionsInNode(domStructure.structure.document, collections);
        }
        
        return collections;
        
    } catch (exc) {
        return [];
    }
}

/**
 * Recursively find collections in a DOM node
 * @param {Object} node - DOM node to search
 * @param {Array} collections - Array to populate with found collections
 */
function findCollectionsInNode(node, collections) {
    try {
        if (!node) {
            return;
        }
        
        // Add collections from this node
        if (node.collections && node.collections.length) {
            for (var i = 0; i < node.collections.length; i++) {
                collections.push(node.collections[i]);
            }
        }
        
        // Recursively search child nodes
        if (node.childNodes && node.childNodes.length) {
            for (var j = 0; j < node.childNodes.length; j++) {
                findCollectionsInNode(node.childNodes[j], collections);
            }
        }
        
    } catch (exc) {
        // Continue searching even if individual node fails
    }
}

/**
 * Check if collection should be sampled
 * @param {Object} collection - Collection to check
 * @param {Object} config - Configuration
 * @returns {Boolean} True if collection should be sampled
 */
function meetsDiscoveryFirstCriteria(collection, config) {
    try {
        if (!collection || !collection.path) {
            return false;
        }
        
        // Skip dangerous collections
        if (collection.safetyLevel === 'dangerous') {
            return false;
        }
        
        // Skip collections that are likely too large or complex
        if (collection.path.indexOf('constructor') !== -1 || 
            collection.path.indexOf('prototype') !== -1) {
            return false;
        }
        
        return true;
        
    } catch (exc) {
        return false;
    }
}

// =============================================================================
// SAFETY AND CONFIGURATION
// =============================================================================

/**
 * Get safety-adjusted configuration
 * @param {Object} collection - Collection being sampled
 * @param {Object} baseConfig - Base configuration
 * @returns {Object} Adjusted configuration based on safety level
 */
function getSafetyAdjustedConfig(collection, baseConfig) {
    try {
        var adjustedConfig = {};
        
        // Copy base config
        for (var key in baseConfig) {
            adjustedConfig[key] = baseConfig[key];
        }
        
        // Adjust based on safety level
        if (collection.safetyLevel === 'risky') {
            adjustedConfig.maxSamplesPerCollection = Math.max(1, Math.floor(baseConfig.maxSamplesPerCollection / 2));
            adjustedConfig.timeoutPerItem = Math.floor(baseConfig.timeoutPerItem / 2);
            adjustedConfig.maxItemPropertiesPerSample = Math.floor(baseConfig.maxItemPropertiesPerSample / 2);
        } else if (collection.safetyLevel === 'dangerous') {
            adjustedConfig.maxSamplesPerCollection = 1;
            adjustedConfig.timeoutPerItem = Math.floor(baseConfig.timeoutPerItem / 4);
            adjustedConfig.maxItemPropertiesPerSample = Math.floor(baseConfig.maxItemPropertiesPerSample / 4);
        }
        
        return adjustedConfig;
        
    } catch (exc) {
        return baseConfig;
    }
}

/**
 * Safely get object reference from path
 * @param {Object} sourceObj - Source object
 * @param {String} path - Dot notation path
 * @param {Number} timeoutMs - Timeout in milliseconds
 * @returns {Object} Result with success, value, and error
 */
function safeGetObjectFromPath(sourceObj, path, timeoutMs) {
    var result = {
        success: false,
        value: null,
        error: ''
    };
    
    try {
        if (!sourceObj || !path) {
            result.error = 'Invalid source object or path';
            return result;
        }
        
        var timeoutChecker = createTimeoutChecker(timeoutMs);
        var pathComponents = splitPath(path);
        var currentObj = sourceObj;
        
        for (var i = 0; i < pathComponents.length; i++) {
            if (timeoutChecker && timeoutChecker()) {
                result.error = 'Timeout accessing path';
                return result;
            }
            
            var component = pathComponents[i];
            
            if (!safeHasProperty(currentObj, component)) {
                result.error = 'Property not found: ' + component;
                return result;
            }
            
            try {
                currentObj = currentObj[component];
            } catch (exc) {
                result.error = 'Error accessing property: ' + component;
                return result;
            }
            
            if (!currentObj) {
                result.error = 'Null object at: ' + component;
                return result;
            }
        }
        
        result.success = true;
        result.value = currentObj;
        return result;
        
    } catch (exc) {
        result.error = 'Path access error: ' + exc.message;
        return result;
    }
}

// =============================================================================
// STATISTICS AND RESULTS
// =============================================================================

/**
 * Get collection sampling statistics
 * @param {Object} domStructure - DOM structure with sampling data
 * @returns {Object} Statistics with cross-collection data
 */
function getCollectionSamplingStatistics(domStructure) {
    try {
        var stats = {
            samplingEnabled: false,
            collectionsFound: 0,
            collectionsSampled: 0,
            totalItemsSampled: 0,
            samplingTime: 0,
            crossCollectionObjects: 0
        };
        
        if (domStructure && 
            domStructure.metadata && 
            domStructure.metadata.collectionSampling) {
            
            var samplingMeta = domStructure.metadata.collectionSampling;
            stats.samplingEnabled = samplingMeta.enabled || false;
            
            if (samplingMeta.statistics) {
                stats.collectionsFound = samplingMeta.statistics.collectionsFound || 0;
                stats.collectionsSampled = samplingMeta.statistics.collectionsSampled || 0;
                stats.totalItemsSampled = samplingMeta.statistics.totalItemsSampled || 0;
                stats.crossCollectionObjects = samplingMeta.statistics.crossCollectionObjectsFound || 0;
            }
            
            stats.samplingTime = samplingMeta.samplingTime || 0;
        }
        
        return stats;
        
    } catch (exc) {
        return {
            samplingEnabled: false,
            collectionsFound: 0,
            collectionsSampled: 0,
            totalItemsSampled: 0,
            samplingTime: 0,
            crossCollectionObjects: 0
        };
    }
}

/**
 * Enhance collection with sampling data
 * @param {Object} collection - Collection property to enhance
 * @param {Object} samplingData - Sampling result data
 */
function enhanceCollectionWithSamplingData(collection, samplingData) {
    try {
        if (!collection || !samplingData) {
            return;
        }
        
        collection.samplingData = {
            itemsSampled: samplingData.itemsSampled,
            deepAnalysisPerformed: samplingData.deepAnalysisCount > 0,
            samplingTimestamp: getCurrentTimestamp(),
            samples: samplingData.samplingData
        };
        
        // Add common patterns if enough samples
        if (samplingData.samplingData && samplingData.samplingData.length > 1) {
            collection.samplingData.patterns = analyzeCommonPatterns(samplingData.samplingData, DEFAULT_COLLECTION_SAMPLING_CONFIG);
        }
        
    } catch (exc) {
        // Silent enhancement failure
    }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get most common type from type counts
 * @param {Object} typeCounts - Object with type counts
 * @returns {String} Most common type
 */
function getMostCommonType(typeCounts) {
    try {
        var maxCount = 0;
        var mostCommon = 'unknown';
        
        for (var type in typeCounts) {
            if (typeCounts[type] > maxCount) {
                maxCount = typeCounts[type];
                mostCommon = type;
            }
        }
        
        return mostCommon;
        
    } catch (exc) {
        return 'unknown';
    }
}

// =============================================================================
// END OF 3.0_collection-sampler.jsx
// =============================================================================