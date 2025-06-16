//
// 4.0_property-sampler.jsx (Enhanced)
// InDesign DOM Discovery Builder - Property Value Sampling with Reference Tracking
// CORE PURPOSE: Sample actual property values with object reference tracking integration
// DEPENDENCIES: 1.0_safe-foundation.jsx, 2.0_dom-enumerator.jsx
// SAFETY: Only accesses values for properties marked as safe during discovery
// ES3 COMPATIBLE: No reserved words, no modern JS features
// ENHANCED: Added reference tracking integration and deeper value analysis
// NOTE: This module is OPTIONAL - DOM discovery works without it
//

// ============================================================================
// ENHANCED SAMPLING CONFIGURATION
// ============================================================================

var DEFAULT_SAMPLING_CONFIG = {
    safetyFilter: 'safe',               // Only sample 'safe' properties by default
    maxSamples: 10,                     // Maximum items to sample from collections
    timeoutMs: 1000,                    // Timeout per property access
    includeCollectionSamples: false,    // Whether to sample collection items
    maxStringLength: 500,               // Truncate long strings
    maxObjectDepth: 1,                  // Depth limit for object value display
    // Enhanced options
    trackObjectReferences: true,        // Track object references during sampling
    includeValueMetadata: true,         // Include metadata about sampled values
    enableDeepValueAnalysis: false,     // Analyze object values more deeply
    generateValueFingerprints: true     // Create fingerprints for value comparison
};

// ============================================================================
// MAIN SAMPLING FUNCTIONS (ENHANCED)
// ============================================================================

/**
 * Enhanced property value sampling with reference tracking
 * @param {Object} domStructure - DOM structure from enumeration
 * @param {Object} samplingConfig - Sampling configuration object
 * @returns {Object} - Enhanced DOM structure with values and reference tracking
 */
function sampleDOMValues(domStructure, samplingConfig) {
    if (!domStructure || !domStructure.structure || !domStructure.structure.document) {
        $.writeln('ERROR: Invalid DOM structure for sampling');
        return domStructure;
    }
    
    // Merge configuration
    var config = mergeConfig(DEFAULT_SAMPLING_CONFIG, samplingConfig);
    
    $.writeln('Starting enhanced property value sampling...');
    $.writeln('Safety Filter: ' + config.safetyFilter);
    $.writeln('Max Samples: ' + config.maxSamples);
    $.writeln('Timeout: ' + config.timeoutMs + 'ms');
    $.writeln('Reference Tracking: ' + (config.trackObjectReferences ? 'enabled' : 'disabled'));
    
    var startTime = new Date().getTime();
    var samplingStats = {
        totalAttempts: 0,
        successfulSamples: 0,
        timeouts: 0,
        errors: 0,
        referencesTracked: 0,
        uniqueObjects: 0,
        duplicateReferences: 0
    };
    
    // Enhanced: Create reference tracker if enabled
    var referenceTracker = null;
    if (config.trackObjectReferences) {
        referenceTracker = createObjectReferenceTracker();
    }
    
    try {
        // Get the document object for sampling
        var envResult = validateInDesignEnvironment();
        if (!envResult.valid) {
            $.writeln('ERROR: Cannot sample values - ' + envResult.error);
            return domStructure;
        }
        
        var doc = envResult.document;
        
        // Enhanced sampling with reference tracking
        sampleNodeValuesEnhanced(
            domStructure.structure.document, 
            doc, 
            config, 
            samplingStats, 
            referenceTracker
        );
        
        // Enhanced: Add reference tracking statistics
        if (referenceTracker) {
            var refStats = referenceTracker.getStatistics();
            samplingStats.uniqueObjects = refStats.totalObjects;
            samplingStats.duplicateReferences = refStats.duplicateReferences;
            samplingStats.referencesTracked = refStats.totalPaths;
        }
        
        // Add enhanced sampling metadata
        if (!domStructure.metadata.sampling) {
            domStructure.metadata.sampling = {};
        }
        
        domStructure.metadata.sampling = {
            timestamp: getCurrentTimestamp(),
            config: config,
            stats: samplingStats,
            samplingTime: new Date().getTime() - startTime,
            hasReferenceTracking: config.trackObjectReferences,
            version: 'enhanced_v2.1'
        };
        
        // Store reference tracker data if available
        if (referenceTracker) {
            domStructure.metadata.sampling.referenceMap = referenceTracker.getStatistics();
        }
        
        $.writeln('Enhanced sampling complete:');
        $.writeln('  Total attempts: ' + samplingStats.totalAttempts);
        $.writeln('  Successful: ' + samplingStats.successfulSamples);
        $.writeln('  Timeouts: ' + samplingStats.timeouts);
        $.writeln('  Errors: ' + samplingStats.errors);
        if (config.trackObjectReferences) {
            $.writeln('  Unique objects: ' + samplingStats.uniqueObjects);
            $.writeln('  Duplicate references: ' + samplingStats.duplicateReferences);
        }
        $.writeln('  Time: ' + domStructure.metadata.sampling.samplingTime + 'ms');
        
    } catch (exc) {
        $.writeln('ERROR: Enhanced property sampling failed: ' + exc.message);
        if (!domStructure.statistics.errors) {
            domStructure.statistics.errors = [];
        }
        domStructure.statistics.errors.push('Enhanced sampling failed: ' + exc.message);
    } finally {
        // Enhanced cleanup
        enhancedMemoryCleanup([], referenceTracker);
    }
    
    return domStructure;
}

