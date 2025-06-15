// ============================================================================
// CHUNK 2.3: COMPREHENSIVE ANALYSIS - CORE INSPECTOR FUNCTIONS
// ES3 COMPATIBLE VERSION - COMPLETE FEATURE SET WITH BAILOUTS
// ============================================================================

// ============================================================================
// COMPREHENSIVE MODE: FULL ANALYSIS WITH ENHANCED BAILOUTS
// ============================================================================

function createComprehensiveDocumentReport(doc) {
    enhancedStatusLog("COMPREHENSIVE", "Starting comprehensive analysis", 0, 15, 
        "Full feature analysis with bailouts");
    
    // Start with standard report
    var report = createStandardDocumentReport(doc);
    
    // If standard failed, don't proceed
    if (report.error || report.fallbackToMinimal) {
        enhancedStatusLog("COMPREHENSIVE", "Standard analysis failed", 1, 15, 
            "Cannot proceed to comprehensive mode");
        return report;
    }
    
    // Upgrade to comprehensive mode
    report.analysisVersion = "2.1-estk-comprehensive";
    report.mode = "COMPREHENSIVE_FULL_ANALYSIS";
    
    var timeout = MODE_TIMEOUTS.comprehensive;
    
    try {
        // Enhanced pages analysis
        enhancedStatusLog("COMPREHENSIVE", "Adding pages analysis", 3, 15, "Detailed page properties");
        report.pages = emergencyAnalyzeSection("pages", function() {
            return getComprehensivePagesInfo(doc);
        }, timeout, 4, 15);
        
        // Enhanced layers analysis  
        enhancedStatusLog("COMPREHENSIVE", "Adding layers analysis", 5, 15, "Layer properties and structure");
        report.layers = emergencyAnalyzeSection("layers", function() {
            return getComprehensiveLayersInfo(doc);
        }, timeout, 6, 15);
        
        // Styles analysis
        enhancedStatusLog("COMPREHENSIVE", "Adding styles analysis", 7, 15, "Paragraph and character styles");
        report.styles = emergencyAnalyzeSection("styles", function() {
            return getStylesInfo(doc);
        }, timeout, 8, 15);
        
        // Colors analysis
        enhancedStatusLog("COMPREHENSIVE", "Adding colors analysis", 9, 15, "Color definitions and swatches");
        report.colors = emergencyAnalyzeSection("colors", function() {
            return getColorsInfo(doc);
        }, timeout, 10, 15);
        
        // Fonts analysis
        enhancedStatusLog("COMPREHENSIVE", "Adding fonts analysis", 11, 15, "Font usage and availability");
        report.fonts = emergencyAnalyzeSection("fonts", function() {
            return getFontsInfo(doc);
        }, timeout, 12, 15);
        
        // Images analysis (often problematic)
        enhancedStatusLog("COMPREHENSIVE", "Adding images analysis", 13, 15, "Image links and properties");
        report.images = emergencyAnalyzeSection("images", function() {
            return getImagesInfo(doc);
        }, timeout / 2, 14, 15); // Shorter timeout for problematic section
        
        // Links analysis (often problematic)
        enhancedStatusLog("COMPREHENSIVE", "Adding links analysis", 14, 15, "Link status and properties");
        report.links = emergencyAnalyzeSection("links", function() {
            return getLinksInfo(doc);
        }, timeout / 2, 15, 15); // Shorter timeout for problematic section
        
        enhancedStatusLog("COMPREHENSIVE", "Comprehensive analysis completed", 15, 15, 
            "Full analysis successful");
        
    } catch (exc) {
        enhancedStatusLog("COMPREHENSIVE", "Comprehensive analysis failed", 15, 15, 
            "Error: " + exc.message);
        report.error = "Comprehensive analysis failed: " + exc.message;
        report.partialResults = true;
    }
    
    // Add comprehensive statistics
    report.discoveryStats = generateComprehensiveStats(report);
    
    return report;
}

// ============================================================================
// CORE INSPECTOR ANALYSIS FUNCTIONS - ROBUST PROPERTY CHANGE DETECTION
// ============================================================================

