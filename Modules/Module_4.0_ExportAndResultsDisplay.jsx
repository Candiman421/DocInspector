// ============================================================================
// MODULE 4.0: EXPORT & RESULTS DISPLAY (UPDATED)
// InDesign Document Query Tool v3.1 - Enhanced Export and Visualization
// ES3 Compatible - Tree Export and Results Viewer with Best Practice Safety
// ============================================================================

// RESULTS DISPLAY DIALOG - Enhanced expandable tree view with safety
function showResultsDialog(treeResults) {
    if (!treeResults) {
        alert("No results to display.");
        return;
    }
    
    try {
        var resultsDialog = new Window("dialog", "Analysis Results - Enhanced DOM Tree View");
        resultsDialog.orientation = "column";
        resultsDialog.alignChildren = "fill";
        resultsDialog.preferredSize.width = 850;
        resultsDialog.preferredSize.height = 650;
        
        // Enhanced header with comprehensive statistics
        var headerPanel = resultsDialog.add("panel", undefined, "Analysis Summary & Safety Metrics");
        headerPanel.orientation = "column";
        headerPanel.alignChildren = "fill";
        
        var stats = getTreeStatistics(treeResults);
        var headerLine1 = "Total Nodes: " + stats.totalNodes + 
                         " | Success: " + stats.successNodes + 
                         " | Errors: " + stats.errorNodes + 
                         " | Max Depth: " + stats.maxDepth;
        
        var headerLine2 = "Undefined: " + stats.undefinedNodes + 
                         " | Empty: " + stats.emptyNodes + 
                         " | Timeouts: " + stats.timeoutNodes + 
                         " | Avg Depth: " + stats.avgDepth;
        
        headerPanel.add("statictext", undefined, headerLine1);
        headerPanel.add("statictext", undefined, headerLine2);
        
        // Tree display area with enhanced formatting
        var treePanel = resultsDialog.add("panel", undefined, "Document Tree Structure");
        treePanel.orientation = "column";
        treePanel.alignChildren = "fill";
        
        var treeText = treePanel.add("edittext", undefined, "", {multiline: true, readonly: true});
        treeText.alignment = "fill";
        
        // Convert tree to enhanced display format
        var treeDisplay = formatTreeForDisplayEnhanced(treeResults, 0, true, false);
        treeText.text = treeDisplay;
        
        // Enhanced controls panel
        var controlsPanel = resultsDialog.add("group");
        controlsPanel.orientation = "row";
        controlsPanel.alignment = "center";
        
        var expandBtn = controlsPanel.add("button", undefined, "Expand All");
        var collapseBtn = controlsPanel.add("button", undefined, "Collapse All");
        var filterBtn = controlsPanel.add("button", undefined, "Filter Errors");
        var exportBtn = controlsPanel.add("button", undefined, "Export Full");
        var copyBtn = controlsPanel.add("button", undefined, "Copy Summary");
        var validateBtn = controlsPanel.add("button", undefined, "Validate Tree");
        var closeBtn = controlsPanel.add("button", undefined, "Close");
        
        // Enhanced event handlers
        expandBtn.onClick = function() {
            try {
                var expandedDisplay = formatTreeForDisplayEnhanced(treeResults, 0, true, true);
                treeText.text = expandedDisplay;
            } catch (e) {
                alert("Error expanding tree: " + e.message);
            }
        };
        
        collapseBtn.onClick = function() {
            try {
                var collapsedDisplay = formatTreeForDisplayEnhanced(treeResults, 0, false, false);
                treeText.text = collapsedDisplay;
            } catch (e) {
                alert("Error collapsing tree: " + e.message);
            }
        };
        
        filterBtn.onClick = function() {
            try {
                var filteredTree = filterTreeByStatus(treeResults, ["error", "timeout"]);
                if (filteredTree) {
                    var filteredDisplay = formatTreeForDisplayEnhanced(filteredTree, 0, true, true);
                    treeText.text = filteredDisplay;
                } else {
                    treeText.text = "No errors or timeouts found in the analysis results.";
                }
            } catch (e) {
                alert("Error filtering tree: " + e.message);
            }
        };
        
        exportBtn.onClick = function() {
            try {
                exportTreeToFileEnhanced(treeResults);
            } catch (e) {
                alert("Error exporting: " + e.message);
            }
        };
        
        copyBtn.onClick = function() {
            try {
                copyTreeSummaryToClipboard(treeResults);
            } catch (e) {
                alert("Error copying: " + e.message);
            }
        };
        
        validateBtn.onClick = function() {
            try {
                var validation = validateTreeStructure(treeResults);
                var message = "Tree Validation Results:\n\n";
                message += "Nodes Checked: " + validation.nodesChecked + "\n";
                message += "Valid: " + (validation.isValid ? "YES" : "NO") + "\n";
                message += "Errors: " + validation.errors.length + "\n";
                message += "Warnings: " + validation.warnings.length + "\n\n";
                
                if (validation.errors.length > 0) {
                    message += "Errors:\n" + validation.errors.join("\n") + "\n\n";
                }
                
                if (validation.warnings.length > 0) {
                    message += "Warnings:\n" + validation.warnings.join("\n");
                }
                
                alert(message);
            } catch (e) {
                alert("Error validating tree: " + e.message);
            }
        };
        
        closeBtn.onClick = function() {
            resultsDialog.close();
        };
        
        resultsDialog.show();
        
    } catch (exc) {
        alert("Failed to show results dialog: " + exc.message);
    }
}

