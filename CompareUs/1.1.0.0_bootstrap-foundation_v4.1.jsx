// DocDomV4.1/1.1.0.0_bootstrap-foundation.jsx
// 1.1.0.0_bootstrap-foundation.jsx - CORE MODULE SYSTEM FOUNDATION + LOGGING SYSTEM
// DocDom Discovery Builder v4.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: Core module system, registration, environment validation, and unified logging system
// DEPENDENCIES: None (this is the foundation module)
// SIZE: ~800 lines - FOCUSED IMPLEMENTATION - ES3 COMPLIANT - COMPREHENSIVE LOGGING
// CHANGES FROM 3.1: Removed ES3 utilities (moved to 1.2), added logging system from 1.2, enhanced strategic logging, made app-agnostic
// =============================================================================

// =============================================================================
// CORE MODULE SYSTEM GLOBALS
// =============================================================================

// Global module system configuration - NO WINDOW REFERENCES
var g_moduleSystem = {
    version: '4.1',
    initialized: false,
    loadedModules: {},
    loadOrder: [
        '1.1.0.0_bootstrap-foundation',
        '1.15.1.2025.20.4_indesign-adapter',    // InDesign 2025 v20.4 adapter
        // Future app adapters: 1.15.2.2025.26.7_photoshop-adapter, etc.
        '1.2.0.0_safety-utilities',
        '2.1.0.0_dom-enumerator',
        '2.2.0.0_collection-sampler',
        '3.1.0.0_property-sampler',
        '3.2.0.0_dom-exporter',
        '4.1.0.0_json-analyzer',
        '4.2.0.0_dom-comparator',
        '5.1.0.0_deep-mapper',
        '5.2.0.0_dom-visualizer',
        '6.1.0.0_advanced-ui'
    ]
};

// Global module registry - NO WINDOW REFERENCES
var g_moduleRegistry = {
    modules: {},
    functions: {},
    loadOrder: g_moduleSystem.loadOrder.slice()
};

// Global module loading status tracking
var g_moduleLoadStatus = {
    startTime: 0,
    endTime: 0,
    totalModules: 11,
    loadedCount: 0,
    failedCount: 0,
    failedModules: []
};

// =============================================================================
// UNIFIED LOGGING SYSTEM - MOVED FROM 1.2.0.0 FOR FOUNDATIONAL ACCESS
// =============================================================================

var DEFAULT_LOGGING_CONFIG = {
    enabled: true,
    levels: {
        ERROR: true,
        WARN: true,
        INFO: true,
        DEBUG: false
    },
    categories: {
        general: true,
        enumeration: true,
        sampling: true,
        display: true,
        exportData: true,
        performance: true,
        circular: true,
        preprocessing: true,
        csv: true,
        json: true,
        text: true,
        file: true,
        analysis: true,
        comparison: true,
        mapping: true,
        ui: true
    }
};

// Global logging configuration
var g_loggingConfig = null;

/**
 * Initialize logging configuration - MOVED FROM 1.2.0.0
 * @param {Object} customConfig - Optional custom configuration
 */
function initializeLoggingConfig(customConfig) {
    try {
        if (customConfig) {
            // Simple merge for custom config
            g_loggingConfig = {};
            for (var prop in DEFAULT_LOGGING_CONFIG) {
                g_loggingConfig[prop] = DEFAULT_LOGGING_CONFIG[prop];
            }
            // Override with custom settings
            if (customConfig.enabled !== undefined) {
                g_loggingConfig.enabled = customConfig.enabled;
            }
            if (customConfig.levels) {
                for (var level in customConfig.levels) {
                    g_loggingConfig.levels[level] = customConfig.levels[level];
                }
            }
            if (customConfig.categories) {
                for (var cat in customConfig.categories) {
                    g_loggingConfig.categories[cat] = customConfig.categories[cat];
                }
            }
        } else {
            // Simple clone of default config
            g_loggingConfig = {};
            for (var defaultProp in DEFAULT_LOGGING_CONFIG) {
                if (typeof DEFAULT_LOGGING_CONFIG[defaultProp] === 'object') {
                    g_loggingConfig[defaultProp] = {};
                    for (var subProp in DEFAULT_LOGGING_CONFIG[defaultProp]) {
                        g_loggingConfig[defaultProp][subProp] = DEFAULT_LOGGING_CONFIG[defaultProp][subProp];
                    }
                } else {
                    g_loggingConfig[defaultProp] = DEFAULT_LOGGING_CONFIG[defaultProp];
                }
            }
        }
        
        logDebug('Logging system initialized in 1.1.0.0_bootstrap-foundation', 'general');
        
    } catch (exc) {
        // Fallback to minimal config
        g_loggingConfig = {
            enabled: true,
            levels: { ERROR: true, WARN: true, INFO: true, DEBUG: false },
            categories: { general: true }
        };
    }
}

