// ============================================================================
// MODULE 3.0: UI PANEL & CONTROLS (UPDATED)
// InDesign Document Query Tool v3.1 - Enhanced User Interface
// ES3 Compatible - Landscape Panel Interface with Best Practice Safety
// ============================================================================

// UI STATE MANAGEMENT - Enhanced with safety tracking
var UI_STATE = {
    mainDialog: undefined,
    progressText: undefined,
    progressBar: undefined,
    statusText: undefined,
    resultTree: undefined,
    targetCheckboxes: {},
    configControls: {},
    currentResults: undefined,
    isInitialized: false,
    lastUpdateTime: 0
};

// MAIN UI CREATION - Enhanced landscape interface with safety controls
function createMainInterface() {
    try {
        // Prevent multiple dialog creation
        if (UI_STATE.isInitialized && UI_STATE.mainDialog) {
            UI_STATE.mainDialog.show();
            return UI_STATE.mainDialog;
        }
        
        // Create main dialog with enhanced dimensions
        UI_STATE.mainDialog = new Window("dialog", "InDesign Document Query Tool v3.1 - Enhanced Safety");
        UI_STATE.mainDialog.orientation = "column";
        UI_STATE.mainDialog.alignChildren = "fill";
        UI_STATE.mainDialog.preferredSize.width = 950;
        UI_STATE.mainDialog.preferredSize.height = 700;
        
        // Create all panels
        createFilePathPanel(UI_STATE.mainDialog);
        createTargetSelectionPanel(UI_STATE.mainDialog);
        createConfigurationPanel(UI_STATE.mainDialog);
        createProgressPanel(UI_STATE.mainDialog);
        createActionButtonsPanel(UI_STATE.mainDialog);
        createResultsPanel(UI_STATE.mainDialog);
        
        // Set up enhanced progress callback
        QUERY_CONFIG.runtime.progressCallback = updateUIProgressSafely;
        
        // Initialize state
        UI_STATE.isInitialized = true;
        updateStatus("UI interface ready - enhanced safety mode enabled");
        
        return UI_STATE.mainDialog;
        
    } catch (exc) {
        alert("Failed to create main interface: " + exc.message);
        return undefined;
    }
}

// FILE PATH PANEL - Enhanced document and output path selection
function createFilePathPanel(parent) {
    var filePanel = parent.add("panel", undefined, "Document & Output Configuration");
    filePanel.orientation = "column";
    filePanel.alignChildren = "fill";
    filePanel.preferredSize.height = 90;
    
    // Document path row
    var docRow = filePanel.add("group");
    docRow.add("statictext", undefined, "Document:").preferredSize.width = 80;
    var docPathText = docRow.add("edittext", undefined, "");
    docPathText.preferredSize.width = 350;
    docPathText.text = QUERY_CONFIG.paths.documentPath;
    
    var docBrowseBtn = docRow.add("button", undefined, "Browse...");
    var loadDocBtn = docRow.add("button", undefined, "Load Document");
    var currentDocBtn = docRow.add("button", undefined, "Use Current");
    
    // Output path row
    var outRow = filePanel.add("group");
    outRow.add("statictext", undefined, "Output:").preferredSize.width = 80;
    var outPathText = outRow.add("edittext", undefined, "");
    outPathText.preferredSize.width = 350;
    outPathText.text = QUERY_CONFIG.paths.outputPath;
    
    var outBrowseBtn = outRow.add("button", undefined, "Browse...");
    var autoPathBtn = outRow.add("button", undefined, "Auto Path");
    
    // Event handlers with error protection
    docBrowseBtn.onClick = function() {
        try {
            var file = File.openDialog("Select InDesign Document", "*.indd;*.indt");
            if (file) {
                docPathText.text = file.fsName;
                QUERY_CONFIG.paths.documentPath = file.fsName;
                updateStatus("Document path set: " + file.name);
            }
        } catch (e) {
            updateStatus("Error selecting document: " + e.message);
        }
    };
    
    loadDocBtn.onClick = function() {
        try {
            if (docPathText.text) {
                var file = File(docPathText.text);
                if (file.exists) {
                    app.open(file);
                    updateStatus("Document loaded successfully");
                } else {
                    alert("File not found: " + docPathText.text);
                }
            } else {
                alert("Please specify a document path first");
            }
        } catch (e) {
            updateStatus("Error loading document: " + e.message);
        }
    };
    
    currentDocBtn.onClick = function() {
        try {
            if (app.documents.length > 0) {
                var currentDoc = app.activeDocument;
                docPathText.text = currentDoc.name;
                QUERY_CONFIG.paths.documentPath = currentDoc.name;
                updateStatus("Using current document: " + currentDoc.name);
            } else {
                alert("No documents are currently open");
            }
        } catch (e) {
            updateStatus("Error accessing current document: " + e.message);
        }
    };
    
    outBrowseBtn.onClick = function() {
        try {
            var folder = Folder.selectDialog("Select Output Folder");
            if (folder) {
                outPathText.text = folder.fsName;
                QUERY_CONFIG.paths.outputPath = folder.fsName;
                updateStatus("Output path set: " + folder.name);
            }
        } catch (e) {
            updateStatus("Error selecting output folder: " + e.message);
        }
    };
    
    autoPathBtn.onClick = function() {
        try {
            var desktopPath = Folder.desktop.fsName;
            outPathText.text = desktopPath;
            QUERY_CONFIG.paths.outputPath = desktopPath;
            updateStatus("Output path set to desktop");
        } catch (e) {
            updateStatus("Error setting auto path: " + e.message);
        }
    };
    
    // Store references for updates
    UI_STATE.configControls.docPathText = docPathText;
    UI_STATE.configControls.outPathText = outPathText;
}

