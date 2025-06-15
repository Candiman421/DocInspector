// ============================================================================
// CHUNK 5: MAIN INTERFACE & ENTRY POINT - ESTK OPTIMIZED
// ES3 COMPATIBLE VERSION - ALL RESERVED WORDS FIXED
// ============================================================================

// Show enhanced comparison dialog with comprehensive features
function showEnhancedComparisonDialog(differences) {
    enhancedStatusLog("UI", "Displaying comparison results", 0, 1, "Opening enhanced comparison dialog");
    
    var dialog = new Window("dialog", "Document Comparison Results - Enhanced Inspector v2.1");
    dialog.preferredSize.width = 700;
    dialog.preferredSize.height = 600;
    
    var mainGroup = dialog.add("group");
    mainGroup.orientation = "column";
    mainGroup.alignment = "fill";
    
    // Create tabbed interface for better organization
    var tabPanel = mainGroup.add("tabbedpanel");
    tabPanel.alignment = "fill";
    tabPanel.preferredSize.height = 500;
    
    // Summary tab
    var summaryTab = tabPanel.add("tab", undefined, "Summary");
    var summaryPanel = summaryTab.add("panel", undefined, "Change Summary");
    summaryPanel.alignment = "fill";
    
    var summary = createEnhancedHumanReadableSummary(differences);
    var summaryText = summaryPanel.add("edittext", undefined, summary, {multiline: true, readonly: true});
    summaryText.alignment = "fill";
    
    // Technical tab
    var technicalTab = tabPanel.add("tab", undefined, "Technical Details");
    var technicalPanel = technicalTab.add("panel", undefined, "Technical Analysis");
    technicalPanel.alignment = "fill";
    
    var technical = createTechnicalSummary(differences);
    var technicalText = technicalPanel.add("edittext", undefined, technical, {multiline: true, readonly: true});
    technicalText.alignment = "fill";
    
    // Text Analysis tab (if text changes exist)
    var diffChanges = safeGetProperty(differences, 'changes');
    if (safeGetProperty(diffChanges, 'textContent') || safeGetProperty(diffChanges, 'textFrames')) {
        var textTab = tabPanel.add("tab", undefined, "Text Analysis");
        var textPanel = textTab.add("panel", undefined, "Text Content Changes");
        textPanel.alignment = "fill";
        
        var textAnalysis = createDetailedTextAnalysisSummary(differences);
        var textText = textPanel.add("edittext", undefined, textAnalysis, {multiline: true, readonly: true});
        textText.alignment = "fill";
    }
    
    // Action buttons
    var buttonGroup = mainGroup.add("group");
    buttonGroup.alignment = "center";
    
    var openFolderBtn = buttonGroup.add("button", undefined, "Open Report Folder");
    var exportBtn = buttonGroup.add("button", undefined, "Export All Reports");
    var resetBaselineBtn = buttonGroup.add("button", undefined, "Reset Baseline");
    var okBtn = buttonGroup.add("button", undefined, "OK");
    
    // Button event handlers
    openFolderBtn.onClick = function() {
        try {
            var currentDoc = UTILITY_STATE.currentDocument;
            if (currentDoc && safeGetProperty(currentDoc, 'filePath')) {
                var folder = Folder(safeGetProperty(currentDoc, 'filePath'));
                folder.execute();
            }
        } catch (exc) {
            alert("Could not open folder: " + exc.message);
        }
    };
    
    exportBtn.onClick = function() {
        exportAllReportsToFolder(differences);
    };
    
    resetBaselineBtn.onClick = function() {
        var confirmReset = confirm("This will create a new baseline from the current document state.\n\n" +
                                 "The existing baseline will be backed up.\n\nContinue?");
        if (confirmReset) {
            dialog.close();
            resetBaseline();
        }
    };
    
    okBtn.onClick = function() {
        dialog.close();
    };
    
    enhancedStatusLog("UI", "Comparison dialog ready", 1, 1, "User interface displayed");
    dialog.show();
}

