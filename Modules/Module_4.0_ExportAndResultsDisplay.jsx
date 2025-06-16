// ============================================================================
// MODULE 4.0: EXPORT AND RESULTS DISPLAY
// InDesign Document Query Tool v3.1 - Enhanced Safety Edition
// ES3 Compatible - All Reserved Words Fixed
// ============================================================================

// Export format definitions
var EXPORT_FORMATS = {
    json: {
        name: "JSON Format",
        extension: "json",
        mimeType: "application/json",
        description: "Machine-readable JSON data"
    },
    text: {
        name: "Plain Text",
        extension: "txt", 
        mimeType: "text/plain",
        description: "Human-readable text format"
    },
    csv: {
        name: "CSV Format",
        extension: "csv",
        mimeType: "text/csv", 
        description: "Comma-separated values for spreadsheets"
    },
    xml: {
        name: "XML Format",
        extension: "xml",
        mimeType: "application/xml",
        description: "Structured XML data"
    }
};

// Export state management
var EXPORT_STATE = {
    lastExportPath: null,
    lastExportFormat: "text",
    exportCount: 0,
    activeExports: []
};

// ============================================================================
// MAIN EXPORT FUNCTIONS
// ============================================================================

function exportAnalysisResults(resultsData, exportOptions) {
    debugLog("Starting export process", "EXPORT");
    
    var exportConfig = {
        format: exportOptions.format || "text",
        includeMetadata: exportOptions.includeMetadata !== false,
        includeErrors: exportOptions.includeErrors !== false,
        includeTimestamps: exportOptions.includeTimestamps !== false,
        maxDepth: exportOptions.maxDepth || 5,
        filename: exportOptions.filename || generateDefaultFilename(resultsData),
        targetPath: exportOptions.targetPath || null
    };
    
    try {
        // Validate export configuration
        if (!validateExportConfig(exportConfig)) {
            throw new Error("Invalid export configuration");
        }
        
        // Validate results data
        if (!validateResultsData(resultsData)) {
            throw new Error("Invalid or empty results data");
        }
        
        // Get export file path
        var exportFile = getExportFilePath(exportConfig);
        if (!exportFile) {
            throw new Error("No file selected for export");
        }
        
        // Generate export content based on format
        var exportContent = generateExportContent(resultsData, exportConfig);
        
        // Write to file
        var writeSuccess = writeExportFile(exportFile, exportContent, exportConfig);
        if (!writeSuccess) {
            throw new Error("Failed to write export file");
        }
        
        // Update export state
        EXPORT_STATE.lastExportPath = exportFile.fsName;
        EXPORT_STATE.lastExportFormat = exportConfig.format;
        EXPORT_STATE.exportCount++;
        
        debugLog("Export completed successfully: " + exportFile.fsName, "EXPORT");
        
        return {
            success: true,
            filePath: exportFile.fsName,
            format: exportConfig.format,
            fileSize: exportFile.length,
            timestamp: toISOString(new Date())
        };
        
    } catch (exc) {
        var errorInfo = {
            success: false,
            errorMessage: exc.message,
            timestamp: toISOString(new Date())
        };
        
        logError("Export failed: " + exc.message, "EXPORT", "HIGH");
        return errorInfo;
    }
}

function generateDefaultFilename(resultsData) {
    var timestamp = new Date();
    var dateStr = timestamp.getFullYear() + 
                  ('0' + (timestamp.getMonth() + 1)).slice(-2) + 
                  ('0' + timestamp.getDate()).slice(-2) + 
                  '_' +
                  ('0' + timestamp.getHours()).slice(-2) + 
                  ('0' + timestamp.getMinutes()).slice(-2);
    
    var docName = "unknown";
    if (resultsData && resultsData.targets && resultsData.targets.documentProperties) {
        var docProps = resultsData.targets.documentProperties;
        if (docProps.data && docProps.data.name) {
            docName = docProps.data.name.replace(/[^a-zA-Z0-9]/g, '_');
        }
    }
    
    return "indesign_analysis_" + docName + "_" + dateStr;
}

function validateExportConfig(configObj) {
    try {
        if (!configObj || typeof configObj !== 'object') {
            return false;
        }
        
        // Check required properties
        if (!configObj.format || !EXPORT_FORMATS[configObj.format]) {
            debugLog("Invalid export format: " + configObj.format, "EXPORT");
            return false;
        }
        
        if (!configObj.filename || typeof configObj.filename !== 'string') {
            debugLog("Invalid filename in export config", "EXPORT");
            return false;
        }
        
        return true;
        
    } catch (exc) {
        debugLog("Export config validation error: " + exc.message, "EXPORT");
        return false;
    }
}

