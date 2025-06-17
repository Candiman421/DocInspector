// =============================================================================
// 5.2_dom-visualizer.jsx - INTERACTIVE DOM VISUALIZATION INTERFACE
// InDesign DOM Discovery Builder v3.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: Interactive UI for DOM discovery with configurable settings
// DEPENDENCIES: ["1.1_bootstrap-foundation.jsx", "1.2_safety-utilities.jsx", 
//               "2.1_dom-enumerator.jsx", "2.2_collection-sampler.jsx", 
//               "3.1_property-sampler.jsx", "3.2_dom-exporter.jsx", 
//               "4.1_json-analyzer.jsx", "4.2_dom-comparator.jsx", "5.1_deep-mapper.jsx"]
// SIZE: ~2000 lines - COMPLETE IMPLEMENTATION
// =============================================================================

// =============================================================================
// DEPENDENCY VALIDATION
// =============================================================================

var DOM_VISUALIZER_DEPENDENCIES = [
    '1.1_bootstrap-foundation', '1.2_safety-utilities', '2.1_dom-enumerator',
    '2.2_collection-sampler', '3.1_property-sampler', '3.2_dom-exporter',
    '4.1_json-analyzer', '4.2_dom-comparator', '5.1_deep-mapper'
];

var dependencyCheck = validateDependencies(DOM_VISUALIZER_DEPENDENCIES);
if (!dependencyCheck.success) {
    // Continue with reduced functionality - UI should still be usable
    var missingModules = getMissingDependencies(DOM_VISUALIZER_DEPENDENCIES);
    updateStatus('Warning: Some modules unavailable: ' + arrayJoin(missingModules, ', '));
}

// =============================================================================
// GLOBAL VARIABLES
// =============================================================================

var g_domViz_visualizerWindow = null;
var g_domViz_documentInfo = null;
var g_domViz_domDisplay = null;
var g_domViz_statusText = null;
var g_domViz_currentDOMStructure = null;
var g_domViz_userConfiguration = null;
var g_domViz_originalConfigs = null;
var g_domViz_exportHistory = [];
var g_domViz_currentSession = null;

// =============================================================================
// CONFIGURATION OBJECTS
// =============================================================================

var DEFAULT_VISUALIZER_CONFIG = {
    enumeration: {
        maxDepth: 4,
        timeoutMs: 15000,
        skipDangerous: true,
        maxProperties: 5000,
        enableObjectTracking: true,
        enableDuplicateDetection: true,
        enableCircularReferenceDetection: true,
        includeAlternativeAccessPaths: true,
        trackPropertySafety: true,
        enableProgressReporting: false,
        generateStatistics: true
    },
    sampling: {
        safetyFilter: 'safe',
        maxSamples: 10,
        timeoutMs: 1000,
        includeCollectionSamples: false,
        maxStringLength: 500,
        maxObjectDepth: 1,
        trackObjectReferences: true,
        includeValueMetadata: true,
        generateValueFingerprints: true,
        enableProgressReporting: false,
        enableDetailedLogging: false,
        skipNullValues: false,
        skipUndefinedValues: false,
        maxCollectionDepth: 2,
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
        enableProgressReporting: false,
        enableDetailedLogging: false
    },
    exportSettings: {
        includeExtractedValues: true,
        formatOutput: true,
        includeMetadata: true,
        includeObjectReferences: true,
        enableTimestamps: true,
        enableCompression: false
    },
    ui: {
        autoRefresh: false,
        showAdvancedOptions: false,
        enablePreview: true,
        maxDisplayItems: 1000,
        enableSearch: true,
        enableFiltering: true
    }
};

// =============================================================================
// MAIN UI FUNCTIONS
// =============================================================================

/**
 * Show DOM visualizer interface
 * @returns {Boolean} True if shown successfully
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

        // Create main window
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
 * Create main visualizer window
 * @returns {Window} Created window or null
 */
