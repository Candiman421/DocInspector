// =============================================================================
// 3.1_property-sampler.jsx - PROPERTY VALUE SAMPLING
// InDesign DOM Discovery Builder v3.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: Property value sampling with reference tracking integration
// DEPENDENCIES: ["1.1_bootstrap-foundation.jsx", "1.2_safety-utilities.jsx", "2.1_dom-enumerator.jsx"]
// SIZE: ~1426 lines - COMPLETE IMPLEMENTATION - UPDATED LOGGING
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
// MAIN SAMPLING FUNCTIONS - UPDATED LOGGING
// =============================================================================

/**
 * Sample DOM property values with comprehensive tracking - UPDATED LOGGING
 * @param {Object} domStructure - DOM structure with discovered properties
 * @param {Object} sourceDocument - Source document for value access
 * @param {Object} samplingConfig - Sampling configuration
 * @returns {Object} DOM structure with sampled values
 */
function sampleDOMValues(domStructure, sourceDocument, samplingConfig) {
    var startTime = new Date().getTime();

    logDebug('=== STARTING sampleDOMValues ===', 'sampling');
    logDebug('domStructure type: ' + typeof domStructure, 'sampling');
    logDebug('sourceDocument type: ' + typeof sourceDocument, 'sampling');
    logDebug('samplingConfig type: ' + typeof samplingConfig, 'sampling');

    var config = samplingConfig ?
        objectMerge(DEFAULT_SAMPLING_CONFIG, samplingConfig) :
        DEFAULT_SAMPLING_CONFIG;

    logDebug('Merged config - maxSamples: ' + config.maxSamples, 'sampling');

    try {
        // Validate inputs
        if (!domStructure) {
            var errorMsg = 'No DOM structure provided for sampling';
            logError(errorMsg, 'sampling');
            return {
                error: errorMsg,
                timestamp: getCurrentTimestamp()
            };
        }

        if (!sourceDocument) {
            var docErrorMsg = 'No source document provided for sampling';
            logError(docErrorMsg, 'sampling');
            return {
                error: docErrorMsg,
                timestamp: getCurrentTimestamp()
            };
        }

        // Create working copy
        var workingStructure = objectClone(domStructure, 5);
        if (!workingStructure) {
            var cloneError = 'Failed to clone DOM structure';
            logError(cloneError, 'sampling');
            return {
                error: cloneError,
                timestamp: getCurrentTimestamp()
            };
        }

        logDebug('Working structure created successfully', 'sampling');

        // Set up reference tracker
        var referenceTracker = null;
        if (config.trackObjectReferences) {
            referenceTracker = createObjectReferenceTracker();
            logDebug('Object reference tracker initialized', 'sampling');
        }

        // Initialize sampling session
        var samplingSession = {
            startTime: startTime,
            timeoutChecker: createTimeoutChecker(config.timeoutMs),
            sampledCount: 0,
            skippedCount: 0,
            errorCount: 0,
            referenceTracker: referenceTracker
        };

        logDebug('Sampling session initialized', 'sampling');

        // Check structure format
        if (workingStructure.structure && workingStructure.structure.document) {
            logDebug('Processing structure with nested document format', 'sampling');
            sampleNodeValues(workingStructure.structure.document, sourceDocument, config, samplingSession);
        } else if (workingStructure.document) {
            logDebug('Processing structure with direct document format', 'sampling');
            sampleNodeValues(workingStructure.document, sourceDocument, config, samplingSession);
        } else {
            logWarn('Unexpected structure format - attempting direct processing', 'sampling');
            sampleNodeValues(workingStructure, sourceDocument, config, samplingSession);
        }

        var endTime = new Date().getTime();
        logDebug('=== SAMPLING COMPLETED ===', 'sampling');
        logDebug('Total time: ' + (endTime - startTime) + 'ms', 'sampling');
        logDebug('Properties sampled: ' + samplingSession.sampledCount, 'sampling');
        logDebug('Properties skipped: ' + samplingSession.skippedCount, 'sampling');
        logDebug('Errors encountered: ' + samplingSession.errorCount, 'sampling');

        // Add sampling metadata
        if (!workingStructure.metadata) {
            workingStructure.metadata = {};
        }
        workingStructure.metadata.samplingCompleted = true;
        workingStructure.metadata.samplingTime = endTime - startTime;
        workingStructure.metadata.propertiesSampled = samplingSession.sampledCount;
        workingStructure.metadata.propertiesSkipped = samplingSession.skippedCount;
        workingStructure.metadata.samplingErrors = samplingSession.errorCount;

        logInfo('Property sampling completed - ' + samplingSession.sampledCount + ' properties sampled in ' + (endTime - startTime) + 'ms', 'sampling');
        return workingStructure;

    } catch (exc) {
        logError('Property sampling failed: ' + exc.message, 'sampling');
        return {
            error: 'Property sampling failed: ' + exc.message,
            timestamp: getCurrentTimestamp()
        };
    }
}