// Export all reports to a selected folder
function exportAllReportsToFolder(differences) {
    enhancedStatusLog("EXPORT", "Starting export process", 0, 100, "Initializing report export");
    
    var folder = Folder.selectDialog("Select folder to save comprehensive report suite:");
    if (!folder) return;
    
    var timestamp = new Date().getTime();
    var currentDoc = UTILITY_STATE.currentDocument;
    var docName = currentDoc ? 
                  safeGetProperty(currentDoc, 'name', 'document').replace(/\.[^\.]+$/, "") : 
                  "document_" + timestamp;
    
    try {
        debugLog("Exporting all reports to: " + folder.fsName, "EXPORT");
        enhancedStatusLog("EXPORT", "Creating reports", 10, 100, "Generating all report formats");
        
        // Create all reports
        var reports = {
            comparison: differences,
            summary: createEnhancedHumanReadableSummary(differences),
            textAnalysis: createDetailedTextAnalysisSummary(differences),
            technical: createTechnicalSummary(differences),
            accessGuide: createAccessPathGuide(differences)
        };
        
        enhancedStatusLog("EXPORT", "Saving files", 30, 100, "Writing reports to selected folder");
        
        // Save all files with enhanced error handling
        var savedFiles = [];
        
        // JSON file
        var jsonFile = File(folder.fsName + "/" + docName + "_comprehensive_analysis_" + timestamp + ".json");
        try {
            enhancedStatusLog("EXPORT", "Saving JSON data", 40, 100, "Writing: " + jsonFile.name);
            jsonFile.open("w");
            jsonFile.write(JSON.stringify(reports.comparison, null, 2));
            jsonFile.close();
            savedFiles.push(jsonFile.name);
        } catch (exc) {
            alert("Failed to save JSON report: " + exc.message);
            return;
        }
        
        // Text reports
        var textReports = [
            {file: docName + "_summary_" + timestamp + ".txt", content: reports.summary},
            {file: docName + "_text_analysis_" + timestamp + ".txt", content: reports.textAnalysis},
            {file: docName + "_technical_" + timestamp + ".txt", content: reports.technical},
            {file: docName + "_access_guide_" + timestamp + ".txt", content: reports.accessGuide}
        ];
        
        for (var i = 0; i < textReports.length; i++) {
            var report = textReports[i];
            var progress = 50 + (i / textReports.length) * 40;
            enhancedStatusLog("EXPORT", "Saving text report", progress, 100, "Writing: " + report.file);
            
            try {
                var file = File(folder.fsName + "/" + report.file);
                file.open("w");
                file.write(report.content);
                file.close();
                savedFiles.push(file.name);
            } catch (exc) {
                alert("Failed to save " + report.file + ": " + exc.message);
                return;
            }
        }
        
        enhancedStatusLog("EXPORT", "Export completed", 100, 100, savedFiles.length + " files saved successfully");
        
        alert("Comprehensive report suite exported successfully!\n\n" +
              "Location: " + folder.fsName + "\n" +
              "Files saved: " + savedFiles.length + "\n\n" +
              "Files include:\n" +
              "* Complete technical JSON data\n" +
              "* Human-readable summary\n" +
              "* Detailed text analysis\n" +
              "* Technical analysis report\n" +
              "* Access paths guide");
              
        debugLog("Export completed successfully: " + savedFiles.length + " files", "EXPORT");
              
    } catch (exc) {
        alert("Export failed: " + exc.message);
        debugLog("Export failed: " + exc.message, "ERROR");
        enhancedStatusLog("EXPORT", "Export failed", 100, 100, "Error: " + exc.message);
    }
}

