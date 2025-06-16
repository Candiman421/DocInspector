// =============================================================================
// 5.0_dom-exporter.jsx - DOM STRUCTURE EXPORT
// InDesign DOM Discovery Builder v2.1.1 - PRODUCTION READY
// =============================================================================
// PURPOSE: Export DOM structure with object references, access paths, and comparison data
// DEPENDENCIES: ["1.0_safe-foundation.jsx", "2.0_dom-enumerator.jsx", "3.0_collection-sampler.jsx"]
// SIZE: ~1100 lines
// =============================================================================

// =============================================================================
// DEPENDENCY VALIDATION
// =============================================================================

var DOM_EXPORTER_DEPENDENCIES = ['1.0_safe-foundation', '2.0_dom-enumerator', '3.0_collection-sampler'];
var dependencyCheck = validateDependencies(DOM_EXPORTER_DEPENDENCIES);
if (!dependencyCheck.success) {
    throw new Error('DOM Exporter missing dependencies: ' + dependencyCheck.missing.join(', '));
}

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
        // Enhanced parameter validation
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
            comparisonFingerprint: generateComparisonFingerprint(processedDOM),
            es3Compliant: true,
            moduleSystem: true
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
// FORMAT-SPECIFIC GENERATORS - ENHANCED
// =============================================================================

/**
 * Generate comprehensive text export (enhanced)
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
        builder.appendLine('Generated by: InDesign DOM Discovery Builder v2.1.1');
        builder.appendLine('Export Timestamp: ' + metadata.exportTimestamp);
        builder.appendLine('Export Format: Enhanced Text with Object References');
        builder.appendLine('Comparison Fingerprint: ' + metadata.comparisonFingerprint);
        builder.appendLine('ES3 Compliant: Yes');
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
 * Generate JSON export with references (enhanced with better ES3 fallback)
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
                version: '2.1.1',
                comparisonFingerprint: metadata.comparisonFingerprint,
                features: getEnabledFeatures(config),
                es3Compliant: true
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
        
        // Enhanced JSON generation - try native first, fallback to ES3 method
        if (typeof JSON !== 'undefined' && JSON.stringify) {
            try {
                return JSON.stringify(exportData, null, 2);
            } catch (exc) {
                // Fall through to ES3 method
            }
        }
        
        // Enhanced ES3-compatible JSON generation
        return generateEnhancedES3JSON(exportData, config, metadata);
        
    } catch (exc) {
        return '{"error": "JSON export generation failed: ' + stringReplace(exc.message, '"', '\\"') + '"}';
    }
}

/**
 * Generate CSV export with references (enhanced)
 * @param {Object} domStructure - Processed DOM structure
 * @param {Object} config - Export configuration
 * @param {Object} metadata - Export metadata
 * @returns {String} CSV formatted export with reference data
 */
