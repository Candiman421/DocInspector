//
// 5.0_dom-exporter.jsx
// InDesign DOM Discovery Builder - DOM Structure Export
// CORE PURPOSE: Export DOM structure to various file formats
// DEPENDENCIES: 1.0_safe-foundation.jsx, 2.0_dom-enumerator.jsx
// SAFETY: Uses only proven ExtendScript File operations
// ES3 COMPATIBLE: No reserved words, no modern JS features
//

// ============================================================================
// EXPORT CONFIGURATION
// ============================================================================

var EXPORT_CONFIG = {
    defaultFormat: 'text',
    maxFileSize: 5000000,  // 5MB limit
    includeMetadata: true,
    includeStatistics: true,
    includeAccessGuide: true,
    includeFullTree: true,
    lineSeparator: '\n'
};

// ============================================================================
// MAIN EXPORT FUNCTIONS
// ============================================================================

/**
 * Export DOM structure to file
 * @param {Object} domStructure - DOM structure object
 * @param {String} format - Export format: 'text'|'json'|'csv'
 * @param {String} customPath - Optional custom file path
 * @returns {Object} - {success: boolean, filePath: string, error: string}
 */
function exportDOMStructure(domStructure, format, customPath) {
    var result = {
        success: false,
        filePath: '',
        error: ''
    };
    
    try {
        $.writeln('Starting export: format=' + format);
        
        if (!domStructure) {
            result.error = 'No DOM structure provided for export';
            return result;
        }
        
        var exportFormat = format || EXPORT_CONFIG.defaultFormat;
        $.writeln('Using export format: ' + exportFormat);
        
        // Generate export content based on format
        var content = '';
        var fileExtension = '.txt';
        
        try {
            switch (exportFormat.toLowerCase()) {
                case 'text':
                    $.writeln('Generating text export...');
                    content = generateTextExport(domStructure);
                    fileExtension = '.txt';
                    break;
                case 'json':
                    $.writeln('Generating JSON export...');
                    content = generateJSONExport(domStructure);
                    fileExtension = '.json';
                    break;
                case 'csv':
                    $.writeln('Generating CSV export...');
                    content = generateCSVExport(domStructure);
                    fileExtension = '.csv';
                    break;
                default:
                    result.error = 'Unsupported export format: ' + exportFormat;
                    return result;
            }
        } catch (contentExc) {
            result.error = 'Content generation failed for ' + exportFormat + ': ' + contentExc.message;
            $.writeln('Content generation error: ' + contentExc.message);
            return result;
        }
        
        if (!content) {
            result.error = 'Failed to generate export content (content is empty)';
            $.writeln('Content generation produced empty result');
            return result;
        }
        
        $.writeln('Content generated successfully, length: ' + content.length + ' characters');
        
        // Check content size
        if (content.length > EXPORT_CONFIG.maxFileSize) {
            result.error = 'Export content too large (' + content.length + ' bytes). Consider reducing scope.';
            return result;
        }
        
        // Determine file path
        var filePath = customPath || generateDefaultFilePath(domStructure, fileExtension);
        $.writeln('Using file path: ' + filePath);
        
        // Write file
        var writeResult = writeToFile(filePath, content);
        if (writeResult.success) {
            result.success = true;
            result.filePath = writeResult.filePath;
            $.writeln('DOM structure exported successfully to: ' + result.filePath);
        } else {
            result.error = writeResult.error;
            $.writeln('File write failed: ' + result.error);
        }
        
    } catch (exc) {
        result.error = 'Export failed: ' + exc.message;
        $.writeln('ERROR: DOM export failed: ' + exc.message);
    }
    
    return result;
}

/**
 * Safe local version of countPropertiesBySafety to avoid dependencies
 * @param {Object} domNode - DOM node to analyze
 * @returns {Object} - Count by safety level
 */
