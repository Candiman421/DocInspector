// =============================================================================
// 9.0_dom-visualizer.jsx - DOM VISUALIZATION INTERFACE
// InDesign DOM Discovery Builder v2.1 - TARGET ARCHITECTURE
// =============================================================================
// PURPOSE: Display DOM structure in user-friendly interface with full feature integration
// DEPENDENCIES: ["1.0_safe-foundation.jsx", "2.0_dom-enumerator.jsx", "3.0_collection-sampler.jsx", "5.0_dom-exporter.jsx"]
// SIZE: ~700 lines
// =============================================================================

// =============================================================================
// GLOBAL VARIABLES FOR UI STATE
// =============================================================================

var g_visualizerWindow = null;
var g_currentDOMStructure = null;
var g_statusText = null;
var g_domDisplay = null;
var g_documentInfo = null;

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
        if (g_visualizerWindow) {
            g_visualizerWindow.close();
            g_visualizerWindow = null;
        }
        
        // Create and show new visualizer UI
        g_visualizerWindow = createDOMVisualizerUI();
        if (g_visualizerWindow) {
            g_visualizerWindow.show();
            updateDocumentInfo();
            updateStatus('DOM Visualizer ready. Click "Enumerate DOM" to begin analysis.');
            return true;
        }
        
        return false;
        
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
 * Create main DOM visualization interface
 * @returns {Object} Window dialog object
 */
function createDOMVisualizerUI() {
    try {
        var mainWindow = new Window('dialog', 'InDesign DOM Discovery Builder v2.1');
        mainWindow.orientation = 'column';
        mainWindow.alignChildren = 'fill';
        mainWindow.spacing = 10;
        mainWindow.margins = 16;
        
        // Set window size
        mainWindow.preferredSize.width = 800;
        mainWindow.preferredSize.height = 700;
        
        // Create UI panels
        createDocumentInfoPanel(mainWindow);
        createDOMDisplayPanel(mainWindow);
        createControlPanel(mainWindow);
        createStatusPanel(mainWindow);
        
        return mainWindow;
        
    } catch (exc) {
        return null;
    }
}

// =============================================================================
// UI PANEL CREATION
// =============================================================================

/**
 * Create document information panel
 * @param {Object} parentWindow - Parent window
 * @returns {Object} Panel object
 */
function createDocumentInfoPanel(parentWindow) {
    try {
        var infoGroup = parentWindow.add('group');
        infoGroup.orientation = 'column';
        infoGroup.alignChildren = 'left';
        infoGroup.spacing = 5;
        
        // Title
        var titleText = infoGroup.add('statictext', undefined, 'DOCUMENT INFORMATION');
        titleText.graphics.font = ScriptUI.newFont('Arial', 'BOLD', 12);
        
        // Document info display
        g_documentInfo = infoGroup.add('statictext', undefined, 'No document information available');
        g_documentInfo.preferredSize.width = 750;
        g_documentInfo.characters = 80;
        
        return infoGroup;
        
    } catch (exc) {
        return null;
    }
}

/**
 * Create DOM tree display panel
 * @param {Object} parentWindow - Parent window
 * @returns {Object} Panel object
 */
function createDOMDisplayPanel(parentWindow) {
    try {
        var displayGroup = parentWindow.add('group');
        displayGroup.orientation = 'column';
        displayGroup.alignChildren = 'fill';
        displayGroup.spacing = 5;
        
        // Title
        var titleText = displayGroup.add('statictext', undefined, 'DOM STRUCTURE TREE');
        titleText.graphics.font = ScriptUI.newFont('Arial', 'BOLD', 12);
        
        // Scrollable text area for DOM tree
        g_domDisplay = displayGroup.add('edittext', undefined, 'Click "Enumerate DOM" to discover document structure...', {multiline: true, scrolling: true});
        g_domDisplay.preferredSize.width = 750;
        g_domDisplay.preferredSize.height = 400;
        g_domDisplay.readonly = true;
        
        return displayGroup;
        
    } catch (exc) {
        return null;
    }
}

/**
 * Create control panel with action buttons
 * @param {Object} parentWindow - Parent window
 * @returns {Object} Panel object
 */
