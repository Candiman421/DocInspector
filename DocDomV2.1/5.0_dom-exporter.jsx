// =============================================================================
// 5.0_dom-exporter.jsx - DOM STRUCTURE EXPORT
// InDesign DOM Discovery Builder v2.1 - TARGET ARCHITECTURE
// =============================================================================
// PURPOSE: Export DOM structure with object references, access paths, and comparison data
// DEPENDENCIES: ["1.0_safe-foundation.jsx", "2.0_dom-enumerator.jsx", "3.0_collection-sampler.jsx"]
// SIZE: ~1000 lines
// =============================================================================

// =============================================================================
// EXPORT CONFIGURATION
// =============================================================================

var DEFAULT_EXPORT_CONFIG = {
    defaultFormat: 'text',
    maxFileSize: 10000000,
    includeMetadata: true,
    includeStatistics: true,
    includeAccessGuide: true,
    includeObjectReferences: true,
    includeAccessPaths: true,
    includeComparisonData: true
};

// =============================================================================
// MAIN EXPORT FUNCTIONS
// =============================================================================

/**
 * Complete DOM structure export with reference tracking and comparison support
 * @param {Object} domStructure - DOM structure to export
 * @param {String} format - Export format: 'text', 'json', 'csv'
 * @param {String} customPath - Custom file path (optional)
 * @param {Object} exportOptions - Export options
 * @returns {Object} Export result with success, filePath, error, metadata
 */
function exportDOMStructure(domStructure, format, customPath, exportOptions) {
    var startTime = new Date().getTime();
    var result = {
        success: false,
        filePath: '',
        error: '',
        metadata: {}
    };
    
    try {
        if (!domStructure) {
            result.error = 'No DOM structure provided';
            return result;
        }
        
        var exportFormat = format || DEFAULT_EXPORT_CONFIG.defaultFormat;
        var config = mergeExportConfig(DEFAULT_EXPORT_CONFIG, exportOptions);
        
        // Pre-process DOM structure for export
        var processedDOM = preprocessDOMForExport(domStructure, config);
        
        // Generate export metadata
        var exportMetadata = {
            exportFormat: exportFormat,
            exportTimestamp: getCurrentTimestamp(),
            originalTimestamp: domStructure.metadata ? domStructure.metadata.timestamp : 'unknown',
            config: config,
            comparisonFingerprint: generateComparisonFingerprint(processedDOM)
        };
        
        // Generate export content based on format
        var exportContent = '';
        
        if (exportFormat === 'text') {
            exportContent = generateTextExport(processedDOM, config, exportMetadata);
        } else if (exportFormat === 'json') {
            exportContent = generateJSONExport(processedDOM, config, exportMetadata);
        } else if (exportFormat === 'csv') {
            exportContent = generateCSVExport(processedDOM, config, exportMetadata);
        } else {
            result.error = 'Unsupported export format: ' + exportFormat;
            return result;
        }
        
        if (!exportContent) {
            result.error = 'Failed to generate export content';
            return result;
        }
        
        // Check file size
        if (exportContent.length > config.maxFileSize) {
            result.error = 'Export content exceeds maximum file size limit';
            return result;
        }
        
        // Generate file path
        var filePath = customPath || generateDefaultFilePath(domStructure, getFileExtension(exportFormat));
        
        // Write to file
        var writeResult = writeToFile(filePath, exportContent, config);
        if (!writeResult.success) {
            result.error = writeResult.error;
            return result;
        }
        
        // Success
        result.success = true;
        result.filePath = writeResult.filePath;
        result.metadata = {
            exportTime: new Date().getTime() - startTime,
            contentLength: exportContent.length,
            format: exportFormat,
            features: getEnabledFeatures(config),
            comparisonFingerprint: exportMetadata.comparisonFingerprint
        };
        
        return result;
        
    } catch (exc) {
        result.error = 'Export failed: ' + exc.message;
        return result;
    }
}

// =============================================================================
// FORMAT-SPECIFIC GENERATORS
// =============================================================================

/**
 * Generate comprehensive text export
 * @param {Object} domStructure - Processed DOM structure
 * @param {Object} config - Export configuration
 * @param {Object} metadata - Export metadata
 * @returns {String} Comprehensive text export with all analysis data
 */