/**
 * Core logging function - MOVED FROM 1.2.0.0
 * @param {String} level - Log level (ERROR, WARN, INFO, DEBUG)
 * @param {String} message - Message to log
 * @param {String} category - Category for filtering (optional)
 */
function logMessage(level, message, category) {
    try {
        if (!g_loggingConfig || !g_loggingConfig.enabled) {
            return;
        }

        // Check level
        if (!g_loggingConfig.levels[level]) {
            return;
        }

        // Check category (default to general if not specified)
        var logCategory = category || 'general';
        if (!g_loggingConfig.categories[logCategory]) {
            return;
        }

        // Create timestamp (simple format)
        var now = new Date();
        var timestamp = now.getHours() + ':' + 
                       (now.getMinutes() < 10 ? '0' : '') + now.getMinutes() + ':' +
                       (now.getSeconds() < 10 ? '0' : '') + now.getSeconds();

        var logEntry = '[' + timestamp + '] [' + level + ']';
        
        if (category && category !== 'general') {
            logEntry += ' [' + category + ']';
        }
        
        logEntry += ' ' + message;

        // Use ExtendScript's built-in logging
        if (typeof $ !== 'undefined' && $.writeln) {
            $.writeln(logEntry);
        }

    } catch (exc) {
        // Silent failure to prevent logging from breaking application
    }
}

/**
 * Log info message - MOVED FROM 1.2.0.0
 * @param {String} message - Message to log
 * @param {String} category - Category (optional)
 */
function logInfo(message, category) {
    logMessage('INFO', message, category);
}

/**
 * Log debug message - MOVED FROM 1.2.0.0
 * @param {String} message - Message to log
 * @param {String} category - Category (optional)
 */
function logDebug(message, category) {
    logMessage('DEBUG', message, category);
}

/**
 * Log warning message - MOVED FROM 1.2.0.0
 * @param {String} message - Message to log
 * @param {String} category - Category (optional)
 */
function logWarn(message, category) {
    logMessage('WARN', message, category);
}

/**
 * Log error message - MOVED FROM 1.2.0.0
 * @param {String} message - Message to log
 * @param {String} category - Category (optional)
 */
function logError(message, category) {
    logMessage('ERROR', message, category);
}

// =============================================================================
// ENVIRONMENT COMPATIBILITY - ENHANCED LOGGING
// =============================================================================

/**
 * Check environment compatibility - ENHANCED LOGGING (APP-AGNOSTIC)
 * @returns {Object} Compatibility report
 */
