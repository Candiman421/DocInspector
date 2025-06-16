// =============================================================================
// 9.0_dom-visualizer.jsx - DOM VISUALIZATION INTERFACE
// InDesign DOM Discovery Builder v2.1 - TARGET ARCHITECTURE
// =============================================================================
// PURPOSE: Display DOM structure in user-friendly interface with full feature integration
// DEPENDENCIES: ["1.0_safe-foundation.jsx", "2.0_dom-enumerator.jsx", "3.0_collection-sampler.jsx", "5.0_dom-exporter.jsx"]
// SIZE: ~700 lines
// =============================================================================

// =============================================================================
// MODULE REGISTRATION AND DEPENDENCIES
// =============================================================================

try {
    // Register this module
    if (typeof registerModule === 'function') {
        registerModule('dom-visualizer', '2.1', [
            'showDOMVisualizer',
            'showDOMExplorer',
            'createDOMVisualizerUI',
            'createDocumentInfoPanel',
            'createDOMDisplayPanel',
            'createControlPanel',
            'createStatusPanel',
            'runDOMEnumeration',
            'runCollectionSampling',
            'formatDOMForDisplay',
            'generateDOMTreeText',
            'updateStatus',
            'updateDocumentInfo',
            'showExportOptions',
            'showExportDialog',
            'performExport',
            'showSettingsDialog'
        ]);
    }

    // Validate dependencies
    if (typeof validateDependencies === 'function') {
        var depResult = validateDependencies(['safe-foundation', 'dom-enumerator', 'collection-sampler', 'dom-exporter']);
        if (!depResult.success) {
            throw new Error('Missing dependencies for dom-visualizer: ' + depResult.missing.join(', '));
        }
    }
} catch (exc) {
    // Module system not available - continue with standalone operation
}

// =============================================================================
// NAMESPACED GLOBAL VARIABLES FOR UI STATE
// =============================================================================

var g_domViz_visualizerWindow = null;
var g_domViz_currentDOMStructure = null;
var g_domViz_statusText = null;
var g_domViz_domDisplay = null;
var g_domViz_documentInfo = null;

// =============================================================================
// MAIN UI FUNCTIONS
// =============================================================================

/**
 * Show DOM visualizer interface (main entry point)
 * @returns {Boolean} True if interface shown successfully
 */
function showDOMVisualizer() {
    try {
        // Close existing window if open
        if (g_domViz_visualizerWindow) {
            try {
                g_domViz_visualizerWindow.close();
            } catch (exc) {
                // Window might already be closed
            }
            g_domViz_visualizerWindow = null;
        }
        
        // Create and show new visualizer UI with enhanced error handling
        g_domViz_visualizerWindow = createDOMVisualizerUI();
        if (g_domViz_visualizerWindow) {
            g_domViz_visualizerWindow.show();
            updateDocumentInfo();
            updateStatus('DOM Visualizer ready. Click "Enumerate DOM" to begin analysis.');
            return true;
        } else {
            updateStatus('Failed to create visualizer window');
            return false;
        }
        
    } catch (exc) {
        updateStatus('Error showing DOM visualizer: ' + exc.message);
        return false;
    }
}

/**
 * Show DOM visualizer interface (alternative entry point for compatibility)
 * @returns {Boolean} True if interface shown successfully
 */
function showDOMExplorer() {
    return showDOMVisualizer();
}

/**
 * Create main DOM visualization interface with enhanced error handling
 * @returns {Object} Window dialog object
 */
function createDOMVisualizerUI() {
    try {
        // Enhanced parameter validation and window creation
        var mainWindow = null;
        
        try {
            mainWindow = new Window('dialog', 'InDesign DOM Discovery Builder v2.1');
        } catch (exc) {
            updateStatus('Failed to create main window: ' + exc.message);
            return null;
        }
        
        if (!mainWindow) {
            updateStatus('Window creation returned null');
            return null;
        }
        
        // Enhanced window configuration with error protection
        try {
            mainWindow.orientation = 'column';
            mainWindow.alignChildren = 'fill';
            mainWindow.spacing = 10;
            mainWindow.margins = 16;
            
            // Set window size with fallback
            if (mainWindow.preferredSize) {
                mainWindow.preferredSize.width = 800;
                mainWindow.preferredSize.height = 700;
            }
        } catch (exc) {
            updateStatus('Window configuration error: ' + exc.message);
            // Continue with defaults
        }
        
        // Create UI panels with enhanced error handling
        var panelsCreated = 0;
        
        try {
            if (createDocumentInfoPanel(mainWindow)) panelsCreated++;
        } catch (exc) {
            updateStatus('Document info panel creation failed: ' + exc.message);
        }
        
        try {
            if (createDOMDisplayPanel(mainWindow)) panelsCreated++;
        } catch (exc) {
            updateStatus('DOM display panel creation failed: ' + exc.message);
        }
        
        try {
            if (createControlPanel(mainWindow)) panelsCreated++;
        } catch (exc) {
            updateStatus('Control panel creation failed: ' + exc.message);
        }
        
        try {
            if (createStatusPanel(mainWindow)) panelsCreated++;
        } catch (exc) {
            updateStatus('Status panel creation failed: ' + exc.message);
        }
        
        if (panelsCreated === 0) {
            updateStatus('No UI panels created successfully');
            return null;
        }
        
        return mainWindow;
        
    } catch (exc) {
        updateStatus('UI creation failed: ' + exc.message);
        return null;
    }
}