// TARGET SELECTION PANEL - Enhanced target checkboxes with safety indicators
function createTargetSelectionPanel(parent) {
    var targetPanel = parent.add("panel", undefined, "Analysis Targets (Enhanced Safety Indicators)");
    targetPanel.orientation = "column";
    targetPanel.alignChildren = "fill";
    targetPanel.preferredSize.height = 160;
    
    // Create two rows for targets
    var row1 = targetPanel.add("group");
    var row2 = targetPanel.add("group");
    var row3 = targetPanel.add("group");
    
    var targetRows = [row1, row2, row3];
    var rowIndex = 0;
    
    // Create checkboxes for each target with safety indicators
    for (var targetName in QUERY_CONFIG.targets) {
        var target = QUERY_CONFIG.targets[targetName];
        var currentRow = targetRows[rowIndex % 3];
        
        var targetGroup = currentRow.add("group");
        targetGroup.orientation = "row";
        targetGroup.preferredSize.width = 280;
        
        var checkbox = targetGroup.add("checkbox", undefined, "");
        checkbox.value = target.enabled;
        
        var safetyIndicator = target.safe ? " ✓" : " ⚠";
        var labelText = targetName + safetyIndicator;
        var label = targetGroup.add("statictext", undefined, labelText);
        label.preferredSize.width = 200;
        
        // Add tooltip-like description
        if (target.description) {
            var descText = targetGroup.add("statictext", undefined, "(" + target.description.substring(0, 20) + ")");
            descText.preferredSize.width = 150;
            descText.graphics.foregroundColor = descText.graphics.newPen(descText.graphics.PenType.SOLID_COLOR, [0.5, 0.5, 0.5], 1);
        }
        
        // Store checkbox reference
        UI_STATE.targetCheckboxes[targetName] = checkbox;
        
        // Event handler with closure to capture targetName
        (function(tName, cb) {
            cb.onClick = function() {
                try {
                    QUERY_CONFIG.targets[tName].enabled = cb.value;
                    updateStatus("Target " + tName + " " + (cb.value ? "enabled" : "disabled"));
                } catch (e) {
                    updateStatus("Error updating target: " + e.message);
                }
            };
        })(targetName, checkbox);
        
        rowIndex++;
    }
    
    // Add preset buttons
    var presetRow = targetPanel.add("group");
    presetRow.add("statictext", undefined, "Quick Presets:");
    
    for (var presetName in QUERY_PRESETS) {
        var presetBtn = presetRow.add("button", undefined, QUERY_PRESETS[presetName].name);
        
        (function(pName) {
            presetBtn.onClick = function() {
                try {
                    if (applyPreset(pName)) {
                        refreshTargetCheckboxes();
                        updateStatus("Applied preset: " + QUERY_PRESETS[pName].name);
                    }
                } catch (e) {
                    updateStatus("Error applying preset: " + e.message);
                }
            };
        })(presetName);
    }
}

