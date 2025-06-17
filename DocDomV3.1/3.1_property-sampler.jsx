// =============================================================================
// 3.1_property-sampler.jsx - PROPERTY VALUE SAMPLING
// InDesign DOM Discovery Builder v3.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: Property value sampling with reference tracking integration
// DEPENDENCIES: ["1.1_bootstrap-foundation.jsx", "1.2_safety-utilities.jsx", "2.1_dom-enumerator.jsx"]
// SIZE: ~750 lines - COMPLETE IMPLEMENTATION
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
// MAIN SAMPLING FUNCTIONS
// =============================================================================

/**
 * Property value sampling with proper configuration usage
 * @param {Object} domStructure - DOM structure to sample from
 * @param {Object} sourceDocument - Source document for value access
 * @param {Object} samplingConfig - Sampling configuration
 * @returns {Object} DOM structure with extracted values
 */
function samplePropertyValues(domStructure, sourceDocument, samplingConfig) {
    var startTime = new Date().getTime();
    var config = samplingConfig ? 
        objectClone(samplingConfig, 2) : objectClone(DEFAULT_SAMPLING_CONFIG, 2);
    
    try {
        // Validate input parameters
        if (!domStructure || !sourceDocument) {
            throw new Error('Invalid input parameters for property sampling');
        }
        
        // Initialize sampling statistics
        var samplingStats = {
            propertiesSampled: 0,
            valuesSampled: 0,
            errorsEncountered: 0,
            nullValuesFound: 0,
            undefinedValuesFound: 0,
            samplingTime: 0
        };
        
        // Create reference tracker if enabled
        var referenceTracker = null;
        if (config.trackObjectReferences) {
            referenceTracker = createObjectReferenceTracker();
        }
        
        // Process the DOM structure
        if (domStructure.structure && domStructure.structure.document) {
            sampleNodeValues(
                domStructure.structure.document,
                sourceDocument,
                config,
                samplingStats,
                referenceTracker
            );
        }
        
        // Update metadata with sampling results
        if (!domStructure.metadata.valueSampling) {
            domStructure.metadata.valueSampling = {};
        }
        
        if (config.enableProgressReporting) {
            logSamplingProgress('Property sampling completed: ' + samplingStats.valuesSampled + 
                              ' values extracted from ' + samplingStats.propertiesSampled + ' properties');
        }
        
        domStructure.metadata.valueSampling = {
            enabled: true,
            timestamp: getCurrentTimestamp(),
            configuration: config,
            statistics: samplingStats,
            objectReferences: referenceTracker ? referenceTracker.getStatistics() : null,
            performance: {
                totalTime: samplingStats.samplingTime,
                averageTimePerProperty: samplingStats.propertiesSampled > 0 ? 
                    samplingStats.samplingTime / samplingStats.propertiesSampled : 0,
                successRate: samplingStats.propertiesSampled > 0 ? 
                    (samplingStats.valuesSampled / samplingStats.propertiesSampled) * 100 : 0
            }
        };
        
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
            }
            
        } catch (nodeExc) {
            samplingStats.errorsEncountered++;
            if (config.enableDetailedLogging) {
                logSamplingError('Node sampling error: ' + nodeExc.message);
            }
        }
        
        // Recursively sample child nodes
        if (domNode.childNodes && domNode.childNodes.length) {
            for (var i = 0; i < domNode.childNodes.length; i++) {
                sampleNodeValues(domNode.childNodes[i], sourceDocument, config, samplingStats, referenceTracker);
            }
        }
        
        // Update timing
        samplingStats.samplingTime += (new Date().getTime() - nodeStartTime);
        
    } catch (exc) {
        samplingStats.errorsEncountered++;
    }
}

/**
 * Sample properties from property array
 * @param {Array} propertiesArray - Array of properties to sample
 * @param {Object} sourceDocument - Source document
 * @param {Object} config - Configuration
 * @param {Object} samplingStats - Statistics
 * @param {Object} referenceTracker - Reference tracker
 */
