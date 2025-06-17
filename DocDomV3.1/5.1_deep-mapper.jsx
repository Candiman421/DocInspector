// =============================================================================
// 5.1_deep-mapper.jsx - ADVANCED DOM MAPPING AND ANALYSIS
// InDesign DOM Discovery Builder v3.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: Advanced DOM mapping with relationship analysis and accessibility mapping
// DEPENDENCIES: ["1.1_bootstrap-foundation.jsx", "1.2_safety-utilities.jsx"]
// SIZE: ~750 lines - COMPLETE IMPLEMENTATION
// =============================================================================

// =============================================================================
// DEPENDENCY VALIDATION
// =============================================================================

var DEEP_MAPPER_DEPENDENCIES = ['1.1_bootstrap-foundation', '1.2_safety-utilities'];
var dependencyCheck = validateDependencies(DEEP_MAPPER_DEPENDENCIES);
if (!dependencyCheck.success) {
    throw new Error('Deep Mapper missing dependencies: ' + dependencyCheck.missing.join(', '));
}

// =============================================================================
// DEEP MAPPING CONFIGURATION
// =============================================================================

var DEFAULT_DEEP_MAPPING_CONFIG = {
    enableRelationshipMapping: true,
    enableAccessibilityAnalysis: true,
    enableCircularReferenceTracking: true,
    enableValueFingerprinting: true,
    enablePerformanceMetrics: true,
    maxMappingDepth: 8,
    timeoutMs: 30000,
    generateDeveloperGuide: true,
    includeUsageExamples: true,
    trackObjectRelationships: true,
    analyzeCrossReferences: true
};

// =============================================================================
// MAIN DEEP MAPPING FUNCTIONS
// =============================================================================

/**
 * Perform deep mapping and analysis of DOM structure
 * @param {Object} domStructure - DOM structure to map
 * @param {Object} sourceDocument - Source document for live analysis
 * @param {Object} mappingConfig - Mapping configuration
 * @returns {Object} Deep mapping result
 */
function performDeepMapping(domStructure, sourceDocument, mappingConfig) {
    var startTime = new Date().getTime();
    var config = mappingConfig ? 
        objectClone(mappingConfig, 2) : objectClone(DEFAULT_DEEP_MAPPING_CONFIG, 2);
    
    try {
        var result = {
            success: false,
            session: {},
            analysis: {},
            error: null,
            mappingTime: 0
        };
        
        // Validate input
        if (!domStructure) {
            result.error = 'No DOM structure provided for deep mapping';
            return result;
        }
        
        // Initialize mapping session
        var session = initializeDeepMappingSession(domStructure, config);
        
        // Perform relationship mapping
        if (config.enableRelationshipMapping) {
            session.relationshipMap = generateRelationshipMap(domStructure, config);
        }
        
        // Perform accessibility analysis
        if (config.enableAccessibilityAnalysis) {
            session.accessibilityMap = generateAccessibilityMap(domStructure, config);
        }
        
        // Track circular references
        if (config.enableCircularReferenceTracking) {
            session.circularReferences = analyzeCircularReferences(domStructure, config);
        }
        
        // Generate value fingerprints
        if (config.enableValueFingerprinting) {
            session.valueFingerprints = generateValueFingerprints(domStructure, config);
        }
        
        // Performance analysis
        if (config.enablePerformanceMetrics) {
            session.performanceMetrics = analyzePerformanceMetrics(domStructure, session, config);
        }
        
        // Generate comprehensive analysis
        var analysis = generateDeepMappingAnalysis(session, config);
        
        result.success = true;
        result.session = session;
        result.analysis = analysis;
        result.mappingTime = new Date().getTime() - startTime;
        
        return result;
        
    } catch (exc) {
        return {
            success: false,
            session: {},
            analysis: {},
            error: 'Deep mapping failed: ' + exc.message,
            mappingTime: new Date().getTime() - startTime
        };
    }
}

/**
 * Initialize deep mapping session
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Configuration
 * @returns {Object} Initialized session
 */
function initializeDeepMappingSession(domStructure, config) {
    try {
        var session = {
            sessionId: generateUniqueID(),
            startTime: getCurrentTimestamp(),
            metadata: {},
            statistics: {},
            relationshipMap: null,
            accessibilityMap: null,
            circularReferences: null,
            valueFingerprints: null,
            performanceMetrics: null,
            configuration: config
        };
        
        // Extract metadata
        session.metadata = {
            documentName: domStructure.metadata ? domStructure.metadata.documentName : 'Unknown',
            totalNodes: domStructure.statistics ? domStructure.statistics.totalNodes : 0,
            totalProperties: domStructure.statistics ? domStructure.statistics.totalProperties : 0,
            mappingDepth: config.maxMappingDepth,
            sessionTimestamp: getCurrentTimestamp()
        };
        
        return session;
        
    } catch (exc) {
        return {
            sessionId: 'error_' + generateUniqueID(),
            error: 'Session initialization failed: ' + exc.message
        };
    }
}