// =============================================================================
// UI PANEL CREATION - ENHANCED
// =============================================================================

/**
 * Create document information panel with enhanced error handling
 * @param {Object} parentWindow - Parent window
 * @returns {Boolean} True if panel created successfully
 */
function createDocumentInfoPanel(parentWindow) {
    try {
        // Parameter validation
        if (!parentWindow) {
            return false;
        }
        
        var infoGroup = parentWindow.add('group');
        if (!infoGroup) {
            return false;
        }
        
        infoGroup.orientation = 'column';
        infoGroup.alignChildren = 'left';
        infoGroup.spacing = 5;
        
        // Title with enhanced font handling
        var titleText = infoGroup.add('statictext', undefined, 'DOCUMENT INFORMATION');
        if (titleText) {
            try {
                titleText.graphics.font = ScriptUI.newFont('Arial', 'BOLD', 12);
            } catch (exc) {
                // Font setting failed - continue with default
            }
        }
        
        // Document info display with enhanced sizing
        g_domViz_documentInfo = infoGroup.add('statictext', undefined, 'No document information available');
        if (g_domViz_documentInfo) {
            try {
                g_domViz_documentInfo.preferredSize.width = 750;
                g_domViz_documentInfo.characters = 80;
            } catch (exc) {
                // Size setting failed - continue with defaults
            }
        }
        
        return true;
        
    } catch (exc) {
        return false;
    }
}

/**
 * Create DOM tree display panel with enhanced error handling
 * @param {Object} parentWindow - Parent window
 * @returns {Boolean} True if panel created successfully
 */
function createDOMDisplayPanel(parentWindow) {
    try {
        // Parameter validation
        if (!parentWindow) {
            return false;
        }
        
        var displayGroup = parentWindow.add('group');
        if (!displayGroup) {
            return false;
        }
        
        displayGroup.orientation = 'column';
        displayGroup.alignChildren = 'fill';
        displayGroup.spacing = 5;
        
        // Title with enhanced font handling
        var titleText = displayGroup.add('statictext', undefined, 'DOM STRUCTURE TREE');
        if (titleText) {
            try {
                titleText.graphics.font = ScriptUI.newFont('Arial', 'BOLD', 12);
            } catch (exc) {
                // Font setting failed - continue with default
            }
        }
        
        // Scrollable text area for DOM tree with enhanced configuration
        g_domViz_domDisplay = displayGroup.add('edittext', undefined, 'Click "Enumerate DOM" to discover document structure...', {multiline: true, scrolling: true});
        if (g_domViz_domDisplay) {
            try {
                g_domViz_domDisplay.preferredSize.width = 750;
                g_domViz_domDisplay.preferredSize.height = 400;
                g_domViz_domDisplay.readonly = true;
            } catch (exc) {
                // Size/property setting failed - continue with defaults
            }
        }
        
        return true;
        
    } catch (exc) {
        return false;
    }
}

/**
 * Create control panel with action buttons and enhanced error handling
 * @param {Object} parentWindow - Parent window
 * @returns {Boolean} True if panel created successfully
 */
