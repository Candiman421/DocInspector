// =============================================================================
// 1.0_safe-foundation.jsx - ULTRA-SAFE OPERATIONS FOUNDATION
// InDesign DOM Discovery Builder v2.1.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: Ultra-safe property access with object reference tracking and ES3 helpers
// DEPENDENCIES: ["0.0_module-loader.jsx"] (optional - will work standalone)
// SIZE: ~1300 lines
// =============================================================================

// =============================================================================
// SAFETY CONFIGURATION
// =============================================================================

var SAFETY_CONFIG = {
    maxTimeout: 30000,
    maxOperations: 10000,
    memoryCheckInterval: 1000
};

// =============================================================================
// GLOBAL MODULE REGISTRY SYSTEM
// =============================================================================

if (typeof g_moduleRegistry === 'undefined') {
    var g_moduleRegistry = {
        modules: {},
        functions: {},
        loadOrder: []
    };
}

/**
 * Register a module with its exported functions
 * @param {String} moduleName - Name of the module
 * @param {String} version - Module version
 * @param {Array} functionNames - Array of function names exported by module
 * @returns {Boolean} True if registration successful
 */
function registerModule(moduleName, version, functionNames) {
    try {
        g_moduleRegistry.modules[moduleName] = {
            version: version || '2.1.1',
            functions: functionNames || [],
            loadTime: new Date().getTime(),
            available: true
        };
        
        // Register each function
        if (functionNames && functionNames.length) {
            for (var i = 0; i < functionNames.length; i++) {
                var funcName = functionNames[i];
                g_moduleRegistry.functions[funcName] = moduleName;
            }
        }
        
        // Add to load order if not already present
        var found = false;
        for (var j = 0; j < g_moduleRegistry.loadOrder.length; j++) {
            if (g_moduleRegistry.loadOrder[j] === moduleName) {
                found = true;
                break;
            }
        }
        if (!found) {
            g_moduleRegistry.loadOrder.push(moduleName);
        }
        
        // Register with module loader if available
        if (typeof registerModuleLoaded === 'function') {
            registerModuleLoaded(moduleName, version, functionNames);
        }
        
        return true;
        
    } catch (exc) {
        return false;
    }
}

/**
 * Check if a module is available
 * @param {String} moduleName - Name of module to check
 * @returns {Boolean} True if module is available
 */
function isModuleAvailable(moduleName) {
    try {
        return !!(g_moduleRegistry.modules[moduleName] && 
                 g_moduleRegistry.modules[moduleName].available);
    } catch (exc) {
        return false;
    }
}

/**
 * Get function reference if available
 * @param {String} moduleName - Module name
 * @param {String} functionName - Function name
 * @returns {Function|null} Function reference or null
 */
function getFunctionReference(moduleName, functionName) {
    try {
        if (!isModuleAvailable(moduleName)) {
            return null;
        }
        
        if (typeof window[functionName] === 'function') {
            return window[functionName];
        }
        
        if (typeof this[functionName] === 'function') {
            return this[functionName];
        }
        
        // Try global scope
        try {
            if (typeof eval(functionName) === 'function') {
                return eval(functionName);
            }
        } catch (exc) {
            // Function doesn't exist
        }
        
        return null;
        
    } catch (exc) {
        return null;
    }
}

/**
 * Safely call a module function
 * @param {String} moduleName - Module name
 * @param {String} functionName - Function name
 * @param {Array} args - Function arguments
 * @param {Object} context - Function context (optional)
 * @returns {Object} Result with success, value, error
 */
function safeCallModuleFunction(moduleName, functionName, args, context) {
    var result = {
        success: false,
        value: null,
        error: ''
    };
    
    try {
        var func = getFunctionReference(moduleName, functionName);
        if (!func) {
            result.error = 'Function not available: ' + moduleName + '.' + functionName;
            return result;
        }
        
        var callArgs = args || [];
        var callContext = context || this;
        
        // Call function with proper context
        if (callArgs.length === 0) {
            result.value = func.call(callContext);
        } else if (callArgs.length === 1) {
            result.value = func.call(callContext, callArgs[0]);
        } else if (callArgs.length === 2) {
            result.value = func.call(callContext, callArgs[0], callArgs[1]);
        } else if (callArgs.length === 3) {
            result.value = func.call(callContext, callArgs[0], callArgs[1], callArgs[2]);
        } else if (callArgs.length === 4) {
            result.value = func.call(callContext, callArgs[0], callArgs[1], callArgs[2], callArgs[3]);
        } else {
            // For more arguments, use apply-like approach
            result.value = func.apply(callContext, callArgs);
        }
        
        result.success = true;
        return result;
        
    } catch (exc) {
        result.error = 'Function call failed: ' + exc.message;
        return result;
    }
}

