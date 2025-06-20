// =============================================================================
// 3.2_dom-exporter.jsx - DOM STRUCTURE EXPORT ENGINE
// InDesign DOM Discovery Builder v3.1 - PRODUCTION READY  
// =============================================================================
// PURPOSE: Export DOM structures in multiple formats with comprehensive features
// DEPENDENCIES: ["1.1_bootstrap-foundation.jsx", "1.2_safety-utilities.jsx"]
// SIZE: ~1404 lines - COMPLETE IMPLEMENTATION - UNIFIED LOGGING SYSTEM
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
// EXPORT CONFIGURATION - REMOVED CUSTOM LOGGING CONFIG
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
// MAIN EXPORT FUNCTIONS - UPDATED TO USE STANDARD LOGGING
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
    var mergedConfig = exportConfig ? mergeExportConfig(DEFAULT_EXPORT_CONFIG, exportConfig) : DEFAULT_EXPORT_CONFIG;

    try {
        logInfo('Starting DOM export - format: ' + outputFormat, 'exportData');

        // Validate inputs
        if (!domStructure) {
            var error = 'No DOM structure provided for export';
            logError(error, 'exportData');
            return createErrorResult(error, 'INVALID_INPUT');
        }

        var format = stringToLowerCase(outputFormat || 'json');
        logDebug('Export format normalized to: ' + format, 'exportData');

        // Preprocess DOM structure
        var preprocessedStructure = preprocessDOMForExport(domStructure, mergedConfig);
        if (!preprocessedStructure || preprocessedStructure.error) {
            var preprocessError = 'DOM preprocessing failed: ' + (preprocessedStructure ? preprocessedStructure.error : 'unknown error');
            logError(preprocessError, 'preprocessing');
            return createErrorResult(preprocessError, 'PREPROCESSING_FAILED');
        }

        logDebug('DOM preprocessing completed successfully', 'preprocessing');

        // Generate export content based on format
        var exportResult;
        switch (format) {
            case 'json':
                exportResult = generateJSONExport(preprocessedStructure, mergedConfig);
                break;
            case 'text':
            case 'txt':
                exportResult = generateTextExport(preprocessedStructure, mergedConfig);
                break;
            case 'csv':
                exportResult = generateCSVExport(preprocessedStructure, mergedConfig);
                break;
            default:
                var formatError = 'Unsupported export format: ' + format;
                logError(formatError, 'exportData');
                return createErrorResult(formatError, 'UNSUPPORTED_FORMAT');
        }

        if (!exportResult || exportResult.error) {
            var generationError = 'Export generation failed: ' + (exportResult ? exportResult.error : 'unknown error');
            logError(generationError, 'exportData');
            return createErrorResult(generationError, 'GENERATION_FAILED');
        }

        // Write to file if content generated
        var writeResult;
        if (exportResult.content) {
            writeResult = writeToFile(exportResult.content, format, mergedConfig);
            if (writeResult.error) {
                logWarn('File write failed, returning content only: ' + writeResult.error, 'file');
            } else {
                logInfo('Export file written successfully: ' + writeResult.filePath, 'file');
            }
        }

        // Calculate performance metrics
        var endTime = new Date().getTime();
        var duration = endTime - startTime;
        logDebug('Export completed in ' + duration + 'ms', 'performance');

        // Return comprehensive result
        var result = createSuccessResult({
            content: exportResult.content,
            metadata: exportResult.metadata,
            filePath: writeResult ? writeResult.filePath : null,
            format: format,
            duration: duration,
            timestamp: getCurrentTimestamp()
        }, 'DOM export completed successfully');

        logInfo('DOM export completed - ' + format.toUpperCase() + ' format, ' + duration + 'ms', 'exportData');
        return result;

    } catch (exc) {
        var error = 'Export error: ' + exc.message;
        logError(error, 'exportData');
        return createErrorResult(error, 'EXPORT_ERROR');
    }
}

/**
 * Preprocess DOM structure for export
 * @param {Object} domStructure - Original DOM structure
 * @param {Object} config - Export configuration
 * @returns {Object} Preprocessed structure
 */
