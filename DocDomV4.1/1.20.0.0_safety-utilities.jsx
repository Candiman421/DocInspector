// DocDomV4.1/1.2.0.0_safety-utilities.jsx
// 1.2.0.0_safety-utilities.jsx - ES3 HELPER FUNCTIONS AND SAFETY UTILITIES
// DocDom Discovery Builder v4.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: ES3-compatible helper functions, safety utilities, consolidated UI helpers
// DEPENDENCIES: ["1.1.0.0_bootstrap-foundation.jsx", "1.15.1.2025.20.4_indesign-adapter.jsx"]
// SIZE: ~2200 lines - COMPLETE IMPLEMENTATION - ENHANCED LOGGING - ES3 COMPLIANT
// CHANGES FROM 3.1: Removed logging functions (moved to 1.1), added strategic logging, app-agnostic, v4.1 updates
// =============================================================================

// =============================================================================
// DEPENDENCY VALIDATION
// =============================================================================

var SAFETY_UTILITIES_DEPENDENCIES = ['1.1.0.0_bootstrap-foundation', '1.15.1.2025.20.4_indesign-adapter'];
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

// NOTE: Logging system removed - now provided by 1.1.0.0_bootstrap-foundation.jsx

// =============================================================================
// ES3 ARRAY HELPERS - ENHANCED LOGGING
// =============================================================================

/**
 * ES3-compatible array indexOf - MINIMAL LOGGING
 * @param {Array} targetArray - Array to search
 * @param {*} searchValue - Value to find
 * @param {Number} fromIndex - Start index (optional)
 * @returns {Number} Index of value or -1
 */
function arrayIndexOf(targetArray, searchValue, fromIndex) {
    try {
        if (!targetArray || typeof targetArray.length === 'undefined') {
            logDebug('arrayIndexOf called with invalid array', 'general');
            return -1;
        }
        
        var startIndex = fromIndex || 0;
        if (startIndex < 0) {
            startIndex = 0;
        }
        
        for (var i = startIndex; i < targetArray.length; i++) {
            if (targetArray[i] === searchValue) {
                return i;
            }
        }
        
        return -1;
        
    } catch (exc) {
        logError('arrayIndexOf error: ' + exc.message, 'general');
        return -1;
    }
}

/**
 * ES3-compatible array slice - MINIMAL LOGGING
 * @param {Array} targetArray - Array to slice
 * @param {Number} start - Start index
 * @param {Number} end - End index (optional)
 * @returns {Array} Sliced array
 */
function arraySlice(targetArray, start, end) {
    try {
        if (!targetArray || typeof targetArray.length === 'undefined') {
            logDebug('arraySlice called with invalid array', 'general');
            return [];
        }
        
        var result = [];
        var startIndex = start || 0;
        var endIndex = (typeof end !== 'undefined') ? end : targetArray.length;
        
        if (startIndex < 0) {
            startIndex = Math.max(0, targetArray.length + startIndex);
        }
        if (endIndex < 0) {
            endIndex = Math.max(0, targetArray.length + endIndex);
        }
        
        for (var i = startIndex; i < endIndex && i < targetArray.length; i++) {
            result[result.length] = targetArray[i];
        }
        
        return result;
        
    } catch (exc) {
        logError('arraySlice error: ' + exc.message, 'general');
        return [];
    }
}

/**
 * ES3-compatible array join - MINIMAL LOGGING
 * @param {Array} targetArray - Array to join
 * @param {String} separator - Separator string
 * @returns {String} Joined string
 */
function arrayJoin(targetArray, separator) {
    try {
        if (!targetArray || typeof targetArray.length === 'undefined') {
            return '';
        }
        
        var sep = (typeof separator !== 'undefined') ? separator : ',';
        var result = '';
        
        for (var i = 0; i < targetArray.length; i++) {
            if (i > 0) {
                result += sep;
            }
            result += targetArray[i];
        }
        
        return result;
        
    } catch (exc) {
        logError('arrayJoin error: ' + exc.message, 'general');
        return '';
    }
}

/**
 * ES3-compatible array push - MINIMAL LOGGING
 * @param {Array} targetArray - Array to modify
 * @param {*} value - Value to add
 * @returns {Number} New array length
 */
function arrayPush(targetArray, value) {
    try {
        if (!targetArray || typeof targetArray.length === 'undefined') {
            logDebug('arrayPush called with invalid array', 'general');
            return 0;
        }
        
        targetArray[targetArray.length] = value;
        return targetArray.length;
        
    } catch (exc) {
        logError('arrayPush error: ' + exc.message, 'general');
        return 0;
    }
}

/**
 * ES3-compatible array pop - MINIMAL LOGGING
 * @param {Array} targetArray - Array to modify
 * @returns {*} Popped value
 */
function arrayPop(targetArray) {
    try {
        if (!targetArray || typeof targetArray.length === 'undefined' || targetArray.length === 0) {
            return undefined;
        }
        
        var value = targetArray[targetArray.length - 1];
        targetArray.length = targetArray.length - 1;
        return value;
        
    } catch (exc) {
        logError('arrayPop error: ' + exc.message, 'general');
        return undefined;
    }
}

/**
 * ES3-compatible array concat - ENHANCED LOGGING
 * @param {Array} array1 - First array
 * @param {Array} array2 - Second array
 * @returns {Array} Concatenated array
 */
function arrayConcat(array1, array2) {
    logDebug('=== STARTING arrayConcat ===', 'general');
    
    try {
        var result = [];
        var totalElements = 0;
        
        // Copy first array
        if (array1 && typeof array1.length !== 'undefined') {
            for (var i = 0; i < array1.length; i++) {
                result[result.length] = array1[i];
                totalElements++;
            }
            logDebug('Copied ' + array1.length + ' elements from first array', 'general');
        }
        
        // Copy second array
        if (array2 && typeof array2.length !== 'undefined') {
            for (var j = 0; j < array2.length; j++) {
                result[result.length] = array2[j];
                totalElements++;
            }
            logDebug('Copied ' + array2.length + ' elements from second array', 'general');
        }
        
        logInfo('arrayConcat completed: ' + totalElements + ' total elements', 'general');
        return result;
        
    } catch (exc) {
        logError('arrayConcat error: ' + exc.message, 'general');
        return [];
    }
}

// =============================================================================
// ES3 STRING HELPERS - ENHANCED LOGGING
// =============================================================================

/**
 * ES3-compatible string indexOf - MINIMAL LOGGING
 * @param {String} targetString - String to search
 * @param {String} searchValue - Value to find
 * @param {Number} fromIndex - Start index (optional)
 * @returns {Number} Index of value or -1
 */
function stringIndexOf(targetString, searchValue, fromIndex) {
    try {
        if (typeof targetString !== 'string' || typeof searchValue !== 'string') {
            return -1;
        }
        
        var startIndex = fromIndex || 0;
        if (startIndex < 0) {
            startIndex = 0;
        }
        
        for (var i = startIndex; i <= targetString.length - searchValue.length; i++) {
            var match = true;
            for (var j = 0; j < searchValue.length; j++) {
                if (targetString.charAt(i + j) !== searchValue.charAt(j)) {
                    match = false;
                    break;
                }
            }
            if (match) {
                return i;
            }
        }
        
        return -1;
        
    } catch (exc) {
        logError('stringIndexOf error: ' + exc.message, 'general');
        return -1;
    }
}

/**
 * ES3-compatible string substring - MINIMAL LOGGING
 * @param {String} targetString - String to slice
 * @param {Number} start - Start index
 * @param {Number} end - End index (optional)
 * @returns {String} Substring
 */
function stringSubstring(targetString, start, end) {
    try {
        if (typeof targetString !== 'string') {
            return '';
        }
        
        var startIndex = start || 0;
        var endIndex = (typeof end !== 'undefined') ? end : targetString.length;
        
        if (startIndex < 0) {
            startIndex = 0;
        }
        if (endIndex < 0) {
            endIndex = 0;
        }
        if (startIndex > endIndex) {
            var temp = startIndex;
            startIndex = endIndex;
            endIndex = temp;
        }
        
        var result = '';
        for (var i = startIndex; i < endIndex && i < targetString.length; i++) {
            result += targetString.charAt(i);
        }
        
        return result;
        
    } catch (exc) {
        logError('stringSubstring error: ' + exc.message, 'general');
        return '';
    }
}

