// =============================================================================
// 3.2_dom-exporter.jsx - DOM STRUCTURE EXPORT ENGINE
// InDesign DOM Discovery Builder v3.1 - PRODUCTION READY  
// =============================================================================
// PURPOSE: Export DOM structures in multiple formats with comprehensive features
// DEPENDENCIES: ["1.1_bootstrap-foundation.jsx", "1.2_safety-utilities.jsx"]
// SIZE: ~1404 lines - COMPLETE IMPLEMENTATION WITH UNIFIED LOGGING
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
// UNIFIED LOGGING CONFIGURATION
// =============================================================================

var EXPORTER_LOGGING_CONFIG = {
    enabled: true,
    levels: {
        INFO: true,      // Always show important operations
        WARN: true,      // Always show warnings
        ERROR: true,     // Always show errors
        DEBUG: false     // Only when debugging (can be enabled via config)
    },
    categories: {
        'export': true,      // Export operations
        'preprocessing': true, // Data preprocessing
        'csv': true,         // CSV generation
        'json': true,        // JSON generation  
        'text': true,        // Text generation
        'file': true,        // File operations
        'performance': true  // Performance metrics
    }
};

/**
 * Enhanced logging for DOM exporter with unified configuration
 * @param {String} message - Log message
 * @param {String} level - Log level: 'INFO', 'DEBUG', 'WARN', 'ERROR'
 * @param {String} category - Category: 'export', 'csv', 'json', 'text', 'file', 'performance'
 */
function exporterLog(message, level, category) {
    try {
        var logLevel = level || 'INFO';
        var logCategory = category || 'export';
        var shouldLog = false;

        // Check if logging is enabled
        if (!EXPORTER_LOGGING_CONFIG.enabled) {
            return;
        }

        // Check level permissions
        if (EXPORTER_LOGGING_CONFIG.levels[logLevel]) {
            shouldLog = true;
        }

        // Check category permissions
        if (!EXPORTER_LOGGING_CONFIG.categories[logCategory]) {
            shouldLog = false;
        }

        // Special case: DEBUG level respects global debug config if available
        if (logLevel === 'DEBUG') {
            if (typeof g_domViz_userConfiguration !== 'undefined' &&
                g_domViz_userConfiguration &&
                g_domViz_userConfiguration.debug &&
                g_domViz_userConfiguration.debug.enabled) {
                shouldLog = true;
            } else {
                shouldLog = EXPORTER_LOGGING_CONFIG.levels.DEBUG;
            }
        }

        if (shouldLog) {
            var logPrefix = '[EXPORTER ' + logLevel;
            if (logCategory !== 'export') {
                logPrefix += ' ' + logCategory.toUpperCase();
            }
            logPrefix += '] ';

            $.writeln(logPrefix + message);
        }
    } catch (exc) {
        // Fallback logging
        $.writeln('[EXPORTER LOG ERROR] ' + message);
    }
}

// Convenience functions for exporter logging
function exporterInfo(message, category) { exporterLog(message, 'INFO', category); }
function exporterDebug(message, category) { exporterLog(message, 'DEBUG', category); }
function exporterWarn(message, category) { exporterLog(message, 'WARN', category); }
function exporterError(message, category) { exporterLog(message, 'ERROR', category); }

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
    maxFileSize: 50 * 1024 * 1024, // 50MB limit
    defaultOutputFormat: 'json',
    includeStatistics: true,
    includeAccessGuide: true,
    includeAccessPaths: true,
    includeComparisonData: false
};

// =============================================================================
// MAIN EXPORT FUNCTIONS
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
    var mergedConfig = exportConfig ?
        objectMerge(DEFAULT_EXPORT_CONFIG, exportConfig) :
        objectClone(DEFAULT_EXPORT_CONFIG, 3);

    exporterInfo('Starting DOM structure export in format: ' + (outputFormat || 'json'), 'export');

    var exportResult = {
        success: false,
        content: '',
        metadata: {
            exportFormat: outputFormat || 'json',
            exportTimestamp: getCurrentTimestamp(),
            exportVersion: '3.1',
            configUsed: mergedConfig
        },
        errorMessage: null
    };

    try {
        // Validate inputs
        if (!domStructure) {
            exportResult.errorMessage = 'No DOM structure provided for export';
            exporterError(exportResult.errorMessage, 'export');
            return exportResult;
        }

        var targetFormat = stringToLowerCase(outputFormat || 'json');
        exporterDebug('Target format: ' + targetFormat, 'export');

        // Preprocess DOM structure
        var processedStructure = preprocessDOMForExport(domStructure, mergedConfig);
        exporterDebug('DOM structure preprocessed', 'preprocessing');

        // Generate export content based on format
        switch (targetFormat) {
            case 'json':
                exportResult.content = generateJSONExport(processedStructure, mergedConfig);
                exportResult.metadata.mimeType = 'application/json';
                exportResult.metadata.fileExtension = '.json';
                break;

            case 'text':
            case 'txt':
                exportResult.content = generateTextExport(processedStructure, mergedConfig);
                exportResult.metadata.mimeType = 'text/plain';
                exportResult.metadata.fileExtension = '.txt';
                break;

            case 'csv':
                exportResult.content = generateCSVExport(processedStructure, mergedConfig);
                exportResult.metadata.mimeType = 'text/csv';
                exportResult.metadata.fileExtension = '.csv';
                break;

            default:
                exportResult.errorMessage = 'Unsupported export format: ' + targetFormat;
                exporterError(exportResult.errorMessage, 'export');
                return exportResult;
        }

        // Validate content size
        if (exportResult.content.length > mergedConfig.maxFileSize) {
            exportResult.errorMessage = 'Export content exceeds maximum file size limit';
            exporterError(exportResult.errorMessage, 'export');
            return exportResult;
        }

        // Add export statistics
        exportResult.metadata.contentLength = exportResult.content.length;
        exportResult.metadata.exportDuration = new Date().getTime() - startTime;
        exportResult.metadata.nodeCount = processedStructure.structure ?
            (processedStructure.structure.document ? 1 : processedStructure.structure.length) : 0;

        exportResult.success = true;
        exporterInfo('Export completed successfully in ' + exportResult.metadata.exportDuration + 'ms', 'performance');
        return exportResult;

    } catch (exc) {
        exportResult.errorMessage = 'Export failed: ' + exc.message;
        exporterError(exportResult.errorMessage, 'export');
        return exportResult;
    }
}

