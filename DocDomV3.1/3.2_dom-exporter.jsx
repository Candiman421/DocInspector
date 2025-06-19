// =============================================================================
// 5.2_dom-visualizer.jsx - DOM DISCOVERY VISUALIZER - FIXED
// InDesign DOM Discovery Builder v3.1 - PRODUCTION READY - PROGRAMMATIC UI
// =============================================================================
// PURPOSE: Main visualizer interface with comprehensive DOM discovery tools
// DEPENDENCIES: ["1.1_bootstrap-foundation.jsx", "1.2_safety-utilities.jsx"]
// SIZE: ~1953 lines - COMPLETE IMPLEMENTATION - FIXED SETTINGS UI BUG
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
var g_domViz_exportData = [];  // FIXED: was g_domViz_exportHistory
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
// DEFAULT CONFIGURATION - REMOVED DEBUG OBJECT
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
    exportDataSettings: {  // FIXED: was exportSettings
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
    // REMOVED: debug object - now using global g_loggingConfig
};

// =============================================================================
// MAIN VISUALIZER FUNCTIONS - FIXED: INITIALIZATION ORDER
// =============================================================================

/**
 * Show DOM visualizer interface (main entry point)
 * @returns {Boolean} True if visualizer shown successfully
 */
function showDOMVisualizer() {
    try {
        // 1. Initialize logging FIRST (CRITICAL FIX)
        if (!g_loggingConfig) {
            initializeLoggingConfig();
        }
        
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

        // 2. Initialize configuration AFTER logging
        g_domViz_userConfiguration = objectClone(DEFAULT_VISUALIZER_CONFIG, 4);
        g_domViz_originalConfigs = objectClone(DEFAULT_VISUALIZER_CONFIG, 4);

        // 3. Log initialization success
        logInfo('Visualizer system initialized', 'general');

        // Create main window using PROGRAMMATIC approach
        g_domViz_visualizerWindow = createVisualizerWindow();
        if (!g_domViz_visualizerWindow) {
            alert('Failed to create DOM Visualizer window');
            return false;
        }

        // Initialize components and show window
        initializeVisualizerComponents();
        g_domViz_visualizerWindow.show();

        // Update initial status and document info
        updateDocumentInfo();
        updateStatus('DOM Visualizer ready - ' + g_domViz_documentInfo);

        logInfo('DOM Visualizer opened successfully', 'display');
        return true;

    } catch (exc) {
        logError('Failed to open DOM Visualizer: ' + exc.message, 'general');
        alert('DOM Visualizer Error: ' + exc.message);
        return false;
    }
}

/**
 * Create visualizer window - PROGRAMMATIC UI CREATION
 */
function createVisualizerWindow() {
    try {
        // Create main window
        var window = new Window('dialog', 'InDesign DOM Discovery Builder v3.1');
        if (!window) return null;

        window.orientation = 'column';
        window.alignChildren = 'fill';
        window.spacing = 10;
        window.margins = 15;
        window.preferredSize.width = 1200;
        window.preferredSize.height = 800;

        // Create header
        createVisualizerHeader(window);

        // Create main tabs
        createVisualizerTabs(window);

        // Create footer
        createVisualizerFooter(window);

        return window;

    } catch (exc) {
        logError('Window creation error: ' + exc.message, 'display');
        return null;
    }
}

/**
 * Create visualizer header
 */
function createVisualizerHeader(parentWindow) {
    try {
        var headerGroup = parentWindow.add('group');
        if (!headerGroup) return;

        headerGroup.orientation = 'column';
        headerGroup.alignChildren = 'fill';
        headerGroup.spacing = 5;

        // Title
        var titleText = headerGroup.add('statictext', undefined, 'InDesign DOM Discovery Builder v3.1');
        if (titleText) {
            titleText.graphics.font = ScriptUI.newFont('Arial', 'BOLD', 16);
        }

        // Document info
        g_domViz_documentInfo = headerGroup.add('statictext', undefined, 'Document: [None loaded]');

        // Configuration button
        var configGroup = headerGroup.add('group');
        if (configGroup) {
            configGroup.orientation = 'row';
            configGroup.alignment = 'right';

            var configBtn = configGroup.add('button', undefined, 'Configuration');
            if (configBtn) {
                configBtn.preferredSize.width = 100;
                configBtn.preferredSize.height = 25;
                configBtn.onClick = showConfigurationDialog;
            }
        }

    } catch (exc) {
        logError('Header creation error: ' + exc.message, 'display');
    }
}

/**
 * Create main tabs
 */
function createVisualizerTabs(parentWindow) {
    try {
        g_domViz_mainTabs = parentWindow.add('tabbedpanel');
        if (!g_domViz_mainTabs) return;

        g_domViz_mainTabs.alignChildren = 'fill';
        g_domViz_mainTabs.preferredSize.height = 600;

        // Create individual tabs
        createDiscoveryTab();
        createExportTab();
        createComparisonTab();
        createDeepMappingTab();

    } catch (exc) {
        logError('Tabs creation error: ' + exc.message, 'display');
    }
}

/**
 * Create discovery tab
 */
function createDiscoveryTab() {
    try {
        g_domViz_discoveryTab = g_domViz_mainTabs.add('tab', undefined, 'Discovery');
        if (!g_domViz_discoveryTab) return;

        g_domViz_discoveryTab.orientation = 'column';
        g_domViz_discoveryTab.alignChildren = 'fill';
        g_domViz_discoveryTab.spacing = 10;

        // Control panel
        var controlPanel = g_domViz_discoveryTab.add('group');
        if (controlPanel) {
            controlPanel.orientation = 'row';
            controlPanel.spacing = 10;

            var fullDiscoveryBtn = controlPanel.add('button', undefined, 'Discover DOM');
            if (fullDiscoveryBtn) {
                fullDiscoveryBtn.preferredSize.width = 120;
                fullDiscoveryBtn.onClick = performFullDiscovery;
            }

            var phase1Btn = controlPanel.add('button', undefined, 'Phase 1: Enumerate');
            if (phase1Btn) {
                phase1Btn.preferredSize.width = 120;
                phase1Btn.onClick = performPhase1Enumeration;
            }

            var phase2Btn = controlPanel.add('button', undefined, 'Phase 2: Sample');
            if (phase2Btn) {
                phase2Btn.preferredSize.width = 120;
                phase2Btn.onClick = performPhase2ValueSampling;
            }

            var phase3Btn = controlPanel.add('button', undefined, 'Phase 3: Collect');
            if (phase3Btn) {
                phase3Btn.preferredSize.width = 120;
                phase3Btn.onClick = performPhase3CollectionSampling;
            }

            var clearBtn = controlPanel.add('button', undefined, 'Clear');
            if (clearBtn) {
                clearBtn.preferredSize.width = 80;
                clearBtn.onClick = clearDiscoveryDisplay;
            }
        }

        // Discovery display
        g_domViz_discoveryDisplay = g_domViz_discoveryTab.add('edittext', undefined, '', {multiline: true, scrolling: true});
        if (g_domViz_discoveryDisplay) {
            g_domViz_discoveryDisplay.preferredSize.height = 500;
        }

    } catch (exc) {
        logError('Discovery tab creation error: ' + exc.message, 'display');
    }
}

