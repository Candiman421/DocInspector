//
// 6.0_collection-sampler.jsx (Enhanced)
// InDesign DOM Discovery Builder - Enhanced Collection Content Sampling
// CORE PURPOSE: Deep sample collection contents with object reference tracking
// DEPENDENCIES: 1.0_safe-foundation.jsx, 2.0_dom-enumerator.jsx
// SAFETY: Ultra-safe collection access with enhanced discovery-first approach
// ES3 COMPATIBLE: No reserved words, no modern JS features
// ENHANCED: Deeper sampling, object identity tracking, comprehensive property analysis
//

// ============================================================================
// ENHANCED COLLECTION SAMPLING CONFIGURATION
// ============================================================================

var ENHANCED_DEFAULT_COLLECTION_SAMPLING_CONFIG = {
    maxSamplesPerCollection: 5,     // Increased from 3 to 5
    timeoutPerCollection: 5000,     // Increased timeout for deeper analysis
    timeoutPerItem: 2000,          // Increased per-item timeout
    maxCollectionSize: 2000,       // Increased collection size limit
    samplingDepth: 3,              // Increased depth for item property analysis
    skipEmptyCollections: true,
    enableProgressLogging: true,
    enableObjectReferenceTracking: true,  // Track object references in collections
    enableDeepPropertyAnalysis: true,     // Analyze item properties more deeply
    enableCrossCollectionTracking: true,  // Track same objects across collections
    maxItemPropertiesPerSample: 100,     // Limit properties analyzed per item
    enableValueSampling: false,          // Sample actual values (dangerous, off by default)
    propertyAnalysisDepth: 2             // How deep to analyze item properties
};

// ============================================================================
// ENHANCED MAIN COLLECTION SAMPLING FUNCTIONS
// ============================================================================

/**
 * Enhanced collection content sampling with deep analysis and object tracking
 * @param {Object} domStructure - DOM structure from enumeration
 * @param {Object} sourceDocument - InDesign document object for sampling
 * @param {Object} samplingConfig - Sampling configuration
 * @returns {Object} - Enhanced DOM structure with deep collection analysis
 */