/**
 * Preprocess DOM structure for export
 * @param {Object} domStructure - Original DOM structure
 * @param {Object} exportConfig - Export configuration
 * @returns {Object} Processed structure
 */
function preprocessDOMForExport(domStructure, exportConfig) {
    try {
        exporterDebug('Starting DOM structure preprocessing', 'preprocessing');
        var processedStructure = objectClone(domStructure, 4);

        // Add export metadata if not present
        if (!processedStructure.metadata) {
            processedStructure.metadata = {};
        }

        processedStructure.metadata.exportPreprocessed = true;
        processedStructure.metadata.exportTimestamp = getCurrentTimestamp();
        processedStructure.metadata.exportVersion = '3.1';

        // Add comparison fingerprint if enabled
        if (exportConfig.includeComparisonData) {
            exporterDebug('Generating comparison fingerprint', 'preprocessing');
            processedStructure.metadata.comparisonFingerprint = generateComparisonFingerprint(processedStructure);
        }

        // Filter content based on configuration
        if (!exportConfig.includeExtractedValues) {
            exporterDebug('Removing extracted values to reduce size', 'preprocessing');
            // Remove extracted values to reduce size
            if (processedStructure.structure && processedStructure.structure.document) {
                removeExtractedValuesFromNode(processedStructure.structure.document);
            } else if (processedStructure.structure && processedStructure.structure.length) {
                for (var i = 0; i < processedStructure.structure.length; i++) {
                    removeExtractedValuesFromNode(processedStructure.structure[i]);
                }
            }
        }

        if (!exportConfig.includeObjectReferences) {
            exporterDebug('Removing object reference data', 'preprocessing');
            // Remove object reference data
            if (processedStructure.objectRegistry) {
                delete processedStructure.objectRegistry;
            }
            if (processedStructure.structure && processedStructure.structure.document) {
                removeObjectIdsFromNode(processedStructure.structure.document);
            } else if (processedStructure.structure && processedStructure.structure.length) {
                for (var j = 0; j < processedStructure.structure.length; j++) {
                    removeObjectIdsFromNode(processedStructure.structure[j]);
                }
            }
        }

        exporterDebug('DOM structure preprocessing completed', 'preprocessing');
        return processedStructure;

    } catch (exc) {
        exporterWarn('Preprocessing failed, returning original structure: ' + exc.message, 'preprocessing');
        return domStructure; // Return original on error
    }
}

/**
 * Remove extracted values from a node recursively
 * @param {Object} nodeObj - DOM node
 */
function removeExtractedValuesFromNode(nodeObj) {
    try {
        if (!nodeObj) return;

        if (nodeObj.sampledValue !== undefined) {
            delete nodeObj.sampledValue;
        }
        if (nodeObj.valueMetadata) {
            delete nodeObj.valueMetadata;
        }

        // Process properties
        if (nodeObj.properties) {
            for (var p = 0; p < nodeObj.properties.length; p++) {
                removeExtractedValuesFromNode(nodeObj.properties[p]);
            }
        }

        // Process collections
        if (nodeObj.collections) {
            for (var c = 0; c < nodeObj.collections.length; c++) {
                removeExtractedValuesFromNode(nodeObj.collections[c]);
            }
        }

        // Process child nodes
        if (nodeObj.childNodes) {
            for (var ch = 0; ch < nodeObj.childNodes.length; ch++) {
                removeExtractedValuesFromNode(nodeObj.childNodes[ch]);
            }
        }
    } catch (exc) {
        // Continue processing
    }
}

/**
 * Remove object IDs from a node recursively
 * @param {Object} nodeObj - DOM node
 */
function removeObjectIdsFromNode(nodeObj) {
    try {
        if (!nodeObj) return;

        if (nodeObj.objectId) {
            delete nodeObj.objectId;
        }

        // Process properties
        if (nodeObj.properties) {
            for (var p = 0; p < nodeObj.properties.length; p++) {
                removeObjectIdsFromNode(nodeObj.properties[p]);
            }
        }

        // Process collections
        if (nodeObj.collections) {
            for (var c = 0; c < nodeObj.collections.length; c++) {
                removeObjectIdsFromNode(nodeObj.collections[c]);
            }
        }

        // Process child nodes
        if (nodeObj.childNodes) {
            for (var ch = 0; ch < nodeObj.childNodes.length; ch++) {
                removeObjectIdsFromNode(nodeObj.childNodes[ch]);
            }
        }
    } catch (exc) {
        // Continue processing
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
            nodeCount: 0,
            timestamp: domStructure.metadata ? domStructure.metadata.timestamp : '',
            documentName: domStructure.metadata ? domStructure.metadata.documentName : '',
            version: '3.1'
        };

        // Calculate node count based on structure format
        if (domStructure.structure) {
            if (domStructure.structure.document) {
                fingerprintData.nodeCount = 1; // Document node
            } else if (domStructure.structure.length) {
                fingerprintData.nodeCount = domStructure.structure.length;
            }
        }

        // Create simple hash
        var dataString = safeJSONStringify(fingerprintData);
        var hashValue = 0;

        for (var i = 0; i < dataString.length; i++) {
            var charCode = dataString.charCodeAt ? dataString.charCodeAt(i) : 0;
            hashValue = ((hashValue << 5) - hashValue) + charCode;
            hashValue = hashValue & hashValue; // Convert to 32-bit integer
        }

        return 'fp_' + Math.abs(hashValue).toString(16);

    } catch (exc) {
        exporterWarn('Fingerprint generation failed: ' + exc.message, 'preprocessing');
        return 'fp_error';
    }
}

