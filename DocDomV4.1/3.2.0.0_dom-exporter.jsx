// DocDomV4.1/3.2_dom-exporter.jsx
// 3.2_dom-exporter.jsx - DOM STRUCTURE EXPORT SYSTEM
// InDesign DOM Discovery Builder v4.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: Complete DOM structure export in JSON, Text, and CSV formats
// DEPENDENCIES: ["1.1_bootstrap-foundation.jsx", "1.2_safety-utilities.jsx"]
// SIZE: ~1600 lines - COMPLETE IMPLEMENTATION - ENHANCED LOGGING - ES3 COMPLIANT
// CHANGES FROM 3.1: Fixed ES3 violations, enhanced logging, REMOVED UI duplicates
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
    includeExtractedValues: true,
    formatOutput: true,
    includeMetadata: true,
    includeObjectReferences: true,
    enableTimestamps: true,
    enableCompression: false,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    indentLevel: 2,
    includeStatistics: true,
    includeDebugInfo: false,
    compactMode: false,
    preserveCircularReferences: false
};

// =============================================================================
// MAIN EXPORT FUNCTIONS - ENHANCED LOGGING
// =============================================================================

/**
 * Export DOM structure in specified format - ENHANCED LOGGING
 * @param {Object} domStructure - DOM structure to export
 * @param {String} format - Export format ('json', 'text', 'csv')
 * @param {Object} exportConfig - Export configuration
 * @returns {Object} Export result with content and metadata
 */
function exportDOMStructure(domStructure, format, exportConfig) {
    var startTime = new Date().getTime();
    
    logDebug('=== STARTING exportDOMStructure ===', 'exportData');
    logInfo('Starting DOM structure export in ' + format + ' format', 'exportData');
    
    var config = exportConfig ?
        objectMerge(DEFAULT_EXPORT_CONFIG, exportConfig) :
        DEFAULT_EXPORT_CONFIG;

    logDebug('Export config merged - includeValues: ' + config.includeExtractedValues +
             ', format: ' + config.formatOutput, 'exportData');

    var result = {
        success: false,
        content: '',
        metadata: {
            format: format,
            timestamp: getCurrentTimestamp(),
            builderVersion: '4.1',
            exportTime: 0,
            fileSize: 0
        },
        error: null
    };

    try {
        // Validate inputs
        if (!domStructure) {
            result.error = 'No DOM structure provided';
            logError('Export failed: No DOM structure provided', 'exportData');
            return result;
        }

        if (!format || typeof format !== 'string') {
            result.error = 'Invalid export format';
            logError('Export failed: Invalid format: ' + format, 'exportData');
            return result;
        }

        var formatLower = stringToLowerCase(format);
        logDebug('Export format normalized: ' + formatLower, 'exportData');

        // Validate DOM structure
        var structureValidation = validateDOMStructure(domStructure);
        if (!structureValidation.valid) {
            result.error = 'Invalid DOM structure: ' + structureValidation.error;
            logError('Export failed: ' + result.error, 'exportData');
            return result;
        }

        logInfo('DOM structure validation passed - nodes: ' + structureValidation.nodeCount, 'exportData');

        // Export based on format
        switch (formatLower) {
            case 'json':
                var jsonResult = exportAsJSON(domStructure, config);
                result.content = jsonResult.content;
                result.metadata.contentType = 'application/json';
                break;

            case 'text':
                var textResult = exportAsText(domStructure, config);
                result.content = textResult.content;
                result.metadata.contentType = 'text/plain';
                break;

            case 'csv':
                var csvResult = exportAsCSV(domStructure, config);
                result.content = csvResult.content;
                result.metadata.contentType = 'text/csv';
                break;

            default:
                result.error = 'Unsupported export format: ' + format;
                logError('Export failed: Unsupported format: ' + format, 'exportData');
                return result;
        }

        // Calculate metadata
        result.metadata.exportTime = new Date().getTime() - startTime;
        result.metadata.fileSize = result.content ? result.content.length : 0;

        // Check file size limits
        if (config.maxFileSize > 0 && result.metadata.fileSize > config.maxFileSize) {
            result.error = 'Export size (' + result.metadata.fileSize + ' bytes) exceeds limit (' + config.maxFileSize + ' bytes)';
            logWarn('Export size warning: ' + result.error, 'exportData');
        }

        result.success = true;
        
        logInfo('DOM export completed successfully in ' + result.metadata.exportTime + 'ms', 'exportData');
        logInfo('Export statistics - Format: ' + format + 
               ', Size: ' + result.metadata.fileSize + ' bytes', 'exportData');

        return result;

    } catch (exc) {
        result.error = 'Export failed: ' + exc.message;
        logError('DOM export error: ' + exc.message, 'exportData');
        return result;
    }
}

