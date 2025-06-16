// ============================================================================
// MODULE 3.0: SIMPLIFIED UI INTERFACE - MANUAL EXECUTION & TARGETING
// InDesign Document Query Tool v3.1 - Enhanced Safety Edition
// ES3 Compatible - All Reserved Words Fixed
// ============================================================================

// UI STATE MANAGEMENT - Simplified approach
var UI_STATE = {
    mainDialog: null,
    currentDocument: null,
    targetCheckboxes: {},
    configControls: {},
    resultDisplay: null,
    statusText: null,
    progressBar: null,
    lastResults: null
};

// TARGET DEFINITIONS - Configurable through UI
var ANALYSIS_TARGETS = {
    documentProperties: {
        name: "Document Properties",
        description: "Basic document info (name, size, pages)",
        safetyLevel: "safe",
        enabled: true,
        category: "basic"
    },
    pageCollection: {
        name: "Page Collection", 
        description: "Page objects and properties",
        safetyLevel: "safe",
        enabled: true,
        category: "basic"
    },
    textFrames: {
        name: "Text Frames",
        description: "Text frame objects and basic properties", 
        safetyLevel: "safe",
        enabled: true,
        category: "text"
    },
    textContent: {
        name: "Text Content",
        description: "Sample text content from frames",
        safetyLevel: "moderate",
        enabled: false,
        category: "text"
    },
    images: {
        name: "Images & Graphics",
        description: "Image objects and graphic properties",
        safetyLevel: "moderate", 
        enabled: false,
        category: "graphics"
    },
    links: {
        name: "Links & Assets",
        description: "Linked files and asset references",
        safetyLevel: "risky",
        enabled: false,
        category: "graphics"
    },
    styles: {
        name: "Character & Paragraph Styles",
        description: "Style definitions and applications",
        safetyLevel: "moderate",
        enabled: false,
        category: "formatting"
    },
    colors: {
        name: "Colors & Swatches",
        description: "Color definitions and usage",
        safetyLevel: "safe",
        enabled: false,
        category: "formatting"
    },
    layers: {
        name: "Layers",
        description: "Layer information and visibility",
        safetyLevel: "safe",
        enabled: true,
        category: "basic"
    },
    pageItems: {
        name: "Page Items",
        description: "All page items and objects",
        safetyLevel: "risky",
        enabled: false,
        category: "comprehensive"
    }
};

// ============================================================================
// MAIN UI CREATION FUNCTIONS
// ============================================================================

function createMainInterface() {
    debugLog("Creating main interface", "UI");
    
    // Create main dialog
    var dialog = new Window("dialog", "InDesign Document Inspector v3.1");
    dialog.orientation = "column";
    dialog.alignChildren = "fill";
    dialog.preferredSize.width = 600;
    dialog.preferredSize.height = 700;
    
    UI_STATE.mainDialog = dialog;
    
    // Header panel
    createHeaderPanel(dialog);
    
    // Document info panel  
    createDocumentInfoPanel(dialog);
    
    // Target selection panel
    createTargetSelectionPanel(dialog);
    
    // Configuration panel
    createConfigurationPanel(dialog);
    
    // Results panel
    createResultsPanel(dialog);
    
    // Progress panel
    createProgressPanel(dialog);
    
    // Action buttons
    createActionButtons(dialog);
    
    // Status bar
    createStatusBar(dialog);
    
    // Initialize interface state
    updateDocumentInfo();
    updateAnalysisTargets();
    
    return dialog;
}

function createHeaderPanel(parentWindow) {
    var headerPanel = parentWindow.add("panel", undefined, "Enhanced Document Analysis");
    headerPanel.alignment = "fill";
    headerPanel.margins = 15;
    
    var headerText = headerPanel.add("statictext", undefined, 
        "Manual execution mode with configurable property targeting.\n" +
        "Select specific document properties to analyze safely.", 
        {multiline: true});
    headerText.alignment = "fill";
    
    var versionText = headerPanel.add("statictext", undefined, 
        "Version 3.1 Enhanced Safety Edition • ES3 Compatible • Manual Mode");
    versionText.alignment = "center";
    
    return headerPanel;
}

function createDocumentInfoPanel(parentWindow) {
    var docPanel = parentWindow.add("panel", undefined, "Current Document");
    docPanel.alignment = "fill";
    docPanel.preferredSize.height = 80;
    
    UI_STATE.documentInfo = docPanel.add("statictext", undefined, 
        "No document information available", {multiline: true});
    UI_STATE.documentInfo.alignment = "fill";
    
    var refreshBtn = docPanel.add("button", undefined, "Refresh Document Info");
    refreshBtn.alignment = "center";
    refreshBtn.onClick = function() {
        updateDocumentInfo();
    };
    
    return docPanel;
}

