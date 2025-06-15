// ============================================================================
// MODULE 4.0: EXPORT & RESULTS DISPLAY
// InDesign Document Query Tool v3.0 - Configurable Analysis
// ES3 Compatible - Tree Export and Results Viewer
// ============================================================================

// RESULTS DISPLAY DIALOG - Expandable tree view
function showResultsDialog(treeResults) {
    if (!treeResults) {
        alert("No results to display.");
        return;
    }
    
    var resultsDialog = new Window("dialog", "Analysis Results - DOM Tree View");
    resultsDialog.orientation = "column";
    resultsDialog.alignChildren = "fill";
    resultsDialog.preferredSize.width = 800;
    resultsDialog.preferredSize.height = 600;
    
    // Header with statistics
    var headerPanel = resultsDialog.add("panel", undefined, "Results Summary");
    headerPanel.orientation = "row";
    headerPanel.alignChildren = "center";
    
    var stats = getTreeStatistics(treeResults);
    var statsText = "Total Nodes: " + stats.totalNodes + 
                   " | Success: " + stats.successNodes + 
                   " | Errors: " + stats.errorNodes + 
                   " | Null: " + stats.nullNodes + 
                   " | Empty: " + stats.emptyNodes + 
                   " | Max Depth: " + stats.maxDepth;
    
    headerPanel.add("statictext", undefined, statsText);
    
    // Tree display area
    var treePanel = resultsDialog.add("panel", undefined, "Document Tree");
    treePanel.orientation = "column";
    treePanel.alignChildren = "fill";
    
    var treeText = treePanel.add("edittext", undefined, "", {multiline: true, readonly: true});
    treeText.alignment = "fill";
    
    // Convert tree to display format
    var treeDisplay = formatTreeForDisplay(treeResults, 0, true);
    treeText.text = treeDisplay;
    
    // Controls
    var controlsPanel = resultsDialog.add("group");
    controlsPanel.orientation = "row";
    controlsPanel.alignment = "center";
    
    var expandBtn = controlsPanel.add("button", undefined, "Expand All");
    var collapseBtn = controlsPanel.add("button", undefined, "Collapse All");
    var exportBtn = controlsPanel.add("button", undefined, "Export to File");
    var copyBtn = controlsPanel.add("button", undefined, "Copy to Clipboard");
    var closeBtn = controlsPanel.add("button", undefined, "Close");
    
    // Event handlers
    expandBtn.onClick = function() {
        var expandedDisplay = formatTreeForDisplay(treeResults, 0, true, true);
        treeText.text = expandedDisplay;
    };
    
    collapseBtn.onClick = function() {
        var collapsedDisplay = formatTreeForDisplay(treeResults, 0, false, false);
        treeText.text = collapsedDisplay;
    };
    
    exportBtn.onClick = function() {
        exportTreeToFile(treeResults);
    };
    
    copyBtn.onClick = function() {
        copyTreeToClipboard(treeResults);
    };
    
    closeBtn.onClick = function() {
        resultsDialog.close();
    };
    
    resultsDialog.show();
}

// FORMAT TREE FOR DISPLAY - Convert tree to readable text format
function formatTreeForDisplay(node, depth, showChildren, expandAll) {
    if (!node) return "";
    
    var output = "";
    var indent = "";
    
    // Create indentation
    for (var i = 0; i < depth; i++) {
        indent += "  ";
    }
    
    // Format current node
    var nodeSymbol = getDisplaySymbol(node.status);
    var nodeDisplay = indent + nodeSymbol + " " + node.name;
    
    // Add type and value info
    if (node.type && node.type !== "unknown") {
        nodeDisplay += " (" + node.type + ")";
    }
    
    if (node.value && node.value !== node.name) {
        var valueDisplay = String(node.value);
        if (valueDisplay.length > 60) {
            valueDisplay = valueDisplay.substring(0, 60) + "...";
        }
        nodeDisplay += ": " + valueDisplay;
    }
    
    // Add path for debugging
    if (QUERY_CONFIG.traversal.pathTracking && node.path) {
        nodeDisplay += " [" + node.path + "]";
    }
    
    output += nodeDisplay + "\n";
    
    // Add children if requested
    if (showChildren && node.children && node.children.length > 0) {
        var shouldShowChildren = expandAll || depth < 2; // Auto-expand first 2 levels
        
        if (shouldShowChildren) {
            for (var i = 0; i < node.children.length; i++) {
                output += formatTreeForDisplay(node.children[i], depth + 1, true, expandAll);
            }
        } else {
            output += indent + "  [...] " + node.children.length + " children (click Expand All to show)\n";
        }
    }
    
    return output;
}