// =============================================================================
// JSON EXPORT FUNCTIONS - ENHANCED LOGGING
// =============================================================================

/**
 * Export DOM structure as JSON - ENHANCED LOGGING
 * @param {Object} domStructure - DOM structure to export
 * @param {Object} config - Export configuration
 * @returns {Object} JSON export result
 */
function exportAsJSON(domStructure, config) {
    try {
        logDebug('Starting JSON export', 'exportData');

        var exportData = {
            metadata: createExportMetadata(domStructure, 'json', config),
            structure: null,
            statistics: null,
            configuration: null
        };

        // Clone and prepare structure
        if (config.includeExtractedValues) {
            logDebug('Including extracted values in JSON export', 'exportData');
            exportData.structure = objectClone(domStructure.structure, 6);
        } else {
            logDebug('Excluding extracted values from JSON export', 'exportData');
            exportData.structure = createStructureWithoutValues(domStructure.structure);
        }

        // Include statistics if available and requested
        if (config.includeStatistics && domStructure.statistics) {
            exportData.statistics = objectClone(domStructure.statistics, 3);
            logDebug('Statistics included in JSON export', 'exportData');
        }

        // Include configuration if available
        if (config.includeMetadata && domStructure.metadata) {
            exportData.configuration = objectClone(domStructure.metadata, 3);
            logDebug('Configuration metadata included in JSON export', 'exportData');
        }

        // Generate JSON content
        var jsonContent;
        if (config.formatOutput) {
            jsonContent = formatJSONWithIndentation(exportData, config.indentLevel || 2);
            logDebug('JSON formatted with indentation level: ' + (config.indentLevel || 2), 'exportData');
        } else {
            jsonContent = safeJSONStringify(exportData);
            logDebug('JSON generated without formatting (compact)', 'exportData');
        }

        if (!jsonContent) {
            throw new Error('JSON serialization failed');
        }

        logInfo('JSON export completed - length: ' + jsonContent.length + ' characters', 'exportData');

        return {
            content: jsonContent,
            metadata: {
                nodes: countNodesInStructure(exportData.structure),
                includesValues: config.includeExtractedValues,
                formatted: config.formatOutput
            }
        };

    } catch (exc) {
        logError('JSON export error: ' + exc.message, 'exportData');
        throw exc;
    }
}

/**
 * Format JSON with proper indentation - ENHANCED LOGGING
 * @param {Object} data - Data to format
 * @param {Number} indentLevel - Indentation level
 * @returns {String} Formatted JSON
 */
function formatJSONWithIndentation(data, indentLevel) {
    try {
        logDebug('Formatting JSON with indentation level: ' + indentLevel, 'exportData');

        // Try native JSON with spacing if available
        if (typeof JSON !== 'undefined' && JSON.stringify) {
            var formatted = JSON.stringify(data, null, indentLevel);
            if (formatted) {
                logDebug('Native JSON formatting successful', 'exportData');
                return formatted;
            }
        }

        // Fallback to manual formatting
        logDebug('Using fallback JSON formatting', 'exportData');
        return formatJSONManually(data, indentLevel, 0);

    } catch (exc) {
        logError('JSON formatting error: ' + exc.message, 'exportData');
        return safeJSONStringify(data);
    }
}

