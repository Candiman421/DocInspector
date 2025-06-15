// ============================================================================
// MODULE 2.0: DOCUMENT ANALYSIS CORE (UPDATED)
// InDesign Document Query Tool v3.1 - Enhanced Analysis Engine
// ES3 Compatible - DOM Tree Generation with Best Practice Safety
// ============================================================================

// MAIN ANALYSIS FUNCTION - Entry point for document querying
function analyzeDocumentToTree(doc) {
    if (!doc) {
        updateProgress("analysis", "document", "No document provided", "error");
        return createErrorNode("Document", "No document provided", "analysis.error");
    }
    
    // Validate environment first
    if (!validateEnvironment()) {
        updateProgress("analysis", "environment", "Environment validation failed", "error");
        return createErrorNode("Document", "Environment not ready", "analysis.environment");
    }
    
    // Reset and prepare
    resetProgress();
    QUERY_CONFIG.runtime.analysisActive = true;
    QUERY_CONFIG.runtime.startTime = new Date().getTime();
    QUERY_CONFIG.runtime.results = {};
    
    var enabledTargets = getEnabledTargets();
    QUERY_CONFIG.progress.totalTargets = enabledTargets.length;
    
    updateProgress("analysis", "document", "Starting analysis of " + enabledTargets.length + " targets", "working");
    
    // Create root tree node with enhanced info
    var documentTree = createTreeNode(
        "Document",
        "InDesign Document Analysis",
        "document",
        "success",
        "doc",
        []
    );
    
    // Add document metadata
    var metaNode = createDocumentMetadata(doc);
    if (metaNode) {
        documentTree.children.push(metaNode);
    }
    
    // Process each enabled target with enhanced error handling
    for (var i = 0; i < enabledTargets.length; i++) {
        var targetName = enabledTargets[i];
        
        updateProgress("analysis", targetName, "Analyzing target " + (i + 1) + " of " + enabledTargets.length, "working");
        
        try {
            // Check for emergency bailout
            if (QUERY_CONFIG.traversal.emergencyBailouts) {
                var elapsedTime = new Date().getTime() - QUERY_CONFIG.runtime.startTime;
                if (elapsedTime > (QUERY_CONFIG.traversal.timeoutMs * 2)) {
                    updateProgress("analysis", targetName, "Emergency bailout triggered", "timeout");
                    var bailoutNode = createTreeNode(
                        "EmergencyBailout",
                        "Analysis stopped due to timeout protection",
                        "bailout",
                        "timeout",
                        "analysis.bailout",
                        []
                    );
                    documentTree.children.push(bailoutNode);
                    break;
                }
            }
            
            var targetNode = analyzeTarget(doc, targetName);
            if (targetNode) {
                documentTree.children.push(targetNode);
                updateProgress("analysis", targetName, "Target completed successfully", "success");
            } else {
                updateProgress("analysis", targetName, "Target returned no data", "empty");
            }
            
            QUERY_CONFIG.progress.completedTargets++;
            
        } catch (exc) {
            updateProgress("analysis", targetName, "Target failed: " + exc.message, "error");
            
            // Add error node with detailed info
            var errorNode = createTreeNode(
                targetName,
                "ERROR: " + exc.message,
                "error",
                "error",
                "doc." + targetName,
                []
            );
            
            // Add error details as child nodes
            if (exc.line) {
                var lineNode = createTreeNode("errorLine", "Line: " + exc.line, "errorDetail", "error", "error.line", []);
                errorNode.children.push(lineNode);
            }
            
            documentTree.children.push(errorNode);
        }
        
        // Memory cleanup check
        if (i % 3 === 0) {
            performMemoryCleanup();
        }
    }
    
    // Finalize analysis
    var totalTime = new Date().getTime() - QUERY_CONFIG.runtime.startTime;
    var successRate = QUERY_CONFIG.runtime.successCount / (QUERY_CONFIG.runtime.successCount + QUERY_CONFIG.runtime.errorCount) * 100;
    
    updateProgress("analysis", "complete", "Analysis completed in " + totalTime + "ms (Success: " + Math.round(successRate) + "%)", "success");
    
    // Add analysis summary
    var summaryNode = createAnalysisSummary(totalTime, successRate);
    documentTree.children.push(summaryNode);
    
    QUERY_CONFIG.runtime.analysisActive = false;
    return documentTree;
}

