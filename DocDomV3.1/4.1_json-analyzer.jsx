// =============================================================================
// 4.1_json-analyzer.jsx - JSON ANALYSIS AND VISUALIZATION
// InDesign DOM Discovery Builder v3.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: Analyze exported JSON files and generate visual reports
// DEPENDENCIES: ["1.1_bootstrap-foundation.jsx", "1.2_safety-utilities.jsx"]
// SIZE: ~750 lines - COMPLETE IMPLEMENTATION
// =============================================================================

// =============================================================================
// DEPENDENCY VALIDATION
// =============================================================================

var JSON_ANALYZER_DEPENDENCIES = ['1.1_bootstrap-foundation', '1.2_safety-utilities'];
var dependencyCheck = validateDependencies(JSON_ANALYZER_DEPENDENCIES);
if (!dependencyCheck.success) {
    throw new Error('JSON Analyzer missing dependencies: ' + dependencyCheck.missing.join(', '));
}

// =============================================================================
// ANALYSIS CONFIGURATION
// =============================================================================

var DEFAULT_ANALYSIS_CONFIG = {
    enableVisualHierarchy: true,
    enablePropertyAnalysis: true,
    enableCollectionAnalysis: true,
    enableValueAnalysis: true,
    maxAnalysisDepth: 10,
    maxReportItems: 50,
    generateDeveloperGuide: true,
    includeCodeExamples: true,
    highlightKeyProperties: true,
    generateAccessibilityMap: true
};

// =============================================================================
// MAIN ANALYSIS FUNCTIONS
// =============================================================================

/**
 * Analyze JSON export and generate comprehensive report
 * @param {String} jsonFilePath - Path to JSON file
 * @param {Object} analysisConfig - Analysis configuration
 * @returns {Object} Analysis result
 */
function analyzeJSONExport(jsonFilePath, analysisConfig) {
    var startTime = new Date().getTime();
    var config = analysisConfig ? 
        objectClone(analysisConfig, 2) : objectClone(DEFAULT_ANALYSIS_CONFIG, 2);
    
    try {
        var result = {
            success: false,
            analysis: {},
            error: null,
            analysisTime: 0,
            sourceFile: jsonFilePath
        };
        
        // Read and parse JSON file
        var jsonData = readAndParseJSONFile(jsonFilePath);
        if (!jsonData.success) {
            result.error = jsonData.error;
            return result;
        }
        
        // Validate JSON structure
        var validation = validateJSONStructure(jsonData.data);
        if (!validation.valid) {
            result.error = 'Invalid DOM structure: ' + validation.error;
            return result;
        }
        
        // Perform comprehensive analysis
        result.analysis = analyzeLoadedJSON(jsonData.data, config);
        result.success = true;
        result.analysisTime = new Date().getTime() - startTime;
        
        return result;
        
    } catch (exc) {
        return {
            success: false,
            analysis: {},
            error: 'Analysis failed: ' + exc.message,
            analysisTime: new Date().getTime() - startTime,
            sourceFile: jsonFilePath
        };
    }
}

/**
 * Analyze loaded JSON data structure
 * @param {Object} jsonData - Parsed JSON data
 * @param {Object} config - Analysis configuration
 * @returns {Object} Analysis results
 */
