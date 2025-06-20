// =============================================================================
// 1.2_safety-utilities.jsx - ES3 HELPER FUNCTIONS AND SAFETY UTILITIES
// InDesign DOM Discovery Builder v3.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: ES3-compatible helper functions and safety utilities with unified logging
// DEPENDENCIES: ["1.1_bootstrap-foundation.jsx"]
// SIZE: ~2030 lines - COMPLETE IMPLEMENTATION WITH BOOLEAN-ONLY LOGGING
// =============================================================================

// =============================================================================
// DEPENDENCY VALIDATION
// =============================================================================

var SAFETY_UTILITIES_DEPENDENCIES = ['1.1_bootstrap-foundation'];
var dependencyCheck = validateDependencies(SAFETY_UTILITIES_DEPENDENCIES);
if (!dependencyCheck.success) {
    throw new Error('Safety Utilities missing dependencies: ' + dependencyCheck.missing.join(', '));
}

// =============================================================================
// SAFETY CONFIGURATION
// =============================================================================

var SAFETY_CONFIG = {
    maxTimeout: 30000,
    maxOperations: 10000,
    memoryCheckInterval: 1000,
    maxStringLength: 10000,
    maxObjectDepth: 8,
    maxArrayLength: 1000
};

// =============================================================================
// UNIFIED LOGGING CONFIGURATION SYSTEM - SIMPLIFIED BOOLEAN-ONLY
// =============================================================================

var DEFAULT_LOGGING_CONFIG = {
    enabled: true,
    levels: {
        ERROR: true,    // Boolean only - no priority objects
        WARN: true,
        INFO: true,
        DEBUG: false
    },
    categories: {
        general: true,
        enumeration: true,
        sampling: true,
        display: true,
        exportData: true,        // NOT 'export' - reserved word!
        performance: true,
        circular: true,
        preprocessing: true,
        csv: true,
        json: true,
        text: true,
        file: true,
        analysis: true,
        comparison: true,
        mapping: true
    }
};

// Global logging configuration - can be overridden
var g_loggingConfig = null;

/**
 * Initialize unified logging configuration with robust error checking
 * @param {Object} customConfig - Custom logging configuration
 */
function initializeLoggingConfig(customConfig) {
    try {
        if (customConfig) {
            g_loggingConfig = objectDeepMerge(DEFAULT_LOGGING_CONFIG, customConfig);
        } else {
            g_loggingConfig = objectClone(DEFAULT_LOGGING_CONFIG, 3);
        }
        
        // Validate configuration structure
        if (!g_loggingConfig.levels || !g_loggingConfig.categories) {
            throw new Error('Invalid logging configuration structure');
        }
        
        // Ensure all required levels exist
        var requiredLevels = ['ERROR', 'WARN', 'INFO', 'DEBUG'];
        for (var i = 0; i < requiredLevels.length; i++) {
            if (typeof g_loggingConfig.levels[requiredLevels[i]] === 'undefined') {
                g_loggingConfig.levels[requiredLevels[i]] = true;
            }
        }
        
        // Ensure all required categories exist
        var requiredCategories = [
            'general', 'enumeration', 'sampling', 'display', 'exportData', 
            'performance', 'circular', 'preprocessing', 'csv', 'json', 
            'text', 'file', 'analysis', 'comparison', 'mapping'
        ];
        for (var j = 0; j < requiredCategories.length; j++) {
            if (typeof g_loggingConfig.categories[requiredCategories[j]] === 'undefined') {
                g_loggingConfig.categories[requiredCategories[j]] = true;
            }
        }
        
    } catch (exc) {
        // Fallback to safe defaults
        g_loggingConfig = objectClone(DEFAULT_LOGGING_CONFIG, 3);
        $.writeln('[LOG INIT ERROR] Using default config: ' + exc.message);
    }
}

// =============================================================================
// SIMPLIFIED LOGGING SYSTEM - BOOLEAN CHECKS ONLY
// =============================================================================

/**
 * Simplified logging with boolean-only checks
 * @param {String} message - Log message
 * @param {String} level - Log level: 'ERROR', 'WARN', 'INFO', 'DEBUG'
 * @param {String} category - Category: 'enumeration', 'sampling', 'display', etc.
 */
function logMessage(message, level, category) {
    try {
        var logLevel = level || 'INFO';
        var logCategory = category || 'general';

        // Initialize config if needed
        if (!g_loggingConfig) {
            initializeLoggingConfig();
        }

        // Check if logging is enabled globally
        if (!g_loggingConfig.enabled) {
            return;
        }

        // Simple boolean checks only - no complex priority logic
        var levelEnabled = g_loggingConfig.levels[logLevel];
        var categoryEnabled = g_loggingConfig.categories[logCategory];

        // Both level and category must be enabled
        if (levelEnabled && categoryEnabled) {
            var prefix = '[' + logLevel;
            if (logCategory !== 'general') {
                prefix += ' ' + stringToUpperCase(logCategory);
            }
            prefix += '] ';
            
            $.writeln(prefix + message);
        }

    } catch (exc) {
        // Fallback - always show if logging system fails
        $.writeln('[LOG FALLBACK] ' + message);
    }
}

// Convenience functions for different log levels
function logInfo(message, category) { logMessage(message, 'INFO', category); }
function logDebug(message, category) { logMessage(message, 'DEBUG', category); }
function logWarn(message, category) { logMessage(message, 'WARN', category); }
function logError(message, category) { logMessage(message, 'ERROR', category); }

/**
 * Legacy debug output wrapper - maintained for backward compatibility
 * @param {String} message - Debug message
 * @param {String} category - Debug category (enumeration, sampling, etc.)
 */
function debugLog(message, category) {
    logMessage(message, 'DEBUG', category);
}

/**
 * Performance timing wrapper
 * @param {String} operation - Operation name
 * @param {Number} startTime - Start time
 * @param {Number} endTime - End time
 */
