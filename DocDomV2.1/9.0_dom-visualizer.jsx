// =============================================================================
// 9.0_dom-visualizer.jsx - DOM VISUALIZATION INTERFACE
// InDesign DOM Discovery Builder v2.1.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: Display DOM structure in user-friendly interface with full feature integration
// DEPENDENCIES: ["1.0_safe-foundation.jsx", "2.0_dom-enumerator.jsx", "3.0_collection-sampler.jsx", "5.0_dom-exporter.jsx"]
// SIZE: ~1200 lines (ENHANCED WITH CONFIGURABLE SETTINGS)
// =============================================================================

// =============================================================================
// MODULE REGISTRATION AND DEPENDENCIES
// =============================================================================

try {
    // Register this module
    if (typeof registerModule === 'function') {
        registerModule('dom-visualizer', '2.1.1', [
            'showDOMVisualizer',
            'showDOMExplorer',
            'createDOMVisualizerUI',
            'createDocumentInfoPanel',
            'createDOMDisplayPanel',
            'createControlPanel',
            'createStatusPanel',
            'runDOMEnumeration',
            'runCollectionSampling',
            'formatDOMForDisplay',
            'generateDOMTreeText',
            'updateStatus',
            'updateDocumentInfo',
            'showExportOptions',
            'showExportDialog',
            'performExport',
            'showSettingsDialog',
            'showConfigurableSettingsDialog',
            'applyConfigurationAndRun',
            'detectCurrentApplication'
        ]);
    }

    // Validate dependencies
    if (typeof validateDependencies === 'function') {
        var depResult = validateDependencies(['safe-foundation', 'dom-enumerator', 'collection-sampler', 'dom-exporter']);
        if (!depResult.success) {
            throw new Error('Missing dependencies for dom-visualizer: ' + depResult.missing.join(', '));
        }
    }
} catch (exc) {
    // Module system not available - continue with standalone operation
}

// =============================================================================
// NAMESPACED GLOBAL VARIABLES FOR UI STATE
// =============================================================================

var g_domViz_visualizerWindow = null;
var g_domViz_currentDOMStructure = null;
var g_domViz_statusText = null;
var g_domViz_domDisplay = null;
var g_domViz_documentInfo = null;

// =============================================================================
// ENHANCED CONFIGURATION SYSTEM
// =============================================================================

// Global configuration storage for user settings
var g_domViz_userConfiguration = null;
var g_domViz_defaultConfiguration = null;
var g_domViz_originalConfigs = null; // Store original configs for restoration

/**
 * Get default configuration optimized for the current application
 */
function getDefaultConfiguration() {
    return {
        analysis: {
            safetyFilter: 'moderate',
            includeCollectionSamples: true,
            maxSamples: 25,
            timeoutMs: 5000,
            maxDepth: 4,
            maxProperties: 5000,
            trackObjectReferences: true,
            generateValueFingerprints: true,
            includeValueMetadata: true
        },
        performance: {
            enumerationTimeout: 15,
            samplingTimeout: 5000,
            enableMemoryCleanup: true,
            enableBatchProcessing: true,
            maxCollectionSize: 2000
        },
        application: {
            includePages: true,
            includeStories: true,
            includeFrames: true,
            includeFonts: false
        },
        export: {
            includeTextExport: true,
            includeJSONExport: true,
            includeCSVExport: false,
            includeExtractedValues: true,
            includeCollectionData: true,
            includeFingerprints: false,
            includeAccessPaths: true
        }
    };
}

/**
 * Detect current Adobe application and capabilities
 */
function detectCurrentApplication() {
    try {
        if (typeof app === 'undefined') {
            return { name: 'Unknown', version: 'unknown', supported: false };
        }
        
        var appName = 'Unknown';
        var appVersion = 'unknown';
        var supported = false;
        
        try {
            // InDesign detection
            if (app.name && app.name.indexOf('InDesign') !== -1) {
                appName = 'InDesign';
                appVersion = app.version || 'unknown';
                supported = true;
            }
            // Photoshop detection  
            else if (app.name && app.name.indexOf('Photoshop') !== -1) {
                appName = 'Photoshop';
                appVersion = app.version || 'unknown';
                supported = false; // Experimental
            }
            // Illustrator detection
            else if (app.name && app.name.indexOf('Illustrator') !== -1) {
                appName = 'Illustrator';
                appVersion = app.version || 'unknown';
                supported = false; // Planned
            }
            // Try to detect by available objects
            else {
                if (typeof app.documents !== 'undefined' && typeof app.activeDocument !== 'undefined') {
                    if (typeof app.activeDocument.pages !== 'undefined') {
                        appName = 'InDesign'; // Has pages
                        supported = true;
                    } else if (typeof app.activeDocument.layers !== 'undefined') {
                        if (typeof app.activeDocument.artboards !== 'undefined') {
                            appName = 'Illustrator'; // Has artboards
                        } else {
                            appName = 'Photoshop'; // Just layers
                        }
                    }
                }
            }
        } catch (exc) {
            // Detection failed
        }
        
        return {
            name: appName,
            version: appVersion,
            supported: supported,
            detected: appName !== 'Unknown'
        };
        
    } catch (exc) {
        return { name: 'Unknown', version: 'unknown', supported: false, error: exc.message };
    }
}

// =============================================================================
// MAIN UI FUNCTIONS
// =============================================================================

/**
 * Show DOM visualizer interface (main entry point)
 * @returns {Boolean} True if interface shown successfully
 */
function showDOMVisualizer() {
    try {
        // Close existing window if open
        if (g_domViz_visualizerWindow) {
            try {
                g_domViz_visualizerWindow.close();
            } catch (exc) {
                // Window might already be closed
            }
            g_domViz_visualizerWindow = null;
        }
        
        // Create and show new visualizer UI with error handling
        g_domViz_visualizerWindow = createDOMVisualizerUI();
        if (g_domViz_visualizerWindow) {
            g_domViz_visualizerWindow.show();
            updateDocumentInfo();
            updateStatus('DOM Visualizer ready. Click "Enumerate DOM" to begin analysis.');
            return true;
        } else {
            updateStatus('Failed to create visualizer window');
            return false;
        }
        
    } catch (exc) {
        updateStatus('Error showing DOM visualizer: ' + exc.message);
        return false;
    }
}

/**
 * Show DOM visualizer interface (alternative entry point for compatibility)
 * @returns {Boolean} True if interface shown successfully
 */
function showDOMExplorer() {
    return showDOMVisualizer();
}

/**
 * Create main DOM visualization interface with error handling
 * @returns {Object} Window dialog object
 */
