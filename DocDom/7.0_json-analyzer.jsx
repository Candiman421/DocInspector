//
// 7.0_json-analyzer.jsx
// InDesign DOM Discovery Builder - JSON Export Analysis and Visualization
// CORE PURPOSE: Post-process exported JSON to create simplified visual DOM hierarchies
// DEPENDENCIES: 1.0_safe-foundation.jsx
// SAFETY: Safe file operations and JSON parsing only
// ES3 COMPATIBLE: No reserved words, no modern JS features
// USAGE: Analyze existing JSON exports to generate developer-friendly visualizations
//

// ============================================================================
// JSON ANALYZER CONFIGURATION
// ============================================================================

var JSON_ANALYZER_CONFIG = {
    maxTreeDepth: 6,                    // Maximum depth for tree visualization
    maxPropertiesPerNode: 20,           // Limit properties shown per node
    maxCollectionsShown: 10,            // Limit collections shown in summary
    includePropertyTypes: true,         // Show property types in output
    includeObjectReferences: true,      // Show object reference information
    includeAccessPaths: true,           // Show alternative access paths
    includeSafetyLevels: true,          // Show safety classifications
    includeCollectionDetails: true,     // Show collection sampling details
    generateDeveloperNotes: true,       // Generate practical developer notes
    compactMode: false,                 // Use compact representation
    showEmptyCollections: false,        // Include empty collections in output
    highlightRecommendedPaths: true     // Highlight recommended access patterns
};

// ============================================================================
// MAIN JSON ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Analyze JSON export file and generate simplified visualizations
 * @param {String} jsonFilePath - Path to JSON export file
 * @param {Object} analysisOptions - Analysis configuration options
 * @returns {Object} - {success: boolean, analysis: object, error: string}
 */
function analyzeJSONExport(jsonFilePath, analysisOptions) {
    var result = {
        success: false,
        analysis: null,
        error: ''
    };
    
    try {
        $.writeln('Starting JSON export analysis...');
        $.writeln('JSON file: ' + jsonFilePath);
        
        // Merge configuration
        var config = mergeJSONAnalysisConfig(JSON_ANALYZER_CONFIG, analysisOptions);
        
        // Read and parse JSON file
        var jsonData = readAndParseJSONFile(jsonFilePath);
        if (!jsonData.success) {
            result.error = 'Failed to read JSON file: ' + jsonData.error;
            return result;
        }
        
        $.writeln('JSON file loaded successfully, analyzing structure...');
        
        // Perform comprehensive analysis
        var analysis = performComprehensiveJSONAnalysis(jsonData.data, config);
        
        if (analysis.success) {
            result.success = true;
            result.analysis = analysis.analysisData;
            
            $.writeln('JSON analysis complete:');
            $.writeln('  Total nodes analyzed: ' + (analysis.analysisData.summary.totalNodes || 0));
            $.writeln('  Collections found: ' + (analysis.analysisData.summary.collectionsFound || 0));
            $.writeln('  Object references: ' + (analysis.analysisData.summary.objectReferences || 0));
            $.writeln('  Visualizations generated: ' + (analysis.analysisData.visualizations ? Object.keys(analysis.analysisData.visualizations).length : 0));
        } else {
            result.error = 'Analysis failed: ' + analysis.error;
        }
        
    } catch (exc) {
        result.error = 'JSON analysis exception: ' + exc.message;
        $.writeln('ERROR: JSON analysis failed: ' + exc.message);
    }
    
    return result;
}

/**
 * Generate visual DOM hierarchy from JSON data
 * @param {Object} jsonData - Parsed JSON data
 * @param {Object} config - Analysis configuration
 * @returns {String} - Visual DOM hierarchy text
 */
function generateVisualDOMHierarchy(jsonData, config) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('VISUAL DOM HIERARCHY');
        builder.appendLine('===================');
        builder.appendLine('Generated from JSON export analysis');
        builder.appendLine('');
        
        if (jsonData.structure && jsonData.structure.document) {
            var hierarchyText = generateNodeHierarchy(
                jsonData.structure.document, 
                '', 
                true, 
                0, 
                config
            );
            builder.append(hierarchyText);
        } else {
            builder.appendLine('No DOM structure found in JSON data');
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Error generating visual DOM hierarchy: ' + exc.message;
    }
}

/**
 * Generate developer-focused property summary
 * @param {Object} jsonData - Parsed JSON data
 * @param {Object} config - Analysis configuration
 * @returns {String} - Developer property summary
 */
