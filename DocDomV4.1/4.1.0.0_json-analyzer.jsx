// DocDomV4.1/4.1_json-analyzer.jsx
// 4.1_json-analyzer.jsx - JSON EXPORT ANALYSIS
// InDesign DOM Discovery Builder v4.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: Comprehensive analysis of DOM JSON exports with enhanced features
// DEPENDENCIES: ["1.1_bootstrap-foundation.jsx", "1.2_safety-utilities.jsx"]
// SIZE: ~1300 lines - COMPLETE IMPLEMENTATION - ENHANCED LOGGING - ES3 COMPLIANT
// CHANGES FROM 3.1: Fixed ES3 violations, enhanced logging, removed generateCollectionContentSummary duplicate
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
// MAIN ANALYSIS FUNCTIONS - ENHANCED LOGGING
// =============================================================================

/**
 * Analyze JSON export comprehensively - ENHANCED LOGGING
 * @param {String} jsonFilePath - Path to JSON file
 * @param {Object} analysisOptions - Analysis configuration
 * @returns {Object} Complete analysis result
 */
function analyzeJSONExport(jsonFilePath, analysisOptions) {
    var startTime = new Date().getTime();
    
    logDebug('=== STARTING analyzeJSONExport ===', 'general');
    logInfo('Analyzing JSON file: ' + jsonFilePath, 'general');
    
    var config = analysisOptions ? 
        objectMerge(DEFAULT_ANALYSIS_CONFIG, analysisOptions) : 
        DEFAULT_ANALYSIS_CONFIG;

    logDebug('Analysis config loaded - enableVisualHierarchy: ' + config.enableVisualHierarchy, 'general');

    try {
        // Read and parse JSON
        var jsonData = readAndParseJSONFile(jsonFilePath);
        if (!jsonData) {
            var readError = 'Failed to read or parse JSON file: ' + jsonFilePath;
            logError(readError, 'general');
            return {
                success: false,
                error: readError,
                analysisTime: new Date().getTime() - startTime
            };
        }

        logInfo('JSON file loaded successfully - performing analysis', 'general');

        // Perform analysis on loaded data
        var analysisResult = analyzeLoadedJSON(jsonData, config);
        analysisResult.analysisTime = new Date().getTime() - startTime;
        analysisResult.sourceFile = jsonFilePath;

        logInfo('JSON analysis completed in ' + analysisResult.analysisTime + 'ms', 'general');
        
        return analysisResult;

    } catch (exc) {
        var analysisError = 'JSON analysis error: ' + exc.message;
        logError(analysisError, 'general');
        return {
            success: false,
            error: analysisError,
            analysisTime: new Date().getTime() - startTime
        };
    }
}

/**
 * Analyze loaded JSON data - ENHANCED LOGGING
 * @param {Object} jsonData - Parsed JSON data
 * @param {Object} analysisOptions - Analysis configuration
 * @returns {Object} Analysis result
 */
function analyzeLoadedJSON(jsonData, analysisOptions) {
    var startTime = new Date().getTime();
    
    logDebug('=== STARTING analyzeLoadedJSON ===', 'general');
    
    var config = analysisOptions ? 
        objectMerge(DEFAULT_ANALYSIS_CONFIG, analysisOptions) : 
        DEFAULT_ANALYSIS_CONFIG;

    try {
        // Validate JSON structure
        var validation = validateJSONStructure(jsonData);
        if (!validation.valid) {
            var validationError = 'Invalid JSON structure: ' + validation.error;
            logWarn(validationError, 'general');
            return {
                success: false,
                error: validationError,
                analysisTime: new Date().getTime() - startTime
            };
        }

        logDebug('JSON structure validation passed', 'general');

        // Perform comprehensive analysis
        var analysisResult = performComprehensiveAnalysis(jsonData, config);
        analysisResult.success = true;
        analysisResult.analysisTime = new Date().getTime() - startTime;

        logInfo('JSON analysis completed successfully', 'general');
        
        return analysisResult;

    } catch (exc) {
        var analysisError = 'Loaded JSON analysis error: ' + exc.message;
        logError(analysisError, 'general');
        return {
            success: false,
            error: analysisError,
            analysisTime: new Date().getTime() - startTime
        };
    }
}