// Main document report creation - COMPREHENSIVE FOR THOROUGH CHANGE DETECTION
function createDocumentReport(doc) {
    // Initialize runtime tracking
    ANALYSIS_CONFIG.processingStartTime = new Date().getTime();
    ANALYSIS_CONFIG.errors = [];
    ANALYSIS_CONFIG.textItemsProcessed = 0;
    ANALYSIS_CONFIG.brokenPropertiesFound = [];
    
    debugLog("Starting comprehensive document analysis", "MAIN");
    statusLog("Document Analysis", "Initializing", 0);
    
    // Clear memory before starting
    clearLargeObjects();
    
    var report = {
        timestamp: toISOString(new Date()),
        analysisVersion: "2.1-estk",
        performanceMode: "comprehensive", // Full analysis for proper change detection
        
        // COMPREHENSIVE ANALYSIS - focused on property changes with thorough coverage
        documentInfo: safeAnalyzeSection("documentInfo", function() { return getDocumentInfo(doc); }),
        pages: safeAnalyzeSection("pages", function() { return getPagesInfo(doc); }),
        layers: safeAnalyzeSection("layers", function() { return getLayersInfo(doc); }),
        stories: safeAnalyzeSection("stories", function() { return getStoriesInfo(doc); }),
        textFrames: safeAnalyzeSection("textFrames", function() { return getTextFramesInfo(doc); }),
        textContent: safeAnalyzeSection("textContent", function() { return getComprehensiveTextContent(doc); }),
        styles: safeAnalyzeSection("styles", function() { return getStylesInfo(doc); }),
        colors: safeAnalyzeSection("colors", function() { return getColorsInfo(doc); }),
        fonts: safeAnalyzeSection("fonts", function() { return getFontsInfo(doc); }),
        
        // ESSENTIAL for change detection - RESTORED
        images: safeAnalyzeSection("images", function() { return getImagesInfo(doc); }),
        links: safeAnalyzeSection("links", function() { return getLinksInfo(doc); }),
        pageItems: safeAnalyzeSection("pageItems", function() { return getPageItemsInfo(doc); }),
        
        // Analysis metadata
        processingTime: 0,
        discoveryStats: {
            textItemsProcessed: 0,
            errorsEncountered: 0,
            brokenPropertiesFound: 0,
            collectionsAnalyzed: 0
        },
        errors: [],
        apiGuidance: {}
    };
    
    // Add processing time and stats
    var totalTime = new Date().getTime() - ANALYSIS_CONFIG.processingStartTime;
    report.processingTime = totalTime;
    report.discoveryStats = {
        textItemsProcessed: ANALYSIS_CONFIG.textItemsProcessed,
        errorsEncountered: ANALYSIS_CONFIG.errors.length,
        brokenPropertiesFound: ANALYSIS_CONFIG.brokenPropertiesFound.length,
        collectionsAnalyzed: countAnalyzedCollections(report)
    };
    report.errors = ANALYSIS_CONFIG.errors;
    report.apiGuidance = generateAPIGuidance();
    
    debugLog("Document analysis completed in " + totalTime + "ms", "MAIN");
    statusLog("Document Analysis", "Completed", 100);
    
    // Final memory cleanup
    clearLargeObjects();
    
    return report;
}

// Count analyzed collections for stats
function countAnalyzedCollections(report) {
    var count = 0;
    var sections = ['pages', 'layers', 'stories', 'textFrames', 'styles', 'colors', 'fonts', 'images', 'links', 'pageItems'];
    for (var i = 0; i < sections.length; i++) {
        if (report[sections[i]] && safeGetLength(report[sections[i]])) {
            count++;
        }
    }
    return count;
}

// Generate API guidance based on encountered errors
function generateAPIGuidance() {
    var guidance = {
        commonIssues: [],
        alternativeAccess: {},
        troubleshooting: [],
        successfulAlternatives: ANALYSIS_CONFIG.discoveredAlternatives
    };
    
    try {
        // Analyze error patterns
        var errorTypes = {};
        for (var i = 0; i < ANALYSIS_CONFIG.errors.length; i++) {
            var err = ANALYSIS_CONFIG.errors[i];
            if (safeGetProperty(err, 'apiCategory')) {
                var apiCategory = safeGetProperty(err, 'apiCategory');
                errorTypes[apiCategory] = (errorTypes[apiCategory] || 0) + 1;
            }
        }
        
        // Generate guidance based on error patterns
        for (var errorType in errorTypes) {
            if (errorTypes[errorType] > 2) { // If we see this error multiple times
                guidance.commonIssues.push({
                    issue: errorType,
                    frequency: errorTypes[errorType],
                    recommendation: getErrorRecommendation(errorType)
                });
            }
        }
        
        // Add specific troubleshooting based on what we found
        guidance.troubleshooting = generateTroubleshootingSteps(errorTypes);
        
    } catch (e) {
        debugLog("Failed to generate API guidance: " + e.message, "ERROR");
    }
    
    return guidance;
}

// Generate troubleshooting steps based on error patterns
function generateTroubleshootingSteps(errorTypes) {
    var steps = [];
    
    if (errorTypes.unsupported_property) {
        steps.push("Use hasOwnProperty() checks before accessing properties");
        steps.push("Test property access with try-catch blocks");
    }
    
    if (errorTypes.access_denied) {
        steps.push("Verify document is not locked or read-only");
        steps.push("Check user permissions for document access");
    }
    
    if (errorTypes.invalid_index) {
        steps.push("Always verify collection length before item access");
        steps.push("Use both array[index] and collection.item(index) methods");
    }
    
    if (errorTypes.timeout) {
        steps.push("Process large collections in smaller batches");
        steps.push("Increase timeout thresholds for complex documents");
    }
    
    if (steps.length === 0) {
        steps.push("Use comprehensive error handling patterns");
        steps.push("Test with various document types and sizes");
    }
    
    return steps;
}

// Get recommendation for specific error types
function getErrorRecommendation(errorType) {
    var recommendations = {
        'unsupported_property': 'Use try-catch and check hasOwnProperty() before accessing',
        'access_denied': 'Property may be read-only or require different document state',
        'invalid_index': 'Always check collection length before accessing items',
        'timeout': 'Consider processing in smaller batches or increasing timeout',
        'permission_error': 'Check document permissions and user access level',
        'not_found': 'Property may not exist in this InDesign version or document type'
    };
    
    return recommendations[errorType] || 'Use comprehensive error handling and alternative access methods';
}

// ============================================================================
// COMPREHENSIVE ANALYSIS FUNCTIONS - FULL FEATURE SET
// ============================================================================

