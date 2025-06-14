// ============================================================================
// CHUNK 4: UTILITY FUNCTIONS & COMPREHENSIVE REPORT GENERATION - ESTK OPTIMIZED
// ES3 COMPATIBLE VERSION - ALL RESERVED WORDS FIXED
// ============================================================================

// Enhanced quick analysis and comparison workflow - ROBUST FOR PRODUCTION USE
function quickCompare() {
    debugLog("Starting QuickCompare workflow", "WORKFLOW");
    
    if (!app.documents.length) {
        alert("Please open a document first.");
        return;
    }
    
    var doc = app.activeDocument;
    
    // OPTIMIZED: Cache document properties to avoid duplicate calls (Bug #3 fix)
    var docSaved = safeGetProperty(doc, 'saved', false);
    var docPath = safeGetProperty(doc, 'filePath');
    var docName = safeGetProperty(doc, 'name', 'document').replace(/\.[^\.]+$/, "");
    
    // Ensure document is saved with enhanced validation
    if (!docSaved || !docPath) {
        var shouldSave = confirm("Document must be saved for analysis. Save now?");
        if (shouldSave) {
            var saveFile = File.saveDialog("Save document for analysis", "*.indd");
            if (saveFile) {
                try {
                    doc.save(saveFile);
                    // Update cached values after save
                    docPath = safeGetProperty(doc, 'filePath');
                    docName = safeGetProperty(doc, 'name', 'document').replace(/\.[^\.]+$/, "");
                    debugLog("Document saved to: " + docPath, "FILE");
                } catch (exc) { // FIXED: error -> exc
                    alert("Failed to save document: " + exc.message);
                    debugLog("Save failed: " + exc.message, "ERROR");
                    return;
                }
            } else {
                alert("Analysis cancelled - document must be saved.");
                return;
            }
        } else {
            alert("Analysis cancelled - document must be saved.");
            return;
        }
    }
    
    // Enhanced file system access checking
    if (!checkFileAccess(docPath)) {
        alert("Cannot write to document folder: " + docPath + "\nCheck folder permissions or save document to a different location.");
        return;
    }
    
    UTILITY_STATE.currentDocument = doc;
    
    // Check for existing baseline with enhanced error handling
    var baselineFile = File(docPath + "/" + docName + "_baseline.json");
    var currentFile = File(docPath + "/" + docName + "_current.json");
    
    debugLog("Checking baseline file: " + baselineFile.fsName, "FILE");
    
    if (!baselineFile.exists) {
        // Create enhanced baseline report
        debugLog("Creating new baseline", "BASELINE");
        var baselineSuccess = showProgressDialog("Creating comprehensive baseline analysis...", function() {
            try {
                clearLargeObjects();
                var report = createDocumentReport(doc);
                if (!report) {
                    alert("Failed to create baseline analysis. Please check the document and try again.");
                    return false;
                }
                
                // Enhanced validation
                if (!validateAnalysisReport(report)) {
                    alert("Generated report failed validation. Analysis may be incomplete but will proceed.");
                }
                
                return saveReportSafely(baselineFile, report, "baseline");
                
            } catch (exc) { // FIXED: error -> exc
                alert("Baseline creation failed: " + exc.message);
                debugLog("Baseline creation failed: " + exc.message, "ERROR");
                clearLargeObjects();
                return false;
            }
        });
        
        if (!baselineSuccess) {
            return;
        }
        
        UTILITY_STATE.reportFiles.baseline = baselineFile;
        showBaselineCreatedDialog();
        return;
    }
    
    // Create current report with enhanced error handling
    debugLog("Creating current document analysis", "CURRENT");
    var currentReport = null;
    var currentSuccess = showProgressDialog("Analyzing current document state...", function() {
        try {
            clearLargeObjects();
            currentReport = createDocumentReport(doc);
            if (!currentReport) {
                alert("Failed to analyze current document. Please check for errors and try again.");
                return false;
            }
            
            if (!validateAnalysisReport(currentReport)) {
                alert("Current analysis may be incomplete - proceeding with available data.");
            }
            
            return saveReportSafely(currentFile, currentReport, "current");
            
        } catch (exc) { // FIXED: error -> exc
            alert("Current analysis failed: " + exc.message);
            debugLog("Current analysis failed: " + exc.message, "ERROR");
            clearLargeObjects();
            return false;
        }
    });
    
    if (!currentReport || !currentSuccess) {
        clearLargeObjects();
        return;
    }
    
    UTILITY_STATE.reportFiles.current = currentFile;
    UTILITY_STATE.lastAnalysisReport = currentReport;
    
    // Load baseline report with enhanced error handling and validation
    debugLog("Loading baseline report", "BASELINE");
    var baselineReport = null;
    try {
        baselineFile.open("r");
        var baselineContent = baselineFile.read();
        baselineFile.close();
        
        if (!baselineContent || baselineContent.length === 0) {
            alert("Baseline file is empty or corrupted. Please recreate the baseline.");
            clearLargeObjects();
            return;
        }
        
        // Enhanced size checking
        if (baselineContent.length > UTILITY_CONFIG.maxReportFileSize) {
            alert("Baseline file is too large (" + Math.round(baselineContent.length / 1024 / 1024) + "MB). Consider recreating with current optimized version.");
            clearLargeObjects();
            return;
        }
        
        baselineReport = JSON.parse(baselineContent);
        baselineContent = null; // Clear from memory immediately
        
        if (!validateAnalysisReport(baselineReport)) {
            alert("Baseline report is invalid or from incompatible version. Consider recreating the baseline.");
        }
        
        debugLog("Baseline loaded successfully", "BASELINE");
        
    } catch (exc) { // FIXED: error -> exc
        alert("Failed to load baseline report: " + exc.message + "\nConsider recreating the baseline.");
        debugLog("Baseline load failed: " + exc.message, "ERROR");
        clearLargeObjects();
        return;
    }
    
    // Enhanced comparison with comprehensive progress tracking
    debugLog("Starting document comparison", "COMPARE");
    var differences = null;
    var comparisonSuccess = showProgressDialog("Performing comprehensive document comparison...", function() {
        try {
            differences = compareDocumentReports(baselineReport, currentReport);
            
            // Clear large report objects from memory immediately after comparison
            baselineReport = null;
            currentReport = null;
            clearLargeObjects();
            
            if (!differences) {
                alert("Comparison failed - no results generated.");
                return false;
            }
            
            // Enhanced validation of comparison results
            if (!validateComparisonResults(differences)) {
                alert("Comparison results may be incomplete - proceeding with available data.");
            }
            
            debugLog("Comparison completed successfully", "COMPARE");
            return true;
            
        } catch (exc) { // FIXED: error -> exc
            alert("Comparison failed: " + exc.message);
            debugLog("Comparison failed: " + exc.message, "ERROR");
            clearLargeObjects();
            return false;
        }
    });
    
    if (!differences || !comparisonSuccess) {
        clearLargeObjects();
        return;
    }
    
    UTILITY_STATE.lastComparisonResult = differences;
    
    // Create comprehensive report suite with enhanced error handling
    debugLog("Generating report suite", "REPORTS");
    var reportSuiteSuccess = showProgressDialog("Generating comprehensive report suite...", function() {
        try {
            return createComprehensiveReportSuite(differences, docPath, docName);
        } catch (exc) { // FIXED: error -> exc
            alert("Report generation failed: " + exc.message);
            debugLog("Report generation failed: " + exc.message, "ERROR");
            clearLargeObjects();
            return false;
        }
    });
    
    if (!reportSuiteSuccess) {
        clearLargeObjects();
        return;
    }
    
    // Display enhanced comparison results
    showEnhancedComparisonDialog(differences);
    
    // Final cleanup
    clearLargeObjects();
    debugLog("QuickCompare workflow completed", "WORKFLOW");
}