function validateResultsData(resultsObj) {
    try {
        if (!resultsObj || typeof resultsObj !== 'object') {
            return false;
        }
        
        // Check for basic structure
        if (!resultsObj.targets || typeof resultsObj.targets !== 'object') {
            debugLog("Results data missing targets", "EXPORT");
            return false;
        }
        
        // Check if there's any data to export
        var hasData = false;
        for (var targetKey in resultsObj.targets) {
            if (resultsObj.targets[targetKey] && resultsObj.targets[targetKey].data) {
                hasData = true;
                break;
            }
        }
        
        if (!hasData) {
            debugLog("Results data contains no analyzable targets", "EXPORT");
            return false;
        }
        
        return true;
        
    } catch (exc) {
        debugLog("Results validation error: " + exc.message, "EXPORT");
        return false;
    }
}

function getExportFilePath(configObj) {
    try {
        var formatInfo = EXPORT_FORMATS[configObj.format];
        var filename = configObj.filename + "." + formatInfo.extension;
        
        // Use target path if provided
        if (configObj.targetPath) {
            return new File(configObj.targetPath + "/" + filename);
        }
        
        // Show save dialog
        var fileFilter = "*." + formatInfo.extension;
        var dialogTitle = "Save " + formatInfo.name + " Export";
        
        var exportFile = File.saveDialog(dialogTitle, fileFilter);
        return exportFile;
        
    } catch (exc) {
        debugLog("Error getting export file path: " + exc.message, "EXPORT");
        return null;
    }
}

// ============================================================================
// FORMAT-SPECIFIC EXPORT GENERATORS
// ============================================================================

function generateExportContent(resultsData, configObj) {
    debugLog("Generating export content for format: " + configObj.format, "EXPORT");
    
    switch (configObj.format) {
        case "json":
            return generateJSONExport(resultsData, configObj);
        case "text":
            return generateTextExport(resultsData, configObj);
        case "csv":
            return generateCSVExport(resultsData, configObj);
        case "xml":
            return generateXMLExport(resultsData, configObj);
        default:
            throw new Error("Unsupported export format: " + configObj.format);
    }
}

function generateJSONExport(resultsData, configObj) {
    debugLog("Generating JSON export", "EXPORT");
    
    try {
        // Create a clean copy of results for export
        var exportData = createExportableData(resultsData, configObj);
        
        // Convert to JSON string with ES3-compatible method
        var jsonString = convertToJSONString(exportData, 0, configObj.maxDepth);
        
        // Add metadata if requested
        if (configObj.includeMetadata) {
            var metadataWrapper = {
                exportMetadata: {
                    timestamp: toISOString(new Date()),
                    tool: "InDesign Document Inspector v3.1",
                    format: "JSON",
                    generator: "ES3 Compatible Export System"
                },
                analysisResults: exportData
            };
            
            jsonString = convertToJSONString(metadataWrapper, 0, configObj.maxDepth);
        }
        
        return jsonString;
        
    } catch (exc) {
        throw new Error("JSON export generation failed: " + exc.message);
    }
}

