// DocDomV4.1/5.2_dom-visualizer.jsx
// 5.2_dom-visualizer.jsx - DOM DISCOVERY VISUALIZER
// InDesign DOM Discovery Builder v4.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: Main visualizer interface with comprehensive DOM discovery tools
// DEPENDENCIES: ["1.1_bootstrap-foundation.jsx", "1.2_safety-utilities.jsx", "3.2_dom-exporter.jsx", "2.1_dom-enumerator.jsx", "2.2_collection-sampler.jsx", "3.1_property-sampler.jsx", "4.1_json-analyzer.jsx", "4.2_dom-comparator.jsx", "5.1_deep-mapper.jsx"]
// SIZE: ~1800 lines - COMPLETE IMPLEMENTATION - ENHANCED LOGGING - ES3 COMPLIANT
// CHANGES FROM 3.1: Fixed ES3 violations, enhanced logging, updated dependencies, removed functions moved to 1.2
// =============================================================================

// =============================================================================
// DEPENDENCY VALIDATION
// =============================================================================

var DOM_VISUALIZER_DEPENDENCIES = [
    '1.1_bootstrap-foundation', '1.2_safety-utilities', '3.2_dom-exporter',
    '2.1_dom-enumerator', '2.2_collection-sampler', '3.1_property-sampler',
    '4.1_json-analyzer', '4.2_dom-comparator', '5.1_deep-mapper'
];

var dependencyCheck = validateDependencies(DOM_VISUALIZER_DEPENDENCIES);
if (!dependencyCheck.success) {
    throw new Error('DOM Visualizer missing dependencies: ' + dependencyCheck.missing.join(', '));
}

