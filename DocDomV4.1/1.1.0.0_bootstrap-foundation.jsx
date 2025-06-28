// DocDomV4.1/1.1.0.0_bootstrap-foundation.jsx
// 1.1.0.0_bootstrap-foundation.jsx - CORE MODULE SYSTEM FOUNDATION + LOGGING SYSTEM
// DocDom Discovery Builder v4.1 - PRODUCTION READY - SWAPPABLE ADAPTER SUPPORT
// =============================================================================
// PURPOSE: Core module system, registration, environment validation, unified logging, and adapter management
// DEPENDENCIES: None (this is the foundation module)
// SIZE: ~900 lines - FOCUSED IMPLEMENTATION - ES3 COMPLIANT - COMPREHENSIVE LOGGING - ADAPTER AGNOSTIC
// CHANGES FROM 4.0: Enhanced adapter support, dynamic load order, improved app detection, streamlined assembly
// =============================================================================

// =============================================================================
// CORE MODULE SYSTEM GLOBALS - ENHANCED FOR ADAPTER SUPPORT
// =============================================================================

// Global module system configuration - ADAPTER AGNOSTIC
var g_moduleSystem = {
    version: '4.1',
    initialized: false,
    loadedModules: {},
    adapterType: null,  // Will be set by selected adapter (indesign, photoshop, illustrator, etc.)
    adapterModule: null, // Will store the loaded adapter module name
    
    // Base load order (adapters will be inserted at position 1)
    baseLoadOrder: [
        '1.1.0.0_bootstrap-foundation',
        // ADAPTER SLOT - will be filled dynamically
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
    ],
    
    // Current load order (will be built at runtime based on adapter)
    loadOrder: [],
    
    // Known adapter configurations
    knownAdapters: {
        'indesign': {
            module: '1.15.1.2025.20.4_indesign-adapter',
            appName: 'Adobe InDesign',
            version: '2025.20.4',
            position: 1
        },
        'photoshop': {
            module: '1.15.2.2025.26.8_photoshop-adapter', 
            appName: 'Adobe Photoshop',
            version: '2025.26.8',
            position: 1
        },
        'illustrator': {
            module: '1.15.3.2025.xx.x_illustrator-adapter',
            appName: 'Adobe Illustrator', 
            version: '2025.xx.x',
            position: 1
        }
    }
};

// Global module registry - ADAPTER AWARE
var g_moduleRegistry = {
    modules: {},
    functions: {},
    loadOrder: [],
    adapterFunctions: {} // Track which functions come from adapters
};

// Global module loading status tracking - ENHANCED
var g_moduleLoadStatus = {
    startTime: 0,
    endTime: 0,
    baseModules: 11,  // Modules without adapter
    totalModules: 11, // Will be 12 when adapter is included
    loadedCount: 0,
    failedCount: 0,
    failedModules: [],
    adapterLoaded: false,
    adapterType: null
};

// =============================================================================
// UNIFIED LOGGING SYSTEM - ENHANCED FOR ADAPTER CONTEXT
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
        adapter: true,      // NEW: Adapter-specific logging
        assembly: true,     // NEW: Assembly process logging
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
 * Initialize logging configuration - ENHANCED FOR ADAPTER CONTEXT
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
        
        logDebug('Logging system initialized in 1.1.0.0_bootstrap-foundation v4.1', 'general');
        
    } catch (exc) {
        // Fallback to minimal config
        g_loggingConfig = {
            enabled: true,
            levels: { ERROR: true, WARN: true, INFO: true, DEBUG: false },
            categories: { general: true, adapter: true, assembly: true }
        };
    }
}

/**
 * Core logging function - ENHANCED WITH ADAPTER CONTEXT
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
        
        // Add adapter context if available
        if (g_moduleSystem.adapterType) {
            logEntry += ' [' + g_moduleSystem.adapterType.toUpperCase() + ']';
        }
        
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
 * Log info message
 * @param {String} message - Message to log
 * @param {String} category - Category (optional)
 */
function logInfo(message, category) {
    logMessage('INFO', message, category);
}

/**
 * Log debug message
 * @param {String} message - Message to log
 * @param {String} category - Category (optional)
 */
function logDebug(message, category) {
    logMessage('DEBUG', message, category);
}

/**
 * Log warning message
 * @param {String} message - Message to log
 * @param {String} category - Category (optional)
 */
