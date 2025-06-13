//
// Enhanced InDesign Document Comparison Utility
// A user-friendly interface for comparing document analysis reports with bulletproof error handling
//

// Quick analysis and comparison workflow
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
        // Create baseline report
        var report = analyzeDocument();
        if (!report) {
            alert("Failed to create baseline analysis. Check for errors and try again.");
            return;
        }
        
        baselineFile.open("w");
        baselineFile.write(JSON.stringify(report, null, 2));
        baselineFile.close();
        
        alert("Baseline analysis created: " + baselineFile.name + "\n\n" +
              "Make your changes to the document, then run this script again to see differences.");
        return;
    }
    
    // Create current report
    var currentReport = analyzeDocument();
    if (!currentReport) {
        alert("Failed to analyze current document. Check for errors and try again.");
        return;
    }
    
    currentFile.open("w");
    currentFile.write(JSON.stringify(currentReport, null, 2));
    currentFile.close();
    
    // Load baseline report
    baselineFile.open("r");
    var baselineReport = JSON.parse(baselineFile.read());
    baselineFile.close();
    
    // Compare reports
    var differences = compareDocumentReports(baselineReport, currentReport);
    
    // Create human-readable summary
    var summary = createHumanReadableSummary(differences);
    
    // Save detailed comparison
    var comparisonFile = File(docPath + "/" + docName + "_comparison.json");
    comparisonFile.open("w");
    comparisonFile.write(JSON.stringify(differences, null, 2));
    comparisonFile.close();
    
    // Save human-readable summary
    var summaryFile = File(docPath + "/" + docName + "_summary.txt");
    summaryFile.open("w");
    summaryFile.write(summary);
    summaryFile.close();
    
    // Display summary dialog
    showComparisonDialog(summary, differences);
}