/**
 * ES3-compatible string charAt - MINIMAL LOGGING
 * @param {String} targetString - String to access
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
 * ES3-compatible string split - ENHANCED LOGGING
 * @param {String} targetString - String to split
 * @param {String} separator - Separator
 * @returns {Array} Split array
 */
function stringSplit(targetString, separator) {
    logDebug('=== STARTING stringSplit ===', 'general');
    
    try {
        if (typeof targetString !== 'string') {
            logWarn('stringSplit called with non-string input', 'general');
            return [];
        }
        
        if (typeof separator !== 'string') {
            logDebug('stringSplit with no separator, returning character array', 'general');
            var chars = [];
            for (var i = 0; i < targetString.length; i++) {
                chars[chars.length] = targetString.charAt(i);
            }
            return chars;
        }
        
        var result = [];
        var currentStart = 0;
        var sepIndex = stringIndexOf(targetString, separator, currentStart);
        
        while (sepIndex !== -1) {
            result[result.length] = stringSubstring(targetString, currentStart, sepIndex);
            currentStart = sepIndex + separator.length;
            sepIndex = stringIndexOf(targetString, separator, currentStart);
        }
        
        // Add the last part
        result[result.length] = stringSubstring(targetString, currentStart);
        
        logInfo('stringSplit completed: ' + result.length + ' parts created', 'general');
        return result;
        
    } catch (exc) {
        logError('stringSplit error: ' + exc.message, 'general');
        return [];
    }
}

/**
 * ES3-compatible string toLowerCase - MINIMAL LOGGING
 * @param {String} targetString - String to convert
 * @returns {String} Lowercase string
 */
function stringToLowerCase(targetString) {
    try {
        if (typeof targetString !== 'string') {
            return '';
        }
        
        var result = '';
        for (var i = 0; i < targetString.length; i++) {
            var char = targetString.charAt(i);
            var code = char.charCodeAt(0);
            if (code >= 65 && code <= 90) { // A-Z
                result += String.fromCharCode(code + 32);
            } else {
                result += char;
            }
        }
        
        return result;
        
    } catch (exc) {
        logError('stringToLowerCase error: ' + exc.message, 'general');
        return '';
    }
}

/**
 * ES3-compatible string toUpperCase - MINIMAL LOGGING
 * @param {String} targetString - String to convert
 * @returns {String} Uppercase string
 */
function stringToUpperCase(targetString) {
    try {
        if (typeof targetString !== 'string') {
            return '';
        }
        
        var result = '';
        for (var i = 0; i < targetString.length; i++) {
            var char = targetString.charAt(i);
            var code = char.charCodeAt(0);
            if (code >= 97 && code <= 122) { // a-z
                result += String.fromCharCode(code - 32);
            } else {
                result += char;
            }
        }
        
        return result;
        
    } catch (exc) {
        logError('stringToUpperCase error: ' + exc.message, 'general');
        return '';
    }
}

/**
 * ES3-compatible string replace - ENHANCED LOGGING
 * @param {String} targetString - String to modify
 * @param {String} searchValue - Value to find
 * @param {String} replaceValue - Replacement value
 * @returns {String} Modified string
 */
function stringReplace(targetString, searchValue, replaceValue) {
    logDebug('=== STARTING stringReplace ===', 'general');
    
    try {
        if (typeof targetString !== 'string' || typeof searchValue !== 'string') {
            logWarn('stringReplace called with invalid parameters', 'general');
            return targetString || '';
        }
        
        var replacementValue = (typeof replaceValue === 'string') ? replaceValue : '';
        var index = stringIndexOf(targetString, searchValue);
        
        if (index === -1) {
            logDebug('stringReplace: search value not found', 'general');
            return targetString;
        }
        
        var before = stringSubstring(targetString, 0, index);
        var after = stringSubstring(targetString, index + searchValue.length);
        var result = before + replacementValue + after;
        
        logInfo('stringReplace completed: replaced "' + searchValue + '" with "' + replacementValue + '"', 'general');
        return result;
        
    } catch (exc) {
        logError('stringReplace error: ' + exc.message, 'general');
        return targetString || '';
    }
}

/**
 * ES3-compatible string match - ENHANCED LOGGING
 * @param {String} targetString - String to search
 * @param {String} pattern - Pattern to match
 * @returns {Array} Match results or null
 */
function stringMatch(targetString, pattern) {
    logDebug('=== STARTING stringMatch ===', 'general');
    
    try {
        if (typeof targetString !== 'string' || typeof pattern !== 'string') {
            logWarn('stringMatch called with invalid parameters', 'general');
            return null;
        }
        
        var index = stringIndexOf(targetString, pattern);
        if (index === -1) {
            logDebug('stringMatch: pattern not found', 'general');
            return null;
        }
        
        var result = [pattern];
        result.index = index;
        result.input = targetString;
        
        logInfo('stringMatch completed: found pattern at index ' + index, 'general');
        return result;
        
    } catch (exc) {
        logError('stringMatch error: ' + exc.message, 'general');
        return null;
    }
}

// =============================================================================
// ES3 OBJECT HELPERS - ENHANCED LOGGING
// =============================================================================

/**
 * ES3-compatible object hasOwnProperty - MINIMAL LOGGING
 * @param {Object} targetObject - Object to check
 * @param {String} prop - Property name
 * @returns {Boolean} True if object has property
 */
function objectHasOwnProperty(targetObject, prop) {
    try {
        if (!targetObject || typeof prop !== 'string') {
            return false;
        }
        
        // Direct property check
        return (prop in targetObject) && (targetObject.constructor.prototype[prop] !== targetObject[prop]);
        
    } catch (exc) {
        logError('objectHasOwnProperty error: ' + exc.message, 'general');
        return false;
    }
}

/**
 * Count object keys - MINIMAL LOGGING
 * @param {Object} targetObject - Object to count
 * @returns {Number} Key count
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
        logError('countObjectKeys error: ' + exc.message, 'general');
        return 0;
    }
}

/**
 * Get object keys - ENHANCED LOGGING
 * @param {Object} targetObject - Object to analyze
 * @returns {Array} Array of keys
 */
function getObjectKeys(targetObject) {
    logDebug('=== STARTING getObjectKeys ===', 'general');
    
    try {
        if (!targetObject || typeof targetObject !== 'object') {
            logWarn('getObjectKeys called with non-object', 'general');
            return [];
        }
        
        var keys = [];
        for (var key in targetObject) {
            if (objectHasOwnProperty(targetObject, key)) {
                keys[keys.length] = key;
            }
        }
        
        logInfo('getObjectKeys completed: ' + keys.length + ' keys found', 'general');
        return keys;
        
    } catch (exc) {
        logError('getObjectKeys error: ' + exc.message, 'general');
        return [];
    }
}

/**
 * ES3-compatible object clone - ENHANCED LOGGING
 * @param {Object} originalObject - Object to clone
 * @param {Number} maxDepth - Maximum depth (optional)
 * @returns {Object} Cloned object
 */
function objectClone(originalObject, maxDepth) {
    logDebug('=== STARTING objectClone ===', 'general');
    
    try {
        if (!originalObject) {
            logDebug('objectClone: null or undefined input', 'general');
            return originalObject;
        }
        
        var depth = maxDepth || SAFETY_CONFIG.maxObjectDepth;
        logDebug('objectClone with max depth: ' + depth, 'general');
        
        return cloneObjectRecursive(originalObject, depth, 0);
        
    } catch (exc) {
        logError('objectClone error: ' + exc.message, 'general');
        return {};
    }
}

/**
 * Recursive clone helper - INTERNAL FUNCTION
 * @param {*} obj - Object to clone
 * @param {Number} maxDepth - Maximum depth
 * @param {Number} currentDepth - Current recursion depth
 * @returns {*} Cloned value
 */