function createDOMVisualizerUI() {
    try {
        // Parameter validation and window creation
        var mainWindow = null;
        
        try {
            mainWindow = new Window('dialog', 'InDesign DOM Discovery Builder v2.1.1');
        } catch (exc) {
            updateStatus('Failed to create main window: ' + exc.message);
            return null;
        }
        
        if (!mainWindow) {
            updateStatus('Window creation returned null');
            return null;
        }
        
        // Window configuration with error protection
        try {
            mainWindow.orientation = 'column';
            mainWindow.alignChildren = 'fill';
            mainWindow.spacing = 10;
            mainWindow.margins = 16;
            
            // Set window size with fallback
            if (mainWindow.preferredSize) {
                mainWindow.preferredSize.width = 800;
                mainWindow.preferredSize.height = 700;
            }
        } catch (exc) {
            updateStatus('Window configuration error: ' + exc.message);
            // Continue with defaults
        }
        
        // Create UI panels with error handling
        var panelsCreated = 0;
        
        try {
            if (createDocumentInfoPanel(mainWindow)) panelsCreated++;
        } catch (exc) {
            updateStatus('Document info panel creation failed: ' + exc.message);
        }
        
        try {
            if (createDOMDisplayPanel(mainWindow)) panelsCreated++;
        } catch (exc) {
            updateStatus('DOM display panel creation failed: ' + exc.message);
        }
        
        try {
            if (createControlPanel(mainWindow)) panelsCreated++;
        } catch (exc) {
            updateStatus('Control panel creation failed: ' + exc.message);
        }
        
        try {
            if (createStatusPanel(mainWindow)) panelsCreated++;
        } catch (exc) {
            updateStatus('Status panel creation failed: ' + exc.message);
        }
        
        if (panelsCreated === 0) {
            updateStatus('No UI panels created successfully');
            return null;
        }
        
        return mainWindow;
        
    } catch (exc) {
        updateStatus('UI creation failed: ' + exc.message);
        return null;
    }
}

// =============================================================================
// UI PANEL CREATION
// =============================================================================

/**
 * Create document information panel with error handling
 * @param {Object} parentWindow - Parent window
 * @returns {Boolean} True if panel created successfully
 */
function createDocumentInfoPanel(parentWindow) {
    try {
        // Parameter validation
        if (!parentWindow) {
            return false;
        }
        
        var infoGroup = parentWindow.add('group');
        if (!infoGroup) {
            return false;
        }
        
        infoGroup.orientation = 'column';
        infoGroup.alignChildren = 'left';
        infoGroup.spacing = 5;
        
        // Title with font handling
        var titleText = infoGroup.add('statictext', undefined, 'DOCUMENT INFORMATION');
        if (titleText) {
            try {
                titleText.graphics.font = ScriptUI.newFont('Arial', 'BOLD', 12);
            } catch (exc) {
                // Font setting failed - continue with default
            }
        }
        
        // Document info display with sizing
        g_domViz_documentInfo = infoGroup.add('statictext', undefined, 'No document information available');
        if (g_domViz_documentInfo) {
            try {
                g_domViz_documentInfo.preferredSize.width = 750;
                g_domViz_documentInfo.characters = 80;
            } catch (exc) {
                // Size setting failed - continue with defaults
            }
        }
        
        return true;
        
    } catch (exc) {
        return false;
    }
}

/**
 * Create DOM tree display panel with error handling
 * @param {Object} parentWindow - Parent window
 * @returns {Boolean} True if panel created successfully
 */
function createDOMDisplayPanel(parentWindow) {
    try {
        // Parameter validation
        if (!parentWindow) {
            return false;
        }
        
        var displayGroup = parentWindow.add('group');
        if (!displayGroup) {
            return false;
        }
        
        displayGroup.orientation = 'column';
        displayGroup.alignChildren = 'fill';
        displayGroup.spacing = 5;
        
        // Title with font handling
        var titleText = displayGroup.add('statictext', undefined, 'DOM STRUCTURE TREE');
        if (titleText) {
            try {
                titleText.graphics.font = ScriptUI.newFont('Arial', 'BOLD', 12);
            } catch (exc) {
                // Font setting failed - continue with default
            }
        }
        
        // Scrollable text area for DOM tree with configuration
        g_domViz_domDisplay = displayGroup.add('edittext', undefined, 'Click "Enumerate DOM" to discover document structure...', {multiline: true, scrolling: true});
        if (g_domViz_domDisplay) {
            try {
                g_domViz_domDisplay.preferredSize.width = 750;
                g_domViz_domDisplay.preferredSize.height = 400;
                g_domViz_domDisplay.readonly = true;
            } catch (exc) {
                // Size/property setting failed - continue with defaults
            }
        }
        
        return true;
        
    } catch (exc) {
        return false;
    }
}

/**
 * Create control panel with action buttons and error handling
 * @param {Object} parentWindow - Parent window
 * @returns {Boolean} True if panel created successfully
 */
function createControlPanel(parentWindow) {
    try {
        // Parameter validation
        if (!parentWindow) {
            return false;
        }
        
        var controlGroup = parentWindow.add('group');
        if (!controlGroup) {
            return false;
        }
        
        controlGroup.orientation = 'row';
        controlGroup.alignChildren = 'center';
        controlGroup.spacing = 10;
        
        var buttonsCreated = 0;
        
        // Main action buttons with error handling
        try {
            var enumerateBtn = controlGroup.add('button', undefined, 'Enumerate DOM');
            if (enumerateBtn) {
                enumerateBtn.preferredSize.width = 120;
                enumerateBtn.onClick = function() {
                    try {
                        runDOMEnumeration();
                    } catch (exc) {
                        updateStatus('Enumeration button error: ' + exc.message);
                    }
                };
                buttonsCreated++;
            }
        } catch (exc) {
            updateStatus('Enumerate button creation failed: ' + exc.message);
        }
        
        try {
            var sampleBtn = controlGroup.add('button', undefined, 'Sample Collections');
            if (sampleBtn) {
                sampleBtn.preferredSize.width = 120;
                sampleBtn.onClick = function() {
                    try {
                        runCollectionSampling();
                    } catch (exc) {
                        updateStatus('Collection sampling button error: ' + exc.message);
                    }
                };
                buttonsCreated++;
            }
        } catch (exc) {
            updateStatus('Sample button creation failed: ' + exc.message);
        }
        
        try {
            var exportBtn = controlGroup.add('button', undefined, 'Export DOM');
            if (exportBtn) {
                exportBtn.preferredSize.width = 120;
                exportBtn.onClick = function() {
                    try {
                        showExportOptions();
                    } catch (exc) {
                        updateStatus('Export button error: ' + exc.message);
                    }
                };
                buttonsCreated++;
            }
        } catch (exc) {
            updateStatus('Export button creation failed: ' + exc.message);
        }
        
        try {
            var settingsBtn = controlGroup.add('button', undefined, 'Settings');
            if (settingsBtn) {
                settingsBtn.preferredSize.width = 120;
                settingsBtn.onClick = function() {
                    try {
                        // ENHANCED: Use new configurable settings dialog
                        showConfigurableSettingsDialog();
                    } catch (exc) {
                        updateStatus('Settings button error: ' + exc.message);
                        // Fallback to original settings
                        try {
                            showSettingsDialog();
                        } catch (exc2) {
                            updateStatus('Both settings dialogs failed');
                        }
                    }
                };
                buttonsCreated++;
            }
        } catch (exc) {
            updateStatus('Settings button creation failed: ' + exc.message);
        }
        
        // Close button
        try {
            var closeBtn = controlGroup.add('button', undefined, 'Close');
            if (closeBtn) {
                closeBtn.preferredSize.width = 80;
                closeBtn.onClick = function() {
                    try {
                        if (g_domViz_visualizerWindow) {
                            g_domViz_visualizerWindow.close();
                            g_domViz_visualizerWindow = null;
                        }
                    } catch (exc) {
                        updateStatus('Close button error: ' + exc.message);
                    }
                };
                buttonsCreated++;
            }
        } catch (exc) {
            updateStatus('Close button creation failed: ' + exc.message);
        }
        
        return buttonsCreated > 0;
        
    } catch (exc) {
        return false;
    }
}