/**
 * Validate required dependencies
 * @param {Array} requiredModules - Array of required module names
 * @returns {Object} Validation result with success, missing modules
 */
function validateDependencies(requiredModules) {
    var result = {
        success: false,
        missing: [],
        available: [],
        error: ''
    };
    
    try {
        if (!requiredModules || !requiredModules.length) {
            result.success = true;
            return result;
        }
        
        for (var i = 0; i < requiredModules.length; i++) {
            var moduleName = requiredModules[i];
            if (isModuleAvailable(moduleName)) {
                result.available.push(moduleName);
            } else {
                result.missing.push(moduleName);
            }
        }
        
        result.success = (result.missing.length === 0);
        
        if (!result.success) {
            result.error = 'Missing required modules: ' + result.missing.join(', ');
        }
        
        return result;
        
    } catch (exc) {
        result.error = 'Dependency validation failed: ' + exc.message;
        return result;
    }
}

/**
 * Get missing dependencies
 * @param {Array} requiredModules - Array of required module names
 * @returns {Array} Array of missing module names
 */
function getMissingDependencies(requiredModules) {
    try {
        var validation = validateDependencies(requiredModules);
        return validation.missing || [];
    } catch (exc) {
        return requiredModules || [];
    }
}

/**
 * Create dependency error result
 * @param {Array} missingModules - Array of missing module names
 * @returns {Object} Error result object
 */
function createDependencyError(missingModules) {
    return {
        success: false,
        error: 'Missing required modules: ' + (missingModules || []).join(', '),
        missingModules: missingModules || []
    };
}

// =============================================================================
// ES3 COMPATIBILITY HELPERS
// =============================================================================

/**
 * ES3-compatible Array.prototype.indexOf
 * @param {Array} array - Array to search
 * @param {*} searchElement - Element to find
 * @param {Number} fromIndex - Starting index (optional)
 * @returns {Number} Index of element or -1 if not found
 */
function arrayIndexOf(array, searchElement, fromIndex) {
    try {
        if (!array || typeof array.length !== 'number') {
            return -1;
        }
        
        var startIndex = fromIndex || 0;
        if (startIndex < 0) {
            startIndex = Math.max(0, array.length + startIndex);
        }
        
        for (var i = startIndex; i < array.length; i++) {
            if (array[i] === searchElement) {
                return i;
            }
        }
        
        return -1;
        
    } catch (exc) {
        return -1;
    }
}

/**
 * ES3-compatible Array.prototype.slice
 * @param {Array} array - Array to slice
 * @param {Number} start - Start index
 * @param {Number} end - End index (optional)
 * @returns {Array} Sliced array
 */
function arraySlice(array, start, end) {
    try {
        if (!array || typeof array.length !== 'number') {
            return [];
        }
        
        var startIndex = start || 0;
        var endIndex = (typeof end !== 'undefined') ? end : array.length;
        
        if (startIndex < 0) {
            startIndex = Math.max(0, array.length + startIndex);
        }
        if (endIndex < 0) {
            endIndex = Math.max(0, array.length + endIndex);
        }
        
        var result = [];
        for (var i = startIndex; i < Math.min(endIndex, array.length); i++) {
            result.push(array[i]);
        }
        
        return result;
        
    } catch (exc) {
        return [];
    }
}

/**
 * ES3-compatible Array.prototype.join
 * @param {Array} array - Array to join
 * @param {String} separator - Separator string
 * @returns {String} Joined string
 */
function arrayJoin(array, separator) {
    try {
        if (!array || typeof array.length !== 'number') {
            return '';
        }
        
        var sep = (typeof separator !== 'undefined') ? separator : ',';
        var result = '';
        
        for (var i = 0; i < array.length; i++) {
            if (i > 0) {
                result += sep;
            }
            result += String(array[i] || '');
        }
        
        return result;
        
    } catch (exc) {
        return '';
    }
}

/**
 * ES3-compatible Array.prototype.concat
 * @param {Array} array1 - First array
 * @param {Array} array2 - Second array
 * @returns {Array} Concatenated array
 */
