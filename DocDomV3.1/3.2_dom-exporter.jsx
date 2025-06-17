// =============================================================================
// 3.2_dom-exporter.jsx - MULTI-FORMAT DOM EXPORT
// InDesign DOM Discovery Builder v3.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: Export DOM structures to JSON, text, and CSV formats with enhanced features
// DEPENDENCIES: ["1.1_bootstrap-foundation.jsx", "1.2_safety-utilities.jsx"]
// SIZE: ~1400 lines - COMPLETE IMPLEMENTATION
// =============================================================================

// =============================================================================
// DEPENDENCY VALIDATION
// =============================================================================

var DOM_EXPORTER_DEPENDENCIES = ['1.1_bootstrap-foundation', '1.2_safety-utilities'];
var dependencyCheck = validateDependencies(DOM_EXPORTER_DEPENDENCIES);
if (!dependencyCheck.success) {
    throw new Error('DOM Exporter missing dependencies: ' + dependencyCheck.missing.join(', '));
}

// =============================================================================
// EXPORT CONFIGURATION
// =============================================================================

var DEFAULT_EXPORT_CONFIG = {
    format: 'json',
    includeMetadata: true,
    includeStatistics: true,
    includeObjectReferences: true,
    includeExtractedValues: true,
    includeAlternativePaths: true,
    compactOutput: false,
    maxDepth: 10,
    enableCompressionSupport: false,
    generateComparisonData: true,
    includeTimestamps: true,
    preserveCircularReferences: true,
    includeAccessGuide: true,
    enhancedFormatting: true
};

// =============================================================================
// MAIN EXPORT FUNCTIONS
// =============================================================================

/**
 * Export DOM structure to specified format
 * @param {Object} domStructure - DOM structure to export
 * @param {Object} exportConfig - Export configuration
 * @returns {Object} Export result with content and metadata
 */
function exportDOMStructure(domStructure, exportConfig) {
    var startTime = new Date().getTime();
    var config = exportConfig ? 
        objectMerge(DEFAULT_EXPORT_CONFIG, exportConfig) : 
        objectClone(DEFAULT_EXPORT_CONFIG, 2);
    
    try {
        // Validate input
        if (!domStructure) {
            throw new Error('No DOM structure provided for export');
        }
        
        var result = {
            success: false,
            format: config.format,
            content: '',
            metadata: {},
            error: null,
            exportTime: 0,
            contentLength: 0
        };
        
        // Pre-process structure for export
        var processedStructure = preprocessForExport(domStructure, config);
        
        // Export based on format
        switch (stringToLowerCase(config.format)) {
            case 'json':
                result.content = exportToJSON(processedStructure, config);
                result.metadata.mimeType = 'application/json';
                break;
            case 'text':
                result.content = exportToText(processedStructure, config);
                result.metadata.mimeType = 'text/plain';
                break;
            case 'csv':
                result.content = exportToCSV(processedStructure, config);
                result.metadata.mimeType = 'text/csv';
                break;
            default:
                throw new Error('Unsupported export format: ' + config.format);
        }
        
        // Update result metadata
        result.success = true;
        result.exportTime = new Date().getTime() - startTime;
        result.contentLength = result.content.length;
        result.metadata.exportTimestamp = getCurrentTimestamp();
        result.metadata.configuration = config;
        
        if (config.includeStatistics) {
            result.metadata.statistics = generateExportStatistics(processedStructure, result);
        }
        
        return result;
        
    } catch (exc) {
        return {
            success: false,
            format: config.format,
            content: '',
            metadata: {},
            error: 'Export failed: ' + exc.message,
            exportTime: new Date().getTime() - startTime,
            contentLength: 0
        };
    }
}

/**
 * Pre-process DOM structure for export optimization
 * @param {Object} domStructure - Original DOM structure
 * @param {Object} config - Export configuration
 * @returns {Object} Processed structure
 */