// CONFIGURATION PANEL - Enhanced settings with safety controls
function createConfigurationPanel(parent) {
    var configPanel = parent.add("panel", undefined, "Analysis Configuration & Safety Controls");
    configPanel.orientation = "column";
    configPanel.alignChildren = "fill";
    configPanel.preferredSize.height = 120;
    
    // First row - depth and samples
    var row1 = configPanel.add("group");
    
    row1.add("statictext", undefined, "Max Depth:");
    var depthSlider = row1.add("slider", undefined, QUERY_CONFIG.traversal.maxDepth, 1, 6);
    var depthText = row1.add("statictext", undefined, String(QUERY_CONFIG.traversal.maxDepth));
    depthText.preferredSize.width = 30;
    
    row1.add("statictext", undefined, "  Sample Limit:");
    var sampleSlider = row1.add("slider", undefined, QUERY_CONFIG.traversal.sampleLimit, 1, 20);
    var sampleText = row1.add("statictext", undefined, String(QUERY_CONFIG.traversal.sampleLimit));
    sampleText.preferredSize.width = 30;
    
    // Second row - timeouts and safety
    var row2 = configPanel.add("group");
    
    row2.add("statictext", undefined, "Timeout (ms):");
    var timeoutSlider = row2.add("slider", undefined, QUERY_CONFIG.traversal.timeoutMs, 1000, 10000);
    var timeoutText = row2.add("statictext", undefined, String(QUERY_CONFIG.traversal.timeoutMs));
    timeoutText.preferredSize.width = 50;
    
    var emergencyCheck = row2.add("checkbox", undefined, "Emergency Bailouts");
    emergencyCheck.value = QUERY_CONFIG.traversal.emergencyBailouts;
    
    var verboseCheck = row2.add("checkbox", undefined, "Verbose Progress");
    verboseCheck.value = QUERY_CONFIG.traversal.verboseProgress;
    
    // Third row - display options
    var row3 = configPanel.add("group");
    
    var showEmptyCheck = row3.add("checkbox", undefined, "Show Empty Values");
    showEmptyCheck.value = QUERY_CONFIG.traversal.showEmpty;
    
    var showUndefinedCheck = row3.add("checkbox", undefined, "Show Undefined");
    showUndefinedCheck.value = QUERY_CONFIG.traversal.showUndefined;
    
    var pathTrackingCheck = row3.add("checkbox", undefined, "Path Tracking");
    pathTrackingCheck.value = QUERY_CONFIG.traversal.pathTracking;
    
    // Event handlers
    depthSlider.onChanging = function() {
        var value = Math.round(depthSlider.value);
        depthText.text = String(value);
        QUERY_CONFIG.traversal.maxDepth = value;
    };
    
    sampleSlider.onChanging = function() {
        var value = Math.round(sampleSlider.value);
        sampleText.text = String(value);
        QUERY_CONFIG.traversal.sampleLimit = value;
    };
    
    timeoutSlider.onChanging = function() {
        var value = Math.round(timeoutSlider.value);
        timeoutText.text = String(value);
        QUERY_CONFIG.traversal.timeoutMs = value;
    };
    
    emergencyCheck.onClick = function() {
        QUERY_CONFIG.traversal.emergencyBailouts = emergencyCheck.value;
    };
    
    verboseCheck.onClick = function() {
        QUERY_CONFIG.traversal.verboseProgress = verboseCheck.value;
    };
    
    showEmptyCheck.onClick = function() {
        QUERY_CONFIG.traversal.showEmpty = showEmptyCheck.value;
    };
    
    showUndefinedCheck.onClick = function() {
        QUERY_CONFIG.traversal.showUndefined = showUndefinedCheck.value;
    };
    
    pathTrackingCheck.onClick = function() {
        QUERY_CONFIG.traversal.pathTracking = pathTrackingCheck.value;
    };
    
    // Store references
    UI_STATE.configControls.depthText = depthText;
    UI_STATE.configControls.sampleText = sampleText;
    UI_STATE.configControls.timeoutText = timeoutText;
}

