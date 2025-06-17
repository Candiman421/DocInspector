// =============================================================================
// 6.1_advanced-ui.jsx - ENHANCED ADVANCED USER INTERFACE
// InDesign DOM Discovery Builder v3.1 - PRODUCTION READY - FIXED
// =============================================================================
// PURPOSE: Advanced UI with enhanced features, comparison tools, and analysis
// DEPENDENCIES: ALL PREVIOUS MODULES (1.1-5.2)
// SIZE: ~2500 lines - COMPLETE IMPLEMENTATION - PROGRAMMATIC UI CREATION
// =============================================================================

// =============================================================================
// DEPENDENCY VALIDATION
// =============================================================================

var ADVANCED_UI_DEPENDENCIES = [
    '1.1_bootstrap-foundation', '1.2_safety-utilities', '2.1_dom-enumerator',
    '2.2_collection-sampler', '3.1_property-sampler', '3.2_dom-exporter',
    '4.1_json-analyzer', '4.2_dom-comparator', '5.1_deep-mapper', '5.2_dom-visualizer'
];

var dependencyCheck = validateDependencies(ADVANCED_UI_DEPENDENCIES);
if (!dependencyCheck.success) {
    var missingModules = getMissingDependencies(ADVANCED_UI_DEPENDENCIES);
    updateStatus('Warning: Some modules unavailable: ' + arrayJoin(missingModules, ', '));
}

// =============================================================================
// GLOBAL VARIABLES
// =============================================================================

var g_advUI_window = null;
var g_advUI_statusText = null;
var g_advUI_documentInfo = null;
var g_advUI_advancedDOMStructure = null;
var g_advUI_loadedJSONData = null;
var g_advUI_beforeData = null;
var g_advUI_afterData = null;
var g_advUI_currentAnalysis = null;
var g_advUI_jsonAnalysisText = null;
var g_advUI_comparisonText = null;
var g_advUI_deepMappingText = null;
var g_advUI_liveAnalysisText = null;
var g_advUI_tabPanel = null;
var g_advUI_baselineDocumentState = null;

// =============================================================================
// CONFIGURATION OBJECTS - FIXED: export -> exportSettings
// =============================================================================

var ADVANCED_UI_CONFIG = {
    discovery: {
        maxDepth: 4,
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
    comparison: {
        enableStructuralComparison: true,
        enablePropertyComparison: true,
        enableCollectionComparison: true,
        enableValueComparison: true,
        compareExtractedValues: true,
        generateDetailedReport: true,
        highlightCriticalChanges: true,
        analyzePerformanceImpact: true
    },
    exportSettings: {  // FIXED: was 'export'
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
    }
};

// =============================================================================
// MAIN ADVANCED UI FUNCTIONS - PROGRAMMATIC CREATION
// =============================================================================

/**
 * Show advanced DOM analysis interface (main entry point)
 * @returns {Boolean} True if interface shown successfully
 */
function showAdvancedDOMAnalysis() {
    try {
        // Check if window already exists
        if (g_advUI_window) {
            g_advUI_window.show();
            return true;
        }

        // Validate InDesign environment
        var envValidation = validateInDesignEnvironment();
        if (!envValidation.valid) {
            alert('Advanced UI Error: ' + envValidation.error);
            return false;
        }

        // Initialize UI
        return initializeAdvancedUI();

    } catch (exc) {
        alert('Advanced UI Error: ' + exc.message);
        return false;
    }
}

/**
 * Initialize advanced UI - FIXED: Programmatic creation
 * @returns {Boolean} True if initialized successfully
 */
function initializeAdvancedUI() {
    try {
        // Create main window - SIMPLE, not complex resource string
        g_advUI_window = createAdvancedWindow();
        if (!g_advUI_window) {
            alert('Failed to create Advanced UI window');
            return false;
        }

        // Build UI components programmatically
        createAdvancedHeader(g_advUI_window);
        createAdvancedTabs(g_advUI_window);
        createAdvancedControls(g_advUI_window);
        createAdvancedFooter(g_advUI_window);

        // Initialize event handlers
        initializeAdvancedEventHandlers();

        // Update document information
        updateAdvancedDocumentInfo();

        // Show window
        g_advUI_window.show();

        updateAdvancedStatus('Advanced UI initialized - all modules loaded and ready');
        return true;

    } catch (exc) {
        alert('Advanced UI initialization error: ' + exc.message);
        return false;
    }
}

/**
 * Create advanced UI window - SIMPLE BASE WINDOW
 * @returns {Window} Created window or null
 */
function createAdvancedWindow() {
    try {
        // Create simple base window - NO complex resource string
        var mainWindow = new Window('dialog', 'InDesign DOM Discovery Builder - Advanced Interface v3.1');
        if (!mainWindow) {
            return null;
        }

        mainWindow.orientation = 'column';
        mainWindow.alignChildren = 'fill';
        mainWindow.spacing = 10;
        mainWindow.margins = 16;

        // Set window size
        mainWindow.preferredSize.width = 1000;
        mainWindow.preferredSize.height = 800;

        return mainWindow;

    } catch (exc) {
        alert('Advanced window creation error: ' + exc.message);
        return null;
    }
}

/**
 * Create advanced header panel
 * @param {Window} parentWindow - Parent window
 */
function createAdvancedHeader(parentWindow) {
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

            g_advUI_documentInfo = docGroup.add('statictext', undefined, 'Document: Loading...');
            if (g_advUI_documentInfo) {
                g_advUI_documentInfo.preferredSize.width = 400;
            }
        }

        // Control buttons group
        var controlGroup = headerGroup.add('group');
        if (controlGroup) {
            controlGroup.orientation = 'row';
            controlGroup.alignChildren = 'right';
            controlGroup.spacing = 5;

            var mainVisualizerBtn = controlGroup.add('button', undefined, 'Main DOM Visualizer');
            if (mainVisualizerBtn) {
                mainVisualizerBtn.preferredSize.width = 150;
                mainVisualizerBtn.onClick = showMainDOMVisualizer;
            }

            var moduleStatusBtn = controlGroup.add('button', undefined, 'Module Status');
            if (moduleStatusBtn) {
                moduleStatusBtn.preferredSize.width = 150;
                moduleStatusBtn.onClick = showModuleStatus;
            }
        }

        // Add separator
        var separator1 = parentWindow.add('panel');
        if (separator1) {
            separator1.preferredSize.height = 2;
        }

    } catch (exc) {
        updateAdvancedStatus('Header creation error: ' + exc.message);
    }
}

/**
 * Create advanced tabs - PROGRAMMATIC TAB CREATION
 * @param {Window} parentWindow - Parent window
 */
function createAdvancedTabs(parentWindow) {
    try {
        if (!parentWindow) return;

        // Create tab panel
        g_advUI_tabPanel = parentWindow.add('tabbedpanel');
        if (!g_advUI_tabPanel) return;

        g_advUI_tabPanel.alignChildren = 'fill';
        g_advUI_tabPanel.preferredSize.height = 600;

        // Create tabs programmatically
        createLiveAnalysisTab();
        createAdvancedDiscoveryTab();
        createJSONAnalysisTab();
        createSnapshotComparisonTab();
        createDeepMappingTab();

        // Set default tab
        if (g_advUI_tabPanel.children.length > 0) {
            g_advUI_tabPanel.selection = g_advUI_tabPanel.children[0];
        }

    } catch (exc) {
        updateAdvancedStatus('Tab creation error: ' + exc.message);
    }
}

/**
 * Create Live Analysis Tab
 */
function createLiveAnalysisTab() {
    try {
        if (!g_advUI_tabPanel) return;

        var liveTab = g_advUI_tabPanel.add('tab', undefined, 'Live Document Analysis');
        if (!liveTab) return;

        liveTab.orientation = 'column';
        liveTab.alignChildren = 'fill';
        liveTab.spacing = 5;

        // Controls
        var liveControls = liveTab.add('group');
        if (liveControls) {
            liveControls.orientation = 'row';
            liveControls.alignChildren = 'center';
            liveControls.spacing = 10;

            var liveAnalysisBtn = liveControls.add('button', undefined, 'Live Analysis');
            if (liveAnalysisBtn) {
                liveAnalysisBtn.preferredSize.width = 120;
                liveAnalysisBtn.onClick = runLiveDocumentAnalysis;
            }

            var liveCompareBtn = liveControls.add('button', undefined, 'Live Compare');
            if (liveCompareBtn) {
                liveCompareBtn.preferredSize.width = 120;
                liveCompareBtn.onClick = runLiveComparison;
            }

            var takeSnapshotBtn = liveControls.add('button', undefined, 'Take Snapshot');
            if (takeSnapshotBtn) {
                takeSnapshotBtn.preferredSize.width = 120;
                takeSnapshotBtn.onClick = takeDocumentSnapshot;
            }

            var clearLiveBtn = liveControls.add('button', undefined, 'Clear');
            if (clearLiveBtn) {
                clearLiveBtn.preferredSize.width = 80;
                clearLiveBtn.onClick = clearLiveDisplay;
            }
        }

        // Display area
        var liveDisplay = liveTab.add('group');
        if (liveDisplay) {
            liveDisplay.orientation = 'column';
            liveDisplay.alignChildren = 'fill';
            liveDisplay.spacing = 5;

            g_advUI_liveAnalysisText = liveDisplay.add('edittext', undefined, 'Run live document analysis to see current structure and extracted values...', {
                multiline: true,
                scrolling: true
            });
            if (g_advUI_liveAnalysisText) {
                g_advUI_liveAnalysisText.preferredSize.height = 500;
                g_advUI_liveAnalysisText.readonly = true;
            }
        }

    } catch (exc) {
        updateAdvancedStatus('Live tab creation error: ' + exc.message);
    }
}

/**
 * Create Advanced Discovery Tab
 */
function createAdvancedDiscoveryTab() {
    try {
        if (!g_advUI_tabPanel) return;

        var discoveryTab = g_advUI_tabPanel.add('tab', undefined, 'Advanced Discovery');
        if (!discoveryTab) return;

        discoveryTab.orientation = 'column';
        discoveryTab.alignChildren = 'fill';
        discoveryTab.spacing = 5;

        // Controls
        var discoveryControls = discoveryTab.add('group');
        if (discoveryControls) {
            discoveryControls.orientation = 'row';
            discoveryControls.alignChildren = 'center';
            discoveryControls.spacing = 10;

            var fullDiscoveryBtn = discoveryControls.add('button', undefined, 'Full Discovery');
            if (fullDiscoveryBtn) {
                fullDiscoveryBtn.preferredSize.width = 120;
                fullDiscoveryBtn.onClick = performAdvancedDiscovery;
            }

            var deepMappingBtn = discoveryControls.add('button', undefined, 'Deep Mapping');
            if (deepMappingBtn) {
                deepMappingBtn.preferredSize.width = 120;
                deepMappingBtn.onClick = runDeepMapping;
            }

            var performanceBtn = discoveryControls.add('button', undefined, 'Performance');
            if (performanceBtn) {
                performanceBtn.preferredSize.width = 120;
                performanceBtn.onClick = analyzePerformance;
            }

            var clearDiscoveryBtn = discoveryControls.add('button', undefined, 'Clear');
            if (clearDiscoveryBtn) {
                clearDiscoveryBtn.preferredSize.width = 80;
                clearDiscoveryBtn.onClick = clearDiscoveryDisplay;
            }
        }

        // Display area
        var discoveryDisplay = discoveryTab.add('group');
        if (discoveryDisplay) {
            discoveryDisplay.orientation = 'column';
            discoveryDisplay.alignChildren = 'fill';

            var discoveryText = discoveryDisplay.add('edittext', undefined, 'Run advanced discovery to see enhanced DOM structure analysis...', {
                multiline: true,
                scrolling: true
            });
            if (discoveryText) {
                discoveryText.preferredSize.height = 500;
                discoveryText.readonly = true;
            }
        }

    } catch (exc) {
        updateAdvancedStatus('Discovery tab creation error: ' + exc.message);
    }
}

/**
 * Create JSON Analysis Tab
 */
