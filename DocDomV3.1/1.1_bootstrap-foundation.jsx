// =============================================================================
// 1.1_bootstrap-foundation.jsx - BOOTSTRAP FOUNDATION SYSTEM
// InDesign DOM Discovery Builder v3.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: Core module system with dependency management and ES3 compatibility
// DEPENDENCIES: NONE (This is the foundation module)
// SIZE: ~1500 lines - COMPLETE IMPLEMENTATION
// =============================================================================

// =============================================================================
// EXTENDSCRIPT COMPATIBILITY CHECK
// =============================================================================

var BOOTSTRAP_VERSION = '3.1';
var BOOTSTRAP_BUILD_DATE = '2024-12-19';

// Check ExtendScript environment
if (typeof app === 'undefined') {
    throw new Error('This script requires Adobe InDesign (ExtendScript environment)');
}

// =============================================================================
// GLOBAL MODULE SYSTEM (NO WINDOW REFERENCES)
// =============================================================================

// FIXED: Removed all window references for ExtendScript compatibility
var g_moduleSystem = {
    loadedModules: {},
    loadStatus: {
        startTime: 0,
        endTime: 0,
        totalModules: 11, // 1.1 through 6.1
        loadedCount: 0,
        failedCount: 0,
        failedModules: []
    },
    loadOrder: [
        '1.1_bootstrap-foundation',
        '1.2_safety-utilities',
        '2.1_dom-enumerator',
        '2.2_collection-sampler',
        '3.1_property-sampler',
        '3.2_dom-exporter',
        '4.1_json-analyzer',
        '4.2_dom-comparator',
        '5.1_deep-mapper',
        '5.2_dom-visualizer',
        '6.1_advanced-ui'
    ]
};

// Global module registry - NO WINDOW REFERENCES
var g_moduleRegistry = {
    modules: {},
    functions: {},
    loadOrder: g_moduleSystem.loadOrder.slice()
};

// =============================================================================
// ENVIRONMENT COMPATIBILITY
// =============================================================================

/**
 * Check environment compatibility
 * @returns {Object} Compatibility report
 */
function checkEnvironmentCompatibility() {
    var result = {
        compatible: false,
        indesignVersion: 'unknown',
        extendscriptVersion: 'unknown',
        features: {
            hasNativeJSON: false,
            hasArrayMethods: false,
            hasStringMethods: false
        },
        warnings: [],
        errors: []
    };
    
    try {
        // Check InDesign availability
        if (typeof app === 'undefined') {
            result.errors.push('Adobe InDesign not available');
            return result;
        }
        
        // Get InDesign version
        try {
            result.indesignVersion = app.version || 'unknown';
        } catch (exc) {
            result.warnings.push('Could not determine InDesign version');
        }
        
        // Check ExtendScript features
        try {
            result.features.hasNativeJSON = (typeof JSON !== 'undefined');
        } catch (exc) {
            result.features.hasNativeJSON = false;
        }
        
        try {
            var testArray = [1, 2, 3];
            result.features.hasArrayMethods = (typeof testArray.push === 'function');
        } catch (exc) {
            result.features.hasArrayMethods = false;
        }
        
        try {
            var testString = 'test';
            result.features.hasStringMethods = (typeof testString.indexOf === 'function');
        } catch (exc) {
            result.features.hasStringMethods = false;
        }
        
        // Check for ES3 compliance issues
        if (!result.features.hasArrayMethods) {
            result.warnings.push('Limited array method support detected');
        }
        
        if (!result.features.hasNativeJSON) {
            result.warnings.push('Native JSON support not available - using fallback');
        }
        
        result.compatible = true;
        return result;
        
    } catch (exc) {
        result.errors.push('Environment check failed: ' + exc.message);
        return result;
    }
}

// =============================================================================
// MODULE SYSTEM CORE
// =============================================================================

/**
 * Initialize module system (FIXED: No window references)
 * @returns {Object} Initialization result
 */
