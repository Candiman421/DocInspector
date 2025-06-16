// ============================================================================
// MODULE 5.0: MAIN ENTRY POINT AND INITIALIZATION
// InDesign Document Query Tool v3.1 - Enhanced Safety Edition
// ES3 Compatible - All Reserved Words Fixed
// ============================================================================

// Application state management
var APPLICATION_STATE = {
    initialized: false,
    modulesLoaded: {},
    lastError: null,
    startupTime: null,
    environmentValid: false
};

// Required modules list for validation
var REQUIRED_MODULES = [
    { name: "Module 1.0", validator: function() { return typeof QUERY_CONFIG !== "undefined"; } },
    { name: "Module 2.0", validator: function() { return typeof analyzeDocumentToTree === "function"; } },
    { name: "Module 2.1", validator: function() { return typeof createTreeNode === "function"; } },
    { name: "Module 3.0", validator: function() { return typeof createMainInterface === "function"; } },
    { name: "Module 3.1", validator: function() { return typeof emergencyGetProperty === "function"; } },
    { name: "Module 4.0", validator: function() { return typeof exportAnalysisResults === "function"; } }
];

// ============================================================================
// MAIN INITIALIZATION FUNCTIONS
// ============================================================================

function initializeApplication() {
    debugLog("Starting application initialization", "INIT");
    APPLICATION_STATE.startupTime = new Date().getTime();
    
    try {
        // Phase 1: Environment validation
        if (!validateEnvironment()) {
            throw new Error("Environment validation failed");
        }
        APPLICATION_STATE.environmentValid = true;
        
        // Phase 2: Module validation
        if (!validateModules()) {
            throw new Error("Module validation failed");
        }
        
        // Phase 3: Configuration initialization
        if (!initializeConfiguration()) {
            throw new Error("Configuration initialization failed");
        }
        
        // Phase 4: UI utilities initialization
        if (!initializeUtilities()) {
            throw new Error("UI utilities initialization failed");
        }
        
        APPLICATION_STATE.initialized = true;
        debugLog("Application initialized successfully", "INIT");
        
        // Show startup message
        showStartupMessage();
        
        // Launch main interface
        showMainInterface();
        
        return true;
        
    } catch (exc) {
        APPLICATION_STATE.lastError = exc.message;
        handleInitializationError(exc);
        return false;
    }
}

function validateEnvironment() {
    debugLog("Validating environment", "VALIDATION");
    
    var validationResults = {
        indesign: typeof app !== "undefined" && app.name && stringIndexOf(app.name.toLowerCase(), "indesign") !== -1,
        documents: typeof app !== "undefined" && typeof app.documents !== "undefined",
        filesystem: typeof File !== "undefined" && typeof Folder !== "undefined",
        ui: typeof Window !== "undefined",
        extendscript: typeof $ !== "undefined"
    };
    
    var failedChecks = [];
    
    for (var checkName in validationResults) {
        if (!validationResults[checkName]) {
            failedChecks.push(checkName);
        }
    }
    
    if (failedChecks.length > 0) {
        debugLog("Environment validation failed: " + failedChecks.join(", "), "VALIDATION");
        return false;
    }
    
    debugLog("Environment validation passed", "VALIDATION");
    return true;
}

function validateModules() {
    debugLog("Validating required modules", "VALIDATION");
    
    var failedModules = [];
    
    for (var i = 0; i < REQUIRED_MODULES.length; i++) {
        var moduleInfo = REQUIRED_MODULES[i];
        
        try {
            var isValid = moduleInfo.validator();
            APPLICATION_STATE.modulesLoaded[moduleInfo.name] = isValid;
            
            if (!isValid) {
                failedModules.push(moduleInfo.name);
            }
        } catch (exc) {
            debugLog("Module validation error for " + moduleInfo.name + ": " + exc.message, "VALIDATION");
            APPLICATION_STATE.modulesLoaded[moduleInfo.name] = false;
            failedModules.push(moduleInfo.name);
        }
    }
    
    if (failedModules.length > 0) {
        debugLog("Module validation failed: " + failedModules.join(", "), "VALIDATION");
        return false;
    }
    
    debugLog("All modules validated successfully", "VALIDATION");
    return true;
}

