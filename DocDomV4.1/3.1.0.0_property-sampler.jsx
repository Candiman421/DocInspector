// DocDomV4.1/3.1_property-sampler.jsx
// 3.1_property-sampler.jsx - PROPERTY VALUE SAMPLING
// InDesign DOM Discovery Builder v4.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: Property value sampling with reference tracking integration
// DEPENDENCIES: ["1.1_bootstrap-foundation.jsx", "1.2_safety-utilities.jsx", "2.1_dom-enumerator.jsx"]
// SIZE: ~1400 lines - COMPLETE IMPLEMENTATION - ENHANCED LOGGING - ES3 COMPLIANT
// CHANGES FROM 3.1: Fixed ES3 violations, enhanced logging, REMOVED isLikelyCollection duplicate
// =============================================================================

// =============================================================================
// DEPENDENCY VALIDATION
// =============================================================================

var PROPERTY_SAMPLER_DEPENDENCIES = ['1.1_bootstrap-foundation', '1.2_safety-utilities', '2.1_dom-enumerator'];
var dependencyCheck = validateDependencies(PROPERTY_SAMPLER_DEPENDENCIES);
if (!dependencyCheck.success) {
    throw new Error('Property Sampler missing dependencies: ' + dependencyCheck.missing.join(', '));
}

// =============================================================================
// PROPERTY SAMPLING CONFIGURATION
// =============================================================================

var DEFAULT_SAMPLING_CONFIG = {
    safetyFilter: 'safe',
    maxSamples: 10,
    timeoutMs: 1000,
    includeCollectionSamples: false,
    maxStringLength: 500,
    maxObjectDepth: 1,
    trackObjectReferences: true,
    includeValueMetadata: true,
    generateValueFingerprints: true,
    enableProgressReporting: false,
    enableDetailedLogging: false,
    skipNullValues: false,
    skipUndefinedValues: false,
    maxCollectionDepth: 2,
    preserveOriginalTypes: true
};

// =============================================================================
// MAIN SAMPLING FUNCTIONS - ENHANCED LOGGING
// =============================================================================

/**
 * Sample DOM property values with comprehensive tracking - ENHANCED LOGGING
 * @param {Object} domStructure - DOM structure with discovered properties
 * @param {Object} sourceDocument - Source document for value access
 * @param {Object} samplingConfig - Sampling configuration
 * @returns {Object} DOM structure with sampled values
 */
