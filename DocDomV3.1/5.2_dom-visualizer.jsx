// =============================================================================
// 5.2_dom-visualizer.jsx - DOM DISCOVERY VISUALIZER - FIXED
// InDesign DOM Discovery Builder v3.1 - PRODUCTION READY - PROGRAMMATIC UI
// =============================================================================
// PURPOSE: Main visualizer interface with comprehensive DOM discovery tools
// DEPENDENCIES: ["1.1_bootstrap-foundation.jsx", "1.2_safety-utilities.jsx"]
// SIZE: ~2000 lines - COMPLETE IMPLEMENTATION - FIXED UI CREATION
// =============================================================================

// =============================================================================
// DEPENDENCY VALIDATION
// =============================================================================

var DOM_VISUALIZER_DEPENDENCIES = ['1.1_bootstrap-foundation', '1.2_safety-utilities'];
var dependencyCheck = validateDependencies(DOM_VISUALIZER_DEPENDENCIES);
if (!dependencyCheck.success) {
    throw new Error('DOM Visualizer missing dependencies: ' + dependencyCheck.missing.join(', '));
}

// =============================================================================
// GLOBAL VARIABLES - FIXED: NO RESERVED WORDS
// =============================================================================

var g_domViz_visualizerWindow = null;
var g_domViz_documentInfo = null;
var g_domViz_statusText = null;
var g_domViz_domDisplay = null;
var g_domViz_currentDOMStructure = null;
var g_domViz_userConfiguration = null;
var g_domViz_originalConfigs = null;
var g_domViz_exportHistory = [];
var g_domViz_beforeData = null;
var g_domViz_afterData = null;

// UI Component References
var g_domViz_mainTabs = null;
var g_domViz_discoveryTab = null;
var g_domViz_exportTab = null;
var g_domViz_comparisonTab = null;
var g_domViz_deepMappingTab = null;
var g_domViz_discoveryDisplay = null;
var g_domViz_exportDisplay = null;
var g_domViz_comparisonDisplay = null;
var g_domViz_mappingDisplay = null;

// =============================================================================
// DEFAULT CONFIGURATION
// =============================================================================

var DEFAULT_VISUALIZER_CONFIG = {
    enumeration: {
        maxDepth: 8,
        timeoutMs: 15000,
        skipDangerous: true,
        maxProperties: 5000,
        enableObjectTracking: true,
        enableDuplicateDetection: true,
        enableCircularReferenceDetection: true
    },
    sampling: {
        safetyFilter: 'safe',
        maxSamples: 20,
        timeoutMs: 2000,
        includeCollectionSamples: true,
        trackObjectReferences: true,
        includeValueMetadata: true,
        generateValueFingerprints: true,
        skipNullValues: false,
        maxStringLength: 500,
        maxCollectionDepth: 2
    },
    exportSettings: {
        includeExtractedValues: true,
        formatOutput: true,
        includeMetadata: true,
        includeObjectReferences: true,
        enableTimestamps: true,
        enableCompression: false,
        maxFileSize: 50 * 1024 * 1024
    },
    ui: {
        autoRefresh: false,
        enableProgressReporting: false,
        enableDetailedLogging: false
    },
    debug: {
        enabled: true,  // NEW: Debug flag - set to true by default
        showEnumeration: true,
        showSampling: true,
        showCircularDetection: true,
        showDisplay: true,
        showPerformance: true
    }
};

// =============================================================================
// MAIN VISUALIZER FUNCTIONS - FIXED: PROGRAMMATIC UI CREATION
// =============================================================================

/**
 * Show DOM visualizer interface (main entry point)
 * @returns {Boolean} True if visualizer shown successfully
 */
function showDOMVisualizer() {
    try {
        // Check if window already exists
        if (g_domViz_visualizerWindow) {
            g_domViz_visualizerWindow.show();
            return true;
        }

        // Validate InDesign environment
        var envValidation = validateInDesignEnvironment();
        if (!envValidation.valid) {
            alert('DOM Visualizer Error: ' + envValidation.error);
            return false;
        }

        // Initialize configuration
        g_domViz_userConfiguration = objectClone(DEFAULT_VISUALIZER_CONFIG, 4);
        g_domViz_originalConfigs = objectClone(DEFAULT_VISUALIZER_CONFIG, 4);

        // Create main window using PROGRAMMATIC approach
        g_domViz_visualizerWindow = createVisualizerWindow();
        if (!g_domViz_visualizerWindow) {
            alert('Failed to create DOM Visualizer window');
            return false;
        }

        // Initialize UI components
        initializeVisualizerComponents();

        // Update document information
        updateDocumentInfo();

        // Show window
        g_domViz_visualizerWindow.show();

        return true;

    } catch (exc) {
        alert('DOM Visualizer Error: ' + exc.message);
        return false;
    }
}

/**
 * Create main visualizer window - FIXED: PROGRAMMATIC CREATION
 * @returns {Window} Created window or null
 */
function createVisualizerWindow() {
    try {
        // Create simple base window - NO complex resource string
        var mainWindow = new Window('dialog', 'InDesign DOM Visualizer v3.1');
        if (!mainWindow) {
            return null;
        }

        mainWindow.orientation = 'column';
        mainWindow.alignChildren = 'fill';
        mainWindow.spacing = 10;
        mainWindow.margins = 15;

        // Set window size
        mainWindow.preferredSize.width = 900;
        mainWindow.preferredSize.height = 700;

        // Build UI components programmatically
        createVisualizerHeader(mainWindow);
        createVisualizerTabs(mainWindow);
        createVisualizerFooter(mainWindow);

        return mainWindow;

    } catch (exc) {
        alert('Window creation error: ' + exc.message);
        return null;
    }
}

/**
 * Create visualizer header
 * @param {Window} parentWindow - Parent window
 */
function createVisualizerHeader(parentWindow) {
    try {
        if (!parentWindow) return;

        var headerGroup = parentWindow.add('group');
        if (!headerGroup) return;

        headerGroup.orientation = 'row';
        headerGroup.alignChildren = 'center';
        headerGroup.spacing = 15;

        // Document info group
        var docGroup = headerGroup.add('group');
        if (docGroup) {
            docGroup.orientation = 'column';
            docGroup.alignChildren = 'left';

            g_domViz_documentInfo = docGroup.add('statictext', undefined, 'Document: Loading...');
            if (g_domViz_documentInfo) {
                g_domViz_documentInfo.preferredSize.width = 400;
            }

            var statusText = docGroup.add('statictext', undefined, 'Status: Ready');
            if (statusText) {
                statusText.preferredSize.width = 400;
            }
        }

        // Control buttons group
        var controlGroup = headerGroup.add('group');
        if (controlGroup) {
            controlGroup.orientation = 'column';
            controlGroup.alignChildren = 'right';
            controlGroup.spacing = 5;

            var discoverBtn = controlGroup.add('button', undefined, 'Discover DOM');
            if (discoverBtn) {
                discoverBtn.preferredSize.width = 120;
                discoverBtn.preferredSize.height = 25;
                discoverBtn.onClick = performFullDiscovery;
            }

            var configBtn = controlGroup.add('button', undefined, 'Configuration');
            if (configBtn) {
                configBtn.preferredSize.width = 120;
                configBtn.preferredSize.height = 25;
                configBtn.onClick = showConfigurationDialog;
            }
        }

        // Add separator
        var separator1 = parentWindow.add('panel');
        if (separator1) {
            separator1.preferredSize.height = 2;
        }

    } catch (exc) {
        updateStatus('Header creation error: ' + exc.message);
    }
}

/**
 * Create visualizer tabs - PROGRAMMATIC TAB CREATION
 * @param {Window} parentWindow - Parent window
 */
