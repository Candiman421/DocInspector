// ============================================================================
// CHUNK 4: ENHANCED REPORT GENERATION - MODE-AWARE COMPLEXITY
// ES3 COMPATIBLE VERSION - PROGRESSIVE REPORTING WITH OPTIMIZED STRING HANDLING
// ============================================================================

// ============================================================================
// MODE-AWARE REPORT CREATION SYSTEM
// ============================================================================

// Create mode-appropriate report with complexity control
function createModeAppropriateReport(data, mode, reportType) {
    var currentMode = mode || ENHANCED_ANALYSIS_CONFIG.runtime.currentMode || "basic";
    var modeConfig = ENHANCED_ANALYSIS_CONFIG.modes[currentMode];
    
    enhancedStatusLog("REPORT", "Creating mode-appropriate report", 0, 5, 
        "Mode: " + currentMode + ", Type: " + reportType);
    
    var reportBuilder = es3OptimizedStringBuilder(modeConfig ? modeConfig.memoryLimit / 4 : 1048576);
    
    try {
        // Add report header with mode information
        reportBuilder.appendLine("Enhanced InDesign Document Analysis Report");
        reportBuilder.appendLine("Analysis Mode: " + currentMode.toUpperCase());
        reportBuilder.appendLine("Generated: " + new Date().toString());
        reportBuilder.appendLine("Report Type: " + (reportType || "general"));
        reportBuilder.appendLine(repeatString("=", 60));
        reportBuilder.appendLine("");
        
        // Mode-specific content generation
        switch (modeConfig ? modeConfig.reportComplexity : "basic") {
            case "minimal":
                enhancedStatusLog("REPORT", "Generating minimal report", 2, 5, "Simple key-value format");
                addMinimalReportContent(reportBuilder, data, currentMode);
                break;
                
            case "basic":
                enhancedStatusLog("REPORT", "Generating basic report", 2, 5, "Structured data format");
                addBasicReportContent(reportBuilder, data, currentMode);
                break;
                
            case "structured":
                enhancedStatusLog("REPORT", "Generating structured report", 2, 5, "Detailed structured format");
                addStructuredReportContent(reportBuilder, data, currentMode);
                break;
                
            case "detailed":
                enhancedStatusLog("REPORT", "Generating detailed report", 2, 5, "Rich analysis format");
                addDetailedReportContent(reportBuilder, data, currentMode);
                break;
                
            case "full":
                enhancedStatusLog("REPORT", "Generating comprehensive report", 2, 5, "Complete technical format");
                addFullReportContent(reportBuilder, data, currentMode);
                break;
                
            default:
                enhancedStatusLog("REPORT", "Using default report format", 2, 5, "Fallback to basic");
                addBasicReportContent(reportBuilder, data, currentMode);
        }
        
        // Add mode-specific footer
        reportBuilder.appendLine("");
        reportBuilder.appendLine(repeatString("=", 60));
        reportBuilder.appendLine("Report completed in " + currentMode + " mode");
        reportBuilder.appendLine("Report complexity: " + (modeConfig ? modeConfig.reportComplexity : "basic"));
        
        enhancedStatusLog("REPORT", "Report generation completed", 5, 5, 
            "Length: " + reportBuilder.getLength() + " characters");
        
        return reportBuilder.toString();
        
    } catch (exc) {
        debugLog("Mode-appropriate report generation failed: " + exc.message, "ERROR");
        return "Report generation failed in " + currentMode + " mode: " + exc.message;
    } finally {
        reportBuilder.clear(); // ES3 memory management
    }
}

// Add minimal report content - emergency/minimal modes
function addMinimalReportContent(reportBuilder, data, mode) {
    reportBuilder.appendLine("MINIMAL ANALYSIS REPORT");
    reportBuilder.appendLine("Mode: " + mode + " (Ultra-safe, properties only)");
    reportBuilder.appendLine("");
    
    if (data && typeof data === 'object') {
        // Extract key information only
        if (data.documentInfo) {
            reportBuilder.appendLine("Document Information:");
            var docInfo = data.documentInfo;
            if (docInfo.name) reportBuilder.appendLine("  Name: " + docInfo.name);
            if (docInfo.saved !== undefined) reportBuilder.appendLine("  Saved: " + (docInfo.saved ? "Yes" : "No"));
            if (docInfo.modified !== undefined) reportBuilder.appendLine("  Modified: " + (docInfo.modified ? "Yes" : "No"));
            reportBuilder.appendLine("");
        }
        
        if (data.summary) {
            reportBuilder.appendLine("Analysis Summary:");
            reportBuilder.appendLine("  Mode used: " + mode);
            reportBuilder.appendLine("  Safety level: " + (mode === "emergency" ? "Ultra-safe" : "Safe"));
            reportBuilder.appendLine("  Collections accessed: None (properties only)");
            reportBuilder.appendLine("");
        }
        
        if (data.errors && data.errors.length > 0) {
            reportBuilder.appendLine("Errors Encountered: " + data.errors.length);
            for (var i = 0; i < Math.min(data.errors.length, 3); i++) {
                reportBuilder.appendLine("  - " + data.errors[i]);
            }
            if (data.errors.length > 3) {
                reportBuilder.appendLine("  ... and " + (data.errors.length - 3) + " more");
            }
        }
    }
    
    reportBuilder.appendLine("Note: Minimal analysis for maximum safety");
    reportBuilder.appendLine("Use higher modes for more detailed analysis if document is stable");
}

// Add basic report content - basic mode
function addBasicReportContent(reportBuilder, data, mode) {
    reportBuilder.appendLine("BASIC ANALYSIS REPORT");
    reportBuilder.appendLine("Mode: " + mode + " (Safe collections, essential data)");
    reportBuilder.appendLine("");
    
    if (data && typeof data === 'object') {
        // Document information
        if (data.documentInfo) {
            reportBuilder.appendLine("DOCUMENT INFORMATION");
            reportBuilder.appendLine(repeatString("-", 20));
            var docInfo = data.documentInfo;
            
            for (var prop in docInfo) {
                if (docInfo.hasOwnProperty && docInfo.hasOwnProperty(prop)) {
                    var val = docInfo[prop];
                    if (val !== null && val !== undefined) {
                        reportBuilder.appendLine(prop + ": " + String(val));
                    }
                }
            }
            reportBuilder.appendLine("");
        }
        
        // Basic collection counts
        addBasicCollectionCounts(reportBuilder, data);
        
        // Processing information
        if (data.processingTime !== undefined) {
            reportBuilder.appendLine("PROCESSING INFORMATION");
            reportBuilder.appendLine(repeatString("-", 21));
            reportBuilder.appendLine("Processing time: " + data.processingTime + "ms");
            reportBuilder.appendLine("Analysis mode: " + mode);
            
            if (data.discoveryStats) {
                var stats = data.discoveryStats;
                if (stats.collectionsAnalyzed) reportBuilder.appendLine("Collections analyzed: " + stats.collectionsAnalyzed);
                if (stats.errorsEncountered) reportBuilder.appendLine("Errors handled: " + stats.errorsEncountered);
            }
            reportBuilder.appendLine("");
        }
    }
    
    reportBuilder.appendLine("RECOMMENDATIONS");
    reportBuilder.appendLine(repeatString("-", 13));
    reportBuilder.appendLine("- Document analyzed in basic mode for safety");
    reportBuilder.appendLine("- Use standard mode for text content analysis");
    reportBuilder.appendLine("- Use comprehensive mode for complete analysis");
}

// Add basic collection counts to report
function addBasicCollectionCounts(reportBuilder, data) {
    reportBuilder.appendLine("COLLECTION SUMMARY");
    reportBuilder.appendLine(repeatString("-", 18));
    
    var collections = ["pages", "textFrames", "layers", "stories"];
    var foundAny = false;
    
    for (var i = 0; i < collections.length; i++) {
        var collName = collections[i];
        var collData = data[collName];
        
        if (collData) {
            foundAny = true;
            var count = 0;
            
            if (typeof collData === 'number') {
                count = collData;
            } else if (collData.length !== undefined) {
                count = collData.length;
            } else if (collData.totalCount !== undefined) {
                count = collData.totalCount;
            } else if (Array.isArray && Array.isArray(collData)) {
                count = collData.length;
            }
            
            reportBuilder.appendLine(collName + ": " + count + " items");
        }
    }
    
    if (!foundAny) {
        reportBuilder.appendLine("No collection data available in this mode");
    }
    
    reportBuilder.appendLine("");
}

// Add structured report content - basic/standard modes
function addStructuredReportContent(reportBuilder, data, mode) {
    reportBuilder.appendLine("STRUCTURED ANALYSIS REPORT");
    reportBuilder.appendLine("Mode: " + mode + " (Balanced analysis with content sampling)");
    reportBuilder.appendLine("");
    
    if (data && typeof data === 'object') {
        // Enhanced document information
        addEnhancedDocumentSection(reportBuilder, data);
        
        // Collection details with structure
        addStructuredCollectionDetails(reportBuilder, data);
        
        // Text content summary if available
        if (data.textContent) {
            addTextContentSummary(reportBuilder, data.textContent, mode);
        }
        
        // Analysis metadata
        addAnalysisMetadata(reportBuilder, data, mode);
    }
}

