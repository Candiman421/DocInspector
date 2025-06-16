// ============================================================================
// MODULE 2.1: TREE BUILDER AND UTILITIES
// InDesign Document Query Tool v3.1 - Enhanced Safety Edition
// ES3 Compatible - All Reserved Words Fixed
// ============================================================================

// ============================================================================
// TREE NODE CREATION AND MANAGEMENT
// ============================================================================

function createTreeNode(nodeType, nodeName, nodeValue, parentPath) {
    var node = {
        type: nodeType || "unknown",
        name: nodeName || "unnamed",
        value: nodeValue,
        path: parentPath ? parentPath + "." + nodeName : nodeName,
        properties: {},
        children: [],
        metadata: {
            created: toISOString(new Date()),
            safetyMode: getCurrentSafetyMode(),
            depth: parentPath ? parentPath.split('.').length : 0
        },
        statistics: {
            propertyCount: 0,
            childCount: 0,
            errors: [],
            warnings: [],
            processingTime: 0
        }
    };
    
    // Add the value as a property if it exists
    if (nodeValue !== undefined && nodeValue !== null) {
        node.properties.value = nodeValue;
        node.statistics.propertyCount = 1;
    }
    
    return node;
}

function addPropertyToNode(nodeRef, propName, propValue, propType) {
    if (!nodeRef || !nodeRef.properties) {
        debugLog("Cannot add property to invalid node", "ERROR");
        return false;
    }
    
    try {
        // Sanitize property name for safety
        var safePropName = sanitizePropertyName(propName);
        
        // Store property with type information
        nodeRef.properties[safePropName] = {
            value: propValue,
            type: propType || typeof propValue,
            originalName: propName,
            timestamp: toISOString(new Date())
        };
        
        nodeRef.statistics.propertyCount++;
        return true;
        
    } catch (exc) {
        var errorMsg = "Failed to add property " + propName + ": " + exc.message;
        nodeRef.statistics.errors.push(errorMsg);
        debugLog(errorMsg, "ERROR");
        return false;
    }
}

function addChildToNode(parentNode, childNode) {
    if (!parentNode || !parentNode.children || !childNode) {
        debugLog("Cannot add child to invalid parent node", "ERROR");
        return false;
    }
    
    try {
        // Update child's path based on parent
        if (parentNode.path) {
            childNode.path = parentNode.path + "." + childNode.name;
        }
        
        // Update depth
        childNode.metadata.depth = parentNode.metadata.depth + 1;
        
        // Add to parent
        parentNode.children.push(childNode);
        parentNode.statistics.childCount++;
        
        return true;
        
    } catch (exc) {
        var errorMsg = "Failed to add child node: " + exc.message;
        parentNode.statistics.errors.push(errorMsg);
        debugLog(errorMsg, "ERROR");
        return false;
    }
}

function sanitizePropertyName(propName) {
    if (!propName || typeof propName !== 'string') {
        return "unknown_property";
    }
    
    // Replace problematic characters with underscores
    var sanitized = propName.replace(/[^a-zA-Z0-9_]/g, '_');
    
    // Ensure it doesn't start with a number
    if (/^[0-9]/.test(sanitized)) {
        sanitized = "prop_" + sanitized;
    }
    
    // Ensure it's not empty
    if (sanitized === '' || sanitized === '_') {
        sanitized = "unnamed_property";
    }
    
    return sanitized;
}

// ============================================================================
// TREE TRAVERSAL AND ANALYSIS
// ============================================================================

function traverseTreeNode(nodeRef, visitorFunction, maxDepth, currentDepth) {
    currentDepth = currentDepth || 0;
    maxDepth = maxDepth || QUERY_CONFIG.traversal.maxDepth;
    
    if (currentDepth >= maxDepth) {
        return;
    }
    
    if (!nodeRef || typeof visitorFunction !== 'function') {
        return;
    }
    
    try {
        // Visit current node
        visitorFunction(nodeRef, currentDepth);
        
        // Traverse children
        if (nodeRef.children && nodeRef.children.length > 0) {
            for (var i = 0; i < nodeRef.children.length; i++) {
                var childNode = nodeRef.children[i];
                if (childNode) {
                    traverseTreeNode(childNode, visitorFunction, maxDepth, currentDepth + 1);
                }
            }
        }
        
    } catch (exc) {
        debugLog("Tree traversal error at depth " + currentDepth + ": " + exc.message, "ERROR");
    }
}

