// =============================================================================
// 1.2_safety-utilities.jsx - ES3 HELPER FUNCTIONS AND SAFETY UTILITIES
// InDesign DOM Discovery Builder v3.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: ES3-compatible helper functions and safety utilities
// DEPENDENCIES: ["1.1_bootstrap-foundation.jsx"]
// SIZE: ~750 lines - COMPLETE IMPLEMENTATION
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
        var endIdx = (typeof endIndex !== 'undefined') ? endIndex : targetArray.length;
        
        if (startIdx < 0) startIdx = 0;
        if (endIdx > targetArray.length) endIdx = targetArray.length;
        
        for (var i = startIdx; i < endIdx; i++) {
            result.push(targetArray[i]);
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
            if (i > 0) {
                result += sep;
            }
            result += String(targetArray[i]);
        }
        
        return result;
        
    } catch (exc) {
        return '';
    }
}

/**
 * ES3-compatible Array.push (enhanced safety)
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
 * ES3-compatible Array.pop (enhanced safety)
 * @param {Array} targetArray - Array to modify
 * @returns {*} Popped element or undefined
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

// =============================================================================
// ES3 STRING HELPER FUNCTIONS
// =============================================================================

/**
 * ES3-compatible String.indexOf
 * @param {String} str - Source string
 * @param {String} searchStr - String to find
 * @param {Number} startPos - Starting position
 * @returns {Number} Index or -1 if not found
 */