function generateTextExport(resultsData, configObj) {
    debugLog("Generating text export", "EXPORT");
    
    try {
        var textBuilder = createStringBuilder();
        
        // Header
        textBuilder.appendLine("INDESIGN DOCUMENT ANALYSIS RESULTS");
        textBuilder.appendLine(repeatString("=", 50));
        
        if (configObj.includeTimestamps) {
            textBuilder.appendLine("Generated: " + toISOString(new Date()));
            textBuilder.appendLine("Analysis Time: " + (resultsData.timestamp || "Unknown"));
        }
        
        textBuilder.appendLine("Tool: InDesign Document Inspector v3.1");
        textBuilder.appendLine("Export Format: Plain Text");
        textBuilder.appendLine("");
        
        // Summary section
        if (resultsData.summary) {
            textBuilder.appendLine("ANALYSIS SUMMARY");
            textBuilder.appendLine(repeatString("-", 20));
            textBuilder.appendLine("Total Targets: " + (resultsData.summary.totalTargets || 0));
            textBuilder.appendLine("Successful: " + (resultsData.summary.successfulTargets || 0));
            textBuilder.appendLine("Failed: " + (resultsData.summary.failedTargets || 0));
            textBuilder.appendLine("Total Properties: " + (resultsData.summary.totalProperties || 0));
            textBuilder.appendLine("");
        }
        
        // Configuration section
        if (resultsData.configuration) {
            textBuilder.appendLine("ANALYSIS CONFIGURATION");
            textBuilder.appendLine(repeatString("-", 25));
            for (var configKey in resultsData.configuration) {
                textBuilder.appendLine(configKey + ": " + resultsData.configuration[configKey]);
            }
            textBuilder.appendLine("");
        }
        
        // Target details
        if (resultsData.targets) {
            textBuilder.appendLine("TARGET ANALYSIS RESULTS");
            textBuilder.appendLine(repeatString("-", 27));
            
            for (var targetKey in resultsData.targets) {
                var target = resultsData.targets[targetKey];
                
                textBuilder.appendLine("");
                textBuilder.appendLine("TARGET: " + (target.name || targetKey));
                textBuilder.appendLine("Description: " + (target.description || "N/A"));
                textBuilder.appendLine("Safety Level: " + (target.safetyLevel || "Unknown"));
                textBuilder.appendLine("Status: " + (target.success ? "SUCCESS" : "FAILED"));
                
                if (target.processingTime) {
                    textBuilder.appendLine("Processing Time: " + target.processingTime + "ms");
                }
                
                if (target.propertyCount) {
                    textBuilder.appendLine("Properties Found: " + target.propertyCount);
                }
                
                if (target.errorMessage) {
                    textBuilder.appendLine("Error: " + target.errorMessage);
                }
                
                if (target.success && target.data) {
                    textBuilder.appendLine("");
                    textBuilder.appendLine("Data:");
                    textBuilder.append(formatDataForTextExport(target.data, 1, configObj.maxDepth));
                }
                
                textBuilder.appendLine("");
                textBuilder.appendLine(repeatString("-", 40));
            }
        }
        
        // Error section
        if (configObj.includeErrors && resultsData.summary && resultsData.summary.errors) {
            textBuilder.appendLine("");
            textBuilder.appendLine("ERROR DETAILS");
            textBuilder.appendLine(repeatString("-", 15));
            
            for (var i = 0; i < resultsData.summary.errors.length; i++) {
                textBuilder.appendLine((i + 1) + ". " + resultsData.summary.errors[i]);
            }
        }
        
        textBuilder.appendLine("");
        textBuilder.appendLine("Export completed.");
        
        return textBuilder.toString();
        
    } catch (exc) {
        throw new Error("Text export generation failed: " + exc.message);
    }
}

function generateCSVExport(resultsData, configObj) {
    debugLog("Generating CSV export", "EXPORT");
    
    try {
        var csvBuilder = createStringBuilder();
        
        // CSV Header
        csvBuilder.appendLine("Target,Name,Description,Status,Properties,ProcessingTime,ErrorMessage");
        
        // Process each target
        for (var targetKey in resultsData.targets) {
            var target = resultsData.targets[targetKey];
            
            var csvRow = [
                escapeCsvValue(targetKey),
                escapeCsvValue(target.name || ""),
                escapeCsvValue(target.description || ""),
                escapeCsvValue(target.success ? "SUCCESS" : "FAILED"),
                escapeCsvValue(String(target.propertyCount || 0)),
                escapeCsvValue(String(target.processingTime || 0)),
                escapeCsvValue(target.errorMessage || "")
            ].join(",");
            
            csvBuilder.appendLine(csvRow);
        }
        
        return csvBuilder.toString();
        
    } catch (exc) {
        throw new Error("CSV export generation failed: " + exc.message);
    }
}