/**
 * Create export tab
 */
function createExportTab() {
    try {
        g_domViz_exportTab = g_domViz_mainTabs.add('tab', undefined, 'Export');
        if (!g_domViz_exportTab) return;

        g_domViz_exportTab.orientation = 'column';
        g_domViz_exportTab.alignChildren = 'fill';
        g_domViz_exportTab.spacing = 10;

        // Export control panel
        var exportPanel = g_domViz_exportTab.add('group');
        if (exportPanel) {
            exportPanel.orientation = 'row';
            exportPanel.spacing = 10;

            var jsonBtn = exportPanel.add('button', undefined, 'Export JSON');
            if (jsonBtn) {
                jsonBtn.preferredSize.width = 100;
                jsonBtn.onClick = exportAsJSON;
            }

            var textBtn = exportPanel.add('button', undefined, 'Export Text');
            if (textBtn) {
                textBtn.preferredSize.width = 100;
                textBtn.onClick = exportAsText;
            }

            var csvBtn = exportPanel.add('button', undefined, 'Export CSV');
            if (csvBtn) {
                csvBtn.preferredSize.width = 100;
                csvBtn.onClick = exportAsCSV;
            }

            var analyzeBtn = exportPanel.add('button', undefined, 'Analyze JSON');
            if (analyzeBtn) {
                analyzeBtn.preferredSize.width = 100;
                analyzeBtn.onClick = analyzeCurrentJSON;
            }
        }

        // Export display
        g_domViz_exportDisplay = g_domViz_exportTab.add('edittext', undefined, '', {multiline: true, scrolling: true});
        if (g_domViz_exportDisplay) {
            g_domViz_exportDisplay.preferredSize.height = 500;
        }

    } catch (exc) {
        logError('Export tab creation error: ' + exc.message, 'display');
    }
}

/**
 * Create comparison tab
 */
function createComparisonTab() {
    try {
        g_domViz_comparisonTab = g_domViz_mainTabs.add('tab', undefined, 'Comparison');
        if (!g_domViz_comparisonTab) return;

        g_domViz_comparisonTab.orientation = 'column';
        g_domViz_comparisonTab.alignChildren = 'fill';
        g_domViz_comparisonTab.spacing = 10;

        // Comparison control panel
        var comparisonPanel = g_domViz_comparisonTab.add('group');
        if (comparisonPanel) {
            comparisonPanel.orientation = 'row';
            comparisonPanel.spacing = 10;

            var snapshotBtn = comparisonPanel.add('button', undefined, 'Take Snapshot');
            if (snapshotBtn) {
                snapshotBtn.preferredSize.width = 100;
                snapshotBtn.onClick = takeSnapshot;
            }

            var loadBeforeBtn = comparisonPanel.add('button', undefined, 'Load Before');
            if (loadBeforeBtn) {
                loadBeforeBtn.preferredSize.width = 100;
                loadBeforeBtn.onClick = loadBeforeJSON;
            }

            var loadAfterBtn = comparisonPanel.add('button', undefined, 'Load After');
            if (loadAfterBtn) {
                loadAfterBtn.preferredSize.width = 100;
                loadAfterBtn.onClick = loadAfterJSON;
            }

            var compareBtn = comparisonPanel.add('button', undefined, 'Compare');
            if (compareBtn) {
                compareBtn.preferredSize.width = 100;
                compareBtn.onClick = performComparison;
            }
        }

        // Comparison display
        g_domViz_comparisonDisplay = g_domViz_comparisonTab.add('edittext', undefined, '', {multiline: true, scrolling: true});
        if (g_domViz_comparisonDisplay) {
            g_domViz_comparisonDisplay.preferredSize.height = 500;
        }

    } catch (exc) {
        logError('Comparison tab creation error: ' + exc.message, 'display');
    }
}

/**
 * Create deep mapping tab
 */
function createDeepMappingTab() {
    try {
        g_domViz_deepMappingTab = g_domViz_mainTabs.add('tab', undefined, 'Deep Mapping');
        if (!g_domViz_deepMappingTab) return;

        g_domViz_deepMappingTab.orientation = 'column';
        g_domViz_deepMappingTab.alignChildren = 'fill';
        g_domViz_deepMappingTab.spacing = 10;

        // Deep mapping control panel
        var mappingPanel = g_domViz_deepMappingTab.add('group');
        if (mappingPanel) {
            mappingPanel.orientation = 'row';
            mappingPanel.spacing = 10;

            var deepMapBtn = mappingPanel.add('button', undefined, 'Deep Map');
            if (deepMapBtn) {
                deepMapBtn.preferredSize.width = 100;
                deepMapBtn.onClick = performDeepMapping;
            }

            var atlasBtn = mappingPanel.add('button', undefined, 'Object Atlas');
            if (atlasBtn) {
                atlasBtn.preferredSize.width = 100;
                atlasBtn.onClick = generateObjectAtlas;
            }

            var optimizeBtn = mappingPanel.add('button', undefined, 'Optimize');
            if (optimizeBtn) {
                optimizeBtn.preferredSize.width = 100;
                optimizeBtn.onClick = optimizePerformance;
            }
        }

        // Deep mapping display
        g_domViz_mappingDisplay = g_domViz_deepMappingTab.add('edittext', undefined, '', {multiline: true, scrolling: true});
        if (g_domViz_mappingDisplay) {
            g_domViz_mappingDisplay.preferredSize.height = 500;
        }

    } catch (exc) {
        logError('Deep mapping tab creation error: ' + exc.message, 'display');
    }
}