// =============================================================================
// JSON EXPORT
// =============================================================================

/**
 * Generate JSON export with enhanced formatting
 * @param {Object} domStructure - DOM structure to export
 * @param {Object} exportConfig - Export configuration
 * @returns {String} JSON export content
 */
function generateJSONExport(domStructure, exportConfig) {
    try {
        exporterDebug('Starting JSON export generation', 'json');

        var exportObject = {
            metadata: domStructure.metadata || {},
            structure: domStructure.structure || {},
            statistics: domStructure.statistics || {},
            exportInfo: {
                version: '3.1',
                timestamp: getCurrentTimestamp(),
                configurationUsed: exportConfig
            }
        };

        // Add optional sections
        if (exportConfig.includeObjectReferences && domStructure.objectRegistry) {
            exportObject.objectRegistry = domStructure.objectRegistry;
            exporterDebug('Including object registry in JSON export', 'json');
        }

        if (exportConfig.includeAccessPaths && domStructure.accessPaths) {
            exportObject.accessPaths = domStructure.accessPaths;
            exporterDebug('Including access paths in JSON export', 'json');
        }

        if (exportConfig.includeComparisonData && domStructure.comparisonData) {
            exportObject.comparisonData = domStructure.comparisonData;
            exporterDebug('Including comparison data in JSON export', 'json');
        }

        // Use safe JSON stringify with proper indentation
        var indentLevel = exportConfig.formatOutput ? 2 : 0;
        var jsonResult = safeJSONStringify(exportObject, null, indentLevel);

        exporterInfo('JSON export generated successfully', 'json');
        return jsonResult;

    } catch (exc) {
        exporterError('JSON export failed: ' + exc.message, 'json');
        return '{"error": "JSON export failed: ' + exc.message + '"}';
    }
}

// =============================================================================
// TEXT EXPORT
// =============================================================================

/**
 * Generate formatted text export
 * @param {Object} domStructure - DOM structure to export
 * @param {Object} exportConfig - Export configuration
 * @returns {String} Text export content
 */
function generateTextExport(domStructure, exportConfig) {
    try {
        exporterDebug('Starting text export generation', 'text');
        var textBuilder = createStringBuilder();

        // Header
        textBuilder.appendLine('InDesign DOM Discovery Builder v3.1');
        textBuilder.appendLine('DOM Structure Export');
        textBuilder.appendLine('==========================================');
        textBuilder.appendLine('Generated: ' + getCurrentTimestamp());
        textBuilder.appendLine('');

        // Metadata section
        if (exportConfig.includeMetadata) {
            exporterDebug('Adding metadata section to text export', 'text');
            textBuilder.append(generateMetadataSection(domStructure, exportConfig));
            textBuilder.appendLine('');
        }

        // Statistics section
        if (exportConfig.includeStatistics && domStructure.statistics) {
            exporterDebug('Adding statistics section to text export', 'text');
            textBuilder.append(generateStatisticsSection(domStructure.statistics));
            textBuilder.appendLine('');
        }

        // Object references section
        if (exportConfig.includeObjectReferences && domStructure.objectRegistry) {
            exporterDebug('Adding object references section to text export', 'text');
            textBuilder.append(generateObjectReferenceSection(domStructure.objectRegistry));
            textBuilder.appendLine('');
        }

        // Main structure section
        textBuilder.append(generateStructureSection(domStructure, exportConfig));

        // Access guide section
        if (exportConfig.includeAccessGuide) {
            exporterDebug('Adding access guide section to text export', 'text');
            textBuilder.appendLine('');
            textBuilder.append(generateAccessGuideSection(domStructure));
        }

        exporterInfo('Text export generated successfully', 'text');
        return textBuilder.toString();

    } catch (exc) {
        exporterError('Text export failed: ' + exc.message, 'text');
        return 'Text export failed: ' + exc.message;
    }
}

// =============================================================================
// CSV EXPORT - FIXED VERSION
// =============================================================================

/**
 * Generate CSV export - FIXED to handle structure.document format
 * @param {Object} domStructure - DOM structure to export
 * @param {Object} exportConfig - Export configuration
 * @returns {String} CSV export content
 */