/**
 * Create status panel with error handling
 * @param {Object} parentWindow - Parent window
 * @returns {Boolean} True if panel created successfully
 */
function createStatusPanel(parentWindow) {
    try {
        // Parameter validation
        if (!parentWindow) {
            return false;
        }
        
        var statusGroup = parentWindow.add('group');
        if (!statusGroup) {
            return false;
        }
        
        statusGroup.orientation = 'row';
        statusGroup.alignChildren = 'left';
        statusGroup.spacing = 5;
        
        var statusLabel = statusGroup.add('statictext', undefined, 'Status:');
        if (statusLabel) {
            try {
                statusLabel.graphics.font = ScriptUI.newFont('Arial', 'BOLD', 10);
            } catch (exc) {
                // Font setting failed - continue with default
            }
        }
        
        g_domViz_statusText = statusGroup.add('statictext', undefined, 'Ready');
        if (g_domViz_statusText) {
            try {
                g_domViz_statusText.preferredSize.width = 600;
                g_domViz_statusText.characters = 100;
            } catch (exc) {
                // Size setting failed - continue with defaults
            }
        }
        
        return true;
        
    } catch (exc) {
        return false;
    }
}

// =============================================================================
// ENHANCED CONFIGURABLE SETTINGS SYSTEM
// =============================================================================

/**
 * Show advanced configurable settings dialog with fine-grained controls
 * REPLACES: Basic showSettingsDialog() functionality while preserving fallback
 */
function showConfigurableSettingsDialog() {
    try {
        var settingsDialog = new Window('dialog', 'DOM Discovery Builder - Advanced Settings');
        if (!settingsDialog) {
            updateStatus('Failed to create configurable settings dialog');
            return;
        }
        
        settingsDialog.orientation = 'column';
        settingsDialog.alignChildren = 'left';
        settingsDialog.spacing = 10;
        settingsDialog.margins = 16;
        settingsDialog.preferredSize.width = 520;
        settingsDialog.preferredSize.height = 650;
        
        // HEADER with application detection
        var detectedApp = detectCurrentApplication();
        var titleText = settingsDialog.add('statictext', undefined, 'Fine-Grained Analysis Configuration (' + detectedApp.name + ')');
        titleText.graphics.font = ScriptUI.newFont('Arial', 'BOLD', 14);
        
        // PROPERTY SAMPLING SETTINGS (PRIMARY FIX AREA)
        var samplingGroup = settingsDialog.add('panel', undefined, 'Property Value Extraction (COLLECTION FIX)');
        samplingGroup.orientation = 'column';
        samplingGroup.alignChildren = 'left';
        samplingGroup.preferredSize.height = 180;
        
        // Safety Filter
        var safetyGroup = samplingGroup.add('group');
        safetyGroup.add('statictext', undefined, 'Safety Filter:');
        var safetyDropdown = safetyGroup.add('dropdownlist', undefined, [
            'Safe Only (Conservative)', 
            'Safe + Moderate (RECOMMENDED)', 
            'Safe + Moderate + Risky (Aggressive)', 
            'All Properties (Dangerous)'
        ]);
        safetyDropdown.selection = 1; // Default to 'Safe + Moderate' to fix collections
        
        // Collection Sampling - THE KEY FIX FOR 0 COLLECTIONS
        var collectionCheckbox = samplingGroup.add('checkbox', undefined, 'Enable Collection Content Sampling (FIXES 0 COLLECTIONS ISSUE)');
        collectionCheckbox.value = true;  // ENABLE BY DEFAULT
        
        // Max Samples
        var maxSamplesGroup = samplingGroup.add('group');
        maxSamplesGroup.add('statictext', undefined, 'Max Samples per Collection:');
        var maxSamplesSlider = maxSamplesGroup.add('slider', undefined, 25, 5, 100);
        var maxSamplesValue = maxSamplesGroup.add('statictext', undefined, '25');
        maxSamplesSlider.onChanging = function() {
            maxSamplesValue.text = Math.round(this.value);
        };
        
        // Timeout Settings
        var timeoutGroup = samplingGroup.add('group');
        timeoutGroup.add('statictext', undefined, 'Property Timeout (ms):');
        var timeoutSlider = timeoutGroup.add('slider', undefined, 5000, 1000, 15000);
        var timeoutValue = timeoutGroup.add('statictext', undefined, '5000');
        timeoutSlider.onChanging = function() {
            timeoutValue.text = Math.round(this.value);
        };
        
        // DOM DISCOVERY SETTINGS
        var domGroup = settingsDialog.add('panel', undefined, 'DOM Discovery');
        domGroup.orientation = 'column';
        domGroup.alignChildren = 'left';
        domGroup.preferredSize.height = 120;
        
        // Max Depth
        var depthGroup = domGroup.add('group');
        depthGroup.add('statictext', undefined, 'Maximum Depth:');
        var depthSlider = depthGroup.add('slider', undefined, 4, 2, 8);
        var depthValue = domGroup.add('statictext', undefined, '4');
        depthSlider.onChanging = function() {
            depthValue.text = Math.round(this.value);
        };
        
        // Max Properties
        var maxPropsGroup = domGroup.add('group');
        maxPropsGroup.add('statictext', undefined, 'Max Properties per Object:');
        var maxPropsSlider = maxPropsGroup.add('slider', undefined, 5000, 100, 20000);
        var maxPropsValue = domGroup.add('statictext', undefined, '5000');
        maxPropsSlider.onChanging = function() {
            maxPropsValue.text = Math.round(this.value);
        };
        
        // ADVANCED OPTIONS
        var advancedGroup = settingsDialog.add('panel', undefined, 'Advanced Options');
        advancedGroup.orientation = 'column';
        advancedGroup.alignChildren = 'left';
        advancedGroup.preferredSize.height = 100;
        
        var trackReferences = advancedGroup.add('checkbox', undefined, 'Track Object References');
        trackReferences.value = true;
        
        var generateFingerprints = advancedGroup.add('checkbox', undefined, 'Generate Value Fingerprints');
        generateFingerprints.value = true;
        
        var includeMetadata = advancedGroup.add('checkbox', undefined, 'Include Value Metadata');
        includeMetadata.value = true;
        
        // APPLICATION-SPECIFIC OPTIONS
        if (detectedApp.supported) {
            var appGroup = settingsDialog.add('panel', undefined, detectedApp.name + ' Specific Options');
            appGroup.orientation = 'column';
            appGroup.alignChildren = 'left';
            
            if (detectedApp.name === 'InDesign') {
                var includePages = appGroup.add('checkbox', undefined, 'Analyze Page Objects');
                includePages.value = true;
                var includeStories = appGroup.add('checkbox', undefined, 'Analyze Text Stories');
                includeStories.value = true;
            }
        }
        
        // BUTTONS
        var buttonGroup = settingsDialog.add('group');
        buttonGroup.orientation = 'row';
        buttonGroup.alignment = 'center';
        
        var applyBtn = buttonGroup.add('button', undefined, 'Apply & Run Analysis');
        applyBtn.onClick = function() {
            // Collect settings from UI
            var config = {
                safetyFilter: ['safe', 'moderate', 'risky', 'all'][safetyDropdown.selection.index],
                includeCollectionSamples: collectionCheckbox.value,
                maxSamples: Math.round(maxSamplesSlider.value),
                timeoutMs: Math.round(timeoutSlider.value),
                maxDepth: Math.round(depthSlider.value),
                maxProperties: Math.round(maxPropsSlider.value),
                trackObjectReferences: trackReferences.value,
                generateValueFingerprints: generateFingerprints.value,
                includeValueMetadata: includeMetadata.value
            };
            
            // Apply configuration and run analysis
            applyConfigurationAndRun(config);
            settingsDialog.close();
        };
        
        var quickFixBtn = buttonGroup.add('button', undefined, 'Quick Fix Collections');
        quickFixBtn.onClick = function() {
            // Apply just the essential collection fix
            var quickConfig = {
                safetyFilter: 'moderate',
                includeCollectionSamples: true,
                maxSamples: 25,
                timeoutMs: 5000
            };
            applyConfigurationAndRun(quickConfig);
            settingsDialog.close();
        };
        
        var resetBtn = buttonGroup.add('button', undefined, 'Reset to Defaults');
        resetBtn.onClick = function() {
            restoreOriginalConfigurations();
            updateStatus('Settings reset to defaults');
            settingsDialog.close();
        };
        
        var cancelBtn = buttonGroup.add('button', undefined, 'Cancel');
        cancelBtn.onClick = function() {
            settingsDialog.close();
        };
        
        settingsDialog.show();
        
    } catch (exc) {
        updateStatus('Configurable settings dialog error: ' + exc.message);
        // Fallback to original settings dialog
        try {
            showSettingsDialog();
        } catch (exc2) {
            updateStatus('All settings dialogs failed: ' + exc2.message);
        }
    }
}