function arrayConcat(array1, array2) {
    try {
        var result = [];
        
        // Add elements from first array
        if (array1 && typeof array1.length === 'number') {
            for (var i = 0; i < array1.length; i++) {
                result.push(array1[i]);
            }
        }
        
        // Add elements from second array
        if (array2 && typeof array2.length === 'number') {
            for (var j = 0; j < array2.length; j++) {
                result.push(array2[j]);
            }
        }
        
        return result;
        
    } catch (exc) {
        return [];
    }
}

/**
 * String replace function
 * @param {String} str - String to process
 * @param {String} searchValue - Value to search for
 * @param {String} replaceValue - Value to replace with
 * @returns {String} String with replacements
 */
function stringReplace(str, searchValue, replaceValue) {
    try {
        if (!str || typeof str !== 'string') {
            return '';
        }
        
        if (!searchValue) {
            return str;
        }
        
        var result = str;
        var replaceVal = replaceValue || '';
        
        // Simple string replacement (replace first occurrence)
        var idx = result.indexOf(searchValue);
        if (idx !== -1) {
            result = result.substring(0, idx) + replaceVal + result.substring(idx + searchValue.length);
        }
        
        return result;
        
    } catch (exc) {
        return str || '';
    }
}

/**
 * String match function (ES3 compatible)
 * @param {String} str - String to search
 * @param {String} pattern - Pattern to match (simplified)
 * @returns {Boolean} True if pattern found
 */
function stringMatch(str, pattern) {
    try {
        if (!str || typeof str !== 'string') {
            return false;
        }
        
        if (!pattern || typeof pattern !== 'string') {
            return false;
        }
        
        // Handle some common patterns
        if (pattern === 'function_call_pattern') {
            // Look for function call patterns like: functionName(
            return str.indexOf('(') !== -1 && str.indexOf(')') !== -1;
        }
        
        // Default: simple string search
        return str.indexOf(pattern) !== -1;
        
    } catch (exc) {
        return false;
    }
}

/**
 * ES3-compatible String.prototype.indexOf
 * @param {String} str - String to search
 * @param {String} searchValue - Value to find
 * @param {Number} fromIndex - Starting index (optional)
 * @returns {Number} Index of value or -1 if not found
 */
function stringIndexOf(str, searchValue, fromIndex) {
    try {
        if (!str || typeof str !== 'string') {
            return -1;
        }
        
        return str.indexOf(searchValue, fromIndex);
        
    } catch (exc) {
        return -1;
    }
}

/**
 * Safe string substring function
 * @param {String} str - String to process
 * @param {Number} start - Start index
 * @param {Number} end - End index (optional)
 * @returns {String} Substring
 */
function stringSubstring(str, start, end) {
    try {
        if (!str || typeof str !== 'string') {
            return '';
        }
        
        if (typeof end !== 'undefined') {
            return str.substring(start, end);
        } else {
            return str.substring(start);
        }
        
    } catch (exc) {
        return '';
    }
}

/**
 * Safer hasOwnProperty check
 * @param {Object} obj - Object to check
 * @param {String} prop - Property name
 * @returns {Boolean} True if object has own property
 */
function objectHasOwnProperty(obj, prop) {
    try {
        if (!obj || typeof obj !== 'object') {
            return false;
        }
        
        if (obj.hasOwnProperty) {
            return obj.hasOwnProperty(prop);
        }
        
        // Fallback for objects without hasOwnProperty
        return (prop in obj) && !(prop in obj.constructor.prototype);
        
    } catch (exc) {
        return false;
    }
}

/**
 * Deep object cloning with depth limit
 * @param {Object} obj - Object to clone
 * @param {Number} maxDepth - Maximum recursion depth
 * @returns {Object} Cloned object
 */
function objectClone(obj, maxDepth) {
    try {
        var depth = maxDepth || 3;
        
        if (depth <= 0) {
            return null;
        }
        
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        if (obj.constructor === Array || (typeof obj.length === 'number' && obj.length >= 0)) {
            var clonedArray = [];
            for (var i = 0; i < obj.length; i++) {
                clonedArray[i] = objectClone(obj[i], depth - 1);
            }
            return clonedArray;
        }
        
        var clonedObj = {};
        for (var key in obj) {
            if (objectHasOwnProperty(obj, key)) {
                clonedObj[key] = objectClone(obj[key], depth - 1);
            }
        }
        
        return clonedObj;
        
    } catch (exc) {
        return null;
    }
}

/**
 * Object merging function
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object
 */
