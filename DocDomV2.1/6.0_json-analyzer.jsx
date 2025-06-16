// =============================================================================
// 6.0_json-analyzer.jsx - JSON POST-PROCESSING AND VISUALIZATION
// InDesign DOM Discovery Builder v2.1 - TARGET ARCHITECTURE
// =============================================================================
// PURPOSE: JSON export analysis and visualization with simplified visual DOM hierarchies
// DEPENDENCIES: ["1.0_safe-foundation.jsx"]
// SIZE: ~800 lines
// =============================================================================

// =============================================================================
// JSON ANALYZER CONFIGURATION
// =============================================================================

var JSON_ANALYZER_CONFIG = {
    maxTreeDepth: 6,
    maxPropertiesPerNode: 20,
    maxCollectionsShown: 10,
    includePropertyTypes: true,
    includeObjectReferences: true,
    includeAccessPaths: true,
    includeSafetyLevels: true,
    generateDeveloperNotes: true
};

// =============================================================================
// MAIN ANALYSIS FUNCTIONS
// =============================================================================

/**
 * Analyze JSON export file and generate simplified visualizations
 * @param {String} jsonFilePath - Path to JSON export file
 * @param {Object} analysisOptions - Analysis options
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
        var config = mergeJSONAnalysisConfig(JSON_ANALYZER_CONFIG, analysisOptions);
        
        // Read and parse JSON file
        var jsonData = readAndParseJSONFile(jsonFilePath);
        if (!jsonData.success) {
            result.error = jsonData.error;
            return result;
        }
        
        // Validate JSON structure
        var validation = validateJSONStructure(jsonData.data);
        if (!validation.success) {
            result.error = validation.error;
            return result;
        }
        
        // Perform comprehensive analysis
        var analysisResult = performComprehensiveJSONAnalysis(jsonData.data, config);
        if (!analysisResult.success) {
            result.error = analysisResult.error;
            return result;
        }
        
        // Generate analysis components
        var analysis = {
            metadata: {
                analysisTimestamp: getCurrentTimestamp(),
                sourceFile: jsonFilePath,
                analysisTime: new Date().getTime() - startTime,
                config: config
            },
            summary: generateAnalysisSummary(jsonData.data, config),
            visualHierarchy: generateVisualDOMHierarchy(jsonData.data, config),
            propertyAnalysis: generateDeveloperPropertySummary(jsonData.data, config),
            collectionAnalysis: generateCollectionAnalysis(jsonData.data, config),
            sourceData: jsonData.data
        };
        
        result.success = true;
        result.analysis = analysis;
        
        return result;
        
    } catch (exc) {
        result.error = 'JSON analysis failed: ' + exc.message;
        return result;
    }
}

/**
 * Generate visual DOM hierarchy from JSON data
 * @param {Object} jsonData - Parsed JSON data
 * @param {Object} config - Configuration
 * @returns {String} Visual DOM hierarchy text
 */
function generateVisualDOMHierarchy(jsonData, config) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('VISUAL DOM HIERARCHY');
        builder.appendLine('===================');
        builder.appendLine('');
        
        // Extract DOM structure from JSON
        var domStructure = null;
        if (jsonData.domStructure) {
            domStructure = jsonData.domStructure;
        } else if (jsonData.structure) {
            domStructure = jsonData;
        }
        
        if (!domStructure || !domStructure.structure || !domStructure.structure.document) {
            builder.appendLine('No DOM structure found in JSON data');
            return builder.toString();
        }
        
        // Generate hierarchy
        generateNodeHierarchy(
            domStructure.structure.document,
            '',
            true,
            0,
            config,
            builder
        );
        
        return builder.toString();
        
    } catch (exc) {
        return 'Error generating visual hierarchy: ' + exc.message;
    }
}

/**
 * Generate developer-focused property summary
 * @param {Object} jsonData - Parsed JSON data
 * @param {Object} config - Configuration
 * @returns {String} Developer property summary
 */
