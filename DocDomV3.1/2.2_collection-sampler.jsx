// =============================================================================
// 2.2_collection-sampler.jsx - COLLECTION CONTENT SAMPLING
// InDesign DOM Discovery Builder v3.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: Deep collection content sampling with object reference tracking
// DEPENDENCIES: ["1.1_bootstrap-foundation.jsx", "1.2_safety-utilities.jsx", "2.1_dom-enumerator.jsx"]
// SIZE: ~750 lines - COMPLETE IMPLEMENTATION
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
    var config = samplingConfig ? 
        objectClone(samplingConfig, 2) : objectClone(DEFAULT_COLLECTION_SAMPLING_CONFIG, 2);
    
    try {
        // Validate input parameters
        if (!domStructure || !sourceDocument) {
            throw new Error('Invalid input parameters for collection sampling');
        }
        
        // Initialize sampling statistics
        var samplingStats = {
            collectionsProcessed: 0,
            itemsSampled: 0,
            propertiesAnalyzed: 0,
            errorsEncountered: 0,
            timeoutOccurred: false,
            samplingTime: 0
        };
        
        // Create reference tracker for collections
        var referenceTracker = createObjectReferenceTracker();
        
        // Set up timeout checking
        var timeoutChecker = createTimeoutChecker(config.timeoutPerCollection * 10); // Overall timeout
        
        // Process all collections in the DOM structure
        if (domStructure.structure && domStructure.structure.document) {
            sampleNodeCollections(
                domStructure.structure.document,
                sourceDocument,
                config,
                samplingStats,
                referenceTracker,
                timeoutChecker
            );
        }
        
        // Update metadata with sampling results
        if (!domStructure.metadata.collectionSampling) {
            domStructure.metadata.collectionSampling = {};
        }
        
        domStructure.metadata.collectionSampling = {
            enabled: true,
            timestamp: getCurrentTimestamp(),
            configuration: config,
            statistics: samplingStats,
            referenceTracking: referenceTracker.getStatistics(),
            totalTime: new Date().getTime() - startTime
        };
        
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
 * Sample collections from a DOM node and its children
 * @param {Object} domNode - DOM node to sample from
 * @param {Object} sourceDocument - Source document for collection access
 * @param {Object} config - Configuration
 * @param {Object} samplingStats - Statistics to update
 * @param {Object} referenceTracker - Reference tracker
 * @param {Function} timeoutChecker - Timeout checker
 */
function sampleNodeCollections(domNode, sourceDocument, config, samplingStats, referenceTracker, timeoutChecker) {
    try {
        if (!domNode || timeoutChecker()) {
            return;
        }
        
        // Sample collections in this node
        if (domNode.collections && domNode.collections.length > 0) {
            for (var i = 0; i < domNode.collections.length; i++) {
                if (timeoutChecker()) {
                    samplingStats.timeoutOccurred = true;
                    break;
                }
                
                try {
                    sampleSingleCollection(
                        domNode.collections[i],
                        sourceDocument,
                        config,
                        samplingStats,
                        referenceTracker
                    );
                    samplingStats.collectionsProcessed++;
                } catch (collExc) {
                    samplingStats.errorsEncountered++;
                }
            }
        }
        
        // Recursively sample child nodes
        if (domNode.childNodes && domNode.childNodes.length > 0) {
            for (var j = 0; j < domNode.childNodes.length; j++) {
                if (timeoutChecker()) {
                    samplingStats.timeoutOccurred = true;
                    break;
                }
                
                sampleNodeCollections(
                    domNode.childNodes[j],
                    sourceDocument,
                    config,
                    samplingStats,
                    referenceTracker,
                    timeoutChecker
                );
            }
        }
        
    } catch (exc) {
        samplingStats.errorsEncountered++;
    }
}

/**
 * Sample a single collection with deep analysis
 * @param {Object} collectionProperty - Collection property to sample
 * @param {Object} sourceDocument - Source document
 * @param {Object} config - Configuration
 * @param {Object} samplingStats - Statistics
 * @param {Object} referenceTracker - Reference tracker
 */
function sampleSingleCollection(collectionProperty, sourceDocument, config, samplingStats, referenceTracker) {
    try {
        // Access the actual collection object
        var collection = accessCollectionSafely(collectionProperty.path, sourceDocument);
        if (!collection) {
            collectionProperty.samplingError = 'Could not access collection';
            return;
        }
        
        // Initialize collection analysis
        if (!collectionProperty.collectionAnalysis) {
            collectionProperty.collectionAnalysis = {};
        }
        
        var analysis = collectionProperty.collectionAnalysis;
        analysis.samplingTimestamp = getCurrentTimestamp();
        
        // Determine collection size and type
        var collectionInfo = analyzeCollectionStructure(collection);
        analysis.collectionType = collectionInfo.type;
        analysis.itemCount = collectionInfo.count;
        analysis.isAccessible = collectionInfo.accessible;
        
        if (!analysis.isAccessible) {
            analysis.samplingError = 'Collection not accessible for sampling';
            return;
        }
        
        // Skip if collection is too large
        if (analysis.itemCount > config.maxCollectionSize) {
            analysis.samplingError = 'Collection too large: ' + analysis.itemCount + ' items';
            analysis.skipped = true;
            return;
        }
        
        // Sample collection items
        if (analysis.itemCount > 0) {
            var sampleCount = Math.min(config.maxSamplesPerCollection, analysis.itemCount);
            analysis.sampleItems = [];
            analysis.itemPropertySummary = {};
            
            for (var i = 0; i < sampleCount; i++) {
                try {
                    var itemSample = sampleCollectionItem(
                        collection, i, collectionProperty.path + '[' + i + ']',
                        config, referenceTracker
                    );
                    
                    if (itemSample) {
                        arrayPush(analysis.sampleItems, itemSample);
                        samplingStats.itemsSampled++;
                        
                        // Accumulate property analysis
                        if (itemSample.propertyAnalysis) {
                            mergePropertySummary(analysis.itemPropertySummary, itemSample.propertyAnalysis);
                        }
                    }
                    
                } catch (itemExc) {
                    var errorSample = {
                        index: i,
                        error: itemExc.message,
                        path: collectionProperty.path + '[' + i + ']'
                    };
                    arrayPush(analysis.sampleItems, errorSample);
                    samplingStats.errorsEncountered++;
                }
            }
            
            // Generate collection content summary
            analysis.contentSummary = generateCollectionContentSummary(analysis.sampleItems);
        }
        
    } catch (exc) {
        collectionProperty.samplingError = 'Collection sampling failed: ' + exc.message;
        samplingStats.errorsEncountered++;
    }
}

/**
 * Sample individual collection item with property analysis
 * @param {Object} collection - Collection object
 * @param {Number} itemIndex - Item index
 * @param {String} itemPath - Item access path
 * @param {Object} config - Configuration
 * @param {Object} referenceTracker - Reference tracker
 * @returns {Object} Item sample with analysis
 */
function sampleCollectionItem(collection, itemIndex, itemPath, config, referenceTracker) {
    try {
        var item;
        
        // Safe item access
        try {
            item = collection[itemIndex];
        } catch (accessExc) {
            return {
                index: itemIndex,
                path: itemPath,
                accessError: accessExc.message,
                accessible: false
            };
        }
        
        if (item === null || item === undefined) {
            return {
                index: itemIndex,
                path: itemPath,
                value: item,
                type: 'null',
                accessible: true
            };
        }
        
        var itemSample = {
            index: itemIndex,
            path: itemPath,
            type: safeTypeOf(item),
            accessible: true,
            samplingTimestamp: getCurrentTimestamp()
        };
        
        // Track object reference if applicable
        if (typeof item === 'object') {
            itemSample.objectId = referenceTracker.track(item, itemPath);
        }
        
        // Basic value sampling for primitives
        if (typeof item !== 'object') {
            itemSample.value = formatPrimitiveValue(item);
        } else {
            // Deep property analysis for objects
            if (config.enableDeepPropertyAnalysis) {
                itemSample.propertyAnalysis = analyzeItemProperties(
                    item, itemPath, config, referenceTracker
                );
            }
            
            // Collection content preview
            if (isCollectionLike(item)) {
                itemSample.collectionPreview = generateCollectionPreview(item, 3);
            } else {
                itemSample.objectPreview = generateObjectPreview(item, 5);
            }
        }
        
        return itemSample;
        
    } catch (exc) {
        return {
            index: itemIndex,
            path: itemPath,
            samplingError: exc.message,
            accessible: false
        };
    }
}

/**
 * Analyze item properties with depth control
 * @param {Object} item - Item to analyze
 * @param {String} itemPath - Item path
 * @param {Object} config - Configuration
 * @param {Object} referenceTracker - Reference tracker
 * @returns {Object} Property analysis
 */
function analyzeItemProperties(item, itemPath, config, referenceTracker) {
    try {
        var analysis = {
            propertyCount: 0,
            propertyTypes: {},
            sampleProperties: {},
            hasCircularReferences: false
        };
        
        var propertyCount = 0;
        var maxProperties = config.maxItemPropertiesPerSample || 50;
        
        // Analyze properties up to limit
        for (var propName in item) {
            if (propertyCount >= maxProperties) {
                analysis.truncated = true;
                break;
            }
            
            try {
                var propValue = item[propName];
                var propType = safeTypeOf(propValue);
                var propPath = itemPath + '.' + propName;
                
                // Count property types
                if (!analysis.propertyTypes[propType]) {
                    analysis.propertyTypes[propType] = 0;
                }
                analysis.propertyTypes[propType]++;
                
                // Sample property value
                if (propertyCount < 10) { // Only sample first 10 properties in detail
                    analysis.sampleProperties[propName] = {
                        type: propType,
                        path: propPath
                    };
                    
                    if (typeof propValue !== 'object') {
                        analysis.sampleProperties[propName].value = formatPrimitiveValue(propValue);
                    } else if (propValue) {
                        // Check for circular reference
                        if (referenceTracker.isVisited(propValue)) {
                            analysis.sampleProperties[propName].circularReference = true;
                            analysis.hasCircularReferences = true;
                        } else {
                            referenceTracker.markVisited(propValue);
                            
                            if (isCollectionLike(propValue)) {
                                analysis.sampleProperties[propName].collectionPreview = 
                                    generateCollectionPreview(propValue, 2);
                            } else {
                                analysis.sampleProperties[propName].objectPreview = 
                                    generateObjectPreview(propValue, 3);
                            }
                        }
                    }
                }
                
                propertyCount++;
                
            } catch (propExc) {
                // Continue with next property
            }
        }
        
        analysis.propertyCount = propertyCount;
        return analysis;
        
    } catch (exc) {
        return {
            error: exc.message,
            propertyCount: 0,
            propertyTypes: {},
            sampleProperties: {}
        };
    }
}

// =============================================================================
// COLLECTION STRUCTURE ANALYSIS
// =============================================================================

/**
 * Analyze collection structure and accessibility
 * @param {Object} collection - Collection to analyze
 * @returns {Object} Collection analysis
 */
function analyzeCollectionStructure(collection) {
    try {
        var analysis = {
            type: 'unknown',
            count: 0,
            accessible: false,
            hasLength: false,
            hasCount: false,
            isArray: false
        };
        
        if (!collection) {
            return analysis;
        }
        
        // Determine collection type
        if (collection instanceof Array) {
            analysis.type = 'Array';
            analysis.isArray = true;
            analysis.count = collection.length;
            analysis.hasLength = true;
            analysis.accessible = true;
        } else if (typeof collection.length === 'number') {
            analysis.type = 'IndexedCollection';
            analysis.count = collection.length;
            analysis.hasLength = true;
            analysis.accessible = true;
        } else if (typeof collection.count === 'number') {
            analysis.type = 'CountedCollection';
            analysis.count = collection.count;
            analysis.hasCount = true;
            analysis.accessible = true;
        } else if (collection.constructor && collection.constructor.name) {
            analysis.type = collection.constructor.name;
            analysis.accessible = true;
            // Try to determine count
            analysis.count = countObjectKeys(collection);
        } else {
            analysis.type = 'Object';
            analysis.accessible = true;
            analysis.count = countObjectKeys(collection);
        }
        
        return analysis;
        
    } catch (exc) {
        return {
            type: 'error',
            count: 0,
            accessible: false,
            error: exc.message
        };
    }
}

/**
 * Access collection safely using path
 * @param {String} collectionPath - Path to collection
 * @param {Object} sourceDocument - Source document
 * @returns {Object} Collection object or null
 */
function accessCollectionSafely(collectionPath, sourceDocument) {
    try {
        if (!collectionPath || !sourceDocument) {
            return null;
        }
        
        // Parse path components
        var pathComponents = splitPath(collectionPath);
        if (pathComponents.length === 0) {
            return null;
        }
        
        // Navigate to collection
        var current = sourceDocument;
        
        // Skip 'document' if it's the first component
        var startIndex = (pathComponents[0] === 'document') ? 1 : 0;
        
        for (var i = startIndex; i < pathComponents.length; i++) {
            if (!current || typeof current !== 'object') {
                return null;
            }
            
            try {
                current = current[pathComponents[i]];
            } catch (accessExc) {
                return null;
            }
        }
        
        return current;
        
    } catch (exc) {
        return null;
    }
}

// =============================================================================
// CONTENT ANALYSIS AND FORMATTING
// =============================================================================

/**
 * Format primitive value for display
 * @param {*} value - Primitive value
 * @returns {String} Formatted value
 */
function formatPrimitiveValue(value) {
    try {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        
        var type = typeof value;
        
        if (type === 'string') {
            // Limit string length
            if (value.length > 100) {
                return stringSubstring(value, 0, 97) + '...';
            }
            return value;
        }
        
        if (type === 'number' || type === 'boolean') {
            return String(value);
        }
        
        return '[' + type + ']';
        
    } catch (exc) {
        return '[format_error]';
    }
}

/**
 * Generate collection preview
 * @param {Object} collection - Collection to preview
 * @param {Number} maxItems - Maximum items to include
 * @returns {String} Collection preview
 */
function generateCollectionPreview(collection, maxItems) {
    try {
        var preview = [];
        var itemCount = 0;
        var maxPreview = maxItems || 3;
        
        if (collection instanceof Array) {
            for (var i = 0; i < Math.min(collection.length, maxPreview); i++) {
                preview.push(formatPrimitiveValue(collection[i]));
                itemCount++;
            }
        } else if (typeof collection.length === 'number') {
            for (var j = 0; j < Math.min(collection.length, maxPreview); j++) {
                try {
                    var item = collection[j];
                    preview.push(formatPrimitiveValue(item));
                    itemCount++;
                } catch (itemExc) {
                    preview.push('[access_error]');
                }
            }
        }
        
        var result = '[' + arrayJoin(preview, ', ');
        
        var totalCount = 0;
        if (collection.length !== undefined) {
            totalCount = collection.length;
        } else if (collection.count !== undefined) {
            totalCount = collection.count;
        }
        
        if (totalCount > itemCount) {
            result += ', ...+' + (totalCount - itemCount) + ' more';
        }
        
        result += ']';
        return result;
        
    } catch (exc) {
        return '[preview_error]';
    }
}

/**
 * Generate object preview
 * @param {Object} obj - Object to preview
 * @param {Number} maxProperties - Maximum properties to include
 * @returns {String} Object preview
 */
function generateObjectPreview(obj, maxProperties) {
    try {
        var preview = [];
        var propCount = 0;
        var maxProps = maxProperties || 5;
        
        for (var propName in obj) {
            if (propCount >= maxProps) {
                break;
            }
            
            try {
                var propValue = obj[propName];
                var valuePreview = formatPrimitiveValue(propValue);
                preview.push(propName + ': ' + valuePreview);
                propCount++;
            } catch (propExc) {
                preview.push(propName + ': [error]');
            }
        }
        
        var result = '{' + arrayJoin(preview, ', ');
        
        var totalProps = countObjectKeys(obj);
        if (totalProps > propCount) {
            result += ', ...+' + (totalProps - propCount) + ' more';
        }
        
        result += '}';
        return result;
        
    } catch (exc) {
        return '{preview_error}';
    }
}

/**
 * Merge property summary data
 * @param {Object} targetSummary - Target summary to merge into
 * @param {Object} sourceSummary - Source summary to merge from
 */
function mergePropertySummary(targetSummary, sourceSummary) {
    try {
        if (!targetSummary || !sourceSummary || !sourceSummary.propertyTypes) {
            return;
        }
        
        // Merge property type counts
        for (var propType in sourceSummary.propertyTypes) {
            if (objectHasOwnProperty(sourceSummary.propertyTypes, propType)) {
                if (!targetSummary[propType]) {
                    targetSummary[propType] = 0;
                }
                targetSummary[propType] += sourceSummary.propertyTypes[propType];
            }
        }
        
    } catch (exc) {
        // Silent failure
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
    'mergePropertySummary', 'generateCollectionContentSummary'
]);

// =============================================================================
// END OF 2.2_collection-sampler.jsx
// =============================================================================