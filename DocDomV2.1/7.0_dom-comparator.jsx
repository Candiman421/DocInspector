// =============================================================================
// 7.0_dom-comparator.jsx - BEFORE/AFTER DOCUMENT COMPARISON
// InDesign DOM Discovery Builder v2.1 - TARGET ARCHITECTURE
// =============================================================================
// PURPOSE: Compare before/after JSON exports to identify document changes
// DEPENDENCIES: ["1.0_safe-foundation.jsx", "6.0_json-analyzer.jsx"]
// SIZE: ~900 lines
// =============================================================================

// =============================================================================
// DOM COMPARATOR CONFIGURATION
// =============================================================================

var DOM_COMPARATOR_CONFIG = {
    enableStructuralComparison: true,
    enablePropertyComparison: true,
    enableCollectionComparison: true,
    enableValueComparison: false,
    enableObjectReferenceComparison: true,
    maxDifferencesToReport: 100,
    ignoreTimestampDifferences: true,
    highlightCriticalChanges: true,
    generateChangeRecommendations: true,
    detailedCollectionAnalysis: true,
    trackObjectMovements: true
};

// =============================================================================
// MAIN COMPARISON FUNCTIONS
// =============================================================================

/**
 * Compare two DOM JSON exports and generate comprehensive difference report
 * @param {String} beforeJSONPath - Path to before JSON export
 * @param {String} afterJSONPath - Path to after JSON export
 * @param {Object} comparisonOptions - Comparison options
 * @returns {Object} Comparison result with success, comparison, error
 */
function compareDOMExports(beforeJSONPath, afterJSONPath, comparisonOptions) {
    var startTime = new Date().getTime();
    var result = {
        success: false,
        comparison: null,
        error: ''
    };
    
    try {
        var config = mergeComparisonConfig(DOM_COMPARATOR_CONFIG, comparisonOptions);
        
        // Read and parse both JSON files
        var beforeData = readAndParseJSONFile(beforeJSONPath);
        if (!beforeData.success) {
            result.error = 'Before file error: ' + beforeData.error;
            return result;
        }
        
        var afterData = readAndParseJSONFile(afterJSONPath);
        if (!afterData.success) {
            result.error = 'After file error: ' + afterData.error;
            return result;
        }
        
        // Validate both structures
        var beforeValidation = validateJSONStructure(beforeData.data);
        if (!beforeValidation.success) {
            result.error = 'Before file validation: ' + beforeValidation.error;
            return result;
        }
        
        var afterValidation = validateJSONStructure(afterData.data);
        if (!afterValidation.success) {
            result.error = 'After file validation: ' + afterValidation.error;
            return result;
        }
        
        // Perform comprehensive comparison
        var comparisonResult = performComprehensiveDOMComparison(beforeData.data, afterData.data, config);
        if (!comparisonResult.success) {
            result.error = comparisonResult.error;
            return result;
        }
        
        // Generate comparison report
        var comparisonReport = generateComparisonReport(comparisonResult.comparisonData, config);
        
        // Build final comparison object
        var comparison = {
            metadata: {
                comparisonTimestamp: getCurrentTimestamp(),
                beforeFile: beforeJSONPath,
                afterFile: afterJSONPath,
                comparisonTime: new Date().getTime() - startTime,
                config: config
            },
            summary: {
                changesDetected: comparisonResult.comparisonData.totalChanges > 0,
                totalChanges: comparisonResult.comparisonData.totalChanges,
                criticalChanges: countCriticalChanges(comparisonResult.comparisonData, config),
                changeTypes: getChangeTypes(comparisonResult.comparisonData)
            },
            differences: comparisonResult.comparisonData,
            report: comparisonReport,
            recommendations: generateChangeRecommendations(comparisonResult.comparisonData, config)
        };
        
        result.success = true;
        result.comparison = comparison;
        
        return result;
        
    } catch (exc) {
        result.error = 'Comparison failed: ' + exc.message;
        return result;
    }
}

/**
 * Perform comprehensive comparison between two DOM structures
 * @param {Object} beforeData - Before DOM data
 * @param {Object} afterData - After DOM data
 * @param {Object} config - Comparison configuration
 * @returns {Object} Comparison result with success, comparisonData, error
 */
