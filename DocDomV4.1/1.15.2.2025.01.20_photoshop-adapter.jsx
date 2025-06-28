// DocDomV4.1/1.15.2.2025.01.20_photoshop-adapter.jsx
// 1.15.2.2025.01.20_photoshop-adapter.jsx - ADOBE PHOTOSHOP APPLICATION ADAPTER
// DocDom Discovery Builder v4.1 - STANDARDIZED ADAPTER INTERFACE
// =============================================================================
// PURPOSE: Adobe Photoshop-specific interface implementation following adapter specification
// DEPENDENCIES: ["1.1.0.0_bootstrap-foundation.jsx"] - FOUNDATION ONLY
// SIZE: ~800 lines - COMPLETE STANDARDIZED IMPLEMENTATION - ES3 COMPLIANT
// ADAPTER SPECIFICATION: Implements all 8 required functions with identical signatures
// =============================================================================

// =============================================================================
// DEPENDENCY VALIDATION - FOUNDATION ONLY
// =============================================================================

var ADAPTER_DEPENDENCIES = ['1.1.0.0_bootstrap-foundation'];
var dependencyCheck = validateDependencies(ADAPTER_DEPENDENCIES);
if (!dependencyCheck.success) {
    throw new Error('Photoshop Adapter missing dependencies: ' + dependencyCheck.missing.join(', '));
}

// =============================================================================
// PHOTOSHOP APP CONFIGURATION
// =============================================================================

var PHOTOSHOP_APP_INFO = {
    appName: 'Adobe Photoshop',
    appId: 'photoshop',
    targetVersion: '2025.1.0',
    build: 'unknown',
    releaseDate: '2025.01.20',
    isSupported: true
};

// Photoshop-specific dangerous paths
var PHOTOSHOP_DANGEROUS_PATHS = [
    'preferences', 'notifiers', 'scriptingListeners', 'eventListeners',
    'windows', 'dialogs', 'application', 'system'
];

// Photoshop collection types
var PHOTOSHOP_COLLECTIONS = {
    primary: ['documents', 'layers', 'artLayers', 'layerSets'],
    secondary: ['channels', 'historyStates', 'pathItems', 'textItems'],
    metadata: {
        documents: 'Main document collection',
        layers: 'Document layers',
        artLayers: 'Art layer objects',
        layerSets: 'Layer group objects'
    }
};

// =============================================================================
// APP INFORMATION FUNCTIONS (3 REQUIRED)
// =============================================================================

/**
 * Get Adobe Photoshop application information
 * ADAPTER SPECIFICATION: Returns standardized app info object
 * @returns {Object} Photoshop app information
 */
function getAppInfo() {
    try {
        logDebug('Getting Photoshop app information', 'adapter');
        
        var currentVersion = 'unknown';
        var currentBuild = 'unknown';
        var environment = 'unknown';
        
        // Safely detect Photoshop version
        try {
            if (typeof app !== 'undefined' && app.version) {
                currentVersion = String(app.version);
                logInfo('Detected Photoshop version: ' + currentVersion, 'adapter');
            }
            
            if (typeof app !== 'undefined' && app.build) {
                currentBuild = String(app.build);
                logDebug('Detected Photoshop build: ' + currentBuild, 'adapter');
            }
        } catch (versionExc) {
            logWarn('Could not detect Photoshop version: ' + versionExc.message, 'adapter');
        }
        
        var appInfo = {
            appName: PHOTOSHOP_APP_INFO.appName,
            appId: PHOTOSHOP_APP_INFO.appId,
            version: PHOTOSHOP_APP_INFO.targetVersion,
            build: currentBuild,
            currentVersion: currentVersion,
            isSupported: PHOTOSHOP_APP_INFO.isSupported,
            releaseDate: PHOTOSHOP_APP_INFO.releaseDate
        };
        
        logInfo('Photoshop app info retrieved successfully', 'adapter');
        return appInfo;
        
    } catch (exc) {
        logError('getAppInfo failed: ' + exc.message, 'adapter');
        return {
            appName: 'Adobe Photoshop',
            appId: 'photoshop',
            version: 'error',
            build: 'error',
            currentVersion: 'error',
            isSupported: false,
            releaseDate: 'error'
        };
    }
}

/**
 * Validate Adobe Photoshop environment
 * ADAPTER SPECIFICATION: Returns standardized validation object
 * @returns {Object} Environment validation result
 */