// Enhanced main analysis function
function analyzeDocument() {
    enhancedStatusLog("WORKFLOW", "Document analysis starting", 0, 100, "Standalone document analysis");
    
    if (!app.documents.length) {
        alert("Please open a document first.");
        return null;
    }
    
    var doc = app.activeDocument;
    var startTime = new Date().getTime();
    
    try {
        debugLog("Starting standalone document analysis", "ANALYZE");
        enhancedStatusLog("WORKFLOW", "Validating document", 5, 100, "Checking document state");
        
        // OPTIMIZED: Cache document properties to avoid duplicate calls (Bug #3 fix)
        var docSaved = safeGetProperty(doc, 'saved', false);
        var docPath = safeGetProperty(doc, 'filePath');
        var docName = safeGetProperty(doc, 'name', 'document').replace(/\.[^\.]+$/, "");
        
        // Check if document is saved
        if (!docSaved) {
            var shouldSave = confirm("Document must be saved before analysis. Save now?");
            if (shouldSave) {
                var saveFile = File.saveDialog("Save document", "*.indd");
                if (saveFile) {
                    enhancedStatusLog("WORKFLOW", "Saving document", 10, 100, "Saving to: " + saveFile.name);
                    doc.save(saveFile);
                    // Update cached values after save
                    docPath = safeGetProperty(doc, 'filePath');
                    docName = safeGetProperty(doc, 'name', 'document').replace(/\.[^\.]+$/, "");
                    debugLog("Document saved for analysis", "ANALYZE");
                } else {
                    alert("Analysis cancelled.");
                    return null;
                }
            } else {
                alert("Analysis cancelled.");
                return null;
            }
        }
        
        enhancedStatusLog("WORKFLOW", "Starting comprehensive analysis", 20, 100, "Using enhanced document analysis");
        
        var report = createValidatedDocumentReport(doc); // ENHANCED: Use validated version
        
        if (!report) {
            alert("Failed to create document report.");
            return null;
        }
        
        enhancedStatusLog("WORKFLOW", "Saving analysis report", 80, 100, "Writing comprehensive analysis to file");
        
        // Save comprehensive report
        var reportFile = File(docPath + "/" + docName + "_analysis.json");
        
        if (saveReportSafely(reportFile, report, "analysis")) {
            var duration = (new Date().getTime() - startTime) / 1000;
            
            enhancedStatusLog("WORKFLOW", "Analysis completed", 100, 100, "Report generated successfully");
            
            var summary = "Analysis complete! (" + duration + "s)\n\n";
            summary += "ANALYSIS RESULTS:\n";
            var discoveryStats = safeGetProperty(report, 'discoveryStats');
            summary += "Text items processed: " + (safeGetProperty(discoveryStats, 'textItemsProcessed', 0)) + "\n";
            summary += "Collections analyzed: " + (safeGetProperty(discoveryStats, 'collectionsAnalyzed', 0)) + "\n";
            summary += "Errors handled: " + (safeGetProperty(discoveryStats, 'errorsEncountered', 0)) + "\n";
            summary += "Processing time: " + safeGetProperty(report, 'processingTime', 0) + "ms\n\n";
            summary += "Report saved as: " + reportFile.name + "\n\n";
            summary += "Use Quick Compare to track changes over time!";
            
            alert(summary);
            debugLog("Standalone analysis completed successfully", "ANALYZE");
        }
        
        return report;
        
    } catch (exc) {
        var errorMsg = "Analysis failed: " + exc.message;
        if (exc.line) errorMsg += "\nLine: " + exc.line;
        
        alert(errorMsg);
        debugLog("Analysis failed: " + exc.message, "ERROR");
        enhancedStatusLog("WORKFLOW", "Analysis failed", 100, 100, "Error: " + exc.message);
        return null;
    }
}

