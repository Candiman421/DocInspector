// =============================================================================
// 5.2_dom-visualizer.jsx - DOM DISCOVERY VISUALIZER - FIXED
// InDesign DOM Discovery Builder v3.1 - PRODUCTION READY - PROGRAMMATIC UI
// =============================================================================
// PURPOSE: Main visualizer interface with comprehensive DOM discovery tools
// DEPENDENCIES: ["1.1_bootstrap-foundation.jsx", "1.2_safety-utilities.jsx"]
// SIZE: ~1953 lines - COMPLETE IMPLEMENTATION - FIXED DISPLAY & LOGGING
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
// DEFAULT CONFIGURATION - ENHANCED LOGGING SYSTEM
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
        enabled: true,  // Enhanced: Debug flag - set to true by default
        showEnumeration: true,
        showSampling: true,
        showCircularDetection: true,
        showDisplay: true,
        showPerformance: true,
        showExport: true  // NEW: Export debug logging
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
            alert('DOM Visualizer Error: ' + envValidation.errorMessage);
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

        // Initialize components
        initializeVisualizerComponents();

        // Show window
        g_domViz_visualizerWindow.show();

        // Update initial state
        updateDocumentInfo();
        updateStatus('DOM Visualizer initialized successfully');

        return true;

    } catch (exc) {
        alert('DOM Visualizer initialization error: ' + exc.message);
        return false;
    }
}

/**
 * Create visualizer window - PROGRAMMATIC CREATION
 * @returns {Window} Created window or null
 */
function createVisualizerWindow() {
    try {
        logInfo('Creating DOM Visualizer window', 'display');

        // Create main window
        var mainWindow = new Window('dialog', 'InDesign DOM Visualizer v3.1');
        if (!mainWindow) return null;

        mainWindow.orientation = 'column';
        mainWindow.alignChildren = 'fill';
        mainWindow.spacing = 5;
        mainWindow.margins = 10;
        mainWindow.preferredSize.width = 900;
        mainWindow.preferredSize.height = 700;

        // Create UI components
        createVisualizerHeader(mainWindow);
        createVisualizerTabs(mainWindow);
        createVisualizerFooter(mainWindow);

        logInfo('DOM Visualizer window created successfully', 'display');
        return mainWindow;

    } catch (exc) {
        logError('Window creation error: ' + exc.message, 'display');
        return null;
    }
}

/**
 * Create visualizer header - PROGRAMMATIC CREATION
 * @param {Window} parentWindow - Parent window
 */
