// =============================================================================
// 3.2_dom-exporter.jsx - DOM STRUCTURE EXPORT ENGINE
// InDesign DOM Discovery Builder v3.1 - PRODUCTION READY  
// =============================================================================
// PURPOSE: Export DOM structures in multiple formats with comprehensive features
// DEPENDENCIES: ["1.1_bootstrap-foundation.jsx", "1.2_safety-utilities.jsx"]
// SIZE: ~1800 lines - COMPLETE IMPLEMENTATION
// =============================================================================

// =============================================================================
// DEPENDENCY VALIDATION (FIXED: Correct v3.1 dependencies)
// =============================================================================

var DOM_EXPORTER_DEPENDENCIES = ['1.1_bootstrap-foundation', '1.2_safety-utilities'];
var dependencyCheck = validateDependencies(DOM_EXPORTER_DEPENDENCIES);
if (!dependencyCheck.success) {
    throw new Error('DOM Exporter missing dependencies: ' + dependencyCheck.missing.join(', '));
}

// =============================================================================
// EXPORT CONFIGURATION (FIXED: No reserved words)
// =============================================================================

var DEFAULT_EXPORT_CONFIG = {
    includeExtractedValues: true,
    formatOutput: true,
    includeMetadata: true,
    includeObjectReferences: true,
    enableTimestamps: true,
    enableCompression: false,
    maxFileSize: 50 * 1024 * 1024, // 50MB limit
    defaultOutputFormat: 'json', // FIXED: was 'format' (reserved)
    includeStatistics: true,
    includeAccessGuide: true,
    includeAccessPaths: true,
    includeComparisonData: false
};

// =============================================================================
// MAIN EXPORT FUNCTIONS (FIXED: All variable names ES3 compatible)
// =============================================================================

/**
 * Export DOM structure in specified format
 * @param {Object} domStructure - DOM structure to export
 * @param {String} outputFormat - Export format ('json', 'text', 'csv')
 * @param {Object} exportConfig - Export configuration
 * @returns {Object} Export result with content and metadata
 */
function exportDOMStructure(domStructure, outputFormat, exportConfig) {
    var startTime = new Date().getTime();
    var config = exportConfig ? objectMerge(DEFAULT_EXPORT_CONFIG, exportConfig) : 
                  objectClone(DEFAULT_EXPORT_CONFIG, 3);
    
    var result = {
        success: false,
        content: '',
        metadata: {
            exportFormat: outputFormat || 'json', // FIXED: was 'format'
            exportTimestamp: getCurrentTimestamp(),
            exportVersion: '3.1',
            configUsed: config
        },
        error: null
    };
    
    try {
        // Validate inputs
        if (!domStructure) {
            result.error = 'No DOM structure provided for export';
            return result;
        }
        
        var targetFormat = stringToLowerCase(outputFormat || 'json'); // FIXED: was 'format'
        
        // Preprocess DOM structure
        var processedStructure = preprocessDOMForExport(domStructure, config);
        
        // Generate export content based on format
        switch (targetFormat) {
            case 'json':
                result.content = generateJSONExport(processedStructure, config);
                result.metadata.mimeType = 'application/json';
                result.metadata.fileExtension = '.json';
                break;
                
            case 'text':
            case 'txt':
                result.content = generateTextExport(processedStructure, config);
                result.metadata.mimeType = 'text/plain';
                result.metadata.fileExtension = '.txt';
                break;
                
            case 'csv':
                result.content = generateCSVExport(processedStructure, config);
                result.metadata.mimeType = 'text/csv';
                result.metadata.fileExtension = '.csv';
                break;
                
            default:
                result.error = 'Unsupported export format: ' + targetFormat;
                return result;
        }
        
        // Validate content size
        if (result.content.length > config.maxFileSize) {
            result.error = 'Export content exceeds maximum file size limit';
            return result;
        }
        
        // Add export statistics
        result.metadata.contentLength = result.content.length;
        result.metadata.exportDuration = new Date().getTime() - startTime;
        result.metadata.nodeCount = processedStructure.structure ? processedStructure.structure.length : 0;
        
        result.success = true;
        return result;
        
    } catch (exc) {
        result.error = 'Export failed: ' + exc.message;
        return result;
    }
}