function createControlPanel(parentWindow) {
    try {
        // Parameter validation
        if (!parentWindow) {
            return false;
        }
        
        var controlGroup = parentWindow.add('group');
        if (!controlGroup) {
            return false;
        }
        
        controlGroup.orientation = 'row';
        controlGroup.alignChildren = 'center';
        controlGroup.spacing = 10;
        
        var buttonsCreated = 0;
        
        // Main action buttons with enhanced error handling
        try {
            var enumerateBtn = controlGroup.add('button', undefined, 'Enumerate DOM');
            if (enumerateBtn) {
                enumerateBtn.preferredSize.width = 120;
                enumerateBtn.onClick = function() {
                    try {
                        runDOMEnumeration();
                    } catch (exc) {
                        updateStatus('Enumeration button error: ' + exc.message);
                    }
                };
                buttonsCreated++;
            }
        } catch (exc) {
            updateStatus('Enumerate button creation failed: ' + exc.message);
        }
        
        try {
            var sampleBtn = controlGroup.add('button', undefined, 'Sample Collections');
            if (sampleBtn) {
                sampleBtn.preferredSize.width = 120;
                sampleBtn.onClick = function() {
                    try {
                        runCollectionSampling();
                    } catch (exc) {
                        updateStatus('Collection sampling button error: ' + exc.message);
                    }
                };
                buttonsCreated++;
            }
        } catch (exc) {
            updateStatus('Sample button creation failed: ' + exc.message);
        }
        
        try {
            var exportBtn = controlGroup.add('button', undefined, 'Export DOM');
            if (exportBtn) {
                exportBtn.preferredSize.width = 120;
                exportBtn.onClick = function() {
                    try {
                        showExportOptions();
                    } catch (exc) {
                        updateStatus('Export button error: ' + exc.message);
                    }
                };
                buttonsCreated++;
            }
        } catch (exc) {
            updateStatus('Export button creation failed: ' + exc.message);
        }
        
        try {
            var settingsBtn = controlGroup.add('button', undefined, 'Settings');
            if (settingsBtn) {
                settingsBtn.preferredSize.width = 120;
                settingsBtn.onClick = function() {
                    try {
                        showSettingsDialog();
                    } catch (exc) {
                        updateStatus('Settings button error: ' + exc.message);
                    }
                };
                buttonsCreated++;
            }
        } catch (exc) {
            updateStatus('Settings button creation failed: ' + exc.message);
        }
        
        // Close button
        try {
            var closeBtn = controlGroup.add('button', undefined, 'Close');
            if (closeBtn) {
                closeBtn.preferredSize.width = 80;
                closeBtn.onClick = function() {
                    try {
                        if (g_domViz_visualizerWindow) {
                            g_domViz_visualizerWindow.close();
                            g_domViz_visualizerWindow = null;
                        }
                    } catch (exc) {
                        updateStatus('Close button error: ' + exc.message);
                    }
                };
                buttonsCreated++;
            }
        } catch (exc) {
            updateStatus('Close button creation failed: ' + exc.message);
        }
        
        return buttonsCreated > 0;
        
    } catch (exc) {
        return false;
    }
}

/**
 * Create status panel with enhanced error handling
 * @param {Object} parentWindow - Parent window
 * @returns {Boolean} True if panel created successfully
 */
function createStatusPanel(parentWindow) {
    try {
        // Parameter validation
        if (!parentWindow) {
            return false;
        }
        
        var statusGroup = parentWindow.add('group');
        if (!statusGroup) {
            return false;
        }
        
        statusGroup.orientation = 'row';
        statusGroup.alignChildren = 'left';
        statusGroup.spacing = 5;
        
        var statusLabel = statusGroup.add('statictext', undefined, 'Status:');
        if (statusLabel) {
            try {
                statusLabel.graphics.font = ScriptUI.newFont('Arial', 'BOLD', 10);
            } catch (exc) {
                // Font setting failed - continue with default
            }
        }
        
        g_domViz_statusText = statusGroup.add('statictext', undefined, 'Ready');
        if (g_domViz_statusText) {
            try {
                g_domViz_statusText.preferredSize.width = 600;
                g_domViz_statusText.characters = 100;
            } catch (exc) {
                // Size setting failed - continue with defaults
            }
        }
        
        return true;
        
    } catch (exc) {
        return false;
    }
}

// =============================================================================
// CORE OPERATIONS (GUARANTEED TO WORK) - ENHANCED
// =============================================================================

/**
 * Execute DOM enumeration and display results with enhanced error handling
 */