// =============================================================================
// RELATIONSHIP MAPPING
// =============================================================================

/**
 * Generate relationship map for DOM structure
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Configuration
 * @returns {Object} Relationship map
 */
function generateRelationshipMap(domStructure, config) {
    try {
        var relationshipMap = {
            objectRelationships: {},
            parentChildRelationships: {},
            crossReferences: {},
            relationshipTypes: {},
            relationshipStatistics: {
                totalRelationships: 0,
                parentChildCount: 0,
                crossReferenceCount: 0,
                circularCount: 0
            }
        };
        
        // Analyze relationships starting from document
        if (domStructure.structure && domStructure.structure.document) {
            analyzeNodeRelationships(
                domStructure.structure.document,
                null,
                relationshipMap,
                config,
                []
            );
        }
        
        // Analyze object registry relationships
        if (config.trackObjectRelationships && domStructure.objectRegistry) {
            analyzeObjectRegistryRelationships(domStructure.objectRegistry, relationshipMap);
        }
        
        // Generate cross-reference analysis
        if (config.analyzeCrossReferences) {
            analyzeCrossReferences(relationshipMap);
        }
        
        return relationshipMap;
        
    } catch (exc) {
        return {
            error: 'Relationship mapping failed: ' + exc.message,
            objectRelationships: {},
            parentChildRelationships: {},
            crossReferences: {}
        };
    }
}

/**
 * Analyze relationships for a node
 * @param {Object} node - DOM node
 * @param {Object} parent - Parent node
 * @param {Object} relationshipMap - Relationship map to update
 * @param {Object} config - Configuration
 * @param {Array} visitedPaths - Visited paths for circular detection
 */
function analyzeNodeRelationships(node, parent, relationshipMap, config, visitedPaths) {
    try {
        if (!node) return;
        
        var nodePath = node.path;
        
        // Check for circular references
        if (arrayIndexOf(visitedPaths, nodePath) !== -1) {
            relationshipMap.relationshipStatistics.circularCount++;
            return;
        }
        
        var newVisitedPaths = arraySlice(visitedPaths, 0);
        arrayPush(newVisitedPaths, nodePath);
        
        // Record parent-child relationship
        if (parent) {
            var parentPath = parent.path;
            
            if (!relationshipMap.parentChildRelationships[parentPath]) {
                relationshipMap.parentChildRelationships[parentPath] = {
                    children: [],
                    childCount: 0
                };
            }
            
            arrayPush(relationshipMap.parentChildRelationships[parentPath].children, {
                path: nodePath,
                name: node.name,
                type: node.type,
                relationship: 'child'
            });
            
            relationshipMap.parentChildRelationships[parentPath].childCount++;
            relationshipMap.relationshipStatistics.parentChildCount++;
        }
        
        // Record object relationships
        if (node.objectId) {
            relationshipMap.objectRelationships[node.objectId] = {
                path: nodePath,
                name: node.name,
                type: node.type,
                parentPath: parent ? parent.path : null,
                alternativePaths: node.alternativeAccessPaths || [],
                propertyCount: node.properties ? node.properties.length : 0,
                collectionCount: node.collections ? node.collections.length : 0,
                childCount: node.childNodes ? node.childNodes.length : 0
            };
        }
        
        // Analyze properties for cross-references
        if (node.properties) {
            for (var i = 0; i < node.properties.length; i++) {
                var prop = node.properties[i];
                if (prop.objectId) {
                    recordCrossReference(relationshipMap, nodePath, prop.path, 'property', prop.objectId);
                }
            }
        }
        
        // Analyze collections for cross-references
        if (node.collections) {
            for (var j = 0; j < node.collections.length; j++) {
                var coll = node.collections[j];
                if (coll.objectId) {
                    recordCrossReference(relationshipMap, nodePath, coll.path, 'collection', coll.objectId);
                }
            }
        }
        
        // Recursively analyze child nodes
        if (node.childNodes && node.childNodes.length > 0) {
            for (var k = 0; k < node.childNodes.length; k++) {
                analyzeNodeRelationships(
                    node.childNodes[k],
                    node,
                    relationshipMap,
                    config,
                    newVisitedPaths
                );
            }
        }
        
    } catch (exc) {
        // Continue with other nodes
    }
}