function performComprehensiveDOMComparison(beforeData, afterData, config) {
    var result = {
        success: false,
        comparisonData: null,
        error: ''
    };
    
    try {
        var comparisonData = {
            metadata: compareMetadata(beforeData, afterData, config),
            structural: config.enableStructuralComparison ? compareStructuralElements(beforeData, afterData, config) : null,
            properties: config.enablePropertyComparison ? compareProperties(beforeData, afterData, config) : null,
            collections: config.enableCollectionComparison ? compareCollections(beforeData, afterData, config) : null,
            objectReferences: config.enableObjectReferenceComparison ? compareObjectReferences(beforeData, afterData, config) : null,
            totalChanges: 0
        };
        
        // Count total changes
        comparisonData.totalChanges = countTotalChanges(comparisonData);
        
        result.success = true;
        result.comparisonData = comparisonData;
        
        return result;
        
    } catch (exc) {
        result.error = 'Comparison processing error: ' + exc.message;
        return result;
    }
}

// =============================================================================
// METADATA AND STRUCTURE COMPARISON
// =============================================================================

/**
 * Compare metadata between two DOM exports
 * @param {Object} beforeData - Before DOM data
 * @param {Object} afterData - After DOM data
 * @param {Object} config - Configuration
 * @returns {Object} Metadata comparison result
 */
function compareMetadata(beforeData, afterData, config) {
    var result = {
        documentNameChanged: false,
        timestampChanged: false,
        configurationChanged: false,
        featuresChanged: false,
        changes: []
    };
    
    try {
        var beforeMeta = extractDOMStructure(beforeData).metadata || {};
        var afterMeta = extractDOMStructure(afterData).metadata || {};
        
        // Compare document name
        var beforeDocName = beforeMeta.documentName || 'unknown';
        var afterDocName = afterMeta.documentName || 'unknown';
        
        if (beforeDocName !== afterDocName) {
            result.documentNameChanged = true;
            result.changes.push({
                type: 'metadata',
                field: 'documentName',
                before: beforeDocName,
                after: afterDocName,
                significance: 'medium'
            });
        }
        
        // Compare timestamps (unless ignored)
        if (!config.ignoreTimestampDifferences) {
            var beforeTime = beforeMeta.timestamp || 'unknown';
            var afterTime = afterMeta.timestamp || 'unknown';
            
            if (beforeTime !== afterTime) {
                result.timestampChanged = true;
                result.changes.push({
                    type: 'metadata',
                    field: 'timestamp',
                    before: beforeTime,
                    after: afterTime,
                    significance: 'low'
                });
            }
        }
        
        // Compare configurations
        var beforeConfig = beforeMeta.config || {};
        var afterConfig = afterMeta.config || {};
        
        if (beforeConfig.maxDepth !== afterConfig.maxDepth) {
            result.configurationChanged = true;
            result.changes.push({
                type: 'metadata',
                field: 'maxDepth',
                before: beforeConfig.maxDepth,
                after: afterConfig.maxDepth,
                significance: 'high'
            });
        }
        
        return result;
        
    } catch (exc) {
        result.changes.push({
            type: 'error',
            field: 'metadata_comparison',
            error: exc.message,
            significance: 'high'
        });
        return result;
    }
}

/**
 * Compare structural elements between DOM exports
 * @param {Object} beforeData - Before DOM data
 * @param {Object} afterData - After DOM data
 * @param {Object} config - Configuration
 * @returns {Object} Structural comparison result
 */
