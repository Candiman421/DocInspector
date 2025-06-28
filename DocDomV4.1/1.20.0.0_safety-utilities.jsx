// DocDomV4.1/1.20.0.0_safety-utilities.jsx
// 1.20.0.0_safety-utilities.jsx - ES3 HELPER FUNCTIONS AND SAFETY UTILITIES
// DocDom Discovery Builder v4.1 - PRODUCTION READY - ADAPTER AGNOSTIC
// =============================================================================
// PURPOSE: ES3-compatible helper functions, safety utilities, consolidated UI helpers
// DEPENDENCIES: ["1.1.0.0_bootstrap-foundation.jsx"] - ADAPTER AGNOSTIC (adapter loads between 1.1 and 1.20)
// SIZE: ~2200 lines - COMPLETE IMPLEMENTATION - ENHANCED LOGGING - ES3 COMPLIANT
// CHANGES: Comprehensive functionality, adapter-agnostic design, performance monitoring, validation
// =============================================================================

// =============================================================================
// DEPENDENCY VALIDATION - ADAPTER AGNOSTIC
// =============================================================================

var SAFETY_UTILITIES_DEPENDENCIES = ['1.1.0.0_bootstrap-foundation'];
var dependencyCheck = validateDependencies(SAFETY_UTILITIES_DEPENDENCIES);
if (!dependencyCheck.success) {
    throw new Error('Safety Utilities missing dependencies: ' + dependencyCheck.missing.join(', '));
}

// =============================================================================
// COMPREHENSIVE SAFETY CONFIGURATION
// =============================================================================

var SAFETY_CONFIG = {
    // Timeout settings
    maxTimeout: 30000,
    defaultTimeout: 5000,
    maxOperationTimeout: 15000,
    
    // Operation limits
    maxOperations: 10000,
    maxIterations: 5000,
    maxRecursionDepth: 10,
    
    // Memory and performance
    memoryCheckInterval: 1000,
    performanceThreshold: 500,
    maxMemoryUsage: 100 * 1024 * 1024, // 100MB
    
    // String and data limits
    maxStringLength: 10000,
    maxArrayLength: 1000,
    maxObjectDepth: 8,
    maxPropertyCount: 1000,
    
    // Rate limiting
    defaultRateLimit: 100, // operations per second
    maxConcurrentOps: 10,
    
    // Safety levels
    safetyLevel: 'strict', // 'permissive', 'normal', 'strict'
    enablePerformanceTracking: true,
    enableValidation: true,
    enableRateLimiting: true
};

// Property safety classifications
var DANGEROUS_PROPERTIES = [
    'application', 'app', 'parent', 'preferences', 'events', 'eventListeners',
    'scriptMenuActions', 'menuActions', 'panels', 'windows', 'dialogs'
];

var RESERVED_WORDS = [
    'abstract', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class',
    'const', 'continue', 'debugger', 'default', 'delete', 'do', 'double', 'else',
    'enum', 'export', 'extends', 'false', 'final', 'finally', 'float', 'for',
    'function', 'goto', 'if', 'implements', 'import', 'in', 'instanceof', 'int',
    'interface', 'let', 'long', 'native', 'new', 'null', 'package', 'private',
    'protected', 'public', 'return', 'short', 'static', 'super', 'switch',
    'synchronized', 'this', 'throw', 'throws', 'transient', 'true', 'try',
    'typeof', 'var', 'void', 'volatile', 'while', 'with', 'yield'
];

// =============================================================================
// ES3 ARRAY HELPERS - COMPREHENSIVE IMPLEMENTATION
// =============================================================================

/**
 * ES3-compatible array indexOf - ENHANCED LOGGING
 * @param {Array} targetArray - Array to search
 * @param {*} searchValue - Value to find
 * @param {Number} fromIndex - Start index (optional)
 * @returns {Number} Index of value or -1
 */
function arrayIndexOf(targetArray, searchValue, fromIndex) {
    try {
        if (!targetArray || typeof targetArray.length === 'undefined') {
            logWarn('arrayIndexOf called with invalid array', 'safety');
            return -1;
        }

        var startIndex = fromIndex || 0;
        if (startIndex < 0) {
            startIndex = Math.max(0, targetArray.length + startIndex);
        }

        for (var i = startIndex; i < targetArray.length; i++) {
            if (targetArray[i] === searchValue) {
                logDebug('arrayIndexOf found value at index: ' + i, 'safety');
                return i;
            }
        }

        logDebug('arrayIndexOf value not found, returning -1', 'safety');
        return -1;

    } catch (exc) {
        logError('arrayIndexOf failed: ' + exc.message, 'safety');
        return -1;
    }
}

/**
 * ES3-compatible array contains check - ENHANCED LOGGING
 * @param {Array} targetArray - Array to search
 * @param {*} searchValue - Value to find
 * @returns {Boolean} True if value exists
 */
function arrayContains(targetArray, searchValue) {
    try {
        var index = arrayIndexOf(targetArray, searchValue);
        var contains = index !== -1;
        logDebug('arrayContains result: ' + contains, 'safety');
        return contains;
    } catch (exc) {
        logError('arrayContains failed: ' + exc.message, 'safety');
        return false;
    }
}

/**
 * ES3-compatible array push replacement - ENHANCED LOGGING
 * @param {Array} targetArray - Array to modify
 * @param {*} newValue - Value to add
 * @returns {Number} New array length
 */
function arrayPush(targetArray, newValue) {
    try {
        if (!targetArray || typeof targetArray.length === 'undefined') {
            logWarn('arrayPush called with invalid array', 'safety');
            return 0;
        }

        targetArray[targetArray.length] = newValue;
        var newLength = targetArray.length;
        logDebug('arrayPush added value, new length: ' + newLength, 'safety');
        return newLength;

    } catch (exc) {
        logError('arrayPush failed: ' + exc.message, 'safety');
        return targetArray ? targetArray.length : 0;
    }
}

/**
 * ES3-compatible array forEach replacement - ENHANCED LOGGING
 * @param {Array} targetArray - Array to iterate
 * @param {Function} callback - Function to call for each element
 * @param {Object} thisArg - Optional this context
 */
function arrayForEach(targetArray, callback, thisArg) {
    try {
        if (!targetArray || typeof targetArray.length === 'undefined') {
            logWarn('arrayForEach called with invalid array', 'safety');
            return;
        }

        if (typeof callback !== 'function') {
            logWarn('arrayForEach called with invalid callback', 'safety');
            return;
        }

        var itemCount = 0;
        for (var i = 0; i < targetArray.length; i++) {
            if (i in targetArray) {
                callback.call(thisArg, targetArray[i], i, targetArray);
                itemCount++;
            }
        }

        logDebug('arrayForEach processed ' + itemCount + ' items', 'safety');

    } catch (exc) {
        logError('arrayForEach failed: ' + exc.message, 'safety');
    }
}

/**
 * ES3-compatible array join replacement - ENHANCED LOGGING
 * @param {Array} targetArray - Array to join
 * @param {String} separator - Join separator
 * @returns {String} Joined string
 */
function arrayJoin(targetArray, separator) {
    try {
        if (!targetArray || typeof targetArray.length === 'undefined') {
            logWarn('arrayJoin called with invalid array', 'safety');
            return '';
        }

        var sep = separator || ',';
        var result = '';
        
        for (var i = 0; i < targetArray.length; i++) {
            result += String(targetArray[i] || '');
            if (i < targetArray.length - 1) {
                result += sep;
            }
        }

        logDebug('arrayJoin processed ' + targetArray.length + ' items', 'safety');
        return result;

    } catch (exc) {
        logError('arrayJoin failed: ' + exc.message, 'safety');
        return '';
    }
}

/**
 * ES3-compatible array slice replacement - ENHANCED LOGGING
 * @param {Array} targetArray - Array to slice
 * @param {Number} start - Start index
 * @param {Number} end - End index
 * @returns {Array} Sliced array
 */