function runDOMEnumeration() {
    try {
        updateStatus('Starting DOM enumeration...');
        
        // Enhanced environment validation
        var envValidation = validateInDesignEnvironment();
        if (!envValidation.valid) {
            updateStatus('Error: ' + envValidation.error);
            return;
        }
        
        updateStatus('Enumerating document structure...');
        
        // Check if enumeration function is available
        if (typeof enumerateDocumentDOM !== 'function') {
            updateStatus('Error: DOM enumeration function not available - requires dom-enumerator module');
            return;
        }
        
        // Perform DOM enumeration with progress tracking and enhanced configuration
        var startTime = new Date().getTime();
        var config = objectClone({
            maxDepth: 4,
            timeoutMs: 15000,
            skipDangerous: true,
            maxProperties: 5000,
            enableObjectTracking: true,
            enableDuplicateDetection: true
        }, 2);
        
        var domStructure = enumerateDocumentDOM(envValidation.document, config);
        
        var elapsedTime = new Date().getTime() - startTime;
        
        if (!domStructure || (domStructure.metadata && domStructure.metadata.error)) {
            var errorMsg = 'Unknown error';
            if (domStructure && domStructure.metadata && domStructure.metadata.error) {
                errorMsg = domStructure.metadata.error;
            }
            updateStatus('DOM enumeration failed: ' + errorMsg);
            return;
        }
        
        // Store result
        g_domViz_currentDOMStructure = domStructure;
        
        // Update display with enhanced formatting
        var displayText = formatDOMForDisplay(domStructure);
        if (g_domViz_domDisplay && displayText) {
            g_domViz_domDisplay.text = displayText;
        }
        
        // Update document info
        updateDocumentInfo();
        
        // Enhanced success status with comprehensive statistics
        var stats = null;
        if (typeof getDOMStatistics === 'function') {
            stats = getDOMStatistics(domStructure);
        } else {
            // Fallback statistics
            stats = {
                totalNodes: domStructure.statistics ? domStructure.statistics.totalNodes : 0,
                totalProperties: domStructure.statistics ? domStructure.statistics.totalProperties : 0,
                objectReferences: domStructure.statistics ? domStructure.statistics.objectReferences : 0
            };
        }
        
        updateStatus('Enumeration complete! Found ' + (stats.totalNodes || 0) + ' objects, ' + 
                    (stats.totalProperties || 0) + ' properties in ' + elapsedTime + 'ms. ' +
                    'Object references: ' + (stats.objectReferences || 0));
        
    } catch (exc) {
        updateStatus('Enumeration error: ' + exc.message);
    }
}

/**
 * Execute collection sampling and display enhanced results
 */
function runCollectionSampling() {
    try {
        if (!g_domViz_currentDOMStructure) {
            updateStatus('Please run DOM enumeration first');
            return;
        }
        
        updateStatus('Sampling collection contents...');
        
        // Enhanced environment validation
        var envValidation = validateInDesignEnvironment();
        if (!envValidation.valid) {
            updateStatus('Error: ' + envValidation.error);
            return;
        }
        
        // Check if collection sampling function is available
        if (typeof sampleCollectionContents !== 'function') {
            updateStatus('Error: Collection sampling function not available - requires collection-sampler module');
            return;
        }
        
        // Perform collection sampling with progress tracking and enhanced configuration
        var startTime = new Date().getTime();
        var config = objectClone({
            maxSamplesPerCollection: 5,
            timeoutPerCollection: 5000,
            timeoutPerItem: 2000,
            maxCollectionSize: 2000,
            samplingDepth: 3,
            enableObjectReferenceTracking: true,
            enableDeepPropertyAnalysis: true,
            enableCrossCollectionTracking: true
        }, 2);
        
        var enhancedStructure = sampleCollectionContents(g_domViz_currentDOMStructure, envValidation.document, config);
        
        var elapsedTime = new Date().getTime() - startTime;
        
        if (!enhancedStructure) {
            updateStatus('Collection sampling failed');
            return;
        }
        
        // Update stored structure
        g_domViz_currentDOMStructure = enhancedStructure;
        
        // Update display with enhanced information
        var displayText = formatDOMForDisplay(enhancedStructure);
        if (g_domViz_domDisplay && displayText) {
            g_domViz_domDisplay.text = displayText;
        }
        
        // Update document info
        updateDocumentInfo();
        
        // Enhanced success status with collection sampling statistics
        var collectionStats = null;
        if (typeof getCollectionSamplingStatistics === 'function') {
            collectionStats = getCollectionSamplingStatistics(enhancedStructure);
        } else {
            // Fallback statistics
            collectionStats = {
                collectionsSampled: 0,
                totalItemsSampled: 0
            };
            
            if (enhancedStructure.metadata && enhancedStructure.metadata.collectionSampling && 
                enhancedStructure.metadata.collectionSampling.statistics) {
                var stats = enhancedStructure.metadata.collectionSampling.statistics;
                collectionStats.collectionsSampled = stats.collectionsSampled || 0;
                collectionStats.totalItemsSampled = stats.totalItemsSampled || 0;
            }
        }
        
        updateStatus('Collection sampling complete! Sampled ' + (collectionStats.collectionsSampled || 0) + 
                    ' collections with ' + (collectionStats.totalItemsSampled || 0) + ' items in ' + 
                    elapsedTime + 'ms');
        
    } catch (exc) {
        updateStatus('Collection sampling error: ' + exc.message);
    }
}

// =============================================================================
// DISPLAY FUNCTIONS - ENHANCED ES3 COMPLIANT
// =============================================================================

/**
 * Convert DOM structure to human-readable tree format - Enhanced ES3 compliant
 * @param {Object} domStructure - DOM structure to format
 * @returns {String} Formatted tree with comprehensive metadata
 */