function samplePropertiesFromArray(propertiesArray, sourceDocument, config, samplingStats, referenceTracker) {
    try {
        if (!propertiesArray || !propertiesArray.length) {
            return;
        }
        
        for (var i = 0; i < propertiesArray.length; i++) {
            var property = propertiesArray[i];
            
            // Check if property meets sampling criteria
            if (!shouldSampleProperty(property, config)) {
                continue;
            }
            
            samplingStats.propertiesSampled++;
            
            try {
                var sampleResult = samplePropertyValue(
                    sourceDocument, 
                    property.name, 
                    property.path, 
                    config, 
                    referenceTracker
                );
                
                if (sampleResult && sampleResult.success) {
                    // Store extracted value in property
                    property.extractedValue = sampleResult.formattedValue;
                    property.valueType = sampleResult.valueType;
                    property.lastExtracted = getCurrentTimestamp();
                    
                    if (config.includeValueMetadata) {
                        property.extractionMetadata = sampleResult.valueMetadata;
                    }
                    
                    if (config.generateValueFingerprints) {
                        property.valueFingerprint = sampleResult.valueFingerprint;
                    }
                    
                    if (sampleResult.objectReference) {
                        property.objectReference = sampleResult.objectReference;
                    }
                    
                    samplingStats.valuesSampled++;
                    
                    // Track null and undefined values
                    if (sampleResult.value === null) {
                        samplingStats.nullValuesFound++;
                    } else if (sampleResult.value === undefined) {
                        samplingStats.undefinedValuesFound++;
                    }
                    
                } else {
                    property.extractionError = sampleResult ? sampleResult.error : 'Unknown sampling error';
                    samplingStats.errorsEncountered++;
                }
                
            } catch (propExc) {
                property.extractionError = propExc.message;
                samplingStats.errorsEncountered++;
            }
        }
        
    } catch (exc) {
        samplingStats.errorsEncountered++;
    }
}

/**
 * Sample property value with reference tracking and metadata
 * @param {Object} sourceDocument - Source document for value access
 * @param {String} propName - Property name to sample
 * @param {String} propPath - Full path to property
 * @param {Object} config - Sampling configuration
 * @param {Object} referenceTracker - Reference tracker for objects
 * @returns {Object} Sample result with metadata and object references
 */
function samplePropertyValue(sourceDocument, propName, propPath, config, referenceTracker) {
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
        if (!sourceDocument || typeof sourceDocument !== 'object') {
            result.error = 'Invalid source document';
            return result;
        }
        
        if (!propName || typeof propName !== 'string') {
            result.error = 'Invalid property name';
            return result;
        }
        
        // Access property value safely
        var accessResult = accessPropertyByPath(sourceDocument, propPath);
        if (!accessResult.success) {
            result.error = accessResult.error;
            result.samplingMethod = 'path_access_failed';
            return result;
        }
        
        result.value = accessResult.value;
        result.valueType = safeTypeOf(result.value);
        result.accessTime = new Date().getTime() - startTime;
        
        // Handle null and undefined values
        if (result.value === null) {
            if (config.skipNullValues) {
                result.error = 'Null value skipped by configuration';
                return result;
            }
            result.formattedValue = 'null';
            result.success = true;
            return result;
        }
        
        if (result.value === undefined) {
            if (config.skipUndefinedValues) {
                result.error = 'Undefined value skipped by configuration';
                return result;
            }
            result.formattedValue = 'undefined';
            result.success = true;
            return result;
        }
        
        // Format value based on type
        result.formattedValue = formatSampleValue(result.value, config);
        
        // Generate value metadata if enabled
        if (config.includeValueMetadata) {
            result.valueMetadata = generateValueMetadata(result.value, config);
        }
        
        // Generate value fingerprint if enabled
        if (config.generateValueFingerprints) {
            result.valueFingerprint = generateValueFingerprint(result.value);
        }
        
        // Track object references if enabled
        if (config.trackObjectReferences && referenceTracker && typeof result.value === 'object') {
            result.objectReference = referenceTracker.track(result.value, propPath);
        }
        
        result.success = true;
        return result;
        
    } catch (exc) {
        result.error = 'Property sampling error: ' + exc.message;
        result.accessTime = new Date().getTime() - startTime;
        return result;
    }
}