function createTargetSelectionPanel(parentWindow) {
    var targetPanel = parentWindow.add("panel", undefined, "Analysis Targets");
    targetPanel.alignment = "fill";
    targetPanel.preferredSize.height = 200;
    
    // Create scrollable group for targets
    var scrollGroup = targetPanel.add("group");
    scrollGroup.orientation = "column";
    scrollGroup.alignChildren = "fill";
    
    // Category tabs simulation with groups
    var categories = ["basic", "text", "graphics", "formatting", "comprehensive"];
    var categoryGroups = {};
    
    for (var i = 0; i < categories.length; i++) {
        var categoryName = categories[i];
        var categoryGroup = scrollGroup.add("group");
        categoryGroup.orientation = "column";
        categoryGroup.alignChildren = "left";
        
        // Category header
        var categoryHeader = categoryGroup.add("statictext", undefined, 
            categoryName.toUpperCase() + " TARGETS");
        categoryHeader.graphics.font = ScriptUI.newFont("dialog", "Bold", 12);
        
        categoryGroups[categoryName] = categoryGroup;
    }
    
    // Add target checkboxes to appropriate categories
    for (var targetKey in ANALYSIS_TARGETS) {
        var target = ANALYSIS_TARGETS[targetKey];
        var categoryGroup = categoryGroups[target.category];
        
        var targetRow = categoryGroup.add("group");
        targetRow.orientation = "row";
        targetRow.alignChildren = "center";
        
        var checkbox = targetRow.add("checkbox", undefined, target.name);
        checkbox.value = target.enabled;
        checkbox.helpTip = target.description;
        
        var safetyIndicator = targetRow.add("statictext", undefined, 
            target.safetyLevel === "safe" ? "✓" : 
            target.safetyLevel === "moderate" ? "⚠" : "⚡");
        safetyIndicator.helpTip = "Safety level: " + target.safetyLevel;
        
        // Store checkbox reference
        UI_STATE.targetCheckboxes[targetKey] = checkbox;
        
        // Add change handler
        checkbox.onClick = function() {
            updateTargetStates();
        };
    }
    
    // Target control buttons
    var buttonGroup = targetPanel.add("group");
    buttonGroup.alignment = "center";
    
    var selectSafeBtn = buttonGroup.add("button", undefined, "Select Safe Only");
    selectSafeBtn.onClick = function() {
        selectTargetsBySafety("safe");
    };
    
    var selectAllBtn = buttonGroup.add("button", undefined, "Select All");
    selectAllBtn.onClick = function() {
        selectAllTargets(true);
    };
    
    var clearAllBtn = buttonGroup.add("button", undefined, "Clear All");
    clearAllBtn.onClick = function() {
        selectAllTargets(false);
    };
    
    return targetPanel;
}

function createConfigurationPanel(parentWindow) {
    var configPanel = parentWindow.add("panel", undefined, "Analysis Configuration");
    configPanel.alignment = "fill";
    configPanel.preferredSize.height = 120;
    
    // Timeout settings
    var timeoutGroup = configPanel.add("group");
    timeoutGroup.orientation = "row";
    timeoutGroup.alignChildren = "center";
    
    timeoutGroup.add("statictext", undefined, "Timeout (ms):");
    var timeoutEdit = timeoutGroup.add("edittext", undefined, "5000");
    timeoutEdit.characters = 8;
    timeoutEdit.helpTip = "Maximum time for each property access";
    UI_STATE.configControls.timeout = timeoutEdit;
    
    // Sample limit settings  
    var sampleGroup = configPanel.add("group");
    sampleGroup.orientation = "row";
    sampleGroup.alignChildren = "center";
    
    sampleGroup.add("statictext", undefined, "Sample Limit:");
    var sampleEdit = sampleGroup.add("edittext", undefined, "10");
    sampleEdit.characters = 8;
    sampleEdit.helpTip = "Maximum items to sample from collections";
    UI_STATE.configControls.sampleLimit = sampleEdit;
    
    // Depth settings
    var depthGroup = configPanel.add("group");
    depthGroup.orientation = "row";
    depthGroup.alignChildren = "center";
    
    depthGroup.add("statictext", undefined, "Max Depth:");
    var depthEdit = depthGroup.add("edittext", undefined, "3");
    depthEdit.characters = 8;
    depthEdit.helpTip = "Maximum nesting depth for object analysis";
    UI_STATE.configControls.maxDepth = depthEdit;
    
    // Safety mode selection
    var safetyGroup = configPanel.add("group");
    safetyGroup.orientation = "row";
    safetyGroup.alignChildren = "center";
    
    safetyGroup.add("statictext", undefined, "Safety Mode:");
    var safetyDropdown = safetyGroup.add("dropdownlist", undefined, 
        ["Emergency", "Minimal", "Basic", "Standard", "Comprehensive"]);
    safetyDropdown.selection = 2; // Basic mode
    safetyDropdown.helpTip = "Safety level for property access";
    UI_STATE.configControls.safetyMode = safetyDropdown;
    
    return configPanel;
}

function createResultsPanel(parentWindow) {
    var resultsPanel = parentWindow.add("panel", undefined, "Analysis Results");
    resultsPanel.alignment = "fill";
    resultsPanel.preferredSize.height = 180;
    
    UI_STATE.resultDisplay = resultsPanel.add("edittext", undefined, 
        "No analysis performed yet.\n\nSelect targets and click 'Run Analysis' to begin.", 
        {multiline: true, readonly: true, scrolling: true});
    UI_STATE.resultDisplay.alignment = "fill";
    
    // Results control buttons
    var resultsButtonGroup = resultsPanel.add("group");
    resultsButtonGroup.alignment = "center";
    
    var clearResultsBtn = resultsButtonGroup.add("button", undefined, "Clear Results");
    clearResultsBtn.onClick = function() {
        clearResults();
    };
    
    var exportResultsBtn = resultsButtonGroup.add("button", undefined, "Export Results");
    exportResultsBtn.onClick = function() {
        exportResults();
    };
    
    var copyResultsBtn = resultsButtonGroup.add("button", undefined, "Copy to Clipboard");
    copyResultsBtn.onClick = function() {
        copyResultsToClipboard();
    };
    
    return resultsPanel;
}

function createProgressPanel(parentWindow) {
    var progressPanel = parentWindow.add("panel", undefined, "Progress");
    progressPanel.alignment = "fill";
    progressPanel.preferredSize.height = 60;
    
    UI_STATE.progressBar = progressPanel.add("progressbar", undefined, 0, 100);
    UI_STATE.progressBar.alignment = "fill";
    
    UI_STATE.statusText = progressPanel.add("statictext", undefined, "Ready for analysis");
    UI_STATE.statusText.alignment = "center";
    
    return progressPanel;
}

function createActionButtons(parentWindow) {
    var buttonGroup = parentWindow.add("group");
    buttonGroup.alignment = "center";
    buttonGroup.spacing = 10;
    
    var runAnalysisBtn = buttonGroup.add("button", undefined, "Run Analysis");
    runAnalysisBtn.preferredSize.width = 120;
    runAnalysisBtn.onClick = function() {
        runTargetedAnalysis();
    };
    
    var validateSetupBtn = buttonGroup.add("button", undefined, "Validate Setup");
    validateSetupBtn.onClick = function() {
        validateAnalysisSetup();
    };
    
    var helpBtn = buttonGroup.add("button", undefined, "Help");
    helpBtn.onClick = function() {
        showHelpDialog();
    };
    
    var cancelBtn = buttonGroup.add("button", undefined, "Close");
    cancelBtn.onClick = function() {
        UI_STATE.mainDialog.close();
    };
    
    return buttonGroup;
}