function analyzeLoadedJSON(jsonData, config) {
    try {
        var analysis = {
            summary: {},
            visualHierarchy: null,
            propertyAnalysis: null,
            collectionAnalysis: null,
            valueAnalysis: null,
            accessibilityMap: null,
            developerGuide: null,
            timestamp: getCurrentTimestamp()
        };
        
        // Generate summary
        analysis.summary = generateStructureSummary(jsonData);
        
        // Visual hierarchy analysis
        if (config.enableVisualHierarchy) {
            analysis.visualHierarchy = generateVisualHierarchy(jsonData, config);
        }
        
        // Property analysis
        if (config.enablePropertyAnalysis) {
            analysis.propertyAnalysis = generatePropertyAnalysis(jsonData, config);
        }
        
        // Collection analysis
        if (config.enableCollectionAnalysis) {
            analysis.collectionAnalysis = generateCollectionAnalysis(jsonData, config);
        }
        
        // Value analysis
        if (config.enableValueAnalysis) {
            analysis.valueAnalysis = generateValueAnalysis(jsonData, config);
        }
        
        // Accessibility mapping
        if (config.generateAccessibilityMap) {
            analysis.accessibilityMap = generateAccessibilityMap(jsonData, config);
        }
        
        // Developer guide
        if (config.generateDeveloperGuide) {
            analysis.developerGuide = generateDeveloperGuide(jsonData, analysis, config);
        }
        
        return analysis;
        
    } catch (exc) {
        return {
            error: 'JSON analysis failed: ' + exc.message,
            timestamp: getCurrentTimestamp()
        };
    }
}

// =============================================================================
// FILE OPERATIONS
// =============================================================================

/**
 * Read and parse JSON file safely
 * @param {String} filePath - Path to JSON file
 * @returns {Object} Parse result
 */
function readAndParseJSONFile(filePath) {
    try {
        var result = {
            success: false,
            data: null,
            error: null
        };
        
        if (!filePath) {
            result.error = 'No file path provided';
            return result;
        }
        
        var file = new File(filePath);
        if (!file.exists) {
            result.error = 'File not found: ' + filePath;
            return result;
        }
        
        file.open('r');
        var content = file.read();
        file.close();
        
        if (!content) {
            result.error = 'File is empty or could not be read';
            return result;
        }
        
        var parseResult = parseJSONSafely(content);
        if (!parseResult.success) {
            result.error = parseResult.error;
            return result;
        }
        
        result.data = parseResult.data;
        result.success = true;
        return result;
        
    } catch (exc) {
        return {
            success: false,
            data: null,
            error: 'File read error: ' + exc.message
        };
    }
}

/**
 * Parse JSON content safely
 * @param {String} jsonContent - JSON string
 * @returns {Object} Parse result
 */
function parseJSONSafely(jsonContent) {
    try {
        var result = {
            success: false,
            data: null,
            error: null
        };
        
        if (!jsonContent || typeof jsonContent !== 'string') {
            result.error = 'Invalid JSON content';
            return result;
        }
        
        // Check for function call patterns that could be dangerous
        if (containsFunctionCallPattern(jsonContent)) {
            result.error = 'JSON content contains potentially dangerous function calls';
            return result;
        }
        
        // Use eval for ES3 compatibility (safer than Function constructor)
        try {
            result.data = eval('(' + jsonContent + ')');
            result.success = true;
        } catch (evalExc) {
            result.error = 'JSON parse error: ' + evalExc.message;
        }
        
        return result;
        
    } catch (exc) {
        return {
            success: false,
            data: null,
            error: 'JSON parsing failed: ' + exc.message
        };
    }
}

/**
 * Check for dangerous function call patterns
 * @param {String} content - Content to check
 * @returns {Boolean} True if dangerous patterns found
 */
function containsFunctionCallPattern(content) {
    try {
        var dangerousPatterns = [
            'eval(', 'Function(', 'constructor(', 'prototype(',
            '__proto__(', 'apply(', 'call(', 'bind('
        ];
        
        for (var i = 0; i < dangerousPatterns.length; i++) {
            if (stringIndexOf(content, dangerousPatterns[i]) !== -1) {
                return true;
            }
        }
        
        return false;
        
    } catch (exc) {
        return true; // Assume dangerous on error
    }
}

// =============================================================================
// STRUCTURE VALIDATION
// =============================================================================

/**
 * Validate JSON structure as DOM export
 * @param {Object} data - Parsed JSON data
 * @returns {Object} Validation result
 */