function debugPerformance(operation, startTime, endTime) {
    var elapsed = endTime - startTime;
    logMessage(operation + ' completed in ' + elapsed + 'ms', 'INFO', 'performance');
}

/**
 * Check if specific debug category is enabled - Updated for boolean structure
 * @param {String} category - Debug category
 * @returns {Boolean} True if enabled
 */
function isDebugEnabled(category) {
    try {
        if (!g_loggingConfig || !g_loggingConfig.enabled) {
            return false;
        }

        // If no category specified, check if DEBUG level is enabled
        if (!category) {
            return g_loggingConfig.levels.DEBUG;
        }

        // Check both DEBUG level and specific category
        return g_loggingConfig.levels.DEBUG && g_loggingConfig.categories[category];

    } catch (exc) {
        return false;
    }
}

// =============================================================================
// ES3 ARRAY HELPER FUNCTIONS
// =============================================================================

/**
 * ES3-compatible Array.indexOf
 * @param {Array} targetArray - Array to search
 * @param {*} searchElement - Element to find
 * @returns {Number} Index of element or -1 if not found
 */
function arrayIndexOf(targetArray, searchElement) {
    try {
        if (!targetArray || typeof targetArray.length !== 'number') {
            return -1;
        }

        for (var i = 0; i < targetArray.length; i++) {
            if (targetArray[i] === searchElement) {
                return i;
            }
        }

        return -1;

    } catch (exc) {
        return -1;
    }
}

/**
 * ES3-compatible Array.slice
 * @param {Array} targetArray - Array to slice
 * @param {Number} start - Start index
 * @param {Number} end - End index (optional)
 * @returns {Array} Sliced array
 */
function arraySlice(targetArray, start, end) {
    try {
        if (!targetArray || typeof targetArray.length !== 'number') {
            return [];
        }

        var result = [];
        var startIndex = start || 0;
        var endIndex = (typeof end !== 'undefined') ? end : targetArray.length;

        if (startIndex < 0) startIndex = targetArray.length + startIndex;
        if (endIndex < 0) endIndex = targetArray.length + endIndex;

        for (var i = startIndex; i < endIndex && i < targetArray.length; i++) {
            if (i >= 0) {
                result[result.length] = targetArray[i];
            }
        }

        return result;

    } catch (exc) {
        return [];
    }
}

/**
 * ES3-compatible Array.join
 * @param {Array} targetArray - Array to join
 * @param {String} separator - Separator string
 * @returns {String} Joined string
 */
function arrayJoin(targetArray, separator) {
    try {
        if (!targetArray || typeof targetArray.length !== 'number') {
            return '';
        }

        var sep = (typeof separator !== 'undefined') ? separator : ',';
        var result = '';

        for (var i = 0; i < targetArray.length; i++) {
            if (i > 0) result += sep;
            result += targetArray[i];
        }

        return result;

    } catch (exc) {
        return '';
    }
}

/**
 * ES3-compatible Array.push
 * @param {Array} targetArray - Array to modify
 * @param {*} element - Element to add
 * @returns {Number} New array length
 */
function arrayPush(targetArray, element) {
    try {
        if (!targetArray || typeof targetArray.length !== 'number') {
            return 0;
        }

        targetArray[targetArray.length] = element;
        return targetArray.length;

    } catch (exc) {
        return 0;
    }
}

/**
 * ES3-compatible Array.pop
 * @param {Array} targetArray - Array to modify
 * @returns {*} Popped element
 */
function arrayPop(targetArray) {
    try {
        if (!targetArray || typeof targetArray.length !== 'number' || targetArray.length === 0) {
            return undefined;
        }

        var lastElement = targetArray[targetArray.length - 1];
        targetArray.length = targetArray.length - 1;
        return lastElement;

    } catch (exc) {
        return undefined;
    }
}

/**
 * ES3-compatible Array.concat
 * @param {Array} targetArray - Base array
 * @param {Array} arrayToConcat - Array to concatenate
 * @returns {Array} New concatenated array
 */
function arrayConcat(targetArray, arrayToConcat) {
    try {
        var result = arraySlice(targetArray);

        if (arrayToConcat && typeof arrayToConcat.length === 'number') {
            for (var i = 0; i < arrayToConcat.length; i++) {
                result[result.length] = arrayToConcat[i];
            }
        }

        return result;

    } catch (exc) {
        return targetArray || [];
    }
}

// =============================================================================
// ES3 STRING HELPER FUNCTIONS
// =============================================================================

/**
 * ES3-compatible String.indexOf
 * @param {String} targetString - String to search
 * @param {String} searchString - String to find
 * @param {Number} position - Start position
 * @returns {Number} Index of substring or -1 if not found
 */
function stringIndexOf(targetString, searchString, position) {
    try {
        if (typeof targetString !== 'string' || typeof searchString !== 'string') {
            return -1;
        }

        var startPos = position || 0;
        if (startPos < 0) startPos = 0;

        for (var i = startPos; i <= targetString.length - searchString.length; i++) {
            var match = true;
            for (var j = 0; j < searchString.length; j++) {
                if (targetString.charAt(i + j) !== searchString.charAt(j)) {
                    match = false;
                    break;
                }
            }
            if (match) return i;
        }

        return -1;

    } catch (exc) {
        return -1;
    }
}

/**
 * ES3-compatible String.substring
 * @param {String} targetString - String to extract from
 * @param {Number} start - Start index
 * @param {Number} end - End index
 * @returns {String} Extracted substring
 */