function generateTextExport(domStructure, config, metadata) {
    try {
        var builder = createStringBuilder();
        
        // Header
        builder.appendLine('INDESIGN DOM COMPREHENSIVE ANALYSIS');
        builder.appendLine('===================================');
        builder.appendLine('Generated by: InDesign DOM Discovery Builder v2.1');
        builder.appendLine('Export Timestamp: ' + metadata.exportTimestamp);
        builder.appendLine('Export Format: Enhanced Text with Object References');
        builder.appendLine('Comparison Fingerprint: ' + metadata.comparisonFingerprint);
        builder.appendLine('');
        
        // Document metadata section
        if (config.includeMetadata) {
            generateDocumentMetadataSection(builder, domStructure, config);
        }
        
        // Statistics section
        if (config.includeStatistics) {
            generateStatisticsSection(builder, domStructure, config, metadata);
        }
        
        // Object reference analysis section
        if (config.includeObjectReferences) {
            generateObjectReferenceAnalysisSection(builder, domStructure, config, metadata);
        }
        
        // Comparison data section
        if (config.includeComparisonData) {
            generateComparisonDataSection(builder, domStructure, config);
        }
        
        // Access guide section
        if (config.includeAccessGuide) {
            generateAccessGuideSection(builder, domStructure, config);
        }
        
        // DOM tree section
        generateDOMTreeSection(builder, domStructure, config);
        
        return builder.toString();
        
    } catch (exc) {
        return 'Text export generation failed: ' + exc.message;
    }
}

/**
 * Generate JSON export with references
 * @param {Object} domStructure - Processed DOM structure
 * @param {Object} config - Export configuration
 * @param {Object} metadata - Export metadata
 * @returns {String} JSON formatted export with object references
 */