// Add detailed report content - standard mode
function addDetailedReportContent(reportBuilder, data, mode) {
    reportBuilder.appendLine("DETAILED ANALYSIS REPORT");
    reportBuilder.appendLine("Mode: " + mode + " (Rich analysis with text content)");
    reportBuilder.appendLine("");
    
    if (data && typeof data === 'object') {
        // All structured content
        addStructuredReportContent(reportBuilder, data, mode);
        
        // Additional detailed sections
        if (data.textFrames && Array.isArray(data.textFrames)) {
            addTextFrameDetails(reportBuilder, data.textFrames, mode);
        }
        
        if (data.styles) {
            addStyleInformation(reportBuilder, data.styles, mode);
        }
        
        // Performance analysis
        addPerformanceAnalysis(reportBuilder, data, mode);
    }
}

// Add full report content - comprehensive mode
function addFullReportContent(reportBuilder, data, mode) {
    reportBuilder.appendLine("COMPREHENSIVE ANALYSIS REPORT");
    reportBuilder.appendLine("Mode: " + mode + " (Complete technical analysis)");
    reportBuilder.appendLine("");
    
    if (data && typeof data === 'object') {
        // All detailed content
        addDetailedReportContent(reportBuilder, data, mode);
        
        // Additional comprehensive sections
        if (data.images && Array.isArray(data.images)) {
            addImageLinkDetails(reportBuilder, data.images, "Images");
        }
        
        if (data.links && Array.isArray(data.links)) {
            addImageLinkDetails(reportBuilder, data.links, "Links");
        }
        
        if (data.colors && Array.isArray(data.colors)) {
            addColorFontDetails(reportBuilder, data.colors, "Colors");
        }
        
        if (data.fonts && Array.isArray(data.fonts)) {
            addColorFontDetails(reportBuilder, data.fonts, "Fonts");
        }
        
        // Technical analysis
        addTechnicalAnalysis(reportBuilder, data, mode);
    }
}

// Enhanced document section
function addEnhancedDocumentSection(reportBuilder, data) {
    if (!data.documentInfo) return;
    
    reportBuilder.appendLine("DOCUMENT ANALYSIS");
    reportBuilder.appendLine(repeatString("=", 17));
    
    var docInfo = data.documentInfo;
    
    // Essential information
    reportBuilder.appendLine("Essential Properties:");
    if (docInfo.name) reportBuilder.appendLine("  Document Name: " + docInfo.name);
    if (docInfo.filePath) reportBuilder.appendLine("  File Path: " + docInfo.filePath);
    if (docInfo.saved !== undefined) reportBuilder.appendLine("  Saved Status: " + (docInfo.saved ? "Saved" : "Unsaved"));
    if (docInfo.modified !== undefined) reportBuilder.appendLine("  Modified: " + (docInfo.modified ? "Yes" : "No"));
    if (docInfo.readonly !== undefined) reportBuilder.appendLine("  Read Only: " + (docInfo.readonly ? "Yes" : "No"));
    
    reportBuilder.appendLine("");
    
    // Layout information
    reportBuilder.appendLine("Layout Properties:");
    if (docInfo.pageWidth) reportBuilder.appendLine("  Page Width: " + docInfo.pageWidth);
    if (docInfo.pageHeight) reportBuilder.appendLine("  Page Height: " + docInfo.pageHeight);
    if (docInfo.facingPages !== undefined) reportBuilder.appendLine("  Facing Pages: " + (docInfo.facingPages ? "Yes" : "No"));
    if (docInfo.pagesPerDocument) reportBuilder.appendLine("  Total Pages: " + docInfo.pagesPerDocument);
    
    reportBuilder.appendLine("");
}

// Structured collection details
function addStructuredCollectionDetails(reportBuilder, data) {
    reportBuilder.appendLine("COLLECTION ANALYSIS");
    reportBuilder.appendLine(repeatString("=", 19));
    
    var collections = [
        {name: "pages", title: "Pages"},
        {name: "textFrames", title: "Text Frames"},
        {name: "layers", title: "Layers"},
        {name: "stories", title: "Stories"}
    ];
    
    for (var i = 0; i < collections.length; i++) {
        var coll = collections[i];
        var collData = data[coll.name];
        
        if (collData) {
            reportBuilder.appendLine(coll.title + ":");
            
            if (Array.isArray(collData)) {
                reportBuilder.appendLine("  Count: " + collData.length);
                if (collData.length > 0 && collData[0]) {
                    // Show sample of first item properties
                    var sample = collData[0];
                    reportBuilder.appendLine("  Sample Properties:");
                    for (var prop in sample) {
                        if (sample.hasOwnProperty && sample.hasOwnProperty(prop) && prop !== '_accessMethod' && prop !== '_mode') {
                            var val = sample[prop];
                            if (val !== null && val !== undefined) {
                                var valueStr = String(val).substring(0, 50);
                                reportBuilder.appendLine("    " + prop + ": " + valueStr);
                            }
                        }
                    }
                }
            } else if (typeof collData === 'object') {
                if (collData.totalCount !== undefined) {
                    reportBuilder.appendLine("  Count: " + collData.totalCount);
                }
                if (collData.note) {
                    reportBuilder.appendLine("  Note: " + collData.note);
                }
            }
            
            reportBuilder.appendLine("");
        }
    }
}

// Text content summary
function addTextContentSummary(reportBuilder, textContent, mode) {
    if (!textContent) return;
    
    reportBuilder.appendLine("TEXT CONTENT ANALYSIS");
    reportBuilder.appendLine(repeatString("=", 21));
    
    if (textContent.summary) {
        var summary = textContent.summary;
        reportBuilder.appendLine("Text Statistics:");
        if (summary.totalTextFrames !== undefined) reportBuilder.appendLine("  Total Text Frames: " + summary.totalTextFrames);
        if (summary.totalStories !== undefined) reportBuilder.appendLine("  Total Stories: " + summary.totalStories);
        if (summary.totalCharacters !== undefined) reportBuilder.appendLine("  Total Characters: " + summary.totalCharacters);
        if (summary.totalWords !== undefined) reportBuilder.appendLine("  Total Words: " + summary.totalWords);
        if (summary.totalParagraphs !== undefined) reportBuilder.appendLine("  Total Paragraphs: " + summary.totalParagraphs);
        if (summary.overflowingFrames !== undefined) reportBuilder.appendLine("  Overflowing Frames: " + summary.overflowingFrames);
        reportBuilder.appendLine("");
    }
    
    if (textContent.textStatistics) {
        var stats = textContent.textStatistics;
        reportBuilder.appendLine("Text Distribution:");
        if (stats.averageCharactersPerFrame !== undefined) reportBuilder.appendLine("  Avg Characters/Frame: " + stats.averageCharactersPerFrame);
        if (stats.averageWordsPerFrame !== undefined) reportBuilder.appendLine("  Avg Words/Frame: " + stats.averageWordsPerFrame);
        if (stats.overflowPercentage !== undefined) reportBuilder.appendLine("  Overflow Percentage: " + stats.overflowPercentage + "%");
        reportBuilder.appendLine("");
    }
    
    if (mode === "standard" || mode === "comprehensive") {
        reportBuilder.appendLine("Note: Text content analysis includes sampling and overflow detection");
        reportBuilder.appendLine("Use comprehensive mode for complete text frame analysis");
        reportBuilder.appendLine("");
    }
}

// Analysis metadata
function addAnalysisMetadata(reportBuilder, data, mode) {
    reportBuilder.appendLine("ANALYSIS METADATA");
    reportBuilder.appendLine(repeatString("=", 17));
    
    reportBuilder.appendLine("Analysis Configuration:");
    reportBuilder.appendLine("  Mode: " + mode);
    reportBuilder.appendLine("  Version: " + (data.analysisVersion || "2.1-estk-enhanced"));
    
    if (data.processingTime !== undefined) {
        reportBuilder.appendLine("  Processing Time: " + data.processingTime + "ms");
    }
    
    var modeConfig = ENHANCED_ANALYSIS_CONFIG.modes[mode];
    if (modeConfig) {
        reportBuilder.appendLine("  Timeout Limit: " + modeConfig.timeout + "ms");
        reportBuilder.appendLine("  Memory Limit: " + Math.round(modeConfig.memoryLimit / 1024) + "KB");
        reportBuilder.appendLine("  Collections Allowed: " + modeConfig.collections.length);
    }
    
    if (data.discoveryStats) {
        var stats = data.discoveryStats;
        reportBuilder.appendLine("");
        reportBuilder.appendLine("Processing Statistics:");
        if (stats.collectionsAnalyzed !== undefined) reportBuilder.appendLine("  Collections Analyzed: " + stats.collectionsAnalyzed);
        if (stats.textItemsProcessed !== undefined) reportBuilder.appendLine("  Text Items Processed: " + stats.textItemsProcessed);
        if (stats.errorsEncountered !== undefined) reportBuilder.appendLine("  Errors Handled: " + stats.errorsEncountered);
        if (stats.brokenPropertiesFound !== undefined) reportBuilder.appendLine("  Broken Properties: " + stats.brokenPropertiesFound);
    }
    
    if (data.errors && data.errors.length > 0) {
        reportBuilder.appendLine("");
        reportBuilder.appendLine("Error Summary: " + data.errors.length + " errors logged");
    }
    
    reportBuilder.appendLine("");
}