function generateXMLExport(resultsData, configObj) {
    debugLog("Generating XML export", "EXPORT");
    
    try {
        var xmlBuilder = createStringBuilder();
        
        // XML Declaration and root element
        xmlBuilder.appendLine('<?xml version="1.0" encoding="UTF-8"?>');
        xmlBuilder.appendLine('<indesignAnalysisResults>');
        
        // Metadata
        if (configObj.includeMetadata) {
            xmlBuilder.appendLine('  <metadata>');
            xmlBuilder.appendLine('    <timestamp>' + escapeXmlValue(toISOString(new Date())) + '</timestamp>');
            xmlBuilder.appendLine('    <tool>InDesign Document Inspector v3.1</tool>');
            xmlBuilder.appendLine('    <format>XML</format>');
            xmlBuilder.appendLine('  </metadata>');
        }
        
        // Analysis summary
        if (resultsData.summary) {
            xmlBuilder.appendLine('  <summary>');
            xmlBuilder.appendLine('    <totalTargets>' + (resultsData.summary.totalTargets || 0) + '</totalTargets>');
            xmlBuilder.appendLine('    <successfulTargets>' + (resultsData.summary.successfulTargets || 0) + '</successfulTargets>');
            xmlBuilder.appendLine('    <failedTargets>' + (resultsData.summary.failedTargets || 0) + '</failedTargets>');
            xmlBuilder.appendLine('    <totalProperties>' + (resultsData.summary.totalProperties || 0) + '</totalProperties>');
            xmlBuilder.appendLine('  </summary>');
        }
        
        // Configuration
        if (resultsData.configuration) {
            xmlBuilder.appendLine('  <configuration>');
            for (var configKey in resultsData.configuration) {
                xmlBuilder.appendLine('    <' + configKey + '>' + escapeXmlValue(String(resultsData.configuration[configKey])) + '</' + configKey + '>');
            }
            xmlBuilder.appendLine('  </configuration>');
        }
        
        // Targets
        xmlBuilder.appendLine('  <targets>');
        for (var targetKey in resultsData.targets) {
            var target = resultsData.targets[targetKey];
            
            xmlBuilder.appendLine('    <target id="' + escapeXmlAttribute(targetKey) + '">');
            xmlBuilder.appendLine('      <name>' + escapeXmlValue(target.name || "") + '</name>');
            xmlBuilder.appendLine('      <description>' + escapeXmlValue(target.description || "") + '</description>');
            xmlBuilder.appendLine('      <safetyLevel>' + escapeXmlValue(target.safetyLevel || "") + '</safetyLevel>');
            xmlBuilder.appendLine('      <success>' + (target.success ? 'true' : 'false') + '</success>');
            xmlBuilder.appendLine('      <propertyCount>' + (target.propertyCount || 0) + '</propertyCount>');
            xmlBuilder.appendLine('      <processingTime>' + (target.processingTime || 0) + '</processingTime>');
            
            if (target.errorMessage) {
                xmlBuilder.appendLine('      <errorMessage>' + escapeXmlValue(target.errorMessage) + '</errorMessage>');
            }
            
            if (target.success && target.data) {
                xmlBuilder.appendLine('      <data>');
                xmlBuilder.append(formatDataForXMLExport(target.data, 4, configObj.maxDepth));
                xmlBuilder.appendLine('      </data>');
            }
            
            xmlBuilder.appendLine('    </target>');
        }
        xmlBuilder.appendLine('  </targets>');
        
        xmlBuilder.appendLine('</indesignAnalysisResults>');
        
        return xmlBuilder.toString();
        
    } catch (exc) {
        throw new Error("XML export generation failed: " + exc.message);
    }
}

// ============================================================================
// DATA FORMATTING UTILITIES
// ============================================================================

function createExportableData(originalData, configObj) {
    var exportData = {};
    
    try {
        // Copy basic properties
        if (originalData.timestamp) exportData.timestamp = originalData.timestamp;
        if (originalData.summary) exportData.summary = cloneObject(originalData.summary, configObj.maxDepth);
        if (originalData.configuration) exportData.configuration = cloneObject(originalData.configuration, configObj.maxDepth);
        
        // Process targets
        if (originalData.targets) {
            exportData.targets = {};
            
            for (var targetKey in originalData.targets) {
                var target = originalData.targets[targetKey];
                exportData.targets[targetKey] = {
                    name: target.name || targetKey,
                    description: target.description || "",
                    safetyLevel: target.safetyLevel || "unknown",
                    success: target.success || false,
                    propertyCount: target.propertyCount || 0,
                    processingTime: target.processingTime || 0
                };
                
                if (target.errorMessage) {
                    exportData.targets[targetKey].errorMessage = target.errorMessage;
                }
                
                if (target.success && target.data) {
                    exportData.targets[targetKey].data = cloneObject(target.data, configObj.maxDepth);
                }
            }
        }
        
        return exportData;
        
    } catch (exc) {
        debugLog("Error creating exportable data: " + exc.message, "EXPORT");
        throw new Error("Failed to prepare data for export: " + exc.message);
    }
}