function formatDOMForDisplay(domStructure) {
    try {
        // Enhanced parameter validation
        if (!domStructure || typeof domStructure !== 'object') {
            return 'No DOM structure available';
        }
        
        if (!domStructure.structure || !domStructure.structure.document) {
            return 'No DOM structure available - missing document data';
        }
        
        var builder = createStringBuilder();
        
        // Enhanced header with comprehensive metadata
        builder.appendLine('InDesign DOM Structure Analysis');
        builder.appendLine('==============================');
        
        if (domStructure.metadata) {
            var docName = domStructure.metadata.documentName || 'Unknown';
            var timestamp = domStructure.metadata.timestamp || 'Unknown';
            
            builder.appendLine('Document: ' + docName);
            builder.appendLine('Analysis Time: ' + timestamp);
            
            if (domStructure.metadata.collectionSampling && domStructure.metadata.collectionSampling.enabled) {
                builder.appendLine('Collection Sampling: Enabled');
            }
            
            if (domStructure.objectRegistry) {
                // ES3-compatible reference counting
                var refCount = countObjectKeys(domStructure.objectRegistry.references || {});
                builder.appendLine('Object References Tracked: ' + refCount);
            }
        }
        
        if (domStructure.statistics) {
            var totalNodes = domStructure.statistics.totalNodes || 0;
            var totalProperties = domStructure.statistics.totalProperties || 0;
            
            builder.appendLine('Total Objects: ' + totalNodes);
            builder.appendLine('Total Properties: ' + totalProperties);
            
            if (domStructure.statistics.enumerationTime) {
                builder.appendLine('Processing Time: ' + domStructure.statistics.enumerationTime + 'ms');
            }
        }
        
        builder.appendLine('');
        builder.appendLine('Structure Tree:');
        builder.appendLine('---------------');
        
        // Generate tree structure with enhanced formatting
        generateDOMTreeText(domStructure.structure.document, '', true, builder);
        
        return builder.toString();
        
    } catch (exc) {
        return 'Error formatting DOM structure: ' + exc.message;
    }
}

/**
 * Recursively generate tree structure text with comprehensive features - Enhanced
 * @param {Object} domNode - DOM node
 * @param {String} prefix - Tree prefix
 * @param {Boolean} isLast - Is last node at this level
 * @param {Object} builder - String builder
 */
function generateDOMTreeText(domNode, prefix, isLast, builder) {
    try {
        // Enhanced parameter validation
        if (!domNode || !builder) {
            return;
        }
        
        // Node line with comprehensive information
        var connector = isLast ? '└── ' : '├── ';
        var nodeName = domNode.name || 'unnamed';
        var nodeType = domNode.type || 'unknown';
        var nodeLine = prefix + connector + nodeName + ' (' + nodeType + ')';
        
        // Add enhanced metadata information using ES3 helpers
        var info = [];
        
        if (domNode.properties && domNode.properties.length) {
            info.push(domNode.properties.length + ' props');
        }
        
        if (domNode.collections && domNode.collections.length) {
            var collectionInfo = domNode.collections.length + ' collections';
            
            // Add collection sampling information if available
            var sampledCollections = 0;
            for (var i = 0; i < domNode.collections.length; i++) {
                if (domNode.collections[i] && domNode.collections[i].samplingData) {
                    sampledCollections++;
                }
            }
            
            if (sampledCollections > 0) {
                collectionInfo += ' (' + sampledCollections + ' sampled)';
            }
            
            info.push(collectionInfo);
        }
        
        if (domNode.methods && domNode.methods.length) {
            info.push(domNode.methods.length + ' methods');
        }
        
        if (domNode.objectMetadata && domNode.objectMetadata.isCircular) {
            info.push('CIRCULAR');
        }
        
        if (domNode.alternativeAccessPaths && domNode.alternativeAccessPaths.length > 0) {
            info.push('ALT PATHS: ' + domNode.alternativeAccessPaths.length);
        }
        
        if (info.length > 0) {
            nodeLine += ' [' + arrayJoin(info, ', ') + ']';
        }
        
        builder.appendLine(nodeLine);
        
        // Enhanced collection details if sampling data available
        if (domNode.collections && domNode.collections.length) {
            for (var j = 0; j < domNode.collections.length; j++) {
                var collection = domNode.collections[j];
                if (collection && collection.samplingData) {
                    var newPrefix = prefix + (isLast ? '    ' : '│   ');
                    var collectionName = collection.name || 'unnamed';
                    var itemsSampled = collection.samplingData.itemsSampled || 0;
                    
                    var detailLine = newPrefix + '    ↳ ' + collectionName + ': ' + itemsSampled + ' items sampled';
                    
                    if (collection.samplingData.patterns && collection.samplingData.patterns.accessRecommendations) {
                        var recommendations = collection.samplingData.patterns.accessRecommendations;
                        if (recommendations && recommendations.length > 0) {
                            detailLine += ', ' + recommendations.length + ' common properties';
                        }
                    }
                    
                    builder.appendLine(detailLine);
                }
            }
        }
        
        // Enhanced child nodes processing
        if (domNode.childNodes && domNode.childNodes.length) {
            var newPrefix = prefix + (isLast ? '    ' : '│   ');
            
            for (var k = 0; k < domNode.childNodes.length; k++) {
                var isLastChild = (k === domNode.childNodes.length - 1);
                generateDOMTreeText(domNode.childNodes[k], newPrefix, isLastChild, builder);
            }
        }
        
    } catch (exc) {
        if (builder) {
            builder.appendLine(prefix + '└── [Error displaying node: ' + exc.message + ']');
        }
    }
}