function cloneObjectRecursive(obj, maxDepth, currentDepth) {
    try {
        if (currentDepth >= maxDepth) {
            logWarn('objectClone: max depth reached at level ' + currentDepth, 'general');
            return '[Max Depth Reached]';
        }
        
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        if (typeof obj.length !== 'undefined') {
            // Array-like object
            var arrayClone = [];
            for (var i = 0; i < obj.length; i++) {
                arrayClone[i] = cloneObjectRecursive(obj[i], maxDepth, currentDepth + 1);
            }
            return arrayClone;
        } else {
            // Regular object
            var objectClone = {};
            for (var key in obj) {
                if (objectHasOwnProperty(obj, key)) {
                    objectClone[key] = cloneObjectRecursive(obj[key], maxDepth, currentDepth + 1);
                }
            }
            return objectClone;
        }
        
    } catch (exc) {
        logError('cloneObjectRecursive error at depth ' + currentDepth + ': ' + exc.message, 'general');
        return '[Clone Error]';
    }
}

/**
 * ES3-compatible object merge - ENHANCED LOGGING
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object
 */
function objectMerge(target, source) {
    logDebug('=== STARTING objectMerge ===', 'general');
    
    try {
        var result = target || {};
        
        if (!source || typeof source !== 'object') {
            logDebug('objectMerge: no valid source object', 'general');
            return result;
        }
        
        var mergedCount = 0;
        for (var prop in source) {
            if (objectHasOwnProperty(source, prop)) {
                result[prop] = source[prop];
                mergedCount++;
            }
        }
        
        logInfo('objectMerge completed: ' + mergedCount + ' properties merged', 'general');
        return result;
        
    } catch (exc) {
        logError('objectMerge error: ' + exc.message, 'general');
        return target || {};
    }
}

/**
 * ES3-compatible deep object merge - ENHANCED LOGGING
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Deep merged object
 */
function objectDeepMerge(target, source) {
    logDebug('=== STARTING objectDeepMerge ===', 'general');
    
    try {
        var result = objectClone(target) || {};
        
        if (!source || typeof source !== 'object') {
            logDebug('objectDeepMerge: no valid source object', 'general');
            return result;
        }
        
        var mergedCount = 0;
        for (var prop in source) {
            if (objectHasOwnProperty(source, prop)) {
                if (typeof source[prop] === 'object' && source[prop] !== null &&
                    typeof result[prop] === 'object' && result[prop] !== null) {
                    result[prop] = objectDeepMerge(result[prop], source[prop]);
                } else {
                    result[prop] = source[prop];
                }
                mergedCount++;
            }
        }
        
        logInfo('objectDeepMerge completed: ' + mergedCount + ' properties deep merged', 'general');
        return result;
        
    } catch (exc) {
        logError('objectDeepMerge error: ' + exc.message, 'general');
        return target || {};
    }
}

// =============================================================================
// FUNCTION UTILITIES - ENHANCED LOGGING
// =============================================================================

/**
 * Check if function exists - ENHANCED LOGGING
 * @param {String} functionName - Function name to check
 * @returns {Boolean} True if function exists
 */
function functionExists(functionName) {
    logDebug('Checking function existence: ' + functionName, 'general');
    
    try {
        if (typeof functionName !== 'string') {
            logWarn('functionExists called with non-string parameter', 'general');
            return false;
        }
        
        // Check global scope
        var exists = (typeof this[functionName] === 'function');
        
        if (!exists) {
            logDebug('Function not found: ' + functionName, 'general');
        }
        
        return exists;
        
    } catch (exc) {
        logError('functionExists error for ' + functionName + ': ' + exc.message, 'general');
        return false;
    }
}

/**
 * Safe function call - ENHANCED LOGGING
 * @param {Function} func - Function to call
 * @param {Array} args - Arguments array
 * @returns {*} Function result or error object
 */
function safeCall(func, args) {
    logDebug('=== STARTING safeCall ===', 'general');
    
    try {
        if (typeof func !== 'function') {
            logWarn('safeCall: parameter is not a function', 'general');
            return { error: 'Not a function' };
        }
        
        var arguments = args || [];
        var result = func.apply(null, arguments);
        
        logInfo('safeCall completed successfully', 'general');
        return result;
        
    } catch (exc) {
        logError('safeCall error: ' + exc.message, 'general');
        return { error: exc.message };
    }
}

// =============================================================================
// ES3 COMPATIBILITY HELPERS - ENHANCED LOGGING
// =============================================================================

/**
 * Trim string (ES3 compatible) - MINIMAL LOGGING
 * @param {String} str - String to trim
 * @returns {String} Trimmed string
 */
function trimString(str) {
    try {
        if (typeof str !== 'string') {
            return '';
        }
        
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
        logError('trimString error: ' + exc.message, 'general');
        return '';
    }
}

/**
 * Safe toString - MINIMAL LOGGING
 * @param {*} value - Value to convert
 * @returns {String} String representation
 */
function safeToString(value) {
    try {
        if (value === null) {
            return 'null';
        }
        if (value === undefined) {
            return 'undefined';
        }
        if (typeof value === 'string') {
            return value;
        }
        
        return value.toString();
        
    } catch (exc) {
        return '[toString Error]';
    }
}

/**
 * Safe parseInt - MINIMAL LOGGING
 * @param {String} str - String to parse
 * @param {Number} radix - Radix (optional)
 * @returns {Number} Parsed number or NaN
 */
function safeParseInt(str, radix) {
    try {
        var string = safeToString(str);
        var base = radix || 10;
        
        if (base < 2 || base > 36) {
            base = 10;
        }
        
        return parseInt(string, base);
        
    } catch (exc) {
        logError('safeParseInt error: ' + exc.message, 'general');
        return NaN;
    }
}

/**
 * Safe parseFloat - MINIMAL LOGGING
 * @param {String} str - String to parse
 * @returns {Number} Parsed number or NaN
 */
function safeParseFloat(str) {
    try {
        var string = safeToString(str);
        return parseFloat(string);
        
    } catch (exc) {
        logError('safeParseFloat error: ' + exc.message, 'general');
        return NaN;
    }
}

// =============================================================================
// JSON HANDLING - ENHANCED LOGGING
// =============================================================================

/**
 * Safe JSON stringify - ENHANCED LOGGING
 * @param {*} obj - Object to stringify
 * @param {Number} indent - Indentation level
 * @returns {String} JSON string
 */
function safeJSONStringify(obj, indent) {
    logDebug('=== STARTING safeJSONStringify ===', 'json');
    
    try {
        var indentLevel = indent || 0;
        
        if (typeof JSON !== 'undefined' && JSON.stringify) {
            var result = JSON.stringify(obj, null, indentLevel);
            logInfo('safeJSONStringify completed using native JSON', 'json');
            return result;
        } else {
            logWarn('Native JSON not available, using fallback', 'json');
            return fallbackStringify(obj, indentLevel);
        }
        
    } catch (exc) {
        logError('safeJSONStringify error: ' + exc.message, 'json');
        return fallbackStringify(obj, indent);
    }
}

/**
 * Fallback JSON stringify - ENHANCED LOGGING
 * @param {*} obj - Object to stringify
 * @param {Number} indent - Indentation level
 * @returns {String} JSON string
 */
function fallbackStringify(obj, indent) {
    logDebug('=== STARTING fallbackStringify ===', 'json');
    
    try {
        var indentLevel = indent || 0;
        var result = stringifyValue(obj, 0, indentLevel);
        
        logInfo('fallbackStringify completed', 'json');
        return result;
        
    } catch (exc) {
        logError('fallbackStringify error: ' + exc.message, 'json');
        return '{"error":"stringify failed"}';
    }
}

/**
 * Stringify value helper - INTERNAL FUNCTION
 * @param {*} value - Value to stringify
 * @param {Number} depth - Current depth
 * @param {Number} indent - Indentation
 * @returns {String} Stringified value
 */