function generateDeveloperPropertySummary(jsonData, config) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('DEVELOPER PROPERTY SUMMARY');
        builder.appendLine('==========================');
        builder.appendLine('Practical property access guide from JSON analysis');
        builder.appendLine('');
        
        // Collect all properties by safety level
        var propertiesByCategory = categorizePropertiesFromJSON(jsonData, config);
        
        // Safe properties first
        if (propertiesByCategory.safe.length > 0) {
            builder.appendLine('SAFE PROPERTIES (Recommended for direct access):');
            builder.appendLine('===============================================');
            for (var i = 0; i < Math.min(propertiesByCategory.safe.length, 15); i++) {
                var prop = propertiesByCategory.safe[i];
                builder.appendLine('  ' + prop.path + ' (' + prop.type + ')');
                if (prop.description) {
                    builder.appendLine('    // ' + prop.description);
                }
            }
            builder.appendLine('');
        }
        
        // Collections with sampling data
        if (propertiesByCategory.collections.length > 0) {
            builder.appendLine('COLLECTIONS WITH SAMPLING DATA:');
            builder.appendLine('===============================');
            for (var i = 0; i < Math.min(propertiesByCategory.collections.length, 10); i++) {
                var coll = propertiesByCategory.collections[i];
                builder.appendLine('  ' + coll.path + ' [' + coll.safetyLevel + ']');
                if (coll.length !== undefined) {
                    builder.appendLine('    Length: ' + coll.length + ' items');
                }
                if (coll.commonProperties) {
                    builder.appendLine('    Common properties: ' + coll.commonProperties + ' found');
                }
                if (coll.accessPatterns) {
                    builder.appendLine('    Access patterns: ' + coll.accessPatterns + ' available');
                }
            }
            builder.appendLine('');
        }
        
        // Object references
        if (propertiesByCategory.objectReferences.length > 0) {
            builder.appendLine('OBJECTS WITH MULTIPLE ACCESS PATHS:');
            builder.appendLine('===================================');
            for (var i = 0; i < Math.min(propertiesByCategory.objectReferences.length, 8); i++) {
                var objRef = propertiesByCategory.objectReferences[i];
                builder.appendLine('  Object ID: ' + objRef.objectId);
                builder.appendLine('    Primary path: ' + objRef.primaryPath);
                builder.appendLine('    Alternative paths: ' + objRef.alternativeCount);
                if (objRef.recommendedPath) {
                    builder.appendLine('    Recommended: ' + objRef.recommendedPath);
                }
            }
            builder.appendLine('');
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Error generating developer property summary: ' + exc.message;
    }
}

/**
 * Generate collection analysis from JSON data
 * @param {Object} jsonData - Parsed JSON data
 * @param {Object} config - Analysis configuration
 * @returns {String} - Collection analysis text
 */
function generateCollectionAnalysis(jsonData, config) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('COLLECTION ANALYSIS');
        builder.appendLine('==================');
        builder.appendLine('Detailed collection information from JSON analysis');
        builder.appendLine('');
        
        var collections = extractCollectionsFromJSON(jsonData);
        
        if (collections.length === 0) {
            builder.appendLine('No collections found in JSON data');
            return builder.toString();
        }
        
        builder.appendLine('Found ' + collections.length + ' collections:');
        builder.appendLine('');
        
        for (var i = 0; i < collections.length; i++) {
            var collection = collections[i];
            
            builder.appendLine((i + 1) + '. COLLECTION: ' + collection.name);
            builder.appendLine('   Path: ' + collection.path);
            builder.appendLine('   Type: ' + collection.type);
            builder.appendLine('   Safety Level: ' + collection.safetyLevel);
            
            if (collection.samplingData) {
                var sampling = collection.samplingData;
                builder.appendLine('   Length: ' + (sampling.collectionLength || 'Unknown'));
                
                if (sampling.commonProperties && sampling.commonProperties.length > 0) {
                    builder.appendLine('   Common Properties (' + sampling.commonProperties.length + '):');
                    for (var j = 0; j < Math.min(sampling.commonProperties.length, 5); j++) {
                        var commonProp = sampling.commonProperties[j];
                        builder.appendLine('     - ' + commonProp.name + ' (' + commonProp.type + ') [' + commonProp.safetyLevel + ']');
                    }
                    if (sampling.commonProperties.length > 5) {
                        builder.appendLine('     ... and ' + (sampling.commonProperties.length - 5) + ' more');
                    }
                }
                
                if (sampling.accessPatterns && sampling.accessPatterns.length > 0) {
                    builder.appendLine('   Recommended Access Patterns:');
                    for (var j = 0; j < Math.min(sampling.accessPatterns.length, 3); j++) {
                        var pattern = sampling.accessPatterns[j];
                        if (pattern.isRecommended) {
                            builder.appendLine('     * ' + pattern.pattern + ' // ' + pattern.description);
                        }
                    }
                }
            } else {
                builder.appendLine('   Sampling Data: Not available');
            }
            
            builder.appendLine('');
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Error generating collection analysis: ' + exc.message;
    }
}

