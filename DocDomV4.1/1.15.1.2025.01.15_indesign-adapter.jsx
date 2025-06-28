// DocDomV4.1/1.15.1.2025.01.15_indesign-adapter.jsx
// 1.15.1.2025.01.15_indesign-adapter.jsx - ADOBE INDESIGN APPLICATION ADAPTER
// DocDom Discovery Builder v4.1 - STANDARDIZED ADAPTER INTERFACE
// =============================================================================
// PURPOSE: Adobe InDesign-specific interface implementation following adapter specification
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
    throw new Error('InDesign Adapter missing dependencies: ' + dependencyCheck.missing.join(', '));
}

// =============================================================================
// INDESIGN APP CONFIGURATION
// =============================================================================

var INDESIGN_APP_INFO = {
    appName: 'Adobe InDesign',
    appId: 'indesign',
    targetVersion: '2025.1.0',
    build: 'unknown',
    releaseDate: '2025.01.15',
    isSupported: true
};

// InDesign-specific dangerous paths
var INDESIGN_DANGEROUS_PATHS = [
    'preferences', 'menuActions', 'scriptMenuActions', 'eventListeners',
    'windows', 'panels', 'dialogs', 'application'
];

// InDesign collection types
var INDESIGN_COLLECTIONS = {
    primary: ['documents', 'pages', 'stories', 'textFrames'],
    secondary: ['paragraphs', 'words', 'characters', 'textColumns'],
    metadata: {
        documents: 'Main document collection',
        pages: 'Document pages',
        stories: 'Text stories',
        textFrames: 'Text frame objects'
    }
};

// =============================================================================
// APP INFORMATION FUNCTIONS (3 REQUIRED)
// =============================================================================

/**
 * Get Adobe InDesign application information
 * ADAPTER SPECIFICATION: Returns standardized app info object
 * @returns {Object} InDesign app information
 */
function getAppInfo() {
    try {
        logDebug('Getting InDesign app information', 'adapter');
        
        var currentVersion = 'unknown';
        var currentBuild = 'unknown';
        var environment = 'unknown';
        
        // Safely detect InDesign version
        try {
            if (typeof app !== 'undefined' && app.version) {
                currentVersion = String(app.version);
                logInfo('Detected InDesign version: ' + currentVersion, 'adapter');
            }
            
            if (typeof app !== 'undefined' && app.build) {
                currentBuild = String(app.build);
                logDebug('Detected InDesign build: ' + currentBuild, 'adapter');
            }
        } catch (versionExc) {
            logWarn('Could not detect InDesign version: ' + versionExc.message, 'adapter');
        }
        
        var appInfo = {
            appName: INDESIGN_APP_INFO.appName,
            appId: INDESIGN_APP_INFO.appId,
            version: INDESIGN_APP_INFO.targetVersion,
            build: currentBuild,
            currentVersion: currentVersion,
            isSupported: INDESIGN_APP_INFO.isSupported,
            releaseDate: INDESIGN_APP_INFO.releaseDate
        };
        
        logInfo('InDesign app info retrieved successfully', 'adapter');
        return appInfo;
        
    } catch (exc) {
        logError('getAppInfo failed: ' + exc.message, 'adapter');
        return {
            appName: 'Adobe InDesign',
            appId: 'indesign',
            version: 'error',
            build: 'error',
            currentVersion: 'error',
            isSupported: false,
            releaseDate: 'error'
        };
    }
}

/**
 * Validate Adobe InDesign environment
 * ADAPTER SPECIFICATION: Returns standardized validation object
 * @returns {Object} Environment validation result
 */