/**
 * Sample values for DOM node recursively - UPDATED LOGGING
 * @param {Object} domNode - DOM node to sample
 * @param {Object} sourceDocument - Source document
 * @param {Object} config - Sampling configuration  
 * @param {Object} samplingSession - Sampling session data
 */
function sampleNodeValues(domNode, sourceDocument, config, samplingSession) {
    try {
        if (!domNode) {
            logWarn('Null DOM node encountered during sampling', 'sampling');
            return;
        }

        logDebug('Sampling node: ' + (domNode.path || 'unknown'), 'sampling');

        // Sample properties
        if (domNode.properties && domNode.properties.length > 0) {
            logDebug('Starting property sampling for ' + domNode.properties.length + ' properties', 'sampling');
            
            for (var i = 0; i < domNode.properties.length; i++) {
                // Check timeout
                if (samplingSession.timeoutChecker()) {
                    logWarn('Timeout reached during property sampling', 'sampling');
                    break;
                }

                var property = domNode.properties[i];
                try {
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
                                   (sampleResult.formattedValue ? sampleResult.formattedValue.substring(0, 50) : 'null'), 'sampling');
                        }
                    } else {
                        property.sampledValue = '[Sample Error: ' + (sampleResult ? sampleResult.error : 'unknown') + ']';
                        samplingSession.errorCount++;

                        if (i < 5) { // Debug first few errors
                            logDebug('Error sampling: ' + property.name + ' - ' + (sampleResult ? sampleResult.error : 'unknown'), 'sampling');
                        }
                    }
                } catch (propException) {
                    property.sampledValue = '[Exception: ' + propException.message + ']';
                    samplingSession.errorCount++;
                    logWarn('Property sampling exception: ' + property.name + ' - ' + propException.message, 'sampling');
                }

                // Report progress every 50 properties
                if ((i + 1) % 50 === 0) {
                    logDebug('Progress: ' + (i + 1) + '/' + domNode.properties.length + ' properties processed', 'sampling');
                }
            }
        }

        // Sample collections if present
        if (domNode.collections && config.includeCollectionSamples) {
            logDebug('Starting collection sampling for ' + domNode.collections.length + ' collections', 'sampling');
            for (var j = 0; j < domNode.collections.length; j++) {
                if (samplingSession.timeoutChecker()) {
                    logWarn('Timeout reached during collection sampling', 'sampling');
                    break;
                }

                var collection = domNode.collections[j];
                try {
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
                    } else {
                        collection.sampledValue = '[Collection Error: ' + (collectionSampleResult ?
                            collectionSampleResult.error : 'unknown') + ']';
                        samplingSession.errorCount++;
                    }
                } catch (collExc) {
                    collection.sampledValue = '[Collection Exception: ' + collExc.message + ']';
                    samplingSession.errorCount++;
                    logWarn('Collection sampling exception: ' + collection.name + ' - ' + collExc.message, 'sampling');
                }
            }
        }

        // Process child nodes recursively
        if (domNode.childNodes && domNode.childNodes.length > 0) {
            logDebug('Processing ' + domNode.childNodes.length + ' child nodes', 'sampling');
            for (var k = 0; k < domNode.childNodes.length; k++) {
                if (samplingSession.timeoutChecker()) {
                    logWarn('Timeout reached during child node processing', 'sampling');
                    break;
                }
                sampleNodeValues(domNode.childNodes[k], sourceDocument, config, samplingSession);
            }
        }

    } catch (exc) {
        logError('Node sampling error for ' + (domNode.path || 'unknown') + ': ' + exc.message, 'sampling');
    }
}