/**
 * Create visualizer footer
 */
function createVisualizerFooter(parentWindow) {
    try {
        var separatorPanel = parentWindow.add('panel');
        if (separatorPanel) {
            separatorPanel.preferredSize.height = 2;
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
// DISCOVERY OPERATIONS - UPDATED TO USE NEW LOGGING
// =============================================================================

/**
 * Perform full discovery (all phases) - UPDATED LOGGING
 */
function performFullDiscovery() {
    try {
        logDebug('Starting full DOM discovery', 'enumeration');
        updateStatus('Starting full DOM discovery...');

        // Validate environment
        var envValidation = validateInDesignEnvironment();
        if (!envValidation.valid) {
            updateStatus('Environment validation failed: ' + envValidation.error);
            return;
        }

        logDebug('Environment validated successfully', 'enumeration');

        // Run all phases
        performPhase1Enumeration();
        performPhase2ValueSampling();
        performPhase3CollectionSampling();

        updateStatus('Full DOM discovery completed');
        logInfo('Full DOM discovery completed successfully', 'enumeration');

    } catch (exc) {
        logError('Full discovery error: ' + exc.message, 'enumeration');
        updateStatus('Discovery error: ' + exc.message);
    }
}

/**
 * Perform Phase 1: Enumeration
 */
function performPhase1Enumeration() {
    try {
        logDebug('Starting Phase 1: DOM Enumeration', 'enumeration');
        updateStatus('Phase 1: Enumerating DOM structure...');

        // Check dependencies
        if (!functionExists('enumerateDocumentDOM')) {
            updateStatus('Phase 1 unavailable - DOM enumerator module missing');
            logWarn('enumerateDocumentDOM function not available', 'enumeration');
            return;
        }

        // Validate environment
        var envValidation = validateInDesignEnvironment();
        if (!envValidation.valid) {
            updateStatus('Environment validation failed');
            return;
        }

        // Run enumeration
        var enumerationConfig = g_domViz_userConfiguration.enumeration;
        var domStructure = enumerateDocumentDOM(envValidation.document, enumerationConfig);

        if (domStructure && !domStructure.error) {
            g_domViz_currentDOMStructure = domStructure;
            displayCurrentStructure();
            updateStatus('Phase 1 completed: ' + (domStructure.metadata ? domStructure.metadata.totalNodes : 'unknown') + ' nodes discovered');
            logInfo('Phase 1 enumeration completed successfully', 'enumeration');
        } else {
            updateStatus('Phase 1 failed: ' + (domStructure ? domStructure.error : 'enumeration returned null'));
            logError('Phase 1 enumeration failed', 'enumeration');
        }

    } catch (exc) {
        logError('Phase 1 enumeration error: ' + exc.message, 'enumeration');
        updateStatus('Phase 1 error: ' + exc.message);
    }
}

/**
 * Perform Phase 2: Value Sampling
 */
function performPhase2ValueSampling() {
    try {
        logDebug('Starting Phase 2: Value Sampling', 'sampling');
        updateStatus('Phase 2: Sampling property values...');

        if (!g_domViz_currentDOMStructure) {
            updateStatus('Phase 2 requires Phase 1 data - run enumeration first');
            return;
        }

        // Check dependencies
        if (!functionExists('samplePropertyValues')) {
            updateStatus('Phase 2 unavailable - property sampler module missing');
            logWarn('samplePropertyValues function not available', 'sampling');
            return;
        }

        // Run value sampling
        var samplingConfig = g_domViz_userConfiguration.sampling;
        var sampledStructure = samplePropertyValues(g_domViz_currentDOMStructure, samplingConfig);

        if (sampledStructure && !sampledStructure.error) {
            g_domViz_currentDOMStructure = sampledStructure;
            displayCurrentStructure();
            updateStatus('Phase 2 completed: Property values sampled');
            logInfo('Phase 2 value sampling completed successfully', 'sampling');
        } else {
            updateStatus('Phase 2 failed: ' + (sampledStructure ? sampledStructure.error : 'sampling failed'));
            logError('Phase 2 value sampling failed', 'sampling');
        }

    } catch (exc) {
        logError('Phase 2 sampling error: ' + exc.message, 'sampling');
        updateStatus('Phase 2 error: ' + exc.message);
    }
}

/**
 * Perform Phase 3: Collection Sampling
 */
function performPhase3CollectionSampling() {
    try {
        logDebug('Starting Phase 3: Collection Sampling', 'sampling');
        updateStatus('Phase 3: Sampling collections...');

        if (!g_domViz_currentDOMStructure) {
            updateStatus('Phase 3 requires earlier phase data - run enumeration first');
            return;
        }

        // Check dependencies
        if (!functionExists('sampleCollections')) {
            updateStatus('Phase 3 unavailable - collection sampler module missing');
            logWarn('sampleCollections function not available', 'sampling');
            return;
        }

        // Run collection sampling
        var samplingConfig = g_domViz_userConfiguration.sampling;
        var collectionStructure = sampleCollections(g_domViz_currentDOMStructure, samplingConfig);

        if (collectionStructure && !collectionStructure.error) {
            g_domViz_currentDOMStructure = collectionStructure;
            displayCurrentStructure();
            updateStatus('Phase 3 completed: Collections sampled');
            logInfo('Phase 3 collection sampling completed successfully', 'sampling');
        } else {
            updateStatus('Phase 3 failed: ' + (collectionStructure ? collectionStructure.error : 'collection sampling failed'));
            logError('Phase 3 collection sampling failed', 'sampling');
        }

    } catch (exc) {
        logError('Phase 3 collection sampling error: ' + exc.message, 'sampling');
        updateStatus('Phase 3 error: ' + exc.message);
    }
}

/**
 * Display current DOM structure
 */
function displayCurrentStructure() {
    try {
        if (!g_domViz_discoveryDisplay || !g_domViz_currentDOMStructure) {
            return;
        }

        logDebug('Displaying DOM structure', 'display');

        var displayText = generateStructureDisplayText(g_domViz_currentDOMStructure);
        g_domViz_discoveryDisplay.text = displayText;

        logDebug('DOM structure display updated', 'display');

    } catch (exc) {
        logError('Display error: ' + exc.message, 'display');
        if (g_domViz_discoveryDisplay) {
            g_domViz_discoveryDisplay.text = 'Display error: ' + exc.message;
        }
    }
}

/**
 * Generate structure display text
 */
function generateStructureDisplayText(structure) {
    try {
        if (!structure) return 'No structure data available';

        var displayText = 'DOM DISCOVERY RESULTS\n';
        displayText += '=====================\n\n';

        // Add metadata
        if (structure.metadata) {
            displayText += 'METADATA:\n';
            displayText += '- Total Nodes: ' + (structure.metadata.totalNodes || 'unknown') + '\n';
            displayText += '- Max Depth: ' + (structure.metadata.maxDepth || 'unknown') + '\n';
            displayText += '- Generation Time: ' + (structure.metadata.generationTime || 'unknown') + 'ms\n';
            displayText += '- Phase: ' + (structure.metadata.currentPhase || 'unknown') + '\n\n';
        }

        // Add structure preview
        if (structure.nodes && structure.nodes.length > 0) {
            displayText += 'STRUCTURE PREVIEW:\n';
            var previewCount = Math.min(10, structure.nodes.length);
            for (var i = 0; i < previewCount; i++) {
                var node = structure.nodes[i];
                displayText += '- ' + (node.path || 'unknown') + ' (' + (node.type || 'unknown') + ')\n';
            }
            if (structure.nodes.length > previewCount) {
                displayText += '... and ' + (structure.nodes.length - previewCount) + ' more nodes\n';
            }
        } else {
            displayText += 'No nodes discovered\n';
        }

        return displayText;

    } catch (exc) {
        logError('Display text generation error: ' + exc.message, 'display');
        return 'Error generating display: ' + exc.message;
    }
}

/**
 * Clear discovery display
 */
function clearDiscoveryDisplay() {
    try {
        if (g_domViz_discoveryDisplay) {
            g_domViz_discoveryDisplay.text = '';
        }
        g_domViz_currentDOMStructure = null;
        updateStatus('Discovery display cleared');
        logDebug('Discovery display cleared', 'display');

    } catch (exc) {
        logError('Clear display error: ' + exc.message, 'display');
    }
}

// =============================================================================
// EXPORT OPERATIONS - UPDATED TO USE NEW LOGGING
// =============================================================================

/**
 * Export as JSON
 */
function exportAsJSON() {
    try {
        logDebug('Starting JSON export', 'exportData');
        
        if (!g_domViz_currentDOMStructure) {
            updateStatus('No data to export - run discovery first');
            return;
        }

        // Check dependencies
        if (!functionExists('exportDOMStructure')) {
            updateStatus('Export unavailable - DOM exporter module missing');
            logWarn('exportDOMStructure function not available', 'exportData');
            return;
        }

        updateStatus('Exporting as JSON...');
        var exportResult = exportDOMStructure(g_domViz_currentDOMStructure, 'json', g_domViz_userConfiguration.exportDataSettings);

        if (exportResult && exportResult.success) {
            if (g_domViz_exportDisplay) {
                g_domViz_exportDisplay.text = exportResult.content || 'Export completed - check file';
            }
            updateStatus('JSON export completed: ' + (exportResult.filePath || 'file saved'));
            logInfo('JSON export completed successfully', 'exportData');
        } else {
            updateStatus('JSON export failed: ' + (exportResult ? exportResult.error : 'unknown error'));
            logError('JSON export failed', 'exportData');
        }

    } catch (exc) {
        logError('JSON export error: ' + exc.message, 'exportData');
        updateStatus('JSON export error: ' + exc.message);
    }
}

/**
 * Export as Text
 */
function exportAsText() {
    try {
        logDebug('Starting text export', 'exportData');
        
        if (!g_domViz_currentDOMStructure) {
            updateStatus('No data to export - run discovery first');
            return;
        }

        // Check dependencies
        if (!functionExists('exportDOMStructure')) {
            updateStatus('Export unavailable - DOM exporter module missing');
            logWarn('exportDOMStructure function not available', 'exportData');
            return;
        }

        updateStatus('Exporting as text...');
        var exportResult = exportDOMStructure(g_domViz_currentDOMStructure, 'text', g_domViz_userConfiguration.exportDataSettings);

        if (exportResult && exportResult.success) {
            if (g_domViz_exportDisplay) {
                g_domViz_exportDisplay.text = exportResult.content || 'Export completed - check file';
            }
            updateStatus('Text export completed: ' + (exportResult.filePath || 'file saved'));
            logInfo('Text export completed successfully', 'exportData');
        } else {
            updateStatus('Text export failed: ' + (exportResult ? exportResult.error : 'unknown error'));
            logError('Text export failed', 'exportData');
        }

    } catch (exc) {
        logError('Text export error: ' + exc.message, 'exportData');
        updateStatus('Text export error: ' + exc.message);
    }
}

/**
 * Export as CSV
 */
function exportAsCSV() {
    try {
        logDebug('Starting CSV export', 'exportData');
        
        if (!g_domViz_currentDOMStructure) {
            updateStatus('No data to export - run discovery first');
            return;
        }

        // Check dependencies
        if (!functionExists('exportDOMStructure')) {
            updateStatus('Export unavailable - DOM exporter module missing');
            logWarn('exportDOMStructure function not available', 'exportData');
            return;
        }

        updateStatus('Exporting as CSV...');
        var exportResult = exportDOMStructure(g_domViz_currentDOMStructure, 'csv', g_domViz_userConfiguration.exportDataSettings);

        if (exportResult && exportResult.success) {
            if (g_domViz_exportDisplay) {
                g_domViz_exportDisplay.text = 'CSV export completed - check file: ' + (exportResult.filePath || 'unknown location');
            }
            updateStatus('CSV export completed: ' + (exportResult.filePath || 'file saved'));
            logInfo('CSV export completed successfully', 'exportData');
        } else {
            updateStatus('CSV export failed: ' + (exportResult ? exportResult.error : 'unknown error'));
            logError('CSV export failed', 'exportData');
        }

    } catch (exc) {
        logError('CSV export error: ' + exc.message, 'exportData');
        updateStatus('CSV export error: ' + exc.message);
    }
}

/**
 * Analyze current JSON
 */
function analyzeCurrentJSON() {
    try {
        logDebug('Starting JSON analysis', 'analysis');
        
        if (!g_domViz_currentDOMStructure) {
            updateStatus('No data to analyze - run discovery first');
            return;
        }

        // Check dependencies
        if (!functionExists('analyzeJSONStructure')) {
            updateStatus('Analysis unavailable - JSON analyzer module missing');
            logWarn('analyzeJSONStructure function not available', 'analysis');
            return;
        }

        updateStatus('Analyzing JSON structure...');
        var analysisResult = analyzeJSONStructure(g_domViz_currentDOMStructure);

        if (analysisResult && !analysisResult.error) {
            var analysisDisplay = generateAnalysisDisplay(analysisResult);
            if (g_domViz_exportDisplay) {
                g_domViz_exportDisplay.text = analysisDisplay;
            }
            updateStatus('JSON analysis completed');
            logInfo('JSON analysis completed successfully', 'analysis');
        } else {
            updateStatus('JSON analysis failed: ' + (analysisResult ? analysisResult.error : 'analysis failed'));
            logError('JSON analysis failed', 'analysis');
        }

    } catch (exc) {
        logError('JSON analysis error: ' + exc.message, 'analysis');
        updateStatus('JSON analysis error: ' + exc.message);
    }
}

/**
 * Generate analysis display
 */
function generateAnalysisDisplay(analysisResult) {
    try {
        var display = 'JSON STRUCTURE ANALYSIS\n';
        display += '======================\n\n';

        if (analysisResult.summary) {
            display += 'SUMMARY:\n';
            display += '- Total Properties: ' + (analysisResult.summary.totalProperties || 0) + '\n';
            display += '- Max Depth: ' + (analysisResult.summary.maxDepth || 0) + '\n';
            display += '- Data Types: ' + (analysisResult.summary.dataTypes ? analysisResult.summary.dataTypes.length : 0) + '\n\n';
        }

        if (analysisResult.patterns && analysisResult.patterns.length > 0) {
            display += 'PATTERNS FOUND:\n';
            for (var i = 0; i < Math.min(10, analysisResult.patterns.length); i++) {
                display += '- ' + analysisResult.patterns[i] + '\n';
            }
            if (analysisResult.patterns.length > 10) {
                display += '... and ' + (analysisResult.patterns.length - 10) + ' more patterns\n';
            }
        }

        return display;

    } catch (exc) {
        logError('Analysis display generation error: ' + exc.message, 'analysis');
        return 'Error generating analysis display: ' + exc.message;
    }
}

// =============================================================================
// COMPARISON OPERATIONS - UPDATED TO USE NEW LOGGING
// =============================================================================

/**
 * Take snapshot
 */
function takeSnapshot() {
    try {
        logDebug('Taking DOM snapshot', 'comparison');
        
        if (!g_domViz_currentDOMStructure) {
            updateStatus('No data to snapshot - run discovery first');
            return;
        }

        updateStatus('Taking snapshot...');
        g_domViz_beforeData = objectClone(g_domViz_currentDOMStructure, 5);
        
        if (g_domViz_comparisonDisplay) {
            g_domViz_comparisonDisplay.text = 'Snapshot taken at ' + getCurrentTimestamp() + '\n' +
                                            'Ready for comparison - make document changes and take another snapshot or load after data';
        }
        
        updateStatus('Snapshot saved as "before" data');
        logInfo('Snapshot taken successfully', 'comparison');

    } catch (exc) {
        logError('Snapshot error: ' + exc.message, 'comparison');
        updateStatus('Snapshot error: ' + exc.message);
    }
}

/**
 * Load before JSON
 */
function loadBeforeJSON() {
    try {
        logDebug('Loading before JSON file', 'comparison');
        
        var file = File.openDialog('Select Before JSON file', '*.json');
        if (!file) return;

        updateStatus('Loading before JSON...');
        
        file.open('r');
        var jsonContent = file.read();
        file.close();

        var parsedData = safeJSONParse(jsonContent);
        if (parsedData) {
            g_domViz_beforeData = parsedData;
            updateStatus('Before JSON loaded: ' + file.name);
            logInfo('Before JSON loaded successfully: ' + file.name, 'comparison');
        } else {
            updateStatus('Failed to parse before JSON file');
            logError('Failed to parse before JSON file', 'comparison');
        }

    } catch (exc) {
        logError('Load before JSON error: ' + exc.message, 'comparison');
        updateStatus('Load before JSON error: ' + exc.message);
    }
}

/**
 * Load after JSON
 */
function loadAfterJSON() {
    try {
        logDebug('Loading after JSON file', 'comparison');
        
        var file = File.openDialog('Select After JSON file', '*.json');
        if (!file) return;

        updateStatus('Loading after JSON...');
        
        file.open('r');
        var jsonContent = file.read();
        file.close();

        var parsedData = safeJSONParse(jsonContent);
        if (parsedData) {
            g_domViz_afterData = parsedData;
            updateStatus('After JSON loaded: ' + file.name);
            logInfo('After JSON loaded successfully: ' + file.name, 'comparison');
        } else {
            updateStatus('Failed to parse after JSON file');
            logError('Failed to parse after JSON file', 'comparison');
        }

    } catch (exc) {
        logError('Load after JSON error: ' + exc.message, 'comparison');
        updateStatus('Load after JSON error: ' + exc.message);
    }
}

/**
 * Perform comparison
 */
function performComparison() {
    try {
        logDebug('Starting DOM comparison', 'comparison');
        
        if (!g_domViz_beforeData) {
            updateStatus('No before data - take snapshot or load before JSON first');
            return;
        }

        // Use current structure as after data if no after data loaded
        var afterData = g_domViz_afterData || g_domViz_currentDOMStructure;
        if (!afterData) {
            updateStatus('No after data - run discovery or load after JSON');
            return;
        }

        // Check dependencies
        if (!functionExists('compareDOMStructures')) {
            updateStatus('Comparison unavailable - DOM comparator module missing');
            logWarn('compareDOMStructures function not available', 'comparison');
            return;
        }

        updateStatus('Comparing DOM structures...');
        var comparisonResult = compareDOMStructures(g_domViz_beforeData, afterData);

        if (comparisonResult && !comparisonResult.error) {
            var comparisonDisplay = generateComparisonDisplay(comparisonResult);
            if (g_domViz_comparisonDisplay) {
                g_domViz_comparisonDisplay.text = comparisonDisplay;
            }
            updateStatus('Comparison completed');
            logInfo('DOM comparison completed successfully', 'comparison');
        } else {
            updateStatus('Comparison failed: ' + (comparisonResult ? comparisonResult.error : 'comparison failed'));
            logError('DOM comparison failed', 'comparison');
        }

    } catch (exc) {
        logError('Comparison error: ' + exc.message, 'comparison');
        updateStatus('Comparison error: ' + exc.message);
    }
}

/**
 * Generate comparison display
 */
function generateComparisonDisplay(comparisonResult) {
    try {
        var display = 'DOM COMPARISON RESULTS\n';
        display += '=====================\n\n';

        if (comparisonResult.summary) {
            display += 'SUMMARY:\n';
            display += '- Added Nodes: ' + (comparisonResult.summary.added || 0) + '\n';
            display += '- Removed Nodes: ' + (comparisonResult.summary.removed || 0) + '\n';
            display += '- Modified Nodes: ' + (comparisonResult.summary.modified || 0) + '\n';
            display += '- Unchanged Nodes: ' + (comparisonResult.summary.unchanged || 0) + '\n\n';
        }

        if (comparisonResult.changes && comparisonResult.changes.length > 0) {
            display += 'CHANGES DETECTED:\n';
            var maxChanges = Math.min(20, comparisonResult.changes.length);
            for (var i = 0; i < maxChanges; i++) {
                var change = comparisonResult.changes[i];
                display += '- ' + (change.type || 'unknown') + ': ' + (change.path || 'unknown path') + '\n';
            }
            if (comparisonResult.changes.length > maxChanges) {
                display += '... and ' + (comparisonResult.changes.length - maxChanges) + ' more changes\n';
            }
        } else {
            display += 'No changes detected\n';
        }

        return display;

    } catch (exc) {
        logError('Comparison display generation error: ' + exc.message, 'comparison');
        return 'Error generating comparison display: ' + exc.message;
    }
}

// =============================================================================
// DEEP MAPPING OPERATIONS - UPDATED TO USE NEW LOGGING
// =============================================================================

/**
 * Perform deep mapping
 */
function performDeepMapping() {
    try {
        logDebug('Starting deep mapping', 'mapping');
        
        if (!g_domViz_currentDOMStructure) {
            updateStatus('No data for deep mapping - run discovery first');
            return;
        }

        // Check dependencies
        if (!functionExists('createDeepMapping')) {
            updateStatus('Deep mapping unavailable - deep mapper module missing');
            logWarn('createDeepMapping function not available', 'mapping');
            return;
        }

        updateStatus('Creating deep mapping...');
        var mappingResult = createDeepMapping(g_domViz_currentDOMStructure);

        if (mappingResult && !mappingResult.error) {
            var mappingDisplay = generateDeepMappingDisplay(mappingResult);
            if (g_domViz_mappingDisplay) {
                g_domViz_mappingDisplay.text = mappingDisplay;
            }
            updateStatus('Deep mapping completed');
            logInfo('Deep mapping completed successfully', 'mapping');
        } else {
            updateStatus('Deep mapping failed: ' + (mappingResult ? mappingResult.error : 'mapping failed'));
            logError('Deep mapping failed', 'mapping');
        }

    } catch (exc) {
        logError('Deep mapping error: ' + exc.message, 'mapping');
        updateStatus('Deep mapping error: ' + exc.message);
    }
}

/**
 * Generate object atlas
 */
function generateObjectAtlas() {
    try {
        logDebug('Generating object atlas', 'mapping');
        
        if (!g_domViz_currentDOMStructure) {
            updateStatus('No data for atlas - run discovery first');
            return;
        }

        updateStatus('Generating object atlas...');
        
        // Simple atlas generation
        var atlas = 'OBJECT ATLAS\n';
        atlas += '============\n\n';
        
        if (g_domViz_currentDOMStructure.nodes) {
            var objectTypes = {};
            for (var i = 0; i < g_domViz_currentDOMStructure.nodes.length; i++) {
                var node = g_domViz_currentDOMStructure.nodes[i];
                var type = node.type || 'unknown';
                objectTypes[type] = (objectTypes[type] || 0) + 1;
            }
            
            atlas += 'OBJECT TYPE DISTRIBUTION:\n';
            for (var objType in objectTypes) {
                if (objectHasOwnProperty(objectTypes, objType)) {
                    atlas += '- ' + objType + ': ' + objectTypes[objType] + ' instances\n';
                }
            }
        }
        
        if (g_domViz_mappingDisplay) {
            g_domViz_mappingDisplay.text = atlas;
        }
        
        updateStatus('Object atlas generated');
        logInfo('Object atlas generated successfully', 'mapping');

    } catch (exc) {
        logError('Object atlas error: ' + exc.message, 'mapping');
        updateStatus('Object atlas error: ' + exc.message);
    }
}

/**
 * Optimize performance
 */
function optimizePerformance() {
    try {
        logDebug('Optimizing performance', 'performance');
        updateStatus('Running performance optimization...');

        // Simple optimization - cleanup memory
        memoryCleanup();
        
        // Reset displays to free memory
        if (g_domViz_discoveryDisplay) {
            g_domViz_discoveryDisplay.text = '';
        }
        if (g_domViz_exportDisplay) {
            g_domViz_exportDisplay.text = '';
        }
        
        updateStatus('Performance optimization completed');
        logInfo('Performance optimization completed', 'performance');

    } catch (exc) {
        logError('Performance optimization error: ' + exc.message, 'performance');
        updateStatus('Performance optimization error: ' + exc.message);
    }
}

/**
 * Generate deep mapping display
 */
function generateDeepMappingDisplay(mappingResult) {
    try {
        var display = 'DEEP MAPPING RESULTS\n';
        display += '===================\n\n';

        if (mappingResult.summary) {
            display += 'MAPPING SUMMARY:\n';
            display += '- Total Paths: ' + (mappingResult.summary.totalPaths || 0) + '\n';
            display += '- Unique Types: ' + (mappingResult.summary.uniqueTypes || 0) + '\n';
            display += '- Max Depth: ' + (mappingResult.summary.maxDepth || 0) + '\n\n';
        }

        if (mappingResult.mappings && mappingResult.mappings.length > 0) {
            display += 'PATH MAPPINGS:\n';
            var maxMappings = Math.min(15, mappingResult.mappings.length);
            for (var i = 0; i < maxMappings; i++) {
                var mapping = mappingResult.mappings[i];
                display += '- ' + (mapping.path || 'unknown') + ' → ' + (mapping.type || 'unknown') + '\n';
            }
            if (mappingResult.mappings.length > maxMappings) {
                display += '... and ' + (mappingResult.mappings.length - maxMappings) + ' more mappings\n';
            }
        }

        return display;

    } catch (exc) {
        logError('Deep mapping display generation error: ' + exc.message, 'mapping');
        return 'Error generating mapping display: ' + exc.message;
    }
}

// =============================================================================
// CONFIGURATION - FIXED SETTINGS UI BUG
// =============================================================================

/**
 * Show configuration dialog - FIXED: Updated to use g_loggingConfig
 */
function showConfigurationDialog() {
    try {
        // Initialize logging config if needed (CRITICAL FIX)
        if (!g_loggingConfig) {
            initializeLoggingConfig();
        }
        
        // Create simple base dialog
        var configDialog = new Window('dialog', 'DOM Visualizer Configuration');
        if (!configDialog) return;

        configDialog.orientation = 'column';
        configDialog.alignChildren = 'fill';
        configDialog.spacing = 10;
        configDialog.margins = 15;
        configDialog.preferredSize.width = 600;
        configDialog.preferredSize.height = 600;

        // Create tabs programmatically
        var configTabs = configDialog.add('tabbedpanel');
        if (configTabs) {
            configTabs.alignChildren = 'fill';
            configTabs.preferredSize.height = 500;

            // Enumeration tab
            var enumTab = configTabs.add('tab', undefined, 'Enumeration');
            var maxDepthEdit, timeoutEdit;
            if (enumTab) {
                enumTab.orientation = 'column';
                enumTab.alignChildren = 'left';
                enumTab.spacing = 5;

                enumTab.add('statictext', undefined, 'Enumeration Settings:');

                var maxDepthGroup = enumTab.add('group');
                if (maxDepthGroup) {
                    maxDepthGroup.add('statictext', undefined, 'Max Depth:');
                    maxDepthEdit = maxDepthGroup.add('edittext', undefined, String(g_domViz_userConfiguration.enumeration.maxDepth));
                    maxDepthEdit.preferredSize.width = 60;
                }

                var timeoutGroup = enumTab.add('group');
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

            // FIXED: Logging tab (replaces debug tab)
            var loggingTab = configTabs.add('tab', undefined, 'Logging');
            var masterEnabledCheck, debugLevelCheck, infoLevelCheck, warnLevelCheck, errorLevelCheck;
            var enumCategoryCheck, samplingCategoryCheck, displayCategoryCheck, exportDataCategoryCheck, performanceCategoryCheck;
            if (loggingTab) {
                loggingTab.orientation = 'column';
                loggingTab.alignChildren = 'left';
                loggingTab.spacing = 8;

                // Master logging control
                loggingTab.add('statictext', undefined, 'Logging Controls:');
                masterEnabledCheck = loggingTab.add('checkbox', undefined, 'Enable Logging');
                masterEnabledCheck.value = g_loggingConfig ? g_loggingConfig.enabled : true;
                
                // Level controls
                var levelGroup = loggingTab.add('group');
                levelGroup.orientation = 'column';
                levelGroup.alignChildren = 'left';
                levelGroup.add('statictext', undefined, 'Log Levels:');
                
                debugLevelCheck = levelGroup.add('checkbox', undefined, 'DEBUG Messages');
                debugLevelCheck.value = g_loggingConfig ? g_loggingConfig.levels.DEBUG : false;
                
                infoLevelCheck = levelGroup.add('checkbox', undefined, 'INFO Messages');  
                infoLevelCheck.value = g_loggingConfig ? g_loggingConfig.levels.INFO : true;
                
                warnLevelCheck = levelGroup.add('checkbox', undefined, 'WARN Messages');
                warnLevelCheck.value = g_loggingConfig ? g_loggingConfig.levels.WARN : true;
                
                errorLevelCheck = levelGroup.add('checkbox', undefined, 'ERROR Messages');
                errorLevelCheck.value = g_loggingConfig ? g_loggingConfig.levels.ERROR : true;
                
                // Category controls
                var categoryGroup = loggingTab.add('group');
                categoryGroup.orientation = 'column';
                categoryGroup.alignChildren = 'left';
                categoryGroup.add('statictext', undefined, 'Categories:');
                
                enumCategoryCheck = categoryGroup.add('checkbox', undefined, 'Enumeration');
                enumCategoryCheck.value = g_loggingConfig ? g_loggingConfig.categories.enumeration : true;
                
                samplingCategoryCheck = categoryGroup.add('checkbox', undefined, 'Sampling');
                samplingCategoryCheck.value = g_loggingConfig ? g_loggingConfig.categories.sampling : true;
                
                displayCategoryCheck = categoryGroup.add('checkbox', undefined, 'Display Updates');
                displayCategoryCheck.value = g_loggingConfig ? g_loggingConfig.categories.display : true;
                
                exportDataCategoryCheck = categoryGroup.add('checkbox', undefined, 'Export Operations');
                exportDataCategoryCheck.value = g_loggingConfig ? g_loggingConfig.categories.exportData : true;
                
                performanceCategoryCheck = categoryGroup.add('checkbox', undefined, 'Performance');
                performanceCategoryCheck.value = g_loggingConfig ? g_loggingConfig.categories.performance : true;
            }
        }

        // Button group
        var buttonGroup = configDialog.add('group');
        if (buttonGroup) {
            buttonGroup.orientation = 'row';
            buttonGroup.alignment = 'center';
            buttonGroup.spacing = 10;

            var okBtn = buttonGroup.add('button', undefined, 'OK');
            if (okBtn) {
                okBtn.onClick = function () {
                    // FIXED: Save configuration values to CORRECT objects
                    try {
                        // Read the configuration values from the edit fields
                        var newMaxDepth = safeParseInt(maxDepthEdit.text) || 4;
                        var newTimeout = safeParseInt(timeoutEdit.text) || 15000;
                        var newMaxSamples = safeParseInt(maxSamplesEdit.text) || 20;

                        // Update the global configuration
                        g_domViz_userConfiguration.enumeration.maxDepth = newMaxDepth;
                        g_domViz_userConfiguration.enumeration.timeoutMs = newTimeout;
                        g_domViz_userConfiguration.sampling.maxSamples = newMaxSamples;
                        
                        // CRITICAL FIX: Save logging settings to g_loggingConfig (not legacy config)
                        if (!g_loggingConfig) {
                            initializeLoggingConfig();
                        }
                        
                        g_loggingConfig.enabled = masterEnabledCheck.value;
                        g_loggingConfig.levels.DEBUG = debugLevelCheck.value;
                        g_loggingConfig.levels.INFO = infoLevelCheck.value;
                        g_loggingConfig.levels.WARN = warnLevelCheck.value;
                        g_loggingConfig.levels.ERROR = errorLevelCheck.value;
                        g_loggingConfig.categories.enumeration = enumCategoryCheck.value;
                        g_loggingConfig.categories.sampling = samplingCategoryCheck.value;
                        g_loggingConfig.categories.display = displayCategoryCheck.value;
                        g_loggingConfig.categories.exportData = exportDataCategoryCheck.value;
                        g_loggingConfig.categories.performance = performanceCategoryCheck.value;

                        // Verify settings were saved (BUG FIX VERIFICATION)
                        logInfo('Logging configuration updated - DEBUG: ' + 
                               (g_loggingConfig.levels.DEBUG ? 'ON' : 'OFF'), 'general');

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
        logError('Configuration dialog error: ' + exc.message, 'general');
    }
}

// =============================================================================
// UTILITY FUNCTIONS - UPDATED TO USE NEW LOGGING
// =============================================================================

/**
 * Update document info
 */
function updateDocumentInfo() {
    try {
        var envValidation = validateInDesignEnvironment();
        
        if (envValidation.valid && envValidation.document) {
            var docName = envValidation.document.name || 'Untitled';
            var pageCount = envValidation.document.pages.length || 0;
            g_domViz_documentInfo.text = 'Document: ' + docName + ' (' + pageCount + ' pages)';
            logDebug('Document info updated: ' + docName, 'general');
        } else {
            g_domViz_documentInfo.text = 'Document: [No valid document]';
            logDebug('No valid document found', 'general');
        }

    } catch (exc) {
        if (g_domViz_documentInfo) {
            g_domViz_documentInfo.text = 'Document: [Error reading document info]';
        }
        logError('Document info update error: ' + exc.message, 'general');
    }
}

/**
 * Update status
 */
function updateStatus(message) {
    try {
        if (g_domViz_statusText) {
            g_domViz_statusText.text = message;
        }
        
        // Also log status updates if debugging is enabled
        if (isDebugEnabled('general')) {
            logDebug('Status: ' + message, 'general');
        }

    } catch (exc) {
        // Fallback to direct output
        logError('Status update error: ' + exc.message, 'general');
    }
}

/**
 * Reset visualizer
 */
function resetVisualizer() {
    try {
        logDebug('Resetting visualizer', 'general');
        
        // Clear all data
        g_domViz_currentDOMStructure = null;
        g_domViz_beforeData = null;
        g_domViz_afterData = null;
        g_domViz_exportData = [];

        // Clear all displays
        if (g_domViz_discoveryDisplay) {
            g_domViz_discoveryDisplay.text = '';
        }
        if (g_domViz_exportDisplay) {
            g_domViz_exportDisplay.text = '';
        }
        if (g_domViz_comparisonDisplay) {
            g_domViz_comparisonDisplay.text = '';
        }
        if (g_domViz_mappingDisplay) {
            g_domViz_mappingDisplay.text = '';
        }

        // Reset configuration
        g_domViz_userConfiguration = objectClone(DEFAULT_VISUALIZER_CONFIG, 4);

        updateStatus('Visualizer reset - all data cleared');
        logInfo('Visualizer reset completed', 'general');

    } catch (exc) {
        logError('Reset error: ' + exc.message, 'general');
        updateStatus('Reset error: ' + exc.message);
    }
}

/**
 * Show help
 */
function showHelp() {
    try {
        var helpText = 'InDesign DOM Discovery Builder v3.1 - Help\n\n';
        helpText += 'BASIC USAGE:\n';
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
        g_domViz_exportData = [];
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

        logInfo('DOM Visualizer closed', 'general');

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
    'clearDiscoveryDisplay',

    // Export Operations
    'exportAsJSON', 'exportAsText', 'exportAsCSV', 'analyzeCurrentJSON', 'generateAnalysisDisplay',

    // Comparison Operations
    'loadBeforeJSON', 'loadAfterJSON', 'performComparison', 'generateComparisonDisplay', 'takeSnapshot',

    // Deep Mapping Operations
    'performDeepMapping', 'generateObjectAtlas', 'optimizePerformance', 'generateDeepMappingDisplay',

    // Configuration - FIXED
    'showConfigurationDialog',

    // Utility Functions
    'updateDocumentInfo', 'updateStatus', 'resetVisualizer', 'showHelp', 'closeVisualizer'
]);

// =============================================================================
// END OF 5.2_dom-visualizer.jsx - FIXED SETTINGS UI BUG
// =============================================================================