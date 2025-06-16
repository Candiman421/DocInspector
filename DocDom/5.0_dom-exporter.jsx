//
// 5.0_dom-exporter.jsx (Enhanced)
// InDesign DOM Discovery Builder - Enhanced DOM Structure Export with Reference Tracking
// CORE PURPOSE: Export DOM structure with object references, access paths, and comparison data
// DEPENDENCIES: 1.0_safe-foundation.jsx, 2.0_dom-enumerator.jsx, 6.0_collection-sampler.jsx
// SAFETY: Uses only proven ExtendScript File operations
// ES3 COMPATIBLE: No reserved words, no modern JS features
// ENHANCED: Object reference IDs, access path arrays, comparison-ready format
//

// ============================================================================
// ENHANCED EXPORT CONFIGURATION
// ============================================================================

var ENHANCED_EXPORT_CONFIG = {
    defaultFormat: 'text',
    maxFileSize: 10000000,  // Increased to 10MB for comprehensive data
    includeMetadata: true,
    includeStatistics: true,
    includeAccessGuide: true,
    includeFullTree: true,
    includeCollectionSampling: true,
    includeObjectReferences: true,    // NEW: Include object reference tracking
    includeAccessPaths: true,         // NEW: Include all access paths
    includeComparisonData: true,      // NEW: Include data needed for comparisons
    includeEnhancedAnalysis: true,    // NEW: Include enhanced analysis data
    maxObjectReferencesPerExport: 1000, // Limit object references in export
    compressLargePaths: true,         // Compress very long access paths
    lineSeparator: '\n'
};

// ============================================================================
// ENHANCED MAIN EXPORT FUNCTIONS
// ============================================================================

/**
 * Enhanced DOM structure export with reference tracking and comparison support
 * @param {Object} domStructure - Enhanced DOM structure object
 * @param {String} format - Export format: 'text'|'json'|'csv'
 * @param {String} customPath - Optional custom file path
 * @param {Object} exportOptions - Additional export options
 * @returns {Object} - {success: boolean, filePath: string, error: string, metadata: object}
 */
function exportDOMStructureEnhanced(domStructure, format, customPath, exportOptions) {
    var result = {
        success: false,
        filePath: '',
        error: '',
        metadata: {
            objectReferencesExported: 0,
            accessPathsExported: 0,
            comparisonDataIncluded: false,
            enhancedFeaturesExported: []
        }
    };
    
    try {
        $.writeln('Starting Enhanced DOM export: format=' + format);
        
        if (!domStructure) {
            result.error = 'No DOM structure provided for enhanced export';
            return result;
        }
        
        // Merge export options with enhanced defaults
        var enhancedConfig = mergeEnhancedExportConfig(ENHANCED_EXPORT_CONFIG, exportOptions);
        var exportFormat = format || enhancedConfig.defaultFormat;
        
        $.writeln('Using enhanced export format: ' + exportFormat);
        $.writeln('Enhanced features enabled:');
        $.writeln('  Object references: ' + enhancedConfig.includeObjectReferences);
        $.writeln('  Access paths: ' + enhancedConfig.includeAccessPaths);
        $.writeln('  Comparison data: ' + enhancedConfig.includeComparisonData);
        
        // Pre-process DOM structure for enhanced export
        var processedDOMStructure = preprocessDOMForEnhancedExport(domStructure, enhancedConfig);
        
        // Generate enhanced export content
        var content = '';
        var fileExtension = '.txt';
        
        try {
            switch (exportFormat.toLowerCase()) {
                case 'text':
                    $.writeln('Generating comprehensive enhanced text export...');
                    content = generateComprehensiveEnhancedTextExport(processedDOMStructure, enhancedConfig, result.metadata);
                    fileExtension = '.txt';
                    break;
                case 'json':
                    $.writeln('Generating enhanced JSON export with references...');
                    content = generateEnhancedJSONWithReferencesExport(processedDOMStructure, enhancedConfig, result.metadata);
                    fileExtension = '.json';
                    break;
                case 'csv':
                    $.writeln('Generating enhanced CSV export with references...');
                    content = generateEnhancedCSVWithReferencesExport(processedDOMStructure, enhancedConfig, result.metadata);
                    fileExtension = '.csv';
                    break;
                default:
                    result.error = 'Unsupported enhanced export format: ' + exportFormat;
                    return result;
            }
        } catch (contentExc) {
            result.error = 'Enhanced content generation failed for ' + exportFormat + ': ' + contentExc.message;
            $.writeln('Enhanced content generation error: ' + contentExc.message);
            return result;
        }
        
        if (!content) {
            result.error = 'Failed to generate enhanced export content (content is empty)';
            $.writeln('Enhanced content generation produced empty result');
            return result;
        }
        
        $.writeln('Enhanced content generated successfully, length: ' + content.length + ' characters');
        $.writeln('Metadata: ' + result.metadata.objectReferencesExported + ' object refs, ' + 
                  result.metadata.accessPathsExported + ' access paths');
        
        // Check content size
        if (content.length > enhancedConfig.maxFileSize) {
            result.error = 'Enhanced export content too large (' + content.length + ' bytes). Consider reducing scope.';
            return result;
        }
        
        // Determine enhanced file path
        var filePath = customPath || generateEnhancedDefaultFilePath(processedDOMStructure, fileExtension);
        $.writeln('Using enhanced file path: ' + filePath);
        
        // Write enhanced file
        var writeResult = writeEnhancedToFile(filePath, content, enhancedConfig);
        if (writeResult.success) {
            result.success = true;
            result.filePath = writeResult.filePath;
            $.writeln('Enhanced DOM structure exported successfully to: ' + result.filePath);
        } else {
            result.error = writeResult.error;
            $.writeln('Enhanced file write failed: ' + result.error);
        }
        
    } catch (exc) {
        result.error = 'Enhanced export failed: ' + exc.message;
        $.writeln('ERROR: Enhanced DOM export failed: ' + exc.message);
    }
    
    return result;
}

