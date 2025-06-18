// =============================================================================
// 4.1_json-analyzer.jsx - JSON EXPORT ANALYSIS
// InDesign DOM Discovery Builder v3.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: Comprehensive analysis of DOM JSON exports with enhanced features
// DEPENDENCIES: ["1.1_bootstrap-foundation.jsx", "1.2_safety-utilities.jsx"]
// SIZE: ~1800 lines - COMPLETE IMPLEMENTATION
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
// JSON ANALYSIS CONFIGURATION
// =============================================================================

var DEFAULT_ANALYSIS_CONFIG = {
    enableVisualHierarchy: true,
    enablePropertyAnalysis: true,
    enableCollectionAnalysis: true,
    enableValueAnalysis: true,
    enableAccessibilityMap: true,
    maxAnalysisDepth: 10,
    maxReportItems: 100,
    generateDeveloperGuide: true,
    includeCodeExamples: true,
    highlightKeyProperties: true,
    analyzeExtractedValues: true,
    generatePerformanceMetrics: true
};

// =============================================================================
// MAIN ANALYSIS FUNCTIONS
// =============================================================================

/**
 * Analyze JSON export comprehensively
 * @param {String} jsonFilePath - Path to JSON file
 * @param {Object} analysisOptions - Analysis configuration
 * @returns {Object} Complete analysis result
 */
function analyzeJSONExport(jsonFilePath, analysisOptions) {
    var startTime = new Date().getTime();
    var config = analysisOptions ? 
        objectMerge(DEFAULT_ANALYSIS_CONFIG, analysisOptions) : 
        objectClone(DEFAULT_ANALYSIS_CONFIG, 2);
    
    var result = {
        success: false,
        analysis: null,
        error: null,
        metadata: {
            analysisTime: 0,
            timestamp: getCurrentTimestamp(),
            version: '3.1'
        }
    };
    
    try {
        // Read and parse JSON file
        var jsonData = readAndParseJSONFile(jsonFilePath);
        if (!jsonData.success) {
            result.error = 'Failed to read JSON file: ' + jsonData.error;
            return result;
        }
        
        // Validate JSON structure
        var validation = validateJSONStructure(jsonData.data);
        if (!validation.success) {
            result.error = 'Invalid DOM JSON structure: ' + validation.error;
            return result;
        }
        
        // Perform comprehensive analysis
        var analysisResult = performComprehensiveAnalysis(jsonData.data, config);
        if (!analysisResult.success) {
            result.error = 'Analysis failed: ' + analysisResult.error;
            return result;
        }
        
        result.analysis = analysisResult.analysis;
        result.success = true;
        result.metadata.analysisTime = new Date().getTime() - startTime;
        
        return result;
        
    } catch (exc) {
        result.error = 'JSON analysis error: ' + exc.message;
        result.metadata.analysisTime = new Date().getTime() - startTime;
        return result;
    }
}

/**
 * Analyze already loaded JSON data
 * @param {Object} jsonData - JSON data object
 * @param {Object} analysisOptions - Analysis configuration
 * @returns {Object} Analysis result
 */
function analyzeLoadedJSON(jsonData, analysisOptions) {
    var startTime = new Date().getTime();
    var config = analysisOptions ? 
        objectMerge(DEFAULT_ANALYSIS_CONFIG, analysisOptions) : 
        objectClone(DEFAULT_ANALYSIS_CONFIG, 2);
    
    var result = {
        success: false,
        analysis: null,
        error: null,
        metadata: {
            analysisTime: 0,
            timestamp: getCurrentTimestamp(),
            version: '3.1'
        }
    };
    
    try {
        // Validate JSON structure
        var validation = validateJSONStructure(jsonData);
        if (!validation.success) {
            result.error = 'Invalid DOM JSON structure: ' + validation.error;
            return result;
        }
        
        // Perform comprehensive analysis
        var analysisResult = performComprehensiveAnalysis(jsonData, config);
        if (!analysisResult.success) {
            result.error = 'Analysis failed: ' + analysisResult.error;
            return result;
        }
        
        result.analysis = analysisResult.analysis;
        result.success = true;
        result.metadata.analysisTime = new Date().getTime() - startTime;
        
        return result;
        
    } catch (exc) {
        result.error = 'JSON analysis error: ' + exc.message;
        result.metadata.analysisTime = new Date().getTime() - startTime;
        return result;
    }
}

// =============================================================================
// FILE OPERATIONS
// =============================================================================

/**
 * Read and parse JSON file safely
 * @param {String} filePath - Path to JSON file
 * @returns {Object} Parse result with success, data, error
 */