function initializeConfiguration() {
    debugLog("Initializing configuration", "CONFIG");
    
    try {
        // Ensure QUERY_CONFIG is properly initialized
        if (typeof QUERY_CONFIG !== "undefined") {
            // Initialize runtime state if not already done
            if (!QUERY_CONFIG.runtime) {
                QUERY_CONFIG.runtime = {
                    analysisActive: false,
                    errorCount: 0,
                    successCount: 0,
                    debugLog: [],
                    errors: []
                };
            }
            
            // Reset progress tracking
            resetProgress();
            
            debugLog("Configuration initialized successfully", "CONFIG");
            return true;
        } else {
            throw new Error("QUERY_CONFIG not available");
        }
        
    } catch (exc) {
        debugLog("Configuration initialization failed: " + exc.message, "CONFIG");
        return false;
    }
}

function handleInitializationError(errorObj) {
    var errorMessage = "InDesign Document Inspector v3.1\n\n" +
                      "Initialization Error: " + errorObj.message + "\n\n" +
                      "This tool requires all modules to be loaded properly.\n" +
                      "Please ensure all module files are available:\n\n" +
                      "• Module_1.0_ConfigAndSafety.jsx\n" +
                      "• Module_2.0_DocumentAnalysisCore.jsx\n" +
                      "• Module_2.1_TreeBuilderUtils.jsx\n" +
                      "• Module_3.0_UIInterface.jsx\n" +
                      "• Module_3.1_UIUtilities.jsx\n" +
                      "• Module_4.0_ExportAndResults.jsx\n" +
                      "• Module_5.0_MainEntryPoint.jsx\n\n" +
                      "Check the ExtendScript console for detailed error information.";
    
    alert(errorMessage);
    
    // Log detailed error information
    $.writeln("!!! INITIALIZATION FAILED !!!");
    $.writeln("Error: " + errorObj.message);
    $.writeln("Environment Valid: " + APPLICATION_STATE.environmentValid);
    $.writeln("Modules Status:");
    
    for (var moduleName in APPLICATION_STATE.modulesLoaded) {
        $.writeln("  " + moduleName + ": " + (APPLICATION_STATE.modulesLoaded[moduleName] ? "OK" : "FAILED"));
    }
}

// ============================================================================
// STARTUP AND USER INTERFACE
// ============================================================================

function showStartupMessage() {
    var startupTime = new Date().getTime() - APPLICATION_STATE.startupTime;
    
    var startupMessage = "InDesign Document Inspector v3.1\n";
    startupMessage += "Enhanced Safety Edition\n\n";
    startupMessage += "✓ All modules loaded successfully\n";
    startupMessage += "✓ Environment validation passed\n";
    startupMessage += "✓ Configuration initialized\n";
    startupMessage += "✓ UI utilities ready\n\n";
    startupMessage += "FEATURES:\n";
    startupMessage += "• Manual execution mode with configurable targeting\n";
    startupMessage += "• Enhanced safety controls for all property access\n";
    startupMessage += "• ES3 compatible ExtendScript implementation\n";
    startupMessage += "• Multiple export formats (JSON, XML, CSV, Text)\n";
    startupMessage += "• Emergency bailout protection\n";
    startupMessage += "• Comprehensive error handling and logging\n\n";
    startupMessage += "SAFETY LEVELS:\n";
    startupMessage += "✓ Safe - Basic properties, very low risk\n";
    startupMessage += "⚠ Moderate - Collection access, medium risk\n";
    startupMessage += "⚡ Risky - Complex operations, higher risk\n\n";
    startupMessage += "Initialization completed in " + startupTime + "ms\n\n";
    startupMessage += "Ready for manual document analysis!";
    
    // Console output
    $.writeln(repeatString("=", 60));
    $.writeln("InDesign Document Inspector v3.1 - Enhanced Safety Edition");
    $.writeln("Manual Execution Mode - All Systems Ready");
    $.writeln(repeatString("=", 60));
    $.writeln("Startup time: " + startupTime + "ms");
    $.writeln("Environment: " + (APPLICATION_STATE.environmentValid ? "Valid" : "Invalid"));
    $.writeln("Modules loaded: " + objectKeys(APPLICATION_STATE.modulesLoaded).length);
    $.writeln("Ready for operation");
    $.writeln(repeatString("=", 60));
    
    // Show user dialog
    alert(startupMessage);
}