function createStatusBar(parentWindow) {
    var statusGroup = parentWindow.add("group");
    statusGroup.alignment = "fill";
    
    var statusText = statusGroup.add("statictext", undefined, 
        "Manual execution mode • Enhanced safety controls • ES3 compatible");
    statusText.alignment = "left";
    
    var memoryText = statusGroup.add("statictext", undefined, "Memory: OK");
    memoryText.alignment = "right";
    
    return statusGroup;
}

// ============================================================================
// UI UPDATE AND INTERACTION FUNCTIONS  
// ============================================================================

function updateDocumentInfo() {
    var infoText = "No document open";
    
    try {
        if (app.documents.length > 0) {
            var doc = app.activeDocument;
            UI_STATE.currentDocument = doc;
            
            var docName = emergencyGetProperty(doc, 'name', 'Unknown');
            var pageCount = emergencyGetLength(doc.pages, 1000);
            var saved = emergencyGetProperty(doc, 'saved', false);
            
            infoText = "Document: " + docName + "\n";
            infoText += "Pages: " + pageCount + "\n";
            infoText += "Saved: " + (saved ? "Yes" : "No") + "\n";
            infoText += "Status: Ready for analysis";
        }
    } catch (exc) {
        infoText = "Error reading document info: " + exc.message;
    }
    
    if (UI_STATE.documentInfo) {
        UI_STATE.documentInfo.text = infoText;
    }
}

function updateAnalysisTargets() {
    // Update target states based on current configuration
    debugLog("Updating analysis targets display", "UI");
}

function updateTargetStates() {
    // Sync checkbox states with ANALYSIS_TARGETS
    for (var targetKey in UI_STATE.targetCheckboxes) {
        var checkbox = UI_STATE.targetCheckboxes[targetKey];
        if (ANALYSIS_TARGETS[targetKey]) {
            ANALYSIS_TARGETS[targetKey].enabled = checkbox.value;
        }
    }
    
    updateStatus("Target configuration updated");
}

function selectTargetsBySafety(safetyLevel) {
    for (var targetKey in ANALYSIS_TARGETS) {
        var target = ANALYSIS_TARGETS[targetKey];
        var checkbox = UI_STATE.targetCheckboxes[targetKey];
        
        if (target.safetyLevel === safetyLevel && checkbox) {
            checkbox.value = true;
            target.enabled = true;
        }
    }
    
    updateStatus("Selected " + safetyLevel + " targets only");
}

function selectAllTargets(enableAll) {
    for (var targetKey in UI_STATE.targetCheckboxes) {
        var checkbox = UI_STATE.targetCheckboxes[targetKey];
        checkbox.value = enableAll;
        
        if (ANALYSIS_TARGETS[targetKey]) {
            ANALYSIS_TARGETS[targetKey].enabled = enableAll;
        }
    }
    
    updateStatus(enableAll ? "All targets selected" : "All targets cleared");
}

function updateStatus(message) {
    if (UI_STATE.statusText) {
        UI_STATE.statusText.text = message;
    }
    debugLog("UI Status: " + message, "UI");
}

function updateProgress(currentValue, maxValue, message) {
    if (UI_STATE.progressBar) {
        UI_STATE.progressBar.value = currentValue;
        UI_STATE.progressBar.maxvalue = maxValue;
    }
    
    if (message && UI_STATE.statusText) {
        UI_STATE.statusText.text = message;
    }
}

// ============================================================================
// ANALYSIS EXECUTION FUNCTIONS
// ============================================================================

function runTargetedAnalysis() {
    if (!validateAnalysisPrerequisites()) {
        return false;
    }
    
    updateStatus("Starting targeted analysis...");
    updateProgress(0, 100, "Initializing analysis");
    
    try {
        // Get enabled targets
        var enabledTargets = getEnabledTargets();
        if (enabledTargets.length === 0) {
            alert("No targets selected for analysis.");
            return false;
        }
        
        // Get configuration
        var analysisConfig = getAnalysisConfiguration();
        
        // Run analysis with selected targets
        var results = performTargetedAnalysis(UI_STATE.currentDocument, enabledTargets, analysisConfig);
        
        // Display results
        displayAnalysisResults(results);
        
        updateStatus("Analysis completed successfully");
        updateProgress(100, 100, "Analysis complete");
        
        return true;
        
    } catch (exc) {
        var errorMsg = "Analysis failed: " + exc.message;
        updateStatus(errorMsg);
        alert(errorMsg);
        debugLog("Analysis error: " + exc.message, "ERROR");
        return false;
    }
}

function validateAnalysisPrerequisites() {
    // Check document
    if (!app.documents.length) {
        alert("No document is open. Please open a document first.");
        return false;
    }
    
    // Check if document is saved
    var doc = app.activeDocument;
    var saved = emergencyGetProperty(doc, 'saved', false);
    if (!saved) {
        var shouldContinue = confirm("Document is not saved. Continue anyway?");
        if (!shouldContinue) {
            return false;
        }
    }
    
    return true;
}

function getEnabledTargets() {
    var enabledList = [];
    
    for (var targetKey in ANALYSIS_TARGETS) {
        if (ANALYSIS_TARGETS[targetKey].enabled) {
            enabledList.push(targetKey);
        }
    }
    
    return enabledList;
}

function getAnalysisConfiguration() {
    var config = {
        timeout: parseInt(UI_STATE.configControls.timeout.text) || 5000,
        sampleLimit: parseInt(UI_STATE.configControls.sampleLimit.text) || 10,
        maxDepth: parseInt(UI_STATE.configControls.maxDepth.text) || 3,
        safetyMode: UI_STATE.configControls.safetyMode.selection ? 
            UI_STATE.configControls.safetyMode.selection.text.toLowerCase() : "basic"
    };
    
    return config;
}

