// =============================================================================
// 7.0_dom-comparator.jsx - BEFORE/AFTER DOCUMENT COMPARISON
// InDesign DOM Discovery Builder v2.1 - TARGET ARCHITECTURE
// =============================================================================
// PURPOSE: Compare before/after JSON exports to identify document changes
// DEPENDENCIES: ["1.0_safe-foundation.jsx", "6.0_json-analyzer.jsx"]
// SIZE: ~900 lines
// =============================================================================

// =============================================================================
// MODULE REGISTRATION AND DEPENDENCIES
// =============================================================================

try {
    // Register this module
    if (typeof registerModule === 'function') {
        registerModule('dom-comparator', '2.1', [
            'compareDOMExports',
            'performComprehensiveDOMComparison',
            'compareMetadata',
            'compareStructuralElements',
            'compareNodes',
            'compareProperties',
            'comparePropertyArrays',
            'compareCollections',
            'compareDetailedCollections',
            'compareObjectReferences',
            'compareAccessPaths',
            'generateComparisonReport',
            'generateDetailedDifferencesSection',
            'countCriticalChanges',
            'generateChangeRecommendations',
            'showDOMComparator'
        ]);
    }

    // Validate dependencies
    if (typeof validateDependencies === 'function') {
        var depResult = validateDependencies(['safe-foundation', 'json-analyzer']);
        if (!depResult.success) {
            throw new Error('Missing dependencies for dom-comparator: ' + depResult.missing.join(', '));
        }
    }
} catch (exc) {
    // Module system not available - continue with standalone operation
}

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
        // Enhanced parameter validation
        if (!beforeJSONPath || typeof beforeJSONPath !== 'string') {
            result.error = 'Invalid before JSON path provided';
            return result;
        }
        
        if (!afterJSONPath || typeof afterJSONPath !== 'string') {
            result.error = 'Invalid after JSON path provided';
            return result;
        }
        
        var config = mergeComparisonConfig(DOM_COMPARATOR_CONFIG, comparisonOptions);
        
        // Read and parse both JSON files with enhanced error handling
        var beforeData = null;
        if (typeof readAndParseJSONFile === 'function') {
            beforeData = readAndParseJSONFile(beforeJSONPath);
        } else {
            result.error = 'JSON reading function not available - requires json-analyzer module';
            return result;
        }
        
        if (!beforeData.success) {
            result.error = 'Before file error: ' + beforeData.error;
            return result;
        }
        
        var afterData = readAndParseJSONFile(afterJSONPath);
        if (!afterData.success) {
            result.error = 'After file error: ' + afterData.error;
            return result;
        }
        
        // Validate both structures with enhanced validation
        var beforeValidation = null;
        if (typeof validateJSONStructure === 'function') {
            beforeValidation = validateJSONStructure(beforeData.data);
        } else {
            result.error = 'JSON validation function not available - requires json-analyzer module';
            return result;
        }
        
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
        // Enhanced parameter validation
        if (!beforeData || typeof beforeData !== 'object') {
            result.error = 'Invalid before data provided';
            return result;
        }
        
        if (!afterData || typeof afterData !== 'object') {
            result.error = 'Invalid after data provided';
            return result;
        }
        
        if (!config || typeof config !== 'object') {
            result.error = 'Invalid comparison configuration provided';
            return result;
        }
        
        var comparisonData = {
            metadata: compareMetadata(beforeData, afterData, config),
            structural: config.enableStructuralComparison ? compareStructuralElements(beforeData, afterData, config) : null,
            properties: config.enablePropertyComparison ? compareProperties(beforeData, afterData, config) : null,
            collections: config.enableCollectionComparison ? compareCollections(beforeData, afterData, config) : null,
            objectReferences: config.enableObjectReferenceComparison ? compareObjectReferences(beforeData, afterData, config) : null,
            totalChanges: 0
        };
        
        // Count total changes with error protection
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
// METADATA AND STRUCTURE COMPARISON - ENHANCED
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
        // Parameter validation
        if (!beforeData || !afterData || !config) {
            result.changes.push({
                type: 'error',
                field: 'parameter_validation',
                error: 'Invalid parameters provided',
                significance: 'high'
            });
            return result;
        }
        
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
        
        // Compare configurations with enhanced safety
        var beforeConfig = beforeMeta.config || {};
        var afterConfig = afterMeta.config || {};
        
        if (beforeConfig.maxDepth !== afterConfig.maxDepth) {
            result.configurationChanged = true;
            result.changes.push({
                type: 'metadata',
                field: 'maxDepth',
                before: beforeConfig.maxDepth || 'unknown',
                after: afterConfig.maxDepth || 'unknown',
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
        // Parameter validation
        if (!beforeData || !afterData || !config) {
            result.changes.push({
                type: 'error',
                field: 'parameter_validation',
                error: 'Invalid parameters provided',
                significance: 'high'
            });
            return result;
        }
        
        var beforeStructure = extractDOMStructure(beforeData);
        var afterStructure = extractDOMStructure(afterData);
        
        // Compare statistics with enhanced safety
        var beforeStats = beforeStructure.statistics || {};
        var afterStats = afterStructure.statistics || {};
        
        var beforeNodes = beforeStats.totalNodes || 0;
        var afterNodes = afterStats.totalNodes || 0;
        
        if (beforeNodes !== afterNodes) {
            result.nodeCountChanged = true;
            result.changes.push({
                type: 'structural',
                field: 'totalNodes',
                before: beforeNodes,
                after: afterNodes,
                significance: 'high'
            });
        }
        
        var beforeProps = beforeStats.totalProperties || 0;
        var afterProps = afterStats.totalProperties || 0;
        
        if (beforeProps !== afterProps) {
            result.propertyCountChanged = true;
            result.changes.push({
                type: 'structural',
                field: 'totalProperties',
                before: beforeProps,
                after: afterProps,
                significance: 'high'
            });
        }
        
        // Compare DOM tree structure with enhanced error protection
        if (beforeStructure.structure && afterStructure.structure) {
            var beforeDoc = beforeStructure.structure.document;
            var afterDoc = afterStructure.structure.document;
            
            if (beforeDoc && afterDoc) {
                var nodeChanges = compareNodes(beforeDoc, afterDoc, 'document', config);
                
                if (nodeChanges.length > 0) {
                    result.structureChanged = true;
                    result.changes = arrayConcat(result.changes, nodeChanges);
                }
            } else {
                result.changes.push({
                    type: 'structural',
                    field: 'document_structure',
                    before: beforeDoc ? 'present' : 'missing',
                    after: afterDoc ? 'present' : 'missing',
                    significance: 'high'
                });
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
 * Compare two DOM nodes recursively - Enhanced with ES3 helpers
 * @param {Object} beforeNode - Before DOM node
 * @param {Object} afterNode - After DOM node
 * @param {String} nodePath - Current node path
 * @param {Object} config - Configuration
 * @returns {Array} Array of node comparison differences
 */
function compareNodes(beforeNode, afterNode, nodePath, config) {
    var differences = [];
    
    try {
        // Enhanced node existence checks
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
        
        // Compare node properties with enhanced safety
        if ((beforeNode.type || 'unknown') !== (afterNode.type || 'unknown')) {
            differences.push({
                type: 'structural',
                field: 'node_type',
                path: nodePath,
                before: beforeNode.type || 'unknown',
                after: afterNode.type || 'unknown',
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
        differences = arrayConcat(differences, propertyDiffs);
        
        // Compare collection arrays
        var collectionDiffs = comparePropertyArrays(
            beforeNode.collections || [],
            afterNode.collections || [],
            nodePath + '.collections',
            config
        );
        differences = arrayConcat(differences, collectionDiffs);
        
        // Compare child nodes with enhanced iteration
        var beforeChildren = beforeNode.childNodes || [];
        var afterChildren = afterNode.childNodes || [];
        
        var maxChildren = Math.max(beforeChildren.length, afterChildren.length);
        for (var i = 0; i < maxChildren; i++) {
            var beforeChild = beforeChildren[i] || null;
            var afterChild = afterChildren[i] || null;
            var childPath = nodePath + '.child[' + i + ']';
            
            var childDiffs = compareNodes(beforeChild, afterChild, childPath, config);
            differences = arrayConcat(differences, childDiffs);
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
// PROPERTY AND COLLECTION COMPARISON - ENHANCED ES3 COMPLIANT
// =============================================================================

/**
 * Compare properties between DOM exports - Enhanced ES3 compliant
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
        // Parameter validation
        if (!beforeData || !afterData || !config) {
            result.changes.push({
                type: 'error',
                field: 'parameter_validation',
                error: 'Invalid parameters provided',
                significance: 'high'
            });
            return result;
        }
        
        var beforeProps = extractAllProperties(beforeData);
        var afterProps = extractAllProperties(afterData);
        
        // Create property maps by path using ES3-compatible approach
        var beforePropMap = {};
        var afterPropMap = {};
        
        for (var i = 0; i < beforeProps.length; i++) {
            var beforeProp = beforeProps[i];
            if (beforeProp && beforeProp.path) {
                beforePropMap[beforeProp.path] = beforeProp;
            }
        }
        
        for (var j = 0; j < afterProps.length; j++) {
            var afterProp = afterProps[j];
            if (afterProp && afterProp.path) {
                afterPropMap[afterProp.path] = afterProp;
            }
        }
        
        // Find added properties - ES3 compatible iteration
        for (var afterPath in afterPropMap) {
            if (objectHasOwnProperty(afterPropMap, afterPath)) {
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
        }
        
        // Find removed properties - ES3 compatible iteration
        for (var beforePath in beforePropMap) {
            if (objectHasOwnProperty(beforePropMap, beforePath)) {
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
        }
        
        // Find changed properties - ES3 compatible iteration
        for (var commonPath in beforePropMap) {
            if (objectHasOwnProperty(beforePropMap, commonPath)) {
                if (afterPropMap[commonPath]) {
                    var beforeProperty = beforePropMap[commonPath];
                    var afterProperty = afterPropMap[commonPath];
                    
                    if ((beforeProperty.type || 'unknown') !== (afterProperty.type || 'unknown')) {
                        result.propertiesChanged.push({
                            path: commonPath,
                            field: 'type',
                            before: beforeProperty.type || 'unknown',
                            after: afterProperty.type || 'unknown'
                        });
                        
                        result.changes.push({
                            type: 'property',
                            field: 'type_changed',
                            path: commonPath,
                            before: beforeProperty.type || 'unknown',
                            after: afterProperty.type || 'unknown',
                            significance: 'high'
                        });
                    }
                    
                    if ((beforeProperty.safetyLevel || 'unknown') !== (afterProperty.safetyLevel || 'unknown')) {
                        result.propertiesChanged.push({
                            path: commonPath,
                            field: 'safetyLevel',
                            before: beforeProperty.safetyLevel || 'unknown',
                            after: afterProperty.safetyLevel || 'unknown'
                        });
                        
                        result.changes.push({
                            type: 'property',
                            field: 'safety_changed',
                            path: commonPath,
                            before: beforeProperty.safetyLevel || 'unknown',
                            after: afterProperty.safetyLevel || 'unknown',
                            significance: 'medium'
                        });
                    }
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
 * Compare arrays of properties or collections - Enhanced ES3 compliant
 * @param {Array} beforeArray - Before property array
 * @param {Array} afterArray - After property array
 * @param {String} arrayPath - Array path
 * @param {Object} config - Configuration
 * @returns {Array} Array of differences
 */
function comparePropertyArrays(beforeArray, afterArray, arrayPath, config) {
    var differences = [];
    
    try {
        // Parameter validation
        if (!beforeArray) beforeArray = [];
        if (!afterArray) afterArray = [];
        if (!arrayPath) arrayPath = 'unknown_array';
        
        var beforeLength = beforeArray.length;
        var afterLength = afterArray.length;
        
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
                var beforeName = beforeItem.name || 'unknown';
                var afterName = afterItem.name || 'unknown';
                
                if (beforeName !== afterName) {
                    differences.push({
                        type: 'property',
                        field: 'name',
                        path: itemPath,
                        before: beforeName,
                        after: afterName,
                        significance: 'medium'
                    });
                }
                
                var beforeType = beforeItem.type || 'unknown';
                var afterType = afterItem.type || 'unknown';
                
                if (beforeType !== afterType) {
                    differences.push({
                        type: 'property',
                        field: 'type',
                        path: itemPath,
                        before: beforeType,
                        after: afterType,
                        significance: 'high'
                    });
                }
            } else if (beforeItem && !afterItem) {
                differences.push({
                    type: 'property',
                    field: 'item_removed',
                    path: itemPath,
                    before: beforeItem.name || 'unknown',
                    significance: 'medium'
                });
            } else if (!beforeItem && afterItem) {
                differences.push({
                    type: 'property',
                    field: 'item_added',
                    path: itemPath,
                    after: afterItem.name || 'unknown',
                    significance: 'medium'
                });
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
 * Compare collections between DOM exports - Enhanced ES3 compliant
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
        // Parameter validation
        if (!beforeData || !afterData || !config) {
            result.changes.push({
                type: 'error',
                field: 'parameter_validation',
                error: 'Invalid parameters provided',
                significance: 'high'
            });
            return result;
        }
        
        // Use enhanced collection extraction if available
        var beforeCollections = [];
        var afterCollections = [];
        
        if (typeof extractCollectionsFromJSON === 'function') {
            beforeCollections = extractCollectionsFromJSON(beforeData);
            afterCollections = extractCollectionsFromJSON(afterData);
        } else {
            // Fallback to basic extraction
            beforeCollections = extractCollectionsBasic(beforeData);
            afterCollections = extractCollectionsBasic(afterData);
        }
        
        // Create collection maps by path using ES3-compatible approach
        var beforeCollMap = {};
        var afterCollMap = {};
        
        for (var i = 0; i < beforeCollections.length; i++) {
            var beforeColl = beforeCollections[i];
            if (beforeColl && beforeColl.path) {
                beforeCollMap[beforeColl.path] = beforeColl;
            }
        }
        
        for (var j = 0; j < afterCollections.length; j++) {
            var afterColl = afterCollections[j];
            if (afterColl && afterColl.path) {
                afterCollMap[afterColl.path] = afterColl;
            }
        }
        
        // Find added collections - ES3 compatible iteration
        for (var afterPath in afterCollMap) {
            if (objectHasOwnProperty(afterCollMap, afterPath)) {
                if (!beforeCollMap[afterPath]) {
                    result.collectionsAdded.push(afterCollMap[afterPath]);
                    result.changes.push({
                        type: 'collection',
                        field: 'added',
                        path: afterPath,
                        after: afterCollMap[afterPath].name || 'unknown',
                        significance: 'high'
                    });
                }
            }
        }
        
        // Find removed collections - ES3 compatible iteration
        for (var beforePath in beforeCollMap) {
            if (objectHasOwnProperty(beforeCollMap, beforePath)) {
                if (!afterCollMap[beforePath]) {
                    result.collectionsRemoved.push(beforeCollMap[beforePath]);
                    result.changes.push({
                        type: 'collection',
                        field: 'removed',
                        path: beforePath,
                        before: beforeCollMap[beforePath].name || 'unknown',
                        significance: 'high'
                    });
                }
            }
        }
        
        // Compare detailed collection data if enabled
        if (config.detailedCollectionAnalysis) {
            var detailedDiffs = compareDetailedCollections(beforeData, afterData, config);
            result.changes = arrayConcat(result.changes, detailedDiffs);
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
        // Enhanced detailed collection comparison would require
        // access to actual sampling data comparison
        // For now, return empty array with enhanced error handling
        
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
// OBJECT REFERENCE COMPARISON - ENHANCED ES3 COMPLIANT
// =============================================================================

/**
 * Compare object references between DOM exports - Enhanced ES3 compliant
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
        // Parameter validation
        if (!beforeData || !afterData || !config) {
            result.changes.push({
                type: 'error',
                field: 'parameter_validation',
                error: 'Invalid parameters provided',
                significance: 'high'
            });
            return result;
        }
        
        var beforeStructure = extractDOMStructure(beforeData);
        var afterStructure = extractDOMStructure(afterData);
        
        var beforeRegistry = beforeStructure.objectRegistry || {};
        var afterRegistry = afterStructure.objectRegistry || {};
        
        var beforeRefs = beforeRegistry.references || {};
        var afterRefs = afterRegistry.references || {};
        
        // ES3-compatible counting instead of Object.keys(beforeRefs).length
        var beforeCount = countObjectKeys(beforeRefs);
        var afterCount = countObjectKeys(afterRefs);
        
        if (beforeCount !== afterCount) {
            result.changes.push({
                type: 'object_reference',
                field: 'reference_count',
                before: beforeCount,
                after: afterCount,
                significance: 'medium'
            });
        }
        
        // Compare access paths if available and enabled
        var beforePaths = beforeRegistry.accessPaths || {};
        var afterPaths = afterRegistry.accessPaths || {};
        
        if (config.trackObjectMovements) {
            var pathDiffs = compareAccessPaths(beforePaths, afterPaths);
            result.pathChanges = pathDiffs;
            
            for (var i = 0; i < pathDiffs.length; i++) {
                var pathDiff = pathDiffs[i];
                result.changes.push({
                    type: 'object_reference',
                    field: 'access_path',
                    objectId: pathDiff.objectId || 'unknown',
                    before: pathDiff.beforePaths || [],
                    after: pathDiff.afterPaths || [],
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
 * Compare access paths for objects - Enhanced ES3 compatible
 * @param {Object} beforePaths - Before access paths
 * @param {Object} afterPaths - After access paths
 * @returns {Array} Array of path differences
 */
function compareAccessPaths(beforePaths, afterPaths) {
    var differences = [];
    
    try {
        // Parameter validation
        if (!beforePaths) beforePaths = {};
        if (!afterPaths) afterPaths = {};
        
        // Find objects that changed paths - ES3 compatible iteration
        for (var objectId in beforePaths) {
            if (objectHasOwnProperty(beforePaths, objectId)) {
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
                            if ((beforePathArray[i] || '') !== (afterPathArray[i] || '')) {
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
                } else {
                    // Object removed
                    differences.push({
                        objectId: objectId,
                        type: 'object_removed',
                        beforePaths: beforePaths[objectId] || [],
                        afterPaths: []
                    });
                }
            }
        }
        
        // Find new objects - ES3 compatible iteration
        for (var newObjectId in afterPaths) {
            if (objectHasOwnProperty(afterPaths, newObjectId)) {
                if (!beforePaths[newObjectId]) {
                    differences.push({
                        objectId: newObjectId,
                        type: 'object_added',
                        beforePaths: [],
                        afterPaths: afterPaths[newObjectId] || []
                    });
                }
            }
        }
        
        return differences;
        
    } catch (exc) {
        return differences;
    }
}

// =============================================================================
// REPORT GENERATION - ENHANCED
// =============================================================================

/**
 * Generate comprehensive comparison report - Enhanced
 * @param {Object} comparisonData - Comparison data
 * @param {Object} config - Configuration
 * @returns {String} Formatted comparison report
 */
function generateComparisonReport(comparisonData, config) {
    try {
        // Parameter validation
        if (!comparisonData) {
            return 'Error: No comparison data provided';
        }
        
        var builder = createStringBuilder();
        
        builder.appendLine('DOM COMPARISON REPORT');
        builder.appendLine('====================');
        builder.appendLine('Generated: ' + getCurrentTimestamp());
        builder.appendLine('');
        
        // Summary with enhanced safety
        builder.appendLine('SUMMARY');
        builder.appendLine('-------');
        builder.appendLine('Total Changes Detected: ' + (comparisonData.totalChanges || 0));
        
        if (config && config.highlightCriticalChanges) {
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
 * Generate detailed differences section - Enhanced
 * @param {Object} builder - String builder
 * @param {Object} comparisonData - Comparison data
 * @param {Object} config - Configuration
 */
function generateDetailedDifferencesSection(builder, comparisonData, config) {
    try {
        // Parameter validation
        if (!builder || !comparisonData) {
            return;
        }
        
        builder.appendLine('DETAILED DIFFERENCES');
        builder.appendLine('===================');
        
        // Metadata changes
        if (comparisonData.metadata && comparisonData.metadata.changes && comparisonData.metadata.changes.length > 0) {
            builder.appendLine('');
            builder.appendLine('METADATA CHANGES');
            builder.appendLine('---------------');
            
            for (var i = 0; i < comparisonData.metadata.changes.length; i++) {
                var change = comparisonData.metadata.changes[i];
                if (change && change.field) {
                    var beforeVal = change.before || 'none';
                    var afterVal = change.after || 'none';
                    builder.appendLine('• ' + change.field + ': ' + beforeVal + ' → ' + afterVal);
                }
            }
        }
        
        // Structural changes
        if (comparisonData.structural && comparisonData.structural.changes && comparisonData.structural.changes.length > 0) {
            builder.appendLine('');
            builder.appendLine('STRUCTURAL CHANGES');
            builder.appendLine('-----------------');
            
            var maxStructuralChanges = Math.min(comparisonData.structural.changes.length, 20);
            for (var j = 0; j < maxStructuralChanges; j++) {
                var structChange = comparisonData.structural.changes[j];
                if (structChange && structChange.field) {
                    builder.appendLine('• ' + structChange.field + ' at ' + (structChange.path || 'root'));
                    if (structChange.before && structChange.after) {
                        builder.appendLine('  ' + structChange.before + ' → ' + structChange.after);
                    }
                }
            }
            
            if (comparisonData.structural.changes.length > 20) {
                builder.appendLine('... and ' + (comparisonData.structural.changes.length - 20) + ' more structural changes');
            }
        }
        
        // Property changes
        if (comparisonData.properties && comparisonData.properties.changes) {
            builder.appendLine('');
            builder.appendLine('PROPERTY CHANGES');
            builder.appendLine('---------------');
            builder.appendLine('Properties Added: ' + (comparisonData.properties.propertiesAdded ? comparisonData.properties.propertiesAdded.length : 0));
            builder.appendLine('Properties Removed: ' + (comparisonData.properties.propertiesRemoved ? comparisonData.properties.propertiesRemoved.length : 0));
            builder.appendLine('Properties Changed: ' + (comparisonData.properties.propertiesChanged ? comparisonData.properties.propertiesChanged.length : 0));
        }
        
        // Collection changes
        if (comparisonData.collections && comparisonData.collections.changes) {
            builder.appendLine('');
            builder.appendLine('COLLECTION CHANGES');
            builder.appendLine('-----------------');
            builder.appendLine('Collections Added: ' + (comparisonData.collections.collectionsAdded ? comparisonData.collections.collectionsAdded.length : 0));
            builder.appendLine('Collections Removed: ' + (comparisonData.collections.collectionsRemoved ? comparisonData.collections.collectionsRemoved.length : 0));
        }
        
        builder.appendLine('');
        
    } catch (exc) {
        if (builder) {
            builder.appendLine('Error generating detailed differences: ' + exc.message);
            builder.appendLine('');
        }
    }
}

// =============================================================================
// CHANGE ANALYSIS - ENHANCED
// =============================================================================

/**
 * Count critical changes in comparison data - Enhanced
 * @param {Object} comparisonData - Comparison data
 * @param {Object} config - Configuration
 * @returns {Number} Count of critical changes
 */
function countCriticalChanges(comparisonData, config) {
    var criticalCount = 0;
    
    try {
        if (!comparisonData) {
            return 0;
        }
        
        var allChanges = getAllChanges(comparisonData);
        
        for (var i = 0; i < allChanges.length; i++) {
            var change = allChanges[i];
            if (change && change.significance === 'high') {
                criticalCount++;
            }
        }
        
        return criticalCount;
        
    } catch (exc) {
        return 0;
    }
}

/**
 * Generate change recommendations based on comparison data - Enhanced
 * @param {Object} comparisonData - Comparison data
 * @param {Object} config - Configuration
 * @returns {Array} Array of recommendations
 */
function generateChangeRecommendations(comparisonData, config) {
    var recommendations = [];
    
    try {
        // Parameter validation
        if (!comparisonData) {
            recommendations.push({
                type: 'error',
                message: 'No comparison data available for recommendations',
                priority: 'low'
            });
            return recommendations;
        }
        
        var totalChanges = comparisonData.totalChanges || 0;
        
        if (totalChanges === 0) {
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
            ((comparisonData.collections.collectionsAdded && comparisonData.collections.collectionsAdded.length > 0) || 
             (comparisonData.collections.collectionsRemoved && comparisonData.collections.collectionsRemoved.length > 0))) {
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
// UTILITY FUNCTIONS - ENHANCED ES3 COMPLIANT
// =============================================================================

/**
 * Extract DOM structure from data
 * @param {Object} data - JSON data
 * @returns {Object} DOM structure
 */
function extractDOMStructure(data) {
    try {
        if (!data || typeof data !== 'object') {
            return {};
        }
        
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
        if (!data || typeof data !== 'object') {
            return properties;
        }
        
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
 * Basic collection extraction fallback
 * @param {Object} data - DOM data
 * @returns {Array} Array of collections
 */
function extractCollectionsBasic(data) {
    var collections = [];
    
    try {
        if (!data || typeof data !== 'object') {
            return collections;
        }
        
        var domStructure = extractDOMStructure(data);
        
        if (domStructure.structure && domStructure.structure.document) {
            extractCollectionsFromNodeBasic(domStructure.structure.document, collections);
        }
        
        return collections;
        
    } catch (exc) {
        return [];
    }
}

/**
 * Basic collection extraction from node
 * @param {Object} node - DOM node
 * @param {Array} collections - Array to populate
 */
function extractCollectionsFromNodeBasic(node, collections) {
    try {
        if (!node || !collections) {
            return;
        }
        
        // Add collections from this node
        if (node.collections && node.collections.length > 0) {
            for (var i = 0; i < node.collections.length; i++) {
                if (node.collections[i]) {
                    collections.push(node.collections[i]);
                }
            }
        }
        
        // Recursively search child nodes
        if (node.childNodes && node.childNodes.length > 0) {
            for (var j = 0; j < node.childNodes.length; j++) {
                extractCollectionsFromNodeBasic(node.childNodes[j], collections);
            }
        }
        
    } catch (exc) {
        // Continue processing
    }
}

/**
 * Recursively extract properties from a node
 * @param {Object} node - DOM node
 * @param {Array} properties - Array to populate
 */
function extractPropertiesFromNode(node, properties) {
    try {
        if (!node || !properties) {
            return;
        }
        
        if (node.properties && node.properties.length) {
            for (var i = 0; i < node.properties.length; i++) {
                if (node.properties[i]) {
                    properties.push(node.properties[i]);
                }
            }
        }
        
        if (node.collections && node.collections.length) {
            for (var j = 0; j < node.collections.length; j++) {
                if (node.collections[j]) {
                    properties.push(node.collections[j]);
                }
            }
        }
        
        if (node.methods && node.methods.length) {
            for (var k = 0; k < node.methods.length; k++) {
                if (node.methods[k]) {
                    properties.push(node.methods[k]);
                }
            }
        }
        
        if (node.childNodes && node.childNodes.length) {
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
        if (!comparisonData || typeof comparisonData !== 'object') {
            return allChanges;
        }
        
        if (comparisonData.metadata && comparisonData.metadata.changes) {
            allChanges = arrayConcat(allChanges, comparisonData.metadata.changes);
        }
        
        if (comparisonData.structural && comparisonData.structural.changes) {
            allChanges = arrayConcat(allChanges, comparisonData.structural.changes);
        }
        
        if (comparisonData.properties && comparisonData.properties.changes) {
            allChanges = arrayConcat(allChanges, comparisonData.properties.changes);
        }
        
        if (comparisonData.collections && comparisonData.collections.changes) {
            allChanges = arrayConcat(allChanges, comparisonData.collections.changes);
        }
        
        if (comparisonData.objectReferences && comparisonData.objectReferences.changes) {
            allChanges = arrayConcat(allChanges, comparisonData.objectReferences.changes);
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
        if (!comparisonData) {
            return 0;
        }
        
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
        if (!comparisonData || typeof comparisonData !== 'object') {
            return types;
        }
        
        if (comparisonData.metadata && comparisonData.metadata.changes && comparisonData.metadata.changes.length > 0) {
            types.push('metadata');
        }
        if (comparisonData.structural && comparisonData.structural.changes && comparisonData.structural.changes.length > 0) {
            types.push('structural');
        }
        if (comparisonData.properties && comparisonData.properties.changes && comparisonData.properties.changes.length > 0) {
            types.push('properties');
        }
        if (comparisonData.collections && comparisonData.collections.changes && comparisonData.collections.changes.length > 0) {
            types.push('collections');
        }
        if (comparisonData.objectReferences && comparisonData.objectReferences.changes && comparisonData.objectReferences.changes.length > 0) {
            types.push('objectReferences');
        }
        
        return types;
        
    } catch (exc) {
        return [];
    }
}

/**
 * Merge comparison configuration - Enhanced with ES3 helpers
 * @param {Object} defaults - Default configuration
 * @param {Object} userOptions - User options
 * @returns {Object} Merged configuration
 */
function mergeComparisonConfig(defaults, userOptions) {
    try {
        var merged = objectClone(defaults, 2); // Use ES3 helper for cloning
        
        // Override with user options using ES3-compatible iteration
        if (userOptions && typeof userOptions === 'object') {
            for (var key in userOptions) {
                if (objectHasOwnProperty(userOptions, key)) {
                    merged[key] = userOptions[key];
                }
            }
        }
        
        return merged;
        
    } catch (exc) {
        return defaults || {};
    }
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
//
// ENHANCEMENTS IMPLEMENTED:
// - Added comprehensive dependency validation and module registration
// - Enhanced ES3 compliance with objectHasOwnProperty() throughout all iterations
// - Enhanced parameter validation and error handling with comprehensive boundaries
// - Added fallback mechanisms for missing dependencies (json-analyzer functions)
// - Enhanced array operations using arrayConcat() ES3 helper
// - Improved config object cloning using objectClone() to prevent mutations
// - Enhanced string and object operations with ES3 helpers
// - Added comprehensive error protection in all comparison functions
// - Enhanced report generation with better safety checks
// - All original functionality preserved and enhanced for production reliability
// =============================================================================