// ============================================================================
// JSON PARSING AND VALIDATION
// ============================================================================

/**
 * Read and parse JSON file safely
 * @param {String} filePath - Path to JSON file
 * @returns {Object} - {success: boolean, data: object, error: string}
 */
function readAndParseJSONFile(filePath) {
    var result = {
        success: false,
        data: null,
        error: ''
    };
    
    try {
        var file = new File(filePath);
        
        if (!file.exists) {
            result.error = 'JSON file does not exist: ' + filePath;
            return result;
        }
        
        if (!file.open('r')) {
            result.error = 'Cannot open JSON file for reading: ' + filePath;
            return result;
        }
        
        file.encoding = 'UTF-8';
        var jsonContent = file.read();
        file.close();
        
        if (!jsonContent) {
            result.error = 'JSON file is empty or unreadable';
            return result;
        }
        
        $.writeln('JSON file content length: ' + jsonContent.length + ' characters');
        
        // Parse JSON content (ES3 compatible approach)
        var jsonData = parseJSONSafely(jsonContent);
        if (!jsonData.success) {
            result.error = 'JSON parsing failed: ' + jsonData.error;
            return result;
        }
        
        // Validate JSON structure
        var validation = validateJSONStructure(jsonData.data);
        if (!validation.success) {
            result.error = 'Invalid JSON structure: ' + validation.error;
            return result;
        }
        
        result.success = true;
        result.data = jsonData.data;
        
    } catch (exc) {
        result.error = 'File reading exception: ' + exc.message;
    }
    
    return result;
}

/**
 * Parse JSON content safely (ES3 compatible)
 * @param {String} jsonContent - JSON content string
 * @returns {Object} - {success: boolean, data: object, error: string}
 */
function parseJSONSafely(jsonContent) {
    var result = {
        success: false,
        data: null,
        error: ''
    };
    
    try {
        // Use eval with safety checks (ES3 approach)
        // Note: In production, this should use a proper JSON parser
        // but ExtendScript's JSON support is limited
        
        if (jsonContent.indexOf('function') !== -1 || 
            jsonContent.indexOf('eval') !== -1 || 
            jsonContent.indexOf('while') !== -1) {
            result.error = 'JSON content contains potentially unsafe code';
            return result;
        }
        
        var jsonData = eval('(' + jsonContent + ')');
        
        if (!jsonData || typeof jsonData !== 'object') {
            result.error = 'Parsed JSON is not a valid object';
            return result;
        }
        
        result.success = true;
        result.data = jsonData;
        
    } catch (exc) {
        result.error = 'JSON parsing error: ' + exc.message;
    }
    
    return result;
}

/**
 * Validate JSON structure for DOM export format
 * @param {Object} jsonData - Parsed JSON data
 * @returns {Object} - {success: boolean, error: string}
 */
function validateJSONStructure(jsonData) {
    var result = {
        success: false,
        error: ''
    };
    
    try {
        // Check for required top-level properties
        if (!jsonData.metadata) {
            result.error = 'Missing metadata section';
            return result;
        }
        
        if (!jsonData.structure) {
            result.error = 'Missing structure section';
            return result;
        }
        
        if (!jsonData.structure.document) {
            result.error = 'Missing document structure';
            return result;
        }
        
        // Check metadata validity
        if (!jsonData.metadata.timestamp) {
            result.error = 'Missing timestamp in metadata';
            return result;
        }
        
        // Validate structure has expected properties
        var docNode = jsonData.structure.document;
        if (!docNode.name || !docNode.type || docNode.depth === undefined) {
            result.error = 'Invalid document node structure';
            return result;
        }
        
        result.success = true;
        
    } catch (exc) {
        result.error = 'JSON structure validation error: ' + exc.message;
    }
    
    return result;
}

// ============================================================================
// COMPREHENSIVE ANALYSIS ENGINE
// ============================================================================

/**
 * Perform comprehensive analysis of JSON data
 * @param {Object} jsonData - Parsed JSON data
 * @param {Object} config - Analysis configuration
 * @returns {Object} - {success: boolean, analysisData: object, error: string}
 */