function logWarn(message, category) {
    logMessage('WARN', message, category);
}

/**
 * Log error message
 * @param {String} message - Message to log
 * @param {String} category - Category (optional)
 */
function logError(message, category) {
    logMessage('ERROR', message, category);
}

// =============================================================================
// ADAPTER MANAGEMENT SYSTEM - NEW FOR v4.1
// =============================================================================

/**
 * Set the adapter type and update load order
 * @param {String} adapterType - Type of adapter (indesign, photoshop, illustrator)
 * @returns {Object} Setup result
 */
function setAdapterType(adapterType) {
    logDebug('=== STARTING setAdapterType: ' + adapterType + ' ===', 'adapter');
    
    try {
        if (!adapterType) {
            logWarn('No adapter type specified - running without adapter', 'adapter');
            g_moduleSystem.loadOrder = g_moduleSystem.baseLoadOrder.slice();
            g_moduleLoadStatus.totalModules = g_moduleLoadStatus.baseModules;
            return {
                success: true,
                adapterType: 'none',
                message: 'No adapter configured - using base modules only'
            };
        }
        
        var adapterConfig = g_moduleSystem.knownAdapters[adapterType.toLowerCase()];
        if (!adapterConfig) {
            logError('Unknown adapter type: ' + adapterType, 'adapter');
            return {
                success: false,
                error: 'Unknown adapter type: ' + adapterType + '. Known adapters: ' + Object.keys(g_moduleSystem.knownAdapters).join(', ')
            };
        }
        
        // Set adapter in system
        g_moduleSystem.adapterType = adapterType.toLowerCase();
        g_moduleSystem.adapterModule = adapterConfig.module;
        
        // Build load order with adapter
        g_moduleSystem.loadOrder = g_moduleSystem.baseLoadOrder.slice();
        g_moduleSystem.loadOrder.splice(adapterConfig.position, 0, adapterConfig.module);
        
        // Update registry load order
        g_moduleRegistry.loadOrder = g_moduleSystem.loadOrder.slice();
        
        // Update total module count
        g_moduleLoadStatus.totalModules = g_moduleLoadStatus.baseModules + 1;
        g_moduleLoadStatus.adapterType = adapterType.toLowerCase();
        
        logInfo('Adapter configured: ' + adapterType + ' (' + adapterConfig.module + ')', 'adapter');
        logDebug('Load order updated with ' + g_moduleSystem.loadOrder.length + ' modules', 'adapter');
        
        return {
            success: true,
            adapterType: adapterType.toLowerCase(),
            adapterModule: adapterConfig.module,
            loadOrder: g_moduleSystem.loadOrder.slice(),
            message: 'Adapter configured successfully'
        };
        
    } catch (exc) {
        var errorMsg = 'Failed to set adapter type: ' + exc.message;
        logError(errorMsg, 'adapter');
        return {
            success: false,
            error: errorMsg
        };
    }
}

/**
 * Get current adapter information
 * @returns {Object} Adapter information
 */
function getAdapterInfo() {
    try {
        if (!g_moduleSystem.adapterType) {
            return {
                configured: false,
                type: null,
                module: null,
                loaded: false
            };
        }
        
        var adapterConfig = g_moduleSystem.knownAdapters[g_moduleSystem.adapterType];
        var adapterLoaded = isModuleLoaded(g_moduleSystem.adapterModule);
        
        return {
            configured: true,
            type: g_moduleSystem.adapterType,
            module: g_moduleSystem.adapterModule,
            loaded: adapterLoaded,
            config: adapterConfig,
            position: adapterConfig ? adapterConfig.position : -1
        };
        
    } catch (exc) {
        logError('Failed to get adapter info: ' + exc.message, 'adapter');
        return {
            configured: false,
            type: null,
            module: null,
            loaded: false,
            error: exc.message
        };
    }
}

/**
 * Auto-detect adapter type based on current application
 * @returns {String} Detected adapter type or null
 */