function getComprehensivePagesInfo(doc) {
    enhancedStatusLog("COMP_PAGES", "Analyzing pages comprehensively", 0, 5, "Full page analysis");
    
    var pages = safeGetProperty(doc, 'pages');
    var pageCount = safeGetLength(pages);
    
    if (pageCount === 0) {
        return {
            totalCount: 0,
            analysisMode: "comprehensive",
            note: "No pages found"
        };
    }
    
    // Use enhanced iteration with progress reporting
    return enhancedSafeIterateCollection(pages, function(page, itemIndex) {
        if (itemIndex % 5 === 0) { // Progress every 5 pages
            enhancedStatusLog("COMP_PAGES", "Processing pages", itemIndex + 1, pageCount, 
                "Page " + (itemIndex + 1) + " of " + pageCount);
        }
        
        return {
            index: itemIndex,
            id: safeGetProperty(page, 'id'),
            name: safeGetProperty(page, 'name'),
            bounds: safeGetProperty(page, 'bounds'),
            side: safeGetProperty(page, 'side'),
            documentOffset: safeGetProperty(page, 'documentOffset'),
            appliedMaster: safeGetProperty(safeGetProperty(page, 'appliedMaster'), 'name'),
            pageItems: safeGetLength(safeGetProperty(page, 'pageItems')),
            margins: extractMarginInfo(page),
            orientation: safeGetProperty(page, 'orientation'),
            textFrameCount: safeGetLength(safeGetProperty(page, 'textFrames')),
            imageCount: safeGetLength(safeGetProperty(page, 'images')),
            analysisMode: "comprehensive"
        };
    }, ANALYSIS_CONFIG.maxCollectionSample, "pages");
}

function getDocumentInfo(doc) {
    debugLog("Analyzing document info", "DOC");
    
    // OPTIMIZED: Cache viewPreferences to avoid duplicate calls (Bug #3 fix)
    var viewPrefs = safeGetProperty(doc, 'viewPreferences');
    var docPrefs = safeGetProperty(doc, 'documentPreferences');
    var docFilePath = safeGetProperty(doc, 'filePath');
    
    return {
        name: safeGetProperty(doc, 'name'),
        id: safeGetProperty(doc, 'id'),
        filePath: docFilePath ? docFilePath.toString() : null,
        saved: safeGetProperty(doc, 'saved', false),
        modified: safeGetProperty(doc, 'modified', false),
        readonly: safeGetProperty(doc, 'readonly', false),
        visible: safeGetProperty(doc, 'visible', true),
        selection: safeGetProperty(doc, 'selection') ? safeGetLength(safeGetProperty(doc, 'selection')) : 0,
        activeLayer: safeGetProperty(safeGetProperty(doc, 'activeLayer'), 'name'),
        zeroPoint: safeGetProperty(doc, 'zeroPoint'),
        // OPTIMIZED: Single viewPreferences access
        rulers: {
            horizontal: safeGetProperty(viewPrefs, 'horizontalMeasurementUnits'),
            vertical: safeGetProperty(viewPrefs, 'verticalMeasurementUnits')
        },
        units: {
            ruler: safeGetProperty(viewPrefs, 'rulerOrigin'),
            measurement: safeGetProperty(viewPrefs, 'measurementUnit')
        },
        // Additional properties for comprehensive change detection using cached docPrefs
        documentOffset: safeGetProperty(doc, 'documentOffset'),
        pageHeight: safeGetProperty(docPrefs, 'pageHeight'),
        pageWidth: safeGetProperty(docPrefs, 'pageWidth'),
        facingPages: safeGetProperty(docPrefs, 'facingPages'),
        pagesPerDocument: safeGetLength(safeGetProperty(doc, 'pages'))
    };
}

function getPagesInfo(doc) {
    debugLog("Analyzing pages", "PAGES");
    
    return safeIterateCollection(safeGetProperty(doc, 'pages'), function(page, itemIndex) {
        return {
            index: itemIndex,
            id: safeGetProperty(page, 'id'),
            name: safeGetProperty(page, 'name'),
            bounds: safeGetProperty(page, 'bounds'),
            side: safeGetProperty(page, 'side'),
            documentOffset: safeGetProperty(page, 'documentOffset'),
            appliedMaster: safeGetProperty(safeGetProperty(page, 'appliedMaster'), 'name'),
            pageItems: safeGetLength(safeGetProperty(page, 'pageItems')),
            // Additional properties for comprehensive change detection
            margins: extractMarginInfo(page),
            orientation: safeGetProperty(page, 'orientation'),
            // Text frame count on this page
            textFrameCount: safeGetLength(safeGetProperty(page, 'textFrames')),
            // Image count on this page
            imageCount: safeGetLength(safeGetProperty(page, 'images'))
        };
    }, ANALYSIS_CONFIG.maxCollectionSample, "pages");
}

function extractMarginInfo(page) {
    try {
        var margins = safeGetProperty(page, 'marginPreferences');
        if (margins) {
            return {
                top: safeGetProperty(margins, 'top'),
                left: safeGetProperty(margins, 'left'),
                bottom: safeGetProperty(margins, 'bottom'),
                right: safeGetProperty(margins, 'right'),
                // Additional margin properties
                columnCount: safeGetProperty(margins, 'columnCount'),
                columnGutter: safeGetProperty(margins, 'columnGutter')
            };
        }
    } catch (e) {
        debugLog("Failed to extract margin info: " + e.message, "WARN");
    }
    return null;
}