/**
 * Manual JSON formatting for ExtendScript compatibility - ENHANCED LOGGING
 * @param {*} data - Data to format
 * @param {Number} indentLevel - Indentation level
 * @param {Number} currentDepth - Current depth
 * @returns {String} Formatted JSON
 */
function formatJSONManually(data, indentLevel, currentDepth) {
    try {
        var indent = createIndentString(indentLevel * currentDepth);
        var nextIndent = createIndentString(indentLevel * (currentDepth + 1));

        if (data === null) return 'null';
        if (data === undefined) return 'undefined';

        var dataType = typeof data;

        switch (dataType) {
            case 'string':
                return '"' + stringReplace(data, '"', '\\"') + '"';

            case 'number':
            case 'boolean':
                return safeToString(data);

            case 'object':
                if (typeof data.length === 'number') {
                    // Array
                    if (data.length === 0) return '[]';
                    
                    var arrayItems = [];
                    for (var i = 0; i < data.length; i++) {
                        arrayItems[arrayItems.length] = nextIndent + 
                            formatJSONManually(data[i], indentLevel, currentDepth + 1);
                    }
                    
                    return '[\n' + arrayJoin(arrayItems, ',\n') + '\n' + indent + ']';
                } else {
                    // Object
                    var objectPairs = [];
                    for (var prop in data) {
                        if (objectHasOwnProperty(data, prop)) {
                            var formattedValue = formatJSONManually(data[prop], indentLevel, currentDepth + 1);
                            objectPairs[objectPairs.length] = nextIndent + '"' + prop + '": ' + formattedValue;
                        }
                    }
                    
                    if (objectPairs.length === 0) return '{}';
                    return '{\n' + arrayJoin(objectPairs, ',\n') + '\n' + indent + '}';
                }

            default:
                return '"[' + dataType + ']"';
        }

    } catch (exc) {
        logError('Manual JSON formatting error: ' + exc.message, 'exportData');
        return '"[format error]"';
    }
}

// =============================================================================
// TEXT EXPORT FUNCTIONS - ENHANCED LOGGING
// =============================================================================

/**
 * Export DOM structure as text - ENHANCED LOGGING
 * @param {Object} domStructure - DOM structure to export
 * @param {Object} config - Export configuration
 * @returns {Object} Text export result
 */
