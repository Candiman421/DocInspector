// =============================================================================
// 4.0_property-sampler.jsx - PROPERTY VALUE SAMPLING
// InDesign DOM Discovery Builder v2.1.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: Property value sampling with reference tracking integration
// DEPENDENCIES: ["1.0_safe-foundation.jsx", "2.0_dom-enumerator.jsx"]
// SIZE: ~1000 lines
// =============================================================================

// =============================================================================
// DEPENDENCY VALIDATION
// =============================================================================

var PROPERTY_SAMPLER_DEPENDENCIES = ['1.0_safe-foundation', '2.0_dom-enumerator'];
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
// MAIN SAMPLING FUNCTIONS
// =============================================================================

/**
 * FIXED: Property value sampling with proper configuration usage
 * @param {Object} domStructure - DOM structure to sample
 * @param {Object} sourceDocument - Source document for value access
 * @param {Object} samplingConfig - Sampling configuration (USER SETTINGS)
 * @returns {Object} DOM structure with values and reference tracking
 */
function sampleDOMValues(domStructure, sourceDocument, samplingConfig) {
    var startTime = new Date().getTime();
    
    // FIXED: Use passed config as primary, only fill in missing values from defaults
    var config = mergePropertySamplingConfig(DEFAULT_SAMPLING_CONFIG, samplingConfig);
    
    var samplingStats = {
        startTime: startTime,
        propertiesSampled: 0,
        valuesSampled: 0,
        fingerprintsGenerated: 0,
        samplingErrors: 0,
        timeoutCount: 0,
        safetyFilterRejects: 0,
        nullValuesSkipped: 0,
        undefinedValuesSkipped: 0,
        collectionsSampled: 0,
        configurationUsed: config
    };
    
    var referenceTracker = config.trackObjectReferences ? createObjectReferenceTracker() : null;
    
    try {
        // Validate inputs
        if (!domStructure || !sourceDocument) {
            throw new Error('Invalid DOM structure or source document');
        }
        
        if (config.enableProgressReporting) {
            logSamplingProgress('Starting property value sampling with config: ' + safeJSONStringify(config, 2));
        }
        
        // Sample values from the document structure
        if (domStructure.structure && domStructure.structure.document) {
            sampleNodeValues(domStructure.structure.document, sourceDocument, config, samplingStats, referenceTracker);
        }
        
        // Add sampling metadata to DOM structure
        var endTime = new Date().getTime();
        samplingStats.samplingTime = endTime - startTime;
        samplingStats.endTime = endTime;
        
        if (domStructure.metadata) {
            domStructure.metadata.valueSampling = {
                enabled: true,
                timestamp: getCurrentTimestamp(),
                statistics: samplingStats,
                configuration: config,
                referenceTracking: referenceTracker ? referenceTracker.getStatistics() : null,
                performance: {
                    totalTime: samplingStats.samplingTime,
                    averageTimePerProperty: samplingStats.propertiesSampled > 0 ? 
                        samplingStats.samplingTime / samplingStats.propertiesSampled : 0,
                    successRate: samplingStats.propertiesSampled > 0 ? 
                        (samplingStats.valuesSampled / samplingStats.propertiesSampled) * 100 : 0
                }
            };
        }
        
        if (config.enableProgressReporting) {
            logSamplingProgress('Property sampling completed: ' + samplingStats.valuesSampled + 
                              ' values extracted from ' + samplingStats.propertiesSampled + ' properties');
        }
        
        return domStructure;
        
    } catch (exc) {
        if (domStructure && domStructure.metadata) {
            domStructure.metadata.valueSampling = {
                enabled: false,
                error: 'Value sampling failed: ' + exc.message,
                timestamp: getCurrentTimestamp(),
                statistics: samplingStats,
                configuration: config
            };
        }
        
        if (config.enableDetailedLogging) {
            logSamplingError('Property sampling failed: ' + exc.message);
        }
        
        return domStructure;
    }
}

/**
 * Sample property value with reference tracking and metadata
 * @param {Object} targetObj - Object containing the property
 * @param {String} propName - Property name to sample
 * @param {String} propPath - Full path to property
 * @param {Object} config - Sampling configuration
 * @param {Object} referenceTracker - Reference tracker for objects
 * @returns {Object} Sample result with metadata and object references
 */