function stringSubstring(targetString, start, end) {
    try {
        if (typeof targetString !== 'string') {
            return '';
        }

        var startIndex = start || 0;
        var endIndex = (typeof end !== 'undefined') ? end : targetString.length;

        if (startIndex < 0) startIndex = 0;
        if (endIndex < 0) endIndex = 0;
        if (startIndex > targetString.length) startIndex = targetString.length;
        if (endIndex > targetString.length) endIndex = targetString.length;

        if (startIndex > endIndex) {
            var temp = startIndex;
            startIndex = endIndex;
            endIndex = temp;
        }

        var result = '';
        for (var i = startIndex; i < endIndex; i++) {
            result += targetString.charAt(i);
        }

        return result;

    } catch (exc) {
        return '';
    }
}

/**
 * ES3-compatible String.charAt
 * @param {String} targetString - String to get character from
 * @param {Number} index - Character index
 * @returns {String} Character at index
 */
function stringCharAt(targetString, index) {
    try {
        if (typeof targetString !== 'string' || index < 0 || index >= targetString.length) {
            return '';
        }

        return targetString.charAt(index);

    } catch (exc) {
        return '';
    }
}

/**
 * ES3-compatible String.split
 * @param {String} targetString - String to split
 * @param {String} separator - Separator string
 * @returns {Array} Array of string parts
 */
function stringSplit(targetString, separator) {
    try {
        if (typeof targetString !== 'string') {
            return [];
        }

        if (typeof separator !== 'string') {
            return [targetString];
        }

        if (separator === '') {
            var chars = [];
            for (var i = 0; i < targetString.length; i++) {
                chars[chars.length] = targetString.charAt(i);
            }
            return chars;
        }

        var result = [];
        var lastIndex = 0;
        var index = stringIndexOf(targetString, separator);

        while (index !== -1) {
            result[result.length] = stringSubstring(targetString, lastIndex, index);
            lastIndex = index + separator.length;
            index = stringIndexOf(targetString, separator, lastIndex);
        }

        result[result.length] = stringSubstring(targetString, lastIndex);
        return result;

    } catch (exc) {
        return [targetString || ''];
    }
}

/**
 * ES3-compatible String.toLowerCase
 * @param {String} targetString - String to convert
 * @returns {String} Lowercase string
 */
function stringToLowerCase(targetString) {
    try {
        if (typeof targetString !== 'string') {
            return '';
        }

        return targetString.toLowerCase();

    } catch (exc) {
        return targetString || '';
    }
}

/**
 * ES3-compatible String.toUpperCase
 * @param {String} targetString - String to convert
 * @returns {String} Uppercase string
 */
function stringToUpperCase(targetString) {
    try {
        if (typeof targetString !== 'string') {
            return '';
        }

        return targetString.toUpperCase();

    } catch (exc) {
        return targetString || '';
    }
}

/**
 * ES3-compatible String.replace (simple version)
 * @param {String} targetString - String to modify
 * @param {String} searchValue - String to find
 * @param {String} replaceValue - Replacement string
 * @returns {String} Modified string
 */
function stringReplace(targetString, searchValue, replaceValue) {
    try {
        if (typeof targetString !== 'string' || typeof searchValue !== 'string') {
            return targetString || '';
        }

        var replacement = replaceValue || '';
        var index = stringIndexOf(targetString, searchValue);

        if (index === -1) {
            return targetString;
        }

        return stringSubstring(targetString, 0, index) + replacement + 
               stringSubstring(targetString, index + searchValue.length);

    } catch (exc) {
        return targetString || '';
    }
}

/**
 * ES3-compatible String.match (simple pattern matching)
 * @param {String} targetString - String to search
 * @param {String} pattern - Pattern to find
 * @returns {Array} Match results or null
 */
function stringMatch(targetString, pattern) {
    try {
        if (typeof targetString !== 'string' || typeof pattern !== 'string') {
            return null;
        }

        var index = stringIndexOf(targetString, pattern);
        if (index === -1) return null;

        return [pattern];

    } catch (exc) {
        return null;
    }
}

// =============================================================================
// ES3 OBJECT HELPER FUNCTIONS
// =============================================================================

/**
 * ES3-compatible Object.hasOwnProperty
 * @param {Object} targetObject - Object to check
 * @param {String} propertyName - Property name
 * @returns {Boolean} True if property exists
 */
function objectHasOwnProperty(targetObject, propertyName) {
    try {
        if (!targetObject || typeof targetObject !== 'object') {
            return false;
        }

        return Object.prototype.hasOwnProperty.call(targetObject, propertyName);

    } catch (exc) {
        return false;
    }
}

/**
 * Count object keys (ES3 compatible)
 * @param {Object} targetObject - Object to count
 * @returns {Number} Number of properties
 */
function countObjectKeys(targetObject) {
    try {
        if (!targetObject || typeof targetObject !== 'object') {
            return 0;
        }

        var count = 0;
        for (var key in targetObject) {
            if (objectHasOwnProperty(targetObject, key)) {
                count++;
            }
        }

        return count;

    } catch (exc) {
        return 0;
    }
}

/**
 * Get object keys (ES3 compatible)
 * @param {Object} targetObject - Object to get keys from
 * @returns {Array} Array of property names
 */
function getObjectKeys(targetObject) {
    try {
        if (!targetObject || typeof targetObject !== 'object') {
            return [];
        }

        var keys = [];
        for (var key in targetObject) {
            if (objectHasOwnProperty(targetObject, key)) {
                keys[keys.length] = key;
            }
        }

        return keys;

    } catch (exc) {
        return [];
    }
}

/**
 * Deep object merge (ES3 compatible)
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object
 */