// Text frame details for detailed reports
function addTextFrameDetails(reportBuilder, textFrames, mode) {
    if (!textFrames || textFrames.length === 0) return;
    
    reportBuilder.appendLine("TEXT FRAME DETAILS");
    reportBuilder.appendLine(repeatString("=", 18));
    
    var sampleSize = Math.min(textFrames.length, mode === "comprehensive" ? 10 : 5);
    
    reportBuilder.appendLine("Showing " + sampleSize + " of " + textFrames.length + " text frames:");
    reportBuilder.appendLine("");
    
    for (var i = 0; i < sampleSize; i++) {
        var frame = textFrames[i];
        if (frame) {
            reportBuilder.appendLine("Text Frame " + (i + 1) + ":");
            if (frame.id) reportBuilder.appendLine("  ID: " + frame.id);
            if (frame.bounds) reportBuilder.appendLine("  Bounds: " + String(frame.bounds).substring(0, 50));
            if (frame.layer) reportBuilder.appendLine("  Layer: " + frame.layer);
            if (frame.textPreview) reportBuilder.appendLine("  Text Preview: \"" + frame.textPreview + "\"");
            if (frame.characterCount !== undefined) reportBuilder.appendLine("  Characters: " + frame.characterCount);
            if (frame.wordCount !== undefined) reportBuilder.appendLine("  Words: " + frame.wordCount);
            if (frame.overflows !== undefined) reportBuilder.appendLine("  Overflows: " + (frame.overflows ? "Yes" : "No"));
            reportBuilder.appendLine("");
        }
    }
    
    if (textFrames.length > sampleSize) {
        reportBuilder.appendLine("... and " + (textFrames.length - sampleSize) + " more text frames");
        reportBuilder.appendLine("");
    }
}

// Style information for detailed reports
function addStyleInformation(reportBuilder, styles, mode) {
    if (!styles) return;
    
    reportBuilder.appendLine("STYLE INFORMATION");
    reportBuilder.appendLine(repeatString("=", 17));
    
    if (styles.paragraphStyles && styles.paragraphStyles.length > 0) {
        reportBuilder.appendLine("Paragraph Styles (" + styles.paragraphStyles.length + "):");
        var pSampleSize = Math.min(styles.paragraphStyles.length, 5);
        
        for (var i = 0; i < pSampleSize; i++) {
            var style = styles.paragraphStyles[i];
            if (style && style.name) {
                reportBuilder.appendLine("  - " + style.name);
                if (style.fontFamily) reportBuilder.appendLine("    Font: " + style.fontFamily);
                if (style.fontSize) reportBuilder.appendLine("    Size: " + style.fontSize);
            }
        }
        if (styles.paragraphStyles.length > pSampleSize) {
            reportBuilder.appendLine("  ... and " + (styles.paragraphStyles.length - pSampleSize) + " more");
        }
        reportBuilder.appendLine("");
    }
    
    if (styles.characterStyles && styles.characterStyles.length > 0) {
        reportBuilder.appendLine("Character Styles (" + styles.characterStyles.length + "):");
        var cSampleSize = Math.min(styles.characterStyles.length, 5);
        
        for (var i = 0; i < cSampleSize; i++) {
            var style = styles.characterStyles[i];
            if (style && style.name) {
                reportBuilder.appendLine("  - " + style.name);
            }
        }
        if (styles.characterStyles.length > cSampleSize) {
            reportBuilder.appendLine("  ... and " + (styles.characterStyles.length - cSampleSize) + " more");
        }
        reportBuilder.appendLine("");
    }
}

// Image/Link details for comprehensive reports
function addImageLinkDetails(reportBuilder, items, sectionTitle) {
    if (!items || items.length === 0) return;
    
    reportBuilder.appendLine(sectionTitle.toUpperCase() + " ANALYSIS");
    reportBuilder.appendLine(repeatString("=", sectionTitle.length + 9));
    
    reportBuilder.appendLine("Total " + sectionTitle + ": " + items.length);
    
    var sampleSize = Math.min(items.length, 5);
    if (sampleSize > 0) {
        reportBuilder.appendLine("Sample " + sectionTitle + ":");
        reportBuilder.appendLine("");
        
        for (var i = 0; i < sampleSize; i++) {
            var item = items[i];
            if (item) {
                reportBuilder.appendLine((sectionTitle.substring(0, sectionTitle.length - 1)) + " " + (i + 1) + ":");
                if (item.name) reportBuilder.appendLine("  Name: " + item.name);
                if (item.status) reportBuilder.appendLine("  Status: " + item.status);
                if (item.filePath) reportBuilder.appendLine("  Path: " + item.filePath);
                if (item.size) reportBuilder.appendLine("  Size: " + item.size);
                
                // Image-specific properties
                if (sectionTitle === "Images") {
                    if (item.actualPpi) reportBuilder.appendLine("  Actual PPI: " + item.actualPpi);
                    if (item.effectivePpi) reportBuilder.appendLine("  Effective PPI: " + item.effectivePpi);
                }
                
                reportBuilder.appendLine("");
            }
        }
    }
    
    if (items.length > sampleSize) {
        reportBuilder.appendLine("... and " + (items.length - sampleSize) + " more " + sectionTitle.toLowerCase());
        reportBuilder.appendLine("");
    }
}

// Color/Font details for comprehensive reports
function addColorFontDetails(reportBuilder, items, sectionTitle) {
    if (!items || items.length === 0) return;
    
    reportBuilder.appendLine(sectionTitle.toUpperCase() + " ANALYSIS");
    reportBuilder.appendLine(repeatString("=", sectionTitle.length + 9));
    
    reportBuilder.appendLine("Total " + sectionTitle + ": " + items.length);
    
    var sampleSize = Math.min(items.length, 8);
    if (sampleSize > 0) {
        reportBuilder.appendLine("Sample " + sectionTitle + ":");
        
        for (var i = 0; i < sampleSize; i++) {
            var item = items[i];
            if (item && item.name) {
                reportBuilder.appendLine("  - " + item.name);
            }
        }
        
        if (items.length > sampleSize) {
            reportBuilder.appendLine("  ... and " + (items.length - sampleSize) + " more");
        }
    }
    
    reportBuilder.appendLine("");
}

// Performance analysis
function addPerformanceAnalysis(reportBuilder, data, mode) {
    reportBuilder.appendLine("PERFORMANCE ANALYSIS");
    reportBuilder.appendLine(repeatString("=", 20));
    
    if (data.processingTime !== undefined) {
        var processingTime = data.processingTime;
        var modeConfig = ENHANCED_ANALYSIS_CONFIG.modes[mode];
        var timeoutLimit = modeConfig ? modeConfig.timeout : 5000;
        
        reportBuilder.appendLine("Processing Performance:");
        reportBuilder.appendLine("  Total Time: " + processingTime + "ms");
        reportBuilder.appendLine("  Mode Timeout: " + timeoutLimit + "ms");
        reportBuilder.appendLine("  Performance: " + (processingTime < timeoutLimit / 2 ? "Excellent" : 
                                                     processingTime < timeoutLimit ? "Good" : "Slow"));
        
        var efficiency = timeoutLimit > 0 ? Math.round((1 - (processingTime / timeoutLimit)) * 100) : 0;
        if (efficiency > 0) {
            reportBuilder.appendLine("  Efficiency: " + efficiency + "%");
        }
        
        reportBuilder.appendLine("");
    }
    
    if (data.discoveryStats) {
        var stats = data.discoveryStats;
        reportBuilder.appendLine("Processing Statistics:");
        
        if (stats.textItemsProcessed !== undefined && data.processingTime !== undefined) {
            var itemsPerSecond = data.processingTime > 0 ? Math.round((stats.textItemsProcessed * 1000) / data.processingTime) : 0;
            reportBuilder.appendLine("  Items/Second: " + itemsPerSecond);
        }
        
        if (stats.errorsEncountered !== undefined) {
            var errorRate = stats.collectionsAnalyzed > 0 ? 
                Math.round((stats.errorsEncountered / stats.collectionsAnalyzed) * 100) : 0;
            reportBuilder.appendLine("  Error Rate: " + errorRate + "%");
        }
        
        reportBuilder.appendLine("");
    }
    
    reportBuilder.appendLine("Recommendations:");
    if (data.processingTime < (modeConfig ? modeConfig.timeout / 4 : 1250)) {
        reportBuilder.appendLine("  - Document processes quickly - suitable for higher analysis modes");
        reportBuilder.appendLine("  - Consider comprehensive mode for complete analysis");
    } else if (data.processingTime < (modeConfig ? modeConfig.timeout / 2 : 2500)) {
        reportBuilder.appendLine("  - Document processes at moderate speed - current mode appropriate");
        reportBuilder.appendLine("  - Higher modes may work but will take longer");
    } else {
        reportBuilder.appendLine("  - Document processes slowly - consider lower analysis mode");
        reportBuilder.appendLine("  - May have complex content or performance issues");
    }
    reportBuilder.appendLine("");
}

