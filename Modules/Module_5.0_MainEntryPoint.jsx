// ============================================================================
// MODULE 5.0: MAIN ENTRY POINT
// InDesign Document Query Tool v3.0 - Configurable Analysis
// ES3 Compatible - Script Initialization and Startup
// ============================================================================

// MAIN INITIALIZATION - Entry point for the entire tool
function initializeQueryTool() {
    try {
        $.writeln("=".repeat ? "=".repeat(60) : "============================================================");
        $.writeln("InDesign Document Query Tool v3.0 - Configurable Analysis");
        $.writeln("Lightweight DOM Tree Generator with Progressive Safety");
        $.writeln("Loading modular architecture...");
        $.writeln("=".repeat ? "=".repeat(60) : "============================================================");
        
        // Verify all modules are loaded
        var moduleTests = [
            { name: "Module A (Config)", test: function() { return typeof QUERY_CONFIG !== 'undefined'; } },
            { name: "Module B (Analysis)", test: function() { return typeof analyzeDocumentToTree === 'function'; } },
            { name: "Module C (UI)", test: function() { return typeof createMainInterface === 'function'; } },
            { name: "Module D (Export)", test: function() { return typeof showResultsDialog === 'function'; } }
        ];
        
        $.writeln("Module verification:");
        for (var i = 0; i < moduleTests.length; i++) {
            var module = moduleTests[i];
            var passed = module.test();
            $.writeln("  " + module.name + ": " + (passed ? "✓ LOADED" : "✗ MISSING"));
            if (!passed) {
                throw new Error(module.name + " failed to load properly");
            }
        }
        
        $.writeln("\nAll modules loaded successfully!");
        $.writeln("Initializing query tool interface...");
        
        // Show startup dialog
        showStartupDialog();
        
    } catch (exc) {
        var errorMsg = "InDesign Document Query Tool v3.0\n\n" +
                       "Initialization Error: " + exc.message + "\n\n" +
                       "This tool requires all modules to be loaded properly.\n" +
                       "Please ensure all module files are available.";
        
        alert(errorMsg);
        $.writeln("INITIALIZATION ERROR: " + exc.message);
    }
}

// STARTUP DIALOG - Choose how to launch the tool
function showStartupDialog() {
    var startupDialog = new Window("dialog", "InDesign Document Query Tool v3.0");
    startupDialog.orientation = "column";
    startupDialog.alignChildren = "fill";
    startupDialog.preferredSize.width = 500;
    startupDialog.preferredSize.height = 400;
    
    // Header
    var headerPanel = startupDialog.add("panel", undefined, "Welcome to Document Query Tool v3.0");
    headerPanel.orientation = "column";
    headerPanel.alignChildren = "fill";
    
    var welcomeText = headerPanel.add("statictext", undefined, 
        "A lightweight, configurable tool for analyzing InDesign documents.\n" +
        "Generate DOM-like trees of document properties with safety controls.\n\n" +
        "✓ Progressive safety system prevents hanging\n" +
        "✓ Configurable analysis targets and depth\n" +
        "✓ Real-time progress tracking\n" +
        "✓ Export results to files or view in tree format",
        {multiline: true});
    welcomeText.alignment = "fill";
    
    // Document status
    var statusPanel = startupDialog.add("panel", undefined, "Current Document Status");
    statusPanel.orientation = "column";
    statusPanel.alignChildren = "fill";
    
    var docStatus = "No document open";
    var canAnalyze = false;
    
    if (app.documents.length > 0) {
        var doc = app.activeDocument;
        var docName = "Unknown";
        try {
            docName = doc.name || "Unnamed Document";
            docStatus = "Document: " + docName;
            if (doc.saved && doc.filePath) {
                docStatus += "\nPath: " + doc.filePath.toString();
                docStatus += "\nStatus: Saved and ready for analysis";
                canAnalyze = true;
            } else {
                docStatus += "\nStatus: Unsaved (can still analyze)";
                canAnalyze = true;
            }
        } catch (e) {
            docStatus = "Document access error: " + e.message;
        }
    }
    
    var docStatusText = statusPanel.add("statictext", undefined, docStatus, {multiline: true});
    docStatusText.alignment = "fill";
    
    // Quick start options
    var quickPanel = startupDialog.add("panel", undefined, "Quick Start Options");
    quickPanel.orientation = "column";
    quickPanel.alignChildren = "fill";
    
    var fullInterfaceBtn = quickPanel.add("button", undefined, "🎛️ Open Full Interface (Recommended)");
    fullInterfaceBtn.preferredSize.height = 35;
    
    var quickAnalysisBtn = quickPanel.add("button", undefined, "⚡ Quick Analysis (Current Document)");
    quickAnalysisBtn.preferredSize.height = 35;
    quickAnalysisBtn.enabled = canAnalyze;
    
    var loadDocBtn = quickPanel.add("button", undefined, "📁 Load Document & Analyze");
    loadDocBtn.preferredSize.height = 35;
    
    // Advanced options
    var advancedPanel = startupDialog.add("panel", undefined, "Advanced Options");
    advancedPanel.orientation = "row";
    advancedPanel.alignChildren = "center";
    
    var configBtn = advancedPanel.add("button", undefined, "⚙️ Load Config");
    var helpBtn = advancedPanel.add("button", undefined, "❓ Help");
    var aboutBtn = advancedPanel.add("button", undefined, "ℹ️ About");
    
    // Bottom buttons
    var buttonPanel = startupDialog.add("group");
    buttonPanel.orientation = "row";
    buttonPanel.alignment = "center";
    
    var cancelBtn = buttonPanel.add("button", undefined, "Cancel");
    
    // Event handlers
    fullInterfaceBtn.onClick = function() {
        startupDialog.close();
        showMainInterface();
    };
    
    quickAnalysisBtn.onClick = function() {
        startupDialog.close();
        runQuickAnalysis();
    };
    
    loadDocBtn.onClick = function() {
        startupDialog.close();
        loadDocumentAndAnalyze();
    };
    
    configBtn.onClick = function() {
        if (importConfiguration()) {
            alert("Configuration loaded! The settings will be applied when you open the interface.");
        }
    };
    
    helpBtn.onClick = function() {
        showHelpDialog();
    };
    
    aboutBtn.onClick = function() {
        showAboutDialog();
    };
    
    cancelBtn.onClick = function() {
        startupDialog.close();
    };
    
    startupDialog.show();
}