function safeCountPropertiesBySafety(domNode) {
    var counts = {
        safe: 0,
        moderate: 0,
        risky: 0,
        dangerous: 0
    };
    
    try {
        if (!domNode) return counts;
        
        // Count properties in this node
        var allProps = [];
        if (domNode.properties) allProps = allProps.concat(domNode.properties);
        if (domNode.collections) allProps = allProps.concat(domNode.collections);
        if (domNode.methods) allProps = allProps.concat(domNode.methods);
        
        for (var i = 0; i < allProps.length; i++) {
            var prop = allProps[i];
            if (prop.safetyLevel && counts.hasOwnProperty(prop.safetyLevel)) {
                counts[prop.safetyLevel]++;
            }
        }
        
        // Recursively count child nodes
        if (domNode.childNodes) {
            for (var i = 0; i < domNode.childNodes.length; i++) {
                var childCounts = safeCountPropertiesBySafety(domNode.childNodes[i]);
                counts.safe += childCounts.safe;
                counts.moderate += childCounts.moderate;
                counts.risky += childCounts.risky;
                counts.dangerous += childCounts.dangerous;
            }
        }
    } catch (exc) {
        $.writeln('Error counting properties by safety: ' + exc.message);
    }
    
    return counts;
}

/**
 * Generate human-readable text export
 * @param {Object} domStructure - DOM structure to export
 * @returns {String} - Formatted text export
 */
function generateTextExport(domStructure) {
    try {
        var builder = createStringBuilder();
        
        // Header
        builder.appendLine('INDESIGN DOCUMENT DOM STRUCTURE ANALYSIS');
        builder.appendLine('=======================================');
        builder.appendLine('Generated by: InDesign DOM Discovery Builder v2.0');
        builder.appendLine('Timestamp: ' + getCurrentTimestamp());
        builder.appendLine('');
        
        // Document metadata
        try {
            if (EXPORT_CONFIG.includeMetadata && domStructure.metadata) {
                builder.appendLine('DOCUMENT INFORMATION');
                builder.appendLine('===================');
                builder.appendLine('Document Name: ' + (domStructure.metadata.documentName || 'Unknown'));
                builder.appendLine('Analysis Time: ' + (domStructure.metadata.enumerationTime || 0) + 'ms');
                builder.appendLine('Analysis Version: ' + (domStructure.metadata.version || 'Unknown'));
                
                if (domStructure.metadata.config) {
                    builder.appendLine('');
                    builder.appendLine('Analysis Configuration:');
                    builder.appendLine('  Max Depth: ' + domStructure.metadata.config.maxDepth);
                    builder.appendLine('  Timeout: ' + domStructure.metadata.config.timeoutMs + 'ms');
                    builder.appendLine('  Skip Dangerous: ' + domStructure.metadata.config.skipDangerous);
                    builder.appendLine('  Max Properties: ' + domStructure.metadata.config.maxProperties);
                }
                builder.appendLine('');
            }
        } catch (exc) {
            builder.appendLine('Error generating metadata section: ' + exc.message);
            builder.appendLine('');
        }
        
        // Statistics
        try {
            if (EXPORT_CONFIG.includeStatistics && domStructure.statistics) {
                builder.appendLine('DISCOVERY STATISTICS');
                builder.appendLine('===================');
                builder.appendLine('Total Objects Discovered: ' + domStructure.statistics.totalNodes);
                builder.appendLine('Total Properties Found: ' + domStructure.statistics.totalProperties);
                builder.appendLine('Maximum Depth Reached: ' + domStructure.statistics.maxDepthReached);
                builder.appendLine('Circular References Detected: ' + domStructure.statistics.circularRefsDetected);
                builder.appendLine('Timeout Events: ' + domStructure.statistics.timeouts);
                builder.appendLine('Enumeration Errors: ' + domStructure.statistics.errors.length);
                
                // Property safety breakdown - use safe local function
                if (domStructure.structure && domStructure.structure.document) {
                    try {
                        var safetyCounts = safeCountPropertiesBySafety(domStructure.structure.document);
                        builder.appendLine('');
                        builder.appendLine('Properties by Safety Level:');
                        builder.appendLine('  Safe Properties: ' + safetyCounts.safe);
                        builder.appendLine('  Moderate Risk Properties: ' + safetyCounts.moderate);
                        builder.appendLine('  Risky Properties: ' + safetyCounts.risky);
                        builder.appendLine('  Dangerous Properties: ' + safetyCounts.dangerous);
                    } catch (exc) {
                        builder.appendLine('  Could not calculate safety breakdown: ' + exc.message);
                    }
                }
                
                // Sampling statistics if available - use safe check
                if (domStructure.metadata && domStructure.metadata.sampling) {
                    try {
                        builder.appendLine('');
                        builder.appendLine('Property Value Sampling:');
                        if (domStructure.metadata.sampling.stats) {
                            var stats = domStructure.metadata.sampling.stats;
                            builder.appendLine('  Values Sampled: ' + (stats.successfulSamples || 0) + '/' + (stats.totalAttempts || 0));
                            builder.appendLine('  Sampling Time: ' + (domStructure.metadata.sampling.samplingTime || 0) + 'ms');
                            builder.appendLine('  Timeouts: ' + (stats.timeouts || 0));
                            builder.appendLine('  Errors: ' + (stats.errors || 0));
                        }
                    } catch (exc) {
                        builder.appendLine('  Could not generate sampling statistics: ' + exc.message);
                    }
                }
                
                builder.appendLine('');
            }
        } catch (exc) {
            builder.appendLine('Error generating statistics section: ' + exc.message);
            builder.appendLine('');
        }
        
        // Property access guide
        try {
            if (EXPORT_CONFIG.includeAccessGuide) {
                builder.appendLine('PROPERTY ACCESS GUIDE');
                builder.appendLine('====================');
                builder.appendLine('This section shows how to safely access discovered properties in your own scripts.');
                builder.appendLine('');
                
                if (domStructure.structure && domStructure.structure.document) {
                    var accessGuide = generatePropertyAccessGuide(domStructure.structure.document);
                    builder.append(accessGuide);
                }
                
                builder.appendLine('');
            }
        } catch (exc) {
            builder.appendLine('Error generating access guide: ' + exc.message);
            builder.appendLine('');
        }
        
        // Full DOM tree structure
        try {
            if (EXPORT_CONFIG.includeFullTree) {
                builder.appendLine('COMPLETE DOM STRUCTURE');
                builder.appendLine('=====================');
                builder.appendLine('This tree shows all discovered objects and properties with their safety classifications.');
                builder.appendLine('');
                
                if (domStructure.structure && domStructure.structure.document) {
                    var treeText = generateDetailedDOMTree(domStructure.structure.document, '', true);
                    builder.append(treeText);
                } else {
                    builder.appendLine('No DOM structure available');
                }
                
                builder.appendLine('');
            }
        } catch (exc) {
            builder.appendLine('Error generating DOM tree: ' + exc.message);
            builder.appendLine('');
        }
        
        // Footer with usage notes
        builder.appendLine('USAGE NOTES');
        builder.appendLine('===========');
        builder.appendLine('• This file contains the complete DOM structure discovered in your InDesign document');
        builder.appendLine('• Use the Property Access Guide section to write safe property access code');
        builder.appendLine('• Properties marked [safe] are recommended for direct access');
        builder.appendLine('• Properties marked [risky] or [dangerous] should be accessed with error handling');
        builder.appendLine('• Collections should be iterated safely with length checks and try-catch blocks');
        builder.appendLine('• Always test property access with your specific document types');
        builder.appendLine('');
        builder.appendLine('Generated by InDesign DOM Discovery Builder');
        builder.appendLine('For more information, visit: [project documentation]');
        
        return builder.toString();
        
    } catch (exc) {
        $.writeln('ERROR: Text export generation failed: ' + exc.message);
        return 'Text export failed: ' + exc.message + '\n\nBasic DOM info:\n' + 
               'Document: ' + (domStructure.metadata ? domStructure.metadata.documentName : 'Unknown') + '\n' +
               'Properties: ' + (domStructure.statistics ? domStructure.statistics.totalProperties : 'Unknown');
    }
}

