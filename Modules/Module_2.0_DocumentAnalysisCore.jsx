// ============================================================================
// MODULE 2.0: DOCUMENT ANALYSIS CORE
// InDesign Document Query Tool v3.1 - Enhanced Safety Edition
// ES3 Compatible - All Reserved Words Fixed
// ============================================================================

// ============================================================================
// MAIN ANALYSIS FUNCTIONS
// ============================================================================

function analyzeDocumentToTree(docRef) {
    debugLog("Starting document analysis", "ANALYSIS");
    
    if (!docRef) {
        updateProgress("analysis", "validation", "No document provided", "error");
        return createErrorNode("Document", "No document provided", "analysis.error");
    }
    
    // Validate environment first
    if (!validateEnvironment()) {
        updateProgress("analysis", "environment", "Environment validation failed", "error");
        return createErrorNode("Document", "Environment not ready", "analysis.environment");
    }
    
    // Set analysis as active
    setAnalysisActive(true);
    
    try {
        // Get enabled targets
        var enabledTargets = getEnabledTargets();
        if (enabledTargets.length === 0) {
            updateProgress("analysis", "targets", "No targets enabled", "error");
            return createErrorNode("Document", "No analysis targets enabled", "analysis.config");
        }
        
        // Update progress tracking
        QUERY_CONFIG.progress.totalTargets = enabledTargets.length;
        
        // Create root analysis node
        var rootNode = {
            type: "Document",
            name: emergencyGetProperty(docRef, 'name', 'Unknown Document'),
            properties: {},
            children: [],
            metadata: {
                timestamp: toISOString(new Date()),
                safetyMode: getCurrentSafetyMode(),
                targetsAnalyzed: enabledTargets,
                analysisVersion: "3.1"
            },
            statistics: {
                totalProperties: 0,
                totalErrors: 0,
                processingTime: 0
            }
        };
        
        var analysisStartTime = new Date().getTime();
        
        // Analyze each enabled target
        for (var i = 0; i < enabledTargets.length; i++) {
            var targetName = enabledTargets[i];
            var targetConfig = QUERY_CONFIG.targets[targetName];
            
            updateProgress("analysis", targetName, "Analyzing " + targetConfig.description, "working");
            
            try {
                var targetResult = analyzeDocumentTarget(docRef, targetName, targetConfig);
                if (targetResult) {
                    rootNode.children.push(targetResult);
                    rootNode.statistics.totalProperties += targetResult.statistics ? targetResult.statistics.propertyCount : 0;
                }
                
                QUERY_CONFIG.progress.completedTargets++;
                updateProgress("analysis", targetName, "Completed " + targetName, "success");
                
            } catch (exc) {
                rootNode.statistics.totalErrors++;
                var errorNode = createErrorNode(targetName, exc.message, "target.analysis");
                rootNode.children.push(errorNode);
                updateProgress("analysis", targetName, "Failed: " + exc.message, "error");
            }
        }
        
        // Finalize analysis
        rootNode.statistics.processingTime = new Date().getTime() - analysisStartTime;
        rootNode.metadata.memoryStatus = checkMemoryUsage();
        rootNode.metadata.emergencyBailouts = QUERY_CONFIG.runtime.emergencyBailouts;
        rootNode.metadata.alternativeAccessUsed = QUERY_CONFIG.runtime.alternativeAccessUsed;
        
        updateProgress("analysis", "complete", "Analysis completed successfully", "success");
        debugLog("Document analysis completed: " + rootNode.statistics.totalProperties + " properties found", "ANALYSIS");
        
        return rootNode;
        
    } catch (exc) {
        updateProgress("analysis", "critical", "Critical analysis error: " + exc.message, "error");
        return createErrorNode("Document", "Critical analysis failure: " + exc.message, "analysis.critical");
        
    } finally {
        setAnalysisActive(false);
    }
}