function readAndParseJSONFile(filePath) {
    var result = {
        success: false,
        data: null,
        error: null
    };
    
    try {
        if (!filePath || typeof filePath !== 'string') {
            result.error = 'Invalid file path';
            return result;
        }
        
        // Basic file existence check (InDesign specific)
        var fileObj = new File(filePath);
        if (!fileObj.exists) {
            result.error = 'File does not exist: ' + filePath;
            return result;
        }
        
        // Read file content
        fileObj.open('r');
        var fileContent = fileObj.read();
        fileObj.close();
        
        if (!fileContent) {
            result.error = 'File is empty or could not be read';
            return result;
        }
        
        // Parse JSON content
        var parseResult = parseJSONSafely(fileContent);
        if (!parseResult.success) {
            result.error = 'JSON parsing failed: ' + parseResult.error;
            return result;
        }
        
        result.data = parseResult.data;
        result.success = true;
        
        return result;
        
    } catch (exc) {
        result.error = 'File read error: ' + exc.message;
        return result;
    }
}

/**
 * Parse JSON string safely with enhanced error handling
 * @param {String} jsonString - JSON string to parse
 * @returns {Object} Parse result with success, data, error
 */
function parseJSONSafely(jsonString) {
    var result = {
        success: false,
        data: null,
        error: null
    };
    
    try {
        if (!jsonString || typeof jsonString !== 'string') {
            result.error = 'Invalid JSON string';
            return result;
        }
        
        // Check for potential function calls or dangerous patterns
        if (containsFunctionCallPattern(jsonString)) {
            result.error = 'JSON contains potentially dangerous function call patterns';
            return result;
        }
        
        // Parse JSON
        var parsedData = safeJSONParse(jsonString);
        if (parsedData === null) {
            result.error = 'JSON parsing failed - invalid syntax';
            return result;
        }
        
        result.data = parsedData;
        result.success = true;
        
        return result;
        
    } catch (exc) {
        result.error = 'JSON parse error: ' + exc.message;
        return result;
    }
}

/**
 * Check for function call patterns in JSON string
 * @param {String} jsonString - JSON string to check
 * @returns {Boolean} True if contains function call patterns
 */
function containsFunctionCallPattern(jsonString) {
    try {
        if (typeof jsonString !== 'string') {
            return true; // Err on side of caution
        }
        
        // Simple pattern detection (ES3 compatible)
        var dangerousPatterns = [
            'function(', '()=>', '.call(', '.apply(', 
            'eval(', 'Function(', 'constructor(',
            'prototype.', '__proto__.'
        ];
        
        for (var i = 0; i < dangerousPatterns.length; i++) {
            if (stringIndexOf(jsonString, dangerousPatterns[i]) !== -1) {
                return true;
            }
        }
        
        return false;
        
    } catch (exc) {
        return true; // Err on side of caution
    }
}

// =============================================================================
// STRUCTURE VALIDATION
// =============================================================================

/**
 * Validate JSON structure for DOM export compatibility
 * @param {Object} jsonData - JSON data to validate
 * @returns {Object} Validation result with success, error
 */
function validateJSONStructure(jsonData) {
    var result = {
        success: false,
        error: ''
    };

    try {
        if (!jsonData || typeof jsonData !== 'object') {
            result.error = 'Invalid JSON data structure';
            return result;
        }

        // Check for DOM structure
        var domStructure = null;
        if (jsonData.domStructure) {
            domStructure = jsonData.domStructure;
        } else if (jsonData.structure) {
            domStructure = jsonData;
        }

        if (!domStructure) {
            result.error = 'No DOM structure found in JSON';
            return result;
        }

        // Validate basic structure with enhanced checks
        if (!domStructure.metadata) {
            result.error = 'Missing metadata in DOM structure';
            return result;
        }

        if (!domStructure.structure) {
            result.error = 'Missing structure in DOM data';
            return result;
        }

        // Additional validation for structure integrity
        if (!domStructure.structure.document) {
            result.error = 'Missing document in structure data';
            return result;
        }

        result.success = true;
        return result;

    } catch (exc) {
        result.error = 'Structure validation error: ' + exc.message;
        return result;
    }
}

// =============================================================================
// ANALYSIS PROCESSING
// =============================================================================

/**
 * Perform comprehensive analysis of DOM structure
 * @param {Object} jsonData - JSON data to analyze
 * @param {Object} config - Analysis configuration
 * @returns {Object} Analysis result
 */