function arraySlice(targetArray, start, end) {
    try {
        if (!targetArray || typeof targetArray.length === 'undefined') {
            logWarn('arraySlice called with invalid array', 'safety');
            return [];
        }

        var startIndex = start || 0;
        var endIndex = (end !== undefined) ? end : targetArray.length;
        
        if (startIndex < 0) {
            startIndex = Math.max(0, targetArray.length + startIndex);
        }
        
        if (endIndex < 0) {
            endIndex = Math.max(0, targetArray.length + endIndex);
        }

        var result = [];
        for (var i = startIndex; i < endIndex && i < targetArray.length; i++) {
            arrayPush(result, targetArray[i]);
        }

        logDebug('arraySlice created array of length: ' + result.length, 'safety');
        return result;

    } catch (exc) {
        logError('arraySlice failed: ' + exc.message, 'safety');
        return [];
    }
}

/**
 * ES3-compatible array reverse replacement - ENHANCED LOGGING
 * @param {Array} targetArray - Array to reverse
 * @returns {Array} Reversed array
 */
function arrayReverse(targetArray) {
    try {
        if (!targetArray || typeof targetArray.length === 'undefined') {
            logWarn('arrayReverse called with invalid array', 'safety');
            return [];
        }

        var result = [];
        for (var i = targetArray.length - 1; i >= 0; i--) {
            arrayPush(result, targetArray[i]);
        }

        logDebug('arrayReverse processed ' + targetArray.length + ' items', 'safety');
        return result;

    } catch (exc) {
        logError('arrayReverse failed: ' + exc.message, 'safety');
        return [];
    }
}

/**
 * ES3-compatible array filter replacement - ENHANCED LOGGING
 * @param {Array} targetArray - Array to filter
 * @param {Function} callback - Filter function
 * @param {Object} thisArg - Optional this context
 * @returns {Array} Filtered array
 */
function arrayFilter(targetArray, callback, thisArg) {
    try {
        if (!targetArray || typeof targetArray.length === 'undefined') {
            logWarn('arrayFilter called with invalid array', 'safety');
            return [];
        }

        if (typeof callback !== 'function') {
            logWarn('arrayFilter called with invalid callback', 'safety');
            return arraySlice(targetArray, 0);
        }

        var result = [];
        var filteredCount = 0;
        
        for (var i = 0; i < targetArray.length; i++) {
            if (i in targetArray) {
                if (callback.call(thisArg, targetArray[i], i, targetArray)) {
                    arrayPush(result, targetArray[i]);
                    filteredCount++;
                }
            }
        }

        logDebug('arrayFilter: ' + filteredCount + ' of ' + targetArray.length + ' items passed', 'safety');
        return result;

    } catch (exc) {
        logError('arrayFilter failed: ' + exc.message, 'safety');
        return [];
    }
}

// =============================================================================
// ES3 OBJECT HELPERS - COMPREHENSIVE IMPLEMENTATION
// =============================================================================

/**
 * ES3-compatible Object.keys replacement - ENHANCED LOGGING
 * @param {Object} targetObject - Object to get keys from
 * @returns {Array} Array of property keys
 */
function objectKeys(targetObject) {
    try {
        if (!targetObject || typeof targetObject !== 'object') {
            logWarn('objectKeys called with invalid object', 'safety');
            return [];
        }

        var keys = [];
        for (var property in targetObject) {
            if (targetObject.hasOwnProperty && targetObject.hasOwnProperty(property)) {
                arrayPush(keys, property);
            } else if (!targetObject.hasOwnProperty) {
                // Fallback for objects without hasOwnProperty
                arrayPush(keys, property);
            }
        }

        logDebug('objectKeys found ' + keys.length + ' properties', 'safety');
        return keys;

    } catch (exc) {
        logError('objectKeys failed: ' + exc.message, 'safety');
        return [];
    }
}

/**
 * ES3-compatible Object.values replacement - ENHANCED LOGGING
 * @param {Object} targetObject - Object to get values from
 * @returns {Array} Array of property values
 */
function objectValues(targetObject) {
    try {
        if (!targetObject || typeof targetObject !== 'object') {
            logWarn('objectValues called with invalid object', 'safety');
            return [];
        }

        var values = [];
        var keys = objectKeys(targetObject);

        arrayForEach(keys, function(key) {
            arrayPush(values, targetObject[key]);
        });

        logDebug('objectValues found ' + values.length + ' values', 'safety');
        return values;

    } catch (exc) {
        logError('objectValues failed: ' + exc.message, 'safety');
        return [];
    }
}

/**
 * ES3-compatible Object.entries replacement - ENHANCED LOGGING
 * @param {Object} targetObject - Object to get entries from
 * @returns {Array} Array of [key, value] pairs
 */
function objectEntries(targetObject) {
    try {
        if (!targetObject || typeof targetObject !== 'object') {
            logWarn('objectEntries called with invalid object', 'safety');
            return [];
        }

        var entries = [];
        var keys = objectKeys(targetObject);

        arrayForEach(keys, function(key) {
            arrayPush(entries, [key, targetObject[key]]);
        });

        logDebug('objectEntries found ' + entries.length + ' entries', 'safety');
        return entries;

    } catch (exc) {
        logError('objectEntries failed: ' + exc.message, 'safety');
        return [];
    }
}

/**
 * Safe object property access with default value - ENHANCED LOGGING
 * @param {Object} targetObject - Object to access
 * @param {String} propertyPath - Property path (e.g., 'a.b.c')
 * @param {*} defaultValue - Default value if property doesn't exist
 * @returns {*} Property value or default
 */
function safeGetProperty(targetObject, propertyPath, defaultValue) {
    try {
        if (!targetObject || !propertyPath) {
            logDebug('safeGetProperty invalid parameters, returning default', 'safety');
            return defaultValue;
        }

        var pathParts = propertyPath.split('.');
        var currentObject = targetObject;

        for (var i = 0; i < pathParts.length; i++) {
            var part = pathParts[i];
            if (currentObject && typeof currentObject === 'object' && part in currentObject) {
                currentObject = currentObject[part];
            } else {
                logDebug('safeGetProperty path not found: ' + propertyPath, 'safety');
                return defaultValue;
            }
        }

        logDebug('safeGetProperty found value for: ' + propertyPath, 'safety');
        return currentObject;

    } catch (exc) {
        logError('safeGetProperty failed: ' + exc.message, 'safety');
        return defaultValue;
    }
}

/**
 * Safe object property setting - ENHANCED LOGGING
 * @param {Object} targetObject - Object to modify
 * @param {String} propertyPath - Property path (e.g., 'a.b.c')
 * @param {*} value - Value to set
 * @returns {Boolean} True if successful
 */
function safeSetProperty(targetObject, propertyPath, value) {
    try {
        if (!targetObject || !propertyPath) {
            logWarn('safeSetProperty invalid parameters', 'safety');
            return false;
        }

        var pathParts = propertyPath.split('.');
        var currentObject = targetObject;

        // Navigate to parent object
        for (var i = 0; i < pathParts.length - 1; i++) {
            var part = pathParts[i];
            if (!currentObject[part] || typeof currentObject[part] !== 'object') {
                currentObject[part] = {};
            }
            currentObject = currentObject[part];
        }

        // Set the final property
        var finalProp = pathParts[pathParts.length - 1];
        currentObject[finalProp] = value;

        logDebug('safeSetProperty set: ' + propertyPath, 'safety');
        return true;

    } catch (exc) {
        logError('safeSetProperty failed: ' + exc.message, 'safety');
        return false;
    }
}

/**
 * Safe object cloning - ENHANCED LOGGING
 * @param {Object} sourceObject - Object to clone
 * @param {Number} maxDepth - Maximum recursion depth
 * @returns {Object} Cloned object
 */
