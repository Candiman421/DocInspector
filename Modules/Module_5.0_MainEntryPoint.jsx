// ============================================================================
// MODULE 5.0: MAIN ENTRY POINT (UPDATED)
// InDesign Document Query Tool v3.1 - Enhanced Initialization and Startup
// ES3 Compatible - Script Initialization with Best Practice Safety
// ============================================================================

// MAIN INITIALIZATION - Enhanced entry point with comprehensive validation
function initializeQueryTool() {
    try {
        // Enhanced startup banner
        var banner = "=".charAt ? String("=").charAt(0).repeat ? String("=").charAt(0).repeat(70) : "======================================================================" : "======================================================================";
        $.writeln(banner);
        $.writeln("InDesign Document Query Tool v3.1 - Enhanced Safety & Analysis");
        $.writeln("Lightweight DOM Tree Generator with Best Practice Safety Controls");
        $.writeln("Enhanced with comprehensive error handling and progress tracking");
        $.writeln(banner);
        
        // Environment validation first
        if (!validateEnvironmentComprehensive()) {
            throw new Error("Environment validation failed - see console for details");
        }
        
        // Module verification with enhanced testing
        var moduleTests = [
            { 
                name: "Module 1 (Enhanced Config)", 
                test: function() { return typeof QUERY_CONFIG !== "undefined" && typeof emergencyGetProperty === "function"; }
            },
            { 
                name: "Module 2A (Analysis Core)", 
                test: function() { return typeof analyzeDocumentToTree === "function" && typeof createDocumentMetadata === "function"; }
            },
            { 
                name: "Module 2B (Tree Builder)", 
                test: function() { return typeof createTreeNode === "function" && typeof getTreeStatistics === "function"; }
            },
            { 
                name: "Module 3 (Enhanced UI)", 
                test: function() { return typeof createMainInterface === "function" && typeof updateUIProgressSafely === "function"; }
            },
            { 
                name: "Module 4 (Enhanced Export)", 
                test: function() { return typeof showResultsDialog === "function" && typeof exportTreeToFileEnhanced === "function"; }
            }
        ];
        
        $.writeln("Enhanced module verification:");
        var allModulesLoaded = true;
        
        for (var i = 0; i < moduleTests.length; i++) {
            var module = moduleTests[i];
            var passed = false;
            
            try {
                passed = module.test();
            } catch (testError) {
                $.writeln("  " + module.name + ": ✗ TEST FAILED - " + testError.message);
                allModulesLoaded = false;
                continue;
            }
            
            $.writeln("  " + module.name + ": " + (passed ? "✓ LOADED" : "✗ MISSING"));
            if (!passed) {
                allModulesLoaded = false;
            }
        }
        
        if (!allModulesLoaded) {
            throw new Error("One or more enhanced modules failed to load properly");
        }
        
        $.writeln("\n✓ All enhanced modules loaded successfully!");
        $.writeln("✓ Safety framework initialized");
        $.writeln("✓ Best practice functions available");
        $.writeln("Initializing enhanced user interface...");
        
        // Initialize with enhanced startup dialog
        showEnhancedStartupDialog();
        
    } catch (exc) {
        var errorMsg = "InDesign Document Query Tool v3.1\n\n" +
                       "Enhanced Initialization Error: " + exc.message + "\n\n" +
                       "This tool requires all enhanced modules to be loaded properly.\n" +
                       "Please ensure all module files are available and compatible.\n\n" +
                       "Check the ESTK console for detailed error information.";
        
        alert(errorMsg);
        $.writeln("ENHANCED INITIALIZATION ERROR: " + exc.message);
        if (exc.line) {
            $.writeln("Error occurred at line: " + exc.line);
        }
    }
}

