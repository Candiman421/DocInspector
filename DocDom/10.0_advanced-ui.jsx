//
// 10.0_advanced-ui.jsx  
// InDesign DOM Discovery Builder - Advanced UI with JSON Analysis and Comparison
// CORE PURPOSE: Advanced interface with JSON analysis and before/after comparison
// DEPENDENCIES: 1.0-9.2 (all modules), specifically 7.0_json-analyzer, 8.0_dom-comparator
// SAFETY: Uses proven ExtendScript UI patterns with enhanced analysis features
// ES3 COMPATIBLE: No reserved words, no modern JS features
//

// ============================================================================
// GLOBAL STATE FOR ADVANCED UI
// ============================================================================

var ADVANCED_UI_STATE = {
    currentDOMStructure: null,
    previousDOMStructure: null,
    sourceDocument: null,
    dialog: null,
    displays: {
        analysisView: null,
        comparisonView: null,
        status: null,
        documentInfo: null
    },
    controls: {
        loadJsonButton: null,
        compareButton: null,
        analyzeButton: null,
        exportButton: null,
        resetButton: null
    },
    jsonAnalysisResults: null,
    comparisonResults: null
};

// ============================================================================
// MAIN ADVANCED UI CREATION
// ============================================================================

/**
 * Create advanced DOM analysis interface
 * @returns {Object} - Window dialog object
 */
function createAdvancedUI() {
    try {
        // Create main dialog
        var dialog = new Window('dialog', 'InDesign DOM Advanced Analysis v2.1');
        dialog.orientation = 'column';
        dialog.alignChildren = 'fill';
        dialog.preferredSize.width = 1000;
        dialog.preferredSize.height = 800;
        
        // Header panel with document info
        var headerPanel = createAdvancedDocumentInfoPanel(dialog);
        
        // Tab panel for different analysis views
        var tabPanel = createAnalysisTabPanel(dialog);
        
        // Control panel with advanced actions
        var controlPanel = createAdvancedControlPanel(dialog);
        
        // Status panel
        var statusPanel = createAdvancedStatusPanel(dialog);
        
        // Close button
        var closeButton = dialog.add('button', undefined, 'Close');
        closeButton.onClick = function() {
            dialog.close();
        };
        
        // Store references
        ADVANCED_UI_STATE.dialog = dialog;
        
        return dialog;
        
    } catch (exc) {
        $.writeln('ERROR: Failed to create advanced UI: ' + exc.message);
        return null;
    }
}

/**
 * Create advanced document information panel
 * @param {Object} parentWindow - Parent window object
 * @returns {Object} - Panel object
 */
function createAdvancedDocumentInfoPanel(parentWindow) {
    var panel = parentWindow.add('panel', undefined, 'Advanced Document Analysis');
    panel.alignment = 'fill';
    panel.preferredSize.height = 100;
    
    var infoGroup = panel.add('group');
    infoGroup.orientation = 'column';
    infoGroup.alignChildren = 'fill';
    
    var currentDocInfo = infoGroup.add('statictext', undefined, 'Current: No document loaded');
    var previousDocInfo = infoGroup.add('statictext', undefined, 'Previous: No snapshot loaded');
    var analysisInfo = infoGroup.add('statictext', undefined, 'Analysis: Ready for advanced operations');
    
    // Store references
    ADVANCED_UI_STATE.displays.documentInfo = {
        current: currentDocInfo,
        previous: previousDocInfo,
        analysis: analysisInfo
    };
    
    // Update with current info
    updateAdvancedDocumentInfo();
    
    return panel;
}

/**
 * Create analysis tab panel
 * @param {Object} parentWindow - Parent window object
 * @returns {Object} - Panel object
 */
function createAnalysisTabPanel(parentWindow) {
    var tabbedPanel = parentWindow.add('tabbedpanel');
    tabbedPanel.alignment = 'fill';
    tabbedPanel.preferredSize.height = 550;
    
    // JSON Analysis tab
    var analysisTab = tabbedPanel.add('tab', undefined, 'JSON Analysis');
    var analysisView = analysisTab.add('edittext', undefined, 'Load JSON export to analyze DOM structure...', {
        multiline: true,
        readonly: true,
        scrolling: true
    });
    analysisView.alignment = 'fill';
    
    // Comparison tab
    var comparisonTab = tabbedPanel.add('tab', undefined, 'Before/After Comparison');
    var comparisonView = comparisonTab.add('edittext', undefined, 'Load two JSON exports to compare document changes...', {
        multiline: true,
        readonly: true,
        scrolling: true
    });
    comparisonView.alignment = 'fill';
    
    // Store references
    ADVANCED_UI_STATE.displays.analysisView = analysisView;
    ADVANCED_UI_STATE.displays.comparisonView = comparisonView;
    
    return tabbedPanel;
}