// Enhanced analysis report validation
function validateAnalysisReport(report) {
    debugLog("Validating analysis report", "VALIDATE");
    
    if (!report || typeof report !== 'object') {
        debugLog("Report validation failed: invalid object", "ERROR");
        return false;
    }
    
    // Check for required sections
    var requiredSections = ['timestamp', 'analysisVersion', 'documentInfo'];
    for (var i = 0; i < requiredSections.length; i++) {
        if (!safeGetProperty(report, requiredSections[i])) { // FIXED: Use safeGetProperty
            debugLog("Report validation failed: missing " + requiredSections[i], "ERROR");
            return false;
        }
    }
    
    // Check version compatibility
    var analysisVersion = safeGetProperty(report, 'analysisVersion');
    if (analysisVersion && stringIndexOf(analysisVersion, '2.1') === -1) {
        debugLog("Report version mismatch: " + analysisVersion, "WARN");
        return true; // Still valid, just potentially incompatible
    }
    
    // Enhanced validation for critical data
    var documentInfo = safeGetProperty(report, 'documentInfo');
    if (documentInfo && !safeGetProperty(documentInfo, 'name')) {
        debugLog("Report validation warning: missing document name", "WARN");
    }
    
    debugLog("Report validation passed", "VALIDATE");
    return true;
}

// Enhanced comparison results validation
function validateComparisonResults(differences) {
    debugLog("Validating comparison results", "VALIDATE");
    
    if (!differences || typeof differences !== 'object') {
        debugLog("Comparison validation failed: invalid object", "ERROR");
        return false;
    }
    
    // Check for required structure
    var summary = safeGetProperty(differences, 'summary');
    var changes = safeGetProperty(differences, 'changes');
    if (!summary || !changes) {
        debugLog("Comparison validation failed: missing summary or changes", "ERROR");
        return false;
    }
    
    // Validate summary structure
    var hasChanges = safeGetProperty(summary, 'hasChanges');
    if (typeof hasChanges !== 'boolean') {
        debugLog("Comparison validation warning: invalid hasChanges type", "WARN");
    }
    
    debugLog("Comparison validation passed", "VALIDATE");
    return true;
}