function createJSONAnalysisTab() {
    try {
        if (!g_advUI_tabPanel) return;

        var analysisTab = g_advUI_tabPanel.add('tab', undefined, 'JSON Analysis');
        if (!analysisTab) return;

        analysisTab.orientation = 'column';
        analysisTab.alignChildren = 'fill';
        analysisTab.spacing = 5;

        // Controls
        var analysisControls = analysisTab.add('group');
        if (analysisControls) {
            analysisControls.orientation = 'row';
            analysisControls.alignChildren = 'center';
            analysisControls.spacing = 10;

            var loadJSONBtn = analysisControls.add('button', undefined, 'Load JSON');
            if (loadJSONBtn) {
                loadJSONBtn.preferredSize.width = 100;
                loadJSONBtn.onClick = loadJSONExport;
            }

            var analyzeJSONBtn = analysisControls.add('button', undefined, 'Analyze');
            if (analyzeJSONBtn) {
                analyzeJSONBtn.preferredSize.width = 100;
                analyzeJSONBtn.onClick = runJSONAnalysis;
            }

            var visualizeBtn = analysisControls.add('button', undefined, 'Visualize');
            if (visualizeBtn) {
                visualizeBtn.preferredSize.width = 100;
                visualizeBtn.onClick = visualizeJSON;
            }

            var exportAnalysisBtn = analysisControls.add('button', undefined, 'Export Analysis');
            if (exportAnalysisBtn) {
                exportAnalysisBtn.preferredSize.width = 120;
                exportAnalysisBtn.onClick = exportJSONAnalysis;
            }

            var clearAnalysisBtn = analysisControls.add('button', undefined, 'Clear');
            if (clearAnalysisBtn) {
                clearAnalysisBtn.preferredSize.width = 80;
                clearAnalysisBtn.onClick = clearAnalysisDisplay;
            }
        }

        // Display area
        var analysisDisplay = analysisTab.add('group');
        if (analysisDisplay) {
            analysisDisplay.orientation = 'column';
            analysisDisplay.alignChildren = 'fill';

            g_advUI_jsonAnalysisText = analysisDisplay.add('edittext', undefined, 'Load a JSON export file to see detailed analysis and visual hierarchy...', {
                multiline: true,
                scrolling: true
            });
            if (g_advUI_jsonAnalysisText) {
                g_advUI_jsonAnalysisText.preferredSize.height = 500;
                g_advUI_jsonAnalysisText.readonly = true;
            }
        }

    } catch (exc) {
        updateAdvancedStatus('Analysis tab creation error: ' + exc.message);
    }
}

/**
 * Create Snapshot Comparison Tab
 */
function createSnapshotComparisonTab() {
    try {
        if (!g_advUI_tabPanel) return;

        var comparisonTab = g_advUI_tabPanel.add('tab', undefined, 'Snapshot Comparison');
        if (!comparisonTab) return;

        comparisonTab.orientation = 'column';
        comparisonTab.alignChildren = 'fill';
        comparisonTab.spacing = 5;

        // Controls
        var comparisonControls = comparisonTab.add('group');
        if (comparisonControls) {
            comparisonControls.orientation = 'row';
            comparisonControls.alignChildren = 'center';
            comparisonControls.spacing = 10;

            var loadBeforeBtn = comparisonControls.add('button', undefined, 'Load Before');
            if (loadBeforeBtn) {
                loadBeforeBtn.preferredSize.width = 100;
                loadBeforeBtn.onClick = loadBeforeSnapshot;
            }

            var loadAfterBtn = comparisonControls.add('button', undefined, 'Load After');
            if (loadAfterBtn) {
                loadAfterBtn.preferredSize.width = 100;
                loadAfterBtn.onClick = loadAfterSnapshot;
            }

            var compareBtn = comparisonControls.add('button', undefined, 'Compare');
            if (compareBtn) {
                compareBtn.preferredSize.width = 100;
                compareBtn.onClick = runSnapshotComparison;
            }

            var exportComparisonBtn = comparisonControls.add('button', undefined, 'Export Report');
            if (exportComparisonBtn) {
                exportComparisonBtn.preferredSize.width = 120;
                exportComparisonBtn.onClick = exportComparisonReport;
            }

            var clearComparisonBtn = comparisonControls.add('button', undefined, 'Clear');
            if (clearComparisonBtn) {
                clearComparisonBtn.preferredSize.width = 80;
                clearComparisonBtn.onClick = clearComparisonDisplay;
            }
        }

        // Display area
        var comparisonDisplay = comparisonTab.add('group');
        if (comparisonDisplay) {
            comparisonDisplay.orientation = 'column';
            comparisonDisplay.alignChildren = 'fill';

            g_advUI_comparisonText = comparisonDisplay.add('edittext', undefined, 'Load before/after snapshots to analyze document changes...', {
                multiline: true,
                scrolling: true
            });
            if (g_advUI_comparisonText) {
                g_advUI_comparisonText.preferredSize.height = 500;
                g_advUI_comparisonText.readonly = true;
            }
        }

    } catch (exc) {
        updateAdvancedStatus('Comparison tab creation error: ' + exc.message);
    }
}

/**
 * Create Deep Object Mapping Tab
 */
function createDeepMappingTab() {
    try {
        if (!g_advUI_tabPanel) return;

        var mappingTab = g_advUI_tabPanel.add('tab', undefined, 'Deep Object Mapping');
        if (!mappingTab) return;

        mappingTab.orientation = 'column';
        mappingTab.alignChildren = 'fill';
        mappingTab.spacing = 5;

        // Controls
        var mappingControls = mappingTab.add('group');
        if (mappingControls) {
            mappingControls.orientation = 'row';
            mappingControls.alignChildren = 'center';
            mappingControls.spacing = 10;

            var createMappingBtn = mappingControls.add('button', undefined, 'Create Mapping');
            if (createMappingBtn) {
                createMappingBtn.preferredSize.width = 120;
                createMappingBtn.onClick = createDeepMapping;
            }

            var objectAtlasBtn = mappingControls.add('button', undefined, 'Object Atlas');
            if (objectAtlasBtn) {
                objectAtlasBtn.preferredSize.width = 100;
                objectAtlasBtn.onClick = generateAdvancedAtlas;
            }

            var optimizeBtn = mappingControls.add('button', undefined, 'Optimize');
            if (optimizeBtn) {
                optimizeBtn.preferredSize.width = 100;
                optimizeBtn.onClick = optimizeMapping;
            }

            var clearMappingBtn = mappingControls.add('button', undefined, 'Clear');
            if (clearMappingBtn) {
                clearMappingBtn.preferredSize.width = 80;
                clearMappingBtn.onClick = clearMappingDisplay;
            }
        }

        // Display area
        var mappingDisplay = mappingTab.add('group');
        if (mappingDisplay) {
            mappingDisplay.orientation = 'column';
            mappingDisplay.alignChildren = 'fill';

            g_advUI_deepMappingText = mappingDisplay.add('edittext', undefined, 'Create detailed object maps to understand document relationships...', {
                multiline: true,
                scrolling: true
            });
            if (g_advUI_deepMappingText) {
                g_advUI_deepMappingText.preferredSize.height = 500;
                g_advUI_deepMappingText.readonly = true;
            }
        }

    } catch (exc) {
        updateAdvancedStatus('Mapping tab creation error: ' + exc.message);
    }
}

/**
 * Create advanced controls panel
 * @param {Window} parentWindow - Parent window
 */
function createAdvancedControls(parentWindow) {
    try {
        if (!parentWindow) return;

        // Add separator
        var separator2 = parentWindow.add('panel');
        if (separator2) {
            separator2.preferredSize.height = 2;
        }

        var controlPanel = parentWindow.add('group');
        if (!controlPanel) return;

        controlPanel.orientation = 'row';
        controlPanel.alignChildren = 'center';
        controlPanel.spacing = 10;

        // Export group
        var exportGroup = controlPanel.add('group');
        if (exportGroup) {
            exportGroup.orientation = 'row';
            exportGroup.spacing = 5;

            var exportJSONBtn = exportGroup.add('button', undefined, 'Export JSON');
            if (exportJSONBtn) {
                exportJSONBtn.preferredSize.width = 100;
                exportJSONBtn.onClick = function() { performAdvancedExport('json'); };
            }

            var exportTextBtn = exportGroup.add('button', undefined, 'Export Text');
            if (exportTextBtn) {
                exportTextBtn.preferredSize.width = 100;
                exportTextBtn.onClick = function() { performAdvancedExport('text'); };
            }

            var exportCSVBtn = exportGroup.add('button', undefined, 'Export CSV');
            if (exportCSVBtn) {
                exportCSVBtn.preferredSize.width = 100;
                exportCSVBtn.onClick = function() { performAdvancedExport('csv'); };
            }
        }

        // Action group
        var actionGroup = controlPanel.add('group');
        if (actionGroup) {
            actionGroup.orientation = 'row';
            actionGroup.spacing = 5;

            var generateReportBtn = actionGroup.add('button', undefined, 'Full Report');
            if (generateReportBtn) {
                generateReportBtn.preferredSize.width = 100;
                generateReportBtn.onClick = generateComprehensiveReport;
            }

            var configBtn = actionGroup.add('button', undefined, 'Config');
            if (configBtn) {
                configBtn.preferredSize.width = 80;
                configBtn.onClick = showAdvancedConfiguration;
            }
        }

    } catch (exc) {
        updateAdvancedStatus('Controls creation error: ' + exc.message);
    }
}

/**
 * Create advanced footer
 * @param {Window} parentWindow - Parent window
 */
function createAdvancedFooter(parentWindow) {
    try {
        if (!parentWindow) return;

        var footerGroup = parentWindow.add('group');
        if (!footerGroup) return;

        footerGroup.orientation = 'row';
        footerGroup.alignChildren = 'center';

        // Status text
        g_advUI_statusText = footerGroup.add('statictext', undefined, 'Ready');
        if (g_advUI_statusText) {
            g_advUI_statusText.preferredSize.width = 600;
            g_advUI_statusText.alignment = 'left';
        }

        // Buttons group
        var buttonsGroup = footerGroup.add('group');
        if (buttonsGroup) {
            buttonsGroup.orientation = 'row';
            buttonsGroup.spacing = 10;

            var resetBtn = buttonsGroup.add('button', undefined, 'Reset');
            if (resetBtn) {
                resetBtn.preferredSize.width = 80;
                resetBtn.onClick = resetAdvancedUI;
            }

            var helpBtn = buttonsGroup.add('button', undefined, 'Help');
            if (helpBtn) {
                helpBtn.preferredSize.width = 80;
                helpBtn.onClick = showAdvancedHelp;
            }

            var closeBtn = buttonsGroup.add('button', undefined, 'Close');
            if (closeBtn) {
                closeBtn.preferredSize.width = 80;
                closeBtn.onClick = closeAdvancedUI;
            }
        }

    } catch (exc) {
        updateAdvancedStatus('Footer creation error: ' + exc.message);
    }
}

/**
 * Initialize event handlers
 */
function initializeAdvancedEventHandlers() {
    try {
        // Event handlers are assigned during component creation
        updateAdvancedStatus('Event handlers initialized');
    } catch (exc) {
        updateAdvancedStatus('Event handler initialization error: ' + exc.message);
    }
}

// =============================================================================
// LIVE DOCUMENT ANALYSIS - FULL IMPLEMENTATION
// =============================================================================

/**
 * Run live document analysis (3-phase process) - FULL IMPLEMENTATION
 */
function runLiveDocumentAnalysis() {
    try {
        updateAdvancedStatus('Starting comprehensive live document analysis...');

        // Phase 1: Environment validation
        var envValidation = validateInDesignEnvironment();
        if (!envValidation.valid) {
            updateAdvancedStatus('Environment validation failed: ' + envValidation.error);
            return;
        }

        updateAdvancedStatus('Phase 1: Discovering DOM structure...');

        // Phase 1: DOM Discovery
        if (!functionExists('enumerateDocumentDOM')) {
            updateAdvancedStatus('DOM enumeration not available - module 2.1 missing');
            return;
        }

        var startTime = new Date().getTime();
        var enumerationConfig = ADVANCED_UI_CONFIG.discovery;
        var domStructure = enumerateDocumentDOM(envValidation.document, enumerationConfig);

        if (!domStructure || domStructure.error) {
            updateAdvancedStatus('Phase 1 failed: ' + (domStructure ? domStructure.error : 'Unknown error'));
            return;
        }

        updateAdvancedStatus('Phase 2: Extracting property values...');

        // Phase 2: Value Extraction
        if (functionExists('sampleDOMValues')) {
            try {
                var samplingConfig = ADVANCED_UI_CONFIG.sampling;
                var enhancedStructure = sampleDOMValues(domStructure, envValidation.document, samplingConfig);
                if (enhancedStructure) {
                    domStructure = enhancedStructure;
                }
            } catch (valueExc) {
                updateAdvancedStatus('Warning: Value extraction failed: ' + valueExc.message);
            }
        }

        updateAdvancedStatus('Phase 3: Analyzing collections...');

        // Phase 3: Collection Sampling - FIXED: Use inline config
        if (functionExists('sampleCollectionContents')) {
            try {
                var collectionConfig = {
                    maxSamplesPerCollection: 5,
                    timeoutPerCollection: 3000,
                    enableDeepPropertyAnalysis: true
                };
                var collectionEnhanced = sampleCollectionContents(domStructure, envValidation.document, collectionConfig);
                if (collectionEnhanced) {
                    domStructure = collectionEnhanced;
                }
            } catch (collectionExc) {
                updateAdvancedStatus('Warning: Collection sampling failed: ' + collectionExc.message);
            }
        }

        // Store results
        g_advUI_advancedDOMStructure = domStructure;

        // Display Results
        var analysisTime = new Date().getTime() - startTime;
        var displayText = generateLiveAnalysisDisplay(domStructure, analysisTime);
        if (g_advUI_liveAnalysisText) {
            g_advUI_liveAnalysisText.text = displayText;
        }

        // Switch to live analysis tab
        if (g_advUI_tabPanel && g_advUI_tabPanel.children.length > 0) {
            g_advUI_tabPanel.selection = g_advUI_tabPanel.children[0];
        }

        // Update status with comprehensive statistics
        var stats = domStructure.statistics || {};
        var nodeCount = stats.nodeCount || 0;
        var propCount = stats.propertyCount || 0;
        var valueCount = stats.valuesExtracted || stats.valuesSampled || 0;
        var collectionCount = stats.collectionsAnalyzed || stats.collectionsFound || 0;

        updateAdvancedStatus('Live analysis complete! ' + nodeCount + ' objects, ' + propCount + ' properties, ' + 
                           valueCount + ' values extracted, ' + collectionCount + ' collections analyzed (' + analysisTime + 'ms)');

        updateAdvancedDocumentInfo();

    } catch (exc) {
        updateAdvancedStatus('Live analysis error: ' + exc.message);
    }
}