function initializeModuleSystem() {
    var result = {
        success: false,
        compatibilityReport: null,
        error: ''
    };
    
    try {
        g_moduleSystem.loadStatus.startTime = new Date().getTime();
        
        // Check environment compatibility first
        var compatibility = checkEnvironmentCompatibility();
        result.compatibilityReport = compatibility;
        
        if (!compatibility.compatible) {
            result.error = 'Environment not compatible: ' + compatibility.errors.join(', ');
            return result;
        }
        
        // FIXED: Initialize module registry without window references
        if (typeof g_moduleRegistry === 'undefined') {
            // Create global registry in ExtendScript-compatible way
            try {
                // Try to access global scope directly
                this.g_moduleRegistry = {
                    modules: {},
                    functions: {},
                    loadOrder: g_moduleSystem.loadOrder.slice()
                };
            } catch (exc) {
                // Fallback: create in current scope
                g_moduleRegistry = {
                    modules: {},
                    functions: {},
                    loadOrder: g_moduleSystem.loadOrder.slice()
                };
            }
        }
        
        result.success = true;
        return result;
        
    } catch (exc) {
        result.error = 'Module system initialization failed: ' + exc.message;
        return result;
    }
}

/**
 * Check if a specific module is loaded
 * @param {String} moduleName - Name of module to check
 * @returns {Boolean} True if module is loaded
 */
function isModuleLoaded(moduleName) {
    try {
        return !!(g_moduleSystem.loadedModules[moduleName] && 
                 g_moduleSystem.loadedModules[moduleName].loaded);
    } catch (exc) {
        return false;
    }
}

/**
 * Get module loading status
 * @returns {Object} Status information
 */
function getModuleLoadingStatus() {
    try {
        var status = {
            totalModules: g_moduleSystem.loadOrder.length,
            loadedCount: 0,
            failedCount: g_moduleSystem.loadStatus.failedModules.length,
            loadingComplete: false,
            loadingSuccessful: false,
            loadTime: 0,
            loadedModules: [],
            failedModules: g_moduleSystem.loadStatus.failedModules.slice()
        };
        
        // Count loaded modules
        for (var moduleName in g_moduleSystem.loadedModules) {
            if (g_moduleSystem.loadedModules.hasOwnProperty && 
                g_moduleSystem.loadedModules.hasOwnProperty(moduleName)) {
                var moduleInfo = g_moduleSystem.loadedModules[moduleName];
                if (moduleInfo.loaded) {
                    status.loadedCount++;
                    status.loadedModules.push({
                        name: moduleName,
                        version: moduleInfo.version,
                        functions: moduleInfo.functions.length,
                        loadOrder: moduleInfo.loadOrder || 0
                    });
                }
            }
        }
        
        // Calculate load time
        if (g_moduleSystem.loadStatus.startTime) {
            var endTime = g_moduleSystem.loadStatus.endTime || new Date().getTime();
            status.loadTime = endTime - g_moduleSystem.loadStatus.startTime;
        }
        
        // Check if loading is complete
        status.loadingComplete = (status.loadedCount + status.failedCount) >= status.totalModules;
        status.loadingSuccessful = (status.loadedCount === status.totalModules && status.failedCount === 0);
        
        return status;
        
    } catch (exc) {
        return {
            totalModules: 0,
            loadedCount: 0,
            failedCount: 0,
            loadingComplete: false,
            loadingSuccessful: false,
            loadTime: 0,
            loadedModules: [],
            failedModules: [],
            error: exc.message
        };
    }
}

/**
 * Get missing dependencies
 * @param {Array} requiredModules - Required modules
 * @returns {Array} Missing module names
 */
function getMissingDependencies(requiredModules) {
    try {
        var missing = [];
        
        if (requiredModules && requiredModules.length > 0) {
            for (var i = 0; i < requiredModules.length; i++) {
                if (!isModuleLoaded(requiredModules[i])) {
                    missing.push(requiredModules[i]);
                }
            }
        }
        
        return missing;
        
    } catch (exc) {
        return requiredModules || [];
    }
}

/**
 * Generate loading report for display
 * @returns {String} Formatted loading report
 */
