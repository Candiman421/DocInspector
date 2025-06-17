// =============================================================================
// 6.1_advanced-ui.jsx - ENHANCED ADVANCED USER INTERFACE
// InDesign DOM Discovery Builder v3.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: Advanced UI with enhanced features, comparison tools, and analysis
// DEPENDENCIES: ALL PREVIOUS MODULES (1.1-5.2)
// SIZE: ~2500 lines - COMPLETE IMPLEMENTATION
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

// =============================================================================
// CONFIGURATION OBJECTS
// =============================================================================

var ADVANCED_UI_CONFIG = {
    discovery: {
        maxDepth: 4,
        timeoutMs: 15000,
        skipDangerous: true,
        maxProperties: 5000,
        enableObjectTracking: true,
        enableDuplicateDetection: true,
        enableCircularReferenceDetection: true,
        includeAlternativeAccessPaths: true,
        trackPropertySafety: true,
        enableProgressReporting: true,
        generateStatistics: true
    },
    sampling: {
        safetyFilter: 'safe',
        maxSamples: 10,
        timeoutMs: 1000,
        includeCollectionSamples: true,
        maxStringLength: 500,
        maxObjectDepth: 2,
        trackObjectReferences: true,
        includeValueMetadata: true,
        generateValueFingerprints: true,
        enableProgressReporting: true,
        enableDetailedLogging: false,
        skipNullValues: false,
        skipUndefinedValues: false,
        maxCollectionDepth: 3,
        preserveOriginalTypes: true
    },
    collectionSampling: {
        maxSamplesPerCollection: 5,
        timeoutPerCollection: 5000,
        timeoutPerItem: 2000,
        maxCollectionSize: 2000,
        samplingDepth: 3,
        enableObjectReferenceTracking: true,
        enableDeepPropertyAnalysis: true,
        enableCrossCollectionTracking: true,
        maxItemPropertiesPerSample: 100,
        propertyAnalysisDepth: 2,
        enableProgressReporting: true,
        enableDetailedLogging: false
    },
    analysis: {
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
    exportSettings: {
        includeExtractedValues: true,
        formatOutput: true,
        includeMetadata: true,
        includeObjectReferences: true,
        enableTimestamps: true,
        enableCompression: false,
        generateMultipleFormats: true
    }
};

// =============================================================================
// MAIN UI FUNCTIONS
// =============================================================================

/**
 * Show advanced UI interface
 * @returns {Boolean} True if shown successfully
 */
function showAdvancedUI() {
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
 * Initialize advanced UI
 * @returns {Boolean} True if initialized successfully
 */
function initializeAdvancedUI() {
    try {
        // Create main window
        g_advUI_window = createAdvancedWindow();
        if (!g_advUI_window) {
            alert('Failed to create Advanced UI window');
            return false;
        }

        // Create tabs
        createAdvancedTabs();

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
 * Create advanced UI window
 * @returns {Window} Created window or null
 */
function createAdvancedWindow() {
    try {
        var windowResource = "dialog { " +
            "text: 'InDesign DOM Discovery Builder - Advanced Interface v3.1', " +
            "orientation: 'column', " +
            "alignChildren: 'fill', " +
            "preferredSize: { width: 1000, height: 800 }, " +
            "margins: 15, " +

            "header: Group { " +
            "orientation: 'row', " +
            "alignChildren: 'center', " +
            "spacing: 15, " +
            "document: Group { " +
            "orientation: 'column', " +
            "alignChildren: 'left', " +
            "info: StaticText { text: 'Document: Loading...', characters: 50 }, " +
            "status: StaticText { text: 'Status: Initializing...', characters: 50 } " +
            "}, " +
            "controls: Group { " +
            "orientation: 'column', " +
            "alignChildren: 'right', " +
            "spacing: 5, " +
            "mainVisualizer: Button { text: 'Main DOM Visualizer', preferredSize: { width: 150, height: 25 } }, " +
            "moduleStatus: Button { text: 'Module Status', preferredSize: { width: 150, height: 25 } } " +
            "} " +
            "}, " +

            "separator1: Panel { height: 2 }, " +

            "mainTabs: TabbedPanel { " +
            "alignChildren: 'fill', " +
            "preferredSize: { height: 600 }, " +

            "liveTab: Tab { " +
            "text: 'Live Document Analysis', " +
            "orientation: 'column', " +
            "alignChildren: 'fill', " +

            "liveControls: Group { " +
            "orientation: 'row', " +
            "alignChildren: 'center', " +
            "spacing: 10, " +
            "liveAnalysis: Button { text: 'Live Analysis', preferredSize: { width: 120, height: 25 } }, " +
            "liveCompare: Button { text: 'Live Compare', preferredSize: { width: 120, height: 25 } }, " +
            "takeSnapshot: Button { text: 'Take Snapshot', preferredSize: { width: 120, height: 25 } }, " +
            "clearLive: Button { text: 'Clear', preferredSize: { width: 80, height: 25 } } " +
            "}, " +

            "liveDisplay: Group { " +
            "orientation: 'column', " +
            "alignChildren: 'fill', " +
            "margins: 5, " +
            "text: EditText { " +
            "alignment: 'fill', " +
            "preferredSize: { height: 500 }, " +
            "properties: { multiline: true, scrolling: true } " +
            "} " +
            "} " +
            "}, " +

            "discoveryTab: Tab { " +
            "text: 'Advanced Discovery', " +
            "orientation: 'column', " +
            "alignChildren: 'fill', " +

            "discoveryControls: Group { " +
            "orientation: 'row', " +
            "alignChildren: 'center', " +
            "spacing: 10, " +
            "fullDiscovery: Button { text: 'Full Discovery', preferredSize: { width: 120, height: 25 } }, " +
            "deepMapping: Button { text: 'Deep Mapping', preferredSize: { width: 120, height: 25 } }, " +
            "performance: Button { text: 'Performance', preferredSize: { width: 120, height: 25 } }, " +
            "clearDiscovery: Button { text: 'Clear', preferredSize: { width: 80, height: 25 } } " +
            "}, " +

            "discoveryDisplay: Group { " +
            "orientation: 'column', " +
            "alignChildren: 'fill', " +
            "margins: 5, " +
            "text: EditText { " +
            "alignment: 'fill', " +
            "preferredSize: { height: 500 }, " +
            "properties: { multiline: true, scrolling: true } " +
            "} " +
            "} " +
            "}, " +

            "analysisTab: Tab { " +
            "text: 'JSON Analysis', " +
            "orientation: 'column', " +
            "alignChildren: 'fill', " +

            "analysisControls: Group { " +
            "orientation: 'row', " +
            "alignChildren: 'center', " +
            "spacing: 10, " +
            "loadJSON: Button { text: 'Load JSON', preferredSize: { width: 100, height: 25 } }, " +
            "analyzeJSON: Button { text: 'Analyze', preferredSize: { width: 100, height: 25 } }, " +
            "visualize: Button { text: 'Visualize', preferredSize: { width: 100, height: 25 } }, " +
            "exportAnalysis: Button { text: 'Export Analysis', preferredSize: { width: 120, height: 25 } }, " +
            "clearAnalysis: Button { text: 'Clear', preferredSize: { width: 80, height: 25 } } " +
            "}, " +

            "analysisDisplay: Group { " +
            "orientation: 'column', " +
            "alignChildren: 'fill', " +
            "margins: 5, " +
            "text: EditText { " +
            "alignment: 'fill', " +
            "preferredSize: { height: 500 }, " +
            "properties: { multiline: true, scrolling: true } " +
            "} " +
            "} " +
            "}, " +

            "comparisonTab: Tab { " +
            "text: 'Snapshot Comparison', " +
            "orientation: 'column', " +
            "alignChildren: 'fill', " +

            "comparisonControls: Group { " +
            "orientation: 'row', " +
            "alignChildren: 'center', " +
            "spacing: 10, " +
            "loadBefore: Button { text: 'Load Before', preferredSize: { width: 100, height: 25 } }, " +
            "loadAfter: Button { text: 'Load After', preferredSize: { width: 100, height: 25 } }, " +
            "compare: Button { text: 'Compare', preferredSize: { width: 100, height: 25 } }, " +
            "exportComparison: Button { text: 'Export Report', preferredSize: { width: 120, height: 25 } }, " +
            "clearComparison: Button { text: 'Clear', preferredSize: { width: 80, height: 25 } } " +
            "}, " +

            "comparisonDisplay: Group { " +
            "orientation: 'column', " +
            "alignChildren: 'fill', " +
            "margins: 5, " +
            "text: EditText { " +
            "alignment: 'fill', " +
            "preferredSize: { height: 500 }, " +
            "properties: { multiline: true, scrolling: true } " +
            "} " +
            "} " +
            "}, " +

            "deepMappingTab: Tab { " +
            "text: 'Deep Object Mapping', " +
            "orientation: 'column', " +
            "alignChildren: 'fill', " +

            "mappingControls: Group { " +
            "orientation: 'row', " +
            "alignChildren: 'center', " +
            "spacing: 10, " +
            "createMapping: Button { text: 'Create Mapping', preferredSize: { width: 120, height: 25 } }, " +
            "objectAtlas: Button { text: 'Object Atlas', preferredSize: { width: 120, height: 25 } }, " +
            "optimize: Button { text: 'Optimize', preferredSize: { width: 100, height: 25 } }, " +
            "clearMapping: Button { text: 'Clear', preferredSize: { width: 80, height: 25 } } " +
            "}, " +

            "mappingDisplay: Group { " +
            "orientation: 'column', " +
            "alignChildren: 'fill', " +
            "margins: 5, " +
            "text: EditText { " +
            "alignment: 'fill', " +
            "preferredSize: { height: 500 }, " +
            "properties: { multiline: true, scrolling: true } " +
            "} " +
            "} " +
            "} " +
            "}, " +

            "separator2: Panel { height: 2 }, " +

            "controlPanel: Group { " +
            "orientation: 'row', " +
            "alignChildren: 'center', " +
            "spacing: 10, " +
            "exportGroup: Group { " +
            "orientation: 'row', " +
            "spacing: 5, " +
            "exportJSON: Button { text: 'Export JSON', preferredSize: { width: 100, height: 25 } }, " +
            "exportText: Button { text: 'Export Text', preferredSize: { width: 100, height: 25 } }, " +
            "exportCSV: Button { text: 'Export CSV', preferredSize: { width: 100, height: 25 } } " +
            "}, " +
            "actionGroup: Group { " +
            "orientation: 'row', " +
            "spacing: 5, " +
            "generateReport: Button { text: 'Full Report', preferredSize: { width: 100, height: 25 } }, " +
            "config: Button { text: 'Config', preferredSize: { width: 80, height: 25 } } " +
            "} " +
            "}, " +

            "footer: Group { " +
            "orientation: 'row', " +
            "alignChildren: 'center', " +
            "status: StaticText { text: 'Ready', characters: 80, alignment: 'left' }, " +
            "buttons: Group { " +
            "orientation: 'row', " +
            "spacing: 10, " +
            "reset: Button { text: 'Reset', preferredSize: { width: 80, height: 25 } }, " +
            "help: Button { text: 'Help', preferredSize: { width: 80, height: 25 } }, " +
            "close: Button { text: 'Close', preferredSize: { width: 80, height: 25 } } " +
            "} " +
            "} " +
            "}";

        var window = new Window(windowResource);
        if (!window) {
            return null;
        }

        // Store UI references
        g_advUI_documentInfo = window.header.document.info;
        g_advUI_statusText = window.footer.status;

        return window;

    } catch (exc) {
        alert('Advanced window creation error: ' + exc.message);
        return null;
    }
}

/**
 * Create and initialize tabs
 */
function createAdvancedTabs() {
    try {
        if (!g_advUI_window) return;

        var tabs = g_advUI_window.mainTabs;

        // Store text area references
        g_advUI_liveAnalysisText = tabs.liveTab.liveDisplay.text;
        g_advUI_jsonAnalysisText = tabs.analysisTab.analysisDisplay.text;
        g_advUI_comparisonText = tabs.comparisonTab.comparisonDisplay.text;
        g_advUI_deepMappingText = tabs.deepMappingTab.mappingDisplay.text;

    } catch (exc) {
        updateAdvancedStatus('Tab creation error: ' + exc.message);
    }
}

/**
 * Initialize event handlers
 */
function initializeAdvancedEventHandlers() {
    try {
        if (!g_advUI_window) return;

        var window = g_advUI_window;

        // Header controls
        window.header.controls.mainVisualizer.onClick = showMainDOMVisualizer;
        window.header.controls.moduleStatus.onClick = showModuleStatus;

        // Live tab
        window.mainTabs.liveTab.liveControls.liveAnalysis.onClick = runLiveDocumentAnalysis;
        window.mainTabs.liveTab.liveControls.liveCompare.onClick = runLiveComparison;
        window.mainTabs.liveTab.liveControls.takeSnapshot.onClick = takeDocumentSnapshot;
        window.mainTabs.liveTab.liveControls.clearLive.onClick = clearLiveDisplay;

        // Discovery tab
        window.mainTabs.discoveryTab.discoveryControls.fullDiscovery.onClick = performAdvancedDiscovery;
        window.mainTabs.discoveryTab.discoveryControls.deepMapping.onClick = runDeepMapping;
        window.mainTabs.discoveryTab.discoveryControls.performance.onClick = analyzePerformance;
        window.mainTabs.discoveryTab.discoveryControls.clearDiscovery.onClick = clearDiscoveryDisplay;

        // Analysis tab
        window.mainTabs.analysisTab.analysisControls.loadJSON.onClick = loadJSONExport;
        window.mainTabs.analysisTab.analysisControls.analyzeJSON.onClick = runJSONAnalysis;
        window.mainTabs.analysisTab.analysisControls.visualize.onClick = visualizeJSON;
        window.mainTabs.analysisTab.analysisControls.exportAnalysis.onClick = exportJSONAnalysis;
        window.mainTabs.analysisTab.analysisControls.clearAnalysis.onClick = clearAnalysisDisplay;

        // Comparison tab
        window.mainTabs.comparisonTab.comparisonControls.loadBefore.onClick = loadBeforeSnapshot;
        window.mainTabs.comparisonTab.comparisonControls.loadAfter.onClick = loadAfterSnapshot;
        window.mainTabs.comparisonTab.comparisonControls.compare.onClick = runSnapshotComparison;
        window.mainTabs.comparisonTab.comparisonControls.exportComparison.onClick = exportComparisonReport;
        window.mainTabs.comparisonTab.comparisonControls.clearComparison.onClick = clearComparisonDisplay;

        // Deep mapping tab
        window.mainTabs.deepMappingTab.mappingControls.createMapping.onClick = createDeepMapping;
        window.mainTabs.deepMappingTab.mappingControls.objectAtlas.onClick = generateAdvancedAtlas;
        window.mainTabs.deepMappingTab.mappingControls.optimize.onClick = optimizeMapping;
        window.mainTabs.deepMappingTab.mappingControls.clearMapping.onClick = clearMappingDisplay;

        // Control panel
        window.controlPanel.exportGroup.exportJSON.onClick = function () { performAdvancedExport('json'); };
        window.controlPanel.exportGroup.exportText.onClick = function () { performAdvancedExport('text'); };
        window.controlPanel.exportGroup.exportCSV.onClick = function () { performAdvancedExport('csv'); };
        window.controlPanel.actionGroup.generateReport.onClick = generateComprehensiveReport;
        window.controlPanel.actionGroup.config.onClick = showAdvancedConfiguration;

        // Footer controls
        window.footer.buttons.reset.onClick = resetAdvancedUI;
        window.footer.buttons.help.onClick = showAdvancedHelp;
        window.footer.buttons.close.onClick = closeAdvancedUI;

    } catch (exc) {
        updateAdvancedStatus('Event handler initialization error: ' + exc.message);
    }
}

// =============================================================================
// LIVE DOCUMENT ANALYSIS
// =============================================================================

/**
 * Run live document analysis (3-phase process)
 */
function runLiveDocumentAnalysis() {
    try {
        updateAdvancedStatus('Starting live document analysis...');

        var envValidation = validateInDesignEnvironment();
        if (!envValidation.valid) {
            updateAdvancedStatus('Environment validation failed: ' + envValidation.error);
            return;
        }

        // Phase 1: DOM Enumeration
        updateAdvancedStatus('Phase 1: Enumerating document DOM structure...');

        if (!functionExists('enumerateDocumentDOM')) {
            updateAdvancedStatus('Error: DOM enumerator module not available');
            return;
        }

        var enumerationConfig = ADVANCED_UI_CONFIG.discovery;
        var domStructure = enumerateDocumentDOM(envValidation.document, enumerationConfig);

        if (!domStructure || domStructure.error) {
            updateAdvancedStatus('Phase 1 failed: ' + (domStructure ? domStructure.error : 'Unknown error'));
            return;
        }

        // Phase 2: Property Value Sampling
        updateAdvancedStatus('Phase 2: Sampling property values...');

        if (!functionExists('sampleDOMValues')) {
            updateAdvancedStatus('Error: Property sampler module not available');
            return;
        }

        var samplingConfig = ADVANCED_UI_CONFIG.sampling;
        domStructure = sampleDOMValues(domStructure, envValidation.document, samplingConfig);

        if (!domStructure || domStructure.error) {
            updateAdvancedStatus('Phase 2 failed: ' + (domStructure ? domStructure.error : 'Unknown error'));
            return;
        }

        // Phase 3: Collection Content Sampling
        updateAdvancedStatus('Phase 3: Sampling collection contents...');

        if (!functionExists('sampleCollectionContents')) {
            updateAdvancedStatus('Error: Collection sampler module not available');
            return;
        }

        var collectionConfig = {
            maxSamplesPerCollection: 5,
            timeoutPerCollection: 3000,
            enableDeepPropertyAnalysis: true
        };
        domStructure = sampleCollectionContents(domStructure, envValidation.document, collectionConfig);

        if (!domStructure || domStructure.error) {
            updateAdvancedStatus('Phase 3 failed: ' + (domStructure ? domStructure.error : 'Unknown error'));
            return;
        }

        // Store result
        g_advUI_advancedDOMStructure = domStructure;

        // Display results
        var displayText = generateLiveAnalysisDisplay(domStructure);
        if (g_advUI_liveAnalysisText) {
            g_advUI_liveAnalysisText.text = displayText;
        }

        updateAdvancedStatus('Live document analysis complete - all 3 phases successful');

    } catch (exc) {
        updateAdvancedStatus('Live analysis error: ' + exc.message);
    }
}

/**
 * Generate live analysis display text
 */
function generateLiveAnalysisDisplay(domStructure) {
    try {
        var builder = createStringBuilder();

        builder.appendLine('LIVE DOCUMENT ANALYSIS RESULTS');
        builder.appendLine('===============================');
        builder.appendLine('Generated: ' + getCurrentTimestamp());
        builder.appendLine('');

        // Document metadata
        if (domStructure.metadata) {
            builder.appendLine('DOCUMENT INFORMATION:');
            builder.appendLine('Document: ' + (domStructure.metadata.documentName || 'Unknown'));
            builder.appendLine('Analysis Version: ' + (domStructure.metadata.version || 'Unknown'));
            builder.appendLine('InDesign Version: ' + (domStructure.metadata.environment ?
                domStructure.metadata.environment.indesignVersion : 'Unknown'));
            builder.appendLine('');
        }

        // Statistics
        if (domStructure.statistics) {
            builder.appendLine('DISCOVERY STATISTICS:');
            builder.appendLine('Total Nodes: ' + (domStructure.statistics.nodeCount || 0));
            builder.appendLine('Properties: ' + (domStructure.statistics.propertyCount || 0));
            builder.appendLine('Collections: ' + (domStructure.statistics.collectionCount || 0));
            builder.appendLine('Methods: ' + (domStructure.statistics.methodCount || 0));
            builder.appendLine('Max Depth: ' + (domStructure.statistics.maxDepth || 0));
            builder.appendLine('Analysis Time: ' + (domStructure.statistics.totalTime || 'Unknown') + 'ms');
            builder.appendLine('');
        }

        // Sampling results
        if (domStructure.valueSampling) {
            builder.appendLine('VALUE SAMPLING RESULTS:');
            builder.appendLine('Sampled Properties: ' + (domStructure.valueSampling.sampledCount || 0));
            builder.appendLine('Successful Extractions: ' + (domStructure.valueSampling.successfulCount || 0));
            builder.appendLine('Failed Extractions: ' + (domStructure.valueSampling.failedCount || 0));
            builder.appendLine('');
        }

        // Collection sampling results
        if (domStructure.collectionSampling) {
            builder.appendLine('COLLECTION SAMPLING RESULTS:');
            builder.appendLine('Collections Analyzed: ' + (domStructure.collectionSampling.collectionsAnalyzed || 0));
            builder.appendLine('Items Sampled: ' + (domStructure.collectionSampling.itemsSampled || 0));
            builder.appendLine('Cross-References Found: ' + (domStructure.collectionSampling.crossReferences || 0));
            builder.appendLine('');
        }

        // Key findings
        if (domStructure.structure && domStructure.structure.length > 0) {
            builder.appendLine('KEY STRUCTURE FINDINGS:');
            var previewCount = Math.min(15, domStructure.structure.length);
            for (var i = 0; i < previewCount; i++) {
                var node = domStructure.structure[i];
                var indent = '';
                for (var d = 0; d < (node.depth || 0); d++) {
                    indent += '  ';
                }
                var nodeInfo = indent + (node.path || node.name || 'Unknown');
                if (node.type) {
                    nodeInfo += ' [' + node.type + ']';
                }
                if (node.value !== undefined && node.value !== null) {
                    var valuePreview = safeToString(node.value);
                    if (valuePreview.length > 50) {
                        valuePreview = stringSubstring(valuePreview, 0, 50) + '...';
                    }
                    nodeInfo += ' = ' + valuePreview;
                }
                builder.appendLine(nodeInfo);
            }

            if (domStructure.structure.length > previewCount) {
                builder.appendLine('... (' + (domStructure.structure.length - previewCount) + ' more items)');
            }
        }

        return builder.toString();

    } catch (exc) {
        return 'Error generating live analysis display: ' + exc.message;
    }
}

/**
 * Run live comparison against baseline
 */
function runLiveComparison() {
    try {
        if (!g_advUI_advancedDOMStructure) {
            updateAdvancedStatus('No current analysis available. Run Live Analysis first.');
            return;
        }

        if (!g_advUI_beforeData) {
            updateAdvancedStatus('No baseline data loaded. Load a Before snapshot first.');
            return;
        }

        if (!functionExists('compareDOMExports')) {
            updateAdvancedStatus('Error: DOM comparator module not available');
            return;
        }

        updateAdvancedStatus('Comparing current document state against baseline...');

        var comparisonConfig = ADVANCED_UI_CONFIG.comparison;
        var comparisonResult = compareDOMExports(g_advUI_beforeData, g_advUI_advancedDOMStructure, comparisonConfig);

        if (!comparisonResult.success) {
            updateAdvancedStatus('Live comparison failed: ' + comparisonResult.error);
            return;
        }

        // Display results
        var displayText = generateComparisonDisplay(comparisonResult.comparison);
        if (g_advUI_liveAnalysisText) {
            g_advUI_liveAnalysisText.text = displayText;
        }

        updateAdvancedStatus('Live comparison complete');

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

        // Run full analysis
        runLiveDocumentAnalysis();

        if (!g_advUI_advancedDOMStructure) {
            updateAdvancedStatus('Snapshot failed - no analysis data');
            return;
        }

        // Export as JSON
        if (!functionExists('exportDOMStructure')) {
            updateAdvancedStatus('Error: DOM exporter module not available');
            return;
        }

        var exportConfig = ADVANCED_UI_CONFIG.exportSettings;
        var exportResult = exportDOMStructure(g_advUI_advancedDOMStructure, 'json', exportConfig);

        if (!exportResult.success) {
            updateAdvancedStatus('Snapshot export failed: ' + exportResult.error);
            return;
        }

        // Save to file
        var fileName = 'Snapshot_' + getCurrentTimestamp().replace(/[:\s]/g, '-') + '.json';
        var file = File.saveDialog('Save Document Snapshot', fileName);

        if (file) {
            file.open('w');
            file.write(exportResult.content);
            file.close();

            updateAdvancedStatus('Document snapshot saved: ' + file.name);
        } else {
            updateAdvancedStatus('Snapshot save cancelled');
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
            g_advUI_liveAnalysisText.text = '';
        }
        updateAdvancedStatus('Live display cleared');
    } catch (exc) {
        updateAdvancedStatus('Clear live display error: ' + exc.message);
    }
}

// =============================================================================
// ADVANCED DISCOVERY
// =============================================================================

/**
 * Perform advanced discovery with enhanced features
 */
function performAdvancedDiscovery() {
    try {
        updateAdvancedStatus('Starting advanced discovery process...');

        // Run live analysis first
        runLiveDocumentAnalysis();

        if (!g_advUI_advancedDOMStructure) {
            updateAdvancedStatus('Advanced discovery failed - no analysis data');
            return;
        }

        // Run deep mapping if available
        if (functionExists('performDeepDOMMapping')) {
            updateAdvancedStatus('Performing deep object mapping...');

            var mappingConfig = {
                maxDepth: 10,
                enableCircularReferenceMapping: true,
                enableRelationshipAnalysis: true,
                enablePerformanceMapping: true,
                generateObjectAtlas: true,
                analyzeAccessPatterns: true
            };

            var mappingResult = performDeepDOMMapping(g_advUI_advancedDOMStructure, mappingConfig);

            if (mappingResult.success) {
                // Enhance structure with mapping data
                g_advUI_advancedDOMStructure.deepMapping = mappingResult.mapping;
            }
        }

        // Display enhanced results
        var discoveryDisplay = g_advUI_window.mainTabs.discoveryTab.discoveryDisplay.text;
        if (discoveryDisplay) {
            discoveryDisplay.text = generateAdvancedDiscoveryDisplay(g_advUI_advancedDOMStructure);
        }

        updateAdvancedStatus('Advanced discovery complete with enhanced analysis');

    } catch (exc) {
        updateAdvancedStatus('Advanced discovery error: ' + exc.message);
    }
}

/**
 * Generate advanced discovery display
 */
function generateAdvancedDiscoveryDisplay(domStructure) {
    try {
        var builder = createStringBuilder();

        builder.appendLine('ADVANCED DOM DISCOVERY RESULTS');
        builder.appendLine('==============================');
        builder.appendLine('Generated: ' + getCurrentTimestamp());
        builder.appendLine('');

        // Enhanced statistics
        if (domStructure.statistics) {
            builder.appendLine('COMPREHENSIVE STATISTICS:');
            builder.appendLine('Total Discovery Time: ' + (domStructure.statistics.totalTime || 'Unknown') + 'ms');
            builder.appendLine('Performance Rating: ' + calculatePerformanceRating(domStructure));
            builder.appendLine('Memory Usage: ' + (domStructure.statistics.memoryUsage || 'Unknown'));
            builder.appendLine('');
        }

        // Deep mapping results
        if (domStructure.deepMapping) {
            builder.appendLine('DEEP MAPPING ANALYSIS:');
            if (domStructure.deepMapping.summary) {
                builder.appendLine('Objects Mapped: ' + (domStructure.deepMapping.summary.objectCount || 0));
                builder.appendLine('Relationships: ' + (domStructure.deepMapping.summary.relationshipCount || 0));
                builder.appendLine('Circular References: ' + (domStructure.deepMapping.summary.circularRefCount || 0));
            }
            builder.appendLine('');
        }

        // Performance insights
        if (domStructure.performanceInsights) {
            builder.appendLine('PERFORMANCE INSIGHTS:');
            for (var i = 0; i < domStructure.performanceInsights.length; i++) {
                builder.appendLine('• ' + domStructure.performanceInsights[i]);
            }
            builder.appendLine('');
        }

        // Detailed structure with enhanced information
        builder.appendLine('DETAILED STRUCTURE ANALYSIS:');
        builder.appendLine('-----------------------------');

        if (domStructure.structure && domStructure.structure.length > 0) {
            var detailCount = Math.min(20, domStructure.structure.length);
            for (var j = 0; j < detailCount; j++) {
                var node = domStructure.structure[j];
                var indent = '';
                for (var d = 0; d < (node.depth || 0); d++) {
                    indent += '  ';
                }

                var nodeText = indent + (node.path || node.name || 'Unknown');

                // Add type information
                if (node.type) {
                    nodeText += ' [' + node.type + ']';
                }

                // Add safety level
                if (node.safetyLevel) {
                    nodeText += ' {' + node.safetyLevel + '}';
                }

                // Add value preview if available
                if (node.sampledValue !== undefined) {
                    var valuePreview = formatValuePreview(node.sampledValue);
                    nodeText += ' = ' + valuePreview;
                }

                builder.appendLine(nodeText);
            }

            if (domStructure.structure.length > detailCount) {
                builder.appendLine('... (' + (domStructure.structure.length - detailCount) + ' more items)');
            }
        }

        return builder.toString();

    } catch (exc) {
        return 'Error generating advanced discovery display: ' + exc.message;
    }
}

/**
 * Calculate performance rating
 */
function calculatePerformanceRating(domStructure) {
    try {
        if (!domStructure.statistics || !domStructure.statistics.totalTime) {
            return 'Unknown';
        }

        var totalTime = domStructure.statistics.totalTime;
        var nodeCount = domStructure.statistics.nodeCount || 1;
        var timePerNode = totalTime / nodeCount;

        if (timePerNode < 1) return 'Excellent';
        if (timePerNode < 5) return 'Good';
        if (timePerNode < 10) return 'Fair';
        return 'Needs Optimization';

    } catch (exc) {
        return 'Unknown';
    }
}

/**
 * Format value preview
 */
function formatValuePreview(value) {
    try {
        if (value === null) return '[null]';
        if (value === undefined) return '[undefined]';

        var valueStr = safeToString(value);
        if (valueStr.length > 80) {
            valueStr = stringSubstring(valueStr, 0, 80) + '...';
        }

        // Add quotes for strings
        if (typeof value === 'string') {
            return '"' + valueStr + '"';
        }

        return valueStr;

    } catch (exc) {
        return '[Error formatting value]';
    }
}

/**
 * Run deep mapping analysis
 */
function runDeepMapping() {
    try {
        if (!g_advUI_advancedDOMStructure) {
            updateAdvancedStatus('No DOM structure available. Run Full Discovery first.');
            return;
        }

        if (!functionExists('performDeepDOMMapping')) {
            updateAdvancedStatus('Error: Deep mapper module not available');
            return;
        }

        updateAdvancedStatus('Performing deep object mapping analysis...');

        var mappingConfig = {
            maxDepth: 15,
            enableCircularReferenceMapping: true,
            enableRelationshipAnalysis: true,
            enablePerformanceMapping: true,
            generateObjectAtlas: true,
            analyzeAccessPatterns: true,
            generateOptimizations: true
        };

        var mappingResult = performDeepDOMMapping(g_advUI_advancedDOMStructure, mappingConfig);

        if (!mappingResult.success) {
            updateAdvancedStatus('Deep mapping failed: ' + mappingResult.error);
            return;
        }

        // Display results in deep mapping tab
        if (g_advUI_deepMappingText) {
            g_advUI_deepMappingText.text = generateDeepMappingDisplay(mappingResult.mapping);
        }

        updateAdvancedStatus('Deep mapping analysis complete');

    } catch (exc) {
        updateAdvancedStatus('Deep mapping error: ' + exc.message);
    }
}

/**
 * Analyze performance characteristics
 */
function analyzePerformance() {
    try {
        if (!g_advUI_advancedDOMStructure) {
            updateAdvancedStatus('No DOM structure available. Run Full Discovery first.');
            return;
        }

        updateAdvancedStatus('Analyzing performance characteristics...');

        var performanceAnalysis = generatePerformanceAnalysis(g_advUI_advancedDOMStructure);

        // Display results in discovery tab
        var discoveryDisplay = g_advUI_window.mainTabs.discoveryTab.discoveryDisplay.text;
        if (discoveryDisplay) {
            discoveryDisplay.text = performanceAnalysis;
        }

        updateAdvancedStatus('Performance analysis complete');

    } catch (exc) {
        updateAdvancedStatus('Performance analysis error: ' + exc.message);
    }
}

/**
 * Generate performance analysis
 */
function generatePerformanceAnalysis(domStructure) {
    try {
        var builder = createStringBuilder();

        builder.appendLine('PERFORMANCE ANALYSIS REPORT');
        builder.appendLine('===========================');
        builder.appendLine('Generated: ' + getCurrentTimestamp());
        builder.appendLine('');

        // Timing analysis
        if (domStructure.statistics) {
            builder.appendLine('TIMING ANALYSIS:');
            builder.appendLine('Total Time: ' + (domStructure.statistics.totalTime || 'Unknown') + 'ms');
            builder.appendLine('Enumeration Time: ' + (domStructure.statistics.enumerationTime || 'Unknown') + 'ms');
            builder.appendLine('Sampling Time: ' + (domStructure.statistics.samplingTime || 'Unknown') + 'ms');
            builder.appendLine('Collection Time: ' + (domStructure.statistics.collectionTime || 'Unknown') + 'ms');
            builder.appendLine('');
        }

        // Efficiency metrics
        builder.appendLine('EFFICIENCY METRICS:');
        var nodeCount = domStructure.statistics ? domStructure.statistics.nodeCount : 0;
        var totalTime = domStructure.statistics ? domStructure.statistics.totalTime : 0;
        if (nodeCount > 0 && totalTime > 0) {
            builder.appendLine('Nodes per Second: ' + Math.round((nodeCount / totalTime) * 1000));
            builder.appendLine('Time per Node: ' + Math.round(totalTime / nodeCount) + 'ms');
        }
        builder.appendLine('');

        // Memory analysis
        builder.appendLine('MEMORY ANALYSIS:');
        if (domStructure.statistics && domStructure.statistics.memoryUsage) {
            builder.appendLine('Memory Usage: ' + domStructure.statistics.memoryUsage);
        } else {
            builder.appendLine('Memory Usage: Not tracked');
        }
        builder.appendLine('');

        // Performance recommendations
        builder.appendLine('PERFORMANCE RECOMMENDATIONS:');
        var recommendations = generatePerformanceRecommendations(domStructure);
        for (var i = 0; i < recommendations.length; i++) {
            builder.appendLine('• ' + recommendations[i]);
        }

        return builder.toString();

    } catch (exc) {
        return 'Error generating performance analysis: ' + exc.message;
    }
}

/**
 * Generate performance recommendations
 */
function generatePerformanceRecommendations(domStructure) {
    try {
        var recommendations = [];

        if (!domStructure.statistics) {
            recommendations.push('Enable statistics collection for better performance insights');
            return recommendations;
        }

        var stats = domStructure.statistics;
        var totalTime = stats.totalTime || 0;
        var nodeCount = stats.nodeCount || 0;

        if (totalTime > 30000) { // > 30 seconds
            recommendations.push('Consider reducing maxDepth or maxProperties to improve performance');
        }

        if (nodeCount > 10000) {
            recommendations.push('Large structure detected - consider using selective enumeration');
        }

        if (stats.timeoutCount && stats.timeoutCount > 0) {
            recommendations.push('Timeouts detected - increase timeout values or reduce scope');
        }

        if (stats.errorCount && stats.errorCount > 10) {
            recommendations.push('High error count - review dangerous property settings');
        }

        if (recommendations.length === 0) {
            recommendations.push('Performance appears optimal for current configuration');
        }

        return recommendations;

    } catch (exc) {
        return ['Error generating recommendations'];
    }
}

/**
 * Clear discovery display
 */
function clearDiscoveryDisplay() {
    try {
        var discoveryDisplay = g_advUI_window.mainTabs.discoveryTab.discoveryDisplay.text;
        if (discoveryDisplay) {
            discoveryDisplay.text = '';
        }
        updateAdvancedStatus('Discovery display cleared');
    } catch (exc) {
        updateAdvancedStatus('Clear discovery display error: ' + exc.message);
    }
}

// =============================================================================
// JSON ANALYSIS
// =============================================================================

/**
 * Load JSON export for analysis
 */
function loadJSONExport() {
    try {
        updateAdvancedStatus('Select JSON file for analysis...');

        var file = File.openDialog('Select DOM JSON Export', '*.json');
        if (!file) {
            updateAdvancedStatus('File selection cancelled');
            return;
        }

        if (!functionExists('readAndParseJSONFile')) {
            updateAdvancedStatus('Error: JSON parser not available');
            return;
        }

        var parseResult = readAndParseJSONFile(file.fsName);
        if (!parseResult.success) {
            updateAdvancedStatus('JSON parsing failed: ' + parseResult.error);
            return;
        }

        g_advUI_loadedJSONData = parseResult.data;
        updateAdvancedStatus('JSON file loaded: ' + file.name);

        // Auto-analyze if analyzer is available
        if (functionExists('analyzeLoadedJSON')) {
            runJSONAnalysis();
        }

    } catch (exc) {
        updateAdvancedStatus('JSON loading error: ' + exc.message);
    }
}

/**
 * Run JSON analysis
 */
function runJSONAnalysis() {
    try {
        var dataToAnalyze = g_advUI_loadedJSONData || g_advUI_advancedDOMStructure;

        if (!dataToAnalyze) {
            updateAdvancedStatus('No data available for analysis. Load JSON file or run discovery.');
            return;
        }

        if (!functionExists('analyzeLoadedJSON')) {
            updateAdvancedStatus('Error: JSON analyzer module not available');
            return;
        }

        updateAdvancedStatus('Analyzing JSON structure...');

        var analysisConfig = ADVANCED_UI_CONFIG.analysis;
        var analysisResult = analyzeLoadedJSON(dataToAnalyze, analysisConfig);

        if (!analysisResult.success) {
            updateAdvancedStatus('JSON analysis failed: ' + analysisResult.error);
            return;
        }

        g_advUI_currentAnalysis = analysisResult.analysis;

        // Display results
        var displayText = generateJSONAnalysisDisplay(analysisResult.analysis);
        if (g_advUI_jsonAnalysisText) {
            g_advUI_jsonAnalysisText.text = displayText;
        }

        updateAdvancedStatus('JSON analysis complete');

    } catch (exc) {
        updateAdvancedStatus('JSON analysis error: ' + exc.message);
    }
}

/**
 * Generate JSON analysis display
 */
function generateJSONAnalysisDisplay(analysis) {
    try {
        var builder = createStringBuilder();

        builder.appendLine('JSON STRUCTURE ANALYSIS');
        builder.appendLine('=======================');
        builder.appendLine('Generated: ' + getCurrentTimestamp());
        builder.appendLine('');

        // Summary
        if (analysis.summary) {
            builder.appendLine('ANALYSIS SUMMARY:');
            builder.appendLine('Total Nodes: ' + (analysis.summary.nodeCount || 0));
            builder.appendLine('Properties: ' + (analysis.summary.propertyCount || 0));
            builder.appendLine('Collections: ' + (analysis.summary.collectionCount || 0));
            builder.appendLine('Max Depth: ' + (analysis.summary.maxDepth || 0));
            builder.appendLine('Complexity Score: ' + (analysis.summary.complexityScore || 'Unknown'));
            builder.appendLine('');
        }

        // Visual hierarchy
        if (analysis.visualHierarchy) {
            builder.appendLine('VISUAL HIERARCHY:');
            builder.appendLine(analysis.visualHierarchy);
            builder.appendLine('');
        }

        // Property analysis
        if (analysis.propertyAnalysis) {
            builder.appendLine('PROPERTY ANALYSIS:');
            builder.appendLine(analysis.propertyAnalysis);
            builder.appendLine('');
        }

        // Collection analysis
        if (analysis.collectionAnalysis) {
            builder.appendLine('COLLECTION ANALYSIS:');
            builder.appendLine(analysis.collectionAnalysis);
            builder.appendLine('');
        }

        // Value analysis
        if (analysis.valueAnalysis) {
            builder.appendLine('VALUE ANALYSIS:');
            builder.appendLine(analysis.valueAnalysis);
            builder.appendLine('');
        }

        // Developer guide
        if (analysis.developerGuide) {
            builder.appendLine('DEVELOPER GUIDE:');
            builder.appendLine(analysis.developerGuide);
            builder.appendLine('');
        }

        // Performance metrics
        if (analysis.performanceMetrics) {
            builder.appendLine('PERFORMANCE METRICS:');
            builder.appendLine(analysis.performanceMetrics);
        }

        return builder.toString();

    } catch (exc) {
        return 'Error generating JSON analysis display: ' + exc.message;
    }
}

/**
 * Visualize JSON structure
 */
function visualizeJSON() {
    try {
        if (!g_advUI_currentAnalysis) {
            updateAdvancedStatus('No analysis data available. Run analysis first.');
            return;
        }

        // Show main DOM visualizer with current data
        if (functionExists('showDOMVisualizer')) {
            showDOMVisualizer();
            updateAdvancedStatus('DOM Visualizer opened with current data');
        } else {
            updateAdvancedStatus('Error: DOM visualizer not available');
        }

    } catch (exc) {
        updateAdvancedStatus('Visualization error: ' + exc.message);
    }
}

/**
 * Export JSON analysis
 */
function exportJSONAnalysis() {
    try {
        if (!g_advUI_currentAnalysis) {
            updateAdvancedStatus('No analysis data to export. Run analysis first.');
            return;
        }

        updateAdvancedStatus('Exporting JSON analysis...');

        var exportText = generateJSONAnalysisText(g_advUI_currentAnalysis);

        var fileName = 'JSON_Analysis_' + getCurrentTimestamp().replace(/[:\s]/g, '-') + '.txt';
        var file = File.saveDialog('Export JSON Analysis', fileName);

        if (file) {
            file.open('w');
            file.write(exportText);
            file.close();

            updateAdvancedStatus('JSON analysis exported to: ' + file.name);
        } else {
            updateAdvancedStatus('Analysis export cancelled');
        }

    } catch (exc) {
        updateAdvancedStatus('Analysis export error: ' + exc.message);
    }
}

/**
 * Generate JSON analysis text for export
 */
function generateJSONAnalysisText(analysis) {
    try {
        var builder = createStringBuilder();

        builder.appendLine('InDesign DOM Discovery Builder v3.1');
        builder.appendLine('JSON Structure Analysis Report');
        builder.appendLine('=====================================');
        builder.appendLine('Generated: ' + getCurrentTimestamp());
        builder.appendLine('');

        // Full analysis content
        if (analysis.summary) {
            builder.appendLine('EXECUTIVE SUMMARY:');
            builder.appendLine('Total Elements: ' + (analysis.summary.nodeCount || 0));
            builder.appendLine('Structural Complexity: ' + (analysis.summary.complexityScore || 'Unknown'));
            builder.appendLine('Analysis Confidence: ' + (analysis.summary.confidence || 'Unknown'));
            builder.appendLine('');
        }

        if (analysis.visualHierarchy) {
            builder.appendLine('STRUCTURAL HIERARCHY:');
            builder.appendLine(analysis.visualHierarchy);
            builder.appendLine('');
        }

        if (analysis.propertyAnalysis) {
            builder.appendLine('DETAILED PROPERTY ANALYSIS:');
            builder.appendLine(analysis.propertyAnalysis);
            builder.appendLine('');
        }

        if (analysis.collectionAnalysis) {
            builder.appendLine('COLLECTION ANALYSIS:');
            builder.appendLine(analysis.collectionAnalysis);
            builder.appendLine('');
        }

        if (analysis.valueAnalysis) {
            builder.appendLine('VALUE ANALYSIS:');
            builder.appendLine(analysis.valueAnalysis);
            builder.appendLine('');
        }

        if (analysis.accessibilityMap) {
            builder.appendLine('ACCESSIBILITY MAP:');
            builder.appendLine(analysis.accessibilityMap);
            builder.appendLine('');
        }

        if (analysis.developerGuide) {
            builder.appendLine('DEVELOPER GUIDE:');
            builder.appendLine(analysis.developerGuide);
            builder.appendLine('');
        }

        if (analysis.performanceMetrics) {
            builder.appendLine('PERFORMANCE METRICS:');
            builder.appendLine(analysis.performanceMetrics);
            builder.appendLine('');
        }

        builder.appendLine('End of Analysis Report');
        builder.appendLine('Generated by InDesign DOM Discovery Builder v3.1');

        return builder.toString();

    } catch (exc) {
        return 'Error generating analysis text: ' + exc.message;
    }
}

/**
 * Clear analysis display
 */
function clearAnalysisDisplay() {
    try {
        if (g_advUI_jsonAnalysisText) {
            g_advUI_jsonAnalysisText.text = '';
        }
        g_advUI_currentAnalysis = null;
        updateAdvancedStatus('Analysis display cleared');
    } catch (exc) {
        updateAdvancedStatus('Clear analysis display error: ' + exc.message);
    }
}

// =============================================================================
// SNAPSHOT COMPARISON
// =============================================================================

/**
 * Load before snapshot
 */
function loadBeforeSnapshot() {
    try {
        updateAdvancedStatus('Select BEFORE snapshot...');

        var file = File.openDialog('Select Before JSON Snapshot', '*.json');
        if (!file) {
            updateAdvancedStatus('Before file selection cancelled');
            return;
        }

        if (!functionExists('readAndParseJSONFile')) {
            updateAdvancedStatus('Error: JSON parser not available');
            return;
        }

        var parseResult = readAndParseJSONFile(file.fsName);
        if (!parseResult.success) {
            updateAdvancedStatus('Before file parsing failed: ' + parseResult.error);
            return;
        }

        g_advUI_beforeData = parseResult.data;
        updateAdvancedStatus('Before snapshot loaded: ' + file.name);

    } catch (exc) {
        updateAdvancedStatus('Before snapshot loading error: ' + exc.message);
    }
}

/**
 * Load after snapshot
 */
function loadAfterSnapshot() {
    try {
        updateAdvancedStatus('Select AFTER snapshot...');

        var file = File.openDialog('Select After JSON Snapshot', '*.json');
        if (!file) {
            updateAdvancedStatus('After file selection cancelled');
            return;
        }

        if (!functionExists('readAndParseJSONFile')) {
            updateAdvancedStatus('Error: JSON parser not available');
            return;
        }

        var parseResult = readAndParseJSONFile(file.fsName);
        if (!parseResult.success) {
            updateAdvancedStatus('After file parsing failed: ' + parseResult.error);
            return;
        }

        g_advUI_afterData = parseResult.data;
        updateAdvancedStatus('After snapshot loaded: ' + file.name);

    } catch (exc) {
        updateAdvancedStatus('After snapshot loading error: ' + exc.message);
    }
}

/**
 * Run snapshot comparison
 */
function runSnapshotComparison() {
    try {
        if (!g_advUI_beforeData || !g_advUI_afterData) {
            updateAdvancedStatus('Both before and after snapshots must be loaded');
            return;
        }

        if (!functionExists('compareDOMExports')) {
            updateAdvancedStatus('Error: DOM comparator module not available');
            return;
        }

        updateAdvancedStatus('Comparing snapshots...');

        var comparisonConfig = ADVANCED_UI_CONFIG.comparison;
        var comparisonResult = compareDOMExports(g_advUI_beforeData, g_advUI_afterData, comparisonConfig);

        if (!comparisonResult.success) {
            updateAdvancedStatus('Comparison failed: ' + comparisonResult.error);
            return;
        }

        // Display results
        var displayText = generateComparisonDisplay(comparisonResult.comparison);
        if (g_advUI_comparisonText) {
            g_advUI_comparisonText.text = displayText;
        }

        updateAdvancedStatus('Snapshot comparison complete');

    } catch (exc) {
        updateAdvancedStatus('Snapshot comparison error: ' + exc.message);
    }
}

/**
 * Generate comparison display
 */
function generateComparisonDisplay(comparison) {
    try {
        var builder = createStringBuilder();

        builder.appendLine('SNAPSHOT COMPARISON RESULTS');
        builder.appendLine('===========================');
        builder.appendLine('Generated: ' + getCurrentTimestamp());
        builder.appendLine('');

        // Summary
        if (comparison.summary) {
            builder.appendLine('COMPARISON SUMMARY:');
            builder.appendLine('Total Changes: ' + (comparison.summary.totalChanges || 0));
            builder.appendLine('Added Elements: ' + (comparison.summary.addedCount || 0));
            builder.appendLine('Removed Elements: ' + (comparison.summary.removedCount || 0));
            builder.appendLine('Modified Elements: ' + (comparison.summary.modifiedCount || 0));
            builder.appendLine('Change Impact: ' + (comparison.summary.impactLevel || 'Unknown'));
            builder.appendLine('');
        }

        // Structural changes
        if (comparison.structuralChanges) {
            builder.appendLine('STRUCTURAL CHANGES:');
            builder.appendLine(comparison.structuralChanges);
            builder.appendLine('');
        }

        // Property changes
        if (comparison.propertyChanges) {
            builder.appendLine('PROPERTY CHANGES:');
            builder.appendLine(comparison.propertyChanges);
            builder.appendLine('');
        }

        // Collection changes
        if (comparison.collectionChanges) {
            builder.appendLine('COLLECTION CHANGES:');
            builder.appendLine(comparison.collectionChanges);
            builder.appendLine('');
        }

        // Value changes
        if (comparison.valueChanges) {
            builder.appendLine('VALUE CHANGES:');
            builder.appendLine(comparison.valueChanges);
            builder.appendLine('');
        }

        // Performance impact
        if (comparison.performanceImpact) {
            builder.appendLine('PERFORMANCE IMPACT:');
            builder.appendLine(comparison.performanceImpact);
            builder.appendLine('');
        }

        // Recommendations
        if (comparison.recommendations) {
            builder.appendLine('RECOMMENDATIONS:');
            builder.appendLine(comparison.recommendations);
        }

        return builder.toString();

    } catch (exc) {
        return 'Error generating comparison display: ' + exc.message;
    }
}

/**
 * Export comparison report
 */
function exportComparisonReport() {
    try {
        if (!g_advUI_comparisonText || !g_advUI_comparisonText.text) {
            updateAdvancedStatus('No comparison data to export. Run comparison first.');
            return;
        }

        updateAdvancedStatus('Exporting comparison report...');

        var fileName = 'Comparison_Report_' + getCurrentTimestamp().replace(/[:\s]/g, '-') + '.txt';
        var file = File.saveDialog('Export Comparison Report', fileName);

        if (file) {
            file.open('w');
            file.write(g_advUI_comparisonText.text);
            file.close();

            updateAdvancedStatus('Comparison report exported to: ' + file.name);
        } else {
            updateAdvancedStatus('Report export cancelled');
        }

    } catch (exc) {
        updateAdvancedStatus('Report export error: ' + exc.message);
    }
}

/**
 * Clear comparison display
 */
function clearComparisonDisplay() {
    try {
        if (g_advUI_comparisonText) {
            g_advUI_comparisonText.text = '';
        }
        updateAdvancedStatus('Comparison display cleared');
    } catch (exc) {
        updateAdvancedStatus('Clear comparison display error: ' + exc.message);
    }
}

// =============================================================================
// DEEP OBJECT MAPPING
// =============================================================================

/**
 * Create deep mapping
 */
function createDeepMapping() {
    try {
        var dataToMap = g_advUI_advancedDOMStructure || g_advUI_loadedJSONData;

        if (!dataToMap) {
            updateAdvancedStatus('No data available for mapping. Run discovery or load JSON first.');
            return;
        }

        if (!functionExists('performDeepDOMMapping')) {
            updateAdvancedStatus('Error: Deep mapper module not available');
            return;
        }

        updateAdvancedStatus('Creating deep object mapping...');

        var mappingConfig = {
            maxDepth: 20,
            enableCircularReferenceMapping: true,
            enableRelationshipAnalysis: true,
            enablePerformanceMapping: true,
            generateObjectAtlas: true,
            analyzeAccessPatterns: true,
            generateOptimizations: true,
            trackMemoryUsage: true
        };

        var mappingResult = performDeepDOMMapping(dataToMap, mappingConfig);

        if (!mappingResult.success) {
            updateAdvancedStatus('Deep mapping failed: ' + mappingResult.error);
            return;
        }

        // Display results
        var displayText = generateDeepMappingDisplay(mappingResult.mapping);
        if (g_advUI_deepMappingText) {
            g_advUI_deepMappingText.text = displayText;
        }

        updateAdvancedStatus('Deep mapping complete');

    } catch (exc) {
        updateAdvancedStatus('Deep mapping error: ' + exc.message);
    }
}

/**
 * Generate deep mapping display
 */
function generateDeepMappingDisplay(mapping) {
    try {
        var builder = createStringBuilder();

        builder.appendLine('DEEP OBJECT MAPPING RESULTS');
        builder.appendLine('===========================');
        builder.appendLine('Generated: ' + getCurrentTimestamp());
        builder.appendLine('');

        // Mapping summary
        if (mapping.summary) {
            builder.appendLine('MAPPING SUMMARY:');
            builder.appendLine('Objects Mapped: ' + (mapping.summary.objectCount || 0));
            builder.appendLine('Relationships: ' + (mapping.summary.relationshipCount || 0));
            builder.appendLine('Circular References: ' + (mapping.summary.circularRefCount || 0));
            builder.appendLine('Memory References: ' + (mapping.summary.memoryRefCount || 0));
            builder.appendLine('Mapping Depth: ' + (mapping.summary.maxDepth || 0));
            builder.appendLine('');
        }

        // Object atlas
        if (mapping.objectAtlas) {
            builder.appendLine('OBJECT ATLAS:');
            if (typeof mapping.objectAtlas === 'string') {
                builder.appendLine(stringSubstring(mapping.objectAtlas, 0, 2000));
                if (mapping.objectAtlas.length > 2000) {
                    builder.appendLine('... (truncated - full atlas available in export)');
                }
            } else {
                builder.appendLine('Atlas data available - use export for full details');
            }
            builder.appendLine('');
        }

        // Relationship analysis
        if (mapping.relationshipAnalysis) {
            builder.appendLine('RELATIONSHIP ANALYSIS:');
            builder.appendLine(stringSubstring(mapping.relationshipAnalysis, 0, 1500));
            if (mapping.relationshipAnalysis.length > 1500) {
                builder.appendLine('... (truncated)');
            }
            builder.appendLine('');
        }

        // Performance mapping
        if (mapping.performanceMapping) {
            builder.appendLine('PERFORMANCE MAPPING:');
            builder.appendLine(mapping.performanceMapping);
            builder.appendLine('');
        }

        // Optimization recommendations
        if (mapping.optimizations) {
            builder.appendLine('OPTIMIZATION RECOMMENDATIONS:');
            if (mapping.optimizations.length) {
                for (var i = 0; i < Math.min(10, mapping.optimizations.length); i++) {
                    builder.appendLine('• ' + mapping.optimizations[i]);
                }
                if (mapping.optimizations.length > 10) {
                    builder.appendLine('... (' + (mapping.optimizations.length - 10) + ' more recommendations)');
                }
            } else {
                builder.appendLine('No specific optimizations identified');
            }
        }

        return builder.toString();

    } catch (exc) {
        return 'Error generating deep mapping display: ' + exc.message;
    }
}

/**
 * Generate advanced atlas
 */
function generateAdvancedAtlas() {
    try {
        var dataToMap = g_advUI_advancedDOMStructure || g_advUI_loadedJSONData;

        if (!dataToMap) {
            updateAdvancedStatus('No data available for atlas generation. Run discovery or load JSON first.');
            return;
        }

        if (!functionExists('generateObjectAtlas')) {
            updateAdvancedStatus('Error: Object atlas generator not available');
            return;
        }

        updateAdvancedStatus('Generating advanced object atlas...');

        var atlasResult = generateObjectAtlas(dataToMap);

        if (!atlasResult.success) {
            updateAdvancedStatus('Atlas generation failed: ' + atlasResult.error);
            return;
        }

        // Display results
        var displayText = generateAtlasDisplay(atlasResult.atlas);
        if (g_advUI_deepMappingText) {
            g_advUI_deepMappingText.text = displayText;
        }

        updateAdvancedStatus('Advanced object atlas generated');

    } catch (exc) {
        updateAdvancedStatus('Atlas generation error: ' + exc.message);
    }
}

/**
 * Generate atlas display
 */
function generateAtlasDisplay(atlas) {
    try {
        var builder = createStringBuilder();

        builder.appendLine('ADVANCED OBJECT ATLAS');
        builder.appendLine('=====================');
        builder.appendLine('Generated: ' + getCurrentTimestamp());
        builder.appendLine('');

        // Path index
        if (atlas.pathIndex) {
            builder.appendLine('PATH INDEX:');
            builder.appendLine(stringSubstring(atlas.pathIndex, 0, 1000));
            if (atlas.pathIndex.length > 1000) {
                builder.appendLine('... (truncated - full index available in export)');
            }
            builder.appendLine('');
        }

        // Type index
        if (atlas.typeIndex) {
            builder.appendLine('TYPE INDEX:');
            builder.appendLine(stringSubstring(atlas.typeIndex, 0, 1000));
            if (atlas.typeIndex.length > 1000) {
                builder.appendLine('... (truncated)');
            }
            builder.appendLine('');
        }

        // Relationship map
        if (atlas.relationshipMap) {
            builder.appendLine('RELATIONSHIP MAP:');
            builder.appendLine(stringSubstring(atlas.relationshipMap, 0, 1000));
            if (atlas.relationshipMap.length > 1000) {
                builder.appendLine('... (truncated)');
            }
            builder.appendLine('');
        }

        // Access patterns
        if (atlas.accessPatterns) {
            builder.appendLine('ACCESS PATTERNS:');
            builder.appendLine(atlas.accessPatterns);
        }

        return builder.toString();

    } catch (exc) {
        return 'Error generating atlas display: ' + exc.message;
    }
}

/**
 * Optimize mapping
 */
function optimizeMapping() {
    try {
        var dataToOptimize = g_advUI_advancedDOMStructure || g_advUI_loadedJSONData;

        if (!dataToOptimize) {
            updateAdvancedStatus('No data available for optimization. Run discovery or load JSON first.');
            return;
        }

        if (!functionExists('generatePerformanceOptimizations')) {
            updateAdvancedStatus('Error: Performance optimizer not available');
            return;
        }

        updateAdvancedStatus('Analyzing optimization opportunities...');

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
 * Generate optimization display
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
        builder.appendLine('• High Impact: Items 1-3');
        builder.appendLine('• Medium Impact: Items 4-7');
        builder.appendLine('• Low Impact: Remaining items');

        return builder.toString();

    } catch (exc) {
        return 'Error generating optimization display: ' + exc.message;
    }
}

/**
 * Clear mapping display
 */
function clearMappingDisplay() {
    try {
        if (g_advUI_deepMappingText) {
            g_advUI_deepMappingText.text = '';
        }
        updateAdvancedStatus('Mapping display cleared');
    } catch (exc) {
        updateAdvancedStatus('Clear mapping display error: ' + exc.message);
    }
}

// =============================================================================
// EXPORT AND UTILITIES
// =============================================================================

/**
 * Perform advanced export
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
 * Generate comprehensive report
 */
function generateComprehensiveReport() {
    try {
        updateAdvancedStatus('Generating comprehensive analysis report...');

        var dataForReport = g_advUI_advancedDOMStructure || g_advUI_loadedJSONData;

        if (!dataForReport) {
            updateAdvancedStatus('No data available for report. Run discovery or load JSON first.');
            return;
        }

        var reportText = generateFullAnalysisReport(dataForReport);

        var fileName = 'Comprehensive_Report_' + getCurrentTimestamp().replace(/[:\s]/g, '-') + '.txt';
        var file = File.saveDialog('Save Comprehensive Report', fileName);

        if (file) {
            file.open('w');
            file.write(reportText);
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
 * Generate full analysis report
 */
function generateFullAnalysisReport(data) {
    try {
        var builder = createStringBuilder();

        builder.appendLine('INDESIGN DOM DISCOVERY BUILDER v3.1');
        builder.appendLine('COMPREHENSIVE ANALYSIS REPORT');
        builder.appendLine('=====================================');
        builder.appendLine('Generated: ' + getCurrentTimestamp());
        builder.appendLine('');

        // Executive summary
        builder.appendLine('EXECUTIVE SUMMARY:');
        builder.appendLine('This report provides a comprehensive analysis of the InDesign document DOM structure,');
        builder.appendLine('including detailed enumeration, value sampling, collection analysis, and performance metrics.');
        builder.appendLine('');

        // Document information
        if (data.metadata) {
            builder.appendLine('DOCUMENT INFORMATION:');
            builder.appendLine('Document: ' + (data.metadata.documentName || 'Unknown'));
            builder.appendLine('Analysis Version: ' + (data.metadata.version || 'Unknown'));
            builder.appendLine('InDesign Version: ' + (data.metadata.environment ?
                data.metadata.environment.indesignVersion : 'Unknown'));
            builder.appendLine('Analysis Date: ' + (data.metadata.timestamp || 'Unknown'));
            builder.appendLine('');
        }

        // Statistical overview
        if (data.statistics) {
            builder.appendLine('STATISTICAL OVERVIEW:');
            builder.appendLine('Total Elements: ' + (data.statistics.nodeCount || 0));
            builder.appendLine('Properties: ' + (data.statistics.propertyCount || 0));
            builder.appendLine('Collections: ' + (data.statistics.collectionCount || 0));
            builder.appendLine('Methods: ' + (data.statistics.methodCount || 0));
            builder.appendLine('Maximum Depth: ' + (data.statistics.maxDepth || 0));
            builder.appendLine('Analysis Duration: ' + (data.statistics.totalTime || 'Unknown') + 'ms');
            builder.appendLine('');
        }

        // Detailed structure analysis
        builder.appendLine('DETAILED STRUCTURE ANALYSIS:');
        builder.appendLine('============================');

        if (data.structure && data.structure.length > 0) {
            var analysisCount = Math.min(50, data.structure.length);
            for (var i = 0; i < analysisCount; i++) {
                var node = data.structure[i];
                var indent = '';
                for (var d = 0; d < (node.depth || 0); d++) {
                    indent += '  ';
                }

                var nodeInfo = indent + (node.path || node.name || 'Unknown');
                if (node.type) nodeInfo += ' [' + node.type + ']';
                if (node.safetyLevel) nodeInfo += ' {' + node.safetyLevel + '}';
                if (node.sampledValue !== undefined) {
                    nodeInfo += ' = ' + formatValuePreview(node.sampledValue);
                }

                builder.appendLine(nodeInfo);
            }

            if (data.structure.length > analysisCount) {
                builder.appendLine('... (' + (data.structure.length - analysisCount) + ' more items)');
            }
        }

        builder.appendLine('');
        builder.appendLine('END OF COMPREHENSIVE REPORT');
        builder.appendLine('Generated by InDesign DOM Discovery Builder v3.1');

        return builder.toString();

    } catch (exc) {
        return 'Error generating comprehensive report: ' + exc.message;
    }
}

/**
 * Show main DOM visualizer
 */
function showMainDOMVisualizer() {
    try {
        if (functionExists('showDOMVisualizer')) {
            showDOMVisualizer();
            updateAdvancedStatus('Main DOM Visualizer opened');
        } else {
            updateAdvancedStatus('Error: DOM visualizer module not available');
        }
    } catch (exc) {
        updateAdvancedStatus('Main visualizer error: ' + exc.message);
    }
}

/**
 * Show module status
 */
function showModuleStatus() {
    try {
        var statusReport = '';

        if (functionExists('generateLoadingReport')) {
            statusReport = generateLoadingReport();
        } else {
            statusReport = 'Module status reporting not available';
        }

        // Display in a dialog
        var statusDialog = new Window('dialog', 'Module Status Report');
        statusDialog.orientation = 'column';
        statusDialog.alignChildren = 'fill';
        statusDialog.preferredSize.width = 600;
        statusDialog.preferredSize.height = 400;

        var statusText = statusDialog.add('edittext', undefined, statusReport, { multiline: true, scrolling: true });
        statusText.alignment = 'fill';

        var closeButton = statusDialog.add('button', undefined, 'Close');
        closeButton.onClick = function () { statusDialog.close(); };

        statusDialog.show();

    } catch (exc) {
        updateAdvancedStatus('Module status error: ' + exc.message);
    }
}

/**
 * Show advanced configuration
 */
function showAdvancedConfiguration() {
    try {
        alert('Advanced Configuration\n\n' +
            'Current configuration is optimized for comprehensive analysis.\n' +
            'Configuration editing will be available in a future version.\n\n' +
            'Current Settings:\n' +
            '• Max Depth: ' + ADVANCED_UI_CONFIG.discovery.maxDepth + '\n' +
            '• Timeout: ' + ADVANCED_UI_CONFIG.discovery.timeoutMs + 'ms\n' +
            '• Safety Filter: ' + ADVANCED_UI_CONFIG.sampling.safetyFilter + '\n' +
            '• Max Samples: ' + ADVANCED_UI_CONFIG.sampling.maxSamples);
    } catch (exc) {
        updateAdvancedStatus('Configuration error: ' + exc.message);
    }
}

/**
 * Show advanced help
 */
function showAdvancedHelp() {
    try {
        var helpText = 'InDesign DOM Discovery Builder v3.1 - Advanced Interface\n\n' +
            'LIVE DOCUMENT ANALYSIS:\n' +
            '• Live Analysis - Complete 3-phase DOM discovery\n' +
            '• Live Compare - Compare current document against baseline\n' +
            '• Take Snapshot - Export current state for comparison\n\n' +
            'ADVANCED DISCOVERY:\n' +
            '• Full Discovery - Enhanced DOM enumeration with deep analysis\n' +
            '• Deep Mapping - Create detailed object relationship maps\n' +
            '• Performance - Analyze performance characteristics\n\n' +
            'JSON ANALYSIS:\n' +
            '• Load JSON - Import previously exported DOM structure\n' +
            '• Analyze - Perform comprehensive structural analysis\n' +
            '• Visualize - Open data in main DOM visualizer\n' +
            '• Export Analysis - Save analysis results\n\n' +
            'SNAPSHOT COMPARISON:\n' +
            '• Load Before/After - Import snapshots for comparison\n' +
            '• Compare - Analyze differences between snapshots\n' +
            '• Export Report - Save comparison analysis\n\n' +
            'DEEP OBJECT MAPPING:\n' +
            '• Create Mapping - Generate detailed object maps\n' +
            '• Object Atlas - Create comprehensive object index\n' +
            '• Optimize - Analyze performance optimization opportunities\n\n' +
            'EXPORT OPTIONS:\n' +
            '• Export JSON/Text/CSV - Save in various formats\n' +
            '• Full Report - Generate comprehensive analysis report\n\n' +
            'Use Module Status to check component availability.';

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

        // Clear all displays
        if (g_advUI_liveAnalysisText) {
            g_advUI_liveAnalysisText.text = '';
        }
        if (g_advUI_jsonAnalysisText) {
            g_advUI_jsonAnalysisText.text = '';
        }
        if (g_advUI_comparisonText) {
            g_advUI_comparisonText.text = '';
        }
        if (g_advUI_deepMappingText) {
            g_advUI_deepMappingText.text = '';
        }

        var discoveryDisplay = g_advUI_window.mainTabs.discoveryTab.discoveryDisplay.text;
        if (discoveryDisplay) {
            discoveryDisplay.text = '';
        }

        updateAdvancedStatus('Advanced UI reset to defaults - all data cleared');

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

    } catch (exc) {
        $.writeln('[Advanced UI] Close error: ' + exc.message);
    }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Update advanced UI status
 */
function updateAdvancedStatus(message) {
    try {
        if (g_advUI_statusText) {
            g_advUI_statusText.text = message;
        }
        $.writeln('[Advanced UI] ' + message);
    } catch (exc) {
        $.writeln('[Advanced UI] Status update failed: ' + exc.message);
    }
}

/**
 * Update document information display
 */
function updateAdvancedDocumentInfo() {
    try {
        if (!g_advUI_documentInfo) return;

        var envValidation = validateInDesignEnvironment();
        if (envValidation.valid) {
            var docName = envValidation.metadata.documentName || 'Unknown Document';
            var indesignVer = envValidation.metadata.indesignVersion || 'Unknown Version';
            g_advUI_documentInfo.text = 'Document: ' + docName + ' (InDesign ' + indesignVer + ')';
        } else {
            g_advUI_documentInfo.text = 'Document: ' + envValidation.error;
        }

    } catch (exc) {
        if (g_advUI_documentInfo) {
            g_advUI_documentInfo.text = 'Document: Error - ' + exc.message;
        }
    }
}

/**
 * Generate JSON analysis text for full export
 */
function generateJSONAnalysisText(analysis) {
    try {
        var builder = createStringBuilder();

        builder.appendLine('InDesign DOM Discovery Builder v3.1');
        builder.appendLine('Advanced JSON Analysis Report');
        builder.appendLine('====================================');
        builder.appendLine('Generated: ' + getCurrentTimestamp());
        builder.appendLine('');

        // Executive summary
        if (analysis.summary) {
            builder.appendLine('EXECUTIVE SUMMARY:');
            builder.appendLine('Analysis Type: JSON Structure Analysis');
            builder.appendLine('Total Elements: ' + (analysis.summary.nodeCount || 0));
            builder.appendLine('Properties Analyzed: ' + (analysis.summary.propertyCount || 0));
            builder.appendLine('Collections Found: ' + (analysis.summary.collectionCount || 0));
            builder.appendLine('Maximum Depth: ' + (analysis.summary.maxDepth || 0));
            builder.appendLine('Complexity Score: ' + (analysis.summary.complexityScore || 'Unknown'));
            builder.appendLine('Analysis Confidence: ' + (analysis.summary.confidence || 'High'));
            builder.appendLine('');
        }

        // Detailed sections
        if (analysis.visualHierarchy) {
            builder.appendLine('VISUAL HIERARCHY ANALYSIS:');
            builder.appendLine('==========================');
            builder.appendLine(analysis.visualHierarchy);
            builder.appendLine('');
        }

        if (analysis.propertyAnalysis) {
            builder.appendLine('PROPERTY ANALYSIS:');
            builder.appendLine('==================');
            builder.appendLine(analysis.propertyAnalysis);
            builder.appendLine('');
        }

        if (analysis.collectionAnalysis) {
            builder.appendLine('COLLECTION ANALYSIS:');
            builder.appendLine('===================');
            builder.appendLine(analysis.collectionAnalysis);
            builder.appendLine('');
        }

        if (analysis.valueAnalysis) {
            builder.appendLine('VALUE ANALYSIS:');
            builder.appendLine('===============');
            builder.appendLine(analysis.valueAnalysis);
            builder.appendLine('');
        }

        if (analysis.accessibilityMap) {
            builder.appendLine('ACCESSIBILITY MAP:');
            builder.appendLine('==================');
            builder.appendLine(analysis.accessibilityMap);
            builder.appendLine('');
        }

        if (analysis.developerGuide) {
            builder.appendLine('DEVELOPER GUIDE:');
            builder.appendLine('================');
            builder.appendLine(analysis.developerGuide);
            builder.appendLine('');
        }

        if (analysis.performanceMetrics) {
            builder.appendLine('PERFORMANCE METRICS:');
            builder.appendLine('===================');
            builder.appendLine(analysis.performanceMetrics);
            builder.appendLine('');
        }

        // Additional analysis sections
        if (analysis.codeExamples) {
            builder.appendLine('CODE EXAMPLES:');
            builder.appendLine('==============');
            builder.appendLine(analysis.codeExamples);
            builder.appendLine('');
        }

        if (analysis.recommendations) {
            builder.appendLine('RECOMMENDATIONS:');
            builder.appendLine('================');
            builder.appendLine(analysis.recommendations);
            builder.appendLine('');
        }

        builder.appendLine('END OF ANALYSIS REPORT');
        builder.appendLine('Generated by InDesign DOM Discovery Builder v3.1 Advanced Interface');
        builder.appendLine('For technical support and updates, please refer to the documentation.');

        return builder.toString();

    } catch (exc) {
        return 'Error generating JSON analysis text: ' + exc.message;
    }
}

/**
 * Generate comparison text for export
 */
function generateComparisonText(comparison) {
    try {
        var builder = createStringBuilder();

        builder.appendLine('InDesign DOM Discovery Builder v3.1');
        builder.appendLine('Snapshot Comparison Report');
        builder.appendLine('==========================');
        builder.appendLine('Generated: ' + getCurrentTimestamp());
        builder.appendLine('');

        // Executive summary
        if (comparison.summary) {
            builder.appendLine('EXECUTIVE SUMMARY:');
            builder.appendLine('Comparison Type: Before/After Snapshot Analysis');
            builder.appendLine('Total Changes Detected: ' + (comparison.summary.totalChanges || 0));
            builder.appendLine('Added Elements: ' + (comparison.summary.addedCount || 0));
            builder.appendLine('Removed Elements: ' + (comparison.summary.removedCount || 0));
            builder.appendLine('Modified Elements: ' + (comparison.summary.modifiedCount || 0));
            builder.appendLine('Overall Impact Level: ' + (comparison.summary.impactLevel || 'Unknown'));
            builder.appendLine('Change Confidence: ' + (comparison.summary.confidence || 'High'));
            builder.appendLine('');
        }

        // Detailed change analysis
        if (comparison.structuralChanges) {
            builder.appendLine('STRUCTURAL CHANGES:');
            builder.appendLine('===================');
            builder.appendLine(comparison.structuralChanges);
            builder.appendLine('');
        }

        if (comparison.propertyChanges) {
            builder.appendLine('PROPERTY CHANGES:');
            builder.appendLine('=================');
            builder.appendLine(comparison.propertyChanges);
            builder.appendLine('');
        }

        if (comparison.collectionChanges) {
            builder.appendLine('COLLECTION CHANGES:');
            builder.appendLine('==================');
            builder.appendLine(comparison.collectionChanges);
            builder.appendLine('');
        }

        if (comparison.valueChanges) {
            builder.appendLine('VALUE CHANGES:');
            builder.appendLine('==============');
            builder.appendLine(comparison.valueChanges);
            builder.appendLine('');
        }

        if (comparison.performanceImpact) {
            builder.appendLine('PERFORMANCE IMPACT ANALYSIS:');
            builder.appendLine('============================');
            builder.appendLine(comparison.performanceImpact);
            builder.appendLine('');
        }

        if (comparison.recommendations) {
            builder.appendLine('RECOMMENDATIONS:');
            builder.appendLine('================');
            builder.appendLine(comparison.recommendations);
            builder.appendLine('');
        }

        if (comparison.detailedChanges) {
            builder.appendLine('DETAILED CHANGE LOG:');
            builder.appendLine('===================');
            builder.appendLine(comparison.detailedChanges);
            builder.appendLine('');
        }

        builder.appendLine('END OF COMPARISON REPORT');
        builder.appendLine('Generated by InDesign DOM Discovery Builder v3.1 Advanced Interface');

        return builder.toString();

    } catch (exc) {
        return 'Error generating comparison text: ' + exc.message;
    }
}

// =============================================================================
// MODULE REGISTRATION
// =============================================================================

// Register this module with all its functions
registerModule('6.1_advanced-ui', '3.1', [
    // Main Functions
    'showAdvancedUI', 'initializeAdvancedUI', 'createAdvancedWindow', 'createAdvancedTabs',
    'initializeAdvancedEventHandlers',

    // Live Document Analysis
    'runLiveDocumentAnalysis', 'generateLiveAnalysisDisplay', 'runLiveComparison',
    'takeDocumentSnapshot', 'clearLiveDisplay',

    // Advanced Discovery
    'performAdvancedDiscovery', 'generateAdvancedDiscoveryDisplay', 'calculatePerformanceRating',
    'formatValuePreview', 'runDeepMapping', 'analyzePerformance', 'generatePerformanceAnalysis',
    'generatePerformanceRecommendations', 'clearDiscoveryDisplay',

    // JSON Analysis
    'loadJSONExport', 'runJSONAnalysis', 'generateJSONAnalysisDisplay', 'visualizeJSON',
    'exportJSONAnalysis', 'generateJSONAnalysisText', 'clearAnalysisDisplay',

    // Snapshot Comparison
    'loadBeforeSnapshot', 'loadAfterSnapshot', 'runSnapshotComparison', 'generateComparisonDisplay',
    'exportComparisonReport', 'clearComparisonDisplay',

    // Deep Object Mapping
    'createDeepMapping', 'generateDeepMappingDisplay', 'generateAdvancedAtlas', 'generateAtlasDisplay',
    'optimizeMapping', 'generateOptimizationDisplay', 'clearMappingDisplay',

    // Export and Reports
    'performAdvancedExport', 'generateComprehensiveReport', 'generateFullAnalysisReport',

    // Utility Functions
    'showMainDOMVisualizer', 'showModuleStatus', 'showAdvancedConfiguration', 'showAdvancedHelp',
    'resetAdvancedUI', 'closeAdvancedUI', 'updateAdvancedStatus', 'updateAdvancedDocumentInfo',
    'generateComparisonText'
]);

// =============================================================================
// END OF 6.1_advanced-ui.jsx
// =============================================================================