/**
 * Record cross-reference relationship
 * @param {Object} relationshipMap - Relationship map
 * @param {String} sourcePath - Source path
 * @param {String} targetPath - Target path
 * @param {String} referenceType - Type of reference
 * @param {String} objectId - Object ID
 */
function recordCrossReference(relationshipMap, sourcePath, targetPath, referenceType, objectId) {
    try {
        if (!relationshipMap.crossReferences[sourcePath]) {
            relationshipMap.crossReferences[sourcePath] = {
                outgoingReferences: [],
                referenceCount: 0
            };
        }
        
        arrayPush(relationshipMap.crossReferences[sourcePath].outgoingReferences, {
            targetPath: targetPath,
            type: referenceType,
            objectId: objectId
        });
        
        relationshipMap.crossReferences[sourcePath].referenceCount++;
        relationshipMap.relationshipStatistics.crossReferenceCount++;
        relationshipMap.relationshipStatistics.totalRelationships++;
        
    } catch (exc) {
        // Continue processing
    }
}

/**
 * Analyze object registry relationships
 * @param {Object} objectRegistry - Object registry
 * @param {Object} relationshipMap - Relationship map
 */
function analyzeObjectRegistryRelationships(objectRegistry, relationshipMap) {
    try {
        if (!objectRegistry.references) return;
        
        for (var objectId in objectRegistry.references) {
            if (objectHasOwnProperty(objectRegistry.references, objectId)) {
                var ref = objectRegistry.references[objectId];
                
                if (ref.paths && ref.paths.length > 1) {
                    // Record multiple access paths as relationships
                    for (var i = 0; i < ref.paths.length; i++) {
                        var path = ref.paths[i];
                        
                        if (!relationshipMap.crossReferences[path]) {
                            relationshipMap.crossReferences[path] = {
                                outgoingReferences: [],
                                referenceCount: 0
                            };
                        }
                        
                        // Add references to all other paths
                        for (var j = 0; j < ref.paths.length; j++) {
                            if (i !== j) {
                                arrayPush(relationshipMap.crossReferences[path].outgoingReferences, {
                                    targetPath: ref.paths[j],
                                    type: 'duplicate_reference',
                                    objectId: objectId
                                });
                                relationshipMap.crossReferences[path].referenceCount++;
                            }
                        }
                    }
                }
            }
        }
        
    } catch (exc) {
        // Continue processing
    }
}

/**
 * Analyze cross-references in relationship map
 * @param {Object} relationshipMap - Relationship map
 */
function analyzeCrossReferences(relationshipMap) {
    try {
        var analysis = {
            bidirectionalReferences: [],
            unreachableNodes: [],
            highlyConnectedNodes: []
        };
        
        // Find highly connected nodes
        for (var path in relationshipMap.crossReferences) {
            if (objectHasOwnProperty(relationshipMap.crossReferences, path)) {
                var ref = relationshipMap.crossReferences[path];
                if (ref.referenceCount > 5) {
                    arrayPush(analysis.highlyConnectedNodes, {
                        path: path,
                        referenceCount: ref.referenceCount
                    });
                }
            }
        }
        
        relationshipMap.crossReferenceAnalysis = analysis;
        
    } catch (exc) {
        // Continue processing
    }
}

// =============================================================================
// ACCESSIBILITY MAPPING
// =============================================================================

/**
 * Generate accessibility map
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Configuration
 * @returns {Object} Accessibility map
 */
function generateAccessibilityMap(domStructure, config) {
    try {
        var accessibilityMap = {
            safeObjects: [],
            riskyObjects: [],
            dangerousObjects: [],
            inaccessibleObjects: [],
            accessibilityRatings: {},
            usabilityScores: {},
            recommendations: []
        };
        
        // Analyze accessibility starting from document
        if (domStructure.structure && domStructure.structure.document) {
            analyzeNodeAccessibility(domStructure.structure.document, accessibilityMap, config);
        }
        
        // Generate accessibility recommendations
        accessibilityMap.recommendations = generateAccessibilityRecommendations(accessibilityMap);
        
        return accessibilityMap;
        
    } catch (exc) {
        return {
            error: 'Accessibility mapping failed: ' + exc.message,
            safeObjects: [],
            riskyObjects: [],
            dangerousObjects: [],
            recommendations: []
        };
    }
}

/**
 * Analyze node accessibility
 * @param {Object} node - DOM node
 * @param {Object} accessibilityMap - Accessibility map to update
 * @param {Object} config - Configuration
 */