function showMainMenu() {
    debugLog("Showing main menu", "UI");
    
    try {
        var menuDialog = new Window("dialog", "InDesign Document Inspector v3.1");
        menuDialog.orientation = "column";
        menuDialog.alignChildren = "fill";
        menuDialog.preferredSize.width = 500;
        menuDialog.preferredSize.height = 400;
        
        // Header
        createMenuHeader(menuDialog);
        
        // Status panel
        createMenuStatus(menuDialog);
        
        // Action buttons
        createMenuActions(menuDialog);
        
        // Footer
        createMenuFooter(menuDialog);
        
        menuDialog.show();
        
    } catch (exc) {
        alert("Failed to show main menu: " + exc.message);
        debugLog("Main menu error: " + exc.message, "UI");
    }
}

function createMenuHeader(parentWindow) {
    var headerPanel = parentWindow.add("panel", undefined, "Enhanced Document Analysis");
    headerPanel.alignment = "fill";
    headerPanel.margins = 15;
    
    var titleText = headerPanel.add("statictext", undefined, 
        "InDesign Document Inspector v3.1\nEnhanced Safety Edition with Manual Control");
    titleText.alignment = "center";
    titleText.graphics.font = ScriptUI.newFont("dialog", "Bold", 14);
    
    var descText = headerPanel.add("statictext", undefined,
        "Safely analyze InDesign documents with configurable property targeting.\n" +
        "Manual execution mode gives you complete control over the analysis process.",
        {multiline: true});
    descText.alignment = "fill";
    
    return headerPanel;
}

function createMenuStatus(parentWindow) {
    var statusPanel = parentWindow.add("panel", undefined, "System Status");
    statusPanel.alignment = "fill";
    statusPanel.preferredSize.height = 120;
    
    var statusText = generateSystemStatus();
    var statusDisplay = statusPanel.add("statictext", undefined, statusText, {multiline: true});
    statusDisplay.alignment = "fill";
    
    return statusPanel;
}

function createMenuActions(parentWindow) {
    var actionsPanel = parentWindow.add("panel", undefined, "Available Actions");
    actionsPanel.alignment = "fill";
    
    var buttonGroup = actionsPanel.add("group");
    buttonGroup.orientation = "column";
    buttonGroup.alignChildren = "fill";
    buttonGroup.spacing = 10;
    
    // Main analysis button
    var analyzeBtn = buttonGroup.add("button", undefined, "Start Document Analysis");
    analyzeBtn.preferredSize.height = 35;
    analyzeBtn.onClick = function() {
        parentWindow.close();
        showMainInterface();
    };
    
    // Quick buttons row
    var quickRow = buttonGroup.add("group");
    quickRow.alignment = "fill";
    
    var validateBtn = quickRow.add("button", undefined, "Validate Setup");
    validateBtn.onClick = function() {
        showValidationDialog();
    };
    
    var helpBtn = quickRow.add("button", undefined, "Help & Guide");
    helpBtn.onClick = function() {
        showComprehensiveHelp();
    };
    
    var aboutBtn = quickRow.add("button", undefined, "About");
    aboutBtn.onClick = function() {
        showAboutDialog();
    };
    
    // Close button
    var closeBtn = buttonGroup.add("button", undefined, "Exit");
    closeBtn.onClick = function() {
        parentWindow.close();
    };
    
    return actionsPanel;
}

function createMenuFooter(parentWindow) {
    var footerGroup = parentWindow.add("group");
    footerGroup.alignment = "fill";
    
    var versionText = footerGroup.add("statictext", undefined, 
        "Version 3.1 • ES3 Compatible • Enhanced Safety");
    versionText.alignment = "left";
    
    var modeText = footerGroup.add("statictext", undefined, "Manual Execution Mode");
    modeText.alignment = "right";
    
    return footerGroup;
}

function generateSystemStatus() {
    var statusBuilder = createStringBuilder();
    
    // Document status
    if (app.documents.length > 0) {
        var doc = app.activeDocument;
        var docName = emergencyGetProperty(doc, 'name', 'Unknown');
        var pageCount = emergencyGetLength(doc.pages, 1000);
        var saved = emergencyGetProperty(doc, 'saved', false);
        
        statusBuilder.appendLine("Document: " + docName);
        statusBuilder.appendLine("Pages: " + pageCount);
        statusBuilder.appendLine("Saved: " + (saved ? "Yes" : "No"));
        statusBuilder.appendLine("Status: Ready for analysis");
    } else {
        statusBuilder.appendLine("No document currently open");
        statusBuilder.appendLine("Please open a document to analyze");
    }
    
    // System status
    statusBuilder.appendLine("");
    statusBuilder.appendLine("System: All modules loaded");
    statusBuilder.appendLine("Memory: " + checkMemoryUsage().status.toUpperCase());
    statusBuilder.appendLine("Safety: Enhanced controls active");
    
    return statusBuilder.toString();
}