function analyzeDocumentTarget(docRef, targetName, targetConfig) {
    var targetStartTime = new Date().getTime();
    
    // Create target node
    var targetNode = {
        type: "Target",
        name: targetName,
        description: targetConfig.description,
        safetyLevel: targetConfig.safetyLevel,
        properties: {},
        children: [],
        statistics: {
            propertyCount: 0,
            processingTime: 0,
            errors: [],
            warnings: []
        }
    };
    
    try {
        // Route to appropriate analysis function
        switch (targetName) {
            case "documentProperties":
                analyzeDocumentProperties(docRef, targetNode);
                break;
            case "pageCollection":
                analyzePageCollection(docRef, targetNode);
                break;
            case "textFrames":
                analyzeTextFrames(docRef, targetNode);
                break;
            case "textContent":
                analyzeTextContent(docRef, targetNode);
                break;
            case "images":
                analyzeImages(docRef, targetNode);
                break;
            case "links":
                analyzeLinks(docRef, targetNode);
                break;
            case "styles":
                analyzeStyles(docRef, targetNode);
                break;
            case "colors":
                analyzeColors(docRef, targetNode);
                break;
            case "layers":
                analyzeLayers(docRef, targetNode);
                break;
            case "pageItems":
                analyzePageItems(docRef, targetNode);
                break;
            default:
                throw new Error("Unknown target: " + targetName);
        }
        
        targetNode.statistics.processingTime = new Date().getTime() - targetStartTime;
        return targetNode;
        
    } catch (exc) {
        targetNode.statistics.errors.push(exc.message);
        targetNode.statistics.processingTime = new Date().getTime() - targetStartTime;
        throw exc;
    }
}

// ============================================================================
// SPECIFIC ANALYSIS FUNCTIONS
// ============================================================================

function analyzeDocumentProperties(docRef, targetNode) {
    debugLog("Analyzing document properties", "ANALYSIS");
    
    // Basic document properties
    addSafeProperty(targetNode, "name", emergencyGetProperty(docRef, 'name', 'Unknown'));
    addSafeProperty(targetNode, "saved", emergencyGetProperty(docRef, 'saved', false));
    addSafeProperty(targetNode, "modified", emergencyGetProperty(docRef, 'modified', false));
    addSafeProperty(targetNode, "filePath", emergencyGetProperty(docRef, 'filePath', null));
    
    // Collection counts (safe to access)
    addSafeProperty(targetNode, "pageCount", emergencyGetLength(emergencyGetProperty(docRef, 'pages'), 1000));
    addSafeProperty(targetNode, "spreadCount", emergencyGetLength(emergencyGetProperty(docRef, 'spreads'), 1000));
    addSafeProperty(targetNode, "layerCount", emergencyGetLength(emergencyGetProperty(docRef, 'layers'), 1000));
    addSafeProperty(targetNode, "storyCount", emergencyGetLength(emergencyGetProperty(docRef, 'stories'), 1000));
    
    // Document preferences with safety
    var docPrefs = emergencyGetProperty(docRef, 'documentPreferences');
    if (docPrefs) {
        var prefsNode = createChildNode(targetNode, "DocumentPreferences", "object");
        
        addSafeProperty(prefsNode, "pageWidth", emergencyGetProperty(docPrefs, 'pageWidth', 0));
        addSafeProperty(prefsNode, "pageHeight", emergencyGetProperty(docPrefs, 'pageHeight', 0));
        addSafeProperty(prefsNode, "pageOrientation", emergencyGetProperty(docPrefs, 'pageOrientation', 'Unknown'));
        addSafeProperty(prefsNode, "columnCount", emergencyGetProperty(docPrefs, 'columnCount', 1));
        addSafeProperty(prefsNode, "columnGutter", emergencyGetProperty(docPrefs, 'columnGutter', 0));
        addSafeProperty(prefsNode, "facingPages", emergencyGetProperty(docPrefs, 'facingPages', false));
        addSafeProperty(prefsNode, "intent", emergencyGetProperty(docPrefs, 'intent', 'Unknown'));
    }
    
    // View preferences
    var viewPrefs = emergencyGetProperty(docRef, 'viewPreferences');
    if (viewPrefs) {
        var viewNode = createChildNode(targetNode, "ViewPreferences", "object");
        
        addSafeProperty(viewNode, "horizontalMeasurementUnits", emergencyGetProperty(viewPrefs, 'horizontalMeasurementUnits', 'Unknown'));
        addSafeProperty(viewNode, "verticalMeasurementUnits", emergencyGetProperty(viewPrefs, 'verticalMeasurementUnits', 'Unknown'));
        addSafeProperty(viewNode, "rulerOrigin", emergencyGetProperty(viewPrefs, 'rulerOrigin', 'Unknown'));
    }
}

