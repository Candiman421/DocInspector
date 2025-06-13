//
// Enhanced InDesign Document Comparison Utility v2.0
// Advanced interface for comprehensive document analysis with text capture and auto-discovery
//

// Enhanced quick analysis and comparison workflow
function quickCompare() {
    if (!app.documents.length) {
        alert("Please open a document first.");
        return;
    }
    
    var doc = app.activeDocument;
    var docName = doc.name.replace(/\.[^\.]+$/, "");
    var docPath = doc.filePath;
    
    // Check if there's already a baseline report
    var baselineFile = File(docPath + "/" + docName + "_baseline.json");
    var currentFile = File(docPath + "/" + docName + "_current.json");
    
    if (!baselineFile.exists()) {
        // Create baseline report with progress feedback
        showProgressDialog("Creating baseline analysis...", function() {
            var report = analyzeDocument();
            if (!report) {
                alert("Failed to create baseline analysis. Check for errors and try again.");
                return false;
            }
            
            baselineFile.open("w");
            baselineFile.write(JSON.stringify(report, null, 2));
            baselineFile.close();
            return true;
        });
        
        alert("Baseline analysis created: " + baselineFile.name + "\n\n" +
              "Discovered " + (ANALYSIS_CONFIG.discoveredCollections ? ANALYSIS_CONFIG.discoveredCollections.length : 0) + " collections\n" +
              "Captured text from " + (ANALYSIS_CONFIG.textItemsProcessed || 0) + " text items\n\n" +
              "Make your changes to the document, then run this script again to see differences.");
        return;
    }
    
    // Create current report with progress feedback
    var currentReport = null;
    showProgressDialog("Analyzing current document state...", function() {
        currentReport = analyzeDocument();
        if (!currentReport) {
            alert("Failed to analyze current document. Check for errors and try again.");
            return false;
        }
        
        currentFile.open("w");
        currentFile.write(JSON.stringify(currentReport, null, 2));
        currentFile.close();
        return true;
    });
    
    if (!currentReport) return;
    
    // Load baseline report
    baselineFile.open("r");
    var baselineReport = JSON.parse(baselineFile.read());
    baselineFile.close();
    
    // Enhanced comparison with progress feedback
    var differences = null;
    showProgressDialog("Comparing document states...", function() {
        differences = compareDocumentReports(baselineReport, currentReport);
        return true;
    });
    
    // Create comprehensive summaries
    var summary = createHumanReadableSummary(differences);
    var textAnalysis = createTextAnalysisSummary(differences);
    var discoveryReport = createDiscoveryReport(differences);
    
    // Save all reports
    var comparisonFile = File(docPath + "/" + docName + "_comparison.json");
    comparisonFile.open("w");
    comparisonFile.write(JSON.stringify(differences, null, 2));
    comparisonFile.close();
    
    var summaryFile = File(docPath + "/" + docName + "_summary.txt");
    summaryFile.open("w");
    summaryFile.write(summary);
    summaryFile.close();
    
    var textFile = File(docPath + "/" + docName + "_text_analysis.txt");
    textFile.open("w");
    textFile.write(textAnalysis);
    textFile.close();
    
    var discoveryFile = File(docPath + "/" + docName + "_discovery_report.txt");
    discoveryFile.open("w");
    discoveryFile.write(discoveryReport);
    discoveryFile.close();
    
    // Display enhanced summary dialog
    showEnhancedComparisonDialog(summary, differences, textAnalysis, discoveryReport);
}