function validateAppEnvironment() {
    try {
        logDebug('Validating Photoshop environment', 'adapter');
        
        var isValid = false;
        var appSupported = false;
        var versionSupported = false;
        var environment = 'unknown';
        var warnings = [];
        
        // Check if we're running in Photoshop
        try {
            if (typeof app !== 'undefined' && app.name && app.name.indexOf('Photoshop') !== -1) {
                appSupported = true;
                environment = 'photoshop';
                logInfo('Photoshop application detected', 'adapter');
            } else {
                warnings.push('Not running in Adobe Photoshop');
                logWarn('Not running in Photoshop environment', 'adapter');
            }
        } catch (appExc) {
            warnings.push('Could not detect application: ' + appExc.message);
            logError('App detection failed: ' + appExc.message, 'adapter');
        }
        
        // Check version compatibility
        try {
            if (appSupported && app.version) {
                var version = String(app.version);
                if (version.indexOf('2024') !== -1 || version.indexOf('2025') !== -1) {
                    versionSupported = true;
                    logInfo('Photoshop version is supported: ' + version, 'adapter');
                } else {
                    warnings.push('Photoshop version may not be fully supported: ' + version);
                    logWarn('Photoshop version may not be supported: ' + version, 'adapter');
                }
            }
        } catch (versionExc) {
            warnings.push('Could not validate version: ' + versionExc.message);
            logWarn('Version validation failed: ' + versionExc.message, 'adapter');
        }
        
        isValid = appSupported && versionSupported;
        
        var validation = {
            isValid: isValid,
            appSupported: appSupported,
            versionSupported: versionSupported,
            environment: environment,
            warnings: warnings
        };
        
        logInfo('Photoshop environment validation: ' + (isValid ? 'PASSED' : 'FAILED'), 'adapter');
        return validation;
        
    } catch (exc) {
        logError('validateAppEnvironment failed: ' + exc.message, 'adapter');
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
 * Get active Photoshop document
 * ADAPTER SPECIFICATION: Returns active document object or null
 * @returns {Object|null} Active document or null
 */
function getActiveDocument() {
    try {
        logDebug('Getting active Photoshop document', 'adapter');
        
        // Check if Photoshop is available
        if (typeof app === 'undefined') {
            logWarn('Photoshop app object not available', 'adapter');
            return null;
        }
        
        // Check if there's an active document
        if (!app.documents || app.documents.length === 0) {
            logInfo('No documents open in Photoshop', 'adapter');
            return null;
        }
        
        var activeDoc = app.activeDocument;
        if (!activeDoc) {
            logWarn('No active document in Photoshop', 'adapter');
            return null;
        }
        
        logInfo('Active Photoshop document retrieved: ' + (activeDoc.name || 'unnamed'), 'adapter');
        return activeDoc;
        
    } catch (exc) {
        logError('getActiveDocument failed: ' + exc.message, 'adapter');
        return null;
    }
}

// =============================================================================
// APP-SPECIFIC DATA FUNCTIONS (3 REQUIRED)
// =============================================================================

/**
 * Get Photoshop-specific object paths
 * ADAPTER SPECIFICATION: Returns standardized paths object
 * @returns {Object} Photoshop-specific paths
 */
function getAppSpecificPaths() {
    try {
        logDebug('Getting Photoshop-specific paths', 'adapter');
        
        var paths = {
            documentPaths: [
                'app.documents',
                'app.activeDocument',
                'document.layers',
                'document.artLayers',
                'document.layerSets'
            ],
            collectionPaths: [
                'documents',
                'layers',
                'artLayers',
                'layerSets',
                'channels',
                'historyStates',
                'pathItems'
            ],
            dangerousPaths: PHOTOSHOP_DANGEROUS_PATHS,
            specialPaths: [
                'app.selection',
                'app.clipboard',
                'document.selection'
            ],
            rootPath: 'app'
        };
        
        logInfo('Photoshop paths retrieved: ' + paths.documentPaths.length + ' document paths', 'adapter');
        return paths;
        
    } catch (exc) {
        logError('getAppSpecificPaths failed: ' + exc.message, 'adapter');
        return {
            documentPaths: [],
            collectionPaths: [],
            dangerousPaths: [],
            specialPaths: [],
            rootPath: 'unknown'
        };
    }
}

/**
 * Get Photoshop collection types
 * ADAPTER SPECIFICATION: Returns standardized collections object
 * @returns {Object} Photoshop collections information
 */
function getAppCollections() {
    try {
        logDebug('Getting Photoshop collections', 'adapter');
        
        var collections = {
            primary: PHOTOSHOP_COLLECTIONS.primary,
            secondary: PHOTOSHOP_COLLECTIONS.secondary,
            metadata: PHOTOSHOP_COLLECTIONS.metadata,
            accessMethods: {
                documents: 'app.documents',
                layers: 'document.layers',
                artLayers: 'document.artLayers',
                layerSets: 'document.layerSets'
            }
        };
        
        logInfo('Photoshop collections retrieved: ' + collections.primary.length + ' primary types', 'adapter');
        return collections;
        
    } catch (exc) {
        logError('getAppCollections failed: ' + exc.message, 'adapter');
        return {
            primary: [],
            secondary: [],
            metadata: {},
            accessMethods: {}
        };
    }
}

/**
 * Check if path/object is safe for Photoshop enumeration
 * ADAPTER SPECIFICATION: Returns boolean safety indicator
 * @param {*} obj - Object or path to check
 * @returns {boolean} True if safe, false if dangerous
 */
function isAppSpecificDangerousPath(obj) {
    try {
        logDebug('Checking Photoshop path safety', 'adapter');
        
        if (!obj) {
            logDebug('Path safety check: null object is safe', 'adapter');
            return true;
        }
        
        var objString = String(obj);
        var objType = typeof obj;
        
        // Check for dangerous path strings
        for (var i = 0; i < PHOTOSHOP_DANGEROUS_PATHS.length; i++) {
            var dangerousPath = PHOTOSHOP_DANGEROUS_PATHS[i];
            if (objString.indexOf(dangerousPath) !== -1) {
                logWarn('Dangerous Photoshop path detected: ' + dangerousPath, 'adapter');
                return false;
            }
        }
        
        // Check for dangerous object types by constructor
        if (objType === 'object' && obj.constructor) {
            var constructorName = String(obj.constructor.name || '');
            if (constructorName === 'Application' || constructorName === 'Preferences') {
                logWarn('Dangerous Photoshop object type: ' + constructorName, 'adapter');
                return false;
            }
        }
        
        logDebug('Photoshop path/object is safe for enumeration', 'adapter');
        return true;
        
    } catch (exc) {
        logError('isAppSpecificDangerousPath failed: ' + exc.message, 'adapter');
        return false; // Err on the side of caution
    }
}

// =============================================================================
// DOCUMENT INTERFACE FUNCTIONS (2 REQUIRED)
// =============================================================================

/**
 * Get Photoshop document structure interface
 * ADAPTER SPECIFICATION: Returns standardized document interface
 * @param {Object} doc - Photoshop document object
 * @returns {Object} Document structure interface
 */
function getDocumentStructureInterface(doc) {
    try {
        logDebug('Creating Photoshop document structure interface', 'adapter');
        
        var document = doc || getActiveDocument();
        if (!document) {
            logWarn('No document provided for structure interface', 'adapter');
            return {
                document: null,
                collections: {},
                paths: [],
                metadata: {},
                accessInterface: {}
            };
        }
        
        var structure = {
            document: document,
            collections: {},
            paths: [],
            metadata: {},
            accessInterface: {}
        };
        
        // Build collections information
        try {
            structure.collections = {
                layers: document.layers || [],
                artLayers: document.artLayers || [],
                layerSets: document.layerSets || [],
                channels: document.channels || []
            };
            
            // Add collection metadata
            structure.metadata = {
                documentName: document.name || 'unnamed',
                layerCount: (document.layers && document.layers.length) || 0,
                artLayerCount: (document.artLayers && document.artLayers.length) || 0,
                layerSetCount: (document.layerSets && document.layerSets.length) || 0,
                width: document.width || 0,
                height: document.height || 0
            };
            
            // Add access interface
            structure.accessInterface = {
                getLayers: function() { return document.layers; },
                getArtLayers: function() { return document.artLayers; },
                getLayerSets: function() { return document.layerSets; }
            };
            
            logInfo('Photoshop document interface: ' + structure.metadata.layerCount + ' layers, ' + 
                   structure.metadata.artLayerCount + ' art layers', 'adapter');
                   
        } catch (collectionsExc) {
            logWarn('Some Photoshop collections not accessible: ' + collectionsExc.message, 'adapter');
        }
        
        logInfo('Photoshop document structure interface created successfully', 'adapter');
        return structure;
        
    } catch (exc) {
        logError('getDocumentStructureInterface failed: ' + exc.message, 'adapter');
        return {
            document: null,
            collections: {},
            paths: [],
            metadata: {},
            accessInterface: {}
        };
    }
}

/**
 * Get Photoshop adapter version information
 * ADAPTER SPECIFICATION: Returns standardized version object
 * @returns {Object} Adapter version information
 */
function getAdapterVersion() {
    try {
        logDebug('Getting Photoshop adapter version info', 'adapter');
        
        var versionInfo = {
            module: '1.15.2.2025.01.20_photoshop-adapter',
            appId: PHOTOSHOP_APP_INFO.appId,
            targetApp: PHOTOSHOP_APP_INFO.appName,
            targetVersion: PHOTOSHOP_APP_INFO.targetVersion,
            releaseDate: PHOTOSHOP_APP_INFO.releaseDate
        };
        
        logInfo('Photoshop adapter version info retrieved', 'adapter');
        return versionInfo;
        
    } catch (exc) {
        logError('getAdapterVersion failed: ' + exc.message, 'adapter');
        return {
            module: 'error',
            appId: 'error',
            targetApp: 'error',
            targetVersion: 'error',
            releaseDate: 'error'
        };
    }
}

// =============================================================================
// MODULE REGISTRATION - STANDARDIZED INTERFACE
// =============================================================================

// Register this Photoshop adapter module following specification
registerModule('1.15.2.2025.01.20_photoshop-adapter', '4.1', [
    // App Information Functions (3)
    'getAppInfo', 'validateAppEnvironment', 'getActiveDocument',
    
    // App-Specific Data Functions (3)
    'getAppSpecificPaths', 'getAppCollections', 'isAppSpecificDangerousPath',
    
    // Document Interface Functions (2)
    'getDocumentStructureInterface', 'getAdapterVersion'
]);

logInfo('Photoshop adapter v1.15.2.2025.01.20 loaded successfully (8 functions)', 'adapter');

// =============================================================================
// END OF 1.15.2.2025.01.20_photoshop-adapter.jsx - STANDARDIZED INTERFACE
// =============================================================================