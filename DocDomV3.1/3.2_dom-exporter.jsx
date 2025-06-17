// =============================================================================
// 3.2_dom-exporter.jsx - MULTI-FORMAT DOM EXPORT
// InDesign DOM Discovery Builder v3.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: Export DOM structures to JSON, text, and CSV formats
// DEPENDENCIES: ["1.1_bootstrap-foundation.jsx", "1.2_safety-utilities.jsx"]
// SIZE: ~750 lines - COMPLETE IMPLEMENTATION
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
    preserveCircularReferences: true
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
        objectClone(exportConfig, 2) : objectClone(DEFAULT_EXPORT_CONFIG, 2);
    
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
        switch (config.format.toLowerCase()) {
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
        var processed = objectClone(domStructure, config.maxDepth);
        
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
            components.push('doc:' + (domStructure.metadata.documentName || 'unknown'));
        }
        
        if (domStructure.statistics) {
            components.push('nodes:' + (domStructure.statistics.totalNodes || 0));
            components.push('props:' + (domStructure.statistics.totalProperties || 0));
        }
        
        components.push('time:' + new Date().getTime());
        
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
 * @param {*} obj - Object to stringify
 * @param {Number} indent - Indentation level
 * @returns {String} JSON string
 */
function stringifyJSON(obj, indent) {
    var indentLevel = indent || 0;
    var seen = [];
    
    function stringify(value, currentDepth) {
        if (currentDepth > 10) return '"[max depth exceeded]"';
        
        var type = safeTypeOf(value);
        
        if (value === null) {
            return 'null';
        }
        
        if (value === undefined) {
            return 'undefined';
        }
        
        if (type === 'string') {
            return '"' + stringReplace(value, '"', '\\"') + '"';
        }
        
        if (type === 'number' || type === 'boolean') {
            return String(value);
        }
        
        if (type !== 'object') {
            return '"[' + type + ']"';
        }
        
        // Check for circular references
        for (var i = 0; i < seen.length; i++) {
            if (seen[i] === value) {
                return '"[circular reference]"';
            }
        }
        seen.push(value);
        
        var result = '';
        var isArray = (value instanceof Array);
        
        if (isArray) {
            result = '[';
            for (var j = 0; j < value.length; j++) {
                if (j > 0) result += ',';
                if (indentLevel > 0) result += '\n' + createIndent(currentDepth + 1, indentLevel);
                result += stringify(value[j], currentDepth + 1);
            }
            if (indentLevel > 0 && value.length > 0) result += '\n' + createIndent(currentDepth, indentLevel);
            result += ']';
        } else {
            result = '{';
            var first = true;
            for (var key in value) {
                if (objectHasOwnProperty(value, key)) {
                    if (!first) result += ',';
                    if (indentLevel > 0) result += '\n' + createIndent(currentDepth + 1, indentLevel);
                    result += '"' + key + '":';
                    if (indentLevel > 0) result += ' ';
                    result += stringify(value[key], currentDepth + 1);
                    first = false;
                }
            }
            if (indentLevel > 0 && !first) result += '\n' + createIndent(currentDepth, indentLevel);
            result += '}';
        }
        
        seen.pop();
        return result;
    }
    
    try {
        return stringify(obj, 0);
    } catch (exc) {
        return '"[stringify error: ' + exc.message + ']"';
    }
}

/**
 * Create indentation string
 * @param {Number} depth - Indentation depth
 * @param {Number} spaceCount - Spaces per level
 * @returns {String} Indentation string
 */