function exportAsText(domStructure, config) {
    try {
        logDebug('Starting text export', 'exportData');

        var textBuilder = createStringBuilder();

        // Header
        textBuilder.appendLine('INDESIGN DOM DISCOVERY BUILDER v4.1');
        textBuilder.appendLine('DOM STRUCTURE EXPORT REPORT');
        textBuilder.appendLine('==========================================');
        textBuilder.appendLine('');
        textBuilder.appendLine('Generated: ' + getCurrentTimestamp());
        textBuilder.appendLine('');

        // Metadata section
        if (config.includeMetadata && domStructure.metadata) {
            logDebug('Adding metadata section to text export', 'exportData');
            
            textBuilder.appendLine('METADATA:');
            textBuilder.appendLine('---------');
            
            var metadata = domStructure.metadata;
            textBuilder.appendLine('Builder Version: ' + (metadata.builderVersion || '4.1'));
            textBuilder.appendLine('Document Name: ' + (metadata.documentName || 'Unknown'));
            textBuilder.appendLine('Total Nodes: ' + (metadata.totalNodes || metadata.totalObjects || 0));
            textBuilder.appendLine('Total Properties: ' + (metadata.totalProperties || 0));
            textBuilder.appendLine('Total Collections: ' + (metadata.totalCollections || 0));
            textBuilder.appendLine('Max Depth: ' + (metadata.maxDepth || 0));
            
            if (metadata.enumerationTime) {
                textBuilder.appendLine('Enumeration Time: ' + metadata.enumerationTime + 'ms');
            }
            
            textBuilder.appendLine('');
        }

        // Statistics section
        if (config.includeStatistics && domStructure.statistics) {
            logDebug('Adding statistics section to text export', 'exportData');
            
            textBuilder.appendLine('STATISTICS:');
            textBuilder.appendLine('-----------');
            
            var stats = domStructure.statistics;
            textBuilder.appendLine('Total Nodes: ' + (stats.totalNodes || 0));
            textBuilder.appendLine('Total Properties: ' + (stats.totalProperties || 0));
            textBuilder.appendLine('Total Methods: ' + (stats.totalMethods || 0));
            textBuilder.appendLine('Total Collections: ' + (stats.totalCollections || 0));
            textBuilder.appendLine('Maximum Depth: ' + (stats.maxDepth || 0));
            
            if (stats.nodesByType) {
                textBuilder.appendLine('');
                textBuilder.appendLine('Node Distribution by Type:');
                for (var nodeType in stats.nodesByType) {
                    if (objectHasOwnProperty(stats.nodesByType, nodeType)) {
                        textBuilder.appendLine('  ' + nodeType + ': ' + stats.nodesByType[nodeType]);
                    }
                }
            }
            
            textBuilder.appendLine('');
        }

        // Structure section
        if (domStructure.structure) {
            logDebug('Adding structure section to text export', 'exportData');
            
            textBuilder.appendLine('STRUCTURE:');
            textBuilder.appendLine('----------');
            
            if (domStructure.structure.document) {
                var structureText = generateTextStructure(domStructure.structure.document, 0, config);
                textBuilder.appendLine(structureText);
            } else {
                textBuilder.appendLine('No document structure available');
            }
        }

        // Configuration section
        if (config.includeDebugInfo && domStructure.metadata && domStructure.metadata.enumerationConfig) {
            logDebug('Adding configuration section to text export', 'exportData');
            
            textBuilder.appendLine('');
            textBuilder.appendLine('CONFIGURATION:');
            textBuilder.appendLine('--------------');
            
            var enumConfig = domStructure.metadata.enumerationConfig;
            textBuilder.appendLine('Max Depth: ' + (enumConfig.maxDepth || 'not specified'));
            textBuilder.appendLine('Timeout: ' + (enumConfig.timeoutMs || 'not specified') + 'ms');
            textBuilder.appendLine('Skip Dangerous: ' + (enumConfig.skipDangerous ? 'Yes' : 'No'));
            textBuilder.appendLine('Max Properties: ' + (enumConfig.maxProperties || 'not specified'));
        }

        var textContent = textBuilder.toString();
        
        logInfo('Text export completed - length: ' + textContent.length + ' characters', 'exportData');

        return {
            content: textContent,
            metadata: {
                lines: countLines(textContent),
                includesValues: config.includeExtractedValues,
                includesMetadata: config.includeMetadata
            }
        };

    } catch (exc) {
        logError('Text export error: ' + exc.message, 'exportData');
        throw exc;
    }
}

/**
 * Generate text structure representation - ENHANCED LOGGING
 * @param {Object} node - DOM node to process
 * @param {Number} depth - Current depth
 * @param {Object} config - Export configuration
 * @returns {String} Text representation
 */