// =============================================================================
// PROPERTY ACCESS FUNCTIONS
// =============================================================================

/**
 * Access property value by path with enhanced safety
 * @param {Object} sourceObj - Source object
 * @param {String} propertyPath - Dot notation path
 * @returns {Object} Access result
 */
function accessPropertyByPath(sourceObj, propertyPath) {
    try {
        var result = {
            success: false,
            value: null,
            error: null,
            accessMethod: 'path_traversal'
        };
        
        if (!sourceObj || !propertyPath) {
            result.error = 'Invalid parameters for property access';
            return result;
        }
        
        // Parse path components
        var pathComponents = splitPath(propertyPath);
        if (pathComponents.length === 0) {
            result.error = 'Empty property path';
            return result;
        }
        
        // Navigate to property
        var current = sourceObj;
        var traversedPath = '';
        
        // Skip 'document' if it's the first component
        var startIndex = (pathComponents[0] === 'document') ? 1 : 0;
        
        for (var i = startIndex; i < pathComponents.length; i++) {
            if (!current || typeof current !== 'object') {
                result.error = 'Path traversal failed at: ' + traversedPath;
                return result;
            }
            
            var component = pathComponents[i];
            traversedPath += (traversedPath ? '.' : '') + component;
            
            try {
                current = current[component];
            } catch (accessExc) {
                result.error = 'Property access error at ' + traversedPath + ': ' + accessExc.message;
                return result;
            }
        }
        
        result.value = current;
        result.success = true;
        return result;
        
    } catch (exc) {
        return {
            success: false,
            value: null,
            error: 'Path access failed: ' + exc.message,
            accessMethod: 'error'
        };
    }
}

// =============================================================================
// VALUE FORMATTING AND ANALYSIS
// =============================================================================

/**
 * Format sampled value based on type and configuration
 * @param {*} value - Value to format
 * @param {Object} config - Configuration
 * @returns {String} Formatted value
 */