// ENHANCED ENVIRONMENT VALIDATION - Comprehensive system checks
function validateEnvironmentComprehensive() {
    $.writeln("Performing comprehensive environment validation...");
    
    var checks = {
        indesign: {
            test: function() { return typeof app !== "undefined" && app.name.indexOf("InDesign") !== -1; },
            description: "InDesign Application"
        },
        documents: {
            test: function() { return typeof app !== "undefined" && typeof app.documents !== "undefined"; },
            description: "Document Access"
        },
        filesystem: {
            test: function() { return typeof File !== "undefined" && typeof Folder !== "undefined"; },
            description: "File System Access"
        },
        ui: {
            test: function() { return typeof Window !== "undefined"; },
            description: "UI System"
        },
        estk: {
            test: function() { return typeof $.writeln === "function"; },
            description: "ExtendScript Toolkit"
        },
        errorHandling: {
            test: function() { return typeof Error !== "undefined"; },
            description: "Error Handling"
        },
        dateTime: {
            test: function() { return typeof Date !== "undefined"; },
            description: "Date/Time Functions"
        }
    };
    
    var allPassed = true;
    var passedCount = 0;
    var totalCount = 0;
    
    $.writeln("Environment check results:");
    
    for (var checkName in checks) {
        var check = checks[checkName];
        totalCount++;
        
        try {
            var passed = check.test();
            $.writeln("  " + check.description + ": " + (passed ? "✓ Available" : "✗ Missing"));
            
            if (passed) {
                passedCount++;
            } else {
                allPassed = false;
            }
        } catch (checkError) {
            $.writeln("  " + check.description + ": ✗ Error - " + checkError.message);
            allPassed = false;
        }
    }
    
    var successRate = Math.round((passedCount / totalCount) * 100);
    $.writeln("  Overall: " + (allPassed ? "✓ All systems ready" : "✗ Issues detected") + 
              " (" + passedCount + "/" + totalCount + " - " + successRate + "%)");
    
    if (!allPassed) {
        $.writeln("Environment validation failed. Some features may not work correctly.");
    }
    
    return allPassed;
}