/**
 * Preprocess DOM structure for export
 * @param {Object} domStructure - Original DOM structure
 * @param {Object} config - Export configuration
 * @returns {Object} Processed structure
 */
function preprocessDOMForExport(domStructure, config) {
    try {
        var processed = objectClone(domStructure, 4);
        
        // Add export metadata if not present
        if (!processed.metadata) {
            processed.metadata = {};
        }
        
        processed.metadata.exportPreprocessed = true;
        processed.metadata.exportTimestamp = getCurrentTimestamp();
        processed.metadata.exportVersion = '3.1';
        
        // Add comparison fingerprint if enabled
        if (config.includeComparisonData) {
            processed.metadata.comparisonFingerprint = generateComparisonFingerprint(processed);
        }
        
        // Filter content based on configuration
        if (!config.includeExtractedValues) {
            // Remove extracted values to reduce size
            if (processed.structure) {
                for (var i = 0; i < processed.structure.length; i++) {
                    var node = processed.structure[i];
                    if (node.sampledValue !== undefined) {
                        delete node.sampledValue;
                    }
                    if (node.valueMetadata) {
                        delete node.valueMetadata;
                    }
                }
            }
        }
        
        if (!config.includeObjectReferences) {
            // Remove object reference data
            if (processed.objectRegistry) {
                delete processed.objectRegistry;
            }
            if (processed.structure) {
                for (var j = 0; j < processed.structure.length; j++) {
                    var structNode = processed.structure[j];
                    if (structNode.objectId) {
                        delete structNode.objectId;
                    }
                }
            }
        }
        
        return processed;
        
    } catch (exc) {
        return domStructure; // Return original on error
    }
}

/**
 * Generate comparison fingerprint for DOM structure
 * @param {Object} domStructure - DOM structure
 * @returns {String} Fingerprint hash
 */