/**
 * Generate JSON export
 * @param {Object} domStructure - DOM structure to export
 * @returns {String} - JSON formatted export
 */
function generateJSONExport(domStructure) {
    try {
        // Create a simplified version for JSON export
        var exportData = {
            metadata: domStructure.metadata || {},
            statistics: domStructure.statistics || {},
            structure: simplifyDOMForJSON(domStructure.structure)
        };
        
        // Convert to JSON string (ES3 compatible approach)
        return stringifyObject(exportData, 0);
        
    } catch (exc) {
        $.writeln('ERROR: JSON export failed: ' + exc.message);
        return '';
    }
}

/**
 * Generate CSV export
 * @param {Object} domStructure - DOM structure to export
 * @returns {String} - CSV formatted export
 */
function generateCSVExport(domStructure) {
    var builder = createStringBuilder();
    
    // CSV header
    builder.appendLine('ObjectPath,PropertyName,PropertyType,SafetyLevel,IsCollection,IsMethod,HasSampleValue,SampleValue');
    
    if (domStructure.structure && domStructure.structure.document) {
        generateCSVFromNode(domStructure.structure.document, builder);
    }
    
    return builder.toString();
}

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

/**
 * Simplify DOM structure for JSON export
 * @param {Object} structure - DOM structure to simplify
 * @returns {Object} - Simplified structure
 */
