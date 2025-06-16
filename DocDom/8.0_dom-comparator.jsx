//
// 8.0_dom-comparator.jsx
// InDesign DOM Discovery Builder - DOM Structure Comparison Engine
// CORE PURPOSE: Compare before/after JSON exports to identify document changes
// DEPENDENCIES: 1.0_safe-foundation.jsx, 7.0_json-analyzer.jsx
// SAFETY: Safe file operations and comparison algorithms only
// ES3 COMPATIBLE: No reserved words, no modern JS features
// USAGE: Load two JSON exports and generate comprehensive difference reports
//

// ============================================================================
// DOM COMPARATOR CONFIGURATION
// ============================================================================

var DOM_COMPARATOR_CONFIG = {
    enableStructuralComparison: true,      // Compare DOM structure changes
    enablePropertyComparison: true,        // Compare property-level changes
    enableCollectionComparison: true,      // Compare collection changes
    enableValueComparison: false,          // Compare actual property values (if available)
    enableObjectReferenceComparison: true, // Compare object reference changes
    maxDifferencesToReport: 100,           // Limit differences reported per category
    ignoreTimestampDifferences: true,      // Ignore timestamp-only changes
    ignoreTrivialChanges: true,            // Ignore minor formatting changes
    highlightCriticalChanges: true,        // Highlight major structural changes
    generateChangeRecommendations: true,   // Generate developer recommendations
    includeUnchangedSummary: false,        // Include summary of unchanged items
    detailedCollectionAnalysis: true,      // Detailed analysis of collection changes
    trackObjectMovements: true,            // Track when objects move between paths
    compareMetadata: true,                 // Compare document metadata changes
    generateDiffStats: true                // Generate statistical comparison data
};

// ============================================================================
// MAIN COMPARISON FUNCTIONS
// ============================================================================

/**
 * Compare two DOM JSON exports and generate comprehensive difference report
 * @param {String} beforeJSONPath - Path to "before" JSON export
 * @param {String} afterJSONPath - Path to "after" JSON export
 * @param {Object} comparisonOptions - Comparison configuration options
 * @returns {Object} - {success: boolean, comparison: object, error: string}
 */
function compareDOMExports(beforeJSONPath, afterJSONPath, comparisonOptions) {
    var result = {
        success: false,
        comparison: null,
        error: ''
    };
    
    try {
        $.writeln('Starting DOM export comparison...');
        $.writeln('Before: ' + beforeJSONPath);
        $.writeln('After: ' + afterJSONPath);
        
        // Merge configuration
        var config = mergeDOMComparisonConfig(DOM_COMPARATOR_CONFIG, comparisonOptions);
        
        // Load both JSON files
        var beforeData = readAndParseJSONFile(beforeJSONPath);
        if (!beforeData.success) {
            result.error = 'Failed to load before JSON: ' + beforeData.error;
            return result;
        }
        
        var afterData = readAndParseJSONFile(afterJSONPath);
        if (!afterData.success) {
            result.error = 'Failed to load after JSON: ' + afterData.error;
            return result;
        }
        
        $.writeln('Both JSON files loaded successfully, starting comparison...');
        
        // Perform comprehensive comparison
        var comparisonResult = performComprehensiveDOMComparison(
            beforeData.data, 
            afterData.data, 
            config
        );
        
        if (comparisonResult.success) {
            result.success = true;
            result.comparison = comparisonResult.comparisonData;
            
            $.writeln('DOM comparison complete:');
            $.writeln('  Total changes detected: ' + (result.comparison.summary.totalChanges || 0));
            $.writeln('  Structural changes: ' + (result.comparison.summary.structuralChanges || 0));
            $.writeln('  Property changes: ' + (result.comparison.summary.propertyChanges || 0));
            $.writeln('  Collection changes: ' + (result.comparison.summary.collectionChanges || 0));
        } else {
            result.error = 'Comparison failed: ' + comparisonResult.error;
        }
        
    } catch (exc) {
        result.error = 'DOM comparison exception: ' + exc.message;
        $.writeln('ERROR: DOM comparison failed: ' + exc.message);
    }
    
    return result;
}

/**
 * Perform comprehensive comparison between two DOM structures
 * @param {Object} beforeData - Before JSON data
 * @param {Object} afterData - After JSON data
 * @param {Object} config - Comparison configuration
 * @returns {Object} - {success: boolean, comparisonData: object, error: string}
 */