// =============================================================================
// FILE OPERATIONS - ENHANCED LOGGING
// =============================================================================

/**
 * Read and parse JSON file safely
 * @param {String} filePath - Path to JSON file
 * @returns {Object|null} Parsed JSON data or null
 */
function readAndParseJSONFile(filePath) {
    logDebug('Reading JSON file: ' + filePath, 'general');
    
    try {
        var file = new File(filePath);
        if (!file.exists) {
            logWarn('JSON file does not exist: ' + filePath, 'general');
            return null;
        }

        if (!file.open('r')) {
            logError('Could not open JSON file: ' + filePath, 'general');
            return null;
        }

        var content = file.read();
        file.close();

        logDebug('File content read, length: ' + content.length + ' characters', 'general');

        // Check for function call patterns that indicate non-JSON content
        if (containsFunctionCallPattern(content)) {
            logWarn('File appears to contain function calls, not pure JSON', 'general');
            return null;
        }

        return parseJSONSafely(content);

    } catch (exc) {
        logError('File read error: ' + exc.message, 'general');
        return null;
    }
}

/**
 * Parse JSON string safely
 * @param {String} jsonString - JSON string to parse
 * @returns {Object|null} Parsed object or null
 */
function parseJSONSafely(jsonString) {
    try {
        // Try native JSON first if available
        if (typeof JSON !== 'undefined' && JSON.parse) {
            return JSON.parse(jsonString);
        }

        // Fall back to eval (safe in this controlled context)
        var cleanedJson = stringReplace(jsonString, 'undefined', 'null');
        cleanedJson = stringReplace(cleanedJson, '\\"', '"');
        
        return eval('(' + cleanedJson + ')');

    } catch (exc) {
        logWarn('JSON parse error: ' + exc.message, 'general');
        return null;
    }
}

/**
 * Check if content contains function call patterns
 * @param {String} jsonString - String to check
 * @returns {Boolean} True if function patterns found
 */
function containsFunctionCallPattern(jsonString) {
    try {
        // Look for common function call patterns
        var patterns = ['function(', 'function (', '.apply(', '.call(', 'new Date('];
        
        for (var i = 0; i < patterns.length; i++) {
            if (stringIndexOf(jsonString, patterns[i]) !== -1) {
                return true;
            }
        }
        
        return false;

    } catch (exc) {
        return false;
    }
}

// =============================================================================
// STRUCTURE VALIDATION - ENHANCED LOGGING
// =============================================================================

/**
 * Validate JSON structure for DOM export format
 * @param {Object} jsonData - JSON data to validate
 * @returns {Object} Validation result
 */
function validateJSONStructure(jsonData) {
    logDebug('Validating JSON structure', 'general');
    
    try {
        if (!jsonData) {
            return { valid: false, error: 'JSON data is null or undefined' };
        }

        if (typeof jsonData !== 'object') {
            return { valid: false, error: 'JSON data is not an object' };
        }

        // Check for required DOM structure properties
        var hasStructure = jsonData.structure !== undefined;
        var hasMetadata = jsonData.metadata !== undefined;
        var hasTimestamp = jsonData.timestamp !== undefined || jsonData.created !== undefined;

        if (!hasStructure) {
            logWarn('JSON missing structure property', 'general');
            return { valid: false, error: 'Missing required structure property' };
        }

        if (!hasMetadata) {
            logWarn('JSON missing metadata (non-critical)', 'general');
        }

        logDebug('JSON structure validation completed successfully', 'general');

        return {
            valid: true,
            hasStructure: hasStructure,
            hasMetadata: hasMetadata,
            hasTimestamp: hasTimestamp
        };

    } catch (exc) {
        var validationError = 'Structure validation error: ' + exc.message;
        logError(validationError, 'general');
        return { valid: false, error: validationError };
    }
}

// =============================================================================
// COMPREHENSIVE ANALYSIS - ENHANCED LOGGING
// =============================================================================