// PROGRESS PANEL - Enhanced progress tracking with safety metrics
function createProgressPanel(parent) {
    var progressPanel = parent.add("panel", undefined, "Analysis Progress & Safety Metrics");
    progressPanel.orientation = "column";
    progressPanel.alignChildren = "fill";
    progressPanel.preferredSize.height = 80;
    
    // Status and progress bar
    var statusRow = progressPanel.add("group");
    statusRow.add("statictext", undefined, "Status:");
    UI_STATE.statusText = statusRow.add("statictext", undefined, "Ready for analysis");
    UI_STATE.statusText.preferredSize.width = 300;
    
    var percentRow = progressPanel.add("group");
    percentRow.add("statictext", undefined, "Progress:");
    UI_STATE.progressBar = percentRow.add("progressbar", undefined, 0, 100);
    UI_STATE.progressBar.preferredSize.width = 200;
    UI_STATE.configControls.percentText = percentRow.add("statictext", undefined, "0%");
    UI_STATE.configControls.percentText.preferredSize.width = 50;
    
    // Detailed progress info
    var detailRow = progressPanel.add("group");
    detailRow.add("statictext", undefined, "Current:");
    UI_STATE.progressText = detailRow.add("statictext", undefined, "Waiting for analysis to start...");
    UI_STATE.progressText.preferredSize.width = 400;
}

// ACTION BUTTONS PANEL - Enhanced with safety controls
function createActionButtonsPanel(parent) {
    var actionPanel = parent.add("panel", undefined, "Analysis Actions");
    actionPanel.orientation = "row";
    actionPanel.alignChildren = "center";
    actionPanel.preferredSize.height = 60;
    
    var startBtn = actionPanel.add("button", undefined, "Start Analysis");
    var stopBtn = actionPanel.add("button", undefined, "Emergency Stop");
    var clearBtn = actionPanel.add("button", undefined, "Clear Results");
    var showBtn = actionPanel.add("button", undefined, "Show Results");
    var exportBtn = actionPanel.add("button", undefined, "Export Results");
    var validateBtn = actionPanel.add("button", undefined, "Validate Setup");
    
    startBtn.onClick = function() {
        try {
            startAnalysisSafely();
        } catch (e) {
            updateStatus("Error starting analysis: " + e.message);
        }
    };
    
    stopBtn.onClick = function() {
        try {
            QUERY_CONFIG.runtime.analysisActive = false;
            updateStatus("Emergency stop activated");
        } catch (e) {
            updateStatus("Error during emergency stop: " + e.message);
        }
    };
    
    clearBtn.onClick = function() {
        try {
            UI_STATE.currentResults = undefined;
            UI_STATE.resultTree.text = "Results cleared...";
            updateStatus("Results cleared");
        } catch (e) {
            updateStatus("Error clearing results: " + e.message);
        }
    };
    
    showBtn.onClick = function() {
        try {
            if (UI_STATE.currentResults) {
                showResultsDialog(UI_STATE.currentResults);
            } else {
                alert("No results to display. Run an analysis first.");
            }
        } catch (e) {
            updateStatus("Error showing results: " + e.message);
        }
    };
    
    exportBtn.onClick = function() {
        try {
            if (UI_STATE.currentResults) {
                exportTreeToFile(UI_STATE.currentResults);
            } else {
                alert("No results to export. Run an analysis first.");
            }
        } catch (e) {
            updateStatus("Error exporting results: " + e.message);
        }
    };
    
    validateBtn.onClick = function() {
        try {
            validateAnalysisSetup();
        } catch (e) {
            updateStatus("Error validating setup: " + e.message);
        }
    };
}

// RESULTS PANEL - Enhanced preview with safety info
function createResultsPanel(parent) {
    var resultsPanel = parent.add("panel", undefined, "Quick Results Preview & Safety Summary");
    resultsPanel.orientation = "column";
    resultsPanel.alignChildren = "fill";
    resultsPanel.preferredSize.height = 120;
    
    UI_STATE.resultTree = resultsPanel.add("edittext", undefined, "No analysis results yet...\n\nEnhanced Safety Features:\n• Emergency timeouts prevent hanging\n• Progressive depth limiting\n• Memory management\n• Real-time progress tracking\n• Error recovery and reporting", {multiline: true, readonly: true});
    UI_STATE.resultTree.alignment = "fill";
}

// ============================================================================
// UI UPDATE AND UTILITY FUNCTIONS
// ============================================================================