/**
 * Apply user configuration and run analysis with the new settings
 * @param {Object} userConfig - User configuration from UI
 */
function applyConfigurationAndRun(userConfig) {
    try {
        updateStatus('Applying custom configuration...');
        
        // Store user config globally for this session
        g_domViz_userConfiguration = userConfig;
        
        // Store original configurations if not already stored
        if (!g_domViz_originalConfigs) {
            g_domViz_originalConfigs = {
                sampling: null,
                collection: null
            };
            
            // Store original DEFAULT_SAMPLING_CONFIG if available
            if (typeof DEFAULT_SAMPLING_CONFIG !== 'undefined') {
                g_domViz_originalConfigs.sampling = {};
                for (var key in DEFAULT_SAMPLING_CONFIG) {
                    if (objectHasOwnProperty(DEFAULT_SAMPLING_CONFIG, key)) {
                        g_domViz_originalConfigs.sampling[key] = DEFAULT_SAMPLING_CONFIG[key];
                    }
                }
            }
            
            // Store original DEFAULT_COLLECTION_SAMPLING_CONFIG if available
            if (typeof DEFAULT_COLLECTION_SAMPLING_CONFIG !== 'undefined') {
                g_domViz_originalConfigs.collection = {};
                for (var key2 in DEFAULT_COLLECTION_SAMPLING_CONFIG) {
                    if (objectHasOwnProperty(DEFAULT_COLLECTION_SAMPLING_CONFIG, key2)) {
                        g_domViz_originalConfigs.collection[key2] = DEFAULT_COLLECTION_SAMPLING_CONFIG[key2];
                    }
                }
            }
        }
        
        // Apply user settings to DEFAULT_SAMPLING_CONFIG if available
        if (typeof DEFAULT_SAMPLING_CONFIG !== 'undefined') {
            if (userConfig.safetyFilter) DEFAULT_SAMPLING_CONFIG.safetyFilter = userConfig.safetyFilter;
            if (userConfig.includeCollectionSamples !== undefined) DEFAULT_SAMPLING_CONFIG.includeCollectionSamples = userConfig.includeCollectionSamples;
            if (userConfig.maxSamples) DEFAULT_SAMPLING_CONFIG.maxSamples = userConfig.maxSamples;
            if (userConfig.timeoutMs) DEFAULT_SAMPLING_CONFIG.timeoutMs = userConfig.timeoutMs;
            if (userConfig.trackObjectReferences !== undefined) DEFAULT_SAMPLING_CONFIG.trackObjectReferences = userConfig.trackObjectReferences;
            if (userConfig.generateValueFingerprints !== undefined) DEFAULT_SAMPLING_CONFIG.generateValueFingerprints = userConfig.generateValueFingerprints;
            if (userConfig.includeValueMetadata !== undefined) DEFAULT_SAMPLING_CONFIG.includeValueMetadata = userConfig.includeValueMetadata;
        }
        
        // Apply user settings to DEFAULT_COLLECTION_SAMPLING_CONFIG if available
        if (typeof DEFAULT_COLLECTION_SAMPLING_CONFIG !== 'undefined' && userConfig.includeCollectionSamples) {
            if (userConfig.maxSamples) DEFAULT_COLLECTION_SAMPLING_CONFIG.maxSamplesPerCollection = userConfig.maxSamples;
            if (userConfig.timeoutMs) DEFAULT_COLLECTION_SAMPLING_CONFIG.timeoutPerItem = userConfig.timeoutMs;
        }
        
        // Run DOM enumeration with custom configuration
        updateStatus('Running DOM enumeration with custom settings - Safety: ' + 
                    (userConfig.safetyFilter || 'moderate') + ', Collections: ' + 
                    (userConfig.includeCollectionSamples ? 'ENABLED' : 'DISABLED') +
                    ', Samples: ' + (userConfig.maxSamples || 25));
        
        if (typeof runDOMEnumeration === 'function') {
            runDOMEnumeration();
        } else {
            updateStatus('DOM enumeration function not available');
        }
        
    } catch (exc) {
        updateStatus('Configuration application error: ' + exc.message);
    }
}

/**
 * Restore original configurations
 */
function restoreOriginalConfigurations() {
    try {
        if (g_domViz_originalConfigs) {
            // Restore DEFAULT_SAMPLING_CONFIG
            if (g_domViz_originalConfigs.sampling && typeof DEFAULT_SAMPLING_CONFIG !== 'undefined') {
                for (var key in g_domViz_originalConfigs.sampling) {
                    if (objectHasOwnProperty(g_domViz_originalConfigs.sampling, key)) {
                        DEFAULT_SAMPLING_CONFIG[key] = g_domViz_originalConfigs.sampling[key];
                    }
                }
            }
            
            // Restore DEFAULT_COLLECTION_SAMPLING_CONFIG
            if (g_domViz_originalConfigs.collection && typeof DEFAULT_COLLECTION_SAMPLING_CONFIG !== 'undefined') {
                for (var key2 in g_domViz_originalConfigs.collection) {
                    if (objectHasOwnProperty(g_domViz_originalConfigs.collection, key2)) {
                        DEFAULT_COLLECTION_SAMPLING_CONFIG[key2] = g_domViz_originalConfigs.collection[key2];
                    }
                }
            }
        }
        
        // Clear user configuration
        g_domViz_userConfiguration = null;
        
    } catch (exc) {
        updateStatus('Configuration restoration error: ' + exc.message);
    }
}