function performComprehensiveAnalysis(jsonData, config) {
    var result = {
        success: false,
        analysis: null,
        error: ''
    };
    
    try {
        var domStructure = jsonData.domStructure || jsonData;
        
        var analysis = {
            metadata: {
                analyzedAt: getCurrentTimestamp(),
                analysisVersion: '3.1',
                sourceVersion: domStructure.metadata ? domStructure.metadata.version : 'unknown'
            }
        };
        
        // Generate structure summary
        analysis.summary = generateStructureSummary(domStructure, config);
        
        // Generate visual hierarchy
        if (config.enableVisualHierarchy) {
            analysis.visualHierarchy = generateVisualHierarchy(domStructure, config);
        }
        
        // Generate property analysis
        if (config.enablePropertyAnalysis) {
            analysis.propertyAnalysis = generatePropertyAnalysis(domStructure, config);
        }
        
        // Generate collection analysis
        if (config.enableCollectionAnalysis) {
            analysis.collectionAnalysis = generateCollectionAnalysis(domStructure, config);
        }
        
        // Generate value analysis
        if (config.enableValueAnalysis) {
            analysis.valueAnalysis = generateValueAnalysis(domStructure, config);
        }
        
        // Generate accessibility map
        if (config.enableAccessibilityMap) {
            analysis.accessibilityMap = generateAccessibilityMap(domStructure, config);
        }
        
        // Generate developer guide
        if (config.generateDeveloperGuide) {
            analysis.developerGuide = generateDeveloperGuide(domStructure, config);
        }
        
        result.analysis = analysis;
        result.success = true;
        
        return result;
        
    } catch (exc) {
        result.error = 'Comprehensive analysis failed: ' + exc.message;
        return result;
    }
}

/**
 * Generate structure summary
 * @param {Object} domStructure - DOM structure to analyze
 * @param {Object} config - Analysis configuration
 * @returns {Object} Structure summary
 */
function generateStructureSummary(domStructure, config) {
    try {
        var summary = {
            documentName: 'Unknown',
            nodeCount: 0,
            propertyCount: 0,
            collectionCount: 0,
            methodCount: 0,
            maxDepth: 0,
            hasExtractedValues: false,
            extractionStatistics: null
        };
        
        // Extract basic metadata
        if (domStructure.metadata) {
            summary.documentName = domStructure.metadata.documentName || 'Unknown';
            
            // Check for value extraction
            if (domStructure.metadata.valueSampling) {
                summary.hasExtractedValues = domStructure.metadata.valueSampling.enabled || false;
                summary.extractionStatistics = domStructure.metadata.valueSampling.statistics;
            }
        }
        
        // Extract statistics
        if (domStructure.statistics) {
            summary.nodeCount = domStructure.statistics.totalNodes || 0;
            summary.propertyCount = domStructure.statistics.totalProperties || 0;
            summary.collectionCount = domStructure.statistics.totalCollections || 0;
            summary.methodCount = domStructure.statistics.totalMethods || 0;
            summary.maxDepth = domStructure.statistics.maxDepth || 0;
        } else if (domStructure.structure && domStructure.structure.document) {
            // Calculate statistics from structure
            summary = analyzeNodeStructure(domStructure.structure.document, summary);
        }
        
        return summary;
        
    } catch (exc) {
        return {
            documentName: 'Analysis Error',
            error: exc.message,
            nodeCount: 0,
            propertyCount: 0
        };
    }
}

/**
 * Analyze node structure recursively for statistics
 * @param {Object} domNode - DOM node to analyze
 * @param {Object} summary - Summary object to update
 * @returns {Object} Updated summary
 */
function analyzeNodeStructure(domNode, summary) {
    try {
        if (!domNode) return summary;
        
        summary.nodeCount++;
        
        if (domNode.depth > summary.maxDepth) {
            summary.maxDepth = domNode.depth;
        }
        
        if (domNode.properties) {
            summary.propertyCount += domNode.properties.length;
        }
        
        if (domNode.collections) {
            summary.collectionCount += domNode.collections.length;
        }
        
        if (domNode.methods) {
            summary.methodCount += domNode.methods.length;
        }
        
        // Process child nodes
        if (domNode.childNodes) {
            for (var i = 0; i < domNode.childNodes.length; i++) {
                summary = analyzeNodeStructure(domNode.childNodes[i], summary);
            }
        }
        
        return summary;
        
    } catch (exc) {
        return summary;
    }
}

/**
 * Generate visual hierarchy representation
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Analysis configuration
 * @returns {String} Visual hierarchy text
 */