function analyzePageCollection(docRef, targetNode) {
    debugLog("Analyzing page collection", "ANALYSIS");
    
    var pages = emergencyGetProperty(docRef, 'pages');
    if (!pages) {
        targetNode.statistics.errors.push("Cannot access pages collection");
        return;
    }
    
    var pageCount = emergencyGetLength(pages, 2000);
    addSafeProperty(targetNode, "totalPages", pageCount);
    
    if (pageCount === 0) {
        targetNode.statistics.warnings.push("Document has no pages");
        return;
    }
    
    // Sample pages for analysis (limited for safety)
    var sampleLimit = Math.min(pageCount, QUERY_CONFIG.traversal.sampleLimit);
    var pagesNode = createChildNode(targetNode, "Pages", "collection");
    addSafeProperty(pagesNode, "sampledPages", sampleLimit);
    
    for (var i = 0; i < sampleLimit; i++) {
        try {
            var page = emergencyGetCollectionItem(pages, i, 1000);
            if (page) {
                var pageNode = createChildNode(pagesNode, "Page_" + i, "object");
                
                addSafeProperty(pageNode, "name", emergencyGetProperty(page, 'name', 'Unknown'));
                addSafeProperty(pageNode, "documentOffset", emergencyGetProperty(page, 'documentOffset', i));
                addSafeProperty(pageNode, "side", emergencyGetProperty(page, 'side', 'Unknown'));
                
                // Page item counts
                var pageItems = emergencyGetProperty(page, 'pageItems');
                if (pageItems) {
                    addSafeProperty(pageNode, "itemCount", emergencyGetLength(pageItems, 1000));
                }
                
                var textFrames = emergencyGetProperty(page, 'textFrames');
                if (textFrames) {
                    addSafeProperty(pageNode, "textFrameCount", emergencyGetLength(textFrames, 1000));
                }
                
                // Bounds information
                var bounds = emergencyGetProperty(page, 'bounds');
                if (bounds) {
                    addSafeProperty(pageNode, "bounds", bounds);
                }
            }
        } catch (exc) {
            targetNode.statistics.errors.push("Page " + i + ": " + exc.message);
        }
    }
}

function analyzeTextFrames(docRef, targetNode) {
    debugLog("Analyzing text frames", "ANALYSIS");
    
    var textFrames = emergencyGetProperty(docRef, 'textFrames');
    if (!textFrames) {
        targetNode.statistics.errors.push("Cannot access text frames collection");
        return;
    }
    
    var frameCount = emergencyGetLength(textFrames, 2000);
    addSafeProperty(targetNode, "totalTextFrames", frameCount);
    
    if (frameCount === 0) {
        targetNode.statistics.warnings.push("Document has no text frames");
        return;
    }
    
    // Sample text frames for analysis
    var sampleLimit = Math.min(frameCount, QUERY_CONFIG.traversal.sampleLimit);
    var framesNode = createChildNode(targetNode, "TextFrames", "collection");
    addSafeProperty(framesNode, "sampledFrames", sampleLimit);
    
    var totalCharacters = 0;
    var framesWithContent = 0;
    var overflowFrames = 0;
    
    for (var i = 0; i < sampleLimit; i++) {
        try {
            var frame = emergencyGetCollectionItem(textFrames, i, 1000);
            if (frame) {
                var frameNode = createChildNode(framesNode, "TextFrame_" + i, "object");
                
                addSafeProperty(frameNode, "name", emergencyGetProperty(frame, 'name', 'Unknown'));
                
                // Content analysis
                var contents = emergencyGetProperty(frame, 'contents');
                if (contents && typeof contents === 'string') {
                    framesWithContent++;
                    totalCharacters += contents.length;
                    addSafeProperty(frameNode, "characterCount", contents.length);
                    addSafeProperty(frameNode, "hasContent", true);
                    
                    // Preview of content (limited for safety)
                    var preview = contents.substring(0, 100);
                    if (contents.length > 100) {
                        preview += "...";
                    }
                    addSafeProperty(frameNode, "contentPreview", preview);
                } else {
                    addSafeProperty(frameNode, "hasContent", false);
                    addSafeProperty(frameNode, "characterCount", 0);
                }
                
                // Overflow status
                var overflows = emergencyGetProperty(frame, 'overflows', false);
                addSafeProperty(frameNode, "overflows", overflows);
                if (overflows) {
                    overflowFrames++;
                }
                
                // Threading information
                var prevFrame = emergencyGetProperty(frame, 'previousTextFrame');
                var nextFrame = emergencyGetProperty(frame, 'nextTextFrame');
                addSafeProperty(frameNode, "isThreaded", !!(prevFrame || nextFrame));
                
                // Bounds information
                var bounds = emergencyGetProperty(frame, 'geometricBounds');
                if (bounds) {
                    addSafeProperty(frameNode, "geometricBounds", bounds);
                }
            }
        } catch (exc) {
            targetNode.statistics.errors.push("Text frame " + i + ": " + exc.message);
        }
    }
    
    // Summary statistics
    addSafeProperty(targetNode, "framesWithContent", framesWithContent);
    addSafeProperty(targetNode, "totalCharacters", totalCharacters);
    addSafeProperty(targetNode, "overflowFrames", overflowFrames);
    addSafeProperty(targetNode, "averageCharactersPerFrame", framesWithContent > 0 ? Math.round(totalCharacters / framesWithContent) : 0);
}