function performComprehensiveJSONAnalysis(jsonData, config) {
    var result = {
        success: false,
        analysisData: null,
        error: ''
    };
    
    try {
        var analysisData = {
            timestamp: getCurrentTimestamp(),
            sourceFile: {
                documentName: jsonData.metadata.documentName || 'Unknown',
                analysisTimestamp: jsonData.metadata.timestamp || 'Unknown',
                exportVersion: jsonData.exportInfo ? jsonData.exportInfo.version : 'Unknown'
            },
            summary: {
                totalNodes: 0,
                totalProperties: 0,
                collectionsFound: 0,
                objectReferences: 0,
                maxDepth: 0
            },
            visualizations: {},
            analysis: {},
            recommendations: []
        };
        
        // Generate summary statistics
        analysisData.summary = generateAnalysisSummary(jsonData, config);
        
        // Generate visualizations
        analysisData.visualizations.domHierarchy = generateVisualDOMHierarchy(jsonData, config);
        analysisData.visualizations.propertyMap = generatePropertyMap(jsonData, config);
        analysisData.visualizations.collectionSummary = generateCollectionAnalysis(jsonData, config);
        analysisData.visualizations.objectReferences = generateObjectReferenceMap(jsonData, config);
        
        // Generate analysis sections
        analysisData.analysis.propertyAnalysis = analyzePropertiesFromJSON(jsonData, config);
        analysisData.analysis.collectionAnalysis = analyzeCollectionsFromJSON(jsonData, config);
        analysisData.analysis.accessPatterns = analyzeAccessPatternsFromJSON(jsonData, config);
        
        // Generate recommendations
        analysisData.recommendations = generateDeveloperRecommendations(jsonData, config);
        
        result.success = true;
        result.analysisData = analysisData;
        
    } catch (exc) {
        result.error = 'Comprehensive analysis failed: ' + exc.message;
    }
    
    return result;
}

/**
 * Generate analysis summary from JSON data
 * @param {Object} jsonData - Parsed JSON data
 * @param {Object} config - Analysis configuration
 * @returns {Object} - Analysis summary
 */
function generateAnalysisSummary(jsonData, config) {
    var summary = {
        totalNodes: 0,
        totalProperties: 0,
        collectionsFound: 0,
        objectReferences: 0,
        maxDepth: 0,
        enhancedFeatures: {
            hasCollectionSampling: false,
            hasObjectReferences: false,
            hasAccessPaths: false
        }
    };
    
    try {
        // Extract from metadata
        if (jsonData.statistics) {
            summary.totalNodes = jsonData.statistics.totalNodes || 0;
            summary.totalProperties = jsonData.statistics.totalProperties || 0;
            summary.maxDepth = jsonData.statistics.maxDepthReached || 0;
            summary.objectReferences = jsonData.statistics.objectReferencesTracked || 0;
        }
        
        if (jsonData.metadata && jsonData.metadata.collectionSampling) {
            summary.enhancedFeatures.hasCollectionSampling = true;
            var samplingStats = jsonData.metadata.collectionSampling.stats;
            if (samplingStats) {
                summary.collectionsFound = samplingStats.collectionsFound || 0;
            }
        }
        
        if (jsonData.objectRegistry) {
            summary.enhancedFeatures.hasObjectReferences = true;
        }
        
        if (jsonData.enhancedExportData) {
            summary.enhancedFeatures.hasAccessPaths = true;
        }
        
        // Count collections in structure
        if (jsonData.structure && jsonData.structure.document) {
            summary.collectionsFound = countCollectionsInNode(jsonData.structure.document);
        }
        
    } catch (exc) {
        $.writeln('Error generating analysis summary: ' + exc.message);
    }
    
    return summary;
}

// ============================================================================
// HIERARCHY GENERATION
// ============================================================================

/**
 * Generate node hierarchy visualization
 * @param {Object} node - DOM node from JSON
 * @param {String} prefix - Current line prefix
 * @param {Boolean} isLast - Whether this is the last child
 * @param {Number} currentDepth - Current depth level
 * @param {Object} config - Analysis configuration
 * @returns {String} - Formatted hierarchy text
 */
