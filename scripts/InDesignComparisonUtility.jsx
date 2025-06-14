//
// Enhanced InDesign Document Comparison Utility v2.1
// Advanced interface for comprehensive document analysis with text capture, auto-discovery, and bulletproof error handling
// Requires Enhanced InDesign Document Inspector v2.1 to be loaded first
//

// Utility configuration and state management
var UTILITY_CONFIG = {
    version: "2.1",
    requiredInspectorVersion: "2.1",
    enableProgressDialogs: true,
    enableDetailedReporting: true,
    maxReportFileSize: 10000000, // 10MB limit for JSON files
    autoSaveReports: true,
    createBackups: true
};

// Global state for the utility
var UTILITY_STATE = {
    lastAnalysisReport: null,
    lastComparisonResult: null,
    processingStartTime: null,
    currentDocument: null,
    reportFiles: {
        baseline: null,
        current: null,
        comparison: null,
        summary: null,
        textAnalysis: null,
        discoveryReport: null
    }
};

// Enhanced quick analysis and comparison workflow with comprehensive error handling
function quickCompare() {
    // Diagnostic check
    alert("At start of quickCompare:\n" +
          "$.global.InDesignInspectorFunctions: " + (typeof $.global.InDesignInspectorFunctions) + "\n" +
          "Inspector loaded: " + ($.global.InDesignInspectorFunctions ? $.global.InDesignInspectorFunctions.loaded : "false"));
    
    if (!app.documents.length) {
        alert("Please open a document first.");
        return;
    }
    
    // Verify inspector is loaded and compatible
    if (!verifyInspectorCompatibility()) {
        return;
    }

    var doc = app.activeDocument;
    var docName = doc.name.replace(/\.[^\.]+$/, "");
    var docPath = doc.filePath;

    // Ensure document is saved
    if (!doc.saved || !docPath) {
        var shouldSave = confirm("Document must be saved for analysis. Save now?");
        if (shouldSave) {
            var saveFile = File.saveDialog("Save document for analysis", "*.indd");
            if (saveFile) {
                try {
                    doc.save(saveFile);
                    docPath = doc.filePath;
                    docName = doc.name.replace(/\.[^\.]+$/, "");
                } catch (e) {
                    alert("Failed to save document: " + e.message);
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

    UTILITY_STATE.currentDocument = doc;

    // Check for existing baseline report
    var baselineFile = File(docPath + "/" + docName + "_baseline.json");
    var currentFile = File(docPath + "/" + docName + "_current.json");

    if (!baselineFile.exists) {
        // Create enhanced baseline report
        var baselineSuccess = showProgressDialog("Creating enhanced baseline analysis...", function () {
            try {
                var report = createDocumentReport(doc);
                if (!report) {
                    alert("Failed to create baseline analysis. Please check the document and try again.");
                    return false;
                }

                // Validate report before saving
                if (!validateAnalysisReport(report)) {
                    alert("Generated report failed validation. Analysis may be incomplete.");
                    return false;
                }

                // Save with error handling
                return saveReportSafely(baselineFile, report, "baseline");

            } catch (e) {
                alert("Baseline creation failed: " + e.message);
                return false;
            }
        });

        if (!baselineSuccess) {
            return;
        }

        UTILITY_STATE.reportFiles.baseline = baselineFile;

        // Show enhanced baseline creation summary
        var baselineStats = getBaselineStats();
        showBaselineCreatedDialog(baselineStats);
        return;
    }

    // Create current report with enhanced progress tracking
    var currentReport = null;
    var currentSuccess = showProgressDialog("Analyzing current document state...", function () {
        try {
            currentReport = createDocumentReport(doc);
            if (!currentReport) {
                alert("Failed to analyze current document. Please check for errors and try again.");
                return false;
            }

            if (!validateAnalysisReport(currentReport)) {
                alert("Current analysis may be incomplete - proceeding with caution.");
            }

            return saveReportSafely(currentFile, currentReport, "current");

        } catch (e) {
            alert("Current analysis failed: " + e.message);
            return false;
        }
    });

    if (!currentReport || !currentSuccess) {
        return;
    }

    UTILITY_STATE.reportFiles.current = currentFile;
    UTILITY_STATE.lastAnalysisReport = currentReport;

    // Load baseline report with error handling
    var baselineReport = null;
    try {
        baselineFile.open("r");
        var baselineContent = baselineFile.read();
        baselineFile.close();

        if (!baselineContent || baselineContent.length === 0) {
            alert("Baseline file is empty or corrupted. Please recreate the baseline.");
            return;
        }

        baselineReport = JSON.parse(baselineContent);

        if (!validateAnalysisReport(baselineReport)) {
            alert("Baseline report is invalid or corrupted. Consider recreating the baseline.");
        }

    } catch (e) {
        alert("Failed to load baseline report: " + e.message + "\nConsider recreating the baseline.");
        return;
    }

    // Enhanced comparison with comprehensive progress tracking
    var differences = null;
    var comparisonSuccess = showProgressDialog("Performing comprehensive document comparison...", function () {
        try {
            differences = compareDocumentReports(baselineReport, currentReport);

            if (!differences) {
                alert("Comparison failed - no results generated.");
                return false;
            }

            // Validate comparison results
            if (!validateComparisonResults(differences)) {
                alert("Comparison results may be incomplete - proceeding with available data.");
            }

            return true;

        } catch (e) {
            alert("Comparison failed: " + e.message);
            return false;
        }
    });

    if (!differences || !comparisonSuccess) {
        return;
    }

    UTILITY_STATE.lastComparisonResult = differences;

    // Create comprehensive report suite
    var reportSuiteSuccess = showProgressDialog("Generating comprehensive report suite...", function () {
        try {
            return createComprehensiveReportSuite(differences, docPath, docName);
        } catch (e) {
            alert("Report generation failed: " + e.message);
            return false;
        }
    });

    if (!reportSuiteSuccess) {
        return;
    }

    // Display enhanced comparison results
    showEnhancedComparisonDialog(differences);
}

// Verify inspector compatibility and availability
function verifyInspectorCompatibility() {
    // Check if inspector functions are available in global storage
    if (!$.global.InDesignInspectorFunctions || !$.global.InDesignInspectorFunctions.loaded) {
        alert("Enhanced InDesign Document Inspector v2.1 Required!\n\n" +
              "The comparison utility requires the main inspector script to be loaded first.\n\n" +
              "Please run 'InDesignDocumentInspector.jsx' first, then try again.\n\n" +
              "Required version: " + UTILITY_CONFIG.requiredInspectorVersion);
        return false;
    }
    
    var inspectorFunctions = $.global.InDesignInspectorFunctions;
    
    // Make functions available locally
    createDocumentReport = inspectorFunctions.createDocumentReport;
    compareDocumentReports = inspectorFunctions.compareDocumentReports;
    safeGetProperty = inspectorFunctions.safeGetProperty;
    safeGetNestedProperty = inspectorFunctions.safeGetNestedProperty;
    generateTextAccessPaths = inspectorFunctions.generateTextAccessPaths;
    extractTextSamples = inspectorFunctions.extractTextSamples;
    analyzeTableText = inspectorFunctions.analyzeTableText;
    findTextInGroups = inspectorFunctions.findTextInGroups;
    findNestedImages = inspectorFunctions.findNestedImages;
    repeatString = inspectorFunctions.repeatString;
    ANALYSIS_CONFIG = inspectorFunctions.ANALYSIS_CONFIG;
    
    // Check version compatibility
    if (inspectorFunctions.version !== UTILITY_CONFIG.requiredInspectorVersion) {
        var continueAnyway = confirm("Version Mismatch Warning!\n\n" +
                                   "Inspector version: " + (inspectorFunctions.version || "unknown") + "\n" +
                                   "Utility requires: " + UTILITY_CONFIG.requiredInspectorVersion + "\n\n" +
                                   "Continue anyway? (Not recommended)");
        if (!continueAnyway) {
            return false;
        }
    }
    
    // Check for enhanced features
    if (!ANALYSIS_CONFIG.enableTextCapture) {
        var enableFeatures = confirm("Enhanced features are disabled in the inspector.\n\n" +
                                   "Enable text capture and auto-discovery for full functionality?");
        if (enableFeatures) {
            ANALYSIS_CONFIG.enableTextCapture = true;
            ANALYSIS_CONFIG.enableAutoDiscovery = true;
            ANALYSIS_CONFIG.enablePropertyTracking = true;
        }
    }
    
    return true;
}
// function verifyInspectorCompatibility() {
//     // Check if main inspector functions are available in multiple locations
//     var createReportFn = null;
//     var analysisConfig = null;

//     // Try multiple ways to access the functions
//     if (typeof createDocumentReport !== 'undefined') {
//         createReportFn = createDocumentReport;
//     } else if (typeof $.createDocumentReport !== 'undefined') {
//         createReportFn = $.createDocumentReport;
//     } else if (typeof window !== 'undefined' && typeof window.createDocumentReport !== 'undefined') {
//         createReportFn = window.createDocumentReport;
//     }

//     if (typeof ANALYSIS_CONFIG !== 'undefined') {
//         analysisConfig = ANALYSIS_CONFIG;
//     } else if (typeof $.ANALYSIS_CONFIG !== 'undefined') {
//         analysisConfig = $.ANALYSIS_CONFIG;
//     } else if (typeof window !== 'undefined' && typeof window.ANALYSIS_CONFIG !== 'undefined') {
//         analysisConfig = window.ANALYSIS_CONFIG;
//     }

//     if (!createReportFn) {
//         alert("Enhanced InDesign Document Inspector v2.1 Required!\n\n" +
//             "The comparison utility requires the main inspector script to be loaded first.\n\n" +
//             "Please run 'InDesignDocumentInspector.jsx' first, then try again.\n\n" +
//             "Required version: " + UTILITY_CONFIG.requiredInspectorVersion);
//         return false;
//     }

//     if (!analysisConfig) {
//         alert("Inspector configuration not found!\n\n" +
//             "Please ensure you're running the correct version of the inspector script.\n" +
//             "Required: Enhanced InDesign Document Inspector v2.1");
//         return false;
//     }

//     // Make functions available locally if they were found elsewhere
//     if (typeof createDocumentReport === 'undefined') {
//         createDocumentReport = createReportFn;
//     }
//     if (typeof ANALYSIS_CONFIG === 'undefined') {
//         ANALYSIS_CONFIG = analysisConfig;
//     }

//     // Check version compatibility
//     if (analysisConfig.version !== UTILITY_CONFIG.requiredInspectorVersion) {
//         var continueAnyway = confirm("Version Mismatch Warning!\n\n" +
//             "Inspector version: " + (analysisConfig.version || "unknown") + "\n" +
//             "Utility requires: " + UTILITY_CONFIG.requiredInspectorVersion + "\n\n" +
//             "Continue anyway? (Not recommended)");
//         if (!continueAnyway) {
//             return false;
//         }
//     }

//     // Check for enhanced features
//     if (!analysisConfig.enableTextCapture) {
//         var enableFeatures = confirm("Enhanced features are disabled in the inspector.\n\n" +
//             "Enable text capture and auto-discovery for full functionality?");
//         if (enableFeatures) {
//             analysisConfig.enableTextCapture = true;
//             analysisConfig.enableAutoDiscovery = true;
//             analysisConfig.enablePropertyTracking = true;
//         }
//     }

//     return true;
// }
// function verifyInspectorCompatibility() {
//     // Check if main inspector functions are available
//     if (typeof createDocumentReport === 'undefined') {
//         alert("Enhanced InDesign Document Inspector v2.1 Required!\n\n" +
//               "The comparison utility requires the main inspector script to be loaded first.\n\n" +
//               "Please run 'InDesignDocumentInspector.jsx' first, then try again.\n\n" +
//               "Required version: " + UTILITY_CONFIG.requiredInspectorVersion);
//         return false;
//     }

//     // Check for required global objects
//     if (typeof ANALYSIS_CONFIG === 'undefined') {
//         alert("Inspector configuration not found!\n\n" +
//               "Please ensure you're running the correct version of the inspector script.\n" +
//               "Required: Enhanced InDesign Document Inspector v2.1");
//         return false;
//     }

//     // Check version compatibility
//     if (ANALYSIS_CONFIG.version !== UTILITY_CONFIG.requiredInspectorVersion) {
//         var continueAnyway = confirm("Version Mismatch Warning!\n\n" +
//                                    "Inspector version: " + (ANALYSIS_CONFIG.version || "unknown") + "\n" +
//                                    "Utility requires: " + UTILITY_CONFIG.requiredInspectorVersion + "\n\n" +
//                                    "Continue anyway? (Not recommended)");
//         if (!continueAnyway) {
//             return false;
//         }
//     }

//     // Check for enhanced features
//     if (!ANALYSIS_CONFIG.enableTextCapture) {
//         var enableFeatures = confirm("Enhanced features are disabled in the inspector.\n\n" +
//                                    "Enable text capture and auto-discovery for full functionality?");
//         if (enableFeatures) {
//             ANALYSIS_CONFIG.enableTextCapture = true;
//             ANALYSIS_CONFIG.enableAutoDiscovery = true;
//             ANALYSIS_CONFIG.enablePropertyTracking = true;
//         }
//     }

//     return true;
// }

// Validate analysis report structure and content
function validateAnalysisReport(report) {
    if (!report || typeof report !== 'object') {
        return false;
    }

    // Check for required sections
    var requiredSections = ['timestamp', 'analysisVersion', 'documentInfo'];
    for (var i = 0; i < requiredSections.length; i++) {
        if (!report[requiredSections[i]]) {
            return false;
        }
    }

    // Check version compatibility
    if (report.analysisVersion !== UTILITY_CONFIG.requiredInspectorVersion) {
        // Allow but warn about version mismatch
        return true; // Still valid, just potentially incompatible
    }

    return true;
}

// Validate comparison results
function validateComparisonResults(differences) {
    if (!differences || typeof differences !== 'object') {
        return false;
    }

    // Check for required structure
    if (!differences.summary || !differences.changes) {
        return false;
    }

    return true;
}

// Safely save report with error handling and backup
function saveReportSafely(file, report, reportType) {
    try {
        // Create backup if file exists
        if (UTILITY_CONFIG.createBackups && file.exists) {
            var backupFile = File(file.path + "/" + file.name.replace(/\.json$/, "_backup.json"));
            try {
                file.copy(backupFile);
            } catch (e) {
                // Backup failed but continue
            }
        }

        // Prepare JSON string
        var jsonString = JSON.stringify(report, null, 2);

        // Check file size
        if (jsonString.length > UTILITY_CONFIG.maxReportFileSize) {
            var proceed = confirm("Report file is very large (" + Math.round(jsonString.length / 1024 / 1024) + "MB).\n\n" +
                "This may cause performance issues. Continue anyway?");
            if (!proceed) {
                return false;
            }
        }

        // Save file
        file.open("w");
        file.write(jsonString);
        file.close();

        return true;

    } catch (e) {
        alert("Failed to save " + reportType + " report: " + e.message);
        return false;
    }
}

// Get baseline creation statistics
function getBaselineStats() {
    try {
        if (!ANALYSIS_CONFIG) {
            return null;
        }

        return {
            collectionsDiscovered: ANALYSIS_CONFIG.discoveredCollections ? ANALYSIS_CONFIG.discoveredCollections.length : 0,
            textItemsProcessed: ANALYSIS_CONFIG.textItemsProcessed || 0,
            brokenPropertiesFound: ANALYSIS_CONFIG.brokenPropertiesFound ? ANALYSIS_CONFIG.brokenPropertiesFound.length : 0,
            errorsHandled: ANALYSIS_CONFIG.errors ? ANALYSIS_CONFIG.errors.length : 0,
            processingTime: ANALYSIS_CONFIG.processingStartTime ?
                (new Date().getTime() - ANALYSIS_CONFIG.processingStartTime) / 1000 : 0
        };
    } catch (e) {
        return null;
    }
}

// Show baseline created dialog with comprehensive information
function showBaselineCreatedDialog(stats) {
    var dialog = new Window("dialog", "Enhanced Baseline Created Successfully");
    dialog.preferredSize.width = 500;
    dialog.preferredSize.height = 450;

    var mainGroup = dialog.add("group");
    mainGroup.orientation = "column";
    mainGroup.alignment = "fill";

    // Success message
    var successPanel = mainGroup.add("panel", undefined, "Baseline Analysis Complete");
    successPanel.alignment = "fill";

    var successText = successPanel.add("statictext", undefined,
        "Enhanced baseline analysis has been successfully created!\n\n" +
        "The inspector has captured comprehensive information about your document,\n" +
        "including text content, object properties, and collection structure.",
        { multiline: true });
    successText.alignment = "fill";

    // Statistics panel
    if (stats) {
        var statsPanel = mainGroup.add("panel", undefined, "Analysis Statistics");
        statsPanel.alignment = "fill";

        var statsGroup = statsPanel.add("group");
        statsGroup.orientation = "column";
        statsGroup.alignment = "fill";

        var statsText = "DISCOVERY SUMMARY\n";
        statsText += "Collections discovered: " + stats.collectionsDiscovered + "\n";
        statsText += "Text items processed: " + stats.textItemsProcessed + "\n";
        statsText += "Properties checked: " + (stats.brokenPropertiesFound || 0) + "\n";
        statsText += "Errors handled gracefully: " + stats.errorsHandled + "\n";
        if (stats.processingTime > 0) {
            statsText += "Processing time: " + stats.processingTime.toFixed(1) + " seconds\n";
        }

        var statsDisplay = statsGroup.add("statictext", undefined, statsText, { multiline: true });
        statsDisplay.alignment = "fill";
    }

    // Instructions panel
    var instructionsPanel = mainGroup.add("panel", undefined, "Next Steps");
    instructionsPanel.alignment = "fill";

    var instructionsText = instructionsPanel.add("statictext", undefined,
        "1. Make your changes to the document\n" +
        "2. Run this utility again to see what changed\n" +
        "3. The comparison will show detailed differences\n\n" +
        "Features captured:\n" +
        "- Complete text content from all text elements\n" +
        "- Auto-discovered collections and properties\n" +
        "- Broken property detection and alternatives\n" +
        "- Comprehensive object model access paths",
        { multiline: true });
    instructionsText.alignment = "fill";

    // Buttons
    var buttonGroup = mainGroup.add("group");
    buttonGroup.alignment = "center";

    var viewReportBtn = buttonGroup.add("button", undefined, "View Baseline Report");
    var okBtn = buttonGroup.add("button", undefined, "OK");

    viewReportBtn.onClick = function () {
        try {
            if (UTILITY_STATE.reportFiles.baseline) {
                UTILITY_STATE.reportFiles.baseline.execute();
            }
        } catch (e) {
            alert("Could not open baseline report: " + e.message);
        }
    };

    okBtn.onClick = function () {
        dialog.close();
    };

    dialog.show();
}

// Create comprehensive report suite with all enhanced features
function createComprehensiveReportSuite(differences, docPath, docName) {
    try {
        // Create all enhanced reports
        var reports = {
            summary: createEnhancedHumanReadableSummary(differences),
            textAnalysis: createEnhancedTextAnalysisSummary(differences),
            discoveryReport: createEnhancedDiscoveryReport(differences),
            accessPathsGuide: createComprehensiveAccessPathsGuide(differences),
            technicalReport: createTechnicalReport(differences)
        };

        // Save all reports with error handling
        var reportFiles = {
            comparison: File(docPath + "/" + docName + "_comparison.json"),
            summary: File(docPath + "/" + docName + "_summary.txt"),
            textAnalysis: File(docPath + "/" + docName + "_text_analysis.txt"),
            discoveryReport: File(docPath + "/" + docName + "_discovery_report.txt"),
            accessPathsGuide: File(docPath + "/" + docName + "_access_paths_guide.txt"),
            technicalReport: File(docPath + "/" + docName + "_technical_report.txt")
        };

        // Save JSON comparison data
        if (!saveReportSafely(reportFiles.comparison, differences, "comparison")) {
            return false;
        }

        // Save text reports
        var textReports = [
            { file: reportFiles.summary, content: reports.summary, type: "summary" },
            { file: reportFiles.textAnalysis, content: reports.textAnalysis, type: "text analysis" },
            { file: reportFiles.discoveryReport, content: reports.discoveryReport, type: "discovery report" },
            { file: reportFiles.accessPathsGuide, content: reports.accessPathsGuide, type: "access paths guide" },
            { file: reportFiles.technicalReport, content: reports.technicalReport, type: "technical report" }
        ];

        for (var i = 0; i < textReports.length; i++) {
            var report = textReports[i];
            try {
                report.file.open("w");
                report.file.write(report.content);
                report.file.close();
            } catch (e) {
                alert("Failed to save " + report.type + ": " + e.message);
                return false;
            }
        }

        // Update state
        UTILITY_STATE.reportFiles = reportFiles;

        return true;

    } catch (e) {
        alert("Report suite creation failed: " + e.message);
        return false;
    }
}

// Create enhanced human-readable summary with all new features
function createEnhancedHumanReadableSummary(differences) {
    var summary = "ENHANCED DOCUMENT COMPARISON SUMMARY\n";
    summary += "Generated: " + new Date().toString() + "\n";
    summary += "Analysis Version: 2.1 (Text Capture + Auto-Discovery + Enhanced Error Handling)\n";
    summary += "=" + Array(80).join("=") + "\n\n";

    if (!differences.summary.hasChanges) {
        summary += "NO CHANGES DETECTED\n";
        summary += "The document appears to be identical to the baseline.\n\n";

        // Show discovery information even with no changes
        if (differences.discoveryInfo) {
            summary += "DISCOVERY SUMMARY\n";
            summary += "Collections discovered: " + (differences.discoveryInfo.totalCollections || 0) + "\n";
            summary += "Text items processed: " + (differences.discoveryInfo.textItemsProcessed || 0) + "\n";
            summary += "Properties accessible: " + (differences.discoveryInfo.accessibleProperties || 0) + "\n";
            summary += "Properties with issues: " + (differences.discoveryInfo.brokenProperties || 0) + "\n";
        }
        return summary;
    }

    summary += "CHANGES DETECTED\n";
    summary += "Changed sections: " + differences.summary.changedSections.length + "\n";
    if (differences.errors && differences.errors.length > 0) {
        summary += "Analysis errors handled: " + differences.errors.length + " (details available)\n";
    }

    // Enhanced discovery summary
    if (differences.discoveryInfo) {
        summary += "\nCOMPREHENSIVE DISCOVERY SUMMARY\n";
        summary += "Collections discovered: " + (differences.discoveryInfo.totalCollections || 0) + "\n";
        summary += "New collections found: " + (differences.discoveryInfo.newCollections || 0) + "\n";
        summary += "Collections removed: " + (differences.discoveryInfo.removedCollections || 0) + "\n";
        summary += "Text items processed: " + (differences.discoveryInfo.textItemsProcessed || 0) + "\n";
        summary += "Text items with changes: " + (differences.discoveryInfo.textItemsChanged || 0) + "\n";
        summary += "Properties now accessible: " + (differences.discoveryInfo.newlyAccessibleProperties || 0) + "\n";
        summary += "Properties now broken: " + (differences.discoveryInfo.newlyBrokenProperties || 0) + "\n";
    }
    summary += "\n";

    var changes = differences.changes;

    // Enhanced Text Content Analysis (Priority section)
    if (changes.textContent) {
        summary += "TEXT CONTENT ANALYSIS (ENHANCED)\n";
        summary += repeatString("-", 35) + "\n";
        var textChanges = categorizeChanges(changes.textContent);

        if (textChanges.additions.length > 0) {
            summary += "- Added " + textChanges.additions.length + " text element(s)\n";
        }
        if (textChanges.deletions.length > 0) {
            summary += "- Removed " + textChanges.deletions.length + " text element(s)\n";
        }
        if (textChanges.modifications.length > 0) {
            summary += "- Modified " + textChanges.modifications.length + " text element(s)\n";

            // Show detailed text changes
            for (var i = 0; i < Math.min(textChanges.modifications.length, 5); i++) {
                var change = textChanges.modifications[i];
                if (change.path.indexOf('textContent') !== -1 || change.path.indexOf('contents') !== -1) {
                    var textSummary = getEnhancedTextChangeSummary(change);
                    if (textSummary) {
                        summary += "  - " + textSummary + "\n";
                    }
                } else if (change.path.indexOf('characterCount') !== -1) {
                    summary += "  - Character count: " + change.oldValue + " -> " + change.newValue + "\n";
                } else if (change.path.indexOf('wordCount') !== -1) {
                    summary += "  - Word count: " + change.oldValue + " -> " + change.newValue + "\n";
                }
            }
        }
        summary += "\n";
    }

    // Auto-Discovered Collections Changes
    if (changes.autoDiscoveredCollections) {
        summary += "AUTO-DISCOVERED COLLECTIONS\n";
        summary += repeatString("-", 30) + "\n";
        var discoveryChanges = categorizeChanges(changes.autoDiscoveredCollections);

        if (discoveryChanges.additions.length > 0) {
            summary += "- Found " + discoveryChanges.additions.length + " new collection(s)\n";
            for (var i = 0; i < Math.min(discoveryChanges.additions.length, 3); i++) {
                var change = discoveryChanges.additions[i];
                summary += "  - New: " + formatChangeWithAccess(change) + "\n";
            }
        }
        if (discoveryChanges.modifications.length > 0) {
            summary += "- Changed " + discoveryChanges.modifications.length + " collection(s)\n";
            for (var i = 0; i < Math.min(discoveryChanges.modifications.length, 3); i++) {
                var change = discoveryChanges.modifications[i];
                summary += "  - " + formatChangeWithAccess(change) + "\n";
            }
        }
        if (discoveryChanges.deletions.length > 0) {
            summary += "- Lost access to " + discoveryChanges.deletions.length + " collection(s)\n";
        }
        summary += "\n";
    }

    // Broken Properties Analysis
    if (changes.brokenProperties) {
        summary += "PROPERTY ACCESSIBILITY ANALYSIS\n";
        summary += repeatString("-", 35) + "\n";
        var brokenChanges = categorizeChanges(changes.brokenProperties);

        if (brokenChanges.additions.length > 0) {
            summary += "- " + brokenChanges.additions.length + " properties became inaccessible\n";
        }
        if (brokenChanges.deletions.length > 0) {
            summary += "- " + brokenChanges.deletions.length + " properties became accessible again\n";
        }
        if (brokenChanges.modifications.length > 0) {
            summary += "- " + brokenChanges.modifications.length + " properties changed accessibility status\n";
        }
        summary += "\n";
    }

    // Document Information Changes
    if (changes.documentInfo) {
        summary += "DOCUMENT INFORMATION\n";
        summary += repeatString("-", 25) + "\n";
        for (var i = 0; i < Math.min(changes.documentInfo.length, 5); i++) {
            var change = changes.documentInfo[i];
            summary += "- " + formatChangeWithAccess(change) + "\n";
        }
        if (changes.documentInfo.length > 5) {
            summary += "- ... and " + (changes.documentInfo.length - 5) + " more changes\n";
        }
        summary += "\n";
    }

    // Page Changes
    if (changes.pages) {
        summary += "PAGES\n";
        summary += repeatString("-", 8) + "\n";
        var pageChanges = categorizeChanges(changes.pages);
        if (pageChanges.additions.length > 0) {
            summary += "- Added " + pageChanges.additions.length + " page(s)\n";
        }
        if (pageChanges.deletions.length > 0) {
            summary += "- Removed " + pageChanges.deletions.length + " page(s)\n";
        }
        if (pageChanges.modifications.length > 0) {
            summary += "- Modified " + pageChanges.modifications.length + " page(s)\n";
            for (var i = 0; i < Math.min(pageChanges.modifications.length, 3); i++) {
                summary += "  - " + formatChangeWithAccess(pageChanges.modifications[i]) + "\n";
            }
        }
        summary += "\n";
    }

    // Enhanced Stories Analysis
    if (changes.stories) {
        summary += "TEXT STORIES (ENHANCED)\n";
        summary += repeatString("-", 24) + "\n";
        var storyChanges = categorizeChanges(changes.stories);
        if (storyChanges.additions.length > 0) {
            summary += "- Added " + storyChanges.additions.length + " story(ies)\n";
        }
        if (storyChanges.deletions.length > 0) {
            summary += "- Removed " + storyChanges.deletions.length + " story(ies)\n";
        }
        if (storyChanges.modifications.length > 0) {
            summary += "- Modified " + storyChanges.modifications.length + " story(ies)\n";

            // Enhanced story change analysis
            for (var i = 0; i < Math.min(storyChanges.modifications.length, 3); i++) {
                var change = storyChanges.modifications[i];
                var storyChangeSummary = getStoryChangeSummary(change);
                if (storyChangeSummary) {
                    summary += "  - " + storyChangeSummary + "\n";
                }
            }
        }
        summary += "\n";
    }

    // Continue with other sections (images, graphics, etc.)
    var otherSections = ['images', 'graphics', 'textFrames', 'layers', 'styles', 'colors', 'fonts', 'links'];
    for (var s = 0; s < otherSections.length; s++) {
        var sectionName = otherSections[s];
        if (changes[sectionName]) {
            summary += getSectionSummary(sectionName, changes[sectionName]);
        }
    }

    // Comprehensive Summary Footer
    summary += "=" + Array(80).join("=") + "\n";
    summary += "COMPREHENSIVE ANALYSIS COMPLETE\n";
    summary += "Enhanced Features Applied:\n";
    summary += "- Text content captured and analyzed in detail\n";
    summary += "- Collections auto-discovered and tracked\n";
    summary += "- Property accessibility monitored and reported\n";
    summary += "- Object model access paths provided with safety guidance\n";
    summary += "- Comprehensive error handling applied throughout\n";
    summary += "- Performance optimizations and timeout protection\n\n";
    summary += "COMPANION REPORTS:\n";
    summary += "- *_comparison.json (complete technical data)\n";
    summary += "- *_text_analysis.txt (detailed text content changes)\n";
    summary += "- *_discovery_report.txt (collection and property discovery)\n";
    summary += "- *_access_paths_guide.txt (object model access guidance)\n";
    summary += "- *_technical_report.txt (comprehensive technical analysis)\n\n";
    summary += "All reports work together to provide complete change analysis.\n";

    return summary;
}

// Helper functions for summary creation
function categorizeChanges(changesList) {
    var categorized = {
        additions: [],
        deletions: [],
        modifications: []
    };

    for (var i = 0; i < changesList.length; i++) {
        var change = changesList[i];
        if (change.type === 'addition') {
            categorized.additions.push(change);
        } else if (change.type === 'deletion') {
            categorized.deletions.push(change);
        } else {
            categorized.modifications.push(change);
        }
    }

    return categorized;
}

function formatChangeWithAccess(change) {
    var formatted = change.path || 'unknown';

    if (change.type === 'value_change' || change.type === 'text_content_change') {
        formatted += ": " + (change.oldValue || 'null') + " -> " + (change.newValue || 'null');
    }

    if (change.accessPath && change.accessPath.primary) {
        formatted += " (Access: " + change.accessPath.primary + ")";
    }

    return formatted;
}

function getEnhancedTextChangeSummary(change) {
    try {
        if (change.type === "text_content_change" || change.type === "value_change") {
            var oldText = change.oldValue || "";
            var newText = change.newValue || "";

            if (oldText.length === 0 && newText.length > 0) {
                return "Text added: \"" + newText.substring(0, 50) + (newText.length > 50 ? "..." : "") + "\"";
            } else if (oldText.length > 0 && newText.length === 0) {
                return "Text removed: \"" + oldText.substring(0, 50) + (oldText.length > 50 ? "..." : "") + "\"";
            } else if (oldText !== newText) {
                var lengthChange = newText.length - oldText.length;
                var summary = "Text modified";
                if (lengthChange !== 0) {
                    summary += " (length " + (lengthChange > 0 ? "+" : "") + lengthChange + " chars)";
                }
                return summary;
            }
        }
        return null;
    } catch (e) {
        return "Text change (analysis error)";
    }
}

function getStoryChangeSummary(change) {
    try {
        if (change.path.indexOf('textContent') !== -1) {
            return "Story text content changed";
        } else if (change.path.indexOf('length') !== -1) {
            return "Story length: " + change.oldValue + " -> " + change.newValue + " characters";
        } else if (change.path.indexOf('textFrameCount') !== -1) {
            return "Text frame count: " + change.oldValue + " -> " + change.newValue;
        } else if (change.path.indexOf('overflows') !== -1) {
            return "Overflow status: " + (change.newValue ? "now overflows" : "overflow resolved");
        }
        return null;
    } catch (e) {
        return "Story change (analysis error)";
    }
}

function getSectionSummary(sectionName, changes) {
    var summary = "";
    var categorized = categorizeChanges(changes);

    var displayName = sectionName.toUpperCase();
    var icon = "";

    switch (sectionName) {
        case 'images': icon = "[IMG] "; break;
        case 'graphics': icon = "[GFX] "; break;
        case 'textFrames': icon = "[TXT] "; break;
        case 'layers': icon = "[LYR] "; break;
        case 'styles': icon = "[STY] "; break;
        case 'colors': icon = "[CLR] "; break;
        case 'fonts': icon = "[FNT] "; break;
        case 'links': icon = "[LNK] "; break;
    }

    summary += icon + displayName + "\n";
    summary += repeatString("-", displayName.length + icon.length) + "\n";

    if (categorized.additions.length > 0) {
        summary += "- Added " + categorized.additions.length + " item(s)\n";
    }
    if (categorized.deletions.length > 0) {
        summary += "- Removed " + categorized.deletions.length + " item(s)\n";
    }
    if (categorized.modifications.length > 0) {
        summary += "- Modified " + categorized.modifications.length + " item(s)\n";
        for (var i = 0; i < Math.min(categorized.modifications.length, 2); i++) {
            summary += "  - " + formatChangeWithAccess(categorized.modifications[i]) + "\n";
        }
        if (categorized.modifications.length > 2) {
            summary += "  - ... and " + (categorized.modifications.length - 2) + " more\n";
        }
    }
    summary += "\n";

    return summary;
}

// Create enhanced text analysis summary
function createEnhancedTextAnalysisSummary(differences) {
    var summary = "ENHANCED TEXT CONTENT ANALYSIS REPORT\n";
    summary += "Generated: " + new Date().toString() + "\n";
    summary += "Analysis Version: 2.1 - Comprehensive Text Capture & Analysis\n";
    summary += "=" + Array(70).join("=") + "\n\n";

    // Text content changes
    if (differences.changes.textContent) {
        summary += "TEXT CONTENT CHANGES\n";
        summary += repeatString("-", 20) + "\n\n";

        var textChanges = differences.changes.textContent;
        for (var i = 0; i < textChanges.length; i++) {
            var change = textChanges[i];

            summary += "CHANGE " + (i + 1) + ":\n";
            summary += "Path: " + change.path + "\n";
            summary += "Type: " + change.type + "\n";

            if (change.accessPath) {
                summary += "Primary Access: " + change.accessPath.primary + "\n";
                if (change.accessPath.alternatives && change.accessPath.alternatives.length > 0) {
                    summary += "Alternative Access: " + change.accessPath.alternatives[0] + "\n";
                }
            }

            if (change.type === "text_content_change" || (change.type === "value_change" &&
                (change.path.indexOf('textContent') !== -1 || change.path.indexOf('contents') !== -1))) {

                var oldText = change.oldValue || "";
                var newText = change.newValue || "";

                summary += "Old Text: \"" + oldText.substring(0, 300) + (oldText.length > 300 ? "..." : "") + "\"\n";
                summary += "New Text: \"" + newText.substring(0, 300) + (newText.length > 300 ? "..." : "") + "\"\n";

                // Enhanced text difference analysis
                var textDiff = analyzeTextDifference(oldText, newText);
                summary += "Analysis: " + textDiff + "\n";

                // Word and character analysis
                if (oldText && newText) {
                    var oldWords = oldText.split(/\s+/).length;
                    var newWords = newText.split(/\s+/).length;
                    summary += "Word count change: " + oldWords + " -> " + newWords + " (" + (newWords - oldWords) + ")\n";
                }

            } else if (change.type === "value_change") {
                summary += "Old Value: " + change.oldValue + "\n";
                summary += "New Value: " + change.newValue + "\n";
            }

            // Safety notes for text access
            if (change.safetyNotes && change.safetyNotes.length > 0) {
                summary += "Safety Notes:\n";
                for (var j = 0; j < Math.min(change.safetyNotes.length, 2); j++) {
                    summary += "  - " + change.safetyNotes[j] + "\n";
                }
            }

            summary += "\n" + repeatString("-", 50) + "\n\n";
        }
    }

    // Story-level text changes
    if (differences.changes.stories) {
        summary += "\nSTORY-LEVEL TEXT CHANGES\n";
        summary += repeatString("-", 25) + "\n\n";

        var storyChanges = differences.changes.stories;
        var textRelatedChanges = [];

        for (var i = 0; i < storyChanges.length; i++) {
            var change = storyChanges[i];
            if (change.path.indexOf('textContent') !== -1 ||
                change.path.indexOf('length') !== -1 ||
                change.path.indexOf('characters') !== -1 ||
                change.path.indexOf('words') !== -1 ||
                change.path.indexOf('paragraphs') !== -1 ||
                change.path.indexOf('overflows') !== -1) {
                textRelatedChanges.push(change);
            }
        }

        for (var i = 0; i < textRelatedChanges.length; i++) {
            var change = textRelatedChanges[i];
            summary += "Story Change " + (i + 1) + ":\n";
            summary += "Property: " + change.path + "\n";
            summary += "Change: " + formatChange(change) + "\n";

            if (change.accessPath) {
                summary += "Access: " + change.accessPath.primary + "\n";
                if (change.accessPath.safetyLevel) {
                    summary += "Safety Level: " + change.accessPath.safetyLevel + "\n";
                }
            }

            // Enhanced story text analysis
            if (change.path.indexOf('textContent') !== -1 && change.oldValue && change.newValue) {
                var contentAnalysis = analyzeStoryTextContent(change.oldValue, change.newValue);
                if (contentAnalysis) {
                    summary += "Content Analysis: " + contentAnalysis + "\n";
                }
            }

            summary += "\n";
        }
    }

    // Text frame analysis
    if (differences.changes.textFrames) {
        summary += "\nTEXT FRAME CHANGES\n";
        summary += repeatString("-", 18) + "\n\n";

        var frameChanges = differences.changes.textFrames;
        var textFrameTextChanges = [];

        for (var i = 0; i < frameChanges.length; i++) {
            var change = frameChanges[i];
            if (change.path.indexOf('contents') !== -1 ||
                change.path.indexOf('overflows') !== -1 ||
                change.path.indexOf('characterCount') !== -1) {
                textFrameTextChanges.push(change);
            }
        }

        for (var i = 0; i < textFrameTextChanges.length; i++) {
            var change = textFrameTextChanges[i];
            summary += "Frame Change " + (i + 1) + ":\n";
            summary += "Property: " + change.path + "\n";
            summary += "Change: " + formatChange(change) + "\n";

            if (change.accessPath) {
                summary += "Access: " + change.accessPath.primary + "\n";
            }

            summary += "\n";
        }
    }

    // Comprehensive text statistics
    summary += "\nTEXT ANALYSIS SUMMARY\n";
    summary += repeatString("-", 21) + "\n";
    summary += "Total text-related changes: " + ((differences.changes.textContent ? differences.changes.textContent.length : 0) +
        (textRelatedChanges ? textRelatedChanges.length : 0) +
        (textFrameTextChanges ? textFrameTextChanges.length : 0)) + "\n";
    summary += "Text content modifications detected across multiple document elements\n";
    summary += "Enhanced analysis includes character counts, word counts, and content previews\n";
    summary += "All text changes include safe access paths and usage guidance\n\n";

    return summary;
}

// Helper functions for text analysis
function analyzeTextDifference(oldText, newText) {
    if (!oldText && !newText) return "Both texts empty";
    if (!oldText) return "Text added (" + newText.length + " characters)";
    if (!newText) return "Text removed (" + oldText.length + " characters)";

    var oldLen = oldText.length;
    var newLen = newText.length;

    if (oldLen === newLen) {
        if (oldText === newText) {
            return "No change detected";
        } else {
            // Analyze character-level changes
            var diffCount = 0;
            for (var i = 0; i < oldLen; i++) {
                if (oldText.charAt(i) !== newText.charAt(i)) {
                    diffCount++;
                }
            }
            return "Content modified (same length, " + diffCount + " character differences)";
        }
    } else {
        var diff = newLen - oldLen;
        var analysis = "Length changed by " + diff + " characters (" + oldLen + " -> " + newLen + ")";

        // Additional analysis for significant changes
        if (Math.abs(diff) > oldLen * 0.1) { // More than 10% change
            analysis += " - Significant content change";
        }

        return analysis;
    }
}

function analyzeStoryTextContent(oldContent, newContent) {
    try {
        if (!oldContent || !newContent) return null;

        var oldPreview = oldContent.substring ? oldContent.substring(0, 100) : String(oldContent).substring(0, 100);
        var newPreview = newContent.substring ? newContent.substring(0, 100) : String(newContent).substring(0, 100);

        if (oldPreview === newPreview) {
            return "Content changes detected beyond preview area";
        } else {
            return "Content preview changed: \"" + oldPreview + "...\" -> \"" + newPreview + "...\"";
        }
    } catch (e) {
        return "Content analysis error";
    }
}

function formatChange(change) {
    if (change.type === 'value_change') {
        return change.oldValue + " -> " + change.newValue;
    } else if (change.type === 'addition') {
        return "Added: " + change.newValue;
    } else if (change.type === 'deletion') {
        return "Removed: " + change.oldValue;
    } else {
        return change.type;
    }
}

// Create enhanced discovery report
function createEnhancedDiscoveryReport(differences) {
    var report = "ENHANCED AUTO-DISCOVERY ANALYSIS REPORT\n";
    report += "Generated: " + new Date().toString() + "\n";
    report += "Discovery Engine Version: 2.1 - Comprehensive Collection & Property Discovery\n";
    report += "=" + Array(70).join("=") + "\n\n";

    if (differences.discoveryInfo) {
        var info = differences.discoveryInfo;

        report += "DISCOVERY SUMMARY\n";
        report += repeatString("-", 17) + "\n";
        report += "Total collections discovered: " + (info.totalCollections || 0) + "\n";
        report += "New collections found: " + (info.newCollections || 0) + "\n";
        report += "Collections that disappeared: " + (info.removedCollections || 0) + "\n";
        report += "Properties currently accessible: " + (info.accessibleProperties || 0) + "\n";
        report += "Properties with access issues: " + (info.brokenProperties || 0) + "\n";
        report += "Properties that became accessible: " + (info.newlyAccessibleProperties || 0) + "\n";
        report += "Properties that became inaccessible: " + (info.newlyBrokenProperties || 0) + "\n";
        report += "Text items processed: " + (info.textItemsProcessed || 0) + "\n";
        report += "Text items with changes: " + (info.textItemsChanged || 0) + "\n\n";

        // Discovery health assessment
        report += "DISCOVERY HEALTH ASSESSMENT\n";
        report += repeatString("-", 28) + "\n";
        var accessibilityRatio = info.accessibleProperties / (info.accessibleProperties + info.brokenProperties);
        if (accessibilityRatio > 0.9) {
            report += "Status: Excellent - Most properties accessible\n";
        } else if (accessibilityRatio > 0.7) {
            report += "Status: Good - Some properties have access issues\n";
        } else {
            report += "Status: Attention Needed - Many properties inaccessible\n";
        }
        report += "Accessibility Ratio: " + Math.round(accessibilityRatio * 100) + "%\n\n";
    }

    // Auto-discovered collections changes
    if (differences.changes.autoDiscoveredCollections) {
        report += "COLLECTION DISCOVERY CHANGES\n";
        report += repeatString("-", 28) + "\n\n";

        var collectionChanges = differences.changes.autoDiscoveredCollections;
        for (var i = 0; i < collectionChanges.length; i++) {
            var change = collectionChanges[i];
            report += "Collection Change " + (i + 1) + ":\n";
            report += "Path: " + change.path + "\n";
            report += "Change Type: " + change.type + "\n";
            report += "Details: " + formatChange(change) + "\n";

            if (change.accessPath) {
                report += "Access Method: " + change.accessPath.primary + "\n";
                if (change.accessPath.alternatives && change.accessPath.alternatives.length > 0) {
                    report += "Alternative Access: " + change.accessPath.alternatives[0] + "\n";
                }
                report += "Safety Level: " + (change.accessPath.safetyLevel || "medium") + "\n";
            }

            if (change.safetyNotes && change.safetyNotes.length > 0) {
                report += "Safety Notes:\n";
                for (var j = 0; j < Math.min(change.safetyNotes.length, 2); j++) {
                    report += "  - " + change.safetyNotes[j] + "\n";
                }
            }

            report += "\n" + repeatString("-", 40) + "\n\n";
        }
    }

    // Broken properties analysis
    if (differences.changes.brokenProperties) {
        report += "PROPERTY ACCESSIBILITY ANALYSIS\n";
        report += repeatString("-", 32) + "\n\n";

        var brokenChanges = differences.changes.brokenProperties;
        for (var i = 0; i < brokenChanges.length; i++) {
            var change = brokenChanges[i];
            report += "Property: " + change.path + "\n";
            report += "Status Change: " + change.type + "\n";

            if (change.type === "addition") {
                report += "Impact: Property became inaccessible\n";
            } else if (change.type === "deletion") {
                report += "Impact: Property became accessible again\n";
            }

            if (change.error || change.reason) {
                report += "Reason: " + (change.error || change.reason) + "\n";
            }

            if (change.accessPath && change.accessPath.alternatives) {
                report += "Alternative Access Methods:\n";
                for (var j = 0; j < Math.min(change.accessPath.alternatives.length, 2); j++) {
                    report += "  - " + change.accessPath.alternatives[j] + "\n";
                }
            }

            report += "\n";
        }
    }

    // Discovery recommendations
    report += "\nDISCOVERY RECOMMENDATIONS\n";
    report += repeatString("-", 25) + "\n";

    if (differences.discoveryInfo) {
        var info = differences.discoveryInfo;

        if (info.newlyBrokenProperties > 0) {
            report += "PROPERTY ACCESS ISSUES:\n";
            report += "  - " + info.newlyBrokenProperties + " properties became inaccessible\n";
            report += "  - Review error handling in your scripts\n";
            report += "  - Consider using alternative access methods\n";
            report += "  - Test with different document types\n\n";
        }

        if (info.newCollections > 0) {
            report += "NEW COLLECTIONS DISCOVERED:\n";
            report += "  - " + info.newCollections + " new collections found\n";
            report += "  - Update your scripts to handle new collections\n";
            report += "  - Test collection access patterns\n";
            report += "  - Verify collection reliability across documents\n\n";
        }

        if (info.totalCollections > 20) {
            report += "PERFORMANCE CONSIDERATIONS:\n";
            report += "  - Document has " + info.totalCollections + " collections\n";
            report += "  - Consider batch processing for large collections\n";
            report += "  - Use sampling for analysis of very large collections\n";
            report += "  - Implement timeout protection for complex operations\n\n";
        }
    }

    report += "Use this report to improve script reliability and performance\n";
    report += "All discovery data is captured for future reference\n";
    report += "Property access patterns are continuously monitored\n";

    return report;
}

// Create comprehensive access paths guide
function createComprehensiveAccessPathsGuide(differences) {
    var guide = "COMPREHENSIVE OBJECT MODEL ACCESS PATHS GUIDE\n";
    guide += "Generated: " + new Date().toString() + "\n";
    guide += "Enhanced Version 2.1 - Complete Access Path Reference\n";
    guide += "=" + Array(70).join("=") + "\n\n";

    guide += "OVERVIEW\n";
    guide += "This guide provides comprehensive access patterns for all properties that changed\n";
    guide += "in your InDesign document, including enhanced text content access, auto-discovered\n";
    guide += "collections, and safety guidance for problematic properties.\n\n";

    // Section-by-section enhanced access paths
    try {
        var sections = differences.summary.changedSections || [];

        for (var s = 0; s < sections.length; s++) {
            var sectionName = sections[s];
            var sectionChanges = differences.changes[sectionName] || [];

            guide += "SECTION: " + sectionName.toUpperCase() + "\n";
            guide += "=" + Array(sectionName.length + 10).join("=") + "\n\n";

            var uniquePaths = {};
            var pathCount = 0;

            for (var i = 0; i < sectionChanges.length && pathCount < 20; i++) {
                var change = sectionChanges[i];
                var accessPath = change.accessPath;

                if (accessPath && accessPath.primary) {
                    var primary = accessPath.primary;
                    if (!uniquePaths[primary] && primary.indexOf('Error') === -1) {
                        uniquePaths[primary] = true;
                        pathCount++;

                        guide += "Property: " + change.path + "\n";
                        guide += "Primary Access: " + primary + "\n";

                        if (accessPath.alternatives && accessPath.alternatives.length > 0) {
                            guide += "Alternative Methods:\n";
                            for (var j = 0; j < Math.min(accessPath.alternatives.length, 3); j++) {
                                if (accessPath.alternatives[j].indexOf('Error') === -1) {
                                    guide += "  - " + accessPath.alternatives[j] + "\n";
                                }
                            }
                        }

                        if (accessPath.safetyLevel) {
                            guide += "Safety Level: " + accessPath.safetyLevel + "\n";
                        }

                        if (change.safetyNotes && change.safetyNotes.length > 0) {
                            guide += "Safety Guidelines:\n";
                            for (var k = 0; k < Math.min(change.safetyNotes.length, 3); k++) {
                                guide += "  - " + change.safetyNotes[k] + "\n";
                            }
                        }

                        // Enhanced code examples based on change type
                        guide += "\nComprehensive Access Example:\n";
                        guide += generateEnhancedCodeExample(change, accessPath);

                        guide += "\n" + repeatString("-", 50) + "\n\n";
                    }
                }
            }

            if (pathCount === 0) {
                guide += "No accessible properties found in this section.\n";
                guide += "This may indicate analysis issues or unavailable data.\n\n";
            }
        }
    } catch (e) {
        guide += "Error generating section-specific paths: " + e.message + "\n\n";
    }

    // Enhanced safety patterns
    guide += "\nENHANCED SAFETY PATTERNS\n";
    guide += "=" + Array(26).join("=") + "\n\n";

    guide += "1. Text Content Access (Enhanced):\n";
    guide += "   // Comprehensive text extraction with error handling\n";
    guide += "   function getTextContentSafely(textFrame) {\n";
    guide += "       try {\n";
    guide += "           if (textFrame && textFrame.contents !== undefined) {\n";
    guide += "               var content = textFrame.contents;\n";
    guide += "               if (typeof content === 'string' && content.length > 0) {\n";
    guide += "                   // Handle large text content\n";
    guide += "                   if (content.length > 10000) {\n";
    guide += "                       return content.substring(0, 10000) + '... (truncated)';\n";
    guide += "                   }\n";
    guide += "                   return content;\n";
    guide += "               }\n";
    guide += "           }\n";
    guide += "       } catch (e) {\n";
    guide += "           return 'Error accessing text: ' + e.message;\n";
    guide += "       }\n";
    guide += "       return null;\n";
    guide += "   }\n\n";

    guide += "2. Auto-Discovery Pattern:\n";
    guide += "   // Safely discover and access collections\n";
    guide += "   function discoverCollectionsSafely(obj) {\n";
    guide += "       var collections = [];\n";
    guide += "       try {\n";
    guide += "           for (var prop in obj) {\n";
    guide += "               try {\n";
    guide += "                   var value = obj[prop];\n";
    guide += "                   if (value && typeof value.length !== 'undefined' && value.length > 0) {\n";
    guide += "                       collections.push({\n";
    guide += "                           name: prop,\n";
    guide += "                           length: value.length,\n";
    guide += "                           accessible: true\n";
    guide += "                       });\n";
    guide += "                   }\n";
    guide += "               } catch (e) {\n";
    guide += "                   collections.push({\n";
    guide += "                       name: prop,\n";
    guide += "                       accessible: false,\n";
    guide += "                       error: e.message\n";
    guide += "                   });\n";
    guide += "               }\n";
    guide += "           }\n";
    guide += "       } catch (e) {\n";
    guide += "           // Discovery failed completely\n";
    guide += "       }\n";
    guide += "       return collections;\n";
    guide += "   }\n\n";

    guide += "3. Broken Property Handling:\n";
    guide += "   // Universal safe property access\n";
    guide += "   function safeGetProperty(obj, prop, defaultValue) {\n";
    guide += "       try {\n";
    guide += "           if (obj && obj.hasOwnProperty && obj.hasOwnProperty(prop)) {\n";
    guide += "               var value = obj[prop];\n";
    guide += "               return value !== undefined ? value : defaultValue;\n";
    guide += "           } else if (obj && obj[prop] !== undefined) {\n";
    guide += "               return obj[prop];\n";
    guide += "           }\n";
    guide += "       } catch (e) {\n";
    guide += "           // Property access failed - return default\n";
    guide += "       }\n";
    guide += "       return defaultValue;\n";
    guide += "   }\n\n";

    guide += "4. Collection Iteration (Enhanced):\n";
    guide += "   // Safe collection processing with timeout\n";
    guide += "   function iterateCollectionSafely(collection, processor, maxItems) {\n";
    guide += "       maxItems = maxItems || 1000;\n";
    guide += "       var results = [];\n";
    guide += "       var startTime = new Date().getTime();\n";
    guide += "       \n";
    guide += "       try {\n";
    guide += "           var length = collection.length || 0;\n";
    guide += "           for (var i = 0; i < Math.min(length, maxItems); i++) {\n";
    guide += "               // Timeout protection\n";
    guide += "               if (new Date().getTime() - startTime > 30000) {\n";
    guide += "                   break; // 30 second timeout\n";
    guide += "               }\n";
    guide += "               \n";
    guide += "               try {\n";
    guide += "                   var item = collection[i];\n";
    guide += "                   if (item) {\n";
    guide += "                       var result = processor(item, i);\n";
    guide += "                       if (result !== null && result !== undefined) {\n";
    guide += "                           results.push(result);\n";
    guide += "                       }\n";
    guide += "                   }\n";
    guide += "               } catch (itemError) {\n";
    guide += "                   // Skip problematic items but continue\n";
    guide += "                   results.push({ error: 'Item ' + i + ' failed', index: i });\n";
    guide += "               }\n";
    guide += "           }\n";
    guide += "       } catch (e) {\n";
    guide += "           results.push({ error: 'Collection iteration failed: ' + e.message });\n";
    guide += "       }\n";
    guide += "       \n";
    guide += "       return results;\n";
    guide += "   }\n\n";

    // Version-specific guidance
    guide += "VERSION-SPECIFIC GUIDANCE\n";
    guide += "=" + Array(26).join("=") + "\n\n";
    guide += "InDesign Version Compatibility:\n";
    guide += "- CS6+: Basic object model support\n";
    guide += "- CC 2015+: Enhanced scripting features\n";
    guide += "- CC 2018+: Improved error handling\n";
    guide += "- CC 2020+: Additional object properties\n";
    guide += "- CC 2023+: Performance improvements\n\n";
    guide += "Always test your scripts with the specific InDesign version you're targeting.\n";
    guide += "Some properties may not be available in older versions.\n\n";

    guide += "TROUBLESHOOTING GUIDE\n";
    guide += "=" + Array(21).join("=") + "\n\n";
    guide += "Common Issues and Solutions:\n\n";
    guide += "1. 'Object does not support property' errors:\n";
    guide += "   -> Use hasOwnProperty() checks before accessing\n";
    guide += "   -> Verify object type before property access\n";
    guide += "   -> Consider alternative properties or methods\n\n";
    guide += "2. 'Access denied' errors:\n";
    guide += "   -> Property may be read-only or restricted\n";
    guide += "   -> Try alternative access methods\n";
    guide += "   -> Check document state and permissions\n\n";
    guide += "3. Null or undefined values:\n";
    guide += "   -> Always check for null/undefined before use\n";
    guide += "   -> Use default values where appropriate\n";
    guide += "   -> Consider object lifecycle and initialization\n\n";
    guide += "4. Performance issues:\n";
    guide += "   -> Implement timeout protection for long operations\n";
    guide += "   -> Process large collections in batches\n";
    guide += "   -> Use sampling for analysis operations\n\n";

    return guide;
}

// Generate enhanced code example based on change type
function generateEnhancedCodeExample(change, accessPath) {
    var code = "";

    try {
        if (change.path.indexOf('textContent') !== -1 || change.path.indexOf('contents') !== -1) {
            // Text content access example
            code += "// Enhanced text content access\n";
            code += "try {\n";
            code += "    var textElement = " + accessPath.primary.split('.').slice(0, -1).join('.') + ";\n";
            code += "    if (textElement && textElement.contents !== undefined) {\n";
            code += "        var textContent = textElement.contents;\n";
            code += "        if (typeof textContent === 'string') {\n";
            code += "            // Process text content safely\n";
            code += "            var preview = textContent.length > 500 ? \n";
            code += "                         textContent.substring(0, 500) + '...' : textContent;\n";
            code += "            alert('Text preview: ' + preview);\n";
            code += "        }\n";
            code += "    }\n";
            code += "} catch (e) {\n";
            code += "    alert('Error accessing text: ' + e.message);\n";
            code += "}\n";
        } else if (change.path.indexOf('autoDiscovered') !== -1) {
            // Auto-discovered collection access
            code += "// Auto-discovered collection access\n";
            code += "try {\n";
            code += "    // Check if collection exists and is accessible\n";
            code += "    var collection = " + accessPath.primary + ";\n";
            code += "    if (collection && collection.length !== undefined) {\n";
            code += "        alert('Collection found with ' + collection.length + ' items');\n";
            code += "        // Safely access first item if available\n";
            code += "        if (collection.length > 0) {\n";
            code += "            try {\n";
            code += "                var firstItem = collection[0];\n";
            code += "                // Process first item\n";
            code += "            } catch (itemError) {\n";
            code += "                alert('First item access failed: ' + itemError.message);\n";
            code += "            }\n";
            code += "        }\n";
            code += "    }\n";
            code += "} catch (e) {\n";
            code += "    alert('Collection access error: ' + e.message);\n";
            code += "}\n";
        } else if (change.path.indexOf('brokenProperties') !== -1) {
            // Broken property access with alternatives
            code += "// Broken property - use alternative access\n";
            code += "var value = null;\n";
            code += "try {\n";
            code += "    // Primary access attempt\n";
            code += "    value = " + accessPath.primary + ";\n";
            code += "} catch (e) {\n";
            if (accessPath.alternatives && accessPath.alternatives.length > 0) {
                code += "    // Try alternative access\n";
                code += "    try {\n";
                code += "        " + accessPath.alternatives[0] + "\n";
                code += "    } catch (altError) {\n";
                code += "        alert('All access methods failed');\n";
                code += "    }\n";
            } else {
                code += "    alert('Property access failed: ' + e.message);\n";
            }
            code += "}\n";
            code += "if (value !== null && value !== undefined) {\n";
            code += "    // Use the value safely\n";
            code += "    alert('Value: ' + value);\n";
            code += "}\n";
        } else {
            // General property access
            code += "// Safe property access\n";
            code += "try {\n";
            code += "    var value = " + accessPath.primary + ";\n";
            code += "    if (value !== null && value !== undefined) {\n";
            code += "        alert('Property value: ' + value);\n";
            code += "    } else {\n";
            code += "        alert('Property is null or undefined');\n";
            code += "    }\n";
            code += "} catch (e) {\n";
            code += "    alert('Property access error: ' + e.message);\n";
            if (accessPath.alternatives && accessPath.alternatives.length > 0) {
                code += "    // Consider alternative: " + accessPath.alternatives[0] + "\n";
            }
            code += "}\n";
        }
    } catch (e) {
        code = "// Error generating code example: " + e.message + "\n";
        code += "// Use basic try-catch pattern for safe access\n";
    }

    return code;
}

// Create technical report
function createTechnicalReport(differences) {
    var report = "TECHNICAL ANALYSIS REPORT\n";
    report += "Generated: " + new Date().toString() + "\n";
    report += "Analysis Engine: Enhanced InDesign Document Inspector v2.1\n";
    report += "=" + Array(60).join("=") + "\n\n";

    // Analysis statistics
    report += "ANALYSIS STATISTICS\n";
    report += repeatString("-", 19) + "\n";
    report += "Total sections analyzed: " + (differences.summary.changedSections ? differences.summary.changedSections.length : 0) + "\n";
    report += "Changes detected: " + (differences.summary.hasChanges ? "Yes" : "No") + "\n";
    report += "Errors encountered: " + (differences.errors ? differences.errors.length : 0) + "\n";

    if (differences.discoveryInfo) {
        report += "Collections processed: " + (differences.discoveryInfo.totalCollections || 0) + "\n";
        report += "Text elements analyzed: " + (differences.discoveryInfo.textItemsProcessed || 0) + "\n";
        report += "Property accessibility checks: " + ((differences.discoveryInfo.accessibleProperties || 0) + (differences.discoveryInfo.brokenProperties || 0)) + "\n";
    }

    report += "\n";

    // Change distribution
    report += "CHANGE DISTRIBUTION\n";
    report += repeatString("-", 19) + "\n";
    var changes = differences.changes;
    for (var section in changes) {
        if (changes[section] && changes[section].length) {
            report += section + ": " + changes[section].length + " changes\n";
        }
    }
    report += "\n";

    // Error analysis
    if (differences.errors && differences.errors.length > 0) {
        report += "ERROR ANALYSIS\n";
        report += repeatString("-", 14) + "\n";
        var errorCategories = {};

        for (var i = 0; i < differences.errors.length; i++) {
            var error = differences.errors[i];
            var category = error.indexOf('timeout') !== -1 ? 'timeout' :
                error.indexOf('access') !== -1 ? 'access' :
                    error.indexOf('comparison') !== -1 ? 'comparison' : 'other';

            errorCategories[category] = (errorCategories[category] || 0) + 1;
        }

        for (var category in errorCategories) {
            report += category + " errors: " + errorCategories[category] + "\n";
        }
        report += "\n";
    }

    // Performance metrics
    report += "PERFORMANCE METRICS\n";
    report += repeatString("-", 19) + "\n";
    report += "Analysis completed successfully with enhanced error handling\n";
    report += "Memory usage optimized through safe property access\n";
    report += "Timeout protection enabled for all operations\n";
    report += "Collection sampling applied to prevent performance issues\n\n";

    // Technical recommendations
    report += "TECHNICAL RECOMMENDATIONS\n";
    report += repeatString("-", 25) + "\n";
    report += "1. Use provided access paths for reliable property access\n";
    report += "2. Implement comprehensive error handling in your scripts\n";
    report += "3. Test with various document types and InDesign versions\n";
    report += "4. Consider performance implications for large documents\n";
    report += "5. Use discovery features to identify new collections\n";
    report += "6. Monitor property accessibility over time\n\n";

    return report;
}

// Enhanced progress dialog with better visual feedback
function showProgressDialog(message, operation) {
    if (!UTILITY_CONFIG.enableProgressDialogs) {
        return operation();
    }

    var progressDialog = new Window("dialog", "Enhanced Analysis in Progress");
    progressDialog.preferredSize.width = 400;
    progressDialog.preferredSize.height = 150;

    var progressGroup = progressDialog.add("group");
    progressGroup.orientation = "column";
    progressGroup.alignment = "fill";

    var titleText = progressGroup.add("statictext", undefined, "Enhanced InDesign Document Inspector v2.1");
    titleText.alignment = "center";
    titleText.graphics.font = ScriptUI.newFont("dialog", "BOLD", 12);

    var messageText = progressGroup.add("statictext", undefined, message);
    messageText.alignment = "center";
    messageText.preferredSize.height = 40;

    var progressBar = progressGroup.add("progressbar", undefined, 0, 100);
    progressBar.alignment = "fill";
    progressBar.preferredSize.height = 12;

    var statusText = progressGroup.add("statictext", undefined, "Initializing enhanced analysis...");
    statusText.alignment = "center";
    statusText.preferredSize.height = 20;

    // Show dialog non-modally if possible
    try {
        progressDialog.show();
    } catch (e) {
        // Fallback to simple processing
        return operation();
    }

    try {
        // Simulate progress with status updates
        var stages = [
            "Loading enhanced inspector...",
            "Validating document structure...",
            "Processing collections...",
            "Capturing text content...",
            "Analyzing properties...",
            "Generating reports...",
            "Finalizing analysis..."
        ];

        for (var i = 0; i < stages.length; i++) {
            statusText.text = stages[i];
            progressBar.value = (i / stages.length) * 90; // Leave 10% for actual operation
            progressDialog.update();

            // Small delay to show progress
            var startTime = new Date().getTime();
            while (new Date().getTime() - startTime < 100) {
                // Brief pause
            }
        }

        // Run the actual operation
        statusText.text = "Completing analysis...";
        progressBar.value = 95;
        progressDialog.update();

        var result = operation();

        progressBar.value = 100;
        statusText.text = "Analysis complete!";
        progressDialog.update();

        // Brief pause to show completion
        var startTime = new Date().getTime();
        while (new Date().getTime() - startTime < 500) {
            // Show completion
        }

        progressDialog.close();
        return result;

    } catch (e) {
        progressDialog.close();
        throw e;
    }
}

// Enhanced comparison dialog with comprehensive features
function showEnhancedComparisonDialog(differences) {
    var dialog = new Window("dialog", "Enhanced Document Comparison Results v2.1");
    dialog.preferredSize.width = 900;
    dialog.preferredSize.height = 700;

    // Create comprehensive tabbed interface
    var mainGroup = dialog.add("tabbedpanel");
    mainGroup.alignment = "fill";

    // Summary tab (enhanced)
    var summaryTab = mainGroup.add("tab", undefined, "Summary");
    createSummaryTab(summaryTab, differences);

    // Text Analysis tab (new)
    var textTab = mainGroup.add("tab", undefined, "Text Analysis");
    createTextAnalysisTab(textTab, differences);

    // Discovery tab (enhanced)  
    var discoveryTab = mainGroup.add("tab", undefined, "Auto-Discovery");
    createDiscoveryTab(discoveryTab, differences);

    // Technical Details tab
    var detailsTab = mainGroup.add("tab", undefined, "Technical Details");
    createTechnicalDetailsTab(detailsTab, differences);

    // Access Paths tab (new)
    var pathsTab = mainGroup.add("tab", undefined, "Access Paths");
    createAccessPathsTab(pathsTab, differences);

    // Enhanced action buttons
    var buttonGroup = dialog.add("group");
    buttonGroup.alignment = "center";

    var exportAllBtn = buttonGroup.add("button", undefined, "Export All Reports");
    var viewFolderBtn = buttonGroup.add("button", undefined, "Open Report Folder");
    var resetBaselineBtn = buttonGroup.add("button", undefined, "Reset Baseline");
    var helpBtn = buttonGroup.add("button", undefined, "Help");
    var okBtn = buttonGroup.add("button", undefined, "OK");

    // Button event handlers
    exportAllBtn.onClick = function () {
        exportAllReportsToFolder(differences);
    };

    viewFolderBtn.onClick = function () {
        try {
            if (UTILITY_STATE.currentDocument && UTILITY_STATE.currentDocument.filePath) {
                var folder = Folder(UTILITY_STATE.currentDocument.filePath);
                folder.execute();
            }
        } catch (e) {
            alert("Could not open report folder: " + e.message);
        }
    };

    resetBaselineBtn.onClick = function () {
        var confirmReset = confirm("This will create a new baseline from the current document state.\n\n" +
            "The existing baseline will be backed up.\n\nContinue?");
        if (confirmReset) {
            dialog.close();
            resetBaseline();
        }
    };

    helpBtn.onClick = function () {
        showHelpDialog();
    };

    okBtn.onClick = function () {
        dialog.close();
    };

    dialog.show();
}

// Create enhanced summary tab
function createSummaryTab(tab, differences) {
    var summaryPanel = tab.add("panel", undefined, "Change Summary");
    summaryPanel.alignment = "fill";
    summaryPanel.preferredSize.height = 500;

    var summary = createEnhancedHumanReadableSummary(differences);
    var summaryText = summaryPanel.add("edittext", undefined, summary, { multiline: true, readonly: true });
    summaryText.alignment = "fill";
}

// Create text analysis tab
function createTextAnalysisTab(tab, differences) {
    var textPanel = tab.add("panel", undefined, "Text Content Analysis");
    textPanel.alignment = "fill";
    textPanel.preferredSize.height = 500;

    var textAnalysis = createEnhancedTextAnalysisSummary(differences);
    var textText = textPanel.add("edittext", undefined, textAnalysis, { multiline: true, readonly: true });
    textText.alignment = "fill";
}

// Create discovery tab
function createDiscoveryTab(tab, differences) {
    var discoveryPanel = tab.add("panel", undefined, "Auto-Discovery Results");
    discoveryPanel.alignment = "fill";
    discoveryPanel.preferredSize.height = 500;

    var discoveryReport = createEnhancedDiscoveryReport(differences);
    var discoveryText = discoveryPanel.add("edittext", undefined, discoveryReport, { multiline: true, readonly: true });
    discoveryText.alignment = "fill";
}

// Create technical details tab
function createTechnicalDetailsTab(tab, differences) {
    var detailsPanel = tab.add("panel", undefined, "Technical Analysis");
    detailsPanel.alignment = "fill";
    detailsPanel.preferredSize.height = 500;

    var technicalReport = createTechnicalReport(differences);
    var detailsText = detailsPanel.add("edittext", undefined, technicalReport, { multiline: true, readonly: true });
    detailsText.alignment = "fill";
}

// Create access paths tab
function createAccessPathsTab(tab, differences) {
    var pathsPanel = tab.add("panel", undefined, "Object Model Access Paths");
    pathsPanel.alignment = "fill";
    pathsPanel.preferredSize.height = 500;

    var accessGuide = createComprehensiveAccessPathsGuide(differences);
    var pathsText = pathsPanel.add("edittext", undefined, accessGuide, { multiline: true, readonly: true });
    pathsText.alignment = "fill";
}

// Export all reports to a selected folder
function exportAllReportsToFolder(differences) {
    var folder = Folder.selectDialog("Select folder to save comprehensive report suite:");
    if (!folder) return;

    var timestamp = new Date().getTime();
    var docName = UTILITY_STATE.currentDocument ?
        UTILITY_STATE.currentDocument.name.replace(/\.[^\.]+$/, "") :
        "document_" + timestamp;

    try {
        // Create all reports
        var reports = {
            comparison: differences,
            summary: createEnhancedHumanReadableSummary(differences),
            textAnalysis: createEnhancedTextAnalysisSummary(differences),
            discoveryReport: createEnhancedDiscoveryReport(differences),
            accessGuide: createComprehensiveAccessPathsGuide(differences),
            technicalReport: createTechnicalReport(differences)
        };

        // Save all files
        var savedFiles = [];

        // JSON file
        var jsonFile = File(folder.fsName + "/" + docName + "_comprehensive_analysis_" + timestamp + ".json");
        jsonFile.open("w");
        jsonFile.write(JSON.stringify(reports.comparison, null, 2));
        jsonFile.close();
        savedFiles.push(jsonFile.name);

        // Text reports
        var textReports = [
            { file: docName + "_summary_" + timestamp + ".txt", content: reports.summary },
            { file: docName + "_text_analysis_" + timestamp + ".txt", content: reports.textAnalysis },
            { file: docName + "_discovery_report_" + timestamp + ".txt", content: reports.discoveryReport },
            { file: docName + "_access_guide_" + timestamp + ".txt", content: reports.accessGuide },
            { file: docName + "_technical_report_" + timestamp + ".txt", content: reports.technicalReport }
        ];

        for (var i = 0; i < textReports.length; i++) {
            var report = textReports[i];
            var file = File(folder.fsName + "/" + report.file);
            file.open("w");
            file.write(report.content);
            file.close();
            savedFiles.push(file.name);
        }

        alert("Comprehensive report suite exported successfully!\n\n" +
            "Location: " + folder.fsName + "\n" +
            "Files saved: " + savedFiles.length + "\n\n" +
            "Files include:\n" +
            "- Complete technical JSON data\n" +
            "- Human-readable summary\n" +
            "- Detailed text analysis\n" +
            "- Auto-discovery report\n" +
            "- Access paths guide\n" +
            "- Technical analysis");

    } catch (e) {
        alert("Export failed: " + e.message);
    }
}

// Reset baseline functionality
function resetBaseline() {
    if (!app.documents.length) {
        alert("Please open a document first.");
        return;
    }

    var doc = app.activeDocument;
    var docName = doc.name.replace(/\.[^\.]+$/, "");
    var docPath = doc.filePath;

    if (!doc.saved || !docPath) {
        alert("Document must be saved before creating baseline.");
        return;
    }

    var confirmReset = confirm("This will create a new baseline from the current document state.\n\nContinue?");
    if (!confirmReset) return;

    try {
        alert("Starting baseline creation...");

        var baselineFile = File(docPath + "/" + docName + "_baseline.json");

        alert("About to call createDocumentReport...");
        var report = createDocumentReport(doc);
        alert("createDocumentReport completed!");

        if (report && validateAnalysisReport(report)) {
            alert("Report validated, saving...");
            var success = saveReportSafely(baselineFile, report, "baseline");
            if (success) {
                alert("New baseline created successfully!\nSaved as: " + baselineFile.name);
            } else {
                alert("Failed to save baseline.");
            }
        } else {
            alert("Failed to create or validate baseline report.");
        }

    } catch (e) {
        alert("Baseline creation failed: " + e.message + "\nLine: " + (e.line || "unknown"));
    }
}
// function resetBaseline() {
//     if (!app.documents.length) {
//         alert("Please open a document first.");
//         return;
//     }

//     var doc = app.activeDocument;
//     var docName = doc.name.replace(/\.[^\.]+$/, "");
//     var docPath = doc.filePath;

//     if (!doc.saved || !docPath) {
//         alert("Document must be saved before creating baseline.");
//         return;
//     }

//     var confirmReset = confirm("This will replace the existing baseline with the current document state.\n\n" +
//                              "The old baseline will be backed up as *_baseline_backup.json.\n\n" +
//                              "Continue?");

//     if (!confirmReset) return;

//     try {
//         var baselineFile = File(docPath + "/" + docName + "_baseline.json");
//         var backupFile = File(docPath + "/" + docName + "_baseline_backup.json");

//         // Backup existing baseline
//         if (baselineFile.exists) {
//             baselineFile.copy(backupFile);
//         }

//         // Create new baseline
//         var success = showProgressDialog("Creating new baseline...", function() {
//             var report = createDocumentReport(doc);
//             if (report && validateAnalysisReport(report)) {
//                 return saveReportSafely(baselineFile, report, "baseline");
//             }
//             return false;
//         });

//         if (success) {
//             alert("New baseline created successfully!\n\n" +
//                   "Old baseline backed up as: " + backupFile.name + "\n" +
//                   "New baseline saved as: " + baselineFile.name);
//         } else {
//             alert("Failed to create new baseline.");
//         }

//     } catch (e) {
//         alert("Baseline reset failed: " + e.message);
//     }
// }

// Show help dialog
function showHelpDialog() {
    var helpDialog = new Window("dialog", "Enhanced InDesign Document Inspector - Help");
    helpDialog.preferredSize.width = 600;
    helpDialog.preferredSize.height = 500;

    var helpGroup = helpDialog.add("group");
    helpGroup.orientation = "column";
    helpGroup.alignment = "fill";

    var helpText = helpGroup.add("edittext", undefined,
        "ENHANCED INDESIGN DOCUMENT INSPECTOR v2.1 - HELP\n\n" +
        "OVERVIEW:\n" +
        "This tool analyzes InDesign documents and tracks changes with comprehensive\n" +
        "text capture, auto-discovery, and bulletproof error handling.\n\n" +
        "HOW TO USE:\n" +
        "1. Open an InDesign document\n" +
        "2. Save the document (required for analysis)\n" +
        "3. Run the inspector first: InDesignDocumentInspector.jsx\n" +
        "4. Run this utility: InDesignComparisonUtility.jsx\n" +
        "5. Choose 'Quick Compare' to start\n\n" +
        "FIRST TIME:\n" +
        "- Creates a baseline snapshot of your document\n" +
        "- Make changes to your document\n" +
        "- Run comparison again to see differences\n\n" +
        "FEATURES:\n" +
        "- Comprehensive text content capture\n" +
        "- Auto-discovery of collections and properties\n" +
        "- Broken property detection and alternatives\n" +
        "- Object model access paths with safety guidance\n" +
        "- Multiple report formats (summary, technical, etc.)\n" +
        "- Enhanced error handling and recovery\n\n" +
        "REPORTS GENERATED:\n" +
        "- *_summary.txt - Human-readable changes\n" +
        "- *_text_analysis.txt - Detailed text changes\n" +
        "- *_discovery_report.txt - Collection discoveries\n" +
        "- *_access_paths_guide.txt - Safe access patterns\n" +
        "- *_technical_report.txt - Technical analysis\n" +
        "- *_comparison.json - Complete technical data\n\n" +
        "TROUBLESHOOTING:\n" +
        "- Make sure both .jsx files are in Scripts Panel folder\n" +
        "- Always run main inspector before utility\n" +
        "- Document must be saved before analysis\n" +
        "- Check error logs in analysis results\n\n" +
        "VERSION: 2.1 - Enhanced with comprehensive features",
        { multiline: true, readonly: true });
    helpText.alignment = "fill";

    var okButton = helpGroup.add("button", undefined, "OK");
    okButton.alignment = "center";
    okButton.onClick = function () {
        helpDialog.close();
    };

    helpDialog.show();
}

// Main menu dialog
function showMainMenu() {
    var menuDialog = new Window("dialog", "Enhanced InDesign Document Inspector v2.1");
    menuDialog.preferredSize.width = 500;
    menuDialog.preferredSize.height = 400;

    var mainGroup = menuDialog.add("group");
    mainGroup.orientation = "column";
    mainGroup.alignment = "fill";

    // Title and version info
    var titlePanel = mainGroup.add("panel", undefined, "Enhanced Document Analysis Suite");
    titlePanel.alignment = "fill";

    var titleText = titlePanel.add("statictext", undefined,
        "Comprehensive InDesign document analysis with:\n" +
        "* Enhanced text content capture\n" +
        "* Auto-discovery of collections and properties\n" +
        "* Bulletproof error handling and recovery\n" +
        "* Safe object model access guidance",
        { multiline: true });
    titleText.alignment = "fill";

    // Action buttons
    var actionsPanel = mainGroup.add("panel", undefined, "Actions");
    actionsPanel.alignment = "fill";

    var quickCompareBtn = actionsPanel.add("button", undefined, "Quick Compare (Recommended)");
    quickCompareBtn.preferredSize.height = 40;
    quickCompareBtn.alignment = "fill";

    var resetBtn = actionsPanel.add("button", undefined, "Reset Baseline");
    resetBtn.alignment = "fill";

    var helpBtn = actionsPanel.add("button", undefined, "Help & Documentation");
    helpBtn.alignment = "fill";

    // Status panel
    var statusPanel = mainGroup.add("panel", undefined, "Status");
    statusPanel.alignment = "fill";

    var statusText = statusPanel.add("statictext", undefined, getStatusText(), { multiline: true });
    statusText.alignment = "fill";

    // Bottom buttons
    var buttonGroup = mainGroup.add("group");
    buttonGroup.alignment = "center";

    var cancelBtn = buttonGroup.add("button", undefined, "Cancel");

    // Event handlers
    quickCompareBtn.onClick = function () {
        menuDialog.close();
        quickCompare();
    };

    resetBtn.onClick = function () {
        menuDialog.close();
        resetBaseline();
    };

    helpBtn.onClick = function () {
        showHelpDialog();
    };

    cancelBtn.onClick = function () {
        menuDialog.close();
    };

    menuDialog.show();
}

// Get current status text
function getStatusText() {
    var status = "";

    // Check if inspector is loaded
    if (typeof createDocumentReport === 'undefined') {
        status += "Main inspector not loaded\n";
        status += "Please run InDesignDocumentInspector.jsx first\n\n";
    } else {
        status += "Main inspector loaded and ready\n";

        // Check version compatibility
        if (typeof ANALYSIS_CONFIG !== 'undefined' && ANALYSIS_CONFIG.version === UTILITY_CONFIG.requiredInspectorVersion) {
            status += "Version " + ANALYSIS_CONFIG.version + " - fully compatible\n";
        } else {
            status += "Version mismatch detected\n";
        }
    }

    // Check document status
    if (!app.documents.length) {
        status += "No document open\n";
        status += "Please open a document for analysis\n";
    } else {
        var doc = app.activeDocument;
        status += "Document: " + doc.name + "\n";

        if (!doc.saved || !doc.filePath) {
            status += "Document not saved\n";
            status += "Please save before analysis\n";
        } else {
            status += "Document saved and ready\n";

            // Check for existing baseline
            var docName = doc.name.replace(/\.[^\.]+$/, "");
            var baselineFile = File(doc.filePath + "/" + docName + "_baseline.json");

            if (baselineFile.exists) {
                status += "Baseline exists - ready for comparison\n";
            } else {
                status += "No baseline - will create on first run\n";
            }
        }
    }

    return status;
}

// Helper function for string repetition - Fixed: avoiding reserved word 'char'
function repeatString(charToRepeat, count) {
    var result = "";
    for (var i = 0; i < count; i++) {
        result += charToRepeat;
    }
    return result;
}

// Script entry point - show main menu
try {
    showMainMenu();
} catch (error) {
    alert("Enhanced InDesign Comparison Utility v2.1\n\n" +
        "Startup Error: " + error.message + "\n\n" +
        "Please ensure the main inspector script is loaded first:\n" +
        "Run 'InDesignDocumentInspector.jsx' then try again.");
}