function getDisplaySymbol(status) {
    var symbols = {
        success: "✓",
        error: "✗",
        timeout: "⏱",
        null: "∅",
        empty: "○",
        skipped: "⏭",
        disabled: "⏸",
        truncated: "…",
        unknown: "?"
    };
    
    return symbols[status] || "?";
}

// EXPORT TREE TO FILE - Save complete tree structure
function exportTreeToFile(treeResults) {
    if (!treeResults) {
        alert("No results to export.");
        return;
    }
    
    var outputPath = QUERY_CONFIG.paths.outputPath;
    if (!outputPath) {
        var folder = Folder.selectDialog("Select folder to save tree export");
        if (!folder) return;
        outputPath = folder.fsName;
        QUERY_CONFIG.paths.outputPath = outputPath;
    }
    
    try {
        var timestamp = new Date();
        var dateStr = timestamp.getFullYear() + 
                     pad(timestamp.getMonth() + 1) + 
                     pad(timestamp.getDate()) + "_" + 
                     pad(timestamp.getHours()) + 
                     pad(timestamp.getMinutes()) + 
                     pad(timestamp.getSeconds());
        
        var filename = "InDesign_QueryResults_" + dateStr + ".txt";
        var filepath = outputPath + "/" + filename;
        var file = File(filepath);
        
        file.open("w");
        
        // Write header
        file.writeln("InDesign Document Query Tool v3.0 - Analysis Results");
        file.writeln("Generated: " + timestamp.toString());
        file.writeln("Document: " + (QUERY_CONFIG.paths.documentPath || "Unknown"));
        file.writeln("Analysis Configuration:");
        file.writeln("  Traversal Depth: " + QUERY_CONFIG.traversal.maxDepth);
        file.writeln("  Sample Limit: " + QUERY_CONFIG.traversal.sampleLimit);
        file.writeln("  Timeout: " + QUERY_CONFIG.traversal.timeoutMs + "ms");
        file.writeln("  Show Empty: " + QUERY_CONFIG.traversal.showEmpty);
        file.writeln("  Show Null: " + QUERY_CONFIG.traversal.showNull);
        file.writeln("  Emergency Bailouts: " + QUERY_CONFIG.traversal.emergencyBailouts);
        
        // Write enabled targets
        file.writeln("Enabled Targets:");
        var enabledTargets = getEnabledTargets();
        for (var i = 0; i < enabledTargets.length; i++) {
            file.writeln("  - " + enabledTargets[i]);
        }
        file.writeln("");
        
        // Write statistics
        var stats = getTreeStatistics(treeResults);
        file.writeln("ANALYSIS STATISTICS:");
        file.writeln("  Total Nodes: " + stats.totalNodes);
        file.writeln("  Success Nodes: " + stats.successNodes);
        file.writeln("  Error Nodes: " + stats.errorNodes);
        file.writeln("  Null Nodes: " + stats.nullNodes);
        file.writeln("  Empty Nodes: " + stats.emptyNodes);
        file.writeln("  Timeout Nodes: " + stats.timeoutNodes);
        file.writeln("  Maximum Depth Reached: " + stats.maxDepth);
        file.writeln("");
        
        // Write tree structure
        file.writeln("DOCUMENT TREE STRUCTURE:");
        file.writeln("========================");
        file.writeln("");
        
        var treeText = formatTreeForExport(treeResults, 0);
        file.write(treeText);
        
        // Write JSON export
        file.writeln("");
        file.writeln("JSON EXPORT (for programmatic use):");
        file.writeln("===================================");
        try {
            var jsonExport = createJSONExport(treeResults);
            file.write(JSON.stringify(jsonExport, null, 2));
        } catch (jsonError) {
            file.writeln("JSON export failed: " + jsonError.message);
        }
        
        file.close();
        
        alert("Results exported successfully to:\n" + filepath);
        
    } catch (e) {
        alert("Export failed: " + e.message);
    }
}

