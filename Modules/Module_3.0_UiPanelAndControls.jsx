// ============================================================================
// MODULE 3.0: UI PANEL & CONTROLS
// InDesign Document Query Tool v3.0 - Configurable Analysis
// ES3 Compatible - Landscape Panel Interface
// ============================================================================

// UI STATE MANAGEMENT
var UI_STATE = {
    mainDialog: null,
    progressText: null,
    progressBar: null,
    statusText: null,
    resultTree: null,
    targetCheckboxes: {},
    configControls: {},
    currentResults: null
};

// MAIN UI CREATION - Landscape wide panel
function createMainInterface() {
    // Create main dialog
    UI_STATE.mainDialog = new Window("dialog", "InDesign Document Query Tool v3.0");
    UI_STATE.mainDialog.orientation = "column";
    UI_STATE.mainDialog.alignChildren = "fill";
    UI_STATE.mainDialog.preferredSize.width = 900;
    UI_STATE.mainDialog.preferredSize.height = 650;
    
    // File paths panel
    createFilePathPanel(UI_STATE.mainDialog);
    
    // Target selection panel
    createTargetSelectionPanel(UI_STATE.mainDialog);
    
    // Configuration panel
    createConfigurationPanel(UI_STATE.mainDialog);
    
    // Progress panel
    createProgressPanel(UI_STATE.mainDialog);
    
    // Action buttons panel
    createActionButtonsPanel(UI_STATE.mainDialog);
    
    // Results panel
    createResultsPanel(UI_STATE.mainDialog);
    
    // Set up progress callback
    QUERY_CONFIG.runtime.progressCallback = updateUIProgress;
    
    return UI_STATE.mainDialog;
}

// FILE PATH PANEL - Document and output path selection
function createFilePathPanel(parent) {
    var filePanel = parent.add("panel", undefined, "Input/Output Configuration");
    filePanel.orientation = "column";
    filePanel.alignChildren = "fill";
    filePanel.preferredSize.height = 80;
    
    // Document path row
    var docRow = filePanel.add("group");
    docRow.add("statictext", undefined, "Document Path:");
    var docPathText = docRow.add("edittext", undefined, "");
    docPathText.preferredSize.width = 300;
    var docBrowseBtn = docRow.add("button", undefined, "Browse...");
    var loadDocBtn = docRow.add("button", undefined, "Load Doc");
    var currentDocBtn = docRow.add("button", undefined, "Current Doc");
    
    // Output path row
    var outRow = filePanel.add("group");
    outRow.add("statictext", undefined, "Output Path:");
    var outPathText = outRow.add("edittext", undefined, "");
    outPathText.preferredSize.width = 300;
    var outBrowseBtn = outRow.add("button", undefined, "Browse...");
    var openFolderBtn = outRow.add("button", undefined, "Open Folder");
    
    // Store references
    UI_STATE.configControls.docPathText = docPathText;
    UI_STATE.configControls.outPathText = outPathText;
    
    // Event handlers
    docBrowseBtn.onClick = function() {
        var file = File.openDialog("Select InDesign Document", "*.indd;*.indt");
        if (file) {
            docPathText.text = file.fsName;
            QUERY_CONFIG.paths.documentPath = file.fsName;
        }
    };
    
    currentDocBtn.onClick = function() {
        if (app.documents.length > 0) {
            var doc = app.activeDocument;
            var docPath = doc.filePath ? doc.filePath.toString() : "";
            docPathText.text = docPath;
            QUERY_CONFIG.paths.documentPath = docPath;
            QUERY_CONFIG.paths.currentDocument = doc;
        } else {
            alert("No document is currently open.");
        }
    };
    
    loadDocBtn.onClick = function() {
        if (docPathText.text) {
            try {
                var file = File(docPathText.text);
                if (file.exists) {
                    var doc = app.open(file);
                    QUERY_CONFIG.paths.currentDocument = doc;
                    updateStatus("Document loaded: " + doc.name);
                } else {
                    alert("File does not exist: " + docPathText.text);
                }
            } catch (e) {
                alert("Failed to load document: " + e.message);
            }
        }
    };
    
    outBrowseBtn.onClick = function() {
        var folder = Folder.selectDialog("Select Output Folder");
        if (folder) {
            outPathText.text = folder.fsName;
            QUERY_CONFIG.paths.outputPath = folder.fsName;
        }
    };
    
    openFolderBtn.onClick = function() {
        if (outPathText.text) {
            var folder = Folder(outPathText.text);
            if (folder.exists) {
                folder.execute();
            }
        }
    };
}