function stringifyValue(value, depth, indent) {
    try {
        if (depth > SAFETY_CONFIG.maxObjectDepth) {
            return '"[Max Depth]"';
        }
        
        if (value === null) {
            return 'null';
        }
        if (value === undefined) {
            return 'undefined';
        }
        if (typeof value === 'string') {
            return '"' + stringReplace(stringReplace(value, '"', '\\"'), '\n', '\\n') + '"';
        }
        if (typeof value === 'number' || typeof value === 'boolean') {
            return safeToString(value);
        }
        if (typeof value === 'object') {
            if (typeof value.length !== 'undefined') {
                // Array-like
                var arrayResult = '[';
                for (var i = 0; i < value.length; i++) {
                    if (i > 0) arrayResult += ',';
                    arrayResult += stringifyValue(value[i], depth + 1, indent);
                }
                arrayResult += ']';
                return arrayResult;
            } else {
                // Object
                var objectResult = '{';
                var first = true;
                for (var key in value) {
                    if (objectHasOwnProperty(value, key)) {
                        if (!first) objectResult += ',';
                        objectResult += '"' + key + '":' + stringifyValue(value[key], depth + 1, indent);
                        first = false;
                    }
                }
                objectResult += '}';
                return objectResult;
            }
        }
        
        return '"[Unstringifiable]"';
        
    } catch (exc) {
        return '"[Stringify Error]"';
    }
}

/**
 * Safe JSON parse - ENHANCED LOGGING
 * @param {String} jsonString - JSON string to parse
 * @returns {*} Parsed object or null
 */
function safeJSONParse(jsonString) {
    logDebug('=== STARTING safeJSONParse ===', 'json');
    
    try {
        if (typeof jsonString !== 'string') {
            logWarn('safeJSONParse called with non-string input', 'json');
            return null;
        }
        
        if (typeof JSON !== 'undefined' && JSON.parse) {
            var result = JSON.parse(jsonString);
            logInfo('safeJSONParse completed using native JSON', 'json');
            return result;
        } else {
            logWarn('Native JSON not available, using eval fallback', 'json');
            // Fallback using eval (unsafe but necessary in old environments)
            var parsed = eval('(' + jsonString + ')');
            logInfo('safeJSONParse completed using eval fallback', 'json');
            return parsed;
        }
        
    } catch (exc) {
        logError('safeJSONParse error: ' + exc.message, 'json');
        return null;
    }
}

// =============================================================================
// PROPERTY SAFETY FUNCTIONS - ENHANCED LOGGING
// =============================================================================

/**
 * Safe type check - MINIMAL LOGGING
 * @param {*} value - Value to check
 * @param {String} expectedType - Expected type
 * @returns {Boolean} True if type matches
 */
function safeTypeCheck(value, expectedType) {
    try {
        if (typeof expectedType !== 'string') {
            return false;
        }
        
        return (typeof value === stringToLowerCase(expectedType));
        
    } catch (exc) {
        logError('safeTypeCheck error: ' + exc.message, 'general');
        return false;
    }
}

/**
 * Safe property check - MINIMAL LOGGING
 * @param {Object} obj - Object to check
 * @param {String} prop - Property name
 * @returns {Boolean} True if property exists safely
 */
function safeHasProperty(obj, prop) {
    try {
        if (!obj || typeof prop !== 'string') {
            return false;
        }
        
        return objectHasOwnProperty(obj, prop);
        
    } catch (exc) {
        return false;
    }
}

/**
 * Safe get length - MINIMAL LOGGING
 * @param {*} obj - Object to check
 * @returns {Number} Length or 0
 */
function safeGetLength(obj) {
    try {
        if (!obj) {
            return 0;
        }
        
        if (typeof obj.length === 'number') {
            return obj.length;
        }
        
        return 0;
        
    } catch (exc) {
        return 0;
    }
}

/**
 * Safe get object from path - ENHANCED LOGGING
 * @param {Object} rootObject - Root object
 * @param {String} path - Dot-separated path
 * @returns {*} Object at path or null
 */
function safeGetObjectFromPath(rootObject, path) {
    logDebug('=== STARTING safeGetObjectFromPath: ' + path + ' ===', 'general');
    
    try {
        if (!rootObject || typeof path !== 'string') {
            logWarn('safeGetObjectFromPath: invalid parameters', 'general');
            return null;
        }
        
        var pathParts = stringSplit(path, '.');
        var currentObject = rootObject;
        
        for (var i = 0; i < pathParts.length; i++) {
            var part = pathParts[i];
            
            if (!currentObject || !safeHasProperty(currentObject, part)) {
                logDebug('safeGetObjectFromPath: path not found at "' + part + '"', 'general');
                return null;
            }
            
            currentObject = currentObject[part];
        }
        
        logInfo('safeGetObjectFromPath completed successfully', 'general');
        return currentObject;
        
    } catch (exc) {
        logError('safeGetObjectFromPath error: ' + exc.message, 'general');
        return null;
    }
}

/**
 * Safe get property value - ENHANCED LOGGING
 * @param {Object} obj - Object to access
 * @param {String} propName - Property name
 * @returns {*} Property value or null
 */
function safeGetPropertyValue(obj, propName) {
    logDebug('Getting property value: ' + propName, 'general');
    
    try {
        if (!obj || typeof propName !== 'string') {
            logWarn('safeGetPropertyValue: invalid parameters', 'general');
            return null;
        }
        
        if (!safeHasProperty(obj, propName)) {
            logDebug('safeGetPropertyValue: property "' + propName + '" not found', 'general');
            return null;
        }
        
        var value = obj[propName];
        logDebug('safeGetPropertyValue completed for: ' + propName, 'general');
        return value;
        
    } catch (exc) {
        logError('safeGetPropertyValue error for "' + propName + '": ' + exc.message, 'general');
        return null;
    }
}

// =============================================================================
// OBJECT REFERENCE TRACKING - ENHANCED LOGGING
// =============================================================================

/**
 * Generate object reference ID - ENHANCED LOGGING
 * @param {Object} obj - Object to ID
 * @returns {String} Reference ID
 */
function generateObjectReferenceID(obj) {
    logDebug('=== STARTING generateObjectReferenceID ===', 'general');
    
    try {
        if (!obj) {
            logDebug('generateObjectReferenceID: null object', 'general');
            return 'null';
        }
        
        var id = '';
        
        // Try to use object properties for ID
        if (obj.name) {
            id += 'name:' + obj.name + ';';
        }
        if (obj.id) {
            id += 'id:' + obj.id + ';';
        }
        if (obj.constructor && obj.constructor.name) {
            id += 'type:' + obj.constructor.name + ';';
        }
        
        // Add timestamp for uniqueness
        id += 'ref:' + new Date().getTime();
        
        logInfo('generateObjectReferenceID completed: ' + id, 'general');
        return id;
        
    } catch (exc) {
        logError('generateObjectReferenceID error: ' + exc.message, 'general');
        return 'error:' + new Date().getTime();
    }
}

/**
 * Check if same object reference - MINIMAL LOGGING
 * @param {Object} obj1 - First object
 * @param {Object} obj2 - Second object
 * @returns {Boolean} True if same reference
 */
function isSameObjectReference(obj1, obj2) {
    try {
        return (obj1 === obj2);
        
    } catch (exc) {
        logError('isSameObjectReference error: ' + exc.message, 'general');
        return false;
    }
}

/**
 * Create object reference tracker - ENHANCED LOGGING
 * @returns {Object} Reference tracker
 */
function createObjectReferenceTracker() {
    logDebug('=== STARTING createObjectReferenceTracker ===', 'general');
    
    try {
        var tracker = {
            references: [],
            count: 0,
            
            track: function(obj) {
                try {
                    var id = generateObjectReferenceID(obj);
                    this.references[this.references.length] = {
                        id: id,
                        object: obj,
                        timestamp: new Date().getTime()
                    };
                    this.count++;
                    return id;
                } catch (exc) {
                    logError('Reference tracker.track error: ' + exc.message, 'general');
                    return null;
                }
            },
            
            find: function(id) {
                try {
                    for (var i = 0; i < this.references.length; i++) {
                        if (this.references[i].id === id) {
                            return this.references[i].object;
                        }
                    }
                    return null;
                } catch (exc) {
                    logError('Reference tracker.find error: ' + exc.message, 'general');
                    return null;
                }
            },
            
            clear: function() {
                try {
                    this.references = [];
                    this.count = 0;
                } catch (exc) {
                    logError('Reference tracker.clear error: ' + exc.message, 'general');
                }
            }
        };
        
        logInfo('createObjectReferenceTracker completed', 'general');
        return tracker;
        
    } catch (exc) {
        logError('createObjectReferenceTracker error: ' + exc.message, 'general');
        return null;
    }
}