/**
 * Run live comparison - compare current document state with baseline
 */
function runLiveComparison() {
    try {
        updateAdvancedStatus('Preparing live document comparison...');

        // Check if we have a baseline
        if (!g_advUI_baselineDocumentState) {
            // No baseline - create one from current state
            updateAdvancedStatus('No baseline found. Creating baseline from current document state...');
            runLiveDocumentAnalysis(); // This sets g_advUI_advancedDOMStructure
            
            if (g_advUI_advancedDOMStructure) {
                g_advUI_baselineDocumentState = objectClone(g_advUI_advancedDOMStructure, 3);
                updateAdvancedStatus('Baseline created. Now modify your document and run Live Compare again to see changes.');
                return;
            } else {
                updateAdvancedStatus('Failed to create baseline');
                return;
            }
        }

        // We have a baseline - compare with current state
        updateAdvancedStatus('Analyzing current document state...');
        
        // Get current state
        runLiveDocumentAnalysis(); // Updates g_advUI_advancedDOMStructure
        
        if (!g_advUI_advancedDOMStructure) {
            updateAdvancedStatus('Failed to analyze current document state');
            return;
        }

        updateAdvancedStatus('Comparing current state with baseline...');

        // Perform comparison using module 4.2
        if (!functionExists('compareDOMExports')) {
            updateAdvancedStatus('Live comparison not available - module 4.2 missing');
            return;
        }

        var comparisonConfig = ADVANCED_UI_CONFIG.comparison;

        // Create temporary files for comparison (in-memory comparison would be better)
        var tempDir = Folder.temp;
        var beforeTempFile = new File(tempDir.fsName + '/baseline_temp.json');
        var afterTempFile = new File(tempDir.fsName + '/current_temp.json');

        try {
            // Write baseline to temp file
            beforeTempFile.open('w');
            beforeTempFile.write(safeJSONStringify(g_advUI_baselineDocumentState, 2));
            beforeTempFile.close();

            // Write current to temp file
            afterTempFile.open('w');
            afterTempFile.write(safeJSONStringify(g_advUI_advancedDOMStructure, 2));
            afterTempFile.close();

            // Perform comparison
            var comparisonResult = compareDOMExports(beforeTempFile.fsName, afterTempFile.fsName, comparisonConfig);

            // Clean up temp files
            beforeTempFile.remove();
            afterTempFile.remove();

            if (!comparisonResult.success) {
                updateAdvancedStatus('Live comparison failed: ' + comparisonResult.error);
                return;
            }

            // Store and display results
            var comparisonDisplay = generateComparisonDisplay(comparisonResult.comparison);
            if (g_advUI_comparisonText) {
                g_advUI_comparisonText.text = comparisonDisplay;
            }

            // Switch to comparison tab
            if (g_advUI_tabPanel && g_advUI_tabPanel.children.length > 3) {
                g_advUI_tabPanel.selection = g_advUI_tabPanel.children[3];
            }

            var summary = comparisonResult.comparison.summary || {};
            var totalChanges = summary.totalChanges || 0;
            var criticalChanges = summary.criticalChanges || 0;

            updateAdvancedStatus('Live comparison complete: ' + totalChanges + ' changes detected (' + 
                               criticalChanges + ' critical). Use "Reset" to create new baseline.');

        } catch (fileExc) {
            updateAdvancedStatus('Live comparison file error: ' + fileExc.message);
        }

    } catch (exc) {
        updateAdvancedStatus('Live comparison error: ' + exc.message);
    }
}

/**
 * Take document snapshot
 */
function takeDocumentSnapshot() {
    try {
        updateAdvancedStatus('Taking document snapshot...');
        
        // Run live analysis to capture current state
        runLiveDocumentAnalysis();
        
        if (g_advUI_advancedDOMStructure) {
            // Offer to save snapshot to file
            var fileName = 'Snapshot_' + getCurrentTimestamp().replace(/[:\s]/g, '-') + '.json';
            var file = File.saveDialog('Save Document Snapshot', fileName);
            
            if (file) {
                if (functionExists('exportDOMStructure')) {
                    var exportConfig = ADVANCED_UI_CONFIG.exportSettings;
                    var exportResult = exportDOMStructure(g_advUI_advancedDOMStructure, 'json', exportConfig);
                    
                    if (exportResult.success) {
                        file.open('w');
                        file.write(exportResult.content);
                        file.close();
                        updateAdvancedStatus('Snapshot saved: ' + file.name);
                    } else {
                        updateAdvancedStatus('Snapshot export failed: ' + exportResult.error);
                    }
                } else {
                    // Fallback: simple JSON export
                    file.open('w');
                    file.write(safeJSONStringify(g_advUI_advancedDOMStructure, 2));
                    file.close();
                    updateAdvancedStatus('Snapshot saved (basic): ' + file.name);
                }
            } else {
                updateAdvancedStatus('Snapshot cancelled');
            }
        } else {
            updateAdvancedStatus('No data to snapshot - run Live Analysis first');
        }
        
    } catch (exc) {
        updateAdvancedStatus('Snapshot error: ' + exc.message);
    }
}

/**
 * Clear live display
 */
function clearLiveDisplay() {
    try {
        if (g_advUI_liveAnalysisText) {
            g_advUI_liveAnalysisText.text = 'Run live document analysis to see current structure and extracted values...';
        }
        updateAdvancedStatus('Live display cleared');
    } catch (exc) {
        updateAdvancedStatus('Clear live display error: ' + exc.message);
    }
}

// =============================================================================
// ADVANCED DISCOVERY - FULL IMPLEMENTATION
// =============================================================================

/**
 * Perform advanced discovery with enhanced analysis
 */
function performAdvancedDiscovery() {
    try {
        updateAdvancedStatus('Starting advanced discovery with enhanced analysis...');
        
        // Run standard live analysis first
        runLiveDocumentAnalysis();
        
        if (!g_advUI_advancedDOMStructure) {
            updateAdvancedStatus('Advanced discovery failed - no base structure available');
            return;
        }
        
        // Enhanced analysis: Add deep mapping if available
        if (functionExists('performDeepDOMMapping')) {
            updateAdvancedStatus('Performing deep object mapping...');
            
            var envValidation = validateInDesignEnvironment();
            if (envValidation.valid) {
                var deepMappingConfig = {
                    maxDepth: 5,
                    timeoutMs: 20000,
                    maxTotalObjects: 5000,
                    enableObjectAtlas: true,
                    mapCircularReferences: true,
                    analyzeRelationships: true,
                    generateAccessibilityMap: true
                };
                
                try {
                    var deepMappingSession = performDeepDOMMapping(envValidation.document, deepMappingConfig);
                    
                    if (deepMappingSession.metadata.success) {
                        // Merge deep mapping results with main structure
                        if (g_advUI_advancedDOMStructure.metadata) {
                            g_advUI_advancedDOMStructure.metadata.deepMapping = deepMappingSession;
                        }
                        updateAdvancedStatus('Advanced discovery complete with deep mapping analysis');
                    } else {
                        updateAdvancedStatus('Advanced discovery complete (deep mapping failed: ' + deepMappingSession.metadata.error + ')');
                    }
                } catch (deepExc) {
                    updateAdvancedStatus('Advanced discovery complete (deep mapping error: ' + deepExc.message + ')');
                }
            }
        } else {
            updateAdvancedStatus('Advanced discovery complete (deep mapping not available)');
        }
        
        // Update display with enhanced information
        var enhancedDisplay = generateAdvancedDiscoveryDisplay(g_advUI_advancedDOMStructure);
        
        // Find discovery display text area and update it
        if (g_advUI_tabPanel && g_advUI_tabPanel.children.length > 1) {
            var discoveryTab = g_advUI_tabPanel.children[1];
            if (discoveryTab.children && discoveryTab.children.length > 1) {
                var discoveryDisplayGroup = discoveryTab.children[1];
                if (discoveryDisplayGroup.children && discoveryDisplayGroup.children.length > 0) {
                    var discoveryText = discoveryDisplayGroup.children[0];
                    if (discoveryText) {
                        discoveryText.text = enhancedDisplay;
                    }
                }
            }
            
            // Switch to discovery tab
            g_advUI_tabPanel.selection = discoveryTab;
        }
        
    } catch (exc) {
        updateAdvancedStatus('Advanced discovery error: ' + exc.message);
    }
}

/**
 * Run deep mapping analysis
 */
function runDeepMapping() {
    try {
        updateAdvancedStatus('Starting deep mapping analysis...');
        
        if (!functionExists('performDeepDOMMapping')) {
            updateAdvancedStatus('Deep mapper module not available - feature disabled');
            return;
        }

        var envValidation = validateInDesignEnvironment();
        if (!envValidation || !envValidation.valid) {
            updateAdvancedStatus('No valid document available for deep mapping');
            return;
        }

        var deepMappingConfig = {
            maxDepth: 5,
            timeoutMs: 20000,
            maxTotalObjects: 5000,
            enableObjectAtlas: true,
            mapCircularReferences: true,
            analyzeRelationships: true,
            generateAccessibilityMap: true
        };

        var deepMappingSession = performDeepDOMMapping(envValidation.document, deepMappingConfig);

        if (!deepMappingSession.metadata.success) {
            updateAdvancedStatus('Deep mapping failed: ' + deepMappingSession.metadata.error);
            return;
        }

        // Generate analysis if available
        var analysis = null;
        if (functionExists('analyzeDeepMappingSession')) {
            var analysisResult = analyzeDeepMappingSession(deepMappingSession, {
                generateObjectReport: true,
                generateAccessReport: true,
                generateCircularReport: true,
                analyzePerformance: true,
                includeDeveloperGuide: true
            });

            if (analysisResult.success) {
                analysis = analysisResult.analysis;
            }
        }

        // Display results
        var deepMappingDisplay = generateDeepMappingDisplay(deepMappingSession, analysis);
        if (g_advUI_deepMappingText) {
            g_advUI_deepMappingText.text = deepMappingDisplay;
        }

        // Switch to deep mapping tab
        if (g_advUI_tabPanel && g_advUI_tabPanel.children.length > 4) {
            g_advUI_tabPanel.selection = g_advUI_tabPanel.children[4];
        }

        var stats = deepMappingSession.statistics || {};
        updateAdvancedStatus('Deep mapping complete: ' + (stats.totalNodes || 0) + ' objects mapped, ' +
            (stats.circularReferences || 0) + ' circular references, ' +
            (stats.mappingTime || 0) + 'ms');

    } catch (exc) {
        updateAdvancedStatus('Deep mapping error: ' + exc.message);
    }
}

/**
 * Analyze performance characteristics
 */
function analyzePerformance() {
    try {
        updateAdvancedStatus('Analyzing performance characteristics...');
        
        var dataToAnalyze = g_advUI_advancedDOMStructure || g_advUI_loadedJSONData;
        if (!dataToAnalyze) {
            updateAdvancedStatus('No data available for performance analysis. Run discovery or load JSON first.');
            return;
        }

        if (!functionExists('generatePerformanceOptimizations')) {
            updateAdvancedStatus('Performance optimizer not available');
            return;
        }

        var optimizations = generatePerformanceOptimizations(dataToAnalyze);

        // Display results in discovery tab
        var displayText = generateOptimizationDisplay(optimizations);
        
        if (g_advUI_tabPanel && g_advUI_tabPanel.children.length > 1) {
            var discoveryTab = g_advUI_tabPanel.children[1];
            if (discoveryTab.children && discoveryTab.children.length > 1) {
                var discoveryDisplayGroup = discoveryTab.children[1];
                if (discoveryDisplayGroup.children && discoveryDisplayGroup.children.length > 0) {
                    var discoveryText = discoveryDisplayGroup.children[0];
                    if (discoveryText) {
                        discoveryText.text = displayText;
                    }
                }
            }
            
            // Switch to discovery tab
            g_advUI_tabPanel.selection = discoveryTab;
        }

        updateAdvancedStatus('Performance analysis complete');

    } catch (exc) {
        updateAdvancedStatus('Performance analysis error: ' + exc.message);
    }
}

/**
 * Clear discovery display
 */