// Technical analysis for comprehensive reports
function addTechnicalAnalysis(reportBuilder, data, mode) {
    reportBuilder.appendLine("TECHNICAL ANALYSIS");
    reportBuilder.appendLine(repeatString("=", 18));
    
    reportBuilder.appendLine("Analysis Configuration:");
    reportBuilder.appendLine("  Mode: " + mode + " (Comprehensive)");
    reportBuilder.appendLine("  Engine: Enhanced InDesign Inspector v2.1-ESTK");
    reportBuilder.appendLine("  ES3 Compatibility: Yes");
    reportBuilder.appendLine("  Memory Management: Active");
    reportBuilder.appendLine("  Error Handling: Comprehensive");
    reportBuilder.appendLine("");
    
    if (data.errors && data.errors.length > 0) {
        reportBuilder.appendLine("Error Analysis:");
        var errorTypes = {};
        for (var i = 0; i < data.errors.length; i++) {
            var error = data.errors[i];
            var category = error.category || "general";
            errorTypes[category] = (errorTypes[category] || 0) + 1;
        }
        
        for (var errorType in errorTypes) {
            reportBuilder.appendLine("  " + errorType + ": " + errorTypes[errorType] + " errors");
        }
        reportBuilder.appendLine("");
    }
    
    if (ENHANCED_ANALYSIS_CONFIG.runtime.discoveredAlternatives) {
        var alternatives = ENHANCED_ANALYSIS_CONFIG.runtime.discoveredAlternatives;
        var altKeys = objectKeys(alternatives);
        if (altKeys.length > 0) {
            reportBuilder.appendLine("API Alternatives Discovered:");
            for (var i = 0; i < Math.min(altKeys.length, 5); i++) {
                var key = altKeys[i];
                reportBuilder.appendLine("  " + key + " -> " + alternatives[key]);
            }
            if (altKeys.length > 5) {
                reportBuilder.appendLine("  ... and " + (altKeys.length - 5) + " more alternatives");
            }
            reportBuilder.appendLine("");
        }
    }
    
    reportBuilder.appendLine("System Information:");
    reportBuilder.appendLine("  ESTK Debugging: " + (ENHANCED_ANALYSIS_CONFIG.debugging.enableESTKDebugging ? "Enabled" : "Disabled"));
    reportBuilder.appendLine("  Memory Cleanup: " + (ENHANCED_ANALYSIS_CONFIG.memoryManagement.enableActiveCleanup ? "Active" : "Disabled"));
    reportBuilder.appendLine("  Progress Tracking: " + (ENHANCED_ANALYSIS_CONFIG.stateManagement.enableProgressTracking ? "Enabled" : "Disabled"));
    reportBuilder.appendLine("");
}

// ============================================================================
// ENHANCED WORKFLOW FUNCTIONS WITH MODE AWARENESS
// ============================================================================

// Enhanced quick analysis and comparison workflow with mode integration
function quickCompare() {
    debugLog("Starting QuickCompare workflow with mode awareness", "WORKFLOW");
    enhancedStatusLog("WORKFLOW", "QuickCompare initializing", 0, 100, "Enhanced comparison workflow with mode selection");
    
    if (!app.documents.length) {
        alert("Please open a document first.");
        return;
    }
    
    var doc = app.activeDocument;
    
    // Start analysis session
    var currentMode = ENHANCED_ANALYSIS_CONFIG.runtime.currentMode || "basic";
    if (!startAnalysisSession(doc, currentMode)) {
        alert("Another analysis is already in progress. Please wait for it to complete.");
        return;
    }
    
    try {
        enhancedStatusLog("WORKFLOW", "Document validation", 5, 100, "Checking document state and capabilities");
        
        // Document capability detection
        var capabilities = detectDocumentCapabilities(doc);
        if (!capabilities.testResults.basicProperties) {
            var shouldUseEmergency = confirm("Document has accessibility issues.\n\nRecommended mode: " + capabilities.recommendedMode + 
                                           "\n\nUse emergency mode for maximum safety?");
            if (shouldUseEmergency) {
                setAnalysisMode("emergency");
                currentMode = "emergency";
            }
        }
        
        // Cache document properties for safe access
        var docSaved = safeGetProperty(doc, 'saved', false);
        var docPath = safeGetProperty(doc, 'filePath');
        var docName = safeGetProperty(doc, 'name', 'document').replace(/\.[^\.]+$/, "");
        
        // Ensure document is saved
        if (!docSaved || !docPath) {
            var shouldSave = confirm("Document must be saved for analysis. Save now?");
            if (shouldSave) {
                var saveFile = File.saveDialog("Save document for analysis", "*.indd");
                if (saveFile) {
                    try {
                        doc.save(saveFile);
                        docPath = safeGetProperty(doc, 'filePath');
                        docName = safeGetProperty(doc, 'name', 'document').replace(/\.[^\.]+$/, "");
                        debugLog("Document saved to: " + docPath, "FILE");
                        enhancedStatusLog("WORKFLOW", "Document saved", 10, 100, "Saved to: " + docPath);
                    } catch (exc) {
                        alert("Failed to save document: " + exc.message);
                        debugLog("Save failed: " + exc.message, "ERROR");
                        return;
                    }
                } else {
                    alert("Analysis cancelled - document must be saved.");
                    return;
                }
            } else {
                alert("Analysis cancelled - document must be saved.");
                return;
            }
        }
        
        // Enhanced file system access checking
        if (!checkFileAccess(docPath)) {
            alert("Cannot write to document folder: " + docPath + "\nCheck folder permissions or save document to a different location.");
            return;
        }
        
        UTILITY_STATE.currentDocument = doc;
        
        enhancedStatusLog("WORKFLOW", "Checking baseline", 15, 100, "Looking for existing baseline");
        
        // Check for existing baseline
        var baselineFile = File(docPath + "/" + docName + "_baseline.json");
        var currentFile = File(docPath + "/" + docName + "_current.json");
        
        debugLog("Checking baseline file: " + baselineFile.fsName, "FILE");
        
        if (!baselineFile.exists) {
            // Create baseline with current mode
            debugLog("Creating new baseline in " + currentMode + " mode", "BASELINE");
            enhancedStatusLog("WORKFLOW", "Creating baseline", 20, 100, "No baseline found - creating in " + currentMode + " mode");
            
            var baselineSuccess = showProgressDialog("Creating baseline analysis (" + currentMode + " mode)...", function() {
                try {
                    clearLargeObjects();
                    var report = createModeBasedReport(doc); // FIXED: Use mode-based analysis
                    if (!report) {
                        alert("Failed to create baseline analysis. Please check the document and try again.");
                        return false;
                    }
                    
                    if (!validateAnalysisReport(report)) {
                        alert("Generated report failed validation. Analysis may be incomplete but will proceed.");
                    }
                    
                    return saveReportSafely(baselineFile, report, "baseline");
                    
                } catch (exc) {
                    alert("Baseline creation failed: " + exc.message);
                    debugLog("Baseline creation failed: " + exc.message, "ERROR");
                    clearLargeObjects();
                    return false;
                }
            });
            
            if (!baselineSuccess) {
                return;
            }
            
            UTILITY_STATE.reportFiles.baseline = baselineFile;
            enhancedStatusLog("WORKFLOW", "Baseline created", 100, 100, "New baseline ready for future comparisons (" + currentMode + " mode)");
            showBaselineCreatedDialog(currentMode);
            return;
        }
        
        enhancedStatusLog("WORKFLOW", "Creating current analysis", 30, 100, "Analyzing current document state (" + currentMode + " mode)");
        
        // Create current report with mode awareness
        debugLog("Creating current document analysis in " + currentMode + " mode", "CURRENT");
        var currentReport = null;
        var currentSuccess = showProgressDialog("Analyzing current document (" + currentMode + " mode)...", function() {
            try {
                clearLargeObjects();
                currentReport = createModeBasedReport(doc); // FIXED: Use mode-based analysis
                if (!currentReport) {
                    alert("Failed to analyze current document. Please check for errors and try again.");
                    return false;
                }
                
                if (!validateAnalysisReport(currentReport)) {
                    alert("Current analysis may be incomplete - proceeding with available data.");
                }
                
                return saveReportSafely(currentFile, currentReport, "current");
                
            } catch (exc) {
                alert("Current analysis failed: " + exc.message);
                debugLog("Current analysis failed: " + exc.message, "ERROR");
                clearLargeObjects();
                return false;
            }
        });
        
        if (!currentReport || !currentSuccess) {
            clearLargeObjects();
            return;
        }
        
        UTILITY_STATE.reportFiles.current = currentFile;
        UTILITY_STATE.lastAnalysisReport = currentReport;
        
        enhancedStatusLog("WORKFLOW", "Loading baseline", 50, 100, "Loading baseline for comparison");
        
        // Load baseline report
        debugLog("Loading baseline report", "BASELINE");
        var baselineReport = null;
        try {
            baselineFile.open("r");
            var baselineContent = baselineFile.read();
            baselineFile.close();
            
            if (!baselineContent || baselineContent.length === 0) {
                alert("Baseline file is empty or corrupted. Please recreate the baseline.");
                clearLargeObjects();
                return;
            }
            
            if (baselineContent.length > UTILITY_CONFIG.maxReportFileSize) {
                alert("Baseline file is too large (" + Math.round(baselineContent.length / 1024 / 1024) + "MB). Consider recreating with current optimized version.");
                clearLargeObjects();
                return;
            }
            
            baselineReport = JSON.parse(baselineContent);
            baselineContent = null; // Clear from memory
            
            if (!validateAnalysisReport(baselineReport)) {
                alert("Baseline report is invalid or from incompatible version. Consider recreating the baseline.");
            }
            
            debugLog("Baseline loaded successfully", "BASELINE");
            enhancedStatusLog("WORKFLOW", "Baseline loaded", 60, 100, "Baseline ready for comparison");
            
        } catch (exc) {
            alert("Failed to load baseline report: " + exc.message + "\nConsider recreating the baseline.");
            debugLog("Baseline load failed: " + exc.message, "ERROR");
            clearLargeObjects();
            return;
        }
        
        enhancedStatusLog("WORKFLOW", "Performing comparison", 70, 100, "Comparing current state to baseline");
        
        // Enhanced comparison
        debugLog("Starting document comparison", "COMPARE");
        var differences = null;
        var comparisonSuccess = showProgressDialog("Performing comparison (" + currentMode + " mode)...", function() {
            try {
                differences = compareDocumentReports(baselineReport, currentReport);
                
                // Clear large report objects from memory
                baselineReport = null;
                currentReport = null;
                clearLargeObjects();
                
                if (!differences) {
                    alert("Comparison failed - no results generated.");
                    return false;
                }
                
                if (!validateComparisonResults(differences)) {
                    alert("Comparison results may be incomplete - proceeding with available data.");
                }
                
                debugLog("Comparison completed successfully", "COMPARE");
                return true;
                
            } catch (exc) {
                alert("Comparison failed: " + exc.message);
                debugLog("Comparison failed: " + exc.message, "ERROR");
                clearLargeObjects();
                return false;
            }
        });
        
        if (!differences || !comparisonSuccess) {
            clearLargeObjects();
            return;
        }
        
        UTILITY_STATE.lastComparisonResult = differences;
        
        enhancedStatusLog("WORKFLOW", "Generating reports", 85, 100, "Creating mode-appropriate report suite");
        
        // Create mode-appropriate report suite
        debugLog("Generating mode-appropriate report suite", "REPORTS");
        var reportSuiteSuccess = showProgressDialog("Generating reports (" + currentMode + " mode)...", function() {
            try {
                return createIncrementalReportSuite(differences, docPath, docName, currentMode);
            } catch (exc) {
                alert("Report generation failed: " + exc.message);
                debugLog("Report generation failed: " + exc.message, "ERROR");
                clearLargeObjects();
                return false;
            }
        });
        
        if (!reportSuiteSuccess) {
            clearLargeObjects();
            return;
        }
        
        enhancedStatusLog("WORKFLOW", "QuickCompare completed", 100, 100, "Analysis complete - displaying results (" + currentMode + " mode)");
        
        // Display enhanced comparison results
        showEnhancedComparisonDialog(differences, currentMode);
        
        // Final cleanup
        clearLargeObjects();
        debugLog("QuickCompare workflow completed in " + currentMode + " mode", "WORKFLOW");
        
    } finally {
        endAnalysisSession();
    }
}