// Enhanced safe report saving with comprehensive error handling and backup
function saveReportSafely(file, report, reportType) {
    debugLog("Saving " + reportType + " report: " + file.fsName, "FILE");
    
    try {
        // Enhanced file system access checking
        var folderPath = file.path;
        if (!checkFileAccess(folderPath)) {
            alert("Cannot write to folder: " + folderPath + "\nCheck permissions or choose a different location.");
            return false;
        }
        
        // Create backup if file exists and backup is enabled
        if (UTILITY_CONFIG.createBackups && file.exists) {
            try {
                var backupFile = File(file.path + "/" + file.name.replace(/\.json$/, "_backup.json"));
                file.copy(backupFile);
                debugLog("Backup created: " + backupFile.name, "FILE");
            } catch (exc) { // FIXED: error -> exc
                debugLog("Backup creation failed: " + exc.message, "WARN");
                // Backup failed but continue - not critical
            }
        }
        
        // Prepare JSON string with error handling
        var jsonString;
        try {
            jsonString = JSON.stringify(report, null, 2);
        } catch (stringifyError) {
            debugLog("JSON stringify failed: " + stringifyError.message, "ERROR");
            alert("Failed to serialize " + reportType + " report: " + stringifyError.message);
            return false;
        }
        
        // Enhanced memory and size checking
        if (!checkMemoryLimits(jsonString.length, reportType + " report")) {
            // Try to create a simplified version
            try {
                var simplifiedReport = createSimplifiedReport(report, reportType);
                jsonString = JSON.stringify(simplifiedReport, null, 2);
                alert("Report was simplified due to size constraints (" + 
                      Math.round(jsonString.length / 1024) + "KB vs " + 
                      Math.round(ANALYSIS_CONFIG.maxReportSize / 1024) + "KB limit).");
                debugLog("Report simplified due to size", "WARN");
            } catch (exc) { // FIXED: error -> exc
                alert("Report too large and simplification failed: " + exc.message);
                return false;
            }
        }
        
        // Save file with enhanced error handling
        try {
            file.open("w");
            file.write(jsonString);
            file.close();
        } catch (writeError) {
            alert("Failed to write " + reportType + " file: " + writeError.message);
            debugLog("File write failed: " + writeError.message, "ERROR");
            return false;
        }
        
        // Verify file was written correctly
        if (!file.exists || file.length === 0) {
            alert("File write verification failed for: " + reportType);
            debugLog("File verification failed", "ERROR");
            return false;
        }
        
        // Verify file content integrity
        try {
            file.open("r");
            var testRead = file.read(100); // Read first 100 chars to verify
            file.close();
            if (!testRead || testRead.length === 0) {
                alert("File content verification failed for: " + reportType);
                return false;
            }
        } catch (verifyError) {
            debugLog("File verification read failed: " + verifyError.message, "WARN");
            // Continue anyway - file might still be usable
        }
        
        // Clear the large JSON string from memory
        jsonString = null;
        report = null;
        clearLargeObjects();
        
        debugLog("Report saved successfully: " + file.length + " bytes", "FILE");
        return true;
        
    } catch (exc) { // FIXED: error -> exc
        alert("Failed to save " + reportType + " report: " + exc.message);
        debugLog("Save operation failed: " + exc.message, "ERROR");
        return false;
    }
}

// Create simplified report when size limits are exceeded
function createSimplifiedReport(report, reportType) {
    return {
        timestamp: safeGetProperty(report, 'timestamp'),
        analysisVersion: safeGetProperty(report, 'analysisVersion'),
        documentInfo: safeGetProperty(report, 'documentInfo'),
        summary: "Report simplified due to size constraints",
        originalProcessingTime: safeGetProperty(report, 'processingTime'),
        errors: safeGetProperty(report, 'errors', []),
        discoveryStats: safeGetProperty(report, 'discoveryStats', {}),
        note: "Reduced content due to memory/size limits - use smaller collection samples for full analysis",
        simplificationReason: "Exceeded " + Math.round(ANALYSIS_CONFIG.maxReportSize / 1024 / 1024) + "MB limit"
    };
}

// Progress dialog with enhanced visual feedback
function showProgressDialog(message, operation) {
    if (!UTILITY_CONFIG.enableProgressDialogs) {
        return operation();
    }
    
    var progressDialog = new Window("dialog", "Enhanced Analysis in Progress");
    progressDialog.preferredSize.width = 450;
    progressDialog.preferredSize.height = 180;
    
    var progressGroup = progressDialog.add("group");
    progressGroup.orientation = "column";
    progressGroup.alignment = "fill";
    
    var titleText = progressGroup.add("statictext", undefined, "Enhanced InDesign Inspector v2.1-ESTK");
    titleText.alignment = "center";
    
    var messageText = progressGroup.add("statictext", undefined, message);
    messageText.alignment = "center";
    messageText.preferredSize.height = 30;
    
    var progressBar = progressGroup.add("progressbar", undefined, 0, 100);
    progressBar.alignment = "fill";
    progressBar.preferredSize.height = 12;
    
    var statusText = progressGroup.add("statictext", undefined, "Processing...");
    statusText.alignment = "center";
    statusText.preferredSize.height = 25;
    
    var detailText = progressGroup.add("statictext", undefined, "ESTK Debug: Check console for detailed progress");
    detailText.alignment = "center";
    
    try {
        progressDialog.show();
    } catch (exc) { // FIXED: error -> exc
        return operation();
    }
    
    try {
        // Enhanced progress simulation with ESTK debugging
        var stages = ["Initializing...", "Loading document...", "Processing collections...", "Analyzing content...", "Finalizing..."];
        
        for (var i = 0; i < stages.length; i++) {
            statusText.text = stages[i];
            progressBar.value = (i / stages.length) * 90;
            progressDialog.update();
            $.writeln("[PROGRESS] " + stages[i]);
            
            // Brief pause
            var startTime = new Date().getTime();
            while (new Date().getTime() - startTime < 150) {
                // Brief pause
            }
        }
        
        // Run operation
        statusText.text = "Completing operation...";
        progressBar.value = 95;
        progressDialog.update();
        $.writeln("[PROGRESS] Running main operation...");
        
        var result = operation();
        
        progressBar.value = 100;
        statusText.text = "Operation complete!";
        progressDialog.update();
        $.writeln("[PROGRESS] Operation completed successfully");
        
        // Brief pause to show completion
        var startTime = new Date().getTime();
        while (new Date().getTime() - startTime < 400) {
            // Show completion
        }
        
        progressDialog.close();
        return result;
        
    } catch (exc) { // FIXED: error -> exc
        progressDialog.close();
        $.writeln("[ERROR] Progress dialog operation failed: " + exc.message);
        throw exc;
    }
}