/**
 * Create advanced control panel
 * @param {Object} parentWindow - Parent window object
 * @returns {Object} - Panel object
 */
function createAdvancedControlPanel(parentWindow) {
    var panel = parentWindow.add('panel', undefined, 'Advanced Operations');
    panel.alignment = 'fill';
    panel.preferredSize.height = 100;
    
    var buttonGroup1 = panel.add('group');
    buttonGroup1.alignment = 'center';
    buttonGroup1.spacing = 10;
    
    // Load JSON button
    var loadJsonBtn = buttonGroup1.add('button', undefined, 'Load JSON Export');
    loadJsonBtn.preferredSize.width = 120;
    loadJsonBtn.onClick = function() {
        loadJSONExport();
    };
    
    // Analyze JSON button
    var analyzeBtn = buttonGroup1.add('button', undefined, 'Analyze Structure');
    analyzeBtn.preferredSize.width = 120;
    analyzeBtn.enabled = false;
    analyzeBtn.onClick = function() {
        runJSONAnalysis();
    };
    
    // Compare button
    var compareBtn = buttonGroup1.add('button', undefined, 'Compare Snapshots');
    compareBtn.preferredSize.width = 120;
    compareBtn.enabled = false;
    compareBtn.onClick = function() {
        runSnapshotComparison();
    };
    
    var buttonGroup2 = panel.add('group');
    buttonGroup2.alignment = 'center';
    buttonGroup2.spacing = 10;
    
    // Export Analysis button
    var exportBtn = buttonGroup2.add('button', undefined, 'Export Analysis');
    exportBtn.preferredSize.width = 120;
    exportBtn.enabled = false;
    exportBtn.onClick = function() {
        exportAnalysisResults();
    };
    
    // Reset button
    var resetBtn = buttonGroup2.add('button', undefined, 'Reset All');
    resetBtn.preferredSize.width = 100;
    resetBtn.onClick = function() {
        resetAdvancedUI();
    };
    
    // Store references
    ADVANCED_UI_STATE.controls.loadJsonButton = loadJsonBtn;
    ADVANCED_UI_STATE.controls.analyzeButton = analyzeBtn;
    ADVANCED_UI_STATE.controls.compareButton = compareBtn;
    ADVANCED_UI_STATE.controls.exportButton = exportBtn;
    ADVANCED_UI_STATE.controls.resetButton = resetBtn;
    
    return panel;
}

/**
 * Create advanced status panel
 * @param {Object} parentWindow - Parent window object
 * @returns {Object} - Panel object
 */
function createAdvancedStatusPanel(parentWindow) {
    var panel = parentWindow.add('panel', undefined, 'Analysis Status');
    panel.alignment = 'fill';
    panel.preferredSize.height = 60;
    
    var statusText = panel.add('statictext', undefined, 'Ready for advanced DOM analysis and comparison');
    statusText.alignment = 'fill';
    
    // Store reference
    ADVANCED_UI_STATE.displays.status = statusText;
    
    return panel;
}

// ============================================================================
// JSON LOADING AND ANALYSIS
// ============================================================================

/**
 * Load JSON export file for analysis
 */
