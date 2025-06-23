// =============================================================================
// 1.2_safety-utilities.jsx - ES3 HELPER FUNCTIONS AND SAFETY UTILITIES
// InDesign DOM Discovery Builder v3.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: ES3-compatible helper functions and safety utilities with unified logging
// DEPENDENCIES: ["1.1_bootstrap-foundation.jsx"]
// SIZE: ~2030 lines - COMPLETE IMPLEMENTATION WITH SIMPLIFIED LOGGING SYSTEM
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
// SIMPLIFIED LOGGING CONFIGURATION SYSTEM - BOOLEAN ONLY
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
 * Initialize unified logging configuration - SIMPLIFIED
 * @param {Object} customConfig - Custom logging configuration
 */
function initializeLoggingConfig(customConfig) {
    try {
        if (customConfig) {
            g_loggingConfig = objectDeepMerge(DEFAULT_LOGGING_CONFIG, customConfig);
        } else {
            g_loggingConfig = objectClone(DEFAULT_LOGGING_CONFIG, 3);
        }
        
        // Validate configuration
        if (!g_loggingConfig.levels || !g_loggingConfig.categories) {
            throw new Error('Invalid logging configuration structure');
        }
        
    } catch (exc) {
        // Fallback to safe defaults
        g_loggingConfig = objectClone(DEFAULT_LOGGING_CONFIG, 3);
        $.writeln('[LOG INIT ERROR] Using default config: ' + exc.message);
    }
}

/**
 * Core logging function - SIMPLIFIED BOOLEAN LOGIC
 * @param {String} message - Message to log
 * @param {String} level - Log level (ERROR, WARN, INFO, DEBUG)
 * @param {String} category - Log category
 */
function logMessage(message, level, category) {
    try {
        var logLevel = level || 'INFO';
        var logCategory = category || 'general';
        
        // Initialize config if needed
        if (!g_loggingConfig) {
            initializeLoggingConfig();
        }
        
        // Simple boolean checks - no complex math
        if (!g_loggingConfig.enabled) return;
        if (!g_loggingConfig.levels[logLevel]) return;
        if (!g_loggingConfig.categories[logCategory]) return;
        
        var prefix = '[' + logLevel;
        if (logCategory !== 'general') {
            prefix += ' ' + logCategory.toUpperCase();
        }
        prefix += '] ';
        
        $.writeln(prefix + message);
        
    } catch (exc) {
        // Fallback - always show if logging system fails
        $.writeln('[LOG FALLBACK] ' + message);
    }
}

/**
 * Log info message
 * @param {String} message - Message to log
 * @param {String} category - Log category
 */
function logInfo(message, category) {
    logMessage(message, 'INFO', category);
}

/**
 * Log debug message
 * @param {String} message - Message to log
 * @param {String} category - Log category
 */
function logDebug(message, category) {
    logMessage(message, 'DEBUG', category);
}

/**
 * Log warning message
 * @param {String} message - Message to log
 * @param {String} category - Log category
 */
function logWarn(message, category) {
    logMessage(message, 'WARN', category);
}

/**
 * Log error message
 * @param {String} message - Message to log
 * @param {String} category - Log category
 */
function logError(message, category) {
    logMessage(message, 'ERROR', category);
}

/**
 * Check if debug logging is enabled for category - SIMPLIFIED
 * @param {String} category - Category to check (optional)
 * @returns {Boolean} True if debug enabled
 */
function isDebugEnabled(category) {
    try {
        // Initialize config if needed
        if (!g_loggingConfig) {
            initializeLoggingConfig();
        }
        
        var logCategory = category || 'general';
        
        return g_loggingConfig.enabled && 
               g_loggingConfig.levels.DEBUG && 
               g_loggingConfig.categories[logCategory];
               
    } catch (exc) {
        return false;
    }
}

/**
 * Legacy debug log wrapper - MAINTAINED FOR COMPATIBILITY
 * @param {String} message - Message to log
 * @param {String} category - Log category
 */
function debugLog(message, category) {
    logDebug(message, category);
}

/**
 * Debug performance timing
 * @param {String} operation - Operation description
 * @param {Number} startTime - Start time
 * @param {String} category - Log category
 */
function debugPerformance(operation, startTime, category) {
    if (isDebugEnabled(category || 'performance')) {
        var elapsed = new Date().getTime() - startTime;
        logDebug(operation + ' completed in ' + elapsed + 'ms', category || 'performance');
    }
}