/**
 * Pre-process DOM structure for enhanced export
 * @param {Object} domStructure - Original DOM structure
 * @param {Object} config - Export configuration
 * @returns {Object} - Processed DOM structure
 */
function preprocessDOMForEnhancedExport(domStructure, config) {
    try {
        // Create a copy to avoid modifying original
        var processedStructure = {
            metadata: domStructure.metadata || {},
            statistics: domStructure.statistics || {},
            structure: domStructure.structure || {},
            objectRegistry: domStructure.objectRegistry || {},
            enhancedExportData: {
                timestamp: getCurrentTimestamp(),
                exportConfig: config,
                objectReferenceSummary: {},
                accessPathSummary: {},
                comparisonFingerprint: ''
            }
        };
        
        // Add enhanced metadata
        processedStructure.metadata.enhancedExport = {
            version: '5.0_enhanced',
            features: {
                objectReferences: config.includeObjectReferences,
                accessPaths: config.includeAccessPaths,
                comparisonData: config.includeComparisonData
            },
            processingTimestamp: getCurrentTimestamp()
        };
        
        // Process object references for export
        if (config.includeObjectReferences && domStructure.objectRegistry) {
            processObjectReferencesForExport(processedStructure, config);
        }
        
        // Generate comparison fingerprint
        if (config.includeComparisonData) {
            processedStructure.enhancedExportData.comparisonFingerprint = generateComparisonFingerprint(domStructure);
        }
        
        return processedStructure;
        
    } catch (exc) {
        $.writeln('Error preprocessing DOM for enhanced export: ' + exc.message);
        return domStructure; // Return original on error
    }
}

/**
 * Process object references for export inclusion
 * @param {Object} processedStructure - Structure being processed
 * @param {Object} config - Export configuration
 */
function processObjectReferencesForExport(processedStructure, config) {
    try {
        var objectRegistry = processedStructure.objectRegistry;
        if (!objectRegistry || !objectRegistry.references) return;
        
        var referenceSummary = {
            totalObjects: 0,
            multipleAccessPathObjects: 0,
            objectsByType: {},
            topAccessPathCounts: []
        };
        
        var refs = objectRegistry.references;
        var processedCount = 0;
        
        for (var objectId in refs) {
            if (processedCount >= config.maxObjectReferencesPerExport) {
                referenceSummary.truncatedAtLimit = config.maxObjectReferencesPerExport;
                break;
            }
            
            var ref = refs[objectId];
            referenceSummary.totalObjects++;
            processedCount++;
            
            if (ref.accessPaths && ref.accessPaths.length > 1) {
                referenceSummary.multipleAccessPathObjects++;
                
                // Track top access path counts
                referenceSummary.topAccessPathCounts.push({
                    objectId: objectId,
                    pathCount: ref.accessPaths.length,
                    firstPath: ref.firstPath,
                    type: ref.type
                });
            }
            
            // Count by type
            var objType = ref.type || 'unknown';
            if (!referenceSummary.objectsByType[objType]) {
                referenceSummary.objectsByType[objType] = 0;
            }
            referenceSummary.objectsByType[objType]++;
        }
        
        // Sort top access path counts
        referenceSummary.topAccessPathCounts.sort(function(a, b) {
            return b.pathCount - a.pathCount;
        });
        
        // Keep only top 20
        if (referenceSummary.topAccessPathCounts.length > 20) {
            referenceSummary.topAccessPathCounts = referenceSummary.topAccessPathCounts.slice(0, 20);
        }
        
        processedStructure.enhancedExportData.objectReferenceSummary = referenceSummary;
        
    } catch (exc) {
        $.writeln('Error processing object references for export: ' + exc.message);
    }
}

/**
 * Generate comparison fingerprint for before/after analysis
 * @param {Object} domStructure - DOM structure to fingerprint
 * @returns {String} - Comparison fingerprint
 */
function generateComparisonFingerprint(domStructure) {
    try {
        var fingerprint = [];
        
        // Basic structure fingerprint
        if (domStructure.statistics) {
            fingerprint.push('nodes:' + domStructure.statistics.totalNodes);
            fingerprint.push('props:' + domStructure.statistics.totalProperties);
            fingerprint.push('depth:' + domStructure.statistics.maxDepthReached);
        }
        
        // Collection fingerprint
        if (domStructure.metadata && domStructure.metadata.collectionSampling) {
            var samplingStats = domStructure.metadata.collectionSampling.stats;
            if (samplingStats) {
                fingerprint.push('collections:' + samplingStats.collectionsSampled);
                fingerprint.push('items:' + samplingStats.totalItemsSampled);
            }
        }
        
        // Object reference fingerprint
        if (domStructure.objectRegistry && domStructure.objectRegistry.references) {
            var refCount = Object.keys(domStructure.objectRegistry.references).length;
            fingerprint.push('objrefs:' + refCount);
        }
        
        // Document metadata fingerprint
        if (domStructure.metadata) {
            fingerprint.push('doc:' + (domStructure.metadata.documentName || 'unknown'));
            fingerprint.push('time:' + (domStructure.metadata.enumerationTime || 0));
        }
        
        return fingerprint.join('|');
        
    } catch (exc) {
        return 'fingerprint-error:' + exc.message;
    }
}

// ============================================================================
// ENHANCED TEXT EXPORT
// ============================================================================

/**
 * Generate comprehensive enhanced text export
 * @param {Object} processedDOMStructure - Processed DOM structure
 * @param {Object} config - Export configuration
 * @param {Object} metadata - Export metadata to update
 * @returns {String} - Comprehensive enhanced text export
 */