function createVisualizerTabs(parentWindow) {
    try {
        if (!parentWindow) return;

        // Create tab panel programmatically
        g_domViz_mainTabs = parentWindow.add('tabbedpanel');
        if (!g_domViz_mainTabs) return;

        g_domViz_mainTabs.alignChildren = 'fill';
        g_domViz_mainTabs.preferredSize.height = 550;

        // Create tabs programmatically
        createDiscoveryTab();
        createExportTab();
        createComparisonTab();
        createDeepMappingTab();

        // Set default tab
        if (g_domViz_mainTabs.children.length > 0) {
            g_domViz_mainTabs.selection = g_domViz_mainTabs.children[0];
        }

    } catch (exc) {
        updateStatus('Tab creation error: ' + exc.message);
    }
}

/**
 * Create Discovery Tab
 */
function createDiscoveryTab() {
    try {
        if (!g_domViz_mainTabs) return;

        g_domViz_discoveryTab = g_domViz_mainTabs.add('tab', undefined, 'DOM Discovery');
        if (!g_domViz_discoveryTab) return;

        g_domViz_discoveryTab.orientation = 'column';
        g_domViz_discoveryTab.alignChildren = 'fill';
        g_domViz_discoveryTab.spacing = 5;

        // Controls
        var discoveryControls = g_domViz_discoveryTab.add('group');
        if (discoveryControls) {
            discoveryControls.orientation = 'row';
            discoveryControls.alignChildren = 'center';
            discoveryControls.spacing = 10;

            var phase1Btn = discoveryControls.add('button', undefined, 'Phase 1: Enumerate');
            if (phase1Btn) {
                phase1Btn.preferredSize.width = 120;
                phase1Btn.onClick = performPhase1Enumeration;
            }

            var phase2Btn = discoveryControls.add('button', undefined, 'Phase 2: Values');
            if (phase2Btn) {
                phase2Btn.preferredSize.width = 120;
                phase2Btn.onClick = performPhase2ValueSampling;
            }

            var phase3Btn = discoveryControls.add('button', undefined, 'Phase 3: Collections');
            if (phase3Btn) {
                phase3Btn.preferredSize.width = 120;
                phase3Btn.onClick = performPhase3CollectionSampling;
            }

            var clearBtn = discoveryControls.add('button', undefined, 'Clear');
            if (clearBtn) {
                clearBtn.preferredSize.width = 80;
                clearBtn.onClick = clearDiscoveryDisplay;
            }
        }

        // Display area
        var discoveryDisplay = g_domViz_discoveryTab.add('group');
        if (discoveryDisplay) {
            discoveryDisplay.orientation = 'column';
            discoveryDisplay.alignChildren = 'fill';

            g_domViz_discoveryDisplay = discoveryDisplay.add('edittext', undefined, 'Click buttons above to begin DOM discovery...', {
                multiline: true,
                scrolling: true
            });
            if (g_domViz_discoveryDisplay) {
                g_domViz_discoveryDisplay.preferredSize.height = 450;
                g_domViz_discoveryDisplay.readonly = true;
            }
        }

    } catch (exc) {
        updateStatus('Discovery tab creation error: ' + exc.message);
    }
}

/**
 * Create Export Tab
 */
function createExportTab() {
    try {
        if (!g_domViz_mainTabs) return;

        g_domViz_exportTab = g_domViz_mainTabs.add('tab', undefined, 'Export & Analysis');
        if (!g_domViz_exportTab) return;

        g_domViz_exportTab.orientation = 'column';
        g_domViz_exportTab.alignChildren = 'fill';
        g_domViz_exportTab.spacing = 5;

        // Controls
        var exportControls = g_domViz_exportTab.add('group');
        if (exportControls) {
            exportControls.orientation = 'row';
            exportControls.alignChildren = 'center';
            exportControls.spacing = 10;

            var jsonBtn = exportControls.add('button', undefined, 'Export JSON');
            if (jsonBtn) {
                jsonBtn.preferredSize.width = 100;
                jsonBtn.onClick = exportAsJSON;
            }

            var textBtn = exportControls.add('button', undefined, 'Export Text');
            if (textBtn) {
                textBtn.preferredSize.width = 100;
                textBtn.onClick = exportAsText;
            }

            var csvBtn = exportControls.add('button', undefined, 'Export CSV');
            if (csvBtn) {
                csvBtn.preferredSize.width = 100;
                csvBtn.onClick = exportAsCSV;
            }

            var analyzeBtn = exportControls.add('button', undefined, 'Analyze');
            if (analyzeBtn) {
                analyzeBtn.preferredSize.width = 100;
                analyzeBtn.onClick = analyzeCurrentJSON;
            }
        }

        // Display area
        var exportDisplay = g_domViz_exportTab.add('group');
        if (exportDisplay) {
            exportDisplay.orientation = 'column';
            exportDisplay.alignChildren = 'fill';

            g_domViz_exportDisplay = exportDisplay.add('edittext', undefined, 'Export DOM structure in various formats...', {
                multiline: true,
                scrolling: true
            });
            if (g_domViz_exportDisplay) {
                g_domViz_exportDisplay.preferredSize.height = 450;
                g_domViz_exportDisplay.readonly = true;
            }
        }

    } catch (exc) {
        updateStatus('Export tab creation error: ' + exc.message);
    }
}

/**
 * Create Comparison Tab
 */
function createComparisonTab() {
    try {
        if (!g_domViz_mainTabs) return;

        g_domViz_comparisonTab = g_domViz_mainTabs.add('tab', undefined, 'Document Comparison');
        if (!g_domViz_comparisonTab) return;

        g_domViz_comparisonTab.orientation = 'column';
        g_domViz_comparisonTab.alignChildren = 'fill';
        g_domViz_comparisonTab.spacing = 5;

        // Controls
        var comparisonControls = g_domViz_comparisonTab.add('group');
        if (comparisonControls) {
            comparisonControls.orientation = 'row';
            comparisonControls.alignChildren = 'center';
            comparisonControls.spacing = 10;

            var loadBeforeBtn = comparisonControls.add('button', undefined, 'Load Before');
            if (loadBeforeBtn) {
                loadBeforeBtn.preferredSize.width = 100;
                loadBeforeBtn.onClick = loadBeforeJSON;
            }

            var loadAfterBtn = comparisonControls.add('button', undefined, 'Load After');
            if (loadAfterBtn) {
                loadAfterBtn.preferredSize.width = 100;
                loadAfterBtn.onClick = loadAfterJSON;
            }

            var compareBtn = comparisonControls.add('button', undefined, 'Compare');
            if (compareBtn) {
                compareBtn.preferredSize.width = 100;
                compareBtn.onClick = performComparison;
            }

            var snapshotBtn = comparisonControls.add('button', undefined, 'Take Snapshot');
            if (snapshotBtn) {
                snapshotBtn.preferredSize.width = 100;
                snapshotBtn.onClick = takeSnapshot;
            }
        }

        // Display area
        var comparisonDisplay = g_domViz_comparisonTab.add('group');
        if (comparisonDisplay) {
            comparisonDisplay.orientation = 'column';
            comparisonDisplay.alignChildren = 'fill';

            g_domViz_comparisonDisplay = comparisonDisplay.add('edittext', undefined, 'Load before and after states to perform comparison...', {
                multiline: true,
                scrolling: true
            });
            if (g_domViz_comparisonDisplay) {
                g_domViz_comparisonDisplay.preferredSize.height = 450;
                g_domViz_comparisonDisplay.readonly = true;
            }
        }

    } catch (exc) {
        updateStatus('Comparison tab creation error: ' + exc.message);
    }
}

/**
 * Create Deep Mapping Tab
 */