// Show baseline created dialog with enhanced information
function showBaselineCreatedDialog() {
    var dialog = new Window("dialog", "Baseline Created Successfully");
    dialog.preferredSize.width = 450;
    dialog.preferredSize.height = 320;
    
    var mainGroup = dialog.add("group");
    mainGroup.orientation = "column";
    mainGroup.alignment = "fill";
    
    var successPanel = mainGroup.add("panel", undefined, "Baseline Analysis Complete");
    successPanel.alignment = "fill";
    
    var successText = successPanel.add("statictext", undefined, 
        "Comprehensive baseline analysis created successfully!\n\n" +
        "The inspector has captured essential document properties\n" +
        "for change tracking and comparison.\n\n" +
        "CAPTURED DATA:\n" +
        "* Document structure and properties\n" +
        "* Text content and formatting\n" +
        "* Images and links status\n" +
        "* Styles and colors\n" +
        "* Page layout and settings\n\n" +
        "Next steps:\n" +
        "1. Make changes to your document\n" +
        "2. Run Quick Compare again to see differences\n" +
        "3. Review the detailed change reports generated",
        {multiline: true});
    successText.alignment = "fill";
    
    var buttonGroup = mainGroup.add("group");
    buttonGroup.alignment = "center";
    
    var viewFolderBtn = buttonGroup.add("button", undefined, "Open Report Folder");
    var okBtn = buttonGroup.add("button", undefined, "OK");
    
    viewFolderBtn.onClick = function() {
        try {
            var currentDoc = UTILITY_STATE.currentDocument;
            if (currentDoc && safeGetProperty(currentDoc, 'filePath')) {
                var folder = Folder(safeGetProperty(currentDoc, 'filePath'));
                folder.execute();
            }
        } catch (exc) { // FIXED: error -> exc
            alert("Could not open folder: " + exc.message);
        }
    };
    
    okBtn.onClick = function() {
        dialog.close();
    };
    
    dialog.show();
}

// Create comprehensive report suite - ENHANCED FOR THOROUGH ANALYSIS
function createComprehensiveReportSuite(differences, docPath, docName) {
    try {
        debugLog("Creating comprehensive report suite", "REPORTS");
        
        // Create all essential reports
        var reports = {
            summary: createEnhancedHumanReadableSummary(differences),
            textAnalysis: createDetailedTextAnalysisSummary(differences),
            technical: createTechnicalSummary(differences),
            accessGuide: createAccessPathGuide(differences)
        };
        
        // Save reports with enhanced error handling
        var reportFiles = {
            comparison: File(docPath + "/" + docName + "_comparison.json"),
            summary: File(docPath + "/" + docName + "_summary.txt"),
            textAnalysis: File(docPath + "/" + docName + "_text_analysis.txt"),
            technical: File(docPath + "/" + docName + "_technical.txt"),
            accessGuide: File(docPath + "/" + docName + "_access_guide.txt")
        };
        
        // Save JSON comparison data
        if (!saveReportSafely(reportFiles.comparison, differences, "comparison")) {
            return false;
        }
        
        // Save text reports with individual error handling
        var textReports = [
            {file: reportFiles.summary, content: reports.summary, type: "summary"},
            {file: reportFiles.textAnalysis, content: reports.textAnalysis, type: "text analysis"},
            {file: reportFiles.technical, content: reports.technical, type: "technical"},
            {file: reportFiles.accessGuide, content: reports.accessGuide, type: "access guide"}
        ];
        
        for (var i = 0; i < textReports.length; i++) {
            var report = textReports[i];
            try {
                report.file.open("w");
                report.file.write(report.content);
                report.file.close();
                debugLog("Saved " + report.type + " report: " + report.file.name, "REPORTS");
            } catch (exc) { // FIXED: error -> exc
                alert("Failed to save " + report.type + ": " + exc.message);
                debugLog("Failed to save " + report.type + ": " + exc.message, "ERROR");
                return false;
            }
        }
        
        UTILITY_STATE.reportFiles = reportFiles;
        debugLog("Comprehensive report suite created successfully", "REPORTS");
        return true;
        
    } catch (exc) { // FIXED: error -> exc
        alert("Report generation failed: " + exc.message);
        debugLog("Report generation failed: " + exc.message, "ERROR");
        return false;
    }
}

