// ============================================================================
// CHUNK 5: ENHANCED MAIN INTERFACE & ENTRY POINT - COMPLETE MODE INTEGRATION
// ES3 COMPATIBLE VERSION - COMPREHENSIVE MODE SYSTEM WITH UI INTEGRATION
// ============================================================================

// ============================================================================
// DOCUMENT CAPABILITY DETECTION FOR UI
// ============================================================================

// UI-friendly document capability detection
function detectDocumentCapabilitiesForUI(doc) {
    enhancedStatusLog("UI_CAPABILITY", "Starting UI capability detection", 0, 5, "Testing document for UI recommendations");
    
    var uiCapabilities = {
        timestamp: toISOString(new Date()),
        documentName: safeGetProperty(doc, 'name', 'Unknown Document'),
        overallStatus: "unknown",
        recommendedMode: "emergency",
        canProceedWithAnalysis: false,
        userMessage: "",
        detailedResults: null,
        warnings: [],
        recommendations: []
    };
    
    try {
        if (!doc) {
            uiCapabilities.overallStatus = "no_document";
            uiCapabilities.userMessage = "No document is currently open";
            uiCapabilities.recommendations.push("Please open a document in InDesign");
            return uiCapabilities;
        }
        
        enhancedStatusLog("UI_CAPABILITY", "Running detailed capability detection", 2, 5, "Comprehensive document testing");
        
        // Run full capability detection
        var capabilities = detectDocumentCapabilities(doc);
        uiCapabilities.detailedResults = capabilities;
        
        // Translate technical results to user-friendly information
        if (capabilities.overallSafety === "safe") {
            uiCapabilities.overallStatus = "excellent";
            uiCapabilities.canProceedWithAnalysis = true;
            uiCapabilities.userMessage = "Document is in excellent condition for analysis";
            uiCapabilities.recommendedMode = capabilities.recommendedMode;
            uiCapabilities.recommendations.push("All analysis modes should work well");
            uiCapabilities.recommendations.push("Recommended: " + capabilities.recommendedMode + " mode or higher");
        } else if (capabilities.overallSafety === "moderate") {
            uiCapabilities.overallStatus = "good";
            uiCapabilities.canProceedWithAnalysis = true;
            uiCapabilities.userMessage = "Document is stable for analysis with some limitations";
            uiCapabilities.recommendedMode = capabilities.recommendedMode;
            uiCapabilities.recommendations.push("Use " + capabilities.recommendedMode + " mode or lower for safety");
            uiCapabilities.recommendations.push("Higher modes may work but proceed with caution");
        } else if (capabilities.overallSafety === "risky") {
            uiCapabilities.overallStatus = "limited";
            uiCapabilities.canProceedWithAnalysis = true;
            uiCapabilities.userMessage = "Document has some issues - use safe modes only";
            uiCapabilities.recommendedMode = capabilities.recommendedMode;
            uiCapabilities.warnings.push("Document may have performance or compatibility issues");
            uiCapabilities.recommendations.push("Start with " + capabilities.recommendedMode + " mode");
            uiCapabilities.recommendations.push("Avoid comprehensive mode");
        } else {
            uiCapabilities.overallStatus = "problematic";
            uiCapabilities.canProceedWithAnalysis = false;
            uiCapabilities.userMessage = "Document has serious issues - emergency mode only";
            uiCapabilities.recommendedMode = "emergency";
            uiCapabilities.warnings.push("Document may be corrupted or incompatible");
            uiCapabilities.recommendations.push("Use emergency mode only");
            uiCapabilities.recommendations.push("Consider manual inspection of the document");
        }
        
        // Add specific warnings based on failed tests
        if (capabilities.errors && capabilities.errors.length > 0) {
            uiCapabilities.warnings.push("Capability testing encountered " + capabilities.errors.length + " errors");
        }
        
        enhancedStatusLog("UI_CAPABILITY", "UI capability detection completed", 5, 5, 
            "Status: " + uiCapabilities.overallStatus + ", Mode: " + uiCapabilities.recommendedMode);
        
    } catch (exc) {
        uiCapabilities.overallStatus = "error";
        uiCapabilities.canProceedWithAnalysis = false;
        uiCapabilities.userMessage = "Capability detection failed: " + exc.message;
        uiCapabilities.recommendedMode = "emergency";
        uiCapabilities.warnings.push("Capability detection system failed");
        uiCapabilities.recommendations.push("Try emergency mode with extreme caution");
        enhancedStatusLog("UI_CAPABILITY", "Capability detection failed", 5, 5, "Error: " + exc.message);
    }
    
    return uiCapabilities;
}

// Auto-recommend safe mode for document
function recommendModeForDocument(doc) {
    try {
        enhancedStatusLog("MODE_RECOMMEND", "Generating mode recommendation", 0, 3, "Analyzing document characteristics");
        
        if (!doc) {
            return {
                recommendedMode: "emergency",
                confidence: "high",
                reason: "No document available",
                alternatives: []
            };
        }
        
        var capabilities = detectDocumentCapabilitiesForUI(doc);
        
        var recommendation = {
            recommendedMode: capabilities.recommendedMode,
            confidence: "high",
            reason: "",
            alternatives: [],
            warnings: capabilities.warnings,
            canAnalyze: capabilities.canProceedWithAnalysis
        };
        
        // Generate detailed reasoning
        switch (capabilities.overallStatus) {
            case "excellent":
                recommendation.reason = "Document is highly compatible - all modes should work well";
                recommendation.alternatives = ["standard", "comprehensive"];
                break;
            case "good":
                recommendation.reason = "Document is stable with minor limitations";
                recommendation.alternatives = [capabilities.recommendedMode];
                if (capabilities.recommendedMode !== "basic") {
                    recommendation.alternatives.push("basic");
                }
                break;
            case "limited":
                recommendation.reason = "Document has some compatibility issues - safe modes only";
                recommendation.alternatives = ["minimal", "basic"];
                recommendation.confidence = "medium";
                break;
            case "problematic":
                recommendation.reason = "Document has serious issues - emergency mode for safety";
                recommendation.alternatives = [];
                recommendation.confidence = "high";
                break;
            default:
                recommendation.reason = "Unable to determine document compatibility";
                recommendation.alternatives = ["emergency"];
                recommendation.confidence = "low";
        }
        
        enhancedStatusLog("MODE_RECOMMEND", "Mode recommendation completed", 3, 3, 
            "Recommended: " + recommendation.recommendedMode + " (confidence: " + recommendation.confidence + ")");
        
        return recommendation;
        
    } catch (exc) {
        debugLog("Mode recommendation failed: " + exc.message, "ERROR");
        return {
            recommendedMode: "emergency",
            confidence: "high",
            reason: "Recommendation system failed - using safest mode",
            alternatives: [],
            warnings: ["Mode recommendation system encountered an error"],
            canAnalyze: false
        };
    }
}

// ============================================================================
// ENHANCED MODE SELECTION DIALOG
// ============================================================================