// Create human-readable summary of changes with access guidance
function createHumanReadableSummary(differences) {
    var summary = "DOCUMENT COMPARISON SUMMARY\n";
    summary += "Generated: " + new Date().toString() + "\n";
    summary += "=" + Array(51).join("=") + "\n\n";
    
    if (!differences.summary.hasChanges) {
        summary += "✓ NO CHANGES DETECTED\n";
        summary += "The document appears to be identical to the baseline.\n";
        return summary;
    }
    
    summary += "⚠ CHANGES DETECTED\n";
    summary += "Changed sections: " + differences.summary.changedSections.length + "\n";
    if (differences.errors && differences.errors.length > 0) {
        summary += "Analysis errors: " + differences.errors.length + " (see details)\n";
    }
    summary += "\n";
    
    var changes = differences.changes;
    
    // Document Information Changes
    if (changes.documentInfo) {
        summary += "📄 DOCUMENT INFORMATION\n";
        summary += "-".repeat(25) + "\n";
        for (var i = 0; i < changes.documentInfo.length; i++) {
            var change = changes.documentInfo[i];
            summary += formatChangeWithAccess(change) + "\n";
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
            for (var i = 0; i < Math.min(3, pageChanges.modifications.length); i++) {
                summary += "  - " + formatChangeWithAccess(pageChanges.modifications[i]) + "\n";
            }
            if (pageChanges.modifications.length > 3) {
                summary += "  - ... and " + (pageChanges.modifications.length - 3) + " more\n";
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
            for (var i = 0; i < Math.min(2, layerChanges.modifications.length); i++) {
                summary += "  - " + formatChangeWithAccess(layerChanges.modifications[i]) + "\n";
            }
        }
        summary += "\n";
    }
    
    // Story Changes
    if (changes.stories) {
        summary += "📝 TEXT STORIES\n";
        summary += "-".repeat(14) + "\n";
        var storyChanges = categorizeChanges(changes.stories);
        if (storyChanges.additions.length > 0) {
            summary += "• Added " + storyChanges.additions.length + " story(ies)\n";
        }
        if (storyChanges.deletions.length > 0) {
            summary += "• Removed " + storyChanges.deletions.length + " story(ies)\n";
        }
        if (storyChanges.modifications.length > 0) {
            summary += "• Modified " + storyChanges.modifications.length + " story(ies)\n";
            // Show content length changes with access info
            for (var i = 0; i < Math.min(2, storyChanges.modifications.length); i++) {
                var change = storyChanges.modifications[i];
                if (change.path.indexOf('.length') !== -1) {
                    summary += "  - Text length changed: " + change.oldValue + " → " + change.newValue + "\n";
                    summary += "    Access: " + (change.accessPath ? change.accessPath.primary : "doc.stories[n].length") + "\n";
                }
            }
        }
        summary += "\n";
    }
    
    // Style Changes
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
            // Show specific image changes
            for (var i = 0; i < Math.min(3, imageChanges.modifications.length); i++) {
                var change = imageChanges.modifications[i];
                if (change.path.indexOf('summary.totalFound') !== -1) {
                    summary += "  - Total images found: " + change.oldValue + " → " + change.newValue + "\n";
                } else if (change.path.indexOf('actualPpi') !== -1) {
                    summary += "  - Image resolution changed\n";
                } else if (change.path.indexOf('linkStatus') !== -1) {
                    summary += "  - Link status changed\n";
                }
            }
        }
        summary += "\n";
    }
    
    // Graphics Changes (Enhanced)
    if (changes.graphics) {
        summary += "🎨 GRAPHICS (COMPREHENSIVE)\n";
        summary += "-".repeat(25) + "\n";
        var graphicChanges = categorizeChanges(changes.graphics);
        if (graphicChanges.additions.length > 0) {
            summary += "• Added " + graphicChanges.additions.length + " graphic(s)\n";
        }
        if (graphicChanges.deletions.length > 0) {
            summary += "• Removed " + graphicChanges.deletions.length + " graphic(s)\n";
        }
        if (graphicChanges.modifications.length > 0) {
            summary += "• Modified " + graphicChanges.modifications.length + " graphic(s)\n";
        }
        summary += "\n";
    }
    
    // Text Frames Changes (Enhanced)
    if (changes.textFrames) {
        summary += "📝 TEXT FRAMES (DETAILED)\n";
        summary += "-".repeat(23) + "\n";
        var textFrameChanges = categorizeChanges(changes.textFrames);
        if (textFrameChanges.additions.length > 0) {
            summary += "• Added " + textFrameChanges.additions.length + " text frame(s)\n";
        }
        if (textFrameChanges.deletions.length > 0) {
            summary += "• Removed " + textFrameChanges.deletions.length + " text frame(s)\n";
        }
        if (textFrameChanges.modifications.length > 0) {
            summary += "• Modified " + textFrameChanges.modifications.length + " text frame(s)\n";
            // Show content changes
            for (var i = 0; i < textFrameChanges.modifications.length; i++) {
                var change = textFrameChanges.modifications[i];
                if (change.path.indexOf('characterCount') !== -1) {
                    summary += "  - Character count changed: " + change.oldValue + " → " + change.newValue + "\n";
                } else if (change.path.indexOf('overflows') !== -1) {
                    summary += "  - Overflow status changed\n";
                }
            }
        }
        summary += "\n";
    }
    
    // Page Items Changes
    if (changes.pageItems) {
        summary += "📦 PAGE ITEMS\n";
        summary += "-".repeat(12) + "\n";
        for (var i = 0; i < changes.pageItems.length; i++) {
            var change = changes.pageItems[i];
            if (change.type === 'value_change') {
                var itemType = change.path.split('.')[1];
                summary += "• " + itemType + ": " + change.oldValue + " → " + change.newValue + "\n";
            }
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
            for (var i = 0; i < Math.min(3, hierarchyChanges.modifications.length); i++) {
                var change = hierarchyChanges.modifications[i];
                if (change.path.indexOf('maxNestingDepth') !== -1) {
                    summary += "  - Max nesting depth: " + change.oldValue + " → " + change.newValue + "\n";
                } else if (change.path.indexOf('pageItemsByType') !== -1) {
                    summary += "  - Page item counts changed\n";
                }
            }
        }
        summary += "\n";
    }
    
    // Color Changes
    if (changes.colors) {
        summary += "🎨 COLORS & SWATCHES\n";
        summary += "-".repeat(18) + "\n";
        var colorChanges = categorizeChanges(changes.colors);
        if (colorChanges.additions.length > 0) {
            summary += "• Added " + colorChanges.additions.length + " color(s)\n";
        }
        if (colorChanges.deletions.length > 0) {
            summary += "• Removed " + colorChanges.deletions.length + " color(s)\n";
        }
        summary += "\n";
    }
    
    // Font Changes
    if (changes.fonts) {
        summary += "🔤 FONTS\n";
        summary += "-".repeat(8) + "\n";
        var fontChanges = categorizeChanges(changes.fonts);
        if (fontChanges.additions.length > 0) {
            summary += "• Added " + fontChanges.additions.length + " font(s)\n";
        }
        if (fontChanges.deletions.length > 0) {
            summary += "• Removed " + fontChanges.deletions.length + " font(s)\n";
        }
        summary += "\n";
    }
    
    // Links Changes
    if (changes.links) {
        summary += "🔗 LINKS\n";
        summary += "-".repeat(8) + "\n";
        var linkChanges = categorizeChanges(changes.links);
        if (linkChanges.additions.length > 0) {
            summary += "• Added " + linkChanges.additions.length + " link(s)\n";
        }
        if (linkChanges.deletions.length > 0) {
            summary += "• Removed " + linkChanges.deletions.length + " link(s)\n";
        }
        if (linkChanges.modifications.length > 0) {
            summary += "• Modified " + linkChanges.modifications.length + " link(s)\n";
            // Show status changes
            for (var i = 0; i < linkChanges.modifications.length; i++) {
                var change = linkChanges.modifications[i];
                if (change.path.indexOf('.status') !== -1) {
                    summary += "  - Link status changed: " + change.oldValue + " → " + change.newValue + "\n";
                }
            }
        }
        summary += "\n";
    }
    
    summary += "=" + Array(51).join("=") + "\n";
    summary += "📚 ACCESS GUIDE\n";
    summary += "Detailed object model paths and safety notes are included\n";
    summary += "in the JSON comparison file for developer reference.\n\n";
    summary += "For detailed technical information, see the accompanying JSON file.\n";
    
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
        modifications: []
    };
    
    try {
        for (var i = 0; i < changes.length; i++) {
            var change = changes[i];
            var changeType = safeGetProperty(change, 'type', 'unknown');
            switch (changeType) {
                case "addition":
                    result.additions.push(change);
                    break;
                case "deletion":
                    result.deletions.push(change);
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

// Show comparison dialog with actionable options
function showComparisonDialog(summary, differences) {
    var dialog = new Window("dialog", "Document Comparison Results");
    dialog.preferredSize.width = 600;
    dialog.preferredSize.height = 400;
    
    // Summary text
    var summaryGroup = dialog.add("group");
    summaryGroup.orientation = "column";
    summaryGroup.alignment = "fill";
    
    var summaryPanel = summaryGroup.add("panel", undefined, "Summary");
    summaryPanel.alignment = "fill";
    summaryPanel.preferredSize.height = 300;
    
    var summaryText = summaryPanel.add("edittext", undefined, summary, {multiline: true, readonly: true});
    summaryText.alignment = "fill";
    
    // Action buttons
    var buttonGroup = dialog.add("group");
    buttonGroup.alignment = "center";
    
    var viewDetailsBtn = buttonGroup.add("button", undefined, "View Details");
    var accessPathsBtn = buttonGroup.add("button", undefined, "Access Paths");
    var exportBtn = buttonGroup.add("button", undefined, "Export Report");
    var resetBaselineBtn = buttonGroup.add("button", undefined, "Set New Baseline");
    var okBtn = buttonGroup.add("button", undefined, "OK");
    
    viewDetailsBtn.onClick = function() {
        // Show detailed changes in a new dialog
        showDetailedChanges(differences);
    };
    
    accessPathsBtn.onClick = function() {
        // Create and show access paths guide
        var accessGuide = createAccessPathsGuide(differences);
        var accessDialog = new Window("dialog", "Object Model Access Paths");
        accessDialog.preferredSize.width = 700;
        accessDialog.preferredSize.height = 500;
        
        var guideGroup = accessDialog.add("group");
        guideGroup.orientation = "column";
        guideGroup.alignment = "fill";
        
        var guidePanel = guideGroup.add("panel", undefined, "How to Access Changed Properties");
        guidePanel.alignment = "fill";
        guidePanel.preferredSize.height = 400;
        
        var guideText = guidePanel.add("edittext", undefined, accessGuide, {multiline: true, readonly: true});
        guideText.alignment = "fill";
        
        var guideCloseBtn = guideGroup.add("button", undefined, "Close");
        guideCloseBtn.alignment = "center";
        guideCloseBtn.onClick = function() { accessDialog.close(); };
        
        accessDialog.show();
    };
    
    exportBtn.onClick = function() {
        var file = File.saveDialog("Save comparison report", "*.txt");
        if (file) {
            file.open("w");
            file.write(summary);
            file.close();
            alert("Report exported to: " + file.name);
        }
    };
    
    resetBaselineBtn.onClick = function() {
        var result = confirm("This will replace the current baseline with the current document state. Continue?");
        if (result) {
            var doc = app.activeDocument;
            var docName = doc.name.replace(/\.[^\.]+$/, "");
            var docPath = doc.filePath;
            var baselineFile = File(docPath + "/" + docName + "_baseline.json");
            var currentFile = File(docPath + "/" + docName + "_current.json");
            
            // Copy current to baseline
            if (currentFile.exists()) {
                currentFile.copy(baselineFile);
                alert("New baseline set successfully!");
                dialog.close();
            }
        }
    };
    
    okBtn.onClick = function() {
        dialog.close();
    };
    
    dialog.show();
}

// Show detailed changes dialog with access path information
function showDetailedChanges(differences) {
    var dialog = new Window("dialog", "Detailed Changes with Access Paths");
    dialog.preferredSize.width = 800;
    dialog.preferredSize.height = 600;
    
    var mainGroup = dialog.add("group");
    mainGroup.orientation = "column";
    mainGroup.alignment = "fill";
    
    // Section selector
    var selectorGroup = mainGroup.add("group");
    var selectorLabel = selectorGroup.add("statictext", undefined, "Section:");
    var sectionDropdown = selectorGroup.add("dropdownlist", undefined, differences.summary.changedSections);
    sectionDropdown.selection = 0;
    
    // View mode selector
    var viewGroup = mainGroup.add("group");
    var viewLabel = viewGroup.add("statictext", undefined, "View:");
    var viewDropdown = viewGroup.add("dropdownlist", undefined, ["Changes Only", "Changes + Access Paths", "Access Paths Only"]);
    viewDropdown.selection = 1; // Default to "Changes + Access Paths"
    
    // Details panel
    var detailsPanel = mainGroup.add("panel", undefined, "Changes & Access Information");
    detailsPanel.alignment = "fill";
    detailsPanel.preferredSize.height = 400;
    
    var detailsText = detailsPanel.add("edittext", undefined, "", {multiline: true, readonly: true});
    detailsText.alignment = "fill";
    
    // Update details function with enhanced error handling
    function updateDetails() {
        try {
            if (!sectionDropdown.selection) return;
            
            var selectedSection = sectionDropdown.selection.text;
            var changes = safeGetProperty(differences.changes, selectedSection, []);
            var viewMode = viewDropdown.selection ? viewDropdown.selection.index : 1;
            var detailsString = "";
            
            if (viewMode === 0) {
                // Changes Only
                detailsString = "Changes in " + selectedSection + ":\n\n";
                for (var i = 0; i < changes.length; i++) {
                    var change = changes[i];
                    detailsString += formatChange(change) + "\n";
                }
            } else if (viewMode === 1) {
                // Changes + Access Paths
                detailsString = "Changes in " + selectedSection + " with Access Information:\n";
                detailsString += "=" + Array(60).join("=") + "\n\n";
                
                for (var i = 0; i < changes.length; i++) {
                    var change = changes[i];
                    detailsString += "CHANGE: " + formatChange(change) + "\n";
                    
                    // Safely handle access path information
                    var accessPath = safeGetProperty(change, 'accessPath');
                    if (accessPath) {
                        var primary = safeGetProperty(accessPath, 'primary');
                        if (primary && primary !== "" && primary.indexOf('Error') === -1) {
                            detailsString += "  PRIMARY ACCESS: " + primary + "\n";
                        } else {
                            detailsString += "  PRIMARY ACCESS: [Error or unavailable]\n";
                        }
                        
                        var alternatives = safeGetProperty(accessPath, 'alternatives', []);
                        if (alternatives && alternatives.length > 0) {
                            detailsString += "  ALTERNATIVES:\n";
                            for (var j = 0; j < Math.min(alternatives.length, 3); j++) {
                                if (alternatives[j] && alternatives[j] !== "") {
                                    detailsString += "    • " + alternatives[j] + "\n";
                                }
                            }
                        }
                        
                        var collectionMethod = safeGetProperty(accessPath, 'collectionMethod');
                        if (collectionMethod && collectionMethod !== "") {
                            detailsString += "  COLLECTION INFO: " + collectionMethod + "\n";
                        }
                        
                        var safetyLevel = safeGetProperty(accessPath, 'safetyLevel');
                        if (safetyLevel && safetyLevel !== "medium") {
                            detailsString += "  SAFETY LEVEL: " + safetyLevel.toUpperCase() + "\n";
                        }
                    } else {
                        detailsString += "  ACCESS PATH: [Not available]\n";
                    }
                    
                    // Safely handle safety notes
                    var safetyNotes = safeGetProperty(change, 'safetyNotes', []);
                    if (safetyNotes && safetyNotes.length > 0) {
                        detailsString += "  SAFETY NOTES:\n";
                        for (var k = 0; k < Math.min(safetyNotes.length, 4); k++) {
                            if (safetyNotes[k] && safetyNotes[k] !== "") {
                                detailsString += "    ⚠ " + safetyNotes[k] + "\n";
                            }
                        }
                        if (safetyNotes.length > 4) {
                            detailsString += "    ... and " + (safetyNotes.length - 4) + " more safety notes\n";
                        }
                    }
                    
                    detailsString += "\n" + "-".repeat(50) + "\n\n";
                }
            } else {
                // Access Paths Only
                detailsString = "Object Model Access Paths for " + selectedSection + ":\n";
                detailsString += "=" + Array(50).join("=") + "\n\n";
                
                for (var i = 0; i < changes.length; i++) {
                    var change = changes[i];
                    var accessPath = safeGetProperty(change, 'accessPath');
                    if (accessPath) {
                        var changePath = safeGetProperty(change, 'path', 'unknown');
                        detailsString += "PROPERTY: " + changePath + "\n";
                        
                        var primary = safeGetProperty(accessPath, 'primary');
                        if (primary && primary !== "" && primary.indexOf('Error') === -1) {
                            detailsString += "ACCESS: " + primary + "\n";
                        } else {
                            detailsString += "ACCESS: [Manual access required]\n";
                        }
                        
                        var alternatives = safeGetProperty(accessPath, 'alternatives', []);
                        if (alternatives && alternatives.length > 0) {
                            detailsString += "ALTERNATIVES:\n";
                            for (var j = 0; j < Math.min(alternatives.length, 3); j++) {
                                if (alternatives[j] && alternatives[j] !== "") {
                                    detailsString += "  • " + alternatives[j] + "\n";
                                }
                            }
                        }
                        
                        var safetyNotes = safeGetProperty(change, 'safetyNotes', []);
                        if (safetyNotes && safetyNotes.length > 0) {
                            detailsString += "SAFETY:\n";
                            for (var k = 0; k < Math.min(safetyNotes.length, 2); k++) {
                                if (safetyNotes[k] && safetyNotes[k] !== "") {
                                    detailsString += "  ⚠ " + safetyNotes[k] + "\n";
                                }
                            }
                        }
                        
                        detailsString += "\n";
                    } else {
                        detailsString += "PROPERTY: " + safeGetProperty(change, 'path', 'unknown') + "\n";
                        detailsString += "ACCESS: [Information not available]\n\n";
                    }
                }
            }
            
            detailsText.text = detailsString;
            
        } catch (e) {
            detailsText.text = "Error displaying details: " + e.message + "\n\nTry refreshing or selecting a different section.";
        }
    }
    
    // Update details when section or view mode changes
    sectionDropdown.onChange = updateDetails;
    viewDropdown.onChange = updateDetails;
    
    // Initialize with first section
    if (sectionDropdown.items.length > 0) {
        sectionDropdown.selection = 0;
        updateDetails();
    }
    
    // Export access paths button
    var buttonGroup = mainGroup.add("group");
    var exportPathsBtn = buttonGroup.add("button", undefined, "Export Access Paths");
    var closeBtn = buttonGroup.add("button", undefined, "Close");
    
    exportPathsBtn.onClick = function() {
        var file = File.saveDialog("Save access paths reference", "*.txt");
        if (file) {
            var accessGuide = createAccessPathsGuide(differences);
            file.open("w");
            file.write(accessGuide);
            file.close();
            alert("Access paths guide exported to: " + file.name);
        }
    };
    
    closeBtn.alignment = "center";
    closeBtn.onClick = function() {
        dialog.close();
    };
    
    dialog.show();
}

// Create comprehensive access paths guide with bulletproof error handling
function createAccessPathsGuide(differences) {
    var guide = "InDesign Document Object Model Access Paths Guide\n";
    guide += "Generated: " + new Date().toString() + "\n";
    guide += "=" + Array(60).join("=") + "\n\n";
    
    guide += "This guide shows how to safely access the properties that changed\n";
    guide += "in your InDesign document using ExtendScript JavaScript.\n\n";
    
    try {
        var sections = safeGetProperty(differences.summary, 'changedSections', []);
        
        if (!sections || sections.length === 0) {
            guide += "No changed sections found to generate access paths.\n";
            return guide;
        }
        
        for (var s = 0; s < sections.length; s++) {
            try {
                var sectionName = sections[s];
                var sectionChanges = safeGetProperty(differences.changes, sectionName, []);
                
                guide += "SECTION: " + sectionName.toUpperCase() + "\n";
                guide += "=" + Array(sectionName.length + 10).join("=") + "\n\n";
                
                var uniquePaths = {};
                var pathCount = 0;
                
                for (var i = 0; i < sectionChanges.length && pathCount < 10; i++) {
                    try {
                        var change = sectionChanges[i];
                        var accessPath = safeGetProperty(change, 'accessPath');
                        
                        if (accessPath) {
                            var primary = safeGetProperty(accessPath, 'primary');
                            if (primary && primary !== "" && !uniquePaths[primary] && primary.indexOf('Error') === -1) {
                                uniquePaths[primary] = change;
                                pathCount++;
                                
                                var changePath = safeGetProperty(change, 'path', 'unknown');
                                guide += "Property: " + changePath + "\n";
                                guide += "Primary Access: " + primary + "\n";
                                
                                var alternatives = safeGetProperty(accessPath, 'alternatives', []);
                                if (alternatives && alternatives.length > 0) {
                                    guide += "Alternative Access:\n";
                                    for (var j = 0; j < Math.min(alternatives.length, 2); j++) {
                                        if (alternatives[j] && alternatives[j] !== "" && alternatives[j].indexOf('Error') === -1) {
                                            guide += "  " + alternatives[j] + "\n";
                                        }
                                    }
                                }
                                
                                var safetyNotes = safeGetProperty(change, 'safetyNotes', []);
                                if (safetyNotes && safetyNotes.length > 0) {
                                    guide += "Safety Notes:\n";
                                    for (var k = 0; k < Math.min(safetyNotes.length, 3); k++) {
                                        if (safetyNotes[k] && safetyNotes[k] !== "") {
                                            guide += "  • " + safetyNotes[k] + "\n";
                                        }
                                    }
                                }
                                
                                guide += "\nSample Safe Access Code:\n";
                                guide += "try {\n";
                                guide += "    var value = " + primary + ";\n";
                                guide += "    if (value !== undefined && value !== null) {\n";
                                guide += "        // Use the value safely\n";
                                guide += "        alert('Value: ' + value);\n";
                                guide += "    } else {\n";
                                guide += "        alert('Property exists but value is null/undefined');\n";
                                guide += "    }\n";
                                guide += "} catch (e) {\n";
                                guide += "    alert('Error accessing property: ' + e.message);\n";
                                guide += "}\n";
                                
                                guide += "\n" + "-".repeat(40) + "\n\n";
                            }
                        }
                    } catch (changeError) {
                        guide += "Error processing change: " + changeError.message + "\n\n";
                    }
                }
                
                if (pathCount === 0) {
                    guide += "No valid access paths found for this section.\n\n";
                }
                
            } catch (sectionError) {
                guide += "Error processing section " + sectionName + ": " + sectionError.message + "\n\n";
            }
        }
        
    } catch (e) {
        guide += "Error generating access paths guide: " + e.message + "\n";
        guide += "Please try again or use manual property access patterns.\n\n";
    }
    
    guide += "\nGENERAL SAFETY PATTERNS\n";
    guide += "=" + Array(25).join("=") + "\n\n";
    
    guide += "1. Always use try-catch blocks:\n";
    guide += "   try { var value = doc.someProperty; } catch (e) { /* handle error */ }\n\n";
    
    guide += "2. Check collection lengths:\n";
    guide += "   if (doc.pages.length > 0) { var page = doc.pages[0]; }\n\n";
    
    guide += "3. Verify object existence:\n";
    guide += "   if (page.appliedMaster) { var master = page.appliedMaster; }\n\n";
    
    guide += "4. Safe property access function:\n";
    guide += "   function safeGet(obj, prop, defaultVal) {\n";
    guide += "       try { \n";
    guide += "           if (!obj) return defaultVal;\n";
    guide += "           return obj[prop] !== undefined ? obj[prop] : defaultVal; \n";
    guide += "       } catch (e) { return defaultVal; }\n";
    guide += "   }\n\n";
    
    guide += "5. Collection iteration with error handling:\n";
    guide += "   for (var i = 0; i < doc.pages.length; i++) {\n";
    guide += "       try { \n";
    guide += "           var page = doc.pages[i]; \n";
    guide += "           if (page) { /* process page */ }\n";
    guide += "       } catch (e) { \n";
    guide += "           /* skip problematic page, continue loop */ \n";
    guide += "       }\n";
    guide += "   }\n\n";
    
    guide += "6. Nested property access:\n";
    guide += "   var margin = null;\n";
    guide += "   try {\n";
    guide += "       if (doc.pages.length > 0 && doc.pages[0].marginPreferences) {\n";
    guide += "           margin = doc.pages[0].marginPreferences.top;\n";
    guide += "       }\n";
    guide += "   } catch (e) {\n";
    guide += "       margin = 'Error: ' + e.message;\n";
    guide += "   }\n\n";
    
    guide += "TROUBLESHOOTING\n";
    guide += "=" + Array(16).join("=") + "\n\n";
    
    guide += "• If you get 'Object does not support this property':\n";
    guide += "  - Check that the object exists and is the right type\n";
    guide += "  - Verify the property name spelling\n";
    guide += "  - Some properties may not exist on all object types\n\n";
    
    guide += "• If you get 'Index out of range':\n";
    guide += "  - Always check collection.length before accessing by index\n";
    guide += "  - Use collection.item(index) as alternative\n";
    guide += "  - Remember collections are usually 0-based\n\n";
    
    guide += "• If you get null/undefined unexpectedly:\n";
    guide += "  - Property may not be set or available in your document type\n";
    guide += "  - Some properties depend on document state or version\n";
    guide += "  - Test with different documents to verify behavior\n\n";
    
    return guide;
}

// Reset baseline function
function resetBaseline() {
    if (!app.documents.length) {
        alert("Please open a document first.");
        return;
    }
    
    var result = confirm("This will create a new baseline analysis of the current document. Any existing baseline will be overwritten. Continue?");
    if (!result) return;
    
    var doc = app.activeDocument;
    var docName = doc.name.replace(/\.[^\.]+$/, "");
    var docPath = doc.filePath;
    
    var report = analyzeDocument();
    if (!report) {
        alert("Failed to create baseline analysis. Check for errors and try again.");
        return;
    }
    
    var baselineFile = File(docPath + "/" + docName + "_baseline.json");
    
    baselineFile.open("w");
    baselineFile.write(JSON.stringify(report, null, 2));
    baselineFile.close();
    
    alert("New baseline created: " + baselineFile.name);
}

// Menu-like interface
function showMainMenu() {
    var dialog = new Window("dialog", "InDesign Document Analyzer");
    dialog.preferredSize.width = 400;
    
    var mainGroup = dialog.add("group");
    mainGroup.orientation = "column";
    mainGroup.alignment = "fill";
    
    var titlePanel = mainGroup.add("panel", undefined, "Document Analysis & Comparison Tool");
    titlePanel.alignment = "fill";
    
    var infoText = titlePanel.add("statictext", undefined, 
        "Enhanced Document Analysis & Comparison Tool\n\n" +
        "✓ Comprehensive image detection (multiple methods)\n" +
        "✓ Robust error handling prevents crashes\n" +
        "✓ Deep object hierarchy analysis\n" +
        "✓ Enhanced graphics and text frame tracking\n" +
        "✓ Safe analysis of complex nested objects\n" +
        "✓ Object model access paths for changed properties\n" +
        "✓ Safety guidelines for property access", 
        {multiline: true});
    infoText.alignment = "fill";
    
    var buttonGroup = mainGroup.add("group");
    buttonGroup.orientation = "column";
    buttonGroup.alignment = "fill";
    
    var quickCompareBtn = buttonGroup.add("button", undefined, "Quick Compare (Recommended)");
    var createBaselineBtn = buttonGroup.add("button", undefined, "Create New Baseline");
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
    // Make sure both scripts are loaded together
    if (typeof safeGetProperty === 'undefined') {
        alert("Error: Enhanced analyzer functions not found. Please load the main analyzer script first.");
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
        alert("Enhanced document analysis complete! (" + duration + "s)\nReport saved as: " + reportFile.name);
        return report;
        
    } catch (error) {
        alert("Analysis failed: " + error.message + "\nLine: " + error.line);
        return null;
    }
}

// Run the utility
try {
    // Check if enhanced analyzer functions are available
    if (typeof safeGetProperty === 'undefined' || typeof createDocumentReport === 'undefined') {
        alert("Enhanced InDesign Document Analyzer Required!\n\n" +
              "This utility requires the enhanced analyzer script to be loaded first.\n" +
              "Please:\n" +
              "1. Load the main 'Enhanced InDesign Document Analyzer Script' first\n" +
              "2. Then load this utility script\n" +
              "3. Both scripts work together for comprehensive analysis\n\n" +
              "The enhanced analyzer provides:\n" +
              "• Multi-method image detection\n" +
              "• Robust error handling\n" +
              "• Deep object analysis\n" +
              "• Safe property access");
        return;
    }
    
    showMainMenu();
} catch (error) {
    alert("Error: " + error.message + "\nLine: " + error.line);
}

// Note: This utility script must be used together with the enhanced analyzer script
// Load both scripts in your InDesign Scripts folder and run the enhanced analyzer first