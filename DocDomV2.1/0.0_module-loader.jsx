// =============================================================================
// 0.0_module-loader.jsx - MODULE LOADING SYSTEM
// InDesign DOM Discovery Builder v2.1.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: Manage sequential module loading with dependency validation
// DEPENDENCIES: NONE (Bootstrap module)
// SIZE: ~400 lines
// =============================================================================

// =============================================================================
// GLOBAL MODULE SYSTEM
// =============================================================================

var g_moduleSystem = {
    loadedModules: {},
    loadOrder: [
        '1.0_safe-foundation',
        '2.0_dom-enumerator', 
        '3.0_collection-sampler',
        '4.0_property-sampler',
        '5.0_dom-exporter',
        '6.0_json-analyzer',
        '7.0_dom-comparator',
        '8.0_deep-mapper',
        '9.0_dom-visualizer',
        '10.0_advanced-ui'
    ],
    loadStatus: {
        totalModules: 10,
        loadedCount: 0,
        failedModules: [],
        startTime: null,
        endTime: null
    }
};

// =============================================================================
// ENVIRONMENT COMPATIBILITY CHECKING
// =============================================================================

/**
 * Check InDesign environment compatibility
 * @returns {Object} Compatibility report
 */
function checkEnvironmentCompatibility() {
    var report = {
        compatible: false,
        indesignVersion: 'unknown',
        esVersion: 'unknown',
        capabilities: {},
        warnings: [],
        errors: []
    };
    
    try {
        // Check if we're in InDesign
        if (typeof app === 'undefined') {
            report.errors.push('Not running in InDesign environment');
            return report;
        }
        
        // Detect InDesign version
        try {
            report.indesignVersion = app.version || 'unknown';
            
            // Check for CS3+ compatibility (minimum requirement)
            var versionNumber = parseFloat(report.indesignVersion);
            if (versionNumber < 5.0) {
                report.errors.push('InDesign version too old. Minimum CS3 (5.0) required');
                return report;
            }
            
        } catch (exc) {
            report.warnings.push('Could not detect InDesign version');
        }
        
        // Test ES3 environment
        report.esVersion = 'ES3';
        
        // Test critical ES3 features
        var testResults = testES3Features();
        report.capabilities = testResults;
        
        if (testResults.basicFunctionsWork && testResults.objectIterationWorks && testResults.errorHandlingWorks) {
            report.compatible = true;
        } else {
            report.errors.push('Critical ES3 features not working properly');
        }
        
        // Check for potentially problematic features
        if (typeof JSON !== 'undefined') {
            report.capabilities.nativeJSON = true;
        } else {
            report.warnings.push('Native JSON not available - will use ES3 fallback');
        }
        
        return report;
        
    } catch (exc) {
        report.errors.push('Environment check failed: ' + exc.message);
        return report;
    }
}

/**
 * Test essential ES3 features
 * @returns {Object} Test results
 */
function testES3Features() {
    var results = {
        basicFunctionsWork: false,
        objectIterationWorks: false,
        errorHandlingWorks: false,
        stringOperationsWork: false,
        arrayOperationsWork: false
    };
    
    try {
        // Test basic function creation and calling
        var testFunc = function() { return 'test'; };
        results.basicFunctionsWork = (testFunc() === 'test');
        
        // Test object iteration
        var testObj = { a: 1, b: 2 };
        var count = 0;
        for (var key in testObj) {
            if (testObj.hasOwnProperty && testObj.hasOwnProperty(key)) {
                count++;
            }
        }
        results.objectIterationWorks = (count === 2);
        
        // Test error handling
        try {
            throw new Error('test error');
        } catch (e) {
            results.errorHandlingWorks = (e.message === 'test error');
        }
        
        // Test string operations
        var testStr = 'Hello World';
        results.stringOperationsWork = (testStr.charAt(0) === 'H' && testStr.length === 11);
        
        // Test array operations  
        var testArray = [1, 2, 3];
        results.arrayOperationsWork = (testArray.length === 3 && testArray[0] === 1);
        
    } catch (exc) {
        // If any test fails catastrophically, we know ES3 support is problematic
    }
    
    return results;
}

// =============================================================================
// MODULE LOADING FUNCTIONS
// =============================================================================

/**
 * Initialize the module loading system
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
        
        // Initialize module registry (will be enhanced by 1.0_safe-foundation)
        if (typeof g_moduleRegistry === 'undefined') {
            // Create basic registry that will be enhanced
            window.g_moduleRegistry = {
                modules: {},
                functions: {},
                loadOrder: g_moduleSystem.loadOrder.slice()
            };
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
 * Register a module as loaded
 * @param {String} moduleName - Name of module
 * @param {String} version - Module version
 * @param {Array} exportedFunctions - List of exported functions
 * @returns {Boolean} True if registration successful
 */
function registerModuleLoaded(moduleName, version, exportedFunctions) {
    try {
        g_moduleSystem.loadedModules[moduleName] = {
            loaded: true,
            version: version || '2.1.1',
            functions: exportedFunctions || [],
            loadTime: new Date().getTime(),
            loadOrder: g_moduleSystem.loadStatus.loadedCount
        };
        
        g_moduleSystem.loadStatus.loadedCount++;
        
        // Output progress
        $.writeln('[Module Loader] Loaded: ' + moduleName + ' (' + 
                 g_moduleSystem.loadStatus.loadedCount + '/' + 
                 g_moduleSystem.loadStatus.totalModules + ')');
        
        return true;
        
    } catch (exc) {
        return false;
    }
}