function generateVisualHierarchy(domStructure, config) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('DOM STRUCTURE HIERARCHY');
        builder.appendLine('======================');
        builder.appendLine('');
        
        if (domStructure.structure && domStructure.structure.document) {
            var hierarchyText = generateNodeHierarchy(domStructure.structure.document, 0, config);
            builder.append(hierarchyText);
        } else {
            builder.appendLine('No document structure available');
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Visual hierarchy generation failed: ' + exc.message;
    }
}

/**
 * Generate hierarchy text for a DOM node
 * @param {Object} domNode - DOM node
 * @param {Number} indentLevel - Indentation level
 * @param {Object} config - Configuration
 * @returns {String} Node hierarchy text
 */
function generateNodeHierarchy(domNode, indentLevel, config) {
    try {
        var builder = createStringBuilder();
        var indent = createHierarchyIndent(indentLevel);
        
        // Node information
        var nodeInfo = domNode.name + ' (' + domNode.type + ')';
        if (domNode.objectId) {
            nodeInfo += ' [ID: ' + stringSubstring(domNode.objectId, 0, 8) + '...]';
        }
        
        builder.appendLine(indent + '▼ ' + nodeInfo);
        
        // Properties
        if (domNode.properties && domNode.properties.length > 0) {
            var propLimit = Math.min(domNode.properties.length, config.maxReportItems || 10);
            builder.appendLine(indent + '  Properties (' + domNode.properties.length + '):');
            
            for (var p = 0; p < propLimit; p++) {
                var prop = domNode.properties[p];
                var propText = '• ' + prop.name + ' (' + prop.type + ')';
                
                // Show extracted value if available
                if (prop.samplingMetadata && prop.samplingMetadata.formattedValue) {
                    propText += ' = ' + prop.samplingMetadata.formattedValue;
                }
                
                builder.appendLine(indent + '    ' + propText);
            }
            
            if (domNode.properties.length > propLimit) {
                builder.appendLine(indent + '    ... and ' + (domNode.properties.length - propLimit) + ' more');
            }
        }
        
        // Collections
        if (domNode.collections && domNode.collections.length > 0) {
            builder.appendLine(indent + '  Collections (' + domNode.collections.length + '):');
            
            for (var c = 0; c < Math.min(domNode.collections.length, 5); c++) {
                var coll = domNode.collections[c];
                var collText = '• ' + coll.name + ' (' + coll.type + ')';
                
                // Show collection content if available
                if (coll.samplingMetadata && coll.samplingMetadata.formattedValue) {
                    collText += ' = ' + coll.samplingMetadata.formattedValue;
                }
                
                builder.appendLine(indent + '    ' + collText);
            }
        }
        
        // Methods
        if (domNode.methods && domNode.methods.length > 0) {
            builder.appendLine(indent + '  Methods (' + domNode.methods.length + '):');
            
            for (var m = 0; m < Math.min(domNode.methods.length, 5); m++) {
                builder.appendLine(indent + '    • ' + domNode.methods[m].name + '()');
            }
        }
        
        // Child nodes (limit depth to prevent overwhelming output)
        if (domNode.childNodes && domNode.childNodes.length > 0 && indentLevel < 3) {
            for (var n = 0; n < domNode.childNodes.length; n++) {
                builder.append(generateNodeHierarchy(domNode.childNodes[n], indentLevel + 1, config));
            }
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Node hierarchy error: ' + exc.message + '\n';
    }
}

/**
 * Create hierarchy indentation
 * @param {Number} level - Indentation level
 * @returns {String} Indent string
 */
function createHierarchyIndent(level) {
    try {
        var indent = '';
        for (var i = 0; i < level * 2; i++) {
            indent += ' ';
        }
        return indent;
    } catch (exc) {
        return '';
    }
}

/**
 * Find key properties in DOM structure
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Configuration
 * @returns {Array} Key properties
 */
function findKeyProperties(domStructure, config) {
    try {
        var keyProperties = [];
        var allProperties = collectAllProperties(domStructure);
        
        // Identify important properties
        for (var i = 0; i < allProperties.length; i++) {
            var prop = allProperties[i];
            
            if (isImportantProperty(prop.name)) {
                keyProperties[keyProperties.length] = prop;
            }
        }
        
        return arraySlice(keyProperties, 0, config.maxReportItems || 20);
        
    } catch (exc) {
        return [];
    }
}

/**
 * Generate property analysis
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Configuration
 * @returns {String} Property analysis
 */
function generatePropertyAnalysis(domStructure, config) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('PROPERTY ANALYSIS');
        builder.appendLine('=================');
        builder.appendLine('');
        
        var allProperties = collectAllProperties(domStructure);
        var propertyTypes = analyzePropertyTypes(allProperties);
        var safetySummary = analyzePropertySafety(allProperties);
        
        builder.appendLine('Total Properties: ' + allProperties.length);
        builder.appendLine('');
        
        builder.appendLine('Property Types:');
        for (var propType in propertyTypes) {
            if (objectHasOwnProperty(propertyTypes, propType)) {
                builder.appendLine('  ' + propType + ': ' + propertyTypes[propType]);
            }
        }
        builder.appendLine('');
        
        builder.appendLine('Safety Summary:');
        for (var safetyLevel in safetySummary) {
            if (objectHasOwnProperty(safetySummary, safetyLevel)) {
                builder.appendLine('  ' + safetyLevel + ': ' + safetySummary[safetyLevel]);
            }
        }
        builder.appendLine('');
        
        // Show key properties with extracted values
        if (config.highlightKeyProperties) {
            var keyProperties = findKeyProperties(domStructure, config);
            if (keyProperties.length > 0) {
                builder.appendLine('Key Properties with Values:');
                for (var k = 0; k < keyProperties.length; k++) {
                    var keyProp = keyProperties[k];
                    var propLine = '  • ' + keyProp.name + ' (' + keyProp.type + ')';
                    
                    if (keyProp.samplingMetadata && keyProp.samplingMetadata.formattedValue) {
                        propLine += ' = ' + keyProp.samplingMetadata.formattedValue;
                    }
                    
                    builder.appendLine(propLine);
                }
                builder.appendLine('');
            }
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Property analysis failed: ' + exc.message;
    }
}