// ENHANCED STARTUP DIALOG - Comprehensive launch options with safety info
function showEnhancedStartupDialog() {
    try {
        var startupDialog = new Window("dialog", "InDesign Document Query Tool v3.1 - Enhanced Edition");
        startupDialog.orientation = "column";
        startupDialog.alignChildren = "fill";
        startupDialog.preferredSize.width = 600;
        startupDialog.preferredSize.height = 500;
        
        // Enhanced header with comprehensive info
        var headerPanel = startupDialog.add("panel", undefined, "Welcome to Enhanced Document Query Tool v3.1");
        headerPanel.orientation = "column";
        headerPanel.alignChildren = "fill";
        
        var welcomeText = headerPanel.add("statictext", undefined, 
            "Professional-grade document analysis with enhanced safety controls.\n" +
            "Generate comprehensive DOM-like trees with best practice safety.\n\n" +
            "✓ Enhanced progressive safety system prevents hanging\n" +
            "✓ Best practice property access functions from chunk analysis\n" +
            "✓ Comprehensive error handling and recovery\n" +
            "✓ Real-time progress tracking with safety metrics\n" +
            "✓ Memory management and cleanup automation\n" +
            "✓ Advanced export options with detailed statistics",
            {multiline: true});
        welcomeText.alignment = "fill";
        
        // Enhanced document status with detailed info
        var statusPanel = startupDialog.add("panel", undefined, "Current Environment Status");
        statusPanel.orientation = "column";
        statusPanel.alignChildren = "fill";
        
        var docCount = 0;
        var docName = "None";
        
        try {
            if (app && app.documents) {
                docCount = app.documents.length;
                if (docCount > 0) {
                    docName = app.activeDocument.name;
                }
            }
        } catch (docError) {
            docName = "Error accessing documents";
        }
        
        var statusText = "Documents Open: " + docCount + "\n";
        statusText += "Active Document: " + docName + "\n";
        statusText += "Safety Framework: Enhanced Mode\n";
        statusText += "Error Recovery: Enabled\n";
        statusText += "Memory Management: Automatic";
        
        var statusDisplay = statusPanel.add("statictext", undefined, statusText, {multiline: true});
        statusDisplay.alignment = "fill";
        
        // Enhanced action buttons with descriptions
        var actionPanel = startupDialog.add("panel", undefined, "Launch Options");
        actionPanel.orientation = "column";
        actionPanel.alignChildren = "fill";
        
        var fullBtn = actionPanel.add("button", undefined, "Open Enhanced Full Interface");
        var quickBtn = actionPanel.add("button", undefined, "Quick Analysis (Safe Defaults)");
        var aboutBtn = actionPanel.add("button", undefined, "About & Technical Details");
        var helpBtn = actionPanel.add("button", undefined, "Enhanced Help & Safety Guide");
        var exitBtn = actionPanel.add("button", undefined, "Exit");
        
        // Enhanced button descriptions
        var buttonPanel = actionPanel.add("group");
        buttonPanel.orientation = "column";
        buttonPanel.alignChildren = "fill";
        
        var descText = buttonPanel.add("statictext", undefined,
            "• Full Interface: Complete control over all analysis options and safety settings\n" +
            "• Quick Analysis: Instant analysis using safest settings for fast results\n" +
            "• About: Technical specifications and architectural details\n" +
            "• Help: Comprehensive guide to enhanced features and safety controls",
            {multiline: true});
        
        // Enhanced event handlers
        fullBtn.onClick = function() {
            startupDialog.close();
            try {
                var mainInterface = createMainInterface();
                if (mainInterface) {
                    mainInterface.show();
                } else {
                    alert("Failed to create main interface. Check console for errors.");
                }
            } catch (e) {
                alert("Error opening interface: " + e.message);
            }
        };
        
        quickBtn.onClick = function() {
            startupDialog.close();
            try {
                performQuickAnalysisEnhanced();
            } catch (e) {
                alert("Quick analysis failed: " + e.message);
            }
        };
        
        aboutBtn.onClick = function() {
            showEnhancedAboutDialog();
        };
        
        helpBtn.onClick = function() {
            showEnhancedHelpDialog();
        };
        
        exitBtn.onClick = function() {
            startupDialog.close();
        };
        
        startupDialog.show();
        
    } catch (exc) {
        alert("Failed to show enhanced startup dialog: " + exc.message);
        $.writeln("Enhanced startup dialog error: " + exc.message);
    }
}

// ENHANCED QUICK ANALYSIS - Safe defaults with comprehensive results
function performQuickAnalysisEnhanced() {
    try {
        // Check for document
        if (!app.documents.length) {
            alert("No documents are open. Please open an InDesign document first.");
            return;
        }
        
        $.writeln("Starting enhanced quick analysis...");
        
        // Apply safe preset
        if (!applyPreset("basicSafe")) {
            throw new Error("Failed to apply safe preset configuration");
        }
        
        // Additional safety settings for quick analysis
        QUERY_CONFIG.traversal.emergencyBailouts = true;
        QUERY_CONFIG.traversal.maxDepth = 2;
        QUERY_CONFIG.traversal.timeoutMs = 2000;
        QUERY_CONFIG.safety.useEmergencyFunctions = true;
        
        var doc = app.activeDocument;
        $.writeln("Analyzing document: " + doc.name);
        
        // Perform analysis with enhanced safety
        var startTime = new Date().getTime();
        var results = analyzeDocumentToTree(doc);
        var analysisTime = new Date().getTime() - startTime;
        
        if (results) {
            // Enhanced results processing
            var stats = getTreeStatistics(results);
            var validation = validateTreeStructure(results);
            
            // Create comprehensive summary
            var summary = "ENHANCED QUICK ANALYSIS RESULTS\n";
            summary += "==============================\n\n";
            summary += "Document: " + doc.name + "\n";
            summary += "Analysis Time: " + analysisTime + "ms\n";
            summary += "Safety Mode: Enhanced Emergency\n\n";
            
            summary += "STATISTICS:\n";
            summary += "Total Nodes: " + stats.totalNodes + "\n";
            summary += "Success Rate: " + Math.round((stats.successNodes/stats.totalNodes)*100) + "%\n";
            summary += "Errors: " + stats.errorNodes + "\n";
            summary += "Timeouts: " + stats.timeoutNodes + "\n";
            summary += "Max Depth: " + stats.maxDepth + "\n\n";
            
            summary += "VALIDATION:\n";
            summary += "Tree Valid: " + (validation.isValid ? "YES" : "NO") + "\n";
            summary += "Nodes Checked: " + validation.nodesChecked + "\n";
            summary += "Issues Found: " + (validation.errors.length + validation.warnings.length) + "\n\n";
            
            summary += "SAFETY METRICS:\n";
            summary += "Runtime Errors: " + QUERY_CONFIG.runtime.errorCount + "\n";
            summary += "Emergency Timeouts: " + stats.timeoutNodes + "\n";
            summary += "Memory Cleanups: Performed\n\n";
            
            summary += "Use 'Show Full Results' for detailed tree view.";
            
            // Show results with enhanced dialog
            alert(summary);
            
            // Offer to show full results
            if (confirm("Quick analysis completed successfully!\n\nWould you like to view the detailed results tree?")) {
                showResultsDialog(results);
            }
            
            // Offer export
            if (confirm("Would you like to export the results to a file?")) {
                exportTreeToFileEnhanced(results);
            }
            
        } else {
            alert("Enhanced quick analysis failed to produce results.\nCheck the ESTK console for detailed error information.");
        }
        
    } catch (exc) {
        alert("Enhanced quick analysis error: " + exc.message);
        $.writeln("Quick analysis error: " + exc.message);
    }
}