function preprocessDOMForExport(domStructure, config) {
    try {
        logDebug('Starting DOM preprocessing', 'preprocessing');

        if (!domStructure) {
            return createErrorResult('No DOM structure provided', 'INVALID_INPUT');
        }

        // Create working copy
        var preprocessedStructure = objectClone(domStructure, 5);
        
        // Remove extracted values if not requested
        if (!config.includeExtractedValues && preprocessedStructure.nodes) {
            logDebug('Removing extracted values from nodes', 'preprocessing');
            for (var i = 0; i < preprocessedStructure.nodes.length; i++) {
                removeExtractedValuesFromNode(preprocessedStructure.nodes[i]);
            }
        }

        // Remove object IDs if not including object references
        if (!config.includeObjectReferences && preprocessedStructure.nodes) {
            logDebug('Removing object references from nodes', 'preprocessing');
            for (var j = 0; j < preprocessedStructure.nodes.length; j++) {
                removeObjectIdsFromNode(preprocessedStructure.nodes[j]);
            }
        }

        // Add comparison fingerprint if requested
        if (config.includeComparisonData) {
            logDebug('Generating comparison fingerprint', 'preprocessing');
            preprocessedStructure.comparisonFingerprint = generateComparisonFingerprint(preprocessedStructure);
        }

        // Add processing timestamp
        if (config.enableTimestamps) {
            preprocessedStructure.exportMetadata = {
                preprocessedAt: getCurrentTimestamp(),
                version: '3.1',
                includeExtractedValues: config.includeExtractedValues,
                includeObjectReferences: config.includeObjectReferences
            };
        }

        logDebug('DOM preprocessing completed successfully', 'preprocessing');
        return preprocessedStructure;

    } catch (exc) {
        var error = 'Preprocessing error: ' + exc.message;
        logError(error, 'preprocessing');
        return createErrorResult(error, 'PREPROCESSING_ERROR');
    }
}

/**
 * Generate comparison fingerprint for structure
 * @param {Object} structure - DOM structure
 * @returns {String} Comparison fingerprint
 */
function generateComparisonFingerprint(structure) {
    try {
        logDebug('Generating comparison fingerprint', 'preprocessing');

        var fingerprint = '';
        
        if (structure.metadata) {
            fingerprint += 'nodes:' + (structure.metadata.totalNodes || 0);
            fingerprint += ',depth:' + (structure.metadata.maxDepth || 0);
        }

        if (structure.nodes && structure.nodes.length > 0) {
            var pathHash = 0;
            for (var i = 0; i < Math.min(100, structure.nodes.length); i++) {
                var node = structure.nodes[i];
                if (node.path) {
                    for (var j = 0; j < node.path.length; j++) {
                        pathHash += node.path.charCodeAt(j);
                    }
                }
            }
            fingerprint += ',pathHash:' + pathHash;
        }

        fingerprint += ',timestamp:' + new Date().getTime();
        
        logDebug('Comparison fingerprint generated: ' + fingerprint, 'preprocessing');
        return fingerprint;

    } catch (exc) {
        logError('Fingerprint generation error: ' + exc.message, 'preprocessing');
        return 'error:' + new Date().getTime();
    }
}

// =============================================================================
// FORMAT-SPECIFIC EXPORT GENERATORS - UPDATED LOGGING
// =============================================================================

/**
 * Generate JSON export
 * @param {Object} structure - DOM structure
 * @param {Object} config - Export configuration
 * @returns {Object} JSON export result
 */
function generateJSONExport(structure, config) {
    try {
        logDebug('Starting JSON export generation', 'json');

        var jsonContent = safeJSONStringify(structure, 8);
        if (!jsonContent) {
            var error = 'JSON stringification failed';
            logError(error, 'json');
            return createErrorResult(error, 'JSON_STRINGIFY_FAILED');
        }

        // Format output if requested
        if (config.formatOutput) {
            logDebug('Formatting JSON output', 'json');
            // Note: ExtendScript doesn't have native JSON.stringify with formatting
            // The safeJSONStringify already handles basic formatting
        }

        var metadata = {
            format: 'json',
            size: jsonContent.length,
            generatedAt: getCurrentTimestamp(),
            includeMetadata: config.includeMetadata
        };

        logDebug('JSON export generation completed, size: ' + jsonContent.length + ' chars', 'json');
        return createSuccessResult({
            content: jsonContent,
            metadata: metadata
        });

    } catch (exc) {
        var error = 'JSON export generation error: ' + exc.message;
        logError(error, 'json');
        return createErrorResult(error, 'JSON_GENERATION_ERROR');
    }
}