function sampleDOMValues(domStructure, sourceDocument, samplingConfig) {
    var startTime = new Date().getTime();

    logDebug('=== STARTING sampleDOMValues ===', 'sampling');
    logInfo('Starting property value sampling with configuration', 'sampling');
    logDebug('domStructure type: ' + typeof domStructure, 'sampling');
    logDebug('sourceDocument type: ' + typeof sourceDocument, 'sampling');
    logDebug('samplingConfig type: ' + typeof samplingConfig, 'sampling');

    var config = samplingConfig ?
        objectMerge(DEFAULT_SAMPLING_CONFIG, samplingConfig) :
        DEFAULT_SAMPLING_CONFIG;

    logDebug('Merged config - maxSamples: ' + config.maxSamples + ', timeout: ' + config.timeoutMs, 'sampling');

    try {
        if (!domStructure) {
            var error = 'No DOM structure provided for value sampling';
            logError(error, 'sampling');
            return createErrorResult(error);
        }

        if (!sourceDocument) {
            var docError = 'No source document provided for value sampling';
            logError(docError, 'sampling');
            return createErrorResult(docError);
        }

        logDebug('Input validation completed successfully', 'sampling');

        // Validate configuration
        var configValidation = validateSamplingConfig(config);
        if (!configValidation.valid) {
            logWarn('Configuration validation warnings: ' + arrayJoin(configValidation.warnings, ', '), 'sampling');
        }

        // Clone the DOM structure to avoid modifying the original
        var workingStructure = objectClone(domStructure, 4);
        logDebug('Working structure cloned for value sampling', 'sampling');

        // Initialize sampling session
        var samplingSession = {
            config: config,
            startTime: startTime,
            timeoutChecker: createTimeoutChecker(config.timeoutMs),
            referenceTracker: config.trackObjectReferences ? createObjectReferenceTracker() : null,
            sampledCount: 0,
            errorCount: 0,
            skipCount: 0
        };

        logInfo('Sampling session initialized - trackReferences: ' + (samplingSession.referenceTracker ? 'YES' : 'NO'), 'sampling');

        // Sample values in the structure
        if (workingStructure.structure && workingStructure.structure.document) {
            logDebug('Starting node value sampling from document root', 'sampling');
            sampleNodeValues(
                workingStructure.structure.document,
                sourceDocument,
                config,
                samplingSession
            );
        } else {
            logWarn('No document structure found for value sampling', 'sampling');
        }

        // Update metadata
        if (!workingStructure.metadata) {
            workingStructure.metadata = {};
        }

        workingStructure.metadata.valueSamplingTime = new Date().getTime() - startTime;
        workingStructure.metadata.samplingSession = {
            sampledCount: samplingSession.sampledCount,
            errorCount: samplingSession.errorCount,
            skipCount: samplingSession.skipCount,
            completedSuccessfully: true,
            builderVersion: '4.1'
        };
        workingStructure.metadata.currentPhase = 'value-sampling-completed';

        logInfo('Value sampling completed in ' + workingStructure.metadata.valueSamplingTime + 'ms', 'sampling');
        logInfo('Sampling results - Sampled: ' + samplingSession.sampledCount + 
               ', Errors: ' + samplingSession.errorCount + 
               ', Skipped: ' + samplingSession.skipCount, 'sampling');

        logDebug('=== VALUE SAMPLING COMPLETED ===', 'sampling');
        return workingStructure;

    } catch (exc) {
        var error = 'DOM value sampling failed: ' + exc.message;
        logError(error, 'sampling');
        return createErrorResult(error);
    }
}

/**
 * Sample property values in DOM node and its children - ENHANCED LOGGING
 * @param {Object} domNode - DOM node to process
 * @param {Object} sourceDocument - Source document
 * @param {Object} config - Sampling configuration
 * @param {Object} samplingSession - Sampling session data
 */