function checkEnvironmentCompatibility() {
    logDebug('=== STARTING checkEnvironmentCompatibility ===', 'general');
    
    try {
        var result = {
            compatible: false,
            appName: 'unknown',
            appVersion: 'unknown',
            extendscriptVersion: 'unknown',
            features: {
                hasNativeJSON: false,
                hasArrayMethods: false,
                hasStringMethods: false
            },
            warnings: [],
            document: null
        };
        
        // Check Adobe app environment (generic detection)
        if (typeof app !== 'undefined') {
            try {
                // Detect app type and version
                if (app.name) {
                    result.appName = app.name;
                    logDebug('Adobe app detected: ' + result.appName, 'general');
                }
                
                if (app.version) {
                    result.appVersion = app.version;
                    logDebug('App version detected: ' + result.appVersion, 'general');
                }
                
                // Try to access documents (works across Adobe apps)
                if (app.documents && app.documents.length > 0) {
                    result.document = app.documents[0];
                    logDebug('Active document found: ' + app.documents[0].name, 'general');
                } else {
                    logWarn('No active documents found', 'general');
                }
            } catch (exc) {
                result.warnings.push('Adobe app accessible but document access failed');
                logWarn('Document access failed: ' + exc.message, 'general');
            }
        } else {
            result.warnings.push('Adobe app not available - ExtendScript environment required');
            logError('Adobe app not available - ExtendScript environment required', 'general');
            return result;
        }
        
        // Check ExtendScript version
        try {
            if (typeof $.version !== 'undefined') {
                result.extendscriptVersion = $.version;
                logDebug('ExtendScript version: ' + result.extendscriptVersion, 'general');
            }
        } catch (exc) {
            result.warnings.push('ExtendScript version detection failed');
            logWarn('ExtendScript version detection failed: ' + exc.message, 'general');
        }
        
        // Check native JSON support
        try {
            if (typeof JSON !== 'undefined' && JSON.parse && JSON.stringify) {
                result.features.hasNativeJSON = true;
                logDebug('Native JSON support available', 'general');
            } else {
                logWarn('Native JSON support not available', 'general');
            }
        } catch (exc) {
            result.warnings.push('Native JSON support not available');
            logWarn('JSON support check failed: ' + exc.message, 'general');
        }
        
        // Check basic Array methods
        try {
            var testArray = [];
            if (testArray.push && testArray.pop && testArray.join) {
                result.features.hasArrayMethods = true;
                logDebug('Basic Array methods available', 'general');
            } else {
                logWarn('Basic Array methods not available', 'general');
            }
        } catch (exc) {
            result.warnings.push('Basic Array methods not available');
            logWarn('Array methods check failed: ' + exc.message, 'general');
        }
        
        // Check basic String methods
        try {
            var testString = '';
            if (testString.indexOf && testString.substring && testString.charAt) {
                result.features.hasStringMethods = true;
                logDebug('Basic String methods available', 'general');
            } else {
                logWarn('Basic String methods not available', 'general');
            }
        } catch (exc) {
            result.warnings.push('Basic String methods not available');
            logWarn('String methods check failed: ' + exc.message, 'general');
        }
        
        // Determine overall compatibility (works for any Adobe app)
        result.compatible = (
            typeof app !== 'undefined' &&
            result.features.hasArrayMethods &&
            result.features.hasStringMethods
        );
        
        if (result.compatible) {
            logInfo('Environment compatibility check passed for ' + result.appName, 'general');
        } else {
            logWarn('Environment compatibility check failed - ' + result.warnings.length + ' warnings', 'general');
        }
        
        return result;
        
    } catch (exc) {
        logError('Environment compatibility check failed: ' + exc.message, 'general');
        return {
            compatible: false,
            error: 'Environment compatibility check failed: ' + exc.message,
            warnings: ['Critical compatibility check failure']
        };
    }
}

/**
 * Initialize module system - ENHANCED LOGGING
 * @returns {Object} Initialization result
 */
function initializeModuleSystem() {
    var startTime = new Date().getTime();
    logDebug('=== STARTING initializeModuleSystem ===', 'general');
    
    try {
        // Record start time
        g_moduleLoadStatus.startTime = startTime;
        
        // Initialize module system
        if (g_moduleSystem.initialized) {
            logDebug('Module system already initialized', 'general');
            return {
                success: true,
                message: 'Module system already initialized'
            };
        }
        
        logDebug('Initializing module system core structures', 'general');
        
        // Validate environment first
        var envCheck = checkEnvironmentCompatibility();
        if (!envCheck.compatible) {
            var errorMsg = 'Environment not compatible: ' + (envCheck.error || 'Unknown compatibility issue');
            logError(errorMsg, 'general');
            return {
                success: false,
                error: errorMsg,
                warnings: envCheck.warnings
            };
        }
        
        logInfo('Environment compatibility verified', 'general');
        
        // Initialize core structures
        g_moduleSystem.loadedModules = {};
        g_moduleRegistry.modules = {};
        g_moduleRegistry.functions = {};
        
        logDebug('Module system core structures initialized', 'general');
        
        // Mark as initialized
        g_moduleSystem.initialized = true;
        
        var endTime = new Date().getTime();
        var duration = endTime - startTime;
        
        logInfo('Module system initialized successfully in ' + duration + 'ms', 'general');
        
        return {
            success: true,
            message: 'Module system initialized successfully',
            environment: {
                app: envCheck.appName,
                appVersion: envCheck.appVersion,
                extendscript: envCheck.extendscriptVersion,
                features: envCheck.features
            },
            initTime: duration
        };
        
    } catch (exc) {
        var errorMsg = 'Module system initialization failed: ' + exc.message;
        logError(errorMsg, 'general');
        return {
            success: false,
            error: errorMsg
        };
    }
}