// Create human-readable summary with enhanced text and discovery analysis
function createHumanReadableSummary(differences) {
    var summary = "ENHANCED DOCUMENT COMPARISON SUMMARY\n";
    summary += "Generated: " + new Date().toString() + "\n";
    summary += "Analysis Version: 2.0 (Text Capture + Auto-Discovery)\n";
    summary += "=" + Array(60).join("=") + "\n\n";
    
    if (!differences.summary.hasChanges) {
        summary += "✓ NO CHANGES DETECTED\n";
        summary += "The document appears to be identical to the baseline.\n";
        
        // Still show discovery information
        if (differences.discoveryInfo) {
            summary += "\n📊 DISCOVERY SUMMARY\n";
            summary += "Collections discovered: " + (differences.discoveryInfo.totalCollections || 0) + "\n";
            summary += "Text items processed: " + (differences.discoveryInfo.textItemsProcessed || 0) + "\n";
            summary += "Properties accessible: " + (differences.discoveryInfo.accessibleProperties || 0) + "\n";
            summary += "Properties broken: " + (differences.discoveryInfo.brokenProperties || 0) + "\n";
        }
        return summary;
    }
    
    summary += "⚠ CHANGES DETECTED\n";
    summary += "Changed sections: " + differences.summary.changedSections.length + "\n";
    if (differences.errors && differences.errors.length > 0) {
        summary += "Analysis errors: " + differences.errors.length + " (see details)\n";
    }
    
    // Enhanced discovery summary
    if (differences.discoveryInfo) {
        summary += "\n📊 DISCOVERY SUMMARY\n";
        summary += "Collections discovered: " + (differences.discoveryInfo.totalCollections || 0) + "\n";
        summary += "New collections found: " + (differences.discoveryInfo.newCollections || 0) + "\n";
        summary += "Text items with changes: " + (differences.discoveryInfo.textItemsChanged || 0) + "\n";
        summary += "Properties now broken: " + (differences.discoveryInfo.newlyBrokenProperties || 0) + "\n";
        summary += "Properties now accessible: " + (differences.discoveryInfo.newlyAccessibleProperties || 0) + "\n";
    }
    summary += "\n";
    
    var changes = differences.changes;
    
    // Document Information Changes
    if (changes.documentInfo) {
        summary += "📄 DOCUMENT INFORMATION\n";
        summary += "-".repeat(25) + "\n";
        for (var i = 0; i < Math.min(changes.documentInfo.length, 5); i++) {
            var change = changes.documentInfo[i];
            summary += formatChangeWithAccess(change) + "\n";
        }
        if (changes.documentInfo.length > 5) {
            summary += "... and " + (changes.documentInfo.length - 5) + " more changes\n";
        }
        summary += "\n";
    }
    
    // Text Content Changes (Enhanced)
    if (changes.textContent) {
        summary += "📝 TEXT CONTENT ANALYSIS\n";
        summary += "-".repeat(26) + "\n";
        var textChanges = categorizeChanges(changes.textContent);
        
        if (textChanges.additions.length > 0) {
            summary += "• Added " + textChanges.additions.length + " text item(s)\n";
        }
        if (textChanges.deletions.length > 0) {
            summary += "• Removed " + textChanges.deletions.length + " text item(s)\n";
        }
        if (textChanges.modifications.length > 0) {
            summary += "• Modified " + textChanges.modifications.length + " text item(s)\n";
            
            // Show significant text changes
            for (var i = 0; i < Math.min(textChanges.modifications.length, 3); i++) {
                var change = textChanges.modifications[i];
                if (change.path.indexOf('textContent') !== -1) {
                    var contentChange = getTextContentSummary(change);
                    summary += "  - " + contentChange + "\n";
                } else if (change.path.indexOf('characterCount') !== -1) {
                    summary += "  - Character count: " + change.oldValue + " → " + change.newValue + "\n";
                } else if (change.path.indexOf('wordCount') !== -1) {
                    summary += "  - Word count: " + change.oldValue + " → " + change.newValue + "\n";
                }
            }
        }
        summary += "\n";
    }
    
    // Auto-Discovered Collections Changes
    if (changes.autoDiscoveredCollections) {
        summary += "🔍 AUTO-DISCOVERED COLLECTIONS\n";
        summary += "-".repeat(30) + "\n";
        var discoveryChanges = categorizeChanges(changes.autoDiscoveredCollections);
        
        if (discoveryChanges.additions.length > 0) {
            summary += "• Found " + discoveryChanges.additions.length + " new collection(s)\n";
        }
        if (discoveryChanges.modifications.length > 0) {
            summary += "• Changed " + discoveryChanges.modifications.length + " collection(s)\n";
            for (var i = 0; i < Math.min(discoveryChanges.modifications.length, 3); i++) {
                var change = discoveryChanges.modifications[i];
                summary += "  - " + formatChangeWithAccess(change) + "\n";
            }
        }
        summary += "\n";
    }
    
    // Broken Properties Analysis
    if (changes.brokenProperties) {
        summary += "❌ BROKEN PROPERTIES ANALYSIS\n";
        summary += "-".repeat(28) + "\n";
        var brokenChanges = categorizeChanges(changes.brokenProperties);
        
        if (brokenChanges.additions.length > 0) {
            summary += "• " + brokenChanges.additions.length + " properties became inaccessible\n";
        }
        if (brokenChanges.deletions.length > 0) {
            summary += "• " + brokenChanges.deletions.length + " properties became accessible again\n";
        }
        summary += "\n";
    }
    
    // Page Changes
    if (changes.pages) {
        summary += "📃 PAGES\n";
        summary += "-".repeat(8) + "\n";
        var pageChanges = categorizeChanges(changes.pages);
        if (pageChanges.additions.length > 0) {
            summary += "• Added " + pageChanges.additions.length + " page(s)\n";
        }
        if (pageChanges.deletions.length > 0) {
            summary += "• Removed " + pageChanges.deletions.length + " page(s)\n";
        }
        if (pageChanges.modifications.length > 0) {
            summary += "• Modified " + pageChanges.modifications.length + " page(s)\n";
            for (var i = 0; i < Math.min(pageChanges.modifications.length, 3); i++) {
                summary += "  - " + formatChangeWithAccess(pageChanges.modifications[i]) + "\n";
            }
        }
        summary += "\n";
    }
    
    // Stories with Enhanced Text Analysis
    if (changes.stories) {
        summary += "📖 TEXT STORIES (ENHANCED)\n";
        summary += "-".repeat(24) + "\n";
        var storyChanges = categorizeChanges(changes.stories);
        if (storyChanges.additions.length > 0) {
            summary += "• Added " + storyChanges.additions.length + " story(ies)\n";
        }
        if (storyChanges.deletions.length > 0) {
            summary += "• Removed " + storyChanges.deletions.length + " story(ies)\n";
        }
        if (storyChanges.modifications.length > 0) {
            summary += "• Modified " + storyChanges.modifications.length + " story(ies)\n";
            
            // Show detailed text analysis
            for (var i = 0; i < Math.min(storyChanges.modifications.length, 2); i++) {
                var change = storyChanges.modifications[i];
                if (change.path.indexOf('textPreview') !== -1) {
                    summary += "  - Text content changed (preview): \"" + 
                              (change.oldValue || "").substring(0, 30) + "...\" → \"" + 
                              (change.newValue || "").substring(0, 30) + "...\"\n";
                    summary += "    Access: " + (change.accessPath ? change.accessPath.primary : "manual") + "\n";
                } else if (change.path.indexOf('length') !== -1) {
                    summary += "  - Text length: " + change.oldValue + " → " + change.newValue + " characters\n";
                }
            }
        }
        summary += "\n";
    }
    
    // Layer Changes
    if (changes.layers) {
        summary += "🔄 LAYERS\n";
        summary += "-".repeat(9) + "\n";
        var layerChanges = categorizeChanges(changes.layers);
        if (layerChanges.additions.length > 0) {
            summary += "• Added " + layerChanges.additions.length + " layer(s)\n";
        }
        if (layerChanges.deletions.length > 0) {
            summary += "• Removed " + layerChanges.deletions.length + " layer(s)\n";
        }
        if (layerChanges.modifications.length > 0) {
            summary += "• Modified " + layerChanges.modifications.length + " layer(s)\n";
        }
        summary += "\n";
    }
    
    // Images Changes (Enhanced)
    if (changes.images) {
        summary += "🖼️ IMAGES (COMPREHENSIVE)\n";
        summary += "-".repeat(24) + "\n";
        var imageChanges = categorizeChanges(changes.images);
        if (imageChanges.additions.length > 0) {
            summary += "• Added " + imageChanges.additions.length + " image(s)\n";
        }
        if (imageChanges.deletions.length > 0) {
            summary += "• Removed " + imageChanges.deletions.length + " image(s)\n";
        }
        if (imageChanges.modifications.length > 0) {
            summary += "• Modified " + imageChanges.modifications.length + " image(s)\n";
        }
        summary += "\n";
    }
    
    // Object Hierarchy Changes
    if (changes.objectHierarchy) {
        summary += "🏗️ OBJECT HIERARCHY\n";
        summary += "-".repeat(18) + "\n";
        var hierarchyChanges = categorizeChanges(changes.objectHierarchy);
        if (hierarchyChanges.modifications.length > 0) {
            summary += "• Document structure changes detected\n";
            for (var i = 0; i < Math.min(hierarchyChanges.modifications.length, 2); i++) {
                var change = hierarchyChanges.modifications[i];
                summary += "  - " + formatChangeWithAccess(change) + "\n";
            }
        }
        summary += "\n";
    }
    
    // Rest of existing sections...
    if (changes.styles) {
        summary += "🎨 STYLES\n";
        summary += "-".repeat(9) + "\n";
        var styleChanges = categorizeChanges(changes.styles);
        if (styleChanges.additions.length > 0) {
            summary += "• Added " + styleChanges.additions.length + " style(s)\n";
        }
        if (styleChanges.deletions.length > 0) {
            summary += "• Removed " + styleChanges.deletions.length + " style(s)\n";
        }
        if (styleChanges.modifications.length > 0) {
            summary += "• Modified " + styleChanges.modifications.length + " style(s)\n";
        }
        summary += "\n";
    }
    
    summary += "=" + Array(60).join("=") + "\n";
    summary += "📚 COMPREHENSIVE ANALYSIS COMPLETE\n";
    summary += "• Text content captured and analyzed\n";
    summary += "• Collections auto-discovered and tracked\n";
    summary += "• Broken properties identified and monitored\n";
    summary += "• Object model access paths provided\n";
    summary += "• Safety guidelines included\n\n";
    summary += "For detailed technical information, see accompanying files:\n";
    summary += "• *_comparison.json (full technical data)\n";
    summary += "• *_text_analysis.txt (detailed text changes)\n";
    summary += "• *_discovery_report.txt (auto-discovery results)\n";
    
    return summary;
}