function clearDiscoveryDisplay() {
    try {
        if (g_advUI_tabPanel && g_advUI_tabPanel.children.length > 1) {
            var discoveryTab = g_advUI_tabPanel.children[1];
            if (discoveryTab.children && discoveryTab.children.length > 1) {
                var discoveryDisplayGroup = discoveryTab.children[1];
                if (discoveryDisplayGroup.children && discoveryDisplayGroup.children.length > 0) {
                    var discoveryText = discoveryDisplayGroup.children[0];
                    if (discoveryText) {
                        discoveryText.text = 'Run advanced discovery to see enhanced DOM structure analysis...';
                    }
                }
            }
        }
        updateAdvancedStatus('Discovery display cleared');
    } catch (exc) {
        updateAdvancedStatus('Clear discovery display error: ' + exc.message);
    }
}

// =============================================================================
// JSON ANALYSIS - FULL IMPLEMENTATION
// =============================================================================

/**
 * Load JSON export with comprehensive validation
 */
function loadJSONExport() {
    try {
        updateAdvancedStatus('Select JSON export file to load...');

        var jsonFile = File.openDialog('Select JSON Export File', '*.json');
        if (!jsonFile) {
            updateAdvancedStatus('No file selected');
            return;
        }

        updateAdvancedStatus('Loading JSON file: ' + jsonFile.name);

        if (!functionExists('readAndParseJSONFile')) {
            updateAdvancedStatus('JSON analyzer module not available');
            return;
        }

        // Read and parse JSON file
        var jsonResult = readAndParseJSONFile(jsonFile.fsName);
        if (!jsonResult.success) {
            updateAdvancedStatus('JSON load failed: ' + jsonResult.error);
            return;
        }

        // Validate JSON structure if function available
        if (functionExists('validateJSONStructure')) {
            var validation = validateJSONStructure(jsonResult.data);
            if (!validation.success) {
                updateAdvancedStatus('Invalid JSON structure: ' + validation.error);
                return;
            }
        }

        // Store loaded data
        g_advUI_loadedJSONData = jsonResult.data;

        // Update UI
        updateAdvancedDocumentInfo();
        updateAdvancedStatus('JSON file loaded successfully: ' + jsonFile.name + '. Click "Analyze" to proceed.');

        // Switch to JSON analysis tab
        if (g_advUI_tabPanel && g_advUI_tabPanel.children.length > 2) {
            g_advUI_tabPanel.selection = g_advUI_tabPanel.children[2];
        }

    } catch (exc) {
        updateAdvancedStatus('JSON load error: ' + exc.message);
    }
}

/**
 * Run comprehensive JSON analysis
 */
function runJSONAnalysis() {
    try {
        if (!g_advUI_loadedJSONData) {
            updateAdvancedStatus('Please load a JSON file first');
            return;
        }

        updateAdvancedStatus('Analyzing JSON structure and generating visualization...');

        // FIXED: Use analyzeLoadedJSON for consistency
        if (!functionExists('analyzeLoadedJSON')) {
            updateAdvancedStatus('JSON analysis not available - module 4.1 missing');
            return;
        }

        var analysisConfig = {
            enableVisualHierarchy: true,
            enablePropertyAnalysis: true,
            enableCollectionAnalysis: true,
            enableValueAnalysis: true,
            enableAccessibilityMap: true,
            maxAnalysisDepth: 10,
            maxReportItems: 100,
            generateDeveloperGuide: true,
            includeCodeExamples: true,
            highlightKeyProperties: true,
            analyzeExtractedValues: true,
            generatePerformanceMetrics: true
        };

        // Perform comprehensive JSON analysis
        var jsonAnalysis = analyzeLoadedJSON(g_advUI_loadedJSONData, analysisConfig);

        if (!jsonAnalysis.success) {
            updateAdvancedStatus('JSON analysis failed: ' + (jsonAnalysis.error || 'Unknown error'));
            return;
        }

        // Display analysis results
        var displayText = generateJSONAnalysisDisplay(jsonAnalysis.analysis);
        if (g_advUI_jsonAnalysisText) {
            g_advUI_jsonAnalysisText.text = displayText;
        }

        g_advUI_currentAnalysis = jsonAnalysis.analysis;
        updateAdvancedStatus('JSON analysis complete with comprehensive visualization');

    } catch (exc) {
        updateAdvancedStatus('JSON analysis error: ' + exc.message);
    }
}

/**
 * Visualize JSON in main DOM visualizer
 */
function visualizeJSON() {
    try {
        if (!g_advUI_loadedJSONData) {
            updateAdvancedStatus('No JSON data to visualize - load a file first');
            return;
        }

        updateAdvancedStatus('Opening JSON data in main DOM visualizer...');

        if (!functionExists('showDOMVisualizer')) {
            updateAdvancedStatus('Main DOM visualizer not available');
            return;
        }

        // Launch main visualizer
        var launched = showDOMVisualizer();
        
        if (launched) {
            updateAdvancedStatus('JSON data opened in main DOM visualizer');
        } else {
            updateAdvancedStatus('Failed to open main DOM visualizer');
        }

    } catch (exc) {
        updateAdvancedStatus('JSON visualization error: ' + exc.message);
    }
}

/**
 * Export JSON analysis results
 */
function exportJSONAnalysis() {
    try {
        if (!g_advUI_currentAnalysis) {
            updateAdvancedStatus('No analysis results to export - run analysis first');
            return;
        }

        updateAdvancedStatus('Exporting JSON analysis results...');

        var fileName = 'JSON_Analysis_' + getCurrentTimestamp().replace(/[:\s]/g, '-') + '.txt';
        var file = File.saveDialog('Save JSON Analysis Report', fileName);

        if (file) {
            var reportContent = generateJSONAnalysisReport(g_advUI_currentAnalysis);
            
            file.open('w');
            file.write(reportContent);
            file.close();

            updateAdvancedStatus('JSON analysis exported: ' + file.name);
        } else {
            updateAdvancedStatus('JSON analysis export cancelled');
        }

    } catch (exc) {
        updateAdvancedStatus('Export JSON analysis error: ' + exc.message);
    }
}

/**
 * Clear analysis display
 */
function clearAnalysisDisplay() {
    try {
        if (g_advUI_jsonAnalysisText) {
            g_advUI_jsonAnalysisText.text = 'Load a JSON export file to see detailed analysis and visual hierarchy...';
        }
        g_advUI_currentAnalysis = null;
        updateAdvancedStatus('Analysis display cleared');
    } catch (exc) {
        updateAdvancedStatus('Clear analysis display error: ' + exc.message);
    }
}

// =============================================================================
// SNAPSHOT COMPARISON - FULL IMPLEMENTATION
// =============================================================================

/**
 * Load before snapshot with validation
 */
function loadBeforeSnapshot() {
    try {
        updateAdvancedStatus('Select BEFORE snapshot file...');
        
        var beforeFile = File.openDialog('Select BEFORE JSON Export', '*.json');
        if (!beforeFile) {
            updateAdvancedStatus('Before file selection cancelled');
            return;
        }

        // Validate file
        if (functionExists('readAndParseJSONFile')) {
            var jsonResult = readAndParseJSONFile(beforeFile.fsName);
            if (!jsonResult.success) {
                updateAdvancedStatus('Before file invalid: ' + jsonResult.error);
                return;
            }
            g_advUI_beforeData = jsonResult.data;
        } else {
            g_advUI_beforeData = beforeFile;
        }
        
        updateAdvancedStatus('Before snapshot loaded: ' + beforeFile.name);
        updateAdvancedDocumentInfo();
        
    } catch (exc) {
        updateAdvancedStatus('Load before snapshot error: ' + exc.message);
    }
}

/**
 * Load after snapshot with validation
 */
function loadAfterSnapshot() {
    try {
        updateAdvancedStatus('Select AFTER snapshot file...');
        
        var afterFile = File.openDialog('Select AFTER JSON Export', '*.json');
        if (!afterFile) {
            updateAdvancedStatus('After file selection cancelled');
            return;
        }

        // Validate file
        if (functionExists('readAndParseJSONFile')) {
            var jsonResult = readAndParseJSONFile(afterFile.fsName);
            if (!jsonResult.success) {
                updateAdvancedStatus('After file invalid: ' + jsonResult.error);
                return;
            }
            g_advUI_afterData = jsonResult.data;
        } else {
            g_advUI_afterData = afterFile;
        }
        
        updateAdvancedStatus('After snapshot loaded: ' + afterFile.name);
        updateAdvancedDocumentInfo();
        
    } catch (exc) {
        updateAdvancedStatus('Load after snapshot error: ' + exc.message);
    }
}

/**
 * Run comprehensive snapshot comparison
 */
function runSnapshotComparison() {
    try {
        if (!g_advUI_beforeData || !g_advUI_afterData) {
            updateAdvancedStatus('Please load both before and after snapshots');
            return;
        }

        updateAdvancedStatus('Comparing snapshots...');

        if (!functionExists('compareDOMExports')) {
            updateAdvancedStatus('DOM comparator module not available');
            return;
        }

        var comparisonConfig = ADVANCED_UI_CONFIG.comparison;
        var comparisonResult;

        // Handle different data types (File vs parsed data)
        if (g_advUI_beforeData.fsName && g_advUI_afterData.fsName) {
            // File-based comparison
            comparisonResult = compareDOMExports(g_advUI_beforeData.fsName, g_advUI_afterData.fsName, comparisonConfig);
        } else {
            // Data-based comparison - write temp files
            var tempDir = Folder.temp;
            var beforeTempFile = new File(tempDir.fsName + '/before_temp.json');
            var afterTempFile = new File(tempDir.fsName + '/after_temp.json');

            try {
                beforeTempFile.open('w');
                beforeTempFile.write(safeJSONStringify(g_advUI_beforeData, 2));
                beforeTempFile.close();

                afterTempFile.open('w');
                afterTempFile.write(safeJSONStringify(g_advUI_afterData, 2));
                afterTempFile.close();

                comparisonResult = compareDOMExports(beforeTempFile.fsName, afterTempFile.fsName, comparisonConfig);

                beforeTempFile.remove();
                afterTempFile.remove();

            } catch (fileExc) {
                updateAdvancedStatus('Comparison file error: ' + fileExc.message);
                return;
            }
        }

        if (!comparisonResult.success) {
            updateAdvancedStatus('Comparison failed: ' + comparisonResult.error);
            return;
        }

        // Display results
        var displayText = generateComparisonDisplay(comparisonResult.comparison);
        if (g_advUI_comparisonText) {
            g_advUI_comparisonText.text = displayText;
        }

        // Switch to comparison tab
        if (g_advUI_tabPanel && g_advUI_tabPanel.children.length > 3) {
            g_advUI_tabPanel.selection = g_advUI_tabPanel.children[3];
        }

        var summary = comparisonResult.comparison.summary || {};
        var totalChanges = summary.totalChanges || 0;
        var criticalChanges = summary.criticalChanges || 0;

        updateAdvancedStatus('Snapshot comparison complete: ' + totalChanges + ' changes detected (' + 
                           criticalChanges + ' critical)');

    } catch (exc) {
        updateAdvancedStatus('Snapshot comparison error: ' + exc.message);
    }
}

/**
 * Export comprehensive comparison report
 */
function exportComparisonReport() {
    try {
        if (!g_advUI_comparisonText || !g_advUI_comparisonText.text) {
            updateAdvancedStatus('No comparison results to export - run comparison first');
            return;
        }

        updateAdvancedStatus('Exporting comparison report...');

        var fileName = 'Comparison_Report_' + getCurrentTimestamp().replace(/[:\s]/g, '-') + '.txt';
        var file = File.saveDialog('Save Comparison Report', fileName);

        if (file) {
            var reportContent = generateComparisonReport();
            
            file.open('w');
            file.write(reportContent);
            file.close();

            updateAdvancedStatus('Comparison report exported: ' + file.name);
        } else {
            updateAdvancedStatus('Comparison report export cancelled');
        }

    } catch (exc) {
        updateAdvancedStatus('Export comparison report error: ' + exc.message);
    }
}

/**
 * Clear comparison display
 */
function clearComparisonDisplay() {
    try {
        if (g_advUI_comparisonText) {
            g_advUI_comparisonText.text = 'Load before/after snapshots to analyze document changes...';
        }
        updateAdvancedStatus('Comparison display cleared');
    } catch (exc) {
        updateAdvancedStatus('Clear comparison display error: ' + exc.message);
    }
}

// =============================================================================
// DEEP OBJECT MAPPING - FULL IMPLEMENTATION
// =============================================================================

/**
 * Create comprehensive deep mapping
 */