function sampleCollectionContentsEnhanced(domStructure, sourceDocument, samplingConfig) {
    if (!domStructure || !sourceDocument) {
        $.writeln('ERROR: Invalid parameters for enhanced collection sampling');
        return domStructure;
    }
    
    // Merge with enhanced configuration
    var config = mergeEnhancedCollectionSamplingConfig(ENHANCED_DEFAULT_COLLECTION_SAMPLING_CONFIG, samplingConfig);
    
    $.writeln('');
    $.writeln('==========================================');
    $.writeln('ENHANCED COLLECTION CONTENT SAMPLING');
    $.writeln('==========================================');
    $.writeln('🎯 DEEP DISCOVERY APPROACH: Enhanced analysis with object tracking');
    $.writeln('Max samples per collection: ' + config.maxSamplesPerCollection);
    $.writeln('Sampling depth: ' + config.samplingDepth);
    $.writeln('Property analysis depth: ' + config.propertyAnalysisDepth);
    $.writeln('Object reference tracking: ' + config.enableObjectReferenceTracking);
    $.writeln('Cross-collection tracking: ' + config.enableCrossCollectionTracking);
    $.writeln('');
    
    var startTime = new Date().getTime();
    var enhancedSamplingStats = {
        collectionsFound: 0,
        collectionsSkipped: 0,
        collectionsSampled: 0,
        totalItemsSampled: 0,
        totalPropertiesDiscovered: 0,
        totalItemPropertiesAnalyzed: 0,
        uniqueObjectsFound: 0,
        crossCollectionReferences: 0,
        deepAnalysisItems: 0,
        valuesSampled: 0,
        timeouts: 0,
        errors: 0,
        samplingTime: 0
    };
    
    // Initialize enhanced object tracking
    var crossCollectionObjectRegistry = {};
    if (config.enableCrossCollectionTracking) {
        initializeCrossCollectionTracking(domStructure, crossCollectionObjectRegistry);
    }
    
    try {
        // Find all collections in DOM structure
        var discoveredCollections = findAllCollections(domStructure);
        enhancedSamplingStats.collectionsFound = discoveredCollections.length;
        
        if (config.enableProgressLogging) {
            $.writeln('Found ' + discoveredCollections.length + ' collections for enhanced sampling');
        }
        
        // Enhanced sampling of each discovered collection
        for (var i = 0; i < discoveredCollections.length; i++) {
            var collection = discoveredCollections[i];
            
            if (config.enableProgressLogging) {
                $.writeln('Processing collection ' + (i + 1) + '/' + discoveredCollections.length + ': ' + collection.name);
                $.writeln('  Path: ' + collection.path);
                $.writeln('  Safety level: ' + collection.safetyLevel);
            }
            
            // Enhanced criteria check
            if (!meetsEnhancedDiscoveryFirstCriteria(collection, config)) {
                enhancedSamplingStats.collectionsSkipped++;
                if (config.enableProgressLogging) {
                    $.writeln('  ❌ Skipped - safety criteria not met');
                }
                continue;
            }
            
            // Enhanced collection sampling
            var enhancedCollectionResult = sampleSingleCollectionEnhanced(
                collection, 
                sourceDocument, 
                config, 
                enhancedSamplingStats,
                crossCollectionObjectRegistry
            );
            
            if (enhancedCollectionResult.success) {
                enhancedSamplingStats.collectionsSampled++;
                enhancedSamplingStats.totalItemsSampled += enhancedCollectionResult.itemsSampled;
                enhancedSamplingStats.totalPropertiesDiscovered += enhancedCollectionResult.propertiesDiscovered;
                enhancedSamplingStats.totalItemPropertiesAnalyzed += enhancedCollectionResult.itemPropertiesAnalyzed;
                enhancedSamplingStats.deepAnalysisItems += enhancedCollectionResult.deepAnalysisItems;
                enhancedSamplingStats.valuesSampled += enhancedCollectionResult.valuesSampled;
                
                // Enhanced collection data attachment
                enhanceCollectionWithEnhancedSamplingData(collection, enhancedCollectionResult.enhancedSamplingData);
                
                if (config.enableProgressLogging) {
                    $.writeln('  ✅ Enhanced sampling complete:');
                    $.writeln('    Items sampled: ' + enhancedCollectionResult.itemsSampled);
                    $.writeln('    Properties discovered: ' + enhancedCollectionResult.propertiesDiscovered);
                    $.writeln('    Item properties analyzed: ' + enhancedCollectionResult.itemPropertiesAnalyzed);
                    $.writeln('    Deep analysis items: ' + enhancedCollectionResult.deepAnalysisItems);
                }
            } else {
                enhancedSamplingStats.errors++;
                if (config.enableProgressLogging) {
                    $.writeln('  ❌ Enhanced sampling failed: ' + enhancedCollectionResult.error);
                }
            }
        }
        
        // Cross-collection analysis
        if (config.enableCrossCollectionTracking) {
            performCrossCollectionAnalysis(domStructure, crossCollectionObjectRegistry, enhancedSamplingStats);
        }
        
        // Add enhanced sampling metadata
        enhancedSamplingStats.samplingTime = new Date().getTime() - startTime;
        enhancedSamplingStats.uniqueObjectsFound = Object.keys(crossCollectionObjectRegistry).length;
        
        if (!domStructure.metadata.collectionSampling) {
            domStructure.metadata.collectionSampling = {};
        }
        
        domStructure.metadata.collectionSampling = {
            timestamp: getCurrentTimestamp(),
            config: config,
            stats: enhancedSamplingStats,
            approach: 'enhanced-discovery-first',
            enhancedFeatures: {
                deepPropertyAnalysis: config.enableDeepPropertyAnalysis,
                objectReferenceTracking: config.enableObjectReferenceTracking,
                crossCollectionTracking: config.enableCrossCollectionTracking,
                valuesSampled: enhancedSamplingStats.valuesSampled > 0
            },
            crossCollectionObjectRegistry: config.enableCrossCollectionTracking ? crossCollectionObjectRegistry : null
        };
        
        $.writeln('');
        $.writeln('ENHANCED COLLECTION SAMPLING COMPLETE:');
        $.writeln('  Collections found: ' + enhancedSamplingStats.collectionsFound);
        $.writeln('  Collections sampled: ' + enhancedSamplingStats.collectionsSampled);
        $.writeln('  Total items sampled: ' + enhancedSamplingStats.totalItemsSampled);
        $.writeln('  Properties discovered: ' + enhancedSamplingStats.totalPropertiesDiscovered);
        $.writeln('  Item properties analyzed: ' + enhancedSamplingStats.totalItemPropertiesAnalyzed);
        $.writeln('  Deep analysis items: ' + enhancedSamplingStats.deepAnalysisItems);
        $.writeln('  Unique objects found: ' + enhancedSamplingStats.uniqueObjectsFound);
        $.writeln('  Cross-collection refs: ' + enhancedSamplingStats.crossCollectionReferences);
        $.writeln('  Values sampled: ' + enhancedSamplingStats.valuesSampled);
        $.writeln('  Errors: ' + enhancedSamplingStats.errors);
        $.writeln('  Time: ' + enhancedSamplingStats.samplingTime + 'ms');
        $.writeln('==========================================');
        
    } catch (exc) {
        $.writeln('ERROR: Enhanced collection sampling failed: ' + exc.message);
        enhancedSamplingStats.errors++;
        
        if (!domStructure.metadata.collectionSampling) {
            domStructure.metadata.collectionSampling = {};
        }
        domStructure.metadata.collectionSampling.error = exc.message;
    }
    
    return domStructure;
}