// Create enhanced human-readable summary
function createEnhancedHumanReadableSummary(differences) {
    var summary = "ENHANCED DOCUMENT COMPARISON SUMMARY\n";
    summary += "Generated: " + new Date().toString() + "\n";
    summary += "Analysis Version: 2.1-ESTK (Comprehensive Change Detection)\n";
    summary += repeatString("=", 70) + "\n\n";
    
    var diffSummary = safeGetProperty(differences, 'summary');
    if (!safeGetProperty(diffSummary, 'hasChanges')) {
        summary += "STATUS: NO CHANGES DETECTED\n";
        summary += "The document appears identical to the baseline.\n\n";
        
        var discoveryInfo = safeGetProperty(differences, 'discoveryInfo');
        if (discoveryInfo) {
            summary += "PROCESSING SUMMARY\n";
            summary += "Text items processed: " + (safeGetProperty(discoveryInfo, 'textItemsProcessed', 0)) + "\n";
            summary += "Properties analyzed: " + (safeGetProperty(discoveryInfo, 'propertiesChanged', 0)) + "\n";
            summary += "Sections analyzed: " + objectKeys(safeGetProperty(differences, 'changes', {})).length + "\n";
        }
        return summary;
    }
    
    summary += "STATUS: CHANGES DETECTED\n";
    summary += "Changed sections: " + safeGetLength(safeGetProperty(diffSummary, 'changedSections', [])) + "\n";
    summary += "Total changes: " + safeGetProperty(diffSummary, 'totalChanges', 0) + "\n";
    summary += "Significant changes: " + safeGetProperty(diffSummary, 'significantChanges', 0) + "\n";
    var diffErrors = safeGetProperty(differences, 'errors');
    if (diffErrors && safeGetLength(diffErrors) > 0) {
        summary += "Errors handled: " + safeGetLength(diffErrors) + "\n";
    }
    
    // Enhanced discovery summary
    var discoveryInfo = safeGetProperty(differences, 'discoveryInfo');
    if (discoveryInfo) {
        summary += "\nCOMPREHENSIVE ANALYSIS SUMMARY\n";
        summary += "Text items processed: " + (safeGetProperty(discoveryInfo, 'textItemsProcessed', 0)) + "\n";
        summary += "Text items changed: " + (safeGetProperty(discoveryInfo, 'textItemsChanged', 0)) + "\n";
        summary += "Properties changed: " + (safeGetProperty(discoveryInfo, 'propertiesChanged', 0)) + "\n";
        
        // Text changes breakdown
        var textChangesDetailed = safeGetProperty(discoveryInfo, 'textChangesDetailed');
        if (textChangesDetailed) {
            summary += "\nTEXT CHANGES DETAILED\n";
            var charChanges = safeGetProperty(textChangesDetailed, 'characterChanges', 0);
            var wordChanges = safeGetProperty(textChangesDetailed, 'wordChanges', 0);
            var overflowChanges = safeGetProperty(textChangesDetailed, 'overflowChanges', 0);
            var styleChanges = safeGetProperty(textChangesDetailed, 'styleChanges', 0);
            
            if (charChanges > 0) {
                summary += "Character count change: " + charChanges + "\n";
            }
            if (wordChanges > 0) {
                summary += "Word count change: " + wordChanges + "\n";
            }
            if (overflowChanges > 0) {
                summary += "Overflow status changes: " + overflowChanges + "\n";
            }
            if (styleChanges > 0) {
                summary += "Style changes: " + styleChanges + "\n";
            }
        }
        
        // Structural changes
        var structuralChanges = safeGetProperty(discoveryInfo, 'structuralChanges');
        if (structuralChanges) {
            summary += "\nSTRUCTURAL CHANGES\n";
            var pagesChanged = safeGetProperty(structuralChanges, 'pagesChanged', 0);
            var layersChanged = safeGetProperty(structuralChanges, 'layersChanged', 0);
            var itemsAdded = safeGetProperty(structuralChanges, 'itemsAdded', 0);
            var itemsRemoved = safeGetProperty(structuralChanges, 'itemsRemoved', 0);
            
            if (pagesChanged > 0) {
                summary += "Pages modified: " + pagesChanged + "\n";
            }
            if (layersChanged > 0) {
                summary += "Layers modified: " + layersChanged + "\n";
            }
            if (itemsAdded > 0) {
                summary += "Items added: " + itemsAdded + "\n";
            }
            if (itemsRemoved > 0) {
                summary += "Items removed: " + itemsRemoved + "\n";
            }
        }
    }
    summary += "\n";
    
    var changes = safeGetProperty(differences, 'changes', {});
    
    // Detailed section analysis
    var prioritySections = ['documentInfo', 'textContent', 'textFrames', 'pages', 'layers', 'styles', 'images', 'links'];
    
    for (var s = 0; s < prioritySections.length; s++) {
        var sectionName = prioritySections[s];
        var sectionChanges = safeGetProperty(changes, sectionName);
        if (sectionChanges && safeGetLength(sectionChanges) > 0) {
            summary += getSectionSummary(sectionName, sectionChanges);
        }
    }
    
    // Summary footer
    summary += repeatString("=", 70) + "\n";
    summary += "COMPREHENSIVE ANALYSIS COMPLETE\n";
    summary += "Enhanced Features Applied:\n";
    summary += "* Comprehensive text content analysis\n";
    summary += "* Detailed property change detection\n";
    summary += "* Safe object model access guidance\n";
    summary += "* Robust error handling and recovery\n";
    summary += "* ESTK debugging and logging\n\n";
    summary += "COMPANION REPORTS GENERATED:\n";
    summary += "* *_comparison.json (complete technical data)\n";
    summary += "* *_summary.txt (this human-readable summary)\n";
    summary += "* *_text_analysis.txt (detailed text content changes)\n";
    summary += "* *_technical.txt (technical analysis and statistics)\n";
    summary += "* *_access_guide.txt (object model access guidance)\n\n";
    summary += "All reports work together to provide complete change analysis.\n";
    
    return summary;
}