function generateLoadingReport() {
    try {
        var status = getModuleLoadingStatus();
        var report = [];
        
        report.push('InDesign DOM Discovery Builder v3.1');
        report.push('Module Loading Report');
        report.push('==========================================');
        report.push('');
        
        report.push('Loading Status: ' + (status.loadingSuccessful ? 'SUCCESS' : 
                   status.loadingComplete ? 'COMPLETED WITH ERRORS' : 'IN PROGRESS'));
        report.push('Modules Loaded: ' + status.loadedCount + '/' + status.totalModules);
        report.push('Load Time: ' + status.loadTime + 'ms');
        report.push('');
        
        if (status.loadedModules.length > 0) {
            report.push('LOADED MODULES:');
            report.push('---------------');
            for (var i = 0; i < status.loadedModules.length; i++) {
                var module = status.loadedModules[i];
                report.push((module.loadOrder + 1) + '. ' + module.name + 
                           ' v' + module.version + ' (' + module.functions + ' functions)');
            }
            report.push('');
        }
        
        if (status.failedModules.length > 0) {
            report.push('FAILED MODULES:');
            report.push('---------------');
            for (var j = 0; j < status.failedModules.length; j++) {
                report.push('• ' + status.failedModules[j]);
            }
            report.push('');
        }
        
        // Environment info
        var compatibility = checkEnvironmentCompatibility();
        report.push('ENVIRONMENT:');
        report.push('InDesign Version: ' + compatibility.indesignVersion);
        report.push('Native JSON: ' + (compatibility.features.hasNativeJSON ? 'Yes' : 'No'));
        report.push('Compatible: ' + (compatibility.compatible ? 'Yes' : 'No'));
        
        if (compatibility.warnings.length > 0) {
            report.push('');
            report.push('WARNINGS:');
            report.push('---------');
            for (var w = 0; w < compatibility.warnings.length; w++) {
                report.push('• ' + compatibility.warnings[w]);
            }
        }
        
        return report.join('\n');
        
    } catch (exc) {
        return 'Loading report generation failed: ' + exc.message;
    }
}

// =============================================================================
// DEPENDENCY VALIDATION SYSTEM
// =============================================================================

/**
 * Register module with its functions (FIXED: ES3 compatible)
 * @param {String} moduleName - Module name
 * @param {String} version - Module version
 * @param {Array} functionList - List of functions provided by this module
 */
function registerModule(moduleName, version, functionList) {
    try {
        if (!g_moduleSystem.loadedModules[moduleName]) {
            g_moduleSystem.loadedModules[moduleName] = {};
        }
        
        g_moduleSystem.loadedModules[moduleName].loaded = true;
        g_moduleSystem.loadedModules[moduleName].version = version;
        g_moduleSystem.loadedModules[moduleName].functions = functionList || [];
        g_moduleSystem.loadedModules[moduleName].timestamp = new Date().getTime();
        
        // Set load order if available
        for (var i = 0; i < g_moduleSystem.loadOrder.length; i++) {
            if (g_moduleSystem.loadOrder[i] === moduleName) {
                g_moduleSystem.loadedModules[moduleName].loadOrder = i;
                break;
            }
        }
        
        // Update system counters
        g_moduleSystem.loadStatus.loadedCount++;
        
    } catch (exc) {
        // Silent failure for module registration
        if (g_moduleSystem.loadStatus.failedModules.indexOf) {
            if (g_moduleSystem.loadStatus.failedModules.indexOf(moduleName) === -1) {
                g_moduleSystem.loadStatus.failedModules.push(moduleName);
                g_moduleSystem.loadStatus.failedCount++;
            }
        }
    }
}

/**
 * Check if function exists (FIXED: No eval usage)
 * @param {String} functionName - Function name to check
 * @returns {Boolean} True if function exists
 */
function functionExists(functionName) {
    try {
        // FIXED: Use safer function existence check
        if (typeof this[functionName] === 'function') {
            return true;
        }
        
        // Check global scope without eval
        try {
            var funcRef = this[functionName];
            return (typeof funcRef === 'function');
        } catch (exc) {
            return false;
        }
        
    } catch (exc) {
        return false;
    }
}

/**
 * Validate dependencies for a module
 * @param {Array} requiredModules - Array of required module names
 * @returns {Object} Validation result
 */
function validateDependencies(requiredModules) {
    try {
        var result = {
            success: true,
            missing: [],
            loaded: []
        };
        
        if (!requiredModules || requiredModules.length === 0) {
            return result;
        }
        
        for (var i = 0; i < requiredModules.length; i++) {
            var moduleName = requiredModules[i];
            if (isModuleLoaded(moduleName)) {
                result.loaded.push(moduleName);
            } else {
                result.missing.push(moduleName);
                result.success = false;
            }
        }
        
        return result;
        
    } catch (exc) {
        return {
            success: false,
            missing: requiredModules || [],
            loaded: [],
            error: exc.message
        };
    }
}