// ENHANCED TREE FORMATTING - Improved display with safety indicators
function formatTreeForDisplayEnhanced(node, depth, showChildren, expandAll) {
    if (!node) return "";
    
    var output = "";
    var indent = "";
    
    // Create enhanced indentation
    for (var i = 0; i < depth; i++) {
        indent += i === depth - 1 ? "├─ " : "│  ";
    }
    
    // Enhanced status symbols with safety context
    var nodeSymbol = getDisplaySymbolEnhanced(node.status);
    var nodeDisplay = indent + nodeSymbol + " " + node.name;
    
    // Add enhanced type and value information
    if (node.type && node.type !== "unknown") {
        nodeDisplay += " [" + node.type + "]";
    }
    
    if (node.value && node.value !== node.name && String(node.value).length > 0) {
        var valueDisplay = String(node.value);
        if (valueDisplay.length > 80) {
            valueDisplay = valueDisplay.substring(0, 77) + "...";
        }
        nodeDisplay += ": " + valueDisplay;
    }
    
    // Add safety and performance indicators
    if (node.status === "timeout") {
        nodeDisplay += " [TIMEOUT]";
    } else if (node.status === "error") {
        nodeDisplay += " [ERROR]";
    } else if (node.status === "emergency_timeout") {
        nodeDisplay += " [EMERGENCY]";
    }
    
    // Add path for debugging if enabled
    if (QUERY_CONFIG.traversal.pathTracking && node.path && depth < 3) {
        nodeDisplay += " (" + node.path + ")";
    }
    
    output += nodeDisplay + "\n";
    
    // Enhanced children handling
    if (showChildren && node.children && node.children.length > 0) {
        var shouldShowChildren = expandAll || depth < 2;
        
        if (shouldShowChildren) {
            for (var i = 0; i < node.children.length; i++) {
                output += formatTreeForDisplayEnhanced(node.children[i], depth + 1, true, expandAll);
            }
        } else {
            var childSummary = indent + "│  ▼ " + node.children.length + " children ";
            
            // Add child status summary
            var childStats = { success: 0, error: 0, other: 0 };
            for (var i = 0; i < node.children.length; i++) {
                var childStatus = node.children[i].status;
                if (childStatus === "success") {
                    childStats.success++;
                } else if (childStatus === "error" || childStatus === "timeout") {
                    childStats.error++;
                } else {
                    childStats.other++;
                }
            }
            
            childSummary += "(✓" + childStats.success + " ✗" + childStats.error + " ?" + childStats.other + ")";
            childSummary += " - expand to view\n";
            output += childSummary;
        }
    }
    
    return output;
}