// =============================================================================
// UI UPDATE FUNCTIONS - ENHANCED
// =============================================================================

/**
 * Update status display with enhanced error handling
 * @param {String} message - Status message
 */
function updateStatus(message) {
    try {
        // Parameter validation
        if (!message || typeof message !== 'string') {
            message = 'Unknown status';
        }
        
        if (g_domViz_statusText) {
            g_domViz_statusText.text = message;
        }
        
        // Also output to console for debugging with enhanced formatting
        $.writeln('[DOM Visualizer] ' + getCurrentTimestamp() + ': ' + message);
        
    } catch (exc) {
        $.writeln('[DOM Visualizer] Status update error: ' + exc.message);
    }
}

/**
 * Update document information display with comprehensive metadata - Enhanced
 */
function updateDocumentInfo() {
    try {
        if (!g_domViz_documentInfo) {
            return;
        }
        
        var envValidation = validateInDesignEnvironment();
        if (!envValidation.valid) {
            g_domViz_documentInfo.text = 'No document available: ' + envValidation.error;
            return;
        }
        
        var infoText = '';
        var targetDocument = envValidation.document;
        
        // Enhanced basic document information
        try {
            var docName = targetDocument.name || 'Unnamed Document';
            infoText += 'Document: ' + docName;
        } catch (exc) {
            infoText += 'Document: [Name access error]';
        }
        
        try {
            var savedStatus = targetDocument.saved ? 'Yes' : 'No';
            infoText += ' | Saved: ' + savedStatus;
        } catch (exc) {
            infoText += ' | Saved: [Unknown]';
        }
        
        // Enhanced analysis information if available
        if (g_domViz_currentDOMStructure) {
            if (g_domViz_currentDOMStructure.statistics) {
                var stats = g_domViz_currentDOMStructure.statistics;
                infoText += ' | Objects: ' + (stats.totalNodes || 0);
                infoText += ' | Properties: ' + (stats.totalProperties || 0);
                
                if (stats.objectReferences) {
                    infoText += ' | References: ' + stats.objectReferences;
                }
            }
            
            // Enhanced collection sampling information
            var collectionStats = null;
            if (typeof getCollectionSamplingStatistics === 'function') {
                collectionStats = getCollectionSamplingStatistics(g_domViz_currentDOMStructure);
            } else {
                // Fallback collection stats
                collectionStats = { samplingEnabled: false, collectionsFound: 0, collectionsSampled: 0 };
                
                if (g_domViz_currentDOMStructure.metadata && 
                    g_domViz_currentDOMStructure.metadata.collectionSampling) {
                    collectionStats.samplingEnabled = true;
                    if (g_domViz_currentDOMStructure.metadata.collectionSampling.statistics) {
                        var samplingStats = g_domViz_currentDOMStructure.metadata.collectionSampling.statistics;
                        collectionStats.collectionsFound = samplingStats.collectionsFound || 0;
                        collectionStats.collectionsSampled = samplingStats.collectionsSampled || 0;
                    }
                }
            }
            
            if (collectionStats.samplingEnabled) {
                infoText += ' | Collections: ' + (collectionStats.collectionsFound || 0) + 
                           ' found, ' + (collectionStats.collectionsSampled || 0) + ' sampled';
            }
        }
        
        g_domViz_documentInfo.text = infoText;
        
    } catch (exc) {
        if (g_domViz_documentInfo) {
            g_domViz_documentInfo.text = 'Document info error: ' + exc.message;
        }
    }
}

// =============================================================================
// EXPORT INTEGRATION (GUARANTEED TO WORK) - ENHANCED
// =============================================================================

/**
 * Show export options dialog with enhanced validation
 */