// Create detailed text analysis summary
function createTextAnalysisSummary(differences) {
    var summary = "DETAILED TEXT CONTENT ANALYSIS\n";
    summary += "Generated: " + new Date().toString() + "\n";
    summary += "=" + Array(50).join("=") + "\n\n";
    
    // Text content changes
    if (differences.changes.textContent) {
        summary += "TEXT CONTENT CHANGES\n";
        summary += "-".repeat(20) + "\n\n";
        
        var textChanges = differences.changes.textContent;
        for (var i = 0; i < textChanges.length; i++) {
            var change = textChanges[i];
            
            summary += "CHANGE " + (i + 1) + ":\n";
            summary += "Path: " + change.path + "\n";
            summary += "Type: " + change.type + "\n";
            
            if (change.accessPath) {
                summary += "Access: " + change.accessPath.primary + "\n";
            }
            
            if (change.type === "value_change" && change.path.indexOf('textContent') !== -1) {
                summary += "Old Text: \"" + (change.oldValue || "").substring(0, 200) + "\"\n";
                summary += "New Text: \"" + (change.newValue || "").substring(0, 200) + "\"\n";
                
                // Text difference analysis
                var textDiff = analyzeTextDifference(change.oldValue, change.newValue);
                summary += "Analysis: " + textDiff + "\n";
            } else if (change.type === "value_change") {
                summary += "Old Value: " + change.oldValue + "\n";
                summary += "New Value: " + change.newValue + "\n";
            }
            
            summary += "\n" + "-".repeat(40) + "\n\n";
        }
    }
    
    // Story-level text changes
    if (differences.changes.stories) {
        summary += "\nSTORY-LEVEL TEXT CHANGES\n";
        summary += "-".repeat(25) + "\n\n";
        
        var storyChanges = differences.changes.stories;
        var textRelatedChanges = [];
        
        for (var i = 0; i < storyChanges.length; i++) {
            var change = storyChanges[i];
            if (change.path.indexOf('textPreview') !== -1 || 
                change.path.indexOf('length') !== -1 || 
                change.path.indexOf('characters') !== -1 ||
                change.path.indexOf('words') !== -1 ||
                change.path.indexOf('paragraphs') !== -1) {
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
            }
            summary += "\n";
        }
    }
    
    return summary;
}