// ENHANCED ABOUT DIALOG - Technical details and architecture info
function showEnhancedAboutDialog() {
    var aboutDialog = new Window("dialog", "About InDesign Document Query Tool v3.1");
    aboutDialog.orientation = "column";
    aboutDialog.alignChildren = "fill";
    aboutDialog.preferredSize.width = 650;
    aboutDialog.preferredSize.height = 600;
    
    var titleText = aboutDialog.add("statictext", undefined, "InDesign Document Query Tool v3.1");
    titleText.graphics.font = "dialog-18";
    
    var subtitleText = aboutDialog.add("statictext", undefined, "Enhanced Safety Edition with Best Practice Integration");
    
    var descText = aboutDialog.add("statictext", undefined,
        "Professional document analysis tool with comprehensive safety controls.\n" +
        "Built with enhanced error handling and best practice safety functions.\n" +
        "Designed for production use with complex InDesign documents.",
        {multiline: true});
    descText.alignment = "center";
    
    var featuresText = aboutDialog.add("statictext", undefined,
        "Enhanced Features:\n" +
        "• ES3 Compatible ExtendScript with enhanced error handling\n" +
        "• Modular architecture with 5 enhanced core modules\n" +
        "• Real-time progress tracking with safety metrics\n" +
        "• Best practice safety functions from chunk analysis\n" +
        "• Emergency timeout protection prevents hanging\n" +
        "• Comprehensive DOM-like tree structure output\n" +
        "• Multiple export formats with detailed statistics\n" +
        "• Memory management with automatic cleanup\n" +
        "• Progressive safety controls for different document types\n" +
        "• Enhanced preset configurations for common use cases",
        {multiline: true});
    
    var techText = aboutDialog.add("statictext", undefined,
        "Enhanced Architecture: 5 ES3-compatible modules with safety integration\n" +
        "• Module 1: Enhanced Configuration & Safety Framework\n" +
        "• Module 2A: Document Analysis Core with Best Practices\n" +
        "• Module 2B: Tree Builder & Utilities with Validation\n" +
        "• Module 3: Enhanced UI Panel & Controls\n" +
        "• Module 4: Export & Results Display with Statistics\n" +
        "• Module 5: Main Entry Point with Comprehensive Validation\n\n" +
        "Safety Features:\n" +
        "• Emergency property access functions\n" +
        "• Progressive timeout protection\n" +
        "• Memory usage monitoring\n" +
        "• Error recovery and reporting\n" +
        "• Tree structure validation\n" +
        "• Best practice access patterns",
        {multiline: true});
    
    var versionText = aboutDialog.add("statictext", undefined,
        "Version: 3.1 Enhanced Safety Edition\n" +
        "Build: Production-Ready with Best Practice Integration\n" +
        "Compatibility: InDesign CS3+ with ExtendScript\n" +
        "Safety Level: Enhanced with Emergency Protection",
        {multiline: true});
    
    var closeBtn = aboutDialog.add("button", undefined, "Close");
    closeBtn.onClick = function() {
        aboutDialog.close();
    };
    
    aboutDialog.show();
}

