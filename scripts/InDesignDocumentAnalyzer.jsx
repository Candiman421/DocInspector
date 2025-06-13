//
// Enhanced InDesign Document Analyzer Script
// Comprehensive analysis with bulletproof error handling and thorough image detection
//

// Global settings for analysis depth and safety
var ANALYSIS_CONFIG = {
    maxRecursionDepth: 10,
    enableDeepScan: true,
    skipEmptyProperties: true,
    timeoutThreshold: 30000, // 30 seconds max per section
    safeMode: true,
    logErrors: true,
    errors: [],
    maxErrorsPerSection: 5,
    skipProblematicProperties: true
};

// Enhanced safe property accessor with comprehensive error handling
function safeGetProperty(obj, prop, defaultValue) {
    try {
        // Handle null/undefined object
        if (!obj) {
            return defaultValue !== undefined ? defaultValue : null;
        }

        // Handle array-like access (e.g., obj[0])
        if (typeof prop === 'number') {
            if (obj.length !== undefined && prop >= 0 && prop < obj.length) {
                return obj[prop] !== undefined ? obj[prop] : (defaultValue !== undefined ? defaultValue : null);
            }
            return defaultValue !== undefined ? defaultValue : null;
        }

        // Handle string property access
        if (typeof prop === 'string') {
            // Try hasOwnProperty first (safer)
            if (obj.hasOwnProperty && obj.hasOwnProperty(prop)) {
                return obj[prop] !== undefined ? obj[prop] : (defaultValue !== undefined ? defaultValue : null);
            }
            // Fallback to direct access
            if (obj[prop] !== undefined) {
                return obj[prop];
            }
        }

        return defaultValue !== undefined ? defaultValue : null;
    } catch (e) {
        // Log error for debugging but don't break
        if (ANALYSIS_CONFIG.logErrors) {
            logError("safeGetProperty failed for prop '" + prop + "': " + e.message);
        }
        return defaultValue !== undefined ? defaultValue : null;
    }
}