// SAFE UI PROGRESS UPDATE - Enhanced with error protection
function updateUIProgressSafely(progress) {
    if (!UI_STATE.mainDialog || !UI_STATE.isInitialized) return;
    
    try {
        var currentTime = new Date().getTime();
        
        // Throttle updates to prevent UI flooding
        if (currentTime - UI_STATE.lastUpdateTime < 100) return;
        UI_STATE.lastUpdateTime = currentTime;
        
        if (UI_STATE.statusText) {
            UI_STATE.statusText.text = progress.status + " - " + progress.currentTarget;
        }
        
        if (UI_STATE.progressBar) {
            UI_STATE.progressBar.value = progress.percentage || 0;
        }
        
        if (UI_STATE.configControls.percentText) {
            UI_STATE.configControls.percentText.text = (progress.percentage || 0) + "%";
        }
        
        if (UI_STATE.progressText) {
            var progressInfo = progress.currentPath + " → " + progress.currentResult;
            if (progressInfo.length > 80) {
                progressInfo = progressInfo.substring(0, 77) + "...";
            }
            UI_STATE.progressText.text = progressInfo;
        }
        
        UI_STATE.mainDialog.update();
        
    } catch (e) {
        // Silently ignore UI update errors to prevent cascading failures
    }
}

function updateStatus(message) {
    if (UI_STATE.statusText) {
        UI_STATE.statusText.text = message;
        if (UI_STATE.mainDialog) {
            UI_STATE.mainDialog.update();
        }
    }
    $.writeln("[UI] " + message);
}

function refreshTargetCheckboxes() {
    try {
        for (var targetName in UI_STATE.targetCheckboxes) {
            var checkbox = UI_STATE.targetCheckboxes[targetName];
            if (checkbox && QUERY_CONFIG.targets[targetName]) {
                checkbox.value = QUERY_CONFIG.targets[targetName].enabled;
            }
        }
    } catch (e) {
        updateStatus("Error refreshing checkboxes: " + e.message);
    }
}

// ANALYSIS STARTUP WITH VALIDATION
function startAnalysisSafely() {
    if (isAnalysisActive()) {
        alert("Analysis is already running. Use Emergency Stop if needed.");
        return;
    }
    
    // Validate document
    if (!app.documents.length) {
        alert("No documents are open. Please open a document first.");
        return;
    }
    
    // Validate enabled targets
    var enabledTargets = getEnabledTargets();
    if (enabledTargets.length === 0) {
        alert("No targets selected. Please enable at least one analysis target.");
        return;
    }
    
    updateStatus("Starting safe analysis with " + enabledTargets.length + " targets...");
    
    try {
        var doc = app.activeDocument;
        var results = analyzeDocumentToTree(doc);
        
        if (results) {
            UI_STATE.currentResults = results;
            
            // Update results preview
            var stats = getTreeStatistics(results);
            var preview = "ANALYSIS COMPLETED\n";
            preview += "Total Nodes: " + stats.totalNodes + "\n";
            preview += "Success Rate: " + Math.round((stats.successNodes / stats.totalNodes) * 100) + "%\n";
            preview += "Errors: " + stats.errorNodes + "\n";
            preview += "Max Depth: " + stats.maxDepth + "\n\n";
            preview += "Click 'Show Results' for detailed tree view.";
            
            UI_STATE.resultTree.text = preview;
            updateStatus("Analysis completed successfully");
        } else {
            updateStatus("Analysis failed to produce results");
        }
        
    } catch (exc) {
        updateStatus("Analysis error: " + exc.message);
        alert("Analysis failed: " + exc.message);
    }
}

function validateAnalysisSetup() {
    var validation = [];
    
    // Check document
    if (!app.documents.length) {
        validation.push("No documents are open");
    }
    
    // Check targets
    var enabledTargets = getEnabledTargets();
    if (enabledTargets.length === 0) {
        validation.push("No analysis targets enabled");
    }
    
    // Check configuration
    if (QUERY_CONFIG.traversal.maxDepth < 1) {
        validation.push("Max depth too low");
    }
    
    if (QUERY_CONFIG.traversal.timeoutMs < 1000) {
        validation.push("Timeout too short (risk of incomplete analysis)");
    }
    
    var message = validation.length === 0 ? 
        "Setup validation passed! Ready for analysis." :
        "Setup issues found:\n• " + validation.join("\n• ");
    
    alert(message);
    updateStatus("Setup validation: " + (validation.length === 0 ? "PASSED" : "ISSUES FOUND"));
}

$.writeln("Module 3.0: Enhanced UI Panel & Controls loaded");