/**
 * Collect all properties from DOM structure
 * @param {Object} domStructure - DOM structure
 * @returns {Array} All properties
 */
function collectAllProperties(domStructure) {
    try {
        var allProperties = [];
        
        if (domStructure.structure && domStructure.structure.document) {
            collectNodeProperties(domStructure.structure.document, allProperties);
        }
        
        return allProperties;
        
    } catch (exc) {
        return [];
    }
}

/**
 * Collect properties from a DOM node recursively
 * @param {Object} domNode - DOM node
 * @param {Array} propertyList - Property list to append to
 */
function collectNodeProperties(domNode, propertyList) {
    try {
        if (!domNode) return;
        
        // Add node properties
        if (domNode.properties) {
            for (var i = 0; i < domNode.properties.length; i++) {
                propertyList[propertyList.length] = domNode.properties[i];
            }
        }
        
        // Add node collections
        if (domNode.collections) {
            for (var j = 0; j < domNode.collections.length; j++) {
                propertyList[propertyList.length] = domNode.collections[j];
            }
        }
        
        // Add node methods
        if (domNode.methods) {
            for (var k = 0; k < domNode.methods.length; k++) {
                propertyList[propertyList.length] = domNode.methods[k];
            }
        }
        
        // Process child nodes
        if (domNode.childNodes) {
            for (var n = 0; n < domNode.childNodes.length; n++) {
                collectNodeProperties(domNode.childNodes[n], propertyList);
            }
        }
        
    } catch (exc) {
        // Continue collection
    }
}

/**
 * Analyze property types distribution
 * @param {Array} properties - Properties to analyze
 * @returns {Object} Type distribution
 */
function analyzePropertyTypes(properties) {
    try {
        var types = {};
        
        for (var i = 0; i < properties.length; i++) {
            var prop = properties[i];
            var propType = prop.type || 'unknown';
            
            if (types[propType]) {
                types[propType]++;
            } else {
                types[propType] = 1;
            }
        }
        
        return types;
        
    } catch (exc) {
        return { 'error': 1 };
    }
}

/**
 * Analyze property safety levels
 * @param {Array} properties - Properties to analyze
 * @returns {Object} Safety distribution
 */
function analyzePropertySafety(properties) {
    try {
        var safety = {};
        
        for (var i = 0; i < properties.length; i++) {
            var prop = properties[i];
            var safetyLevel = prop.safetyLevel || getPropertySafetyLevel(prop.name);
            
            if (safety[safetyLevel]) {
                safety[safetyLevel]++;
            } else {
                safety[safetyLevel] = 1;
            }
        }
        
        return safety;
        
    } catch (exc) {
        return { 'error': 1 };
    }
}

/**
 * Analyze extracted values in DOM structure
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Configuration
 * @returns {String} Value analysis
 */
