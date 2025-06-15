// ============================================================================
// MODULE 2.1: TREE BUILDER & UTILITIES (UPDATED)
// InDesign Document Query Tool v3.1 - Enhanced Tree Construction
// ES3 Compatible - Tree Node Creation and Manipulation Utilities
// ============================================================================

// TREE NODE CREATION - Enhanced with safety and metadata
function createTreeNode(name, value, type, status, path, children) {
    return {
        name: name || "unknown",
        value: value || "",
        type: type || "unknown",
        status: status || "unknown",
        path: path || "",
        children: children || [],
        timestamp: new Date().getTime(),
        depth: calculatePathDepth(path || "")
    };
}

// ERROR NODE CREATION - Standardized error nodes
function createErrorNode(name, errorMessage, path) {
    return createTreeNode(
        name || "Error",
        errorMessage || "Unknown error occurred",
        "error",
        "error",
        path || "error.unknown",
        []
    );
}

// COLLECTION ITEM ANALYSIS - Enhanced with safety and property mapping
function analyzeCollectionItemSafely(item, index, itemPath, collectionType) {
    var itemStartTime = new Date().getTime();
    var itemName = "[" + index + "]";
    
    // Get item type safely
    var itemType = getItemTypeSafely(item);
    
    // Create item node
    var itemNode = createTreeNode(
        itemName,
        itemType,
        "item",
        "success",
        itemPath,
        []
    );
    
    // Check depth limits
    if (itemNode.depth >= QUERY_CONFIG.traversal.maxDepth) {
        var depthNode = createTreeNode(
            "maxDepthReached",
            "Analysis stopped at max depth " + QUERY_CONFIG.traversal.maxDepth,
            "depth_limit",
            "truncated",
            itemPath + ".depth_limit",
            []
        );
        itemNode.children.push(depthNode);
        return itemNode;
    }
    
    // Get key properties for this collection type
    var keyProperties = getKeyPropertiesForCollection(collectionType);
    
    // Analyze each key property with timeout protection
    for (var i = 0; i < keyProperties.length; i++) {
        var propName = keyProperties[i];
        var propPath = itemPath + "." + propName;
        
        // Check timeout for item analysis
        var currentTime = new Date().getTime();
        if (currentTime - itemStartTime > QUERY_CONFIG.safety.emergencyTimeoutMs) {
            var timeoutNode = createTreeNode(
                "itemTimeout",
                "Item analysis timed out after " + QUERY_CONFIG.safety.emergencyTimeoutMs + "ms",
                "timeout",
                "timeout",
                propPath + ".timeout",
                []
            );
            itemNode.children.push(timeoutNode);
            break;
        }
        
        try {
            var propResult = emergencyGetProperty(item, propName, "unavailable");
            
            // Skip empty/undefined values if configured
            if (propResult.status === "undefined" && !QUERY_CONFIG.traversal.showUndefined) continue;
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
            
        } catch (propExc) {
            var propErrorNode = createTreeNode(
                propName + "_error",
                "Property access failed: " + propExc.message,
                "error",
                "error",
                propPath + ".error",
                []
            );
            itemNode.children.push(propErrorNode);
        }
    }
    
    return itemNode;
}

// SAFE ITEM TYPE DETECTION
function getItemTypeSafely(item) {
    try {
        if (!item) return "undefined";
        
        // Try multiple methods to get type information
        if (item.constructor && item.constructor.name) {
            return item.constructor.name;
        }
        
        if (typeof item.typename !== "undefined") {
            return item.typename;
        }
        
        if (typeof item.toString === "function") {
            var str = item.toString();
            if (str && str.length < 100) {
                return str;
            }
        }
        
        return "object";
        
    } catch (exc) {
        return "unknown";
    }
}