// =============================================================================
// CORE OPERATIONS - INTEGRATED VALUE EXTRACTION
// =============================================================================

/**
 * Execute DOM enumeration with integrated value extraction and display results
 */
function runDOMEnumeration() {
    try {
        updateStatus('Starting DOM enumeration...');
        
        // Environment validation
        var envValidation = validateInDesignEnvironment();
        if (!envValidation.valid) {
            updateStatus('Error: ' + envValidation.error);
            return;
        }
        
        updateStatus('Enumerating document structure...');
        
        // Check if enumeration function is available
        if (typeof enumerateDocumentDOM !== 'function') {
            updateStatus('Error: DOM enumeration function not available - requires dom-enumerator module');
            return;
        }
        
        // Create enumeration config with user overrides
        var enumerationConfig = {
            maxDepth: (g_domViz_userConfiguration && g_domViz_userConfiguration.maxDepth) || 4,
            timeoutMs: 15000,
            skipDangerous: true,
            maxProperties: (g_domViz_userConfiguration && g_domViz_userConfiguration.maxProperties) || 5000,
            enableObjectTracking: true,
            enableDuplicateDetection: true
        };
        
        // Show current configuration in status
        if (g_domViz_userConfiguration) {
            updateStatus('Using custom config: Depth=' + enumerationConfig.maxDepth + 
                        ', MaxProps=' + enumerationConfig.maxProperties + 
                        ', Collections=' + (g_domViz_userConfiguration.includeCollectionSamples ? 'ENABLED' : 'DISABLED') +
                        ', Safety=' + g_domViz_userConfiguration.safetyFilter);
        }
        
        // Perform DOM enumeration with progress tracking and configuration
        var startTime = new Date().getTime();
        var domStructure = enumerateDocumentDOM(envValidation.document, enumerationConfig);
        
        var elapsedTime = new Date().getTime() - startTime;
        
        if (!domStructure || (domStructure.metadata && domStructure.metadata.error)) {
            var errorMsg = 'Unknown error';
            if (domStructure && domStructure.metadata && domStructure.metadata.error) {
                errorMsg = domStructure.metadata.error;
            }
            updateStatus('DOM enumeration failed: ' + errorMsg);
            return;
        }
        
        // Store result
        g_domViz_currentDOMStructure = domStructure;
        
        updateStatus('DOM enumeration complete! Processing extracted values...');
        
        // Update display with enumeration results
        var displayText = formatDOMForDisplay(domStructure);
        if (g_domViz_domDisplay && displayText) {
            g_domViz_domDisplay.text = displayText;
        }
        
        // Update document info
        updateDocumentInfo();
        
        // Get comprehensive statistics
        var domStats = {
            totalNodes: 0,
            totalProperties: 0,
            objectReferences: 0
        };
        
        if (domStructure.statistics) {
            domStats = {
                totalNodes: domStructure.statistics.totalNodes || 0,
                totalProperties: domStructure.statistics.totalProperties || 0,
                objectReferences: domStructure.statistics.objectReferences || 0
            };
        }
        
        var samplingStats = null;
        if (typeof getSamplingStatistics === 'function') {
            samplingStats = getSamplingStatistics(domStructure);
        } else {
            // Fallback sampling stats
            samplingStats = {
                valuesSampled: 0,
                propertiesSampled: 0
            };
            
            if (domStructure.metadata && 
                domStructure.metadata.valueSampling && 
                domStructure.metadata.valueSampling.statistics) {
                var valueStats = domStructure.metadata.valueSampling.statistics;
                samplingStats.valuesSampled = valueStats.valuesSampled || 0;
                samplingStats.propertiesSampled = valueStats.propertiesSampled || 0;
            }
        }
        
        var totalNodes = domStats.totalNodes || 0;
        var totalProperties = domStats.totalProperties || 0;
        var objectReferences = domStats.objectReferences || 0;
        var valuesExtracted = samplingStats.valuesSampled || 0;
        var propertiesSampled = samplingStats.propertiesSampled || 0;
        
        // Auto-run collection sampling if enabled in user config
        if (g_domViz_userConfiguration && g_domViz_userConfiguration.includeCollectionSamples) {
            updateStatus('Auto-running collection sampling with custom config...');
            setTimeout(function() {
                try {
                    runCollectionSampling();
                } catch (exc) {
                    updateStatus('Auto collection sampling error: ' + exc.message);
                }
            }, 500);
        }
        
        updateStatus('Complete! Found ' + totalNodes + ' objects, ' + 
                    totalProperties + ' properties. ' +
                    'Extracted ' + valuesExtracted + ' actual values from ' + 
                    propertiesSampled + ' properties in ' + elapsedTime + 'ms. ' +
                    'Object references: ' + objectReferences + 
                    (g_domViz_userConfiguration && g_domViz_userConfiguration.includeCollectionSamples ? ' [Auto-sampling collections...]' : ''));
        
    } catch (exc) {
        updateStatus('Enumeration error: ' + exc.message);
    }
}

/**
 * Execute collection sampling and display results
 */
function runCollectionSampling() {
    try {
        if (!g_domViz_currentDOMStructure) {
            updateStatus('Please run DOM enumeration first');
            return;
        }
        
        updateStatus('Sampling collection contents...');
        
        // Environment validation
        var envValidation = validateInDesignEnvironment();
        if (!envValidation.valid) {
            updateStatus('Error: ' + envValidation.error);
            return;
        }
        
        // Check if collection sampling function is available
        if (typeof sampleCollectionContents !== 'function') {
            updateStatus('Error: Collection sampling function not available - requires collection-sampler module');
            return;
        }
        
        // Perform collection sampling with progress tracking and configuration
        var startTime = new Date().getTime();
        var config = objectClone({
            maxSamplesPerCollection: (g_domViz_userConfiguration && g_domViz_userConfiguration.maxSamples) || 5,
            timeoutPerCollection: 5000,
            timeoutPerItem: (g_domViz_userConfiguration && g_domViz_userConfiguration.timeoutMs) || 2000,
            maxCollectionSize: 2000,
            samplingDepth: 3,
            enableObjectReferenceTracking: true,
            enableDeepPropertyAnalysis: true,
            enableCrossCollectionTracking: true
        }, 2);
        
        if (g_domViz_userConfiguration) {
            updateStatus('Collection sampling with custom config: MaxSamples=' + config.maxSamplesPerCollection + 
                        ', Timeout=' + config.timeoutPerItem + 'ms');
        }
        
        var structureWithCollections = sampleCollectionContents(g_domViz_currentDOMStructure, envValidation.document, config);
        
        var elapsedTime = new Date().getTime() - startTime;
        
        if (!structureWithCollections) {
            updateStatus('Collection sampling failed');
            return;
        }
        
        // Update stored structure
        g_domViz_currentDOMStructure = structureWithCollections;
        
        // Update display with collection information
        var displayText = formatDOMForDisplay(structureWithCollections);
        if (g_domViz_domDisplay && displayText) {
            g_domViz_domDisplay.text = displayText;
        }
        
        // Update document info
        updateDocumentInfo();
        
        // Success status with collection sampling statistics
        var collectionStats = null;
        if (typeof getCollectionSamplingStatistics === 'function') {
            collectionStats = getCollectionSamplingStatistics(structureWithCollections);
        } else {
            // Fallback statistics
            collectionStats = {
                collectionsSampled: 0,
                totalItemsSampled: 0
            };
            
            if (structureWithCollections.metadata && structureWithCollections.metadata.collectionSampling && 
                structureWithCollections.metadata.collectionSampling.statistics) {
                var stats = structureWithCollections.metadata.collectionSampling.statistics;
                collectionStats.collectionsSampled = stats.collectionsSampled || 0;
                collectionStats.totalItemsSampled = stats.totalItemsSampled || 0;
            }
        }
        
        updateStatus('Collection sampling complete! ' +
                    'Sampled ' + (collectionStats.collectionsSampled || 0) + 
                    ' collections with ' + (collectionStats.totalItemsSampled || 0) + ' items in ' + 
                    elapsedTime + 'ms');
        
    } catch (exc) {
        updateStatus('Collection sampling error: ' + exc.message);
    }
}