function sampleNodeValues(domNode, sourceDocument, config, samplingSession) {
    try {
        if (!domNode) {
            logDebug('Null DOM node encountered, skipping value sampling', 'sampling');
            return;
        }

        logDebug('Sampling values in node: ' + (domNode.path || 'unknown'), 'sampling');

        // Check timeout
        if (samplingSession.timeoutChecker && samplingSession.timeoutChecker.isExpired()) {
            logWarn('Timeout reached during node value sampling', 'sampling');
            return;
        }

        // Sample properties
        if (domNode.properties && domNode.properties.length > 0) {
            logDebug('Starting property sampling for ' + domNode.properties.length + ' properties in node: ' + domNode.path, 'sampling');

            for (var i = 0; i < domNode.properties.length; i++) {
                // Check timeout
                if (samplingSession.timeoutChecker && samplingSession.timeoutChecker.isExpired()) {
                    logWarn('Timeout reached during property sampling at property ' + i, 'sampling');
                    break;
                }

                var property = domNode.properties[i];
                try {
                    logDebug('Sampling property: ' + property.name + ' (type: ' + property.type + ')', 'sampling');

                    var sampleResult = samplePropertyValue(
                        sourceDocument,
                        property.name,
                        property.path,
                        config,
                        samplingSession.referenceTracker
                    );

                    if (sampleResult && sampleResult.success) {
                        property.sampledValue = sampleResult.formattedValue;
                        property.sampleMetadata = sampleResult.metadata;
                        samplingSession.sampledCount++;

                        if (i < 5) { // Debug first few successes
                            logDebug('Successfully sampled: ' + property.name + ' = ' + 
                                   (sampleResult.formattedValue ? 
                                    stringSubstring(sampleResult.formattedValue, 0, 50) : 'null'), 'sampling');
                        }
                    } else {
                        property.sampledValue = '[Sample Error: ' + (sampleResult ? sampleResult.error : 'unknown') + ']';
                        samplingSession.errorCount++;

                        if (i < 5) { // Debug first few errors
                            logDebug('Error sampling: ' + property.name + ' - ' + 
                                   (sampleResult ? sampleResult.error : 'unknown'), 'sampling');
                        }
                    }
                } catch (propException) {
                    property.sampledValue = '[Exception: ' + propException.message + ']';
                    samplingSession.errorCount++;
                    logWarn('Property sampling exception: ' + property.name + ' - ' + propException.message, 'sampling');
                }

                // Report progress every 50 properties
                if ((i + 1) % 50 === 0) {
                    logInfo('Progress: ' + (i + 1) + '/' + domNode.properties.length + ' properties processed in node: ' + domNode.path, 'sampling');
                }
            }

            logInfo('Property sampling completed for node: ' + domNode.path + 
                   ', processed: ' + domNode.properties.length + ' properties', 'sampling');
        }

        // Sample collections if present and enabled
        if (domNode.collections && config.includeCollectionSamples) {
            logDebug('Starting collection sampling for ' + domNode.collections.length + ' collections in node: ' + domNode.path, 'sampling');
            
            for (var j = 0; j < domNode.collections.length; j++) {
                if (samplingSession.timeoutChecker && samplingSession.timeoutChecker.isExpired()) {
                    logWarn('Timeout reached during collection sampling at collection ' + j, 'sampling');
                    break;
                }

                var collection = domNode.collections[j];
                try {
                    logDebug('Sampling collection: ' + collection.name, 'sampling');

                    var collectionSampleResult = samplePropertyValue(
                        sourceDocument,
                        collection.name,
                        collection.path,
                        config,
                        samplingSession.referenceTracker
                    );

                    if (collectionSampleResult && collectionSampleResult.success) {
                        collection.sampledValue = collectionSampleResult.formattedValue;
                        samplingSession.sampledCount++;
                        logDebug('Collection sampled successfully: ' + collection.name, 'sampling');
                    } else {
                        collection.sampledValue = '[Collection Error: ' + 
                                                (collectionSampleResult ? collectionSampleResult.error : 'unknown') + ']';
                        samplingSession.errorCount++;
                        logWarn('Collection sampling failed: ' + collection.name, 'sampling');
                    }
                } catch (collExc) {
                    collection.sampledValue = '[Collection Exception: ' + collExc.message + ']';
                    samplingSession.errorCount++;
                    logWarn('Collection sampling exception: ' + collection.name + ' - ' + collExc.message, 'sampling');
                }
            }

            logInfo('Collection sampling completed for node: ' + domNode.path + 
                   ', processed: ' + domNode.collections.length + ' collections', 'sampling');
        }

        // Process child nodes recursively
        if (domNode.childNodes && domNode.childNodes.length > 0) {
            logDebug('Processing ' + domNode.childNodes.length + ' child nodes for value sampling', 'sampling');
            
            for (var k = 0; k < domNode.childNodes.length; k++) {
                if (samplingSession.timeoutChecker && samplingSession.timeoutChecker.isExpired()) {
                    logWarn('Timeout reached during child node processing at child ' + k, 'sampling');
                    break;
                }
                
                sampleNodeValues(domNode.childNodes[k], sourceDocument, config, samplingSession);
            }

            logDebug('Child node processing completed for node: ' + domNode.path, 'sampling');
        }

    } catch (exc) {
        logError('Node value sampling error for node: ' + (domNode ? domNode.path : 'unknown') + ': ' + exc.message, 'sampling');
    }
}

/**
 * Sample property value with reference tracking and metadata - ENHANCED LOGGING
 * @param {Object} targetObject - Object containing the property
 * @param {String} propName - Property name to sample
 * @param {String} propPath - Full path to property
 * @param {Object} config - Sampling configuration
 * @param {Object} referenceTracker - Reference tracker for objects
 * @returns {Object} Sample result with metadata and object references
 */