function cloneObject(objRef, maxDepth, currentDepth) {
    currentDepth = currentDepth || 0;
    
    if (currentDepth >= maxDepth) {
        return "[Max depth reached]";
    }
    
    if (objRef === null || objRef === undefined) {
        return objRef;
    }
    
    if (typeof objRef !== 'object') {
        return objRef;
    }
    
    try {
        var clonedObj = {};
        
        for (var key in objRef) {
            if (objRef.hasOwnProperty && objRef.hasOwnProperty(key)) {
                var value = objRef[key];
                
                if (typeof value === 'object' && value !== null) {
                    clonedObj[key] = cloneObject(value, maxDepth, currentDepth + 1);
                } else {
                    clonedObj[key] = value;
                }
            }
        }
        
        return clonedObj;
        
    } catch (exc) {
        debugLog("Object cloning error: " + exc.message, "EXPORT");
        return "[Cloning failed]";
    }
}

function formatDataForTextExport(dataObj, indentLevel, maxDepth) {
    var indent = repeatString("  ", indentLevel);
    var resultBuilder = createStringBuilder();
    
    try {
        if (indentLevel >= maxDepth) {
            resultBuilder.appendLine(indent + "[Max depth reached]");
            return resultBuilder.toString();
        }
        
        for (var key in dataObj) {
            var value = dataObj[key];
            
            if (value === null || value === undefined) {
                resultBuilder.appendLine(indent + key + ": [null]");
            } else if (typeof value === 'object') {
                resultBuilder.appendLine(indent + key + ":");
                if (indentLevel < maxDepth - 1) {
                    resultBuilder.append(formatDataForTextExport(value, indentLevel + 1, maxDepth));
                } else {
                    resultBuilder.appendLine(indent + "  [Object - max depth]");
                }
            } else {
                var valueStr = String(value);
                if (valueStr.length > 100) {
                    valueStr = valueStr.substring(0, 100) + "... [truncated]";
                }
                resultBuilder.appendLine(indent + key + ": " + valueStr);
            }
        }
        
    } catch (exc) {
        resultBuilder.appendLine(indent + "[Formatting error: " + exc.message + "]");
    }
    
    return resultBuilder.toString();
}

function formatDataForXMLExport(dataObj, indentLevel, maxDepth) {
    var indent = repeatString(" ", indentLevel);
    var resultBuilder = createStringBuilder();
    
    try {
        if (indentLevel >= maxDepth * 2) {
            resultBuilder.appendLine(indent + '<maxDepth>Reached</maxDepth>');
            return resultBuilder.toString();
        }
        
        for (var key in dataObj) {
            var value = dataObj[key];
            var safeKey = key.replace(/[^a-zA-Z0-9]/g, '_');
            
            if (value === null || value === undefined) {
                resultBuilder.appendLine(indent + '<' + safeKey + ' type="null"/>');
            } else if (typeof value === 'object') {
                resultBuilder.appendLine(indent + '<' + safeKey + '>');
                resultBuilder.append(formatDataForXMLExport(value, indentLevel + 2, maxDepth));
                resultBuilder.appendLine(indent + '</' + safeKey + '>');
            } else {
                var valueStr = escapeXmlValue(String(value));
                if (valueStr.length > 200) {
                    valueStr = valueStr.substring(0, 200) + "... [truncated]";
                }
                resultBuilder.appendLine(indent + '<' + safeKey + '>' + valueStr + '</' + safeKey + '>');
            }
        }
        
    } catch (exc) {
        resultBuilder.appendLine(indent + '<error>' + escapeXmlValue(exc.message) + '</error>');
    }
    
    return resultBuilder.toString();
}

// ============================================================================
// ESCAPE AND ENCODING UTILITIES
// ============================================================================