function performTargetedAnalysis(doc, enabledTargets, config) {
    var results = {
        timestamp: toISOString(new Date()),
        targets: {},
        summary: {
            totalTargets: enabledTargets.length,
            successfulTargets: 0,
            failedTargets: 0,
            totalProperties: 0,
            errors: []
        },
        configuration: config
    };
    
    for (var i = 0; i < enabledTargets.length; i++) {
        var targetKey = enabledTargets[i];
        var target = ANALYSIS_TARGETS[targetKey];
        
        updateProgress(i + 1, enabledTargets.length, "Analyzing: " + target.name);
        
        try {
            var targetResult = analyzeTarget(doc, targetKey, target, config);
            results.targets[targetKey] = targetResult;
            
            if (targetResult.success) {
                results.summary.successfulTargets++;
                results.summary.totalProperties += targetResult.propertyCount || 0;
            } else {
                results.summary.failedTargets++;
                results.summary.errors.push(targetKey + ": " + targetResult.errorMessage);
            }
            
        } catch (exc) {
            results.targets[targetKey] = {
                success: false,
                errorMessage: exc.message,
                propertyCount: 0
            };
            results.summary.failedTargets++;
            results.summary.errors.push(targetKey + ": " + exc.message);
        }
    }
    
    return results;
}

function analyzeTarget(doc, targetKey, target, config) {
    var startTime = new Date().getTime();
    
    var targetResult = {
        name: target.name,
        description: target.description,
        safetyLevel: target.safetyLevel,
        success: false,
        propertyCount: 0,
        data: {},
        processingTime: 0,
        errorMessage: null
    };
    
    try {
        // Route to appropriate analysis function based on target
        switch (targetKey) {
            case "documentProperties":
                targetResult.data = analyzeDocumentProperties(doc, config);
                break;
            case "pageCollection":
                targetResult.data = analyzePageCollection(doc, config);
                break;
            case "textFrames":
                targetResult.data = analyzeTextFrames(doc, config);
                break;
            case "textContent":
                targetResult.data = analyzeTextContent(doc, config);
                break;
            case "images":
                targetResult.data = analyzeImages(doc, config);
                break;
            case "links":
                targetResult.data = analyzeLinks(doc, config);
                break;
            case "styles":
                targetResult.data = analyzeStyles(doc, config);
                break;
            case "colors":
                targetResult.data = analyzeColors(doc, config);
                break;
            case "layers":
                targetResult.data = analyzeLayers(doc, config);
                break;
            case "pageItems":
                targetResult.data = analyzePageItems(doc, config);
                break;
            default:
                throw new Error("Unknown target: " + targetKey);
        }
        
        targetResult.success = true;
        targetResult.propertyCount = countProperties(targetResult.data);
        
    } catch (exc) {
        targetResult.errorMessage = exc.message;
        targetResult.success = false;
    }
    
    targetResult.processingTime = new Date().getTime() - startTime;
    return targetResult;
}

// ============================================================================
// SPECIFIC TARGET ANALYSIS FUNCTIONS
// ============================================================================

function analyzeDocumentProperties(doc, config) {
    var properties = {};
    
    properties.name = emergencyGetProperty(doc, 'name', '[Unknown]');
    properties.saved = emergencyGetProperty(doc, 'saved', false);
    properties.modified = emergencyGetProperty(doc, 'modified', false);
    properties.pageCount = emergencyGetLength(doc.pages, config.timeout);
    properties.spreadCount = emergencyGetLength(doc.spreads, config.timeout);
    properties.layerCount = emergencyGetLength(doc.layers, config.timeout);
    
    // Document preferences with safety
    var docPrefs = emergencyGetProperty(doc, 'documentPreferences');
    if (docPrefs) {
        properties.pageSize = {
            width: emergencyGetProperty(docPrefs, 'pageWidth', 0),
            height: emergencyGetProperty(docPrefs, 'pageHeight', 0)
        };
        properties.pageOrientation = emergencyGetProperty(docPrefs, 'pageOrientation', 'Unknown');
        properties.columnCount = emergencyGetProperty(docPrefs, 'columnCount', 1);
    }
    
    return properties;
}

function analyzePageCollection(doc, config) {
    var pages = emergencyGetProperty(doc, 'pages');
    if (!pages) {
        throw new Error("Cannot access pages collection");
    }
    
    var pageCount = emergencyGetLength(pages, config.timeout);
    var sampleLimit = Math.min(pageCount, config.sampleLimit);
    
    var pagesData = {
        totalCount: pageCount,
        sampledCount: sampleLimit,
        pages: []
    };
    
    for (var i = 0; i < sampleLimit; i++) {
        try {
            var page = emergencyGetCollectionItem(pages, i, config.timeout);
            if (page) {
                var pageInfo = {
                    index: i,
                    name: emergencyGetProperty(page, 'name', 'Page ' + (i + 1)),
                    itemCount: emergencyGetLength(emergencyGetProperty(page, 'pageItems'), config.timeout / 2),
                    textFrameCount: emergencyGetLength(emergencyGetProperty(page, 'textFrames'), config.timeout / 2)
                };
                
                pagesData.pages.push(pageInfo);
            }
        } catch (exc) {
            debugLog("Error analyzing page " + i + ": " + exc.message, "ERROR");
        }
    }
    
    return pagesData;
}

function analyzeTextFrames(doc, config) {
    var textFrames = emergencyGetProperty(doc, 'textFrames');
    if (!textFrames) {
        throw new Error("Cannot access text frames collection");
    }
    
    var frameCount = emergencyGetLength(textFrames, config.timeout);
    var sampleLimit = Math.min(frameCount, config.sampleLimit);
    
    var framesData = {
        totalCount: frameCount,
        sampledCount: sampleLimit,
        frames: []
    };
    
    for (var i = 0; i < sampleLimit; i++) {
        try {
            var frame = emergencyGetCollectionItem(textFrames, i, config.timeout);
            if (frame) {
                var frameInfo = {
                    index: i,
                    hasContent: false,
                    contentLength: 0,
                    overflows: emergencyGetProperty(frame, 'overflows', false),
                    geometricBounds: emergencyGetProperty(frame, 'geometricBounds', null)
                };
                
                // Check for content safely
                var contents = emergencyGetProperty(frame, 'contents');
                if (contents && typeof contents === 'string') {
                    frameInfo.hasContent = true;
                    frameInfo.contentLength = contents.length;
                }
                
                framesData.frames.push(frameInfo);
            }
        } catch (exc) {
            debugLog("Error analyzing text frame " + i + ": " + exc.message, "ERROR");
        }
    }
    
    return framesData;
}

