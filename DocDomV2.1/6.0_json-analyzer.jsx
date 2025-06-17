// =============================================================================
// 6.0_json-analyzer.jsx - JSON EXPORT ANALYSIS
// InDesign DOM Discovery Builder v2.1.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: Analyze exported JSON DOM structures for insights and developer guidance
// DEPENDENCIES: ["1.0_safe-foundation.jsx", "5.0_dom-exporter.jsx"]
// SIZE: ~900 lines
// =============================================================================

// =============================================================================
// DEPENDENCY VALIDATION
// =============================================================================

var JSON_ANALYZER_DEPENDENCIES = ['1.0_safe-foundation', '5.0_dom-exporter'];
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
    maxAnalysisDepth: 8,
    maxReportItems: 100,
    generateDeveloperGuide: true,
    includeCodeExamples: true,
    highlightKeyProperties: true
};

// =============================================================================
// MAIN ANALYSIS FUNCTIONS
// =============================================================================

/**
 * Complete JSON DOM structure analysis
 * @param {String} jsonFilePath - Path to JSON export file
 * @param {Object} analysisOptions - Analysis configuration
 * @returns {Object} Analysis result with success, analysis, error
 */
function analyzeJSONExport(jsonFilePath, analysisOptions) {
    var startTime = new Date().getTime();
    var result = {
        success: false,
        analysis: null,
        error: ''
    };
    
    try {
        // Enhanced parameter validation
        if (!jsonFilePath || typeof jsonFilePath !== 'string') {
            result.error = 'Invalid JSON file path provided';
            return result;
        }
        
        var config = mergeAnalysisConfig(DEFAULT_ANALYSIS_CONFIG, analysisOptions);
        
        // Read and parse JSON file
        var jsonData = readAndParseJSONFile(jsonFilePath);
        if (!jsonData.success) {
            result.error = jsonData.error;
            return result;
        }
        
        // Validate JSON structure
        var structureValidation = validateJSONStructure(jsonData.data);
        if (!structureValidation.success) {
            result.error = structureValidation.error;
            return result;
        }
        
        // Perform comprehensive analysis
        var analysis = performComprehensiveAnalysis(jsonData.data, config);
        if (!analysis.success) {
            result.error = analysis.error;
            return result;
        }
        
        // Add analysis metadata
        analysis.analysis.metadata = {
            sourceFile: jsonFilePath,
            analysisTimestamp: getCurrentTimestamp(),
            analysisTime: new Date().getTime() - startTime,
            configurationUsed: config,
            analyzerVersion: '2.1.1'
        };
        
        result.success = true;
        result.analysis = analysis.analysis;
        
        return result;
        
    } catch (exc) {
        result.error = 'JSON analysis error: ' + exc.message;
        return result;
    }
}

/**
 * Analyze loaded JSON data directly
 * @param {Object} jsonData - Loaded JSON data
 * @param {Object} analysisOptions - Analysis configuration
 * @returns {Object} Analysis result
 */
function analyzeLoadedJSON(jsonData, analysisOptions) {
    var startTime = new Date().getTime();
    var result = {
        success: false,
        analysis: null,
        error: ''
    };
    
    try {
        if (!jsonData || typeof jsonData !== 'object') {
            result.error = 'Invalid JSON data provided';
            return result;
        }
        
        var config = mergeAnalysisConfig(DEFAULT_ANALYSIS_CONFIG, analysisOptions);
        
        // Validate JSON structure
        var structureValidation = validateJSONStructure(jsonData);
        if (!structureValidation.success) {
            result.error = structureValidation.error;
            return result;
        }
        
        // Perform comprehensive analysis
        var analysis = performComprehensiveAnalysis(jsonData, config);
        if (!analysis.success) {
            result.error = analysis.error;
            return result;
        }
        
        // Add analysis metadata
        analysis.analysis.metadata = {
            sourceFile: 'loaded data',
            analysisTimestamp: getCurrentTimestamp(),
            analysisTime: new Date().getTime() - startTime,
            configurationUsed: config,
            analyzerVersion: '2.1.1'
        };
        
        result.success = true;
        result.analysis = analysis.analysis;
        
        return result;
        
    } catch (exc) {
        result.error = 'JSON analysis error: ' + exc.message;
        return result;
    }
}