// Reset baseline functionality with enhanced validation
function resetBaseline() {
    enhancedStatusLog("WORKFLOW", "Baseline reset starting", 0, 100, "Initializing baseline reset");
    
    if (!app.documents.length) {
        alert("Please open a document first.");
        return;
    }
    
    var doc = app.activeDocument;
    
    // OPTIMIZED: Cache document properties to avoid duplicate calls (Bug #3 fix)
    var docSaved = safeGetProperty(doc, 'saved', false);
    var docPath = safeGetProperty(doc, 'filePath');
    var docName = safeGetProperty(doc, 'name', 'document').replace(/\.[^\.]+$/, "");
    
    if (!docSaved || !docPath) {
        alert("Document must be saved before creating baseline.");
        return;
    }
    
    debugLog("Resetting baseline for document: " + docName, "BASELINE");
    enhancedStatusLog("WORKFLOW", "Validating document", 10, 100, "Document: " + docName);
    
    try {
        var baselineFile = File(docPath + "/" + docName + "_baseline.json");
        var backupFile = File(docPath + "/" + docName + "_baseline_backup.json");
        
        enhancedStatusLog("WORKFLOW", "Creating backup", 20, 100, "Backing up existing baseline");
        
        // Create backup if baseline exists
        if (baselineFile.exists) {
            try {
                baselineFile.copy(backupFile);
                debugLog("Baseline backup created: " + backupFile.name, "BASELINE");
                enhancedStatusLog("WORKFLOW", "Backup created", 30, 100, "Backup: " + backupFile.name);
            } catch (exc) {
                debugLog("Backup creation failed: " + exc.message, "WARN");
            }
        }
        
        enhancedStatusLog("WORKFLOW", "Creating new baseline", 40, 100, "Starting comprehensive analysis");
        
        // Create new baseline
        var success = showProgressDialog("Creating new baseline...", function() {
            var report = createValidatedDocumentReport(doc); // ENHANCED: Use validated version
            if (report && validateAnalysisReport(report)) {
                return saveReportSafely(baselineFile, report, "baseline");
            }
            return false;
        });
        
        if (success) {
            enhancedStatusLog("WORKFLOW", "Baseline reset completed", 100, 100, "New baseline ready");
            
            var message = "New baseline created successfully!\n\n";
            message += "New baseline saved as: " + baselineFile.name + "\n";
            if (backupFile.exists) {
                message += "Old baseline backed up as: " + backupFile.name + "\n";
            }
            message += "\nYou can now make changes and run Quick Compare to see differences.";
            
            alert(message);
            debugLog("Baseline reset completed successfully", "BASELINE");
        } else {
            alert("Failed to create new baseline.");
            debugLog("Baseline reset failed", "ERROR");
            enhancedStatusLog("WORKFLOW", "Baseline reset failed", 100, 100, "Could not create new baseline");
        }
        
    } catch (exc) {
        alert("Baseline reset failed: " + exc.message);
        debugLog("Baseline reset failed: " + exc.message, "ERROR");
        enhancedStatusLog("WORKFLOW", "Baseline reset failed", 100, 100, "Error: " + exc.message);
    }
}

// Show help dialog with comprehensive information
function showHelpDialog() {
    enhancedStatusLog("UI", "Displaying help dialog", 0, 1, "Opening help and documentation");
    
    var helpDialog = new Window("dialog", "Enhanced InDesign Inspector - Help & Documentation");
    helpDialog.preferredSize.width = 650;
    helpDialog.preferredSize.height = 550;
    
    var helpGroup = helpDialog.add("group");
    helpGroup.orientation = "column";
    helpGroup.alignment = "fill";
    
    var helpText = helpGroup.add("edittext", undefined, 
        "ENHANCED INDESIGN DOCUMENT INSPECTOR v2.1-ESTK\n\n" +
        "OVERVIEW:\n" +
        "Comprehensive InDesign document analysis and change tracking tool\n" +
        "optimized for ExtendScript Toolkit (ESTK) development and debugging.\n\n" +
        "FEATURES:\n" +
        "* Comprehensive document property analysis with validation\n" +
        "* Robust text content capture and change detection\n" +
        "* Safe object model access with multiple fallback methods\n" +
        "* Enhanced error handling and recovery\n" +
        "* ESTK debugging with detailed console output\n" +
        "* Baseline creation and comparison workflow\n" +
        "* Multiple report formats for different use cases\n" +
        "* Enhanced progress reporting and hanging prevention\n\n" +
        "HOW TO USE:\n" +
        "1. Open an InDesign document\n" +
        "2. Save the document (required for analysis)\n" +
        "3. Run this script from ESTK or InDesign Scripts panel\n" +
        "4. Choose 'Quick Compare' for baseline creation and change tracking\n" +
        "5. Choose 'Analyze Document Only' for comprehensive analysis without comparison\n\n" +
        "FIRST TIME USE:\n" +
        "* Creates a baseline snapshot of your document\n" +
        "* Captures text content, styles, images, links, and structure\n" +
        "* Make changes to your document\n" +
        "* Run Quick Compare again to see detailed differences\n\n" +
        "REPORTS GENERATED:\n" +
        "* *_baseline.json - Initial document snapshot\n" +
        "* *_current.json - Current document state\n" +
        "* *_comparison.json - Complete technical comparison data\n" +
        "* *_summary.txt - Human-readable changes summary\n" +
        "* *_text_analysis.txt - Detailed text content changes\n" +
        "* *_technical.txt - Technical analysis and statistics\n" +
        "* *_access_guide.txt - Safe object model access patterns\n\n" +
        "ESTK DEVELOPMENT FEATURES:\n" +
        "* Comprehensive $.writeln() debugging output\n" +
        "* Error categorization and troubleshooting guidance\n" +
        "* Alternative property access method discovery\n" +
        "* Performance monitoring and memory management\n" +
        "* Timeout protection for complex operations\n" +
        "* Document validation and capability detection\n\n" +
        "ENHANCED FEATURES (v2.1-ESTK):\n" +
        "* Document state validation prevents hanging\n" +
        "* Enhanced progress reporting with detailed feedback\n" +
        "* Graceful degradation for problematic documents\n" +
        "* Collection-level progress tracking\n" +
        "* Comprehensive error recovery and retry logic\n\n" +
        "TROUBLESHOOTING:\n" +
        "* Document must be saved before analysis\n" +
        "* Check ESTK console for detailed debugging output\n" +
        "* Use baseline reset if comparison issues occur\n" +
        "* All error logs are captured in analysis results\n" +
        "* Property access failures include alternative methods\n" +
        "* Document validation detects compatibility issues\n\n" +
        "BEST PRACTICES:\n" +
        "* Test with simple documents first\n" +
        "* Use ESTK for development and debugging\n" +
        "* Review access guide for safe property patterns\n" +
        "* Monitor console output for API issues\n" +
        "* Keep baseline reports for version tracking\n" +
        "* Check validation results for problematic documents\n\n" +
        "VERSION: 2.1-ESTK - Comprehensive Change Detection with Enhanced Validation",
        {multiline: true, readonly: true});
    helpText.alignment = "fill";
    
    var buttonGroup = helpGroup.add("group");
    buttonGroup.alignment = "center";
    
    var okButton = buttonGroup.add("button", undefined, "OK");
    okButton.onClick = function() {
        helpDialog.close();
    };
    
    enhancedStatusLog("UI", "Help dialog ready", 1, 1, "Documentation displayed");
    helpDialog.show();
}

