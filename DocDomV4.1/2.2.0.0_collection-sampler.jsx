// DocDomV4.1/2.2_collection-sampler.jsx
// 2.2_collection-sampler.jsx - COLLECTION CONTENT SAMPLING
// InDesign DOM Discovery Builder v4.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: Deep collection content sampling with object reference tracking
// DEPENDENCIES: ["1.1_bootstrap-foundation.jsx", "1.2_safety-utilities.jsx", "2.1_dom-enumerator.jsx"]
// SIZE: ~1000 lines - COMPLETE IMPLEMENTATION - ENHANCED LOGGING - ES3 COMPLIANT
// CHANGES FROM 3.1: Fixed ES3 violations, enhanced logging, enhanced generateCollectionContentSummary
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
// MAIN COLLECTION SAMPLING FUNCTIONS - ENHANCED LOGGING
// =============================================================================

/**
 * Complete collection content sampling with deep analysis - ENHANCED LOGGING
 * @param {Object} domStructure - DOM structure with discovered collections
 * @param {Object} sourceDocument - Source document for collection access
 * @param {Object} samplingConfig - Sampling configuration
 * @returns {Object} DOM structure with deep collection analysis
 */
function sampleCollectionContents(domStructure, sourceDocument, samplingConfig) {
    var startTime = new Date().getTime();
    var config = samplingConfig ?
        objectMerge(DEFAULT_COLLECTION_SAMPLING_CONFIG, samplingConfig) :
        DEFAULT_COLLECTION_SAMPLING_CONFIG;

    logDebug('=== STARTING sampleCollectionContents ===', 'sampling');
    logInfo('Starting collection content sampling with maxSamples=' + config.maxSamplesPerCollection, 'sampling');

    try {
        if (!domStructure) {
            logError('No DOM structure provided for collection sampling', 'sampling');
            return createErrorResult('No DOM structure provided');
        }

        if (!sourceDocument) {
            logError('No source document provided for collection sampling', 'sampling');
            return createErrorResult('No source document provided');
        }

        logDebug('DOM structure and source document validated', 'sampling');

        // Initialize sampling statistics
        var samplingStats = {
            totalCollections: 0,
            collectionsProcessed: 0,
            totalItemsSampled: 0,
            deepAnalysisPerformed: 0,
            samplingErrors: 0,
            timeouts: 0,
            propertiesAnalyzed: 0
        };

        // Initialize cross-collection tracking if enabled
        var crossCollectionRegistry = null;
        if (config.enableCrossCollectionTracking) {
            logDebug('Initializing cross-collection tracking', 'sampling');
            crossCollectionRegistry = initializeCrossCollectionTracking();
            logInfo('Cross-collection tracking enabled', 'sampling');
        }

        // Clone the DOM structure to avoid modifying the original
        var workingStructure = objectClone(domStructure, 4);
        
        logDebug('Working structure created for collection sampling', 'sampling');

        // Sample collections in the structure
        if (workingStructure.structure && workingStructure.structure.document) {
            logDebug('Starting to sample node collections from document root', 'sampling');
            sampleNodeCollections(
                workingStructure.structure.document,
                sourceDocument,
                config,
                samplingStats,
                crossCollectionRegistry
            );
        } else {
            logWarn('No document structure found for collection sampling', 'sampling');
        }

        // Perform cross-collection analysis if enabled
        if (config.enableCrossCollectionTracking && crossCollectionRegistry) {
            logDebug('Performing cross-collection analysis', 'sampling');
            performCrossCollectionAnalysis(crossCollectionRegistry, workingStructure);
            logInfo('Cross-collection analysis completed', 'sampling');
        }

        // Update metadata
        if (!workingStructure.metadata) {
            workingStructure.metadata = {};
        }

        workingStructure.metadata.collectionSamplingTime = new Date().getTime() - startTime;
        workingStructure.metadata.samplingStats = objectClone(samplingStats, 2);
        workingStructure.metadata.currentPhase = 'collection-sampling-completed';
        workingStructure.metadata.builderVersion = '4.1';

        logInfo('Collection sampling completed in ' + workingStructure.metadata.collectionSamplingTime + 'ms', 'sampling');
        logInfo('Sampling results - Collections: ' + samplingStats.collectionsProcessed + 
               ', Items: ' + samplingStats.totalItemsSampled + 
               ', Errors: ' + samplingStats.samplingErrors, 'sampling');

        return workingStructure;

    } catch (exc) {
        var error = 'Collection content sampling failed: ' + exc.message;
        logError(error, 'sampling');
        return createErrorResult(error);
    }
}

