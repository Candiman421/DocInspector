//
// 3.0_dom-visualizer.jsx
// InDesign DOM Discovery Builder - DOM Structure Visualization (Enhanced)
// CORE PURPOSE: Display DOM structure in user-friendly interface with collection sampling
// DEPENDENCIES: 1.0_safe-foundation.jsx, 2.0_dom-enumerator.jsx, 6.0_collection-sampler.jsx
// SAFETY: Uses only proven ExtendScript UI patterns
// ES3 COMPATIBLE: No reserved words, no modern JS features
//

// ============================================================================
// GLOBAL STATE FOR UI
// ============================================================================

var DOM_VISUALIZER_STATE = {
    currentDOMStructure: null,
    sourceDocument: null,
    dialog: null,
    displays: {
        domTree: null,
        status: null,
        documentInfo: null
    },
    controls: {
        enumerateButton: null,
        sampleButton: null,
        exportButton: null,
        settingsButton: null
    }
};

// ============================================================================
// MAIN UI CREATION
// ============================================================================

/**
 * Create main DOM visualizer interface
 * @returns {Object} - Window dialog object
 */
function createDOMVisualizerUI() {
    try {
        // Create main dialog
        var dialog = new Window('dialog', 'InDesign DOM Explorer v2.0');
        dialog.orientation = 'column';
        dialog.alignChildren = 'fill';
        dialog.preferredSize.width = 800;
        dialog.preferredSize.height = 750;
        
        // Header panel with document info
        var headerPanel = createDocumentInfoPanel(dialog);
        
        // DOM tree display panel
        var domPanel = createDOMDisplayPanel(dialog);
        
        // Control panel
        var controlPanel = createControlPanel(dialog);
        
        // Status panel
        var statusPanel = createStatusPanel(dialog);
        
        // Close button
        var closeButton = dialog.add('button', undefined, 'Close');
        closeButton.onClick = function() {
            dialog.close();
        };
        
        // Store references
        DOM_VISUALIZER_STATE.dialog = dialog;
        
        return dialog;
        
    } catch (exc) {
        $.writeln('ERROR: Failed to create DOM visualizer UI: ' + exc.message);
        return null;
    }
}

/**
 * Create document information panel
 * @param {Object} parentWindow - Parent window object
 * @returns {Object} - Panel object
 */
function createDocumentInfoPanel(parentWindow) {
    var panel = parentWindow.add('panel', undefined, 'Document Information');
    panel.alignment = 'fill';
    panel.preferredSize.height = 80;
    
    var docInfo = panel.add('statictext', undefined, 'No document loaded');
    docInfo.alignment = 'fill';
    
    // Store reference
    DOM_VISUALIZER_STATE.displays.documentInfo = docInfo;
    
    // Update with current document info
    updateDocumentInfo();
    
    return panel;
}

/**
 * Create DOM tree display panel
 * @param {Object} parentWindow - Parent window object
 * @returns {Object} - Panel object
 */
function createDOMDisplayPanel(parentWindow) {
    var panel = parentWindow.add('panel', undefined, 'DOM Structure Tree');
    panel.alignment = 'fill';
    panel.preferredSize.height = 500;
    
    var domDisplay = panel.add('edittext', undefined, 'Click "Enumerate DOM" to discover document structure...', {
        multiline: true,
        readonly: true,
        scrolling: true
    });
    domDisplay.alignment = 'fill';
    domDisplay.preferredSize.height = 470;
    
    // Store reference
    DOM_VISUALIZER_STATE.displays.domTree = domDisplay;
    
    return panel;
}

/**
 * Create control panel with action buttons
 * @param {Object} parentWindow - Parent window object
 * @returns {Object} - Panel object
 */