function analyzeTextContent(docRef, targetNode) {
    debugLog("Analyzing text content", "ANALYSIS");
    
    // Only proceed if safety mode allows text content analysis
    var currentMode = getCurrentSafetyMode();
    if (currentMode === "emergency" || currentMode === "minimal") {
        targetNode.statistics.warnings.push("Text content analysis skipped in " + currentMode + " mode");
        return;
    }
    
    var stories = emergencyGetProperty(docRef, 'stories');
    if (!stories) {
        targetNode.statistics.errors.push("Cannot access stories collection");
        return;
    }
    
    var storyCount = emergencyGetLength(stories, 1000);
    addSafeProperty(targetNode, "totalStories", storyCount);
    
    if (storyCount === 0) {
        targetNode.statistics.warnings.push("Document has no stories");
        return;
    }
    
    // Sample stories for content analysis
    var sampleLimit = Math.min(storyCount, Math.floor(QUERY_CONFIG.traversal.sampleLimit / 2)); // Reduced for text content
    var contentNode = createChildNode(targetNode, "TextContent", "collection");
    addSafeProperty(contentNode, "sampledStories", sampleLimit);
    
    var totalWords = 0;
    var totalCharacters = 0;
    var storiesWithContent = 0;
    
    for (var i = 0; i < sampleLimit; i++) {
        try {
            var story = emergencyGetCollectionItem(stories, i, 1500);
            if (story) {
                var storyNode = createChildNode(contentNode, "Story_" + i, "object");
                
                // Get story length safely
                var storyLength = emergencyGetLength(emergencyGetProperty(story, 'characters'), 1000);
                addSafeProperty(storyNode, "characterCount", storyLength);
                
                if (storyLength > 0) {
                    storiesWithContent++;
                    totalCharacters += storyLength;
                    
                    // Sample text content (very limited for safety)
                    var textSample = getTextSample(story, 200); // Max 200 characters
                    if (textSample) {
                        addSafeProperty(storyNode, "textSample", textSample);
                        
                        // Simple word count
                        var words = textSample.split(/\s+/);
                        var wordCount = 0;
                        for (var j = 0; j < words.length; j++) {
                            if (words[j].length > 0) {
                                wordCount++;
                            }
                        }
                        addSafeProperty(storyNode, "sampleWordCount", wordCount);
                        totalWords += wordCount;
                    }
                }
                
                // Paragraph count (if accessible)
                var paragraphs = emergencyGetProperty(story, 'paragraphs');
                if (paragraphs) {
                    addSafeProperty(storyNode, "paragraphCount", emergencyGetLength(paragraphs, 500));
                }
            }
        } catch (exc) {
            targetNode.statistics.errors.push("Story " + i + ": " + exc.message);
        }
    }
    
    // Summary statistics
    addSafeProperty(targetNode, "storiesWithContent", storiesWithContent);
    addSafeProperty(targetNode, "totalCharacters", totalCharacters);
    addSafeProperty(targetNode, "totalWords", totalWords);
    addSafeProperty(targetNode, "averageWordsPerStory", storiesWithContent > 0 ? Math.round(totalWords / storiesWithContent) : 0);
}