function generateTextStructure(node, depth, config) {
    try {
        if (!node) return '';

        var textBuilder = createStringBuilder();
        var indent = createIndentString(depth * 2);

        // Node header
        var nodeHeader = indent + node.path + ' (' + node.type + ')';
        if (node.depth !== undefined) {
            nodeHeader += ' [depth: ' + node.depth + ']';
        }
        textBuilder.appendLine(nodeHeader);

        // Properties
        if (node.properties && node.properties.length > 0) {
            logDebug('Processing ' + node.properties.length + ' properties for node: ' + node.path, 'exportData');
            
            for (var i = 0; i < node.properties.length; i++) {
                var prop = node.properties[i];
                var propLine = indent + '  • ' + prop.name + ': ' + prop.type;
                
                if (config.includeExtractedValues && prop.sampledValue) {
                    propLine += ' = ' + prop.sampledValue;
                }
                
                if (prop.safety && prop.safety !== 'safe') {
                    propLine += ' [' + prop.safety + ']';
                }
                
                textBuilder.appendLine(propLine);
            }
        }

        // Collections
        if (node.collections && node.collections.length > 0) {
            logDebug('Processing ' + node.collections.length + ' collections for node: ' + node.path, 'exportData');
            
            for (var j = 0; j < node.collections.length; j++) {
                var collection = node.collections[j];
                var collectionLine = indent + '  ◆ ' + collection.name + ': collection';
                
                if (collection.collectionLength !== undefined) {
                    collectionLine += ' (length: ' + collection.collectionLength + ')';
                }
                
                if (config.includeExtractedValues && collection.sampledValue) {
                    collectionLine += ' = ' + collection.sampledValue;
                }
                
                textBuilder.appendLine(collectionLine);
            }
        }

        // Methods
        if (node.methods && node.methods.length > 0) {
            logDebug('Processing ' + node.methods.length + ' methods for node: ' + node.path, 'exportData');
            
            for (var k = 0; k < node.methods.length; k++) {
                var method = node.methods[k];
                var methodLine = indent + '  ▶ ' + method.name + '(): function';
                textBuilder.appendLine(methodLine);
            }
        }

        // Child nodes (recursive)
        if (node.childNodes && node.childNodes.length > 0) {
            logDebug('Processing ' + node.childNodes.length + ' child nodes for: ' + node.path, 'exportData');
            
            for (var l = 0; l < node.childNodes.length; l++) {
                var childText = generateTextStructure(node.childNodes[l], depth + 1, config);
                if (childText) {
                    textBuilder.appendLine('');
                    textBuilder.appendLine(childText);
                }
            }
        }

        return textBuilder.toString();

    } catch (exc) {
        logError('Text structure generation error for node: ' + (node ? node.path : 'unknown') + ': ' + exc.message, 'exportData');
        return indent + '[Error generating structure for this node]';
    }
}

// =============================================================================
// CSV EXPORT FUNCTIONS - ENHANCED LOGGING
// =============================================================================

/**
 * Export DOM structure as CSV - ENHANCED LOGGING
 * @param {Object} domStructure - DOM structure to export
 * @param {Object} config - Export configuration
 * @returns {Object} CSV export result
 */
function exportAsCSV(domStructure, config) {
    try {
        logDebug('Starting CSV export', 'exportData');

        var csvBuilder = createStringBuilder();

        // CSV Header
        var headers = ['Path', 'Type', 'Name', 'PropertyType', 'Safety', 'Depth'];
        if (config.includeExtractedValues) {
            headers[headers.length] = 'SampledValue';
        }
        csvBuilder.appendLine(arrayJoin(headers, ','));

        logDebug('CSV headers created: ' + arrayJoin(headers, ', '), 'exportData');

        // Process structure
        var rowCount = 0;
        if (domStructure.structure && domStructure.structure.document) {
            rowCount = generateCSVRows(domStructure.structure.document, csvBuilder, config);
        }

        var csvContent = csvBuilder.toString();
        
        logInfo('CSV export completed - rows: ' + (rowCount + 1) + ', length: ' + csvContent.length + ' characters', 'exportData');

        return {
            content: csvContent,
            metadata: {
                rows: rowCount + 1, // +1 for header
                columns: headers.length,
                includesValues: config.includeExtractedValues
            }
        };

    } catch (exc) {
        logError('CSV export error: ' + exc.message, 'exportData');
        throw exc;
    }
}

/**
 * Generate CSV rows from DOM structure - ENHANCED LOGGING
 * @param {Object} node - DOM node to process
 * @param {Object} csvBuilder - CSV string builder
 * @param {Object} config - Export configuration
 * @returns {Number} Number of rows generated
 */