// FORMAT TREE FOR EXPORT - Complete tree with all details
function formatTreeForExport(node, depth) {
    if (!node) return "";
    
    var output = "";
    var indent = "";
    
    // Create indentation
    for (var i = 0; i < depth; i++) {
        indent += "  ";
    }
    
    // Format node with complete information
    output += indent + "├─ " + node.name + "\n";
    output += indent + "│  Type: " + (node.type || "unknown") + "\n";
    output += indent + "│  Status: " + (node.status || "unknown") + "\n";
    
    if (node.value !== undefined && node.value !== null) {
        var valueStr = String(node.value);
        if (valueStr.length > 200) {
            valueStr = valueStr.substring(0, 200) + "... [truncated]";
        }
        output += indent + "│  Value: " + valueStr + "\n";
    }
    
    if (node.path) {
        output += indent + "│  Path: " + node.path + "\n";
    }
    
    output += indent + "│\n";
    
    // Add children
    if (node.children && node.children.length > 0) {
        for (var i = 0; i < node.children.length; i++) {
            output += formatTreeForExport(node.children[i], depth + 1);
        }
    }
    
    return output;
}

// CREATE JSON EXPORT - Structured data for programmatic use
function createJSONExport(treeResults) {
    var export_data = {
        metadata: {
            version: QUERY_CONFIG.version,
            timestamp: new Date().toISOString ? new Date().toISOString() : new Date().toString(),
            document: QUERY_CONFIG.paths.documentPath || "unknown",
            configuration: {
                maxDepth: QUERY_CONFIG.traversal.maxDepth,
                sampleLimit: QUERY_CONFIG.traversal.sampleLimit,
                timeoutMs: QUERY_CONFIG.traversal.timeoutMs,
                showEmpty: QUERY_CONFIG.traversal.showEmpty,
                showNull: QUERY_CONFIG.traversal.showNull,
                emergencyBailouts: QUERY_CONFIG.traversal.emergencyBailouts
            },
            enabledTargets: getEnabledTargets(),
            statistics: getTreeStatistics(treeResults)
        },
        tree: convertTreeToJSON(treeResults)
    };
    
    return export_data;
}

function convertTreeToJSON(node) {
    if (!node) return null;
    
    var jsonNode = {
        name: node.name,
        type: node.type,
        status: node.status,
        path: node.path
    };
    
    // Only include value if it's meaningful
    if (node.value !== undefined && node.value !== null && node.value !== node.name) {
        jsonNode.value = node.value;
    }
    
    // Include children if present
    if (node.children && node.children.length > 0) {
        jsonNode.children = [];
        for (var i = 0; i < node.children.length; i++) {
            var childJSON = convertTreeToJSON(node.children[i]);
            if (childJSON) {
                jsonNode.children.push(childJSON);
            }
        }
    }
    
    return jsonNode;
}

// COPY TO CLIPBOARD - Simple text copy
function copyTreeToClipboard(treeResults) {
    if (!treeResults) {
        alert("No results to copy.");
        return;
    }
    
    try {
        var treeText = formatTreeForDisplay(treeResults, 0, true, true);
        
        // Create temporary text file for clipboard
        var tempFile = File(Folder.temp + "/indesign_query_temp.txt");
        tempFile.open("w");
        tempFile.write(treeText);
        tempFile.close();
        
        alert("Tree structure has been prepared for copying.\nTemporary file created at: " + tempFile.fsName + "\n\nOpen this file and copy its contents to your clipboard.");
        
        // Try to open the file
        tempFile.execute();
        
    } catch (e) {
        alert("Copy to clipboard failed: " + e.message);
    }
}

// COMPARISON UTILITIES - For comparing two tree results
function compareTreeResults(tree1, tree2) {
    var comparison = {
        timestamp: new Date().toString(),
        tree1Stats: getTreeStatistics(tree1),
        tree2Stats: getTreeStatistics(tree2),
        differences: [],
        summary: {
            nodeCountChanged: false,
            structureChanged: false,
            valuesChanged: false
        }
    };
    
    // Basic statistical comparison
    if (comparison.tree1Stats.totalNodes !== comparison.tree2Stats.totalNodes) {
        comparison.summary.nodeCountChanged = true;
        comparison.differences.push({
            type: "node_count_change",
            from: comparison.tree1Stats.totalNodes,
            to: comparison.tree2Stats.totalNodes
        });
    }
    
    // Deep comparison would go here
    // For now, just provide structure for future implementation
    comparison.differences.push({
        type: "info",
        message: "Deep tree comparison not yet implemented. Use manual comparison of exported files."
    });
    
    return comparison;
}