function generateCSVExport(domStructure, exportConfig) {
    try {
        exporterDebug('Starting CSV export generation', 'csv');

        var csvBuilder = createStringBuilder();

        // CSV header
        var csvHeaders = [
            'Path', 'Name', 'Type', 'Depth', 'Safety Level', 'Is Collection',
            'Is Method', 'Object ID', 'Alternative Paths', 'Property Count', 'Version'
        ];

        if (exportConfig.includeExtractedValues) {
            csvHeaders.push('Sampled Value');
            csvHeaders.push('Value Type');
        }

        csvBuilder.appendLine(generateCSVRow(csvHeaders));
        exporterDebug('CSV headers generated', 'csv');

        // **FIX: Handle actual structure format (object with "document" property)**
        if (domStructure.structure && domStructure.structure.document) {
            exporterDebug('Processing document node for CSV export', 'csv');
            generateCSVRowsForNode(domStructure.structure.document, csvBuilder, exportConfig);
        } else if (domStructure.structure && domStructure.structure.length > 0) {
            exporterDebug('Processing structure array for CSV export (' + domStructure.structure.length + ' nodes)', 'csv');
            for (var i = 0; i < domStructure.structure.length; i++) {
                var nodeItem = domStructure.structure[i];
                generateCSVRowsForNode(nodeItem, csvBuilder, exportConfig);
            }
        } else {
            exporterWarn('No document structure found for CSV export', 'csv');
            // Add a single row indicating no data
            var noDataRow = ['No Data', 'No document structure available', 'error', '0', 'unknown', 'false', 'false', '', '', '0', '3.1'];
            if (exportConfig.includeExtractedValues) {
                noDataRow.push('');
                noDataRow.push('');
            }
            csvBuilder.appendLine(generateCSVRow(noDataRow));
        }

        exporterInfo('CSV export generated successfully', 'csv');
        return csvBuilder.toString();

    } catch (exc) {
        exporterError('CSV export failed: ' + exc.message, 'csv');
        return 'CSV export failed: ' + exc.message;
    }
}

/**
 * Generate CSV rows for a single node
 * @param {Object} domNode - DOM node
 * @param {Object} csvBuilder - String builder
 * @param {Object} exportConfig - Configuration
 */
function generateCSVRowsForNode(domNode, csvBuilder, exportConfig) {
    try {
        if (!domNode) return;

        // Main node row
        var alternativePaths = domNode.alternativeAccessPaths ?
            arrayJoin(domNode.alternativeAccessPaths, ';') : '';
        var propertyCount = (domNode.properties ? domNode.properties.length : 0) +
            (domNode.collections ? domNode.collections.length : 0) +
            (domNode.methods ? domNode.methods.length : 0);

        var mainRowData = [
            domNode.path || '',
            domNode.name || '',
            domNode.type || '',
            domNode.depth || 0,
            domNode.safetyLevel || 'unknown',
            domNode.isCollection ? 'true' : 'false',
            domNode.isMethod ? 'true' : 'false',
            domNode.objectId || '',
            alternativePaths,
            propertyCount,
            '3.1'
        ];

        if (exportConfig.includeExtractedValues) {
            mainRowData.push(formatValueForCSV(domNode.sampledValue));
            mainRowData.push(safeTypeCheck(domNode.sampledValue));
        }

        csvBuilder.appendLine(generateCSVRow(mainRowData));

        // Add rows for properties
        if (domNode.properties) {
            for (var p = 0; p < domNode.properties.length; p++) {
                var propertyItem = domNode.properties[p];
                var propRowData = [
                    propertyItem.path || '',
                    propertyItem.name || '',
                    propertyItem.type || '',
                    (domNode.depth || 0) + 1,
                    propertyItem.safetyLevel || 'unknown',
                    'false',
                    'false',
                    '',
                    '',
                    0,
                    '3.1'
                ];

                if (exportConfig.includeExtractedValues) {
                    propRowData.push(formatValueForCSV(propertyItem.sampledValue));
                    propRowData.push(safeTypeCheck(propertyItem.sampledValue));
                }

                csvBuilder.appendLine(generateCSVRow(propRowData));
            }
        }

        // Add rows for collections
        if (domNode.collections) {
            for (var c = 0; c < domNode.collections.length; c++) {
                var collectionItem = domNode.collections[c];
                var collRowData = [
                    collectionItem.path || '',
                    collectionItem.name || '',
                    collectionItem.type || 'collection',
                    (domNode.depth || 0) + 1,
                    collectionItem.safetyLevel || 'unknown',
                    'true',
                    'false',
                    '',
                    '',
                    collectionItem.itemCount || 0,
                    '3.1'
                ];

                if (exportConfig.includeExtractedValues) {
                    collRowData.push(formatValueForCSV(collectionItem.sampledValue));
                    collRowData.push('collection');
                }

                csvBuilder.appendLine(generateCSVRow(collRowData));
            }
        }

        // Add rows for methods
        if (domNode.methods) {
            for (var m = 0; m < domNode.methods.length; m++) {
                var methodItem = domNode.methods[m];
                var methodRowData = [
                    methodItem.path || '',
                    methodItem.name || '',
                    methodItem.type || 'method',
                    (domNode.depth || 0) + 1,
                    methodItem.safetyLevel || 'dangerous',
                    'false',
                    'true',
                    '',
                    '',
                    0,
                    '3.1'
                ];

                if (exportConfig.includeExtractedValues) {
                    methodRowData.push('[Method]');
                    methodRowData.push('function');
                }

                csvBuilder.appendLine(generateCSVRow(methodRowData));
            }
        }

        // Process child nodes recursively
        if (domNode.childNodes) {
            for (var ch = 0; ch < domNode.childNodes.length; ch++) {
                generateCSVRowsForNode(domNode.childNodes[ch], csvBuilder, exportConfig);
            }
        }

    } catch (exc) {
        exporterWarn('Error processing node for CSV: ' + exc.message, 'csv');
        // Continue processing other nodes
    }
}

/**
 * Generate a single CSV row with proper escaping
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
        exporterWarn('Error generating CSV row: ' + exc.message, 'csv');
        return '';
    }
}

/**
 * Escape value for CSV with proper escaping
 * @param {String} targetValue - Value to escape
 * @returns {String} Escaped value
 */
function csvEscape(targetValue) {
    try {
        if (typeof targetValue !== 'string') {
            targetValue = safeToString(targetValue);
        }

        // If contains comma, quote, or newline, wrap in quotes and escape quotes
        if (stringIndexOf(targetValue, ',') !== -1 ||
            stringIndexOf(targetValue, '"') !== -1 ||
            stringIndexOf(targetValue, '\n') !== -1 ||
            stringIndexOf(targetValue, '\r') !== -1) {

            // Escape quotes by doubling them
            targetValue = stringReplace(targetValue, '"', '""');
            return '"' + targetValue + '"';
        }

        return targetValue;

    } catch (exc) {
        return '""';
    }
}

