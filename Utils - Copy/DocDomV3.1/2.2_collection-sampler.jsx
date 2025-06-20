// =============================================================================
// 2.2_collection-sampler.jsx - COLLECTION CONTENT SAMPLING
// InDesign DOM Discovery Builder v3.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: Deep collection content sampling with object reference tracking
// DEPENDENCIES: ["1.1_bootstrap-foundation.jsx", "1.2_safety-utilities.jsx", "2.1_dom-enumerator.jsx"]
// SIZE: ~913 lines - COMPLETE IMPLEMENTATION
// =============================================================================

// =============================================================================
// DEPENDENCY VALIDATION
// =============================================================================

var COLLECTION_SAMPLER_DEPENDENCIES = ['1.1_bootstrap-foundation', '1.2_safety-utilities', '2.1_dom-enumerator'];
var dependencyCheck = validateDependencies(COLLECTION_SAMPLER_DEPENDENCIES);
if (!dependencyCheck.success) {
    throw new Error('Collection Sampler missing dependencies: ' + dependencyCheck.missing.join(', '));
}

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
    propertyAnalysisDepth: 2,
    enableProgressReporting: false,
    enableDetailedLogging: false
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
    var config = samplingConfig ? 
        objectMerge(DEFAULT_COLLECTION_SAMPLING_CONFIG, samplingConfig) : 
        objectClone(DEFAULT_COLLECTION_SAMPLING_CONFIG, 2);
    
    try {
        if (!domStructure || !sourceDocument) {
            throw new Error('Invalid parameters for collection sampling');
        }
        
        // Initialize sampling metadata
        if (!domStructure.metadata) {
            domStructure.metadata = {};
        }
        
        domStructure.metadata.collectionSampling = {
            enabled: true,
            startTime: getCurrentTimestamp(),
            configuration: config,
            completed: false
        };
        
        // Initialize sampling statistics
        var samplingStats = {
            collectionsFound: 0,
            collectionsSampled: 0,
            totalItemsSampled: 0,
            deepAnalysisPerformed: 0,
            propertiesAnalyzed: 0,
            crossCollectionObjectsFound: 0,
            samplingErrors: 0,
            timeouts: 0
        };
        
        // Initialize cross-collection tracking
        var crossCollectionRegistry = null;
        if (config.enableCrossCollectionTracking) {
            crossCollectionRegistry = initializeCrossCollectionTracking();
        }
        
        // Find and sample collections
        if (domStructure.structure && domStructure.structure.document) {
            sampleNodeCollections(
                domStructure.structure.document,
                sourceDocument,
                config,
                samplingStats,
                crossCollectionRegistry
            );
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
 * Sample collections in DOM node recursively
 * @param {Object} domNode - DOM node to process
 * @param {Object} sourceDocument - Source document
 * @param {Object} config - Sampling configuration
 * @param {Object} samplingStats - Statistics tracker
 * @param {Object} crossCollectionRegistry - Cross-collection registry
 */
function sampleNodeCollections(domNode, sourceDocument, config, samplingStats, crossCollectionRegistry) {
    try {
        if (!domNode) return;
        
        // Sample collections in this node
        if (domNode.collections && domNode.collections.length > 0) {
            for (var i = 0; i < domNode.collections.length; i++) {
                var collection = domNode.collections[i];
                samplingStats.collectionsFound++;
                
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
        
        // Process child nodes recursively
        if (domNode.childNodes && domNode.childNodes.length > 0) {
            for (var j = 0; j < domNode.childNodes.length; j++) {
                sampleNodeCollections(
                    domNode.childNodes[j],
                    sourceDocument,
                    config,
                    samplingStats,
                    crossCollectionRegistry
                );
            }
        }
        
    } catch (exc) {
        samplingStats.samplingErrors++;
    }
}

/**
 * Sample single collection with deep analysis
 * @param {Object} collection - Collection property to sample
 * @param {Object} sourceDocument - Source document
 * @param {Object} config - Sampling configuration
 * @param {Object} samplingStats - Sampling statistics to update
 * @param {Object} crossCollectionRegistry - Cross-collection tracking registry
 * @returns {Object} Sampling result
 */
function sampleSingleCollection(collection, sourceDocument, config, samplingStats, crossCollectionRegistry) {
    var result = {
        success: false,
        itemsSampled: 0,
        deepAnalysisCount: 0,
        sampleData: [],
        error: null
    };
    
    try {
        // Access collection safely
        var collectionAccess = accessCollectionSafely(collection, sourceDocument, config);
        if (!collectionAccess.success) {
            result.error = collectionAccess.error;
            return result;
        }
        
        var collectionObject = collectionAccess.collection;
        var collectionStructure = analyzeCollectionStructure(collectionObject, config);
        
        if (!collectionStructure.isCollection || collectionStructure.size === 0) {
            result.success = true; // Empty collection is still success
            return result;
        }
        
        // Sample items from collection
        var samplesToTake = Math.min(
            config.maxSamplesPerCollection, 
            collectionStructure.size,
            config.maxCollectionSize
        );
        
        var timeoutChecker = createTimeoutChecker(config.timeoutPerCollection);
        
        for (var i = 0; i < samplesToTake; i++) {
            if (timeoutChecker && timeoutChecker()) {
                samplingStats.timeouts++;
                break;
            }
            
            var itemResult = sampleCollectionItem(
                collectionObject,
                i,
                collection.path + '[' + i + ']',
                config,
                crossCollectionRegistry
            );
            
            if (itemResult.success) {
                result.sampleData[result.sampleData.length] = itemResult.itemData;
                result.itemsSampled++;
                
                if (itemResult.deepAnalysisPerformed) {
                    result.deepAnalysisCount++;
                }
                
                samplingStats.propertiesAnalyzed += itemResult.propertiesAnalyzed || 0;
            }
        }
        
        result.success = true;
        return result;
        
    } catch (exc) {
        result.error = 'Collection sampling failed: ' + exc.message;
        return result;
    }
}

/**
 * Sample individual item from collection
 * @param {Object} collectionObject - Collection to sample from
 * @param {Number} index - Item index
 * @param {String} itemPath - Item path
 * @param {Object} config - Configuration
 * @param {Object} crossCollectionRegistry - Cross-collection registry
 * @returns {Object} Item sampling result
 */
function sampleCollectionItem(collectionObject, index, itemPath, config, crossCollectionRegistry) {
    var result = {
        success: false,
        itemData: null,
        deepAnalysisPerformed: false,
        propertiesAnalyzed: 0,
        error: null
    };
    
    try {
        // Access item safely
        var item = null;
        try {
            item = collectionObject[index];
        } catch (accessExc) {
            result.error = 'Item access failed: ' + accessExc.message;
            return result;
        }
        
        if (!item) {
            result.error = 'Item is null or undefined';
            return result;
        }
        
        // Create item data structure
        var itemData = {
            index: index,
            path: itemPath,
            type: typeof item,
            accessible: true,
            timestamp: getCurrentTimestamp()
        };
        
        // Cross-collection tracking
        if (crossCollectionRegistry && typeof item === 'object') {
            trackCrossCollectionObject(item, itemPath, crossCollectionRegistry);
        }
        
        // Perform deep property analysis if enabled
        if (config.enableDeepPropertyAnalysis) {
            var propertyAnalysis = analyzeItemProperties(item, itemPath, config);
            if (propertyAnalysis.success) {
                itemData.propertyAnalysis = propertyAnalysis.analysis;
                result.deepAnalysisPerformed = true;
                result.propertiesAnalyzed = propertyAnalysis.propertiesAnalyzed;
            }
        }
        
        // Add basic item information
        if (typeof item === 'object') {
            try {
                if (item.constructor && item.constructor.name) {
                    itemData.constructorName = item.constructor.name;
                }
                
                if (typeof item.length === 'number') {
                    itemData.length = item.length;
                }
                
                if (typeof item.name === 'string') {
                    itemData.name = item.name;
                }
                
            } catch (infoExc) {
                // Continue without detailed info
            }
        } else {
            itemData.value = formatPrimitiveValue(item);
        }
        
        result.itemData = itemData;
        result.success = true;
        return result;
        
    } catch (exc) {
        result.error = 'Item sampling failed: ' + exc.message;
        return result;
    }
}

/**
 * Analyze properties of collection item
 * @param {Object} item - Collection item to analyze
 * @param {String} itemPath - Item path
 * @param {Object} config - Configuration
 * @returns {Object} Property analysis result
 */
function analyzeItemProperties(item, itemPath, config) {
    var result = {
        success: false,
        analysis: null,
        propertiesAnalyzed: 0,
        error: null
    };
    
    try {
        if (!item || typeof item !== 'object') {
            result.success = true;
            result.analysis = { type: 'primitive', value: formatPrimitiveValue(item) };
            return result;
        }
        
        var analysis = {
            propertyTypes: {},
            propertyCount: 0,
            safeProperties: [],
            dangerousProperties: [],
            collectionProperties: [],
            methodProperties: []
        };
        
        var propertiesProcessed = 0;
        var maxProperties = config.maxItemPropertiesPerSample || 100;
        
        for (var propName in item) {
            try {
                if (propertiesProcessed >= maxProperties) break;
                
                if (objectHasOwnProperty(item, propName)) {
                    var propType = safeTypeCheck(item, propName);
                    var propPath = itemPath + '.' + propName;
                    
                    // Count property types
                    if (analysis.propertyTypes[propType]) {
                        analysis.propertyTypes[propType]++;
                    } else {
                        analysis.propertyTypes[propType] = 1;
                    }
                    
                    analysis.propertyCount++;
                    propertiesProcessed++;
                    
                    // Categorize properties
                    var safetyLevel = getPropertySafetyLevel(propName);
                    
                    var propInfo = {
                        name: propName,
                        type: propType,
                        path: propPath,
                        safetyLevel: safetyLevel
                    };
                    
                    if (safetyLevel === 'dangerous') {
                        analysis.dangerousProperties[analysis.dangerousProperties.length] = propInfo;
                    } else if (propType === 'function') {
                        analysis.methodProperties[analysis.methodProperties.length] = propInfo;
                    } else if (isLikelyCollection(propName)) {
                        analysis.collectionProperties[analysis.collectionProperties.length] = propInfo;
                    } else {
                        analysis.safeProperties[analysis.safeProperties.length] = propInfo;
                    }
                }
            } catch (propExc) {
                // Continue processing other properties
            }
        }
        
        result.analysis = analysis;
        result.propertiesAnalyzed = propertiesProcessed;
        result.success = true;
        return result;
        
    } catch (exc) {
        result.error = 'Property analysis failed: ' + exc.message;
        return result;
    }
}

// =============================================================================
// STRUCTURE ANALYSIS
// =============================================================================

/**
 * Analyze collection structure and characteristics
 * @param {Object} collectionObject - Collection to analyze
 * @param {Object} config - Configuration
 * @returns {Object} Structure analysis result
 */
function analyzeCollectionStructure(collectionObject, config) {
    var analysis = {
        isCollection: false,
        type: 'unknown',
        size: 0,
        hasLength: false,
        hasCount: false,
        isEmpty: true,
        accessible: false
    };
    
    try {
        if (!collectionObject) {
            return analysis;
        }
        
        analysis.accessible = true;
        
        // Check for length property
        if (typeof collectionObject.length === 'number') {
            analysis.hasLength = true;
            analysis.size = collectionObject.length;
            analysis.isCollection = true;
            analysis.type = 'array-like';
        }
        
        // Check for count property
        if (typeof collectionObject.count === 'number') {
            analysis.hasCount = true;
            if (!analysis.hasLength) {
                analysis.size = collectionObject.count;
                analysis.isCollection = true;
                analysis.type = 'count-based';
            }
        }
        
        // Determine if empty
        analysis.isEmpty = (analysis.size === 0);
        
        // Additional type detection
        if (analysis.isCollection && collectionObject.constructor) {
            var constructorName = collectionObject.constructor.name;
            if (constructorName) {
                analysis.type = constructorName.toLowerCase();
            }
        }
        
        return analysis;
        
    } catch (exc) {
        analysis.accessible = false;
        analysis.error = exc.message;
        return analysis;
    }
}

/**
 * Access collection object safely
 * @param {Object} collection - Collection property info
 * @param {Object} sourceDocument - Source document
 * @param {Object} config - Configuration
 * @returns {Object} Collection access result
 */
function accessCollectionSafely(collection, sourceDocument, config) {
    var result = {
        success: false,
        collection: null,
        error: null
    };
    
    try {
        // Use safe object path access
        var pathAccess = safeGetObjectFromPath(sourceDocument, collection.path, config.timeoutPerCollection);
        
        if (!pathAccess.success) {
            result.error = 'Path access failed: ' + (pathAccess.error || 'Unknown error');
            return result;
        }
        
        if (!pathAccess.value) {
            result.error = 'Collection object is null or undefined';
            return result;
        }
        
        result.collection = pathAccess.value;
        result.success = true;
        return result;
        
    } catch (exc) {
        result.error = 'Collection access failed: ' + exc.message;
        return result;
    }
}

// =============================================================================
// CONTENT ANALYSIS
// =============================================================================

/**
 * Format primitive value for display
 * @param {*} value - Primitive value to format
 * @returns {String} Formatted value string
 */
function formatPrimitiveValue(value) {
    try {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        
        var valueType = typeof value;
        
        if (valueType === 'string') {
            return '"' + value + '"';
        } else if (valueType === 'number') {
            return String(value);
        } else if (valueType === 'boolean') {
            return String(value);
        } else {
            return '[' + valueType + ']';
        }
        
    } catch (exc) {
        return '[format error]';
    }
}

/**
 * Generate preview of collection content
 * @param {Object} collectionObject - Collection to preview
 * @param {Number} maxItems - Maximum items to include
 * @returns {String} Collection preview
 */
function generateCollectionPreview(collectionObject, maxItems) {
    try {
        if (!collectionObject) {
            return '[null collection]';
        }
        
        var maxPreviewItems = maxItems || 3;
        var preview = '[';
        var itemCount = 0;
        var totalItems = 0;
        
        // Determine total items
        if (typeof collectionObject.length === 'number') {
            totalItems = collectionObject.length;
        } else if (typeof collectionObject.count === 'number') {
            totalItems = collectionObject.count;
        }
        
        if (totalItems === 0) {
            return '[empty]';
        }
        
        // Generate preview of first few items
        for (var i = 0; i < Math.min(maxPreviewItems, totalItems); i++) {
            try {
                var item = collectionObject[i];
                
                if (itemCount > 0) preview += ', ';
                
                if (item === null) {
                    preview += 'null';
                } else if (item === undefined) {
                    preview += 'undefined';
                } else if (typeof item === 'object') {
                    preview += generateObjectPreview(item);
                } else {
                    preview += formatPrimitiveValue(item);
                }
                
                itemCount++;
                
            } catch (itemExc) {
                if (itemCount > 0) preview += ', ';
                preview += '[access error]';
                itemCount++;
            }
        }
        
        if (totalItems > maxPreviewItems) {
            preview += ', ... +' + (totalItems - maxPreviewItems) + ' more';
        }
        
        preview += ']';
        return preview;
        
    } catch (exc) {
        return '[preview error]';
    }
}

/**
 * Generate preview of object content
 * @param {Object} targetObject - Object to preview
 * @returns {String} Object preview
 */
function generateObjectPreview(targetObject) {
    try {
        if (!targetObject || typeof targetObject !== 'object') {
            return '[not object]';
        }
        
        var preview = '{';
        var constructorName = 'Object';
        
        try {
            if (targetObject.constructor && targetObject.constructor.name) {
                constructorName = targetObject.constructor.name;
            }
        } catch (constructorExc) {
            // Use default name
        }
        
        preview += constructorName;
        
        // Add useful properties if available
        try {
            if (typeof targetObject.name === 'string') {
                preview += ' name="' + targetObject.name + '"';
            } else if (typeof targetObject.length === 'number') {
                preview += ' length=' + targetObject.length;
            } else if (typeof targetObject.count === 'number') {
                preview += ' count=' + targetObject.count;
            }
        } catch (propExc) {
            // Continue without additional info
        }
        
        preview += '}';
        return preview;
        
    } catch (exc) {
        return '[object preview error]';
    }
}

/**
 * Merge property summary data
 * @param {Object} target - Target summary to merge into
 * @param {Object} source - Source summary to merge from
 */
function mergePropertySummary(target, source) {
    try {
        if (!target || !source) return;
        
        // Merge property types
        if (source.propertyTypes) {
            for (var propType in source.propertyTypes) {
                if (objectHasOwnProperty(source.propertyTypes, propType)) {
                    if (target[propType]) {
                        target[propType] += source.propertyTypes[propType];
                    } else {
                        target[propType] = source.propertyTypes[propType];
                    }
                }
            }
        }
        
    } catch (exc) {
        // Silent merge failure
    }
}

/**
 * Generate collection content summary
 * @param {Array} sampleItems - Array of sampled items
 * @returns {Object} Content summary
 */
function generateCollectionContentSummary(sampleItems) {
    try {
        var summary = {
            totalSamples: sampleItems ? sampleItems.length : 0,
            itemTypes: {},
            hasErrors: false,
            accessibleItems: 0,
            commonProperties: {}
        };
        
        if (!sampleItems || sampleItems.length === 0) {
            return summary;
        }
        
        // Analyze sample items
        for (var i = 0; i < sampleItems.length; i++) {
            var item = sampleItems[i];
            
            if (item.accessible !== false) {
                summary.accessibleItems++;
            }
            
            if (item.error || item.samplingError || item.accessError) {
                summary.hasErrors = true;
            }
            
            if (item.type) {
                if (!summary.itemTypes[item.type]) {
                    summary.itemTypes[item.type] = 0;
                }
                summary.itemTypes[item.type]++;
            }
            
            // Collect common properties
            if (item.propertyAnalysis && item.propertyAnalysis.propertyTypes) {
                mergePropertySummary(summary.commonProperties, item.propertyAnalysis);
            }
        }
        
        return summary;
        
    } catch (exc) {
        return {
            totalSamples: 0,
            itemTypes: {},
            hasErrors: true,
            error: exc.message
        };
    }
}

// =============================================================================
// CROSS-COLLECTION TRACKING
// =============================================================================

/**
 * Initialize cross-collection tracking registry
 * @returns {Object} Cross-collection registry
 */
function initializeCrossCollectionTracking() {
    try {
        return {
            objects: {},
            statistics: {
                totalTracked: 0,
                crossCollectionObjects: 0,
                lastUpdate: getCurrentTimestamp()
            }
        };
    } catch (exc) {
        return {
            objects: {},
            statistics: {
                totalTracked: 0,
                crossCollectionObjects: 0,
                lastUpdate: getCurrentTimestamp(),
                error: exc.message
            }
        };
    }
}

/**
 * Track object across collections
 * @param {Object} targetObject - Object to track
 * @param {String} accessPath - Access path
 * @param {Object} registry - Cross-collection registry
 */
function trackCrossCollectionObject(targetObject, accessPath, registry) {
    try {
        if (!targetObject || !registry) return;
        
        var objectId = generateObjectReferenceID(targetObject, accessPath);
        
        if (registry.objects[objectId]) {
            // Object already tracked - add access path
            registry.objects[objectId].accessPaths[registry.objects[objectId].accessPaths.length] = accessPath;
            registry.statistics.crossCollectionObjects++;
        } else {
            // New object - track it
            registry.objects[objectId] = {
                object: targetObject,
                accessPaths: [accessPath],
                firstSeen: getCurrentTimestamp()
            };
            registry.statistics.totalTracked++;
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
 * @param {Object} statistics - Sampling statistics to update
 */
function performCrossCollectionAnalysis(domStructure, registry, statistics) {
    try {
        statistics.crossCollectionObjectsFound = registry.statistics.crossCollectionObjects;
        
        if (!domStructure.metadata.crossCollectionTracking) {
            domStructure.metadata.crossCollectionTracking = {};
        }
        
        domStructure.metadata.crossCollectionTracking.completed = true;
        domStructure.metadata.crossCollectionTracking.endTime = getCurrentTimestamp();
        domStructure.metadata.crossCollectionTracking.objectsFound = registry.statistics.crossCollectionObjects;
        
    } catch (exc) {
        // Silent analysis failure
    }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Enhance collection with sampling data
 * @param {Object} collection - Collection property to enhance
 * @param {Object} samplingResult - Sampling result data
 */
function enhanceCollectionWithSamplingData(collection, samplingResult) {
    try {
        if (!collection || !samplingResult) return;
        
        collection.samplingMetadata = {
            sampled: true,
            samplingTimestamp: getCurrentTimestamp(),
            itemsSampled: samplingResult.itemsSampled,
            deepAnalysisPerformed: samplingResult.deepAnalysisCount > 0,
            sampleData: samplingResult.sampleData,
            contentSummary: generateCollectionContentSummary(samplingResult.sampleData)
        };
        
        if (samplingResult.sampleData && samplingResult.sampleData.length > 0) {
            collection.samplingMetadata.preview = generateCollectionPreview(
                samplingResult.sampleData, 
                Math.min(3, samplingResult.sampleData.length)
            );
        }
        
    } catch (exc) {
        // Silent enhancement failure
    }
}

// =============================================================================
// MODULE REGISTRATION
// =============================================================================

// Register this module with all its functions
registerModule('2.2_collection-sampler', '3.1', [
    // Main Functions
    'sampleCollectionContents', 'sampleNodeCollections', 'sampleSingleCollection',
    
    // Item Sampling
    'sampleCollectionItem', 'analyzeItemProperties',
    
    // Structure Analysis
    'analyzeCollectionStructure', 'accessCollectionSafely',
    
    // Content Analysis
    'formatPrimitiveValue', 'generateCollectionPreview', 'generateObjectPreview',
    'mergePropertySummary', 'generateCollectionContentSummary',
    
    // Cross-Collection Tracking
    'initializeCrossCollectionTracking', 'trackCrossCollectionObject', 'performCrossCollectionAnalysis',
    
    // Helper Functions
    'enhanceCollectionWithSamplingData'
]);

// =============================================================================
// END OF 2.2_collection-sampler.jsx
// =============================================================================