// =============================================================================
// ARRAY HELPERS - ES3 COMPATIBLE
// =============================================================================

/**
 * Find index of element in array
 * @param {Array} arr - Array to search
 * @param {*} element - Element to find
 * @returns {Number} Index or -1 if not found
 */
function arrayIndexOf(arr, element) {
    try {
        if (!arr || typeof arr.length !== 'number') return -1;
        
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === element) {
                return i;
            }
        }
        return -1;
    } catch (exc) {
        return -1;
    }
}

/**
 * Extract slice of array
 * @param {Array} arr - Source array
 * @param {Number} start - Start index
 * @param {Number} end - End index (optional)
 * @returns {Array} New array slice
 */
function arraySlice(arr, start, end) {
    try {
        if (!arr || typeof arr.length !== 'number') return [];
        
        var result = [];
        var startIdx = start || 0;
        var endIdx = (typeof end === 'number') ? end : arr.length;
        
        for (var i = startIdx; i < endIdx && i < arr.length; i++) {
            result.push(arr[i]);
        }
        
        return result;
    } catch (exc) {
        return [];
    }
}

/**
 * Join array elements into string
 * @param {Array} arr - Array to join
 * @param {String} separator - Join separator
 * @returns {String} Joined string
 */
function arrayJoin(arr, separator) {
    try {
        if (!arr || typeof arr.length !== 'number') return '';
        
        var sep = separator || ',';
        var result = '';
        
        for (var i = 0; i < arr.length; i++) {
            if (i > 0) result += sep;
            result += safeToString(arr[i]);
        }
        
        return result;
    } catch (exc) {
        return '';
    }
}

/**
 * Add element to end of array
 * @param {Array} arr - Target array
 * @param {*} element - Element to add
 * @returns {Number} New length
 */
function arrayPush(arr, element) {
    try {
        if (!arr || typeof arr.length !== 'number') return 0;
        
        arr[arr.length] = element;
        return arr.length;
    } catch (exc) {
        return 0;
    }
}

/**
 * Remove last element from array
 * @param {Array} arr - Target array
 * @returns {*} Removed element
 */
function arrayPop(arr) {
    try {
        if (!arr || typeof arr.length !== 'number' || arr.length === 0) return undefined;
        
        var element = arr[arr.length - 1];
        arr.length = arr.length - 1;
        return element;
    } catch (exc) {
        return undefined;
    }
}

/**
 * Concatenate arrays
 * @param {Array} arr1 - First array
 * @param {Array} arr2 - Second array
 * @returns {Array} Combined array
 */
function arrayConcat(arr1, arr2) {
    try {
        var result = [];
        
        if (arr1 && typeof arr1.length === 'number') {
            for (var i = 0; i < arr1.length; i++) {
                result.push(arr1[i]);
            }
        }
        
        if (arr2 && typeof arr2.length === 'number') {
            for (var j = 0; j < arr2.length; j++) {
                result.push(arr2[j]);
            }
        }
        
        return result;
    } catch (exc) {
        return [];
    }
}

// =============================================================================
// STRING HELPERS - ES3 COMPATIBLE
// =============================================================================

/**
 * Find substring in string
 * @param {String} str - String to search
 * @param {String} searchStr - Substring to find
 * @returns {Number} Index or -1 if not found
 */