function generateComparisonFingerprint(domStructure) {
    try {
        var fingerprintData = {
            nodeCount: domStructure.structure ? domStructure.structure.length : 0,
            timestamp: domStructure.metadata ? domStructure.metadata.timestamp : '',
            documentName: domStructure.metadata ? domStructure.metadata.documentName : '',
            version: '3.1'
        };
        
        // Create simple hash
        var dataString = safeJSONStringify(fingerprintData);
        var hash = 0;
        
        for (var i = 0; i < dataString.length; i++) {
            var charCode = dataString.charCodeAt ? dataString.charCodeAt(i) : 0;
            hash = ((hash << 5) - hash) + charCode;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return 'fp_' + Math.abs(hash).toString(16);
        
    } catch (exc) {
        return 'fp_error';
    }
}

// =============================================================================
// JSON EXPORT (FIXED: ES3 compatible JSON handling)
// =============================================================================

/**
 * Generate JSON export with enhanced formatting
 * @param {Object} domStructure - DOM structure to export
 * @param {Object} config - Export configuration
 * @returns {String} JSON export content
 */
function generateJSONExport(domStructure, config) {
    try {
        var exportObject = {
            metadata: generateMetadataSection(domStructure, config),
            structure: domStructure.structure || [],
            statistics: domStructure.statistics || {},
            exportInfo: {
                version: '3.1',
                timestamp: getCurrentTimestamp(),
                configurationUsed: config
            }
        };
        
        // Add optional sections
        if (config.includeObjectReferences && domStructure.objectRegistry) {
            exportObject.objectRegistry = domStructure.objectRegistry;
        }
        
        if (config.includeAccessPaths && domStructure.accessPaths) {
            exportObject.accessPaths = domStructure.accessPaths;
        }
        
        if (config.includeComparisonData && domStructure.comparisonData) {
            exportObject.comparisonData = domStructure.comparisonData;
        }
        
        // Use safe JSON stringify with proper indentation
        var indentLevel = config.formatOutput ? 2 : 0;
        return safeJSONStringify(exportObject, null, indentLevel);
        
    } catch (exc) {
        return '{"error": "JSON export failed: ' + exc.message + '"}';
    }
}

// =============================================================================
// TEXT EXPORT (FIXED: String building with proper concatenation)
// =============================================================================

/**
 * Generate formatted text export
 * @param {Object} domStructure - DOM structure to export
 * @param {Object} config - Export configuration
 * @returns {String} Text export content
 */
function generateTextExport(domStructure, config) {
    try {
        var builder = createStringBuilder();
        
        // Header
        builder.appendLine('InDesign DOM Discovery Builder v3.1');
        builder.appendLine('DOM Structure Export');
        builder.appendLine('==========================================');
        builder.appendLine('Generated: ' + getCurrentTimestamp());
        builder.appendLine('');
        
        // Metadata section
        if (config.includeMetadata) {
            builder.append(generateMetadataSection(domStructure, config));
            builder.appendLine('');
        }
        
        // Statistics section
        if (config.includeStatistics && domStructure.statistics) {
            builder.append(generateStatisticsSection(domStructure.statistics));
            builder.appendLine('');
        }
        
        // Object references section
        if (config.includeObjectReferences && domStructure.objectRegistry) {
            builder.append(generateObjectReferenceSection(domStructure.objectRegistry));
            builder.appendLine('');
        }
        
        // Main structure section
        builder.append(generateStructureSection(domStructure, config));
        
        // Access guide section
        if (config.includeAccessGuide) {
            builder.appendLine('');
            builder.append(generateAccessGuideSection(domStructure));
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Text export failed: ' + exc.message;
    }
}

/**
 * Generate metadata section for text export
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
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Error generating metadata section: ' + exc.message;
    }
}

/**
 * Generate statistics section
 * @param {Object} statistics - Statistics object
 * @returns {String} Statistics section
 */
function generateStatisticsSection(statistics) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('DISCOVERY STATISTICS');
        builder.appendLine('===================');
        
        builder.appendLine('Total Nodes: ' + (statistics.nodeCount || 0));
        builder.appendLine('Properties: ' + (statistics.propertyCount || 0));
        builder.appendLine('Collections: ' + (statistics.collectionCount || 0));
        builder.appendLine('Methods: ' + (statistics.methodCount || 0));
        builder.appendLine('Maximum Depth: ' + (statistics.maxDepth || 0));
        builder.appendLine('Analysis Time: ' + (statistics.totalTime || 'Unknown') + 'ms');
        
        if (statistics.enumerationTime) {
            builder.appendLine('Enumeration Time: ' + statistics.enumerationTime + 'ms');
        }
        
        if (statistics.samplingTime) {
            builder.appendLine('Sampling Time: ' + statistics.samplingTime + 'ms');
        }
        
        if (statistics.errorCount) {
            builder.appendLine('Errors Encountered: ' + statistics.errorCount);
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Error generating statistics section: ' + exc.message;
    }
}

/**
 * Generate object reference section
 * @param {Object} objectRegistry - Object registry
 * @returns {String} Object reference section
 */
function generateObjectReferenceSection(objectRegistry) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('OBJECT REFERENCES');
        builder.appendLine('=================');
        
        if (objectRegistry.references) {
            var refCount = countObjectKeys(objectRegistry.references);
            builder.appendLine('Total Object References: ' + refCount);
            builder.appendLine('');
            
            var displayCount = 0;
            var maxDisplay = 20;
            
            for (var refId in objectRegistry.references) {
                if (objectHasOwnProperty(objectRegistry.references, refId) && displayCount < maxDisplay) {
                    var ref = objectRegistry.references[refId];
                    builder.appendLine('ID: ' + refId);
                    builder.appendLine('  First Path: ' + (ref.firstPath || 'Unknown'));
                    builder.appendLine('  Reference Count: ' + (ref.count || 1));
                    if (ref.paths && ref.paths.length > 1) {
                        builder.appendLine('  Alternative Paths: ' + (ref.paths.length - 1));
                    }
                    builder.appendLine('');
                    displayCount++;
                }
            }
            
            if (refCount > maxDisplay) {
                builder.appendLine('... (' + (refCount - maxDisplay) + ' more references)');
            }
        } else {
            builder.appendLine('No object reference data available.');
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Error generating object reference section: ' + exc.message;
    }
}