function generateNodeHierarchy(node, prefix, isLast, currentDepth, config) {
    var builder = createStringBuilder();
    
    if (!node || currentDepth > config.maxTreeDepth) {
        return '';
    }
    
    try {
        // Current node line
        var nodePrefix = prefix + (isLast ? '└── ' : '├── ');
        var nodeLine = nodePrefix + node.name;
        
        // Add type information
        if (config.includePropertyTypes && node.type) {
            nodeLine += ' (' + node.type + ')';
        }
        
        // Add object reference information
        if (config.includeObjectReferences && node.objectId) {
            nodeLine += ' [ID: ' + node.objectId + ']';
            if (node.alternativeAccessPaths && node.alternativeAccessPaths.length > 0) {
                nodeLine += ' [+' + node.alternativeAccessPaths.length + ' paths]';
            }
        }
        
        // Add circular reference indicator
        if (node.hasCircularRefs) {
            nodeLine += ' [CIRCULAR]';
        }
        
        builder.appendLine(nodeLine);
        
        var childPrefix = prefix + (isLast ? '    ' : '│   ');
        
        // Show properties
        if (node.properties && node.properties.length > 0) {
            var propsToShow = Math.min(node.properties.length, config.maxPropertiesPerNode);
            for (var i = 0; i < propsToShow; i++) {
                var prop = node.properties[i];
                var propPrefix = childPrefix + (i < propsToShow - 1 ? '├── ' : '└── ');
                var propLine = propPrefix + prop.name;
                
                if (config.includePropertyTypes) {
                    propLine += ' (' + prop.type + ')';
                }
                
                if (config.includeSafetyLevels) {
                    propLine += ' [' + prop.safetyLevel + ']';
                }
                
                if (prop.hasSampleValue && prop.sampleValue) {
                    var shortValue = String(prop.sampleValue);
                    if (shortValue.length > 30) {
                        shortValue = shortValue.substring(0, 30) + '...';
                    }
                    propLine += ' = ' + shortValue;
                }
                
                builder.appendLine(propLine);
            }
            
            if (node.properties.length > propsToShow) {
                builder.appendLine(childPrefix + '└── ... and ' + (node.properties.length - propsToShow) + ' more properties');
            }
        }
        
        // Show collections with special handling
        if (node.collections && node.collections.length > 0) {
            var collsToShow = Math.min(node.collections.length, config.maxCollectionsShown);
            for (var i = 0; i < collsToShow; i++) {
                var coll = node.collections[i];
                var collPrefix = childPrefix + '├── ';
                var collLine = collPrefix + coll.name + ' (collection)';
                
                if (config.includeSafetyLevels) {
                    collLine += ' [' + coll.safetyLevel + ']';
                }
                
                // Add collection sampling information
                if (config.includeCollectionDetails && coll.samplingData) {
                    collLine += ' [length: ' + coll.samplingData.collectionLength + ']';
                    if (coll.samplingData.commonProperties) {
                        collLine += ' [' + coll.samplingData.commonProperties.length + ' common props]';
                    }
                }
                
                builder.appendLine(collLine);
                
                // Show collection common properties
                if (config.includeCollectionDetails && coll.samplingData && coll.samplingData.commonProperties) {
                    var subPrefix = childPrefix + '│   ';
                    for (var j = 0; j < Math.min(coll.samplingData.commonProperties.length, 3); j++) {
                        var commonProp = coll.samplingData.commonProperties[j];
                        var commonLine = subPrefix + '├── [item].' + commonProp.name + ' (' + commonProp.type + ')';
                        if (config.includeSafetyLevels) {
                            commonLine += ' [' + commonProp.safetyLevel + ']';
                        }
                        builder.appendLine(commonLine);
                    }
                    if (coll.samplingData.commonProperties.length > 3) {
                        builder.appendLine(subPrefix + '└── ... and ' + (coll.samplingData.commonProperties.length - 3) + ' more');
                    }
                }
            }
        }
        
        // Recursively show child nodes
        if (node.childNodes && node.childNodes.length > 0 && currentDepth < config.maxTreeDepth - 1) {
            for (var i = 0; i < Math.min(node.childNodes.length, 10); i++) {
                var child = node.childNodes[i];
                var isLastChild = (i === Math.min(node.childNodes.length, 10) - 1);
                var childHierarchy = generateNodeHierarchy(child, childPrefix, isLastChild, currentDepth + 1, config);
                builder.append(childHierarchy);
            }
            
            if (node.childNodes.length > 10) {
                builder.appendLine(childPrefix + '└── ... and ' + (node.childNodes.length - 10) + ' more child nodes');
            }
        }
        
    } catch (exc) {
        builder.appendLine(prefix + 'Error generating hierarchy for node: ' + exc.message);
    }
    
    return builder.toString();
}

// ============================================================================
// PROPERTY AND COLLECTION ANALYSIS
// ============================================================================

/**
 * Categorize properties from JSON data for developer use
 * @param {Object} jsonData - Parsed JSON data
 * @param {Object} config - Analysis configuration
 * @returns {Object} - Categorized properties
 */