// ============================================================================
// VALIDATION AND HELP DIALOGS
// ============================================================================

function showValidationDialog() {
    var validationDialog = new Window("dialog", "System Validation");
    validationDialog.orientation = "column";
    validationDialog.alignChildren = "fill";
    validationDialog.preferredSize.width = 500;
    validationDialog.preferredSize.height = 400;
    
    var validationText = validationDialog.add("statictext", undefined, "Running system validation...");
    validationText.alignment = "center";
    
    var resultsArea = validationDialog.add("edittext", undefined, "", 
        {multiline: true, readonly: true, scrolling: true});
    resultsArea.alignment = "fill";
    resultsArea.preferredSize.height = 300;
    
    var closeBtn = validationDialog.add("button", undefined, "Close");
    closeBtn.alignment = "center";
    closeBtn.onClick = function() {
        validationDialog.close();
    };
    
    // Run validation
    var validationResults = runSystemValidation();
    validationText.text = "System Validation Results";
    resultsArea.text = validationResults;
    
    validationDialog.show();
}

function runSystemValidation() {
    var resultBuilder = createStringBuilder();
    
    resultBuilder.appendLine("SYSTEM VALIDATION REPORT");
    resultBuilder.appendLine(repeatString("=", 30));
    resultBuilder.appendLine("Timestamp: " + toISOString(new Date()));
    resultBuilder.appendLine("");
    
    // Environment checks
    resultBuilder.appendLine("ENVIRONMENT CHECKS:");
    resultBuilder.appendLine("InDesign Application: " + (typeof app !== "undefined" ? "✓ OK" : "✗ FAILED"));
    resultBuilder.appendLine("Document Access: " + (typeof app.documents !== "undefined" ? "✓ OK" : "✗ FAILED"));
    resultBuilder.appendLine("File System: " + (typeof File !== "undefined" ? "✓ OK" : "✗ FAILED"));
    resultBuilder.appendLine("UI System: " + (typeof Window !== "undefined" ? "✓ OK" : "✗ FAILED"));
    resultBuilder.appendLine("");
    
    // Module checks
    resultBuilder.appendLine("MODULE CHECKS:");
    for (var i = 0; i < REQUIRED_MODULES.length; i++) {
        var moduleInfo = REQUIRED_MODULES[i];
        var isValid = false;
        try {
            isValid = moduleInfo.validator();
        } catch (exc) {
            // Module failed
        }
        resultBuilder.appendLine(moduleInfo.name + ": " + (isValid ? "✓ LOADED" : "✗ MISSING"));
    }
    resultBuilder.appendLine("");
    
    // Document checks
    resultBuilder.appendLine("DOCUMENT CHECKS:");
    if (app.documents.length > 0) {
        var doc = app.activeDocument;
        resultBuilder.appendLine("Document Open: ✓ YES");
        resultBuilder.appendLine("Document Name: " + emergencyGetProperty(doc, 'name', 'Unknown'));
        resultBuilder.appendLine("Document Saved: " + (emergencyGetProperty(doc, 'saved', false) ? "✓ YES" : "⚠ NO"));
        resultBuilder.appendLine("Pages Accessible: " + (emergencyGetLength(doc.pages, 1000) > 0 ? "✓ YES" : "✗ NO"));
    } else {
        resultBuilder.appendLine("Document Open: ⚠ NO DOCUMENT");
        resultBuilder.appendLine("Recommendation: Open a document before analysis");
    }
    resultBuilder.appendLine("");
    
    // Memory checks
    var memoryInfo = checkMemoryUsage();
    resultBuilder.appendLine("MEMORY STATUS:");
    resultBuilder.appendLine("Current Usage: " + Math.round(memoryInfo.estimatedUsage / 1024) + " KB");
    resultBuilder.appendLine("Status: " + memoryInfo.status.toUpperCase());
    
    if (memoryInfo.recommendations.length > 0) {
        resultBuilder.appendLine("Recommendations:");
        for (var i = 0; i < memoryInfo.recommendations.length; i++) {
            resultBuilder.appendLine("  • " + memoryInfo.recommendations[i]);
        }
    }
    
    resultBuilder.appendLine("");
    resultBuilder.appendLine("OVERALL STATUS: " + (APPLICATION_STATE.initialized ? "✓ READY" : "✗ NOT READY"));
    
    return resultBuilder.toString();
}