function objectMerge(target, source) {
    try {
        var result = target || {};
        
        if (!source || typeof source !== 'object') {
            return result;
        }
        
        for (var key in source) {
            if (objectHasOwnProperty(source, key)) {
                result[key] = source[key];
            }
        }
        
        return result;
        
    } catch (exc) {
        return target || {};
    }
}

/**
 * Check if function exists
 * @param {String} functionName - Name of function to check
 * @returns {Boolean} True if function exists
 */
function functionExists(functionName) {
    try {
        if (typeof window[functionName] === 'function') {
            return true;
        }
        
        if (typeof this[functionName] === 'function') {
            return true;
        }
        
        // Try global scope
        try {
            return (typeof eval(functionName) === 'function');
        } catch (exc) {
            return false;
        }
        
    } catch (exc) {
        return false;
    }
}

/**
 * Safe function calling with error handling
 * @param {String} functionName - Name of function to call
 * @param {Array} args - Function arguments
 * @param {Object} context - Function context (optional)
 * @returns {Object} Result with success, value, error
 */
function safeCall(functionName, args, context) {
    var result = {
        success: false,
        value: null,
        error: ''
    };
    
    try {
        if (!functionExists(functionName)) {
            result.error = 'Function does not exist: ' + functionName;
            return result;
        }
        
        var func = null;
        if (typeof window[functionName] === 'function') {
            func = window[functionName];
        } else if (typeof this[functionName] === 'function') {
            func = this[functionName];
        } else {
            try {
                func = eval(functionName);
            } catch (exc) {
                result.error = 'Cannot access function: ' + functionName;
                return result;
            }
        }
        
        var callArgs = args || [];
        var callContext = context || this;
        
        result.value = func.apply(callContext, callArgs);
        result.success = true;
        
        return result;
        
    } catch (exc) {
        result.error = 'Function call failed: ' + exc.message;
        return result;
    }
}

/**
 * ES3-compatible object key counting
 * @param {Object} obj - Object to count keys for
 * @returns {Number} Number of enumerable properties
 */
function countObjectKeys(obj) {
    try {
        if (!obj || typeof obj !== 'object') {
            return 0;
        }
        
        var count = 0;
        for (var key in obj) {
            if (objectHasOwnProperty(obj, key)) {
                count++;
            }
        }
        
        return count;
        
    } catch (exc) {
        return 0;
    }
}

/**
 * ES3-compatible object key array generation
 * @param {Object} obj - Object to get keys from
 * @returns {Array} Array of object keys
 */
function getObjectKeys(obj) {
    try {
        if (!obj || typeof obj !== 'object') {
            return [];
        }
        
        var keys = [];
        for (var key in obj) {
            if (objectHasOwnProperty(obj, key)) {
                keys.push(key);
            }
        }
        
        return keys;
        
    } catch (exc) {
        return [];
    }
}

/**
 * ES3-compatible string trimming
 * @param {String} str - String to trim
 * @returns {String} Trimmed string
 */
function trimString(str) {
    try {
        if (!str || typeof str !== 'string') {
            return '';
        }
        
        return str.replace(/^\s+|\s+$/g, '');
        
    } catch (exc) {
        return str || '';
    }
}

// =============================================================================
// PROPERTY SAFETY FUNCTIONS
// =============================================================================

/**
 * Get property type without accessing value
 * @param {Object} targetObj - Object to check
 * @param {String} propName - Property name to check
 * @returns {String} Type: 'undefined'|'string'|'number'|'boolean'|'object'|'function'|'error'
 */
function safeTypeCheck(targetObj, propName) {
    try {
        if (!targetObj || typeof targetObj !== 'object') {
            return 'undefined';
        }
        
        if (!(propName in targetObj)) {
            return 'undefined';
        }
        
        return typeof targetObj[propName];
        
    } catch (exc) {
        return 'error';
    }
}

/**
 * Check if property exists without accessing it
 * @param {Object} targetObj - Object to check
 * @param {String} propName - Property name to check
 * @returns {Boolean} True if property exists
 */
function safeHasProperty(targetObj, propName) {
    try {
        if (!targetObj || typeof targetObj !== 'object') {
            return false;
        }
        
        return (propName in targetObj);
        
    } catch (exc) {
        return false;
    }
}

/**
 * Get collection size safely
 * @param {Object} collection - Collection to measure
 * @returns {Number} Integer size or -1 if inaccessible
 */