function samplePropertyValue(targetObject, propName, propPath, config, referenceTracker) {
    // Static counter for debug limiting - PRESERVED from original but with enhanced logging
    if (typeof samplePropertyValue.debugCount === 'undefined') {
        samplePropertyValue.debugCount = 0;
    }
    var showDetailedDebug = samplePropertyValue.debugCount < 5;
    samplePropertyValue.debugCount++;

    // Use enhanced debug system but preserve the 5-entry limit
    if (showDetailedDebug) {
        logDebug('#' + samplePropertyValue.debugCount + ' Sampling property: ' + propName + 
               ' (path: ' + propPath + ')', 'sampling');
    }

    var result = {
        success: false,
        value: null,
        formattedValue: null,
        metadata: {},
        error: null
    };

    try {
        // Validate inputs
        if (!targetObject) {
            result.error = 'Target object is null';
            if (showDetailedDebug) {
                logDebug('  - Target object is null for property: ' + propName, 'sampling');
            }
            return result;
        }

        if (!propName || typeof propName !== 'string') {
            result.error = 'Invalid property name';
            if (showDetailedDebug) {
                logDebug('  - Invalid property name: ' + propName, 'sampling');
            }
            return result;
        }

        if (showDetailedDebug) {
            logDebug('  - Accessing property: ' + propName + ' on object type: ' + typeof targetObject, 'sampling');
        }

        // Access property safely
        var propValue;
        try {
            propValue = targetObject[propName];
        } catch (accessExc) {
            result.error = 'Property access failed: ' + accessExc.message;
            if (showDetailedDebug) {
                logDebug('  - Access failed: ' + accessExc.message, 'sampling');
            }
            return result;
        }

        // Store raw value
        result.value = propValue;

        // Enhanced metadata collection
        result.metadata = {
            sampledAt: getCurrentTimestamp(),
            path: propPath,
            builderVersion: '4.1',
            propertyName: propName
        };

        // Handle null/undefined values
        if (propValue === null) {
            result.formattedValue = 'null';
            result.success = true;
            result.metadata.valueType = 'null';
            if (showDetailedDebug) {
                logDebug('  - Value is null', 'sampling');
            }
            return result;
        }

        if (propValue === undefined) {
            result.formattedValue = 'undefined';
            result.success = true;
            result.metadata.valueType = 'undefined';
            if (showDetailedDebug) {
                logDebug('  - Value is undefined', 'sampling');
            }
            return result;
        }

        // Determine value type and format accordingly
        var valueType = typeof propValue;
        result.metadata.valueType = valueType;

        if (showDetailedDebug) {
            logDebug('  - Value type determined: ' + valueType, 'sampling');
        }

        switch (valueType) {
            case 'string':
                var stringResult = formatStringValue(propValue, config);
                result.formattedValue = stringResult.formattedValue;
                result.metadata.stringLength = stringResult.originalLength;
                result.metadata.wasTruncated = stringResult.wasTruncated;
                break;

            case 'number':
                result.formattedValue = safeToString(propValue);
                result.metadata.numericValue = propValue;
                break;

            case 'boolean':
                result.formattedValue = propValue ? 'true' : 'false';
                result.metadata.booleanValue = propValue;
                break;

            case 'function':
                result.formattedValue = '[Function: ' + (propValue.name || 'anonymous') + ']';
                result.metadata.isFunction = true;
                result.metadata.functionName = propValue.name || 'anonymous';
                break;

            case 'object':
                var objectResult = formatObjectValue(propValue, config, referenceTracker);
                result.formattedValue = objectResult.formattedValue;
                // FIXED ES3: No object spread - manually copy properties
                for (var metaProp in objectResult.metadata) {
                    if (objectHasOwnProperty(objectResult.metadata, metaProp)) {
                        result.metadata[metaProp] = objectResult.metadata[metaProp];
                    }
                }
                break;

            default:
                result.formattedValue = '[Unknown type: ' + valueType + ']';
                result.metadata.unknownType = valueType;
                break;
        }

        // Generate value fingerprint if enabled
        if (config.generateValueFingerprints) {
            result.metadata.valueFingerprint = generateValueFingerprint(propValue, valueType);
            if (showDetailedDebug) {
                logDebug('  - Generated fingerprint: ' + result.metadata.valueFingerprint, 'sampling');
            }
        }

        result.success = true;
        
        if (showDetailedDebug) {
            logDebug('  - Property sampling completed successfully, formatted: ' + 
                   (result.formattedValue ? stringSubstring(result.formattedValue, 0, 50) : 'null'), 'sampling');
        }

        return result;

    } catch (exc) {
        result.error = 'Property sampling failed: ' + exc.message;
        logError('Property sampling error for: ' + propName + ' at path: ' + propPath + ': ' + exc.message, 'sampling');
        return result;
    }
}

