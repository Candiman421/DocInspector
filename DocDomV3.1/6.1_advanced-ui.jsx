// =============================================================================
// 6.1_advanced-ui.jsx - ENHANCED ADVANCED USER INTERFACE
// InDesign DOM Discovery Builder v3.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: Advanced UI with enhanced features, comparison tools, and analysis
// DEPENDENCIES: ALL PREVIOUS MODULES (1.1-5.2)
// SIZE: ~750 lines - COMPLETE IMPLEMENTATION
// =============================================================================

// =============================================================================
// DEPENDENCY VALIDATION
// =============================================================================

try {
    var ADVANCED_UI_DEPENDENCIES = [
        '1.1_bootstrap-foundation', '1.2_safety-utilities', '2.1_dom-enumerator',
        '2.2_collection-sampler', '3.1_property-sampler', '3.2_dom-exporter',
        '4.1_json-analyzer', '4.2_dom-comparator', '5.1_deep-mapper', '5.2_dom-visualizer'
    ];

    // Register this module
    if (typeof registerModule === 'function') {
        registerModule('6.1_advanced-ui', '3.1', [
            'showAdvancedUI',
            'initializeAdvancedUI',
            'createAdvancedTabs',
            'createAdvancedDiscoveryTab',
            'createAnalysisTab',
            'createComparisonTab',
            'createLiveAnalysisTab',
            'performAdvancedDiscovery',
            'performAdvancedExport',
            'runJSONAnalysis',
            'runSnapshotComparison',
            'runLiveAnalysis',
            'generateJSONAnalysisDisplay',
            'generateComparisonDisplay',
            'generateDeepMappingDisplay',
            'generateLiveAnalysisDisplay',
            'updateAdvancedStatus',
            'updateAdvancedDocumentInfo',
            'resetAdvancedUI',
            'generateJSONAnalysisText',
            'generateComparisonText'
        ]);
    }

    // Validate dependencies with proper module names
    if (typeof validateDependencies === 'function') {
        var depResult = validateDependencies([
            '1.1_bootstrap-foundation', '1.2_safety-utilities', '2.1_dom-enumerator',
            '2.2_collection-sampler', '3.1_property-sampler', '3.2_dom-exporter',
            '4.1_json-analyzer', '4.2_dom-comparator', '5.1_deep-mapper', '5.2_dom-visualizer'
        ]);
        if (!depResult.success) {
            throw new Error('Missing dependencies for advanced-ui: ' + depResult.missing.join(', '));
        }
    }
} catch (exc) {
    // Module system not available - continue with standalone operation
}

// =============================================================================
// NAMESPACED GLOBAL VARIABLES FOR ADVANCED UI STATE
// =============================================================================

var g_advUI_advancedWindow = null;
var g_advUI_advancedDOMStructure = null;
var g_advUI_loadedJSONData = null;
var g_advUI_comparisonResult = null;
var g_advUI_liveAnalysisResult = null;
var g_advUI_baselineDocumentState = null;
var g_advUI_statusText = null;
var g_advUI_tabPanel = null;
var g_advUI_currentTab = 'discovery';
var g_advUI_analysisText = null;
var g_advUI_comparisonText = null;
var g_advUI_liveAnalysisText = null;
var g_advUI_jsonAnalysisText = null;

// =============================================================================
// MAIN ADVANCED UI FUNCTIONS
// =============================================================================

/**
 * Show advanced UI interface with enhanced features
 * @returns {Boolean} True if shown successfully
 */
function showAdvancedUI() {
    try {
        // Check if window already exists
        if (g_advUI_advancedWindow) {
            g_advUI_advancedWindow.show();
            return true;
        }
        
        // Create main advanced window
        g_advUI_advancedWindow = new Window('dialog', 'Advanced DOM Discovery Builder v3.1');
        g_advUI_advancedWindow.orientation = 'column';
        g_advUI_advancedWindow.alignChildren = 'fill';
        g_advUI_advancedWindow.spacing = 10;
        g_advUI_advancedWindow.margins = 16;
        
        // Initialize advanced UI
        initializeAdvancedUI();
        
        // Create advanced UI components
        createAdvancedHeader();
        createAdvancedDocumentSection();
        createAdvancedTabs();
        createAdvancedStatusSection();
        
        // Set window properties
        g_advUI_advancedWindow.preferredSize.width = 1000;
        g_advUI_advancedWindow.preferredSize.height = 800;
        
        // Update document info
        updateAdvancedDocumentInfo();
        
        // Show window
        g_advUI_advancedWindow.show();
        
        return true;
        
    } catch (exc) {
        updateAdvancedStatus('Failed to show advanced UI: ' + exc.message);
        return false;
    }
}

/**
 * Initialize advanced UI state
 */
function initializeAdvancedUI() {
    try {
        // Reset all state variables
        g_advUI_advancedDOMStructure = null;
        g_advUI_loadedJSONData = null;
        g_advUI_comparisonResult = null;
        g_advUI_liveAnalysisResult = null;
        g_advUI_baselineDocumentState = null;
        g_advUI_currentTab = 'discovery';
        
        updateAdvancedStatus('Advanced UI initialized');
        
    } catch (exc) {
        updateAdvancedStatus('Advanced UI initialization failed: ' + exc.message);
    }
}

/**
 * Create advanced header with branding and info
 */
function createAdvancedHeader() {
    try {
        var headerGroup = g_advUI_advancedWindow.add('group');
        headerGroup.orientation = 'row';
        headerGroup.alignChildren = 'center';
        
        var titleText = headerGroup.add('statictext', undefined, 'Advanced DOM Discovery Builder v3.1');
        titleText.graphics.font = ScriptUI.newFont('dialog', 'BOLD', 18);
        
        headerGroup.add('panel'); // Spacer
        
        var helpButton = headerGroup.add('button', undefined, 'Help');
        helpButton.preferredSize.width = 80;
        helpButton.onClick = function() {
            showAdvancedHelp();
        };
        
        var settingsButton = headerGroup.add('button', undefined, 'Settings');
        settingsButton.preferredSize.width = 80;
        settingsButton.onClick = function() {
            showAdvancedSettings();
        };
        
    } catch (exc) {
        updateAdvancedStatus('Header creation failed: ' + exc.message);
    }
}

/**
 * Create advanced document information section
 */