function findNodesInTree(rootNode, searchCriteria) {
    var foundNodes = [];
    
    if (!rootNode || !searchCriteria) {
        return foundNodes;
    }
    
    traverseTreeNode(rootNode, function(node, depth) {
        var matches = true;
        
        // Check search criteria
        if (searchCriteria.type && node.type !== searchCriteria.type) {
            matches = false;
        }
        
        if (searchCriteria.name && stringIndexOf(node.name.toLowerCase(), searchCriteria.name.toLowerCase()) === -1) {
            matches = false;
        }
        
        if (searchCriteria.hasProperty) {
            var hasProperty = false;
            if (node.properties && node.properties[searchCriteria.hasProperty]) {
                hasProperty = true;
            }
            if (!hasProperty) {
                matches = false;
            }
        }
        
        if (searchCriteria.maxDepth && depth > searchCriteria.maxDepth) {
            matches = false;
        }
        
        if (matches) {
            foundNodes.push({
                node: node,
                depth: depth,
                path: node.path
            });
        }
    }, QUERY_CONFIG.traversal.maxDepth);
    
    return foundNodes;
}

function getTreeStatistics(rootNode) {
    var stats = {
        totalNodes: 0,
        totalProperties: 0,
        totalErrors: 0,
        totalWarnings: 0,
        maxDepth: 0,
        nodesByType: {},
        nodesByDepth: {},
        processingTime: 0,
        memoryEstimate: 0
    };
    
    if (!rootNode) {
        return stats;
    }
    
    var startTime = new Date().getTime();
    
    traverseTreeNode(rootNode, function(node, depth) {
        stats.totalNodes++;
        stats.totalProperties += node.statistics ? node.statistics.propertyCount : 0;
        stats.totalErrors += node.statistics && node.statistics.errors ? node.statistics.errors.length : 0;
        stats.totalWarnings += node.statistics && node.statistics.warnings ? node.statistics.warnings.length : 0;
        
        if (depth > stats.maxDepth) {
            stats.maxDepth = depth;
        }
        
        // Count by type
        var nodeType = node.type || "unknown";
        stats.nodesByType[nodeType] = (stats.nodesByType[nodeType] || 0) + 1;
        
        // Count by depth
        stats.nodesByDepth[depth] = (stats.nodesByDepth[depth] || 0) + 1;
        
        // Estimate memory usage (rough calculation)
        stats.memoryEstimate += estimateNodeMemory(node);
        
    }, QUERY_CONFIG.traversal.maxDepth);
    
    stats.processingTime = new Date().getTime() - startTime;
    return stats;
}

function estimateNodeMemory(nodeRef) {
    var estimate = 0;
    
    try {
        // Base node structure
        estimate += 200; // Base object overhead
        
        // Properties
        if (nodeRef.properties) {
            var propKeys = objectKeys(nodeRef.properties);
            for (var i = 0; i < propKeys.length; i++) {
                var key = propKeys[i];
                var value = nodeRef.properties[key];
                
                estimate += key.length * 2; // Key string
                
                if (typeof value === 'string') {
                    estimate += value.length * 2;
                } else if (typeof value === 'object' && value !== null) {
                    estimate += 50; // Object overhead
                } else {
                    estimate += 8; // Primitive value
                }
            }
        }
        
        // Metadata and statistics
        estimate += 100;
        
        // Children array overhead
        if (nodeRef.children) {
            estimate += nodeRef.children.length * 8;
        }
        
    } catch (exc) {
        estimate = 200; // Fallback estimate
    }
    
    return estimate;
}

// ============================================================================
// TREE FORMATTING AND EXPORT
// ============================================================================