function createVisualizerWindow() {
    try {
        var windowResource = "dialog { " +
            "text: 'InDesign DOM Visualizer v3.1', " +
            "orientation: 'column', " +
            "alignChildren: 'fill', " +
            "preferredSize: { width: 900, height: 700 }, " +
            "margins: 15, " +
            
            "header: Group { " +
                "orientation: 'row', " +
                "alignChildren: 'center', " +
                "document: Group { " +
                    "orientation: 'column', " +
                    "alignChildren: 'left', " +
                    "info: StaticText { text: 'Document: Loading...', characters: 40 }, " +
                    "status: StaticText { text: 'Status: Ready', characters: 40 } " +
                "}, " +
                "controls: Group { " +
                    "orientation: 'column', " +
                    "alignChildren: 'right', " +
                    "discover: Button { text: 'Discover DOM', preferredSize: { width: 120, height: 25 } }, " +
                    "config: Button { text: 'Configuration', preferredSize: { width: 120, height: 25 } } " +
                "} " +
            "}, " +
            
            "separator1: Panel { height: 2 }, " +
            
            "mainTabs: TabbedPanel { " +
                "alignChildren: 'fill', " +
                "preferredSize: { height: 500 }, " +
                
                "discoveryTab: Tab { " +
                    "text: 'DOM Discovery', " +
                    "orientation: 'column', " +
                    "alignChildren: 'fill', " +
                    
                    "discoveryControls: Group { " +
                        "orientation: 'row', " +
                        "alignChildren: 'center', " +
                        "spacing: 10, " +
                        "phase1: Button { text: 'Enumerate', preferredSize: { width: 100, height: 25 } }, " +
                        "phase2: Button { text: 'Sample Values', preferredSize: { width: 100, height: 25 } }, " +
                        "phase3: Button { text: 'Sample Collections', preferredSize: { width: 120, height: 25 } }, " +
                        "clear: Button { text: 'Clear', preferredSize: { width: 80, height: 25 } } " +
                    "}, " +
                    
                    "discoveryDisplay: Group { " +
                        "orientation: 'column', " +
                        "alignChildren: 'fill', " +
                        "margins: 5, " +
                        "text: EditText { " +
                            "alignment: 'fill', " +
                            "preferredSize: { height: 400 }, " +
                            "properties: { multiline: true, scrolling: true } " +
                        "} " +
                    "} " +
                "}, " +
                
                "exportTab: Tab { " +
                    "text: 'Export & Analysis', " +
                    "orientation: 'column', " +
                    "alignChildren: 'fill', " +
                    
                    "exportControls: Group { " +
                        "orientation: 'row', " +
                        "alignChildren: 'center', " +
                        "spacing: 10, " +
                        "json: Button { text: 'Export JSON', preferredSize: { width: 100, height: 25 } }, " +
                        "text: Button { text: 'Export Text', preferredSize: { width: 100, height: 25 } }, " +
                        "csv: Button { text: 'Export CSV', preferredSize: { width: 100, height: 25 } }, " +
                        "analyze: Button { text: 'Analyze JSON', preferredSize: { width: 100, height: 25 } } " +
                    "}, " +
                    
                    "exportDisplay: Group { " +
                        "orientation: 'column', " +
                        "alignChildren: 'fill', " +
                        "margins: 5, " +
                        "text: EditText { " +
                            "alignment: 'fill', " +
                            "preferredSize: { height: 400 }, " +
                            "properties: { multiline: true, scrolling: true } " +
                        "} " +
                    "} " +
                "}, " +
                
                "comparisonTab: Tab { " +
                    "text: 'Comparison', " +
                    "orientation: 'column', " +
                    "alignChildren: 'fill', " +
                    
                    "comparisonControls: Group { " +
                        "orientation: 'row', " +
                        "alignChildren: 'center', " +
                        "spacing: 10, " +
                        "loadBefore: Button { text: 'Load Before', preferredSize: { width: 100, height: 25 } }, " +
                        "loadAfter: Button { text: 'Load After', preferredSize: { width: 100, height: 25 } }, " +
                        "compare: Button { text: 'Compare', preferredSize: { width: 100, height: 25 } }, " +
                        "snapshot: Button { text: 'Take Snapshot', preferredSize: { width: 120, height: 25 } } " +
                    "}, " +
                    
                    "comparisonDisplay: Group { " +
                        "orientation: 'column', " +
                        "alignChildren: 'fill', " +
                        "margins: 5, " +
                        "text: EditText { " +
                            "alignment: 'fill', " +
                            "preferredSize: { height: 400 }, " +
                            "properties: { multiline: true, scrolling: true } " +
                        "} " +
                    "} " +
                "}, " +
                
                "deepMappingTab: Tab { " +
                    "text: 'Deep Mapping', " +
                    "orientation: 'column', " +
                    "alignChildren: 'fill', " +
                    
                    "mappingControls: Group { " +
                        "orientation: 'row', " +
                        "alignChildren: 'center', " +
                        "spacing: 10, " +
                        "createMap: Button { text: 'Create Map', preferredSize: { width: 100, height: 25 } }, " +
                        "atlas: Button { text: 'Object Atlas', preferredSize: { width: 100, height: 25 } }, " +
                        "optimize: Button { text: 'Optimize', preferredSize: { width: 100, height: 25 } } " +
                    "}, " +
                    
                    "mappingDisplay: Group { " +
                        "orientation: 'column', " +
                        "alignChildren: 'fill', " +
                        "margins: 5, " +
                        "text: EditText { " +
                            "alignment: 'fill', " +
                            "preferredSize: { height: 400 }, " +
                            "properties: { multiline: true, scrolling: true } " +
                        "} " +
                    "} " +
                "} " +
            "}, " +
            
            "separator2: Panel { height: 2 }, " +
            
            "footer: Group { " +
                "orientation: 'row', " +
                "alignChildren: 'center', " +
                "status: StaticText { text: 'Ready', characters: 60, alignment: 'left' }, " +
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
        g_domViz_documentInfo = window.header.document.info;
        g_domViz_statusText = window.footer.status;
        g_domViz_domDisplay = window.mainTabs.discoveryTab.discoveryDisplay.text;

        return window;

    } catch (exc) {
        alert('Window creation error: ' + exc.message);
        return null;
    }
}

/**
 * Initialize UI component event handlers
 */
function initializeVisualizerComponents() {
    try {
        if (!g_domViz_visualizerWindow) return;

        var window = g_domViz_visualizerWindow;

        // Header controls
        window.header.controls.discover.onClick = performFullDiscovery;
        window.header.controls.config.onClick = showConfigurationDialog;

        // Discovery tab
        window.mainTabs.discoveryTab.discoveryControls.phase1.onClick = performPhase1Enumeration;
        window.mainTabs.discoveryTab.discoveryControls.phase2.onClick = performPhase2ValueSampling;
        window.mainTabs.discoveryTab.discoveryControls.phase3.onClick = performPhase3CollectionSampling;
        window.mainTabs.discoveryTab.discoveryControls.clear.onClick = clearDiscoveryDisplay;

        // Export tab
        window.mainTabs.exportTab.exportControls.json.onClick = exportAsJSON;
        window.mainTabs.exportTab.exportControls.text.onClick = exportAsText;
        window.mainTabs.exportTab.exportControls.csv.onClick = exportAsCSV;
        window.mainTabs.exportTab.exportControls.analyze.onClick = analyzeCurrentJSON;

        // Comparison tab
        window.mainTabs.comparisonTab.comparisonControls.loadBefore.onClick = loadBeforeJSON;
        window.mainTabs.comparisonTab.comparisonControls.loadAfter.onClick = loadAfterJSON;
        window.mainTabs.comparisonTab.comparisonControls.compare.onClick = performComparison;
        window.mainTabs.comparisonTab.comparisonControls.snapshot.onClick = takeSnapshot;

        // Deep mapping tab
        window.mainTabs.deepMappingTab.mappingControls.createMap.onClick = performDeepMapping;
        window.mainTabs.deepMappingTab.mappingControls.atlas.onClick = generateObjectAtlas;
        window.mainTabs.deepMappingTab.mappingControls.optimize.onClick = optimizePerformance;

        // Footer controls
        window.footer.buttons.reset.onClick = resetVisualizer;
        window.footer.buttons.help.onClick = showHelp;
        window.footer.buttons.close.onClick = closeVisualizer;

    } catch (exc) {
        updateStatus('Component initialization error: ' + exc.message);
    }
}

// =============================================================================
// DISCOVERY OPERATIONS
// =============================================================================

/**
 * Perform complete DOM discovery in all phases
 */
function performFullDiscovery() {
    try {
        updateStatus('Starting complete DOM discovery...');
        
        // Phase 1: Enumeration
        var phase1Success = performPhase1Enumeration();
        if (!phase1Success) {
            updateStatus('Phase 1 enumeration failed');
            return;
        }

        // Phase 2: Value sampling
        var phase2Success = performPhase2ValueSampling();
        if (!phase2Success) {
            updateStatus('Phase 2 value sampling failed');
            return;
        }

        // Phase 3: Collection sampling
        var phase3Success = performPhase3CollectionSampling();
        if (!phase3Success) {
            updateStatus('Phase 3 collection sampling failed');
            return;
        }

        updateStatus('Complete DOM discovery finished successfully');
        displayCurrentStructure();

    } catch (exc) {
        updateStatus('Full discovery error: ' + exc.message);
    }
}