function generateCSVRows(node, csvBuilder, config) {
    try {
        if (!node) return 0;

        var rowCount = 0;

        // Process properties
        if (node.properties && node.properties.length > 0) {
            for (var i = 0; i < node.properties.length; i++) {
                var prop = node.properties[i];
                var row = [
                    escapeCsvValue(prop.path || ''),
                    escapeCsvValue(node.type || ''),
                    escapeCsvValue(prop.name || ''),
                    escapeCsvValue(prop.type || ''),
                    escapeCsvValue(prop.safety || 'unknown'),
                    escapeCsvValue(safeToString(node.depth || 0))
                ];

                if (config.includeExtractedValues) {
                    row[row.length] = escapeCsvValue(prop.sampledValue || '');
                }

                csvBuilder.appendLine(arrayJoin(row, ','));
                rowCount++;
            }
        }

        // Process collections
        if (node.collections && node.collections.length > 0) {
            for (var j = 0; j < node.collections.length; j++) {
                var collection = node.collections[j];
                var collectionRow = [
                    escapeCsvValue(collection.path || ''),
                    escapeCsvValue(node.type || ''),
                    escapeCsvValue(collection.name || ''),
                    'collection',
                    escapeCsvValue(collection.safety || 'unknown'),
                    escapeCsvValue(safeToString(node.depth || 0))
                ];

                if (config.includeExtractedValues) {
                    collectionRow[collectionRow.length] = escapeCsvValue(collection.sampledValue || '');
                }

                csvBuilder.appendLine(arrayJoin(collectionRow, ','));
                rowCount++;
            }
        }

        // Process methods
        if (node.methods && node.methods.length > 0) {
            for (var k = 0; k < node.methods.length; k++) {
                var method = node.methods[k];
                var methodRow = [
                    escapeCsvValue(method.path || ''),
                    escapeCsvValue(node.type || ''),
                    escapeCsvValue(method.name || ''),
                    'function',
                    escapeCsvValue(method.safety || 'caution'),
                    escapeCsvValue(safeToString(node.depth || 0))
                ];

                if (config.includeExtractedValues) {
                    methodRow[methodRow.length] = '[Function]';
                }

                csvBuilder.appendLine(arrayJoin(methodRow, ','));
                rowCount++;
            }
        }

        // Process child nodes recursively
        if (node.childNodes && node.childNodes.length > 0) {
            for (var l = 0; l < node.childNodes.length; l++) {
                rowCount += generateCSVRows(node.childNodes[l], csvBuilder, config);
            }
        }

        return rowCount;

    } catch (exc) {
        logError('CSV row generation error for node: ' + (node ? node.path : 'unknown') + ': ' + exc.message, 'exportData');
        return 0;
    }
}

/**
 * Escape CSV value to handle commas and quotes - ENHANCED LOGGING
 * @param {String} value - Value to escape
 * @returns {String} Escaped CSV value
 */
function escapeCsvValue(value) {
    try {
        if (!value || typeof value !== 'string') {
            return '""';
        }

        var stringValue = safeToString(value);
        
        // Check if escaping is needed
        if (stringIndexOf(stringValue, ',') !== -1 || 
            stringIndexOf(stringValue, '"') !== -1 || 
            stringIndexOf(stringValue, '\n') !== -1) {
            
            // Escape quotes by doubling them
            var escaped = stringReplace(stringValue, '"', '""');
            return '"' + escaped + '"';
        }

        return stringValue;

    } catch (exc) {
        logError('CSV value escaping error: ' + exc.message, 'exportData');
        return '""';
    }
}

// =============================================================================
// UTILITY FUNCTIONS - ENHANCED LOGGING
// =============================================================================

/**
 * Create export metadata - ENHANCED LOGGING
 * @param {Object} domStructure - DOM structure
 * @param {String} format - Export format
 * @param {Object} config - Export configuration
 * @returns {Object} Export metadata
 */
function createExportMetadata(domStructure, format, config) {
    try {
        logDebug('Creating export metadata for format: ' + format, 'exportData');

        var metadata = {
            exportFormat: format,
            exportTimestamp: getCurrentTimestamp(),
            builderVersion: '4.1',
            includeExtractedValues: config.includeExtractedValues || false,
            includeMetadata: config.includeMetadata || false,
            formatOutput: config.formatOutput || false
        };

        // Source structure metadata
        if (domStructure.metadata) {
            metadata.sourceMetadata = {
                documentName: domStructure.metadata.documentName,
                totalNodes: domStructure.metadata.totalNodes || domStructure.metadata.totalObjects,
                totalProperties: domStructure.metadata.totalProperties,
                enumerationTime: domStructure.metadata.enumerationTime,
                builderVersion: domStructure.metadata.builderVersion
            };
        }

        logDebug('Export metadata created successfully', 'exportData');
        return metadata;

    } catch (exc) {
        logError('Export metadata creation error: ' + exc.message, 'exportData');
        return {
            exportFormat: format,
            exportTimestamp: getCurrentTimestamp(),
            builderVersion: '4.1',
            error: exc.message
        };
    }
}