function performComprehensiveDOMComparison(beforeData, afterData, config) {
    var result = {
        success: false,
        comparisonData: null,
        error: ''
    };
    
    try {
        var comparisonData = {
            timestamp: getCurrentTimestamp(),
            beforeSource: {
                documentName: beforeData.metadata ? beforeData.metadata.documentName : 'Unknown',
                timestamp: beforeData.metadata ? beforeData.metadata.timestamp : 'Unknown',
                fingerprint: beforeData.enhancedExportData ? beforeData.enhancedExportData.comparisonFingerprint : 'none'
            },
            afterSource: {
                documentName: afterData.metadata ? afterData.metadata.documentName : 'Unknown',
                timestamp: afterData.metadata ? afterData.metadata.timestamp : 'Unknown',
                fingerprint: afterData.enhancedExportData ? afterData.enhancedExportData.comparisonFingerprint : 'none'
            },
            summary: {
                totalChanges: 0,
                structuralChanges: 0,
                propertyChanges: 0,
                collectionChanges: 0,
                objectReferenceChanges: 0,
                metadataChanges: 0,
                criticalChanges: 0,
                unchanged: 0
            },
            differences: {
                structural: [],
                properties: [],
                collections: [],
                objectReferences: [],
                metadata: []
            },
            analysis: {
                addedElements: [],
                removedElements: [],
                modifiedElements: [],
                movedElements: []
            },
            recommendations: []
        };
        
        // Compare metadata if enabled
        if (config.compareMetadata) {
            var metadataComparison = compareMetadata(beforeData.metadata, afterData.metadata, config);
            comparisonData.differences.metadata = metadataComparison.differences;
            comparisonData.summary.metadataChanges = metadataComparison.differences.length;
        }
        
        // Compare structural elements
        if (config.enableStructuralComparison) {
            var structuralComparison = compareStructuralElements(
                beforeData.structure, 
                afterData.structure, 
                config
            );
            comparisonData.differences.structural = structuralComparison.differences;
            comparisonData.summary.structuralChanges = structuralComparison.differences.length;
            comparisonData.analysis.addedElements = structuralComparison.added;
            comparisonData.analysis.removedElements = structuralComparison.removed;
        }
        
        // Compare properties
        if (config.enablePropertyComparison) {
            var propertyComparison = compareProperties(beforeData, afterData, config);
            comparisonData.differences.properties = propertyComparison.differences;
            comparisonData.summary.propertyChanges = propertyComparison.differences.length;
        }
        
        // Compare collections
        if (config.enableCollectionComparison) {
            var collectionComparison = compareCollections(beforeData, afterData, config);
            comparisonData.differences.collections = collectionComparison.differences;
            comparisonData.summary.collectionChanges = collectionComparison.differences.length;
        }
        
        // Compare object references
        if (config.enableObjectReferenceComparison) {
            var objectRefComparison = compareObjectReferences(beforeData, afterData, config);
            comparisonData.differences.objectReferences = objectRefComparison.differences;
            comparisonData.summary.objectReferenceChanges = objectRefComparison.differences.length;
        }
        
        // Calculate total changes
        comparisonData.summary.totalChanges = 
            comparisonData.summary.structuralChanges +
            comparisonData.summary.propertyChanges +
            comparisonData.summary.collectionChanges +
            comparisonData.summary.objectReferenceChanges +
            comparisonData.summary.metadataChanges;
        
        // Generate recommendations
        if (config.generateChangeRecommendations) {
            comparisonData.recommendations = generateChangeRecommendations(comparisonData, config);
        }
        
        // Calculate critical changes
        comparisonData.summary.criticalChanges = countCriticalChanges(comparisonData, config);
        
        result.success = true;
        result.comparisonData = comparisonData;
        
    } catch (exc) {
        result.error = 'Comprehensive comparison failed: ' + exc.message;
    }
    
    return result;
}

// ============================================================================
// METADATA COMPARISON
// ============================================================================

/**
 * Compare metadata between two DOM exports
 * @param {Object} beforeMeta - Before metadata
 * @param {Object} afterMeta - After metadata
 * @param {Object} config - Comparison configuration
 * @returns {Object} - Metadata comparison result
 */
function compareMetadata(beforeMeta, afterMeta, config) {
    var result = {
        differences: [],
        added: [],
        removed: [],
        modified: []
    };
    
    try {
        if (!beforeMeta && !afterMeta) {
            return result;
        }
        
        if (!beforeMeta && afterMeta) {
            result.differences.push({
                type: 'metadata_added',
                description: 'Metadata section added',
                severity: 'low',
                path: 'metadata'
            });
            return result;
        }
        
        if (beforeMeta && !afterMeta) {
            result.differences.push({
                type: 'metadata_removed',
                description: 'Metadata section removed',
                severity: 'medium',
                path: 'metadata'
            });
            return result;
        }
        
        // Compare specific metadata fields
        var metadataFields = ['documentName', 'version', 'enumerationTime'];
        
        for (var i = 0; i < metadataFields.length; i++) {
            var field = metadataFields[i];
            var beforeValue = beforeMeta[field];
            var afterValue = afterMeta[field];
            
            if (beforeValue !== afterValue) {
                // Skip timestamp differences if configured
                if (config.ignoreTimestampDifferences && 
                    (field === 'timestamp' || field === 'enumerationTime')) {
                    continue;
                }
                
                result.differences.push({
                    type: 'metadata_changed',
                    field: field,
                    description: 'Metadata field "' + field + '" changed',
                    before: beforeValue,
                    after: afterValue,
                    severity: field === 'documentName' ? 'high' : 'low',
                    path: 'metadata.' + field
                });
            }
        }
        
        // Compare enhanced features
        if (beforeMeta.enhancedFeatures && afterMeta.enhancedFeatures) {
            var featureComparison = compareObjects(
                beforeMeta.enhancedFeatures, 
                afterMeta.enhancedFeatures,
                'metadata.enhancedFeatures'
            );
            result.differences = result.differences.concat(featureComparison);
        }
        
    } catch (exc) {
        result.differences.push({
            type: 'comparison_error',
            description: 'Error comparing metadata: ' + exc.message,
            severity: 'medium'
        });
    }
    
    return result;
}

// ============================================================================
// STRUCTURAL COMPARISON
// ============================================================================

/**
 * Compare structural elements between DOM exports
 * @param {Object} beforeStructure - Before structure
 * @param {Object} afterStructure - After structure  
 * @param {Object} config - Comparison configuration
 * @returns {Object} - Structural comparison result
 */
function compareStructuralElements(beforeStructure, afterStructure, config) {
    var result = {
        differences: [],
        added: [],
        removed: [],
        modified: []
    };
    
    try {
        if (!beforeStructure && !afterStructure) {
            return result;
        }
        
        if (!beforeStructure.document && !afterStructure.document) {
            return result;
        }
        
        // Compare document structure
        if (beforeStructure.document && afterStructure.document) {
            var docComparison = compareNodes(
                beforeStructure.document,
                afterStructure.document,
                'document',
                config
            );
            
            result.differences = result.differences.concat(docComparison.differences);
            result.added = result.added.concat(docComparison.added);
            result.removed = result.removed.concat(docComparison.removed);
            result.modified = result.modified.concat(docComparison.modified);
        } else if (!beforeStructure.document) {
            result.added.push({
                type: 'node_added',
                path: 'document',
                description: 'Document structure added',
                severity: 'high'
            });
        } else if (!afterStructure.document) {
            result.removed.push({
                type: 'node_removed',
                path: 'document',
                description: 'Document structure removed',
                severity: 'critical'
            });
        }
        
    } catch (exc) {
        result.differences.push({
            type: 'structural_comparison_error',
            description: 'Error comparing structural elements: ' + exc.message,
            severity: 'medium'
        });
    }
    
    return result;
}

/**
 * Compare two DOM nodes recursively
 * @param {Object} beforeNode - Before node
 * @param {Object} afterNode - After node
 * @param {String} nodePath - Current node path
 * @param {Object} config - Comparison configuration
 * @returns {Object} - Node comparison result
 */