/**
 * Format value for CSV with safe value conversion
 * @param {*} targetValue - Value to format
 * @returns {String} Formatted value
 */
function formatValueForCSV(targetValue) {
    try {
        if (targetValue === null) return '[null]';
        if (targetValue === undefined) return '[undefined]';

        var valueString = safeToString(targetValue);

        // Limit length for CSV
        if (valueString.length > 200) {
            valueString = stringSubstring(valueString, 0, 200) + '...';
        }

        // Remove problematic characters
        valueString = stringReplace(valueString, '\n', ' ');
        valueString = stringReplace(valueString, '\r', ' ');
        valueString = stringReplace(valueString, '\t', ' ');

        return valueString;

    } catch (exc) {
        return '[Error]';
    }
}

// =============================================================================
// SECTION GENERATORS
// =============================================================================

/**
 * Generate metadata section for text export
 * @param {Object} domStructure - DOM structure
 * @param {Object} exportConfig - Configuration
 * @returns {String} Metadata section
 */
function generateMetadataSection(domStructure, exportConfig) {
    try {
        var metaBuilder = createStringBuilder();

        metaBuilder.appendLine('DOCUMENT METADATA');
        metaBuilder.appendLine('=================');

        if (domStructure.metadata) {
            var metadataObj = domStructure.metadata;

            metaBuilder.appendLine('Document Name: ' + (metadataObj.documentName || 'Unknown'));
            metaBuilder.appendLine('Analysis Version: ' + (metadataObj.version || 'Unknown'));
            metaBuilder.appendLine('Timestamp: ' + (metadataObj.timestamp || 'Unknown'));

            if (metadataObj.environment) {
                metaBuilder.appendLine('InDesign Version: ' + (metadataObj.environment.indesignVersion || 'Unknown'));
                metaBuilder.appendLine('Native JSON Support: ' + (metadataObj.environment.hasNativeJSON ? 'Yes' : 'No'));
            }

            if (metadataObj.enhancedFeatures) {
                metaBuilder.appendLine('');
                metaBuilder.appendLine('Enhanced Features:');
                metaBuilder.appendLine('  Object Tracking: ' + (metadataObj.enhancedFeatures.objectTracking ? 'Enabled' : 'Disabled'));
                metaBuilder.appendLine('  Duplicate Detection: ' + (metadataObj.enhancedFeatures.duplicateDetection ? 'Enabled' : 'Disabled'));
                metaBuilder.appendLine('  ES3 Compliant: ' + (metadataObj.enhancedFeatures.es3Compliant ? 'Yes' : 'No'));
            }
        }

        return metaBuilder.toString();

    } catch (exc) {
        return 'Error generating metadata section: ' + exc.message;
    }
}

/**
 * Generate statistics section
 * @param {Object} statisticsObj - Statistics object
 * @returns {String} Statistics section
 */
function generateStatisticsSection(statisticsObj) {
    try {
        var statsBuilder = createStringBuilder();

        statsBuilder.appendLine('DISCOVERY STATISTICS');
        statsBuilder.appendLine('===================');

        statsBuilder.appendLine('Total Nodes: ' + (statisticsObj.totalNodes || statisticsObj.nodeCount || 0));
        statsBuilder.appendLine('Properties: ' + (statisticsObj.totalProperties || statisticsObj.propertyCount || 0));
        statsBuilder.appendLine('Collections: ' + (statisticsObj.totalCollections || statisticsObj.collectionCount || 0));
        statsBuilder.appendLine('Methods: ' + (statisticsObj.totalMethods || statisticsObj.methodCount || 0));
        statsBuilder.appendLine('Maximum Depth: ' + (statisticsObj.maxDepth || 0));
        statsBuilder.appendLine('Analysis Time: ' + (statisticsObj.totalTime || statisticsObj.enumerationTime || 'Unknown') + 'ms');

        if (statisticsObj.enumerationTime) {
            statsBuilder.appendLine('Enumeration Time: ' + statisticsObj.enumerationTime + 'ms');
        }

        if (statisticsObj.samplingTime) {
            statsBuilder.appendLine('Sampling Time: ' + statisticsObj.samplingTime + 'ms');
        }

        if (statisticsObj.errorCount) {
            statsBuilder.appendLine('Errors Encountered: ' + statisticsObj.errorCount);
        }

        return statsBuilder.toString();

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
        var refBuilder = createStringBuilder();

        refBuilder.appendLine('OBJECT REFERENCES');
        refBuilder.appendLine('=================');

        if (objectRegistry.references) {
            var referenceCount = countObjectKeys(objectRegistry.references);
            refBuilder.appendLine('Total Object References: ' + referenceCount);
            refBuilder.appendLine('');

            var displayCount = 0;
            var maxDisplay = 20;

            for (var refId in objectRegistry.references) {
                if (objectHasOwnProperty(objectRegistry.references, refId) && displayCount < maxDisplay) {
                    var referenceObj = objectRegistry.references[refId];
                    refBuilder.appendLine('ID: ' + refId);
                    refBuilder.appendLine('  First Path: ' + (referenceObj.firstPath || 'Unknown'));
                    refBuilder.appendLine('  Reference Count: ' + (referenceObj.count || 1));
                    if (referenceObj.paths && referenceObj.paths.length > 1) {
                        refBuilder.appendLine('  Alternative Paths: ' + (referenceObj.paths.length - 1));
                    }
                    refBuilder.appendLine('');
                    displayCount++;
                }
            }

            if (referenceCount > maxDisplay) {
                refBuilder.appendLine('... (' + (referenceCount - maxDisplay) + ' more references)');
            }
        } else {
            refBuilder.appendLine('No object reference data available.');
        }

        return refBuilder.toString();

    } catch (exc) {
        return 'Error generating object reference section: ' + exc.message;
    }
}