// =============================================================================
// VALUE FORMATTING FUNCTIONS - ENHANCED LOGGING
// =============================================================================

/**
 * Format string value for display - ENHANCED LOGGING
 * @param {String} stringValue - String value to format
 * @param {Object} config - Configuration
 * @returns {Object} Formatted result with metadata
 */
function formatStringValue(stringValue, config) {
    try {
        logDebug('Formatting string value, length: ' + (stringValue ? stringValue.length : 0), 'sampling');

        var result = {
            formattedValue: '',
            originalLength: 0,
            wasTruncated: false
        };

        if (typeof stringValue !== 'string') {
            result.formattedValue = '[Not a string]';
            logWarn('Non-string value passed to formatStringValue', 'sampling');
            return result;
        }

        result.originalLength = stringValue.length;
        var maxLength = config.maxStringLength || 500;

        if (stringValue.length > maxLength) {
            result.formattedValue = '"' + stringSubstring(stringValue, 0, maxLength) + '..."';
            result.wasTruncated = true;
            logDebug('String truncated from ' + stringValue.length + ' to ' + maxLength + ' characters', 'sampling');
        } else {
            result.formattedValue = '"' + stringValue + '"';
        }

        return result;

    } catch (exc) {
        logError('String formatting error: ' + exc.message, 'sampling');
        return {
            formattedValue: '[String format error]',
            originalLength: 0,
            wasTruncated: false,
            error: exc.message
        };
    }
}

/**
 * Format object value for display - ENHANCED LOGGING
 * @param {Object} objectValue - Object value to format
 * @param {Object} config - Configuration
 * @param {Object} referenceTracker - Reference tracker
 * @returns {Object} Formatted result with metadata
 */
function formatObjectValue(objectValue, config, referenceTracker) {
    var result = {
        formattedValue: '[Object]',
        metadata: {}
    };

    try {
        logDebug('Formatting object value, type: ' + typeof objectValue, 'sampling');

        if (!objectValue) {
            result.formattedValue = 'null';
            result.metadata.isNull = true;
            return result;
        }

        // Track object reference if enabled
        if (config.trackObjectReferences && referenceTracker) {
            var objectId = referenceTracker.track(objectValue);
            if (objectId) {
                result.metadata.objectReferenceId = objectId;
                logDebug('Object reference tracked: ' + objectId, 'sampling');
            }
        }

        // Enhanced object analysis
        result.metadata.isObject = true;

        // Check if it's an array
        if (typeof objectValue.length === 'number') {
            var arrayLength = safeGetLength(objectValue);
            result.formattedValue = '[Array: ' + arrayLength + ' items]';
            result.metadata.isArray = true;
            result.metadata.arrayLength = arrayLength;
            
            logDebug('Object identified as array with length: ' + arrayLength, 'sampling');

            // Sample array contents if shallow enough
            if (config.maxObjectDepth > 0 && arrayLength > 0) {
                try {
                    var sampleItems = [];
                    var maxSamples = Math.min(3, arrayLength);
                    for (var i = 0; i < maxSamples; i++) {
                        var item = objectValue[i];
                        sampleItems[sampleItems.length] = formatValueForPreview(item);
                    }
                    result.formattedValue = '[Array: ' + arrayLength + ' items] [' + 
                                          arrayJoin(sampleItems, ', ') + 
                                          (arrayLength > maxSamples ? ', ...' : '') + ']';
                    
                    logDebug('Array content preview generated with ' + maxSamples + ' sample items', 'sampling');
                } catch (arrayExc) {
                    logWarn('Array content sampling failed: ' + arrayExc.message, 'sampling');
                }
            }
        } else {
            // Regular object
            var propertyCount = countObjectKeys(objectValue);
            result.formattedValue = '[Object: ' + propertyCount + ' properties]';
            result.metadata.propertyCount = propertyCount;
            
            logDebug('Object has ' + propertyCount + ' properties', 'sampling');

            // Try to get object constructor name
            try {
                if (objectValue.constructor && objectValue.constructor.name) {
                    var constructorName = objectValue.constructor.name;
                    if (constructorName && constructorName !== 'Object') {
                        result.formattedValue = '[' + constructorName + ': ' + propertyCount + ' properties]';
                        result.metadata.constructorName = constructorName;
                        logDebug('Object constructor identified: ' + constructorName, 'sampling');
                    }
                }
            } catch (constructorExc) {
                logDebug('Constructor name access failed: ' + constructorExc.message, 'sampling');
            }

            // Enhanced InDesign object detection
            if (result.metadata.constructorName) {
                var constructorLower = stringToLowerCase(result.metadata.constructorName);
                if (stringIndexOf(constructorLower, 'indesign') !== -1 ||
                    stringIndexOf(constructorLower, 'document') !== -1 ||
                    stringIndexOf(constructorLower, 'page') !== -1 ||
                    stringIndexOf(constructorLower, 'story') !== -1) {
                    result.metadata.isInDesignObject = true;
                    logDebug('InDesign object detected: ' + result.metadata.constructorName, 'sampling');
                }
            }
        }

        return result;

    } catch (exc) {
        logError('Object formatting error: ' + exc.message, 'sampling');
        result.formattedValue = '[Object format error]';
        result.metadata.error = exc.message;
        return result;
    }
}