function autoDetectAdapterType() {
    logDebug('=== STARTING autoDetectAdapterType ===', 'adapter');
    
    try {
        if (typeof app === 'undefined') {
            logWarn('No Adobe app detected - cannot auto-detect adapter', 'adapter');
            return null;
        }
        
        var appName = app.name ? app.name.toLowerCase() : '';
        logDebug('Detected app name: ' + appName, 'adapter');
        
        // Map app names to adapter types
        if (appName.indexOf('indesign') !== -1) {
            logInfo('Auto-detected InDesign adapter', 'adapter');
            return 'indesign';
        }
        
        if (appName.indexOf('photoshop') !== -1) {
            logInfo('Auto-detected Photoshop adapter', 'adapter');
            return 'photoshop';
        }
        
        if (appName.indexOf('illustrator') !== -1) {
            logInfo('Auto-detected Illustrator adapter', 'adapter');
            return 'illustrator';
        }
        
        logWarn('Could not auto-detect adapter for app: ' + appName, 'adapter');
        return null;
        
    } catch (exc) {
        logError('Auto-detection failed: ' + exc.message, 'adapter');
        return null;
    }
}

// =============================================================================
// ENVIRONMENT COMPATIBILITY - ENHANCED FOR MULTI-APP SUPPORT
// =============================================================================

/**
 * Check environment compatibility - ENHANCED FOR ALL ADOBE APPS
 * @returns {Object} Compatibility report
 */