/**
 * Generate main structure section - FIXED to handle structure.document format
 * @param {Object} domStructure - DOM structure
 * @param {Object} exportConfig - Configuration
 * @returns {String} Structure section
 */
function generateStructureSection(domStructure, exportConfig) {
    try {
        var structBuilder = createStringBuilder();

        structBuilder.appendLine('DOM STRUCTURE');
        structBuilder.appendLine('=============');

        // **FIX: Handle actual structure format**
        if (domStructure.structure && domStructure.structure.document) {
            structBuilder.appendLine('Document structure found - displaying tree format:');
            structBuilder.appendLine('');

            var documentNode = domStructure.structure.document;
            structBuilder.append(generateNodeStructureText(documentNode, 0, exportConfig));

        } else if (domStructure.structure && domStructure.structure.length > 0) {
            structBuilder.appendLine('Structure array found (' + domStructure.structure.length + ' nodes):');
            structBuilder.appendLine('');

            var displayCount = Math.min(domStructure.structure.length, 50);

            for (var i = 0; i < displayCount; i++) {
                var nodeItem = domStructure.structure[i];
                var indentStr = '';
                for (var d = 0; d < (nodeItem.depth || 0); d++) {
                    indentStr += '  ';
                }

                structBuilder.appendLine(indentStr + '• ' + (nodeItem.name || nodeItem.path || 'Unknown') +
                    ' [' + (nodeItem.type || 'unknown') + ']');

                // Add properties if available
                if (nodeItem.properties && nodeItem.properties.length > 0) {
                    var propCount = Math.min(3, nodeItem.properties.length);
                    for (var p = 0; p < propCount; p++) {
                        var propertyItem = nodeItem.properties[p];
                        structBuilder.appendLine(indentStr + '  • ' + propertyItem.name + ' [' + (propertyItem.type || 'unknown') + ']');
                    }
                    if (nodeItem.properties.length > propCount) {
                        structBuilder.appendLine(indentStr + '  • ... (' + (nodeItem.properties.length - propCount) + ' more properties)');
                    }
                }

                // Add collections if available
                if (nodeItem.collections && nodeItem.collections.length > 0) {
                    var collCount = Math.min(3, nodeItem.collections.length);
                    for (var c = 0; c < collCount; c++) {
                        var collectionItem = nodeItem.collections[c];
                        structBuilder.appendLine(indentStr + '  ► ' + collectionItem.name + ' [collection]');
                    }
                    if (nodeItem.collections.length > collCount) {
                        structBuilder.appendLine(indentStr + '  ► ... (' + (nodeItem.collections.length - collCount) + ' more collections)');
                    }
                }
            }

            if (domStructure.structure.length > displayCount) {
                structBuilder.appendLine('');
                structBuilder.appendLine('... (' + (domStructure.structure.length - displayCount) + ' more nodes)');
            }

        } else {
            structBuilder.appendLine('No structure data available.');
        }

        return structBuilder.toString();

    } catch (exc) {
        return 'Error generating structure section: ' + exc.message;
    }
}

/**
 * Generate structure text for a single node
 * @param {Object} nodeItem - DOM node
 * @param {Number} indentLevel - Indentation level
 * @param {Object} exportConfig - Export configuration
 * @returns {String} Node structure text
 */