// Create incremental report suite based on mode
function createIncrementalReportSuite(differences, docPath, docName, mode) {
    try {
        debugLog("Creating incremental report suite for " + mode + " mode", "REPORTS");
        enhancedStatusLog("REPORTS", "Creating mode-appropriate report suite", 0, 6, "Mode: " + mode);
        
        var modeConfig = ENHANCED_ANALYSIS_CONFIG.modes[mode];
        var reportComplexity = modeConfig ? modeConfig.reportComplexity : "basic";
        
        // Create mode-appropriate reports
        var reports = {
            summary: createModeAppropriateReport(differences, mode, "summary"),
            comparison: differences
        };
        
        // Add additional reports based on mode complexity
        if (reportComplexity !== "minimal") {
            enhancedStatusLog("REPORTS", "Adding technical analysis", 2, 6, "Enhanced technical report");
            reports.technical = createModeAwareTechnicalSummary(differences, mode);
        }
        
        if (reportComplexity === "detailed" || reportComplexity === "full") {
            enhancedStatusLog("REPORTS", "Adding detailed analysis", 3, 6, "Detailed change analysis");
            reports.textAnalysis = createModeAwareTextAnalysis(differences, mode);
        }
        
        if (reportComplexity === "full") {
            enhancedStatusLog("REPORTS", "Adding access guide", 4, 6, "Complete access path guide");
            reports.accessGuide = createModeAwareAccessGuide(differences, mode);
        }
        
        enhancedStatusLog("REPORTS", "Saving report files", 5, 6, "Writing reports to disk");
        
        // Save reports with mode-appropriate naming
        var timestamp = mode !== "emergency" ? "" : "_emergency_" + new Date().getTime();
        var reportFiles = {
            comparison: File(docPath + "/" + docName + "_comparison" + timestamp + ".json"),
            summary: File(docPath + "/" + docName + "_summary_" + mode + timestamp + ".txt")
        };
        
        // Save JSON comparison data
        if (!saveReportSafely(reportFiles.comparison, reports.comparison, "comparison")) {
            return false;
        }
        
        // Save text reports
        var textReports = [
            {file: reportFiles.summary, content: reports.summary, type: "summary"}
        ];
        
        if (reports.technical) {
            var techFile = File(docPath + "/" + docName + "_technical_" + mode + timestamp + ".txt");
            textReports.push({file: techFile, content: reports.technical, type: "technical"});
        }
        
        if (reports.textAnalysis) {
            var textFile = File(docPath + "/" + docName + "_text_analysis_" + mode + timestamp + ".txt");
            textReports.push({file: textFile, content: reports.textAnalysis, type: "text analysis"});
        }
        
        if (reports.accessGuide) {
            var accessFile = File(docPath + "/" + docName + "_access_guide_" + mode + timestamp + ".txt");
            textReports.push({file: accessFile, content: reports.accessGuide, type: "access guide"});
        }
        
        for (var i = 0; i < textReports.length; i++) {
            var report = textReports[i];
            try {
                report.file.open("w");
                report.file.write(report.content);
                report.file.close();
                debugLog("Saved " + report.type + " report: " + report.file.name, "REPORTS");
            } catch (exc) {
                alert("Failed to save " + report.type + ": " + exc.message);
                debugLog("Failed to save " + report.type + ": " + exc.message, "ERROR");
                return false;
            }
        }
        
        UTILITY_STATE.reportFiles = reportFiles;
        enhancedStatusLog("REPORTS", "Report suite completed", 6, 6, "All " + mode + " mode reports generated successfully");
        debugLog("Incremental report suite created successfully for " + mode + " mode", "REPORTS");
        return true;
        
    } catch (exc) {
        alert("Report generation failed: " + exc.message);
        debugLog("Report generation failed: " + exc.message, "ERROR");
        return false;
    }
}