/**
 * Format value for preview display - ENHANCED LOGGING
 * @param {*} value - Value to format
 * @returns {String} Preview string
 */
function formatValueForPreview(value) {
    try {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';

        var valueType = typeof value;

        switch (valueType) {
            case 'string':
                var preview = value.length > 20 ? 
                    '"' + stringSubstring(value, 0, 20) + '..."' : 
                    '"' + value + '"';
                return preview;

            case 'number':
                return safeToString(value);

            case 'boolean':
                return value ? 'true' : 'false';

            case 'function':
                return '[Function]';

            case 'object':
                if (!value) return 'null';
                
                if (typeof value.length === 'number') {
                    return '[Array:' + value.length + ']';
                }
                
                try {
                    var objConstructor = value.constructor ? value.constructor.name : 'Object';
                    return '[' + objConstructor + ']';
                } catch (constructorExc) {
                    return '[Object]';
                }

            default:
                return '[' + valueType + ']';
        }

    } catch (exc) {
        logDebug('Preview formatting error: ' + exc.message, 'sampling');
        return '[preview error]';
    }
}

// =============================================================================
// METADATA FUNCTIONS - ENHANCED LOGGING
// =============================================================================

/**
 * Generate value fingerprint for duplicate detection - ENHANCED LOGGING
 * @param {*} value - Value to fingerprint
 * @param {String} valueType - Value type
 * @returns {String} Value fingerprint
 */
function generateValueFingerprint(value, valueType) {
    try {
        logDebug('Generating value fingerprint for type: ' + valueType, 'sampling');

        var fingerprint = valueType + ':';

        switch (valueType) {
            case 'string':
                // Hash based on length and first/last characters
                var str = safeToString(value);
                fingerprint += str.length + ':';
                if (str.length > 0) {
                    fingerprint += stringCharAt(str, 0);
                    if (str.length > 1) {
                        fingerprint += stringCharAt(str, str.length - 1);
                    }
                }
                break;

            case 'number':
                fingerprint += safeToString(value);
                break;

            case 'boolean':
                fingerprint += value ? 'T' : 'F';
                break;

            case 'object':
                if (!value) {
                    fingerprint += 'null';
                } else if (typeof value.length === 'number') {
                    fingerprint += 'array:' + value.length;
                } else {
                    var propCount = countObjectKeys(value);
                    fingerprint += 'object:' + propCount;
                    
                    // Add constructor name if available
                    try {
                        if (value.constructor && value.constructor.name) {
                            fingerprint += ':' + value.constructor.name;
                        }
                    } catch (constructorExc) {
                        // Ignore constructor access errors
                    }
                }
                break;

            case 'function':
                fingerprint += 'function';
                try {
                    if (value.name) {
                        fingerprint += ':' + value.name;
                    }
                } catch (nameExc) {
                    // Ignore name access errors
                }
                break;

            default:
                fingerprint += 'unknown';
                break;
        }

        logDebug('Generated fingerprint: ' + fingerprint, 'sampling');
        return fingerprint;

    } catch (exc) {
        logError('Fingerprint generation error: ' + exc.message, 'sampling');
        return 'error:' + exc.message;
    }
}