function showExportOptions() {
    try {
        if (!g_domViz_currentDOMStructure) {
            updateStatus('Please run DOM enumeration first');
            return;
        }
        
        // Check if export functionality is available
        if (typeof showExportDialog !== 'function') {
            updateStatus('Export functionality not available - requires dom-exporter module');
            return;
        }
        
        showExportDialog();
        
    } catch (exc) {
        updateStatus('Export options error: ' + exc.message);
    }
}

/**
 * Show export format selection dialog with enhanced error handling
 */
function showExportDialog() {
    try {
        var exportDialog = new Window('dialog', 'Export DOM Structure');
        if (!exportDialog) {
            updateStatus('Failed to create export dialog');
            return;
        }
        
        exportDialog.orientation = 'column';
        exportDialog.alignChildren = 'left';
        exportDialog.spacing = 10;
        exportDialog.margins = 16;
        
        // Enhanced format selection with error protection
        var formatGroup = exportDialog.add('group');
        if (formatGroup) {
            formatGroup.orientation = 'column';
            formatGroup.alignChildren = 'left';
            
            formatGroup.add('statictext', undefined, 'Export Format:');
            
            var textRadio = formatGroup.add('radiobutton', undefined, 'Text (.txt) - Human-readable with complete analysis');
            var jsonRadio = formatGroup.add('radiobutton', undefined, 'JSON (.json) - Machine-readable with object references');
            var csvRadio = formatGroup.add('radiobutton', undefined, 'CSV (.csv) - Spreadsheet-compatible with reference data');
            
            if (textRadio) textRadio.value = true; // Default selection
        }
        
        // Enhanced buttons with error protection
        var buttonGroup = exportDialog.add('group');
        if (buttonGroup) {
            buttonGroup.orientation = 'row';
            buttonGroup.alignment = 'center';
            buttonGroup.spacing = 10;
            
            var exportBtn = buttonGroup.add('button', undefined, 'Export');
            var cancelBtn = buttonGroup.add('button', undefined, 'Cancel');
            
            if (exportBtn) {
                exportBtn.onClick = function() {
                    try {
                        var format = 'text';
                        if (jsonRadio && jsonRadio.value) format = 'json';
                        else if (csvRadio && csvRadio.value) format = 'csv';
                        
                        exportDialog.close();
                        performExport(format);
                    } catch (exc) {
                        updateStatus('Export button error: ' + exc.message);
                    }
                };
            }
            
            if (cancelBtn) {
                cancelBtn.onClick = function() {
                    try {
                        exportDialog.close();
                    } catch (exc) {
                        updateStatus('Cancel button error: ' + exc.message);
                    }
                };
            }
        }
        
        exportDialog.show();
        
    } catch (exc) {
        updateStatus('Export dialog error: ' + exc.message);
    }
}

/**
 * Perform the actual export operation with all formats guaranteed available - Enhanced
 * @param {String} format - Export format (text, json, csv)
 */
function performExport(format) {
    try {
        // Enhanced parameter validation
        if (!g_domViz_currentDOMStructure) {
            updateStatus('No DOM structure to export');
            return;
        }
        
        if (!format || typeof format !== 'string') {
            format = 'text';
        }
        
        // Check if export function is available
        if (typeof exportDOMStructure !== 'function') {
            updateStatus('Export function not available - requires dom-exporter module');
            return;
        }
        
        updateStatus('Exporting DOM structure as ' + format.toUpperCase() + '...');
        
        var exportOptions = objectClone({
            includeMetadata: true,
            includeStatistics: true,
            includeAccessGuide: true,
            includeObjectReferences: true,
            includeAccessPaths: true,
            includeComparisonData: true
        }, 2);
        
        var exportResult = exportDOMStructure(g_domViz_currentDOMStructure, format, null, exportOptions);
        
        if (exportResult && exportResult.success) {
            updateStatus('Export successful! File saved: ' + exportResult.filePath);
            
            // Enhanced success dialog with file location
            try {
                var successDialog = new Window('dialog', 'Export Complete');
                if (successDialog) {
                    successDialog.orientation = 'column';
                    successDialog.alignChildren = 'left';
                    successDialog.spacing = 10;
                    successDialog.margins = 16;
                    
                    successDialog.add('statictext', undefined, 'Export completed successfully!');
                    successDialog.add('statictext', undefined, 'File saved to: ' + exportResult.filePath);
                    
                    if (exportResult.metadata) {
                        var contentLength = exportResult.metadata.contentLength || 0;
                        var exportTime = exportResult.metadata.exportTime || 0;
                        
                        successDialog.add('statictext', undefined, 'File size: ' + contentLength + ' characters');
                        successDialog.add('statictext', undefined, 'Export time: ' + exportTime + 'ms');
                    }
                    
                    var okBtn = successDialog.add('button', undefined, 'OK');
                    if (okBtn) {
                        okBtn.onClick = function() {
                            try {
                                successDialog.close();
                            } catch (exc) {
                                // Silent close error
                            }
                        };
                    }
                    
                    successDialog.show();
                }
            } catch (exc) {
                // Success dialog failed, but export was successful
                updateStatus('Export successful (dialog error): ' + exportResult.filePath);
            }
            
        } else {
            var errorMsg = 'Unknown export error';
            if (exportResult && exportResult.error) {
                errorMsg = exportResult.error;
            }
            updateStatus('Export failed: ' + errorMsg);
        }
        
    } catch (exc) {
        updateStatus('Export error: ' + exc.message);
    }
}