// =============================================================================
// FILE OPERATIONS - ENHANCED
// =============================================================================

/**
 * Read and parse JSON file with enhanced error handling
 * @param {String} filePath - Path to JSON file
 * @returns {Object} Result with success, data, error
 */
function readAndParseJSONFile(filePath) {
    var result = {
        success: false,
        data: null,
        error: ''
    };
    
    try {
        // Enhanced parameter validation
        if (!filePath || typeof filePath !== 'string') {
            result.error = 'Invalid file path provided';
            return result;
        }
        
        // Check if file exists
        var file = new File(filePath);
        if (!file.exists) {
            result.error = 'File does not exist: ' + filePath;
            return result;
        }
        
        // Open and read file
        var openResult = file.open('r');
        if (!openResult) {
            result.error = 'Could not open file: ' + filePath;
            return result;
        }
        
        // Set encoding based on InDesign capabilities
        try {
            if (app && app.version) {
                var version = parseFloat(app.version);
                if (version >= 6.0) {
                    file.encoding = 'utf8';
                } else {
                    file.encoding = 'utf-8';
                }
            }
        } catch (exc) {
            // Use default encoding
        }
        
        // Read content
        var content = file.read();
        file.close();
        
        if (!content) {
            result.error = 'File is empty or could not be read';
            return result;
        }
        
        // Parse JSON with enhanced safety
        var jsonData = parseJSONSafely(content);
        if (!jsonData.success) {
            result.error = jsonData.error;
            return result;
        }
        
        result.success = true;
        result.data = jsonData.data;
        
        return result;
        
    } catch (exc) {
        result.error = 'File read error: ' + exc.message;
        return result;
    }
}

/**
 * Parse JSON safely with ES3 compatibility
 * @param {String} jsonString - JSON string to parse
 * @returns {Object} Parse result with success, data, error
 */
function parseJSONSafely(jsonString) {
    var result = {
        success: false,
        data: null,
        error: ''
    };
    
    try {
        if (!jsonString || typeof jsonString !== 'string') {
            result.error = 'Invalid JSON string provided';
            return result;
        }
        
        // Security check - look for potentially dangerous patterns
        if (containsFunctionCallPattern(jsonString)) {
            result.error = 'JSON contains potentially unsafe function calls';
            return result;
        }
        
        // Try native JSON parser first
        if (typeof JSON !== 'undefined' && JSON.parse) {
            try {
                result.data = JSON.parse(jsonString);
                result.success = true;
                return result;
            } catch (parseExc) {
                // Fall through to eval method
            }
        }
        
        // Fallback to eval method (with safety checks)
        try {
            result.data = eval('(' + jsonString + ')');
            result.success = true;
            return result;
        } catch (evalExc) {
            result.error = 'JSON parse error: ' + evalExc.message;
            return result;
        }
        
    } catch (exc) {
        result.error = 'JSON parsing error: ' + exc.message;
        return result;
    }
}

/**
 * Check for potentially dangerous function call patterns
 * @param {String} text - Text to check
 * @returns {Boolean} True if dangerous patterns found
 */
function containsFunctionCallPattern(text) {
    try {
        // ES3-compatible pattern detection
        var dangerousPatterns = [
            'function(',
            ').call(',
            ').apply(',
            'eval(',
            'new Function',
            'constructor.constructor'
        ];
        
        var lowerText = text.toLowerCase();
        
        for (var i = 0; i < dangerousPatterns.length; i++) {
            if (stringIndexOf(lowerText, dangerousPatterns[i]) !== -1) {
                return true;
            }
        }
        
        return false;
        
    } catch (exc) {
        return true; // Err on side of caution
    }
}