/**
 * Get missing dependencies
 * @param {Array} requiredModules - Required modules
 * @returns {Array} Missing module names
 */
function getMissingDependencies(requiredModules) {
    try {
        var missing = [];
        
        if (requiredModules && requiredModules.length > 0) {
            for (var i = 0; i < requiredModules.length; i++) {
                if (!isModuleLoaded(requiredModules[i])) {
                    missing.push(requiredModules[i]);
                }
            }
        }
        
        return missing;
        
    } catch (exc) {
        return requiredModules || [];
    }
}

/**
 * Create dependency error message
 * @param {String} moduleName - Module with missing dependencies
 * @param {Array} missing - Missing dependencies
 * @returns {String} Error message
 */
function createDependencyError(moduleName, missing) {
    try {
        return 'Module "' + moduleName + '" is missing required dependencies: ' + missing.join(', ');
    } catch (exc) {
        return 'Dependency validation error';
    }
}

// =============================================================================
// BASIC UTILITY FUNCTIONS (ES3 COMPATIBLE)
// =============================================================================

/**
 * ES3-compatible array indexOf
 * @param {Array} targetArray - Array to search
 * @param {*} searchValue - Value to find
 * @param {Number} fromIndex - Starting index
 * @returns {Number} Index or -1 if not found
 */
function arrayIndexOf(targetArray, searchValue, fromIndex) {
    try {
        if (!targetArray || typeof targetArray.length !== 'number') {
            return -1;
        }
        
        var startIndex = fromIndex || 0;
        if (startIndex < 0) startIndex = 0;
        
        for (var i = startIndex; i < targetArray.length; i++) {
            if (targetArray[i] === searchValue) {
                return i;
            }
        }
        
        return -1;
        
    } catch (exc) {
        return -1;
    }
}

/**
 * ES3-compatible array slice
 * @param {Array} targetArray - Source array
 * @param {Number} start - Start index
 * @param {Number} end - End index
 * @returns {Array} Sliced array
 */
function arraySlice(targetArray, start, end) {
    try {
        if (!targetArray || typeof targetArray.length !== 'number') {
            return [];
        }
        
        var result = [];
        var startIdx = start || 0;
        var endIdx = (typeof end !== 'undefined') ? end : targetArray.length;
        
        if (startIdx < 0) startIdx = Math.max(0, targetArray.length + startIdx);
        if (endIdx < 0) endIdx = Math.max(0, targetArray.length + endIdx);
        
        for (var i = startIdx; i < Math.min(endIdx, targetArray.length); i++) {
            result[result.length] = targetArray[i];
        }
        
        return result;
        
    } catch (exc) {
        return [];
    }
}

/**
 * ES3-compatible array join
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
            result += String(targetArray[i]);
        }
        
        return result;
        
    } catch (exc) {
        return '';
    }
}

/**
 * ES3-compatible array concat
 * @param {Array} array1 - First array
 * @param {Array} array2 - Second array
 * @returns {Array} Concatenated array
 */
function arrayConcat(array1, array2) {
    try {
        var result = [];
        var i;
        
        // Copy first array
        if (array1 && typeof array1.length === 'number') {
            for (i = 0; i < array1.length; i++) {
                result[result.length] = array1[i];
            }
        }
        
        // Copy second array
        if (array2 && typeof array2.length === 'number') {
            for (i = 0; i < array2.length; i++) {
                result[result.length] = array2[i];
            }
        }
        
        return result;
        
    } catch (exc) {
        return [];
    }
}

/**
 * ES3-compatible string indexOf
 * @param {String} targetString - String to search
 * @param {String} searchValue - Value to find
 * @param {Number} fromIndex - Starting index
 * @returns {Number} Index or -1 if not found
 */
function stringIndexOf(targetString, searchValue, fromIndex) {
    try {
        if (typeof targetString !== 'string' || typeof searchValue !== 'string') {
            return -1;
        }
        
        return targetString.indexOf(searchValue, fromIndex || 0);
        
    } catch (exc) {
        return -1;
    }
}

