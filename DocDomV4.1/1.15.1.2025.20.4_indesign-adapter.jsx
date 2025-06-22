// DocDomV4.1/1.15.1.2025.20.4_indesign-adapter.jsx
// 1.15.1.2025.20.4_indesign-adapter.jsx - INDESIGN APP ADAPTER
// DocDom Discovery Builder v4.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: InDesign-specific app adapter providing standardized interface
// DEPENDENCIES: ["1.1.0.0_bootstrap-foundation.jsx"]
// SIZE: ~400 lines - COMPLETE IMPLEMENTATION - ES3 COMPLIANT - ENHANCED LOGGING
// VERSION: InDesign 2025 v20.4 (June 2025)
// =============================================================================

// =============================================================================
// DEPENDENCY VALIDATION
// =============================================================================

var INDESIGN_ADAPTER_DEPENDENCIES = ['1.1.0.0_bootstrap-foundation'];
var dependencyCheck = validateDependencies(INDESIGN_ADAPTER_DEPENDENCIES);
if (!dependencyCheck.success) {
    throw new Error('InDesign Adapter missing dependencies: ' + dependencyCheck.missing.join(', '));
}

// =============================================================================
// INDESIGN APP CONFIGURATION
// =============================================================================

var INDESIGN_APP_INFO = {
    appId: 'indesign',
    appName: 'Adobe InDesign',
    expectedAppName: 'Adobe InDesign',
    supportedVersions: ['2024', '2025'],
    currentVersion: '2025.20.4',
    releaseDate: 'June 2025'
};

var INDESIGN_DANGEROUS_PATHS = [
    'quit', 'exit', 'terminate',
    'preferences.deleteAll', 'preferences.reset',
    'documents.close', 'documents.closeAll',
    'application.quit', 'application.exit',
    'activeDocument.close', 'activeDocument.save',
    'parent.parent.parent', 'app.quit'
];

var INDESIGN_COLLECTION_TYPES = [
    'documents', 'pages', 'layers', 'textFrames', 'rectangles', 'ovals',
    'polygons', 'groups', 'pageItems', 'stories', 'paragraphs',
    'characters', 'words', 'fonts', 'colors', 'swatches', 'styles'
];

// =============================================================================
// APP INFORMATION FUNCTIONS - ENHANCED LOGGING
// =============================================================================

/**
 * Get InDesign app information - ENHANCED LOGGING
 * @returns {Object} App information
 */
function getAppInfo() {
    logDebug('=== STARTING getAppInfo ===', 'general');
    
    try {
        var appInfo = {
            appId: INDESIGN_APP_INFO.appId,
            appName: INDESIGN_APP_INFO.appName,
            detectedName: 'unknown',
            detectedVersion: 'unknown',
            supportedVersions: INDESIGN_APP_INFO.supportedVersions,
            currentVersion: INDESIGN_APP_INFO.currentVersion,
            releaseDate: INDESIGN_APP_INFO.releaseDate,
            isSupported: false,
            capabilities: {
                hasDocuments: false,
                hasPages: false,
                hasTextFrames: false,
                hasLayers: false
            }
        };
        
        // Detect actual app info
        if (typeof app !== 'undefined') {
            if (app.name) {
                appInfo.detectedName = app.name;
                logDebug('Detected app name: ' + appInfo.detectedName, 'general');
                
                // Check if this is actually InDesign
                if (appInfo.detectedName.indexOf('InDesign') !== -1) {
                    appInfo.isSupported = true;
                    logInfo('InDesign app detected and supported', 'general');
                } else {
                    logWarn('App is not InDesign: ' + appInfo.detectedName, 'general');
                }
            }
            
            if (app.version) {
                appInfo.detectedVersion = app.version;
                logDebug('Detected app version: ' + appInfo.detectedVersion, 'general');
            }
            
            // Check capabilities
            try {
                appInfo.capabilities.hasDocuments = !!(app.documents);
                appInfo.capabilities.hasPages = !!(app.documents && app.documents.length > 0 && app.documents[0].pages);
                appInfo.capabilities.hasTextFrames = !!(app.documents && app.documents.length > 0 && app.documents[0].textFrames);
                appInfo.capabilities.hasLayers = !!(app.documents && app.documents.length > 0 && app.documents[0].layers);
                
                logDebug('InDesign capabilities detected', 'general');
            } catch (exc) {
                logWarn('Capability detection failed: ' + exc.message, 'general');
            }
        }
        
        logInfo('InDesign app info gathered successfully', 'general');
        return appInfo;
        
    } catch (exc) {
        logError('InDesign app info gathering failed: ' + exc.message, 'general');
        return {
            appId: INDESIGN_APP_INFO.appId,
            appName: INDESIGN_APP_INFO.appName,
            error: 'App info gathering failed: ' + exc.message,
            isSupported: false
        };
    }
}