// =============================================================================
// MODULE MANAGEMENT FUNCTIONS - ENHANCED LOGGING
// =============================================================================

/**
 * Check if module is loaded - MINIMAL LOGGING
 * @param {String} moduleName - Module name to check
 * @returns {Boolean} True if module is loaded
 */
function isModuleLoaded(moduleName) {
    try {
        if (!moduleName) {
            logDebug('isModuleLoaded called with empty module name', 'general');
            return false;
        }
        
        var isLoaded = (
            g_moduleSystem.loadedModules &&
            g_moduleSystem.loadedModules[moduleName] &&
            g_moduleSystem.loadedModules[moduleName].loaded === true
        );
        
        // Only log failures to avoid noise
        if (!isLoaded) {
            logDebug('Module not loaded: ' + moduleName, 'general');
        }
        
        return isLoaded;
        
    } catch (exc) {
        logError('Error checking if module loaded (' + moduleName + '): ' + exc.message, 'general');
        return false;
    }
}

/**
 * Get comprehensive module loading status - ENHANCED LOGGING
 * @returns {Object} Loading status report
 */
function getModuleLoadingStatus() {
    logDebug('Generating module loading status report', 'general');
    
    try {
        var status = {
            totalModules: g_moduleLoadStatus.totalModules,
            loadedCount: 0,
            failedCount: 0,
            loadingComplete: false,
            loadingSuccessful: false,
            loadTime: 0,
            loadedModules: [],
            failedModules: []
        };
        
        // Count loaded modules
        if (g_moduleSystem.loadedModules) {
            for (var moduleName in g_moduleSystem.loadedModules) {
                if (g_moduleSystem.loadedModules[moduleName] && 
                    g_moduleSystem.loadedModules[moduleName].loaded) {
                    status.loadedCount++;
                    
                    var moduleInfo = g_moduleSystem.loadedModules[moduleName];
                    status.loadedModules.push({
                        name: moduleName,
                        version: moduleInfo.version,
                        functions: moduleInfo.functions ? moduleInfo.functions.length : 0,
                        loadOrder: moduleInfo.loadOrder || 0
                    });
                }
            }
        }
        
        // Get failed modules
        if (g_moduleLoadStatus.failedModules) {
            status.failedModules = g_moduleLoadStatus.failedModules.slice();
            status.failedCount = status.failedModules.length;
        }
        
        // Calculate load time
        if (g_moduleLoadStatus.startTime) {
            var endTime = g_moduleLoadStatus.endTime || new Date().getTime();
            status.loadTime = endTime - g_moduleLoadStatus.startTime;
        }
        
        // Check completion status
        status.loadingComplete = (status.loadedCount + status.failedCount) >= status.totalModules;
        status.loadingSuccessful = (status.loadedCount === status.totalModules && status.failedCount === 0);
        
        logDebug('Status report: ' + status.loadedCount + '/' + status.totalModules + ' modules loaded', 'general');
        
        return status;
        
    } catch (exc) {
        logError('Failed to generate module loading status: ' + exc.message, 'general');
        return {
            totalModules: 0,
            loadedCount: 0,
            failedCount: 0,
            loadingComplete: false,
            loadingSuccessful: false,
            loadTime: 0,
            loadedModules: [],
            failedModules: [],
            error: 'Status generation failed: ' + exc.message
        };
    }
}

/**
 * Get missing dependencies for required modules - MINIMAL LOGGING
 * @param {Array} requiredModules - Array of required module names
 * @returns {Array} Array of missing module names
 */