// TARGET SELECTION PANEL - Checkboxes for analysis targets
function createTargetSelectionPanel(parent) {
    var targetPanel = parent.add("panel", undefined, "Analysis Target Selection");
    targetPanel.orientation = "column";
    targetPanel.alignChildren = "fill";
    targetPanel.preferredSize.height = 100;
    
    // Create checkbox grid
    var row1 = targetPanel.add("group");
    var row2 = targetPanel.add("group");
    
    // Define target layout
    var targetList = [
        { name: "documentProperties", label: "Document Properties", row: 1 },
        { name: "pages", label: "Pages", row: 1 },
        { name: "textFrames", label: "Text Frames", row: 1 },
        { name: "stories", label: "Stories", row: 1 },
        { name: "layers", label: "Layers", row: 2 },
        { name: "images", label: "Images", row: 2 },
        { name: "links", label: "Links", row: 2 },
        { name: "pageItems", label: "Page Items", row: 2 },
        { name: "styles", label: "Styles", row: 1 },
        { name: "colors", label: "Colors", row: 1 },
        { name: "fonts", label: "Fonts", row: 1 },
        { name: "masterPages", label: "Master Pages", row: 2 }
    ];
    
    for (var i = 0; i < targetList.length; i++) {
        var target = targetList[i];
        var parentRow = target.row === 1 ? row1 : row2;
        
        var checkbox = parentRow.add("checkbox", undefined, target.label);
        checkbox.value = QUERY_CONFIG.targets[target.name].enabled;
        
        // Add safety indicator
        if (!QUERY_CONFIG.targets[target.name].safe) {
            checkbox.text += " ⚠";
            checkbox.helpTip = "Warning: This collection may be slow or cause timeouts";
        }
        
        UI_STATE.targetCheckboxes[target.name] = checkbox;
        
        // Create closure for event handler
        (function(targetName) {
            checkbox.onClick = function() {
                QUERY_CONFIG.targets[targetName].enabled = this.value;
                updateStatus("Target " + targetName + " " + (this.value ? "enabled" : "disabled"));
            };
        })(target.name);
    }
}

// CONFIGURATION PANEL - Depth, timeouts, and options
function createConfigurationPanel(parent) {
    var configPanel = parent.add("panel", undefined, "Depth & Safety Configuration");
    configPanel.orientation = "column";
    configPanel.alignChildren = "fill";
    configPanel.preferredSize.height = 80;
    
    // First row - depth and timeout
    var row1 = configPanel.add("group");
    
    row1.add("statictext", undefined, "Traversal Depth:");
    var depthSlider = row1.add("slider", undefined, QUERY_CONFIG.traversal.maxDepth, 1, 5);
    depthSlider.preferredSize.width = 100;
    var depthText = row1.add("statictext", undefined, QUERY_CONFIG.traversal.maxDepth.toString());
    
    row1.add("statictext", undefined, "   Timeout:");
    var timeoutDropdown = row1.add("dropdownlist", undefined, ["100ms", "200ms", "500ms", "1000ms", "2000ms"]);
    timeoutDropdown.selection = 2; // 500ms default
    
    row1.add("statictext", undefined, "   Sample Limit:");
    var sampleDropdown = row1.add("dropdownlist", undefined, ["5", "10", "15", "20", "25"]);
    sampleDropdown.selection = 1; // 10 default
    
    // Second row - display options
    var row2 = configPanel.add("group");
    
    var showEmptyCheck = row2.add("checkbox", undefined, "Show Empty Values");
    showEmptyCheck.value = QUERY_CONFIG.traversal.showEmpty;
    
    var showNullCheck = row2.add("checkbox", undefined, "Show Null Properties");
    showNullCheck.value = QUERY_CONFIG.traversal.showNull;
    
    var showBrokenCheck = row2.add("checkbox", undefined, "Show Broken References");
    showBrokenCheck.value = QUERY_CONFIG.traversal.showBroken;
    
    var verboseCheck = row2.add("checkbox", undefined, "Verbose Progress");
    verboseCheck.value = QUERY_CONFIG.traversal.verboseProgress;
    
    var pathTrackCheck = row2.add("checkbox", undefined, "Path Tracking");
    pathTrackCheck.value = QUERY_CONFIG.traversal.pathTracking;
    
    var bailoutCheck = row2.add("checkbox", undefined, "Emergency Bailouts");
    bailoutCheck.value = QUERY_CONFIG.traversal.emergencyBailouts;
    
    // Store references
    UI_STATE.configControls.depthSlider = depthSlider;
    UI_STATE.configControls.timeoutDropdown = timeoutDropdown;
    UI_STATE.configControls.sampleDropdown = sampleDropdown;
    
    // Event handlers
    depthSlider.onChanging = function() {
        var depth = Math.round(this.value);
        depthText.text = depth.toString();
        QUERY_CONFIG.traversal.maxDepth = depth;
    };
    
    timeoutDropdown.onChange = function() {
        var timeouts = [100, 200, 500, 1000, 2000];
        QUERY_CONFIG.traversal.timeoutMs = timeouts[this.selection.index];
    };
    
    sampleDropdown.onChange = function() {
        var limits = [5, 10, 15, 20, 25];
        QUERY_CONFIG.traversal.sampleLimit = limits[this.selection.index];
    };
    
    showEmptyCheck.onClick = function() {
        QUERY_CONFIG.traversal.showEmpty = this.value;
    };
    
    showNullCheck.onClick = function() {
        QUERY_CONFIG.traversal.showNull = this.value;
    };
    
    showBrokenCheck.onClick = function() {
        QUERY_CONFIG.traversal.showBroken = this.value;
    };
    
    verboseCheck.onClick = function() {
        QUERY_CONFIG.traversal.verboseProgress = this.value;
    };
    
    pathTrackCheck.onClick = function() {
        QUERY_CONFIG.traversal.pathTracking = this.value;
    };
    
    bailoutCheck.onClick = function() {
        QUERY_CONFIG.traversal.emergencyBailouts = this.value;
    };
}