/**
 * Create structure without extracted values - ENHANCED LOGGING
 * @param {Object} structure - Original structure
 * @returns {Object} Structure without values
 */
function createStructureWithoutValues(structure) {
    try {
        logDebug('Creating structure without extracted values', 'exportData');

        if (!structure) return null;

        var cleanStructure = objectClone(structure, 5);
        removeExtractedValues(cleanStructure);

        logDebug('Structure cleaned of extracted values', 'exportData');
        return cleanStructure;

    } catch (exc) {
        logError('Structure cleaning error: ' + exc.message, 'exportData');
        return structure; // Return original on error
    }
}

/**
 * Remove extracted values from structure recursively - ENHANCED LOGGING
 * @param {Object} node - Node to clean
 */
function removeExtractedValues(node) {
    try {
        if (!node || typeof node !== 'object') return;

        // Remove sampled values from properties
        if (node.properties) {
            for (var i = 0; i < node.properties.length; i++) {
                if (node.properties[i].sampledValue !== undefined) {
                    delete node.properties[i].sampledValue;
                }
                if (node.properties[i].sampleMetadata !== undefined) {
                    delete node.properties[i].sampleMetadata;
                }
            }
        }

        // Remove sampled values from collections
        if (node.collections) {
            for (var j = 0; j < node.collections.length; j++) {
                if (node.collections[j].sampledValue !== undefined) {
                    delete node.collections[j].sampledValue;
                }
                if (node.collections[j].samplingMetadata !== undefined) {
                    delete node.collections[j].samplingMetadata;
                }
            }
        }

        // Process child nodes recursively
        if (node.childNodes) {
            for (var k = 0; k < node.childNodes.length; k++) {
                removeExtractedValues(node.childNodes[k]);
            }
        }

    } catch (exc) {
        logError('Value removal error for node: ' + (node ? node.path : 'unknown') + ': ' + exc.message, 'exportData');
    }
}

/**
 * Validate DOM structure for export - ENHANCED LOGGING
 * @param {Object} domStructure - DOM structure to validate
 * @returns {Object} Validation result
 */
function validateDOMStructure(domStructure) {
    try {
        logDebug('Validating DOM structure for export', 'exportData');

        var result = {
            valid: false,
            error: null,
            nodeCount: 0,
            hasStructure: false,
            hasMetadata: false
        };

        if (!domStructure || typeof domStructure !== 'object') {
            result.error = 'DOM structure is not an object';
            logWarn('Validation failed: ' + result.error, 'exportData');
            return result;
        }

        // Check for structure
        if (domStructure.structure) {
            result.hasStructure = true;
            if (domStructure.structure.document) {
                result.nodeCount = countNodesInStructure(domStructure.structure.document);
            }
        }

        // Check for metadata
        if (domStructure.metadata) {
            result.hasMetadata = true;
        }

        if (!result.hasStructure && !result.hasMetadata) {
            result.error = 'DOM structure has no exportable content';
            logWarn('Validation failed: ' + result.error, 'exportData');
            return result;
        }

        result.valid = true;
        logDebug('DOM structure validation passed - nodes: ' + result.nodeCount, 'exportData');
        return result;

    } catch (exc) {
        var error = 'Validation error: ' + exc.message;
        logError(error, 'exportData');
        return {
            valid: false,
            error: error,
            nodeCount: 0,
            hasStructure: false,
            hasMetadata: false
        };
    }
}

/**
 * Count nodes in structure recursively - ENHANCED LOGGING
 * @param {Object} node - Root node
 * @returns {Number} Total node count
 */