function objectDeepMerge(target, source) {
    try {
        if (!target || typeof target !== 'object') {
            target = {};
        }

        if (!source || typeof source !== 'object') {
            return target;
        }

        for (var key in source) {
            if (objectHasOwnProperty(source, key)) {
                if (source[key] && typeof source[key] === 'object' && 
                    target[key] && typeof target[key] === 'object') {
                    target[key] = objectDeepMerge(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        }

        return target;

    } catch (exc) {
        return target || {};
    }
}

/**
 * Shallow object merge (ES3 compatible)
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object
 */
function objectMerge(target, source) {
    try {
        if (!target || typeof target !== 'object') {
            target = {};
        }

        if (!source || typeof source !== 'object') {
            return target;
        }

        for (var key in source) {
            if (objectHasOwnProperty(source, key)) {
                target[key] = source[key];
            }
        }

        return target;

    } catch (exc) {
        return target || {};
    }
}

/**
 * Deep object clone with depth limit
 * @param {Object} source - Source object
 * @param {Number} depth - Maximum depth
 * @returns {Object} Cloned object
 */
function objectClone(source, depth) {
    try {
        if (!source) return source;

        var maxDepth = depth || 3;

        function cloneValue(value, currentDepth) {
            try {
                if (currentDepth >= maxDepth) {
                    return '[max depth reached]';
                }

                if (value === null || value === undefined) {
                    return value;
                }

                var valueType = typeof value;

                if (valueType !== 'object') {
                    return value;
                }

                // Handle arrays
                if (value.length !== undefined && typeof value.length === 'number') {
                    var clonedArray = [];
                    for (var i = 0; i < value.length; i++) {
                        clonedArray[i] = cloneValue(value[i], currentDepth + 1);
                    }
                    return clonedArray;
                }

                // Handle objects
                var clonedObject = {};
                for (var prop in value) {
                    if (objectHasOwnProperty(value, prop)) {
                        clonedObject[prop] = cloneValue(value[prop], currentDepth + 1);
                    }
                }
                return clonedObject;

            } catch (exc) {
                return '[clone error]';
            }
        }

        return cloneValue(source, 0);

    } catch (exc) {
        return source;
    }
}

// =============================================================================
// FUNCTION UTILITIES
// =============================================================================

/**
 * Check if function exists
 * @param {String} functionName - Function name to check
 * @returns {Boolean} True if function exists
 */
function functionExists(functionName) {
    try {
        if (typeof functionName !== 'string') {
            return false;
        }

        // Use indirect evaluation to avoid security issues
        return typeof this[functionName] === 'function';

    } catch (exc) {
        return false;
    }
}

/**
 * Safe function call with error handling
 * @param {Function} func - Function to call
 * @param {Array} args - Arguments array
 * @returns {Object} Result object with success/error info
 */
function safeCall(func, args) {
    try {
        if (typeof func !== 'function') {
            return { success: false, error: 'Not a function', result: null };
        }

        var result = func.apply(this, args || []);
        return { success: true, error: null, result: result };

    } catch (exc) {
        return { success: false, error: exc.message, result: null };
    }
}

// =============================================================================
// ES3 COMPATIBILITY FUNCTIONS
// =============================================================================

/**
 * Trim whitespace from string (ES3 compatible)
 * @param {String} str - String to trim
 * @returns {String} Trimmed string
 */
function trimString(str) {
    try {
        if (typeof str !== 'string') {
            return '';
        }

        return str.replace(/^\s+|\s+$/g, '');

    } catch (exc) {
        return str || '';
    }
}

/**
 * Safe toString conversion
 * @param {*} value - Value to convert
 * @returns {String} String representation
 */
function safeToString(value) {
    try {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (typeof value === 'string') return value;
        
        return String(value);

    } catch (exc) {
        return '[toString error]';
    }
}

/**
 * Safe parseInt
 * @param {*} value - Value to parse
 * @param {Number} radix - Number base
 * @returns {Number} Parsed integer or NaN
 */
function safeParseInt(value, radix) {
    try {
        return parseInt(value, radix || 10);
    } catch (exc) {
        return NaN;
    }
}

/**
 * Safe parseFloat
 * @param {*} value - Value to parse
 * @returns {Number} Parsed float or NaN
 */
function safeParseFloat(value) {
    try {
        return parseFloat(value);
    } catch (exc) {
        return NaN;
    }
}

// =============================================================================
// JSON HANDLING
// =============================================================================

/**
 * Safe JSON stringify with fallback
 * @param {*} obj - Object to stringify
 * @param {Number} maxDepth - Maximum depth
 * @returns {String} JSON string or fallback
 */
function safeJSONStringify(obj, maxDepth) {
    try {
        // Try native JSON first if available
        if (typeof JSON !== 'undefined' && JSON.stringify) {
            return JSON.stringify(obj);
        }

        // Fallback to custom implementation
        return fallbackStringify(obj, maxDepth || 3);

    } catch (exc) {
        return fallbackStringify(obj, 2);
    }
}

/**
 * Fallback JSON stringify implementation
 * @param {*} obj - Object to stringify
 * @param {Number} maxDepth - Maximum depth
 * @returns {String} JSON-like string
 */
function fallbackStringify(obj, maxDepth) {
    try {
        var depth = maxDepth || 3;

        function stringify(value, currentDepth) {
            if (currentDepth >= depth) {
                return '"[max depth]"';
            }

            if (value === null) return 'null';
            if (value === undefined) return 'undefined';

            var valueType = typeof value;

            if (valueType === 'string') {
                return '"' + stringReplace(stringReplace(value, '\\', '\\\\'), '"', '\\"') + '"';
            }

            if (valueType === 'number' || valueType === 'boolean') {
                return String(value);
            }

            if (valueType === 'object') {
                if (value.length !== undefined && typeof value.length === 'number') {
                    // Array
                    var arrayItems = [];
                    for (var i = 0; i < value.length; i++) {
                        arrayItems[arrayItems.length] = stringify(value[i], currentDepth + 1);
                    }
                    return '[' + arrayJoin(arrayItems, ',') + ']';
                } else {
                    // Object
                    var objectPairs = [];
                    for (var key in value) {
                        if (objectHasOwnProperty(value, key)) {
                            objectPairs[objectPairs.length] = '"' + key + '":' + stringify(value[key], currentDepth + 1);
                        }
                    }
                    return '{' + arrayJoin(objectPairs, ',') + '}';
                }
            }

            return '"[unknown type]"';
        }

        return stringify(obj, 0);

    } catch (exc) {
        return '"[stringify error]"';
    }
}

/**
 * Safe JSON parse with fallback
 * @param {String} jsonString - JSON string to parse
 * @returns {*} Parsed object or null
 */
function safeJSONParse(jsonString) {
    try {
        if (typeof jsonString !== 'string') {
            return null;
        }

        // Try native JSON first if available
        if (typeof JSON !== 'undefined' && JSON.parse) {
            return JSON.parse(jsonString);
        }

        // For ExtendScript, we need a very basic parser or return null
        return null;

    } catch (exc) {
        return null;
    }
}

// =============================================================================
// PROPERTY SAFETY FUNCTIONS
// =============================================================================

/**
 * Safe type checking
 * @param {*} value - Value to check
 * @param {String} expectedType - Expected type
 * @returns {Boolean} True if type matches
 */
function safeTypeCheck(value, expectedType) {
    try {
        return typeof value === expectedType;
    } catch (exc) {
        return false;
    }
}

/**
 * Safe property existence check
 * @param {Object} obj - Object to check
 * @param {String} propName - Property name
 * @returns {Boolean} True if property exists
 */
function safeHasProperty(obj, propName) {
    try {
        if (!obj || typeof obj !== 'object') {
            return false;
        }

        return propName in obj;

    } catch (exc) {
        return false;
    }
}

/**
 * Safe length getter
 * @param {*} obj - Object with length property
 * @returns {Number} Length or 0
 */
function safeGetLength(obj) {
    try {
        if (!obj) return 0;
        if (typeof obj.length === 'number') return obj.length;
        return 0;
    } catch (exc) {
        return 0;
    }
}

/**
 * Safe object access by path
 * @param {Object} obj - Root object
 * @param {String} path - Dot-separated path
 * @returns {*} Value at path or undefined
 */
function safeGetObjectFromPath(obj, path) {
    try {
        if (!obj || !path) return undefined;

        var parts = stringSplit(path, '.');
        var current = obj;

        for (var i = 0; i < parts.length; i++) {
            if (!current || typeof current !== 'object') {
                return undefined;
            }
            current = current[parts[i]];
        }

        return current;

    } catch (exc) {
        return undefined;
    }
}

/**
 * Safe property value retrieval
 * @param {Object} obj - Object to access
 * @param {String} propName - Property name
 * @param {*} defaultValue - Default value if property doesn't exist
 * @returns {*} Property value or default
 */
function safeGetPropertyValue(obj, propName, defaultValue) {
    try {
        if (!obj || typeof obj !== 'object') {
            return defaultValue;
        }

        if (safeHasProperty(obj, propName)) {
            return obj[propName];
        }

        return defaultValue;

    } catch (exc) {
        return defaultValue;
    }
}

// =============================================================================
// OBJECT REFERENCE TRACKING
// =============================================================================

/**
 * Generate unique object reference ID
 * @param {Object} obj - Object to generate ID for
 * @returns {String} Unique reference ID
 */
function generateObjectReferenceID(obj) {
    try {
        if (!obj || typeof obj !== 'object') {
            return 'non-object-' + (new Date().getTime());
        }

        // Try to use object toString or constructor info
        var typeInfo = '';
        try {
            typeInfo = obj.toString();
            if (typeInfo === '[object Object]') {
                typeInfo = obj.constructor ? obj.constructor.name || 'Object' : 'Object';
            }
        } catch (exc) {
            typeInfo = 'unknown';
        }

        return typeInfo + '-' + (new Date().getTime()) + '-' + Math.floor(Math.random() * 10000);

    } catch (exc) {
        return 'error-' + (new Date().getTime());
    }
}

/**
 * Check if two objects are the same reference
 * @param {Object} obj1 - First object
 * @param {Object} obj2 - Second object
 * @returns {Boolean} True if same reference
 */
function isSameObjectReference(obj1, obj2) {
    try {
        return obj1 === obj2;
    } catch (exc) {
        return false;
    }
}

/**
 * Create object reference tracker
 * @returns {Object} Reference tracking utilities
 */
function createObjectReferenceTracker() {
    try {
        var trackedObjects = [];
        var referenceIds = [];

        return {
            isTracked: function(obj) {
                try {
                    for (var i = 0; i < trackedObjects.length; i++) {
                        if (isSameObjectReference(trackedObjects[i], obj)) {
                            return true;
                        }
                    }
                    return false;
                } catch (exc) {
                    return false;
                }
            },

            addObject: function(obj) {
                try {
                    if (!this.isTracked(obj)) {
                        trackedObjects[trackedObjects.length] = obj;
                        referenceIds[referenceIds.length] = generateObjectReferenceID(obj);
                    }
                } catch (exc) {
                    // Silent fail
                }
            },

            getTrackedCount: function() {
                try {
                    return trackedObjects.length;
                } catch (exc) {
                    return 0;
                }
            },

            clear: function() {
                try {
                    trackedObjects = [];
                    referenceIds = [];
                } catch (exc) {
                    // Silent fail
                }
            }
        };

    } catch (exc) {
        return {
            isTracked: function() { return false; },
            addObject: function() { },
            getTrackedCount: function() { return 0; },
            clear: function() { }
        };
    }
}

// =============================================================================
// PATH UTILITIES
// =============================================================================

/**
 * Split path into components
 * @param {String} path - Path to split
 * @returns {Array} Path components
 */
function splitPath(path) {
    try {
        if (typeof path !== 'string') {
            return [];
        }

        if (path === '') {
            return [];
        }

        return stringSplit(path, '.');

    } catch (exc) {
        return [];
    }
}

/**
 * Join path components
 * @param {Array} components - Path components
 * @returns {String} Joined path
 */
function joinPath(components) {
    try {
        if (!components || typeof components.length !== 'number') {
            return '';
        }

        return arrayJoin(components, '.');

    } catch (exc) {
        return '';
    }
}

/**
 * Get parent path
 * @param {String} path - Child path
 * @returns {String} Parent path
 */
function getParentPath(path) {
    try {
        var components = splitPath(path);
        if (components.length <= 1) {
            return '';
        }

        return joinPath(arraySlice(components, 0, components.length - 1));

    } catch (exc) {
        return '';
    }
}

/**
 * Normalize path (remove empty components)
 * @param {String} path - Path to normalize
 * @returns {String} Normalized path
 */
function normalizePath(path) {
    try {
        var components = splitPath(path);
        var normalized = [];

        for (var i = 0; i < components.length; i++) {
            if (components[i] && components[i] !== '') {
                normalized[normalized.length] = components[i];
            }
        }

        return joinPath(normalized);

    } catch (exc) {
        return path || '';
    }
}

/**
 * Check if path is absolute
 * @param {String} path - Path to check
 * @returns {Boolean} True if absolute
 */
function isAbsolutePath(path) {
    try {
        if (typeof path !== 'string') {
            return false;
        }

        return stringIndexOf(path, '.') === 0;

    } catch (exc) {
        return false;
    }
}

/**
 * Make path absolute
 * @param {String} path - Path to make absolute
 * @param {String} basePath - Base path
 * @returns {String} Absolute path
 */
function makeAbsolutePath(path, basePath) {
    try {
        if (isAbsolutePath(path)) {
            return path;
        }

        if (!basePath) {
            return path;
        }

        return basePath + '.' + path;

    } catch (exc) {
        return path || '';
    }
}

// =============================================================================
// MEMORY MANAGEMENT
// =============================================================================

/**
 * Cleanup function for memory management
 * @param {Object} obj - Object to cleanup
 */
function memoryCleanup(obj) {
    try {
        if (!obj || typeof obj !== 'object') {
            return;
        }

        // Set properties to null to help GC
        for (var prop in obj) {
            if (objectHasOwnProperty(obj, prop)) {
                obj[prop] = null;
            }
        }

    } catch (exc) {
        // Silent fail
    }
}

/**
 * Create memory monitor
 * @returns {Object} Memory monitoring utilities
 */
function createMemoryMonitor() {
    try {
        var allocatedObjects = 0;
        var maxObjects = 10000;

        return {
            allocate: function() {
                allocatedObjects++;
                return allocatedObjects <= maxObjects;
            },

            deallocate: function() {
                if (allocatedObjects > 0) {
                    allocatedObjects--;
                }
            },

            getStats: function() {
                return {
                    allocated: allocatedObjects,
                    maxAllowed: maxObjects,
                    available: maxObjects - allocatedObjects
                };
            },

            isNearLimit: function() {
                return allocatedObjects > (maxObjects * 0.8);
            }
        };

    } catch (exc) {
        return {
            allocate: function() { return true; },
            deallocate: function() { },
            getStats: function() { return {}; },
            isNearLimit: function() { return false; }
        };
    }
}

// =============================================================================
// DANGER DETECTION
// =============================================================================

/**
 * Check if property is dangerous to access
 * @param {String} propName - Property name
 * @returns {Boolean} True if dangerous
 */
function isDangerousProperty(propName) {
    try {
        if (typeof propName !== 'string') return true;

        var dangerousProps = [
            'prototype', '__proto__', 'constructor', 'caller', 'arguments',
            'eval', 'Function', 'valueOf', 'toString', 'hasOwnProperty',
            'call', 'apply', 'bind', '__defineGetter__', '__defineSetter__',
            '__lookupGetter__', '__lookupSetter__', 'propertyIsEnumerable'
        ];

        return arrayIndexOf(dangerousProps, propName) !== -1;

    } catch (exc) {
        return true;
    }
}

/**
 * Check if path contains dangerous elements
 * @param {String} path - Path to check
 * @returns {Boolean} True if dangerous
 */
function isDangerousPath(path) {
    try {
        if (typeof path !== 'string') return true;

        var components = splitPath(path);
        for (var i = 0; i < components.length; i++) {
            if (isDangerousProperty(components[i])) {
                return true;
            }
        }

        return false;

    } catch (exc) {
        return true;
    }
}

/**
 * Check if string is a reserved word (FIXED: removed reserved word variable names)
 * @param {String} word - Word to check
 * @returns {Boolean} True if reserved
 */
function isReservedWord(word) {
    try {
        if (typeof word !== 'string') return true;

        var reserved = [
            'break', 'case', 'catch', 'continue', 'default', 'delete', 'do', 'else',
            'finally', 'for', 'function', 'if', 'in', 'instanceof', 'new',
            'return', 'switch', 'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with',
            'abstract', 'boolean', 'byte', 'char', 'class', 'const', 'debugger',
            'double', 'enum', 'export', 'extends', 'final', 'float', 'goto',
            'implements', 'import', 'int', 'interface', 'let', 'long', 'native',
            'package', 'private', 'protected', 'public', 'short', 'static', 'super',
            'synchronized', 'throws', 'transient', 'volatile'
        ];

        return arrayIndexOf(reserved, word) !== -1;

    } catch (exc) {
        return true;
    }
}

/**
 * Get property safety level
 * @param {String} propName - Property name
 * @returns {String} Safety level: 'safe', 'caution', 'dangerous'
 */
function getPropertySafetyLevel(propName) {
    try {
        if (isDangerousProperty(propName)) {
            return 'dangerous';
        }

        if (isReservedWord(propName)) {
            return 'dangerous';
        }

        if (stringIndexOf(propName, '_') === 0) {
            return 'caution';
        }

        return 'safe';

    } catch (exc) {
        return 'dangerous';
    }
}

// =============================================================================
// OPERATION CONTROL
// =============================================================================

/**
 * Create timeout checker
 * @param {Number} timeoutMs - Timeout in milliseconds
 * @returns {Function} Timeout check function
 */
function createTimeoutChecker(timeoutMs) {
    try {
        var startTime = new Date().getTime();
        var timeout = timeoutMs || 10000;

        return function () {
            try {
                var elapsed = new Date().getTime() - startTime;
                return elapsed > timeout;
            } catch (exc) {
                return true;
            }
        };

    } catch (exc) {
        return function () { return true; };
    }
}

/**
 * Create operation counter
 * @param {Number} maxOperations - Maximum operations
 * @returns {Object} Operation counter
 */
function createOperationCounter(maxOperations) {
    try {
        var operations = 0;
        var maxOps = maxOperations || 1000;

        return {
            increment: function () {
                try {
                    operations++;
                    return operations <= maxOps;
                } catch (exc) {
                    return false;
                }
            },

            check: function () {
                try {
                    return operations <= maxOps;
                } catch (exc) {
                    return false;
                }
            },

            reset: function () {
                try {
                    operations = 0;
                } catch (exc) {
                    // Silent fail
                }
            },

            getCount: function () {
                try {
                    return operations;
                } catch (exc) {
                    return 0;
                }
            }
        };

    } catch (exc) {
        return {
            increment: function () { return true; },
            check: function () { return true; },
            reset: function () { },
            getCount: function () { return 0; }
        };
    }
}

/**
 * Create rate limiter
 * @param {Number} maxPerSecond - Maximum operations per second
 * @returns {Object} Rate limiter
 */
function createRateLimiter(maxPerSecond) {
    try {
        var lastOperationTime = 0;
        var operationCount = 0;
        var rate = maxPerSecond || 100;
        var intervalMs = 1000 / rate;

        return {
            checkRate: function () {
                try {
                    var currentTime = new Date().getTime();
                    
                    if (currentTime - lastOperationTime >= intervalMs) {
                        lastOperationTime = currentTime;
                        operationCount++;
                        return true;
                    }
                    
                    return false;
                } catch (exc) {
                    return false;
                }
            },

            forceCleanup: function () {
                try {
                    operationCount = 0;
                    lastOperationTime = 0;
                } catch (exc) {
                    // Silent fail
                }
            },

            getStats: function () {
                try {
                    return {
                        operations: operationCount,
                        lastOperation: lastOperationTime,
                        rate: rate
                    };
                } catch (exc) {
                    return {};
                }
            }
        };

    } catch (exc) {
        return {
            checkRate: function () { return false; },
            forceCleanup: function () { },
            getStats: function () { return {}; }
        };
    }
}

// =============================================================================
// ENVIRONMENT VALIDATION
// =============================================================================

/**
 * Validate InDesign environment
 * @returns {Object} Validation result
 */
function validateInDesignEnvironment() {
    try {
        var result = {
            valid: false,
            error: null,
            version: null,
            document: null,
            warnings: []
        };

        // Check InDesign application
        if (typeof app === 'undefined') {
            result.error = 'InDesign application not available';
            return result;
        }

        // Get version info
        try {
            result.version = app.version;
        } catch (exc) {
            result.warnings[result.warnings.length] = 'Could not determine InDesign version';
        }

        // Check for active document
        try {
            if (app.documents.length === 0) {
                result.error = 'No active document';
                return result;
            }

            result.document = app.activeDocument;
        } catch (exc) {
            result.error = 'Could not access active document: ' + exc.message;
            return result;
        }

        result.valid = true;
        return result;

    } catch (exc) {
        return {
            valid: false,
            error: 'Environment validation failed: ' + exc.message,
            version: null,
            document: null,
            warnings: []
        };
    }
}

/**
 * Validate document state
 * @param {Object} documentObj - InDesign document
 * @returns {Object} Validation result
 */
function validateDocumentState(documentObj) {
    try {
        var result = {
            safe: false,
            metadata: {},
            warnings: []
        };

        if (!documentObj) {
            result.warnings[result.warnings.length] = 'No document provided';
            return result;
        }

        // Collect basic metadata
        try {
            result.metadata.name = documentObj.name || 'Unnamed Document';
        } catch (exc) {
            result.metadata.name = 'Unknown Document';
            result.warnings[result.warnings.length] = 'Could not access document name';
        }

        try {
            result.metadata.saved = documentObj.saved || false;
        } catch (exc) {
            result.metadata.saved = false;
            result.warnings[result.warnings.length] = 'Could not check document saved status';
        }

        try {
            result.metadata.modified = documentObj.modified || false;
        } catch (exc) {
            result.metadata.modified = false;
            result.warnings[result.warnings.length] = 'Could not check document modified status';
        }

        // Check for collections
        try {
            result.metadata.pageCount = safeGetLength(documentObj.pages);
            result.metadata.storyCount = safeGetLength(documentObj.stories);
            result.metadata.layerCount = safeGetLength(documentObj.layers);
        } catch (exc) {
            result.warnings[result.warnings.length] = 'Could not access document collections';
        }

        // Document is considered safe if we can access basic properties
        if (result.metadata.name) {
            result.safe = true;
        }

        return result;

    } catch (exc) {
        result.warnings[result.warnings.length] = 'Document validation failed: ' + exc.message;
        return result;
    }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Create string builder for efficient concatenation
 * @returns {Object} String builder object
 */
function createStringBuilder() {
    try {
        var parts = [];

        return {
            append: function (text) {
                try {
                    parts[parts.length] = text || '';
                } catch (exc) {
                    // Silent fail
                }
            },

            toString: function () {
                try {
                    return arrayJoin(parts, '');
                } catch (exc) {
                    return '';
                }
            },

            clear: function () {
                try {
                    parts = [];
                } catch (exc) {
                    // Silent fail
                }
            },

            getLength: function () {
                try {
                    return parts.length;
                } catch (exc) {
                    return 0;
                }
            }
        };

    } catch (exc) {
        return {
            append: function () { },
            toString: function () { return ''; },
            clear: function () { },
            getLength: function () { return 0; }
        };
    }
}

/**
 * Get current timestamp
 * @returns {Number} Current timestamp
 */
function getCurrentTimestamp() {
    try {
        return new Date().getTime();
    } catch (exc) {
        return 0;
    }
}

/**
 * Generate unique ID
 * @param {String} prefix - ID prefix
 * @returns {String} Unique ID
 */
function generateUniqueID(prefix) {
    try {
        var pre = prefix || 'id';
        return pre + '_' + getCurrentTimestamp() + '_' + Math.floor(Math.random() * 10000);
    } catch (exc) {
        return 'id_unknown';
    }
}

/**
 * Create error result object
 * @param {String} message - Error message
 * @param {String} code - Error code
 * @returns {Object} Error result
 */
function createErrorResult(message, code) {
    try {
        return {
            success: false,
            error: message || 'Unknown error',
            code: code || 'GENERAL_ERROR',
            data: null,
            timestamp: getCurrentTimestamp()
        };
    } catch (exc) {
        return {
            success: false,
            error: 'Failed to create error result',
            code: 'CRITICAL_ERROR',
            data: null,
            timestamp: 0
        };
    }
}

/**
 * Create success result object
 * @param {*} data - Result data
 * @param {String} message - Success message
 * @returns {Object} Success result
 */
function createSuccessResult(data, message) {
    try {
        return {
            success: true,
            error: null,
            code: 'SUCCESS',
            data: data || null,
            message: message || 'Operation completed successfully',
            timestamp: getCurrentTimestamp()
        };
    } catch (exc) {
        return createErrorResult('Failed to create success result', 'CRITICAL_ERROR');
    }
}

/**
 * Retry operation with exponential backoff
 * @param {Function} operation - Operation to retry
 * @param {Number} maxRetries - Maximum retry attempts
 * @param {Number} baseDelay - Base delay in milliseconds
 * @returns {*} Operation result
 */
function retryOperation(operation, maxRetries, baseDelay) {
    try {
        var retries = maxRetries || 3;
        var delay = baseDelay || 100;

        for (var attempt = 0; attempt < retries; attempt++) {
            try {
                return operation();
            } catch (exc) {
                if (attempt === retries - 1) {
                    throw exc;
                }

                // Simple delay implementation
                var start = getCurrentTimestamp();
                while (getCurrentTimestamp() - start < delay) {
                    // Busy wait
                }

                delay *= 2; // Exponential backoff
            }
        }

    } catch (exc) {
        return createErrorResult('Retry operation failed: ' + exc.message, 'RETRY_FAILED');
    }
}

/**
 * Update status callback wrapper
 * @param {Function} callback - Status callback function
 * @param {String} message - Status message
 */
function updateStatus(callback, message) {
    try {
        if (typeof callback === 'function') {
            callback(message || 'Status update');
        }
    } catch (exc) {
        // Silent fail - don't let status updates crash operations
    }
}

// =============================================================================
// MODULE REGISTRATION - COMPLETE FUNCTION LIST
// =============================================================================

// Register this module with all its functions
registerModule('1.2_safety-utilities', '3.1', [
    // Unified Logging System - UPDATED WITH BOOLEAN-ONLY LOGIC
    'initializeLoggingConfig', 'logMessage', 'logInfo', 'logDebug', 'logWarn', 'logError',

    // Array Helpers
    'arrayIndexOf', 'arraySlice', 'arrayJoin', 'arrayPush', 'arrayPop', 'arrayConcat',

    // String Helpers
    'stringIndexOf', 'stringSubstring', 'stringCharAt', 'stringSplit',
    'stringToLowerCase', 'stringToUpperCase', 'stringReplace', 'stringMatch',

    // Object Helpers
    'objectHasOwnProperty', 'countObjectKeys', 'getObjectKeys', 'objectClone',
    'objectMerge', 'objectDeepMerge',

    // Function Utilities
    'functionExists', 'safeCall',

    // ES3 Compatibility
    'trimString', 'safeToString', 'safeParseInt', 'safeParseFloat',

    // JSON Handling
    'safeJSONStringify', 'fallbackStringify', 'safeJSONParse',

    // Property Safety Functions
    'safeTypeCheck', 'safeHasProperty', 'safeGetLength', 'safeGetObjectFromPath',
    'safeGetPropertyValue',

    // Object Reference Tracking
    'generateObjectReferenceID', 'isSameObjectReference', 'createObjectReferenceTracker',

    // Path Utilities
    'splitPath', 'joinPath', 'getParentPath', 'normalizePath', 'isAbsolutePath', 'makeAbsolutePath',

    // Memory Management
    'memoryCleanup', 'createMemoryMonitor',

    // Danger Detection
    'isDangerousProperty', 'isDangerousPath', 'isReservedWord', 'getPropertySafetyLevel',

    // Operation Control
    'createTimeoutChecker', 'createOperationCounter', 'createRateLimiter',

    // Environment Validation
    'validateInDesignEnvironment', 'validateDocumentState',

    // Debug System Functions - LEGACY COMPATIBILITY
    'debugLog', 'debugPerformance', 'isDebugEnabled',

    // Utilities
    'createStringBuilder', 'getCurrentTimestamp', 'generateUniqueID',
    'createErrorResult', 'createSuccessResult', 'retryOperation', 'updateStatus'
]);

// Initialize logging system immediately upon module load
initializeLoggingConfig();

// =============================================================================
// END OF 1.2_safety-utilities.jsx - COMPLETE WITH BOOLEAN-ONLY LOGGING
// =============================================================================