function analyzeImages(docRef, targetNode) {
    debugLog("Analyzing images", "ANALYSIS");
    
    var images = emergencyGetProperty(docRef, 'images');
    if (!images) {
        targetNode.statistics.errors.push("Cannot access images collection");
        return;
    }
    
    var imageCount = emergencyGetLength(images, 1500);
    addSafeProperty(targetNode, "totalImages", imageCount);
    
    if (imageCount === 0) {
        targetNode.statistics.warnings.push("Document has no images");
        return;
    }
    
    // Sample images for analysis
    var sampleLimit = Math.min(imageCount, QUERY_CONFIG.traversal.sampleLimit);
    var imagesNode = createChildNode(targetNode, "Images", "collection");
    addSafeProperty(imagesNode, "sampledImages", sampleLimit);
    
    var imagesWithLinks = 0;
    var colorSpaces = {};
    
    for (var i = 0; i < sampleLimit; i++) {
        try {
            var image = emergencyGetCollectionItem(images, i, 1000);
            if (image) {
                var imageNode = createChildNode(imagesNode, "Image_" + i, "object");
                
                // Link information
                var itemLink = emergencyGetProperty(image, 'itemLink');
                if (itemLink) {
                    imagesWithLinks++;
                    addSafeProperty(imageNode, "hasLink", true);
                    addSafeProperty(imageNode, "linkName", emergencyGetProperty(itemLink, 'name', 'Unknown'));
                    addSafeProperty(imageNode, "linkStatus", emergencyGetProperty(itemLink, 'status', 'Unknown'));
                } else {
                    addSafeProperty(imageNode, "hasLink", false);
                }
                
                // Resolution information
                var actualRes = emergencyGetProperty(image, 'actualResolution');
                if (actualRes) {
                    addSafeProperty(imageNode, "actualResolution", actualRes);
                }
                
                var effectiveRes = emergencyGetProperty(image, 'effectiveResolution');
                if (effectiveRes) {
                    addSafeProperty(imageNode, "effectiveResolution", effectiveRes);
                }
                
                // Color space
                var colorSpace = emergencyGetProperty(image, 'space', 'Unknown');
                addSafeProperty(imageNode, "colorSpace", colorSpace);
                colorSpaces[colorSpace] = (colorSpaces[colorSpace] || 0) + 1;
            }
        } catch (exc) {
            targetNode.statistics.errors.push("Image " + i + ": " + exc.message);
        }
    }
    
    // Summary statistics
    addSafeProperty(targetNode, "imagesWithLinks", imagesWithLinks);
    addSafeProperty(targetNode, "colorSpaceBreakdown", colorSpaces);
}

function analyzeLinks(docRef, targetNode) {
    debugLog("Analyzing links", "ANALYSIS");
    
    var links = emergencyGetProperty(docRef, 'links');
    if (!links) {
        targetNode.statistics.errors.push("Cannot access links collection");
        return;
    }
    
    var linkCount = emergencyGetLength(links, 2000);
    addSafeProperty(targetNode, "totalLinks", linkCount);
    
    if (linkCount === 0) {
        targetNode.statistics.warnings.push("Document has no links");
        return;
    }
    
    // Sample links for analysis
    var sampleLimit = Math.min(linkCount, QUERY_CONFIG.traversal.sampleLimit);
    var linksNode = createChildNode(targetNode, "Links", "collection");
    addSafeProperty(linksNode, "sampledLinks", sampleLimit);
    
    var statusBreakdown = {};
    var totalSize = 0;
    var missingLinks = 0;
    var modifiedLinks = 0;
    
    for (var i = 0; i < sampleLimit; i++) {
        try {
            var link = emergencyGetCollectionItem(links, i, 1000);
            if (link) {
                var linkNode = createChildNode(linksNode, "Link_" + i, "object");
                
                addSafeProperty(linkNode, "name", emergencyGetProperty(link, 'name', 'Unknown'));
                
                var status = emergencyGetProperty(link, 'status', 'Unknown');
                addSafeProperty(linkNode, "status", status);
                statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
                
                if (status === 'Missing') missingLinks++;
                if (status === 'Modified') modifiedLinks++;
                
                addSafeProperty(linkNode, "filePath", emergencyGetProperty(link, 'filePath', 'Unknown'));
                
                var size = emergencyGetProperty(link, 'size', 0);
                addSafeProperty(linkNode, "size", size);
                totalSize += size;
                
                addSafeProperty(linkNode, "needed", emergencyGetProperty(link, 'needed', false));
            }
        } catch (exc) {
            targetNode.statistics.errors.push("Link " + i + ": " + exc.message);
        }
    }
    
    // Summary statistics
    addSafeProperty(targetNode, "statusBreakdown", statusBreakdown);
    addSafeProperty(targetNode, "totalSize", totalSize);
    addSafeProperty(targetNode, "averageSize", sampleLimit > 0 ? Math.round(totalSize / sampleLimit) : 0);
    addSafeProperty(targetNode, "missingLinks", missingLinks);
    addSafeProperty(targetNode, "modifiedLinks", modifiedLinks);
}