function validateJSONStructure(data) {
    try {
        var result = {
            valid: false,
            error: null,
            warnings: []
        };
        
        if (!data || typeof data !== 'object') {
            result.error = 'Root data is not an object';
            return result;
        }
        
        // Check for required top-level properties
        if (!data.metadata) {
            result.warnings.push('Missing metadata section');
        }
        
        if (!data.structure) {
            result.error = 'Missing structure section';
            return result;
        }
        
        if (!data.statistics) {
            result.warnings.push('Missing statistics section');
        }
        
        // Validate structure has document node
        if (!data.structure.document) {
            result.error = 'Missing document node in structure';
            return result;
        }
        
        result.valid = true;
        return result;
        
    } catch (exc) {
        return {
            valid: false,
            error: 'Structure validation failed: ' + exc.message,
            warnings: []
        };
    }
}

// =============================================================================
// ANALYSIS GENERATION FUNCTIONS
// =============================================================================

/**
 * Generate structure summary
 * @param {Object} jsonData - JSON data
 * @returns {Object} Structure summary
 */
function generateStructureSummary(jsonData) {
    try {
        var summary = {
            documentName: 'Unknown',
            totalNodes: 0,
            totalProperties: 0,
            collectionCount: 0,
            methodCount: 0,
            maxDepth: 0,
            hasObjectReferences: false,
            hasExtractedValues: false,
            hasCircularReferences: false
        };
        
        // Extract basic information
        if (jsonData.metadata && jsonData.metadata.documentName) {
            summary.documentName = jsonData.metadata.documentName;
        }
        
        if (jsonData.statistics) {
            summary.totalNodes = jsonData.statistics.totalNodes || 0;
            summary.totalProperties = jsonData.statistics.totalProperties || 0;
            summary.hasCircularReferences = (jsonData.statistics.circularReferences || 0) > 0;
        }
        
        // Analyze structure depth and content
        if (jsonData.structure && jsonData.structure.document) {
            var structureStats = analyzeNodeStructure(jsonData.structure.document, 0);
            summary.maxDepth = structureStats.maxDepth;
            summary.collectionCount = structureStats.collectionCount;
            summary.methodCount = structureStats.methodCount;
            summary.hasExtractedValues = structureStats.hasExtractedValues;
        }
        
        // Check for object references
        summary.hasObjectReferences = jsonData.objectRegistry && 
                                     countObjectKeys(jsonData.objectRegistry.references || {}) > 0;
        
        return summary;
        
    } catch (exc) {
        return {
            error: 'Summary generation failed: ' + exc.message
        };
    }
}

/**
 * Analyze node structure recursively
 * @param {Object} node - DOM node
 * @param {Number} currentDepth - Current depth
 * @returns {Object} Structure statistics
 */
function analyzeNodeStructure(node, currentDepth) {
    try {
        var stats = {
            maxDepth: currentDepth,
            collectionCount: 0,
            methodCount: 0,
            hasExtractedValues: false
        };
        
        if (!node) return stats;
        
        // Count collections and methods
        if (node.collections) {
            stats.collectionCount += node.collections.length;
        }
        
        if (node.methods) {
            stats.methodCount += node.methods.length;
        }
        
        // Check for extracted values
        if (node.properties) {
            for (var i = 0; i < node.properties.length; i++) {
                if (node.properties[i].extractedValue) {
                    stats.hasExtractedValues = true;
                    break;
                }
            }
        }
        
        // Recursively analyze child nodes
        if (node.childNodes && node.childNodes.length > 0) {
            for (var j = 0; j < node.childNodes.length; j++) {
                var childStats = analyzeNodeStructure(node.childNodes[j], currentDepth + 1);
                stats.maxDepth = Math.max(stats.maxDepth, childStats.maxDepth);
                stats.collectionCount += childStats.collectionCount;
                stats.methodCount += childStats.methodCount;
                if (childStats.hasExtractedValues) {
                    stats.hasExtractedValues = true;
                }
            }
        }
        
        return stats;
        
    } catch (exc) {
        return {
            maxDepth: currentDepth,
            collectionCount: 0,
            methodCount: 0,
            hasExtractedValues: false
        };
    }
}