// =============================================================================
// PATH UTILITIES - ENHANCED LOGGING
// =============================================================================

/**
 * Split path into parts - ENHANCED LOGGING
 * @param {String} path - Path to split
 * @returns {Array} Path parts
 */
function splitPath(path) {
    logDebug('=== STARTING splitPath: ' + path + ' ===', 'general');
    
    try {
        if (typeof path !== 'string') {
            logWarn('splitPath called with non-string path', 'general');
            return [];
        }
        
        var parts = stringSplit(path, '.');
        var cleanParts = [];
        
        for (var i = 0; i < parts.length; i++) {
            var part = trimString(parts[i]);
            if (part.length > 0) {
                cleanParts[cleanParts.length] = part;
            }
        }
        
        logInfo('splitPath completed: ' + cleanParts.length + ' parts', 'general');
        return cleanParts;
        
    } catch (exc) {
        logError('splitPath error: ' + exc.message, 'general');
        return [];
    }
}

/**
 * Join path parts - ENHANCED LOGGING
 * @param {Array} parts - Path parts to join
 * @returns {String} Joined path
 */
function joinPath(parts) {
    logDebug('=== STARTING joinPath ===', 'general');
    
    try {
        if (!parts || typeof parts.length === 'undefined') {
            logWarn('joinPath called with invalid parts array', 'general');
            return '';
        }
        
        var result = arrayJoin(parts, '.');
        logInfo('joinPath completed: ' + result, 'general');
        return result;
        
    } catch (exc) {
        logError('joinPath error: ' + exc.message, 'general');
        return '';
    }
}

/**
 * Get parent path - MINIMAL LOGGING
 * @param {String} path - Full path
 * @returns {String} Parent path
 */
function getParentPath(path) {
    try {
        if (typeof path !== 'string') {
            return '';
        }
        
        var parts = splitPath(path);
        if (parts.length <= 1) {
            return '';
        }
        
        var parentParts = arraySlice(parts, 0, parts.length - 1);
        return joinPath(parentParts);
        
    } catch (exc) {
        logError('getParentPath error: ' + exc.message, 'general');
        return '';
    }
}

/**
 * Normalize path - ENHANCED LOGGING
 * @param {String} path - Path to normalize
 * @returns {String} Normalized path
 */
function normalizePath(path) {
    logDebug('=== STARTING normalizePath: ' + path + ' ===', 'general');
    
    try {
        if (typeof path !== 'string') {
            logWarn('normalizePath called with non-string path', 'general');
            return '';
        }
        
        var parts = splitPath(path);
        var normalizedParts = [];
        
        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            if (part !== '' && part !== '.') {
                if (part === '..' && normalizedParts.length > 0) {
                    normalizedParts.pop();
                } else if (part !== '..') {
                    normalizedParts[normalizedParts.length] = part;
                }
            }
        }
        
        var result = joinPath(normalizedParts);
        logInfo('normalizePath completed: ' + result, 'general');
        return result;
        
    } catch (exc) {
        logError('normalizePath error: ' + exc.message, 'general');
        return '';
    }
}

/**
 * Check if path is absolute - MINIMAL LOGGING
 * @param {String} path - Path to check
 * @returns {Boolean} True if absolute
 */
function isAbsolutePath(path) {
    try {
        if (typeof path !== 'string') {
            return false;
        }
        
        return (stringIndexOf(path, 'document') === 0 || stringIndexOf(path, 'app') === 0);
        
    } catch (exc) {
        return false;
    }
}

/**
 * Make path absolute - ENHANCED LOGGING
 * @param {String} path - Relative path
 * @param {String} basePath - Base path
 * @returns {String} Absolute path
 */
function makeAbsolutePath(path, basePath) {
    logDebug('=== STARTING makeAbsolutePath ===', 'general');
    
    try {
        if (typeof path !== 'string') {
            logWarn('makeAbsolutePath called with invalid path', 'general');
            return '';
        }
        
        if (isAbsolutePath(path)) {
            logDebug('makeAbsolutePath: path already absolute', 'general');
            return path;
        }
        
        var base = basePath || 'document';
        var result = base + '.' + path;
        var normalized = normalizePath(result);
        
        logInfo('makeAbsolutePath completed: ' + normalized, 'general');
        return normalized;
        
    } catch (exc) {
        logError('makeAbsolutePath error: ' + exc.message, 'general');
        return '';
    }
}

// =============================================================================
// MEMORY MANAGEMENT - ENHANCED LOGGING
// =============================================================================

/**
 * Memory cleanup utility - ENHANCED LOGGING
 * @param {Object} config - Cleanup configuration
 */
function memoryCleanup(config) {
    logDebug('=== STARTING memoryCleanup ===', 'performance');
    
    try {
        var cleanupConfig = config || {
            clearGlobals: false,
            clearReferences: true,
            forceGarbageCollection: false
        };
        
        var cleanupCount = 0;
        
        // Clear object references
        if (cleanupConfig.clearReferences) {
            // This is a placeholder - real cleanup would depend on specific globals
            logDebug('Memory cleanup: clearing object references', 'performance');
            cleanupCount++;
        }
        
        // Force garbage collection if requested and available
        if (cleanupConfig.forceGarbageCollection && typeof $.gc === 'function') {
            logDebug('Memory cleanup: forcing garbage collection', 'performance');
            $.gc();
            cleanupCount++;
        }
        
        logInfo('memoryCleanup completed: ' + cleanupCount + ' cleanup operations', 'performance');
        
    } catch (exc) {
        logError('memoryCleanup error: ' + exc.message, 'performance');
    }
}

/**
 * Create memory monitor - ENHANCED LOGGING
 * @param {Object} config - Monitor configuration
 * @returns {Object} Memory monitor
 */
function createMemoryMonitor(config) {
    logDebug('=== STARTING createMemoryMonitor ===', 'performance');
    
    try {
        var monitorConfig = config || {
            checkInterval: SAFETY_CONFIG.memoryCheckInterval,
            threshold: SAFETY_CONFIG.maxOperations
        };
        
        var monitor = {
            config: monitorConfig,
            operationCount: 0,
            startTime: new Date().getTime(),
            
            increment: function() {
                try {
                    this.operationCount++;
                    if (this.operationCount % this.config.checkInterval === 0) {
                        logDebug('Memory monitor: ' + this.operationCount + ' operations completed', 'performance');
                    }
                } catch (exc) {
                    logError('Memory monitor increment error: ' + exc.message, 'performance');
                }
            },
            
            check: function() {
                try {
                    return (this.operationCount < this.config.threshold);
                } catch (exc) {
                    logError('Memory monitor check error: ' + exc.message, 'performance');
                    return false;
                }
            },
            
            reset: function() {
                try {
                    this.operationCount = 0;
                    this.startTime = new Date().getTime();
                    logDebug('Memory monitor reset', 'performance');
                } catch (exc) {
                    logError('Memory monitor reset error: ' + exc.message, 'performance');
                }
            }
        };
        
        logInfo('createMemoryMonitor completed', 'performance');
        return monitor;
        
    } catch (exc) {
        logError('createMemoryMonitor error: ' + exc.message, 'performance');
        return null;
    }
}

// =============================================================================
// DANGER DETECTION - ENHANCED LOGGING
// =============================================================================

/**
 * Check if property is dangerous - ENHANCED LOGGING
 * @param {String} propName - Property name
 * @returns {Boolean} True if dangerous
 */