function getMissingDependencies(requiredModules) {
    try {
        var missing = [];
        
        if (requiredModules && requiredModules.length > 0) {
            for (var i = 0; i < requiredModules.length; i++) {
                var moduleName = requiredModules[i];
                if (!isModuleLoaded(moduleName)) {
                    missing.push(moduleName);
                }
            }
        }
        
        // Only log if there are missing dependencies
        if (missing.length > 0) {
            logDebug('Found ' + missing.length + ' missing dependencies: ' + missing.join(', '), 'general');
        }
        
        return missing;
        
    } catch (exc) {
        logError('Error checking missing dependencies: ' + exc.message, 'general');
        // Return all as missing on error
        return requiredModules || [];
    }
}

/**
 * Generate comprehensive loading report - ENHANCED LOGGING
 * @returns {String} Formatted loading report
 */
function generateLoadingReport() {
    logDebug('=== STARTING generateLoadingReport ===', 'general');
    
    try {
        var status = getModuleLoadingStatus();
        var compatibility = checkEnvironmentCompatibility();
        var report = [];
        
        logDebug('Generating report with ' + status.loadedCount + ' loaded modules', 'general');
        
        report.push('DocDom Discovery Builder v4.1');
        report.push('Module Loading Report');
        report.push('==========================================');
        report.push('');
        
        // Loading status
        var statusText = 'SUCCESS';
        if (!status.loadingSuccessful) {
            statusText = status.loadingComplete ? 'COMPLETED WITH ERRORS' : 'IN PROGRESS';
        }
        
        report.push('Loading Status: ' + statusText);
        report.push('Modules Loaded: ' + status.loadedCount + '/' + status.totalModules);
        report.push('Load Time: ' + status.loadTime + 'ms');
        report.push('');
        
        // Loaded modules
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
        
        // Failed modules
        if (status.failedModules.length > 0) {
            report.push('FAILED MODULES:');
            report.push('---------------');
            for (var j = 0; j < status.failedModules.length; j++) {
                report.push('• ' + status.failedModules[j]);
            }
            report.push('');
            logWarn('Report includes ' + status.failedModules.length + ' failed modules', 'general');
        }
        
        // Environment information
        report.push('ENVIRONMENT:');
        report.push('------------');
        report.push('App: ' + compatibility.appName);
        report.push('App Version: ' + compatibility.appVersion);
        report.push('ExtendScript Version: ' + compatibility.extendscriptVersion);
        report.push('Native JSON: ' + (compatibility.features.hasNativeJSON ? 'Yes' : 'No'));
        report.push('Array Methods: ' + (compatibility.features.hasArrayMethods ? 'Yes' : 'No'));
        report.push('String Methods: ' + (compatibility.features.hasStringMethods ? 'Yes' : 'No'));
        report.push('Compatible: ' + (compatibility.compatible ? 'Yes' : 'No'));
        
        // Warnings
        if (compatibility.warnings && compatibility.warnings.length > 0) {
            report.push('');
            report.push('WARNINGS:');
            report.push('---------');
            for (var w = 0; w < compatibility.warnings.length; w++) {
                report.push('• ' + compatibility.warnings[w]);
            }
            logWarn('Report includes ' + compatibility.warnings.length + ' compatibility warnings', 'general');
        }
        
        var reportText = report.join('\n');
        var reportLength = reportText.length;
        
        logInfo('Loading report generated successfully (' + reportLength + ' characters)', 'general');
        
        return reportText;
        
    } catch (exc) {
        var errorMsg = 'Loading report generation failed: ' + exc.message;
        logError(errorMsg, 'general');
        return errorMsg;
    }
}

// =============================================================================
// MODULE REGISTRATION SYSTEM - ENHANCED LOGGING
// =============================================================================

/**
 * Register module with its functions - ENHANCED LOGGING (ES3 COMPLIANT)
 * @param {String} moduleName - Module name
 * @param {String} version - Module version
 * @param {Array} functionList - List of functions provided by this module
 */