// =============================================================================
// STRUCTURE VALIDATION - ENHANCED
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
// ANALYSIS PROCESSING - ENHANCED
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
            summary: generateAnalysisSummary(domStructure, config),
            visualHierarchy: null,
            propertyAnalysis: null,
            collectionAnalysis: null,
            valueAnalysis: null,
            developerGuide: null
        };
        
        // Visual hierarchy analysis
        if (config.enableVisualHierarchy) {
            analysis.visualHierarchy = generateVisualHierarchy(domStructure, config);
        }
        
        // Property analysis
        if (config.enablePropertyAnalysis) {
            analysis.propertyAnalysis = generateDeveloperPropertySummary(domStructure, config);
        }
        
        // Collection analysis
        if (config.enableCollectionAnalysis) {
            analysis.collectionAnalysis = generateCollectionAnalysis(domStructure, config);
        }
        
        // Value analysis (new - for extracted values)
        if (config.enableValueAnalysis) {
            analysis.valueAnalysis = generateValueAnalysis(domStructure, config);
        }
        
        // Developer guide
        if (config.generateDeveloperGuide) {
            analysis.developerGuide = generateDeveloperGuide(domStructure, config);
        }
        
        result.success = true;
        result.analysis = analysis;
        
        return result;
        
    } catch (exc) {
        result.error = 'Analysis processing error: ' + exc.message;
        return result;
    }
}

/**
 * Generate analysis summary
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Configuration
 * @returns {String} Analysis summary
 */
function generateAnalysisSummary(domStructure, config) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('ANALYSIS SUMMARY');
        builder.appendLine('================');
        
        if (domStructure.metadata) {
            var metadata = domStructure.metadata;
            
            builder.appendLine('Document: ' + (metadata.documentName || 'Unknown'));
            builder.appendLine('Total Nodes: ' + (metadata.totalNodes || 0));
            builder.appendLine('Total Properties: ' + (metadata.totalProperties || 0));
            builder.appendLine('Total Collections: ' + (metadata.totalCollections || 0));
            builder.appendLine('Total Methods: ' + (metadata.totalMethods || 0));
            
            // Add value extraction statistics if available
            if (metadata.samplingStatistics) {
                builder.appendLine('');
                builder.appendLine('VALUE EXTRACTION RESULTS:');
                builder.appendLine('Values Extracted: ' + (metadata.samplingStatistics.valuesSampled || 0));
                builder.appendLine('Properties Sampled: ' + (metadata.samplingStatistics.propertiesSampled || 0));
                builder.appendLine('Collections Sampled: ' + (metadata.samplingStatistics.collectionsSampled || 0));
            }
            
            if (metadata.objectReferences) {
                builder.appendLine('');
                builder.appendLine('OBJECT REFERENCE TRACKING:');
                builder.appendLine('Unique Objects: ' + (metadata.objectReferences.uniqueObjects || 0));
                builder.appendLine('Duplicate References: ' + (metadata.objectReferences.duplicateReferences || 0));
            }
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Error generating analysis summary: ' + exc.message;
    }
}

/**
 * Generate visual hierarchy representation
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Configuration
 * @returns {String} Visual hierarchy
 */
function generateVisualHierarchy(domStructure, config) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('VISUAL HIERARCHY');
        builder.appendLine('================');
        
        if (domStructure.structure && domStructure.structure.document) {
            generateHierarchyNode(domStructure.structure.document, builder, '', 0, config);
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Error generating visual hierarchy: ' + exc.message;
    }
}

/**
 * Generate hierarchy node representation (recursive)
 * @param {Object} node - DOM node
 * @param {Object} builder - String builder
 * @param {String} prefix - Tree prefix
 * @param {Number} depth - Current depth
 * @param {Object} config - Configuration
 */