function isDangerousProperty(propName) {
    logDebug('Checking dangerous property: ' + propName, 'general');
    
    try {
        if (typeof propName !== 'string') {
            return false;
        }
        
        var lowerName = stringToLowerCase(propName);
        var dangerousProps = [
            'quit', 'exit', 'close', 'save', 'delete', 'remove', 'destroy',
            'terminate', 'kill', 'abort', 'reset', 'clear', 'empty'
        ];
        
        for (var i = 0; i < dangerousProps.length; i++) {
            if (stringIndexOf(lowerName, dangerousProps[i]) !== -1) {
                logWarn('Dangerous property detected: ' + propName, 'general');
                return true;
            }
        }
        
        return false;
        
    } catch (exc) {
        logError('isDangerousProperty error: ' + exc.message, 'general');
        return true; // Err on the side of caution
    }
}

/**
 * Check if path is dangerous - ENHANCED LOGGING
 * @param {String} path - Path to check
 * @returns {Boolean} True if dangerous
 */
function isDangerousPath(path) {
    logDebug('Checking dangerous path: ' + path, 'general');
    
    try {
        if (typeof path !== 'string') {
            return false;
        }
        
        var lowerPath = stringToLowerCase(path);
        var dangerousPaths = [
            'app.quit', 'application.quit', 'document.close', 'documents.close',
            'parent.parent.parent', '.quit', '.exit', '.terminate', '.close'
        ];
        
        for (var i = 0; i < dangerousPaths.length; i++) {
            if (stringIndexOf(lowerPath, dangerousPaths[i]) !== -1) {
                logWarn('Dangerous path detected: ' + path, 'general');
                return true;
            }
        }
        
        // Check app-specific dangerous paths if adapter available
        if (functionExists('isAppSpecificDangerousPath')) {
            if (isAppSpecificDangerousPath(path)) {
                logWarn('App-specific dangerous path detected: ' + path, 'general');
                return true;
            }
        }
        
        return false;
        
    } catch (exc) {
        logError('isDangerousPath error: ' + exc.message, 'general');
        return true; // Err on the side of caution
    }
}

/**
 * Check if word is reserved - MINIMAL LOGGING
 * @param {String} word - Word to check
 * @returns {Boolean} True if reserved
 */
function isReservedWord(word) {
    try {
        if (typeof word !== 'string') {
            return false;
        }
        
        var reservedWords = [
            'break', 'case', 'catch', 'continue', 'debugger', 'default', 'delete',
            'do', 'else', 'finally', 'for', 'function', 'if', 'in', 'instanceof',
            'new', 'return', 'switch', 'this', 'throw', 'try', 'typeof', 'var',
            'void', 'while', 'with', 'export', 'import', 'class', 'extends'
        ];
        
        var lowerWord = stringToLowerCase(word);
        
        for (var i = 0; i < reservedWords.length; i++) {
            if (lowerWord === reservedWords[i]) {
                return true;
            }
        }
        
        return false;
        
    } catch (exc) {
        logError('isReservedWord error: ' + exc.message, 'general');
        return true; // Err on the side of caution
    }
}

/**
 * Get property safety level - ENHANCED LOGGING
 * @param {String} propName - Property name
 * @returns {String} Safety level: 'safe', 'caution', 'dangerous'
 */
function getPropertySafetyLevel(propName) {
    logDebug('=== STARTING getPropertySafetyLevel: ' + propName + ' ===', 'general');
    
    try {
        if (typeof propName !== 'string') {
            logWarn('getPropertySafetyLevel called with non-string', 'general');
            return 'dangerous';
        }
        
        if (isDangerousProperty(propName)) {
            logWarn('Property marked as dangerous: ' + propName, 'general');
            return 'dangerous';
        }
        
        if (isReservedWord(propName)) {
            logWarn('Property is reserved word: ' + propName, 'general');
            return 'caution';
        }
        
        var lowerName = stringToLowerCase(propName);
        var cautionProps = [
            'parent', 'application', 'preferences', 'selection', 'active'
        ];
        
        for (var i = 0; i < cautionProps.length; i++) {
            if (stringIndexOf(lowerName, cautionProps[i]) !== -1) {
                logDebug('Property marked as caution: ' + propName, 'general');
                return 'caution';
            }
        }
        
        logDebug('Property marked as safe: ' + propName, 'general');
        return 'safe';
        
    } catch (exc) {
        logError('getPropertySafetyLevel error: ' + exc.message, 'general');
        return 'dangerous';
    }
}

// =============================================================================
// OPERATION CONTROL - ENHANCED LOGGING
// =============================================================================

/**
 * Create timeout checker - ENHANCED LOGGING
 * @param {Number} timeoutMs - Timeout in milliseconds
 * @returns {Object} Timeout checker
 */
function createTimeoutChecker(timeoutMs) {
    logDebug('=== STARTING createTimeoutChecker: ' + timeoutMs + 'ms ===', 'performance');
    
    try {
        var timeout = timeoutMs || SAFETY_CONFIG.maxTimeout;
        var startTime = new Date().getTime();
        
        var checker = {
            timeout: timeout,
            startTime: startTime,
            
            check: function() {
                try {
                    var currentTime = new Date().getTime();
                    var elapsed = currentTime - this.startTime;
                    var isExpired = (elapsed > this.timeout);
                    
                    if (isExpired) {
                        logWarn('Timeout expired: ' + elapsed + 'ms > ' + this.timeout + 'ms', 'performance');
                    }
                    
                    return !isExpired;
                } catch (exc) {
                    logError('Timeout checker error: ' + exc.message, 'performance');
                    return false;
                }
            },
            
            getElapsed: function() {
                try {
                    return new Date().getTime() - this.startTime;
                } catch (exc) {
                    return 0;
                }
            }
        };
        
        logInfo('createTimeoutChecker completed', 'performance');
        return checker;
        
    } catch (exc) {
        logError('createTimeoutChecker error: ' + exc.message, 'performance');
        return null;
    }
}

/**
 * Create operation counter - ENHANCED LOGGING
 * @param {Number} maxOps - Maximum operations
 * @returns {Object} Operation counter
 */
function createOperationCounter(maxOps) {
    logDebug('=== STARTING createOperationCounter: ' + maxOps + ' max ops ===', 'performance');
    
    try {
        var maxOperations = maxOps || SAFETY_CONFIG.maxOperations;
        
        var counter = {
            maxOperations: maxOperations,
            count: 0,
            
            increment: function() {
                try {
                    this.count++;
                    return this.check();
                } catch (exc) {
                    logError('Operation counter increment error: ' + exc.message, 'performance');
                    return false;
                }
            },
            
            check: function() {
                try {
                    var withinLimit = (this.count < this.maxOperations);
                    
                    if (!withinLimit) {
                        logWarn('Operation limit exceeded: ' + this.count + ' >= ' + this.maxOperations, 'performance');
                    }
                    
                    return withinLimit;
                } catch (exc) {
                    logError('Operation counter check error: ' + exc.message, 'performance');
                    return false;
                }
            },
            
            reset: function() {
                try {
                    this.count = 0;
                    logDebug('Operation counter reset', 'performance');
                } catch (exc) {
                    logError('Operation counter reset error: ' + exc.message, 'performance');
                }
            }
        };
        
        logInfo('createOperationCounter completed', 'performance');
        return counter;
        
    } catch (exc) {
        logError('createOperationCounter error: ' + exc.message, 'performance');
        return null;
    }
}

/**
 * Create rate limiter - ENHANCED LOGGING
 * @param {Number} maxRate - Maximum rate per second
 * @returns {Object} Rate limiter
 */