function formatTreeAsText(rootNode, options) {
    options = options || {};
    var includeMetadata = options.includeMetadata !== false;
    var includeStatistics = options.includeStatistics !== false;
    var maxDepth = options.maxDepth || QUERY_CONFIG.traversal.maxDepth;
    var includeErrors = options.includeErrors !== false;
    
    var builder = createStringBuilder();
    
    // Header
    builder.appendLine("INDESIGN DOCUMENT TREE ANALYSIS");
    builder.appendLine(repeatString("=", 50));
    builder.appendLine("Generated: " + toISOString(new Date()));
    builder.appendLine("Safety Mode: " + getCurrentSafetyMode());
    builder.appendLine("");
    
    // Tree statistics
    if (includeStatistics && rootNode) {
        var stats = getTreeStatistics(rootNode);
        builder.appendLine("TREE STATISTICS:");
        builder.appendLine("Total Nodes: " + stats.totalNodes);
        builder.appendLine("Total Properties: " + stats.totalProperties);
        builder.appendLine("Max Depth: " + stats.maxDepth);
        builder.appendLine("Processing Time: " + stats.processingTime + "ms");
        builder.appendLine("Memory Estimate: " + formatBytes(stats.memoryEstimate));
        
        if (stats.totalErrors > 0) {
            builder.appendLine("Total Errors: " + stats.totalErrors);
        }
        if (stats.totalWarnings > 0) {
            builder.appendLine("Total Warnings: " + stats.totalWarnings);
        }
        builder.appendLine("");
        
        // Node type breakdown
        builder.appendLine("NODE TYPE BREAKDOWN:");
        var typeKeys = objectKeys(stats.nodesByType);
        for (var i = 0; i < typeKeys.length; i++) {
            var type = typeKeys[i];
            builder.appendLine("  " + type + ": " + stats.nodesByType[type]);
        }
        builder.appendLine("");
    }
    
    // Tree content
    if (rootNode) {
        builder.appendLine("TREE STRUCTURE:");
        builder.appendLine(repeatString("-", 20));
        formatNodeAsText(rootNode, builder, "", maxDepth, 0, includeMetadata, includeErrors);
    } else {
        builder.appendLine("No tree data available.");
    }
    
    return builder.toString();
}

function formatNodeAsText(nodeRef, builder, indent, maxDepth, currentDepth, includeMetadata, includeErrors) {
    if (currentDepth >= maxDepth || !nodeRef) {
        return;
    }
    
    try {
        // Node header
        var nodeHeader = indent + nodeRef.name + " (" + nodeRef.type + ")";
        if (nodeRef.value !== undefined && nodeRef.value !== null) {
            nodeHeader += ": " + formatValueForDisplay(nodeRef.value);
        }
        builder.appendLine(nodeHeader);
        
        // Properties
        if (nodeRef.properties && objectKeys(nodeRef.properties).length > 0) {
            var propKeys = objectKeys(nodeRef.properties);
            for (var i = 0; i < propKeys.length; i++) {
                var key = propKeys[i];
                var value = nodeRef.properties[key];
                var displayValue = formatValueForDisplay(value);
                builder.appendLine(indent + "  " + key + ": " + displayValue);
            }
        }
        
        // Metadata (if requested)
        if (includeMetadata && nodeRef.metadata) {
            builder.appendLine(indent + "  [Created: " + nodeRef.metadata.created + "]");
            builder.appendLine(indent + "  [Depth: " + nodeRef.metadata.depth + "]");
        }
        
        // Statistics
        if (nodeRef.statistics) {
            if (nodeRef.statistics.propertyCount > 0) {
                builder.appendLine(indent + "  [Properties: " + nodeRef.statistics.propertyCount + "]");
            }
            if (nodeRef.statistics.childCount > 0) {
                builder.appendLine(indent + "  [Children: " + nodeRef.statistics.childCount + "]");
            }
        }
        
        // Errors and warnings (if requested)
        if (includeErrors && nodeRef.statistics) {
            if (nodeRef.statistics.errors && nodeRef.statistics.errors.length > 0) {
                builder.appendLine(indent + "  [ERRORS: " + nodeRef.statistics.errors.length + "]");
                for (var j = 0; j < nodeRef.statistics.errors.length; j++) {
                    builder.appendLine(indent + "    ! " + nodeRef.statistics.errors[j]);
                }
            }
            if (nodeRef.statistics.warnings && nodeRef.statistics.warnings.length > 0) {
                builder.appendLine(indent + "  [WARNINGS: " + nodeRef.statistics.warnings.length + "]");
                for (var k = 0; k < nodeRef.statistics.warnings.length; k++) {
                    builder.appendLine(indent + "    ? " + nodeRef.statistics.warnings[k]);
                }
            }
        }
        
        // Children
        if (nodeRef.children && nodeRef.children.length > 0) {
            for (var i = 0; i < nodeRef.children.length; i++) {
                var childNode = nodeRef.children[i];
                formatNodeAsText(childNode, builder, indent + "  ", maxDepth, currentDepth + 1, includeMetadata, includeErrors);
            }
        }
        
    } catch (exc) {
        builder.appendLine(indent + "[ERROR formatting node: " + exc.message + "]");
    }
}