// QUICK ANALYSIS - Fast analysis with default settings
function runQuickAnalysis() {
    if (app.documents.length === 0) {
        alert("No document is currently open. Please open a document first.");
        return;
    }
    
    try {
        var doc = app.activeDocument;
        
        // Apply basic safe preset
        applyPreset("basicSafe");
        
        $.writeln("Starting quick analysis with Basic Safe preset...");
        
        // Create simple progress dialog
        var progressDialog = new Window("dialog", "Quick Analysis in Progress");
        progressDialog.orientation = "column";
        progressDialog.alignChildren = "center";
        progressDialog.preferredSize.width = 400;
        
        var statusText = progressDialog.add("statictext", undefined, "Analyzing document...");
        var progressBar = progressDialog.add("progressbar", undefined, 0, 100);
        progressBar.preferredSize.width = 300;
        
        var cancelBtn = progressDialog.add("button", undefined, "Cancel");
        var cancelled = false;
        
        cancelBtn.onClick = function() {
            cancelled = true;
            progressDialog.close();
        };
        
        // Set up progress callback
        QUERY_CONFIG.runtime.progressCallback = function(progress) {
            if (cancelled) return;
            statusText.text = progress.currentTarget + ": " + progress.currentPath;
            progressBar.value = progress.percentage || 0;
            progressDialog.update();
        };
        
        progressDialog.show();
        
        if (!cancelled) {
            var results = analyzeDocumentToTree(doc);
            progressDialog.close();
            
            if (results) {
                showResultsDialog(results);
            } else {
                alert("Quick analysis failed to generate results.");
            }
        }
        
    } catch (e) {
        alert("Quick analysis failed: " + e.message);
        $.writeln("Quick analysis error: " + e.message);
    }
}

// LOAD DOCUMENT AND ANALYZE - File picker and analysis
function loadDocumentAndAnalyze() {
    try {
        var file = File.openDialog("Select InDesign Document", "*.indd;*.indt");
        if (!file) return;
        
        $.writeln("Loading document: " + file.fsName);
        
        var doc = app.open(file);
        QUERY_CONFIG.paths.currentDocument = doc;
        QUERY_CONFIG.paths.documentPath = file.fsName;
        
        alert("Document loaded: " + doc.name + "\n\nOpening analysis interface...");
        
        showMainInterface();
        
    } catch (e) {
        alert("Failed to load document: " + e.message);
        $.writeln("Document load error: " + e.message);
    }
}