// Create discovery report
function createDiscoveryReport(differences) {
    var report = "AUTO-DISCOVERY ANALYSIS REPORT\n";
    report += "Generated: " + new Date().toString() + "\n";
    report += "=" + Array(40).join("=") + "\n\n";
    
    if (differences.discoveryInfo) {
        var info = differences.discoveryInfo;
        
        report += "DISCOVERY SUMMARY\n";
        report += "-".repeat(17) + "\n";
        report += "Total collections discovered: " + (info.totalCollections || 0) + "\n";
        report += "New collections found: " + (info.newCollections || 0) + "\n";
        report += "Collections that disappeared: " + (info.removedCollections || 0) + "\n";
        report += "Properties accessible: " + (info.accessibleProperties || 0) + "\n";
        report += "Properties broken/inaccessible: " + (info.brokenProperties || 0) + "\n";
        report += "Text items processed: " + (info.textItemsProcessed || 0) + "\n";
        report += "Text items with changes: " + (info.textItemsChanged || 0) + "\n\n";
    }
    
    // Auto-discovered collections changes
    if (differences.changes.autoDiscoveredCollections) {
        report += "COLLECTION CHANGES\n";
        report += "-".repeat(18) + "\n\n";
        
        var collectionChanges = differences.changes.autoDiscoveredCollections;
        for (var i = 0; i < collectionChanges.length; i++) {
            var change = collectionChanges[i];
            report += "Collection: " + change.path + "\n";
            report += "Change: " + formatChange(change) + "\n";
            if (change.accessPath) {
                report += "Access: " + change.accessPath.primary + "\n";
            }
            report += "\n";
        }
    }
    
    // Broken properties analysis
    if (differences.changes.brokenProperties) {
        report += "BROKEN PROPERTIES ANALYSIS\n";
        report += "-".repeat(28) + "\n\n";
        
        var brokenChanges = differences.changes.brokenProperties;
        for (var i = 0; i < brokenChanges.length; i++) {
            var change = brokenChanges[i];
            report += "Property: " + change.path + "\n";
            report += "Status: " + change.type + "\n";
            report += "Reason: " + (change.error || change.reason || "Unknown") + "\n";
            report += "\n";
        }
    }
    
    return report;
}

// Analyze text differences
function analyzeTextDifference(oldText, newText) {
    if (!oldText && !newText) return "Both texts empty";
    if (!oldText) return "Text added (" + newText.length + " characters)";
    if (!newText) return "Text removed (" + oldText.length + " characters)";
    
    var oldLen = oldText.length;
    var newLen = newText.length;
    
    if (oldLen === newLen) {
        if (oldText === newText) {
            return "No change";
        } else {
            return "Text modified (same length, content changed)";
        }
    } else {
        var diff = newLen - oldLen;
        return "Length changed by " + diff + " characters (" + oldLen + " → " + newLen + ")";
    }
}

// Get text content summary
function getTextContentSummary(change) {
    var summary = "";
    
    if (change.type === "value_change") {
        var oldText = change.oldValue || "";
        var newText = change.newValue || "";
        
        if (oldText.length > 50 || newText.length > 50) {
            summary = "Text content changed (large change)";
        } else {
            summary = "\"" + oldText.substring(0, 20) + "...\" → \"" + newText.substring(0, 20) + "...\"";
        }
    } else {
        summary = formatChange(change);
    }
    
    return summary;
}

// Enhanced change formatter with bulletproof access information handling
function formatChangeWithAccess(change) {
    try {
        var formatted = formatChange(change);
        
        // Safely add access hint for key changes
        if (change && change.accessPath) {
            var accessPath = safeGetProperty(change.accessPath, 'primary');
            if (accessPath && accessPath !== "" && accessPath.indexOf('Error') === -1) {
                formatted += " (Access: " + accessPath + ")";
            } else {
                // Try alternatives if primary failed
                var alternatives = safeGetProperty(change.accessPath, 'alternatives', []);
                if (alternatives && alternatives.length > 0 && alternatives[0].indexOf('Error') === -1) {
                    formatted += " (Alt Access: " + alternatives[0] + ")";
                }
            }
        }
        
        return formatted;
    } catch (e) {
        // Fallback to basic format if access path processing fails
        return formatChange(change);
    }
}

// Safe property accessor for utility functions
function safeGetProperty(obj, prop, defaultValue) {
    try {
        if (!obj) {
            return defaultValue !== undefined ? defaultValue : null;
        }
        
        if (obj.hasOwnProperty && obj.hasOwnProperty(prop)) {
            return obj[prop] !== undefined ? obj[prop] : (defaultValue !== undefined ? defaultValue : null);
        } else if (obj[prop] !== undefined) {
            return obj[prop];
        }
        
        return defaultValue !== undefined ? defaultValue : null;
    } catch (e) {
        return defaultValue !== undefined ? defaultValue : null;
    }
}

// Helper function to format individual changes
function formatChange(change) {
    try {
        switch (safeGetProperty(change, 'type', 'unknown')) {
            case "value_change":
                return change.path + ": " + change.oldValue + " → " + change.newValue;
            case "addition":
                return "Added " + change.path + ": " + change.newValue;
            case "deletion":
                return "Removed " + change.path + ": " + change.oldValue;
            case "length_change":
                return change.path + " count changed: " + change.oldLength + " → " + change.newLength;
            case "text_content_change":
                return change.path + ": text content modified";
            case "collection_discovered":
                return "Discovered collection: " + change.path;
            case "property_broken":
                return "Property became inaccessible: " + change.path;
            case "property_fixed":
                return "Property became accessible: " + change.path;
            default:
                return safeGetProperty(change, 'type', 'change') + " in " + safeGetProperty(change, 'path', 'unknown');
        }
    } catch (e) {
        return "Error formatting change: " + e.message;
    }
}

// Helper function to categorize changes
function categorizeChanges(changes) {
    var result = {
        additions: [],
        deletions: [],
        modifications: [],
        textChanges: [],
        discoveryChanges: [],
        brokenPropertyChanges: []
    };
    
    try {
        for (var i = 0; i < changes.length; i++) {
            var change = changes[i];
            var changeType = safeGetProperty(change, 'type', 'unknown');
            
            switch (changeType) {
                case "addition":
                case "collection_discovered":
                case "property_fixed":
                    result.additions.push(change);
                    break;
                case "deletion":
                case "property_broken":
                    result.deletions.push(change);
                    break;
                case "text_content_change":
                    result.textChanges.push(change);
                    result.modifications.push(change);
                    break;
                case "collection_discovered":
                    result.discoveryChanges.push(change);
                    break;
                case "property_broken":
                case "property_fixed":
                    result.brokenPropertyChanges.push(change);
                    break;
                default:
                    result.modifications.push(change);
                    break;
            }
        }
    } catch (e) {
        // Return partial results if categorization fails
    }
    
    return result;
}