function simplifyDOMForJSON(structure) {
    if (!structure) return {};
    
    var simplified = {};
    
    try {
        for (var key in structure) {
            if (structure[key] && typeof structure[key] === 'object') {
                simplified[key] = simplifyDOMNodeForJSON(structure[key]);
            } else {
                simplified[key] = structure[key];
            }
        }
    } catch (exc) {
        $.writeln('ERROR: Simplifying DOM for JSON: ' + exc.message);
    }
    
    return simplified;
}

/**
 * Simplify DOM node for JSON export
 * @param {Object} domNode - DOM node to simplify
 * @returns {Object} - Simplified node
 */
function simplifyDOMNodeForJSON(domNode) {
    if (!domNode) return null;
    
    var simplified = {
        name: domNode.name || '',
        path: domNode.path || '',
        type: domNode.type || '',
        depth: domNode.depth || 0,
        hasCircularRefs: domNode.hasCircularRefs || false
    };
    
    // Include enumeration errors if any
    if (domNode.enumerationErrors && domNode.enumerationErrors.length > 0) {
        simplified.enumerationErrors = domNode.enumerationErrors;
    }
    
    // Simplified properties with more detail
    if (domNode.properties && domNode.properties.length > 0) {
        simplified.properties = [];
        for (var i = 0; i < domNode.properties.length; i++) {
            var prop = domNode.properties[i];
            var simpleProp = {
                name: prop.name,
                type: prop.type,
                safetyLevel: prop.safetyLevel,
                isCollection: prop.isCollection || false,
                isMethod: prop.isMethod || false,
                isReserved: prop.isReserved || false,
                path: prop.path || ''
            };
            
            // Include sample value if available
            if (prop.hasSampleValue && prop.sampleValue) {
                simpleProp.sampleValue = prop.sampleValue;
                simpleProp.hasSampleValue = true;
            }
            
            // Include alternatives if available
            if (prop.alternatives && prop.alternatives.length > 0) {
                simpleProp.alternatives = prop.alternatives;
            }
            
            simplified.properties.push(simpleProp);
        }
    }
    
    // Simplified collections with more detail
    if (domNode.collections && domNode.collections.length > 0) {
        simplified.collections = [];
        for (var i = 0; i < domNode.collections.length; i++) {
            var coll = domNode.collections[i];
            var simpleColl = {
                name: coll.name,
                type: coll.type,
                safetyLevel: coll.safetyLevel,
                isCollection: true,
                path: coll.path || ''
            };
            
            // Include sample value if available
            if (coll.hasSampleValue && coll.sampleValue) {
                simpleColl.sampleValue = coll.sampleValue;
                simpleColl.hasSampleValue = true;
            }
            
            simplified.collections.push(simpleColl);
        }
    }
    
    // Include methods if any
    if (domNode.methods && domNode.methods.length > 0) {
        simplified.methods = [];
        for (var i = 0; i < domNode.methods.length; i++) {
            var method = domNode.methods[i];
            simplified.methods.push({
                name: method.name,
                type: method.type,
                safetyLevel: method.safetyLevel,
                isMethod: true,
                path: method.path || ''
            });
        }
    }
    
    // Include child nodes recursively, but limit depth
    if (domNode.childNodes && domNode.childNodes.length > 0 && domNode.depth < 3) {
        simplified.childNodes = [];
        for (var i = 0; i < Math.min(domNode.childNodes.length, 20); i++) {
            var childSimplified = simplifyDOMNodeForJSON(domNode.childNodes[i]);
            if (childSimplified) {
                simplified.childNodes.push(childSimplified);
            }
        }
        if (domNode.childNodes.length > 20) {
            simplified.childNodes.push({
                name: '[...more child nodes]',
                type: 'truncated',
                truncatedCount: domNode.childNodes.length - 20
            });
        }
    }
    
    return simplified;
}

/**
 * Generate CSV rows from DOM node
 * @param {Object} domNode - DOM node to process
 * @param {Object} builder - String builder for output
 */