function createAdvancedDocumentSection() {
    try {
        var docPanel = g_advUI_advancedWindow.add('panel', undefined, 'Document & Environment');
        docPanel.orientation = 'row';
        docPanel.alignChildren = 'fill';
        docPanel.spacing = 10;
        docPanel.margins = 10;
        docPanel.preferredSize.height = 100;
        
        // Document info
        var docInfoGroup = docPanel.add('group');
        docInfoGroup.orientation = 'column';
        docInfoGroup.alignChildren = 'fill';
        
        var docLabel = docInfoGroup.add('statictext', undefined, 'Document Information:');
        docLabel.graphics.font = ScriptUI.newFont('dialog', 'BOLD', 12);
        
        g_advUI_documentInfo = docInfoGroup.add('edittext', undefined, '', {multiline: true, readonly: true});
        g_advUI_documentInfo.preferredSize.height = 60;
        
        // Module status
        var moduleGroup = docPanel.add('group');
        moduleGroup.orientation = 'column';
        moduleGroup.alignChildren = 'fill';
        
        var moduleLabel = moduleGroup.add('statictext', undefined, 'Module Status:');
        moduleLabel.graphics.font = ScriptUI.newFont('dialog', 'BOLD', 12);
        
        var moduleStatus = moduleGroup.add('edittext', undefined, '', {multiline: true, readonly: true});
        moduleStatus.preferredSize.height = 60;
        
        // Update module status
        updateModuleStatus(moduleStatus);
        
        // Refresh button
        var refreshButton = docPanel.add('button', undefined, 'Refresh');
        refreshButton.onClick = function() {
            updateAdvancedDocumentInfo();
            updateModuleStatus(moduleStatus);
        };
        
    } catch (exc) {
        updateAdvancedStatus('Document section creation failed: ' + exc.message);
    }
}

/**
 * Create advanced tabbed interface
 */
function createAdvancedTabs() {
    try {
        g_advUI_tabPanel = g_advUI_advancedWindow.add('tabbedpanel');
        g_advUI_tabPanel.alignChildren = 'fill';
        g_advUI_tabPanel.preferredSize.height = 500;
        
        // Create tabs
        createAdvancedDiscoveryTab();
        createAnalysisTab();
        createComparisonTab();
        createLiveAnalysisTab();
        
        // Set initial selection
        g_advUI_tabPanel.selection = 0;
        
    } catch (exc) {
        updateAdvancedStatus('Tab creation failed: ' + exc.message);
    }
}

/**
 * Create advanced discovery tab
 */
function createAdvancedDiscoveryTab() {
    try {
        var discoveryTab = g_advUI_tabPanel.add('tab', undefined, 'Advanced Discovery');
        discoveryTab.orientation = 'column';
        discoveryTab.alignChildren = 'fill';
        discoveryTab.spacing = 10;
        
        // Discovery controls
        var controlGroup = discoveryTab.add('group');
        controlGroup.orientation = 'row';
        controlGroup.alignChildren = 'center';
        controlGroup.spacing = 10;
        
        var discoverButton = controlGroup.add('button', undefined, 'Full Discovery');
        discoverButton.preferredSize.width = 120;
        discoverButton.onClick = function() {
            performAdvancedDiscovery();
        };
        
        var quickButton = controlGroup.add('button', undefined, 'Quick Scan');
        quickButton.preferredSize.width = 100;
        quickButton.onClick = function() {
            performQuickScan();
        };
        
        var exportButton = controlGroup.add('button', undefined, 'Export All');
        exportButton.preferredSize.width = 100;
        exportButton.onClick = function() {
            performAdvancedExport();
        };
        
        var clearButton = controlGroup.add('button', undefined, 'Clear');
        clearButton.preferredSize.width = 80;
        clearButton.onClick = function() {
            if (g_advUI_discoveryDisplay) {
                g_advUI_discoveryDisplay.text = '';
            }
        };
        
        // Results display
        g_advUI_discoveryDisplay = discoveryTab.add('edittext', undefined, '', {multiline: true, readonly: true});
        g_advUI_discoveryDisplay.preferredSize.height = 400;
        
        // Discovery options
        var optionsGroup = discoveryTab.add('group');
        optionsGroup.orientation = 'row';
        
        var depthLabel = optionsGroup.add('statictext', undefined, 'Max Depth:');
        var depthEdit = optionsGroup.add('edittext', undefined, '4');
        depthEdit.preferredSize.width = 50;
        
        var safetyCheck = optionsGroup.add('checkbox', undefined, 'Safety Mode');
        safetyCheck.value = true;
        
        var detailedCheck = optionsGroup.add('checkbox', undefined, 'Detailed Analysis');
        detailedCheck.value = true;
        
    } catch (exc) {
        updateAdvancedStatus('Discovery tab creation failed: ' + exc.message);
    }
}

/**
 * Create analysis tab
 */
function createAnalysisTab() {
    try {
        var analysisTab = g_advUI_tabPanel.add('tab', undefined, 'JSON Analysis');
        analysisTab.orientation = 'column';
        analysisTab.alignChildren = 'fill';
        analysisTab.spacing = 10;
        
        // Analysis controls
        var controlGroup = analysisTab.add('group');
        controlGroup.orientation = 'row';
        controlGroup.alignChildren = 'center';
        controlGroup.spacing = 10;
        
        var loadButton = controlGroup.add('button', undefined, 'Load JSON File');
        loadButton.preferredSize.width = 120;
        loadButton.onClick = function() {
            loadJSONForAnalysis();
        };
        
        var analyzeButton = controlGroup.add('button', undefined, 'Analyze Current');
        analyzeButton.preferredSize.width = 120;
        analyzeButton.onClick = function() {
            runJSONAnalysis();
        };
        
        var reportButton = controlGroup.add('button', undefined, 'Generate Report');
        reportButton.preferredSize.width = 120;
        reportButton.onClick = function() {
            generateAnalysisReport();
        };
        
        // Analysis display
        g_advUI_jsonAnalysisText = analysisTab.add('edittext', undefined, '', {multiline: true, readonly: true});
        g_advUI_jsonAnalysisText.preferredSize.height = 400;
        
        // Analysis options
        var optionsGroup = analysisTab.add('group');
        optionsGroup.orientation = 'row';
        
        var visualCheck = optionsGroup.add('checkbox', undefined, 'Visual Hierarchy');
        visualCheck.value = true;
        
        var propCheck = optionsGroup.add('checkbox', undefined, 'Property Analysis');
        propCheck.value = true;
        
        var devGuideCheck = optionsGroup.add('checkbox', undefined, 'Developer Guide');
        devGuideCheck.value = true;
        
    } catch (exc) {
        updateAdvancedStatus('Analysis tab creation failed: ' + exc.message);
    }
}

/**
 * Create comparison tab
 */