function createControlPanel(parentWindow) {
    var panel = parentWindow.add('panel', undefined, 'Actions');
    panel.alignment = 'fill';
    panel.preferredSize.height = 80;
    
    var buttonGroup = panel.add('group');
    buttonGroup.alignment = 'center';
    buttonGroup.spacing = 10;
    
    // Enumerate DOM button
    var enumerateBtn = buttonGroup.add('button', undefined, 'Enumerate DOM');
    enumerateBtn.preferredSize.width = 120;
    enumerateBtn.onClick = function() {
        runDOMEnumeration();
    };
    
    // Sample Collections button (new!)
    var sampleBtn = buttonGroup.add('button', undefined, 'Sample Collections');
    sampleBtn.preferredSize.width = 120;
    sampleBtn.enabled = false; // Enable after enumeration
    sampleBtn.onClick = function() {
        runCollectionSampling();
    };
    
    // Export DOM button
    var exportBtn = buttonGroup.add('button', undefined, 'Export DOM');
    exportBtn.preferredSize.width = 100;
    exportBtn.enabled = false; // Enable after enumeration
    exportBtn.onClick = function() {
        showExportOptions();
    };
    
    // Settings button
    var settingsBtn = buttonGroup.add('button', undefined, 'Settings');
    settingsBtn.preferredSize.width = 80;
    settingsBtn.onClick = function() {
        showSettingsDialog();
    };
    
    // Store references
    DOM_VISUALIZER_STATE.controls.enumerateButton = enumerateBtn;
    DOM_VISUALIZER_STATE.controls.sampleButton = sampleBtn;
    DOM_VISUALIZER_STATE.controls.exportButton = exportBtn;
    DOM_VISUALIZER_STATE.controls.settingsButton = settingsBtn;
    
    return panel;
}

/**
 * Create status panel
 * @param {Object} parentWindow - Parent window object
 * @returns {Object} - Panel object
 */
function createStatusPanel(parentWindow) {
    var panel = parentWindow.add('panel', undefined, 'Status');
    panel.alignment = 'fill';
    panel.preferredSize.height = 60;
    
    var statusText = panel.add('statictext', undefined, 'Ready - Click "Enumerate DOM" to begin discovery');
    statusText.alignment = 'fill';
    
    // Store reference
    DOM_VISUALIZER_STATE.displays.status = statusText;
    
    return panel;
}

// ============================================================================
// DOM ENUMERATION AND DISPLAY
// ============================================================================

/**
 * Execute DOM enumeration and display results
 */
function runDOMEnumeration() {
    try {
        // Check if we already have DOM structure
        if (DOM_VISUALIZER_STATE.currentDOMStructure) {
            var shouldReEnumerate = confirm('DOM structure already discovered.\n\nWould you like to re-enumerate?\n\n(Choose "OK" to re-discover, "Cancel" to keep current results)');
            if (!shouldReEnumerate) {
                updateStatus('Using cached DOM structure - ' + DOM_VISUALIZER_STATE.currentDOMStructure.statistics.totalProperties + ' properties');
                return;
            }
            // Clear existing structure for re-enumeration
            DOM_VISUALIZER_STATE.currentDOMStructure = null;
        }
        
        updateStatus('Validating InDesign environment...');
        
        // Validate environment
        var envResult = validateInDesignEnvironment();
        if (!envResult.valid) {
            updateStatus('ERROR: ' + envResult.error);
            alert('Cannot enumerate DOM:\n\n' + envResult.error);
            return;
        }
        
        var doc = envResult.document;
        DOM_VISUALIZER_STATE.sourceDocument = doc; // Store for collection sampling
        updateStatus('Enumerating DOM structure - please wait...');
        
        // Update button state during operation
        if (DOM_VISUALIZER_STATE.controls.enumerateButton) {
            DOM_VISUALIZER_STATE.controls.enumerateButton.enabled = false;
            DOM_VISUALIZER_STATE.controls.enumerateButton.text = 'Enumerating...';
        }
        
        // Run enumeration with default config
        var config = {
            maxDepth: 2,
            timeoutMs: 8000,
            skipDangerous: true,
            maxProperties: 2000
        };
        
        var domStructure = enumerateDocumentDOM(doc, config);
        
        if (domStructure) {
            // Store result
            DOM_VISUALIZER_STATE.currentDOMStructure = domStructure;
            
            // Display DOM tree
            var treeText = formatDOMForDisplay(domStructure);
            if (DOM_VISUALIZER_STATE.displays.domTree) {
                DOM_VISUALIZER_STATE.displays.domTree.text = treeText;
            }
            
            // Update status with statistics
            var stats = getDOMStatistics(domStructure);
            updateStatus('Enumeration complete - ' + stats.totalProperties + ' properties discovered in ' + stats.enumerationTime + 'ms');
            
            // Enable sampling and export buttons
            if (DOM_VISUALIZER_STATE.controls.sampleButton) {
                DOM_VISUALIZER_STATE.controls.sampleButton.enabled = true;
            }
            if (DOM_VISUALIZER_STATE.controls.exportButton) {
                DOM_VISUALIZER_STATE.controls.exportButton.enabled = true;
            }
            
            // Update document info
            updateDocumentInfo();
            
        } else {
            updateStatus('ERROR: DOM enumeration failed');
            alert('DOM enumeration failed. Check ExtendScript console for details.');
        }
        
    } catch (exc) {
        updateStatus('ERROR: ' + exc.message);
        $.writeln('ERROR: DOM enumeration failed: ' + exc.message);
        alert('DOM enumeration failed:\n\n' + exc.message);
    } finally {
        // Re-enable and restore enumerate button
        if (DOM_VISUALIZER_STATE.controls.enumerateButton) {
            DOM_VISUALIZER_STATE.controls.enumerateButton.enabled = true;
            DOM_VISUALIZER_STATE.controls.enumerateButton.text = DOM_VISUALIZER_STATE.currentDOMStructure ? 'Re-enumerate DOM' : 'Enumerate DOM';
        }
    }
}