/**
 * Generate text export
 * @param {Object} structure - DOM structure
 * @param {Object} config - Export configuration
 * @returns {Object} Text export result
 */
function generateTextExport(structure, config) {
    try {
        logDebug('Starting text export generation', 'text');

        var textContent = '';

        // Add header
        textContent += 'InDesign DOM Discovery Results\n';
        textContent += '================================\n\n';

        // Add metadata section
        if (config.includeMetadata && structure.metadata) {
            textContent += generateMetadataSection(structure.metadata);
        }

        // Add statistics section
        if (config.includeStatistics) {
            textContent += generateStatisticsSection(structure);
        }

        // Add object reference section
        if (config.includeObjectReferences) {
            textContent += generateObjectReferenceSection(structure);
        }

        // Add main structure section
        textContent += generateStructureSection(structure, config);

        // Add access guide section
        if (config.includeAccessGuide) {
            textContent += generateAccessGuideSection(structure);
        }

        var metadata = {
            format: 'text',
            size: textContent.length,
            generatedAt: getCurrentTimestamp(),
            sections: ['metadata', 'statistics', 'structure', 'access_guide']
        };

        logDebug('Text export generation completed, size: ' + textContent.length + ' chars', 'text');
        return createSuccessResult({
            content: textContent,
            metadata: metadata
        });

    } catch (exc) {
        var error = 'Text export generation error: ' + exc.message;
        logError(error, 'text');
        return createErrorResult(error, 'TEXT_GENERATION_ERROR');
    }
}

/**
 * Generate CSV export
 * @param {Object} structure - DOM structure
 * @param {Object} config - Export configuration
 * @returns {Object} CSV export result
 */
function generateCSVExport(structure, config) {
    try {
        logDebug('Starting CSV export generation', 'csv');

        var csvContent = '';

        // Add CSV header
        csvContent += 'Path,Type,Value,ObjectID,ExtractedValue,Metadata\n';

        var rowCount = 0;
        
        // Process nodes
        if (structure.nodes && structure.nodes.length > 0) {
            logDebug('Processing ' + structure.nodes.length + ' nodes for CSV', 'csv');
            
            for (var i = 0; i < structure.nodes.length; i++) {
                var node = structure.nodes[i];
                var csvRows = generateCSVRowsForNode(node, config);
                
                for (var j = 0; j < csvRows.length; j++) {
                    csvContent += csvRows[j] + '\n';
                    rowCount++;
                }
            }
        }

        var metadata = {
            format: 'csv',
            size: csvContent.length,
            rows: rowCount,
            generatedAt: getCurrentTimestamp()
        };

        logDebug('CSV export generation completed, ' + rowCount + ' rows, size: ' + csvContent.length + ' chars', 'csv');
        return createSuccessResult({
            content: csvContent,
            metadata: metadata
        });

    } catch (exc) {
        var error = 'CSV export generation error: ' + exc.message;
        logError(error, 'csv');
        return createErrorResult(error, 'CSV_GENERATION_ERROR');
    }
}

// =============================================================================
// SECTION GENERATORS FOR TEXT FORMAT
// =============================================================================

/**
 * Generate metadata section
 * @param {Object} metadata - Structure metadata
 * @returns {String} Metadata section text
 */
function generateMetadataSection(metadata) {
    try {
        var section = 'METADATA:\n';
        section += '---------\n';
        section += 'Total Nodes: ' + (metadata.totalNodes || 'unknown') + '\n';
        section += 'Max Depth: ' + (metadata.maxDepth || 'unknown') + '\n';
        section += 'Generation Time: ' + (metadata.generationTime || 'unknown') + 'ms\n';
        section += 'Current Phase: ' + (metadata.currentPhase || 'unknown') + '\n';
        section += 'Builder Version: ' + (metadata.builderVersion || '3.1') + '\n\n';
        
        return section;
    } catch (exc) {
        logError('Metadata section generation error: ' + exc.message, 'text');
        return 'METADATA: [Generation error]\n\n';
    }
}