function samplePropertyValue(targetObj, propName, propPath, config, referenceTracker) {
    var result = {
        success: false,
        value: null,
        formattedValue: '',
        valueType: 'unknown',
        valueMetadata: null,
        valueFingerprint: null,
        objectReference: null,
        error: null,
        samplingMethod: 'direct',
        accessTime: 0
    };
    
    var startTime = new Date().getTime();
    
    try {
        // Parameter validation
        if (!targetObj || typeof targetObj !== 'object') {
            result.error = 'Invalid target object';
            return result;
        }
        
        if (!propName || typeof propName !== 'string') {
            result.error = 'Invalid property name';
            return result;
        }
        
        // Get the property value safely
        var valueAccess = safeGetPropertyValue(targetObj, propName, config.timeoutMs);
        if (!valueAccess.success) {
            result.error = valueAccess.error;
            result.samplingMethod = 'failed';
            return result;
        }
        
        var propertyValue = valueAccess.value;
        result.value = propertyValue;
        result.valueType = safeTypeCheck(targetObj, propName);
        result.success = true;
        result.accessTime = new Date().getTime() - startTime;
        
        // Handle null/undefined skipping based on config
        if (config.skipNullValues && propertyValue === null) {
            result.skipped = true;
            result.skipReason = 'null_value';
            return result;
        }
        
        if (config.skipUndefinedValues && propertyValue === undefined) {
            result.skipped = true;
            result.skipReason = 'undefined_value';
            return result;
        }
        
        // Generate value metadata if enabled
        if (config.includeValueMetadata) {
            result.valueMetadata = generateValueMetadata(propertyValue, config);
        }
        
        // Generate value fingerprint if enabled
        if (config.generateValueFingerprints) {
            result.valueFingerprint = generateValueFingerprint(propertyValue, propPath);
        }
        
        // Track object reference if enabled and value is an object
        if (referenceTracker && propertyValue && typeof propertyValue === 'object') {
            result.objectReference = referenceTracker.track(propertyValue, propPath);
        }
        
        // Format value for display
        result.formattedValue = formatSampleValue(propertyValue, config);
        
        // Enhanced collection handling
        if (config.includeCollectionSamples && isCollectionLike(propertyValue)) {
            result.collectionInfo = analyzeCollection(propertyValue, config);
        }
        
        return result;
        
    } catch (exc) {
        result.error = 'Property sampling error: ' + exc.message;
        result.samplingMethod = 'error';
        result.accessTime = new Date().getTime() - startTime;
        return result;
    }
}

/**
 * Enhanced safe property value getter with retry logic
 * @param {Object} obj - Object to access
 * @param {String} propName - Property name
 * @param {Number} timeoutMs - Timeout in milliseconds
 * @returns {Object} Access result with success, value, error
 */
function safeGetPropertyValue(obj, propName, timeoutMs) {
    var result = {
        success: false,
        value: null,
        error: '',
        accessMethod: 'direct',
        retryCount: 0
    };
    
    try {
        if (!obj || typeof obj !== 'object') {
            result.error = 'Invalid object';
            return result;
        }
        
        if (!propName || typeof propName !== 'string') {
            result.error = 'Invalid property name';
            return result;
        }
        
        if (!safeHasProperty(obj, propName)) {
            result.error = 'Property does not exist';
            result.accessMethod = 'missing';
            return result;
        }
        
        var timeoutChecker = createTimeoutChecker(timeoutMs || 2000);
        
        // Primary access attempt
        try {
            result.value = obj[propName];
            result.success = true;
            result.accessMethod = 'direct';
            
            if (timeoutChecker && timeoutChecker()) {
                result.error = 'Timeout during property access';
                result.success = false;
                result.accessMethod = 'timeout';
            }
            
        } catch (accessExc) {
            // Retry with alternative access method
            try {
                result.retryCount++;
                if (objectHasOwnProperty(obj, propName)) {
                    result.value = obj[propName];
                    result.success = true;
                    result.accessMethod = 'hasOwnProperty';
                } else {
                    result.error = 'Property access error: ' + accessExc.message;
                    result.accessMethod = 'failed';
                }
            } catch (retryExc) {
                result.error = 'Property access failed on retry: ' + retryExc.message;
                result.accessMethod = 'retry_failed';
            }
        }
        
        return result;
        
    } catch (exc) {
        result.error = 'Safe property access error: ' + exc.message;
        result.accessMethod = 'exception';
        return result;
    }
}

// =============================================================================
// VALUE ANALYSIS FUNCTIONS
// =============================================================================

/**
 * Generate comprehensive value metadata for analysis
 * @param {*} value - Value to analyze
 * @param {Object} config - Configuration
 * @returns {Object} Value metadata
 */