/**
 * Execute collection sampling and display enhanced results
 */
function runCollectionSampling() {
    try {
        if (!DOM_VISUALIZER_STATE.currentDOMStructure) {
            alert('Please run DOM enumeration first before sampling collections.');
            return;
        }
        
        if (!DOM_VISUALIZER_STATE.sourceDocument) {
            alert('Document reference not available. Please re-run DOM enumeration.');
            return;
        }
        
        // Check if already sampled
        if (DOM_VISUALIZER_STATE.currentDOMStructure.metadata.collectionSampling) {
            var shouldReSample = confirm('Collections already sampled.\n\nWould you like to re-sample?\n\n(Choose "OK" to re-sample, "Cancel" to keep current results)');
            if (!shouldReSample) {
                updateStatus('Using cached collection sampling data');
                return;
            }
        }
        
        updateStatus('Sampling collection contents - please wait...');
        
        // Update button state during operation
        if (DOM_VISUALIZER_STATE.controls.sampleButton) {
            DOM_VISUALIZER_STATE.controls.sampleButton.enabled = false;
            DOM_VISUALIZER_STATE.controls.sampleButton.text = 'Sampling...';
        }
        
        // Run collection sampling
        var samplingConfig = {
            maxSamplesPerCollection: 3,
            timeoutPerCollection: 3000,
            safetyFilter: 'moderate',
            enableProgressLogging: true
        };
        
        var enhancedDOMStructure = sampleCollectionContents(
            DOM_VISUALIZER_STATE.currentDOMStructure,
            DOM_VISUALIZER_STATE.sourceDocument,
            samplingConfig
        );
        
        if (enhancedDOMStructure) {
            // Update stored structure
            DOM_VISUALIZER_STATE.currentDOMStructure = enhancedDOMStructure;
            
            // Display enhanced DOM tree
            var treeText = formatDOMForDisplay(enhancedDOMStructure);
            if (DOM_VISUALIZER_STATE.displays.domTree) {
                DOM_VISUALIZER_STATE.displays.domTree.text = treeText;
            }
            
            // Update status with sampling statistics
            var samplingStats = getCollectionSamplingStatistics(enhancedDOMStructure);
            updateStatus('Collection sampling complete - ' + samplingStats.collectionsSampled + ' collections sampled, ' + 
                         samplingStats.totalItemsSampled + ' items analyzed');
            
            // Update document info
            updateDocumentInfo();
            
        } else {
            updateStatus('ERROR: Collection sampling failed');
            alert('Collection sampling failed. Check ExtendScript console for details.');
        }
        
    } catch (exc) {
        updateStatus('ERROR: ' + exc.message);
        $.writeln('ERROR: Collection sampling failed: ' + exc.message);
        alert('Collection sampling failed:\n\n' + exc.message);
    } finally {
        // Re-enable and restore sample button
        if (DOM_VISUALIZER_STATE.controls.sampleButton) {
            DOM_VISUALIZER_STATE.controls.sampleButton.enabled = true;
            DOM_VISUALIZER_STATE.controls.sampleButton.text = 'Re-sample Collections';
        }
    }
}