function compareNodes(beforeNode, afterNode, nodePath, config) {
    var result = {
        differences: [],
        added: [],
        removed: [],
        modified: []
    };
    
    try {
        if (!beforeNode && !afterNode) {
            return result;
        }
        
        if (!beforeNode && afterNode) {
            result.added.push({
                type: 'node_added',
                path: nodePath,
                name: afterNode.name,
                nodeType: afterNode.type,
                description: 'Node "' + afterNode.name + '" added',
                severity: 'medium'
            });
            return result;
        }
        
        if (beforeNode && !afterNode) {
            result.removed.push({
                type: 'node_removed',
                path: nodePath,
                name: beforeNode.name,
                nodeType: beforeNode.type,
                description: 'Node "' + beforeNode.name + '" removed',
                severity: 'medium'
            });
            return result;
        }
        
        // Compare node properties
        if (beforeNode.name !== afterNode.name) {
            result.differences.push({
                type: 'node_renamed',
                path: nodePath,
                description: 'Node renamed from "' + beforeNode.name + '" to "' + afterNode.name + '"',
                before: beforeNode.name,
                after: afterNode.name,
                severity: 'medium'
            });
        }
        
        if (beforeNode.type !== afterNode.type) {
            result.differences.push({
                type: 'node_type_changed',
                path: nodePath,
                description: 'Node type changed from "' + beforeNode.type + '" to "' + afterNode.type + '"',
                before: beforeNode.type,
                after: afterNode.type,
                severity: 'high'
            });
        }
        
        // Compare properties arrays
        var propComparison = comparePropertyArrays(
            beforeNode.properties || [],
            afterNode.properties || [],
            nodePath + '.properties',
            config
        );
        result.differences = result.differences.concat(propComparison);
        
        // Compare collections arrays
        var collComparison = comparePropertyArrays(
            beforeNode.collections || [],
            afterNode.collections || [],
            nodePath + '.collections',
            config
        );
        result.differences = result.differences.concat(collComparison);
        
        // Compare child nodes
        if (beforeNode.childNodes || afterNode.childNodes) {
            var childComparison = compareChildNodes(
                beforeNode.childNodes || [],
                afterNode.childNodes || [],
                nodePath,
                config
            );
            result.differences = result.differences.concat(childComparison.differences);
            result.added = result.added.concat(childComparison.added);
            result.removed = result.removed.concat(childComparison.removed);
        }
        
    } catch (exc) {
        result.differences.push({
            type: 'node_comparison_error',
            path: nodePath,
            description: 'Error comparing nodes: ' + exc.message,
            severity: 'medium'
        });
    }
    
    return result;
}

/**
 * Compare arrays of properties or collections
 * @param {Array} beforeArray - Before property array
 * @param {Array} afterArray - After property array
 * @param {String} arrayPath - Path to array
 * @param {Object} config - Comparison configuration
 * @returns {Array} - Array of differences
 */
function comparePropertyArrays(beforeArray, afterArray, arrayPath, config) {
    var differences = [];
    
    try {
        // Create maps for easier comparison
        var beforeMap = {};
        var afterMap = {};
        
        for (var i = 0; i < beforeArray.length; i++) {
            var prop = beforeArray[i];
            if (prop.name) {
                beforeMap[prop.name] = prop;
            }
        }
        
        for (var i = 0; i < afterArray.length; i++) {
            var prop = afterArray[i];
            if (prop.name) {
                afterMap[prop.name] = prop;
            }
        }
        
        // Find added properties
        for (var propName in afterMap) {
            if (!beforeMap[propName]) {
                differences.push({
                    type: 'property_added',
                    path: arrayPath + '.' + propName,
                    name: propName,
                    description: 'Property "' + propName + '" added',
                    propertyType: afterMap[propName].type,
                    safetyLevel: afterMap[propName].safetyLevel,
                    severity: 'low'
                });
            }
        }
        
        // Find removed properties
        for (var propName in beforeMap) {
            if (!afterMap[propName]) {
                differences.push({
                    type: 'property_removed',
                    path: arrayPath + '.' + propName,
                    name: propName,
                    description: 'Property "' + propName + '" removed',
                    propertyType: beforeMap[propName].type,
                    safetyLevel: beforeMap[propName].safetyLevel,
                    severity: 'medium'
                });
            }
        }
        
        // Find modified properties
        for (var propName in beforeMap) {
            if (afterMap[propName]) {
                var beforeProp = beforeMap[propName];
                var afterProp = afterMap[propName];
                
                if (beforeProp.type !== afterProp.type) {
                    differences.push({
                        type: 'property_type_changed',
                        path: arrayPath + '.' + propName,
                        name: propName,
                        description: 'Property "' + propName + '" type changed',
                        before: beforeProp.type,
                        after: afterProp.type,
                        severity: 'high'
                    });
                }
                
                if (beforeProp.safetyLevel !== afterProp.safetyLevel) {
                    differences.push({
                        type: 'property_safety_changed',
                        path: arrayPath + '.' + propName,
                        name: propName,
                        description: 'Property "' + propName + '" safety level changed',
                        before: beforeProp.safetyLevel,
                        after: afterProp.safetyLevel,
                        severity: 'medium'
                    });
                }
                
                // Compare sample values if available and enabled
                if (config.enableValueComparison && 
                    beforeProp.hasSampleValue && afterProp.hasSampleValue) {
                    if (beforeProp.sampleValue !== afterProp.sampleValue) {
                        differences.push({
                            type: 'property_value_changed',
                            path: arrayPath + '.' + propName,
                            name: propName,
                            description: 'Property "' + propName + '" value changed',
                            before: beforeProp.sampleValue,
                            after: afterProp.sampleValue,
                            severity: 'low'
                        });
                    }
                }
            }
        }
        
    } catch (exc) {
        differences.push({
            type: 'property_array_comparison_error',
            path: arrayPath,
            description: 'Error comparing property arrays: ' + exc.message,
            severity: 'medium'
        });
    }
    
    return differences;
}