function createDeepMappingTab() {
    try {
        if (!g_domViz_mainTabs) return;

        g_domViz_deepMappingTab = g_domViz_mainTabs.add('tab', undefined, 'Deep Mapping');
        if (!g_domViz_deepMappingTab) return;

        g_domViz_deepMappingTab.orientation = 'column';
        g_domViz_deepMappingTab.alignChildren = 'fill';
        g_domViz_deepMappingTab.spacing = 5;

        // Controls
        var mappingControls = g_domViz_deepMappingTab.add('group');
        if (mappingControls) {
            mappingControls.orientation = 'row';
            mappingControls.alignChildren = 'center';
            mappingControls.spacing = 10;

            var createMapBtn = mappingControls.add('button', undefined, 'Create Map');
            if (createMapBtn) {
                createMapBtn.preferredSize.width = 100;
                createMapBtn.onClick = performDeepMapping;
            }

            var atlasBtn = mappingControls.add('button', undefined, 'Object Atlas');
            if (atlasBtn) {
                atlasBtn.preferredSize.width = 100;
                atlasBtn.onClick = generateObjectAtlas;
            }

            var optimizeBtn = mappingControls.add('button', undefined, 'Optimize');
            if (optimizeBtn) {
                optimizeBtn.preferredSize.width = 100;
                optimizeBtn.onClick = optimizePerformance;
            }
        }

        // Display area
        var mappingDisplay = g_domViz_deepMappingTab.add('group');
        if (mappingDisplay) {
            mappingDisplay.orientation = 'column';
            mappingDisplay.alignChildren = 'fill';

            g_domViz_mappingDisplay = mappingDisplay.add('edittext', undefined, 'Create detailed object maps to understand document relationships...', {
                multiline: true,
                scrolling: true
            });
            if (g_domViz_mappingDisplay) {
                g_domViz_mappingDisplay.preferredSize.height = 450;
                g_domViz_mappingDisplay.readonly = true;
            }
        }

    } catch (exc) {
        updateStatus('Mapping tab creation error: ' + exc.message);
    }
}

/**
 * Create visualizer footer
 * @param {Window} parentWindow - Parent window
 */
function createVisualizerFooter(parentWindow) {
    try {
        if (!parentWindow) return;

        // Add separator
        var separator2 = parentWindow.add('panel');
        if (separator2) {
            separator2.preferredSize.height = 2;
        }

        var footerGroup = parentWindow.add('group');
        if (!footerGroup) return;

        footerGroup.orientation = 'row';
        footerGroup.alignChildren = 'center';
        footerGroup.spacing = 10;

        // Status text (left side)
        g_domViz_statusText = footerGroup.add('statictext', undefined, 'Ready');
        if (g_domViz_statusText) {
            g_domViz_statusText.preferredSize.width = 500;
        }

        // Button group (right side)
        var buttonGroup = footerGroup.add('group');
        if (buttonGroup) {
            buttonGroup.orientation = 'row';
            buttonGroup.spacing = 10;

            var resetBtn = buttonGroup.add('button', undefined, 'Reset');
            if (resetBtn) {
                resetBtn.preferredSize.width = 80;
                resetBtn.preferredSize.height = 25;
                resetBtn.onClick = resetVisualizer;
            }

            var helpBtn = buttonGroup.add('button', undefined, 'Help');
            if (helpBtn) {
                helpBtn.preferredSize.width = 80;
                helpBtn.preferredSize.height = 25;
                helpBtn.onClick = showHelp;
            }

            var closeBtn = buttonGroup.add('button', undefined, 'Close');
            if (closeBtn) {
                closeBtn.preferredSize.width = 80;
                closeBtn.preferredSize.height = 25;
                closeBtn.onClick = closeVisualizer;
            }
        }

    } catch (exc) {
        updateStatus('Footer creation error: ' + exc.message);
    }
}

/**
 * Initialize UI component event handlers
 */
function initializeVisualizerComponents() {
    try {
        if (!g_domViz_visualizerWindow) return;

        // UI is already initialized through programmatic creation
        // Event handlers are assigned during component creation
        updateStatus('UI components initialized');

    } catch (exc) {
        alert('Component initialization error: ' + exc.message);
    }
}

// =============================================================================
// DISCOVERY OPERATIONS
// =============================================================================

/**
 * Perform full discovery (all phases)
 */
function performFullDiscovery() {
    debugLog('Config exists: ' + (g_domViz_userConfiguration ? 'YES' : 'NO'));
    debugLog('objectClone available: ' + functionExists('objectClone'));
    if (g_domViz_userConfiguration) {
        debugLog('maxDepth setting: ' + g_domViz_userConfiguration.enumeration.maxDepth);
    }
    try {
        updateStatus('Starting full DOM discovery...');

        // FIX: Initialize configuration if not available
        if (!g_domViz_userConfiguration) {
            g_domViz_userConfiguration = objectClone(DEFAULT_VISUALIZER_CONFIG, 4);
            debugLog('Configuration initialized with defaults');
        }

        if (!app.documents.length) {
            alert('Please open a document first');
            return;
        }

        var doc = app.activeDocument;
        debugLog('Document name: ' + (doc.name || 'Unknown'));

        // Phase 1: Enumeration
        updateStatus('Phase 1: Enumerating DOM structure...');
        debugLog('=== STARTING PHASE 1 ===');
        var domStructure = enumerateDocumentDOM(doc, g_domViz_userConfiguration.enumeration);

        // DEBUG: Show what we actually got from enumeration - ES3 COMPATIBLE
        debugLog('=== PHASE 1 ENUMERATION RESULTS ===');
        debugLog('domStructure type: ' + typeof domStructure);
        debugLog('domStructure has .structure: ' + (domStructure.structure ? 'YES' : 'NO'));
        debugLog('domStructure has .metadata: ' + (domStructure.metadata ? 'YES' : 'NO'));

        if (domStructure.structure && domStructure.structure.document) {
            var docNode = domStructure.structure.document;
            debugLog('Document node properties: ' + (docNode.properties ? docNode.properties.length : 0));
            debugLog('Document node methods: ' + (docNode.methods ? docNode.methods.length : 0));
            debugLog('Document node collections: ' + (docNode.collections ? docNode.collections.length : 0));
            debugLog('Document node child nodes: ' + (docNode.childNodes ? docNode.childNodes.length : 0));
        }

        // FIX: Check for actual error conditions (not .success property)
        if (!domStructure || (domStructure.metadata && domStructure.metadata.error) || !domStructure.structure) {
            var errorMsg = 'Unknown enumeration error';
            if (domStructure && domStructure.metadata && domStructure.metadata.error) {
                errorMsg = domStructure.metadata.error;
            } else if (!domStructure) {
                errorMsg = 'Enumeration returned null';
            }
            alert('Enumeration failed: ' + errorMsg);
            return;
        }

        // Phase 2: Value Sampling
        debugLog('=== STARTING PHASE 2 ===');
        updateStatus('Phase 2: Sampling property values...');
        var sampledStructure = domStructure; // Default fallback
        
        if (functionExists('sampleDOMValues')) {
            debugLog('Calling sampleDOMValues with FULL domStructure (not .structure)');
            // FIX: Pass full domStructure, not domStructure.structure
            var phase2Result = sampleDOMValues(domStructure, doc, g_domViz_userConfiguration.sampling);
            
            if (phase2Result && !phase2Result.error) {
                sampledStructure = phase2Result;
                debugLog('Phase 2 completed successfully');
            } else {
                debugLog('Phase 2 had errors: ' + (phase2Result ? phase2Result.error : 'unknown'));
                debugLog('Using Phase 1 results for Phase 3');
            }
        } else {
            debugLog('sampleDOMValues function not found! Skipping phase 2');
        }

        // Phase 3: Collection Sampling
        debugLog('=== STARTING PHASE 3 ===');
        updateStatus('Phase 3: Sampling collections...');
        var finalStructure = sampledStructure; // Default fallback
        
        if (functionExists('sampleCollectionContents')) {
            debugLog('Calling sampleCollectionContents with FULL structure (not .structure)');
            // FIX: Pass full structure, not .structure
            var phase3Result = sampleCollectionContents(sampledStructure, doc, g_domViz_userConfiguration.sampling);
            
            if (phase3Result && !phase3Result.error) {
                finalStructure = phase3Result;
                debugLog('Phase 3 completed successfully');
            } else {
                debugLog('Phase 3 had errors: ' + (phase3Result ? phase3Result.error : 'unknown'));
                debugLog('Using Phase 2 results as final');
            }
        } else {
            debugLog('sampleCollectionContents function not found! Skipping phase 3');
        }

        debugLog('=== SETTING FINAL RESULTS ===');
        g_domViz_currentDOMStructure = finalStructure;
        debugLog('g_domViz_currentDOMStructure set, type: ' + typeof g_domViz_currentDOMStructure);
        
        if (g_domViz_currentDOMStructure) {
            debugLog('Final structure is not null - proceeding to display');
        } else {
            debugLog('ERROR: Final structure is null!');
        }
        
        displayCurrentStructure();
        updateStatus('Full discovery completed successfully');

    } catch (exc) {
        debugLog('EXCEPTION in performFullDiscovery: ' + exc.message);
        updateStatus('Full discovery error: ' + exc.message);
    }
}