// HELP DIALOG - Usage instructions
function showHelpDialog() {
    var helpDialog = new Window("dialog", "InDesign Document Query Tool - Help");
    helpDialog.orientation = "column";
    helpDialog.alignChildren = "fill";
    helpDialog.preferredSize.width = 600;
    helpDialog.preferredSize.height = 500;
    
    var helpText = helpDialog.add("edittext", undefined, 
        "INDESIGN DOCUMENT QUERY TOOL v3.0 - HELP\n" +
        "==========================================\n\n" +
        
        "OVERVIEW:\n" +
        "This tool analyzes InDesign documents and creates DOM-like trees of properties,\n" +
        "collections, and values. It's designed to be safe and prevent hanging.\n\n" +
        
        "GETTING STARTED:\n" +
        "1. Open an InDesign document (or use 'Load Document')\n" +
        "2. Choose 'Open Full Interface' for complete control\n" +
        "3. Or use 'Quick Analysis' for fast results with safe defaults\n\n" +
        
        "MAIN INTERFACE:\n" +
        "• File Paths: Set document and output locations\n" +
        "• Target Selection: Choose what to analyze (checkboxes)\n" +
        "• Configuration: Set depth, timeouts, and display options\n" +
        "• Presets: Quick configurations (Basic Safe, Text Only, Full Scan)\n" +
        "• Progress: Real-time feedback shows current operations\n\n" +
        
        "ANALYSIS TARGETS:\n" +
        "✓ Document Properties - Core document info (always safe)\n" +
        "✓ Pages - Page collection and properties (safe)\n" +
        "✓ Text Frames - Text frame objects (safe)\n" +
        "✓ Stories - Story objects and threading (safe)\n" +
        "✓ Layers - Layer information (safe)\n" +
        "⚠ Images - Image objects (can be slow, use caution)\n" +
        "⚠ Links - Link information (can be slow, use caution)\n" +
        "⚠ Page Items - All page items (can be very slow)\n" +
        "✓ Styles - Paragraph and character styles (safe)\n" +
        "✓ Colors - Color definitions (safe)\n" +
        "✓ Fonts - Font information (safe)\n\n" +
        
        "SAFETY FEATURES:\n" +
        "• Emergency Bailouts: Stop operations that take too long\n" +
        "• Progressive Depth: Limit how deep the analysis goes\n" +
        "• Sample Limits: Only analyze a subset of large collections\n" +
        "• Timeout Controls: Set maximum time for operations\n" +
        "• Real-time Progress: See exactly what's being analyzed\n\n" +
        
        "RESULTS:\n" +
        "• Tree View: Hierarchical display of document structure\n" +
        "• Export Options: Save to text files or JSON format\n" +
        "• Statistics: Success rates, error counts, depth reached\n" +
        "• Path Tracking: See exact property paths that were tested\n\n" +
        
        "PRESETS:\n" +
        "• Basic Safe: Only safest collections, depth 2, 5 samples\n" +
        "• Text Only: Focus on text-related properties\n" +
        "• Full Scan: All collections with safety limits\n\n" +
        
        "TROUBLESHOOTING:\n" +
        "• If analysis hangs: Use lower depth, smaller samples, shorter timeouts\n" +
        "• For complex documents: Start with Basic Safe preset\n" +
        "• High error rates: Enable Emergency Bailouts\n" +
        "• Slow performance: Reduce sample limits and disable risky collections\n\n" +
        
        "OUTPUT FORMATS:\n" +
        "• Text Tree: Human-readable hierarchical format\n" +
        "• JSON Export: Structured data for programmatic use\n" +
        "• Statistics Summary: Analysis metrics and recommendations\n\n" +
        
        "COMPARING DOCUMENTS:\n" +
        "1. Analyze first document and export results\n" +
        "2. Change document path to second document\n" +
        "3. Analyze second document and export results\n" +
        "4. Manually compare the exported files\n\n" +
        
        "For more detailed information, check the console output during analysis.",
        {multiline: true, readonly: true});
    helpText.alignment = "fill";
    
    var closeBtn = helpDialog.add("button", undefined, "Close");
    closeBtn.alignment = "center";
    closeBtn.onClick = function() {
        helpDialog.close();
    };
    
    helpDialog.show();
}