/**
 * Format DOM structure for display in UI (enhanced with collection sampling data)
 * @param {Object} domStructure - DOM structure object
 * @returns {String} - Formatted tree text
 */
function formatDOMForDisplay(domStructure) {
    var builder = createStringBuilder();
    
    // Header
    builder.appendLine('INDESIGN DOCUMENT DOM STRUCTURE');
    builder.appendLine('================================');
    builder.appendLine('');
    
    // Metadata
    if (domStructure.metadata) {
        builder.appendLine('Generated: ' + domStructure.metadata.timestamp);
        builder.appendLine('Document: ' + domStructure.metadata.documentName);
        builder.appendLine('Enumeration Time: ' + domStructure.metadata.enumerationTime + 'ms');
        builder.appendLine('Version: ' + domStructure.metadata.version);
        builder.appendLine('');
    }
    
    // Statistics
    if (domStructure.statistics) {
        builder.appendLine('DISCOVERY STATISTICS:');
        builder.appendLine('Total Objects: ' + domStructure.statistics.totalNodes);
        builder.appendLine('Total Properties: ' + domStructure.statistics.totalProperties);
        builder.appendLine('Max Depth Reached: ' + domStructure.statistics.maxDepthReached);
        builder.appendLine('Circular References: ' + domStructure.statistics.circularRefsDetected);
        builder.appendLine('Timeouts: ' + domStructure.statistics.timeouts);
        builder.appendLine('Errors: ' + domStructure.statistics.errors.length);
        
        // Collection sampling statistics if available
        if (domStructure.metadata.collectionSampling) {
            var samplingStats = getCollectionSamplingStatistics(domStructure);
            builder.appendLine('');
            builder.appendLine('COLLECTION SAMPLING:');
            builder.appendLine('Collections Found: ' + samplingStats.collectionsFound);
            builder.appendLine('Collections Sampled: ' + samplingStats.collectionsSampled);
            builder.appendLine('Items Analyzed: ' + samplingStats.totalItemsSampled);
            builder.appendLine('Properties Discovered: ' + samplingStats.totalPropertiesDiscovered);
            builder.appendLine('Sampling Time: ' + samplingStats.samplingTime + 'ms');
        }
        
        builder.appendLine('');
    }
    
    // DOM Tree
    builder.appendLine('DOM STRUCTURE TREE:');
    builder.appendLine('===================');
    builder.appendLine('');
    
    if (domStructure.structure && domStructure.structure.document) {
        var treeText = generateEnhancedDOMTreeText(domStructure.structure.document, '', true);
        builder.append(treeText);
    } else {
        builder.appendLine('No DOM structure available');
    }
    
    // Property access guide
    builder.appendLine('');
    builder.appendLine('PROPERTY ACCESS EXAMPLES:');
    builder.appendLine('========================');
    builder.appendLine('');
    builder.appendLine('// Safe properties (recommended)');
    if (domStructure.structure && domStructure.structure.document) {
        var examples = generateEnhancedAccessExamples(domStructure.structure.document);
        builder.append(examples);
    }
    
    return builder.toString();
}

/**
 * Generate enhanced DOM tree text with collection sampling data
 * @param {Object} domNode - DOM node to format
 * @param {String} prefix - Current line prefix
 * @param {Boolean} isLast - Whether this is the last child
 * @returns {String} - Formatted tree lines
 */