// Show enhanced mode selection dialog with recommendations
function showModeSelectionDialog(doc) {
    enhancedStatusLog("UI_MODE", "Showing enhanced mode selection", 0, 1, "Mode selection with capability detection");
    
    var dialog = new Window("dialog", "Enhanced Analysis Mode Selection");
    dialog.preferredSize.width = 650;
    dialog.preferredSize.height = 600;
    
    var mainGroup = dialog.add("group");
    mainGroup.orientation = "column";
    mainGroup.alignment = "fill";
    
    // Document capability panel
    var capabilityPanel = mainGroup.add("panel", undefined, "Document Analysis & Recommendations");
    capabilityPanel.alignment = "fill";
    capabilityPanel.preferredSize.height = 150;
    
    var capabilityText = capabilityPanel.add("statictext", undefined, "Analyzing document capabilities...", {multiline: true});
    capabilityText.alignment = "fill";
    
    // Mode selection panel
    var modePanel = mainGroup.add("panel", undefined, "Analysis Mode Selection");
    modePanel.alignment = "fill";
    
    var modeGroup = modePanel.add("group");
    modeGroup.orientation = "column";
    modeGroup.alignment = "fill";
    
    // Mode radio buttons
    var modeRadios = {
        emergency: modeGroup.add("radiobutton", undefined, "EMERGENCY - Ultra-safe (properties only, 500ms timeout)"),
        minimal: modeGroup.add("radiobutton", undefined, "MINIMAL - Basic safe (limited collections, 1s timeout)"),
        basic: modeGroup.add("radiobutton", undefined, "BASIC - Moderate safe (safe collections, 3s timeout)"),
        standard: modeGroup.add("radiobutton", undefined, "STANDARD - Balanced (+ text content, 8s timeout)"),
        comprehensive: modeGroup.add("radiobutton", undefined, "COMPREHENSIVE - Complete (all features, 15s timeout)")
    };
    
    // Mode description area
    var modeDescPanel = modePanel.add("panel", undefined, "Mode Description");
    modeDescPanel.alignment = "fill";
    modeDescPanel.preferredSize.height = 120;
    
    var modeDescText = modeDescPanel.add("statictext", undefined, "", {multiline: true});
    modeDescText.alignment = "fill";
    
    // Recommendation panel
    var recPanel = mainGroup.add("panel", undefined, "Recommendations");
    recPanel.alignment = "fill";
    recPanel.preferredSize.height = 100;
    
    var recText = recPanel.add("statictext", undefined, "", {multiline: true});
    recText.alignment = "fill";
    
    // Buttons
    var buttonGroup = mainGroup.add("group");
    buttonGroup.alignment = "center";
    
    var analyzeBtn = buttonGroup.add("button", undefined, "Start Analysis");
    var cancelBtn = buttonGroup.add("button", undefined, "Cancel");
    
    // Variables for state
    var selectedMode = "basic";
    var recommendation = null;
    var capabilities = null;
    
    // Initialize with document capability detection
    try {
        capabilities = detectDocumentCapabilitiesForUI(doc);
        recommendation = recommendModeForDocument(doc);
        
        // Update capability display
        var capabilityDisplay = "DOCUMENT STATUS: " + capabilities.overallStatus.toUpperCase() + "\n";
        capabilityDisplay += "Document: " + capabilities.documentName + "\n";
        capabilityDisplay += "Message: " + capabilities.userMessage + "\n";
        
        if (capabilities.warnings.length > 0) {
            capabilityDisplay += "Warnings: " + capabilities.warnings.join(", ");
        }
        
        capabilityText.text = capabilityDisplay;
        
        // Set recommended mode as default
        selectedMode = recommendation.recommendedMode;
        setAnalysisMode(selectedMode);
        
        // Update radio button
        if (modeRadios[selectedMode]) {
            modeRadios[selectedMode].value = true;
        } else {
            modeRadios.basic.value = true; // Fallback
            selectedMode = "basic";
        }
        
        // Update descriptions
        updateModeDisplay();
        
    } catch (exc) {
        capabilityText.text = "Capability detection failed: " + exc.message + "\nProceeding with basic mode selection.";
        selectedMode = "emergency"; // Safest fallback
        modeRadios.emergency.value = true;
        updateModeDisplay();
    }
    
    // Mode selection handlers
    function updateModeDisplay() {
        // Update mode description
        modeDescText.text = getModeDescription(selectedMode);
        
        // Update recommendations
        var recDisplay = "";
        if (recommendation) {
            recDisplay = "RECOMMENDED MODE: " + recommendation.recommendedMode.toUpperCase() + "\n";
            recDisplay += "Confidence: " + recommendation.confidence + "\n";
            recDisplay += "Reason: " + recommendation.reason + "\n";
            
            if (recommendation.alternatives.length > 0) {
                recDisplay += "Alternatives: " + recommendation.alternatives.join(", ");
            }
        } else {
            recDisplay = "No specific recommendation available\nUse emergency mode for maximum safety";
        }
        
        recText.text = recDisplay;
        
        // Enable/disable analyze button based on safety
        if (capabilities && !capabilities.canProceedWithAnalysis && selectedMode !== "emergency") {
            analyzeBtn.enabled = false;
            analyzeBtn.text = "Unsafe Mode for Document";
        } else {
            analyzeBtn.enabled = true;
            analyzeBtn.text = "Start " + selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1) + " Analysis";
        }
    }
    
    // Radio button event handlers
    modeRadios.emergency.onClick = function() {
        selectedMode = "emergency";
        setAnalysisMode(selectedMode);
        updateModeDisplay();
    };
    
    modeRadios.minimal.onClick = function() {
        selectedMode = "minimal";
        setAnalysisMode(selectedMode);
        updateModeDisplay();
    };
    
    modeRadios.basic.onClick = function() {
        selectedMode = "basic";
        setAnalysisMode(selectedMode);
        updateModeDisplay();
    };
    
    modeRadios.standard.onClick = function() {
        selectedMode = "standard";
        setAnalysisMode(selectedMode);
        updateModeDisplay();
    };
    
    modeRadios.comprehensive.onClick = function() {
        selectedMode = "comprehensive";
        setAnalysisMode(selectedMode);
        updateModeDisplay();
    };
    
    // Button handlers
    analyzeBtn.onClick = function() {
        dialog.close();
        // Return selected mode
        dialog.selectedMode = selectedMode;
    };
    
    cancelBtn.onClick = function() {
        dialog.close();
        dialog.selectedMode = null;
    };
    
    enhancedStatusLog("UI_MODE", "Mode selection dialog ready", 1, 1, "User can select analysis mode");
    dialog.show();
    
    return dialog.selectedMode;
}

// ============================================================================
// ANALYSIS STATE MANAGEMENT
// ============================================================================

// Handle analysis state management to prevent concurrent operations
function handleAnalysisStateManagement() {
    var stateInfo = {
        canProceed: true,
        currentState: "idle",
        message: "",
        recommendation: ""
    };
    
    try {
        if (ENHANCED_ANALYSIS_CONFIG.runtime.analysisInProgress) {
            var sessionDuration = new Date().getTime() - ENHANCED_ANALYSIS_CONFIG.runtime.sessionStartTime;
            var maxDuration = ENHANCED_ANALYSIS_CONFIG.stateManagement.maxSessionDuration;
            
            if (sessionDuration > maxDuration) {
                // Session has timed out - force reset
                debugLog("Analysis session timed out (" + sessionDuration + "ms) - forcing reset", "STATE");
                endAnalysisSession();
                
                stateInfo.canProceed = true;
                stateInfo.currentState = "timeout_reset";
                stateInfo.message = "Previous analysis session timed out and was reset";
                stateInfo.recommendation = "You can now start a new analysis";
            } else {
                stateInfo.canProceed = false;
                stateInfo.currentState = "in_progress";
                stateInfo.message = "Analysis is currently in progress (" + Math.round(sessionDuration / 1000) + "s)";
                stateInfo.recommendation = "Please wait for the current analysis to complete";
            }
        } else {
            stateInfo.canProceed = true;
            stateInfo.currentState = "idle";
            stateInfo.message = "Ready for analysis";
            stateInfo.recommendation = "";
        }
        
    } catch (exc) {
        debugLog("State management check failed: " + exc.message, "ERROR");
        // Force reset on error
        try {
            endAnalysisSession();
        } catch (resetError) {
            // Ignore reset errors
        }
        
        stateInfo.canProceed = true;
        stateInfo.currentState = "error_reset";
        stateInfo.message = "State management error - session reset";
        stateInfo.recommendation = "Analysis state was reset due to error";
    }
    
    return stateInfo;
}

// ============================================================================
// MODE-INTEGRATED ANALYSIS FUNCTIONS
// ============================================================================

