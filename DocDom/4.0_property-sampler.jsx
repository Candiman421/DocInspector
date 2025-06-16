//
// 4.0_property-sampler.jsx
// InDesign DOM Discovery Builder - Property Value Sampling (Extension)
// CORE PURPOSE: Sample actual property values from discovered DOM structure
// DEPENDENCIES: 1.0_safe-foundation.jsx, 2.0_dom-enumerator.jsx
// SAFETY: Only accesses values for properties marked as safe during discovery
// ES3 COMPATIBLE: No reserved words, no modern JS features
// NOTE: This module is OPTIONAL - DOM discovery works without it
//

// ============================================================================
// SAMPLING CONFIGURATION
// ============================================================================

var DEFAULT_SAMPLING_CONFIG = {
    safetyFilter: 'safe',           // Only sample 'safe' properties by default
    maxSamples: 10,                 // Maximum items to sample from collections
    timeoutMs: 1000,                // Timeout per property access
    includeCollectionSamples: false, // Whether to sample collection items
    maxStringLength: 500,           // Truncate long strings
    maxObjectDepth: 1               // Depth limit for object value display
};

// ============================================================================
// MAIN SAMPLING FUNCTIONS
// ============================================================================

/**
 * Add actual property values to DOM structure
 * @param {Object} domStructure - DOM structure from enumeration
 * @param {Object} samplingConfig - Sampling configuration object
 * @returns {Object} - Enhanced DOM structure with values
 */
function sampleDOMValues(domStructure, samplingConfig) {
    if (!domStructure || !domStructure.structure || !domStructure.structure.document) {
        $.writeln('ERROR: Invalid DOM structure for sampling');
        return domStructure;
    }
    
    // Merge configuration
    var config = mergeConfig(DEFAULT_SAMPLING_CONFIG, samplingConfig);
    
    $.writeln('Starting property value sampling...');
    $.writeln('Safety Filter: ' + config.safetyFilter);
    $.writeln('Max Samples: ' + config.maxSamples);
    $.writeln('Timeout: ' + config.timeoutMs + 'ms');
    
    var startTime = new Date().getTime();
    var samplingStats = {
        totalAttempts: 0,
        successfulSamples: 0,
        timeouts: 0,
        errors: 0
    };
    
    try {
        // Get the document object for sampling
        var envResult = validateInDesignEnvironment();
        if (!envResult.valid) {
            $.writeln('ERROR: Cannot sample values - ' + envResult.error);
            return domStructure;
        }
        
        var doc = envResult.document;
        
        // Sample values from document node
        sampleNodeValues(domStructure.structure.document, doc, config, samplingStats);
        
        // Add sampling metadata
        if (!domStructure.metadata.sampling) {
            domStructure.metadata.sampling = {};
        }
        
        domStructure.metadata.sampling = {
            timestamp: getCurrentTimestamp(),
            config: config,
            stats: samplingStats,
            samplingTime: new Date().getTime() - startTime
        };
        
        $.writeln('Sampling complete:');
        $.writeln('  Total attempts: ' + samplingStats.totalAttempts);
        $.writeln('  Successful: ' + samplingStats.successfulSamples);
        $.writeln('  Timeouts: ' + samplingStats.timeouts);
        $.writeln('  Errors: ' + samplingStats.errors);
        $.writeln('  Time: ' + domStructure.metadata.sampling.samplingTime + 'ms');
        
    } catch (exc) {
        $.writeln('ERROR: Property sampling failed: ' + exc.message);
        if (!domStructure.statistics.errors) {
            domStructure.statistics.errors = [];
        }
        domStructure.statistics.errors.push('Sampling failed: ' + exc.message);
    }
    
    return domStructure;
}

/**
 * Sample values for properties in a DOM node
 * @param {Object} domNode - DOM node to sample
 * @param {Object} sourceObj - Source object to get values from
 * @param {Object} config - Sampling configuration
 * @param {Object} stats - Statistics tracking object
 */
function sampleNodeValues(domNode, sourceObj, config, stats) {
    if (!domNode || !sourceObj) return;
    
    // Sample properties
    if (domNode.properties) {
        samplePropertyList(domNode.properties, sourceObj, config, stats, 'properties');
    }
    
    // Sample collections if enabled
    if (config.includeCollectionSamples && domNode.collections) {
        samplePropertyList(domNode.collections, sourceObj, config, stats, 'collections');
    }
    
    // Note: We don't recurse into child nodes because that would require
    // accessing property values to get child objects, which violates our
    // safety-first discovery approach. Child node sampling would need to be
    // explicitly requested for specific safe paths.
}

/**
 * Sample values from a list of properties
 * @param {Array} propertyList - List of property classifications
 * @param {Object} sourceObj - Source object to get values from
 * @param {Object} config - Sampling configuration
 * @param {Object} stats - Statistics tracking object
 * @param {String} propertyType - Type of properties being sampled
 */
