// ============================================================================
// CHUNK 2: CORE INSPECTOR FUNCTIONS - ROBUST PROPERTY CHANGE DETECTION
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
        timestamp: new Date().toISOString(),
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
        if (report[sections[i]] && report[sections[i]].length) {
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
            var error = ANALYSIS_CONFIG.errors[i];
            if (error.apiCategory) {
                errorTypes[error.apiCategory] = (errorTypes[error.apiCategory] || 0) + 1;
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
// ROBUST INSPECTOR ANALYSIS FUNCTIONS
// ============================================================================

function getDocumentInfo(doc) {
    debugLog("Analyzing document info", "DOC");
    
    return {
        name: safeGetProperty(doc, 'name'),
        id: safeGetProperty(doc, 'id'),
        filePath: safeGetProperty(doc, 'filePath') ? safeGetProperty(doc, 'filePath').toString() : null,
        saved: safeGetProperty(doc, 'saved', false),
        modified: safeGetProperty(doc, 'modified', false),
        readonly: safeGetProperty(doc, 'readonly', false),
        visible: safeGetProperty(doc, 'visible', true),
        selection: safeGetProperty(doc, 'selection') ? safeGetLength(doc.selection) : 0,
        activeLayer: safeGetProperty(doc.activeLayer, 'name'),
        zeroPoint: safeGetProperty(doc, 'zeroPoint'),
        rulers: {
            horizontal: safeGetProperty(doc, 'viewPreferences.horizontalMeasurementUnits'),
            vertical: safeGetProperty(doc, 'viewPreferences.verticalMeasurementUnits')
        },
        // Additional properties for comprehensive change detection
        documentOffset: safeGetProperty(doc, 'documentOffset'),
        units: {
            ruler: safeGetProperty(doc, 'viewPreferences.rulerOrigin'),
            measurement: safeGetProperty(doc, 'viewPreferences.measurementUnit')
        },
        pageHeight: safeGetProperty(doc, 'documentPreferences.pageHeight'),
        pageWidth: safeGetProperty(doc, 'documentPreferences.pageWidth'),
        facingPages: safeGetProperty(doc, 'documentPreferences.facingPages'),
        pagesPerDocument: safeGetLength(doc.pages)
    };
}

function getPagesInfo(doc) {
    debugLog("Analyzing pages", "PAGES");
    
    return safeIterateCollection(doc.pages, function(page, index) {
        return {
            index: index,
            id: safeGetProperty(page, 'id'),
            name: safeGetProperty(page, 'name'),
            bounds: safeGetProperty(page, 'bounds'),
            side: safeGetProperty(page, 'side'),
            documentOffset: safeGetProperty(page, 'documentOffset'),
            appliedMaster: safeGetProperty(page.appliedMaster, 'name'),
            pageItems: safeGetLength(page.pageItems),
            // Additional properties for comprehensive change detection
            margins: extractMarginInfo(page),
            orientation: safeGetProperty(page, 'orientation'),
            // Text frame count on this page
            textFrameCount: page.textFrames ? safeGetLength(page.textFrames) : 0,
            // Image count on this page
            imageCount: page.images ? safeGetLength(page.images) : 0
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

function getLayersInfo(doc) {
    debugLog("Analyzing layers", "LAYERS");
    
    return safeIterateCollection(doc.layers, function(layer, index) {
        return {
            index: index,
            id: safeGetProperty(layer, 'id'),
            name: safeGetProperty(layer, 'name'),
            visible: safeGetProperty(layer, 'visible', true),
            locked: safeGetProperty(layer, 'locked', false),
            color: safeGetProperty(layer, 'layerColor'),
            pageItems: safeGetLength(layer.pageItems),
            // Additional properties for comprehensive change tracking
            printable: safeGetProperty(layer, 'printable'),
            showGuides: safeGetProperty(layer, 'showGuides'),
            layerOrder: index, // Track layer order changes
            textFrameCount: layer.textFrames ? safeGetLength(layer.textFrames) : 0,
            imageCount: layer.images ? safeGetLength(layer.images) : 0
        };
    }, ANALYSIS_CONFIG.maxCollectionSample, "layers");
}

function getStoriesInfo(doc) {
    debugLog("Analyzing stories", "STORIES");
    
    return safeIterateCollection(doc.stories, function(story, index) {
        return {
            index: index,
            id: safeGetProperty(story, 'id'),
            length: safeGetProperty(story, 'length', 0),
            textFrames: safeGetLength(story.textFrames),
            overflows: safeGetProperty(story, 'overflows', false),
            characters: safeGetLength(story.characters),
            words: safeGetLength(story.words),
            paragraphs: safeGetLength(story.paragraphs),
            // Additional for comprehensive threading detection
            isThreaded: safeGetLength(story.textFrames) > 1,
            textContainers: safeGetLength(story.textContainers),
            // Text content preview for change detection
            textPreview: story.contents ? story.contents.substring(0, 100) : "[NO CONTENT]",
            // Story statistics for change tracking
            averageWordsPerParagraph: calculateWordsPerParagraph(story),
            hasOverflow: safeGetProperty(story, 'overflows', false)
        };
    }, ANALYSIS_CONFIG.maxCollectionSample, "stories");
}

function calculateWordsPerParagraph(story) {
    try {
        var wordCount = safeGetLength(story.words);
        var paragraphCount = safeGetLength(story.paragraphs);
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
    
    return safeIterateCollection(doc.textFrames, function(textFrame, index) {
        return {
            index: index,
            id: safeGetProperty(textFrame, 'id'),
            bounds: safeGetProperty(textFrame, 'bounds'),
            overflows: safeGetProperty(textFrame, 'overflows', false),
            parentStory: safeGetProperty(textFrame.parentStory, 'id'),
            layer: safeGetProperty(textFrame.itemLayer, 'name'),
            textPreview: safeTextCapture(textFrame), // ENHANCED identification
            characters: safeGetLength(textFrame.characters),
            words: safeGetLength(textFrame.words),
            paragraphs: safeGetLength(textFrame.paragraphs),
            lines: safeGetLength(textFrame.lines),
            // Additional properties for comprehensive style and positioning changes
            appliedObjectStyle: safeGetProperty(textFrame.appliedObjectStyle, 'name'),
            rotation: safeGetProperty(textFrame, 'rotationAngle'),
            opacity: safeGetProperty(textFrame, 'transparencySettings.blendingSettings.opacity'),
            // Text threading information
            previousTextFrame: safeGetProperty(textFrame.previousTextFrame, 'id'),
            nextTextFrame: safeGetProperty(textFrame.nextTextFrame, 'id'),
            // Content statistics for change detection
            characterCount: textFrame.contents ? textFrame.contents.length : 0,
            wordCount: calculateWordCount(textFrame),
            // First paragraph style for change tracking
            firstParagraphStyle: getFirstParagraphStyle(textFrame)
        };
    }, ANALYSIS_CONFIG.maxCollectionSample, "textFrames");
}

function calculateWordCount(textFrame) {
    try {
        if (textFrame.contents) {
            return textFrame.contents.split(/\s+/).filter(function(word) { 
                return word.length > 0; 
            }).length;
        }
    } catch (e) {
        debugLog("Failed to calculate word count: " + e.message, "WARN");
    }
    return 0;
}

function getFirstParagraphStyle(textFrame) {
    try {
        if (textFrame.paragraphs && textFrame.paragraphs.length > 0) {
            return safeGetProperty(textFrame.paragraphs[0].appliedParagraphStyle, 'name');
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
        textAnalysis.textFrameDetails = safeIterateCollection(doc.textFrames, function(textFrame, index) {
            var frameAnalysis = {
                index: index,
                id: safeGetProperty(textFrame, 'id'),
                path: "doc.textFrames[" + index + "]",
                bounds: safeGetProperty(textFrame, 'bounds'),
                overflows: safeGetProperty(textFrame, 'overflows', false),
                layer: safeGetProperty(textFrame.itemLayer, 'name'),
                textPreview: safeTextCapture(textFrame), // ENHANCED identification
                characterCount: 0,
                wordCount: 0,
                paragraphCount: 0,
                // Enhanced properties for comprehensive change detection
                appliedParagraphStyle: safeGetProperty(textFrame.paragraphs && textFrame.paragraphs[0] ? textFrame.paragraphs[0].appliedParagraphStyle : null, 'name'),
                appliedCharacterStyle: safeGetProperty(textFrame.characters && textFrame.characters[0] ? textFrame.characters[0].appliedCharacterStyle : null, 'name'),
                fontFamily: null,
                fontSize: null,
                textColor: null,
                // Threading information
                isThreaded: !!(textFrame.previousTextFrame || textFrame.nextTextFrame),
                threadPosition: getThreadPosition(textFrame)
            };
            
            // Enhanced character/word counting for comprehensive change detection
            try {
                if (textFrame.contents) {
                    var content = textFrame.contents;
                    frameAnalysis.characterCount = content.length;
                    frameAnalysis.wordCount = content.split(/\s+/).filter(function(word) { 
                        return word.length > 0; 
                    }).length;
                    frameAnalysis.paragraphCount = safeGetLength(textFrame.paragraphs);
                    
                    // Try to get comprehensive font and color information for change detection
                    try {
                        if (textFrame.characters && textFrame.characters[0]) {
                            frameAnalysis.fontFamily = safeGetProperty(textFrame.characters[0].appliedFont, 'fontFamily');
                            frameAnalysis.fontSize = safeGetProperty(textFrame.characters[0], 'pointSize');
                            frameAnalysis.textColor = safeGetProperty(textFrame.characters[0].fillColor, 'name');
                        }
                    } catch (fontError) {
                        debugLog("Could not get font info for frame " + index, "WARN");
                    }
                }
            } catch (e) {
                frameAnalysis.textError = "Access failed: " + e.message;
                debugLog("Text content access failed for frame " + index + ": " + e.message, "ERROR");
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
        }, 15, "textFrames"); // Increased limit for comprehensive coverage
    } catch (e) {
        textAnalysis.textFrameDetailsError = "Text frames analysis failed: " + e.message;
        debugLog("Text frames analysis failed: " + e.message, "ERROR");
    }
    
    statusLog("Text Analysis", "Processing stories", 50);
    
    // COMPREHENSIVE story analysis  
    try {
        textAnalysis.storyDetails = safeIterateCollection(doc.stories, function(story, index) {
            var storyAnalysis = {
                index: index,
                id: safeGetProperty(story, 'id'),
                path: "doc.stories[" + index + "]",
                length: safeGetProperty(story, 'length', 0),
                textFrameCount: safeGetLength(story.textFrames),
                overflows: safeGetProperty(story, 'overflows', false),
                characterCount: safeGetLength(story.characters),
                wordCount: safeGetLength(story.words),
                paragraphCount: safeGetLength(story.paragraphs),
                // Enhanced threading information for change detection
                isThreaded: safeGetLength(story.textFrames) > 1,
                threadLength: safeGetLength(story.textFrames),
                // Content preview for change identification
                contentPreview: story.contents ? story.contents.substring(0, 150) : "[NO CONTENT]",
                // Story-level statistics
                averageWordsPerParagraph: calculateWordsPerParagraph(story),
                hasFootnotes: story.footnotes ? safeGetLength(story.footnotes) > 0 : false,
                footnoteCount: story.footnotes ? safeGetLength(story.footnotes) : 0
            };
            
            textAnalysis.summary.totalStories++;
            ANALYSIS_CONFIG.textItemsProcessed++;
            
            return storyAnalysis;
        }, 15, "stories"); // Increased limit for comprehensive coverage
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
        if (textFrame.previousTextFrame && textFrame.nextTextFrame) {
            return "middle";
        } else if (textFrame.previousTextFrame) {
            return "end";
        } else if (textFrame.nextTextFrame) {
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
        for (var i = 0; i < textAnalysis.textFrameDetails.length; i++) {
            var frame = textAnalysis.textFrameDetails[i];
            if (frame.characterCount > maxChars) {
                maxChars = frame.characterCount;
                stats.largestTextFrame = {
                    index: frame.index,
                    characterCount: frame.characterCount,
                    preview: frame.textPreview
                };
            }
            if (frame.characterCount < minChars && frame.characterCount > 0) {
                minChars = frame.characterCount;
                stats.smallestTextFrame = {
                    index: frame.index,
                    characterCount: frame.characterCount,
                    preview: frame.textPreview
                };
            }
            
            // Categorize frame sizes
            if (frame.characterCount === 0) {
                stats.textDistribution.emptyFrames++;
            } else if (frame.characterCount < 100) {
                stats.textDistribution.smallFrames++;
            } else if (frame.characterCount < 1000) {
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
        paragraphStyles: safeIterateCollection(doc.paragraphStyles, function(style, index) {
            return {
                index: index,
                id: safeGetProperty(style, 'id'),
                name: safeGetProperty(style, 'name'),
                basedOn: safeGetProperty(style.basedOn, 'name'),
                // Additional properties for comprehensive change detection
                fontFamily: safeGetProperty(style, 'appliedFont.fontFamily'),
                fontSize: safeGetProperty(style, 'pointSize'),
                color: safeGetProperty(style, 'fillColor.name'),
                leading: safeGetProperty(style, 'leading'),
                spaceAfter: safeGetProperty(style, 'spaceAfter'),
                spaceBefore: safeGetProperty(style, 'spaceBefore')
            };
        }, 15, "paragraphStyles"), // Increased for comprehensive coverage
        
        characterStyles: safeIterateCollection(doc.characterStyles, function(style, index) {
            return {
                index: index,
                id: safeGetProperty(style, 'id'),
                name: safeGetProperty(style, 'name'),
                basedOn: safeGetProperty(style.basedOn, 'name'),
                // Additional properties for comprehensive change detection
                fontFamily: safeGetProperty(style, 'appliedFont.fontFamily'),
                fontSize: safeGetProperty(style, 'pointSize'),
                color: safeGetProperty(style, 'fillColor.name'),
                fontStyle: safeGetProperty(style, 'fontStyle')
            };
        }, 15, "characterStyles") // Increased for comprehensive coverage
    };
}

function getColorsInfo(doc) {
    debugLog("Analyzing colors", "COLORS");
    
    return safeIterateCollection(doc.colors, function(color, index) {
        return {
            index: index,
            id: safeGetProperty(color, 'id'),
            name: safeGetProperty(color, 'name'),
            model: safeGetProperty(color, 'model') ? color.model.toString() : 'unknown',
            space: safeGetProperty(color, 'space') ? color.space.toString() : 'unknown',
            colorValue: safeGetProperty(color, 'colorValue'),
            // Additional properties for comprehensive change detection
            colorType: safeGetProperty(color, 'colorType') ? color.colorType.toString() : 'unknown',
            inkName: safeGetProperty(color, 'inkName'),
            tint: safeGetProperty(color, 'tint')
        };
    }, ANALYSIS_CONFIG.maxCollectionSample, "colors");
}

function getFontsInfo(doc) {
    debugLog("Analyzing fonts", "FONTS");
    
    return safeIterateCollection(doc.fonts, function(font, index) {
        return {
            index: index,
            id: safeGetProperty(font, 'id'),
            name: safeGetProperty(font, 'name'),
            fontFamily: safeGetProperty(font, 'fontFamily'),
            fontStyleName: safeGetProperty(font, 'fontStyleName'),
            postScriptName: safeGetProperty(font, 'postScriptName'),
            status: safeGetProperty(font, 'status') ? font.status.toString() : 'unknown',
            // Additional properties for comprehensive change detection
            location: safeGetProperty(font, 'location'),
            version: safeGetProperty(font, 'version'),
            fontType: safeGetProperty(font, 'fontType') ? font.fontType.toString() : 'unknown',
            platform: safeGetProperty(font, 'platformName')
        };
    }, ANALYSIS_CONFIG.maxCollectionSample, "fonts");
}

// ESSENTIAL for detecting image and link changes - RESTORED
function getImagesInfo(doc) {
    debugLog("Analyzing images", "IMAGES");
    
    return safeIterateCollection(doc.images, function(image, index) {
        return {
            index: index,
            id: safeGetProperty(image, 'id'),
            bounds: safeGetProperty(image, 'bounds'),
            actualPpi: safeGetProperty(image, 'actualPpi'),
            effectivePpi: safeGetProperty(image, 'effectivePpi'),
            itemLink: safeGetProperty(image, 'itemLink') ? {
                name: safeGetProperty(image.itemLink, 'name'),
                status: safeGetProperty(image.itemLink, 'status') ? image.itemLink.status.toString() : 'unknown',
                filePath: safeGetProperty(image.itemLink, 'filePath'),
                size: safeGetProperty(image.itemLink, 'size'),
                date: safeGetProperty(image.itemLink, 'date'),
                linkType: safeGetProperty(image.itemLink, 'linkType') ? image.itemLink.linkType.toString() : 'unknown'
            } : null,
            parent: safeGetProperty(image.parent, 'constructor') ? image.parent.constructor.name : 'unknown',
            // Additional properties for comprehensive change detection
            imageTypeName: safeGetProperty(image, 'imageTypeName'),
            transparencySettings: safeGetProperty(image, 'transparencySettings.blendingSettings.opacity')
        };
    }, ANALYSIS_CONFIG.maxCollectionSample, "images");
}

function getLinksInfo(doc) {
    debugLog("Analyzing links", "LINKS");
    
    return safeIterateCollection(doc.links, function(link, index) {
        return {
            index: index,
            id: safeGetProperty(link, 'id'),
            name: safeGetProperty(link, 'name'),
            filePath: safeGetProperty(link, 'filePath'),
            status: safeGetProperty(link, 'status') ? link.status.toString() : 'unknown',
            size: safeGetProperty(link, 'size'),
            date: safeGetProperty(link, 'date'),
            linkType: safeGetProperty(link, 'linkType') ? link.linkType.toString() : 'unknown',
            // Additional properties for comprehensive change detection
            needed: safeGetProperty(link, 'needed'),
            canEmbed: safeGetProperty(link, 'canEmbed'),
            canUnembed: safeGetProperty(link, 'canUnembed'),
            linkResourceURI: safeGetProperty(link, 'linkResourceURI'),
            versionState: safeGetProperty(link, 'versionState') ? link.versionState.toString() : 'unknown'
        };
    }, ANALYSIS_CONFIG.maxCollectionSample, "links");
}

// RESTORED - Essential for detecting page item changes
function getPageItemsInfo(doc) {
    debugLog("Analyzing page items", "PAGEITEMS");
    
    var pageItemsInfo = {
        totalCount: safeGetLength(doc.pageItems),
        byType: {},
        sample: []
    };
    
    // Sample page items for detailed analysis
    pageItemsInfo.sample = safeIterateCollection(doc.pageItems, function(item, index) {
        var itemType = safeGetProperty(item, 'constructor') ? item.constructor.name : 'unknown';
        
        // Count by type
        if (!pageItemsInfo.byType[itemType]) {
            pageItemsInfo.byType[itemType] = 0;
        }
        pageItemsInfo.byType[itemType]++;
        
        return {
            index: index,
            id: safeGetProperty(item, 'id'),
            type: itemType,
            bounds: safeGetProperty(item, 'bounds'),
            layer: safeGetProperty(item.itemLayer, 'name'),
            parent: safeGetProperty(item.parent, 'constructor') ? item.parent.constructor.name : 'unknown',
            visible: safeGetProperty(item, 'visible', true),
            locked: safeGetProperty(item, 'locked', false),
            // Additional properties for change detection
            rotation: safeGetProperty(item, 'rotationAngle'),
            opacity: safeGetProperty(item, 'transparencySettings.blendingSettings.opacity')
        };
    }, Math.min(ANALYSIS_CONFIG.maxCollectionSample, 30), "pageItems");
    
    return pageItemsInfo;
}