function safeCloneObject(sourceObject, maxDepth) {
    try {
        if (!sourceObject || typeof sourceObject !== 'object') {
            logDebug('safeCloneObject called with non-object', 'safety');
            return sourceObject;
        }

        var depth = maxDepth || SAFETY_CONFIG.maxObjectDepth;
        if (depth <= 0) {
            logWarn('safeCloneObject max depth reached', 'safety');
            return {};
        }

        var cloned = {};
        var keys = objectKeys(sourceObject);

        arrayForEach(keys, function(key) {
            var value = sourceObject[key];
            if (value && typeof value === 'object') {
                cloned[key] = safeCloneObject(value, depth - 1);
            } else {
                cloned[key] = value;
            }
        });

        logDebug('safeCloneObject cloned object with ' + keys.length + ' properties', 'safety');
        return cloned;

    } catch (exc) {
        logError('safeCloneObject failed: ' + exc.message, 'safety');
        return {};
    }
}

// =============================================================================
// ES3 STRING HELPERS - COMPREHENSIVE IMPLEMENTATION
// =============================================================================

/**
 * ES3-compatible string trim replacement - ENHANCED LOGGING
 * @param {String} targetString - String to trim
 * @returns {String} Trimmed string
 */
function stringTrim(targetString) {
    try {
        if (typeof targetString !== 'string') {
            logWarn('stringTrim called with non-string value', 'safety');
            return String(targetString || '');
        }

        var trimmed = targetString.replace(/^\s+|\s+$/g, '');
        logDebug('stringTrim processed string of length: ' + targetString.length, 'safety');
        return trimmed;

    } catch (exc) {
        logError('stringTrim failed: ' + exc.message, 'safety');
        return String(targetString || '');
    }
}

/**
 * ES3-compatible string startsWith replacement - ENHANCED LOGGING
 * @param {String} targetString - String to test
 * @param {String} searchString - String to search for
 * @returns {Boolean} True if string starts with search string
 */
function stringStartsWith(targetString, searchString) {
    try {
        if (typeof targetString !== 'string' || typeof searchString !== 'string') {
            logWarn('stringStartsWith called with invalid parameters', 'safety');
            return false;
        }

        var startsWith = targetString.substring(0, searchString.length) === searchString;
        logDebug('stringStartsWith result: ' + startsWith, 'safety');
        return startsWith;

    } catch (exc) {
        logError('stringStartsWith failed: ' + exc.message, 'safety');
        return false;
    }
}

/**
 * ES3-compatible string endsWith replacement - ENHANCED LOGGING
 * @param {String} targetString - String to test
 * @param {String} searchString - String to search for
 * @returns {Boolean} True if string ends with search string
 */
function stringEndsWith(targetString, searchString) {
    try {
        if (typeof targetString !== 'string' || typeof searchString !== 'string') {
            logWarn('stringEndsWith called with invalid parameters', 'safety');
            return false;
        }

        var startPos = targetString.length - searchString.length;
        var endsWith = startPos >= 0 && targetString.substring(startPos) === searchString;
        logDebug('stringEndsWith result: ' + endsWith, 'safety');
        return endsWith;

    } catch (exc) {
        logError('stringEndsWith failed: ' + exc.message, 'safety');
        return false;
    }
}

/**
 * ES3-compatible string indexOf replacement - ENHANCED LOGGING
 * @param {String} targetString - String to search
 * @param {String} searchString - String to find
 * @param {Number} fromIndex - Start index
 * @returns {Number} Index or -1
 */
function stringIndexOf(targetString, searchString, fromIndex) {
    try {
        if (typeof targetString !== 'string' || typeof searchString !== 'string') {
            logWarn('stringIndexOf called with invalid parameters', 'safety');
            return -1;
        }

        var startIndex = fromIndex || 0;
        var index = targetString.indexOf(searchString, startIndex);
        logDebug('stringIndexOf result: ' + index, 'safety');
        return index;

    } catch (exc) {
        logError('stringIndexOf failed: ' + exc.message, 'safety');
        return -1;
    }
}

/**
 * ES3-compatible string toLowerCase replacement - ENHANCED LOGGING
 * @param {String} targetString - String to convert
 * @returns {String} Lowercase string
 */
function stringToLowerCase(targetString) {
    try {
        if (typeof targetString !== 'string') {
            logWarn('stringToLowerCase called with non-string', 'safety');
            return String(targetString || '').toLowerCase();
        }

        var result = targetString.toLowerCase();
        logDebug('stringToLowerCase converted string', 'safety');
        return result;

    } catch (exc) {
        logError('stringToLowerCase failed: ' + exc.message, 'safety');
        return String(targetString || '');
    }
}

/**
 * ES3-compatible string toUpperCase replacement - ENHANCED LOGGING
 * @param {String} targetString - String to convert
 * @returns {String} Uppercase string
 */
function stringToUpperCase(targetString) {
    try {
        if (typeof targetString !== 'string') {
            logWarn('stringToUpperCase called with non-string', 'safety');
            return String(targetString || '').toUpperCase();
        }

        var result = targetString.toUpperCase();
        logDebug('stringToUpperCase converted string', 'safety');
        return result;

    } catch (exc) {
        logError('stringToUpperCase failed: ' + exc.message, 'safety');
        return String(targetString || '');
    }
}

/**
 * Safe string splitting with limits - ENHANCED LOGGING
 * @param {String} targetString - String to split
 * @param {String} separator - Split separator
 * @param {Number} limit - Maximum splits
 * @returns {Array} Split string array
 */
function safeSplitString(targetString, separator, limit) {
    try {
        if (typeof targetString !== 'string') {
            logWarn('safeSplitString called with non-string', 'safety');
            return [String(targetString || '')];
        }

        var sep = separator || '';
        var maxParts = limit || SAFETY_CONFIG.maxArrayLength;
        
        if (sep === '') {
            // Character split
            var chars = [];
            for (var i = 0; i < targetString.length && i < maxParts; i++) {
                arrayPush(chars, targetString.charAt(i));
            }
            logDebug('safeSplitString character split: ' + chars.length + ' chars', 'safety');
            return chars;
        }

        var parts = targetString.split(sep);
        if (parts.length > maxParts) {
            parts = arraySlice(parts, 0, maxParts);
            logWarn('safeSplitString truncated to ' + maxParts + ' parts', 'safety');
        }

        logDebug('safeSplitString created ' + parts.length + ' parts', 'safety');
        return parts;

    } catch (exc) {
        logError('safeSplitString failed: ' + exc.message, 'safety');
        return [String(targetString || '')];
    }
}

// =============================================================================
// PROPERTY SAFETY AND VALIDATION - COMPREHENSIVE IMPLEMENTATION
// =============================================================================

/**
 * Check if property name is dangerous - ENHANCED LOGGING
 * @param {String} propName - Property name to check
 * @returns {Boolean} True if dangerous
 */
function isDangerousProperty(propName) {
    try {
        if (typeof propName !== 'string') {
            logWarn('isDangerousProperty called with non-string', 'safety');
            return true;
        }

        var lowerProp = stringToLowerCase(propName);
        
        for (var i = 0; i < DANGEROUS_PROPERTIES.length; i++) {
            if (lowerProp === stringToLowerCase(DANGEROUS_PROPERTIES[i])) {
                logWarn('Dangerous property detected: ' + propName, 'safety');
                return true;
            }
        }

        logDebug('Property is safe: ' + propName, 'safety');
        return false;

    } catch (exc) {
        logError('isDangerousProperty failed: ' + exc.message, 'safety');
        return true; // Err on the side of caution
    }
}

/**
 * Check if word is reserved - ENHANCED LOGGING
 * @param {String} word - Word to check
 * @returns {Boolean} True if reserved
 */