function preprocessForExport(domStructure, config) {
    try {
        var processed = objectClone(domStructure, config.maxDepth || 8);
        
        // Add export enhancements
        if (!processed.exportEnhancements) {
            processed.exportEnhancements = {};
        }
        
        processed.exportEnhancements.comparisonReady = config.generateComparisonData;
        processed.exportEnhancements.accessPathsGenerated = config.includeAlternativePaths;
        processed.exportEnhancements.objectReferencesTracked = config.includeObjectReferences;
        processed.exportEnhancements.valuesExtracted = config.includeExtractedValues;
        processed.exportEnhancements.exportTimestamp = getCurrentTimestamp();
        
        // Generate comparison fingerprint if enabled
        if (config.generateComparisonData) {
            processed.exportEnhancements.comparisonFingerprint = generateComparisonFingerprint(processed);
        }
        
        return processed;
        
    } catch (exc) {
        return domStructure; // Fallback to original
    }
}

/**
 * Generate comparison fingerprint for structure
 * @param {Object} domStructure - DOM structure
 * @returns {String} Fingerprint
 */
function generateComparisonFingerprint(domStructure) {
    try {
        var components = [];
        
        if (domStructure.metadata) {
            components[components.length] = 'doc:' + (domStructure.metadata.documentName || 'unknown');
        }
        
        if (domStructure.statistics) {
            components[components.length] = 'nodes:' + (domStructure.statistics.totalNodes || 0);
            components[components.length] = 'props:' + (domStructure.statistics.totalProperties || 0);
        }
        
        components[components.length] = 'time:' + (new Date().getTime());
        
        return arrayJoin(components, '|');
        
    } catch (exc) {
        return 'fingerprint_error';
    }
}

// =============================================================================
// JSON EXPORT FUNCTIONS
// =============================================================================

/**
 * Export DOM structure to JSON format
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Export configuration
 * @returns {String} JSON string
 */
function exportToJSON(domStructure, config) {
    try {
        // Use custom JSON stringifier for ES3 compatibility
        return stringifyJSON(domStructure, config.compactOutput ? 0 : 2);
        
    } catch (exc) {
        return '{"error": "JSON export failed: ' + stringReplace(exc.message, '"', '\\"') + '"}';
    }
}

/**
 * Custom JSON stringifier for ES3 compatibility
 * @param {*} objectData - Object to stringify
 * @param {Number} indent - Indentation level
 * @returns {String} JSON string
 */
function stringifyJSON(objectData, indent) {
    var indentLevel = indent || 0;
    var seen = [];
    
    function stringify(value, currentDepth) {
        if (currentDepth > 10) return '"[max depth exceeded]"';
        
        var valueType = typeof value;
        
        if (value === null) {
            return 'null';
        }
        
        if (value === undefined) {
            return 'undefined';
        }
        
        if (valueType === 'string') {
            return '"' + stringReplace(value, '"', '\\"') + '"';
        }
        
        if (valueType === 'number' || valueType === 'boolean') {
            return String(value);
        }
        
        if (valueType !== 'object') {
            return '"[' + valueType + ']"';
        }
        
        // Check for circular references
        for (var i = 0; i < seen.length; i++) {
            if (seen[i] === value) {
                return '"[circular reference]"';
            }
        }
        
        seen[seen.length] = value;
        
        var indentStr = '';
        for (var j = 0; j < currentDepth * indentLevel; j++) {
            indentStr += ' ';
        }
        
        var nextIndentStr = indentStr;
        if (indentLevel > 0) {
            for (var k = 0; k < indentLevel; k++) {
                nextIndentStr += ' ';
            }
        }
        
        // Handle arrays
        if (value.length !== undefined && typeof value.length === 'number') {
            var arrayItems = [];
            for (var arrIndex = 0; arrIndex < value.length; arrIndex++) {
                arrayItems[arrayItems.length] = stringify(value[arrIndex], currentDepth + 1);
            }
            
            if (indentLevel > 0) {
                return '[\n' + nextIndentStr + arrayJoin(arrayItems, ',\n' + nextIndentStr) + '\n' + indentStr + ']';
            } else {
                return '[' + arrayJoin(arrayItems, ', ') + ']';
            }
        }
        
        // Handle objects
        var objectPairs = [];
        for (var prop in value) {
            if (objectHasOwnProperty(value, prop)) {
                var propValue = stringify(value[prop], currentDepth + 1);
                objectPairs[objectPairs.length] = '"' + prop + '": ' + propValue;
            }
        }
        
        if (indentLevel > 0) {
            return '{\n' + nextIndentStr + arrayJoin(objectPairs, ',\n' + nextIndentStr) + '\n' + indentStr + '}';
        } else {
            return '{' + arrayJoin(objectPairs, ', ') + '}';
        }
    }
    
    try {
        return stringify(objectData, 0);
    } catch (exc) {
        return '{"error": "JSON stringify failed: ' + exc.message + '"}';
    }
}