// UTILITY FUNCTIONS
function pad(number) {
    return number < 10 ? "0" + number : number.toString();
}

function createResultsSummary(treeResults) {
    if (!treeResults) return "No results available";
    
    var stats = getTreeStatistics(treeResults);
    var summary = "ANALYSIS SUMMARY\n";
    summary += "================\n\n";
    summary += "Total Nodes Analyzed: " + stats.totalNodes + "\n";
    summary += "Successful Accesses: " + stats.successNodes + "\n";
    summary += "Errors Encountered: " + stats.errorNodes + "\n";
    summary += "Null Values Found: " + stats.nullNodes + "\n";
    summary += "Empty Values Found: " + stats.emptyNodes + "\n";
    summary += "Timeouts Occurred: " + stats.timeoutNodes + "\n";
    summary += "Maximum Depth Reached: " + stats.maxDepth + "\n\n";
    
    var successRate = stats.totalNodes > 0 ? Math.round((stats.successNodes / stats.totalNodes) * 100) : 0;
    summary += "Success Rate: " + successRate + "%\n\n";
    
    // Analysis recommendations
    summary += "RECOMMENDATIONS:\n";
    if (stats.errorNodes > stats.successNodes) {
        summary += "• High error rate detected - consider using emergency bailouts\n";
        summary += "• Try reducing traversal depth or sample limits\n";
    } else if (stats.timeoutNodes > 5) {
        summary += "• Multiple timeouts detected - consider increasing timeout values\n";
        summary += "• Some collections may be slow - disable risky collections\n";
    } else if (successRate > 90) {
        summary += "• Excellent success rate - document is healthy for analysis\n";
        summary += "• Consider enabling more targets for deeper analysis\n";
    }
    
    if (stats.maxDepth < QUERY_CONFIG.traversal.maxDepth) {
        summary += "• Analysis stopped before reaching maximum depth\n";
        summary += "• Consider increasing timeout or reducing sample size\n";
    }
    
    return summary;
}

// EXPORT CONFIGURATION - Save current settings
function exportConfiguration() {
    var configExport = {
        version: QUERY_CONFIG.version,
        timestamp: new Date().toString(),
        targets: {},
        traversal: QUERY_CONFIG.traversal
    };
    
    // Export enabled targets
    for (var target in QUERY_CONFIG.targets) {
        configExport.targets[target] = QUERY_CONFIG.targets[target].enabled;
    }
    
    try {
        var configFile = File.saveDialog("Save Query Configuration", "*.json");
        if (configFile) {
            configFile.open("w");
            configFile.write(JSON.stringify(configExport, null, 2));
            configFile.close();
            alert("Configuration saved to: " + configFile.name);
        }
    } catch (e) {
        alert("Failed to save configuration: " + e.message);
    }
}

// IMPORT CONFIGURATION - Load saved settings
function importConfiguration() {
    try {
        var configFile = File.openDialog("Load Query Configuration", "*.json");
        if (configFile) {
            configFile.open("r");
            var configData = configFile.read();
            configFile.close();
            
            var config = JSON.parse(configData);
            
            // Apply loaded configuration
            if (config.targets) {
                for (var target in config.targets) {
                    if (QUERY_CONFIG.targets[target]) {
                        QUERY_CONFIG.targets[target].enabled = config.targets[target];
                    }
                }
            }
            
            if (config.traversal) {
                QUERY_CONFIG.traversal.maxDepth = config.traversal.maxDepth || QUERY_CONFIG.traversal.maxDepth;
                QUERY_CONFIG.traversal.sampleLimit = config.traversal.sampleLimit || QUERY_CONFIG.traversal.sampleLimit;
                QUERY_CONFIG.traversal.timeoutMs = config.traversal.timeoutMs || QUERY_CONFIG.traversal.timeoutMs;
                QUERY_CONFIG.traversal.showEmpty = config.traversal.showEmpty !== undefined ? config.traversal.showEmpty : QUERY_CONFIG.traversal.showEmpty;
                QUERY_CONFIG.traversal.showNull = config.traversal.showNull !== undefined ? config.traversal.showNull : QUERY_CONFIG.traversal.showNull;
            }
            
            alert("Configuration loaded successfully!");
            return true;
        }
    } catch (e) {
        alert("Failed to load configuration: " + e.message);
    }
    
    return false;
}

$.writeln("Module D: Export & Results Display loaded");