// Mode-integrated document analysis
function analyzeDocumentWithMode(doc, mode) {
    enhancedStatusLog("ANALYSIS", "Starting mode-integrated analysis", 0, 100, "Mode: " + mode);
    
    if (!startAnalysisSession(doc, mode)) {
        alert("Cannot start analysis - another operation is in progress");
        return null;
    }
    
    try {
        // Set the analysis mode
        setAnalysisMode(mode);
        
        // Use mode-based analysis
        var report = createModeBasedReport(doc);
        
        if (!report) {
            alert("Failed to create " + mode + " mode analysis report");
            return null;
        }
        
        // Validate report
        if (!validateAnalysisReport(report)) {
            alert("Generated report failed validation but will proceed");
        }
        
        return report;
        
    } catch (exc) {
        alert("Analysis failed in " + mode + " mode: " + exc.message);
        debugLog("Mode-integrated analysis failed: " + exc.message, "ERROR");
        return null;
    } finally {
        endAnalysisSession();
    }
}

// ============================================================================
// ENHANCED WORKFLOW FUNCTIONS - COMPLETELY MODE-INTEGRATED
// ============================================================================

// Enhanced document analysis with complete mode integration
function analyzeDocument() {
    enhancedStatusLog("WORKFLOW", "Document analysis starting", 0, 100, "Mode-integrated document analysis");
    
    if (!app.documents.length) {
        alert("Please open a document first.");
        return null;
    }
    
    var doc = app.activeDocument;
    
    // Check analysis state
    var stateInfo = handleAnalysisStateManagement();
    if (!stateInfo.canProceed) {
        alert(stateInfo.message + "\n\n" + stateInfo.recommendation);
        return null;
    }
    
    try {
        enhancedStatusLog("WORKFLOW", "Document capability detection", 5, 100, "Analyzing document for mode recommendation");
        
        // Show mode selection dialog with recommendations
        var selectedMode = showModeSelectionDialog(doc);
        
        if (!selectedMode) {
            alert("Analysis cancelled - no mode selected");
            return null;
        }
        
        enhancedStatusLog("WORKFLOW", "Mode selected", 10, 100, "Selected mode: " + selectedMode);
        
        var startTime = new Date().getTime();
        
        // Document validation with mode awareness
        enhancedStatusLog("WORKFLOW", "Validating document", 15, 100, "Checking document state for " + selectedMode + " mode");
        
        var docSaved = safeGetProperty(doc, 'saved', false);
        var docPath = safeGetProperty(doc, 'filePath');
        var docName = safeGetProperty(doc, 'name', 'document').replace(/\.[^\.]+$/, "");
        
        // Check if document is saved
        if (!docSaved) {
            var shouldSave = confirm("Document must be saved before analysis. Save now?");
            if (shouldSave) {
                var saveFile = File.saveDialog("Save document", "*.indd");
                if (saveFile) {
                    enhancedStatusLog("WORKFLOW", "Saving document", 20, 100, "Saving to: " + saveFile.name);
                    doc.save(saveFile);
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
        
        enhancedStatusLog("WORKFLOW", "Starting analysis", 30, 100, "Using " + selectedMode + " mode");
        
        // Perform mode-integrated analysis
        var report = analyzeDocumentWithMode(doc, selectedMode);
        
        if (!report) {
            alert("Failed to create document report in " + selectedMode + " mode.");
            return null;
        }
        
        enhancedStatusLog("WORKFLOW", "Saving analysis report", 80, 100, "Writing " + selectedMode + " mode analysis to file");
        
        // Save mode-specific report
        var reportFile = File(docPath + "/" + docName + "_analysis_" + selectedMode + ".json");
        
        if (saveReportSafely(reportFile, report, "analysis")) {
            var duration = (new Date().getTime() - startTime) / 1000;
            
            enhancedStatusLog("WORKFLOW", "Analysis completed", 100, 100, "Report generated successfully in " + selectedMode + " mode");
            
            // Generate mode-appropriate summary
            var summary = "Analysis complete in " + selectedMode.toUpperCase() + " mode! (" + duration + "s)\n\n";
            summary += "ANALYSIS RESULTS:\n";
            var discoveryStats = safeGetProperty(report, 'discoveryStats');
            if (discoveryStats) {
                summary += "Text items processed: " + (safeGetProperty(discoveryStats, 'textItemsProcessed', 0)) + "\n";
                summary += "Collections analyzed: " + (safeGetProperty(discoveryStats, 'collectionsAnalyzed', 0)) + "\n";
                summary += "Errors handled: " + (safeGetProperty(discoveryStats, 'errorsEncountered', 0)) + "\n";
            }
            summary += "Processing time: " + safeGetProperty(report, 'processingTime', 0) + "ms\n\n";
            summary += "Report saved as: " + reportFile.name + "\n\n";
            
            // Mode-specific recommendations
            summary += getModeSpecificRecommendations(selectedMode);
            
            alert(summary);
            debugLog("Standalone analysis completed successfully in " + selectedMode + " mode", "ANALYZE");
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

// Get mode-specific recommendations for analysis results
function getModeSpecificRecommendations(mode) {
    switch (mode) {
        case "emergency":
            return "EMERGENCY MODE COMPLETED\n" +
                   "• Document basic properties captured safely\n" +
                   "• Try minimal mode if document appears stable\n" +
                   "• Use Quick Compare to track changes over time";
        case "minimal":
            return "MINIMAL MODE COMPLETED\n" +
                   "• Safe basic analysis completed\n" +
                   "• Try basic mode for more detailed analysis\n" +
                   "• Use Quick Compare for change tracking";
        case "basic":
            return "BASIC MODE COMPLETED\n" +
                   "• Safe comprehensive analysis completed\n" +
                   "• Try standard mode for text content analysis\n" +
                   "• Use Quick Compare to track changes over time";
        case "standard":
            return "STANDARD MODE COMPLETED\n" +
                   "• Text content analysis included\n" +
                   "• Try comprehensive mode for complete analysis\n" +
                   "• Use Quick Compare to track detailed changes";
        case "comprehensive":
            return "COMPREHENSIVE MODE COMPLETED\n" +
                   "• Complete analysis with all features\n" +
                   "• Use Quick Compare for detailed change tracking\n" +
                   "• All document properties captured for comparison";
        default:
            return "Use Quick Compare to track changes over time!";
    }
}

// Reset baseline with mode integration
function resetBaseline() {
    enhancedStatusLog("WORKFLOW", "Baseline reset starting", 0, 100, "Mode-integrated baseline reset");
    
    if (!app.documents.length) {
        alert("Please open a document first.");
        return;
    }
    
    var doc = app.activeDocument;
    
    // Check analysis state
    var stateInfo = handleAnalysisStateManagement();
    if (!stateInfo.canProceed) {
        alert(stateInfo.message + "\n\n" + stateInfo.recommendation);
        return;
    }
    
    try {
        // Get current mode or show selection
        var currentMode = ENHANCED_ANALYSIS_CONFIG.runtime.currentMode || "basic";
        
        var shouldSelectMode = confirm("Reset baseline using current mode (" + currentMode + ")?\n\n" +
                                     "Click OK to use current mode, or Cancel to select a different mode.");
        
        if (!shouldSelectMode) {
            // Show mode selection
            var selectedMode = showModeSelectionDialog(doc);
            if (selectedMode) {
                currentMode = selectedMode;
                setAnalysisMode(currentMode);
            } else {
                alert("Baseline reset cancelled - no mode selected");
                return;
            }
        }
        
        enhancedStatusLog("WORKFLOW", "Mode confirmed", 10, 100, "Using " + currentMode + " mode for baseline");
        
        var docSaved = safeGetProperty(doc, 'saved', false);
        var docPath = safeGetProperty(doc, 'filePath');
        var docName = safeGetProperty(doc, 'name', 'document').replace(/\.[^\.]+$/, "");
        
        if (!docSaved || !docPath) {
            alert("Document must be saved before creating baseline.");
            return;
        }
        
        debugLog("Resetting baseline for document: " + docName + " in " + currentMode + " mode", "BASELINE");
        enhancedStatusLog("WORKFLOW", "Validating document", 20, 100, "Document: " + docName);
        
        var baselineFile = File(docPath + "/" + docName + "_baseline.json");
        var backupFile = File(docPath + "/" + docName + "_baseline_backup_" + currentMode + ".json");
        
        enhancedStatusLog("WORKFLOW", "Creating backup", 30, 100, "Backing up existing baseline");
        
        // Create backup if baseline exists
        if (baselineFile.exists) {
            try {
                baselineFile.copy(backupFile);
                debugLog("Baseline backup created: " + backupFile.name, "BASELINE");
                enhancedStatusLog("WORKFLOW", "Backup created", 40, 100, "Backup: " + backupFile.name);
            } catch (exc) {
                debugLog("Backup creation failed: " + exc.message, "WARN");
            }
        }
        
        enhancedStatusLog("WORKFLOW", "Creating new baseline", 50, 100, "Starting " + currentMode + " mode analysis");
        
        // Create new baseline with mode integration
        var success = showProgressDialog("Creating new baseline (" + currentMode + " mode)...", function() {
            var report = createModeBasedReport(doc); // FIXED: Use mode-based analysis
            if (report && validateAnalysisReport(report)) {
                return saveReportSafely(baselineFile, report, "baseline");
            }
            return false;
        });
        
        if (success) {
            enhancedStatusLog("WORKFLOW", "Baseline reset completed", 100, 100, "New " + currentMode + " mode baseline ready");
            
            var message = "New baseline created successfully in " + currentMode.toUpperCase() + " mode!\n\n";
            message += "New baseline saved as: " + baselineFile.name + "\n";
            if (backupFile.exists) {
                message += "Old baseline backed up as: " + backupFile.name + "\n";
            }
            message += "\nBaseline Analysis Mode: " + currentMode + "\n";
            message += "Description: " + (ENHANCED_ANALYSIS_CONFIG.modes[currentMode] ? ENHANCED_ANALYSIS_CONFIG.modes[currentMode].description : "Unknown mode") + "\n\n";
            message += "You can now make changes and run Quick Compare to see differences.\n";
            message += "Future comparisons will use " + currentMode + " mode analysis.";
            
            alert(message);
            debugLog("Baseline reset completed successfully in " + currentMode + " mode", "BASELINE");
        } else {
            alert("Failed to create new baseline in " + currentMode + " mode.");
            debugLog("Baseline reset failed", "ERROR");
            enhancedStatusLog("WORKFLOW", "Baseline reset failed", 100, 100, "Could not create new baseline");
        }
        
    } catch (exc) {
        alert("Baseline reset failed: " + exc.message);
        debugLog("Baseline reset failed: " + exc.message, "ERROR");
        enhancedStatusLog("WORKFLOW", "Baseline reset failed", 100, 100, "Error: " + exc.message);
    }
}

// ============================================================================
// ENHANCED UI DIALOGS WITH MODE INTEGRATION
// ============================================================================

// Show enhanced comparison dialog with mode awareness
function showEnhancedComparisonDialog(differences, mode) {
    var currentMode = mode || ENHANCED_ANALYSIS_CONFIG.runtime.currentMode || "basic";
    enhancedStatusLog("UI", "Displaying comparison results", 0, 1, "Opening mode-aware comparison dialog (" + currentMode + " mode)");
    
    var dialog = new Window("dialog", "Document Comparison Results - " + currentMode.toUpperCase() + " Mode");
    dialog.preferredSize.width = 750;
    dialog.preferredSize.height = 650;
    
    var mainGroup = dialog.add("group");
    mainGroup.orientation = "column";
    mainGroup.alignment = "fill";
    
    // Mode information panel
    var modePanel = mainGroup.add("panel", undefined, "Analysis Information");
    modePanel.alignment = "fill";
    modePanel.preferredSize.height = 80;
    
    var modeInfo = "Analysis Mode: " + currentMode.toUpperCase() + "\n";
    var modeConfig = ENHANCED_ANALYSIS_CONFIG.modes[currentMode];
    if (modeConfig) {
        modeInfo += "Description: " + modeConfig.description + "\n";
        modeInfo += "Collections: " + modeConfig.collections.join(", ");
    }
    
    var modeText = modePanel.add("statictext", undefined, modeInfo, {multiline: true});
    modeText.alignment = "fill";
    
    // Create tabbed interface for better organization
    var tabPanel = mainGroup.add("tabbedpanel");
    tabPanel.alignment = "fill";
    tabPanel.preferredSize.height = 450;
    
    // Summary tab
    var summaryTab = tabPanel.add("tab", undefined, "Summary");
    var summaryPanel = summaryTab.add("panel", undefined, "Change Summary");
    summaryPanel.alignment = "fill";
    
    var summary = createModeAppropriateReport(differences, currentMode, "summary");
    var summaryText = summaryPanel.add("edittext", undefined, summary, {multiline: true, readonly: true});
    summaryText.alignment = "fill";
    
    // Technical tab
    var technicalTab = tabPanel.add("tab", undefined, "Technical Details");
    var technicalPanel = technicalTab.add("panel", undefined, "Technical Analysis");
    technicalPanel.alignment = "fill";
    
    var technical = createModeAwareTechnicalSummary(differences, currentMode);
    var technicalText = technicalPanel.add("edittext", undefined, technical, {multiline: true, readonly: true});
    technicalText.alignment = "fill";
    
    // Text Analysis tab (mode-dependent)
    var diffChanges = safeGetProperty(differences, 'changes');
    if ((currentMode === "standard" || currentMode === "comprehensive") && 
        (safeGetProperty(diffChanges, 'textContent') || safeGetProperty(diffChanges, 'textFrames'))) {
        var textTab = tabPanel.add("tab", undefined, "Text Analysis");
        var textPanel = textTab.add("panel", undefined, "Text Content Changes");
        textPanel.alignment = "fill";
        
        var textAnalysis = createModeAwareTextAnalysis(differences, currentMode);
        var textText = textPanel.add("edittext", undefined, textAnalysis, {multiline: true, readonly: true});
        textText.alignment = "fill";
    }
    
    // Mode-specific features tab
    if (currentMode === "comprehensive") {
        var featuresTab = tabPanel.add("tab", undefined, "Advanced Features");
        var featuresPanel = featuresTab.add("panel", undefined, "Comprehensive Analysis Features");
        featuresPanel.alignment = "fill";
        
        var accessGuide = createModeAwareAccessGuide(differences, currentMode);
        var featuresText = featuresPanel.add("edittext", undefined, accessGuide, {multiline: true, readonly: true});
        featuresText.alignment = "fill";
    }
    
    // Action buttons
    var buttonGroup = mainGroup.add("group");
    buttonGroup.alignment = "center";
    
    var openFolderBtn = buttonGroup.add("button", undefined, "Open Report Folder");
    var exportBtn = buttonGroup.add("button", undefined, "Export All Reports");
    var resetBaselineBtn = buttonGroup.add("button", undefined, "Reset Baseline");
    var changeModeBtn = buttonGroup.add("button", undefined, "Change Mode");
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
        exportAllReportsToFolder(differences, currentMode);
    };
    
    resetBaselineBtn.onClick = function() {
        var confirmReset = confirm("This will create a new baseline from the current document state.\n\n" +
                                 "Current mode: " + currentMode + "\n" +
                                 "The existing baseline will be backed up.\n\nContinue?");
        if (confirmReset) {
            dialog.close();
            resetBaseline();
        }
    };
    
    changeModeBtn.onClick = function() {
        var shouldChangeMode = confirm("Change analysis mode for future comparisons?\n\n" +
                                     "Current mode: " + currentMode + "\n" +
                                     "This will show mode selection dialog.\n\nContinue?");
        if (shouldChangeMode) {
            dialog.close();
            var newMode = showModeSelectionDialog(UTILITY_STATE.currentDocument);
            if (newMode && newMode !== currentMode) {
                alert("Mode changed from " + currentMode + " to " + newMode + ".\n\n" +
                      "Future analyses will use " + newMode + " mode.\n" +
                      "Consider resetting baseline to match the new mode.");
            }
        }
    };
    
    okBtn.onClick = function() {
        dialog.close();
    };
    
    enhancedStatusLog("UI", "Comparison dialog ready", 1, 1, "User interface displayed (" + currentMode + " mode)");
    dialog.show();
}

// Export all reports with mode awareness
function exportAllReportsToFolder(differences, mode) {
    var currentMode = mode || ENHANCED_ANALYSIS_CONFIG.runtime.currentMode || "basic";
    enhancedStatusLog("EXPORT", "Starting export process", 0, 100, "Initializing " + currentMode + " mode report export");
    
    var folder = Folder.selectDialog("Select folder to save " + currentMode + " mode report suite:");
    if (!folder) return;
    
    var timestamp = new Date().getTime();
    var currentDoc = UTILITY_STATE.currentDocument;
    var docName = currentDoc ? 
                  safeGetProperty(currentDoc, 'name', 'document').replace(/\.[^\.]+$/, "") : 
                  "document_" + timestamp;
    
    try {
        debugLog("Exporting all reports to: " + folder.fsName + " (" + currentMode + " mode)", "EXPORT");
        enhancedStatusLog("EXPORT", "Creating reports", 10, 100, "Generating " + currentMode + " mode reports");
        
        // Create mode-appropriate reports
        var reports = {
            comparison: differences,
            summary: createModeAppropriateReport(differences, currentMode, "summary"),
            technical: createModeAwareTechnicalSummary(differences, currentMode)
        };
        
        // Add mode-specific reports
        var modeConfig = ENHANCED_ANALYSIS_CONFIG.modes[currentMode];
        if (modeConfig && (modeConfig.reportComplexity === "detailed" || modeConfig.reportComplexity === "full")) {
            reports.textAnalysis = createModeAwareTextAnalysis(differences, currentMode);
        }
        
        if (modeConfig && modeConfig.reportComplexity === "full") {
            reports.accessGuide = createModeAwareAccessGuide(differences, currentMode);
        }
        
        enhancedStatusLog("EXPORT", "Saving files", 30, 100, "Writing " + currentMode + " mode reports to selected folder");
        
        // Save all files with mode-specific naming
        var savedFiles = [];
        
        // JSON file
        var jsonFile = File(folder.fsName + "/" + docName + "_" + currentMode + "_analysis_" + timestamp + ".json");
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
            {file: docName + "_summary_" + currentMode + "_" + timestamp + ".txt", content: reports.summary},
            {file: docName + "_technical_" + currentMode + "_" + timestamp + ".txt", content: reports.technical}
        ];
        
        if (reports.textAnalysis) {
            textReports.push({file: docName + "_text_analysis_" + currentMode + "_" + timestamp + ".txt", content: reports.textAnalysis});
        }
        
        if (reports.accessGuide) {
            textReports.push({file: docName + "_access_guide_" + currentMode + "_" + timestamp + ".txt", content: reports.accessGuide});
        }
        
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
        
        alert("Comprehensive " + currentMode.toUpperCase() + " mode report suite exported successfully!\n\n" +
              "Location: " + folder.fsName + "\n" +
              "Files saved: " + savedFiles.length + "\n\n" +
              "Mode-specific files include:\n" +
              "* Complete technical JSON data (" + currentMode + " mode)\n" +
              "* Mode-appropriate summary report\n" +
              "* Technical analysis for " + currentMode + " mode\n" +
              (reports.textAnalysis ? "* Text analysis (available in " + currentMode + " mode)\n" : "") +
              (reports.accessGuide ? "* Complete access paths guide\n" : "") +
              "\nAll reports are optimized for " + currentMode + " mode analysis.");
              
        debugLog("Export completed successfully: " + savedFiles.length + " files (" + currentMode + " mode)", "EXPORT");
              
    } catch (exc) {
        alert("Export failed: " + exc.message);
        debugLog("Export failed: " + exc.message, "ERROR");
        enhancedStatusLog("EXPORT", "Export failed", 100, 100, "Error: " + exc.message);
    }
}

// ============================================================================
// ENHANCED STATUS AND INFORMATION FUNCTIONS
// ============================================================================

// Get enhanced current status text with mode and capability information
function getEnhancedStatusText() {
    var status = "Enhanced InDesign Document Inspector v2.1-ESTK\n";
    status += "Comprehensive change detection with progressive safety modes\n\n";
    
    // Current mode information
    var currentMode = ENHANCED_ANALYSIS_CONFIG.runtime.currentMode || "basic";
    var modeConfig = ENHANCED_ANALYSIS_CONFIG.modes[currentMode];
    
    status += "CURRENT ANALYSIS MODE: " + currentMode.toUpperCase() + "\n";
    if (modeConfig) {
        status += "Description: " + modeConfig.description + "\n";
        status += "Timeout: " + modeConfig.timeout + "ms\n";
        status += "Collections: " + modeConfig.collections.length + " allowed\n";
        status += "Report complexity: " + modeConfig.reportComplexity + "\n";
    }
    status += "\n";
    
    // Check document status
    if (!app.documents.length) {
        status += "STATUS: No document open\n";
        status += "Please open a document for analysis\n";
        status += "\nREQUIREMENTS:\n";
        status += "* Document must be open in InDesign\n";
        status += "* Document must be saved before analysis\n";
        status += "* Write permissions required in document folder\n";
        status += "* Enhanced validation detects compatibility issues\n";
        status += "\nMODE PROGRESSION:\n";
        status += "emergency → minimal → basic → standard → comprehensive\n";
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
            
            // Document capability information
            try {
                var capabilities = detectDocumentCapabilitiesForUI(doc);
                status += "COMPATIBILITY: " + capabilities.overallStatus.toUpperCase() + "\n";
                status += "Recommended mode: " + capabilities.recommendedMode + "\n";
                if (capabilities.warnings.length > 0) {
                    status += "Warnings: " + capabilities.warnings.length + " detected\n";
                }
            } catch (exc) {
                status += "COMPATIBILITY: Could not detect (" + exc.message + ")\n";
            }
            
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
            
            // Document statistics using safe methods
            status += "\nDOCUMENT INFO:\n";
            status += "Pages: " + safeGetLength(safeGetProperty(doc, 'pages')) + "\n";
            status += "Text Frames: " + safeGetLength(safeGetProperty(doc, 'textFrames')) + "\n";
            
            // Show additional info based on mode
            if (currentMode === "standard" || currentMode === "comprehensive") {
                status += "Stories: " + safeGetLength(safeGetProperty(doc, 'stories')) + "\n";
                status += "Layers: " + safeGetLength(safeGetProperty(doc, 'layers')) + "\n";
            }
            
            if (currentMode === "comprehensive") {
                status += "Images: " + safeGetLength(safeGetProperty(doc, 'images')) + "\n";
                status += "Links: " + safeGetLength(safeGetProperty(doc, 'links')) + "\n";
            }
        }
    }
    
    status += "\nSYSTEM STATUS:\n";
    status += "ESTK debugging: " + (ENHANCED_ANALYSIS_CONFIG.debugging.enableESTKDebugging ? "Enabled" : "Disabled") + "\n";
    status += "Memory management: Active cleanup enabled\n";
    status += "Error handling: Comprehensive with retry logic\n";
    status += "State management: " + (ENHANCED_ANALYSIS_CONFIG.stateManagement.preventConcurrent ? "Active" : "Disabled") + "\n";
    
    // Analysis state information
    var stateInfo = handleAnalysisStateManagement();
    status += "Analysis state: " + stateInfo.currentState + "\n";
    if (stateInfo.message) {
        status += "Status message: " + stateInfo.message + "\n";
    }
    
    return status;
}

// Show help dialog with comprehensive mode information
function showHelpDialog() {
    enhancedStatusLog("UI", "Displaying help dialog", 0, 1, "Opening enhanced help and documentation");
    
    var helpDialog = new Window("dialog", "Enhanced InDesign Inspector - Help & Documentation");
    helpDialog.preferredSize.width = 700;
    helpDialog.preferredSize.height = 600;
    
    var helpGroup = helpDialog.add("group");
    helpGroup.orientation = "column";
    helpGroup.alignment = "fill";
    
    var helpText = helpGroup.add("edittext", undefined, 
        "ENHANCED INDESIGN DOCUMENT INSPECTOR v2.1-ESTK\n\n" +
        "OVERVIEW:\n" +
        "Comprehensive InDesign document analysis with progressive safety modes\n" +
        "optimized for ExtendScript Toolkit (ESTK) development and debugging.\n\n" +
        "PROGRESSIVE ANALYSIS MODES:\n" +
        "• EMERGENCY MODE (Ultra-safe)\n" +
        "  - Properties only, no collections\n" +
        "  - 500ms timeout, for broken documents\n" +
        "  - Maximum safety, minimal analysis\n\n" +
        "• MINIMAL MODE (Basic safe)\n" +
        "  - Limited to safest collections only\n" +
        "  - 1s timeout, essential info only\n" +
        "  - Good for problematic documents\n\n" +
        "• BASIC MODE (Moderate safe)\n" +
        "  - Safe collections: pages, textFrames, layers\n" +
        "  - 3s timeout, balanced safety/detail\n" +
        "  - Recommended starting point\n\n" +
        "• STANDARD MODE (Balanced)\n" +
        "  - Basic + text content sampling\n" +
        "  - 8s timeout, comprehensive text tracking\n" +
        "  - Good for text-heavy documents\n\n" +
        "• COMPREHENSIVE MODE (Complete)\n" +
        "  - All collections with pre-testing\n" +
        "  - 15s timeout, maximum detail\n" +
        "  - Images, links, styles with safety measures\n\n" +
        "ENHANCED FEATURES:\n" +
        "* Document capability detection and mode recommendation\n" +
        "* Progressive safety system with automatic fallbacks\n" +
        "* Mode-appropriate report complexity\n" +
        "* Enhanced error handling and recovery\n" +
        "* ESTK debugging with detailed console output\n" +
        "* Analysis state management prevents hanging\n" +
        "* Memory management with mode-specific limits\n\n" +
        "HOW TO USE:\n" +
        "1. Open an InDesign document\n" +
        "2. Save the document (required for analysis)\n" +
        "3. Run this script from ESTK or InDesign Scripts panel\n" +
        "4. Choose analysis mode (or use automatic recommendation)\n" +
        "5. Select 'Quick Compare' for baseline creation and change tracking\n" +
        "6. Select 'Analyze Document Only' for standalone analysis\n\n" +
        "FIRST TIME USE:\n" +
        "* System will recommend appropriate mode based on document\n" +
        "* Creates a baseline snapshot using selected mode\n" +
        "* Captures mode-appropriate document properties\n" +
        "* Make changes to your document\n" +
        "* Run Quick Compare again to see detailed differences\n\n" +
        "MODE SELECTION GUIDANCE:\n" +
        "* Use capability detection for automatic recommendations\n" +
        "* Start with lower modes for problematic documents\n" +
        "* Increase mode for more detailed analysis\n" +
        "* Emergency mode for corrupted or slow documents\n" +
        "* Comprehensive mode for complete change tracking\n\n" +
        "REPORTS GENERATED (Mode-dependent):\n" +
        "* *_baseline.json - Initial document snapshot\n" +
        "* *_current.json - Current document state\n" +
        "* *_comparison.json - Complete technical comparison data\n" +
        "* *_summary_[mode].txt - Mode-appropriate summary\n" +
        "* *_technical_[mode].txt - Technical analysis for mode\n" +
        "* *_text_analysis_[mode].txt - Text analysis (standard/comprehensive)\n" +
        "* *_access_guide_[mode].txt - Safe access patterns (comprehensive)\n\n" +
        "ESTK DEVELOPMENT FEATURES:\n" +
        "* Comprehensive $.writeln() debugging output\n" +
        "* Mode-specific error categorization and troubleshooting\n" +
        "* Alternative property access method discovery\n" +
        "* Performance monitoring with mode-appropriate limits\n" +
        "* Timeout protection prevents hanging\n" +
        "* Document capability matrix for mode selection\n\n" +
        "TROUBLESHOOTING:\n" +
        "* Document must be saved before analysis\n" +
        "* Use capability detection for mode recommendations\n" +
        "* Check ESTK console for detailed debugging output\n" +
        "* Start with emergency mode for problematic documents\n" +
        "* Use mode progression: emergency → minimal → basic → standard → comprehensive\n" +
        "* Reset baseline when changing analysis modes\n\n" +
        "BEST PRACTICES:\n" +
        "* Test with emergency mode first for unknown documents\n" +
        "* Use ESTK for development and debugging\n" +
        "* Follow mode recommendations from capability detection\n" +
        "* Monitor console output for API issues\n" +
        "* Keep baseline reports for version tracking\n" +
        "* Reset baseline when switching modes\n\n" +
        "VERSION: 2.1-ESTK - Progressive Safety Analysis with Mode Integration",
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

// Main menu dialog with enhanced mode integration
function showMainMenu() {
    enhancedStatusLog("UI", "Displaying main menu", 0, 1, "Opening enhanced main menu with mode integration");
    
    var menuDialog = new Window("dialog", "Enhanced InDesign Inspector v2.1-ESTK");
    menuDialog.preferredSize.width = 650;
    menuDialog.preferredSize.height = 650;
    
    var mainGroup = menuDialog.add("group");
    mainGroup.orientation = "column";
    mainGroup.alignment = "fill";
    
    // Title panel with enhanced information
    var titlePanel = mainGroup.add("panel", undefined, "Progressive Document Analysis Suite");
    titlePanel.alignment = "fill";
    
    var titleText = titlePanel.add("statictext", undefined, 
        "ESTK-optimized InDesign document analysis with progressive safety:\n" +
        "• Progressive analysis modes (Emergency → Comprehensive)\n" +
        "• Document capability detection with mode recommendations\n" +
        "• Emergency bailouts prevent hanging on problematic documents\n" +
        "• Enhanced progress reporting with detailed feedback\n" +
        "• Safe API access with multiple fallback methods\n" +
        "• ESTK debugging with detailed console output\n" +
        "• Mode-appropriate report complexity and memory management\n" +
        "• Analysis state management prevents concurrent operations",
        {multiline: true});
    titleText.alignment = "fill";
    
    // Document capability panel
    var capabilityPanel = mainGroup.add("panel", undefined, "Document Capability Analysis");
    capabilityPanel.alignment = "fill";
    capabilityPanel.preferredSize.height = 120;
    
    var capabilityText = capabilityPanel.add("statictext", undefined, "Analyzing document...", {multiline: true});
    capabilityText.alignment = "fill";
    
    // Current mode panel
    var currentModePanel = mainGroup.add("panel", undefined, "Current Analysis Mode");
    currentModePanel.alignment = "fill";
    
    var currentMode = ENHANCED_ANALYSIS_CONFIG.runtime.currentMode || "basic";
    var modeConfig = ENHANCED_ANALYSIS_CONFIG.modes[currentMode];
    var modeInfoText = "Mode: " + currentMode.toUpperCase() + "\n";
    if (modeConfig) {
        modeInfoText += "Description: " + modeConfig.description + "\n";
        modeInfoText += "Timeout: " + modeConfig.timeout + "ms, Collections: " + modeConfig.collections.length;
    }
    
    var modeText = currentModePanel.add("statictext", undefined, modeInfoText, {multiline: true});
    modeText.alignment = "fill";
    
    // Action buttons
    var actionsPanel = mainGroup.add("panel", undefined, "Actions");
    actionsPanel.alignment = "fill";
    
    var quickCompareBtn = actionsPanel.add("button", undefined, "Quick Compare (Recommended)");
    quickCompareBtn.preferredSize.height = 35;
    quickCompareBtn.alignment = "fill";
    
    var analyzeOnlyBtn = actionsPanel.add("button", undefined, "Analyze Document Only");
    analyzeOnlyBtn.alignment = "fill";
    
    var selectModeBtn = actionsPanel.add("button", undefined, "Select Analysis Mode");
    selectModeBtn.alignment = "fill";
    
    var resetBtn = actionsPanel.add("button", undefined, "Reset Baseline");
    resetBtn.alignment = "fill";
    
    var helpBtn = actionsPanel.add("button", undefined, "Help & Documentation");
    helpBtn.alignment = "fill";
    
    // Status panel with current document information
    var statusPanel = mainGroup.add("panel", undefined, "System Status");
    statusPanel.alignment = "fill";
    statusPanel.preferredSize.height = 100;
    
    var statusText = statusPanel.add("statictext", undefined, getEnhancedStatusText(), {multiline: true});
    statusText.alignment = "fill";
    
    // Bottom buttons
    var buttonGroup = mainGroup.add("group");
    buttonGroup.alignment = "center";
    
    var cancelBtn = buttonGroup.add("button", undefined, "Cancel");
    
    // Initialize capability detection
    try {
        if (app.documents.length > 0) {
            var doc = app.activeDocument;
            var capabilities = detectDocumentCapabilitiesForUI(doc);
            
            var capabilityDisplay = "DOCUMENT CAPABILITY ANALYSIS\n";
            capabilityDisplay += "Status: " + capabilities.overallStatus.toUpperCase() + "\n";
            capabilityDisplay += "Recommended Mode: " + capabilities.recommendedMode.toUpperCase() + "\n";
            capabilityDisplay += "Message: " + capabilities.userMessage + "\n";
            
            if (capabilities.warnings.length > 0) {
                capabilityDisplay += "Warnings: " + capabilities.warnings.length + " detected";
            } else {
                capabilityDisplay += "No compatibility warnings";
            }
            
            capabilityText.text = capabilityDisplay;
            
            // Auto-recommend mode change if needed
            if (capabilities.recommendedMode !== currentMode) {
                var shouldAutoChange = confirm("Document analysis recommends " + capabilities.recommendedMode.toUpperCase() + " mode.\n\n" +
                                             "Current mode: " + currentMode + "\n" +
                                             "Recommended: " + capabilities.recommendedMode + "\n\n" +
                                             "Change to recommended mode?");
                if (shouldAutoChange) {
                    setAnalysisMode(capabilities.recommendedMode);
                    currentMode = capabilities.recommendedMode;
                    
                    // Update mode display
                    var newModeConfig = ENHANCED_ANALYSIS_CONFIG.modes[currentMode];
                    var newModeInfoText = "Mode: " + currentMode.toUpperCase() + " (Auto-recommended)\n";
                    if (newModeConfig) {
                        newModeInfoText += "Description: " + newModeConfig.description + "\n";
                        newModeInfoText += "Timeout: " + newModeConfig.timeout + "ms, Collections: " + newModeConfig.collections.length;
                    }
                    modeText.text = newModeInfoText;
                }
            }
            
        } else {
            capabilityText.text = "No document open\nPlease open a document for capability analysis";
        }
    } catch (exc) {
        capabilityText.text = "Capability detection failed: " + exc.message + "\nProceeding with current mode settings";
    }
    
    // Event handlers
    quickCompareBtn.onClick = function() {
        // Check analysis state
        var stateInfo = handleAnalysisStateManagement();
        if (!stateInfo.canProceed) {
            alert(stateInfo.message + "\n\n" + stateInfo.recommendation);
            return;
        }
        
        menuDialog.close();
        quickCompare();
    };
    
    analyzeOnlyBtn.onClick = function() {
        // Check analysis state
        var stateInfo = handleAnalysisStateManagement();
        if (!stateInfo.canProceed) {
            alert(stateInfo.message + "\n\n" + stateInfo.recommendation);
            return;
        }
        
        menuDialog.close();
        analyzeDocument();
    };
    
    selectModeBtn.onClick = function() {
        if (app.documents.length > 0) {
            var selectedMode = showModeSelectionDialog(app.activeDocument);
            if (selectedMode) {
                setAnalysisMode(selectedMode);
                alert("Analysis mode changed to " + selectedMode.toUpperCase() + ".\n\n" +
                      "Future analyses will use this mode.\n" +
                      "Consider resetting baseline to match the new mode.");
                menuDialog.close();
                showMainMenu(); // Refresh menu with new mode
            }
        } else {
            alert("Please open a document first for mode selection with recommendations.");
        }
    };
    
    resetBtn.onClick = function() {
        // Check analysis state
        var stateInfo = handleAnalysisStateManagement();
        if (!stateInfo.canProceed) {
            alert(stateInfo.message + "\n\n" + stateInfo.recommendation);
            return;
        }
        
        menuDialog.close();
        resetBaseline();
    };
    
    helpBtn.onClick = function() {
        showHelpDialog();
    };
    
    cancelBtn.onClick = function() {
        menuDialog.close();
    };
    
    enhancedStatusLog("UI", "Main menu ready", 1, 1, "Enhanced user interface displayed with mode integration");
    menuDialog.show();
}

// ============================================================================
// MAIN SCRIPT ENTRY POINT - ENHANCED WITH COMPLETE MODE INTEGRATION
// ============================================================================

// Script entry point with enhanced error handling and complete mode system
try {
    // Initialize ESTK debugging
    $.writeln(repeatString("=", 70));
    $.writeln("Enhanced InDesign Document Inspector v2.1-ESTK");
    $.writeln("Progressive Safety Analysis with Complete Mode Integration");
    $.writeln("Loading comprehensive document analysis suite...");
    $.writeln("ESTK Debugging: ENABLED");
    $.writeln("Enhanced Features: Mode System, Capability Detection, State Management");
    $.writeln(repeatString("=", 70));
    
    enhancedStatusLog("INIT", "System initialization", 0, 8, "Loading enhanced analysis engine with mode system");
    
    // Verify core functions are available
    var coreTests = [
        {name: "detectDocumentCapabilities", func: detectDocumentCapabilities},
        {name: "createModeBasedReport", func: createModeBasedReport},
        {name: "enhancedSafeIterateCollection", func: enhancedSafeIterateCollection},
        {name: "enhancedStatusLog", func: enhancedStatusLog},
        {name: "safeGetProperty", func: safeGetProperty},
        {name: "startAnalysisSession", func: startAnalysisSession},
        {name: "createEmergencyPropertyDump", func: createEmergencyPropertyDump},
        {name: "setAnalysisMode", func: setAnalysisMode}
    ];
    
    enhancedStatusLog("INIT", "Verifying core functions", 1, 8, "Testing enhanced function availability");
    
    for (var i = 0; i < coreTests.length; i++) {
        var test = coreTests[i];
        if (typeof test.func !== 'function') {
            throw new Error("Core function missing: " + test.name);
        }
    }
    
    enhancedStatusLog("INIT", "Core functions verified", 2, 8, "All enhanced functions available");
    
    // Initialize mode system
    enhancedStatusLog("INIT", "Initializing mode system", 3, 8, "Setting up progressive analysis modes");
    
    try {
        // Verify mode configuration
        var testModes = ["emergency", "minimal", "basic", "standard", "comprehensive"];
        for (var i = 0; i < testModes.length; i++) {
            var mode = testModes[i];
            if (!ENHANCED_ANALYSIS_CONFIG.modes[mode]) {
                throw new Error("Mode configuration missing: " + mode);
            }
        }
        
        // Set default mode
        setAnalysisMode("basic");
        enhancedStatusLog("INIT", "Mode system initialized", 4, 8, "Default mode: basic");
        
    } catch (modeError) {
        throw new Error("Mode system initialization failed: " + modeError.message);
    }
    
    // Test document capability detection if document is open
    if (app.documents.length > 0) {
        enhancedStatusLog("INIT", "Testing capability detection", 5, 8, "Checking current document compatibility");
        
        try {
            var testCapabilities = detectDocumentCapabilitiesForUI(app.activeDocument);
            if (testCapabilities) {
                enhancedStatusLog("INIT", "Capability detection passed", 6, 8, 
                    "Document status: " + testCapabilities.overallStatus);
            } else {
                enhancedStatusLog("INIT", "Capability detection issues", 6, 8, "Will use basic compatibility mode");
            }
        } catch (capabilityError) {
            enhancedStatusLog("INIT", "Capability detection test failed", 6, 8, "Will use fallback mode selection");
        }
    } else {
        enhancedStatusLog("INIT", "No document open", 5, 8, "Ready for document analysis when opened");
    }
    
    // Initialize state management
    enhancedStatusLog("INIT", "Initializing state management", 7, 8, "Setting up analysis session control");
    
    try {
        // Clear any previous state
        ENHANCED_ANALYSIS_CONFIG.runtime.analysisInProgress = false;
        ENHANCED_ANALYSIS_CONFIG.runtime.sessionStartTime = null;
        enhancedStatusLog("INIT", "State management ready", 7, 8, "Session control initialized");
    } catch (stateError) {
        enhancedStatusLog("INIT", "State management issues", 7, 8, "Will use basic session handling");
    }
    
    enhancedStatusLog("INIT", "Initialization completed", 8, 8, "Enhanced inspector ready with complete mode integration");
    
    // Show startup completion message with mode information
    var startupMessage = "Enhanced InDesign Document Inspector v2.1-ESTK loaded successfully!\n\n";
    startupMessage += "PROGRESSIVE ANALYSIS MODES:\n";
    startupMessage += "• EMERGENCY: Ultra-safe (properties only)\n";
    startupMessage += "• MINIMAL: Basic safe (limited collections)\n";
    startupMessage += "• BASIC: Moderate safe (safe collections)\n";
    startupMessage += "• STANDARD: Balanced (+ text content)\n";
    startupMessage += "• COMPREHENSIVE: Complete (all features)\n\n";
    startupMessage += "ENHANCED FEATURES:\n";
    startupMessage += "• Document capability detection with mode recommendations\n";
    startupMessage += "• Progressive safety system with automatic fallbacks\n";
    startupMessage += "• Enhanced error handling and recovery\n";
    startupMessage += "• ESTK debugging with detailed console output\n";
    startupMessage += "• Analysis state management prevents hanging\n";
    startupMessage += "• Mode-appropriate report complexity\n\n";
    startupMessage += "SAFETY FEATURES:\n";
    startupMessage += "• Emergency bailouts prevent document hanging\n";
    startupMessage += "• Collection pre-testing for problematic documents\n";
    startupMessage += "• Memory management with mode-specific limits\n";
    startupMessage += "• Timeout protection for complex operations\n";
    startupMessage += "• Alternative property access method discovery\n";
    startupMessage += "• Real-time progress reporting prevents hanging\n\n";
    startupMessage += "Ready for progressive InDesign document analysis!\n\n";
    startupMessage += "The system will recommend appropriate modes based on document compatibility.\n";
    startupMessage += "Check the ESTK console for detailed progress information.";
    
    alert(startupMessage);
    
    // Log successful initialization
    debugLog("Enhanced InDesign Inspector v2.1-ESTK initialized successfully with complete mode integration", "INIT");
    debugLog("All chunks loaded and ready for operation", "INIT");
    debugLog("Mode system: " + objectKeys(ENHANCED_ANALYSIS_CONFIG.modes).join(", "), "INIT");
    debugLog("ESTK debugging enabled - check console for detailed output", "INIT");
    debugLog("Enhanced features: Document validation, mode selection, progress reporting, hanging prevention", "INIT");
    
    // Show main menu with enhanced mode integration
    showMainMenu();
    
} catch (exc) {
    // Enhanced error handling for startup
    var errorMsg = "Enhanced InDesign Inspector v2.1-ESTK\n\n" +
                   "Initialization Error: " + exc.message + "\n\n" +
                   "This comprehensive script contains all functionality\n" +
                   "optimized for ESTK development with progressive modes.\n\n" +
                   "Check the ESTK console for detailed error information.";
    
    alert(errorMsg);
    
    // Log error to ESTK console
    $.writeln(repeatString("=", 30) + " INITIALIZATION ERROR " + repeatString("=", 30));
    $.writeln("Error: " + exc.message);
    if (exc.line) $.writeln("Line: " + exc.line);
    if (exc.stack) $.writeln("Stack: " + exc.stack);
    $.writeln("Enhanced Features Status: Mode system may not be available");
    $.writeln("Fallback: Emergency mode should still work");
    $.writeln(repeatString("=", 82));
    
    // Try to show a basic emergency menu as fallback
    try {
        var fallbackDialog = new Window("dialog", "InDesign Inspector - Emergency Mode");
        fallbackDialog.preferredSize.width = 450;
        fallbackDialog.preferredSize.height = 250;
        
        var fallbackGroup = fallbackDialog.add("group");
        fallbackGroup.orientation = "column";
        fallbackGroup.alignment = "fill";
        
        var fallbackText = fallbackGroup.add("statictext", undefined, 
            "Enhanced features failed to initialize.\n\n" +
            "Error: " + exc.message + "\n\n" +
            "EMERGENCY MODE AVAILABLE:\n" +
            "• Ultra-safe property analysis only\n" +
            "• No collection access (maximum safety)\n" +
            "• For problematic or corrupted documents\n\n" +
            "Check ESTK console for details.",
            {multiline: true});
        fallbackText.alignment = "fill";
        
        var fallbackButtonGroup = fallbackGroup.add("group");
        fallbackButtonGroup.alignment = "center";
        
        var emergencyBtn = fallbackButtonGroup.add("button", undefined, "Emergency Analysis");
        var fallbackOkBtn = fallbackButtonGroup.add("button", undefined, "Cancel");
        
        emergencyBtn.onClick = function() {
            fallbackDialog.close();
            
            // Try emergency analysis
            if (app.documents.length > 0) {
                try {
                    setAnalysisMode("emergency");
                    var doc = app.activeDocument;
                    var emergencyReport = createEmergencyPropertyDump(doc);
                    
                    if (emergencyReport) {
                        alert("Emergency analysis completed!\n\n" +
                              "Document: " + (emergencyReport.documentProperties ? "Properties accessible" : "Limited access") + "\n" +
                              "Processing time: " + (emergencyReport.processingTime || 0) + "ms\n\n" +
                              "This is the safest analysis mode for problematic documents.");
                    } else {
                        alert("Emergency analysis failed - document may be severely corrupted.");
                    }
                } catch (emergencyError) {
                    alert("Emergency analysis also failed: " + emergencyError.message);
                }
            } else {
                alert("Please open a document first.");
            }
        };
        
        fallbackOkBtn.onClick = function() {
            fallbackDialog.close();
        };
        
        fallbackDialog.show();
    } catch (fallbackError) {
        $.writeln("Fallback dialog also failed: " + fallbackError.message);
    }
}