/**
 * Enhanced criteria check for collection sampling
 * @param {Object} collection - Collection property classification
 * @param {Object} config - Sampling configuration
 * @returns {Boolean} - true if collection should be sampled
 */
function meetsEnhancedDiscoveryFirstCriteria(collection, config) {
    try {
        // Skip truly dangerous collections
        if (collection.safetyLevel === 'dangerous') {
            return false;
        }
        
        // Skip collections with dangerous names
        if (isDangerousProperty(collection.name)) {
            return false;
        }
        
        // ENHANCED: Additional safety checks for deeper analysis
        if (config.enableDeepPropertyAnalysis) {
            // Be more cautious with certain collection types during deep analysis
            var cautiousCollections = ['selection', 'activeDocument', 'app'];
            var lowerName = collection.name.toLowerCase();
            for (var i = 0; i < cautiousCollections.length; i++) {
                if (lowerName.indexOf(cautiousCollections[i]) !== -1) {
                    return false;
                }
            }
        }
        
        // ENHANCED DISCOVERY-FIRST: Sample all other discovered collections
        return true;
        
    } catch (exc) {
        return false;
    }
}

/**
 * Enhanced single collection sampling with deep analysis
 * @param {Object} collection - Collection property classification
 * @param {Object} sourceDocument - InDesign document object
 * @param {Object} config - Sampling configuration
 * @param {Object} samplingStats - Statistics tracking object
 * @param {Object} crossCollectionRegistry - Cross-collection object registry
 * @returns {Object} - Enhanced sampling result
 */
function sampleSingleCollectionEnhanced(collection, sourceDocument, config, samplingStats, crossCollectionRegistry) {
    var result = {
        success: false,
        itemsSampled: 0,
        propertiesDiscovered: 0,
        itemPropertiesAnalyzed: 0,
        deepAnalysisItems: 0,
        valuesSampled: 0,
        enhancedSamplingData: null,
        error: ''
    };
    
    // Get enhanced safety-adjusted configuration
    var adjustedConfig = getEnhancedSafetyAdjustedConfig(collection, config);
    var timeoutChecker = createTimeoutChecker(adjustedConfig.timeoutPerCollection);
    
    try {
        // Get reference to the actual collection object
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
        
        // Initialize enhanced sampling data
        var enhancedSamplingData = {
            collectionLength: collectionLength,
            sampledItems: [],
            commonProperties: [],
            accessPatterns: [],
            enhancedAnalysis: {
                itemPropertyCounts: [],
                deepAnalysisResults: [],
                objectReferences: [],
                valueAnalysis: [],
                crossCollectionLinks: []
            },
            safetyAdjustments: {
                originalSafetyLevel: collection.safetyLevel,
                adjustedMaxSamples: adjustedConfig.maxSamplesPerCollection,
                adjustedTimeout: adjustedConfig.timeoutPerCollection,
                deepAnalysisEnabled: config.enableDeepPropertyAnalysis
            }
        };
        
        // Enhanced item sampling
        var itemsToSample = Math.min(collectionLength, adjustedConfig.maxSamplesPerCollection);
        
        for (var itemIndex = 0; itemIndex < itemsToSample; itemIndex++) {
            if (timeoutChecker()) {
                samplingStats.timeouts++;
                result.error = 'Timeout during enhanced collection sampling';
                break;
            }
            
            try {
                var enhancedItemResult = sampleCollectionItemEnhanced(
                    actualCollection, 
                    itemIndex, 
                    collection.path + '[' + itemIndex + ']',
                    adjustedConfig,
                    crossCollectionRegistry
                );
                
                if (enhancedItemResult.success) {
                    enhancedSamplingData.sampledItems.push(enhancedItemResult.enhancedItemData);
                    result.itemsSampled++;
                    result.propertiesDiscovered += enhancedItemResult.propertiesFound;
                    result.itemPropertiesAnalyzed += enhancedItemResult.itemPropertiesAnalyzed;
                    result.valuesSampled += enhancedItemResult.valuesSampled;
                    
                    if (enhancedItemResult.deepAnalysisPerformed) {
                        result.deepAnalysisItems++;
                    }
                    
                    // Track enhanced analysis results
                    if (enhancedItemResult.enhancedAnalysisData) {
                        enhancedSamplingData.enhancedAnalysis.itemPropertyCounts.push(enhancedItemResult.itemPropertiesAnalyzed);
                        enhancedSamplingData.enhancedAnalysis.deepAnalysisResults.push(enhancedItemResult.enhancedAnalysisData);
                    }
                } else {
                    $.writeln('    Warning: Enhanced item sampling failed [' + itemIndex + ']: ' + enhancedItemResult.error);
                }
                
            } catch (itemExc) {
                $.writeln('    Warning: Exception in enhanced item sampling [' + itemIndex + ']: ' + itemExc.message);
            }
        }
        
        // Enhanced pattern analysis
        if (enhancedSamplingData.sampledItems.length > 0) {
            analyzeEnhancedCommonPatterns(enhancedSamplingData, config);
        }
        
        result.success = true;
        result.enhancedSamplingData = enhancedSamplingData;
        
    } catch (exc) {
        result.error = 'Enhanced collection sampling exception: ' + exc.message;
        samplingStats.errors++;
    }
    
    return result;
}