function samplePropertyList(propertyList, sourceObj, config, stats, propertyType) {
    for (var i = 0; i < propertyList.length; i++) {
        var prop = propertyList[i];
        
        // Check if property meets safety filter
        if (!meetsSafetyFilter(prop, config.safetyFilter)) {
            continue;
        }
        
        stats.totalAttempts++;
        
        // Sample the property value
        var sampleResult = samplePropertyValue(sourceObj, prop.name, config.timeoutMs);
        
        if (sampleResult.success) {
            stats.successfulSamples++;
            prop.sampleValue = formatSampleValue(sampleResult.value, config);
            prop.hasSampleValue = true;
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
 * Safely retrieve property value with timeout
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
        // This is where crashes can occur in ExtendScript
        var value = obj[propName];
        
        if (timeoutChecker()) {
            result.timeout = true;
            result.error = 'Timeout during access';
            return result;
        }
        
        result.success = true;
        result.value = value;
        return result;
        
    } catch (exc) {
        result.error = exc.message;
        return result;
    }
}

/**
 * Sample property value using the safe getter
 * @param {Object} obj - Object to sample from
 * @param {String} propName - Property name
 * @param {Number} timeoutMs - Timeout in milliseconds
 * @returns {Object} - Sample result
 */
function samplePropertyValue(obj, propName, timeoutMs) {
    return safeGetPropertyValue(obj, propName, timeoutMs);
}

// ============================================================================
// SAMPLING UTILITIES
// ============================================================================

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
 * Format sample value for display and storage
 * @param {*} value - Raw property value
 * @param {Object} config - Sampling configuration
 * @returns {String} - Formatted value
 */
function formatSampleValue(value, config) {
    try {
        if (value === null) return '[null]';
        if (value === undefined) return '[undefined]';
        
        var valueType = typeof value;
        
        switch (valueType) {
            case 'string':
                var str = String(value);
                if (str.length > config.maxStringLength) {
                    return '"' + str.substring(0, config.maxStringLength) + '..." [truncated]';
                }
                return '"' + str + '"';
                
            case 'number':
                return String(value);
                
            case 'boolean':
                return value ? 'true' : 'false';
                
            case 'object':
                return formatObjectValue(value, config, 0);
                
            case 'function':
                return '[function]';
                
            default:
                return '[' + valueType + ']';
        }
        
    } catch (exc) {
        return '[error formatting value: ' + exc.message + ']';
    }
}

/**
 * Format object value with depth limit
 * @param {Object} obj - Object to format
 * @param {Object} config - Sampling configuration
 * @param {Number} depth - Current depth
 * @returns {String} - Formatted object
 */
function formatObjectValue(obj, config, depth) {
    try {
        if (depth >= config.maxObjectDepth) {
            return '[object - max depth reached]';
        }
        
        if (obj === null) return '[null]';
        
        // Check if it's a collection-like object
        var length = safeGetLength(obj);
        if (length >= 0) {
            return '[collection, length: ' + length + ']';
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
// SAMPLING RESULTS UTILITIES
// ============================================================================

/**
 * Get sampling statistics from DOM structure
 * @param {Object} domStructure - DOM structure with sampling data
 * @returns {Object} - Sampling statistics
 */
function getSamplingStatistics(domStructure) {
    var defaultStats = {
        attempted: 0,
        successful: 0,
        timeouts: 0,
        errors: 0,
        samplingTime: 0,
        hasSamplingData: false
    };
    
    if (!domStructure || !domStructure.metadata || !domStructure.metadata.sampling) {
        return defaultStats;
    }
    
    var samplingData = domStructure.metadata.sampling;
    
    return {
        attempted: samplingData.stats.totalAttempts || 0,
        successful: samplingData.stats.successfulSamples || 0,
        timeouts: samplingData.stats.timeouts || 0,
        errors: samplingData.stats.errors || 0,
        samplingTime: samplingData.samplingTime || 0,
        hasSamplingData: true,
        config: samplingData.config
    };
}

/**
 * Count properties with sample values
 * @param {Object} domNode - DOM node to analyze
 * @returns {Number} - Count of properties with samples
 */
function countSampledProperties(domNode) {
    var count = 0;
    
    if (!domNode) return count;
    
    // Count sampled properties
    if (domNode.properties) {
        for (var i = 0; i < domNode.properties.length; i++) {
            if (domNode.properties[i].hasSampleValue) {
                count++;
            }
        }
    }
    
    // Count sampled collections
    if (domNode.collections) {
        for (var i = 0; i < domNode.collections.length; i++) {
            if (domNode.collections[i].hasSampleValue) {
                count++;
            }
        }
    }
    
    // Recursively count child nodes
    if (domNode.childNodes) {
        for (var i = 0; i < domNode.childNodes.length; i++) {
            count += countSampledProperties(domNode.childNodes[i]);
        }
    }
    
    return count;
}

// ============================================================================
// MODULE INITIALIZATION
// ============================================================================

/**
 * Initialize property sampler module
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
        
        // Test core functions
        var requiredFunctions = [
            'sampleDOMValues', 'safeGetPropertyValue', 'formatSampleValue'
        ];
        
        for (var i = 0; i < requiredFunctions.length; i++) {
            if (typeof eval(requiredFunctions[i]) !== 'function') {
                $.writeln('ERROR: Required function missing: ' + requiredFunctions[i]);
                return false;
            }
        }
        
        $.writeln('4.0_property-sampler.jsx: All functions initialized successfully');
        $.writeln('Use sampleDOMValues(domStructure, config) to sample property values');
        return true;
        
    } catch (exc) {
        $.writeln('ERROR: Property sampler initialization failed: ' + exc.message);
        return false;
    }
}

// Auto-initialize when module loads
initializePropertySampler();