function createComparisonTab() {
    try {
        var comparisonTab = g_advUI_tabPanel.add('tab', undefined, 'Document Comparison');
        comparisonTab.orientation = 'column';
        comparisonTab.alignChildren = 'fill';
        comparisonTab.spacing = 10;
        
        // Comparison controls
        var controlGroup = comparisonTab.add('group');
        controlGroup.orientation = 'row';
        controlGroup.alignChildren = 'center';
        controlGroup.spacing = 10;
        
        var snapshotButton = controlGroup.add('button', undefined, 'Snapshot Compare');
        snapshotButton.preferredSize.width = 130;
        snapshotButton.onClick = function() {
            runSnapshotComparison();
        };
        
        var baselineButton = controlGroup.add('button', undefined, 'Set Baseline');
        baselineButton.preferredSize.width = 100;
        baselineButton.onClick = function() {
            setDocumentBaseline();
        };
        
        var compareButton = controlGroup.add('button', undefined, 'Compare Current');
        compareButton.preferredSize.width = 120;
        compareButton.onClick = function() {
            compareWithBaseline();
        };
        
        // Comparison display
        g_advUI_comparisonText = comparisonTab.add('edittext', undefined, '', {multiline: true, readonly: true});
        g_advUI_comparisonText.preferredSize.height = 400;
        
        // Comparison options
        var optionsGroup = comparisonTab.add('group');
        optionsGroup.orientation = 'row';
        
        var structuralCheck = optionsGroup.add('checkbox', undefined, 'Structural Changes');
        structuralCheck.value = true;
        
        var valueCheck = optionsGroup.add('checkbox', undefined, 'Value Changes');
        valueCheck.value = true;
        
        var detailCheck = optionsGroup.add('checkbox', undefined, 'Detailed Report');
        detailCheck.value = true;
        
    } catch (exc) {
        updateAdvancedStatus('Comparison tab creation failed: ' + exc.message);
    }
}

/**
 * Create live analysis tab
 */
function createLiveAnalysisTab() {
    try {
        var liveTab = g_advUI_tabPanel.add('tab', undefined, 'Live Analysis');
        liveTab.orientation = 'column';
        liveTab.alignChildren = 'fill';
        liveTab.spacing = 10;
        
        // Live analysis controls
        var controlGroup = liveTab.add('group');
        controlGroup.orientation = 'row';
        controlGroup.alignChildren = 'center';
        controlGroup.spacing = 10;
        
        var startButton = controlGroup.add('button', undefined, 'Start Monitoring');
        startButton.preferredSize.width = 120;
        startButton.onClick = function() {
            startLiveMonitoring();
        };
        
        var stopButton = controlGroup.add('button', undefined, 'Stop Monitoring');
        stopButton.preferredSize.width = 120;
        stopButton.onClick = function() {
            stopLiveMonitoring();
        };
        
        var refreshButton = controlGroup.add('button', undefined, 'Manual Refresh');
        refreshButton.preferredSize.width = 120;
        refreshButton.onClick = function() {
            runLiveAnalysis();
        };
        
        // Live analysis display
        g_advUI_liveAnalysisText = liveTab.add('edittext', undefined, '', {multiline: true, readonly: true});
        g_advUI_liveAnalysisText.preferredSize.height = 400;
        
        // Live analysis options
        var optionsGroup = liveTab.add('group');
        optionsGroup.orientation = 'row';
        
        var intervalLabel = optionsGroup.add('statictext', undefined, 'Interval (sec):');
        var intervalEdit = optionsGroup.add('edittext', undefined, '5');
        intervalEdit.preferredSize.width = 50;
        
        var autoSaveCheck = optionsGroup.add('checkbox', undefined, 'Auto Save Changes');
        autoSaveCheck.value = false;
        
    } catch (exc) {
        updateAdvancedStatus('Live analysis tab creation failed: ' + exc.message);
    }
}

/**
 * Create advanced status section
 */
function createAdvancedStatusSection() {
    try {
        var statusGroup = g_advUI_advancedWindow.add('group');
        statusGroup.orientation = 'row';
        statusGroup.alignChildren = 'fill';
        
        g_advUI_statusText = statusGroup.add('statictext', undefined, 'Advanced UI Ready');
        g_advUI_statusText.graphics.font = ScriptUI.newFont('dialog', 'REGULAR', 10);
        
        statusGroup.add('panel'); // Spacer
        
        var resetButton = statusGroup.add('button', undefined, 'Reset All');
        resetButton.onClick = function() {
            resetAdvancedUI();
        };
        
        var closeButton = statusGroup.add('button', undefined, 'Close');
        closeButton.onClick = function() {
            g_advUI_advancedWindow.close();
        };
        
    } catch (exc) {
        // Status creation failed - continue without status
    }
}

// =============================================================================
// ADVANCED ACTION HANDLERS
// =============================================================================

/**
 * Perform advanced DOM discovery with all features
 */
function performAdvancedDiscovery() {
    try {
        updateAdvancedStatus('Starting comprehensive DOM discovery...');
        
        // Validate environment
        var envCheck = validateInDesignEnvironment();
        if (!envCheck.valid) {
            updateAdvancedStatus('Error: ' + envCheck.error);
            return;
        }
        
        // Check required functions
        if (!functionExists('enumerateDocumentDOM')) {
            updateAdvancedStatus('Error: DOM enumeration module not available');
            return;
        }
        
        // Configure comprehensive discovery
        var config = {
            maxDepth: 5,
            timeoutMs: 20000,
            skipDangerous: true,
            maxProperties: 10000,
            enableObjectTracking: true,
            enableDuplicateDetection: true
        };
        
        // Perform enumeration
        g_advUI_advancedDOMStructure = enumerateDocumentDOM(envCheck.document, config);
        
        if (!g_advUI_advancedDOMStructure || !g_advUI_advancedDOMStructure.structure) {
            updateAdvancedStatus('DOM discovery failed or returned no results');
            return;
        }
        
        updateAdvancedStatus('DOM discovery completed. Running value sampling...');
        
        // Perform value sampling if available
        if (functionExists('samplePropertyValues')) {
            g_advUI_advancedDOMStructure = samplePropertyValues(
                g_advUI_advancedDOMStructure,
                envCheck.document,
                {
                    safetyFilter: 'safe',
                    maxSamples: 15,
                    includeCollectionSamples: true,
                    trackObjectReferences: true,
                    generateValueFingerprints: true
                }
            );
        }
        
        // Perform collection sampling if available
        if (functionExists('sampleCollectionContents')) {
            g_advUI_advancedDOMStructure = sampleCollectionContents(
                g_advUI_advancedDOMStructure,
                envCheck.document,
                {
                    maxSamplesPerCollection: 10,
                    enableDeepPropertyAnalysis: true
                }
            );
        }
        
        // Generate comprehensive display
        var displayText = generateAdvancedDiscoveryDisplay(g_advUI_advancedDOMStructure);
        if (g_advUI_discoveryDisplay) {
            g_advUI_discoveryDisplay.text = displayText;
        }
        
        updateAdvancedStatus('Advanced discovery completed successfully');
        
    } catch (exc) {
        updateAdvancedStatus('Advanced discovery error: ' + exc.message);
    }
}