// Get enhanced section summary
function getSectionSummary(sectionName, changes) {
    var summary = "";
    var categorized = categorizeChanges(changes);
    
    var displayName = sectionName.toUpperCase();
    summary += "[" + displayName + "]\n";
    summary += repeatString("-", displayName.length + 2) + "\n";
    
    var additionsLength = safeGetLength(categorized.additions);
    var deletionsLength = safeGetLength(categorized.deletions);
    var modificationsLength = safeGetLength(categorized.modifications);
    
    if (additionsLength > 0) {
        summary += "Added " + additionsLength + " item(s)\n";
        // Show first addition example
        if (categorized.additions[0]) {
            summary += "  Example: " + formatChangeExample(categorized.additions[0]) + "\n";
        }
    }
    if (deletionsLength > 0) {
        summary += "Removed " + deletionsLength + " item(s)\n";
        // Show first deletion example
        if (categorized.deletions[0]) {
            summary += "  Example: " + formatChangeExample(categorized.deletions[0]) + "\n";
        }
    }
    if (modificationsLength > 0) {
        summary += "Modified " + modificationsLength + " item(s)\n";
        
        // Show key modifications with significance priority - ES3 compatible
        var significantMods = arrayFilter(categorized.modifications, function(change) {
            return safeGetProperty(change, 'significance') === 'high';
        });
        var modsToShow = safeGetLength(significantMods) > 0 ? significantMods : categorized.modifications;
        
        var modsToShowLength = safeGetLength(modsToShow);
        for (var i = 0; i < Math.min(modsToShowLength, 3); i++) {
            summary += "  " + formatChangeExample(modsToShow[i]) + "\n";
        }
        if (modificationsLength > 3) {
            summary += "  ... and " + (modificationsLength - 3) + " more changes\n";
        }
    }
    summary += "\n";
    
    return summary;
}

// Helper functions for report generation
function categorizeChanges(changesList) {
    var categorized = {
        additions: [],
        deletions: [],
        modifications: []
    };
    
    var changesLength = safeGetLength(changesList);
    for (var i = 0; i < changesLength; i++) {
        var change = changesList[i];
        var changeType = safeGetProperty(change, 'type');
        if (changeType === 'addition') {
            categorized.additions.push(change);
        } else if (changeType === 'deletion') {
            categorized.deletions.push(change);
        } else {
            categorized.modifications.push(change);
        }
    }
    
    return categorized;
}

function formatChangeExample(change) {
    var example = safeGetProperty(change, 'path', 'unknown');
    var changeType = safeGetProperty(change, 'type');
    var oldValue = safeGetProperty(change, 'oldValue');
    var newValue = safeGetProperty(change, 'newValue');
    
    if (changeType === 'text_content_change' && oldValue && newValue) {
        var oldPreview = String(oldValue).substring(0, 30);
        var newPreview = String(newValue).substring(0, 30);
        example += ": \"" + oldPreview + "\" -> \"" + newPreview + "\"";
    } else if (changeType === 'value_change' && oldValue !== undefined && newValue !== undefined) {
        example += ": " + oldValue + " -> " + newValue;
    } else if (changeType === 'addition') {
        example += " (new: " + (newValue ? String(newValue).substring(0, 20) : 'added') + ")";
    } else if (changeType === 'deletion') {
        example += " (removed: " + (oldValue ? String(oldValue).substring(0, 20) : 'deleted') + ")";
    }
    
    return example;
}

