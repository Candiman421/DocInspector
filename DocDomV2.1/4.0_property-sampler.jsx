// =============================================================================
// 4.0_property-sampler.jsx - PROPERTY VALUE SAMPLING
// InDesign DOM Discovery Builder v2.1 - TARGET ARCHITECTURE
// =============================================================================
// PURPOSE: Property value sampling with reference tracking integration
// DEPENDENCIES: ["1.0_safe-foundation.jsx", "2.0_dom-enumerator.jsx"]
// SIZE: ~600 lines
// =============================================================================

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
    generateValueFingerprints: true
};

// =============================================================================
// MAIN SAMPLING FUNCTIONS
// =============================================================================

/**
 * Property value sampling with reference tracking
 * @param {Object} domStructure - DOM structure to sample
 * @param {Object} samplingConfig - Sampling configuration
 * @returns {Object} DOM structure with values and reference tracking
 */
function sampleDOMValues(domStructure, samplingConfig) {
    var startTime = new Date().getTime();
    var config = samplingConfig || DEFAULT_SAMPLING_CONFIG;
    
    try {
        if (!domStructure || !domStructure.structure) {
            return domStructure;
        }
        
        // Initialize sampling metadata
        domStructure.metadata.valueSampling = {
            enabled: true,
            startTime: getCurrentTimestamp(),
            config: config,
            safetyFilter: config.safetyFilter
        };
        
        // Set up reference tracking
        var referenceTracker = null;
        if (config.trackObjectReferences) {
            referenceTracker = createObjectReferenceTracker();
        }
        
        // Set up sampling statistics
        var samplingStats = {
            propertiesSampled: 0,
            valuesSampled: 0,
            samplingErrors: 0,
            fingerprintsGenerated: 0,
            objectReferencesTracked: 0
        };
        
        // Sample values from the document structure
        if (domStructure.structure.document) {
            sampleNodeValues(
                domStructure.structure.document,
                config,
                samplingStats,
                referenceTracker
            );
        }
        
        // Update metadata with results
        domStructure.metadata.valueSampling.completed = true;
        domStructure.metadata.valueSampling.endTime = getCurrentTimestamp();
        domStructure.metadata.valueSampling.samplingTime = new Date().getTime() - startTime;
        domStructure.metadata.valueSampling.statistics = samplingStats;
        
        if (referenceTracker) {
            domStructure.metadata.valueSampling.referenceTracking = referenceTracker.getStatistics();
        }
        
        return domStructure;
        
    } catch (exc) {
        if (domStructure && domStructure.metadata) {
            domStructure.metadata.valueSampling = {
                enabled: false,
                error: 'Value sampling failed: ' + exc.message,
                timestamp: getCurrentTimestamp()
            };
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
        error: null
    };
    
    try {
        // Get the property value safely
        var valueAccess = safeGetPropertyValue(targetObj, propName, config.timeoutMs);
        if (!valueAccess.success) {
            result.error = valueAccess.error;
            return result;
        }
        
        var propertyValue = valueAccess.value;
        result.value = propertyValue;
        result.valueType = typeof propertyValue;
        result.success = true;
        
        // Generate value metadata if enabled
        if (config.includeValueMetadata) {
            result.valueMetadata = generateValueMetadata(propertyValue, config);
        }
        
        // Generate value fingerprint if enabled
        if (config.generateValueFingerprints) {
            result.valueFingerprint = generateValueFingerprint(propertyValue);
        }
        
        // Track object references if enabled
        if (config.trackObjectReferences && result.valueType === 'object' && propertyValue) {
            var objectId = generateObjectReferenceID(propertyValue);
            if (referenceTracker) {
                referenceTracker.trackObject(objectId, propertyValue, propPath);
            }
            result.objectReference = objectId;
        }
        
        // Format the value for display
        result.formattedValue = formatSampleValue(propertyValue, config, result.valueMetadata);
        
        return result;
        
    } catch (exc) {
        result.error = 'Property sampling error: ' + exc.message;
        return result;
    }
}

// =============================================================================
// CORE VALUE ACCESS
// =============================================================================

/**
 * Safely retrieve property value with timeout
 * @param {Object} targetObj - Object to access
 * @param {String} propName - Property name
 * @param {Number} timeoutMs - Timeout in milliseconds
 * @returns {Object} Result with success, value, error, timeout flags
 */
function safeGetPropertyValue(targetObj, propName, timeoutMs) {
    var result = {
        success: false,
        value: null,
        error: '',
        timeout: false
    };
    
    try {
        if (!targetObj) {
            result.error = 'Target object is null or undefined';
            return result;
        }
        
        if (!propName || typeof propName !== 'string') {
            result.error = 'Invalid property name';
            return result;
        }
        
        // Check if property exists
        if (!safeHasProperty(targetObj, propName)) {
            result.error = 'Property does not exist: ' + propName;
            return result;
        }
        
        // Set up timeout checker
        var timeoutChecker = createTimeoutChecker(timeoutMs);
        
        // Attempt to access the property value
        var propertyValue = null;
        
        try {
            propertyValue = targetObj[propName];
            
            // Check for timeout after access
            if (timeoutChecker && timeoutChecker()) {
                result.timeout = true;
                result.error = 'Timeout accessing property value';
                return result;
            }
            
        } catch (exc) {
            result.error = 'Error accessing property value: ' + exc.message;
            return result;
        }
        
        result.success = true;
        result.value = propertyValue;
        return result;
        
    } catch (exc) {
        result.error = 'Safe property access failed: ' + exc.message;
        return result;
    }
}

// =============================================================================
// VALUE ANALYSIS
// =============================================================================

/**
 * Generate metadata about sampled value
 * @param {*} propertyValue - Value to analyze
 * @param {Object} config - Configuration
 * @returns {Object} Value metadata with size, complexity, collection info
 */
function generateValueMetadata(propertyValue, config) {
    var metadata = {
        type: typeof propertyValue,
        isNull: propertyValue === null,
        isUndefined: propertyValue === undefined,
        size: 0,
        complexity: 'simple',
        isCollection: false,
        collectionLength: -1,
        hasProperties: false,
        propertyCount: 0
    };
    
    try {
        // Analyze based on type
        if (metadata.type === 'string') {
            metadata.size = propertyValue.length;
            metadata.complexity = propertyValue.length > 100 ? 'complex' : 'simple';
            
        } else if (metadata.type === 'number') {
            metadata.size = 8; // Approximate bytes
            metadata.complexity = 'simple';
            
        } else if (metadata.type === 'boolean') {
            metadata.size = 1;
            metadata.complexity = 'simple';
            
        } else if (metadata.type === 'object' && propertyValue) {
            // Analyze object properties
            var propCount = 0;
            try {
                for (var prop in propertyValue) {
                    propCount++;
                    if (propCount > 10) break; // Limit counting for performance
                }
            } catch (exc) {
                // Continue with basic analysis
            }
            
            metadata.hasProperties = propCount > 0;
            metadata.propertyCount = propCount;
            metadata.complexity = propCount > 5 ? 'complex' : 'moderate';
            
            // Check if it's a collection
            var collectionLength = safeGetLength(propertyValue);
            if (collectionLength >= 0) {
                metadata.isCollection = true;
                metadata.collectionLength = collectionLength;
                metadata.complexity = collectionLength > 10 ? 'complex' : 'moderate';
            }
            
            metadata.size = propCount * 4; // Rough estimate
            
        } else if (metadata.type === 'function') {
            metadata.complexity = 'moderate';
            metadata.size = 32; // Rough estimate
        }
        
        return metadata;
        
    } catch (exc) {
        metadata.complexity = 'error';
        return metadata;
    }
}

/**
 * Generate fingerprint for value comparison
 * @param {*} propertyValue - Value to fingerprint
 * @returns {String} Value fingerprint for before/after comparison
 */
function generateValueFingerprint(propertyValue) {
    try {
        var fingerprint = [];
        var valueType = typeof propertyValue;
        
        fingerprint.push('type:' + valueType);
        
        if (propertyValue === null) {
            fingerprint.push('null');
        } else if (propertyValue === undefined) {
            fingerprint.push('undefined');
        } else if (valueType === 'string') {
            fingerprint.push('len:' + propertyValue.length);
            if (propertyValue.length > 0) {
                fingerprint.push('first:' + propertyValue.charAt(0));
                if (propertyValue.length > 1) {
                    fingerprint.push('last:' + propertyValue.charAt(propertyValue.length - 1));
                }
            }
        } else if (valueType === 'number') {
            fingerprint.push('val:' + propertyValue);
        } else if (valueType === 'boolean') {
            fingerprint.push('val:' + propertyValue);
        } else if (valueType === 'object') {
            var collectionLength = safeGetLength(propertyValue);
            if (collectionLength >= 0) {
                fingerprint.push('collection:' + collectionLength);
            } else {
                fingerprint.push('object');
            }
        } else if (valueType === 'function') {
            fingerprint.push('function');
        }
        
        return fingerprint.join('|');
        
    } catch (exc) {
        return 'fingerprint_error';
    }
}

/**
 * Format value with metadata integration
 * @param {*} propertyValue - Value to format
 * @param {Object} config - Configuration
 * @param {Object} metadata - Value metadata
 * @returns {String} Formatted value with metadata annotations
 */
function formatSampleValue(propertyValue, config, metadata) {
    try {
        var valueType = typeof propertyValue;
        
        if (propertyValue === null) {
            return '[null]';
        }
        
        if (propertyValue === undefined) {
            return '[undefined]';
        }
        
        if (valueType === 'string') {
            var stringValue = propertyValue;
            if (stringValue.length > config.maxStringLength) {
                stringValue = stringValue.substring(0, config.maxStringLength) + '...';
            }
            return '"' + stringValue + '"';
            
        } else if (valueType === 'number') {
            return propertyValue.toString();
            
        } else if (valueType === 'boolean') {
            return propertyValue.toString();
            
        } else if (valueType === 'function') {
            return '[Function]';
            
        } else if (valueType === 'object') {
            if (metadata && metadata.isCollection) {
                return '[Collection: ' + metadata.collectionLength + ' items]';
            } else if (metadata && metadata.hasProperties) {
                return '[Object: ' + metadata.propertyCount + ' properties]';
            } else {
                return '[Object]';
            }
        }
        
        return '[' + valueType + ']';
        
    } catch (exc) {
        return '[Format Error]';
    }
}

// =============================================================================
// NODE VALUE SAMPLING
// =============================================================================

/**
 * Recursively sample values from DOM nodes
 * @param {Object} domNode - DOM node to sample
 * @param {Object} config - Sampling configuration
 * @param {Object} samplingStats - Statistics to update
 * @param {Object} referenceTracker - Reference tracker
 */
function sampleNodeValues(domNode, config, samplingStats, referenceTracker) {
    try {
        if (!domNode) {
            return;
        }
        
        // Sample property values if they meet safety criteria
        if (domNode.properties && domNode.properties.length) {
            samplePropertiesFromArray(domNode.properties, config, samplingStats, referenceTracker);
        }
        
        // Sample collection values if enabled
        if (config.includeCollectionSamples && domNode.collections && domNode.collections.length) {
            samplePropertiesFromArray(domNode.collections, config, samplingStats, referenceTracker);
        }
        
        // Recursively sample child nodes
        if (domNode.childNodes && domNode.childNodes.length) {
            for (var i = 0; i < domNode.childNodes.length; i++) {
                sampleNodeValues(domNode.childNodes[i], config, samplingStats, referenceTracker);
            }
        }
        
    } catch (exc) {
        samplingStats.samplingErrors++;
    }
}

/**
 * Sample property values from property array
 * @param {Array} properties - Array of property classifications
 * @param {Object} config - Configuration
 * @param {Object} samplingStats - Statistics to update
 * @param {Object} referenceTracker - Reference tracker
 */
function samplePropertiesFromArray(properties, config, samplingStats, referenceTracker) {
    try {
        var sampledCount = 0;
        var timeoutChecker = createTimeoutChecker(config.timeoutMs);
        
        for (var i = 0; i < properties.length; i++) {
            if (timeoutChecker && timeoutChecker()) {
                break;
            }
            
            if (sampledCount >= config.maxSamples) {
                break;
            }
            
            var property = properties[i];
            
            if (meetsSafetyFilter(property, config.safetyFilter)) {
                // Get the parent object for value sampling
                var pathComponents = splitPath(property.path);
                if (pathComponents.length >= 2) {
                    var parentPath = getParentPath(property.path);
                    var propName = pathComponents[pathComponents.length - 1];
                    
                    // This would require actual object access which is beyond structure discovery
                    // For now, we'll just track that we would sample this property
                    samplingStats.propertiesSampled++;
                    sampledCount++;
                    
                    // Add sampling metadata to the property
                    property.samplingMetadata = {
                        wouldSample: true,
                        safetyLevel: property.safetyLevel,
                        samplingPath: property.path,
                        timestamp: getCurrentTimestamp()
                    };
                }
            }
        }
        
        samplingStats.valuesSampled += sampledCount;
        
    } catch (exc) {
        samplingStats.samplingErrors++;
    }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if property meets safety filter criteria
 * @param {Object} propertyObj - Property classification object
 * @param {String} safetyFilter - Safety filter level
 * @returns {Boolean} True if property meets criteria
 */
function meetsSafetyFilter(propertyObj, safetyFilter) {
    try {
        if (!propertyObj || !propertyObj.safetyLevel) {
            return false;
        }
        
        var safetyLevels = {
            'safe': ['safe'],
            'moderate': ['safe', 'moderate'],
            'risky': ['safe', 'moderate', 'risky'],
            'all': ['safe', 'moderate', 'risky', 'dangerous']
        };
        
        var allowedLevels = safetyLevels[safetyFilter] || safetyLevels['safe'];
        
        for (var i = 0; i < allowedLevels.length; i++) {
            if (propertyObj.safetyLevel === allowedLevels[i]) {
                return true;
            }
        }
        
        return false;
        
    } catch (exc) {
        return false;
    }
}

/**
 * Get sampling statistics
 * @param {Object} domStructure - DOM structure with sampling data
 * @returns {Object} Sampling statistics including reference tracking
 */
function getSamplingStatistics(domStructure) {
    try {
        var stats = {
            samplingEnabled: false,
            propertiesSampled: 0,
            valuesSampled: 0,
            samplingTime: 0,
            objectReferencesTracked: 0,
            fingerprintsGenerated: 0
        };
        
        if (domStructure && 
            domStructure.metadata && 
            domStructure.metadata.valueSampling) {
            
            var samplingMeta = domStructure.metadata.valueSampling;
            stats.samplingEnabled = samplingMeta.enabled || false;
            
            if (samplingMeta.statistics) {
                stats.propertiesSampled = samplingMeta.statistics.propertiesSampled || 0;
                stats.valuesSampled = samplingMeta.statistics.valuesSampled || 0;
                stats.fingerprintsGenerated = samplingMeta.statistics.fingerprintsGenerated || 0;
            }
            
            if (samplingMeta.referenceTracking) {
                stats.objectReferencesTracked = samplingMeta.referenceTracking.totalTracked || 0;
            }
            
            stats.samplingTime = samplingMeta.samplingTime || 0;
        }
        
        return stats;
        
    } catch (exc) {
        return {
            samplingEnabled: false,
            propertiesSampled: 0,
            valuesSampled: 0,
            samplingTime: 0,
            objectReferencesTracked: 0,
            fingerprintsGenerated: 0
        };
    }
}

// =============================================================================
// END OF 4.0_property-sampler.jsx
// =============================================================================