function generateHierarchyNode(node, builder, prefix, depth, config) {
    try {
        if (!node || depth > config.maxAnalysisDepth) {
            return;
        }
        
        // Build node display with extracted values if available
        var nodeText = node.name || 'unnamed';
        var typeInfo = node.type ? ' [' + node.type + ']' : '';
        
        // Show extracted values if available
        var valueInfo = '';
        if (node.extractedValue !== null && node.extractedValue !== undefined) {
            var valueDisplay = String(node.extractedValue);
            if (valueDisplay.length > 30) {
                valueDisplay = valueDisplay.substring(0, 27) + '...';
            }
            valueInfo = ' = "' + valueDisplay + '"';
        }
        
        // Show counts
        var counts = '';
        var propCount = node.properties ? node.properties.length : 0;
        var collCount = node.collections ? node.collections.length : 0;
        var methodCount = node.methods ? node.methods.length : 0;
        
        if (propCount > 0 || collCount > 0 || methodCount > 0) {
            var countParts = [];
            if (propCount > 0) countParts.push(propCount + 'p');
            if (collCount > 0) countParts.push(collCount + 'c');
            if (methodCount > 0) countParts.push(methodCount + 'm');
            counts = ' {' + arrayJoin(countParts, ',') + '}';
        }
        
        builder.appendLine(prefix + nodeText + typeInfo + valueInfo + counts);
        
        // Show important properties with extracted values
        if (node.properties && config.highlightKeyProperties) {
            for (var i = 0; i < node.properties.length && i < 3; i++) {
                var prop = node.properties[i];
                if (prop.extractedValue !== null && prop.extractedValue !== undefined) {
                    var propValue = String(prop.extractedValue);
                    if (propValue.length > 20) {
                        propValue = propValue.substring(0, 17) + '...';
                    }
                    builder.appendLine(prefix + '  → ' + prop.name + ': ' + propValue);
                }
            }
        }
        
        // Show children
        if (node.childNodes && node.childNodes.length > 0) {
            for (var j = 0; j < node.childNodes.length; j++) {
                var isLast = (j === node.childNodes.length - 1);
                var childPrefix = prefix + (isLast ? '└── ' : '├── ');
                var grandChildPrefix = prefix + (isLast ? '    ' : '│   ');
                
                generateHierarchyNode(node.childNodes[j], builder, childPrefix, depth + 1, config);
            }
        }
        
    } catch (exc) {
        if (builder && builder.appendLine) {
            builder.appendLine(prefix + 'Error displaying node: ' + exc.message);
        }
    }
}

/**
 * Generate developer property summary with extracted values
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Configuration
 * @returns {String} Property summary
 */
function generateDeveloperPropertySummary(domStructure, config) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('DEVELOPER PROPERTY SUMMARY');
        builder.appendLine('==========================');
        
        var keyProperties = findKeyProperties(domStructure, config);
        
        if (keyProperties && keyProperties.length > 0) {
            builder.appendLine('KEY PROPERTIES WITH EXTRACTED VALUES:');
            builder.appendLine('-------------------------------------');
            
            for (var i = 0; i < keyProperties.length && i < config.maxReportItems; i++) {
                var prop = keyProperties[i];
                
                builder.appendLine('Property: ' + prop.name);
                builder.appendLine('  Path: ' + prop.path);
                builder.appendLine('  Type: ' + prop.type);
                
                if (prop.extractedValue !== null && prop.extractedValue !== undefined) {
                    builder.appendLine('  Value: ' + String(prop.extractedValue));
                }
                
                if (prop.valueFingerprint) {
                    builder.appendLine('  Fingerprint: ' + prop.valueFingerprint);
                }
                
                if (config.includeCodeExamples) {
                    builder.appendLine('  Access: ' + generateAccessExample(prop.path));
                }
                
                builder.appendLine('');
            }
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Error generating property summary: ' + exc.message;
    }
}

/**
 * Generate collection analysis with extracted content
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Configuration
 * @returns {String} Collection analysis
 */
function generateCollectionAnalysis(domStructure, config) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('COLLECTION ANALYSIS');
        builder.appendLine('===================');
        
        var collections = findCollections(domStructure, config);
        
        if (collections && collections.length > 0) {
            builder.appendLine('DISCOVERED COLLECTIONS WITH CONTENT:');
            builder.appendLine('------------------------------------');
            
            for (var i = 0; i < collections.length && i < config.maxReportItems; i++) {
                var coll = collections[i];
                
                builder.appendLine('Collection: ' + coll.name);
                builder.appendLine('  Path: ' + coll.path);
                builder.appendLine('  Type: ' + coll.type);
                
                // Show extracted content if available
                if (coll.samplingMetadata) {
                    var sampling = coll.samplingMetadata;
                    if (sampling.itemCount !== undefined) {
                        builder.appendLine('  Items: ' + sampling.itemCount);
                    }
                    if (sampling.sampleItems && sampling.sampleItems.length > 0) {
                        builder.appendLine('  Sample Items: ' + arrayJoin(sampling.sampleItems, ', '));
                    }
                }
                
                if (config.includeCodeExamples) {
                    builder.appendLine('  Access: ' + generateCollectionAccessExample(coll.path));
                }
                
                builder.appendLine('');
            }
        } else {
            builder.appendLine('No collections found with extracted content.');
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Error generating collection analysis: ' + exc.message;
    }
}