function loadJSONExport() {
    try {
        updateAdvancedStatus('Selecting JSON export file...');
        
        var jsonFile = File.openDialog('Select DOM JSON Export', '*.json');
        if (!jsonFile) {
            updateAdvancedStatus('JSON file selection cancelled');
            return;
        }
        
        updateAdvancedStatus('Loading JSON export: ' + jsonFile.name);
        
        // Read JSON file
        var jsonContent = readJSONFile(jsonFile);
        if (!jsonContent.success) {
            updateAdvancedStatus('Failed to read JSON file: ' + jsonContent.error);
            alert('Failed to read JSON file:\n\n' + jsonContent.error);
            return;
        }
        
        // Parse JSON content
        var parseResult = parseJSONContent(jsonContent.content);
        if (!parseResult.success) {
            updateAdvancedStatus('Failed to parse JSON: ' + parseResult.error);
            alert('Failed to parse JSON:\n\n' + parseResult.error);
            return;
        }
        
        // Store loaded DOM structure
        if (ADVANCED_UI_STATE.currentDOMStructure) {
            // Move current to previous
            ADVANCED_UI_STATE.previousDOMStructure = ADVANCED_UI_STATE.currentDOMStructure;
        }
        ADVANCED_UI_STATE.currentDOMStructure = parseResult.domStructure;
        
        // Enable analysis buttons
        if (ADVANCED_UI_STATE.controls.analyzeButton) {
            ADVANCED_UI_STATE.controls.analyzeButton.enabled = true;
        }
        
        if (ADVANCED_UI_STATE.previousDOMStructure && ADVANCED_UI_STATE.controls.compareButton) {
            ADVANCED_UI_STATE.controls.compareButton.enabled = true;
        }
        
        updateAdvancedStatus('JSON loaded successfully: ' + jsonFile.name);
        updateAdvancedDocumentInfo();
        
    } catch (exc) {
        updateAdvancedStatus('Error loading JSON: ' + exc.message);
        alert('Error loading JSON:\n\n' + exc.message);
    }
}

/**
 * Run JSON analysis using 7.0 module
 */
function runJSONAnalysis() {
    try {
        if (!ADVANCED_UI_STATE.currentDOMStructure) {
            alert('No DOM structure loaded. Please load a JSON export first.');
            return;
        }
        
        updateAdvancedStatus('Analyzing JSON structure...');
        
        // Check if JSON analyzer is available
        if (typeof analyzeJSONStructure !== 'function') {
            updateAdvancedStatus('JSON analyzer not available');
            alert('JSON analyzer module (7.0) is not loaded.\n\nJSON analysis is not available.');
            return;
        }
        
        // Run analysis
        var analysisConfig = {
            generateHierarchy: true,
            includeMetadata: true,
            maxDepthDisplay: 6,
            showOnlyRelevant: true
        };
        
        var analysisResult = analyzeJSONStructure(ADVANCED_UI_STATE.currentDOMStructure, analysisConfig);
        
        if (analysisResult.success) {
            ADVANCED_UI_STATE.jsonAnalysisResults = analysisResult;
            
            // Display results in analysis view
            if (ADVANCED_UI_STATE.displays.analysisView) {
                ADVANCED_UI_STATE.displays.analysisView.text = analysisResult.formattedHierarchy;
            }
            
            updateAdvancedStatus('JSON analysis complete - ' + analysisResult.statistics.totalNodes + ' nodes analyzed');
            
            // Enable export
            if (ADVANCED_UI_STATE.controls.exportButton) {
                ADVANCED_UI_STATE.controls.exportButton.enabled = true;
            }
            
        } else {
            updateAdvancedStatus('JSON analysis failed: ' + analysisResult.error);
            alert('JSON analysis failed:\n\n' + analysisResult.error);
        }
        
    } catch (exc) {
        updateAdvancedStatus('JSON analysis error: ' + exc.message);
        alert('JSON analysis error:\n\n' + exc.message);
    }
}

/**
 * Run snapshot comparison using 8.0 module
 */
