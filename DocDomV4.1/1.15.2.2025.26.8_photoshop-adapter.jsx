// DocDomV4.1/1.15.2.2025.26.8_photoshop-adapter.jsx
// 1.15.2.2025.26.8_photoshop-adapter.jsx - PHOTOSHOP APP ADAPTER
// DocDom Discovery Builder v4.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: Photoshop-specific app adapter providing standardized interface
// DEPENDENCIES: ["1.1.0.0_bootstrap-foundation.jsx"]
// SIZE: ~400 lines - COMPLETE IMPLEMENTATION - ES3 COMPLIANT - ENHANCED LOGGING
// VERSION: Photoshop 2025 v26.8 (June 2025)
// =============================================================================

// =============================================================================
// DEPENDENCY VALIDATION
// =============================================================================

var PHOTOSHOP_ADAPTER_DEPENDENCIES = ['1.1.0.0_bootstrap-foundation'];
var dependencyCheck = validateDependencies(PHOTOSHOP_ADAPTER_DEPENDENCIES);
if (!dependencyCheck.success) {
    throw new Error('Photoshop Adapter missing dependencies: ' + dependencyCheck.missing.join(', '));
}

// =============================================================================
// PHOTOSHOP APP CONFIGURATION
// =============================================================================

var PHOTOSHOP_APP_INFO = {
    appId: 'photoshop',
    appName: 'Adobe Photoshop',
    expectedAppName: 'Adobe Photoshop',
    supportedVersions: ['2024', '2025'],
    currentVersion: '2025.26.8',
    releaseDate: 'June 2025'
};

var PHOTOSHOP_DANGEROUS_PATHS = [
    'quit', 'exit', 'terminate',
    'preferences.deleteAll', 'preferences.reset',
    'documents.close', 'documents.closeAll',
    'application.quit', 'application.exit',
    'activeDocument.close', 'activeDocument.save',
    'activeDocument.saveAs', 'activeDocument.flatten',
    'parent.parent.parent', 'app.quit',
    'history.purge', 'purge',
    'activeDocument.artLayers.removeAll',
    'activeDocument.layerSets.removeAll'
];

var PHOTOSHOP_COLLECTION_TYPES = [
    'documents', 'layers', 'artLayers', 'layerSets', 'channels',
    'paths', 'historyStates', 'guides', 'fonts', 'colors',
    'swatches', 'brushes', 'patterns', 'gradients', 'actions'
];

// =============================================================================
// APP INFORMATION FUNCTIONS - ENHANCED LOGGING
// =============================================================================

/**
 * Get Photoshop app information - ENHANCED LOGGING
 * @returns {Object} App information
 */
function getAppInfo() {
    logDebug('=== STARTING getAppInfo ===', 'general');
    
    try {
        var appInfo = {
            appId: PHOTOSHOP_APP_INFO.appId,
            appName: PHOTOSHOP_APP_INFO.appName,
            detectedName: 'unknown',
            detectedVersion: 'unknown',
            supportedVersions: PHOTOSHOP_APP_INFO.supportedVersions,
            currentVersion: PHOTOSHOP_APP_INFO.currentVersion,
            releaseDate: PHOTOSHOP_APP_INFO.releaseDate,
            isSupported: false,
            capabilities: {
                hasDocuments: false,
                hasLayers: false,
                hasChannels: false,
                hasPaths: false
            }
        };
        
        // Detect actual app info
        if (typeof app !== 'undefined') {
            if (app.name) {
                appInfo.detectedName = app.name;
                logDebug('Detected app name: ' + appInfo.detectedName, 'general');
                
                // Check if this is actually Photoshop
                if (appInfo.detectedName.indexOf('Photoshop') !== -1) {
                    appInfo.isSupported = true;
                    logInfo('Photoshop app detected and supported', 'general');
                } else {
                    logWarn('App is not Photoshop: ' + appInfo.detectedName, 'general');
                }
            }
            
            if (app.version) {
                appInfo.detectedVersion = app.version;
                logDebug('Detected app version: ' + appInfo.detectedVersion, 'general');
            }
            
            // Check capabilities
            try {
                appInfo.capabilities.hasDocuments = !!(app.documents);
                appInfo.capabilities.hasLayers = !!(app.activeDocument && app.activeDocument.layers);
                appInfo.capabilities.hasChannels = !!(app.activeDocument && app.activeDocument.channels);
                appInfo.capabilities.hasPaths = !!(app.activeDocument && app.activeDocument.pathItems);
                
                logDebug('Photoshop capabilities detected', 'general');
            } catch (exc) {
                logWarn('Capability detection failed: ' + exc.message, 'general');
            }
        }
        
        logInfo('Photoshop app info gathered successfully', 'general');
        return appInfo;
        
    } catch (exc) {
        logError('Photoshop app info gathering failed: ' + exc.message, 'general');
        return {
            appId: PHOTOSHOP_APP_INFO.appId,
            appName: PHOTOSHOP_APP_INFO.appName,
            error: 'App info gathering failed: ' + exc.message,
            isSupported: false
        };
    }
}