function registerModule(moduleName, version, functionList) {
    logDebug('=== STARTING registerModule: ' + moduleName + ' v' + version + ' ===', 'general');
    
    try {
        // Initialize module entry
        if (!g_moduleSystem.loadedModules[moduleName]) {
            g_moduleSystem.loadedModules[moduleName] = {};
        }
        
        logDebug('Registering module with ' + (functionList ? functionList.length : 0) + ' functions', 'general');
        
        // ES3 COMPLIANT: Explicit property assignment instead of destructuring
        var moduleEntry = g_moduleSystem.loadedModules[moduleName];
        moduleEntry.loaded = true;
        moduleEntry.version = version;
        moduleEntry.functions = functionList || [];
        moduleEntry.timestamp = new Date().getTime();
        
        // Set load order if available
        for (var i = 0; i < g_moduleSystem.loadOrder.length; i++) {
            if (g_moduleSystem.loadOrder[i] === moduleName) {
                moduleEntry.loadOrder = i;
                logDebug('Module load order set to: ' + i, 'general');
                break;
            }
        }
        
        // Update registry with function names
        if (functionList) {
            logDebug('Registering ' + functionList.length + ' functions in function registry', 'general');
            for (var j = 0; j < functionList.length; j++) {
                var funcName = functionList[j];
                if (!g_moduleRegistry.functions[funcName]) {
                    g_moduleRegistry.functions[funcName] = [];
                }
                g_moduleRegistry.functions[funcName].push(moduleName);
            }
        }
        
        // ES3 COMPLIANT: Explicit property assignment
        var registryEntry = {
            version: version,
            functionCount: functionList ? functionList.length : 0
        };
        g_moduleRegistry.modules[moduleName] = registryEntry;
        
        // Update load statistics
        g_moduleLoadStatus.loadedCount++;
        
        logInfo('Module registered successfully: ' + moduleName + ' v' + version + ' (' + (functionList ? functionList.length : 0) + ' functions)', 'general');
        
    } catch (exc) {
        logError('Module registration failed for ' + moduleName + ': ' + exc.message, 'general');
        
        // Track failed registration
        if (g_moduleLoadStatus.failedModules.indexOf) {
            // Check if already in failed list
            var alreadyFailed = false;
            for (var k = 0; k < g_moduleLoadStatus.failedModules.length; k++) {
                if (g_moduleLoadStatus.failedModules[k] === moduleName) {
                    alreadyFailed = true;
                    break;
                }
            }
            
            if (!alreadyFailed) {
                g_moduleLoadStatus.failedModules.push(moduleName);
                g_moduleLoadStatus.failedCount++;
                logWarn('Added ' + moduleName + ' to failed modules list', 'general');
            }
        }
    }
}

/**
 * Validate dependencies for a module - ENHANCED LOGGING
 * @param {Array} requiredModules - Array of required module names
 * @returns {Object} Validation result
 */
function validateDependencies(requiredModules) {
    logDebug('=== STARTING validateDependencies ===', 'general');
    
    try {
        // ES3 COMPLIANT: Explicit property assignment
        var result = {
            success: true,
            missing: [],
            loaded: [],
            error: null
        };
        
        if (!requiredModules || requiredModules.length === 0) {
            logDebug('No dependencies to validate', 'general');
            return result;
        }
        
        logDebug('Validating ' + requiredModules.length + ' dependencies', 'general');
        
        for (var i = 0; i < requiredModules.length; i++) {
            var moduleName = requiredModules[i];
            if (isModuleLoaded(moduleName)) {
                result.loaded.push(moduleName);
                logDebug('Dependency available: ' + moduleName, 'general');
            } else {
                result.missing.push(moduleName);
                result.success = false;
                logWarn('Missing dependency: ' + moduleName, 'general');
            }
        }
        
        if (result.success) {
            logInfo('All dependencies validated successfully (' + result.loaded.length + ' modules)', 'general');
        } else {
            logWarn('Dependency validation failed - missing ' + result.missing.length + ' out of ' + requiredModules.length + ' dependencies', 'general');
        }
        
        return result;
        
    } catch (exc) {
        var errorMsg = 'Dependency validation failed: ' + exc.message;
        logError(errorMsg, 'general');
        return {
            success: false,
            missing: requiredModules || [],
            loaded: [],
            error: errorMsg
        };
    }
}