function generateCSVFromNode(domNode, builder) {
    if (!domNode) return;
    
    // Process properties
    if (domNode.properties) {
        for (var i = 0; i < domNode.properties.length; i++) {
            var prop = domNode.properties[i];
            var sampleValue = prop.hasSampleValue ? prop.sampleValue : '';
            var csvLine = '"' + (domNode.path || '') + '","' + prop.name + '","' + prop.type + '","' + 
                         prop.safetyLevel + '","' + (prop.isCollection ? 'true' : 'false') + '","' + 
                         (prop.isMethod ? 'true' : 'false') + '","' + (prop.hasSampleValue ? 'true' : 'false') + 
                         '","' + escapeCsvValue(sampleValue) + '"';
            builder.appendLine(csvLine);
        }
    }
    
    // Process collections
    if (domNode.collections) {
        for (var i = 0; i < domNode.collections.length; i++) {
            var coll = domNode.collections[i];
            var sampleValue = coll.hasSampleValue ? coll.sampleValue : '';
            var csvLine = '"' + (domNode.path || '') + '","' + coll.name + '","' + coll.type + '","' + 
                         coll.safetyLevel + '","true","false","' + (coll.hasSampleValue ? 'true' : 'false') + 
                         '","' + escapeCsvValue(sampleValue) + '"';
            builder.appendLine(csvLine);
        }
    }
    
    // Process child nodes recursively
    if (domNode.childNodes) {
        for (var i = 0; i < domNode.childNodes.length; i++) {
            generateCSVFromNode(domNode.childNodes[i], builder);
        }
    }
}

/**
 * Escape CSV value for safe output
 * @param {String} value - Value to escape
 * @returns {String} - Escaped value
 */