function compareStructuralElements(beforeData, afterData, config) {
    var result = {
        nodeCountChanged: false,
        propertyCountChanged: false,
        structureChanged: false,
        changes: []
    };
    
    try {
        var beforeStructure = extractDOMStructure(beforeData);
        var afterStructure = extractDOMStructure(afterData);
        
        // Compare statistics
        var beforeStats = beforeStructure.statistics || {};
        var afterStats = afterStructure.statistics || {};
        
        if (beforeStats.totalNodes !== afterStats.totalNodes) {
            result.nodeCountChanged = true;
            result.changes.push({
                type: 'structural',
                field: 'totalNodes',
                before: beforeStats.totalNodes || 0,
                after: afterStats.totalNodes || 0,
                significance: 'high'
            });
        }
        
        if (beforeStats.totalProperties !== afterStats.totalProperties) {
            result.propertyCountChanged = true;
            result.changes.push({
                type: 'structural',
                field: 'totalProperties',
                before: beforeStats.totalProperties || 0,
                after: afterStats.totalProperties || 0,
                significance: 'high'
            });
        }
        
        // Compare DOM tree structure
        if (beforeStructure.structure && afterStructure.structure) {
            var nodeChanges = compareNodes(
                beforeStructure.structure.document,
                afterStructure.structure.document,
                'document',
                config
            );
            
            if (nodeChanges.length > 0) {
                result.structureChanged = true;
                result.changes = result.changes.concat(nodeChanges);
            }
        }
        
        return result;
        
    } catch (exc) {
        result.changes.push({
            type: 'error',
            field: 'structural_comparison',
            error: exc.message,
            significance: 'high'
        });
        return result;
    }
}

/**
 * Compare two DOM nodes recursively
 * @param {Object} beforeNode - Before DOM node
 * @param {Object} afterNode - After DOM node
 * @param {String} nodePath - Current node path
 * @param {Object} config - Configuration
 * @returns {Array} Array of node comparison differences
 */
function compareNodes(beforeNode, afterNode, nodePath, config) {
    var differences = [];
    
    try {
        // Check if both nodes exist
        if (!beforeNode && !afterNode) {
            return differences;
        }
        
        if (!beforeNode && afterNode) {
            differences.push({
                type: 'structural',
                field: 'node_added',
                path: nodePath,
                after: afterNode.name || 'unknown',
                significance: 'high'
            });
            return differences;
        }
        
        if (beforeNode && !afterNode) {
            differences.push({
                type: 'structural',
                field: 'node_removed',
                path: nodePath,
                before: beforeNode.name || 'unknown',
                significance: 'high'
            });
            return differences;
        }
        
        // Compare node properties
        if (beforeNode.type !== afterNode.type) {
            differences.push({
                type: 'structural',
                field: 'node_type',
                path: nodePath,
                before: beforeNode.type,
                after: afterNode.type,
                significance: 'high'
            });
        }
        
        // Compare property arrays
        var propertyDiffs = comparePropertyArrays(
            beforeNode.properties || [],
            afterNode.properties || [],
            nodePath + '.properties',
            config
        );
        differences = differences.concat(propertyDiffs);
        
        // Compare collection arrays
        var collectionDiffs = comparePropertyArrays(
            beforeNode.collections || [],
            afterNode.collections || [],
            nodePath + '.collections',
            config
        );
        differences = differences.concat(collectionDiffs);
        
        // Compare child nodes
        var beforeChildren = beforeNode.childNodes || [];
        var afterChildren = afterNode.childNodes || [];
        
        var maxChildren = Math.max(beforeChildren.length, afterChildren.length);
        for (var i = 0; i < maxChildren; i++) {
            var beforeChild = beforeChildren[i] || null;
            var afterChild = afterChildren[i] || null;
            var childPath = nodePath + '.child[' + i + ']';
            
            var childDiffs = compareNodes(beforeChild, afterChild, childPath, config);
            differences = differences.concat(childDiffs);
        }
        
        return differences;
        
    } catch (exc) {
        differences.push({
            type: 'error',
            field: 'node_comparison',
            path: nodePath,
            error: exc.message,
            significance: 'high'
        });
        return differences;
    }
}

// =============================================================================
// PROPERTY AND COLLECTION COMPARISON
// =============================================================================

/**
 * Compare properties between DOM exports
 * @param {Object} beforeData - Before DOM data
 * @param {Object} afterData - After DOM data
 * @param {Object} config - Configuration
 * @returns {Object} Property comparison result
 */
