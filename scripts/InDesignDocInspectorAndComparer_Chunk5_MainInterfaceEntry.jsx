// ============================================================================
// CHUNK 5: MAIN INTERFACE & ENTRY POINT - ESTK OPTIMIZED
// ============================================================================

// Show enhanced comparison dialog with comprehensive features
function showEnhancedComparisonDialog(differences) {
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
    if (safeGetProperty(differences.changes, 'textContent') || safeGetProperty(differences.changes, 'textFrames')) {
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
            if (UTILITY_STATE.currentDocument && safeGetProperty(UTILITY_STATE.currentDocument, 'filePath')) {
                var folder = Folder(safeGetProperty(UTILITY_STATE.currentDocument, 'filePath'));
                folder.execute();
            }
        } catch (e) {
            alert("Could not open folder: " + e.message);
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
    
    dialog.show();
}

// Export all reports to a selected folder
function exportAllReportsToFolder(differences) {
    var folder = Folder.selectDialog("Select folder to save comprehensive report suite:");
    if (!folder) return;
    
    var timestamp = new Date().getTime();
    var docName = UTILITY_STATE.currentDocument ? 
                  safeGetProperty(UTILITY_STATE.currentDocument, 'name', 'document').replace(/\.[^\.]+$/, "") : 
                  "document_" + timestamp;
    
    try {
        debugLog("Exporting all reports to: " + folder.fsName, "EXPORT");
        
        // Create all reports
        var reports = {
            comparison: differences,
            summary: createEnhancedHumanReadableSummary(differences),
            textAnalysis: createDetailedTextAnalysisSummary(differences),
            technical: createTechnicalSummary(differences),
            accessGuide: createAccessPathGuide(differences)
        };
        
        // Save all files with enhanced error handling
        var savedFiles = [];
        
        // JSON file
        var jsonFile = File(folder.fsName + "/" + docName + "_comprehensive_analysis_" + timestamp + ".json");
        try {
            jsonFile.open("w");
            jsonFile.write(JSON.stringify(reports.comparison, null, 2));
            jsonFile.close();
            savedFiles.push(jsonFile.name);
        } catch (e) {
            alert("Failed to save JSON report: " + e.message);
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
            try {
                var file = File(folder.fsName + "/" + report.file);
                file.open("w");
                file.write(report.content);
                file.close();
                savedFiles.push(file.name);
            } catch (e) {
                alert("Failed to save " + report.file + ": " + e.message);
                return;
            }
        }
        
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
              
    } catch (e) {
        alert("Export failed: " + e.message);
        debugLog("Export failed: " + e.message, "ERROR");
    }
}

// Enhanced main analysis function
function analyzeDocument() {
    if (!app.documents.length) {
        alert("Please open a document first.");
        return null;
    }
    
    var doc = app.activeDocument;
    var startTime = new Date().getTime();
    
    try {
        debugLog("Starting standalone document analysis", "ANALYZE");
        
        // Check if document is saved - FIXED: Use safe property access
        if (!safeGetProperty(doc, 'saved', false)) {
            var shouldSave = confirm("Document must be saved before analysis. Save now?");
            if (shouldSave) {
                var saveFile = File.saveDialog("Save document", "*.indd");
                if (saveFile) {
                    doc.save(saveFile);
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
        
        var report = createDocumentReport(doc);
        
        if (!report) {
            alert("Failed to create document report.");
            return null;
        }
        
        // Save comprehensive report - FIXED: Use safe property access
        var docName = safeGetProperty(doc, 'name', 'document').replace(/\.[^\.]+$/, "");
        var docPath = safeGetProperty(doc, 'filePath');
        var reportFile = File(docPath + "/" + docName + "_analysis.json");
        
        if (saveReportSafely(reportFile, report, "analysis")) {
            var duration = (new Date().getTime() - startTime) / 1000;
            
            var summary = "Analysis complete! (" + duration + "s)\n\n";
            summary += "ANALYSIS RESULTS:\n";
            summary += "Text items processed: " + (safeGetProperty(report.discoveryStats, 'textItemsProcessed', 0)) + "\n";
            summary += "Collections analyzed: " + (safeGetProperty(report.discoveryStats, 'collectionsAnalyzed', 0)) + "\n";
            summary += "Errors handled: " + (safeGetProperty(report.discoveryStats, 'errorsEncountered', 0)) + "\n";
            summary += "Processing time: " + safeGetProperty(report, 'processingTime', 0) + "ms\n\n";
            summary += "Report saved as: " + reportFile.name + "\n\n";
            summary += "Use Quick Compare to track changes over time!";
            
            alert(summary);
            debugLog("Standalone analysis completed successfully", "ANALYZE");
        }
        
        return report;
        
    } catch (error) {
        var errorMsg = "Analysis failed: " + error.message;
        if (error.line) errorMsg += "\nLine: " + error.line;
        
        alert(errorMsg);
        debugLog("Analysis failed: " + error.message, "ERROR");
        return null;
    }
}

// Reset baseline functionality with enhanced validation
function resetBaseline() {
    if (!app.documents.length) {
        alert("Please open a document first.");
        return;
    }
    
    var doc = app.activeDocument;
    // FIXED: Use safe property access
    var docName = safeGetProperty(doc, 'name', 'document').replace(/\.[^\.]+$/, "");
    var docPath = safeGetProperty(doc, 'filePath');
    
    if (!safeGetProperty(doc, 'saved', false) || !docPath) {
        alert("Document must be saved before creating baseline.");
        return;
    }
    
    debugLog("Resetting baseline for document: " + docName, "BASELINE");
    
    try {
        var baselineFile = File(docPath + "/" + docName + "_baseline.json");
        var backupFile = File(docPath + "/" + docName + "_baseline_backup.json");
        
        // Create backup if baseline exists
        if (baselineFile.exists) {
            try {
                baselineFile.copy(backupFile);
                debugLog("Baseline backup created: " + backupFile.name, "BASELINE");
            } catch (e) {
                debugLog("Backup creation failed: " + e.message, "WARN");
            }
        }
        
        // Create new baseline
        var success = showProgressDialog("Creating new baseline...", function() {
            var report = createDocumentReport(doc);
            if (report && validateAnalysisReport(report)) {
                return saveReportSafely(baselineFile, report, "baseline");
            }
            return false;
        });
        
        if (success) {
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
        }
        
    } catch (e) {
        alert("Baseline reset failed: " + e.message);
        debugLog("Baseline reset failed: " + e.message, "ERROR");
    }
}

// Show help dialog with comprehensive information
function showHelpDialog() {
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
        "* Comprehensive document property analysis\n" +
        "* Robust text content capture and change detection\n" +
        "* Safe object model access with multiple fallback methods\n" +
        "* Enhanced error handling and recovery\n" +
        "* ESTK debugging with detailed console output\n" +
        "* Baseline creation and comparison workflow\n" +
        "* Multiple report formats for different use cases\n\n" +
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
        "* Timeout protection for complex operations\n\n" +
        "TROUBLESHOOTING:\n" +
        "* Document must be saved before analysis\n" +
        "* Check ESTK console for detailed debugging output\n" +
        "* Use baseline reset if comparison issues occur\n" +
        "* All error logs are captured in analysis results\n" +
        "* Property access failures include alternative methods\n\n" +
        "BEST PRACTICES:\n" +
        "* Test with simple documents first\n" +
        "* Use ESTK for development and debugging\n" +
        "* Review access guide for safe property patterns\n" +
        "* Monitor console output for API issues\n" +
        "* Keep baseline reports for version tracking\n\n" +
        "VERSION: 2.1-ESTK - Comprehensive Change Detection with ESTK Optimization",
        {multiline: true, readonly: true});
    helpText.alignment = "fill";
    
    var buttonGroup = helpGroup.add("group");
    buttonGroup.alignment = "center";
    
    var okButton = buttonGroup.add("button", undefined, "OK");
    okButton.onClick = function() {
        helpDialog.close();
    };
    
    helpDialog.show();
}

// Main menu dialog with enhanced status information
function showMainMenu() {
    var menuDialog = new Window("dialog", "Enhanced InDesign Inspector v2.1-ESTK");
    menuDialog.preferredSize.width = 550;
    menuDialog.preferredSize.height = 450;
    
    var mainGroup = menuDialog.add("group");
    mainGroup.orientation = "column";
    mainGroup.alignment = "fill";
    
    // Title panel with enhanced information
    var titlePanel = mainGroup.add("panel", undefined, "Comprehensive Document Analysis Suite");
    titlePanel.alignment = "fill";
    
    var titleText = titlePanel.add("statictext", undefined, 
        "ESTK-optimized InDesign document analysis with:\n" +
        "* Comprehensive text content capture (" + ANALYSIS_CONFIG.maxTextPreviewLength + "-char previews)\n" +
        "* Robust property change detection\n" +
        "* Safe API access with multiple fallback methods\n" +
        "* Enhanced error handling and recovery\n" +
        "* ESTK debugging with detailed console output\n" +
        "* Baseline creation and comparison workflow\n" +
        "* Multiple report formats for different needs",
        {multiline: true});
    titleText.alignment = "fill";
    
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
    
    menuDialog.show();
}

// Get enhanced current status text with detailed information - FIXED
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
    } else {
        var doc = app.activeDocument;
        status += "DOCUMENT: " + safeGetProperty(doc, 'name', 'Unknown') + "\n";
        
        if (!safeGetProperty(doc, 'saved', false) || !safeGetProperty(doc, 'filePath')) {
            status += "STATUS: Document not saved\n";
            status += "Please save before analysis\n";
        } else {
            status += "STATUS: Document saved and ready\n";
            status += "LOCATION: " + safeGetProperty(doc, 'filePath', 'Unknown') + "\n";
            
            // Check for existing baseline
            var docName = safeGetProperty(doc, 'name', 'document').replace(/\.[^\.]+$/, "");
            var docPath = safeGetProperty(doc, 'filePath');
            if (docPath) {
                var baselineFile = File(docPath + "/" + docName + "_baseline.json");
                
                if (baselineFile.exists) {
                    status += "BASELINE: Exists - ready for comparison\n";
                    try {
                        var baselineDate = new Date(baselineFile.modified);
                        status += "BASELINE DATE: " + baselineDate.toLocaleString() + "\n";
                    } catch (e) {
                        status += "BASELINE DATE: Unknown\n";
                    }
                } else {
                    status += "BASELINE: None - will create on first run\n";
                }
            }
            
            // Document statistics using safe methods
            status += "\nDOCUMENT INFO:\n";
            status += "Pages: " + safeGetLength(safeGetProperty(doc, 'pages')) + "\n";
            status += "Text Frames: " + safeGetLength(safeGetProperty(doc, 'textFrames')) + "\n";
            status += "Images: " + safeGetLength(safeGetProperty(doc, 'images')) + "\n";
            status += "Links: " + safeGetLength(safeGetProperty(doc, 'links')) + "\n";
        }
    }
    
    status += "\nESTK DEBUGGING: Enabled (check console output)\n";
    status += "MEMORY MANAGEMENT: Active cleanup enabled\n";
    status += "ERROR HANDLING: Comprehensive with retry logic\n";
    
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
    $.writeln(repeatString("=", 60));
    
    // Show startup completion message
    alert("Enhanced InDesign Document Inspector v2.1-ESTK loaded successfully!\n\n" +
          "COMPREHENSIVE FEATURES:\n" +
          "* Robust text content capture and analysis\n" +
          "* Safe property access with multiple fallback methods\n" +
          "* Enhanced error handling and recovery\n" +
          "* ESTK debugging with detailed console output\n" +
          "* Baseline creation and comparison workflow\n" +
          "* Multiple report formats for different use cases\n\n" +
          "ESTK OPTIMIZATIONS:\n" +
          "* Comprehensive $.writeln() debugging output\n" +
          "* Memory management and cleanup\n" +
          "* Timeout protection for complex operations\n" +
          "* Alternative property access method discovery\n\n" +
          "Ready for comprehensive InDesign document analysis!\n\n" +
          "Check the ESTK console for detailed progress information.");
    
    // Log successful initialization
    debugLog("Enhanced InDesign Inspector v2.1-ESTK initialized successfully", "INIT");
    debugLog("All chunks loaded and ready for operation", "INIT");
    debugLog("ESTK debugging enabled - check console for detailed output", "INIT");
    
    // Show main menu
    showMainMenu();
    
} catch (error) {
    // Enhanced error handling for startup
    var errorMsg = "Enhanced InDesign Inspector v2.1-ESTK\n\n" +
                   "Initialization Error: " + error.message + "\n\n" +
                   "This comprehensive script contains all functionality\n" +
                   "optimized for ESTK development and debugging.\n\n" +
                   "Check the ESTK console for detailed error information.";
    
    alert(errorMsg);
    
    // Log error to ESTK console
    $.writeln(repeatString("=", 25) + " INITIALIZATION ERROR " + repeatString("=", 25));
    $.writeln("Error: " + error.message);
    if (error.line) $.writeln("Line: " + error.line);
    if (error.stack) $.writeln("Stack: " + error.stack);
    $.writeln(repeatString("=", 72));
}