// KEY PROPERTIES MAPPING - Enhanced property definitions per collection type
function getKeyPropertiesForCollection(collectionType) {
    var propertyMap = {
        pages: ["name", "bounds", "side", "documentOffset", "appliedMaster"],
        textFrames: ["id", "bounds", "overflows", "contents", "itemLayer"],
        stories: ["id", "length", "overflows", "textFrames"],
        layers: ["name", "visible", "locked", "layerColor", "ignoreWrap"],
        images: ["id", "bounds", "actualPpi", "effectivePpi", "itemLink"],
        links: ["name", "status", "filePath", "size", "linkType"],
        pageItems: ["id", "bounds", "visible", "locked", "itemLayer"],
        styles: ["name", "basedOn", "appliedFont", "pointSize"],
        colors: ["name", "model", "colorValue", "space"],
        fonts: ["name", "fontFamily", "status", "location"],
        masterPages: ["name", "bounds", "side", "pages"]
    };
    
    return propertyMap[collectionType] || ["name", "id", "toString"];
}

// TREE MANIPULATION UTILITIES
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
    if (!treeNode || !targetPath) return undefined;
    
    if (treeNode.path === targetPath) {
        return treeNode;
    }
    
    if (treeNode.children && treeNode.children.length > 0) {
        for (var i = 0; i < treeNode.children.length; i++) {
            var found = findNodeByPath(treeNode.children[i], targetPath);
            if (found) return found;
        }
    }
    
    return undefined;
}

function getTreeStatistics(treeNode) {
    var stats = {
        totalNodes: 0,
        successNodes: 0,
        errorNodes: 0,
        undefinedNodes: 0,
        emptyNodes: 0,
        timeoutNodes: 0,
        truncatedNodes: 0,
        maxDepth: 0,
        avgDepth: 0,
        pathsAnalyzed: []
    };
    
    var depthSum = 0;
    
    function traverseForStats(node, depth) {
        if (!node) return;
        
        stats.totalNodes++;
        stats.maxDepth = Math.max(stats.maxDepth, depth);
        depthSum += depth;
        
        if (node.path) {
            stats.pathsAnalyzed.push(node.path);
        }
        
        switch (node.status) {
            case "success": stats.successNodes++; break;
            case "error": stats.errorNodes++; break;
            case "undefined": stats.undefinedNodes++; break;
            case "empty": stats.emptyNodes++; break;
            case "timeout": stats.timeoutNodes++; break;
            case "truncated": stats.truncatedNodes++; break;
        }
        
        if (node.children && node.children.length > 0) {
            for (var i = 0; i < node.children.length; i++) {
                traverseForStats(node.children[i], depth + 1);
            }
        }
    }
    
    if (treeNode) {
        traverseForStats(treeNode, 0);
        stats.avgDepth = stats.totalNodes > 0 ? Math.round(depthSum / stats.totalNodes * 100) / 100 : 0;
    }
    
    return stats;
}

// PATH UTILITIES
function calculatePathDepth(path) {
    if (!path) return 0;
    
    var depth = 0;
    for (var i = 0; i < path.length; i++) {
        if (path.charAt(i) === ".") {
            depth++;
        }
    }
    return depth;
}

function getParentPath(path) {
    if (!path) return "";
    
    var lastDotIndex = -1;
    for (var i = path.length - 1; i >= 0; i--) {
        if (path.charAt(i) === ".") {
            lastDotIndex = i;
            break;
        }
    }
    
    return lastDotIndex > 0 ? path.substring(0, lastDotIndex) : "";
}

function getPathSegments(path) {
    if (!path) return [];
    
    var segments = [];
    var currentSegment = "";
    
    for (var i = 0; i < path.length; i++) {
        var char = path.charAt(i);
        if (char === ".") {
            if (currentSegment) {
                segments.push(currentSegment);
                currentSegment = "";
            }
        } else {
            currentSegment += char;
        }
    }
    
    if (currentSegment) {
        segments.push(currentSegment);
    }
    
    return segments;
}