function compareProperties(beforeData, afterData, config) {
    var result = {
        propertiesAdded: [],
        propertiesRemoved: [],
        propertiesChanged: [],
        changes: []
    };
    
    try {
        var beforeProps = extractAllProperties(beforeData);
        var afterProps = extractAllProperties(afterData);
        
        // Create property maps by path
        var beforePropMap = {};
        var afterPropMap = {};
        
        for (var i = 0; i < beforeProps.length; i++) {
            beforePropMap[beforeProps[i].path] = beforeProps[i];
        }
        
        for (var j = 0; j < afterProps.length; j++) {
            afterPropMap[afterProps[j].path] = afterProps[j];
        }
        
        // Find added properties
        for (var afterPath in afterPropMap) {
            if (!beforePropMap[afterPath]) {
                result.propertiesAdded.push(afterPropMap[afterPath]);
                result.changes.push({
                    type: 'property',
                    field: 'added',
                    path: afterPath,
                    after: afterPropMap[afterPath],
                    significance: 'medium'
                });
            }
        }
        
        // Find removed properties
        for (var beforePath in beforePropMap) {
            if (!afterPropMap[beforePath]) {
                result.propertiesRemoved.push(beforePropMap[beforePath]);
                result.changes.push({
                    type: 'property',
                    field: 'removed',
                    path: beforePath,
                    before: beforePropMap[beforePath],
                    significance: 'medium'
                });
            }
        }
        
        // Find changed properties
        for (var commonPath in beforePropMap) {
            if (afterPropMap[commonPath]) {
                var beforeProp = beforePropMap[commonPath];
                var afterProp = afterPropMap[commonPath];
                
                if (beforeProp.type !== afterProp.type) {
                    result.propertiesChanged.push({
                        path: commonPath,
                        field: 'type',
                        before: beforeProp.type,
                        after: afterProp.type
                    });
                    
                    result.changes.push({
                        type: 'property',
                        field: 'type_changed',
                        path: commonPath,
                        before: beforeProp.type,
                        after: afterProp.type,
                        significance: 'high'
                    });
                }
                
                if (beforeProp.safetyLevel !== afterProp.safetyLevel) {
                    result.propertiesChanged.push({
                        path: commonPath,
                        field: 'safetyLevel',
                        before: beforeProp.safetyLevel,
                        after: afterProp.safetyLevel
                    });
                    
                    result.changes.push({
                        type: 'property',
                        field: 'safety_changed',
                        path: commonPath,
                        before: beforeProp.safetyLevel,
                        after: afterProp.safetyLevel,
                        significance: 'medium'
                    });
                }
            }
        }
        
        return result;
        
    } catch (exc) {
        result.changes.push({
            type: 'error',
            field: 'property_comparison',
            error: exc.message,
            significance: 'high'
        });
        return result;
    }
}

/**
 * Compare arrays of properties or collections
 * @param {Array} beforeArray - Before property array
 * @param {Array} afterArray - After property array
 * @param {String} arrayPath - Array path
 * @param {Object} config - Configuration
 * @returns {Array} Array of differences
 */
function comparePropertyArrays(beforeArray, afterArray, arrayPath, config) {
    var differences = [];
    
    try {
        var beforeLength = beforeArray ? beforeArray.length : 0;
        var afterLength = afterArray ? afterArray.length : 0;
        
        if (beforeLength !== afterLength) {
            differences.push({
                type: 'structural',
                field: 'array_length',
                path: arrayPath,
                before: beforeLength,
                after: afterLength,
                significance: 'medium'
            });
        }
        
        // Compare individual items (up to a limit for performance)
        var maxItems = Math.min(beforeLength, afterLength, 20);
        
        for (var i = 0; i < maxItems; i++) {
            var beforeItem = beforeArray[i];
            var afterItem = afterArray[i];
            var itemPath = arrayPath + '[' + i + ']';
            
            if (beforeItem && afterItem) {
                if (beforeItem.name !== afterItem.name) {
                    differences.push({
                        type: 'property',
                        field: 'name',
                        path: itemPath,
                        before: beforeItem.name,
                        after: afterItem.name,
                        significance: 'medium'
                    });
                }
                
                if (beforeItem.type !== afterItem.type) {
                    differences.push({
                        type: 'property',
                        field: 'type',
                        path: itemPath,
                        before: beforeItem.type,
                        after: afterItem.type,
                        significance: 'high'
                    });
                }
            }
        }
        
        return differences;
        
    } catch (exc) {
        differences.push({
            type: 'error',
            field: 'array_comparison',
            path: arrayPath,
            error: exc.message,
            significance: 'high'
        });
        return differences;
    }
}

/**
 * Compare collections between DOM exports
 * @param {Object} beforeData - Before DOM data
 * @param {Object} afterData - After DOM data
 * @param {Object} config - Configuration
 * @returns {Object} Collection comparison result
 */