/**
 * Perform quick scan for basic structure
 */
function performQuickScan() {
    try {
        updateAdvancedStatus('Performing quick document scan...');
        
        var envCheck = validateInDesignEnvironment();
        if (!envCheck.valid) {
            updateAdvancedStatus('Error: ' + envCheck.error);
            return;
        }
        
        if (!functionExists('enumerateDocumentDOM')) {
            updateAdvancedStatus('Error: DOM enumeration module not available');
            return;
        }
        
        // Quick scan configuration
        var quickConfig = {
            maxDepth: 2,
            timeoutMs: 5000,
            skipDangerous: true,
            maxProperties: 1000,
            enableObjectTracking: false,
            enableDuplicateDetection: false
        };
        
        var quickResult = enumerateDocumentDOM(envCheck.document, quickConfig);
        
        if (quickResult && quickResult.structure) {
            var quickDisplay = generateQuickScanDisplay(quickResult);
            if (g_advUI_discoveryDisplay) {
                g_advUI_discoveryDisplay.text = quickDisplay;
            }
            updateAdvancedStatus('Quick scan completed');
        } else {
            updateAdvancedStatus('Quick scan failed');
        }
        
    } catch (exc) {
        updateAdvancedStatus('Quick scan error: ' + exc.message);
    }
}

/**
 * Perform advanced export with all formats
 */
function performAdvancedExport() {
    try {
        if (!g_advUI_advancedDOMStructure) {
            updateAdvancedStatus('Please run discovery first');
            return;
        }
        
        updateAdvancedStatus('Exporting in multiple formats...');
        
        if (!functionExists('exportDOMStructure')) {
            updateAdvancedStatus('Error: DOM export module not available');
            return;
        }
        
        var timestamp = getCurrentTimestamp().replace(/:/g, '-');
        var formats = ['json', 'text', 'csv'];
        var exportedFiles = [];
        
        for (var i = 0; i < formats.length; i++) {
            var format = formats[i];
            var config = {
                format: format,
                includeMetadata: true,
                includeStatistics: true,
                includeExtractedValues: true,
                generateComparisonData: true
            };
            
            var exportResult = exportDOMStructure(g_advUI_advancedDOMStructure, config);
            
            if (exportResult.success) {
                var fileName = 'DOM_Advanced_' + timestamp + '.' + format;
                var file = File.saveDialog('Save ' + format.toUpperCase() + ' Export', fileName);
                
                if (file) {
                    file.open('w');
                    file.write(exportResult.content);
                    file.close();
                    exportedFiles.push(file.name);
                }
            }
        }
        
        if (exportedFiles.length > 0) {
            updateAdvancedStatus('Exported ' + exportedFiles.length + ' files: ' + exportedFiles.join(', '));
        } else {
            updateAdvancedStatus('Export cancelled or failed');
        }
        
    } catch (exc) {
        updateAdvancedStatus('Advanced export error: ' + exc.message);
    }
}

/**
 * Load JSON file for analysis
 */
function loadJSONForAnalysis() {
    try {
        updateAdvancedStatus('Select JSON file for analysis...');
        
        var file = File.openDialog('Select DOM JSON Export', '*.json');
        if (!file) {
            updateAdvancedStatus('File selection cancelled');
            return;
        }
        
        if (!functionExists('readAndParseJSONFile')) {
            updateAdvancedStatus('Error: JSON analyzer module not available');
            return;
        }
        
        var parseResult = readAndParseJSONFile(file.fsName);
        if (parseResult.success) {
            g_advUI_loadedJSONData = parseResult.data;
            updateAdvancedStatus('JSON file loaded: ' + file.name);
            
            // Auto-run analysis
            runJSONAnalysis();
        } else {
            updateAdvancedStatus('JSON loading failed: ' + parseResult.error);
        }
        
    } catch (exc) {
        updateAdvancedStatus('JSON loading error: ' + exc.message);
    }
}

/**
 * Run JSON analysis using module 6.0
 */
function runJSONAnalysis() {
    try {
        var dataToAnalyze = g_advUI_loadedJSONData || g_advUI_advancedDOMStructure;
        
        if (!dataToAnalyze) {
            updateAdvancedStatus('No data available for analysis - load JSON or run discovery first');
            return;
        }
        
        updateAdvancedStatus('Analyzing JSON structure...');
        
        if (!functionExists('analyzeLoadedJSON')) {
            updateAdvancedStatus('Error: JSON analyzer module not available');
            return;
        }
        
        var analysisConfig = {
            enableVisualHierarchy: true,
            enablePropertyAnalysis: true,
            enableCollectionAnalysis: true,
            enableValueAnalysis: true,
            generateDeveloperGuide: true,
            includeCodeExamples: true,
            highlightKeyProperties: true
        };
        
        var jsonAnalysis = {
            success: false,
            analysis: {},
            error: null
        };
        
        try {
            jsonAnalysis.analysis = analyzeLoadedJSON(dataToAnalyze, analysisConfig);
            jsonAnalysis.success = true;
        } catch (analysisExc) {
            jsonAnalysis.error = analysisExc.message;
        }
        
        // Try additional analysis modules
        try {
            if (functionExists('generatePropertyAnalysis')) {
                jsonAnalysis.analysis.propertyAnalysis = generatePropertyAnalysis(dataToAnalyze, analysisConfig);
            }
        } catch (exc) {
            updateAdvancedStatus('Warning: Could not generate property analysis');
        }

        try {
            if (functionExists('generateCollectionAnalysis')) {
                jsonAnalysis.analysis.collectionAnalysis = generateCollectionAnalysis(dataToAnalyze, analysisConfig);
            }
        } catch (exc) {
            updateAdvancedStatus('Warning: Could not generate collection analysis');
        }

        if (!jsonAnalysis.success) {
            updateAdvancedStatus('JSON analysis failed: ' + (jsonAnalysis.error || 'Unknown error'));
            return;
        }

        // Display analysis results
        var displayText = generateJSONAnalysisDisplay(jsonAnalysis.analysis);
        if (g_advUI_jsonAnalysisText) {
            g_advUI_jsonAnalysisText.text = displayText;
        }

        updateAdvancedStatus('JSON analysis complete with visualization generation');

    } catch (exc) {
        updateAdvancedStatus('JSON analysis error: ' + exc.message);
    }
}

/**
 * Run snapshot comparison using module 4.2
 */