/**
 * Validate InDesign app environment - ENHANCED LOGGING
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
        
        // Check if this is InDesign
        if (app.name) {
            result.appName = app.name;
            if (app.name.indexOf('InDesign') === -1) {
                result.errors.push('App is not InDesign: ' + app.name);
                logError('Wrong app detected: ' + app.name + ' (expected InDesign)', 'general');
                return result;
            }
            logDebug('InDesign app confirmed: ' + app.name, 'general');
        }
        
        // Check version
        if (app.version) {
            result.version = app.version;
            logDebug('InDesign version: ' + app.version, 'general');
        }
        
        // Check document access
        try {
            if (app.documents && app.documents.length > 0) {
                result.document = app.documents[0];
                logDebug('Active InDesign document: ' + result.document.name, 'general');
            } else {
                result.warnings.push('No active InDesign documents');
                logWarn('No active InDesign documents found', 'general');
            }
        } catch (exc) {
            result.warnings.push('Document access failed: ' + exc.message);
            logWarn('InDesign document access failed: ' + exc.message, 'general');
        }
        
        // Final validation
        result.valid = (result.errors.length === 0);
        
        if (result.valid) {
            logInfo('InDesign environment validation successful', 'general');
        } else {
            logWarn('InDesign environment validation failed with ' + result.errors.length + ' errors', 'general');
        }
        
        return result;
        
    } catch (exc) {
        logError('InDesign environment validation error: ' + exc.message, 'general');
        return {
            valid: false,
            error: 'Environment validation failed: ' + exc.message,
            errors: ['Validation system failure'],
            warnings: []
        };
    }
}

/**
 * Get active InDesign document - ENHANCED LOGGING
 * @returns {Object} Document info or null
 */
function getActiveDocument() {
    logDebug('Getting active InDesign document', 'general');
    
    try {
        if (typeof app === 'undefined' || !app.documents) {
            logWarn('InDesign app or documents not available', 'general');
            return null;
        }
        
        if (app.documents.length === 0) {
            logWarn('No active InDesign documents', 'general');
            return null;
        }
        
        var doc = app.documents[0];
        logDebug('Active InDesign document found: ' + doc.name, 'general');
        
        return {
            name: doc.name,
            path: doc.fullName || 'untitled',
            pageCount: doc.pages ? doc.pages.length : 0,
            layerCount: doc.layers ? doc.layers.length : 0,
            reference: doc
        };
        
    } catch (exc) {
        logError('Failed to get active InDesign document: ' + exc.message, 'general');
        return null;
    }
}

/**
 * Get InDesign-specific dangerous paths - MINIMAL LOGGING
 * @returns {Array} Array of dangerous path patterns
 */
function getAppSpecificPaths() {
    logDebug('Getting InDesign dangerous paths (' + INDESIGN_DANGEROUS_PATHS.length + ' patterns)', 'general');
    return INDESIGN_DANGEROUS_PATHS.slice(); // Return copy
}

/**
 * Get InDesign collection types - MINIMAL LOGGING
 * @returns {Array} Array of collection type names
 */
function getAppCollections() {
    logDebug('Getting InDesign collection types (' + INDESIGN_COLLECTION_TYPES.length + ' types)', 'general');
    return INDESIGN_COLLECTION_TYPES.slice(); // Return copy
}