// Main menu dialog with enhanced status information and mode selection
function showMainMenu() {
    enhancedStatusLog("UI", "Displaying main menu", 0, 1, "Opening enhanced main menu");
    
    var menuDialog = new Window("dialog", "Enhanced InDesign Inspector v2.1-ESTK");
    menuDialog.preferredSize.width = 600;
    menuDialog.preferredSize.height = 550;
    
    var mainGroup = menuDialog.add("group");
    mainGroup.orientation = "column";
    mainGroup.alignment = "fill";
    
    // Title panel with enhanced information
    var titlePanel = mainGroup.add("panel", undefined, "Comprehensive Document Analysis Suite");
    titlePanel.alignment = "fill";
    
    var titleText = titlePanel.add("statictext", undefined, 
        "ESTK-optimized InDesign document analysis with:\n" +
        "* Progressive analysis modes (Minimal → Comprehensive)\n" +
        "* Document validation and compatibility detection\n" +
        "* Emergency bailouts prevent hanging\n" +
        "* Enhanced progress reporting with detailed feedback\n" +
        "* Safe API access with multiple fallback methods\n" +
        "* ESTK debugging with detailed console output\n" +
        "* Baseline creation and comparison workflow\n" +
        "* Multiple report formats for different needs",
        {multiline: true});
    titleText.alignment = "fill";
    
    // Analysis Mode Selection Panel
    var modePanel = mainGroup.add("panel", undefined, "Analysis Mode Selection");
    modePanel.alignment = "fill";
    
    var modeGroup = modePanel.add("group");
    modeGroup.orientation = "column";
    modeGroup.alignment = "fill";
    
    var modeRadios = {
        minimal: modeGroup.add("radiobutton", undefined, "MINIMAL - Property dump only (safest, 1s timeout)"),
        basic: modeGroup.add("radiobutton", undefined, "BASIC - Document info + counts (safe, 3s timeout)"),
        standard: modeGroup.add("radiobutton", undefined, "STANDARD - Basic + text content (balanced, 8s timeout)"),
        comprehensive: modeGroup.add("radiobutton", undefined, "COMPREHENSIVE - Full analysis (complete, 15s timeout)")
    };
    
    // Set default mode based on current setting
    var currentMode = getCurrentAnalysisMode();
    if (currentMode === ANALYSIS_MODES.MINIMAL) {
        modeRadios.minimal.value = true;
    } else if (currentMode === ANALYSIS_MODES.STANDARD) {
        modeRadios.standard.value = true;
    } else if (currentMode === ANALYSIS_MODES.COMPREHENSIVE) {
        modeRadios.comprehensive.value = true;
    } else {
        modeRadios.basic.value = true; // Default to basic
    }
    
    var modeDescText = modeGroup.add("statictext", undefined, getModeDescription(currentMode), {multiline: true});
    modeDescText.alignment = "fill";
    
    // Update description when mode changes
    function updateModeDescription() {
        var selectedMode = ANALYSIS_MODES.BASIC;
        if (modeRadios.minimal.value) selectedMode = ANALYSIS_MODES.MINIMAL;
        else if (modeRadios.standard.value) selectedMode = ANALYSIS_MODES.STANDARD;
        else if (modeRadios.comprehensive.value) selectedMode = ANALYSIS_MODES.COMPREHENSIVE;
        
        modeDescText.text = getModeDescription(selectedMode);
        setAnalysisMode(selectedMode);
    }
    
    modeRadios.minimal.onClick = updateModeDescription;
    modeRadios.basic.onClick = updateModeDescription;
    modeRadios.standard.onClick = updateModeDescription;
    modeRadios.comprehensive.onClick = updateModeDescription;
    
    // Action buttons
    var actionsPanel = mainGroup.add("panel", undefined, "Actions");
    actionsPanel.alignment = "fill";
    
    var quickCompareBtn = actionsPanel.add("button", undefined, "Quick Compare (Recommended)");
    quickCompareBtn.preferredSize.height = 40;
    quickCompareBtn.alignment = "fill";
    
    var analyzeOnlyBtn = actionsPanel.add("button", undefined, "Analyze Document Only");
    analyzeOnlyBtn.alignment = "fill";
    
    var resetBtn = actionsPanel.add("button", undefined, "Reset Baseline");
    resetBtn.alignment = "fill";
    
    var helpBtn = actionsPanel.add("button", undefined, "Help & Documentation");
    helpBtn.alignment = "fill";
    
    // Status panel with current document information
    var statusPanel = mainGroup.add("panel", undefined, "Current Status");
    statusPanel.alignment = "fill";
    
    var statusText = statusPanel.add("statictext", undefined, getEnhancedStatusText(), {multiline: true});
    statusText.alignment = "fill";
    
    // Bottom buttons
    var buttonGroup = mainGroup.add("group");
    buttonGroup.alignment = "center";
    
    var cancelBtn = buttonGroup.add("button", undefined, "Cancel");
    
    // Event handlers
    quickCompareBtn.onClick = function() {
        menuDialog.close();
        quickCompare();
    };
    
    analyzeOnlyBtn.onClick = function() {
        menuDialog.close();
        analyzeDocument();
    };
    
    resetBtn.onClick = function() {
        menuDialog.close();
        resetBaseline();
    };
    
    helpBtn.onClick = function() {
        showHelpDialog();
    };
    
    cancelBtn.onClick = function() {
        menuDialog.close();
    };
    
    enhancedStatusLog("UI", "Main menu ready", 1, 1, "User interface displayed");
    menuDialog.show();
}