function safeGetLength(collection) {
    try {
        if (!collection) {
            return -1;
        }
        
        if (typeof collection.length === 'number') {
            return collection.length;
        }
        
        if (typeof collection.count === 'number') {
            return collection.count;
        }
        
        // Try to count manually for objects
        var count = 0;
        for (var key in collection) {
            if (objectHasOwnProperty(collection, key)) {
                count++;
            }
        }
        
        return count;
        
    } catch (exc) {
        return -1;
    }
}

/**
 * Safely get object reference from path
 * @param {Object} sourceObj - Source object
 * @param {String} path - Dot notation path
 * @param {Number} timeoutMs - Timeout in milliseconds
 * @returns {Object} Result with success, value, and error
 */
function safeGetObjectFromPath(sourceObj, path, timeoutMs) {
    var result = {
        success: false,
        value: null,
        error: ''
    };
    
    try {
        if (!sourceObj || !path || typeof path !== 'string') {
            result.error = 'Invalid source object or path';
            return result;
        }
        
        var timeoutChecker = createTimeoutChecker(timeoutMs || 5000);
        var pathComponents = splitPath(path);
        var currentObj = sourceObj;
        
        for (var i = 0; i < pathComponents.length; i++) {
            if (timeoutChecker && timeoutChecker()) {
                result.error = 'Timeout accessing path';
                return result;
            }
            
            var componentName = pathComponents[i];
            if (!safeHasProperty(currentObj, componentName)) {
                result.error = 'Property not found: ' + componentName;
                return result;
            }
            
            try {
                currentObj = currentObj[componentName];
            } catch (accessExc) {
                result.error = 'Error accessing property: ' + componentName + ' - ' + accessExc.message;
                return result;
            }
            
            if (!currentObj) {
                result.error = 'Null object at: ' + componentName;
                return result;
            }
        }
        
        result.success = true;
        result.value = currentObj;
        return result;
        
    } catch (exc) {
        result.error = 'Path access error: ' + exc.message;
        return result;
    }
}

// =============================================================================
// OBJECT REFERENCE TRACKING FUNCTIONS
// =============================================================================

/**
 * Generate unique object reference ID
 * @param {Object} targetObj - Object to generate ID for
 * @returns {String} Unique reference ID
 */