function compareCollections(beforeData, afterData, config) {
    var result = {
        collectionsAdded: [],
        collectionsRemoved: [],
        collectionsChanged: [],
        changes: []
    };
    
    try {
        var beforeCollections = extractCollectionsFromJSON(beforeData);
        var afterCollections = extractCollectionsFromJSON(afterData);
        
        // Create collection maps by path
        var beforeCollMap = {};
        var afterCollMap = {};
        
        for (var i = 0; i < beforeCollections.length; i++) {
            beforeCollMap[beforeCollections[i].path] = beforeCollections[i];
        }
        
        for (var j = 0; j < afterCollections.length; j++) {
            afterCollMap[afterCollections[j].path] = afterCollections[j];
        }
        
        // Find added collections
        for (var afterPath in afterCollMap) {
            if (!beforeCollMap[afterPath]) {
                result.collectionsAdded.push(afterCollMap[afterPath]);
                result.changes.push({
                    type: 'collection',
                    field: 'added',
                    path: afterPath,
                    after: afterCollMap[afterPath].name,
                    significance: 'high'
                });
            }
        }
        
        // Find removed collections
        for (var beforePath in beforeCollMap) {
            if (!afterCollMap[beforePath]) {
                result.collectionsRemoved.push(beforeCollMap[beforePath]);
                result.changes.push({
                    type: 'collection',
                    field: 'removed',
                    path: beforePath,
                    before: beforeCollMap[beforePath].name,
                    significance: 'high'
                });
            }
        }
        
        // Compare detailed collection data if enabled
        if (config.detailedCollectionAnalysis) {
            var detailedDiffs = compareDetailedCollections(beforeData, afterData, config);
            result.changes = result.changes.concat(detailedDiffs);
        }
        
        return result;
        
    } catch (exc) {
        result.changes.push({
            type: 'error',
            field: 'collection_comparison',
            error: exc.message,
            significance: 'high'
        });
        return result;
    }
}

/**
 * Compare individual collections in detail
 * @param {Object} beforeData - Before DOM data
 * @param {Object} afterData - After DOM data
 * @param {Object} config - Configuration
 * @returns {Array} Array of detailed collection differences
 */
function compareDetailedCollections(beforeData, afterData, config) {
    var differences = [];
    
    try {
        // This would require detailed collection sampling data comparison
        // For now, return empty array as this is a complex comparison
        // that would need access to the actual sampling data
        
        return differences;
        
    } catch (exc) {
        differences.push({
            type: 'error',
            field: 'detailed_collection_comparison',
            error: exc.message,
            significance: 'medium'
        });
        return differences;
    }
}

// =============================================================================
// OBJECT REFERENCE COMPARISON
// =============================================================================

/**
 * Compare object references between DOM exports
 * @param {Object} beforeData - Before DOM data
 * @param {Object} afterData - After DOM data
 * @param {Object} config - Configuration
 * @returns {Object} Object reference comparison result
 */
function compareObjectReferences(beforeData, afterData, config) {
    var result = {
        referencesAdded: [],
        referencesRemoved: [],
        referencesChanged: [],
        pathChanges: [],
        changes: []
    };
    
    try {
        var beforeStructure = extractDOMStructure(beforeData);
        var afterStructure = extractDOMStructure(afterData);
        
        var beforeRegistry = beforeStructure.objectRegistry || {};
        var afterRegistry = afterStructure.objectRegistry || {};
        
        var beforeRefs = beforeRegistry.references || {};
        var afterRefs = afterRegistry.references || {};
        
        // Compare reference counts
        var beforeCount = Object.keys(beforeRefs).length;
        var afterCount = Object.keys(afterRefs).length;
        
        if (beforeCount !== afterCount) {
            result.changes.push({
                type: 'object_reference',
                field: 'reference_count',
                before: beforeCount,
                after: afterCount,
                significance: 'medium'
            });
        }
        
        // Compare access paths if available
        var beforePaths = beforeRegistry.accessPaths || {};
        var afterPaths = afterRegistry.accessPaths || {};
        
        if (config.trackObjectMovements) {
            var pathDiffs = compareAccessPaths(beforePaths, afterPaths);
            result.pathChanges = pathDiffs;
            
            for (var i = 0; i < pathDiffs.length; i++) {
                result.changes.push({
                    type: 'object_reference',
                    field: 'access_path',
                    objectId: pathDiffs[i].objectId,
                    before: pathDiffs[i].beforePaths,
                    after: pathDiffs[i].afterPaths,
                    significance: 'low'
                });
            }
        }
        
        return result;
        
    } catch (exc) {
        result.changes.push({
            type: 'error',
            field: 'object_reference_comparison',
            error: exc.message,
            significance: 'medium'
        });
        return result;
    }
}