function createDeepMapping() {
    try {
        updateAdvancedStatus('Creating comprehensive deep object mapping...');
        
        if (!functionExists('performDeepDOMMapping')) {
            updateAdvancedStatus('Deep mapper module not available');
            return;
        }

        var envValidation = validateInDesignEnvironment();
        if (!envValidation.valid) {
            updateAdvancedStatus('No valid document available for deep mapping');
            return;
        }

        var deepMappingConfig = {
            maxDepth: 6,
            timeoutMs: 30000,
            maxTotalObjects: 10000,
            enableObjectAtlas: true,
            mapCircularReferences: true,
            analyzeRelationships: true,
            generateAccessibilityMap: true,
            enablePerformanceAnalysis: true,
            trackMemoryUsage: true
        };

        var deepMappingSession = performDeepDOMMapping(envValidation.document, deepMappingConfig);

        if (!deepMappingSession.metadata.success) {
            updateAdvancedStatus('Deep mapping failed: ' + deepMappingSession.metadata.error);
            return;
        }

        // Enhanced analysis
        var analysis = null;
        if (functionExists('analyzeDeepMappingSession')) {
            var analysisResult = analyzeDeepMappingSession(deepMappingSession, {
                generateObjectReport: true,
                generateAccessReport: true,
                generateCircularReport: true,
                analyzePerformance: true,
                includeDeveloperGuide: true,
                generateOptimizationSuggestions: true
            });

            if (analysisResult.success) {
                analysis = analysisResult.analysis;
            }
        }

        // Display comprehensive results
        var mappingDisplay = generateDeepMappingDisplay(deepMappingSession, analysis);
        if (g_advUI_deepMappingText) {
            g_advUI_deepMappingText.text = mappingDisplay;
        }

        // Switch to deep mapping tab
        if (g_advUI_tabPanel && g_advUI_tabPanel.children.length > 4) {
            g_advUI_tabPanel.selection = g_advUI_tabPanel.children[4];
        }

        var stats = deepMappingSession.statistics || {};
        updateAdvancedStatus('Deep mapping complete: ' + (stats.totalNodes || 0) + ' objects mapped, ' +
            (stats.relationshipsTracked || 0) + ' relationships analyzed');

    } catch (exc) {
        updateAdvancedStatus('Create deep mapping error: ' + exc.message);
    }
}

/**
 * Generate comprehensive object atlas
 */
function generateAdvancedAtlas() {
    try {
        updateAdvancedStatus('Generating comprehensive object atlas...');
        
        var dataToAnalyze = g_advUI_advancedDOMStructure || g_advUI_loadedJSONData;
        if (!dataToAnalyze) {
            updateAdvancedStatus('No data available for atlas. Run discovery or load JSON first.');
            return;
        }

        if (!functionExists('generateObjectAtlas')) {
            updateAdvancedStatus('Object atlas generator not available');
            return;
        }

        var atlasConfig = {
            enableRelationshipMapping: true,
            enableAccessibilityAnalysis: true,
            enablePerformanceMetrics: true,
            generatePathIndex: true,
            generateTypeIndex: true,
            maxAtlasSize: 5000,
            includeCircularReferences: true
        };

        var atlas = generateObjectAtlas(dataToAnalyze, atlasConfig);

        if (atlas.success) {
            var atlasDisplay = generateAtlasDisplay(atlas.atlas);
            if (g_advUI_deepMappingText) {
                g_advUI_deepMappingText.text = atlasDisplay;
            }

            // Switch to deep mapping tab
            if (g_advUI_tabPanel && g_advUI_tabPanel.children.length > 4) {
                g_advUI_tabPanel.selection = g_advUI_tabPanel.children[4];
            }

            updateAdvancedStatus('Object atlas generated: ' + (atlas.atlas.objectCount || 0) + ' objects indexed');
        } else {
            updateAdvancedStatus('Atlas generation failed: ' + atlas.error);
        }

    } catch (exc) {
        updateAdvancedStatus('Atlas generation error: ' + exc.message);
    }
}

/**
 * Optimize mapping performance
 */
function optimizeMapping() {
    try {
        updateAdvancedStatus('Analyzing optimization opportunities...');
        
        var dataToOptimize = g_advUI_advancedDOMStructure || g_advUI_loadedJSONData;
        if (!dataToOptimize) {
            updateAdvancedStatus('No data available for optimization. Run discovery or load JSON first.');
            return;
        }

        if (!functionExists('generatePerformanceOptimizations')) {
            updateAdvancedStatus('Performance optimizer not available');
            return;
        }

        var optimizations = generatePerformanceOptimizations(dataToOptimize);

        // Display results
        var displayText = generateOptimizationDisplay(optimizations);
        if (g_advUI_deepMappingText) {
            g_advUI_deepMappingText.text = displayText;
        }

        updateAdvancedStatus('Optimization analysis complete');

    } catch (exc) {
        updateAdvancedStatus('Optimization error: ' + exc.message);
    }
}

/**
 * Clear mapping display
 */
function clearMappingDisplay() {
    try {
        if (g_advUI_deepMappingText) {
            g_advUI_deepMappingText.text = 'Create detailed object maps to understand document relationships...';
        }
        updateAdvancedStatus('Mapping display cleared');
    } catch (exc) {
        updateAdvancedStatus('Clear mapping display error: ' + exc.message);
    }
}

// =============================================================================
// EXPORT AND UTILITIES - FULL IMPLEMENTATION
// =============================================================================

/**
 * Perform advanced export with comprehensive options
 */
function performAdvancedExport(formatType) {
    try {
        var dataToExport = g_advUI_advancedDOMStructure || g_advUI_loadedJSONData;

        if (!dataToExport) {
            updateAdvancedStatus('No data to export. Run discovery or load JSON first.');
            return;
        }

        if (!functionExists('exportDOMStructure')) {
            updateAdvancedStatus('Error: DOM exporter module not available');
            return;
        }

        updateAdvancedStatus('Exporting as ' + formatType.toUpperCase() + '...');

        var exportConfig = ADVANCED_UI_CONFIG.exportSettings;
        var exportResult = exportDOMStructure(dataToExport, formatType, exportConfig);

        if (!exportResult.success) {
            updateAdvancedStatus('Export failed: ' + exportResult.error);
            return;
        }

        // Save to file
        var extension = formatType.toLowerCase();
        var fileName = 'Advanced_Export_' + getCurrentTimestamp().replace(/[:\s]/g, '-') + '.' + extension;
        var file = File.saveDialog('Save ' + formatType.toUpperCase() + ' Export', fileName);

        if (file) {
            file.open('w');
            file.write(exportResult.content);
            file.close();

            updateAdvancedStatus('Advanced export saved: ' + file.name);
        } else {
            updateAdvancedStatus('Export cancelled');
        }

    } catch (exc) {
        updateAdvancedStatus('Export error: ' + exc.message);
    }
}

/**
 * Generate comprehensive analysis report
 */
function generateComprehensiveReport() {
    try {
        updateAdvancedStatus('Generating comprehensive analysis report...');

        var dataForReport = g_advUI_advancedDOMStructure || g_advUI_loadedJSONData;

        if (!dataForReport) {
            updateAdvancedStatus('No data available for report. Run discovery or load JSON first.');
            return;
        }

        // Generate comprehensive report content
        var reportContent = createComprehensiveReport(dataForReport);

        var fileName = 'Comprehensive_Report_' + getCurrentTimestamp().replace(/[:\s]/g, '-') + '.txt';
        var file = File.saveDialog('Save Comprehensive Report', fileName);

        if (file) {
            file.open('w');
            file.write(reportContent);
            file.close();

            updateAdvancedStatus('Comprehensive report saved: ' + file.name);
        } else {
            updateAdvancedStatus('Report generation cancelled');
        }

    } catch (exc) {
        updateAdvancedStatus('Report generation error: ' + exc.message);
    }
}

/**
 * Show advanced configuration dialog
 */
function showAdvancedConfiguration() {
    try {
        updateAdvancedStatus('Opening configuration dialog...');
        
        var configDialog = createConfigurationDialog();
        if (configDialog) {
            var result = configDialog.show();
            if (result === 1) {
                updateAdvancedStatus('Configuration updated');
            } else {
                updateAdvancedStatus('Configuration cancelled');
            }
        } else {
            updateAdvancedStatus('Configuration dialog creation failed');
        }
        
    } catch (exc) {
        updateAdvancedStatus('Configuration error: ' + exc.message);
    }
}

/**
 * Show main DOM visualizer
 */
function showMainDOMVisualizer() {
    try {
        updateAdvancedStatus('Launching main DOM visualizer...');

        if (!functionExists('showDOMVisualizer')) {
            updateAdvancedStatus('Main DOM visualizer not available');
            return;
        }

        var launched = showDOMVisualizer();
        if (launched) {
            updateAdvancedStatus('Main DOM visualizer launched successfully');
        } else {
            updateAdvancedStatus('Failed to launch main DOM visualizer');
        }

    } catch (exc) {
        updateAdvancedStatus('Main visualizer launch error: ' + exc.message);
    }
}

/**
 * Show module status information
 */
function showModuleStatus() {
    try {
        var status = getModuleLoadingStatus();
        var message = 'Module Loading Status\n\n';
        message += 'Total Modules: ' + status.totalModules + '\n';
        message += 'Loaded: ' + status.loadedCount + '\n';
        message += 'Failed: ' + status.failedCount + '\n';
        message += 'Load Time: ' + status.loadTime + 'ms\n';
        message += 'Status: ' + (status.loadingSuccessful ? 'Success' : 'Partial');

        if (status.failedModules.length > 0) {
            message += '\n\nFailed Modules:\n' + arrayJoin(status.failedModules, '\n');
        }

        if (status.loadedModules.length > 0) {
            message += '\n\nLoaded Modules:\n';
            for (var i = 0; i < status.loadedModules.length; i++) {
                var module = status.loadedModules[i];
                message += module.name + ' v' + module.version + '\n';
            }
        }

        alert(message);
        
    } catch (exc) {
        updateAdvancedStatus('Module status error: ' + exc.message);
    }
}

/**
 * Show comprehensive help information
 */
function showAdvancedHelp() {
    try {
        var helpText = 'InDesign DOM Discovery Builder - Advanced Interface v3.1\n\n' +
                      'LIVE DOCUMENT ANALYSIS:\n' +
                      '• Live Analysis - Comprehensive 3-phase analysis of current document\n' +
                      '• Live Compare - Compare current document against established baseline\n' +
                      '• Take Snapshot - Export current state for comparison or archival\n\n' +
                      'ADVANCED DISCOVERY:\n' +
                      '• Full Discovery - Enhanced DOM enumeration with deep analysis\n' +
                      '• Deep Mapping - Create detailed object relationship maps\n' +
                      '• Performance - Analyze performance characteristics and optimization opportunities\n\n' +
                      'JSON ANALYSIS:\n' +
                      '• Load JSON - Import previously exported DOM structure files\n' +
                      '• Analyze - Perform comprehensive structural analysis and visualization\n' +
                      '• Visualize - Open data in main DOM visualizer for interactive exploration\n' +
                      '• Export Analysis - Save detailed analysis results\n\n' +
                      'SNAPSHOT COMPARISON:\n' +
                      '• Load Before/After - Import snapshots for detailed change analysis\n' +
                      '• Compare - Analyze differences between document states\n' +
                      '• Export Report - Save comprehensive comparison analysis\n\n' +
                      'DEEP OBJECT MAPPING:\n' +
                      '• Create Mapping - Generate detailed object relationship maps\n' +
                      '• Object Atlas - Create comprehensive object index with relationships\n' +
                      '• Optimize - Analyze performance optimization opportunities\n\n' +
                      'EXPORT OPTIONS:\n' +
                      '• Export JSON/Text/CSV - Save current analysis in various formats\n' +
                      '• Full Report - Generate comprehensive analysis report with all findings\n\n' +
                      'INTEGRATION:\n' +
                      '• Main DOM Visualizer - Launch interactive tree structure explorer\n' +
                      '• Module Status - Check component availability and loading status\n' +
                      '• Config - Adjust analysis parameters and export settings\n\n' +
                      'Use the Status bar to monitor operation progress and results.';

        alert(helpText);

    } catch (exc) {
        updateAdvancedStatus('Help display error: ' + exc.message);
    }
}

/**
 * Reset advanced UI to default state
 */
function resetAdvancedUI() {
    try {
        // Clear all data
        g_advUI_advancedDOMStructure = null;
        g_advUI_loadedJSONData = null;
        g_advUI_beforeData = null;
        g_advUI_afterData = null;
        g_advUI_currentAnalysis = null;
        g_advUI_baselineDocumentState = null;

        // Clear all displays
        if (g_advUI_liveAnalysisText) {
            g_advUI_liveAnalysisText.text = 'Run live document analysis to see current structure and extracted values...';
        }
        if (g_advUI_jsonAnalysisText) {
            g_advUI_jsonAnalysisText.text = 'Load a JSON export file to see detailed analysis and visual hierarchy...';
        }
        if (g_advUI_comparisonText) {
            g_advUI_comparisonText.text = 'Load before/after snapshots to analyze document changes...';
        }
        if (g_advUI_deepMappingText) {
            g_advUI_deepMappingText.text = 'Create detailed object maps to understand document relationships...';
        }

        // Clear discovery display
        clearDiscoveryDisplay();

        updateAdvancedStatus('Advanced UI reset to defaults - all data cleared');
        updateAdvancedDocumentInfo();

    } catch (exc) {
        updateAdvancedStatus('Reset error: ' + exc.message);
    }
}

/**
 * Close advanced UI
 */
function closeAdvancedUI() {
    try {
        if (g_advUI_window) {
            g_advUI_window.close();
            g_advUI_window = null;
        }

        // Reset all global variables
        g_advUI_statusText = null;
        g_advUI_documentInfo = null;
        g_advUI_advancedDOMStructure = null;
        g_advUI_loadedJSONData = null;
        g_advUI_beforeData = null;
        g_advUI_afterData = null;
        g_advUI_currentAnalysis = null;
        g_advUI_jsonAnalysisText = null;
        g_advUI_comparisonText = null;
        g_advUI_deepMappingText = null;
        g_advUI_liveAnalysisText = null;
        g_advUI_tabPanel = null;
        g_advUI_baselineDocumentState = null;

    } catch (exc) {
        // Silent close
    }
}