function generateValueMetadata(value, config) {
    try {
        var metadata = {
            type: typeof value,
            isNull: value === null,
            isUndefined: value === undefined,
            isEmpty: false,
            length: 0,
            constructor: null,
            isCollection: false,
            hasContent: false,
            isNumeric: false,
            isString: false,
            isBoolean: false,
            isObject: false,
            isArray: false,
            isFunction: false,
            complexity: 'simple'
        };
        
        // Basic type analysis
        metadata.isString = typeof value === 'string';
        metadata.isNumeric = typeof value === 'number';
        metadata.isBoolean = typeof value === 'boolean';
        metadata.isFunction = typeof value === 'function';
        metadata.isObject = typeof value === 'object' && value !== null;
        
        // Type-specific analysis
        if (metadata.isString) {
            metadata.length = value.length;
            metadata.isEmpty = value.length === 0;
            metadata.hasContent = value.length > 0;
            metadata.complexity = value.length > 100 ? 'complex' : 'simple';
        } else if (metadata.isNumeric) {
            metadata.hasContent = !isNaN(value) && isFinite(value);
            metadata.isInteger = value === Math.floor(value);
            metadata.isPositive = value > 0;
            metadata.isNegative = value < 0;
        } else if (metadata.isBoolean) {
            metadata.hasContent = true;
        } else if (metadata.isObject) {
            metadata.constructor = (value.constructor && value.constructor.name) || 'Object';
            
            // Check for array
            if (value instanceof Array) {
                metadata.isArray = true;
                metadata.isCollection = true;
                metadata.length = value.length;
                metadata.hasContent = value.length > 0;
                metadata.complexity = value.length > 50 ? 'complex' : 'simple';
            }
            // Check for collection properties
            else if (typeof value.length === 'number') {
                metadata.isCollection = true;
                metadata.length = value.length;
                metadata.hasContent = value.length > 0;
                metadata.complexity = value.length > 20 ? 'complex' : 'simple';
            } else if (typeof value.count === 'number') {
                metadata.isCollection = true;
                metadata.length = value.count;
                metadata.hasContent = value.count > 0;
                metadata.complexity = value.count > 20 ? 'complex' : 'simple';
            } else {
                // Object properties count
                metadata.length = countObjectKeys(value);
                metadata.hasContent = metadata.length > 0;
                metadata.complexity = metadata.length > 10 ? 'complex' : 'simple';
            }
        }
        
        // Additional analysis based on config
        if (config.includeCollectionSamples && metadata.isCollection) {
            metadata.collectionType = determineCollectionType(value);
            metadata.sampleItems = extractCollectionSample(value, Math.min(3, config.maxSamples));
        }
        
        return metadata;
        
    } catch (exc) {
        return {
            type: 'error',
            error: exc.message,
            hasContent: false,
            complexity: 'error'
        };
    }
}

/**
 * Generate enhanced value fingerprint for change detection
 * @param {*} value - Value to fingerprint
 * @param {String} path - Property path
 * @returns {String} Value fingerprint
 */
function generateValueFingerprint(value, path) {
    try {
        var components = [];
        
        components.push('path:' + (path || 'unknown'));
        components.push('type:' + typeof value);
        
        if (value === null) {
            components.push('value:null');
        } else if (value === undefined) {
            components.push('value:undefined');
        } else if (typeof value === 'string') {
            components.push('length:' + value.length);
            if (value.length > 0 && value.length <= 50) {
                components.push('content:' + value);
            } else if (value.length > 50) {
                components.push('hash:' + generateSimpleHash(value));
            }
        } else if (typeof value === 'number') {
            components.push('value:' + value);
            if (value === Math.floor(value)) {
                components.push('integer:true');
            }
        } else if (typeof value === 'boolean') {
            components.push('value:' + value);
        } else if (typeof value === 'object') {
            if (typeof value.length === 'number') {
                components.push('length:' + value.length);
            } else if (typeof value.count === 'number') {
                components.push('count:' + value.count);
            } else {
                components.push('keys:' + countObjectKeys(value));
            }
            
            if (value.constructor && value.constructor.name) {
                components.push('constructor:' + value.constructor.name);
            }
            
            // Add structural fingerprint for objects
            if (value instanceof Array) {
                components.push('array:true');
            } else {
                components.push('object:true');
            }
        } else if (typeof value === 'function') {
            components.push('function:true');
            if (value.name) {
                components.push('name:' + value.name);
            }
        }
        
        components.push('timestamp:' + new Date().getTime());
        
        return arrayJoin(components, '|');
        
    } catch (exc) {
        return 'fingerprint_error:' + (path || 'unknown') + '|timestamp:' + new Date().getTime();
    }
}