/**
 * Enhanced collection item sampling with deep property analysis
 * @param {Object} collection - Collection object
 * @param {Number} itemIndex - Index of item to sample
 * @param {String} itemPath - Full path to item
 * @param {Object} config - Sampling configuration
 * @param {Object} crossCollectionRegistry - Cross-collection object registry
 * @returns {Object} - Enhanced item sampling result
 */
function sampleCollectionItemEnhanced(collection, itemIndex, itemPath, config, crossCollectionRegistry) {
    var result = {
        success: false,
        enhancedItemData: null,
        propertiesFound: 0,
        itemPropertiesAnalyzed: 0,
        valuesSampled: 0,
        deepAnalysisPerformed: false,
        enhancedAnalysisData: null,
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
        
        // Generate enhanced item identity for tracking
        var itemObjectId = null;
        if (config.enableObjectReferenceTracking) {
            itemObjectId = generateObjectIdentityHash(item, itemPath);
            if (itemObjectId && crossCollectionRegistry) {
                trackCrossCollectionObject(crossCollectionRegistry, itemObjectId, itemPath, item);
            }
        }
        
        // Create enhanced item data structure
        var enhancedItemData = {
            index: itemIndex,
            path: itemPath,
            type: typeof item,
            objectId: itemObjectId,
            properties: [],
            collections: [],
            methods: [],
            enhancedAnalysis: {
                propertyCount: 0,
                nestedObjects: 0,
                deepProperties: [],
                valueAnalysis: [],
                objectReferences: []
            }
        };
        
        // Enhanced property enumeration with deeper analysis
        var propertyCount = 0;
        try {
            for (var propName in item) {
                if (timeoutChecker()) {
                    break;
                }
                
                if (propertyCount >= config.maxItemPropertiesPerSample) {
                    enhancedItemData.enhancedAnalysis.deepProperties.push('Property limit reached at ' + propertyCount);
                    break;
                }
                
                try {
                    // Enhanced property processing
                    var enhancedPropResult = processEnhancedItemProperty(
                        item, propName, itemPath, config, timeoutChecker, crossCollectionRegistry
                    );
                    
                    if (enhancedPropResult.success) {
                        var propClassification = enhancedPropResult.propertyClassification;
                        result.propertiesFound++;
                        propertyCount++;
                        
                        if (propClassification.isMethod) {
                            enhancedItemData.methods.push(propClassification);
                        } else if (propClassification.isCollection) {
                            enhancedItemData.collections.push(propClassification);
                        } else {
                            enhancedItemData.properties.push(propClassification);
                        }
                        
                        // Enhanced analysis data
                        if (enhancedPropResult.enhancedData) {
                            enhancedItemData.enhancedAnalysis.deepProperties.push(enhancedPropResult.enhancedData);
                            result.itemPropertiesAnalyzed++;
                            
                            if (enhancedPropResult.enhancedData.valuesampled) {
                                result.valuesSampled++;
                            }
                        }
                        
                        // Track nested objects
                        if (propClassification.type === 'object') {
                            enhancedItemData.enhancedAnalysis.nestedObjects++;
                        }
                    }
                    
                } catch (propExc) {
                    // Skip problematic properties but continue
                    continue;
                }
            }
            
            enhancedItemData.enhancedAnalysis.propertyCount = propertyCount;
            
            // Perform deep analysis if enabled and item has sufficient properties
            if (config.enableDeepPropertyAnalysis && propertyCount > 3) {
                var deepAnalysisResult = performDeepItemAnalysis(item, itemPath, config, timeoutChecker);
                if (deepAnalysisResult.success) {
                    enhancedItemData.enhancedAnalysis.deepAnalysisData = deepAnalysisResult.analysisData;
                    result.deepAnalysisPerformed = true;
                    result.enhancedAnalysisData = deepAnalysisResult.analysisData;
                }
            }
            
        } catch (enumExc) {
            result.error = 'Enhanced property enumeration failed: ' + enumExc.message;
            return result;
        }
        
        result.success = true;
        result.enhancedItemData = enhancedItemData;
        
    } catch (exc) {
        result.error = 'Enhanced item sampling exception: ' + exc.message;
    }
    
    return result;
}

/**
 * Enhanced property processing for collection items
 * @param {Object} item - Collection item
 * @param {String} propName - Property name
 * @param {String} itemPath - Item path
 * @param {Object} config - Configuration
 * @param {Function} timeoutChecker - Timeout checker
 * @param {Object} crossCollectionRegistry - Cross-collection registry
 * @returns {Object} - Enhanced property processing result
 */