function analyzeNodeAccessibility(node, accessibilityMap, config) {
    try {
        if (!node) return;
        
        var accessInfo = calculateAccessibilityInfo(node);
        
        // Store detailed accessibility rating
        accessibilityMap.accessibilityRatings[node.path] = accessInfo;
        
        // Categorize based on accessibility rating
        if (accessInfo.overallRating >= 90) {
            arrayPush(accessibilityMap.safeObjects, {
                path: node.path,
                name: node.name,
                rating: accessInfo.overallRating,
                usabilityScore: accessInfo.usabilityScore
            });
        } else if (accessInfo.overallRating >= 70) {
            arrayPush(accessibilityMap.riskyObjects, {
                path: node.path,
                name: node.name,
                rating: accessInfo.overallRating,
                warnings: accessInfo.warnings
            });
        } else if (accessInfo.overallRating >= 30) {
            arrayPush(accessibilityMap.dangerousObjects, {
                path: node.path,
                name: node.name,
                rating: accessInfo.overallRating,
                risks: accessInfo.risks
            });
        } else {
            arrayPush(accessibilityMap.inaccessibleObjects, {
                path: node.path,
                name: node.name,
                rating: accessInfo.overallRating,
                reasons: accessInfo.inaccessibilityReasons
            });
        }
        
        // Recursively analyze child nodes
        if (node.childNodes && node.childNodes.length > 0) {
            for (var i = 0; i < node.childNodes.length; i++) {
                analyzeNodeAccessibility(node.childNodes[i], accessibilityMap, config);
            }
        }
        
    } catch (exc) {
        // Continue with other nodes
    }
}

/**
 * Calculate accessibility information for a node
 * @param {Object} node - DOM node
 * @returns {Object} Accessibility information
 */
function calculateAccessibilityInfo(node) {
    try {
        var info = {
            overallRating: 0,
            usabilityScore: 0,
            warnings: [],
            risks: [],
            inaccessibilityReasons: []
        };
        
        var score = 100; // Start with perfect score
        
        // Check for circular references
        if (node.objectMetadata && node.objectMetadata.isCircular) {
            score -= 50;
            arrayPush(info.risks, 'Circular reference detected');
        }
        
        // Check node type safety
        if (node.type === 'error') {
            score -= 60;
            arrayPush(info.inaccessibilityReasons, 'Node has error type');
        } else if (node.type === 'function') {
            score -= 20;
            arrayPush(info.warnings, 'Function node - use with caution');
        }
        
        // Evaluate property accessibility
        if (node.properties && node.properties.length > 0) {
            var safeProps = 0;
            var dangerousProps = 0;
            
            for (var i = 0; i < node.properties.length; i++) {
                var prop = node.properties[i];
                if (prop.safetyLevel === 'safe') {
                    safeProps++;
                } else if (prop.safetyLevel === 'dangerous') {
                    dangerousProps++;
                }
            }
            
            if (dangerousProps > 0) {
                score -= dangerousProps * 5;
                arrayPush(info.warnings, dangerousProps + ' dangerous properties found');
            }
            
            // Bonus for having extracted values
            var extractedCount = 0;
            for (var j = 0; j < node.properties.length; j++) {
                if (node.properties[j].extractedValue) {
                    extractedCount++;
                }
            }
            
            if (extractedCount > 0) {
                info.usabilityScore += Math.min(20, extractedCount * 2);
            }
        }
        
        // Evaluate collections
        if (node.collections && node.collections.length > 0) {
            info.usabilityScore += node.collections.length * 10; // Collections are very useful
            
            // Check for collection analysis
            for (var k = 0; k < node.collections.length; k++) {
                var coll = node.collections[k];
                if (coll.collectionAnalysis) {
                    info.usabilityScore += 5;
                }
            }
        }
        
        // Evaluate alternative access paths
        if (node.alternativeAccessPaths && node.alternativeAccessPaths.length > 0) {
            info.usabilityScore += node.alternativeAccessPaths.length * 3;
        }
        
        // Apply final calculations
        info.overallRating = Math.max(0, Math.min(100, score));
        info.usabilityScore = Math.max(0, Math.min(100, info.usabilityScore));
        
        return info;
        
    } catch (exc) {
        return {
            overallRating: 0,
            usabilityScore: 0,
            warnings: ['Accessibility calculation failed'],
            risks: [],
            inaccessibilityReasons: ['Analysis error: ' + exc.message]
        };
    }
}