/**
 * Generate visual hierarchy representation
 * @param {Object} jsonData - JSON data
 * @param {Object} config - Configuration
 * @returns {String} Visual hierarchy
 */
function generateVisualHierarchy(jsonData, config) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('DOM STRUCTURE HIERARCHY');
        builder.appendLine('======================');
        builder.appendLine('');
        
        if (jsonData.structure && jsonData.structure.document) {
            builder.appendLine(generateNodeHierarchy(jsonData.structure.document, 0, config));
        } else {
            builder.appendLine('No structure data available');
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Visual hierarchy generation failed: ' + exc.message;
    }
}

/**
 * Generate hierarchy text for a node
 * @param {Object} node - DOM node
 * @param {Number} depth - Current depth
 * @param {Object} config - Configuration
 * @returns {String} Node hierarchy text
 */
function generateNodeHierarchy(node, depth, config) {
    try {
        if (!node || depth > config.maxAnalysisDepth) {
            return '';
        }
        
        var builder = createStringBuilder();
        var indent = createHierarchyIndent(depth);
        
        // Node name and type
        var nodeDisplay = node.name + ' (' + node.type + ')';
        
        // Add counts
        var counts = [];
        if (node.properties && node.properties.length > 0) {
            counts.push(node.properties.length + ' props');
        }
        if (node.collections && node.collections.length > 0) {
            counts.push(node.collections.length + ' colls');
        }
        if (node.methods && node.methods.length > 0) {
            counts.push(node.methods.length + ' methods');
        }
        
        if (counts.length > 0) {
            nodeDisplay += ' [' + arrayJoin(counts, ', ') + ']';
        }
        
        builder.appendLine(indent + nodeDisplay);
        
        // Show key properties if enabled
        if (config.highlightKeyProperties && node.properties) {
            var keyProps = findKeyProperties(node.properties);
            for (var i = 0; i < keyProps.length && i < 3; i++) {
                var prop = keyProps[i];
                var propDisplay = indent + '  → ' + prop.name;
                if (prop.extractedValue) {
                    propDisplay += ': ' + stringSubstring(prop.extractedValue, 0, 30);
                    if (prop.extractedValue.length > 30) {
                        propDisplay += '...';
                    }
                }
                builder.appendLine(propDisplay);
            }
        }
        
        // Recursively show child nodes
        if (node.childNodes && node.childNodes.length > 0) {
            for (var j = 0; j < node.childNodes.length; j++) {
                builder.appendLine(generateNodeHierarchy(node.childNodes[j], depth + 1, config));
            }
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Node hierarchy error: ' + exc.message;
    }
}

/**
 * Create hierarchy indentation
 * @param {Number} depth - Depth level
 * @returns {String} Indentation string
 */
function createHierarchyIndent(depth) {
    try {
        var indent = '';
        for (var i = 0; i < depth; i++) {
            indent += '  ';
        }
        if (depth > 0) {
            indent += '├─ ';
        }
        return indent;
    } catch (exc) {
        return '';
    }
}

/**
 * Find key properties in a property array
 * @param {Array} properties - Properties array
 * @returns {Array} Key properties
 */
function findKeyProperties(properties) {
    try {
        var keyProps = [];
        var keyPropNames = ['name', 'title', 'id', 'label', 'value', 'text', 'content'];
        
        // First pass: look for known key property names
        for (var i = 0; i < keyPropNames.length; i++) {
            for (var j = 0; j < properties.length; j++) {
                if (stringToLowerCase(properties[j].name) === keyPropNames[i] && 
                    properties[j].extractedValue) {
                    keyProps.push(properties[j]);
                    break;
                }
            }
        }
        
        // Second pass: add other properties with extracted values
        if (keyProps.length < 3) {
            for (var k = 0; k < properties.length && keyProps.length < 5; k++) {
                if (properties[k].extractedValue && 
                    arrayIndexOf(keyProps, properties[k]) === -1) {
                    keyProps.push(properties[k]);
                }
            }
        }
        
        return keyProps;
        
    } catch (exc) {
        return [];
    }
}

/**
 * Generate property analysis
 * @param {Object} jsonData - JSON data
 * @param {Object} config - Configuration
 * @returns {String} Property analysis
 */
function generatePropertyAnalysis(jsonData, config) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('PROPERTY ANALYSIS');
        builder.appendLine('=================');
        builder.appendLine('');
        
        // Collect all properties
        var allProperties = collectAllProperties(jsonData.structure);
        
        if (allProperties.length === 0) {
            builder.appendLine('No properties found.');
            return builder.toString();
        }
        
        // Analyze property types
        var typeStats = analyzePropertyTypes(allProperties);
        builder.appendLine('Property Types:');
        for (var type in typeStats) {
            if (objectHasOwnProperty(typeStats, type)) {
                builder.appendLine('  ' + type + ': ' + typeStats[type] + ' properties');
            }
        }
        builder.appendLine('');
        
        // Analyze safety levels
        var safetyStats = analyzePropertySafety(allProperties);
        builder.appendLine('Safety Analysis:');
        for (var safety in safetyStats) {
            if (objectHasOwnProperty(safetyStats, safety)) {
                builder.appendLine('  ' + safety + ': ' + safetyStats[safety] + ' properties');
            }
        }
        builder.appendLine('');
        
        // Show extracted values statistics
        var valueStats = analyzeExtractedValues(allProperties);
        builder.appendLine('Extracted Values:');
        builder.appendLine('  Total with values: ' + valueStats.withValues);
        builder.appendLine('  Total without values: ' + valueStats.withoutValues);
        builder.appendLine('  Value extraction rate: ' + valueStats.extractionRate + '%');
        
        return builder.toString();
        
    } catch (exc) {
        return 'Property analysis failed: ' + exc.message;
    }
}