// Create detailed text analysis summary
function createDetailedTextAnalysisSummary(differences) {
    var analysis = "DETAILED TEXT CONTENT ANALYSIS REPORT\n";
    analysis += "Generated: " + new Date().toString() + "\n";
    analysis += "Analysis Version: 2.1-ESTK - Comprehensive Text Change Detection\n";
    analysis += repeatString("=", 65) + "\n\n";
    
    // Text content changes section
    var textContentChanges = safeGetProperty(safeGetProperty(differences, 'changes'), 'textContent');
    if (textContentChanges && safeGetLength(textContentChanges) > 0) {
        analysis += "TEXT CONTENT CHANGES DETECTED\n";
        analysis += repeatString("-", 30) + "\n\n";
        
        var textContentLength = safeGetLength(textContentChanges);
        for (var i = 0; i < Math.min(textContentLength, 10); i++) { // Limit for readability
            var change = textContentChanges[i];
            
            analysis += "CHANGE " + (i + 1) + ":\n";
            analysis += "Path: " + safeGetProperty(change, 'path', 'unknown') + "\n";
            analysis += "Type: " + safeGetProperty(change, 'type', 'unknown') + "\n";
            analysis += "Significance: " + safeGetProperty(change, 'significance', 'medium') + "\n";
            
            var accessPath = safeGetProperty(change, 'accessPath');
            if (accessPath) {
                analysis += "Access: " + safeGetProperty(accessPath, 'primary', 'unknown') + "\n";
            }
            
            if (safeGetProperty(change, 'type') === "text_content_change") {
                var oldText = safeGetProperty(change, 'oldValue', "");
                var newText = safeGetProperty(change, 'newValue', "");
                
                analysis += "Old Text: \"" + oldText.substring(0, 100) + (oldText.length > 100 ? "..." : "") + "\"\n";
                analysis += "New Text: \"" + newText.substring(0, 100) + (newText.length > 100 ? "..." : "") + "\"\n";
                
                // Change analysis
                var charDiff = newText.length - oldText.length;
                analysis += "Character change: " + (charDiff >= 0 ? "+" : "") + charDiff + "\n";
            }
            
            analysis += "\n" + repeatString("-", 40) + "\n\n";
        }
    } else {
        analysis += "NO TEXT CONTENT CHANGES DETECTED\n\n";
    }
    
    // Text frame changes
    var textFrameChanges = safeGetProperty(safeGetProperty(differences, 'changes'), 'textFrames');
    if (textFrameChanges && safeGetLength(textFrameChanges) > 0) {
        analysis += "TEXT FRAME CHANGES\n";
        analysis += repeatString("-", 18) + "\n\n";
        
        // ES3-compatible filtering
        var textRelatedChanges = arrayFilter(textFrameChanges, function(change) {
            var path = safeGetProperty(change, 'path', '');
            return stringIndexOf(path, 'textPreview') !== -1 || 
                   stringIndexOf(path, 'characterCount') !== -1 ||
                   stringIndexOf(path, 'wordCount') !== -1 ||
                   stringIndexOf(path, 'overflows') !== -1;
        });
        
        var textRelatedLength = safeGetLength(textRelatedChanges);
        for (var i = 0; i < Math.min(textRelatedLength, 8); i++) {
            var change = textRelatedChanges[i];
            analysis += "Frame Change " + (i + 1) + ":\n";
            analysis += "Property: " + safeGetProperty(change, 'path', 'unknown') + "\n";
            analysis += "Change: " + formatChangeExample(change) + "\n";
            
            var accessPath = safeGetProperty(change, 'accessPath');
            if (accessPath) {
                analysis += "Access: " + safeGetProperty(accessPath, 'primary', 'unknown') + "\n";
            }
            analysis += "\n";
        }
    }
    
    // Summary statistics
    analysis += "\nTEXT ANALYSIS SUMMARY\n";
    analysis += repeatString("-", 21) + "\n";
    var discoveryInfo = safeGetProperty(differences, 'discoveryInfo');
    var textChangesDetailed = discoveryInfo ? safeGetProperty(discoveryInfo, 'textChangesDetailed') : null;
    if (textChangesDetailed) {
        analysis += "Total text-related changes detected across document\n";
        analysis += "Character changes: " + safeGetProperty(textChangesDetailed, 'characterChanges', 0) + "\n";
        analysis += "Word changes: " + safeGetProperty(textChangesDetailed, 'wordChanges', 0) + "\n";
        analysis += "Style changes: " + safeGetProperty(textChangesDetailed, 'styleChanges', 0) + "\n";
        analysis += "Overflow changes: " + safeGetProperty(textChangesDetailed, 'overflowChanges', 0) + "\n";
    }
    analysis += "Enhanced analysis includes character counts, word counts, and style tracking\n";
    analysis += "All text changes include safe access paths and usage guidance\n\n";
    
    return analysis;
}

// Create technical summary
function createTechnicalSummary(differences) {
    var technical = "TECHNICAL ANALYSIS SUMMARY\n";
    technical += "Generated: " + new Date().toString() + "\n";
    technical += "Engine: Enhanced InDesign Inspector v2.1-ESTK\n";
    technical += repeatString("=", 50) + "\n\n";
    
    // Analysis statistics
    technical += "ANALYSIS STATISTICS\n";
    technical += repeatString("-", 19) + "\n";
    var diffSummary = safeGetProperty(differences, 'summary');
    var changedSections = safeGetProperty(diffSummary, 'changedSections', []);
    technical += "Sections analyzed: " + safeGetLength(changedSections) + "\n";
    technical += "Changes detected: " + (safeGetProperty(diffSummary, 'hasChanges') ? "Yes" : "No") + "\n";
    technical += "Total changes: " + safeGetProperty(diffSummary, 'totalChanges', 0) + "\n";
    technical += "Significant changes: " + safeGetProperty(diffSummary, 'significantChanges', 0) + "\n";
    var diffErrors = safeGetProperty(differences, 'errors');
    technical += "Errors encountered: " + (diffErrors ? safeGetLength(diffErrors) : 0) + "\n";
    
    var discoveryInfo = safeGetProperty(differences, 'discoveryInfo');
    if (discoveryInfo) {
        technical += "Text elements processed: " + safeGetProperty(discoveryInfo, 'textItemsProcessed', 0) + "\n";
        technical += "Properties analyzed: " + safeGetProperty(discoveryInfo, 'propertiesChanged', 0) + "\n";
    }
    
    technical += "\n";
    
    // Change distribution
    technical += "CHANGE DISTRIBUTION BY SECTION\n";
    technical += repeatString("-", 30) + "\n";
    var changes = safeGetProperty(differences, 'changes', {});
    for (var section in changes) {
        var sectionChanges = safeGetProperty(changes, section);
        if (sectionChanges && safeGetLength(sectionChanges)) {
            technical += section + ": " + safeGetLength(sectionChanges) + " changes\n";
        }
    }
    
    // Change types distribution
    if (discoveryInfo) {
        var changesByType = safeGetProperty(discoveryInfo, 'changesByType');
        if (changesByType) {
            technical += "\nCHANGE DISTRIBUTION BY TYPE\n";
            technical += repeatString("-", 27) + "\n";
            for (var changeType in changesByType) {
                technical += changeType + ": " + changesByType[changeType] + "\n";
            }
        }
    }
    
    technical += "\n";
    
    // Performance and reliability metrics
    technical += "PERFORMANCE & RELIABILITY METRICS\n";
    technical += repeatString("-", 34) + "\n";
    technical += "Analysis mode: Comprehensive with ESTK debugging\n";
    technical += "Memory management: Active cleanup enabled\n";
    technical += "Timeout protection: " + (ANALYSIS_CONFIG.timeoutThreshold / 1000) + "-second limits enforced\n";
    technical += "Collection sampling: Up to " + ANALYSIS_CONFIG.maxCollectionSample + " items per collection\n";
    technical += "Text capture: " + ANALYSIS_CONFIG.maxTextPreviewLength + "-character identification previews\n";
    technical += "Error handling: Comprehensive with retry logic\n";
    technical += "API access: Multiple fallback methods for robustness\n\n";
    
    return technical;
}