function countNodesInStructure(node) {
    try {
        if (!node) return 0;

        var count = 1; // Count this node

        if (node.childNodes && node.childNodes.length > 0) {
            for (var i = 0; i < node.childNodes.length; i++) {
                count += countNodesInStructure(node.childNodes[i]);
            }
        }

        return count;

    } catch (exc) {
        logError('Node counting error: ' + exc.message, 'exportData');
        return 0;
    }
}

/**
 * Count lines in text - ENHANCED LOGGING
 * @param {String} text - Text to count
 * @returns {Number} Line count
 */
function countLines(text) {
    try {
        if (!text || typeof text !== 'string') return 0;

        var lines = stringSplit(text, '\n');
        return lines.length;

    } catch (exc) {
        logError('Line counting error: ' + exc.message, 'exportData');
        return 0;
    }
}

/**
 * Create indentation string - ENHANCED LOGGING
 * @param {Number} spaces - Number of spaces
 * @returns {String} Indentation string
 */
function createIndentString(spaces) {
    try {
        if (spaces <= 0) return '';

        var indent = '';
        for (var i = 0; i < spaces; i++) {
            indent += ' ';
        }

        return indent;

    } catch (exc) {
        logError('Indent string creation error: ' + exc.message, 'exportData');
        return '';
    }
}

// =============================================================================
// FILE OPERATIONS - ENHANCED LOGGING
// =============================================================================

/**
 * Save content to file - ENHANCED LOGGING
 * @param {String} content - Content to save
 * @param {String} defaultName - Default filename
 * @param {String} extension - File extension
 * @returns {Object} Save result
 */
function saveContentToFile(content, defaultName, extension) {
    try {
        logDebug('Saving content to file - default: ' + defaultName + ', extension: ' + extension, 'exportData');

        var result = {
            success: false,
            filePath: null,
            error: null
        };

        if (!content) {
            result.error = 'No content to save';
            logWarn('Save failed: No content provided', 'exportData');
            return result;
        }

        var filename = defaultName || 'dom_export';
        var fileExtension = extension || 'txt';
        var filter = '*.' + fileExtension;

        var file = File.saveDialog('Save Export As', filter);
        if (!file) {
            result.error = 'Save cancelled by user';
            logDebug('Save cancelled by user', 'exportData');
            return result;
        }

        // Ensure proper extension
        if (stringIndexOf(file.name, '.' + fileExtension) === -1) {
            file = new File(file.parent.absoluteURI + '/' + file.name + '.' + fileExtension);
        }

        // Write file
        file.open('w');
        file.write(content);
        file.close();

        result.success = true;
        result.filePath = file.absoluteURI;

        logInfo('File saved successfully: ' + file.name + ' (' + content.length + ' characters)', 'exportData');
        return result;

    } catch (exc) {
        var error = 'File save error: ' + exc.message;
        logError(error, 'exportData');
        return {
            success: false,
            filePath: null,
            error: error
        };
    }
}

// =============================================================================
// MODULE REGISTRATION - UPDATED (REMOVED UI DUPLICATES)
// =============================================================================

// Register this module with all its functions - NOTE: UI helper functions REMOVED (now in 1.2_safety-utilities)
registerModule('3.2_dom-exporter', '4.1', [
    // Main Export Functions
    'exportDOMStructure', 'exportAsJSON', 'exportAsText', 'exportAsCSV',

    // JSON Export Functions
    'formatJSONWithIndentation', 'formatJSONManually',

    // Text Export Functions
    'generateTextStructure',

    // CSV Export Functions  
    'generateCSVRows', 'escapeCsvValue',

    // Utility Functions
    'createExportMetadata', 'createStructureWithoutValues', 'removeExtractedValues',
    'validateDOMStructure', 'countNodesInStructure', 'countLines', 'createIndentString',

    // File Operations
    'saveContentToFile'
]);

// =============================================================================
// END OF 3.2_dom-exporter.jsx - ENHANCED WITH v4.1 IMPROVEMENTS
// =============================================================================