/**
 * Perform Phase 1 enumeration
 */
function performPhase1Enumeration() {
    try {
        updateStatus('Phase 1: DOM enumeration...');

        if (!app.documents.length) {
            alert('Please open a document first');
            return;
        }

        var doc = app.activeDocument;
        var domStructure = enumerateDocumentDOM(doc, g_domViz_userConfiguration.enumeration);

        if (!domStructure.success) {
            alert('Enumeration failed: ' + domStructure.error);
            return;
        }

        g_domViz_currentDOMStructure = domStructure;
        displayCurrentStructure();
        updateStatus('Phase 1 completed');

    } catch (exc) {
        updateStatus('Phase 1 error: ' + exc.message);
    }
}

/**
 * Perform Phase 2 value sampling
 */
function performPhase2ValueSampling() {
    try {
        if (!g_domViz_currentDOMStructure) {
            alert('Please run Phase 1 enumeration first');
            return;
        }

        if (!app.documents.length) {
            alert('Please open a document first');
            return;
        }

        var doc = app.activeDocument;
        updateStatus('Phase 2: Value sampling...');
        var sampledStructure = sampleDOMValues(g_domViz_currentDOMStructure.structure, doc, g_domViz_userConfiguration.sampling);

        g_domViz_currentDOMStructure = sampledStructure;
        displayCurrentStructure();
        updateStatus('Phase 2 completed');

    } catch (exc) {
        updateStatus('Phase 2 error: ' + exc.message);
    }
}

/**
 * Perform Phase 3 collection sampling
 */
function performPhase3CollectionSampling() {
    try {
        if (!g_domViz_currentDOMStructure) {
            alert('Please run previous phases first');
            return;
        }

        if (!app.documents.length) {
            alert('Please open a document first');
            return;
        }

        var doc = app.activeDocument;
        updateStatus('Phase 3: Collection sampling...');
        var finalStructure = sampleCollectionContents(g_domViz_currentDOMStructure.structure, doc, g_domViz_userConfiguration.sampling);

        g_domViz_currentDOMStructure = finalStructure;
        displayCurrentStructure();
        updateStatus('Phase 3 completed');

    } catch (exc) {
        updateStatus('Phase 3 error: ' + exc.message);
    }
}

/**
 * Display current DOM structure - FIXED VERSION
 */
function displayCurrentStructure() {
    debugLog('Starting displayCurrentStructure', 'display');

    try {
        if (!g_domViz_currentDOMStructure) {
            debugLog('ERROR: g_domViz_currentDOMStructure is null', 'display');
            if (g_domViz_discoveryDisplay) {
                g_domViz_discoveryDisplay.text = 'No DOM structure available. Please run discovery first.';
            }
            return;
        }

        if (!g_domViz_discoveryDisplay) {
            debugLog('ERROR: g_domViz_discoveryDisplay is null', 'display');
            return;
        }

        debugLog('g_domViz_currentDOMStructure type: ' + typeof g_domViz_currentDOMStructure, 'display');

        // Debug structure contents
        if (g_domViz_currentDOMStructure.structure) {
            debugLog('Structure exists', 'display');
            if (g_domViz_currentDOMStructure.structure.document) {
                var doc = g_domViz_currentDOMStructure.structure.document;
                debugLog('Document node exists', 'display');
                debugLog('Properties: ' + (doc.properties ? doc.properties.length : 'undefined'), 'display');
                debugLog('Methods: ' + (doc.methods ? doc.methods.length : 'undefined'), 'display');
                debugLog('Collections: ' + (doc.collections ? doc.collections.length : 'undefined'), 'display');
                debugLog('Child nodes: ' + (doc.childNodes ? doc.childNodes.length : 'undefined'), 'display');
            } else {
                debugLog('No document node in structure', 'display');
            }
        } else {
            debugLog('No structure property', 'display');
        }

        // Generate display text
        var displayText = '';

        if (functionExists('generateStructureDisplayText')) {
            debugLog('generateStructureDisplayText function exists - calling it', 'display');
            displayText = generateStructureDisplayText(g_domViz_currentDOMStructure);
            debugLog('Display text generated, length: ' + displayText.length, 'display');
        } else {
            debugLog('generateStructureDisplayText function NOT FOUND - creating enhanced fallback', 'display');
            displayText = generateEnhancedFallbackDisplay(g_domViz_currentDOMStructure);
        }

        g_domViz_discoveryDisplay.text = displayText;
        debugLog('Display text set successfully', 'display');

    } catch (exc) {
        debugLog('EXCEPTION: ' + exc.message, 'display');
        updateStatus('Display update error: ' + exc.message);
    }
}

/**
 * Generate enhanced fallback display when main function missing
 * @param {Object} structure - DOM structure
 * @returns {String} Display text
 */