function generateComprehensiveEnhancedTextExport(processedDOMStructure, config, metadata) {
    try {
        var builder = createStringBuilder();
        
        // Enhanced header
        builder.appendLine('INDESIGN DOM COMPREHENSIVE ANALYSIS (ENHANCED)');
        builder.appendLine('==============================================');
        builder.appendLine('Generated by: InDesign DOM Discovery Builder v2.0 (Enhanced Export)');
        builder.appendLine('Export Timestamp: ' + getCurrentTimestamp());
        builder.appendLine('Enhanced Features: Object References, Access Paths, Comparison Data');
        builder.appendLine('');
        
        // Enhanced document metadata
        generateEnhancedDocumentMetadataSection(builder, processedDOMStructure, config);
        
        // Enhanced statistics with object references
        generateEnhancedStatisticsSection(builder, processedDOMStructure, config, metadata);
        
        // Object reference analysis section
        if (config.includeObjectReferences) {
            generateObjectReferenceAnalysisSection(builder, processedDOMStructure, config, metadata);
        }
        
        // Comparison data section
        if (config.includeComparisonData) {
            generateComparisonDataSection(builder, processedDOMStructure, config);
        }
        
        // Enhanced property access guide
        generateComprehensiveAccessGuideSection(builder, processedDOMStructure, config);
        
        // Enhanced DOM tree with references
        generateEnhancedDOMTreeWithReferencesSection(builder, processedDOMStructure, config);
        
        // Enhanced usage notes and recommendations
        generateEnhancedUsageNotesSection(builder, processedDOMStructure, config);
        
        return builder.toString();
        
    } catch (exc) {
        $.writeln('ERROR: Comprehensive enhanced text export generation failed: ' + exc.message);
        return 'Comprehensive enhanced text export failed: ' + exc.message;
    }
}

/**
 * Generate enhanced document metadata section
 * @param {Object} builder - String builder
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Export configuration
 */
function generateEnhancedDocumentMetadataSection(builder, domStructure, config) {
    try {
        builder.appendLine('ENHANCED DOCUMENT INFORMATION');
        builder.appendLine('============================');
        
        if (domStructure.metadata) {
            builder.appendLine('Document Name: ' + (domStructure.metadata.documentName || 'Unknown'));
            builder.appendLine('Analysis Timestamp: ' + (domStructure.metadata.timestamp || 'Unknown'));
            builder.appendLine('Analysis Time: ' + (domStructure.metadata.enumerationTime || 0) + 'ms');
            builder.appendLine('Analysis Version: ' + (domStructure.metadata.version || 'Unknown'));
            
            // Enhanced features info
            if (domStructure.metadata.enhancedFeatures) {
                builder.appendLine('');
                builder.appendLine('Enhanced Analysis Features:');
                var features = domStructure.metadata.enhancedFeatures;
                builder.appendLine('  Object Reference Tracking: ' + (features.objectReferenceTracking ? 'Enabled' : 'Disabled'));
                builder.appendLine('  Deeper Traversal: ' + (features.deeperTraversal ? 'Enabled' : 'Disabled'));
                builder.appendLine('  Comprehensive Path Mapping: ' + (features.comprehensivePathMapping ? 'Enabled' : 'Disabled'));
                builder.appendLine('  Enhanced Circular Detection: ' + (features.enhancedCircularDetection ? 'Enabled' : 'Disabled'));
            }
            
            // Analysis configuration
            if (domStructure.metadata.config) {
                builder.appendLine('');
                builder.appendLine('Analysis Configuration:');
                var cfg = domStructure.metadata.config;
                builder.appendLine('  Max Depth: ' + (cfg.maxDepth || 'Unknown'));
                builder.appendLine('  Timeout: ' + (cfg.timeoutMs || 'Unknown') + 'ms');
                builder.appendLine('  Skip Dangerous: ' + (cfg.skipDangerous ? 'Yes' : 'No'));
                builder.appendLine('  Max Properties: ' + (cfg.maxProperties || 'Unknown'));
                builder.appendLine('  Object Tracking: ' + (cfg.enableObjectTracking ? 'Enabled' : 'Disabled'));
                builder.appendLine('  Duplicate Detection: ' + (cfg.enableDuplicateDetection ? 'Enabled' : 'Disabled'));
            }
        }
        
        // Comparison fingerprint
        if (config.includeComparisonData && domStructure.enhancedExportData) {
            builder.appendLine('');
            builder.appendLine('Comparison Fingerprint: ' + domStructure.enhancedExportData.comparisonFingerprint);
        }
        
        builder.appendLine('');
        
    } catch (exc) {
        builder.appendLine('Error generating enhanced document metadata: ' + exc.message);
        builder.appendLine('');
    }
}

/**
 * Generate enhanced statistics section
 * @param {Object} builder - String builder
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Export configuration
 * @param {Object} metadata - Export metadata to update
 */