function getComprehensiveLayersInfo(doc) {
    enhancedStatusLog("COMP_LAYERS", "Analyzing layers comprehensively", 0, 3, "Full layer analysis");
    
    var layers = safeGetProperty(doc, 'layers');
    var layerCount = safeGetLength(layers);
    
    if (layerCount === 0) {
        return {
            totalCount: 0,
            analysisMode: "comprehensive",
            note: "No layers found"
        };
    }
    
    return enhancedSafeIterateCollection(layers, function(layer, itemIndex) {
        return {
            index: itemIndex,
            id: safeGetProperty(layer, 'id'),
            name: safeGetProperty(layer, 'name'),
            visible: safeGetProperty(layer, 'visible', true),
            locked: safeGetProperty(layer, 'locked', false),
            color: safeGetProperty(layer, 'layerColor'),
            pageItems: safeGetLength(safeGetProperty(layer, 'pageItems')),
            printable: safeGetProperty(layer, 'printable'),
            showGuides: safeGetProperty(layer, 'showGuides'),
            layerOrder: itemIndex,
            textFrameCount: safeGetLength(safeGetProperty(layer, 'textFrames')),
            imageCount: safeGetLength(safeGetProperty(layer, 'images')),
            analysisMode: "comprehensive"
        };
    }, ANALYSIS_CONFIG.maxCollectionSample, "layers");
}

function getLayersInfo(doc) {
    debugLog("Analyzing layers", "LAYERS");
    
    return safeIterateCollection(safeGetProperty(doc, 'layers'), function(layer, itemIndex) {
        return {
            index: itemIndex,
            id: safeGetProperty(layer, 'id'),
            name: safeGetProperty(layer, 'name'),
            visible: safeGetProperty(layer, 'visible', true),
            locked: safeGetProperty(layer, 'locked', false),
            color: safeGetProperty(layer, 'layerColor'),
            pageItems: safeGetLength(safeGetProperty(layer, 'pageItems')),
            // Additional properties for comprehensive change tracking
            printable: safeGetProperty(layer, 'printable'),
            showGuides: safeGetProperty(layer, 'showGuides'),
            layerOrder: itemIndex, // Track layer order changes
            textFrameCount: safeGetLength(safeGetProperty(layer, 'textFrames')),
            imageCount: safeGetLength(safeGetProperty(layer, 'images'))
        };
    }, ANALYSIS_CONFIG.maxCollectionSample, "layers");
}

function getStoriesInfo(doc) {
    debugLog("Analyzing stories", "STORIES");
    
    return safeIterateCollection(safeGetProperty(doc, 'stories'), function(story, itemIndex) {
        return {
            index: itemIndex,
            id: safeGetProperty(story, 'id'),
            length: safeGetProperty(story, 'length', 0),
            textFrames: safeGetLength(safeGetProperty(story, 'textFrames')),
            overflows: safeGetProperty(story, 'overflows', false),
            characters: safeGetLength(safeGetProperty(story, 'characters')),
            words: safeGetLength(safeGetProperty(story, 'words')),
            paragraphs: safeGetLength(safeGetProperty(story, 'paragraphs')),
            // Additional for comprehensive threading detection
            isThreaded: safeGetLength(safeGetProperty(story, 'textFrames')) > 1,
            textContainers: safeGetLength(safeGetProperty(story, 'textContainers')),
            // Text content preview for change detection
            textPreview: (function() {
                var content = safeGetProperty(story, 'contents');
                return content ? content.substring(0, 100) : "[NO CONTENT]";
            })(),
            // Story statistics for change tracking
            averageWordsPerParagraph: calculateWordsPerParagraph(story),
            hasOverflow: safeGetProperty(story, 'overflows', false)
        };
    }, ANALYSIS_CONFIG.maxCollectionSample, "stories");
}

function calculateWordsPerParagraph(story) {
    try {
        var wordCount = safeGetLength(safeGetProperty(story, 'words'));
        var paragraphCount = safeGetLength(safeGetProperty(story, 'paragraphs'));
        if (paragraphCount > 0) {
            return Math.round((wordCount / paragraphCount) * 10) / 10;
        }
    } catch (e) {
        debugLog("Failed to calculate words per paragraph: " + e.message, "WARN");
    }
    return 0;
}

function getTextFramesInfo(doc) {
    debugLog("Analyzing text frames", "TEXTFRAMES");
    
    return safeIterateCollection(safeGetProperty(doc, 'textFrames'), function(textFrame, itemIndex) {
        return {
            index: itemIndex,
            id: safeGetProperty(textFrame, 'id'),
            bounds: safeGetProperty(textFrame, 'bounds'),
            overflows: safeGetProperty(textFrame, 'overflows', false),
            parentStory: safeGetProperty(safeGetProperty(textFrame, 'parentStory'), 'id'),
            layer: safeGetProperty(safeGetProperty(textFrame, 'itemLayer'), 'name'),
            textPreview: safeTextCapture(textFrame), // ENHANCED identification
            characters: safeGetLength(safeGetProperty(textFrame, 'characters')),
            words: safeGetLength(safeGetProperty(textFrame, 'words')),
            paragraphs: safeGetLength(safeGetProperty(textFrame, 'paragraphs')),
            lines: safeGetLength(safeGetProperty(textFrame, 'lines')),
            // Additional properties for comprehensive style and positioning changes
            appliedObjectStyle: safeGetProperty(safeGetProperty(textFrame, 'appliedObjectStyle'), 'name'),
            rotation: safeGetProperty(textFrame, 'rotationAngle'),
            opacity: safeGetProperty(textFrame, 'transparencySettings.blendingSettings.opacity'),
            // Text threading information
            previousTextFrame: safeGetProperty(safeGetProperty(textFrame, 'previousTextFrame'), 'id'),
            nextTextFrame: safeGetProperty(safeGetProperty(textFrame, 'nextTextFrame'), 'id'),
            // Content statistics for change detection
            characterCount: (function() {
                var content = safeGetProperty(textFrame, 'contents');
                return content ? content.length : 0;
            })(),
            wordCount: calculateWordCount(textFrame),
            // First paragraph style for change tracking
            firstParagraphStyle: getFirstParagraphStyle(textFrame)
        };
    }, ANALYSIS_CONFIG.maxCollectionSample, "textFrames");
}