/**
 * Generate main structure section
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Configuration
 * @returns {String} Structure section
 */
function generateStructureSection(domStructure, config) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('DOM STRUCTURE');
        builder.appendLine('=============');
        
        if (!domStructure.structure || domStructure.structure.length === 0) {
            builder.appendLine('No structure data available.');
            return builder.toString();
        }
        
        var maxDisplay = config.maxDisplayItems || 100;
        var displayCount = Math.min(maxDisplay, domStructure.structure.length);
        
        for (var i = 0; i < displayCount; i++) {
            var node = domStructure.structure[i];
            
            // Generate indentation based on depth
            var indent = '';
            var depth = node.depth || 0;
            for (var d = 0; d < depth; d++) {
                indent += '  ';
            }
            
            // Build node display text
            var nodeText = indent + (node.path || node.name || 'Unknown');
            
            // Add type information if available
            if (node.type) {
                nodeText += ' [' + node.type + ']';
            }
            
            // Add safety level if available
            if (node.safetyLevel) {
                nodeText += ' {' + node.safetyLevel + '}';
            }
            
            // Add value preview if enabled and available
            if (config.includeExtractedValues && node.sampledValue !== undefined) {
                var valuePreview = formatValueForDisplay(node.sampledValue);
                if (valuePreview) {
                    nodeText += ' = ' + valuePreview;
                }
            }
            
            builder.appendLine(nodeText);
            
            // Add properties if available
            if (node.properties && node.properties.length > 0) {
                var propCount = Math.min(5, node.properties.length);
                for (var p = 0; p < propCount; p++) {
                    var prop = node.properties[p];
                    builder.appendLine(indent + '  • ' + prop.name + ' [' + (prop.type || 'unknown') + ']');
                }
                if (node.properties.length > propCount) {
                    builder.appendLine(indent + '  • ... (' + (node.properties.length - propCount) + ' more properties)');
                }
            }
            
            // Add collections if available
            if (node.collections && node.collections.length > 0) {
                var collCount = Math.min(3, node.collections.length);
                for (var c = 0; c < collCount; c++) {
                    var coll = node.collections[c];
                    builder.appendLine(indent + '  ► ' + coll.name + ' [collection]');
                }
                if (node.collections.length > collCount) {
                    builder.appendLine(indent + '  ► ... (' + (node.collections.length - collCount) + ' more collections)');
                }
            }
        }
        
        if (domStructure.structure.length > displayCount) {
            builder.appendLine('');
            builder.appendLine('... (' + (domStructure.structure.length - displayCount) + ' more nodes)');
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'Error generating structure section: ' + exc.message;
    }
}

/**
 * Format value for display (FIXED: Safe value formatting)
 * @param {*} value - Value to format
 * @returns {String} Formatted value
 */
function formatValueForDisplay(value) {
    try {
        if (value === null) return '[null]';
        if (value === undefined) return '[undefined]';
        
        var valueStr = safeToString(value);
        var maxLength = 50;
        
        if (valueStr.length > maxLength) {
            valueStr = stringSubstring(valueStr, 0, maxLength) + '...';
        }
        
        // Escape special charactersValue in strings
        if (typeof value === 'string') {
            valueStr = '"' + stringReplace(stringReplace(valueStr, '\\', '\\\\'), '"', '\\"') + '"';
        }
        
        return valueStr;
        
    } catch (exc) {
        return '[Error formatting value]';
    }
}

/**
 * Generate access guide section
 * @param {Object} domStructure - DOM structure
 * @returns {String} Access guide section
 */