/**
 * Collect all properties from structure
 * @param {Object} structure - DOM structure
 * @returns {Array} All properties
 */
function collectAllProperties(structure) {
    try {
        var allProps = [];
        
        function collectFromNode(node) {
            if (!node) return;
            
            if (node.properties) {
                for (var i = 0; i < node.properties.length; i++) {
                    allProps.push(node.properties[i]);
                }
            }
            
            if (node.collections) {
                for (var j = 0; j < node.collections.length; j++) {
                    allProps.push(node.collections[j]);
                }
            }
            
            if (node.childNodes) {
                for (var k = 0; k < node.childNodes.length; k++) {
                    collectFromNode(node.childNodes[k]);
                }
            }
        }
        
        if (structure && structure.document) {
            collectFromNode(structure.document);
        }
        
        return allProps;
        
    } catch (exc) {
        return [];
    }
}

/**
 * Analyze property types
 * @param {Array} properties - Properties array
 * @returns {Object} Type statistics
 */
function analyzePropertyTypes(properties) {
    try {
        var typeStats = {};
        
        for (var i = 0; i < properties.length; i++) {
            var prop = properties[i];
            var type = prop.type || 'unknown';
            
            if (!typeStats[type]) {
                typeStats[type] = 0;
            }
            typeStats[type]++;
        }
        
        return typeStats;
        
    } catch (exc) {
        return {};
    }
}

/**
 * Analyze property safety levels
 * @param {Array} properties - Properties array
 * @returns {Object} Safety statistics
 */
function analyzePropertySafety(properties) {
    try {
        var safetyStats = {};
        
        for (var i = 0; i < properties.length; i++) {
            var prop = properties[i];
            var safety = prop.safetyLevel || 'unknown';
            
            if (!safetyStats[safety]) {
                safetyStats[safety] = 0;
            }
            safetyStats[safety]++;
        }
        
        return safetyStats;
        
    } catch (exc) {
        return {};
    }
}