// Get enhanced current status text with detailed information - FULLY FIXED
function getEnhancedStatusText() {
    var status = "Enhanced InDesign Document Inspector v2.1-ESTK\n";
    status += "Comprehensive change detection with ESTK optimization\n\n";
    
    // Check document status
    if (!app.documents.length) {
        status += "STATUS: No document open\n";
        status += "Please open a document for analysis\n";
        status += "\nREQUIREMENTS:\n";
        status += "* Document must be open in InDesign\n";
        status += "* Document must be saved before analysis\n";
        status += "* Write permissions required in document folder\n";
        status += "* Enhanced validation detects compatibility issues\n";
    } else {
        var doc = app.activeDocument;
        var docName = safeGetProperty(doc, 'name', 'Unknown');
        var docSaved = safeGetProperty(doc, 'saved', false);
        var docPath = safeGetProperty(doc, 'filePath');
        
        status += "DOCUMENT: " + docName + "\n";
        
        if (!docSaved || !docPath) {
            status += "STATUS: Document not saved\n";
            status += "Please save before analysis\n";
        } else {
            status += "STATUS: Document saved and ready\n";
            status += "LOCATION: " + docPath + "\n";
            
            // Check for existing baseline
            var baselineDocName = docName.replace(/\.[^\.]+$/, "");
            if (docPath) {
                var baselineFile = File(docPath + "/" + baselineDocName + "_baseline.json");
                
                if (baselineFile.exists) {
                    status += "BASELINE: Exists - ready for comparison\n";
                    try {
                        var baselineDate = new Date(baselineFile.modified);
                        status += "BASELINE DATE: " + baselineDate.toLocaleString() + "\n";
                    } catch (exc) {
                        status += "BASELINE DATE: Unknown\n";
                    }
                } else {
                    status += "BASELINE: None - will create on first run\n";
                }
            }
            
            // Document statistics using safe methods - ALL FIXED
            status += "\nDOCUMENT INFO:\n";
            status += "Pages: " + safeGetLength(safeGetProperty(doc, 'pages')) + "\n";
            status += "Text Frames: " + safeGetLength(safeGetProperty(doc, 'textFrames')) + "\n";
            status += "Images: " + safeGetLength(safeGetProperty(doc, 'images')) + "\n";
            status += "Links: " + safeGetLength(safeGetProperty(doc, 'links')) + "\n";
            
            // Enhanced validation status
            status += "\nENHANCED FEATURES:\n";
            status += "Document validation: Enabled\n";
            status += "Progress reporting: Enhanced\n";
            status += "Hanging prevention: Active\n";
        }
    }
    
    status += "\nSYSTEM STATUS:\n";
    status += "ESTK debugging: " + (ANALYSIS_CONFIG.enableESTKDebugging ? "Enabled" : "Disabled") + "\n";
    status += "Memory management: Active cleanup enabled\n";
    status += "Error handling: Comprehensive with retry logic\n";
    status += "Timeout protection: " + (ANALYSIS_CONFIG.timeoutThreshold / 1000) + "s limits\n";
    status += "Collection sampling: " + ANALYSIS_CONFIG.maxCollectionSample + " items max\n";
    
    return status;
}