// ES3-compatible word count calculation
function calculateWordCount(textFrame) {
    try {
        var content = safeGetProperty(textFrame, 'contents');
        if (content) {
            // ES3-compatible word splitting and filtering
            var words = content.split(/\s+/);
            var wordCount = 0;
            for (var i = 0; i < words.length; i++) {
                if (words[i].length > 0) {
                    wordCount++;
                }
            }
            return wordCount;
        }
    } catch (e) {
        debugLog("Failed to calculate word count: " + e.message, "WARN");
    }
    return 0;
}

function getFirstParagraphStyle(textFrame) {
    try {
        var paragraphs = safeGetProperty(textFrame, 'paragraphs');
        if (paragraphs && safeGetLength(paragraphs) > 0) {
            var firstPara = paragraphs[0];
            if (firstPara) {
                return safeGetProperty(safeGetProperty(firstPara, 'appliedParagraphStyle'), 'name');
            }
        }
    } catch (e) {
        debugLog("Failed to get first paragraph style: " + e.message, "WARN");
    }
    return null;
}

// COMPREHENSIVE text content analysis - ENHANCED IDENTIFICATION WITH FULL CHANGE DETECTION
function getComprehensiveTextContent(doc) {
    if (!ANALYSIS_CONFIG.enableTextCapture) {
        return { disabled: "Text capture disabled" };
    }
    
    debugLog("Analyzing comprehensive text content", "TEXT");
    statusLog("Text Analysis", "Processing text frames", 25);
    
    var textAnalysis = {
        summary: {
            totalTextFrames: 0,
            totalStories: 0,
            totalCharacters: 0,
            totalWords: 0,
            totalParagraphs: 0,
            overflowingFrames: 0,
            processingTime: 0
        },
        textFrameDetails: [],
        storyDetails: [],
        textStatistics: {}
    };
    
    var textStartTime = new Date().getTime();
    
    // COMPREHENSIVE text frame analysis - ENHANCED IDENTIFICATION
    try {
        textAnalysis.textFrameDetails = safeIterateCollection(safeGetProperty(doc, 'textFrames'), function(textFrame, itemIndex) {
            var frameAnalysis = {
                index: itemIndex,
                id: safeGetProperty(textFrame, 'id'),
                path: "doc.textFrames[" + itemIndex + "]",
                bounds: safeGetProperty(textFrame, 'bounds'),
                overflows: safeGetProperty(textFrame, 'overflows', false),
                layer: safeGetProperty(safeGetProperty(textFrame, 'itemLayer'), 'name'),
                textPreview: safeTextCapture(textFrame), // ENHANCED identification
                characterCount: 0,
                wordCount: 0,
                paragraphCount: 0,
                // Enhanced properties for comprehensive change detection
                appliedParagraphStyle: (function() {
                    var paragraphs = safeGetProperty(textFrame, 'paragraphs');
                    if (paragraphs && safeGetLength(paragraphs) > 0) {
                        var firstPara = paragraphs[0];
                        return firstPara ? safeGetProperty(safeGetProperty(firstPara, 'appliedParagraphStyle'), 'name') : null;
                    }
                    return null;
                })(),
                appliedCharacterStyle: (function() {
                    var characters = safeGetProperty(textFrame, 'characters');
                    if (characters && safeGetLength(characters) > 0) {
                        var firstChar = characters[0];
                        return firstChar ? safeGetProperty(safeGetProperty(firstChar, 'appliedCharacterStyle'), 'name') : null;
                    }
                    return null;
                })(),
                fontFamily: null,
                fontSize: null,
                textColor: null,
                // Threading information
                isThreaded: !!(safeGetProperty(textFrame, 'previousTextFrame') || safeGetProperty(textFrame, 'nextTextFrame')),
                threadPosition: getThreadPosition(textFrame)
            };
            
            // Enhanced character/word counting for comprehensive change detection
            try {
                var content = safeGetProperty(textFrame, 'contents');
                if (content) {
                    frameAnalysis.characterCount = content.length;
                    // ES3-compatible word counting
                    var words = content.split(/\s+/);
                    var validWordCount = 0;
                    for (var i = 0; i < words.length; i++) {
                        if (words[i].length > 0) {
                            validWordCount++;
                        }
                    }
                    frameAnalysis.wordCount = validWordCount;
                    frameAnalysis.paragraphCount = safeGetLength(safeGetProperty(textFrame, 'paragraphs'));
                    
                    // Try to get comprehensive font and color information for change detection
                    try {
                        var characters = safeGetProperty(textFrame, 'characters');
                        if (characters && safeGetLength(characters) > 0) {
                            var firstChar = characters[0];
                            if (firstChar) {
                                frameAnalysis.fontFamily = safeGetProperty(safeGetProperty(firstChar, 'appliedFont'), 'fontFamily');
                                frameAnalysis.fontSize = safeGetProperty(firstChar, 'pointSize');
                                frameAnalysis.textColor = safeGetProperty(safeGetProperty(firstChar, 'fillColor'), 'name');
                            }
                        }
                    } catch (fontError) {
                        debugLog("Could not get font info for frame " + itemIndex, "WARN");
                    }
                }
            } catch (e) {
                frameAnalysis.textError = "Access failed: " + e.message;
                debugLog("Text content access failed for frame " + itemIndex + ": " + e.message, "ERROR");
            }
            
            // Update global counters
            textAnalysis.summary.totalTextFrames++;
            textAnalysis.summary.totalCharacters += frameAnalysis.characterCount;
            textAnalysis.summary.totalWords += frameAnalysis.wordCount;
            textAnalysis.summary.totalParagraphs += frameAnalysis.paragraphCount;
            if (frameAnalysis.overflows) {
                textAnalysis.summary.overflowingFrames++;
            }
            ANALYSIS_CONFIG.textItemsProcessed++;
            
            return frameAnalysis;
        }, ANALYSIS_CONFIG.maxCollectionSample, "textFrames");
    } catch (e) {
        textAnalysis.textFrameDetailsError = "Text frames analysis failed: " + e.message;
        debugLog("Text frames analysis failed: " + e.message, "ERROR");
    }
    
    statusLog("Text Analysis", "Processing stories", 50);
    
    // COMPREHENSIVE story analysis  
    try {
        textAnalysis.storyDetails = safeIterateCollection(safeGetProperty(doc, 'stories'), function(story, itemIndex) {
            var storyAnalysis = {
                index: itemIndex,
                id: safeGetProperty(story, 'id'),
                path: "doc.stories[" + itemIndex + "]",
                length: safeGetProperty(story, 'length', 0),
                textFrameCount: safeGetLength(safeGetProperty(story, 'textFrames')),
                overflows: safeGetProperty(story, 'overflows', false),
                characterCount: safeGetLength(safeGetProperty(story, 'characters')),
                wordCount: safeGetLength(safeGetProperty(story, 'words')),
                paragraphCount: safeGetLength(safeGetProperty(story, 'paragraphs')),
                // Enhanced threading information for change detection
                isThreaded: safeGetLength(safeGetProperty(story, 'textFrames')) > 1,
                threadLength: safeGetLength(safeGetProperty(story, 'textFrames')),
                // Content preview for change identification
                contentPreview: (function() {
                    var content = safeGetProperty(story, 'contents');
                    return content ? content.substring(0, 150) : "[NO CONTENT]";
                })(),
                // Story-level statistics
                averageWordsPerParagraph: calculateWordsPerParagraph(story),
                hasFootnotes: safeGetLength(safeGetProperty(story, 'footnotes')) > 0,
                footnoteCount: safeGetLength(safeGetProperty(story, 'footnotes'))
            };
            
            textAnalysis.summary.totalStories++;
            ANALYSIS_CONFIG.textItemsProcessed++;
            
            return storyAnalysis;
        }, ANALYSIS_CONFIG.maxCollectionSample, "stories");
    } catch (e) {
        textAnalysis.storyDetailsError = "Stories analysis failed: " + e.message;
        debugLog("Stories analysis failed: " + e.message, "ERROR");
    }
    
    statusLog("Text Analysis", "Calculating statistics", 75);
    
    // Calculate comprehensive text statistics
    textAnalysis.textStatistics = calculateComprehensiveTextStatistics(textAnalysis);
    
    textAnalysis.summary.processingTime = new Date().getTime() - textStartTime;
    debugLog("Comprehensive text content analysis completed", "TEXT");
    statusLog("Text Analysis", "Completed", 100);
    
    return textAnalysis;
}