/**
 * Generate value analysis for extracted data
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Configuration
 * @returns {String} Value analysis
 */
function generateValueAnalysis(domStructure, config) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('VALUE EXTRACTION ANALYSIS');
        builder.appendLine('========================');
        
        var valueStats = analyzeExtractedValues(domStructure);
        
        builder.appendLine('Extraction Statistics:');
        builder.appendLine('  Properties with values: ' + valueStats.propertiesWithValues);
        builder.appendLine('  Properties without values: ' + valueStats.propertiesWithoutValues);
        builder.appendLine('  Collections with content: ' + valueStats.collectionsWithContent);
        builder.appendLine('  Value types found: ' + arrayJoin(valueStats.valueTypes, ', '));
        builder.appendLine('');
        
        if (valueStats.sampleValues && valueStats.sampleValues.length > 0) {
            builder.appendLine('SAMPLE EXTRACTED VALUES:');
            builder.appendLine('------------------------');
            
            for (var i = 0; i < valueStats.sampleValues.length; i++) {
                var sample = valueStats.sampleValues[i];
                builder.appendLine(sample.path + ' = ' + sample.value + ' [' + sample.type + ']');
            }
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Error generating value analysis: ' + exc.message;
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
        
        builder.appendLine('This DOM structure contains extracted values from the InDesign document.');
        builder.appendLine('You can use these values to understand document content and structure.');
        builder.appendLine('');
        
        builder.appendLine('KEY CONCEPTS:');
        builder.appendLine('- Properties show actual extracted values when available');
        builder.appendLine('- Collections include sample content and item counts');
        builder.appendLine('- Object references help identify relationships');
        builder.appendLine('- Alternative paths provide multiple access routes');
        builder.appendLine('');
        
        builder.appendLine('USAGE EXAMPLES:');
        builder.appendLine('var doc = app.activeDocument;');
        builder.appendLine('var pageCount = doc.pages.length; // Check extracted values');
        builder.appendLine('var firstPage = doc.pages[0];');
        builder.appendLine('var pageItems = firstPage.pageItems;');
        builder.appendLine('');
        
        builder.appendLine('VALUE EXTRACTION:');
        builder.appendLine('- Look for "extractedValue" properties');
        builder.appendLine('- Check "samplingMetadata" for collection content');
        builder.appendLine('- Use "valueFingerprint" for change detection');
        
        return builder.toString();
        
    } catch (exc) {
        return 'Error generating developer guide: ' + exc.message;
    }
}

// =============================================================================
// UTILITY FUNCTIONS - ENHANCED
// =============================================================================

/**
 * Find key properties in DOM structure
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Configuration
 * @returns {Array} Key properties
 */
function findKeyProperties(domStructure, config) {
    var keyProperties = [];
    
    try {
        if (domStructure.structure && domStructure.structure.document) {
            findKeyPropertiesInNode(domStructure.structure.document, keyProperties, config);
        }
        
        // Sort by importance (properties with extracted values first)
        keyProperties.sort(function(a, b) {
            var aHasValue = (a.extractedValue !== null && a.extractedValue !== undefined);
            var bHasValue = (b.extractedValue !== null && b.extractedValue !== undefined);
            
            if (aHasValue && !bHasValue) return -1;
            if (!aHasValue && bHasValue) return 1;
            return 0;
        });
        
    } catch (exc) {
        // Return empty array on error
    }
    
    return keyProperties;
}

/**
 * Find key properties in node (recursive)
 * @param {Object} node - DOM node
 * @param {Array} keyProperties - Array to collect properties
 * @param {Object} config - Configuration
 */