// DOCUMENT METADATA CREATION - Enhanced document info
function createDocumentMetadata(doc) {
    try {
        updateProgress("metadata", "doc.metadata", "Extracting document metadata", "working");
        
        var metaNode = createTreeNode(
            "DocumentMetadata",
            "Core document information",
            "metadata",
            "success",
            "doc.metadata",
            []
        );
        
        // Essential metadata properties
        var metaProps = [
            { name: "name", safe: true, description: "Document name" },
            { name: "saved", safe: true, description: "Save status" },
            { name: "modified", safe: true, description: "Modification status" },
            { name: "visible", safe: true, description: "Visibility status" },
            { name: "id", safe: true, description: "Document ID" }
        ];
        
        for (var i = 0; i < metaProps.length; i++) {
            var prop = metaProps[i];
            var propPath = "doc.metadata." + prop.name;
            
            var propResult = emergencyGetProperty(doc, prop.name, "unavailable");
            
            var propNode = createTreeNode(
                prop.name,
                propResult.description || String(propResult.value),
                propResult.type,
                propResult.status,
                propPath,
                []
            );
            
            metaNode.children.push(propNode);
        }
        
        updateProgress("metadata", "doc.metadata", "Metadata extraction completed", "success");
        return metaNode;
        
    } catch (exc) {
        updateProgress("metadata", "doc.metadata", "Metadata extraction failed: " + exc.message, "error");
        return createErrorNode("DocumentMetadata", "Failed to extract metadata: " + exc.message, "doc.metadata.error");
    }
}

// TARGET ANALYSIS - Enhanced target handling with safety
function analyzeTarget(doc, targetName) {
    var startTime = new Date().getTime();
    var targetPath = "doc." + targetName;
    
    updateProgress(targetName, targetPath, "starting target analysis", "working");
    
    // Enhanced target routing with safety checks
    switch (targetName) {
        case "documentProperties":
            return analyzeDocumentProperties(doc);
        case "pages":
        case "textFrames":
        case "stories":
        case "layers":
        case "images":
        case "links":
        case "pageItems":
        case "styles":
        case "colors":
        case "fonts":
        case "masterPages":
            return analyzeCollectionSafely(doc, targetName);
        default:
            updateProgress(targetName, targetPath, "Unknown target type: " + targetName, "error");
            return createErrorNode(targetName, "Unknown target type", targetPath);
    }
}

// ENHANCED DOCUMENT PROPERTIES ANALYSIS
function analyzeDocumentProperties(doc) {
    var startTime = new Date().getTime();
    var docPath = "doc.properties";
    
    updateProgress("documentProperties", docPath, "analyzing document properties", "working");
    
    var propertiesNode = createTreeNode(
        "DocumentProperties",
        "Core document information",
        "properties",
        "success",
        docPath,
        []
    );
    
    // Essential properties with safety classification
    var essentialProps = [
        { name: "name", safe: true, description: "Document name" },
        { name: "saved", safe: true, description: "Save status" },
        { name: "modified", safe: true, description: "Modification flag" },
        { name: "visible", safe: true, description: "Visibility state" },
        { name: "id", safe: true, description: "Unique document ID" },
        { name: "filePath", safe: false, description: "File system path" },
        { name: "readonly", safe: false, description: "Read-only status" }
    ];
    
    var safeProps = [];
    var riskyProps = [];
    
    // Separate safe and risky properties
    for (var i = 0; i < essentialProps.length; i++) {
        if (essentialProps[i].safe) {
            safeProps.push(essentialProps[i]);
        } else {
            riskyProps.push(essentialProps[i]);
        }
    }
    
    // Process safe properties first
    for (var i = 0; i < safeProps.length; i++) {
        var prop = safeProps[i];
        var propPath = docPath + "." + prop.name;
        
        var propResult = emergencyGetProperty(doc, prop.name, "unavailable");
        
        var propNode = createTreeNode(
            prop.name,
            propResult.description || String(propResult.value),
            propResult.type,
            propResult.status,
            propPath,
            []
        );
        
        propertiesNode.children.push(propNode);
    }
    
    // Process risky properties with extra safety
    if (QUERY_CONFIG.traversal.maxDepth > 2) {
        for (var i = 0; i < riskyProps.length; i++) {
            var prop = riskyProps[i];
            var propPath = docPath + "." + prop.name;
            
            try {
                var propResult = emergencyGetProperty(doc, prop.name, "unavailable");
                
                var propNode = createTreeNode(
                    prop.name + " (risky)",
                    propResult.description || String(propResult.value),
                    propResult.type,
                    propResult.status,
                    propPath,
                    []
                );
                
                propertiesNode.children.push(propNode);
                
            } catch (exc) {
                var errorNode = createTreeNode(
                    prop.name + " (failed)",
                    "Error: " + exc.message,
                    "error",
                    "error",
                    propPath,
                    []
                );
                propertiesNode.children.push(errorNode);
            }
        }
    }
    
    var duration = new Date().getTime() - startTime;
    updateProgress("documentProperties", docPath, "properties analyzed (" + duration + "ms)", "success");
    
    return propertiesNode;
}

