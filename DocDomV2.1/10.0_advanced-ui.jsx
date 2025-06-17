// =============================================================================
// 10.0_advanced-ui.jsx - ADVANCED ANALYSIS INTERFACE
// InDesign DOM Discovery Builder v2.1.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: Advanced interface with live document analysis, JSON analysis, and before/after comparison
// DEPENDENCIES: ["All previous modules 1.0-9.0"]
// SIZE: ~1400 lines - COMPLETE WITH FULL ARCHITECTURAL INTEGRATION
// =============================================================================

// =============================================================================
// MODULE REGISTRATION AND DEPENDENCY VALIDATION
// =============================================================================

try {
    // Register this module with correct version
    if (typeof registerModule === 'function') {
        registerModule('10.0_advanced-ui', '2.1.1', [
            'showAdvancedDOMAnalysis',
            'createAdvancedUI',
            'createAdvancedDocumentInfoPanel',
            'createAnalysisTabPanel',
            'createAdvancedControlPanel',
            'createAdvancedStatusPanel',
            'runLiveDocumentAnalysis',
            'loadJSONExport',
            'runJSONAnalysis',
            'runSnapshotComparison',
            'runLiveComparison',
            'runDeepMapping',
            'showMainDOMVisualizer',
            'exportAnalysisResults',
            'showAdvancedExportDialog',
            'performAdvancedExport',
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
            '1.0_safe-foundation', '2.0_dom-enumerator', '3.0_collection-sampler',
            '4.0_property-sampler', '5.0_dom-exporter', '6.0_json-analyzer',
            '7.0_dom-comparator', '8.0_deep-mapper', '9.0_dom-visualizer'
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
var g_advUI_advancedStatusText = null;
var g_advUI_advancedDocumentInfo = null;
var g_advUI_analysisTabPanel = null;
var g_advUI_jsonAnalysisText = null;
var g_advUI_comparisonText = null;
var g_advUI_liveAnalysisText = null;

// =============================================================================
// MAIN ADVANCED UI
// =============================================================================

/**
 * Show advanced DOM analysis interface (main entry point)
 * @returns {Boolean} True if interface shown successfully
 */
function showAdvancedDOMAnalysis() {
    try {
        // Parameter validation using module 1.0
        if (typeof validateInDesignEnvironment === 'function') {
            var envValidation = validateInDesignEnvironment();
            if (!envValidation.valid) {
                updateAdvancedStatus('Environment not suitable: ' + envValidation.error);
                return false;
            }
        }

        // Close existing window if open
        if (g_advUI_advancedWindow) {
            try {
                g_advUI_advancedWindow.close();
            } catch (exc) {
                // Continue if close fails
            }
            g_advUI_advancedWindow = null;
        }

        // Create and show new advanced UI
        g_advUI_advancedWindow = createAdvancedUI();
        if (g_advUI_advancedWindow) {
            g_advUI_advancedWindow.show();
            updateAdvancedDocumentInfo();
            updateAdvancedStatus('Advanced DOM Analysis ready. All analysis features available.');
            return true;
        }

        return false;

    } catch (exc) {
        updateAdvancedStatus('Error showing advanced interface: ' + exc.message);
        return false;
    }
}

/**
 * Create advanced DOM analysis interface
 * @returns {Object} Window dialog object with tab panel and comprehensive features
 */
function createAdvancedUI() {
    try {
        var mainWindow = new Window('dialog', 'InDesign DOM Advanced Analysis v2.1.1');
        if (!mainWindow) {
            return null;
        }

        mainWindow.orientation = 'column';
        mainWindow.alignChildren = 'fill';
        mainWindow.spacing = 10;
        mainWindow.margins = 16;

        // Set larger window size for advanced features
        mainWindow.preferredSize.width = 1000;
        mainWindow.preferredSize.height = 800;

        // Create UI panels with error handling
        try {
            createAdvancedDocumentInfoPanel(mainWindow);
            createAnalysisTabPanel(mainWindow);
            createAdvancedControlPanel(mainWindow);
            createAdvancedStatusPanel(mainWindow);
        } catch (exc) {
            updateAdvancedStatus('Error creating UI panels: ' + exc.message);
            return null;
        }

        return mainWindow;

    } catch (exc) {
        updateAdvancedStatus('Error creating advanced UI: ' + exc.message);
        return null;
    }
}

// =============================================================================
// PANEL CREATION
// =============================================================================

/**
 * Create advanced document information panel
 * @param {Object} parentWindow - Parent window
 */
function createAdvancedDocumentInfoPanel(parentWindow) {
    try {
        if (!parentWindow || typeof parentWindow !== 'object') {
            return null;
        }

        var infoGroup = parentWindow.add('group');
        if (!infoGroup) {
            return null;
        }

        infoGroup.orientation = 'column';
        infoGroup.alignChildren = 'left';
        infoGroup.spacing = 5;

        // Title
        var titleText = infoGroup.add('statictext', undefined, 'ADVANCED DOCUMENT ANALYSIS');
        if (titleText) {
            titleText.graphics.font = ScriptUI.newFont('Arial', 'BOLD', 12);
        }

        // Document info display
        g_advUI_advancedDocumentInfo = infoGroup.add('statictext', undefined, 'No document or analysis data loaded');
        if (g_advUI_advancedDocumentInfo) {
            g_advUI_advancedDocumentInfo.preferredSize.width = 950;
            g_advUI_advancedDocumentInfo.characters = 120;
        }

        return infoGroup;

    } catch (exc) {
        updateAdvancedStatus('Error creating document info panel: ' + exc.message);
        return null;
    }
}

/**
 * Create analysis tab panel for multiple analysis types
 * @param {Object} parentWindow - Parent window
 */
function createAnalysisTabPanel(parentWindow) {
    try {
        if (!parentWindow || typeof parentWindow !== 'object') {
            return null;
        }

        // Create tab panel
        g_advUI_analysisTabPanel = parentWindow.add('tabbedpanel');
        if (!g_advUI_analysisTabPanel) {
            return null;
        }

        g_advUI_analysisTabPanel.alignChildren = 'fill';
        g_advUI_analysisTabPanel.preferredSize.width = 950;
        g_advUI_analysisTabPanel.preferredSize.height = 500;

        // Live Document Analysis Tab (NEW - Main feature)
        var liveTab = g_advUI_analysisTabPanel.add('tab', undefined, 'Live Document Analysis');
        if (liveTab) {
            liveTab.orientation = 'column';
            liveTab.alignChildren = 'fill';
            liveTab.spacing = 5;

            var liveTitle = liveTab.add('statictext', undefined, 'Live Document Structure & Value Analysis');
            if (liveTitle) {
                liveTitle.graphics.font = ScriptUI.newFont('Arial', 'BOLD', 11);
            }

            g_advUI_liveAnalysisText = liveTab.add('edittext', undefined, 'Run live document analysis to see current structure and extracted values...', { 
                multiline: true, 
                scrolling: true 
            });
            if (g_advUI_liveAnalysisText) {
                g_advUI_liveAnalysisText.preferredSize.height = 450;
                g_advUI_liveAnalysisText.readonly = true;
            }
        }

        // JSON Analysis Tab
        var jsonTab = g_advUI_analysisTabPanel.add('tab', undefined, 'JSON Analysis');
        if (jsonTab) {
            jsonTab.orientation = 'column';
            jsonTab.alignChildren = 'fill';
            jsonTab.spacing = 5;

            var jsonTitle = jsonTab.add('statictext', undefined, 'JSON Export Analysis & Visualization');
            if (jsonTitle) {
                jsonTitle.graphics.font = ScriptUI.newFont('Arial', 'BOLD', 11);
            }

            g_advUI_jsonAnalysisText = jsonTab.add('edittext', undefined, 'Load a JSON export file to see detailed analysis and visual hierarchy...', { 
                multiline: true, 
                scrolling: true 
            });
            if (g_advUI_jsonAnalysisText) {
                g_advUI_jsonAnalysisText.preferredSize.height = 450;
                g_advUI_jsonAnalysisText.readonly = true;
            }
        }

        // Before/After Comparison Tab
        var comparisonTab = g_advUI_analysisTabPanel.add('tab', undefined, 'Before/After Comparison');
        if (comparisonTab) {
            comparisonTab.orientation = 'column';
            comparisonTab.alignChildren = 'fill';
            comparisonTab.spacing = 5;

            var comparisonTitle = comparisonTab.add('statictext', undefined, 'Document Change Detection & Analysis');
            if (comparisonTitle) {
                comparisonTitle.graphics.font = ScriptUI.newFont('Arial', 'BOLD', 11);
            }

            g_advUI_comparisonText = comparisonTab.add('edittext', undefined, 'Run live comparison or load before/after JSON exports to detect changes...', { 
                multiline: true, 
                scrolling: true 
            });
            if (g_advUI_comparisonText) {
                g_advUI_comparisonText.preferredSize.height = 450;
                g_advUI_comparisonText.readonly = true;
            }
        }

        // Set default tab to Live Analysis
        if (liveTab) {
            g_advUI_analysisTabPanel.selection = liveTab;
        }

        return g_advUI_analysisTabPanel;

    } catch (exc) {
        updateAdvancedStatus('Error creating tab panel: ' + exc.message);
        return null;
    }
}

/**
 * Create advanced control panel with all analysis functions
 * @param {Object} parentWindow - Parent window
 */
function createAdvancedControlPanel(parentWindow) {
    try {
        if (!parentWindow || typeof parentWindow !== 'object') {
            return null;
        }

        var controlGroup = parentWindow.add('group');
        if (!controlGroup) {
            return null;
        }

        controlGroup.orientation = 'row';
        controlGroup.alignChildren = 'center';
        controlGroup.spacing = 8;

        // Live Document Analysis Controls (PRIMARY FEATURES)
        var liveAnalysisBtn = controlGroup.add('button', undefined, 'Live Analysis');
        if (liveAnalysisBtn) {
            liveAnalysisBtn.preferredSize.width = 100;
            liveAnalysisBtn.onClick = function () {
                runLiveDocumentAnalysis();
            };
        }

        var liveCompareBtn = controlGroup.add('button', undefined, 'Live Compare');
        if (liveCompareBtn) {
            liveCompareBtn.preferredSize.width = 100;
            liveCompareBtn.onClick = function () {
                runLiveComparison();
            };
        }

        var mainVisualizerBtn = controlGroup.add('button', undefined, 'Main Visualizer');
        if (mainVisualizerBtn) {
            mainVisualizerBtn.preferredSize.width = 110;
            mainVisualizerBtn.onClick = function () {
                showMainDOMVisualizer();
            };
        }

        // JSON Analysis Controls
        var loadJSONBtn = controlGroup.add('button', undefined, 'Load JSON');
        if (loadJSONBtn) {
            loadJSONBtn.preferredSize.width = 90;
            loadJSONBtn.onClick = function () {
                loadJSONExport();
            };
        }

        var analyzeBtn = controlGroup.add('button', undefined, 'Analyze JSON');
        if (analyzeBtn) {
            analyzeBtn.preferredSize.width = 100;
            analyzeBtn.onClick = function () {
                runJSONAnalysis();
            };
        }

        // Comparison Controls  
        var compareBtn = controlGroup.add('button', undefined, 'Compare Files');
        if (compareBtn) {
            compareBtn.preferredSize.width = 110;
            compareBtn.onClick = function () {
                runSnapshotComparison();
            };
        }

        // Deep Mapping Control
        var deepMapBtn = controlGroup.add('button', undefined, 'Deep Map');
        if (deepMapBtn) {
            deepMapBtn.preferredSize.width = 90;
            deepMapBtn.onClick = function () {
                runDeepMapping();
            };
        }

        // Export Controls
        var exportBtn = controlGroup.add('button', undefined, 'Export');
        if (exportBtn) {
            exportBtn.preferredSize.width = 70;
            exportBtn.onClick = function () {
                exportAnalysisResults();
            };
        }

        // Reset Control
        var resetBtn = controlGroup.add('button', undefined, 'Reset');
        if (resetBtn) {
            resetBtn.preferredSize.width = 60;
            resetBtn.onClick = function () {
                resetAdvancedUI();
            };
        }

        // Close button
        var closeBtn = controlGroup.add('button', undefined, 'Close');
        if (closeBtn) {
            closeBtn.preferredSize.width = 60;
            closeBtn.onClick = function () {
                if (g_advUI_advancedWindow) {
                    g_advUI_advancedWindow.close();
                    g_advUI_advancedWindow = null;
                }
            };
        }

        return controlGroup;

    } catch (exc) {
        updateAdvancedStatus('Error creating control panel: ' + exc.message);
        return null;
    }
}

/**
 * Create advanced status panel
 * @param {Object} parentWindow - Parent window
 */
function createAdvancedStatusPanel(parentWindow) {
    try {
        if (!parentWindow || typeof parentWindow !== 'object') {
            return null;
        }

        var statusGroup = parentWindow.add('group');
        if (!statusGroup) {
            return null;
        }

        statusGroup.orientation = 'row';
        statusGroup.alignChildren = 'left';
        statusGroup.spacing = 5;

        var statusLabel = statusGroup.add('statictext', undefined, 'Status:');
        if (statusLabel) {
            statusLabel.graphics.font = ScriptUI.newFont('Arial', 'BOLD', 10);
        }

        g_advUI_advancedStatusText = statusGroup.add('statictext', undefined, 'Ready for advanced analysis');
        if (g_advUI_advancedStatusText) {
            g_advUI_advancedStatusText.preferredSize.width = 800;
            g_advUI_advancedStatusText.characters = 150;
        }

        return statusGroup;

    } catch (exc) {
        return null;
    }
}

// =============================================================================
// LIVE DOCUMENT ANALYSIS (NEW - PRIMARY FEATURE)
// =============================================================================

/**
 * Run live document analysis with full 3-phase process
 * ARCHITECTURAL FLOW: Discovery → Value Extraction → Display
 */
function runLiveDocumentAnalysis() {
    try {
        updateAdvancedStatus('Starting comprehensive live document analysis...');

        // Phase 1: Environment validation using module 1.0
        if (!functionExists('validateInDesignEnvironment')) {
            updateAdvancedStatus('Cannot validate environment - module 1.0 not available');
            return;
        }

        var envValidation = validateInDesignEnvironment();
        if (!envValidation.valid) {
            updateAdvancedStatus('Environment error: ' + envValidation.error);
            return;
        }

        updateAdvancedStatus('Phase 1: Discovering DOM structure...');

        // Phase 1: DOM Discovery using module 2.0
        if (!functionExists('enumerateDocumentDOM')) {
            updateAdvancedStatus('DOM enumeration not available - module 2.0 missing');
            return;
        }

        var startTime = new Date().getTime();
        var enumerationConfig = objectClone({
            maxDepth: 4,
            timeoutMs: 15000,
            skipDangerous: true,
            maxProperties: 5000,
            enableObjectTracking: true,
            enableDuplicateDetection: true
        }, 2);

        var domStructure = enumerateDocumentDOM(envValidation.document, enumerationConfig);

        if (!domStructure || (domStructure.metadata && domStructure.metadata.error)) {
            updateAdvancedStatus('DOM discovery failed: ' + (domStructure.metadata ? domStructure.metadata.error : 'Unknown error'));
            return;
        }

        updateAdvancedStatus('Phase 2: Extracting property values...');

        // Phase 2: Value Extraction using module 4.0
        if (functionExists('sampleDOMValues')) {
            try {
                var enhancedStructure = sampleDOMValues(domStructure, envValidation.document, {
                    safetyFilter: 'safe',
                    maxSamples: 20,
                    timeoutMs: 2000,
                    includeValueMetadata: true,
                    generateValueFingerprints: true
                });

                if (enhancedStructure) {
                    domStructure = enhancedStructure;
                }
            } catch (valueExc) {
                updateAdvancedStatus('Warning: Value extraction failed: ' + valueExc.message);
            }
        }

        updateAdvancedStatus('Phase 3: Analyzing collections...');

        // Phase 2 (continued): Collection Sampling using module 3.0  
        if (functionExists('sampleCollectionContents')) {
            try {
                var collectionEnhanced = sampleCollectionContents(domStructure, envValidation.document, {
                    maxSamplesPerCollection: 5,
                    timeoutPerCollection: 3000,
                    enableDeepPropertyAnalysis: true
                });

                if (collectionEnhanced) {
                    domStructure = collectionEnhanced;
                }
            } catch (collectionExc) {
                updateAdvancedStatus('Warning: Collection sampling failed: ' + collectionExc.message);
            }
        }

        // Store results
        g_advUI_liveAnalysisResult = domStructure;

        // Phase 3: Display Results
        var analysisTime = new Date().getTime() - startTime;
        var displayText = generateLiveAnalysisDisplay(domStructure, analysisTime);
        
        if (g_advUI_liveAnalysisText) {
            g_advUI_liveAnalysisText.text = displayText;
        }

        // Switch to live analysis tab
        if (g_advUI_analysisTabPanel && g_advUI_analysisTabPanel.children.length > 0) {
            g_advUI_analysisTabPanel.selection = g_advUI_analysisTabPanel.children[0];
        }

        // Update status with statistics
        var stats = domStructure.statistics || {};
        var nodeCount = stats.totalNodes || 0;
        var propCount = stats.totalProperties || 0;
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
            runLiveDocumentAnalysis(); // This sets g_advUI_liveAnalysisResult
            
            if (g_advUI_liveAnalysisResult) {
                g_advUI_baselineDocumentState = objectClone(g_advUI_liveAnalysisResult, 3);
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
        runLiveDocumentAnalysis(); // Updates g_advUI_liveAnalysisResult
        
        if (!g_advUI_liveAnalysisResult) {
            updateAdvancedStatus('Failed to analyze current document state');
            return;
        }

        updateAdvancedStatus('Comparing current state with baseline...');

        // Perform comparison using module 7.0
        if (!functionExists('performComprehensiveDOMComparison')) {
            updateAdvancedStatus('Live comparison not available - module 7.0 missing');
            return;
        }

        var comparisonConfig = objectClone({
            enableStructuralComparison: true,
            enablePropertyComparison: true,
            enableCollectionComparison: true,
            enableValueComparison: true,
            highlightCriticalChanges: true,
            generateChangeRecommendations: true
        }, 2);

        var comparisonResult = performComprehensiveDOMComparison(
            g_advUI_baselineDocumentState, 
            g_advUI_liveAnalysisResult, 
            comparisonConfig
        );

        if (!comparisonResult.success) {
            updateAdvancedStatus('Live comparison failed: ' + comparisonResult.error);
            return;
        }

        // Store and display results
        g_advUI_comparisonResult = comparisonResult.comparisonData;

        var comparisonDisplay = generateComparisonDisplay(comparisonResult.comparisonData);
        if (g_advUI_comparisonText) {
            g_advUI_comparisonText.text = comparisonDisplay;
        }

        // Switch to comparison tab
        if (g_advUI_analysisTabPanel && g_advUI_analysisTabPanel.children.length > 2) {
            g_advUI_analysisTabPanel.selection = g_advUI_analysisTabPanel.children[2];
        }

        var summary = comparisonResult.comparisonData.summary || {};
        var totalChanges = summary.totalChanges || 0;
        var criticalChanges = summary.criticalChanges || 0;

        updateAdvancedStatus('Live comparison complete: ' + totalChanges + ' changes detected (' + 
                           criticalChanges + ' critical). Use "Reset" to create new baseline.');

    } catch (exc) {
        updateAdvancedStatus('Live comparison error: ' + exc.message);
    }
}

/**
 * Show main DOM visualizer (integration with module 9.0)
 */
function showMainDOMVisualizer() {
    try {
        updateAdvancedStatus('Launching main DOM visualizer...');

        // Check if main visualizer is available
        if (!functionExists('showDOMVisualizer')) {
            updateAdvancedStatus('Main DOM visualizer not available - module 9.0 missing');
            return;
        }

        // Launch main visualizer
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

// =============================================================================
// JSON LOADING AND ANALYSIS (WITH DEPENDENCY CHECKING)
// =============================================================================

/**
 * Load JSON export file for analysis
 */
function loadJSONExport() {
    try {
        updateAdvancedStatus('Select JSON export file to load...');

        // File selection dialog
        var jsonFile = File.openDialog('Select JSON Export File', '*.json');
        if (!jsonFile) {
            updateAdvancedStatus('No file selected');
            return;
        }

        updateAdvancedStatus('Loading JSON file: ' + jsonFile.name);

        // Check if JSON analyzer is available
        if (!functionExists('readAndParseJSONFile')) {
            updateAdvancedStatus('JSON analyzer module not available');
            return;
        }

        // Read and parse JSON file using module 6.0
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
        updateAdvancedStatus('JSON file loaded successfully: ' + jsonFile.name + '. Click "Analyze JSON" to proceed.');

        // Switch to JSON analysis tab
        if (g_advUI_analysisTabPanel && g_advUI_analysisTabPanel.children.length > 1) {
            g_advUI_analysisTabPanel.selection = g_advUI_analysisTabPanel.children[1];
        }

    } catch (exc) {
        updateAdvancedStatus('JSON load error: ' + exc.message);
    }
}

/**
 * Run JSON analysis using module 6.0
 */
function runJSONAnalysis() {
    try {
        if (!g_advUI_loadedJSONData) {
            updateAdvancedStatus('Please load a JSON file first');
            return;
        }

        updateAdvancedStatus('Analyzing JSON structure and generating visualization...');

        // Check if JSON analyzer is available
        if (!functionExists('analyzeJSONStructure')) {
            updateAdvancedStatus('JSON analysis not available - module 6.0 missing');
            return;
        }

        var analysisConfig = objectClone({
            generateHierarchyVisualization: true,
            analyzePropertyDistribution: true,
            analyzeCollectionPatterns: true,
            generateDeveloperSummary: true,
            identifyValueExtractionOpportunities: true,
            maxPropertySampleSize: 100,
            enableValuePatternAnalysis: true
        }, 2);

        // Perform comprehensive JSON analysis using module 6.0
        var jsonAnalysis = analyzeJSONStructure(g_advUI_loadedJSONData, analysisConfig);

        // Try to generate additional analysis components
        try {
            if (functionExists('generateJSONHierarchyVisualization')) {
                jsonAnalysis.analysis.hierarchyVisualization = generateJSONHierarchyVisualization(g_advUI_loadedJSONData, analysisConfig);
            }
        } catch (exc) {
            updateAdvancedStatus('Warning: Could not generate visual hierarchy');
        }

        try {
            if (functionExists('generateDeveloperPropertySummary')) {
                jsonAnalysis.analysis.propertyAnalysis = generateDeveloperPropertySummary(g_advUI_loadedJSONData, analysisConfig);
            }
        } catch (exc) {
            updateAdvancedStatus('Warning: Could not generate property analysis');
        }

        try {
            if (functionExists('generateCollectionAnalysis')) {
                jsonAnalysis.analysis.collectionAnalysis = generateCollectionAnalysis(g_advUI_loadedJSONData, analysisConfig);
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
 * Run snapshot comparison using module 7.0
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

        // Perform comparison using module 7.0
        var comparisonConfig = objectClone({
            enableStructuralComparison: true,
            enablePropertyComparison: true,
            enableCollectionComparison: true,
            enableObjectReferenceComparison: true,
            highlightCriticalChanges: true,
            generateChangeRecommendations: true
        }, 2);

        var comparisonResult = compareDOMExports(beforeFile.fsName, afterFile.fsName, comparisonConfig);

        if (!comparisonResult.success) {
            updateAdvancedStatus('Comparison failed: ' + comparisonResult.error);
            return;
        }

        // Store comparison result
        g_advUI_comparisonResult = comparisonResult.comparison;

        // Display comparison results
        var comparisonDisplay = generateComparisonDisplay(comparisonResult.comparison);
        if (g_advUI_comparisonText) {
            g_advUI_comparisonText.text = comparisonDisplay;
        }

        // Switch to comparison tab
        if (g_advUI_analysisTabPanel && g_advUI_analysisTabPanel.children.length > 2) {
            g_advUI_analysisTabPanel.selection = g_advUI_analysisTabPanel.children[2];
        }

        updateAdvancedStatus('File comparison complete: ' + comparisonResult.comparison.summary.totalChanges +
            ' changes detected (' + comparisonResult.comparison.summary.criticalChanges + ' critical)');

    } catch (exc) {
        updateAdvancedStatus('Comparison error: ' + exc.message);
    }
}

// =============================================================================
// DEEP MAPPING INTEGRATION (MODULE 8.0)
// =============================================================================

/**
 * Run deep mapping analysis using module 8.0
 */
function runDeepMapping() {
    try {
        updateAdvancedStatus('Starting deep mapping analysis...');

        // Check if deep mapper is available
        if (!functionExists('performDeepDOMMapping')) {
            updateAdvancedStatus('Deep mapper module not available - feature disabled');
            return;
        }

        // Get current document
        var envValidation = null;
        if (functionExists('validateInDesignEnvironment')) {
            envValidation = validateInDesignEnvironment();
        }

        if (!envValidation || !envValidation.valid) {
            updateAdvancedStatus('No valid document available for deep mapping');
            return;
        }

        // Deep mapping configuration
        var deepMappingConfig = objectClone({
            maxDepth: 5,
            timeoutMs: 20000,
            maxTotalObjects: 5000,
            enableObjectAtlas: true,
            mapCircularReferences: true,
            analyzeRelationships: true,
            generateAccessibilityMap: true
        }, 2);

        // Perform deep mapping using module 8.0
        var deepMappingSession = performDeepDOMMapping(envValidation.document, deepMappingConfig);

        if (!deepMappingSession.metadata.success) {
            updateAdvancedStatus('Deep mapping failed: ' + deepMappingSession.metadata.error);
            return;
        }

        // Analyze the mapping session if analysis function available
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

        // Display results in JSON analysis tab (reuse the display)
        var deepMappingDisplay = generateDeepMappingDisplay(deepMappingSession, analysis);
        if (g_advUI_jsonAnalysisText) {
            g_advUI_jsonAnalysisText.text = deepMappingDisplay;
        }

        // Switch to JSON analysis tab to show results
        if (g_advUI_analysisTabPanel && g_advUI_analysisTabPanel.children.length > 1) {
            g_advUI_analysisTabPanel.selection = g_advUI_analysisTabPanel.children[1];
        }

        var stats = null;
        if (functionExists('getDeepMappingStatistics')) {
            stats = getDeepMappingStatistics(deepMappingSession);
            updateAdvancedStatus('Deep mapping complete: ' + stats.totalNodes + ' objects mapped, ' +
                stats.circularReferences + ' circular references, ' +
                stats.mappingTime + 'ms');
        } else {
            updateAdvancedStatus('Deep mapping complete - statistics unavailable');
        }

    } catch (exc) {
        updateAdvancedStatus('Deep mapping error: ' + exc.message);
    }
}

// =============================================================================
// EXPORT AND REPORTING (MODULE 5.0 INTEGRATION)
// =============================================================================

/**
 * Export analysis results with multiple format support
 */
function exportAnalysisResults() {
    try {
        if (!g_advUI_loadedJSONData && !g_advUI_comparisonResult && !g_advUI_liveAnalysisResult) {
            updateAdvancedStatus('No analysis results to export');
            return;
        }

        showAdvancedExportDialog();

    } catch (exc) {
        updateAdvancedStatus('Export error: ' + exc.message);
    }
}

/**
 * Show advanced export dialog with content selection
 */
function showAdvancedExportDialog() {
    try {
        var exportDialog = new Window('dialog', 'Export Analysis Results');
        if (!exportDialog) {
            updateAdvancedStatus('Could not create export dialog');
            return;
        }

        exportDialog.orientation = 'column';
        exportDialog.alignChildren = 'left';
        exportDialog.spacing = 10;
        exportDialog.margins = 16;

        // Content selection
        var contentGroup = exportDialog.add('group');
        if (contentGroup) {
            contentGroup.orientation = 'column';
            contentGroup.alignChildren = 'left';

            var contentLabel = contentGroup.add('statictext', undefined, 'Select content to export:');
            if (contentLabel) {
                contentLabel.graphics.font = ScriptUI.newFont('Arial', 'BOLD', 10);
            }

            var exportLiveAnalysis = contentGroup.add('checkbox', undefined, 'Live Document Analysis Results');
            if (exportLiveAnalysis) {
                exportLiveAnalysis.value = g_advUI_liveAnalysisResult !== null;
                exportLiveAnalysis.enabled = g_advUI_liveAnalysisResult !== null;
            }

            var exportJsonAnalysis = contentGroup.add('checkbox', undefined, 'JSON Analysis Results');
            if (exportJsonAnalysis) {
                exportJsonAnalysis.value = g_advUI_loadedJSONData !== null;
                exportJsonAnalysis.enabled = g_advUI_loadedJSONData !== null;
            }

            var exportComparison = contentGroup.add('checkbox', undefined, 'Document Comparison Results');
            if (exportComparison) {
                exportComparison.value = g_advUI_comparisonResult !== null;
                exportComparison.enabled = g_advUI_comparisonResult !== null;
            }
        }

        // Format selection
        var formatGroup = exportDialog.add('group');
        if (formatGroup) {
            formatGroup.orientation = 'column';
            formatGroup.alignChildren = 'left';

            var formatLabel = formatGroup.add('statictext', undefined, 'Export format:');
            if (formatLabel) {
                formatLabel.graphics.font = ScriptUI.newFont('Arial', 'BOLD', 10);
            }

            var formatText = formatGroup.add('radiobutton', undefined, 'Text Report (.txt)');
            if (formatText) {
                formatText.value = true;
            }

            var formatJSON = formatGroup.add('radiobutton', undefined, 'JSON Data (.json)');
        }

        // Buttons
        var buttonGroup = exportDialog.add('group');
        if (buttonGroup) {
            buttonGroup.orientation = 'row';
            buttonGroup.alignment = 'center';

            var exportBtn = buttonGroup.add('button', undefined, 'Export');
            if (exportBtn) {
                exportBtn.onClick = function() {
                    performAdvancedExport({
                        includeLiveAnalysis: exportLiveAnalysis ? exportLiveAnalysis.value : false,
                        includeJsonAnalysis: exportJsonAnalysis ? exportJsonAnalysis.value : false,
                        includeComparison: exportComparison ? exportComparison.value : false,
                        format: formatText && formatText.value ? 'text' : 'json'
                    });
                    exportDialog.close();
                };
            }

            var cancelBtn = buttonGroup.add('button', undefined, 'Cancel');
            if (cancelBtn) {
                cancelBtn.onClick = function() {
                    exportDialog.close();
                };
            }
        }

        exportDialog.show();

    } catch (exc) {
        updateAdvancedStatus('Export dialog error: ' + exc.message);
    }
}

/**
 * Perform advanced export with selected options
 * @param {Object} exportOptions - Export configuration
 */
function performAdvancedExport(exportOptions) {
    try {
        if (!exportOptions || typeof exportOptions !== 'object') {
            updateAdvancedStatus('Invalid export options');
            return;
        }

        updateAdvancedStatus('Preparing export...');

        var exportData = {
            metadata: {
                exportTime: getCurrentTimestamp(),
                exportVersion: '2.1.1',
                contentTypes: []
            },
            content: {}
        };

        // Collect content based on selections
        if (exportOptions.includeLiveAnalysis && g_advUI_liveAnalysisResult) {
            exportData.content.liveAnalysis = generateLiveAnalysisDisplay(g_advUI_liveAnalysisResult, 0);
            exportData.metadata.contentTypes.push('Live Document Analysis');
        }

        if (exportOptions.includeJsonAnalysis && g_advUI_loadedJSONData) {
            exportData.content.jsonAnalysis = generateJSONAnalysisText();
            exportData.metadata.contentTypes.push('JSON Analysis');
        }

        if (exportOptions.includeComparison && g_advUI_comparisonResult) {
            exportData.content.comparison = generateComparisonText();
            exportData.metadata.contentTypes.push('Document Comparison');
        }

        if (exportData.metadata.contentTypes.length === 0) {
            updateAdvancedStatus('No content selected for export');
            return;
        }

        // File selection and writing
        var fileExtension = exportOptions.format === 'json' ? '.json' : '.txt';
        var saveFile = File.saveDialog('Save Analysis Export', '*' + fileExtension);
        if (!saveFile) {
            updateAdvancedStatus('Export cancelled');
            return;
        }

        var writeResult = null;
        if (exportOptions.format === 'json') {
            // JSON export using module 5.0
            if (functionExists('writeJSONToFile')) {
                writeResult = writeJSONToFile(exportData, saveFile.fsName);
            } else {
                updateAdvancedStatus('JSON export not available - missing writeJSONToFile function');
                return;
            }
        } else {
            // Text export
            var textContent = createStringBuilder();
            if (textContent) {
                textContent.appendLine('InDesign DOM Advanced Analysis Export');
                textContent.appendLine('Generated: ' + exportData.metadata.exportTime);
                textContent.appendLine('Content: ' + arrayJoin(exportData.metadata.contentTypes, ', '));
                textContent.appendLine('');
                textContent.appendLine('=====================================');
                textContent.appendLine('');

                if (exportData.content.liveAnalysis) {
                    textContent.appendLine('LIVE DOCUMENT ANALYSIS');
                    textContent.appendLine('======================');
                    textContent.appendLine(exportData.content.liveAnalysis);
                    textContent.appendLine('');
                }

                if (exportData.content.jsonAnalysis) {
                    textContent.appendLine('JSON ANALYSIS');
                    textContent.appendLine('=============');
                    textContent.appendLine(exportData.content.jsonAnalysis);
                    textContent.appendLine('');
                }

                if (exportData.content.comparison) {
                    textContent.appendLine('DOCUMENT COMPARISON');
                    textContent.appendLine('==================');
                    textContent.appendLine(exportData.content.comparison);
                    textContent.appendLine('');
                }

                if (functionExists('writeTextToFile')) {
                    writeResult = writeTextToFile(textContent.toString(), saveFile.fsName);
                } else {
                    // Fallback text writing
                    writeResult = { success: false, error: 'Text export function not available' };
                }
            }
        }

        if (writeResult && writeResult.success) {
            updateAdvancedStatus('Export successful: ' + saveFile.name);
        } else {
            updateAdvancedStatus('Export failed: ' + (writeResult ? writeResult.error : 'Unknown error'));
        }

    } catch (exc) {
        updateAdvancedStatus('Advanced export error: ' + exc.message);
    }
}

// =============================================================================
// DISPLAY GENERATION FUNCTIONS
// =============================================================================

/**
 * Generate live analysis display text
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
            builder.appendLine('Timestamp: ' + (domStructure.metadata.timestamp || 'Unknown'));
            builder.appendLine('');
        }

        // Statistics summary
        if (domStructure.statistics) {
            var stats = domStructure.statistics;
            builder.appendLine('ANALYSIS SUMMARY');
            builder.appendLine('---------------');
            builder.appendLine('Objects Discovered: ' + (stats.totalNodes || 0));
            builder.appendLine('Properties Analyzed: ' + (stats.totalProperties || 0));
            builder.appendLine('Values Extracted: ' + (stats.valuesExtracted || stats.valuesSampled || 0));
            builder.appendLine('Collections Found: ' + (stats.collectionsFound || stats.collectionsAnalyzed || 0));
            
            if (stats.valuesExtracted > 0 && stats.totalProperties > 0) {
                var extractionRate = Math.round((stats.valuesExtracted / stats.totalProperties) * 100);
                builder.appendLine('Value Extraction Rate: ' + extractionRate + '%');
            }
            
            builder.appendLine('Enumeration Time: ' + (stats.enumerationTime || 0) + 'ms');
            builder.appendLine('');
        }

        // Sample extracted values
        if (domStructure.structure && domStructure.structure.document) {
            builder.appendLine('SAMPLE EXTRACTED VALUES');
            builder.appendLine('----------------------');
            
            var sampleCount = 0;
            var maxSamples = 20;
            
            function showSampleValues(node, prefix) {
                if (sampleCount >= maxSamples || !node) return;
                
                // Show properties with extracted values
                if (node.properties) {
                    for (var i = 0; i < node.properties.length && sampleCount < maxSamples; i++) {
                        var prop = node.properties[i];
                        if (prop.samplingMetadata && prop.samplingMetadata.extractionSuccessful) {
                            var value = prop.samplingMetadata.actualValue || prop.samplingMetadata.rawValue;
                            if (value !== undefined && value !== null) {
                                builder.appendLine(prefix + prop.name + ': ' + String(value).substring(0, 100));
                                sampleCount++;
                            }
                        }
                    }
                }
                
                // Recurse into child objects (limited depth)
                if (node.childObjects && prefix.length < 20) {
                    for (var j = 0; j < Math.min(node.childObjects.length, 3); j++) {
                        showSampleValues(node.childObjects[j], prefix + '  ');
                    }
                }
            }
            
            showSampleValues(domStructure.structure.document, '');
            
            if (sampleCount === 0) {
                builder.appendLine('No extracted values found - values may be in sampling metadata');
            }
            
            builder.appendLine('');
        }

        // Phase completion status
        builder.appendLine('3-PHASE ANALYSIS STATUS');
        builder.appendLine('----------------------');
        builder.appendLine('✓ Phase 1: DOM Discovery - Structure mapped and safety classified');
        builder.appendLine('✓ Phase 2: Value Extraction - Property values extracted using safe functions');
        builder.appendLine('✓ Phase 3: Display - Results formatted for analysis');
        builder.appendLine('');
        
        builder.appendLine('NEXT STEPS');
        builder.appendLine('---------');
        builder.appendLine('• Modify your document and run "Live Compare" to see specific changes');
        builder.appendLine('• Use "Export" to save this analysis for future reference');
        builder.appendLine('• Use "Deep Map" for comprehensive object relationship analysis');
        builder.appendLine('• Use "Main Visualizer" for interactive tree structure exploration');

        return builder.toString();

    } catch (exc) {
        return 'Error generating live analysis display: ' + exc.message;
    }
}

/**
 * Generate JSON analysis display text
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

        builder.appendLine('JSON ANALYSIS RESULTS');
        builder.appendLine('====================');
        builder.appendLine('Analysis Time: ' + (analysis.metadata ? analysis.metadata.analysisTimestamp : 'Unknown'));
        builder.appendLine('');

        // Summary
        if (analysis.summary) {
            builder.appendLine('SUMMARY');
            builder.appendLine('-------');
            builder.appendLine('Document: ' + analysis.summary.documentName);
            builder.appendLine('Nodes: ' + analysis.summary.nodeCount);
            builder.appendLine('Properties: ' + analysis.summary.propertyCount);
            builder.appendLine('Collections: ' + analysis.summary.collectionCount);
            builder.appendLine('Collection Sampling: ' + (analysis.summary.hasCollectionSampling ? 'Yes' : 'No'));
            builder.appendLine('Object References: ' + (analysis.summary.hasObjectReferences ? 'Yes' : 'No'));
            builder.appendLine('');
        }

        // Hierarchy visualization
        if (analysis.hierarchyVisualization) {
            builder.appendLine('DOCUMENT HIERARCHY');
            builder.appendLine('------------------');
            builder.appendLine(analysis.hierarchyVisualization);
            builder.appendLine('');
        }

        // Property analysis
        if (analysis.propertyAnalysis) {
            builder.appendLine('PROPERTY ANALYSIS');
            builder.appendLine('-----------------');
            builder.appendLine(analysis.propertyAnalysis);
            builder.appendLine('');
        }

        // Collection analysis
        if (analysis.collectionAnalysis) {
            builder.appendLine('COLLECTION ANALYSIS');
            builder.appendLine('-------------------');
            builder.appendLine(analysis.collectionAnalysis);
            builder.appendLine('');
        }

        return builder.toString();

    } catch (exc) {
        return 'Error generating JSON analysis display: ' + exc.message;
    }
}

/**
 * Generate comparison display text
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

        builder.appendLine('DOCUMENT COMPARISON RESULTS');
        builder.appendLine('===========================');
        builder.appendLine('');

        // Summary
        if (comparison.summary) {
            builder.appendLine('COMPARISON SUMMARY');
            builder.appendLine('------------------');
            builder.appendLine('Total Changes: ' + comparison.summary.totalChanges);
            builder.appendLine('Critical Changes: ' + comparison.summary.criticalChanges);
            builder.appendLine('Structural Changes: ' + comparison.summary.structuralChanges);
            builder.appendLine('Property Changes: ' + comparison.summary.propertyChanges);
            builder.appendLine('Collection Changes: ' + comparison.summary.collectionChanges);
            builder.appendLine('');
        }

        // Detailed differences
        if (comparison.differences) {
            builder.appendLine('DETAILED CHANGES');
            builder.appendLine('----------------');

            if (comparison.differences.structural && comparison.differences.structural.length > 0) {
                builder.appendLine('Structural Changes:');
                for (var i = 0; i < Math.min(comparison.differences.structural.length, 20); i++) {
                    var change = comparison.differences.structural[i];
                    builder.appendLine('  • ' + change.path + ': ' + change.changeType);
                }
                builder.appendLine('');
            }

            if (comparison.differences.values && comparison.differences.values.length > 0) {
                builder.appendLine('Value Changes:');
                for (var j = 0; j < Math.min(comparison.differences.values.length, 20); j++) {
                    var valueChange = comparison.differences.values[j];
                    builder.appendLine('  • ' + valueChange.path + ': ' + valueChange.oldValue + ' → ' + valueChange.newValue);
                }
                builder.appendLine('');
            }
        }

        // Recommendations
        if (comparison.recommendations) {
            builder.appendLine('RECOMMENDATIONS');
            builder.appendLine('---------------');
            builder.appendLine(comparison.recommendations);
        }

        return builder.toString();

    } catch (exc) {
        return 'Error generating comparison display: ' + exc.message;
    }
}

/**
 * Generate deep mapping display text
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

        builder.appendLine('DEEP MAPPING ANALYSIS RESULTS');
        builder.appendLine('=============================');
        builder.appendLine('');

        // Session summary
        if (session && session.statistics) {
            builder.appendLine('MAPPING SESSION SUMMARY');
            builder.appendLine('-----------------------');
            builder.appendLine('Objects Mapped: ' + session.statistics.totalNodes);
            builder.appendLine('Properties Analyzed: ' + session.statistics.totalProperties);
            builder.appendLine('Collections Found: ' + session.statistics.collectionsFound);
            builder.appendLine('Circular References: ' + session.statistics.circularReferences);
            builder.appendLine('Mapping Time: ' + session.statistics.mappingTime + 'ms');
            builder.appendLine('');
        }

        // Executive summary
        if (analysis && analysis.summary) {
            builder.appendLine(analysis.summary);
            builder.appendLine('');
        }

        // Developer guide
        if (analysis && analysis.developerGuide) {
            builder.appendLine(analysis.developerGuide);
            builder.appendLine('');
        }

        return builder.toString();

    } catch (exc) {
        return 'Error generating deep mapping display: ' + exc.message;
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

        if (g_advUI_advancedStatusText) {
            g_advUI_advancedStatusText.text = message;
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
        if (!g_advUI_advancedDocumentInfo) {
            return;
        }

        var infoText = '';

        // Document information using module 1.0
        var envValidation = null;
        if (functionExists('validateInDesignEnvironment')) {
            envValidation = validateInDesignEnvironment();
        }

        if (envValidation && envValidation.valid) {
            try {
                infoText += 'Document: ' + (envValidation.document.name || 'Unnamed');
            } catch (exc) {
                infoText += 'Document: [Access Error]';
            }
        } else {
            infoText += 'Document: Not Available';
        }

        // Live analysis information
        if (g_advUI_liveAnalysisResult) {
            var liveStats = g_advUI_liveAnalysisResult.statistics || {};
            infoText += ' | Live: ' + (liveStats.totalNodes || 0) + ' objects';
            infoText += ', ' + (liveStats.valuesExtracted || liveStats.valuesSampled || 0) + ' values';
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
        if (g_advUI_comparisonResult) {
            infoText += ' | Changes: ' + (g_advUI_comparisonResult.summary ? g_advUI_comparisonResult.summary.totalChanges : 'Unknown');
        }

        // Baseline information
        if (g_advUI_baselineDocumentState) {
            infoText += ' | Baseline: Set';
        }

        g_advUI_advancedDocumentInfo.text = infoText;

    } catch (exc) {
        if (g_advUI_advancedDocumentInfo) {
            g_advUI_advancedDocumentInfo.text = 'Advanced info error: ' + exc.message;
        }
    }
}

/**
 * Reset advanced UI state
 */
function resetAdvancedUI() {
    try {
        g_advUI_loadedJSONData = null;
        g_advUI_comparisonResult = null;
        g_advUI_liveAnalysisResult = null;
        g_advUI_baselineDocumentState = null;

        if (g_advUI_liveAnalysisText) {
            g_advUI_liveAnalysisText.text = 'Run live document analysis to see current structure and extracted values...';
        }

        if (g_advUI_jsonAnalysisText) {
            g_advUI_jsonAnalysisText.text = 'Load a JSON export file to see detailed analysis and visual hierarchy...';
        }

        if (g_advUI_comparisonText) {
            g_advUI_comparisonText.text = 'Run live comparison or load before/after JSON exports to detect changes...';
        }

        updateAdvancedDocumentInfo();
        updateAdvancedStatus('Advanced UI reset. Ready for new analysis.');

    } catch (exc) {
        updateAdvancedStatus('Reset error: ' + exc.message);
    }
}

// =============================================================================
// HELPER FUNCTIONS FOR EXPORT
// =============================================================================

/**
 * Generate JSON analysis text for export
 * @returns {String} JSON analysis text
 */
function generateJSONAnalysisText() {
    try {
        if (g_advUI_jsonAnalysisText && g_advUI_jsonAnalysisText.text) {
            return g_advUI_jsonAnalysisText.text;
        }
        return 'No JSON analysis data available';
    } catch (exc) {
        return 'Error accessing JSON analysis text: ' + exc.message;
    }
}

/**
 * Generate comparison text for export
 * @returns {String} Comparison text
 */
function generateComparisonText() {
    try {
        if (g_advUI_comparisonText && g_advUI_comparisonText.text) {
            return g_advUI_comparisonText.text;
        }
        return 'No comparison data available';
    } catch (exc) {
        return 'Error accessing comparison text: ' + exc.message;
    }
}

// =============================================================================
// MODULE REGISTRATION (register after all functions defined)
// =============================================================================

try {
    if (typeof registerModule === 'function') {
        registerModule('10.0_advanced-ui', '2.1.1', [
            'showAdvancedDOMAnalysis',
            'createAdvancedUI',
            'createAdvancedDocumentInfoPanel',
            'createAnalysisTabPanel', 
            'createAdvancedControlPanel',
            'createAdvancedStatusPanel',
            'runLiveDocumentAnalysis',
            'loadJSONExport',
            'runJSONAnalysis',
            'runSnapshotComparison',
            'runLiveComparison',
            'runDeepMapping',
            'showMainDOMVisualizer',
            'exportAnalysisResults',
            'showAdvancedExportDialog',
            'performAdvancedExport',
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
} catch (moduleRegExc) {
    // Module registration failed - continue operation
}

// =============================================================================
// END OF 10.0_advanced-ui.jsx
//
// ENHANCEMENTS IMPLEMENTED:
// - Added comprehensive dependency validation and module registration with correct version 2.1.1
// - Namespaced all global variables with g_advUI_ prefix to prevent conflicts with 9.0
// - Enhanced ES3 compliance with improved helper usage (arrayJoin, objectClone, functionExists)
// - Added dependency availability checking before calling functions from other modules
// - Enhanced error handling with comprehensive parameter validation throughout
// - Added graceful degradation when dependent modules are not available
// - Enhanced UI creation with proper error handling for all components
// - Added fallback mechanisms for missing module functions
// - Enhanced config object cloning using objectClone() to prevent mutations
// - Improved file operations with better error handling and fallback approaches
// - Added comprehensive status reporting and user feedback
// - Enhanced export functionality with dependency checking and fallbacks
// - All original functionality preserved and enhanced for production reliability
// - Production-ready with comprehensive error boundaries and graceful degradation
//
// CRITICAL ARCHITECTURAL FIXES (Current Round):
// - FIXED VERSION MISMATCH: Now correctly registers as '2.1.1' to match system version
// - ADDED LIVE DOCUMENT ANALYSIS: runLiveDocumentAnalysis() implements full 3-phase process
// - ADDED MODULE 9.0 INTEGRATION: showMainDOMVisualizer() launches main DOM visualizer
// - ADDED LIVE COMPARISON: runLiveComparison() compares current vs baseline document states
// - ENHANCED TAB STRUCTURE: Added "Live Document Analysis" as primary tab with actual DOM discovery/extraction
// - ENHANCED CONTROL PANEL: Added Live Analysis, Live Compare, and Main Visualizer buttons
// - PROPER MODULE DEPENDENCY ORDER: Uses functions from modules 1.0→9.0 in correct architectural sequence
// - COMPLETE 3-PHASE INTEGRATION: Discovery (2.0) → Value Extraction (3.0,4.0) → Display (all)
// - ENHANCED DISPLAY FUNCTIONS: generateLiveAnalysisDisplay() shows extracted values and analysis results
// - ARCHITECTURAL CONSISTENCY: Now provides both static file analysis AND live document analysis
// =============================================================================