/**
 * Compare access paths for objects
 * @param {Object} beforePaths - Before access paths
 * @param {Object} afterPaths - After access paths
 * @returns {Array} Array of path differences
 */
function compareAccessPaths(beforePaths, afterPaths) {
    var differences = [];
    
    try {
        // Find objects that changed paths
        for (var objectId in beforePaths) {
            if (afterPaths[objectId]) {
                var beforePathArray = beforePaths[objectId] || [];
                var afterPathArray = afterPaths[objectId] || [];
                
                if (beforePathArray.length !== afterPathArray.length) {
                    differences.push({
                        objectId: objectId,
                        type: 'path_count_changed',
                        beforePaths: beforePathArray,
                        afterPaths: afterPathArray
                    });
                } else {
                    // Check if any paths changed
                    var pathsChanged = false;
                    for (var i = 0; i < beforePathArray.length; i++) {
                        if (beforePathArray[i] !== afterPathArray[i]) {
                            pathsChanged = true;
                            break;
                        }
                    }
                    
                    if (pathsChanged) {
                        differences.push({
                            objectId: objectId,
                            type: 'paths_changed',
                            beforePaths: beforePathArray,
                            afterPaths: afterPathArray
                        });
                    }
                }
            }
        }
        
        return differences;
        
    } catch (exc) {
        return differences;
    }
}

// =============================================================================
// REPORT GENERATION
// =============================================================================

/**
 * Generate comprehensive comparison report
 * @param {Object} comparisonData - Comparison data
 * @param {Object} config - Configuration
 * @returns {String} Formatted comparison report
 */
function generateComparisonReport(comparisonData, config) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('DOM COMPARISON REPORT');
        builder.appendLine('====================');
        builder.appendLine('Generated: ' + getCurrentTimestamp());
        builder.appendLine('');
        
        // Summary
        builder.appendLine('SUMMARY');
        builder.appendLine('-------');
        builder.appendLine('Total Changes Detected: ' + comparisonData.totalChanges);
        
        if (config.highlightCriticalChanges) {
            var criticalCount = countCriticalChanges(comparisonData, config);
            builder.appendLine('Critical Changes: ' + criticalCount);
        }
        
        builder.appendLine('');
        
        // Detailed differences by category
        generateDetailedDifferencesSection(builder, comparisonData, config);
        
        return builder.toString();
        
    } catch (exc) {
        return 'Error generating comparison report: ' + exc.message;
    }
}

/**
 * Generate detailed differences section
 * @param {Object} builder - String builder
 * @param {Object} comparisonData - Comparison data
 * @param {Object} config - Configuration
 */