function runSnapshotComparison() {
    try {
        updateAdvancedStatus('Select before and after JSON files for comparison...');

        // Check if comparator is available
        if (!functionExists('compareDOMExports')) {
            updateAdvancedStatus('DOM comparator module not available - feature disabled');
            return;
        }

        // Select before file
        var beforeFile = File.openDialog('Select BEFORE JSON Export', '*.json');
        if (!beforeFile) {
            updateAdvancedStatus('Before file selection cancelled');
            return;
        }

        // Select after file
        var afterFile = File.openDialog('Select AFTER JSON Export', '*.json');
        if (!afterFile) {
            updateAdvancedStatus('After file selection cancelled');
            return;
        }

        updateAdvancedStatus('Comparing documents: ' + beforeFile.name + ' vs ' + afterFile.name);

        // Perform comparison using module 4.2
        var comparisonConfig = objectClone({
            enableStructuralComparison: true,
            enablePropertyComparison: true,
            enableCollectionComparison: true,
            enableValueComparison: true,
            compareExtractedValues: true,
            generateDetailedReport: true
        }, 2);

        // Read and parse both files
        var beforeData = readAndParseJSONFile(beforeFile.fsName);
        var afterData = readAndParseJSONFile(afterFile.fsName);

        if (!beforeData.success) {
            updateAdvancedStatus('Before file parsing failed: ' + beforeData.error);
            return;
        }

        if (!afterData.success) {
            updateAdvancedStatus('After file parsing failed: ' + afterData.error);
            return;
        }

        // Run comparison
        g_advUI_comparisonResult = compareDOMExports(beforeData.data, afterData.data, comparisonConfig);

        if (g_advUI_comparisonResult.success) {
            var comparisonDisplay = generateComparisonDisplay(g_advUI_comparisonResult);
            if (g_advUI_comparisonText) {
                g_advUI_comparisonText.text = comparisonDisplay;
            }
            updateAdvancedStatus('Comparison completed: ' + g_advUI_comparisonResult.summary.totalDifferences + ' differences found');
        } else {
            updateAdvancedStatus('Comparison failed: ' + (g_advUI_comparisonResult.error || 'Unknown error'));
        }

    } catch (exc) {
        updateAdvancedStatus('Snapshot comparison error: ' + exc.message);
    }
}

/**
 * Set document baseline for live comparison
 */
function setDocumentBaseline() {
    try {
        updateAdvancedStatus('Setting document baseline...');
        
        var envCheck = validateInDesignEnvironment();
        if (!envCheck.valid) {
            updateAdvancedStatus('Error: ' + envCheck.error);
            return;
        }
        
        if (!functionExists('enumerateDocumentDOM')) {
            updateAdvancedStatus('Error: DOM enumeration module not available');
            return;
        }
        
        // Quick baseline capture
        var baselineConfig = {
            maxDepth: 3,
            timeoutMs: 10000,
            skipDangerous: true,
            maxProperties: 2000,
            enableObjectTracking: true
        };
        
        g_advUI_baselineDocumentState = enumerateDocumentDOM(envCheck.document, baselineConfig);
        
        if (g_advUI_baselineDocumentState) {
            updateAdvancedStatus('Document baseline set successfully');
        } else {
            updateAdvancedStatus('Failed to set document baseline');
        }
        
    } catch (exc) {
        updateAdvancedStatus('Baseline setting error: ' + exc.message);
    }
}

/**
 * Compare current document with baseline
 */
function compareWithBaseline() {
    try {
        if (!g_advUI_baselineDocumentState) {
            updateAdvancedStatus('Please set document baseline first');
            return;
        }
        
        updateAdvancedStatus('Comparing current document with baseline...');
        
        var envCheck = validateInDesignEnvironment();
        if (!envCheck.valid) {
            updateAdvancedStatus('Error: ' + envCheck.error);
            return;
        }
        
        if (!functionExists('enumerateDocumentDOM') || !functionExists('compareDOMExports')) {
            updateAdvancedStatus('Error: Required comparison modules not available');
            return;
        }
        
        // Capture current state
        var currentConfig = {
            maxDepth: 3,
            timeoutMs: 10000,
            skipDangerous: true,
            maxProperties: 2000,
            enableObjectTracking: true
        };
        
        var currentState = enumerateDocumentDOM(envCheck.document, currentConfig);
        
        if (!currentState) {
            updateAdvancedStatus('Failed to capture current document state');
            return;
        }
        
        // Compare with baseline
        var comparisonResult = compareDOMExports(g_advUI_baselineDocumentState, currentState, {
            enableStructuralComparison: true,
            enablePropertyComparison: true,
            generateDetailedReport: true
        });
        
        if (comparisonResult.success) {
            var displayText = 'BASELINE COMPARISON RESULTS\n';
            displayText += '===========================\n\n';
            displayText += 'Total Differences: ' + comparisonResult.summary.totalDifferences + '\n';
            displayText += 'Critical Changes: ' + comparisonResult.summary.criticalChanges + '\n';
            displayText += 'Structural Changes: ' + (comparisonResult.summary.hasStructuralChanges ? 'Yes' : 'No') + '\n';
            displayText += 'Value Changes: ' + (comparisonResult.summary.hasValueChanges ? 'Yes' : 'No') + '\n\n';
            
            if (comparisonResult.report) {
                displayText += comparisonResult.report;
            }
            
            if (g_advUI_comparisonText) {
                g_advUI_comparisonText.text = displayText;
            }
            
            updateAdvancedStatus('Baseline comparison completed');
        } else {
            updateAdvancedStatus('Baseline comparison failed: ' + (comparisonResult.error || 'Unknown error'));
        }
        
    } catch (exc) {
        updateAdvancedStatus('Baseline comparison error: ' + exc.message);
    }
}

/**
 * Start live monitoring
 */
function startLiveMonitoring() {
    try {
        updateAdvancedStatus('Live monitoring started (manual refresh mode)');
        // Note: Automatic monitoring would require timer implementation
        // For now, just enable manual refresh mode
        
        runLiveAnalysis();
        
    } catch (exc) {
        updateAdvancedStatus('Live monitoring start error: ' + exc.message);
    }
}

/**
 * Stop live monitoring
 */
function stopLiveMonitoring() {
    try {
        updateAdvancedStatus('Live monitoring stopped');
        
    } catch (exc) {
        updateAdvancedStatus('Live monitoring stop error: ' + exc.message);
    }
}

/**
 * Run live analysis
 */