/**
 * Compare child node arrays
 * @param {Array} beforeChildren - Before child nodes
 * @param {Array} afterChildren - After child nodes
 * @param {String} parentPath - Parent node path
 * @param {Object} config - Comparison configuration
 * @returns {Object} - Child comparison result
 */
function compareChildNodes(beforeChildren, afterChildren, parentPath, config) {
    var result = {
        differences: [],
        added: [],
        removed: []
    };
    
    try {
        // Create maps for child comparison
        var beforeChildMap = {};
        var afterChildMap = {};
        
        for (var i = 0; i < beforeChildren.length; i++) {
            var child = beforeChildren[i];
            if (child.name) {
                beforeChildMap[child.name] = child;
            }
        }
        
        for (var i = 0; i < afterChildren.length; i++) {
            var child = afterChildren[i];
            if (child.name) {
                afterChildMap[child.name] = child;
            }
        }
        
        // Find added children
        for (var childName in afterChildMap) {
            if (!beforeChildMap[childName]) {
                result.added.push({
                    type: 'child_node_added',
                    path: parentPath + '.' + childName,
                    name: childName,
                    description: 'Child node "' + childName + '" added',
                    severity: 'medium'
                });
            }
        }
        
        // Find removed children
        for (var childName in beforeChildMap) {
            if (!afterChildMap[childName]) {
                result.removed.push({
                    type: 'child_node_removed',
                    path: parentPath + '.' + childName,
                    name: childName,
                    description: 'Child node "' + childName + '" removed',
                    severity: 'medium'
                });
            }
        }
        
        // Recursively compare common children (limit depth to prevent infinite recursion)
        var currentDepth = (parentPath.split('.').length - 1);
        if (currentDepth < 4) { // Limit recursive depth
            for (var childName in beforeChildMap) {
                if (afterChildMap[childName]) {
                    var childComparison = compareNodes(
                        beforeChildMap[childName],
                        afterChildMap[childName],
                        parentPath + '.' + childName,
                        config
                    );
                    result.differences = result.differences.concat(childComparison.differences);
                    result.added = result.added.concat(childComparison.added);
                    result.removed = result.removed.concat(childComparison.removed);
                }
            }
        }
        
    } catch (exc) {
        result.differences.push({
            type: 'child_comparison_error',
            path: parentPath,
            description: 'Error comparing child nodes: ' + exc.message,
            severity: 'medium'
        });
    }
    
    return result;
}

// ============================================================================
// COLLECTION COMPARISON
// ============================================================================

/**
 * Compare collections between DOM exports
 * @param {Object} beforeData - Before DOM data
 * @param {Object} afterData - After DOM data
 * @param {Object} config - Comparison configuration
 * @returns {Object} - Collection comparison result
 */
function compareCollections(beforeData, afterData, config) {
    var result = {
        differences: []
    };
    
    try {
        // Extract collection sampling data
        var beforeSampling = beforeData.metadata ? beforeData.metadata.collectionSampling : null;
        var afterSampling = afterData.metadata ? afterData.metadata.collectionSampling : null;
        
        if (!beforeSampling && !afterSampling) {
            return result;
        }
        
        if (!beforeSampling && afterSampling) {
            result.differences.push({
                type: 'collection_sampling_added',
                description: 'Collection sampling data added',
                severity: 'low'
            });
            return result;
        }
        
        if (beforeSampling && !afterSampling) {
            result.differences.push({
                type: 'collection_sampling_removed',
                description: 'Collection sampling data removed',
                severity: 'medium'
            });
            return result;
        }
        
        // Compare collection statistics
        if (beforeSampling.stats && afterSampling.stats) {
            var beforeStats = beforeSampling.stats;
            var afterStats = afterSampling.stats;
            
            if (beforeStats.collectionsFound !== afterStats.collectionsFound) {
                result.differences.push({
                    type: 'collection_count_changed',
                    description: 'Number of collections changed',
                    before: beforeStats.collectionsFound,
                    after: afterStats.collectionsFound,
                    severity: 'medium'
                });
            }
            
            if (beforeStats.totalItemsSampled !== afterStats.totalItemsSampled) {
                result.differences.push({
                    type: 'collection_items_changed',
                    description: 'Total collection items changed',
                    before: beforeStats.totalItemsSampled,
                    after: afterStats.totalItemsSampled,
                    severity: 'medium'
                });
            }
            
            if (beforeStats.totalPropertiesDiscovered !== afterStats.totalPropertiesDiscovered) {
                result.differences.push({
                    type: 'collection_properties_changed',
                    description: 'Collection properties discovered changed',
                    before: beforeStats.totalPropertiesDiscovered,
                    after: afterStats.totalPropertiesDiscovered,
                    severity: 'low'
                });
            }
        }
        
        // Compare individual collections if detailed analysis is enabled
        if (config.detailedCollectionAnalysis) {
            var detailedComparison = compareDetailedCollections(beforeData, afterData, config);
            result.differences = result.differences.concat(detailedComparison);
        }
        
    } catch (exc) {
        result.differences.push({
            type: 'collection_comparison_error',
            description: 'Error comparing collections: ' + exc.message,
            severity: 'medium'
        });
    }
    
    return result;
}

/**
 * Compare individual collections in detail
 * @param {Object} beforeData - Before DOM data
 * @param {Object} afterData - After DOM data
 * @param {Object} config - Comparison configuration
 * @returns {Array} - Array of detailed collection differences
 */