// Safe nested property accessor for complex paths
function safeGetNestedProperty(obj, path, defaultValue) {
    try {
        if (!obj || !path) {
            return defaultValue !== undefined ? defaultValue : null;
        }

        // Split path by dots, but handle array notation [0]
        var pathArray = path.toString().split('.');
        var current = obj;

        for (var i = 0; i < pathArray.length; i++) {
            var segment = pathArray[i];

            // Handle array notation like "pages[0]"
            if (segment.indexOf('[') !== -1) {
                var parts = segment.match(/^([^[]+)\[(\d+)\]$/);
                if (parts) {
                    var propName = parts[1];
                    var index = parseInt(parts[2]);

                    current = safeGetProperty(current, propName);
                    if (!current) return defaultValue !== undefined ? defaultValue : null;

                    current = safeGetProperty(current, index);
                    if (current === null || current === undefined) {
                        return defaultValue !== undefined ? defaultValue : null;
                    }
                } else {
                    return defaultValue !== undefined ? defaultValue : null;
                }
            } else {
                current = safeGetProperty(current, segment);
                if (current === null || current === undefined) {
                    return defaultValue !== undefined ? defaultValue : null;
                }
            }
        }

        return current;
    } catch (e) {
        if (ANALYSIS_CONFIG.logErrors) {
            logError("safeGetNestedProperty failed for path '" + path + "': " + e.message);
        }
        return defaultValue !== undefined ? defaultValue : null;
    }
}

// Error logging function
function logError(message) {
    try {
        if (!ANALYSIS_CONFIG.errors) {
            ANALYSIS_CONFIG.errors = [];
        }
        ANALYSIS_CONFIG.errors.push({
            timestamp: new Date().toISOString(),
            message: message
        });
    } catch (e) {
        // Can't even log the error - just continue
    }
}

// Safe collection length getter
function safeGetLength(collection) {
    try {
        if (!collection) return 0;
        if (typeof collection.length !== 'undefined') return collection.length;
        if (typeof collection.count !== 'undefined') return collection.count;
        return 0;
    } catch (e) {
        return 0;
    }
}

// Safe collection iterator
function safeIterateCollection(collection, callback, maxItems) {
    if (!collection || !callback) return [];

    maxItems = maxItems || 1000; // Prevent infinite loops
    var results = [];

    try {
        var length = safeGetLength(collection);
        for (var i = 0; i < Math.min(length, maxItems); i++) {
            try {
                var item = collection[i];
                if (item) {
                    var result = callback(item, i);
                    if (result !== null && result !== undefined) {
                        results.push(result);
                    }
                }
            } catch (itemError) {
                // Log error but continue processing
                results.push({
                    error: "Failed to process item " + i + ": " + itemError.message,
                    index: i
                });
            }
        }
    } catch (e) {
        results.push({
            error: "Collection iteration failed: " + e.message
        });
    }

    return results;
}

// Main function to analyze the active document
function analyzeDocument() {
    if (!app.documents.length) {
        alert("Please open a document first.");
        return;
    }

    var doc = app.activeDocument;
    var startTime = new Date().getTime();

    try {
        var report = createDocumentReport(doc);

        // Save report to JSON file
        var reportFile = File(doc.filePath + "/" + doc.name.replace(/\.[^\.]+$/, "") + "_analysis.json");
        var jsonString = JSON.stringify(report, null, 2);

        reportFile.open("w");
        reportFile.write(jsonString);
        reportFile.close();

        var duration = (new Date().getTime() - startTime) / 1000;
        alert("Enhanced document analysis complete! (" + duration + "s)\nReport saved as: " + reportFile.name);
        return report;

    } catch (error) {
        alert("Analysis failed: " + error.message + "\nLine: " + error.line);
        return null;
    }
}

// Enhanced document report creation with comprehensive error handling and dynamic discovery
function createDocumentReport(doc) {
    var report = {
        timestamp: new Date().toISOString(),
        analysisConfig: ANALYSIS_CONFIG,
        documentInfo: safeAnalyzeSection("documentInfo", function () { return getDocumentInfo(doc); }),
        documentPreferences: safeAnalyzeSection("documentPreferences", function () { return getDocumentPreferences(doc); }),
        pages: safeAnalyzeSection("pages", function () { return getPagesInfo(doc); }),
        spreads: safeAnalyzeSection("spreads", function () { return getSpreadsInfo(doc); }),
        masterSpreads: safeAnalyzeSection("masterSpreads", function () { return getMasterSpreadsInfo(doc); }),
        layers: safeAnalyzeSection("layers", function () { return getLayersInfo(doc); }),
        stories: safeAnalyzeSection("stories", function () { return getStoriesInfo(doc); }),
        pageItems: safeAnalyzeSection("pageItems", function () { return getPageItemsInfo(doc); }),
        images: safeAnalyzeSection("images", function () { return getComprehensiveImagesInfo(doc); }),
        graphics: safeAnalyzeSection("graphics", function () { return getComprehensiveGraphicsInfo(doc); }),
        textFrames: safeAnalyzeSection("textFrames", function () { return getTextFramesInfo(doc); }),
        textContent: safeAnalyzeSection("textContent", function () { return getComprehensiveTextContent(doc); }),
        styles: safeAnalyzeSection("styles", function () { return getStylesInfo(doc); }),
        colors: safeAnalyzeSection("colors", function () { return getColorsInfo(doc); }),
        fonts: safeAnalyzeSection("fonts", function () { return getFontsInfo(doc); }),
        links: safeAnalyzeSection("links", function () { return getLinksInfo(doc); }),
        preferences: safeAnalyzeSection("preferences", function () { return getPreferencesInfo(doc); }),
        metadata: safeAnalyzeSection("metadata", function () { return getMetadataInfo(doc); }),
        objectHierarchy: safeAnalyzeSection("objectHierarchy", function () { return getObjectHierarchy(doc); }),
        dynamicDiscovery: safeAnalyzeSection("dynamicDiscovery", function () { return discoverDocumentStructure(doc); }),
        commonPaths: safeAnalyzeSection("commonPaths", function () { return generateCommonPathsReference(doc); }),
        brokenProperties: safeAnalyzeSection("brokenProperties", function () { return trackBrokenProperties(doc); }),
        errors: []
    };

    return report;
}

// Safe section analyzer with timeout protection
function safeAnalyzeSection(sectionName, analyzeFunction) {
    var startTime = new Date().getTime();

    try {
        var result = analyzeFunction();
        var duration = new Date().getTime() - startTime;

        if (duration > ANALYSIS_CONFIG.timeoutThreshold) {
            return {
                error: "Section analysis timed out after " + duration + "ms",
                partialData: result
            };
        }

        return result;

    } catch (error) {
        return {
            error: "Section analysis failed: " + error.message,
            sectionName: sectionName,
            line: error.line || "unknown"
        };
    }
}

// Enhanced document information with more properties
function getDocumentInfo(doc) {
    return {
        name: safeGetProperty(doc, 'name', 'Unknown'),
        fullName: safeGetProperty(doc, 'fullName') ? doc.fullName.toString() : null,
        filePath: safeGetProperty(doc, 'filePath') ? doc.filePath.toString() : null,
        saved: safeGetProperty(doc, 'saved', false),
        modified: safeGetProperty(doc, 'modified', false),
        id: safeGetProperty(doc, 'id', 'Unknown'),
        isValid: safeGetProperty(doc, 'isValid', false),
        label: safeGetProperty(doc, 'label', ''),
        readonly: safeGetProperty(doc, 'readonly', false),
        recovered: safeGetProperty(doc, 'recovered', false),
        visible: safeGetProperty(doc, 'visible', true),
        activeLayer: safeGetProperty(doc.activeLayer, 'name', 'Unknown'),
        activeWindow: safeGetProperty(doc.activeWindow, 'name', 'Unknown'),
        zeroPoint: safeGetProperty(doc, 'zeroPoint', [0, 0]),
        selection: safeGetLength(doc.selection)
    };
}

// Enhanced document preferences
function getDocumentPreferences(doc) {
    var prefs = {};

    try {
        var docPrefs = doc.documentPreferences;
        prefs = {
            pageWidth: safeGetProperty(docPrefs, 'pageWidth'),
            pageHeight: safeGetProperty(docPrefs, 'pageHeight'),
            pageOrientation: safeGetProperty(docPrefs, 'pageOrientation') ? docPrefs.pageOrientation.toString() : null,
            pagesPerDocument: safeGetProperty(docPrefs, 'pagesPerDocument'),
            facingPages: safeGetProperty(docPrefs, 'facingPages'),
            allowPageShuffle: safeGetProperty(docPrefs, 'allowPageShuffle'),
            startPageNumber: safeGetProperty(docPrefs, 'startPageNumber'),
            pageBinding: safeGetProperty(docPrefs, 'pageBinding') ? docPrefs.pageBinding.toString() : null,
            documentBleedTopOffset: safeGetProperty(docPrefs, 'documentBleedTopOffset'),
            documentBleedInsideOrLeftOffset: safeGetProperty(docPrefs, 'documentBleedInsideOrLeftOffset'),
            documentBleedOutsideOrRightOffset: safeGetProperty(docPrefs, 'documentBleedOutsideOrRightOffset'),
            documentBleedBottomOffset: safeGetProperty(docPrefs, 'documentBleedBottomOffset'),
            slugTopOffset: safeGetProperty(docPrefs, 'slugTopOffset'),
            slugInsideOrLeftOffset: safeGetProperty(docPrefs, 'slugInsideOrLeftOffset'),
            slugRightOrOutsideOffset: safeGetProperty(docPrefs, 'slugRightOrOutsideOffset'),
            slugBottomOffset: safeGetProperty(docPrefs, 'slugBottomOffset'),
            createPrimaryTextFrame: safeGetProperty(docPrefs, 'createPrimaryTextFrame'),
            primaryTextFrameOption: safeGetProperty(docPrefs, 'primaryTextFrameOption'),
            columnCount: safeGetProperty(docPrefs, 'columnCount'),
            columnGutter: safeGetProperty(docPrefs, 'columnGutter')
        };
    } catch (e) {
        prefs.error = "Failed to read document preferences: " + e.message;
    }

    return prefs;
}

// Enhanced pages information with better error handling
function getPagesInfo(doc) {
    return safeIterateCollection(doc.pages, function (page, index) {
        var pageInfo = {
            index: index,
            id: safeGetProperty(page, 'id'),
            name: safeGetProperty(page, 'name'),
            documentOffset: safeGetProperty(page, 'documentOffset'),
            appliedMaster: safeGetProperty(page.appliedMaster, 'name'),
            bounds: safeGetProperty(page, 'bounds'),
            side: safeGetProperty(page, 'side') ? page.side.toString() : null,
            pageItems: safeGetLength(page.pageItems),
            allPageItems: safeGetLength(page.allPageItems),
            textFrames: safeGetLength(page.textFrames),
            rectangles: safeGetLength(page.rectangles),
            ovals: safeGetLength(page.ovals),
            polygons: safeGetLength(page.polygons),
            groups: safeGetLength(page.groups),
            graphics: safeGetLength(page.graphics),
            images: safeGetLength(page.images),
            epss: safeGetLength(page.epss),
            pdfs: safeGetLength(page.pdfs),
            wmfs: safeGetLength(page.wmfs),
            picts: safeGetLength(page.picts),
            guides: safeGetLength(page.guides)
        };

        // Add margin preferences safely
        try {
            if (page.marginPreferences) {
                pageInfo.marginPreferences = {
                    top: safeGetProperty(page.marginPreferences, 'top'),
                    left: safeGetProperty(page.marginPreferences, 'left'),
                    right: safeGetProperty(page.marginPreferences, 'right'),
                    bottom: safeGetProperty(page.marginPreferences, 'bottom'),
                    columnCount: safeGetProperty(page.marginPreferences, 'columnCount'),
                    columnGutter: safeGetProperty(page.marginPreferences, 'columnGutter')
                };
            }
        } catch (e) {
            pageInfo.marginPreferences = { error: e.message };
        }

        return pageInfo;
    });
}

// Comprehensive images information - multiple detection methods
function getComprehensiveImagesInfo(doc) {
    var imageData = {
        directImages: [],
        embeddedImages: [],
        graphicImages: [],
        pageItemImages: [],
        allFoundImages: [],
        summary: {
            totalFound: 0,
            byType: {},
            byStatus: {},
            byLayer: {}
        }
    };

    // Method 1: Direct document.images collection
    try {
        imageData.directImages = safeIterateCollection(doc.images, function (image, index) {
            return getImageDetails(image, index, "direct");
        });
    } catch (e) {
        imageData.directImages = { error: "Failed to get direct images: " + e.message };
    }

    // Method 2: Through graphics collection
    try {
        imageData.graphicImages = safeIterateCollection(doc.graphics, function (graphic, index) {
            var graphicInfo = {
                index: index,
                id: safeGetProperty(graphic, 'id'),
                source: "graphics",
                images: []
            };

            // Check if graphic contains images
            try {
                if (graphic.images && graphic.images.length > 0) {
                    graphicInfo.images = safeIterateCollection(graphic.images, function (image, imgIndex) {
                        return getImageDetails(image, imgIndex, "graphic");
                    });
                }
            } catch (e) {
                graphicInfo.error = "Failed to get images from graphic: " + e.message;
            }

            return graphicInfo;
        });
    } catch (e) {
        imageData.graphicImages = { error: "Failed to get graphic images: " + e.message };
    }

    // Method 3: Scan all page items for images
    try {
        imageData.pageItemImages = scanPageItemsForImages(doc);
    } catch (e) {
        imageData.pageItemImages = { error: "Failed to scan page items: " + e.message };
    }

    // Method 4: Deep scan through object hierarchy
    if (ANALYSIS_CONFIG.enableDeepScan) {
        try {
            imageData.deepScanImages = deepScanForImages(doc);
        } catch (e) {
            imageData.deepScanImages = { error: "Deep scan failed: " + e.message };
        }
    }

    // Compile all found images and create summary
    imageData.allFoundImages = compileAllImages(imageData);
    imageData.summary = createImageSummary(imageData.allFoundImages);

    return imageData;
}

// Detailed image information extractor
function getImageDetails(image, index, source) {
    if (!image) return null;

    var details = {
        index: index,
        source: source,
        id: safeGetProperty(image, 'id'),
        itemLink: null,
        imageTypeName: safeGetProperty(image, 'imageTypeName'),
        actualPpi: safeGetProperty(image, 'actualPpi'),
        effectivePpi: safeGetProperty(image, 'effectivePpi'),
        horizontalScale: safeGetProperty(image, 'horizontalScale'),
        verticalScale: safeGetProperty(image, 'verticalScale'),
        bounds: safeGetProperty(image, 'bounds'),
        geometricBounds: safeGetProperty(image, 'geometricBounds'),
        visibleBounds: safeGetProperty(image, 'visibleBounds'),
        space: safeGetProperty(image, 'space') ? image.space.toString() : null,
        profile: safeGetProperty(image, 'profile'),
        colorSpace: safeGetProperty(image, 'colorSpace') ? image.colorSpace.toString() : null,
        transparencySettings: {},
        clippingPath: null,
        parent: null
    };

    // Get link information safely
    try {
        if (image.itemLink) {
            details.itemLink = {
                name: safeGetProperty(image.itemLink, 'name'),
                filePath: safeGetProperty(image.itemLink, 'filePath'),
                status: safeGetProperty(image.itemLink, 'status') ? image.itemLink.status.toString() : null,
                size: safeGetProperty(image.itemLink, 'size'),
                date: safeGetProperty(image.itemLink, 'date') ? image.itemLink.date.toISOString() : null,
                linkType: safeGetProperty(image.itemLink, 'linkType') ? image.itemLink.linkType.toString() : null
            };
        }
    } catch (e) {
        details.itemLink = { error: "Failed to get link info: " + e.message };
    }

    // Get parent information
    try {
        if (image.parent) {
            details.parent = {
                type: image.parent.constructor.name,
                id: safeGetProperty(image.parent, 'id'),
                name: safeGetProperty(image.parent, 'name'),
                layer: safeGetProperty(image.parent.itemLayer, 'name')
            };
        }
    } catch (e) {
        details.parent = { error: "Failed to get parent info: " + e.message };
    }

    // Get transparency settings
    try {
        if (image.transparencySettings) {
            details.transparencySettings = {
                blendMode: safeGetProperty(image.transparencySettings, 'blendMode') ? image.transparencySettings.blendMode.toString() : null,
                opacity: safeGetProperty(image.transparencySettings, 'opacity')
            };
        }
    } catch (e) {
        details.transparencySettings = { error: "Failed to get transparency settings: " + e.message };
    }

    // Get clipping path information
    try {
        if (image.clippingPath) {
            details.clippingPath = {
                clippingType: safeGetProperty(image.clippingPath, 'clippingType') ? image.clippingPath.clippingType.toString() : null,
                invertPath: safeGetProperty(image.clippingPath, 'invertPath'),
                includeInsideEdges: safeGetProperty(image.clippingPath, 'includeInsideEdges'),
                restrictToFrame: safeGetProperty(image.clippingPath, 'restrictToFrame'),
                useHighResolutionImage: safeGetProperty(image.clippingPath, 'useHighResolutionImage')
            };
        }
    } catch (e) {
        details.clippingPath = { error: "Failed to get clipping path: " + e.message };
    }

    return details;
}

// Scan page items recursively for images
function scanPageItemsForImages(doc, maxDepth) {
    maxDepth = maxDepth || ANALYSIS_CONFIG.maxRecursionDepth;
    var foundImages = [];

    function scanItem(item, depth) {
        if (depth >= maxDepth || !item) return;

        try {
            // Check if item itself is an image
            if (item.constructor.name === 'Image') {
                foundImages.push(getImageDetails(item, foundImages.length, "pageItem"));
            }

            // Check if item contains images
            if (item.images && safeGetLength(item.images) > 0) {
                safeIterateCollection(item.images, function (image, index) {
                    foundImages.push(getImageDetails(image, foundImages.length, "pageItemChild"));
                    return true;
                });
            }

            // Check if item is a graphic with images
            if (item.constructor.name === 'Graphic' && item.images) {
                safeIterateCollection(item.images, function (image, index) {
                    foundImages.push(getImageDetails(image, foundImages.length, "graphicChild"));
                    return true;
                });
            }

            // Recursively scan child items
            if (item.pageItems && safeGetLength(item.pageItems) > 0) {
                safeIterateCollection(item.pageItems, function (childItem, index) {
                    scanItem(childItem, depth + 1);
                    return true;
                });
            }

            // Scan groups
            if (item.constructor.name === 'Group' && item.pageItems) {
                safeIterateCollection(item.pageItems, function (groupItem, index) {
                    scanItem(groupItem, depth + 1);
                    return true;
                });
            }

        } catch (e) {
            foundImages.push({
                error: "Failed to scan item: " + e.message,
                itemType: item.constructor ? item.constructor.name : "unknown",
                depth: depth
            });
        }
    }

    // Scan all page items in document
    try {
        safeIterateCollection(doc.pageItems, function (item, index) {
            scanItem(item, 0);
            return true;
        });
    } catch (e) {
        foundImages.push({ error: "Failed to scan document page items: " + e.message });
    }

    // Also scan master spread items
    try {
        safeIterateCollection(doc.masterSpreads, function (masterSpread, index) {
            safeIterateCollection(masterSpread.pageItems, function (item, itemIndex) {
                scanItem(item, 0);
                return true;
            });
            return true;
        });
    } catch (e) {
        foundImages.push({ error: "Failed to scan master spread items: " + e.message });
    }

    return foundImages;
}

// Deep scan for images using multiple approaches
function deepScanForImages(doc) {
    var deepScanResults = {
        byLayer: [],
        bySpread: [],
        byStory: [],
        orphanedImages: []
    };

    // Scan by layer
    try {
        safeIterateCollection(doc.layers, function (layer, index) {
            var layerImages = {
                layerName: safeGetProperty(layer, 'name'),
                layerIndex: index,
                images: []
            };

            try {
                if (layer.pageItems) {
                    safeIterateCollection(layer.pageItems, function (item, itemIndex) {
                        var itemImages = extractImagesFromItem(item);
                        layerImages.images = layerImages.images.concat(itemImages);
                        return true;
                    });
                }
            } catch (e) {
                layerImages.error = "Failed to scan layer items: " + e.message;
            }

            if (layerImages.images.length > 0 || layerImages.error) {
                deepScanResults.byLayer.push(layerImages);
            }
            return true;
        });
    } catch (e) {
        deepScanResults.byLayer = [{ error: "Failed to scan layers: " + e.message }];
    }

    // Scan by spread
    try {
        safeIterateCollection(doc.spreads, function (spread, index) {
            var spreadImages = {
                spreadName: safeGetProperty(spread, 'name'),
                spreadIndex: index,
                images: []
            };

            try {
                if (spread.pageItems) {
                    safeIterateCollection(spread.pageItems, function (item, itemIndex) {
                        var itemImages = extractImagesFromItem(item);
                        spreadImages.images = spreadImages.images.concat(itemImages);
                        return true;
                    });
                }
            } catch (e) {
                spreadImages.error = "Failed to scan spread items: " + e.message;
            }

            if (spreadImages.images.length > 0 || spreadImages.error) {
                deepScanResults.bySpread.push(spreadImages);
            }
            return true;
        });
    } catch (e) {
        deepScanResults.bySpread = [{ error: "Failed to scan spreads: " + e.message }];
    }

    return deepScanResults;
}

// Extract images from a single item
function extractImagesFromItem(item) {
    var images = [];

    if (!item) return images;

    try {
        // Direct image check
        if (item.constructor.name === 'Image') {
            images.push(getImageDetails(item, images.length, "extracted"));
        }

        // Check for images property
        if (item.images && safeGetLength(item.images) > 0) {
            safeIterateCollection(item.images, function (image, index) {
                images.push(getImageDetails(image, images.length, "itemProperty"));
                return true;
            });
        }

        // Check if it's a graphic with an image
        if (item.constructor.name === 'Graphic') {
            try {
                if (item.images && safeGetLength(item.images) > 0) {
                    safeIterateCollection(item.images, function (image, index) {
                        images.push(getImageDetails(image, images.length, "graphicContent"));
                        return true;
                    });
                }
            } catch (e) {
                images.push({ error: "Failed to extract from graphic: " + e.message });
            }
        }

        // Check for nested page items
        if (item.pageItems && safeGetLength(item.pageItems) > 0) {
            safeIterateCollection(item.pageItems, function (childItem, index) {
                var childImages = extractImagesFromItem(childItem);
                images = images.concat(childImages);
                return true;
            });
        }

    } catch (e) {
        images.push({
            error: "Failed to extract images from item: " + e.message,
            itemType: item.constructor ? item.constructor.name : "unknown"
        });
    }

    return images;
}

// Compile all found images and remove duplicates
function compileAllImages(imageData) {
    var allImages = [];
    var imageIds = {};

    // Helper function to add unique images
    function addUniqueImages(imageArray, source) {
        if (!imageArray || !imageArray.length) return;

        for (var i = 0; i < imageArray.length; i++) {
            var image = imageArray[i];
            if (image && image.id) {
                var key = image.id + "_" + image.source;
                if (!imageIds[key]) {
                    imageIds[key] = true;
                    image.compilationSource = source;
                    allImages.push(image);
                }
            }
        }
    }

    // Add images from all sources
    try {
        addUniqueImages(imageData.directImages, "direct");

        if (imageData.graphicImages && imageData.graphicImages.length) {
            for (var i = 0; i < imageData.graphicImages.length; i++) {
                if (imageData.graphicImages[i].images) {
                    addUniqueImages(imageData.graphicImages[i].images, "graphics");
                }
            }
        }

        addUniqueImages(imageData.pageItemImages, "pageItems");

        if (imageData.deepScanImages) {
            if (imageData.deepScanImages.byLayer) {
                for (var i = 0; i < imageData.deepScanImages.byLayer.length; i++) {
                    addUniqueImages(imageData.deepScanImages.byLayer[i].images, "layerScan");
                }
            }

            if (imageData.deepScanImages.bySpread) {
                for (var i = 0; i < imageData.deepScanImages.bySpread.length; i++) {
                    addUniqueImages(imageData.deepScanImages.bySpread[i].images, "spreadScan");
                }
            }
        }
    } catch (e) {
        allImages.push({ error: "Failed to compile images: " + e.message });
    }

    return allImages;
}

// Create summary of found images
function createImageSummary(allImages) {
    var summary = {
        totalFound: allImages.length,
        byType: {},
        byStatus: {},
        byLayer: {},
        byLinkStatus: {},
        errors: 0
    };

    for (var i = 0; i < allImages.length; i++) {
        var image = allImages[i];

        if (image.error) {
            summary.errors++;
            continue;
        }

        // Count by type
        if (image.imageTypeName) {
            summary.byType[image.imageTypeName] = (summary.byType[image.imageTypeName] || 0) + 1;
        }

        // Count by layer
        if (image.parent && image.parent.layer) {
            summary.byLayer[image.parent.layer] = (summary.byLayer[image.parent.layer] || 0) + 1;
        }

        // Count by link status
        if (image.itemLink && image.itemLink.status) {
            summary.byLinkStatus[image.itemLink.status] = (summary.byLinkStatus[image.itemLink.status] || 0) + 1;
        }
    }

    return summary;
}

// Enhanced graphics information
function getComprehensiveGraphicsInfo(doc) {
    var graphicsData = {
        directGraphics: [],
        nestedGraphics: [],
        summary: {
            total: 0,
            byParentType: {},
            withImages: 0,
            withoutImages: 0
        }
    };

    // Get direct graphics
    try {
        graphicsData.directGraphics = safeIterateCollection(doc.graphics, function (graphic, index) {
            return getGraphicDetails(graphic, index, "direct");
        });
    } catch (e) {
        graphicsData.directGraphics = [{ error: "Failed to get direct graphics: " + e.message }];
    }

    // Scan for nested graphics
    try {
        graphicsData.nestedGraphics = scanForNestedGraphics(doc);
    } catch (e) {
        graphicsData.nestedGraphics = [{ error: "Failed to scan nested graphics: " + e.message }];
    }

    // Create summary
    graphicsData.summary = createGraphicsSummary(graphicsData);

    return graphicsData;
}

// Get detailed graphic information
function getGraphicDetails(graphic, index, source) {
    if (!graphic) return null;

    var details = {
        index: index,
        source: source,
        id: safeGetProperty(graphic, 'id'),
        bounds: safeGetProperty(graphic, 'bounds'),
        geometricBounds: safeGetProperty(graphic, 'geometricBounds'),
        visibleBounds: safeGetProperty(graphic, 'visibleBounds'),
        hasImages: false,
        imageCount: 0,
        images: [],
        parent: null,
        transformations: {}
    };

    // Check for images in graphic
    try {
        if (graphic.images) {
            details.imageCount = safeGetLength(graphic.images);
            details.hasImages = details.imageCount > 0;

            if (details.hasImages) {
                details.images = safeIterateCollection(graphic.images, function (image, imgIndex) {
                    return getImageDetails(image, imgIndex, "graphicChild");
                });
            }
        }
    } catch (e) {
        details.imagesError = "Failed to get images: " + e.message;
    }

    // Get parent information
    try {
        if (graphic.parent) {
            details.parent = {
                type: graphic.parent.constructor.name,
                id: safeGetProperty(graphic.parent, 'id'),
                name: safeGetProperty(graphic.parent, 'name')
            };
        }
    } catch (e) {
        details.parentError = "Failed to get parent: " + e.message;
    }

    // Get transformation information
    try {
        details.transformations = {
            horizontalScale: safeGetProperty(graphic, 'horizontalScale'),
            verticalScale: safeGetProperty(graphic, 'verticalScale'),
            rotation: safeGetProperty(graphic, 'rotationAngle'),
            skew: safeGetProperty(graphic, 'shearAngle')
        };
    } catch (e) {
        details.transformations = { error: "Failed to get transformations: " + e.message };
    }

    return details;
}

// Scan for nested graphics in complex objects
function scanForNestedGraphics(doc) {
    var nestedGraphics = [];

    // Scan page items for nested graphics
    try {
        safeIterateCollection(doc.pageItems, function (item, index) {
            var itemGraphics = extractGraphicsFromItem(item);
            nestedGraphics = nestedGraphics.concat(itemGraphics);
            return true;
        });
    } catch (e) {
        nestedGraphics.push({ error: "Failed to scan page items for graphics: " + e.message });
    }

    return nestedGraphics;
}

// Extract graphics from an item
function extractGraphicsFromItem(item) {
    var graphics = [];

    if (!item) return graphics;

    try {
        // Check if item itself is a graphic
        if (item.constructor.name === 'Graphic') {
            graphics.push(getGraphicDetails(item, graphics.length, "nested"));
        }

        // Check for graphics property
        if (item.graphics && safeGetLength(item.graphics) > 0) {
            safeIterateCollection(item.graphics, function (graphic, index) {
                graphics.push(getGraphicDetails(graphic, graphics.length, "itemProperty"));
                return true;
            });
        }

        // Recursively check child items
        if (item.pageItems && safeGetLength(item.pageItems) > 0) {
            safeIterateCollection(item.pageItems, function (childItem, index) {
                var childGraphics = extractGraphicsFromItem(childItem);
                graphics = graphics.concat(childGraphics);
                return true;
            });
        }

    } catch (e) {
        graphics.push({
            error: "Failed to extract graphics from item: " + e.message,
            itemType: item.constructor ? item.constructor.name : "unknown"
        });
    }

    return graphics;
}

// Create graphics summary
function createGraphicsSummary(graphicsData) {
    var summary = {
        total: 0,
        byParentType: {},
        withImages: 0,
        withoutImages: 0,
        errors: 0
    };

    function processSummary(graphicsArray) {
        for (var i = 0; i < graphicsArray.length; i++) {
            var graphic = graphicsArray[i];

            if (graphic.error) {
                summary.errors++;
                continue;
            }

            summary.total++;

            if (graphic.hasImages) {
                summary.withImages++;
            } else {
                summary.withoutImages++;
            }

            if (graphic.parent && graphic.parent.type) {
                summary.byParentType[graphic.parent.type] = (summary.byParentType[graphic.parent.type] || 0) + 1;
            }
        }
    }

    try {
        if (graphicsData.directGraphics && graphicsData.directGraphics.length) {
            processSummary(graphicsData.directGraphics);
        }

        if (graphicsData.nestedGraphics && graphicsData.nestedGraphics.length) {
            processSummary(graphicsData.nestedGraphics);
        }
    } catch (e) {
        summary.errors++;
    }

    return summary;
}

// Enhanced text frames information
function getTextFramesInfo(doc) {
    return safeIterateCollection(doc.textFrames, function (textFrame, index) {
        var frameInfo = {
            index: index,
            id: safeGetProperty(textFrame, 'id'),
            bounds: safeGetProperty(textFrame, 'bounds'),
            geometricBounds: safeGetProperty(textFrame, 'geometricBounds'),
            visibleBounds: safeGetProperty(textFrame, 'visibleBounds'),
            overflows: safeGetProperty(textFrame, 'overflows'),
            parentStory: safeGetProperty(textFrame.parentStory, 'id'),
            contents: null,
            characterCount: 0,
            wordCount: 0,
            paragraphCount: 0
        };

        // Get text content information safely
        try {
            if (textFrame.contents) {
                frameInfo.contents = textFrame.contents.substring(0, 100); // First 100 chars
                frameInfo.characterCount = textFrame.contents.length;
            }

            if (textFrame.characters) {
                frameInfo.characterCount = safeGetLength(textFrame.characters);
            }

            if (textFrame.words) {
                frameInfo.wordCount = safeGetLength(textFrame.words);
            }

            if (textFrame.paragraphs) {
                frameInfo.paragraphCount = safeGetLength(textFrame.paragraphs);
            }
        } catch (e) {
            frameInfo.contentError = "Failed to get text content: " + e.message;
        }

        // Get parent layer information
        try {
            if (textFrame.itemLayer) {
                frameInfo.layer = safeGetProperty(textFrame.itemLayer, 'name');
            }
        } catch (e) {
            frameInfo.layerError = "Failed to get layer: " + e.message;
        }

        return frameInfo;
    });
}

// Object hierarchy analysis
function getObjectHierarchy(doc) {
    var hierarchy = {
        documentLevel: {
            pages: safeGetLength(doc.pages),
            spreads: safeGetLength(doc.spreads),
            masterSpreads: safeGetLength(doc.masterSpreads),
            layers: safeGetLength(doc.layers),
            stories: safeGetLength(doc.stories)
        },
        pageItemsByType: {},
        nestingLevels: [],
        maxNestingDepth: 0
    };

    // Count page items by type
    try {
        var itemTypes = ['pageItems', 'textFrames', 'rectangles', 'ovals', 'polygons', 'groups',
            'graphics', 'images', 'epss', 'pdfs', 'wmfs', 'picts', 'buttons'];

        for (var i = 0; i < itemTypes.length; i++) {
            var itemType = itemTypes[i];
            try {
                if (doc[itemType]) {
                    hierarchy.pageItemsByType[itemType] = safeGetLength(doc[itemType]);
                }
            } catch (e) {
                hierarchy.pageItemsByType[itemType] = { error: e.message };
            }
        }
    } catch (e) {
        hierarchy.pageItemsByTypeError = "Failed to count page items: " + e.message;
    }

    // Analyze nesting levels
    try {
        hierarchy.nestingAnalysis = analyzeNestingLevels(doc);
    } catch (e) {
        hierarchy.nestingAnalysis = { error: "Failed to analyze nesting: " + e.message };
    }

    return hierarchy;
}

// Analyze nesting levels of objects
function analyzeNestingLevels(doc) {
    var nestingData = {
        maxDepth: 0,
        depthCounts: {},
        complexObjects: []
    };

    function analyzeItem(item, currentDepth) {
        if (!item || currentDepth > 20) return; // Prevent infinite recursion

        nestingData.maxDepth = Math.max(nestingData.maxDepth, currentDepth);
        nestingData.depthCounts[currentDepth] = (nestingData.depthCounts[currentDepth] || 0) + 1;

        // Track complex objects (groups with many children)
        if (item.constructor.name === 'Group' && item.pageItems) {
            var childCount = safeGetLength(item.pageItems);
            if (childCount > 5) {
                nestingData.complexObjects.push({
                    type: 'Group',
                    id: safeGetProperty(item, 'id'),
                    childCount: childCount,
                    depth: currentDepth
                });
            }
        }

        // Recurse into children
        try {
            if (item.pageItems && safeGetLength(item.pageItems) > 0) {
                safeIterateCollection(item.pageItems, function (childItem, index) {
                    analyzeItem(childItem, currentDepth + 1);
                    return true;
                });
            }
        } catch (e) {
            // Skip problematic items
        }
    }

    // Analyze all top-level page items
    try {
        safeIterateCollection(doc.pageItems, function (item, index) {
            analyzeItem(item, 0);
            return true;
        });
    } catch (e) {
        nestingData.error = "Failed to analyze nesting: " + e.message;
    }

    // Comprehensive text content analysis with paths to all text elements
    function getComprehensiveTextContent(doc) {
        var textAnalysis = {
            summary: {
                totalTextFrames: 0,
                totalStories: 0,
                totalCharacters: 0,
                totalWords: 0,
                totalParagraphs: 0,
                overflowingFrames: 0,
                emptyFrames: 0
            },
            textFrameDetails: [],
            storyDetails: [],
            textPaths: [],
            textSamples: [],
            tableText: [],
            footnoteText: [],
            textInGroups: []
        };

        // Analyze all text frames with comprehensive text extraction
        try {
            textAnalysis.textFrameDetails = safeIterateCollection(doc.textFrames, function (textFrame, index) {
                var frameAnalysis = {
                    index: index,
                    id: safeGetProperty(textFrame, 'id'),
                    path: "doc.textFrames[" + index + "]",
                    bounds: safeGetProperty(textFrame, 'bounds'),
                    overflows: safeGetProperty(textFrame, 'overflows', false),
                    parentStoryId: safeGetProperty(textFrame.parentStory, 'id'),
                    layer: safeGetProperty(textFrame.itemLayer, 'name'),
                    page: null,
                    textContent: {
                        fullText: null,
                        preview: null,
                        characterCount: 0,
                        wordCount: 0,
                        paragraphCount: 0,
                        isEmpty: true
                    },
                    paragraphs: [],
                    appliedStyles: {
                        paragraphStyles: [],
                        characterStyles: []
                    }
                };

                // Get page information if available
                try {
                    if (textFrame.parent && textFrame.parent.constructor.name === 'Page') {
                        frameAnalysis.page = {
                            name: safeGetProperty(textFrame.parent, 'name'),
                            index: safeGetProperty(textFrame.parent, 'documentOffset')
                        };
                    }
                } catch (e) {
                    frameAnalysis.pageError = e.message;
                }

                // Extract text content comprehensively
                try {
                    if (textFrame.contents) {
                        var fullText = textFrame.contents;
                        frameAnalysis.textContent.fullText = fullText;
                        frameAnalysis.textContent.preview = fullText.length > 200 ?
                            fullText.substring(0, 200) + "..." : fullText;
                        frameAnalysis.textContent.characterCount = fullText.length;
                        frameAnalysis.textContent.isEmpty = fullText.length === 0;

                        // Count words (simple approach)
                        var words = fullText.split(/\s+/).filter(function (word) { return word.length > 0; });
                        frameAnalysis.textContent.wordCount = words.length;
                    }

                    // Get paragraph information
                    if (textFrame.paragraphs) {
                        frameAnalysis.textContent.paragraphCount = safeGetLength(textFrame.paragraphs);

                        // Analyze first few paragraphs for styles and content
                        frameAnalysis.paragraphs = safeIterateCollection(textFrame.paragraphs, function (paragraph, pIndex) {
                            if (pIndex < 5) { // Limit to first 5 paragraphs for performance
                                return {
                                    index: pIndex,
                                    path: "doc.textFrames[" + index + "].paragraphs[" + pIndex + "]",
                                    contents: safeGetProperty(paragraph, 'contents', '').substring(0, 100),
                                    appliedParagraphStyle: safeGetProperty(paragraph.appliedParagraphStyle, 'name'),
                                    characterCount: safeGetLength(paragraph.characters),
                                    wordCount: safeGetLength(paragraph.words)
                                };
                            }
                            return null;
                        }, 5);
                    }

                    // Track applied styles
                    frameAnalysis.appliedStyles = getTextFrameStyles(textFrame);

                } catch (e) {
                    frameAnalysis.textContentError = "Failed to extract text content: " + e.message;
                }

                // Update summary
                textAnalysis.summary.totalTextFrames++;
                if (frameAnalysis.textContent.characterCount > 0) {
                    textAnalysis.summary.totalCharacters += frameAnalysis.textContent.characterCount;
                    textAnalysis.summary.totalWords += frameAnalysis.textContent.wordCount;
                    textAnalysis.summary.totalParagraphs += frameAnalysis.textContent.paragraphCount;
                }
                if (frameAnalysis.overflows) textAnalysis.summary.overflowingFrames++;
                if (frameAnalysis.textContent.isEmpty) textAnalysis.summary.emptyFrames++;

                return frameAnalysis;
            });
        } catch (e) {
            textAnalysis.textFrameDetailsError = "Failed to analyze text frames: " + e.message;
        }

        // Analyze stories for comprehensive text tracking
        try {
            textAnalysis.storyDetails = safeIterateCollection(doc.stories, function (story, index) {
                var storyAnalysis = {
                    index: index,
                    id: safeGetProperty(story, 'id'),
                    path: "doc.stories[" + index + "]",
                    length: safeGetProperty(story, 'length', 0),
                    textFrameCount: safeGetLength(story.textFrames),
                    overflows: safeGetProperty(story, 'overflows', false),
                    textContent: {
                        preview: null,
                        firstParagraph: null,
                        lastParagraph: null
                    }
                };

                // Get story content preview
                try {
                    if (story.contents) {
                        storyAnalysis.textContent.preview = story.contents.substring(0, 300);

                        // Get first and last paragraph content
                        if (story.paragraphs && story.paragraphs.length > 0) {
                            storyAnalysis.textContent.firstParagraph = {
                                content: safeGetProperty(story.paragraphs[0], 'contents', '').substring(0, 100),
                                path: "doc.stories[" + index + "].paragraphs[0]"
                            };

                            if (story.paragraphs.length > 1) {
                                var lastIndex = story.paragraphs.length - 1;
                                storyAnalysis.textContent.lastParagraph = {
                                    content: safeGetProperty(story.paragraphs[lastIndex], 'contents', '').substring(0, 100),
                                    path: "doc.stories[" + index + "].paragraphs[" + lastIndex + "]"
                                };
                            }
                        }
                    }
                } catch (e) {
                    storyAnalysis.textContentError = "Failed to extract story content: " + e.message;
                }

                textAnalysis.summary.totalStories++;
                return storyAnalysis;
            });
        } catch (e) {
            textAnalysis.storyDetailsError = "Failed to analyze stories: " + e.message;
        }

        // Generate common text access paths
        textAnalysis.textPaths = generateTextAccessPaths(doc);

        // Extract text samples for reference
        textAnalysis.textSamples = extractTextSamples(doc);

        // Analyze table text
        textAnalysis.tableText = analyzeTableText(doc);

        // Find text in groups and nested objects
        textAnalysis.textInGroups = findTextInGroups(doc);

        return textAnalysis;
    }

    // Get styles applied to a text frame
    function getTextFrameStyles(textFrame) {
        var styles = {
            paragraphStyles: [],
            characterStyles: []
        };

        try {
            // Get paragraph styles used in this frame
            if (textFrame.paragraphs) {
                var paragraphStyleNames = {};
                safeIterateCollection(textFrame.paragraphs, function (paragraph, index) {
                    var styleName = safeGetProperty(paragraph.appliedParagraphStyle, 'name');
                    if (styleName && !paragraphStyleNames[styleName]) {
                        paragraphStyleNames[styleName] = true;
                        styles.paragraphStyles.push({
                            name: styleName,
                            path: "doc.textFrames[n].paragraphs[" + index + "].appliedParagraphStyle"
                        });
                    }
                    return true;
                }, 10); // Limit for performance
            }

            // Get character styles (more complex, sample first few characters)
            if (textFrame.characters) {
                var characterStyleNames = {};
                safeIterateCollection(textFrame.characters, function (character, index) {
                    if (index < 50) { // Limit for performance
                        var styleName = safeGetProperty(character.appliedCharacterStyle, 'name');
                        if (styleName && styleName !== '[No character style]' && !characterStyleNames[styleName]) {
                            characterStyleNames[styleName] = true;
                            styles.characterStyles.push({
                                name: styleName,
                                path: "doc.textFrames[n].characters[" + index + "].appliedCharacterStyle"
                            });
                        }
                    }
                    return true;
                }, 50);
            }
        } catch (e) {
            styles.error = "Failed to get styles: " + e.message;
        }

        return styles;
    }

    // Generate comprehensive text access paths reference
    function generateTextAccessPaths(doc) {
        var paths = {
            textFrames: [
                {
                    description: "All text frames in document",
                    path: "doc.textFrames",
                    example: "doc.textFrames[0].contents"
                },
                {
                    description: "Text frames on specific page",
                    path: "doc.pages[n].textFrames",
                    example: "doc.pages[0].textFrames[0].contents"
                },
                {
                    description: "Text frame overflow status",
                    path: "doc.textFrames[n].overflows",
                    example: "if (doc.textFrames[0].overflows) { /* handle overflow */ }"
                }
            ],
            stories: [
                {
                    description: "All stories in document",
                    path: "doc.stories",
                    example: "doc.stories[0].contents"
                },
                {
                    description: "Story text frames",
                    path: "doc.stories[n].textFrames",
                    example: "doc.stories[0].textFrames[0]"
                }
            ],
            paragraphs: [
                {
                    description: "Paragraphs in text frame",
                    path: "doc.textFrames[n].paragraphs",
                    example: "doc.textFrames[0].paragraphs[0].contents"
                },
                {
                    description: "Paragraph style applied",
                    path: "doc.textFrames[n].paragraphs[n].appliedParagraphStyle",
                    example: "doc.textFrames[0].paragraphs[0].appliedParagraphStyle.name"
                }
            ],
            characters: [
                {
                    description: "Individual characters",
                    path: "doc.textFrames[n].characters",
                    example: "doc.textFrames[0].characters[0].contents"
                },
                {
                    description: "Character formatting",
                    path: "doc.textFrames[n].characters[n].appliedCharacterStyle",
                    example: "doc.textFrames[0].characters[0].appliedCharacterStyle.name"
                }
            ],
            words: [
                {
                    description: "Individual words",
                    path: "doc.textFrames[n].words",
                    example: "doc.textFrames[0].words[0].contents"
                }
            ]
        };

        // Generate comprehensive reference of common paths even if they didn't change
        function generateCommonPathsReference(doc) {
            var reference = {
                essentialPaths: [],
                commonAccessPatterns: [],
                styleAccess: [],
                contentAccess: [],
                layoutAccess: [],
                troubleshootingPaths: []
            };

            // Essential paths every developer should know
            reference.essentialPaths = [
                {
                    category: "Document Info",
                    paths: [
                        { path: "doc.name", description: "Document name", safe: true },
                        { path: "doc.saved", description: "Document saved status", safe: true },
                        { path: "doc.filePath", description: "Document file path", safe: true, notes: "May be null for new documents" },
                        { path: "doc.selection", description: "Currently selected objects", safe: false, notes: "Check length first" }
                    ]
                },
                {
                    category: "Page Structure",
                    paths: [
                        { path: "doc.pages.length", description: "Number of pages", safe: true },
                        { path: "doc.pages[n]", description: "Access specific page", safe: false, notes: "Check length first" },
                        { path: "doc.spreads.length", description: "Number of spreads", safe: true },
                        { path: "doc.masterSpreads[n].name", description: "Master spread name", safe: false, notes: "May not exist" }
                    ]
                },
                {
                    category: "Content",
                    paths: [
                        { path: "doc.stories.length", description: "Number of text stories", safe: true },
                        { path: "doc.textFrames.length", description: "Number of text frames", safe: true },
                        { path: "doc.images.length", description: "Number of images (direct only)", safe: true, notes: "Use comprehensive analysis for all images" },
                        { path: "doc.pageItems.length", description: "Total page items", safe: true }
                    ]
                },
                {
                    category: "Styles",
                    paths: [
                        { path: "doc.paragraphStyles[n].name", description: "Paragraph style name", safe: false },
                        { path: "doc.characterStyles[n].name", description: "Character style name", safe: false },
                        { path: "doc.objectStyles[n].name", description: "Object style name", safe: false }
                    ]
                }
            ];

            // Common access patterns with safety notes
            reference.commonAccessPatterns = [
                {
                    pattern: "Iterate through pages safely",
                    code: [
                        "for (var i = 0; i < doc.pages.length; i++) {",
                        "    try {",
                        "        var page = doc.pages[i];",
                        "        if (page) {",
                        "            // Process page safely",
                        "            var pageName = page.name;",
                        "        }",
                        "    } catch (e) {",
                        "        // Skip problematic page",
                        "    }",
                        "}"
                    ],
                    notes: "Always wrap in try-catch for individual items"
                },
                {
                    pattern: "Access text content safely",
                    code: [
                        "if (doc.textFrames.length > 0) {",
                        "    var textFrame = doc.textFrames[0];",
                        "    if (textFrame.contents) {",
                        "        var text = textFrame.contents;",
                        "        // Process text",
                        "    }",
                        "}"
                    ],
                    notes: "Check for contents property existence"
                },
                {
                    pattern: "Check for applied master",
                    code: [
                        "var page = doc.pages[0];",
                        "if (page.appliedMaster) {",
                        "    var masterName = page.appliedMaster.name;",
                        "} else {",
                        "    // No master applied",
                        "}"
                    ],
                    notes: "appliedMaster can be null"
                },
                {
                    pattern: "Access image with link info",
                    code: [
                        "if (doc.images.length > 0) {",
                        "    var image = doc.images[0];",
                        "    if (image.itemLink) {",
                        "        var linkStatus = image.itemLink.status.toString();",
                        "        var filePath = image.itemLink.filePath;",
                        "    } else {",
                        "        // Embedded image",
                        "    }",
                        "}"
                    ],
                    notes: "itemLink is null for embedded images"
                }
            ];

            // Style access patterns
            reference.styleAccess = [
                {
                    description: "Find style by name",
                    path: "doc.paragraphStyles.itemByName('Style Name')",
                    safe: false,
                    notes: "Throws error if style doesn't exist"
                },
                {
                    description: "Safe style access",
                    code: [
                        "try {",
                        "    var style = doc.paragraphStyles.itemByName('Style Name');",
                        "    if (style.isValid) {",
                        "        // Use style",
                        "    }",
                        "} catch (e) {",
                        "    // Style doesn't exist",
                        "}"
                    ]
                },
                {
                    description: "Get all style names",
                    path: "doc.paragraphStyles.everyItem().name",
                    safe: true,
                    notes: "Returns array of all style names"
                }
            ];

            // Content access patterns
            reference.contentAccess = [
                {
                    description: "Text frame on specific page",
                    path: "doc.pages[n].textFrames[n]",
                    example: "doc.pages[0].textFrames[0].contents"
                },
                {
                    description: "All text frames in document",
                    path: "doc.textFrames",
                    example: "doc.textFrames[0].overflows"
                },
                {
                    description: "Story threading",
                    path: "doc.stories[n].textFrames",
                    example: "doc.stories[0].textFrames.length"
                },
                {
                    description: "Paragraph in text frame",
                    path: "doc.textFrames[n].paragraphs[n]",
                    example: "doc.textFrames[0].paragraphs[0].appliedParagraphStyle.name"
                }
            ];

            // Layout access patterns
            reference.layoutAccess = [
                {
                    description: "Page margins",
                    path: "doc.pages[n].marginPreferences",
                    example: "doc.pages[0].marginPreferences.top"
                },
                {
                    description: "Document preferences",
                    path: "doc.documentPreferences",
                    example: "doc.documentPreferences.pageWidth"
                },
                {
                    description: "Layer properties",
                    path: "doc.layers[n]",
                    example: "doc.layers[0].visible"
                },
                {
                    description: "Object bounds",
                    path: "pageItem.bounds",
                    example: "doc.pageItems[0].bounds",
                    notes: "May be undefined for some objects"
                }
            ];

            // Troubleshooting paths for common issues
            reference.troubleshootingPaths = [
                {
                    issue: "Missing fonts",
                    checkPath: "doc.fonts[n].status",
                    example: "doc.fonts[0].status.toString()",
                    validValues: ["INSTALLED", "NOT_AVAILABLE", "FAUXED"]
                },
                {
                    issue: "Broken links",
                    checkPath: "doc.links[n].status",
                    example: "doc.links[0].status.toString()",
                    validValues: ["NORMAL", "LINK_MISSING", "LINK_OUT_OF_DATE"]
                },
                {
                    issue: "Text overflow",
                    checkPath: "textFrame.overflows",
                    example: "doc.textFrames[0].overflows",
                    notes: "Boolean indicating if text doesn't fit"
                },
                {
                    issue: "Empty collections",
                    checkPath: "collection.length",
                    example: "doc.images.length === 0",
                    notes: "Always check length before accessing items"
                }
            ];

            return reference;
        }

        // Track broken and inaccessible properties
        function trackBrokenProperties(doc) {
            var brokenTracking = {
                summary: {
                    totalPropertiesChecked: 0,
                    brokenProperties: 0,
                    inaccessibleProperties: 0,
                    nullProperties: 0,
                    undefinedProperties: 0
                },
                brokenByCategory: {
                    documentLevel: [],
                    pageLevel: [],
                    contentLevel: [],
                    styleLevel: [],
                    linkLevel: []
                },
                commonIssues: [],
                propertyReliability: {},
                recommendations: []
            };

            // Test common document properties
            var documentTests = [
                { prop: 'name', expected: 'string' },
                { prop: 'filePath', expected: 'object', nullable: true },
                { prop: 'saved', expected: 'boolean' },
                { prop: 'selection', expected: 'object' },
                { prop: 'activeLayer', expected: 'object', nullable: true },
                { prop: 'zeroPoint', expected: 'object' }
            ];

            for (var i = 0; i < documentTests.length; i++) {
                var test = documentTests[i];
                var result = testPropertyAccess(doc, test.prop, 'doc.' + test.prop, test.expected, test.nullable);
                brokenTracking.summary.totalPropertiesChecked++;

                if (!result.accessible) {
                    brokenTracking.summary.brokenProperties++;
                    brokenTracking.brokenByCategory.documentLevel.push(result);
                } else if (result.value === null) {
                    brokenTracking.summary.nullProperties++;
                } else if (result.value === undefined) {
                    brokenTracking.summary.undefinedProperties++;
                }
            }

            // Test page-level properties
            if (doc.pages && doc.pages.length > 0) {
                var pageTests = [
                    { prop: 'name', expected: 'string' },
                    { prop: 'bounds', expected: 'object' },
                    { prop: 'appliedMaster', expected: 'object', nullable: true },
                    { prop: 'marginPreferences', expected: 'object' },
                    { prop: 'side', expected: 'number' }
                ];

                try {
                    var firstPage = doc.pages[0];
                    for (var i = 0; i < pageTests.length; i++) {
                        var test = pageTests[i];
                        var result = testPropertyAccess(firstPage, test.prop, 'doc.pages[0].' + test.prop, test.expected, test.nullable);
                        brokenTracking.summary.totalPropertiesChecked++;

                        if (!result.accessible) {
                            brokenTracking.summary.brokenProperties++;
                            brokenTracking.brokenByCategory.pageLevel.push(result);
                        }
                    }
                } catch (e) {
                    brokenTracking.brokenByCategory.pageLevel.push({
                        property: "pages[0]",
                        path: "doc.pages[0]",
                        error: "Failed to access first page: " + e.message,
                        accessible: false
                    });
                }
            }

            // Test content-level properties
            testContentProperties(doc, brokenTracking);

            // Test style properties
            testStyleProperties(doc, brokenTracking);

            // Test link properties
            testLinkProperties(doc, brokenTracking);

            // Analyze reliability patterns
            brokenTracking.propertyReliability = analyzePropertyReliability(brokenTracking);

            // Generate recommendations
            brokenTracking.recommendations = generatePropertyRecommendations(brokenTracking);

            return brokenTracking;
        }

        // Test property access and return detailed results
        function testPropertyAccess(obj, propName, propPath, expectedType, nullable) {
            var result = {
                property: propName,
                path: propPath,
                expectedType: expectedType,
                actualType: null,
                value: null,
                accessible: false,
                error: null,
                nullable: nullable || false
            };

            try {
                var value = obj[propName];
                result.value = value;
                result.actualType = typeof value;
                result.accessible = true;

                if (value === null && !nullable) {
                    result.unexpectedNull = true;
                }

                if (expectedType && result.actualType !== expectedType && !(value === null && nullable)) {
                    result.typeMismatch = true;
                }

            } catch (e) {
                result.error = e.message;
                result.accessible = false;
            }

            return result;
        }

        // Test content-level properties
        function testContentProperties(doc, brokenTracking) {
            // Test text frames
            if (doc.textFrames && doc.textFrames.length > 0) {
                try {
                    var textFrame = doc.textFrames[0];
                    var textTests = [
                        { prop: 'contents', expected: 'string', nullable: true },
                        { prop: 'overflows', expected: 'boolean' },
                        { prop: 'parentStory', expected: 'object', nullable: true },
                        { prop: 'bounds', expected: 'object' }
                    ];

                    for (var i = 0; i < textTests.length; i++) {
                        var test = textTests[i];
                        var result = testPropertyAccess(textFrame, test.prop, 'doc.textFrames[0].' + test.prop, test.expected, test.nullable);
                        brokenTracking.summary.totalPropertiesChecked++;

                        if (!result.accessible) {
                            brokenTracking.summary.brokenProperties++;
                            brokenTracking.brokenByCategory.contentLevel.push(result);
                        }
                    }
                } catch (e) {
                    brokenTracking.brokenByCategory.contentLevel.push({
                        property: "textFrames[0]",
                        path: "doc.textFrames[0]",
                        error: "Failed to access first text frame: " + e.message,
                        accessible: false
                    });
                }
            }

            // Test images
            if (doc.images && doc.images.length > 0) {
                try {
                    var image = doc.images[0];
                    var imageTests = [
                        { prop: 'itemLink', expected: 'object', nullable: true },
                        { prop: 'actualPpi', expected: 'object', nullable: true },
                        { prop: 'bounds', expected: 'object' }
                    ];

                    for (var i = 0; i < imageTests.length; i++) {
                        var test = imageTests[i];
                        var result = testPropertyAccess(image, test.prop, 'doc.images[0].' + test.prop, test.expected, test.nullable);
                        brokenTracking.summary.totalPropertiesChecked++;

                        if (!result.accessible) {
                            brokenTracking.summary.brokenProperties++;
                            brokenTracking.brokenByCategory.contentLevel.push(result);
                        }
                    }
                } catch (e) {
                    brokenTracking.brokenByCategory.contentLevel.push({
                        property: "images[0]",
                        path: "doc.images[0]",
                        error: "Failed to access first image: " + e.message,
                        accessible: false
                    });
                }
            }
        }

        // Test style properties
        function testStyleProperties(doc, brokenTracking) {
            var styleCollections = ['paragraphStyles', 'characterStyles', 'objectStyles'];

            for (var s = 0; s < styleCollections.length; s++) {
                var collectionName = styleCollections[s];

                if (doc[collectionName] && doc[collectionName].length > 0) {
                    try {
                        var style = doc[collectionName][0];
                        var styleTests = [
                            { prop: 'name', expected: 'string' },
                            { prop: 'id', expected: 'number' },
                            { prop: 'basedOn', expected: 'object', nullable: true }
                        ];

                        for (var i = 0; i < styleTests.length; i++) {
                            var test = styleTests[i];
                            var result = testPropertyAccess(style, test.prop, 'doc.' + collectionName + '[0].' + test.prop, test.expected, test.nullable);
                            brokenTracking.summary.totalPropertiesChecked++;

                            if (!result.accessible) {
                                brokenTracking.summary.brokenProperties++;
                                brokenTracking.brokenByCategory.styleLevel.push(result);
                            }
                        }
                    } catch (e) {
                        brokenTracking.brokenByCategory.styleLevel.push({
                            property: collectionName + "[0]",
                            path: "doc." + collectionName + "[0]",
                            error: "Failed to access first " + collectionName + ": " + e.message,
                            accessible: false
                        });
                    }
                }
            }
        }

        // Test link properties
        function testLinkProperties(doc, brokenTracking) {
            if (doc.links && doc.links.length > 0) {
                try {
                    var link = doc.links[0];
                    var linkTests = [
                        { prop: 'name', expected: 'string' },
                        { prop: 'filePath', expected: 'string' },
                        { prop: 'status', expected: 'object' },
                        { prop: 'size', expected: 'number' }
                    ];

                    for (var i = 0; i < linkTests.length; i++) {
                        var test = linkTests[i];
                        var result = testPropertyAccess(link, test.prop, 'doc.links[0].' + test.prop, test.expected, test.nullable);
                        brokenTracking.summary.totalPropertiesChecked++;

                        if (!result.accessible) {
                            brokenTracking.summary.brokenProperties++;
                            brokenTracking.brokenByCategory.linkLevel.push(result);
                        }
                    }
                } catch (e) {
                    brokenTracking.brokenByCategory.linkLevel.push({
                        property: "links[0]",
                        path: "doc.links[0]",
                        error: "Failed to access first link: " + e.message,
                        accessible: false
                    });
                }
            }
        }

        // Analyze property reliability patterns
        function analyzePropertyReliability(brokenTracking) {
            var reliability = {
                mostReliable: [],
                leastReliable: [],
                commonFailurePatterns: [],
                typeIssues: []
            };

            // Analyze patterns across all broken properties
            var allBroken = [];
            for (var category in brokenTracking.brokenByCategory) {
                allBroken = allBroken.concat(brokenTracking.brokenByCategory[category]);
            }

            // Find common failure patterns
            var errorPatterns = {};
            for (var i = 0; i < allBroken.length; i++) {
                var broken = allBroken[i];
                if (broken.error) {
                    var pattern = broken.error.split(':')[0]; // Get first part of error
                    errorPatterns[pattern] = (errorPatterns[pattern] || 0) + 1;
                }
            }

            for (var pattern in errorPatterns) {
                if (errorPatterns[pattern] > 1) {
                    reliability.commonFailurePatterns.push({
                        pattern: pattern,
                        count: errorPatterns[pattern],
                        recommendation: getFailurePatternRecommendation(pattern)
                    });
                }
            }

            return reliability;
        }

        // Generate recommendations based on broken property analysis
        function generatePropertyRecommendations(brokenTracking) {
            var recommendations = [];

            if (brokenTracking.summary.brokenProperties > 0) {
                recommendations.push({
                    type: "error_handling",
                    priority: "high",
                    message: "Use comprehensive try-catch blocks for property access",
                    example: "try { var value = obj.property; } catch (e) { /* handle error */ }"
                });
            }

            if (brokenTracking.summary.nullProperties > 5) {
                recommendations.push({
                    type: "null_checking",
                    priority: "medium",
                    message: "Always check for null values before accessing properties",
                    example: "if (obj.property !== null) { /* use property */ }"
                });
            }

            if (brokenTracking.brokenByCategory.linkLevel.length > 0) {
                recommendations.push({
                    type: "link_handling",
                    priority: "medium",
                    message: "Links may be broken or missing - always verify before accessing",
                    example: "if (image.itemLink && image.itemLink.status) { /* safe to use */ }"
                });
            }

            return recommendations;
        }

        // Get recommendation for specific failure pattern
        function getFailurePatternRecommendation(pattern) {
            var recommendations = {
                "Object does not support": "Property may not exist on this object type - check object type first",
                "Access denied": "Property access restricted - may need different approach",
                "Invalid index": "Collection index out of range - check collection length first",
                "Null reference": "Object is null - verify object exists before accessing properties"
            };

            return recommendations[pattern] || "Use safe property access patterns";
        }

        // Extract representative text samples from the document
        function extractTextSamples(doc) {
            var samples = [];

            try {
                // Get samples from first few text frames
                safeIterateCollection(doc.textFrames, function (textFrame, index) {
                    if (index < 3 && textFrame.contents && textFrame.contents.length > 0) {
                        samples.push({
                            source: "textFrame",
                            index: index,
                            path: "doc.textFrames[" + index + "].contents",
                            sample: textFrame.contents.substring(0, 200),
                            fullLength: textFrame.contents.length
                        });
                    }
                    return true;
                }, 3);

                // Get samples from stories if different from text frames
                safeIterateCollection(doc.stories, function (story, index) {
                    if (index < 2 && story.contents && story.contents.length > 0) {
                        samples.push({
                            source: "story",
                            index: index,
                            path: "doc.stories[" + index + "].contents",
                            sample: story.contents.substring(0, 200),
                            fullLength: story.contents.length
                        });
                    }
                    return true;
                }, 2);

            } catch (e) {
                samples.push({ error: "Failed to extract text samples: " + e.message });
            }

            return samples;
        }

        // Analyze text content in tables
        function analyzeTableText(doc) {
            var tableTextAnalysis = [];

            try {
                safeIterateCollection(doc.tables, function (table, tableIndex) {
                    var tableInfo = {
                        index: tableIndex,
                        path: "doc.tables[" + tableIndex + "]",
                        rows: safeGetLength(table.rows),
                        columns: safeGetLength(table.columns),
                        cells: safeGetLength(table.cells),
                        textSamples: []
                    };

                    // Sample text from first few cells
                    safeIterateCollection(table.cells, function (cell, cellIndex) {
                        if (cellIndex < 6) { // First 6 cells for performance
                            try {
                                var cellText = safeGetProperty(cell, 'contents', '');
                                if (cellText.length > 0) {
                                    tableInfo.textSamples.push({
                                        cellIndex: cellIndex,
                                        path: "doc.tables[" + tableIndex + "].cells[" + cellIndex + "].contents",
                                        text: cellText.substring(0, 100),
                                        fullLength: cellText.length
                                    });
                                }
                            } catch (e) {
                                tableInfo.textSamples.push({
                                    cellIndex: cellIndex,
                                    error: "Failed to get cell text: " + e.message
                                });
                            }
                        }
                        return true;
                    }, 6);

                    tableTextAnalysis.push(tableInfo);
                    return true;
                });
            } catch (e) {
                tableTextAnalysis.push({ error: "Failed to analyze table text: " + e.message });
            }

            return tableTextAnalysis;
        }

        // Find text content in grouped objects
        function findTextInGroups(doc) {
            var groupTextAnalysis = [];

            try {
                safeIterateCollection(doc.groups, function (group, groupIndex) {
                    var groupInfo = {
                        index: groupIndex,
                        path: "doc.groups[" + groupIndex + "]",
                        textFrames: [],
                        nestedGroups: 0
                    };

                    // Recursively find text in group
                    function findTextInGroup(groupObj, depth) {
                        if (depth > 5) return; // Prevent deep recursion

                        try {
                            if (groupObj.textFrames) {
                                safeIterateCollection(groupObj.textFrames, function (textFrame, tfIndex) {
                                    var textContent = safeGetProperty(textFrame, 'contents', '');
                                    if (textContent.length > 0) {
                                        groupInfo.textFrames.push({
                                            index: tfIndex,
                                            path: "doc.groups[" + groupIndex + "].textFrames[" + tfIndex + "].contents",
                                            preview: textContent.substring(0, 100),
                                            length: textContent.length,
                                            depth: depth
                                        });
                                    }
                                    return true;
                                });
                            }

                            if (groupObj.groups) {
                                groupInfo.nestedGroups += safeGetLength(groupObj.groups);
                                safeIterateCollection(groupObj.groups, function (nestedGroup, ngIndex) {
                                    findTextInGroup(nestedGroup, depth + 1);
                                    return true;
                                });
                            }
                        } catch (e) {
                            // Skip problematic groups
                        }
                    }

                    findTextInGroup(group, 0);

                    if (groupInfo.textFrames.length > 0 || groupInfo.nestedGroups > 0) {
                        groupTextAnalysis.push(groupInfo);
                    }

                    return true;
                });
            } catch (e) {
                groupTextAnalysis.push({ error: "Failed to analyze group text: " + e.message });
            }

            return groupTextAnalysis;
        }
    }

    function getSpreadsInfo(doc) {
        return safeIterateCollection(doc.spreads, function (spread, index) {
            return {
                index: index,
                id: safeGetProperty(spread, 'id'),
                name: safeGetProperty(spread, 'name'),
                pageCount: safeGetLength(spread.pages),
                pageNames: safeGetProperty(spread.pages, 'everyItem') ?
                    spread.pages.everyItem().name : [],
                allowPageShuffle: safeGetProperty(spread, 'allowPageShuffle'),
                showMasterItems: safeGetProperty(spread, 'showMasterItems'),
                flattenerOverride: safeGetProperty(spread, 'flattenerOverride') ?
                    spread.flattenerOverride.toString() : null,
                pageItems: safeGetLength(spread.pageItems),
                bounds: safeGetProperty(spread, 'bounds')
            };
        });
    }

    function getMasterSpreadsInfo(doc) {
        return safeIterateCollection(doc.masterSpreads, function (master, index) {
            return {
                index: index,
                id: safeGetProperty(master, 'id'),
                name: safeGetProperty(master, 'name'),
                namePrefix: safeGetProperty(master, 'namePrefix'),
                basedOnMaster: safeGetProperty(master.basedOnMaster, 'name'),
                pageCount: safeGetLength(master.pages),
                pageItems: safeGetLength(master.pageItems),
                applied: safeGetProperty(master, 'applied')
            };
        });
    }

    function getLayersInfo(doc) {
        return safeIterateCollection(doc.layers, function (layer, index) {
            return {
                index: index,
                id: safeGetProperty(layer, 'id'),
                name: safeGetProperty(layer, 'name'),
                visible: safeGetProperty(layer, 'visible'),
                locked: safeGetProperty(layer, 'locked'),
                printable: safeGetProperty(layer, 'printable'),
                showGuides: safeGetProperty(layer, 'showGuides'),
                lockGuides: safeGetProperty(layer, 'lockGuides'),
                ignoreWrap: safeGetProperty(layer, 'ignoreWrap'),
                layerColor: safeGetProperty(layer, 'layerColor') ? layer.layerColor.toString() : null,
                pageItems: safeGetLength(layer.pageItems),
                textFrames: safeGetLength(layer.textFrames),
                graphics: safeGetLength(layer.graphics),
                images: safeGetLength(layer.images)
            };
        });
    }

    function getStoriesInfo(doc) {
        return safeIterateCollection(doc.stories, function (story, index) {
            var storyInfo = {
                index: index,
                id: safeGetProperty(story, 'id'),
                length: safeGetProperty(story, 'length'),
                characters: safeGetLength(story.characters),
                words: safeGetLength(story.words),
                lines: safeGetLength(story.lines),
                paragraphs: safeGetLength(story.paragraphs),
                textFrames: safeGetLength(story.textFrames),
                textContainers: safeGetLength(story.textContainers),
                overflows: safeGetProperty(story, 'overflows'),
                firstTextFrame: null,
                label: safeGetProperty(story, 'label', ''),
                contents: null
            };

            // Get first text frame ID safely
            try {
                if (story.textFrames && story.textFrames.length > 0) {
                    storyInfo.firstTextFrame = safeGetProperty(story.textFrames[0], 'id');
                }
            } catch (e) {
                storyInfo.firstTextFrameError = e.message;
            }

            // Get content preview safely
            try {
                if (story.contents) {
                    storyInfo.contents = story.contents.substring(0, 200); // First 200 chars
                }
            } catch (e) {
                storyInfo.contentsError = e.message;
            }

            return storyInfo;
        });
    }

    function getPageItemsInfo(doc) {
        var itemTypes = [
            'pageItems', 'textFrames', 'rectangles', 'ovals', 'polygons', 'groups',
            'graphics', 'images', 'epss', 'pdfs', 'wmfs', 'picts', 'buttons',
            'checkBoxes', 'comboBoxes', 'listBoxes', 'radioButtons', 'textBoxes',
            'multiStateObjects', 'sounds', 'movies'
        ];

        var itemCounts = {};

        for (var i = 0; i < itemTypes.length; i++) {
            var itemType = itemTypes[i];
            try {
                itemCounts[itemType] = safeGetLength(doc[itemType]);
            } catch (e) {
                itemCounts[itemType] = { error: e.message };
            }
        }

        return itemCounts;
    }

    function getStylesInfo(doc) {
        var styles = {
            paragraphStyles: [],
            characterStyles: [],
            objectStyles: [],
            cellStyles: [],
            tableStyles: []
        };

        // Safely get each style type
        var styleTypes = [
            { prop: 'paragraphStyles', key: 'paragraphStyles' },
            { prop: 'characterStyles', key: 'characterStyles' },
            { prop: 'objectStyles', key: 'objectStyles' },
            { prop: 'cellStyles', key: 'cellStyles' },
            { prop: 'tableStyles', key: 'tableStyles' }
        ];

        for (var i = 0; i < styleTypes.length; i++) {
            var styleType = styleTypes[i];
            try {
                styles[styleType.key] = safeIterateCollection(doc[styleType.prop], function (style, index) {
                    return {
                        index: index,
                        id: safeGetProperty(style, 'id'),
                        name: safeGetProperty(style, 'name'),
                        basedOn: safeGetProperty(style.basedOn, 'name'),
                        nextStyle: safeGetProperty(style.nextStyle, 'name'),
                        applied: safeGetProperty(style, 'applied')
                    };
                });
            } catch (e) {
                styles[styleType.key] = [{ error: "Failed to get " + styleType.key + ": " + e.message }];
            }
        }

        return styles;
    }

    function getColorsInfo(doc) {
        var colors = {
            swatches: [],
            colors: [],
            tints: [],
            gradients: [],
            mixedInks: []
        };

        // Safely get swatches
        try {
            colors.swatches = safeIterateCollection(doc.swatches, function (swatch, index) {
                return {
                    index: index,
                    id: safeGetProperty(swatch, 'id'),
                    name: safeGetProperty(swatch, 'name'),
                    colorType: swatch.constructor ? swatch.constructor.name : 'Unknown',
                    colorSpace: safeGetProperty(swatch, 'space') ? swatch.space.toString() : null,
                    colorModel: safeGetProperty(swatch, 'model') ? swatch.model.toString() : null,
                    colorValue: safeGetProperty(swatch, 'colorValue')
                };
            });
        } catch (e) {
            colors.swatches = [{ error: "Failed to get swatches: " + e.message }];
        }

        // Safely get colors
        try {
            colors.colors = safeIterateCollection(doc.colors, function (color, index) {
                return {
                    index: index,
                    id: safeGetProperty(color, 'id'),
                    name: safeGetProperty(color, 'name'),
                    space: safeGetProperty(color, 'space') ? color.space.toString() : null,
                    model: safeGetProperty(color, 'model') ? color.model.toString() : null,
                    colorValue: safeGetProperty(color, 'colorValue')
                };
            });
        } catch (e) {
            colors.colors = [{ error: "Failed to get colors: " + e.message }];
        }

        return colors;
    }

    function getFontsInfo(doc) {
        return safeIterateCollection(doc.fonts, function (font, index) {
            return {
                index: index,
                id: safeGetProperty(font, 'id'),
                name: safeGetProperty(font, 'name'),
                fontFamily: safeGetProperty(font, 'fontFamily'),
                fontStyleName: safeGetProperty(font, 'fontStyleName'),
                postscriptName: safeGetProperty(font, 'postscriptName'),
                status: safeGetProperty(font, 'status') ? font.status.toString() : null,
                fontType: safeGetProperty(font, 'fontType') ? font.fontType.toString() : null,
                allowEmbedding: safeGetProperty(font, 'allowEmbedding'),
                allowOutlines: safeGetProperty(font, 'allowOutlines'),
                allowPDFEmbedding: safeGetProperty(font, 'allowPDFEmbedding'),
                allowPrinting: safeGetProperty(font, 'allowPrinting'),
                restrictedPrinting: safeGetProperty(font, 'restrictedPrinting'),
                location: safeGetProperty(font, 'location'),
                platformName: safeGetProperty(font, 'platformName'),
                version: safeGetProperty(font, 'version')
            };
        });
    }

    function getLinksInfo(doc) {
        return safeIterateCollection(doc.links, function (link, index) {
            return {
                index: index,
                id: safeGetProperty(link, 'id'),
                name: safeGetProperty(link, 'name'),
                filePath: safeGetProperty(link, 'filePath'),
                status: safeGetProperty(link, 'status') ? link.status.toString() : null,
                linkType: safeGetProperty(link, 'linkType') ? link.linkType.toString() : null,
                size: safeGetProperty(link, 'size'),
                date: safeGetProperty(link, 'date') ? link.date.toISOString() : null,
                needed: safeGetProperty(link, 'needed'),
                canEmbed: safeGetProperty(link, 'canEmbed'),
                canUnembed: safeGetProperty(link, 'canUnembed'),
                canPackage: safeGetProperty(link, 'canPackage'),
                linkXmp: safeGetProperty(link, 'linkXmp') ? link.linkXmp.toString() : null,
                parent: safeGetProperty(link.parent, 'constructor') ? link.parent.constructor.name : null
            };
        });
    }

    function getPreferencesInfo(doc) {
        var prefs = {};

        // View preferences
        try {
            prefs.viewPreferences = {
                horizontalMeasurementUnits: safeGetProperty(doc.viewPreferences, 'horizontalMeasurementUnits') ?
                    doc.viewPreferences.horizontalMeasurementUnits.toString() : null,
                verticalMeasurementUnits: safeGetProperty(doc.viewPreferences, 'verticalMeasurementUnits') ?
                    doc.viewPreferences.verticalMeasurementUnits.toString() : null,
                rulerOrigin: safeGetProperty(doc.viewPreferences, 'rulerOrigin') ?
                    doc.viewPreferences.rulerOrigin.toString() : null,
                showRulers: safeGetProperty(doc.viewPreferences, 'showRulers'),
                showFrameEdges: safeGetProperty(doc.viewPreferences, 'showFrameEdges'),
                showNotes: safeGetProperty(doc.viewPreferences, 'showNotes')
            };
        } catch (e) {
            prefs.viewPreferences = { error: e.message };
        }

        // Text preferences  
        try {
            prefs.textPreferences = {
                typographersQuotes: safeGetProperty(doc.textPreferences, 'typographersQuotes'),
                useOpticalSize: safeGetProperty(doc.textPreferences, 'useOpticalSize'),
                useParagraphLeading: safeGetProperty(doc.textPreferences, 'useParagraphLeading'),
                abutTextToTextWrap: safeGetProperty(doc.textPreferences, 'abutTextToTextWrap')
            };
        } catch (e) {
            prefs.textPreferences = { error: e.message };
        }

        // Pasteboard preferences
        try {
            prefs.pasteboardPreferences = {
                pasteboardColor: safeGetProperty(doc.pasteboardPreferences, 'pasteboardColor') ?
                    doc.pasteboardPreferences.pasteboardColor.toString() : null,
                minimumSpaceAboveAndBelow: safeGetProperty(doc.pasteboardPreferences, 'minimumSpaceAboveAndBelow')
            };
        } catch (e) {
            prefs.pasteboardPreferences = { error: e.message };
        }

        return prefs;
    }

    function getMetadataInfo(doc) {
        var metadata = {};

        try {
            if (doc.metadataPreferences) {
                metadata = {
                    author: safeGetProperty(doc.metadataPreferences, 'author', ''),
                    description: safeGetProperty(doc.metadataPreferences, 'description', ''),
                    keywords: safeGetProperty(doc.metadataPreferences, 'keywords', ''),
                    copyrightNotice: safeGetProperty(doc.metadataPreferences, 'copyrightNotice', ''),
                    copyrightInfoURL: safeGetProperty(doc.metadataPreferences, 'copyrightInfoURL', ''),
                    jobName: safeGetProperty(doc.metadataPreferences, 'jobName', ''),
                    documentTitle: safeGetProperty(doc.metadataPreferences, 'documentTitle', ''),
                    subject: safeGetProperty(doc.metadataPreferences, 'subject', ''),
                    creator: safeGetProperty(doc.metadataPreferences, 'creator', '')
                };
            }
        } catch (e) {
            metadata.error = "Failed to get metadata: " + e.message;
        }

        return metadata;
    }

    // Enhanced compareSection with bulletproof access path handling
    function compareSection(section1, section2, sectionName) {
        var changes = [];

        try {
            if (typeof section1 !== typeof section2) {
                changes.push(createSafeChangeObject({
                    type: "type_change",
                    path: sectionName,
                    oldValue: typeof section1,
                    newValue: typeof section2
                }, sectionName));
                return changes;
            }

            if (section1 === null || section2 === null) {
                if (section1 !== section2) {
                    changes.push(createSafeChangeObject({
                        type: "value_change",
                        path: sectionName,
                        oldValue: section1,
                        newValue: section2
                    }, sectionName));
                }
                return changes;
            }

            if (typeof section1 === 'object' && section1.constructor === Array) {
                // Array comparison
                if (section1.length !== section2.length) {
                    changes.push(createSafeChangeObject({
                        type: "length_change",
                        path: sectionName,
                        oldLength: section1.length,
                        newLength: section2.length
                    }, sectionName));
                }

                var maxLength = Math.max(section1.length, section2.length);
                for (var i = 0; i < maxLength; i++) {
                    if (i >= section1.length) {
                        changes.push(createSafeChangeObject({
                            type: "addition",
                            path: sectionName + "[" + i + "]",
                            newValue: section2[i]
                        }, sectionName + "[" + i + "]"));
                    } else if (i >= section2.length) {
                        changes.push(createSafeChangeObject({
                            type: "deletion",
                            path: sectionName + "[" + i + "]",
                            oldValue: section1[i]
                        }, sectionName + "[" + i + "]"));
                    } else {
                        var subChanges = compareSection(section1[i], section2[i], sectionName + "[" + i + "]");
                        changes = changes.concat(subChanges);
                    }
                }
            } else if (typeof section1 === 'object') {
                // Object comparison
                var allKeys = {};
                for (var key in section1) allKeys[key] = true;
                for (var key in section2) allKeys[key] = true;

                for (var key in allKeys) {
                    if (!(key in section1)) {
                        changes.push(createSafeChangeObject({
                            type: "addition",
                            path: sectionName + "." + key,
                            newValue: section2[key]
                        }, sectionName + "." + key));
                    } else if (!(key in section2)) {
                        changes.push(createSafeChangeObject({
                            type: "deletion",
                            path: sectionName + "." + key,
                            oldValue: section1[key]
                        }, sectionName + "." + key));
                    } else {
                        var subChanges = compareSection(section1[key], section2[key], sectionName + "." + key);
                        changes = changes.concat(subChanges);
                    }
                }
            } else {
                // Primitive value comparison
                if (section1 !== section2) {
                    changes.push(createSafeChangeObject({
                        type: "value_change",
                        path: sectionName,
                        oldValue: section1,
                        newValue: section2
                    }, sectionName));
                }
            }
        } catch (e) {
            logError("compareSection failed for " + sectionName + ": " + e.message);
            changes.push(createSafeChangeObject({
                type: "comparison_error",
                path: sectionName,
                error: e.message
            }, sectionName));
        }

        return changes;
    }

    // Create a safe change object with bulletproof access path generation
    function createSafeChangeObject(changeData, analysisPath) {
        var safeChange = {
            type: safeGetProperty(changeData, 'type', 'unknown_change'),
            path: safeGetProperty(changeData, 'path', 'unknown_path'),
            accessPath: null,
            safetyNotes: []
        };

        // Copy other properties safely
        var knownProps = ['oldValue', 'newValue', 'oldLength', 'newLength', 'error'];
        for (var i = 0; i < knownProps.length; i++) {
            var prop = knownProps[i];
            if (changeData.hasOwnProperty(prop)) {
                safeChange[prop] = changeData[prop];
            }
        }

        // Generate access path and safety notes with error handling
        try {
            safeChange.accessPath = generateAccessPath(analysisPath);
            safeChange.safetyNotes = getSafetyNotes(analysisPath);
        } catch (e) {
            logError("Failed to generate access info for " + analysisPath + ": " + e.message);

            // Provide fallback access path
            safeChange.accessPath = {
                primary: "// Error: Could not generate access path",
                alternatives: ["// Manual access required"],
                collectionMethod: "// Check manually",
                safetyLevel: "error",
                errorMessage: e.message
            };

            safeChange.safetyNotes = [
                "Error generating safety notes: " + e.message,
                "Use manual try-catch pattern",
                "Test access carefully with your documents"
            ];
        }

        return safeChange;
    }

    // Generate object model access path from analysis path - Enhanced with bulletproof error handling
    function generateAccessPath(analysisPath) {
        var accessInfo = {
            primary: "",
            alternatives: [],
            collectionMethod: "",
            safetyLevel: "medium",
            errorMessage: null
        };

        try {
            if (!analysisPath || typeof analysisPath !== 'string') {
                accessInfo.primary = "// Invalid path provided";
                accessInfo.errorMessage = "Path is null, undefined, or not a string";
                accessInfo.safetyLevel = "error";
                return accessInfo;
            }

            // Basic sanitization
            var cleanPath = analysisPath.replace(/^\/+|\/+$/g, ''); // Remove leading/trailing slashes

            // Default safe pattern
            var docPath = "doc." + cleanPath;
            accessInfo.primary = docPath;
            accessInfo.collectionMethod = "Direct property access";

            try {
                // Handle specific patterns with safer regex
                if (cleanPath.indexOf('pages[') !== -1) {
                    var pageMatch = safeRegexMatch(cleanPath, /pages\[(\d+)\](.*)/);
                    if (pageMatch && pageMatch.length >= 2) {
                        var pageIndex = pageMatch[1];
                        var remainder = pageMatch[2] || "";
                        accessInfo.primary = "doc.pages[" + pageIndex + "]" + remainder;
                        accessInfo.alternatives = [
                            "doc.pages.item(" + pageIndex + ")" + remainder,
                            "doc.pages.itemByRange(" + pageIndex + ", " + pageIndex + ")[0]" + remainder
                        ];
                        accessInfo.collectionMethod = "Length: doc.pages.length";
                        accessInfo.safetyLevel = "high";
                    }
                } else if (cleanPath.indexOf('stories[') !== -1) {
                    var storyMatch = safeRegexMatch(cleanPath, /stories\[(\d+)\](.*)/);
                    if (storyMatch && storyMatch.length >= 2) {
                        var storyIndex = storyMatch[1];
                        var remainder = storyMatch[2] || "";
                        accessInfo.primary = "doc.stories[" + storyIndex + "]" + remainder;
                        accessInfo.alternatives = [
                            "doc.stories.item(" + storyIndex + ")" + remainder,
                            "// Access by ID if known: doc.stories.itemByID('story_id')" + remainder
                        ];
                        accessInfo.collectionMethod = "Length: doc.stories.length";
                        accessInfo.safetyLevel = "high";
                    }
                } else if (cleanPath.indexOf('layers[') !== -1) {
                    var layerMatch = safeRegexMatch(cleanPath, /layers\[(\d+)\](.*)/);
                    if (layerMatch && layerMatch.length >= 2) {
                        var layerIndex = layerMatch[1];
                        var remainder = layerMatch[2] || "";
                        accessInfo.primary = "doc.layers[" + layerIndex + "]" + remainder;
                        accessInfo.alternatives = [
                            "doc.layers.item(" + layerIndex + ")" + remainder,
                            "// Access by name: doc.layers.itemByName('layer_name')" + remainder
                        ];
                        accessInfo.collectionMethod = "Length: doc.layers.length";
                        accessInfo.safetyLevel = "high";
                    }
                } else if (cleanPath.indexOf('images') !== -1) {
                    // Handle various image access patterns
                    var imageMatch = safeRegexMatch(cleanPath, /images\[(\d+)\](.*)/);
                    if (imageMatch && imageMatch.length >= 2) {
                        var imageIndex = imageMatch[1];
                        var remainder = imageMatch[2] || "";
                        accessInfo.primary = "doc.images[" + imageIndex + "]" + remainder;
                        accessInfo.alternatives = [
                            "// Direct access: doc.images[" + imageIndex + "]" + remainder,
                            "// Via page: doc.pages[p].images[i]" + remainder,
                            "// Via graphic: doc.graphics[g].images[0]" + remainder,
                            "// Via page item: doc.pageItems[n].images[0]" + remainder
                        ];
                        accessInfo.collectionMethod = "Length: doc.images.length (may not include all nested images)";
                        accessInfo.safetyLevel = "medium";
                    } else if (cleanPath.indexOf('images') !== -1) {
                        // General images reference
                        accessInfo.primary = docPath;
                        accessInfo.alternatives = [
                            "// Multiple detection needed for complete image analysis",
                            "// Check: doc.images, doc.graphics[n].images, doc.pages[n].images"
                        ];
                        accessInfo.safetyLevel = "medium";
                    }
                } else if (cleanPath.indexOf('textFrames[') !== -1) {
                    var frameMatch = safeRegexMatch(cleanPath, /textFrames\[(\d+)\](.*)/);
                    if (frameMatch && frameMatch.length >= 2) {
                        var frameIndex = frameMatch[1];
                        var remainder = frameMatch[2] || "";
                        accessInfo.primary = "doc.textFrames[" + frameIndex + "]" + remainder;
                        accessInfo.alternatives = [
                            "doc.textFrames.item(" + frameIndex + ")" + remainder,
                            "// Via page: doc.pages[p].textFrames[n]" + remainder
                        ];
                        accessInfo.collectionMethod = "Length: doc.textFrames.length";
                        accessInfo.safetyLevel = "high";
                    }
                } else if (cleanPath.indexOf('styles.') !== -1) {
                    // Handle style access patterns
                    if (cleanPath.indexOf('paragraphStyles[') !== -1) {
                        var styleMatch = safeRegexMatch(cleanPath, /paragraphStyles\[(\d+)\](.*)/);
                        if (styleMatch && styleMatch.length >= 2) {
                            var styleIndex = styleMatch[1];
                            var remainder = styleMatch[2] || "";
                            accessInfo.primary = "doc.paragraphStyles[" + styleIndex + "]" + remainder;
                            accessInfo.alternatives = [
                                "doc.paragraphStyles.itemByName('style_name')" + remainder,
                                "doc.paragraphStyles.item(" + styleIndex + ")" + remainder
                            ];
                            accessInfo.collectionMethod = "Length: doc.paragraphStyles.length";
                            accessInfo.safetyLevel = "high";
                        }
                    } else if (cleanPath.indexOf('characterStyles[') !== -1) {
                        var styleMatch = safeRegexMatch(cleanPath, /characterStyles\[(\d+)\](.*)/);
                        if (styleMatch && styleMatch.length >= 2) {
                            var styleIndex = styleMatch[1];
                            var remainder = styleMatch[2] || "";
                            accessInfo.primary = "doc.characterStyles[" + styleIndex + "]" + remainder;
                            accessInfo.alternatives = [
                                "doc.characterStyles.itemByName('style_name')" + remainder,
                                "doc.characterStyles.item(" + styleIndex + ")" + remainder
                            ];
                            accessInfo.collectionMethod = "Length: doc.characterStyles.length";
                            accessInfo.safetyLevel = "high";
                        }
                    }
                } else if (cleanPath.indexOf('documentPreferences') !== -1) {
                    // Document preferences are generally safe
                    accessInfo.primary = docPath;
                    accessInfo.alternatives = [];
                    accessInfo.collectionMethod = "Direct property access";
                    accessInfo.safetyLevel = "high";
                } else if (cleanPath.indexOf('links[') !== -1) {
                    var linkMatch = safeRegexMatch(cleanPath, /links\[(\d+)\](.*)/);
                    if (linkMatch && linkMatch.length >= 2) {
                        var linkIndex = linkMatch[1];
                        var remainder = linkMatch[2] || "";
                        accessInfo.primary = "doc.links[" + linkIndex + "]" + remainder;
                        accessInfo.alternatives = [
                            "doc.links.item(" + linkIndex + ")" + remainder,
                            "// Access by name: doc.links.itemByName('filename')" + remainder
                        ];
                        accessInfo.collectionMethod = "Length: doc.links.length";
                        accessInfo.safetyLevel = "medium";
                    }
                }

            } catch (regexError) {
                logError("Regex processing failed in generateAccessPath: " + regexError.message);
                // Fall back to basic safe pattern
                accessInfo.primary = docPath;
                accessInfo.errorMessage = "Advanced path parsing failed, using basic access";
                accessInfo.safetyLevel = "low";
            }

        } catch (e) {
            logError("generateAccessPath failed completely: " + e.message);
            accessInfo.primary = "// Error generating access path: " + e.message;
            accessInfo.errorMessage = "Path generation failed: " + e.message;
            accessInfo.safetyLevel = "error";
        }

        return accessInfo;
    }

    // Safe regex matching with error handling
    function safeRegexMatch(str, regex) {
        try {
            if (!str || typeof str !== 'string') {
                return null;
            }
            return str.match(regex);
        } catch (e) {
            logError("Regex match failed: " + e.message);
            return null;
        }
    }

    // Generate safety notes for property access - Enhanced with error handling
    function getSafetyNotes(analysisPath) {
        var notes = [];

        try {
            if (!analysisPath || typeof analysisPath !== 'string') {
                notes.push("Invalid path - cannot generate safety notes");
                return notes;
            }

            var pathLower = analysisPath.toLowerCase();

            // Array access safety
            if (pathLower.indexOf('[') !== -1) {
                notes.push("Array access - always check collection length first");
                notes.push("Use try-catch block for safe access");
                notes.push("Example: if (collection.length > index) { var item = collection[index]; }");
            }

            // Property-specific safety notes
            var safetyRules = [
                { pattern: 'bounds', notes: ['Bounds may be undefined for some objects', 'Check object validity before accessing bounds', 'Use: if (obj.bounds) { var bounds = obj.bounds; }'] },
                { pattern: 'parent', notes: ['Parent object may be null - always check', 'Use: if (obj.parent) { var parent = obj.parent; }', 'Parent relationships can be complex in nested objects'] },
                { pattern: 'appliedmaster', notes: ['Master may be null for some pages', 'Check: if (page.appliedMaster) { var master = page.appliedMaster; }', 'Not all pages have applied masters'] },
                { pattern: 'itemlink', notes: ['Link may be null for embedded items', 'Always verify link exists before accessing properties', 'Use: if (image.itemLink) { var link = image.itemLink; }'] },
                { pattern: 'length', notes: ['Collection size - safe to access', 'Always available as number', 'Returns 0 for empty collections'] },
                { pattern: 'count', notes: ['Collection count - safe to access', 'Always available as number', 'May differ from .length in some contexts'] },
                { pattern: 'images', notes: ['Images may be nested in graphics or page items', 'Consider multiple access methods for complete detection', 'Use: doc.images, doc.graphics[n].images, doc.pageItems[n].images'] },
                { pattern: 'contents', notes: ['Text contents may be very large - consider substring()', 'May contain special characters and formatting', 'Use: if (story.contents) { var preview = story.contents.substring(0, 100); }'] },
                { pattern: 'preferences', notes: ['Preferences usually stable - safe to access', 'May return enum values - use .toString() for comparison', 'Example: var unit = doc.viewPreferences.horizontalMeasurementUnits.toString();'] },
                { pattern: 'overflows', notes: ['Text overflow property - boolean value', 'Safe to access on text frames', 'Indicates if text doesn\'t fit in frame'] },
                { pattern: 'visible', notes: ['Visibility property - boolean value', 'Safe to access on most objects', 'May affect other properties when false'] },
                { pattern: 'locked', notes: ['Lock status - boolean value', 'Safe to access', 'May prevent modifications when true'] },
                { pattern: 'name', notes: ['Name property - usually safe string', 'May be empty or auto-generated', 'Check for null: if (obj.name) { var name = obj.name; }'] },
                { pattern: 'id', notes: ['ID property - usually safe', 'Unique identifier within document', 'May be numeric or string depending on object type'] },
                { pattern: 'style', notes: ['Style references may be null', 'Check existence before accessing properties', 'Use: if (obj.appliedParagraphStyle) { var style = obj.appliedParagraphStyle; }'] },
                { pattern: 'color', notes: ['Color properties may return enum values', 'Use .toString() for string representation', 'Some colors may be "None" or special values'] },
                { pattern: 'font', notes: ['Font properties may be missing or unavailable', 'Font status can be "Installed", "NotAvailable", etc.', 'Check font.status before using'] },
                { pattern: 'transformation', notes: ['Transformation properties may be complex', 'Include rotation, scale, skew, position', 'Values may be in different units'] },
                { pattern: 'geometry', notes: ['Geometric properties depend on object state', 'May change with transformations', 'Check object validity before accessing'] }
            ];

            // Apply safety rules based on path content
            for (var i = 0; i < safetyRules.length; i++) {
                var rule = safetyRules[i];
                if (pathLower.indexOf(rule.pattern) !== -1) {
                    for (var j = 0; j < rule.notes.length; j++) {
                        if (notes.indexOf(rule.notes[j]) === -1) { // Avoid duplicates
                            notes.push(rule.notes[j]);
                        }
                    }
                    break; // Only apply first matching rule to avoid overwhelming notes
                }
            }

            // General safety patterns
            if (notes.length === 0) {
                notes.push("Standard property access - use try-catch for safety");
                notes.push("Check for null/undefined before using value");
            }

            // Add universal safety note
            notes.push("Always test with your specific document types");

        } catch (e) {
            logError("getSafetyNotes failed: " + e.message);
            notes = [
                "Error generating safety notes: " + e.message,
                "Use basic try-catch pattern for safety",
                "Test property access with your specific documents"
            ];
        }

        return notes;
    }

    // Keep existing comparison functions but add error handling
    function compareDocumentReports(report1, report2) {
        var differences = {
            timestamp: new Date().toISOString(),
            summary: {
                hasChanges: false,
                changedSections: []
            },
            changes: {},
            errors: []
        };

        try {
            var sections = ['documentInfo', 'documentPreferences', 'pages', 'spreads', 'masterSpreads',
                'layers', 'stories', 'pageItems', 'images', 'graphics', 'textFrames',
                'styles', 'colors', 'fonts', 'links', 'preferences', 'metadata', 'objectHierarchy'];

            for (var i = 0; i < sections.length; i++) {
                var section = sections[i];
                try {
                    var changes = compareSection(report1[section], report2[section], section);
                    if (changes.length > 0) {
                        differences.summary.hasChanges = true;
                        differences.summary.changedSections.push(section);
                        differences.changes[section] = changes;
                    }
                } catch (e) {
                    differences.errors.push("Failed to compare section " + section + ": " + e.message);
                }
            }
        } catch (e) {
            differences.errors.push("Overall comparison failed: " + e.message);
        }

        return differences;
    }

    // Keep existing compareReports function...
    function compareReports() {
        try {
            var file1 = File.openDialog("Select first report file (JSON):");
            if (!file1) return;

            var file2 = File.openDialog("Select second report file (JSON):");
            if (!file2) return;

            // Read files
            file1.open("r");
            var report1 = JSON.parse(file1.read());
            file1.close();

            file2.open("r");
            var report2 = JSON.parse(file2.read());
            file2.close();

            // Compare reports
            var differences = compareDocumentReports(report1, report2);

            // Save comparison result
            var comparisonFile = File(file1.path + "/comparison_" + new Date().getTime() + ".json");
            comparisonFile.open("w");
            comparisonFile.write(JSON.stringify(differences, null, 2));
            comparisonFile.close();

            // Show summary
            var summary = "Comparison complete!\n\n";
            summary += "Changes detected: " + (differences.summary.hasChanges ? "Yes" : "No") + "\n";
            if (differences.summary.hasChanges) {
                summary += "Changed sections: " + differences.summary.changedSections.join(", ") + "\n";
                summary += "Total changes: " + Object.keys(differences.changes).length + "\n";
            }
            if (differences.errors.length > 0) {
                summary += "Errors encountered: " + differences.errors.length + "\n";
            }
            summary += "\nDetailed comparison saved as: " + comparisonFile.name;

            alert(summary);
            return differences;

        } catch (error) {
            alert("Error comparing reports: " + error.message + "\nLine: " + error.line);
            return null;
        }
    }

    // Run the analysis
    try {
        // Uncomment the line below to analyze the current document
        // analyzeDocument();

        // Uncomment the line below to compare two existing reports
        // compareReports();

        // Display instructions
        alert("Enhanced InDesign Document Analyzer Script loaded!\n\n" +
            "Features:\n" +
            "• Comprehensive image detection (multiple methods)\n" +
            "• Robust error handling to prevent crashes\n" +
            "• Deep object hierarchy analysis\n" +
            "• Safe property access throughout\n" +
            "• Enhanced graphics and text frame analysis\n" +
            "• Object model access paths with safety guidance\n\n" +
            "To use:\n" +
            "1. Uncomment 'analyzeDocument()' and run to analyze current document\n" +
            "2. Uncomment 'compareReports()' and run to compare two analysis files\n\n" +
            "The script will save comprehensive JSON reports for comparison.");

    } catch (error) {
        alert("Script loading error: " + error.message + "\nLine: " + error.line);
    }
}