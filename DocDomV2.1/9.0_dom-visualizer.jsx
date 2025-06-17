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
        
        // Create and show new visualizer UI with error handling
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
 * Create main DOM visualization interface with error handling
 * @returns {Object} Window dialog object
 */
function createDOMVisualizerUI() {
    try {
        // Parameter validation and window creation
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
        
        // Window configuration with error protection
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
        
        // Create UI panels with error handling
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
// UI PANEL CREATION
// =============================================================================

/**
 * Create document information panel with error handling
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
        
        // Title with font handling
        var titleText = infoGroup.add('statictext', undefined, 'DOCUMENT INFORMATION');
        if (titleText) {
            try {
                titleText.graphics.font = ScriptUI.newFont('Arial', 'BOLD', 12);
            } catch (exc) {
                // Font setting failed - continue with default
            }
        }
        
        // Document info display with sizing
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
 * Create DOM tree display panel with error handling
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
        
        // Title with font handling
        var titleText = displayGroup.add('statictext', undefined, 'DOM STRUCTURE TREE');
        if (titleText) {
            try {
                titleText.graphics.font = ScriptUI.newFont('Arial', 'BOLD', 12);
            } catch (exc) {
                // Font setting failed - continue with default
            }
        }
        
        // Scrollable text area for DOM tree with configuration
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
 * Create control panel with action buttons and error handling
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
        
        // Main action buttons with error handling
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
 * Create status panel with error handling
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
// CORE OPERATIONS - INTEGRATED VALUE EXTRACTION
// =============================================================================

/**
 * Execute DOM enumeration with integrated value extraction and display results
 */
function runDOMEnumeration() {
    try {
        updateStatus('Starting DOM enumeration...');
        
        // Environment validation
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
        
        // Perform DOM enumeration with progress tracking and configuration
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
        
        updateStatus('DOM enumeration complete! Starting value extraction...');
        
        // INTEGRATED VALUE EXTRACTION - Extract actual property values from discovered structure
        if (typeof sampleDOMValues === 'function') {
            updateStatus('Extracting property values from discovered structure...');
            
            try {
                var valueConfig = objectClone({
                    safetyFilter: 'moderate',
                    maxSamples: 20,
                    timeoutMs: 5000,
                    includeCollectionSamples: false,
                    maxStringLength: 200,
                    trackObjectReferences: true,
                    includeValueMetadata: true,
                    generateValueFingerprints: true
                }, 2);
                
                var structureWithValues = sampleDOMValues(
                    g_domViz_currentDOMStructure, 
                    envValidation.document,
                    valueConfig
                );
                
                if (structureWithValues) {
                    g_domViz_currentDOMStructure = structureWithValues;
                    updateStatus('Value extraction complete! Processing display...');
                } else {
                    updateStatus('Value extraction returned no results');
                }
                
            } catch (extractionExc) {
                updateStatus('Value extraction error: ' + extractionExc.message);
            }
        } else {
            updateStatus('Warning: Value extraction not available - showing structure only');
        }
        
        // Update display with extracted values
        var displayText = formatDOMForDisplay(g_domViz_currentDOMStructure);
        if (g_domViz_domDisplay && displayText) {
            g_domViz_domDisplay.text = displayText;
        }
        
        // Update document info
        updateDocumentInfo();
        
        // Success status with comprehensive statistics including extracted values
        var domStats = null;
        if (typeof getDOMStatistics === 'function') {
            domStats = getDOMStatistics(g_domViz_currentDOMStructure);
        } else {
            // Fallback statistics
            domStats = {
                totalNodes: g_domViz_currentDOMStructure.statistics ? g_domViz_currentDOMStructure.statistics.totalNodes : 0,
                totalProperties: g_domViz_currentDOMStructure.statistics ? g_domViz_currentDOMStructure.statistics.totalProperties : 0,
                objectReferences: g_domViz_currentDOMStructure.statistics ? g_domViz_currentDOMStructure.statistics.objectReferences : 0
            };
        }
        
        var samplingStats = null;
        if (typeof getSamplingStatistics === 'function') {
            samplingStats = getSamplingStatistics(g_domViz_currentDOMStructure);
        } else {
            // Fallback sampling stats
            samplingStats = {
                valuesSampled: 0,
                propertiesSampled: 0
            };
            
            if (g_domViz_currentDOMStructure.metadata && 
                g_domViz_currentDOMStructure.metadata.valueSampling && 
                g_domViz_currentDOMStructure.metadata.valueSampling.statistics) {
                var valueStats = g_domViz_currentDOMStructure.metadata.valueSampling.statistics;
                samplingStats.valuesSampled = valueStats.valuesSampled || 0;
                samplingStats.propertiesSampled = valueStats.propertiesSampled || 0;
            }
        }
        
        var totalNodes = domStats.totalNodes || 0;
        var totalProperties = domStats.totalProperties || 0;
        var objectReferences = domStats.objectReferences || 0;
        var valuesExtracted = samplingStats.valuesSampled || 0;
        var propertiesSampled = samplingStats.propertiesSampled || 0;
        
        updateStatus('Complete! Found ' + totalNodes + ' objects, ' + 
                    totalProperties + ' properties. ' +
                    'Extracted ' + valuesExtracted + ' actual values from ' + 
                    propertiesSampled + ' properties in ' + elapsedTime + 'ms. ' +
                    'Object references: ' + objectReferences);
        
    } catch (exc) {
        updateStatus('Enumeration error: ' + exc.message);
    }
}

/**
 * Execute collection sampling and display results
 */
function runCollectionSampling() {
    try {
        if (!g_domViz_currentDOMStructure) {
            updateStatus('Please run DOM enumeration first');
            return;
        }
        
        updateStatus('Sampling collection contents...');
        
        // Environment validation
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
        
        // Perform collection sampling with progress tracking and configuration
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
        
        var structureWithCollections = sampleCollectionContents(g_domViz_currentDOMStructure, envValidation.document, config);
        
        var elapsedTime = new Date().getTime() - startTime;
        
        if (!structureWithCollections) {
            updateStatus('Collection sampling failed');
            return;
        }
        
        // Update stored structure
        g_domViz_currentDOMStructure = structureWithCollections;
        
        // Update display with collection information
        var displayText = formatDOMForDisplay(structureWithCollections);
        if (g_domViz_domDisplay && displayText) {
            g_domViz_domDisplay.text = displayText;
        }
        
        // Update document info
        updateDocumentInfo();
        
        // Success status with collection sampling statistics
        var collectionStats = null;
        if (typeof getCollectionSamplingStatistics === 'function') {
            collectionStats = getCollectionSamplingStatistics(structureWithCollections);
        } else {
            // Fallback statistics
            collectionStats = {
                collectionsSampled: 0,
                totalItemsSampled: 0
            };
            
            if (structureWithCollections.metadata && structureWithCollections.metadata.collectionSampling && 
                structureWithCollections.metadata.collectionSampling.statistics) {
                var stats = structureWithCollections.metadata.collectionSampling.statistics;
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
// DISPLAY FUNCTIONS - SHOW EXTRACTED VALUES
// =============================================================================

/**
 * Convert DOM structure to human-readable tree format with extracted values - ES3 compliant
 * @param {Object} domStructure - DOM structure to format
 * @returns {String} Formatted tree with comprehensive metadata and extracted values
 */
function formatDOMForDisplay(domStructure) {
    try {
        // Parameter validation
        if (!domStructure || typeof domStructure !== 'object') {
            return 'No DOM structure available';
        }
        
        if (!domStructure.structure || !domStructure.structure.document) {
            return 'No DOM structure available - missing document data';
        }
        
        var builder = createStringBuilder();
        
        // Header with comprehensive metadata
        builder.appendLine('InDesign DOM Structure Analysis with Value Extraction');
        builder.appendLine('======================================================');
        
        if (domStructure.metadata) {
            var docName = domStructure.metadata.documentName || 'Unknown';
            var timestamp = domStructure.metadata.timestamp || 'Unknown';
            
            builder.appendLine('Document: ' + docName);
            builder.appendLine('Analysis Time: ' + timestamp);
            
            if (domStructure.metadata.collectionSampling && domStructure.metadata.collectionSampling.enabled) {
                builder.appendLine('Collection Sampling: Enabled');
            }
            
            // VALUE EXTRACTION INFORMATION
            if (domStructure.metadata.valueSampling && domStructure.metadata.valueSampling.enabled) {
                builder.appendLine('Value Extraction: Enabled');
                if (domStructure.metadata.valueSampling.statistics) {
                    var valueStats = domStructure.metadata.valueSampling.statistics;
                    builder.appendLine('Values Extracted: ' + (valueStats.valuesSampled || 0) + 
                                     ' from ' + (valueStats.propertiesSampled || 0) + ' properties');
                }
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
        builder.appendLine('Structure Tree with Extracted Values:');
        builder.appendLine('------------------------------------');
        
        // Generate tree structure with extracted values
        generateDOMTreeText(domStructure.structure.document, '', true, builder);
        
        return builder.toString();
        
    } catch (exc) {
        return 'Error formatting DOM structure: ' + exc.message;
    }
}

/**
 * Recursively generate tree structure text with extracted values - Show Actual Values
 * @param {Object} domNode - DOM node
 * @param {String} prefix - Tree prefix
 * @param {Boolean} isLast - Is last node at this level
 * @param {Object} builder - String builder
 */
function generateDOMTreeText(domNode, prefix, isLast, builder) {
    try {
        // Parameter validation
        if (!domNode || !builder) {
            return;
        }
        
        // Node line with comprehensive information
        var connector = isLast ? '└── ' : '├── ';
        var nodeName = domNode.name || 'unnamed';
        var nodeType = domNode.type || 'unknown';
        var nodeLine = prefix + connector + nodeName + ' (' + nodeType + ')';
        
        // Add metadata information using ES3 helpers
        var info = [];
        
        // Show extracted values count
        var extractedValueCount = 0;
        if (domNode.properties && domNode.properties.length) {
            for (var i = 0; i < domNode.properties.length; i++) {
                if (domNode.properties[i] && domNode.properties[i].extractedValue !== null) {
                    extractedValueCount++;
                }
            }
            info.push(domNode.properties.length + ' props (' + extractedValueCount + ' values)');
        }
        
        if (domNode.collections && domNode.collections.length) {
            var collectionInfo = domNode.collections.length + ' collections';
            
            // Add collection sampling information if available
            var sampledCollections = 0;
            for (var j = 0; j < domNode.collections.length; j++) {
                if (domNode.collections[j] && domNode.collections[j].samplingData) {
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
        
        // SHOW EXTRACTED PROPERTY VALUES
        if (domNode.properties && domNode.properties.length) {
            var newPrefix = prefix + (isLast ? '    ' : '│   ');
            
            for (var k = 0; k < Math.min(domNode.properties.length, 5); k++) {
                var propertyData = domNode.properties[k];
                if (propertyData && propertyData.extractedValue !== null && propertyData.extractedValue !== undefined) {
                    var valueLine = newPrefix + '    ↳ ' + propertyData.name + ': ';
                    
                    if (propertyData.samplingMetadata && propertyData.samplingMetadata.actualValue) {
                        valueLine += propertyData.samplingMetadata.actualValue;
                    } else {
                        // Fallback display
                        var valueStr = String(propertyData.extractedValue);
                        if (valueStr.length > 50) {
                            valueStr = valueStr.substring(0, 50) + '...';
                        }
                        valueLine += valueStr;
                    }
                    
                    builder.appendLine(valueLine);
                }
            }
            
            if (extractedValueCount > 5) {
                builder.appendLine(newPrefix + '    ... and ' + (extractedValueCount - 5) + ' more extracted values');
            }
        }
        
        // Collection details if sampling data available
        if (domNode.collections && domNode.collections.length) {
            for (var l = 0; l < domNode.collections.length; l++) {
                var collection = domNode.collections[l];
                if (collection && collection.samplingData) {
                    var collNewPrefix = prefix + (isLast ? '    ' : '│   ');
                    var collectionName = collection.name || 'unnamed';
                    var itemsSampled = collection.samplingData.itemsSampled || 0;
                    
                    var detailLine = collNewPrefix + '    ↳ ' + collectionName + ': ' + itemsSampled + ' items sampled';
                    
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
        
        // Child nodes processing
        if (domNode.childNodes && domNode.childNodes.length) {
            var childNewPrefix = prefix + (isLast ? '    ' : '│   ');
            
            for (var m = 0; m < domNode.childNodes.length; m++) {
                var isLastChild = (m === domNode.childNodes.length - 1);
                generateDOMTreeText(domNode.childNodes[m], childNewPrefix, isLastChild, builder);
            }
        }
        
    } catch (exc) {
        if (builder) {
            builder.appendLine(prefix + '└── [Error displaying node: ' + exc.message + ']');
        }
    }
}

// =============================================================================
// UI UPDATE FUNCTIONS
// =============================================================================

/**
 * Update status display with error handling
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
        
        // Also output to console for debugging with formatting
        $.writeln('[DOM Visualizer] ' + getCurrentTimestamp() + ': ' + message);
        
    } catch (exc) {
        $.writeln('[DOM Visualizer] Status update error: ' + exc.message);
    }
}

/**
 * Update document information display with comprehensive metadata including extracted values
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
        
        // Basic document information
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
        
        // Analysis information if available
        if (g_domViz_currentDOMStructure) {
            if (g_domViz_currentDOMStructure.statistics) {
                var stats = g_domViz_currentDOMStructure.statistics;
                infoText += ' | Objects: ' + (stats.totalNodes || 0);
                infoText += ' | Properties: ' + (stats.totalProperties || 0);
                
                if (stats.objectReferences) {
                    infoText += ' | References: ' + stats.objectReferences;
                }
            }
            
            // VALUE EXTRACTION INFORMATION
            var samplingStats = null;
            if (typeof getSamplingStatistics === 'function') {
                samplingStats = getSamplingStatistics(g_domViz_currentDOMStructure);
            } else {
                // Fallback value extraction stats
                samplingStats = { samplingEnabled: false, valuesSampled: 0, propertiesSampled: 0 };
                
                if (g_domViz_currentDOMStructure.metadata && 
                    g_domViz_currentDOMStructure.metadata.valueSampling) {
                    samplingStats.samplingEnabled = true;
                    if (g_domViz_currentDOMStructure.metadata.valueSampling.statistics) {
                        var valueStats = g_domViz_currentDOMStructure.metadata.valueSampling.statistics;
                        samplingStats.valuesSampled = valueStats.valuesSampled || 0;
                        samplingStats.propertiesSampled = valueStats.propertiesSampled || 0;
                    }
                }
            }
            
            if (samplingStats.samplingEnabled) {
                infoText += ' | Values: ' + (samplingStats.valuesSampled || 0) + 
                           ' extracted from ' + (samplingStats.propertiesSampled || 0) + ' properties';
            }
            
            // Collection sampling information
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
                        var collStats = g_domViz_currentDOMStructure.metadata.collectionSampling.statistics;
                        collectionStats.collectionsFound = collStats.collectionsFound || 0;
                        collectionStats.collectionsSampled = collStats.collectionsSampled || 0;
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
// EXPORT INTEGRATION
// =============================================================================

/**
 * Show export options dialog with validation
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
 * Show export format selection dialog with error handling
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
        
        // Format selection with error protection
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
        
        // Buttons with error protection
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
                        var formatValue = 'text';
                        if (jsonRadio && jsonRadio.value) formatValue = 'json';
                        else if (csvRadio && csvRadio.value) formatValue = 'csv';
                        
                        exportDialog.close();
                        performExport(formatValue);
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
 * Perform the actual export operation with all formats available
 * @param {String} formatValue - Export format (text, json, csv)
 */
function performExport(formatValue) {
    try {
        // Parameter validation
        if (!g_domViz_currentDOMStructure) {
            updateStatus('No DOM structure to export');
            return;
        }
        
        if (!formatValue || typeof formatValue !== 'string') {
            formatValue = 'text';
        }
        
        // Check if export function is available
        if (typeof exportDOMStructure !== 'function') {
            updateStatus('Export function not available - requires dom-exporter module');
            return;
        }
        
        updateStatus('Exporting DOM structure as ' + formatValue.toUpperCase() + '...');
        
        var exportOptions = objectClone({
            includeMetadata: true,
            includeStatistics: true,
            includeAccessGuide: true,
            includeObjectReferences: true,
            includeAccessPaths: true,
            includeComparisonData: true
        }, 2);
        
        var exportResult = exportDOMStructure(g_domViz_currentDOMStructure, formatValue, null, exportOptions);
        
        if (exportResult && exportResult.success) {
            updateStatus('Export successful! File saved: ' + exportResult.filePath);
            
            // Success dialog with file location
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
// SETTINGS
// =============================================================================

/**
 * Show settings dialog with feature information
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
        
        // Current settings display
        var infoGroup = settingsDialog.add('group');
        if (infoGroup) {
            infoGroup.orientation = 'column';
            infoGroup.alignChildren = 'left';
            
            infoGroup.add('statictext', undefined, 'Current Configuration:');
            infoGroup.add('statictext', undefined, '• Maximum Depth: 4 levels');
            infoGroup.add('statictext', undefined, '• Timeout Protection: 15 seconds');
            infoGroup.add('statictext', undefined, '• Object Tracking: Enabled');
            infoGroup.add('statictext', undefined, '• Value Extraction: Enabled');
            infoGroup.add('statictext', undefined, '• Collection Sampling: Available');
            infoGroup.add('statictext', undefined, '• Export Formats: Text, JSON, CSV');
            infoGroup.add('statictext', undefined, '• Safety Filters: Enabled');
            infoGroup.add('statictext', undefined, '• Memory Management: Enhanced');
        }
        
        // Available features with dependency checking
        var featuresGroup = settingsDialog.add('group');
        if (featuresGroup) {
            featuresGroup.orientation = 'column';
            featuresGroup.alignChildren = 'left';
            
            featuresGroup.add('statictext', undefined, 'Available Features:');
            featuresGroup.add('statictext', undefined, '✓ Complete DOM enumeration with object tracking');
            
            // Check for collection sampler availability
            var collectionStatus = typeof sampleCollectionContents === 'function' ? '✓' : '✗';
            featuresGroup.add('statictext', undefined, collectionStatus + ' Collection content sampling with deep analysis');
            
            // Check for value extraction availability
            var valueStatus = typeof sampleDOMValues === 'function' ? '✓' : '✗';
            featuresGroup.add('statictext', undefined, valueStatus + ' Property value extraction with fingerprinting');
            
            // Check for export availability
            var exportStatus = typeof exportDOMStructure === 'function' ? '✓' : '✗';
            featuresGroup.add('statictext', undefined, exportStatus + ' All export formats (text, JSON, CSV)');
            
            featuresGroup.add('statictext', undefined, '✓ Object reference visualization');
            featuresGroup.add('statictext', undefined, '✓ Access pattern display');
            featuresGroup.add('statictext', undefined, '✓ Collection sampling statistics');
            featuresGroup.add('statictext', undefined, '✓ ES3 compatibility');
            featuresGroup.add('statictext', undefined, '✓ Memory management and cleanup');
        }
        
        // Close button
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
// =============================================================================