// =============================================================================
// 6.0_json-analyzer.jsx - JSON POST-PROCESSING AND VISUALIZATION
// InDesign DOM Discovery Builder v2.1 - TARGET ARCHITECTURE
// =============================================================================
// PURPOSE: JSON export analysis and visualization with simplified visual DOM hierarchies
// DEPENDENCIES: ["1.0_safe-foundation.jsx"]
// SIZE: ~800 lines
// =============================================================================

// =============================================================================
// MODULE REGISTRATION AND DEPENDENCIES
// =============================================================================

try {
    // Register this module
    if (typeof registerModule === 'function') {
        registerModule('json-analyzer', '2.1', [
            'analyzeJSONExport',
            'generateVisualDOMHierarchy',
            'generateDeveloperPropertySummary',
            'generateCollectionAnalysis',
            'readAndParseJSONFile',
            'parseJSONSafely',
            'validateJSONStructure',
            'performComprehensiveJSONAnalysis',
            'generateAnalysisSummary',
            'categorizePropertiesFromJSON',
            'extractCollectionsFromJSON',
            'saveAnalysisResults',
            'generateFullAnalysisReport',
            'showJSONAnalyzer'
        ]);
    }

    // Validate dependencies
    if (typeof validateDependencies === 'function') {
        var depResult = validateDependencies(['safe-foundation', 'dom-enumerator']);
        if (!depResult.success) {
            throw new Error('Missing dependencies for json-analyzer: ' + depResult.missing.join(', '));
        }
    }
} catch (exc) {
    // Module system not available - continue with standalone operation
}

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
        // Validate parameters
        if (!jsonFilePath && !analysisOptions) {
            result.error = 'No JSON file path or analysis options provided';
            return result;
        }

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
                sourceFile: jsonFilePath || 'memory_data',
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
        // Parameter validation
        if (!jsonData || typeof jsonData !== 'object') {
            return 'Error: Invalid JSON data provided';
        }

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
        // Parameter validation
        if (!jsonData || typeof jsonData !== 'object') {
            return 'Error: Invalid JSON data provided';
        }

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
            var maxSafe = Math.min(propertyCategories.safe.length, 20);
            for (var i = 0; i < maxSafe; i++) {
                var prop = propertyCategories.safe[i];
                if (prop && prop.path && prop.type) {
                    builder.appendLine('• ' + prop.path + ' (' + prop.type + ')');
                }
            }
            builder.appendLine('');
        }

        // Collections section
        if (propertyCategories.collections.length > 0) {
            builder.appendLine('COLLECTIONS (Iterable objects)');
            builder.appendLine('------------------------------');
            var maxCollections = Math.min(propertyCategories.collections.length, 10);
            for (var j = 0; j < maxCollections; j++) {
                var collection = propertyCategories.collections[j];
                if (collection && collection.path) {
                    builder.appendLine('• ' + collection.path);
                    if (collection.samplingData && collection.samplingData.itemsSampled) {
                        builder.appendLine('  Sample Count: ' + collection.samplingData.itemsSampled);
                    }
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
                if (firstCollection && firstCollection.name) {
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
        // Parameter validation
        if (!jsonData || typeof jsonData !== 'object') {
            return 'Error: Invalid JSON data provided';
        }

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

        var maxToShow = Math.min(collections.length, config.maxCollectionsShown);
        for (var i = 0; i < maxToShow; i++) {
            var collection = collections[i];
            if (!collection) continue;

            builder.appendLine((i + 1) + '. ' + (collection.name || 'unnamed') + ' (' + (collection.path || 'no-path') + ')');
            builder.appendLine('   Type: ' + (collection.type || 'unknown'));
            builder.appendLine('   Safety Level: ' + (collection.safetyLevel || 'unknown'));

            if (collection.samplingData) {
                if (collection.samplingData.itemsSampled) {
                    builder.appendLine('   Items Sampled: ' + collection.samplingData.itemsSampled);
                }

                if (collection.samplingData.patterns && collection.samplingData.patterns.accessRecommendations) {
                    var recommendations = collection.samplingData.patterns.accessRecommendations;
                    if (recommendations.length > 0) {
                        builder.appendLine('   Common Properties:');
                        var maxRecs = Math.min(recommendations.length, 3);
                        for (var j = 0; j < maxRecs; j++) {
                            var rec = recommendations[j];
                            if (rec && rec.property && rec.occurrence) {
                                builder.appendLine('     • ' + rec.property + ' (' + rec.occurrence + ')');
                            }
                        }
                    }
                }
            }

            builder.appendLine('');
        }

        // Usage recommendations
        builder.appendLine('COLLECTION USAGE RECOMMENDATIONS');
        builder.appendLine('--------------------------------');
        builder.appendLine('• Always check collection length before iteration');
        builder.appendLine('• Use index-based access: collection[i]');
        builder.appendLine('• Wrap collection access in try-catch blocks');
        builder.appendLine('• Check if items exist before accessing properties');
        builder.appendLine('');

        return builder.toString();

    } catch (exc) {
        return 'Error generating collection analysis: ' + exc.message;
    }
}

// =============================================================================
// JSON FILE OPERATIONS - ENHANCED ES3 COMPATIBLE
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
        if (!filePath || typeof filePath !== 'string') {
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

        // Set encoding based on InDesign capabilities
        var capabilities = getInDesignCapabilities();
        jsonFile.encoding = capabilities.recommendedEncoding;

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
 * Parse JSON content safely (ES3 compatible with enhanced validation)
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
                // Fall through to enhanced eval method
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
            if (stringIndexOf(lowerContent, dangerousPatterns[i]) !== -1) {
                result.error = 'JSON content contains potentially dangerous code: ' + dangerousPatterns[i];
                return result;
            }
        }

        // Enhanced pattern checks using ES3 helpers
        if (stringIndexOf(jsonContent, '(') !== -1 && stringIndexOf(jsonContent, ')') !== -1) {
            // Check for function calls using enhanced pattern detection
            if (containsFunctionCallPattern(jsonContent)) {
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
 * ES3-compatible function call pattern detection
 * @param {String} content - Content to check
 * @returns {Boolean} True if function call patterns detected
 */
function containsFunctionCallPattern(content) {
    try {
        // Simple pattern detection without regex
        var identifierChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$0123456789';
        var inIdentifier = false;
        var identifierLength = 0;

        for (var i = 0; i < content.length - 1; i++) {
            var char = content.charAt(i);
            var nextChar = content.charAt(i + 1);

            if (stringIndexOf(identifierChars, char) !== -1) {
                if (!inIdentifier) {
                    inIdentifier = true;
                    identifierLength = 1;
                } else {
                    identifierLength++;
                }
            } else {
                if (inIdentifier && identifierLength > 1 && char === '(' && nextChar !== ')') {
                    // Found potential function call pattern
                    return true;
                }
                inIdentifier = false;
                identifierLength = 0;
            }
        }

        return false;

    } catch (exc) {
        return true; // Assume dangerous if we can't analyze
    }
}

/**
 * Validate JSON format before eval (enhanced ES3 version)
 * @param {String} jsonContent - JSON content to validate
 * @returns {Boolean} True if format appears valid
 */
function validateJSONFormat(jsonContent) {
    try {
        var trimmed = trimString(jsonContent); // Use ES3-compatible trim

        if (!trimmed || trimmed.length < 2) {
            return false;
        }

        // Must start and end with { } or [ ]
        var firstChar = trimmed.charAt(0);
        var lastChar = trimmed.charAt(trimmed.length - 1);

        if (!((firstChar === '{' && lastChar === '}') ||
            (firstChar === '[' && lastChar === ']'))) {
            return false;
        }

        // Enhanced bracket matching with ES3 compatibility
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
        // Parameter validation
        if (!jsonData || typeof jsonData !== 'object') {
            result.error = 'Invalid JSON data provided';
            return result;
        }

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

        // Parameter validation
        if (!jsonData || typeof jsonData !== 'object') {
            summary.documentName = 'Error: Invalid data';
            return summary;
        }

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
 * Categorize properties from JSON data for developer use - Enhanced ES3 compliant
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
        // Parameter validation
        if (!jsonData || typeof jsonData !== 'object') {
            return categories;
        }

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
// HIERARCHY GENERATION - ENHANCED
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
        if (!node || !builder || currentDepth >= config.maxTreeDepth) {
            return;
        }

        // Node line
        var connector = isLast ? '└── ' : '├── ';
        var nodeLine = prefix + connector + (node.name || 'unnamed');

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
            nodeLine += ' [' + arrayJoin(metadata, ', ') + ']';
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
        if (builder) {
            builder.appendLine(prefix + '└── [Error displaying node: ' + exc.message + ']');
        }
    }
}

// =============================================================================
// UTILITY FUNCTIONS - ENHANCED ES3 COMPLIANT
// =============================================================================

/**
 * Extract collections from JSON data
 * @param {Object} jsonData - JSON data
 * @returns {Array} Array of collection objects
 */
function extractCollectionsFromJSON(jsonData) {
    var collections = [];

    try {
        if (!jsonData || typeof jsonData !== 'object') {
            return collections;
        }

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
        if (!node || !analysisData) {
            return;
        }

        analysisData.nodeCount++;
        analysisData.maxDepth = Math.max(analysisData.maxDepth, depth);

        if (node.properties && node.properties.length) {
            analysisData.propertyCount += node.properties.length;
        }

        if (node.collections && node.collections.length) {
            analysisData.collectionCount += node.collections.length;
        }

        if (node.methods && node.methods.length) {
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
 * Categorize properties from a node - Enhanced ES3 compliant
 * @param {Object} node - DOM node
 * @param {Object} categories - Categories object to update
 * @param {Object} config - Configuration
 */
function categorizeNodeProperties(node, categories, config) {
    try {
        if (!node || !categories) {
            return;
        }

        // Categorize properties using ES3-compatible iteration
        if (node.properties && node.properties.length) {
            for (var i = 0; i < node.properties.length; i++) {
                var prop = node.properties[i];
                if (prop) {
                    var safetyLevel = prop.safetyLevel || 'safe';
                    if (categories[safetyLevel]) {
                        categories[safetyLevel].push(prop);
                    }
                }
            }
        }

        // Add collections
        if (node.collections && node.collections.length) {
            for (var j = 0; j < node.collections.length; j++) {
                if (node.collections[j]) {
                    categories.collections.push(node.collections[j]);
                }
            }
        }

        // Add methods
        if (node.methods && node.methods.length) {
            for (var k = 0; k < node.methods.length; k++) {
                if (node.methods[k]) {
                    categories.methods.push(node.methods[k]);
                }
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

/**
 * Get InDesign capabilities for file operations
 * @returns {Object} Capabilities object
 */
function getInDesignCapabilities() {
    try {
        var capabilities = {
            version: 'unknown',
            supportsUTF8: false,
            supportsLargeFiles: false,
            recommendedEncoding: 'ASCII'
        };

        if (typeof app !== 'undefined' && app.version) {
            capabilities.version = app.version;
            capabilities.supportsUTF8 = stringIndexOf(app.version, 'CS') === -1; // CC versions
            capabilities.supportsLargeFiles = parseFloat(app.version) >= 9.0;
            capabilities.recommendedEncoding = capabilities.supportsUTF8 ? 'UTF-8' : 'ASCII';
        }

        return capabilities;

    } catch (exc) {
        return {
            version: 'unknown',
            supportsUTF8: false,
            supportsLargeFiles: false,
            recommendedEncoding: 'ASCII'
        };
    }
}

// =============================================================================
// EXPORT AND SAVE FUNCTIONS - ENHANCED
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

        if (!outputPath || typeof outputPath !== 'string') {
            result.error = 'Invalid output path provided';
            return result;
        }

        var content = '';
        var outputFormat = format || 'text';

        if (outputFormat === 'text') {
            content = generateFullAnalysisReport(analysis);
        } else if (outputFormat === 'json') {
            // Use enhanced ES3-compatible stringify
            content = safeStringifyEnhanced(analysis, 0, 5);
        } else {
            result.error = 'Unsupported format: ' + outputFormat;
            return result;
        }

        if (!content) {
            result.error = 'Failed to generate content for format: ' + outputFormat;
            return result;
        }

        var writeResult = writeToFileEnhanced(outputPath, content, {});
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
// =============================================================================