// =============================================================================
// 1.2_safety-utilities.jsx - ES3 HELPER FUNCTIONS AND SAFETY UTILITIES
// InDesign DOM Discovery Builder v3.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: ES3-compatible helper functions and safety utilities with unified logging
// DEPENDENCIES: ["1.1_bootstrap-foundation.jsx"]
// SIZE: ~2030 lines - COMPLETE IMPLEMENTATION WITH LOGGING LEVELS
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
// UNIFIED LOGGING CONFIGURATION SYSTEM
// =============================================================================

var DEFAULT_LOGGING_CONFIG = {
    enabled: true,
    levels: {
        ERROR: { enabled: true, priority: 1 },
        WARN: { enabled: true, priority: 2 },
        INFO: { enabled: true, priority: 3 },
        DEBUG: { enabled: false, priority: 4 }
    },
    categories: {
        general: { enabled: true },
        enumeration: { enabled: true },
        sampling: { enabled: true },
        display: { enabled: true },
        export: { enabled: true },
        performance: { enabled: true },
        circular: { enabled: true }
    },
    maxLevel: 'INFO'  // Only show messages at or above this level
};

// Global logging configuration - can be overridden
var g_loggingConfig = null;

/**
 * Initialize unified logging configuration
 * @param {Object} customConfig - Custom logging configuration
 */
function initializeLoggingConfig(customConfig) {
    try {
        if (customConfig) {
            g_loggingConfig = objectDeepMerge(DEFAULT_LOGGING_CONFIG, customConfig);
        } else {
            g_loggingConfig = objectClone(DEFAULT_LOGGING_CONFIG, 3);
        }
    } catch (exc) {
        g_loggingConfig = DEFAULT_LOGGING_CONFIG;
    }
}

// Initialize with defaults
initializeLoggingConfig();

// =============================================================================
// ES3 ARRAY HELPER FUNCTIONS
// =============================================================================

/**
 * ES3-compatible Array.indexOf
 * @param {Array} targetArray - Array to search
 * @param {*} searchElement - Element to find
 * @returns {Number} Index or -1 if not found
 */