function compareDetailedCollections(beforeData, afterData, config) {
    var differences = [];
    
    try {
        // Extract collections from both structures
        var beforeCollections = extractAllCollections(beforeData.structure);
        var afterCollections = extractAllCollections(afterData.structure);
        
        // Create maps for comparison
        var beforeCollMap = {};
        var afterCollMap = {};
        
        for (var i = 0; i < beforeCollections.length; i++) {
            var coll = beforeCollections[i];
            beforeCollMap[coll.path] = coll;
        }
        
        for (var i = 0; i < afterCollections.length; i++) {
            var coll = afterCollections[i];
            afterCollMap[coll.path] = coll;
        }
        
        // Find added collections
        for (var collPath in afterCollMap) {
            if (!beforeCollMap[collPath]) {
                differences.push({
                    type: 'collection_added',
                    path: collPath,
                    name: afterCollMap[collPath].name,
                    description: 'Collection "' + afterCollMap[collPath].name + '" added',
                    severity: 'medium'
                });
            }
        }
        
        // Find removed collections
        for (var collPath in beforeCollMap) {
            if (!afterCollMap[collPath]) {
                differences.push({
                    type: 'collection_removed',
                    path: collPath,
                    name: beforeCollMap[collPath].name,
                    description: 'Collection "' + beforeCollMap[collPath].name + '" removed',
                    severity: 'medium'
                });
            }
        }
        
        // Compare common collections
        for (var collPath in beforeCollMap) {
            if (afterCollMap[collPath]) {
                var beforeColl = beforeCollMap[collPath];
                var afterColl = afterCollMap[collPath];
                
                // Compare collection length if sampling data available
                if (beforeColl.samplingData && afterColl.samplingData) {
                    var beforeLength = beforeColl.samplingData.collectionLength;
                    var afterLength = afterColl.samplingData.collectionLength;
                    
                    if (beforeLength !== afterLength) {
                        differences.push({
                            type: 'collection_length_changed',
                            path: collPath,
                            name: beforeColl.name,
                            description: 'Collection "' + beforeColl.name + '" length changed',
                            before: beforeLength,
                            after: afterLength,
                            severity: 'medium'
                        });
                    }
                    
                    // Compare common properties
                    var commonPropsComparison = compareCollectionCommonProperties(
                        beforeColl.samplingData.commonProperties || [],
                        afterColl.samplingData.commonProperties || [],
                        collPath
                    );
                    differences = differences.concat(commonPropsComparison);
                }
            }
        }
        
    } catch (exc) {
        differences.push({
            type: 'detailed_collection_comparison_error',
            description: 'Error in detailed collection comparison: ' + exc.message,
            severity: 'medium'
        });
    }
    
    return differences;
}

// ============================================================================
// OBJECT REFERENCE COMPARISON
// ============================================================================

/**
 * Compare object references between DOM exports
 * @param {Object} beforeData - Before DOM data
 * @param {Object} afterData - After DOM data
 * @param {Object} config - Comparison configuration
 * @returns {Object} - Object reference comparison result
 */
function compareObjectReferences(beforeData, afterData, config) {
    var result = {
        differences: []
    };
    
    try {
        var beforeRefs = beforeData.objectRegistry ? beforeData.objectRegistry.references : {};
        var afterRefs = afterData.objectRegistry ? afterData.objectRegistry.references : {};
        
        if (Object.keys(beforeRefs).length === 0 && Object.keys(afterRefs).length === 0) {
            return result;
        }
        
        // Find added object references
        for (var objId in afterRefs) {
            if (!beforeRefs[objId]) {
                result.differences.push({
                    type: 'object_reference_added',
                    objectId: objId,
                    description: 'Object reference "' + objId + '" added',
                    accessPaths: afterRefs[objId].accessPaths,
                    severity: 'low'
                });
            }
        }
        
        // Find removed object references
        for (var objId in beforeRefs) {
            if (!afterRefs[objId]) {
                result.differences.push({
                    type: 'object_reference_removed',
                    objectId: objId,
                    description: 'Object reference "' + objId + '" removed',
                    accessPaths: beforeRefs[objId].accessPaths,
                    severity: 'medium'
                });
            }
        }
        
        // Compare common object references
        for (var objId in beforeRefs) {
            if (afterRefs[objId]) {
                var beforeRef = beforeRefs[objId];
                var afterRef = afterRefs[objId];
                
                // Compare access paths
                if (config.trackObjectMovements) {
                    var pathComparison = compareAccessPaths(beforeRef.accessPaths, afterRef.accessPaths, objId);
                    if (pathComparison.length > 0) {
                        result.differences = result.differences.concat(pathComparison);
                    }
                }
                
                // Compare occurrence count
                if (beforeRef.occurrenceCount !== afterRef.occurrenceCount) {
                    result.differences.push({
                        type: 'object_occurrence_changed',
                        objectId: objId,
                        description: 'Object "' + objId + '" occurrence count changed',
                        before: beforeRef.occurrenceCount,
                        after: afterRef.occurrenceCount,
                        severity: 'low'
                    });
                }
            }
        }
        
    } catch (exc) {
        result.differences.push({
            type: 'object_reference_comparison_error',
            description: 'Error comparing object references: ' + exc.message,
            severity: 'medium'
        });
    }
    
    return result;
}

/**
 * Compare access paths for an object
 * @param {Array} beforePaths - Before access paths
 * @param {Array} afterPaths - After access paths
 * @param {String} objectId - Object identifier
 * @returns {Array} - Array of path differences
 */