function getThreadPosition(textFrame) {
    try {
        var prevFrame = safeGetProperty(textFrame, 'previousTextFrame');
        var nextFrame = safeGetProperty(textFrame, 'nextTextFrame');
        
        if (prevFrame && nextFrame) {
            return "middle";
        } else if (prevFrame) {
            return "end";
        } else if (nextFrame) {
            return "start";
        } else {
            return "single";
        }
    } catch (e) {
        return "unknown";
    }
}

function calculateComprehensiveTextStatistics(textAnalysis) {
    var stats = {
        averageCharactersPerFrame: 0,
        averageWordsPerFrame: 0,
        averageParagraphsPerFrame: 0,
        overflowPercentage: 0,
        largestTextFrame: null,
        smallestTextFrame: null,
        textDistribution: {
            emptyFrames: 0,
            smallFrames: 0,
            mediumFrames: 0,
            largeFrames: 0
        }
    };
    
    try {
        var frameCount = textAnalysis.summary.totalTextFrames;
        if (frameCount > 0) {
            stats.averageCharactersPerFrame = Math.round(textAnalysis.summary.totalCharacters / frameCount);
            stats.averageWordsPerFrame = Math.round(textAnalysis.summary.totalWords / frameCount);
            stats.averageParagraphsPerFrame = Math.round(textAnalysis.summary.totalParagraphs / frameCount);
            stats.overflowPercentage = Math.round((textAnalysis.summary.overflowingFrames / frameCount) * 100);
        }
        
        // Find largest and smallest frames
        var maxChars = 0;
        var minChars = Infinity;
        var frameDetailsLength = safeGetLength(textAnalysis.textFrameDetails);
        for (var i = 0; i < frameDetailsLength; i++) {
            var frame = textAnalysis.textFrameDetails[i];
            var frameCharCount = safeGetProperty(frame, 'characterCount', 0);
            if (frameCharCount > maxChars) {
                maxChars = frameCharCount;
                stats.largestTextFrame = {
                    index: safeGetProperty(frame, 'index'),
                    characterCount: frameCharCount,
                    preview: safeGetProperty(frame, 'textPreview')
                };
            }
            if (frameCharCount < minChars && frameCharCount > 0) {
                minChars = frameCharCount;
                stats.smallestTextFrame = {
                    index: safeGetProperty(frame, 'index'),
                    characterCount: frameCharCount,
                    preview: safeGetProperty(frame, 'textPreview')
                };
            }
            
            // Categorize frame sizes
            if (frameCharCount === 0) {
                stats.textDistribution.emptyFrames++;
            } else if (frameCharCount < 100) {
                stats.textDistribution.smallFrames++;
            } else if (frameCharCount < 1000) {
                stats.textDistribution.mediumFrames++;
            } else {
                stats.textDistribution.largeFrames++;
            }
        }
        
    } catch (e) {
        debugLog("Text statistics calculation failed: " + e.message, "ERROR");
        stats.error = "Statistics calculation failed: " + e.message;
    }
    
    return stats;
}