/**
 * Validate Photoshop app environment - ENHANCED LOGGING
 * @returns {Object} Validation result
 */
function validateAppEnvironment() {
    logDebug('=== STARTING validateAppEnvironment ===', 'general');
    
    try {
        var result = {
            valid: false,
            appName: 'unknown',
            version: 'unknown',
            document: null,
            warnings: [],
            errors: []
        };
        
        // Check if app exists
        if (typeof app === 'undefined') {
            result.errors.push('Adobe app not available');
            logError('Adobe app not available in validateAppEnvironment', 'general');
            return result;
        }
        
        // Check if this is Photoshop
        if (app.name) {
            result.appName = app.name;
            if (app.name.indexOf('Photoshop') === -1) {
                result.errors.push('App is not Photoshop: ' + app.name);
                logError('Wrong app detected: ' + app.name + ' (expected Photoshop)', 'general');
                return result;
            }
            logDebug('Photoshop app confirmed: ' + app.name, 'general');
        }
        
        // Check version
        if (app.version) {
            result.version = app.version;
            logDebug('Photoshop version: ' + app.version, 'general');
        }
        
        // Check document access
        try {
            if (app.documents && app.documents.length > 0) {
                result.document = app.activeDocument || app.documents[0];
                logDebug('Active Photoshop document: ' + result.document.name, 'general');
            } else {
                result.warnings.push('No active Photoshop documents');
                logWarn('No active Photoshop documents found', 'general');
            }
        } catch (exc) {
            result.warnings.push('Document access failed: ' + exc.message);
            logWarn('Photoshop document access failed: ' + exc.message, 'general');
        }
        
        // Final validation
        result.valid = (result.errors.length === 0);
        
        if (result.valid) {
            logInfo('Photoshop environment validation successful', 'general');
        } else {
            logWarn('Photoshop environment validation failed with ' + result.errors.length + ' errors', 'general');
        }
        
        return result;
        
    } catch (exc) {
        logError('Photoshop environment validation error: ' + exc.message, 'general');
        return {
            valid: false,
            error: 'Environment validation failed: ' + exc.message,
            errors: ['Validation system failure'],
            warnings: []
        };
    }
}

/**
 * Get active Photoshop document - ENHANCED LOGGING
 * @returns {Object} Document info or null
 */
function getActiveDocument() {
    logDebug('Getting active Photoshop document', 'general');
    
    try {
        if (typeof app === 'undefined' || !app.documents) {
            logWarn('Photoshop app or documents not available', 'general');
            return null;
        }
        
        if (app.documents.length === 0) {
            logWarn('No active Photoshop documents', 'general');
            return null;
        }
        
        var doc = app.activeDocument || app.documents[0];
        logDebug('Active Photoshop document found: ' + doc.name, 'general');
        
        // Get additional Photoshop-specific info
        var layerCount = 0;
        var channelCount = 0;
        
        try {
            layerCount = doc.layers ? doc.layers.length : 0;
            channelCount = doc.channels ? doc.channels.length : 0;
        } catch (exc) {
            logWarn('Could not get layer/channel counts: ' + exc.message, 'general');
        }
        
        return {
            name: doc.name,
            path: doc.fullName || 'untitled',
            width: doc.width ? doc.width.value : 0,
            height: doc.height ? doc.height.value : 0,
            layerCount: layerCount,
            channelCount: channelCount,
            colorMode: doc.mode ? doc.mode.toString() : 'unknown',
            resolution: doc.resolution || 72,
            reference: doc
        };
        
    } catch (exc) {
        logError('Failed to get active Photoshop document: ' + exc.message, 'general');
        return null;
    }
}

/**
 * Get Photoshop-specific dangerous paths - MINIMAL LOGGING
 * @returns {Array} Array of dangerous path patterns
 */
function getAppSpecificPaths() {
    logDebug('Getting Photoshop dangerous paths (' + PHOTOSHOP_DANGEROUS_PATHS.length + ' patterns)', 'general');
    return PHOTOSHOP_DANGEROUS_PATHS.slice(); // Return copy
}