/**
 * Sample property value with reference tracking and metadata - UPDATED LOGGING
 * @param {Object} targetObject - Object containing the property
 * @param {String} propName - Property name to sample
 * @param {String} propPath - Full path to property
 * @param {Object} config - Sampling configuration
 * @param {Object} referenceTracker - Reference tracker for objects
 * @returns {Object} Sample result with metadata and object references
 */
function samplePropertyValue(targetObject, propName, propPath, config, referenceTracker) {
    // Static counter for debug limiting - PRESERVED from original
    if (typeof samplePropertyValue.debugCount === 'undefined') {
        samplePropertyValue.debugCount = 0;
    }
    var showDetailedDebug = samplePropertyValue.debugCount < 5;
    samplePropertyValue.debugCount++;

    // Use new debug system but preserve the 5-entry limit
    if (showDetailedDebug) {
        logDebug('#' + samplePropertyValue.debugCount + ' Sampling: ' + propName + ' (path: ' + propPath + ')', 'sampling');
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
            return result;
        }

        if (!propName || typeof propName !== 'string') {
            result.error = 'Invalid property name';
            return result;
        }

        if (showDetailedDebug) {
            logDebug('  - Accessing property: ' + propName, 'sampling');
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

        // Analyze value type and format
        var valueType = typeof propValue;
        result.metadata.valueType = valueType;

        if (showDetailedDebug) {
            logDebug('  - Value type: ' + valueType, 'sampling');
        }

        // Format based on type
        switch (valueType) {
            case 'string':
                result.formattedValue = formatStringValue(propValue, config);
                break;
            case 'number':
                result.formattedValue = String(propValue);
                break;
            case 'boolean':
                result.formattedValue = String(propValue);
                break;
            case 'object':
                var objectResult = formatObjectValue(propValue, propPath, config, referenceTracker);
                result.formattedValue = objectResult.formattedValue;
                result.metadata.objectInfo = objectResult.metadata;
                break;
            case 'function':
                result.formattedValue = '[Function: ' + propName + ']';
                result.metadata.functionInfo = {
                    name: propName,
                    accessible: true
                };
                break;
            default:
                result.formattedValue = '[' + valueType + ']';
        }

        // Generate value fingerprint if requested
        if (config.generateValueFingerprints) {
            result.metadata.fingerprint = generateValueFingerprint(propValue, valueType);
        }

        result.success = true;
        if (showDetailedDebug) {
            logDebug('  - Formatted as: ' + (result.formattedValue ? result.formattedValue.substring(0, 30) : 'null'), 'sampling');
        }

        return result;

    } catch (exc) {
        result.error = 'Property sampling exception: ' + exc.message;
        if (showDetailedDebug) {
            logDebug('  - Exception: ' + exc.message, 'sampling');
        }
        return result;
    }
}

// =============================================================================
// VALUE FORMATTING FUNCTIONS - UPDATED LOGGING
// =============================================================================

/**
 * Format string value for display - UPDATED LOGGING
 * @param {String} stringValue - String value to format
 * @param {Object} config - Configuration
 * @returns {String} Formatted string
 */