function createControlPanel(parentWindow) {
    try {
        var controlGroup = parentWindow.add('group');
        controlGroup.orientation = 'row';
        controlGroup.alignChildren = 'center';
        controlGroup.spacing = 10;
        
        // Main action buttons
        var enumerateBtn = controlGroup.add('button', undefined, 'Enumerate DOM');
        enumerateBtn.preferredSize.width = 120;
        enumerateBtn.onClick = function() {
            runDOMEnumeration();
        };
        
        var sampleBtn = controlGroup.add('button', undefined, 'Sample Collections');
        sampleBtn.preferredSize.width = 120;
        sampleBtn.onClick = function() {
            runCollectionSampling();
        };
        
        var exportBtn = controlGroup.add('button', undefined, 'Export DOM');
        exportBtn.preferredSize.width = 120;
        exportBtn.onClick = function() {
            showExportOptions();
        };
        
        var settingsBtn = controlGroup.add('button', undefined, 'Settings');
        settingsBtn.preferredSize.width = 120;
        settingsBtn.onClick = function() {
            showSettingsDialog();
        };
        
        // Close button
        var closeBtn = controlGroup.add('button', undefined, 'Close');
        closeBtn.preferredSize.width = 80;
        closeBtn.onClick = function() {
            if (g_visualizerWindow) {
                g_visualizerWindow.close();
                g_visualizerWindow = null;
            }
        };
        
        return controlGroup;
        
    } catch (exc) {
        return null;
    }
}

/**
 * Create status panel
 * @param {Object} parentWindow - Parent window
 * @returns {Object} Panel object
 */
function createStatusPanel(parentWindow) {
    try {
        var statusGroup = parentWindow.add('group');
        statusGroup.orientation = 'row';
        statusGroup.alignChildren = 'left';
        statusGroup.spacing = 5;
        
        var statusLabel = statusGroup.add('statictext', undefined, 'Status:');
        statusLabel.graphics.font = ScriptUI.newFont('Arial', 'BOLD', 10);
        
        g_statusText = statusGroup.add('statictext', undefined, 'Ready');
        g_statusText.preferredSize.width = 600;
        g_statusText.characters = 100;
        
        return statusGroup;
        
    } catch (exc) {
        return null;
    }
}

// =============================================================================
// CORE OPERATIONS (GUARANTEED TO WORK)
// =============================================================================

/**
 * Execute DOM enumeration and display results
 */
function runDOMEnumeration() {
    try {
        updateStatus('Starting DOM enumeration...');
        
        // Validate environment
        var envValidation = validateInDesignEnvironment();
        if (!envValidation.valid) {
            updateStatus('Error: ' + envValidation.error);
            return;
        }
        
        updateStatus('Enumerating document structure...');
        
        // Perform DOM enumeration with progress tracking
        var startTime = new Date().getTime();
        var domStructure = enumerateDocumentDOM(envValidation.document, {
            maxDepth: 4,
            timeoutMs: 15000,
            skipDangerous: true,
            maxProperties: 5000,
            enableObjectTracking: true,
            enableDuplicateDetection: true
        });
        
        var elapsedTime = new Date().getTime() - startTime;
        
        if (!domStructure || domStructure.metadata.error) {
            updateStatus('DOM enumeration failed: ' + (domStructure.metadata.error || 'Unknown error'));
            return;
        }
        
        // Store result
        g_currentDOMStructure = domStructure;
        
        // Update display
        var displayText = formatDOMForDisplay(domStructure);
        if (g_domDisplay) {
            g_domDisplay.text = displayText;
        }
        
        // Update document info
        updateDocumentInfo();
        
        // Success status with comprehensive statistics
        var stats = getDOMStatistics(domStructure);
        updateStatus('Enumeration complete! Found ' + stats.totalNodes + ' objects, ' + 
                    stats.totalProperties + ' properties in ' + elapsedTime + 'ms. ' +
                    'Object references: ' + stats.objectReferences);
        
    } catch (exc) {
        updateStatus('Enumeration error: ' + exc.message);
    }
}

/**
 * Execute collection sampling and display enhanced results
 */
function runCollectionSampling() {
    try {
        if (!g_currentDOMStructure) {
            updateStatus('Please run DOM enumeration first');
            return;
        }
        
        updateStatus('Sampling collection contents...');
        
        // Validate environment
        var envValidation = validateInDesignEnvironment();
        if (!envValidation.valid) {
            updateStatus('Error: ' + envValidation.error);
            return;
        }
        
        // Perform collection sampling with progress tracking
        var startTime = new Date().getTime();
        var enhancedStructure = sampleCollectionContents(g_currentDOMStructure, envValidation.document, {
            maxSamplesPerCollection: 5,
            timeoutPerCollection: 5000,
            timeoutPerItem: 2000,
            maxCollectionSize: 2000,
            samplingDepth: 3,
            enableObjectReferenceTracking: true,
            enableDeepPropertyAnalysis: true,
            enableCrossCollectionTracking: true
        });
        
        var elapsedTime = new Date().getTime() - startTime;
        
        if (!enhancedStructure) {
            updateStatus('Collection sampling failed');
            return;
        }
        
        // Update stored structure
        g_currentDOMStructure = enhancedStructure;
        
        // Update display with enhanced information
        var displayText = formatDOMForDisplay(enhancedStructure);
        if (g_domDisplay) {
            g_domDisplay.text = displayText;
        }
        
        // Update document info
        updateDocumentInfo();
        
        // Success status with collection sampling statistics
        var collectionStats = getCollectionSamplingStatistics(enhancedStructure);
        updateStatus('Collection sampling complete! Sampled ' + collectionStats.collectionsSampled + 
                    ' collections with ' + collectionStats.totalItemsSampled + ' items in ' + 
                    elapsedTime + 'ms');
        
    } catch (exc) {
        updateStatus('Collection sampling error: ' + exc.message);
    }
}