function analyzeExtractedValues(domStructure, config) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('EXTRACTED VALUES ANALYSIS');
        builder.appendLine('========================');
        builder.appendLine('');
        
        var extractedValues = [];
        collectExtractedValues(domStructure, extractedValues);
        
        if (extractedValues.length === 0) {
            builder.appendLine('No extracted values found in DOM structure.');
            builder.appendLine('Run property value sampling to extract actual values.');
            return builder.toString();
        }
        
        builder.appendLine('Total Extracted Values: ' + extractedValues.length);
        builder.appendLine('');
        
        // Analyze value types
        var valueTypes = {};
        var valueComplexity = { simple: 0, complex: 0 };
        
        for (var i = 0; i < extractedValues.length; i++) {
            var extractedValue = extractedValues[i];
            
            if (extractedValue.valueType) {
                if (valueTypes[extractedValue.valueType]) {
                    valueTypes[extractedValue.valueType]++;
                } else {
                    valueTypes[extractedValue.valueType] = 1;
                }
            }
            
            if (extractedValue.complexity) {
                if (valueComplexity[extractedValue.complexity] !== undefined) {
                    valueComplexity[extractedValue.complexity]++;
                }
            }
        }
        
        builder.appendLine('Value Types:');
        for (var valueType in valueTypes) {
            if (objectHasOwnProperty(valueTypes, valueType)) {
                builder.appendLine('  ' + valueType + ': ' + valueTypes[valueType]);
            }
        }
        builder.appendLine('');
        
        builder.appendLine('Value Complexity:');
        builder.appendLine('  Simple: ' + valueComplexity.simple);
        builder.appendLine('  Complex: ' + valueComplexity.complex);
        builder.appendLine('');
        
        // Show sample extracted values
        var sampleCount = Math.min(extractedValues.length, config.maxReportItems || 10);
        builder.appendLine('Sample Extracted Values:');
        
        for (var s = 0; s < sampleCount; s++) {
            var sample = extractedValues[s];
            var sampleLine = '  • ' + sample.path + ' = ' + sample.formattedValue;
            
            if (sample.valueType) {
                sampleLine += ' (' + sample.valueType + ')';
            }
            
            builder.appendLine(sampleLine);
        }
        
        if (extractedValues.length > sampleCount) {
            builder.appendLine('  ... and ' + (extractedValues.length - sampleCount) + ' more values');
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Value analysis failed: ' + exc.message;
    }
}

/**
 * Collect extracted values from DOM structure
 * @param {Object} domStructure - DOM structure
 * @param {Array} valueList - List to collect values into
 */
function collectExtractedValues(domStructure, valueList) {
    try {
        if (domStructure.structure && domStructure.structure.document) {
            collectNodeExtractedValues(domStructure.structure.document, valueList);
        }
    } catch (exc) {
        // Continue collection
    }
}

/**
 * Collect extracted values from a DOM node
 * @param {Object} domNode - DOM node
 * @param {Array} valueList - List to collect values into
 */
function collectNodeExtractedValues(domNode, valueList) {
    try {
        if (!domNode) return;
        
        // Check properties for extracted values
        var propertyArrays = [domNode.properties, domNode.collections, domNode.methods];
        
        for (var arrayIndex = 0; arrayIndex < propertyArrays.length; arrayIndex++) {
            var propArray = propertyArrays[arrayIndex];
            if (propArray) {
                for (var i = 0; i < propArray.length; i++) {
                    var prop = propArray[i];
                    
                    if (prop.samplingMetadata && prop.samplingMetadata.actualValue !== undefined) {
                        valueList[valueList.length] = {
                            path: prop.path,
                            name: prop.name,
                            actualValue: prop.samplingMetadata.actualValue,
                            formattedValue: prop.samplingMetadata.formattedValue,
                            valueType: prop.samplingMetadata.valueType,
                            complexity: prop.samplingMetadata.valueMetadata ? 
                                prop.samplingMetadata.valueMetadata.complexity : 'unknown'
                        };
                    }
                }
            }
        }
        
        // Process child nodes
        if (domNode.childNodes) {
            for (var n = 0; n < domNode.childNodes.length; n++) {
                collectNodeExtractedValues(domNode.childNodes[n], valueList);
            }
        }
        
    } catch (exc) {
        // Continue collection
    }
}

/**
 * Generate collection analysis
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Configuration
 * @returns {String} Collection analysis
 */