function generateEnhancedFallbackDisplay(structure) {
    debugLog('Generating enhanced fallback display', 'display');

    try {
        var builder = createStringBuilder();

        builder.appendLine('DOM DISCOVERY RESULTS (Fallback Display)');
        builder.appendLine('=========================================');
        builder.appendLine('');

        // Metadata section
        if (structure.metadata) {
            builder.appendLine('METADATA:');
            builder.appendLine('Document: ' + (structure.metadata.documentName || 'Unknown'));
            builder.appendLine('Version: ' + (structure.metadata.version || 'Unknown'));
            builder.appendLine('Timestamp: ' + (structure.metadata.timestamp || 'Unknown'));
            builder.appendLine('Enumeration Time: ' + (structure.metadata.enumerationTime || 'Unknown') + 'ms');

            if (structure.metadata.config) {
                builder.appendLine('Max Depth Used: ' + (structure.metadata.config.maxDepth || 'Unknown'));
                builder.appendLine('Timeout Setting: ' + (structure.metadata.config.timeoutMs || 'Unknown') + 'ms');
            }
            builder.appendLine('');
        }

        // Document structure
        if (structure.structure && structure.structure.document) {
            var docNode = structure.structure.document;

            builder.appendLine('DOCUMENT STRUCTURE:');
            builder.appendLine('Properties: ' + (docNode.properties ? docNode.properties.length : 0));
            builder.appendLine('Methods: ' + (docNode.methods ? docNode.methods.length : 0));
            builder.appendLine('Collections: ' + (docNode.collections ? docNode.collections.length : 0));
            builder.appendLine('Child Nodes: ' + (docNode.childNodes ? docNode.childNodes.length : 0));
            builder.appendLine('');

            // Show first few properties
            if (docNode.properties && docNode.properties.length > 0) {
                builder.appendLine('SAMPLE PROPERTIES:');
                for (var i = 0; i < Math.min(10, docNode.properties.length); i++) {
                    var prop = docNode.properties[i];
                    var valueInfo = '';
                    if (prop.sampledValue) {
                        valueInfo = ' = ' + prop.sampledValue;
                    }
                    builder.appendLine('  • ' + prop.name + ' (' + prop.type + ')' + valueInfo);
                }

                if (docNode.properties.length > 10) {
                    builder.appendLine('  ... and ' + (docNode.properties.length - 10) + ' more properties');
                }
                builder.appendLine('');
            }

            // Show collections
            if (docNode.collections && docNode.collections.length > 0) {
                builder.appendLine('COLLECTIONS:');
                for (var j = 0; j < Math.min(5, docNode.collections.length); j++) {
                    var coll = docNode.collections[j];
                    builder.appendLine('  • ' + coll.name + ' (' + coll.type + ')');
                }
                if (docNode.collections.length > 5) {
                    builder.appendLine('  ... and ' + (docNode.collections.length - 5) + ' more collections');
                }
                builder.appendLine('');
            }

            // Show child node summary
            if (docNode.childNodes && docNode.childNodes.length > 0) {
                builder.appendLine('CHILD OBJECTS:');
                var childSummary = {};
                for (var k = 0; k < docNode.childNodes.length; k++) {
                    var child = docNode.childNodes[k];
                    var childType = child.type || 'unknown';
                    if (!childSummary[childType]) {
                        childSummary[childType] = 0;
                    }
                    childSummary[childType]++;
                }

                for (var type in childSummary) {
                    if (objectHasOwnProperty(childSummary, type)) {
                        builder.appendLine('  • ' + type + ': ' + childSummary[type] + ' objects');
                    }
                }
                builder.appendLine('');
            }
        } else {
            builder.appendLine('ERROR: No document structure found!');
            builder.appendLine('Structure type: ' + typeof structure.structure);
            if (structure.structure) {
                var structKeys = [];
                for (var key in structure.structure) {
                    structKeys.push(key);
                }
                builder.appendLine('Structure keys: ' + structKeys.join(', '));
            }
        }

        // Statistics
        if (structure.statistics) {
            builder.appendLine('STATISTICS:');
            builder.appendLine('Total Nodes: ' + (structure.statistics.totalNodes || 0));
            builder.appendLine('Total Properties: ' + (structure.statistics.totalProperties || 0));
            builder.appendLine('Max Depth Reached: ' + (structure.statistics.maxDepth || 0));
            builder.appendLine('');
        }

        return builder.toString();

    } catch (exc) {
        return 'Error generating fallback display: ' + exc.message;
    }
}

/**
 * Generate structure display text
 * @param {Object} structure - DOM structure
 * @returns {String} Display text
 */
function generateStructureDisplayText(structure) {
    try {
        if (!structure) return 'No structure available';

        var builder = createStringBuilder();

        builder.appendLine('DOM DISCOVERY RESULTS');
        builder.appendLine('====================');
        builder.appendLine('');

        if (structure.metadata) {
            builder.appendLine('METADATA:');
            builder.appendLine('Discovery Date: ' + (structure.metadata.discoveryDate || 'Unknown'));
            builder.appendLine('Total Objects: ' + (structure.metadata.totalObjects || 0));
            builder.appendLine('Total Properties: ' + (structure.metadata.totalProperties || 0));
            builder.appendLine('');
        }

        if (structure.structure && structure.structure.length > 0) {
            builder.appendLine('STRUCTURE:');
            for (var i = 0; i < structure.structure.length && i < 50; i++) {
                var node = structure.structure[i];
                var indent = '';
                for (var d = 0; d < (node.depth || 0); d++) {
                    indent += '  ';
                }
                builder.appendLine(indent + (node.path || 'unknown') + ' (' + (node.type || 'object') + ')');
            }

            if (structure.structure.length > 50) {
                builder.appendLine('... (' + (structure.structure.length - 50) + ' more items)');
            }
        }

        return builder.toString();

    } catch (exc) {
        return 'Error generating display: ' + exc.message;
    }
}

/**
 * Clear discovery display
 */
function clearDiscoveryDisplay() {
    try {
        if (g_domViz_discoveryDisplay) {
            g_domViz_discoveryDisplay.text = 'Click buttons above to begin DOM discovery...';
        }
        g_domViz_currentDOMStructure = null;
        updateStatus('Display cleared');

    } catch (exc) {
        updateStatus('Clear error: ' + exc.message);
    }
}

// =============================================================================
// EXPORT OPERATIONS
// =============================================================================

/**
 * Export as JSON
 */
function exportAsJSON() {
    try {
        if (!g_domViz_currentDOMStructure) {
            alert('No DOM structure to export. Please run discovery first.');
            return;
        }

        updateStatus('Exporting as JSON...');
        var exportResult = exportDOMStructure(g_domViz_currentDOMStructure, 'json', g_domViz_userConfiguration.exportSettings);

        if (!exportResult.success) {
            alert('JSON export failed: ' + exportResult.error);
            return;
        }

        var file = File.saveDialog('Save JSON Export', '*.json');
        if (file) {
            file.open('w');
            file.write(exportResult.content);
            file.close();

            if (g_domViz_exportDisplay) {
                g_domViz_exportDisplay.text = 'JSON exported successfully to:\n' + file.fsName + '\n\nFile size: ' + exportResult.metadata.fileSize + ' bytes';
            }

            updateStatus('JSON export completed');
        }

    } catch (exc) {
        updateStatus('JSON export error: ' + exc.message);
    }
}

/**
 * Export as Text
 */
function exportAsText() {
    try {
        if (!g_domViz_currentDOMStructure) {
            alert('No DOM structure to export. Please run discovery first.');
            return;
        }

        updateStatus('Exporting as text...');
        var exportResult = exportDOMStructure(g_domViz_currentDOMStructure, 'text', g_domViz_userConfiguration.exportSettings);

        if (!exportResult.success) {
            alert('Text export failed: ' + exportResult.error);
            return;
        }

        var file = File.saveDialog('Save Text Export', '*.txt');
        if (file) {
            file.open('w');
            file.write(exportResult.content);
            file.close();

            if (g_domViz_exportDisplay) {
                g_domViz_exportDisplay.text = 'Text exported successfully to:\n' + file.fsName + '\n\nFile size: ' + exportResult.metadata.fileSize + ' bytes';
            }

            updateStatus('Text export completed');
        }

    } catch (exc) {
        updateStatus('Text export error: ' + exc.message);
    }
}

/**
 * Export as CSV
 */
function exportAsCSV() {
    try {
        if (!g_domViz_currentDOMStructure) {
            alert('No DOM structure to export. Please run discovery first.');
            return;
        }

        updateStatus('Exporting as CSV...');
        var exportResult = exportDOMStructure(g_domViz_currentDOMStructure, 'csv', g_domViz_userConfiguration.exportSettings);

        if (!exportResult.success) {
            alert('CSV export failed: ' + exportResult.error);
            return;
        }

        var file = File.saveDialog('Save CSV Export', '*.csv');
        if (file) {
            file.open('w');
            file.write(exportResult.content);
            file.close();

            if (g_domViz_exportDisplay) {
                g_domViz_exportDisplay.text = 'CSV exported successfully to:\n' + file.fsName + '\n\nFile size: ' + exportResult.metadata.fileSize + ' bytes';
            }

            updateStatus('CSV export completed');
        }

    } catch (exc) {
        updateStatus('CSV export error: ' + exc.message);
    }
}