/**
 * Create dependency error message - ENHANCED LOGGING
 * @param {String} moduleName - Module that has missing dependencies
 * @param {Array} missingModules - Array of missing module names
 * @returns {String} Formatted error message
 */
function createDependencyError(moduleName, missingModules) {
    logDebug('Creating dependency error for module: ' + moduleName, 'general');
    
    try {
        if (!missingModules || missingModules.length === 0) {
            logDebug('No missing dependencies for ' + moduleName, 'general');
            return 'Module "' + moduleName + '" has no dependency issues.';
        }
        
        logWarn('Module ' + moduleName + ' has ' + missingModules.length + ' missing dependencies', 'general');
        
        var message = 'Module "' + moduleName + '" requires missing dependencies: ';
        
        for (var i = 0; i < missingModules.length; i++) {
            message += missingModules[i];
            if (i < missingModules.length - 1) {
                message += ', ';
            }
        }
        
        message += '. Load dependencies in correct order: ';
        
        // Show correct load order
        for (var j = 0; j < g_moduleSystem.loadOrder.length; j++) {
            var orderModule = g_moduleSystem.loadOrder[j];
            for (var k = 0; k < missingModules.length; k++) {
                if (orderModule === missingModules[k]) {
                    message += orderModule;
                    if (k < missingModules.length - 1) {
                        message += ', ';
                    }
                    break;
                }
            }
        }
        
        logDebug('Dependency error message created for ' + moduleName, 'general');
        
        return message;
        
    } catch (exc) {
        var errorMsg = 'Dependency error (details unavailable): ' + exc.message;
        logError('Failed to create dependency error message: ' + exc.message, 'general');
        return errorMsg;
    }
}

// =============================================================================
// SYSTEM INITIALIZATION
// =============================================================================

// Initialize the logging system first
try {
    initializeLoggingConfig();
    logInfo('Bootstrap foundation logging system initialized', 'general');
} catch (exc) {
    // Fallback to ExtendScript logging if our system fails
    if (typeof $ !== 'undefined' && $.writeln) {
        $.writeln('[BOOTSTRAP ERROR] Logging initialization failed: ' + exc.message);
    }
}

// Initialize the module system immediately
try {
    var initResult = initializeModuleSystem();
    if (!initResult.success) {
        throw new Error('Bootstrap initialization failed: ' + initResult.error);
    }
    logInfo('Bootstrap foundation module system initialized successfully', 'general');
} catch (exc) {
    // Fatal error - cannot continue
    var fatalError = 'FATAL: Bootstrap foundation failed to initialize: ' + exc.message;
    logError(fatalError, 'general');
    throw new Error(fatalError);
}

// Register this module as the foundation (CORRECTED v4.1 REGISTRATION WITH LOGGING)
registerModule('1.1.0.0_bootstrap-foundation', '4.1', [
    // System Functions (6)
    'checkEnvironmentCompatibility', 'initializeModuleSystem', 'isModuleLoaded',
    'getModuleLoadingStatus', 'getMissingDependencies', 'generateLoadingReport',
    
    // Module Management (3)
    'registerModule', 'validateDependencies', 'createDependencyError',
    
    // Logging System (6) - MOVED FROM 1.2.0.0
    'initializeLoggingConfig', 'logMessage', 'logInfo', 'logDebug', 'logWarn', 'logError'
    
    // NOTE: ES3 utilities REMOVED - now in 1.2.0.0_safety-utilities.jsx
    // REMOVED: functionExists, arrayIndexOf, arraySlice, arrayJoin, arrayConcat,
    //          stringIndexOf, stringSubstring, objectHasOwnProperty, objectClone, objectMerge
]);

// Mark loading completion
g_moduleLoadStatus.endTime = new Date().getTime();

logInfo('1.1.0.0_bootstrap-foundation.jsx loaded successfully with 15 functions (9 module + 6 logging) for DocDom v4.1', 'general');

// =============================================================================
// END OF 1.1.0.0_bootstrap-foundation.jsx - v4.1 ENHANCED WITH UNIFIED LOGGING
// =============================================================================