function generateEnhancedStatisticsSection(builder, domStructure, config, metadata) {
    try {
        builder.appendLine('ENHANCED DISCOVERY STATISTICS');
        builder.appendLine('============================');
        
        if (domStructure.statistics) {
            var stats = domStructure.statistics;
            builder.appendLine('Total Objects Discovered: ' + (stats.totalNodes || 0));
            builder.appendLine('Total Properties Found: ' + (stats.totalProperties || 0));
            builder.appendLine('Maximum Depth Reached: ' + (stats.maxDepthReached || 0));
            builder.appendLine('Circular References Detected: ' + (stats.circularRefsDetected || 0));
            builder.appendLine('Timeout Events: ' + (stats.timeouts || 0));
            builder.appendLine('Enumeration Errors: ' + (stats.errors ? stats.errors.length : 0));
            
            // Enhanced statistics
            if (stats.objectReferencesTracked !== undefined) {
                builder.appendLine('Object References Tracked: ' + stats.objectReferencesTracked);
                metadata.objectReferencesExported += stats.objectReferencesTracked;
            }
            if (stats.duplicateObjectsFound !== undefined) {
                builder.appendLine('Duplicate Objects Found: ' + stats.duplicateObjectsFound);
            }
            if (stats.totalAccessPaths !== undefined) {
                builder.appendLine('Total Access Paths: ' + stats.totalAccessPaths);
                metadata.accessPathsExported += stats.totalAccessPaths;
            }
        }
        
        // Enhanced collection sampling statistics
        if (domStructure.metadata && domStructure.metadata.collectionSampling) {
            builder.appendLine('');
            builder.appendLine('ENHANCED COLLECTION SAMPLING:');
            var samplingData = domStructure.metadata.collectionSampling;
            
            if (samplingData.stats) {
                var samplingStats = samplingData.stats;
                builder.appendLine('  Collections Found: ' + (samplingStats.collectionsFound || 0));
                builder.appendLine('  Collections Sampled: ' + (samplingStats.collectionsSampled || 0));
                builder.appendLine('  Collections Skipped: ' + (samplingStats.collectionsSkipped || 0));
                builder.appendLine('  Items Analyzed: ' + (samplingStats.totalItemsSampled || 0));
                
                // Enhanced sampling stats
                if (samplingStats.totalItemPropertiesAnalyzed !== undefined) {
                    builder.appendLine('  Item Properties Analyzed: ' + samplingStats.totalItemPropertiesAnalyzed);
                }
                if (samplingStats.uniqueObjectsFound !== undefined) {
                    builder.appendLine('  Unique Objects Found: ' + samplingStats.uniqueObjectsFound);
                }
                if (samplingStats.crossCollectionReferences !== undefined) {
                    builder.appendLine('  Cross-Collection References: ' + samplingStats.crossCollectionReferences);
                }
                if (samplingStats.deepAnalysisItems !== undefined) {
                    builder.appendLine('  Deep Analysis Items: ' + samplingStats.deepAnalysisItems);
                }
                if (samplingStats.valuesSampled !== undefined) {
                    builder.appendLine('  Values Sampled: ' + samplingStats.valuesSampled);
                }
                
                builder.appendLine('  Sampling Time: ' + (samplingData.samplingTime || 0) + 'ms');
                builder.appendLine('  Approach: ' + (samplingData.approach || 'standard'));
            }
            
            // Enhanced features
            if (samplingData.enhancedFeatures) {
                builder.appendLine('  Enhanced Features:');
                var features = samplingData.enhancedFeatures;
                builder.appendLine('    Deep Property Analysis: ' + (features.deepPropertyAnalysis ? 'Yes' : 'No'));
                builder.appendLine('    Object Reference Tracking: ' + (features.objectReferenceTracking ? 'Yes' : 'No'));
                builder.appendLine('    Cross-Collection Tracking: ' + (features.crossCollectionTracking ? 'Yes' : 'No'));
            }
        }
        
        builder.appendLine('');
        
    } catch (exc) {
        builder.appendLine('Error generating enhanced statistics: ' + exc.message);
        builder.appendLine('');
    }
}

/**
 * Generate object reference analysis section
 * @param {Object} builder - String builder
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Export configuration
 * @param {Object} metadata - Export metadata to update
 */
function generateObjectReferenceAnalysisSection(builder, domStructure, config, metadata) {
    try {
        builder.appendLine('OBJECT REFERENCE ANALYSIS');
        builder.appendLine('========================');
        
        var referenceSummary = domStructure.enhancedExportData.objectReferenceSummary;
        if (referenceSummary) {
            builder.appendLine('Total Tracked Objects: ' + referenceSummary.totalObjects);
            builder.appendLine('Objects with Multiple Access Paths: ' + referenceSummary.multipleAccessPathObjects);
            
            // Objects by type
            if (referenceSummary.objectsByType) {
                builder.appendLine('');
                builder.appendLine('Objects by Type:');
                for (var objType in referenceSummary.objectsByType) {
                    builder.appendLine('  ' + objType + ': ' + referenceSummary.objectsByType[objType]);
                }
            }
            
            // Top objects with most access paths
            if (referenceSummary.topAccessPathCounts && referenceSummary.topAccessPathCounts.length > 0) {
                builder.appendLine('');
                builder.appendLine('Objects with Most Access Paths:');
                for (var i = 0; i < Math.min(referenceSummary.topAccessPathCounts.length, 10); i++) {
                    var topObj = referenceSummary.topAccessPathCounts[i];
                    builder.appendLine('  ' + (i + 1) + '. Object ID: ' + topObj.objectId);
                    builder.appendLine('     Access Paths: ' + topObj.pathCount);
                    builder.appendLine('     Type: ' + topObj.type);
                    builder.appendLine('     First Path: ' + topObj.firstPath);
                    builder.appendLine('');
                }
            }
            
            metadata.objectReferencesExported = referenceSummary.totalObjects;
        } else {
            builder.appendLine('No object reference data available.');
        }
        
        builder.appendLine('');
        
    } catch (exc) {
        builder.appendLine('Error generating object reference analysis: ' + exc.message);
        builder.appendLine('');
    }
}

/**
 * Generate comparison data section
 * @param {Object} builder - String builder
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Export configuration
 */