function formatValueForDisplay(value) {
    try {
        if (value === null) {
            return "[null]";
        }
        if (value === undefined) {
            return "[undefined]";
        }
        
        var valueType = typeof value;
        
        if (valueType === 'string') {
            // Limit string length for display
            if (value.length > 100) {
                return "\"" + value.substring(0, 100) + "...\" (" + value.length + " chars)";
            } else {
                return "\"" + value + "\"";
            }
        } else if (valueType === 'object') {
            if (value.hasOwnProperty && value.hasOwnProperty('value') && value.hasOwnProperty('type')) {
                // This is a property object from addPropertyToNode
                return formatValueForDisplay(value.value) + " [" + value.type + "]";
            } else if (arrayIndexOf && Array.isArray && Array.isArray(value)) {
                return "[Array with " + value.length + " items]";
            } else {
                return "[Object]";
            }
        } else if (valueType === 'function') {
            return "[Function]";
        } else {
            return String(value);
        }
        
    } catch (exc) {
        return "[Error formatting value: " + exc.message + "]";
    }
}

// ============================================================================
// TREE COMPARISON UTILITIES
// ============================================================================

function compareTreeNodes(node1, node2, comparisonOptions) {
    comparisonOptions = comparisonOptions || {};
    var compareProperties = comparisonOptions.compareProperties !== false;
    var compareChildren = comparisonOptions.compareChildren !== false;
    var ignoreMetadata = comparisonOptions.ignoreMetadata !== false;
    
    var comparison = {
        identical: false,
        differences: [],
        summary: {
            propertyDifferences: 0,
            structuralDifferences: 0,
            childDifferences: 0
        }
    };
    
    if (!node1 && !node2) {
        comparison.identical = true;
        return comparison;
    }
    
    if (!node1 || !node2) {
        comparison.differences.push("One node is null/undefined");
        comparison.summary.structuralDifferences++;
        return comparison;
    }
    
    try {
        // Compare basic properties
        if (node1.type !== node2.type) {
            comparison.differences.push("Type difference: " + node1.type + " vs " + node2.type);
            comparison.summary.structuralDifferences++;
        }
        
        if (node1.name !== node2.name) {
            comparison.differences.push("Name difference: " + node1.name + " vs " + node2.name);
            comparison.summary.structuralDifferences++;
        }
        
        // Compare properties
        if (compareProperties) {
            var propDiff = compareNodeProperties(node1.properties, node2.properties);
            if (propDiff.length > 0) {
                for (var i = 0; i < propDiff.length; i++) {
                    comparison.differences.push("Property: " + propDiff[i]);
                    comparison.summary.propertyDifferences++;
                }
            }
        }
        
        // Compare children
        if (compareChildren) {
            var childDiff = compareNodeChildren(node1.children, node2.children, comparisonOptions);
            if (childDiff.length > 0) {
                for (var j = 0; j < childDiff.length; j++) {
                    comparison.differences.push("Child: " + childDiff[j]);
                    comparison.summary.childDifferences++;
                }
            }
        }
        
        // Determine if identical
        comparison.identical = comparison.differences.length === 0;
        
    } catch (exc) {
        comparison.differences.push("Comparison error: " + exc.message);
    }
    
    return comparison;
}