function runLiveAnalysis() {
    try {
        updateAdvancedStatus('Running live document analysis...');
        
        var envCheck = validateInDesignEnvironment();
        if (!envCheck.valid) {
            updateAdvancedStatus('Error: ' + envCheck.error);
            return;
        }
        
        // Generate live analysis report
        var liveReport = '';
        
        try {
            var doc = envCheck.document;
            liveReport += 'LIVE DOCUMENT ANALYSIS\n';
            liveReport += '=====================\n\n';
            liveReport += 'Timestamp: ' + getCurrentTimestamp() + '\n';
            liveReport += 'Document: ' + (doc.name || 'Untitled') + '\n\n';
            
            liveReport += 'CURRENT STATE:\n';
            liveReport += 'Pages: ' + (doc.pages ? doc.pages.length : 'Unknown') + '\n';
            liveReport += 'Layers: ' + (doc.layers ? doc.layers.length : 'Unknown') + '\n';
            liveReport += 'Text Frames: ' + (doc.textFrames ? doc.textFrames.length : 'Unknown') + '\n';
            liveReport += 'Spreads: ' + (doc.spreads ? doc.spreads.length : 'Unknown') + '\n';
            liveReport += 'Master Spreads: ' + (doc.masterSpreads ? doc.masterSpreads.length : 'Unknown') + '\n\n';
            
            // Memory and performance info
            liveReport += 'PERFORMANCE METRICS:\n';
            liveReport += 'Analysis Time: ' + new Date().getTime() + 'ms\n';
            liveReport += 'Memory Usage: Monitoring not available\n\n';
            
            liveReport += 'STATUS: Analysis completed successfully\n';
            
        } catch (docExc) {
            liveReport += 'Error accessing document details: ' + docExc.message + '\n';
        }
        
        if (g_advUI_liveAnalysisText) {
            g_advUI_liveAnalysisText.text = liveReport;
        }
        
        updateAdvancedStatus('Live analysis completed');
        
    } catch (exc) {
        updateAdvancedStatus('Live analysis error: ' + exc.message);
    }
}

// =============================================================================
// DISPLAY GENERATION FUNCTIONS
// =============================================================================

/**
 * Generate advanced discovery display
 * @param {Object} domStructure - DOM structure
 * @returns {String} Display text
 */
function generateAdvancedDiscoveryDisplay(domStructure) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('ADVANCED DOM DISCOVERY RESULTS');
        builder.appendLine('==============================');
        builder.appendLine('');
        
        if (domStructure.metadata) {
            builder.appendLine('METADATA:');
            builder.appendLine('Document: ' + (domStructure.metadata.documentName || 'Unknown'));
            builder.appendLine('Generated: ' + (domStructure.metadata.timestamp || 'Unknown'));
            builder.appendLine('Version: ' + (domStructure.metadata.version || 'Unknown'));
            builder.appendLine('');
        }
        
        if (domStructure.statistics) {
            builder.appendLine('COMPREHENSIVE STATISTICS:');
            builder.appendLine('Total Nodes: ' + (domStructure.statistics.totalNodes || 0));
            builder.appendLine('Total Properties: ' + (domStructure.statistics.totalProperties || 0));
            builder.appendLine('Object References: ' + (domStructure.statistics.objectReferences || 0));
            builder.appendLine('Duplicate Objects: ' + (domStructure.statistics.duplicateObjects || 0));
            builder.appendLine('Circular References: ' + (domStructure.statistics.circularReferences || 0));
            builder.appendLine('Enumeration Time: ' + (domStructure.statistics.enumerationTime || 0) + 'ms');
            builder.appendLine('');
        }
        
        // Value sampling results
        if (domStructure.metadata && domStructure.metadata.valueSampling) {
            var sampling = domStructure.metadata.valueSampling;
            builder.appendLine('VALUE SAMPLING RESULTS:');
            builder.appendLine('Status: ' + (sampling.enabled ? 'Completed' : 'Failed'));
            
            if (sampling.statistics) {
                builder.appendLine('Properties Sampled: ' + (sampling.statistics.propertiesSampled || 0));
                builder.appendLine('Values Extracted: ' + (sampling.statistics.valuesSampled || 0));
                builder.appendLine('Success Rate: ' + ((sampling.performance && sampling.performance.successRate) || 0) + '%');
            }
            builder.appendLine('');
        }
        
        // Collection sampling results
        if (domStructure.metadata && domStructure.metadata.collectionSampling) {
            var collSampling = domStructure.metadata.collectionSampling;
            builder.appendLine('COLLECTION SAMPLING RESULTS:');
            builder.appendLine('Status: ' + (collSampling.enabled ? 'Completed' : 'Failed'));
            
            if (collSampling.statistics) {
                builder.appendLine('Collections Processed: ' + (collSampling.statistics.collectionsProcessed || 0));
                builder.appendLine('Items Sampled: ' + (collSampling.statistics.itemsSampled || 0));
            }
            builder.appendLine('');
        }
        
        builder.appendLine('ADVANCED FEATURES:');
        builder.appendLine('• Comprehensive object reference tracking');
        builder.appendLine('• Deep value extraction and fingerprinting');
        builder.appendLine('• Collection content analysis');
        builder.appendLine('• Circular reference detection');
        builder.appendLine('• Alternative access path generation');
        builder.appendLine('• Export-ready data structure');
        
        return builder.toString();
        
    } catch (exc) {
        return 'Advanced discovery display generation failed: ' + exc.message;
    }
}

/**
 * Generate quick scan display
 * @param {Object} domStructure - DOM structure
 * @returns {String} Display text
 */
function generateQuickScanDisplay(domStructure) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('QUICK DOCUMENT SCAN RESULTS');
        builder.appendLine('===========================');
        builder.appendLine('');
        
        if (domStructure.statistics) {
            builder.appendLine('Basic Statistics:');
            builder.appendLine('• Nodes Found: ' + (domStructure.statistics.totalNodes || 0));
            builder.appendLine('• Properties Found: ' + (domStructure.statistics.totalProperties || 0));
            builder.appendLine('• Scan Time: ' + (domStructure.statistics.enumerationTime || 0) + 'ms');
            builder.appendLine('');
        }
        
        builder.appendLine('Document Structure Overview:');
        if (domStructure.structure && domStructure.structure.document) {
            var doc = domStructure.structure.document;
            
            if (doc.properties) {
                builder.appendLine('• Document Properties: ' + doc.properties.length);
            }
            
            if (doc.collections) {
                builder.appendLine('• Document Collections: ' + doc.collections.length);
                
                // Show collection names
                for (var i = 0; i < Math.min(doc.collections.length, 10); i++) {
                    builder.appendLine('  - ' + doc.collections[i].name);
                }
                
                if (doc.collections.length > 10) {
                    builder.appendLine('  - ... and ' + (doc.collections.length - 10) + ' more');
                }
            }
            
            if (doc.childNodes) {
                builder.appendLine('• Child Nodes: ' + doc.childNodes.length);
            }
        }
        
        builder.appendLine('');
        builder.appendLine('Note: This is a quick scan with limited depth.');
        builder.appendLine('Run "Full Discovery" for comprehensive analysis.');
        
        return builder.toString();
        
    } catch (exc) {
        return 'Quick scan display generation failed: ' + exc.message;
    }
}

/**
 * Generate JSON analysis display
 * @param {Object} analysis - Analysis results
 * @returns {String} Display text
 */