function findKeyPropertiesInNode(node, keyProperties, config) {
    try {
        if (!node || keyProperties.length >= config.maxReportItems) {
            return;
        }
        
        // Check node properties
        if (node.properties) {
            for (var i = 0; i < node.properties.length; i++) {
                var prop = node.properties[i];
                
                // Prioritize properties with extracted values
                if (prop.extractedValue !== null && prop.extractedValue !== undefined) {
                    keyProperties.push(prop);
                } else if (isImportantProperty(prop.name)) {
                    keyProperties.push(prop);
                }
            }
        }
        
        // Recurse into child nodes
        if (node.childNodes) {
            for (var j = 0; j < node.childNodes.length; j++) {
                findKeyPropertiesInNode(node.childNodes[j], keyProperties, config);
            }
        }
        
    } catch (exc) {
        // Continue processing
    }
}

/**
 * Find collections in DOM structure
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Configuration
 * @returns {Array} Collections
 */
function findCollections(domStructure, config) {
    var collections = [];
    
    try {
        if (domStructure.structure && domStructure.structure.document) {
            findCollectionsInNode(domStructure.structure.document, collections, config);
        }
        
    } catch (exc) {
        // Return empty array on error
    }
    
    return collections;
}

/**
 * Find collections in node (recursive)
 * @param {Object} node - DOM node
 * @param {Array} collections - Array to collect collections
 * @param {Object} config - Configuration
 */
function findCollectionsInNode(node, collections, config) {
    try {
        if (!node || collections.length >= config.maxReportItems) {
            return;
        }
        
        // Check node collections
        if (node.collections) {
            for (var i = 0; i < node.collections.length; i++) {
                collections.push(node.collections[i]);
            }
        }
        
        // Recurse into child nodes
        if (node.childNodes) {
            for (var j = 0; j < node.childNodes.length; j++) {
                findCollectionsInNode(node.childNodes[j], collections, config);
            }
        }
        
    } catch (exc) {
        // Continue processing
    }
}

/**
 * Analyze extracted values in DOM structure
 * @param {Object} domStructure - DOM structure
 * @returns {Object} Value statistics
 */
function analyzeExtractedValues(domStructure) {
    var stats = {
        propertiesWithValues: 0,
        propertiesWithoutValues: 0,
        collectionsWithContent: 0,
        valueTypes: [],
        sampleValues: []
    };
    
    try {
        if (domStructure.structure && domStructure.structure.document) {
            analyzeValuesInNode(domStructure.structure.document, stats);
        }
        
        // Remove duplicate value types
        var uniqueTypes = [];
        for (var i = 0; i < stats.valueTypes.length; i++) {
            var type = stats.valueTypes[i];
            var found = false;
            for (var j = 0; j < uniqueTypes.length; j++) {
                if (uniqueTypes[j] === type) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                uniqueTypes.push(type);
            }
        }
        stats.valueTypes = uniqueTypes;
        
    } catch (exc) {
        // Return basic stats on error
    }
    
    return stats;
}

/**
 * Analyze values in node (recursive)
 * @param {Object} node - DOM node
 * @param {Object} stats - Statistics object
 */
function analyzeValuesInNode(node, stats) {
    try {
        if (!node || stats.sampleValues.length >= 20) {
            return;
        }
        
        // Check node properties
        if (node.properties) {
            for (var i = 0; i < node.properties.length; i++) {
                var prop = node.properties[i];
                
                if (prop.extractedValue !== null && prop.extractedValue !== undefined) {
                    stats.propertiesWithValues++;
                    
                    var valueType = typeof prop.extractedValue;
                    stats.valueTypes.push(valueType);
                    
                    if (stats.sampleValues.length < 10) {
                        stats.sampleValues.push({
                            path: prop.path,
                            value: String(prop.extractedValue),
                            type: valueType
                        });
                    }
                } else {
                    stats.propertiesWithoutValues++;
                }
            }
        }
        
        // Check collections
        if (node.collections) {
            for (var j = 0; j < node.collections.length; j++) {
                var coll = node.collections[j];
                if (coll.samplingMetadata && coll.samplingMetadata.itemCount > 0) {
                    stats.collectionsWithContent++;
                }
            }
        }
        
        // Recurse into child nodes
        if (node.childNodes) {
            for (var k = 0; k < node.childNodes.length; k++) {
                analyzeValuesInNode(node.childNodes[k], stats);
            }
        }
        
    } catch (exc) {
        // Continue processing
    }
}