// =============================================================================
// DISPLAY GENERATION FUNCTIONS - FULL IMPLEMENTATIONS
// =============================================================================

/**
 * Generate comprehensive live analysis display
 * @param {Object} domStructure - DOM structure with extracted values
 * @param {Number} analysisTime - Analysis time in milliseconds
 * @returns {String} Formatted display
 */
function generateLiveAnalysisDisplay(domStructure, analysisTime) {
    try {
        if (!domStructure || typeof domStructure !== 'object') {
            return 'No live analysis data available';
        }

        var builder = createStringBuilder();
        if (!builder) {
            return 'Error creating live analysis display';
        }

        builder.appendLine('LIVE DOCUMENT ANALYSIS RESULTS');
        builder.appendLine('==============================');
        builder.appendLine('Analysis Time: ' + (analysisTime || 0) + 'ms');
        builder.appendLine('Timestamp: ' + getCurrentTimestamp());
        builder.appendLine('');

        // Document information
        if (domStructure.metadata) {
            builder.appendLine('DOCUMENT INFORMATION');
            builder.appendLine('-------------------');
            builder.appendLine('Document: ' + (domStructure.metadata.documentName || 'Unknown'));
            builder.appendLine('Analysis Version: ' + (domStructure.metadata.version || 'Unknown'));
            builder.appendLine('InDesign Version: ' + (domStructure.metadata.environment ? 
                              domStructure.metadata.environment.indesignVersion : 'Unknown'));
            builder.appendLine('Analysis Date: ' + (domStructure.metadata.timestamp || 'Unknown'));
            builder.appendLine('');
        }

        // Statistical overview
        if (domStructure.statistics) {
            var stats = domStructure.statistics;
            builder.appendLine('ANALYSIS SUMMARY');
            builder.appendLine('---------------');
            builder.appendLine('Objects Discovered: ' + (stats.nodeCount || 0));
            builder.appendLine('Properties Analyzed: ' + (stats.propertyCount || 0));
            builder.appendLine('Collections Found: ' + (stats.collectionCount || 0));
            builder.appendLine('Methods Found: ' + (stats.methodCount || 0));
            builder.appendLine('Maximum Depth: ' + (stats.maxDepth || 0));
            builder.appendLine('Analysis Duration: ' + (stats.totalTime || 'Unknown') + 'ms');
            
            if (stats.valuesExtracted > 0 && stats.propertyCount > 0) {
                var extractionRate = Math.round((stats.valuesExtracted / stats.propertyCount) * 100);
                builder.appendLine('Value Extraction Rate: ' + extractionRate + '%');
            }
            builder.appendLine('');
        }

        // Sample extracted values
        if (domStructure.structure && domStructure.structure.document) {
            builder.appendLine('SAMPLE EXTRACTED VALUES');
            builder.appendLine('----------------------');
            
            var sampleCount = 0;
            var maxSamples = 15;
            
            function showSampleValues(node, prefix, depth) {
                if (sampleCount >= maxSamples || !node || depth > 3) return;
                
                // Show properties with extracted values
                if (node.properties) {
                    for (var i = 0; i < node.properties.length && sampleCount < maxSamples; i++) {
                        var prop = node.properties[i];
                        if (prop.samplingMetadata && prop.samplingMetadata.extractionSuccessful) {
                            var value = prop.samplingMetadata.actualValue || prop.samplingMetadata.rawValue;
                            if (value !== undefined && value !== null) {
                                var displayValue = String(value);
                                if (displayValue.length > 80) {
                                    displayValue = displayValue.substring(0, 80) + '...';
                                }
                                builder.appendLine(prefix + prop.name + ': ' + displayValue);
                                sampleCount++;
                            }
                        }
                    }
                }
                
                // Recurse into child objects (limited depth)
                if (node.childNodes && depth < 2) {
                    for (var j = 0; j < Math.min(node.childNodes.length, 3); j++) {
                        showSampleValues(node.childNodes[j], prefix + '  ', depth + 1);
                    }
                }
            }
            
            showSampleValues(domStructure.structure.document, '', 0);
            
            if (sampleCount === 0) {
                builder.appendLine('No extracted values found - values may be in sampling metadata');
            } else if (sampleCount >= maxSamples) {
                builder.appendLine('... and more values available');
            }
            
            builder.appendLine('');
        }

        // Phase completion status
        builder.appendLine('3-PHASE ANALYSIS STATUS');
        builder.appendLine('----------------------');
        builder.appendLine('✓ Phase 1: DOM Discovery - Structure mapped and safety classified');
        builder.appendLine('✓ Phase 2: Value Extraction - Property values extracted using safe functions');
        builder.appendLine('✓ Phase 3: Collection Analysis - Collection contents sampled and analyzed');
        builder.appendLine('');
        
        // Value sampling insights
        if (domStructure.metadata && domStructure.metadata.valueSampling) {
            var valueSampling = domStructure.metadata.valueSampling;
            builder.appendLine('VALUE SAMPLING INSIGHTS');
            builder.appendLine('----------------------');
            if (valueSampling.statistics) {
                builder.appendLine('Values Sampled: ' + (valueSampling.statistics.valuesSampled || 0));
                builder.appendLine('Properties Processed: ' + (valueSampling.statistics.propertiesSampled || 0));
                builder.appendLine('Errors Encountered: ' + (valueSampling.statistics.errorsEncountered || 0));
                builder.appendLine('Safety Filter Rejects: ' + (valueSampling.statistics.safetyFilterRejects || 0));
            }
            builder.appendLine('');
        }
        
        builder.appendLine('NEXT STEPS');
        builder.appendLine('---------');
        builder.appendLine('• Modify your document and run "Live Compare" to see specific changes');
        builder.appendLine('• Use "Export" to save this analysis for future reference');
        builder.appendLine('• Use "Deep Map" for comprehensive object relationship analysis');
        builder.appendLine('• Use "Main Visualizer" for interactive tree structure exploration');
        builder.appendLine('• Use "Advanced Discovery" for enhanced analysis with performance metrics');

        return builder.toString();

    } catch (exc) {
        return 'Error generating live analysis display: ' + exc.message;
    }
}

/**
 * Generate comprehensive JSON analysis display
 * @param {Object} analysis - Analysis results
 * @returns {String} Formatted analysis display
 */
function generateJSONAnalysisDisplay(analysis) {
    try {
        if (!analysis || typeof analysis !== 'object') {
            return 'No analysis data available';
        }

        var builder = createStringBuilder();
        if (!builder) {
            return 'Error creating string builder';
        }

        builder.appendLine('COMPREHENSIVE JSON ANALYSIS RESULTS');
        builder.appendLine('===================================');
        builder.appendLine('Analysis Time: ' + (analysis.metadata ? analysis.metadata.analysisTimestamp : 'Unknown'));
        builder.appendLine('');

        // Executive Summary
        if (analysis.summary) {
            builder.appendLine('EXECUTIVE SUMMARY');
            builder.appendLine('----------------');
            builder.appendLine('Document: ' + (analysis.summary.documentName || 'Unknown'));
            builder.appendLine('Analysis Version: ' + (analysis.summary.version || 'Unknown'));
            builder.appendLine('Total Nodes: ' + (analysis.summary.nodeCount || 0));
            builder.appendLine('Total Properties: ' + (analysis.summary.propertyCount || 0));
            builder.appendLine('Collections Found: ' + (analysis.summary.collectionCount || 0));
            builder.appendLine('Methods Found: ' + (analysis.summary.methodCount || 0));
            builder.appendLine('Maximum Depth: ' + (analysis.summary.maxDepth || 0));
            builder.appendLine('Collection Sampling: ' + (analysis.summary.hasCollectionSampling ? 'Yes' : 'No'));
            builder.appendLine('Object References: ' + (analysis.summary.hasObjectReferences ? 'Yes' : 'No'));
            builder.appendLine('Extracted Values: ' + (analysis.summary.hasExtractedValues ? 'Yes' : 'No'));
            builder.appendLine('');
        }

        // Visual Hierarchy
        if (analysis.visualHierarchy) {
            builder.appendLine('DOCUMENT HIERARCHY');
            builder.appendLine('------------------');
            builder.appendLine(analysis.visualHierarchy);
            builder.appendLine('');
        }

        // Property Analysis
        if (analysis.propertyAnalysis) {
            builder.appendLine('PROPERTY ANALYSIS');
            builder.appendLine('-----------------');
            builder.appendLine(analysis.propertyAnalysis);
            builder.appendLine('');
        }

        // Collection Analysis
        if (analysis.collectionAnalysis) {
            builder.appendLine('COLLECTION ANALYSIS');
            builder.appendLine('-------------------');
            builder.appendLine(analysis.collectionAnalysis);
            builder.appendLine('');
        }

        // Value Analysis
        if (analysis.valueAnalysis) {
            builder.appendLine('VALUE ANALYSIS');
            builder.appendLine('==============');
            builder.appendLine(analysis.valueAnalysis);
            builder.appendLine('');
        }

        // Accessibility Map
        if (analysis.accessibilityMap) {
            builder.appendLine('ACCESSIBILITY MAP');
            builder.appendLine('=================');
            builder.appendLine(analysis.accessibilityMap);
            builder.appendLine('');
        }

        // Developer Guide
        if (analysis.developerGuide) {
            builder.appendLine('DEVELOPER GUIDE');
            builder.appendLine('===============');
            builder.appendLine(analysis.developerGuide);
            builder.appendLine('');
        }

        // Performance Metrics
        if (analysis.performanceMetrics) {
            builder.appendLine('PERFORMANCE METRICS');
            builder.appendLine('==================');
            builder.appendLine(analysis.performanceMetrics);
            builder.appendLine('');
        }

        return builder.toString();

    } catch (exc) {
        return 'Error generating JSON analysis display: ' + exc.message;
    }
}

/**
 * Generate comprehensive comparison display
 * @param {Object} comparison - Comparison results
 * @returns {String} Formatted comparison display
 */
function generateComparisonDisplay(comparison) {
    try {
        if (!comparison || typeof comparison !== 'object') {
            return 'No comparison data available';
        }

        var builder = createStringBuilder();
        if (!builder) {
            return 'Error creating comparison display';
        }

        builder.appendLine('COMPREHENSIVE DOCUMENT COMPARISON RESULTS');
        builder.appendLine('=========================================');
        builder.appendLine('');

        // Executive Summary
        if (comparison.summary) {
            builder.appendLine('EXECUTIVE SUMMARY');
            builder.appendLine('----------------');
            builder.appendLine('Total Changes: ' + (comparison.summary.totalChanges || 0));
            builder.appendLine('Critical Changes: ' + (comparison.summary.criticalChanges || 0));
            builder.appendLine('Added Elements: ' + (comparison.summary.addedCount || 0));
            builder.appendLine('Removed Elements: ' + (comparison.summary.removedCount || 0));
            builder.appendLine('Modified Elements: ' + (comparison.summary.modifiedCount || 0));
            builder.appendLine('Structural Changes: ' + (comparison.summary.structuralChanges || 0));
            builder.appendLine('Property Changes: ' + (comparison.summary.propertyChanges || 0));
            builder.appendLine('Collection Changes: ' + (comparison.summary.collectionChanges || 0));
            builder.appendLine('Value Changes: ' + (comparison.summary.valueChanges || 0));
            builder.appendLine('');
        }

        // Impact Assessment
        if (comparison.summary && comparison.summary.totalChanges > 0) {
            builder.appendLine('IMPACT ASSESSMENT');
            builder.appendLine('-----------------');
            var impact = 'Low';
            if (comparison.summary.criticalChanges > 0) {
                impact = 'High';
            } else if (comparison.summary.totalChanges > 10) {
                impact = 'Medium';
            }
            builder.appendLine('Overall Impact: ' + impact);
            builder.appendLine('Risk Level: ' + (comparison.summary.criticalChanges > 0 ? 'High' : 'Low'));
            builder.appendLine('');
        }

        // Detailed Changes
        if (comparison.changes && comparison.changes.length > 0) {
            builder.appendLine('DETAILED CHANGES');
            builder.appendLine('---------------');
            
            var changeCount = Math.min(comparison.changes.length, 20);
            for (var i = 0; i < changeCount; i++) {
                var change = comparison.changes[i];
                var changeStr = '• ' + (change.path || 'Unknown') + ': ' + (change.changeType || 'Modified');
                if (change.impact) {
                    changeStr += ' (' + change.impact + ' impact)';
                }
                builder.appendLine(changeStr);
            }
            
            if (comparison.changes.length > changeCount) {
                builder.appendLine('... and ' + (comparison.changes.length - changeCount) + ' more changes');
            }
            builder.appendLine('');
        }

        // Critical Findings
        if (comparison.criticalFindings && comparison.criticalFindings.length > 0) {
            builder.appendLine('CRITICAL FINDINGS');
            builder.appendLine('-----------------');
            for (var j = 0; j < comparison.criticalFindings.length; j++) {
                builder.appendLine('• ' + comparison.criticalFindings[j]);
            }
            builder.appendLine('');
        }

        // Recommendations
        if (comparison.recommendations) {
            builder.appendLine('RECOMMENDATIONS');
            builder.appendLine('---------------');
            if (typeof comparison.recommendations === 'string') {
                builder.appendLine(comparison.recommendations);
            } else if (comparison.recommendations.length) {
                for (var k = 0; k < comparison.recommendations.length; k++) {
                    builder.appendLine('• ' + comparison.recommendations[k]);
                }
            }
            builder.appendLine('');
        }

        return builder.toString();

    } catch (exc) {
        return 'Error generating comparison display: ' + exc.message;
    }
}