function escapeCsvValue(value) {
    if (!value) return '';
    var str = String(value);
    // Replace quotes with double quotes and wrap in quotes if contains comma or quote
    str = str.replace(/"/g, '""');
    if (str.indexOf(',') !== -1 || str.indexOf('"') !== -1 || str.indexOf('\n') !== -1) {
        str = '"' + str + '"';
    }
    return str;
}

/**
 * Generate property access guide
 * @param {Object} domNode - DOM node to analyze
 * @returns {String} - Property access guide
 */
function generatePropertyAccessGuide(domNode) {
    var builder = createStringBuilder();
    
    builder.appendLine('SAFE PROPERTY ACCESS EXAMPLES:');
    builder.appendLine('------------------------------');
    
    // Find safe properties for examples
    var safeProperties = findSafeProperties(domNode);
    
    if (safeProperties.length > 0) {
        builder.appendLine('// Basic safe properties:');
        for (var i = 0; i < Math.min(safeProperties.length, 8); i++) {
            var prop = safeProperties[i];
            var varName = prop.name.replace(/[^a-zA-Z0-9]/g, '');
            var accessCode = 'var ' + varName + ' = document.' + prop.name + ';';
            var comment = '  // ' + prop.type + ' - ' + prop.safetyLevel;
            builder.appendLine(accessCode + comment);
        }
    } else {
        builder.appendLine('// No safe properties found for direct access');
    }
    
    builder.appendLine('');
    builder.appendLine('COLLECTION ACCESS PATTERNS:');
    builder.appendLine('---------------------------');
    
    // Find collections for examples
    var collections = findCollections(domNode);
    
    if (collections.length > 0) {
        for (var i = 0; i < Math.min(collections.length, 3); i++) {
            var collection = collections[i];
            builder.appendLine('// Access ' + collection.name + ' collection safely:');
            builder.appendLine('try {');
            builder.appendLine('  var ' + collection.name + ' = document.' + collection.name + ';');
            builder.appendLine('  if (' + collection.name + ' && ' + collection.name + '.length > 0) {');
            builder.appendLine('    for (var i = 0; i < ' + collection.name + '.length; i++) {');
            builder.appendLine('      var item = ' + collection.name + '[i];');
            builder.appendLine('      // Process item safely');
            builder.appendLine('    }');
            builder.appendLine('  }');
            builder.appendLine('} catch (exc) {');
            builder.appendLine('  // Handle collection access error');
            builder.appendLine('}');
            builder.appendLine('');
        }
    }
    
    builder.appendLine('SAFETY RECOMMENDATIONS:');
    builder.appendLine('-----------------------');
    builder.appendLine('• Always wrap property access in try-catch blocks');
    builder.appendLine('• Check for null/undefined before accessing nested properties');
    builder.appendLine('• Use length checks before iterating collections');
    builder.appendLine('• Test with different document types and states');
    builder.appendLine('• Consider timeouts for operations on large collections');
    builder.appendLine('');
    
    return builder.toString();
}

/**
 * Find safe properties in DOM node
 * @param {Object} domNode - DOM node to search
 * @returns {Array} - Array of safe properties
 */
function findSafeProperties(domNode) {
    var safeProps = [];
    
    if (domNode && domNode.properties) {
        for (var i = 0; i < domNode.properties.length; i++) {
            var prop = domNode.properties[i];
            if (prop.safetyLevel === 'safe') {
                safeProps.push(prop);
            }
        }
    }
    
    return safeProps;
}

/**
 * Find collections in DOM node
 * @param {Object} domNode - DOM node to search
 * @returns {Array} - Array of collection properties
 */
function findCollections(domNode) {
    var collections = [];
    
    if (domNode && domNode.collections) {
        for (var i = 0; i < domNode.collections.length; i++) {
            collections.push(domNode.collections[i]);
        }
    }
    
    return collections;
}

/**
 * Generate detailed DOM tree for export
 * @param {Object} domNode - DOM node to format
 * @param {String} prefix - Current line prefix
 * @param {Boolean} isLast - Whether this is the last child
 * @returns {String} - Formatted tree text
 */
function generateDetailedDOMTree(domNode, prefix, isLast) {
    var builder = createStringBuilder();
    
    if (!domNode) return '';
    
    // Current node
    var nodePrefix = prefix + (isLast ? '└── ' : '├── ');
    var nodeLine = nodePrefix + domNode.name + ' (' + domNode.type + ')';
    if (domNode.hasCircularRefs) nodeLine += ' [CIRCULAR]';
    builder.appendLine(nodeLine);
    
    var childPrefix = prefix + (isLast ? '    ' : '│   ');
    
    // Properties (show all, not limited like in UI)
    if (domNode.properties && domNode.properties.length > 0) {
        for (var i = 0; i < domNode.properties.length; i++) {
            var prop = domNode.properties[i];
            var propPrefix = childPrefix + (i < domNode.properties.length - 1 ? '├── ' : '└── ');
            var propLine = propPrefix + prop.name + ' (' + prop.type + ') [' + prop.safetyLevel + ']';
            
            if (prop.hasSampleValue && prop.sampleValue) {
                propLine += ' = ' + prop.sampleValue;
            }
            
            builder.appendLine(propLine);
        }
    }
    
    // Collections
    if (domNode.collections && domNode.collections.length > 0) {
        for (var i = 0; i < domNode.collections.length; i++) {
            var collection = domNode.collections[i];
            var collPrefix = childPrefix + '├── ';
            var collLine = collPrefix + collection.name + ' (' + collection.type + ') [' + collection.safetyLevel + '] [COLLECTION]';
            
            if (collection.hasSampleValue && collection.sampleValue) {
                collLine += ' = ' + collection.sampleValue;
            }
            
            builder.appendLine(collLine);
        }
    }
    
    return builder.toString();
}

// ============================================================================
// FILE OPERATIONS
// ============================================================================

/**
 * Write content to file using proven ExtendScript patterns
 * @param {String} filePath - Path to write file
 * @param {String} content - Content to write
 * @returns {Object} - {success: boolean, filePath: string, error: string}
 */
function writeToFile(filePath, content) {
    var result = {
        success: false,
        filePath: '',
        error: ''
    };
    
    try {
        $.writeln('Writing to file: ' + filePath);
        $.writeln('Content length: ' + (content ? content.length : 0) + ' characters');
        
        if (!content) {
            result.error = 'No content to write';
            return result;
        }
        
        var file = new File(filePath);
        
        // Try to ensure directory exists
        if (file.parent && !file.parent.exists) {
            try {
                file.parent.create();
            } catch (dirExc) {
                $.writeln('Could not create directory: ' + dirExc.message);
            }
        }
        
        if (!file.open('w')) {
            result.error = 'Cannot open file for writing: ' + filePath;
            $.writeln('File open failed: ' + result.error);
            return result;
        }
        
        // Set encoding to UTF-8 for better compatibility
        file.encoding = 'UTF-8';
        
        var writeSuccess = file.write(content);
        if (!writeSuccess) {
            result.error = 'Failed to write content to file (write returned false)';
            $.writeln('File write failed: ' + result.error);
            file.close();
            return result;
        }
        
        file.close();
        
        // Verify file was actually created and has content
        if (file.exists) {
            var fileSize = file.length;
            $.writeln('File created successfully, size: ' + fileSize + ' bytes');
            if (fileSize === 0) {
                result.error = 'File was created but is empty (0 bytes)';
                return result;
            }
        } else {
            result.error = 'File operation completed but file does not exist';
            return result;
        }
        
        result.success = true;
        result.filePath = file.absoluteURI;
        
    } catch (exc) {
        result.error = 'File operation failed: ' + exc.message;
        $.writeln('File operation exception: ' + exc.message);
    }
    
    return result;
}

/**
 * Generate default file path
 * @param {Object} domStructure - DOM structure for naming
 * @param {String} extension - File extension
 * @returns {String} - Generated file path
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
        
        var fileName = docName + '_DOM_' + timeStr + extension;
        
        // Try to place next to document if possible
        var envResult = validateInDesignEnvironment();
        if (envResult.valid && envResult.document) {
            try {
                // Try to get document file path safely
                var docFilePath = null;
                if (safeTypeCheck(envResult.document, 'filePath') === 'string') {
                    docFilePath = envResult.document.filePath;
                } else if (safeTypeCheck(envResult.document, 'fullName') === 'object') {
                    // Try fullName property which might be a File object
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
                // Fall through to desktop if document path access fails
                $.writeln('Could not access document path, using desktop: ' + exc.message);
            }
        }
        
        // Default to desktop
        return Folder.desktop.absoluteURI + '/' + fileName;
        
    } catch (exc) {
        return Folder.desktop.absoluteURI + '/InDesignDOM_export' + extension;
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Simple object stringification for ES3 compatibility
 * @param {*} obj - Object to stringify
 * @param {Number} depth - Current depth
 * @returns {String} - JSON-like string
 */
function stringifyObject(obj, depth) {
    // More permissive depth limit
    if (depth > 6) return '"[max depth reached]"';
    
    if (obj === null) return 'null';
    if (obj === undefined) return 'undefined';
    
    var type = typeof obj;
    
    if (type === 'string') return '"' + obj.replace(/"/g, '\\"') + '"';
    if (type === 'number' || type === 'boolean') return String(obj);
    
    if (type === 'object') {
        if (obj.constructor === Array || (obj.length !== undefined && typeof obj.length === 'number')) {
            // Handle arrays
            var parts = ['['];
            var arrayLength = obj.length || 0;
            for (var i = 0; i < Math.min(arrayLength, 50); i++) {  // Increased limit
                if (i > 0) parts.push(',');
                parts.push(stringifyObject(obj[i], depth + 1));
            }
            if (arrayLength > 50) parts.push(',"[...more items]"');
            parts.push(']');
            return parts.join('');
        } else {
            // Handle objects
            var parts = ['{'];
            var first = true;
            var count = 0;
            for (var key in obj) {
                if (count >= 100) {  // Increased limit
                    if (!first) parts.push(',');
                    parts.push('"[...more properties]":"truncated"');
                    break;
                }
                if (!first) parts.push(',');
                parts.push('"' + key + '":');
                parts.push(stringifyObject(obj[key], depth + 1));
                first = false;
                count++;
            }
            parts.push('}');
            return parts.join('');
        }
    }
    
    return '"[' + type + ']"';
}

// ============================================================================
// MODULE INITIALIZATION
// ============================================================================

/**
 * Initialize DOM exporter module
 * @returns {Boolean} - true if initialization successful
 */
function initializeDOMExporter() {
    try {
        // Check dependencies
        if (typeof createStringBuilder !== 'function') {
            $.writeln('ERROR: Safe foundation module not loaded');
            return false;
        }
        
        // Test core functions
        var requiredFunctions = [
            'exportDOMStructure', 'generateTextExport', 'writeToFile'
        ];
        
        for (var i = 0; i < requiredFunctions.length; i++) {
            if (typeof eval(requiredFunctions[i]) !== 'function') {
                $.writeln('ERROR: Required function missing: ' + requiredFunctions[i]);
                return false;
            }
        }
        
        $.writeln('5.0_dom-exporter.jsx: All functions initialized successfully');
        $.writeln('Use exportDOMStructure(domStructure, format) to export DOM data');
        return true;
        
    } catch (exc) {
        $.writeln('ERROR: DOM exporter initialization failed: ' + exc.message);
        return false;
    }
}

// Auto-initialize when module loads
initializeDOMExporter();