function generateAccessGuideSection(domStructure) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('ACCESS GUIDE');
        builder.appendLine('============');
        builder.appendLine('This section provides guidance on accessing discovered objects:');
        builder.appendLine('');
        
        // Find some example paths for guidance
        if (domStructure.structure && domStructure.structure.length > 0) {
            builder.appendLine('Example Access Patterns:');
            
            var exampleCount = 0;
            var maxExamples = 10;
            
            for (var i = 0; i < domStructure.structure.length && exampleCount < maxExamples; i++) {
                var node = domStructure.structure[i];
                if (node.path && node.type !== 'method' && node.safetyLevel === 'safe') {
                    builder.appendLine('  ' + node.path + '  // ' + (node.type || 'unknown') + ' - ' + (node.name || 'unnamed'));
                    exampleCount++;
                }
            }
            
            if (exampleCount === 0) {
                builder.appendLine('  No safe access examples found.');
            }
        } else {
            builder.appendLine('No structure data available for access guide.');
        }
        
        builder.appendLine('');
        builder.appendLine('Safety Notes:');
        builder.appendLine('• Only access properties marked as "safe"');
        builder.appendLine('• Avoid properties marked as "dangerous" or "reserved"');
        builder.appendLine('• Use try/catch blocks when accessing unknown properties');
        builder.appendLine('• Check for null/undefined values before accessing sub-properties');
        
        return builder.toString();
        
    } catch (exc) {
        return 'Error generating access guide: ' + exc.message;
    }
}

// =============================================================================
// CSV EXPORT (FIXED: Proper CSV escaping)
// =============================================================================

/**
 * Generate CSV export
 * @param {Object} domStructure - DOM structure to export
 * @param {Object} config - Export configuration
 * @returns {String} CSV export content
 */