function compareNodeProperties(props1, props2) {
    var differences = [];
    
    if (!props1 && !props2) {
        return differences;
    }
    
    if (!props1 || !props2) {
        differences.push("One node has no properties");
        return differences;
    }
    
    try {
        var keys1 = objectKeys(props1);
        var keys2 = objectKeys(props2);
        
        // Check for missing properties
        for (var i = 0; i < keys1.length; i++) {
            var key = keys1[i];
            if (arrayIndexOf(keys2, key) === -1) {
                differences.push("Property '" + key + "' missing in second node");
            }
        }
        
        for (var j = 0; j < keys2.length; j++) {
            var key = keys2[j];
            if (arrayIndexOf(keys1, key) === -1) {
                differences.push("Property '" + key + "' missing in first node");
            }
        }
        
        // Compare common properties
        for (var k = 0; k < keys1.length; k++) {
            var key = keys1[k];
            if (arrayIndexOf(keys2, key) !== -1) {
                var value1 = props1[key];
                var value2 = props2[key];
                
                if (!valuesEqual(value1, value2)) {
                    differences.push("Property '" + key + "' differs: " + 
                                   formatValueForDisplay(value1) + " vs " + formatValueForDisplay(value2));
                }
            }
        }
        
    } catch (exc) {
        differences.push("Property comparison error: " + exc.message);
    }
    
    return differences;
}

function compareNodeChildren(children1, children2, comparisonOptions) {
    var differences = [];
    
    if (!children1 && !children2) {
        return differences;
    }
    
    if (!children1 || !children2) {
        differences.push("One node has no children");
        return differences;
    }
    
    try {
        if (children1.length !== children2.length) {
            differences.push("Different number of children: " + children1.length + " vs " + children2.length);
        }
        
        var maxLength = Math.max(children1.length, children2.length);
        for (var i = 0; i < maxLength; i++) {
            var child1 = i < children1.length ? children1[i] : null;
            var child2 = i < children2.length ? children2[i] : null;
            
            if (!child1 || !child2) {
                differences.push("Child " + i + " missing in one node");
            } else {
                var childComparison = compareTreeNodes(child1, child2, comparisonOptions);
                if (!childComparison.identical) {
                    differences.push("Child " + i + " (" + child1.name + ") has differences");
                }
            }
        }
        
    } catch (exc) {
        differences.push("Children comparison error: " + exc.message);
    }
    
    return differences;
}

function valuesEqual(value1, value2) {
    try {
        if (value1 === value2) {
            return true;
        }
        
        if (typeof value1 !== typeof value2) {
            return false;
        }
        
        if (typeof value1 === 'object' && value1 !== null && value2 !== null) {
            // Simple object comparison for property objects
            if (value1.hasOwnProperty && value1.hasOwnProperty('value') && 
                value2.hasOwnProperty && value2.hasOwnProperty('value')) {
                return valuesEqual(value1.value, value2.value);
            }
            
            // For other objects, use string comparison as fallback
            return String(value1) === String(value2);
        }
        
        return false;
        
    } catch (exc) {
        return false;
    }
}

// ============================================================================
// TREE VALIDATION AND REPAIR
// ============================================================================

function validateTreeStructure(rootNode) {
    var validation = {
        isValid: true,
        errors: [],
        warnings: [],
        statistics: {
            totalNodes: 0,
            invalidNodes: 0,
            orphanedNodes: 0,
            circularReferences: 0
        }
    };
    
    if (!rootNode) {
        validation.isValid = false;
        validation.errors.push("Root node is null or undefined");
        return validation;
    }
    
    var visitedNodes = [];
    
    try {
        validateNodeRecursive(rootNode, validation, visitedNodes, 0);
    } catch (exc) {
        validation.isValid = false;
        validation.errors.push("Validation error: " + exc.message);
    }
    
    return validation;
}