function analyzeStyles(docRef, targetNode) {
    debugLog("Analyzing styles", "ANALYSIS");
    
    var stylesNode = createChildNode(targetNode, "Styles", "object");
    
    // Analyze paragraph styles
    var paraStyles = emergencyGetProperty(docRef, 'paragraphStyles');
    if (paraStyles) {
        var paraStyleCount = emergencyGetLength(paraStyles, 1000);
        var paraNode = createChildNode(stylesNode, "ParagraphStyles", "collection");
        addSafeProperty(paraNode, "totalCount", paraStyleCount);
        
        // Sample paragraph styles
        var sampleLimit = Math.min(paraStyleCount, Math.floor(QUERY_CONFIG.traversal.sampleLimit / 2));
        for (var i = 0; i < sampleLimit; i++) {
            try {
                var paraStyle = emergencyGetCollectionItem(paraStyles, i, 500);
                if (paraStyle) {
                    var styleNode = createChildNode(paraNode, "ParagraphStyle_" + i, "object");
                    addSafeProperty(styleNode, "name", emergencyGetProperty(paraStyle, 'name', 'Unknown'));
                    addSafeProperty(styleNode, "appliedFont", emergencyGetProperty(paraStyle, 'appliedFont', 'Unknown'));
                    addSafeProperty(styleNode, "pointSize", emergencyGetProperty(paraStyle, 'pointSize', 0));
                    addSafeProperty(styleNode, "justification", emergencyGetProperty(paraStyle, 'justification', 'Unknown'));
                }
            } catch (exc) {
                targetNode.statistics.errors.push("Paragraph style " + i + ": " + exc.message);
            }
        }
    }
    
    // Analyze character styles
    var charStyles = emergencyGetProperty(docRef, 'characterStyles');
    if (charStyles) {
        var charStyleCount = emergencyGetLength(charStyles, 1000);
        var charNode = createChildNode(stylesNode, "CharacterStyles", "collection");
        addSafeProperty(charNode, "totalCount", charStyleCount);
        
        // Sample character styles
        var sampleLimit = Math.min(charStyleCount, Math.floor(QUERY_CONFIG.traversal.sampleLimit / 2));
        for (var i = 0; i < sampleLimit; i++) {
            try {
                var charStyle = emergencyGetCollectionItem(charStyles, i, 500);
                if (charStyle) {
                    var styleNode = createChildNode(charNode, "CharacterStyle_" + i, "object");
                    addSafeProperty(styleNode, "name", emergencyGetProperty(charStyle, 'name', 'Unknown'));
                    addSafeProperty(styleNode, "appliedFont", emergencyGetProperty(charStyle, 'appliedFont', 'Unknown'));
                    addSafeProperty(styleNode, "pointSize", emergencyGetProperty(charStyle, 'pointSize', 0));
                }
            } catch (exc) {
                targetNode.statistics.errors.push("Character style " + i + ": " + exc.message);
            }
        }
    }
}