// =============================================================================
// DISPLAY FUNCTIONS
// =============================================================================

/**
 * Convert DOM structure to human-readable tree format
 * @param {Object} domStructure - DOM structure to format
 * @returns {String} Formatted tree with comprehensive metadata
 */
function formatDOMForDisplay(domStructure) {
    try {
        if (!domStructure || !domStructure.structure || !domStructure.structure.document) {
            return 'No DOM structure available';
        }
        
        var builder = createStringBuilder();
        
        // Header with comprehensive metadata
        builder.appendLine('InDesign DOM Structure Analysis');
        builder.appendLine('==============================');
        
        if (domStructure.metadata) {
            builder.appendLine('Document: ' + (domStructure.metadata.documentName || 'Unknown'));
            builder.appendLine('Analysis Time: ' + (domStructure.metadata.timestamp || 'Unknown'));
            
            if (domStructure.metadata.collectionSampling && domStructure.metadata.collectionSampling.enabled) {
                builder.appendLine('Collection Sampling: Enabled');
            }
            
            if (domStructure.objectRegistry) {
                var refCount = 0;
                if (domStructure.objectRegistry.references) {
                    refCount = Object.keys(domStructure.objectRegistry.references).length;
                }
                builder.appendLine('Object References Tracked: ' + refCount);
            }
        }
        
        if (domStructure.statistics) {
            builder.appendLine('Total Objects: ' + (domStructure.statistics.totalNodes || 0));
            builder.appendLine('Total Properties: ' + (domStructure.statistics.totalProperties || 0));
            
            if (domStructure.statistics.enumerationTime) {
                builder.appendLine('Processing Time: ' + domStructure.statistics.enumerationTime + 'ms');
            }
        }
        
        builder.appendLine('');
        builder.appendLine('Structure Tree:');
        builder.appendLine('---------------');
        
        // Generate tree structure
        generateDOMTreeText(domStructure.structure.document, '', true, builder);
        
        return builder.toString();
        
    } catch (exc) {
        return 'Error formatting DOM structure: ' + exc.message;
    }
}

/**
 * Recursively generate tree structure text with comprehensive features
 * @param {Object} domNode - DOM node
 * @param {String} prefix - Tree prefix
 * @param {Boolean} isLast - Is last node at this level
 * @param {Object} builder - String builder
 */