/**
 * Analyze property type with enhanced detection - ENHANCED LOGGING
 * @param {*} value - Property value
 * @param {String} propName - Property name
 * @returns {Object} Type analysis result
 */
function analyzePropertyType(value, propName) {
    try {
        logDebug('Analyzing property type for: ' + propName, 'sampling');

        var analysis = {
            basicType: typeof value,
            detailedType: typeof value,
            characteristics: [],
            confidence: 'high'
        };

        if (value === null) {
            analysis.detailedType = 'null';
            analysis.characteristics[analysis.characteristics.length] = 'null_value';
        } else if (value === undefined) {
            analysis.detailedType = 'undefined';
            analysis.characteristics[analysis.characteristics.length] = 'undefined_value';
        } else if (typeof value === 'object') {
            // Enhanced object type analysis
            if (typeof value.length === 'number') {
                analysis.detailedType = 'array';
                analysis.characteristics[analysis.characteristics.length] = 'has_length';
                analysis.characteristics[analysis.characteristics.length] = 'array_like';
                
                // Use authoritative collection detection from 2.1_dom-enumerator
                if (functionExists('isLikelyCollection') && isLikelyCollection(value)) {
                    analysis.characteristics[analysis.characteristics.length] = 'collection';
                    logDebug('Object identified as collection via authoritative detection', 'sampling');
                }
            } else {
                analysis.detailedType = 'object';
                analysis.characteristics[analysis.characteristics.length] = 'complex_object';
            }

            // Constructor analysis
            try {
                if (value.constructor && value.constructor.name) {
                    analysis.constructorName = value.constructor.name;
                    analysis.characteristics[analysis.characteristics.length] = 'has_constructor';
                    
                    // InDesign object detection
                    var constructorLower = stringToLowerCase(value.constructor.name);
                    if (stringIndexOf(constructorLower, 'indesign') !== -1) {
                        analysis.characteristics[analysis.characteristics.length] = 'indesign_object';
                    }
                }
            } catch (constructorExc) {
                analysis.confidence = 'medium';
            }
        } else if (typeof value === 'function') {
            analysis.characteristics[analysis.characteristics.length] = 'callable';
            
            try {
                if (value.name) {
                    analysis.functionName = value.name;
                }
            } catch (nameExc) {
                analysis.confidence = 'medium';
            }
        }

        // Property name pattern analysis
        if (propName) {
            var propLower = stringToLowerCase(propName);
            if (stringIndexOf(propLower, 'count') !== -1 || stringIndexOf(propLower, 'length') !== -1) {
                analysis.characteristics[analysis.characteristics.length] = 'count_property';
            }
            if (stringIndexOf(propLower, 'name') !== -1 || stringIndexOf(propLower, 'title') !== -1) {
                analysis.characteristics[analysis.characteristics.length] = 'name_property';
            }
        }

        logDebug('Property type analysis completed for: ' + propName + ', type: ' + analysis.detailedType, 'sampling');
        return analysis;

    } catch (exc) {
        logError('Property type analysis error for: ' + propName + ': ' + exc.message, 'sampling');
        return {
            basicType: 'unknown',
            detailedType: 'error',
            characteristics: ['analysis_error'],
            confidence: 'none',
            error: exc.message
        };
    }
}