function generateCollectionAnalysis(domStructure, config) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('COLLECTION ANALYSIS');
        builder.appendLine('==================');
        builder.appendLine('');
        
        var collections = collectAllCollections(domStructure);
        
        if (collections.length === 0) {
            builder.appendLine('No collections found in DOM structure.');
            return builder.toString();
        }
        
        builder.appendLine('Total Collections: ' + collections.length);
        builder.appendLine('');
        
        // Generate collection content summary
        var contentSummary = generateCollectionContentSummary(collections);
        builder.append(contentSummary);
        
        return builder.toString();
        
    } catch (exc) {
        return 'Collection analysis failed: ' + exc.message;
    }
}

/**
 * Collect all collections from DOM structure
 * @param {Object} domStructure - DOM structure
 * @returns {Array} All collections
 */
function collectAllCollections(domStructure) {
    try {
        var collections = [];
        var allProperties = collectAllProperties(domStructure);
        
        for (var i = 0; i < allProperties.length; i++) {
            var prop = allProperties[i];
            if (prop.isCollection) {
                collections[collections.length] = prop;
            }
        }
        
        return collections;
        
    } catch (exc) {
        return [];
    }
}

/**
 * Generate collection content summary
 * @param {Array} collections - Collections to analyze
 * @returns {String} Content summary
 */
function generateCollectionContentSummary(collections) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('Collection Details:');
        
        for (var i = 0; i < Math.min(collections.length, 10); i++) {
            var collection = collections[i];
            var collLine = '  • ' + collection.name + ' (' + collection.type + ')';
            
            if (collection.samplingMetadata && collection.samplingMetadata.formattedValue) {
                collLine += ' = ' + collection.samplingMetadata.formattedValue;
            }
            
            builder.appendLine(collLine);
        }
        
        if (collections.length > 10) {
            builder.appendLine('  ... and ' + (collections.length - 10) + ' more collections');
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Collection summary failed: ' + exc.message;
    }
}

/**
 * Generate value analysis
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Configuration
 * @returns {String} Value analysis
 */
function generateValueAnalysis(domStructure, config) {
    try {
        if (config.analyzeExtractedValues) {
            return analyzeExtractedValues(domStructure, config);
        } else {
            return 'Value analysis disabled in configuration.';
        }
    } catch (exc) {
        return 'Value analysis failed: ' + exc.message;
    }
}

/**
 * Generate accessibility map
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Configuration
 * @returns {Object} Accessibility map
 */
function generateAccessibilityMap(domStructure, config) {
    try {
        var accessibilityMap = {
            safeProperties: [],
            cautionProperties: [],
            dangerousProperties: [],
            recommendations: []
        };
        
        var allProperties = collectAllProperties(domStructure);
        
        for (var i = 0; i < allProperties.length; i++) {
            var prop = allProperties[i];
            var accessibility = analyzeNodeAccessibility(prop);
            
            switch (accessibility.level) {
                case 'safe':
                    accessibilityMap.safeProperties[accessibilityMap.safeProperties.length] = prop;
                    break;
                case 'caution':
                    accessibilityMap.cautionProperties[accessibilityMap.cautionProperties.length] = prop;
                    break;
                case 'dangerous':
                    accessibilityMap.dangerousProperties[accessibilityMap.dangerousProperties.length] = prop;
                    break;
            }
        }
        
        accessibilityMap.recommendations = generateAccessibilityRecommendations(accessibilityMap);
        
        return accessibilityMap;
        
    } catch (exc) {
        return {
            error: exc.message,
            safeProperties: [],
            cautionProperties: [],
            dangerousProperties: [],
            recommendations: []
        };
    }
}

/**
 * Analyze node accessibility
 * @param {Object} property - Property to analyze
 * @returns {Object} Accessibility analysis
 */