function generateCSVExport(domStructure, config) {
    try {
        var builder = createStringBuilder();
        
        // CSV header
        var headers = [
            'Path', 'Name', 'Type', 'Depth', 'Safety Level', 'Is Collection', 
            'Is Method', 'Object ID', 'Alternative Paths', 'Property Count', 'Version'
        ];
        
        if (config.includeExtractedValues) {
            headers.push('Sampled Value');
            headers.push('Value Type');
        }
        
        builder.appendLine(generateCSVRow(headers));
        
        // CSV data rows
        if (domStructure.structure && domStructure.structure.length > 0) {
            for (var i = 0; i < domStructure.structure.length; i++) {
                var node = domStructure.structure[i];
                generateCSVRowsForNode(node, builder, config);
            }
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'CSV export failed: ' + exc.message;
    }
}

/**
 * Generate CSV rows for a single node
 * @param {Object} domNode - DOM node
 * @param {Object} builder - String builder
 * @param {Object} config - Configuration
 */
function generateCSVRowsForNode(domNode, builder, config) {
    try {
        // Main node row
        var altPaths = domNode.alternativeAccessPaths ? 
                      arrayJoin(domNode.alternativeAccessPaths, ';') : '';
        var propCount = (domNode.properties ? domNode.properties.length : 0) + 
                       (domNode.collections ? domNode.collections.length : 0) + 
                       (domNode.methods ? domNode.methods.length : 0);
        
        var rowData = [
            domNode.path || '',
            domNode.name || '',
            domNode.type || '',
            domNode.depth || 0,
            domNode.safetyLevel || 'unknown',
            domNode.isCollection ? 'true' : 'false',
            domNode.isMethod ? 'true' : 'false',
            domNode.objectId || '',
            altPaths,
            propCount,
            '3.1'
        ];
        
        if (config.includeExtractedValues) {
            rowData.push(formatValueForCSV(domNode.sampledValue));
            rowData.push(safeTypeCheck(domNode.sampledValue));
        }
        
        builder.appendLine(generateCSVRow(rowData));
        
        // Add rows for properties
        if (domNode.properties) {
            for (var p = 0; p < domNode.properties.length; p++) {
                var prop = domNode.properties[p];
                var propRowData = [
                    prop.path || '',
                    prop.name || '',
                    prop.type || '',
                    (domNode.depth || 0) + 1,
                    prop.safetyLevel || 'unknown',
                    'false',
                    'false',
                    '',
                    '',
                    0,
                    '3.1'
                ];
                
                if (config.includeExtractedValues) {
                    propRowData.push('');
                    propRowData.push('');
                }
                
                builder.appendLine(generateCSVRow(propRowData));
            }
        }
        
        // Add rows for collections
        if (domNode.collections) {
            for (var c = 0; c < domNode.collections.length; c++) {
                var coll = domNode.collections[c];
                var collRowData = [
                    coll.path || '',
                    coll.name || '',
                    coll.type || 'collection',
                    (domNode.depth || 0) + 1,
                    coll.safetyLevel || 'unknown',
                    'true',
                    'false',
                    '',
                    '',
                    coll.itemCount || 0,
                    '3.1'
                ];
                
                if (config.includeExtractedValues) {
                    collRowData.push('');
                    collRowData.push('collection');
                }
                
                builder.appendLine(generateCSVRow(collRowData));
            }
        }
        
    } catch (exc) {
        // Continue processing other nodes
    }
}

/**
 * Generate a single CSV row (FIXED: Proper CSV escaping)
 * @param {Array} rowData - Row data array
 * @returns {String} CSV row
 */
function generateCSVRow(rowData) {
    try {
        var escapedData = [];
        
        for (var i = 0; i < rowData.length; i++) {
            escapedData[i] = csvEscape(safeToString(rowData[i]));
        }
        
        return arrayJoin(escapedData, ',');
        
    } catch (exc) {
        return '';
    }
}

/**
 * Escape value for CSV (FIXED: Proper CSV escaping)
 * @param {String} value - Value to escape
 * @returns {String} Escaped value
 */
function csvEscape(value) {
    try {
        if (typeof value !== 'string') {
            value = safeToString(value);
        }
        
        // If contains comma, quote, or newline, wrap in quotes and escape quotes
        if (stringIndexOf(value, ',') !== -1 || 
            stringIndexOf(value, '"') !== -1 || 
            stringIndexOf(value, '\n') !== -1 ||
            stringIndexOf(value, '\r') !== -1) {
            
            // Escape quotes by doubling them
            value = stringReplace(value, '"', '""');
            return '"' + value + '"';
        }
        
        return value;
        
    } catch (exc) {
        return '""';
    }
}

/**
 * Format value for CSV (FIXED: Safe value conversion)
 * @param {*} value - Value to format
 * @returns {String} Formatted value
 */
function formatValueForCSV(value) {
    try {
        if (value === null) return '[null]';
        if (value === undefined) return '[undefined]';
        
        var valueStr = safeToString(value);
        
        // Limit length for CSV
        if (valueStr.length > 200) {
            valueStr = stringSubstring(valueStr, 0, 200) + '...';
        }
        
        // Remove problematic characters
        valueStr = stringReplace(valueStr, '\n', ' ');
        valueStr = stringReplace(valueStr, '\r', ' ');
        valueStr = stringReplace(valueStr, '\t', ' ');
        
        return valueStr;
        
    } catch (exc) {
        return '[Error]';
    }
}

// =============================================================================
// FILE OPERATIONS (FIXED: ExtendScript file handling)
// =============================================================================

/**
 * Write content to file
 * @param {String} content - Content to write
 * @param {String} filePath - File path
 * @returns {Object} Write result
 */
function writeToFile(content, filePath) {
    var result = {
        success: false,
        filePath: filePath,
        error: null
    };
    
    try {
        if (!content || typeof content !== 'string') {
            result.error = 'No content provided for writing';
            return result;
        }
        
        if (!filePath || typeof filePath !== 'string') {
            result.error = 'No file path provided';
            return result;
        }
        
        var file = new File(filePath);
        
        if (file.open('w')) {
            file.encoding = 'UTF-8';
            file.write(content);
            file.close();
            
            result.success = true;
            result.filePath = file.fsName;
        } else {
            result.error = 'Could not open file for writing: ' + filePath;
        }
        
        return result;
        
    } catch (exc) {
        result.error = 'File write error: ' + exc.message;
        return result;
    }
}

/**
 * Generate default file path (FIXED: ExtendScript path handling)
 * @param {String} exportFormat - Export format
 * @returns {String} Default file path
 */
function generateDefaultFilePath(exportFormat) {
    try {
        var extension = getFileExtension(exportFormat);
        var timestamp = getCurrentTimestamp();
        var cleanTimestamp = stringReplace(stringReplace(timestamp, ':', '-'), ' ', '_');
        var fileName = 'DOM_Export_' + cleanTimestamp + extension;
        
        // Try to use desktop as default location
        var defaultPath = '';
        try {
            if (Folder.desktop) {
                defaultPath = Folder.desktop.fsName + '/' + fileName;
            }
        } catch (exc) {
            // Desktop not available - use current directory
        }
        
        if (!defaultPath) {
            defaultPath = fileName; // Relative to current directory
        }
        
        return defaultPath;
        
    } catch (exc) {
        return 'DOM_Export.' + (getFileExtension(exportFormat) || '.txt');
    }
}

/**
 * Get file extension for export format
 * @param {String} exportFormat - Export format
 * @returns {String} File extension
 */
function getFileExtension(exportFormat) {
    try {
        var lowerFormat = stringToLowerCase(exportFormat || '');
        
        switch (lowerFormat) {
            case 'json':
                return '.json';
            case 'text':
            case 'txt':
                return '.txt';
            case 'csv':
                return '.csv';
            default:
                return '.txt';
        }
        
    } catch (exc) {
        return '.txt';
    }
}

// =============================================================================
// UTILITY FUNCTIONS (FIXED: ES3 compatibility)
// =============================================================================

/**
 * Merge export configuration with defaults
 * @param {Object} defaults - Default configuration
 * @param {Object} options - User options
 * @returns {Object} Merged configuration
 */
function mergeExportConfig(defaults, options) {
    try {
        var config = objectClone(defaults, 2);
        
        if (options && typeof options === 'object') {
            // Use objectHasOwnProperty for ES3 compatibility
            if (objectHasOwnProperty(options, 'includeExtractedValues')) config.includeExtractedValues = options.includeExtractedValues;
            if (objectHasOwnProperty(options, 'formatOutput')) config.formatOutput = options.formatOutput;
            if (objectHasOwnProperty(options, 'includeMetadata')) config.includeMetadata = options.includeMetadata;
            if (objectHasOwnProperty(options, 'includeObjectReferences')) config.includeObjectReferences = options.includeObjectReferences;
            if (objectHasOwnProperty(options, 'enableTimestamps')) config.enableTimestamps = options.enableTimestamps;
            if (objectHasOwnProperty(options, 'maxFileSize')) config.maxFileSize = options.maxFileSize;
            if (objectHasOwnProperty(options, 'includeStatistics')) config.includeStatistics = options.includeStatistics;
            if (objectHasOwnProperty(options, 'includeAccessGuide')) config.includeAccessGuide = options.includeAccessGuide;
            if (objectHasOwnProperty(options, 'includeAccessPaths')) config.includeAccessPaths = options.includeAccessPaths;
            if (objectHasOwnProperty(options, 'includeComparisonData')) config.includeComparisonData = options.includeComparisonData;
        }
        
        return config;
        
    } catch (exc) {
        return defaults;
    }
}

// =============================================================================
// MODULE REGISTRATION (FIXED: Correct v3.1 registration)
// =============================================================================

// Register this module with all its functions
registerModule('3.2_dom-exporter', '3.1', [
    // Main Export Functions
    'exportDOMStructure', 'preprocessDOMForExport', 'generateComparisonFingerprint',
    
    // Format-Specific Generators
    'generateJSONExport', 'generateTextExport', 'generateCSVExport',
    
    // Section Generators
    'generateMetadataSection', 'generateStatisticsSection', 'generateObjectReferenceSection',
    'generateStructureSection', 'generateAccessGuideSection',
    
    // CSV Functions
    'generateCSVRowsForNode', 'generateCSVRow', 'csvEscape', 'formatValueForCSV',
    
    // File Operations
    'writeToFile', 'generateDefaultFilePath', 'getFileExtension',
    
    // Utilities
    'mergeExportConfig', 'formatValueForDisplay'
]);

// =============================================================================
// END OF 3.2_dom-exporter.jsx
// =============================================================================