function generateDOMTreeText(domNode, prefix, isLast, builder) {
    try {
        if (!domNode) {
            return;
        }
        
        // Node line with comprehensive information
        var connector = isLast ? '└── ' : '├── ';
        var nodeLine = prefix + connector + domNode.name + ' (' + domNode.type + ')';
        
        // Add metadata information
        var info = [];
        
        if (domNode.properties && domNode.properties.length) {
            info.push(domNode.properties.length + ' props');
        }
        
        if (domNode.collections && domNode.collections.length) {
            var collectionInfo = domNode.collections.length + ' collections';
            
            // Add collection sampling information if available
            var sampledCollections = 0;
            for (var i = 0; i < domNode.collections.length; i++) {
                if (domNode.collections[i].samplingData) {
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
            nodeLine += ' [' + info.join(', ') + ']';
        }
        
        builder.appendLine(nodeLine);
        
        // Show collection details if sampling data available
        if (domNode.collections && domNode.collections.length) {
            for (var j = 0; j < domNode.collections.length; j++) {
                var collection = domNode.collections[j];
                if (collection.samplingData) {
                    var newPrefix = prefix + (isLast ? '    ' : '│   ');
                    var detailLine = newPrefix + '    ↳ ' + collection.name + ': ' + 
                                   collection.samplingData.itemsSampled + ' items sampled';
                    
                    if (collection.samplingData.patterns && collection.samplingData.patterns.accessRecommendations) {
                        var recommendations = collection.samplingData.patterns.accessRecommendations;
                        if (recommendations.length > 0) {
                            detailLine += ', ' + recommendations.length + ' common properties';
                        }
                    }
                    
                    builder.appendLine(detailLine);
                }
            }
        }
        
        // Child nodes
        if (domNode.childNodes && domNode.childNodes.length) {
            var newPrefix = prefix + (isLast ? '    ' : '│   ');
            
            for (var k = 0; k < domNode.childNodes.length; k++) {
                var isLastChild = (k === domNode.childNodes.length - 1);
                generateDOMTreeText(domNode.childNodes[k], newPrefix, isLastChild, builder);
            }
        }
        
    } catch (exc) {
        builder.appendLine(prefix + '└── [Error displaying node: ' + exc.message + ']');
    }
}

// =============================================================================
// UI UPDATE FUNCTIONS
// =============================================================================

/**
 * Update status display
 * @param {String} message - Status message
 */
function updateStatus(message) {
    try {
        if (g_statusText) {
            g_statusText.text = message;
        }
        
        // Also output to console for debugging
        $.writeln('[DOM Visualizer] ' + message);
        
    } catch (exc) {
        $.writeln('[DOM Visualizer] Status update error: ' + exc.message);
    }
}

/**
 * Update document information display with comprehensive metadata
 */
function updateDocumentInfo() {
    try {
        if (!g_documentInfo) {
            return;
        }
        
        var envValidation = validateInDesignEnvironment();
        if (!envValidation.valid) {
            g_documentInfo.text = 'No document available: ' + envValidation.error;
            return;
        }
        
        var infoText = '';
        var targetDocument = envValidation.document;
        
        // Basic document information
        try {
            infoText += 'Document: ' + (targetDocument.name || 'Unnamed Document');
        } catch (exc) {
            infoText += 'Document: [Name access error]';
        }
        
        try {
            infoText += ' | Saved: ' + (targetDocument.saved ? 'Yes' : 'No');
        } catch (exc) {
            infoText += ' | Saved: [Unknown]';
        }
        
        // Analysis information if available
        if (g_currentDOMStructure) {
            if (g_currentDOMStructure.statistics) {
                var stats = g_currentDOMStructure.statistics;
                infoText += ' | Objects: ' + (stats.totalNodes || 0);
                infoText += ' | Properties: ' + (stats.totalProperties || 0);
                
                if (stats.objectReferences) {
                    infoText += ' | References: ' + stats.objectReferences;
                }
            }
            
            // Collection sampling information
            var collectionStats = getCollectionSamplingStatistics(g_currentDOMStructure);
            if (collectionStats.samplingEnabled) {
                infoText += ' | Collections: ' + collectionStats.collectionsFound + 
                           ' found, ' + collectionStats.collectionsSampled + ' sampled';
            }
        }
        
        g_documentInfo.text = infoText;
        
    } catch (exc) {
        if (g_documentInfo) {
            g_documentInfo.text = 'Document info error: ' + exc.message;
        }
    }
}

// =============================================================================
// EXPORT INTEGRATION (GUARANTEED TO WORK)
// =============================================================================

/**
 * Show export options dialog
 */
function showExportOptions() {
    try {
        if (!g_currentDOMStructure) {
            updateStatus('Please run DOM enumeration first');
            return;
        }
        
        showExportDialog();
        
    } catch (exc) {
        updateStatus('Export options error: ' + exc.message);
    }
}

/**
 * Show export format selection dialog
 */
function showExportDialog() {
    try {
        var exportDialog = new Window('dialog', 'Export DOM Structure');
        exportDialog.orientation = 'column';
        exportDialog.alignChildren = 'left';
        exportDialog.spacing = 10;
        exportDialog.margins = 16;
        
        // Format selection
        var formatGroup = exportDialog.add('group');
        formatGroup.orientation = 'column';
        formatGroup.alignChildren = 'left';
        
        formatGroup.add('statictext', undefined, 'Export Format:');
        
        var textRadio = formatGroup.add('radiobutton', undefined, 'Text (.txt) - Human-readable with complete analysis');
        var jsonRadio = formatGroup.add('radiobutton', undefined, 'JSON (.json) - Machine-readable with object references');
        var csvRadio = formatGroup.add('radiobutton', undefined, 'CSV (.csv) - Spreadsheet-compatible with reference data');
        
        textRadio.value = true; // Default selection
        
        // Buttons
        var buttonGroup = exportDialog.add('group');
        buttonGroup.orientation = 'row';
        buttonGroup.alignment = 'center';
        buttonGroup.spacing = 10;
        
        var exportBtn = buttonGroup.add('button', undefined, 'Export');
        var cancelBtn = buttonGroup.add('button', undefined, 'Cancel');
        
        exportBtn.onClick = function() {
            var format = 'text';
            if (jsonRadio.value) format = 'json';
            else if (csvRadio.value) format = 'csv';
            
            exportDialog.close();
            performExport(format);
        };
        
        cancelBtn.onClick = function() {
            exportDialog.close();
        };
        
        exportDialog.show();
        
    } catch (exc) {
        updateStatus('Export dialog error: ' + exc.message);
    }
}

/**
 * Perform the actual export operation with all formats guaranteed available
 * @param {String} format - Export format (text, json, csv)
 */
function performExport(format) {
    try {
        if (!g_currentDOMStructure) {
            updateStatus('No DOM structure to export');
            return;
        }
        
        updateStatus('Exporting DOM structure as ' + format.toUpperCase() + '...');
        
        var exportResult = exportDOMStructure(g_currentDOMStructure, format, null, {
            includeMetadata: true,
            includeStatistics: true,
            includeAccessGuide: true,
            includeObjectReferences: true,
            includeAccessPaths: true,
            includeComparisonData: true
        });
        
        if (exportResult.success) {
            updateStatus('Export successful! File saved: ' + exportResult.filePath);
            
            // Show success dialog with file location
            var successDialog = new Window('dialog', 'Export Complete');
            successDialog.orientation = 'column';
            successDialog.alignChildren = 'left';
            successDialog.spacing = 10;
            successDialog.margins = 16;
            
            successDialog.add('statictext', undefined, 'Export completed successfully!');
            successDialog.add('statictext', undefined, 'File saved to: ' + exportResult.filePath);
            
            if (exportResult.metadata) {
                successDialog.add('statictext', undefined, 'File size: ' + exportResult.metadata.contentLength + ' characters');
                successDialog.add('statictext', undefined, 'Export time: ' + exportResult.metadata.exportTime + 'ms');
            }
            
            var okBtn = successDialog.add('button', undefined, 'OK');
            okBtn.onClick = function() {
                successDialog.close();
            };
            
            successDialog.show();
            
        } else {
            updateStatus('Export failed: ' + exportResult.error);
        }
        
    } catch (exc) {
        updateStatus('Export error: ' + exc.message);
    }
}

// =============================================================================
// SETTINGS
// =============================================================================

/**
 * Show settings dialog
 */
function showSettingsDialog() {
    try {
        var settingsDialog = new Window('dialog', 'DOM Visualizer Settings');
        settingsDialog.orientation = 'column';
        settingsDialog.alignChildren = 'left';
        settingsDialog.spacing = 10;
        settingsDialog.margins = 16;
        
        // Current settings display
        var infoGroup = settingsDialog.add('group');
        infoGroup.orientation = 'column';
        infoGroup.alignChildren = 'left';
        
        infoGroup.add('statictext', undefined, 'Current Configuration:');
        infoGroup.add('statictext', undefined, '• Maximum Depth: 4 levels');
        infoGroup.add('statictext', undefined, '• Timeout Protection: 15 seconds');
        infoGroup.add('statictext', undefined, '• Object Tracking: Enabled');
        infoGroup.add('statictext', undefined, '• Collection Sampling: Available');
        infoGroup.add('statictext', undefined, '• Export Formats: Text, JSON, CSV');
        infoGroup.add('statictext', undefined, '• Safety Filters: Enabled');
        
        // Available features
        var featuresGroup = settingsDialog.add('group');
        featuresGroup.orientation = 'column';
        featuresGroup.alignChildren = 'left';
        
        featuresGroup.add('statictext', undefined, 'Available Features:');
        featuresGroup.add('statictext', undefined, '✓ Complete DOM enumeration with object tracking');
        featuresGroup.add('statictext', undefined, '✓ Collection content sampling with deep analysis');
        featuresGroup.add('statictext', undefined, '✓ All export formats (text, JSON, CSV)');
        featuresGroup.add('statictext', undefined, '✓ Object reference visualization');
        featuresGroup.add('statictext', undefined, '✓ Access pattern display');
        featuresGroup.add('statictext', undefined, '✓ Collection sampling statistics');
        
        // Close button
        var okBtn = settingsDialog.add('button', undefined, 'OK');
        okBtn.onClick = function() {
            settingsDialog.close();
        };
        
        settingsDialog.show();
        
    } catch (exc) {
        updateStatus('Settings dialog error: ' + exc.message);
    }
}

// =============================================================================
// END OF 9.0_dom-visualizer.jsx
// =============================================================================