// ABOUT DIALOG - Tool information
function showAboutDialog() {
    var aboutDialog = new Window("dialog", "About InDesign Document Query Tool");
    aboutDialog.orientation = "column";
    aboutDialog.alignChildren = "center";
    aboutDialog.preferredSize.width = 450;
    aboutDialog.preferredSize.height = 350;
    
    var titleText = aboutDialog.add("statictext", undefined, "InDesign Document Query Tool");
    titleText.graphics.font = ScriptUI.newFont("Arial", ScriptUI.FontStyle.BOLD, 16);
    
    var versionText = aboutDialog.add("statictext", undefined, "Version 3.0 - Configurable Analysis");
    
    var descText = aboutDialog.add("statictext", undefined, 
        "A lightweight, modular tool for safely analyzing\n" +
        "InDesign document structures and properties.\n\n" +
        "Built with progressive safety architecture to prevent\n" +
        "hanging on problematic documents while providing\n" +
        "detailed insights into document composition.",
        {multiline: true});
    descText.alignment = "center";
    
    var featuresText = aboutDialog.add("statictext", undefined,
        "Key Features:\n" +
        "• ES3 Compatible ExtendScript\n" +
        "• Modular architecture with 5 core modules\n" +
        "• Real-time progress tracking\n" +
        "• Configurable safety controls\n" +
        "• DOM-like tree structure output\n" +
        "• Multiple export formats\n" +
        "• Preset configurations for common use cases",
        {multiline: true});
    
    var techText = aboutDialog.add("statictext", undefined,
        "Architecture: 5 ES3-compatible modules\n" +
        "• Module A: Configuration & Safety Framework\n" +
        "• Module B: Document Analysis & Tree Builder\n" +
        "• Module C: UI Panel & Controls\n" +
        "• Module D: Export & Results Display\n" +
        "• Module E: Main Entry Point",
        {multiline: true});
    
    var closeBtn = aboutDialog.add("button", undefined, "Close");
    closeBtn.onClick = function() {
        aboutDialog.close();
    };
    
    aboutDialog.show();
}

// UTILITIES FOR MAIN SCRIPT
function checkEnvironment() {
    var checks = {
        indesign: typeof app !== 'undefined' && app.name.indexOf("InDesign") !== -1,
        documents: app && app.documents !== undefined,
        filesystem: typeof File !== 'undefined' && typeof Folder !== 'undefined',
        ui: typeof Window !== 'undefined'
    };
    
    $.writeln("Environment check:");
    $.writeln("  InDesign App: " + (checks.indesign ? "✓" : "✗"));
    $.writeln("  Documents Access: " + (checks.documents ? "✓" : "✗"));
    $.writeln("  File System: " + (checks.filesystem ? "✓" : "✗"));
    $.writeln("  UI System: " + (checks.ui ? "✓" : "✗"));
    
    var allPassed = checks.indesign && checks.documents && checks.filesystem && checks.ui;
    $.writeln("  Overall: " + (allPassed ? "✓ Ready" : "✗ Issues detected"));
    
    return allPassed;
}

// ERROR HANDLING FOR MAIN SCRIPT
function handleScriptError(error, context) {
    var errorMsg = "InDesign Document Query Tool v3.0\n\n";
    errorMsg += "Error in " + (context || "main script") + ":\n";
    errorMsg += error.message + "\n\n";
    
    if (error.line) {
        errorMsg += "Line: " + error.line + "\n\n";
    }
    
    errorMsg += "Context: " + (context || "Unknown") + "\n";
    errorMsg += "This is a lightweight tool - try using simpler settings\n";
    errorMsg += "or check the ESTK console for detailed error information.";
    
    alert(errorMsg);
    
    $.writeln("=== SCRIPT ERROR ===");
    $.writeln("Context: " + (context || "main"));
    $.writeln("Message: " + error.message);
    if (error.line) $.writeln("Line: " + error.line);
    if (error.stack) $.writeln("Stack: " + error.stack);
    $.writeln("====================");
}

// MAIN SCRIPT EXECUTION
try {
    $.writeln("\n" + new Date().toString());
    $.writeln("Starting InDesign Document Query Tool v3.0...");
    
    // Environment check
    if (!checkEnvironment()) {
        throw new Error("Environment check failed - InDesign features not available");
    }
    
    // Initialize the tool
    initializeQueryTool();
    
} catch (mainError) {
    handleScriptError(mainError, "main initialization");
}

$.writeln("Module E: Main Entry Point loaded - Script ready for use");