function generateEnhancedDOMTreeText(domNode, prefix, isLast) {
    var builder = createStringBuilder();
    
    if (!domNode) return '';
    
    // Current node line
    var nodePrefix = prefix + (isLast ? '└── ' : '├── ');
    var nodeLine = nodePrefix + domNode.name + ' (' + domNode.type + ')';
    
    if (domNode.hasCircularRefs) {
        nodeLine += ' [CIRCULAR]';
    }
    
    builder.appendLine(nodeLine);
    
    // Properties
    var allProperties = [];
    if (domNode.properties) allProperties = allProperties.concat(domNode.properties);
    if (domNode.collections) allProperties = allProperties.concat(domNode.collections);
    
    // Show first few properties
    var maxPropsToShow = 8;
    for (var i = 0; i < Math.min(allProperties.length, maxPropsToShow); i++) {
        var prop = allProperties[i];
        var childPrefix = prefix + (isLast ? '    ' : '│   ');
        var propPrefix = childPrefix + (i < maxPropsToShow - 1 ? '├── ' : '└── ');
        var propLine = propPrefix + prop.name + ' (' + prop.type + ') [' + prop.safetyLevel + ']';
        
        if (prop.isCollection) {
            propLine += ' [COLLECTION';
            
            // Add collection sampling info if available
            if (prop.hasSamplingData && prop.samplingData) {
                propLine += ', length: ' + prop.samplingData.collectionLength;
                if (prop.samplingData.commonProperties && prop.samplingData.commonProperties.length > 0) {
                    propLine += ', ' + prop.samplingData.commonProperties.length + ' common props';
                }
            }
            
            propLine += ']';
            
            // Show common properties if available
            if (prop.samplingData && prop.samplingData.commonProperties) {
                for (var j = 0; j < Math.min(prop.samplingData.commonProperties.length, 3); j++) {
                    var commonProp = prop.samplingData.commonProperties[j];
                    var commonPrefix = childPrefix + '    ';
                    var commonLine = commonPrefix + '├── [item].' + commonProp.name + ' (' + commonProp.type + ') [' + commonProp.safetyLevel + ']';
                    builder.appendLine(commonLine);
                }
                if (prop.samplingData.commonProperties.length > 3) {
                    var morePrefix = childPrefix + '    ';
                    builder.appendLine(morePrefix + '└── ... and ' + (prop.samplingData.commonProperties.length - 3) + ' more common properties');
                }
            }
            
        } else {
            builder.appendLine(propLine);
        }
    }
    
    // Show count if there are more properties
    if (allProperties.length > maxPropsToShow) {
        var childPrefix = prefix + (isLast ? '    ' : '│   ');
        builder.appendLine(childPrefix + '└── ... and ' + (allProperties.length - maxPropsToShow) + ' more properties');
    }
    
    return builder.toString();
}

/**
 * Generate enhanced property access examples with collection sampling data
 * @param {Object} domNode - DOM node to analyze
 * @returns {String} - Code examples
 */
function generateEnhancedAccessExamples(domNode) {
    var builder = createStringBuilder();
    
    if (!domNode || !domNode.properties) return '';
    
    // Find safe properties to show as examples
    var safeProps = [];
    for (var i = 0; i < domNode.properties.length; i++) {
        var prop = domNode.properties[i];
        if (prop.safetyLevel === 'safe' && safeProps.length < 5) {
            safeProps.push(prop);
        }
    }
    
    for (var i = 0; i < safeProps.length; i++) {
        var prop = safeProps[i];
        builder.appendLine('var ' + prop.name.replace(/[^a-zA-Z0-9]/g, '') + ' = document.' + prop.name + ';  // ' + prop.type);
    }
    
    if (safeProps.length === 0) {
        builder.appendLine('// No safe properties found for direct access');
    }
    
    // Enhanced: Show collection access patterns if available
    if (domNode.collections) {
        builder.appendLine('');
        builder.appendLine('// Collection access patterns (from sampling):');
        
        for (var i = 0; i < domNode.collections.length; i++) {
            var collection = domNode.collections[i];
            if (collection.hasSamplingData && collection.samplingData.accessPatterns) {
                builder.appendLine('// ' + collection.name + ' collection:');
                builder.appendLine('var ' + collection.name + 'Count = document.' + collection.name + '.length;  // ' + 
                                 (collection.samplingData.collectionLength || 'unknown'));
                
                for (var j = 0; j < Math.min(collection.samplingData.accessPatterns.length, 3); j++) {
                    var pattern = collection.samplingData.accessPatterns[j];
                    var examplePath = pattern.pattern.replace('[index]', '[0]');
                    var varName = (collection.name + pattern.description.split(' ')[1]).replace(/[^a-zA-Z0-9]/g, '');
                    builder.appendLine('var ' + varName + ' = ' + examplePath + ';  // ' + pattern.type + ' [' + pattern.safetyLevel + ']');
                }
                builder.appendLine('');
            }
        }
    }
    
    return builder.toString();
}