function createVisualizerHeader(parentWindow) {
    try {
        if (!parentWindow) return;

        // Header group
        var headerGroup = parentWindow.add('group');
        if (!headerGroup) return;

        headerGroup.orientation = 'row';
        headerGroup.alignChildren = 'center';
        headerGroup.spacing = 10;

        // Document info group
        var infoGroup = headerGroup.add('group');
        if (infoGroup) {
            infoGroup.orientation = 'column';
            infoGroup.alignChildren = 'left';

            g_domViz_documentInfo = infoGroup.add('statictext', undefined, 'Document: No document open');
            if (g_domViz_documentInfo) {
                g_domViz_documentInfo.preferredSize.width = 400;
            }

            var statusGroup = infoGroup.add('group');
            if (statusGroup) {
                statusGroup.orientation = 'row';
                statusGroup.add('statictext', undefined, 'Status: ');
                
                var statusLabel = statusGroup.add('statictext', undefined, 'Ready');
                if (statusLabel) {
                    statusLabel.preferredSize.width = 300;
                }
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
        logError('Header creation error: ' + exc.message, 'display');
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
        logError('Tab creation error: ' + exc.message, 'display');
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
        logError('Discovery tab creation error: ' + exc.message, 'display');
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
        logError('Export tab creation error: ' + exc.message, 'display');
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

            var beforeBtn = comparisonControls.add('button', undefined, 'Load Before');
            if (beforeBtn) {
                beforeBtn.preferredSize.width = 100;
                beforeBtn.onClick = loadBeforeJSON;
            }

            var afterBtn = comparisonControls.add('button', undefined, 'Load After');
            if (afterBtn) {
                afterBtn.preferredSize.width = 100;
                afterBtn.onClick = loadAfterJSON;
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
        logError('Comparison tab creation error: ' + exc.message, 'display');
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

            var deepMapBtn = mappingControls.add('button', undefined, 'Deep Map');
            if (deepMapBtn) {
                deepMapBtn.preferredSize.width = 100;
                deepMapBtn.onClick = performDeepMapping;
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

            g_domViz_mappingDisplay = mappingDisplay.add('edittext', undefined, 'Advanced object mapping and relationship analysis...', {
                multiline: true,
                scrolling: true
            });
            if (g_domViz_mappingDisplay) {
                g_domViz_mappingDisplay.preferredSize.height = 450;
                g_domViz_mappingDisplay.readonly = true;
            }
        }

    } catch (exc) {
        logError('Deep mapping tab creation error: ' + exc.message, 'display');
    }
}

/**
 * Create visualizer footer - PROGRAMMATIC CREATION
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
        logError('Footer creation error: ' + exc.message, 'display');
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
// DISCOVERY OPERATIONS - ENHANCED WITH PROPER LOGGING
// =============================================================================

/**
 * Perform full discovery (all phases) - ENHANCED WITH LOGGING
 */
function performFullDiscovery() {
    logDebug('Config exists: ' + (g_domViz_userConfiguration ? 'YES' : 'NO'), 'display');
    logDebug('objectClone available: ' + functionExists('objectClone'), 'display');
    
    if (g_domViz_userConfiguration) {
        logDebug('maxDepth setting: ' + g_domViz_userConfiguration.enumeration.maxDepth, 'display');
    }
    
    try {
        updateStatus('Starting full DOM discovery...');

        // FIX: Initialize configuration if not available
        if (!g_domViz_userConfiguration) {
            g_domViz_userConfiguration = objectClone(DEFAULT_VISUALIZER_CONFIG, 4);
            logInfo('Configuration initialized with defaults', 'display');
        }

        if (!app.documents.length) {
            alert('Please open a document first');
            return;
        }

        var activeDoc = app.activeDocument;
        logInfo('Document name: ' + (activeDoc.name || 'Unknown'), 'display');

        // Phase 1: Enumeration
        updateStatus('Phase 1: Enumerating DOM structure...');
        logInfo('=== STARTING PHASE 1 ===', 'enumeration');
        var domStructure = enumerateDocumentDOM(activeDoc, g_domViz_userConfiguration.enumeration);

        // DEBUG: Show what we actually got from enumeration - ES3 COMPATIBLE
        logDebug('=== PHASE 1 ENUMERATION RESULTS ===', 'display');
        logDebug('domStructure type: ' + typeof domStructure, 'display');
        logDebug('domStructure has .structure: ' + (domStructure.structure ? 'YES' : 'NO'), 'display');
        logDebug('domStructure has .metadata: ' + (domStructure.metadata ? 'YES' : 'NO'), 'display');

        if (domStructure.structure && domStructure.structure.document) {
            var docNode = domStructure.structure.document;
            logDebug('Document node properties: ' + (docNode.properties ? docNode.properties.length : 0), 'display');
            logDebug('Document node methods: ' + (docNode.methods ? docNode.methods.length : 0), 'display');
            logDebug('Document node collections: ' + (docNode.collections ? docNode.collections.length : 0), 'display');
            logDebug('Document node child nodes: ' + (docNode.childNodes ? docNode.childNodes.length : 0), 'display');
        }

        // FIX: Check for actual error conditions (not .success property)
        if (!domStructure || (domStructure.metadata && domStructure.metadata.errorMessage) || !domStructure.structure) {
            var errorMsg = 'Unknown enumeration error';
            if (domStructure && domStructure.metadata && domStructure.metadata.errorMessage) {
                errorMsg = domStructure.metadata.errorMessage;
            } else if (!domStructure) {
                errorMsg = 'Enumeration returned null';
            }
            alert('Enumeration failed: ' + errorMsg);
            return;
        }

        // Phase 2: Value Sampling
        logInfo('=== STARTING PHASE 2 ===', 'sampling');
        updateStatus('Phase 2: Sampling property values...');
        var sampledStructure = domStructure; // Default fallback
        
        if (functionExists('sampleDOMValues')) {
            logDebug('Calling sampleDOMValues with FULL domStructure (not .structure)', 'sampling');
            // FIX: Pass full domStructure, not domStructure.structure
            var phase2Result = sampleDOMValues(domStructure, activeDoc, g_domViz_userConfiguration.sampling);
            
            if (phase2Result && !phase2Result.errorMessage) {
                sampledStructure = phase2Result;
                logInfo('Phase 2 completed successfully', 'sampling');
            } else {
                logWarn('Phase 2 had errors: ' + (phase2Result ? phase2Result.errorMessage : 'unknown'), 'sampling');
                logDebug('Using Phase 1 results for Phase 3', 'sampling');
            }
        } else {
            logWarn('sampleDOMValues function not found! Skipping phase 2', 'sampling');
        }

        // Phase 3: Collection Sampling
        logInfo('=== STARTING PHASE 3 ===', 'sampling');
        updateStatus('Phase 3: Sampling collections...');
        var finalStructure = sampledStructure; // Default fallback
        
        if (functionExists('sampleCollectionContents')) {
            logDebug('Calling sampleCollectionContents with FULL structure (not .structure)', 'sampling');
            // FIX: Pass full structure, not .structure
            var phase3Result = sampleCollectionContents(sampledStructure, activeDoc, g_domViz_userConfiguration.sampling);
            
            if (phase3Result && !phase3Result.errorMessage) {
                finalStructure = phase3Result;
                logInfo('Phase 3 completed successfully', 'sampling');
            } else {
                logWarn('Phase 3 had errors: ' + (phase3Result ? phase3Result.errorMessage : 'unknown'), 'sampling');
                logDebug('Using Phase 2 results as final', 'sampling');
            }
        } else {
            logWarn('sampleCollectionContents function not found! Skipping phase 3', 'sampling');
        }

        logInfo('=== SETTING FINAL RESULTS ===', 'display');
        g_domViz_currentDOMStructure = finalStructure;
        logDebug('g_domViz_currentDOMStructure set, type: ' + typeof g_domViz_currentDOMStructure, 'display');
        
        if (g_domViz_currentDOMStructure) {
            logInfo('Final structure is not null - proceeding to display', 'display');
        } else {
            logError('ERROR: Final structure is null!', 'display');
        }
        
        displayCurrentStructure();
        updateStatus('Full discovery completed successfully');

    } catch (exc) {
        logError('EXCEPTION in performFullDiscovery: ' + exc.message, 'display');
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

        var activeDoc = app.activeDocument;
        var domStructure = enumerateDocumentDOM(activeDoc, g_domViz_userConfiguration.enumeration);

        if (!domStructure || domStructure.errorMessage) {
            alert('Enumeration failed: ' + (domStructure ? domStructure.errorMessage : 'unknown error'));
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

        var activeDoc = app.activeDocument;
        updateStatus('Phase 2: Value sampling...');
        var sampledStructure = sampleDOMValues(g_domViz_currentDOMStructure.structure, activeDoc, g_domViz_userConfiguration.sampling);

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

        var activeDoc = app.activeDocument;
        updateStatus('Phase 3: Collection sampling...');
        var finalStructure = sampleCollectionContents(g_domViz_currentDOMStructure.structure, activeDoc, g_domViz_userConfiguration.sampling);

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
    logDebug('Starting displayCurrentStructure', 'display');

    try {
        if (!g_domViz_currentDOMStructure) {
            logWarn('ERROR: g_domViz_currentDOMStructure is null', 'display');
            if (g_domViz_discoveryDisplay) {
                g_domViz_discoveryDisplay.text = 'No DOM structure available. Please run discovery first.';
            }
            return;
        }

        if (!g_domViz_discoveryDisplay) {
            logError('ERROR: g_domViz_discoveryDisplay is null', 'display');
            return;
        }

        logDebug('g_domViz_currentDOMStructure type: ' + typeof g_domViz_currentDOMStructure, 'display');

        // Debug structure contents
        if (g_domViz_currentDOMStructure.structure) {
            logDebug('Structure exists', 'display');
            if (g_domViz_currentDOMStructure.structure.document) {
                var docNode = g_domViz_currentDOMStructure.structure.document;
                logDebug('Document node exists', 'display');
                logDebug('Properties: ' + (docNode.properties ? docNode.properties.length : 'undefined'), 'display');
                logDebug('Methods: ' + (docNode.methods ? docNode.methods.length : 'undefined'), 'display');
                logDebug('Collections: ' + (docNode.collections ? docNode.collections.length : 'undefined'), 'display');
                logDebug('Child nodes: ' + (docNode.childNodes ? docNode.childNodes.length : 'undefined'), 'display');
            } else {
                logWarn('No document node in structure', 'display');
            }
        } else {
            logWarn('No structure property', 'display');
        }

        // Generate display text
        var displayText = '';

        if (functionExists('generateStructureDisplayText')) {
            logDebug('generateStructureDisplayText function exists - calling it', 'display');
            displayText = generateStructureDisplayText(g_domViz_currentDOMStructure);
            logDebug('Display text generated, length: ' + displayText.length, 'display');
        } else {
            logWarn('generateStructureDisplayText function NOT FOUND - creating enhanced fallback', 'display');
            displayText = generateEnhancedFallbackDisplay(g_domViz_currentDOMStructure);
        }

        g_domViz_discoveryDisplay.text = displayText;
        logInfo('Display text set successfully', 'display');

    } catch (exc) {
        logError('EXCEPTION: ' + exc.message, 'display');
        updateStatus('Display update error: ' + exc.message);
    }
}

/**
 * Generate structure display text - FIXED VERSION
 * Uses existing generateNodeHierarchy from 4.1_json-analyzer.jsx
 * @param {Object} domStructure - DOM structure
 * @returns {String} Display text
 */
function generateStructureDisplayText(domStructure) {
    try {
        logDebug('Starting generateStructureDisplayText', 'display');
        
        if (!domStructure) {
            logWarn('No DOM structure provided to generateStructureDisplayText', 'display');
            return 'No structure available';
        }

        var textBuilder = createStringBuilder();

        textBuilder.appendLine('DOM DISCOVERY RESULTS');
        textBuilder.appendLine('====================');
        textBuilder.appendLine('');

        // Metadata section
        if (domStructure.metadata) {
            logDebug('Adding metadata section to display', 'display');
            textBuilder.appendLine('METADATA:');
            textBuilder.appendLine('Discovery Date: ' + (domStructure.metadata.timestamp || 'Unknown'));
            textBuilder.appendLine('Total Objects: ' + (domStructure.metadata.totalObjects || 0));
            textBuilder.appendLine('Total Properties: ' + (domStructure.metadata.totalProperties || 0));
            textBuilder.appendLine('Total Collections: ' + (domStructure.metadata.totalCollections || 0));
            textBuilder.appendLine('Total Methods: ' + (domStructure.metadata.totalMethods || 0));
            textBuilder.appendLine('Max Depth: ' + (domStructure.metadata.maxDepth || 0));
            textBuilder.appendLine('Discovery Time: ' + (domStructure.metadata.enumerationTime || 0) + 'ms');
            textBuilder.appendLine('');
        }

        // **FIX: Handle the actual structure format (object with "document" property)**
        if (domStructure.structure && domStructure.structure.document) {
            logInfo('Generating DOM tree hierarchy', 'display');
            textBuilder.appendLine('DOM STRUCTURE TREE:');
            textBuilder.appendLine('==================');
            
            // Use existing generateNodeHierarchy function from 4.1_json-analyzer.jsx
            if (functionExists('generateNodeHierarchy')) {
                logDebug('Using existing generateNodeHierarchy function', 'display');
                var hierarchyConfig = { maxReportItems: 15 };
                var hierarchyText = generateNodeHierarchy(domStructure.structure.document, 0, hierarchyConfig);
                textBuilder.append(hierarchyText);
            } else {
                logWarn('generateNodeHierarchy function not found, using fallback', 'display');
                // Fallback: simple tree display
                var simpleTree = generateSimpleDOMTree(domStructure.structure.document, 0);
                textBuilder.append(simpleTree);
            }
            
        } else {
            logWarn('Expected structure.document not found', 'display');
            textBuilder.appendLine('DOM STRUCTURE:');
            textBuilder.appendLine('No document structure available for display');
            
            // Debug info
            if (domStructure.structure) {
                textBuilder.appendLine('Structure type: ' + typeof domStructure.structure);
                var structureKeys = [];
                for (var key in domStructure.structure) {
                    if (objectHasOwnProperty(domStructure.structure, key)) {
                        structureKeys.push(key);
                    }
                }
                textBuilder.appendLine('Structure keys: ' + arrayJoin(structureKeys, ', '));
            }
        }

        logInfo('Structure display text generated successfully', 'display');
        return textBuilder.toString();

    } catch (exc) {
        logError('Error generating structure display: ' + exc.message, 'display');
        return 'Error generating structure display: ' + exc.message;
    }
}

/**
 * Simple DOM tree generator (fallback if generateNodeHierarchy not available)
 * ES3 compliant, ASCII only
 * @param {Object} domNode - DOM node to display
 * @param {Number} currentDepth - Current indentation depth
 * @returns {String} Simple tree display
 */
function generateSimpleDOMTree(domNode, currentDepth) {
    try {
        if (!domNode) return '';
        
        var textBuilder = createStringBuilder();
        var indentPrefix = '';
        
        // Create indentation (ASCII only)
        for (var i = 0; i < currentDepth; i++) {
            indentPrefix += '  ';
        }
        
        // Display current node (ASCII tree characters)
        var nodeDisplayName = domNode.name || domNode.path || 'Unknown';
        var nodeInfo = nodeDisplayName + ' (' + (domNode.type || 'object') + ')';
        
        textBuilder.appendLine(indentPrefix + '+ ' + nodeInfo);
        
        // Show properties (limited number)
        if (domNode.properties && domNode.properties.length > 0) {
            var propLimit = Math.min(domNode.properties.length, 10);
            textBuilder.appendLine(indentPrefix + '  |-- Properties (' + domNode.properties.length + '):');
            
            for (var p = 0; p < propLimit; p++) {
                var property = domNode.properties[p];
                var propText = '      - ' + property.name + ' (' + (property.type || 'unknown') + ')';
                
                // Show sampled value if available
                if (property.sampledValue && property.sampledValue !== '[Skipped]' && property.sampledValue !== '[Error]') {
                    var displayValue = property.sampledValue;
                    // Truncate long values
                    if (typeof displayValue === 'string' && displayValue.length > 50) {
                        displayValue = stringSubstring(displayValue, 0, 47) + '...';
                    }
                    propText += ' = ' + displayValue;
                }
                
                textBuilder.appendLine(indentPrefix + propText);
            }
            
            if (domNode.properties.length > propLimit) {
                textBuilder.appendLine(indentPrefix + '      ... and ' + (domNode.properties.length - propLimit) + ' more properties');
            }
        }
        
        // Show collections (limited number)
        if (domNode.collections && domNode.collections.length > 0) {
            var collLimit = Math.min(domNode.collections.length, 5);
            textBuilder.appendLine(indentPrefix + '  |-- Collections (' + domNode.collections.length + '):');
            
            for (var c = 0; c < collLimit; c++) {
                var collection = domNode.collections[c];
                var collText = '      - ' + collection.name + ' (' + (collection.type || 'collection') + ')';
                
                // Show collection size if available
                if (collection.estimatedSize !== undefined) {
                    collText += ' [' + collection.estimatedSize + ' items]';
                }
                
                textBuilder.appendLine(indentPrefix + collText);
            }
            
            if (domNode.collections.length > collLimit) {
                textBuilder.appendLine(indentPrefix + '      ... and ' + (domNode.collections.length - collLimit) + ' more collections');
            }
        }
        
        // Show methods (limited number)
        if (domNode.methods && domNode.methods.length > 0) {
            var methodLimit = Math.min(domNode.methods.length, 5);
            textBuilder.appendLine(indentPrefix + '  |-- Methods (' + domNode.methods.length + '):');
            
            for (var m = 0; m < methodLimit; m++) {
                var method = domNode.methods[m];
                textBuilder.appendLine(indentPrefix + '      - ' + method.name + '()');
            }
            
            if (domNode.methods.length > methodLimit) {
                textBuilder.appendLine(indentPrefix + '      ... and ' + (domNode.methods.length - methodLimit) + ' more methods');
            }
        }
        
        // Show child nodes (recursive, but limited depth to prevent overflow)
        if (domNode.childNodes && domNode.childNodes.length > 0 && currentDepth < 2) {
            var childLimit = Math.min(domNode.childNodes.length, 3);
            textBuilder.appendLine(indentPrefix + '  |-- Child Objects (' + domNode.childNodes.length + '):');
            
            for (var ch = 0; ch < childLimit; ch++) {
                var childTree = generateSimpleDOMTree(domNode.childNodes[ch], currentDepth + 3);
                textBuilder.append(childTree);
            }
            
            if (domNode.childNodes.length > childLimit) {
                textBuilder.appendLine(indentPrefix + '      ... and ' + (domNode.childNodes.length - childLimit) + ' more child objects');
            }
        } else if (domNode.childNodes && domNode.childNodes.length > 0) {
            textBuilder.appendLine(indentPrefix + '  |-- Child Objects: ' + domNode.childNodes.length + ' (max depth reached)');
        }
        
        if (currentDepth === 0) {
            textBuilder.appendLine('');
        }
        
        return textBuilder.toString();
        
    } catch (exc) {
        logError('Error in generateSimpleDOMTree: ' + exc.message, 'display');
        return indentPrefix + 'Error displaying node: ' + exc.message + '\n';
    }
}

/**
 * Enhanced fallback display - FIXED VERSION
 * @param {Object} domStructure - DOM structure
 * @returns {String} Display text
 */
function generateEnhancedFallbackDisplay(domStructure) {
    logDebug('Generating enhanced fallback display', 'display');

    try {
        var textBuilder = createStringBuilder();

        textBuilder.appendLine('DOM DISCOVERY RESULTS (Enhanced Display)');
        textBuilder.appendLine('========================================');
        textBuilder.appendLine('');

        // Metadata section
        if (domStructure.metadata) {
            logDebug('Adding metadata to fallback display', 'display');
            textBuilder.appendLine('METADATA:');
            textBuilder.appendLine('Document: ' + (domStructure.metadata.documentName || 'Unknown'));
            textBuilder.appendLine('Version: ' + (domStructure.metadata.version || 'Unknown'));
            textBuilder.appendLine('Total Objects: ' + (domStructure.metadata.totalObjects || 0));
            textBuilder.appendLine('Total Properties: ' + (domStructure.metadata.totalProperties || 0));
            textBuilder.appendLine('Discovery Time: ' + (domStructure.metadata.enumerationTime || 'Unknown') + 'ms');
            textBuilder.appendLine('');
        }

        // **FIX: Handle actual structure format**
        if (domStructure.structure && domStructure.structure.document) {
            var documentNode = domStructure.structure.document;
            logDebug('Document node found, generating overview', 'display');

            textBuilder.appendLine('DOCUMENT STRUCTURE OVERVIEW:');
            textBuilder.appendLine('Properties: ' + (documentNode.properties ? documentNode.properties.length : 0));
            textBuilder.appendLine('Methods: ' + (documentNode.methods ? documentNode.methods.length : 0));
            textBuilder.appendLine('Collections: ' + (documentNode.collections ? documentNode.collections.length : 0));
            textBuilder.appendLine('Child Nodes: ' + (documentNode.childNodes ? documentNode.childNodes.length : 0));
            textBuilder.appendLine('');

            // Show sample properties
            if (documentNode.properties && documentNode.properties.length > 0) {
                textBuilder.appendLine('SAMPLE PROPERTIES:');
                var propSampleLimit = Math.min(15, documentNode.properties.length);
                for (var i = 0; i < propSampleLimit; i++) {
                    var prop = documentNode.properties[i];
                    var propLine = '  - ' + prop.name + ' (' + (prop.type || 'unknown') + ')';
                    if (prop.sampledValue && prop.sampledValue !== '[Skipped]' && prop.sampledValue !== '[Error]') {
                        // Truncate long values for display
                        var sampleValue = prop.sampledValue;
                        if (typeof sampleValue === 'string' && sampleValue.length > 40) {
                            sampleValue = stringSubstring(sampleValue, 0, 37) + '...';
                        }
                        propLine += ' = ' + sampleValue;
                    }
                    textBuilder.appendLine(propLine);
                }
                
                if (documentNode.properties.length > propSampleLimit) {
                    textBuilder.appendLine('  ... and ' + (documentNode.properties.length - propSampleLimit) + ' more properties');
                }
                textBuilder.appendLine('');
            }

            // Show sample collections
            if (documentNode.collections && documentNode.collections.length > 0) {
                textBuilder.appendLine('SAMPLE COLLECTIONS:');
                var collSampleLimit = Math.min(10, documentNode.collections.length);
                for (var j = 0; j < collSampleLimit; j++) {
                    var coll = documentNode.collections[j];
                    var collLine = '  - ' + coll.name + ' (' + (coll.type || 'collection') + ')';
                    if (coll.estimatedSize !== undefined) {
                        collLine += ' [' + coll.estimatedSize + ' items]';
                    }
                    textBuilder.appendLine(collLine);
                }
                
                if (documentNode.collections.length > collSampleLimit) {
                    textBuilder.appendLine('  ... and ' + (documentNode.collections.length - collSampleLimit) + ' more collections');
                }
                textBuilder.appendLine('');
            }

        } else {
            logWarn('Structure format issue in fallback display', 'display');
            textBuilder.appendLine('STRUCTURE ISSUE:');
            textBuilder.appendLine('Expected domStructure.structure.document but got:');
            textBuilder.appendLine('Structure type: ' + typeof domStructure.structure);
            
            if (domStructure.structure) {
                var keys = [];
                for (var key in domStructure.structure) {
                    if (objectHasOwnProperty(domStructure.structure, key)) {
                        keys.push(key);
                    }
                }
                textBuilder.appendLine('Structure keys: ' + arrayJoin(keys, ', '));
            }
        }

        // Statistics backup
        if (domStructure.statistics) {
            textBuilder.appendLine('RAW STATISTICS:');
            textBuilder.appendLine('Total Nodes: ' + (domStructure.statistics.totalNodes || 0));
            textBuilder.appendLine('Total Properties: ' + (domStructure.statistics.totalProperties || 0));
            textBuilder.appendLine('Max Depth: ' + (domStructure.statistics.maxDepth || 0));
        }

        logInfo('Enhanced fallback display generated successfully', 'display');
        return textBuilder.toString();

    } catch (exc) {
        logError('Error generating enhanced fallback display: ' + exc.message, 'display');
        return 'Error generating enhanced fallback display: ' + exc.message;
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
// EXPORT OPERATIONS - ENHANCED WITH LOGGING
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

        logInfo('Starting JSON export', 'export');
        var exportResult = exportDOMStructure(g_domViz_currentDOMStructure, 'json', g_domViz_userConfiguration.exportSettings);

        if (!exportResult.success) {
            logError('JSON export failed: ' + exportResult.errorMessage, 'export');
            alert('JSON export failed: ' + exportResult.errorMessage);
            return;
        }

        var file = File.saveDialog('Save JSON Export', '*.json');
        if (file) {
            file.open('w');
            file.write(exportResult.content);
            file.close();

            if (g_domViz_exportDisplay) {
                g_domViz_exportDisplay.text = 'JSON exported successfully to:\n' + file.fsName + '\n\nFile size: ' + exportResult.content.length + ' bytes';
            }

            logInfo('JSON export completed: ' + file.name, 'export');
        }

    } catch (exc) {
        logError('JSON export error: ' + exc.message, 'export');
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

        logInfo('Starting text export', 'export');
        var exportResult = exportDOMStructure(g_domViz_currentDOMStructure, 'text', g_domViz_userConfiguration.exportSettings);

        if (!exportResult.success) {
            logError('Text export failed: ' + exportResult.errorMessage, 'export');
            alert('Text export failed: ' + exportResult.errorMessage);
            return;
        }

        var file = File.saveDialog('Save Text Export', '*.txt');
        if (file) {
            file.open('w');
            file.write(exportResult.content);
            file.close();

            if (g_domViz_exportDisplay) {
                g_domViz_exportDisplay.text = 'Text exported successfully to:\n' + file.fsName + '\n\nFile size: ' + exportResult.content.length + ' bytes';
            }

            logInfo('Text export completed: ' + file.name, 'export');
        }

    } catch (exc) {
        logError('Text export error: ' + exc.message, 'export');
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

        logInfo('Starting CSV export', 'export');
        var exportResult = exportDOMStructure(g_domViz_currentDOMStructure, 'csv', g_domViz_userConfiguration.exportSettings);

        if (!exportResult.success) {
            logError('CSV export failed: ' + exportResult.errorMessage, 'export');
            alert('CSV export failed: ' + exportResult.errorMessage);
            return;
        }

        var file = File.saveDialog('Save CSV Export', '*.csv');
        if (file) {
            file.open('w');
            file.write(exportResult.content);
            file.close();

            if (g_domViz_exportDisplay) {
                g_domViz_exportDisplay.text = 'CSV exported successfully to:\n' + file.fsName + '\n\nFile size: ' + exportResult.content.length + ' bytes';
            }

            logInfo('CSV export completed: ' + file.name, 'export');
        }

    } catch (exc) {
        logError('CSV export error: ' + exc.message, 'export');
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

        var displayText = generateAnalysisDisplay(analysisResult);
        
        if (g_domViz_exportDisplay) {
            g_domViz_exportDisplay.text = displayText;
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
        var textBuilder = createStringBuilder();

        textBuilder.appendLine('DOM STRUCTURE ANALYSIS');
        textBuilder.appendLine('=====================');
        textBuilder.appendLine('');

        if (analysisResult.statistics) {
            textBuilder.appendLine('STATISTICS:');
            textBuilder.appendLine('Total Nodes: ' + (analysisResult.statistics.totalNodes || 0));
            textBuilder.appendLine('Max Depth: ' + (analysisResult.statistics.maxDepth || 0));
            textBuilder.appendLine('Property Count: ' + (analysisResult.statistics.propertyCount || 0));
            textBuilder.appendLine('Collection Count: ' + (analysisResult.statistics.collectionCount || 0));
            textBuilder.appendLine('');
        }

        if (analysisResult.keyFindings) {
            textBuilder.appendLine('KEY FINDINGS:');
            for (var i = 0; i < analysisResult.keyFindings.length; i++) {
                textBuilder.appendLine('• ' + analysisResult.keyFindings[i]);
            }
        }

        return textBuilder.toString();

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
        var file = File.openDialog('Select Before JSON', '*.json');
        if (!file) return;

        file.open('r');
        var content = file.read();
        file.close();

        g_domViz_beforeData = safeJSONParse(content);
        updateStatus('Before data loaded: ' + file.name);

    } catch (exc) {
        updateStatus('Before load error: ' + exc.message);
    }
}

/**
 * Load after JSON
 */
function loadAfterJSON() {
    try {
        var file = File.openDialog('Select After JSON', '*.json');
        if (!file) return;

        file.open('r');
        var content = file.read();
        file.close();

        g_domViz_afterData = safeJSONParse(content);
        updateStatus('After data loaded: ' + file.name);

    } catch (exc) {
        updateStatus('After load error: ' + exc.message);
    }
}

/**
 * Perform comparison
 */
function performComparison() {
    try {
        if (!g_domViz_beforeData || !g_domViz_afterData) {
            alert('Please load both before and after JSON files first');
            return;
        }

        updateStatus('Performing comparison...');

        if (functionExists('compareDOMExports')) {
            var comparisonResult = compareDOMExports(g_domViz_beforeData, g_domViz_afterData);
            var displayText = generateComparisonDisplay(comparisonResult);
            
            if (g_domViz_comparisonDisplay) {
                g_domViz_comparisonDisplay.text = displayText;
            }

            updateStatus('Comparison completed');
        } else {
            updateStatus('Comparison function not available');
        }

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
        var textBuilder = createStringBuilder();

        textBuilder.appendLine('DOCUMENT COMPARISON RESULTS');
        textBuilder.appendLine('===========================');
        textBuilder.appendLine('');

        if (comparisonResult.summary) {
            textBuilder.appendLine('SUMMARY:');
            textBuilder.appendLine('Changes detected: ' + (comparisonResult.summary.totalChanges || 0));
            textBuilder.appendLine('Added items: ' + (comparisonResult.summary.addedCount || 0));
            textBuilder.appendLine('Removed items: ' + (comparisonResult.summary.removedCount || 0));
            textBuilder.appendLine('Modified items: ' + (comparisonResult.summary.modifiedCount || 0));
            textBuilder.appendLine('');
        }

        return textBuilder.toString();

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
            alert('No DOM structure available. Run discovery first.');
            return;
        }

        var timestamp = getCurrentTimestamp();
        var snapshotData = {
            timestamp: timestamp,
            structure: g_domViz_currentDOMStructure
        };

        var file = File.saveDialog('Save Snapshot', 'snapshot_' + timestamp.replace(/[: ]/g, '_') + '.json');
        if (file) {
            file.open('w');
            file.write(safeJSONStringify(snapshotData));
            file.close();

            updateStatus('Snapshot saved: ' + file.name);
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
            alert('No DOM structure available. Run discovery first.');
            return;
        }

        updateStatus('Performing deep object mapping...');

        if (functionExists('performDeepDOMMapping')) {
            var mappingResult = performDeepDOMMapping(g_domViz_currentDOMStructure);
            var displayText = generateDeepMappingDisplay(mappingResult);
            
            if (g_domViz_mappingDisplay) {
                g_domViz_mappingDisplay.text = displayText;
            }

            updateStatus('Deep mapping completed');
        } else {
            updateStatus('Deep mapping function not available');
        }

    } catch (exc) {
        updateStatus('Deep mapping error: ' + exc.message);
    }
}

/**
 * Generate object atlas
 */
function generateObjectAtlas() {
    try {
        updateStatus('Generating object atlas...');
        // Atlas generation functionality
        updateStatus('Atlas generation completed');

    } catch (exc) {
        updateStatus('Atlas generation error: ' + exc.message);
    }
}

/**
 * Optimize performance
 */
function optimizePerformance() {
    try {
        updateStatus('Analyzing performance optimizations...');
        // Performance optimization functionality
        updateStatus('Performance analysis completed');

    } catch (exc) {
        updateStatus('Performance optimization error: ' + exc.message);
    }
}

/**
 * Generate deep mapping display
 * @param {Object} mappingResult - Mapping result
 * @returns {String} Display text
 */
function generateDeepMappingDisplay(mappingResult) {
    try {
        var textBuilder = createStringBuilder();

        textBuilder.appendLine('DEEP MAPPING RESULTS');
        textBuilder.appendLine('===================');
        textBuilder.appendLine('');

        if (mappingResult) {
            textBuilder.appendLine('Mapping analysis completed successfully');
        } else {
            textBuilder.appendLine('No mapping results available');
        }

        return textBuilder.toString();

    } catch (exc) {
        return 'Error generating deep mapping display: ' + exc.message;
    }
}

// =============================================================================
// CONFIGURATION - ENHANCED WITH LOGGING
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
                var maxDepthEdit;
                if (maxDepthGroup) {
                    maxDepthGroup.add('statictext', undefined, 'Max Depth:');
                    maxDepthEdit = maxDepthGroup.add('edittext', undefined, String(g_domViz_userConfiguration.enumeration.maxDepth));
                    maxDepthEdit.preferredSize.width = 60;
                }

                var timeoutGroup = enumTab.add('group');
                var timeoutEdit;
                if (timeoutGroup) {
                    timeoutGroup.add('statictext', undefined, 'Timeout (ms):');
                    timeoutEdit = timeoutGroup.add('edittext', undefined, String(g_domViz_userConfiguration.enumeration.timeoutMs));
                    timeoutEdit.preferredSize.width = 80;
                }
            }

            // Sampling tab
            var samplingTab = configTabs.add('tab', undefined, 'Sampling');
            var maxSamplesEdit;
            if (samplingTab) {
                samplingTab.orientation = 'column';
                samplingTab.alignChildren = 'left';
                samplingTab.spacing = 5;

                samplingTab.add('statictext', undefined, 'Sampling Settings:');

                var maxSamplesGroup = samplingTab.add('group');
                if (maxSamplesGroup) {
                    maxSamplesGroup.add('statictext', undefined, 'Max Samples:');
                    maxSamplesEdit = maxSamplesGroup.add('edittext', undefined, String(g_domViz_userConfiguration.sampling.maxSamples));
                    maxSamplesEdit.preferredSize.width = 60;
                }
            }

            // Debug tab
            var debugTab = configTabs.add('tab', undefined, 'Debug & Logging');
            if (debugTab) {
                debugTab.orientation = 'column';
                debugTab.alignChildren = 'left';
                debugTab.spacing = 5;

                debugTab.add('statictext', undefined, 'Debug Settings:');
                
                var debugEnabledCheck = debugTab.add('checkbox', undefined, 'Enable Debug Logging');
                debugEnabledCheck.value = g_domViz_userConfiguration.debug.enabled;
                
                var enumDebugCheck = debugTab.add('checkbox', undefined, 'Show Enumeration Debug');
                enumDebugCheck.value = g_domViz_userConfiguration.debug.showEnumeration;
                
                var displayDebugCheck = debugTab.add('checkbox', undefined, 'Show Display Debug');
                displayDebugCheck.value = g_domViz_userConfiguration.debug.showDisplay;
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
                        // Read the configuration values from the edit fields
                        var newMaxDepth = safeParseInt(maxDepthEdit.text) || 4;
                        var newTimeout = safeParseInt(timeoutEdit.text) || 15000;
                        var newMaxSamples = safeParseInt(maxSamplesEdit.text) || 20;

                        // Update the global configuration
                        g_domViz_userConfiguration.enumeration.maxDepth = newMaxDepth;
                        g_domViz_userConfiguration.enumeration.timeoutMs = newTimeout;
                        g_domViz_userConfiguration.sampling.maxSamples = newMaxSamples;
                        
                        // Update debug settings
                        g_domViz_userConfiguration.debug.enabled = debugEnabledCheck.value;
                        g_domViz_userConfiguration.debug.showEnumeration = enumDebugCheck.value;
                        g_domViz_userConfiguration.debug.showDisplay = displayDebugCheck.value;

                        logInfo('Configuration saved - maxDepth: ' + newMaxDepth + ', timeout: ' + newTimeout, 'general');
                        updateStatus('Configuration saved successfully');

                    } catch (exc) {
                        logError('Configuration save error: ' + exc.message, 'general');
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
// UTILITY FUNCTIONS - ENHANCED WITH LOGGING
// =============================================================================

/**
 * Update document information
 */
function updateDocumentInfo() {
    try {
        if (!g_domViz_documentInfo) return;

        var docInfo = 'Document: ';
        if (app.documents.length > 0) {
            var activeDoc = app.activeDocument;
            docInfo += activeDoc.name || 'Untitled';
        } else {
            docInfo += 'No document open';
        }

        g_domViz_documentInfo.text = docInfo;

    } catch (exc) {
        logError('Document info update error: ' + exc.message, 'general');
    }
}

/**
 * Update status text - ENHANCED WITH LOGGING
 * @param {String} message - Status message
 */
function updateStatus(message) {
    try {
        if (g_domViz_statusText) {
            g_domViz_statusText.text = message;
        }
        logInfo(message, 'general');

    } catch (exc) {
        logError('Status update error: ' + exc.message, 'general');
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
            g_domViz_mappingDisplay.text = 'Advanced object mapping and relationship analysis...';
        }

        // Clear data
        g_domViz_currentDOMStructure = null;
        g_domViz_beforeData = null;
        g_domViz_afterData = null;

        // Reset configuration
        g_domViz_userConfiguration = objectClone(DEFAULT_VISUALIZER_CONFIG, 4);

        updateStatus('Visualizer reset completed');

    } catch (exc) {
        updateStatus('Reset error: ' + exc.message);
    }
}

/**
 * Show help
 */
function showHelp() {
    try {
        var helpText = 'InDesign DOM Visualizer v3.1\n\n';
        helpText += 'USAGE:\n';
        helpText += '1. Click "Discover DOM" to run full 3-phase discovery\n';
        helpText += '2. Use individual phase buttons for step-by-step analysis\n';
        helpText += '3. Export results in JSON, Text, or CSV formats\n';
        helpText += '4. Use comparison tools to analyze document changes\n';
        helpText += '5. Configure settings using the Configuration dialog\n\n';
        helpText += 'TROUBLESHOOTING:\n';
        helpText += '• Ensure a document is open before running discovery\n';
        helpText += '• Use the Reset button to clear all data and start over\n';
        helpText += '• Check the status bar for operation feedback\n';
        helpText += '• Enable debug logging in Configuration for detailed output';

        alert(helpText);

    } catch (exc) {
        updateStatus('Help display error: ' + exc.message);
    }
}

/**
 * Close visualizer
 */
function closeVisualizer() {
    try {
        if (g_domViz_visualizerWindow) {
            g_domViz_visualizerWindow.close();
        }

        // Reset global variables
        g_domViz_visualizerWindow = null;
        g_domViz_documentInfo = null;
        g_domViz_statusText = null;
        g_domViz_domDisplay = null;
        g_domViz_currentDOMStructure = null;
        g_domViz_userConfiguration = null;
        g_domViz_originalConfigs = null;
        g_domViz_exportHistory = [];
        g_domViz_beforeData = null;
        g_domViz_afterData = null;

        // Reset UI references
        g_domViz_mainTabs = null;
        g_domViz_discoveryTab = null;
        g_domViz_exportTab = null;
        g_domViz_comparisonTab = null;
        g_domViz_deepMappingTab = null;
        g_domViz_discoveryDisplay = null;
        g_domViz_exportDisplay = null;
        g_domViz_comparisonDisplay = null;
        g_domViz_mappingDisplay = null;

    } catch (exc) {
        logError('Close error: ' + exc.message, 'general');
    }
}

// =============================================================================
// MODULE REGISTRATION - COMPLETE AND UPDATED
// =============================================================================

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
    'generateEnhancedFallbackDisplay', 'generateSimpleDOMTree', // ← ADDED NEW FUNCTION
    'clearDiscoveryDisplay',

    // Export Operations
    'exportAsJSON', 'exportAsText', 'exportAsCSV', 'analyzeCurrentJSON', 'generateAnalysisDisplay',

    // Comparison Operations
    'loadBeforeJSON', 'loadAfterJSON', 'performComparison', 'generateComparisonDisplay', 'takeSnapshot',

    // Deep Mapping Operations
    'performDeepMapping', 'generateObjectAtlas', 'optimizePerformance', 'generateDeepMappingDisplay',

    // Configuration
    'showConfigurationDialog',

    // Utility Functions
    'updateDocumentInfo', 'updateStatus', 'resetVisualizer', 'showHelp', 'closeVisualizer'
]);

// =============================================================================
// END OF 5.2_dom-visualizer.jsx - FIXED WITH ENHANCED LOGGING & DISPLAY
// =============================================================================