// ENHANCED COLLECTION ANALYSIS - Improved safety and progress tracking
function analyzeCollectionSafely(doc, collectionName) {
    var startTime = new Date().getTime();
    var collectionPath = "doc." + collectionName;
    
    updateProgress(collectionName, collectionPath, "accessing collection", "working");
    
    try {
        // Get collection with emergency safety
        var collection = emergencyGetProperty(doc, collectionName, undefined).value;
        
        if (!collection) {
            updateProgress(collectionName, collectionPath, "collection not found or unavailable", "empty");
            return createTreeNode(
                collectionName,
                "Collection not available",
                "collection",
                "empty",
                collectionPath,
                []
            );
        }
        
        // Get collection length safely
        var lengthResult = emergencyGetLength(collection, QUERY_CONFIG.safety.emergencyTimeoutMs);
        var length = lengthResult.length;
        
        if (lengthResult.status === "error" || lengthResult.status === "emergency_timeout") {
            updateProgress(collectionName, collectionPath, "length access failed: " + lengthResult.status, "error");
            return createErrorNode(collectionName, "Failed to get collection length", collectionPath);
        }
        
        updateProgress(collectionName, collectionPath, "found " + length + " items", "working");
        
        // Create collection node
        var collectionNode = createTreeNode(
            collectionName,
            length + " items",
            "collection",
            "success",
            collectionPath,
            []
        );
        
        // Apply sample limit for performance
        var sampleLimit = Math.min(length, QUERY_CONFIG.traversal.sampleLimit);
        
        // Process collection items with enhanced safety
        for (var i = 0; i < sampleLimit; i++) {
            var itemPath = collectionPath + "[" + i + "]";
            
            updateProgress(collectionName, itemPath, "analyzing item " + (i + 1) + " of " + sampleLimit, "working");
            
            try {
                // Emergency timeout check
                var itemStartTime = new Date().getTime();
                if (itemStartTime - startTime > QUERY_CONFIG.traversal.timeoutMs) {
                    updateProgress(collectionName, itemPath, "collection timeout reached", "timeout");
                    break;
                }
                
                var item = emergencyGetProperty(collection, i, undefined).value;
                
                if (item) {
                    var itemNode = analyzeCollectionItemSafely(item, i, itemPath, collectionName);
                    if (itemNode) {
                        collectionNode.children.push(itemNode);
                    }
                } else {
                    var emptyItemNode = createTreeNode(
                        "[" + i + "]",
                        "Item not accessible",
                        "item",
                        "empty",
                        itemPath,
                        []
                    );
                    collectionNode.children.push(emptyItemNode);
                }
                
            } catch (itemExc) {
                updateProgress(collectionName, itemPath, "item analysis failed: " + itemExc.message, "error");
                
                var itemErrorNode = createTreeNode(
                    "[" + i + "] ERROR",
                    itemExc.message,
                    "error",
                    "error",
                    itemPath,
                    []
                );
                collectionNode.children.push(itemErrorNode);
            }
        }
        
        // Add truncation notice if needed
        if (length > sampleLimit) {
            var truncateNode = createTreeNode(
                "...",
                "+" + (length - sampleLimit) + " more items (increase sample limit to see more)",
                "truncated",
                "truncated",
                collectionPath + ".truncated",
                []
            );
            collectionNode.children.push(truncateNode);
        }
        
        var duration = new Date().getTime() - startTime;
        updateProgress(collectionName, collectionPath, "collection analyzed (" + duration + "ms)", "success");
        
        return collectionNode;
        
    } catch (exc) {
        updateProgress(collectionName, collectionPath, "collection analysis failed: " + exc.message, "error");
        return createErrorNode(collectionName, "Collection analysis failed: " + exc.message, collectionPath);
    }
}

// ANALYSIS SUMMARY CREATION - Performance and success metrics
function createAnalysisSummary(totalTime, successRate) {
    var summaryNode = createTreeNode(
        "AnalysisSummary",
        "Performance and success metrics",
        "summary",
        "success",
        "analysis.summary",
        []
    );
    
    // Add performance metrics
    var timeNode = createTreeNode("totalTime", totalTime + "ms", "metric", "success", "summary.time", []);
    var successNode = createTreeNode("successRate", Math.round(successRate) + "%", "metric", "success", "summary.success", []);
    var errorNode = createTreeNode("errorCount", String(QUERY_CONFIG.runtime.errorCount), "metric", "success", "summary.errors", []);
    var memoryNode = createTreeNode("memoryCleanups", "Performed", "metric", "success", "summary.memory", []);
    
    summaryNode.children.push(timeNode);
    summaryNode.children.push(successNode);
    summaryNode.children.push(errorNode);
    summaryNode.children.push(memoryNode);
    
    return summaryNode;
}

$.writeln("Module 2.0A: Enhanced Document Analysis Core loaded");