// TREE VALIDATION AND REPAIR
function validateTreeStructure(treeNode) {
    var validation = {
        isValid: true,
        errors: [],
        warnings: [],
        nodesChecked: 0
    };
    
    function validateNode(node, path) {
        if (!node) {
            validation.errors.push("Undefined node found at path: " + path);
            validation.isValid = false;
            return;
        }
        
        validation.nodesChecked++;
        
        // Check required properties
        if (typeof node.name === "undefined") {
            validation.errors.push("Node missing name property at: " + path);
            validation.isValid = false;
        }
        
        if (typeof node.status === "undefined") {
            validation.warnings.push("Node missing status at: " + path);
        }
        
        // Check children array
        if (node.children && typeof node.children.length === "undefined") {
            validation.errors.push("Node has invalid children array at: " + path);
            validation.isValid = false;
        }
        
        // Recursively validate children
        if (node.children && node.children.length > 0) {
            for (var i = 0; i < node.children.length; i++) {
                validateNode(node.children[i], path + "." + i);
            }
        }
    }
    
    if (treeNode) {
        validateNode(treeNode, "root");
    } else {
        validation.errors.push("Root tree node is undefined");
        validation.isValid = false;
    }
    
    return validation;
}

// TREE OPTIMIZATION
function optimizeTreeStructure(treeNode) {
    if (!treeNode) return treeNode;
    
    // Remove duplicate paths
    var seenPaths = {};
    
    function removeDuplicates(node) {
        if (!node) return node;
        
        if (node.path && seenPaths[node.path]) {
            return createTreeNode(
                "duplicate",
                "Duplicate path removed: " + node.path,
                "optimization",
                "optimized",
                node.path + ".duplicate",
                []
            );
        }
        
        if (node.path) {
            seenPaths[node.path] = true;
        }
        
        // Recursively process children
        if (node.children && node.children.length > 0) {
            var optimizedChildren = [];
            for (var i = 0; i < node.children.length; i++) {
                var optimizedChild = removeDuplicates(node.children[i]);
                if (optimizedChild) {
                    optimizedChildren.push(optimizedChild);
                }
            }
            node.children = optimizedChildren;
        }
        
        return node;
    }
    
    return removeDuplicates(treeNode);
}

// TREE FILTERING
function filterTreeByStatus(treeNode, statusFilter) {
    if (!treeNode) return treeNode;
    
    function shouldIncludeNode(node) {
        if (!statusFilter || statusFilter.length === 0) return true;
        return indexOf(statusFilter, node.status) !== -1;
    }
    
    function filterNode(node) {
        if (!node) return undefined;
        
        var filteredNode = createTreeNode(
            node.name,
            node.value,
            node.type,
            node.status,
            node.path,
            []
        );
        
        // Filter children
        if (node.children && node.children.length > 0) {
            for (var i = 0; i < node.children.length; i++) {
                var child = node.children[i];
                if (shouldIncludeNode(child)) {
                    var filteredChild = filterNode(child);
                    if (filteredChild) {
                        filteredNode.children.push(filteredChild);
                    }
                }
            }
        }
        
        return filteredNode;
    }
    
    return shouldIncludeNode(treeNode) ? filterNode(treeNode) : undefined;
}

// MEMORY EFFICIENT TREE OPERATIONS
function createTreeSlice(treeNode, maxNodes) {
    if (!treeNode || maxNodes <= 0) return undefined;
    
    var nodeCount = 0;
    var maxAllowed = maxNodes || 1000;
    
    function sliceNode(node) {
        if (nodeCount >= maxAllowed) {
            return createTreeNode(
                "sliceLimit",
                "Tree slice limit reached (" + maxAllowed + " nodes)",
                "slice",
                "truncated",
                node.path + ".sliced",
                []
            );
        }
        
        nodeCount++;
        
        var slicedNode = createTreeNode(
            node.name,
            node.value,
            node.type,
            node.status,
            node.path,
            []
        );
        
        if (node.children && node.children.length > 0 && nodeCount < maxAllowed) {
            for (var i = 0; i < node.children.length && nodeCount < maxAllowed; i++) {
                var slicedChild = sliceNode(node.children[i]);
                if (slicedChild) {
                    slicedNode.children.push(slicedChild);
                }
            }
        }
        
        return slicedNode;
    }
    
    return sliceNode(treeNode);
}

$.writeln("Module 2.0B: Enhanced Tree Builder & Utilities loaded");