function validateNodeRecursive(nodeRef, validation, visitedNodes, depth) {
    if (!nodeRef) {
        validation.statistics.invalidNodes++;
        validation.errors.push("Null node found at depth " + depth);
        return;
    }
    
    validation.statistics.totalNodes++;
    
    // Check for circular references
    for (var i = 0; i < visitedNodes.length; i++) {
        if (visitedNodes[i] === nodeRef) {
            validation.statistics.circularReferences++;
            validation.errors.push("Circular reference detected for node: " + nodeRef.name);
            return;
        }
    }
    
    visitedNodes.push(nodeRef);
    
    // Validate node structure
    if (!nodeRef.type) {
        validation.warnings.push("Node missing type: " + nodeRef.name);
    }
    
    if (!nodeRef.name) {
        validation.warnings.push("Node missing name at depth " + depth);
    }
    
    if (!nodeRef.properties) {
        validation.warnings.push("Node missing properties object: " + nodeRef.name);
    }
    
    if (!nodeRef.children) {
        validation.warnings.push("Node missing children array: " + nodeRef.name);
    }
    
    if (!nodeRef.statistics) {
        validation.warnings.push("Node missing statistics: " + nodeRef.name);
    }
    
    // Validate children
    if (nodeRef.children && nodeRef.children.length > 0) {
        for (var j = 0; j < nodeRef.children.length; j++) {
            validateNodeRecursive(nodeRef.children[j], validation, visitedNodes, depth + 1);
        }
    }
    
    // Remove from visited nodes (backtrack)
    visitedNodes.pop();
}

function repairTreeStructure(rootNode) {
    var repairReport = {
        repaired: false,
        actionsPerformed: [],
        errors: []
    };
    
    if (!rootNode) {
        repairReport.errors.push("Cannot repair null root node");
        return repairReport;
    }
    
    try {
        repairNodeRecursive(rootNode, repairReport, 0);
        repairReport.repaired = repairReport.actionsPerformed.length > 0;
    } catch (exc) {
        repairReport.errors.push("Repair error: " + exc.message);
    }
    
    return repairReport;
}