function generateDetailedDifferencesSection(builder, comparisonData, config) {
    try {
        builder.appendLine('DETAILED DIFFERENCES');
        builder.appendLine('===================');
        
        // Metadata changes
        if (comparisonData.metadata && comparisonData.metadata.changes.length > 0) {
            builder.appendLine('');
            builder.appendLine('METADATA CHANGES');
            builder.appendLine('---------------');
            
            for (var i = 0; i < comparisonData.metadata.changes.length; i++) {
                var change = comparisonData.metadata.changes[i];
                builder.appendLine('• ' + change.field + ': ' + (change.before || 'none') + ' → ' + (change.after || 'none'));
            }
        }
        
        // Structural changes
        if (comparisonData.structural && comparisonData.structural.changes.length > 0) {
            builder.appendLine('');
            builder.appendLine('STRUCTURAL CHANGES');
            builder.appendLine('-----------------');
            
            var maxStructuralChanges = Math.min(comparisonData.structural.changes.length, 20);
            for (var j = 0; j < maxStructuralChanges; j++) {
                var structChange = comparisonData.structural.changes[j];
                builder.appendLine('• ' + structChange.field + ' at ' + (structChange.path || 'root'));
                if (structChange.before && structChange.after) {
                    builder.appendLine('  ' + structChange.before + ' → ' + structChange.after);
                }
            }
            
            if (comparisonData.structural.changes.length > 20) {
                builder.appendLine('... and ' + (comparisonData.structural.changes.length - 20) + ' more structural changes');
            }
        }
        
        // Property changes
        if (comparisonData.properties && comparisonData.properties.changes.length > 0) {
            builder.appendLine('');
            builder.appendLine('PROPERTY CHANGES');
            builder.appendLine('---------------');
            builder.appendLine('Properties Added: ' + comparisonData.properties.propertiesAdded.length);
            builder.appendLine('Properties Removed: ' + comparisonData.properties.propertiesRemoved.length);
            builder.appendLine('Properties Changed: ' + comparisonData.properties.propertiesChanged.length);
        }
        
        // Collection changes
        if (comparisonData.collections && comparisonData.collections.changes.length > 0) {
            builder.appendLine('');
            builder.appendLine('COLLECTION CHANGES');
            builder.appendLine('-----------------');
            builder.appendLine('Collections Added: ' + comparisonData.collections.collectionsAdded.length);
            builder.appendLine('Collections Removed: ' + comparisonData.collections.collectionsRemoved.length);
        }
        
        builder.appendLine('');
        
    } catch (exc) {
        builder.appendLine('Error generating detailed differences: ' + exc.message);
        builder.appendLine('');
    }
}

// =============================================================================
// CHANGE ANALYSIS
// =============================================================================

/**
 * Count critical changes in comparison data
 * @param {Object} comparisonData - Comparison data
 * @param {Object} config - Configuration
 * @returns {Number} Count of critical changes
 */
function countCriticalChanges(comparisonData, config) {
    var criticalCount = 0;
    
    try {
        var allChanges = getAllChanges(comparisonData);
        
        for (var i = 0; i < allChanges.length; i++) {
            var change = allChanges[i];
            if (change.significance === 'high') {
                criticalCount++;
            }
        }
        
        return criticalCount;
        
    } catch (exc) {
        return 0;
    }
}

/**
 * Generate change recommendations based on comparison data
 * @param {Object} comparisonData - Comparison data
 * @param {Object} config - Configuration
 * @returns {Array} Array of recommendations
 */