function arrayIndexOf(targetArray, searchElement) {
    try {
        if (!targetArray || typeof targetArray.length === 'undefined') {
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
 * @param {Array} targetArray - Source array
 * @param {Number} startIndex - Start index
 * @param {Number} endIndex - End index (optional)
 * @returns {Array} Sliced array
 */
function arraySlice(targetArray, startIndex, endIndex) {
    try {
        if (!targetArray || typeof targetArray.length === 'undefined') {
            return [];
        }

        var result = [];
        var startIdx = startIndex || 0;
        var endIdx = (typeof endIndex !== 'undefined') ? 
            endIndex : targetArray.length;

        if (startIdx < 0) startIdx = Math.max(0, targetArray.length + startIdx);
        if (endIdx < 0) endIdx = Math.max(0, targetArray.length + endIdx);

        for (var i = startIdx; i < endIdx && i < targetArray.length; i++) {
            result[result.length] = targetArray[i];
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
        if (!targetArray || typeof targetArray.length === 'undefined') {
            return '';
        }

        var sep = (typeof separator !== 'undefined') ? separator : ',';
        var result = '';

        for (var i = 0; i < targetArray.length; i++) {
            if (i > 0) result += sep;
            result += String(targetArray[i]);
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
 * @returns {Number} New length
 */
function arrayPush(targetArray, element) {
    try {
        if (!targetArray || typeof targetArray.length === 'undefined') {
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
 * @returns {*} Removed element
 */
function arrayPop(targetArray) {
    try {
        if (!targetArray || typeof targetArray.length === 'undefined' || targetArray.length === 0) {
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
 * @param {Array} targetArray - Source array
 * @param {Array} sourceArray - Array to concatenate
 * @returns {Array} New concatenated array
 */
function arrayConcat(targetArray, sourceArray) {
    try {
        var result = [];

        if (targetArray && typeof targetArray.length !== 'undefined') {
            for (var i = 0; i < targetArray.length; i++) {
                result[result.length] = targetArray[i];
            }
        }

        if (sourceArray && typeof sourceArray.length !== 'undefined') {
            for (var j = 0; j < sourceArray.length; j++) {
                result[result.length] = sourceArray[j];
            }
        }

        return result;

    } catch (exc) {
        return [];
    }
}

// =============================================================================
// ES3 STRING HELPER FUNCTIONS
// =============================================================================

/**
 * ES3-compatible String.indexOf
 * @param {String} targetString - String to search
 * @param {String} searchString - String to find
 * @param {Number} startIndex - Start position
 * @returns {Number} Index or -1 if not found
 */
function stringIndexOf(targetString, searchString, startIndex) {
    try {
        if (typeof targetString !== 'string' || typeof searchString !== 'string') {
            return -1;
        }

        var startPos = startIndex || 0;
        return targetString.indexOf(searchString, startPos);

    } catch (exc) {
        return -1;
    }
}

/**
 * ES3-compatible String.substring
 * @param {String} targetString - Source string
 * @param {Number} startIndex - Start index
 * @param {Number} endIndex - End index (optional)
 * @returns {String} Substring
 */
function stringSubstring(targetString, startIndex, endIndex) {
    try {
        if (typeof targetString !== 'string') return '';

        var startIdx = startIndex || 0;
        var endIdx = (typeof endIndex !== 'undefined') ? 
            endIndex : targetString.length;

        return targetString.substring(startIdx, endIdx);

    } catch (exc) {
        return '';
    }
}

/**
 * ES3-compatible String.charAt
 * @param {String} targetString - Source string
 * @param {Number} index - Character index
 * @returns {String} Character at index
 */
function stringCharAt(targetString, index) {
    try {
        if (typeof targetString !== 'string' || typeof index !== 'number') {
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
 * @param {String} separator - Separator pattern
 * @returns {Array} Split string array
 */
function stringSplit(targetString, separator) {
    try {
        if (typeof targetString !== 'string') return [];

        var sep = (typeof separator !== 'undefined') ? 
            separator : '';
        return targetString.split(sep);

    } catch (exc) {
        return [];
    }
}

/**
 * ES3-compatible String.toLowerCase
 * @param {String} targetString - Source string
 * @returns {String} Lowercase string
 */
function stringToLowerCase(targetString) {
    try {
        if (typeof targetString !== 'string') return '';
        return targetString.toLowerCase();
    } catch (exc) {
        return targetString || '';
    }
}

/**
 * ES3-compatible String.toUpperCase
 * @param {String} targetString - Source string
 * @returns {String} Uppercase string
 */
function stringToUpperCase(targetString) {
    try {
        if (typeof targetString !== 'string') return '';
        return targetString.toUpperCase();
    } catch (exc) {
        return targetString || '';
    }
}

/**
 * Enhanced string replace with safety
 * @param {String} targetString - Source string
 * @param {String} searchValue - String to replace
 * @param {String} replaceValue - Replacement string
 * @returns {String} String with replacements
 */
function stringReplace(targetString, searchValue, replaceValue) {
    try {
        if (typeof targetString !== 'string') return '';
        if (typeof searchValue !== 'string') return targetString;
        if (typeof replaceValue !== 'string') replaceValue = '';

        var result = '';
        var lastIndex = 0;
        var searchLen = searchValue.length;

        if (searchLen === 0) return targetString;

        var index = stringIndexOf(targetString, searchValue, 0);
        while (index !== -1) {
            result += stringSubstring(targetString, lastIndex, index) + replaceValue;
            lastIndex = index + searchLen;
            index = stringIndexOf(targetString, searchValue, lastIndex);
        }

        result += stringSubstring(targetString, lastIndex);
        return result;

    } catch (exc) {
        return targetString || '';
    }
}

/**
 * ES3-compatible String.match (simplified)
 * @param {String} targetString - String to search
 * @param {String} pattern - Pattern to match
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
 * Shallow object merge (ES3 compatible)
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object
 */
function objectMerge(target, source) {
    try {
        var result = {};

        // Copy target properties
        if (target && typeof target === 'object') {
            for (var targetProp in target) {
                if (objectHasOwnProperty(target, targetProp)) {
                    result[targetProp] = target[targetProp];
                }
            }
        }

        // Copy source properties (overwrite)
        if (source && typeof source === 'object') {
            for (var sourceProp in source) {
                if (objectHasOwnProperty(source, sourceProp)) {
                    result[sourceProp] = source[sourceProp];
                }
            }
        }

        return result;

    } catch (exc) {
        return target || {};
    }
}

/**
 * Deep object merge (ES3 compatible)
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Deep merged object
 */
function objectDeepMerge(target, source) {
    try {
        var result = objectClone(target, 3);

        if (source && typeof source === 'object') {
            for (var prop in source) {
                if (objectHasOwnProperty(source, prop)) {
                    if (result[prop] && typeof result[prop] === 'object' &&
                        source[prop] && typeof source[prop] === 'object') {
                        result[prop] = objectDeepMerge(result[prop], source[prop]);
                    } else {
                        result[prop] = objectClone(source[prop], 2);
                    }
                }
            }
        }

        return result;

    } catch (exc) {
        return target || {};
    }
}

// =============================================================================
// ES3 FUNCTION UTILITIES
// =============================================================================

/**
 * Check if function exists
 * @param {String} functionName - Function name to check
 * @returns {Boolean} True if function exists
 */
function functionExists(functionName) {
    try {
        return typeof eval(functionName) === 'function';
    } catch (exc) {
        return false;
    }
}

/**
 * Safe function call with error handling
 * @param {Function} func - Function to call
 * @param {Array} args - Arguments
 * @param {*} context - Context (optional)
 * @returns {Object} Result with success, value, error
 */
function safeCall(func, args, context) {
    var result = {
        success: false,
        value: null,
        error: null
    };

    try {
        if (typeof func !== 'function') {
            result.error = 'Not a function';
            return result;
        }

        var argsArray = args || [];
        var callContext = context || null;

        if (callContext) {
            result.value = func.apply(callContext, argsArray);
        } else {
            result.value = func.apply(null, argsArray);
        }

        result.success = true;

    } catch (exc) {
        result.error = exc.message || 'Function call failed';
    }

    return result;
}

// =============================================================================
// ES3 COMPATIBILITY UTILITIES
// =============================================================================

/**
 * Trim whitespace from string (ES3 compatible)
 * @param {String} sourceString - String to trim
 * @returns {String} Trimmed string
 */
function trimString(sourceString) {
    try {
        if (typeof sourceString !== 'string') return '';

        var start = 0;
        var end = sourceString.length;

        // Find start of non-whitespace
        while (start < end && /\s/.test(stringCharAt(sourceString, start))) {
            start++;
        }

        // Find end of non-whitespace
        while (end > start && /\s/.test(stringCharAt(sourceString, end - 1))) {
            end--;
        }

        return stringSubstring(sourceString, start, end);

    } catch (exc) {
        return sourceString || '';
    }
}

/**
 * Safe string conversion
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
 * Safe integer parsing
 * @param {String} str - String to parse
 * @param {Number} radix - Number base
 * @returns {Number} Parsed integer or NaN
 */
function safeParseInt(str, radix) {
    try {
        var base = radix || 10;
        return parseInt(str, base);
    } catch (exc) {
        return NaN;
    }
}

/**
 * Safe float parsing
 * @param {String} str - String to parse
 * @returns {Number} Parsed float or NaN
 */
function safeParseFloat(str) {
    try {
        return parseFloat(str);
    } catch (exc) {
        return NaN;
    }
}

// =============================================================================
// JSON HANDLING UTILITIES
// =============================================================================

/**
 * Safe JSON stringify with circular reference handling
 * @param {*} data - Data to stringify
 * @returns {String} JSON string
 */
function safeJSONStringify(data) {
    try {
        if (typeof JSON !== 'undefined' && JSON.stringify) {
            return JSON.stringify(data);
        } else {
            return fallbackStringify(data);
        }
    } catch (exc) {
        return fallbackStringify(data);
    }
}

/**
 * Fallback stringify implementation
 * @param {*} data - Data to stringify
 * @returns {String} JSON-like string
 */
function fallbackStringify(data) {
    var seen = [];

    function stringify(value, depth) {
        try {
            if (depth > 5) return '"[max depth]"';

            if (value === null) return 'null';
            if (value === undefined) return 'undefined';

            var valueType = typeof value;

            if (valueType === 'string') {
                return '"' + stringReplace(value, '"', '\\"') + '"';
            }

            if (valueType === 'number' || valueType === 'boolean') {
                return String(value);
            }

            if (valueType !== 'object') return '"[' + valueType + ']"';

            // Check for circular references
            for (var i = 0; i < seen.length; i++) {
                if (seen[i] === value) {
                    return '"[circular reference]"';
                }
            }

            seen[seen.length] = value;

            // Handle arrays
            if (value.length !== undefined && typeof value.length === 'number') {
                var arrayItems = [];
                for (var arrIndex = 0; arrIndex < value.length; arrIndex++) {
                    arrayItems[arrayItems.length] = stringify(value[arrIndex], depth + 1);
                }
                return '[' + arrayJoin(arrayItems, ', ') + ']';
            }

            // Handle objects
            var objectPairs = [];
            for (var prop in value) {
                if (objectHasOwnProperty(value, prop)) {
                    var propValue = stringify(value[prop], depth + 1);
                    objectPairs[objectPairs.length] = '"' + prop + '": ' + propValue;
                }
            }

            return '{' + arrayJoin(objectPairs, ', ') + '}';

        } catch (exc) {
            return '"[stringify error: ' + exc.message + ']"';
        }
    }

    try {
        return stringify(data, 0);
    } catch (exc) {
        return '{"error": "Stringify failed: ' + exc.message + '"}';
    }
}

/**
 * Safe JSON parse
 * @param {String} jsonString - JSON string to parse
 * @returns {*} Parsed object or null
 */
function safeJSONParse(jsonString) {
    try {
        if (typeof JSON !== 'undefined' && JSON.parse) {
            return JSON.parse(jsonString);
        } else {
            // Very basic fallback - only handles simple cases
            return eval('(' + jsonString + ')');
        }
    } catch (exc) {
        return null;
    }
}

// =============================================================================
// PROPERTY SAFETY FUNCTIONS
// =============================================================================

/**
 * Safe type checking
 * @param {*} targetValue - Value to check
 * @returns {String} Type string
 */
function safeTypeCheck(targetValue) {
    try {
        return typeof targetValue;
    } catch (exc) {
        return 'error';
    }
}

/**
 * Safe property existence check
 * @param {Object} targetObject - Object to check
 * @param {String} propName - Property name
 * @returns {Boolean} True if property exists safely
 */
function safeHasProperty(targetObject, propName) {
    try {
        if (!targetObject || typeof targetObject !== 'object') {
            return false;
        }

        return objectHasOwnProperty(targetObject, propName);

    } catch (exc) {
        return false;
    }
}

/**
 * Safe length property access
 * @param {Object} targetObject - Object with length property
 * @returns {Number} Length or 0
 */
function safeGetLength(targetObject) {
    try {
        if (!targetObject || typeof targetObject !== 'object') {
            return 0;
        }

        if (typeof targetObject.length === 'number') {
            return targetObject.length;
        }

        return 0;

    } catch (exc) {
        return 0;
    }
}

/**
 * Safe object access by path
 * @param {Object} rootObject - Root object
 * @param {String} path - Dot notation path
 * @param {Number} timeoutMs - Timeout in milliseconds
 * @returns {Object} Result with success, value, error
 */
function safeGetObjectFromPath(rootObject, path, timeoutMs) {
    var result = {
        success: false,
        value: null,
        error: null
    };

    try {
        if (!rootObject) {
            result.error = 'Root object is null or undefined';
            return result;
        }

        if (!path || typeof path !== 'string') {
            result.value = rootObject;
            result.success = true;
            return result;
        }

        var pathComponents = stringSplit(path, '.');
        var currentObject = rootObject;

        for (var i = 0; i < pathComponents.length; i++) {
            var component = pathComponents[i];

            if (!currentObject || typeof currentObject !== 'object') {
                result.error = 'Path component ' + component + ' is not accessible';
                return result;
            }

            if (!safeHasProperty(currentObject, component)) {
                result.error = 'Property ' + component + ' does not exist';
                return result;
            }

            currentObject = currentObject[component];
        }

        result.value = currentObject;
        result.success = true;

    } catch (exc) {
        result.error = 'Path access failed: ' + exc.message;
    }

    return result;
}

/**
 * Safe property value getter
 * @param {Object} targetObject - Object to access
 * @param {String} propName - Property name
 * @param {*} defaultValue - Default value
 * @returns {*} Property value or default
 */
function safeGetPropertyValue(targetObject, propName, defaultValue) {
    try {
        if (!targetObject || typeof targetObject !== 'object') {
            return defaultValue;
        }

        if (!safeHasProperty(targetObject, propName)) {
            return defaultValue;
        }

        return targetObject[propName];

    } catch (exc) {
        return defaultValue;
    }
}

// =============================================================================
// OBJECT REFERENCE TRACKING
// =============================================================================

/**
 * Generate object reference ID
 * @param {Object} targetObject - Object to generate ID for
 * @returns {String} Reference ID
 */
function generateObjectReferenceID(targetObject) {
    try {
        if (!targetObject || typeof targetObject !== 'object') {
            return 'non_object_' + (new Date().getTime());
        }

        var refComponents = [];

        if (targetObject.constructor && targetObject.constructor.name) {
            refComponents[refComponents.length] = targetObject.constructor.name;
        }

        if (typeof targetObject.length === 'number') {
            refComponents[refComponents.length] = 'length_' + targetObject.length;
        }

        refComponents[refComponents.length] = 'time_' + (new Date().getTime());

        return arrayJoin(refComponents, '_');

    } catch (exc) {
        return 'ref_error_' + (new Date().getTime());
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
 * @returns {Object} Reference tracker object
 */
function createObjectReferenceTracker() {
    try {
        return {
            references: {},
            visitedObjects: [],
            duplicateCount: 0,
            totalTracked: 0,

            track: function (targetObject, refId) {
                try {
                    if (!targetObject || typeof targetObject !== 'object') {
                        return null;
                    }

                    var referenceId = refId || generateObjectReferenceID(targetObject);

                    if (this.references[referenceId]) {
                        this.duplicateCount++;
                        return referenceId;
                    }

                    this.references[referenceId] = {
                        object: targetObject,
                        firstSeen: getCurrentTimestamp(),
                        accessCount: 1
                    };

                    this.visitedObjects[this.visitedObjects.length] = targetObject;
                    this.totalTracked++;

                    return referenceId;

                } catch (exc) {
                    return null;
                }
            },

            isTracked: function (targetObject) {
                try {
                    for (var i = 0; i < this.visitedObjects.length; i++) {
                        if (isSameObjectReference(this.visitedObjects[i], targetObject)) {
                            return true;
                        }
                    }
                    return false;
                } catch (exc) {
                    return false;
                }
            },

            getStats: function () {
                try {
                    return {
                        totalTracked: this.totalTracked,
                        duplicateCount: this.duplicateCount,
                        uniqueObjects: this.visitedObjects.length
                    };
                } catch (exc) {
                    return { totalTracked: 0, duplicateCount: 0, uniqueObjects: 0 };
                }
            }
        };

    } catch (exc) {
        return {
            track: function () { return null; },
            isTracked: function () { return false; },
            getStats: function () { return {}; }
        };
    }
}

// =============================================================================
// PATH UTILITIES
// =============================================================================

/**
 * Split path into components
 * @param {String} path - Dot notation path
 * @returns {Array} Path components
 */
function splitPath(path) {
    try {
        if (!path || typeof path !== 'string') {
            return [];
        }

        return stringSplit(path, '.');

    } catch (exc) {
        return [];
    }
}

/**
 * Join path components into dot notation
 * @param {Array} pathComponents - Array of path components
 * @returns {String} Dot notation path
 */
function joinPath(pathComponents) {
    try {
        if (!pathComponents || !pathComponents.length) {
            return '';
        }

        return arrayJoin(pathComponents, '.');

    } catch (exc) {
        return '';
    }
}

/**
 * Get parent path from dot notation path
 * @param {String} path - Full path
 * @returns {String} Parent path
 */
function getParentPath(path) {
    try {
        if (!path || typeof path !== 'string') {
            return '';
        }

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
 * Normalize path string
 * @param {String} path - Path to normalize
 * @returns {String} Normalized path
 */
function normalizePath(path) {
    try {
        if (!path || typeof path !== 'string') {
            return '';
        }

        // Remove multiple consecutive dots
        var normalized = stringReplace(path, '..', '.');

        // Remove leading/trailing dots
        normalized = trimString(normalized);
        if (stringCharAt(normalized, 0) === '.') {
            normalized = stringSubstring(normalized, 1);
        }
        if (stringCharAt(normalized, normalized.length - 1) === '.') {
            normalized = stringSubstring(normalized, 0, normalized.length - 1);
        }

        return normalized;

    } catch (exc) {
        return path || '';
    }
}

/**
 * Check if path is absolute
 * @param {String} path - Path to check
 * @returns {Boolean} True if absolute path
 */
function isAbsolutePath(path) {
    try {
        if (!path || typeof path !== 'string') return false;

        return stringIndexOf(path, 'document') === 0 || stringIndexOf(path, 'app') === 0;

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
        if (!path || typeof path !== 'string') return '';

        if (isAbsolutePath(path)) {
            return path;
        }

        var basePath = base || 'document';
        return basePath + '.' + path;

    } catch (exc) {
        return path || '';
    }
}

// =============================================================================
// MEMORY MANAGEMENT
// =============================================================================

/**
 * Memory cleanup utility
 * @param {Array} objectsToClean - Objects to clean up
 */
function memoryCleanup(objectsToClean) {
    try {
        if (!objectsToClean || !objectsToClean.length) return;

        for (var i = 0; i < objectsToClean.length; i++) {
            try {
                if (objectsToClean[i] && typeof objectsToClean[i].cleanup === 'function') {
                    objectsToClean[i].cleanup();
                }
            } catch (cleanupExc) {
                // Continue cleanup
            }
        }

    } catch (exc) {
        // Silent cleanup failure
    }
}

/**
 * Create memory monitor
 * @returns {Object} Memory monitor object
 */
function createMemoryMonitor() {
    try {
        return {
            objectCount: 0,
            maxObjects: 10000,

            check: function () {
                try {
                    return this.objectCount < this.maxObjects;
                } catch (exc) {
                    return false;
                }
            },

            increment: function () {
                try {
                    this.objectCount++;
                } catch (exc) {
                    // Continue operation
                }
            },

            forceCleanup: function () {
                try {
                    this.objectCount = 0;
                } catch (exc) {
                    // Continue operation
                }
            },

            getStats: function () {
                try {
                    return {
                        current: this.objectCount,
                        maximum: this.maxObjects,
                        percentage: Math.round((this.objectCount / this.maxObjects) * 100)
                    };
                } catch (exc) {
                    return { current: 0, maximum: 0, percentage: 0 };
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
        return {
            count: 0,
            maximum: maxOperations || 1000,

            increment: function () {
                try {
                    this.count++;
                    return this.count;
                } catch (exc) {
                    return this.maximum + 1;
                }
            },

            isExceeded: function () {
                try {
                    return this.count >= this.maximum;
                } catch (exc) {
                    return true;
                }
            },

            reset: function () {
                try {
                    this.count = 0;
                } catch (exc) {
                    // Continue operation
                }
            }
        };

    } catch (exc) {
        return {
            increment: function () { return 1; },
            isExceeded: function () { return true; },
            reset: function () { }
        };
    }
}

/**
 * Create rate limiter
 * @param {Number} maxPerSecond - Maximum operations per second
 * @returns {Function} Rate limit check function
 */
function createRateLimiter(maxPerSecond) {
    try {
        var operationTimes = [];
        var maxRate = maxPerSecond || 10;

        return function () {
            try {
                var now = new Date().getTime();
                var oneSecondAgo = now - 1000;

                // Remove old operations
                var filtered = [];
                for (var i = 0; i < operationTimes.length; i++) {
                    if (operationTimes[i] > oneSecondAgo) {
                        filtered[filtered.length] = operationTimes[i];
                    }
                }
                operationTimes = filtered;

                if (operationTimes.length >= maxRate) {
                    return false; // Rate limited
                }

                operationTimes[operationTimes.length] = now;
                return true; // Allowed

            } catch (exc) {
                return false;
            }
        };

    } catch (exc) {
        return function () { return false; };
    }
}

// =============================================================================
// ENVIRONMENT VALIDATION
// =============================================================================

/**
 * Validate InDesign environment and document access
 * @returns {Object} Validation result with environment details
 */
function validateInDesignEnvironment() {
    var result = {
        valid: false,
        document: null,
        metadata: {},
        error: null
    };

    try {
        // Check for InDesign application
        if (typeof app === 'undefined') {
            result.error = 'InDesign application not available';
            return result;
        }

        // Collect environment metadata
        try {
            result.metadata.indesignVersion = app.version || 'Unknown';
            result.metadata.locale = app.locale || 'Unknown';
            result.metadata.hasNativeJSON = (typeof JSON !== 'undefined');
        } catch (metaExc) {
            result.metadata.indesignVersion = 'Access Error';
        }

        // Check document access
        try {
            if (!app.documents || app.documents.length === 0) {
                result.error = 'No documents are open';
                return result;
            }

            result.document = app.activeDocument;
            if (!result.document) {
                result.error = 'No active document available';
                return result;
            }
        } catch (docExc) {
            result.error = 'Cannot access document: ' + docExc.message;
            return result;
        }

        result.valid = true;
        return result;

    } catch (exc) {
        result.error = 'Environment validation failed: ' + exc.message;
        return result;
    }
}

/**
 * Validate document state for safe enumeration
 * @param {Object} documentObj - Document to validate
 * @returns {Object} Validation result with warnings and metadata
 */
function validateDocumentState(documentObj) {
    var result = {
        safe: false,
        warnings: [],
        metadata: {}
    };

    try {
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
// UNIFIED LOGGING SYSTEM WITH LEVELS
// =============================================================================

/**
 * Enhanced logging with levels and unified configuration
 * @param {String} message - Log message
 * @param {String} level - Log level: 'ERROR', 'WARN', 'INFO', 'DEBUG'
 * @param {String} category - Category: 'enumeration', 'sampling', 'display', etc.
 */
function logMessage(message, level, category) {
    try {
        var logLevel = level || 'INFO';
        var logCategory = category || 'general';
        var shouldLog = false;

        // Initialize config if needed
        if (!g_loggingConfig) {
            initializeLoggingConfig();
        }

        // Check if logging is enabled globally
        if (!g_loggingConfig.enabled) {
            return;
        }

        // Check level priority
        var levelConfig = g_loggingConfig.levels[logLevel];
        var maxLevelConfig = g_loggingConfig.levels[g_loggingConfig.maxLevel];
        
        if (levelConfig && maxLevelConfig) {
            shouldLog = levelConfig.priority <= maxLevelConfig.priority;
        }

        // Check category enablement
        if (shouldLog && g_loggingConfig.categories[logCategory]) {
            shouldLog = g_loggingConfig.categories[logCategory].enabled;
        }

        // Fallback to legacy configuration if available
        if (!shouldLog && typeof g_domViz_userConfiguration !== 'undefined' &&
            g_domViz_userConfiguration && g_domViz_userConfiguration.debug) {
            
            if (logLevel === 'DEBUG' && g_domViz_userConfiguration.debug.enabled) {
                switch (logCategory) {
                    case 'enumeration':
                        shouldLog = g_domViz_userConfiguration.debug.showEnumeration;
                        break;
                    case 'sampling':
                        shouldLog = g_domViz_userConfiguration.debug.showSampling;
                        break;
                    case 'display':
                        shouldLog = g_domViz_userConfiguration.debug.showDisplay;
                        break;
                    case 'performance':
                        shouldLog = g_domViz_userConfiguration.debug.showPerformance;
                        break;
                    case 'circular':
                        shouldLog = g_domViz_userConfiguration.debug.showCircularDetection;
                        break;
                    default:
                        shouldLog = true;
                }
            } else if (logLevel !== 'DEBUG') {
                shouldLog = true; // Always show non-debug messages
            }
        }

        if (shouldLog) {
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
 * Check if specific debug category is enabled
 * @param {String} category - Debug category
 * @returns {Boolean} True if enabled
 */
function isDebugEnabled(category) {
    try {
        if (!g_loggingConfig || !g_loggingConfig.enabled) {
            return false;
        }

        if (!category) return g_loggingConfig.levels.DEBUG.enabled;

        var categoryConfig = g_loggingConfig.categories[category];
        return categoryConfig ? categoryConfig.enabled : false;

    } catch (exc) {
        return false;
    }
}

// =============================================================================
// UTILITIES
// =============================================================================

/**
 * Create string builder utility
 * @returns {Object} String builder
 */
function createStringBuilder() {
    try {
        return {
            parts: [],

            append: function (text) {
                try {
                    this.parts[this.parts.length] = safeToString(text);
                } catch (exc) {
                    this.parts[this.parts.length] = '[append error]';
                }
            },

            appendLine: function (text) {
                try {
                    this.parts[this.parts.length] = safeToString(text) + '\n';
                } catch (exc) {
                    this.parts[this.parts.length] = '[append line error]\n';
                }
            },

            toString: function () {
                try {
                    return arrayJoin(this.parts, '');
                } catch (exc) {
                    return '[string builder error]';
                }
            },

            clear: function () {
                try {
                    this.parts = [];
                } catch (exc) {
                    // Continue operation
                }
            }
        };

    } catch (exc) {
        return {
            append: function () { },
            appendLine: function () { },
            toString: function () { return '[string builder creation error]'; },
            clear: function () { }
        };
    }
}

/**
 * Get current timestamp
 * @returns {String} ISO timestamp
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
        return 'timestamp_error';
    }
}

/**
 * Generate unique ID
 * @returns {String} Unique identifier
 */
function generateUniqueID() {
    try {
        return 'id_' + (new Date().getTime()) + '_' + Math.floor(Math.random() * 10000);
    } catch (exc) {
        return 'unique_id_error';
    }
}

/**
 * Create error result object
 * @param {String} errorMessage - Error message
 * @returns {Object} Error result
 */
function createErrorResult(errorMessage) {
    try {
        return {
            success: false,
            error: errorMessage || 'Unknown error',
            timestamp: getCurrentTimestamp()
        };
    } catch (exc) {
        return {
            success: false,
            error: 'Error result creation failed',
            timestamp: 'unknown'
        };
    }
}

/**
 * Create success result object
 * @param {*} value - Success value
 * @returns {Object} Success result
 */
function createSuccessResult(value) {
    try {
        return {
            success: true,
            value: value,
            timestamp: getCurrentTimestamp()
        };
    } catch (exc) {
        return {
            success: false,
            error: 'Success result creation failed',
            timestamp: 'unknown'
        };
    }
}

/**
 * Retry operation with exponential backoff
 * @param {Function} operation - Function to retry
 * @param {Number} maxAttempts - Maximum attempts
 * @param {Number} baseDelay - Base delay in ms
 * @returns {Object} Operation result
 */
function retryOperation(operation, maxAttempts, baseDelay) {
    var attempts = maxAttempts || 3;
    var delay = baseDelay || 100;

    try {
        for (var attempt = 1; attempt <= attempts; attempt++) {
            try {
                var result = operation();
                if (result && result.success) {
                    return result;
                }

                if (attempt < attempts) {
                    // Simple delay simulation (not ideal but ES3 compatible)
                    var start = new Date().getTime();
                    while (new Date().getTime() - start < delay * attempt) {
                        // Wait
                    }
                }

            } catch (operationExc) {
                if (attempt === attempts) {
                    return createErrorResult('Operation failed after ' + attempts + ' attempts: ' + operationExc.message);
                }
            }
        }

        return createErrorResult('Operation failed after ' + attempts + ' attempts');

    } catch (exc) {
        return createErrorResult('Retry operation error: ' + exc.message);
    }
}

/**
 * Standard status update function
 * @param {String} message - Status message
 */
function updateStatus(message) {
    try {
        logInfo(message, 'general');
    } catch (exc) {
        // Silent fallback for environments without logging
    }
}

// =============================================================================
// OBJECT CLONING - CRITICAL FUNCTION IMPLEMENTATION
// =============================================================================

/**
 * Clone object safely (ES3 compatible) - CRITICAL FUNCTION
 * @param {*} source - Source object to clone
 * @param {Number} maxDepth - Maximum recursion depth
 * @returns {*} Cloned object
 */
function objectClone(source, maxDepth) {
    try {
        var depth = maxDepth || 3;
        
        function cloneValue(value, currentDepth) {
            try {
                if (currentDepth >= depth) {
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
// MODULE REGISTRATION - COMPLETE FUNCTION LIST
// =============================================================================

// Register this module with all its functions
registerModule('1.2_safety-utilities', '3.1', [
    // Unified Logging System - NEW
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
// END OF 1.2_safety-utilities.jsx - COMPLETE WITH LOGGING LEVELS
// =============================================================================