function generateNodeStructureText(nodeItem, indentLevel, exportConfig) {
    try {
        if (!nodeItem) return '';

        var nodeBuilder = createStringBuilder();
        var indentStr = '';

        // Create indentation
        for (var i = 0; i < indentLevel; i++) {
            indentStr += '  ';
        }

        // Node header
        var nodeHeader = indentStr + '+ ' + (nodeItem.name || nodeItem.path || 'Unknown') +
            ' (' + (nodeItem.type || 'object') + ')';

        nodeBuilder.appendLine(nodeHeader);

        // Properties
        if (nodeItem.properties && nodeItem.properties.length > 0) {
            var propLimit = Math.min(10, nodeItem.properties.length);
            nodeBuilder.appendLine(indentStr + '  |-- Properties (' + nodeItem.properties.length + '):');

            for (var p = 0; p < propLimit; p++) {
                var propertyItem = nodeItem.properties[p];
                var propText = indentStr + '      - ' + propertyItem.name + ' (' + (propertyItem.type || 'unknown') + ')';

                if (exportConfig.includeExtractedValues && propertyItem.sampledValue &&
                    propertyItem.sampledValue !== '[Skipped]' && propertyItem.sampledValue !== '[Error]') {
                    var sampleVal = propertyItem.sampledValue;
                    if (typeof sampleVal === 'string' && sampleVal.length > 30) {
                        sampleVal = stringSubstring(sampleVal, 0, 27) + '...';
                    }
                    propText += ' = ' + sampleVal;
                }

                nodeBuilder.appendLine(propText);
            }

            if (nodeItem.properties.length > propLimit) {
                nodeBuilder.appendLine(indentStr + '      ... and ' + (nodeItem.properties.length - propLimit) + ' more properties');
            }
        }

        // Collections
        if (nodeItem.collections && nodeItem.collections.length > 0) {
            var collLimit = Math.min(5, nodeItem.collections.length);
            nodeBuilder.appendLine(indentStr + '  |-- Collections (' + nodeItem.collections.length + '):');

            for (var c = 0; c < collLimit; c++) {
                var collectionItem = nodeItem.collections[c];
                var collText = indentStr + '      - ' + collectionItem.name + ' (' + (collectionItem.type || 'collection') + ')';

                if (collectionItem.itemCount !== undefined) {
                    collText += ' [' + collectionItem.itemCount + ' items]';
                }

                nodeBuilder.appendLine(collText);
            }

            if (nodeItem.collections.length > collLimit) {
                nodeBuilder.appendLine(indentStr + '      ... and ' + (nodeItem.collections.length - collLimit) + ' more collections');
            }
        }

        // Methods
        if (nodeItem.methods && nodeItem.methods.length > 0) {
            var methodLimit = Math.min(5, nodeItem.methods.length);
            nodeBuilder.appendLine(indentStr + '  |-- Methods (' + nodeItem.methods.length + '):');

            for (var m = 0; m < methodLimit; m++) {
                var methodItem = nodeItem.methods[m];
                nodeBuilder.appendLine(indentStr + '      - ' + methodItem.name + '()');
            }

            if (nodeItem.methods.length > methodLimit) {
                nodeBuilder.appendLine(indentStr + '      ... and ' + (nodeItem.methods.length - methodLimit) + ' more methods');
            }
        }

        // Child nodes (limit depth)
        if (nodeItem.childNodes && nodeItem.childNodes.length > 0 && indentLevel < 2) {
            var childLimit = Math.min(3, nodeItem.childNodes.length);
            nodeBuilder.appendLine(indentStr + '  |-- Child Objects (' + nodeItem.childNodes.length + '):');

            for (var ch = 0; ch < childLimit; ch++) {
                var childText = generateNodeStructureText(nodeItem.childNodes[ch], indentLevel + 3, exportConfig);
                nodeBuilder.append(childText);
            }

            if (nodeItem.childNodes.length > childLimit) {
                nodeBuilder.appendLine(indentStr + '      ... and ' + (nodeItem.childNodes.length - childLimit) + ' more child objects');
            }
        } else if (nodeItem.childNodes && nodeItem.childNodes.length > 0) {
            nodeBuilder.appendLine(indentStr + '  |-- Child Objects: ' + nodeItem.childNodes.length + ' (max depth reached)');
        }

        return nodeBuilder.toString();

    } catch (exc) {
        return indentStr + 'Error displaying node: ' + exc.message + '\n';
    }
}

/**
 * Generate access guide section
 * @param {Object} domStructure - DOM structure
 * @returns {String} Access guide section
 */
function generateAccessGuideSection(domStructure) {
    try {
        var guideBuilder = createStringBuilder();

        guideBuilder.appendLine('ACCESS GUIDE');
        guideBuilder.appendLine('============');
        guideBuilder.appendLine('This section provides guidance on accessing discovered objects:');
        guideBuilder.appendLine('');

        // Find some example paths for guidance
        var examplePaths = [];

        if (domStructure.structure && domStructure.structure.document) {
            collectExamplePaths(domStructure.structure.document, examplePaths, 10);
        } else if (domStructure.structure && domStructure.structure.length > 0) {
            for (var i = 0; i < domStructure.structure.length && examplePaths.length < 10; i++) {
                var nodeItem = domStructure.structure[i];
                if (nodeItem.path && nodeItem.type !== 'method' && nodeItem.safetyLevel === 'safe') {
                    examplePaths.push({
                        path: nodeItem.path,
                        type: nodeItem.type || 'unknown',
                        name: nodeItem.name || 'unnamed'
                    });
                }
            }
        }

        if (examplePaths.length > 0) {
            guideBuilder.appendLine('Example Access Patterns:');
            for (var j = 0; j < examplePaths.length; j++) {
                var pathExample = examplePaths[j];
                guideBuilder.appendLine('  ' + pathExample.path + '  // ' + pathExample.type + ' - ' + pathExample.name);
            }
        } else {
            guideBuilder.appendLine('No safe access examples found.');
        }

        guideBuilder.appendLine('');
        guideBuilder.appendLine('Safety Notes:');
        guideBuilder.appendLine('• Only access properties marked as "safe"');
        guideBuilder.appendLine('• Avoid properties marked as "dangerous" or "reserved"');
        guideBuilder.appendLine('• Use try/catch blocks when accessing unknown properties');
        guideBuilder.appendLine('• Check for null/undefined values before accessing sub-properties');

        return guideBuilder.toString();

    } catch (exc) {
        return 'Error generating access guide: ' + exc.message;
    }
}

/**
 * Collect example paths from a node recursively
 * @param {Object} nodeItem - DOM node
 * @param {Array} pathArray - Array to collect paths
 * @param {Number} maxPaths - Maximum paths to collect
 */
function collectExamplePaths(nodeItem, pathArray, maxPaths) {
    try {
        if (!nodeItem || pathArray.length >= maxPaths) return;

        // Add current node if it's safe
        if (nodeItem.path && nodeItem.type !== 'method' && nodeItem.safetyLevel === 'safe') {
            pathArray.push({
                path: nodeItem.path,
                type: nodeItem.type || 'unknown',
                name: nodeItem.name || 'unnamed'
            });
        }

        // Check properties
        if (nodeItem.properties && pathArray.length < maxPaths) {
            for (var p = 0; p < nodeItem.properties.length && pathArray.length < maxPaths; p++) {
                var propertyItem = nodeItem.properties[p];
                if (propertyItem.path && propertyItem.safetyLevel === 'safe') {
                    pathArray.push({
                        path: propertyItem.path,
                        type: propertyItem.type || 'property',
                        name: propertyItem.name || 'unnamed'
                    });
                }
            }
        }

        // Check child nodes (limited depth)
        if (nodeItem.childNodes && pathArray.length < maxPaths && nodeItem.depth < 2) {
            for (var ch = 0; ch < nodeItem.childNodes.length && pathArray.length < maxPaths; ch++) {
                collectExamplePaths(nodeItem.childNodes[ch], pathArray, maxPaths);
            }
        }

    } catch (exc) {
        // Continue processing
    }
}