function showComprehensiveHelp() {
    var helpDialog = new Window("dialog", "Comprehensive Help Guide");
    helpDialog.orientation = "column";
    helpDialog.alignChildren = "fill";
    helpDialog.preferredSize.width = 700;
    helpDialog.preferredSize.height = 600;
    
    var helpTabs = helpDialog.add("group");
    helpTabs.alignment = "fill";
    
    helpTabs.add("statictext", undefined, "Help Section:");
    var tabDropdown = helpTabs.add("dropdownlist", undefined, 
        ["Getting Started", "Safety Features", "Target Selection", "Export Options", "Troubleshooting"]);
    tabDropdown.selection = 0;
    
    var helpContent = helpDialog.add("edittext", undefined, "", 
        {multiline: true, readonly: true, scrolling: true});
    helpContent.alignment = "fill";
    helpContent.preferredSize.height = 500;
    
    var closeBtn = helpDialog.add("button", undefined, "Close");
    closeBtn.alignment = "center";
    closeBtn.onClick = function() {
        helpDialog.close();
    };
    
    // Update content based on selection
    tabDropdown.onChange = function() {
        var selectedSection = tabDropdown.selection.text;
        helpContent.text = generateHelpContent(selectedSection);
    };
    
    // Initialize with first section
    helpContent.text = generateHelpContent("Getting Started");
    
    helpDialog.show();
}