function stringIndexOf(str, searchStr, startPos) {
    try {
        if (typeof str !== 'string' || typeof searchStr !== 'string') {
            return -1;
        }
        
        var start = startPos || 0;
        if (start < 0) start = 0;
        
        for (var i = start; i <= str.length - searchStr.length; i++) {
            var match = true;
            for (var j = 0; j < searchStr.length; j++) {
                if (str.charAt(i + j) !== searchStr.charAt(j)) {
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
        return -1;
    }
}

/**
 * ES3-compatible String.substring (enhanced safety)
 * @param {String} str - Source string
 * @param {Number} startIndex - Start index
 * @param {Number} endIndex - End index
 * @returns {String} Substring
 */
function stringSubstring(str, startIndex, endIndex) {
    try {
        if (typeof str !== 'string') return '';
        
        var startIdx = startIndex || 0;
        var endIdx = (typeof endIndex !== 'undefined') ? endIndex : str.length;
        
        if (startIdx < 0) startIdx = 0;
        if (endIdx > str.length) endIdx = str.length;
        if (startIdx > endIdx) {
            var temp = startIdx;
            startIdx = endIdx;
            endIdx = temp;
        }
        
        return str.substring(startIdx, endIdx);
        
    } catch (exc) {
        return '';
    }
}

/**
 * ES3-compatible String.charAt
 * @param {String} str - Source string
 * @param {Number} indexValue - Character index
 * @returns {String} Character at index
 */
function stringCharAt(str, indexValue) {
    try {
        if (typeof str !== 'string') return '';
        if (typeof indexValue !== 'number' || indexValue < 0 || indexValue >= str.length) return '';
        
        return str.charAt(indexValue);
        
    } catch (exc) {
        return '';
    }
}

/**
 * ES3-compatible String.split
 * @param {String} str - Source string
 * @param {String} separator - Separator string
 * @returns {Array} Split array
 */
function stringSplit(str, separator) {
    try {
        if (typeof str !== 'string') return [];
        if (typeof separator !== 'string') return [str];
        
        var result = [];
        var current = '';
        var sepLen = separator.length;
        
        if (sepLen === 0) {
            for (var k = 0; k < str.length; k++) {
                result.push(str.charAt(k));
            }
            return result;
        }
        
        for (var i = 0; i < str.length; i++) {
            if (i <= str.length - sepLen && str.substring(i, i + sepLen) === separator) {
                result.push(current);
                current = '';
                i += sepLen - 1;
            } else {
                current += str.charAt(i);
            }
        }
        
        result.push(current);
        return result;
        
    } catch (exc) {
        return [str || ''];
    }
}

/**
 * ES3-compatible String.toLowerCase
 * @param {String} str - Source string
 * @returns {String} Lowercase string
 */
function stringToLowerCase(str) {
    try {
        if (typeof str !== 'string') return '';
        return str.toLowerCase();
    } catch (exc) {
        return str || '';
    }
}

/**
 * ES3-compatible String.toUpperCase
 * @param {String} str - Source string
 * @returns {String} Uppercase string
 */
function stringToUpperCase(str) {
    try {
        if (typeof str !== 'string') return '';
        return str.toUpperCase();
    } catch (exc) {
        return str || '';
    }
}

/**
 * Enhanced string replace with safety
 * @param {String} str - Source string
 * @param {String} searchValue - String to replace
 * @param {String} replaceValue - Replacement string
 * @returns {String} String with replacements
 */
function stringReplace(str, searchValue, replaceValue) {
    try {
        if (typeof str !== 'string') return '';
        if (typeof searchValue !== 'string') return str;
        if (typeof replaceValue !== 'string') replaceValue = '';
        
        var result = '';
        var lastIndex = 0;
        var searchLen = searchValue.length;
        
        if (searchLen === 0) return str;
        
        var index = stringIndexOf(str, searchValue, 0);
        while (index !== -1) {
            result += stringSubstring(str, lastIndex, index) + replaceValue;
            lastIndex = index + searchLen;
            index = stringIndexOf(str, searchValue, lastIndex);
        }
        
        result += stringSubstring(str, lastIndex);
        return result;
        
    } catch (exc) {
        return str || '';
    }
}

// =============================================================================
// ES3 OBJECT HELPER FUNCTIONS
// =============================================================================

/**
 * ES3-compatible Object.hasOwnProperty check
 * @param {Object} obj - Object to check
 * @param {String} prop - Property name
 * @returns {Boolean} True if object has own property
 */
function objectHasOwnProperty(obj, prop) {
    try {
        if (!obj || typeof obj !== 'object') return false;
        return Object.prototype.hasOwnProperty.call(obj, prop);
    } catch (exc) {
        return false;
    }
}

/**
 * Count object properties (own properties only)
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
 * Deep clone object (ES3 compatible)
 * @param {Object} obj - Object to clone
 * @param {Number} maxDepth - Maximum cloning depth
 * @returns {Object} Cloned object
 */
function objectClone(obj, maxDepth) {
    try {
        var depth = maxDepth || 3;
        
        if (depth <= 0) return null;
        if (obj === null || obj === undefined) return obj;
        if (typeof obj !== 'object') return obj;
        
        // Handle arrays
        if (obj instanceof Array) {
            var arrCopy = [];
            for (var i = 0; i < obj.length; i++) {
                arrCopy[i] = objectClone(obj[i], depth - 1);
            }
            return arrCopy;
        }
        
        // Handle objects
        var objCopy = {};
        for (var prop in obj) {
            if (objectHasOwnProperty(obj, prop)) {
                objCopy[prop] = objectClone(obj[prop], depth - 1);
            }
        }
        
        return objCopy;
        
    } catch (exc) {
        return obj;
    }
}

// =============================================================================
// SAFETY AND ERROR HANDLING UTILITIES
// =============================================================================

/**
 * Safe property access with error handling
 * @param {Object} obj - Object to access
 * @param {String} propName - Property name
 * @param {*} defaultValue - Default value if access fails
 * @returns {*} Property value or default
 */
function safePropertyAccess(obj, propName, defaultValue) {
    try {
        if (!obj || typeof obj !== 'object') return defaultValue;
        if (typeof propName !== 'string') return defaultValue;
        
        if (objectHasOwnProperty(obj, propName)) {
            return obj[propName];
        }
        
        return defaultValue;
        
    } catch (exc) {
        return defaultValue;
    }
}

/**
 * Safe function call with error handling
 * @param {Function} func - Function to call
 * @param {Array} args - Arguments array
 * @param {*} defaultValue - Default return value
 * @returns {*} Function result or default
 */
function safeFunctionCall(func, args, defaultValue) {
    try {
        if (typeof func !== 'function') return defaultValue;
        
        var argArray = args || [];
        
        // Use apply if available, otherwise manual call for common cases
        if (func.apply) {
            return func.apply(null, argArray);
        } else {
            // Manual application for common argument counts
            switch (argArray.length) {
                case 0: return func();
                case 1: return func(argArray[0]);
                case 2: return func(argArray[0], argArray[1]);
                case 3: return func(argArray[0], argArray[1], argArray[2]);
                default: return defaultValue;
            }
        }
        
    } catch (exc) {
        return defaultValue;
    }
}

/**
 * Safe type checking
 * @param {*} value - Value to check
 * @returns {String} Safe type string
 */
function safeTypeOf(value) {
    try {
        var type = typeof value;
        
        // Handle special cases
        if (type === 'object') {
            if (value === null) return 'null';
            if (value instanceof Array) return 'array';
            if (value instanceof Date) return 'date';
        }
        
        return type;
        
    } catch (exc) {
        return 'unknown';
    }
}

/**
 * Safe array check
 * @param {*} value - Value to check
 * @returns {Boolean} True if value is array-like
 */
function isArrayLike(value) {
    try {
        if (!value) return false;
        if (value instanceof Array) return true;
        if (typeof value.length === 'number' && value.length >= 0) return true;
        return false;
    } catch (exc) {
        return false;
    }
}

/**
 * Safe collection check
 * @param {*} value - Value to check
 * @returns {Boolean} True if value is collection-like
 */
function isCollectionLike(value) {
    try {
        if (!value || typeof value !== 'object') return false;
        if (value instanceof Array) return true;
        if (typeof value.length === 'number') return true;
        if (typeof value.count === 'number') return true;
        return false;
    } catch (exc) {
        return false;
    }
}

// =============================================================================
// MEMORY MANAGEMENT UTILITIES
// =============================================================================

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
            
            track: function(obj, path) {
                try {
                    if (!obj || typeof obj !== 'object') return null;
                    
                    var objectId = this.generateObjectId(obj, path);
                    
                    if (!this.references[objectId]) {
                        this.references[objectId] = {
                            object: obj,
                            paths: [path],
                            firstSeen: getCurrentTimestamp()
                        };
                        this.totalTracked++;
                    } else {
                        this.references[objectId].paths.push(path);
                        this.duplicateCount++;
                    }
                    
                    return objectId;
                    
                } catch (exc) {
                    return null;
                }
            },
            
            generateObjectId: function(obj, path) {
                try {
                    return 'obj_' + path + '_' + this.totalTracked;
                } catch (exc) {
                    return 'obj_unknown_' + Math.random();
                }
            },
            
            isVisited: function(obj) {
                try {
                    for (var i = 0; i < this.visitedObjects.length; i++) {
                        if (this.visitedObjects[i] === obj) return true;
                    }
                    return false;
                } catch (exc) {
                    return false;
                }
            },
            
            markVisited: function(obj) {
                try {
                    if (!this.isVisited(obj)) {
                        this.visitedObjects.push(obj);
                    }
                } catch (exc) {
                    // Continue operation
                }
            },
            
            getStatistics: function() {
                try {
                    return {
                        totalTracked: this.totalTracked,
                        uniqueObjects: countObjectKeys(this.references),
                        duplicateCount: this.duplicateCount,
                        visitedCount: this.visitedObjects.length
                    };
                } catch (exc) {
                    return {
                        totalTracked: 0,
                        uniqueObjects: 0,
                        duplicateCount: 0,
                        visitedCount: 0
                    };
                }
            },
            
            cleanup: function() {
                try {
                    this.references = {};
                    this.visitedObjects = [];
                    this.duplicateCount = 0;
                    this.totalTracked = 0;
                } catch (exc) {
                    // Continue operation
                }
            }
        };
        
    } catch (exc) {
        return {
            references: {},
            visitedObjects: [],
            duplicateCount: 0,
            totalTracked: 0,
            track: function() { return null; },
            isVisited: function() { return false; },
            markVisited: function() { },
            getStatistics: function() { return {}; },
            cleanup: function() { }
        };
    }
}