function getStylesInfo(doc) {
    debugLog("Analyzing styles", "STYLES");
    
    return {
        paragraphStyles: safeIterateCollection(safeGetProperty(doc, 'paragraphStyles'), function(style, itemIndex) {
            return {
                index: itemIndex,
                id: safeGetProperty(style, 'id'),
                name: safeGetProperty(style, 'name'),
                basedOn: safeGetProperty(safeGetProperty(style, 'basedOn'), 'name'),
                // Additional properties for comprehensive change detection
                fontFamily: safeGetProperty(safeGetProperty(style, 'appliedFont'), 'fontFamily'),
                fontSize: safeGetProperty(style, 'pointSize'),
                color: safeGetProperty(safeGetProperty(style, 'fillColor'), 'name'),
                leading: safeGetProperty(style, 'leading'),
                spaceAfter: safeGetProperty(style, 'spaceAfter'),
                spaceBefore: safeGetProperty(style, 'spaceBefore')
            };
        }, ANALYSIS_CONFIG.maxCollectionSample, "paragraphStyles"),
        
        characterStyles: safeIterateCollection(safeGetProperty(doc, 'characterStyles'), function(style, itemIndex) {
            return {
                index: itemIndex,
                id: safeGetProperty(style, 'id'),
                name: safeGetProperty(style, 'name'),
                basedOn: safeGetProperty(safeGetProperty(style, 'basedOn'), 'name'),
                // Additional properties for comprehensive change detection
                fontFamily: safeGetProperty(safeGetProperty(style, 'appliedFont'), 'fontFamily'),
                fontSize: safeGetProperty(style, 'pointSize'),
                color: safeGetProperty(safeGetProperty(style, 'fillColor'), 'name'),
                fontStyle: safeGetProperty(style, 'fontStyle')
            };
        }, ANALYSIS_CONFIG.maxCollectionSample, "characterStyles")
    };
}

function getColorsInfo(doc) {
    debugLog("Analyzing colors", "COLORS");
    
    return safeIterateCollection(safeGetProperty(doc, 'colors'), function(color, itemIndex) {
        return {
            index: itemIndex,
            id: safeGetProperty(color, 'id'),
            name: safeGetProperty(color, 'name'),
            model: safeGetProperty(color, 'model') ? safeGetProperty(color, 'model').toString() : 'unknown',
            space: safeGetProperty(color, 'space') ? safeGetProperty(color, 'space').toString() : 'unknown',
            colorValue: safeGetProperty(color, 'colorValue'),
            // Additional properties for comprehensive change detection
            colorType: safeGetProperty(color, 'colorType') ? safeGetProperty(color, 'colorType').toString() : 'unknown',
            inkName: safeGetProperty(color, 'inkName'),
            tint: safeGetProperty(color, 'tint')
        };
    }, ANALYSIS_CONFIG.maxCollectionSample, "colors");
}

function getFontsInfo(doc) {
    debugLog("Analyzing fonts", "FONTS");
    
    return safeIterateCollection(safeGetProperty(doc, 'fonts'), function(font, itemIndex) {
        return {
            index: itemIndex,
            id: safeGetProperty(font, 'id'),
            name: safeGetProperty(font, 'name'),
            fontFamily: safeGetProperty(font, 'fontFamily'),
            fontStyleName: safeGetProperty(font, 'fontStyleName'),
            postScriptName: safeGetProperty(font, 'postScriptName'),
            status: safeGetProperty(font, 'status') ? safeGetProperty(font, 'status').toString() : 'unknown',
            // Additional properties for comprehensive change detection
            location: safeGetProperty(font, 'location'),
            version: safeGetProperty(font, 'version'),
            fontType: safeGetProperty(font, 'fontType') ? safeGetProperty(font, 'fontType').toString() : 'unknown',
            platform: safeGetProperty(font, 'platformName')
        };
    }, ANALYSIS_CONFIG.maxCollectionSample, "fonts");
}