function categorizePropertiesFromJSON(jsonData, config) {
    var categories = {
        safe: [],
        moderate: [],
        risky: [],
        dangerous: [],
        collections: [],
        objectReferences: []
    };
    
    try {
        if (jsonData.structure && jsonData.structure.document) {
            categorizeNodeProperties(jsonData.structure.document, categories, '');
        }
        
        // Add object reference information
        if (jsonData.objectRegistry && jsonData.objectRegistry.references) {
            var refs = jsonData.objectRegistry.references;
            for (var objId in refs) {
                var ref = refs[objId];
                if (ref.accessPaths && ref.accessPaths.length > 1) {
                    categories.objectReferences.push({
                        objectId: objId,
                        primaryPath: ref.firstPath || ref.accessPaths[0],
                        alternativeCount: ref.accessPaths.length - 1,
                        recommendedPath: ref.accessPaths[0], // First path is usually most direct
                        type: ref.type
                    });
                }
            }
        }
        
    } catch (exc) {
        $.writeln('Error categorizing properties: ' + exc.message);
    }
    
    return categories;
}

/**
 * Recursively categorize properties from a node
 * @param {Object} node - DOM node from JSON
 * @param {Object} categories - Categories object to populate
 * @param {String} basePath - Base path for properties
 */
function categorizeNodeProperties(node, categories, basePath) {
    if (!node) return;
    
    try {
        var currentPath = basePath ? basePath + '.' + node.name : node.name;
        
        // Categorize regular properties
        if (node.properties) {
            for (var i = 0; i < node.properties.length; i++) {
                var prop = node.properties[i];
                var propInfo = {
                    name: prop.name,
                    path: currentPath + '.' + prop.name,
                    type: prop.type,
                    safetyLevel: prop.safetyLevel,
                    description: generatePropertyDescription(prop)
                };
                
                switch (prop.safetyLevel) {
                    case 'safe':
                        categories.safe.push(propInfo);
                        break;
                    case 'moderate':
                        categories.moderate.push(propInfo);
                        break;
                    case 'risky':
                        categories.risky.push(propInfo);
                        break;
                    case 'dangerous':
                        categories.dangerous.push(propInfo);
                        break;
                }
            }
        }
        
        // Categorize collections
        if (node.collections) {
            for (var i = 0; i < node.collections.length; i++) {
                var coll = node.collections[i];
                var collInfo = {
                    name: coll.name,
                    path: currentPath + '.' + coll.name,
                    type: coll.type,
                    safetyLevel: coll.safetyLevel,
                    length: coll.samplingData ? coll.samplingData.collectionLength : undefined,
                    commonProperties: coll.samplingData ? coll.samplingData.commonProperties.length : undefined,
                    accessPatterns: coll.samplingData ? coll.samplingData.accessPatterns.length : undefined
                };
                
                categories.collections.push(collInfo);
            }
        }
        
        // Recursively process child nodes
        if (node.childNodes) {
            for (var i = 0; i < node.childNodes.length; i++) {
                categorizeNodeProperties(node.childNodes[i], categories, currentPath);
            }
        }
        
    } catch (exc) {
        $.writeln('Error categorizing node properties: ' + exc.message);
    }
}

/**
 * Generate descriptive text for a property
 * @param {Object} prop - Property object
 * @returns {String} - Property description
 */