// =============================================================================
// VALIDATION FUNCTIONS - ENHANCED LOGGING
// =============================================================================

/**
 * Validate sampling configuration - ENHANCED LOGGING
 * @param {Object} config - Configuration to validate
 * @returns {Object} Validation result
 */
function validateSamplingConfig(config) {
    try {
        logDebug('Validating sampling configuration', 'sampling');

        var result = {
            valid: true,
            errors: [],
            warnings: []
        };

        if (!config || typeof config !== 'object') {
            result.valid = false;
            result.errors[result.errors.length] = 'Configuration must be an object';
            logError('Invalid configuration object provided', 'sampling');
            return result;
        }

        // Validate numeric properties
        var numericProps = ['maxSamples', 'timeoutMs', 'maxStringLength', 'maxObjectDepth', 'maxCollectionDepth'];
        for (var i = 0; i < numericProps.length; i++) {
            var prop = numericProps[i];
            if (config[prop] !== undefined) {
                if (typeof config[prop] !== 'number' || config[prop] < 0) {
                    result.warnings[result.warnings.length] = prop + ' should be a positive number';
                    logWarn('Configuration warning: ' + prop + ' should be a positive number', 'sampling');
                }
            }
        }

        // Validate boolean properties
        var booleanProps = ['includeCollectionSamples', 'trackObjectReferences', 'includeValueMetadata', 
                           'generateValueFingerprints', 'enableProgressReporting', 'enableDetailedLogging', 
                           'skipNullValues', 'skipUndefinedValues', 'preserveOriginalTypes'];
        for (var j = 0; j < booleanProps.length; j++) {
            var boolProp = booleanProps[j];
            if (config[boolProp] !== undefined && typeof config[boolProp] !== 'boolean') {
                result.warnings[result.warnings.length] = boolProp + ' should be a boolean';
                logWarn('Configuration warning: ' + boolProp + ' should be a boolean', 'sampling');
            }
        }

        // Validate safety filter
        if (config.safetyFilter && typeof config.safetyFilter !== 'string') {
            result.warnings[result.warnings.length] = 'safetyFilter should be a string';
            logWarn('Configuration warning: safetyFilter should be a string', 'sampling');
        }

        // Check for reasonable values
        if (config.maxSamples && config.maxSamples > 10000) {
            result.warnings[result.warnings.length] = 'maxSamples is very high (' + config.maxSamples + '), may impact performance';
            logWarn('Performance warning: maxSamples is very high: ' + config.maxSamples, 'sampling');
        }

        if (config.timeoutMs && config.timeoutMs > 60000) {
            result.warnings[result.warnings.length] = 'timeoutMs is very high (' + config.timeoutMs + 'ms), may cause long delays';
            logWarn('Performance warning: timeoutMs is very high: ' + config.timeoutMs + 'ms', 'sampling');
        }

        if (result.warnings.length === 0) {
            logInfo('Configuration validation completed successfully with no warnings', 'sampling');
        } else {
            logInfo('Configuration validation completed with ' + result.warnings.length + ' warnings', 'sampling');
        }

        return result;

    } catch (exc) {
        logError('Configuration validation failed: ' + exc.message, 'sampling');
        return {
            valid: false,
            errors: ['Configuration validation failed: ' + exc.message],
            warnings: []
        };
    }
}

// =============================================================================
// MODULE REGISTRATION - UPDATED (REMOVED isLikelyCollection)
// =============================================================================

// Register this module with all its functions - NOTE: isLikelyCollection REMOVED (now in 2.1_dom-enumerator)
registerModule('3.1_property-sampler', '4.1', [
    // Main Functions
    'sampleDOMValues', 'sampleNodeValues', 'samplePropertyValue',

    // Value Formatting
    'formatStringValue', 'formatObjectValue', 'formatValueForPreview',

    // Metadata Functions
    'generateValueFingerprint', 'analyzePropertyType',

    // Validation
    'validateSamplingConfig'
]);

// =============================================================================
// END OF 3.1_property-sampler.jsx - ENHANCED WITH v4.1 IMPROVEMENTS
// =============================================================================