function generateCSVExport(domStructure, config, metadata) {
    try {
        var builder = createStringBuilder();
        
        // Enhanced CSV Header
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

// =============================================================================
// PROCESSING FUNCTIONS - ENHANCED
// =============================================================================

/**
 * Pre-process DOM structure for export (enhanced)
 * @param {Object} domStructure - DOM structure to process
 * @param {Object} config - Export configuration
 * @returns {Object} Processed DOM structure with enhanced export data
 */
function preprocessDOMForExport(domStructure, config) {
    try {
        // Create a safe copy to avoid modifying original
        var processedDOM = objectClone(domStructure, 4); // Enhanced cloning with deeper depth
        
        if (!processedDOM) {
            processedDOM = domStructure; // Fallback to original if cloning fails
        }
        
        // Add export enhancements
        processedDOM.exportEnhancements = {
            comparisonReady: config.includeComparisonData,
            accessPathsGenerated: config.includeAccessPaths,
            objectReferencesTracked: config.includeObjectReferences,
            preprocessedAt: getCurrentTimestamp(),
            es3Compliant: true,
            moduleVersion: '2.1.1'
        };
        
        return processedDOM;
        
    } catch (exc) {
        // Return original if preprocessing fails
        return domStructure;
    }
}

/**
 * Generate comparison fingerprint for before/after analysis (enhanced)
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
        
        // Version fingerprint
        fingerprint.push('version:2.1.1');
        fingerprint.push('es3:true');
        
        return arrayJoin(fingerprint, '|'); // Enhanced ES3 join
        
    } catch (exc) {
        return 'fingerprint_error';
    }
}

// =============================================================================
// REPORT GENERATION FUNCTIONS - ENHANCED
// =============================================================================

/**
 * Generate document metadata section (enhanced)
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
            builder.appendLine('Analysis Version: ' + (domStructure.metadata.version || '2.1.1'));
            builder.appendLine('ES3 Compliant: Yes');
            
            if (domStructure.metadata.config) {
                builder.appendLine('Max Depth: ' + (domStructure.metadata.config.maxDepth || 'Unknown'));
                builder.appendLine('Timeout: ' + (domStructure.metadata.config.timeoutMs || 'Unknown') + 'ms');
            }
            
            // Enhanced collection sampling info
            if (domStructure.metadata.collectionSampling) {
                builder.appendLine('Collection Sampling: ' + (domStructure.metadata.collectionSampling.enabled ? 'Enabled' : 'Disabled'));
                if (domStructure.metadata.collectionSampling.statistics) {
                    var stats = domStructure.metadata.collectionSampling.statistics;
                    builder.appendLine('Collections Found: ' + (stats.collectionsFound || 0));
                    builder.appendLine('Collections Sampled: ' + (stats.collectionsSampled || 0));
                    builder.appendLine('Items Sampled: ' + (stats.totalItemsSampled || 0));
                }
            }
            
            // Environment info
            if (domStructure.metadata.environment) {
                builder.appendLine('InDesign Version: ' + (domStructure.metadata.environment.indesignVersion || 'Unknown'));
                builder.appendLine('Native JSON: ' + (domStructure.metadata.environment.hasNativeJSON ? 'Available' : 'ES3 Fallback'));
            }
        }
        
        builder.appendLine('');
        
    } catch (exc) {
        builder.appendLine('Error generating metadata section: ' + exc.message);
        builder.appendLine('');
    }
}

/**
 * Generate statistics section (enhanced)
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
        
        // Enhanced collection sampling statistics
        var collectionStats = getCollectionSamplingStatistics(domStructure);
        if (collectionStats.samplingEnabled) {
            builder.appendLine('');
            builder.appendLine('COLLECTION SAMPLING STATISTICS');
            builder.appendLine('------------------------------');
            builder.appendLine('Collections Found: ' + collectionStats.collectionsFound);
            builder.appendLine('Collections Sampled: ' + collectionStats.collectionsSampled);
            builder.appendLine('Total Items Sampled: ' + collectionStats.totalItemsSampled);
            builder.appendLine('Cross-Collection Objects: ' + collectionStats.crossCollectionObjects);
            builder.appendLine('Sampling Time: ' + collectionStats.samplingTime + 'ms');
        }
        
        builder.appendLine('');
        
    } catch (exc) {
        builder.appendLine('Error generating statistics section: ' + exc.message);
        builder.appendLine('');
    }
}

/**
 * Generate object reference analysis section (enhanced)
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
        builder.appendLine('Error generating object reference analysis: ' + exc.message);
        builder.appendLine('');
    }
}

/**
 * Generate comparison data section (enhanced)
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
        builder.appendLine('Use the DOM Comparator module (7.0) to compare two exports.');
        builder.appendLine('');
        
    } catch (exc) {
        builder.appendLine('Error generating comparison data: ' + exc.message);
        builder.appendLine('');
    }
}

/**
 * Generate comprehensive access guide section (enhanced)
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
        builder.appendLine('    $.writeln("Document: " + docName);');
        builder.appendLine('}');
        builder.appendLine('');
        
        // Enhanced collection access patterns
        var discoveredCollections = findAllCollections(domStructure);
        if (discoveredCollections.length > 0) {
            builder.appendLine('COLLECTION ACCESS PATTERNS');
            builder.appendLine('--------------------------');
            
            for (var i = 0; i < Math.min(discoveredCollections.length, 5); i++) {
                var collection = discoveredCollections[i];
                builder.appendLine('// Access ' + collection.name + ' collection (ES3 safe):');
                builder.appendLine('if (doc && "' + collection.name + '" in doc) {');
                builder.appendLine('    var ' + collection.name + 'Collection = doc.' + collection.name + ';');
                builder.appendLine('    for (var i = 0; i < ' + collection.name + 'Collection.length; i++) {');
                builder.appendLine('        try {');
                builder.appendLine('            var item = ' + collection.name + 'Collection[i];');
                builder.appendLine('            // Process item safely');
                builder.appendLine('        } catch (e) {');
                builder.appendLine('            // Handle individual item errors');
                builder.appendLine('        }');
                builder.appendLine('    }');
                builder.appendLine('}');
                builder.appendLine('');
            }
        }
        
        builder.appendLine('ES3 SAFETY RECOMMENDATIONS');
        builder.appendLine('---------------------------');
        builder.appendLine('1. Always use "in" operator to check property existence');
        builder.appendLine('2. Use objectHasOwnProperty() for object iteration');
        builder.appendLine('3. Wrap property access in try-catch blocks');
        builder.appendLine('4. Check collection length before iteration');
        builder.appendLine('5. Avoid dangerous properties (constructor, prototype)');
        builder.appendLine('6. Use timeout protection for long operations');
        builder.appendLine('7. Prefer ES3 helpers over modern JavaScript features');
        builder.appendLine('');
        
    } catch (exc) {
        builder.appendLine('Error generating access guide: ' + exc.message);
        builder.appendLine('');
    }
}

/**
 * Generate DOM tree section (enhanced)
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
        builder.appendLine('Error generating DOM tree: ' + exc.message);
        builder.appendLine('');
    }
}

/**
 * Recursively generate tree structure text (enhanced)
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
            var collectionInfo = domNode.collections.length + ' collections';
            
            // Enhanced collection info with sampling data
            var sampledCollections = 0;
            for (var i = 0; i < domNode.collections.length; i++) {
                if (domNode.collections[i].samplingData) {
                    sampledCollections++;
                }
            }
            
            if (sampledCollections > 0) {
                collectionInfo += ' (' + sampledCollections + ' sampled)';
            }
            
            info.push(collectionInfo);
        }
        
        if (domNode.methods && domNode.methods.length) {
            info.push(domNode.methods.length + ' methods');
        }
        
        if (domNode.objectMetadata && domNode.objectMetadata.isCircular) {
            info.push('CIRCULAR');
        }
        
        if (domNode.alternativeAccessPaths && domNode.alternativeAccessPaths.length > 0) {
            info.push('ALT PATHS: ' + domNode.alternativeAccessPaths.length);
        }
        
        if (info.length > 0) {
            nodeLine += ' [' + arrayJoin(info, ', ') + ']'; // Enhanced ES3 join
        }
        
        builder.appendLine(nodeLine);
        
        // Child nodes
        if (domNode.childNodes && domNode.childNodes.length) {
            var newPrefix = prefix + (isLast ? '    ' : '│   ');
            
            for (var j = 0; j < domNode.childNodes.length; j++) {
                var isLastChild = (j === domNode.childNodes.length - 1);
                generateDOMTreeText(builder, domNode.childNodes[j], newPrefix, isLastChild, config);
            }
        }
        
    } catch (exc) {
        builder.appendLine(prefix + '└── [Error displaying node: ' + exc.message + ']');
    }
}

// =============================================================================
// FILE OPERATIONS - ENHANCED
// =============================================================================

/**
 * Write content to file with enhanced metadata and InDesign version detection
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
        // Enhanced file path validation
        if (!filePath || typeof filePath !== 'string') {
            result.error = 'Invalid file path provided';
            return result;
        }
        
        var targetFile = new File(filePath);
        
        // Enhanced file access validation
        if (!targetFile.open('w')) {
            result.error = 'Could not open file for writing: ' + filePath;
            return result;
        }
        
        // Enhanced encoding detection based on InDesign version
        var encoding = 'UTF-8';
        try {
            // Check InDesign version for encoding compatibility
            if (app && app.version && stringIndexOf(app.version, 'CS') !== -1) {
                encoding = 'ASCII'; // Older CS versions may have UTF-8 issues
            }
        } catch (exc) {
            // Default to UTF-8
        }
        
        targetFile.encoding = encoding;
        
        // Write content with enhanced error checking
        var writeSuccess = false;
        try {
            writeSuccess = targetFile.write(content);
        } catch (writeExc) {
            targetFile.close();
            result.error = 'Failed to write content: ' + writeExc.message;
            return result;
        }
        
        targetFile.close();
        
        if (!writeSuccess) {
            result.error = 'Failed to write content to file';
            return result;
        }
        
        result.success = true;
        result.filePath = targetFile.fsName;
        result.metadata = {
            fileSize: content.length,
            encoding: encoding,
            writeTime: getCurrentTimestamp(),
            indesignCompatible: true
        };
        
        return result;
        
    } catch (exc) {
        result.error = 'File write error: ' + exc.message;
        return result;
    }
}

/**
 * Generate default file path (enhanced)
 * @param {Object} domStructure - DOM structure for naming
 * @param {String} extension - File extension
 * @returns {String} Generated file path with feature indicators
 */
function generateDefaultFilePath(domStructure, extension) {
    try {
        var docName = 'InDesignDocument';
        
        if (domStructure.metadata && domStructure.metadata.documentName) {
            // Enhanced filename sanitization
            docName = stringReplace(stringReplace(domStructure.metadata.documentName, ' ', '_'), '/', '_');
            // Remove other problematic characters
            docName = stringReplace(stringReplace(docName, '\\', '_'), ':', '_');
        }
        
        var timestamp = new Date();
        var timeStr = timestamp.getFullYear() + 
                     ('0' + (timestamp.getMonth() + 1)).slice(-2) + 
                     ('0' + timestamp.getDate()).slice(-2) + '_' +
                     ('0' + timestamp.getHours()).slice(-2) + 
                     ('0' + timestamp.getMinutes()).slice(-2);
        
        // Enhanced feature indicators
        var features = [];
        if (domStructure.metadata && domStructure.metadata.collectionSampling) {
            features.push('Collections');
        }
        if (domStructure.objectRegistry) {
            features.push('ObjRefs');
        }
        if (domStructure.metadata && domStructure.metadata.enhancedFeatures && domStructure.metadata.enhancedFeatures.es3Compliant) {
            features.push('ES3');
        }
        
        var featureString = features.length > 0 ? '_' + arrayJoin(features, '_') : '';
        
        var desktopPath = Folder.desktop.fsName;
        return desktopPath + '/' + docName + '_DOM_' + timeStr + featureString + '.' + extension;
        
    } catch (exc) {
        return Folder.desktop.fsName + '/InDesign_DOM_Export_' + new Date().getTime() + '.' + extension;
    }
}

// =============================================================================
// UTILITY FUNCTIONS - ENHANCED ES3 COMPLIANCE
// =============================================================================

/**
 * Merge export configuration (enhanced)
 * @param {Object} defaults - Default configuration
 * @param {Object} userOptions - User options
 * @returns {Object} Merged configuration
 */
function mergeExportConfig(defaults, userOptions) {
    var merged = objectClone(defaults, 2); // Enhanced cloning
    
    // Override with user options using enhanced iteration
    if (userOptions) {
        for (var key in userOptions) {
            if (objectHasOwnProperty(userOptions, key)) {
                merged[key] = userOptions[key];
            }
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
 * Get enabled features list (enhanced)
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
    
    // Add ES3 compliance indicator
    features.push('es3Compliant');
    
    return features;
}

/**
 * Generate access path index - Enhanced ES3 Compliance
 * @param {Object} domStructure - DOM structure
 * @returns {Object} Access path index
 */
function generateAccessPathIndex(domStructure) {
    try {
        var idx = {};
        
        if (domStructure.objectRegistry && domStructure.objectRegistry.accessPaths) {
            var accessPaths = domStructure.objectRegistry.accessPaths;
            
            // Enhanced ES3-compatible iteration
            for (var objectId in accessPaths) {
                if (objectHasOwnProperty(accessPaths, objectId)) {
                    idx[objectId] = arraySlice(accessPaths[objectId], 0); // Enhanced array copy
                }
            }
        }
        
        return idx;
        
    } catch (exc) {
        return {};
    }
}

/**
 * Generate Enhanced ES3-compatible JSON (improved from original)
 * @param {Object} exportData - Data to export
 * @param {Object} config - Configuration
 * @param {Object} metadata - Export metadata
 * @returns {String} ES3-compatible JSON string
 */
function generateEnhancedES3JSON(exportData, config, metadata) {
    try {
        var builder = createStringBuilder();
        
        builder.appendLine('{');
        builder.appendLine('  "metadata": {');
        builder.appendLine('    "exportFormat": "json",');
        builder.appendLine('    "exportTimestamp": "' + (metadata.exportTimestamp || getCurrentTimestamp()) + '",');
        builder.appendLine('    "version": "2.1.1",');
        builder.appendLine('    "es3Compliant": true,');
        builder.appendLine('    "comparisonFingerprint": "' + (metadata.comparisonFingerprint || 'unknown') + '"');
        builder.appendLine('  },');
        builder.appendLine('  "domStructure": ' + safeStringifyEnhanced(exportData.domStructure, 0, 4)); // Enhanced stringification
        
        if (exportData.objectReferenceMap) {
            builder.appendLine(',');
            builder.appendLine('  "objectReferenceMap": ' + safeStringifyEnhanced(exportData.objectReferenceMap, 0, 3));
        }
        
        if (exportData.accessPathIndex) {
            builder.appendLine(',');
            builder.appendLine('  "accessPathIndex": ' + safeStringifyEnhanced(exportData.accessPathIndex, 0, 2));
        }
        
        builder.appendLine('}');
        
        return builder.toString();
        
    } catch (exc) {
        return '{"error": "Enhanced ES3 JSON generation failed: ' + stringReplace(exc.message, '"', '\\"') + '"}';
    }
}

/**
 * Enhanced safe object stringification for ES3 with better depth handling
 * @param {Object} targetObj - Object to stringify
 * @param {Number} currentDepth - Current recursion depth
 * @param {Number} maxDepth - Maximum recursion depth
 * @returns {String} Stringified object
 */
function safeStringifyEnhanced(targetObj, currentDepth, maxDepth) {
    try {
        currentDepth = currentDepth || 0;
        maxDepth = maxDepth || 4;
        
        if (currentDepth >= maxDepth) {
            return '"[MAX_DEPTH_REACHED]"';
        }
        
        if (targetObj === null) return 'null';
        if (typeof targetObj === 'undefined') return 'undefined';
        if (typeof targetObj === 'string') return '"' + stringReplace(stringReplace(targetObj, '"', '\\"'), '\n', '\\n') + '"';
        if (typeof targetObj === 'number') return targetObj.toString();
        if (typeof targetObj === 'boolean') return targetObj.toString();
        
        if (typeof targetObj === 'object') {
            if (targetObj.constructor === Array || (typeof targetObj.length === 'number' && targetObj.length >= 0)) {
                var arrayParts = [];
                var arrayLength = Math.min(targetObj.length || 0, 50); // Limit array size
                
                for (var i = 0; i < arrayLength; i++) {
                    try {
                        if (i in targetObj) {
                            arrayParts.push(safeStringifyEnhanced(targetObj[i], currentDepth + 1, maxDepth));
                        } else {
                            arrayParts.push('null');
                        }
                    } catch (exc) {
                        arrayParts.push('"[STRINGIFY_ERROR]"');
                    }
                }
                
                return '[' + arrayJoin(arrayParts, ',') + ']'; // Enhanced ES3 join
            } else {
                var objectParts = [];
                var propertyCount = 0;
                var maxProperties = 25; // Increased limit for better data retention
                
                for (var key in targetObj) {
                    if (propertyCount >= maxProperties) break;
                    
                    try {
                        if (!objectHasOwnProperty(targetObj, key)) continue; // Enhanced property check
                        
                        // Skip dangerous properties
                        if (isDangerousProperty && isDangerousProperty(key)) continue;
                        
                        var val = safeStringifyEnhanced(targetObj[key], currentDepth + 1, maxDepth);
                        objectParts.push('"' + stringReplace(key, '"', '\\"') + '":' + val);
                        propertyCount++;
                    } catch (exc) {
                        // Skip properties that cause errors
                        continue;
                    }
                }
                
                return '{' + arrayJoin(objectParts, ',') + '}'; // Enhanced ES3 join
            }
        }
        
        return '"[' + typeof targetObj + ']"';
        
    } catch (exc) {
        return '"[STRINGIFY_ERROR]"';
    }
}

/**
 * Generate CSV rows from DOM node (enhanced)
 * @param {Object} domNode - DOM node
 * @param {Object} builder - String builder
 * @param {Object} config - Configuration
 */
function generateCSVRows(domNode, builder, config) {
    try {
        if (!domNode) return;
        
        // Add row for this node
        var altPaths = domNode.alternativeAccessPaths ? arrayJoin(domNode.alternativeAccessPaths, ';') : '';
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
            propCount,
            '"2.1.1"' // Module version
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
// MODULE REGISTRATION
// =============================================================================

// Register this module with all its functions
registerModule('5.0_dom-exporter', '2.1.1', [
    // Main Export Functions
    'exportDOMStructure',
    
    // Format-Specific Generators
    'generateTextExport', 'generateJSONExport', 'generateCSVExport',
    
    // Processing Functions
    'preprocessDOMForExport', 'generateComparisonFingerprint',
    
    // Report Generation
    'generateDocumentMetadataSection', 'generateStatisticsSection',
    'generateObjectReferenceAnalysisSection', 'generateComparisonDataSection',
    'generateAccessGuideSection', 'generateDOMTreeSection', 'generateDOMTreeText',
    
    // File Operations
    'writeToFile', 'generateDefaultFilePath',
    
    // Utilities
    'mergeExportConfig', 'getFileExtension', 'getEnabledFeatures',
    'generateAccessPathIndex', 'generateEnhancedES3JSON', 'safeStringifyEnhanced',
    'generateCSVRows'
]);

// =============================================================================
// END OF 5.0_dom-exporter.jsx
//
// ENHANCEMENTS IMPLEMENTED:
// - Added comprehensive dependency validation and module registration
// - Enhanced JSON handling with improved ES3 fallback (generateEnhancedES3JSON)
// - Fixed all for...in loops to use objectHasOwnProperty() consistently  
// - Enhanced safeStringifyEnhanced with better depth limits and safety checks
// - Added InDesign version detection for encoding compatibility
// - Improved array and string operations using ES3 helpers throughout
// - Enhanced error handling with comprehensive error boundaries
// - Added config object cloning to prevent mutations
// - Improved file I/O with better validation and fallback handling
// - All original functionality preserved and enhanced for production reliability
// =============================================================================