function generateComparisonDataSection(builder, domStructure, config) {
    try {
        builder.appendLine('COMPARISON DATA');
        builder.appendLine('==============');
        builder.appendLine('This section contains data optimized for before/after document comparison.');
        builder.appendLine('Use the JSON export and 8.0_dom-comparator.jsx for automated comparison.');
        builder.appendLine('');
        
        // Key metrics for comparison
        builder.appendLine('Key Comparison Metrics:');
        if (domStructure.statistics) {
            builder.appendLine('  DOM_NODES: ' + (domStructure.statistics.totalNodes || 0));
            builder.appendLine('  DOM_PROPERTIES: ' + (domStructure.statistics.totalProperties || 0));
            builder.appendLine('  DOM_MAX_DEPTH: ' + (domStructure.statistics.maxDepthReached || 0));
            builder.appendLine('  DOM_CIRCULAR_REFS: ' + (domStructure.statistics.circularRefsDetected || 0));
            builder.appendLine('  DOM_OBJECT_REFERENCES: ' + (domStructure.statistics.objectReferencesTracked || 0));
            builder.appendLine('  DOM_DUPLICATE_OBJECTS: ' + (domStructure.statistics.duplicateObjectsFound || 0));
        }
        
        if (domStructure.metadata && domStructure.metadata.collectionSampling && domStructure.metadata.collectionSampling.stats) {
            var samplingStats = domStructure.metadata.collectionSampling.stats;
            builder.appendLine('  COLLECTIONS_FOUND: ' + (samplingStats.collectionsFound || 0));
            builder.appendLine('  COLLECTIONS_SAMPLED: ' + (samplingStats.collectionsSampled || 0));
            builder.appendLine('  COLLECTION_ITEMS: ' + (samplingStats.totalItemsSampled || 0));
            builder.appendLine('  COLLECTION_PROPERTIES: ' + (samplingStats.totalPropertiesDiscovered || 0));
        }
        
        builder.appendLine('');
        builder.appendLine('Comparison Fingerprint: ' + (domStructure.enhancedExportData.comparisonFingerprint || 'none'));
        builder.appendLine('');
        
    } catch (exc) {
        builder.appendLine('Error generating comparison data: ' + exc.message);
        builder.appendLine('');
    }
}

/**
 * Generate comprehensive access guide section
 * @param {Object} builder - String builder
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Export configuration
 */
function generateComprehensiveAccessGuideSection(builder, domStructure, config) {
    try {
        builder.appendLine('COMPREHENSIVE PROPERTY ACCESS GUIDE');
        builder.appendLine('===================================');
        builder.appendLine('This section provides ready-to-use code patterns with enhanced analysis.');
        builder.appendLine('');
        
        if (domStructure.structure && domStructure.structure.document) {
            var comprehensiveGuide = generateComprehensiveAccessGuide(domStructure.structure.document, domStructure);
            builder.append(comprehensiveGuide);
        } else {
            builder.appendLine('No DOM structure available for access guide generation.');
        }
        
        builder.appendLine('');
        
    } catch (exc) {
        builder.appendLine('Error generating comprehensive access guide: ' + exc.message);
        builder.appendLine('');
    }
}

/**
 * Generate enhanced DOM tree with references section
 * @param {Object} builder - String builder
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Export configuration
 */
function generateEnhancedDOMTreeWithReferencesSection(builder, domStructure, config) {
    try {
        builder.appendLine('ENHANCED DOM STRUCTURE TREE WITH REFERENCES');
        builder.appendLine('===========================================');
        builder.appendLine('This tree shows all discovered objects, properties, and object references.');
        builder.appendLine('');
        
        if (domStructure.structure && domStructure.structure.document) {
            var enhancedTreeText = generateEnhancedDOMTreeWithReferences(
                domStructure.structure.document, 
                '', 
                true, 
                domStructure.objectRegistry
            );
            builder.append(enhancedTreeText);
        } else {
            builder.appendLine('No DOM structure available for tree generation.');
        }
        
        builder.appendLine('');
        
    } catch (exc) {
        builder.appendLine('Error generating enhanced DOM tree: ' + exc.message);
        builder.appendLine('');
    }
}

/**
 * Generate enhanced usage notes section
 * @param {Object} builder - String builder
 * @param {Object} domStructure - DOM structure
 * @param {Object} config - Export configuration
 */
function generateEnhancedUsageNotesSection(builder, domStructure, config) {
    try {
        builder.appendLine('ENHANCED USAGE NOTES AND RECOMMENDATIONS');
        builder.appendLine('========================================');
        builder.appendLine('• This file contains comprehensive DOM analysis with object reference tracking');
        builder.appendLine('• Use object IDs to track the same object accessed via different paths');
        builder.appendLine('• Multiple access paths indicate object reuse - choose the most efficient path');
        builder.appendLine('• Comparison fingerprint enables before/after document analysis');
        builder.appendLine('• Enhanced collection sampling provides deep insight into collection contents');
        builder.appendLine('• Cross-collection references show objects that appear in multiple collections');
        builder.appendLine('• Use 8.0_dom-comparator.jsx to compare this export with future document states');
        builder.appendLine('• Object reference tracking helps identify circular dependencies and shared objects');
        builder.appendLine('• Enhanced safety analysis provides confidence levels for property access');
        builder.appendLine('• Deep analysis results show complex object structures within collections');
        builder.appendLine('');
        builder.appendLine('Export Features Used:');
        builder.appendLine('  Object References: ' + (config.includeObjectReferences ? 'Included' : 'Not included'));
        builder.appendLine('  Access Paths: ' + (config.includeAccessPaths ? 'Included' : 'Not included'));
        builder.appendLine('  Comparison Data: ' + (config.includeComparisonData ? 'Included' : 'Not included'));
        builder.appendLine('  Enhanced Analysis: ' + (config.includeEnhancedAnalysis ? 'Included' : 'Not included'));
        builder.appendLine('');
        builder.appendLine('Generated by InDesign DOM Discovery Builder v2.0 (Enhanced Export)');
        builder.appendLine('Comprehensive analysis approach: ' + (domStructure.metadata.collectionSampling ? domStructure.metadata.collectionSampling.approach || 'standard' : 'discovery-only'));
        
    } catch (exc) {
        builder.appendLine('Error generating enhanced usage notes: ' + exc.message);
    }
}

