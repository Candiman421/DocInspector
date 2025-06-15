// ============================================================================
// MODULE 2.0: DOCUMENT ANALYSIS & TREE BUILDER
// InDesign Document Query Tool v3.0 - Configurable Analysis
// ES3 Compatible - DOM Tree Generation with Progress Tracking
// ============================================================================

// MAIN ANALYSIS FUNCTION - Entry point for document querying
function analyzeDocumentToTree(doc) {
    if (!doc) {
        updateProgress("analysis", "document", "No document provided", "error");
        return null;
    }
    
    // Reset and prepare
    resetProgress();
    QUERY_CONFIG.runtime.analysisActive = true;
    QUERY_CONFIG.runtime.startTime = new Date().getTime();
    QUERY_CONFIG.runtime.results = {};
    
    var enabledTargets = getEnabledTargets();
    QUERY_CONFIG.progress.totalTargets = enabledTargets.length;
    
    updateProgress("analysis", "document", "Starting analysis of " + enabledTargets.length + " targets", "working");
    
    // Create root tree node
    var documentTree = createTreeNode(
        "Document",
        "InDesign Document",
        "document",
        "success",
        "doc",
        []
    );
    
    // Process each enabled target
    for (var i = 0; i < enabledTargets.length; i++) {
        var targetName = enabledTargets[i];
        
        updateProgress("analysis", targetName, "Analyzing target " + (i + 1) + " of " + enabledTargets.length, "working");
        
        try {
            var targetNode = analyzeTarget(doc, targetName);
            if (targetNode) {
                documentTree.children.push(targetNode);
            }
            
            QUERY_CONFIG.progress.completedTargets++;
            updateProgress("analysis", targetName, "Target completed", "success");
            
        } catch (exc) {
            updateProgress("analysis", targetName, "Target failed: " + exc.message, "error");
            
            // Add error node
            var errorNode = createTreeNode(
                targetName,
                "ERROR: " + exc.message,
                "error",
                "error",
                "doc." + targetName,
                []
            );
            documentTree.children.push(errorNode);
        }
    }
    
    // Finalize
    var totalTime = new Date().getTime() - QUERY_CONFIG.runtime.startTime;
    updateProgress("analysis", "complete", "Analysis completed in " + totalTime + "ms", "success");
    
    QUERY_CONFIG.runtime.analysisActive = false;
    return documentTree;
}

// TARGET ANALYSIS - Handle different types of document elements
function analyzeTarget(doc, targetName) {
    var startTime = new Date().getTime();
    var targetPath = "doc." + targetName;
    
    updateProgress(targetName, targetPath, "starting target analysis", "working");
    
    // Special handling for different target types
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
            return analyzeCollection(doc, targetName);
        default:
            updateProgress(targetName, targetPath, "Unknown target type", "error");
            return null;
    }
}

// DOCUMENT PROPERTIES ANALYSIS - Extract core document info
function analyzeDocumentProperties(doc) {
    var startTime = new Date().getTime();
    var docPath = "doc.properties";
    
    updateProgress("documentProperties", docPath, "analyzing document properties", "working");
    
    var propertiesNode = createTreeNode(
        "Document Properties",
        "Core document information",
        "properties",
        "success",
        docPath,
        []
    );
    
    // Essential properties to check
    var essentialProps = [
        { name: "name", safe: true },
        { name: "saved", safe: true },
        { name: "modified", safe: true },
        { name: "visible", safe: true },
        { name: "id", safe: true },
        { name: "filePath", safe: false },
        { name: "readonly", safe: false }
    ];
    
    for (var i = 0; i < essentialProps.length; i++) {
        var prop = essentialProps[i];
        var propPath = docPath + "." + prop.name;
        
        // Skip unsafe properties if emergency bailouts enabled
        if (!prop.safe && QUERY_CONFIG.traversal.emergencyBailouts) {
            var skipNode = createTreeNode(
                prop.name,
                "SKIPPED (unsafe)",
                "skipped",
                "skipped",
                propPath,
                []
            );
            propertiesNode.children.push(skipNode);
            continue;
        }
        
        var propResult = queryGetProperty(doc, prop.name, null);
        var propNode = createTreeNode(
            prop.name,
            propResult.description || propResult.value,
            propResult.type,
            propResult.status,
            propPath,
            []
        );
        
        propertiesNode.children.push(propNode);
    }
    
    var duration = new Date().getTime() - startTime;
    updateProgress("documentProperties", docPath, "properties analyzed (" + duration + "ms)", "success");
    
    return propertiesNode;
}