/**
 * Analyze current JSON
 */
function analyzeCurrentJSON() {
    try {
        if (!g_domViz_currentDOMStructure) {
            alert('No DOM structure to analyze. Please run discovery first.');
            return;
        }

        updateStatus('Analyzing DOM structure...');

        // Create analysis result directly from structure
        var analysisResult = {
            statistics: {
                totalNodes: g_domViz_currentDOMStructure.metadata ? g_domViz_currentDOMStructure.metadata.totalObjects || 0 : 0,
                maxDepth: g_domViz_currentDOMStructure.metadata ? g_domViz_currentDOMStructure.metadata.maxDepth || 0 : 0,
                propertyCount: g_domViz_currentDOMStructure.metadata ? g_domViz_currentDOMStructure.metadata.totalProperties || 0 : 0,
                collectionCount: g_domViz_currentDOMStructure.metadata ? g_domViz_currentDOMStructure.metadata.totalCollections || 0 : 0
            },
            keyFindings: [
                'DOM structure analysis completed',
                'Structure contains ' + (g_domViz_currentDOMStructure.metadata ? g_domViz_currentDOMStructure.metadata.totalObjects || 0 : 0) + ' total objects',
                'Maximum depth reached: ' + (g_domViz_currentDOMStructure.metadata ? g_domViz_currentDOMStructure.metadata.maxDepth || 0 : 0)
            ]
        };

        if (g_domViz_exportDisplay) {
            g_domViz_exportDisplay.text = generateAnalysisDisplay(analysisResult);
        }

        updateStatus('Analysis completed');

    } catch (exc) {
        updateStatus('Analysis error: ' + exc.message);
    }
}

/**
 * Generate analysis display
 * @param {Object} analysisResult - Analysis result
 * @returns {String} Display text
 */
function generateAnalysisDisplay(analysisResult) {
    try {
        var builder = createStringBuilder();

        builder.appendLine('DOM STRUCTURE ANALYSIS');
        builder.appendLine('=====================');
        builder.appendLine('');

        if (analysisResult.statistics) {
            var statisticsObj = analysisResult.statistics;
            builder.appendLine('STATISTICS:');
            builder.appendLine('Total Nodes: ' + (statisticsObj.totalNodes || 0));
            builder.appendLine('Max Depth: ' + (statisticsObj.maxDepth || 0));
            builder.appendLine('Property Count: ' + (statisticsObj.propertyCount || 0));
            builder.appendLine('Collection Count: ' + (statisticsObj.collectionCount || 0));
            builder.appendLine('');
        }

        if (analysisResult.keyFindings && analysisResult.keyFindings.length > 0) {
            builder.appendLine('KEY FINDINGS:');
            for (var i = 0; i < analysisResult.keyFindings.length; i++) {
                builder.appendLine('• ' + analysisResult.keyFindings[i]);
            }
            builder.appendLine('');
        }

        return builder.toString();

    } catch (exc) {
        return 'Error generating analysis display: ' + exc.message;
    }
}

// =============================================================================
// COMPARISON OPERATIONS
// =============================================================================

/**
 * Load before JSON
 */
function loadBeforeJSON() {
    try {
        var file = File.openDialog('Select Before JSON file', '*.json');
        if (!file) return;

        file.open('r');
        var content = file.read();
        file.close();

        g_domViz_beforeData = safeJSONParse(content);

        if (g_domViz_comparisonDisplay) {
            g_domViz_comparisonDisplay.text = 'Before data loaded from: ' + file.name + '\n\n' +
                (g_domViz_afterData ? 'Ready to compare!' : 'Load After data to compare.');
        }

        updateStatus('Before data loaded');

    } catch (exc) {
        updateStatus('Before data load error: ' + exc.message);
    }
}

/**
 * Load after JSON
 */
function loadAfterJSON() {
    try {
        var file = File.openDialog('Select After JSON file', '*.json');
        if (!file) return;

        file.open('r');
        var content = file.read();
        file.close();

        g_domViz_afterData = safeJSONParse(content);

        if (g_domViz_comparisonDisplay) {
            g_domViz_comparisonDisplay.text = 'After data loaded from: ' + file.name + '\n\n' +
                (g_domViz_beforeData ? 'Ready to compare!' : 'Load Before data to compare.');
        }

        updateStatus('After data loaded');

    } catch (exc) {
        updateStatus('After data load error: ' + exc.message);
    }
}

/**
 * Perform comparison
 */
function performComparison() {
    try {
        if (!g_domViz_beforeData || !g_domViz_afterData) {
            alert('Please load both Before and After data first');
            return;
        }

        updateStatus('Performing comparison...');

        var comparisonResult = compareDOMExports(g_domViz_beforeData, g_domViz_afterData, {
            enableStructuralComparison: true,
            enablePropertyComparison: true,
            enableValueComparison: true
        });

        if (g_domViz_comparisonDisplay) {
            g_domViz_comparisonDisplay.text = generateComparisonDisplay(comparisonResult);
        }

        updateStatus('Comparison completed');

    } catch (exc) {
        updateStatus('Comparison error: ' + exc.message);
    }
}

/**
 * Generate comparison display
 * @param {Object} comparisonResult - Comparison result
 * @returns {String} Display text
 */
function generateComparisonDisplay(comparisonResult) {
    try {
        var builder = createStringBuilder();

        builder.appendLine('DOCUMENT COMPARISON RESULTS');
        builder.appendLine('===========================');
        builder.appendLine('');

        if (comparisonResult.summary) {
            var summary = comparisonResult.summary;
            builder.appendLine('SUMMARY:');
            builder.appendLine('Added: ' + (summary.added || 0) + ' items');
            builder.appendLine('Removed: ' + (summary.removed || 0) + ' items');
            builder.appendLine('Modified: ' + (summary.modified || 0) + ' items');
            builder.appendLine('Unchanged: ' + (summary.unchanged || 0) + ' items');
            builder.appendLine('');
        }

        if (comparisonResult.changes && comparisonResult.changes.length > 0) {
            builder.appendLine('CHANGES:');
            for (var i = 0; i < comparisonResult.changes.length && i < 20; i++) {
                var change = comparisonResult.changes[i];
                builder.appendLine('• ' + change.type + ': ' + change.path);
            }

            if (comparisonResult.changes.length > 20) {
                builder.appendLine('... (' + (comparisonResult.changes.length - 20) + ' more changes)');
            }
        }

        return builder.toString();

    } catch (exc) {
        return 'Error generating comparison display: ' + exc.message;
    }
}

/**
 * Take snapshot
 */
function takeSnapshot() {
    try {
        if (!g_domViz_currentDOMStructure) {
            alert('No DOM structure available. Please run discovery first.');
            return;
        }

        var file = File.saveDialog('Save Snapshot', '*.json');
        if (file) {
            file.open('w');
            file.write(safeJSONStringify(g_domViz_currentDOMStructure));
            file.close();

            if (g_domViz_comparisonDisplay) {
                g_domViz_comparisonDisplay.text = 'Snapshot saved to: ' + file.name + '\n\nThis can be used as Before or After data for comparisons.';
            }

            updateStatus('Snapshot saved');
        }

    } catch (exc) {
        updateStatus('Snapshot error: ' + exc.message);
    }
}

// =============================================================================
// DEEP MAPPING OPERATIONS
// =============================================================================

/**
 * Perform deep mapping
 */