// Show progress dialog during long operations
function showProgressDialog(message, operation) {
    var progressDialog = new Window("dialog", "Processing...");
    progressDialog.preferredSize.width = 300;
    
    var progressGroup = progressDialog.add("group");
    progressGroup.orientation = "column";
    progressGroup.alignment = "fill";
    
    var messageText = progressGroup.add("statictext", undefined, message);
    messageText.alignment = "center";
    
    var progressBar = progressGroup.add("progressbar", undefined, 0, 100);
    progressBar.alignment = "fill";
    progressBar.preferredSize.height = 10;
    
    // Show dialog and start operation
    progressDialog.show();
    
    try {
        // Simulate progress
        for (var i = 0; i <= 100; i += 10) {
            progressBar.value = i;
            progressDialog.update();
        }
        
        var result = operation();
        progressDialog.close();
        return result;
    } catch (e) {
        progressDialog.close();
        throw e;
    }
}

// Enhanced comparison dialog with multiple views
function showEnhancedComparisonDialog(summary, differences, textAnalysis, discoveryReport) {
    var dialog = new Window("dialog", "Enhanced Document Comparison Results");
    dialog.preferredSize.width = 800;
    dialog.preferredSize.height = 600;
    
    // Create tabbed interface
    var mainGroup = dialog.add("tabbedpanel");
    mainGroup.alignment = "fill";
    
    // Summary tab
    var summaryTab = mainGroup.add("tab", undefined, "Summary");
    var summaryPanel = summaryTab.add("panel", undefined, "Change Summary");
    summaryPanel.alignment = "fill";
    summaryPanel.preferredSize.height = 450;
    
    var summaryText = summaryPanel.add("edittext", undefined, summary, {multiline: true, readonly: true});
    summaryText.alignment = "fill";
    
    // Text Analysis tab
    var textTab = mainGroup.add("tab", undefined, "Text Analysis");
    var textPanel = textTab.add("panel", undefined, "Text Content Changes");
    textPanel.alignment = "fill";
    textPanel.preferredSize.height = 450;
    
    var textText = textPanel.add("edittext", undefined, textAnalysis, {multiline: true, readonly: true});
    textText.alignment = "fill";
    
    // Discovery tab
    var discoveryTab = mainGroup.add("tab", undefined, "Auto-Discovery");
    var discoveryPanel = discoveryTab.add("panel", undefined, "Collection & Property Discovery");
    discoveryPanel.alignment = "fill";
    discoveryPanel.preferredSize.height = 450;
    
    var discoveryText = discoveryPanel.add("edittext", undefined, discoveryReport, {multiline: true, readonly: true});
    discoveryText.alignment = "fill";
    
    // Detailed Changes tab
    var detailsTab = mainGroup.add("tab", undefined, "Details");
    createDetailedChangesTab(detailsTab, differences);
    
    // Action buttons
    var buttonGroup = dialog.add("group");
    buttonGroup.alignment = "center";
    
    var exportAllBtn = buttonGroup.add("button", undefined, "Export All Reports");
    var accessPathsBtn = buttonGroup.add("button", undefined, "Access Paths Guide");
    var resetBaselineBtn = buttonGroup.add("button", undefined, "Set New Baseline");
    var okBtn = buttonGroup.add("button", undefined, "OK");
    
    exportAllBtn.onClick = function() {
        exportAllReports(summary, textAnalysis, discoveryReport, differences);
    };
    
    accessPathsBtn.onClick = function() {
        showAccessPathsGuide(differences);
    };
    
    resetBaselineBtn.onClick = function() {
        resetBaseline();
        dialog.close();
    };
    
    okBtn.onClick = function() {
        dialog.close();
    };
    
    dialog.show();
}

// Create detailed changes tab with filtering
function createDetailedChangesTab(parentTab, differences) {
    var mainGroup = parentTab.add("group");
    mainGroup.orientation = "column";
    mainGroup.alignment = "fill";
    
    // Filter controls
    var filterGroup = mainGroup.add("group");
    var sectionLabel = filterGroup.add("statictext", undefined, "Section:");
    var sectionDropdown = filterGroup.add("dropdownlist", undefined, differences.summary.changedSections);
    
    var typeLabel = filterGroup.add("statictext", undefined, "Type:");
    var typeDropdown = filterGroup.add("dropdownlist", undefined, ["All Changes", "Text Changes", "Additions", "Deletions", "Modifications"]);
    typeDropdown.selection = 0;
    
    // Details panel
    var detailsPanel = mainGroup.add("panel", undefined, "Detailed Changes");
    detailsPanel.alignment = "fill";
    detailsPanel.preferredSize.height = 350;
    
    var detailsText = detailsPanel.add("edittext", undefined, "", {multiline: true, readonly: true});
    detailsText.alignment = "fill";
    
    // Update function
    function updateDetails() {
        try {
            if (!sectionDropdown.selection) return;
            
            var selectedSection = sectionDropdown.selection.text;
            var selectedType = typeDropdown.selection.index;
            var changes = safeGetProperty(differences.changes, selectedSection, []);
            
            // Filter changes by type
            var filteredChanges = filterChangesByType(changes, selectedType);
            
            var detailsString = "Changes in " + selectedSection + " (" + filteredChanges.length + " items):\n";
            detailsString += "=" + Array(50).join("=") + "\n\n";
            
            for (var i = 0; i < Math.min(filteredChanges.length, 20); i++) {
                var change = filteredChanges[i];
                detailsString += "CHANGE " + (i + 1) + ":\n";
                detailsString += "Type: " + change.type + "\n";
                detailsString += "Path: " + change.path + "\n";
                
                if (change.type === "value_change") {
                    detailsString += "Old: " + (change.oldValue || "null") + "\n";
                    detailsString += "New: " + (change.newValue || "null") + "\n";
                }
                
                if (change.accessPath && change.accessPath.primary) {
                    detailsString += "Access: " + change.accessPath.primary + "\n";
                }
                
                if (change.safetyNotes && change.safetyNotes.length > 0) {
                    detailsString += "Safety: " + change.safetyNotes[0] + "\n";
                }
                
                detailsString += "\n" + "-".repeat(30) + "\n\n";
            }
            
            if (filteredChanges.length > 20) {
                detailsString += "... and " + (filteredChanges.length - 20) + " more changes\n";
            }
            
            detailsText.text = detailsString;
            
        } catch (e) {
            detailsText.text = "Error displaying details: " + e.message;
        }
    }
    
    sectionDropdown.onChange = updateDetails;
    typeDropdown.onChange = updateDetails;
    
    // Initialize
    if (sectionDropdown.items.length > 0) {
        sectionDropdown.selection = 0;
        updateDetails();
    }
}