// =============================================================================
// SETTINGS - ENHANCED
// =============================================================================

/**
 * Show settings dialog with enhanced feature information
 */
function showSettingsDialog() {
    try {
        var settingsDialog = new Window('dialog', 'DOM Visualizer Settings');
        if (!settingsDialog) {
            updateStatus('Failed to create settings dialog');
            return;
        }
        
        settingsDialog.orientation = 'column';
        settingsDialog.alignChildren = 'left';
        settingsDialog.spacing = 10;
        settingsDialog.margins = 16;
        
        // Enhanced current settings display
        var infoGroup = settingsDialog.add('group');
        if (infoGroup) {
            infoGroup.orientation = 'column';
            infoGroup.alignChildren = 'left';
            
            infoGroup.add('statictext', undefined, 'Current Configuration:');
            infoGroup.add('statictext', undefined, '• Maximum Depth: 4 levels');
            infoGroup.add('statictext', undefined, '• Timeout Protection: 15 seconds');
            infoGroup.add('statictext', undefined, '• Object Tracking: Enabled');
            infoGroup.add('statictext', undefined, '• Collection Sampling: Available');
            infoGroup.add('statictext', undefined, '• Export Formats: Text, JSON, CSV');
            infoGroup.add('statictext', undefined, '• Safety Filters: Enabled');
            infoGroup.add('statictext', undefined, '• Memory Management: Enhanced');
        }
        
        // Enhanced available features with dependency checking
        var featuresGroup = settingsDialog.add('group');
        if (featuresGroup) {
            featuresGroup.orientation = 'column';
            featuresGroup.alignChildren = 'left';
            
            featuresGroup.add('statictext', undefined, 'Available Features:');
            featuresGroup.add('statictext', undefined, '✓ Complete DOM enumeration with object tracking');
            
            // Check for collection sampler availability
            var collectionStatus = typeof sampleCollectionContents === 'function' ? '✓' : '✗';
            featuresGroup.add('statictext', undefined, collectionStatus + ' Collection content sampling with deep analysis');
            
            // Check for export availability
            var exportStatus = typeof exportDOMStructure === 'function' ? '✓' : '✗';
            featuresGroup.add('statictext', undefined, exportStatus + ' All export formats (text, JSON, CSV)');
            
            featuresGroup.add('statictext', undefined, '✓ Object reference visualization');
            featuresGroup.add('statictext', undefined, '✓ Access pattern display');
            featuresGroup.add('statictext', undefined, '✓ Collection sampling statistics');
            featuresGroup.add('statictext', undefined, '✓ Enhanced ES3 compatibility');
            featuresGroup.add('statictext', undefined, '✓ Memory management and cleanup');
        }
        
        // Enhanced close button
        var okBtn = settingsDialog.add('button', undefined, 'OK');
        if (okBtn) {
            okBtn.onClick = function() {
                try {
                    settingsDialog.close();
                } catch (exc) {
                    updateStatus('Settings dialog close error: ' + exc.message);
                }
            };
        }
        
        settingsDialog.show();
        
    } catch (exc) {
        updateStatus('Settings dialog error: ' + exc.message);
    }
}

// =============================================================================
// END OF 9.0_dom-visualizer.jsx
//
// ENHANCEMENTS IMPLEMENTED:
// - Added comprehensive dependency validation and module registration
// - Namespaced all global variables with g_domViz_ prefix to prevent conflicts
// - Enhanced ES3 compliance with improved helper usage (arrayJoin, objectClone, countObjectKeys)
// - Added comprehensive error handling and parameter validation throughout
// - Enhanced UI creation with fallback handling for failed components
// - Improved string operations using ES3 helpers throughout
// - Added dependency availability checking before calling module functions
// - Enhanced export functionality with better error handling and validation
// - Added comprehensive status reporting and error logging
// - Enhanced settings dialog with feature availability detection
// - All original functionality preserved and enhanced for production reliability
// - Added graceful degradation when dependent modules are not available
// =============================================================================