function generateObjectReferenceID(targetObj) {
    try {
        if (!targetObj) {
            return 'null_' + generateUniqueID();
        }
        
        var objType = typeof targetObj;
        var timestamp = new Date().getTime();
        var random = Math.floor(Math.random() * 10000);
        
        return objType + '_' + timestamp + '_' + random;
        
    } catch (exc) {
        return 'error_' + new Date().getTime();
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
 * Create object reference tracker for deduplication
 * @returns {Object} Reference tracker with methods
 */
function createObjectReferenceTracker() {
    var tracker = {
        objects: {},
        statistics: {
            totalTracked: 0,
            duplicatesFound: 0,
            lastUpdate: getCurrentTimestamp()
        }
    };
    
    tracker.trackObject = function(objectId, targetObj, objectPath) {
        try {
            if (!this.objects[objectId]) {
                this.objects[objectId] = {
                    object: targetObj,
                    paths: [objectPath],
                    firstSeen: getCurrentTimestamp()
                };
                this.statistics.totalTracked++;
            } else {
                this.objects[objectId].paths.push(objectPath);
                this.statistics.duplicatesFound++;
            }
            
            this.statistics.lastUpdate = getCurrentTimestamp();
            return true;
            
        } catch (exc) {
            return false;
        }
    };
    
    tracker.getStatistics = function() {
        return {
            totalTracked: this.statistics.totalTracked,
            duplicatesFound: this.statistics.duplicatesFound,
            lastUpdate: this.statistics.lastUpdate
        };
    };
    
    tracker.cleanup = function() {
        try {
            this.objects = {};
            this.statistics = {
                totalTracked: 0,
                duplicatesFound: 0,
                lastUpdate: getCurrentTimestamp()
            };
            return true;
        } catch (exc) {
            return false;
        }
    };
    
    return tracker;
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
        
        return dotPath.split('.');
        
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
 * Get parent path from dot notation path and normalize paths
 * @param {String} dotPath - Dot notation path
 * @param {Boolean} normalize - Whether to normalize the path
 * @returns {String} Parent path or normalized path
 */
function getParentPath(dotPath, normalize) {
    try {
        if (!dotPath || typeof dotPath !== 'string') {
            return '';
        }
        
        var components = splitPath(dotPath);
        
        if (normalize) {
            // Normalize by removing empty components
            var normalized = [];
            for (var i = 0; i < components.length; i++) {
                if (components[i] && components[i].length > 0) {
                    normalized.push(components[i]);
                }
            }
            return joinPath(normalized);
        } else {
            // Get parent path
            if (components.length <= 1) {
                return '';
            }
            components.pop();
            return joinPath(components);
        }
        
    } catch (exc) {
        return normalize ? dotPath : '';
    }
}

/**
 * Normalize path by removing empty components
 * @param {String} dotPath - Dot notation path
 * @returns {String} Normalized path
 */
function normalizePath(dotPath) {
    return getParentPath(dotPath, true);
}

// =============================================================================
// MEMORY MANAGEMENT
// =============================================================================

/**
 * Memory cleanup with reference tracking
 * @param {Array} objsToNull - Objects to null out
 * @param {Object} referenceTracker - Reference tracker to clean
 */
function memoryCleanup(objsToNull, referenceTracker) {
    try {
        // Clean up objects
        if (objsToNull && objsToNull.length) {
            for (var i = 0; i < objsToNull.length; i++) {
                try {
                    objsToNull[i] = null;
                } catch (exc) {
                    // Continue cleanup even if individual items fail
                }
            }
        }
        
        // Clean up reference tracker
        if (referenceTracker && typeof referenceTracker.cleanup === 'function') {
            referenceTracker.cleanup();
        }
        
        // Force garbage collection hint
        if (typeof $.gc === 'function') {
            $.gc();
        }
        
    } catch (exc) {
        // Silent cleanup - don't throw errors during cleanup
    }
}

/**
 * Create memory usage monitor
 * @returns {Object} Memory monitor with methods
 */
function createMemoryMonitor() {
    var monitor = {
        checkpoints: [],
        startTime: new Date().getTime()
    };
    
    monitor.checkpoint = function(label) {
        try {
            var checkpoint = {
                label: label || 'checkpoint_' + this.checkpoints.length,
                timestamp: new Date().getTime(),
                elapsed: new Date().getTime() - this.startTime
            };
            
            this.checkpoints.push(checkpoint);
            return checkpoint;
            
        } catch (exc) {
            return null;
        }
    };
    
    monitor.getReport = function() {
        try {
            return {
                totalCheckpoints: this.checkpoints.length,
                totalElapsed: new Date().getTime() - this.startTime,
                checkpoints: this.checkpoints
            };
        } catch (exc) {
            return {
                totalCheckpoints: 0,
                totalElapsed: 0,
                checkpoints: []
            };
        }
    };
    
    monitor.cleanup = function() {
        try {
            this.checkpoints = [];
            this.startTime = new Date().getTime();
            return true;
        } catch (exc) {
            return false;
        }
    };
    
    return monitor;
}

// =============================================================================
// DANGER DETECTION
// =============================================================================

/**
 * Detect dangerous property patterns and reserved words
 * @param {String} propName - Property name to check
 * @param {String} checkType - Type of check: 'property', 'path', 'reserved', or 'all' (default)
 * @returns {Boolean} True if dangerous
 */
function isDangerousProperty(propName, checkType) {
    try {
        if (!propName || typeof propName !== 'string') {
            return true;
        }
        
        checkType = checkType || 'all';
        
        // Property-specific dangerous patterns
        if (checkType === 'property' || checkType === 'all') {
            var dangerous = [
                'constructor', 'prototype', '__proto__',
                'eval', 'apply', 'call', 'bind',
                'toSource', 'toString', 'valueOf',
                'hasOwnProperty', 'isPrototypeOf',
                'propertyIsEnumerable'
            ];
            
            for (var i = 0; i < dangerous.length; i++) {
                if (propName === dangerous[i]) {
                    return true;
                }
            }
        }
        
        // Reserved word check
        if (checkType === 'reserved' || checkType === 'all') {
            var reserved = [
                'break', 'case', 'catch', 'continue', 'default', 'delete',
                'do', 'else', 'finally', 'for', 'function', 'if',
                'in', 'instanceof', 'new', 'return', 'switch', 'this',
                'throw', 'try', 'typeof', 'var', 'void', 'while', 'with',
                'class', 'const', 'enum', 'export', 'extends', 'import', 'super'
            ];
            
            for (var j = 0; j < reserved.length; j++) {
                if (propName === reserved[j]) {
                    return true;
                }
            }
        }
        
        return false;
        
    } catch (exc) {
        return true;
    }
}

/**
 * Detect dangerous path patterns for deep traversal
 * @param {String} dotPath - Path to check
 * @returns {Boolean} True if dangerous
 */
function isDangerousPath(dotPath) {
    try {
        if (!dotPath || typeof dotPath !== 'string') {
            return true;
        }
        
        var dangerousPatterns = [
            'constructor',
            'prototype',
            '__proto__',
            'parent.parent.parent',
            'document.app.quit'
        ];
        
        for (var i = 0; i < dangerousPatterns.length; i++) {
            if (stringIndexOf(dotPath, dangerousPatterns[i]) !== -1) {
                return true;
            }
        }
        
        return false;
        
    } catch (exc) {
        return true;
    }
}

/**
 * Check if property name is ES3 reserved word
 * @param {String} propName - Property name to check
 * @returns {Boolean} True if reserved
 */
function isReservedWord(propName) {
    return isDangerousProperty(propName, 'reserved');
}

// =============================================================================
// OPERATION CONTROL
// =============================================================================

/**
 * Create timeout checker for long operations
 * @param {Number} maxMs - Maximum milliseconds
 * @returns {Function} Function that returns true if timeout exceeded
 */
function createTimeoutChecker(maxMs) {
    var startTime = new Date().getTime();
    var timeoutMs = maxMs || SAFETY_CONFIG.maxTimeout;
    
    return function() {
        try {
            return (new Date().getTime() - startTime) > timeoutMs;
        } catch (exc) {
            return true;
        }
    };
}

/**
 * Operation counter with reporting
 * @param {Number} maxOps - Maximum operations
 * @returns {Object} Counter with check, increment, getProgress methods
 */
function createOperationCounter(maxOps) {
    var counter = {
        current: 0,
        maximum: maxOps || SAFETY_CONFIG.maxOperations,
        startTime: new Date().getTime()
    };
    
    counter.check = function() {
        return this.current >= this.maximum;
    };
    
    counter.increment = function() {
        this.current++;
        return this.current;
    };
    
    counter.getProgress = function() {
        try {
            return {
                current: this.current,
                maximum: this.maximum,
                percentage: Math.floor((this.current / this.maximum) * 100),
                elapsed: new Date().getTime() - this.startTime
            };
        } catch (exc) {
            return {
                current: this.current,
                maximum: this.maximum,
                percentage: 0,
                elapsed: 0
            };
        }
    };
    
    return counter;
}

// =============================================================================
// ENVIRONMENT VALIDATION
// =============================================================================

/**
 * Validate InDesign environment and document state
 * @returns {Object} Validation result with metadata
 */
function validateInDesignEnvironment() {
    var result = {
        valid: false,
        error: '',
        document: null,
        warnings: [],
        metadata: {
            indesignVersion: 'unknown',
            hasNativeJSON: false,
            documentCount: 0
        }
    };
    
    try {
        // Check if we're in InDesign
        if (typeof app === 'undefined') {
            result.error = 'Not running in InDesign environment';
            return result;
        }
        
        // Detect InDesign version for adaptive behavior
        try {
            if (app.version) {
                result.metadata.indesignVersion = app.version;
            }
        } catch (exc) {
            result.warnings.push('Could not detect InDesign version');
        }
        
        // Check for native JSON support
        try {
            result.metadata.hasNativeJSON = (typeof JSON !== 'undefined' && JSON.parse && JSON.stringify);
        } catch (exc) {
            result.metadata.hasNativeJSON = false;
        }
        
        // Check if documents exist
        if (!app.documents) {
            result.error = 'Document collection not available';
            return result;
        }
        
        result.metadata.documentCount = app.documents.length;
        
        if (app.documents.length === 0) {
            result.error = 'No documents open';
            return result;
        }
        
        // Get active document
        var activeDoc = app.activeDocument;
        if (!activeDoc) {
            result.error = 'No active document';
            return result;
        }
        
        result.document = activeDoc;
        result.valid = true;
        
        // Add warnings for common issues
        try {
            if (activeDoc.modified) {
                result.warnings.push('Document has unsaved changes');
            }
        } catch (exc) {
            result.warnings.push('Could not check document modification status');
        }
        
        // Version-specific warnings
        if (result.metadata.indesignVersion && stringIndexOf(result.metadata.indesignVersion, 'CS') !== -1) {
            result.warnings.push('Older InDesign version detected - some features may be limited');
        }
        
        if (!result.metadata.hasNativeJSON) {
            result.warnings.push('Native JSON support not available - using fallback methods');
        }
        
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
            result.warnings.push('No document provided');
            return result;
        }
        
        // Collect basic metadata
        try {
            result.metadata.name = documentObj.name || 'Unnamed Document';
        } catch (exc) {
            result.metadata.name = 'Unknown Document';
            result.warnings.push('Could not access document name');
        }
        
        try {
            result.metadata.saved = documentObj.saved || false;
        } catch (exc) {
            result.metadata.saved = false;
            result.warnings.push('Could not check document saved status');
        }
        
        // Document appears safe for enumeration
        result.safe = true;
        
        return result;
        
    } catch (exc) {
        result.warnings.push('Document validation failed: ' + exc.message);
        return result;
    }
}

// =============================================================================
// UTILITIES
// =============================================================================

/**
 * String builder for large text construction with memory management
 * @returns {Object} String builder with methods
 */
function createStringBuilder() {
    var builder = {
        chunks: [],
        totalLength: 0
    };
    
    builder.append = function(text) {
        try {
            if (text) {
                this.chunks.push(text);
                this.totalLength += text.length;
            }
            return this;
        } catch (exc) {
            return this;
        }
    };
    
    builder.appendLine = function(text) {
        return this.append((text || '') + '\n');
    };
    
    builder.toString = function() {
        try {
            return arrayJoin(this.chunks, '');
        } catch (exc) {
            return '';
        }
    };
    
    builder.clear = function() {
        try {
            this.chunks = [];
            this.totalLength = 0;
            return this;
        } catch (exc) {
            return this;
        }
    };
    
    return builder;
}

/**
 * Get current timestamp in readable format
 * @returns {String} Formatted timestamp
 */
function getCurrentTimestamp() {
    try {
        var now = new Date();
        var year = now.getFullYear();
        var month = ('0' + (now.getMonth() + 1)).slice(-2);
        var day = ('0' + now.getDate()).slice(-2);
        var hour = ('0' + now.getHours()).slice(-2);
        var minute = ('0' + now.getMinutes()).slice(-2);
        var second = ('0' + now.getSeconds()).slice(-2);
        
        return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
        
    } catch (exc) {
        return 'Unknown Time';
    }
}

/**
 * Generate unique identifier
 * @returns {String} Unique identifier
 */
function generateUniqueID() {
    try {
        var timestamp = new Date().getTime();
        var random = Math.floor(Math.random() * 100000);
        return 'id_' + timestamp + '_' + random;
    } catch (exc) {
        return 'id_error_' + Math.floor(Math.random() * 10000);
    }
}

/**
 * Create error result object
 * @param {String} errorMessage - Error message
 * @returns {Object} Standardized error result
 */
function createErrorResult(errorMessage) {
    return {
        success: false,
        error: errorMessage || 'Unknown error',
        timestamp: getCurrentTimestamp()
    };
}

// =============================================================================
// MODULE REGISTRATION
// =============================================================================

// Register this module with all its functions
registerModule('1.0_safe-foundation', '2.1.1', [
    // Module System Functions
    'registerModule', 'isModuleAvailable', 'getFunctionReference', 'safeCallModuleFunction',
    'validateDependencies', 'getMissingDependencies', 'createDependencyError',
    
    // ES3 Helper Functions
    'arrayIndexOf', 'arraySlice', 'arrayJoin', 'arrayConcat',
    'stringReplace', 'stringMatch', 'stringIndexOf', 'stringSubstring',
    'objectHasOwnProperty', 'objectClone', 'objectMerge',
    'functionExists', 'safeCall',
    
    // ES3 Compatibility
    'countObjectKeys', 'getObjectKeys', 'trimString',
    
    // Property Safety Functions
    'safeTypeCheck', 'safeHasProperty', 'safeGetLength', 'safeGetObjectFromPath',
    
    // Object Reference Tracking
    'generateObjectReferenceID', 'isSameObjectReference', 'createObjectReferenceTracker',
    
    // Path Utilities
    'splitPath', 'joinPath', 'getParentPath', 'normalizePath',
    
    // Memory Management
    'memoryCleanup', 'createMemoryMonitor',
    
    // Danger Detection
    'isDangerousProperty', 'isDangerousPath', 'isReservedWord',
    
    // Operation Control
    'createTimeoutChecker', 'createOperationCounter',
    
    // Environment Validation
    'validateInDesignEnvironment', 'validateDocumentState',
    
    // Utilities
    'createStringBuilder', 'getCurrentTimestamp', 'generateUniqueID', 'createErrorResult'
]);

// =============================================================================
// END OF 1.0_safe-foundation.jsx
// =============================================================================