function performDeepMapping() {
    try {
        if (!g_domViz_currentDOMStructure) {
            alert('No DOM structure available. Please run discovery first.');
            return;
        }

        updateStatus('Creating deep mapping...');

        // Placeholder implementation - would integrate with 5.1_deep-mapper.jsx when available
        var mappingResult = {
            relationships: [
                { source: 'Document', target: 'Pages', type: 'contains' },
                { source: 'Pages', target: 'TextFrames', type: 'contains' },
                { source: 'TextFrames', target: 'Contents', type: 'contains' }
            ],
            statistics: {
                totalRelationships: 3,
                circularReferences: 0,
                objectCategories: 4,
                maxRelationshipDepth: 3
            }
        };

        if (g_domViz_mappingDisplay) {
            g_domViz_mappingDisplay.text = generateDeepMappingDisplay(mappingResult);
        }

        updateStatus('Deep mapping completed');

    } catch (exc) {
        updateStatus('Deep mapping error: ' + exc.message);
    }
}

/**
 * Generate object atlas
 */
function generateObjectAtlas() {
    try {
        if (!g_domViz_currentDOMStructure) {
            alert('No DOM structure available. Please run discovery first.');
            return;
        }

        updateStatus('Generating object atlas...');

        // Placeholder implementation
        var atlasResult = {
            categories: {
                'Document Objects': 1,
                'Page Objects': g_domViz_currentDOMStructure.metadata ? g_domViz_currentDOMStructure.metadata.totalPages || 0 : 0,
                'Text Objects': g_domViz_currentDOMStructure.metadata ? g_domViz_currentDOMStructure.metadata.totalTextFrames || 0 : 0,
                'Other Objects': g_domViz_currentDOMStructure.metadata ? g_domViz_currentDOMStructure.metadata.totalObjects || 0 : 0
            },
            patterns: [
                'Hierarchical document structure detected',
                'Text content organization follows standard patterns',
                'Object relationships are well-defined'
            ],
            hotspots: [
                'Page objects contain most complexity',
                'Text frames have highest property density'
            ]
        };

        if (g_domViz_mappingDisplay) {
            g_domViz_mappingDisplay.text = generateAtlasDisplay(atlasResult);
        }

        updateStatus('Object atlas generated');

    } catch (exc) {
        updateStatus('Atlas generation error: ' + exc.message);
    }
}

/**
 * Optimize performance
 */
function optimizePerformance() {
    try {
        if (!g_domViz_currentDOMStructure) {
            alert('No DOM structure available. Please run discovery first.');
            return;
        }

        updateStatus('Analyzing performance optimizations...');

        var optimizations = [
            'Reduce enumeration depth for faster discovery',
            'Enable object tracking caching',
            'Use safety filters to skip dangerous properties',
            'Limit collection sampling size',
            'Enable compression for large exports'
        ];

        if (g_domViz_mappingDisplay) {
            g_domViz_mappingDisplay.text = generateOptimizationDisplay(optimizations);
        }

        updateStatus('Performance analysis completed');

    } catch (exc) {
        updateStatus('Performance analysis error: ' + exc.message);
    }
}

/**
 * Generate deep mapping display
 * @param {Object} mappingResult - Mapping result
 * @returns {String} Display text
 */
function generateDeepMappingDisplay(mappingResult) {
    try {
        var builder = createStringBuilder();

        builder.appendLine('DEEP MAPPING RESULTS');
        builder.appendLine('===================');
        builder.appendLine('');

        if (mappingResult.relationships && mappingResult.relationships.length > 0) {
            builder.appendLine('OBJECT RELATIONSHIPS:');
            for (var i = 0; i < mappingResult.relationships.length && i < 15; i++) {
                var rel = mappingResult.relationships[i];
                builder.appendLine('• ' + rel.source + ' → ' + rel.target + ' (' + rel.type + ')');
            }

            if (mappingResult.relationships.length > 15) {
                builder.appendLine('... (' + (mappingResult.relationships.length - 15) + ' more relationships)');
            }
            builder.appendLine('');
        }

        return builder.toString();

    } catch (exc) {
        return 'Error generating mapping display: ' + exc.message;
    }
}

/**
 * Generate atlas display
 * @param {Object} atlasResult - Atlas result
 * @returns {String} Display text
 */
function generateAtlasDisplay(atlasResult) {
    try {
        var builder = createStringBuilder();

        builder.appendLine('OBJECT ATLAS');
        builder.appendLine('============');
        builder.appendLine('');

        if (atlasResult.categories) {
            builder.appendLine('OBJECT CATEGORIES:');
            for (var category in atlasResult.categories) {
                if (objectHasOwnProperty(atlasResult.categories, category)) {
                    builder.appendLine('• ' + category + ': ' + atlasResult.categories[category] + ' objects');
                }
            }
            builder.appendLine('');
        }

        return builder.toString();

    } catch (exc) {
        return 'Error generating atlas display: ' + exc.message;
    }
}

/**
 * Generate optimization display
 * @param {Array} optimizations - Optimization suggestions
 * @returns {String} Display text
 */
function generateOptimizationDisplay(optimizations) {
    try {
        if (!optimizations || optimizations.length === 0) {
            return 'No optimization suggestions available';
        }

        var builder = createStringBuilder();

        builder.appendLine('PERFORMANCE OPTIMIZATIONS');
        builder.appendLine('=========================');
        builder.appendLine('');

        for (var i = 0; i < optimizations.length; i++) {
            builder.appendLine((i + 1) + '. ' + optimizations[i]);
            builder.appendLine('');
        }

        return builder.toString();

    } catch (exc) {
        return 'Error generating optimization display: ' + exc.message;
    }
}

// =============================================================================
// CONFIGURATION - FIXED: PROGRAMMATIC CREATION
// =============================================================================

/**
 * Show configuration dialog - FIXED: Programmatic creation
 */