function analyzeTextContent(doc, config) {
    var textFrames = emergencyGetProperty(doc, 'textFrames');
    if (!textFrames) {
        throw new Error("Cannot access text frames for content analysis");
    }
    
    var frameCount = emergencyGetLength(textFrames, config.timeout);
    var sampleLimit = Math.min(frameCount, config.sampleLimit);
    
    var contentData = {
        totalFrames: frameCount,
        sampledFrames: sampleLimit,
        totalCharacterLength: 0,
        averageWordsPerFrame: 0,
        contentSamples: []
    };
    
    var totalWords = 0;
    var framesWithContent = 0;
    
    for (var i = 0; i < sampleLimit; i++) {
        try {
            var frame = emergencyGetCollectionItem(textFrames, i, config.timeout);
            if (frame) {
                var contents = emergencyGetProperty(frame, 'contents');
                if (contents && typeof contents === 'string' && contents.length > 0) {
                    framesWithContent++;
                    contentData.totalCharacterLength += contents.length;
                    
                    // Simple word count
                    var words = contents.split(/\s+/);
                    var wordCount = 0;
                    for (var j = 0; j < words.length; j++) {
                        if (words[j].length > 0) {
                            wordCount++;
                        }
                    }
                    totalWords += wordCount;
                    
                    // Store sample (first 100 characters)
                    var sample = contents.substring(0, 100);
                    if (contents.length > 100) {
                        sample += "...";
                    }
                    
                    contentData.contentSamples.push({
                        frameIndex: i,
                        characterCount: contents.length,
                        wordCount: wordCount,
                        sample: sample
                    });
                }
            }
        } catch (exc) {
            debugLog("Error analyzing text content " + i + ": " + exc.message, "ERROR");
        }
    }
    
    if (framesWithContent > 0) {
        contentData.averageWordsPerFrame = Math.round(totalWords / framesWithContent);
    }
    
    return contentData;
}

function analyzeImages(doc, config) {
    var images = emergencyGetProperty(doc, 'images');
    if (!images) {
        throw new Error("Cannot access images collection");
    }
    
    var imageCount = emergencyGetLength(images, config.timeout);
    var sampleLimit = Math.min(imageCount, config.sampleLimit);
    
    var imagesData = {
        totalCount: imageCount,
        sampledCount: sampleLimit,
        images: []
    };
    
    for (var i = 0; i < sampleLimit; i++) {
        try {
            var image = emergencyGetCollectionItem(images, i, config.timeout);
            if (image) {
                var imageInfo = {
                    index: i,
                    itemLink: emergencyGetProperty(image, 'itemLink', null),
                    actualResolution: emergencyGetProperty(image, 'actualResolution', null),
                    effectiveResolution: emergencyGetProperty(image, 'effectiveResolution', null),
                    space: emergencyGetProperty(image, 'space', 'Unknown')
                };
                
                // Try to get link information safely
                var itemLink = imageInfo.itemLink;
                if (itemLink) {
                    imageInfo.linkName = emergencyGetProperty(itemLink, 'name', 'Unknown');
                    imageInfo.linkStatus = emergencyGetProperty(itemLink, 'status', 'Unknown');
                }
                
                imagesData.images.push(imageInfo);
            }
        } catch (exc) {
            debugLog("Error analyzing image " + i + ": " + exc.message, "ERROR");
        }
    }
    
    return imagesData;
}

function analyzeLinks(doc, config) {
    var links = emergencyGetProperty(doc, 'links');
    if (!links) {
        throw new Error("Cannot access links collection");
    }
    
    var linkCount = emergencyGetLength(links, config.timeout);
    var sampleLimit = Math.min(linkCount, config.sampleLimit);
    
    var linksData = {
        totalCount: linkCount,
        sampledCount: sampleLimit,
        links: []
    };
    
    for (var i = 0; i < sampleLimit; i++) {
        try {
            var link = emergencyGetCollectionItem(links, i, config.timeout);
            if (link) {
                var linkInfo = {
                    index: i,
                    name: emergencyGetProperty(link, 'name', 'Unknown'),
                    status: emergencyGetProperty(link, 'status', 'Unknown'),
                    filePath: emergencyGetProperty(link, 'filePath', 'Unknown'),
                    size: emergencyGetProperty(link, 'size', 0),
                    needed: emergencyGetProperty(link, 'needed', false)
                };
                
                linksData.links.push(linkInfo);
            }
        } catch (exc) {
            debugLog("Error analyzing link " + i + ": " + exc.message, "ERROR");
        }
    }
    
    return linksData;
}