/**
 * Create indentation string
 * @param {Number} level - Indentation level
 * @returns {String} Indent string
 */
function createIndent(level) {
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

// =============================================================================
// TEXT EXPORT FUNCTIONS
// =============================================================================

/**
 * Export DOM structure to text format
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Export configuration
 * @returns {String} Text export
 */
function exportToText(domStructure, config) {
    try {
        var builder = createStringBuilder();
        
        // Header
        builder.appendLine('InDesign DOM Discovery Builder v3.1 - Export Report');
        builder.appendLine('================================================================');
        builder.appendLine('Generated: ' + getCurrentTimestamp());
        builder.appendLine('');
        
        // Metadata section
        if (config.includeMetadata) {
            builder.append(generateMetadataSection(domStructure, config));
        }
        
        // Statistics section
        if (config.includeStatistics) {
            builder.append(generateStatisticsSection(domStructure, config));
        }
        
        // Access guide section
        if (config.includeAccessGuide) {
            builder.append(generateAccessGuideSection(domStructure, config));
        }
        
        // Object references section
        if (config.includeObjectReferences) {
            builder.append(generateObjectReferenceSection(domStructure));
        }
        
        // Main structure section
        builder.append(generateStructureSection(domStructure, config));
        
        // Export enhancements section
        if (domStructure.exportEnhancements) {
            builder.append(generateExportEnhancementsSection(domStructure.exportEnhancements));
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Text export failed: ' + exc.message;
    }
}

/**
 * Generate metadata section
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Configuration
 * @returns {String} Metadata section
 */
function generateMetadataSection(domStructure, config) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('DOCUMENT METADATA');
        builder.appendLine('=================');
        
        if (domStructure.metadata) {
            var metadata = domStructure.metadata;
            
            builder.appendLine('Document Name: ' + (metadata.documentName || 'Unknown'));
            builder.appendLine('Analysis Version: ' + (metadata.version || 'Unknown'));
            builder.appendLine('Timestamp: ' + (metadata.timestamp || 'Unknown'));
            
            if (metadata.environment) {
                builder.appendLine('InDesign Version: ' + (metadata.environment.indesignVersion || 'Unknown'));
                builder.appendLine('Native JSON Support: ' + (metadata.environment.hasNativeJSON ? 'Yes' : 'No'));
            }
            
            if (metadata.enhancedFeatures) {
                builder.appendLine('');
                builder.appendLine('Enhanced Features:');
                builder.appendLine('  Object Tracking: ' + (metadata.enhancedFeatures.objectTracking ? 'Enabled' : 'Disabled'));
                builder.appendLine('  Duplicate Detection: ' + (metadata.enhancedFeatures.duplicateDetection ? 'Enabled' : 'Disabled'));
                builder.appendLine('  ES3 Compliant: ' + (metadata.enhancedFeatures.es3Compliant ? 'Yes' : 'No'));
            }
            
            if (metadata.valueSampling) {
                builder.appendLine('');
                builder.appendLine('Value Sampling:');
                builder.appendLine('  Enabled: ' + (metadata.valueSampling.enabled ? 'Yes' : 'No'));
                
                if (metadata.valueSampling.statistics) {
                    var stats = metadata.valueSampling.statistics;
                    builder.appendLine('  Properties Sampled: ' + (stats.propertiesSampled || 0));
                    builder.appendLine('  Values Extracted: ' + (stats.valuesSampled || 0));
                    builder.appendLine('  Success Rate: ' + Math.round((stats.valuesSampled / stats.propertiesSampled) * 100) + '%');
                }
            }
        } else {
            builder.appendLine('No metadata available');
        }
        
        builder.appendLine('');
        return builder.toString();
        
    } catch (exc) {
        return 'Metadata section error: ' + exc.message + '\n\n';
    }
}