function processEnhancedItemProperty(item, propName, itemPath, config, timeoutChecker, crossCollectionRegistry) {
    var result = {
        success: false,
        propertyClassification: null,
        enhancedData: null,
        error: ''
    };
    
    try {
        // Skip dangerous properties
        if (isDangerousProperty(propName) || isReservedWord(propName)) {
            return result;
        }
        
        // Get property type safely
        var propType = safeTypeCheck(item, propName);
        if (propType === 'error') {
            return result;
        }
        
        // Create enhanced property classification
        var propObjectId = null;
        if (config.enableObjectReferenceTracking && propType === 'object') {
            // Generate ID for object properties (we'll need to access the value for this)
            if (config.enableValueSampling) {
                try {
                    var propValue = item[propName];
                    if (propValue) {
                        propObjectId = generateObjectIdentityHash(propValue, itemPath + '.' + propName);
                        if (crossCollectionRegistry) {
                            trackCrossCollectionObject(crossCollectionRegistry, propObjectId, itemPath + '.' + propName, propValue);
                        }
                    }
                } catch (valueExc) {
                    // Can't access value safely, continue without object ID
                }
            }
        }
        
        var propClassification = createEnhancedPropertyClassification(propName, propType, itemPath, propObjectId);
        
        // Enhanced data collection
        var enhancedData = {
            propertyName: propName,
            propertyType: propType,
            safetyLevel: propClassification.safetyLevel,
            hasObjectId: !!propObjectId,
            valuesampled: false
        };
        
        // Enhanced value sampling if enabled and safe
        if (config.enableValueSampling && propClassification.safetyLevel === 'safe') {
            try {
                var valueResult = safeGetPropertyValue(item, propName, 500); // 500ms timeout for value sampling
                if (valueResult.success) {
                    enhancedData.sampleValue = formatSampleValue(valueResult.value, {
                        maxStringLength: 100,
                        maxObjectDepth: 1
                    });
                    enhancedData.valuesampled = true;
                }
            } catch (valueExc) {
                enhancedData.valueSamplingError = valueExc.message;
            }
        }
        
        // Enhanced property analysis for specific types
        if (config.propertyAnalysisDepth > 1 && propType === 'object' && propClassification.safetyLevel !== 'dangerous') {
            enhancedData.nestedAnalysis = 'Object property detected - deeper analysis available';
        }
        
        result.success = true;
        result.propertyClassification = propClassification;
        result.enhancedData = enhancedData;
        
    } catch (exc) {
        result.error = 'Enhanced property processing failed: ' + exc.message;
    }
    
    return result;
}

// ============================================================================
// ENHANCED ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Perform deep analysis on collection item
 * @param {Object} item - Collection item to analyze
 * @param {String} itemPath - Item path
 * @param {Object} config - Configuration
 * @param {Function} timeoutChecker - Timeout checker
 * @returns {Object} - Deep analysis result
 */
function performDeepItemAnalysis(item, itemPath, config, timeoutChecker) {
    var result = {
        success: false,
        analysisData: null,
        error: ''
    };
    
    try {
        var analysisData = {
            itemPath: itemPath,
            analysisType: 'deep-property-analysis',
            timestamp: getCurrentTimestamp(),
            findings: [],
            statistics: {
                totalProperties: 0,
                objectProperties: 0,
                functionProperties: 0,
                collectionProperties: 0,
                safeProperties: 0
            }
        };
        
        // Analyze item structure in depth
        var propCount = 0;
        for (var propName in item) {
            if (timeoutChecker()) {
                analysisData.findings.push('Analysis timeout reached at property ' + propCount);
                break;
            }
            
            if (propCount >= 50) { // Limit deep analysis
                analysisData.findings.push('Deep analysis property limit reached');
                break;
            }
            
            try {
                var propType = safeTypeCheck(item, propName);
                if (propType !== 'error') {
                    analysisData.statistics.totalProperties++;
                    propCount++;
                    
                    switch (propType) {
                        case 'object':
                            analysisData.statistics.objectProperties++;
                            break;
                        case 'function':
                            analysisData.statistics.functionProperties++;
                            break;
                        default:
                            if (isLikelyCollection(propName, propType)) {
                                analysisData.statistics.collectionProperties++;
                            }
                            break;
                    }
                    
                    var safety = classifyPropertySafety(propName, propType);
                    if (safety === 'safe') {
                        analysisData.statistics.safeProperties++;
                    }
                }
            } catch (propExc) {
                // Continue analysis
            }
        }
        
        // Analysis conclusions
        if (analysisData.statistics.totalProperties > 20) {
            analysisData.findings.push('Complex object with ' + analysisData.statistics.totalProperties + ' properties');
        }
        
        if (analysisData.statistics.collectionProperties > 0) {
            analysisData.findings.push('Contains ' + analysisData.statistics.collectionProperties + ' potential sub-collections');
        }
        
        if (analysisData.statistics.safeProperties > 5) {
            analysisData.findings.push('Rich object with ' + analysisData.statistics.safeProperties + ' safe properties for access');
        }
        
        result.success = true;
        result.analysisData = analysisData;
        
    } catch (exc) {
        result.error = 'Deep analysis failed: ' + exc.message;
    }
    
    return result;
}