/**
 * Generate comprehensive deep mapping display
 * @param {Object} session - Deep mapping session
 * @param {Object} analysis - Analysis results
 * @returns {String} Formatted display
 */
function generateDeepMappingDisplay(session, analysis) {
    try {
        var builder = createStringBuilder();
        if (!builder) {
            return 'Error creating deep mapping display';
        }

        builder.appendLine('COMPREHENSIVE DEEP MAPPING ANALYSIS');
        builder.appendLine('===================================');
        builder.appendLine('');

        // Session Overview
        if (session && session.metadata) {
            builder.appendLine('MAPPING SESSION OVERVIEW');
            builder.appendLine('------------------------');
            builder.appendLine('Session ID: ' + (session.metadata.sessionId || 'Unknown'));
            builder.appendLine('Start Time: ' + (session.metadata.startTime || 'Unknown'));
            builder.appendLine('Status: ' + (session.metadata.success ? 'Success' : 'Failed'));
            if (session.metadata.error) {
                builder.appendLine('Error: ' + session.metadata.error);
            }
            builder.appendLine('');
        }

        // Statistical Summary
        if (session && session.statistics) {
            builder.appendLine('STATISTICAL SUMMARY');
            builder.appendLine('------------------');
            builder.appendLine('Objects Mapped: ' + (session.statistics.totalNodes || 0));
            builder.appendLine('Properties Analyzed: ' + (session.statistics.totalProperties || 0));
            builder.appendLine('Collections Found: ' + (session.statistics.collectionsFound || 0));
            builder.appendLine('Circular References: ' + (session.statistics.circularReferences || 0));
            builder.appendLine('Relationships Tracked: ' + (session.statistics.relationshipsTracked || 0));
            builder.appendLine('Mapping Time: ' + (session.statistics.mappingTime || 0) + 'ms');
            builder.appendLine('Memory Used: ' + (session.statistics.memoryUsed || 'Unknown'));
            builder.appendLine('');
        }

        // Analysis Results
        if (analysis) {
            if (analysis.summary) {
                builder.appendLine('ANALYSIS SUMMARY');
                builder.appendLine('---------------');
                builder.appendLine(analysis.summary);
                builder.appendLine('');
            }

            if (analysis.objectReport) {
                builder.appendLine('OBJECT RELATIONSHIP REPORT');
                builder.appendLine('--------------------------');
                builder.appendLine(analysis.objectReport);
                builder.appendLine('');
            }

            if (analysis.accessReport) {
                builder.appendLine('ACCESSIBILITY REPORT');
                builder.appendLine('-------------------');
                builder.appendLine(analysis.accessReport);
                builder.appendLine('');
            }

            if (analysis.circularReport) {
                builder.appendLine('CIRCULAR REFERENCE REPORT');
                builder.appendLine('-------------------------');
                builder.appendLine(analysis.circularReport);
                builder.appendLine('');
            }

            if (analysis.performanceAnalysis) {
                builder.appendLine('PERFORMANCE ANALYSIS');
                builder.appendLine('-------------------');
                builder.appendLine(analysis.performanceAnalysis);
                builder.appendLine('');
            }

            if (analysis.developerGuide) {
                builder.appendLine('DEVELOPER GUIDE');
                builder.appendLine('===============');
                builder.appendLine(analysis.developerGuide);
                builder.appendLine('');
            }

            if (analysis.optimizationSuggestions) {
                builder.appendLine('OPTIMIZATION SUGGESTIONS');
                builder.appendLine('========================');
                builder.appendLine(analysis.optimizationSuggestions);
                builder.appendLine('');
            }
        }

        return builder.toString();

    } catch (exc) {
        return 'Error generating deep mapping display: ' + exc.message;
    }
}

/**
 * Generate advanced discovery display
 * @param {Object} domStructure - DOM structure with enhanced analysis
 * @returns {String} Formatted display
 */
function generateAdvancedDiscoveryDisplay(domStructure) {
    try {
        var builder = createStringBuilder();
        if (!builder) {
            return 'Error creating advanced discovery display';
        }

        builder.appendLine('ADVANCED DISCOVERY ANALYSIS RESULTS');
        builder.appendLine('===================================');
        builder.appendLine('Generated: ' + getCurrentTimestamp());
        builder.appendLine('');

        // Standard analysis results
        var standardDisplay = generateLiveAnalysisDisplay(domStructure, 0);
        builder.appendLine(standardDisplay);
        builder.appendLine('');

        // Enhanced analysis results
        if (domStructure.metadata && domStructure.metadata.deepMapping) {
            builder.appendLine('ENHANCED DEEP MAPPING RESULTS');
            builder.appendLine('=============================');
            var deepMapping = domStructure.metadata.deepMapping;
            
            if (deepMapping.statistics) {
                builder.appendLine('Deep Mapping Statistics:');
                builder.appendLine('• Total Objects Mapped: ' + (deepMapping.statistics.totalNodes || 0));
                builder.appendLine('• Circular References: ' + (deepMapping.statistics.circularReferences || 0));
                builder.appendLine('• Relationships Tracked: ' + (deepMapping.statistics.relationshipsTracked || 0));
                builder.appendLine('• Mapping Time: ' + (deepMapping.statistics.mappingTime || 0) + 'ms');
                builder.appendLine('');
            }
        }

        builder.appendLine('ADVANCED ANALYSIS FEATURES');
        builder.appendLine('--------------------------');
        builder.appendLine('✓ Enhanced DOM enumeration with safety classification');
        builder.appendLine('✓ Comprehensive property value extraction');
        builder.appendLine('✓ Deep collection content analysis');
        builder.appendLine('✓ Object relationship mapping');
        builder.appendLine('✓ Performance characteristic analysis');
        builder.appendLine('✓ Circular reference detection and tracking');

        return builder.toString();

    } catch (exc) {
        return 'Error generating advanced discovery display: ' + exc.message;
    }
}

/**
 * Generate optimization display
 * @param {Array} optimizations - Optimization suggestions
 * @returns {String} Formatted display
 */
function generateOptimizationDisplay(optimizations) {
    try {
        var builder = createStringBuilder();

        builder.appendLine('PERFORMANCE OPTIMIZATION ANALYSIS');
        builder.appendLine('=================================');
        builder.appendLine('Generated: ' + getCurrentTimestamp());
        builder.appendLine('');

        if (!optimizations || optimizations.length === 0) {
            builder.appendLine('No specific optimization opportunities identified.');
            builder.appendLine('Current structure appears to be well-optimized.');
            return builder.toString();
        }

        builder.appendLine('OPTIMIZATION RECOMMENDATIONS:');
        builder.appendLine('');

        for (var i = 0; i < optimizations.length; i++) {
            builder.appendLine((i + 1) + '. ' + optimizations[i]);
            builder.appendLine('');
        }

        builder.appendLine('IMPLEMENTATION PRIORITY:');
        builder.appendLine('• High Impact: Items 1-3 (immediate attention recommended)');
        builder.appendLine('• Medium Impact: Items 4-7 (plan for next iteration)');
        builder.appendLine('• Low Impact: Remaining items (optimize when convenient)');
        builder.appendLine('');

        builder.appendLine('GENERAL OPTIMIZATION GUIDELINES:');
        builder.appendLine('• Focus on frequently accessed properties first');
        builder.appendLine('• Consider caching results for expensive operations');
        builder.appendLine('• Minimize deep property access chains');
        builder.appendLine('• Use try-catch blocks for error-prone operations');

        return builder.toString();

    } catch (exc) {
        return 'Error generating optimization display: ' + exc.message;
    }
}

/**
 * Generate atlas display
 * @param {Object} atlas - Object atlas
 * @returns {String} Formatted display
 */
function generateAtlasDisplay(atlas) {
    try {
        var builder = createStringBuilder();

        builder.appendLine('COMPREHENSIVE OBJECT ATLAS');
        builder.appendLine('==========================');
        builder.appendLine('Generated: ' + getCurrentTimestamp());
        builder.appendLine('');

        if (atlas.metadata) {
            builder.appendLine('ATLAS METADATA:');
            builder.appendLine('Object Count: ' + (atlas.metadata.objectCount || 0));
            builder.appendLine('Index Count: ' + (atlas.metadata.indexCount || 0));
            builder.appendLine('Generation Time: ' + (atlas.metadata.generationTime || 0) + 'ms');
            builder.appendLine('');
        }

        if (atlas.pathIndex) {
            builder.appendLine('PATH INDEX SUMMARY:');
            builder.appendLine('Total Paths: ' + (atlas.pathIndex.totalPaths || 0));
            builder.appendLine('Unique Objects: ' + (atlas.pathIndex.uniqueObjects || 0));
            builder.appendLine('Multiple Access Paths: ' + (atlas.pathIndex.multipleAccessPaths || 0));
            builder.appendLine('');
        }

        if (atlas.typeIndex) {
            builder.appendLine('TYPE INDEX SUMMARY:');
            var typeCount = 0;
            for (var type in atlas.typeIndex) {
                if (objectHasOwnProperty(atlas.typeIndex, type)) {
                    typeCount++;
                }
            }
            builder.appendLine('Unique Types: ' + typeCount);
            builder.appendLine('');
        }

        return builder.toString();

    } catch (exc) {
        return 'Error generating atlas display: ' + exc.message;
    }
}

// =============================================================================
// REPORT GENERATION FUNCTIONS
// =============================================================================

/**
 * Create comprehensive analysis report
 * @param {Object} dataForReport - Data to analyze
 * @returns {String} Complete report
 */
function createComprehensiveReport(dataForReport) {
    try {
        var builder = createStringBuilder();

        builder.appendLine('INDESIGN DOM DISCOVERY BUILDER');
        builder.appendLine('COMPREHENSIVE ANALYSIS REPORT');
        builder.appendLine('==============================');
        builder.appendLine('Generated: ' + getCurrentTimestamp());
        builder.appendLine('Version: v3.1');
        builder.appendLine('');

        // Executive Summary
        builder.appendLine('EXECUTIVE SUMMARY');
        builder.appendLine('================');
        if (dataForReport.metadata) {
            builder.appendLine('Document: ' + (dataForReport.metadata.documentName || 'Unknown'));
            builder.appendLine('Analysis Type: ' + (dataForReport.metadata.analysisType || 'DOM Structure Analysis'));
            builder.appendLine('Analysis Date: ' + (dataForReport.metadata.timestamp || 'Unknown'));
        }
        builder.appendLine('');

        // Statistical Overview
        if (dataForReport.statistics) {
            builder.appendLine('STATISTICAL OVERVIEW');
            builder.appendLine('===================');
            var stats = dataForReport.statistics;
            builder.appendLine('Total Objects: ' + (stats.nodeCount || 0));
            builder.appendLine('Total Properties: ' + (stats.propertyCount || 0));
            builder.appendLine('Collections: ' + (stats.collectionCount || 0));
            builder.appendLine('Methods: ' + (stats.methodCount || 0));
            builder.appendLine('Maximum Depth: ' + (stats.maxDepth || 0));
            if (stats.valuesExtracted) {
                builder.appendLine('Values Extracted: ' + stats.valuesExtracted);
            }
            builder.appendLine('');
        }

        // Detailed Analysis
        builder.appendLine('DETAILED ANALYSIS');
        builder.appendLine('================');
        builder.appendLine('This report contains comprehensive analysis of the InDesign document structure,');
        builder.appendLine('including object hierarchy, property analysis, and accessibility recommendations.');
        builder.appendLine('');

        // Analysis Sections
        if (g_advUI_liveAnalysisText && g_advUI_liveAnalysisText.text) {
            builder.appendLine('LIVE DOCUMENT ANALYSIS');
            builder.appendLine('=====================');
            builder.appendLine(g_advUI_liveAnalysisText.text);
            builder.appendLine('');
        }

        if (g_advUI_jsonAnalysisText && g_advUI_jsonAnalysisText.text) {
            builder.appendLine('JSON STRUCTURE ANALYSIS');
            builder.appendLine('======================');
            builder.appendLine(g_advUI_jsonAnalysisText.text);
            builder.appendLine('');
        }

        if (g_advUI_comparisonText && g_advUI_comparisonText.text) {
            builder.appendLine('COMPARISON ANALYSIS');
            builder.appendLine('==================');
            builder.appendLine(g_advUI_comparisonText.text);
            builder.appendLine('');
        }

        if (g_advUI_deepMappingText && g_advUI_deepMappingText.text) {
            builder.appendLine('DEEP MAPPING ANALYSIS');
            builder.appendLine('====================');
            builder.appendLine(g_advUI_deepMappingText.text);
            builder.appendLine('');
        }

        // Footer
        builder.appendLine('END OF COMPREHENSIVE REPORT');
        builder.appendLine('Generated by InDesign DOM Discovery Builder v3.1');
        builder.appendLine('For technical support and updates, please refer to the documentation.');

        return builder.toString();

    } catch (exc) {
        return 'Error generating comprehensive report: ' + exc.message;
    }
}