function generateDeveloperPropertySummary(jsonData, config) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('DEVELOPER PROPERTY SUMMARY');
        builder.appendLine('==========================');
        builder.appendLine('');
        
        // Extract and categorize properties
        var propertyCategories = categorizePropertiesFromJSON(jsonData, config);
        
        // Safe properties section
        if (propertyCategories.safe.length > 0) {
            builder.appendLine('SAFE PROPERTIES (Recommended for scripts)');
            builder.appendLine('------------------------------------------');
            for (var i = 0; i < Math.min(propertyCategories.safe.length, 20); i++) {
                var prop = propertyCategories.safe[i];
                builder.appendLine('• ' + prop.path + ' (' + prop.type + ')');
            }
            builder.appendLine('');
        }
        
        // Collections section
        if (propertyCategories.collections.length > 0) {
            builder.appendLine('COLLECTIONS (Iterable objects)');
            builder.appendLine('------------------------------');
            for (var j = 0; j < Math.min(propertyCategories.collections.length, 10); j++) {
                var collection = propertyCategories.collections[j];
                builder.appendLine('• ' + collection.path);
                if (collection.samplingData) {
                    builder.appendLine('  Sample Count: ' + collection.samplingData.itemsSampled);
                }
            }
            builder.appendLine('');
        }
        
        // Code examples
        if (config.generateDeveloperNotes) {
            builder.appendLine('USAGE EXAMPLES');
            builder.appendLine('--------------');
            builder.appendLine('// Safe property access pattern:');
            builder.appendLine('var doc = app.activeDocument;');
            builder.appendLine('if (doc && "name" in doc) {');
            builder.appendLine('    var docName = doc.name;');
            builder.appendLine('    $.writeln("Document: " + docName);');
            builder.appendLine('}');
            builder.appendLine('');
            
            if (propertyCategories.collections.length > 0) {
                var firstCollection = propertyCategories.collections[0];
                var collectionName = firstCollection.name;
                builder.appendLine('// Collection iteration pattern:');
                builder.appendLine('if (doc && "' + collectionName + '" in doc) {');
                builder.appendLine('    var collection = doc.' + collectionName + ';');
                builder.appendLine('    for (var i = 0; i < collection.length; i++) {');
                builder.appendLine('        var item = collection[i];');
                builder.appendLine('        // Process item safely');
                builder.appendLine('    }');
                builder.appendLine('}');
                builder.appendLine('');
            }
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Error generating property summary: ' + exc.message;
    }
}

/**
 * Generate collection analysis from JSON data
 * @param {Object} jsonData - Parsed JSON data
 * @param {Object} config - Configuration
 * @returns {String} Collection analysis text
 */
function generateCollectionAnalysis(jsonData, config) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('COLLECTION ANALYSIS');
        builder.appendLine('==================');
        builder.appendLine('');
        
        // Extract collections from JSON
        var collections = extractCollectionsFromJSON(jsonData);
        
        if (collections.length === 0) {
            builder.appendLine('No collections found in the analysis');
            return builder.toString();
        }
        
        builder.appendLine('Found ' + collections.length + ' collections:');
        builder.appendLine('');
        
        for (var i = 0; i < collections.length; i++) {
            var collection = collections[i];
            
            builder.appendLine((i + 1) + '. ' + collection.name + ' (' + collection.path + ')');
            builder.appendLine('   Type: ' + collection.type);
            builder.appendLine('   Safety Level: ' + collection.safetyLevel);
            
            if (collection.samplingData) {
                builder.appendLine('   Items Sampled: ' + collection.samplingData.itemsSampled);
                
                if (collection.samplingData.patterns && collection.samplingData.patterns.accessRecommendations) {
                    var recommendations = collection.samplingData.patterns.accessRecommendations;
                    if (recommendations.length > 0) {
                        builder.appendLine('   Common Properties:');
                        for (var j = 0; j < Math.min(recommendations.length, 3); j++) {
                            var rec = recommendations[j];
                            builder.appendLine('     • ' + rec.property + ' (' + rec.occurrence + ')');
                        }
                    }
                }
            }
            
            builder.appendLine('');
        }
        
        // Usage recommendations
        builder.appendLine('COLLECTION USAGE RECOMMENDATIONS');
        builder.appendLine('--------------------------------');
        builder.appendLine('1. Always check collection length before iteration');
        builder.appendLine('2. Use index-based access: collection[i]');
        builder.appendLine('3. Wrap collection access in try-catch blocks');
        builder.appendLine('4. Check if items exist before accessing properties');
        builder.appendLine('');
        
        return builder.toString();
        
    } catch (exc) {
        return 'Error generating collection analysis: ' + exc.message;
    }
}