function analyzeStyles(doc, config) {
    var stylesData = {
        paragraphStyles: {},
        characterStyles: {}
    };
    
    // Analyze paragraph styles
    try {
        var paraStyles = emergencyGetProperty(doc, 'paragraphStyles');
        if (paraStyles) {
            var paraStyleCount = emergencyGetLength(paraStyles, config.timeout);
            stylesData.paragraphStyles.totalCount = paraStyleCount;
            stylesData.paragraphStyles.styles = [];
            
            var sampleLimit = Math.min(paraStyleCount, config.sampleLimit);
            for (var i = 0; i < sampleLimit; i++) {
                try {
                    var paraStyle = emergencyGetCollectionItem(paraStyles, i, config.timeout);
                    if (paraStyle) {
                        var styleInfo = {
                            index: i,
                            name: emergencyGetProperty(paraStyle, 'name', 'Unknown'),
                            appliedFont: emergencyGetProperty(paraStyle, 'appliedFont', 'Unknown'),
                            pointSize: emergencyGetProperty(paraStyle, 'pointSize', 0)
                        };
                        stylesData.paragraphStyles.styles.push(styleInfo);
                    }
                } catch (exc) {
                    debugLog("Error analyzing paragraph style " + i + ": " + exc.message, "ERROR");
                }
            }
        }
    } catch (exc) {
        stylesData.paragraphStyles.errorMessage = exc.message;
    }
    
    // Analyze character styles
    try {
        var charStyles = emergencyGetProperty(doc, 'characterStyles');
        if (charStyles) {
            var charStyleCount = emergencyGetLength(charStyles, config.timeout);
            stylesData.characterStyles.totalCount = charStyleCount;
            stylesData.characterStyles.styles = [];
            
            var sampleLimit = Math.min(charStyleCount, config.sampleLimit);
            for (var i = 0; i < sampleLimit; i++) {
                try {
                    var charStyle = emergencyGetCollectionItem(charStyles, i, config.timeout);
                    if (charStyle) {
                        var styleInfo = {
                            index: i,
                            name: emergencyGetProperty(charStyle, 'name', 'Unknown'),
                            appliedFont: emergencyGetProperty(charStyle, 'appliedFont', 'Unknown')
                        };
                        stylesData.characterStyles.styles.push(styleInfo);
                    }
                } catch (exc) {
                    debugLog("Error analyzing character style " + i + ": " + exc.message, "ERROR");
                }
            }
        }
    } catch (exc) {
        stylesData.characterStyles.errorMessage = exc.message;
    }
    
    return stylesData;
}

function analyzeColors(doc, config) {
    var colors = emergencyGetProperty(doc, 'colors');
    if (!colors) {
        throw new Error("Cannot access colors collection");
    }
    
    var colorCount = emergencyGetLength(colors, config.timeout);
    var sampleLimit = Math.min(colorCount, config.sampleLimit);
    
    var colorsData = {
        totalCount: colorCount,
        sampledCount: sampleLimit,
        colors: []
    };
    
    for (var i = 0; i < sampleLimit; i++) {
        try {
            var colorItem = emergencyGetCollectionItem(colors, i, config.timeout);
            if (colorItem) {
                var colorInfo = {
                    index: i,
                    name: emergencyGetProperty(colorItem, 'name', 'Unknown'),
                    space: emergencyGetProperty(colorItem, 'space', 'Unknown'),
                    model: emergencyGetProperty(colorItem, 'model', 'Unknown'),
                    colorValues: emergencyGetProperty(colorItem, 'colorValue', null)
                };
                
                colorsData.colors.push(colorInfo);
            }
        } catch (exc) {
            debugLog("Error analyzing color " + i + ": " + exc.message, "ERROR");
        }
    }
    
    return colorsData;
}

function analyzeLayers(doc, config) {
    var layers = emergencyGetProperty(doc, 'layers');
    if (!layers) {
        throw new Error("Cannot access layers collection");
    }
    
    var layerCount = emergencyGetLength(layers, config.timeout);
    
    var layersData = {
        totalCount: layerCount,
        layers: []
    };
    
    // Analyze all layers (usually not too many)
    for (var i = 0; i < layerCount; i++) {
        try {
            var layer = emergencyGetCollectionItem(layers, i, config.timeout);
            if (layer) {
                var layerInfo = {
                    index: i,
                    name: emergencyGetProperty(layer, 'name', 'Unknown'),
                    visible: emergencyGetProperty(layer, 'visible', true),
                    locked: emergencyGetProperty(layer, 'locked', false),
                    layerColor: emergencyGetProperty(layer, 'layerColor', 'Unknown')
                };
                
                layersData.layers.push(layerInfo);
            }
        } catch (exc) {
            debugLog("Error analyzing layer " + i + ": " + exc.message, "ERROR");
        }
    }
    
    return layersData;
}

function analyzePageItems(doc, config) {
    var pageItems = emergencyGetProperty(doc, 'pageItems');
    if (!pageItems) {
        throw new Error("Cannot access page items collection");
    }
    
    var itemCount = emergencyGetLength(pageItems, config.timeout);
    var sampleLimit = Math.min(itemCount, config.sampleLimit);
    
    var itemsData = {
        totalCount: itemCount,
        sampledCount: sampleLimit,
        items: []
    };
    
    for (var i = 0; i < sampleLimit; i++) {
        try {
            var pageItem = emergencyGetCollectionItem(pageItems, i, config.timeout);
            if (pageItem) {
                var itemInfo = {
                    index: i,
                    constructor: emergencyGetProperty(pageItem, 'constructor', 'Unknown'),
                    geometricBounds: emergencyGetProperty(pageItem, 'geometricBounds', null),
                    visible: emergencyGetProperty(pageItem, 'visible', true),
                    locked: emergencyGetProperty(pageItem, 'locked', false),
                    label: emergencyGetProperty(pageItem, 'label', '')
                };
                
                itemsData.items.push(itemInfo);
            }
        } catch (exc) {
            debugLog("Error analyzing page item " + i + ": " + exc.message, "ERROR");
        }
    }
    
    return itemsData;
}

// ============================================================================
// RESULT DISPLAY AND UTILITY FUNCTIONS
// ============================================================================

function displayAnalysisResults(results) {
    var resultText = "ANALYSIS RESULTS\n";
    resultText += "Generated: " + results.timestamp + "\n";
    resultText += "Configuration: " + results.configuration.safetyMode + " mode\n";
    resultText += "=====================================\n\n";
    
    // Summary
    resultText += "SUMMARY:\n";
    resultText += "Targets analyzed: " + results.summary.totalTargets + "\n";
    resultText += "Successful: " + results.summary.successfulTargets + "\n";
    resultText += "Failed: " + results.summary.failedTargets + "\n";
    resultText += "Total properties: " + results.summary.totalProperties + "\n\n";
    
    // Errors
    if (results.summary.errors.length > 0) {
        resultText += "ERRORS:\n";
        for (var i = 0; i < results.summary.errors.length; i++) {
            resultText += "• " + results.summary.errors[i] + "\n";
        }
        resultText += "\n";
    }
    
    // Target details
    resultText += "TARGET DETAILS:\n";
    for (var targetKey in results.targets) {
        var target = results.targets[targetKey];
        resultText += "\n" + target.name + " (" + targetKey + "):\n";
        resultText += "  Status: " + (target.success ? "SUCCESS" : "FAILED") + "\n";
        resultText += "  Properties: " + target.propertyCount + "\n";
        resultText += "  Time: " + target.processingTime + "ms\n";
        
        if (target.errorMessage) {
            resultText += "  Error: " + target.errorMessage + "\n";
        }
        
        if (target.success && target.data) {
            resultText += "  Data preview: " + formatDataPreview(target.data) + "\n";
        }
    }
    
    UI_STATE.resultDisplay.text = resultText;
    UI_STATE.lastResults = results;
}