function generatePropertyDescription(prop) {
    try {
        var description = prop.type;
        
        if (prop.isCollection) {
            description += ' collection';
        } else if (prop.isMethod) {
            description += ' method';
        } else {
            description += ' property';
        }
        
        if (prop.hasSampleValue) {
            description += ' with sample value';
        }
        
        return description;
        
    } catch (exc) {
        return 'property';
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Extract collections from JSON data
 * @param {Object} jsonData - Parsed JSON data
 * @returns {Array} - Array of collection objects
 */
function extractCollectionsFromJSON(jsonData) {
    var collections = [];
    
    try {
        if (jsonData.structure && jsonData.structure.document) {
            extractCollectionsFromNode(jsonData.structure.document, collections);
        }
    } catch (exc) {
        $.writeln('Error extracting collections: ' + exc.message);
    }
    
    return collections;
}

/**
 * Recursively extract collections from a node
 * @param {Object} node - DOM node from JSON
 * @param {Array} collections - Array to populate with collections
 */
function extractCollectionsFromNode(node, collections) {
    if (!node) return;
    
    try {
        if (node.collections) {
            for (var i = 0; i < node.collections.length; i++) {
                collections.push(node.collections[i]);
            }
        }
        
        if (node.childNodes) {
            for (var i = 0; i < node.childNodes.length; i++) {
                extractCollectionsFromNode(node.childNodes[i], collections);
            }
        }
    } catch (exc) {
        $.writeln('Error extracting collections from node: ' + exc.message);
    }
}

/**
 * Count collections in a node
 * @param {Object} node - DOM node from JSON
 * @returns {Number} - Collection count
 */
function countCollectionsInNode(node) {
    var count = 0;
    
    try {
        if (node.collections) {
            count += node.collections.length;
        }
        
        if (node.childNodes) {
            for (var i = 0; i < node.childNodes.length; i++) {
                count += countCollectionsInNode(node.childNodes[i]);
            }
        }
    } catch (exc) {
        // Continue counting
    }
    
    return count;
}

/**
 * Merge JSON analysis configuration
 * @param {Object} defaults - Default configuration
 * @param {Object} userOptions - User options
 * @returns {Object} - Merged configuration
 */
function mergeJSONAnalysisConfig(defaults, userOptions) {
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
// EXPORT AND SAVE FUNCTIONS
// ============================================================================

/**
 * Save analysis results to file
 * @param {Object} analysis - Analysis results
 * @param {String} outputPath - Output file path
 * @param {String} format - Output format ('text'|'summary')
 * @returns {Object} - {success: boolean, filePath: string, error: string}
 */
function saveAnalysisResults(analysis, outputPath, format) {
    var result = {
        success: false,
        filePath: '',
        error: ''
    };
    
    try {
        var content = '';
        
        switch (format || 'text') {
            case 'text':
                content = generateFullAnalysisReport(analysis);
                break;
            case 'summary':
                content = generateAnalysisSummaryReport(analysis);
                break;
            default:
                result.error = 'Unsupported analysis output format: ' + format;
                return result;
        }
        
        var writeResult = writeToFile(outputPath, content);
        if (writeResult.success) {
            result.success = true;
            result.filePath = writeResult.filePath;
        } else {
            result.error = writeResult.error;
        }
        
    } catch (exc) {
        result.error = 'Save analysis results failed: ' + exc.message;
    }
    
    return result;
}

/**
 * Generate full analysis report
 * @param {Object} analysis - Analysis results
 * @returns {String} - Full analysis report text
 */
function generateFullAnalysisReport(analysis) {
    var builder = createStringBuilder();
    
    try {
        builder.appendLine('INDESIGN DOM JSON ANALYSIS REPORT');
        builder.appendLine('================================');
        builder.appendLine('Generated: ' + analysis.timestamp);
        builder.appendLine('Source: ' + analysis.sourceFile.documentName);
        builder.appendLine('');
        
        // Summary
        builder.appendLine('ANALYSIS SUMMARY:');
        builder.appendLine('Total Nodes: ' + analysis.summary.totalNodes);
        builder.appendLine('Total Properties: ' + analysis.summary.totalProperties);
        builder.appendLine('Collections Found: ' + analysis.summary.collectionsFound);
        builder.appendLine('Object References: ' + analysis.summary.objectReferences);
        builder.appendLine('Max Depth: ' + analysis.summary.maxDepth);
        builder.appendLine('');
        
        // Visualizations
        if (analysis.visualizations) {
            for (var vizKey in analysis.visualizations) {
                builder.appendLine(analysis.visualizations[vizKey]);
                builder.appendLine('');
            }
        }
        
        // Recommendations
        if (analysis.recommendations && analysis.recommendations.length > 0) {
            builder.appendLine('DEVELOPER RECOMMENDATIONS:');
            builder.appendLine('==========================');
            for (var i = 0; i < analysis.recommendations.length; i++) {
                builder.appendLine('• ' + analysis.recommendations[i]);
            }
            builder.appendLine('');
        }
        
    } catch (exc) {
        builder.appendLine('Error generating full analysis report: ' + exc.message);
    }
    
    return builder.toString();
}

/**
 * Show JSON analyzer interface
 * @returns {Boolean} - true if interface shown successfully
 */
function showJSONAnalyzer() {
    try {
        var dialog = new Window('dialog', 'JSON Export Analyzer');
        dialog.orientation = 'column';
        dialog.alignChildren = 'fill';
        dialog.preferredSize.width = 600;
        dialog.preferredSize.height = 400;
        
        // File selection
        var filePanel = dialog.add('panel', undefined, 'Select JSON Export File');
        var fileGroup = filePanel.add('group');
        var pathText = fileGroup.add('edittext', undefined, '[Select JSON file]');
        pathText.preferredSize.width = 400;
        var browseBtn = fileGroup.add('button', undefined, 'Browse...');
        
        var selectedFile = null;
        browseBtn.onClick = function() {
            var file = File.openDialog('Select JSON Export File', '*.json');
            if (file) {
                selectedFile = file;
                pathText.text = file.name;
            }
        };
        
        // Analysis options
        var optionsPanel = dialog.add('panel', undefined, 'Analysis Options');
        var hierCheckbox = optionsPanel.add('checkbox', undefined, 'Generate DOM Hierarchy');
        var propCheckbox = optionsPanel.add('checkbox', undefined, 'Generate Property Summary');
        var collCheckbox = optionsPanel.add('checkbox', undefined, 'Generate Collection Analysis');
        
        hierCheckbox.value = true;
        propCheckbox.value = true;
        collCheckbox.value = true;
        
        // Results area
        var resultsPanel = dialog.add('panel', undefined, 'Analysis Results');
        var resultsText = resultsPanel.add('edittext', undefined, 'Analysis results will appear here...', {
            multiline: true,
            readonly: true,
            scrolling: true
        });
        resultsText.preferredSize.height = 200;
        
        // Buttons
        var buttonGroup = dialog.add('group');
        var analyzeBtn = buttonGroup.add('button', undefined, 'Analyze');
        var saveBtn = buttonGroup.add('button', undefined, 'Save Results');
        var closeBtn = buttonGroup.add('button', undefined, 'Close');
        
        var analysisResults = null;
        
        analyzeBtn.onClick = function() {
            if (!selectedFile) {
                alert('Please select a JSON file first.');
                return;
            }
            
            try {
                var config = {
                    includePropertyTypes: true,
                    includeCollectionDetails: collCheckbox.value,
                    generateDeveloperNotes: propCheckbox.value
                };
                
                var result = analyzeJSONExport(selectedFile.absoluteURI, config);
                if (result.success) {
                    analysisResults = result.analysis;
                    
                    var output = '';
                    if (hierCheckbox.value && result.analysis.visualizations.domHierarchy) {
                        output += result.analysis.visualizations.domHierarchy + '\n\n';
                    }
                    if (propCheckbox.value && result.analysis.visualizations.propertyMap) {
                        output += result.analysis.visualizations.propertyMap + '\n\n';
                    }
                    if (collCheckbox.value && result.analysis.visualizations.collectionSummary) {
                        output += result.analysis.visualizations.collectionSummary + '\n\n';
                    }
                    
                    resultsText.text = output || 'Analysis completed successfully.';
                } else {
                    resultsText.text = 'Analysis failed: ' + result.error;
                }
            } catch (exc) {
                resultsText.text = 'Analysis error: ' + exc.message;
            }
        };
        
        saveBtn.onClick = function() {
            if (!analysisResults) {
                alert('No analysis results to save. Please run analysis first.');
                return;
            }
            
            var saveFile = File.saveDialog('Save Analysis Results', '*.txt');
            if (saveFile) {
                var saveResult = saveAnalysisResults(analysisResults, saveFile.absoluteURI, 'text');
                if (saveResult.success) {
                    alert('Analysis results saved successfully to:\n' + saveResult.filePath);
                } else {
                    alert('Failed to save results:\n' + saveResult.error);
                }
            }
        };
        
        closeBtn.onClick = function() {
            dialog.close();
        };
        
        dialog.show();
        return true;
        
    } catch (exc) {
        $.writeln('ERROR: Failed to show JSON analyzer interface: ' + exc.message);
        return false;
    }
}

// ============================================================================
// MODULE INITIALIZATION
// ============================================================================

/**
 * Initialize JSON analyzer module
 * @returns {Boolean} - true if initialization successful
 */
function initializeJSONAnalyzer() {
    try {
        // Check dependencies
        if (typeof createStringBuilder !== 'function') {
            $.writeln('ERROR: Safe foundation module not loaded');
            return false;
        }
        
        // Test core functions
        var requiredFunctions = [
            'analyzeJSONExport', 'generateVisualDOMHierarchy', 'showJSONAnalyzer'
        ];
        
        for (var i = 0; i < requiredFunctions.length; i++) {
            if (typeof eval(requiredFunctions[i]) !== 'function') {
                $.writeln('ERROR: Required function missing: ' + requiredFunctions[i]);
                return false;
            }
        }
        
        $.writeln('7.0_json-analyzer.jsx: Initialized successfully');
        $.writeln('Use analyzeJSONExport(jsonFilePath, options) to analyze JSON exports');
        $.writeln('Use showJSONAnalyzer() to open the analysis interface');
        return true;
        
    } catch (exc) {
        $.writeln('ERROR: JSON analyzer initialization failed: ' + exc.message);
        return false;
    }
}

// Auto-initialize when module loads
initializeJSONAnalyzer();