function generateHelpContent(sectionName) {
    var contentBuilder = createStringBuilder();
    
    switch (sectionName) {
        case "Getting Started":
            contentBuilder.appendLine("GETTING STARTED WITH INDESIGN DOCUMENT INSPECTOR v3.1");
            contentBuilder.appendLine(repeatString("=", 55));
            contentBuilder.appendLine("");
            contentBuilder.appendLine("1. OPENING A DOCUMENT");
            contentBuilder.appendLine("   • Open an InDesign document first");
            contentBuilder.appendLine("   • Save the document (recommended for stability)");
            contentBuilder.appendLine("   • Ensure you have read permissions");
            contentBuilder.appendLine("");
            contentBuilder.appendLine("2. LAUNCHING THE INSPECTOR");
            contentBuilder.appendLine("   • Run this script from Scripts panel or ESTK");
            contentBuilder.appendLine("   • Choose 'Start Document Analysis' from main menu");
            contentBuilder.appendLine("   • Select analysis targets using checkboxes");
            contentBuilder.appendLine("");
            contentBuilder.appendLine("3. CONFIGURING ANALYSIS");
            contentBuilder.appendLine("   • Set timeout values (1000-10000ms recommended)");
            contentBuilder.appendLine("   • Choose sample limits (5-20 for most documents)");
            contentBuilder.appendLine("   • Select safety mode (Basic recommended for start)");
            contentBuilder.appendLine("");
            contentBuilder.appendLine("4. RUNNING ANALYSIS");
            contentBuilder.appendLine("   • Click 'Validate Setup' to check configuration");
            contentBuilder.appendLine("   • Click 'Run Analysis' to start inspection");
            contentBuilder.appendLine("   • Monitor progress in the progress panel");
            contentBuilder.appendLine("");
            contentBuilder.appendLine("5. VIEWING RESULTS");
            contentBuilder.appendLine("   • Results appear in the Results panel");
            contentBuilder.appendLine("   • Use 'Export Results' for detailed output");
            contentBuilder.appendLine("   • Copy results for use in other applications");
            break;
            
        case "Safety Features":
            contentBuilder.appendLine("SAFETY FEATURES AND PROTECTION SYSTEMS");
            contentBuilder.appendLine(repeatString("=", 42));
            contentBuilder.appendLine("");
            contentBuilder.appendLine("SAFETY LEVELS:");
            contentBuilder.appendLine("✓ Safe - Basic properties, very low risk of hanging");
            contentBuilder.appendLine("⚠ Moderate - Collection access, medium risk");
            contentBuilder.appendLine("⚡ Risky - Complex operations, higher risk");
            contentBuilder.appendLine("");
            contentBuilder.appendLine("SAFETY MODES:");
            contentBuilder.appendLine("• Emergency - Ultra-safe, properties only");
            contentBuilder.appendLine("• Minimal - Basic collections with pre-testing");
            contentBuilder.appendLine("• Basic - Safe collections with timeouts");
            contentBuilder.appendLine("• Standard - Includes text content sampling");
            contentBuilder.appendLine("• Comprehensive - Full analysis with safety");
            contentBuilder.appendLine("");
            contentBuilder.appendLine("PROTECTION MECHANISMS:");
            contentBuilder.appendLine("• Timeout Protection - Prevents hanging operations");
            contentBuilder.appendLine("• Emergency Bailouts - Escape from problematic access");
            contentBuilder.appendLine("• Memory Management - Prevents memory overflow");
            contentBuilder.appendLine("• Error Recovery - Graceful handling of failures");
            contentBuilder.appendLine("• Alternative Access - Fallback property methods");
            contentBuilder.appendLine("");
            contentBuilder.appendLine("BEST PRACTICES:");
            contentBuilder.appendLine("• Start with safe targets only");
            contentBuilder.appendLine("• Use Basic mode for initial testing");
            contentBuilder.appendLine("• Increase timeouts for complex documents");
            contentBuilder.appendLine("• Save document before analysis");
            contentBuilder.appendLine("• Monitor memory usage for large analyses");
            break;
            
        case "Target Selection":
            contentBuilder.appendLine("TARGET SELECTION GUIDE");
            contentBuilder.appendLine(repeatString("=", 25));
            contentBuilder.appendLine("");
            contentBuilder.appendLine("BASIC TARGETS (Recommended for all documents):");
            contentBuilder.appendLine("• Document Properties - Core document information");
            contentBuilder.appendLine("• Page Collection - Page objects and basic properties");
            contentBuilder.appendLine("• Layers - Layer information and visibility");
            contentBuilder.appendLine("");
            contentBuilder.appendLine("TEXT TARGETS (Safe for most documents):");
            contentBuilder.appendLine("• Text Frames - Text frame objects and properties");
            contentBuilder.appendLine("• Text Content - Sample text content (use carefully)");
            contentBuilder.appendLine("");
            contentBuilder.appendLine("GRAPHICS TARGETS (Moderate risk):");
            contentBuilder.appendLine("• Images & Graphics - Image objects and properties");
            contentBuilder.appendLine("• Links & Assets - Linked files and references");
            contentBuilder.appendLine("");
            contentBuilder.appendLine("FORMATTING TARGETS (Generally safe):");
            contentBuilder.appendLine("• Character & Paragraph Styles - Style definitions");
            contentBuilder.appendLine("• Colors & Swatches - Color information");
            contentBuilder.appendLine("");
            contentBuilder.appendLine("COMPREHENSIVE TARGETS (Higher risk):");
            contentBuilder.appendLine("• Page Items - All page objects (use with caution)");
            contentBuilder.appendLine("");
            contentBuilder.appendLine("SELECTION STRATEGIES:");
            contentBuilder.appendLine("• Use 'Select Safe Only' for problem documents");
            contentBuilder.appendLine("• Start small and add targets incrementally");
            contentBuilder.appendLine("• Test with Emergency mode for unstable documents");
            contentBuilder.appendLine("• Monitor processing times and adjust accordingly");
            break;
            
        case "Export Options":
            contentBuilder.appendLine("EXPORT OPTIONS AND FORMATS");
            contentBuilder.appendLine(repeatString("=", 30));
            contentBuilder.appendLine("");
            contentBuilder.appendLine("AVAILABLE FORMATS:");
            contentBuilder.appendLine("• Plain Text (.txt) - Human-readable format");
            contentBuilder.appendLine("• JSON (.json) - Machine-readable structured data");
            contentBuilder.appendLine("• CSV (.csv) - Spreadsheet-compatible format");
            contentBuilder.appendLine("• XML (.xml) - Structured markup format");
            contentBuilder.appendLine("");
            contentBuilder.appendLine("EXPORT FEATURES:");
            contentBuilder.appendLine("• Metadata inclusion - Timestamp and tool info");
            contentBuilder.appendLine("• Error reporting - Detailed error information");
            contentBuilder.appendLine("• Configurable depth - Control detail level");
            contentBuilder.appendLine("• Safe formatting - Escaped special characters");
            contentBuilder.appendLine("");
            contentBuilder.appendLine("EXPORT STRATEGIES:");
            contentBuilder.appendLine("• Use Text format for human review");
            contentBuilder.appendLine("• Use JSON for programmatic processing");
            contentBuilder.appendLine("• Use CSV for spreadsheet analysis");
            contentBuilder.appendLine("• Use XML for structured data exchange");
            contentBuilder.appendLine("");
            contentBuilder.appendLine("QUICK ACTIONS:");
            contentBuilder.appendLine("• Copy to Clipboard - Manual copy dialog");
            contentBuilder.appendLine("• Export Results - Full export with format choice");
            contentBuilder.appendLine("• Save to File - Quick text file save");
            break;
            
        case "Troubleshooting":
            contentBuilder.appendLine("TROUBLESHOOTING GUIDE");
            contentBuilder.appendLine(repeatString("=", 21));
            contentBuilder.appendLine("");
            contentBuilder.appendLine("COMMON ISSUES:");
            contentBuilder.appendLine("");
            contentBuilder.appendLine("1. DOCUMENT NOT RESPONDING");
            contentBuilder.appendLine("   • Use Emergency mode for ultra-safe access");
            contentBuilder.appendLine("   • Reduce timeout values (1000ms or less)");
            contentBuilder.appendLine("   • Select only safe targets");
            contentBuilder.appendLine("   • Save and restart InDesign if needed");
            contentBuilder.appendLine("");
            contentBuilder.appendLine("2. ANALYSIS TAKES TOO LONG");
            contentBuilder.appendLine("   • Reduce sample limits (5-10 items)");
            contentBuilder.appendLine("   • Use Basic or Minimal safety modes");
            contentBuilder.appendLine("   • Disable text content analysis");
            contentBuilder.appendLine("   • Check for very large collections");
            contentBuilder.appendLine("");
            contentBuilder.appendLine("3. MEMORY ISSUES");
            contentBuilder.appendLine("   • Clear results between analyses");
            contentBuilder.appendLine("   • Use lower sample limits");
            contentBuilder.appendLine("   • Restart script for large documents");
            contentBuilder.appendLine("   • Check memory status in validation");
            contentBuilder.appendLine("");
            contentBuilder.appendLine("4. ACCESS ERRORS");
            contentBuilder.appendLine("   • Ensure document is saved");
            contentBuilder.appendLine("   • Check file permissions");
            contentBuilder.appendLine("   • Try different safety modes");
            contentBuilder.appendLine("   • Verify InDesign version compatibility");
            contentBuilder.appendLine("");
            contentBuilder.appendLine("5. EXPORT FAILURES");
            contentBuilder.appendLine("   • Check folder write permissions");
            contentBuilder.appendLine("   • Try different export formats");
            contentBuilder.appendLine("   • Use manual copy for problematic results");
            contentBuilder.appendLine("   • Verify available disk space");
            contentBuilder.appendLine("");
            contentBuilder.appendLine("GETTING HELP:");
            contentBuilder.appendLine("• Use 'Validate Setup' to diagnose issues");
            contentBuilder.appendLine("• Check ExtendScript console for detailed errors");
            contentBuilder.appendLine("• Start with Emergency mode for testing");
            contentBuilder.appendLine("• Document your settings for successful analyses");
            break;
    }
    
    return contentBuilder.toString();
}