function formatDataPreview(data) {
    try {
        var preview = "";
        var keyCount = 0;
        
        for (var key in data) {
            if (keyCount >= 3) {
                preview += "...";
                break;
            }
            
            var value = data[key];
            if (typeof value === 'object' && value !== null) {
                preview += key + "=[Object], ";
            } else {
                var valueStr = String(value);
                if (valueStr.length > 20) {
                    valueStr = valueStr.substring(0, 20) + "...";
                }
                preview += key + "=" + valueStr + ", ";
            }
            keyCount++;
        }
        
        return preview.replace(/, $/, "");
    } catch (exc) {
        return "[Preview unavailable]";
    }
}

function countProperties(data) {
    var count = 0;
    
    try {
        for (var key in data) {
            count++;
            var value = data[key];
            
            // Count nested properties (up to 2 levels)
            if (typeof value === 'object' && value !== null) {
                for (var nestedKey in value) {
                    count++;
                }
            }
        }
    } catch (exc) {
        // Return what we have so far
    }
    
    return count;
}

function clearResults() {
    UI_STATE.resultDisplay.text = "Results cleared.\n\nSelect targets and run analysis to see new results.";
    UI_STATE.lastResults = null;
    updateStatus("Results cleared");
}

function exportResults() {
    if (!UI_STATE.lastResults) {
        alert("No results to export. Run an analysis first.");
        return;
    }
    
    try {
        var resultsFile = File.saveDialog("Save Analysis Results", "*.txt");
        if (!resultsFile) {
            return; // User cancelled
        }
        
        var exportText = generateDetailedExport(UI_STATE.lastResults);
        
        resultsFile.open("w");
        resultsFile.write(exportText);
        resultsFile.close();
        
        alert("Results exported successfully to:\n" + resultsFile.fsName);
        updateStatus("Results exported to " + resultsFile.name);
        
    } catch (exc) {
        alert("Export failed: " + exc.message);
    }
}

function generateDetailedExport(results) {
    var exportText = "INDESIGN DOCUMENT ANALYSIS RESULTS\n";
    exportText += "Generated: " + results.timestamp + "\n";
    exportText += "Tool: InDesign Document Inspector v3.1\n";
    exportText += "Mode: Enhanced Safety Edition\n";
    exportText += "===============================================\n\n";
    
    // Configuration details
    exportText += "ANALYSIS CONFIGURATION:\n";
    exportText += "Safety Mode: " + results.configuration.safetyMode + "\n";
    exportText += "Timeout: " + results.configuration.timeout + "ms\n";
    exportText += "Sample Limit: " + results.configuration.sampleLimit + "\n";
    exportText += "Max Depth: " + results.configuration.maxDepth + "\n\n";
    
    // Summary
    exportText += "SUMMARY:\n";
    exportText += "Total Targets: " + results.summary.totalTargets + "\n";
    exportText += "Successful: " + results.summary.successfulTargets + "\n";
    exportText += "Failed: " + results.summary.failedTargets + "\n";
    exportText += "Total Properties: " + results.summary.totalProperties + "\n\n";
    
    // Detailed results for each target
    for (var targetKey in results.targets) {
        var target = results.targets[targetKey];
        
        exportText += "===============================================\n";
        exportText += "TARGET: " + target.name + " (" + targetKey + ")\n";
        exportText += "===============================================\n";
        exportText += "Description: " + target.description + "\n";
        exportText += "Safety Level: " + target.safetyLevel + "\n";
        exportText += "Status: " + (target.success ? "SUCCESS" : "FAILED") + "\n";
        exportText += "Properties Found: " + target.propertyCount + "\n";
        exportText += "Processing Time: " + target.processingTime + "ms\n";
        
        if (target.errorMessage) {
            exportText += "Error: " + target.errorMessage + "\n";
        }
        
        if (target.success && target.data) {
            exportText += "\nDATA:\n";
            exportText += formatDataForExport(target.data, 0);
        }
        
        exportText += "\n\n";
    }
    
    // Error summary
    if (results.summary.errors.length > 0) {
        exportText += "===============================================\n";
        exportText += "ERROR SUMMARY\n";
        exportText += "===============================================\n";
        for (var i = 0; i < results.summary.errors.length; i++) {
            exportText += (i + 1) + ". " + results.summary.errors[i] + "\n";
        }
        exportText += "\n";
    }
    
    exportText += "Analysis completed.\n";
    return exportText;
}

function formatDataForExport(data, indentLevel) {
    var indent = "";
    for (var i = 0; i < indentLevel; i++) {
        indent += "  ";
    }
    
    var result = "";
    
    try {
        for (var key in data) {
            var value = data[key];
            
            if (value === null || value === undefined) {
                result += indent + key + ": [null]\n";
            } else if (typeof value === 'object') {
                result += indent + key + ":\n";
                
                // Limit nesting depth
                if (indentLevel < 3) {
                    result += formatDataForExport(value, indentLevel + 1);
                } else {
                    result += indent + "  [Object - max depth reached]\n";
                }
            } else {
                var valueStr = String(value);
                if (valueStr.length > 200) {
                    valueStr = valueStr.substring(0, 200) + "... [truncated]";
                }
                result += indent + key + ": " + valueStr + "\n";
            }
        }
    } catch (exc) {
        result += indent + "[Error formatting data: " + exc.message + "]\n";
    }
    
    return result;
}