// ============================================================================
// MAIN SCRIPT ENTRY POINT
// ============================================================================

// Script entry point with enhanced error handling and ESTK optimization
try {
    // Initialize ESTK debugging
    $.writeln(repeatString("=", 60));
    $.writeln("Enhanced InDesign Document Inspector v2.1-ESTK");
    $.writeln("Loading comprehensive document analysis suite...");
    $.writeln("ESTK Debugging: ENABLED");
    $.writeln("Enhanced Features: Document Validation, Progress Reporting, Hanging Prevention");
    $.writeln(repeatString("=", 60));
    
    enhancedStatusLog("INIT", "System initialization", 0, 5, "Loading enhanced analysis engine");
    
    // Verify core functions are available
    var coreTests = [
        {name: "validateDocumentState", func: validateDocumentState},
        {name: "createValidatedDocumentReport", func: createValidatedDocumentReport},
        {name: "enhancedSafeIterateCollection", func: enhancedSafeIterateCollection},
        {name: "enhancedStatusLog", func: enhancedStatusLog},
        {name: "safeGetProperty", func: safeGetProperty}
    ];
    
    enhancedStatusLog("INIT", "Verifying core functions", 1, 5, "Testing enhanced function availability");
    
    for (var i = 0; i < coreTests.length; i++) {
        var test = coreTests[i];
        if (typeof test.func !== 'function') {
            throw new Error("Core function missing: " + test.name);
        }
    }
    
    enhancedStatusLog("INIT", "Core functions verified", 2, 5, "All enhanced functions available");
    
    // Test document validation if document is open
    if (app.documents.length > 0) {
        enhancedStatusLog("INIT", "Testing document validation", 3, 5, "Checking current document compatibility");
        
        try {
            var testValidation = validateDocumentState(app.activeDocument);
            if (testValidation.isValid) {
                enhancedStatusLog("INIT", "Document validation passed", 4, 5, "Current document is compatible");
            } else {
                enhancedStatusLog("INIT", "Document validation issues detected", 4, 5, "Some features may be limited");
            }
        } catch (validationError) {
            enhancedStatusLog("INIT", "Document validation test failed", 4, 5, "Will use basic compatibility mode");
        }
    } else {
        enhancedStatusLog("INIT", "No document open", 3, 5, "Ready for document analysis when opened");
    }
    
    enhancedStatusLog("INIT", "Initialization completed", 5, 5, "Enhanced inspector ready for use");
    
    // Show startup completion message
    alert("Enhanced InDesign Document Inspector v2.1-ESTK loaded successfully!\n\n" +
          "COMPREHENSIVE FEATURES:\n" +
          "* Robust text content capture and analysis\n" +
          "* Safe property access with multiple fallback methods\n" +
          "* Enhanced error handling and recovery\n" +
          "* ESTK debugging with detailed console output\n" +
          "* Baseline creation and comparison workflow\n" +
          "* Multiple report formats for different use cases\n\n" +
          "ENHANCED FEATURES (NEW):\n" +
          "* Document state validation prevents hanging\n" +
          "* Enhanced progress reporting with detailed feedback\n" +
          "* Graceful degradation for problematic documents\n" +
          "* Collection-level progress tracking\n" +
          "* Comprehensive timeout protection\n\n" +
          "ESTK OPTIMIZATIONS:\n" +
          "* Comprehensive $.writeln() debugging output\n" +
          "* Memory management and cleanup\n" +
          "* Timeout protection for complex operations\n" +
          "* Alternative property access method discovery\n" +
          "* Real-time progress reporting prevents hanging\n\n" +
          "Ready for comprehensive InDesign document analysis!\n\n" +
          "Check the ESTK console for detailed progress information.");
    
    // Log successful initialization
    debugLog("Enhanced InDesign Inspector v2.1-ESTK initialized successfully", "INIT");
    debugLog("All chunks loaded and ready for operation", "INIT");
    debugLog("ESTK debugging enabled - check console for detailed output", "INIT");
    debugLog("Enhanced features: Document validation, progress reporting, hanging prevention", "INIT");
    
    // Show main menu
    showMainMenu();
    
} catch (exc) {
    // Enhanced error handling for startup
    var errorMsg = "Enhanced InDesign Inspector v2.1-ESTK\n\n" +
                   "Initialization Error: " + exc.message + "\n\n" +
                   "This comprehensive script contains all functionality\n" +
                   "optimized for ESTK development and debugging.\n\n" +
                   "Check the ESTK console for detailed error information.";
    
    alert(errorMsg);
    
    // Log error to ESTK console
    $.writeln(repeatString("=", 25) + " INITIALIZATION ERROR " + repeatString("=", 25));
    $.writeln("Error: " + exc.message);
    if (exc.line) $.writeln("Line: " + exc.line);
    if (exc.stack) $.writeln("Stack: " + exc.stack);
    $.writeln("Enhanced Features Status: Some features may not be available");
    $.writeln("Fallback: Basic functionality should still work");
    $.writeln(repeatString("=", 72));
    
    // Try to show a basic menu as fallback
    try {
        var fallbackDialog = new Window("dialog", "InDesign Inspector - Basic Mode");
        fallbackDialog.preferredSize.width = 400;
        fallbackDialog.preferredSize.height = 200;
        
        var fallbackGroup = fallbackDialog.add("group");
        fallbackGroup.orientation = "column";
        fallbackGroup.alignment = "fill";
        
        var fallbackText = fallbackGroup.add("statictext", undefined, 
            "Enhanced features failed to initialize.\n\n" +
            "Error: " + exc.message + "\n\n" +
            "Basic analysis may still be available.\nCheck ESTK console for details.",
            {multiline: true});
        fallbackText.alignment = "fill";
        
        var fallbackButtonGroup = fallbackGroup.add("group");
        fallbackButtonGroup.alignment = "center";
        
        var fallbackOkBtn = fallbackButtonGroup.add("button", undefined, "OK");
        fallbackOkBtn.onClick = function() {
            fallbackDialog.close();
        };
        
        fallbackDialog.show();
    } catch (fallbackError) {
        $.writeln("Fallback dialog also failed: " + fallbackError.message);
    }
}