// Filter changes by type
function filterChangesByType(changes, typeIndex) {
    if (typeIndex === 0) return changes; // All changes
    
    var filtered = [];
    for (var i = 0; i < changes.length; i++) {
        var change = changes[i];
        var changeType = change.type;
        
        switch (typeIndex) {
            case 1: // Text changes
                if (changeType === "text_content_change" || change.path.indexOf('text') !== -1) {
                    filtered.push(change);
                }
                break;
            case 2: // Additions
                if (changeType === "addition" || changeType === "collection_discovered") {
                    filtered.push(change);
                }
                break;
            case 3: // Deletions
                if (changeType === "deletion" || changeType === "property_broken") {
                    filtered.push(change);
                }
                break;
            case 4: // Modifications
                if (changeType === "value_change" || changeType === "length_change") {
                    filtered.push(change);
                }
                break;
        }
    }
    
    return filtered;
}

// Export all reports
function exportAllReports(summary, textAnalysis, discoveryReport, differences) {
    var folder = Folder.selectDialog("Select folder to save all reports:");
    if (!folder) return;
    
    var timestamp = new Date().getTime();
    
    // Export summary
    var summaryFile = File(folder.fsName + "/comprehensive_summary_" + timestamp + ".txt");
    summaryFile.open("w");
    summaryFile.write(summary);
    summaryFile.close();
    
    // Export text analysis
    var textFile = File(folder.fsName + "/text_analysis_" + timestamp + ".txt");
    textFile.open("w");
    textFile.write(textAnalysis);
    textFile.close();
    
    // Export discovery report
    var discoveryFile = File(folder.fsName + "/discovery_report_" + timestamp + ".txt");
    discoveryFile.open("w");
    discoveryFile.write(discoveryReport);
    discoveryFile.close();
    
    // Export full JSON
    var jsonFile = File(folder.fsName + "/full_comparison_" + timestamp + ".json");
    jsonFile.open("w");
    jsonFile.write(JSON.stringify(differences, null, 2));
    jsonFile.close();
    
    alert("All reports exported to:\n" + folder.fsName + "\n\n" +
          "Files created:\n" +
          "• comprehensive_summary_" + timestamp + ".txt\n" +
          "• text_analysis_" + timestamp + ".txt\n" +
          "• discovery_report_" + timestamp + ".txt\n" +
          "• full_comparison_" + timestamp + ".json");
}

// Show access paths guide
function showAccessPathsGuide(differences) {
    var guide = createAccessPathsGuide(differences);
    var guideDialog = new Window("dialog", "Object Model Access Paths Guide");
    guideDialog.preferredSize.width = 800;
    guideDialog.preferredSize.height = 600;
    
    var guideGroup = guideDialog.add("group");
    guideGroup.orientation = "column";
    guideGroup.alignment = "fill";
    
    var guidePanel = guideGroup.add("panel", undefined, "How to Access Changed Properties");
    guidePanel.alignment = "fill";
    guidePanel.preferredSize.height = 500;
    
    var guideText = guidePanel.add("edittext", undefined, guide, {multiline: true, readonly: true});
    guideText.alignment = "fill";
    
    var buttonGroup = guideGroup.add("group");
    var exportBtn = buttonGroup.add("button", undefined, "Export Guide");
    var closeBtn = buttonGroup.add("button", undefined, "Close");
    
    exportBtn.onClick = function() {
        var file = File.saveDialog("Save access paths guide", "*.txt");
        if (file) {
            file.open("w");
            file.write(guide);
            file.close();
            alert("Access paths guide exported to: " + file.name);
        }
    };
    
    closeBtn.onClick = function() {
        guideDialog.close();
    };
    
    guideDialog.show();
}