function runSnapshotComparison() {
    try {
        if (!ADVANCED_UI_STATE.currentDOMStructure || !ADVANCED_UI_STATE.previousDOMStructure) {
            alert('Need both current and previous DOM structures.\n\nLoad two JSON exports to compare.');
            return;
        }
        
        updateAdvancedStatus('Comparing DOM snapshots...');
        
        // Check if comparator is available
        if (typeof compareDOMStructures !== 'function') {
            updateAdvancedStatus('DOM comparator not available');
            alert('DOM comparator module (8.0) is not loaded.\n\nComparison is not available.');
            return;
        }
        
        // Run comparison
        var comparisonConfig = {
            includePropertyValues: true,
            detectMoved: true,
            includeCollectionChanges: true,
            showUnchanged: false
        };
        
        var comparisonResult = compareDOMStructures(
            ADVANCED_UI_STATE.previousDOMStructure,
            ADVANCED_UI_STATE.currentDOMStructure,
            comparisonConfig
        );
        
        if (comparisonResult.success) {
            ADVANCED_UI_STATE.comparisonResults = comparisonResult;
            
            // Display results in comparison view
            if (ADVANCED_UI_STATE.displays.comparisonView) {
                ADVANCED_UI_STATE.displays.comparisonView.text = comparisonResult.formattedDiff;
            }
            
            var stats = comparisonResult.statistics;
            updateAdvancedStatus('Comparison complete - ' + stats.totalChanges + ' changes detected (' + 
                               stats.added + ' added, ' + stats.removed + ' removed, ' + 
                               stats.modified + ' modified)');
            
            // Enable export
            if (ADVANCED_UI_STATE.controls.exportButton) {
                ADVANCED_UI_STATE.controls.exportButton.enabled = true;
            }
            
        } else {
            updateAdvancedStatus('Comparison failed: ' + comparisonResult.error);
            alert('Comparison failed:\n\n' + comparisonResult.error);
        }
        
    } catch (exc) {
        updateAdvancedStatus('Comparison error: ' + exc.message);
        alert('Comparison error:\n\n' + exc.message);
    }
}

// ============================================================================
// FILE OPERATIONS
// ============================================================================

/**
 * Read JSON file content safely
 * @param {File} jsonFile - File object to read
 * @returns {Object} - {success: boolean, content: string, error: string}
 */
function readJSONFile(jsonFile) {
    var result = {
        success: false,
        content: '',
        error: ''
    };
    
    try {
        if (!jsonFile.open('r')) {
            result.error = 'Cannot open file for reading';
            return result;
        }
        
        var content = jsonFile.read();
        jsonFile.close();
        
        if (!content) {
            result.error = 'File is empty or could not be read';
            return result;
        }
        
        result.success = true;
        result.content = content;
        
    } catch (exc) {
        result.error = 'File read error: ' + exc.message;
        try {
            jsonFile.close();
        } catch (closeExc) {
            // Ignore close errors
        }
    }
    
    return result;
}

/**
 * Parse JSON content to DOM structure
 * @param {String} jsonContent - JSON string content
 * @returns {Object} - {success: boolean, domStructure: object, error: string}
 */
function parseJSONContent(jsonContent) {
    var result = {
        success: false,
        domStructure: null,
        error: ''
    };
    
    try {
        // Use eval to parse JSON (ES3 compatible)
        var parsedData = eval('(' + jsonContent + ')');
        
        if (!parsedData) {
            result.error = 'Parsed JSON is null or undefined';
            return result;
        }
        
        // Validate that it's a DOM structure
        if (!parsedData.metadata || !parsedData.structure) {
            result.error = 'JSON does not appear to be a DOM structure export';
            return result;
        }
        
        result.success = true;
        result.domStructure = parsedData;
        
    } catch (exc) {
        result.error = 'JSON parse error: ' + exc.message;
    }
    
    return result;
}

// ============================================================================
// EXPORT FUNCTIONALITY
// ============================================================================

/**
 * Export analysis results
 */
function exportAnalysisResults() {
    try {
        if (!ADVANCED_UI_STATE.jsonAnalysisResults && !ADVANCED_UI_STATE.comparisonResults) {
            alert('No analysis results to export.\n\nRun analysis or comparison first.');
            return;
        }
        
        updateAdvancedStatus('Showing export options...');
        showAdvancedExportDialog();
        
    } catch (exc) {
        updateAdvancedStatus('Export error: ' + exc.message);
        alert('Export error:\n\n' + exc.message);
    }
}

/**
 * Show advanced export dialog
 */