/**
 * Generate statistics section
 * @param {Object} structure - DOM structure
 * @returns {String} Statistics section text
 */
function generateStatisticsSection(structure) {
    try {
        var section = 'STATISTICS:\n';
        section += '-----------\n';

        if (structure.nodes) {
            var typeCount = {};
            var totalProperties = 0;

            for (var i = 0; i < structure.nodes.length; i++) {
                var node = structure.nodes[i];
                var nodeType = node.type || 'unknown';
                typeCount[nodeType] = (typeCount[nodeType] || 0) + 1;

                if (node.properties) {
                    totalProperties += countObjectKeys(node.properties);
                }
            }

            section += 'Total Properties: ' + totalProperties + '\n';
            section += 'Node Type Distribution:\n';
            
            for (var type in typeCount) {
                if (objectHasOwnProperty(typeCount, type)) {
                    section += '  ' + type + ': ' + typeCount[type] + '\n';
                }
            }
        } else {
            section += 'No node data available\n';
        }

        section += '\n';
        return section;
    } catch (exc) {
        logError('Statistics section generation error: ' + exc.message, 'text');
        return 'STATISTICS: [Generation error]\n\n';
    }
}

/**
 * Generate object reference section
 * @param {Object} structure - DOM structure
 * @returns {String} Object reference section text
 */
function generateObjectReferenceSection(structure) {
    try {
        var section = 'OBJECT REFERENCES:\n';
        section += '------------------\n';

        if (structure.nodes) {
            var objectRefs = [];
            
            for (var i = 0; i < structure.nodes.length; i++) {
                var node = structure.nodes[i];
                if (node.objectId) {
                    objectRefs.push(node.path + ' → ' + node.objectId);
                }
            }

            if (objectRefs.length > 0) {
                for (var j = 0; j < Math.min(20, objectRefs.length); j++) {
                    section += objectRefs[j] + '\n';
                }
                if (objectRefs.length > 20) {
                    section += '... and ' + (objectRefs.length - 20) + ' more references\n';
                }
            } else {
                section += 'No object references found\n';
            }
        } else {
            section += 'No node data available\n';
        }

        section += '\n';
        return section;
    } catch (exc) {
        logError('Object reference section generation error: ' + exc.message, 'text');
        return 'OBJECT REFERENCES: [Generation error]\n\n';
    }
}

/**
 * Generate structure section
 * @param {Object} structure - DOM structure
 * @param {Object} config - Export configuration
 * @returns {String} Structure section text
 */
function generateStructureSection(structure, config) {
    try {
        var section = 'DOM STRUCTURE:\n';
        section += '--------------\n';

        if (structure.nodes && structure.nodes.length > 0) {
            var maxNodes = config.maxFileSize ? Math.min(1000, structure.nodes.length) : structure.nodes.length;
            
            for (var i = 0; i < maxNodes; i++) {
                var node = structure.nodes[i];
                section += generateNodeStructureText(node, config);
            }

            if (structure.nodes.length > maxNodes) {
                section += '\n... and ' + (structure.nodes.length - maxNodes) + ' more nodes (truncated due to size limits)\n';
            }
        } else {
            section += 'No structure data available\n';
        }

        section += '\n';
        return section;
    } catch (exc) {
        logError('Structure section generation error: ' + exc.message, 'text');
        return 'DOM STRUCTURE: [Generation error]\n\n';
    }
}

/**
 * Generate access guide section
 * @param {Object} structure - DOM structure
 * @returns {String} Access guide section text
 */
function generateAccessGuideSection(structure) {
    try {
        var section = 'ACCESS GUIDE:\n';
        section += '-------------\n';
        section += 'Example access paths for discovered objects:\n\n';

        if (structure.nodes) {
            var examplePaths = collectExamplePaths(structure.nodes);
            
            for (var i = 0; i < examplePaths.length; i++) {
                section += examplePaths[i] + '\n';
            }
        } else {
            section += 'No access paths available\n';
        }

        section += '\n';
        return section;
    } catch (exc) {
        logError('Access guide section generation error: ' + exc.message, 'text');
        return 'ACCESS GUIDE: [Generation error]\n\n';
    }
}