/**
 * Check if path is InDesign-specific dangerous - MINIMAL LOGGING
 * @param {String} path - Path to check
 * @returns {Boolean} True if path is dangerous
 */
function isAppSpecificDangerousPath(path) {
    try {
        if (!path) {
            return false;
        }
        
        var lowerPath = path.toLowerCase();
        
        for (var i = 0; i < INDESIGN_DANGEROUS_PATHS.length; i++) {
            var dangerousPath = INDESIGN_DANGEROUS_PATHS[i].toLowerCase();
            if (lowerPath.indexOf(dangerousPath) !== -1) {
                logDebug('InDesign dangerous path detected: ' + path, 'general');
                return true;
            }
        }
        
        return false;
        
    } catch (exc) {
        logWarn('Error checking InDesign dangerous path: ' + exc.message, 'general');
        return true; // Err on the side of caution
    }
}

/**
 * Get InDesign document structure interface - ENHANCED LOGGING
 * @returns {Object} Document structure interface
 */
function getDocumentStructureInterface() {
    logDebug('=== STARTING getDocumentStructureInterface ===', 'general');
    
    try {
        var docInfo = getActiveDocument();
        if (!docInfo || !docInfo.reference) {
            logWarn('No active InDesign document for structure interface', 'general');
            return null;
        }
        
        var doc = docInfo.reference;
        var structure = {
            document: {
                name: docInfo.name,
                path: docInfo.path,
                type: 'InDesign Document'
            },
            collections: {},
            metadata: {
                pageCount: docInfo.pageCount,
                layerCount: docInfo.layerCount,
                appVersion: app.version || 'unknown'
            }
        };
        
        // Map InDesign collections
        try {
            if (doc.pages) structure.collections.pages = doc.pages;
            if (doc.layers) structure.collections.layers = doc.layers;
            if (doc.textFrames) structure.collections.textFrames = doc.textFrames;
            if (doc.rectangles) structure.collections.rectangles = doc.rectangles;
            if (doc.ovals) structure.collections.ovals = doc.ovals;
            if (doc.groups) structure.collections.groups = doc.groups;
            if (doc.stories) structure.collections.stories = doc.stories;
            
            logDebug('InDesign document structure interface created with ' + 
                    Object.keys(structure.collections).length + ' collection types', 'general');
        } catch (exc) {
            logWarn('Some InDesign collections not accessible: ' + exc.message, 'general');
        }
        
        logInfo('InDesign document structure interface created successfully', 'general');
        return structure;
        
    } catch (exc) {
        logError('Failed to create InDesign document structure interface: ' + exc.message, 'general');
        return null;
    }
}

/**
 * Get InDesign adapter version info - MINIMAL LOGGING
 * @returns {Object} Version information
 */
function getAdapterVersion() {
    return {
        module: '1.15.1.2025.20.4_indesign-adapter',
        appId: INDESIGN_APP_INFO.appId,
        targetApp: INDESIGN_APP_INFO.appName,
        targetVersion: INDESIGN_APP_INFO.currentVersion,
        releaseDate: INDESIGN_APP_INFO.releaseDate
    };
}

// =============================================================================
// MODULE REGISTRATION
// =============================================================================

// Register this InDesign adapter module
registerModule('1.15.1.2025.20.4_indesign-adapter', '4.1', [
    // App Information Functions (3)
    'getAppInfo', 'validateAppEnvironment', 'getActiveDocument',
    
    // App-Specific Data Functions (3)
    'getAppSpecificPaths', 'getAppCollections', 'isAppSpecificDangerousPath',
    
    // Document Interface Functions (2)
    'getDocumentStructureInterface', 'getAdapterVersion'
]);

logInfo('InDesign adapter v1.15.1.2025.20.4 loaded successfully (8 functions)', 'general');

// =============================================================================
// END OF 1.15.1.2025.20.4_indesign-adapter.jsx - INDESIGN APP ADAPTER
// =============================================================================