/**
 * Analyze extracted values
 * @param {Array} properties - Properties array
 * @returns {Object} Value statistics
 */
function analyzeExtractedValues(properties) {
    try {
        var stats = {
            withValues: 0,
            withoutValues: 0,
            extractionRate: 0
        };
        
        for (var i = 0; i < properties.length; i++) {
            var prop = properties[i];
            if (prop.extractedValue !== null && prop.extractedValue !== undefined) {
                stats.withValues++;
            } else {
                stats.withoutValues++;
            }
        }
        
        var total = stats.withValues + stats.withoutValues;
        if (total > 0) {
            stats.extractionRate = Math.round((stats.withValues / total) * 100);
        }
        
        return stats;
        
    } catch (exc) {
        return {
            withValues: 0,
            withoutValues: 0,
            extractionRate: 0
        };
    }
}

/**
 * Generate collection analysis
 * @param {Object} jsonData - JSON data
 * @param {Object} config - Configuration
 * @returns {String} Collection analysis
 */
function generateCollectionAnalysis(jsonData, config) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('COLLECTION ANALYSIS');
        builder.appendLine('==================');
        builder.appendLine('');
        
        // Collect all collections
        var allCollections = collectAllCollections(jsonData.structure);
        
        if (allCollections.length === 0) {
            builder.appendLine('No collections found.');
            return builder.toString();
        }
        
        builder.appendLine('Total Collections Found: ' + allCollections.length);
        builder.appendLine('');
        
        // Analyze collection types and content
        for (var i = 0; i < Math.min(allCollections.length, config.maxReportItems); i++) {
            var coll = allCollections[i];
            
            builder.appendLine('Collection: ' + coll.name);
            builder.appendLine('  Path: ' + coll.path);
            builder.appendLine('  Type: ' + (coll.type || 'unknown'));
            
            if (coll.collectionAnalysis) {
                var analysis = coll.collectionAnalysis;
                if (analysis.itemCount !== undefined) {
                    builder.appendLine('  Items: ' + analysis.itemCount);
                }
                if (analysis.collectionType) {
                    builder.appendLine('  Collection Type: ' + analysis.collectionType);
                }
                if (analysis.contentSummary) {
                    builder.appendLine('  Content: ' + generateCollectionContentSummary(analysis.contentSummary));
                }
            }
            
            builder.appendLine('');
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Collection analysis failed: ' + exc.message;
    }
}

/**
 * Collect all collections from structure
 * @param {Object} structure - DOM structure
 * @returns {Array} All collections
 */
function collectAllCollections(structure) {
    try {
        var allColls = [];
        
        function collectFromNode(node) {
            if (!node) return;
            
            if (node.collections) {
                for (var i = 0; i < node.collections.length; i++) {
                    allColls.push(node.collections[i]);
                }
            }
            
            if (node.childNodes) {
                for (var j = 0; j < node.childNodes.length; j++) {
                    collectFromNode(node.childNodes[j]);
                }
            }
        }
        
        if (structure && structure.document) {
            collectFromNode(structure.document);
        }
        
        return allColls;
        
    } catch (exc) {
        return [];
    }
}

/**
 * Generate collection content summary text
 * @param {Object} contentSummary - Content summary
 * @returns {String} Summary text
 */
function generateCollectionContentSummary(contentSummary) {
    try {
        if (!contentSummary) return 'No summary available';
        
        var parts = [];
        
        if (contentSummary.totalSamples) {
            parts.push(contentSummary.totalSamples + ' samples');
        }
        
        if (contentSummary.itemTypes) {
            var types = [];
            for (var type in contentSummary.itemTypes) {
                if (objectHasOwnProperty(contentSummary.itemTypes, type)) {
                    types.push(type + '(' + contentSummary.itemTypes[type] + ')');
                }
            }
            if (types.length > 0) {
                parts.push('types: ' + arrayJoin(types, ', '));
            }
        }
        
        if (contentSummary.hasErrors) {
            parts.push('has errors');
        }
        
        return arrayJoin(parts, ', ');
        
    } catch (exc) {
        return 'Summary error';
    }
}