/**
 * Phase 1: DOM structure enumeration
 */
function performPhase1Enumeration() {
    try {
        updateStatus('Phase 1: Enumerating DOM structure...');

        if (!functionExists('enumerateDocumentDOM')) {
            updateStatus('Error: DOM enumerator module not available');
            return false;
        }

        var envValidation = validateInDesignEnvironment();
        if (!envValidation.valid) {
            updateStatus('Environment validation failed: ' + envValidation.error);
            return false;
        }

        // Perform enumeration
        var config = g_domViz_userConfiguration.enumeration;
        g_domViz_currentDOMStructure = enumerateDocumentDOM(envValidation.document, config);

        if (!g_domViz_currentDOMStructure || g_domViz_currentDOMStructure.error) {
            var errorMsg = g_domViz_currentDOMStructure ? g_domViz_currentDOMStructure.error : 'Unknown error';
            updateStatus('Enumeration failed: ' + errorMsg);
            return false;
        }

        updateStatus('Phase 1 complete: ' + (g_domViz_currentDOMStructure.nodeCount || 0) + ' nodes discovered');
        return true;

    } catch (exc) {
        updateStatus('Phase 1 error: ' + exc.message);
        return false;
    }
}

/**
 * Phase 2: Property value sampling
 */
function performPhase2ValueSampling() {
    try {
        updateStatus('Phase 2: Sampling property values...');

        if (!g_domViz_currentDOMStructure) {
            updateStatus('Error: No DOM structure available. Run Phase 1 first.');
            return false;
        }

        if (!functionExists('sampleDOMValues')) {
            updateStatus('Error: Property sampler module not available');
            return false;
        }

        var envValidation = validateInDesignEnvironment();
        if (!envValidation.valid) {
            updateStatus('Environment validation failed: ' + envValidation.error);
            return false;
        }

        // Perform value sampling
        var config = g_domViz_userConfiguration.sampling;
        g_domViz_currentDOMStructure = sampleDOMValues(
            g_domViz_currentDOMStructure, 
            envValidation.document, 
            config
        );

        if (!g_domViz_currentDOMStructure || g_domViz_currentDOMStructure.error) {
            var errorMsg = g_domViz_currentDOMStructure ? g_domViz_currentDOMStructure.error : 'Unknown error';
            updateStatus('Value sampling failed: ' + errorMsg);
            return false;
        }

        updateStatus('Phase 2 complete: Property values sampled');
        return true;

    } catch (exc) {
        updateStatus('Phase 2 error: ' + exc.message);
        return false;
    }
}

/**
 * Phase 3: Collection content sampling
 */
function performPhase3CollectionSampling() {
    try {
        updateStatus('Phase 3: Sampling collection contents...');

        if (!g_domViz_currentDOMStructure) {
            updateStatus('Error: No DOM structure available. Run Phase 1 first.');
            return false;
        }

        if (!functionExists('sampleCollectionContents')) {
            updateStatus('Error: Collection sampler module not available');
            return false;
        }

        var envValidation = validateInDesignEnvironment();
        if (!envValidation.valid) {
            updateStatus('Environment validation failed: ' + envValidation.error);
            return false;
        }

        // Perform collection sampling
        var config = g_domViz_userConfiguration.collectionSampling;
        g_domViz_currentDOMStructure = sampleCollectionContents(
            g_domViz_currentDOMStructure, 
            envValidation.document, 
            config
        );

        if (!g_domViz_currentDOMStructure || g_domViz_currentDOMStructure.error) {
            var errorMsg = g_domViz_currentDOMStructure ? g_domViz_currentDOMStructure.error : 'Unknown error';
            updateStatus('Collection sampling failed: ' + errorMsg);
            return false;
        }

        updateStatus('Phase 3 complete: Collection contents sampled');
        return true;

    } catch (exc) {
        updateStatus('Phase 3 error: ' + exc.message);
        return false;
    }
}

/**
 * Display current DOM structure in discovery tab
 */
function displayCurrentStructure() {
    try {
        if (!g_domViz_currentDOMStructure || !g_domViz_domDisplay) {
            return;
        }

        var displayText = generateStructureDisplayText(g_domViz_currentDOMStructure);
        g_domViz_domDisplay.text = displayText;

    } catch (exc) {
        updateStatus('Display error: ' + exc.message);
    }
}

/**
 * Generate formatted text display of DOM structure
 */