function showAboutDialog() {
    var aboutDialog = new Window("dialog", "About InDesign Document Inspector");
    aboutDialog.orientation = "column";
    aboutDialog.alignChildren = "fill";
    aboutDialog.preferredSize.width = 500;
    aboutDialog.preferredSize.height = 450;
    
    var titleText = aboutDialog.add("statictext", undefined, 
        "InDesign Document Inspector v3.1\nEnhanced Safety Edition");
    titleText.alignment = "center";
    titleText.graphics.font = ScriptUI.newFont("dialog", "Bold", 16);
    
    var descText = aboutDialog.add("statictext", undefined,
        "Professional-grade document analysis tool with enhanced safety controls.\n" +
        "Manual execution mode with configurable property targeting.",
        {multiline: true});
    descText.alignment = "center";
    
    var featuresText = aboutDialog.add("statictext", undefined,
        "ENHANCED FEATURES:\n" +
        "• ES3 Compatible ExtendScript implementation\n" +
        "• Manual execution with configurable targeting\n" +
        "• Enhanced safety controls and emergency bailouts\n" +
        "• Multiple export formats (JSON, XML, CSV, Text)\n" +
        "• Comprehensive error handling and recovery\n" +
        "• Memory management and performance monitoring\n" +
        "• Progressive safety modes (Emergency to Comprehensive)\n" +
        "• Real-time progress tracking and validation\n" +
        "• Alternative property access methods\n" +
        "• Modular architecture with isolated components",
        {multiline: true});
    
    var techText = aboutDialog.add("statictext", undefined,
        "TECHNICAL SPECIFICATIONS:\n" +
        "• Version: 3.1 Enhanced Safety Edition\n" +
        "• Compatibility: InDesign CS3+ with ExtendScript\n" +
        "• Architecture: 6 ES3-compatible modules\n" +
        "• Safety Level: Enhanced with Emergency Protection\n" +
        "• Execution Mode: Manual with UI Configuration\n" +
        "• Memory Management: Active with cleanup routines\n" +
        "• Error Handling: Comprehensive with categorization\n" +
        "• Performance: Optimized for large document analysis",
        {multiline: true});
    
    var closeBtn = aboutDialog.add("button", undefined, "Close");
    closeBtn.alignment = "center";
    closeBtn.onClick = function() {
        aboutDialog.close();
    };
    
    aboutDialog.show();
}