// ============================================================================
// UI UPDATE FUNCTIONS
// ============================================================================

/**
 * Update status display
 * @param {String} message - Status message
 */
function updateStatus(message) {
    if (DOM_VISUALIZER_STATE.displays.status) {
        DOM_VISUALIZER_STATE.displays.status.text = message;
    }
    $.writeln('STATUS: ' + message);
}

/**
 * Update document information display
 */
function updateDocumentInfo() {
    try {
        var envResult = validateInDesignEnvironment();
        var infoText = '';
        
        if (envResult.valid) {
            var doc = envResult.document;
            var docName = 'Unknown';
            var pageCount = 'Unknown';
            var saved = 'Unknown';
            
            if (safeTypeCheck(doc, 'name') === 'string') {
                docName = doc.name;
            }
            
            var pages = safeGetLength(doc.pages);
            if (pages >= 0) {
                pageCount = pages.toString();
            }
            
            if (safeTypeCheck(doc, 'saved') === 'boolean') {
                saved = doc.saved ? 'Yes' : 'No';
            }
            
            infoText = 'Document: ' + docName + '  |  Pages: ' + pageCount + '  |  Saved: ' + saved;
            
            if (DOM_VISUALIZER_STATE.currentDOMStructure) {
                var stats = getDOMStatistics(DOM_VISUALIZER_STATE.currentDOMStructure);
                infoText += '  |  Properties: ' + stats.totalProperties;
                
                // Add collection sampling info if available
                if (DOM_VISUALIZER_STATE.currentDOMStructure.metadata.collectionSampling) {
                    var samplingStats = getCollectionSamplingStatistics(DOM_VISUALIZER_STATE.currentDOMStructure);
                    infoText += '  |  Collections: ' + samplingStats.collectionsSampled + '/' + samplingStats.collectionsFound;
                }
            }
            
        } else {
            infoText = 'No document available: ' + envResult.error;
        }
        
        if (DOM_VISUALIZER_STATE.displays.documentInfo) {
            DOM_VISUALIZER_STATE.displays.documentInfo.text = infoText;
        }
        
    } catch (exc) {
        if (DOM_VISUALIZER_STATE.displays.documentInfo) {
            DOM_VISUALIZER_STATE.displays.documentInfo.text = 'Error reading document info: ' + exc.message;
        }
    }
}

// ============================================================================
// EXPORT FUNCTIONALITY (unchanged)
// ============================================================================

/**
 * Show export options dialog (renamed from exportDOMStructure to avoid naming conflict)
 */
function showExportOptions() {
    if (!DOM_VISUALIZER_STATE.currentDOMStructure) {
        alert('No DOM structure to export. Please run enumeration first.');
        return;
    }
    
    try {
        updateStatus('Showing export options...');
        showExportDialog();
    } catch (exc) {
        updateStatus('Export failed: ' + exc.message);
        alert('Export failed:\n\n' + exc.message);
    }
}

/**
 * Show export format selection dialog
 */
