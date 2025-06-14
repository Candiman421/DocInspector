// ============================================================================
// CHUNK 2.3: COMPREHENSIVE ANALYSIS - ADVANCED MODE WITH FULL FEATURES
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

function extractMarginInfo(page) {
    try {
        var margins = safeGetProperty(page, 'marginPreferences');
        if (margins) {
            return {
                top: safeGetProperty(margins, 'top'),
                left: safeGetProperty(margins, 'left'),
                bottom: safeGetProperty(margins, 'bottom'),
                right: safeGetProperty(margins, 'right'),
                columnCount: safeGetProperty(margins, 'columnCount'),
                columnGutter: safeGetProperty(margins, 'columnGutter')
            };
        }
    } catch (e) {
        return { error: "Margin info access failed: " + e.message };
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

function getStylesInfo(doc) {
    enhancedStatusLog("COMP_STYLES", "Analyzing styles", 0, 4, "Paragraph and character styles");
    
    var stylesInfo = {
        analysisMode: "comprehensive",
        timestamp: toISOString(new Date())
    };
    
    try {
        // Paragraph styles
        enhancedStatusLog("COMP_STYLES", "Processing paragraph styles", 1, 4, "Style definitions");
        var paragraphStyles = safeGetProperty(doc, 'paragraphStyles');
        stylesInfo.paragraphStyles = enhancedSafeIterateCollection(paragraphStyles, function(style, itemIndex) {
            return {
                index: itemIndex,
                id: safeGetProperty(style, 'id'),
                name: safeGetProperty(style, 'name'),
                basedOn: safeGetProperty(safeGetProperty(style, 'basedOn'), 'name'),
                fontFamily: safeGetProperty(safeGetProperty(style, 'appliedFont'), 'fontFamily'),
                fontSize: safeGetProperty(style, 'pointSize'),
                color: safeGetProperty(safeGetProperty(style, 'fillColor'), 'name'),
                leading: safeGetProperty(style, 'leading'),
                spaceAfter: safeGetProperty(style, 'spaceAfter'),
                spaceBefore: safeGetProperty(style, 'spaceBefore'),
                analysisMode: "comprehensive"
            };
        }, ANALYSIS_CONFIG.maxCollectionSample, "paragraphStyles");
        
        // Character styles
        enhancedStatusLog("COMP_STYLES", "Processing character styles", 3, 4, "Character formatting");
        var characterStyles = safeGetProperty(doc, 'characterStyles');
        stylesInfo.characterStyles = enhancedSafeIterateCollection(characterStyles, function(style, itemIndex) {
            return {
                index: itemIndex,
                id: safeGetProperty(style, 'id'),
                name: safeGetProperty(style, 'name'),
                basedOn: safeGetProperty(safeGetProperty(style, 'basedOn'), 'name'),
                fontFamily: safeGetProperty(safeGetProperty(style, 'appliedFont'), 'fontFamily'),
                fontSize: safeGetProperty(style, 'pointSize'),
                color: safeGetProperty(safeGetProperty(style, 'fillColor'), 'name'),
                fontStyle: safeGetProperty(style, 'fontStyle'),
                analysisMode: "comprehensive"
            };
        }, ANALYSIS_CONFIG.maxCollectionSample, "characterStyles");
        
        enhancedStatusLog("COMP_STYLES", "Styles analysis completed", 4, 4, "Style definitions captured");
        
    } catch (exc) {
        stylesInfo.error = "Styles analysis failed: " + exc.message;
    }
    
    return stylesInfo;
}

function getColorsInfo(doc) {
    enhancedStatusLog("COMP_COLORS", "Analyzing colors", 0, 2, "Color definitions and swatches");
    
    var colors = safeGetProperty(doc, 'colors');
    var colorCount = safeGetLength(colors);
    
    if (colorCount === 0) {
        return {
            totalCount: 0,
            analysisMode: "comprehensive",
            note: "No colors found"
        };
    }
    
    return enhancedSafeIterateCollection(colors, function(color, itemIndex) {
        return {
            index: itemIndex,
            id: safeGetProperty(color, 'id'),
            name: safeGetProperty(color, 'name'),
            model: safeGetProperty(color, 'model') ? safeGetProperty(color, 'model').toString() : 'unknown',
            space: safeGetProperty(color, 'space') ? safeGetProperty(color, 'space').toString() : 'unknown',
            colorValue: safeGetProperty(color, 'colorValue'),
            colorType: safeGetProperty(color, 'colorType') ? safeGetProperty(color, 'colorType').toString() : 'unknown',
            inkName: safeGetProperty(color, 'inkName'),
            tint: safeGetProperty(color, 'tint'),
            analysisMode: "comprehensive"
        };
    }, ANALYSIS_CONFIG.maxCollectionSample, "colors");
}

function getFontsInfo(doc) {
    enhancedStatusLog("COMP_FONTS", "Analyzing fonts", 0, 2, "Font usage and availability");
    
    var fonts = safeGetProperty(doc, 'fonts');
    var fontCount = safeGetLength(fonts);
    
    if (fontCount === 0) {
        return {
            totalCount: 0,
            analysisMode: "comprehensive",
            note: "No fonts found"
        };
    }
    
    return enhancedSafeIterateCollection(fonts, function(font, itemIndex) {
        return {
            index: itemIndex,
            id: safeGetProperty(font, 'id'),
            name: safeGetProperty(font, 'name'),
            fontFamily: safeGetProperty(font, 'fontFamily'),
            fontStyleName: safeGetProperty(font, 'fontStyleName'),
            postScriptName: safeGetProperty(font, 'postScriptName'),
            status: safeGetProperty(font, 'status') ? safeGetProperty(font, 'status').toString() : 'unknown',
            location: safeGetProperty(font, 'location'),
            version: safeGetProperty(font, 'version'),
            fontType: safeGetProperty(font, 'fontType') ? safeGetProperty(font, 'fontType').toString() : 'unknown',
            platform: safeGetProperty(font, 'platformName'),
            analysisMode: "comprehensive"
        };
    }, ANALYSIS_CONFIG.maxCollectionSample, "fonts");
}

function getImagesInfo(doc) {
    enhancedStatusLog("COMP_IMAGES", "Analyzing images", 0, 3, "Image links and properties (may be slow)");
    
    var images = safeGetProperty(doc, 'images');
    var imageCount = safeGetLength(images);
    
    if (imageCount === 0) {
        return {
            totalCount: 0,
            analysisMode: "comprehensive",
            note: "No images found"
        };
    }
    
    // Images are often problematic, use smaller sample and shorter timeout
    var limitedSample = Math.min(imageCount, 10);
    enhancedStatusLog("COMP_IMAGES", "Limited sampling for safety", 1, 3, 
        "Processing " + limitedSample + " of " + imageCount + " images");
    
    return enhancedSafeIterateCollection(images, function(image, itemIndex) {
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
            imageTypeName: safeGetProperty(image, 'imageTypeName'),
            analysisMode: "comprehensive"
        };
    }, limitedSample, "images");
}

function getLinksInfo(doc) {
    enhancedStatusLog("COMP_LINKS", "Analyzing links", 0, 3, "Link status and properties (may be slow)");
    
    var links = safeGetProperty(doc, 'links');
    var linkCount = safeGetLength(links);
    
    if (linkCount === 0) {
        return {
            totalCount: 0,
            analysisMode: "comprehensive",
            note: "No links found"
        };
    }
    
    // Links are often problematic, use smaller sample
    var limitedSample = Math.min(linkCount, 10);
    enhancedStatusLog("COMP_LINKS", "Limited sampling for safety", 1, 3, 
        "Processing " + limitedSample + " of " + linkCount + " links");
    
    return enhancedSafeIterateCollection(links, function(link, itemIndex) {
        return {
            index: itemIndex,
            id: safeGetProperty(link, 'id'),
            name: safeGetProperty(link, 'name'),
            filePath: safeGetProperty(link, 'filePath'),
            status: safeGetProperty(link, 'status') ? safeGetProperty(link, 'status').toString() : 'unknown',
            size: safeGetProperty(link, 'size'),
            date: safeGetProperty(link, 'date'),
            linkType: safeGetProperty(link, 'linkType') ? safeGetProperty(link, 'linkType').toString() : 'unknown',
            needed: safeGetProperty(link, 'needed'),
            canEmbed: safeGetProperty(link, 'canEmbed'),
            canUnembed: safeGetProperty(link, 'canUnembed'),
            analysisMode: "comprehensive"
        };
    }, limitedSample, "links");
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

// Count analyzed collections for legacy compatibility
function countAnalyzedCollections(report) {
    var count = 0;
    var sections = ['pages', 'layers', 'stories', 'textFrames', 'styles', 'colors', 'fonts', 'images', 'links', 'pageItems'];
    
    for (var i = 0; i < sections.length; i++) {
        var section = safeGetProperty(report, sections[i]);
        if (section && safeGetLength(section)) {
            count++;
        }
    }
    
    return count;
}