/**
 * Generate statistics section
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Configuration
 * @returns {String} Statistics section
 */
function generateStatisticsSection(domStructure, config) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('STRUCTURE STATISTICS');
        builder.appendLine('====================');
        
        if (domStructure.statistics) {
            var stats = domStructure.statistics;
            
            builder.appendLine('Total Nodes: ' + (stats.totalNodes || 0));
            builder.appendLine('Total Properties: ' + (stats.totalProperties || 0));
            builder.appendLine('Total Collections: ' + (stats.totalCollections || 0));
            builder.appendLine('Total Methods: ' + (stats.totalMethods || 0));
            builder.appendLine('Maximum Depth: ' + (stats.maxDepth || 0));
            
            if (stats.objectsTracked > 0) {
                builder.appendLine('Objects Tracked: ' + stats.objectsTracked);
                builder.appendLine('Duplicate Objects: ' + (stats.duplicateObjects || 0));
                builder.appendLine('Circular References: ' + (stats.circularReferences || 0));
            }
        } else {
            builder.appendLine('No statistics available');
        }
        
        builder.appendLine('');
        return builder.toString();
        
    } catch (exc) {
        return 'Statistics section error: ' + exc.message + '\n\n';
    }
}

/**
 * Generate access guide section
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Configuration
 * @returns {String} Access guide section
 */
function generateAccessGuideSection(domStructure, config) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('DEVELOPER ACCESS GUIDE');
        builder.appendLine('======================');
        builder.appendLine('');
        
        builder.appendLine('SAFE PROPERTY ACCESS PATTERN:');
        builder.appendLine('try {');
        builder.appendLine('    var value = app.activeDocument.pages[0];');
        builder.appendLine('    if (value) {');
        builder.appendLine('        $.writeln("Found: " + value);');
        builder.appendLine('    }');
        builder.appendLine('} catch (e) {');
        builder.appendLine('    $.writeln("Access failed: " + e.message);');
        builder.appendLine('}');
        builder.appendLine('');
        
        builder.appendLine('COLLECTION ITERATION PATTERN:');
        builder.appendLine('var doc = app.activeDocument;');
        builder.appendLine('if (doc.pages && doc.pages.length > 0) {');
        builder.appendLine('    for (var i = 0; i < doc.pages.length; i++) {');
        builder.appendLine('        try {');
        builder.appendLine('            var page = doc.pages[i];');
        builder.appendLine('            // Process page safely');
        builder.appendLine('        } catch (e) {');
        builder.appendLine('            $.writeln("Page " + i + " error: " + e.message);');
        builder.appendLine('        }');
        builder.appendLine('    }');
        builder.appendLine('}');
        builder.appendLine('');
        
        builder.appendLine('SAFETY NOTES:');
        builder.appendLine('• Always use try-catch blocks for InDesign DOM access');
        builder.appendLine('• Check for null/undefined before accessing properties');
        builder.appendLine('• Verify collection lengths before iteration');
        builder.appendLine('• Properties marked as "dangerous" should be avoided');
        builder.appendLine('• Test scripts thoroughly before production use');
        builder.appendLine('');
        
        return builder.toString();
        
    } catch (exc) {
        return 'Access guide error: ' + exc.message + '\n\n';
    }
}

/**
 * Generate structure section
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Configuration
 * @returns {String} Structure section
 */