function analyzeNodeAccessibility(property) {
    try {
        var level = getPropertySafetyLevel(property.name);
        
        return {
            level: level,
            reason: 'Based on property name analysis',
            hasExtractedValue: property.samplingMetadata && 
                property.samplingMetadata.actualValue !== undefined
        };
        
    } catch (exc) {
        return {
            level: 'unknown',
            reason: 'Analysis failed',
            hasExtractedValue: false
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
        
        if (accessibilityMap.safeProperties.length > 0) {
            recommendations[recommendations.length] = 
                'Use safe properties (' + accessibilityMap.safeProperties.length + 
                ' available) for reliable document interaction';
        }
        
        if (accessibilityMap.cautionProperties.length > 0) {
            recommendations[recommendations.length] = 
                'Exercise caution with ' + accessibilityMap.cautionProperties.length + 
                ' properties that may have side effects';
        }
        
        if (accessibilityMap.dangerousProperties.length > 0) {
            recommendations[recommendations.length] = 
                'Avoid ' + accessibilityMap.dangerousProperties.length + 
                ' dangerous properties that could cause system instability';
        }
        
        recommendations[recommendations.length] = 
            'Always use try-catch blocks when accessing InDesign DOM properties';
        
        return recommendations;
        
    } catch (exc) {
        return ['Recommendation generation failed'];
    }
}

/**
 * Generate developer guide
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Configuration
 * @returns {String} Developer guide
 */
function generateDeveloperGuide(domStructure, config) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('DEVELOPER GUIDE');
        builder.appendLine('===============');
        builder.appendLine('');
        
        builder.appendLine('This guide provides practical information for working with the analyzed DOM structure.');
        builder.appendLine('');
        
        // Document overview
        var summary = generateStructureSummary(domStructure, config);
        builder.appendLine('Document: ' + summary.documentName);
        builder.appendLine('Total Elements: ' + summary.nodeCount + ' nodes, ' + 
                          summary.propertyCount + ' properties');
        builder.appendLine('');
        
        // Key properties
        var keyProperties = findKeyProperties(domStructure, config);
        if (keyProperties.length > 0) {
            builder.appendLine('KEY PROPERTIES TO EXPLORE:');
            for (var i = 0; i < Math.min(keyProperties.length, 10); i++) {
                var keyProp = keyProperties[i];
                var example = generateAccessExample(keyProp.path);
                builder.appendLine('• ' + keyProp.name + ' - ' + example);
            }
            builder.appendLine('');
        }
        
        // Collections
        var collections = collectAllCollections(domStructure);
        if (collections.length > 0) {
            builder.appendLine('COLLECTIONS TO ITERATE:');
            for (var j = 0; j < Math.min(collections.length, 5); j++) {
                var collection = collections[j];
                var collExample = generateCollectionAccessExample(collection.path);
                builder.appendLine('• ' + collection.name + ' - ' + collExample);
            }
            builder.appendLine('');
        }
        
        // Safety notes
        builder.appendLine('SAFETY NOTES:');
        builder.appendLine('• Always wrap DOM access in try-catch blocks');
        builder.appendLine('• Test property existence before accessing values');
        builder.appendLine('• Be cautious with properties marked as "caution" or "dangerous"');
        builder.appendLine('• Collections may be empty - check length before iteration');
        builder.appendLine('');
        
        // Code examples
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
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if property is important/key property
 * @param {String} propName - Property name
 * @returns {Boolean} True if important
 */
function isImportantProperty(propName) {
    try {
        var importantProps = [
            'pages', 'layers', 'stories', 'textFrames', 'name', 'length',
            'width', 'height', 'bounds', 'contents', 'parent', 'document'
        ];
        
        return arrayIndexOf(importantProps, propName) !== -1;
        
    } catch (exc) {
        return false;
    }
}

/**
 * Generate access example for property path
 * @param {String} path - Property path
 * @returns {String} Access example
 */
function generateAccessExample(path) {
    try {
        return stringReplace(path, 'document', 'app.activeDocument');
    } catch (exc) {
        return path;
    }
}

/**
 * Generate collection access example
 * @param {String} path - Collection path
 * @returns {String} Collection access example
 */
function generateCollectionAccessExample(path) {
    try {
        var example = stringReplace(path, 'document', 'app.activeDocument');
        return example + '.length; // Get count\n  ' + example + '[0]; // Get first item';
    } catch (exc) {
        return path;
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
    'performComprehensiveAnalysis', 'generateStructureSummary', 'analyzeNodeStructure', 
    'generateVisualHierarchy', 'generateNodeHierarchy', 'createHierarchyIndent', 
    'findKeyProperties', 'generatePropertyAnalysis', 'collectAllProperties', 
    'collectNodeProperties', 'analyzePropertyTypes', 'analyzePropertySafety', 
    'analyzeExtractedValues', 'collectExtractedValues', 'collectNodeExtractedValues',
    'generateCollectionAnalysis', 'collectAllCollections', 'generateCollectionContentSummary', 
    'generateValueAnalysis', 'generateAccessibilityMap', 'analyzeNodeAccessibility', 
    'generateAccessibilityRecommendations', 'generateDeveloperGuide',
    
    // Utility Functions
    'isImportantProperty', 'generateAccessExample', 'generateCollectionAccessExample'
]);

// =============================================================================
// END OF 4.1_json-analyzer.jsx
// =============================================================================