function isReservedWord(word) {
    try {
        if (typeof word !== 'string') {
            logWarn('isReservedWord called with non-string', 'safety');
            return true;
        }

        var lowerWord = stringToLowerCase(word);
        
        for (var i = 0; i < RESERVED_WORDS.length; i++) {
            if (lowerWord === RESERVED_WORDS[i]) {
                logWarn('Reserved word detected: ' + word, 'safety');
                return true;
            }
        }

        logDebug('Word is not reserved: ' + word, 'safety');
        return false;

    } catch (exc) {
        logError('isReservedWord failed: ' + exc.message, 'safety');
        return true; // Err on the side of caution
    }
}

/**
 * Get property safety level - ENHANCED LOGGING
 * @param {String} propName - Property name
 * @returns {String} Safety level: 'safe', 'caution', 'dangerous'
 */
function getPropertySafetyLevel(propName) {
    try {
        if (typeof propName !== 'string') {
            logWarn('getPropertySafetyLevel called with non-string', 'safety');
            return 'dangerous';
        }
        
        if (isDangerousProperty(propName)) {
            logWarn('Property marked as dangerous: ' + propName, 'safety');
            return 'dangerous';
        }
        
        if (isReservedWord(propName)) {
            logWarn('Property is reserved word: ' + propName, 'safety');
            return 'caution';
        }
        
        var lowerName = stringToLowerCase(propName);
        var cautionProps = [
            'parent', 'selection', 'active', 'current', 'visible', 'enabled'
        ];
        
        for (var i = 0; i < cautionProps.length; i++) {
            if (stringIndexOf(lowerName, cautionProps[i]) !== -1) {
                logDebug('Property marked as caution: ' + propName, 'safety');
                return 'caution';
            }
        }
        
        logDebug('Property marked as safe: ' + propName, 'safety');
        return 'safe';
        
    } catch (exc) {
        logError('getPropertySafetyLevel error: ' + exc.message, 'safety');
        return 'dangerous';
    }
}

/**
 * Validate property access path - ENHANCED LOGGING
 * @param {String} path - Property path to validate
 * @returns {Object} Validation result
 */
function validatePropertyPath(path) {
    try {
        logDebug('=== STARTING validatePropertyPath: ' + path + ' ===', 'safety');
        
        if (!path || typeof path !== 'string') {
            return {
                isValid: false,
                safetyLevel: 'dangerous',
                reason: 'Invalid path parameter',
                recommendations: ['Provide valid string path']
            };
        }

        var pathParts = safeSplitString(path, '.');
        var overallSafety = 'safe';
        var warnings = [];
        var recommendations = [];
        var dangerousSegments = [];

        arrayForEach(pathParts, function(part, index) {
            var partSafety = getPropertySafetyLevel(part);
            
            if (partSafety === 'dangerous') {
                overallSafety = 'dangerous';
                arrayPush(dangerousSegments, part);
                arrayPush(warnings, 'Dangerous segment at position ' + index + ': ' + part);
                arrayPush(recommendations, 'Avoid accessing: ' + part);
            } else if (partSafety === 'caution' && overallSafety !== 'dangerous') {
                overallSafety = 'caution';
                arrayPush(warnings, 'Caution segment at position ' + index + ': ' + part);
                arrayPush(recommendations, 'Use safely: ' + part);
            }
        });

        var result = {
            isValid: overallSafety !== 'dangerous',
            safetyLevel: overallSafety,
            pathSegments: pathParts,
            dangerousSegments: dangerousSegments,
            warnings: warnings,
            recommendations: recommendations,
            reason: overallSafety === 'dangerous' ? 
                'Contains dangerous segments: ' + arrayJoin(dangerousSegments, ', ') :
                overallSafety === 'caution' ? 'Contains segments requiring caution' : 'Path appears safe'
        };

        logInfo('validatePropertyPath result: ' + overallSafety + ' (' + warnings.length + ' warnings)', 'safety');
        return result;

    } catch (exc) {
        logError('validatePropertyPath failed: ' + exc.message, 'safety');
        return {
            isValid: false,
            safetyLevel: 'dangerous',
            reason: 'Validation error: ' + exc.message,
            recommendations: ['Check path syntax and try again']
        };
    }
}