function generateStructureDisplayText(domStructure) {
    try {
        var builder = createStringBuilder();

        builder.appendLine('DOM STRUCTURE ANALYSIS');
        builder.appendLine('======================');
        builder.appendLine('');

        // Metadata
        if (domStructure.metadata) {
            builder.appendLine('Document: ' + (domStructure.metadata.documentName || 'Unknown'));
            builder.appendLine('Version: ' + (domStructure.metadata.version || 'Unknown'));
            builder.appendLine('Timestamp: ' + (domStructure.metadata.timestamp || 'Unknown'));
            builder.appendLine('');
        }

        // Statistics
        if (domStructure.statistics) {
            builder.appendLine('STATISTICS:');
            builder.appendLine('Nodes: ' + (domStructure.statistics.nodeCount || 0));
            builder.appendLine('Properties: ' + (domStructure.statistics.propertyCount || 0));
            builder.appendLine('Collections: ' + (domStructure.statistics.collectionCount || 0));
            builder.appendLine('Methods: ' + (domStructure.statistics.methodCount || 0));
            builder.appendLine('');
        }

        // Structure preview
        if (domStructure.structure && domStructure.structure.length > 0) {
            builder.appendLine('STRUCTURE PREVIEW:');
            builder.appendLine('------------------');
            
            var previewCount = Math.min(10, domStructure.structure.length);
            for (var i = 0; i < previewCount; i++) {
                var node = domStructure.structure[i];
                var indent = '';
                for (var d = 0; d < (node.depth || 0); d++) {
                    indent += '  ';
                }
                builder.appendLine(indent + (node.path || node.name || 'Unknown'));
            }
            
            if (domStructure.structure.length > previewCount) {
                builder.appendLine('... (' + (domStructure.structure.length - previewCount) + ' more items)');
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
        if (g_domViz_domDisplay) {
            g_domViz_domDisplay.text = '';
        }
        g_domViz_currentDOMStructure = null;
        updateStatus('Discovery display cleared');
    } catch (exc) {
        updateStatus('Clear error: ' + exc.message);
    }
}

// =============================================================================
// EXPORT OPERATIONS
// =============================================================================

/**
 * Export DOM structure as JSON
 */
function exportAsJSON() {
    try {
        if (!g_domViz_currentDOMStructure) {
            updateStatus('No DOM structure to export. Run discovery first.');
            return;
        }

        if (!functionExists('exportDOMStructure')) {
            updateStatus('Error: DOM exporter module not available');
            return;
        }

        updateStatus('Exporting as JSON...');

        var config = g_domViz_userConfiguration.exportSettings;
        var exportResult = exportDOMStructure(g_domViz_currentDOMStructure, 'json', config);

        if (!exportResult.success) {
            updateStatus('JSON export failed: ' + exportResult.error);
            return;
        }

        // Save to file
        var fileName = 'DOM_Export_' + getCurrentTimestamp().replace(/[:\s]/g, '-') + '.json';
        var file = File.saveDialog('Save JSON Export', fileName);

        if (file) {
            file.open('w');
            file.write(exportResult.content);
            file.close();

            updateStatus('JSON exported to: ' + file.name);
            
            // Display in export tab
            var exportDisplay = g_domViz_visualizerWindow.mainTabs.exportTab.exportDisplay.text;
            exportDisplay.text = 'JSON Export saved to: ' + file.name + '\n\nPreview:\n' + 
                                stringSubstring(exportResult.content, 0, 1000) + '...';

            // Store in history
            g_domViz_exportHistory.push({
                type: 'json',
                file: file.fsName,
                timestamp: getCurrentTimestamp()
            });
        } else {
            updateStatus('JSON export cancelled');
        }

    } catch (exc) {
        updateStatus('JSON export error: ' + exc.message);
    }
}

/**
 * Export DOM structure as text
 */
function exportAsText() {
    try {
        if (!g_domViz_currentDOMStructure) {
            updateStatus('No DOM structure to export. Run discovery first.');
            return;
        }

        if (!functionExists('exportDOMStructure')) {
            updateStatus('Error: DOM exporter module not available');
            return;
        }

        updateStatus('Exporting as text...');

        var config = g_domViz_userConfiguration.exportSettings;
        var exportResult = exportDOMStructure(g_domViz_currentDOMStructure, 'text', config);

        if (!exportResult.success) {
            updateStatus('Text export failed: ' + exportResult.error);
            return;
        }

        // Save to file
        var fileName = 'DOM_Export_' + getCurrentTimestamp().replace(/[:\s]/g, '-') + '.txt';
        var file = File.saveDialog('Save Text Export', fileName);

        if (file) {
            file.open('w');
            file.write(exportResult.content);
            file.close();

            updateStatus('Text exported to: ' + file.name);
            
            // Display in export tab
            var exportDisplay = g_domViz_visualizerWindow.mainTabs.exportTab.exportDisplay.text;
            exportDisplay.text = stringSubstring(exportResult.content, 0, 2000);

            // Store in history
            g_domViz_exportHistory.push({
                type: 'text',
                file: file.fsName,
                timestamp: getCurrentTimestamp()
            });
        } else {
            updateStatus('Text export cancelled');
        }

    } catch (exc) {
        updateStatus('Text export error: ' + exc.message);
    }
}

/**
 * Export DOM structure as CSV
 */
function exportAsCSV() {
    try {
        if (!g_domViz_currentDOMStructure) {
            updateStatus('No DOM structure to export. Run discovery first.');
            return;
        }

        if (!functionExists('exportDOMStructure')) {
            updateStatus('Error: DOM exporter module not available');
            return;
        }

        updateStatus('Exporting as CSV...');

        var config = g_domViz_userConfiguration.exportSettings;
        var exportResult = exportDOMStructure(g_domViz_currentDOMStructure, 'csv', config);

        if (!exportResult.success) {
            updateStatus('CSV export failed: ' + exportResult.error);
            return;
        }

        // Save to file
        var fileName = 'DOM_Export_' + getCurrentTimestamp().replace(/[:\s]/g, '-') + '.csv';
        var file = File.saveDialog('Save CSV Export', fileName);

        if (file) {
            file.open('w');
            file.write(exportResult.content);
            file.close();

            updateStatus('CSV exported to: ' + file.name);
            
            // Display in export tab
            var exportDisplay = g_domViz_visualizerWindow.mainTabs.exportTab.exportDisplay.text;
            exportDisplay.text = 'CSV Export saved to: ' + file.name + '\n\nPreview:\n' + 
                                stringSubstring(exportResult.content, 0, 1000) + '...';

            // Store in history
            g_domViz_exportHistory.push({
                type: 'csv',
                file: file.fsName,
                timestamp: getCurrentTimestamp()
            });
        } else {
            updateStatus('CSV export cancelled');
        }

    } catch (exc) {
        updateStatus('CSV export error: ' + exc.message);
    }
}

/**
 * Analyze current JSON structure
 */
function analyzeCurrentJSON() {
    try {
        if (!g_domViz_currentDOMStructure) {
            updateStatus('No DOM structure to analyze. Run discovery first.');
            return;
        }

        if (!functionExists('analyzeLoadedJSON')) {
            updateStatus('Error: JSON analyzer module not available');
            return;
        }

        updateStatus('Analyzing DOM structure...');

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

        var analysisResult = analyzeLoadedJSON(g_domViz_currentDOMStructure, analysisConfig);

        if (!analysisResult.success) {
            updateStatus('Analysis failed: ' + analysisResult.error);
            return;
        }

        // Display results in export tab
        var exportDisplay = g_domViz_visualizerWindow.mainTabs.exportTab.exportDisplay.text;
        exportDisplay.text = generateAnalysisDisplay(analysisResult.analysis);

        updateStatus('Analysis complete');

    } catch (exc) {
        updateStatus('Analysis error: ' + exc.message);
    }
}

/**
 * Generate analysis display text
 */
function generateAnalysisDisplay(analysis) {
    try {
        var builder = createStringBuilder();

        builder.appendLine('JSON STRUCTURE ANALYSIS');
        builder.appendLine('=======================');
        builder.appendLine('');

        if (analysis.summary) {
            builder.appendLine('SUMMARY:');
            builder.appendLine('Nodes: ' + (analysis.summary.nodeCount || 0));
            builder.appendLine('Properties: ' + (analysis.summary.propertyCount || 0));
            builder.appendLine('Collections: ' + (analysis.summary.collectionCount || 0));
            builder.appendLine('Max Depth: ' + (analysis.summary.maxDepth || 0));
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

        if (analysis.developerGuide) {
            builder.appendLine('DEVELOPER GUIDE:');
            builder.appendLine(analysis.developerGuide);
        }

        return builder.toString();

    } catch (exc) {
        return 'Error generating analysis display: ' + exc.message;
    }
}

// =============================================================================
// COMPARISON OPERATIONS
// =============================================================================

var g_domViz_beforeData = null;
var g_domViz_afterData = null;

/**
 * Load before JSON file for comparison
 */
function loadBeforeJSON() {
    try {
        updateStatus('Select BEFORE JSON file...');

        var file = File.openDialog('Select Before JSON Export', '*.json');
        if (!file) {
            updateStatus('Before file selection cancelled');
            return;
        }

        if (!functionExists('readAndParseJSONFile')) {
            updateStatus('Error: JSON parser not available');
            return;
        }

        var parseResult = readAndParseJSONFile(file.fsName);
        if (!parseResult.success) {
            updateStatus('Before file parsing failed: ' + parseResult.error);
            return;
        }

        g_domViz_beforeData = parseResult.data;
        updateStatus('Before file loaded: ' + file.name);

    } catch (exc) {
        updateStatus('Before file loading error: ' + exc.message);
    }
}

/**
 * Load after JSON file for comparison
 */
function loadAfterJSON() {
    try {
        updateStatus('Select AFTER JSON file...');

        var file = File.openDialog('Select After JSON Export', '*.json');
        if (!file) {
            updateStatus('After file selection cancelled');
            return;
        }

        if (!functionExists('readAndParseJSONFile')) {
            updateStatus('Error: JSON parser not available');
            return;
        }

        var parseResult = readAndParseJSONFile(file.fsName);
        if (!parseResult.success) {
            updateStatus('After file parsing failed: ' + parseResult.error);
            return;
        }

        g_domViz_afterData = parseResult.data;
        updateStatus('After file loaded: ' + file.name);

    } catch (exc) {
        updateStatus('After file loading error: ' + exc.message);
    }
}

/**
 * Perform comparison between before and after data
 */
function performComparison() {
    try {
        if (!g_domViz_beforeData || !g_domViz_afterData) {
            updateStatus('Both before and after files must be loaded');
            return;
        }

        if (!functionExists('compareDOMExports')) {
            updateStatus('Error: DOM comparator module not available');
            return;
        }

        updateStatus('Comparing documents...');

        var comparisonConfig = {
            enableStructuralComparison: true,
            enablePropertyComparison: true,
            enableCollectionComparison: true,
            enableValueComparison: true,
            compareExtractedValues: true,
            generateDetailedReport: true
        };

        var comparisonResult = compareDOMExports(g_domViz_beforeData, g_domViz_afterData, comparisonConfig);

        if (!comparisonResult.success) {
            updateStatus('Comparison failed: ' + comparisonResult.error);
            return;
        }

        // Display results
        var comparisonDisplay = g_domViz_visualizerWindow.mainTabs.comparisonTab.comparisonDisplay.text;
        comparisonDisplay.text = generateComparisonDisplay(comparisonResult.comparison);

        updateStatus('Comparison complete');

    } catch (exc) {
        updateStatus('Comparison error: ' + exc.message);
    }
}

/**
 * Generate comparison display text
 */
function generateComparisonDisplay(comparison) {
    try {
        var builder = createStringBuilder();

        builder.appendLine('DOM COMPARISON RESULTS');
        builder.appendLine('======================');
        builder.appendLine('');

        if (comparison.summary) {
            builder.appendLine('SUMMARY:');
            builder.appendLine('Changes Found: ' + (comparison.summary.totalChanges || 0));
            builder.appendLine('Added: ' + (comparison.summary.addedCount || 0));
            builder.appendLine('Removed: ' + (comparison.summary.removedCount || 0));
            builder.appendLine('Modified: ' + (comparison.summary.modifiedCount || 0));
            builder.appendLine('');
        }

        if (comparison.structuralChanges) {
            builder.appendLine('STRUCTURAL CHANGES:');
            builder.appendLine(comparison.structuralChanges);
            builder.appendLine('');
        }

        if (comparison.propertyChanges) {
            builder.appendLine('PROPERTY CHANGES:');
            builder.appendLine(comparison.propertyChanges);
            builder.appendLine('');
        }

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
 * Take snapshot of current document state
 */
function takeSnapshot() {
    try {
        updateStatus('Taking document snapshot...');

        // Perform full discovery for snapshot
        var success = performFullDiscovery();
        if (!success) {
            updateStatus('Snapshot failed - discovery incomplete');
            return;
        }

        // Export as JSON for comparison
        exportAsJSON();

        updateStatus('Snapshot taken and exported');

    } catch (exc) {
        updateStatus('Snapshot error: ' + exc.message);
    }
}

// =============================================================================
// DEEP MAPPING OPERATIONS
// =============================================================================

/**
 * Perform deep object mapping
 */
function performDeepMapping() {
    try {
        if (!g_domViz_currentDOMStructure) {
            updateStatus('No DOM structure available. Run discovery first.');
            return;
        }

        if (!functionExists('performDeepDOMMapping')) {
            updateStatus('Error: Deep mapper module not available');
            return;
        }

        updateStatus('Performing deep object mapping...');

        var mappingConfig = {
            maxDepth: 10,
            enableCircularReferenceMapping: true,
            enableRelationshipAnalysis: true,
            enablePerformanceMapping: true,
            generateObjectAtlas: true,
            analyzeAccessPatterns: true
        };

        var mappingResult = performDeepDOMMapping(g_domViz_currentDOMStructure, mappingConfig);

        if (!mappingResult.success) {
            updateStatus('Deep mapping failed: ' + mappingResult.error);
            return;
        }

        // Display results
        var mappingDisplay = g_domViz_visualizerWindow.mainTabs.deepMappingTab.mappingDisplay.text;
        mappingDisplay.text = generateDeepMappingDisplay(mappingResult.mapping);

        updateStatus('Deep mapping complete');

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
            updateStatus('No DOM structure available. Run discovery first.');
            return;
        }

        if (!functionExists('generateObjectAtlas')) {
            updateStatus('Error: Object atlas generator not available');
            return;
        }

        updateStatus('Generating object atlas...');

        var atlasResult = generateObjectAtlas(g_domViz_currentDOMStructure);

        if (!atlasResult.success) {
            updateStatus('Atlas generation failed: ' + atlasResult.error);
            return;
        }

        // Display results
        var mappingDisplay = g_domViz_visualizerWindow.mainTabs.deepMappingTab.mappingDisplay.text;
        mappingDisplay.text = generateAtlasDisplay(atlasResult.atlas);

        updateStatus('Object atlas generated');

    } catch (exc) {
        updateStatus('Object atlas error: ' + exc.message);
    }
}

/**
 * Optimize performance based on analysis
 */
function optimizePerformance() {
    try {
        if (!g_domViz_currentDOMStructure) {
            updateStatus('No DOM structure available. Run discovery first.');
            return;
        }

        if (!functionExists('generatePerformanceOptimizations')) {
            updateStatus('Error: Performance optimizer not available');
            return;
        }

        updateStatus('Analyzing performance optimizations...');

        var optimizations = generatePerformanceOptimizations(g_domViz_currentDOMStructure);

        // Display results
        var mappingDisplay = g_domViz_visualizerWindow.mainTabs.deepMappingTab.mappingDisplay.text;
        mappingDisplay.text = generateOptimizationDisplay(optimizations);

        updateStatus('Performance optimization analysis complete');

    } catch (exc) {
        updateStatus('Performance optimization error: ' + exc.message);
    }
}

/**
 * Generate deep mapping display text
 */
function generateDeepMappingDisplay(mapping) {
    try {
        var builder = createStringBuilder();

        builder.appendLine('DEEP OBJECT MAPPING');
        builder.appendLine('===================');
        builder.appendLine('');

        if (mapping.summary) {
            builder.appendLine('MAPPING SUMMARY:');
            builder.appendLine('Objects Mapped: ' + (mapping.summary.objectCount || 0));
            builder.appendLine('Relationships: ' + (mapping.summary.relationshipCount || 0));
            builder.appendLine('Circular References: ' + (mapping.summary.circularRefCount || 0));
            builder.appendLine('');
        }

        if (mapping.objectAtlas) {
            builder.appendLine('OBJECT ATLAS:');
            builder.appendLine(stringSubstring(mapping.objectAtlas, 0, 1000) + '...');
            builder.appendLine('');
        }

        if (mapping.recommendations) {
            builder.appendLine('RECOMMENDATIONS:');
            builder.appendLine(mapping.recommendations);
        }

        return builder.toString();

    } catch (exc) {
        return 'Error generating mapping display: ' + exc.message;
    }
}

/**
 * Generate atlas display text
 */
function generateAtlasDisplay(atlas) {
    try {
        var builder = createStringBuilder();

        builder.appendLine('OBJECT ATLAS');
        builder.appendLine('============');
        builder.appendLine('');

        if (atlas.pathIndex) {
            builder.appendLine('PATH INDEX:');
            builder.appendLine(stringSubstring(atlas.pathIndex, 0, 1000) + '...');
            builder.appendLine('');
        }

        if (atlas.typeIndex) {
            builder.appendLine('TYPE INDEX:');
            builder.appendLine(stringSubstring(atlas.typeIndex, 0, 1000) + '...');
            builder.appendLine('');
        }

        if (atlas.relationshipMap) {
            builder.appendLine('RELATIONSHIPS:');
            builder.appendLine(stringSubstring(atlas.relationshipMap, 0, 1000) + '...');
        }

        return builder.toString();

    } catch (exc) {
        return 'Error generating atlas display: ' + exc.message;
    }
}

/**
 * Generate optimization display text
 */
function generateOptimizationDisplay(optimizations) {
    try {
        if (!optimizations || optimizations.length === 0) {
            return 'No performance optimizations identified.';
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
// CONFIGURATION
// =============================================================================

/**
 * Show configuration dialog
 */
function showConfigurationDialog() {
    try {
        var configResource = "dialog { " +
            "text: 'DOM Visualizer Configuration', " +
            "orientation: 'column', " +
            "alignChildren: 'fill', " +
            "preferredSize: { width: 600, height: 500 }, " +
            "margins: 15, " +
            
            "tabs: TabbedPanel { " +
                "alignChildren: 'fill', " +
                "preferredSize: { height: 400 }, " +
                
                "enumTab: Tab { " +
                    "text: 'Enumeration', " +
                    "orientation: 'column', " +
                    "alignChildren: 'left', " +
                    "maxDepth: Group { " +
                        "orientation: 'row', " +
                        "alignChildren: 'center', " +
                        "label: StaticText { text: 'Max Depth:', preferredSize: { width: 100 } }, " +
                        "value: EditText { text: '4', preferredSize: { width: 60 } } " +
                    "}, " +
                    "timeout: Group { " +
                        "orientation: 'row', " +
                        "alignChildren: 'center', " +
                        "label: StaticText { text: 'Timeout (ms):', preferredSize: { width: 100 } }, " +
                        "value: EditText { text: '15000', preferredSize: { width: 60 } } " +
                    "}, " +
                    "maxProps: Group { " +
                        "orientation: 'row', " +
                        "alignChildren: 'center', " +
                        "label: StaticText { text: 'Max Properties:', preferredSize: { width: 100 } }, " +
                        "value: EditText { text: '5000', preferredSize: { width: 60 } } " +
                    "}, " +
                    "options: Group { " +
                        "orientation: 'column', " +
                        "alignChildren: 'left', " +
                        "skipDangerous: Checkbox { text: 'Skip Dangerous Properties' }, " +
                        "objectTracking: Checkbox { text: 'Enable Object Tracking' }, " +
                        "duplicateDetection: Checkbox { text: 'Enable Duplicate Detection' }, " +
                        "circularRef: Checkbox { text: 'Circular Reference Detection' } " +
                    "} " +
                "}, " +
                
                "samplingTab: Tab { " +
                    "text: 'Value Sampling', " +
                    "orientation: 'column', " +
                    "alignChildren: 'left', " +
                    "maxSamples: Group { " +
                        "orientation: 'row', " +
                        "alignChildren: 'center', " +
                        "label: StaticText { text: 'Max Samples:', preferredSize: { width: 100 } }, " +
                        "value: EditText { text: '10', preferredSize: { width: 60 } } " +
                    "}, " +
                    "maxStringLen: Group { " +
                        "orientation: 'row', " +
                        "alignChildren: 'center', " +
                        "label: StaticText { text: 'Max String Length:', preferredSize: { width: 120 } }, " +
                        "value: EditText { text: '500', preferredSize: { width: 60 } } " +
                    "}, " +
                    "safetyFilter: Group { " +
                        "orientation: 'row', " +
                        "alignChildren: 'center', " +
                        "label: StaticText { text: 'Safety Filter:', preferredSize: { width: 100 } }, " +
                        "value: DropDownList { preferredSize: { width: 100 } } " +
                    "}, " +
                    "options: Group { " +
                        "orientation: 'column', " +
                        "alignChildren: 'left', " +
                        "includeCollections: Checkbox { text: 'Include Collection Samples' }, " +
                        "trackRefs: Checkbox { text: 'Track Object References' }, " +
                        "includeMetadata: Checkbox { text: 'Include Value Metadata' }, " +
                        "skipNulls: Checkbox { text: 'Skip Null Values' } " +
                    "} " +
                "}, " +
                
                "exportTab: Tab { " +
                    "text: 'Export', " +
                    "orientation: 'column', " +
                    "alignChildren: 'left', " +
                    "options: Group { " +
                        "orientation: 'column', " +
                        "alignChildren: 'left', " +
                        "includeValues: Checkbox { text: 'Include Extracted Values' }, " +
                        "formatOutput: Checkbox { text: 'Format Output' }, " +
                        "includeMetadata: Checkbox { text: 'Include Metadata' }, " +
                        "includeRefs: Checkbox { text: 'Include Object References' }, " +
                        "enableTimestamps: Checkbox { text: 'Enable Timestamps' } " +
                    "} " +
                "} " +
            "}, " +
            
            "buttons: Group { " +
                "orientation: 'row', " +
                "alignChildren: 'center', " +
                "spacing: 10, " +
                "reset: Button { text: 'Reset Defaults', preferredSize: { width: 120, height: 25 } }, " +
                "cancel: Button { text: 'Cancel', preferredSize: { width: 80, height: 25 } }, " +
                "ok: Button { text: 'OK', preferredSize: { width: 80, height: 25 } } " +
            "} " +
        "}";

        var configDialog = new Window(configResource);
        if (!configDialog) {
            updateStatus('Failed to create configuration dialog');
            return;
        }

        // Initialize dropdown
        var safetyDropdown = configDialog.tabs.samplingTab.safetyFilter.value;
        safetyDropdown.add('item', 'safe');
        safetyDropdown.add('item', 'moderate');
        safetyDropdown.add('item', 'all');
        safetyDropdown.selection = 0;

        // Load current values
        loadConfigurationValues(configDialog);

        // Event handlers
        configDialog.buttons.reset.onClick = function() {
            g_domViz_userConfiguration = objectClone(DEFAULT_VISUALIZER_CONFIG, 4);
            loadConfigurationValues(configDialog);
        };

        configDialog.buttons.cancel.onClick = function() {
            configDialog.close();
        };

        configDialog.buttons.ok.onClick = function() {
            saveConfigurationValues(configDialog);
            configDialog.close();
            updateStatus('Configuration updated');
        };

        configDialog.show();

    } catch (exc) {
        updateStatus('Configuration dialog error: ' + exc.message);
    }
}

/**
 * Load configuration values into dialog
 */
function loadConfigurationValues(dialog) {
    try {
        var config = g_domViz_userConfiguration;

        // Enumeration tab
        dialog.tabs.enumTab.maxDepth.value.text = config.enumeration.maxDepth.toString();
        dialog.tabs.enumTab.timeout.value.text = config.enumeration.timeoutMs.toString();
        dialog.tabs.enumTab.maxProps.value.text = config.enumeration.maxProperties.toString();
        dialog.tabs.enumTab.options.skipDangerous.value = config.enumeration.skipDangerous;
        dialog.tabs.enumTab.options.objectTracking.value = config.enumeration.enableObjectTracking;
        dialog.tabs.enumTab.options.duplicateDetection.value = config.enumeration.enableDuplicateDetection;
        dialog.tabs.enumTab.options.circularRef.value = config.enumeration.enableCircularReferenceDetection;

        // Sampling tab
        dialog.tabs.samplingTab.maxSamples.value.text = config.sampling.maxSamples.toString();
        dialog.tabs.samplingTab.maxStringLen.value.text = config.sampling.maxStringLength.toString();
        var safetyIndex = config.sampling.safetyFilter === 'safe' ? 0 : 
                         config.sampling.safetyFilter === 'moderate' ? 1 : 2;
        dialog.tabs.samplingTab.safetyFilter.value.selection = safetyIndex;
        dialog.tabs.samplingTab.options.includeCollections.value = config.sampling.includeCollectionSamples;
        dialog.tabs.samplingTab.options.trackRefs.value = config.sampling.trackObjectReferences;
        dialog.tabs.samplingTab.options.includeMetadata.value = config.sampling.includeValueMetadata;
        dialog.tabs.samplingTab.options.skipNulls.value = config.sampling.skipNullValues;

        // Export tab
        dialog.tabs.exportTab.options.includeValues.value = config.exportSettings.includeExtractedValues;
        dialog.tabs.exportTab.options.formatOutput.value = config.exportSettings.formatOutput;
        dialog.tabs.exportTab.options.includeMetadata.value = config.exportSettings.includeMetadata;
        dialog.tabs.exportTab.options.includeRefs.value = config.exportSettings.includeObjectReferences;
        dialog.tabs.exportTab.options.enableTimestamps.value = config.exportSettings.enableTimestamps;

    } catch (exc) {
        updateStatus('Error loading configuration values: ' + exc.message);
    }
}

/**
 * Save configuration values from dialog
 */
function saveConfigurationValues(dialog) {
    try {
        var config = g_domViz_userConfiguration;

        // Enumeration tab
        config.enumeration.maxDepth = safeParseInt(dialog.tabs.enumTab.maxDepth.value.text, 4);
        config.enumeration.timeoutMs = safeParseInt(dialog.tabs.enumTab.timeout.value.text, 15000);
        config.enumeration.maxProperties = safeParseInt(dialog.tabs.enumTab.maxProps.value.text, 5000);
        config.enumeration.skipDangerous = dialog.tabs.enumTab.options.skipDangerous.value;
        config.enumeration.enableObjectTracking = dialog.tabs.enumTab.options.objectTracking.value;
        config.enumeration.enableDuplicateDetection = dialog.tabs.enumTab.options.duplicateDetection.value;
        config.enumeration.enableCircularReferenceDetection = dialog.tabs.enumTab.options.circularRef.value;

        // Sampling tab
        config.sampling.maxSamples = safeParseInt(dialog.tabs.samplingTab.maxSamples.value.text, 10);
        config.sampling.maxStringLength = safeParseInt(dialog.tabs.samplingTab.maxStringLen.value.text, 500);
        var safetyOptions = ['safe', 'moderate', 'all'];
        var safetyIndex = dialog.tabs.samplingTab.safetyFilter.value.selection ? 
                         dialog.tabs.samplingTab.safetyFilter.value.selection.index : 0;
        config.sampling.safetyFilter = safetyOptions[safetyIndex];
        config.sampling.includeCollectionSamples = dialog.tabs.samplingTab.options.includeCollections.value;
        config.sampling.trackObjectReferences = dialog.tabs.samplingTab.options.trackRefs.value;
        config.sampling.includeValueMetadata = dialog.tabs.samplingTab.options.includeMetadata.value;
        config.sampling.skipNullValues = dialog.tabs.samplingTab.options.skipNulls.value;

        // Export tab
        config.exportSettings.includeExtractedValues = dialog.tabs.exportTab.options.includeValues.value;
        config.exportSettings.formatOutput = dialog.tabs.exportTab.options.formatOutput.value;
        config.exportSettings.includeMetadata = dialog.tabs.exportTab.options.includeMetadata.value;
        config.exportSettings.includeObjectReferences = dialog.tabs.exportTab.options.includeRefs.value;
        config.exportSettings.enableTimestamps = dialog.tabs.exportTab.options.enableTimestamps.value;

    } catch (exc) {
        updateStatus('Error saving configuration values: ' + exc.message);
    }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Update document information display
 */
function updateDocumentInfo() {
    try {
        if (!g_domViz_documentInfo) return;

        var envValidation = validateInDesignEnvironment();
        if (envValidation.valid) {
            var docName = envValidation.metadata.documentName || 'Unknown Document';
            g_domViz_documentInfo.text = 'Document: ' + docName;
        } else {
            g_domViz_documentInfo.text = 'Document: ' + envValidation.error;
        }

    } catch (exc) {
        if (g_domViz_documentInfo) {
            g_domViz_documentInfo.text = 'Document: Error - ' + exc.message;
        }
    }
}

/**
 * Reset visualizer to default state
 */
function resetVisualizer() {
    try {
        // Reset configuration
        g_domViz_userConfiguration = objectClone(DEFAULT_VISUALIZER_CONFIG, 4);

        // Clear data
        g_domViz_currentDOMStructure = null;
        g_domViz_beforeData = null;
        g_domViz_afterData = null;
        g_domViz_exportHistory = [];

        // Clear displays
        if (g_domViz_domDisplay) {
            g_domViz_domDisplay.text = '';
        }

        var window = g_domViz_visualizerWindow;
        if (window) {
            if (window.mainTabs.exportTab.exportDisplay.text) {
                window.mainTabs.exportTab.exportDisplay.text.text = '';
            }
            if (window.mainTabs.comparisonTab.comparisonDisplay.text) {
                window.mainTabs.comparisonTab.comparisonDisplay.text.text = '';
            }
            if (window.mainTabs.deepMappingTab.mappingDisplay.text) {
                window.mainTabs.deepMappingTab.mappingDisplay.text.text = '';
            }
        }

        updateStatus('Visualizer reset to defaults');

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
                      'DISCOVERY TAB:\n' +
                      '• Phase 1: Enumerate - Discover DOM structure\n' +
                      '• Phase 2: Sample Values - Extract property values\n' +
                      '• Phase 3: Sample Collections - Analyze collection contents\n' +
                      '• Discover DOM - Runs all phases automatically\n\n' +
                      'EXPORT TAB:\n' +
                      '• Export JSON - Save structure as JSON file\n' +
                      '• Export Text - Save structure as readable text\n' +
                      '• Export CSV - Save structure as CSV file\n' +
                      '• Analyze JSON - Analyze current structure\n\n' +
                      'COMPARISON TAB:\n' +
                      '• Load Before/After - Load JSON files for comparison\n' +
                      '• Compare - Analyze differences between files\n' +
                      '• Take Snapshot - Export current state for comparison\n\n' +
                      'DEEP MAPPING TAB:\n' +
                      '• Create Map - Generate detailed object mapping\n' +
                      '• Object Atlas - Create comprehensive object index\n' +
                      '• Optimize - Analyze performance optimizations\n\n' +
                      'Use Configuration to adjust discovery settings.';

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
        g_domViz_domDisplay = null;
        g_domViz_statusText = null;
        g_domViz_currentDOMStructure = null;
        g_domViz_userConfiguration = null;
        g_domViz_originalConfigs = null;
        g_domViz_exportHistory = [];
        g_domViz_beforeData = null;
        g_domViz_afterData = null;

    } catch (exc) {
        $.writeln('[DOM Visualizer] Close error: ' + exc.message);
    }
}

// =============================================================================
// MODULE REGISTRATION
// =============================================================================

// Register this module with all its functions
registerModule('5.2_dom-visualizer', '3.1', [
    // Main Functions
    'showDOMVisualizer', 'createVisualizerWindow', 'initializeVisualizerComponents',
    
    // Discovery Operations
    'performFullDiscovery', 'performPhase1Enumeration', 'performPhase2ValueSampling', 
    'performPhase3CollectionSampling', 'displayCurrentStructure', 'generateStructureDisplayText',
    'clearDiscoveryDisplay',
    
    // Export Operations
    'exportAsJSON', 'exportAsText', 'exportAsCSV', 'analyzeCurrentJSON', 'generateAnalysisDisplay',
    
    // Comparison Operations
    'loadBeforeJSON', 'loadAfterJSON', 'performComparison', 'generateComparisonDisplay', 'takeSnapshot',
    
    // Deep Mapping Operations
    'performDeepMapping', 'generateObjectAtlas', 'optimizePerformance', 'generateDeepMappingDisplay',
    'generateAtlasDisplay', 'generateOptimizationDisplay',
    
    // Configuration
    'showConfigurationDialog', 'loadConfigurationValues', 'saveConfigurationValues',
    
    // Utility Functions
    'updateDocumentInfo', 'updateStatus', 'resetVisualizer', 'showHelp', 'closeVisualizer'
]);

// =============================================================================
// END OF 5.2_dom-visualizer.jsx
// =============================================================================