/**
 * Sample collections in DOM node and its children - ENHANCED LOGGING
 * @param {Object} domNode - DOM node to process
 * @param {Object} sourceDocument - Source document
 * @param {Object} config - Sampling configuration
 * @param {Object} samplingStats - Sampling statistics to update
 * @param {Object} crossCollectionRegistry - Cross-collection tracking registry
 */
function sampleNodeCollections(domNode, sourceDocument, config, samplingStats, crossCollectionRegistry) {
    try {
        if (!domNode) {
            logDebug('Null DOM node encountered, skipping', 'sampling');
            return;
        }

        logDebug('Sampling collections in node: ' + (domNode.path || 'unknown'), 'sampling');

        // Process collections in this node
        if (domNode.collections && domNode.collections.length > 0) {
            logDebug('Found ' + domNode.collections.length + ' collections in node: ' + domNode.path, 'sampling');
            
            for (var i = 0; i < domNode.collections.length; i++) {
                var collection = domNode.collections[i];
                samplingStats.totalCollections++;

                logDebug('Processing collection: ' + collection.name + ' at path: ' + collection.path, 'sampling');

                var samplingResult = sampleSingleCollection(
                    collection,
                    sourceDocument,
                    config,
                    samplingStats,
                    crossCollectionRegistry
                );

                if (samplingResult.success) {
                    samplingStats.collectionsProcessed++;
                    samplingStats.totalItemsSampled += samplingResult.itemsSampled;
                    samplingStats.deepAnalysisPerformed += samplingResult.deepAnalysisCount;
                    
                    // Enhance collection with sampling data
                    enhanceCollectionWithSamplingData(collection, samplingResult);
                    
                    logInfo('Collection sampled successfully: ' + collection.name + 
                           ', items: ' + samplingResult.itemsSampled, 'sampling');
                } else {
                    samplingStats.samplingErrors++;
                    logWarn('Collection sampling failed: ' + collection.name + 
                           ', error: ' + (samplingResult.error || 'unknown'), 'sampling');
                }
            }
        }

        // Process child nodes recursively
        if (domNode.childNodes && domNode.childNodes.length > 0) {
            logDebug('Processing ' + domNode.childNodes.length + ' child nodes', 'sampling');
            
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
        logError('Node collection sampling error for node: ' + (domNode ? domNode.path : 'unknown') + ': ' + exc.message, 'sampling');
        samplingStats.samplingErrors++;
    }
}

/**
 * Sample single collection with deep analysis - ENHANCED LOGGING
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
        logDebug('Starting single collection sampling for: ' + collection.name, 'sampling');

        // Access collection safely
        var collectionAccess = accessCollectionSafely(collection, sourceDocument, config);
        if (!collectionAccess.success) {
            result.error = collectionAccess.error;
            logWarn('Collection access failed: ' + collection.name + ', error: ' + result.error, 'sampling');
            return result;
        }

        var collectionObject = collectionAccess.collection;
        var collectionStructure = analyzeCollectionStructure(collectionObject, config);

        logDebug('Collection structure analyzed - isCollection: ' + collectionStructure.isCollection + 
                ', size: ' + collectionStructure.size, 'sampling');

        if (!collectionStructure.isCollection || collectionStructure.size === 0) {
            result.success = true; // Empty collection is still success
            logDebug('Empty or non-collection object, marking as successful with no samples', 'sampling');
            return result;
        }

        // Sample items from collection
        var samplesToTake = Math.min(
            config.maxSamplesPerCollection,
            collectionStructure.size,
            config.maxCollectionSize
        );

        logInfo('Sampling ' + samplesToTake + ' items from collection: ' + collection.name + 
               ' (total size: ' + collectionStructure.size + ')', 'sampling');

        var timeoutChecker = createTimeoutChecker(config.timeoutPerCollection);

        for (var i = 0; i < samplesToTake; i++) {
            if (timeoutChecker && timeoutChecker.isExpired()) {
                samplingStats.timeouts++;
                logWarn('Collection sampling timeout reached for: ' + collection.name + ' at item ' + i, 'sampling');
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
                
                logDebug('Item ' + i + ' sampled successfully from collection: ' + collection.name, 'sampling');
            } else {
                logDebug('Item ' + i + ' sampling failed from collection: ' + collection.name + 
                        ', error: ' + (itemResult.error || 'unknown'), 'sampling');
            }
        }

        result.success = true;
        logInfo('Collection sampling completed for: ' + collection.name + 
               ', items sampled: ' + result.itemsSampled + 
               ', deep analysis count: ' + result.deepAnalysisCount, 'sampling');
        
        return result;

    } catch (exc) {
        result.error = 'Collection sampling failed: ' + exc.message;
        logError('Single collection sampling error for: ' + collection.name + ': ' + exc.message, 'sampling');
        return result;
    }
}

// =============================================================================
// ITEM SAMPLING FUNCTIONS - ENHANCED LOGGING
// =============================================================================

/**
 * Sample individual item from collection - ENHANCED LOGGING
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
        logDebug('Sampling collection item at index: ' + index + ', path: ' + itemPath, 'sampling');

        var timeoutChecker = createTimeoutChecker(config.timeoutPerItem);
        var item;

        // Access item safely
        try {
            if (typeof collectionObject.item === 'function') {
                item = collectionObject.item(index);
            } else if (collectionObject[index] !== undefined) {
                item = collectionObject[index];
            } else {
                result.error = 'Cannot access item at index ' + index;
                logWarn('Item access failed at index: ' + index + ', path: ' + itemPath, 'sampling');
                return result;
            }
        } catch (accessExc) {
            result.error = 'Item access exception: ' + accessExc.message;
            logWarn('Item access exception at index: ' + index + ': ' + accessExc.message, 'sampling');
            return result;
        }

        if (!item) {
            result.error = 'Item is null or undefined';
            logDebug('Item is null/undefined at index: ' + index, 'sampling');
            return result;
        }

        logDebug('Item accessed successfully at index: ' + index + ', type: ' + typeof item, 'sampling');

        // Create basic item data
        result.itemData = {
            index: index,
            path: itemPath,
            type: typeof item,
            value: null,
            properties: {},
            metadata: {
                sampled: getCurrentTimestamp(),
                builderVersion: '4.1'
            }
        };

        // Analyze item properties if it's an object
        if (item && typeof item === 'object') {
            if (config.enableDeepPropertyAnalysis) {
                logDebug('Performing deep property analysis for item at index: ' + index, 'sampling');
                
                var propertyAnalysis = analyzeItemProperties(
                    item,
                    itemPath,
                    config,
                    timeoutChecker
                );

                result.itemData.properties = propertyAnalysis.properties;
                result.propertiesAnalyzed = propertyAnalysis.propertiesAnalyzed;
                result.deepAnalysisPerformed = propertyAnalysis.deepAnalysisPerformed;

                logDebug('Property analysis completed for item ' + index + 
                        ', properties analyzed: ' + result.propertiesAnalyzed, 'sampling');
            }

            // Track cross-collection objects if enabled
            if (config.enableCrossCollectionTracking && crossCollectionRegistry) {
                trackCrossCollectionObject(item, itemPath, crossCollectionRegistry);
            }

            // Generate preview for complex objects
            result.itemData.value = generateObjectPreview(item);
            
        } else {
            // Simple value
            result.itemData.value = formatPrimitiveValue(item);
            logDebug('Primitive value sampled at index: ' + index + ', value: ' + result.itemData.value, 'sampling');
        }

        result.success = true;
        logDebug('Item sampling completed successfully for index: ' + index, 'sampling');
        return result;

    } catch (exc) {
        result.error = 'Item sampling failed: ' + exc.message;
        logError('Item sampling error at index: ' + index + ': ' + exc.message, 'sampling');
        return result;
    }
}

/**
 * Analyze item properties in depth - ENHANCED LOGGING
 * @param {Object} item - Item to analyze
 * @param {String} itemPath - Item path
 * @param {Object} config - Configuration
 * @param {Object} timeoutChecker - Timeout checker
 * @returns {Object} Property analysis result
 */
function analyzeItemProperties(item, itemPath, config, timeoutChecker) {
    var result = {
        properties: {},
        propertiesAnalyzed: 0,
        deepAnalysisPerformed: false
    };

    try {
        logDebug('Starting property analysis for item at path: ' + itemPath, 'sampling');

        var maxProperties = config.maxItemPropertiesPerSample || 100;
        var analysisDepth = config.propertyAnalysisDepth || 2;

        for (var propName in item) {
            if (objectHasOwnProperty(item, propName)) {
                if (result.propertiesAnalyzed >= maxProperties) {
                    logDebug('Max properties limit reached for item: ' + itemPath, 'sampling');
                    break;
                }

                if (timeoutChecker && timeoutChecker.isExpired()) {
                    logWarn('Property analysis timeout for item: ' + itemPath, 'sampling');
                    break;
                }

                try {
                    var propValue = item[propName];
                    var propType = typeof propValue;

                    result.properties[propName] = {
                        type: propType,
                        path: itemPath + '.' + propName
                    };

                    // Add sample value for primitives
                    if (propType === 'string' || propType === 'number' || propType === 'boolean') {
                        result.properties[propName].sampleValue = formatPrimitiveValue(propValue);
                    } else if (propValue && typeof propValue === 'object') {
                        result.properties[propName].preview = generateObjectPreview(propValue);
                        
                        // Deep analysis for nested objects (limited depth)
                        if (analysisDepth > 1) {
                            result.deepAnalysisPerformed = true;
                        }
                    }

                    result.propertiesAnalyzed++;

                } catch (propExc) {
                    logDebug('Property access failed for: ' + propName + ' in item: ' + itemPath, 'sampling');
                    result.properties[propName] = {
                        type: 'error',
                        error: propExc.message
                    };
                }
            }
        }

        logDebug('Property analysis completed for item: ' + itemPath + 
                ', properties analyzed: ' + result.propertiesAnalyzed, 'sampling');

        return result;

    } catch (exc) {
        logError('Property analysis failed for item: ' + itemPath + ': ' + exc.message, 'sampling');
        return result;
    }
}

// =============================================================================
// STRUCTURE ANALYSIS FUNCTIONS - ENHANCED LOGGING
// =============================================================================

/**
 * Analyze collection structure - ENHANCED LOGGING
 * @param {Object} collectionObject - Collection to analyze
 * @param {Object} config - Configuration
 * @returns {Object} Collection structure info
 */
function analyzeCollectionStructure(collectionObject, config) {
    try {
        logDebug('Analyzing collection structure, type: ' + typeof collectionObject, 'sampling');

        var structure = {
            isCollection: false,
            size: 0,
            accessMethod: 'unknown',
            hasIndexAccess: false,
            hasItemMethod: false,
            constructorName: 'Unknown'
        };

        if (!collectionObject || typeof collectionObject !== 'object') {
            logDebug('Object is not a valid collection (not an object)', 'sampling');
            return structure;
        }

        // Check for numeric length property
        if (typeof collectionObject.length === 'number') {
            structure.isCollection = true;
            structure.size = collectionObject.length;
            structure.accessMethod = 'length';
            logDebug('Collection detected via length property: ' + structure.size, 'sampling');
        }

        // Check for item method (InDesign collections)
        if (typeof collectionObject.item === 'function') {
            structure.hasItemMethod = true;
            if (!structure.isCollection) {
                structure.isCollection = true;
                structure.accessMethod = 'item';
                
                // Try to determine size for InDesign collections
                try {
                    if (typeof collectionObject.length === 'number') {
                        structure.size = collectionObject.length;
                    } else if (typeof collectionObject.count === 'number') {
                        structure.size = collectionObject.count;
                    } else {
                        // Fallback: try to access items until we get null
                        var testSize = 0;
                        while (testSize < 1000) { // Safety limit
                            try {
                                if (collectionObject.item(testSize)) {
                                    testSize++;
                                } else {
                                    break;
                                }
                            } catch (testExc) {
                                break;
                            }
                        }
                        structure.size = testSize;
                    }
                } catch (sizeExc) {
                    structure.size = 0;
                }
                
                logDebug('InDesign collection detected via item method, size: ' + structure.size, 'sampling');
            }
        }

        // Check for indexed access
        try {
            if (collectionObject[0] !== undefined) {
                structure.hasIndexAccess = true;
                logDebug('Collection has indexed access', 'sampling');
            }
        } catch (indexExc) {
            // Index access not available
        }

        // Get constructor name
        try {
            if (collectionObject.constructor && collectionObject.constructor.name) {
                structure.constructorName = collectionObject.constructor.name;
            }
        } catch (constructorExc) {
            // Use default
        }

        logInfo('Collection structure analysis completed - isCollection: ' + structure.isCollection + 
               ', size: ' + structure.size + ', constructor: ' + structure.constructorName, 'sampling');

        return structure;

    } catch (exc) {
        logError('Collection structure analysis failed: ' + exc.message, 'sampling');
        return {
            isCollection: false,
            size: 0,
            accessMethod: 'error',
            error: exc.message
        };
    }
}

/**
 * Access collection safely - ENHANCED LOGGING
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
        logDebug('Attempting safe collection access for: ' + collection.name + ' at path: ' + collection.path, 'sampling');

        if (!collection || !collection.path) {
            result.error = 'Invalid collection info';
            logWarn('Invalid collection info provided', 'sampling');
            return result;
        }

        if (!sourceDocument) {
            result.error = 'No source document provided';
            logWarn('No source document for collection access', 'sampling');
            return result;
        }

        // Build path from document root
        var pathComponents = stringSplit(collection.path, '.');
        var currentObject = sourceDocument;

        logDebug('Traversing path with ' + pathComponents.length + ' components', 'sampling');

        // Skip 'document' if it's the first component
        var startIndex = 0;
        if (pathComponents.length > 0 && pathComponents[0] === 'document') {
            startIndex = 1;
        }

        for (var i = startIndex; i < pathComponents.length; i++) {
            var component = pathComponents[i];
            
            try {
                if (!currentObject || typeof currentObject !== 'object') {
                    result.error = 'Path traversal failed at component: ' + component;
                    logWarn('Path traversal failed at component: ' + component, 'sampling');
                    return result;
                }

                currentObject = currentObject[component];
                logDebug('Path component traversed: ' + component, 'sampling');
                
            } catch (accessExc) {
                result.error = 'Access failed at component: ' + component + ', error: ' + accessExc.message;
                logWarn('Collection access failed at component: ' + component + ': ' + accessExc.message, 'sampling');
                return result;
            }
        }

        if (!currentObject) {
            result.error = 'Collection not found at path';
            logWarn('Collection not found at final path: ' + collection.path, 'sampling');
            return result;
        }

        result.collection = currentObject;
        result.success = true;
        
        logDebug('Collection accessed successfully: ' + collection.name, 'sampling');
        return result;

    } catch (exc) {
        result.error = 'Collection access exception: ' + exc.message;
        logError('Collection access exception for: ' + collection.name + ': ' + exc.message, 'sampling');
        return result;
    }
}

// =============================================================================
// CONTENT ANALYSIS FUNCTIONS - ENHANCED LOGGING
// =============================================================================

/**
 * Format primitive value for display - ENHANCED LOGGING
 * @param {*} value - Primitive value
 * @returns {String} Formatted value
 */
function formatPrimitiveValue(value) {
    try {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';

        var valueType = typeof value;

        if (valueType === 'string') {
            var truncated = value.length > 100 ? stringSubstring(value, 0, 100) + '...' : value;
            return '"' + truncated + '"';
        }

        if (valueType === 'number') {
            return safeToString(value);
        }

        if (valueType === 'boolean') {
            return value ? 'true' : 'false';
        }

        return safeToString(value);

    } catch (exc) {
        logDebug('Primitive value formatting failed: ' + exc.message, 'sampling');
        return '[formatting error]';
    }
}

/**
 * Generate collection preview - ENHANCED LOGGING
 * @param {Array} sampleItems - Sample items from collection
 * @param {Number} maxItems - Maximum items to include in preview
 * @returns {String} Collection preview
 */
function generateCollectionPreview(sampleItems, maxItems) {
    try {
        if (!sampleItems || sampleItems.length === 0) {
            return '[empty collection]';
        }

        var preview = '[';
        var itemsToShow = Math.min(maxItems || 3, sampleItems.length);

        for (var i = 0; i < itemsToShow; i++) {
            if (i > 0) preview += ', ';
            
            var item = sampleItems[i];
            if (item && item.value) {
                preview += item.value;
            } else {
                preview += '[item ' + i + ']';
            }
        }

        if (sampleItems.length > itemsToShow) {
            preview += ', ...+' + (sampleItems.length - itemsToShow);
        }

        preview += ']';
        
        logDebug('Collection preview generated for ' + sampleItems.length + ' items', 'sampling');
        return preview;

    } catch (exc) {
        logError('Collection preview generation failed: ' + exc.message, 'sampling');
        return '[preview error]';
    }
}

/**
 * Generate object preview - ENHANCED LOGGING
 * @param {Object} targetObject - Object to preview
 * @returns {String} Object preview
 */
function generateObjectPreview(targetObject) {
    try {
        if (!targetObject) {
            return 'null';
        }

        if (typeof targetObject !== 'object') {
            return formatPrimitiveValue(targetObject);
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
        logError('Object preview generation failed: ' + exc.message, 'sampling');
        return '[object preview error]';
    }
}

/**
 * Merge property summary data - ENHANCED LOGGING
 * @param {Object} target - Target summary to merge into
 * @param {Object} source - Source summary to merge from
 */
function mergePropertySummary(target, source) {
    try {
        if (!target || !source) {
            logDebug('Merge property summary skipped - invalid parameters', 'sampling');
            return;
        }

        logDebug('Merging property summary data', 'sampling');

        // Merge property types
        if (source.propertyTypes) {
            if (!target.propertyTypes) {
                target.propertyTypes = {};
            }
            
            for (var propType in source.propertyTypes) {
                if (objectHasOwnProperty(source.propertyTypes, propType)) {
                    if (target.propertyTypes[propType]) {
                        target.propertyTypes[propType] += source.propertyTypes[propType];
                    } else {
                        target.propertyTypes[propType] = source.propertyTypes[propType];
                    }
                }
            }
        }

        logDebug('Property summary merge completed', 'sampling');

    } catch (exc) {
        logError('Property summary merge failed: ' + exc.message, 'sampling');
    }
}

/**
 * Enhanced collection content summary generation - AUTHORITATIVE VERSION
 * @param {Array} sampleItems - Array of sampled items
 * @returns {Object} Content summary
 */
function generateCollectionContentSummary(sampleItems) {
    try {
        logDebug('Generating enhanced collection content summary for ' + (sampleItems ? sampleItems.length : 0) + ' items', 'sampling');

        var summary = {
            totalSamples: sampleItems ? sampleItems.length : 0,
            itemTypes: {},
            propertyTypes: {},
            commonProperties: {},
            uniqueProperties: new Set ? new Set() : [],
            valuePatterns: {},
            constructorTypes: {},
            hasComplexObjects: false,
            hasInDesignObjects: false,
            estimatedTotalSize: 0,
            analysisMetadata: {
                generated: getCurrentTimestamp(),
                builderVersion: '4.1',
                enhanced: true
            }
        };

        if (!sampleItems || sampleItems.length === 0) {
            logDebug('No sample items provided for content summary', 'sampling');
            return summary;
        }

        logInfo('Processing ' + sampleItems.length + ' sample items for content summary', 'sampling');

        var propertyFrequency = {};

        for (var i = 0; i < sampleItems.length; i++) {
            var item = sampleItems[i];
            
            if (!item) continue;

            // Track item types
            var itemType = item.type || 'unknown';
            summary.itemTypes[itemType] = (summary.itemTypes[itemType] || 0) + 1;

            // Analyze item properties if available
            if (item.properties) {
                summary.hasComplexObjects = true;
                
                for (var propName in item.properties) {
                    if (objectHasOwnProperty(item.properties, propName)) {
                        var prop = item.properties[propName];
                        
                        // Track property frequency
                        propertyFrequency[propName] = (propertyFrequency[propName] || 0) + 1;
                        
                        // Track property types
                        var propType = prop.type || 'unknown';
                        summary.propertyTypes[propType] = (summary.propertyTypes[propType] || 0) + 1;
                        
                        // Detect InDesign objects
                        if (stringIndexOf(stringToLowerCase(propName), 'indesign') !== -1 ||
                            stringIndexOf(stringToLowerCase(propName), 'document') !== -1 ||
                            stringIndexOf(stringToLowerCase(propName), 'page') !== -1 ||
                            stringIndexOf(stringToLowerCase(propName), 'story') !== -1) {
                            summary.hasInDesignObjects = true;
                        }
                        
                        // Track value patterns for primitives
                        if (prop.sampleValue !== undefined) {
                            var valuePattern = 'primitive_' + propType;
                            summary.valuePatterns[valuePattern] = (summary.valuePatterns[valuePattern] || 0) + 1;
                        }
                    }
                }
            }

            // Analyze constructor types from previews
            if (item.value && typeof item.value === 'string') {
                var constructorMatch = item.value.match(/\{(\w+)/);
                if (constructorMatch && constructorMatch[1]) {
                    var constructorName = constructorMatch[1];
                    summary.constructorTypes[constructorName] = (summary.constructorTypes[constructorName] || 0) + 1;
                }
            }
        }

        // Determine common properties (appear in most items)
        var commonThreshold = Math.ceil(sampleItems.length * 0.6); // 60% threshold
        for (var freq in propertyFrequency) {
            if (objectHasOwnProperty(propertyFrequency, freq)) {
                if (propertyFrequency[freq] >= commonThreshold) {
                    summary.commonProperties[freq] = propertyFrequency[freq];
                }
            }
        }

        // Estimate total collection size if possible
        if (sampleItems.length > 0 && sampleItems[0].index !== undefined) {
            var maxIndex = 0;
            for (var j = 0; j < sampleItems.length; j++) {
                if (sampleItems[j].index > maxIndex) {
                    maxIndex = sampleItems[j].index;
                }
            }
            summary.estimatedTotalSize = maxIndex + 1;
        }

        // Calculate diversity metrics
        summary.analysisMetadata.typeVariety = countObjectKeys(summary.itemTypes);
        summary.analysisMetadata.propertyVariety = countObjectKeys(summary.propertyTypes);
        summary.analysisMetadata.constructorVariety = countObjectKeys(summary.constructorTypes);
        summary.analysisMetadata.commonPropertyCount = countObjectKeys(summary.commonProperties);

        logInfo('Collection content summary completed - Types: ' + summary.analysisMetadata.typeVariety +
               ', Properties: ' + summary.analysisMetadata.propertyVariety +
               ', InDesign objects: ' + summary.hasInDesignObjects, 'sampling');

        return summary;

    } catch (exc) {
        logError('Collection content summary generation failed: ' + exc.message, 'sampling');
        return {
            totalSamples: 0,
            error: exc.message,
            analysisMetadata: {
                generated: getCurrentTimestamp(),
                builderVersion: '4.1',
                failed: true
            }
        };
    }
}

// =============================================================================
// CROSS-COLLECTION TRACKING - ENHANCED LOGGING
// =============================================================================

/**
 * Initialize cross-collection tracking - ENHANCED LOGGING
 * @returns {Object} Cross-collection tracking registry
 */
function initializeCrossCollectionTracking() {
    try {
        logDebug('Initializing cross-collection tracking registry', 'sampling');
        
        var registry = {
            objects: {},
            paths: {},
            references: 0,
            duplicates: 0
        };

        logInfo('Cross-collection tracking registry initialized', 'sampling');
        return registry;

    } catch (exc) {
        logError('Cross-collection tracking initialization failed: ' + exc.message, 'sampling');
        return null;
    }
}

/**
 * Track cross-collection object - ENHANCED LOGGING
 * @param {Object} obj - Object to track
 * @param {String} path - Object path
 * @param {Object} registry - Tracking registry
 */
function trackCrossCollectionObject(obj, path, registry) {
    try {
        if (!obj || !registry || typeof obj !== 'object') {
            return;
        }

        logDebug('Tracking cross-collection object at path: ' + path, 'sampling');

        var objHash = generateObjectIdentityHash(obj);
        
        if (registry.objects[objHash]) {
            // Object seen before
            registry.duplicates++;
            registry.objects[objHash].paths[registry.objects[objHash].paths.length] = path;
            
            logDebug('Duplicate object detected in cross-collection tracking: ' + objHash, 'sampling');
        } else {
            // New object
            registry.objects[objHash] = {
                paths: [path],
                firstSeen: getCurrentTimestamp()
            };
            registry.references++;
            
            logDebug('New object registered in cross-collection tracking: ' + objHash, 'sampling');
        }

        registry.paths[path] = objHash;

    } catch (exc) {
        logError('Cross-collection object tracking failed for path: ' + path + ': ' + exc.message, 'sampling');
    }
}

/**
 * Perform cross-collection analysis - ENHANCED LOGGING
 * @param {Object} registry - Cross-collection registry
 * @param {Object} domStructure - DOM structure to enhance
 */
function performCrossCollectionAnalysis(registry, domStructure) {
    try {
        if (!registry || !domStructure) {
            logWarn('Cross-collection analysis skipped - invalid parameters', 'sampling');
            return;
        }

        logDebug('Performing cross-collection analysis', 'sampling');

        var analysis = {
            totalObjects: registry.references,
            duplicateObjects: registry.duplicates,
            uniqueObjects: registry.references - registry.duplicates,
            crossReferences: [],
            analysisCompleted: getCurrentTimestamp()
        };

        // Find objects that appear in multiple collections
        for (var objHash in registry.objects) {
            if (objectHasOwnProperty(registry.objects, objHash)) {
                var objInfo = registry.objects[objHash];
                if (objInfo.paths.length > 1) {
                    analysis.crossReferences[analysis.crossReferences.length] = {
                        objectHash: objHash,
                        paths: objInfo.paths,
                        referenceCount: objInfo.paths.length
                    };
                }
            }
        }

        // Add analysis to DOM structure metadata
        if (!domStructure.metadata) {
            domStructure.metadata = {};
        }

        domStructure.metadata.crossCollectionAnalysis = analysis;

        logInfo('Cross-collection analysis completed - Total: ' + analysis.totalObjects +
               ', Unique: ' + analysis.uniqueObjects +
               ', Cross-references: ' + analysis.crossReferences.length, 'sampling');

    } catch (exc) {
        logError('Cross-collection analysis failed: ' + exc.message, 'sampling');
    }
}

// =============================================================================
// HELPER FUNCTIONS - ENHANCED LOGGING
// =============================================================================

/**
 * Enhance collection with sampling data - ENHANCED LOGGING
 * @param {Object} collection - Collection to enhance
 * @param {Object} samplingResult - Sampling result data
 */
function enhanceCollectionWithSamplingData(collection, samplingResult) {
    try {
        if (!collection || !samplingResult) {
            logDebug('Collection enhancement skipped - invalid parameters', 'sampling');
            return;
        }

        logDebug('Enhancing collection with sampling data: ' + collection.name, 'sampling');

        collection.samplingMetadata = {
            sampled: true,
            timestamp: getCurrentTimestamp(),
            builderVersion: '4.1',
            itemsSampled: samplingResult.itemsSampled,
            deepAnalysisCount: samplingResult.deepAnalysisCount,
            sampleData: samplingResult.sampleData,
            contentSummary: generateCollectionContentSummary(samplingResult.sampleData)
        };

        if (samplingResult.sampleData && samplingResult.sampleData.length > 0) {
            collection.samplingMetadata.preview = generateCollectionPreview(
                samplingResult.sampleData,
                Math.min(3, samplingResult.sampleData.length)
            );
        }

        logDebug('Collection enhancement completed for: ' + collection.name, 'sampling');

    } catch (exc) {
        logError('Collection enhancement failed for: ' + collection.name + ': ' + exc.message, 'sampling');
    }
}

// =============================================================================
// MODULE REGISTRATION - UPDATED VERSION
// =============================================================================

// Register this module with all its functions
registerModule('2.2_collection-sampler', '4.1', [
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
// END OF 2.2_collection-sampler.jsx - ENHANCED WITH v4.1 IMPROVEMENTS
// =============================================================================