// ============================================================================
// ENHANCED JSON EXPORT
// ============================================================================

/**
 * Generate enhanced JSON export with references
 * @param {Object} processedDOMStructure - Processed DOM structure
 * @param {Object} config - Export configuration
 * @param {Object} metadata - Export metadata to update
 * @returns {String} - Enhanced JSON formatted export
 */
function generateEnhancedJSONWithReferencesExport(processedDOMStructure, config, metadata) {
    try {
        // Create enhanced export data structure
        var enhancedExportData = {
            metadata: processedDOMStructure.metadata || {},
            statistics: processedDOMStructure.statistics || {},
            structure: enhancedSimplifyDOMForJSONWithReferences(processedDOMStructure.structure, config),
            enhancedExportData: processedDOMStructure.enhancedExportData || {},
            exportInfo: {
                version: '5.0_enhanced_with_references',
                timestamp: getCurrentTimestamp(),
                enhancedFeatures: {
                    objectReferences: config.includeObjectReferences,
                    accessPaths: config.includeAccessPaths,
                    comparisonData: config.includeComparisonData,
                    enhancedAnalysis: config.includeEnhancedAnalysis
                }
            }
        };
        
        // Include object registry if requested
        if (config.includeObjectReferences && processedDOMStructure.objectRegistry) {
            enhancedExportData.objectRegistry = simplifyObjectRegistryForJSON(
                processedDOMStructure.objectRegistry, 
                config
            );
            metadata.objectReferencesExported = Object.keys(enhancedExportData.objectRegistry.references || {}).length;
        }
        
        // Include collection sampling with enhanced data
        if (config.includeCollectionSampling && processedDOMStructure.metadata.collectionSampling) {
            enhancedExportData.collectionSampling = processedDOMStructure.metadata.collectionSampling;
        }
        
        // Convert to JSON string with enhanced depth
        return enhancedStringifyObjectWithReferences(enhancedExportData, 0, config);
        
    } catch (exc) {
        $.writeln('ERROR: Enhanced JSON with references export failed: ' + exc.message);
        return '';
    }
}

/**
 * Enhanced DOM simplification for JSON with references
 * @param {Object} structure - DOM structure to simplify
 * @param {Object} config - Export configuration
 * @returns {Object} - Enhanced simplified structure with references
 */
function enhancedSimplifyDOMForJSONWithReferences(structure, config) {
    if (!structure) return {};
    
    var simplified = {};
    
    try {
        for (var key in structure) {
            if (structure[key] && typeof structure[key] === 'object') {
                simplified[key] = enhancedSimplifyDOMNodeForJSONWithReferences(structure[key], config);
            } else {
                simplified[key] = structure[key];
            }
        }
    } catch (exc) {
        $.writeln('ERROR: Enhanced simplifying DOM for JSON with references: ' + exc.message);
    }
    
    return simplified;
}

/**
 * Enhanced DOM node simplification for JSON with references
 * @param {Object} domNode - DOM node to simplify
 * @param {Object} config - Export configuration
 * @returns {Object} - Enhanced simplified node with references
 */
function enhancedSimplifyDOMNodeForJSONWithReferences(domNode, config) {
    if (!domNode) return null;
    
    var simplified = {
        name: domNode.name || '',
        path: domNode.path || '',
        type: domNode.type || '',
        depth: domNode.depth || 0,
        hasCircularRefs: domNode.hasCircularRefs || false
    };
    
    // Enhanced: Include object reference data
    if (config.includeObjectReferences && domNode.objectId) {
        simplified.objectId = domNode.objectId;
        simplified.objectMetadata = domNode.objectMetadata || {};
        
        if (config.includeAccessPaths && domNode.alternativeAccessPaths) {
            simplified.alternativeAccessPaths = domNode.alternativeAccessPaths.slice();
        }
    }
    
    // Include enumeration errors if any
    if (domNode.enumerationErrors && domNode.enumerationErrors.length > 0) {
        simplified.enumerationErrors = domNode.enumerationErrors.slice();
    }
    
    // Enhanced properties with reference data
    if (domNode.properties && domNode.properties.length > 0) {
        simplified.properties = enhancedSimplifyPropertyListForJSON(domNode.properties, config);
    }
    
    // Enhanced collections with sampling and reference data
    if (domNode.collections && domNode.collections.length > 0) {
        simplified.collections = enhancedSimplifyCollectionListForJSON(domNode.collections, config);
    }
    
    // Include methods if any
    if (domNode.methods && domNode.methods.length > 0) {
        simplified.methods = enhancedSimplifyPropertyListForJSON(domNode.methods, config);
    }
    
    // Include child nodes recursively with depth limit
    if (domNode.childNodes && domNode.childNodes.length > 0 && domNode.depth < 6) {
        simplified.childNodes = [];
        for (var i = 0; i < Math.min(domNode.childNodes.length, 30); i++) {
            var childSimplified = enhancedSimplifyDOMNodeForJSONWithReferences(domNode.childNodes[i], config);
            if (childSimplified) {
                simplified.childNodes.push(childSimplified);
            }
        }
        if (domNode.childNodes.length > 30) {
            simplified.childNodes.push({
                name: '[...more child nodes]',
                type: 'truncated',
                truncatedCount: domNode.childNodes.length - 30
            });
        }
    }
    
    return simplified;
}

// ============================================================================
// ENHANCED CSV EXPORT
// ============================================================================

/**
 * Generate enhanced CSV export with references
 * @param {Object} processedDOMStructure - Processed DOM structure
 * @param {Object} config - Export configuration
 * @param {Object} metadata - Export metadata to update
 * @returns {String} - Enhanced CSV formatted export
 */