function createRateLimiter(maxRate) {
    logDebug('=== STARTING createRateLimiter: ' + maxRate + ' ops/sec ===', 'performance');
    
    try {
        var maxRatePerSecond = maxRate || 100;
        var interval = Math.max(1, Math.floor(1000 / maxRatePerSecond));
        var lastOperation = 0;
        
        var limiter = {
            maxRate: maxRatePerSecond,
            interval: interval,
            lastOperation: lastOperation,
            
            check: function() {
                try {
                    var now = new Date().getTime();
                    var timeSinceLastOp = now - this.lastOperation;
                    var canProceed = (timeSinceLastOp >= this.interval);
                    
                    if (canProceed) {
                        this.lastOperation = now;
                    } else {
                        logDebug('Rate limit: must wait ' + (this.interval - timeSinceLastOp) + 'ms', 'performance');
                    }
                    
                    return canProceed;
                } catch (exc) {
                    logError('Rate limiter check error: ' + exc.message, 'performance');
                    return false;
                }
            },
            
            wait: function() {
                try {
                    var now = new Date().getTime();
                    var timeSinceLastOp = now - this.lastOperation;
                    var waitTime = Math.max(0, this.interval - timeSinceLastOp);
                    
                    if (waitTime > 0) {
                        logDebug('Rate limiter waiting: ' + waitTime + 'ms', 'performance');
                        // Note: ExtendScript doesn't have setTimeout, so this is just for timing calculation
                    }
                    
                    return waitTime;
                } catch (exc) {
                    logError('Rate limiter wait error: ' + exc.message, 'performance');
                    return 0;
                }
            }
        };
        
        logInfo('createRateLimiter completed', 'performance');
        return limiter;
        
    } catch (exc) {
        logError('createRateLimiter error: ' + exc.message, 'performance');
        return null;
    }
}

// =============================================================================
// ENVIRONMENT VALIDATION - APP-AGNOSTIC - ENHANCED LOGGING
// =============================================================================

/**
 * Validate document state (app-agnostic) - ENHANCED LOGGING
 * @returns {Object} Validation result
 */
function validateDocumentState() {
    logDebug('=== STARTING validateDocumentState ===', 'general');
    
    try {
        var result = {
            valid: false,
            appName: 'unknown',
            documentName: 'none',
            documentCount: 0,
            warnings: [],
            errors: []
        };
        
        // Check if app exists
        if (typeof app === 'undefined') {
            result.errors.push('Adobe app not available');
            logError('Adobe app not available in validateDocumentState', 'general');
            return result;
        }
        
        // Get app info
        if (app.name) {
            result.appName = app.name;
            logDebug('Validating document state for: ' + app.name, 'general');
        }
        
        // Check documents
        try {
            if (app.documents) {
                result.documentCount = app.documents.length;
                logDebug('Found ' + result.documentCount + ' documents', 'general');
                
                if (result.documentCount > 0) {
                    result.documentName = app.documents[0].name || 'untitled';
                    logDebug('Active document: ' + result.documentName, 'general');
                } else {
                    result.warnings.push('No documents are currently open');
                    logWarn('No documents open', 'general');
                }
            } else {
                result.errors.push('Documents collection not accessible');
                logError('Documents collection not accessible', 'general');
            }
        } catch (exc) {
            result.errors.push('Document access failed: ' + exc.message);
            logError('Document access failed: ' + exc.message, 'general');
        }
        
        // Final validation
        result.valid = (result.errors.length === 0 && result.documentCount > 0);
        
        if (result.valid) {
            logInfo('Document state validation successful for ' + result.appName, 'general');
        } else {
            logWarn('Document state validation failed: ' + result.errors.length + ' errors, ' + result.warnings.length + ' warnings', 'general');
        }
        
        return result;
        
    } catch (exc) {
        logError('validateDocumentState error: ' + exc.message, 'general');
        return {
            valid: false,
            error: 'Document state validation failed: ' + exc.message,
            errors: ['Validation system failure'],
            warnings: []
        };
    }
}

// =============================================================================
// DEBUG SYSTEM FUNCTIONS - LEGACY COMPATIBILITY - MINIMAL LOGGING
// =============================================================================

/**
 * Legacy debug log - MINIMAL LOGGING
 * @param {String} message - Debug message
 * @param {String} category - Debug category
 */
function debugLog(message, category) {
    // Legacy compatibility - redirect to new logging system
    logDebug(message, category);
}

/**
 * Legacy debug performance - MINIMAL LOGGING
 * @param {String} operation - Operation name
 * @param {Function} func - Function to time
 * @returns {*} Function result
 */
function debugPerformance(operation, func) {
    try {
        var startTime = new Date().getTime();
        var result = func();
        var endTime = new Date().getTime();
        var duration = endTime - startTime;
        
        logInfo('Performance: ' + operation + ' completed in ' + duration + 'ms', 'performance');
        return result;
        
    } catch (exc) {
        logError('debugPerformance error for ' + operation + ': ' + exc.message, 'performance');
        return null;
    }
}

/**
 * Legacy debug enabled check - MINIMAL LOGGING
 * @returns {Boolean} True if debug enabled
 */
function isDebugEnabled() {
    try {
        // Check if DEBUG level is enabled in logging config
        if (typeof logDebug === 'function') {
            return true; // Assume debug is available if function exists
        }
        return false;
    } catch (exc) {
        return false;
    }
}

// =============================================================================
// CONSOLIDATED UI HELPER FUNCTIONS - ENHANCED LOGGING
// =============================================================================

/**
 * Update status display - ENHANCED LOGGING
 * @param {String} message - Status message
 * @param {Object} statusText - Status text object (optional)
 */
function updateStatus(message, statusText) {
    logDebug('=== STARTING updateStatus: ' + message + ' ===', 'ui');
    
    try {
        if (typeof message !== 'string') {
            logWarn('updateStatus called with non-string message', 'ui');
            return;
        }
        
        // Update provided status object
        if (statusText && statusText.text !== undefined) {
            statusText.text = message;
            logDebug('updateStatus: updated provided status object', 'ui');
        }
        
        // Also log the status for debugging
        logInfo('Status: ' + message, 'ui');
        
    } catch (exc) {
        logError('updateStatus error: ' + exc.message, 'ui');
    }
}

/**
 * Create visualizer header - ENHANCED LOGGING
 * @param {Object} parentWindow - Parent window
 * @param {String} title - Header title
 * @returns {Object} Header panel
 */
function createVisualizerHeader(parentWindow, title) {
    logDebug('=== STARTING createVisualizerHeader ===', 'ui');
    
    try {
        if (!parentWindow) {
            logError('createVisualizerHeader: no parent window provided', 'ui');
            return null;
        }
        
        var headerTitle = title || 'DocDom Discovery Builder v4.1';
        
        var header = parentWindow.add('panel');
        header.orientation = 'row';
        header.alignChildren = ['fill', 'center'];
        header.alignment = ['fill', 'top'];
        header.margins = 10;
        
        var titleText = header.add('statictext', undefined, headerTitle);
        titleText.alignment = ['fill', 'center'];
        
        logInfo('createVisualizerHeader completed: ' + headerTitle, 'ui');
        return header;
        
    } catch (exc) {
        logError('createVisualizerHeader error: ' + exc.message, 'ui');
        return null;
    }
}

/**
 * Create visualizer tabs - ENHANCED LOGGING
 * @param {Object} parentWindow - Parent window
 * @returns {Object} Tab panel
 */
function createVisualizerTabs(parentWindow) {
    logDebug('=== STARTING createVisualizerTabs ===', 'ui');
    
    try {
        if (!parentWindow) {
            logError('createVisualizerTabs: no parent window provided', 'ui');
            return null;
        }
        
        var tabPanel = parentWindow.add('tabbedpanel');
        tabPanel.alignment = ['fill', 'fill'];
        tabPanel.margins = 5;
        
        logInfo('createVisualizerTabs completed', 'ui');
        return tabPanel;
        
    } catch (exc) {
        logError('createVisualizerTabs error: ' + exc.message, 'ui');
        return null;
    }
}

/**
 * Create visualizer footer - ENHANCED LOGGING
 * @param {Object} parentWindow - Parent window
 * @returns {Object} Footer panel
 */
function createVisualizerFooter(parentWindow) {
    logDebug('=== STARTING createVisualizerFooter ===', 'ui');
    
    try {
        if (!parentWindow) {
            logError('createVisualizerFooter: no parent window provided', 'ui');
            return null;
        }
        
        var footer = parentWindow.add('panel');
        footer.orientation = 'column';
        footer.alignChildren = ['fill', 'center'];
        footer.alignment = ['fill', 'bottom'];
        footer.margins = 5;
        
        logInfo('createVisualizerFooter completed', 'ui');
        return footer;
        
    } catch (exc) {
        logError('createVisualizerFooter error: ' + exc.message, 'ui');
        return null;
    }
}