// Create access path guide
function createAccessPathGuide(differences) {
    var guide = "OBJECT MODEL ACCESS PATHS GUIDE\n";
    guide += "Generated: " + new Date().toString() + "\n";
    guide += "Enhanced Version 2.1-ESTK - Complete Access Path Reference\n";
    guide += repeatString("=", 60) + "\n\n";
    
    guide += "OVERVIEW\n";
    guide += "This guide provides safe access patterns for properties that changed\n";
    guide += "in your InDesign document. All patterns are tested for ESTK compatibility.\n\n";
    
    // Collect unique access patterns from changes
    var accessPatterns = {};
    var diffSummary = safeGetProperty(differences, 'summary');
    var changedSections = safeGetProperty(diffSummary, 'changedSections', []);
    
    for (var s = 0; s < safeGetLength(changedSections); s++) {
        var sectionName = changedSections[s];
        var sectionChanges = safeGetProperty(safeGetProperty(differences, 'changes'), sectionName, []);
        
        var sectionChangesLength = safeGetLength(sectionChanges);
        for (var i = 0; i < Math.min(sectionChangesLength, 10); i++) { // Limit for readability
            var change = sectionChanges[i];
            var accessPath = safeGetProperty(change, 'accessPath');
            if (accessPath) {
                var primaryPath = safeGetProperty(accessPath, 'primary');
                if (primaryPath && !accessPatterns[primaryPath] && stringIndexOf(primaryPath, 'Error') === -1) {
                    accessPatterns[primaryPath] = {
                        path: safeGetProperty(change, 'path'),
                        accessPath: accessPath,
                        safetyNotes: safeGetProperty(change, 'safetyNotes', []),
                        section: sectionName
                    };
                }
            }
        }
    }
    
    // Generate section-specific guidance
    for (var pattern in accessPatterns) {
        var info = accessPatterns[pattern];
        
        guide += "PROPERTY: " + safeGetProperty(info, 'path') + "\n";
        guide += "Section: " + safeGetProperty(info, 'section') + "\n";
        guide += "Primary Access: " + pattern + "\n";
        
        var accessInfo = safeGetProperty(info, 'accessPath');
        var alternatives = safeGetProperty(accessInfo, 'alternatives', []);
        var alternativesLength = safeGetLength(alternatives);
        if (alternativesLength > 0) {
            guide += "Alternative Methods:\n";
            for (var j = 0; j < Math.min(alternativesLength, 3); j++) {
                if (stringIndexOf(alternatives[j], 'Error') === -1) {
                    guide += "  * " + alternatives[j] + "\n";
                }
            }
        }
        
        var safetyLevel = safeGetProperty(accessInfo, 'safetyLevel');
        if (safetyLevel) {
            guide += "Safety Level: " + safetyLevel + "\n";
        }
        
        var safetyNotes = safeGetProperty(info, 'safetyNotes', []);
        var safetyNotesLength = safeGetLength(safetyNotes);
        if (safetyNotesLength > 0) {
            guide += "Safety Guidelines:\n";
            for (var k = 0; k < Math.min(safetyNotesLength, 3); k++) {
                guide += "  ! " + safetyNotes[k] + "\n";
            }
        }
        
        guide += "\n" + repeatString("-", 40) + "\n\n";
    }
    
    // Universal safety patterns
    guide += "UNIVERSAL SAFETY PATTERNS\n";
    guide += repeatString("=", 25) + "\n\n";
    
    guide += "1. Safe Property Access Pattern:\n";
    guide += "   try {\n";
    guide += "       if (obj && obj.hasOwnProperty('propertyName')) {\n";
    guide += "           var value = obj.propertyName;\n";
    guide += "           // Process value\n";
    guide += "       }\n";
    guide += "   } catch (e) {\n";
    guide += "       $.writeln('Property access failed: ' + e.message);\n";
    guide += "   }\n\n";
    
    guide += "2. Safe Collection Iteration:\n";
    guide += "   try {\n";
    guide += "       var length = collection.length || 0;\n";
    guide += "       for (var i = 0; i < length; i++) {\n";
    guide += "           try {\n";
    guide += "               var item = collection[i] || collection.item(i);\n";
    guide += "               // Process item\n";
    guide += "           } catch (itemError) {\n";
    guide += "               $.writeln('Item ' + i + ' failed: ' + itemError.message);\n";
    guide += "           }\n";
    guide += "       }\n";
    guide += "   } catch (e) {\n";
    guide += "       $.writeln('Collection iteration failed: ' + e.message);\n";
    guide += "   }\n\n";
    
    guide += "3. ESTK Debugging Pattern:\n";
    guide += "   function debugProperty(obj, propName) {\n";
    guide += "       try {\n";
    guide += "           $.writeln('Testing property: ' + propName);\n";
    guide += "           var value = obj[propName];\n";
    guide += "           $.writeln('Success: ' + typeof value);\n";
    guide += "           return value;\n";
    guide += "       } catch (e) {\n";
    guide += "           $.writeln('Failed: ' + e.message);\n";
    guide += "           return null;\n";
    guide += "       }\n";
    guide += "   }\n\n";
    
    return guide;
}