/**
 * Analyze enhanced common patterns with deep analysis
 * @param {Object} enhancedSamplingData - Enhanced sampling data to analyze
 * @param {Object} config - Configuration
 */
function analyzeEnhancedCommonPatterns(enhancedSamplingData, config) {
    try {
        if (!enhancedSamplingData.sampledItems || enhancedSamplingData.sampledItems.length === 0) {
            return;
        }
        
        // Enhanced pattern analysis with deeper property examination
        var firstItem = enhancedSamplingData.sampledItems[0];
        var allProperties = [];
        
        if (firstItem.properties) allProperties = allProperties.concat(firstItem.properties);
        if (firstItem.collections) allProperties = allProperties.concat(firstItem.collections);
        
        // Find properties common to all sampled items
        for (var i = 0; i < allProperties.length; i++) {
            var prop = allProperties[i];
            var existsInAll = true;
            var occurrenceCount = 1;
            
            // Check existence in all other sampled items
            for (var j = 1; j < enhancedSamplingData.sampledItems.length; j++) {
                var otherItem = enhancedSamplingData.sampledItems[j];
                var foundInOther = false;
                
                // Check in all property arrays
                var allOtherProps = [];
                if (otherItem.properties) allOtherProps = allOtherProps.concat(otherItem.properties);
                if (otherItem.collections) allOtherProps = allOtherProps.concat(otherItem.collections);
                
                for (var k = 0; k < allOtherProps.length; k++) {
                    if (allOtherProps[k].name === prop.name) {
                        foundInOther = true;
                        occurrenceCount++;
                        break;
                    }
                }
                
                if (!foundInOther) {
                    existsInAll = false;
                    break;
                }
            }
            
            if (existsInAll) {
                // Enhanced common property with occurrence data
                var enhancedCommonProp = {
                    name: prop.name,
                    type: prop.type,
                    safetyLevel: prop.safetyLevel,
                    isCollection: prop.isCollection,
                    occurrenceCount: occurrenceCount,
                    coverage: (occurrenceCount / enhancedSamplingData.sampledItems.length) * 100
                };
                
                enhancedSamplingData.commonProperties.push(enhancedCommonProp);
            }
        }
        
        // Enhanced access pattern generation
        var basePath = enhancedSamplingData.sampledItems[0].path.replace(/\[\d+\]$/, '');
        for (var i = 0; i < enhancedSamplingData.commonProperties.length; i++) {
            var commonProp = enhancedSamplingData.commonProperties[i];
            
            var enhancedAccessPattern = {
                pattern: basePath + '[index].' + commonProp.name,
                type: commonProp.type,
                safetyLevel: commonProp.safetyLevel,
                description: 'Access ' + commonProp.name + ' property of collection items',
                coverage: commonProp.coverage,
                isRecommended: commonProp.safetyLevel === 'safe' && commonProp.coverage === 100
            };
            
            enhancedSamplingData.accessPatterns.push(enhancedAccessPattern);
        }
        
        // Sort access patterns by safety and coverage
        enhancedSamplingData.accessPatterns.sort(function(a, b) {
            if (a.isRecommended && !b.isRecommended) return -1;
            if (!a.isRecommended && b.isRecommended) return 1;
            return b.coverage - a.coverage;
        });
        
    } catch (exc) {
        $.writeln('Error in enhanced pattern analysis: ' + exc.message);
    }
}

// ============================================================================
// CROSS-COLLECTION TRACKING
// ============================================================================

/**
 * Initialize cross-collection object tracking
 * @param {Object} domStructure - DOM structure
 * @param {Object} registry - Cross-collection registry to initialize
 */
function initializeCrossCollectionTracking(domStructure, registry) {
    try {
        // Initialize registry structure
        registry.metadata = {
            initialized: getCurrentTimestamp(),
            documentName: domStructure.metadata.documentName
        };
        registry.objects = {};
        registry.crossReferences = [];
        
    } catch (exc) {
        $.writeln('Error initializing cross-collection tracking: ' + exc.message);
    }
}

/**
 * Track object across collections
 * @param {Object} registry - Cross-collection registry
 * @param {String} objectId - Object identifier
 * @param {String} accessPath - Access path to object
 * @param {Object} objectRef - Object reference
 */