// =============================================================================
// PATH UTILITIES
// =============================================================================

/**
 * Split dot notation path into components
 * @param {String} dotPath - Dot notation path
 * @returns {Array} Array of path components
 */
function splitPath(dotPath) {
    try {
        if (!dotPath || typeof dotPath !== 'string') {
            return [];
        }
        
        return stringSplit(dotPath, '.');
        
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
 * Validate path string
 * @param {String} path - Path to validate
 * @returns {Boolean} True if valid path
 */
function isValidPath(path) {
    try {
        if (typeof path !== 'string' || path.length === 0) return false;
        
        // Check for dangerous patterns
        var dangerousPatterns = ['__', 'prototype', 'constructor', 'eval'];
        for (var i = 0; i < dangerousPatterns.length; i++) {
            if (stringIndexOf(path, dangerousPatterns[i]) !== -1) {
                return false;
            }
        }
        
        return true;
        
    } catch (exc) {
        return false;
    }
}

// =============================================================================
// MODULE REGISTRATION
// =============================================================================

// Register this module with all its functions
registerModule('1.2_safety-utilities', '3.1', [
    // Array Helpers
    'arrayIndexOf', 'arraySlice', 'arrayJoin', 'arrayPush', 'arrayPop',
    
    // String Helpers
    'stringIndexOf', 'stringSubstring', 'stringCharAt', 'stringSplit',
    'stringToLowerCase', 'stringToUpperCase', 'stringReplace',
    
    // Object Helpers
    'objectHasOwnProperty', 'countObjectKeys', 'objectClone',
    
    // Safety Utilities
    'safePropertyAccess', 'safeFunctionCall', 'safeTypeOf', 
    'isArrayLike', 'isCollectionLike',
    
    // Memory Management
    'createObjectReferenceTracker',
    
    // Path Utilities
    'splitPath', 'joinPath', 'isValidPath'
]);

// =============================================================================
// END OF 1.2_safety-utilities.jsx
// =============================================================================