/**
 * Get Photoshop collection types - MINIMAL LOGGING
 * @returns {Array} Array of collection type names
 */
function getAppCollections() {
    logDebug('Getting Photoshop collection types (' + PHOTOSHOP_COLLECTION_TYPES.length + ' types)', 'general');
    return PHOTOSHOP_COLLECTION_TYPES.slice(); // Return copy
}

/**
 * Check if path is Photoshop-specific dangerous - MINIMAL LOGGING
 * @param {String} path - Path to check
 * @returns {Boolean} True if path is dangerous
 */
function isAppSpecificDangerousPath(path) {
    try {
        if (!path) {
            return false;
        }
        
        var lowerPath = path.toLowerCase();
        
        for (var i = 0; i < PHOTOSHOP_DANGEROUS_PATHS.length; i++) {
            var dangerousPath = PHOTOSHOP_DANGEROUS_PATHS[i].toLowerCase();
            if (lowerPath.indexOf(dangerousPath) !== -1) {
                logDebug('Photoshop dangerous path detected: ' + path, 'general');
                return true;
            }
        }
        
        return false;
        
    } catch (exc) {
        logWarn('Error checking Photoshop dangerous path: ' + exc.message, 'general');
        return true; // Err on the side of caution
    }
}

/**
 * Get Photoshop document structure interface - ENHANCED LOGGING
 * @returns {Object} Document structure interface
 */
function getDocumentStructureInterface() {
    logDebug('=== STARTING getDocumentStructureInterface ===', 'general');
    
    try {
        var docInfo = getActiveDocument();
        if (!docInfo || !docInfo.reference) {
            logWarn('No active Photoshop document for structure interface', 'general');
            return null;
        }
        
        var doc = docInfo.reference;
        var structure = {
            document: {
                name: docInfo.name,
                path: docInfo.path,
                type: 'Photoshop Document',
                width: docInfo.width,
                height: docInfo.height,
                colorMode: docInfo.colorMode,
                resolution: docInfo.resolution
            },
            collections: {},
            metadata: {
                layerCount: docInfo.layerCount,
                channelCount: docInfo.channelCount,
                appVersion: app.version || 'unknown'
            }
        };
        
        // Map Photoshop collections
        try {
            if (doc.layers) structure.collections.layers = doc.layers;
            if (doc.artLayers) structure.collections.artLayers = doc.artLayers;
            if (doc.layerSets) structure.collections.layerSets = doc.layerSets;
            if (doc.channels) structure.collections.channels = doc.channels;
            if (doc.pathItems) structure.collections.paths = doc.pathItems;
            if (doc.historyStates) structure.collections.historyStates = doc.historyStates;
            if (doc.guides) structure.collections.guides = doc.guides;
            
            logDebug('Photoshop document structure interface created with ' + 
                    Object.keys(structure.collections).length + ' collection types', 'general');
        } catch (exc) {
            logWarn('Some Photoshop collections not accessible: ' + exc.message, 'general');
        }
        
        logInfo('Photoshop document structure interface created successfully', 'general');
        return structure;
        
    } catch (exc) {
        logError('Failed to create Photoshop document structure interface: ' + exc.message, 'general');
        return null;
    }
}

/**
 * Get Photoshop adapter version info - MINIMAL LOGGING
 * @returns {Object} Version information
 */
function getAdapterVersion() {
    return {
        module: '1.15.2.2025.26.8_photoshop-adapter',
        appId: PHOTOSHOP_APP_INFO.appId,
        targetApp: PHOTOSHOP_APP_INFO.appName,
        targetVersion: PHOTOSHOP_APP_INFO.currentVersion,
        releaseDate: PHOTOSHOP_APP_INFO.releaseDate
    };
}

// =============================================================================
// MODULE REGISTRATION
// =============================================================================

// Register this Photoshop adapter module
registerModule('1.15.2.2025.26.8_photoshop-adapter', '4.1', [
    // App Information Functions (3)
    'getAppInfo', 'validateAppEnvironment', 'getActiveDocument',
    
    // App-Specific Data Functions (3)
    'getAppSpecificPaths', 'getAppCollections', 'isAppSpecificDangerousPath',
    
    // Document Interface Functions (2)
    'getDocumentStructureInterface', 'getAdapterVersion'
]);

logInfo('Photoshop adapter v1.15.2.2025.26.8 loaded successfully (8 functions)', 'general');

// =============================================================================
// END OF 1.15.2.2025.26.8_photoshop-adapter.jsx - PHOTOSHOP APP ADAPTER
// =============================================================================