function escapeCsvValue(valueStr) {
    if (!valueStr) return '""';
    
    valueStr = String(valueStr);
    
    // If contains comma, quote, or newline, wrap in quotes and escape quotes
    if (stringIndexOf(valueStr, ',') !== -1 || 
        stringIndexOf(valueStr, '"') !== -1 || 
        stringIndexOf(valueStr, '\n') !== -1) {
        
        valueStr = valueStr.replace(/"/g, '""');
        return '"' + valueStr + '"';
    }
    
    return valueStr;
}

function escapeXmlValue(valueStr) {
    if (!valueStr) return "";
    
    valueStr = String(valueStr);
    
    valueStr = valueStr.replace(/&/g, '&amp;');
    valueStr = valueStr.replace(/</g, '&lt;');
    valueStr = valueStr.replace(/>/g, '&gt;');
    valueStr = valueStr.replace(/"/g, '&quot;');
    valueStr = valueStr.replace(/'/g, '&apos;');
    
    return valueStr;
}

function escapeXmlAttribute(valueStr) {
    if (!valueStr) return "";
    
    valueStr = String(valueStr);
    
    valueStr = valueStr.replace(/&/g, '&amp;');
    valueStr = valueStr.replace(/"/g, '&quot;');
    valueStr = valueStr.replace(/'/g, '&apos;');
    valueStr = valueStr.replace(/</g, '&lt;');
    valueStr = valueStr.replace(/>/g, '&gt;');
    
    return valueStr;
}

// ES3-compatible JSON stringifier
function convertToJSONString(objRef, currentDepth, maxDepth) {
    currentDepth = currentDepth || 0;
    maxDepth = maxDepth || 5;
    
    if (currentDepth >= maxDepth) {
        return '"[Max depth reached]"';
    }
    
    try {
        if (objRef === null) {
            return 'null';
        }
        
        if (objRef === undefined) {
            return 'null';
        }
        
        if (typeof objRef === 'boolean') {
            return objRef ? 'true' : 'false';
        }
        
        if (typeof objRef === 'number') {
            return String(objRef);
        }
        
        if (typeof objRef === 'string') {
            return '"' + escapeJsonString(objRef) + '"';
        }
        
        if (typeof objRef === 'object') {
            var jsonParts = [];
            
            for (var key in objRef) {
                if (objRef.hasOwnProperty && objRef.hasOwnProperty(key)) {
                    var value = objRef[key];
                    var keyStr = '"' + escapeJsonString(String(key)) + '"';
                    var valueStr = convertToJSONString(value, currentDepth + 1, maxDepth);
                    jsonParts.push(keyStr + ':' + valueStr);
                }
            }
            
            return '{' + jsonParts.join(',') + '}';
        }
        
        return '"[Unsupported type]"';
        
    } catch (exc) {
        return '"[JSON conversion error: ' + escapeJsonString(exc.message) + ']"';
    }
}

function escapeJsonString(stringValue) {
    if (!stringValue) return "";
    
    stringValue = String(stringValue);
    
    stringValue = stringValue.replace(/\\/g, '\\\\');
    stringValue = stringValue.replace(/"/g, '\\"');
    stringValue = stringValue.replace(/\n/g, '\\n');
    stringValue = stringValue.replace(/\r/g, '\\r');
    stringValue = stringValue.replace(/\t/g, '\\t');
    
    return stringValue;
}

// ============================================================================
// FILE WRITING AND VALIDATION
// ============================================================================

function writeExportFile(fileRef, contentStr, configObj) {
    debugLog("Writing export file: " + fileRef.fsName, "EXPORT");
    
    try {
        // Validate file path
        if (!fileRef || !fileRef.fsName) {
            throw new Error("Invalid file reference");
        }
        
        // Check if we can write to the directory
        var parentFolder = fileRef.parent;
        if (!parentFolder.exists) {
            throw new Error("Parent directory does not exist: " + parentFolder.fsName);
        }
        
        // Try to open file for writing
        if (!fileRef.open("w")) {
            throw new Error("Cannot open file for writing: " + fileRef.fsName);
        }
        
        // Write content
        var writeSuccess = fileRef.write(contentStr);
        if (!writeSuccess) {
            fileRef.close();
            throw new Error("Failed to write content to file");
        }
        
        // Close file
        fileRef.close();
        
        // Verify file was written
        if (!fileRef.exists) {
            throw new Error("File was not created successfully");
        }
        
        debugLog("Export file written successfully, size: " + fileRef.length + " bytes", "EXPORT");
        return true;
        
    } catch (exc) {
        try {
            if (fileRef && fileRef.close) {
                fileRef.close();
            }
        } catch (closeError) {
            // Ignore close errors
        }
        
        logError("File writing failed: " + exc.message, "EXPORT", "HIGH");
        return false;
    }
}

// ============================================================================
// RESULTS DISPLAY FUNCTIONS
// ============================================================================

function showResultsDialog(resultsData, displayOptions) {
    debugLog("Showing results dialog", "DISPLAY");
    
    try {
        var dialog = new Window("dialog", "Analysis Results - InDesign Inspector v3.1");
        dialog.orientation = "column";
        dialog.alignChildren = "fill";
        dialog.preferredSize.width = 700;
        dialog.preferredSize.height = 600;
        
        // Create results display
        createResultsDisplay(dialog, resultsData, displayOptions);
        
        // Create action buttons
        createResultsActions(dialog, resultsData);
        
        // Show dialog
        dialog.show();
        
    } catch (exc) {
        alert("Failed to show results dialog: " + exc.message);
        debugLog("Results dialog error: " + exc.message, "DISPLAY");
    }
}

function createResultsDisplay(parentWindow, resultsData, displayOptions) {
    // Summary panel
    var summaryPanel = parentWindow.add("panel", undefined, "Analysis Summary");
    summaryPanel.alignment = "fill";
    summaryPanel.preferredSize.height = 100;
    
    var summaryText = generateSummaryText(resultsData);
    var summaryDisplay = summaryPanel.add("statictext", undefined, summaryText, {multiline: true});
    summaryDisplay.alignment = "fill";
    
    // Results panel with tabs simulation
    var resultsPanel = parentWindow.add("panel", undefined, "Detailed Results");
    resultsPanel.alignment = "fill";
    
    // Create tabbed interface simulation with dropdown
    var tabGroup = resultsPanel.add("group");
    tabGroup.alignment = "fill";
    
    tabGroup.add("statictext", undefined, "View:");
    var tabDropdown = tabGroup.add("dropdownlist", undefined, ["Summary", "Targets", "Errors", "Raw Data"]);
    tabDropdown.selection = 0;
    
    // Results display area
    var resultsDisplay = resultsPanel.add("edittext", undefined, "", 
        {multiline: true, readonly: true, scrolling: true});
    resultsDisplay.alignment = "fill";
    resultsDisplay.preferredSize.height = 300;
    
    // Update display based on selection
    tabDropdown.onChange = function() {
        var selectedView = tabDropdown.selection.text;
        var displayContent = "";
        
        switch (selectedView) {
            case "Summary":
                displayContent = generateSummaryText(resultsData);
                break;
            case "Targets":
                displayContent = generateTargetsText(resultsData);
                break;
            case "Errors":
                displayContent = generateErrorsText(resultsData);
                break;
            case "Raw Data":
                displayContent = generateRawDataText(resultsData);
                break;
        }
        
        resultsDisplay.text = displayContent;
    };
    
    // Initialize display
    resultsDisplay.text = generateSummaryText(resultsData);
    
    return resultsPanel;
}

function createResultsActions(parentWindow, resultsData) {
    var actionsPanel = parentWindow.add("panel", undefined, "Actions");
    actionsPanel.alignment = "fill";
    
    var buttonGroup = actionsPanel.add("group");
    buttonGroup.alignment = "center";
    
    var exportBtn = buttonGroup.add("button", undefined, "Export Results");
    exportBtn.onClick = function() {
        exportFromDialog(resultsData);
    };
    
    var copyBtn = buttonGroup.add("button", undefined, "Copy Summary");
    copyBtn.onClick = function() {
        copyFromDialog(resultsData);
    };
    
    var saveBtn = buttonGroup.add("button", undefined, "Save to File");
    saveBtn.onClick = function() {
        quickSaveResults(resultsData);
    };
    
    var closeBtn = buttonGroup.add("button", undefined, "Close");
    closeBtn.onClick = function() {
        parentWindow.close();
    };
}

function generateSummaryText(resultsData) {
    var builder = createStringBuilder();
    
    builder.appendLine("ANALYSIS SUMMARY");
    builder.appendLine(repeatString("=", 20));
    
    if (resultsData.timestamp) {
        builder.appendLine("Analysis Time: " + resultsData.timestamp);
    }
    
    if (resultsData.summary) {
        builder.appendLine("Total Targets: " + (resultsData.summary.totalTargets || 0));
        builder.appendLine("Successful: " + (resultsData.summary.successfulTargets || 0));
        builder.appendLine("Failed: " + (resultsData.summary.failedTargets || 0));
        builder.appendLine("Properties Found: " + (resultsData.summary.totalProperties || 0));
    }
    
    if (resultsData.configuration) {
        builder.appendLine("");
        builder.appendLine("Configuration:");
        for (var key in resultsData.configuration) {
            builder.appendLine("  " + key + ": " + resultsData.configuration[key]);
        }
    }
    
    return builder.toString();
}

function generateTargetsText(resultsData) {
    var builder = createStringBuilder();
    
    builder.appendLine("TARGET ANALYSIS DETAILS");
    builder.appendLine(repeatString("=", 27));
    
    if (resultsData.targets) {
        for (var targetKey in resultsData.targets) {
            var target = resultsData.targets[targetKey];
            
            builder.appendLine("");
            builder.appendLine("Target: " + (target.name || targetKey));
            builder.appendLine("Status: " + (target.success ? "SUCCESS" : "FAILED"));
            builder.appendLine("Properties: " + (target.propertyCount || 0));
            builder.appendLine("Time: " + (target.processingTime || 0) + "ms");
            
            if (target.errorMessage) {
                builder.appendLine("Error: " + target.errorMessage);
            }
            
            builder.appendLine(repeatString("-", 30));
        }
    } else {
        builder.appendLine("No target data available.");
    }
    
    return builder.toString();
}

function generateErrorsText(resultsData) {
    var builder = createStringBuilder();
    
    builder.appendLine("ERROR ANALYSIS");
    builder.appendLine(repeatString("=", 15));
    
    if (resultsData.summary && resultsData.summary.errors && resultsData.summary.errors.length > 0) {
        for (var i = 0; i < resultsData.summary.errors.length; i++) {
            builder.appendLine((i + 1) + ". " + resultsData.summary.errors[i]);
        }
    } else {
        builder.appendLine("No errors recorded during analysis.");
    }
    
    return builder.toString();
}

function generateRawDataText(resultsData) {
    var builder = createStringBuilder();
    
    builder.appendLine("RAW DATA DUMP");
    builder.appendLine(repeatString("=", 15));
    
    try {
        var jsonString = convertToJSONString(resultsData, 0, 3);
        builder.append(jsonString);
    } catch (exc) {
        builder.appendLine("Error generating raw data: " + exc.message);
    }
    
    return builder.toString();
}

// ============================================================================
// QUICK ACTION FUNCTIONS
// ============================================================================

function exportFromDialog(resultsData) {
    try {
        var exportOptions = {
            format: "text",
            includeMetadata: true,
            includeErrors: true,
            includeTimestamps: true
        };
        
        var exportResult = exportAnalysisResults(resultsData, exportOptions);
        
        if (exportResult.success) {
            alert("Results exported successfully to:\n" + exportResult.filePath);
        } else {
            alert("Export failed: " + exportResult.errorMessage);
        }
        
    } catch (exc) {
        alert("Export error: " + exc.message);
    }
}

function copyFromDialog(resultsData) {
    try {
        var summaryText = generateSummaryText(resultsData);
        
        // Show copy dialog since ExtendScript doesn't have direct clipboard access
        var copyDialog = new Window("dialog", "Copy Summary");
        copyDialog.alignChildren = "fill";
        
        copyDialog.add("statictext", undefined, "Select all text below and copy manually:");
        
        var textArea = copyDialog.add("edittext", undefined, summaryText, 
            {multiline: true, readonly: true, scrolling: true});
        textArea.preferredSize.width = 400;
        textArea.preferredSize.height = 200;
        
        var buttonGroup = copyDialog.add("group");
        buttonGroup.alignment = "center";
        
        var selectAllBtn = buttonGroup.add("button", undefined, "Select All");
        selectAllBtn.onClick = function() {
            textArea.active = true;
            textArea.selection = [0, textArea.text.length];
        };
        
        var closeBtn = buttonGroup.add("button", undefined, "Close");
        closeBtn.onClick = function() {
            copyDialog.close();
        };
        
        copyDialog.show();
        
    } catch (exc) {
        alert("Copy failed: " + exc.message);
    }
}

function quickSaveResults(resultsData) {
    try {
        var saveFile = File.saveDialog("Save Analysis Results", "*.txt");
        if (!saveFile) {
            return; // User cancelled
        }
        
        var textContent = generateTextExport(resultsData, {
            includeMetadata: true,
            includeErrors: true,
            includeTimestamps: true,
            maxDepth: 5
        });
        
        var writeSuccess = writeExportFile(saveFile, textContent, {format: "text"});
        
        if (writeSuccess) {
            alert("Results saved successfully to:\n" + saveFile.fsName);
        } else {
            alert("Failed to save results file.");
        }
        
    } catch (exc) {
        alert("Save failed: " + exc.message);
    }
}

$.writeln("Module 4.0: Export and Results Display loaded (All formats supported)");