// =============================================================================
// CSV UTILITY FUNCTIONS
// =============================================================================

/**
 * Generate CSV rows for a node
 * @param {Object} node - DOM node
 * @param {Object} config - Export configuration
 * @returns {Array} Array of CSV row strings
 */
function generateCSVRowsForNode(node, config) {
    try {
        var rows = [];

        if (!node) return rows;

        // Main node row
        var mainRow = generateCSVRow(
            node.path || '',
            node.type || '',
            node.value || '',
            node.objectId || '',
            node.extractedValue || '',
            node.metadata ? safeJSONStringify(node.metadata, 2) : ''
        );
        rows.push(mainRow);

        // Property rows if included
        if (config.includeExtractedValues && node.properties) {
            for (var prop in node.properties) {
                if (objectHasOwnProperty(node.properties, prop)) {
                    var propPath = (node.path || '') + '.' + prop;
                    var propValue = formatValueForCSV(node.properties[prop]);
                    
                    var propRow = generateCSVRow(
                        propPath,
                        typeof node.properties[prop],
                        propValue,
                        '',
                        '',
                        'property'
                    );
                    rows.push(propRow);
                }
            }
        }

        return rows;

    } catch (exc) {
        logError('CSV row generation error: ' + exc.message, 'csv');
        return [generateCSVRow('ERROR', 'ERROR', exc.message, '', '', '')];
    }
}

/**
 * Generate single CSV row
 * @param {String} path - Object path
 * @param {String} type - Object type
 * @param {String} value - Object value
 * @param {String} objectId - Object ID
 * @param {String} extractedValue - Extracted value
 * @param {String} metadata - Metadata
 * @returns {String} CSV row
 */
function generateCSVRow(path, type, value, objectId, extractedValue, metadata) {
    try {
        var columns = [
            csvEscape(path),
            csvEscape(type),
            csvEscape(value),
            csvEscape(objectId),
            csvEscape(extractedValue),
            csvEscape(metadata)
        ];

        return arrayJoin(columns, ',');

    } catch (exc) {
        logError('CSV row formatting error: ' + exc.message, 'csv');
        return 'ERROR,ERROR,ERROR,ERROR,ERROR,ERROR';
    }
}

/**
 * Escape value for CSV
 * @param {*} value - Value to escape
 * @returns {String} Escaped CSV value
 */
function csvEscape(value) {
    try {
        var strValue = safeToString(value);
        
        // Check if escaping is needed
        if (stringIndexOf(strValue, ',') !== -1 || 
            stringIndexOf(strValue, '"') !== -1 || 
            stringIndexOf(strValue, '\n') !== -1) {
            
            // Escape quotes by doubling them
            strValue = stringReplace(strValue, '"', '""');
            
            // Wrap in quotes
            return '"' + strValue + '"';
        }

        return strValue;

    } catch (exc) {
        return '"[escape error]"';
    }
}

/**
 * Format value for CSV display
 * @param {*} value - Value to format
 * @returns {String} Formatted value
 */
function formatValueForCSV(value) {
    try {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        
        var valueString = safeToString(value);
        var maxLength = 200;

        if (valueString.length > maxLength) {
            valueString = stringSubstring(valueString, 0, maxLength) + '...';
        }

        return valueString;

    } catch (exc) {
        return '[format error]';
    }
}

// =============================================================================
// FILE OPERATIONS - UPDATED LOGGING
// =============================================================================

/**
 * Write content to file
 * @param {String} content - Content to write
 * @param {String} format - File format
 * @param {Object} config - Export configuration
 * @returns {Object} Write result
 */