/**
 * Format sampled value for display with enhanced options
 * @param {*} value - Value to format
 * @param {Object} config - Configuration
 * @returns {String} Formatted value
 */
function formatSampleValue(value, config) {
    try {
        if (value === null) {
            return 'null';
        } else if (value === undefined) {
            return 'undefined';
        } else if (typeof value === 'string') {
            var maxLen = config.maxStringLength || 100;
            if (value.length <= maxLen) {
                return '"' + value + '"';
            } else {
                return '"' + stringSubstring(value, 0, maxLen) + '..." (' + value.length + ' chars)';
            }
        } else if (typeof value === 'number') {
            if (value === Math.floor(value)) {
                return String(value) + ' (integer)';
            } else {
                return String(value) + ' (float)';
            }
        } else if (typeof value === 'boolean') {
            return String(value) + ' (boolean)';
        } else if (typeof value === 'function') {
            var funcName = value.name || 'anonymous';
            return '[Function: ' + funcName + ']';
        } else if (typeof value === 'object') {
            var objInfo = '';
            
            if (value.constructor && value.constructor.name) {
                objInfo = value.constructor.name;
            } else {
                objInfo = 'Object';
            }
            
            if (typeof value.length === 'number') {
                objInfo += ' [' + value.length + ' items]';
            } else if (typeof value.count === 'number') {
                objInfo += ' [' + value.count + ' items]';
            } else {
                var keyCount = countObjectKeys(value);
                if (keyCount > 0) {
                    objInfo += ' [' + keyCount + ' properties]';
                }
            }
            
            // Add preview for collections if enabled
            if (config.includeCollectionSamples && isCollectionLike(value)) {
                var preview = getCollectionPreview(value, 2);
                if (preview) {
                    objInfo += ' Preview: ' + preview;
                }
            }
            
            return objInfo;
        } else {
            return typeof value + ' (unknown)';
        }
        
    } catch (exc) {
        return 'format_error: ' + exc.message;
    }
}

// =============================================================================
// NODE VALUE SAMPLING FUNCTIONS
// =============================================================================

/**
 * Sample values from a DOM node and its children
 * @param {Object} domNode - DOM node to sample from
 * @param {Object} sourceDocument - Source document for value access
 * @param {Object} config - Configuration
 * @param {Object} samplingStats - Statistics to update
 * @param {Object} referenceTracker - Reference tracker
 */
function sampleNodeValues(domNode, sourceDocument, config, samplingStats, referenceTracker) {
    try {
        if (!domNode || !sourceDocument) {
            return;
        }
        
        var nodeStartTime = new Date().getTime();
        
        try {
            // Sample property values if available
            if (domNode.properties && domNode.properties.length) {
                samplePropertiesFromArray(domNode.properties, sourceDocument, config, samplingStats, referenceTracker);
            }
            
            // Sample collection values if enabled
            if (config.includeCollectionSamples && domNode.collections && domNode.collections.length) {
                samplePropertiesFromArray(domNode.collections, sourceDocument, config, samplingStats, referenceTracker);
                samplingStats.collectionsSampled += domNode.collections.length;
            }
            
            // Recursively sample child nodes
            if (domNode.childNodes && domNode.childNodes.length) {
                for (var i = 0; i < domNode.childNodes.length; i++) {
                    sampleNodeValues(domNode.childNodes[i], sourceDocument, config, samplingStats, referenceTracker);
                }
            }
            
            if (config.enableProgressReporting) {
                var nodeTime = new Date().getTime() - nodeStartTime;
                if (nodeTime > 1000) { // Log only slow nodes
                    logSamplingProgress('Node sampling took ' + nodeTime + 'ms for: ' + (domNode.name || 'unknown'));
                }
            }
            
        } catch (nodeExc) {
            samplingStats.samplingErrors++;
            if (config.enableDetailedLogging) {
                logSamplingError('Node sampling error for ' + (domNode.name || 'unknown') + ': ' + nodeExc.message);
            }
        }
        
    } catch (exc) {
        samplingStats.samplingErrors++;
        if (config.enableDetailedLogging) {
            logSamplingError('Node sampling exception: ' + exc.message);
        }
    }
}

/**
 * FIXED: Sample property values from property array with proper path resolution
 * @param {Array} properties - Array of property classifications
 * @param {Object} sourceDocument - Source document for value access
 * @param {Object} config - Configuration
 * @param {Object} samplingStats - Statistics to update
 * @param {Object} referenceTracker - Reference tracker
 */