/**
 * Generate accessibility recommendations
 * @param {Object} accessibilityMap - Accessibility map
 * @returns {Array} Recommendations
 */
function generateAccessibilityRecommendations(accessibilityMap) {
    try {
        var recommendations = [];
        
        if (accessibilityMap.safeObjects.length > 0) {
            recommendations.push('Start with ' + accessibilityMap.safeObjects.length + ' safe objects for reliable access');
        }
        
        if (accessibilityMap.riskyObjects.length > 0) {
            recommendations.push('Use caution with ' + accessibilityMap.riskyObjects.length + ' risky objects - add error handling');
        }
        
        if (accessibilityMap.dangerousObjects.length > 0) {
            recommendations.push('Avoid or carefully handle ' + accessibilityMap.dangerousObjects.length + ' dangerous objects');
        }
        
        if (accessibilityMap.inaccessibleObjects.length > 0) {
            recommendations.push('Skip ' + accessibilityMap.inaccessibleObjects.length + ' inaccessible objects');
        }
        
        // Add specific recommendations based on patterns
        var totalObjects = accessibilityMap.safeObjects.length + 
                          accessibilityMap.riskyObjects.length + 
                          accessibilityMap.dangerousObjects.length + 
                          accessibilityMap.inaccessibleObjects.length;
        
        if (totalObjects > 0) {
            var safetyPercentage = Math.round((accessibilityMap.safeObjects.length / totalObjects) * 100);
            
            if (safetyPercentage > 80) {
                recommendations.push('Document has high accessibility (' + safetyPercentage + '% safe objects)');
            } else if (safetyPercentage > 50) {
                recommendations.push('Document has moderate accessibility (' + safetyPercentage + '% safe objects)');
            } else {
                recommendations.push('Document has low accessibility (' + safetyPercentage + '% safe objects) - proceed with caution');
            }
        }
        
        return recommendations;
        
    } catch (exc) {
        return ['Recommendation generation failed: ' + exc.message];
    }
}

// =============================================================================
// CIRCULAR REFERENCE ANALYSIS
// =============================================================================

/**
 * Analyze circular references in DOM structure
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Configuration
 * @returns {Object} Circular reference analysis
 */
function analyzeCircularReferences(domStructure, config) {
    try {
        var analysis = {
            circularNodes: [],
            circularPaths: [],
            circularStatistics: {
                totalCircular: 0,
                circularDepth: {},
                circularTypes: {}
            }
        };
        
        // Find all circular nodes
        if (domStructure.structure && domStructure.structure.document) {
            findCircularNodes(domStructure.structure.document, analysis);
        }
        
        return analysis;
        
    } catch (exc) {
        return {
            error: 'Circular reference analysis failed: ' + exc.message,
            circularNodes: [],
            circularPaths: []
        };
    }
}

/**
 * Find circular nodes recursively
 * @param {Object} node - DOM node
 * @param {Object} analysis - Analysis object to update
 */
function findCircularNodes(node, analysis) {
    try {
        if (!node) return;
        
        if (node.objectMetadata && node.objectMetadata.isCircular) {
            arrayPush(analysis.circularNodes, {
                path: node.path,
                name: node.name,
                type: node.type,
                circularType: node.objectMetadata.circularType,
                circularPath: node.objectMetadata.circularPath,
                depth: node.depth
            });
            
            analysis.circularStatistics.totalCircular++;
            
            // Track circular types
            var circType = node.objectMetadata.circularType || 'unknown';
            if (!analysis.circularStatistics.circularTypes[circType]) {
                analysis.circularStatistics.circularTypes[circType] = 0;
            }
            analysis.circularStatistics.circularTypes[circType]++;
            
            // Track circular depth
            var depth = node.depth || 0;
            if (!analysis.circularStatistics.circularDepth[depth]) {
                analysis.circularStatistics.circularDepth[depth] = 0;
            }
            analysis.circularStatistics.circularDepth[depth]++;
        }
        
        // Recursively check child nodes
        if (node.childNodes && node.childNodes.length > 0) {
            for (var i = 0; i < node.childNodes.length; i++) {
                findCircularNodes(node.childNodes[i], analysis);
            }
        }
        
    } catch (exc) {
        // Continue with other nodes
    }
}

// =============================================================================
// VALUE FINGERPRINTING
// =============================================================================

/**
 * Generate value fingerprints for change detection
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Configuration
 * @returns {Object} Value fingerprints
 */