/**
 * Perform comprehensive JSON analysis
 * @param {Object} jsonData - JSON data to analyze
 * @param {Object} config - Analysis configuration
 * @returns {Object} Complete analysis results
 */
function performComprehensiveAnalysis(jsonData, config) {
    logDebug('=== STARTING performComprehensiveAnalysis ===', 'general');
    
    try {
        var analysis = {
            timestamp: getCurrentTimestamp(),
            configuration: config
        };

        // Generate structure summary
        if (config.enableStructureSummary !== false) {
            logDebug('Generating structure summary', 'general');
            analysis.structureSummary = generateStructureSummary(jsonData, config);
        }

        // Generate visual hierarchy
        if (config.enableVisualHierarchy) {
            logDebug('Generating visual hierarchy', 'general');
            analysis.visualHierarchy = generateVisualHierarchy(jsonData, config);
        }

        // Generate property analysis
        if (config.enablePropertyAnalysis) {
            logDebug('Generating property analysis', 'general');
            analysis.propertyAnalysis = generatePropertyAnalysis(jsonData, config);
        }

        // Generate collection analysis
        if (config.enableCollectionAnalysis) {
            logDebug('Generating collection analysis', 'general');
            analysis.collectionAnalysis = generateCollectionAnalysis(jsonData, config);
        }

        // Generate value analysis
        if (config.enableValueAnalysis) {
            logDebug('Generating value analysis', 'general');
            analysis.valueAnalysis = generateValueAnalysis(jsonData, config);
        }

        // Generate accessibility map
        if (config.enableAccessibilityMap) {
            logDebug('Generating accessibility map', 'general');
            analysis.accessibilityMap = generateAccessibilityMap(jsonData, config);
        }

        // Generate developer guide
        if (config.generateDeveloperGuide) {
            logDebug('Generating developer guide', 'general');
            analysis.developerGuide = generateDeveloperGuide(jsonData, config);
        }

        logInfo('Comprehensive analysis completed successfully', 'general');
        
        return analysis;

    } catch (exc) {
        var analysisError = 'Comprehensive analysis error: ' + exc.message;
        logError(analysisError, 'general');
        return {
            error: analysisError,
            timestamp: getCurrentTimestamp()
        };
    }
}

// =============================================================================
// STRUCTURE ANALYSIS
// =============================================================================

/**
 * Generate structure summary
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Configuration
 * @returns {String} Structure summary
 */
function generateStructureSummary(domStructure, config) {
    logDebug('Generating structure summary', 'general');
    
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('DOM STRUCTURE SUMMARY');
        builder.appendLine('====================');
        builder.appendLine('');

        var summary = {
            totalNodes: 0,
            maxDepth: 0,
            totalProperties: 0,
            totalCollections: 0,
            totalMethods: 0
        };

        if (domStructure.structure && domStructure.structure.document) {
            analyzeNodeStructure(domStructure.structure.document, summary);
        }

        builder.appendLine('Total Nodes: ' + summary.totalNodes);
        builder.appendLine('Maximum Depth: ' + summary.maxDepth);
        builder.appendLine('Total Properties: ' + summary.totalProperties);
        builder.appendLine('Total Collections: ' + summary.totalCollections);
        builder.appendLine('Total Methods: ' + summary.totalMethods);
        builder.appendLine('');

        if (domStructure.metadata) {
            builder.appendLine('Analysis Metadata:');
            if (domStructure.metadata.discoveryDuration) {
                builder.appendLine('  Discovery Duration: ' + domStructure.metadata.discoveryDuration + 'ms');
            }
            if (domStructure.metadata.builderVersion) {
                builder.appendLine('  Builder Version: ' + domStructure.metadata.builderVersion);
            }
            if (domStructure.metadata.timestamp) {
                builder.appendLine('  Timestamp: ' + domStructure.metadata.timestamp);
            }
        }

        logDebug('Structure summary completed - nodes: ' + summary.totalNodes + ', depth: ' + summary.maxDepth, 'general');
        
        return builder.toString();

    } catch (exc) {
        return 'Structure summary generation failed: ' + exc.message;
    }
}