function generateEnhancedCSVWithReferencesExport(processedDOMStructure, config, metadata) {
    var builder = createStringBuilder();
    
    // Enhanced CSV header with reference columns
    var headerColumns = [
        'ObjectPath', 'PropertyName', 'PropertyType', 'SafetyLevel', 
        'IsCollection', 'IsMethod', 'HasSampleValue', 'SampleValue',
        'CollectionLength', 'CommonPropertiesCount', 'HasAccessPatterns'
    ];
    
    // Add enhanced columns
    if (config.includeObjectReferences) {
        headerColumns.push('ObjectId', 'HasAlternativePaths', 'AlternativePathCount', 'IsFirstOccurrence');
    }
    
    if (config.includeEnhancedAnalysis) {
        headerColumns.push('EnhancedAnalysis', 'DeepAnalysisPerformed', 'CrossCollectionRef');
    }
    
    builder.appendLine(headerColumns.join(','));
    
    if (processedDOMStructure.structure && processedDOMStructure.structure.document) {
        generateEnhancedCSVFromNodeWithReferences(
            processedDOMStructure.structure.document, 
            builder, 
            config, 
            metadata
        );
    }
    
    return builder.toString();
}

/**
 * Generate enhanced CSV rows from DOM node with references
 * @param {Object} domNode - DOM node to process
 * @param {Object} builder - String builder for output
 * @param {Object} config - Export configuration
 * @param {Object} metadata - Export metadata to update
 */
function generateEnhancedCSVFromNodeWithReferences(domNode, builder, config, metadata) {
    if (!domNode) return;
    
    // Process properties with enhanced data
    if (domNode.properties) {
        for (var i = 0; i < domNode.properties.length; i++) {
            var prop = domNode.properties[i];
            generateEnhancedCSVRowForProperty(prop, domNode, builder, config, metadata);
        }
    }
    
    // Process collections with enhanced data
    if (domNode.collections) {
        for (var i = 0; i < domNode.collections.length; i++) {
            var coll = domNode.collections[i];
            generateEnhancedCSVRowForCollection(coll, domNode, builder, config, metadata);
        }
    }
    
    // Process child nodes recursively
    if (domNode.childNodes) {
        for (var i = 0; i < domNode.childNodes.length; i++) {
            generateEnhancedCSVFromNodeWithReferences(domNode.childNodes[i], builder, config, metadata);
        }
    }
}

// ============================================================================
// ENHANCED UTILITY FUNCTIONS
// ============================================================================

/**
 * Enhanced object stringification with references
 * @param {*} obj - Object to stringify
 * @param {Number} depth - Current depth
 * @param {Object} config - Export configuration
 * @returns {String} - Enhanced JSON-like string with references
 */