function getDisplaySymbolEnhanced(status) {
    var symbols = {
        success: "✓",
        error: "✗",
        timeout: "⏱",
        emergency_timeout: "🚨",
        undefined: "∅",
        empty: "○",
        skipped: "⏭",
        disabled: "⏸",
        truncated: "…",
        optimized: "⚡",
        unknown: "?"
    };
    
    return symbols[status] || "?";
}

// ENHANCED FILE EXPORT - Complete tree with metadata and safety info
function exportTreeToFileEnhanced(treeResults) {
    if (!treeResults) {
        alert("No results to export.");
        return;
    }
    
    var outputPath = QUERY_CONFIG.paths.outputPath;
    if (!outputPath) {
        var folder = Folder.selectDialog("Select folder to save enhanced tree export");
        if (!folder) return;
        outputPath = folder.fsName;
        QUERY_CONFIG.paths.outputPath = outputPath;
    }
    
    try {
        var timestamp = new Date();
        var dateStr = timestamp.getFullYear() + 
                     padNumber(timestamp.getMonth() + 1) + 
                     padNumber(timestamp.getDate()) + "_" + 
                     padNumber(timestamp.getHours()) + 
                     padNumber(timestamp.getMinutes()) + 
                     padNumber(timestamp.getSeconds());
        
        var filename = "InDesign_QueryResults_Enhanced_" + dateStr + ".txt";
        var filepath = outputPath + "/" + filename;
        var file = File(filepath);
        
        file.open("w");
        
        // Enhanced header with comprehensive information
        file.writeln("InDesign Document Query Tool v3.1 - Enhanced Analysis Results");
        file.writeln("========================================================");
        file.writeln("Generated: " + timestamp.toString());
        file.writeln("Document: " + (QUERY_CONFIG.paths.documentPath || "Unknown"));
        file.writeln("");
        
        // Configuration details
        file.writeln("ANALYSIS CONFIGURATION:");
        file.writeln("  Traversal Depth: " + QUERY_CONFIG.traversal.maxDepth);
        file.writeln("  Sample Limit: " + QUERY_CONFIG.traversal.sampleLimit);
        file.writeln("  Timeout: " + QUERY_CONFIG.traversal.timeoutMs + "ms");
        file.writeln("  Emergency Bailouts: " + QUERY_CONFIG.traversal.emergencyBailouts);
        file.writeln("  Show Empty Values: " + QUERY_CONFIG.traversal.showEmpty);
        file.writeln("  Show Undefined: " + QUERY_CONFIG.traversal.showUndefined);
        file.writeln("  Path Tracking: " + QUERY_CONFIG.traversal.pathTracking);
        file.writeln("");
        
        // Enhanced statistics
        var stats = getTreeStatistics(treeResults);
        file.writeln("ANALYSIS STATISTICS:");
        file.writeln("  Total Nodes: " + stats.totalNodes);
        file.writeln("  Successful: " + stats.successNodes + " (" + Math.round((stats.successNodes/stats.totalNodes)*100) + "%)");
        file.writeln("  Errors: " + stats.errorNodes);
        file.writeln("  Undefined: " + stats.undefinedNodes);
        file.writeln("  Empty: " + stats.emptyNodes);
        file.writeln("  Timeouts: " + stats.timeoutNodes);
        file.writeln("  Truncated: " + stats.truncatedNodes);
        file.writeln("  Maximum Depth: " + stats.maxDepth);
        file.writeln("  Average Depth: " + stats.avgDepth);
        file.writeln("");
        
        // Safety metrics
        file.writeln("SAFETY METRICS:");
        file.writeln("  Runtime Errors: " + QUERY_CONFIG.runtime.errorCount);
        file.writeln("  Success Count: " + QUERY_CONFIG.runtime.successCount);
        file.writeln("  Success Rate: " + Math.round((QUERY_CONFIG.runtime.successCount/(QUERY_CONFIG.runtime.successCount + QUERY_CONFIG.runtime.errorCount))*100) + "%");
        file.writeln("");
        
        // Enabled targets list
        var enabledTargets = getEnabledTargets();
        file.writeln("ENABLED TARGETS:");
        for (var i = 0; i < enabledTargets.length; i++) {
            var target = QUERY_CONFIG.targets[enabledTargets[i]];
            file.writeln("  " + enabledTargets[i] + " - " + target.description + " (Safe: " + target.safe + ")");
        }
        file.writeln("");
        
        file.writeln("DOCUMENT TREE STRUCTURE:");
        file.writeln("========================");
        
        // Export the complete tree structure
        var treeContent = formatTreeForExportEnhanced(treeResults, 0);
        file.write(treeContent);
        
        file.close();
        
        alert("Enhanced results exported successfully to:\n" + filepath + "\n\nFile includes comprehensive statistics and safety metrics.");
        
    } catch (e) {
        alert("Enhanced export failed: " + e.message);
    }
}