function formatSampleValue(value, config) {
    try {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        
        var type = safeTypeOf(value);
        
        if (type === 'string') {
            var maxLen = config.maxStringLength || 500;
            if (value.length > maxLen) {
                return stringSubstring(value, 0, maxLen - 3) + '...';
            }
            return stringReplace(value, '"', '\\"');
        }
        
        if (type === 'number' || type === 'boolean') {
            return String(value);
        }
        
        if (type === 'function') {
            return '[Function: ' + (value.name || 'anonymous') + ']';
        }
        
        if (type === 'object') {
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

/**
 * Generate value metadata
 * @param {*} value - Value to analyze
 * @param {Object} config - Configuration
 * @returns {Object} Value metadata
 */
function generateValueMetadata(value, config) {
    try {
        var metadata = {
            type: safeTypeOf(value),
            size: 0,
            complexity: 'simple',
            isCollection: false,
            hasContent: false,
            isAccessible: true,
            generatedAt: getCurrentTimestamp()
        };
        
        if (value === null || value === undefined) {
            metadata.complexity = 'null';
            return metadata;
        }
        
        if (typeof value === 'string') {
            metadata.size = value.length;
            metadata.hasContent = value.length > 0;
        } else if (typeof value === 'object') {
            metadata.isCollection = isCollectionLike(value);
            
            if (metadata.isCollection) {
                if (typeof value.length === 'number') {
                    metadata.size = value.length;
                } else if (typeof value.count === 'number') {
                    metadata.size = value.count;
                }
                metadata.hasContent = metadata.size > 0;
            } else {
                metadata.size = countObjectKeys(value);
                metadata.hasContent = metadata.size > 0;
            }
            
            metadata.complexity = metadata.size > 10 ? 'complex' : 'simple';
        } else {
            metadata.hasContent = true;
        }
        
        return metadata;
        
    } catch (exc) {
        return {
            type: 'error',
            error: exc.message,
            generatedAt: getCurrentTimestamp()
        };
    }
}

/**
 * Generate value fingerprint for change detection
 * @param {*} value - Value to fingerprint
 * @returns {String} Value fingerprint
 */
function generateValueFingerprint(value) {
    try {
        if (value === null) return 'fp_null';
        if (value === undefined) return 'fp_undefined';
        
        var type = safeTypeOf(value);
        var components = ['type:' + type];
        
        if (typeof value === 'string') {
            components.push('len:' + value.length);
            if (value.length > 0) {
                components.push('hash:' + simpleStringHash(value));
            }
        } else if (typeof value === 'number') {
            components.push('val:' + String(value));
        } else if (typeof value === 'boolean') {
            components.push('val:' + String(value));
        } else if (typeof value === 'object') {
            if (isCollectionLike(value)) {
                var size = 0;
                if (typeof value.length === 'number') {
                    size = value.length;
                } else if (typeof value.count === 'number') {
                    size = value.count;
                }
                components.push('size:' + size);
            } else {
                components.push('props:' + countObjectKeys(value));
            }
        }
        
        return arrayJoin(components, '|');
        
    } catch (exc) {
        return 'fp_error_' + Math.random();
    }
}

/**
 * Simple string hash function for fingerprinting
 * @param {String} str - String to hash
 * @returns {String} Hash value
 */
function simpleStringHash(str) {
    try {
        var hash = 0;
        if (str.length === 0) return String(hash);
        
        for (var i = 0; i < str.length; i++) {
            var charVal = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + charVal;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return String(Math.abs(hash));
        
    } catch (exc) {
        return '0';
    }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if property should be sampled based on configuration
 * @param {Object} property - Property to check
 * @param {Object} config - Configuration
 * @returns {Boolean} True if should sample
 */
function shouldSampleProperty(property, config) {
    try {
        if (!property || !config) return false;
        
        // Check safety filter
        if (config.safetyFilter === 'safe' && property.safetyLevel !== 'safe') {
            return false;
        }
        
        if (config.safetyFilter === 'no_dangerous' && property.safetyLevel === 'dangerous') {
            return false;
        }
        
        // Skip methods if not configured
        if (property.isMethod && !config.includeMethods) {
            return false;
        }
        
        // Skip collections if not configured
        if (property.isCollection && !config.includeCollectionSamples) {
            return false;
        }
        
        return true;
        
    } catch (exc) {
        return false;
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

// =============================================================================
// LOGGING FUNCTIONS
// =============================================================================

/**
 * Log sampling progress
 * @param {String} message - Progress message
 */
function logSamplingProgress(message) {
    try {
        $.writeln('[Property Sampler] ' + message);
    } catch (exc) {
        // Silent failure
    }
}

/**
 * Log sampling error
 * @param {String} message - Error message
 */
function logSamplingError(message) {
    try {
        $.writeln('[Property Sampler Error] ' + message);
    } catch (exc) {
        // Silent failure
    }
}

// =============================================================================
// MODULE REGISTRATION
// =============================================================================

// Register this module with all its functions
registerModule('3.1_property-sampler', '3.1', [
    // Main Functions
    'samplePropertyValues', 'sampleNodeValues', 'samplePropertiesFromArray',
    'samplePropertyValue',
    
    // Property Access
    'accessPropertyByPath',
    
    // Value Formatting
    'formatSampleValue', 'generateValueMetadata', 'generateValueFingerprint',
    'simpleStringHash',
    
    // Utility Functions
    'shouldSampleProperty', 'getCollectionPreview', 'extractCollectionSample',
    
    // Logging
    'logSamplingProgress', 'logSamplingError'
]);

// =============================================================================
// END OF 3.1_property-sampler.jsx
// =============================================================================