function generateStructureSection(domStructure, config) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('DOM STRUCTURE');
        builder.appendLine('=============');
        builder.appendLine('');
        
        if (domStructure.structure && domStructure.structure.document) {
            builder.append(generateNodeText(domStructure.structure.document, 0, config));
        } else {
            builder.appendLine('No structure data available');
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Structure section error: ' + exc.message + '\n\n';
    }
}

/**
 * Generate text for DOM node
 * @param {Object} node - DOM node
 * @param {Number} depth - Current depth
 * @param {Object} config - Configuration
 * @returns {String} Node text
 */
function generateNodeText(node, depth, config) {
    try {
        var builder = createStringBuilder();
        var indent = createIndent(depth);
        
        // Node header
        var nodeInfo = node.name + ' (' + node.type + ')';
        if (node.objectId) {
            nodeInfo += ' [ID: ' + stringSubstring(node.objectId, 0, 8) + '...]';
        }
        
        builder.appendLine(indent + '▼ ' + nodeInfo);
        
        // Properties
        if (node.properties && node.properties.length > 0) {
            builder.appendLine(indent + '  Properties (' + node.properties.length + '):');
            for (var p = 0; p < Math.min(node.properties.length, 15); p++) {
                var prop = node.properties[p];
                var propText = '• ' + prop.name + ' (' + prop.type + ')';
                
                // Show extracted value if available
                if (prop.samplingMetadata && prop.samplingMetadata.formattedValue) {
                    propText += ' = ' + prop.samplingMetadata.formattedValue;
                }
                
                if (prop.safetyLevel) {
                    propText += ' [' + prop.safetyLevel + ']';
                }
                
                builder.appendLine(indent + '    ' + propText);
            }
            
            if (node.properties.length > 15) {
                builder.appendLine(indent + '    ... (' + (node.properties.length - 15) + ' more properties)');
            }
        }
        
        // Collections
        if (node.collections && node.collections.length > 0) {
            builder.appendLine(indent + '  Collections (' + node.collections.length + '):');
            for (var c = 0; c < Math.min(node.collections.length, 10); c++) {
                var collection = node.collections[c];
                var collText = '• ' + collection.name + ' (' + collection.type + ')';
                
                // Show collection content if available
                if (collection.samplingMetadata && collection.samplingMetadata.formattedValue) {
                    collText += ' = ' + collection.samplingMetadata.formattedValue;
                }
                
                builder.appendLine(indent + '    ' + collText);
            }
        }
        
        // Methods
        if (node.methods && node.methods.length > 0) {
            builder.appendLine(indent + '  Methods (' + node.methods.length + '):');
            for (var m = 0; m < Math.min(node.methods.length, 10); m++) {
                builder.appendLine(indent + '    • ' + node.methods[m].name + '()');
            }
        }
        
        // Alternative access paths
        if (node.alternativeAccessPaths && node.alternativeAccessPaths.length > 0) {
            builder.appendLine(indent + '  Alternative Access Paths:');
            for (var a = 0; a < Math.min(node.alternativeAccessPaths.length, 3); a++) {
                builder.appendLine(indent + '    • ' + node.alternativeAccessPaths[a]);
            }
        }
        
        // Child nodes
        if (node.childNodes && node.childNodes.length > 0) {
            for (var n = 0; n < node.childNodes.length; n++) {
                builder.append(generateNodeText(node.childNodes[n], depth + 1, config));
            }
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Node text generation error: ' + exc.message + '\n';
    }
}

/**
 * Generate object reference section
 * @param {Object} domStructure - DOM structure
 * @returns {String} Object reference section
 */
function generateObjectReferenceSection(domStructure) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('OBJECT REFERENCES');
        builder.appendLine('=================');
        
        if (domStructure.objectRegistry && domStructure.objectRegistry.references) {
            var refCount = countObjectKeys(domStructure.objectRegistry.references);
            builder.appendLine('Total Object References: ' + refCount);
            
            if (domStructure.objectRegistry.duplicateDetections) {
                var dupCount = countObjectKeys(domStructure.objectRegistry.duplicateDetections);
                builder.appendLine('Duplicate Objects Found: ' + dupCount);
            }
            
            if (domStructure.objectRegistry.circularReferences) {
                builder.appendLine('Circular References: ' + domStructure.objectRegistry.circularReferences.length);
                
                if (domStructure.objectRegistry.circularReferences.length > 0) {
                    builder.appendLine('');
                    builder.appendLine('Circular Reference Details:');
                    for (var i = 0; i < Math.min(domStructure.objectRegistry.circularReferences.length, 5); i++) {
                        var circRef = domStructure.objectRegistry.circularReferences[i];
                        builder.appendLine('  • ' + circRef.originalPath + ' → ' + circRef.circularPath);
                    }
                }
            }
        } else {
            builder.appendLine('No object reference tracking data available.');
        }
        
        builder.appendLine('');
        return builder.toString();
        
    } catch (exc) {
        return 'Object reference section error: ' + exc.message + '\n\n';
    }
}