/**
 * Generate value analysis
 * @param {Object} jsonData - JSON data
 * @param {Object} config - Configuration
 * @returns {String} Value analysis
 */
function generateValueAnalysis(jsonData, config) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('VALUE ANALYSIS');
        builder.appendLine('==============');
        builder.appendLine('');
        
        // Analyze value sampling metadata
        if (jsonData.metadata && jsonData.metadata.valueSampling) {
            var sampling = jsonData.metadata.valueSampling;
            
            builder.appendLine('Value Sampling Status: ' + (sampling.enabled ? 'Enabled' : 'Disabled'));
            
            if (sampling.enabled && sampling.statistics) {
                builder.appendLine('Statistics:');
                builder.appendLine('  Properties Sampled: ' + (sampling.statistics.propertiesSampled || 0));
                builder.appendLine('  Values Extracted: ' + (sampling.statistics.valuesSampled || 0));
                builder.appendLine('  Null Values: ' + (sampling.statistics.nullValuesFound || 0));
                builder.appendLine('  Undefined Values: ' + (sampling.statistics.undefinedValuesFound || 0));
                builder.appendLine('  Errors: ' + (sampling.statistics.errorsEncountered || 0));
                
                if (sampling.performance) {
                    builder.appendLine('Performance:');
                    builder.appendLine('  Total Time: ' + (sampling.performance.totalTime || 0) + 'ms');
                    builder.appendLine('  Success Rate: ' + (sampling.performance.successRate || 0) + '%');
                }
            }
        } else {
            builder.appendLine('No value sampling data available.');
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Value analysis failed: ' + exc.message;
    }
}

/**
 * Generate accessibility map
 * @param {Object} jsonData - JSON data
 * @param {Object} config - Configuration
 * @returns {Object} Accessibility map
 */
function generateAccessibilityMap(jsonData, config) {
    try {
        var accessMap = {
            safeObjects: [],
            riskyObjects: [],
            inaccessibleObjects: [],
            recommendations: []
        };
        
        // Analyze structure for accessibility
        if (jsonData.structure && jsonData.structure.document) {
            analyzeNodeAccessibility(jsonData.structure.document, accessMap);
        }
        
        // Generate recommendations
        accessMap.recommendations = generateAccessibilityRecommendations(accessMap);
        
        return accessMap;
        
    } catch (exc) {
        return {
            error: 'Accessibility map generation failed: ' + exc.message
        };
    }
}

/**
 * Analyze node accessibility
 * @param {Object} node - DOM node
 * @param {Object} accessMap - Accessibility map to update
 */
function analyzeNodeAccessibility(node, accessMap) {
    try {
        if (!node) return;
        
        var accessInfo = {
            path: node.path,
            name: node.name,
            type: node.type,
            usabilityScore: 0
        };
        
        // Calculate usability score
        if (node.properties && node.properties.length > 0) {
            accessInfo.usabilityScore += Math.min(10, node.properties.length);
        }
        
        if (node.collections && node.collections.length > 0) {
            accessInfo.usabilityScore += node.collections.length * 5;
        }
        
        if (node.objectMetadata && node.objectMetadata.isCircular) {
            accessInfo.usabilityScore -= 20; // Penalize circular references
        }
        
        // Categorize based on safety and usability
        if (accessInfo.usabilityScore >= 10) {
            accessMap.safeObjects.push(accessInfo);
        } else if (accessInfo.usabilityScore >= 5) {
            accessMap.riskyObjects.push(accessInfo);
        } else {
            accessMap.inaccessibleObjects.push(accessInfo);
        }
        
        // Recursively analyze child nodes
        if (node.childNodes) {
            for (var i = 0; i < node.childNodes.length; i++) {
                analyzeNodeAccessibility(node.childNodes[i], accessMap);
            }
        }
        
    } catch (exc) {
        // Continue with other nodes
    }
}