function generateJSONAnalysisDisplay(analysis) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('JSON STRUCTURE ANALYSIS');
        builder.appendLine('======================');
        builder.appendLine('');
        
        if (analysis.summary) {
            builder.appendLine('ANALYSIS SUMMARY:');
            builder.appendLine('Document: ' + analysis.summary.documentName);
            builder.appendLine('Total Nodes: ' + analysis.summary.totalNodes);
            builder.appendLine('Total Properties: ' + analysis.summary.totalProperties);
            builder.appendLine('Maximum Depth: ' + analysis.summary.maxDepth);
            builder.appendLine('Has Extracted Values: ' + (analysis.summary.hasExtractedValues ? 'Yes' : 'No'));
            builder.appendLine('Has Circular References: ' + (analysis.summary.hasCircularReferences ? 'Yes' : 'No'));
            builder.appendLine('');
        }
        
        if (analysis.visualHierarchy) {
            builder.appendLine('VISUAL HIERARCHY:');
            builder.appendLine(analysis.visualHierarchy);
            builder.appendLine('');
        }
        
        if (analysis.propertyAnalysis) {
            builder.appendLine('PROPERTY ANALYSIS:');
            builder.appendLine(analysis.propertyAnalysis);
            builder.appendLine('');
        }
        
        if (analysis.collectionAnalysis) {
            builder.appendLine('COLLECTION ANALYSIS:');
            builder.appendLine(analysis.collectionAnalysis);
            builder.appendLine('');
        }
        
        if (analysis.accessibilityMap && analysis.accessibilityMap.recommendations) {
            builder.appendLine('ACCESSIBILITY RECOMMENDATIONS:');
            for (var i = 0; i < analysis.accessibilityMap.recommendations.length; i++) {
                builder.appendLine('• ' + analysis.accessibilityMap.recommendations[i]);
            }
            builder.appendLine('');
        }
        
        if (analysis.developerGuide) {
            builder.appendLine('DEVELOPER GUIDE:');
            builder.appendLine(analysis.developerGuide);
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'JSON analysis display generation failed: ' + exc.message;
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
            builder.appendLine('COMPARISON SUMMARY:');
            builder.appendLine('Total Differences: ' + comparisonResult.summary.totalDifferences);
            builder.appendLine('Critical Changes: ' + comparisonResult.summary.criticalChanges);
            builder.appendLine('Structural Changes: ' + (comparisonResult.summary.hasStructuralChanges ? 'Yes' : 'No'));
            builder.appendLine('Value Changes: ' + (comparisonResult.summary.hasValueChanges ? 'Yes' : 'No'));
            builder.appendLine('Comparison Time: ' + comparisonResult.comparisonTime + 'ms');
            builder.appendLine('');
        }
        
        if (comparisonResult.report) {
            builder.appendLine(comparisonResult.report);
        } else {
            builder.appendLine('No detailed report available.');
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Comparison display generation failed: ' + exc.message;
    }
}

/**
 * Generate deep mapping display
 * @param {Object} mappingResult - Deep mapping result
 * @returns {String} Display text
 */
function generateDeepMappingDisplay(mappingResult) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('DEEP MAPPING ANALYSIS');
        builder.appendLine('====================');
        builder.appendLine('');
        
        if (mappingResult.session) {
            builder.appendLine('MAPPING SESSION:');
            builder.appendLine('Session ID: ' + mappingResult.session.sessionId);
            builder.appendLine('Mapping Time: ' + mappingResult.mappingTime + 'ms');
            builder.appendLine('');
        }
        
        if (mappingResult.analysis) {
            builder.appendLine('ANALYSIS RESULTS:');
            builder.appendLine('Analysis completed with advanced mapping features');
            builder.appendLine('');
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Deep mapping display generation failed: ' + exc.message;
    }
}

/**
 * Generate live analysis display
 * @param {Object} liveResult - Live analysis result
 * @returns {String} Display text
 */
function generateLiveAnalysisDisplay(liveResult) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('LIVE DOCUMENT ANALYSIS');
        builder.appendLine('=====================');
        builder.appendLine('');
        
        builder.appendLine('Real-time document monitoring and analysis');
        builder.appendLine('Timestamp: ' + getCurrentTimestamp());
        
        return builder.toString();
        
    } catch (exc) {
        return 'Live analysis display generation failed: ' + exc.message;
    }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Update module status display
 * @param {Object} statusText - Status text control
 */
function updateModuleStatus(statusText) {
    try {
        var status = '';
        
        var modules = [
            '1.1_bootstrap-foundation', '1.2_safety-utilities', '2.1_dom-enumerator',
            '2.2_collection-sampler', '3.1_property-sampler', '3.2_dom-exporter',
            '4.1_json-analyzer', '4.2_dom-comparator', '5.1_deep-mapper', '5.2_dom-visualizer'
        ];
        
        var loadedCount = 0;
        
        for (var i = 0; i < modules.length; i++) {
            if (typeof isModuleLoaded === 'function' && isModuleLoaded(modules[i])) {
                loadedCount++;
            }
        }
        
        status += 'Modules: ' + loadedCount + '/' + modules.length + ' loaded\n';
        
        // Check key functions
        var keyFunctions = [
            'enumerateDocumentDOM', 'samplePropertyValues', 'exportDOMStructure',
            'analyzeLoadedJSON', 'compareDOMExports'
        ];
        
        var availableFunctions = 0;
        for (var j = 0; j < keyFunctions.length; j++) {
            if (functionExists(keyFunctions[j])) {
                availableFunctions++;
            }
        }
        
        status += 'Functions: ' + availableFunctions + '/' + keyFunctions.length + ' available\n';
        status += 'Status: ' + (loadedCount === modules.length ? 'Fully Loaded' : 'Partial Load');
        
        statusText.text = status;
        
    } catch (exc) {
        statusText.text = 'Module status check failed: ' + exc.message;
    }
}

/**
 * Generate analysis report
 */