function showExportDialog() {
    var exportDialog = new Window('dialog', 'Export DOM Structure');
    exportDialog.orientation = 'column';
    exportDialog.alignChildren = 'fill';
    exportDialog.preferredSize.width = 400;
    exportDialog.preferredSize.height = 300;
    
    // Header
    var headerPanel = exportDialog.add('panel', undefined, 'Export Options');
    headerPanel.add('statictext', undefined, 'Choose export format and options for DOM structure:');
    
    // Format selection
    var formatPanel = exportDialog.add('panel', undefined, 'Export Format');
    var formatGroup = formatPanel.add('group');
    formatGroup.orientation = 'column';
    formatGroup.alignChildren = 'left';
    
    var textRadio = formatGroup.add('radiobutton', undefined, 'Text (.txt) - Human-readable format with access guide');
    var jsonRadio = formatGroup.add('radiobutton', undefined, 'JSON (.json) - Machine-readable structured data');
    var csvRadio = formatGroup.add('radiobutton', undefined, 'CSV (.csv) - Spreadsheet-compatible property list');
    
    textRadio.value = true; // Default selection
    
    // Options
    var optionsPanel = exportDialog.add('panel', undefined, 'Export Options');
    var includeValues = optionsPanel.add('checkbox', undefined, 'Include sample values (if available)');
    var includeStats = optionsPanel.add('checkbox', undefined, 'Include discovery statistics');
    var includeGuide = optionsPanel.add('checkbox', undefined, 'Include property access guide');
    
    includeValues.value = true;
    includeStats.value = true;
    includeGuide.value = true;
    
    // File path
    var pathPanel = exportDialog.add('panel', undefined, 'File Location');
    var pathGroup = pathPanel.add('group');
    pathGroup.alignChildren = 'fill';
    
    var pathText = pathGroup.add('edittext', undefined, '[Auto-generate next to document]');
    pathText.enabled = false;
    var browseBtn = pathGroup.add('button', undefined, 'Browse...');
    
    var customPath = null;
    browseBtn.onClick = function() {
        var file = File.saveDialog('Save DOM Export As');
        if (file) {
            customPath = file.absoluteURI;
            pathText.text = file.name;
        }
    };
    
    // Buttons
    var buttonGroup = exportDialog.add('group');
    buttonGroup.alignment = 'center';
    
    var exportBtn = buttonGroup.add('button', undefined, 'Export');
    var cancelBtn = buttonGroup.add('button', undefined, 'Cancel');
    
    exportBtn.onClick = function() {
        var format = 'text';
        if (jsonRadio.value) format = 'json';
        else if (csvRadio.value) format = 'csv';
        
        updateStatus('Exporting DOM structure...');
        exportDialog.close();
        
        performExport(format, customPath);
    };
    
    cancelBtn.onClick = function() {
        exportDialog.close();
        updateStatus('Export cancelled');
    };
    
    exportDialog.show();
}

/**
 * Perform the actual export operation
 * @param {String} format - Export format
 * @param {String} customPath - Custom file path (optional)
 */
function performExport(format, customPath) {
    try {
        updateStatus('Starting ' + format + ' export...');
        
        // Call the exporter function directly (should be in global scope from 5.0_dom-exporter.jsx)
        var result = null;
        
        // Try to call the exporter module function
        try {
            // Direct call to the global function from 5.0_dom-exporter.jsx
            if (typeof exportDOMStructure === 'function') {
                $.writeln('Calling exportDOMStructure with format: ' + format);
                result = exportDOMStructure(DOM_VISUALIZER_STATE.currentDOMStructure, format, customPath);
                $.writeln('Export function returned: ' + (result ? 'success=' + result.success : 'null'));
            } else {
                throw new Error('Export function not found - exportDOMStructure is not defined');
            }
        } catch (exc) {
            result = {
                success: false,
                filePath: '',
                error: 'DOM Exporter module call failed: ' + exc.message
            };
            $.writeln('Export function call failed: ' + exc.message);
        }
        
        if (result && result.success) {
            updateStatus('Export successful: ' + result.filePath);
            alert('DOM structure exported successfully!\n\nFile saved to:\n' + result.filePath);
        } else {
            var errorMsg = result ? result.error : 'Unknown export error - no result returned';
            updateStatus('Export failed: ' + errorMsg);
            alert('Export failed:\n\n' + errorMsg + '\n\nCheck ExtendScript console for more details.');
            $.writeln('EXPORT FAILURE DETAILS:');
            $.writeln('  Format: ' + format);
            $.writeln('  Custom Path: ' + customPath);
            $.writeln('  DOM Structure exists: ' + (DOM_VISUALIZER_STATE.currentDOMStructure ? 'Yes' : 'No'));
            if (DOM_VISUALIZER_STATE.currentDOMStructure) {
                $.writeln('  DOM Properties: ' + DOM_VISUALIZER_STATE.currentDOMStructure.statistics.totalProperties);
            }
        }
        
    } catch (exc) {
        updateStatus('Export error: ' + exc.message);
        alert('Export error:\n\n' + exc.message);
        $.writeln('ERROR: Export failed: ' + exc.message);
    }
}