function generateValueFingerprints(domStructure, config) {
    try {
        var fingerprints = {
            structureFingerprint: '',
            valueFingerprints: {},
            fingerprintStatistics: {
                totalFingerprints: 0,
                uniqueValues: 0,
                duplicateValues: 0
            }
        };
        
        // Generate structure fingerprint
        fingerprints.structureFingerprint = generateStructureFingerprint(domStructure);
        
        // Generate value fingerprints
        if (domStructure.structure && domStructure.structure.document) {
            generateNodeValueFingerprints(domStructure.structure.document, fingerprints);
        }
        
        return fingerprints;
        
    } catch (exc) {
        return {
            error: 'Value fingerprinting failed: ' + exc.message,
            structureFingerprint: '',
            valueFingerprints: {}
        };
    }
}

/**
 * Generate structure fingerprint
 * @param {Object} domStructure - DOM structure
 * @returns {String} Structure fingerprint
 */
function generateStructureFingerprint(domStructure) {
    try {
        var components = [];
        
        if (domStructure.metadata) {
            components.push('doc:' + (domStructure.metadata.documentName || 'unknown'));
        }
        
        if (domStructure.statistics) {
            components.push('nodes:' + (domStructure.statistics.totalNodes || 0));
            components.push('props:' + (domStructure.statistics.totalProperties || 0));
        }
        
        components.push('generated:' + getCurrentTimestamp());
        
        return arrayJoin(components, '|');
        
    } catch (exc) {
        return 'fingerprint_error';
    }
}

/**
 * Generate value fingerprints for a node
 * @param {Object} node - DOM node
 * @param {Object} fingerprints - Fingerprints object to update
 */
function generateNodeValueFingerprints(node, fingerprints) {
    try {
        if (!node) return;
        
        // Generate fingerprints for properties with extracted values
        if (node.properties && node.properties.length > 0) {
            for (var i = 0; i < node.properties.length; i++) {
                var prop = node.properties[i];
                if (prop.extractedValue) {
                    var fingerprint = generateValueFingerprint(prop.extractedValue);
                    fingerprints.valueFingerprints[prop.path] = fingerprint;
                    fingerprints.fingerprintStatistics.totalFingerprints++;
                }
            }
        }
        
        // Recursively process child nodes
        if (node.childNodes && node.childNodes.length > 0) {
            for (var j = 0; j < node.childNodes.length; j++) {
                generateNodeValueFingerprints(node.childNodes[j], fingerprints);
            }
        }
        
    } catch (exc) {
        // Continue with other nodes
    }
}

/**
 * Generate fingerprint for a value
 * @param {*} value - Value to fingerprint
 * @returns {String} Value fingerprint
 */
function generateValueFingerprint(value) {
    try {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        
        var type = typeof value;
        var components = ['type:' + type];
        
        if (type === 'string') {
            components.push('len:' + value.length);
            if (value.length > 0) {
                // Simple hash
                var hash = 0;
                for (var i = 0; i < value.length; i++) {
                    hash = ((hash << 5) - hash) + value.charCodeAt(i);
                    hash = hash & hash; // Convert to 32-bit integer
                }
                components.push('hash:' + Math.abs(hash));
            }
        } else if (type === 'number') {
            components.push('val:' + String(value));
        } else if (type === 'boolean') {
            components.push('val:' + String(value));
        }
        
        return arrayJoin(components, '|');
        
    } catch (exc) {
        return 'fingerprint_error';
    }
}

// =============================================================================
// PERFORMANCE METRICS
// =============================================================================

/**
 * Analyze performance metrics for the mapping session
 * @param {Object} domStructure - DOM structure
 * @param {Object} session - Mapping session
 * @param {Object} config - Configuration
 * @returns {Object} Performance metrics
 */