/**
 * ES3-compatible string substring
 * @param {String} targetString - Source string
 * @param {Number} start - Start index
 * @param {Number} end - End index
 * @returns {String} Substring
 */
function stringSubstring(targetString, start, end) {
    try {
        if (typeof targetString !== 'string') {
            return '';
        }
        
        return targetString.substring(start, end);
        
    } catch (exc) {
        return '';
    }
}

/**
 * ES3-compatible object property check
 * @param {Object} targetObject - Object to check
 * @param {String} prop - Property name
 * @returns {Boolean} True if object has own property
 */
function objectHasOwnProperty(targetObject, prop) {
    try {
        if (!targetObject || typeof targetObject !== 'object') return false;
        
        // Use prototype method for better compatibility
        return Object.prototype.hasOwnProperty.call(targetObject, prop);
    } catch (exc) {
        return false;
    }
}

/**
 * Safe object cloning (limited depth for performance)
 * @param {*} source - Source object
 * @param {Number} maxDepth - Maximum recursion depth
 * @returns {*} Cloned object
 */
function objectClone(originalObject, maxDepth) {
    var depth = maxDepth || 3;
    var seen = [];
    
    function cloneRecursive(sourceObject, currentDepth) {
        try {
            if (currentDepth >= depth) return '[Max Depth Reached]';
            
            if (sourceObject === null || sourceObject === undefined) {
                return sourceObject;
            }
            
            var objType = typeof sourceObject;
            if (objType !== 'object') {
                return sourceObject;
            }
            
            // Check for circular references
            for (var i = 0; i < seen.length; i++) {
                if (seen[i] === sourceObject) {
                    return '[Circular Reference]';
                }
            }
            
            seen[seen.length] = sourceObject;
            
            // Handle arrays
            if (sourceObject.length !== undefined && typeof sourceObject.length === 'number') {
                var clonedArray = [];
                for (var arrIndex = 0; arrIndex < sourceObject.length; arrIndex++) {
                    clonedArray[arrIndex] = cloneRecursive(sourceObject[arrIndex], currentDepth + 1);
                }
                return clonedArray;
            }
            
            // Handle objects
            var clonedObject = {};
            for (var prop in sourceObject) {
                if (objectHasOwnProperty(sourceObject, prop)) {
                    clonedObject[prop] = cloneRecursive(sourceObject[prop], currentDepth + 1);
                }
            }
            
            return clonedObject;
            
        } catch (exc) {
            return '[Clone Error: ' + exc.message + ']';
        }
    }
    
    try {
        return cloneRecursive(originalObject, 0);
    } catch (exc) {
        return originalObject;
    }
}

/**
 * Safe object merge
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object
 */
function objectMerge(target, source) {
    try {
        var result = objectClone(target, 2);
        
        if (source && typeof source === 'object') {
            for (var prop in source) {
                if (objectHasOwnProperty(source, prop)) {
                    result[prop] = source[prop];
                }
            }
        }
        
        return result;
        
    } catch (exc) {
        return target || {};
    }
}

// =============================================================================
// SYSTEM INITIALIZATION
// =============================================================================

// Initialize the module system immediately
try {
    var initResult = initializeModuleSystem();
    if (!initResult.success) {
        throw new Error('Bootstrap initialization failed: ' + initResult.error);
    }
} catch (exc) {
    // Fatal error - cannot continue
    throw new Error('FATAL: Bootstrap foundation failed to initialize: ' + exc.message);
}

// Register this module as the foundation
registerModule('1.1_bootstrap-foundation', '3.1', [
    // System Functions
    'checkEnvironmentCompatibility', 'initializeModuleSystem', 'isModuleLoaded',
    'getModuleLoadingStatus', 'getMissingDependencies', 'generateLoadingReport',
    
    // Module Management
    'registerModule', 'functionExists', 'validateDependencies', 'createDependencyError',
    
    // Array Utilities (ES3)
    'arrayIndexOf', 'arraySlice', 'arrayJoin', 'arrayConcat',
    
    // String Utilities (ES3)
    'stringIndexOf', 'stringSubstring',
    
    // Object Utilities (ES3)
    'objectHasOwnProperty', 'objectClone', 'objectMerge'
]);

// =============================================================================
// END OF 1.1_bootstrap-foundation.jsx
// =============================================================================