// PROGRESS PANEL - Real-time progress feedback
function createProgressPanel(parent) {
    var progressPanel = parent.add("panel", undefined, "Analysis Progress");
    progressPanel.orientation = "column";
    progressPanel.alignChildren = "fill";
    progressPanel.preferredSize.height = 120;
    
    // Status and progress bar
    var statusRow = progressPanel.add("group");
    statusRow.add("statictext", undefined, "Status:");
    UI_STATE.statusText = statusRow.add("statictext", undefined, "Ready");
    UI_STATE.statusText.preferredSize.width = 300;
    
    UI_STATE.progressBar = statusRow.add("progressbar", undefined, 0, 100);
    UI_STATE.progressBar.preferredSize.width = 200;
    
    var percentText = statusRow.add("statictext", undefined, "0%");
    UI_STATE.configControls.percentText = percentText;
    
    // Current operation details
    var currentRow = progressPanel.add("group");
    currentRow.add("statictext", undefined, "Current:");
    UI_STATE.progressText = currentRow.add("statictext", undefined, "");
    UI_STATE.progressText.preferredSize.width = 600;
    
    // Path tracking (scrollable)
    var pathGroup = progressPanel.add("group");
    pathGroup.orientation = "column";
    pathGroup.alignChildren = "fill";
    
    var pathLabel = pathGroup.add("statictext", undefined, "Recent Paths:");
    UI_STATE.pathList = pathGroup.add("edittext", undefined, "", {multiline: true, readonly: true});
    UI_STATE.pathList.preferredSize.height = 40;
}

// ACTION BUTTONS PANEL - Presets and controls
function createActionButtonsPanel(parent) {
    var actionPanel = parent.add("group");
    actionPanel.orientation = "row";
    actionPanel.alignChildren = "center";
    
    // Presets group
    var presetsGroup = actionPanel.add("panel", undefined, "Quick Actions");
    presetsGroup.orientation = "row";
    
    var basicBtn = presetsGroup.add("button", undefined, "Preset: Basic Safe");
    var textBtn = presetsGroup.add("button", undefined, "Preset: Text Only");
    var fullBtn = presetsGroup.add("button", undefined, "Preset: Full Scan");
    var saveConfigBtn = presetsGroup.add("button", undefined, "Save Config");
    
    // Analysis controls group
    var controlsGroup = actionPanel.add("panel", undefined, "Analysis Control");
    controlsGroup.orientation = "row";
    
    var startBtn = controlsGroup.add("button", undefined, "▶ START ANALYSIS");
    startBtn.preferredSize.width = 140;
    var pauseBtn = controlsGroup.add("button", undefined, "⏸ PAUSE");
    var stopBtn = controlsGroup.add("button", undefined, "⏹ STOP");
    var viewBtn = controlsGroup.add("button", undefined, "📊 View Results");
    var exportBtn = controlsGroup.add("button", undefined, "📁 Export Tree");
    
    // Store references
    UI_STATE.configControls.startBtn = startBtn;
    UI_STATE.configControls.pauseBtn = pauseBtn;
    UI_STATE.configControls.stopBtn = stopBtn;
    
    // Event handlers
    basicBtn.onClick = function() {
        applyPreset("basicSafe");
        refreshTargetCheckboxes();
        updateStatus("Applied Basic Safe preset");
    };
    
    textBtn.onClick = function() {
        applyPreset("textOnly");
        refreshTargetCheckboxes();
        updateStatus("Applied Text Only preset");
    };
    
    fullBtn.onClick = function() {
        applyPreset("fullScan");
        refreshTargetCheckboxes();
        updateStatus("Applied Full Scan preset");
    };
    
    startBtn.onClick = function() {
        startAnalysis();
    };
    
    viewBtn.onClick = function() {
        if (UI_STATE.currentResults) {
            showResultsDialog(UI_STATE.currentResults);
        } else {
            alert("No results to display. Run an analysis first.");
        }
    };
    
    exportBtn.onClick = function() {
        if (UI_STATE.currentResults) {
            exportTreeToFile(UI_STATE.currentResults);
        } else {
            alert("No results to export. Run an analysis first.");
        }
    };
}