// =============================================================================
// DISPLAY FUNCTIONS - SHOW EXTRACTED VALUES
// =============================================================================

/**
 * Convert DOM structure to human-readable tree format with extracted values - ES3 compliant
 * @param {Object} domStructure - DOM structure to format
 * @returns {String} Formatted tree with comprehensive metadata and extracted values
 */
function formatDOMForDisplay(domStructure) {
    try {
        // Parameter validation
        if (!domStructure || typeof domStructure !== 'object') {
            return 'No DOM structure available';
        }
        
        if (!domStructure.structure || !domStructure.structure.document) {
            return 'No DOM structure available - missing document data';
        }
        
        var builder = createStringBuilder();
        
        // Header with comprehensive metadata
        builder.appendLine('InDesign DOM Structure Analysis with Value Extraction');
        builder.appendLine('======================================================');
        
        if (domStructure.metadata) {
            var metadata = domStructure.metadata;
            builder.appendLine('Analysis Time: ' + (metadata.timestamp || 'Unknown'));
            builder.appendLine('InDesign Version: ' + (metadata.indesignVersion || 'Unknown'));
            builder.appendLine('');
        }
        
        // Enhanced statistics display
        if (domStructure.statistics) {
            var stats = domStructure.statistics;
            var totalNodes = stats.totalNodes || 0;
            var totalProperties = stats.totalProperties || 0;
            
            builder.appendLine('Total Objects: ' + totalNodes);
            builder.appendLine('Total Properties: ' + totalProperties);
            
            if (stats.enumerationTime) {
                builder.appendLine('Processing Time: ' + stats.enumerationTime + 'ms');
            }
        }
        
        // Show current configuration if user has applied custom settings
        if (g_domViz_userConfiguration) {
            builder.appendLine('');
            builder.appendLine('ACTIVE CONFIGURATION:');
            builder.appendLine('- Safety Filter: ' + (g_domViz_userConfiguration.safetyFilter || 'default'));
            builder.appendLine('- Collection Sampling: ' + (g_domViz_userConfiguration.includeCollectionSamples ? 'ENABLED' : 'DISABLED'));
            builder.appendLine('- Max Samples: ' + (g_domViz_userConfiguration.maxSamples || 'default'));
            builder.appendLine('- Timeout: ' + (g_domViz_userConfiguration.timeoutMs || 'default') + 'ms');
        }
        
        builder.appendLine('');
        builder.appendLine('Structure Tree with Extracted Values:');
        builder.appendLine('------------------------------------');
        
        // Generate tree structure with extracted values
        generateDOMTreeText(domStructure.structure.document, '', true, builder);
        
        return builder.toString();
        
    } catch (exc) {
        return 'Error formatting DOM structure: ' + exc.message;
    }
}

/**
 * Recursively generate tree structure text with extracted values - Show Actual Values
 * @param {Object} domNode - DOM node
 * @param {String} prefix - Tree prefix
 * @param {Boolean} isLast - Is last node at this level
 * @param {Object} builder - String builder
 */
function generateDOMTreeText(domNode, prefix, isLast, builder) {
    try {
        // Parameter validation
        if (!domNode || !builder) {
            return;
        }
        
        // Node line with comprehensive information
        var connector = isLast ? '└── ' : '├── ';
        var nodeLine = prefix + connector + (domNode.path || 'unknown');
        
        // Add object type and property count
        if (domNode.properties && domNode.properties.length) {
            nodeLine += ' [' + domNode.properties.length + ' properties]';
        }
        
        // Add collection count if available
        if (domNode.collections && domNode.collections.length) {
            nodeLine += ' [' + domNode.collections.length + ' collections]';
        }
        
        builder.appendLine(nodeLine);
        
        // Show extracted property values if available
        var newPrefix = prefix + (isLast ? '    ' : '│   ');
        var extractedValueCount = 0;
        
        if (domNode.properties && domNode.properties.length) {
            // Count properties with extracted values
            for (var i = 0; i < domNode.properties.length; i++) {
                var propData = domNode.properties[i];
                if (propData && propData.extractedValue !== null && propData.extractedValue !== undefined) {
                    extractedValueCount++;
                }
            }
            
            // Display up to 5 extracted values
            for (var k = 0; k < Math.min(domNode.properties.length, 5); k++) {
                var propertyData = domNode.properties[k];
                if (propertyData && propertyData.extractedValue !== null && propertyData.extractedValue !== undefined) {
                    var valueLine = newPrefix + '    ↳ ' + propertyData.name + ': ';
                    
                    if (propertyData.samplingMetadata && propertyData.samplingMetadata.actualValue) {
                        valueLine += propertyData.samplingMetadata.actualValue;
                    } else {
                        // Fallback display
                        var valueStr = String(propertyData.extractedValue);
                        if (valueStr.length > 50) {
                            valueStr = valueStr.substring(0, 50) + '...';
                        }
                        valueLine += valueStr;
                    }
                    
                    builder.appendLine(valueLine);
                }
            }
            
            if (extractedValueCount > 5) {
                builder.appendLine(newPrefix + '    ... and ' + (extractedValueCount - 5) + ' more extracted values');
            }
        }
        
        // Collection details if sampling data available
        if (domNode.collections && domNode.collections.length) {
            for (var l = 0; l < domNode.collections.length; l++) {
                var collection = domNode.collections[l];
                if (collection && collection.samplingData) {
                    var collNewPrefix = prefix + (isLast ? '    ' : '│   ');
                    var collectionName = collection.name || 'unnamed';
                    var itemsSampled = collection.samplingData.itemsSampled || 0;
                    
                    var detailLine = collNewPrefix + '    ↳ ' + collectionName + ': ' + itemsSampled + ' items sampled';
                    
                    if (collection.samplingData.patterns && collection.samplingData.patterns.accessRecommendations) {
                        var recommendations = collection.samplingData.patterns.accessRecommendations;
                        if (recommendations && recommendations.length > 0) {
                            detailLine += ', ' + recommendations.length + ' common properties';
                        }
                    }
                    
                    builder.appendLine(detailLine);
                }
            }
        }
        
        // Child nodes processing
        if (domNode.childNodes && domNode.childNodes.length) {
            var childNewPrefix = prefix + (isLast ? '    ' : '│   ');
            
            for (var m = 0; m < domNode.childNodes.length; m++) {
                var isLastChild = (m === domNode.childNodes.length - 1);
                generateDOMTreeText(domNode.childNodes[m], childNewPrefix, isLastChild, builder);
            }
        }
        
    } catch (exc) {
        if (builder) {
            builder.appendLine(prefix + '└── [Error displaying node: ' + exc.message + ']');
        }
    }
}