function analyzeColors(docRef, targetNode) {
    debugLog("Analyzing colors", "ANALYSIS");
    
    var colors = emergencyGetProperty(docRef, 'colors');
    if (!colors) {
        targetNode.statistics.errors.push("Cannot access colors collection");
        return;
    }
    
    var colorCount = emergencyGetLength(colors, 1000);
    addSafeProperty(targetNode, "totalColors", colorCount);
    
    if (colorCount === 0) {
        targetNode.statistics.warnings.push("Document has no colors");
        return;
    }
    
    // Sample colors for analysis
    var sampleLimit = Math.min(colorCount, QUERY_CONFIG.traversal.sampleLimit);
    var colorsNode = createChildNode(targetNode, "Colors", "collection");
    addSafeProperty(colorsNode, "sampledColors", sampleLimit);
    
    var modelBreakdown = {};
    var spaceBreakdown = {};
    
    for (var i = 0; i < sampleLimit; i++) {
        try {
            var color = emergencyGetCollectionItem(colors, i, 500);
            if (color) {
                var colorNode = createChildNode(colorsNode, "Color_" + i, "object");
                
                addSafeProperty(colorNode, "name", emergencyGetProperty(color, 'name', 'Unknown'));
                
                var model = emergencyGetProperty(color, 'model', 'Unknown');
                addSafeProperty(colorNode, "model", model);
                modelBreakdown[model] = (modelBreakdown[model] || 0) + 1;
                
                var space = emergencyGetProperty(color, 'space', 'Unknown');
                addSafeProperty(colorNode, "space", space);
                spaceBreakdown[space] = (spaceBreakdown[space] || 0) + 1;
                
                var colorValue = emergencyGetProperty(color, 'colorValue');
                if (colorValue) {
                    addSafeProperty(colorNode, "colorValue", colorValue);
                }
            }
        } catch (exc) {
            targetNode.statistics.errors.push("Color " + i + ": " + exc.message);
        }
    }
    
    // Summary statistics
    addSafeProperty(targetNode, "modelBreakdown", modelBreakdown);
    addSafeProperty(targetNode, "spaceBreakdown", spaceBreakdown);
}

function analyzeLayers(docRef, targetNode) {
    debugLog("Analyzing layers", "ANALYSIS");
    
    var layers = emergencyGetProperty(docRef, 'layers');
    if (!layers) {
        targetNode.statistics.errors.push("Cannot access layers collection");
        return;
    }
    
    var layerCount = emergencyGetLength(layers, 500);
    addSafeProperty(targetNode, "totalLayers", layerCount);
    
    if (layerCount === 0) {
        targetNode.statistics.warnings.push("Document has no layers");
        return;
    }
    
    // Analyze all layers (usually not too many)
    var layersNode = createChildNode(targetNode, "Layers", "collection");
    
    var visibleLayers = 0;
    var lockedLayers = 0;
    var layersWithItems = 0;
    
    for (var i = 0; i < layerCount; i++) {
        try {
            var layer = emergencyGetCollectionItem(layers, i, 1000);
            if (layer) {
                var layerNode = createChildNode(layersNode, "Layer_" + i, "object");
                
                addSafeProperty(layerNode, "name", emergencyGetProperty(layer, 'name', 'Unknown'));
                
                var visible = emergencyGetProperty(layer, 'visible', true);
                addSafeProperty(layerNode, "visible", visible);
                if (visible) visibleLayers++;
                
                var locked = emergencyGetProperty(layer, 'locked', false);
                addSafeProperty(layerNode, "locked", locked);
                if (locked) lockedLayers++;
                
                addSafeProperty(layerNode, "layerColor", emergencyGetProperty(layer, 'layerColor', 'Unknown'));
                
                // Count items on layer
                var pageItems = emergencyGetProperty(layer, 'pageItems');
                if (pageItems) {
                    var itemCount = emergencyGetLength(pageItems, 1000);
                    addSafeProperty(layerNode, "itemCount", itemCount);
                    if (itemCount > 0) layersWithItems++;
                }
            }
        } catch (exc) {
            targetNode.statistics.errors.push("Layer " + i + ": " + exc.message);
        }
    }
    
    // Summary statistics
    addSafeProperty(targetNode, "visibleLayers", visibleLayers);
    addSafeProperty(targetNode, "lockedLayers", lockedLayers);
    addSafeProperty(targetNode, "layersWithItems", layersWithItems);
}