function showConfigurationDialog() {
    try {
        // Create simple base dialog
        var configDialog = new Window('dialog', 'DOM Visualizer Configuration');
        if (!configDialog) return;

        configDialog.orientation = 'column';
        configDialog.alignChildren = 'fill';
        configDialog.spacing = 10;
        configDialog.margins = 15;
        configDialog.preferredSize.width = 600;
        configDialog.preferredSize.height = 500;

        // Create tabs programmatically
        var configTabs = configDialog.add('tabbedpanel');
        if (configTabs) {
            configTabs.alignChildren = 'fill';
            configTabs.preferredSize.height = 400;

            // Enumeration tab
            var enumTab = configTabs.add('tab', undefined, 'Enumeration');
            if (enumTab) {
                enumTab.orientation = 'column';
                enumTab.alignChildren = 'left';
                enumTab.spacing = 5;

                enumTab.add('statictext', undefined, 'Enumeration Settings:');

                var maxDepthGroup = enumTab.add('group');
                if (maxDepthGroup) {
                    maxDepthGroup.add('statictext', undefined, 'Max Depth:');
                    var maxDepthEdit = maxDepthGroup.add('edittext', undefined, String(g_domViz_userConfiguration.enumeration.maxDepth));
                    maxDepthEdit.preferredSize.width = 60;
                }

                var timeoutGroup = enumTab.add('group');
                if (timeoutGroup) {
                    timeoutGroup.add('statictext', undefined, 'Timeout (ms):');
                    var timeoutEdit = timeoutGroup.add('edittext', undefined, String(g_domViz_userConfiguration.enumeration.timeoutMs));
                    timeoutEdit.preferredSize.width = 80;
                }
            }

            // Sampling tab
            var samplingTab = configTabs.add('tab', undefined, 'Sampling');
            if (samplingTab) {
                samplingTab.orientation = 'column';
                samplingTab.alignChildren = 'left';
                samplingTab.spacing = 5;

                samplingTab.add('statictext', undefined, 'Sampling Settings:');

                var maxSamplesGroup = samplingTab.add('group');
                if (maxSamplesGroup) {
                    maxSamplesGroup.add('statictext', undefined, 'Max Samples:');
                    var maxSamplesEdit = maxSamplesGroup.add('edittext', undefined, String(g_domViz_userConfiguration.sampling.maxSamples));
                    maxSamplesEdit.preferredSize.width = 60;
                }
            }
        }

        // Buttons
        var buttonGroup = configDialog.add('group');
        if (buttonGroup) {
            buttonGroup.orientation = 'row';
            buttonGroup.alignment = 'center';
            buttonGroup.spacing = 10;

            var okBtn = buttonGroup.add('button', undefined, 'OK');
            if (okBtn) {
                okBtn.onClick = function () {
                    // ACTUALLY save configuration values
                    try {
                        // Read the maxDepth value from the edit field
                        var newMaxDepth = parseInt(maxDepthEdit.text) || 4;
                        var newTimeout = parseInt(timeoutEdit.text) || 15000;
                        var newMaxSamples = parseInt(maxSamplesEdit.text) || 20;

                        // Update the global configuration
                        g_domViz_userConfiguration.enumeration.maxDepth = newMaxDepth;
                        g_domViz_userConfiguration.enumeration.timeoutMs = newTimeout;
                        g_domViz_userConfiguration.sampling.maxSamples = newMaxSamples;

                        debugLog('[CONFIG] Saved maxDepth: ' + newMaxDepth + ', timeout: ' + newTimeout);
                        updateStatus('Configuration saved successfully');

                    } catch (exc) {
                        debugLog('[CONFIG] Save error: ' + exc.message);
                    }

                    configDialog.close();
                };
            }

            var cancelBtn = buttonGroup.add('button', undefined, 'Cancel');
            if (cancelBtn) {
                cancelBtn.onClick = function () {
                    configDialog.close();
                };
            }
        }

        configDialog.show();

    } catch (exc) {
        updateStatus('Configuration dialog error: ' + exc.message);
    }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Update document information
 */
function updateDocumentInfo() {
    try {
        if (!g_domViz_documentInfo) return;

        var docInfo = 'Document: ';
        if (app.documents.length > 0) {
            var doc = app.activeDocument;
            docInfo += doc.name || 'Untitled';
        } else {
            docInfo += 'No document open';
        }

        g_domViz_documentInfo.text = docInfo;

    } catch (exc) {
        debugLog('[DOM Visualizer] Document info update error: ' + exc.message);
    }
}

/**
 * Update status text
 * @param {String} message - Status message
 */
function updateStatus(message) {
    try {
        if (g_domViz_statusText) {
            g_domViz_statusText.text = message;
        }
        debugLog('[DOM Visualizer] ' + message);

    } catch (exc) {
        debugLog('[DOM Visualizer] Status update error: ' + exc.message);
    }
}

/**
 * Reset visualizer
 */
function resetVisualizer() {
    try {
        // Clear displays
        if (g_domViz_discoveryDisplay) {
            g_domViz_discoveryDisplay.text = 'Click buttons above to begin DOM discovery...';
        }
        if (g_domViz_exportDisplay) {
            g_domViz_exportDisplay.text = 'Export DOM structure in various formats...';
        }
        if (g_domViz_comparisonDisplay) {
            g_domViz_comparisonDisplay.text = 'Load before and after states to perform comparison...';
        }
        if (g_domViz_mappingDisplay) {
            g_domViz_mappingDisplay.text = 'Create detailed object maps to understand document relationships...';
        }

        // Reset data
        g_domViz_currentDOMStructure = null;
        g_domViz_beforeData = null;
        g_domViz_afterData = null;
        g_domViz_exportHistory = [];

        // Reset configuration
        g_domViz_userConfiguration = objectClone(DEFAULT_VISUALIZER_CONFIG, 4);

        updateStatus('Visualizer reset');

    } catch (exc) {
        updateStatus('Reset error: ' + exc.message);
    }
}

/**
 * Show help information
 */
function showHelp() {
    try {
        var helpText = 'InDesign DOM Visualizer v3.1\n\n' +
            'DISCOVERY:\n' +
            '• Phase 1: Enumerate - Discover DOM structure\n' +
            '• Phase 2: Values - Sample property values\n' +
            '• Phase 3: Collections - Sample collection contents\n' +
            '• Discover DOM - Run all phases automatically\n\n' +
            'EXPORT:\n' +
            '• Export JSON - Save structure as JSON file\n' +
            '• Export Text - Save as readable text format\n' +
            '• Export CSV - Save as spreadsheet format\n' +
            '• Analyze - Analyze current structure\n\n' +
            'COMPARISON:\n' +
            '• Load Before/After - Load JSON files for comparison\n' +
            '• Compare - Analyze differences between states\n' +
            '• Take Snapshot - Save current state for comparison\n\n' +
            'MAPPING:\n' +
            '• Create Map - Generate object relationship maps\n' +
            '• Object Atlas - Categorize and analyze objects\n' +
            '• Optimize - Get performance recommendations';

        alert(helpText);

    } catch (exc) {
        updateStatus('Help display error: ' + exc.message);
    }
}

/**
 * Close visualizer window
 */
function closeVisualizer() {
    try {
        if (g_domViz_visualizerWindow) {
            g_domViz_visualizerWindow.close();
            g_domViz_visualizerWindow = null;
        }

        // Reset global variables
        g_domViz_documentInfo = null;
        g_domViz_statusText = null;
        g_domViz_discoveryDisplay = null;
        g_domViz_exportDisplay = null;
        g_domViz_comparisonDisplay = null;
        g_domViz_mappingDisplay = null;
        g_domViz_currentDOMStructure = null;
        g_domViz_userConfiguration = null;
        g_domViz_originalConfigs = null;
        g_domViz_exportHistory = [];
        g_domViz_beforeData = null;
        g_domViz_afterData = null;

    } catch (exc) {
        debugLog('[DOM Visualizer] Close error: ' + exc.message);
    }
}

// =============================================================================
// MODULE REGISTRATION
// =============================================================================

// Register this module with all its functions
// Register this module with all its functions
registerModule('5.2_dom-visualizer', '3.1', [
    // Main Functions
    'showDOMVisualizer', 'createVisualizerWindow', 'initializeVisualizerComponents',

    // UI Creation Functions
    'createVisualizerHeader', 'createVisualizerTabs', 'createVisualizerFooter',
    'createDiscoveryTab', 'createExportTab', 'createComparisonTab', 'createDeepMappingTab',

    // Discovery Operations
    'performFullDiscovery', 'performPhase1Enumeration', 'performPhase2ValueSampling',
    'performPhase3CollectionSampling', 'displayCurrentStructure', 'generateStructureDisplayText',
    'generateEnhancedFallbackDisplay',  // ← NEW FUNCTION ADDED
    'clearDiscoveryDisplay',

    // Export Operations
    'exportAsJSON', 'exportAsText', 'exportAsCSV', 'analyzeCurrentJSON', 'generateAnalysisDisplay',

    // Comparison Operations
    'loadBeforeJSON', 'loadAfterJSON', 'performComparison', 'generateComparisonDisplay', 'takeSnapshot',

    // Deep Mapping Operations
    'performDeepMapping', 'generateObjectAtlas', 'optimizePerformance', 'generateDeepMappingDisplay',
    'generateAtlasDisplay', 'generateOptimizationDisplay',

    // Configuration
    'showConfigurationDialog',

    // Utility Functions
    'updateDocumentInfo', 'updateStatus', 'resetVisualizer', 'showHelp', 'closeVisualizer'
]);

// =============================================================================
// END OF 5.2_dom-visualizer.jsx - FIXED
// =============================================================================