// =============================================================================
// UTILITY FUNCTIONS - ENHANCED LOGGING
// =============================================================================

/**
 * Create string builder - ENHANCED LOGGING
 * @returns {Object} String builder
 */
function createStringBuilder() {
    logDebug('=== STARTING createStringBuilder ===', 'general');
    
    try {
        var builder = {
            parts: [],
            length: 0,
            
            append: function(str) {
                try {
                    if (typeof str !== 'undefined' && str !== null) {
                        this.parts[this.parts.length] = safeToString(str);
                        this.length++;
                    }
                    return this;
                } catch (exc) {
                    logError('String builder append error: ' + exc.message, 'general');
                    return this;
                }
            },
            
            appendLine: function(str) {
                try {
                    this.append(str);
                    this.append('\n');
                    return this;
                } catch (exc) {
                    logError('String builder appendLine error: ' + exc.message, 'general');
                    return this;
                }
            },
            
            toString: function() {
                try {
                    return arrayJoin(this.parts, '');
                } catch (exc) {
                    logError('String builder toString error: ' + exc.message, 'general');
                    return '';
                }
            },
            
            clear: function() {
                try {
                    this.parts = [];
                    this.length = 0;
                    return this;
                } catch (exc) {
                    logError('String builder clear error: ' + exc.message, 'general');
                    return this;
                }
            }
        };
        
        logInfo('createStringBuilder completed', 'general');
        return builder;
        
    } catch (exc) {
        logError('createStringBuilder error: ' + exc.message, 'general');
        return null;
    }
}

/**
 * Get current timestamp - MINIMAL LOGGING
 * @returns {String} Formatted timestamp
 */
function getCurrentTimestamp() {
    try {
        var now = new Date();
        var hours = now.getHours();
        var minutes = now.getMinutes();
        var seconds = now.getSeconds();
        
        return (hours < 10 ? '0' : '') + hours + ':' +
               (minutes < 10 ? '0' : '') + minutes + ':' +
               (seconds < 10 ? '0' : '') + seconds;
               
    } catch (exc) {
        return '00:00:00';
    }
}

/**
 * Generate unique ID - MINIMAL LOGGING
 * @returns {String} Unique ID
 */
function generateUniqueID() {
    try {
        var timestamp = new Date().getTime();
        var random = Math.floor(Math.random() * 1000);
        return 'id_' + timestamp + '_' + random;
        
    } catch (exc) {
        logError('generateUniqueID error: ' + exc.message, 'general');
        return 'id_error_' + new Date().getTime();
    }
}

/**
 * Create error result - MINIMAL LOGGING
 * @param {String} message - Error message
 * @returns {Object} Error result object
 */
function createErrorResult(message) {
    try {
        return {
            success: false,
            error: message || 'Unknown error',
            timestamp: new Date().getTime()
        };
        
    } catch (exc) {
        return {
            success: false,
            error: 'Error result creation failed',
            timestamp: 0
        };
    }
}

/**
 * Create success result - MINIMAL LOGGING
 * @param {*} data - Result data
 * @returns {Object} Success result object
 */
function createSuccessResult(data) {
    try {
        return {
            success: true,
            data: data,
            timestamp: new Date().getTime()
        };
        
    } catch (exc) {
        return createErrorResult('Success result creation failed');
    }
}

/**
 * Retry operation - ENHANCED LOGGING
 * @param {Function} operation - Operation to retry
 * @param {Number} maxRetries - Maximum retry attempts
 * @param {Number} delay - Delay between retries (ms)
 * @returns {*} Operation result
 */
function retryOperation(operation, maxRetries, delay) {
    logDebug('=== STARTING retryOperation with ' + maxRetries + ' max retries ===', 'general');
    
    try {
        var retries = maxRetries || 3;
        var retryDelay = delay || 100;
        var lastError = null;
        
        for (var attempt = 1; attempt <= retries; attempt++) {
            try {
                logDebug('retryOperation attempt ' + attempt + '/' + retries, 'general');
                var result = operation();
                
                if (result && result.success !== false) {
                    logInfo('retryOperation succeeded on attempt ' + attempt, 'general');
                    return result;
                }
                
                lastError = result.error || 'Operation returned false';
                
            } catch (exc) {
                lastError = exc.message;
                logWarn('retryOperation attempt ' + attempt + ' failed: ' + exc.message, 'general');
            }
            
            // Wait before next attempt (except on last attempt)
            if (attempt < retries) {
                logDebug('retryOperation waiting ' + retryDelay + 'ms before next attempt', 'general');
                // Note: ExtendScript doesn't have setTimeout, this is just for logging
            }
        }
        
        logError('retryOperation failed after ' + retries + ' attempts: ' + lastError, 'general');
        return createErrorResult('Operation failed after ' + retries + ' attempts: ' + lastError);
        
    } catch (exc) {
        logError('retryOperation error: ' + exc.message, 'general');
        return createErrorResult('Retry operation failed: ' + exc.message);
    }
}

// =============================================================================
// MODULE REGISTRATION
// =============================================================================

// Register this module with all its functions (LOGGING FUNCTIONS REMOVED)
registerModule('1.20.0.0_safety-utilities', '4.1', [
    // Array Helpers (6)
    'arrayIndexOf', 'arraySlice', 'arrayJoin', 'arrayPush', 'arrayPop', 'arrayConcat',

    // String Helpers (8)
    'stringIndexOf', 'stringSubstring', 'stringCharAt', 'stringSplit',
    'stringToLowerCase', 'stringToUpperCase', 'stringReplace', 'stringMatch',

    // Object Helpers (6)
    'objectHasOwnProperty', 'countObjectKeys', 'getObjectKeys', 'objectClone',
    'objectMerge', 'objectDeepMerge',

    // Function Utilities (2)
    'functionExists', 'safeCall',

    // ES3 Compatibility (4)
    'trimString', 'safeToString', 'safeParseInt', 'safeParseFloat',

    // JSON Handling (3)
    'safeJSONStringify', 'fallbackStringify', 'safeJSONParse',

    // Property Safety Functions (5)
    'safeTypeCheck', 'safeHasProperty', 'safeGetLength', 'safeGetObjectFromPath',
    'safeGetPropertyValue',

    // Object Reference Tracking (3)
    'generateObjectReferenceID', 'isSameObjectReference', 'createObjectReferenceTracker',

    // Path Utilities (6)
    'splitPath', 'joinPath', 'getParentPath', 'normalizePath', 'isAbsolutePath', 'makeAbsolutePath',

    // Memory Management (2)
    'memoryCleanup', 'createMemoryMonitor',

    // Danger Detection (4)
    'isDangerousProperty', 'isDangerousPath', 'isReservedWord', 'getPropertySafetyLevel',

    // Operation Control (3)
    'createTimeoutChecker', 'createOperationCounter', 'createRateLimiter',

    // Environment Validation (1) - APP-AGNOSTIC
    'validateDocumentState',

    // Debug System Functions - LEGACY COMPATIBILITY (3)
    'debugLog', 'debugPerformance', 'isDebugEnabled',

    // Consolidated UI Helper Functions (4)
    'updateStatus', 'createVisualizerHeader', 'createVisualizerTabs', 'createVisualizerFooter',

    // Utilities (6)
    'createStringBuilder', 'getCurrentTimestamp', 'generateUniqueID',
    'createErrorResult', 'createSuccessResult', 'retryOperation'
    
    // NOTE: Logging functions REMOVED - now provided by 1.1.0.0_bootstrap-foundation.jsx
    // REMOVED: initializeLoggingConfig, logMessage, logInfo, logDebug, logWarn, logError
]);

logInfo('1.2.0.0_safety-utilities.jsx loaded successfully with 66 functions (removed 6 logging functions)', 'general');

// =============================================================================
// END OF 1.2.0.0_safety-utilities.jsx - v4.1 ENHANCED
// =============================================================================