// ENHANCED TREE EXPORT FORMATTING
function formatTreeForExportEnhanced(node, depth) {
    if (!node) return "";
    
    var output = "";
    var indent = "";
    
    // Create detailed indentation
    for (var i = 0; i < depth; i++) {
        indent += "  ";
    }
    
    // Enhanced node information
    output += indent + "├─ " + node.name + "\n";
    output += indent + "│  Type: " + (node.type || "unknown") + "\n";
    output += indent + "│  Status: " + (node.status || "unknown") + "\n";
    
    if (node.value !== undefined && String(node.value).length > 0) {
        var valueStr = String(node.value);
        if (valueStr.length > 500) {
            valueStr = valueStr.substring(0, 500) + "... [truncated for export]";
        }
        output += indent + "│  Value: " + valueStr + "\n";
    }
    
    if (node.path) {
        output += indent + "│  Path: " + node.path + "\n";
    }
    
    if (node.timestamp) {
        output += indent + "│  Timestamp: " + node.timestamp + "\n";
    }
    
    output += indent + "│\n";
    
    // Enhanced children processing
    if (node.children && node.children.length > 0) {
        for (var i = 0; i < node.children.length; i++) {
            output += formatTreeForExportEnhanced(node.children[i], depth + 1);
        }
    }
    
    return output;
}

// ENHANCED CLIPBOARD COPY - Summary with key metrics
function copyTreeSummaryToClipboard(treeResults) {
    if (!treeResults) {
        alert("No results to copy.");
        return;
    }
    
    try {
        var stats = getTreeStatistics(treeResults);
        var summary = "InDesign Document Analysis Summary\n";
        summary += "==================================\n\n";
        summary += "Total Nodes: " + stats.totalNodes + "\n";
        summary += "Success Rate: " + Math.round((stats.successNodes/stats.totalNodes)*100) + "%\n";
        summary += "Errors: " + stats.errorNodes + "\n";
        summary += "Max Depth: " + stats.maxDepth + "\n";
        summary += "Avg Depth: " + stats.avgDepth + "\n\n";
        
        summary += "Top-Level Structure:\n";
        summary += "===================\n";
        
        // Add top-level nodes summary
        if (treeResults.children && treeResults.children.length > 0) {
            for (var i = 0; i < treeResults.children.length; i++) {
                var child = treeResults.children[i];
                summary += "• " + child.name + " [" + child.status + "]";
                if (child.children && child.children.length > 0) {
                    summary += " (" + child.children.length + " children)";
                }
                summary += "\n";
            }
        }
        
        // Create temporary file for clipboard access
        var tempFile = File(Folder.temp + "/indesign_query_summary.txt");
        tempFile.open("w");
        tempFile.write(summary);
        tempFile.close();
        
        alert("Summary prepared for copying.\nFile location: " + tempFile.fsName + "\n\nOpen this file and copy its contents to your clipboard.");
        tempFile.execute();
        
    } catch (e) {
        alert("Copy summary failed: " + e.message);
    }
}