// RESULTS PANEL - Tree display area
function createResultsPanel(parent) {
    var resultsPanel = parent.add("panel", undefined, "Quick Results Preview");
    resultsPanel.orientation = "column";
    resultsPanel.alignChildren = "fill";
    resultsPanel.preferredSize.height = 150;
    
    UI_STATE.resultTree = resultsPanel.add("edittext", undefined, "No analysis results yet...", {multiline: true, readonly: true});
    UI_STATE.resultTree.alignment = "fill";
}

// UI UPDATE FUNCTIONS
function updateUIProgress(progress) {
    if (!UI_STATE.mainDialog) return;
    
    try {
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
            UI_STATE.progressText.text = progress.currentPath + " → " + progress.currentResult;
        }
        
        // Add to path list if verbose
        if (QUERY_CONFIG.traversal.verboseProgress && UI_STATE.pathList) {
            var pathEntry = progress.currentPath + " → " + progress.currentResult + "\n";
            var currentText = UI_STATE.pathList.text;
            var lines = currentText.split("\n");
            if (lines.length > 10) {
                lines = lines.slice(-8); // Keep last 8 lines
            }
            lines.push(pathEntry);
            UI_STATE.pathList.text = lines.join("\n");
        }
        
        UI_STATE.mainDialog.update();
        
    } catch (e) {
        // Ignore UI update errors
    }
}

function updateStatus(message) {
    if (UI_STATE.statusText) {
        UI_STATE.statusText.text = message;
        UI_STATE.mainDialog.update();
    }
    $.writeln("[UI] " + message);
}

function refreshTargetCheckboxes() {
    for (var targetName in UI_STATE.targetCheckboxes) {
        var checkbox = UI_STATE.targetCheckboxes[targetName];
        if (checkbox) {
            checkbox.value = QUERY_CONFIG.targets[targetName].enabled;
        }
    }
}

// ANALYSIS CONTROL
function startAnalysis() {
    if (isAnalysisActive()) {
        alert("Analysis is already running.");
        return;
    }
    
    var doc = QUERY_CONFIG.paths.currentDocument;
    if (!doc && app.documents.length > 0) {
        doc = app.activeDocument;
        QUERY_CONFIG.paths.currentDocument = doc;
    }
    
    if (!doc) {
        alert("No document available for analysis. Please load or select a document.");
        return;
    }
    
    updateStatus("Starting analysis...");
    
    try {
        var results = analyzeDocumentToTree(doc);
        UI_STATE.currentResults = results;
        
        if (results) {
            var stats = getTreeStatistics(results);
            var summary = "Analysis Complete!\n" +
                         "Total nodes: " + stats.totalNodes + "\n" +
                         "Success: " + stats.successNodes + "\n" +
                         "Errors: " + stats.errorNodes + "\n" +
                         "Max depth: " + stats.maxDepth;
            
            UI_STATE.resultTree.text = summary;
            updateStatus("Analysis completed successfully");
        } else {
            updateStatus("Analysis failed - no results");
        }
        
    } catch (e) {
        updateStatus("Analysis failed: " + e.message);
        alert("Analysis failed: " + e.message);
    }
}

// SHOW MAIN INTERFACE
function showMainInterface() {
    var dialog = createMainInterface();
    
    // Set initial document if available
    if (app.documents.length > 0) {
        var doc = app.activeDocument;
        QUERY_CONFIG.paths.currentDocument = doc;
        if (doc.saved && doc.filePath) {
            UI_STATE.configControls.docPathText.text = doc.filePath.toString();
            QUERY_CONFIG.paths.documentPath = doc.filePath.toString();
        }
    }
    
    dialog.show();
}

$.writeln("Module C: UI Panel & Controls loaded");