function samplePropertiesFromArray(properties, sourceDocument, config, samplingStats, referenceTracker) {
    try {
        var sampledCount = 0;
        var timeoutChecker = createTimeoutChecker(config.timeoutMs);
        
        // Safe array iteration
        var propertiesToSample = arraySlice(properties, 0, Math.min(properties.length, config.maxSamples));
        
        for (var i = 0; i < propertiesToSample.length; i++) {
            if (timeoutChecker && timeoutChecker()) {
                samplingStats.timeoutCount++;
                break;
            }
            
            if (sampledCount >= config.maxSamples) {
                break;
            }
            
            var propertyData = propertiesToSample[i];
            
            if (meetsSafetyFilter(propertyData, config.safetyFilter)) {
                // Get the parent object for value sampling
                var pathComponents = splitPath(propertyData.path);
                if (pathComponents.length >= 1) {
                    var parentPath = '';
                    var propName = '';
                    
                    if (pathComponents.length === 1) {
                        // Root level property (e.g., "pages")
                        parentPath = 'document';
                        propName = pathComponents[0];
                    } else {
                        // Nested property (e.g., "document.pages")
                        parentPath = getParentPath(propertyData.path);
                        propName = pathComponents[pathComponents.length - 1];
                    }
                    
                    // FIXED: Use corrected path resolution from 1.0_safe-foundation.jsx
                    var parentAccess = safeGetObjectFromPath(sourceDocument, parentPath, config.timeoutMs);
                    if (parentAccess.success && parentAccess.value) {
                        // Use enhanced safe function to extract the actual value
                        var valueResult = samplePropertyValue(
                            parentAccess.value, 
                            propName, 
                            propertyData.path, 
                            config, 
                            referenceTracker
                        );
                        
                        if (valueResult.success && !valueResult.skipped) {
                            // Store actual extracted value with comprehensive metadata
                            propertyData.samplingMetadata = {
                                actualValue: valueResult.formattedValue,
                                rawValue: valueResult.value,
                                valueType: valueResult.valueType,
                                valueFingerprint: valueResult.valueFingerprint,
                                valueMetadata: valueResult.valueMetadata,
                                safetyLevel: propertyData.safetyLevel,
                                samplingPath: propertyData.path,
                                parentPath: parentPath,
                                timestamp: getCurrentTimestamp(),
                                extractionSuccessful: true,
                                accessMethod: valueResult.samplingMethod,
                                accessTime: valueResult.accessTime,
                                objectReference: valueResult.objectReference
                            };
                            
                            // Store in property classification for access
                            propertyData.extractedValue = valueResult.value;
                            propertyData.valueFingerprint = valueResult.valueFingerprint;
                            propertyData.lastExtracted = getCurrentTimestamp();
                            propertyData.extractionMetadata = valueResult.valueMetadata;
                            
                            samplingStats.valuesSampled++;
                            samplingStats.propertiesSampled++;
                            
                            if (valueResult.valueFingerprint) {
                                samplingStats.fingerprintsGenerated++;
                            }
                            
                            sampledCount++;
                            
                        } else if (valueResult.skipped) {
                            // Handle skipped values
                            propertyData.samplingMetadata = {
                                extractionSkipped: true,
                                skipReason: valueResult.skipReason,
                                samplingPath: propertyData.path,
                                timestamp: getCurrentTimestamp()
                            };
                            
                            if (valueResult.skipReason === 'null_value') {
                                samplingStats.nullValuesSkipped++;
                            } else if (valueResult.skipReason === 'undefined_value') {
                                samplingStats.undefinedValuesSkipped++;
                            }
                            
                            samplingStats.propertiesSampled++;
                            
                        } else {
                            // Store extraction failure information
                            propertyData.samplingMetadata = {
                                extractionFailed: true,
                                error: valueResult.error,
                                samplingPath: propertyData.path,
                                parentPath: parentPath,
                                accessMethod: valueResult.samplingMethod,
                                timestamp: getCurrentTimestamp()
                            };
                            
                            samplingStats.samplingErrors++;
                        }
                    } else {
                        // Parent object access failed
                        propertyData.samplingMetadata = {
                            parentAccessFailed: true,
                            error: parentAccess.error,
                            parentPath: parentPath,
                            samplingPath: propertyData.path,
                            timestamp: getCurrentTimestamp()
                        };
                        
                        samplingStats.samplingErrors++;
                    }
                } else {
                    // Path too short for parent resolution
                    samplingStats.samplingErrors++;
                    if (config.enableDetailedLogging) {
                        logSamplingError('Invalid path for property: ' + (propertyData.path || 'unknown'));
                    }
                }
            } else {
                // Property didn't meet safety filter
                samplingStats.safetyFilterRejects++;
            }
        }
        
    } catch (exc) {
        samplingStats.samplingErrors++;
        if (config.enableDetailedLogging) {
            logSamplingError('Property array sampling error: ' + exc.message);
        }
    }
}