// Mode-aware technical summary
function createModeAwareTechnicalSummary(differences, mode) {
    var builder = es3OptimizedStringBuilder();
    
    builder.appendLine("MODE-AWARE TECHNICAL ANALYSIS");
    builder.appendLine("Generated: " + new Date().toString());
    builder.appendLine("Analysis Mode: " + mode.toUpperCase());
    builder.appendLine("Engine: Enhanced InDesign Inspector v2.1-ESTK");
    builder.appendLine(repeatString("=", 50));
    builder.appendLine("");
    
    // Mode-specific technical information
    var modeConfig = ENHANCED_ANALYSIS_CONFIG.modes[mode];
    if (modeConfig) {
        builder.appendLine("MODE CONFIGURATION");
        builder.appendLine(repeatString("-", 18));
        builder.appendLine("Description: " + modeConfig.description);
        builder.appendLine("Timeout: " + modeConfig.timeout + "ms");
        builder.appendLine("Memory Limit: " + Math.round(modeConfig.memoryLimit / 1024) + "KB");
        builder.appendLine("Collections Allowed: " + modeConfig.collections.length);
        builder.appendLine("Report Complexity: " + modeConfig.reportComplexity);
        builder.appendLine("Safety Level: " + modeConfig.propertyTesting);
        builder.appendLine("");
    }
    
    // Analysis statistics
    var diffSummary = safeGetProperty(differences, 'summary');
    if (diffSummary) {
        builder.appendLine("ANALYSIS RESULTS");
        builder.appendLine(repeatString("-", 16));
        builder.appendLine("Changes Detected: " + (safeGetProperty(diffSummary, 'hasChanges') ? "Yes" : "No"));
        builder.appendLine("Total Changes: " + safeGetProperty(diffSummary, 'totalChanges', 0));
        builder.appendLine("Significant Changes: " + safeGetProperty(diffSummary, 'significantChanges', 0));
        
        var changedSections = safeGetProperty(diffSummary, 'changedSections', []);
        builder.appendLine("Changed Sections: " + changedSections.length);
        
        if (changedSections.length > 0) {
            builder.appendLine("Sections: " + changedSections.join(", "));
        }
        builder.appendLine("");
    }
    
    // Mode-specific recommendations
    builder.appendLine("MODE RECOMMENDATIONS");
    builder.appendLine(repeatString("-", 20));
    
    switch (mode) {
        case "emergency":
            builder.appendLine("- Emergency mode used for maximum safety");
            builder.appendLine("- Only essential properties analyzed");
            builder.appendLine("- Consider minimal mode if document is stable");
            break;
        case "minimal":
            builder.appendLine("- Minimal mode used for safe basic analysis");
            builder.appendLine("- Limited to safest collections only");
            builder.appendLine("- Try basic mode for more detailed analysis");
            break;
        case "basic":
            builder.appendLine("- Basic mode provides balanced safety and detail");
            builder.appendLine("- Suitable for most document analysis needs");
            builder.appendLine("- Use standard mode for text content analysis");
            break;
        case "standard":
            builder.appendLine("- Standard mode includes text content analysis");
            builder.appendLine("- Good balance of detail and performance");
            builder.appendLine("- Try comprehensive mode for complete analysis");
            break;
        case "comprehensive":
            builder.appendLine("- Comprehensive mode provides complete analysis");
            builder.appendLine("- Includes all collections and properties");
            builder.appendLine("- Maximum detail with pre-tested safety measures");
            break;
    }
    
    var result = builder.toString();
    builder.clear();
    return result;
}

// Mode-aware text analysis
function createModeAwareTextAnalysis(differences, mode) {
    var builder = es3OptimizedStringBuilder();
    
    builder.appendLine("MODE-AWARE TEXT CONTENT ANALYSIS");
    builder.appendLine("Generated: " + new Date().toString());
    builder.appendLine("Analysis Mode: " + mode.toUpperCase());
    builder.appendLine(repeatString("=", 50));
    builder.appendLine("");
    
    // Mode-specific text analysis
    if (mode === "emergency" || mode === "minimal") {
        builder.appendLine("TEXT ANALYSIS LIMITATIONS");
        builder.appendLine(repeatString("-", 25));
        builder.appendLine("Mode: " + mode);
        builder.appendLine("Text Analysis: Limited or not available in this mode");
        builder.appendLine("Recommendation: Use standard or comprehensive mode for text analysis");
        builder.appendLine("");
    } else {
        // Include text analysis for higher modes
        var textContentChanges = safeGetProperty(safeGetProperty(differences, 'changes'), 'textContent');
        if (textContentChanges && textContentChanges.length > 0) {
            builder.appendLine("TEXT CONTENT CHANGES DETECTED");
            builder.appendLine(repeatString("-", 30));
            builder.appendLine("");
            
            var maxChanges = mode === "comprehensive" ? 10 : 5;
            for (var i = 0; i < Math.min(textContentChanges.length, maxChanges); i++) {
                var change = textContentChanges[i];
                
                builder.appendLine("Change " + (i + 1) + ":");
                builder.appendLine("  Path: " + safeGetProperty(change, 'path', 'unknown'));
                builder.appendLine("  Type: " + safeGetProperty(change, 'type', 'unknown'));
                builder.appendLine("  Significance: " + safeGetProperty(change, 'significance', 'medium'));
                
                if (safeGetProperty(change, 'type') === "text_content_change") {
                    var oldText = safeGetProperty(change, 'oldValue', "");
                    var newText = safeGetProperty(change, 'newValue', "");
                    
                    var previewLength = mode === "comprehensive" ? 100 : 50;
                    builder.appendLine("  Old: \"" + oldText.substring(0, previewLength) + (oldText.length > previewLength ? "..." : "") + "\"");
                    builder.appendLine("  New: \"" + newText.substring(0, previewLength) + (newText.length > previewLength ? "..." : "") + "\"");
                }
                builder.appendLine("");
            }
            
            if (textContentChanges.length > maxChanges) {
                builder.appendLine("... and " + (textContentChanges.length - maxChanges) + " more text changes");
                builder.appendLine("");
            }
        } else {
            builder.appendLine("No text content changes detected in " + mode + " mode analysis");
            builder.appendLine("");
        }
    }
    
    var result = builder.toString();
    builder.clear();
    return result;
}

// Mode-aware access guide
function createModeAwareAccessGuide(differences, mode) {
    var builder = es3OptimizedStringBuilder();
    
    builder.appendLine("MODE-AWARE OBJECT MODEL ACCESS GUIDE");
    builder.appendLine("Generated: " + new Date().toString());
    builder.appendLine("Analysis Mode: " + mode.toUpperCase());
    builder.appendLine(repeatString("=", 50));
    builder.appendLine("");
    
    builder.appendLine("MODE-SPECIFIC ACCESS PATTERNS");
    builder.appendLine(repeatString("-", 29));
    
    var modeConfig = ENHANCED_ANALYSIS_CONFIG.modes[mode];
    if (modeConfig) {
        builder.appendLine("Allowed Collections in " + mode + " mode:");
        for (var i = 0; i < modeConfig.collections.length; i++) {
            var collName = modeConfig.collections[i];
            var safety = ENHANCED_ANALYSIS_CONFIG.collectionSafety[collName] || "unknown";
            builder.appendLine("  - " + collName + " (safety: " + safety + ")");
        }
        builder.appendLine("");
        
        builder.appendLine("Safety Guidelines for " + mode + " mode:");
        builder.appendLine("  - Timeout limit: " + modeConfig.timeout + "ms");
        builder.appendLine("  - Memory limit: " + Math.round(modeConfig.memoryLimit / 1024) + "KB");
        builder.appendLine("  - Property testing: " + modeConfig.propertyTesting);
        builder.appendLine("");
    }
    
    // Add discovered alternatives if available
    if (ENHANCED_ANALYSIS_CONFIG.runtime.discoveredAlternatives) {
        var alternatives = ENHANCED_ANALYSIS_CONFIG.runtime.discoveredAlternatives;
        var altKeys = objectKeys(alternatives);
        if (altKeys.length > 0) {
            builder.appendLine("DISCOVERED API ALTERNATIVES");
            builder.appendLine(repeatString("-", 27));
            for (var i = 0; i < altKeys.length; i++) {
                var key = altKeys[i];
                builder.appendLine("  " + key + " -> " + alternatives[key]);
            }
            builder.appendLine("");
        }
    }
    
    builder.appendLine("MODE PROGRESSION GUIDE");
    builder.appendLine(repeatString("-", 22));
    builder.appendLine("Recommended progression based on document stability:");
    builder.appendLine("  1. emergency  -> Ultra-safe (properties only)");
    builder.appendLine("  2. minimal    -> Safe (basic collections)");
    builder.appendLine("  3. basic      -> Moderate (safe collections)");
    builder.appendLine("  4. standard   -> Balanced (+ text content)");
    builder.appendLine("  5. comprehensive -> Complete (all features)");
    builder.appendLine("");
    
    builder.appendLine("Current mode (" + mode + ") provides:");
    switch (mode) {
        case "emergency":
            builder.appendLine("  - Property access only");
            builder.appendLine("  - No collection iteration");
            builder.appendLine("  - Ultra-fast timeouts");
            break;
        case "minimal":
            builder.appendLine("  - Safe collection access");
            builder.appendLine("  - Basic document properties");
            builder.appendLine("  - Conservative timeouts");
            break;
        case "basic":
            builder.appendLine("  - Safe collection analysis");
            builder.appendLine("  - Document structure info");
            builder.appendLine("  - Moderate timeouts");
            break;
        case "standard":
            builder.appendLine("  - Text content sampling");
            builder.appendLine("  - Story and frame analysis");
            builder.appendLine("  - Balanced timeouts");
            break;
        case "comprehensive":
            builder.appendLine("  - Complete feature analysis");
            builder.appendLine("  - All collections with pre-testing");
            builder.appendLine("  - Extended timeouts");
            break;
    }
    
    var result = builder.toString();
    builder.clear();
    return result;
}