// ============================================================================
// APPLICATION LIFECYCLE MANAGEMENT
// ============================================================================

function shutdownApplication() {
    debugLog("Starting application shutdown", "SHUTDOWN");
    
    try {
        // Cleanup utilities
        if (typeof cleanupUtilities === "function") {
            cleanupUtilities();
        }
        
        // Clear application state
        APPLICATION_STATE.initialized = false;
        APPLICATION_STATE.lastError = null;
        
        // Final memory cleanup
        if (typeof QUERY_CONFIG !== "undefined" && QUERY_CONFIG.runtime) {
            QUERY_CONFIG.runtime.analysisActive = false;
            QUERY_CONFIG.runtime.debugLog = [];
            QUERY_CONFIG.runtime.errors = [];
        }
        
        // Garbage collection hint
        if (typeof $.gc === "function") {
            $.gc();
        }
        
        debugLog("Application shutdown completed", "SHUTDOWN");
        
    } catch (exc) {
        $.writeln("Shutdown error: " + exc.message);
    }
}

function restartApplication() {
    debugLog("Restarting application", "RESTART");
    
    try {
        shutdownApplication();
        
        // Brief delay for cleanup
        $.sleep(100);
        
        // Reinitialize
        if (initializeApplication()) {
            debugLog("Application restarted successfully", "RESTART");
            return true;
        } else {
            debugLog("Application restart failed", "RESTART");
            return false;
        }
        
    } catch (exc) {
        debugLog("Restart error: " + exc.message, "RESTART");
        return false;
    }
}

// ============================================================================
// SCRIPT ENTRY POINT
// ============================================================================

// Main script execution
try {
    $.writeln(repeatString("=", 70));
    $.writeln("InDesign Document Inspector v3.1 - Enhanced Safety Edition");
    $.writeln("Manual Execution Mode - Starting initialization...");
    $.writeln(repeatString("=", 70));
    
    // Initialize application
    var initSuccess = initializeApplication();
    
    if (!initSuccess) {
        throw new Error("Application initialization failed - see console for details");
    }
    
    $.writeln("Application started successfully - Manual mode active");
    $.writeln("Check the main interface for analysis options");
    $.writeln(repeatString("=", 70));
    
} catch (exc) {
    // Critical error handling
    var criticalError = "InDesign Document Inspector v3.1\n\n" +
                       "CRITICAL ERROR: " + exc.message + "\n\n" +
                       "The application failed to start properly.\n" +
                       "This may be due to:\n\n" +
                       "• Missing or corrupted module files\n" +
                       "• InDesign version incompatibility\n" +
                       "• Insufficient system permissions\n" +
                       "• ExtendScript environment issues\n\n" +
                       "Please check all module files are present and try again.\n" +
                       "If the problem persists, restart InDesign and try again.";
    
    alert(criticalError);
    
    $.writeln("!!! CRITICAL ERROR !!!");
    $.writeln("Application startup failed: " + exc.message);
    $.writeln("Please check all module files and try again");
    $.writeln(repeatString("=", 70));
}

$.writeln("Module 5.0: Main Entry Point loaded (Application Lifecycle Management)");