function copyResultsToClipboard() {
    if (!UI_STATE.resultDisplay.text) {
        alert("No results to copy.");
        return;
    }
    
    try {
        // Copy results text to clipboard (if supported)
        var clipboardText = UI_STATE.resultDisplay.text;
        
        // ExtendScript doesn't have direct clipboard access, so show alternative
        var copyDialog = new Window("dialog", "Copy Results");
        copyDialog.alignChildren = "fill";
        
        copyDialog.add("statictext", undefined, "Select all text below and copy manually:");
        
        var textArea = copyDialog.add("edittext", undefined, clipboardText, 
            {multiline: true, readonly: true, scrolling: true});
        textArea.preferredSize.width = 500;
        textArea.preferredSize.height = 300;
        
        var buttonGroup = copyDialog.add("group");
        buttonGroup.alignment = "center";
        
        var selectAllBtn = buttonGroup.add("button", undefined, "Select All");
        selectAllBtn.onClick = function() {
            textArea.active = true;
            textArea.selection = [0, textArea.text.length];
        };
        
        var closeBtn = buttonGroup.add("button", undefined, "Close");
        closeBtn.onClick = function() {
            copyDialog.close();
        };
        
        copyDialog.show();
        
    } catch (exc) {
        alert("Copy failed: " + exc.message);
    }
}

function validateAnalysisSetup() {
    var issues = [];
    
    // Check document
    if (!app.documents.length) {
        issues.push("No document is open");
    } else {
        var doc = app.activeDocument;
        var saved = emergencyGetProperty(doc, 'saved', false);
        if (!saved) {
            issues.push("Document is not saved");
        }
    }
    
    // Check targets
    var enabledTargets = getEnabledTargets();
    if (enabledTargets.length === 0) {
        issues.push("No analysis targets are selected");
    }
    
    // Check configuration
    var config = getAnalysisConfiguration();
    if (config.timeout < 100) {
        issues.push("Timeout is too low (minimum 100ms recommended)");
    }
    
    if (config.sampleLimit < 1) {
        issues.push("Sample limit must be at least 1");
    }
    
    if (config.maxDepth < 1) {
        issues.push("Max depth must be at least 1");
    }
    
    // Show results
    var message = issues.length === 0 ? 
        "✓ Setup validation passed!\n\nReady for analysis." :
        "⚠ Setup issues found:\n\n• " + issues.join("\n• ") + "\n\nPlease fix these issues before running analysis.";
    
    alert(message);
    updateStatus("Setup validation: " + (issues.length === 0 ? "PASSED" : issues.length + " issues found"));
    
    return issues.length === 0;
}

function showHelpDialog() {
    var helpDialog = new Window("dialog", "Help - Manual Execution Mode");
    helpDialog.orientation = "column";
    helpDialog.alignChildren = "fill";
    helpDialog.preferredSize.width = 600;
    helpDialog.preferredSize.height = 500;
    
    var helpText = helpDialog.add("edittext", undefined, 
        "INDESIGN DOCUMENT INSPECTOR v3.1 - MANUAL EXECUTION MODE\n\n" +
        "OVERVIEW:\n" +
        "This tool allows you to manually select specific document properties\n" +
        "to analyze with enhanced safety controls.\n\n" +
        "HOW TO USE:\n" +
        "1. Open an InDesign document\n" +
        "2. Select analysis targets using the checkboxes\n" +
        "3. Configure timeout and sample limits\n" +
        "4. Choose safety mode (Emergency to Comprehensive)\n" +
        "5. Click 'Run Analysis' to execute\n\n" +
        "SAFETY LEVELS:\n" +
        "✓ Safe - Basic properties, very low risk\n" +
        "⚠ Moderate - Collection access, medium risk\n" +
        "⚡ Risky - Complex operations, higher risk\n\n" +
        "SAFETY MODES:\n" +
        "• Emergency - Ultra-safe, properties only\n" +
        "• Minimal - Basic collections with pre-testing\n" +
        "• Basic - Safe collections with timeouts\n" +
        "• Standard - Includes text content sampling\n" +
        "• Comprehensive - Full analysis with safety\n\n" +
        "TARGET CATEGORIES:\n" +
        "• Basic - Document properties, pages, layers\n" +
        "• Text - Text frames and content analysis\n" +
        "• Graphics - Images, links, and assets\n" +
        "• Formatting - Styles, colors, swatches\n" +
        "• Comprehensive - All page items and objects\n\n" +
        "CONFIGURATION:\n" +
        "• Timeout - Max time per property access (ms)\n" +
        "• Sample Limit - Max items to sample from collections\n" +
        "• Max Depth - Maximum nesting depth for objects\n\n" +
        "RESULTS:\n" +
        "• View results in the Results panel\n" +
        "• Export to text file for detailed analysis\n" +
        "• Copy results for use in other applications\n\n" +
        "TROUBLESHOOTING:\n" +
        "• Use 'Validate Setup' to check configuration\n" +
        "• Start with safe targets only for testing\n" +
        "• Use Emergency mode for problematic documents\n" +
        "• Check status messages for error details\n\n" +
        "This manual mode gives you complete control over what gets analyzed,\n" +
        "allowing for safer, more targeted document inspection.",
        {multiline: true, readonly: true, scrolling: true});
    helpText.alignment = "fill";
    
    var closeBtn = helpDialog.add("button", undefined, "Close");
    closeBtn.alignment = "center";
    closeBtn.onClick = function() {
        helpDialog.close();
    };
    
    helpDialog.show();
}

// ============================================================================
// MODULE INITIALIZATION
// ============================================================================

function showMainInterface() {
    debugLog("Showing main interface", "UI");
    
    try {
        var dialog = createMainInterface();
        dialog.show();
    } catch (exc) {
        alert("Failed to create interface: " + exc.message);
        debugLog("Interface creation failed: " + exc.message, "ERROR");
    }
}

$.writeln("Module 3.0: Simplified UI Interface loaded (Manual Execution Mode)");