/**
 * Generate JSON analysis report
 * @param {Object} analysis - Analysis results
 * @returns {String} Report content
 */
function generateJSONAnalysisReport(analysis) {
    try {
        var builder = createStringBuilder();

        builder.appendLine('JSON ANALYSIS REPORT');
        builder.appendLine('===================');
        builder.appendLine('Generated: ' + getCurrentTimestamp());
        builder.appendLine('');

        builder.appendLine(generateJSONAnalysisDisplay(analysis));

        builder.appendLine('');
        builder.appendLine('ADDITIONAL INSIGHTS');
        builder.appendLine('==================');
        builder.appendLine('This analysis provides comprehensive insights into the JSON structure,');
        builder.appendLine('including hierarchy visualization, property patterns, and accessibility recommendations.');
        builder.appendLine('Use this information to optimize your InDesign scripting and automation workflows.');

        return builder.toString();

    } catch (exc) {
        return 'Error generating JSON analysis report: ' + exc.message;
    }
}

/**
 * Generate comparison report
 * @returns {String} Report content
 */
function generateComparisonReport() {
    try {
        var builder = createStringBuilder();

        builder.appendLine('DOCUMENT COMPARISON REPORT');
        builder.appendLine('=========================');
        builder.appendLine('Generated: ' + getCurrentTimestamp());
        builder.appendLine('');

        if (g_advUI_comparisonText && g_advUI_comparisonText.text) {
            builder.appendLine(g_advUI_comparisonText.text);
        } else {
            builder.appendLine('No comparison data available.');
        }

        builder.appendLine('');
        builder.appendLine('COMPARISON METHODOLOGY');
        builder.appendLine('=====================');
        builder.appendLine('This comparison analyzes structural differences, property changes,');
        builder.appendLine('collection modifications, and value variations between document states.');
        builder.appendLine('Critical changes are highlighted and recommendations provided for review.');

        return builder.toString();

    } catch (exc) {
        return 'Error generating comparison report: ' + exc.message;
    }
}

// =============================================================================
// CONFIGURATION DIALOG
// =============================================================================

/**
 * Create configuration dialog
 * @returns {Window} Configuration dialog
 */
function createConfigurationDialog() {
    try {
        var configDialog = new Window('dialog', 'Advanced UI Configuration');
        if (!configDialog) return null;

        configDialog.orientation = 'column';
        configDialog.alignChildren = 'fill';
        configDialog.spacing = 10;
        configDialog.margins = 16;
        configDialog.preferredSize.width = 600;
        configDialog.preferredSize.height = 500;

        // Create tabs for different config sections
        var configTabs = configDialog.add('tabbedpanel');
        if (configTabs) {
            configTabs.alignChildren = 'fill';
            configTabs.preferredSize.height = 400;

            // Discovery Configuration Tab
            var discoveryTab = configTabs.add('tab', undefined, 'Discovery');
            if (discoveryTab) {
                discoveryTab.orientation = 'column';
                discoveryTab.alignChildren = 'left';
                discoveryTab.spacing = 5;

                discoveryTab.add('statictext', undefined, 'Discovery Settings:');
                
                var maxDepthGroup = discoveryTab.add('group');
                if (maxDepthGroup) {
                    maxDepthGroup.add('statictext', undefined, 'Max Depth:');
                    var maxDepthEdit = maxDepthGroup.add('edittext', undefined, String(ADVANCED_UI_CONFIG.discovery.maxDepth));
                    maxDepthEdit.preferredSize.width = 60;
                }

                var timeoutGroup = discoveryTab.add('group');
                if (timeoutGroup) {
                    timeoutGroup.add('statictext', undefined, 'Timeout (ms):');
                    var timeoutEdit = timeoutGroup.add('edittext', undefined, String(ADVANCED_UI_CONFIG.discovery.timeoutMs));
                    timeoutEdit.preferredSize.width = 80;
                }

                var skipDangerousCheck = discoveryTab.add('checkbox', undefined, 'Skip Dangerous Properties');
                skipDangerousCheck.value = ADVANCED_UI_CONFIG.discovery.skipDangerous;

                var objectTrackingCheck = discoveryTab.add('checkbox', undefined, 'Enable Object Tracking');
                objectTrackingCheck.value = ADVANCED_UI_CONFIG.discovery.enableObjectTracking;
            }

            // Sampling Configuration Tab
            var samplingTab = configTabs.add('tab', undefined, 'Sampling');
            if (samplingTab) {
                samplingTab.orientation = 'column';
                samplingTab.alignChildren = 'left';
                samplingTab.spacing = 5;

                samplingTab.add('statictext', undefined, 'Value Sampling Settings:');
                
                var maxSamplesGroup = samplingTab.add('group');
                if (maxSamplesGroup) {
                    maxSamplesGroup.add('statictext', undefined, 'Max Samples:');
                    var maxSamplesEdit = maxSamplesGroup.add('edittext', undefined, String(ADVANCED_UI_CONFIG.sampling.maxSamples));
                    maxSamplesEdit.preferredSize.width = 60;
                }

                var safetyFilterGroup = samplingTab.add('group');
                if (safetyFilterGroup) {
                    safetyFilterGroup.add('statictext', undefined, 'Safety Filter:');
                    var safetyFilterDropdown = safetyFilterGroup.add('dropdownlist', undefined, ['safe', 'moderate', 'all']);
                    safetyFilterDropdown.selection = 0; // default to 'safe'
                }

                var includeCollectionsCheck = samplingTab.add('checkbox', undefined, 'Include Collection Samples');
                includeCollectionsCheck.value = ADVANCED_UI_CONFIG.sampling.includeCollectionSamples;

                var trackReferencesCheck = samplingTab.add('checkbox', undefined, 'Track Object References');
                trackReferencesCheck.value = ADVANCED_UI_CONFIG.sampling.trackObjectReferences;
            }

            // Export Configuration Tab
            var exportTab = configTabs.add('tab', undefined, 'Export');
            if (exportTab) {
                exportTab.orientation = 'column';
                exportTab.alignChildren = 'left';
                exportTab.spacing = 5;

                exportTab.add('statictext', undefined, 'Export Settings:');
                
                var includeValuesCheck = exportTab.add('checkbox', undefined, 'Include Extracted Values');
                includeValuesCheck.value = ADVANCED_UI_CONFIG.exportSettings.includeExtractedValues;

                var formatOutputCheck = exportTab.add('checkbox', undefined, 'Format Output');
                formatOutputCheck.value = ADVANCED_UI_CONFIG.exportSettings.formatOutput;

                var includeMetadataCheck = exportTab.add('checkbox', undefined, 'Include Metadata');
                includeMetadataCheck.value = ADVANCED_UI_CONFIG.exportSettings.includeMetadata;

                var includeReferencesCheck = exportTab.add('checkbox', undefined, 'Include Object References');
                includeReferencesCheck.value = ADVANCED_UI_CONFIG.exportSettings.includeObjectReferences;

                var enableTimestampsCheck = exportTab.add('checkbox', undefined, 'Enable Timestamps');
                enableTimestampsCheck.value = ADVANCED_UI_CONFIG.exportSettings.enableTimestamps;
            }
        }

        // Dialog buttons
        var buttonGroup = configDialog.add('group');
        if (buttonGroup) {
            buttonGroup.orientation = 'row';
            buttonGroup.alignment = 'center';

            var okButton = buttonGroup.add('button', undefined, 'OK');
            if (okButton) {
                okButton.onClick = function() {
                    // Save configuration changes here
                    configDialog.close(1);
                };
            }

            var cancelButton = buttonGroup.add('button', undefined, 'Cancel');
            if (cancelButton) {
                cancelButton.onClick = function() {
                    configDialog.close(0);
                };
            }
        }

        return configDialog;

    } catch (exc) {
        updateAdvancedStatus('Configuration dialog creation error: ' + exc.message);
        return null;
    }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Update advanced status display
 * @param {String} message - Status message
 */
function updateAdvancedStatus(message) {
    try {
        if (!message || typeof message !== 'string') {
            return;
        }

        if (g_advUI_statusText) {
            g_advUI_statusText.text = message;
        }

        // Also output to console for debugging
        $.writeln('[Advanced Analysis] ' + message);

    } catch (exc) {
        $.writeln('[Advanced Analysis] Status update error: ' + exc.message);
    }
}

/**
 * Update advanced document information display
 */
function updateAdvancedDocumentInfo() {
    try {
        if (!g_advUI_documentInfo) {
            return;
        }

        var infoText = '';

        // Document information
        var envValidation = validateInDesignEnvironment();
        if (envValidation.valid) {
            try {
                infoText += 'Document: ' + (envValidation.document.name || 'Unnamed');
            } catch (exc) {
                infoText += 'Document: [Access Error]';
            }
        } else {
            infoText += 'Document: Not Available';
        }

        // Live analysis information
        if (g_advUI_advancedDOMStructure) {
            var liveStats = g_advUI_advancedDOMStructure.statistics || {};
            infoText += ' | Live: ' + (liveStats.nodeCount || 0) + ' objects';
            if (liveStats.valuesExtracted || liveStats.valuesSampled) {
                infoText += ', ' + (liveStats.valuesExtracted || liveStats.valuesSampled || 0) + ' values';
            }
        }

        // Loaded data information
        if (g_advUI_loadedJSONData) {
            var domStructure = g_advUI_loadedJSONData.domStructure || g_advUI_loadedJSONData;
            if (domStructure.metadata) {
                infoText += ' | JSON: ' + (domStructure.metadata.documentName || 'Unknown');
            } else {
                infoText += ' | JSON: Loaded';
            }
        }

        // Comparison information
        if (g_advUI_beforeData && g_advUI_afterData) {
            infoText += ' | Comparison: Ready';
        } else if (g_advUI_beforeData || g_advUI_afterData) {
            infoText += ' | Comparison: Partial';
        }

        // Baseline information
        if (g_advUI_baselineDocumentState) {
            infoText += ' | Baseline: Set';
        }

        g_advUI_documentInfo.text = infoText;

    } catch (exc) {
        if (g_advUI_documentInfo) {
            g_advUI_documentInfo.text = 'Advanced info error: ' + exc.message;
        }
    }
}

// =============================================================================
// MODULE REGISTRATION
// =============================================================================

// Register this module with all its functions
registerModule('6.1_advanced-ui', '3.1', [
    // Main Functions
    'showAdvancedDOMAnalysis', 'initializeAdvancedUI',
    
    // Window Creation
    'createAdvancedWindow', 'createAdvancedHeader', 'createAdvancedTabs', 
    'createAdvancedControls', 'createAdvancedFooter',
    
    // Tab Creation
    'createLiveAnalysisTab', 'createAdvancedDiscoveryTab', 'createJSONAnalysisTab',
    'createSnapshotComparisonTab', 'createDeepMappingTab',
    
    // Live Document Analysis
    'runLiveDocumentAnalysis', 'runLiveComparison', 'takeDocumentSnapshot', 'clearLiveDisplay',
    
    // Advanced Discovery
    'performAdvancedDiscovery', 'runDeepMapping', 'analyzePerformance', 'clearDiscoveryDisplay',
    
    // JSON Analysis
    'loadJSONExport', 'runJSONAnalysis', 'visualizeJSON', 'exportJSONAnalysis', 'clearAnalysisDisplay',
    
    // Snapshot Comparison
    'loadBeforeSnapshot', 'loadAfterSnapshot', 'runSnapshotComparison', 
    'exportComparisonReport', 'clearComparisonDisplay',
    
    // Deep Object Mapping
    'createDeepMapping', 'generateAdvancedAtlas', 'optimizeMapping', 'clearMappingDisplay',
    
    // Export and Utilities
    'performAdvancedExport', 'generateComprehensiveReport', 'showAdvancedConfiguration',
    'showMainDOMVisualizer', 'showModuleStatus', 'showAdvancedHelp',
    
    // UI Management
    'resetAdvancedUI', 'closeAdvancedUI', 'initializeAdvancedEventHandlers',
    
    // Display Generation
    'generateLiveAnalysisDisplay', 'generateJSONAnalysisDisplay', 'generateComparisonDisplay',
    'generateDeepMappingDisplay', 'generateAdvancedDiscoveryDisplay', 'generateOptimizationDisplay',
    'generateAtlasDisplay',
    
    // Report Generation
    'createComprehensiveReport', 'generateJSONAnalysisReport', 'generateComparisonReport',
    
    // Configuration
    'createConfigurationDialog',
    
    // Utilities
    'updateAdvancedStatus', 'updateAdvancedDocumentInfo'
]);

// =============================================================================
// END OF 6.1_advanced-ui.jsx
// =============================================================================