function showAdvancedExportDialog() {
    var exportDialog = new Window('dialog', 'Export Analysis Results');
    exportDialog.orientation = 'column';
    exportDialog.alignChildren = 'fill';
    exportDialog.preferredSize.width = 500;
    exportDialog.preferredSize.height = 400;
    
    // Header
    var headerPanel = exportDialog.add('panel', undefined, 'Export Options');
    headerPanel.add('statictext', undefined, 'Choose what to export from analysis results:');
    
    // Content selection
    var contentPanel = exportDialog.add('panel', undefined, 'Content to Export');
    var contentGroup = contentPanel.add('group');
    contentGroup.orientation = 'column';
    contentGroup.alignChildren = 'left';
    
    var jsonAnalysisCheck = contentGroup.add('checkbox', undefined, 'JSON Structure Analysis');
    var comparisonCheck = contentGroup.add('checkbox', undefined, 'Before/After Comparison');
    var summaryCheck = contentGroup.add('checkbox', undefined, 'Executive Summary');
    
    // Enable checkboxes based on available data
    if (ADVANCED_UI_STATE.jsonAnalysisResults) {
        jsonAnalysisCheck.value = true;
    } else {
        jsonAnalysisCheck.enabled = false;
    }
    
    if (ADVANCED_UI_STATE.comparisonResults) {
        comparisonCheck.value = true;
    } else {
        comparisonCheck.enabled = false;
    }
    
    summaryCheck.value = true;
    
    // Format selection
    var formatPanel = exportDialog.add('panel', undefined, 'Export Format');
    var formatGroup = formatPanel.add('group');
    formatGroup.orientation = 'column';
    formatGroup.alignChildren = 'left';
    
    var textRadio = formatGroup.add('radiobutton', undefined, 'Text (.txt) - Human-readable report');
    var htmlRadio = formatGroup.add('radiobutton', undefined, 'HTML (.html) - Formatted web page');
    
    textRadio.value = true;
    
    // Buttons
    var buttonGroup = exportDialog.add('group');
    buttonGroup.alignment = 'center';
    
    var exportBtn = buttonGroup.add('button', undefined, 'Export');
    var cancelBtn = buttonGroup.add('button', undefined, 'Cancel');
    
    exportBtn.onClick = function() {
        var options = {
            includeAnalysis: jsonAnalysisCheck.value,
            includeComparison: comparisonCheck.value,
            includeSummary: summaryCheck.value,
            format: htmlRadio.value ? 'html' : 'text'
        };
        
        exportDialog.close();
        performAdvancedExport(options);
    };
    
    cancelBtn.onClick = function() {
        exportDialog.close();
        updateAdvancedStatus('Export cancelled');
    };
    
    exportDialog.show();
}

/**
 * Perform advanced export
 * @param {Object} options - Export options
 */