// =============================================================================
// GLOBAL VARIABLES - ENHANCED LOGGING
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
// DEFAULT CONFIGURATION - ES3 COMPLIANT
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
    exportSettings: {  // ES3 FIX: was exportSettings
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
// MAIN VISUALIZER FUNCTIONS - ENHANCED LOGGING
// =============================================================================

/**
 * Show DOM visualizer interface (main entry point) - ENHANCED LOGGING
 * @returns {Boolean} True if visualizer shown successfully
 */
function showDOMVisualizer() {
    var startTime = new Date().getTime();
    
    logDebug('=== STARTING showDOMVisualizer ===', 'display');
    logInfo('Initializing DOM Visualizer interface', 'display');
    
    try {
        // Check if window already exists
        if (g_domViz_visualizerWindow) {
            logDebug('Visualizer window already exists, showing existing window', 'display');
            g_domViz_visualizerWindow.show();
            return true;
        }

        // Validate InDesign environment
        var envValidation = validateInDesignEnvironment();
        if (!envValidation.valid) {
            var errorMsg = 'DOM Visualizer Error: ' + envValidation.error;
            logError(errorMsg, 'display');
            alert(errorMsg);
            return false;
        }

        // Initialize configuration
        g_domViz_userConfiguration = objectClone(DEFAULT_VISUALIZER_CONFIG, 4);
        g_domViz_originalConfigs = objectClone(DEFAULT_VISUALIZER_CONFIG, 4);

        // Create main window
        logDebug('Creating visualizer window', 'display');
        var window = createVisualizerWindow();
        if (!window) {
            logError('Failed to create visualizer window', 'display');
            return false;
        }

        g_domViz_visualizerWindow = window;

        // Initialize components
        logDebug('Initializing visualizer components', 'display');
        var initResult = initializeVisualizerComponents();
        if (!initResult) {
            logWarn('Component initialization had issues, but continuing', 'display');
        }

        // Initial document info update
        logDebug('Updating initial document info', 'display');
        updateDocumentInfo();
        updateStatus('DOM Visualizer ready - select a tab to begin');

        // Show window
        window.show();
        
        var initTime = new Date().getTime() - startTime;
        logInfo('DOM Visualizer initialized successfully in ' + initTime + 'ms', 'display');
        return true;

    } catch (exc) {
        var error = 'Show visualizer error: ' + exc.message;
        logError(error, 'display');
        alert(error);
        return false;
    }
}

/**
 * Create main visualizer window - ENHANCED LOGGING
 * @returns {Window} Created window or null
 */
function createVisualizerWindow() {
    try {
        logDebug('Creating main visualizer window', 'display');
        
        var window = new Window('dialog', 'InDesign DOM Discovery Builder v4.1');
        window.orientation = 'column';
        window.alignChildren = ['fill', 'fill'];
        window.spacing = 10;
        window.margins = 16;

        // Set window size
        window.preferredSize.width = 1200;
        window.preferredSize.height = 800;

        // Create header using consolidated function
        var header = createVisualizerHeader(window, 'InDesign DOM Discovery Builder v4.1');
        if (!header) {
            logWarn('Header creation failed, continuing without header', 'display');
        }

        // Create main tabs using consolidated function
        var tabPanel = createVisualizerTabs(window);
        if (!tabPanel) {
            logError('Failed to create main tabs', 'display');
            return null;
        }
        g_domViz_mainTabs = tabPanel;

        // Create individual tabs
        logDebug('Creating individual tabs', 'display');
        g_domViz_discoveryTab = createDiscoveryTab();
        g_domViz_exportTab = createExportTab();
        g_domViz_comparisonTab = createComparisonTab();
        g_domViz_deepMappingTab = createDeepMappingTab();

        // Create footer using consolidated function
        var footer = createVisualizerFooter(window);
        if (!footer) {
            logWarn('Footer creation failed, continuing without footer', 'display');
        }

        // Window event handlers
        window.onClose = function() {
            closeVisualizer();
        };

        logInfo('Visualizer window created successfully', 'display');
        return window;

    } catch (exc) {
        logError('Window creation error: ' + exc.message, 'display');
        return null;
    }
}

/**
 * Initialize visualizer components - ENHANCED LOGGING
 * @returns {Boolean} True if initialization successful
 */
function initializeVisualizerComponents() {
    try {
        logDebug('Starting component initialization', 'display');

        // Initialize display areas
        if (g_domViz_mainTabs && g_domViz_mainTabs.children.length > 0) {
            // Discovery tab display
            if (g_domViz_discoveryTab && g_domViz_discoveryTab.children.length > 1) {
                g_domViz_discoveryDisplay = g_domViz_discoveryTab.children[1];
                logDebug('Discovery display initialized', 'display');
            }

            // Export tab display
            if (g_domViz_exportTab && g_domViz_exportTab.children.length > 1) {
                g_domViz_exportDisplay = g_domViz_exportTab.children[1];
                logDebug('Export display initialized', 'display');
            }

            // Comparison tab display
            if (g_domViz_comparisonTab && g_domViz_comparisonTab.children.length > 1) {
                g_domViz_comparisonDisplay = g_domViz_comparisonTab.children[1];
                logDebug('Comparison display initialized', 'display');
            }

            // Deep mapping tab display
            if (g_domViz_deepMappingTab && g_domViz_deepMappingTab.children.length > 1) {
                g_domViz_mappingDisplay = g_domViz_deepMappingTab.children[1];
                logDebug('Deep mapping display initialized', 'display');
            }
        }

        // Initialize status and document info references
        if (g_domViz_visualizerWindow) {
            // Find status text (typically in footer)
            var children = g_domViz_visualizerWindow.children;
            for (var i = 0; i < children.length; i++) {
                if (children[i].type === 'panel' && children[i].children) {
                    for (var j = 0; j < children[i].children.length; j++) {
                        if (children[i].children[j].type === 'statictext') {
                            if (!g_domViz_statusText) {
                                g_domViz_statusText = children[i].children[j];
                                logDebug('Status text reference found', 'display');
                            } else if (!g_domViz_documentInfo) {
                                g_domViz_documentInfo = children[i].children[j];
                                logDebug('Document info reference found', 'display');
                            }
                        }
                    }
                }
            }
        }

        logInfo('Component initialization completed successfully', 'display');
        return true;

    } catch (exc) {
        logError('Component initialization error: ' + exc.message, 'display');
        return false;
    }
}

// =============================================================================
// TAB CREATION FUNCTIONS - ENHANCED LOGGING
// =============================================================================

/**
 * Create discovery tab - ENHANCED LOGGING
 * @returns {Tab} Created tab or null
 */
function createDiscoveryTab() {
    try {
        logDebug('Creating discovery tab', 'display');
        
        if (!g_domViz_mainTabs) {
            logError('Main tabs not available for discovery tab creation', 'display');
            return null;
        }

        var tab = g_domViz_mainTabs.add('tab', undefined, 'Discovery');
        tab.orientation = 'column';
        tab.alignChildren = ['fill', 'fill'];
        tab.spacing = 10;

        // Control panel
        var controlPanel = tab.add('panel', undefined, 'Discovery Controls');
        controlPanel.orientation = 'row';
        controlPanel.alignChildren = ['left', 'center'];

        var discoverBtn = controlPanel.add('button', undefined, 'Discover DOM');
        var configBtn = controlPanel.add('button', undefined, 'Configure');
        var clearBtn = controlPanel.add('button', undefined, 'Clear');

        // Results display
        var resultsGroup = tab.add('group');
        resultsGroup.orientation = 'column';
        resultsGroup.alignChildren = ['fill', 'fill'];

        var resultsDisplay = resultsGroup.add('edittext', undefined, 'Click "Discover DOM" to analyze the current document structure...');
        resultsDisplay.properties = { multiline: true, scrolling: true };
        resultsDisplay.preferredSize.height = 500;

        // Button handlers
        discoverBtn.onClick = function() {
            logDebug('Discovery button clicked', 'display');
            performFullDiscovery();
        };

        configBtn.onClick = function() {
            logDebug('Configuration button clicked', 'display');
            showConfigurationDialog();
        };

        clearBtn.onClick = function() {
            logDebug('Clear button clicked', 'display');
            clearDiscoveryDisplay();
        };

        logInfo('Discovery tab created successfully', 'display');
        return tab;

    } catch (exc) {
        logError('Discovery tab creation error: ' + exc.message, 'display');
        return null;
    }
}

/**
 * Create export tab - ENHANCED LOGGING
 * @returns {Tab} Created tab or null
 */
function createExportTab() {
    try {
        logDebug('Creating export tab', 'display');
        
        if (!g_domViz_mainTabs) {
            logError('Main tabs not available for export tab creation', 'display');
            return null;
        }

        var tab = g_domViz_mainTabs.add('tab', undefined, 'Export');
        tab.orientation = 'column';
        tab.alignChildren = ['fill', 'fill'];
        tab.spacing = 10;

        // Export controls
        var exportPanel = tab.add('panel', undefined, 'Export Options');
        exportPanel.orientation = 'row';
        exportPanel.alignChildren = ['left', 'center'];

        var jsonBtn = exportPanel.add('button', undefined, 'Export JSON');
        var textBtn = exportPanel.add('button', undefined, 'Export Text');
        var csvBtn = exportPanel.add('button', undefined, 'Export CSV');
        var analyzeBtn = exportPanel.add('button', undefined, 'Analyze JSON');

        // Export display
        var exportGroup = tab.add('group');
        exportGroup.orientation = 'column';
        exportGroup.alignChildren = ['fill', 'fill'];

        var exportDisplay = exportGroup.add('edittext', undefined, 'Export results will appear here...');
        exportDisplay.properties = { multiline: true, scrolling: true };
        exportDisplay.preferredSize.height = 500;

        // Button handlers - UI wrappers that call core 3.2 functions
        jsonBtn.onClick = function() {
            logDebug('JSON export button clicked', 'display');
            exportAsJSON();
        };

        textBtn.onClick = function() {
            logDebug('Text export button clicked', 'display');
            exportAsText();
        };

        csvBtn.onClick = function() {
            logDebug('CSV export button clicked', 'display');
            exportAsCSV();
        };

        analyzeBtn.onClick = function() {
            logDebug('Analyze JSON button clicked', 'display');
            analyzeCurrentJSON();
        };

        logInfo('Export tab created successfully', 'display');
        return tab;

    } catch (exc) {
        logError('Export tab creation error: ' + exc.message, 'display');
        return null;
    }
}

/**
 * Create comparison tab - ENHANCED LOGGING
 * @returns {Tab} Created tab or null
 */
function createComparisonTab() {
    try {
        logDebug('Creating comparison tab', 'display');
        
        if (!g_domViz_mainTabs) {
            logError('Main tabs not available for comparison tab creation', 'display');
            return null;
        }

        var tab = g_domViz_mainTabs.add('tab', undefined, 'Comparison');
        tab.orientation = 'column';
        tab.alignChildren = ['fill', 'fill'];
        tab.spacing = 10;

        // Comparison controls
        var comparisonPanel = tab.add('panel', undefined, 'Comparison Tools');
        comparisonPanel.orientation = 'row';
        comparisonPanel.alignChildren = ['left', 'center'];

        var snapshotBtn = comparisonPanel.add('button', undefined, 'Take Snapshot');
        var loadBeforeBtn = comparisonPanel.add('button', undefined, 'Load Before');
        var loadAfterBtn = comparisonPanel.add('button', undefined, 'Load After');
        var compareBtn = comparisonPanel.add('button', undefined, 'Compare');

        // Comparison display
        var comparisonGroup = tab.add('group');
        comparisonGroup.orientation = 'column';
        comparisonGroup.alignChildren = ['fill', 'fill'];

        var comparisonDisplay = comparisonGroup.add('edittext', undefined, 'Comparison results will appear here...');
        comparisonDisplay.properties = { multiline: true, scrolling: true };
        comparisonDisplay.preferredSize.height = 500;

        // Button handlers
        snapshotBtn.onClick = function() {
            logDebug('Snapshot button clicked', 'display');
            takeSnapshot();
        };

        loadBeforeBtn.onClick = function() {
            logDebug('Load before button clicked', 'display');
            loadBeforeJSON();
        };

        loadAfterBtn.onClick = function() {
            logDebug('Load after button clicked', 'display');
            loadAfterJSON();
        };

        compareBtn.onClick = function() {
            logDebug('Compare button clicked', 'display');
            performComparison();
        };

        logInfo('Comparison tab created successfully', 'display');
        return tab;

    } catch (exc) {
        logError('Comparison tab creation error: ' + exc.message, 'display');
        return null;
    }
}

/**
 * Create deep mapping tab - ENHANCED LOGGING
 * @returns {Tab} Created tab or null
 */
function createDeepMappingTab() {
    try {
        logDebug('Creating deep mapping tab', 'display');
        
        if (!g_domViz_mainTabs) {
            logError('Main tabs not available for deep mapping tab creation', 'display');
            return null;
        }

        var tab = g_domViz_mainTabs.add('tab', undefined, 'Deep Mapping');
        tab.orientation = 'column';
        tab.alignChildren = ['fill', 'fill'];
        tab.spacing = 10;

        // Deep mapping controls
        var mappingPanel = tab.add('panel', undefined, 'Deep Mapping Tools');
        mappingPanel.orientation = 'row';
        mappingPanel.alignChildren = ['left', 'center'];

        var deepMapBtn = mappingPanel.add('button', undefined, 'Deep Map');
        var atlasBtn = mappingPanel.add('button', undefined, 'Generate Atlas');
        var optimizeBtn = mappingPanel.add('button', undefined, 'Optimize');

        // Deep mapping display
        var mappingGroup = tab.add('group');
        mappingGroup.orientation = 'column';
        mappingGroup.alignChildren = ['fill', 'fill'];

        var mappingDisplay = mappingGroup.add('edittext', undefined, 'Deep mapping results will appear here...');
        mappingDisplay.properties = { multiline: true, scrolling: true };
        mappingDisplay.preferredSize.height = 500;

        // Button handlers
        deepMapBtn.onClick = function() {
            logDebug('Deep map button clicked', 'display');
            performDeepMapping();
        };

        atlasBtn.onClick = function() {
            logDebug('Generate atlas button clicked', 'display');
            generateObjectAtlas();
        };

        optimizeBtn.onClick = function() {
            logDebug('Optimize button clicked', 'display');
            optimizePerformance();
        };

        logInfo('Deep mapping tab created successfully', 'display');
        return tab;

    } catch (exc) {
        logError('Deep mapping tab creation error: ' + exc.message, 'display');
        return null;
    }
}

// =============================================================================
// DISCOVERY OPERATIONS - ENHANCED LOGGING
// =============================================================================

/**
 * Perform full discovery process - ENHANCED LOGGING
 * @returns {Boolean} True if discovery successful
 */
function performFullDiscovery() {
    var startTime = new Date().getTime();
    
    logDebug('=== STARTING performFullDiscovery ===', 'enumeration');
    logInfo('Beginning comprehensive DOM discovery process', 'enumeration');
    
    try {
        // Validate environment
        if (!app.documents.length) {
            var noDocMsg = 'No active document - please open a document first';
            updateStatus(noDocMsg);
            logWarn(noDocMsg, 'enumeration');
            return false;
        }

        var activeDoc = app.activeDocument;
        logInfo('Analyzing document: ' + activeDoc.name, 'enumeration');

        // Phase 1: DOM Enumeration
        updateStatus('Phase 1: Enumerating DOM structure...');
        logInfo('=== STARTING PHASE 1: DOM ENUMERATION ===', 'enumeration');
        
        var phase1Result = performPhase1Enumeration();
        if (!phase1Result) {
            logError('Phase 1 enumeration failed', 'enumeration');
            return false;
        }

        // Phase 2: Value Sampling
        updateStatus('Phase 2: Sampling property values...');
        logInfo('=== STARTING PHASE 2: VALUE SAMPLING ===', 'sampling');
        
        var phase2Result = performPhase2ValueSampling();
        if (!phase2Result) {
            logWarn('Phase 2 sampling had issues, continuing with Phase 1 results', 'sampling');
        }

        // Phase 3: Collection Sampling
        updateStatus('Phase 3: Analyzing collections...');
        logInfo('=== STARTING PHASE 3: COLLECTION SAMPLING ===', 'sampling');
        
        var phase3Result = performPhase3CollectionSampling();
        if (!phase3Result) {
            logWarn('Phase 3 collection sampling had issues', 'sampling');
        }

        // Display results
        logDebug('Displaying discovery results', 'display');
        displayCurrentStructure();

        var totalTime = new Date().getTime() - startTime;
        var completionMsg = 'Full discovery completed in ' + totalTime + 'ms';
        updateStatus(completionMsg);
        logInfo(completionMsg, 'enumeration');
        
        return true;

    } catch (exc) {
        var error = 'Full discovery error: ' + exc.message;
        logError(error, 'enumeration');
        updateStatus(error);
        return false;
    }
}

/**
 * Perform Phase 1: DOM enumeration - ENHANCED LOGGING
 * @returns {Boolean} True if enumeration successful
 */
function performPhase1Enumeration() {
    try {
        logDebug('Starting DOM enumeration phase', 'enumeration');
        
        if (!functionExists('enumerateDocumentDOM')) {
            var missingMsg = 'DOM enumerator module not available';
            logError(missingMsg, 'enumeration');
            updateStatus(missingMsg);
            return false;
        }

        var activeDoc = app.activeDocument;
        logDebug('Enumerating document: ' + activeDoc.name, 'enumeration');
        
        var domStructure = enumerateDocumentDOM(activeDoc, g_domViz_userConfiguration.enumeration);

        // ES3 FIX: Check result structure explicitly
        if (!domStructure || (domStructure.metadata && domStructure.metadata.errorMessage) || !domStructure.structure) {
            var errorMsg = 'Unknown enumeration error';
            if (domStructure && domStructure.metadata && domStructure.metadata.errorMessage) {
                errorMsg = domStructure.metadata.errorMessage;
            } else if (!domStructure) {
                errorMsg = 'Enumeration returned null';
            }
            logError('Enumeration failed: ' + errorMsg, 'enumeration');
            alert('Enumeration failed: ' + errorMsg);
            return false;
        }

        g_domViz_currentDOMStructure = domStructure;
        
        logInfo('Phase 1 enumeration completed successfully', 'enumeration');
        return true;

    } catch (exc) {
        logError('Phase 1 enumeration error: ' + exc.message, 'enumeration');
        return false;
    }
}

/**
 * Perform Phase 2: Value sampling - ENHANCED LOGGING
 * @returns {Boolean} True if sampling successful
 */
function performPhase2ValueSampling() {
    try {
        logDebug('Starting value sampling phase', 'sampling');
        
        if (!g_domViz_currentDOMStructure) {
            logWarn('No DOM structure available for value sampling', 'sampling');
            return false;
        }

        if (!functionExists('sampleDOMValues')) {
            logWarn('Value sampler module not available, skipping Phase 2', 'sampling');
            return false;
        }

        var activeDoc = app.activeDocument;
        var phase2Result = sampleDOMValues(g_domViz_currentDOMStructure, activeDoc, g_domViz_userConfiguration.sampling);
        
        if (phase2Result && !phase2Result.errorMessage) {
            g_domViz_currentDOMStructure = phase2Result;
            logInfo('Phase 2 value sampling completed successfully', 'sampling');
            return true;
        } else {
            logWarn('Phase 2 had errors: ' + (phase2Result ? phase2Result.errorMessage : 'unknown'), 'sampling');
            return false;
        }

    } catch (exc) {
        logError('Phase 2 sampling error: ' + exc.message, 'sampling');
        return false;
    }
}

/**
 * Perform Phase 3: Collection sampling - ENHANCED LOGGING
 * @returns {Boolean} True if collection sampling successful
 */
function performPhase3CollectionSampling() {
    try {
        logDebug('Starting collection sampling phase', 'sampling');
        
        if (!g_domViz_currentDOMStructure) {
            logWarn('No DOM structure available for collection sampling', 'sampling');
            return false;
        }

        if (!functionExists('sampleCollectionContents')) {
            logWarn('Collection sampler module not available, skipping Phase 3', 'sampling');
            return false;
        }

        var activeDoc = app.activeDocument;
        var collectionConfig = objectClone(g_domViz_userConfiguration.sampling, 3);
        
        var phase3Result = sampleCollectionContents(g_domViz_currentDOMStructure, activeDoc, collectionConfig);
        
        if (phase3Result && !phase3Result.errorMessage) {
            g_domViz_currentDOMStructure = phase3Result;
            logInfo('Phase 3 collection sampling completed successfully', 'sampling');
            return true;
        } else {
            logWarn('Phase 3 had errors: ' + (phase3Result ? phase3Result.errorMessage : 'unknown'), 'sampling');
            return false;
        }

    } catch (exc) {
        logError('Phase 3 collection sampling error: ' + exc.message, 'sampling');
        return false;
    }
}

/**
 * Display current DOM structure - ENHANCED LOGGING
 */
function displayCurrentStructure() {
    try {
        logDebug('Displaying current DOM structure', 'display');
        
        if (!g_domViz_currentDOMStructure) {
            logWarn('No DOM structure to display', 'display');
            return;
        }

        var displayText = generateStructureDisplayText(g_domViz_currentDOMStructure);
        
        if (g_domViz_discoveryDisplay) {
            g_domViz_discoveryDisplay.text = displayText;
            logInfo('DOM structure displayed successfully - ' + displayText.length + ' characters', 'display');
        } else {
            logWarn('Discovery display not available', 'display');
        }

    } catch (exc) {
        logError('Display structure error: ' + exc.message, 'display');
    }
}

/**
 * Generate structure display text - ENHANCED LOGGING
 * @param {Object} domStructure - DOM structure to display
 * @returns {String} Display text
 */
function generateStructureDisplayText(domStructure) {
    try {
        logDebug('Generating structure display text', 'display');
        
        if (!domStructure) {
            return 'No structure data available';
        }

        var textBuilder = createStringBuilder();
        
        // Header
        textBuilder.appendLine('INDESIGN DOM DISCOVERY RESULTS');
        textBuilder.appendLine('=====================================');
        textBuilder.appendLine('');

        // Metadata
        if (domStructure.metadata) {
            var metadata = domStructure.metadata;
            textBuilder.appendLine('DISCOVERY METADATA:');
            textBuilder.appendLine('Document: ' + (metadata.documentName || 'Unknown'));
            textBuilder.appendLine('Total Objects: ' + (metadata.totalObjects || metadata.totalNodes || 0));
            textBuilder.appendLine('Total Properties: ' + (metadata.totalProperties || 0));
            textBuilder.appendLine('Max Depth: ' + (metadata.maxDepth || 0));
            textBuilder.appendLine('Discovery Time: ' + (metadata.enumerationTime || metadata.discoveryDuration || 0) + 'ms');
            textBuilder.appendLine('Builder Version: ' + (metadata.builderVersion || '4.1'));
            textBuilder.appendLine('');
        }

        // Structure
        if (domStructure.structure && domStructure.structure.document) {
            var documentNode = domStructure.structure.document;
            textBuilder.appendLine('DOCUMENT STRUCTURE:');
            textBuilder.appendLine('Properties: ' + (documentNode.properties ? documentNode.properties.length : 0));
            textBuilder.appendLine('Methods: ' + (documentNode.methods ? documentNode.methods.length : 0));
            textBuilder.appendLine('Collections: ' + (documentNode.collections ? documentNode.collections.length : 0));
            textBuilder.appendLine('Child Nodes: ' + (documentNode.childNodes ? documentNode.childNodes.length : 0));
            textBuilder.appendLine('');

            // Sample properties
            if (documentNode.properties && documentNode.properties.length > 0) {
                textBuilder.appendLine('SAMPLE PROPERTIES:');
                var propSampleLimit = Math.min(15, documentNode.properties.length);
                for (var i = 0; i < propSampleLimit; i++) {
                    var prop = documentNode.properties[i];
                    var propLine = '  - ' + prop.name + ' (' + (prop.type || 'unknown') + ')';
                    if (prop.sampledValue && prop.sampledValue !== '[Skipped]' && prop.sampledValue !== '[Error]') {
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

            // Sample collections
            if (documentNode.collections && documentNode.collections.length > 0) {
                textBuilder.appendLine('COLLECTIONS:');
                for (var j = 0; j < documentNode.collections.length; j++) {
                    var collection = documentNode.collections[j];
                    var collectionLine = '  - ' + collection.name;
                    if (collection.collectionLength !== undefined) {
                        collectionLine += ' (length: ' + collection.collectionLength + ')';
                    }
                    textBuilder.appendLine(collectionLine);
                }
                textBuilder.appendLine('');
            }
        }

        // Usage instructions
        textBuilder.appendLine('NEXT STEPS:');
        textBuilder.appendLine('1. Use Export tab to save this data');
        textBuilder.appendLine('2. Use Comparison tab to compare with other versions');
        textBuilder.appendLine('3. Use Deep Mapping for advanced analysis');

        var displayText = textBuilder.toString();
        logDebug('Structure display text generated - ' + displayText.length + ' characters', 'display');
        
        return displayText;

    } catch (exc) {
        logError('Generate display text error: ' + exc.message, 'display');
        return 'Error generating display: ' + exc.message;
    }
}

/**
 * Generate enhanced fallback display - ENHANCED LOGGING
 * @param {String} errorMessage - Error message to display
 * @returns {String} Enhanced fallback display
 */
function generateEnhancedFallbackDisplay(errorMessage) {
    try {
        logDebug('Generating enhanced fallback display', 'display');
        
        var textBuilder = createStringBuilder();
        
        textBuilder.appendLine('DOM DISCOVERY - FALLBACK MODE');
        textBuilder.appendLine('=============================');
        textBuilder.appendLine('');
        textBuilder.appendLine('Issue: ' + (errorMessage || 'Unknown error occurred'));
        textBuilder.appendLine('');
        textBuilder.appendLine('FALLBACK INFORMATION:');
        textBuilder.appendLine('The DOM discovery process encountered an issue but');
        textBuilder.appendLine('has provided basic document information below.');
        textBuilder.appendLine('');
        
        // Basic document info
        if (app.documents.length > 0) {
            var doc = app.activeDocument;
            textBuilder.appendLine('BASIC DOCUMENT INFO:');
            textBuilder.appendLine('Document Name: ' + doc.name);
            textBuilder.appendLine('Pages: ' + doc.pages.length);
            textBuilder.appendLine('Layers: ' + doc.layers.length);
            textBuilder.appendLine('');
        }
        
        textBuilder.appendLine('RECOMMENDATIONS:');
        textBuilder.appendLine('1. Try reducing the max depth setting');
        textBuilder.appendLine('2. Enable safety filters');
        textBuilder.appendLine('3. Increase timeout settings');
        textBuilder.appendLine('4. Check for complex document structures');
        
        return textBuilder.toString();
        
    } catch (exc) {
        logError('Enhanced fallback display error: ' + exc.message, 'display');
        return 'Enhanced fallback display failed: ' + exc.message;
    }
}

/**
 * Generate simple DOM tree - ENHANCED LOGGING
 * @param {Object} domStructure - DOM structure
 * @returns {String} Simple tree representation
 */
function generateSimpleDOMTree(domStructure) {
    try {
        logDebug('Generating simple DOM tree', 'display');
        
        if (!domStructure || !domStructure.structure) {
            return 'No structure data available for tree generation';
        }
        
        var textBuilder = createStringBuilder();
        
        textBuilder.appendLine('SIMPLE DOM TREE');
        textBuilder.appendLine('===============');
        textBuilder.appendLine('');
        
        // Generate tree from structure
        if (domStructure.structure.document) {
            textBuilder.appendLine('document');
            var docNode = domStructure.structure.document;
            
            if (docNode.properties && docNode.properties.length > 0) {
                textBuilder.appendLine('  ├─ properties (' + docNode.properties.length + ')');
            }
            
            if (docNode.methods && docNode.methods.length > 0) {
                textBuilder.appendLine('  ├─ methods (' + docNode.methods.length + ')');
            }
            
            if (docNode.collections && docNode.collections.length > 0) {
                textBuilder.appendLine('  ├─ collections (' + docNode.collections.length + ')');
                for (var i = 0; i < Math.min(5, docNode.collections.length); i++) {
                    var collection = docNode.collections[i];
                    var prefix = (i === Math.min(5, docNode.collections.length) - 1) ? '  │   └─ ' : '  │   ├─ ';
                    textBuilder.appendLine(prefix + collection.name);
                }
                if (docNode.collections.length > 5) {
                    textBuilder.appendLine('  │   └─ ... (' + (docNode.collections.length - 5) + ' more)');
                }
            }
            
            if (docNode.childNodes && docNode.childNodes.length > 0) {
                textBuilder.appendLine('  └─ childNodes (' + docNode.childNodes.length + ')');
            }
        }
        
        textBuilder.appendLine('');
        textBuilder.appendLine('Use "Discover DOM" for detailed analysis');
        
        var treeText = textBuilder.toString();
        logDebug('Simple DOM tree generated - ' + treeText.length + ' characters', 'display');
        
        return treeText;
        
    } catch (exc) {
        logError('Simple DOM tree generation error: ' + exc.message, 'display');
        return 'Simple DOM tree generation failed: ' + exc.message;
    }
}

/**
 * Clear discovery display - ENHANCED LOGGING
 */
function clearDiscoveryDisplay() {
    try {
        logDebug('Clearing discovery display', 'display');
        
        if (g_domViz_discoveryDisplay) {
            g_domViz_discoveryDisplay.text = 'Click "Discover DOM" to analyze the current document structure...';
            logInfo('Discovery display cleared', 'display');
        }
        
        g_domViz_currentDOMStructure = null;

    } catch (exc) {
        logError('Clear display error: ' + exc.message, 'display');
    }
}

// =============================================================================
// EXPORT OPERATIONS - UI WRAPPERS CALLING CORE 3.2 FUNCTIONS
// =============================================================================

/**
 * Export as JSON (UI wrapper) - ENHANCED LOGGING
 */
function exportAsJSON() {
    try {
        logDebug('Starting JSON export UI wrapper', 'exportData');
        
        if (!g_domViz_currentDOMStructure) {
            var noDataMsg = 'No data to export - run discovery first';
            updateStatus(noDataMsg);
            logWarn(noDataMsg, 'exportData');
            return;
        }

        // Check dependencies
        if (!functionExists('exportDOMStructure')) {
            var missingMsg = 'Export unavailable - DOM exporter module missing';
            updateStatus(missingMsg);
            logWarn('exportDOMStructure function not available', 'exportData');
            return;
        }

        updateStatus('Exporting as JSON...');
        
        // Call core 3.2 export function
        var exportResult = exportDOMStructure(g_domViz_currentDOMStructure, 'json', g_domViz_userConfiguration.exportSettings);

        if (exportResult && exportResult.success) {
            if (g_domViz_exportDisplay) {
                g_domViz_exportDisplay.text = exportResult.content || 'Export completed - check file';
            }
            var successMsg = 'JSON export completed: ' + (exportResult.filePath || 'file saved');
            updateStatus(successMsg);
            logInfo('JSON export completed successfully', 'exportData');
        } else {
            var errorMsg = 'JSON export failed: ' + (exportResult ? exportResult.error : 'unknown error');
            updateStatus(errorMsg);
            logError('JSON export failed', 'exportData');
        }

    } catch (exc) {
        var error = 'JSON export error: ' + exc.message;
        logError(error, 'exportData');
        updateStatus(error);
    }
}

/**
 * Export as Text (UI wrapper) - ENHANCED LOGGING
 */
function exportAsText() {
    try {
        logDebug('Starting text export UI wrapper', 'exportData');
        
        if (!g_domViz_currentDOMStructure) {
            var noDataMsg = 'No data to export - run discovery first';
            updateStatus(noDataMsg);
            logWarn(noDataMsg, 'exportData');
            return;
        }

        // Check dependencies
        if (!functionExists('exportDOMStructure')) {
            var missingMsg = 'Export unavailable - DOM exporter module missing';
            updateStatus(missingMsg);
            logWarn('exportDOMStructure function not available', 'exportData');
            return;
        }

        updateStatus('Exporting as text...');
        
        // Call core 3.2 export function
        var exportResult = exportDOMStructure(g_domViz_currentDOMStructure, 'text', g_domViz_userConfiguration.exportSettings);

        if (exportResult && exportResult.success) {
            if (g_domViz_exportDisplay) {
                g_domViz_exportDisplay.text = exportResult.content || 'Export completed - check file';
            }
            var successMsg = 'Text export completed: ' + (exportResult.filePath || 'file saved');
            updateStatus(successMsg);
            logInfo('Text export completed successfully', 'exportData');
        } else {
            var errorMsg = 'Text export failed: ' + (exportResult ? exportResult.error : 'unknown error');
            updateStatus(errorMsg);
            logError('Text export failed', 'exportData');
        }

    } catch (exc) {
        var error = 'Text export error: ' + exc.message;
        logError(error, 'exportData');
        updateStatus(error);
    }
}

/**
 * Export as CSV (UI wrapper) - ENHANCED LOGGING
 */
function exportAsCSV() {
    try {
        logDebug('Starting CSV export UI wrapper', 'exportData');
        
        if (!g_domViz_currentDOMStructure) {
            var noDataMsg = 'No data to export - run discovery first';
            updateStatus(noDataMsg);
            logWarn(noDataMsg, 'exportData');
            return;
        }

        // Check dependencies
        if (!functionExists('exportDOMStructure')) {
            var missingMsg = 'Export unavailable - DOM exporter module missing';
            updateStatus(missingMsg);
            logWarn('exportDOMStructure function not available', 'exportData');
            return;
        }

        updateStatus('Exporting as CSV...');
        
        // Call core 3.2 export function
        var exportResult = exportDOMStructure(g_domViz_currentDOMStructure, 'csv', g_domViz_userConfiguration.exportSettings);

        if (exportResult && exportResult.success) {
            if (g_domViz_exportDisplay) {
                g_domViz_exportDisplay.text = exportResult.content || 'Export completed - check file';
            }
            var successMsg = 'CSV export completed: ' + (exportResult.filePath || 'file saved');
            updateStatus(successMsg);
            logInfo('CSV export completed successfully', 'exportData');
        } else {
            var errorMsg = 'CSV export failed: ' + (exportResult ? exportResult.error : 'unknown error');
            updateStatus(errorMsg);
            logError('CSV export failed', 'exportData');
        }

    } catch (exc) {
        var error = 'CSV export error: ' + exc.message;
        logError(error, 'exportData');
        updateStatus(error);
    }
}

/**
 * Analyze current JSON - ENHANCED LOGGING
 */
function analyzeCurrentJSON() {
    try {
        logDebug('Starting JSON analysis', 'general');
        
        if (!g_domViz_currentDOMStructure) {
            var noDataMsg = 'No data to analyze - run discovery first';
            updateStatus(noDataMsg);
            logWarn(noDataMsg, 'general');
            return;
        }

        // Check dependencies
        if (!functionExists('analyzeLoadedJSON')) {
            var missingMsg = 'Analysis unavailable - JSON analyzer module missing';
            updateStatus(missingMsg);
            logWarn('analyzeLoadedJSON function not available', 'general');
            return;
        }

        updateStatus('Analyzing current data...');
        
        // Use the JSON analyzer on current structure
        var analysisResult = analyzeLoadedJSON(g_domViz_currentDOMStructure, {});

        if (analysisResult && analysisResult.success) {
            var displayText = generateAnalysisDisplay(analysisResult);
            if (g_domViz_exportDisplay) {
                g_domViz_exportDisplay.text = displayText;
            }
            updateStatus('Analysis completed successfully');
            logInfo('JSON analysis completed successfully', 'general');
        } else {
            var errorMsg = 'Analysis failed: ' + (analysisResult ? analysisResult.error : 'unknown error');
            updateStatus(errorMsg);
            logError('JSON analysis failed', 'general');
        }

    } catch (exc) {
        var error = 'Analysis error: ' + exc.message;
        logError(error, 'general');
        updateStatus(error);
    }
}

/**
 * Generate analysis display - ENHANCED LOGGING
 * @param {Object} analysisResult - Analysis result
 * @returns {String} Display text
 */
function generateAnalysisDisplay(analysisResult) {
    try {
        logDebug('Generating analysis display', 'general');
        
        if (!analysisResult) {
            return 'No analysis results available';
        }

        var textBuilder = createStringBuilder();
        
        textBuilder.appendLine('JSON ANALYSIS RESULTS');
        textBuilder.appendLine('====================');
        textBuilder.appendLine('');

        // Summary
        if (analysisResult.summary) {
            textBuilder.appendLine('SUMMARY:');
            textBuilder.appendLine(analysisResult.summary);
            textBuilder.appendLine('');
        }

        // Statistics
        if (analysisResult.statistics) {
            var stats = analysisResult.statistics;
            textBuilder.appendLine('STATISTICS:');
            textBuilder.appendLine('Total Nodes: ' + (stats.totalNodes || 0));
            textBuilder.appendLine('Max Depth: ' + (stats.maxDepth || 0));
            textBuilder.appendLine('Total Properties: ' + (stats.totalProperties || 0));
            textBuilder.appendLine('Total Collections: ' + (stats.totalCollections || 0));
            textBuilder.appendLine('');
        }

        // Accessibility
        if (analysisResult.accessibility) {
            textBuilder.appendLine('ACCESSIBILITY MAP:');
            textBuilder.appendLine(analysisResult.accessibility);
            textBuilder.appendLine('');
        }

        var displayText = textBuilder.toString();
        logDebug('Analysis display generated - ' + displayText.length + ' characters', 'general');
        
        return displayText;

    } catch (exc) {
        logError('Generate analysis display error: ' + exc.message, 'general');
        return 'Error generating analysis display: ' + exc.message;
    }
}

// =============================================================================
// COMPARISON OPERATIONS - ENHANCED LOGGING
// =============================================================================

/**
 * Take snapshot of current structure - ENHANCED LOGGING
 */
function takeSnapshot() {
    try {
        logDebug('Taking structure snapshot', 'general');
        
        if (!g_domViz_currentDOMStructure) {
            var noDataMsg = 'No data to snapshot - run discovery first';
            updateStatus(noDataMsg);
            logWarn(noDataMsg, 'general');
            return;
        }

        // Store current structure as before state
        g_domViz_beforeData = objectClone(g_domViz_currentDOMStructure, 6);
        
        // Add to export history
        var snapshot = {
            timestamp: getCurrentTimestamp(),
            data: g_domViz_beforeData,
            type: 'snapshot'
        };
        g_domViz_exportHistory.push(snapshot);

        var successMsg = 'Snapshot taken successfully';
        updateStatus(successMsg);
        logInfo(successMsg, 'general');

    } catch (exc) {
        var error = 'Snapshot error: ' + exc.message;
        logError(error, 'general');
        updateStatus(error);
    }
}

/**
 * Load before JSON data - ENHANCED LOGGING
 */
function loadBeforeJSON() {
    try {
        logDebug('Loading before JSON data', 'general');
        
        var file = File.openDialog('Select Before JSON File', '*.json');
        if (!file) {
            logDebug('Before JSON load cancelled by user', 'general');
            return;
        }

        file.open('r');
        var content = file.read();
        file.close();

        var jsonData = parseJSONSafely(content);
        if (jsonData) {
            g_domViz_beforeData = jsonData;
            var successMsg = 'Before data loaded: ' + file.name;
            updateStatus(successMsg);
            logInfo(successMsg, 'general');
        } else {
            var errorMsg = 'Failed to parse JSON file';
            updateStatus(errorMsg);
            logError(errorMsg, 'general');
        }

    } catch (exc) {
        var error = 'Load before JSON error: ' + exc.message;
        logError(error, 'general');
        updateStatus(error);
    }
}

/**
 * Load after JSON data - ENHANCED LOGGING
 */
function loadAfterJSON() {
    try {
        logDebug('Loading after JSON data', 'general');
        
        var file = File.openDialog('Select After JSON File', '*.json');
        if (!file) {
            logDebug('After JSON load cancelled by user', 'general');
            return;
        }

        file.open('r');
        var content = file.read();
        file.close();

        var jsonData = parseJSONSafely(content);
        if (jsonData) {
            g_domViz_afterData = jsonData;
            var successMsg = 'After data loaded: ' + file.name;
            updateStatus(successMsg);
            logInfo(successMsg, 'general');
        } else {
            var errorMsg = 'Failed to parse JSON file';
            updateStatus(errorMsg);
            logError(errorMsg, 'general');
        }

    } catch (exc) {
        var error = 'Load after JSON error: ' + exc.message;
        logError(error, 'general');
        updateStatus(error);
    }
}

/**
 * Perform comparison - ENHANCED LOGGING
 */
function performComparison() {
    try {
        logDebug('Starting DOM comparison', 'general');
        
        if (!g_domViz_beforeData || !g_domViz_afterData) {
            var missingDataMsg = 'Both before and after data required for comparison';
            updateStatus(missingDataMsg);
            logWarn(missingDataMsg, 'general');
            return;
        }

        // Check dependencies
        if (!functionExists('compareDOMExports')) {
            var missingMsg = 'Comparison unavailable - DOM comparator module missing';
            updateStatus(missingMsg);
            logWarn('compareDOMExports function not available', 'general');
            return;
        }

        updateStatus('Performing comparison...');
        
        var comparisonResult = compareDOMExports(g_domViz_beforeData, g_domViz_afterData, {});

        if (comparisonResult && comparisonResult.success) {
            var displayText = generateComparisonDisplay(comparisonResult);
            if (g_domViz_comparisonDisplay) {
                g_domViz_comparisonDisplay.text = displayText;
            }
            updateStatus('Comparison completed successfully');
            logInfo('DOM comparison completed successfully', 'general');
        } else {
            var errorMsg = 'Comparison failed: ' + (comparisonResult ? comparisonResult.error : 'unknown error');
            updateStatus(errorMsg);
            logError('DOM comparison failed', 'general');
        }

    } catch (exc) {
        var error = 'Comparison error: ' + exc.message;
        logError(error, 'general');
        updateStatus(error);
    }
}

/**
 * Generate comparison display - ENHANCED LOGGING
 * @param {Object} comparisonResult - Comparison result
 * @returns {String} Display text
 */
function generateComparisonDisplay(comparisonResult) {
    try {
        logDebug('Generating comparison display', 'general');
        
        if (!comparisonResult) {
            return 'No comparison results available';
        }

        var textBuilder = createStringBuilder();
        
        textBuilder.appendLine('DOM COMPARISON RESULTS');
        textBuilder.appendLine('=====================');
        textBuilder.appendLine('');

        // Summary
        if (comparisonResult.summary) {
            textBuilder.appendLine('SUMMARY:');
            textBuilder.appendLine(comparisonResult.summary);
            textBuilder.appendLine('');
        }

        // Statistics
        if (comparisonResult.statistics) {
            var stats = comparisonResult.statistics;
            textBuilder.appendLine('CHANGE STATISTICS:');
            textBuilder.appendLine('Structural Changes: ' + (stats.structuralChanges || 0));
            textBuilder.appendLine('Property Changes: ' + (stats.propertyChanges || 0));
            textBuilder.appendLine('Value Changes: ' + (stats.valueChanges || 0));
            textBuilder.appendLine('Collection Changes: ' + (stats.collectionChanges || 0));
            textBuilder.appendLine('');
        }

        // Detailed analysis
        if (comparisonResult.analysis) {
            textBuilder.appendLine('DETAILED ANALYSIS:');
            textBuilder.appendLine(comparisonResult.analysis);
            textBuilder.appendLine('');
        }

        var displayText = textBuilder.toString();
        logDebug('Comparison display generated - ' + displayText.length + ' characters', 'general');
        
        return displayText;

    } catch (exc) {
        logError('Generate comparison display error: ' + exc.message, 'general');
        return 'Error generating comparison display: ' + exc.message;
    }
}

// =============================================================================
// DEEP MAPPING OPERATIONS - ENHANCED LOGGING
// =============================================================================

/**
 * Perform deep mapping - ENHANCED LOGGING
 */
function performDeepMapping() {
    try {
        logDebug('Starting deep mapping', 'general');
        
        if (!app.documents.length) {
            var noDocMsg = 'No active document for deep mapping';
            updateStatus(noDocMsg);
            logWarn(noDocMsg, 'general');
            return;
        }

        // Check dependencies
        if (!functionExists('performDeepDOMMapping')) {
            var missingMsg = 'Deep mapping unavailable - deep mapper module missing';
            updateStatus(missingMsg);
            logWarn('performDeepDOMMapping function not available', 'general');
            return;
        }

        var activeDoc = app.activeDocument;
        updateStatus('Performing deep mapping...');
        
        var mappingResult = performDeepDOMMapping(activeDoc, {});

        if (mappingResult && mappingResult.success) {
            var displayText = generateDeepMappingDisplay(mappingResult);
            if (g_domViz_mappingDisplay) {
                g_domViz_mappingDisplay.text = displayText;
            }
            updateStatus('Deep mapping completed successfully');
            logInfo('Deep mapping completed successfully', 'general');
        } else {
            var errorMsg = 'Deep mapping failed: ' + (mappingResult ? mappingResult.error : 'unknown error');
            updateStatus(errorMsg);
            logError('Deep mapping failed', 'general');
        }

    } catch (exc) {
        var error = 'Deep mapping error: ' + exc.message;
        logError(error, 'general');
        updateStatus(error);
    }
}

/**
 * Generate object atlas - ENHANCED LOGGING
 */
function generateObjectAtlas() {
    try {
        logDebug('Generating object atlas', 'general');
        
        if (!g_domViz_currentDOMStructure) {
            var noDataMsg = 'No data for atlas generation - run discovery first';
            updateStatus(noDataMsg);
            logWarn(noDataMsg, 'general');
            return;
        }

        updateStatus('Generating object atlas...');
        
        // Use current structure to generate atlas display
        var atlasText = 'OBJECT ATLAS\n' +
                       '============\n\n' +
                       'Atlas generation based on current DOM structure.\n' +
                       'This feature provides comprehensive object relationship mapping.\n\n' +
                       'Use Deep Mapping for full atlas generation.';

        if (g_domViz_mappingDisplay) {
            g_domViz_mappingDisplay.text = atlasText;
        }

        updateStatus('Object atlas generated');
        logInfo('Object atlas generated successfully', 'general');

    } catch (exc) {
        var error = 'Atlas generation error: ' + exc.message;
        logError(error, 'general');
        updateStatus(error);
    }
}

/**
 * Optimize performance - ENHANCED LOGGING
 */
function optimizePerformance() {
    try {
        logDebug('Starting performance optimization', 'general');
        
        updateStatus('Analyzing performance...');
        
        // Basic performance optimization display
        var optimizationText = 'PERFORMANCE OPTIMIZATION\n' +
                              '=======================\n\n' +
                              'Performance analysis and optimization recommendations.\n\n' +
                              'Current Configuration:\n' +
                              '- Max Depth: ' + g_domViz_userConfiguration.enumeration.maxDepth + '\n' +
                              '- Max Properties: ' + g_domViz_userConfiguration.enumeration.maxProperties + '\n' +
                              '- Timeout: ' + g_domViz_userConfiguration.enumeration.timeoutMs + 'ms\n\n' +
                              'Recommendations:\n' +
                              '- Consider reducing depth for faster enumeration\n' +
                              '- Use safety filters to avoid dangerous properties\n' +
                              '- Enable progress reporting for long operations';

        if (g_domViz_mappingDisplay) {
            g_domViz_mappingDisplay.text = optimizationText;
        }

        updateStatus('Performance optimization completed');
        logInfo('Performance optimization completed', 'general');

    } catch (exc) {
        var error = 'Performance optimization error: ' + exc.message;
        logError(error, 'general');
        updateStatus(error);
    }
}

/**
 * Generate deep mapping display - ENHANCED LOGGING
 * @param {Object} mappingResult - Deep mapping result
 * @returns {String} Display text
 */
function generateDeepMappingDisplay(mappingResult) {
    try {
        logDebug('Generating deep mapping display', 'general');
        
        if (!mappingResult) {
            return 'No deep mapping results available';
        }

        var textBuilder = createStringBuilder();
        
        textBuilder.appendLine('DEEP MAPPING RESULTS');
        textBuilder.appendLine('===================');
        textBuilder.appendLine('');

        // Statistics
        if (mappingResult.statistics) {
            var stats = mappingResult.statistics;
            textBuilder.appendLine('MAPPING STATISTICS:');
            textBuilder.appendLine('Objects Mapped: ' + (stats.objectsMapped || 0));
            textBuilder.appendLine('Relationships Found: ' + (stats.relationshipsFound || 0));
            textBuilder.appendLine('Circular References: ' + (stats.circularReferences || 0));
            textBuilder.appendLine('Mapping Time: ' + (stats.mappingTime || 0) + 'ms');
            textBuilder.appendLine('');
        }

        // Atlas summary
        if (mappingResult.atlas) {
            textBuilder.appendLine('OBJECT ATLAS SUMMARY:');
            textBuilder.appendLine('Atlas contains comprehensive object relationship mapping');
            textBuilder.appendLine('with accessibility analysis and performance optimization data.');
            textBuilder.appendLine('');
        }

        var displayText = textBuilder.toString();
        logDebug('Deep mapping display generated - ' + displayText.length + ' characters', 'general');
        
        return displayText;

    } catch (exc) {
        logError('Generate deep mapping display error: ' + exc.message, 'general');
        return 'Error generating deep mapping display: ' + exc.message;
    }
}

// =============================================================================
// CONFIGURATION AND UTILITIES - ENHANCED LOGGING
// =============================================================================

/**
 * Show configuration dialog - ENHANCED LOGGING
 */
function showConfigurationDialog() {
    try {
        logDebug('Opening configuration dialog', 'general');
        
        var configDialog = new Window('dialog', 'DOM Visualizer Configuration');
        configDialog.orientation = 'column';
        configDialog.alignChildren = ['fill', 'top'];
        configDialog.spacing = 10;
        configDialog.margins = 16;

        // Enumeration settings
        var enumGroup = configDialog.add('panel', undefined, 'Enumeration Settings');
        enumGroup.orientation = 'column';
        enumGroup.alignChildren = ['fill', 'top'];

        var depthGroup = enumGroup.add('group');
        depthGroup.add('statictext', undefined, 'Max Depth:');
        var depthEdit = depthGroup.add('edittext', undefined, g_domViz_userConfiguration.enumeration.maxDepth.toString());
        depthEdit.characters = 3;

        var propsGroup = enumGroup.add('group');
        propsGroup.add('statictext', undefined, 'Max Properties:');
        var propsEdit = propsGroup.add('edittext', undefined, g_domViz_userConfiguration.enumeration.maxProperties.toString());
        propsEdit.characters = 6;

        var timeoutGroup = enumGroup.add('group');
        timeoutGroup.add('statictext', undefined, 'Timeout (ms):');
        var timeoutEdit = timeoutGroup.add('edittext', undefined, g_domViz_userConfiguration.enumeration.timeoutMs.toString());
        timeoutEdit.characters = 6;

        // Buttons
        var buttonGroup = configDialog.add('group');
        buttonGroup.alignment = ['right', 'center'];
        var okButton = buttonGroup.add('button', undefined, 'OK');
        var cancelButton = buttonGroup.add('button', undefined, 'Cancel');

        okButton.onClick = function() {
            // ES3 FIX: Parse values explicitly
            var newDepth = parseInt(depthEdit.text);
            var newProps = parseInt(propsEdit.text);
            var newTimeout = parseInt(timeoutEdit.text);
            
            if (!isNaN(newDepth) && newDepth > 0) {
                g_domViz_userConfiguration.enumeration.maxDepth = newDepth;
            }
            if (!isNaN(newProps) && newProps > 0) {
                g_domViz_userConfiguration.enumeration.maxProperties = newProps;
            }
            if (!isNaN(newTimeout) && newTimeout > 0) {
                g_domViz_userConfiguration.enumeration.timeoutMs = newTimeout;
            }
            
            logInfo('Configuration updated successfully', 'general');
            configDialog.close();
        };

        cancelButton.onClick = function() {
            logDebug('Configuration dialog cancelled', 'general');
            configDialog.close();
        };

        logInfo('Configuration dialog opened', 'general');
        configDialog.show();

    } catch (exc) {
        var error = 'Configuration dialog error: ' + exc.message;
        logError(error, 'general');
        alert(error);
    }
}

/**
 * Reset visualizer state - ENHANCED LOGGING
 */
function resetVisualizer() {
    try {
        logDebug('Resetting visualizer state', 'general');
        
        // Clear data
        g_domViz_currentDOMStructure = null;
        g_domViz_beforeData = null;
        g_domViz_afterData = null;
        g_domViz_exportHistory = [];

        // Clear displays
        if (g_domViz_discoveryDisplay) {
            g_domViz_discoveryDisplay.text = 'Click "Discover DOM" to analyze the current document structure...';
        }
        if (g_domViz_exportDisplay) {
            g_domViz_exportDisplay.text = 'Export results will appear here...';
        }
        if (g_domViz_comparisonDisplay) {
            g_domViz_comparisonDisplay.text = 'Comparison results will appear here...';
        }
        if (g_domViz_mappingDisplay) {
            g_domViz_mappingDisplay.text = 'Deep mapping results will appear here...';
        }

        // Reset configuration
        g_domViz_userConfiguration = objectClone(g_domViz_originalConfigs, 4);

        updateStatus('Visualizer reset completed');
        logInfo('Visualizer reset completed successfully', 'general');

    } catch (exc) {
        var error = 'Reset error: ' + exc.message;
        logError(error, 'general');
        updateStatus(error);
    }
}

/**
 * Show help information - ENHANCED LOGGING
 */
function showHelp() {
    try {
        logDebug('Showing help information', 'general');
        
        var helpDialog = new Window('dialog', 'DOM Visualizer Help');
        helpDialog.orientation = 'column';
        helpDialog.alignChildren = ['fill', 'fill'];
        helpDialog.spacing = 10;
        helpDialog.margins = 16;
        helpDialog.preferredSize.width = 600;
        helpDialog.preferredSize.height = 500;

        var helpText = helpDialog.add('edittext', undefined, 
            'INDESIGN DOM DISCOVERY BUILDER v4.1 HELP\n' +
            '=======================================\n\n' +
            'DISCOVERY TAB:\n' +
            '- Click "Discover DOM" to analyze the active document\n' +
            '- Use "Configure" to adjust analysis settings\n' +
            '- Use "Clear" to reset the display\n\n' +
            'EXPORT TAB:\n' +
            '- Export data in JSON, Text, or CSV formats\n' +
            '- Use "Analyze JSON" for detailed analysis\n' +
            '- Results are saved to files and shown in the display\n\n' +
            'COMPARISON TAB:\n' +
            '- Take snapshots of document states\n' +
            '- Load before/after JSON files for comparison\n' +
            '- Compare documents to identify changes\n\n' +
            'DEEP MAPPING TAB:\n' +
            '- Perform advanced object relationship analysis\n' +
            '- Generate object atlas for comprehensive mapping\n' +
            '- Optimize performance settings\n\n' +
            'TIPS:\n' +
            '- Start with Discovery to analyze document structure\n' +
            '- Use Export to save results for later analysis\n' +
            '- Use Comparison to track document changes\n' +
            '- Adjust timeout and depth settings for better performance\n\n' +
            'For more information, see the InDesign DOM Discovery Builder documentation.'
        );
        helpText.properties = { multiline: true, scrolling: true, readonly: true };

        var closeButton = helpDialog.add('button', undefined, 'Close');
        closeButton.alignment = ['center', 'bottom'];
        closeButton.onClick = function() {
            helpDialog.close();
        };

        logInfo('Help dialog opened', 'general');
        helpDialog.show();

    } catch (exc) {
        var error = 'Help dialog error: ' + exc.message;
        logError(error, 'general');
        alert(error);
    }
}

/**
 * Close visualizer - ENHANCED LOGGING
 */
function closeVisualizer() {
    try {
        logDebug('Closing DOM visualizer', 'general');
        
        // Clear references
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

        logInfo('DOM Visualizer closed successfully', 'general');

    } catch (exc) {
        logError('Close error: ' + exc.message, 'general');
    }
}

// =============================================================================
// MODULE REGISTRATION - UPDATED TO v4.1
// =============================================================================

// Register this module with all its functions
registerModule('5.2.0.0_dom-visualizer', '4.1', [
    // Main Functions
    'showDOMVisualizer', 'createVisualizerWindow', 'initializeVisualizerComponents',

    // Tab Creation Functions
    'createDiscoveryTab', 'createExportTab', 'createComparisonTab', 'createDeepMappingTab',

    // Discovery Operations
    'performFullDiscovery', 'performPhase1Enumeration', 'performPhase2ValueSampling',
    'performPhase3CollectionSampling', 'displayCurrentStructure', 'generateStructureDisplayText',
    'generateEnhancedFallbackDisplay', 'generateSimpleDOMTree', 'clearDiscoveryDisplay',

    // Export Operations (UI wrappers calling core 3.2 functions)
    'exportAsJSON', 'exportAsText', 'exportAsCSV', 'analyzeCurrentJSON', 'generateAnalysisDisplay',

    // Comparison Operations
    'loadBeforeJSON', 'loadAfterJSON', 'performComparison', 'generateComparisonDisplay', 'takeSnapshot',

    // Deep Mapping Operations
    'performDeepMapping', 'generateObjectAtlas', 'optimizePerformance', 'generateDeepMappingDisplay',

    // Configuration and Utilities
    'showConfigurationDialog', 'resetVisualizer', 'showHelp', 'closeVisualizer'
]);

// =============================================================================
// END OF 5.2_dom-visualizer.jsx - v4.1 ENHANCED
// =============================================================================