// Create comprehensive access paths guide
function createAccessPathsGuide(differences) {
    var guide = "COMPREHENSIVE OBJECT MODEL ACCESS PATHS GUIDE\n";
    guide += "Generated: " + new Date().toString() + "\n";
    guide += "Enhanced Version 2.0 - Text Capture + Auto-Discovery\n";
    guide += "=" + Array(60).join("=") + "\n\n";
    
    guide += "This guide shows how to safely access properties that changed\n";
    guide += "in your InDesign document, including text content and auto-discovered items.\n\n";
    
    // Section-by-section access paths
    try {
        var sections = safeGetProperty(differences.summary, 'changedSections', []);
        
        for (var s = 0; s < sections.length; s++) {
            var sectionName = sections[s];
            var sectionChanges = safeGetProperty(differences.changes, sectionName, []);
            
            guide += "SECTION: " + sectionName.toUpperCase() + "\n";
            guide += "=" + Array(sectionName.length + 10).join("=") + "\n\n";
            
            var uniquePaths = {};
            var pathCount = 0;
            
            for (var i = 0; i < sectionChanges.length && pathCount < 15; i++) {
                var change = sectionChanges[i];
                var accessPath = safeGetProperty(change, 'accessPath');
                
                if (accessPath) {
                    var primary = safeGetProperty(accessPath, 'primary');
                    if (primary && !uniquePaths[primary] && primary.indexOf('Error') === -1) {
                        uniquePaths[primary] = true;
                        pathCount++;
                        
                        guide += "Property: " + change.path + "\n";
                        guide += "Primary Access: " + primary + "\n";
                        
                        var alternatives = safeGetProperty(accessPath, 'alternatives', []);
                        if (alternatives.length > 0) {
                            guide += "Alternative Methods:\n";
                            for (var j = 0; j < Math.min(alternatives.length, 2); j++) {
                                if (alternatives[j] && alternatives[j].indexOf('Error') === -1) {
                                    guide += "  • " + alternatives[j] + "\n";
                                }
                            }
                        }
                        
                        var safetyNotes = safeGetProperty(change, 'safetyNotes', []);
                        if (safetyNotes.length > 0) {
                            guide += "Safety Guidelines:\n";
                            for (var k = 0; k < Math.min(safetyNotes.length, 2); k++) {
                                guide += "  ⚠ " + safetyNotes[k] + "\n";
                            }
                        }
                        
                        // Enhanced code sample for text content
                        guide += "\nSafe Access Example:\n";
                        if (change.path.indexOf('text') !== -1) {
                            guide += "// Text content access with validation\n";
                            guide += "try {\n";
                            guide += "    var item = " + primary.split('.').slice(0, -1).join('.') + ";\n";
                            guide += "    if (item && item.contents) {\n";
                            guide += "        var textContent = item.contents;\n";
                            guide += "        if (textContent.length > 0) {\n";
                            guide += "            alert('Text: ' + textContent.substring(0, 100));\n";
                            guide += "        }\n";
                            guide += "    }\n";
                            guide += "} catch (e) {\n";
                            guide += "    alert('Error accessing text: ' + e.message);\n";
                            guide += "}\n";
                        } else {
                            guide += "try {\n";
                            guide += "    var value = " + primary + ";\n";
                            guide += "    if (value !== undefined && value !== null) {\n";
                            guide += "        alert('Value: ' + value);\n";
                            guide += "    }\n";
                            guide += "} catch (e) {\n";
                            guide += "    alert('Error: ' + e.message);\n";
                            guide += "}\n";
                        }
                        
                        guide += "\n" + "-".repeat(40) + "\n\n";
                    }
                }
            }
        }
    } catch (e) {
        guide += "Error generating section-specific paths: " + e.message + "\n\n";
    }
    
    // Enhanced safety patterns
    guide += "\nENHANCED SAFETY PATTERNS\n";
    guide += "=" + Array(26).join("=") + "\n\n";
    
    guide += "1. Text Content Access:\n";
    guide += "   // Safe text extraction\n";
    guide += "   function getTextSafely(textFrame) {\n";
    guide += "       try {\n";
    guide += "           if (textFrame && textFrame.contents) {\n";
    guide += "               return textFrame.contents;\n";
    guide += "           }\n";
    guide += "       } catch (e) {\n";
    guide += "           return 'Error: ' + e.message;\n";
    guide += "       }\n";
    guide += "       return null;\n";
    guide += "   }\n\n";
    
    guide += "2. Collection Auto-Discovery:\n";
    guide += "   // Discover available collections\n";
    guide += "   function discoverCollections(obj) {\n";
    guide += "       var collections = [];\n";
    guide += "       for (var prop in obj) {\n";
    guide += "           try {\n";
    guide += "               if (obj[prop] && obj[prop].length !== undefined) {\n";
    guide += "                   collections.push(prop);\n";
    guide += "               }\n";
    guide += "           } catch (e) { /* ignore */ }\n";
    guide += "       }\n";
    guide += "       return collections;\n";
    guide += "   }\n\n";
    
    guide += "3. Broken Property Detection:\n";
    guide += "   // Check if property is accessible\n";
    guide += "   function isPropertyAccessible(obj, prop) {\n";
    guide += "       try {\n";
    guide += "           var value = obj[prop];\n";
    guide += "           return true;\n";
    guide += "       } catch (e) {\n";
    guide += "           return false;\n";
    guide += "       }\n";
    guide += "   }\n\n";
    
    return guide;
}

// Reset baseline function
function resetBaseline() {
    if (!app.documents.length) {
        alert("Please open a document first.");
        return;
    }
    
    var result = confirm("This will create a new baseline analysis of the current document.\n" +
                        "Any existing baseline will be overwritten.\n\n" +
                        "The enhanced analysis will:\n" +
                        "• Capture all text content\n" +
                        "• Auto-discover collections\n" +
                        "• Track property accessibility\n\n" +
                        "Continue?");
    if (!result) return;
    
    var doc = app.activeDocument;
    var docName = doc.name.replace(/\.[^\.]+$/, "");
    var docPath = doc.filePath;
    
    showProgressDialog("Creating enhanced baseline...", function() {
        var report = analyzeDocument();
        if (!report) {
            alert("Failed to create baseline analysis. Check for errors and try again.");
            return false;
        }
        
        var baselineFile = File(docPath + "/" + docName + "_baseline.json");
        baselineFile.open("w");
        baselineFile.write(JSON.stringify(report, null, 2));
        baselineFile.close();
        
        return true;
    });
    
    alert("Enhanced baseline created!\n\n" +
          "Features captured:\n" +
          "• Text content from all text items\n" +
          "• Auto-discovered collections\n" +
          "• Property accessibility status\n" +
          "• Comprehensive object hierarchy");
}