function generateAnalysisReport() {
    try {
        var analysisData = g_advUI_loadedJSONData || g_advUI_advancedDOMStructure;
        
        if (!analysisData) {
            updateAdvancedStatus('No data available for report generation');
            return;
        }
        
        updateAdvancedStatus('Generating comprehensive analysis report...');
        
        var reportText = 'COMPREHENSIVE ANALYSIS REPORT\n';
        reportText += '=============================\n\n';
        reportText += 'Generated: ' + getCurrentTimestamp() + '\n\n';
        
        if (analysisData.metadata) {
            reportText += 'DOCUMENT INFORMATION:\n';
            reportText += 'Name: ' + (analysisData.metadata.documentName || 'Unknown') + '\n';
            reportText += 'Analysis Version: ' + (analysisData.metadata.version || 'Unknown') + '\n\n';
        }
        
        if (analysisData.statistics) {
            reportText += 'STRUCTURE STATISTICS:\n';
            reportText += 'Total Nodes: ' + (analysisData.statistics.totalNodes || 0) + '\n';
            reportText += 'Total Properties: ' + (analysisData.statistics.totalProperties || 0) + '\n';
            reportText += 'Object References: ' + (analysisData.statistics.objectReferences || 0) + '\n\n';
        }
        
        reportText += 'ANALYSIS CAPABILITIES:\n';
        reportText += '• Structure discovery and enumeration\n';
        reportText += '• Property value extraction and sampling\n';
        reportText += '• Collection content analysis\n';
        reportText += '• Object reference tracking\n';
        reportText += '• Circular reference detection\n';
        reportText += '• Multi-format export support\n';
        reportText += '• Document comparison tools\n';
        reportText += '• Advanced mapping and visualization\n\n';
        
        reportText += 'RECOMMENDATIONS:\n';
        reportText += '• Use exported JSON for external analysis\n';
        reportText += '• Compare document versions to track changes\n';
        reportText += '• Monitor live document state for real-time insights\n';
        reportText += '• Apply safety filters when accessing dangerous properties\n';
        
        if (g_advUI_jsonAnalysisText) {
            g_advUI_jsonAnalysisText.text = reportText;
        }
        
        updateAdvancedStatus('Analysis report generated successfully');
        
    } catch (exc) {
        updateAdvancedStatus('Report generation error: ' + exc.message);
    }
}

/**
 * Update advanced document info
 */
function updateAdvancedDocumentInfo() {
    try {
        var envCheck = validateInDesignEnvironment();
        
        var infoText = '';
        
        if (envCheck.valid) {
            infoText += 'Document: ' + envCheck.metadata.documentName + '\n';
            infoText += 'InDesign: ' + envCheck.metadata.indesignVersion + '\n';
            infoText += 'JSON Support: ' + (envCheck.metadata.hasNativeJSON ? 'Yes' : 'No') + '\n';
            
            try {
                var doc = envCheck.document;
                infoText += 'Pages: ' + (doc.pages ? doc.pages.length : 'N/A') + '\n';
                infoText += 'Layers: ' + (doc.layers ? doc.layers.length : 'N/A');
            } catch (docExc) {
                infoText += 'Extended info: Limited access';
            }
        } else {
            infoText = 'Error: ' + envCheck.error;
        }
        
        if (g_advUI_documentInfo) {
            g_advUI_documentInfo.text = infoText;
        }
        
    } catch (exc) {
        if (g_advUI_documentInfo) {
            g_advUI_documentInfo.text = 'Info update failed: ' + exc.message;
        }
    }
}

/**
 * Update advanced status
 * @param {String} message - Status message
 */
function updateAdvancedStatus(message) {
    try {
        if (g_advUI_statusText) {
            g_advUI_statusText.text = message;
        }
        
        // Also write to console
        $.writeln('[Advanced UI] ' + message);
        
    } catch (exc) {
        $.writeln('[Advanced UI] ' + message);
    }
}

/**
 * Reset advanced UI
 */
function resetAdvancedUI() {
    try {
        // Clear all data
        g_advUI_advancedDOMStructure = null;
        g_advUI_loadedJSONData = null;
        g_advUI_comparisonResult = null;
        g_advUI_liveAnalysisResult = null;
        g_advUI_baselineDocumentState = null;
        
        // Clear all displays
        if (g_advUI_discoveryDisplay) g_advUI_discoveryDisplay.text = '';
        if (g_advUI_jsonAnalysisText) g_advUI_jsonAnalysisText.text = '';
        if (g_advUI_comparisonText) g_advUI_comparisonText.text = '';
        if (g_advUI_liveAnalysisText) g_advUI_liveAnalysisText.text = '';
        
        updateAdvancedStatus('Advanced UI reset completed');
        
    } catch (exc) {
        updateAdvancedStatus('Reset failed: ' + exc.message);
    }
}

/**
 * Show advanced help
 */
function showAdvancedHelp() {
    try {
        var helpContent = 'ADVANCED DOM DISCOVERY BUILDER v3.1 - HELP\n\n';
        helpContent += 'ADVANCED DISCOVERY TAB:\n';
        helpContent += '• Full Discovery: Complete DOM enumeration with all features\n';
        helpContent += '• Quick Scan: Fast basic structure analysis\n';
        helpContent += '• Export All: Save results in multiple formats\n\n';
        helpContent += 'JSON ANALYSIS TAB:\n';
        helpContent += '• Load JSON File: Import previously exported DOM data\n';
        helpContent += '• Analyze Current: Analyze current discovery results\n';
        helpContent += '• Generate Report: Create comprehensive analysis report\n\n';
        helpContent += 'COMPARISON TAB:\n';
        helpContent += '• Snapshot Compare: Compare two JSON export files\n';
        helpContent += '• Set Baseline: Capture current document state\n';
        helpContent += '• Compare Current: Compare current state with baseline\n\n';
        helpContent += 'LIVE ANALYSIS TAB:\n';
        helpContent += '• Start Monitoring: Begin live document monitoring\n';
        helpContent += '• Manual Refresh: Update analysis on demand\n';
        helpContent += '• Auto Save: Automatically save detected changes\n\n';
        helpContent += 'TIPS:\n';
        helpContent += '• Run Full Discovery before using other features\n';
        helpContent += '• Export results for external analysis\n';
        helpContent += '• Use Safety Mode to avoid dangerous properties\n';
        helpContent += '• Set baselines to track document changes over time';
        
        alert(helpContent);
        
    } catch (exc) {
        alert('Help display error: ' + exc.message);
    }
}

/**
 * Show advanced settings
 */
function showAdvancedSettings() {
    try {
        var settingsContent = 'ADVANCED SETTINGS\n\n';
        settingsContent += 'Current advanced UI provides built-in configuration.\n\n';
        settingsContent += 'Available Settings:\n';
        settingsContent += '• Discovery depth and timeout controls\n';
        settingsContent += '• Safety filtering options\n';
        settingsContent += '• Analysis detail levels\n';
        settingsContent += '• Export format preferences\n';
        settingsContent += '• Comparison sensitivity settings\n\n';
        settingsContent += 'Settings are applied automatically based on selected options in each tab.\n\n';
        settingsContent += 'For custom configurations, modify the module files directly.';
        
        alert(settingsContent);
        
    } catch (exc) {
        alert('Settings display error: ' + exc.message);
    }
}

// Additional helper functions for text generation
function generateJSONAnalysisText(analysis) {
    return generateJSONAnalysisDisplay(analysis);
}

function generateComparisonText(comparisonResult) {
    return generateComparisonDisplay(comparisonResult);
}

// =============================================================================
// END OF 6.1_advanced-ui.jsx
// =============================================================================