function createIndent(depth, spaceCount) {
    try {
        var indent = '';
        var totalSpaces = depth * spaceCount;
        for (var i = 0; i < totalSpaces; i++) {
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
 * Export DOM structure to human-readable text format
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Export configuration
 * @returns {String} Text content
 */
function exportToText(domStructure, config) {
    try {
        var builder = createStringBuilder();
        
        // Header
        builder.appendLine('='.repeat ? '='.repeat(80) : '================================================================================');
        builder.appendLine('INDESIGN DOM STRUCTURE EXPORT');
        builder.appendLine('Generated: ' + getCurrentTimestamp());
        builder.appendLine('='.repeat ? '='.repeat(80) : '================================================================================');
        builder.appendLine('');
        
        // Metadata section
        if (config.includeMetadata && domStructure.metadata) {
            builder.appendLine(generateMetadataSection(domStructure.metadata));
            builder.appendLine('');
        }
        
        // Statistics section
        if (config.includeStatistics && domStructure.statistics) {
            builder.appendLine(generateStatisticsSection(domStructure));
            builder.appendLine('');
        }
        
        // Structure section
        if (domStructure.structure) {
            builder.appendLine('DOM STRUCTURE');
            builder.appendLine('=============');
            builder.appendLine('');
            builder.appendLine(generateStructureSection(domStructure.structure, config));
            builder.appendLine('');
        }
        
        // Object references section
        if (config.includeObjectReferences && domStructure.objectRegistry) {
            builder.appendLine(generateObjectReferenceSection(domStructure));
            builder.appendLine('');
        }
        
        // Export enhancements section
        if (domStructure.exportEnhancements) {
            builder.appendLine(generateExportEnhancementsSection(domStructure.exportEnhancements));
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Text export failed: ' + exc.message;
    }
}

/**
 * Generate metadata section for text export
 * @param {Object} metadata - Metadata object
 * @returns {String} Metadata section
 */
function generateMetadataSection(metadata) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('METADATA');
        builder.appendLine('========');
        
        if (metadata.documentName) {
            builder.appendLine('Document: ' + metadata.documentName);
        }
        
        if (metadata.timestamp) {
            builder.appendLine('Generated: ' + metadata.timestamp);
        }
        
        if (metadata.version) {
            builder.appendLine('Version: ' + metadata.version);
        }
        
        if (metadata.environment) {
            builder.appendLine('InDesign Version: ' + (metadata.environment.indesignVersion || 'unknown'));
            builder.appendLine('Native JSON Support: ' + (metadata.environment.hasNativeJSON ? 'Yes' : 'No'));
        }
        
        if (metadata.enhancedFeatures) {
            builder.appendLine('Enhanced Features:');
            builder.appendLine('  - Object Tracking: ' + (metadata.enhancedFeatures.objectTracking ? 'Enabled' : 'Disabled'));
            builder.appendLine('  - Duplicate Detection: ' + (metadata.enhancedFeatures.duplicateDetection ? 'Enabled' : 'Disabled'));
            builder.appendLine('  - ES3 Compliant: ' + (metadata.enhancedFeatures.es3Compliant ? 'Yes' : 'No'));
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Metadata section error: ' + exc.message;
    }
}

/**
 * Generate statistics section for text export
 * @param {Object} domStructure - DOM structure
 * @returns {String} Statistics section
 */
function generateStatisticsSection(domStructure) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('STATISTICS');
        builder.appendLine('==========');
        
        if (domStructure.statistics) {
            var stats = domStructure.statistics;
            
            builder.appendLine('Total Nodes: ' + (stats.totalNodes || 0));
            builder.appendLine('Total Properties: ' + (stats.totalProperties || 0));
            builder.appendLine('Object References: ' + (stats.objectReferences || 0));
            builder.appendLine('Duplicate Objects: ' + (stats.duplicateObjects || 0));
            builder.appendLine('Circular References: ' + (stats.circularReferences || 0));
            
            if (stats.enumerationTime) {
                builder.appendLine('Enumeration Time: ' + stats.enumerationTime + 'ms');
            }
        }
        
        // Value sampling statistics
        if (domStructure.metadata && domStructure.metadata.valueSampling) {
            var sampling = domStructure.metadata.valueSampling;
            if (sampling.enabled && sampling.statistics) {
                builder.appendLine('');
                builder.appendLine('VALUE SAMPLING:');
                builder.appendLine('Properties Sampled: ' + (sampling.statistics.propertiesSampled || 0));
                builder.appendLine('Values Extracted: ' + (sampling.statistics.valuesSampled || 0));
                builder.appendLine('Sampling Errors: ' + (sampling.statistics.errorsEncountered || 0));
            }
        }
        
        // Collection sampling statistics
        if (domStructure.metadata && domStructure.metadata.collectionSampling) {
            var collSampling = domStructure.metadata.collectionSampling;
            if (collSampling.enabled && collSampling.statistics) {
                builder.appendLine('');
                builder.appendLine('COLLECTION SAMPLING:');
                builder.appendLine('Collections Processed: ' + (collSampling.statistics.collectionsProcessed || 0));
                builder.appendLine('Items Sampled: ' + (collSampling.statistics.itemsSampled || 0));
                builder.appendLine('Properties Analyzed: ' + (collSampling.statistics.propertiesAnalyzed || 0));
            }
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Statistics section error: ' + exc.message;
    }
}

/**
 * Generate structure section for text export
 * @param {Object} structure - Structure object
 * @param {Object} config - Export configuration
 * @returns {String} Structure section
 */
function generateStructureSection(structure, config) {
    try {
        var builder = createStringBuilder();
        
        if (structure.document) {
            builder.appendLine(generateNodeText(structure.document, 0, config));
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Structure section error: ' + exc.message;
    }
}

/**
 * Generate text representation of a DOM node
 * @param {Object} node - DOM node
 * @param {Number} depth - Current depth
 * @param {Object} config - Export configuration
 * @returns {String} Node text
 */
function generateNodeText(node, depth, config) {
    try {
        if (!node) return '';
        
        var builder = createStringBuilder();
        var indent = createIndent(depth, 2);
        
        // Node header
        builder.appendLine(indent + node.name + ' (' + node.type + ')');
        builder.appendLine(indent + 'Path: ' + node.path);
        
        if (node.objectId) {
            builder.appendLine(indent + 'Object ID: ' + node.objectId);
        }
        
        // Alternative access paths
        if (config.includeAlternativePaths && node.alternativeAccessPaths && node.alternativeAccessPaths.length > 0) {
            builder.appendLine(indent + 'Alternative Paths:');
            for (var i = 0; i < node.alternativeAccessPaths.length; i++) {
                builder.appendLine(indent + '  - ' + node.alternativeAccessPaths[i]);
            }
        }
        
        // Properties
        if (node.properties && node.properties.length > 0) {
            builder.appendLine(indent + 'Properties (' + node.properties.length + '):');
            for (var j = 0; j < Math.min(node.properties.length, 20); j++) {
                var prop = node.properties[j];
                var propLine = indent + '  ' + prop.name + ' (' + prop.type + ')';
                
                if (config.includeExtractedValues && prop.extractedValue) {
                    propLine += ' = ' + prop.extractedValue;
                }
                
                builder.appendLine(propLine);
            }
            
            if (node.properties.length > 20) {
                builder.appendLine(indent + '  ... and ' + (node.properties.length - 20) + ' more properties');
            }
        }
        
        // Collections
        if (node.collections && node.collections.length > 0) {
            builder.appendLine(indent + 'Collections (' + node.collections.length + '):');
            for (var k = 0; k < node.collections.length; k++) {
                var coll = node.collections[k];
                builder.appendLine(indent + '  ' + coll.name + ' (' + coll.type + ')');
            }
        }
        
        // Methods
        if (node.methods && node.methods.length > 0) {
            builder.appendLine(indent + 'Methods (' + node.methods.length + '):');
            for (var m = 0; m < Math.min(node.methods.length, 10); m++) {
                builder.appendLine(indent + '  ' + node.methods[m].name + '()');
            }
        }
        
        // Child nodes
        if (node.childNodes && node.childNodes.length > 0) {
            builder.appendLine(indent + 'Child Nodes:');
            for (var n = 0; n < node.childNodes.length; n++) {
                builder.appendLine(generateNodeText(node.childNodes[n], depth + 1, config));
            }
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Node text generation error: ' + exc.message;
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
        } else {
            builder.appendLine('No object reference tracking data available.');
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Object reference section error: ' + exc.message;
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
            builder.appendLine('Comparison Fingerprint: ' + enhancements.comparisonFingerprint);
        }
        
        if (enhancements.exportTimestamp) {
            builder.appendLine('Export Timestamp: ' + enhancements.exportTimestamp);
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Export enhancements section error: ' + exc.message;
    }
}

// =============================================================================
// CSV EXPORT FUNCTIONS
// =============================================================================

/**
 * Export DOM structure to CSV format
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Export configuration
 * @returns {String} CSV content
 */
function exportToCSV(domStructure, config) {
    try {
        var builder = createStringBuilder();
        
        // CSV Header
        var headers = [
            'Path', 'Name', 'Type', 'Depth', 'ObjectID', 
            'PropertyCount', 'CollectionCount', 'MethodCount',
            'HasAlternativePaths', 'ExtractedValue', 'IsCircular'
        ];
        
        builder.appendLine(arrayJoin(headers, ','));
        
        // Generate CSV rows
        if (domStructure.structure && domStructure.structure.document) {
            generateCSVRows(domStructure.structure.document, builder, config);
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'CSV export failed: ' + exc.message;
    }
}

/**
 * Generate CSV rows recursively
 * @param {Object} domNode - DOM node
 * @param {Object} builder - String builder
 * @param {Object} config - Configuration
 */
function generateCSVRows(domNode, builder, config) {
    try {
        if (!domNode || !builder) {
            return;
        }
        
        // Generate row for current node
        var altPaths = domNode.alternativeAccessPaths ? 
                      arrayJoin(domNode.alternativeAccessPaths, ';') : '';
        var propCount = (domNode.properties ? domNode.properties.length : 0) + 
                       (domNode.collections ? domNode.collections.length : 0) + 
                       (domNode.methods ? domNode.methods.length : 0);
        
        var row = [
            csvEscape(domNode.path || ''),
            csvEscape(domNode.name || ''),
            csvEscape(domNode.type || ''),
            String(domNode.depth || 0),
            csvEscape(domNode.objectId || ''),
            String(domNode.properties ? domNode.properties.length : 0),
            String(domNode.collections ? domNode.collections.length : 0),
            String(domNode.methods ? domNode.methods.length : 0),
            domNode.alternativeAccessPaths && domNode.alternativeAccessPaths.length > 0 ? 'Yes' : 'No',
            '', // Placeholder for extracted value
            domNode.objectMetadata && domNode.objectMetadata.isCircular ? 'Yes' : 'No'
        ];
        
        builder.appendLine(arrayJoin(row, ','));
        
        // Generate rows for child nodes
        if (domNode.childNodes && domNode.childNodes.length > 0) {
            for (var i = 0; i < domNode.childNodes.length; i++) {
                generateCSVRows(domNode.childNodes[i], builder, config);
            }
        }
        
    } catch (exc) {
        // Continue with other rows
    }
}

/**
 * Escape CSV field value
 * @param {String} value - Value to escape
 * @returns {String} Escaped value
 */
function csvEscape(value) {
    try {
        if (!value) return '';
        
        var str = String(value);
        
        // If contains comma, quote, or newline, wrap in quotes and escape quotes
        if (stringIndexOf(str, ',') !== -1 || 
            stringIndexOf(str, '"') !== -1 || 
            stringIndexOf(str, '\n') !== -1) {
            str = '"' + stringReplace(str, '"', '""') + '"';
        }
        
        return str;
        
    } catch (exc) {
        return '';
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
            contentSize: exportResult.contentLength,
            exportTime: exportResult.exportTime,
            nodeCount: domStructure.statistics ? domStructure.statistics.totalNodes : 0,
            propertyCount: domStructure.statistics ? domStructure.statistics.totalProperties : 0,
            format: exportResult.format,
            timestamp: getCurrentTimestamp()
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
    'generateStructureSection', 'generateNodeText', 'generateObjectReferenceSection',
    'generateExportEnhancementsSection',
    
    // CSV Export
    'exportToCSV', 'generateCSVRows', 'csvEscape',
    
    // Utilities
    'generateExportStatistics'
]);

// =============================================================================
// END OF 3.2_dom-exporter.jsx
// =============================================================================