/**
 * Enhanced node value sampling with reference tracking
 * @param {Object} domNode - DOM node to sample
 * @param {Object} sourceObj - Source object to get values from
 * @param {Object} config - Sampling configuration
 * @param {Object} stats - Statistics tracking object
 * @param {Object} referenceTracker - Reference tracker (optional)
 */
function sampleNodeValuesEnhanced(domNode, sourceObj, config, stats, referenceTracker) {
    if (!domNode || !sourceObj) return;
    
    // Sample properties with enhanced tracking
    if (domNode.properties) {
        samplePropertyListEnhanced(
            domNode.properties, 
            sourceObj, 
            config, 
            stats, 
            referenceTracker, 
            'properties'
        );
    }
    
    // Sample collections if enabled with enhanced tracking
    if (config.includeCollectionSamples && domNode.collections) {
        samplePropertyListEnhanced(
            domNode.collections, 
            sourceObj, 
            config, 
            stats, 
            referenceTracker, 
            'collections'
        );
    }
    
    // Note: Child node sampling still requires explicit safe paths
}

/**
 * Enhanced property list sampling with reference tracking
 * @param {Array} propertyList - List of property classifications
 * @param {Object} sourceObj - Source object to get values from
 * @param {Object} config - Sampling configuration
 * @param {Object} stats - Statistics tracking object
 * @param {Object} referenceTracker - Reference tracker (optional)
 * @param {String} propertyType - Type of properties being sampled
 */
function samplePropertyListEnhanced(propertyList, sourceObj, config, stats, referenceTracker, propertyType) {
    for (var i = 0; i < propertyList.length; i++) {
        var prop = propertyList[i];
        
        // Check if property meets safety filter
        if (!meetsSafetyFilter(prop, config.safetyFilter)) {
            continue;
        }
        
        stats.totalAttempts++;
        
        // Enhanced sampling with reference tracking
        var sampleResult = samplePropertyValueEnhanced(
            sourceObj, 
            prop.name, 
            prop.path || '',
            config, 
            referenceTracker
        );
        
        if (sampleResult.success) {
            stats.successfulSamples++;
            
            // Enhanced: Store more detailed sample data
            prop.sampleValue = sampleResult.formattedValue;
            prop.hasSampleValue = true;
            
            // Enhanced: Add metadata if enabled
            if (config.includeValueMetadata && sampleResult.metadata) {
                prop.valueMetadata = sampleResult.metadata;
            }
            
            // Enhanced: Track object references
            if (config.trackObjectReferences && sampleResult.objectReference) {
                prop.objectReference = sampleResult.objectReference;
                stats.referencesTracked++;
            }
            
        } else {
            if (sampleResult.timeout) {
                stats.timeouts++;
            } else {
                stats.errors++;
            }
            prop.sampleError = sampleResult.error;
            prop.hasSampleValue = false;
        }
    }
}

/**
 * Enhanced property value sampling with reference tracking and metadata
 * @param {Object} obj - Object to sample from
 * @param {String} propName - Property name
 * @param {String} propPath - Full property path
 * @param {Object} config - Sampling configuration
 * @param {Object} referenceTracker - Reference tracker (optional)
 * @returns {Object} - Enhanced sample result
 */