function stringIndexOf(str, searchStr) {
    try {
        if (typeof str !== 'string' || typeof searchStr !== 'string') return -1;
        
        if (str.indexOf) {
            return str.indexOf(searchStr);
        }
        
        // Fallback implementation
        for (var i = 0; i <= str.length - searchStr.length; i++) {
            var match = true;
            for (var j = 0; j < searchStr.length; j++) {
                if (str.charAt(i + j) !== searchStr.charAt(j)) {
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
 * Extract substring
 * @param {String} str - Source string
 * @param {Number} start - Start index
 * @param {Number} end - End index (optional)
 * @returns {String} Substring
 */
function stringSubstring(str, start, end) {
    try {
        if (typeof str !== 'string') return '';
        
        if (str.substring) {
            return str.substring(start, end);
        }
        
        // Fallback implementation
        var startIdx = Math.max(0, start || 0);
        var endIdx = (typeof end === 'number') ? Math.min(end, str.length) : str.length;
        
        var result = '';
        for (var i = startIdx; i < endIdx; i++) {
            result += str.charAt(i);
        }
        
        return result;
    } catch (exc) {
        return '';
    }
}

/**
 * Get character at index
 * @param {String} str - Source string
 * @param {Number} index - Character index
 * @returns {String} Character
 */
function stringCharAt(str, index) {
    try {
        if (typeof str !== 'string') return '';
        
        if (str.charAt) {
            return str.charAt(index);
        }
        
        return str[index] || '';
    } catch (exc) {
        return '';
    }
}

/**
 * Split string into array
 * @param {String} str - String to split
 * @param {String} separator - Split separator
 * @returns {Array} String array
 */
function stringSplit(str, separator) {
    try {
        if (typeof str !== 'string') return [];
        
        if (str.split) {
            return str.split(separator);
        }
        
        // Simple fallback implementation
        var result = [];
        var current = '';
        
        for (var i = 0; i < str.length; i++) {
            if (str.charAt(i) === separator) {
                result.push(current);
                current = '';
            } else {
                current += str.charAt(i);
            }
        }
        
        result.push(current);
        return result;
    } catch (exc) {
        return [];
    }
}

/**
 * Convert string to lowercase
 * @param {String} str - String to convert
 * @returns {String} Lowercase string
 */
function stringToLowerCase(str) {
    try {
        if (typeof str !== 'string') return '';
        
        if (str.toLowerCase) {
            return str.toLowerCase();
        }
        
        // Basic fallback
        var result = '';
        for (var i = 0; i < str.length; i++) {
            var char = str.charAt(i);
            var code = str.charCodeAt(i);
            if (code >= 65 && code <= 90) {
                result += String.fromCharCode(code + 32);
            } else {
                result += char;
            }
        }
        
        return result;
    } catch (exc) {
        return '';
    }
}

/**
 * Convert string to uppercase
 * @param {String} str - String to convert
 * @returns {String} Uppercase string
 */
function stringToUpperCase(str) {
    try {
        if (typeof str !== 'string') return '';
        
        if (str.toUpperCase) {
            return str.toUpperCase();
        }
        
        // Basic fallback
        var result = '';
        for (var i = 0; i < str.length; i++) {
            var char = str.charAt(i);
            var code = str.charCodeAt(i);
            if (code >= 97 && code <= 122) {
                result += String.fromCharCode(code - 32);
            } else {
                result += char;
            }
        }
        
        return result;
    } catch (exc) {
        return '';
    }
}

/**
 * Replace substring in string
 * @param {String} str - Source string
 * @param {String} searchStr - String to replace
 * @param {String} replaceStr - Replacement string
 * @returns {String} Modified string
 */
function stringReplace(str, searchStr, replaceStr) {
    try {
        if (typeof str !== 'string') return '';
        
        if (str.replace) {
            return str.replace(searchStr, replaceStr);
        }
        
        // Simple fallback - replace first occurrence
        var index = stringIndexOf(str, searchStr);
        if (index === -1) return str;
        
        return stringSubstring(str, 0, index) + replaceStr + 
               stringSubstring(str, index + searchStr.length);
    } catch (exc) {
        return str;
    }
}

/**
 * Test string against pattern
 * @param {String} str - String to test
 * @param {RegExp|String} pattern - Pattern to match
 * @returns {Array|null} Match results
 */
function stringMatch(str, pattern) {
    try {
        if (typeof str !== 'string') return null;
        
        if (str.match) {
            return str.match(pattern);
        }
        
        return null;
    } catch (exc) {
        return null;
    }
}

// =============================================================================
// OBJECT HELPERS - ES3 COMPATIBLE
// =============================================================================

/**
 * Check if object has own property
 * @param {Object} obj - Object to check
 * @param {String} prop - Property name
 * @returns {Boolean} True if has property
 */
function objectHasOwnProperty(obj, prop) {
    try {
        if (!obj || typeof prop !== 'string') return false;
        
        if (obj.hasOwnProperty) {
            return obj.hasOwnProperty(prop);
        }
        
        // Fallback check
        return typeof obj[prop] !== 'undefined';
    } catch (exc) {
        return false;
    }
}

/**
 * Count object properties
 * @param {Object} obj - Object to count
 * @returns {Number} Property count
 */
function countObjectKeys(obj) {
    try {
        if (!obj || typeof obj !== 'object') return 0;
        
        var count = 0;
        for (var prop in obj) {
            if (objectHasOwnProperty(obj, prop)) {
                count++;
            }
        }
        
        return count;
    } catch (exc) {
        return 0;
    }
}

/**
 * Get object property names
 * @param {Object} obj - Object to analyze
 * @returns {Array} Property names
 */
function getObjectKeys(obj) {
    try {
        if (!obj || typeof obj !== 'object') return [];
        
        var keys = [];
        for (var prop in obj) {
            if (objectHasOwnProperty(obj, prop)) {
                keys.push(prop);
            }
        }
        
        return keys;
    } catch (exc) {
        return [];
    }
}

/**
 * Clone object (shallow or deep)
 * @param {*} source - Source value
 * @param {Number} depth - Maximum depth for deep clone
 * @returns {*} Cloned value
 */
function objectClone(source, depth) {
    try {
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

/**
 * Merge objects (shallow)
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object
 */
function objectMerge(target, source) {
    try {
        if (!target || typeof target !== 'object') return source || {};
        if (!source || typeof source !== 'object') return target;
        
        var result = objectClone(target, 1);
        
        for (var prop in source) {
            if (objectHasOwnProperty(source, prop)) {
                result[prop] = source[prop];
            }
        }
        
        return result;
    } catch (exc) {
        return target || {};
    }
}

/**
 * Deep merge objects
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Deep merged object
 */
function objectDeepMerge(target, source) {
    try {
        if (!target || typeof target !== 'object') return objectClone(source, 3);
        if (!source || typeof source !== 'object') return objectClone(target, 3);
        
        var result = objectClone(target, 3);
        
        for (var prop in source) {
            if (objectHasOwnProperty(source, prop)) {
                if (typeof source[prop] === 'object' && source[prop] !== null &&
                    typeof result[prop] === 'object' && result[prop] !== null) {
                    result[prop] = objectDeepMerge(result[prop], source[prop]);
                } else {
                    result[prop] = objectClone(source[prop], 3);
                }
            }
        }
        
        return result;
    } catch (exc) {
        return target || {};
    }
}

// =============================================================================
// FUNCTION UTILITIES
// =============================================================================

/**
 * Check if function exists
 * @param {String} functionName - Function name
 * @returns {Boolean} True if function exists
 */
function functionExists(functionName) {
    try {
        if (typeof functionName !== 'string') return false;
        
        // Check in global scope using eval alternative
        try {
            return typeof this[functionName] === 'function';
        } catch (exc) {
            return false;
        }
    } catch (exc) {
        return false;
    }
}

/**
 * Safely call function
 * @param {Function} func - Function to call
 * @param {Array} args - Arguments array
 * @param {*} context - this context
 * @returns {Object} Result object
 */
function safeCall(func, args, context) {
    try {
        if (typeof func !== 'function') {
            return { success: false, error: 'Not a function' };
        }
        
        var result = func.apply(context || this, args || []);
        return { success: true, result: result };
    } catch (exc) {
        return { success: false, error: exc.message };
    }
}

// =============================================================================
// ES3 COMPATIBILITY FUNCTIONS
// =============================================================================

/**
 * Trim whitespace from string
 * @param {String} str - String to trim
 * @returns {String} Trimmed string
 */
function trimString(str) {
    try {
        if (typeof str !== 'string') return '';
        
        if (str.trim) {
            return str.trim();
        }
        
        // Fallback implementation
        var start = 0;
        var end = str.length - 1;
        
        while (start <= end && (str.charAt(start) === ' ' || str.charAt(start) === '\t' || 
               str.charAt(start) === '\n' || str.charAt(start) === '\r')) {
            start++;
        }
        
        while (end >= start && (str.charAt(end) === ' ' || str.charAt(end) === '\t' || 
               str.charAt(end) === '\n' || str.charAt(end) === '\r')) {
            end--;
        }
        
        return stringSubstring(str, start, end + 1);
    } catch (exc) {
        return '';
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
        if (typeof value === 'number') return value.toString();
        if (typeof value === 'boolean') return value.toString();
        
        if (typeof value === 'object') {
            return '[object]';
        }
        
        return value.toString();
    } catch (exc) {
        return '[toString error]';
    }
}

/**
 * Safe parseInt
 * @param {String} str - String to parse
 * @param {Number} radix - Number base
 * @returns {Number} Parsed number or NaN
 */
function safeParseInt(str, radix) {
    try {
        if (typeof str !== 'string') return NaN;
        
        return parseInt(str, radix || 10);
    } catch (exc) {
        return NaN;
    }
}

/**
 * Safe parseFloat
 * @param {String} str - String to parse
 * @returns {Number} Parsed number or NaN
 */
function safeParseFloat(str) {
    try {
        if (typeof str !== 'string') return NaN;
        
        return parseFloat(str);
    } catch (exc) {
        return NaN;
    }
}

// =============================================================================
// JSON HANDLING - ES3 COMPATIBLE
// =============================================================================

/**
 * Safe JSON stringify
 * @param {*} value - Value to stringify
 * @param {Number} depth - Maximum depth
 * @returns {String} JSON string
 */
function safeJSONStringify(value, depth) {
    try {
        var maxDepth = depth || 5;
        
        return fallbackStringify(value, 0, maxDepth);
    } catch (exc) {
        return '{"error":"stringify failed"}';
    }
}

/**
 * Fallback JSON stringify implementation
 * @param {*} value - Value to stringify
 * @param {Number} currentDepth - Current depth
 * @param {Number} maxDepth - Maximum depth
 * @returns {String} JSON string
 */
function fallbackStringify(value, currentDepth, maxDepth) {
    try {
        if (currentDepth >= maxDepth) {
            return '"[max depth]"';
        }

        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        
        var valueType = typeof value;
        
        if (valueType === 'string') {
            return '"' + stringReplace(stringReplace(value, '\\', '\\\\'), '"', '\\"') + '"';
        }
        
        if (valueType === 'number' || valueType === 'boolean') {
            return value.toString();
        }
        
        if (valueType === 'object') {
            if (value.length !== undefined && typeof value.length === 'number') {
                // Array
                var arrayParts = [];
                for (var i = 0; i < value.length; i++) {
                    arrayParts.push(fallbackStringify(value[i], currentDepth + 1, maxDepth));
                }
                return '[' + arrayJoin(arrayParts, ',') + ']';
            } else {
                // Object
                var objectParts = [];
                for (var prop in value) {
                    if (objectHasOwnProperty(value, prop)) {
                        var propValue = fallbackStringify(value[prop], currentDepth + 1, maxDepth);
                        objectParts.push('"' + prop + '":' + propValue);
                    }
                }
                return '{' + arrayJoin(objectParts, ',') + '}';
            }
        }
        
        return '"[unknown type]"';
    } catch (exc) {
        return '"[stringify error]"';
    }
}

/**
 * Safe JSON parse
 * @param {String} jsonString - JSON string
 * @returns {*} Parsed object or null
 */
function safeJSONParse(jsonString) {
    try {
        if (typeof jsonString !== 'string') return null;
        
        if (typeof JSON !== 'undefined' && JSON.parse) {
            return JSON.parse(jsonString);
        }
        
        // For ExtendScript, try eval as last resort (unsafe but sometimes necessary)
        if (stringIndexOf(jsonString, 'function') === -1 && 
            stringIndexOf(jsonString, 'eval') === -1) {
            return eval('(' + jsonString + ')');
        }
        
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
 * @returns {String} Safe type name
 */
function safeTypeCheck(value) {
    try {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        
        var baseType = typeof value;
        
        if (baseType === 'object' && value.length !== undefined && 
            typeof value.length === 'number') {
            return 'array';
        }
        
        return baseType;
    } catch (exc) {
        return 'unknown';
    }
}

/**
 * Safely check if object has property
 * @param {Object} obj - Object to check
 * @param {String} prop - Property name
 * @returns {Boolean} True if has property safely
 */
function safeHasProperty(obj, prop) {
    try {
        if (!obj || typeof prop !== 'string') return false;
        if (isDangerousProperty(prop)) return false;
        
        return objectHasOwnProperty(obj, prop);
    } catch (exc) {
        return false;
    }
}

/**
 * Safely get object length
 * @param {Object} obj - Object to check
 * @returns {Number} Length or 0
 */
function safeGetLength(obj) {
    try {
        if (!obj) return 0;
        
        if (typeof obj.length === 'number') {
            return obj.length;
        }
        
        return countObjectKeys(obj);
    } catch (exc) {
        return 0;
    }
}

/**
 * Safely get object from path
 * @param {Object} obj - Root object
 * @param {String} path - Property path
 * @returns {*} Value or null
 */
function safeGetObjectFromPath(obj, path) {
    try {
        if (!obj || typeof path !== 'string') return null;
        if (isDangerousPath(path)) return null;
        
        var parts = splitPath(path);
        var current = obj;
        
        for (var i = 0; i < parts.length; i++) {
            if (!current || !safeHasProperty(current, parts[i])) {
                return null;
            }
            current = current[parts[i]];
        }
        
        return current;
    } catch (exc) {
        return null;
    }
}

/**
 * Safely get property value
 * @param {Object} obj - Object to access
 * @param {String} prop - Property name
 * @returns {*} Property value or null
 */
function safeGetPropertyValue(obj, prop) {
    try {
        if (!obj || typeof prop !== 'string') return null;
        if (isDangerousProperty(prop)) return null;
        
        return obj[prop];
    } catch (exc) {
        return null;
    }
}

// =============================================================================
// OBJECT REFERENCE TRACKING
// =============================================================================

/**
 * Generate object reference ID
 * @param {Object} obj - Object to ID
 * @returns {String} Reference ID
 */
function generateObjectReferenceID(obj) {
    try {
        if (!obj || typeof obj !== 'object') return 'null';
        
        var type = safeTypeCheck(obj);
        var timestamp = new Date().getTime();
        var random = Math.floor(Math.random() * 10000);
        
        return type + '_' + timestamp + '_' + random;
    } catch (exc) {
        return 'error_' + new Date().getTime();
    }
}

/**
 * Check if objects are the same reference
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
 * @returns {Object} Reference tracker
 */
function createObjectReferenceTracker() {
    try {
        var tracked = [];
        var nextId = 1;
        
        return {
            track: function (obj) {
                try {
                    if (!obj || typeof obj !== 'object') return null;
                    
                    // Check if already tracked
                    for (var i = 0; i < tracked.length; i++) {
                        if (isSameObjectReference(tracked[i].object, obj)) {
                            return tracked[i].id;
                        }
                    }
                    
                    // Add new tracking
                    var id = 'ref_' + nextId++;
                    tracked.push({ object: obj, id: id });
                    return id;
                } catch (exc) {
                    return null;
                }
            },
            
            isTracked: function (obj) {
                try {
                    for (var i = 0; i < tracked.length; i++) {
                        if (isSameObjectReference(tracked[i].object, obj)) {
                            return true;
                        }
                    }
                    return false;
                } catch (exc) {
                    return false;
                }
            },
            
            clear: function () {
                tracked = [];
                nextId = 1;
            }
        };
    } catch (exc) {
        return {
            track: function () { return null; },
            isTracked: function () { return false; },
            clear: function () { }
        };
    }
}

// =============================================================================
// PATH UTILITIES
// =============================================================================

/**
 * Split path into components
 * @param {String} path - Path string
 * @returns {Array} Path components
 */
function splitPath(path) {
    try {
        if (typeof path !== 'string') return [];
        
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
        if (!components || typeof components.length !== 'number') return '';
        
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
        if (typeof path !== 'string') return '';
        
        var components = splitPath(path);
        if (components.length <= 1) return '';
        
        return joinPath(arraySlice(components, 0, components.length - 1));
    } catch (exc) {
        return '';
    }
}

/**
 * Normalize path
 * @param {String} path - Path to normalize
 * @returns {String} Normalized path
 */
function normalizePath(path) {
    try {
        if (typeof path !== 'string') return '';
        
        var components = splitPath(path);
        var normalized = [];
        
        for (var i = 0; i < components.length; i++) {
            var component = trimString(components[i]);
            if (component && component !== '.') {
                normalized.push(component);
            }
        }
        
        return joinPath(normalized);
    } catch (exc) {
        return path;
    }
}

/**
 * Check if path is absolute
 * @param {String} path - Path to check
 * @returns {Boolean} True if absolute
 */
function isAbsolutePath(path) {
    try {
        if (typeof path !== 'string') return false;
        
        return stringIndexOf(path, 'app.') === 0 || stringIndexOf(path, 'document.') === 0;
    } catch (exc) {
        return false;
    }
}

/**
 * Make path absolute
 * @param {String} path - Relative path
 * @param {String} base - Base path
 * @returns {String} Absolute path
 */
function makeAbsolutePath(path, base) {
    try {
        if (typeof path !== 'string') return '';
        if (isAbsolutePath(path)) return path;
        
        var basePath = base || 'document';
        return basePath + '.' + path;
    } catch (exc) {
        return path;
    }
}

// =============================================================================
// MEMORY MANAGEMENT
// =============================================================================

/**
 * Memory cleanup
 */
function memoryCleanup() {
    try {
        if (typeof app !== 'undefined' && app.doScript) {
            // Force garbage collection in InDesign
            app.doScript('', ScriptLanguage.javascript);
        }
    } catch (exc) {
        // Ignore cleanup errors
    }
}

/**
 * Create memory monitor
 * @returns {Object} Memory monitor
 */
function createMemoryMonitor() {
    try {
        var startTime = new Date().getTime();
        
        return {
            check: function () {
                try {
                    var elapsed = new Date().getTime() - startTime;
                    return elapsed < SAFETY_CONFIG.maxTimeout;
                } catch (exc) {
                    return false;
                }
            },
            
            cleanup: function () {
                try {
                    memoryCleanup();
                } catch (exc) {
                    // Ignore cleanup errors
                }
            }
        };
    } catch (exc) {
        return {
            check: function () { return true; },
            cleanup: function () { }
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
            'finally', 'for', 'function', 'if', 'in', 'instanceof', 'new', 'return',
            'switch', 'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with',
            'abstract', 'boolean', 'byte', 'char', 'class', 'const', 'debugger',
            'double', 'enum', 'exportData', 'extends', 'final', 'float', 'goto',
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
        var count = 0;
        var limit = maxOperations || 1000;

        return {
            increment: function () {
                count++;
                return count;
            },

            check: function () {
                return count < limit;
            },

            reset: function () {
                count = 0;
            },

            getCount: function () {
                return count;
            }
        };

    } catch (exc) {
        return {
            increment: function () { return 0; },
            check: function () { return false; },
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
        var operations = [];
        var maxRate = maxPerSecond || 100;

        return {
            check: function () {
                try {
                    var now = new Date().getTime();
                    var oneSecondAgo = now - 1000;

                    // Remove old operations
                    var filtered = [];
                    for (var i = 0; i < operations.length; i++) {
                        if (operations[i] > oneSecondAgo) {
                            filtered.push(operations[i]);
                        }
                    }
                    operations = filtered;

                    return operations.length < maxRate;
                } catch (exc) {
                    return false;
                }
            },

            increment: function () {
                try {
                    operations.push(new Date().getTime());
                } catch (exc) {
                    // Ignore errors
                }
            },

            forceCleanup: function () {
                operations = [];
            },

            getStats: function () {
                try {
                    return {
                        current: operations.length,
                        limit: maxRate,
                        available: Math.max(0, maxRate - operations.length)
                    };
                } catch (exc) {
                    return { current: 0, limit: maxRate, available: maxRate };
                }
            }
        };

    } catch (exc) {
        return {
            check: function () { return false; },
            increment: function () { },
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
            version: null,
            document: null,
            error: null
        };

        // Check if InDesign is available
        if (typeof app === 'undefined') {
            result.error = 'InDesign application not available';
            return result;
        }

        // Check version
        try {
            result.version = app.version;
        } catch (exc) {
            result.error = 'Cannot access InDesign version';
            return result;
        }

        // Check for active document
        try {
            if (app.documents.length === 0) {
                result.error = 'No active document';
                return result;
            }
            result.document = app.activeDocument;
        } catch (exc) {
            result.error = 'Cannot access active document';
            return result;
        }

        result.valid = true;
        return result;

    } catch (exc) {
        return {
            valid: false,
            version: null,
            document: null,
            error: 'Environment validation failed: ' + exc.message
        };
    }
}

/**
 * Validate document state
 * @param {Document} doc - Document to validate
 * @returns {Object} Validation result
 */
function validateDocumentState(doc) {
    try {
        var result = {
            valid: false,
            document: doc,
            error: null,
            stats: {}
        };

        if (!doc) {
            result.error = 'No document provided';
            return result;
        }

        // Check document properties
        try {
            result.stats.pages = doc.pages.length;
            result.stats.textFrames = doc.textFrames.length;
            result.stats.rectangles = doc.rectangles.length;
        } catch (exc) {
            result.error = 'Cannot access document properties';
            return result;
        }

        result.valid = true;
        return result;

    } catch (exc) {
        return {
            valid: false,
            document: null,
            error: 'Document validation failed: ' + exc.message,
            stats: {}
        };
    }
}

// =============================================================================
// UTILITIES
// =============================================================================

/**
 * Create string builder
 * @returns {Object} String builder
 */
function createStringBuilder() {
    try {
        var parts = [];

        return {
            append: function (str) {
                try {
                    parts.push(safeToString(str));
                } catch (exc) {
                    parts.push('[append error]');
                }
            },

            toString: function () {
                try {
                    return arrayJoin(parts, '');
                } catch (exc) {
                    return '[builder error]';
                }
            },

            clear: function () {
                parts = [];
            },

            length: function () {
                return parts.length;
            }
        };

    } catch (exc) {
        return {
            append: function () { },
            toString: function () { return ''; },
            clear: function () { },
            length: function () { return 0; }
        };
    }
}

/**
 * Get current timestamp
 * @returns {String} Timestamp string
 */
function getCurrentTimestamp() {
    try {
        var now = new Date();
        return now.getFullYear() + '-' +
               (now.getMonth() + 1) + '-' +
               now.getDate() + ' ' +
               now.getHours() + ':' +
               now.getMinutes() + ':' +
               now.getSeconds();
    } catch (exc) {
        return 'timestamp-error';
    }
}

/**
 * Generate unique ID
 * @returns {String} Unique ID
 */
function generateUniqueID() {
    try {
        var timestamp = new Date().getTime();
        var random = Math.floor(Math.random() * 10000);
        return 'id_' + timestamp + '_' + random;
    } catch (exc) {
        return 'id_error_' + Math.floor(Math.random() * 1000);
    }
}

/**
 * Create error result object
 * @param {String} message - Error message
 * @param {String} code - Error code
 * @returns {Object} Error result
 */
function createErrorResult(message, code) {
    return {
        success: false,
        error: message || 'Unknown error',
        code: code || 'UNKNOWN',
        timestamp: getCurrentTimestamp()
    };
}

/**
 * Create success result object
 * @param {*} data - Result data
 * @param {String} message - Success message
 * @returns {Object} Success result
 */
function createSuccessResult(data, message) {
    return {
        success: true,
        data: data,
        message: message || 'Operation completed',
        timestamp: getCurrentTimestamp()
    };
}

/**
 * Retry operation with exponential backoff
 * @param {Function} operation - Operation to retry
 * @param {Number} maxRetries - Maximum retries
 * @param {Number} delay - Initial delay
 * @returns {*} Operation result
 */
function retryOperation(operation, maxRetries, delay) {
    try {
        var retries = maxRetries || 3;
        var currentDelay = delay || 100;

        for (var i = 0; i < retries; i++) {
            try {
                return operation();
            } catch (exc) {
                if (i === retries - 1) {
                    throw exc;
                }

                // Simple delay simulation
                var start = new Date().getTime();
                while (new Date().getTime() - start < currentDelay) {
                    // Wait
                }

                currentDelay *= 2;
            }
        }

    } catch (exc) {
        return createErrorResult('Retry operation failed: ' + exc.message);
    }
}

/**
 * Update status (placeholder for UI integration)
 * @param {String} message - Status message
 */
function updateStatus(message) {
    try {
        logInfo('Status: ' + message, 'general');
    } catch (exc) {
        // Fallback to direct output
        $.writeln('[STATUS] ' + message);
    }
}

// =============================================================================
// MODULE INITIALIZATION
// =============================================================================

// Initialize logging system on module load
try {
    initializeLoggingConfig();
    logInfo('Safety utilities module loaded successfully', 'general');
} catch (exc) {
    $.writeln('[INIT ERROR] Safety utilities initialization failed: ' + exc.message);
}

// =============================================================================
// MODULE REGISTRATION - COMPLETE FUNCTION LIST
// =============================================================================

// Register this module with all its functions
registerModule('1.2_safety-utilities', '3.1', [
    // Unified Logging System - SIMPLIFIED
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

// =============================================================================
// END OF 1.2_safety-utilities.jsx - COMPLETE WITH SIMPLIFIED LOGGING SYSTEM
// =============================================================================