// Menu-like interface
function showMainMenu() {
    var dialog = new Window("dialog", "Enhanced InDesign Document Analyzer v2.0");
    dialog.preferredSize.width = 450;
    
    var mainGroup = dialog.add("group");
    mainGroup.orientation = "column";
    mainGroup.alignment = "fill";
    
    var titlePanel = mainGroup.add("panel", undefined, "Enhanced Document Analysis & Comparison Tool");
    titlePanel.alignment = "fill";
    
    var infoText = titlePanel.add("statictext", undefined, 
        "Enhanced Document Analysis & Comparison Tool v2.0\n\n" +
        "NEW FEATURES:\n" +
        "✓ Text content capture and analysis\n" +
        "✓ Auto-discovery of collections and properties\n" +
        "✓ Broken property detection and tracking\n" +
        "✓ Enhanced reporting with multiple views\n" +
        "✓ Comprehensive object model access paths\n\n" +
        "EXISTING FEATURES:\n" +
        "✓ Multi-method image detection\n" +
        "✓ Bulletproof error handling\n" +
        "✓ Deep object hierarchy analysis\n" +
        "✓ Safe property access throughout", 
        {multiline: true});
    infoText.alignment = "fill";
    
    var buttonGroup = mainGroup.add("group");
    buttonGroup.orientation = "column";
    buttonGroup.alignment = "fill";
    
    var quickCompareBtn = buttonGroup.add("button", undefined, "Enhanced Quick Compare (Recommended)");
    var createBaselineBtn = buttonGroup.add("button", undefined, "Create Enhanced Baseline");
    var analyzeOnlyBtn = buttonGroup.add("button", undefined, "Analyze Current Document Only");
    var compareFilesBtn = buttonGroup.add("button", undefined, "Compare Existing Analysis Files");
    var cancelBtn = buttonGroup.add("button", undefined, "Cancel");
    
    quickCompareBtn.onClick = function() {
        dialog.close();
        quickCompare();
    };
    
    createBaselineBtn.onClick = function() {
        dialog.close();
        resetBaseline();
    };
    
    analyzeOnlyBtn.onClick = function() {
        dialog.close();
        analyzeDocument();
    };
    
    compareFilesBtn.onClick = function() {
        dialog.close();
        compareReports();
    };
    
    cancelBtn.onClick = function() {
        dialog.close();
    };
    
    dialog.show();
}

// Enhanced analyzer integration - requires the main enhanced analyzer script
function analyzeDocument() {
    // This uses the enhanced analyzeDocument function from the main script
    if (typeof safeGetProperty === 'undefined' || typeof createDocumentReport === 'undefined') {
        alert("Enhanced InDesign Document Analyzer Required!\n\n" +
              "This utility requires the enhanced analyzer script v2.0.\n" +
              "Features needed:\n" +
              "• Text content capture\n" +
              "• Auto-discovery capabilities\n" +
              "• Broken property tracking\n\n" +
              "Please load the main enhanced analyzer script first.");
        return null;
    }
    
    if (!app.documents.length) {
        alert("Please open a document first.");
        return;
    }
    
    var doc = app.activeDocument;
    var startTime = new Date().getTime();
    
    try {
        var report = createDocumentReport(doc);
        
        var reportFile = File(doc.filePath + "/" + doc.name.replace(/\.[^\.]+$/, "") + "_analysis.json");
        var jsonString = JSON.stringify(report, null, 2);
        
        reportFile.open("w");
        reportFile.write(jsonString);
        reportFile.close();
        
        var duration = (new Date().getTime() - startTime) / 1000;
        var stats = "";
        if (ANALYSIS_CONFIG.discoveredCollections) {
            stats = "\nDiscovered " + ANALYSIS_CONFIG.discoveredCollections.length + " collections";
        }
        if (ANALYSIS_CONFIG.textItemsProcessed) {
            stats += "\nProcessed " + ANALYSIS_CONFIG.textItemsProcessed + " text items";
        }
        
        alert("Enhanced document analysis complete! (" + duration + "s)" + stats + 
              "\nReport saved as: " + reportFile.name);
        return report;
        
    } catch (error) {
        alert("Analysis failed: " + error.message + "\nLine: " + error.line);
        return null;
    }
}

// Compare existing reports function
function compareReports() {
    try {
        var file1 = File.openDialog("Select baseline report file (JSON):");
        if (!file1) return;
        
        var file2 = File.openDialog("Select current report file (JSON):");
        if (!file2) return;
        
        // Read files
        file1.open("r");
        var report1 = JSON.parse(file1.read());
        file1.close();
        
        file2.open("r");
        var report2 = JSON.parse(file2.read());
        file2.close();
        
        // Compare reports
        var differences = compareDocumentReports(report1, report2);
        
        // Create all summaries
        var summary = createHumanReadableSummary(differences);
        var textAnalysis = createTextAnalysisSummary(differences);
        var discoveryReport = createDiscoveryReport(differences);
        
        // Save comparison results
        var timestamp = new Date().getTime();
        var comparisonFile = File(file1.path + "/comparison_" + timestamp + ".json");
        comparisonFile.open("w");
        comparisonFile.write(JSON.stringify(differences, null, 2));
        comparisonFile.close();
        
        // Show enhanced summary
        showEnhancedComparisonDialog(summary, differences, textAnalysis, discoveryReport);
        
        return differences;
        
    } catch (error) {
        alert("Error comparing reports: " + error.message + "\nLine: " + error.line);
        return null;
    }
}

// Run the enhanced utility
try {
    // Check if enhanced analyzer functions are available
    if (typeof safeGetProperty === 'undefined' || typeof createDocumentReport === 'undefined') {
        alert("Enhanced InDesign Document Analyzer v2.0 Required!\n\n" +
              "This utility requires the enhanced analyzer script to be loaded first.\n\n" +
              "Required features:\n" +
              "• Text content capture and analysis\n" +
              "• Auto-discovery of collections and properties\n" +
              "• Broken property detection and tracking\n" +
              "• Bulletproof error handling\n" +
              "• Multi-method image detection\n\n" +
              "Please load the main enhanced analyzer script first.");
        return;
    }
    
    showMainMenu();
} catch (error) {
    alert("Error: " + error.message + "\nLine: " + error.line);
}

// Note: This enhanced utility script must be used with the enhanced analyzer script v2.0