// JSON EXPORT UTILITIES - Enhanced structured data export
function createJSONExportEnhanced(treeResults) {
    var exportData = {
        metadata: {
            version: QUERY_CONFIG.version,
            timestamp: new Date().toISOString ? new Date().toISOString() : new Date().toString(),
            document: QUERY_CONFIG.paths.documentPath || "unknown",
            configuration: {
                maxDepth: QUERY_CONFIG.traversal.maxDepth,
                sampleLimit: QUERY_CONFIG.traversal.sampleLimit,
                timeoutMs: QUERY_CONFIG.traversal.timeoutMs,
                showEmpty: QUERY_CONFIG.traversal.showEmpty,
                showUndefined: QUERY_CONFIG.traversal.showUndefined,
                emergencyBailouts: QUERY_CONFIG.traversal.emergencyBailouts,
                pathTracking: QUERY_CONFIG.traversal.pathTracking
            },
            enabledTargets: getEnabledTargets(),
            statistics: getTreeStatistics(treeResults),
            safetyMetrics: {
                runtimeErrors: QUERY_CONFIG.runtime.errorCount,
                successCount: QUERY_CONFIG.runtime.successCount
            }
        },
        tree: convertTreeToJSONEnhanced(treeResults)
    };
    
    return exportData;
}

function convertTreeToJSONEnhanced(node) {
    if (!node) return undefined;
    
    var jsonNode = {
        name: node.name,
        type: node.type,
        status: node.status,
        path: node.path
    };
    
    // Enhanced value handling
    if (node.value !== undefined && String(node.value).length > 0 && node.value !== node.name) {
        jsonNode.value = node.value;
    }
    
    // Add metadata
    if (node.timestamp) {
        jsonNode.timestamp = node.timestamp;
    }
    
    if (node.depth !== undefined) {
        jsonNode.depth = node.depth;
    }
    
    // Enhanced children processing
    if (node.children && node.children.length > 0) {
        jsonNode.children = [];
        jsonNode.childCount = node.children.length;
        
        for (var i = 0; i < node.children.length; i++) {
            var childJSON = convertTreeToJSONEnhanced(node.children[i]);
            if (childJSON) {
                jsonNode.children.push(childJSON);
            }
        }
    }
    
    return jsonNode;
}

// UTILITY FUNCTIONS
function padNumber(number) {
    return number < 10 ? "0" + number.toString() : number.toString();
}

function createResultsSummaryEnhanced(treeResults) {
    if (!treeResults) return "No results available";
    
    var stats = getTreeStatistics(treeResults);
    var summary = "ENHANCED ANALYSIS SUMMARY\n";
    summary += "========================\n\n";
    summary += "Total Nodes Analyzed: " + stats.totalNodes + "\n";
    summary += "Successful Accesses: " + stats.successNodes + "\n";
    summary += "Errors Encountered: " + stats.errorNodes + "\n";
    summary += "Undefined Values: " + stats.undefinedNodes + "\n";
    summary += "Empty Values: " + stats.emptyNodes + "\n";
    summary += "Timeouts Occurred: " + stats.timeoutNodes + "\n";
    summary += "Truncated Nodes: " + stats.truncatedNodes + "\n";
    summary += "Maximum Depth: " + stats.maxDepth + "\n";
    summary += "Average Depth: " + stats.avgDepth + "\n\n";
    
    var successRate = stats.totalNodes > 0 ? 
        Math.round((stats.successNodes / stats.totalNodes) * 100) : 0;
    
    summary += "Success Rate: " + successRate + "%\n";
    summary += "Analysis Quality: " + (successRate > 80 ? "Excellent" : 
                                       successRate > 60 ? "Good" : 
                                       successRate > 40 ? "Fair" : "Poor") + "\n\n";
    
    summary += "Safety Status: " + (stats.timeoutNodes === 0 ? "No timeouts" : 
                                    stats.timeoutNodes + " timeouts occurred") + "\n";
    
    return summary;
}

$.writeln("Module 4.0: Enhanced Export & Results Display loaded");