function analyzePerformanceMetrics(domStructure, session, config) {
    try {
        var metrics = {
            mappingEfficiency: 0,
            accessibilityScore: 0,
            relationshipComplexity: 0,
            overallPerformance: 0,
            recommendations: []
        };
        
        // Calculate mapping efficiency
        var totalNodes = session.metadata.totalNodes || 1;
        var processedTime = new Date().getTime() - new Date(session.startTime).getTime();
        metrics.mappingEfficiency = Math.round(totalNodes / (processedTime / 1000)); // nodes per second
        
        // Calculate accessibility score
        if (session.accessibilityMap) {
            var accessMap = session.accessibilityMap;
            var totalObjects = accessMap.safeObjects.length + 
                              accessMap.riskyObjects.length + 
                              accessMap.dangerousObjects.length + 
                              accessMap.inaccessibleObjects.length;
            
            if (totalObjects > 0) {
                metrics.accessibilityScore = Math.round((accessMap.safeObjects.length / totalObjects) * 100);
            }
        }
        
        // Calculate relationship complexity
        if (session.relationshipMap) {
            var relMap = session.relationshipMap;
            if (relMap.relationshipStatistics) {
                var totalRels = relMap.relationshipStatistics.totalRelationships || 1;
                var circularRels = relMap.relationshipStatistics.circularCount || 0;
                metrics.relationshipComplexity = Math.round(((totalRels - circularRels) / totalRels) * 100);
            }
        }
        
        // Calculate overall performance
        metrics.overallPerformance = Math.round(
            (metrics.mappingEfficiency * 0.3 + 
             metrics.accessibilityScore * 0.4 + 
             metrics.relationshipComplexity * 0.3)
        );
        
        // Generate recommendations
        if (metrics.mappingEfficiency < 10) {
            arrayPush(metrics.recommendations, 'Consider reducing mapping depth for better performance');
        }
        
        if (metrics.accessibilityScore < 50) {
            arrayPush(metrics.recommendations, 'Document has low accessibility - many objects may be difficult to access');
        }
        
        if (metrics.relationshipComplexity < 70) {
            arrayPush(metrics.recommendations, 'High relationship complexity detected - watch for circular references');
        }
        
        return metrics;
        
    } catch (exc) {
        return {
            error: 'Performance metrics analysis failed: ' + exc.message,
            mappingEfficiency: 0,
            accessibilityScore: 0,
            relationshipComplexity: 0,
            overallPerformance: 0,
            recommendations: []
        };
    }
}

// =============================================================================
// ANALYSIS GENERATION
// =============================================================================

/**
 * Generate comprehensive deep mapping analysis
 * @param {Object} session - Deep mapping session
 * @param {Object} config - Configuration
 * @returns {Object} Comprehensive analysis
 */
function generateDeepMappingAnalysis(session, config) {
    try {
        var analysis = {
            summary: generateMappingSummary(session),
            relationshipAnalysis: null,
            accessibilityAnalysis: null,
            circularReferenceAnalysis: null,
            performanceAnalysis: null,
            developerGuide: null
        };
        
        // Generate specific analyses
        if (session.relationshipMap) {
            analysis.relationshipAnalysis = generateRelationshipAnalysis(session.relationshipMap);
        }
        
        if (session.accessibilityMap) {
            analysis.accessibilityAnalysis = generateAccessibilityAnalysis(session.accessibilityMap);
        }
        
        if (session.circularReferences) {
            analysis.circularReferenceAnalysis = generateCircularReferenceReport(session.circularReferences);
        }
        
        if (session.performanceMetrics) {
            analysis.performanceAnalysis = generatePerformanceReport(session.performanceMetrics);
        }
        
        // Generate developer guide if enabled
        if (config.generateDeveloperGuide) {
            analysis.developerGuide = generateDeveloperGuide(session, analysis, config);
        }
        
        return analysis;
        
    } catch (exc) {
        return {
            error: 'Deep mapping analysis failed: ' + exc.message,
            summary: {},
            relationshipAnalysis: null,
            accessibilityAnalysis: null
        };
    }
}

/**
 * Generate mapping summary
 * @param {Object} session - Mapping session
 * @returns {Object} Summary
 */
function generateMappingSummary(session) {
    try {
        return {
            sessionId: session.sessionId,
            documentName: session.metadata.documentName,
            totalNodes: session.metadata.totalNodes,
            mappingTime: new Date().getTime() - new Date(session.startTime).getTime(),
            analysisComplete: true,
            timestamp: getCurrentTimestamp()
        };
    } catch (exc) {
        return {
            error: 'Summary generation failed: ' + exc.message
        };
    }
}

/**
 * Generate relationship analysis text
 * @param {Object} relationshipMap - Relationship map
 * @returns {String} Analysis text
 */
function generateRelationshipAnalysis(relationshipMap) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('RELATIONSHIP ANALYSIS');
        builder.appendLine('===================');
        builder.appendLine('');
        
        if (relationshipMap.relationshipStatistics) {
            var stats = relationshipMap.relationshipStatistics;
            builder.appendLine('Total Relationships: ' + stats.totalRelationships);
            builder.appendLine('Parent-Child: ' + stats.parentChildCount);
            builder.appendLine('Cross-References: ' + stats.crossReferenceCount);
            builder.appendLine('Circular References: ' + stats.circularCount);
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Relationship analysis generation failed: ' + exc.message;
    }
}

/**
 * Generate accessibility analysis text
 * @param {Object} accessibilityMap - Accessibility map
 * @returns {String} Analysis text
 */