function validateAppEnvironment() {
    try {
        logDebug('Validating InDesign environment', 'adapter');
        
        var isValid = false;
        var appSupported = false;
        var versionSupported = false;
        var environment = 'unknown';
        var warnings = [];
        
        // Check if we're running in InDesign
        try {
            if (typeof app !== 'undefined' && app.name && app.name.indexOf('InDesign') !== -1) {
                appSupported = true;
                environment = 'indesign';
                logInfo('InDesign application detected', 'adapter');
            } else {
                warnings.push('Not running in Adobe InDesign');
                logWarn('Not running in InDesign environment', 'adapter');
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
                    logInfo('InDesign version is supported: ' + version, 'adapter');
                } else {
                    warnings.push('InDesign version may not be fully supported: ' + version);
                    logWarn('InDesign version may not be supported: ' + version, 'adapter');
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
        
        logInfo('InDesign environment validation: ' + (isValid ? 'PASSED' : 'FAILED'), 'adapter');
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
 * Get active InDesign document
 * ADAPTER SPECIFICATION: Returns active document object or null
 * @returns {Object|null} Active document or null
 */
function getActiveDocument() {
    try {
        logDebug('Getting active InDesign document', 'adapter');
        
        // Check if InDesign is available
        if (typeof app === 'undefined') {
            logWarn('InDesign app object not available', 'adapter');
            return null;
        }
        
        // Check if there's an active document
        if (!app.documents || app.documents.length === 0) {
            logInfo('No documents open in InDesign', 'adapter');
            return null;
        }
        
        var activeDoc = app.activeDocument;
        if (!activeDoc) {
            logWarn('No active document in InDesign', 'adapter');
            return null;
        }
        
        logInfo('Active InDesign document retrieved: ' + (activeDoc.name || 'unnamed'), 'adapter');
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
 * Get InDesign-specific object paths
 * ADAPTER SPECIFICATION: Returns standardized paths object
 * @returns {Object} InDesign-specific paths
 */
function getAppSpecificPaths() {
    try {
        logDebug('Getting InDesign-specific paths', 'adapter');
        
        var paths = {
            documentPaths: [
                'app.documents',
                'app.activeDocument',
                'document.pages',
                'document.stories',
                'document.textFrames'
            ],
            collectionPaths: [
                'documents',
                'pages',
                'stories',
                'textFrames',
                'paragraphs',
                'words',
                'characters'
            ],
            dangerousPaths: INDESIGN_DANGEROUS_PATHS,
            specialPaths: [
                'app.selection',
                'app.clipboard',
                'document.selection'
            ],
            rootPath: 'app'
        };
        
        logInfo('InDesign paths retrieved: ' + paths.documentPaths.length + ' document paths', 'adapter');
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
 * Get InDesign collection types
 * ADAPTER SPECIFICATION: Returns standardized collections object
 * @returns {Object} InDesign collections information
 */
function getAppCollections() {
    try {
        logDebug('Getting InDesign collections', 'adapter');
        
        var collections = {
            primary: INDESIGN_COLLECTIONS.primary,
            secondary: INDESIGN_COLLECTIONS.secondary,
            metadata: INDESIGN_COLLECTIONS.metadata,
            accessMethods: {
                documents: 'app.documents',
                pages: 'document.pages',
                stories: 'document.stories',
                textFrames: 'document.textFrames'
            }
        };
        
        logInfo('InDesign collections retrieved: ' + collections.primary.length + ' primary types', 'adapter');
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
 * Check if path/object is safe for InDesign enumeration
 * ADAPTER SPECIFICATION: Returns boolean safety indicator
 * @param {*} obj - Object or path to check
 * @returns {boolean} True if safe, false if dangerous
 */
function isAppSpecificDangerousPath(obj) {
    try {
        logDebug('Checking InDesign path safety', 'adapter');
        
        if (!obj) {
            logDebug('Path safety check: null object is safe', 'adapter');
            return true;
        }
        
        var objString = String(obj);
        var objType = typeof obj;
        
        // Check for dangerous path strings
        for (var i = 0; i < INDESIGN_DANGEROUS_PATHS.length; i++) {
            var dangerousPath = INDESIGN_DANGEROUS_PATHS[i];
            if (objString.indexOf(dangerousPath) !== -1) {
                logWarn('Dangerous InDesign path detected: ' + dangerousPath, 'adapter');
                return false;
            }
        }
        
        // Check for dangerous object types by constructor
        if (objType === 'object' && obj.constructor) {
            var constructorName = String(obj.constructor.name || '');
            if (constructorName === 'Application' || constructorName === 'Preferences') {
                logWarn('Dangerous InDesign object type: ' + constructorName, 'adapter');
                return false;
            }
        }
        
        logDebug('InDesign path/object is safe for enumeration', 'adapter');
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
 * Get InDesign document structure interface
 * ADAPTER SPECIFICATION: Returns standardized document interface
 * @param {Object} doc - InDesign document object
 * @returns {Object} Document structure interface
 */
function getDocumentStructureInterface(doc) {
    try {
        logDebug('Creating InDesign document structure interface', 'adapter');
        
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
                pages: document.pages || [],
                stories: document.stories || [],
                textFrames: document.textFrames || [],
                pageItems: document.pageItems || []
            };
            
            // Add collection metadata
            structure.metadata = {
                documentName: document.name || 'unnamed',
                pageCount: (document.pages && document.pages.length) || 0,
                storyCount: (document.stories && document.stories.length) || 0,
                textFrameCount: (document.textFrames && document.textFrames.length) || 0
            };
            
            // Add access interface
            structure.accessInterface = {
                getPages: function() { return document.pages; },
                getStories: function() { return document.stories; },
                getTextFrames: function() { return document.textFrames; }
            };
            
            logInfo('InDesign document interface: ' + structure.metadata.pageCount + ' pages, ' + 
                   structure.metadata.storyCount + ' stories', 'adapter');
                   
        } catch (collectionsExc) {
            logWarn('Some InDesign collections not accessible: ' + collectionsExc.message, 'adapter');
        }
        
        logInfo('InDesign document structure interface created successfully', 'adapter');
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
 * Get InDesign adapter version information
 * ADAPTER SPECIFICATION: Returns standardized version object
 * @returns {Object} Adapter version information
 */
function getAdapterVersion() {
    try {
        logDebug('Getting InDesign adapter version info', 'adapter');
        
        var versionInfo = {
            module: '1.15.1.2025.01.15_indesign-adapter',
            appId: INDESIGN_APP_INFO.appId,
            targetApp: INDESIGN_APP_INFO.appName,
            targetVersion: INDESIGN_APP_INFO.targetVersion,
            releaseDate: INDESIGN_APP_INFO.releaseDate
        };
        
        logInfo('InDesign adapter version info retrieved', 'adapter');
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

// Register this InDesign adapter module following specification
registerModule('1.15.1.2025.01.15_indesign-adapter', '4.1', [
    // App Information Functions (3)
    'getAppInfo', 'validateAppEnvironment', 'getActiveDocument',
    
    // App-Specific Data Functions (3)
    'getAppSpecificPaths', 'getAppCollections', 'isAppSpecificDangerousPath',
    
    // Document Interface Functions (2)
    'getDocumentStructureInterface', 'getAdapterVersion'
]);

logInfo('InDesign adapter v1.15.1.2025.01.15 loaded successfully (8 functions)', 'adapter');

// =============================================================================
// END OF 1.15.1.2025.01.15_indesign-adapter.jsx - STANDARDIZED INTERFACE
// =============================================================================