function compareAccessPaths(beforePaths, afterPaths, objectId) {
    var differences = [];
    
    try {
        // Find added paths
        for (var i = 0; i < afterPaths.length; i++) {
            var path = afterPaths[i];
            if (beforePaths.indexOf(path) === -1) {
                differences.push({
                    type: 'object_path_added',
                    objectId: objectId,
                    path: path,
                    description: 'New access path "' + path + '" for object "' + objectId + '"',
                    severity: 'low'
                });
            }
        }
        
        // Find removed paths
        for (var i = 0; i < beforePaths.length; i++) {
            var path = beforePaths[i];
            if (afterPaths.indexOf(path) === -1) {
                differences.push({
                    type: 'object_path_removed',
                    objectId: objectId,
                    path: path,
                    description: 'Access path "' + path + '" removed for object "' + objectId + '"',
                    severity: 'medium'
                });
            }
        }
        
    } catch (exc) {
        differences.push({
            type: 'access_path_comparison_error',
            objectId: objectId,
            description: 'Error comparing access paths: ' + exc.message,
            severity: 'medium'
        });
    }
    
    return differences;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Compare two objects for differences
 * @param {Object} beforeObj - Before object
 * @param {Object} afterObj - After object
 * @param {String} basePath - Base path for differences
 * @returns {Array} - Array of differences
 */
function compareObjects(beforeObj, afterObj, basePath) {
    var differences = [];
    
    try {
        if (!beforeObj && !afterObj) {
            return differences;
        }
        
        if (!beforeObj && afterObj) {
            differences.push({
                type: 'object_added',
                path: basePath,
                description: 'Object added at "' + basePath + '"',
                severity: 'low'
            });
            return differences;
        }
        
        if (beforeObj && !afterObj) {
            differences.push({
                type: 'object_removed',
                path: basePath,
                description: 'Object removed from "' + basePath + '"',
                severity: 'medium'
            });
            return differences;
        }
        
        // Compare object properties
        var allKeys = {};
        for (var key in beforeObj) {
            allKeys[key] = true;
        }
        for (var key in afterObj) {
            allKeys[key] = true;
        }
        
        for (var key in allKeys) {
            var beforeValue = beforeObj[key];
            var afterValue = afterObj[key];
            var keyPath = basePath + '.' + key;
            
            if (beforeValue !== afterValue) {
                differences.push({
                    type: 'object_property_changed',
                    path: keyPath,
                    property: key,
                    description: 'Property "' + key + '" changed',
                    before: beforeValue,
                    after: afterValue,
                    severity: 'low'
                });
            }
        }
        
    } catch (exc) {
        differences.push({
            type: 'object_comparison_error',
            path: basePath,
            description: 'Error comparing objects: ' + exc.message,
            severity: 'medium'
        });
    }
    
    return differences;
}

/**
 * Extract all collections from DOM structure
 * @param {Object} structure - DOM structure
 * @returns {Array} - Array of all collections
 */
function extractAllCollections(structure) {
    var collections = [];
    
    try {
        if (structure && structure.document) {
            extractCollectionsFromStructureNode(structure.document, collections);
        }
    } catch (exc) {
        $.writeln('Error extracting collections from structure: ' + exc.message);
    }
    
    return collections;
}

/**
 * Recursively extract collections from structure node
 * @param {Object} node - Structure node
 * @param {Array} collections - Array to populate
 */
function extractCollectionsFromStructureNode(node, collections) {
    if (!node) return;
    
    try {
        if (node.collections) {
            for (var i = 0; i < node.collections.length; i++) {
                collections.push(node.collections[i]);
            }
        }
        
        if (node.childNodes) {
            for (var i = 0; i < node.childNodes.length; i++) {
                extractCollectionsFromStructureNode(node.childNodes[i], collections);
            }
        }
    } catch (exc) {
        // Continue extraction
    }
}

/**
 * Compare common properties of collections
 * @param {Array} beforeProps - Before common properties
 * @param {Array} afterProps - After common properties
 * @param {String} collectionPath - Collection path
 * @returns {Array} - Array of differences
 */
function compareCollectionCommonProperties(beforeProps, afterProps, collectionPath) {
    var differences = [];
    
    try {
        var beforePropMap = {};
        var afterPropMap = {};
        
        for (var i = 0; i < beforeProps.length; i++) {
            var prop = beforeProps[i];
            beforePropMap[prop.name] = prop;
        }
        
        for (var i = 0; i < afterProps.length; i++) {
            var prop = afterProps[i];
            afterPropMap[prop.name] = prop;
        }
        
        // Find added common properties
        for (var propName in afterPropMap) {
            if (!beforePropMap[propName]) {
                differences.push({
                    type: 'collection_common_property_added',
                    path: collectionPath,
                    propertyName: propName,
                    description: 'Common property "' + propName + '" added to collection',
                    severity: 'low'
                });
            }
        }
        
        // Find removed common properties
        for (var propName in beforePropMap) {
            if (!afterPropMap[propName]) {
                differences.push({
                    type: 'collection_common_property_removed',
                    path: collectionPath,
                    propertyName: propName,
                    description: 'Common property "' + propName + '" removed from collection',
                    severity: 'medium'
                });
            }
        }
        
    } catch (exc) {
        differences.push({
            type: 'collection_property_comparison_error',
            path: collectionPath,
            description: 'Error comparing collection common properties: ' + exc.message,
            severity: 'medium'
        });
    }
    
    return differences;
}

/**
 * Count critical changes in comparison data
 * @param {Object} comparisonData - Comparison data
 * @param {Object} config - Comparison configuration
 * @returns {Number} - Count of critical changes
 */
function countCriticalChanges(comparisonData, config) {
    var criticalCount = 0;
    
    try {
        var allDifferences = [];
        
        // Collect all differences
        if (comparisonData.differences.structural) {
            allDifferences = allDifferences.concat(comparisonData.differences.structural);
        }
        if (comparisonData.differences.properties) {
            allDifferences = allDifferences.concat(comparisonData.differences.properties);
        }
        if (comparisonData.differences.collections) {
            allDifferences = allDifferences.concat(comparisonData.differences.collections);
        }
        if (comparisonData.differences.objectReferences) {
            allDifferences = allDifferences.concat(comparisonData.differences.objectReferences);
        }
        if (comparisonData.differences.metadata) {
            allDifferences = allDifferences.concat(comparisonData.differences.metadata);
        }
        
        // Count critical severity changes
        for (var i = 0; i < allDifferences.length; i++) {
            var diff = allDifferences[i];
            if (diff.severity === 'critical' || diff.severity === 'high') {
                criticalCount++;
            }
        }
        
    } catch (exc) {
        $.writeln('Error counting critical changes: ' + exc.message);
    }
    
    return criticalCount;
}

/**
 * Generate change recommendations based on comparison data
 * @param {Object} comparisonData - Comparison data
 * @param {Object} config - Comparison configuration
 * @returns {Array} - Array of recommendations
 */
function generateChangeRecommendations(comparisonData, config) {
    var recommendations = [];
    
    try {
        // Analyze patterns in changes
        if (comparisonData.summary.structuralChanges > 5) {
            recommendations.push('Major structural changes detected - review document hierarchy carefully');
        }
        
        if (comparisonData.summary.collectionChanges > 3) {
            recommendations.push('Multiple collection changes - verify collection access patterns still work');
        }
        
        if (comparisonData.summary.criticalChanges > 0) {
            recommendations.push('Critical changes detected - thorough testing recommended before deployment');
        }
        
        if (comparisonData.summary.objectReferenceChanges > 10) {
            recommendations.push('Many object reference changes - check for object path modifications');
        }
        
        // Specific change type recommendations
        var hasPropertyTypeChanges = false;
        var hasCollectionLengthChanges = false;
        
        // Check for specific change types
        if (comparisonData.differences.properties) {
            for (var i = 0; i < comparisonData.differences.properties.length; i++) {
                var diff = comparisonData.differences.properties[i];
                if (diff.type === 'property_type_changed') {
                    hasPropertyTypeChanges = true;
                    break;
                }
            }
        }
        
        if (comparisonData.differences.collections) {
            for (var i = 0; i < comparisonData.differences.collections.length; i++) {
                var diff = comparisonData.differences.collections[i];
                if (diff.type === 'collection_length_changed') {
                    hasCollectionLengthChanges = true;
                    break;
                }
            }
        }
        
        if (hasPropertyTypeChanges) {
            recommendations.push('Property type changes detected - update code that depends on specific types');
        }
        
        if (hasCollectionLengthChanges) {
            recommendations.push('Collection length changes detected - verify iteration bounds in existing code');
        }
        
    } catch (exc) {
        recommendations.push('Error generating recommendations: ' + exc.message);
    }
    
    return recommendations;
}

/**
 * Merge DOM comparison configuration
 * @param {Object} defaults - Default configuration
 * @param {Object} userOptions - User options
 * @returns {Object} - Merged configuration
 */
function mergeDOMComparisonConfig(defaults, userOptions) {
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

// ============================================================================
// REPORT GENERATION
// ============================================================================

/**
 * Generate comprehensive comparison report
 * @param {Object} comparisonData - Comparison data
 * @param {Object} config - Comparison configuration
 * @returns {String} - Formatted comparison report
 */
function generateComparisonReport(comparisonData, config) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('INDESIGN DOM COMPARISON REPORT');
        builder.appendLine('==============================');
        builder.appendLine('Generated: ' + comparisonData.timestamp);
        builder.appendLine('');
        
        // Source information
        builder.appendLine('COMPARISON SOURCES:');
        builder.appendLine('Before: ' + comparisonData.beforeSource.documentName + ' (' + comparisonData.beforeSource.timestamp + ')');
        builder.appendLine('After:  ' + comparisonData.afterSource.documentName + ' (' + comparisonData.afterSource.timestamp + ')');
        builder.appendLine('');
        
        // Summary
        builder.appendLine('CHANGE SUMMARY:');
        builder.appendLine('==============');
        builder.appendLine('Total Changes: ' + comparisonData.summary.totalChanges);
        builder.appendLine('Structural Changes: ' + comparisonData.summary.structuralChanges);
        builder.appendLine('Property Changes: ' + comparisonData.summary.propertyChanges);
        builder.appendLine('Collection Changes: ' + comparisonData.summary.collectionChanges);
        builder.appendLine('Object Reference Changes: ' + comparisonData.summary.objectReferenceChanges);
        builder.appendLine('Metadata Changes: ' + comparisonData.summary.metadataChanges);
        builder.appendLine('Critical Changes: ' + comparisonData.summary.criticalChanges);
        builder.appendLine('');
        
        // Detailed differences
        generateDetailedDifferencesSection(builder, comparisonData, config);
        
        // Recommendations
        if (comparisonData.recommendations && comparisonData.recommendations.length > 0) {
            builder.appendLine('RECOMMENDATIONS:');
            builder.appendLine('===============');
            for (var i = 0; i < comparisonData.recommendations.length; i++) {
                builder.appendLine('• ' + comparisonData.recommendations[i]);
            }
            builder.appendLine('');
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Error generating comparison report: ' + exc.message;
    }
}

/**
 * Generate detailed differences section
 * @param {Object} builder - String builder
 * @param {Object} comparisonData - Comparison data
 * @param {Object} config - Comparison configuration
 */
function generateDetailedDifferencesSection(builder, comparisonData, config) {
    try {
        // Structural differences
        if (comparisonData.differences.structural && comparisonData.differences.structural.length > 0) {
            builder.appendLine('STRUCTURAL CHANGES:');
            builder.appendLine('==================');
            for (var i = 0; i < Math.min(comparisonData.differences.structural.length, config.maxDifferencesToReport); i++) {
                var diff = comparisonData.differences.structural[i];
                builder.appendLine('• ' + diff.description + ' [' + diff.severity + ']');
                if (diff.path) builder.appendLine('  Path: ' + diff.path);
            }
            builder.appendLine('');
        }
        
        // Property differences
        if (comparisonData.differences.properties && comparisonData.differences.properties.length > 0) {
            builder.appendLine('PROPERTY CHANGES:');
            builder.appendLine('================');
            for (var i = 0; i < Math.min(comparisonData.differences.properties.length, config.maxDifferencesToReport); i++) {
                var diff = comparisonData.differences.properties[i];
                builder.appendLine('• ' + diff.description + ' [' + diff.severity + ']');
                if (diff.path) builder.appendLine('  Path: ' + diff.path);
                if (diff.before !== undefined && diff.after !== undefined) {
                    builder.appendLine('  Before: ' + diff.before + ' → After: ' + diff.after);
                }
            }
            builder.appendLine('');
        }
        
        // Collection differences
        if (comparisonData.differences.collections && comparisonData.differences.collections.length > 0) {
            builder.appendLine('COLLECTION CHANGES:');
            builder.appendLine('==================');
            for (var i = 0; i < Math.min(comparisonData.differences.collections.length, config.maxDifferencesToReport); i++) {
                var diff = comparisonData.differences.collections[i];
                builder.appendLine('• ' + diff.description + ' [' + diff.severity + ']');
                if (diff.path) builder.appendLine('  Path: ' + diff.path);
                if (diff.before !== undefined && diff.after !== undefined) {
                    builder.appendLine('  Before: ' + diff.before + ' → After: ' + diff.after);
                }
            }
            builder.appendLine('');
        }
        
    } catch (exc) {
        builder.appendLine('Error generating detailed differences: ' + exc.message);
        builder.appendLine('');
    }
}

// ============================================================================
// USER INTERFACE
// ============================================================================

/**
 * Show DOM comparator interface
 * @returns {Boolean} - true if interface shown successfully
 */
function showDOMComparator() {
    try {
        var dialog = new Window('dialog', 'DOM Export Comparator');
        dialog.orientation = 'column';
        dialog.alignChildren = 'fill';
        dialog.preferredSize.width = 700;
        dialog.preferredSize.height = 500;
        
        // File selection
        var filesPanel = dialog.add('panel', undefined, 'Select JSON Export Files');
        
        // Before file
        var beforeGroup = filesPanel.add('group');
        beforeGroup.add('statictext', undefined, 'Before:');
        var beforeText = beforeGroup.add('edittext', undefined, '[Select before JSON file]');
        beforeText.preferredSize.width = 350;
        var beforeBrowseBtn = beforeGroup.add('button', undefined, 'Browse...');
        
        // After file
        var afterGroup = filesPanel.add('group');
        afterGroup.add('statictext', undefined, 'After: ');
        var afterText = afterGroup.add('edittext', undefined, '[Select after JSON file]');
        afterText.preferredSize.width = 350;
        var afterBrowseBtn = afterGroup.add('button', undefined, 'Browse...');
        
        var beforeFile = null;
        var afterFile = null;
        
        beforeBrowseBtn.onClick = function() {
            var file = File.openDialog('Select Before JSON Export', '*.json');
            if (file) {
                beforeFile = file;
                beforeText.text = file.name;
            }
        };
        
        afterBrowseBtn.onClick = function() {
            var file = File.openDialog('Select After JSON Export', '*.json');
            if (file) {
                afterFile = file;
                afterText.text = file.name;
            }
        };
        
        // Comparison options
        var optionsPanel = dialog.add('panel', undefined, 'Comparison Options');
        var structuralCheckbox = optionsPanel.add('checkbox', undefined, 'Compare Structural Changes');
        var propertyCheckbox = optionsPanel.add('checkbox', undefined, 'Compare Property Changes');
        var collectionCheckbox = optionsPanel.add('checkbox', undefined, 'Compare Collection Changes');
        var objectRefCheckbox = optionsPanel.add('checkbox', undefined, 'Compare Object References');
        
        structuralCheckbox.value = true;
        propertyCheckbox.value = true;
        collectionCheckbox.value = true;
        objectRefCheckbox.value = true;
        
        // Results area
        var resultsPanel = dialog.add('panel', undefined, 'Comparison Results');
        var resultsText = resultsPanel.add('edittext', undefined, 'Comparison results will appear here...', {
            multiline: true,
            readonly: true,
            scrolling: true
        });
        resultsText.preferredSize.height = 250;
        
        // Buttons
        var buttonGroup = dialog.add('group');
        var compareBtn = buttonGroup.add('button', undefined, 'Compare');
        var saveBtn = buttonGroup.add('button', undefined, 'Save Report');
        var closeBtn = buttonGroup.add('button', undefined, 'Close');
        
        var comparisonResults = null;
        
        compareBtn.onClick = function() {
            if (!beforeFile || !afterFile) {
                alert('Please select both before and after JSON files.');
                return;
            }
            
            try {
                var config = {
                    enableStructuralComparison: structuralCheckbox.value,
                    enablePropertyComparison: propertyCheckbox.value,
                    enableCollectionComparison: collectionCheckbox.value,
                    enableObjectReferenceComparison: objectRefCheckbox.value
                };
                
                var result = compareDOMExports(beforeFile.absoluteURI, afterFile.absoluteURI, config);
                if (result.success) {
                    comparisonResults = result.comparison;
                    var report = generateComparisonReport(result.comparison, config);
                    resultsText.text = report;
                } else {
                    resultsText.text = 'Comparison failed: ' + result.error;
                }
            } catch (exc) {
                resultsText.text = 'Comparison error: ' + exc.message;
            }
        };
        
        saveBtn.onClick = function() {
            if (!comparisonResults) {
                alert('No comparison results to save. Please run comparison first.');
                return;
            }
            
            var saveFile = File.saveDialog('Save Comparison Report', '*.txt');
            if (saveFile) {
                try {
                    var config = {
                        enableStructuralComparison: structuralCheckbox.value,
                        enablePropertyComparison: propertyCheckbox.value,
                        enableCollectionComparison: collectionCheckbox.value,
                        enableObjectReferenceComparison: objectRefCheckbox.value
                    };
                    var report = generateComparisonReport(comparisonResults, config);
                    var writeResult = writeToFile(saveFile.absoluteURI, report);
                    if (writeResult.success) {
                        alert('Comparison report saved successfully to:\n' + writeResult.filePath);
                    } else {
                        alert('Failed to save report:\n' + writeResult.error);
                    }
                } catch (exc) {
                    alert('Save error: ' + exc.message);
                }
            }
        };
        
        closeBtn.onClick = function() {
            dialog.close();
        };
        
        dialog.show();
        return true;
        
    } catch (exc) {
        $.writeln('ERROR: Failed to show DOM comparator interface: ' + exc.message);
        return false;
    }
}

// ============================================================================
// MODULE INITIALIZATION
// ============================================================================

/**
 * Initialize DOM comparator module
 * @returns {Boolean} - true if initialization successful
 */
function initializeDOMComparator() {
    try {
        // Check dependencies
        if (typeof createStringBuilder !== 'function') {
            $.writeln('ERROR: Safe foundation module not loaded');
            return false;
        }
        
        if (typeof readAndParseJSONFile !== 'function') {
            $.writeln('ERROR: JSON analyzer module not loaded');
            return false;
        }
        
        // Test core functions
        var requiredFunctions = [
            'compareDOMExports', 'generateComparisonReport', 'showDOMComparator'
        ];
        
        for (var i = 0; i < requiredFunctions.length; i++) {
            if (typeof eval(requiredFunctions[i]) !== 'function') {
                $.writeln('ERROR: Required function missing: ' + requiredFunctions[i]);
                return false;
            }
        }
        
        $.writeln('8.0_dom-comparator.jsx: Initialized successfully');
        $.writeln('Use compareDOMExports(beforePath, afterPath, options) to compare JSON exports');
        $.writeln('Use showDOMComparator() to open the comparison interface');
        return true;
        
    } catch (exc) {
        $.writeln('ERROR: DOM comparator initialization failed: ' + exc.message);
        return false;
    }
}

// Auto-initialize when module loads
initializeDOMComparator();