function generateChangeRecommendations(comparisonData, config) {
    var recommendations = [];
    
    try {
        if (comparisonData.totalChanges === 0) {
            recommendations.push({
                type: 'info',
                message: 'No changes detected between the two DOM exports',
                priority: 'low'
            });
            return recommendations;
        }
        
        var criticalCount = countCriticalChanges(comparisonData, config);
        
        if (criticalCount > 0) {
            recommendations.push({
                type: 'warning',
                message: 'Critical structural changes detected. Review document modifications.',
                priority: 'high'
            });
        }
        
        if (comparisonData.structural && comparisonData.structural.nodeCountChanged) {
            recommendations.push({
                type: 'info',
                message: 'Document structure has changed. Check for added or removed elements.',
                priority: 'medium'
            });
        }
        
        if (comparisonData.collections && 
            (comparisonData.collections.collectionsAdded.length > 0 || 
             comparisonData.collections.collectionsRemoved.length > 0)) {
            recommendations.push({
                type: 'info',
                message: 'Collections have been added or removed. Update collection access code.',
                priority: 'medium'
            });
        }
        
        return recommendations;
        
    } catch (exc) {
        recommendations.push({
            type: 'error',
            message: 'Error generating recommendations: ' + exc.message,
            priority: 'low'
        });
        return recommendations;
    }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Extract DOM structure from data
 * @param {Object} data - JSON data
 * @returns {Object} DOM structure
 */
function extractDOMStructure(data) {
    try {
        return data.domStructure || data;
    } catch (exc) {
        return {};
    }
}

/**
 * Extract all properties from DOM data
 * @param {Object} data - DOM data
 * @returns {Array} Array of all properties
 */
function extractAllProperties(data) {
    var properties = [];
    
    try {
        var domStructure = extractDOMStructure(data);
        
        if (domStructure.structure && domStructure.structure.document) {
            extractPropertiesFromNode(domStructure.structure.document, properties);
        }
        
        return properties;
        
    } catch (exc) {
        return [];
    }
}

/**
 * Recursively extract properties from a node
 * @param {Object} node - DOM node
 * @param {Array} properties - Array to populate
 */
function extractPropertiesFromNode(node, properties) {
    try {
        if (!node) {
            return;
        }
        
        if (node.properties) {
            for (var i = 0; i < node.properties.length; i++) {
                properties.push(node.properties[i]);
            }
        }
        
        if (node.collections) {
            for (var j = 0; j < node.collections.length; j++) {
                properties.push(node.collections[j]);
            }
        }
        
        if (node.methods) {
            for (var k = 0; k < node.methods.length; k++) {
                properties.push(node.methods[k]);
            }
        }
        
        if (node.childNodes) {
            for (var l = 0; l < node.childNodes.length; l++) {
                extractPropertiesFromNode(node.childNodes[l], properties);
            }
        }
        
    } catch (exc) {
        // Continue processing
    }
}

/**
 * Get all changes from comparison data
 * @param {Object} comparisonData - Comparison data
 * @returns {Array} Array of all changes
 */
function getAllChanges(comparisonData) {
    var allChanges = [];
    
    try {
        if (comparisonData.metadata && comparisonData.metadata.changes) {
            allChanges = allChanges.concat(comparisonData.metadata.changes);
        }
        
        if (comparisonData.structural && comparisonData.structural.changes) {
            allChanges = allChanges.concat(comparisonData.structural.changes);
        }
        
        if (comparisonData.properties && comparisonData.properties.changes) {
            allChanges = allChanges.concat(comparisonData.properties.changes);
        }
        
        if (comparisonData.collections && comparisonData.collections.changes) {
            allChanges = allChanges.concat(comparisonData.collections.changes);
        }
        
        if (comparisonData.objectReferences && comparisonData.objectReferences.changes) {
            allChanges = allChanges.concat(comparisonData.objectReferences.changes);
        }
        
        return allChanges;
        
    } catch (exc) {
        return [];
    }
}

/**
 * Count total changes in comparison data
 * @param {Object} comparisonData - Comparison data
 * @returns {Number} Total change count
 */
function countTotalChanges(comparisonData) {
    try {
        var allChanges = getAllChanges(comparisonData);
        return allChanges.length;
    } catch (exc) {
        return 0;
    }
}

/**
 * Get change types from comparison data
 * @param {Object} comparisonData - Comparison data
 * @returns {Array} Array of change type names
 */
function getChangeTypes(comparisonData) {
    var types = [];
    
    try {
        if (comparisonData.metadata && comparisonData.metadata.changes.length > 0) {
            types.push('metadata');
        }
        if (comparisonData.structural && comparisonData.structural.changes.length > 0) {
            types.push('structural');
        }
        if (comparisonData.properties && comparisonData.properties.changes.length > 0) {
            types.push('properties');
        }
        if (comparisonData.collections && comparisonData.collections.changes.length > 0) {
            types.push('collections');
        }
        if (comparisonData.objectReferences && comparisonData.objectReferences.changes.length > 0) {
            types.push('objectReferences');
        }
        
        return types;
        
    } catch (exc) {
        return [];
    }
}

/**
 * Merge comparison configuration
 * @param {Object} defaults - Default configuration
 * @param {Object} userOptions - User options
 * @returns {Object} Merged configuration
 */
function mergeComparisonConfig(defaults, userOptions) {
    var merged = {};
    
    // Copy defaults
    for (var key in defaults) {
        merged[key] = defaults[key];
    }
    
    // Override with user options
    if (userOptions) {
        for (var key in userOptions) {
            merged[key] = userOptions[key];
        }
    }
    
    return merged;
}

// =============================================================================
// UI INTEGRATION
// =============================================================================

/**
 * Show DOM comparator interface
 * @returns {Boolean} True if interface shown successfully
 */
function showDOMComparator() {
    try {
        // This would integrate with the main UI system
        // For now, return true to indicate the function exists
        return true;
        
    } catch (exc) {
        return false;
    }
}

// =============================================================================
// END OF 7.0_dom-comparator.jsx
// =============================================================================