// =============================================================================
// UI UPDATE FUNCTIONS
// =============================================================================

/**
 * Update status display with error handling
 * @param {String} message - Status message
 */
function updateStatus(message) {
    try {
        // Parameter validation
        if (!message || typeof message !== 'string') {
            message = 'Unknown status';
        }
        
        if (g_domViz_statusText) {
            g_domViz_statusText.text = message;
        }
        
        // Also output to console for debugging with formatting
        $.writeln('[DOM Visualizer] ' + getCurrentTimestamp() + ': ' + message);
        
    } catch (exc) {
        $.writeln('[DOM Visualizer] Status update error: ' + exc.message);
    }
}

/**
 * Update document information display with comprehensive metadata including extracted values
 */
function updateDocumentInfo() {
    try {
        if (!g_domViz_documentInfo) {
            return;
        }
        
        var envValidation = validateInDesignEnvironment();
        if (!envValidation.valid) {
            g_domViz_documentInfo.text = 'No document available: ' + envValidation.error;
            return;
        }
        
        var infoText = '';
        var targetDocument = envValidation.document;
        
        // Basic document information
        try {
            var docName = targetDocument.name || 'Unnamed Document';
            infoText += 'Document: ' + docName;
        } catch (exc) {
            infoText += 'Document: [Name access error]';
        }
        
        try {
            var savedStatus = targetDocument.saved ? ' (Saved)' : ' (Unsaved)';
            infoText += savedStatus;
        } catch (exc) {
            infoText += ' (Status unknown)';
        }
        
        // Add DOM analysis status if available
        if (g_domViz_currentDOMStructure) {
            var domStats = g_domViz_currentDOMStructure.statistics || {};
            infoText += ' | Objects: ' + (domStats.totalNodes || 0) + 
                       ' | Properties: ' + (domStats.totalProperties || 0);
            
            // Value sampling statistics
            var samplingStats = null;
            if (typeof getSamplingStatistics === 'function') {
                samplingStats = getSamplingStatistics(g_domViz_currentDOMStructure);
            } else {
                // Fallback sampling stats
                samplingStats = { valuesSampled: 0, propertiesSampled: 0 };
                
                if (g_domViz_currentDOMStructure.metadata && 
                    g_domViz_currentDOMStructure.metadata.valueSampling && 
                    g_domViz_currentDOMStructure.metadata.valueSampling.statistics) {
                    var valueStats = g_domViz_currentDOMStructure.metadata.valueSampling.statistics;
                    samplingStats.valuesSampled = valueStats.valuesSampled || 0;
                    samplingStats.propertiesSampled = valueStats.propertiesSampled || 0;
                }
            }
            
            if (samplingStats.valuesSampled > 0) {
                infoText += ' | Values: ' + samplingStats.valuesSampled + ' extracted';
            }
            
            // Collection sampling statistics
            var collectionStats = null;
            if (typeof getCollectionSamplingStatistics === 'function') {
                collectionStats = getCollectionSamplingStatistics(g_domViz_currentDOMStructure);
            } else {
                // Fallback collection stats
                collectionStats = { samplingEnabled: false, collectionsFound: 0, collectionsSampled: 0 };
                
                if (g_domViz_currentDOMStructure.metadata && 
                    g_domViz_currentDOMStructure.metadata.collectionSampling) {
                    collectionStats.samplingEnabled = true;
                    if (g_domViz_currentDOMStructure.metadata.collectionSampling.statistics) {
                        var collStats = g_domViz_currentDOMStructure.metadata.collectionSampling.statistics;
                        collectionStats.collectionsFound = collStats.collectionsFound || 0;
                        collectionStats.collectionsSampled = collStats.collectionsSampled || 0;
                    }
                }
            }
            
            if (collectionStats.samplingEnabled) {
                infoText += ' | Collections: ' + (collectionStats.collectionsFound || 0) + 
                           ' found, ' + (collectionStats.collectionsSampled || 0) + ' sampled';
            }
        }
        
        g_domViz_documentInfo.text = infoText;
        
    } catch (exc) {
        if (g_domViz_documentInfo) {
            g_domViz_documentInfo.text = 'Document info error: ' + exc.message;
        }
    }
}

// =============================================================================
// EXPORT INTEGRATION
// =============================================================================

/**
 * Show export options dialog with validation
 */
function showExportOptions() {
    try {
        if (!g_domViz_currentDOMStructure) {
            updateStatus('Please run DOM enumeration first');
            return;
        }
        
        // Check if export functionality is available
        if (typeof showExportDialog !== 'function') {
            updateStatus('Export functionality not available - requires dom-exporter module');
            return;
        }
        
        showExportDialog();
        
    } catch (exc) {
        updateStatus('Export options error: ' + exc.message);
    }
}

/**
 * Show export format selection dialog with error handling
 */
function showExportDialog() {
    try {
        var exportDialog = new Window('dialog', 'Export DOM Structure');
        if (!exportDialog) {
            updateStatus('Failed to create export dialog');
            return;
        }
        
        exportDialog.orientation = 'column';
        exportDialog.alignChildren = 'left';
        exportDialog.spacing = 10;
        exportDialog.margins = 16;
        
        // Format selection with error protection
        var formatGroup = exportDialog.add('group');
        if (formatGroup) {
            formatGroup.orientation = 'column';
            formatGroup.alignChildren = 'left';
            
            formatGroup.add('statictext', undefined, 'Export Format:');
            
            var textRadio = formatGroup.add('radiobutton', undefined, 'Text (.txt) - Human-readable with complete analysis');
            var jsonRadio = formatGroup.add('radiobutton', undefined, 'JSON (.json) - Machine-readable with object references');
            var csvRadio = formatGroup.add('radiobutton', undefined, 'CSV (.csv) - Spreadsheet-compatible with reference data');
            
            if (textRadio) textRadio.value = true; // Default selection
        }
        
        // Buttons with error protection
        var buttonGroup = exportDialog.add('group');
        if (buttonGroup) {
            buttonGroup.orientation = 'row';
            buttonGroup.alignment = 'center';
            buttonGroup.spacing = 10;
            
            var exportBtn = buttonGroup.add('button', undefined, 'Export');
            var cancelBtn = buttonGroup.add('button', undefined, 'Cancel');
            
            if (exportBtn) {
                exportBtn.onClick = function() {
                    try {
                        var formatValue = 'text';
                        if (jsonRadio && jsonRadio.value) formatValue = 'json';
                        else if (csvRadio && csvRadio.value) formatValue = 'csv';
                        
                        exportDialog.close();
                        performExport(formatValue);
                    } catch (exc) {
                        updateStatus('Export button error: ' + exc.message);
                    }
                };
            }
            
            if (cancelBtn) {
                cancelBtn.onClick = function() {
                    try {
                        exportDialog.close();
                    } catch (exc) {
                        updateStatus('Cancel button error: ' + exc.message);
                    }
                };
            }
        }
        
        exportDialog.show();
        
    } catch (exc) {
        updateStatus('Export dialog error: ' + exc.message);
    }
}