function samplePropertyValueEnhanced(obj, propName, propPath, config, referenceTracker) {
    var result = {
        success: false,
        value: null,
        formattedValue: '',
        error: '',
        timeout: false,
        // Enhanced fields
        metadata: null,
        objectReference: null,
        valueFingerprint: null
    };
    
    var baseResult = safeGetPropertyValue(obj, propName, config.timeoutMs);
    
    if (!baseResult.success) {
        result.error = baseResult.error;
        result.timeout = baseResult.timeout;
        return result;
    }
    
    result.success = true;
    result.value = baseResult.value;
    
    try {
        // Enhanced: Generate metadata if enabled
        if (config.includeValueMetadata) {
            result.metadata = generateValueMetadata(baseResult.value, config);
        }
        
        // Enhanced: Track object references if enabled and value is object
        if (config.trackObjectReferences && referenceTracker && 
            typeof baseResult.value === 'object' && baseResult.value !== null) {
            
            var refResult = referenceTracker.trackObject(baseResult.value, propPath);
            result.objectReference = {
                refID: refResult.refID,
                isReused: refResult.seen,
                allPaths: refResult.paths
            };
        }
        
        // Enhanced: Generate value fingerprint for comparison
        if (config.generateValueFingerprints) {
            result.valueFingerprint = generateValueFingerprint(baseResult.value);
        }
        
        // Format value for display
        result.formattedValue = formatSampleValueEnhanced(baseResult.value, config, result.metadata);
        
    } catch (exc) {
        result.error = 'Enhanced processing failed: ' + exc.message;
        result.success = false;
    }
    
    return result;
}

// ============================================================================
// ENHANCED VALUE ANALYSIS
// ============================================================================

/**
 * Generate metadata about sampled value
 * @param {*} value - Value to analyze
 * @param {Object} config - Sampling configuration
 * @returns {Object} - Value metadata
 */
function generateValueMetadata(value, config) {
    var metadata = {
        type: typeof value,
        isNull: value === null,
        isUndefined: value === undefined,
        size: 0,
        hasLength: false,
        isCollection: false,
        complexity: 'simple'
    };
    
    try {
        if (value === null || value === undefined) {
            return metadata;
        }
        
        // Analyze based on type
        switch (metadata.type) {
            case 'string':
                metadata.size = value.length;
                metadata.hasLength = true;
                if (value.length > 1000) {
                    metadata.complexity = 'large';
                }
                break;
                
            case 'object':
                // Check if it's a collection
                var len = safeGetLength(value);
                if (len >= 0) {
                    metadata.isCollection = true;
                    metadata.size = len;
                    metadata.hasLength = true;
                    if (len > 100) {
                        metadata.complexity = 'large';
                    } else if (len > 10) {
                        metadata.complexity = 'moderate';
                    }
                } else {
                    // Regular object - try to count properties
                    var propCount = 0;
                    for (var prop in value) {
                        propCount++;
                        if (propCount > 20) break; // Don't count too many
                    }
                    metadata.size = propCount;
                    if (propCount > 10) {
                        metadata.complexity = 'complex';
                    }
                }
                break;
                
            case 'number':
                metadata.size = 1;
                break;
                
            case 'boolean':
                metadata.size = 1;
                break;
        }
        
    } catch (exc) {
        metadata.error = 'Metadata generation failed: ' + exc.message;
    }
    
    return metadata;
}

/**
 * Generate fingerprint for value comparison
 * @param {*} value - Value to fingerprint
 * @returns {String} - Value fingerprint
 */
function generateValueFingerprint(value) {
    try {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        
        var objType = typeof value;
        var fingerprint = objType + ':';
        
        switch (objType) {
            case 'string':
                fingerprint += value.length + ':' + (value.substring(0, 50).replace(/[^a-zA-Z0-9]/g, ''));
                break;
                
            case 'number':
                fingerprint += value.toString();
                break;
                
            case 'boolean':
                fingerprint += value.toString();
                break;
                
            case 'object':
                var len = safeGetLength(value);
                if (len >= 0) {
                    fingerprint += 'collection:' + len;
                } else {
                    fingerprint += 'object:' + String(value).substring(0, 30);
                }
                break;
                
            default:
                fingerprint += 'unknown';
                break;
        }
        
        return fingerprint;
        
    } catch (exc) {
        return 'error:' + exc.message.substring(0, 20);
    }
}

/**
 * Enhanced value formatting with metadata integration
 * @param {*} value - Raw property value
 * @param {Object} config - Sampling configuration
 * @param {Object} metadata - Value metadata (optional)
 * @returns {String} - Enhanced formatted value
 */