// =============================================================================
// FILE OPERATIONS
// =============================================================================

/**
 * Write content to file
 * @param {String} content - Content to write
 * @param {String} filePath - File path
 * @returns {Object} Write result
 */
function writeToFile(content, filePath) {
    var writeResult = {
        success: false,
        filePath: filePath,
        errorMessage: null
    };

    try {
        exporterInfo('Writing content to file: ' + filePath, 'file');

        if (!content || typeof content !== 'string') {
            writeResult.errorMessage = 'No content provided for writing';
            exporterError(writeResult.errorMessage, 'file');
            return writeResult;
        }

        if (!filePath || typeof filePath !== 'string') {
            writeResult.errorMessage = 'No valid file path provided';
            exporterError(writeResult.errorMessage, 'file');
            return writeResult;
        }

        var targetFile = new File(filePath);
        if (targetFile.open('w')) {
            targetFile.write(content);
            targetFile.close();

            writeResult.success = true;
            exporterInfo('File written successfully: ' + content.length + ' characters', 'file');
        } else {
            writeResult.errorMessage = 'Failed to open file for writing: ' + filePath;
            exporterError(writeResult.errorMessage, 'file');
        }

        return writeResult;

    } catch (exc) {
        writeResult.errorMessage = 'File write error: ' + exc.message;
        exporterError(writeResult.errorMessage, 'file');
        return writeResult;
    }
}

/**
 * Generate default file path for export
 * @param {String} exportFormat - Export format
 * @returns {String} Default file path
 */
function generateDefaultFilePath(exportFormat) {
    try {
        var defaultName = 'dom_export_' + getCurrentTimestamp();
        defaultName = stringReplace(defaultName, ':', '-');
        defaultName = stringReplace(defaultName, ' ', '_');

        return defaultName + (getFileExtension(exportFormat) || '.txt');

    } catch (exc) {
        return 'dom_export' + (getFileExtension(exportFormat) || '.txt');
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
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Merge export configuration with defaults
 * @param {Object} defaultConfig - Default configuration
 * @param {Object} userOptions - User options
 * @returns {Object} Merged configuration
 */
function mergeExportConfig(defaultConfig, userOptions) {
    try {
        var mergedConfig = objectClone(defaultConfig, 2);

        if (userOptions && typeof userOptions === 'object') {
            // Use objectHasOwnProperty for ES3 compatibility
            if (objectHasOwnProperty(userOptions, 'includeExtractedValues')) mergedConfig.includeExtractedValues = userOptions.includeExtractedValues;
            if (objectHasOwnProperty(userOptions, 'formatOutput')) mergedConfig.formatOutput = userOptions.formatOutput;
            if (objectHasOwnProperty(userOptions, 'includeMetadata')) mergedConfig.includeMetadata = userOptions.includeMetadata;
            if (objectHasOwnProperty(userOptions, 'includeObjectReferences')) mergedConfig.includeObjectReferences = userOptions.includeObjectReferences;
            if (objectHasOwnProperty(userOptions, 'enableTimestamps')) mergedConfig.enableTimestamps = userOptions.enableTimestamps;
            if (objectHasOwnProperty(userOptions, 'maxFileSize')) mergedConfig.maxFileSize = userOptions.maxFileSize;
            if (objectHasOwnProperty(userOptions, 'includeStatistics')) mergedConfig.includeStatistics = userOptions.includeStatistics;
            if (objectHasOwnProperty(userOptions, 'includeAccessGuide')) mergedConfig.includeAccessGuide = userOptions.includeAccessGuide;
            if (objectHasOwnProperty(userOptions, 'includeAccessPaths')) mergedConfig.includeAccessPaths = userOptions.includeAccessPaths;
            if (objectHasOwnProperty(userOptions, 'includeComparisonData')) mergedConfig.includeComparisonData = userOptions.includeComparisonData;
        }

        return mergedConfig;

    } catch (exc) {
        exporterWarn('Config merge failed, using defaults: ' + exc.message, 'export');
        return defaultConfig;
    }
}

/**
 * Format value for display with safe value formatting
 * @param {*} targetValue - Value to format
 * @returns {String} Formatted value
 */
function formatValueForDisplay(targetValue) {
    try {
        if (targetValue === null) return '[null]';
        if (targetValue === undefined) return '[undefined]';

        var valueString = safeToString(targetValue);
        var maxLength = 50;

        if (valueString.length > maxLength) {
            valueString = stringSubstring(valueString, 0, maxLength) + '...';
        }

        // Escape special characters in strings
        if (typeof targetValue === 'string') {
            valueString = '"' + stringReplace(stringReplace(valueString, '\\', '\\\\'), '"', '\\"') + '"';
        }

        return valueString;

    } catch (exc) {
        return '[Error formatting value]';
    }
}

// =============================================================================
// MODULE REGISTRATION - COMPLETE AND UPDATED
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
    'mergeExportConfig', 'formatValueForDisplay',

    // Node Processing Utilities
    'removeExtractedValuesFromNode', 'removeObjectIdsFromNode', 'generateNodeStructureText', 'collectExamplePaths',

    // Unified Logging System Functions
    'exporterLog', 'exporterInfo', 'exporterDebug', 'exporterWarn', 'exporterError'
]);

// =============================================================================
// END OF 3.2_dom-exporter.jsx - COMPLETE WITH UNIFIED LOGGING
// =============================================================================