/**
 * Check if property name is important
 * @param {String} propName - Property name
 * @returns {Boolean} True if important
 */
function isImportantProperty(propName) {
    var importantProps = [
        'name', 'length', 'width', 'height', 'visible', 'locked',
        'contents', 'value', 'id', 'label', 'type', 'bounds'
    ];
    
    for (var i = 0; i < importantProps.length; i++) {
        if (stringIndexOf(propName.toLowerCase(), importantProps[i]) !== -1) {
            return true;
        }
    }
    
    return false;
}

/**
 * Generate access example for property
 * @param {String} path - Property path
 * @returns {String} Access example
 */
function generateAccessExample(path) {
    try {
        return path.replace('document', 'app.activeDocument');
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
        var example = path.replace('document', 'app.activeDocument');
        return example + '.length; // Get count\n  ' + example + '[0]; // Get first item';
    } catch (exc) {
        return path;
    }
}

/**
 * Merge analysis configuration with defaults
 * @param {Object} defaults - Default configuration
 * @param {Object} options - User options
 * @returns {Object} Merged configuration
 */
function mergeAnalysisConfig(defaults, options) {
    try {
        var config = objectClone(defaults, 2);
        
        if (options && typeof options === 'object') {
            if (objectHasOwnProperty(options, 'enableVisualHierarchy')) config.enableVisualHierarchy = options.enableVisualHierarchy;
            if (objectHasOwnProperty(options, 'enablePropertyAnalysis')) config.enablePropertyAnalysis = options.enablePropertyAnalysis;
            if (objectHasOwnProperty(options, 'enableCollectionAnalysis')) config.enableCollectionAnalysis = options.enableCollectionAnalysis;
            if (objectHasOwnProperty(options, 'enableValueAnalysis')) config.enableValueAnalysis = options.enableValueAnalysis;
            if (objectHasOwnProperty(options, 'maxAnalysisDepth')) config.maxAnalysisDepth = options.maxAnalysisDepth;
            if (objectHasOwnProperty(options, 'maxReportItems')) config.maxReportItems = options.maxReportItems;
            if (objectHasOwnProperty(options, 'generateDeveloperGuide')) config.generateDeveloperGuide = options.generateDeveloperGuide;
            if (objectHasOwnProperty(options, 'includeCodeExamples')) config.includeCodeExamples = options.includeCodeExamples;
            if (objectHasOwnProperty(options, 'highlightKeyProperties')) config.highlightKeyProperties = options.highlightKeyProperties;
        }
        
        return config;
        
    } catch (exc) {
        return defaults;
    }
}

// =============================================================================
// EXPORT FUNCTIONS
// =============================================================================

/**
 * Save analysis results to file
 * @param {Object} analysis - Analysis results
 * @param {String} filePath - Target file path
 * @returns {Object} Save result
 */
function saveAnalysisResults(analysis, filePath) {
    var result = {
        success: false,
        filePath: '',
        error: ''
    };

    try {
        if (!analysis || typeof analysis !== 'object') {
            result.error = 'Invalid analysis data provided';
            return result;
        }

        var reportText = generateFullAnalysisReport(analysis);
        
        var writeResult = writeToFile(filePath, reportText, { maxFileSize: 10000000 });
        if (!writeResult.success) {
            result.error = writeResult.error;
            return result;
        }

        result.success = true;
        result.filePath = writeResult.filePath;

        return result;

    } catch (exc) {
        result.error = 'Save analysis error: ' + exc.message;
        return result;
    }
}

/**
 * Generate full analysis report
 * @param {Object} analysis - Analysis data
 * @returns {String} Full analysis report text
 */