function formatSampleValueEnhanced(value, config, metadata) {
    try {
        if (value === null) return '[null]';
        if (value === undefined) return '[undefined]';
        
        var valueType = typeof value;
        var result = '';
        
        switch (valueType) {
            case 'string':
                var str = String(value);
                if (str.length > config.maxStringLength) {
                    result = '"' + str.substring(0, config.maxStringLength) + '..." [truncated]';
                } else {
                    result = '"' + str + '"';
                }
                
                // Enhanced: Add metadata annotation
                if (metadata && metadata.size) {
                    result += ' [' + metadata.size + ' chars]';
                }
                break;
                
            case 'number':
                result = String(value);
                break;
                
            case 'boolean':
                result = value ? 'true' : 'false';
                break;
                
            case 'object':
                result = formatObjectValueEnhanced(value, config, metadata, 0);
                break;
                
            case 'function':
                result = '[function]';
                break;
                
            default:
                result = '[' + valueType + ']';
                break;
        }
        
        return result;
        
    } catch (exc) {
        return '[error formatting value: ' + exc.message + ']';
    }
}

/**
 * Enhanced object value formatting with metadata
 * @param {Object} obj - Object to format
 * @param {Object} config - Sampling configuration
 * @param {Object} metadata - Value metadata
 * @param {Number} depth - Current depth
 * @returns {String} - Formatted object
 */
function formatObjectValueEnhanced(obj, config, metadata, depth) {
    try {
        if (depth >= config.maxObjectDepth) {
            return '[object - max depth reached]';
        }
        
        if (obj === null) return '[null]';
        
        // Enhanced: Use metadata if available
        if (metadata) {
            if (metadata.isCollection && metadata.hasLength) {
                var complexityNote = metadata.complexity !== 'simple' ? ', ' + metadata.complexity : '';
                return '[collection, length: ' + metadata.size + complexityNote + ']';
            }
            
            if (metadata.size > 0) {
                var complexityNote = metadata.complexity !== 'simple' ? ', ' + metadata.complexity : '';
                return '[object, ' + metadata.size + ' properties' + complexityNote + ']';
            }
        }
        
        // Fallback to original logic
        var len = safeGetLength(obj);
        if (len >= 0) {
            return '[collection, length: ' + len + ']';
        }
        
        // For other objects, show limited info
        var objString = String(obj);
        if (objString.length > 100) {
            objString = objString.substring(0, 100) + '...';
        }
        return '[object: ' + objString + ']';
        
    } catch (exc) {
        return '[object - error formatting]';
    }
}

// ============================================================================
// SAMPLING UTILITIES (ENHANCED)
// ============================================================================

/**
 * Safely retrieve property value with timeout (base function maintained for compatibility)
 * @param {Object} obj - Object to get property from
 * @param {String} propName - Property name
 * @param {Number} timeoutMs - Timeout in milliseconds
 * @returns {Object} - {success: boolean, value: any, error: string, timeout: boolean}
 */
function safeGetPropertyValue(obj, propName, timeoutMs) {
    var result = {
        success: false,
        value: null,
        error: '',
        timeout: false
    };
    
    var timeoutChecker = createTimeoutChecker(timeoutMs || 1000);
    
    try {
        if (timeoutChecker()) {
            result.timeout = true;
            result.error = 'Timeout before access';
            return result;
        }
        
        if (!obj) {
            result.error = 'Object is null or undefined';
            return result;
        }
        
        if (!safeHasProperty(obj, propName)) {
            result.error = 'Property does not exist';
            return result;
        }
        
        // This is the critical moment - actually accessing the property value
        var val = obj[propName];
        
        if (timeoutChecker()) {
            result.timeout = true;
            result.error = 'Timeout during access';
            return result;
        }
        
        result.success = true;
        result.value = val;
        return result;
        
    } catch (exc) {
        result.error = exc.message;
        return result;
    }
}

/**
 * Check if property meets safety filter criteria
 * @param {Object} prop - Property classification object
 * @param {String} safetyFilter - Safety level to filter by
 * @returns {Boolean} - true if property meets criteria
 */
function meetsSafetyFilter(prop, safetyFilter) {
    if (!prop || !prop.safetyLevel) return false;
    
    switch (safetyFilter) {
        case 'safe':
            return prop.safetyLevel === 'safe';
        case 'safe_and_moderate':
            return prop.safetyLevel === 'safe' || prop.safetyLevel === 'moderate';
        case 'all':
            return true;
        default:
            return prop.safetyLevel === 'safe';
    }
}

/**
 * Merge sampling configuration with defaults
 * @param {Object} defaults - Default configuration
 * @param {Object} userConfig - User configuration
 * @returns {Object} - Merged configuration
 */