function trackCrossCollectionObject(registry, objectId, accessPath, objectRef) {
    try {
        if (!objectId || !registry.objects) return;
        
        if (!registry.objects[objectId]) {
            registry.objects[objectId] = {
                objectId: objectId,
                firstSeenPath: accessPath,
                accessPaths: [accessPath],
                collections: [],
                objectType: typeof objectRef
            };
        } else {
            // Object seen before - track cross-collection reference
            registry.objects[objectId].accessPaths.push(accessPath);
            
            // Extract collection name from path
            var collectionMatch = accessPath.match(/document\.([^.\[]+)/);
            if (collectionMatch) {
                var collectionName = collectionMatch[1];
                if (registry.objects[objectId].collections.indexOf(collectionName) === -1) {
                    registry.objects[objectId].collections.push(collectionName);
                }
            }
            
            // Track as cross-reference if in different collections
            if (registry.objects[objectId].collections.length > 1) {
                registry.crossReferences.push({
                    objectId: objectId,
                    collections: registry.objects[objectId].collections.slice(),
                    accessPaths: registry.objects[objectId].accessPaths.slice()
                });
            }
        }
        
    } catch (exc) {
        $.writeln('Error tracking cross-collection object: ' + exc.message);
    }
}

/**
 * Perform cross-collection analysis
 * @param {Object} domStructure - DOM structure
 * @param {Object} registry - Cross-collection registry
 * @param {Object} stats - Statistics to update
 */
function performCrossCollectionAnalysis(domStructure, registry, stats) {
    try {
        var crossRefs = registry.crossReferences || [];
        stats.crossCollectionReferences = crossRefs.length;
        
        if (crossRefs.length > 0) {
            $.writeln('Cross-collection analysis found ' + crossRefs.length + ' objects appearing in multiple collections:');
            for (var i = 0; i < Math.min(crossRefs.length, 5); i++) {
                var ref = crossRefs[i];
                $.writeln('  Object ' + ref.objectId + ' appears in: ' + ref.collections.join(', '));
            }
        }
        
    } catch (exc) {
        $.writeln('Error in cross-collection analysis: ' + exc.message);
    }
}

// ============================================================================
// ENHANCED UTILITY FUNCTIONS
// ============================================================================

/**
 * Get enhanced safety-adjusted configuration
 * @param {Object} collection - Collection to adjust for
 * @param {Object} baseConfig - Base configuration
 * @returns {Object} - Adjusted configuration
 */
function getEnhancedSafetyAdjustedConfig(collection, baseConfig) {
    var adjustedConfig = {
        maxSamplesPerCollection: baseConfig.maxSamplesPerCollection,
        timeoutPerCollection: baseConfig.timeoutPerCollection,
        timeoutPerItem: baseConfig.timeoutPerItem,
        maxItemPropertiesPerSample: baseConfig.maxItemPropertiesPerSample
    };
    
    // Enhanced safety adjustments
    switch (collection.safetyLevel) {
        case 'safe':
            adjustedConfig.maxSamplesPerCollection = Math.min(baseConfig.maxSamplesPerCollection * 2, 8);
            adjustedConfig.maxItemPropertiesPerSample = Math.min(baseConfig.maxItemPropertiesPerSample * 2, 150);
            break;
            
        case 'moderate':
            // Use base settings
            break;
            
        case 'risky':
            adjustedConfig.maxSamplesPerCollection = Math.max(Math.floor(baseConfig.maxSamplesPerCollection / 2), 1);
            adjustedConfig.timeoutPerCollection = Math.floor(baseConfig.timeoutPerCollection / 2);
            adjustedConfig.timeoutPerItem = Math.floor(baseConfig.timeoutPerItem / 2);
            adjustedConfig.maxItemPropertiesPerSample = Math.floor(baseConfig.maxItemPropertiesPerSample / 2);
            break;
            
        case 'dangerous':
            adjustedConfig.maxSamplesPerCollection = 1;
            adjustedConfig.timeoutPerCollection = 1000;
            adjustedConfig.timeoutPerItem = 200;
            adjustedConfig.maxItemPropertiesPerSample = 10;
            break;
    }
    
    return adjustedConfig;
}

/**
 * Enhanced collection data enhancement
 * @param {Object} collection - Original collection property
 * @param {Object} enhancedSamplingData - Enhanced sampling data
 */
function enhanceCollectionWithEnhancedSamplingData(collection, enhancedSamplingData) {
    try {
        // Original enhancement
        collection.samplingData = enhancedSamplingData;
        collection.hasSamplingData = true;
        collection.collectionLength = enhancedSamplingData.collectionLength;
        
        // Enhanced enhancements
        collection.enhancedSamplingData = enhancedSamplingData.enhancedAnalysis;
        collection.hasEnhancedAnalysis = true;
        
        if (enhancedSamplingData.commonProperties.length > 0) {
            collection.commonItemProperties = enhancedSamplingData.commonProperties;
            collection.recommendedProperties = enhancedSamplingData.commonProperties.filter(function(prop) {
                return prop.safetyLevel === 'safe' && prop.coverage === 100;
            });
        }
        
        if (enhancedSamplingData.accessPatterns.length > 0) {
            collection.accessPatterns = enhancedSamplingData.accessPatterns;
            collection.recommendedAccessPatterns = enhancedSamplingData.accessPatterns.filter(function(pattern) {
                return pattern.isRecommended;
            });
        }
        
    } catch (exc) {
        $.writeln('Error enhancing collection with enhanced sampling data: ' + exc.message);
    }
}

/**
 * Merge enhanced collection sampling configuration
 * @param {Object} defaults - Default configuration
 * @param {Object} userConfig - User configuration
 * @returns {Object} - Merged configuration
 */
function mergeEnhancedCollectionSamplingConfig(defaults, userConfig) {
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
// ENHANCED PUBLIC API
// ============================================================================

/**
 * Quick enhanced collection sampling
 * @param {Object} domStructure - DOM structure from enumeration
 * @param {Object} sourceDocument - InDesign document object
 * @returns {Object} - Enhanced DOM structure
 */
function quickSampleCollectionsEnhanced(domStructure, sourceDocument) {
    var quickConfig = {
        maxSamplesPerCollection: 3,
        timeoutPerCollection: 3000,
        enableProgressLogging: false,
        enableDeepPropertyAnalysis: true,
        enableObjectReferenceTracking: true
    };
    
    return sampleCollectionContentsEnhanced(domStructure, sourceDocument, quickConfig);
}

/**
 * Get enhanced collection sampling statistics
 * @param {Object} domStructure - DOM structure with enhanced sampling data
 * @returns {Object} - Enhanced sampling statistics
 */
function getEnhancedCollectionSamplingStatistics(domStructure) {
    var defaultStats = {
        collectionsFound: 0,
        collectionsSampled: 0,
        totalItemsSampled: 0,
        totalPropertiesDiscovered: 0,
        hasEnhancedSamplingData: false
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
                    totalItemPropertiesAnalyzed: samplingData.stats.totalItemPropertiesAnalyzed || 0,
                    uniqueObjectsFound: samplingData.stats.uniqueObjectsFound || 0,
                    crossCollectionReferences: samplingData.stats.crossCollectionReferences || 0,
                    deepAnalysisItems: samplingData.stats.deepAnalysisItems || 0,
                    valuesSampled: samplingData.stats.valuesSampled || 0,
                    errors: samplingData.stats.errors || 0,
                    timeouts: samplingData.stats.timeouts || 0,
                    samplingTime: samplingData.stats.samplingTime || 0,
                    hasEnhancedSamplingData: true,
                    enhancedFeatures: samplingData.enhancedFeatures
                };
            }
        }
    } catch (exc) {
        $.writeln('Error getting enhanced collection sampling statistics: ' + exc.message);
    }
    
    return defaultStats;
}