/**
 * Generate accessibility recommendations
 * @param {Object} accessMap - Accessibility map
 * @returns {Array} Recommendations
 */
function generateAccessibilityRecommendations(accessMap) {
    try {
        var recommendations = [];
        
        if (accessMap.safeObjects.length > 0) {
            recommendations.push('Start with safe objects: ' + accessMap.safeObjects.length + ' available');
        }
        
        if (accessMap.riskyObjects.length > 0) {
            recommendations.push('Use caution with risky objects: ' + accessMap.riskyObjects.length + ' identified');
        }
        
        if (accessMap.inaccessibleObjects.length > 0) {
            recommendations.push('Avoid inaccessible objects: ' + accessMap.inaccessibleObjects.length + ' found');
        }
        
        return recommendations;
        
    } catch (exc) {
        return ['Recommendation generation failed'];
    }
}

/**
 * Generate developer guide
 * @param {Object} jsonData - JSON data
 * @param {Object} analysis - Analysis results
 * @param {Object} config - Configuration
 * @returns {String} Developer guide
 */
function generateDeveloperGuide(jsonData, analysis, config) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('DEVELOPER GUIDE');
        builder.appendLine('===============');
        builder.appendLine('');
        
        builder.appendLine('This guide provides insights for working with the analyzed DOM structure.');
        builder.appendLine('');
        
        // Summary insights
        if (analysis.summary) {
            builder.appendLine('OVERVIEW:');
            builder.appendLine('Document: ' + analysis.summary.documentName);
            builder.appendLine('Total Nodes: ' + analysis.summary.totalNodes);
            builder.appendLine('Total Properties: ' + analysis.summary.totalProperties);
            builder.appendLine('Maximum Depth: ' + analysis.summary.maxDepth);
            builder.appendLine('');
        }
        
        // Access recommendations
        if (analysis.accessibilityMap && analysis.accessibilityMap.recommendations) {
            builder.appendLine('ACCESS RECOMMENDATIONS:');
            for (var i = 0; i < analysis.accessibilityMap.recommendations.length; i++) {
                builder.appendLine('• ' + analysis.accessibilityMap.recommendations[i]);
            }
            builder.appendLine('');
        }
        
        // Code examples if enabled
        if (config.includeCodeExamples) {
            builder.appendLine('CODE EXAMPLES:');
            builder.appendLine('// Safe property access');
            builder.appendLine('try {');
            builder.appendLine('    var value = app.activeDocument.pages[0];');
            builder.appendLine('    $.writeln("Found: " + value);');
            builder.appendLine('} catch (e) {');
            builder.appendLine('    $.writeln("Access failed: " + e.message);');
            builder.appendLine('}');
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
registerModule('4.1_json-analyzer', '3.1', [
    // Main Analysis Functions
    'analyzeJSONExport', 'analyzeLoadedJSON',
    
    // File Operations
    'readAndParseJSONFile', 'parseJSONSafely', 'containsFunctionCallPattern',
    
    // Structure Validation
    'validateJSONStructure',
    
    // Analysis Generation
    'generateStructureSummary', 'analyzeNodeStructure', 'generateVisualHierarchy',
    'generateNodeHierarchy', 'createHierarchyIndent', 'findKeyProperties',
    'generatePropertyAnalysis', 'collectAllProperties', 'analyzePropertyTypes',
    'analyzePropertySafety', 'analyzeExtractedValues', 'generateCollectionAnalysis',
    'collectAllCollections', 'generateCollectionContentSummary', 'generateValueAnalysis',
    'generateAccessibilityMap', 'analyzeNodeAccessibility', 'generateAccessibilityRecommendations',
    'generateDeveloperGuide'
]);

// =============================================================================
// END OF 4.1_json-analyzer.jsx
// =============================================================================