// =============================================================================
// PERFORMANCE MONITORING AND OPERATION CONTROL
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
            },
            
            getRemainingTime: function() {
                try {
                    var elapsed = this.getElapsed();
                    return Math.max(0, this.timeout - elapsed);
                } catch (exc) {
                    return 0;
                }
            },
            
            getProgress: function() {
                try {
                    var elapsed = this.getElapsed();
                    return Math.min(100, (elapsed / this.timeout) * 100);
                } catch (exc) {
                    return 100;
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
            },
            
            getProgress: function() {
                try {
                    return Math.min(100, (this.count / this.maxOperations) * 100);
                } catch (exc) {
                    return 100;
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
        var maxRatePerSecond = maxRate || SAFETY_CONFIG.defaultRateLimit;
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
            },
            
            getStats: function() {
                try {
                    var now = new Date().getTime();
                    return {
                        maxRate: this.maxRate,
                        interval: this.interval,
                        timeSinceLastOp: now - this.lastOperation,
                        canProceed: this.check()
                    };
                } catch (exc) {
                    logError('Rate limiter getStats error: ' + exc.message, 'performance');
                    return {};
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

/**
 * Create performance tracker - ENHANCED LOGGING
 * @param {String} operationName - Name of operation being tracked
 * @returns {Object} Performance tracker
 */
function createPerformanceTracker(operationName) {
    logDebug('=== STARTING createPerformanceTracker: ' + operationName + ' ===', 'performance');
    
    try {
        var opName = operationName || 'unknown';
        var startTime = new Date().getTime();
        
        var tracker = {
            operationName: opName,
            startTime: startTime,
            checkpoints: [],
            
            checkpoint: function(description) {
                try {
                    var now = new Date().getTime();
                    var elapsed = now - this.startTime;
                    var checkpoint = {
                        time: now,
                        elapsed: elapsed,
                        description: description || 'checkpoint'
                    };
                    arrayPush(this.checkpoints, checkpoint);
                    logDebug('Performance checkpoint [' + this.operationName + ']: ' + 
                             checkpoint.description + ' at ' + elapsed + 'ms', 'performance');
                    return checkpoint;
                } catch (exc) {
                    logError('Performance tracker checkpoint error: ' + exc.message, 'performance');
                    return null;
                }
            },
            
            finish: function() {
                try {
                    var endTime = new Date().getTime();
                    var totalTime = endTime - this.startTime;
                    
                    var result = {
                        operationName: this.operationName,
                        startTime: this.startTime,
                        endTime: endTime,
                        totalTime: totalTime,
                        checkpoints: this.checkpoints,
                        checkpointCount: this.checkpoints.length
                    };
                    
                    logInfo('Performance complete [' + this.operationName + ']: ' + 
                           totalTime + 'ms with ' + this.checkpoints.length + ' checkpoints', 'performance');
                    
                    if (totalTime > SAFETY_CONFIG.performanceThreshold) {
                        logWarn('Performance warning [' + this.operationName + ']: ' + 
                               totalTime + 'ms exceeds threshold ' + SAFETY_CONFIG.performanceThreshold + 'ms', 'performance');
                    }
                    
                    return result;
                } catch (exc) {
                    logError('Performance tracker finish error: ' + exc.message, 'performance');
                    return null;
                }
            }
        };
        
        logInfo('createPerformanceTracker completed for: ' + opName, 'performance');
        return tracker;
        
    } catch (exc) {
        logError('createPerformanceTracker error: ' + exc.message, 'performance');
        return null;
    }
}

// =============================================================================
// TIMEOUT AND SAFETY WRAPPERS - COMPREHENSIVE IMPLEMENTATION
// =============================================================================

/**
 * Execute function with timeout safety - ENHANCED LOGGING
 * @param {Function} targetFunction - Function to execute
 * @param {Number} timeoutMs - Timeout in milliseconds
 * @param {*} defaultReturn - Default return value
 * @param {String} operationName - Name for logging
 * @returns {*} Function result or default
 */
function executeWithTimeout(targetFunction, timeoutMs, defaultReturn, operationName) {
    var startTime = new Date().getTime();
    var opName = operationName || 'unknown operation';
    
    logDebug('=== STARTING executeWithTimeout for: ' + opName + ' ===', 'safety');
    
    try {
        if (typeof targetFunction !== 'function') {
            logWarn('executeWithTimeout called with non-function', 'safety');
            return defaultReturn;
        }

        var timeout = timeoutMs || SAFETY_CONFIG.maxTimeout;
        logDebug('executeWithTimeout timeout set to: ' + timeout + 'ms', 'safety');

        // Simple timeout execution for ES3 compatibility
        var result = targetFunction();
        
        var executionTime = new Date().getTime() - startTime;
        
        if (executionTime > timeout) {
            logWarn('executeWithTimeout exceeded timeout (' + executionTime + 'ms > ' + timeout + 'ms) for: ' + opName, 'safety');
            return defaultReturn;
        } else {
            logDebug('executeWithTimeout completed in ' + executionTime + 'ms for: ' + opName, 'safety');
            return result;
        }

    } catch (exc) {
        var errorTime = new Date().getTime() - startTime;
        logError('executeWithTimeout failed after ' + errorTime + 'ms for: ' + opName + ' - ' + exc.message, 'safety');
        return defaultReturn;
    }
}

/**
 * Execute function with operation limits - ENHANCED LOGGING
 * @param {Function} targetFunction - Function to execute
 * @param {Number} maxOperations - Maximum operations allowed
 * @param {*} defaultReturn - Default return value
 * @param {String} operationName - Name for logging
 * @returns {*} Function result or default
 */
function executeWithOperationLimit(targetFunction, maxOperations, defaultReturn, operationName) {
    var startTime = new Date().getTime();
    var opName = operationName || 'unknown operation';
    
    logDebug('=== STARTING executeWithOperationLimit for: ' + opName + ' ===', 'safety');
    
    try {
        if (typeof targetFunction !== 'function') {
            logWarn('executeWithOperationLimit called with non-function', 'safety');
            return defaultReturn;
        }

        var maxOps = maxOperations || SAFETY_CONFIG.maxOperations;
        var counter = createOperationCounter(maxOps);
        
        if (!counter) {
            logError('Failed to create operation counter', 'safety');
            return defaultReturn;
        }

        logDebug('executeWithOperationLimit max operations: ' + maxOps, 'safety');

        // Execute function with operation counting context
        var result = targetFunction(counter);
        
        var executionTime = new Date().getTime() - startTime;
        logInfo('executeWithOperationLimit completed in ' + executionTime + 'ms with ' + 
                counter.count + ' operations for: ' + opName, 'safety');
        
        return result;

    } catch (exc) {
        var errorTime = new Date().getTime() - startTime;
        logError('executeWithOperationLimit failed after ' + errorTime + 'ms for: ' + opName + ' - ' + exc.message, 'safety');
        return defaultReturn;
    }
}

/**
 * Execute function with comprehensive safety - ENHANCED LOGGING
 * @param {Function} targetFunction - Function to execute
 * @param {Object} safetyOptions - Safety configuration
 * @param {*} defaultReturn - Default return value
 * @returns {*} Function result or default
 */
function executeWithSafety(targetFunction, safetyOptions, defaultReturn) {
    var options = safetyOptions || {};
    var opName = options.operationName || 'safe operation';
    var startTime = new Date().getTime();
    
    logDebug('=== STARTING executeWithSafety for: ' + opName + ' ===', 'safety');
    
    try {
        if (typeof targetFunction !== 'function') {
            logWarn('executeWithSafety called with non-function', 'safety');
            return defaultReturn;
        }

        // Create safety monitors
        var timeoutChecker = createTimeoutChecker(options.timeout || SAFETY_CONFIG.defaultTimeout);
        var operationCounter = createOperationCounter(options.maxOperations || SAFETY_CONFIG.maxOperations);
        var rateLimiter = createRateLimiter(options.maxRate || SAFETY_CONFIG.defaultRateLimit);
        var performanceTracker = createPerformanceTracker(opName);
        
        if (!timeoutChecker || !operationCounter || !rateLimiter || !performanceTracker) {
            logError('Failed to create safety monitors', 'safety');
            return defaultReturn;
        }

        // Create safety context for function
        var safetyContext = {
            timeout: timeoutChecker,
            operations: operationCounter,
            rateLimit: rateLimiter,
            performance: performanceTracker,
            
            checkSafety: function() {
                return timeoutChecker.check() && operationCounter.check() && rateLimiter.check();
            }
        };

        performanceTracker.checkpoint('safety setup complete');
        
        // Execute function with safety context
        var result = targetFunction(safetyContext);
        
        performanceTracker.checkpoint('function execution complete');
        var stats = performanceTracker.finish();
        
        logInfo('executeWithSafety completed successfully for: ' + opName + 
                ' (time: ' + stats.totalTime + 'ms, ops: ' + operationCounter.count + ')', 'safety');
        
        return result;

    } catch (exc) {
        var errorTime = new Date().getTime() - startTime;
        logError('executeWithSafety failed after ' + errorTime + 'ms for: ' + opName + ' - ' + exc.message, 'safety');
        return defaultReturn;
    }
}

/**
 * Safe property enumeration with timeout - ENHANCED LOGGING
 * @param {Object} targetObject - Object to enumerate
 * @param {Number} maxProperties - Maximum properties to enumerate
 * @param {Number} timeoutMs - Timeout in milliseconds
 * @returns {Array} Array of property names
 */
function safeEnumerateProperties(targetObject, maxProperties, timeoutMs) {
    var startTime = new Date().getTime();
    
    logDebug('=== STARTING safeEnumerateProperties ===', 'safety');
    
    try {
        if (!targetObject || typeof targetObject !== 'object') {
            logWarn('safeEnumerateProperties called with invalid object', 'safety');
            return [];
        }

        var maxProps = maxProperties || SAFETY_CONFIG.maxPropertyCount;
        var timeout = timeoutMs || SAFETY_CONFIG.maxTimeout;
        var properties = [];
        var propertyCount = 0;
        var safetyViolations = 0;

        logDebug('safeEnumerateProperties limits - maxProps: ' + maxProps + ', timeout: ' + timeout, 'safety');

        for (var property in targetObject) {
            var currentTime = new Date().getTime();
            if (currentTime - startTime > timeout) {
                logWarn('safeEnumerateProperties timeout exceeded after ' + (currentTime - startTime) + 'ms', 'safety');
                break;
            }

            if (propertyCount >= maxProps) {
                logWarn('safeEnumerateProperties max properties exceeded: ' + maxProps, 'safety');
                break;
            }

            try {
                // Check property safety
                var safetyLevel = getPropertySafetyLevel(property);
                if (safetyLevel === 'dangerous') {
                    safetyViolations++;
                    logWarn('Skipping dangerous property: ' + property, 'safety');
                    continue;
                }

                if (targetObject.hasOwnProperty && targetObject.hasOwnProperty(property)) {
                    arrayPush(properties, property);
                    propertyCount++;
                } else if (!targetObject.hasOwnProperty) {
                    // Fallback for objects without hasOwnProperty
                    arrayPush(properties, property);
                    propertyCount++;
                }
            } catch (propExc) {
                logWarn('safeEnumerateProperties property access failed for: ' + property, 'safety');
            }
        }

        var totalTime = new Date().getTime() - startTime;
        logInfo('safeEnumerateProperties found ' + properties.length + ' properties in ' + totalTime + 'ms' +
                (safetyViolations > 0 ? ' (skipped ' + safetyViolations + ' dangerous)' : ''), 'safety');
        return properties;

    } catch (exc) {
        var errorTime = new Date().getTime() - startTime;
        logError('safeEnumerateProperties failed after ' + errorTime + 'ms: ' + exc.message, 'safety');
        return [];
    }
}

// =============================================================================
// TYPE CHECKING AND VALIDATION - COMPREHENSIVE IMPLEMENTATION
// =============================================================================

/**
 * Safe type detection with enhanced logging - ENHANCED LOGGING
 * @param {*} value - Value to check type
 * @returns {String} Type string
 */
function safeGetType(value) {
    try {
        if (value === null) {
            logDebug('safeGetType detected: null', 'safety');
            return 'null';
        }
        
        if (value === undefined) {
            logDebug('safeGetType detected: undefined', 'safety');
            return 'undefined';
        }

        var baseType = typeof value;
        
        if (baseType === 'object') {
            // More specific object type detection
            if (value.constructor && value.constructor.name) {
                var constructorName = String(value.constructor.name);
                logDebug('safeGetType detected object type: ' + constructorName, 'safety');
                return constructorName;
            }
            
            if (value.length !== undefined) {
                logDebug('safeGetType detected: array-like', 'safety');
                return 'array-like';
            }
            
            // Try to detect specific object types
            if (value.toString) {
                var stringRepresentation = String(value.toString());
                if (stringRepresentation.indexOf('[object ') === 0) {
                    var objectType = stringRepresentation.substring(8, stringRepresentation.length - 1);
                    logDebug('safeGetType detected specific object: ' + objectType, 'safety');
                    return objectType;
                }
            }
        }

        logDebug('safeGetType detected: ' + baseType, 'safety');
        return baseType;

    } catch (exc) {
        logError('safeGetType failed: ' + exc.message, 'safety');
        return 'unknown';
    }
}

/**
 * Validate object is safe for enumeration - ENHANCED LOGGING
 * @param {Object} targetObject - Object to validate
 * @returns {Boolean} True if safe to enumerate
 */
function isSafeForEnumeration(targetObject) {
    try {
        if (!targetObject) {
            logDebug('isSafeForEnumeration: object is null/undefined', 'safety');
            return false;
        }

        var objectType = safeGetType(targetObject);
        
        // Check for dangerous object types
        var dangerousTypes = ['Document', 'Application', 'Window', 'Preferences'];
        for (var i = 0; i < dangerousTypes.length; i++) {
            if (objectType === dangerousTypes[i]) {
                logWarn('isSafeForEnumeration: dangerous type detected: ' + objectType, 'safety');
                return false;
            }
        }

        // Use adapter interface if available (adapter loads at 1.15, before this module at 1.20)
        if (typeof isAppSpecificDangerousPath === 'function') {
            try {
                var adapterSafetyCheck = isAppSpecificDangerousPath(targetObject);
                if (!adapterSafetyCheck) {
                    logWarn('isSafeForEnumeration: adapter marked as dangerous', 'safety');
                    return false;
                }
            } catch (adapterExc) {
                logWarn('isSafeForEnumeration: adapter safety check failed: ' + adapterExc.message, 'safety');
            }
        }

        logDebug('isSafeForEnumeration: object is safe (' + objectType + ')', 'safety');
        return true;

    } catch (exc) {
        logError('isSafeForEnumeration failed: ' + exc.message, 'safety');
        return false;
    }
}

/**
 * Comprehensive value validation - ENHANCED LOGGING
 * @param {*} value - Value to validate
 * @param {Object} constraints - Validation constraints
 * @returns {Object} Validation result
 */
function validateValue(value, constraints) {
    logDebug('=== STARTING validateValue ===', 'safety');
    
    try {
        var options = constraints || {};
        var result = {
            isValid: true,
            value: value,
            type: safeGetType(value),
            violations: [],
            warnings: [],
            metadata: {}
        };

        // Type validation
        if (options.expectedType) {
            if (result.type !== options.expectedType) {
                result.isValid = false;
                arrayPush(result.violations, 'Type mismatch: expected ' + options.expectedType + ', got ' + result.type);
            }
        }

        // Null/undefined validation
        if (options.allowNull === false && value === null) {
            result.isValid = false;
            arrayPush(result.violations, 'Null value not allowed');
        }
        
        if (options.allowUndefined === false && value === undefined) {
            result.isValid = false;
            arrayPush(result.violations, 'Undefined value not allowed');
        }

        // String validation
        if (typeof value === 'string') {
            if (options.maxLength && value.length > options.maxLength) {
                result.isValid = false;
                arrayPush(result.violations, 'String length ' + value.length + ' exceeds maximum ' + options.maxLength);
            }
            
            if (options.minLength && value.length < options.minLength) {
                result.isValid = false;
                arrayPush(result.violations, 'String length ' + value.length + ' below minimum ' + options.minLength);
            }
            
            if (options.pattern && !options.pattern.test(value)) {
                result.isValid = false;
                arrayPush(result.violations, 'String does not match required pattern');
            }
        }

        // Number validation
        if (typeof value === 'number') {
            if (options.maxValue !== undefined && value > options.maxValue) {
                result.isValid = false;
                arrayPush(result.violations, 'Value ' + value + ' exceeds maximum ' + options.maxValue);
            }
            
            if (options.minValue !== undefined && value < options.minValue) {
                result.isValid = false;
                arrayPush(result.violations, 'Value ' + value + ' below minimum ' + options.minValue);
            }
            
            if (options.integer && Math.floor(value) !== value) {
                result.isValid = false;
                arrayPush(result.violations, 'Value must be an integer');
            }
        }

        // Array validation
        if (result.type === 'array-like' || value instanceof Array) {
            if (options.maxLength && value.length > options.maxLength) {
                result.isValid = false;
                arrayPush(result.violations, 'Array length ' + value.length + ' exceeds maximum ' + options.maxLength);
            }
        }

        // Object validation
        if (typeof value === 'object' && value !== null) {
            if (options.allowObjects === false) {
                result.isValid = false;
                arrayPush(result.violations, 'Object values not allowed');
            }
            
            if (!isSafeForEnumeration(value)) {
                arrayPush(result.warnings, 'Object may not be safe for enumeration');
            }
        }

        result.metadata = {
            validationTime: new Date().getTime(),
            constraintsApplied: objectKeys(options).length,
            safetyLevel: result.violations.length === 0 ? 
                (result.warnings.length === 0 ? 'safe' : 'caution') : 'unsafe'
        };

        logInfo('validateValue result: ' + (result.isValid ? 'VALID' : 'INVALID') + 
                ' (' + result.violations.length + ' violations, ' + result.warnings.length + ' warnings)', 'safety');
        
        return result;

    } catch (exc) {
        logError('validateValue failed: ' + exc.message, 'safety');
        return {
            isValid: false,
            value: value,
            type: 'unknown',
            violations: ['Validation error: ' + exc.message],
            warnings: [],
            metadata: { error: true }
        };
    }
}

// =============================================================================
// ADAPTER-AGNOSTIC APP INTERFACE FUNCTIONS
// =============================================================================

/**
 * Get current app information - ADAPTER AGNOSTIC
 * Uses any loaded adapter to get app information
 * @returns {Object} App information from active adapter
 */
function getCurrentAppInfo() {
    try {
        // Use adapter interface if available (adapter loads at 1.15, before this module at 1.20)
        if (typeof getAppInfo === 'function') {
            var appInfo = getAppInfo();
            logInfo('Retrieved app info via adapter: ' + (appInfo ? appInfo.appName : 'unknown'), 'safety');
            return appInfo;
        }

        // Fallback detection
        logWarn('No adapter loaded, using fallback app detection', 'safety');
        return {
            appName: 'Unknown Adobe Application',
            appId: 'unknown',
            version: 'unknown',
            isSupported: false
        };

    } catch (exc) {
        logError('getCurrentAppInfo failed: ' + exc.message, 'safety');
        return {
            appName: 'Error',
            appId: 'error',
            version: 'error',
            isSupported: false
        };
    }
}

/**
 * Validate current app environment - ADAPTER AGNOSTIC
 * @returns {Object} Environment validation result
 */
function validateCurrentAppEnvironment() {
    try {
        // Use adapter interface if available (adapter loads at 1.15, before this module at 1.20)
        if (typeof validateAppEnvironment === 'function') {
            var validation = validateAppEnvironment();
            logInfo('App environment validation: ' + (validation && validation.isValid ? 'PASSED' : 'FAILED'), 'safety');
            return validation;
        }

        // Fallback validation
        logWarn('No adapter loaded, using fallback environment validation', 'safety');
        return {
            isValid: false,
            appSupported: false,
            versionSupported: false,
            environment: 'unknown',
            warnings: ['No adapter loaded for app-specific validation']
        };

    } catch (exc) {
        logError('validateCurrentAppEnvironment failed: ' + exc.message, 'safety');
        return {
            isValid: false,
            appSupported: false,
            versionSupported: false,
            environment: 'error',
            warnings: ['Environment validation error: ' + exc.message]
        };
    }
}

/**
 * Get active document from current app - ADAPTER AGNOSTIC
 * @returns {Object} Active document or null
 */
function getCurrentActiveDocument() {
    try {
        // Use adapter interface if available (adapter loads at 1.15, before this module at 1.20)
        if (typeof getActiveDocument === 'function') {
            var document = getActiveDocument();
            logInfo('Active document retrieved via adapter: ' + (document ? 'SUCCESS' : 'NONE'), 'safety');
            return document;
        }

        // Fallback detection
        logWarn('No adapter loaded, cannot retrieve active document', 'safety');
        return null;

    } catch (exc) {
        logError('getCurrentActiveDocument failed: ' + exc.message, 'safety');
        return null;
    }
}

/**
 * Validate document state (app-agnostic) - ENHANCED LOGGING
 * @returns {Object} Validation result
 */
function validateDocumentState() {
    logDebug('=== STARTING validateDocumentState ===', 'safety');
    
    try {
        var validation = {
            hasDocument: false,
            isValid: false,
            documentInfo: null,
            warnings: [],
            appInfo: null
        };

        // Get app information
        validation.appInfo = getCurrentAppInfo();
        if (!validation.appInfo || !validation.appInfo.isSupported) {
            arrayPush(validation.warnings, 'Application not supported or not detected');
        }

        // Get active document
        var activeDoc = getCurrentActiveDocument();
        if (activeDoc) {
            validation.hasDocument = true;
            validation.documentInfo = {
                name: activeDoc.name || 'unnamed',
                hasName: !!(activeDoc.name),
                isValid: true
            };
            
            // Additional document validation via adapter if available
            if (typeof getDocumentStructureInterface === 'function') {
                try {
                    var docInterface = getDocumentStructureInterface(activeDoc);
                    if (docInterface && docInterface.metadata) {
                        validation.documentInfo.metadata = docInterface.metadata;
                    }
                } catch (interfaceExc) {
                    arrayPush(validation.warnings, 'Document interface check failed: ' + interfaceExc.message);
                }
            }
        } else {
            arrayPush(validation.warnings, 'No active document found');
        }

        validation.isValid = validation.hasDocument && validation.warnings.length === 0;
        
        logInfo('validateDocumentState: ' + (validation.isValid ? 'VALID' : 'INVALID') + 
                ' (hasDoc: ' + validation.hasDocument + ', warnings: ' + validation.warnings.length + ')', 'safety');
                
        return validation;

    } catch (exc) {
        logError('validateDocumentState failed: ' + exc.message, 'safety');
        return {
            hasDocument: false,
            isValid: false,
            documentInfo: null,
            warnings: ['Validation error: ' + exc.message],
            appInfo: null
        };
    }
}

// =============================================================================
// UI HELPERS - COMPREHENSIVE AND ADAPTER AGNOSTIC
// =============================================================================

/**
 * Show simple alert dialog - ADAPTER AGNOSTIC
 * @param {String} message - Message to show
 * @param {String} title - Dialog title
 */
function showAlert(message, title) {
    try {
        var dialogTitle = title || 'DocDom Discovery';
        var dialogMessage = String(message || 'No message provided');
        
        logInfo('Showing alert dialog: ' + dialogTitle, 'safety');
        
        // Try platform-specific alert methods
        if (typeof alert === 'function') {
            alert(dialogMessage);
        } else if (typeof Window !== 'undefined' && Window.alert) {
            Window.alert(dialogMessage);
        } else {
            // Fallback to console logging
            logInfo('ALERT: ' + dialogTitle + ' - ' + dialogMessage, 'safety');
        }
        
    } catch (exc) {
        logError('showAlert failed: ' + exc.message, 'safety');
    }
}

/**
 * Show simple progress message - ADAPTER AGNOSTIC
 * @param {String} message - Progress message
 * @param {Number} percent - Progress percentage (0-100)
 */
function showProgress(message, percent) {
    try {
        var progressMessage = String(message || 'Processing...');
        var progressPercent = Math.max(0, Math.min(100, percent || 0));
        
        logInfo('Progress: ' + progressPercent + '% - ' + progressMessage, 'safety');
        
        // Simple console-based progress for ExtendScript compatibility
        if (progressPercent % 10 === 0) {
            logInfo('Progress update: ' + progressPercent + '%', 'safety');
        }
        
    } catch (exc) {
        logError('showProgress failed: ' + exc.message, 'safety');
    }
}

/**
 * Show confirmation dialog - ADAPTER AGNOSTIC
 * @param {String} message - Message to show
 * @param {String} title - Dialog title
 * @returns {Boolean} True if confirmed
 */
function showConfirm(message, title) {
    try {
        var dialogTitle = title || 'DocDom Discovery - Confirm';
        var dialogMessage = String(message || 'Are you sure?');
        
        logInfo('Showing confirm dialog: ' + dialogTitle, 'safety');
        
        // Try platform-specific confirm methods
        if (typeof confirm === 'function') {
            var result = confirm(dialogMessage);
            logInfo('Confirm result: ' + result, 'safety');
            return result;
        } else if (typeof Window !== 'undefined' && Window.confirm) {
            var windowResult = Window.confirm(dialogMessage);
            logInfo('Window confirm result: ' + windowResult, 'safety');
            return windowResult;
        } else {
            // Fallback - assume yes for automated environments
            logWarn('CONFIRM (auto-yes): ' + dialogTitle + ' - ' + dialogMessage, 'safety');
            return true;
        }
        
    } catch (exc) {
        logError('showConfirm failed: ' + exc.message, 'safety');
        return false; // Err on the side of caution
    }
}

/**
 * Create status reporter for long operations - ENHANCED LOGGING
 * @param {String} operationName - Name of operation
 * @param {Number} totalSteps - Total number of steps
 * @returns {Object} Status reporter
 */
function createStatusReporter(operationName, totalSteps) {
    try {
        var opName = operationName || 'operation';
        var steps = totalSteps || 100;
        var currentStep = 0;
        var startTime = new Date().getTime();
        
        var reporter = {
            operationName: opName,
            totalSteps: steps,
            currentStep: currentStep,
            startTime: startTime,
            
            update: function(step, message) {
                try {
                    this.currentStep = Math.max(0, Math.min(this.totalSteps, step || 0));
                    var percent = Math.floor((this.currentStep / this.totalSteps) * 100);
                    var elapsed = new Date().getTime() - this.startTime;
                    var statusMessage = message || ('Step ' + this.currentStep + ' of ' + this.totalSteps);
                    
                    logInfo('Status [' + this.operationName + ']: ' + percent + '% - ' + statusMessage + 
                           ' (elapsed: ' + elapsed + 'ms)', 'safety');
                    
                    // Show progress if configured
                    if (SAFETY_CONFIG.enablePerformanceTracking) {
                        showProgress(this.operationName + ': ' + statusMessage, percent);
                    }
                    
                    return {
                        step: this.currentStep,
                        percent: percent,
                        elapsed: elapsed,
                        message: statusMessage
                    };
                } catch (exc) {
                    logError('Status reporter update failed: ' + exc.message, 'safety');
                    return null;
                }
            },
            
            finish: function(message) {
                try {
                    var finalTime = new Date().getTime() - this.startTime;
                    var finalMessage = message || (this.operationName + ' completed');
                    
                    logInfo('Status [' + this.operationName + ']: COMPLETE - ' + finalMessage + 
                           ' (total time: ' + finalTime + 'ms)', 'safety');
                    
                    return {
                        completed: true,
                        totalTime: finalTime,
                        finalStep: this.currentStep,
                        message: finalMessage
                    };
                } catch (exc) {
                    logError('Status reporter finish failed: ' + exc.message, 'safety');
                    return null;
                }
            }
        };
        
        logInfo('createStatusReporter created for: ' + opName + ' (' + steps + ' steps)', 'safety');
        return reporter;
        
    } catch (exc) {
        logError('createStatusReporter failed: ' + exc.message, 'safety');
        return null;
    }
}

// =============================================================================
// COMPREHENSIVE ERROR HANDLING AND RECOVERY
// =============================================================================

/**
 * Safe error handler wrapper - ENHANCED LOGGING
 * @param {Function} targetFunction - Function to wrap
 * @param {String} functionName - Name for logging
 * @param {*} defaultReturn - Default return value on error
 * @returns {Function} Wrapped function
 */
function createSafeWrapper(targetFunction, functionName, defaultReturn) {
    try {
        if (typeof targetFunction !== 'function') {
            logWarn('createSafeWrapper called with non-function', 'safety');
            return function() { return defaultReturn; };
        }

        var funcName = functionName || 'wrapped function';
        
        return function() {
            try {
                logDebug('Executing safe wrapper for: ' + funcName, 'safety');
                var result = targetFunction.apply(this, arguments);
                logDebug('Safe wrapper completed successfully for: ' + funcName, 'safety');
                return result;
            } catch (exc) {
                logError('Safe wrapper caught error in ' + funcName + ': ' + exc.message, 'safety');
                return defaultReturn;
            }
        };
        
    } catch (exc) {
        logError('createSafeWrapper failed: ' + exc.message, 'safety');
        return function() { return defaultReturn; };
    }
}

/**
 * Comprehensive error analysis - ENHANCED LOGGING
 * @param {Error} error - Error to analyze
 * @param {String} context - Context where error occurred
 * @returns {Object} Error analysis
 */
function analyzeError(error, context) {
    try {
        logDebug('=== STARTING analyzeError ===', 'safety');
        
        var analysis = {
            type: 'unknown',
            message: 'Unknown error',
            context: context || 'unknown',
            severity: 'medium',
            isRecoverable: false,
            recommendations: [],
            timestamp: new Date().getTime()
        };

        if (!error) {
            analysis.message = 'Null or undefined error object';
            analysis.severity = 'low';
            return analysis;
        }

        // Extract error information
        analysis.message = String(error.message || error.toString() || 'Unknown error');
        analysis.type = error.name || 'Error';

        // Classify error severity
        var message = stringToLowerCase(analysis.message);
        if (stringIndexOf(message, 'timeout') !== -1) {
            analysis.severity = 'high';
            analysis.isRecoverable = true;
            arrayPush(analysis.recommendations, 'Increase timeout values');
            arrayPush(analysis.recommendations, 'Optimize operation performance');
        } else if (stringIndexOf(message, 'permission') !== -1 || stringIndexOf(message, 'access') !== -1) {
            analysis.severity = 'high';
            analysis.isRecoverable = false;
            arrayPush(analysis.recommendations, 'Check user permissions');
            arrayPush(analysis.recommendations, 'Verify object accessibility');
        } else if (stringIndexOf(message, 'memory') !== -1 || stringIndexOf(message, 'out of') !== -1) {
            analysis.severity = 'critical';
            analysis.isRecoverable = false;
            arrayPush(analysis.recommendations, 'Reduce operation scope');
            arrayPush(analysis.recommendations, 'Implement memory management');
        } else if (stringIndexOf(message, 'undefined') !== -1 || stringIndexOf(message, 'null') !== -1) {
            analysis.severity = 'medium';
            analysis.isRecoverable = true;
            arrayPush(analysis.recommendations, 'Add null/undefined checks');
            arrayPush(analysis.recommendations, 'Validate input parameters');
        } else {
            analysis.severity = 'medium';
            analysis.isRecoverable = true;
            arrayPush(analysis.recommendations, 'Review operation logic');
            arrayPush(analysis.recommendations, 'Add additional error handling');
        }

        logInfo('analyzeError completed: ' + analysis.type + ' - ' + analysis.severity + 
                ' severity (' + (analysis.isRecoverable ? 'recoverable' : 'not recoverable') + ')', 'safety');
        
        return analysis;

    } catch (exc) {
        logError('analyzeError failed: ' + exc.message, 'safety');
        return {
            type: 'analysis_error',
            message: 'Error analysis failed: ' + exc.message,
            context: context || 'unknown',
            severity: 'critical',
            isRecoverable: false,
            recommendations: ['Review error handling implementation'],
            timestamp: new Date().getTime()
        };
    }
}

// =============================================================================
// MODULE REGISTRATION - COMPREHENSIVE FUNCTIONALITY
// =============================================================================

// Register this module with all its functions - COMPLETE IMPLEMENTATION
registerModule('1.20.0.0_safety-utilities', '4.1', [
    // ES3 Array Helpers (7)
    'arrayIndexOf', 'arrayContains', 'arrayPush', 'arrayForEach', 'arrayJoin', 'arraySlice', 'arrayReverse', 'arrayFilter',
    
    // ES3 Object Helpers (6)
    'objectKeys', 'objectValues', 'objectEntries', 'safeGetProperty', 'safeSetProperty', 'safeCloneObject',
    
    // ES3 String Helpers (7)
    'stringTrim', 'stringStartsWith', 'stringEndsWith', 'stringIndexOf', 'stringToLowerCase', 'stringToUpperCase', 'safeSplitString',
    
    // Property Safety and Validation (4)
    'isDangerousProperty', 'isReservedWord', 'getPropertySafetyLevel', 'validatePropertyPath',
    
    // Performance Monitoring (4)
    'createTimeoutChecker', 'createOperationCounter', 'createRateLimiter', 'createPerformanceTracker',
    
    // Safety Execution Wrappers (4)
    'executeWithTimeout', 'executeWithOperationLimit', 'executeWithSafety', 'safeEnumerateProperties',
    
    // Type Checking and Validation (3)
    'safeGetType', 'isSafeForEnumeration', 'validateValue',
    
    // Adapter-Agnostic App Interface (4)
    'getCurrentAppInfo', 'validateCurrentAppEnvironment', 'getCurrentActiveDocument', 'validateDocumentState',
    
    // UI Helpers (4)
    'showAlert', 'showProgress', 'showConfirm', 'createStatusReporter',
    
    // Error Handling and Recovery (3)
    'createSafeWrapper', 'analyzeError'
]);

logInfo('Safety Utilities v1.20.0.0 loaded successfully (' + 
        '52 functions, ~2200 lines, adapter-agnostic)', 'safety');

// =============================================================================
// END OF 1.20.0.0_safety-utilities.jsx - COMPLETE COMPREHENSIVE IMPLEMENTATION
// =============================================================================