// =============================================================================
// COLLECTION ANALYSIS FUNCTIONS
// =============================================================================

/**
 * Check if value is collection-like
 * @param {*} value - Value to check
 * @returns {Boolean} True if collection-like
 */
function isCollectionLike(value) {
    try {
        if (!value || typeof value !== 'object') return false;
        return (typeof value.length === 'number') || (typeof value.count === 'number') || (value instanceof Array);
    } catch (exc) {
        return false;
    }
}

/**
 * Analyze collection structure and content
 * @param {Object} collection - Collection to analyze
 * @param {Object} config - Configuration
 * @returns {Object} Collection analysis
 */
function analyzeCollection(collection, config) {
    try {
        var analysis = {
            type: 'unknown',
            length: 0,
            isEmpty: true,
            hasItems: false,
            itemTypes: [],
            sampleItems: [],
            complexity: 'simple'
        };
        
        if (!collection || typeof collection !== 'object') {
            return analysis;
        }
        
        // Determine collection type and length
        if (collection instanceof Array) {
            analysis.type = 'Array';
            analysis.length = collection.length;
        } else if (typeof collection.length === 'number') {
            analysis.type = 'Collection';
            analysis.length = collection.length;
        } else if (typeof collection.count === 'number') {
            analysis.type = 'CountCollection';
            analysis.length = collection.count;
        } else {
            analysis.type = 'Object';
            analysis.length = countObjectKeys(collection);
        }
        
        analysis.isEmpty = analysis.length === 0;
        analysis.hasItems = analysis.length > 0;
        analysis.complexity = analysis.length > 20 ? 'complex' : 'simple';
        
        // Sample items if collection has content
        if (analysis.hasItems && config.includeCollectionSamples) {
            analysis.sampleItems = extractCollectionSample(collection, Math.min(3, config.maxSamples));
            analysis.itemTypes = getCollectionItemTypes(collection, 5);
        }
        
        return analysis;
        
    } catch (exc) {
        return {
            type: 'error',
            error: exc.message,
            length: 0,
            isEmpty: true,
            hasItems: false
        };
    }
}

/**
 * Extract sample items from collection
 * @param {Object} collection - Collection to sample
 * @param {Number} maxSamples - Maximum samples to extract
 * @returns {Array} Sample items
 */
function extractCollectionSample(collection, maxSamples) {
    try {
        var samples = [];
        var maxItems = maxSamples || 3;
        
        if (collection instanceof Array) {
            for (var i = 0; i < Math.min(collection.length, maxItems); i++) {
                samples.push(formatSampleValue(collection[i], { maxStringLength: 50 }));
            }
        } else if (typeof collection.length === 'number') {
            for (var j = 0; j < Math.min(collection.length, maxItems); j++) {
                try {
                    var item = collection[j];
                    samples.push(formatSampleValue(item, { maxStringLength: 50 }));
                } catch (itemExc) {
                    samples.push('[Item access error]');
                }
            }
        }
        
        return samples;
        
    } catch (exc) {
        return ['[Sample extraction error]'];
    }
}

/**
 * Get types of items in collection
 * @param {Object} collection - Collection to analyze
 * @param {Number} maxCheck - Maximum items to check
 * @returns {Array} Array of item types
 */
function getCollectionItemTypes(collection, maxCheck) {
    try {
        var types = [];
        var maxItems = maxCheck || 5;
        
        if (collection instanceof Array) {
            for (var i = 0; i < Math.min(collection.length, maxItems); i++) {
                var itemType = typeof collection[i];
                if (arrayIndexOf(types, itemType) === -1) {
                    types.push(itemType);
                }
            }
        } else if (typeof collection.length === 'number') {
            for (var j = 0; j < Math.min(collection.length, maxItems); j++) {
                try {
                    var item = collection[j];
                    var itemType = typeof item;
                    if (arrayIndexOf(types, itemType) === -1) {
                        types.push(itemType);
                    }
                } catch (itemExc) {
                    if (arrayIndexOf(types, 'error') === -1) {
                        types.push('error');
                    }
                }
            }
        }
        
        return types;
        
    } catch (exc) {
        return ['unknown'];
    }
}

/**
 * Get collection preview string
 * @param {Object} collection - Collection to preview
 * @param {Number} maxItems - Maximum items to include
 * @returns {String} Preview string
 */