// COLLECTION ANALYSIS - Handle InDesign collections with safety
function analyzeCollection(doc, collectionName) {
    var startTime = new Date().getTime();
    var collectionPath = "doc." + collectionName;
    
    updateProgress(collectionName, collectionPath, "accessing collection", "working");
    
    var collectionResult = queryGetCollection(doc, collectionName);
    
    if (collectionResult.status !== "success") {
        // Return error/disabled/timeout node
        return createTreeNode(
            collectionName,
            collectionResult.reason || "Collection inaccessible",
            "collection",
            collectionResult.status,
            collectionPath,
            []
        );
    }
    
    var collection = collectionResult.collection;
    var length = collectionResult.length;
    
    // Create collection node
    var collectionNode = createTreeNode(
        collectionName,
        "Collection[" + length + "]",
        "collection",
        "success",
        collectionPath,
        []
    );
    
    if (length === 0) {
        var emptyNode = createTreeNode(
            "empty",
            "No items in collection",
            "empty",
            "empty",
            collectionPath + ".empty",
            []
        );
        collectionNode.children.push(emptyNode);
        return collectionNode;
    }
    
    // Sample items from collection
    var sampleLimit = Math.min(length, QUERY_CONFIG.traversal.sampleLimit);
    var itemTimeout = QUERY_CONFIG.targets[collectionName].timeout / sampleLimit;
    
    updateProgress(collectionName, collectionPath, "sampling " + sampleLimit + " items", "working");
    
    for (var i = 0; i < sampleLimit; i++) {
        var itemPath = collectionPath + "[" + i + "]";
        
        try {
            updateProgress(collectionName, itemPath, "processing item " + (i + 1), "working");
            
            var itemResult = queryEmergencyBailout(function() {
                try {
                    return collection[i];
                } catch (e1) {
                    if (collection.item) {
                        return collection.item(i);
                    }
                    throw e1;
                }
            }, itemTimeout, "collection[" + i + "]");
            
            if (itemResult.bailout) {
                var bailoutNode = createTreeNode(
                    "[" + i + "]",
                    "TIMEOUT/ERROR",
                    "error",
                    "timeout",
                    itemPath,
                    []
                );
                collectionNode.children.push(bailoutNode);
                continue;
            }
            
            var item = itemResult.result;
            if (!item) {
                var nullNode = createTreeNode(
                    "[" + i + "]",
                    "null item",
                    "null",
                    "null",
                    itemPath,
                    []
                );
                collectionNode.children.push(nullNode);
                continue;
            }
            
            // Analyze the item
            var itemNode = analyzeCollectionItem(item, i, itemPath, collectionName);
            collectionNode.children.push(itemNode);
            
        } catch (exc) {
            var errorNode = createTreeNode(
                "[" + i + "]",
                "ERROR: " + exc.message,
                "error",
                "error",
                itemPath,
                []
            );
            collectionNode.children.push(errorNode);
        }
    }
    
    // Add truncation note if we didn't process all items
    if (sampleLimit < length) {
        var truncateNode = createTreeNode(
            "...",
            "+" + (length - sampleLimit) + " more items (use higher sample limit)",
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
}

// COLLECTION ITEM ANALYSIS - Analyze individual items in collections
function analyzeCollectionItem(item, index, itemPath, collectionType) {
    var itemName = "[" + index + "]";
    
    // Get item type/constructor name
    var itemType = "unknown";
    try {
        if (item.constructor && item.constructor.name) {
            itemType = item.constructor.name;
        }
    } catch (e) {
        itemType = "unknown";
    }
    
    // Create item node
    var itemNode = createTreeNode(
        itemName,
        itemType,
        "item",
        "success",
        itemPath,
        []
    );
    
    // Stop here if we've reached max depth
    if (itemNode.depth >= QUERY_CONFIG.traversal.maxDepth) {
        var depthNode = createTreeNode(
            "...",
            "Max depth reached",
            "depth_limit",
            "truncated",
            itemPath + ".depth_limit",
            []
        );
        itemNode.children.push(depthNode);
        return itemNode;
    }
    
    // Get key properties based on collection type
    var keyProperties = getKeyPropertiesForCollection(collectionType);
    
    for (var i = 0; i < keyProperties.length; i++) {
        var propName = keyProperties[i];
        var propPath = itemPath + "." + propName;
        
        var propResult = queryGetProperty(item, propName, null);
        
        // Skip null/empty if not configured to show them
        if (propResult.status === "null" && !QUERY_CONFIG.traversal.showNull) continue;
        if (propResult.status === "empty" && !QUERY_CONFIG.traversal.showEmpty) continue;
        
        var propNode = createTreeNode(
            propName,
            propResult.description || String(propResult.value),
            propResult.type,
            propResult.status,
            propPath,
            []
        );
        
        itemNode.children.push(propNode);
    }
    
    return itemNode;
}

// KEY PROPERTIES - Define important properties per collection type
function getKeyPropertiesForCollection(collectionType) {
    var propertyMap = {
        pages: ["name", "bounds", "side", "documentOffset"],
        textFrames: ["id", "bounds", "overflows", "contents"],
        stories: ["id", "length", "overflows"],
        layers: ["name", "visible", "locked", "layerColor"],
        images: ["id", "bounds", "actualPpi", "effectivePpi"],
        links: ["name", "status", "filePath", "size"],
        pageItems: ["id", "bounds", "visible", "locked"],
        styles: ["name", "basedOn"],
        colors: ["name", "model", "colorValue"],
        fonts: ["name", "fontFamily", "status"],
        masterPages: ["name", "bounds"]
    };
    
    return propertyMap[collectionType] || ["name", "id"];
}

// TREE TRAVERSAL UTILITIES - Helper functions for tree manipulation
function countTreeNodes(treeNode) {
    if (!treeNode) return 0;
    
    var count = 1; // Count this node
    
    if (treeNode.children && treeNode.children.length > 0) {
        for (var i = 0; i < treeNode.children.length; i++) {
            count += countTreeNodes(treeNode.children[i]);
        }
    }
    
    return count;
}

function findNodeByPath(treeNode, targetPath) {
    if (!treeNode || !targetPath) return null;
    
    if (treeNode.path === targetPath) {
        return treeNode;
    }
    
    if (treeNode.children && treeNode.children.length > 0) {
        for (var i = 0; i < treeNode.children.length; i++) {
            var found = findNodeByPath(treeNode.children[i], targetPath);
            if (found) return found;
        }
    }
    
    return null;
}

function getTreeStatistics(treeNode) {
    var stats = {
        totalNodes: 0,
        successNodes: 0,
        errorNodes: 0,
        nullNodes: 0,
        emptyNodes: 0,
        timeoutNodes: 0,
        maxDepth: 0
    };
    
    function traverseForStats(node, depth) {
        stats.totalNodes++;
        stats.maxDepth = Math.max(stats.maxDepth, depth);
        
        switch (node.status) {
            case "success": stats.successNodes++; break;
            case "error": stats.errorNodes++; break;
            case "null": stats.nullNodes++; break;
            case "empty": stats.emptyNodes++; break;
            case "timeout": stats.timeoutNodes++; break;
        }
        
        if (node.children && node.children.length > 0) {
            for (var i = 0; i < node.children.length; i++) {
                traverseForStats(node.children[i], depth + 1);
            }
        }
    }
    
    if (treeNode) {
        traverseForStats(treeNode, 0);
    }
    
    return stats;
}

$.writeln("Module B: Document Analysis & Tree Builder loaded");