function formatStringValue(stringValue, config) {
    try {
        if (typeof stringValue !== 'string') {
            return '[Not a string]';
        }

        var maxLength = config.maxStringLength || 500;
        if (stringValue.length > maxLength) {
            var truncated = stringValue.substring(0, maxLength) + '... [truncated]';
            logDebug('String truncated from ' + stringValue.length + ' to ' + maxLength + ' chars', 'sampling');
            return '"' + truncated + '"';
        }

        return '"' + stringValue + '"';

    } catch (exc) {
        logError('String formatting error: ' + exc.message, 'sampling');
        return '[String format error]';
    }
}

/**
 * Format object value for display - UPDATED LOGGING
 * @param {Object} objectValue - Object value to format
 * @param {String} objectPath - Object path
 * @param {Object} config - Configuration
 * @param {Object} referenceTracker - Reference tracker
 * @returns {Object} Formatting result
 */
function formatObjectValue(objectValue, objectPath, config, referenceTracker) {
    var result = {
        formattedValue: '[Object]',
        metadata: {}
    };

    try {
        // Track object reference if enabled
        if (referenceTracker && config.trackObjectReferences) {
            var objectId = referenceTracker.track(objectValue);
            if (objectId) {
                result.metadata.objectId = objectId;
                logDebug('Object reference tracked: ' + objectId, 'sampling');
            }
        }

        // Analyze object structure
        var objectType = safeTypeCheck(objectValue);
        result.metadata.objectType = objectType;

        if (objectType === 'array') {
            var arrayLength = safeGetLength(objectValue);
            result.formattedValue = '[Array: ' + arrayLength + ' items]';
            result.metadata.arrayLength = arrayLength;
            
            // Sample array contents if shallow enough
            if (config.maxObjectDepth > 0 && arrayLength > 0) {
                try {
                    var sampleItems = [];
                    var maxSamples = Math.min(3, arrayLength);
                    for (var i = 0; i < maxSamples; i++) {
                        var item = objectValue[i];
                        sampleItems.push(formatValueForPreview(item));
                    }
                    result.formattedValue = '[Array: ' + arrayLength + ' items] [' + sampleItems.join(', ') + 
                                          (arrayLength > maxSamples ? ', ...' : '') + ']';
                } catch (arrayExc) {
                    logWarn('Array content sampling failed: ' + arrayExc.message, 'sampling');
                }
            }
        } else {
            // Regular object
            var propertyCount = countObjectKeys(objectValue);
            result.formattedValue = '[Object: ' + propertyCount + ' properties]';
            result.metadata.propertyCount = propertyCount;

            // Try to get object constructor name
            try {
                var constructorName = objectValue.constructor ? objectValue.constructor.name : 'Object';
                if (constructorName && constructorName !== 'Object') {
                    result.formattedValue = '[' + constructorName + ': ' + propertyCount + ' properties]';
                    result.metadata.constructorName = constructorName;
                }
            } catch (constructorExc) {
                // Ignore constructor access errors
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
 * Format value for preview display
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
                return value.length > 20 ? '"' + value.substring(0, 20) + '..."' : '"' + value + '"';
            case 'number':
            case 'boolean':
                return String(value);
            case 'object':
                return value.constructor ? '[' + value.constructor.name + ']' : '[Object]';
            case 'function':
                return '[Function]';
            default:
                return '[' + valueType + ']';
        }
    } catch (exc) {
        return '[Preview error]';
    }
}

// =============================================================================
// METADATA FUNCTIONS
// =============================================================================

/**
 * Generate value fingerprint
 * @param {*} value - Value to fingerprint
 * @param {String} valueType - Value type
 * @returns {String} Value fingerprint
 */
function generateValueFingerprint(value, valueType) {
    try {
        var fingerprint = valueType + ':';
        
        switch (valueType) {
            case 'string':
                fingerprint += 'len=' + value.length;
                break;
            case 'number':
                fingerprint += value;
                break;
            case 'boolean':
                fingerprint += value;
                break;
            case 'object':
                if (value === null) {
                    fingerprint += 'null';
                } else {
                    var objType = safeTypeCheck(value);
                    if (objType === 'array') {
                        fingerprint += 'array:len=' + safeGetLength(value);
                    } else {
                        fingerprint += 'obj:props=' + countObjectKeys(value);
                    }
                }
                break;
            case 'function':
                fingerprint += 'function';
                break;
            default:
                fingerprint += 'unknown';
        }
        
        return fingerprint;
        
    } catch (exc) {
        return 'error:' + valueType;
    }
}

/**
 * Analyze property type characteristics
 * @param {*} value - Property value
 * @param {String} propName - Property name
 * @returns {Object} Type analysis
 */
function analyzePropertyType(value, propName) {
    try {
        var analysis = {
            baseType: typeof value,
            isCollection: false,
            isMethod: false,
            isComplex: false,
            accessSafety: 'unknown'
        };
        
        if (analysis.baseType === 'function') {
            analysis.isMethod = true;
            analysis.accessSafety = 'safe';
        } else if (analysis.baseType === 'object') {
            if (value === null) {
                analysis.accessSafety = 'safe';
            } else {
                analysis.isComplex = true;
                analysis.isCollection = isLikelyCollection(propName);
                analysis.accessSafety = 'caution';
            }
        } else {
            analysis.accessSafety = 'safe';
        }
        
        return analysis;
        
    } catch (exc) {
        return {
            baseType: 'unknown',
            isCollection: false,
            isMethod: false,
            isComplex: false,
            accessSafety: 'dangerous',
            error: exc.message
        };
    }
}

/**
 * Check if property name suggests a collection
 * @param {String} propName - Property name
 * @returns {Boolean} True if likely collection
 */
function isLikelyCollection(propName) {
    try {
        if (typeof propName !== 'string') return false;

        var collectionIndicators = [
            'pages', 'items', 'children', 'contents', 'elements',
            'objects', 'collection', 'list', 'array', 'textFrames',
            'rectangles', 'ovals', 'polygons', 'lines', 'groups'
        ];

        var lowerPropName = stringToLowerCase(propName);
        for (var i = 0; i < collectionIndicators.length; i++) {
            if (stringIndexOf(lowerPropName, collectionIndicators[i]) !== -1) {
                return true;
            }
        }

        return false;

    } catch (exc) {
        return false;
    }
}

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validate sampling configuration
 * @param {Object} config - Configuration to validate
 * @returns {Object} Validation result
 */
function validateSamplingConfig(config) {
    try {
        var result = {
            valid: true,
            errors: [],
            warnings: []
        };
        
        if (!config || typeof config !== 'object') {
            result.valid = false;
            result.errors.push('Configuration is not an object');
            return result;
        }
        
        // Validate numeric properties
        var numericProps = ['maxSamples', 'timeoutMs', 'maxStringLength', 'maxObjectDepth'];
        for (var i = 0; i < numericProps.length; i++) {
            var prop = numericProps[i];
            if (config[prop] !== undefined && (typeof config[prop] !== 'number' || config[prop] < 0)) {
                result.warnings.push(prop + ' should be a positive number');
            }
        }
        
        // Validate safety filter
        if (config.safetyFilter && typeof config.safetyFilter !== 'string') {
            result.warnings.push('safetyFilter should be a string');
        }
        
        return result;
        
    } catch (exc) {
        return {
            valid: false,
            errors: ['Configuration validation failed: ' + exc.message],
            warnings: []
        };
    }
}

// =============================================================================
// MODULE REGISTRATION - COMPLETE FUNCTION LIST
// =============================================================================

// Register this module with all its functions
registerModule('3.1_property-sampler', '3.1', [
    // Main Functions
    'sampleDOMValues', 'sampleNodeValues', 'samplePropertyValue',
    
    // Value Formatting
    'formatStringValue', 'formatObjectValue', 'formatValueForPreview',
    
    // Metadata Functions
    'generateValueFingerprint', 'analyzePropertyType', 'isLikelyCollection',
    
    // Validation
    'validateSamplingConfig'
]);

// =============================================================================
// END OF 3.1_property-sampler.jsx - UPDATED LOGGING SYSTEM
// =============================================================================