function writeToFile(content, format, config) {
    try {
        logDebug('Starting file write operation', 'file');

        if (!content) {
            var error = 'No content provided for file write';
            logError(error, 'file');
            return createErrorResult(error, 'NO_CONTENT');
        }

        // Check file size limits
        if (config.maxFileSize && content.length > config.maxFileSize) {
            var sizeError = 'Content size (' + content.length + ') exceeds limit (' + config.maxFileSize + ')';
            logWarn(sizeError, 'file');
            return createErrorResult(sizeError, 'SIZE_LIMIT_EXCEEDED');
        }

        // Generate file path
        var defaultPath = generateDefaultFilePath(format);
        var file = File.saveDialog('Save DOM export', defaultPath);
        
        if (!file) {
            logInfo('User cancelled file save dialog', 'file');
            return createSuccessResult({
                content: content,
                filePath: null,
                userCancelled: true
            }, 'File save cancelled by user');
        }

        // Write file
        logDebug('Writing to file: ' + file.fsName, 'file');
        
        file.open('w');
        file.write(content);
        file.close();

        logInfo('File written successfully: ' + file.fsName + ' (' + content.length + ' chars)', 'file');
        
        return createSuccessResult({
            filePath: file.fsName,
            size: content.length,
            format: format
        }, 'File written successfully');

    } catch (exc) {
        var writeResult = createErrorResult('File write failed', 'FILE_WRITE_ERROR');
        writeResult.errorMessage = 'File write error: ' + exc.message;
        logError(writeResult.errorMessage, 'file');
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
            for (var key in userOptions) {
                if (objectHasOwnProperty(userOptions, key)) {
                    mergedConfig[key] = userOptions[key];
                }
            }
        }

        return mergedConfig;

    } catch (exc) {
        logError('Config merge error: ' + exc.message, 'exportData');
        return defaultConfig;
    }
}

/**
 * Format value for display
 * @param {*} value - Value to format
 * @returns {String} Formatted value string
 */
function formatValueForDisplay(value) {
    try {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        
        var targetValue = value;
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
// NODE PROCESSING UTILITIES
// =============================================================================

/**
 * Remove extracted values from node
 * @param {Object} node - Node to process
 */
function removeExtractedValuesFromNode(node) {
    try {
        if (node && node.extractedValue) {
            delete node.extractedValue;
        }
        if (node && node.extractedValues) {
            delete node.extractedValues;
        }
    } catch (exc) {
        logError('Remove extracted values error: ' + exc.message, 'preprocessing');
    }
}

/**
 * Remove object IDs from node
 * @param {Object} node - Node to process
 */
function removeObjectIdsFromNode(node) {
    try {
        if (node && node.objectId) {
            delete node.objectId;
        }
        if (node && node.objectReference) {
            delete node.objectReference;
        }
    } catch (exc) {
        logError('Remove object IDs error: ' + exc.message, 'preprocessing');
    }
}

/**
 * Generate node structure text
 * @param {Object} node - DOM node
 * @param {Object} config - Export configuration
 * @returns {String} Node structure text
 */
function generateNodeStructureText(node, config) {
    try {
        var nodeText = '';
        
        if (node.path) {
            nodeText += node.path;
        }
        
        if (node.type) {
            nodeText += ' (' + node.type + ')';
        }
        
        if (node.value && config.includeExtractedValues) {
            nodeText += ': ' + formatValueForDisplay(node.value);
        }
        
        nodeText += '\n';
        
        return nodeText;

    } catch (exc) {
        logError('Node structure text generation error: ' + exc.message, 'text');
        return '[Node text generation error]\n';
    }
}

/**
 * Collect example access paths
 * @param {Array} nodes - Array of DOM nodes
 * @returns {Array} Example access paths
 */
function collectExamplePaths(nodes) {
    try {
        var examples = [];
        var typesSeen = {};
        
        for (var i = 0; i < nodes.length && examples.length < 20; i++) {
            var node = nodes[i];
            var nodeType = node.type || 'unknown';
            
            if (!typesSeen[nodeType] && node.path) {
                examples.push('// Access ' + nodeType + ':\nvar obj = ' + node.path + ';');
                typesSeen[nodeType] = true;
            }
        }
        
        return examples;

    } catch (exc) {
        logError('Example paths collection error: ' + exc.message, 'text');
        return ['// Error generating example paths'];
    }
}

// =============================================================================
// MODULE REGISTRATION - UPDATED TO REMOVE CUSTOM LOGGING FUNCTIONS
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
    'removeExtractedValuesFromNode', 'removeObjectIdsFromNode', 'generateNodeStructureText', 'collectExamplePaths'

    // REMOVED: Custom logging system functions (exporterLog, exporterInfo, exporterDebug, exporterWarn, exporterError)
]);

// =============================================================================
// END OF 3.2_dom-exporter.jsx - UNIFIED LOGGING SYSTEM
// =============================================================================