/**
 * Get module loading status report
 * @returns {Object} Loading status report
 */
function getModuleLoadingStatus() {
    try {
        var status = {
            totalModules: g_moduleSystem.loadStatus.totalModules,
            loadedCount: g_moduleSystem.loadStatus.loadedCount,
            failedCount: g_moduleSystem.loadStatus.failedModules.length,
            loadingComplete: false,
            loadingSuccessful: false,
            loadTime: 0,
            loadedModules: [],
            failedModules: g_moduleSystem.loadStatus.failedModules.slice()
        };
        
        // Calculate load time
        if (g_moduleSystem.loadStatus.startTime) {
            var endTime = g_moduleSystem.loadStatus.endTime || new Date().getTime();
            status.loadTime = endTime - g_moduleSystem.loadStatus.startTime;
        }
        
        // Check if loading is complete
        status.loadingComplete = (status.loadedCount + status.failedCount) >= status.totalModules;
        status.loadingSuccessful = (status.loadedCount === status.totalModules && status.failedCount === 0);
        
        // Get list of loaded modules
        for (var moduleName in g_moduleSystem.loadedModules) {
            if (g_moduleSystem.loadedModules.hasOwnProperty && 
                g_moduleSystem.loadedModules.hasOwnProperty(moduleName)) {
                var moduleInfo = g_moduleSystem.loadedModules[moduleName];
                if (moduleInfo.loaded) {
                    status.loadedModules.push({
                        name: moduleName,
                        version: moduleInfo.version,
                        functions: moduleInfo.functions.length,
                        loadOrder: moduleInfo.loadOrder
                    });
                }
            }
        }
        
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
 * Check for missing dependencies
 * @param {Array} requiredModules - List of required module names
 * @returns {Array} List of missing modules
 */
function getMissingModules(requiredModules) {
    var missing = [];
    
    try {
        if (!requiredModules || !requiredModules.length) {
            return missing;
        }
        
        for (var i = 0; i < requiredModules.length; i++) {
            var moduleName = requiredModules[i];
            if (!isModuleLoaded(moduleName)) {
                missing.push(moduleName);
            }
        }
        
    } catch (exc) {
        // Return all as missing if we can't check
        return requiredModules.slice();
    }
    
    return missing;
}

/**
 * Generate loading report for display
 * @returns {String} Formatted loading report
 */
function generateLoadingReport() {
    try {
        var status = getModuleLoadingStatus();
        var report = [];
        
        report.push('InDesign DOM Discovery Builder v2.1.1');
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
                report.push((module.loadOrder + 1) + '. ' + module.name + ' v' + module.version + 
                           ' (' + module.functions + ' functions)');
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
        report.push('ENVIRONMENT INFO:');
        report.push('-----------------');
        report.push('InDesign Version: ' + compatibility.indesignVersion);
        report.push('ES Version: ' + compatibility.esVersion);
        report.push('Native JSON: ' + (compatibility.capabilities.nativeJSON ? 'Available' : 'Not Available'));
        
        if (compatibility.warnings.length > 0) {
            report.push('');
            report.push('WARNINGS:');
            report.push('---------');
            for (var k = 0; k < compatibility.warnings.length; k++) {
                report.push('• ' + compatibility.warnings[k]);
            }
        }
        
        return report.join('\n');
        
    } catch (exc) {
        return 'Error generating loading report: ' + exc.message;
    }
}

// =============================================================================
// BOOTSTRAP INITIALIZATION
// =============================================================================

/**
 * Bootstrap the module system
 * @returns {Object} Bootstrap result
 */
function bootstrapModuleSystem() {
    try {
        $.writeln('[Module Loader] Initializing InDesign DOM Discovery Builder v2.1.1...');
        
        var initResult = initializeModuleSystem();
        if (!initResult.success) {
            $.writeln('[Module Loader] ERROR: ' + initResult.error);
            return initResult;
        }
        
        $.writeln('[Module Loader] Environment compatible - ' + 
                 initResult.compatibilityReport.indesignVersion);
        $.writeln('[Module Loader] Ready for module loading...');
        
        // Register this bootstrap module
        registerModuleLoaded('0.0_module-loader', '2.1.1', [
            'initializeModuleSystem',
            'checkEnvironmentCompatibility', 
            'isModuleLoaded',
            'registerModuleLoaded',
            'getModuleLoadingStatus',
            'getMissingModules',
            'generateLoadingReport'
        ]);
        
        return initResult;
        
    } catch (exc) {
        var error = 'Bootstrap failed: ' + exc.message;
        $.writeln('[Module Loader] CRITICAL ERROR: ' + error);
        return { success: false, error: error };
    }
}

// Auto-initialize when this script loads
var g_bootstrapResult = bootstrapModuleSystem();

// =============================================================================
// END OF 0.0_module-loader.jsx
// =============================================================================