/**
 * Generate export enhancements section
 * @param {Object} enhancements - Export enhancements
 * @returns {String} Enhancements section
 */
function generateExportEnhancementsSection(enhancements) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('EXPORT ENHANCEMENTS');
        builder.appendLine('==================');
        
        builder.appendLine('Comparison Ready: ' + (enhancements.comparisonReady ? 'Yes' : 'No'));
        builder.appendLine('Access Paths Generated: ' + (enhancements.accessPathsGenerated ? 'Yes' : 'No'));
        builder.appendLine('Object References Tracked: ' + (enhancements.objectReferencesTracked ? 'Yes' : 'No'));
        builder.appendLine('Values Extracted: ' + (enhancements.valuesExtracted ? 'Yes' : 'No'));
        
        if (enhancements.comparisonFingerprint) {
            builder.appendLine('');
            builder.appendLine('Comparison Fingerprint: ' + enhancements.comparisonFingerprint);
        }
        
        builder.appendLine('Export Timestamp: ' + (enhancements.exportTimestamp || 'Unknown'));
        builder.appendLine('');
        
        return builder.toString();
        
    } catch (exc) {
        return 'Export enhancements section error: ' + exc.message + '\n\n';
    }
}

// =============================================================================
// CSV EXPORT FUNCTIONS
// =============================================================================

/**
 * Export DOM structure to CSV format
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Export configuration
 * @returns {String} CSV export
 */