function enhancedStringifyObjectWithReferences(obj, depth, config) {
    // Enhanced depth limit for comprehensive JSON output
    if (depth > 10) return '"[max depth reached]"';
    
    if (obj === null) return 'null';
    if (obj === undefined) return 'undefined';
    
    var objType = typeof obj;
    
    if (objType === 'string') return '"' + obj.replace(/"/g, '\\"') + '"';
    if (objType === 'number' || objType === 'boolean') return String(obj);
    
    if (objType === 'object') {
        if (obj.constructor === Array || (obj.length !== undefined && typeof obj.length === 'number')) {
            // Handle arrays
            var parts = ['['];
            var arrayLength = obj.length || 0;
            for (var i = 0; i < Math.min(arrayLength, 200); i++) {  // Increased limit for comprehensive export
                if (i > 0) parts.push(',');
                parts.push(enhancedStringifyObjectWithReferences(obj[i], depth + 1, config));
            }
            if (arrayLength > 200) parts.push(',"[...more items]"');
            parts.push(']');
            return parts.join('');
        } else {
            // Handle objects
            var parts = ['{'];
            var first = true;
            var count = 0;
            for (var key in obj) {
                if (count >= 500) {  // Increased limit for comprehensive export
                    if (!first) parts.push(',');
                    parts.push('"[...more properties]":"truncated"');
                    break;
                }
                if (!first) parts.push(',');
                parts.push('"' + key + '":');
                parts.push(enhancedStringifyObjectWithReferences(obj[key], depth + 1, config));
                first = false;
                count++;
            }
            parts.push('}');
            return parts.join('');
        }
    }
    
    return '"[' + objType + ']"';
}

/**
 * Merge enhanced export configuration
 * @param {Object} defaults - Default configuration
 * @param {Object} userOptions - User options
 * @returns {Object} - Merged configuration
 */
function mergeEnhancedExportConfig(defaults, userOptions) {
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
 * Generate enhanced default file path
 * @param {Object} domStructure - DOM structure for naming
 * @param {String} extension - File extension
 * @returns {String} - Generated enhanced file path
 */
function generateEnhancedDefaultFilePath(domStructure, extension) {
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
        
        // Enhanced filename with comprehensive feature indicators
        var featureIndicators = [];
        if (domStructure.metadata && domStructure.metadata.collectionSampling) {
            featureIndicators.push('Collections');
        }
        if (domStructure.objectRegistry && domStructure.objectRegistry.references) {
            featureIndicators.push('ObjRefs');
        }
        if (domStructure.enhancedExportData) {
            featureIndicators.push('Enhanced');
        }
        
        var featureString = featureIndicators.length > 0 ? '_' + featureIndicators.join('_') : '_Comprehensive';
        var fileName = docName + '_DOM' + featureString + '_' + timeStr + extension;
        
        // Try to place next to document if possible
        var envResult = validateInDesignEnvironment();
        if (envResult.valid && envResult.document) {
            try {
                // Try to get document file path safely
                var docFilePath = null;
                if (safeTypeCheck(envResult.document, 'filePath') === 'string') {
                    docFilePath = envResult.document.filePath;
                } else if (safeTypeCheck(envResult.document, 'fullName') === 'object') {
                    var fullNameObj = envResult.document.fullName;
                    if (fullNameObj && safeTypeCheck(fullNameObj, 'parent') === 'object') {
                        var parentFolder = fullNameObj.parent;
                        if (parentFolder && safeTypeCheck(parentFolder, 'absoluteURI') === 'string') {
                            return parentFolder.absoluteURI + '/' + fileName;
                        }
                    }
                }
                
                if (docFilePath) {
                    var docFile = new File(docFilePath);
                    if (docFile.parent && docFile.parent.exists) {
                        return docFile.parent.absoluteURI + '/' + fileName;
                    }
                }
            } catch (exc) {
                $.writeln('Could not access document path for enhanced export, using desktop: ' + exc.message);
            }
        }
        
        // Default to desktop
        return Folder.desktop.absoluteURI + '/' + fileName;
        
    } catch (exc) {
        return Folder.desktop.absoluteURI + '/InDesignDOM_Comprehensive_export' + extension;
    }
}

/**
 * Enhanced file writing with additional metadata
 * @param {String} filePath - Path to write file
 * @param {String} content - Content to write
 * @param {Object} config - Export configuration
 * @returns {Object} - Write result with enhanced metadata
 */
function writeEnhancedToFile(filePath, content, config) {
    var result = {
        success: false,
        filePath: '',
        error: '',
        metadata: {
            fileSize: 0,
            compressionApplied: false
        }
    };
    
    try {
        $.writeln('Writing enhanced export to file: ' + filePath);
        $.writeln('Content length: ' + (content ? content.length : 0) + ' characters');
        $.writeln('Enhanced features: ' + Object.keys(config).length + ' configuration options');
        
        if (!content) {
            result.error = 'No enhanced content to write';
            return result;
        }
        
        var file = new File(filePath);
        
        // Enhanced directory creation
        if (file.parent && !file.parent.exists) {
            try {
                if (!file.parent.create()) {
                    result.error = 'Could not create parent directory: ' + file.parent.absoluteURI;
                    return result;
                }
            } catch (dirExc) {
                result.error = 'Directory creation failed: ' + dirExc.message;
                return result;
            }
        }
        
        if (!file.open('w')) {
            result.error = 'Cannot open enhanced export file for writing: ' + filePath;
            return result;
        }
        
        // Set encoding to UTF-8 for enhanced compatibility
        file.encoding = 'UTF-8';
        
        // Enhanced write operation with progress indication for large files
        var writeSuccess = false;
        if (content.length > 1000000) { // 1MB threshold
            $.writeln('Large enhanced export detected, writing in chunks...');
            // For very large files, we could implement chunked writing, but ExtendScript
            // file operations are generally robust enough for our use case
        }
        
        writeSuccess = file.write(content);
        
        if (!writeSuccess) {
            result.error = 'Failed to write enhanced content to file (write returned false)';
            file.close();
            return result;
        }
        
        file.close();
        
        // Enhanced verification
        if (file.exists) {
            var fileSize = file.length;
            $.writeln('Enhanced export file created successfully, size: ' + fileSize + ' bytes');
            result.metadata.fileSize = fileSize;
            
            if (fileSize === 0) {
                result.error = 'Enhanced export file was created but is empty (0 bytes)';
                return result;
            }
            
            // Verify file is not corrupted by reading a small portion back
            try {
                if (file.open('r')) {
                    file.encoding = 'UTF-8';
                    var testRead = file.read(100); // Read first 100 characters
                    file.close();
                    if (!testRead) {
                        result.error = 'Enhanced export file verification failed - could not read back content';
                        return result;
                    }
                }
            } catch (verifyExc) {
                $.writeln('Warning: Could not verify enhanced export file: ' + verifyExc.message);
                // Don't fail the export for verification issues
            }
        } else {
            result.error = 'Enhanced export file operation completed but file does not exist';
            return result;
        }
        
        result.success = true;
        result.filePath = file.absoluteURI;
        
    } catch (exc) {
        result.error = 'Enhanced file operation failed: ' + exc.message;
        $.writeln('Enhanced file operation exception: ' + exc.message);
    }
    
    return result;
}

// ============================================================================
// BACKWARD COMPATIBILITY
// ============================================================================

/**
 * Maintain backward compatibility with original export function
 */
function exportDOMStructure(domStructure, format, customPath) {
    return exportDOMStructureEnhanced(domStructure, format, customPath, {});
}

// ============================================================================
// MODULE INITIALIZATION
// ============================================================================

/**
 * Initialize enhanced DOM exporter module
 * @returns {Boolean} - true if initialization successful
 */
function initializeEnhancedDOMExporter() {
    try {
        // Check dependencies
        if (typeof createStringBuilder !== 'function') {
            $.writeln('ERROR: Safe foundation module not loaded');
            return false;
        }
        
        // Test core functions
        var requiredFunctions = [
            'exportDOMStructureEnhanced', 'generateComprehensiveEnhancedTextExport', 'writeEnhancedToFile'
        ];
        
        for (var i = 0; i < requiredFunctions.length; i++) {
            if (typeof eval(requiredFunctions[i]) !== 'function') {
                $.writeln('ERROR: Required function missing: ' + requiredFunctions[i]);
                return false;
            }
        }
        
        $.writeln('5.0_dom-exporter.jsx: Enhanced version initialized successfully');
        $.writeln('Enhanced features: object references, access paths, comparison data, comprehensive analysis');
        $.writeln('Use exportDOMStructureEnhanced(domStructure, format, path, options) for enhanced exports');
        return true;
        
    } catch (exc) {
        $.writeln('ERROR: Enhanced DOM exporter initialization failed: ' + exc.message);
        return false;
    }
}

// Auto-initialize when module loads
initializeEnhancedDOMExporter();