// ============================================================================
// BACKWARD COMPATIBILITY
// ============================================================================

/**
 * Maintain backward compatibility with original collection sampling
 */
function sampleCollectionContents(domStructure, sourceDocument, samplingConfig) {
    return sampleCollectionContentsEnhanced(domStructure, sourceDocument, samplingConfig);
}

function getCollectionSamplingStatistics(domStructure) {
    return getEnhancedCollectionSamplingStatistics(domStructure);
}

// ============================================================================
// MODULE INITIALIZATION
// ============================================================================

/**
 * Initialize enhanced collection sampler module
 * @returns {Boolean} - true if initialization successful
 */
function initializeEnhancedCollectionSampler() {
    try {
        // Check dependencies
        if (typeof safeTypeCheck !== 'function') {
            $.writeln('ERROR: Safe foundation module not loaded');
            return false;
        }
        
        if (typeof createEnhancedPropertyClassification !== 'function') {
            $.writeln('ERROR: Enhanced DOM enumerator module not loaded');
            return false;
        }
        
        // Test core functions
        var requiredFunctions = [
            'sampleCollectionContentsEnhanced', 'sampleCollectionItemEnhanced', 'performDeepItemAnalysis'
        ];
        
        for (var i = 0; i < requiredFunctions.length; i++) {
            if (typeof eval(requiredFunctions[i]) !== 'function') {
                $.writeln('ERROR: Required function missing: ' + requiredFunctions[i]);
                return false;
            }
        }
        
        $.writeln('6.0_collection-sampler.jsx: Enhanced version initialized successfully');
        $.writeln('Enhanced features: deep analysis, object tracking, cross-collection analysis');
        return true;
        
    } catch (exc) {
        $.writeln('ERROR: Enhanced collection sampler initialization failed: ' + exc.message);
        return false;
    }
}

// Auto-initialize when module loads
initializeEnhancedCollectionSampler();