// ENHANCED HELP DIALOG - Comprehensive usage guide
function showEnhancedHelpDialog() {
    var helpDialog = new Window("dialog", "Enhanced Help & Safety Guide");
    helpDialog.orientation = "column";
    helpDialog.alignChildren = "fill";
    helpDialog.preferredSize.width = 700;
    helpDialog.preferredSize.height = 650;
    
    var helpText = helpDialog.add("edittext", undefined, "", {multiline: true, readonly: true});
    helpText.alignment = "fill";
    
    var helpContent = "ENHANCED INDESIGN DOCUMENT QUERY TOOL v3.1 - COMPREHENSIVE GUIDE\n";
    helpContent += "================================================================\n\n";
    
    helpContent += "OVERVIEW:\n";
    helpContent += "This enhanced tool analyzes InDesign documents and creates DOM-like tree structures\n";
    helpContent += "with comprehensive safety controls and best practice error handling.\n";
    helpContent += "Enhanced with emergency protection to prevent document hanging.\n\n";
    
    helpContent += "ENHANCED SAFETY FEATURES:\n";
    helpContent += "• Emergency Bailouts: Automatic timeout protection prevents hanging\n";
    helpContent += "• Best Practice Functions: Enhanced property access methods\n";
    helpContent += "• Progressive Safety: Different safety levels for different document types\n";
    helpContent += "• Memory Management: Automatic cleanup prevents memory issues\n";
    helpContent += "• Error Recovery: Comprehensive error handling and reporting\n";
    helpContent += "• Real-time Progress: See exactly what's being analyzed with safety metrics\n\n";
    
    helpContent += "GETTING STARTED:\n";
    helpContent += "1. Open an InDesign document (or use 'Load Document')\n";
    helpContent += "2. Choose 'Open Enhanced Full Interface' for complete control\n";
    helpContent += "3. Or use 'Quick Analysis' for fast results with safest defaults\n";
    helpContent += "4. Review safety settings before starting analysis\n\n";
    
    helpContent += "ENHANCED INTERFACE GUIDE:\n";
    helpContent += "• File Paths: Set document and output locations with validation\n";
    helpContent += "• Target Selection: Choose analysis targets with safety indicators (✓ safe, ⚠ risky)\n";
    helpContent += "• Configuration: Enhanced settings with safety controls and emergency options\n";
    helpContent += "• Progress: Real-time feedback with safety metrics and error counts\n";
    helpContent += "• Results: Comprehensive tree view with validation and statistics\n\n";
    
    helpContent += "ANALYSIS TARGETS WITH SAFETY LEVELS:\n";
    helpContent += "✓ SAFE TARGETS (Recommended for all documents):\n";
    helpContent += "  • Document Properties - Core document info\n";
    helpContent += "  • Pages - Page collection and properties\n";
    helpContent += "  • Text Frames - Text frame objects\n";
    helpContent += "  • Stories - Story objects and threading\n";
    helpContent += "  • Layers - Layer information\n";
    helpContent += "  • Styles - Paragraph and character styles\n";
    helpContent += "  • Colors - Color definitions\n";
    helpContent += "  • Fonts - Font information\n\n";
    
    helpContent += "⚠ RISKY TARGETS (Use with caution, enable emergency bailouts):\n";
    helpContent += "  • Images - Image objects (can be slow)\n";
    helpContent += "  • Links - Link information (can be slow)\n";
    helpContent += "  • Page Items - All page items (can be very slow)\n\n";
    
    helpContent += "ENHANCED CONFIGURATION:\n";
    helpContent += "• Max Depth: How deep to analyze (2-3 recommended for safety)\n";
    helpContent += "• Sample Limit: Number of items to analyze per collection\n";
    helpContent += "• Timeout: Maximum time for operations (2000ms+ recommended)\n";
    helpContent += "• Emergency Bailouts: Enable automatic timeout protection\n";
    helpContent += "• Verbose Progress: Show detailed progress information\n\n";
    
    helpContent += "ENHANCED RESULTS:\n";
    helpContent += "• Tree View: Hierarchical display with safety indicators\n";
    helpContent += "• Statistics: Comprehensive success rates and error analysis\n";
    helpContent += "• Validation: Tree structure integrity checking\n";
    helpContent += "• Export Options: Enhanced formats with detailed metadata\n";
    helpContent += "• Safety Metrics: Error counts and timeout information\n\n";
    
    helpContent += "TROUBLESHOOTING:\n";
    helpContent += "• Document Hanging: Enable Emergency Bailouts, use lower depth/samples\n";
    helpContent += "• High Error Rates: Start with safe targets only, check document integrity\n";
    helpContent += "• Slow Performance: Reduce sample limits, disable risky collections\n";
    helpContent += "• Memory Issues: Use Quick Analysis mode, enable automatic cleanup\n\n";
    
    helpContent += "BEST PRACTICES:\n";
    helpContent += "• Always test with safe targets first\n";
    helpContent += "• Use Emergency Bailouts for unknown documents\n";
    helpContent += "• Start with Quick Analysis for initial assessment\n";
    helpContent += "• Monitor progress and safety metrics during analysis\n";
    helpContent += "• Export results immediately after successful analysis\n\n";
    
    helpContent += "For complex documents or production use, start with safe presets\n";
    helpContent += "and gradually increase depth and targets as needed.";
    
    helpText.text = helpContent;
    
    var closeBtn = helpDialog.add("button", undefined, "Close");
    closeBtn.onClick = function() {
        helpDialog.close();
    };
    
    helpDialog.show();
}