// ESSENTIAL for detecting image and link changes - RESTORED
function getImagesInfo(doc) {
    debugLog("Analyzing images", "IMAGES");
    
    return safeIterateCollection(safeGetProperty(doc, 'images'), function(image, itemIndex) {
        var itemLink = safeGetProperty(image, 'itemLink');
        return {
            index: itemIndex,
            id: safeGetProperty(image, 'id'),
            bounds: safeGetProperty(image, 'bounds'),
            actualPpi: safeGetProperty(image, 'actualPpi'),
            effectivePpi: safeGetProperty(image, 'effectivePpi'),
            itemLink: itemLink ? {
                name: safeGetProperty(itemLink, 'name'),
                status: safeGetProperty(itemLink, 'status') ? safeGetProperty(itemLink, 'status').toString() : 'unknown',
                filePath: safeGetProperty(itemLink, 'filePath'),
                size: safeGetProperty(itemLink, 'size'),
                date: safeGetProperty(itemLink, 'date'),
                linkType: safeGetProperty(itemLink, 'linkType') ? safeGetProperty(itemLink, 'linkType').toString() : 'unknown'
            } : null,
            parent: (function() {
                var parentObj = safeGetProperty(image, 'parent');
                var constructor = safeGetProperty(parentObj, 'constructor');
                return constructor ? safeGetProperty(constructor, 'name', 'unknown') : 'unknown';
            })(),
            // Additional properties for comprehensive change detection
            imageTypeName: safeGetProperty(image, 'imageTypeName'),
            transparencySettings: safeGetProperty(image, 'transparencySettings.blendingSettings.opacity')
        };
    }, ANALYSIS_CONFIG.maxCollectionSample, "images");
}

function getLinksInfo(doc) {
    debugLog("Analyzing links", "LINKS");
    
    return safeIterateCollection(safeGetProperty(doc, 'links'), function(link, itemIndex) {
        return {
            index: itemIndex,
            id: safeGetProperty(link, 'id'),
            name: safeGetProperty(link, 'name'),
            filePath: safeGetProperty(link, 'filePath'),
            status: safeGetProperty(link, 'status') ? safeGetProperty(link, 'status').toString() : 'unknown',
            size: safeGetProperty(link, 'size'),
            date: safeGetProperty(link, 'date'),
            linkType: safeGetProperty(link, 'linkType') ? safeGetProperty(link, 'linkType').toString() : 'unknown',
            // Additional properties for comprehensive change detection
            needed: safeGetProperty(link, 'needed'),
            canEmbed: safeGetProperty(link, 'canEmbed'),
            canUnembed: safeGetProperty(link, 'canUnembed'),
            linkResourceURI: safeGetProperty(link, 'linkResourceURI'),
            versionState: safeGetProperty(link, 'versionState') ? safeGetProperty(link, 'versionState').toString() : 'unknown'
        };
    }, ANALYSIS_CONFIG.maxCollectionSample, "links");
}

// RESTORED - Essential for detecting page item changes
function getPageItemsInfo(doc) {
    debugLog("Analyzing page items", "PAGEITEMS");
    
    var pageItemsInfo = {
        totalCount: safeGetLength(safeGetProperty(doc, 'pageItems')),
        byType: {},
        sample: []
    };
    
    // Sample page items for detailed analysis
    pageItemsInfo.sample = safeIterateCollection(safeGetProperty(doc, 'pageItems'), function(item, itemIndex) {
        var itemConstructor = safeGetProperty(item, 'constructor');
        var itemType = itemConstructor ? safeGetProperty(itemConstructor, 'name', 'unknown') : 'unknown';
        
        // Count by type
        if (!pageItemsInfo.byType[itemType]) {
            pageItemsInfo.byType[itemType] = 0;
        }
        pageItemsInfo.byType[itemType]++;
        
        return {
            index: itemIndex,
            id: safeGetProperty(item, 'id'),
            type: itemType,
            bounds: safeGetProperty(item, 'bounds'),
            layer: safeGetProperty(safeGetProperty(item, 'itemLayer'), 'name'),
            parent: (function() {
                var parentObj = safeGetProperty(item, 'parent');
                var constructor = safeGetProperty(parentObj, 'constructor');
                return constructor ? safeGetProperty(constructor, 'name', 'unknown') : 'unknown';
            })(),
            visible: safeGetProperty(item, 'visible', true),
            locked: safeGetProperty(item, 'locked', false),
            // Additional properties for change detection
            rotation: safeGetProperty(item, 'rotationAngle'),
            opacity: safeGetProperty(item, 'transparencySettings.blendingSettings.opacity')
        };
    }, Math.min(ANALYSIS_CONFIG.maxCollectionSample, ANALYSIS_CONFIG.pageItemSampleLimit), "pageItems");
    
    return pageItemsInfo;
}

// ============================================================================
// COMPREHENSIVE STATISTICS AND DISCOVERY
// ============================================================================

function generateComprehensiveStats(report) {
    var stats = {
        analysisMode: report.mode,
        timestamp: toISOString(new Date()),
        sectionsAnalyzed: 0,
        successfulSections: 0,
        bailoutSections: 0,
        totalItems: 0,
        processingTime: 0
    };
    
    // Count sections and items
    var sections = ['documentInfo', 'pages', 'layers', 'textFrames', 'stories', 
                   'textContent', 'styles', 'colors', 'fonts', 'images', 'links'];
    
    for (var i = 0; i < sections.length; i++) {
        var sectionName = sections[i];
        var section = safeGetProperty(report, sectionName);
        
        if (section) {
            stats.sectionsAnalyzed++;
            
            if (safeGetProperty(section, 'emergencyBailout')) {
                stats.bailoutSections++;
            } else {
                stats.successfulSections++;
                
                // Count items in section
                var sectionLength = safeGetLength(section);
                if (sectionLength > 0) {
                    stats.totalItems += sectionLength;
                } else if (safeGetProperty(section, 'totalCount')) {
                    stats.totalItems += safeGetProperty(section, 'totalCount');
                }
            }
        }
    }
    
    stats.successRate = stats.sectionsAnalyzed > 0 ? 
        Math.round((stats.successfulSections / stats.sectionsAnalyzed) * 100) : 0;
    
    return stats;
}