function performAdvancedExport(options) {
    try {
        updateAdvancedStatus('Generating advanced export...');
        
        var builder = createStringBuilder();
        
        // Header
        if (options.format === 'html') {
            builder.appendLine('<!DOCTYPE html>');
            builder.appendLine('<html><head><title>DOM Analysis Report</title></head><body>');
            builder.appendLine('<h1>InDesign DOM Analysis Report</h1>');
        } else {
            builder.appendLine('INDESIGN DOM ANALYSIS REPORT');
            builder.appendLine('============================');
        }
        
        builder.appendLine('Generated: ' + getCurrentTimestamp());
        builder.appendLine('');
        
        // Summary
        if (options.includeSummary) {
            builder.appendLine(generateExecutiveSummary(options.format));
        }
        
        // Analysis results
        if (options.includeAnalysis && ADVANCED_UI_STATE.jsonAnalysisResults) {
            builder.appendLine(formatAnalysisForExport(ADVANCED_UI_STATE.jsonAnalysisResults, options.format));
        }
        
        // Comparison results
        if (options.includeComparison && ADVANCED_UI_STATE.comparisonResults) {
            builder.appendLine(formatComparisonForExport(ADVANCED_UI_STATE.comparisonResults, options.format));
        }
        
        // Footer
        if (options.format === 'html') {
            builder.appendLine('</body></html>');
        }
        
        // Write file
        var extension = options.format === 'html' ? '.html' : '.txt';
        var fileName = 'DOM_Analysis_Report_' + new Date().getTime() + extension;
        var filePath = Folder.desktop.absoluteURI + '/' + fileName;
        
        var writeResult = writeToFile(filePath, builder.toString());
        
        if (writeResult.success) {
            updateAdvancedStatus('Export successful: ' + writeResult.filePath);
            alert('Analysis report exported successfully!\n\nFile saved to:\n' + writeResult.filePath);
        } else {
            updateAdvancedStatus('Export failed: ' + writeResult.error);
            alert('Export failed:\n\n' + writeResult.error);
        }
        
    } catch (exc) {
        updateAdvancedStatus('Export error: ' + exc.message);
        alert('Export error:\n\n' + exc.message);
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate executive summary
 * @param {String} format - Output format
 * @returns {String} - Formatted summary
 */
function generateExecutiveSummary(format) {
    var builder = createStringBuilder();
    
    if (format === 'html') {
        builder.appendLine('<h2>Executive Summary</h2>');
    } else {
        builder.appendLine('EXECUTIVE SUMMARY');
        builder.appendLine('=================');
    }
    
    if (ADVANCED_UI_STATE.jsonAnalysisResults) {
        var stats = ADVANCED_UI_STATE.jsonAnalysisResults.statistics;
        builder.appendLine('Document Structure Analysis:');
        builder.appendLine('- Total DOM nodes analyzed: ' + stats.totalNodes);
        builder.appendLine('- Collections discovered: ' + stats.collections);
        builder.appendLine('- Properties enumerated: ' + stats.properties);
        builder.appendLine('');
    }
    
    if (ADVANCED_UI_STATE.comparisonResults) {
        var compStats = ADVANCED_UI_STATE.comparisonResults.statistics;
        builder.appendLine('Document Change Analysis:');
        builder.appendLine('- Total changes detected: ' + compStats.totalChanges);
        builder.appendLine('- Properties added: ' + compStats.added);
        builder.appendLine('- Properties removed: ' + compStats.removed);
        builder.appendLine('- Properties modified: ' + compStats.modified);
        builder.appendLine('');
    }
    
    return builder.toString();
}

/**
 * Format analysis results for export
 * @param {Object} analysisResults - Analysis results object
 * @param {String} format - Output format
 * @returns {String} - Formatted analysis
 */
function formatAnalysisForExport(analysisResults, format) {
    var builder = createStringBuilder();
    
    if (format === 'html') {
        builder.appendLine('<h2>JSON Structure Analysis</h2>');
        builder.appendLine('<pre>');
    } else {
        builder.appendLine('JSON STRUCTURE ANALYSIS');
        builder.appendLine('=======================');
    }
    
    builder.append(analysisResults.formattedHierarchy);
    
    if (format === 'html') {
        builder.appendLine('</pre>');
    }
    
    return builder.toString();
}

/**
 * Format comparison results for export
 * @param {Object} comparisonResults - Comparison results object
 * @param {String} format - Output format
 * @returns {String} - Formatted comparison
 */
function formatComparisonForExport(comparisonResults, format) {
    var builder = createStringBuilder();
    
    if (format === 'html') {
        builder.appendLine('<h2>Before/After Comparison</h2>');
        builder.appendLine('<pre>');
    } else {
        builder.appendLine('BEFORE/AFTER COMPARISON');
        builder.appendLine('=======================');
    }
    
    builder.append(comparisonResults.formattedDiff);
    
    if (format === 'html') {
        builder.appendLine('</pre>');
    }
    
    return builder.toString();
}

/**
 * Reset advanced UI state
 */
function resetAdvancedUI() {
    try {
        var confirmed = confirm('Reset all analysis data?\n\nThis will clear loaded DOM structures and analysis results.');
        if (!confirmed) return;
        
        // Clear state
        ADVANCED_UI_STATE.currentDOMStructure = null;
        ADVANCED_UI_STATE.previousDOMStructure = null;
        ADVANCED_UI_STATE.jsonAnalysisResults = null;
        ADVANCED_UI_STATE.comparisonResults = null;
        
        // Reset displays
        if (ADVANCED_UI_STATE.displays.analysisView) {
            ADVANCED_UI_STATE.displays.analysisView.text = 'Load JSON export to analyze DOM structure...';
        }
        if (ADVANCED_UI_STATE.displays.comparisonView) {
            ADVANCED_UI_STATE.displays.comparisonView.text = 'Load two JSON exports to compare document changes...';
        }
        
        // Reset button states
        if (ADVANCED_UI_STATE.controls.analyzeButton) {
            ADVANCED_UI_STATE.controls.analyzeButton.enabled = false;
        }
        if (ADVANCED_UI_STATE.controls.compareButton) {
            ADVANCED_UI_STATE.controls.compareButton.enabled = false;
        }
        if (ADVANCED_UI_STATE.controls.exportButton) {
            ADVANCED_UI_STATE.controls.exportButton.enabled = false;
        }
        
        updateAdvancedDocumentInfo();
        updateAdvancedStatus('Reset complete - ready for new analysis');
        
    } catch (exc) {
        updateAdvancedStatus('Reset error: ' + exc.message);
    }
}

/**
 * Update advanced status display
 * @param {String} message - Status message
 */
function updateAdvancedStatus(message) {
    if (ADVANCED_UI_STATE.displays.status) {
        ADVANCED_UI_STATE.displays.status.text = message;
    }
    $.writeln('ADVANCED STATUS: ' + message);
}

/**
 * Update advanced document information display
 */
function updateAdvancedDocumentInfo() {
    try {
        var currentInfo = 'Current: ';
        var previousInfo = 'Previous: ';
        var analysisInfo = 'Analysis: ';
        
        if (ADVANCED_UI_STATE.currentDOMStructure) {
            var metadata = ADVANCED_UI_STATE.currentDOMStructure.metadata;
            currentInfo += metadata.documentName + ' (' + metadata.timestamp + ')';
        } else {
            currentInfo += 'No DOM structure loaded';
        }
        
        if (ADVANCED_UI_STATE.previousDOMStructure) {
            var prevMetadata = ADVANCED_UI_STATE.previousDOMStructure.metadata;
            previousInfo += prevMetadata.documentName + ' (' + prevMetadata.timestamp + ')';
        } else {
            previousInfo += 'No previous snapshot';
        }
        
        var analysisCount = 0;
        if (ADVANCED_UI_STATE.jsonAnalysisResults) analysisCount++;
        if (ADVANCED_UI_STATE.comparisonResults) analysisCount++;
        
        analysisInfo += analysisCount + ' analysis result(s) available';
        
        if (ADVANCED_UI_STATE.displays.documentInfo) {
            ADVANCED_UI_STATE.displays.documentInfo.current.text = currentInfo;
            ADVANCED_UI_STATE.displays.documentInfo.previous.text = previousInfo;
            ADVANCED_UI_STATE.displays.documentInfo.analysis.text = analysisInfo;
        }
        
    } catch (exc) {
        $.writeln('Error updating advanced document info: ' + exc.message);
    }
}

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

/**
 * Show advanced DOM analysis interface
 */
function showAdvancedDOMAnalysis() {
    try {
        // Check if required modules are available
        var missingModules = [];
        
        if (typeof analyzeJSONStructure !== 'function') {
            missingModules.push('7.0_json-analyzer.jsx');
        }
        if (typeof compareDOMStructures !== 'function') {
            missingModules.push('8.0_dom-comparator.jsx');
        }
        
        if (missingModules.length > 0) {
            var message = 'Required modules not loaded:\n\n' + missingModules.join('\n') + 
                         '\n\nAdvanced features will be limited.';
            alert(message);
        }
        
        var dialog = createAdvancedUI();
        if (dialog) {
            dialog.show();
        } else {
            alert('Failed to create advanced analysis interface.');
        }
    } catch (exc) {
        $.writeln('ERROR: Failed to show advanced DOM analysis: ' + exc.message);
        alert('Failed to show advanced DOM analysis:\n\n' + exc.message);
    }
}

// ============================================================================
// MODULE INITIALIZATION
// ============================================================================

/**
 * Initialize advanced UI module
 * @returns {Boolean} - true if initialization successful
 */
function initializeAdvancedUI() {
    try {
        // Check core dependencies
        if (typeof createStringBuilder !== 'function') {
            $.writeln('ERROR: Safe foundation module (1.0) not loaded');
            return false;
        }
        
        // Check advanced dependencies (warn but don't fail)
        var warnings = [];
        if (typeof analyzeJSONStructure !== 'function') {
            warnings.push('JSON analyzer module (7.0) not available');
        }
        if (typeof compareDOMStructures !== 'function') {
            warnings.push('DOM comparator module (8.0) not available');
        }
        
        if (warnings.length > 0) {
            $.writeln('WARNING: Some advanced features unavailable:');
            for (var i = 0; i < warnings.length; i++) {
                $.writeln('  - ' + warnings[i]);
            }
        }
        
        $.writeln('10.0_advanced-ui.jsx: Initialized successfully');
        $.writeln('Dependencies: 1.0-9.2 (all modules), specifically 7.0_json-analyzer, 8.0_dom-comparator');
        $.writeln('Use showAdvancedDOMAnalysis() to open the interface');
        return true;
        
    } catch (exc) {
        $.writeln('ERROR: Advanced UI initialization failed: ' + exc.message);
        return false;
    }
}

// Auto-initialize when module loads
initializeAdvancedUI();