// ENHANCED ERROR HANDLING - Comprehensive error management
function handleScriptErrorEnhanced(error, context) {
    var errorMsg = "InDesign Document Query Tool v3.1 - Enhanced Edition\n\n";
    errorMsg += "Error in " + (context || "main script") + ":\n";
    errorMsg += error.message + "\n\n";
    
    if (error.line) {
        errorMsg += "Line: " + error.line + "\n\n";
    }
    
    if (error.source) {
        errorMsg += "Source: " + error.source + "\n\n";
    }
    
    errorMsg += "Context: " + (context || "Unknown") + "\n";
    errorMsg += "Safety Level: Enhanced Protection Enabled\n";
    errorMsg += "Recovery: Automatic error recovery attempted\n\n";
    errorMsg += "This enhanced tool includes comprehensive safety features.\n";
    errorMsg += "Check the ESTK console for detailed diagnostic information.\n\n";
    errorMsg += "Try using 'Quick Analysis' mode for safer operation.";
    
    alert(errorMsg);
    $.writeln("ENHANCED ERROR: " + error.message + " in " + (context || "unknown context"));
    
    // Attempt automatic recovery
    try {
        performMemoryCleanup();
        resetProgress();
        $.writeln("Automatic recovery completed");
    } catch (recoveryError) {
        $.writeln("Automatic recovery failed: " + recoveryError.message);
    }
}

// MAIN SCRIPT EXECUTION - Enhanced startup with error protection
try {
    $.writeln("InDesign Document Query Tool v3.1 - Enhanced Safety Edition");
    $.writeln("Starting enhanced initialization sequence...");
    
    initializeQueryTool();
    
} catch (mainError) {
    handleScriptErrorEnhanced(mainError, "main initialization");
}

$.writeln("Module 5.0: Enhanced Main Entry Point loaded and ready");