/**
 * Show settings dialog with basic options
 */
function showSettingsDialog() {
    var settingsDialog = new Window('dialog', 'DOM Discovery Settings');
    settingsDialog.orientation = 'column';
    settingsDialog.alignChildren = 'fill';
    settingsDialog.preferredSize.width = 350;
    settingsDialog.preferredSize.height = 300;
    
    // Current settings display
    var currentPanel = settingsDialog.add('panel', undefined, 'Current Settings');
    currentPanel.add('statictext', undefined, 'Max Depth: 2 levels');
    currentPanel.add('statictext', undefined, 'Timeout: 8 seconds');
    currentPanel.add('statictext', undefined, 'Skip Dangerous Properties: Yes');
    currentPanel.add('statictext', undefined, 'Max Properties: 2000');
    currentPanel.add('statictext', undefined, '');
    currentPanel.add('statictext', undefined, 'Collection Sampling:');
    currentPanel.add('statictext', undefined, '  Max Samples per Collection: 3');
    currentPanel.add('statictext', undefined, '  Collection Timeout: 3 seconds');
    currentPanel.add('statictext', undefined, '  Safety Filter: Moderate');
    
    // Future settings note
    var futurePanel = settingsDialog.add('panel', undefined, 'Configuration');
    futurePanel.add('statictext', undefined, 'Advanced configuration options will be added in future updates.');
    futurePanel.add('statictext', undefined, 'Current settings are optimized for safety and performance.');
    
    // Buttons
    var buttonGroup = settingsDialog.add('group');
    buttonGroup.alignment = 'center';
    
    var okBtn = buttonGroup.add('button', undefined, 'OK');
    okBtn.onClick = function() {
        settingsDialog.close();
    };
    
    settingsDialog.show();
}

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

/**
 * Show DOM visualizer interface
 */
function showDOMVisualizer() {
    try {
        var dialog = createDOMVisualizerUI();
        if (dialog) {
            dialog.show();
        } else {
            alert('Failed to create DOM visualizer interface.');
        }
    } catch (exc) {
        $.writeln('ERROR: Failed to show DOM visualizer: ' + exc.message);
        alert('Failed to show DOM visualizer:\n\n' + exc.message);
    }
}

/**
 * Alias for compatibility with single-file version
 */
function showDOMExplorer() {
    showDOMVisualizer();
}

// ============================================================================
// MODULE INITIALIZATION
// ============================================================================

/**
 * Initialize DOM visualizer module
 * @returns {Boolean} - true if initialization successful
 */
function initializeDOMVisualizer() {
    try {
        // Check dependencies
        if (typeof safeTypeCheck !== 'function') {
            $.writeln('ERROR: Safe foundation module not loaded');
            return false;
        }
        
        if (typeof enumerateDocumentDOM !== 'function') {
            $.writeln('ERROR: DOM enumerator module not loaded');
            return false;
        }
        
        // Collection sampler is optional but recommended
        if (typeof sampleCollectionContents === 'function') {
            $.writeln('Collection sampler module detected');
        } else {
            $.writeln('Collection sampler module not available - some features disabled');
        }
        
        // Test core functions
        var requiredFunctions = [
            'createDOMVisualizerUI', 'formatDOMForDisplay', 'runDOMEnumeration'
        ];
        
        for (var i = 0; i < requiredFunctions.length; i++) {
            if (typeof eval(requiredFunctions[i]) !== 'function') {
                $.writeln('ERROR: Required function missing: ' + requiredFunctions[i]);
                return false;
            }
        }
        
        $.writeln('3.0_dom-visualizer.jsx: All functions initialized successfully');
        $.writeln('Use showDOMVisualizer() to open the interface');
        return true;
        
    } catch (exc) {
        $.writeln('ERROR: DOM visualizer initialization failed: ' + exc.message);
        return false;
    }
}

// Auto-initialize when module loads
initializeDOMVisualizer();