function getCollectionPreview(collection, maxItems) {
    try {
        var samples = extractCollectionSample(collection, maxItems || 2);
        if (samples.length === 0) return '';
        
        var preview = arrayJoin(samples, ', ');
        if (collection.length > samples.length) {
            preview += ', ...';
        }
        
        return preview;
        
    } catch (exc) {
        return '';
    }
}

/**
 * Determine collection type
 * @param {Object} collection - Collection to analyze
 * @returns {String} Collection type
 */
function determineCollectionType(collection) {
    try {
        if (collection instanceof Array) return 'Array';
        if (collection.constructor && collection.constructor.name) return collection.constructor.name;
        if (typeof collection.length === 'number') return 'IndexedCollection';
        if (typeof collection.count === 'number') return 'CountedCollection';
        return 'Object';
    } catch (exc) {
        return 'Unknown';
    }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if property meets safety filter criteria
 * @param {Object} propertyData - Property classification data
 * @param {String} safetyFilter - Safety filter level
 * @returns {Boolean} True if property meets filter criteria
 */
function meetsSafetyFilter(propertyData, safetyFilter) {
    try {
        if (!propertyData || !propertyData.safetyLevel) {
            return false;
        }
        
        var propSafety = propertyData.safetyLevel;
        
        switch (safetyFilter) {
            case 'safe':
                return propSafety === 'safe';
                
            case 'moderate':
                return propSafety === 'safe' || propSafety === 'moderate';
                
            case 'risky':
                return propSafety === 'safe' || propSafety === 'moderate' || propSafety === 'risky';
                
            case 'all':
                return true;
                
            default:
                return propSafety === 'safe';
        }
        
    } catch (exc) {
        return false;
    }
}

/**
 * Get comprehensive sampling statistics from DOM structure
 * @param {Object} domStructure - DOM structure with sampling metadata
 * @returns {Object} Sampling statistics
 */
function getSamplingStatistics(domStructure) {
    try {
        var stats = {
            samplingEnabled: false,
            propertiesSampled: 0,
            valuesSampled: 0,
            samplingTime: 0,
            objectReferencesTracked: 0,
            fingerprintsGenerated: 0,
            samplingErrors: 0,
            timeoutCount: 0,
            safetyFilterRejects: 0,
            nullValuesSkipped: 0,
            undefinedValuesSkipped: 0,
            collectionsSampled: 0,
            successRate: 0,
            averageTimePerProperty: 0
        };
        
        if (!domStructure || !domStructure.metadata) {
            return stats;
        }
        
        var samplingMeta = domStructure.metadata.valueSampling;
        if (samplingMeta) {
            stats.samplingEnabled = samplingMeta.enabled || false;
            
            if (samplingMeta.statistics) {
                var samplingStats = samplingMeta.statistics;
                stats.propertiesSampled = samplingStats.propertiesSampled || 0;
                stats.valuesSampled = samplingStats.valuesSampled || 0;
                stats.fingerprintsGenerated = samplingStats.fingerprintsGenerated || 0;
                stats.samplingErrors = samplingStats.samplingErrors || 0;
                stats.timeoutCount = samplingStats.timeoutCount || 0;
                stats.safetyFilterRejects = samplingStats.safetyFilterRejects || 0;
                stats.nullValuesSkipped = samplingStats.nullValuesSkipped || 0;
                stats.undefinedValuesSkipped = samplingStats.undefinedValuesSkipped || 0;
                stats.collectionsSampled = samplingStats.collectionsSampled || 0;
            }
            
            if (samplingMeta.referenceTracking) {
                stats.objectReferencesTracked = samplingMeta.referenceTracking.totalTracked || 0;
            }
            
            if (samplingMeta.performance) {
                stats.samplingTime = samplingMeta.performance.totalTime || 0;
                stats.averageTimePerProperty = samplingMeta.performance.averageTimePerProperty || 0;
                stats.successRate = samplingMeta.performance.successRate || 0;
            } else {
                stats.samplingTime = samplingMeta.samplingTime || 0;
                if (stats.propertiesSampled > 0) {
                    stats.successRate = (stats.valuesSampled / stats.propertiesSampled) * 100;
                }
            }
        }
        
        return stats;
        
    } catch (exc) {
        return {
            samplingEnabled: false,
            propertiesSampled: 0,
            valuesSampled: 0,
            samplingTime: 0,
            objectReferencesTracked: 0,
            fingerprintsGenerated: 0,
            samplingErrors: 0,
            successRate: 0
        };
    }
}

/**
 * Merge property sampling configuration
 * @param {Object} defaults - Default configuration
 * @param {Object} userConfig - User configuration
 * @returns {Object} Merged configuration
 */
function mergePropertySamplingConfig(defaults, userConfig) {
    try {
        var config = objectClone(defaults, 1);
        
        if (userConfig && typeof userConfig === 'object') {
            // Override with user settings, preserving user preferences
            if (typeof userConfig.safetyFilter !== 'undefined') config.safetyFilter = userConfig.safetyFilter;
            if (typeof userConfig.maxSamples !== 'undefined') config.maxSamples = userConfig.maxSamples;
            if (typeof userConfig.timeoutMs !== 'undefined') config.timeoutMs = userConfig.timeoutMs;
            if (typeof userConfig.includeCollectionSamples !== 'undefined') config.includeCollectionSamples = userConfig.includeCollectionSamples;
            if (typeof userConfig.maxStringLength !== 'undefined') config.maxStringLength = userConfig.maxStringLength;
            if (typeof userConfig.maxObjectDepth !== 'undefined') config.maxObjectDepth = userConfig.maxObjectDepth;
            if (typeof userConfig.trackObjectReferences !== 'undefined') config.trackObjectReferences = userConfig.trackObjectReferences;
            if (typeof userConfig.includeValueMetadata !== 'undefined') config.includeValueMetadata = userConfig.includeValueMetadata;
            if (typeof userConfig.generateValueFingerprints !== 'undefined') config.generateValueFingerprints = userConfig.generateValueFingerprints;
            if (typeof userConfig.enableProgressReporting !== 'undefined') config.enableProgressReporting = userConfig.enableProgressReporting;
            if (typeof userConfig.enableDetailedLogging !== 'undefined') config.enableDetailedLogging = userConfig.enableDetailedLogging;
            if (typeof userConfig.skipNullValues !== 'undefined') config.skipNullValues = userConfig.skipNullValues;
            if (typeof userConfig.skipUndefinedValues !== 'undefined') config.skipUndefinedValues = userConfig.skipUndefinedValues;
        }
        
        return config;
        
    } catch (exc) {
        return defaults;
    }
}

/**
 * Create sampling result object
 * @param {Boolean} success - Success status
 * @param {*} value - Sampled value (optional)
 * @param {String} error - Error message (optional)
 * @returns {Object} Standardized sampling result
 */
function createSamplingResult(success, value, error) {
    return {
        success: success || false,
        value: value || null,
        error: error || '',
        timestamp: getCurrentTimestamp(),
        samplerVersion: '2.1.1'
    };
}

/**
 * Generate simple hash for large strings
 * @param {String} str - String to hash
 * @returns {String} Simple hash
 */
function generateSimpleHash(str) {
    try {
        if (typeof str !== 'string') return 'invalid';
        
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            var charCode = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + charCode;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return Math.abs(hash).toString(16);
        
    } catch (exc) {
        return 'hash_error';
    }
}

/**
 * Log sampling progress
 * @param {String} message - Progress message
 */
function logSamplingProgress(message) {
    try {
        $.writeln('[Property Sampler] ' + getCurrentTimestamp() + ': ' + message);
    } catch (exc) {
        // Silent fallback
    }
}

/**
 * Log sampling error
 * @param {String} message - Error message
 */
function logSamplingError(message) {
    try {
        $.writeln('[Property Sampler ERROR] ' + getCurrentTimestamp() + ': ' + message);
    } catch (exc) {
        // Silent fallback
    }
}

// =============================================================================
// MODULE REGISTRATION
// =============================================================================

// Register this module with all its functions
registerModule('4.0_property-sampler', '2.1.1', [
    // Main Sampling Functions
    'sampleDOMValues', 'samplePropertyValue', 'safeGetPropertyValue',
    
    // Value Analysis
    'generateValueMetadata', 'generateValueFingerprint', 'formatSampleValue',
    
    // Node Value Sampling
    'sampleNodeValues', 'samplePropertiesFromArray',
    
    // Collection Analysis
    'isCollectionLike', 'analyzeCollection', 'extractCollectionSample', 
    'getCollectionItemTypes', 'getCollectionPreview', 'determineCollectionType',
    
    // Utility Functions
    'meetsSafetyFilter', 'getSamplingStatistics', 'mergePropertySamplingConfig',
    'createSamplingResult', 'generateSimpleHash', 'logSamplingProgress', 'logSamplingError'
]);

// =============================================================================
// END OF 4.0_property-sampler.jsx
// =============================================================================