function analyzePageItems(docRef, targetNode) {
    debugLog("Analyzing page items", "ANALYSIS");
    
    // Only proceed if safety mode allows page item analysis
    var currentMode = getCurrentSafetyMode();
    if (currentMode === "emergency" || currentMode === "minimal") {
        targetNode.statistics.warnings.push("Page items analysis skipped in " + currentMode + " mode");
        return;
    }
    
    var pageItems = emergencyGetProperty(docRef, 'pageItems');
    if (!pageItems) {
        targetNode.statistics.errors.push("Cannot access page items collection");
        return;
    }
    
    var itemCount = emergencyGetLength(pageItems, 2000);
    addSafeProperty(targetNode, "totalPageItems", itemCount);
    
    if (itemCount === 0) {
        targetNode.statistics.warnings.push("Document has no page items");
        return;
    }
    
    // Sample page items for analysis (very limited for safety)
    var sampleLimit = Math.min(itemCount, Math.floor(QUERY_CONFIG.traversal.sampleLimit / 2));
    var itemsNode = createChildNode(targetNode, "PageItems", "collection");
    addSafeProperty(itemsNode, "sampledItems", sampleLimit);
    
    var typeBreakdown = {};
    var visibleItems = 0;
    var lockedItems = 0;
    
    for (var i = 0; i < sampleLimit; i++) {
        try {
            var pageItem = emergencyGetCollectionItem(pageItems, i, 1000);
            if (pageItem) {
                var itemNode = createChildNode(itemsNode, "PageItem_" + i, "object");
                
                // Type detection
                var constructor = emergencyGetProperty(pageItem, 'constructor');
                var typeName = constructor ? emergencyGetProperty(constructor, 'name', 'Unknown') : 'Unknown';
                addSafeProperty(itemNode, "type", typeName);
                typeBreakdown[typeName] = (typeBreakdown[typeName] || 0) + 1;
                
                addSafeProperty(itemNode, "name", emergencyGetProperty(pageItem, 'name', 'Unknown'));
                
                var visible = emergencyGetProperty(pageItem, 'visible', true);
                addSafeProperty(itemNode, "visible", visible);
                if (visible) visibleItems++;
                
                var locked = emergencyGetProperty(pageItem, 'locked', false);
                addSafeProperty(itemNode, "locked", locked);
                if (locked) lockedItems++;
                
                // Bounds information
                var bounds = emergencyGetProperty(pageItem, 'geometricBounds');
                if (bounds) {
                    addSafeProperty(itemNode, "geometricBounds", bounds);
                }
                
                addSafeProperty(itemNode, "label", emergencyGetProperty(pageItem, 'label', ''));
            }
        } catch (exc) {
            targetNode.statistics.errors.push("Page item " + i + ": " + exc.message);
        }
    }
    
    // Summary statistics
    addSafeProperty(targetNode, "typeBreakdown", typeBreakdown);
    addSafeProperty(targetNode, "visibleItems", visibleItems);
    addSafeProperty(targetNode, "lockedItems", lockedItems);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getTextSample(story, maxLength) {
    try {
        // Try to get content directly first
        var contents = emergencyGetProperty(story, 'contents');
        if (contents && typeof contents === 'string') {
            return contents.substring(0, maxLength);
        }
        
        // Fallback: try to get from characters collection
        var characters = emergencyGetProperty(story, 'characters');
        if (characters) {
            var charCount = emergencyGetLength(characters, 500);
            var sampleCount = Math.min(charCount, maxLength);
            var textSample = "";
            
            for (var i = 0; i < sampleCount; i++) {
                var charObj = emergencyGetCollectionItem(characters, i, 100);
                if (charObj) {
                    var charContent = emergencyGetProperty(charObj, 'contents', '');
                    textSample += charContent;
                }
                
                if (textSample.length >= maxLength) {
                    break;
                }
            }
            
            return textSample;
        }
        
        return null;
        
    } catch (exc) {
        debugLog("Text sample extraction failed: " + exc.message, "ERROR");
        return null;
    }
}

function addSafeProperty(nodeRef, propName, propValue) {
    try {
        if (nodeRef && nodeRef.properties) {
            nodeRef.properties[propName] = propValue;
            if (nodeRef.statistics) {
                nodeRef.statistics.propertyCount++;
            }
        }
    } catch (exc) {
        debugLog("Failed to add property " + propName + ": " + exc.message, "ERROR");
    }
}

function createChildNode(parentNode, nodeName, nodeType) {
    var childNode = {
        type: nodeType || "object",
        name: nodeName,
        properties: {},
        children: [],
        statistics: {
            propertyCount: 0,
            errors: [],
            warnings: []
        }
    };
    
    if (parentNode && parentNode.children) {
        parentNode.children.push(childNode);
    }
    
    return childNode;
}

function createErrorNode(nodeName, errorMessage, errorPath) {
    return {
        type: "error",
        name: nodeName,
        properties: {
            errorMessage: errorMessage,
            errorPath: errorPath,
            timestamp: toISOString(new Date())
        },
        children: [],
        statistics: {
            propertyCount: 1,
            errors: [errorMessage],
            warnings: []
        }
    };
}

$.writeln("Module 2.0: Document Analysis Core loaded (Enhanced safety with target-based analysis)");