// ============================================================================
// ENHANCED UTILITY FUNCTIONS - MODE-AWARE VERSIONS
// ============================================================================

// Enhanced analysis report validation
function validateAnalysisReport(report) {
    debugLog("Validating analysis report", "VALIDATE");
    enhancedStatusLog("VALIDATE", "Report validation", 0, 4, "Checking report structure");
    
    if (!report || typeof report !== 'object') {
        debugLog("Report validation failed: invalid object", "ERROR");
        return false;
    }
    
    // Check for required sections
    var requiredSections = ['timestamp', 'analysisVersion'];
    for (var i = 0; i < requiredSections.length; i++) {
        if (!safeGetProperty(report, requiredSections[i])) {
            debugLog("Report validation failed: missing " + requiredSections[i], "ERROR");
            enhancedStatusLog("VALIDATE", "Validation failed", 4, 4, "Missing: " + requiredSections[i]);
            return false;
        }
    }
    
    enhancedStatusLog("VALIDATE", "Checking mode", 1, 4, "Verifying mode compatibility");
    
    // Check mode information
    var reportMode = safeGetProperty(report, 'mode');
    if (reportMode) {
        var validModes = ["emergency", "minimal", "basic", "standard", "comprehensive"];
        var isModeValid = false;
        for (var i = 0; i < validModes.length; i++) {
            if (stringIndexOf(reportMode.toLowerCase(), validModes[i]) !== -1) {
                isModeValid = true;
                break;
            }
        }
        if (!isModeValid) {
            debugLog("Report validation warning: unknown mode " + reportMode, "WARN");
        }
    }
    
    enhancedStatusLog("VALIDATE", "Checking version", 2, 4, "Verifying compatibility");
    
    // Check version compatibility
    var analysisVersion = safeGetProperty(report, 'analysisVersion');
    if (analysisVersion && stringIndexOf(analysisVersion, '2.1') === -1) {
        debugLog("Report version mismatch: " + analysisVersion, "WARN");
        enhancedStatusLog("VALIDATE", "Version mismatch", 3, 4, "Version: " + analysisVersion);
        return true; // Still valid, just potentially incompatible
    }
    
    enhancedStatusLog("VALIDATE", "Validation passed", 4, 4, "Report is valid");
    debugLog("Report validation passed", "VALIDATE");
    return true;
}

// Enhanced comparison results validation
function validateComparisonResults(differences) {
    debugLog("Validating comparison results", "VALIDATE");
    enhancedStatusLog("VALIDATE", "Comparison validation", 0, 3, "Checking comparison structure");
    
    if (!differences || typeof differences !== 'object') {
        debugLog("Comparison validation failed: invalid object", "ERROR");
        return false;
    }
    
    // Check for required structure
    var summary = safeGetProperty(differences, 'summary');
    var changes = safeGetProperty(differences, 'changes');
    if (!summary || !changes) {
        debugLog("Comparison validation failed: missing summary or changes", "ERROR");
        enhancedStatusLog("VALIDATE", "Validation failed", 3, 3, "Missing summary or changes");
        return false;
    }
    
    enhancedStatusLog("VALIDATE", "Checking summary", 1, 3, "Validating comparison summary");
    
    // Validate summary structure
    var hasChanges = safeGetProperty(summary, 'hasChanges');
    if (typeof hasChanges !== 'boolean') {
        debugLog("Comparison validation warning: invalid hasChanges type", "WARN");
    }
    
    enhancedStatusLog("VALIDATE", "Comparison validation passed", 3, 3, "Results are valid");
    debugLog("Comparison validation passed", "VALIDATE");
    return true;
}

// Enhanced safe report saving with mode awareness
function saveReportSafely(file, report, reportType) {
    var currentMode = ENHANCED_ANALYSIS_CONFIG.runtime.currentMode || "basic";
    var modeConfig = ENHANCED_ANALYSIS_CONFIG.modes[currentMode];
    var memoryLimit = modeConfig ? modeConfig.memoryLimit : 4194304;
    
    debugLog("Saving " + reportType + " report in " + currentMode + " mode: " + file.fsName, "FILE");
    enhancedStatusLog("FILE", "Saving " + reportType + " report", 0, 8, "Mode: " + currentMode + ", File: " + file.name);
    
    try {
        // Enhanced file system access checking
        var folderPath = file.path;
        if (!checkFileAccess(folderPath)) {
            alert("Cannot write to folder: " + folderPath + "\nCheck permissions or choose a different location.");
            return false;
        }
        
        enhancedStatusLog("FILE", "Creating backup", 1, 8, "Backing up existing file if present");
        
        // Create backup if file exists
        if (UTILITY_CONFIG.createBackups && file.exists) {
            try {
                var backupFile = File(file.path + "/" + file.name.replace(/\.json$/, "_backup.json"));
                file.copy(backupFile);
                debugLog("Backup created: " + backupFile.name, "FILE");
                enhancedStatusLog("FILE", "Backup created", 2, 8, "Backup: " + backupFile.name);
            } catch (exc) {
                debugLog("Backup creation failed: " + exc.message, "WARN");
            }
        }
        
        enhancedStatusLog("FILE", "Serializing report", 3, 8, "Converting report to JSON");
        
        // Prepare JSON string with error handling
        var jsonString;
        try {
            jsonString = JSON.stringify(report, null, 2);
        } catch (stringifyError) {
            debugLog("JSON stringify failed: " + stringifyError.message, "ERROR");
            alert("Failed to serialize " + reportType + " report: " + stringifyError.message);
            return false;
        }
        
        enhancedStatusLog("FILE", "Checking size limits", 4, 8, "Verifying report size for " + currentMode + " mode");
        
        // Mode-aware memory and size checking
        if (jsonString.length > memoryLimit) {
            // Try to create a mode-appropriate simplified version
            try {
                var simplifiedReport = createSimplifiedReport(report, reportType, currentMode);
                jsonString = JSON.stringify(simplifiedReport, null, 2);
                alert("Report was simplified for " + currentMode + " mode due to size constraints (" + 
                      Math.round(jsonString.length / 1024) + "KB vs " + 
                      Math.round(memoryLimit / 1024) + "KB limit).");
                debugLog("Report simplified for " + currentMode + " mode", "WARN");
                enhancedStatusLog("FILE", "Report simplified", 5, 8, "Size reduced for " + currentMode + " mode");
            } catch (exc) {
                alert("Report too large for " + currentMode + " mode and simplification failed: " + exc.message);
                return false;
            }
        } else {
            enhancedStatusLog("FILE", "Size check passed", 5, 8, "Report size acceptable for " + currentMode + " mode");
        }
        
        enhancedStatusLog("FILE", "Writing file", 6, 8, "Saving to disk");
        
        // Save file with enhanced error handling
        try {
            file.open("w");
            file.write(jsonString);
            file.close();
        } catch (writeError) {
            alert("Failed to write " + reportType + " file: " + writeError.message);
            debugLog("File write failed: " + writeError.message, "ERROR");
            return false;
        }
        
        enhancedStatusLog("FILE", "Verifying file", 7, 8, "Checking file integrity");
        
        // Verify file was written correctly
        if (!file.exists || file.length === 0) {
            alert("File write verification failed for: " + reportType);
            debugLog("File verification failed", "ERROR");
            return false;
        }
        
        // Clear the large JSON string from memory
        jsonString = null;
        report = null;
        clearLargeObjects();
        
        enhancedStatusLog("FILE", "Save completed", 8, 8, "File saved successfully: " + file.length + " bytes");
        debugLog("Report saved successfully in " + currentMode + " mode: " + file.length + " bytes", "FILE");
        return true;
        
    } catch (exc) {
        alert("Failed to save " + reportType + " report: " + exc.message);
        debugLog("Save operation failed: " + exc.message, "ERROR");
        enhancedStatusLog("FILE", "Save failed", 8, 8, "Error: " + exc.message);
        return false;
    }
}

// Create simplified report with mode awareness
function createSimplifiedReport(report, reportType, mode) {
    var modeConfig = ENHANCED_ANALYSIS_CONFIG.modes[mode];
    var maxSize = modeConfig ? modeConfig.memoryLimit : 2097152; // Default 2MB
    
    return {
        timestamp: safeGetProperty(report, 'timestamp'),
        analysisVersion: safeGetProperty(report, 'analysisVersion'),
        mode: mode,
        documentInfo: safeGetProperty(report, 'documentInfo'),
        summary: "Report simplified for " + mode + " mode due to size constraints",
        originalProcessingTime: safeGetProperty(report, 'processingTime'),
        errors: (safeGetProperty(report, 'errors', []) || []).slice(0, 10), // Limit errors
        discoveryStats: safeGetProperty(report, 'discoveryStats', {}),
        note: "Reduced content for " + mode + " mode - use higher mode for full analysis",
        simplificationReason: "Exceeded " + Math.round(maxSize / 1024) + "KB limit for " + mode + " mode",
        reportType: reportType,
        memoryLimit: maxSize
    };
}