function exportToCSV(domStructure, config) {
    try {
        var builder = createStringBuilder();
        
        // CSV Header
        builder.appendLine('Path,Name,Type,Depth,Safety Level,Is Collection,Is Method,Object ID,Alternative Paths,Properties Count,Module Version');
        
        // Generate CSV rows from DOM structure
        if (domStructure.structure && domStructure.structure.document) {
            generateCSVRows(domStructure.structure.document, builder, config);
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'CSV export generation failed: ' + exc.message;
    }
}

/**
 * Generate CSV rows for DOM node and children
 * @param {Object} domNode - DOM node
 * @param {Object} builder - String builder
 * @param {Object} config - Configuration
 */
function generateCSVRows(domNode, builder, config) {
    try {
        if (!domNode) return;
        
        // Generate row for current node
        var altPaths = domNode.alternativeAccessPaths ? 
            arrayJoin(domNode.alternativeAccessPaths, ';') : '';
        var propCount = (domNode.properties ? domNode.properties.length : 0) + 
                       (domNode.collections ? domNode.collections.length : 0) + 
                       (domNode.methods ? domNode.methods.length : 0);
        
        builder.appendLine([
            csvEscape(domNode.path || ''),
            csvEscape(domNode.name || ''),
            csvEscape(domNode.type || ''),
            domNode.depth || 0,
            csvEscape('safe'), // Default safety level
            'false', // Is collection
            'false', // Is method
            csvEscape(domNode.objectId || ''),
            csvEscape(altPaths),
            propCount,
            csvEscape('3.1') // Module version
        ].join(','));
        
        // Add rows for properties
        if (domNode.properties) {
            for (var p = 0; p < domNode.properties.length; p++) {
                var prop = domNode.properties[p];
                builder.appendLine([
                    csvEscape(prop.path || ''),
                    csvEscape(prop.name || ''),
                    csvEscape(prop.type || ''),
                    (domNode.depth || 0) + 1,
                    csvEscape(prop.safetyLevel || 'unknown'),
                    'false',
                    'false',
                    csvEscape(''),
                    csvEscape(''),
                    0,
                    csvEscape('3.1')
                ].join(','));
            }
        }
        
        // Add rows for collections
        if (domNode.collections) {
            for (var c = 0; c < domNode.collections.length; c++) {
                var collection = domNode.collections[c];
                builder.appendLine([
                    csvEscape(collection.path || ''),
                    csvEscape(collection.name || ''),
                    csvEscape(collection.type || ''),
                    (domNode.depth || 0) + 1,
                    csvEscape(collection.safetyLevel || 'unknown'),
                    'true',
                    'false',
                    csvEscape(''),
                    csvEscape(''),
                    0,
                    csvEscape('3.1')
                ].join(','));
            }
        }
        
        // Add rows for methods
        if (domNode.methods) {
            for (var m = 0; m < domNode.methods.length; m++) {
                var method = domNode.methods[m];
                builder.appendLine([
                    csvEscape(method.path || ''),
                    csvEscape(method.name || ''),
                    csvEscape(method.type || ''),
                    (domNode.depth || 0) + 1,
                    csvEscape(method.safetyLevel || 'unknown'),
                    'false',
                    'true',
                    csvEscape(''),
                    csvEscape(''),
                    0,
                    csvEscape('3.1')
                ].join(','));
            }
        }
        
        // Add rows for child nodes
        if (domNode.childNodes && domNode.childNodes.length) {
            for (var i = 0; i < domNode.childNodes.length; i++) {
                generateCSVRows(domNode.childNodes[i], builder, config);
            }
        }
        
    } catch (exc) {
        // Continue processing
    }
}

/**
 * Escape CSV field content
 * @param {String} field - Field content
 * @returns {String} Escaped field
 */
function csvEscape(field) {
    try {
        if (typeof field !== 'string') {
            field = String(field);
        }
        
        if (stringIndexOf(field, ',') !== -1 || 
            stringIndexOf(field, '"') !== -1 || 
            stringIndexOf(field, '\n') !== -1) {
            return '"' + stringReplace(field, '"', '""') + '"';
        }
        
        return field;
        
    } catch (exc) {
        return '""';
    }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Generate export statistics
 * @param {Object} domStructure - DOM structure
 * @param {Object} exportResult - Export result
 * @returns {Object} Export statistics
 */
function generateExportStatistics(domStructure, exportResult) {
    try {
        return {
            nodeCount: domStructure.statistics ? domStructure.statistics.totalNodes : 0,
            propertyCount: domStructure.statistics ? domStructure.statistics.totalProperties : 0,
            format: exportResult.format,
            timestamp: getCurrentTimestamp(),
            contentLength: exportResult.contentLength,
            exportTime: exportResult.exportTime
        };
    } catch (exc) {
        return {
            error: exc.message,
            timestamp: getCurrentTimestamp()
        };
    }
}

// =============================================================================
// MODULE REGISTRATION
// =============================================================================

// Register this module with all its functions
registerModule('3.2_dom-exporter', '3.1', [
    // Main Export Functions
    'exportDOMStructure', 'preprocessForExport', 'generateComparisonFingerprint',
    
    // JSON Export
    'exportToJSON', 'stringifyJSON', 'createIndent',
    
    // Text Export
    'exportToText', 'generateMetadataSection', 'generateStatisticsSection',
    'generateAccessGuideSection', 'generateStructureSection', 'generateNodeText', 
    'generateObjectReferenceSection', 'generateExportEnhancementsSection',
    
    // CSV Export
    'exportToCSV', 'generateCSVRows', 'csvEscape',
    
    // Utilities
    'generateExportStatistics'
]);

// =============================================================================
// END OF 3.2_dom-exporter.jsx
// =============================================================================