function repairNodeRecursive(nodeRef, repairReport, depth) {
    if (!nodeRef) {
        return;
    }
    
    // Repair missing properties
    if (!nodeRef.type) {
        nodeRef.type = "unknown";
        repairReport.actionsPerformed.push("Added missing type to node at depth " + depth);
    }
    
    if (!nodeRef.name) {
        nodeRef.name = "unnamed_node_" + depth;
        repairReport.actionsPerformed.push("Added missing name to node at depth " + depth);
    }
    
    if (!nodeRef.properties) {
        nodeRef.properties = {};
        repairReport.actionsPerformed.push("Added missing properties object to node: " + nodeRef.name);
    }
    
    if (!nodeRef.children) {
        nodeRef.children = [];
        repairReport.actionsPerformed.push("Added missing children array to node: " + nodeRef.name);
    }
    
    if (!nodeRef.statistics) {
        nodeRef.statistics = {
            propertyCount: 0,
            childCount: 0,
            errors: [],
            warnings: [],
            processingTime: 0
        };
        repairReport.actionsPerformed.push("Added missing statistics to node: " + nodeRef.name);
    }
    
    if (!nodeRef.metadata) {
        nodeRef.metadata = {
            created: toISOString(new Date()),
            safetyMode: getCurrentSafetyMode(),
            depth: depth
        };
        repairReport.actionsPerformed.push("Added missing metadata to node: " + nodeRef.name);
    }
    
    // Update path if missing
    if (!nodeRef.path) {
        nodeRef.path = nodeRef.name;
        repairReport.actionsPerformed.push("Added missing path to node: " + nodeRef.name);
    }
    
    // Repair children
    if (nodeRef.children && nodeRef.children.length > 0) {
        for (var i = 0; i < nodeRef.children.length; i++) {
            if (nodeRef.children[i]) {
                repairNodeRecursive(nodeRef.children[i], repairReport, depth + 1);
            }
        }
    }
    
    // Update statistics
    if (nodeRef.properties) {
        nodeRef.statistics.propertyCount = objectKeys(nodeRef.properties).length;
    }
    
    if (nodeRef.children) {
        nodeRef.statistics.childCount = nodeRef.children.length;
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    var k = 1024;
    var sizes = ['Bytes', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function cloneTreeNode(nodeRef, maxDepth, currentDepth) {
    currentDepth = currentDepth || 0;
    maxDepth = maxDepth || 3;
    
    if (currentDepth >= maxDepth || !nodeRef) {
        return null;
    }
    
    try {
        var clonedNode = {
            type: nodeRef.type,
            name: nodeRef.name,
            value: nodeRef.value,
            path: nodeRef.path,
            properties: {},
            children: [],
            metadata: {},
            statistics: {}
        };
        
        // Clone properties
        if (nodeRef.properties) {
            var propKeys = objectKeys(nodeRef.properties);
            for (var i = 0; i < propKeys.length; i++) {
                var key = propKeys[i];
                clonedNode.properties[key] = nodeRef.properties[key];
            }
        }
        
        // Clone metadata
        if (nodeRef.metadata) {
            var metaKeys = objectKeys(nodeRef.metadata);
            for (var j = 0; j < metaKeys.length; j++) {
                var key = metaKeys[j];
                clonedNode.metadata[key] = nodeRef.metadata[key];
            }
        }
        
        // Clone statistics
        if (nodeRef.statistics) {
            var statKeys = objectKeys(nodeRef.statistics);
            for (var k = 0; k < statKeys.length; k++) {
                var key = statKeys[k];
                if (key === 'errors' || key === 'warnings') {
                    clonedNode.statistics[key] = nodeRef.statistics[key].slice(); // Copy array
                } else {
                    clonedNode.statistics[key] = nodeRef.statistics[key];
                }
            }
        }
        
        // Clone children
        if (nodeRef.children && currentDepth < maxDepth - 1) {
            for (var l = 0; l < nodeRef.children.length; l++) {
                var childClone = cloneTreeNode(nodeRef.children[l], maxDepth, currentDepth + 1);
                if (childClone) {
                    clonedNode.children.push(childClone);
                }
            }
        }
        
        return clonedNode;
        
    } catch (exc) {
        debugLog("Tree node cloning failed: " + exc.message, "ERROR");
        return null;
    }
}

function optimizeTreeForExport(rootNode, options) {
    options = options || {};
    var removeEmptyNodes = options.removeEmptyNodes !== false;
    var limitDepth = options.maxDepth || 5;
    var removeMetadata = options.removeMetadata === true;
    var compactProperties = options.compactProperties === true;
    
    if (!rootNode) {
        return null;
    }
    
    var optimizedNode = cloneTreeNode(rootNode, limitDepth);
    if (!optimizedNode) {
        return null;
    }
    
    // Apply optimizations
    optimizeNodeRecursive(optimizedNode, removeEmptyNodes, removeMetadata, compactProperties);
    
    return optimizedNode;
}

function optimizeNodeRecursive(nodeRef, removeEmptyNodes, removeMetadata, compactProperties) {
    if (!nodeRef) {
        return;
    }
    
    // Remove metadata if requested
    if (removeMetadata) {
        delete nodeRef.metadata;
    }
    
    // Compact properties if requested
    if (compactProperties && nodeRef.properties) {
        var propKeys = objectKeys(nodeRef.properties);
        for (var i = 0; i < propKeys.length; i++) {
            var key = propKeys[i];
            var value = nodeRef.properties[key];
            
            // If property is an object with just a value, flatten it
            if (typeof value === 'object' && value !== null && 
                value.hasOwnProperty && value.hasOwnProperty('value') && 
                objectKeys(value).length <= 2) {
                nodeRef.properties[key] = value.value;
            }
        }
    }
    
    // Process children
    if (nodeRef.children && nodeRef.children.length > 0) {
        // Remove empty nodes if requested
        if (removeEmptyNodes) {
            var filteredChildren = [];
            for (var j = 0; j < nodeRef.children.length; j++) {
                var child = nodeRef.children[j];
                if (child && !isEmptyNode(child)) {
                    filteredChildren.push(child);
                }
            }
            nodeRef.children = filteredChildren;
        }
        
        // Recursively optimize children
        for (var k = 0; k < nodeRef.children.length; k++) {
            optimizeNodeRecursive(nodeRef.children[k], removeEmptyNodes, removeMetadata, compactProperties);
        }
    }
}

function isEmptyNode(nodeRef) {
    if (!nodeRef) {
        return true;
    }
    
    // Check if node has meaningful content
    var hasProperties = nodeRef.properties && objectKeys(nodeRef.properties).length > 0;
    var hasChildren = nodeRef.children && nodeRef.children.length > 0;
    var hasValue = nodeRef.value !== undefined && nodeRef.value !== null;
    
    return !hasProperties && !hasChildren && !hasValue;
}

$.writeln("Module 2.1: Tree Builder and Utilities loaded (Enhanced tree management and validation)");