// Progress dialog with mode information
function showProgressDialog(message, operation) {
    if (!UTILITY_CONFIG.enableProgressDialogs) {
        return operation();
    }
    
    var currentMode = ENHANCED_ANALYSIS_CONFIG.runtime.currentMode || "basic";
    enhancedStatusLog("PROGRESS", "Showing progress dialog", 0, 1, message + " (" + currentMode + " mode)");
    
    var progressDialog = new Window("dialog", "Enhanced Analysis in Progress (" + currentMode.toUpperCase() + " Mode)");
    progressDialog.preferredSize.width = 500;
    progressDialog.preferredSize.height = 200;
    
    var progressGroup = progressDialog.add("group");
    progressGroup.orientation = "column";
    progressGroup.alignment = "fill";
    
    var titleText = progressGroup.add("statictext", undefined, "Enhanced InDesign Inspector v2.1-ESTK");
    titleText.alignment = "center";
    
    var modeText = progressGroup.add("statictext", undefined, "Analysis Mode: " + currentMode.toUpperCase());
    modeText.alignment = "center";
    
    var messageText = progressGroup.add("statictext", undefined, message);
    messageText.alignment = "center";
    messageText.preferredSize.height = 30;
    
    var progressBar = progressGroup.add("progressbar", undefined, 0, 100);
    progressBar.alignment = "fill";
    progressBar.preferredSize.height = 12;
    
    var statusText = progressGroup.add("statictext", undefined, "Processing...");
    statusText.alignment = "center";
    statusText.preferredSize.height = 25;
    
    var detailText = progressGroup.add("statictext", undefined, "ESTK Debug: Check console for detailed progress");
    detailText.alignment = "center";
    
    try {
        progressDialog.show();
    } catch (exc) {
        return operation();
    }
    
    try {
        var modeConfig = ENHANCED_ANALYSIS_CONFIG.modes[currentMode];
        var timeoutInfo = modeConfig ? "Timeout: " + modeConfig.timeout + "ms" : "";
        
        // Enhanced progress simulation with mode information
        var stages = [
            "Initializing " + currentMode + " mode...", 
            "Loading document...", 
            "Processing collections...", 
            "Analyzing content...", 
            "Finalizing..."
        ];
        
        for (var i = 0; i < stages.length; i++) {
            statusText.text = stages[i];
            progressBar.value = (i / stages.length) * 90;
            progressDialog.update();
            $.writeln("[PROGRESS] [" + currentMode.toUpperCase() + "] " + stages[i] + " " + timeoutInfo);
            
            // Brief pause
            var startTime = new Date().getTime();
            while (new Date().getTime() - startTime < 150) {
                // Brief pause
            }
        }
        
        // Run operation
        statusText.text = "Completing " + currentMode + " analysis...";
        progressBar.value = 95;
        progressDialog.update();
        $.writeln("[PROGRESS] [" + currentMode.toUpperCase() + "] Running main operation...");
        
        var result = operation();
        
        progressBar.value = 100;
        statusText.text = currentMode.charAt(0).toUpperCase() + currentMode.slice(1) + " analysis complete!";
        progressDialog.update();
        $.writeln("[PROGRESS] [" + currentMode.toUpperCase() + "] Operation completed successfully");
        
        // Brief pause to show completion
        var startTime = new Date().getTime();
        while (new Date().getTime() - startTime < 400) {
            // Show completion
        }
        
        progressDialog.close();
        return result;
        
    } catch (exc) {
        progressDialog.close();
        $.writeln("[ERROR] [" + currentMode.toUpperCase() + "] Progress dialog operation failed: " + exc.message);
        throw exc;
    }
}

// Show baseline created dialog with mode information
function showBaselineCreatedDialog(mode) {
    var dialog = new Window("dialog", "Baseline Created Successfully (" + mode.toUpperCase() + " Mode)");
    dialog.preferredSize.width = 500;
    dialog.preferredSize.height = 380;
    
    var mainGroup = dialog.add("group");
    mainGroup.orientation = "column";
    mainGroup.alignment = "fill";
    
    var successPanel = mainGroup.add("panel", undefined, "Baseline Analysis Complete");
    successPanel.alignment = "fill";
    
    var modeConfig = ENHANCED_ANALYSIS_CONFIG.modes[mode];
    var modeDescription = modeConfig ? modeConfig.description : "Unknown mode";
    
    var successText = successPanel.add("statictext", undefined, 
        "Comprehensive baseline analysis created successfully!\n\n" +
        "ANALYSIS MODE: " + mode.toUpperCase() + "\n" +
        "Description: " + modeDescription + "\n\n" +
        "The inspector has captured document properties\n" +
        "appropriate for " + mode + " mode analysis.\n\n" +
        "CAPTURED DATA (Mode-specific):\n" +
        getModeSpecificCaptureInfo(mode) + "\n\n" +
        "Next steps:\n" +
        "1. Make changes to your document\n" +
        "2. Run Quick Compare again to see differences\n" +
        "3. Review the mode-appropriate change reports\n" +
        "4. Use higher modes for more detailed analysis",
        {multiline: true});
    successText.alignment = "fill";
    
    var buttonGroup = mainGroup.add("group");
    buttonGroup.alignment = "center";
    
    var viewFolderBtn = buttonGroup.add("button", undefined, "Open Report Folder");
    var okBtn = buttonGroup.add("button", undefined, "OK");
    
    viewFolderBtn.onClick = function() {
        try {
            var currentDoc = UTILITY_STATE.currentDocument;
            if (currentDoc && safeGetProperty(currentDoc, 'filePath')) {
                var folder = Folder(safeGetProperty(currentDoc, 'filePath'));
                folder.execute();
            }
        } catch (exc) {
            alert("Could not open folder: " + exc.message);
        }
    };
    
    okBtn.onClick = function() {
        dialog.close();
    };
    
    dialog.show();
}

// Get mode-specific capture information
function getModeSpecificCaptureInfo(mode) {
    switch (mode) {
        case "emergency":
            return "* Essential document properties only\n" +
                   "* No collection analysis (ultra-safe)\n" +
                   "* Property accessibility testing";
        case "minimal":
            return "* Document properties and basic info\n" +
                   "* Safe collection counts (pages)\n" +
                   "* Essential document structure";
        case "basic":
            return "* Document structure and properties\n" +
                   "* Safe collection analysis (pages, text, layers)\n" +
                   "* Basic document statistics";
        case "standard":
            return "* Document structure and properties\n" +
                   "* Text content sampling and analysis\n" +
                   "* Story threading and overflow detection\n" +
                   "* Moderate collection analysis";
        case "comprehensive":
            return "* Complete document structure and properties\n" +
                   "* Full text content analysis\n" +
                   "* Images and links status (with pre-testing)\n" +
                   "* Styles, colors, and fonts\n" +
                   "* Complete page layout and settings";
        default:
            return "* Mode-appropriate document analysis";
    }
}

// ============================================================================
// ES3-OPTIMIZED STRING BUILDER - ENHANCED VERSION
// ============================================================================

// Enhanced ES3-compatible efficient string builder
function es3OptimizedStringBuilder(initialCapacity) {
    return {
        parts: [],
        capacity: initialCapacity || ENHANCED_ANALYSIS_CONFIG.memoryManagement.stringBufferSize,
        length: 0,
        lineCount: 0,
        
        append: function(str) {
            if (str !== null && str !== undefined) {
                var strValue = String(str);
                this.parts.push(strValue);
                this.length += strValue.length;
                
                // Memory limit checking
                if (this.length > this.capacity) {
                    debugLog("String builder exceeding capacity: " + this.length + " (limit: " + this.capacity + ")", "MEMORY");
                    
                    // Auto-optimize if enabled
                    if (ENHANCED_ANALYSIS_CONFIG.memoryManagement.enableActiveCleanup) {
                        this.optimize();
                    }
                }
            }
        },
        
        appendLine: function(str) {
            this.append(str);
            this.append("\n");
            this.lineCount++;
        },
        
        toString: function() {
            var result = this.parts.join("");
            return result;
        },
        
        clear: function() {
            this.parts = [];
            this.length = 0;
            this.lineCount = 0;
        },
        
        getLength: function() {
            return this.length;
        },
        
        getLineCount: function() {
            return this.lineCount;
        },
        
        optimize: function() {
            // ES3-compatible optimization - join and re-split
            if (this.parts.length > 100) {
                var combined = this.parts.join("");
                this.parts = [combined];
                debugLog("String builder optimized: " + this.parts.length + " parts combined", "MEMORY");
            }
        },
        
        getStats: function() {
            return {
                parts: this.parts.length,
                length: this.length,
                lines: this.lineCount,
                capacity: this.capacity,
                utilizationPercent: Math.round((this.length / this.capacity) * 100)
            };
        }
    };
}