function mergeConfig(defaults, userConfig) {
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
// ENHANCED SAMPLING RESULTS UTILITIES
// ============================================================================

/**
 * Enhanced sampling statistics from DOM structure
 * @param {Object} domStructure - DOM structure with sampling data
 * @returns {Object} - Enhanced sampling statistics
 */
function getSamplingStatistics(domStructure) {
    var defaultStats = {
        attempted: 0,
        successful: 0,
        timeouts: 0,
        errors: 0,
        samplingTime: 0,
        hasSamplingData: false,
        // Enhanced fields
        hasReferenceTracking: false,
        uniqueObjects: 0,
        duplicateReferences: 0,
        version: 'basic'
    };
    
    if (!domStructure || !domStructure.metadata || !domStructure.metadata.sampling) {
        return defaultStats;
    }
    
    var samplingData = domStructure.metadata.sampling;
    
    var stats = {
        attempted: samplingData.stats.totalAttempts || 0,
        successful: samplingData.stats.successfulSamples || 0,
        timeouts: samplingData.stats.timeouts || 0,
        errors: samplingData.stats.errors || 0,
        samplingTime: samplingData.samplingTime || 0,
        hasSamplingData: true,
        config: samplingData.config,
        // Enhanced fields
        hasReferenceTracking: samplingData.hasReferenceTracking || false,
        uniqueObjects: samplingData.stats.uniqueObjects || 0,
        duplicateReferences: samplingData.stats.duplicateReferences || 0,
        version: samplingData.version || 'basic'
    };
    
    return stats;
}

/**
 * Enhanced count of properties with sample values
 * @param {Object} domNode - DOM node to analyze
 * @returns {Object} - Enhanced count information
 */
function countSampledPropertiesEnhanced(domNode) {
    var counts = {
        total: 0,
        withValues: 0,
        withMetadata: 0,
        withReferences: 0,
        errors: 0
    };
    
    if (!domNode) return counts;
    
    // Count sampled properties
    if (domNode.properties) {
        for (var i = 0; i < domNode.properties.length; i++) {
            var prop = domNode.properties[i];
            counts.total++;
            if (prop.hasSampleValue) {
                counts.withValues++;
            }
            if (prop.valueMetadata) {
                counts.withMetadata++;
            }
            if (prop.objectReference) {
                counts.withReferences++;
            }
            if (prop.sampleError) {
                counts.errors++;
            }
        }
    }
    
    // Count sampled collections
    if (domNode.collections) {
        for (var i = 0; i < domNode.collections.length; i++) {
            var coll = domNode.collections[i];
            counts.total++;
            if (coll.hasSampleValue) {
                counts.withValues++;
            }
            if (coll.valueMetadata) {
                counts.withMetadata++;
            }
            if (coll.objectReference) {
                counts.withReferences++;
            }
            if (coll.sampleError) {
                counts.errors++;
            }
        }
    }
    
    // Recursively count child nodes
    if (domNode.childNodes) {
        for (var i = 0; i < domNode.childNodes.length; i++) {
            var childCounts = countSampledPropertiesEnhanced(domNode.childNodes[i]);
            counts.total += childCounts.total;
            counts.withValues += childCounts.withValues;
            counts.withMetadata += childCounts.withMetadata;
            counts.withReferences += childCounts.withReferences;
            counts.errors += childCounts.errors;
        }
    }
    
    return counts;
}

// ============================================================================
// MODULE INITIALIZATION (ENHANCED)
// ============================================================================

/**
 * Initialize enhanced property sampler module
 * @returns {Boolean} - true if initialization successful
 */
function initializePropertySampler() {
    try {
        // Check dependencies
        if (typeof safeTypeCheck !== 'function') {
            $.writeln('ERROR: Safe foundation module not loaded');
            return false;
        }
        
        if (typeof createDOMStructure !== 'function') {
            $.writeln('ERROR: DOM enumerator module not loaded');
            return false;
        }
        
        // Enhanced: Check for enhanced foundation functions
        if (typeof createObjectReferenceTracker !== 'function') {
            $.writeln('WARNING: Enhanced foundation features not available - reference tracking disabled');
        }
        
        // Test core functions
        var requiredFunctions = [
            'sampleDOMValues', 'safeGetPropertyValue', 'formatSampleValueEnhanced'
        ];
        
        for (var i = 0; i < requiredFunctions.length; i++) {
            if (typeof eval(requiredFunctions[i]) !== 'function') {
                $.writeln('ERROR: Required function missing: ' + requiredFunctions[i]);
                return false;
            }
        }
        
        $.writeln('4.0_property-sampler.jsx: Enhanced version initialized successfully');
        $.writeln('Enhanced features: Reference tracking, value metadata, comparison fingerprints');
        $.writeln('Use sampleDOMValues(domStructure, config) to sample property values with enhancements');
        return true;
        
    } catch (exc) {
        $.writeln('ERROR: Enhanced property sampler initialization failed: ' + exc.message);
        return false;
    }
}

// Auto-initialize when module loads
initializePropertySampler();