// =============================================================================
// JSON FILE OPERATIONS
// =============================================================================

/**
 * Read and parse JSON file safely
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
        if (!filePath) {
            result.error = 'No file path provided';
            return result;
        }
        
        var jsonFile = new File(filePath);
        if (!jsonFile.exists) {
            result.error = 'File does not exist: ' + filePath;
            return result;
        }
        
        if (!jsonFile.open('r')) {
            result.error = 'Could not open file: ' + filePath;
            return result;
        }
        
        jsonFile.encoding = 'UTF-8';
        var jsonContent = jsonFile.read();
        jsonFile.close();
        
        if (!jsonContent) {
            result.error = 'File is empty or could not be read';
            return result;
        }
        
        // Parse JSON content
        var parseResult = parseJSONSafely(jsonContent);
        if (!parseResult.success) {
            result.error = parseResult.error;
            return result;
        }
        
        result.success = true;
        result.data = parseResult.data;
        
        return result;
        
    } catch (exc) {
        result.error = 'File read error: ' + exc.message;
        return result;
    }
}

/**
 * Parse JSON content safely (ES3 compatible)
 * @param {String} jsonContent - JSON content string
 * @returns {Object} Result with success, data, error
 */
function parseJSONSafely(jsonContent) {
    var result = {
        success: false,
        data: null,
        error: ''
    };
    
    try {
        if (!jsonContent || typeof jsonContent !== 'string') {
            result.error = 'Invalid JSON content';
            return result;
        }
        
        // Try native JSON parsing first (if available)
        if (typeof JSON !== 'undefined' && JSON.parse) {
            try {
                result.data = JSON.parse(jsonContent);
                result.success = true;
                return result;
            } catch (exc) {
                // Fall through to eval method
            }
        }
        
        // Enhanced safety checks for eval method
        var dangerousPatterns = [
            'function', 'eval', 'constructor', 'prototype', '__proto__',
            'document', 'window', 'global', 'process', 'require',
            'import', 'export', 'with', 'debugger', 'alert',
            'confirm', 'prompt', 'setTimeout', 'setInterval'
        ];
        
        var lowerContent = jsonContent.toLowerCase();
        for (var i = 0; i < dangerousPatterns.length; i++) {
            if (lowerContent.indexOf(dangerousPatterns[i]) !== -1) {
                result.error = 'JSON content contains potentially dangerous code: ' + dangerousPatterns[i];
                return result;
            }
        }
        
        // Additional pattern checks
        if (jsonContent.indexOf('(') !== -1 && jsonContent.indexOf(')') !== -1) {
            // Check for function calls
            if (jsonContent.match(/[a-zA-Z_$][a-zA-Z0-9_$]*\s*\(/)) {
                result.error = 'JSON content contains function call patterns';
                return result;
            }
        }
        
        // Validate JSON structure before eval
        if (!validateJSONFormat(jsonContent)) {
            result.error = 'Invalid JSON format detected';
            return result;
        }
        
        // ES3-compatible eval method with additional safety
        var parsedData = eval('(' + jsonContent + ')');
        result.data = parsedData;
        result.success = true;
        
        return result;
        
    } catch (exc) {
        result.error = 'JSON parsing failed: ' + exc.message;
        return result;
    }
}

/**
 * Validate JSON format before eval
 * @param {String} jsonContent - JSON content to validate
 * @returns {Boolean} True if format appears valid
 */
function validateJSONFormat(jsonContent) {
    try {
        var trimmed = jsonContent.replace(/^\s+|\s+$/g, ''); // Trim whitespace
        
        // Must start and end with { } or [ ]
        if (!((trimmed.charAt(0) === '{' && trimmed.charAt(trimmed.length - 1) === '}') ||
              (trimmed.charAt(0) === '[' && trimmed.charAt(trimmed.length - 1) === ']'))) {
            return false;
        }
        
        // Basic bracket matching
        var openBraces = 0;
        var openBrackets = 0;
        var inString = false;
        var escapeNext = false;
        
        for (var i = 0; i < trimmed.length; i++) {
            var charValue = trimmed.charAt(i);
            
            if (escapeNext) {
                escapeNext = false;
                continue;
            }
            
            if (charValue === '\\') {
                escapeNext = true;
                continue;
            }
            
            if (charValue === '"') {
                inString = !inString;
                continue;
            }
            
            if (!inString) {
                if (charValue === '{') openBraces++;
                else if (charValue === '}') openBraces--;
                else if (charValue === '[') openBrackets++;
                else if (charValue === ']') openBrackets--;
                
                if (openBraces < 0 || openBrackets < 0) {
                    return false;
                }
            }
        }
        
        return openBraces === 0 && openBrackets === 0 && !inString;
        
    } catch (exc) {
        return false;
    }
}

/**
 * Validate JSON structure for DOM export format
 * @param {Object} jsonData - Parsed JSON data
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
        
        // Validate basic structure
        if (!domStructure.metadata) {
            result.error = 'Missing metadata in DOM structure';
            return result;
        }
        
        if (!domStructure.structure) {
            result.error = 'Missing structure in DOM data';
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
 * Perform comprehensive analysis of JSON data
 * @param {Object} jsonData - Parsed JSON data
 * @param {Object} config - Configuration
 * @returns {Object} Analysis result with success, analysisData, error
 */
function performComprehensiveJSONAnalysis(jsonData, config) {
    var result = {
        success: false,
        analysisData: null,
        error: ''
    };
    
    try {
        var analysisData = {
            nodeCount: 0,
            propertyCount: 0,
            collectionCount: 0,
            maxDepth: 0,
            objectReferences: 0,
            circularReferences: 0
        };
        
        // Extract DOM structure
        var domStructure = null;
        if (jsonData.domStructure) {
            domStructure = jsonData.domStructure;
        } else if (jsonData.structure) {
            domStructure = jsonData;
        }
        
        if (domStructure) {
            // Count nodes and properties
            if (domStructure.structure && domStructure.structure.document) {
                countAnalysisData(domStructure.structure.document, analysisData, 0);
            }
            
            // Extract statistics if available
            if (domStructure.statistics) {
                analysisData.nodeCount = domStructure.statistics.totalNodes || analysisData.nodeCount;
                analysisData.propertyCount = domStructure.statistics.totalProperties || analysisData.propertyCount;
                analysisData.objectReferences = domStructure.statistics.objectReferences || 0;
                analysisData.circularReferences = domStructure.statistics.circularReferences || 0;
            }
        }
        
        result.success = true;
        result.analysisData = analysisData;
        
        return result;
        
    } catch (exc) {
        result.error = 'Analysis processing error: ' + exc.message;
        return result;
    }
}

/**
 * Generate analysis summary from JSON data
 * @param {Object} jsonData - Parsed JSON data
 * @param {Object} config - Configuration
 * @returns {Object} Analysis summary
 */
function generateAnalysisSummary(jsonData, config) {
    try {
        var summary = {
            documentName: 'Unknown',
            analysisTimestamp: 'Unknown',
            nodeCount: 0,
            propertyCount: 0,
            collectionCount: 0,
            hasCollectionSampling: false,
            hasObjectReferences: false
        };
        
        // Extract basic info
        var domStructure = jsonData.domStructure || jsonData;
        
        if (domStructure.metadata) {
            summary.documentName = domStructure.metadata.documentName || 'Unknown';
            summary.analysisTimestamp = domStructure.metadata.timestamp || 'Unknown';
            summary.hasCollectionSampling = !!(domStructure.metadata.collectionSampling);
        }
        
        if (domStructure.statistics) {
            summary.nodeCount = domStructure.statistics.totalNodes || 0;
            summary.propertyCount = domStructure.statistics.totalProperties || 0;
            summary.hasObjectReferences = (domStructure.statistics.objectReferences || 0) > 0;
        }
        
        // Count collections
        var collections = extractCollectionsFromJSON(jsonData);
        summary.collectionCount = collections.length;
        
        return summary;
        
    } catch (exc) {
        return {
            documentName: 'Error',
            analysisTimestamp: 'Error',
            nodeCount: 0,
            propertyCount: 0,
            collectionCount: 0,
            hasCollectionSampling: false,
            hasObjectReferences: false
        };
    }
}

/**
 * Categorize properties from JSON data for developer use
 * @param {Object} jsonData - Parsed JSON data
 * @param {Object} config - Configuration
 * @returns {Object} Categorized properties
 */
function categorizePropertiesFromJSON(jsonData, config) {
    var categories = {
        safe: [],
        moderate: [],
        risky: [],
        dangerous: [],
        collections: [],
        methods: []
    };
    
    try {
        var domStructure = jsonData.domStructure || jsonData;
        
        if (domStructure.structure && domStructure.structure.document) {
            categorizeNodeProperties(domStructure.structure.document, categories, config);
        }
        
        return categories;
        
    } catch (exc) {
        return categories;
    }
}

// =============================================================================
// HIERARCHY GENERATION
// =============================================================================

/**
 * Generate node hierarchy visualization
 * @param {Object} node - DOM node
 * @param {String} prefix - Tree prefix
 * @param {Boolean} isLast - Is last node at this level
 * @param {Number} currentDepth - Current depth
 * @param {Object} config - Configuration
 * @param {Object} builder - String builder
 */
function generateNodeHierarchy(node, prefix, isLast, currentDepth, config, builder) {
    try {
        if (!node || currentDepth >= config.maxTreeDepth) {
            return;
        }
        
        // Node line
        var connector = isLast ? '└── ' : '├── ';
        var nodeLine = prefix + connector + node.name;
        
        // Add type and metadata
        var metadata = [];
        metadata.push(node.type || 'unknown');
        
        if (node.properties && node.properties.length > 0) {
            metadata.push(node.properties.length + ' props');
        }
        
        if (node.collections && node.collections.length > 0) {
            metadata.push(node.collections.length + ' collections');
        }
        
        if (node.methods && node.methods.length > 0) {
            metadata.push(node.methods.length + ' methods');
        }
        
        if (node.objectMetadata && node.objectMetadata.isCircular) {
            metadata.push('CIRCULAR');
        }
        
        if (metadata.length > 0) {
            nodeLine += ' [' + metadata.join(', ') + ']';
        }
        
        builder.appendLine(nodeLine);
        
        // Child nodes
        if (node.childNodes && node.childNodes.length > 0) {
            var newPrefix = prefix + (isLast ? '    ' : '│   ');
            
            for (var i = 0; i < node.childNodes.length; i++) {
                var isLastChild = (i === node.childNodes.length - 1);
                generateNodeHierarchy(
                    node.childNodes[i],
                    newPrefix,
                    isLastChild,
                    currentDepth + 1,
                    config,
                    builder
                );
            }
        }
        
    } catch (exc) {
        builder.appendLine(prefix + '└── [Error displaying node]');
    }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Extract collections from JSON data
 * @param {Object} jsonData - JSON data
 * @returns {Array} Array of collection objects
 */
function extractCollectionsFromJSON(jsonData) {
    var collections = [];
    
    try {
        var domStructure = jsonData.domStructure || jsonData;
        
        if (domStructure.structure && domStructure.structure.document) {
            extractCollectionsFromNode(domStructure.structure.document, collections);
        }
        
        return collections;
        
    } catch (exc) {
        return [];
    }
}

/**
 * Recursively extract collections from a node
 * @param {Object} node - DOM node
 * @param {Array} collections - Array to populate
 */
function extractCollectionsFromNode(node, collections) {
    try {
        if (!node) {
            return;
        }
        
        // Add collections from this node
        if (node.collections && node.collections.length > 0) {
            for (var i = 0; i < node.collections.length; i++) {
                collections.push(node.collections[i]);
            }
        }
        
        // Recursively search child nodes
        if (node.childNodes && node.childNodes.length > 0) {
            for (var j = 0; j < node.childNodes.length; j++) {
                extractCollectionsFromNode(node.childNodes[j], collections);
            }
        }
        
    } catch (exc) {
        // Continue processing
    }
}

/**
 * Count analysis data recursively
 * @param {Object} node - DOM node
 * @param {Object} analysisData - Analysis data to update
 * @param {Number} depth - Current depth
 */
function countAnalysisData(node, analysisData, depth) {
    try {
        if (!node) {
            return;
        }
        
        analysisData.nodeCount++;
        analysisData.maxDepth = Math.max(analysisData.maxDepth, depth);
        
        if (node.properties) {
            analysisData.propertyCount += node.properties.length;
        }
        
        if (node.collections) {
            analysisData.collectionCount += node.collections.length;
        }
        
        if (node.methods) {
            analysisData.propertyCount += node.methods.length;
        }
        
        // Recursively count child nodes
        if (node.childNodes && node.childNodes.length > 0) {
            for (var i = 0; i < node.childNodes.length; i++) {
                countAnalysisData(node.childNodes[i], analysisData, depth + 1);
            }
        }
        
    } catch (exc) {
        // Continue counting
    }
}

/**
 * Categorize properties from a node
 * @param {Object} node - DOM node
 * @param {Object} categories - Categories object to update
 * @param {Object} config - Configuration
 */
function categorizeNodeProperties(node, categories, config) {
    try {
        if (!node) {
            return;
        }
        
        // Categorize properties
        if (node.properties) {
            for (var i = 0; i < node.properties.length; i++) {
                var prop = node.properties[i];
                var safetyLevel = prop.safetyLevel || 'safe';
                
                if (categories[safetyLevel]) {
                    categories[safetyLevel].push(prop);
                }
            }
        }
        
        // Add collections
        if (node.collections) {
            for (var j = 0; j < node.collections.length; j++) {
                categories.collections.push(node.collections[j]);
            }
        }
        
        // Add methods
        if (node.methods) {
            for (var k = 0; k < node.methods.length; k++) {
                categories.methods.push(node.methods[k]);
            }
        }
        
        // Recursively process child nodes
        if (node.childNodes && node.childNodes.length > 0) {
            for (var l = 0; l < node.childNodes.length; l++) {
                categorizeNodeProperties(node.childNodes[l], categories, config);
            }
        }
        
    } catch (exc) {
        // Continue processing
    }
}

/**
 * Merge JSON analysis configuration
 * @param {Object} defaults - Default configuration
 * @param {Object} userOptions - User options
 * @returns {Object} Merged configuration
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

// =============================================================================
// EXPORT AND SAVE FUNCTIONS
// =============================================================================

/**
 * Save analysis results to file
 * @param {Object} analysis - Analysis results
 * @param {String} outputPath - Output file path
 * @param {String} format - Output format
 * @returns {Object} Save result with success, filePath, error
 */
function saveAnalysisResults(analysis, outputPath, format) {
    var result = {
        success: false,
        filePath: '',
        error: ''
    };
    
    try {
        if (!analysis) {
            result.error = 'No analysis data provided';
            return result;
        }
        
        var content = '';
        
        if (format === 'text' || !format) {
            content = generateFullAnalysisReport(analysis);
        } else if (format === 'json') {
            content = JSON.stringify(analysis, null, 2);
        } else {
            result.error = 'Unsupported format: ' + format;
            return result;
        }
        
        var writeResult = writeToFile(outputPath, content, {});
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
        var builder = createStringBuilder();
        
        builder.appendLine('JSON ANALYSIS REPORT');
        builder.appendLine('===================');
        builder.appendLine('Generated: ' + analysis.metadata.analysisTimestamp);
        builder.appendLine('Source: ' + analysis.metadata.sourceFile);
        builder.appendLine('');
        
        // Summary
        if (analysis.summary) {
            builder.appendLine('SUMMARY');
            builder.appendLine('-------');
            builder.appendLine('Document: ' + analysis.summary.documentName);
            builder.appendLine('Nodes: ' + analysis.summary.nodeCount);
            builder.appendLine('Properties: ' + analysis.summary.propertyCount);
            builder.appendLine('Collections: ' + analysis.summary.collectionCount);
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
// END OF 6.0_json-analyzer.jsx
//
// CRITICAL IMPROVEMENTS IMPLEMENTED:
// - Enhanced JSON parsing safety with comprehensive pattern detection
// - Added JSON format validation before eval() execution  
// - Expanded dangerous pattern detection (functions, eval, constructors, etc.)
// - Added bracket/brace matching validation
// - Improved error handling and safety checks throughout
// - Maintains ES3 compatibility while maximizing security
// =============================================================================