/**
 * Analyze DOM node structure recursively
 * @param {Object} domNode - DOM node to analyze
 * @param {Object} summary - Summary object to update
 * @param {Number} depth - Current depth (optional)
 */
function analyzeNodeStructure(domNode, summary, depth) {
    try {
        var currentDepth = depth || 0;
        
        summary.totalNodes = (summary.totalNodes || 0) + 1;
        summary.maxDepth = Math.max(summary.maxDepth || 0, currentDepth);
        
        // Count properties
        if (domNode.properties) {
            summary.totalProperties = (summary.totalProperties || 0) + domNode.properties.length;
        }
        
        // Count collections
        if (domNode.collections) {
            summary.totalCollections = (summary.totalCollections || 0) + domNode.collections.length;
        }
        
        // Count methods
        if (domNode.methods) {
            summary.totalMethods = (summary.totalMethods || 0) + domNode.methods.length;
        }
        
        // Process child nodes
        if (domNode.childNodes) {
            for (var i = 0; i < domNode.childNodes.length; i++) {
                analyzeNodeStructure(domNode.childNodes[i], summary, currentDepth + 1);
            }
        }

    } catch (exc) {
        // Continue analysis even if one node fails
    }
}

// =============================================================================
// VISUAL HIERARCHY GENERATION
// =============================================================================

/**
 * Generate visual hierarchy representation
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Analysis configuration
 * @returns {String} Visual hierarchy text
 */
function generateVisualHierarchy(domStructure, config) {
    logDebug('Generating visual hierarchy', 'general');
    
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
        
        logDebug('Visual hierarchy generation completed', 'general');
        
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
                builder.appendLine(indent + '    ... (' + (domNode.properties.length - propLimit) + ' more)');
            }
        }
        
        // Collections
        if (domNode.collections && domNode.collections.length > 0) {
            builder.appendLine(indent + '  Collections (' + domNode.collections.length + '):');
            
            var collLimit = Math.min(domNode.collections.length, 5);
            for (var c = 0; c < collLimit; c++) {
                var coll = domNode.collections[c];
                var collText = '• ' + coll.name + ' (' + coll.type + ')';
                
                if (coll.samplingMetadata && coll.samplingMetadata.formattedValue) {
                    collText += ' = ' + coll.samplingMetadata.formattedValue;
                }
                
                builder.appendLine(indent + '    ' + collText);
            }
            
            if (domNode.collections.length > collLimit) {
                builder.appendLine(indent + '    ... (' + (domNode.collections.length - collLimit) + ' more)');
            }
        }
        
        // Child nodes (with depth limit)
        if (domNode.childNodes && indentLevel < (config.maxAnalysisDepth || 5)) {
            builder.appendLine('');
            for (var n = 0; n < domNode.childNodes.length; n++) {
                var childHierarchy = generateNodeHierarchy(domNode.childNodes[n], indentLevel + 1, config);
                builder.append(childHierarchy);
            }
        }
        
        return builder.toString();
        
    } catch (exc) {
        return createHierarchyIndent(indentLevel) + 'Error generating hierarchy: ' + exc.message + '\n';
    }
}

/**
 * Create hierarchy indentation
 * @param {Number} level - Indentation level
 * @returns {String} Indentation string
 */
function createHierarchyIndent(level) {
    var indent = '';
    for (var i = 0; i < level * 2; i++) {
        indent += ' ';
    }
    return indent;
}