function generateJSONExport(domStructure, config, metadata) {
    try {
        var exportData = {
            metadata: {
                exportFormat: 'json',
                exportTimestamp: metadata.exportTimestamp,
                originalTimestamp: domStructure.metadata ? domStructure.metadata.timestamp : 'unknown',
                version: '2.1.0',
                comparisonFingerprint: metadata.comparisonFingerprint,
                features: getEnabledFeatures(config)
            },
            domStructure: domStructure
        };
        
        // Add export-specific enhancements
        if (config.includeObjectReferences && domStructure.objectRegistry) {
            exportData.objectReferenceMap = domStructure.objectRegistry;
        }
        
        if (config.includeAccessPaths) {
            exportData.accessPathIndex = generateAccessPathIndex(domStructure);
        }
        
        // Try native JSON first, fallback to ES3-compatible method
        if (typeof JSON !== 'undefined' && JSON.stringify) {
            try {
                return JSON.stringify(exportData, null, 2);
            } catch (exc) {
                // Fall through to ES3 method
            }
        }
        
        // ES3-compatible JSON generation
        return generateES3CompatibleJSON(domStructure, config, metadata);
        
    } catch (exc) {
        return '{"error": "JSON export generation failed: ' + exc.message.replace(/"/g, '\\"') + '"}';
    }
}

/**
 * Generate CSV export with references
 * @param {Object} domStructure - Processed DOM structure
 * @param {Object} config - Export configuration
 * @param {Object} metadata - Export metadata
 * @returns {String} CSV formatted export with reference data
 */
function generateCSVExport(domStructure, config, metadata) {
    try {
        var builder = createStringBuilder();
        
        // CSV Header
        builder.appendLine('Path,Name,Type,Depth,Safety Level,Is Collection,Is Method,Object ID,Alternative Paths,Properties Count');
        
        // Generate CSV rows from DOM structure
        if (domStructure.structure && domStructure.structure.document) {
            generateCSVRows(domStructure.structure.document, builder, config);
        }
        
        return builder.toString();
        
    } catch (exc) {
        return 'CSV export generation failed: ' + exc.message;
    }
}

// =============================================================================
// PROCESSING FUNCTIONS
// =============================================================================

/**
 * Pre-process DOM structure for export
 * @param {Object} domStructure - DOM structure to process
 * @param {Object} config - Export configuration
 * @returns {Object} Processed DOM structure with enhanced export data
 */
function preprocessDOMForExport(domStructure, config) {
    try {
        // Create a copy to avoid modifying original
        var processedDOM = JSON.parse(JSON.stringify(domStructure));
        
        // Add export enhancements
        processedDOM.exportEnhancements = {
            comparisonReady: config.includeComparisonData,
            accessPathsGenerated: config.includeAccessPaths,
            objectReferencesTracked: config.includeObjectReferences,
            preprocessedAt: getCurrentTimestamp()
        };
        
        return processedDOM;
        
    } catch (exc) {
        // Return original if preprocessing fails
        return domStructure;
    }
}

/**
 * Generate comparison fingerprint for before/after analysis
 * @param {Object} domStructure - DOM structure
 * @returns {String} Comparison fingerprint
 */
function generateComparisonFingerprint(domStructure) {
    try {
        var fingerprint = [];
        
        // Structure fingerprint
        if (domStructure.statistics) {
            fingerprint.push('nodes:' + (domStructure.statistics.totalNodes || 0));
            fingerprint.push('props:' + (domStructure.statistics.totalProperties || 0));
            fingerprint.push('objects:' + (domStructure.statistics.objectReferences || 0));
        }
        
        // Document fingerprint
        if (domStructure.metadata) {
            fingerprint.push('doc:' + (domStructure.metadata.documentName || 'unknown'));
            fingerprint.push('time:' + (domStructure.metadata.timestamp || 'unknown'));
        }
        
        // Feature fingerprint
        if (domStructure.metadata && domStructure.metadata.collectionSampling) {
            fingerprint.push('collections:enabled');
        }
        
        if (domStructure.objectRegistry) {
            fingerprint.push('references:tracked');
        }
        
        return fingerprint.join('|');
        
    } catch (exc) {
        return 'fingerprint_error';
    }
}

// =============================================================================
// REPORT GENERATION FUNCTIONS
// =============================================================================

/**
 * Generate document metadata section
 * @param {Object} builder - String builder
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Configuration
 */
function generateDocumentMetadataSection(builder, domStructure, config) {
    try {
        builder.appendLine('DOCUMENT METADATA');
        builder.appendLine('=================');
        
        if (domStructure.metadata) {
            builder.appendLine('Document Name: ' + (domStructure.metadata.documentName || 'Unknown'));
            builder.appendLine('Analysis Timestamp: ' + (domStructure.metadata.timestamp || 'Unknown'));
            builder.appendLine('Analysis Version: ' + (domStructure.metadata.version || 'Unknown'));
            
            if (domStructure.metadata.config) {
                builder.appendLine('Max Depth: ' + (domStructure.metadata.config.maxDepth || 'Unknown'));
                builder.appendLine('Timeout: ' + (domStructure.metadata.config.timeoutMs || 'Unknown') + 'ms');
            }
            
            // Collection sampling info
            if (domStructure.metadata.collectionSampling) {
                builder.appendLine('Collection Sampling: ' + (domStructure.metadata.collectionSampling.enabled ? 'Enabled' : 'Disabled'));
                if (domStructure.metadata.collectionSampling.statistics) {
                    var stats = domStructure.metadata.collectionSampling.statistics;
                    builder.appendLine('Collections Found: ' + (stats.collectionsFound || 0));
                    builder.appendLine('Collections Sampled: ' + (stats.collectionsSampled || 0));
                }
            }
        }
        
        builder.appendLine('');
        
    } catch (exc) {
        builder.appendLine('Error generating metadata section');
        builder.appendLine('');
    }
}

/**
 * Generate statistics section
 * @param {Object} builder - String builder
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Configuration
 * @param {Object} metadata - Export metadata
 */
function generateStatisticsSection(builder, domStructure, config, metadata) {
    try {
        builder.appendLine('ANALYSIS STATISTICS');
        builder.appendLine('==================');
        
        if (domStructure.statistics) {
            builder.appendLine('Total Nodes: ' + (domStructure.statistics.totalNodes || 0));
            builder.appendLine('Total Properties: ' + (domStructure.statistics.totalProperties || 0));
            builder.appendLine('Object References: ' + (domStructure.statistics.objectReferences || 0));
            builder.appendLine('Duplicate Objects: ' + (domStructure.statistics.duplicateObjects || 0));
            builder.appendLine('Circular References: ' + (domStructure.statistics.circularReferences || 0));
            
            if (domStructure.statistics.enumerationTime) {
                builder.appendLine('Enumeration Time: ' + domStructure.statistics.enumerationTime + 'ms');
            }
        }
        
        // Collection sampling statistics
        var collectionStats = getCollectionSamplingStatistics(domStructure);
        if (collectionStats.samplingEnabled) {
            builder.appendLine('');
            builder.appendLine('COLLECTION SAMPLING STATISTICS');
            builder.appendLine('------------------------------');
            builder.appendLine('Collections Found: ' + collectionStats.collectionsFound);
            builder.appendLine('Collections Sampled: ' + collectionStats.collectionsSampled);
            builder.appendLine('Total Items Sampled: ' + collectionStats.totalItemsSampled);
            builder.appendLine('Cross-Collection Objects: ' + collectionStats.crossCollectionObjects);
        }
        
        builder.appendLine('');
        
    } catch (exc) {
        builder.appendLine('Error generating statistics section');
        builder.appendLine('');
    }
}

/**
 * Generate object reference analysis section
 * @param {Object} builder - String builder
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Configuration
 * @param {Object} metadata - Export metadata
 */
function generateObjectReferenceAnalysisSection(builder, domStructure, config, metadata) {
    try {
        builder.appendLine('OBJECT REFERENCE ANALYSIS');
        builder.appendLine('=========================');
        
        if (!domStructure.objectRegistry) {
            builder.appendLine('Object reference tracking not available');
            builder.appendLine('');
            return;
        }
        
        var multiplePathObjects = findObjectsWithMultiplePaths(domStructure);
        
        builder.appendLine('Objects with Multiple Access Paths: ' + multiplePathObjects.length);
        builder.appendLine('');
        
        if (multiplePathObjects.length > 0) {
            builder.appendLine('OBJECTS WITH MULTIPLE PATHS');
            builder.appendLine('---------------------------');
            
            for (var i = 0; i < Math.min(multiplePathObjects.length, 10); i++) {
                var objInfo = multiplePathObjects[i];
                builder.appendLine('Object ID: ' + objInfo.objectId);
                builder.appendLine('Path Count: ' + objInfo.pathCount);
                builder.appendLine('Paths:');
                
                for (var j = 0; j < objInfo.paths.length; j++) {
                    builder.appendLine('  - ' + objInfo.paths[j]);
                }
                builder.appendLine('');
            }
        }
        
        builder.appendLine('');
        
    } catch (exc) {
        builder.appendLine('Error generating object reference analysis');
        builder.appendLine('');
    }
}

/**
 * Generate comparison data section
 * @param {Object} builder - String builder
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Configuration
 */
function generateComparisonDataSection(builder, domStructure, config) {
    try {
        builder.appendLine('COMPARISON DATA');
        builder.appendLine('===============');
        
        var fingerprint = generateComparisonFingerprint(domStructure);
        builder.appendLine('Structure Fingerprint: ' + fingerprint);
        builder.appendLine('Generation Time: ' + getCurrentTimestamp());
        
        if (domStructure.metadata) {
            builder.appendLine('Original Analysis: ' + (domStructure.metadata.timestamp || 'Unknown'));
            builder.appendLine('Document: ' + (domStructure.metadata.documentName || 'Unknown'));
        }
        
        builder.appendLine('');
        builder.appendLine('This fingerprint can be used for before/after comparison analysis.');
        builder.appendLine('');
        
    } catch (exc) {
        builder.appendLine('Error generating comparison data');
        builder.appendLine('');
    }
}

/**
 * Generate comprehensive access guide section
 * @param {Object} builder - String builder
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Configuration
 */
function generateAccessGuideSection(builder, domStructure, config) {
    try {
        builder.appendLine('PROPERTY ACCESS GUIDE');
        builder.appendLine('=====================');
        
        builder.appendLine('Safe property access patterns based on discovered structure:');
        builder.appendLine('');
        
        // Generate basic access patterns
        builder.appendLine('BASIC DOCUMENT ACCESS');
        builder.appendLine('--------------------');
        builder.appendLine('var doc = app.activeDocument;');
        builder.appendLine('// Always check if properties exist before accessing');
        builder.appendLine('if (doc && "name" in doc) {');
        builder.appendLine('    var docName = doc.name;');
        builder.appendLine('}');
        builder.appendLine('');
        
        // Generate collection access patterns if available
        var discoveredCollections = findAllCollections(domStructure);
        if (discoveredCollections.length > 0) {
            builder.appendLine('COLLECTION ACCESS PATTERNS');
            builder.appendLine('--------------------------');
            
            for (var i = 0; i < Math.min(discoveredCollections.length, 5); i++) {
                var collection = discoveredCollections[i];
                builder.appendLine('// Access ' + collection.name + ' collection:');
                builder.appendLine('if (doc && "' + collection.name + '" in doc) {');
                builder.appendLine('    var ' + collection.name + 'Collection = doc.' + collection.name + ';');
                builder.appendLine('    for (var i = 0; i < ' + collection.name + 'Collection.length; i++) {');
                builder.appendLine('        var item = ' + collection.name + 'Collection[i];');
                builder.appendLine('        // Process item safely');
                builder.appendLine('    }');
                builder.appendLine('}');
                builder.appendLine('');
            }
        }
        
        builder.appendLine('SAFETY RECOMMENDATIONS');
        builder.appendLine('----------------------');
        builder.appendLine('1. Always use "in" operator to check property existence');
        builder.appendLine('2. Wrap property access in try-catch blocks');
        builder.appendLine('3. Check collection length before iteration');
        builder.appendLine('4. Avoid accessing dangerous properties (constructor, prototype)');
        builder.appendLine('5. Use timeout protection for long operations');
        builder.appendLine('');
        
    } catch (exc) {
        builder.appendLine('Error generating access guide');
        builder.appendLine('');
    }
}

/**
 * Generate DOM tree section
 * @param {Object} builder - String builder
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Configuration
 */
function generateDOMTreeSection(builder, domStructure, config) {
    try {
        builder.appendLine('DOM STRUCTURE TREE');
        builder.appendLine('==================');
        
        if (domStructure.structure && domStructure.structure.document) {
            generateDOMTreeText(builder, domStructure.structure.document, '', true, config);
        } else {
            builder.appendLine('No DOM structure available');
        }
        
        builder.appendLine('');
        
    } catch (exc) {
        builder.appendLine('Error generating DOM tree');
        builder.appendLine('');
    }
}

/**
 * Recursively generate tree structure text
 * @param {Object} builder - String builder
 * @param {Object} domNode - DOM node
 * @param {String} prefix - Tree prefix
 * @param {Boolean} isLast - Is last node at this level
 * @param {Object} config - Configuration
 */
function generateDOMTreeText(builder, domNode, prefix, isLast, config) {
    try {
        if (!domNode) {
            return;
        }
        
        // Node line
        var connector = isLast ? '└── ' : '├── ';
        var nodeLine = prefix + connector + domNode.name + ' (' + domNode.type + ')';
        
        // Add additional info
        var info = [];
        
        if (domNode.properties && domNode.properties.length) {
            info.push(domNode.properties.length + ' props');
        }
        
        if (domNode.collections && domNode.collections.length) {
            info.push(domNode.collections.length + ' collections');
        }
        
        if (domNode.methods && domNode.methods.length) {
            info.push(domNode.methods.length + ' methods');
        }
        
        if (domNode.objectMetadata && domNode.objectMetadata.isCircular) {
            info.push('CIRCULAR');
        }
        
        if (info.length > 0) {
            nodeLine += ' [' + info.join(', ') + ']';
        }
        
        builder.appendLine(nodeLine);
        
        // Child nodes
        if (domNode.childNodes && domNode.childNodes.length) {
            var newPrefix = prefix + (isLast ? '    ' : '│   ');
            
            for (var i = 0; i < domNode.childNodes.length; i++) {
                var isLastChild = (i === domNode.childNodes.length - 1);
                generateDOMTreeText(builder, domNode.childNodes[i], newPrefix, isLastChild, config);
            }
        }
        
    } catch (exc) {
        builder.appendLine(prefix + '└── [Error displaying node]');
    }
}

// =============================================================================
// FILE OPERATIONS
// =============================================================================

/**
 * Write content to file with enhanced metadata
 * @param {String} filePath - File path to write
 * @param {String} content - Content to write
 * @param {Object} config - Configuration
 * @returns {Object} Write result with enhanced metadata
 */
function writeToFile(filePath, content, config) {
    var result = {
        success: false,
        filePath: '',
        error: '',
        metadata: {}
    };
    
    try {
        var targetFile = new File(filePath);
        
        if (!targetFile.open('w')) {
            result.error = 'Could not open file for writing: ' + filePath;
            return result;
        }
        
        // Set encoding for better compatibility
        targetFile.encoding = 'UTF-8';
        
        // Write content
        var writeSuccess = targetFile.write(content);
        targetFile.close();
        
        if (!writeSuccess) {
            result.error = 'Failed to write content to file';
            return result;
        }
        
        result.success = true;
        result.filePath = targetFile.fsName;
        result.metadata = {
            fileSize: content.length,
            encoding: 'UTF-8',
            writeTime: getCurrentTimestamp()
        };
        
        return result;
        
    } catch (exc) {
        result.error = 'File write error: ' + exc.message;
        return result;
    }
}

/**
 * Generate default file path
 * @param {Object} domStructure - DOM structure for naming
 * @param {String} extension - File extension
 * @returns {String} Generated file path with feature indicators
 */
function generateDefaultFilePath(domStructure, extension) {
    try {
        var docName = 'InDesignDocument';
        
        if (domStructure.metadata && domStructure.metadata.documentName) {
            docName = domStructure.metadata.documentName.replace(/[^a-zA-Z0-9]/g, '_');
        }
        
        var timestamp = new Date();
        var timeStr = timestamp.getFullYear() + 
                     ('0' + (timestamp.getMonth() + 1)).slice(-2) + 
                     ('0' + timestamp.getDate()).slice(-2) + '_' +
                     ('0' + timestamp.getHours()).slice(-2) + 
                     ('0' + timestamp.getMinutes()).slice(-2);
        
        // Feature indicators
        var features = [];
        if (domStructure.metadata && domStructure.metadata.collectionSampling) {
            features.push('Collections');
        }
        if (domStructure.objectRegistry) {
            features.push('ObjRefs');
        }
        
        var featureString = features.length > 0 ? '_' + features.join('_') : '';
        
        var desktopPath = Folder.desktop.fsName;
        return desktopPath + '/' + docName + '_DOM_' + timeStr + featureString + '.' + extension;
        
    } catch (exc) {
        return Folder.desktop.fsName + '/InDesign_DOM_Export_' + new Date().getTime() + '.' + extension;
    }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Merge export configuration
 * @param {Object} defaults - Default configuration
 * @param {Object} userOptions - User options
 * @returns {Object} Merged configuration
 */
function mergeExportConfig(defaults, userOptions) {
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

/**
 * Get file extension for format
 * @param {String} format - Export format
 * @returns {String} File extension
 */
function getFileExtension(format) {
    var extensions = {
        'text': 'txt',
        'json': 'json',
        'csv': 'csv'
    };
    
    return extensions[format] || 'txt';
}

/**
 * Get enabled features list
 * @param {Object} config - Configuration
 * @returns {Array} Array of enabled feature names
 */
function getEnabledFeatures(config) {
    var features = [];
    
    if (config.includeMetadata) features.push('metadata');
    if (config.includeStatistics) features.push('statistics');
    if (config.includeObjectReferences) features.push('objectReferences');
    if (config.includeAccessPaths) features.push('accessPaths');
    if (config.includeComparisonData) features.push('comparisonData');
    if (config.includeAccessGuide) features.push('accessGuide');
    
    return features;
}

/**
 * Generate access path index
 * @param {Object} domStructure - DOM structure
 * @returns {Object} Access path index
 */
function generateAccessPathIndex(domStructure) {
    try {
        var index = {};
        
        if (domStructure.objectRegistry && domStructure.objectRegistry.accessPaths) {
            var accessPaths = domStructure.objectRegistry.accessPaths;
            
            for (var objectId in accessPaths) {
                index[objectId] = accessPaths[objectId].slice(); // Copy array
            }
        }
        
        return index;
        
    } catch (exc) {
        return {};
    }
}

/**
 * Generate ES3-compatible JSON
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Configuration
 * @param {Object} metadata - Export metadata
 * @returns {String} ES3-compatible JSON string
 */
function generateES3CompatibleJSON(domStructure, config, metadata) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('{');
        builder.appendLine('  "metadata": {');
        builder.appendLine('    "exportFormat": "json",');
        builder.appendLine('    "exportTimestamp": "' + (metadata.exportTimestamp || getCurrentTimestamp()) + '",');
        builder.appendLine('    "version": "2.1.0",');
        builder.appendLine('    "comparisonFingerprint": "' + (metadata.comparisonFingerprint || 'unknown') + '"');
        builder.appendLine('  },');
        builder.appendLine('  "domStructure": ' + safeStringify(domStructure, 0, 3));
        builder.appendLine('}');
        
        return builder.toString();
        
    } catch (exc) {
        return '{"error": "ES3 JSON generation failed: ' + exc.message.replace(/"/g, '\\"') + '"}';
    }
}

/**
 * Safe object stringification for ES3 with depth limit
 * @param {Object} targetObj - Object to stringify
 * @param {Number} currentDepth - Current recursion depth
 * @param {Number} maxDepth - Maximum recursion depth
 * @returns {String} Stringified object
 */
function safeStringify(targetObj, currentDepth, maxDepth) {
    try {
        currentDepth = currentDepth || 0;
        maxDepth = maxDepth || 3;
        
        if (currentDepth >= maxDepth) {
            return '"[MAX_DEPTH_REACHED]"';
        }
        
        if (targetObj === null) return 'null';
        if (typeof targetObj === 'undefined') return 'undefined';
        if (typeof targetObj === 'string') return '"' + targetObj.replace(/"/g, '\\"').replace(/\n/g, '\\n') + '"';
        if (typeof targetObj === 'number') return targetObj.toString();
        if (typeof targetObj === 'boolean') return targetObj.toString();
        
        if (typeof targetObj === 'object') {
            if (targetObj.constructor === Array || (targetObj.length !== undefined && typeof targetObj.length === 'number')) {
                var arrayParts = [];
                var arrayLength = Math.min(targetObj.length || 0, 50); // Limit array size
                
                for (var i = 0; i < arrayLength; i++) {
                    try {
                        if (i in targetObj) {
                            arrayParts.push(safeStringify(targetObj[i], currentDepth + 1, maxDepth));
                        } else {
                            arrayParts.push('null');
                        }
                    } catch (exc) {
                        arrayParts.push('"[STRINGIFY_ERROR]"');
                    }
                }
                
                return '[' + arrayParts.join(',') + ']';
            } else {
                var objectParts = [];
                var propertyCount = 0;
                var maxProperties = 20; // Limit properties per object
                
                for (var key in targetObj) {
                    if (propertyCount >= maxProperties) break;
                    
                    try {
                        if (targetObj.hasOwnProperty && !targetObj.hasOwnProperty(key)) continue;
                        
                        // Skip dangerous properties
                        if (isDangerousProperty && isDangerousProperty(key)) continue;
                        
                        var value = safeStringify(targetObj[key], currentDepth + 1, maxDepth);
                        objectParts.push('"' + key.replace(/"/g, '\\"') + '":' + value);
                        propertyCount++;
                    } catch (exc) {
                        // Skip properties that cause errors
                        continue;
                    }
                }
                
                return '{' + objectParts.join(',') + '}';
            }
        }
        
        return '"[' + typeof targetObj + ']"';
        
    } catch (exc) {
        return '"[STRINGIFY_ERROR]"';
    }
}

/**
 * Generate CSV rows from DOM node
 * @param {Object} domNode - DOM node
 * @param {Object} builder - String builder
 * @param {Object} config - Configuration
 */
function generateCSVRows(domNode, builder, config) {
    try {
        if (!domNode) return;
        
        // Add row for this node
        var altPaths = domNode.alternativeAccessPaths ? domNode.alternativeAccessPaths.join(';') : '';
        var propCount = (domNode.properties ? domNode.properties.length : 0) + 
                       (domNode.collections ? domNode.collections.length : 0) + 
                       (domNode.methods ? domNode.methods.length : 0);
        
        builder.appendLine([
            '"' + domNode.path + '"',
            '"' + domNode.name + '"',
            '"' + domNode.type + '"',
            domNode.depth,
            '"safe"', // Default safety level
            'false', // Is collection
            'false', // Is method
            '"' + domNode.objectId + '"',
            '"' + altPaths + '"',
            propCount
        ].join(','));
        
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

// =============================================================================
// END OF 5.0_dom-exporter.jsx
//
// CRITICAL IMPROVEMENTS IMPLEMENTED:
// - Fixed JSON compatibility with native JSON.stringify() detection
// - Enhanced ES3 fallback with depth limits and safety checks
// - Added comprehensive object stringification with recursion protection
// - Improved array and object handling with size limits
// - Enhanced error handling with proper quote escaping
// - Added dangerous property filtering during stringification
// - Maintains full export functionality while ensuring runtime safety
// =============================================================================