/**
 * Perform the actual export operation with all formats available
 * @param {String} formatValue - Export format (text, json, csv)
 */
function performExport(formatValue) {
    try {
        // Parameter validation
        if (!g_domViz_currentDOMStructure) {
            updateStatus('No DOM structure to export');
            return;
        }
        
        if (!formatValue || typeof formatValue !== 'string') {
            formatValue = 'text';
        }
        
        // Check if export function is available
        if (typeof exportDOMStructure !== 'function') {
            updateStatus('Export function not available - requires dom-exporter module');
            return;
        }
        
        updateStatus('Exporting DOM structure as ' + formatValue.toUpperCase() + '...');
        
        var exportOptions = objectClone({
            includeMetadata: true,
            includeStatistics: true,
            includeAccessGuide: true,
            includeObjectReferences: true,
            includeAccessPaths: true,
            includeComparisonData: true
        }, 2);
        
        var exportResult = exportDOMStructure(g_domViz_currentDOMStructure, formatValue, null, exportOptions);
        
        if (exportResult && exportResult.success) {
            updateStatus('Export successful! File saved: ' + exportResult.filePath);
            
            // Success dialog with file location
            try {
                var successDialog = new Window('dialog', 'Export Complete');
                if (successDialog) {
                    successDialog.orientation = 'column';
                    successDialog.alignChildren = 'left';
                    successDialog.spacing = 10;
                    successDialog.margins = 16;
                    
                    successDialog.add('statictext', undefined, 'Export completed successfully!');
                    successDialog.add('statictext', undefined, 'File saved to: ' + exportResult.filePath);
                    
                    if (exportResult.metadata) {
                        var contentLength = exportResult.metadata.contentLength || 0;
                        var exportTime = exportResult.metadata.exportTime || 0;
                        
                        successDialog.add('statictext', undefined, 'File size: ' + contentLength + ' characters');
                        successDialog.add('statictext', undefined, 'Export time: ' + exportTime + 'ms');
                    }
                    
                    var okBtn = successDialog.add('button', undefined, 'OK');
                    if (okBtn) {
                        okBtn.onClick = function() {
                            try {
                                successDialog.close();
                            } catch (exc) {
                                // Silent close error
                            }
                        };
                    }
                    
                    successDialog.show();
                }
            } catch (exc) {
                // Success dialog failed, but export was successful
                updateStatus('Export successful (dialog error): ' + exportResult.filePath);
            }
            
        } else {
            var errorMsg = 'Unknown export error';
            if (exportResult && exportResult.error) {
                errorMsg = exportResult.error;
            }
            updateStatus('Export failed: ' + errorMsg);
        }
        
    } catch (exc) {
        updateStatus('Export error: ' + exc.message);
    }
}

// =============================================================================
// SETTINGS (ORIGINAL + ENHANCED)
// =============================================================================

/**
 * Show original settings dialog with feature information (PRESERVED FOR FALLBACK)
 */
function showSettingsDialog() {
    try {
        var settingsDialog = new Window('dialog', 'DOM Visualizer Settings');
        if (!settingsDialog) {
            updateStatus('Failed to create settings dialog');
            return;
        }
        
        settingsDialog.orientation = 'column';
        settingsDialog.alignChildren = 'left';
        settingsDialog.spacing = 10;
        settingsDialog.margins = 16;
        
        // Current settings display
        var infoGroup = settingsDialog.add('group');
        if (infoGroup) {
            infoGroup.orientation = 'column';
            infoGroup.alignChildren = 'left';
            
            infoGroup.add('statictext', undefined, 'Current Configuration:');
            infoGroup.add('statictext', undefined, '• Maximum Depth: 4 levels');
            infoGroup.add('statictext', undefined, '• Timeout Protection: 15 seconds');
            infoGroup.add('statictext', undefined, '• Object Tracking: Enabled');
            infoGroup.add('statictext', undefined, '• Value Extraction: Enabled');
            infoGroup.add('statictext', undefined, '• Collection Sampling: Available');
            infoGroup.add('statictext', undefined, '• Export Formats: Text, JSON, CSV');
            infoGroup.add('statictext', undefined, '• Safety Filters: Enabled');
            infoGroup.add('statictext', undefined, '• Memory Management: Enhanced');
        }
        
        // Available features with dependency checking
        var featuresGroup = settingsDialog.add('group');
        if (featuresGroup) {
            featuresGroup.orientation = 'column';
            featuresGroup.alignChildren = 'left';
            
            featuresGroup.add('statictext', undefined, 'Available Features:');
            featuresGroup.add('statictext', undefined, '✓ Complete DOM enumeration with object tracking');
            
            // Check for collection sampler availability
            var collectionStatus = typeof sampleCollectionContents === 'function' ? '✓' : '✗';
            featuresGroup.add('statictext', undefined, collectionStatus + ' Collection content sampling with deep analysis');
            
            // Check for value extraction availability
            var valueStatus = typeof sampleDOMValues === 'function' ? '✓' : '✗';
            featuresGroup.add('statictext', undefined, valueStatus + ' Property value extraction with fingerprinting');
            
            // Check for export availability
            var exportStatus = typeof exportDOMStructure === 'function' ? '✓' : '✗';
            featuresGroup.add('statictext', undefined, exportStatus + ' All export formats (text, JSON, CSV)');
            
            featuresGroup.add('statictext', undefined, '✓ Object reference visualization');
            featuresGroup.add('statictext', undefined, '✓ Access pattern display');
            featuresGroup.add('statictext', undefined, '✓ Collection sampling statistics');
            featuresGroup.add('statictext', undefined, '✓ ES3 compatibility');
            featuresGroup.add('statictext', undefined, '✓ Memory management and cleanup');
        }
        
        // Upgrade notice
        var upgradeGroup = settingsDialog.add('group');
        if (upgradeGroup) {
            upgradeGroup.orientation = 'column';
            upgradeGroup.alignChildren = 'left';
            
            upgradeGroup.add('statictext', undefined, 'ENHANCED SETTINGS AVAILABLE:');
            upgradeGroup.add('statictext', undefined, 'Use the Settings button for configurable fine-grained controls');
        }
        
        // Close button
        var okBtn = settingsDialog.add('button', undefined, 'OK');
        if (okBtn) {
            okBtn.onClick = function() {
                try {
                    settingsDialog.close();
                } catch (exc) {
                    updateStatus('Settings dialog close error: ' + exc.message);
                }
            };
        }
        
        settingsDialog.show();
        
    } catch (exc) {
        updateStatus('Settings dialog error: ' + exc.message);
    }
}

// =============================================================================
// END OF 9.0_dom-visualizer.jsx
// =============================================================================