// =============================================================================
// PROPERTY ANALYSIS
// =============================================================================

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
        
        for (var i = 0; i < allProperties.length; i++) {
            var prop = allProperties[i];
            if (isImportantProperty(prop.name)) {
                keyProperties[keyProperties.length] = prop;
            }
        }
        
        return keyProperties;
        
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
    logDebug('Starting property analysis', 'general');
    
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('PROPERTY ANALYSIS');
        builder.appendLine('=================');
        builder.appendLine('');
        
        var allProperties = collectAllProperties(domStructure);
        var propertyTypes = analyzePropertyTypes(allProperties);
        var propertySafety = analyzePropertySafety(allProperties);
        
        logInfo('Property analysis completed - ' + allProperties.length + ' properties found', 'general');
        
        builder.appendLine('Total Properties Found: ' + allProperties.length);
        builder.appendLine('');
        
        builder.appendLine('Property Types:');
        var typeKeys = getObjectKeys(propertyTypes);
        for (var t = 0; t < typeKeys.length; t++) {
            var typeKey = typeKeys[t];
            builder.appendLine('  ' + typeKey + ': ' + propertyTypes[typeKey]);
        }
        builder.appendLine('');
        
        builder.appendLine('Property Safety:');
        builder.appendLine('  Safe: ' + (propertySafety.safe || 0));
        builder.appendLine('  Caution: ' + (propertySafety.caution || 0));
        builder.appendLine('  Dangerous: ' + (propertySafety.dangerous || 0));
        builder.appendLine('');
        
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
 * Analyze property types
 * @param {Array} properties - Properties to analyze
 * @returns {Object} Type analysis
 */
function analyzePropertyTypes(properties) {
    logDebug('Analyzing property types for ' + properties.length + ' properties', 'general');
    
    try {
        var types = {};
        
        for (var i = 0; i < properties.length; i++) {
            var prop = properties[i];
            var propType = prop.type || 'unknown';
            
            if (types[propType]) {
                types[propType] = types[propType] + 1;
            } else {
                types[propType] = 1;
            }
        }
        
        return types;
        
    } catch (exc) {
        return {};
    }
}

/**
 * Analyze property safety
 * @param {Array} properties - Properties to analyze
 * @returns {Object} Safety analysis
 */
function analyzePropertySafety(properties) {
    logDebug('Analyzing property safety for ' + properties.length + ' properties', 'general');
    
    try {
        var safety = {
            safe: 0,
            caution: 0,
            dangerous: 0
        };
        
        for (var i = 0; i < properties.length; i++) {
            var prop = properties[i];
            var accessibility = analyzeNodeAccessibility(prop);
            
            if (accessibility === 'safe') {
                safety.safe = safety.safe + 1;
            } else if (accessibility === 'caution') {
                safety.caution = safety.caution + 1;
            } else if (accessibility === 'dangerous') {
                safety.dangerous = safety.dangerous + 1;
            }
        }
        
        return safety;
        
    } catch (exc) {
        return { safe: 0, caution: 0, dangerous: 0 };
    }
}

// =============================================================================
// VALUE ANALYSIS
// =============================================================================

/**
 * Analyze extracted values
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Configuration
 * @returns {String} Value analysis
 */