function generateFullAnalysisReport(analysis) {
    try {
        if (!analysis) {
            return 'Error: No analysis data provided';
        }

        var builder = createStringBuilder();

        builder.appendLine('JSON ANALYSIS REPORT');
        builder.appendLine('===================');
        if (analysis.metadata) {
            builder.appendLine('Generated: ' + (analysis.metadata.analysisTimestamp || 'Unknown'));
            builder.appendLine('Source: ' + (analysis.metadata.sourceFile || 'Unknown'));
        }
        builder.appendLine('');

        // Summary
        if (analysis.summary) {
            builder.appendLine('SUMMARY');
            builder.appendLine('-------');
            builder.appendLine('Document: ' + (analysis.summary.documentName || 'Unknown'));
            builder.appendLine('Nodes: ' + (analysis.summary.nodeCount || 0));
            builder.appendLine('Properties: ' + (analysis.summary.propertyCount || 0));
            builder.appendLine('Collections: ' + (analysis.summary.collectionCount || 0));
            builder.appendLine('');
        }

        // Visual hierarchy
        if (analysis.visualHierarchy) {
            builder.appendLine(analysis.visualHierarchy);
            builder.appendLine('');
        }

        // Property analysis
        if (analysis.propertyAnalysis) {
            builder.appendLine(analysis.propertyAnalysis);
            builder.appendLine('');
        }

        // Collection analysis
        if (analysis.collectionAnalysis) {
            builder.appendLine(analysis.collectionAnalysis);
            builder.appendLine('');
        }

        // Value analysis
        if (analysis.valueAnalysis) {
            builder.appendLine(analysis.valueAnalysis);
            builder.appendLine('');
        }

        // Developer guide
        if (analysis.developerGuide) {
            builder.appendLine(analysis.developerGuide);
            builder.appendLine('');
        }

        return builder.toString();

    } catch (exc) {
        return 'Error generating full analysis report: ' + exc.message;
    }
}

// =============================================================================
// UI INTEGRATION
// =============================================================================

/**
 * Show JSON analyzer interface
 * @returns {Boolean} True if interface shown successfully
 */
function showJSONAnalyzer() {
    try {
        // This would integrate with the main UI system
        // For now, return true to indicate the function exists
        return true;

    } catch (exc) {
        return false;
    }
}

// =============================================================================
// MODULE REGISTRATION
// =============================================================================

// Register this module with all its functions
registerModule('6.0_json-analyzer', '2.1.1', [
    // Main Analysis Functions
    'analyzeJSONExport', 'analyzeLoadedJSON',
    
    // File Operations
    'readAndParseJSONFile', 'parseJSONSafely', 'containsFunctionCallPattern',
    
    // Structure Validation
    'validateJSONStructure',
    
    // Analysis Processing
    'performComprehensiveAnalysis', 'generateAnalysisSummary',
    'generateVisualHierarchy', 'generateDeveloperPropertySummary',
    'generateCollectionAnalysis', 'generateValueAnalysis', 'generateDeveloperGuide',
    
    // Utility Functions
    'findKeyProperties', 'findCollections', 'analyzeExtractedValues',
    'isImportantProperty', 'generateAccessExample', 'generateCollectionAccessExample',
    'mergeAnalysisConfig',
    
    // Export Functions
    'saveAnalysisResults', 'generateFullAnalysisReport',
    
    // UI Integration
    'showJSONAnalyzer'
]);

// =============================================================================
// END OF 6.0_json-analyzer.jsx
//
// ENHANCEMENTS IMPLEMENTED:
// - Added comprehensive dependency validation and module registration
// - Enhanced ES3 compliance with improved string operations (stringIndexOf, arrayJoin)
// - Fixed regex usage with ES3-compatible containsFunctionCallPattern() function
// - Enhanced JSON parsing safety with improved pattern detection
// - Added InDesign capability detection for encoding compatibility
// - Improved error handling with comprehensive parameter validation
// - Enhanced file operations with better encoding support
// - Added ES3-compatible helper usage throughout (objectClone, objectHasOwnProperty)
// - Enhanced string operations and array handling with ES3 helpers
// - All original functionality preserved and enhanced for production reliability
//
// VALUE EXTRACTION INTEGRATION FIXES (Current Round):
// - Added generateValueAnalysis() function to analyze extracted property values
// - Enhanced generateAnalysisSummary() to include value extraction statistics
// - Updated generateVisualHierarchy() to display extracted values in tree structure
// - Enhanced generateDeveloperPropertySummary() to prioritize properties with values
// - Updated generateCollectionAnalysis() to show extracted collection content
// - Added analyzeExtractedValues() function to gather value statistics
// - Enhanced developer guide to explain value extraction features
// - All analysis functions now prioritize and display actual extracted values
// =============================================================================