function checkEnvironmentCompatibility() {
    logDebug('=== STARTING checkEnvironmentCompatibility ===', 'general');
    
    try {
        var result = {
            compatible: false,
            appName: 'unknown',
            appVersion: 'unknown',
            adapterRecommended: null,
            extendscriptVersion: 'unknown',
            features: {
                hasNativeJSON: false,
                hasArrayMethods: false,
                hasStringMethods: false
            },
            warnings: [],
            document: null
        };
        
        // Check Adobe app environment (enhanced detection)
        if (typeof app !== 'undefined') {
            try {
                // Detect app type and version
                if (app.name) {
                    result.appName = app.name;
                    logDebug('Adobe app detected: ' + result.appName, 'general');
                    
                    // Recommend adapter based on app
                    var appLower = result.appName.toLowerCase();
                    if (appLower.indexOf('indesign') !== -1) {
                        result.adapterRecommended = 'indesign';
                    } else if (appLower.indexOf('photoshop') !== -1) {
                        result.adapterRecommended = 'photoshop';
                    } else if (appLower.indexOf('illustrator') !== -1) {
                        result.adapterRecommended = 'illustrator';
                    }
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
            if (result.adapterRecommended) {
                logInfo('Recommended adapter: ' + result.adapterRecommended, 'adapter');
            }
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
 * Initialize module system - ENHANCED FOR ADAPTER SUPPORT
 * @param {Object} options - Initialization options
 * @returns {Object} Initialization result
 */
function initializeModuleSystem(options) {
    var startTime = new Date().getTime();
    logDebug('=== STARTING initializeModuleSystem ===', 'general');
    
    try {
        options = options || {};
        
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
        
        logInfo('Environment compatibility verified for ' + envCheck.appName, 'general');
        
        // Auto-configure adapter if not specified and environment supports it
        if (!options.adapterType && envCheck.adapterRecommended) {
            logInfo('Auto-configuring adapter: ' + envCheck.adapterRecommended, 'adapter');
            var adapterResult = setAdapterType(envCheck.adapterRecommended);
            if (adapterResult.success) {
                options.adapterType = envCheck.adapterRecommended;
            }
        } else if (options.adapterType) {
            // Manually specified adapter
            logInfo('Configuring specified adapter: ' + options.adapterType, 'adapter');
            var manualAdapterResult = setAdapterType(options.adapterType);
            if (!manualAdapterResult.success) {
                logWarn('Failed to configure adapter: ' + manualAdapterResult.error, 'adapter');
            }
        } else {
            // No adapter
            logInfo('No adapter configured - using base module set', 'adapter');
            g_moduleSystem.loadOrder = g_moduleSystem.baseLoadOrder.slice();
            g_moduleRegistry.loadOrder = g_moduleSystem.loadOrder.slice();
        }
        
        // Initialize core structures
        g_moduleSystem.loadedModules = {};
        g_moduleRegistry.modules = {};
        g_moduleRegistry.functions = {};
        g_moduleRegistry.adapterFunctions = {};
        
        logDebug('Module system core structures initialized', 'general');
        
        // Mark as initialized
        g_moduleSystem.initialized = true;
        
        var endTime = new Date().getTime();
        var duration = endTime - startTime;
        
        logInfo('Module system initialized successfully in ' + duration + 'ms', 'general');
        logInfo('Load order: ' + g_moduleSystem.loadOrder.length + ' modules configured', 'general');
        
        return {
            success: true,
            message: 'Module system initialized successfully',
            environment: {
                app: envCheck.appName,
                appVersion: envCheck.appVersion,
                extendscript: envCheck.extendscriptVersion,
                features: envCheck.features,
                adapterRecommended: envCheck.adapterRecommended
            },
            adapter: getAdapterInfo(),
            loadOrder: g_moduleSystem.loadOrder.slice(),
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
// MODULE MANAGEMENT FUNCTIONS - ENHANCED FOR ADAPTER SUPPORT
// =============================================================================

/**
 * Check if module is loaded
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
 * Get comprehensive module loading status - ENHANCED FOR ADAPTER TRACKING
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
            failedModules: [],
            adapterInfo: getAdapterInfo()
        };
        
        // Count loaded modules
        if (g_moduleSystem.loadedModules) {
            for (var moduleName in g_moduleSystem.loadedModules) {
                if (g_moduleSystem.loadedModules[moduleName] && 
                    g_moduleSystem.loadedModules[moduleName].loaded) {
                    status.loadedCount++;
                    
                    var moduleInfo = g_moduleSystem.loadedModules[moduleName];
                    var isAdapter = (moduleName === g_moduleSystem.adapterModule);
                    
                    status.loadedModules.push({
                        name: moduleName,
                        version: moduleInfo.version,
                        functions: moduleInfo.functions ? moduleInfo.functions.length : 0,
                        loadOrder: moduleInfo.loadOrder || 0,
                        isAdapter: isAdapter,
                        adapterType: isAdapter ? g_moduleSystem.adapterType : null
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
        
        // Check adapter status
        if (g_moduleSystem.adapterModule) {
            status.adapterInfo.loaded = isModuleLoaded(g_moduleSystem.adapterModule);
            g_moduleLoadStatus.adapterLoaded = status.adapterInfo.loaded;
        }
        
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
            adapterInfo: { configured: false, loaded: false },
            error: 'Status generation failed: ' + exc.message
        };
    }
}

/**
 * Get missing dependencies for required modules
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
 * Generate comprehensive loading report - ENHANCED FOR ADAPTER DISPLAY
 * @returns {String} Formatted loading report
 */
function generateLoadingReport() {
    logDebug('=== STARTING generateLoadingReport ===', 'general');
    
    try {
        var status = getModuleLoadingStatus();
        var compatibility = checkEnvironmentCompatibility();
        var adapterInfo = getAdapterInfo();
        var report = [];
        
        logDebug('Generating report with ' + status.loadedCount + ' loaded modules', 'general');
        
        report.push('DocDom Discovery Builder v4.1');
        report.push('Module Loading Report - Adapter Support');
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
        
        // Adapter information
        report.push('ADAPTER CONFIGURATION:');
        report.push('----------------------');
        if (adapterInfo.configured) {
            report.push('Type: ' + adapterInfo.type);
            report.push('Module: ' + adapterInfo.module);
            report.push('Status: ' + (adapterInfo.loaded ? 'LOADED' : 'NOT LOADED'));
            if (adapterInfo.config) {
                report.push('Target App: ' + adapterInfo.config.appName);
                report.push('Version: ' + adapterInfo.config.version);
            }
        } else {
            report.push('No adapter configured (base modules only)');
        }
        report.push('');
        
        // Loaded modules
        if (status.loadedModules.length > 0) {
            report.push('LOADED MODULES:');
            report.push('---------------');
            for (var i = 0; i < status.loadedModules.length; i++) {
                var module = status.loadedModules[i];
                var moduleDesc = (module.loadOrder + 1) + '. ' + module.name + 
                               ' v' + module.version + ' (' + module.functions + ' functions)';
                if (module.isAdapter) {
                    moduleDesc += ' [ADAPTER: ' + module.adapterType.toUpperCase() + ']';
                }
                report.push(moduleDesc);
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
        if (compatibility.adapterRecommended) {
            report.push('Recommended Adapter: ' + compatibility.adapterRecommended);
        }
        
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
// MODULE REGISTRATION SYSTEM - ENHANCED FOR ADAPTER TRACKING
// =============================================================================

/**
 * Register module with its functions - ENHANCED FOR ADAPTER TRACKING
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
        
        var isAdapter = (moduleName === g_moduleSystem.adapterModule);
        var logCategory = isAdapter ? 'adapter' : 'general';
        
        logDebug('Registering ' + (isAdapter ? 'ADAPTER ' : '') + 'module with ' + (functionList ? functionList.length : 0) + ' functions', logCategory);
        
        // ES3 COMPLIANT: Explicit property assignment instead of destructuring
        var moduleEntry = g_moduleSystem.loadedModules[moduleName];
        moduleEntry.loaded = true;
        moduleEntry.version = version;
        moduleEntry.functions = functionList || [];
        moduleEntry.timestamp = new Date().getTime();
        moduleEntry.isAdapter = isAdapter;
        
        // Set load order if available
        for (var i = 0; i < g_moduleSystem.loadOrder.length; i++) {
            if (g_moduleSystem.loadOrder[i] === moduleName) {
                moduleEntry.loadOrder = i;
                logDebug('Module load order set to: ' + i, logCategory);
                break;
            }
        }
        
        // Update registry with function names
        if (functionList) {
            logDebug('Registering ' + functionList.length + ' functions in function registry', logCategory);
            for (var j = 0; j < functionList.length; j++) {
                var funcName = functionList[j];
                if (!g_moduleRegistry.functions[funcName]) {
                    g_moduleRegistry.functions[funcName] = [];
                }
                g_moduleRegistry.functions[funcName].push(moduleName);
                
                // Track adapter functions separately
                if (isAdapter) {
                    if (!g_moduleRegistry.adapterFunctions[funcName]) {
                        g_moduleRegistry.adapterFunctions[funcName] = [];
                    }
                    g_moduleRegistry.adapterFunctions[funcName].push(moduleName);
                }
            }
        }
        
        // ES3 COMPLIANT: Explicit property assignment
        var registryEntry = {
            version: version,
            functionCount: functionList ? functionList.length : 0,
            isAdapter: isAdapter,
            adapterType: isAdapter ? g_moduleSystem.adapterType : null
        };
        g_moduleRegistry.modules[moduleName] = registryEntry;
        
        // Update load statistics
        g_moduleLoadStatus.loadedCount++;
        if (isAdapter) {
            g_moduleLoadStatus.adapterLoaded = true;
        }
        
        var successMsg = (isAdapter ? 'ADAPTER ' : '') + 'Module registered successfully: ' + moduleName + ' v' + version + ' (' + (functionList ? functionList.length : 0) + ' functions)';
        logInfo(successMsg, logCategory);
        
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
 * Validate dependencies for a module
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
 * Create dependency error message
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
        
        // Show correct load order (including adapter if configured)
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
// SYSTEM INITIALIZATION - ENHANCED FOR ADAPTER SUPPORT
// =============================================================================

// Initialize the logging system first
try {
    initializeLoggingConfig();
    logInfo('Bootstrap foundation logging system initialized v4.1', 'general');
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
    
    // Log adapter configuration
    if (initResult.adapter && initResult.adapter.configured) {
        logInfo('Adapter auto-configured: ' + initResult.adapter.type, 'adapter');
    }
    
} catch (exc) {
    // Fatal error - cannot continue
    var fatalError = 'FATAL: Bootstrap foundation failed to initialize: ' + exc.message;
    logError(fatalError, 'general');
    throw new Error(fatalError);
}

// Register this module as the foundation (v4.1 with adapter support)
registerModule('1.1.0.0_bootstrap-foundation', '4.1', [
    // System Functions (6)
    'checkEnvironmentCompatibility', 'initializeModuleSystem', 'isModuleLoaded',
    'getModuleLoadingStatus', 'getMissingDependencies', 'generateLoadingReport',
    
    // Module Management (3)
    'registerModule', 'validateDependencies', 'createDependencyError',
    
    // Logging System (6)
    'initializeLoggingConfig', 'logMessage', 'logInfo', 'logDebug', 'logWarn', 'logError',
    
    // Adapter Management (4) - NEW for v4.1
    'setAdapterType', 'getAdapterInfo', 'autoDetectAdapterType'
]);

// Mark loading completion
g_moduleLoadStatus.endTime = new Date().getTime();

logInfo('1.1.0.0_bootstrap-foundation.jsx v4.1 loaded successfully with 19 functions (15 core + 4 adapter) for swappable adapter support', 'general');

// =============================================================================
// END OF 1.1.0.0_bootstrap-foundation.jsx - v4.1 WITH SWAPPABLE ADAPTER SUPPORT
// =============================================================================