function analyzeExtractedValues(domStructure, config) {
    logDebug('Starting extracted values analysis', 'general');
    
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('EXTRACTED VALUES ANALYSIS');
        builder.appendLine('========================');
        builder.appendLine('');
        
        var extractedValues = [];
        collectExtractedValues(domStructure, extractedValues);
        
        logInfo('Extracted values analysis completed - ' + extractedValues.length + ' values found', 'general');
        
        if (extractedValues.length === 0) {
            builder.appendLine('No extracted values found in DOM structure.');
            return builder.toString();
        }
        
        builder.appendLine('Total Extracted Values: ' + extractedValues.length);
        builder.appendLine('');
        
        // Analyze value types
        var valueTypes = {};
        for (var i = 0; i < extractedValues.length; i++) {
            var value = extractedValues[i];
            var valueType = value.valueType || 'unknown';
            
            if (valueTypes[valueType]) {
                valueTypes[valueType] = valueTypes[valueType] + 1;
            } else {
                valueTypes[valueType] = 1;
            }
        }
        
        builder.appendLine('Value Types:');
        var typeKeys = getObjectKeys(valueTypes);
        for (var t = 0; t < typeKeys.length; t++) {
            var typeKey = typeKeys[t];
            builder.appendLine('  ' + typeKey + ': ' + valueTypes[typeKey]);
        }
        builder.appendLine('');
        
        // Show sample values
        var sampleCount = Math.min(extractedValues.length, 10);
        builder.appendLine('Sample Values (' + sampleCount + ' of ' + extractedValues.length + '):');
        
        for (var s = 0; s < sampleCount; s++) {
            var sample = extractedValues[s];
            var sampleLine = '  • ' + sample.name + ' = ' + sample.formattedValue;
            builder.appendLine(sampleLine);
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

// =============================================================================
// COLLECTION ANALYSIS
// =============================================================================

/**
 * Generate collection analysis
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Configuration
 * @returns {String} Collection analysis
 */
function generateCollectionAnalysis(domStructure, config) {
    logDebug('Starting collection analysis', 'general');
    
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('COLLECTION ANALYSIS');
        builder.appendLine('==================');
        builder.appendLine('');
        
        var collections = collectAllCollections(domStructure);
        
        logInfo('Collection analysis completed - ' + collections.length + ' collections found', 'general');
        
        if (collections.length === 0) {
            builder.appendLine('No collections found in DOM structure.');
            return builder.toString();
        }
        
        builder.appendLine('Total Collections: ' + collections.length);
        builder.appendLine('');
        
        // NOTE: generateCollectionContentSummary is now in 2.2_collection-sampler.jsx
        // This module will call that function if available, or provide basic summary
        var contentSummary;
        if (functionExists('generateCollectionContentSummary')) {
            // Call the authoritative version from 2.2_collection-sampler.jsx
            logDebug('Using authoritative generateCollectionContentSummary from 2.2_collection-sampler', 'general');
            contentSummary = generateCollectionContentSummary(collections);
        } else {
            // Provide basic fallback summary
            logWarn('Authoritative generateCollectionContentSummary not available, using basic fallback', 'general');
            contentSummary = generateBasicCollectionSummary(collections);
        }
        
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
        
        logDebug('Collected ' + collections.length + ' collections from structure', 'general');
        
        return collections;
        
    } catch (exc) {
        return [];
    }
}

/**
 * Generate basic collection content summary (fallback)
 * @param {Array} collections - Collections to analyze
 * @returns {String} Basic content summary
 */
function generateBasicCollectionSummary(collections) {
    logWarn('Using basic collection summary fallback for ' + collections.length + ' collections', 'general');
    
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
        return 'Basic collection summary failed: ' + exc.message;
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

// =============================================================================
// ACCESSIBILITY ANALYSIS
// =============================================================================

/**
 * Generate accessibility map
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Configuration
 * @returns {Object} Accessibility map
 */
function generateAccessibilityMap(domStructure, config) {
    logDebug('Generating accessibility map', 'general');
    
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
            
            if (accessibility === 'safe') {
                accessibilityMap.safeProperties[accessibilityMap.safeProperties.length] = prop;
            } else if (accessibility === 'caution') {
                accessibilityMap.cautionProperties[accessibilityMap.cautionProperties.length] = prop;
            } else if (accessibility === 'dangerous') {
                accessibilityMap.dangerousProperties[accessibilityMap.dangerousProperties.length] = prop;
            }
        }
        
        accessibilityMap.recommendations = generateAccessibilityRecommendations(accessibilityMap);
        
        logInfo('Accessibility map completed - Safe: ' + accessibilityMap.safeProperties.length + 
                ', Caution: ' + accessibilityMap.cautionProperties.length + 
                ', Dangerous: ' + accessibilityMap.dangerousProperties.length, 'general');
        
        return accessibilityMap;
        
    } catch (exc) {
        return {
            error: 'Accessibility map generation failed: ' + exc.message,
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
 * @returns {String} Accessibility level
 */
function analyzeNodeAccessibility(property) {
    try {
        if (!property || !property.name) {
            return 'unknown';
        }
        
        var propName = property.name.toLowerCase();
        
        // Dangerous patterns
        var dangerousPatterns = ['delete', 'remove', 'close', 'quit', 'exit', 'save', 'export'];
        for (var d = 0; d < dangerousPatterns.length; d++) {
            if (stringIndexOf(propName, dangerousPatterns[d]) !== -1) {
                return 'dangerous';
            }
        }
        
        // Caution patterns
        var cautionPatterns = ['create', 'add', 'insert', 'move', 'copy', 'duplicate'];
        for (var c = 0; c < cautionPatterns.length; c++) {
            if (stringIndexOf(propName, cautionPatterns[c]) !== -1) {
                return 'caution';
            }
        }
        
        // Safe by default
        return 'safe';
        
    } catch (exc) {
        return 'unknown';
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
                'Use the ' + accessibilityMap.safeProperties.length + 
                ' safe properties (read-only operations) available for reliable document interaction';
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

// =============================================================================
// DEVELOPER GUIDE GENERATION
// =============================================================================

/**
 * Generate developer guide
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Configuration
 * @returns {String} Developer guide
 */
function generateDeveloperGuide(domStructure, config) {
    logDebug('Generating developer guide', 'general');
    
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('DEVELOPER GUIDE');
        builder.appendLine('===============');
        builder.appendLine('');
        
        builder.appendLine('This guide provides practical information for working with the analyzed DOM structure.');
        builder.appendLine('');
        
        if (config.includeCodeExamples) {
            builder.appendLine('CODE EXAMPLES:');
            builder.appendLine('');
            
            var keyProperties = findKeyProperties(domStructure, config);
            if (keyProperties.length > 0) {
                builder.appendLine('Key Property Access:');
                
                var exampleCount = Math.min(keyProperties.length, 5);
                for (var e = 0; e < exampleCount; e++) {
                    var prop = keyProperties[e];
                    var example = generateAccessExample(prop.path);
                    builder.appendLine('  ' + example);
                }
                builder.appendLine('');
            }
            
            var collections = collectAllCollections(domStructure);
            if (collections.length > 0) {
                builder.appendLine('Collection Access:');
                
                var collExampleCount = Math.min(collections.length, 3);
                for (var c = 0; c < collExampleCount; c++) {
                    var coll = collections[c];
                    var collExample = generateCollectionAccessExample(coll.path);
                    builder.appendLine('  ' + collExample);
                }
                builder.appendLine('');
            }
        }
        
        builder.appendLine('BEST PRACTICES:');
        builder.appendLine('• Always wrap DOM access in try-catch blocks');
        builder.appendLine('• Check for null/undefined before accessing properties');
        builder.appendLine('• Use appropriate timeout values for long operations');
        builder.appendLine('• Test thoroughly in controlled environment before production use');
        
        logDebug('Developer guide generation completed', 'general');
        
        return builder.toString();
        
    } catch (exc) {
        return 'Developer guide generation failed: ' + exc.message;
    }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if property name is important
 * @param {String} propName - Property name
 * @returns {Boolean} True if important
 */
function isImportantProperty(propName) {
    try {
        if (!propName) return false;
        
        var importantProps = [
            'name', 'id', 'label', 'contents', 'value', 'text', 'width', 'height',
            'x', 'y', 'visible', 'locked', 'selected', 'bounds', 'geometricBounds',
            'pages', 'layers', 'textFrames', 'rectangles', 'ovals', 'polygons',
            'groups', 'pageItems', 'stories', 'paragraphs', 'characters', 'words'
        ];
        
        var lowerPropName = stringToLowerCase(propName);
        
        for (var i = 0; i < importantProps.length; i++) {
            if (lowerPropName === importantProps[i] || 
                stringIndexOf(lowerPropName, importantProps[i]) !== -1) {
                return true;
            }
        }
        
        return false;
        
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
        var example = stringReplace(path, 'document', 'app.activeDocument');
        return example + '; // Access property';
    } catch (exc) {
        return path;
    }
}

/**
 * Generate collection access example for collection path
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
// MODULE REGISTRATION - UPDATED TO v4.1
// =============================================================================

// Register this module with all its functions (REMOVED generateCollectionContentSummary)
registerModule('4.1_json-analyzer', '4.1', [
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
    'generateCollectionAnalysis', 'collectAllCollections', 'generateBasicCollectionSummary',
    'generateValueAnalysis', 'generateAccessibilityMap', 'analyzeNodeAccessibility', 
    'generateAccessibilityRecommendations', 'generateDeveloperGuide',
    
    // Utility Functions
    'isImportantProperty', 'generateAccessExample', 'generateCollectionAccessExample'
]);

// =============================================================================
// END OF 4.1_json-analyzer.jsx - v4.1 ENHANCED
// =============================================================================