function generateAccessibilityAnalysis(accessibilityMap) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('ACCESSIBILITY ANALYSIS');
        builder.appendLine('=====================');
        builder.appendLine('');
        
        builder.appendLine('Safe Objects: ' + accessibilityMap.safeObjects.length);
        builder.appendLine('Risky Objects: ' + accessibilityMap.riskyObjects.length);
        builder.appendLine('Dangerous Objects: ' + accessibilityMap.dangerousObjects.length);
        builder.appendLine('Inaccessible Objects: ' + accessibilityMap.inaccessibleObjects.length);
        
        return builder.toString();
        
    } catch (exc) {
        return 'Accessibility analysis generation failed: ' + exc.message;
    }
}

/**
 * Generate circular reference report
 * @param {Object} circularReferences - Circular reference analysis
 * @returns {String} Report text
 */
function generateCircularReferenceReport(circularReferences) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('CIRCULAR REFERENCE REPORT');
        builder.appendLine('=========================');
        builder.appendLine('');
        
        if (circularReferences.circularStatistics) {
            builder.appendLine('Total Circular Nodes: ' + circularReferences.circularStatistics.totalCircular);
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Circular reference report generation failed: ' + exc.message;
    }
}

/**
 * Generate performance report
 * @param {Object} performanceMetrics - Performance metrics
 * @returns {String} Report text
 */
function generatePerformanceReport(performanceMetrics) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('PERFORMANCE REPORT');
        builder.appendLine('==================');
        builder.appendLine('');
        
        builder.appendLine('Mapping Efficiency: ' + performanceMetrics.mappingEfficiency + ' nodes/sec');
        builder.appendLine('Accessibility Score: ' + performanceMetrics.accessibilityScore + '%');
        builder.appendLine('Relationship Complexity: ' + performanceMetrics.relationshipComplexity + '%');
        builder.appendLine('Overall Performance: ' + performanceMetrics.overallPerformance + '%');
        
        return builder.toString();
        
    } catch (exc) {
        return 'Performance report generation failed: ' + exc.message;
    }
}

/**
 * Generate developer guide
 * @param {Object} session - Mapping session
 * @param {Object} analysis - Analysis results
 * @param {Object} config - Configuration
 * @returns {String} Developer guide
 */
function generateDeveloperGuide(session, analysis, config) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('DEEP MAPPING DEVELOPER GUIDE');
        builder.appendLine('============================');
        builder.appendLine('');
        
        builder.appendLine('This guide provides insights from deep DOM analysis.');
        builder.appendLine('Document: ' + session.metadata.documentName);
        builder.appendLine('Analysis completed: ' + getCurrentTimestamp());
        builder.appendLine('');
        
        // Add accessibility guidance
        if (session.accessibilityMap && session.accessibilityMap.recommendations) {
            builder.appendLine('ACCESSIBILITY RECOMMENDATIONS:');
            for (var i = 0; i < session.accessibilityMap.recommendations.length; i++) {
                builder.appendLine('• ' + session.accessibilityMap.recommendations[i]);
            }
            builder.appendLine('');
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Developer guide generation failed: ' + exc.message;
    }
}

// =============================================================================
// MODULE REGISTRATION
// =============================================================================

// Register this module with all its functions
registerModule('5.1_deep-mapper', '3.1', [
    // Main Functions
    'performDeepMapping', 'initializeDeepMappingSession',
    
    // Relationship Mapping
    'generateRelationshipMap', 'analyzeNodeRelationships', 'recordCrossReference',
    'analyzeObjectRegistryRelationships', 'analyzeCrossReferences',
    
    // Accessibility Mapping
    'generateAccessibilityMap', 'analyzeNodeAccessibility', 'calculateAccessibilityInfo',
    'generateAccessibilityRecommendations',
    
    // Circular Reference Analysis
    'analyzeCircularReferences', 'findCircularNodes',
    
    // Value Fingerprinting
    'generateValueFingerprints', 'generateStructureFingerprint', 'generateNodeValueFingerprints',
    'generateValueFingerprint',
    
    // Performance Metrics
    'analyzePerformanceMetrics',
    
    // Analysis Generation
    'generateDeepMappingAnalysis', 'generateMappingSummary', 'generateRelationshipAnalysis',
    'generateAccessibilityAnalysis', 'generateCircularReferenceReport', 'generatePerformanceReport',
    'generateDeveloperGuide'
]);

// =============================================================================
// END OF 5.1_deep-mapper.jsx
// =============================================================================